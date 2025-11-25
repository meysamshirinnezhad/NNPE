package models

import (
	"time"

	"github.com/google/uuid"
)

type Subscription struct {
	ID                   uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID               uuid.UUID  `gorm:"uniqueIndex;not null" json:"user_id"`
	Plan                 string     `gorm:"type:varchar(20);not null" json:"plan"`   // free, monthly, annual
	Status               string     `gorm:"type:varchar(20);not null" json:"status"` // active, cancelled, expired, past_due
	StripeCustomerID     string     `gorm:"index" json:"stripe_customer_id,omitempty"`
	StripeSubscriptionID string     `gorm:"index" json:"stripe_subscription_id,omitempty"`
	CurrentPeriodStart   time.Time  `json:"current_period_start"`
	CurrentPeriodEnd     time.Time  `json:"current_period_end"`
	CancelAtPeriodEnd    bool       `gorm:"default:false" json:"cancel_at_period_end"`
	CancelledAt          *time.Time `json:"cancelled_at,omitempty"`
	CreatedAt            time.Time  `json:"created_at"`
	UpdatedAt            time.Time  `json:"updated_at"`
}

type Payment struct {
	ID              uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID          uuid.UUID `gorm:"index;not null" json:"user_id"`
	SubscriptionID  uuid.UUID `gorm:"index;not null" json:"subscription_id"`
	Amount          int       `gorm:"not null" json:"amount"` // in cents
	Currency        string    `gorm:"default:'CAD'" json:"currency"`
	Status          string    `gorm:"type:varchar(20);not null" json:"status"` // succeeded, pending, failed
	StripePaymentID string    `gorm:"index" json:"stripe_payment_id,omitempty"`
	Description     string    `gorm:"type:text" json:"description"`
	CreatedAt       time.Time `json:"created_at"`
}
