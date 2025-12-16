package handlers

import (
	"fmt"
	"math"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/nppe-pro/api/internal/handlers/dto"
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
	rawUserID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}
	userID, ok := rawUserID.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id type"})
		return
	}

	// 1) Load user
	var user models.User
	if err := h.db.First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// 2) Load stats once
	stats := h.getUserStats(userID)

	// 3) Last test score
	lastScore := 0.0
	var lastTest models.PracticeTest
	if err := h.db.
		Where("user_id = ? AND status = ?", userID, "completed").
		Order("completed_at DESC").
		First(&lastTest).Error; err == nil {
		lastScore = h.roundToDecimalPlaces(lastTest.Score, 1)
	}

	// 4) Tests taken this month
	now := time.Now()
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())

	var testsThisMonth int64
	h.db.Model(&models.PracticeTest{}).
		Where("user_id = ? AND status = ? AND completed_at >= ?",
			userID, "completed", startOfMonth).
		Count(&testsThisMonth)

	// 5) Score improvement
	improvement := h.calculateScoreImprovement(userID)

	// 6) Recent tests + progression + achievements etc.
	recentTests := h.getRecentTestsWithDeltas(userID)
	scoreProgression := h.getScoreProgression(userID)
	recentAchievements := h.getRecentAchievements(userID)
	passReady := h.calculatePassReadiness(userID)
	examCountdown := h.calculateExamCountdown(user.ExamDate)
	recommendedTests := h.generateTestRecommendations(userID)
	almostThere := h.calculateAlmostThereSummary(userID, stats)

	// 7) Build response DTO
	resp := dto.DashboardResponse{
		UserName:  user.FirstName,
		LastScore: lastScore,
		TestsTaken: dto.TestsTakenBlock{
			Total:     stats.PracticeTestsTaken,
			ThisMonth: testsThisMonth,
		},
		AverageScore: dto.AverageScoreBlock{
			Current:     h.roundToDecimalPlaces(stats.AverageTestScore, 1),
			Improvement: h.roundToDecimalPlaces(improvement, 1),
		},
		StudyStreak: dto.StudyStreakBlock{
			Current: user.StudyStreak,
			Longest: user.LongestStreak,
		},
		PassReadyPercentage: h.roundToDecimalPlaces(passReady, 1),
		RecentTests:         recentTests,
		ScoreProgression:    scoreProgression,
		RecentAchievements:  recentAchievements,
		ExamCountdown: dto.ExamCountdownBlock{
			DaysLeft:     examCountdown["days_left"].(int),
			PrepTimeUsed: h.roundToDecimalPlaces(examCountdown["prep_time_used"].(float64), 1),
		},
		RecommendedTests:   recommendedTests,
		AlmostThereSummary: almostThere,
	}

	c.JSON(http.StatusOK, resp)
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

// Helper functions for the new GetDashboard implementation

func (h *DashboardHandler) getUserStats(userID uuid.UUID) models.UserStats {
	var stats models.UserStats
	if err := h.db.Where("user_id = ?", userID).First(&stats).Error; err != nil {
		// Create stats if they don't exist
		stats = models.UserStats{
			UserID:             userID,
			QuestionsCompleted: 0,
			QuestionsCorrect:   0,
			PracticeTestsTaken: 0,
			AverageTestScore:   0,
			TimeStudiedSeconds: 0,
		}
		h.db.Create(&stats)
	}
	return stats
}

func (h *DashboardHandler) calculateScoreImprovement(userID uuid.UUID) float64 {
	now := time.Now()
	thirtyDaysAgo := now.AddDate(0, 0, -30)
	sixtyDaysAgo := now.AddDate(0, 0, -60)

	var recentAvg, previousAvg float64

	h.db.Model(&models.PracticeTest{}).
		Where("user_id = ? AND status = ? AND completed_at >= ?",
			userID, "completed", thirtyDaysAgo).
		Select("AVG(score)").Scan(&recentAvg)

	h.db.Model(&models.PracticeTest{}).
		Where("user_id = ? AND status = ? AND completed_at BETWEEN ? AND ?",
			userID, "completed", sixtyDaysAgo, thirtyDaysAgo).
		Select("AVG(score)").Scan(&previousAvg)

	return recentAvg - previousAvg
}

func (h *DashboardHandler) getRecentTestsWithDeltas(userID uuid.UUID) []dto.RecentTestItem {
	var tests []models.PracticeTest
	h.db.Where("user_id = ? AND status = ?", userID, "completed").
		Order("completed_at DESC").
		Limit(5).
		Find(&tests)

	result := make([]dto.RecentTestItem, len(tests))

	for i, test := range tests {
		var prevTest models.PracticeTest
		delta := 0.0

		if err := h.db.Where("user_id = ? AND status = ? AND completed_at < ?",
			userID, "completed", test.CompletedAt).
			Order("completed_at DESC").
			First(&prevTest).Error; err == nil {
			delta = test.Score - prevTest.Score
		}

		result[i] = dto.RecentTestItem{
			ID:         test.ID.String(),
			Name:       h.formatTestName(test.TestType),
			Date:       test.CompletedAt.Format("2006-01-02"),
			Duration:   h.formatDuration(test.TimeSpentSeconds),
			Questions:  test.TotalQuestions,
			Score:      h.roundToDecimalPlaces(test.Score, 1),
			Delta:      h.roundToDecimalPlaces(delta, 1),
			ReviewLink: fmt.Sprintf("/tests/%s/review", test.ID.String()),
		}
	}

	return result
}

