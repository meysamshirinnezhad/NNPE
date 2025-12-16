package handlers

import (
    "database/sql"
    "log"
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
    "github.com/nppe-pro/api/internal/dto"
    "github.com/nppe-pro/api/internal/models"
    "github.com/nppe-pro/api/internal/services"
    "github.com/nppe-pro/api/pkg/database"
    "gorm.io/gorm"
)

type CoachHandler struct {
    db        *gorm.DB
    redis     *database.RedisClient
    orClient  *services.OpenRouterClient
}

func NewCoachHandler(db *gorm.DB, redis *database.RedisClient, orClient *services.OpenRouterClient) *CoachHandler {
    return &CoachHandler{db: db, redis: redis, orClient: orClient}
}

func (h *CoachHandler) GetCoach(c *gin.Context) {
    rawUserID, ok := c.Get("user_id")
    if !ok {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
        return
    }
    userID, ok := rawUserID.(uuid.UUID)
    if !ok {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
        return
    }

    ctx := c.Request.Context()

    // 1) Load user
    var user models.User
    if err := h.db.WithContext(ctx).First(&user, "id = ?", userID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
        return
    }

    // 2) Load stats
    var stats models.UserStats
    _ = h.db.WithContext(ctx).First(&stats, "user_id = ?", userID).Error // allow zero stats

    // 3) Calculate improvement
    improvement := h.calculateScoreImprovement(userID)

    // 4) Get weak topics
    weakTopics := h.calculateWeakTopics(userID)

    // 5) Build prompts
    coachInput := services.CoachInput{
        User:        user,
        Stats:       stats,
        WeakTopics:  weakTopics,
        Improvement: improvement,
    }
    userPrompt := services.BuildCoachUserPrompt(coachInput)

    var coachResp *dto.CoachResponse
    var err error
    coachResp, err = h.orClient.GenerateCoachResponse(ctx, services.NPPECoachSystemPrompt, userPrompt)
    if err != nil {
        log.Printf("AI Coach error: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "AI coach unavailable"})
        return
    }

    c.JSON(http.StatusOK, coachResp)
}

func (h *CoachHandler) calculateScoreImprovement(userID uuid.UUID) float64 {
	now := time.Now()
	thirtyDaysAgo := now.AddDate(0, 0, -30)
	sixtyDaysAgo := now.AddDate(0, 0, -60)

	var recentAvg, previousAvg sql.NullFloat64

	h.db.Model(&models.PracticeTest{}).
		Where("user_id = ? AND status = ? AND completed_at >= ?",
			userID, "completed", thirtyDaysAgo).
		Select("AVG(score)").Scan(&recentAvg)

	h.db.Model(&models.PracticeTest{}).
		Where("user_id = ? AND status = ? AND completed_at BETWEEN ? AND ?",
			userID, "completed", sixtyDaysAgo, thirtyDaysAgo).
		Select("AVG(score)").Scan(&previousAvg)

	recent := 0.0
	if recentAvg.Valid {
		recent = recentAvg.Float64
	}

	previous := 0.0
	if previousAvg.Valid {
		previous = previousAvg.Float64
	}

	return recent - previous
}

func (h *CoachHandler) calculateWeakTopics(userID uuid.UUID) []string {
    type WeakTopicStats struct {
        TopicName string
        Attempted int
        Correct   int
    }

    var weakStats []WeakTopicStats
    err := h.db.Table("user_answers").
        Select("topics.name as topic_name, COUNT(*) as attempted, SUM(CASE WHEN user_answers.is_correct THEN 1 ELSE 0 END) as correct").
        Joins("JOIN questions ON user_answers.question_id = questions.id").
        Joins("JOIN topics ON questions.topic_id = topics.id").
        Where("user_answers.user_id = ?", userID).
        Group("topics.name").
        Having("COUNT(*) > 0").
        Scan(&weakStats).Error

    if err != nil || len(weakStats) == 0 {
        return []string{}
    }

    weakTopics := make([]string, 0)
    for _, ws := range weakStats {
        score := float64(0)
        if ws.Attempted > 0 {
            score = (float64(ws.Correct) / float64(ws.Attempted)) * 100
        }

        if score < 70.0 {
            weakTopics = append(weakTopics, ws.TopicName)
        }
    }

    return weakTopics
}
