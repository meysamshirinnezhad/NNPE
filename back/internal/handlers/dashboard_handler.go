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
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var user models.User
	if err := h.db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var stats models.UserStats
	if err := h.db.Where("user_id = ?", userID).First(&stats).Error; err != nil {
		stats = models.UserStats{
			UserID: userID.(uuid.UUID),
		}
	}

	var accuracyRate float64
	if stats.QuestionsCompleted > 0 {
		accuracyRate = (float64(stats.QuestionsCorrect) / float64(stats.QuestionsCompleted)) * 100
	}

	overallProgress := 0
	if stats.QuestionsCompleted > 0 {
		overallProgress = int((float64(stats.QuestionsCompleted) / 500.0) * 100)
		if overallProgress > 100 {
			overallProgress = 100
		}
	}

	daysUntilExam := 0
	if user.ExamDate != nil {
		daysUntil := int(time.Until(*user.ExamDate).Hours() / 24)
		if daysUntil > 0 {
			daysUntilExam = daysUntil
		}
	}

	passProbability := 0
	if accuracyRate > 0 {
		passProbability = int((accuracyRate * 0.7) + (float64(overallProgress) * 0.3))
		if passProbability > 100 {
			passProbability = 100
		}
	}

	topicMastery := h.calculateTopicMastery(userID.(uuid.UUID))
	weakTopics := h.calculateWeakTopics(userID.(uuid.UUID))
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

