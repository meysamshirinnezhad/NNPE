package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Achievement struct {
	ID              uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID          uuid.UUID      `gorm:"not null;index" json:"user_id"`
	AchievementType string         `gorm:"type:varchar(100);not null" json:"achievement_type"`
	Title           string         `gorm:"type:varchar(255);not null" json:"title"`
	Description     string         `gorm:"type:text" json:"description"`
	Icon            string         `gorm:"type:varchar(100)" json:"icon"`
	Rarity          string         `gorm:"type:varchar(50);default:'common'" json:"rarity"`
	Points          int            `gorm:"default:0" json:"points"`
	EarnedAt        time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"earned_at"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations
	User User `gorm:"foreignKey:UserID;references:ID" json:"-"`
}
