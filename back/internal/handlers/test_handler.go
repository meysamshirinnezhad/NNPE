package handlers

import (
	"net/http"
	"time"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/nppe-pro/api/internal/models"
	"github.com/nppe-pro/api/pkg/database"
	"gorm.io/gorm"
)

type TestHandler struct {
	db    *gorm.DB
	redis *database.RedisClient
}

func NewTestHandler(db *gorm.DB, redis *database.RedisClient) *TestHandler {
	return &TestHandler{
		db:    db,
		redis: redis,
	}
}

type StartTestRequest struct {
	TestType         string      `json:"test_type" binding:"required"` // full_exam, topic_specific, custom
	TopicIDs         []uuid.UUID `json:"topic_ids,omitempty"`
	Difficulty       string      `json:"difficulty,omitempty"`
	QuestionCount    int         `json:"question_count,omitempty"`
	TimeLimitMinutes int         `json:"time_limit_minutes,omitempty"`
}

type StartTestResponse struct {
	TestID           string            `json:"test_id"`
	Questions        []models.Question `json:"questions"`
	TotalQuestions   int               `json:"total_questions"`
	TimeLimitMinutes int               `json:"time_limit_minutes"`
	StartedAt        time.Time         `json:"started_at"`
}

// StartTest starts a new practice test
func (h *TestHandler) StartTest(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req StartTestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set defaults based on test type
	questionCount := req.QuestionCount
	timeLimit := req.TimeLimitMinutes

	if questionCount == 0 {
		switch req.TestType {
		case "full_exam":
			questionCount = 110
		case "topic_specific":
			questionCount = 20
		default:
			questionCount = 10
		}
	}

	if timeLimit == 0 {
		switch req.TestType {
		case "full_exam":
			timeLimit = 180
		case "topic_specific":
			timeLimit = 30
		default:
			timeLimit = 15
		}
	}

	// Build query for questions
	query := h.db.Model(&models.Question{}).Where("is_active = ?", true)

	if len(req.TopicIDs) > 0 {
		query = query.Where("topic_id IN ?", req.TopicIDs)
	}

	if req.Difficulty != "" {
		query = query.Where("difficulty = ?", req.Difficulty)
	}

	// Get random questions
	var questions []models.Question
	if err := query.Order("RANDOM()").Limit(questionCount).Preload("Topic").Preload("Options").Find(&questions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch questions"})
		return
	}

	if len(questions) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No questions available for the selected criteria"})
		return
	}

	// Create practice test
	test := models.PracticeTest{
		UserID:           userID.(uuid.UUID),
		TestType:         req.TestType,
		Status:           "in_progress",
		TotalQuestions:   len(questions),
		TimeLimitMinutes: timeLimit,
		StartedAt:        time.Now(),
	}

	if err := h.db.Create(&test).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create test"})
		return
	}

	// Create test questions
	testQuestions := make([]models.PracticeTestQuestion, len(questions))
	for i, q := range questions {
		testQuestions[i] = models.PracticeTestQuestion{
			PracticeTestID: test.ID,
			QuestionID:     q.ID,
			Position:       i + 1,
		}
	}

	if err := h.db.Create(&testQuestions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create test questions"})
		return
	}

	c.JSON(http.StatusOK, StartTestResponse{
		TestID:           test.ID.String(),
		Questions:        questions,
		TotalQuestions:   len(questions),
		TimeLimitMinutes: timeLimit,
		StartedAt:        test.StartedAt,
	})
}

// GetTest returns test details
func (h *TestHandler) GetTest(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	testID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid test ID"})
		return
	}

	var test models.PracticeTest
	if err := h.db.Where("id = ? AND user_id = ?", testID, userID).
		Preload("Questions.Question.Topic").
		Preload("Questions.Question.Options").
		First(&test).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Test not found"})
		return
	}

	c.JSON(http.StatusOK, test)
}

type SubmitAnswerRequest struct {
	SelectedOptionID string `json:"selected_option_id" binding:"required"`
	TimeSpentSeconds int    `json:"time_spent_seconds"`
}

