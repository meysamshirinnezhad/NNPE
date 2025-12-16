package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/nppe-pro/api/config"
	"github.com/nppe-pro/api/internal/models"
	"github.com/nppe-pro/api/pkg/database"
	"github.com/nppe-pro/api/pkg/middleware"
	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/webhook"
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

	var user models.User
	if err := h.db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":                 user.ID,
		"email":              user.Email,
		"first_name":         user.FirstName,
		"last_name":          user.LastName,
		"province":           user.Province,
		"is_verified":        user.IsVerified,
		"is_admin":           user.IsAdmin,
		"exam_attempts_left": user.ExamAttemptsLeft,
		"access_expires_at":  user.AccessExpiresAt,
		"avatar_url":         user.AvatarURL,
		"created_at":         user.CreatedAt,
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

// ListPayments returns all Stripe payments (admin only)
func (h *UserHandler) ListPayments(c *gin.Context) {
	var payments []models.StripePayment

	// Get recent payments
	if err := h.db.Order("created_at DESC").
		Limit(100).
		Find(&payments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch payments"})
		return
	}

	// Load user information for each payment
	safePayments := make([]gin.H, len(payments))
	for i, payment := range payments {
		var user models.User
		userEmail := payment.CustomerEmail // Default to stored email
		
		// Try to load user if UserID is set
		if payment.UserID != uuid.Nil {
			if err := h.db.Select("email").First(&user, payment.UserID).Error; err == nil {
				userEmail = user.Email
			}
		}

		safePayments[i] = gin.H{
			"id":                  payment.ID,
			"user_id":             payment.UserID,
			"user_email":          userEmail,
			"checkout_session_id": payment.CheckoutSessionID,
			"amount":              payment.Amount,
			"currency":            payment.Currency,
			"status":              payment.Status,
			"source":              payment.Source,
			"processed_at":        payment.ProcessedAt,
			"created_at":          payment.CreatedAt,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"payments": safePayments,
		"total":    len(payments),
	})
}

// GetPaymentSummary returns payment summary statistics (admin only)
func (h *UserHandler) GetPaymentSummary(c *gin.Context) {
	var summary struct {
		TotalPayments   int64   `json:"total_payments"`
		TotalRevenue    int64   `json:"total_revenue"` // in cents
		SuccessfulCount int64   `json:"successful_count"`
		PendingCount    int64   `json:"pending_count"`
		FailedCount     int64   `json:"failed_count"`
		CreditsGranted  int64   `json:"credits_granted"`
		AverageAmount   float64 `json:"average_amount"`
	}

	// Get payment counts and revenue
	h.db.Model(&models.StripePayment{}).Count(&summary.TotalPayments)
	h.db.Model(&models.StripePayment{}).Where("status = ?", "succeeded").Count(&summary.SuccessfulCount)
	h.db.Model(&models.StripePayment{}).Where("status = ?", "pending").Count(&summary.PendingCount)
	h.db.Model(&models.StripePayment{}).Where("status = ?", "failed").Count(&summary.FailedCount)

	// Calculate total revenue and average (only successful payments)
	var totalRevenue int64
	var successfulPayments []models.StripePayment
	h.db.Where("status = ?", "succeeded").Find(&successfulPayments)

	for _, payment := range successfulPayments {
		totalRevenue += payment.Amount
	}
	summary.TotalRevenue = totalRevenue

	if summary.SuccessfulCount > 0 {
		summary.AverageAmount = float64(totalRevenue) / float64(summary.SuccessfulCount) / 100.0 // Convert to dollars
	}

	// Calculate credits granted (each successful payment grants 3 credits)
	summary.CreditsGranted = summary.SuccessfulCount * 3

	c.JSON(http.StatusOK, summary)
}

// StripeWebhook handles Stripe webhook events with full security
func (h *UserHandler) StripeWebhook(c *gin.Context) {
	const MaxBodyBytes = int64(65536)
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, MaxBodyBytes)

	payload, err := io.ReadAll(c.Request.Body)
	if err != nil {
		log.Printf("[STRIPE-WEBHOOK] Error reading request body: %v", err)
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Error reading request body"})
		return
	}

	// Verify webhook signature
	endpointSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")
	if endpointSecret == "" {
		log.Printf("[STRIPE-WEBHOOK] ERROR: STRIPE_WEBHOOK_SECRET not configured")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Webhook secret not configured"})
		return
	}

	sig := c.GetHeader("Stripe-Signature")
	if sig == "" {
		log.Printf("[STRIPE-WEBHOOK] ERROR: Missing Stripe-Signature header")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing signature"})
		return
	}

	event, err := webhook.ConstructEvent(payload, sig, endpointSecret)
	if err != nil {
		log.Printf("[STRIPE-WEBHOOK] ERROR: Webhook signature verification failed: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Webhook signature verification failed"})
		return
	}

	log.Printf("[STRIPE-WEBHOOK] Received event: %s for account: %s", event.Type, event.Account)

	// Handle the event
	switch event.Type {
	case "checkout.session.completed":
		err = h.handleSuccessfulPayment(c, event)
		if err != nil {
			log.Printf("[STRIPE-WEBHOOK] ERROR: Failed to process payment: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error processing payment"})
			return
		}
		log.Printf("[STRIPE-WEBHOOK] Successfully processed checkout.session.completed")
	default:
		log.Printf("[STRIPE-WEBHOOK] INFO: Unhandled event type: %s", event.Type)
	}

	c.JSON(http.StatusOK, gin.H{"received": true})
}

