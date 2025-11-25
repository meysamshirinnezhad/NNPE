package repo

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/nppe-pro/api/internal/handlers/dto"
	"github.com/nppe-pro/api/internal/models"
	"gorm.io/gorm"
)

// QuestionRepository handles question data operations
type QuestionRepository struct {
	db *gorm.DB
}

// NewQuestionRepository creates a new question repository
func NewQuestionRepository(db *gorm.DB) *QuestionRepository {
	return &QuestionRepository{db: db}
}

// CreateQuestionTx creates a question with options in a transaction
func (r *QuestionRepository) CreateQuestionTx(ctx context.Context, req *dto.CreateQuestionRequest) (*models.Question, error) {
	var question models.Question

	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Validate SubTopic belongs to Topic if provided
		if req.SubTopicID != nil {
			if err := r.validateSubTopicBelongsToTopic(tx, req.TopicID, *req.SubTopicID); err != nil {
				return err
			}
		}

		// Set default for IsActive
		isActive := true
		if req.IsActive != nil {
			isActive = *req.IsActive
		}

		// Create question
		question = models.Question{
			Content:         req.Content,
			QuestionType:    req.QuestionType,
			Difficulty:      req.Difficulty,
			TopicID:         req.TopicID,
			SubTopicID:      req.SubTopicID,
			Province:        req.Province,
			Explanation:     req.Explanation,
			ReferenceSource: req.ReferenceSource,
			IsActive:        isActive,
		}

		if err := tx.Create(&question).Error; err != nil {
			return fmt.Errorf("failed to create question: %w", err)
		}

		// Create options
		for i, optReq := range req.Options {
			option := models.QuestionOption{
				QuestionID: question.ID,
				OptionText: optReq.OptionText,
				IsCorrect:  optReq.IsCorrect,
				Position:   i + 1,
			}
			if err := tx.Create(&option).Error; err != nil {
				return fmt.Errorf("failed to create option: %w", err)
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	// Reload with associations
	if err := r.db.WithContext(ctx).
		Preload("Topic").
		Preload("SubTopic").
		Preload("Options").
		First(&question, question.ID).Error; err != nil {
		return nil, fmt.Errorf("failed to reload question: %w", err)
	}

	return &question, nil
}

// GetQuestion retrieves a single question by ID
func (r *QuestionRepository) GetQuestion(ctx context.Context, id uuid.UUID) (*models.Question, error) {
	var question models.Question

	err := r.db.WithContext(ctx).
		Preload("Topic").
		Preload("SubTopic").
		Preload("Options", func(db *gorm.DB) *gorm.DB {
			return db.Order("position ASC")
		}).
		First(&question, "id = ?", id).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("question not found")
		}
		return nil, fmt.Errorf("failed to get question: %w", err)
	}

	return &question, nil
}

// ListQuestions retrieves questions with filters and pagination
func (r *QuestionRepository) ListQuestions(ctx context.Context, filter *dto.ListQuestionsFilter) ([]models.Question, int64, error) {
	var questions []models.Question
	var total int64

	query := r.db.WithContext(ctx).Model(&models.Question{})

	// Apply filters
	if filter.Search != "" {
		searchTerm := "%" + filter.Search + "%"
		query = query.Where(
			r.db.Where("content ILIKE ?", searchTerm).
				Or("explanation ILIKE ?", searchTerm).
				Or("reference_source ILIKE ?", searchTerm),
		)
	}

	if filter.TopicID != nil {
		query = query.Where("topic_id = ?", filter.TopicID)
	}

	if filter.SubTopicID != nil {
		query = query.Where("sub_topic_id = ?", filter.SubTopicID)
	}

	if filter.Province != "" {
		query = query.Where("province = ? OR province IS NULL", filter.Province)
	}

	if filter.QuestionType != "" {
		query = query.Where("question_type = ?", filter.QuestionType)
	}

	if filter.Difficulty != "" {
		query = query.Where("difficulty = ?", filter.Difficulty)
	}

	if filter.IsActive != nil {
		query = query.Where("is_active = ?", *filter.IsActive)
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count questions: %w", err)
	}

	// Apply pagination and ordering
	err := query.
		Preload("Topic").
		Preload("SubTopic").
		Preload("Options", func(db *gorm.DB) *gorm.DB {
			return db.Order("position ASC")
		}).
		Order("updated_at DESC").
		Limit(filter.GetPageSize()).
		Offset(filter.GetOffset()).
		Find(&questions).Error

	if err != nil {
		return nil, 0, fmt.Errorf("failed to list questions: %w", err)
	}

	return questions, total, nil
}