// SubmitTestAnswer submits an answer during a test
func (h *TestHandler) SubmitTestAnswer(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	testID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid test ID"})
		return
	}

	posStr := c.Param("position")
	pos, err := strconv.Atoi(posStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid question position"})
		return
	}

	var req SubmitAnswerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	optionID, err := uuid.Parse(req.SelectedOptionID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid option ID"})
		return
	}

	// Verify test belongs to user and is in progress
	var test models.PracticeTest
	if err := h.db.Where("id = ? AND user_id = ? AND status = ?", testID, userID, "in_progress").
		First(&test).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Test not found or already completed"})
		return
	}

	// Find the test question
	var testQuestion models.PracticeTestQuestion
	if err := h.db.Where("practice_test_id = ? AND position = ?", testID, pos).
		Preload("Question.Options").
		First(&testQuestion).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Question not found"})
		return
	}

	// Check if option is correct
	var option models.QuestionOption
	if err := h.db.Where("id = ? AND question_id = ?", optionID, testQuestion.QuestionID).
		First(&option).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid option for this question"})
		return
	}

	// Update test question with answer
	isCorrect := option.IsCorrect
	testQuestion.AnswerID = &optionID
	testQuestion.IsCorrect = &isCorrect
	testQuestion.TimeSpentSeconds = req.TimeSpentSeconds

	if err := h.db.Save(&testQuestion).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save answer"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Answer submitted successfully"})
}

// CompleteTest completes a practice test
func (h *TestHandler) CompleteTest(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	testID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid test ID"})
		return
	}

	// Get test with questions and topics
	var test models.PracticeTest
	if err := h.db.Where("id = ? AND user_id = ?", testID, userID).
		Preload("Questions.Question.Topic").
		Preload("Questions.Question.Options").
		First(&test).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Test not found"})
		return
	}

	if test.Status != "in_progress" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Test is already completed"})
		return
	}

	// Calculate score and topic performance
	correctCount := 0
	totalTime := 0
	topicStats := make(map[string]struct {
		correct int
		total   int
		name    string
	})

	for _, tq := range test.Questions {
		if tq.IsCorrect != nil && *tq.IsCorrect {
			correctCount++
		}
		totalTime += tq.TimeSpentSeconds

		// Track topic performance
		if tq.Question != nil && tq.Question.Topic != nil {
			topicID := tq.Question.TopicID.String()
			stats := topicStats[topicID]
			stats.name = tq.Question.Topic.Name
			stats.total++
			if tq.IsCorrect != nil && *tq.IsCorrect {
				stats.correct++
			}
			topicStats[topicID] = stats
		}
	}

	score := float64(0)
	if test.TotalQuestions > 0 {
		score = (float64(correctCount) / float64(test.TotalQuestions)) * 100
	}

	// Build performance by topic
	performanceByTopic := make([]gin.H, 0, len(topicStats))
	weakTopics := make([]string, 0)

	for _, stats := range topicStats {
		percentage := float64(0)
		if stats.total > 0 {
			percentage = (float64(stats.correct) / float64(stats.total)) * 100
		}

		performanceByTopic = append(performanceByTopic, gin.H{
			"topic_name": stats.name,
			"correct":    stats.correct,
			"total":      stats.total,
			"percentage": int(percentage),
		})

		// Identify weak topics (< 70%)
		if percentage < 70.0 {
			weakTopics = append(weakTopics, stats.name)
		}
	}

	// Calculate pass probability (simplified)
	passProbability := score
	if score >= 65.0 {
		passProbability = 90.0
	}

	// Update test
	now := time.Now()
	test.Status = "completed"
	test.CorrectAnswers = correctCount
	test.Score = score
	test.TimeSpentSeconds = totalTime
	test.CompletedAt = &now

	if err := h.db.Save(&test).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to complete test"})
		return
	}

	// Update user stats
	var stats models.UserStats
	if err := h.db.Where("user_id = ?", userID).First(&stats).Error; err != nil {
		// Create stats if they don't exist
		stats = models.UserStats{
			UserID:             userID.(uuid.UUID),
			QuestionsCompleted: 0,
			QuestionsCorrect:   0,
			PracticeTestsTaken: 0,
			AverageTestScore:   0,
			TimeStudiedSeconds: 0,
		}
		if err := h.db.Create(&stats).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user stats"})
			return
		}
	}

	// Update stats
	stats.PracticeTestsTaken++
	if stats.PracticeTestsTaken > 0 {
		// Recalculate average test score
		var allTests []models.PracticeTest
		if err := h.db.Where("user_id = ? AND status = ?", userID, "completed").Find(&allTests).Error; err == nil {
			totalScore := 0.0
			for _, t := range allTests {
				totalScore += t.Score
			}
			stats.AverageTestScore = totalScore / float64(len(allTests))
		}
	}

	if err := h.db.Save(&stats).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user stats"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"test_id":              test.ID.String(),
		"score":                score,
		"correct_answers":      correctCount,
		"total_questions":      test.TotalQuestions,
		"time_spent_seconds":   totalTime,
		"pass_status":          score >= 65.0,
		"performance_by_topic": performanceByTopic,
		"weak_topics":          weakTopics,
		"pass_probability":     passProbability,
		"completed_at":         now,
	})
}

