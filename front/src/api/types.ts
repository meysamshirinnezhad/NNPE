// Base types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  province: string;
  exam_date?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// User types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  province: string;
  exam_date?: string;
  is_verified: boolean;
  is_admin: boolean;
  avatar_url?: string;
  study_streak: number;
  longest_streak: number;
  subscription_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends User {
  questions_completed: number;
  practice_tests_taken: number;
  subscription?: Subscription;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  province?: string;
  exam_date?: string;
}

export interface UserStats {
  questions_completed: number;
  questions_correct: number;
  practice_tests_taken: number;
  average_test_score: number;
  time_studied_hours: number;
}

// Question types
export interface Topic {
  id: string;
  name: string;
  code: string;
  description: string;
  weight: number;
  order: number;
}

export interface SubTopic {
  id: string;
  topic_id: string;
  name: string;
  code: string;
  description: string;
  order: number;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  position: number;
}

export interface Question {
  id: string;
  content: string;
  question_type: 'multiple_choice_single' | 'multiple_choice_multi' | 'true_false';
  difficulty: 'easy' | 'medium' | 'hard';
  topic_id: string;
  topic?: Topic;
  topic_name?: string;
  sub_topic_id?: string;
  sub_topic?: SubTopic;
  sub_topic_name?: string;
  province?: string;
  explanation: string;
  reference_source: string;
  is_active: boolean;
  options: QuestionOption[];
  created_at: string;
  updated_at: string;
}

// Admin Question Types
export interface CreateQuestionOption {
  option_text: string;
  is_correct: boolean;
}

export interface CreateQuestionRequest {
  content: string;
  question_type: 'multiple_choice_single' | 'multiple_choice_multi' | 'true_false';
  difficulty: 'easy' | 'medium' | 'hard';
  topic_id: string;
  sub_topic_id?: string;
  province?: string;
  explanation?: string;
  reference_source?: string;
  is_active?: boolean;
  options: CreateQuestionOption[];
}

export interface UpdateQuestionOption {
  id?: string;
  option_text: string;
  is_correct: boolean;
  position: number;
}

export interface UpdateQuestionRequest {
  content?: string;
  question_type?: 'multiple_choice_single' | 'multiple_choice_multi' | 'true_false';
  difficulty?: 'easy' | 'medium' | 'hard';
  topic_id?: string;
  sub_topic_id?: string;
  province?: string;
  explanation?: string;
  reference_source?: string;
  is_active?: boolean;
  options?: UpdateQuestionOption[];
}

export interface QuestionFilters {
  q?: string;
  topic_id?: string;
  sub_topic_id?: string;
  province?: string;
  question_type?: 'multiple_choice_single' | 'multiple_choice_multi' | 'true_false';
  difficulty?: 'easy' | 'medium' | 'hard';
  is_active?: boolean;
  page?: number;
  page_size?: number;
}

export interface ListQuestionsResponse {
  items: Question[];
  total: number;
  page: number;
  page_size: number;
}

export interface BulkOperationRequest {
  ids: string[];
  op: 'activate' | 'deactivate' | 'delete';
}

export interface GetQuestionsParams {
  topic_id?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  province?: string;
  limit?: number;
  page?: number;
  exclude_answered?: boolean;
  random?: boolean;
}

export interface QuestionsResponse {
  questions: Question[];
  pagination: PaginationMeta;
}

export interface SubmitAnswerRequest {
  selected_option_id: string;
  time_spent_seconds: number;
}

export interface AnswerResponse {
  is_correct: boolean;
  correct_option_id: string;
  explanation: string;
  reference_source: string;
  your_answer_id: string;
}

export interface UserTopicMastery {
  id: string;
  user_id: string;
  topic_id: string;
  topic?: Topic;
  questions_attempted: number;
  questions_correct: number;
  mastery_percentage: number;
  last_practiced: string;
}

// Practice Test types
export interface PracticeTest {
  id: string;
  user_id: string;
  test_type: 'full_exam' | 'topic_specific' | 'custom';
  status: 'in_progress' | 'completed' | 'abandoned';
  total_questions: number;
  correct_answers: number;
  score: number;
  time_spent_seconds: number;
  time_limit_minutes: number;
  started_at: string;
  completed_at?: string;
  questions?: PracticeTestQuestion[];
}

export interface PracticeTestQuestion {
  id: string;
  practice_test_id: string;
  question_id: string;
  question?: Question;
  position: number;
  answer_id?: string;
  is_correct?: boolean;
  time_spent_seconds: number;
}

export interface TestHistoryItem {
  id: string;
  topic_id?: string;
  topic_name?: string;
  created_at: string;
  completed_at?: string;
  status: 'completed' | 'in_progress' | 'abandoned';
  score: number;
  total_questions: number;
  correct: number;
  incorrect: number;
  duration_seconds: number;
}

export interface TestHistoryResponse {
  items: TestHistoryItem[];
  page: number;
  page_size: number;
  total: number;
}

export interface GetTestHistoryParams {
  topic_id?: string;
  test_key?: string;
  status?: 'completed' | 'in_progress' | 'all';
  page?: number;
  page_size?: number;
}

export interface StartTestRequest {
  test_type: 'full_exam' | 'topic_specific' | 'custom';
  topic_ids?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  question_count?: number;
  time_limit_minutes?: number;
}

export interface StartTestResponse {
  test_id: string;
  questions: Question[];
  total_questions: number;
  time_limit_minutes: number;
  started_at: string;
}

