// Command-line tool for importing questions from .qbank.md files
package main

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"gopkg.in/yaml.v3"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type OptionImport struct {
	Text     string
	Correct  bool
	Position int
}

type QuestionImport struct {
	Slug            string  `yaml:"slug"`
	Type            string  `yaml:"type"`
	Difficulty      string  `yaml:"difficulty"`
	TopicName       string  `yaml:"topic"`
	SubTopicName    *string `yaml:"subtopic"`
	Province        *string `yaml:"province"`
	Active          *bool   `yaml:"active"`
	ReferenceSource string  `yaml:"reference_source"`

	Content     string         `yaml:"-"`
	Explanation string         `yaml:"-"`
	Options     []OptionImport `yaml:"-"`
	ContentHash []byte         `yaml:"-"`
}

var (
	reFrontMatter = regexp.MustCompile(`(?s)^---\s*(.+?)\s*---\s*`)
	reOpt         = regexp.MustCompile(`(?m)^\s*-\s*\[(?P<mark>x|\s)\]\s*(?P<text>.+?)\s*$`)
	reExpl        = regexp.MustCompile(`(?m)^\s*\*\*Explanation:\*\*\s*(?P<text>.+?)\s*$`)
	reTFAns       = regexp.MustCompile(`(?m)^\s*\*\*Answer:\*\*\s*(?P<ans>true|false)\s*$`)
)

// flags
var (
	dryRun              bool
	createMissingTopics bool
)

func init() {
	// Parse flags and build cleaned args
	cleanArgs := []string{os.Args[0]}
	for _, a := range os.Args[1:] {
		switch a {
		case "--dry-run":
			dryRun = true
		case "--create-missing-topics":
			createMissingTopics = true
		default:
			cleanArgs = append(cleanArgs, a)
		}
	}
	os.Args = cleanArgs
}

// ---- adjust for your models / package paths
type Question struct {
	ID              string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Content         string
	QuestionType    string `gorm:"column:question_type"`
	Difficulty      string
	TopicID         string
	SubTopicID      *string
	Province        *string
	Explanation     string
	ReferenceSource string
	IsActive        bool   `gorm:"column:is_active"`
	ContentHash     []byte `gorm:"column:content_hash"`
}
type QuestionOption struct {
	ID         string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	QuestionID string
	OptionText string `gorm:"column:option_text"`
	IsCorrect  bool   `gorm:"column:is_correct"`
	Position   int    `gorm:"column:position"`
}
type Topic struct {
	ID   string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Name string
	Code string
}
type SubTopic struct {
	ID      string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	TopicID string
	Name    string
	Code    string
}

// ---------------- main ----------------
func main() {
	if len(os.Args) < 2 {
		fmt.Println("usage: import_qbank <file-or-dir>")
		os.Exit(2)
	}
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		fmt.Println("set DATABASE_URL")
		os.Exit(2)
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(err)
	}
	db = db.Debug() // Enable verbose SQL logging

	paths := collect(os.Args[1])
	fmt.Printf("[INFO] Found %d files to import\n", len(paths))
	ctx := context.Background()

	totalQuestions := 0
	successCount := 0

	for _, p := range paths {
		fmt.Printf("[INFO] Processing: %s\n", p)
		questions, err := parseFile(p)
		if err != nil {
			fmt.Printf("✗ %s: parse error: %v\n", p, err)
			continue
		}

		fmt.Printf("[INFO] Found %d questions in file\n", len(questions))
		totalQuestions += len(questions)

		for i, q := range questions {
			fmt.Printf("[DEBUG] Question %d/%d - slug=%s, type=%s, topic=%s, options=%d\n",
				i+1, len(questions), q.Slug, q.Type, q.TopicName, len(q.Options))

			if err := validate(q); err != nil {
				fmt.Printf("✗ Question %d: invalid: %v\n", i+1, err)
				continue
			}

			if err := importOne(ctx, db, q); err != nil {
				fmt.Printf("✗ Question %d: import error: %v\n", i+1, err)
			} else {
				fmt.Printf("✓ Question %d: imported (%s)\n", i+1, q.Slug)
				successCount++
			}
		}
	}

	fmt.Printf("\n[SUMMARY] Processed %d questions total, %d imported successfully\n",
		totalQuestions, successCount)
}

