package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/nppe-pro/api/internal/models"
	"github.com/nppe-pro/api/pkg/database"
	"gorm.io/gorm"
)

type DashboardHandler struct {
	db    *gorm.DB
	redis *database.RedisClient
}

func NewDashboardHandler(db *gorm.DB, redis *database.RedisClient) *DashboardHandler {
	return &DashboardHandler{
		db:    db,
		redis: redis,
	}
}

// GetDashboard returns dashboard statistics for the authenticated user
func (h *DashboardHandler) GetDashboard(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get user data
	var user models.User
	if err := h.db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Get user stats
	var stats models.UserStats
	if err := h.db.Where("user_id = ?", userID).First(&stats).Error; err != nil {
		// If no stats exist, return zeros
		stats = models.UserStats{
			UserID: userID.(uuid.UUID),
		}
	}

	// Calculate accuracy rate
	var accuracyRate float64
	if stats.QuestionsCompleted > 0 {
		accuracyRate = (float64(stats.QuestionsCorrect) / float64(stats.QuestionsCompleted)) * 100
	}

	// Calculate overall progress (based on questions completed out of 500)
	overallProgress := 0
	if stats.QuestionsCompleted > 0 {
		overallProgress = int((float64(stats.QuestionsCompleted) / 500.0) * 100)
		if overallProgress > 100 {
			overallProgress = 100
		}
	}

	// Calculate days until exam
	daysUntilExam := 0
	if user.ExamDate != nil {
		daysUntil := int(time.Until(*user.ExamDate).Hours() / 24)
		if daysUntil > 0 {
			daysUntilExam = daysUntil
		}
	}

	// Calculate pass probability based on accuracy and progress
	passProbability := 0
	if accuracyRate > 0 {
		passProbability = int((accuracyRate * 0.7) + (float64(overallProgress) * 0.3))
		if passProbability > 100 {
			passProbability = 100
		}
	}

	// Calculate topic mastery
	topicMastery := h.calculateTopicMastery(userID.(uuid.UUID))

	// Calculate weak topics (topics with < 70% accuracy)
	weakTopics := h.calculateWeakTopics(userID.(uuid.UUID))

	// Get recent activity
	recentActivity := h.getRecentActivity(userID.(uuid.UUID))

	c.JSON(http.StatusOK, gin.H{
		"overall_progress":             overallProgress,
		"study_streak":                 user.StudyStreak,
		"longest_streak":               user.LongestStreak,
		"questions_completed":          stats.QuestionsCompleted,
		"questions_correct":            stats.QuestionsCorrect,
		"accuracy_rate":                accuracyRate,
		"practice_tests_taken":         stats.PracticeTestsTaken,
		"average_test_score":           stats.AverageTestScore,
		"time_studied_hours":           stats.TimeStudiedSeconds / 3600.0,
		"pass_probability":             passProbability,
		"days_until_exam":              daysUntilExam,
		"recommended_study_time_daily": 90,
		"topic_mastery":                topicMastery,
		"weak_topics":                  weakTopics,
		"recent_activity":              recentActivity,
	})
}

// calculateTopicMastery calculates user's mastery for each topic
func (h *DashboardHandler) calculateTopicMastery(userID uuid.UUID) []gin.H {
	type TopicStats struct {
		TopicID   uuid.UUID
		TopicName string
		Attempted int
		Correct   int
	}

	var topicStats []TopicStats
	err := h.db.Table("user_answers").
		Select("questions.topic_id, topics.name as topic_name, COUNT(*) as attempted, SUM(CASE WHEN user_answers.is_correct THEN 1 ELSE 0 END) as correct").
		Joins("JOIN questions ON user_answers.question_id = questions.id").
		Joins("JOIN topics ON questions.topic_id = topics.id").
		Where("user_answers.user_id = ?", userID).
		Group("questions.topic_id, topics.name").
		Scan(&topicStats).Error

	if err != nil || len(topicStats) == 0 {
		return []gin.H{}
	}

	result := make([]gin.H, 0, len(topicStats))
	for _, ts := range topicStats {
		mastery := float64(0)
		if ts.Attempted > 0 {
			mastery = (float64(ts.Correct) / float64(ts.Attempted)) * 100
		}

		result = append(result, gin.H{
			"topic_id":            ts.TopicID.String(),
			"topic_name":          ts.TopicName,
			"questions_attempted": ts.Attempted,
			"questions_correct":   ts.Correct,
			"mastery_percentage":  mastery,
		})
	}

	return result
}

