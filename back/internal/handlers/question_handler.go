package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/nppe-pro/api/internal/handlers/dto"
	"github.com/nppe-pro/api/internal/models"
	"github.com/nppe-pro/api/internal/repo"
	"github.com/nppe-pro/api/pkg/database"
	"gorm.io/gorm"
)

type QuestionHandler struct {
	db    *gorm.DB
	redis *database.RedisClient
	repo  *repo.QuestionRepository
}

func NewQuestionHandler(db *gorm.DB, redis *database.RedisClient) *QuestionHandler {
	return &QuestionHandler{
		db:    db,
		redis: redis,
		repo:  repo.NewQuestionRepository(db),
	}
}

// GetQuestions returns a list of questions (public endpoint - only active)
func (h *QuestionHandler) GetQuestions(c *gin.Context) {
	var questions []models.Question
	query := h.db.Preload("Topic").Preload("SubTopic").Preload("Options").Where("is_active = ?", true)

	// Filter by topic
	if topicID := c.Query("topic_id"); topicID != "" {
		query = query.Where("topic_id = ?", topicID)
	}

	// Filter by subtopic
	if subTopicID := c.Query("sub_topic_id"); subTopicID != "" {
		query = query.Where("sub_topic_id = ?", subTopicID)
	}

	// Filter by difficulty
	if difficulty := c.Query("difficulty"); difficulty != "" {
		query = query.Where("difficulty = ?", difficulty)
	}

	// Pagination
	limit := 20
	if l := c.Query("limit"); l != "" {
		if parsedLimit, err := strconv.Atoi(l); err == nil && parsedLimit > 0 && parsedLimit <= 100 {
			limit = parsedLimit
		}
	}

	offset := 0
	if o := c.Query("offset"); o != "" {
		if parsedOffset, err := strconv.Atoi(o); err == nil && parsedOffset >= 0 {
			offset = parsedOffset
		}
	}

	var total int64
	query.Model(&models.Question{}).Count(&total)

	if err := query.Limit(limit).Offset(offset).Find(&questions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch questions"})
		return
	}

	// Add topic/subtopic codes to response
	type QuestionResponse struct {
		models.Question
		TopicCode    string `json:"topic_code,omitempty"`
		SubTopicCode string `json:"sub_topic_code,omitempty"`
	}

	var response []QuestionResponse
	for _, q := range questions {
		qr := QuestionResponse{Question: q}
		if q.Topic != nil {
			qr.TopicCode = q.Topic.Code
		}
		if q.SubTopic != nil {
			qr.SubTopicCode = q.SubTopic.Code
		}
		response = append(response, qr)
	}

	c.JSON(http.StatusOK, gin.H{
		"questions": response,
		"total":     total,
		"limit":     limit,
		"offset":    offset,
	})
}

// GetQuestion returns a single question (public endpoint)
func (h *QuestionHandler) GetQuestion(c *gin.Context) {
	id := c.Param("id")
	var question models.Question

	if err := h.db.Preload("Topic").Preload("SubTopic").Preload("Options").
		Where("id = ? AND is_active = ?", id, true).
		First(&question).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Question not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch question"})
		return
	}

	c.JSON(http.StatusOK, question)
}

// SubmitAnswer submits an answer to a question
func (h *QuestionHandler) SubmitAnswer(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Submit answer endpoint"})
}

// BookmarkQuestion bookmarks a question
func (h *QuestionHandler) BookmarkQuestion(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Bookmark question endpoint"})
}

// RemoveBookmark removes a bookmark
func (h *QuestionHandler) RemoveBookmark(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Remove bookmark endpoint"})
}

// GetTopics returns all topics
func (h *QuestionHandler) GetTopics(c *gin.Context) {
	var topics []models.Topic

	if err := h.db.Order("\"order\" ASC").Find(&topics).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch topics"})
		return
	}

	c.JSON(http.StatusOK, topics)
}

