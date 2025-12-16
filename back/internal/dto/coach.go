package dto

type CoachResponse struct {
    Summary            string            `json:"summary"`
    Strengths          []string          `json:"strengths"`
    Weaknesses         []string          `json:"weaknesses"`
    StudyPlan          []StudyPlanBlock  `json:"study_plan"`
    RecommendedTests   []string          `json:"recommended_tests"`
    MotivationalMessage string           `json:"motivational_message"`
}

type StudyPlanBlock struct {
    Title       string   `json:"title"`
    Description string   `json:"description"`
    Actions     []string `json:"actions"`
}
