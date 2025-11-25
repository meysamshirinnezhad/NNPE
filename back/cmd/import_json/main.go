package main

import (
	"crypto/sha256"
	"database/sql"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
	_ "github.com/lib/pq"
)

// JSON structures
type JSONRoot struct {
	QuestionBank QuestionBank `json:"question_bank"`
}

type QuestionBank struct {
	Name      string     `json:"name"`
	Version   string     `json:"version"`
	TotalQuestions int   `json:"total_questions"`
	Questions []Question `json:"questions"`
}

type Question struct {
	ID              int      `json:"id"`
	Slug            string   `json:"slug"`
	Type            string   `json:"type"`
	Difficulty      string   `json:"difficulty"`
	Topic           string   `json:"topic"`
	Subtopic        string   `json:"subtopic"`
	SyllabusArea    string   `json:"syllabus_area"`
	ReferenceSource string   `json:"reference_source"`
	Content         string   `json:"content"`
	Explanation     string   `json:"explanation"`
	Hint            string   `json:"hint"`
	Options         []Option `json:"options"`
}

type Option struct {
	Text     string `json:"text"`
	Correct  bool   `json:"correct"`
	Position int    `json:"position"`
}

// Database models (minimal for import)
type TopicModel struct {
	ID          uuid.UUID `db:"id"`
	Name        string    `db:"name"`
	Code        string    `db:"code"`
	Description *string   `db:"description"`
	Weight      *float64  `db:"weight"`
	Order       *int      `db:"order"`
	CreatedAt   time.Time `db:"created_at"`
	UpdatedAt   time.Time `db:"updated_at"`
}

type SubTopicModel struct {
	ID          uuid.UUID  `db:"id"`
	TopicID     uuid.UUID  `db:"topic_id"`
	Name        string     `db:"name"`
	Code        *string    `db:"code"`
	Description *string    `db:"description"`
	Order       *int       `db:"order"`
	CreatedAt   time.Time  `db:"created_at"`
	UpdatedAt   time.Time  `db:"updated_at"`
}

type QuestionModel struct {
	ID              uuid.UUID  `db:"id"`
	Content         string     `db:"content"`
	QuestionType    string     `db:"question_type"`
	Difficulty      string     `db:"difficulty"`
	TopicID         uuid.UUID  `db:"topic_id"`
	SubTopicID      *uuid.UUID `db:"sub_topic_id"`
	Province        *string    `db:"province"`
	Explanation     string     `db:"explanation"`
	ReferenceSource string     `db:"reference_source"`
	IsActive        bool       `db:"is_active"`
	CreatedAt       time.Time  `db:"created_at"`
	UpdatedAt       time.Time  `db:"updated_at"`
	DeletedAt       *time.Time `db:"deleted_at"`
	ContentHash     []byte     `db:"content_hash"`
}

type QuestionOptionModel struct {
	ID         uuid.UUID `db:"id"`
	QuestionID uuid.UUID `db:"question_id"`
	OptionText string    `db:"option_text"`
	IsCorrect  bool      `db:"is_correct"`
	Position   int       `db:"position"`
	CreatedAt  time.Time `db:"created_at"`
	UpdatedAt  time.Time `db:"updated_at"`
}

func main() {
	var (
		jsonFile = flag.String("json", "", "Path to JSON question bank file")
		dryRun   = flag.Bool("dry-run", false, "Show what would be done without making changes")
		dbURL    = os.Getenv("DATABASE_URL")
	)
	flag.Parse()

	if *jsonFile == "" {
		log.Fatal("JSON file path is required. Use -json flag")
	}

	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	// Read and parse JSON
	data, err := os.ReadFile(*jsonFile)
	if err != nil {
		log.Fatalf("Failed to read JSON file: %v", err)
	}

	var root JSONRoot
	if err := json.Unmarshal(data, &root); err != nil {
		log.Fatalf("Failed to parse JSON: %v", err)
	}
	qb := root.QuestionBank

	log.Printf("Loaded %d questions from %s (bank: %s, version: %s)", len(qb.Questions), *jsonFile, qb.Name, qb.Version)

	// Connect to database
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	// Process questions
	stats := processQuestions(db, qb.Questions, *dryRun)

	log.Printf("Import completed:")
	log.Printf("  Topics created: %d", stats.TopicsCreated)
	log.Printf("  Subtopics created: %d", stats.SubtopicsCreated)
	log.Printf("  Questions inserted: %d", stats.QuestionsInserted)
	log.Printf("  Questions updated: %d", stats.QuestionsUpdated)
	log.Printf("  Options created: %d", stats.OptionsCreated)
	log.Printf("  Errors: %d", stats.Errors)

	if len(stats.ErrorMessages) > 0 {
		log.Println("Error details:")
		for _, msg := range stats.ErrorMessages {
			log.Printf("  - %s", msg)
		}
	}
}