func collect(root string) (out []string) {
	fi, err := os.Stat(root)
	fmt.Printf("[DEBUG collect] root=%s, err=%v, fi=%v\n", root, err, fi)
	if fi != nil && !fi.IsDir() {
		fmt.Printf("[DEBUG collect] root is a file, returning it\n")
		return []string{root}
	}
	fmt.Printf("[DEBUG collect] root is a directory, walking it\n")
	filepath.WalkDir(root, func(p string, d os.DirEntry, err error) error {
		if err != nil {
			fmt.Printf("[DEBUG collect] WalkDir error: %v\n", err)
			return err
		}
		fmt.Printf("[DEBUG collect] Found entry: %s (isDir=%v, isSuffix=%v)\n", p, d.IsDir(), strings.HasSuffix(p, ".qbank.md"))
		if d != nil && !d.IsDir() && strings.HasSuffix(p, ".qbank.md") {
			fmt.Printf("[DEBUG collect] Adding file: %s\n", p)
			out = append(out, p)
		}
		return nil
	})
	fmt.Printf("[DEBUG collect] Total files collected: %d\n", len(out))
	return
}

// Split file content by --- delimiters and parse each question
func parseFile(path string) ([]*QuestionImport, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	content := string(b)

	// Split on --- delimiter (but not the ones in YAML front-matter)
	chunks := splitQuestions(content)

	fmt.Printf("[DEBUG parseFile] Split into %d chunks\n", len(chunks))

	var questions []*QuestionImport
	for i, chunk := range chunks {
		chunk = strings.TrimSpace(chunk)
		if chunk == "" {
			continue
		}

		fmt.Printf("[DEBUG parseFile] Processing chunk %d (length: %d)\n", i+1, len(chunk))
		q, err := parseQuestion(chunk)
		if err != nil {
			return nil, fmt.Errorf("chunk %d: %w", i+1, err)
		}
		questions = append(questions, q)
	}

	return questions, nil
}

// Split the file content into individual question chunks
// Pattern: --- YAML --- Content --- YAML --- Content ...
func splitQuestions(content string) []string {
	var chunks []string
	var currentChunk strings.Builder
	delimiterCount := 0
	
	lines := strings.Split(content, "\n")
	
	for i, line := range lines {
		trimmed := strings.TrimSpace(line)
		
		if trimmed == "---" {
			delimiterCount++
			
			// Pattern analysis:
			// Delimiter 1: Start of first YAML
			// Delimiter 2: End of first YAML
			// Delimiter 3: Start of next YAML (new question)
			// Delimiter 4: End of second YAML
			// etc.
			
			if delimiterCount == 1 || delimiterCount == 2 {
				// First two delimiters belong to current question
				currentChunk.WriteString(line + "\n")
			} else {
				// Third+ delimiter starts a new question
				// Save current chunk
				if currentChunk.Len() > 0 {
					chunks = append(chunks, currentChunk.String())
					currentChunk.Reset()
				}
				// Start new chunk with this delimiter
				currentChunk.WriteString(line + "\n")
				delimiterCount = 1 // Reset for new question
			}
		} else {
			// Regular line
			currentChunk.WriteString(line)
			if i < len(lines)-1 {
				currentChunk.WriteString("\n")
			}
		}
	}
	
	// Don't forget the last chunk
	if currentChunk.Len() > 0 {
		chunks = append(chunks, currentChunk.String())
	}
	
	return chunks
}

