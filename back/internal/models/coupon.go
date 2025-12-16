package models

import (
	"time"

	"github.com/google/uuid"
)

type Coupon struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Code        string    `gorm:"uniqueIndex;not null" json:"code"`
	Description string    `gorm:"type:text" json:"description"`
	DiscountType string   `gorm:"type:varchar(20);not null" json:"discount_type"` // percentage, fixed
	DiscountValue float64 `gorm:"not null" json:"discount_value"` // e.g., 10 for 10%, or 1000 for $10 off
	MaxUses     int       `gorm:"default:-1" json:"max_uses"` // -1 for unlimited
	UsedCount   int       `gorm:"default:0" json:"used_count"`
	ValidFrom   time.Time `json:"valid_from"`
	ValidUntil  time.Time `json:"valid_until"`
	IsActive    bool      `gorm:"default:true" json:"is_active"`
	CreatedBy   uuid.UUID `gorm:"not null" json:"created_by"` // user who created/invited
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CouponUsage struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	CouponID  uuid.UUID `gorm:"not null" json:"coupon_id"`
	UserID    uuid.UUID `gorm:"not null" json:"user_id"`
	OrderID   *uuid.UUID `json:"order_id,omitempty"` // link to subscription/payment if applicable
	UsedAt    time.Time `json:"used_at"`
}
