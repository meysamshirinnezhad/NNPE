package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nppe-pro/api/internal/models"
	"gorm.io/gorm"
)

// RequireVerifiedEmail middleware ensures user has verified their email
func RequireVerifiedEmail(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			c.Abort()
			return
		}

		var user models.User
		if err := db.First(&user, userID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			c.Abort()
			return
		}

		if !user.IsVerified {
			c.JSON(http.StatusForbidden, gin.H{
				"error":   "EMAIL_NOT_VERIFIED",
				"message": "Email verification required to access this feature",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