type ImportStats struct {
	TopicsCreated     int
	SubtopicsCreated  int
	QuestionsInserted int
	QuestionsUpdated  int
	OptionsCreated    int
	Errors            int
	ErrorMessages     []string
}

func processQuestions(db *sql.DB, questions []Question, dryRun bool) ImportStats {
	stats := ImportStats{}

	// Use a transaction for the entire import
	tx, err := db.Begin()
	if err != nil {
		log.Fatalf("Failed to start transaction: %v", err)
	}
	defer tx.Rollback()

	topicCache := make(map[string]uuid.UUID)
	subtopicCache := make(map[string]uuid.UUID)

	for _, q := range questions {
		// Validate question invariants
		if err := validateQuestion(q); err != nil {
			stats.Errors++
			stats.ErrorMessages = append(stats.ErrorMessages, fmt.Sprintf("Question %d: %v", q.ID, err))
			continue
		}

		// Get or create topic
		topicID, err := getOrCreateTopic(tx, q.Topic, topicCache, dryRun)
		if err != nil {
			stats.Errors++
			stats.ErrorMessages = append(stats.ErrorMessages, fmt.Sprintf("Question %d topic: %v", q.ID, err))
			continue
		}
		if topicID != uuid.Nil && !dryRun {
			stats.TopicsCreated++
		}

		// Get or create subtopic if provided
		var subTopicID *uuid.UUID
		if q.Subtopic != "" {
			id, err := getOrCreateSubTopic(tx, topicID, q.Subtopic, subtopicCache, dryRun)
			if err != nil {
				stats.Errors++
				stats.ErrorMessages = append(stats.ErrorMessages, fmt.Sprintf("Question %d subtopic: %v", q.ID, err))
				continue
			}
			if id != uuid.Nil && !dryRun {
				stats.SubtopicsCreated++
			}
			subTopicID = &id
		}

		// Compute content hash
		contentHash := hashContent(q.Content)

		// Check for existing question
		existingID, err := findQuestionByHash(tx, contentHash)
		if err != nil {
			stats.Errors++
			stats.ErrorMessages = append(stats.ErrorMessages, fmt.Sprintf("Question %d lookup: %v", q.ID, err))
			continue
		}

		var questionID uuid.UUID
		if existingID != uuid.Nil {
			// Update existing question
			if !dryRun {
				if err := updateQuestion(tx, existingID, q, topicID, subTopicID); err != nil {
					stats.Errors++
					stats.ErrorMessages = append(stats.ErrorMessages, fmt.Sprintf("Question %d update: %v", q.ID, err))
					continue
				}
			}
			questionID = existingID
			stats.QuestionsUpdated++
		} else {
			// Insert new question
			if !dryRun {
				id, err := insertQuestion(tx, q, topicID, subTopicID, contentHash)
				if err != nil {
					stats.Errors++
					stats.ErrorMessages = append(stats.ErrorMessages, fmt.Sprintf("Question %d insert: %v", q.ID, err))
					continue
				}
				questionID = id
			} else {
				questionID = uuid.New() // dummy ID for dry run
			}
			stats.QuestionsInserted++
		}

		// Handle options
		if !dryRun {
			if err := replaceQuestionOptions(tx, questionID, q.Options); err != nil {
				stats.Errors++
				stats.ErrorMessages = append(stats.ErrorMessages, fmt.Sprintf("Question %d options: %v", q.ID, err))
				continue
			}
		}
		stats.OptionsCreated += len(q.Options)
	}

	if !dryRun && stats.Errors == 0 {
		if err := tx.Commit(); err != nil {
			log.Fatalf("Failed to commit transaction: %v", err)
		}
	}

	return stats
}

