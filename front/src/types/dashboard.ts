export interface DashboardResponse {
  user_name: string;
  last_score: number;

  tests_taken: TestsTakenBlock;
  average_score: AverageScoreBlock;
  study_streak: StudyStreakBlock;

  pass_ready_percentage: number;

  recent_tests: RecentTestItem[];
  score_progression: ScorePoint[];
  recent_achievements: AchievementItem[];

  exam_countdown: ExamCountdownBlock;
  recommended_tests: RecommendedTest[];

  almost_there_summary: AlmostThereSummaryBlock;
}

export interface TestsTakenBlock {
  total: number;
  this_month: number;
}

export interface AverageScoreBlock {
  current: number;
  improvement: number; // e.g. +2.87
}

export interface StudyStreakBlock {
  current: number;
  longest: number;
}

export interface RecentTestItem {
  id: string;
  name: string;
  date: string;      // "YYYY-MM-DD" from backend
  duration: string;  // "2h 45m"
  questions: number;
  score: number;
  delta: number;
  review_link: string;
}

export interface ScorePoint {
  label: string; // "Test #4"
  score: number;
}

export interface AchievementItem {
  title: string;
  description: string;
  icon: string;
  earned_at: string; // ISO timestamp
}

export interface ExamCountdownBlock {
  days_left: number;
  prep_time_used: number; // percent
}

export interface RecommendedTest {
  title: string;
  questions: number;
  duration: string;
  difficulty: string;
  focus: string;
  recommended: boolean;
}

export interface AlmostThereSummaryBlock {
  tests_completed: number;
  improvement_percent: number;
  achievements_count: number;
}
