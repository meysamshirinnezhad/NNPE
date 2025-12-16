package middleware

import (
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// SimpleRateLimiter implements a basic rate limiting middleware
type SimpleRateLimiter struct {
	requests map[string][]time.Time
	mutex    sync.RWMutex
	limit    int
	window   time.Duration
}

// NewSimpleRateLimiter creates a new rate limiter
func NewSimpleRateLimiter(limit int, window time.Duration) *SimpleRateLimiter {
	return &SimpleRateLimiter{
		requests: make(map[string][]time.Time),
		limit:    limit,
		window:   window,
	}
}

// Allow checks if a request is allowed based on rate limiting
func (rl *SimpleRateLimiter) Allow(key string) bool {
	rl.mutex.Lock()
	defer rl.mutex.Unlock()

	now := time.Now()
	
	// Clean old entries
	if requests, exists := rl.requests[key]; exists {
		var validRequests []time.Time
		for _, reqTime := range requests {
			if now.Sub(reqTime) <= rl.window {
				validRequests = append(validRequests, reqTime)
			}
		}
		rl.requests[key] = validRequests
	}

	// Check limit
	if len(rl.requests[key]) >= rl.limit {
		return false
	}

	// Add current request
	rl.requests[key] = append(rl.requests[key], now)
	return true
}

// RateLimitMiddleware creates a rate limiting middleware for webhooks
func RateLimitMiddleware(limit int, window time.Duration) gin.HandlerFunc {
	limiter := NewSimpleRateLimiter(limit, window)
	
	return func(c *gin.Context) {
		// Get client IP
		clientIP := c.ClientIP()
		
		// For webhooks, we could also check Stripe's IP ranges
		// but for simplicity, we'll just use client IP
		
		if !limiter.Allow(clientIP) {
			c.JSON(429, gin.H{
				"error": "Rate limit exceeded",
				"retry_after": window.Seconds(),
			})
			c.Abort()
			return
		}
		
		c.Next()
	}
}
