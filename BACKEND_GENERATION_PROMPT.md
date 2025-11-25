# AI Backend Generation Prompt
## NPPE Platform - Complete Backend Implementation Guide

**Purpose**: Generate complete, production-ready backend endpoint implementations for the NPPE exam preparation platform.

**Target**: AI Code Generation Assistant (Claude, GPT-4, etc.)

**Language**: Go 1.23+ with Gin framework, GORM, PostgreSQL, Redis

---

## Context & Overview

You are tasked with implementing missing backend endpoints for the NPPE (National Professional Practice Examination) preparation platform. The platform is a comprehensive exam preparation system built with:

- **Frontend**: React 19 + TypeScript + Vite (37 pages, 8 API services)
- **Backend**: Go 1.23 + Gin + GORM + PostgreSQL + Redis
- **Authentication**: JWT-based with cookie and header support
- **Database**: PostgreSQL 15+ with 24+ models already defined

The frontend is **complete** and waiting for backend implementation. Many backend handlers currently return placeholder responses like `gin.H{"message": "endpoint not implemented"}`.

---

## Project Structure

```
/home/user/NNPE/
├── front/                          # React frontend (COMPLETE)
│   └── src/
│       ├── api/
│       │   ├── types.ts           # All TypeScript interfaces (620 lines)
│       │   ├── client.ts          # Axios client with interceptors
│       │   └── services/          # 8 API service modules
│       │       ├── auth.service.ts
│       │       ├── user.service.ts
│       │       ├── question.service.ts
│       │       ├── test.service.ts
│       │       ├── dashboard.service.ts
│       │       ├── study.service.ts
│       │       ├── admin.service.ts
│       │       └── admin.questions.service.ts
│       └── pages/                 # 37 page components
│
└── back/                          # Go backend (PARTIAL)
    ├── cmd/
    │   └── api/main.go           # Entry point (likely not created yet)
    ├── internal/
    │   ├── handlers/             # HTTP handlers (5 files, many placeholders)
    │   │   ├── auth_handler.go   # ✅ COMPLETE
    │   │   ├── user_handler.go   # ❌ MOSTLY PLACEHOLDERS
    │   │   ├── question_handler.go # ✅ COMPLETE
    │   │   ├── test_handler.go   # ✅ COMPLETE
    │   │   └── dashboard_handler.go # ⚠️ PARTIAL
    │   └── models/               # Database models (✅ ALL DEFINED)
    │       ├── user.go
    │       ├── question.go
    │       ├── test.go
    │       ├── subscription.go
    │       ├── notification.go
    │       └── study.go
    ├── pkg/
    │   ├── database/
    │   │   ├── postgres.go       # ✅ Connection + auto-migration
    │   │   └── redis.go          # ✅ Redis client
    │   ├── jwt/
    │   │   └── jwt.go            # ✅ JWT generation/validation
    │   └── middleware/
    │       ├── auth.go           # ✅ JWT authentication
    │       └── cors.go           # ✅ CORS middleware
    └── config/
        └── config.go             # ✅ Configuration management
```

---

## Database Models Reference

All models are defined in `/back/internal/models/`. Key models:

### User & Stats
```go
type User struct {
    ID             uuid.UUID
    Email          string         // UNIQUE
    PasswordHash   string         // bcrypt hashed
    FirstName      string
    LastName       string
    Province       string
    ExamDate       *time.Time
    IsVerified     bool
    IsAdmin        bool
    AvatarURL      string
    StudyStreak    int
    LongestStreak  int
    LastStudyDate  *time.Time
    SubscriptionID *uuid.UUID
    OAuthProvider  string
    OAuthID        string
    CreatedAt      time.Time
    UpdatedAt      time.Time
    DeletedAt      gorm.DeletedAt // Soft delete
}

type UserStats struct {
    ID                 uuid.UUID
    UserID             uuid.UUID // UNIQUE FK
    QuestionsCompleted int
    QuestionsCorrect   int
    PracticeTestsTaken int
    AverageTestScore   float64
    TimeStudiedSeconds int
    UpdatedAt          time.Time
}
```

### Questions
```go
type Question struct {
    ID              uuid.UUID
    Content         string
    QuestionType    string // multiple_choice_single, multiple_choice_multi, true_false
    Difficulty      string // easy, medium, hard
    TopicID         uuid.UUID
    Topic           *Topic
    SubTopicID      *uuid.UUID
    SubTopic        *SubTopic
    Province        *string // null = all provinces
    Explanation     string
    ReferenceSource string
    IsActive        bool
    Options         []QuestionOption
    CreatedAt       time.Time
    UpdatedAt       time.Time
    DeletedAt       gorm.DeletedAt
}

type UserBookmark struct {
    ID         uuid.UUID
    UserID     uuid.UUID
    QuestionID uuid.UUID
    Question   *Question
    CreatedAt  time.Time
    // UNIQUE constraint on (user_id, question_id)
}

type UserTopicMastery struct {
    ID                 uuid.UUID
    UserID             uuid.UUID
    TopicID            uuid.UUID
    Topic              *Topic
    QuestionsAttempted int
    QuestionsCorrect   int
    MasteryPercentage  float64
    LastPracticed      time.Time
    UpdatedAt          time.Time
    // UNIQUE constraint on (user_id, topic_id)
}
```

### Subscriptions
```go
type Subscription struct {
    ID                   uuid.UUID
    UserID               uuid.UUID // UNIQUE FK
    Plan                 string    // free, monthly, annual
    Status               string    // active, cancelled, expired, past_due
    StripeCustomerID     string
    StripeSubscriptionID string
    CurrentPeriodStart   time.Time
    CurrentPeriodEnd     time.Time
    CancelAtPeriodEnd    bool
    CancelledAt          *time.Time
    CreatedAt            time.Time
    UpdatedAt            time.Time
}

type Payment struct {
    ID              uuid.UUID
    UserID          uuid.UUID
    SubscriptionID  uuid.UUID
    Amount          int    // cents
    Currency        string // CAD
    Status          string // succeeded, pending, failed
    StripePaymentID string
    Description     string
    CreatedAt       time.Time
}
```