// ReviewTest returns test review with answers
func (h *TestHandler) ReviewTest(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	testID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid test ID"})
		return
	}

	var test models.PracticeTest
	if err := h.db.Where("id = ? AND user_id = ?", testID, userID).
		Preload("Questions.Question.Topic").
		Preload("Questions.Question.Options").
		First(&test).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Test not found"})
		return
	}

	c.JSON(http.StatusOK, test)
}

type TestHistorySummary struct {
	ID               string    `json:"id"`
	TestType         string    `json:"test_type"`
	Score            float64   `json:"score"`
	TotalQuestions   int       `json:"total_questions"`
	CorrectAnswers   int       `json:"correct_answers"`
	TimeSpentSeconds int       `json:"time_spent_seconds"`
	StartedAt        time.Time `json:"started_at"`
	CompletedAt      *time.Time `json:"completed_at,omitempty"`
	Status           string    `json:"status"`
}

// GetTestHistory returns user's practice test history
func (h *TestHandler) GetTestHistory(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var tests []models.PracticeTest
	if err := h.db.Where("user_id = ?", userID).
		Order("started_at DESC").
		Find(&tests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch test history"})
		return
	}

	c.JSON(http.StatusOK, tests)
}

// GetTestHistorySummary returns optimized test history for profile
func (h *TestHandler) GetTestHistorySummary(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get recent tests (last 10) with essential fields only
	var tests []models.PracticeTest
	if err := h.db.Where("user_id = ?", userID).
		Order("started_at DESC").
		Limit(10).
		Find(&tests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch test history"})
		return
	}

	// Convert to summary format
	summaries := make([]TestHistorySummary, len(tests))
	for i, test := range tests {
		summaries[i] = TestHistorySummary{
			ID:               test.ID.String(),
			TestType:         test.TestType,
			Score:            test.Score,
			TotalQuestions:   test.TotalQuestions,
			CorrectAnswers:   test.CorrectAnswers,
			TimeSpentSeconds: test.TimeSpentSeconds,
			StartedAt:        test.StartedAt,
			CompletedAt:      test.CompletedAt,
			Status:           test.Status,
		}
	}

	c.JSON(http.StatusOK, summaries)
}

// Test Results Response Structures (matching TEST_RESULTS_API_SPECIFICATION.md)

