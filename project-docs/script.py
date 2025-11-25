
# Create comprehensive Go backend feature specification for NPPE MVP
go_backend_spec = """
# NPPE MVP - Complete Go Backend Feature Specification

## 🏗️ ARCHITECTURE OVERVIEW

### Tech Stack
- **Language**: Go 1.21+
- **Web Framework**: Gin or Echo (RESTful API)
- **Database**: PostgreSQL 15+ (primary), Redis 7+ (caching/sessions)
- **ORM**: GORM or sqlx
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: AWS S3 or MinIO
- **Search**: PostgreSQL Full-Text Search or Elasticsearch (optional)
- **Queue**: Redis + Asynq for background jobs
- **Monitoring**: Prometheus + Grafana
- **Logging**: Zerolog or Zap
- **API Documentation**: Swagger/OpenAPI 3.0

### Project Structure
```
nppe-api/
├── cmd/
│   ├── api/              # Main API server
│   ├── worker/           # Background job worker
│   └── migrate/          # Database migrations
├── internal/
│   ├── auth/             # Authentication logic
│   ├── user/             # User domain
│   ├── question/         # Questions domain
│   ├── test/             # Practice tests domain
│   ├── study/            # Study path domain
│   ├── analytics/        # Analytics domain
│   ├── subscription/     # Payment/billing
│   ├── community/        # Forum/groups
│   └── notification/     # Notifications
├── pkg/
│   ├── middleware/       # HTTP middlewares
│   ├── validator/        # Input validation
│   ├── mailer/           # Email service
│   └── storage/          # File storage
├── migrations/           # SQL migrations
├── config/              # Configuration
├── docs/                # API documentation
└── tests/               # Integration tests
```

---

## 📋 FEATURE LIST WITH API ENDPOINTS

### 1. AUTHENTICATION & USER MANAGEMENT

#### 1.1 User Registration
**Endpoint**: `POST /api/v1/auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "province": "NL",
  "exam_date": "2025-06-15",
  "oauth_provider": null
}
```

**Response**:
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "token": "jwt_token",
  "refresh_token": "refresh_token"
}
```

**Go Implementation**:
```go
type RegisterRequest struct {
    Email        string    `json:"email" binding:"required,email"`
    Password     string    `json:"password" binding:"required,min=8"`
    FirstName    string    `json:"first_name" binding:"required"`
    LastName     string    `json:"last_name" binding:"required"`
    Province     string    `json:"province" binding:"required,oneof=AB BC MB NB NL NT NS NU ON PE QC SK YT"`
    ExamDate     time.Time `json:"exam_date"`
}

type User struct {
    ID            uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
    Email         string     `gorm:"uniqueIndex;not null"`
    PasswordHash  string     `gorm:"not null"`
    FirstName     string     `gorm:"not null"`
    LastName      string     `gorm:"not null"`
    Province      string     `gorm:"not null"`
    ExamDate      *time.Time
    IsVerified    bool       `gorm:"default:false"`
    SubscriptionID *uuid.UUID
    CreatedAt     time.Time
    UpdatedAt     time.Time
    DeletedAt     gorm.DeletedAt `gorm:"index"`
}
```

**Features**:
- ✅ Email validation with regex
- ✅ Password strength validation (min 8 chars, uppercase, lowercase, number)
- ✅ Bcrypt password hashing (cost: 12)
- ✅ Email verification token generation
- ✅ Send welcome email with verification link
- ✅ Rate limiting: 5 registrations per IP per hour

#### 1.2 Login
**Endpoint**: `POST /api/v1/auth/login`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response**:
```json
{
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "subscription_tier": "premium"
  }
}
```

**Go Implementation**:
```go
func (s *AuthService) Login(ctx context.Context, req LoginRequest) (*LoginResponse, error) {
    user, err := s.userRepo.FindByEmail(ctx, req.Email)
    if err != nil {
        return nil, ErrInvalidCredentials
    }
    
    if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
        return nil, ErrInvalidCredentials
    }
    
    token, err := s.generateJWT(user)
    refreshToken, err := s.generateRefreshToken(user)
    
    // Store session in Redis
    s.redis.Set(ctx, fmt.Sprintf("session:%s", user.ID), token, 24*time.Hour)
    
    return &LoginResponse{
        AccessToken:  token,
        RefreshToken: refreshToken,
        ExpiresIn:    3600,
    }, nil
}
```

**Features**:
- ✅ JWT with 1 hour expiration
- ✅ Refresh token with 7 day expiration
- ✅ Session storage in Redis
- ✅ Rate limiting: 10 attempts per IP per 15 minutes
- ✅ Failed login attempt tracking
- ✅ Account lockout after 5 failed attempts (15 min)

#### 1.3 OAuth Integration
**Endpoints**:
- `GET /api/v1/auth/google` - Initiate Google OAuth
- `GET /api/v1/auth/google/callback` - Handle callback
- `GET /api/v1/auth/apple` - Initiate Apple OAuth
- `GET /api/v1/auth/apple/callback` - Handle callback

**Go Implementation**:
```go
import "golang.org/x/oauth2"
import "golang.org/x/oauth2/google"

var googleOAuthConfig = &oauth2.Config{
    ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
    ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
    RedirectURL:  "https://api.nppepro.com/v1/auth/google/callback",
    Scopes:       []string{"email", "profile"},
    Endpoint:     google.Endpoint,
}
```

#### 1.4 Password Reset
**Endpoints**:
- `POST /api/v1/auth/forgot-password` - Request reset
- `POST /api/v1/auth/reset-password` - Reset with token

**Features**:
- ✅ Generate secure reset token (UUID)
- ✅ Store token with 1 hour expiration in Redis
- ✅ Send email with reset link
- ✅ Validate token before password reset
- ✅ Invalidate all existing sessions after reset

#### 1.5 Email Verification
**Endpoint**: `GET /api/v1/auth/verify/:token`

**Features**:
- ✅ Verify email with unique token
- ✅ Update user.is_verified flag
- ✅ Send confirmation email
- ✅ Redirect to login page

---

### 2. USER PROFILE MANAGEMENT

#### 2.1 Get Profile
**Endpoint**: `GET /api/v1/users/me`
**Auth**: Required

**Response**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "province": "NL",
  "exam_date": "2025-06-15",
  "study_streak": 7,
  "questions_completed": 234,
  "practice_tests_taken": 5,
  "subscription": {
    "tier": "premium",
    "status": "active",
    "expires_at": "2026-01-15"
  },
  "created_at": "2025-01-01T00:00:00Z"
}
```

#### 2.2 Update Profile
**Endpoint**: `PUT /api/v1/users/me`
**Auth**: Required

**Request**:
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "exam_date": "2025-07-01",
  "province": "ON"
}
```

#### 2.3 Upload Profile Picture
**Endpoint**: `POST /api/v1/users/me/avatar`
**Auth**: Required
**Content-Type**: `multipart/form-data`

**Go Implementation**:
```go
func (h *UserHandler) UploadAvatar(c *gin.Context) {
    file, err := c.FormFile("avatar")
    if err != nil {
        c.JSON(400, gin.H{"error": "No file uploaded"})
        return
    }
    
    // Validate file type (JPEG, PNG only)
    if !isValidImageType(file.Header.Get("Content-Type")) {
        c.JSON(400, gin.H{"error": "Invalid file type"})
        return
    }
    
    // Validate file size (max 5MB)
    if file.Size > 5*1024*1024 {
        c.JSON(400, gin.H{"error": "File too large"})
        return
    }
    
    // Upload to S3
    url, err := h.storage.Upload(c.Request.Context(), file, "avatars")
    
    // Update user record
    h.userRepo.UpdateAvatar(c.Request.Context(), userID, url)
    
    c.JSON(200, gin.H{"avatar_url": url})
}
```

#### 2.4 Delete Account
**Endpoint**: `DELETE /api/v1/users/me`
**Auth**: Required

**Features**:
- ✅ Soft delete (set deleted_at timestamp)
- ✅ Anonymize personal data after 30 days
- ✅ Cancel subscription
- ✅ Send confirmation email

---

### 3. QUESTION BANK MANAGEMENT

#### Database Schema:
```go
type Question struct {
    ID              uuid.UUID `gorm:"type:uuid;primary_key"`
    Content         string    `gorm:"type:text;not null"`
    QuestionType    string    `gorm:"type:varchar(20);not null"` // multiple_choice, true_false
    Difficulty      string    `gorm:"type:varchar(20);not null"` // easy, medium, hard
    TopicID         uuid.UUID
    Topic           Topic     `gorm:"foreignKey:TopicID"`
    SubTopicID      *uuid.UUID
    SubTopic        *SubTopic `gorm:"foreignKey:SubTopicID"`
    Province        *string   // null = all provinces, or AB, BC, ON, etc.
    Explanation     string    `gorm:"type:text"`
    ReferenceSource string    `gorm:"type:text"`
    IsActive        bool      `gorm:"default:true"`
    CreatedAt       time.Time
    UpdatedAt       time.Time
}

type QuestionOption struct {
    ID         uuid.UUID `gorm:"type:uuid;primary_key"`
    QuestionID uuid.UUID
    Content    string `gorm:"type:text;not null"`
    IsCorrect  bool   `gorm:"default:false"`
    Position   int    `gorm:"not null"`
}

type Topic struct {
    ID          uuid.UUID `gorm:"type:uuid;primary_key"`
    Name        string    `gorm:"not null"` // e.g., "Professional Practice", "Ethics"
    Code        string    `gorm:"uniqueIndex"` // e.g., "TOPIC_01"
    Description string    `gorm:"type:text"`
    Weight      float64   // Percentage of exam (e.g., 20.0 for 20%)
    Order       int
}

type SubTopic struct {
    ID          uuid.UUID `gorm:"type:uuid;primary_key"`
    TopicID     uuid.UUID
    Name        string    `gorm:"not null"`
    Code        string    `gorm:"uniqueIndex"`
    Description string    `gorm:"type:text"`
    Order       int
}
```

#### 3.1 Get Questions (Practice Mode)
**Endpoint**: `GET /api/v1/questions`
**Auth**: Required

**Query Parameters**:
```
?topic_id=uuid
&difficulty=medium
&province=NL
&limit=20
&exclude_answered=true
&random=true
```

**Response**:
```json
{
  "questions": [
    {
      "id": "uuid",
      "content": "Which of the following best describes...",
      "type": "multiple_choice",
      "difficulty": "medium",
      "topic": {
        "id": "uuid",
        "name": "Professional Practice",
        "code": "TOPIC_01"
      },
      "options": [
        {"id": "uuid", "content": "Option A", "position": 1},
        {"id": "uuid", "content": "Option B", "position": 2},
        {"id": "uuid", "content": "Option C", "position": 3},
        {"id": "uuid", "content": "Option D", "position": 4}
      ]
    }
  ],
  "pagination": {
    "total": 500,
    "page": 1,
    "per_page": 20,
    "total_pages": 25
  }
}
```

**Go Implementation**:
```go
func (s *QuestionService) GetQuestions(ctx context.Context, req GetQuestionsRequest) (*GetQuestionsResponse, error) {
    query := s.db.WithContext(ctx).Model(&Question{}).
        Preload("Topic").
        Preload("SubTopic").
        Preload("Options", func(db *gorm.DB) *gorm.DB {
            return db.Order("position ASC")
        }).
        Where("is_active = ?", true)
    
    // Filter by topic
    if req.TopicID != uuid.Nil {
        query = query.Where("topic_id = ?", req.TopicID)
    }
    
    // Filter by difficulty
    if req.Difficulty != "" {
        query = query.Where("difficulty = ?", req.Difficulty)
    }
    
    // Filter by province
    if req.Province != "" {
        query = query.Where("province IS NULL OR province = ?", req.Province)
    }
    
    // Exclude already answered questions
    if req.ExcludeAnswered {
        answeredIDs, _ := s.getAnsweredQuestionIDs(ctx, req.UserID)
        if len(answeredIDs) > 0 {
            query = query.Where("id NOT IN ?", answeredIDs)
        }
    }
    
    // Random order
    if req.Random {
        query = query.Order("RANDOM()")
    }
    
    // Pagination
    var total int64
    query.Count(&total)
    
    var questions []Question
    err := query.Limit(req.Limit).Offset((req.Page - 1) * req.Limit).Find(&questions).Error
    
    return &GetQuestionsResponse{
        Questions: questions,
        Pagination: PaginationMeta{
            Total:      total,
            Page:       req.Page,
            PerPage:    req.Limit,
            TotalPages: int(math.Ceil(float64(total) / float64(req.Limit))),
        },
    }, err
}
```

#### 3.2 Submit Answer
**Endpoint**: `POST /api/v1/questions/:id/answer`
**Auth**: Required

**Request**:
```json
{
  "selected_option_id": "uuid",
  "time_spent_seconds": 45
}
```

**Response**:
```json
{
  "is_correct": true,
  "correct_option_id": "uuid",
  "explanation": "The correct answer is B because...",
  "reference_source": "Canadian Engineering Qualifications Board, Section 2.3",
  "your_answer_id": "uuid"
}
```

**Go Implementation**:
```go
type UserAnswer struct {
    ID               uuid.UUID `gorm:"type:uuid;primary_key"`
    UserID           uuid.UUID
    QuestionID       uuid.UUID
    SelectedOptionID uuid.UUID
    IsCorrect        bool
    TimeSpentSeconds int
    CreatedAt        time.Time
}

func (s *QuestionService) SubmitAnswer(ctx context.Context, userID, questionID, optionID uuid.UUID, timeSpent int) (*AnswerResponse, error) {
    // Get question with options
    question, err := s.questionRepo.GetByIDWithOptions(ctx, questionID)
    
    // Check if answer is correct
    var correctOption QuestionOption
    var isCorrect bool
    for _, opt := range question.Options {
        if opt.IsCorrect {
            correctOption = opt
        }
        if opt.ID == optionID && opt.IsCorrect {
            isCorrect = true
        }
    }
    
    // Save user answer
    answer := UserAnswer{
        UserID:           userID,
        QuestionID:       questionID,
        SelectedOptionID: optionID,
        IsCorrect:        isCorrect,
        TimeSpentSeconds: timeSpent,
    }
    s.db.Create(&answer)
    
    // Update user statistics asynchronously
    go s.updateUserStats(userID, isCorrect, timeSpent)
    
    return &AnswerResponse{
        IsCorrect:       isCorrect,
        CorrectOptionID: correctOption.ID,
        Explanation:     question.Explanation,
        ReferenceSource: question.ReferenceSource,
    }, nil
}
```

#### 3.3 Bookmark Question
**Endpoint**: `POST /api/v1/questions/:id/bookmark`
**Auth**: Required

**Database**:
```go
type UserBookmark struct {
    ID         uuid.UUID `gorm:"type:uuid;primary_key"`
    UserID     uuid.UUID `gorm:"index:idx_user_question,unique"`
    QuestionID uuid.UUID `gorm:"index:idx_user_question,unique"`
    CreatedAt  time.Time
}
```

#### 3.4 Get Bookmarked Questions
**Endpoint**: `GET /api/v1/users/me/bookmarks`
**Auth**: Required

---

### 4. PRACTICE TEST SIMULATOR

#### Database Schema:
```go
type PracticeTest struct {
    ID              uuid.UUID `gorm:"type:uuid;primary_key"`
    UserID          uuid.UUID
    TestType        string    `gorm:"type:varchar(50)"` // full_exam, topic_specific, custom
    Status          string    `gorm:"type:varchar(20)"` // in_progress, completed, abandoned
    TotalQuestions  int
    CorrectAnswers  int
    Score           float64   // Percentage
    TimeSpentSeconds int
    StartedAt       time.Time
    CompletedAt     *time.Time
    CreatedAt       time.Time
}

type PracticeTestQuestion struct {
    ID             uuid.UUID `gorm:"type:uuid;primary_key"`
    PracticeTestID uuid.UUID
    QuestionID     uuid.UUID
    Question       Question  `gorm:"foreignKey:QuestionID"`
    Position       int
    AnswerID       *uuid.UUID
    IsCorrect      *bool
    TimeSpentSeconds int
}
```

#### 4.1 Start Practice Test
**Endpoint**: `POST /api/v1/practice-tests`
**Auth**: Required

**Request**:
```json
{
  "test_type": "full_exam",
  "topic_ids": ["uuid1", "uuid2"],
  "difficulty": "medium",
  "question_count": 110,
  "time_limit_minutes": 150
}
```

**Response**:
```json
{
  "test_id": "uuid",
  "questions": [
    {
      "id": "uuid",
      "position": 1,
      "content": "Question text...",
      "options": [...]
    }
  ],
  "total_questions": 110,
  "time_limit_minutes": 150,
  "started_at": "2025-10-08T10:00:00Z"
}
```

**Go Implementation**:
```go
func (s *TestService) StartPracticeTest(ctx context.Context, userID uuid.UUID, req StartTestRequest) (*StartTestResponse, error) {
    // Generate question set
    questions, err := s.generateQuestionSet(ctx, req)
    
    // Create practice test record
    test := PracticeTest{
        UserID:         userID,
        TestType:       req.TestType,
        Status:         "in_progress",
        TotalQuestions: len(questions),
        StartedAt:      time.Now(),
    }
    s.db.Create(&test)
    
    // Create test questions
    for i, q := range questions {
        testQ := PracticeTestQuestion{
            PracticeTestID: test.ID,
            QuestionID:     q.ID,
            Position:       i + 1,
        }
        s.db.Create(&testQ)
    }
    
    // Cache test in Redis for quick access (2.5 hours expiry)
    s.cacheTest(ctx, test.ID, questions)
    
    return &StartTestResponse{
        TestID:            test.ID,
        Questions:         questions,
        TotalQuestions:    len(questions),
        TimeLimitMinutes:  req.TimeLimitMinutes,
        StartedAt:         test.StartedAt,
    }, nil
}

func (s *TestService) generateQuestionSet(ctx context.Context, req StartTestRequest) ([]Question, error) {
    query := s.db.WithContext(ctx).Model(&Question{}).Where("is_active = ?", true)
    
    if req.TestType == "full_exam" {
        // Full exam: distribute questions by topic weights
        var questions []Question
        topics, _ := s.topicRepo.GetAll(ctx)
        
        for _, topic := range topics {
            count := int(float64(req.QuestionCount) * (topic.Weight / 100.0))
            var topicQuestions []Question
            s.db.Where("topic_id = ?", topic.ID).
                Order("RANDOM()").
                Limit(count).
                Find(&topicQuestions)
            questions = append(questions, topicQuestions...)
        }
        return questions, nil
    }
    
    // Topic-specific or custom test
    if len(req.TopicIDs) > 0 {
        query = query.Where("topic_id IN ?", req.TopicIDs)
    }
    
    var questions []Question
    query.Order("RANDOM()").Limit(req.QuestionCount).Find(&questions)
    return questions, nil
}
```

#### 4.2 Submit Test Answer (During Test)
**Endpoint**: `POST /api/v1/practice-tests/:id/questions/:position/answer`
**Auth**: Required

**Request**:
```json
{
  "selected_option_id": "uuid",
  "time_spent_seconds": 45
}
```

#### 4.3 Complete Test
**Endpoint**: `POST /api/v1/practice-tests/:id/complete`
**Auth**: Required

**Response**:
```json
{
  "test_id": "uuid",
  "score": 76.5,
  "correct_answers": 84,
  "total_questions": 110,
  "time_spent_seconds": 7200,
  "pass_status": "pass",
  "performance_by_topic": [
    {
      "topic_name": "Professional Practice",
      "correct": 18,
      "total": 22,
      "percentage": 81.8
    }
  ],
  "weak_topics": ["Ethics", "Liability"],
  "completed_at": "2025-10-08T12:30:00Z"
}
```

**Go Implementation**:
```go
func (s *TestService) CompleteTest(ctx context.Context, testID uuid.UUID) (*TestResultResponse, error) {
    // Get test with all questions and answers
    test, err := s.testRepo.GetByIDWithQuestions(ctx, testID)
    
    // Calculate score
    correct := 0
    for _, q := range test.Questions {
        if q.IsCorrect != nil && *q.IsCorrect {
            correct++
        }
    }
    score := (float64(correct) / float64(test.TotalQuestions)) * 100
    
    // Update test record
    now := time.Now()
    test.Status = "completed"
    test.CompletedAt = &now
    test.CorrectAnswers = correct
    test.Score = score
    s.db.Save(&test)
    
    // Analyze performance by topic
    topicPerformance := s.analyzeTopicPerformance(test)
    
    // Identify weak topics (< 65% correct)
    weakTopics := s.identifyWeakTopics(topicPerformance)
    
    // Update user statistics
    go s.updateUserTestStats(test.UserID, score)
    
    // Generate pass probability prediction
    passProbability := s.predictPassProbability(ctx, test.UserID)
    
    return &TestResultResponse{
        TestID:              test.ID,
        Score:               score,
        CorrectAnswers:      correct,
        TotalQuestions:      test.TotalQuestions,
        PassStatus:          score >= 65,
        PerformanceByTopic:  topicPerformance,
        WeakTopics:          weakTopics,
        PassProbability:     passProbability,
        CompletedAt:         *test.CompletedAt,
    }, nil
}
```

#### 4.4 Get Test History
**Endpoint**: `GET /api/v1/users/me/practice-tests`
**Auth**: Required

#### 4.5 Review Test Results
**Endpoint**: `GET /api/v1/practice-tests/:id/review`
**Auth**: Required

**Returns all questions with**:
- User's selected answer
- Correct answer
- Explanation
- Time spent per question

---

### 5. STUDY PATH & PROGRESS TRACKING

#### Database Schema:
```go
type StudyPath struct {
    ID          uuid.UUID `gorm:"type:uuid;primary_key"`
    UserID      uuid.UUID
    Status      string    `gorm:"type:varchar(20)"` // not_started, in_progress, completed
    CurrentWeek int       `gorm:"default:1"`
    StartDate   *time.Time
    TargetDate  *time.Time
    CreatedAt   time.Time
    UpdatedAt   time.Time
}

type Module struct {
    ID          uuid.UUID `gorm:"type:uuid;primary_key"`
    Title       string    `gorm:"not null"`
    Description string    `gorm:"type:text"`
    Week        int       `gorm:"not null"`
    Order       int       `gorm:"not null"`
    TopicID     uuid.UUID
    DurationMinutes int
    ContentURL  string    // Link to study materials
    VideoURL    string    // Link to video content
}

type UserModuleProgress struct {
    ID          uuid.UUID `gorm:"type:uuid;primary_key"`
    UserID      uuid.UUID
    ModuleID    uuid.UUID
    Status      string    `gorm:"type:varchar(20)"` // not_started, in_progress, completed
    Progress    int       `gorm:"default:0"` // 0-100
    TimeSpent   int       // seconds
    StartedAt   *time.Time
    CompletedAt *time.Time
    CreatedAt   time.Time
}

type UserTopicMastery struct {
    ID                uuid.UUID `gorm:"type:uuid;primary_key"`
    UserID            uuid.UUID `gorm:"index:idx_user_topic,unique"`
    TopicID           uuid.UUID `gorm:"index:idx_user_topic,unique"`
    QuestionsAttempted int
    QuestionsCorrect  int
    MasteryPercentage float64
    LastPracticed     time.Time
    UpdatedAt         time.Time
}
```

#### 5.1 Get Study Path
**Endpoint**: `GET /api/v1/users/me/study-path`
**Auth**: Required

**Response**:
```json
{
  "study_path_id": "uuid",
  "status": "in_progress",
  "current_week": 3,
  "progress_percentage": 37.5,
  "target_exam_date": "2025-06-15",
  "days_remaining": 89,
  "modules": [
    {
      "id": "uuid",
      "title": "Introduction to Professional Practice",
      "week": 1,
      "order": 1,
      "status": "completed",
      "progress": 100,
      "duration_minutes": 45,
      "completed_at": "2025-09-15T14:30:00Z"
    },
    {
      "id": "uuid",
      "title": "Engineering Ethics Fundamentals",
      "week": 1,
      "order": 2,
      "status": "in_progress",
      "progress": 60,
      "duration_minutes": 60
    }
  ],
  "next_module": {
    "id": "uuid",
    "title": "Ethics Case Studies"
  }
}
```

#### 5.2 Update Module Progress
**Endpoint**: `PUT /api/v1/study-path/modules/:id/progress`
**Auth**: Required

**Request**:
```json
{
  "progress": 75,
  "time_spent_seconds": 1800
}
```

#### 5.3 Mark Module Complete
**Endpoint**: `POST /api/v1/study-path/modules/:id/complete`
**Auth**: Required

---

### 6. ANALYTICS & DASHBOARD

#### 6.1 Get Dashboard Statistics
**Endpoint**: `GET /api/v1/users/me/dashboard`
**Auth**: Required

**Response**:
```json
{
  "overall_progress": 68,
  "study_streak": 7,
  "longest_streak": 12,
  "questions_completed": 234,
  "questions_correct": 187,
  "accuracy_rate": 79.9,
  "practice_tests_taken": 5,
  "average_test_score": 76.2,
  "time_studied_hours": 42.5,
  "pass_probability": 82,
  "days_until_exam": 89,
  "recommended_study_time_daily": 90,
  "topic_mastery": [
    {
      "topic_name": "Professional Practice",
      "questions_attempted": 45,
      "questions_correct": 38,
      "mastery_percentage": 84.4,
      "status": "mastered"
    }
  ],
  "weak_topics": [
    {"name": "Ethics", "score": 58.3},
    {"name": "Liability", "score": 62.1}
  ],
  "recent_activity": [
    {
      "type": "practice_test",
      "description": "Completed Practice Test #3",
      "score": 76,
      "timestamp": "2025-10-08T10:30:00Z"
    }
  ]
}
```

**Go Implementation**:
```go
func (s *AnalyticsService) GetDashboard(ctx context.Context, userID uuid.UUID) (*DashboardResponse, error) {
    // Aggregate data from multiple sources
    var wg sync.WaitGroup
    errChan := make(chan error, 10)
    
    var (
        overallProgress    int
        studyStreak        int
        questionsCompleted int
        testsTaken         int
        avgScore           float64
        topicMastery       []TopicMasteryStats
    )
    
    // Fetch overall progress
    wg.Add(1)
    go func() {
        defer wg.Done()
        overallProgress, _ = s.getOverallProgress(ctx, userID)
    }()
    
    // Fetch study streak
    wg.Add(1)
    go func() {
        defer wg.Done()
        studyStreak, _ = s.getStudyStreak(ctx, userID)
    }()
    
    // Fetch question statistics
    wg.Add(1)
    go func() {
        defer wg.Done()
        questionsCompleted, _ = s.getQuestionsCompleted(ctx, userID)
    }()
    
    // Fetch test statistics
    wg.Add(1)
    go func() {
        defer wg.Done()
        testsTaken, avgScore, _ = s.getTestStatistics(ctx, userID)
    }()
    
    // Fetch topic mastery
    wg.Add(1)
    go func() {
        defer wg.Done()
        topicMastery, _ = s.getTopicMastery(ctx, userID)
    }()
    
    wg.Wait()
    close(errChan)
    
    // Calculate pass probability using ML model
    passProbability := s.predictPassProbability(ctx, userID)
    
    return &DashboardResponse{
        OverallProgress:    overallProgress,
        StudyStreak:        studyStreak,
        QuestionsCompleted: questionsCompleted,
        PracticeTestsTaken: testsTaken,
        AverageTestScore:   avgScore,
        TopicMastery:       topicMastery,
        PassProbability:    passProbability,
    }, nil
}
```

**Caching Strategy**:
```go
// Cache dashboard data for 5 minutes
func (s *AnalyticsService) GetDashboard(ctx context.Context, userID uuid.UUID) (*DashboardResponse, error) {
    cacheKey := fmt.Sprintf("dashboard:%s", userID)
    
    // Try to get from cache
    var cached DashboardResponse
    if err := s.redis.Get(ctx, cacheKey, &cached); err == nil {
        return &cached, nil
    }
    
    // Compute dashboard data
    dashboard := s.computeDashboard(ctx, userID)
    
    // Cache for 5 minutes
    s.redis.Set(ctx, cacheKey, dashboard, 5*time.Minute)
    
    return dashboard, nil
}
```

#### 6.2 Get Performance Analytics
**Endpoint**: `GET /api/v1/users/me/analytics`
**Auth**: Required

**Query Parameters**:
```
?timeframe=7d  // 7d, 30d, 90d, all
```

**Response**:
```json
{
  "timeframe": "30d",
  "questions_per_day": [
    {"date": "2025-09-08", "count": 15},
    {"date": "2025-09-09", "count": 22}
  ],
  "accuracy_trend": [
    {"date": "2025-09-08", "percentage": 78.5},
    {"date": "2025-09-09", "percentage": 81.2}
  ],
  "time_spent_per_day": [
    {"date": "2025-09-08", "minutes": 45},
    {"date": "2025-09-09", "minutes": 62}
  ],
  "topic_breakdown": [
    {"topic": "Ethics", "questions": 45, "correct": 38},
    {"topic": "Law", "questions": 32, "correct": 28}
  ]
}
```

#### 6.3 Get Weakness Report
**Endpoint**: `GET /api/v1/users/me/weaknesses`
**Auth**: Required

**Response**:
```json
{
  "weak_topics": [
    {
      "topic": "Ethics",
      "sub_topics": [
        {"name": "Conflict of Interest", "score": 52.3, "questions_attempted": 15}
      ],
      "overall_score": 58.3,
      "recommended_practice": 25
    }
  ],
  "difficult_questions": [
    {
      "question_id": "uuid",
      "topic": "Ethics",
      "attempts": 3,
      "last_attempt_correct": false
    }
  ]
}
```

---

### 7. SUBSCRIPTION & PAYMENT

#### Database Schema:
```go
type Subscription struct {
    ID               uuid.UUID `gorm:"type:uuid;primary_key"`
    UserID           uuid.UUID `gorm:"uniqueIndex"`
    Plan             string    `gorm:"type:varchar(20)"` // free, monthly, annual
    Status           string    `gorm:"type:varchar(20)"` // active, cancelled, expired, past_due
    StripeCustomerID string    `gorm:"index"`
    StripeSubscriptionID string `gorm:"index"`
    CurrentPeriodStart time.Time
    CurrentPeriodEnd   time.Time
    CancelAtPeriodEnd bool
    CreatedAt        time.Time
    UpdatedAt        time.Time
}

type Payment struct {
    ID              uuid.UUID `gorm:"type:uuid;primary_key"`
    UserID          uuid.UUID
    SubscriptionID  uuid.UUID
    Amount          int       // in cents
    Currency        string    `gorm:"default:'CAD'"`
    Status          string    // succeeded, pending, failed
    StripePaymentID string
    CreatedAt       time.Time
}
```

#### 7.1 Create Subscription
**Endpoint**: `POST /api/v1/subscriptions`
**Auth**: Required

**Request**:
```json
{
  "plan": "monthly",
  "payment_method_id": "pm_1234"
}
```

**Go Implementation**:
```go
import "github.com/stripe/stripe-go/v76"
import "github.com/stripe/stripe-go/v76/customer"
import "github.com/stripe/stripe-go/v76/subscription"

func (s *SubscriptionService) CreateSubscription(ctx context.Context, userID uuid.UUID, req CreateSubscriptionRequest) error {
    user, _ := s.userRepo.GetByID(ctx, userID)
    
    // Create Stripe customer if doesn't exist
    if user.StripeCustomerID == "" {
        params := &stripe.CustomerParams{
            Email: stripe.String(user.Email),
            Name:  stripe.String(user.FirstName + " " + user.LastName),
        }
        customer, err := customer.New(params)
        if err != nil {
            return err
        }
        user.StripeCustomerID = customer.ID
        s.userRepo.Update(ctx, user)
    }
    
    // Attach payment method
    s.stripe.AttachPaymentMethod(user.StripeCustomerID, req.PaymentMethodID)
    
    // Create subscription
    priceID := s.getPriceID(req.Plan) // monthly: price_xxx, annual: price_yyy
    subParams := &stripe.SubscriptionParams{
        Customer: stripe.String(user.StripeCustomerID),
        Items: []*stripe.SubscriptionItemsParams{
            {Price: stripe.String(priceID)},
        },
    }
    stripeSub, err := subscription.New(subParams)
    
    // Save subscription to database
    sub := Subscription{
        UserID:               userID,
        Plan:                 req.Plan,
        Status:               string(stripeSub.Status),
        StripeCustomerID:     user.StripeCustomerID,
        StripeSubscriptionID: stripeSub.ID,
        CurrentPeriodStart:   time.Unix(stripeSub.CurrentPeriodStart, 0),
        CurrentPeriodEnd:     time.Unix(stripeSub.CurrentPeriodEnd, 0),
    }
    s.db.Create(&sub)
    
    return nil
}
```

#### 7.2 Cancel Subscription
**Endpoint**: `DELETE /api/v1/subscriptions/current`
**Auth**: Required

#### 7.3 Stripe Webhooks
**Endpoint**: `POST /api/v1/webhooks/stripe`

**Events to Handle**:
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

**Go Implementation**:
```go
func (h *WebhookHandler) HandleStripeWebhook(c *gin.Context) {
    payload, _ := ioutil.ReadAll(c.Request.Body)
    event, err := webhook.ConstructEvent(payload, c.GetHeader("Stripe-Signature"), os.Getenv("STRIPE_WEBHOOK_SECRET"))
    
    switch event.Type {
    case "invoice.payment_succeeded":
        var invoice stripe.Invoice
        json.Unmarshal(event.Data.Raw, &invoice)
        h.handlePaymentSucceeded(invoice)
        
    case "invoice.payment_failed":
        var invoice stripe.Invoice
        json.Unmarshal(event.Data.Raw, &invoice)
        h.handlePaymentFailed(invoice)
        
    case "customer.subscription.deleted":
        var subscription stripe.Subscription
        json.Unmarshal(event.Data.Raw, &subscription)
        h.handleSubscriptionCancelled(subscription)
    }
    
    c.JSON(200, gin.H{"received": true})
}
```

---

### 8. COMMUNITY FEATURES

#### Database Schema:
```go
type ForumPost struct {
    ID          uuid.UUID `gorm:"type:uuid;primary_key"`
    UserID      uuid.UUID
    Title       string    `gorm:"not null"`
    Content     string    `gorm:"type:text;not null"`
    Category    string    `gorm:"type:varchar(50)"`
    ViewCount   int       `gorm:"default:0"`
    ReplyCount  int       `gorm:"default:0"`
    IsPinned    bool      `gorm:"default:false"`
    IsLocked    bool      `gorm:"default:false"`
    CreatedAt   time.Time
    UpdatedAt   time.Time
}

type ForumReply struct {
    ID         uuid.UUID `gorm:"type:uuid;primary_key"`
    PostID     uuid.UUID
    UserID     uuid.UUID
    Content    string    `gorm:"type:text;not null"`
    IsAccepted bool      `gorm:"default:false"`
    CreatedAt  time.Time
    UpdatedAt  time.Time
}

type StudyGroup struct {
    ID          uuid.UUID `gorm:"type:uuid;primary_key"`
    Name        string    `gorm:"not null"`
    Description string    `gorm:"type:text"`
    CreatorID   uuid.UUID
    MemberCount int       `gorm:"default:1"`
    IsPrivate   bool      `gorm:"default:false"`
    CreatedAt   time.Time
}

type StudyGroupMember struct {
    ID          uuid.UUID `gorm:"type:uuid;primary_key"`
    GroupID     uuid.UUID
    UserID      uuid.UUID
    Role        string    `gorm:"type:varchar(20)"` // owner, moderator, member
    JoinedAt    time.Time
}
```

#### 8.1 Forum Endpoints
- `GET /api/v1/forum/posts` - List posts
- `POST /api/v1/forum/posts` - Create post
- `GET /api/v1/forum/posts/:id` - Get post details
- `POST /api/v1/forum/posts/:id/replies` - Add reply
- `PUT /api/v1/forum/posts/:id` - Update post (owner only)
- `DELETE /api/v1/forum/posts/:id` - Delete post (owner/admin)

#### 8.2 Study Group Endpoints
- `GET /api/v1/study-groups` - List groups
- `POST /api/v1/study-groups` - Create group
- `POST /api/v1/study-groups/:id/join` - Join group
- `GET /api/v1/study-groups/:id/members` - Get members

---

### 9. NOTIFICATIONS

#### Database Schema:
```go
type Notification struct {
    ID        uuid.UUID `gorm:"type:uuid;primary_key"`
    UserID    uuid.UUID
    Type      string    `gorm:"type:varchar(50)"` // achievement, reminder, system
    Title     string    `gorm:"not null"`
    Message   string    `gorm:"type:text"`
    Link      string
    IsRead    bool      `gorm:"default:false"`
    CreatedAt time.Time
}

type UserNotificationSettings struct {
    ID                  uuid.UUID `gorm:"type:uuid;primary_key"`
    UserID              uuid.UUID `gorm:"uniqueIndex"`
    EmailNotifications  bool      `gorm:"default:true"`
    PushNotifications   bool      `gorm:"default:true"`
    DailyReminder       bool      `gorm:"default:true"`
    ReminderTime        string    `gorm:"default:'09:00'"`
    WeeklyReport        bool      `gorm:"default:true"`
}
```

#### 9.1 Get Notifications
**Endpoint**: `GET /api/v1/notifications`
**Auth**: Required

#### 9.2 Mark as Read
**Endpoint**: `PUT /api/v1/notifications/:id/read`
**Auth**: Required

#### 9.3 Update Notification Settings
**Endpoint**: `PUT /api/v1/users/me/notification-settings`
**Auth**: Required

**Background Jobs (Asynq)**:
```go
func (w *NotificationWorker) SendDailyReminders() {
    // Find users with daily reminders enabled
    users, _ := w.db.
        Joins("JOIN user_notification_settings ON users.id = user_notification_settings.user_id").
        Where("user_notification_settings.daily_reminder = ?", true).
        Find(&users)
    
    for _, user := range users {
        // Check if user should be reminded (hasn't studied today)
        if !w.hasStudiedToday(user.ID) {
            w.sendEmail(user.Email, "Daily Study Reminder", "Don't break your streak!")
            w.sendPushNotification(user.ID, "Time to study!")
        }
    }
}
```

---

### 10. ADMIN PANEL

#### 10.1 Admin Authentication
**Endpoint**: `POST /api/v1/admin/login`

**Middleware**:
```go
func AdminAuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        claims, _ := extractJWT(c)
        if !claims.IsAdmin {
            c.JSON(403, gin.H{"error": "Admin access required"})
            c.Abort()
            return
        }
        c.Next()
    }
}
```

#### 10.2 Admin Endpoints
- `GET /api/v1/admin/users` - List all users
- `GET /api/v1/admin/statistics` - Platform statistics
- `POST /api/v1/admin/questions` - Create question
- `PUT /api/v1/admin/questions/:id` - Update question
- `DELETE /api/v1/admin/questions/:id` - Delete question
- `GET /api/v1/admin/payments` - Payment history
- `POST /api/v1/admin/users/:id/subscription` - Modify subscription

---

## 🔒 SECURITY IMPLEMENTATION

### JWT Authentication
```go
type Claims struct {
    UserID  uuid.UUID `json:"user_id"`
    Email   string    `json:"email"`
    IsAdmin bool      `json:"is_admin"`
    jwt.StandardClaims
}

func GenerateJWT(user User) (string, error) {
    expirationTime := time.Now().Add(1 * time.Hour)
    claims := &Claims{
        UserID:  user.ID,
        Email:   user.Email,
        IsAdmin: user.IsAdmin,
        StandardClaims: jwt.StandardClaims{
            ExpiresAt: expirationTime.Unix(),
            IssuedAt:  time.Now().Unix(),
        },
    }
    
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}
```

### Rate Limiting
```go
import "github.com/ulule/limiter/v3"
import "github.com/ulule/limiter/v3/drivers/store/redis"

func RateLimitMiddleware() gin.HandlerFunc {
    rate := limiter.Rate{
        Period: 1 * time.Minute,
        Limit:  60,
    }
    
    store, _ := redis.NewStore(redisClient)
    middleware := limiter.NewMiddleware(limiter.New(store, rate))
    
    return func(c *gin.Context) {
        middleware.Handle(c.Writer, c.Request)
        c.Next()
    }
}
```

### Input Validation
```go
import "github.com/go-playground/validator/v10"

var validate = validator.New()

func ValidateStruct(s interface{}) error {
    return validate.Struct(s)
}

// Custom validators
func init() {
    validate.RegisterValidation("province", func(fl validator.FieldLevel) bool {
        provinces := []string{"AB", "BC", "MB", "NB", "NL", "NT", "NS", "NU", "ON", "PE", "QC", "SK", "YT"}
        return contains(provinces, fl.Field().String())
    })
}
```

### SQL Injection Prevention
```go
// Always use parameterized queries with GORM
db.Where("email = ?", email).First(&user)

// Never do this:
// db.Where("email = '" + email + "'").First(&user)
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### Database Indexing
```sql
CREATE INDEX idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX idx_user_answers_question_id ON user_answers(question_id);
CREATE INDEX idx_user_answers_created_at ON user_answers(created_at);
CREATE INDEX idx_practice_tests_user_id_status ON practice_tests(user_id, status);
CREATE INDEX idx_questions_topic_difficulty ON questions(topic_id, difficulty);

-- Full-text search
CREATE INDEX idx_questions_content_fts ON questions USING gin(to_tsvector('english', content));
```

### Redis Caching Strategy
```go
// Cache frequently accessed data
func (s *QuestionService) GetQuestion(ctx context.Context, id uuid.UUID) (*Question, error) {
    cacheKey := fmt.Sprintf("question:%s", id)
    
    // Try cache first
    var cached Question
    if err := s.redis.Get(ctx, cacheKey, &cached); err == nil {
        return &cached, nil
    }
    
    // Query database
    var question Question
    s.db.Preload("Options").First(&question, id)
    
    // Cache for 1 hour
    s.redis.Set(ctx, cacheKey, question, 1*time.Hour)
    
    return &question, nil
}
```

### Database Connection Pooling
```go
func InitDB() *gorm.DB {
    dsn := os.Getenv("DATABASE_URL")
    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    
    sqlDB, _ := db.DB()
    sqlDB.SetMaxIdleConns(10)
    sqlDB.SetMaxOpenConns(100)
    sqlDB.SetConnMaxLifetime(time.Hour)
    
    return db
}
```

### Background Jobs (Asynq)
```go
import "github.com/hibiken/asynq"

// Define tasks
const (
    TypeEmailDelivery = "email:deliver"
    TypeReportGeneration = "report:generate"
)

// Worker
func main() {
    srv := asynq.NewServer(
        asynq.RedisClientOpt{Addr: "localhost:6379"},
        asynq.Config{Concurrency: 10},
    )
    
    mux := asynq.NewServeMux()
    mux.HandleFunc(TypeEmailDelivery, HandleEmailDelivery)
    mux.HandleFunc(TypeReportGeneration, HandleReportGeneration)
    
    srv.Run(mux)
}

// Enqueue job
func (s *EmailService) SendAsync(to, subject, body string) error {
    task := asynq.NewTask(TypeEmailDelivery, map[string]interface{}{
        "to": to,
        "subject": subject,
        "body": body,
    })
    
    return s.client.Enqueue(task)
}
```

---

## 🧪 TESTING

### Unit Tests
```go
func TestUserRegistration(t *testing.T) {
    // Setup
    db := setupTestDB()
    service := NewAuthService(db)
    
    // Test
    req := RegisterRequest{
        Email:     "test@example.com",
        Password:  "SecurePass123!",
        FirstName: "John",
        LastName:  "Doe",
        Province:  "NL",
    }
    
    user, err := service.Register(context.Background(), req)
    
    // Assert
    assert.NoError(t, err)
    assert.NotNil(t, user)
    assert.Equal(t, req.Email, user.Email)
}
```

### Integration Tests
```go
func TestPracticeTestFlow(t *testing.T) {
    // Start test
    test, _ := testService.StartPracticeTest(ctx, userID, StartTestRequest{
        TestType:      "full_exam",
        QuestionCount: 110,
    })
    
    // Answer questions
    for _, q := range test.Questions {
        testService.SubmitTestAnswer(ctx, test.ID, q.ID, q.Options[0].ID, 60)
    }
    
    // Complete test
    result, _ := testService.CompleteTest(ctx, test.ID)
    
    // Assert
    assert.Equal(t, 110, result.TotalQuestions)
    assert.NotNil(t, result.Score)
}
```

---

## 📊 MONITORING & LOGGING

### Prometheus Metrics
```go
import "github.com/prometheus/client_golang/prometheus"

var (
    httpDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name: "http_request_duration_seconds",
            Help: "HTTP request duration",
        },
        []string{"method", "endpoint", "status"},
    )
    
    activeUsers = prometheus.NewGauge(
        prometheus.GaugeOpts{
            Name: "active_users_total",
            Help: "Number of active users",
        },
    )
)

func PrometheusMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        c.Next()
        duration := time.Since(start).Seconds()
        
        httpDuration.WithLabelValues(
            c.Request.Method,
            c.FullPath(),
            fmt.Sprintf("%d", c.Writer.Status()),
        ).Observe(duration)
    }
}
```

### Structured Logging
```go
import "github.com/rs/zerolog/log"

func (s *AuthService) Login(ctx context.Context, req LoginRequest) (*LoginResponse, error) {
    log.Info().
        Str("email", req.Email).
        Str("ip", getIP(ctx)).
        Msg("Login attempt")
    
    user, err := s.userRepo.FindByEmail(ctx, req.Email)
    if err != nil {
        log.Warn().
            Str("email", req.Email).
            Err(err).
            Msg("Login failed - user not found")
        return nil, ErrInvalidCredentials
    }
    
    // ...
    
    log.Info().
        Str("user_id", user.ID.String()).
        Msg("Login successful")
    
    return response, nil
}
```

---

## 🚀 DEPLOYMENT

### Docker Compose
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/nppe
      - REDIS_URL=redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=nppe
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  worker:
    build: .
    command: ./worker
    environment:
      - REDIS_URL=redis:6379
    depends_on:
      - redis

volumes:
  postgres_data:
```

### Environment Variables
```bash
# .env
DATABASE_URL=postgres://user:pass@localhost:5432/nppe
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=another-secret-key
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=nppe-uploads
SENDGRID_API_KEY=SG.xxx
APP_ENV=production
```

---

## 📝 API DOCUMENTATION (Swagger)

```go
import "github.com/swaggo/gin-swagger"
import "github.com/swaggo/files"

// @title NPPE API
// @version 1.0
// @description API for NPPE Exam Preparation Platform
// @host api.nppepro.com
// @BasePath /api/v1
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization

func main() {
    r := gin.Default()
    
    // Swagger documentation
    r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
    
    // Routes...
}

// Example endpoint documentation
// @Summary Login user
// @Description Authenticate user and return JWT token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body LoginRequest true "Login credentials"
// @Success 200 {object} LoginResponse
// @Failure 401 {object} ErrorResponse
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
    // Implementation
}
```

---

## 🎯 FEATURE PRIORITY SUMMARY

### Phase 1 (Weeks 1-4): Core MVP
✅ User authentication (register, login, OAuth)
✅ Question bank (get, answer, bookmark)
✅ Practice test simulator
✅ Basic dashboard statistics
✅ Subscription management (Stripe)

### Phase 2 (Weeks 5-8): Enhanced Features
✅ Study path with modules
✅ Advanced analytics
✅ Topic mastery tracking
✅ Weakness identification
✅ Email notifications

### Phase 3 (Weeks 9-12): Community & Polish
✅ Forum and study groups
✅ Admin panel
✅ Push notifications
✅ Performance optimization
✅ Advanced ML predictions

---

## 📦 COMPLETE TECH STACK

**Backend**:
- Go 1.21+
- Gin web framework
- GORM (ORM)
- PostgreSQL 15
- Redis 7
- Asynq (background jobs)

**Authentication**:
- JWT
- Bcrypt
- OAuth2 (Google, Apple)

**Payment**:
- Stripe API

**Storage**:
- AWS S3 / MinIO

**Email**:
- SendGrid / Mailgun

**Monitoring**:
- Prometheus
- Grafana
- Zerolog

**Testing**:
- testify
- httptest

**Documentation**:
- Swagger / OpenAPI

**Deployment**:
- Docker
- Docker Compose
- Kubernetes (optional)

---

This comprehensive specification provides everything needed to build a production-ready NPPE MVP backend with Go. All features are designed for scalability, security, and performance.
"""