### Notifications
```go
type Notification struct {
    ID        uuid.UUID
    UserID    uuid.UUID
    Type      string // achievement, reminder, system, test_result
    Title     string
    Message   string
    Link      string
    IsRead    bool
    CreatedAt time.Time
}

type UserNotificationSettings struct {
    ID                 uuid.UUID
    UserID             uuid.UUID // UNIQUE FK
    EmailNotifications bool
    PushNotifications  bool
    DailyReminder      bool
    ReminderTime       string // HH:MM
    WeeklyReport       bool
    CreatedAt          time.Time
    UpdatedAt          time.Time
}
```

### Study Path
```go
type StudyPath struct {
    ID          uuid.UUID
    UserID      uuid.UUID // UNIQUE FK
    Status      string    // not_started, in_progress, completed
    CurrentWeek int
    StartDate   *time.Time
    TargetDate  *time.Time
    CreatedAt   time.Time
    UpdatedAt   time.Time
}

type Module struct {
    ID              uuid.UUID
    Title           string
    Description     string
    Week            int
    Order           int
    TopicID         uuid.UUID
    Topic           *Topic
    DurationMinutes int
    ContentURL      string
    VideoURL        string
    CreatedAt       time.Time
    UpdatedAt       time.Time
}

type UserModuleProgress struct {
    ID          uuid.UUID
    UserID      uuid.UUID
    ModuleID    uuid.UUID
    Module      *Module
    Status      string // not_started, in_progress, completed
    Progress    int    // 0-100
    TimeSpent   int    // seconds
    StartedAt   *time.Time
    CompletedAt *time.Time
    CreatedAt   time.Time
    UpdatedAt   time.Time
    // UNIQUE constraint on (user_id, module_id)
}
```

### Community
```go
type ForumPost struct {
    ID         uuid.UUID
    UserID     uuid.UUID
    User       *User
    Title      string
    Content    string
    Category   string
    ViewCount  int
    ReplyCount int
    IsPinned   bool
    IsLocked   bool
    CreatedAt  time.Time
    UpdatedAt  time.Time
    Replies    []ForumReply
}

type ForumReply struct {
    ID         uuid.UUID
    PostID     uuid.UUID
    UserID     uuid.UUID
    User       *User
    Content    string
    IsAccepted bool
    CreatedAt  time.Time
    UpdatedAt  time.Time
}

type StudyGroup struct {
    ID          uuid.UUID
    Name        string
    Description string
    CreatorID   uuid.UUID
    Creator     *User
    MemberCount int
    IsPrivate   bool
    CreatedAt   time.Time
    UpdatedAt   time.Time
    Members     []StudyGroupMember
}

type StudyGroupMember struct {
    ID       uuid.UUID
    GroupID  uuid.UUID
    UserID   uuid.UUID
    User     *User
    Role     string // owner, moderator, member
    JoinedAt time.Time
    // UNIQUE constraint on (group_id, user_id)
}
```

---

## Frontend API Contracts

The frontend expects specific response structures. **You must match these exactly.**

### TypeScript Type Reference
Location: `/front/src/api/types.ts` (620 lines)

Key types the backend must return:

```typescript
// User Management
interface UserProfile extends User {
  questions_completed: number;
  practice_tests_taken: number;
  subscription?: Subscription;
}

// Dashboard
interface DashboardData {
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

// Analytics
interface AnalyticsData {
  timeframe: '7d' | '30d' | '90d' | 'all';
  questions_per_day: DailyMetric[];
  accuracy_trend: DailyMetric[];
  time_spent_per_day: DailyMetric[];
  topic_breakdown: TopicBreakdown[];
}

// Study Path
interface StudyPath {
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
```

---

## Implementation Requirements by Category

### 🔴 PRIORITY 0 - Critical User Features

#### 1. User Profile Management (`user_handler.go`)

**Current Status**: Placeholders at lines 29, 43, 48, 53, 58

**Implement These Handlers**:

##### a) `GetProfile(c *gin.Context)`
```go
// GET /users/me
// Returns: UserProfile (includes user data + stats + subscription)
// Must include:
// - User fields (from User model)
// - questions_completed, questions_correct (from UserStats)
// - practice_tests_taken (from UserStats)
// - subscription (from Subscription, if exists)
```

