package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/nppe-pro/api/config"
	"github.com/nppe-pro/api/internal/models"
	"gorm.io/gorm"
)

type SubscriptionHandler struct {
	db     *gorm.DB
	config *config.Config
}

func NewSubscriptionHandler(db *gorm.DB, cfg *config.Config) *SubscriptionHandler {
	return &SubscriptionHandler{
		db:     db,
		config: cfg,
	}
}

type CreateSubscriptionRequest struct {
	Plan            string  `json:"plan" binding:"required,oneof=monthly annual"`
	PaymentMethodID string  `json:"payment_method_id" binding:"required"`
	CouponCode      *string `json:"coupon_code,omitempty"`
}

// CreateSubscription creates a new Stripe subscription
func (h *SubscriptionHandler) CreateSubscription(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req CreateSubscriptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user
	var user models.User
	if err := h.db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Determine base amount
	var amount int
	switch req.Plan {
	case "monthly":
		amount = 2999 // $29.99 in cents
	case "annual":
		amount = 29999 // $299.99 in cents
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid plan"})
		return
	}

	// Validate coupon if provided
	var coupon *models.Coupon
	var discountAmount int
	if req.CouponCode != nil && *req.CouponCode != "" {
		if err := h.db.Where("code = ? AND is_active = true", *req.CouponCode).First(&coupon).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid coupon code"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to validate coupon"})
			return
		}

		now := time.Now()
		if now.Before(coupon.ValidFrom) || now.After(coupon.ValidUntil) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Coupon is not valid at this time"})
			return
		}

		if coupon.MaxUses != -1 && coupon.UsedCount >= coupon.MaxUses {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Coupon has reached maximum uses"})
			return
		}

		// Check if user already used this coupon
		var existingUsage models.CouponUsage
		if err := h.db.Where("coupon_id = ? AND user_id = ?", coupon.ID, userID).First(&existingUsage).Error; err == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Coupon already used by this user"})
			return
		}

		// Calculate discount
		if coupon.DiscountType == "percentage" {
			discountAmount = int(float64(amount) * (coupon.DiscountValue / 100))
		} else if coupon.DiscountType == "fixed" {
			discountAmount = int(coupon.DiscountValue * 100) // assuming fixed is in dollars
		}
		if discountAmount > amount {
			discountAmount = amount
		}
	}

	// Check if user already has active subscription
	var existingSub models.Subscription
	err := h.db.Where("user_id = ? AND status = ?", userID, "active").First(&existingSub).Error
	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User already has an active subscription"})
		return
	}

	// STRIPE INTEGRATION PLACEHOLDER
	// In production, integrate with Stripe:
	// 1. Create or get Stripe customer
	// 2. Attach payment method
	// 3. Create Stripe subscription
	// 4. Store subscription in database

	// For now, create a mock subscription for testing
	now := time.Now()
	var periodEnd time.Time

	switch req.Plan {
	case "monthly":
		periodEnd = now.AddDate(0, 1, 0)
	case "annual":
		periodEnd = now.AddDate(1, 0, 0)
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid plan"})
		return
	}

	subscription := models.Subscription{
		UserID:               userID.(uuid.UUID),
		Plan:                 req.Plan,
		Status:               "active",
		StripeCustomerID:     fmt.Sprintf("cus_mock_%s", userID),
		StripeSubscriptionID: fmt.Sprintf("sub_mock_%s", uuid.New().String()),
		CurrentPeriodStart:   now,
		CurrentPeriodEnd:     periodEnd,
		CancelAtPeriodEnd:    false,
	}

	// Create subscription
	if err := h.db.Create(&subscription).Error; err != nil {
		log.Printf("Error creating subscription: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create subscription"})
		return
	}

	// Apply discount if coupon used
	finalAmount := amount - discountAmount

	// Create payment record
	payment := models.Payment{
		UserID:          userID.(uuid.UUID),
		SubscriptionID:  subscription.ID,
		Amount:          finalAmount,
		Currency:        "CAD",
		Status:          "succeeded",
		StripePaymentID: fmt.Sprintf("pi_mock_%s", uuid.New().String()),
		Description:     fmt.Sprintf("NPPE Pro %s subscription", req.Plan),
	}

	if err := h.db.Create(&payment).Error; err != nil {
		log.Printf("Error creating payment: %v", err)
		// Don't fail the request if payment record fails
	}

	// Record coupon usage if coupon was applied
	if coupon != nil {
		couponUsage := models.CouponUsage{
			CouponID: coupon.ID,
			UserID:   userID.(uuid.UUID),
			OrderID:  &payment.ID,
			UsedAt:   now,
		}
		if err := h.db.Create(&couponUsage).Error; err != nil {
			log.Printf("Error recording coupon usage: %v", err)
			// Don't fail the request
		}
		// Increment used count
		h.db.Model(coupon).Update("used_count", coupon.UsedCount+1)
	}

	// Update user's subscription_id
	h.db.Model(&user).Update("subscription_id", subscription.ID)

	c.JSON(http.StatusOK, subscription)
}

