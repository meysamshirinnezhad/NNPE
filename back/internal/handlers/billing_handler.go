package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nppe-pro/api/config"
	"github.com/nppe-pro/api/internal/models"
	"gorm.io/gorm"
)

type BillingHandler struct {
	db     *gorm.DB
	config *config.Config
}

func NewBillingHandler(db *gorm.DB, cfg *config.Config) *BillingHandler {
	return &BillingHandler{
		db:     db,
		config: cfg,
	}
}

type CreateCheckoutSessionRequest struct {
	PriceID    string `json:"price_id" binding:"required"`
	SuccessURL string `json:"success_url" binding:"required"`
	CancelURL  string `json:"cancel_url" binding:"required"`
}

// CreateCheckoutSession creates a Stripe checkout session for verified users
// @Summary Create checkout session
// @Description Create Stripe checkout session for exam credits
// @Tags billing
// @Accept json
// @Produce json
// @Param request body CreateCheckoutSessionRequest true "Checkout session details"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Router /billing/create-checkout-session [post]
func (h *BillingHandler) CreateCheckoutSession(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req CreateCheckoutSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify user is authenticated and verified
	var user models.User
	if err := h.db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if !user.IsVerified {
		c.JSON(http.StatusForbidden, gin.H{
			"error":   "EMAIL_NOT_VERIFIED",
			"message": "Email verification required to purchase exam credits",
		})
		return
	}

	// TODO: Implement actual Stripe checkout session creation
	// For now, return a placeholder response
	c.JSON(http.StatusOK, gin.H{
		"message": "Checkout session creation not yet implemented",
		"user_id": userID,
	})
}

// GetCheckoutSession retrieves a checkout session details
// @Summary Get checkout session
// @Description Retrieve checkout session information
// @Tags billing
// @Produce json
// @Param session_id path string true "Stripe session ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Router /billing/checkout-session/{session_id} [get]
func (h *BillingHandler) GetCheckoutSession(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Checkout session retrieval not yet implemented"})
}