**Implementation Notes**:
- Get user_id from context (set by auth middleware)
- Join User with UserStats (create if doesn't exist)
- Left join with Subscription
- Return UserProfile structure matching TypeScript interface

##### b) `UpdateProfile(c *gin.Context)`
```go
// PUT /users/me
// Body: UpdateProfileRequest { first_name?, last_name?, province?, exam_date? }
// Returns: UserProfile
// Validation:
// - first_name: 1-50 chars
// - last_name: 1-50 chars
// - province: valid Canadian province code
// - exam_date: future date or null
```

**Implementation Notes**:
- Validate input fields
- Update only provided fields (partial update)
- Update updated_at timestamp
- Return updated profile

##### c) `UploadAvatar(c *gin.Context)`
```go
// POST /users/me/avatar
// Body: multipart/form-data with 'avatar' file
// Returns: { avatar_url: string }
// Validation:
// - File type: image/jpeg, image/png, image/webp
// - Max size: 5MB
// - Required: 'avatar' field in form
```

**Implementation Notes**:
- Parse multipart form
- Validate file type and size
- Generate unique filename: `avatars/{user_id}_{timestamp}.{ext}`
- Options:
  1. Save to local filesystem: `/uploads/avatars/`
  2. Upload to AWS S3 (config.AWS available)
- Update user.AvatarURL in database
- Return URL (relative or absolute based on storage)

##### d) `DeleteAccount(c *gin.Context)`
```go
// DELETE /users/me
// Returns: { message: "Account deleted successfully" }
// Action: Soft delete (sets deleted_at)
```

**Implementation Notes**:
- Use GORM soft delete: `db.Delete(&user)`
- Also soft delete related UserStats
- Invalidate JWT tokens (optional: add to Redis blacklist)
- Return success message

##### e) `GetBookmarks(c *gin.Context)`
```go
// GET /users/me/bookmarks
// Returns: Bookmark[] (array of bookmarked questions)
```

**TypeScript Interface**:
```typescript
interface Bookmark {
  id: string;
  question_id: string;
  question?: Question;
  created_at: string;
}
```

**Implementation Notes**:
- Query UserBookmark where user_id = current user
- Preload Question with Topic, SubTopic, Options
- Return array of bookmarks with full question data

---

#### 2. Dashboard & Analytics (`dashboard_handler.go`)

**Current Status**:
- `GetDashboard` at line 27 - Partial (missing topic_mastery, weak_topics, recent_activity)
- `GetAnalytics` at line 104 - Placeholder
- `GetWeaknesses` at line 109 - Placeholder

##### a) `GetDashboard(c *gin.Context)` - Complete Implementation

**Current Returns** (line 84-100):
```go
// ✅ Already implemented:
// - overall_progress
// - study_streak, longest_streak
// - questions_completed, questions_correct, accuracy_rate
// - practice_tests_taken, average_test_score
// - time_studied_hours
// - pass_probability
// - days_until_exam
// - recommended_study_time_daily

// ❌ Currently returns empty arrays:
// - topic_mastery: []gin.H{}
// - weak_topics: []gin.H{}
// - recent_activity: []gin.H{}
```

**Additional Implementation Needed**:

**Topic Mastery Calculation**:
```go
// Query UserTopicMastery for current user
// For each topic:
//   - Calculate mastery_percentage: (correct / attempted) * 100
//   - Include topic details (name, code)
//   - Sort by mastery_percentage DESC
// If no data, calculate from UserAnswer history
```

**Expected Structure**:
```typescript
interface UserTopicMastery {
  topic_id: string;
  topic_name: string;
  questions_attempted: number;
  questions_correct: number;
  mastery_percentage: number;
  last_practiced: string;
}
```

**Weak Topics Identification**:
```go
// From topic_mastery, filter where mastery_percentage < 70%
// Include sub-topic breakdown
// Sort by mastery_percentage ASC (weakest first)
```

**Expected Structure**:
```typescript
interface WeakTopic {
  name: string;
  score: number;
  questions_attempted: number;
  sub_topics?: SubTopicScore[];
  recommended_practice: number;
}
```

**Recent Activity**:
```go
// Query last 10-20 user actions:
// - UserAnswer (practice questions)
// - PracticeTest (started, completed)
// - UserModuleProgress (module completion)
// Sort by created_at DESC
```

**Expected Structure**:
```typescript
interface Activity {
  id: string;
  type: 'question' | 'test_started' | 'test_completed' | 'module_completed';
  description: string;
  timestamp: string;
  metadata?: any;
}
```

##### b) `GetAnalytics(c *gin.Context)` - Full Implementation

```go
// GET /users/me/analytics?timeframe=30d
// Query param: timeframe (7d, 30d, 90d, all)
// Returns: AnalyticsData
```

**Implementation**:

1. **Questions Per Day**:
```go
// Query UserAnswer grouped by DATE(created_at)
// For each day in timeframe:
//   - Count total questions answered
//   - Return { date: "2024-01-15", value: 12 }
```

2. **Accuracy Trend**:
```go
// Query UserAnswer grouped by DATE(created_at)
// For each day:
//   - Calculate accuracy: (correct / total) * 100
//   - Return { date: "2024-01-15", value: 78.5 }
```

3. **Time Spent Per Day**:
```go
// Query UserAnswer grouped by DATE(created_at)
// Sum time_spent_seconds for each day
// Convert to minutes
// Return { date: "2024-01-15", value: 45 }
```

4. **Topic Breakdown**:
```go
// Query UserAnswer with JOIN Question and Topic
// Group by topic_id
// For each topic:
//   - Count total, correct, incorrect
//   - Calculate percentage
//   - Sum time spent
```

**Expected Structure**:
```typescript
interface AnalyticsData {
  timeframe: '7d' | '30d' | '90d' | 'all';
  questions_per_day: Array<{ date: string; value: number }>;
  accuracy_trend: Array<{ date: string; value: number }>;
  time_spent_per_day: Array<{ date: string; value: number }>;
  topic_breakdown: Array<{
    topic_name: string;
    total_questions: number;
    correct: number;
    incorrect: number;
    accuracy: number;
    time_spent_minutes: number;
  }>;
}
```

##### c) `GetWeaknesses(c *gin.Context)` - Full Implementation

```go
// GET /users/me/weaknesses
// Returns: { weak_topics: WeakTopic[] }
```

**Algorithm**:
```go
1. Get all topics user has attempted
2. Calculate performance for each topic:
   - Query UserAnswer JOIN Question
   - Calculate accuracy per topic
3. Filter topics where accuracy < 70%
4. For each weak topic:
   - Get sub-topic breakdown
   - Calculate recommended practice count
5. Sort by accuracy ASC (weakest first)
```

**Sub-topic Analysis**:
```go
// For each weak topic, also analyze sub-topics
// Group UserAnswer by sub_topic_id
// Calculate accuracy for each sub-topic
// Return sub-topics sorted by accuracy
```

---

#### 3. Subscription Management

**Location**: `user_handler.go` (lines 87, 92, 97) or create new `subscription_handler.go`

**Stripe Integration Required**: Use config.Stripe keys from environment

##### a) `CreateSubscription(c *gin.Context)`
```go
// POST /subscriptions
// Body: CreateSubscriptionRequest {
//   plan: 'monthly' | 'annual'
//   payment_method_id: string  // Stripe payment method ID
// }
// Returns: Subscription
```

**Implementation Steps**:
1. Validate plan (monthly or annual)
2. Check if user already has active subscription
3. Create Stripe customer if not exists
4. Create Stripe subscription
5. Save Subscription to database
6. Create Payment record
7. Return subscription details

**Stripe API Calls**:
```go
// 1. Create customer
stripe.Customer.New(&stripe.CustomerParams{
    Email: user.Email,
    Name: fmt.Sprintf("%s %s", user.FirstName, user.LastName),
})

// 2. Attach payment method
stripe.PaymentMethod.Attach(paymentMethodID, &stripe.PaymentMethodAttachParams{
    Customer: customerID,
})

// 3. Create subscription
stripe.Subscription.New(&stripe.SubscriptionParams{
    Customer: customerID,
    Items: []*stripe.SubscriptionItemsParams{{
        Price: priceID, // from config based on plan
    }},
})
```

**Pricing** (define in config or database):
- Monthly: $29.99 CAD
- Annual: $299.99 CAD (save 16%)

##### b) `GetSubscription(c *gin.Context)`
```go
// GET /subscriptions/current
// Returns: Subscription
```

**Implementation**:
- Query Subscription where user_id = current user
- If not found, return default free subscription
- Include current period dates
- Return subscription status

##### c) `CancelSubscription(c *gin.Context)`
```go
// DELETE /subscriptions/current
// Returns: { message: "Subscription cancelled" }
```

**Implementation**:
1. Find user's subscription
2. Call Stripe API to cancel subscription at period end
3. Update database: cancel_at_period_end = true, cancelled_at = now
4. Create notification for user
5. Return success message

##### d) `StripeWebhook(c *gin.Context)`
```go
// POST /webhooks/stripe
// Handle Stripe webhook events
```

**Events to Handle**:
- `customer.subscription.updated` - Update subscription status
- `customer.subscription.deleted` - Mark subscription as cancelled
- `invoice.payment_succeeded` - Create payment record
- `invoice.payment_failed` - Update subscription status to past_due

**Implementation**:
```go
1. Verify webhook signature using Stripe signing secret
2. Parse event type
3. Switch on event type:
   case "customer.subscription.updated":
       // Update subscription in database
   case "invoice.payment_succeeded":
       // Create Payment record
   // ... handle other events
4. Return 200 OK
```

---

#### 4. Notifications System

**Location**: Create `notification_handler.go` or add to `user_handler.go`

##### a) `GetNotifications(c *gin.Context)`
```go
// GET /notifications?limit=20&offset=0
// Returns: Notification[]
```

**Implementation**:
- Query Notification where user_id = current user
- Order by created_at DESC
- Support pagination (limit, offset)
- Return array of notifications

##### b) `MarkNotificationRead(c *gin.Context)`
```go
// PUT /notifications/:id/read
// Returns: { message: "Notification marked as read" }
```

**Implementation**:
- Verify notification belongs to current user
- Update is_read = true
- Return success

##### c) `GetNotificationSettings(c *gin.Context)`
```go
// GET /users/me/notification-settings
// Returns: NotificationSettings
```

**Implementation**:
- Query UserNotificationSettings where user_id = current user
- If not exists, create with defaults
- Return settings

##### d) `UpdateNotificationSettings(c *gin.Context)`
```go
// PUT /users/me/notification-settings
// Body: Partial<NotificationSettings>
// Returns: NotificationSettings
```

**Implementation**:
- Validate input
- Update only provided fields
- Return updated settings

**Helper Function - Create Notification**:
```go
func CreateNotification(userID uuid.UUID, notifType, title, message, link string) error {
    notification := models.Notification{
        UserID:  userID,
        Type:    notifType,
        Title:   title,
        Message: message,
        Link:    link,
        IsRead:  false,
    }
    return db.Create(&notification).Error
}
```

**Use Cases**:
- Test completion: `CreateNotification(userID, "test_result", "Test Completed!", "You scored 85%", "/test/results/"+testID)`
- Achievement unlocked: `CreateNotification(userID, "achievement", "Achievement Unlocked!", "Perfect Score", "/achievements")`
- Study reminder: `CreateNotification(userID, "reminder", "Daily Study Reminder", "Time to practice!", "/practice")`

---

### 🟠 PRIORITY 1 - Study Features

#### 5. Study Path Management

**Location**: Create `study_handler.go` or add to `user_handler.go`

##### a) `GetStudyPath(c *gin.Context)`
```go
// GET /users/me/study-path
// Returns: StudyPath with modules and progress
```

**Implementation**:
```go
1. Find or create StudyPath for user
2. Query all Modules (ordered by week, order)
3. For each module:
   - Get UserModuleProgress (if exists)
   - Attach progress info to module
4. Calculate overall progress_percentage
5. Identify next_module (first incomplete)
6. Return StudyPath structure
```

**Expected Structure**:
```typescript
{
  id: string;
  user_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  current_week: number;
  start_date?: string;
  target_date?: string;
  modules: Module[];  // with progress attached
  progress_percentage: number;
  next_module?: Module;
}
```

##### b) `UpdateModuleProgress(c *gin.Context)`
```go
// PUT /study-path/modules/:id/progress
// Body: { progress: number, time_spent_seconds: number }
// Returns: { message: "Progress updated" }
```

**Implementation**:
```go
1. Get module_id from URL param
2. Parse request body
3. Find or create UserModuleProgress
4. Update progress (0-100) and time_spent
5. If progress > current:
   - Update status to in_progress
   - If progress == 100, mark completed_at
6. Update study streak if studying today
7. Return success
```

##### c) `CompleteModule(c *gin.Context)`
```go
// POST /study-path/modules/:id/complete
// Returns: { message: "Module completed" }
```

**Implementation**:
```go
1. Get module_id from URL param
2. Find or create UserModuleProgress
3. Update:
   - status = 'completed'
   - progress = 100
   - completed_at = now
4. Check if all modules completed:
   - If yes, update StudyPath.status = 'completed'
5. Create achievement notification (if applicable)
6. Return success
```

---

### 🔵 PRIORITY 2 - Community Features

#### 6. Forum Management

**Location**: Create `forum_handler.go`

**Database Models**: `ForumPost`, `ForumReply` (already defined)

##### a) `ListForumPosts(c *gin.Context)`
```go
// GET /forum/posts?category=all&sort=recent&page=1&limit=20
// Query params:
//   - category: string (all, general, study-tips, exam-prep, etc.)
//   - sort: recent | popular | unanswered
//   - search: string
//   - page: number (default 1)
//   - limit: number (default 20)
// Returns: { posts: ForumPost[], total: number, page: number, total_pages: number }
```

**Implementation**:
```go
1. Build query with filters:
   - If category != 'all': WHERE category = ?
   - If search: WHERE title LIKE ? OR content LIKE ?
2. Apply sorting:
   - recent: ORDER BY created_at DESC
   - popular: ORDER BY (reply_count * 2 + view_count) DESC
   - unanswered: WHERE reply_count = 0
3. Preload User (author)
4. Apply pagination
5. Count total matching posts
6. Return paginated response
```

##### b) `GetForumPost(c *gin.Context)`
```go
// GET /forum/posts/:id
// Returns: ForumPost with replies
```

**Implementation**:
```go
1. Get post_id from URL
2. Increment view_count
3. Query ForumPost
4. Preload User (author)
5. Preload Replies with User
6. Order replies by created_at ASC
7. Return post with replies
```

##### c) `CreateForumPost(c *gin.Context)`
```go
// POST /forum/posts
// Body: { title: string, content: string, category: string }
// Returns: ForumPost
```

**Validation**:
- title: 5-200 chars
- content: 10-10000 chars
- category: valid category

**Implementation**:
```go
1. Validate input
2. Get user_id from auth context
3. Create ForumPost
4. Return created post
```

##### d) `UpdateForumPost(c *gin.Context)`
```go
// PUT /forum/posts/:id
// Body: { title?: string, content?: string }
// Returns: ForumPost
```

**Authorization**: Only post author or admin

##### e) `DeleteForumPost(c *gin.Context)`
```go
// DELETE /forum/posts/:id
// Returns: { message: "Post deleted" }
```

**Authorization**: Only post author or admin

##### f) `CreateForumReply(c *gin.Context)`
```go
// POST /forum/posts/:id/reply
// Body: { content: string }
// Returns: ForumReply
```

**Implementation**:
```go
1. Validate content (10-5000 chars)
2. Get post_id and user_id
3. Create ForumReply
4. Increment post.reply_count
5. Create notification for post author
6. Return reply
```

##### g) `VoteForumPost(c *gin.Context)` (Optional)
```go
// PUT /forum/posts/:id/vote
// Body: { vote: 1 | -1 }
// Implement upvote/downvote system
```

---

#### 7. Study Groups Management

**Location**: Create `study_group_handler.go`

**Database Models**: `StudyGroup`, `StudyGroupMember` (already defined)

##### a) `ListStudyGroups(c *gin.Context)`
```go
// GET /study-groups?search=&topic=&page=1&limit=20
// Returns: { groups: StudyGroup[], total: number }
```

**Implementation**:
```go
1. Build query with filters:
   - search: WHERE name LIKE ? OR description LIKE ?
   - topic: JOIN with topics if filtering by topic
   - is_private: Only show public groups OR groups user is member of
2. Preload Creator
3. Preload Members count
4. Apply pagination
5. Return groups
```

##### b) `GetStudyGroup(c *gin.Context)`
```go
// GET /study-groups/:id
// Returns: StudyGroup with members
```

**Authorization**: If private, user must be member

**Implementation**:
```go
1. Get group_id
2. Query StudyGroup
3. Check if private:
   - If yes, verify user is member
4. Preload Creator
5. Preload Members with User data
6. Return group details
```

##### c) `CreateStudyGroup(c *gin.Context)`
```go
// POST /study-groups
// Body: {
//   name: string,
//   description: string,
//   is_private: boolean,
//   max_members: number,
//   exam_date?: string,
//   topics: string[]
// }
// Returns: StudyGroup
```

**Validation**:
- name: 5-100 chars
- description: 10-1000 chars
- max_members: 2-50

**Implementation**:
```go
1. Validate input
2. Create StudyGroup (creator_id = current user)
3. Create StudyGroupMember (role = 'owner')
4. Set member_count = 1
5. Return created group
```

##### d) `UpdateStudyGroup(c *gin.Context)`
```go
// PUT /study-groups/:id
// Body: Partial<StudyGroup>
// Returns: StudyGroup
```

**Authorization**: Only group owner or moderator

##### e) `DeleteStudyGroup(c *gin.Context)`
```go
// DELETE /study-groups/:id
// Returns: { message: "Group deleted" }
```

**Authorization**: Only group owner

##### f) `JoinStudyGroup(c *gin.Context)`
```go
// POST /study-groups/:id/join
// Returns: { message: "Joined group successfully" }
```

**Implementation**:
```go
1. Check if group is full (member_count >= max_members)
2. Check if user is already member
3. Create StudyGroupMember (role = 'member')
4. Increment group.member_count
5. Create notification for group creator
6. Return success
```

##### g) `LeaveStudyGroup(c *gin.Context)`
```go
// POST /study-groups/:id/leave
// Returns: { message: "Left group successfully" }
```

**Implementation**:
```go
1. Check if user is member
2. If user is owner and other members exist:
   - Transfer ownership or prevent leaving
3. Delete StudyGroupMember
4. Decrement group.member_count
5. Return success
```

##### h) `GetGroupMembers(c *gin.Context)`
```go
// GET /study-groups/:id/members
// Returns: StudyGroupMember[] with User data
```

---

#### 8. Achievements System

**Location**: Add to `user_handler.go` or create `achievement_handler.go`

**Database**: Need to create `UserAchievement` model

**New Model Required**:
```go
type UserAchievement struct {
    ID            uuid.UUID
    UserID        uuid.UUID
    AchievementID string    // Can use predefined IDs
    Name          string
    Description   string
    Icon          string
    Rarity        string    // common, rare, epic, legendary
    Points        int
    EarnedAt      time.Time
    CreatedAt     time.Time
}
```

##### a) `GetUserAchievements(c *gin.Context)`
```go
// GET /users/me/achievements
// Returns: UserAchievement[]
```

**Implementation**:
```go
1. Query UserAchievement where user_id = current user
2. Order by earned_at DESC
3. Return array
```

##### b) Achievement Triggers (Helper Functions)

Integrate these into existing handlers:

```go
// In test_handler.go - CompleteTest()
func CheckTestAchievements(userID uuid.UUID, test PracticeTest) {
    // Perfect Score
    if test.Score == 100 {
        CreateAchievement(userID, "perfect-score", "Perfect Score", ...)
    }

    // Excellence Award
    if test.Score >= 90 {
        CreateAchievement(userID, "excellence", "Excellence Award", ...)
    }

    // Speed Master
    if test.TimeSpentSeconds < 3600 && test.TotalQuestions >= 50 {
        CreateAchievement(userID, "speed-master", "Speed Master", ...)
    }

    // Check for first test
    var count int64
    db.Model(&PracticeTest{}).Where("user_id = ? AND status = ?", userID, "completed").Count(&count)
    if count == 1 {
        CreateAchievement(userID, "first-test", "First Test Complete", ...)
    }
}

// In question_handler.go - SubmitAnswer()
func CheckQuestionAchievements(userID uuid.UUID) {
    var stats UserStats
    db.Where("user_id = ?", userID).First(&stats)

    // Question milestones
    if stats.QuestionsCompleted == 1 {
        CreateAchievement(userID, "first-question", "First Steps", ...)
    }
    if stats.QuestionsCompleted == 100 {
        CreateAchievement(userID, "question-master", "Question Master", ...)
    }
    if stats.QuestionsCompleted == 500 {
        CreateAchievement(userID, "question-guru", "Question Guru", ...)
    }
}

// In study_handler.go - CompleteModule()
func CheckStudyAchievements(userID uuid.UUID) {
    var count int64
    db.Model(&UserModuleProgress{}).
        Where("user_id = ? AND status = ?", userID, "completed").
        Count(&count)

    if count == 10 {
        CreateAchievement(userID, "dedicated-learner", "Dedicated Learner", ...)
    }
}

// Helper to create achievement
func CreateAchievement(userID uuid.UUID, achievementID, name, description, icon, rarity string, points int) error {
    // Check if already exists
    var existing UserAchievement
    err := db.Where("user_id = ? AND achievement_id = ?", userID, achievementID).First(&existing).Error
    if err == nil {
        return nil // Already has this achievement
    }

    achievement := UserAchievement{
        UserID:        userID,
        AchievementID: achievementID,
        Name:          name,
        Description:   description,
        Icon:          icon,
        Rarity:        rarity,
        Points:        points,
        EarnedAt:      time.Now(),
    }

    if err := db.Create(&achievement).Error; err != nil {
        return err
    }

    // Create notification
    CreateNotification(userID, "achievement",
        "Achievement Unlocked!",
        fmt.Sprintf("You earned: %s", name),
        "/achievements")

    return nil
}
```

---

### 🟢 PRIORITY 3 - Admin Features

#### 9. Admin User Management

**Location**: `user_handler.go` line 117 or create `admin_handler.go`

##### a) `ListUsers(c *gin.Context)`
```go
// GET /admin/users?search=&page=1&limit=50&role=all
// Requires: Admin middleware
// Returns: { users: UserProfile[], total: number, page: number }
```

**Implementation**:
```go
1. Verify user is admin (middleware)
2. Build query:
   - search: WHERE email LIKE ? OR first_name LIKE ? OR last_name LIKE ?
   - role: WHERE is_admin = ? (if filtering)
3. Join with UserStats
4. Left join with Subscription
5. Apply pagination
6. Return paginated users
```

##### b) `GetAdminStatistics(c *gin.Context)`
```go
// GET /admin/statistics
// Returns: AdminStatistics
```

**Expected Structure**:
```typescript
interface AdminStatistics {
  total_users: number;
  active_users_30d: number;
  total_questions: number;
  total_tests_taken: number;
  avg_test_score: number;
  total_subscriptions: number;
  active_subscriptions: number;
  monthly_revenue: number;
  user_growth: Array<{ date: string; count: number }>;
  popular_topics: Array<{ topic: string; attempts: number }>;
}
```

**Implementation**:
```go
1. Count total users
2. Count users who logged in last 30 days (check last_study_date)
3. Count total questions
4. Count total practice tests
5. Calculate average test score
6. Count total subscriptions
7. Count active subscriptions (status = 'active')
8. Sum monthly revenue from Payment table
9. User growth: Count users grouped by DATE(created_at) last 30 days
10. Popular topics: Join Question with UserAnswer, count by topic
```

---

## Code Quality Standards

### Error Handling
```go
// Always return appropriate HTTP status codes
// Use descriptive error messages
// Log errors for debugging

if err := db.First(&user, userID).Error; err != nil {
    if errors.Is(err, gorm.ErrRecordNotFound) {
        c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
        return
    }
    log.Printf("Database error: %v", err)
    c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
    return
}
```

### Validation
```go
// Validate all user input
// Use struct tags for basic validation
// Add custom validation for complex rules

type UpdateProfileRequest struct {
    FirstName string `json:"first_name" binding:"omitempty,min=1,max=50"`
    LastName  string `json:"last_name" binding:"omitempty,min=1,max=50"`
    Province  string `json:"province" binding:"omitempty,oneof=AB BC MB NB NL NS NT NU ON PE QC SK YT"`
}

if err := c.ShouldBindJSON(&req); err != nil {
    c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
    return
}
```

### Authentication
```go
// Always get user from auth middleware
userID, exists := c.Get("user_id")
if !exists {
    c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
    return
}
```

### Database Transactions
```go
// Use transactions for multi-step operations
tx := db.Begin()

if err := tx.Create(&subscription).Error; err != nil {
    tx.Rollback()
    return err
}

if err := tx.Create(&payment).Error; err != nil {
    tx.Rollback()
    return err
}

tx.Commit()
```

### Response Format
```go
// Always return JSON
// Match TypeScript interfaces exactly
// Use snake_case for JSON keys (to match DB columns)

c.JSON(http.StatusOK, gin.H{
    "user_id": user.ID,
    "email": user.Email,
    "first_name": user.FirstName,
})
```

---

## Testing Requirements

For each endpoint, ensure:

1. **Unit Tests**:
   - Test successful case
   - Test validation errors
   - Test authorization failures
   - Test database errors

2. **Integration Tests**:
   - Test with real database
   - Test middleware integration
   - Test complete request/response cycle

3. **Example Test Structure**:
```go
func TestGetProfile(t *testing.T) {
    // Setup
    db := setupTestDB()
    handler := NewUserHandler(db, nil, nil)

    // Create test user
    user := createTestUser(db)

    // Create request
    req := httptest.NewRequest("GET", "/users/me", nil)
    w := httptest.NewRecorder()
    c, _ := gin.CreateTestContext(w)
    c.Request = req
    c.Set("user_id", user.ID)

    // Execute
    handler.GetProfile(c)

    // Assert
    assert.Equal(t, 200, w.Code)
    // ... more assertions
}
```

---

## Security Considerations

1. **Input Validation**: Always validate and sanitize user input
2. **SQL Injection**: Use GORM parameterized queries (already safe)
3. **XSS Prevention**: Escape HTML in user-generated content (forum posts)
4. **CSRF**: Not needed (stateless JWT auth)
5. **Rate Limiting**: Implement for sensitive endpoints (login, register)
6. **Password Security**: Use bcrypt (already implemented in auth_handler)
7. **Sensitive Data**: Never log passwords, tokens, or payment info
8. **Authorization**: Always verify user owns resource before modification

---

## Performance Optimization

1. **Database Indexes**: Ensure indexes on frequently queried fields
   - user_id in all FK tables
   - email in users
   - topic_id, difficulty, is_active in questions

2. **Query Optimization**:
   - Use `Select()` to limit fields
   - Use `Preload()` carefully (avoid N+1)
   - Use joins instead of separate queries

3. **Caching** (Redis):
   - Cache topic list (rarely changes)
   - Cache user stats (invalidate on update)
   - Cache leaderboard (update hourly)

4. **Pagination**:
   - Always paginate list endpoints
   - Default limit: 20-50
   - Max limit: 100

Example Redis Caching:
```go
// Try cache first
cached, err := redis.Get(ctx, "user:stats:"+userID.String()).Result()
if err == nil {
    var stats UserStats
    json.Unmarshal([]byte(cached), &stats)
    return stats
}

// Fetch from DB
var stats UserStats
db.Where("user_id = ?", userID).First(&stats)

// Cache for 5 minutes
data, _ := json.Marshal(stats)
redis.Set(ctx, "user:stats:"+userID.String(), data, 5*time.Minute)
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All endpoints return proper status codes
- [ ] Error messages are user-friendly (no stack traces)
- [ ] Sensitive data is not logged
- [ ] Database indexes are created
- [ ] Migrations are tested
- [ ] Environment variables are configured
- [ ] Stripe webhooks are set up
- [ ] Email service is configured (SendGrid)
- [ ] CORS settings allow frontend domain
- [ ] JWT secrets are strong and unique
- [ ] Rate limiting is enabled
- [ ] Health check endpoint exists
- [ ] Logging is configured
- [ ] Monitoring is set up

---

## Example: Complete Implementation Template

Here's a complete example for one endpoint to use as a template:

```go
// File: internal/handlers/user_handler.go

package handlers

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
    "github.com/nppe-pro/api/internal/models"
    "gorm.io/gorm"
)