// handleSuccessfulPayment processes a successful Stripe payment with idempotency
func (h *UserHandler) handleSuccessfulPayment(c *gin.Context, event stripe.Event) error {
	var session stripe.CheckoutSession
	if err := json.Unmarshal(event.Data.Raw, &session); err != nil {
		return fmt.Errorf("failed to parse checkout session: %w", err)
	}

	// Extract customer email with fallback logic
	customerEmail := h.extractCustomerEmail(session)
	if customerEmail == "" {
		log.Printf("[STRIPE-WEBHOOK] ERROR: No customer email found for session %s", session.ID)
		return fmt.Errorf("customer email required but not found")
	}

	// Start database transaction for atomicity
	tx := h.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Check idempotency - has this session already been processed?
	var existingPayment models.StripePayment
	err := tx.Where("checkout_session_id = ?", session.ID).First(&existingPayment).Error
	if err == nil {
		// Already processed - this is a webhook retry
		log.Printf("[STRIPE-WEBHOOK] INFO: Session %s already processed, skipping (idempotent)", session.ID)
		tx.Rollback()
		return nil
	} else if err != gorm.ErrRecordNotFound {
		return fmt.Errorf("database error checking existing payment: %w", err)
	}

	// Find or create user by email
	var user models.User
	err = tx.Where("email = ?", strings.ToLower(customerEmail)).First(&user).Error
	if err == gorm.ErrRecordNotFound {
		// Create new user account
		user = models.User{
			Email:            strings.ToLower(customerEmail),
			PasswordHash:     "",    // Will be set when user first logs in
			FirstName:        "Stripe",
			LastName:         "Customer",
			Province:         "Unknown",
			IsVerified:       true, // Trust Stripe-verified email
			ExamAttemptsLeft: 0,
		}
		if err := tx.Create(&user).Error; err != nil {
			return fmt.Errorf("failed to create user: %w", err)
		}
		log.Printf("[STRIPE-WEBHOOK] INFO: Created new user for %s", customerEmail)
	} else if err != nil {
		return fmt.Errorf("failed to find user: %w", err)
	}

	// Grant credits using the same logic as coupons
	if err := h.grantExamCredits(tx, user.ID); err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to grant credits: %w", err)
	}

	// Record the payment
	payment := models.StripePayment{
		UserID:            user.ID,
		CheckoutSessionID: session.ID,
		PaymentIntentID:   session.PaymentIntent.ID,
		Amount:            session.AmountTotal,
		Currency:          string(session.Currency),
		Status:            "succeeded",
		CustomerEmail:     customerEmail,
		Source:            "stripe",
		ProcessedAt:       time.Now(),
	}

	if err := tx.Create(&payment).Error; err != nil {
		return fmt.Errorf("failed to record payment: %w", err)
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	log.Printf("[STRIPE-WEBHOOK] SUCCESS: Processed payment for %s, granted 3 credits, expires in 30 days", customerEmail)
	return nil
}

// extractCustomerEmail extracts customer email with fallback logic
func (h *UserHandler) extractCustomerEmail(session stripe.CheckoutSession) string {
	// First try session.CustomerEmail
	if session.CustomerEmail != "" {
		return session.CustomerEmail
	}

	// Then try session.CustomerDetails.Email
	if session.CustomerDetails != nil && session.CustomerDetails.Email != "" {
		return session.CustomerDetails.Email
	}

	// Finally try to get from expanded customer object (if available)
	if session.Customer != nil {
		// Note: In production, you might need to fetch customer details from Stripe API
		// This would require additional Stripe API calls
		log.Printf("[STRIPE-WEBHOOK] WARNING: Customer email not found in session or customer details")
	}

	return ""
}

// grantExamCredits grants 3 exam credits with proper expiry extension
func (h *UserHandler) grantExamCredits(tx *gorm.DB, userID uuid.UUID) error {
	var user models.User
	if err := tx.First(&user, userID).Error; err != nil {
		return fmt.Errorf("failed to fetch user: %w", err)
	}

	now := time.Now()
	var newExpiry time.Time

	// Calculate new expiry: max(now, currentExpiry) + 30 days
	if user.AccessExpiresAt != nil && now.Before(*user.AccessExpiresAt) {
		// Current access is still valid, extend from current expiry
		newExpiry = user.AccessExpiresAt.AddDate(0, 0, 30)
		log.Printf("[STRIPE-WEBHOOK] INFO: Extending existing access from %v", *user.AccessExpiresAt)
	} else {
		// Current access expired or doesn't exist, start from now
		newExpiry = now.AddDate(0, 0, 30)
		log.Printf("[STRIPE-WEBHOOK] INFO: Starting new access period from %v", now)
	}

	// Increment credits by 3 (NOT reset to 3)
	newAttemptsLeft := user.ExamAttemptsLeft + 3

	updates := map[string]interface{}{
		"exam_attempts_left": newAttemptsLeft,
		"access_expires_at":  newExpiry,
	}

	if err := tx.Model(&user).Updates(updates).Error; err != nil {
		return fmt.Errorf("failed to update user credits: %w", err)
	}

	log.Printf("[STRIPE-WEBHOOK] INFO: User %s now has %d credits, expires at %v",
		user.Email, newAttemptsLeft, newExpiry)

	return nil
}