// GetSubscription returns the current user's subscription
func (h *SubscriptionHandler) GetSubscription(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var subscription models.Subscription
	err := h.db.Where("user_id = ?", userID).First(&subscription).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Return free plan as default
			c.JSON(http.StatusOK, gin.H{
				"plan":   "free",
				"status": "active",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch subscription"})
		return
	}

	c.JSON(http.StatusOK, subscription)
}

// CancelSubscription cancels the user's subscription
func (h *SubscriptionHandler) CancelSubscription(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var subscription models.Subscription
	if err := h.db.Where("user_id = ? AND status = ?", userID, "active").First(&subscription).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "No active subscription found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch subscription"})
		return
	}

	// STRIPE INTEGRATION PLACEHOLDER
	// In production:
	// 1. Call Stripe API to cancel subscription at period end
	// 2. Update database based on Stripe response

	// For now, mark as cancelled
	now := time.Now()
	updates := map[string]interface{}{
		"cancel_at_period_end": true,
		"cancelled_at":         &now,
	}

	if err := h.db.Model(&subscription).Updates(updates).Error; err != nil {
		log.Printf("Error cancelling subscription: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cancel subscription"})
		return
	}

	// Create notification
	// TODO: Implement notification creation

	c.JSON(http.StatusOK, gin.H{
		"message": "Subscription cancelled successfully. Access will continue until " + subscription.CurrentPeriodEnd.Format("2006-01-02"),
	})
}

// StripeWebhook handles Stripe webhook events
func (h *SubscriptionHandler) StripeWebhook(c *gin.Context) {
	// STRIPE INTEGRATION PLACEHOLDER
	// In production:
	// 1. Verify webhook signature
	// 2. Parse event type
	// 3. Handle different events:
	//    - customer.subscription.updated
	//    - customer.subscription.deleted
	//    - invoice.payment_succeeded
	//    - invoice.payment_failed

	// Read request body
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Parse event
	var event struct {
		Type string          `json:"type"`
		Data json.RawMessage `json:"data"`
	}

	if err := json.Unmarshal(body, &event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
		return
	}

	log.Printf("Received Stripe webhook: %s", event.Type)

	// Handle events
	switch event.Type {
	case "customer.subscription.updated":
		// Update subscription status in database
		log.Println("Subscription updated")

	case "customer.subscription.deleted":
		// Mark subscription as cancelled
		log.Println("Subscription deleted")

	case "invoice.payment_succeeded":
		// Create payment record
		log.Println("Payment succeeded")

	case "invoice.payment_failed":
		// Update subscription status to past_due
		log.Println("Payment failed")

	default:
		log.Printf("Unhandled event type: %s", event.Type)
	}

	// Return 200 OK to acknowledge receipt
	c.JSON(http.StatusOK, gin.H{"received": true})
}