type UpdateProfileRequest struct {
    FirstName string  `json:"first_name" binding:"omitempty,min=1,max=50"`
    LastName  string  `json:"last_name" binding:"omitempty,min=1,max=50"`
    Province  string  `json:"province" binding:"omitempty,oneof=AB BC MB NB NL NS NT NU ON PE QC SK YT"`
    ExamDate  *string `json:"exam_date" binding:"omitempty"`
}

type UserProfileResponse struct {
    ID                  uuid.UUID  `json:"id"`
    Email               string     `json:"email"`
    FirstName           string     `json:"first_name"`
    LastName            string     `json:"last_name"`
    Province            string     `json:"province"`
    ExamDate            *string    `json:"exam_date"`
    IsVerified          bool       `json:"is_verified"`
    IsAdmin             bool       `json:"is_admin"`
    AvatarURL           string     `json:"avatar_url"`
    StudyStreak         int        `json:"study_streak"`
    LongestStreak       int        `json:"longest_streak"`
    QuestionsCompleted  int        `json:"questions_completed"`
    QuestionCorrect     int        `json:"questions_correct"`
    PracticeTestsTaken  int        `json:"practice_tests_taken"`
    CreatedAt           string     `json:"created_at"`
    UpdatedAt           string     `json:"updated_at"`
}

