package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/nppe-pro/api/pkg/jwt"
)

// AuthMiddleware validates JWT tokens from cookies or Authorization header
func AuthMiddleware(jwtService *jwt.JWTService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var token string

		// First, try to get token from cookie (preferred for web clients)
		token, err := c.Cookie("access_token")
		if err != nil || token == "" {
			// If no cookie, try Authorization header (for API clients)
			authHeader := c.GetHeader("Authorization")
			if authHeader == "" {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
				c.Abort()
				return
			}

			// Extract token from "Bearer <token>"
			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
				c.Abort()
				return
			}

			token = parts[1]
		}

		// Validate token
		claims, err := jwtService.ValidateToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Set user info in context
		c.Set("user_id", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("is_admin", claims.IsAdmin)

		c.Next()
	}
}

// AdminMiddleware ensures the user is an admin
func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		isAdmin, exists := c.Get("is_admin")
		if !exists || !isAdmin.(bool) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			c.Abort()
			return
		}
		c.Next()
	}
}

// GetUserID retrieves user ID from context
func GetUserID(c *gin.Context) (uuid.UUID, error) {
	userID, exists := c.Get("user_id")
	if !exists {
		return uuid.Nil, gin.Error{Err: ErrUnauthorized}
	}
	return userID.(uuid.UUID), nil
}

var ErrUnauthorized = gin.Error{Err: http.ErrNotSupported, Type: gin.ErrorTypePublic}