func (h *DashboardHandler) getScoreProgression(userID uuid.UUID) []dto.ScorePoint {
	var tests []models.PracticeTest
	h.db.Where("user_id = ? AND status = ?", userID, "completed").
		Order("completed_at ASC").
		Limit(10).
		Find(&tests)

	result := make([]dto.ScorePoint, len(tests))
	for i, test := range tests {
		result[i] = dto.ScorePoint{
			Label: fmt.Sprintf("Test #%d", i+1),
			Score: h.roundToDecimalPlaces(test.Score, 1),
		}
	}
	return result
}

func (h *DashboardHandler) getRecentAchievements(userID uuid.UUID) []dto.AchievementItem {
	var achievements []models.Achievement
	h.db.Where("user_id = ?", userID).
		Order("earned_at DESC").
		Limit(5).
		Find(&achievements)

	result := make([]dto.AchievementItem, len(achievements))
	for i, achievement := range achievements {
		result[i] = dto.AchievementItem{
			Title:       achievement.Title,
			Description: achievement.Description,
			Icon:        achievement.Icon,
			EarnedAt:    achievement.EarnedAt.Format("2006-01-02"),
		}
	}
	return result
}

func (h *DashboardHandler) calculatePassReadiness(userID uuid.UUID) float64 {
	var stats models.UserStats
	if err := h.db.Where("user_id = ?", userID).First(&stats).Error; err != nil {
		return 0.0
	}

	// Simple calculation based on test scores and completion
	if stats.PracticeTestsTaken == 0 {
		return 0.0
	}

	score := stats.AverageTestScore
	completion := float64(stats.QuestionsCompleted) / 500.0
	if completion > 1.0 {
		completion = 1.0
	}

	return (score * 0.7) + (completion * 30.0)
}

func (h *DashboardHandler) calculateExamCountdown(examDate *time.Time) map[string]interface{} {
	if examDate == nil {
		return map[string]interface{}{
			"days_left":      0,
			"prep_time_used": 0.0,
		}
	}

	daysLeft := int(time.Until(*examDate).Hours() / 24)
	if daysLeft < 0 {
		daysLeft = 0
	}

	// Prep time used calculation (simplified)
	prepTimeUsed := 0.0 // TODO: implement based on actual study time

	return map[string]interface{}{
		"days_left":      daysLeft,
		"prep_time_used": prepTimeUsed,
	}
}

func (h *DashboardHandler) generateTestRecommendations(userID uuid.UUID) []dto.RecommendedTest {
	// Simple recommendations based on user performance
	recommendations := []dto.RecommendedTest{
		{
			Title:       "Full Practice Exam",
			Questions:   110,
			Duration:    "180 min",
			Difficulty:  "Mixed",
			Focus:       "Complete NPPE simulation",
			Recommended: true,
		},
		{
			Title:       "Weak Topics Review",
			Questions:   20,
			Duration:    "30 min",
			Difficulty:  "Adaptive",
			Focus:       "Areas needing improvement",
			Recommended: false,
		},
	}

	return recommendations
}

func (h *DashboardHandler) calculateAlmostThereSummary(userID uuid.UUID, stats models.UserStats) dto.AlmostThereSummaryBlock {
	var testCount int64
	h.db.Model(&models.PracticeTest{}).
		Where("user_id = ? AND status = ?", userID, "completed").
		Count(&testCount)

	improvement := h.calculateScoreImprovement(userID)

	var achievementCount int64
	h.db.Model(&models.Achievement{}).
		Where("user_id = ?", userID).
		Count(&achievementCount)

	return dto.AlmostThereSummaryBlock{
		TestsCompleted:     int(testCount),
		ImprovementPercent: h.roundToDecimalPlaces(improvement, 1),
		AchievementsCount:  int(achievementCount),
	}
}

// Utility functions

func (h *DashboardHandler) formatTestName(testType string) string {
	switch testType {
	case "full_exam":
		return "Full Practice Exam"
	case "topic_specific":
		return "Topic-Specific Test"
	case "custom":
		return "Custom Test"
	default:
		return "Practice Test"
	}
}

func (h *DashboardHandler) formatDuration(seconds int) string {
	minutes := seconds / 60
	if minutes < 60 {
		return fmt.Sprintf("%d min", minutes)
	}
	hours := minutes / 60
	remainingMinutes := minutes % 60
	return fmt.Sprintf("%dh %dm", hours, remainingMinutes)
}

// roundToDecimalPlaces rounds a float64 to the specified number of decimal places
func (h *DashboardHandler) roundToDecimalPlaces(value float64, decimals int) float64 {
	multiplier := math.Pow(10, float64(decimals))
	return math.Round(value*multiplier) / multiplier
}
