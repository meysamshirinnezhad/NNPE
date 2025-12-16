package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type StripePayment struct {
	ID                uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID            uuid.UUID  `gorm:"index;not null" json:"user_id"`
	CheckoutSessionID string     `gorm:"uniqueIndex;not null" json:"checkout_session_id"`
	PaymentIntentID   string     `gorm:"index" json:"payment_intent_id"`
	Amount            int64      `gorm:"not null" json:"amount"` // in cents
	Currency          string     `gorm:"default:'usd'" json:"currency"`
	Status            string     `gorm:"not null" json:"status"` // succeeded, pending, failed
	CustomerEmail     string     `gorm:"not null" json:"customer_email"`
	Source            string     `gorm:"default:'stripe'" json:"source"` // payment source type
	ProcessedAt       time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"processed_at"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"-"`
}

func (StripePayment) TableName() string {
	return "stripe_payments"
}