func validateQuestion(q Question) error {
	switch q.Type {
	case "multiple_choice_single":
		correctCount := 0
		for _, opt := range q.Options {
			if opt.Correct {
				correctCount++
			}
		}
		if correctCount != 1 {
			return fmt.Errorf("multiple_choice_single must have exactly 1 correct option, found %d", correctCount)
		}
	case "multiple_choice_multi":
		correctCount := 0
		for _, opt := range q.Options {
			if opt.Correct {
				correctCount++
			}
		}
		if correctCount < 1 {
			return fmt.Errorf("multiple_choice_multi must have at least 1 correct option, found %d", correctCount)
		}
	case "true_false":
		if len(q.Options) != 2 {
			return fmt.Errorf("true_false must have exactly 2 options, found %d", len(q.Options))
		}
		correctCount := 0
		for _, opt := range q.Options {
			if opt.Correct {
				correctCount++
			}
		}
		if correctCount != 1 {
			return fmt.Errorf("true_false must have exactly 1 correct option, found %d", correctCount)
		}
	default:
		return fmt.Errorf("unknown question type: %s", q.Type)
	}

	// Check positions are sequential starting from 1
	positions := make(map[int]bool)
	for _, opt := range q.Options {
		if opt.Position < 1 {
			return fmt.Errorf("option position must be >= 1, found %d", opt.Position)
		}
		if positions[opt.Position] {
			return fmt.Errorf("duplicate option position: %d", opt.Position)
		}
		positions[opt.Position] = true
	}

	// Check positions are consecutive
	for i := 1; i <= len(q.Options); i++ {
		if !positions[i] {
			return fmt.Errorf("missing option position: %d", i)
		}
	}

	return nil
}

func stripMD(content string) string {
	// Remove markdown formatting
	content = regexp.MustCompile(`\*\*(.*?)\*\*`).ReplaceAllString(content, "$1") // bold
	content = regexp.MustCompile(`\*(.*?)\*`).ReplaceAllString(content, "$1")     // italic
	content = regexp.MustCompile(`_(.*?)_`).ReplaceAllString(content, "$1")       // underline
	content = regexp.MustCompile(`~~(.*?)~~`).ReplaceAllString(content, "$1")     // strikethrough
	content = regexp.MustCompile(`\[(.*?)\]\(.*?\)`).ReplaceAllString(content, "$1") // links
	content = regexp.MustCompile(`#+\s*`).ReplaceAllString(content, "")            // headers
	content = regexp.MustCompile(`` + "`" + `.*?` + "`" + ``).ReplaceAllString(content, "") // inline code
	content = regexp.MustCompile(`<[^>]*>`).ReplaceAllString(content, "")          // HTML tags

	return strings.TrimSpace(content)
}

func hashContent(content string) []byte {
	cleaned := strings.ToLower(stripMD(content))
	hash := sha256.Sum256([]byte(cleaned))
	return hash[:]
}

func getOrCreateTopic(tx *sql.Tx, name string, cache map[string]uuid.UUID, dryRun bool) (uuid.UUID, error) {
	if id, exists := cache[name]; exists {
		return id, nil
	}

	// Check if topic exists
	var id uuid.UUID
	err := tx.QueryRow("SELECT id FROM topics WHERE name = $1", name).Scan(&id)
	if err == nil {
		cache[name] = id
		return id, nil
	}
	if err != sql.ErrNoRows {
		return uuid.Nil, err
	}

	// Create new topic
	id = uuid.New()
	code := strings.ToUpper(strings.ReplaceAll(strings.ReplaceAll(name, " ", "_"), "-", "_"))

	if dryRun {
		log.Printf("[DRY RUN] Would create topic: %s (code: %s)", name, code)
		cache[name] = id
		return id, nil
	}

	_, err = tx.Exec(`
		INSERT INTO topics (id, name, code, created_at, updated_at)
		VALUES ($1, $2, $3, NOW(), NOW())
	`, id, name, code)
	if err != nil {
		return uuid.Nil, err
	}

	cache[name] = id
	log.Printf("Created topic: %s", name)
	return id, nil
}