// GetTopic returns a single topic with its subtopics
func (h *QuestionHandler) GetTopic(c *gin.Context) {
	id := c.Param("id")
	var topic models.Topic

	if err := h.db.First(&topic, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Topic not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch topic"})
		return
	}

	var subTopics []models.SubTopic
	if err := h.db.Where("topic_id = ?", id).Order("\"order\" ASC").Find(&subTopics).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch subtopics"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":          topic.ID,
		"name":        topic.Name,
		"code":        topic.Code,
		"description": topic.Description,
		"weight":      topic.Weight,
		"order":       topic.Order,
		"sub_topics":  subTopics,
		"created_at":  topic.CreatedAt,
		"updated_at":  topic.UpdatedAt,
	})
}

// ===== ADMIN ENDPOINTS =====

// AdminListQuestions lists all questions with filters (admin only)
func (h *QuestionHandler) AdminListQuestions(c *gin.Context) {
	var filter dto.ListQuestionsFilter
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	questions, total, err := h.repo.ListQuestions(c.Request.Context(), &filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch questions"})
		return
	}

	// Build response
	items := make([]dto.QuestionResponse, len(questions))
	for i, q := range questions {
		items[i] = buildQuestionResponse(&q)
	}

	c.JSON(http.StatusOK, dto.ListQuestionsResponse{
		Items:    items,
		Total:    total,
		Page:     filter.GetPage(),
		PageSize: filter.GetPageSize(),
	})
}

// AdminGetQuestion gets a single question with all details (admin only)
func (h *QuestionHandler) AdminGetQuestion(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid question ID"})
		return
	}

	question, err := h.repo.GetQuestion(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Question not found"})
		return
	}

	c.JSON(http.StatusOK, buildQuestionResponse(question))
}

// CreateQuestion creates a new question (admin only)
func (h *QuestionHandler) CreateQuestion(c *gin.Context) {
	var req dto.CreateQuestionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate request
	if err := req.Validate(); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	question, err := h.repo.CreateQuestionTx(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, buildQuestionResponse(question))
}

// UpdateQuestion updates a question (admin only)
func (h *QuestionHandler) UpdateQuestion(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid question ID"})
		return
	}

	var req dto.UpdateQuestionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"details": err.Error(),
		})
		return
	}

	// Validate request
	if err := req.Validate(); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Validation failed",
			"details": err.Error(),
		})
		return
	}

	question, err := h.repo.UpdateQuestionTx(c.Request.Context(), id, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to update question",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, buildQuestionResponse(question))
}

// DeleteQuestion deletes a question (admin only)
func (h *QuestionHandler) DeleteQuestion(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid question ID"})
		return
	}

	if err := h.repo.DeleteQuestion(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

// BulkOperations performs bulk operations on questions (admin only)
func (h *QuestionHandler) BulkOperations(c *gin.Context) {
	var req dto.BulkOperationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var err error
	switch req.Operation {
	case "activate":
		err = h.repo.BulkUpdateStatus(c.Request.Context(), req.IDs, true)
	case "deactivate":
		err = h.repo.BulkUpdateStatus(c.Request.Context(), req.IDs, false)
	case "delete":
		err = h.repo.BulkDelete(c.Request.Context(), req.IDs)
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid operation"})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Bulk operation completed successfully",
		"count":   len(req.IDs),
	})
}

// Helper function to build question response DTO
func buildQuestionResponse(q *models.Question) dto.QuestionResponse {
	resp := dto.QuestionResponse{
		ID:              q.ID,
		Content:         q.Content,
		QuestionType:    q.QuestionType,
		Difficulty:      q.Difficulty,
		TopicID:         q.TopicID,
		SubTopicID:      q.SubTopicID,
		Province:        q.Province,
		Explanation:     q.Explanation,
		ReferenceSource: q.ReferenceSource,
		IsActive:        q.IsActive,
		CreatedAt:       q.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:       q.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	if q.Topic != nil {
		resp.TopicName = q.Topic.Name
	}

	if q.SubTopic != nil {
		resp.SubTopicName = q.SubTopic.Name
	}

	resp.Options = make([]dto.OptionResponse, len(q.Options))
	for i, opt := range q.Options {
		resp.Options[i] = dto.OptionResponse{
			ID:         opt.ID,
			OptionText: opt.OptionText,
			IsCorrect:  opt.IsCorrect,
			Position:   opt.Position,
		}
	}

	return resp
}
