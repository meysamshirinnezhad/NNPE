package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID             uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Email          string         `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash   string         `gorm:"not null" json:"-"`
	FirstName      string         `gorm:"not null" json:"first_name"`
	LastName       string         `gorm:"not null" json:"last_name"`
	Province       string         `gorm:"not null" json:"province"`
	ExamDate       *time.Time     `json:"exam_date,omitempty"`
	IsVerified     bool           `gorm:"default:false" json:"is_verified"`
	IsAdmin        bool           `gorm:"default:false" json:"is_admin"`
	AvatarURL      string         `json:"avatar_url,omitempty"`
	StudyStreak    int            `gorm:"default:0" json:"study_streak"`
	LongestStreak  int            `gorm:"default:0" json:"longest_streak"`
	LastStudyDate  *time.Time     `json:"last_study_date,omitempty"`
	SubscriptionID *uuid.UUID     `json:"subscription_id,omitempty"`
	OAuthProvider  string         `gorm:"type:varchar(20)" json:"oauth_provider,omitempty"`
	OAuthID        string         `gorm:"index" json:"-"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

type UserStats struct {
	ID                 uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID             uuid.UUID `gorm:"uniqueIndex;not null"`
	QuestionsCompleted int       `gorm:"default:0"`
	QuestionsCorrect   int       `gorm:"default:0"`
	PracticeTestsTaken int       `gorm:"default:0"`
	AverageTestScore   float64   `gorm:"default:0"`
	TimeStudiedSeconds int       `gorm:"default:0"`
	UpdatedAt          time.Time
}

type EmailVerification struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID    uuid.UUID `gorm:"index;not null"`
	Token     string    `gorm:"uniqueIndex;not null"`
	ExpiresAt time.Time `gorm:"not null"`
	CreatedAt time.Time
}

type PasswordReset struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID    uuid.UUID `gorm:"index;not null"`
	Token     string    `gorm:"uniqueIndex;not null"`
	ExpiresAt time.Time `gorm:"not null"`
	UsedAt    *time.Time
	CreatedAt time.Time
}