# Save to file
with open('NPPE_GO_BACKEND_SPECIFICATION.md', 'w', encoding='utf-8') as f:
    f.write(go_backend_spec)

print("=" * 80)
print("NPPE GO BACKEND SPECIFICATION CREATED SUCCESSFULLY")
print("=" * 80)
print()
print("📄 File: NPPE_GO_BACKEND_SPECIFICATION.md")
print("📊 Document Length:", len(go_backend_spec), "characters")
print()
print("🎯 COMPLETE FEATURE LIST:")
print()
print("1.  🔐 Authentication & User Management")
print("    • Registration (email + OAuth)")
print("    • Login with JWT")
print("    • Password reset")
print("    • Email verification")
print()
print("2.  👤 User Profile Management")
print("    • Get/update profile")
print("    • Avatar upload")
print("    • Account deletion")
print()
print("3.  📚 Question Bank Management")
print("    • Get questions (filtered)")
print("    • Submit answers")
print("    • Bookmark questions")
print("    • Track user progress")
print()
print("4.  🎯 Practice Test Simulator")
print("    • Start full/topic/custom tests")
print("    • Submit answers during test")
print("    • Complete test with results")
print("    • Test history and review")
print()
print("5.  📖 Study Path & Progress")
print("    • 8-week structured curriculum")
print("    • Module progress tracking")
print("    • Topic mastery calculation")
print()
print("6.  📊 Analytics & Dashboard")
print("    • Real-time dashboard stats")
print("    • Performance analytics")
print("    • Weakness identification")
print("    • Pass probability prediction")
print()
print("7.  💳 Subscription & Payment")
print("    • Stripe integration")
print("    • Monthly/annual plans")
print("    • Webhook handling")
print("    • Payment history")
print()
print("8.  👥 Community Features")
print("    • Forum (posts & replies)")
print("    • Study groups")
print("    • User interactions")
print()
print("9.  🔔 Notifications")
print("    • Email notifications")
print("    • Push notifications")
print("    • Daily reminders")
print("    • Weekly reports")
print()
print("10. 🛠️  Admin Panel")
print("    • User management")
print("    • Question CRUD")
print("    • Platform statistics")
print("    • Subscription management")
print()
print("=" * 80)
print("🛠️  TECHNICAL SPECIFICATIONS:")
print("=" * 80)
print()
print("✅ Go 1.21+ with Gin/Echo framework")
print("✅ PostgreSQL 15+ database")
print("✅ Redis for caching & sessions")
print("✅ JWT authentication")
print("✅ Stripe payment integration")
print("✅ AWS S3 file storage")
print("✅ Asynq background jobs")
print("✅ Prometheus monitoring")
print("✅ Swagger API documentation")
print("✅ Docker deployment ready")
print()
print("=" * 80)
print("📋 INCLUDED:")
print("=" * 80)
print()
print("• Complete database schemas (Go structs)")
print("• All API endpoints with examples")
print("• Request/response JSON examples")
print("• Go code implementation samples")
print("• Security best practices")
print("• Performance optimization")
print("• Testing strategies")
print("• Monitoring & logging")
print("• Deployment configuration")
print("• Rate limiting & validation")
print()
print("🚀 Ready for development team to implement!")
print("=" * 80)