// Parse a single question from a chunk of text
func parseQuestion(chunk string) (*QuestionImport, error) {
	// Front-matter
	m := reFrontMatter.FindStringSubmatch(chunk)
	if len(m) < 2 {
		return nil, errors.New("missing YAML front-matter")
	}

	var q QuestionImport
	if err := yaml.Unmarshal([]byte(m[1]), &q); err != nil {
		return nil, err
	}

	body := chunk[len(m[0]):]

	// Content: from start until first option line / explanation
	lines := strings.Split(body, "\n")
	var contentLines []string
	i := 0
	for ; i < len(lines); i++ {
		if reOpt.MatchString(lines[i]) || reExpl.MatchString(lines[i]) || reTFAns.MatchString(lines[i]) {
			break
		}
		contentLines = append(contentLines, lines[i])
	}
	q.Content = strings.TrimSpace(strings.Join(contentLines, "\n"))

	// Options: Extract legitimate option text, removing embedded metadata
	pos := 1
	for _, lm := range reOpt.FindAllStringSubmatch(body, -1) {
		mark, text := lm[1], strings.TrimSpace(lm[2])
		
		// If text contains metadata markers, extract only the first line/legitimate part
		textLower := strings.ToLower(text)
		if strings.Contains(textLower, "hint:") ||
			strings.Contains(textLower, "answer key") ||
			strings.Contains(textLower, "rationale:") ||
			strings.Contains(textLower, "difficulty:") ||
			strings.Contains(textLower, "nppe syllabus") ||
			strings.Contains(textLower, "source reference") ||
			strings.Contains(textLower, "correct answer:") {
			
			// Try to extract just the first line (legitimate option text)
			lines := strings.Split(text, "\n")
			if len(lines) > 0 && len(strings.TrimSpace(lines[0])) > 0 {
				text = strings.TrimSpace(lines[0])
				fmt.Printf("[DEBUG parseQuestion] Cleaned malformed option, extracted: %q\n", truncate(text, 100))
			} else {
				fmt.Printf("[DEBUG parseQuestion] Skipping completely malformed option\n")
				continue
			}
		}
		
		// Skip if still suspiciously long after cleaning
		if len(text) > 500 {
			fmt.Printf("[DEBUG parseQuestion] Skipping option (too long after cleaning): %q\n", truncate(text, 100))
			continue
		}
		
		q.Options = append(q.Options, OptionImport{Text: text, Correct: (mark == "x"), Position: pos})
		pos++
	}

	// TF answer (if any)
	if tf := reTFAns.FindStringSubmatch(body); len(tf) == 2 {
		ans := tf[1] == "true"
		q.Options = []OptionImport{
			{Text: "True", Correct: ans, Position: 1},
			{Text: "False", Correct: !ans, Position: 2},
		}
	}

	// Explanation
	if ex := reExpl.FindStringSubmatch(body); len(ex) == 2 {
		q.Explanation = strings.TrimSpace(ex[1])
	}

	// Defaults
	if q.Active == nil {
		t := true
		q.Active = &t
	}

	// Content hash (normalize: strip markdown, lower)
	norm := strings.ToLower(stripMD(q.Content))
	sum := sha256.Sum256([]byte(norm))
	q.ContentHash = sum[:]

	return &q, nil
}

func stripMD(s string) string {
	s = regexp.MustCompile(`\*\*|\*|__|_|~~|`+"`"+`|#+\s*`).ReplaceAllString(s, "")
	s = regexp.MustCompile(`<[^>]+>`).ReplaceAllString(s, "")
	return strings.TrimSpace(s)
}

func validate(q *QuestionImport) error {
	if q.Type == "" || q.Difficulty == "" || q.TopicName == "" || q.Content == "" {
		return errors.New("missing required fields (type, difficulty, topic, content)")
	}
	switch q.Type {
	case "multiple_choice_single":
		c := 0
		for _, o := range q.Options {
			if o.Correct {
				c++
			}
		}
		if c != 1 {
			return fmt.Errorf("single-choice must have exactly 1 correct (got %d)", c)
		}
		if len(q.Options) < 2 {
			return errors.New("single-choice needs ≥2 options")
		}
	case "multiple_choice_multi":
		c := 0
		for _, o := range q.Options {
			if o.Correct {
				c++
			}
		}
		if c < 1 {
			return errors.New("multi-choice must have ≥1 correct")
		}
	case "true_false":
		if len(q.Options) != 2 {
			return errors.New("true/false must have exactly 2 options")
		}
	default:
		return fmt.Errorf("unknown type %q", q.Type)
	}
	return nil
}

