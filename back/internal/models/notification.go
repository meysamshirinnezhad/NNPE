package models

import (
	"time"

	"github.com/google/uuid"
)

type Notification struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID `gorm:"index;not null" json:"user_id"`
	Type      string    `gorm:"type:varchar(50);not null" json:"type"` // achievement, reminder, system, test_result
	Title     string    `gorm:"not null" json:"title"`
	Message   string    `gorm:"type:text" json:"message"`
	Link      string    `json:"link,omitempty"`
	IsRead    bool      `gorm:"default:false" json:"is_read"`
	CreatedAt time.Time `json:"created_at"`
}

type UserNotificationSettings struct {
	ID                 uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID             uuid.UUID `gorm:"uniqueIndex;not null" json:"user_id"`
	EmailNotifications bool      `gorm:"default:true" json:"email_notifications"`
	PushNotifications  bool      `gorm:"default:true" json:"push_notifications"`
	DailyReminder      bool      `gorm:"default:true" json:"daily_reminder"`
	ReminderTime       string    `gorm:"default:'09:00'" json:"reminder_time"` // HH:MM format
	WeeklyReport       bool      `gorm:"default:true" json:"weekly_report"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

type ForumPost struct {
	ID         uuid.UUID    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID     uuid.UUID    `gorm:"index;not null" json:"user_id"`
	User       *User        `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Title      string       `gorm:"not null" json:"title"`
	Content    string       `gorm:"type:text;not null" json:"content"`
	Category   string       `gorm:"type:varchar(50)" json:"category"`
	ViewCount  int          `gorm:"default:0" json:"view_count"`
	ReplyCount int          `gorm:"default:0" json:"reply_count"`
	IsPinned   bool         `gorm:"default:false" json:"is_pinned"`
	IsLocked   bool         `gorm:"default:false" json:"is_locked"`
	CreatedAt  time.Time    `json:"created_at"`
	UpdatedAt  time.Time    `json:"updated_at"`
	Replies    []ForumReply `gorm:"foreignKey:PostID" json:"replies,omitempty"`
}

type ForumReply struct {
	ID         uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	PostID     uuid.UUID `gorm:"index;not null" json:"post_id"`
	UserID     uuid.UUID `gorm:"index;not null" json:"user_id"`
	User       *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Content    string    `gorm:"type:text;not null" json:"content"`
	IsAccepted bool      `gorm:"default:false" json:"is_accepted"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type StudyGroup struct {
	ID          uuid.UUID          `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name        string             `gorm:"not null" json:"name"`
	Description string             `gorm:"type:text" json:"description"`
	CreatorID   uuid.UUID          `gorm:"not null" json:"creator_id"`
	Creator     *User              `gorm:"foreignKey:CreatorID" json:"creator,omitempty"`
	MemberCount int                `gorm:"default:1" json:"member_count"`
	IsPrivate   bool               `gorm:"default:false" json:"is_private"`
	CreatedAt   time.Time          `json:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at"`
	Members     []StudyGroupMember `gorm:"foreignKey:GroupID" json:"members,omitempty"`
}

type StudyGroupMember struct {
	ID       uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	GroupID  uuid.UUID `gorm:"index:idx_group_user,unique;not null" json:"group_id"`
	UserID   uuid.UUID `gorm:"index:idx_group_user,unique;not null" json:"user_id"`
	User     *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Role     string    `gorm:"type:varchar(20);not null" json:"role"` // owner, moderator, member
	JoinedAt time.Time `json:"joined_at"`
}