export interface TestResultResponse {
  test_id: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  time_spent_seconds: number;
  pass_status: boolean;
  performance_by_topic: TopicPerformance[];
  weak_topics: string[];
  pass_probability: number;
  completed_at: string;
}

export interface TopicPerformance {
  topic_name: string;
  correct: number;
  total: number;
  percentage: number;
}

// Comprehensive Test Results (matching TEST_RESULTS_API_SPECIFICATION.md)
export interface TestResultsResponse {
  // Basic Test Information
  id: string;
  user_id: string;
  test_type: string;
  title: string;
  status: string;

  // Core Metrics
  score: number;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  unanswered: number;

  // Time Tracking
  started_at: string;
  completed_at: string;
  time_spent_seconds: number;
  average_time_per_question: number;

  // Pass/Fail Status
  passed: boolean;
  passing_score: number;

  // Performance Breakdown
  topic_breakdown: TopicPerformanceDetail[];
  question_results: QuestionResult[];
  difficulty_breakdown: DifficultyBreakdownData;

  // Achievements & Recommendations
  achievements_unlocked: Achievement[];
  badges_earned: Badge[];
  weak_areas: string[];
  study_recommendations: Recommendation[];

  // Historical Context
  improvement_metrics?: ImprovementMetrics;
  leaderboard_stats?: LeaderboardStats;
}

export interface TopicPerformanceDetail {
  topic_id: string;
  topic_name: string;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  percentage: number;
  average_time_seconds: number;
  difficulty_distribution?: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface SubtopicPerformance {
  subtopic_id: string;
  subtopic_name: string;
  topic_id: string;
  topic_name: string;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  percentage: number;
}

export interface QuestionResult {
  question_id: string;
  question_number: number;
  topic_id: string;
  topic_name: string;
  subtopic_id?: string;
  subtopic_name?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_text: string;
  question_type: 'multiple_choice' | 'true_false';
  options: AnswerOption[];
  user_answer_id?: string;
  correct_answer_id: string;
  is_correct: boolean;
  time_spent_seconds: number;
  explanation?: string;
  reference?: string;
  is_bookmarked: boolean;
  global_correct_rate?: number;
}

export interface AnswerOption {
  id: string;
  text: string;
  is_correct: boolean;
  order: number;
}

export interface DifficultyBreakdownData {
  easy: DifficultyStats;
  medium: DifficultyStats;
  hard: DifficultyStats;
}

export interface DifficultyStats {
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  percentage: number;
  average_time_seconds: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned_at: string;
  points: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  earned_at: string;
}

export interface Recommendation {
  type: 'study' | 'practice' | 'review' | 'group';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action_url?: string;
  icon?: string;
}

export interface ImprovementMetrics {
  score_change: number;
  previous_score?: number;
  tests_taken: number;
  average_score: number;
}

export interface LeaderboardStats {
  rank: number;
  percentile: number;
  total_participants: number;
}

// Dashboard types
export interface DashboardData {
  overall_progress: number;
  study_streak: number;
  longest_streak: number;
  questions_completed: number;
  questions_correct: number;
  accuracy_rate: number;
  practice_tests_taken: number;
  average_test_score: number;
  time_studied_hours: number;
  pass_probability: number;
  days_until_exam: number;
  recommended_study_time_daily: number;
  topic_mastery: UserTopicMastery[];
  weak_topics: WeakTopic[];
  recent_activity: Activity[];
}

export interface WeakTopic {
  name: string;
  score: number;
  questions_attempted?: number;
  sub_topics?: SubTopicScore[];
  recommended_practice?: number;
}

export interface SubTopicScore {
  name: string;
  score: number;
  questions_attempted: number;
}

export interface Activity {
  type: 'practice_test' | 'question' | 'module' | 'achievement';
  description: string;
  score?: number;
  timestamp: string;
}

export interface AnalyticsData {
  timeframe: '7d' | '30d' | '90d' | 'all';
  questions_per_day: DailyMetric[];
  accuracy_trend: DailyMetric[];
  time_spent_per_day: DailyMetric[];
  topic_breakdown: TopicBreakdown[];
}

export interface DailyMetric {
  date: string;
  count?: number;
  percentage?: number;
  minutes?: number;
}

export interface TopicBreakdown {
  topic: string;
  questions: number;
  correct: number;
}

// Subscription types
export interface Subscription {
  id: string;
  user_id: string;
  plan: 'free' | 'monthly' | 'annual';
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
}

export interface CreateSubscriptionRequest {
  plan: 'monthly' | 'annual';
  payment_method_id: string;
}

// Study Path types
export interface StudyPath {
  id: string;
  user_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  current_week: number;
  start_date?: string;
  target_date?: string;
  modules: Module[];
  progress_percentage: number;
  next_module?: Module;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  week: number;
  order: number;
  topic_id: string;
  topic?: Topic;
  duration_minutes: number;
  content_url: string;
  video_url: string;
  status?: 'not_started' | 'in_progress' | 'completed';
  progress?: number;
  completed_at?: string;
}

export interface UpdateModuleProgressRequest {
  progress: number;
  time_spent_seconds: number;
}

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  type: 'achievement' | 'reminder' | 'system' | 'test_result';
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  daily_reminder: boolean;
  reminder_time: string;
  weekly_report: boolean;
}

// Bookmark types
export interface Bookmark {
  id: string;
  user_id: string;
  question_id: string;
  question?: Question;
  created_at: string;
}