func importOne(ctx context.Context, db *gorm.DB, q *QuestionImport) error {
	if dryRun {
		action := "create"
		if existingID := findExistingID(db, q); existingID != "" {
			action = "update"
		}
		fmt.Printf("[dry-run] would %s question: %q (topic=%s subtopic=%v)\n",
			action, truncate(q.Content, 80), q.TopicName, q.SubTopicName)
		return nil
	}

	return db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Resolve topic by name (create if missing)
		var topic Topic
		if err := tx.Where("name = ?", q.TopicName).First(&topic).Error; err != nil {
			if createMissingTopics {
				// create on demand
				topic = Topic{Name: q.TopicName, Code: strings.ToUpper(strings.ReplaceAll(q.TopicName, " ", "_"))}
				if err := tx.Create(&topic).Error; err != nil {
					return err
				}
				fmt.Printf("[DEBUG] Created topic: id=%s, name=%s\n", topic.ID, topic.Name)
			} else {
				return fmt.Errorf("topic %q not found (use --create-missing-topics to auto-create)", q.TopicName)
			}
		}

		// Resolve subtopic by name (create if missing, but allow it to be optional)
		var subID *string
		if q.SubTopicName != nil && *q.SubTopicName != "" {
			var st SubTopic
			err := tx.Where("topic_id = ? AND name = ?", topic.ID, *q.SubTopicName).First(&st).Error
			if err != nil {
				if createMissingTopics {
					// Generate safe code for subtopic
					code := strings.ToUpper(strings.ReplaceAll(*q.SubTopicName, " ", "_"))
					st = SubTopic{TopicID: topic.ID, Name: *q.SubTopicName, Code: code}
					fmt.Printf("[DEBUG] Creating subtopic: name=%s, code=%s, topicID=%s\n", st.Name, st.Code, st.TopicID)
					if err := tx.Create(&st).Error; err != nil {
						fmt.Printf("[WARN] Failed to create subtopic %q: %v (proceeding without subtopic)\n", *q.SubTopicName, err)
						// Don't fail - just proceed without subtopic
						st.ID = ""
					} else {
						fmt.Printf("[DEBUG] Successfully created subtopic: id=%s\n", st.ID)
					}
				} else {
					fmt.Printf("[WARN] Subtopic %q not found (proceeding without subtopic)\n", *q.SubTopicName)
					// Don't fail - just proceed without subtopic
					st.ID = ""
				}
			}
			if st.ID != "" {
				subID = &st.ID
				fmt.Printf("[DEBUG] Using subtopic ID: %s\n", st.ID)
			} else {
				fmt.Printf("[DEBUG] No subtopic ID available, question will have null subtopic\n")
			}
		}

		// Find existing by slug or content_hash
		var existing Question
		if q.Slug != "" {
			if err := tx.Where("reference_source = ? AND content_hash = ?",
				q.ReferenceSource, q.ContentHash).First(&existing).Error; err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
				// fallthrough to content_hash only
			}
		}
		if existing.ID == "" {
			if err := tx.Where("content_hash = ? AND deleted_at IS NULL", q.ContentHash).First(&existing).Error; err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}
		}

		isActive := true
		if q.Active != nil {
			isActive = *q.Active
		}

		if existing.ID == "" {
			// Create
			newQ := Question{
				Content:         q.Content,
				QuestionType:    q.Type,
				Difficulty:      q.Difficulty,
				TopicID:         topic.ID,
				SubTopicID:      subID,
				Province:        q.Province,
				Explanation:     q.Explanation,
				ReferenceSource: q.ReferenceSource,
				IsActive:        isActive,
				ContentHash:     q.ContentHash,
			}
			if err := tx.Create(&newQ).Error; err != nil {
				return err
			}
			// Options
			for _, o := range q.Options {
				if err := tx.Create(&QuestionOption{
					QuestionID: newQ.ID, OptionText: o.Text, IsCorrect: o.Correct, Position: o.Position,
				}).Error; err != nil {
					return err
				}
			}
			// Validate after all options inserted
			if err := tx.Exec("SELECT validate_question(?)", newQ.ID).Error; err != nil {
				return err
			}
		} else {
			// Update
			existing.Content = q.Content
			existing.QuestionType = q.Type
			existing.Difficulty = q.Difficulty
			existing.TopicID = topic.ID
			existing.SubTopicID = subID
			existing.Province = q.Province
			existing.Explanation = q.Explanation
			existing.ReferenceSource = q.ReferenceSource
			existing.IsActive = isActive
			existing.ContentHash = q.ContentHash

			if err := tx.Save(&existing).Error; err != nil {
				return err
			}
			// Replace options (simplest)
			if err := tx.Where("question_id = ?", existing.ID).Delete(&QuestionOption{}).Error; err != nil {
				return err
			}
			for _, o := range q.Options {
				if err := tx.Create(&QuestionOption{
					QuestionID: existing.ID, OptionText: o.Text, IsCorrect: o.Correct, Position: o.Position,
				}).Error; err != nil {
					return err
				}
			}
			// Validate after all options inserted
			if err := tx.Exec("SELECT validate_question(?)", existing.ID).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

// (Optional) debug helper
func hexHash(b []byte) string {
	return hex.EncodeToString(b)
}

func findExistingID(db *gorm.DB, q *QuestionImport) string {
	var existing Question
	if q.Slug != "" {
		if err := db.Where("reference_source = ? AND content_hash = ?",
			q.ReferenceSource, q.ContentHash).First(&existing).Error; err == nil {
			return existing.ID
		}
	}
	if err := db.Where("content_hash = ? AND deleted_at IS NULL", q.ContentHash).First(&existing).Error; err == nil {
		return existing.ID
	}
	return ""
}

func truncate(s string, n int) string {
	if len([]rune(s)) <= n {
		return s
	}
	r := []rune(s)
	return string(r[:n]) + "…"
}
