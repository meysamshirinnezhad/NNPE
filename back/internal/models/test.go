package models

import (
	"time"

	"github.com/google/uuid"
)

type PracticeTest struct {
	ID               uuid.UUID              `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID           uuid.UUID              `gorm:"index;not null" json:"user_id"`
	TestType         string                 `gorm:"type:varchar(50);not null" json:"test_type"` // full_exam, topic_specific, custom
	Status           string                 `gorm:"type:varchar(20);not null" json:"status"`    // in_progress, completed, abandoned
	TotalQuestions   int                    `gorm:"not null" json:"total_questions"`
	CorrectAnswers   int                    `gorm:"default:0" json:"correct_answers"`
	Score            float64                `gorm:"default:0" json:"score"` // Percentage
	TimeSpentSeconds int                    `gorm:"default:0" json:"time_spent_seconds"`
	TimeLimitMinutes int                    `json:"time_limit_minutes"`
	StartedAt        time.Time              `json:"started_at"`
	CompletedAt      *time.Time             `json:"completed_at,omitempty"`
	CreatedAt        time.Time              `json:"created_at"`
	UpdatedAt        time.Time              `json:"updated_at"`
	Questions        []PracticeTestQuestion `gorm:"foreignKey:PracticeTestID" json:"questions,omitempty"`
}

type PracticeTestQuestion struct {
	ID               uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	PracticeTestID   uuid.UUID  `gorm:"index;not null" json:"practice_test_id"`
	QuestionID       uuid.UUID  `gorm:"not null" json:"question_id"`
	Question         *Question  `gorm:"foreignKey:QuestionID" json:"question,omitempty"`
	Position         int        `gorm:"not null" json:"position"`
	AnswerID         *uuid.UUID `json:"answer_id,omitempty"`
	IsCorrect        *bool      `json:"is_correct,omitempty"`
	TimeSpentSeconds int        `gorm:"default:0" json:"time_spent_seconds"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}