type TestResultsResponse struct {
	// Basic Test Information
	ID       string `json:"id"`
	UserID   string `json:"user_id"`
	TestType string `json:"test_type"`
	Title    string `json:"title"`
	Status   string `json:"status"`

	// Core Metrics
	Score            float64 `json:"score"`
	TotalQuestions   int     `json:"total_questions"`
	CorrectAnswers   int     `json:"correct_answers"`
	IncorrectAnswers int     `json:"incorrect_answers"`
	Unanswered       int     `json:"unanswered"`

	// Time Tracking
	StartedAt              time.Time `json:"started_at"`
	CompletedAt            time.Time `json:"completed_at"`
	TimeSpentSeconds       int       `json:"time_spent_seconds"`
	AverageTimePerQuestion float64   `json:"average_time_per_question"`

	// Pass/Fail Status
	Passed       bool    `json:"passed"`
	PassingScore float64 `json:"passing_score"`

	// Performance Breakdown
	TopicBreakdown      []TopicPerformance      `json:"topic_breakdown"`
	QuestionResults     []QuestionResult        `json:"question_results"`
	DifficultyBreakdown DifficultyBreakdownData `json:"difficulty_breakdown"`

	// Achievements & Recommendations
	AchievementsUnlocked []Achievement    `json:"achievements_unlocked"`
	BadgesEarned         []Badge          `json:"badges_earned"`
	WeakAreas            []string         `json:"weak_areas"`
	StudyRecommendations []Recommendation `json:"study_recommendations"`

	// Historical Context
	ImprovementMetrics *ImprovementMetrics `json:"improvement_metrics,omitempty"`
}

type TopicPerformance struct {
	TopicID            string  `json:"topic_id"`
	TopicName          string  `json:"topic_name"`
	TotalQuestions     int     `json:"total_questions"`
	CorrectAnswers     int     `json:"correct_answers"`
	IncorrectAnswers   int     `json:"incorrect_answers"`
	Percentage         float64 `json:"percentage"`
	AverageTimeSeconds float64 `json:"average_time_seconds"`
}

type QuestionResult struct {
	QuestionID       string         `json:"question_id"`
	QuestionNumber   int            `json:"question_number"`
	TopicID          string         `json:"topic_id"`
	TopicName        string         `json:"topic_name"`
	SubtopicID       *string        `json:"subtopic_id,omitempty"`
	SubtopicName     *string        `json:"subtopic_name,omitempty"`
	Difficulty       string         `json:"difficulty"`
	QuestionText     string         `json:"question_text"`
	QuestionType     string         `json:"question_type"`
	Options          []AnswerOption `json:"options"`
	UserAnswerID     *string        `json:"user_answer_id"`
	CorrectAnswerID  string         `json:"correct_answer_id"`
	IsCorrect        bool           `json:"is_correct"`
	TimeSpentSeconds int            `json:"time_spent_seconds"`
	Explanation      *string        `json:"explanation,omitempty"`
	Reference        *string        `json:"reference,omitempty"`
	IsBookmarked     bool           `json:"is_bookmarked"`
}

type AnswerOption struct {
	ID        string `json:"id"`
	Text      string `json:"text"`
	IsCorrect bool   `json:"is_correct"`
	Order     int    `json:"order"`
}

type DifficultyBreakdownData struct {
	Easy   DifficultyStats `json:"easy"`
	Medium DifficultyStats `json:"medium"`
	Hard   DifficultyStats `json:"hard"`
}

type DifficultyStats struct {
	TotalQuestions     int     `json:"total_questions"`
	CorrectAnswers     int     `json:"correct_answers"`
	IncorrectAnswers   int     `json:"incorrect_answers"`
	Percentage         float64 `json:"percentage"`
	AverageTimeSeconds float64 `json:"average_time_seconds"`
}

type Achievement struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Icon        string    `json:"icon"`
	Rarity      string    `json:"rarity"`
	EarnedAt    time.Time `json:"earned_at"`
	Points      int       `json:"points"`
}

type Badge struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Icon        string    `json:"icon"`
	Level       int       `json:"level"`
	EarnedAt    time.Time `json:"earned_at"`
}

type Recommendation struct {
	Type        string  `json:"type"`
	Priority    string  `json:"priority"`
	Title       string  `json:"title"`
	Description string  `json:"description"`
	ActionURL   *string `json:"action_url,omitempty"`
	Icon        *string `json:"icon,omitempty"`
}

type ImprovementMetrics struct {
	ScoreChange   float64  `json:"score_change"`
	PreviousScore *float64 `json:"previous_score,omitempty"`
	TestsTaken    int      `json:"tests_taken"`
	AverageScore  float64  `json:"average_score"`
}

