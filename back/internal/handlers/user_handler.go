package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nppe-pro/api/config"
	"github.com/nppe-pro/api/internal/models"
	"github.com/nppe-pro/api/pkg/database"
	"github.com/nppe-pro/api/pkg/middleware"
	"gorm.io/gorm"
)

type UserHandler struct {
	db     *gorm.DB
	redis  *database.RedisClient
	config *config.Config
}

func NewUserHandler(db *gorm.DB, redis *database.RedisClient, cfg *config.Config) *UserHandler {
	return &UserHandler{
		db:     db,
		redis:  redis,
		config: cfg,
	}
}

// GetProfile returns the current user's profile
func (h *UserHandler) GetProfile(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Get profile endpoint",
		"user_id": userID,
	})
}

// UpdateProfile updates user profile
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Update profile endpoint"})
}

// DeleteAccount soft deletes user account
func (h *UserHandler) DeleteAccount(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Delete account endpoint"})
}

// UploadAvatar handles avatar upload
func (h *UserHandler) UploadAvatar(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Upload avatar endpoint"})
}

// GetBookmarks returns user's bookmarked questions
func (h *UserHandler) GetBookmarks(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get bookmarks endpoint"})
}

// GetTestHistory returns user's practice test history
func (h *UserHandler) GetTestHistory(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
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

// GetStudyPath returns user's study path
func (h *UserHandler) GetStudyPath(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get study path endpoint"})
}

// CreateSubscription creates a new subscription
func (h *UserHandler) CreateSubscription(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Create subscription endpoint"})
}

// GetSubscription returns current subscription
func (h *UserHandler) GetSubscription(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get subscription endpoint"})
}

// CancelSubscription cancels the subscription
func (h *UserHandler) CancelSubscription(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Cancel subscription endpoint"})
}

// GetNotifications returns user notifications
func (h *UserHandler) GetNotifications(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get notifications endpoint"})
}

// MarkNotificationRead marks a notification as read
func (h *UserHandler) MarkNotificationRead(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Mark notification read endpoint"})
}

// UpdateNotificationSettings updates notification settings
func (h *UserHandler) UpdateNotificationSettings(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Update notification settings endpoint"})
}

// ListUsers returns all users (admin only)
func (h *UserHandler) ListUsers(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "List users endpoint (admin)"})
}

// StripeWebhook handles Stripe webhook events
func (h *UserHandler) StripeWebhook(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"received": true})
}
