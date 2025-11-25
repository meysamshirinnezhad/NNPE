package dto

import (
	"github.com/google/uuid"
)

// CreateOptionRequest represents a request to create a question option
type CreateOptionRequest struct {
	OptionText string `json:"option_text" binding:"required,min=1"`
	IsCorrect  bool   `json:"is_correct"`
}

// CreateQuestionRequest represents a request to create a new question
type CreateQuestionRequest struct {
	Content         string                `json:"content" binding:"required,min=10"`
	QuestionType    string                `json:"question_type" binding:"required,oneof=multiple_choice_single multiple_choice_multi true_false"`
	Difficulty      string                `json:"difficulty" binding:"required,oneof=easy medium hard"`
	TopicID         uuid.UUID             `json:"topic_id" binding:"required"`
	SubTopicID      *uuid.UUID            `json:"sub_topic_id,omitempty"`
	Province        *string               `json:"province,omitempty"`
	Explanation     string                `json:"explanation,omitempty"`
	ReferenceSource string                `json:"reference_source,omitempty"`
	IsActive        *bool                 `json:"is_active,omitempty"` // Default will be true in handler
	Options         []CreateOptionRequest `json:"options" binding:"required,min=2,dive"`
}

// Validate performs additional validation on CreateQuestionRequest
func (r *CreateQuestionRequest) Validate() error {
	// Check at least one correct answer
	correctCount := 0
	for _, opt := range r.Options {
		if opt.IsCorrect {
			correctCount++
		}
	}

	if correctCount == 0 {
		return ErrNoCorrectAnswer
	}

	// For single choice, only one correct answer allowed
	if r.QuestionType == "multiple_choice_single" && correctCount != 1 {
		return ErrSingleChoiceMultipleCorrect
	}

	// For true/false, exactly 2 options
	if r.QuestionType == "true_false" && len(r.Options) != 2 {
		return ErrTrueFalseOptionCount
	}

	return nil
}

// UpdateOptionRequest represents a request to update a question option
type UpdateOptionRequest struct {
	ID         *uuid.UUID `json:"id,omitempty"` // If present, update existing; if not, create new
	OptionText string     `json:"option_text" binding:"required,min=1"`
	IsCorrect  bool       `json:"is_correct"`
	Position   int        `json:"position"`
}

// UpdateQuestionRequest represents a request to update a question
type UpdateQuestionRequest struct {
	Content         *string               `json:"content,omitempty" binding:"omitempty,min=10"`
	QuestionType    *string               `json:"question_type,omitempty" binding:"omitempty,oneof=multiple_choice_single multiple_choice_multi true_false"`
	Difficulty      *string               `json:"difficulty,omitempty" binding:"omitempty,oneof=easy medium hard"`
	TopicID         *uuid.UUID            `json:"topic_id,omitempty"`
	SubTopicID      *uuid.UUID            `json:"sub_topic_id,omitempty"`
	Province        *string               `json:"province,omitempty"`
	Explanation     *string               `json:"explanation,omitempty"`
	ReferenceSource *string               `json:"reference_source,omitempty"`
	IsActive        *bool                 `json:"is_active,omitempty"`
	Options         []UpdateOptionRequest `json:"options,omitempty" binding:"omitempty,min=2,dive"`
}

// Validate performs additional validation on UpdateQuestionRequest
func (r *UpdateQuestionRequest) Validate() error {
	// If options provided, validate them
	if len(r.Options) > 0 {
		correctCount := 0
		for _, opt := range r.Options {
			if opt.IsCorrect {
				correctCount++
			}
		}

		if correctCount == 0 {
			return ErrNoCorrectAnswer
		}

		// If question type is provided, validate accordingly
		if r.QuestionType != nil {
			if *r.QuestionType == "multiple_choice_single" && correctCount != 1 {
				return ErrSingleChoiceMultipleCorrect
			}

			if *r.QuestionType == "true_false" && len(r.Options) != 2 {
				return ErrTrueFalseOptionCount
			}
		}
	}

	return nil
}

// QuestionResponse represents a question response
type QuestionResponse struct {
	ID              uuid.UUID        `json:"id"`
	Content         string           `json:"content"`
	QuestionType    string           `json:"question_type"`
	Difficulty      string           `json:"difficulty"`
	TopicID         uuid.UUID        `json:"topic_id"`
	TopicName       string           `json:"topic_name,omitempty"`
	SubTopicID      *uuid.UUID       `json:"sub_topic_id,omitempty"`
	SubTopicName    string           `json:"sub_topic_name,omitempty"`
	Province        *string          `json:"province,omitempty"`
	Explanation     string           `json:"explanation"`
	ReferenceSource string           `json:"reference_source"`
	IsActive        bool             `json:"is_active"`
	Options         []OptionResponse `json:"options"`
	CreatedAt       string           `json:"created_at"`
	UpdatedAt       string           `json:"updated_at"`
}

// OptionResponse represents an option response
type OptionResponse struct {
	ID         uuid.UUID `json:"id"`
	OptionText string    `json:"option_text"`
	IsCorrect  bool      `json:"is_correct"`
	Position   int       `json:"position"`
}

// ListQuestionsFilter represents filters for listing questions
type ListQuestionsFilter struct {
	Search       string     `form:"q"`
	TopicID      *uuid.UUID `form:"topic_id"`
	SubTopicID   *uuid.UUID `form:"sub_topic_id"`
	Province     string     `form:"province"`
	QuestionType string     `form:"question_type" binding:"omitempty,oneof=multiple_choice_single multiple_choice_multi true_false"`
	Difficulty   string     `form:"difficulty" binding:"omitempty,oneof=easy medium hard"`
	IsActive     *bool      `form:"is_active"`
	Page         int        `form:"page" binding:"omitempty,min=1"`
	PageSize     int        `form:"page_size" binding:"omitempty,min=1,max=100"`
}

// GetPage returns page number (default 1)
func (f *ListQuestionsFilter) GetPage() int {
	if f.Page < 1 {
		return 1
	}
	return f.Page
}

// GetPageSize returns page size (default 20)
func (f *ListQuestionsFilter) GetPageSize() int {
	if f.PageSize < 1 {
		return 20
	}
	if f.PageSize > 100 {
		return 100
	}
	return f.PageSize
}

// GetOffset calculates offset for pagination
func (f *ListQuestionsFilter) GetOffset() int {
	return (f.GetPage() - 1) * f.GetPageSize()
}

// ListQuestionsResponse represents a paginated list of questions
type ListQuestionsResponse struct {
	Items    []QuestionResponse `json:"items"`
	Total    int64              `json:"total"`
	Page     int                `json:"page"`
	PageSize int                `json:"page_size"`
}

// BulkOperationRequest represents a bulk operation request
type BulkOperationRequest struct {
	IDs       []uuid.UUID `json:"ids" binding:"required,min=1"`
	Operation string      `json:"op" binding:"required,oneof=activate deactivate delete"`
}

// Custom validation errors
var (
	ErrNoCorrectAnswer             = &ValidationError{Message: "At least one option must be marked as correct"}
	ErrSingleChoiceMultipleCorrect = &ValidationError{Message: "Single choice questions must have exactly one correct answer"}
	ErrTrueFalseOptionCount        = &ValidationError{Message: "True/False questions must have exactly 2 options"}
	ErrSubTopicMismatch            = &ValidationError{Message: "SubTopic does not belong to the selected Topic"}
)

// ValidationError represents a validation error
type ValidationError struct {
	Message string
}

func (e *ValidationError) Error() string {
	return e.Message
}
