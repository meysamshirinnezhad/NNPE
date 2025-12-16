package services

import (
    "fmt"
    "strings"

    "github.com/nppe-pro/api/internal/models"
)

type CoachInput struct {
    User        models.User
    Stats       models.UserStats
    WeakTopics  []string
    Improvement float64
}

func BuildCoachUserPrompt(input CoachInput) string {
    avg := input.Stats.AverageTestScore
    testsTaken := input.Stats.PracticeTestsTaken

    weakTopics := "none identified yet"
    if len(input.WeakTopics) > 0 {
        weakTopics = strings.Join(input.WeakTopics, ", ")
    }

    examDateStr := "not set"
    if input.User.ExamDate != nil {
        examDateStr = input.User.ExamDate.Format("2006-01-02")
    }

    return fmt.Sprintf(`
User data:
- Name: %s
- Practice tests taken: %d
- Average score: %.1f%%
- Score improvement in last 30 days: %.1f percentage points
- Weak topics: %s
- Exam date: %s

Instructions:
Using this data, generate an NPPE study coaching response in JSON ONLY,
following the exact schema defined in the system message.
Use short, clear sentences. Keep the study plan realistic for a working adult with limited time.
`, input.User.FirstName, testsTaken, avg, input.Improvement, weakTopics, examDateStr)
}
