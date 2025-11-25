package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Topic struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Code        string    `gorm:"uniqueIndex" json:"code"`
	Description string    `gorm:"type:text" json:"description"`
	Weight      float64   `json:"weight"` // Percentage of exam
	Order       int       `json:"order"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type SubTopic struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	TopicID     uuid.UUID `gorm:"not null" json:"topic_id"`
	Topic       *Topic    `gorm:"foreignKey:TopicID" json:"topic,omitempty"`
	Name        string    `gorm:"not null" json:"name"`
	Code        string    `gorm:"uniqueIndex" json:"code"`
	Description string    `gorm:"type:text" json:"description"`
	Order       int       `json:"order"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Question struct {
	ID              uuid.UUID        `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Content         string           `gorm:"type:text;not null" json:"content"`
	QuestionType    string           `gorm:"type:varchar(50);not null;index:idx_questions_type_difficulty" json:"question_type"` // multiple_choice_single, multiple_choice_multi, true_false
	Difficulty      string           `gorm:"type:varchar(20);not null;index:idx_questions_type_difficulty" json:"difficulty"`    // easy, medium, hard
	TopicID         uuid.UUID        `gorm:"not null;index:idx_questions_topic_subtopic" json:"topic_id"`
	Topic           *Topic           `gorm:"foreignKey:TopicID" json:"topic,omitempty"`
	SubTopicID      *uuid.UUID       `gorm:"index:idx_questions_topic_subtopic" json:"sub_topic_id,omitempty"`
	SubTopic        *SubTopic        `gorm:"foreignKey:SubTopicID" json:"sub_topic,omitempty"`
	Province        *string          `json:"province,omitempty"` // null = all provinces
	Explanation     string           `gorm:"type:text" json:"explanation"`
	ReferenceSource string           `gorm:"type:text" json:"reference_source"`
	IsActive        bool             `gorm:"default:true;index:idx_questions_is_active" json:"is_active"`
	Options         []QuestionOption `gorm:"foreignKey:QuestionID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"options,omitempty"`
	CreatedAt       time.Time        `json:"created_at"`
	UpdatedAt       time.Time        `json:"updated_at"`
	DeletedAt       gorm.DeletedAt   `gorm:"index" json:"-"`
}

// QuestionOption represents an answer choice for a question
// Also exported as AnswerOption for consistency with API documentation
type QuestionOption struct {
	ID         uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	QuestionID uuid.UUID `gorm:"not null;index" json:"question_id"`
	OptionText string    `gorm:"type:text;not null" json:"option_text"` // Renamed from Content to match spec
	IsCorrect  bool      `gorm:"default:false" json:"is_correct"`
	Position   int       `gorm:"not null" json:"position"` // Order of display
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// AnswerOption is an alias for QuestionOption for API consistency
type AnswerOption = QuestionOption

type UserAnswer struct {
	ID               uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID           uuid.UUID `gorm:"index;not null" json:"user_id"`
	QuestionID       uuid.UUID `gorm:"index;not null" json:"question_id"`
	Question         *Question `gorm:"foreignKey:QuestionID" json:"question,omitempty"`
	SelectedOptionID uuid.UUID `gorm:"not null" json:"selected_option_id"`
	IsCorrect        bool      `json:"is_correct"`
	TimeSpentSeconds int       `json:"time_spent_seconds"`
	CreatedAt        time.Time `json:"created_at"`
}

type UserBookmark struct {
	ID         uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID     uuid.UUID `gorm:"index:idx_user_question,unique;not null" json:"user_id"`
	QuestionID uuid.UUID `gorm:"index:idx_user_question,unique;not null" json:"question_id"`
	Question   *Question `gorm:"foreignKey:QuestionID" json:"question,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
}

type UserTopicMastery struct {
	ID                 uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID             uuid.UUID `gorm:"index:idx_user_topic,unique;not null" json:"user_id"`
	TopicID            uuid.UUID `gorm:"index:idx_user_topic,unique;not null" json:"topic_id"`
	Topic              *Topic    `gorm:"foreignKey:TopicID" json:"topic,omitempty"`
	QuestionsAttempted int       `gorm:"default:0" json:"questions_attempted"`
	QuestionsCorrect   int       `gorm:"default:0" json:"questions_correct"`
	MasteryPercentage  float64   `gorm:"default:0" json:"mastery_percentage"`
	LastPracticed      time.Time `json:"last_practiced"`
	UpdatedAt          time.Time `json:"updated_at"`
}