// GetTestResults returns comprehensive test results
func (h *TestHandler) GetTestResults(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	testID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid test ID"})
		return
	}

	// Get test with all related data
	var test models.PracticeTest
	if err := h.db.Where("id = ? AND user_id = ?", testID, userID).
		Preload("Questions.Question.Topic").
		Preload("Questions.Question.SubTopic").
		Preload("Questions.Question.Options").
		First(&test).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Test not found"})
		return
	}

	// Verify test is completed
	if test.Status != "completed" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Test is not yet completed"})
		return
	}

	// Initialize response
	response := TestResultsResponse{
		ID:               test.ID.String(),
		UserID:           test.UserID.String(),
		TestType:         test.TestType,
		Title:            formatTestTitle(test.TestType),
		Status:           test.Status,
		Score:            test.Score,
		TotalQuestions:   test.TotalQuestions,
		CorrectAnswers:   test.CorrectAnswers,
		StartedAt:        test.StartedAt,
		TimeSpentSeconds: test.TimeSpentSeconds,
		PassingScore:     70.0,
		Passed:           test.Score >= 70.0,
	}

	if test.CompletedAt != nil {
		response.CompletedAt = *test.CompletedAt
	}

	// Calculate metrics
	topicStats := make(map[string]*TopicPerformance)
	difficultyStats := map[string]*DifficultyStats{
		"easy":   {TotalQuestions: 0, CorrectAnswers: 0, IncorrectAnswers: 0},
		"medium": {TotalQuestions: 0, CorrectAnswers: 0, IncorrectAnswers: 0},
		"hard":   {TotalQuestions: 0, CorrectAnswers: 0, IncorrectAnswers: 0},
	}

	incorrectCount := 0
	unansweredCount := 0
	questionResults := make([]QuestionResult, 0, len(test.Questions))

	for _, tq := range test.Questions {
		if tq.Question == nil {
			continue
		}

		q := tq.Question
		isCorrect := tq.IsCorrect != nil && *tq.IsCorrect

		// Count incorrect and unanswered
		if tq.AnswerID == nil {
			unansweredCount++
		} else if !isCorrect {
			incorrectCount++
		}

		// Track topic performance
		if q.Topic != nil {
			topicID := q.TopicID.String()
			if topicStats[topicID] == nil {
				topicStats[topicID] = &TopicPerformance{
					TopicID:   topicID,
					TopicName: q.Topic.Name,
				}
			}
			stats := topicStats[topicID]
			stats.TotalQuestions++
			stats.AverageTimeSeconds += float64(tq.TimeSpentSeconds)
			if isCorrect {
				stats.CorrectAnswers++
			} else if tq.AnswerID != nil {
				stats.IncorrectAnswers++
			}
		}

		// Track difficulty stats
		if diffStats, ok := difficultyStats[q.Difficulty]; ok {
			diffStats.TotalQuestions++
			diffStats.AverageTimeSeconds += float64(tq.TimeSpentSeconds)
			if isCorrect {
				diffStats.CorrectAnswers++
			} else if tq.AnswerID != nil {
				diffStats.IncorrectAnswers++
			}
		}

		// Build question result
		options := make([]AnswerOption, 0, len(q.Options))
		var correctAnswerID string
		for i, opt := range q.Options {
			options = append(options, AnswerOption{
				ID:        opt.ID.String(),
				Text:      opt.OptionText,
				IsCorrect: opt.IsCorrect,
				Order:     i + 1,
			})
			if opt.IsCorrect {
				correctAnswerID = opt.ID.String()
			}
		}

		var userAnswerID *string
		if tq.AnswerID != nil {
			answerStr := tq.AnswerID.String()
			userAnswerID = &answerStr
		}

		var subtopicID, subtopicName *string
		if q.SubTopic != nil && q.SubTopicID != nil {
			sid := q.SubTopicID.String()
			sname := q.SubTopic.Name
			subtopicID = &sid
			subtopicName = &sname
		}

		questionResults = append(questionResults, QuestionResult{
			QuestionID:       q.ID.String(),
			QuestionNumber:   tq.Position,
			TopicID:          q.TopicID.String(),
			TopicName:        q.Topic.Name,
			SubtopicID:       subtopicID,
			SubtopicName:     subtopicName,
			Difficulty:       q.Difficulty,
			QuestionText:     q.Content,
			QuestionType:     "multiple_choice",
			Options:          options,
			UserAnswerID:     userAnswerID,
			CorrectAnswerID:  correctAnswerID,
			IsCorrect:        isCorrect,
			TimeSpentSeconds: tq.TimeSpentSeconds,
			Explanation:      &q.Explanation,
			Reference:        &q.ReferenceSource,
			IsBookmarked:     false, // TODO: Implement bookmarking
		})
	}

	response.IncorrectAnswers = incorrectCount
	response.Unanswered = unansweredCount
	response.QuestionResults = questionResults

	// Calculate average time per question
	if test.TotalQuestions > 0 {
		response.AverageTimePerQuestion = float64(test.TimeSpentSeconds) / float64(test.TotalQuestions)
	}

	// Finalize topic breakdown
	topicBreakdown := make([]TopicPerformance, 0, len(topicStats))
	weakAreas := make([]string, 0)
	for _, stats := range topicStats {
		if stats.TotalQuestions > 0 {
			stats.Percentage = (float64(stats.CorrectAnswers) / float64(stats.TotalQuestions)) * 100
			stats.AverageTimeSeconds = stats.AverageTimeSeconds / float64(stats.TotalQuestions)
			if stats.Percentage < 70.0 {
				weakAreas = append(weakAreas, stats.TopicName)
			}
		}
		topicBreakdown = append(topicBreakdown, *stats)
	}
	response.TopicBreakdown = topicBreakdown
	response.WeakAreas = weakAreas

	// Finalize difficulty breakdown
	for _, stats := range difficultyStats {
		if stats.TotalQuestions > 0 {
			stats.Percentage = (float64(stats.CorrectAnswers) / float64(stats.TotalQuestions)) * 100
			stats.AverageTimeSeconds = stats.AverageTimeSeconds / float64(stats.TotalQuestions)
		}
	}
	response.DifficultyBreakdown = DifficultyBreakdownData{
		Easy:   *difficultyStats["easy"],
		Medium: *difficultyStats["medium"],
		Hard:   *difficultyStats["hard"],
	}

	// Generate achievements
	achievements := generateAchievements(test, topicBreakdown)
	response.AchievementsUnlocked = achievements
	response.BadgesEarned = []Badge{} // Empty for now

	// Generate recommendations
	recommendations := generateRecommendations(test.Score, weakAreas)
	response.StudyRecommendations = recommendations

	// Get improvement metrics
	improvementMetrics := h.calculateImprovementMetrics(userID.(uuid.UUID), test.Score)
	response.ImprovementMetrics = improvementMetrics

	c.JSON(http.StatusOK, response)
}

