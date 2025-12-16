package dto

type DashboardResponse struct {
    UserName            string                 `json:"user_name"`
    LastScore           float64                `json:"last_score"`
    TestsTaken          TestsTakenBlock        `json:"tests_taken"`
    AverageScore        AverageScoreBlock      `json:"average_score"`
    StudyStreak         StudyStreakBlock       `json:"study_streak"`
    PassReadyPercentage float64                `json:"pass_ready_percentage"`
    RecentTests         []RecentTestItem       `json:"recent_tests"`
    ScoreProgression    []ScorePoint           `json:"score_progression"`
    RecentAchievements  []AchievementItem      `json:"recent_achievements"`
    ExamCountdown       ExamCountdownBlock     `json:"exam_countdown"`
    RecommendedTests    []RecommendedTest      `json:"recommended_tests"`
    AlmostThereSummary  AlmostThereSummaryBlock`json:"almost_there_summary"`
}

// Small sub-structs

type TestsTakenBlock struct {
    Total     int   `json:"total"`
    ThisMonth int64 `json:"this_month"`
}

type AverageScoreBlock struct {
    Current     float64 `json:"current"`
    Improvement float64 `json:"improvement"` // e.g. +12.0 means +12%
}

type StudyStreakBlock struct {
    Current int `json:"current"`
    Longest int `json:"longest"`
}

type RecentTestItem struct {
    ID          string  `json:"id"`
    Name        string  `json:"name"`
    Date        string  `json:"date"`
    Duration    string  `json:"duration"`
    Questions   int     `json:"questions"`
    Score       float64 `json:"score"`
    Delta       float64 `json:"delta"`
    ReviewLink  string  `json:"review_link"`
}

type ScorePoint struct {
    Label string  `json:"label"` // e.g. "Test #4"
    Score float64 `json:"score"`
}

type AchievementItem struct {
    Title       string `json:"title"`
    Description string `json:"description"`
    Icon        string `json:"icon"`
    EarnedAt    string `json:"earned_at"`
}

type ExamCountdownBlock struct {
    DaysLeft     int     `json:"days_left"`
    PrepTimeUsed float64 `json:"prep_time_used"`
}

type RecommendedTest struct {
    Title       string `json:"title"`
    Questions   int    `json:"questions"`
    Duration    string `json:"duration"`
    Difficulty  string `json:"difficulty"`
    Focus       string `json:"focus"`
    Recommended bool   `json:"recommended"`
}

type AlmostThereSummaryBlock struct {
    TestsCompleted     int     `json:"tests_completed"`
    ImprovementPercent float64 `json:"improvement_percent"`
    AchievementsCount  int     `json:"achievements_count"`
}