// calculateWeakTopics identifies topics where user scores < 70%
func (h *DashboardHandler) calculateWeakTopics(userID uuid.UUID) []gin.H {
	type WeakTopicStats struct {
		TopicID   uuid.UUID
		TopicName string
		Attempted int
		Correct   int
	}

	var weakStats []WeakTopicStats
	err := h.db.Table("user_answers").
		Select("questions.topic_id, topics.name as topic_name, COUNT(*) as attempted, SUM(CASE WHEN user_answers.is_correct THEN 1 ELSE 0 END) as correct").
		Joins("JOIN questions ON user_answers.question_id = questions.id").
		Joins("JOIN topics ON questions.topic_id = topics.id").
		Where("user_answers.user_id = ?", userID).
		Group("questions.topic_id, topics.name").
		Having("COUNT(*) > 0").
		Scan(&weakStats).Error

	if err != nil || len(weakStats) == 0 {
		return []gin.H{}
	}

	weakTopics := make([]gin.H, 0)
	for _, ws := range weakStats {
		score := float64(0)
		if ws.Attempted > 0 {
			score = (float64(ws.Correct) / float64(ws.Attempted)) * 100
		}

		if score < 70.0 {
			recommendedPractice := 10
			if score < 50 {
				recommendedPractice = 20
			}

			weakTopics = append(weakTopics, gin.H{
				"name":                 ws.TopicName,
				"score":                score,
				"questions_attempted":  ws.Attempted,
				"recommended_practice": recommendedPractice,
			})
		}
	}

	return weakTopics
}

// getRecentActivity fetches user's recent study activities
func (h *DashboardHandler) getRecentActivity(userID uuid.UUID) []gin.H {
	activities := make([]gin.H, 0, 20)

	// Get recent practice test completions
	var recentTests []models.PracticeTest
	if err := h.db.Where("user_id = ? AND status = ?", userID, "completed").
		Order("completed_at DESC").
		Limit(5).
		Find(&recentTests).Error; err == nil {

		for _, test := range recentTests {
			if test.CompletedAt != nil {
				description := "Completed practice test"
				if test.Score >= 80 {
					description = "Completed practice test with excellent score"
				} else if test.Score >= 65 {
					description = "Completed practice test with passing score"
				}

				activities = append(activities, gin.H{
					"id":          test.ID.String(),
					"type":        "test_completed",
					"description": description,
					"timestamp":   test.CompletedAt.Format(time.RFC3339),
					"metadata": gin.H{
						"score":           test.Score,
						"total_questions": test.TotalQuestions,
					},
				})
			}
		}
	}

	// Get recent question answers
	var recentAnswers []models.UserAnswer
	if err := h.db.Where("user_id = ?", userID).
		Preload("Question.Topic").
		Order("created_at DESC").
		Limit(10).
		Find(&recentAnswers).Error; err == nil {

		for _, answer := range recentAnswers {
			description := "Answered practice question"
			if answer.IsCorrect {
				description = "Answered practice question correctly"
			}

			topicName := "Unknown"
			if answer.Question != nil && answer.Question.Topic != nil {
				topicName = answer.Question.Topic.Name
			}

			activities = append(activities, gin.H{
				"id":          answer.ID.String(),
				"type":        "question",
				"description": description,
				"timestamp":   answer.CreatedAt.Format(time.RFC3339),
				"metadata": gin.H{
					"is_correct": answer.IsCorrect,
					"topic":      topicName,
				},
			})
		}
	}

	if len(activities) > 20 {
		activities = activities[:20]
	}

	return activities
}

// GetAnalytics returns performance analytics
func (h *DashboardHandler) GetAnalytics(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get analytics endpoint"})
}

// GetWeaknesses returns weakness report
func (h *DashboardHandler) GetWeaknesses(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get weaknesses endpoint"})
}

// GetAdminStatistics returns admin statistics
func (h *DashboardHandler) GetAdminStatistics(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get admin statistics endpoint (admin)"})
}
