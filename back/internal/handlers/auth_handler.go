package handlers

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/nppe-pro/api/config"
	"github.com/nppe-pro/api/internal/models"
	"github.com/nppe-pro/api/pkg/database"
	"github.com/nppe-pro/api/pkg/jwt"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthHandler struct {
	db         *gorm.DB
	redis      *database.RedisClient
	jwtService *jwt.JWTService
	config     *config.Config
}

func NewAuthHandler(db *gorm.DB, redis *database.RedisClient, jwtService *jwt.JWTService, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		db:         db,
		redis:      redis,
		jwtService: jwtService,
		config:     cfg,
	}
}

// getSameSiteMode converts string SameSite value to Gin constant
func (h *AuthHandler) getSameSiteMode() http.SameSite {
	switch strings.ToLower(h.config.Server.CookieSameSite) {
	case "strict":
		return http.SameSiteStrictMode
	case "none":
		return http.SameSiteNoneMode
	case "lax":
		return http.SameSiteLaxMode
	default:
		return http.SameSiteLaxMode
	}
}

type RegisterRequest struct {
	Email     string     `json:"email" binding:"required,email"`
	Password  string     `json:"password" binding:"required,min=8"`
	FirstName string     `json:"first_name" binding:"required"`
	LastName  string     `json:"last_name" binding:"required"`
	Province  string     `json:"province" binding:"required"`
	ExamDate  *time.Time `json:"exam_date"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	AccessToken  string      `json:"access_token"`
	RefreshToken string      `json:"refresh_token"`
	ExpiresIn    int         `json:"expires_in"`
	User         interface{} `json:"user"`
}

// Register handles user registration
// @Summary Register a new user
// @Description Register a new user account
// @Tags auth
// @Accept json
// @Produce json
// @Param request body RegisterRequest true "Registration details"
// @Success 201 {object} LoginResponse
// @Failure 400 {object} map[string]string
// @Router /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if user already exists
	var existingUser models.User
	if err := h.db.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email already registered"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process password"})
		return
	}

	// Create user
	user := models.User{
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Province:     req.Province,
		ExamDate:     req.ExamDate,
		IsVerified:   false,
	}

	if err := h.db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Create user stats
	stats := models.UserStats{
		UserID: user.ID,
	}
	h.db.Create(&stats)

	// Generate tokens
	accessToken, _ := h.jwtService.GenerateToken(user.ID, user.Email, user.IsAdmin)
	refreshToken, _ := h.jwtService.GenerateRefreshToken(user.ID)

	// Store session in Redis
	ctx := context.Background()
	h.redis.Set(ctx, "session:"+user.ID.String(), accessToken, 24*time.Hour)

	// Set HTTP-only cookies
	c.SetSameSite(h.getSameSiteMode())
	c.SetCookie(
		"access_token",
		accessToken,
		3600, // 1 hour
		"/",
		"",
		h.config.Server.CookieSecure,
		true, // HTTP-only
	)
	c.SetCookie(
		"refresh_token",
		refreshToken,
		86400*7, // 7 days
		"/",
		"",
		h.config.Server.CookieSecure,
		true,
	)

	c.JSON(http.StatusCreated, LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    3600,
		User: gin.H{
			"id":           user.ID,
			"email":        user.Email,
			"first_name":   user.FirstName,
			"last_name":    user.LastName,
			"province":     user.Province,
			"is_verified":  user.IsVerified,
			"is_admin":     user.IsAdmin,
			"avatar_url":   user.AvatarURL,
			"study_streak": user.StudyStreak,
		},
	})
}

// Login handles user login
// @Summary Login user
// @Description Authenticate user and return JWT token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body LoginRequest true "Login credentials"
// @Success 200 {object} LoginResponse
// @Failure 401 {object} map[string]string
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find user
	var user models.User
	if err := h.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Generate tokens
	accessToken, _ := h.jwtService.GenerateToken(user.ID, user.Email, user.IsAdmin)
	refreshToken, _ := h.jwtService.GenerateRefreshToken(user.ID)

	// Store session in Redis
	ctx := context.Background()
	h.redis.Set(ctx, "session:"+user.ID.String(), accessToken, 24*time.Hour)

	// Set HTTP-only cookies
	c.SetSameSite(h.getSameSiteMode())
	c.SetCookie(
		"access_token",
		accessToken,
		3600, // 1 hour
		"/",
		"",
		h.config.Server.CookieSecure,
		true, // HTTP-only
	)
	c.SetCookie(
		"refresh_token",
		refreshToken,
		86400*7, // 7 days
		"/",
		"",
		h.config.Server.CookieSecure,
		true,
	)

	c.JSON(http.StatusOK, LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    3600,
		User: gin.H{
			"id":           user.ID,
			"email":        user.Email,
			"first_name":   user.FirstName,
			"last_name":    user.LastName,
			"province":     user.Province,
			"is_verified":  user.IsVerified,
			"is_admin":     user.IsAdmin,
			"avatar_url":   user.AvatarURL,
			"study_streak": user.StudyStreak,
		},
	})
}

// RefreshToken handles token refresh
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, err := h.jwtService.ValidateRefreshToken(req.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
		return
	}

	var user models.User
	if err := h.db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	accessToken, _ := h.jwtService.GenerateToken(user.ID, user.Email, user.IsAdmin)
	newRefreshToken, _ := h.jwtService.GenerateRefreshToken(user.ID)

	c.JSON(http.StatusOK, LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
		ExpiresIn:    3600,
	})
}

// ForgotPassword handles password reset request
func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required,email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find user
	var user models.User
	if err := h.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		// Don't reveal if email exists
		c.JSON(http.StatusOK, gin.H{"message": "If the email exists, a reset link will be sent"})
		return
	}

	// Create reset token
	resetToken := uuid.New().String()
	passwordReset := models.PasswordReset{
		UserID:    user.ID,
		Token:     resetToken,
		ExpiresAt: time.Now().Add(1 * time.Hour),
	}
	h.db.Create(&passwordReset)

	// TODO: Send email with reset link
	// For now, just return success
	c.JSON(http.StatusOK, gin.H{"message": "If the email exists, a reset link will be sent"})
}

// ResetPassword handles password reset with token
func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var req struct {
		Token    string `json:"token" binding:"required"`
		Password string `json:"password" binding:"required,min=8"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find reset token
	var reset models.PasswordReset
	if err := h.db.Where("token = ? AND used_at IS NULL AND expires_at > ?", req.Token, time.Now()).First(&reset).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired reset token"})
		return
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process password"})
		return
	}

	// Update user password
	now := time.Now()
	h.db.Model(&models.User{}).Where("id = ?", reset.UserID).Update("password_hash", string(hashedPassword))
	h.db.Model(&reset).Update("used_at", &now)

	c.JSON(http.StatusOK, gin.H{"message": "Password reset successful"})
}