// GetProfile returns the current user's profile with stats
func (h *UserHandler) GetProfile(c *gin.Context) {
    // Get authenticated user ID from context
    userID, exists := c.Get("user_id")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    // Fetch user from database
    var user models.User
    if err := h.db.First(&user, userID).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
            return
        }
        log.Printf("Error fetching user: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
        return
    }

    // Fetch or create user stats
    var stats models.UserStats
    if err := h.db.Where("user_id = ?", userID).First(&stats).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            // Create default stats
            stats = models.UserStats{
                UserID:             userID.(uuid.UUID),
                QuestionsCompleted: 0,
                QuestionsCorrect:   0,
                PracticeTestsTaken: 0,
            }
            if err := h.db.Create(&stats).Error; err != nil {
                log.Printf("Error creating stats: %v", err)
            }
        } else {
            log.Printf("Error fetching stats: %v", err)
        }
    }

    // Format exam date
    var examDate *string
    if user.ExamDate != nil {
        formatted := user.ExamDate.Format("2006-01-02")
        examDate = &formatted
    }

    // Build response
    response := UserProfileResponse{
        ID:                 user.ID,
        Email:              user.Email,
        FirstName:          user.FirstName,
        LastName:           user.LastName,
        Province:           user.Province,
        ExamDate:           examDate,
        IsVerified:         user.IsVerified,
        IsAdmin:            user.IsAdmin,
        AvatarURL:          user.AvatarURL,
        StudyStreak:        user.StudyStreak,
        LongestStreak:      user.LongestStreak,
        QuestionsCompleted: stats.QuestionsCompleted,
        QuestionCorrect:    stats.QuestionsCorrect,
        PracticeTestsTaken: stats.PracticeTestsTaken,
        CreatedAt:          user.CreatedAt.Format(time.RFC3339),
        UpdatedAt:          user.UpdatedAt.Format(time.RFC3339),
    }

    c.JSON(http.StatusOK, response)
}