// Helper function to format test title
func formatTestTitle(testType string) string {
	switch testType {
	case "full_exam":
		return "NPPE Practice Test - Full Exam"
	case "topic_specific":
		return "NPPE Practice Test - Topic Specific"
	case "custom":
		return "NPPE Practice Test - Custom"
	default:
		return "NPPE Practice Test"
	}
}

// Helper function to generate achievements
func generateAchievements(test models.PracticeTest, topicBreakdown []TopicPerformance) []Achievement {
	achievements := make([]Achievement, 0)
	now := time.Now()

	// Excellence Award
	if test.Score >= 90 {
		achievements = append(achievements, Achievement{
			ID:          uuid.New().String(),
			Name:        "Excellence Award",
			Description: "Scored 90% or higher on a practice test",
			Icon:        "trophy",
			Rarity:      "rare",
			EarnedAt:    now,
			Points:      100,
		})
	}

	// Perfect Score Achievement
	if test.Score == 100 {
		achievements = append(achievements, Achievement{
			ID:          uuid.New().String(),
			Name:        "Perfect Score",
			Description: "Achieved 100% on a practice test",
			Icon:        "star",
			Rarity:      "legendary",
			EarnedAt:    now,
			Points:      250,
		})
	}

	// Speed Master
	if test.TimeSpentSeconds < 3600 {
		achievements = append(achievements, Achievement{
			ID:          uuid.New().String(),
			Name:        "Speed Master",
			Description: "Completed test under 60 minutes",
			Icon:        "speed",
			Rarity:      "common",
			EarnedAt:    now,
			Points:      50,
		})
	}

	// Consistency Champion
	if test.Score >= 80 && test.CorrectAnswers >= int(float64(test.TotalQuestions)*0.8) {
		achievements = append(achievements, Achievement{
			ID:          uuid.New().String(),
			Name:        "Consistency Champion",
			Description: "Maintained 80%+ score with consistent performance",
			Icon:        "medal",
			Rarity:      "rare",
			EarnedAt:    now,
			Points:      100,
		})
	}

	// Perfect Topic Achievements
	for _, topic := range topicBreakdown {
		if topic.Percentage == 100 {
			achievements = append(achievements, Achievement{
				ID:          uuid.New().String(),
				Name:        "Perfect Score - " + topic.TopicName,
				Description: "Answered all " + topic.TopicName + " questions correctly",
				Icon:        "star",
				Rarity:      "epic",
				EarnedAt:    now,
				Points:      150,
			})
		}
	}

	return achievements
}

