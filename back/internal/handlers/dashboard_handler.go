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
		"recommended_study_time_daily": 90, // Default recommendation
		"topic_mastery":                []gin.H{},
		"weak_topics":                  []gin.H{},
		"recent_activity":              []gin.H{},
	})
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