// UpdateProfile updates the current user's profile
func (h *UserHandler) UpdateProfile(c *gin.Context) {
    // Get authenticated user ID
    userID, exists := c.Get("user_id")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    // Parse and validate request
    var req UpdateProfileRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Fetch user
    var user models.User
    if err := h.db.First(&user, userID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
        return
    }

    // Update fields (only if provided)
    updates := make(map[string]interface{})

    if req.FirstName != "" {
        updates["first_name"] = req.FirstName
    }
    if req.LastName != "" {
        updates["last_name"] = req.LastName
    }
    if req.Province != "" {
        updates["province"] = req.Province
    }
    if req.ExamDate != nil {
        if *req.ExamDate == "" {
            updates["exam_date"] = nil
        } else {
            examDate, err := time.Parse("2006-01-02", *req.ExamDate)
            if err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid exam date format"})
                return
            }
            updates["exam_date"] = examDate
        }
    }

    // Apply updates
    if len(updates) > 0 {
        if err := h.db.Model(&user).Updates(updates).Error; err != nil {
            log.Printf("Error updating user: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
            return
        }
    }

    // Return updated profile (reuse GetProfile logic)
    h.GetProfile(c)
}
```

---

## Priority Order for Implementation

Implement in this order for fastest user value:

**Week 1-2 (P0 - Critical)**:
1. ✅ User Profile Management (GetProfile, UpdateProfile, UploadAvatar, GetBookmarks)
2. ✅ Dashboard Enhancements (topic_mastery, weak_topics, recent_activity)
3. ✅ Analytics (GetAnalytics, GetWeaknesses)
4. ✅ Notifications (all endpoints)

**Week 3-4 (P1 - Important)**:
5. ✅ Subscription Management (all endpoints + Stripe integration)
6. ✅ Study Path (all endpoints)
7. ✅ Admin User Management
8. ✅ Test Results Enhancements (bookmark status fix)

**Week 5-6 (P2 - Community)**:
9. ✅ Forum (all endpoints)
10. ✅ Study Groups (all endpoints)

**Week 7-8 (P2 - Gamification)**:
11. ✅ Achievements (endpoints + triggers)
12. ✅ Admin Statistics

---

## Final Notes

**Key Success Factors**:
1. Match TypeScript interfaces exactly
2. Follow existing code patterns in auth_handler.go and test_handler.go
3. Use GORM best practices
4. Always validate input
5. Return proper error messages
6. Test thoroughly before deployment

**Common Pitfalls to Avoid**:
- Don't return `gin.H{"message": "..."}` placeholders
- Don't forget to update UserStats when users complete actions
- Don't skip authorization checks
- Don't return stack traces in production
- Don't forget to handle null values (use pointers for nullable fields)

**Resources**:
- Existing handlers: `/back/internal/handlers/`
- Database models: `/back/internal/models/`
- Frontend types: `/front/src/api/types.ts`
- Gap analysis: `/FRONTEND_BACKEND_GAP_ANALYSIS.md`

---

**Good luck with implementation! Follow this guide closely and you'll have a fully functional backend in 6-8 weeks.**