func getOrCreateSubTopic(tx *sql.Tx, topicID uuid.UUID, name string, cache map[string]uuid.UUID, dryRun bool) (uuid.UUID, error) {
	cacheKey := fmt.Sprintf("%s:%s", topicID.String(), name)
	if id, exists := cache[cacheKey]; exists {
		return id, nil
	}

	// Check if subtopic exists
	var id uuid.UUID
	err := tx.QueryRow("SELECT id FROM sub_topics WHERE topic_id = $1 AND name = $2", topicID, name).Scan(&id)
	if err == nil {
		cache[cacheKey] = id
		return id, nil
	}
	if err != sql.ErrNoRows {
		return uuid.Nil, err
	}

	// Create new subtopic
	id = uuid.New()

	// Get topic code to make subtopic code unique
	var topicCode string
	err = tx.QueryRow("SELECT code FROM topics WHERE id = $1", topicID).Scan(&topicCode)
	if err != nil {
		return uuid.Nil, fmt.Errorf("failed to get topic code: %v", err)
	}

	// Create unique code: TOPIC_CODE + _ + SUBTOPIC_CODE
	subtopicCode := strings.ToUpper(strings.ReplaceAll(strings.ReplaceAll(name, " ", "_"), "-", "_"))
	code := fmt.Sprintf("%s_%s", topicCode, subtopicCode)

	if dryRun {
		log.Printf("[DRY RUN] Would create subtopic: %s (code: %s) under topic %s", name, code, topicID.String())
		cache[cacheKey] = id
		return id, nil
	}

	_, err = tx.Exec(`
		INSERT INTO sub_topics (id, topic_id, name, code, created_at, updated_at)
		VALUES ($1, $2, $3, $4, NOW(), NOW())
	`, id, topicID, name, code)
	if err != nil {
		return uuid.Nil, err
	}

	cache[cacheKey] = id
	log.Printf("Created subtopic: %s (code: %s)", name, code)
	return id, nil
}

func findQuestionByHash(tx *sql.Tx, contentHash []byte) (uuid.UUID, error) {
	var id uuid.UUID
	err := tx.QueryRow("SELECT id FROM questions WHERE content_hash = $1 AND deleted_at IS NULL", contentHash).Scan(&id)
	if err == sql.ErrNoRows {
		return uuid.Nil, nil
	}
	return id, err
}

func insertQuestion(tx *sql.Tx, q Question, topicID uuid.UUID, subTopicID *uuid.UUID, contentHash []byte) (uuid.UUID, error) {
	id := uuid.New()
	var subTopicIDValue interface{} = nil
	if subTopicID != nil {
		subTopicIDValue = *subTopicID
	}

	_, err := tx.Exec(`
		INSERT INTO questions (
			id, content, question_type, difficulty, topic_id, sub_topic_id,
			explanation, reference_source, is_active, content_hash, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
	`, id, q.Content, q.Type, q.Difficulty, topicID, subTopicIDValue,
	   q.Explanation, q.ReferenceSource, true, contentHash)

	return id, err
}

func updateQuestion(tx *sql.Tx, id uuid.UUID, q Question, topicID uuid.UUID, subTopicID *uuid.UUID) error {
	var subTopicIDValue interface{} = nil
	if subTopicID != nil {
		subTopicIDValue = *subTopicID
	}

	_, err := tx.Exec(`
		UPDATE questions SET
			content = $2, question_type = $3, difficulty = $4, topic_id = $5, sub_topic_id = $6,
			explanation = $7, reference_source = $8, updated_at = NOW()
		WHERE id = $1
	`, id, q.Content, q.Type, q.Difficulty, topicID, subTopicIDValue,
	   q.Explanation, q.ReferenceSource)

	return err
}

func replaceQuestionOptions(tx *sql.Tx, questionID uuid.UUID, options []Option) error {
	// Delete existing options
	_, err := tx.Exec("DELETE FROM question_options WHERE question_id = $1", questionID)
	if err != nil {
		return err
	}

	// Insert new options
	for _, opt := range options {
		id := uuid.New()
		_, err := tx.Exec(`
			INSERT INTO question_options (id, question_id, option_text, is_correct, position, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		`, id, questionID, opt.Text, opt.Correct, opt.Position)
		if err != nil {
			return err
		}
	}

	return nil
}