// UpdateQuestionTx updates a question with options in a transaction
func (r *QuestionRepository) UpdateQuestionTx(ctx context.Context, id uuid.UUID, req *dto.UpdateQuestionRequest) (*models.Question, error) {
	var question models.Question

	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Get existing question
		if err := tx.First(&question, "id = ?", id).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return fmt.Errorf("question not found")
			}
			return fmt.Errorf("failed to get question: %w", err)
		}

		// Validate SubTopic belongs to Topic if both provided
		topicID := question.TopicID
		if req.TopicID != nil {
			topicID = *req.TopicID
		}
		if req.SubTopicID != nil {
			if err := r.validateSubTopicBelongsToTopic(tx, topicID, *req.SubTopicID); err != nil {
				return err
			}
		}

		// Update question fields
		if req.Content != nil {
			question.Content = *req.Content
		}
		if req.QuestionType != nil {
			question.QuestionType = *req.QuestionType
		}
		if req.Difficulty != nil {
			question.Difficulty = *req.Difficulty
		}
		if req.TopicID != nil {
			question.TopicID = *req.TopicID
		}
		if req.SubTopicID != nil {
			question.SubTopicID = req.SubTopicID
		}
		if req.Province != nil {
			question.Province = req.Province
		}
		if req.Explanation != nil {
			question.Explanation = *req.Explanation
		}
		if req.ReferenceSource != nil {
			question.ReferenceSource = *req.ReferenceSource
		}
		if req.IsActive != nil {
			question.IsActive = *req.IsActive
		}

		if err := tx.Save(&question).Error; err != nil {
			return fmt.Errorf("failed to update question: %w", err)
		}

		// Update options if provided
		if len(req.Options) > 0 {
			// Get existing options
			var existingOptions []models.QuestionOption
			if err := tx.Where("question_id = ?", id).Find(&existingOptions).Error; err != nil {
				return fmt.Errorf("failed to get existing options: %w", err)
			}

			// Track which options to keep
			existingIDs := make(map[uuid.UUID]bool)
			for _, opt := range existingOptions {
				existingIDs[opt.ID] = true
			}

			providedIDs := make(map[uuid.UUID]bool)

			// Update or create options
			for _, optReq := range req.Options {
				if optReq.ID != nil {
					// Update existing option
					providedIDs[*optReq.ID] = true
					option := models.QuestionOption{
						ID:         *optReq.ID,
						QuestionID: question.ID,
						OptionText: optReq.OptionText,
						IsCorrect:  optReq.IsCorrect,
						Position:   optReq.Position,
					}
					if err := tx.Save(&option).Error; err != nil {
						return fmt.Errorf("failed to update option: %w", err)
					}
				} else {
					// Create new option
					option := models.QuestionOption{
						QuestionID: question.ID,
						OptionText: optReq.OptionText,
						IsCorrect:  optReq.IsCorrect,
						Position:   optReq.Position,
					}
					if err := tx.Create(&option).Error; err != nil {
						return fmt.Errorf("failed to create option: %w", err)
					}
				}
			}

			// Delete options not in the request
			for optID := range existingIDs {
				if !providedIDs[optID] {
					if err := tx.Delete(&models.QuestionOption{}, "id = ?", optID).Error; err != nil {
						return fmt.Errorf("failed to delete option: %w", err)
					}
				}
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	// Reload with associations
	if err := r.db.WithContext(ctx).
		Preload("Topic").
		Preload("SubTopic").
		Preload("Options", func(db *gorm.DB) *gorm.DB {
			return db.Order("position ASC")
		}).
		First(&question, question.ID).Error; err != nil {
		return nil, fmt.Errorf("failed to reload question: %w", err)
	}

	return &question, nil
}

// DeleteQuestion deletes a question (hard delete, cascade handled by DB)
func (r *QuestionRepository) DeleteQuestion(ctx context.Context, id uuid.UUID) error {
	result := r.db.WithContext(ctx).Delete(&models.Question{}, "id = ?", id)

	if result.Error != nil {
		return fmt.Errorf("failed to delete question: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("question not found")
	}

	return nil
}

// BulkUpdateStatus updates the is_active status for multiple questions
func (r *QuestionRepository) BulkUpdateStatus(ctx context.Context, ids []uuid.UUID, isActive bool) error {
	result := r.db.WithContext(ctx).
		Model(&models.Question{}).
		Where("id IN ?", ids).
		Update("is_active", isActive)

	if result.Error != nil {
		return fmt.Errorf("failed to bulk update status: %w", result.Error)
	}

	return nil
}

// BulkDelete deletes multiple questions
func (r *QuestionRepository) BulkDelete(ctx context.Context, ids []uuid.UUID) error {
	result := r.db.WithContext(ctx).Delete(&models.Question{}, "id IN ?", ids)

	if result.Error != nil {
		return fmt.Errorf("failed to bulk delete questions: %w", result.Error)
	}

	return nil
}

// validateSubTopicBelongsToTopic checks if a subtopic belongs to a topic
func (r *QuestionRepository) validateSubTopicBelongsToTopic(tx *gorm.DB, topicID, subTopicID uuid.UUID) error {
	var count int64
	err := tx.Model(&models.SubTopic{}).
		Where("id = ? AND topic_id = ?", subTopicID, topicID).
		Count(&count).Error

	if err != nil {
		return fmt.Errorf("failed to validate subtopic: %w", err)
	}

	if count == 0 {
		return dto.ErrSubTopicMismatch
	}

	return nil
}

// CheckDuplicate checks if a question with similar content exists
func (r *QuestionRepository) CheckDuplicate(ctx context.Context, content string, topicID uuid.UUID, excludeID *uuid.UUID) (bool, error) {
	query := r.db.WithContext(ctx).Model(&models.Question{}).
		Where("LOWER(content) = LOWER(?) AND topic_id = ?", strings.TrimSpace(content), topicID)

	if excludeID != nil {
		query = query.Where("id != ?", *excludeID)
	}

	var count int64
	if err := query.Count(&count).Error; err != nil {
		return false, fmt.Errorf("failed to check duplicate: %w", err)
	}

	return count > 0, nil
}