// Helper function to generate recommendations
func generateRecommendations(score float64, weakAreas []string) []Recommendation {
	recommendations := make([]Recommendation, 0)

	// Weak areas recommendations
	if len(weakAreas) > 0 {
		for _, area := range weakAreas {
			practiceURL := "/practice?topic=" + area
			icon := "book-open"
			recommendations = append(recommendations, Recommendation{
				Type:        "review",
				Priority:    "high",
				Title:       "Review " + area + " concepts",
				Description: "Focus on strengthening your understanding of " + area,
				ActionURL:   &practiceURL,
				Icon:        &icon,
			})
		}
	}

	// Score-based recommendations
	if score < 70 {
		icon := "edit"
		url := "/practice"
		recommendations = append(recommendations, Recommendation{
			Type:        "practice",
			Priority:    "high",
			Title:       "Practice more questions in weak areas",
			Description: "Regular practice will help improve your understanding",
			ActionURL:   &url,
			Icon:        &icon,
		})
	} else if score >= 90 {
		icon := "clipboard"
		url := "/practice-test/new?type=full"
		recommendations = append(recommendations, Recommendation{
			Type:        "study",
			Priority:    "medium",
			Title:       "Take the full-length simulation exam",
			Description: "You're ready for a comprehensive assessment",
			ActionURL:   &url,
			Icon:        &icon,
		})
	}

	// General recommendations
	groupIcon := "users"
	groupURL := "/study-groups"
	recommendations = append(recommendations, Recommendation{
		Type:        "group",
		Priority:    "low",
		Title:       "Join study group discussions",
		Description: "Connect with other learners and share insights",
		ActionURL:   &groupURL,
		Icon:        &groupIcon,
	})

	return recommendations
}

// Helper function to calculate improvement metrics
func (h *TestHandler) calculateImprovementMetrics(userID uuid.UUID, currentScore float64) *ImprovementMetrics {
	var tests []models.PracticeTest
	if err := h.db.Where("user_id = ? AND status = ?", userID, "completed").
		Order("completed_at DESC").
		Limit(10).
		Find(&tests).Error; err != nil {
		return nil
	}

	if len(tests) == 0 {
		return nil
	}

	metrics := &ImprovementMetrics{
		TestsTaken: len(tests),
	}

	// Calculate average score
	totalScore := 0.0
	for _, test := range tests {
		totalScore += test.Score
	}
	metrics.AverageScore = totalScore / float64(len(tests))

	// Get previous score
	if len(tests) > 1 {
		prevScore := tests[1].Score
		metrics.PreviousScore = &prevScore
		metrics.ScoreChange = currentScore - prevScore
	}

	return metrics
}
