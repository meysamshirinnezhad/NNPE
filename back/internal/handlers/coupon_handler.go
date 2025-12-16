package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/nppe-pro/api/config"
	"github.com/nppe-pro/api/internal/models"
	"gorm.io/gorm"
)

type CouponHandler struct {
	db     *gorm.DB
	config *config.Config
}

func NewCouponHandler(db *gorm.DB, cfg *config.Config) *CouponHandler {
	return &CouponHandler{
		db:     db,
		config: cfg,
	}
}

type CreateCouponRequest struct {
	Code        string    `json:"code" binding:"required"`
	Description string    `json:"description"`
	DiscountType string   `json:"discount_type" binding:"required,oneof=percentage fixed"`
	DiscountValue float64 `json:"discount_value" binding:"required,min=0"`
	MaxUses     int       `json:"max_uses"`
	ValidFrom   time.Time `json:"valid_from"`
	ValidUntil  time.Time `json:"valid_until" binding:"required"`
}

type RedeemCouponRequest struct {
	Code string `json:"code" binding:"required"`
}

// CreateCoupon creates a new coupon (admin only)
func (h *CouponHandler) CreateCoupon(c *gin.Context) {
	var req CreateCouponRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get admin user ID
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	if req.MaxUses == 0 {
		req.MaxUses = -1 // unlimited
	}

	coupon := models.Coupon{
		Code:         req.Code,
		Description:  req.Description,
		DiscountType: req.DiscountType,
		DiscountValue: req.DiscountValue,
		MaxUses:      req.MaxUses,
		ValidFrom:    req.ValidFrom,
		ValidUntil:   req.ValidUntil,
		CreatedBy:    userID.(uuid.UUID),
	}

	if err := h.db.Create(&coupon).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create coupon"})
		return
	}

	c.JSON(http.StatusCreated, coupon)
}

// RedeemCoupon redeems a coupon and grants test access to the user
func (h *CouponHandler) RedeemCoupon(c *gin.Context) {
	var req RedeemCouponRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Find the coupon
	var coupon models.Coupon
	if err := h.db.Where("code = ? AND is_active = true", req.Code).First(&coupon).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid coupon code"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to validate coupon"})
		return
	}

	// Check validity
	now := time.Now()
	if now.Before(coupon.ValidFrom) || now.After(coupon.ValidUntil) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Coupon is not valid at this time"})
		return
	}

	if coupon.MaxUses != -1 && coupon.UsedCount >= coupon.MaxUses {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Coupon has reached maximum uses"})
		return
	}

	// Check if user already has access
	var user models.User
	if err := h.db.First(&user, userID.(uuid.UUID)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Check if user already has active access (attempts > 0 and not expired)
	if user.ExamAttemptsLeft > 0 && (user.AccessExpiresAt != nil && now.Before(*user.AccessExpiresAt)) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "You already have active test access"})
		return
	}

	// Check if user already redeemed this coupon
	var existingUsage models.CouponUsage
	if err := h.db.Where("coupon_id = ? AND user_id = ?", coupon.ID, userID).First(&existingUsage).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "You have already redeemed this coupon"})
		return
	}

	// Record the redemption
	couponUsage := models.CouponUsage{
		CouponID: coupon.ID,
		UserID:   userID.(uuid.UUID),
		UsedAt:   now,
	}

	if err := h.db.Create(&couponUsage).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record coupon redemption"})
		return
	}

	// Update coupon usage count
	h.db.Model(&coupon).Update("used_count", coupon.UsedCount+1)

	// Grant exam attempts and set expiration (30 days from now)
	accessExpiresAt := now.AddDate(0, 0, 30)
	updates := map[string]interface{}{
		"exam_attempts_left": 3,
		"access_expires_at":  accessExpiresAt,
	}

	if err := h.db.Model(&user).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to grant test access"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Coupon redeemed successfully! You now have 3 exam attempts valid for 30 days.",
		"exam_attempts_left": 3,
		"access_expires_at": accessExpiresAt,
	})
}

// ListCoupons returns all coupons (admin only)
func (h *CouponHandler) ListCoupons(c *gin.Context) {
	var coupons []models.Coupon
	if err := h.db.Find(&coupons).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch coupons"})
		return
	}

	c.JSON(http.StatusOK, coupons)
}

// GetCoupon returns a specific coupon (admin only)
func (h *CouponHandler) GetCoupon(c *gin.Context) {
	id := c.Param("id")
	couponID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid coupon ID"})
		return
	}

	var coupon models.Coupon
	if err := h.db.First(&coupon, couponID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Coupon not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch coupon"})
		return
	}

	c.JSON(http.StatusOK, coupon)
}

// UpdateCoupon updates a coupon (admin only)
func (h *CouponHandler) UpdateCoupon(c *gin.Context) {
	id := c.Param("id")
	couponID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid coupon ID"})
		return
	}

	var req CreateCouponRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var coupon models.Coupon
	if err := h.db.First(&coupon, couponID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Coupon not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch coupon"})
		return
	}

	updates := map[string]interface{}{
		"description":    req.Description,
		"discount_type":  req.DiscountType,
		"discount_value": req.DiscountValue,
		"max_uses":       req.MaxUses,
		"valid_until":    req.ValidUntil,
	}

	if !req.ValidFrom.IsZero() {
		updates["valid_from"] = req.ValidFrom
	}

	if err := h.db.Model(&coupon).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update coupon"})
		return
	}

	c.JSON(http.StatusOK, coupon)
}

// DeleteCoupon deletes a coupon (admin only)
func (h *CouponHandler) DeleteCoupon(c *gin.Context) {
	id := c.Param("id")
	couponID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid coupon ID"})
		return
	}

	if err := h.db.Delete(&models.Coupon{}, couponID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete coupon"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Coupon deleted successfully"})
}

// GenerateInvitationCoupon generates a coupon for inviting users
func (h *CouponHandler) GenerateInvitationCoupon(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Generate unique code
	code := "INVITE-" + uuid.New().String()[:8]

	// Valid for 30 days
	validUntil := time.Now().AddDate(0, 0, 30)

	coupon := models.Coupon{
		Code:         code,
		Description:  "Invitation coupon",
		DiscountType: "percentage",
		DiscountValue: 20.0, // 20% off
		MaxUses:      1,
		ValidFrom:    time.Now(),
		ValidUntil:   validUntil,
		CreatedBy:    userID.(uuid.UUID),
	}

	if err := h.db.Create(&coupon).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate invitation coupon"})
		return
	}

	c.JSON(http.StatusCreated, coupon)
}
