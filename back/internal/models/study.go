package models

import (
	"time"

	"github.com/google/uuid"
)

type StudyPath struct {
	ID          uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID  `gorm:"uniqueIndex;not null" json:"user_id"`
	Status      string     `gorm:"type:varchar(20);not null" json:"status"` // not_started, in_progress, completed
	CurrentWeek int        `gorm:"default:1" json:"current_week"`
	StartDate   *time.Time `json:"start_date,omitempty"`
	TargetDate  *time.Time `json:"target_date,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type Module struct {
	ID              uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Title           string    `gorm:"not null" json:"title"`
	Description     string    `gorm:"type:text" json:"description"`
	Week            int       `gorm:"not null" json:"week"`
	Order           int       `gorm:"not null" json:"order"`
	TopicID         uuid.UUID `gorm:"not null" json:"topic_id"`
	Topic           *Topic    `gorm:"foreignKey:TopicID" json:"topic,omitempty"`
	DurationMinutes int       `json:"duration_minutes"`
	ContentURL      string    `json:"content_url"`
	VideoURL        string    `json:"video_url"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type UserModuleProgress struct {
	ID          uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID  `gorm:"index:idx_user_module,unique;not null" json:"user_id"`
	ModuleID    uuid.UUID  `gorm:"index:idx_user_module,unique;not null" json:"module_id"`
	Module      *Module    `gorm:"foreignKey:ModuleID" json:"module,omitempty"`
	Status      string     `gorm:"type:varchar(20);not null" json:"status"` // not_started, in_progress, completed
	Progress    int        `gorm:"default:0" json:"progress"`               // 0-100
	TimeSpent   int        `gorm:"default:0" json:"time_spent"`             // seconds
	StartedAt   *time.Time `json:"started_at,omitempty"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}