func (h *DashboardHandler) getRecentActivity(userID uuid.UUID) []gin.H {
	activities := make([]gin.H, 0, 20)

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

// GetAnalytics returns performance analytics with time-series data
func (h *DashboardHandler) GetAnalytics(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	timeframe := c.DefaultQuery("timeframe", "30d")

	var startDate time.Time
	now := time.Now()

	switch timeframe {
	case "7d":
		startDate = now.AddDate(0, 0, -7)
	case "30d":
		startDate = now.AddDate(0, 0, -30)
	case "90d":
		startDate = now.AddDate(0, 0, -90)
	case "all":
		startDate = time.Time{}
	default:
		startDate = now.AddDate(0, 0, -30)
		timeframe = "30d"
	}

	// Questions per day
	type DailyMetric struct {
		Date  string `json:"date"`
		Value int    `json:"value"`
	}

	var questionsPerDay []DailyMetric
	h.db.Table("user_answers").
		Select("DATE(created_at) as date, COUNT(*) as value").
		Where("user_id = ? AND created_at >= ?", userID, startDate).
		Group("DATE(created_at)").
		Order("date ASC").
		Scan(&questionsPerDay)

	// Accuracy trend
	var accuracyTrend []struct {
		Date  string  `json:"date"`
		Value float64 `json:"value"`
	}
	h.db.Table("user_answers").
		Select("DATE(created_at) as date, (SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::float / COUNT(*)::float * 100) as value").
		Where("user_id = ? AND created_at >= ?", userID, startDate).
		Group("DATE(created_at)").
		Having("COUNT(*) > 0").
		Order("date ASC").
		Scan(&accuracyTrend)

	// Time spent per day (minutes)
	var timeSpentPerDay []struct {
		Date  string  `json:"date"`
		Value float64 `json:"value"`
	}
	h.db.Table("user_answers").
		Select("DATE(created_at) as date, (SUM(time_spent_seconds)::float / 60.0) as value").
		Where("user_id = ? AND created_at >= ?", userID, startDate).
		Group("DATE(created_at)").
		Order("date ASC").
		Scan(&timeSpentPerDay)

	// Topic breakdown
	type TopicBreakdown struct {
		TopicName        string  `json:"topic_name"`
		TotalQuestions   int     `json:"total_questions"`
		Correct          int     `json:"correct"`
		Incorrect        int     `json:"incorrect"`
		Accuracy         float64 `json:"accuracy"`
		TimeSpentMinutes float64 `json:"time_spent_minutes"`
	}

	var topicBreakdown []TopicBreakdown
	h.db.Table("user_answers").
		Select(`
			topics.name as topic_name,
			COUNT(*) as total_questions,
			SUM(CASE WHEN user_answers.is_correct THEN 1 ELSE 0 END) as correct,
			SUM(CASE WHEN NOT user_answers.is_correct THEN 1 ELSE 0 END) as incorrect,
			(SUM(CASE WHEN user_answers.is_correct THEN 1 ELSE 0 END)::float / COUNT(*)::float * 100) as accuracy,
			(SUM(user_answers.time_spent_seconds)::float / 60.0) as time_spent_minutes
		`).
		Joins("JOIN questions ON user_answers.question_id = questions.id").
		Joins("JOIN topics ON questions.topic_id = topics.id").
		Where("user_answers.user_id = ? AND user_answers.created_at >= ?", userID, startDate).
		Group("topics.name").
		Scan(&topicBreakdown)

	c.JSON(http.StatusOK, gin.H{
		"timeframe":           timeframe,
		"questions_per_day":   questionsPerDay,
		"accuracy_trend":      accuracyTrend,
		"time_spent_per_day":  timeSpentPerDay,
		"topic_breakdown":     topicBreakdown,
	})
}

// GetWeaknesses returns detailed weakness report with sub-topics
func (h *DashboardHandler) GetWeaknesses(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	type WeakTopicDetailed struct {
		TopicID   uuid.UUID
		TopicName string
		Attempted int
		Correct   int
	}

	var weakStats []WeakTopicDetailed
	err := h.db.Table("user_answers").
		Select("questions.topic_id, topics.name as topic_name, COUNT(*) as attempted, SUM(CASE WHEN user_answers.is_correct THEN 1 ELSE 0 END) as correct").
		Joins("JOIN questions ON user_answers.question_id = questions.id").
		Joins("JOIN topics ON questions.topic_id = topics.id").
		Where("user_answers.user_id = ?", userID).
		Group("questions.topic_id, topics.name").
		Having("COUNT(*) > 0").
		Scan(&weakStats).Error

	if err != nil || len(weakStats) == 0 {
		c.JSON(http.StatusOK, gin.H{"weak_topics": []gin.H{}})
		return
	}

	weakTopics := make([]gin.H, 0)
	for _, ws := range weakStats {
		score := float64(0)
		if ws.Attempted > 0 {
			score = (float64(ws.Correct) / float64(ws.Attempted)) * 100
		}

		if score < 70.0 {
			// Get sub-topic breakdown
			type SubTopicScore struct {
				SubTopicName string
				Attempted    int
				Correct      int
				Score        float64
			}

			var subTopics []SubTopicScore
			h.db.Table("user_answers").
				Select("sub_topics.name as sub_topic_name, COUNT(*) as attempted, SUM(CASE WHEN user_answers.is_correct THEN 1 ELSE 0 END) as correct, (SUM(CASE WHEN user_answers.is_correct THEN 1 ELSE 0 END)::float / COUNT(*)::float * 100) as score").
				Joins("JOIN questions ON user_answers.question_id = questions.id").
				Joins("JOIN sub_topics ON questions.sub_topic_id = sub_topics.id").
				Where("user_answers.user_id = ? AND questions.topic_id = ?", userID, ws.TopicID).
				Group("sub_topics.name").
				Having("COUNT(*) > 0").
				Scan(&subTopics)

			subTopicsFormatted := make([]gin.H, 0, len(subTopics))
			for _, st := range subTopics {
				subTopicsFormatted = append(subTopicsFormatted, gin.H{
					"name":      st.SubTopicName,
					"attempted": st.Attempted,
					"correct":   st.Correct,
					"score":     st.Score,
				})
			}

			recommendedPractice := 10
			if score < 50 {
				recommendedPractice = 20
			} else if score < 60 {
				recommendedPractice = 15
			}

			weakTopics = append(weakTopics, gin.H{
				"name":                 ws.TopicName,
				"score":                score,
				"questions_attempted":  ws.Attempted,
				"sub_topics":           subTopicsFormatted,
				"recommended_practice": recommendedPractice,
			})
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"weak_topics": weakTopics,
	})
}

// GetAdminStatistics returns admin-level platform statistics
func (h *DashboardHandler) GetAdminStatistics(c *gin.Context) {
	// Verify admin role (should be done by middleware, but double-check)
	isAdmin, exists := c.Get("is_admin")
	if !exists || !isAdmin.(bool) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
		return
	}

	// Total users
	var totalUsers int64
	h.db.Model(&models.User{}).Count(&totalUsers)

	// Active users (last 30 days)
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)
	var activeUsers int64
	h.db.Model(&models.User{}).
		Where("last_study_date >= ?", thirtyDaysAgo).
		Count(&activeUsers)

	// Total questions
	var totalQuestions int64
	h.db.Model(&models.Question{}).Where("is_active = ?", true).Count(&totalQuestions)

	// Total tests taken
	var totalTests int64
	h.db.Model(&models.PracticeTest{}).Count(&totalTests)

	// Average test score
	var avgScore float64
	h.db.Model(&models.PracticeTest{}).
		Where("status = ?", "completed").
		Select("AVG(score)").
		Scan(&avgScore)

	// Total subscriptions
	var totalSubscriptions int64
	h.db.Model(&models.Subscription{}).Count(&totalSubscriptions)

	// Active subscriptions
	var activeSubscriptions int64
	h.db.Model(&models.Subscription{}).
		Where("status = ?", "active").
		Count(&activeSubscriptions)

	// Monthly revenue (last 30 days)
	var monthlyRevenue int64
	h.db.Model(&models.Payment{}).
		Where("created_at >= ? AND status = ?", thirtyDaysAgo, "succeeded").
		Select("SUM(amount)").
		Scan(&monthlyRevenue)

	// User growth (last 30 days)
	type UserGrowth struct {
		Date  string `json:"date"`
		Count int    `json:"count"`
	}
	var userGrowth []UserGrowth
	h.db.Table("users").
		Select("DATE(created_at) as date, COUNT(*) as count").
		Where("created_at >= ?", thirtyDaysAgo).
		Group("DATE(created_at)").
		Order("date ASC").
		Scan(&userGrowth)

	// Popular topics (by question attempts)
	type PopularTopic struct {
		Topic    string `json:"topic"`
		Attempts int    `json:"attempts"`
	}
	var popularTopics []PopularTopic
	h.db.Table("user_answers").
		Select("topics.name as topic, COUNT(*) as attempts").
		Joins("JOIN questions ON user_answers.question_id = questions.id").
		Joins("JOIN topics ON questions.topic_id = topics.id").
		Group("topics.name").
		Order("attempts DESC").
		Limit(10).
		Scan(&popularTopics)

	c.JSON(http.StatusOK, gin.H{
		"total_users":          totalUsers,
		"active_users_30d":     activeUsers,
		"total_questions":      totalQuestions,
		"total_tests_taken":    totalTests,
		"avg_test_score":       avgScore,
		"total_subscriptions":  totalSubscriptions,
		"active_subscriptions": activeSubscriptions,
		"monthly_revenue":      float64(monthlyRevenue) / 100.0, // Convert cents to dollars
		"user_growth":          userGrowth,
		"popular_topics":       popularTopics,
	})
}