// VerifyEmail handles email verification
func (h *AuthHandler) VerifyEmail(c *gin.Context) {
	token := c.Param("token")

	var verification models.EmailVerification
	if err := h.db.Where("token = ? AND expires_at > ?", token, time.Now()).First(&verification).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired verification token"})
		return
	}

	// Update user
	h.db.Model(&models.User{}).Where("id = ?", verification.UserID).Update("is_verified", true)
	h.db.Delete(&verification)

	c.JSON(http.StatusOK, gin.H{"message": "Email verified successfully"})
}

// GoogleLogin initiates Google OAuth
func (h *AuthHandler) GoogleLogin(c *gin.Context) {
	// TODO: Implement Google OAuth
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Google OAuth not implemented yet"})
}

// GoogleCallback handles Google OAuth callback
func (h *AuthHandler) GoogleCallback(c *gin.Context) {
	// TODO: Implement Google OAuth callback
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Google OAuth callback not implemented yet"})
}

// Logout handles user logout
func (h *AuthHandler) Logout(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if exists {
		// Clear session from Redis
		ctx := context.Background()
		sessionKey := "session:" + userID.(uuid.UUID).String()
		h.redis.Client.Del(ctx, sessionKey)
	}

	// Clear cookies
	c.SetCookie("access_token", "", -1, "/", "", false, true)
	c.SetCookie("refresh_token", "", -1, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// GetCurrentUser returns current authenticated user info
func (h *AuthHandler) GetCurrentUser(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	var user models.User
	if err := h.db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":           user.ID,
		"email":        user.Email,
		"first_name":   user.FirstName,
		"last_name":    user.LastName,
		"province":     user.Province,
		"exam_date":    user.ExamDate,
		"is_verified":  user.IsVerified,
		"is_admin":     user.IsAdmin,
		"avatar_url":   user.AvatarURL,
		"study_streak": user.StudyStreak,
		"created_at":   user.CreatedAt,
	})
}
