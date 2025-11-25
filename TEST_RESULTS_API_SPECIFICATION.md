# Test Results API Specification

## Endpoint
`GET /api/tests/{testId}/results`

## Response Structure

### Root Level Fields

```typescript
interface TestResultsResponse {
  // Basic Test Information
  id: string;                          // Unique test identifier (UUID)
  user_id: string;                     // User who took the test (UUID)
  test_type: string;                   // Type of test (e.g., "practice", "mock", "full_exam")
  title: string;                       // Display name for the test
  status: "completed";                 // Test completion status (must be "completed" for results)
  
  // Core Metrics
  score: number;                       // Overall score percentage (0-100)
  total_questions: number;             // Total number of questions in test
  correct_answers: number;             // Number of questions answered correctly
  incorrect_answers: number;           // Number of questions answered incorrectly
  unanswered: number;                  // Number of questions not answered
  
  // Time Tracking
  started_at: string;                  // ISO 8601 timestamp when test started
  completed_at: string;                // ISO 8601 timestamp when test completed
  time_spent_seconds: number;          // Total time spent in seconds
  average_time_per_question: number;   // Average seconds per question
  
  // Pass/Fail Status
  passed: boolean;                     // Whether the test was passed
  passing_score: number;               // Minimum score required to pass (e.g., 70)
  
  // Performance Breakdown by Topic
  topic_breakdown: TopicPerformance[]; // Array of topic performance data
  
  // Performance Breakdown by Subtopic (optional, more granular)
  subtopic_breakdown?: SubtopicPerformance[]; // Array of subtopic performance
  
  // Individual Question Results
  question_results: QuestionResult[];  // Detailed results for each question
  
  // Difficulty Analysis
  difficulty_breakdown: {
    easy: DifficultyStats;
    medium: DifficultyStats;
    hard: DifficultyStats;
  };
  
  // Achievements & Gamification
  achievements_unlocked: Achievement[]; // Achievements earned from this test
  badges_earned: Badge[];              // Badges earned from this test
  
  // Recommendations
  weak_areas: string[];                // List of weak topic/subtopic names
  study_recommendations: Recommendation[]; // Personalized study suggestions
  
  // Historical Context (optional)
  improvement_metrics?: {
    score_change: number;              // Change from previous test (percentage points)
    previous_score?: number;           // Score from last test
    tests_taken: number;               // Total tests taken by user
    average_score: number;             // User's average score across all tests
  };
  
  // Leaderboard Context (optional)
  leaderboard_stats?: {
    rank: number;                      // User's rank for this test
    percentile: number;                // Percentile ranking (0-100)
    total_participants: number;        // Total users who took this test
  };
}
```

### Supporting Interfaces

#### TopicPerformance
```typescript
interface TopicPerformance {
  topic_id: string;                    // Topic UUID
  topic_name: string;                  // Display name (e.g., "Structural Engineering")
  total_questions: number;             // Questions in this topic
  correct_answers: number;             // Correct answers in this topic
  incorrect_answers: number;           // Incorrect answers in this topic
  percentage: number;                  // Performance percentage (0-100)
  average_time_seconds: number;        // Average time per question in topic
  difficulty_distribution?: {          // Optional difficulty breakdown
    easy: number;
    medium: number;
    hard: number;
  };
}
```

#### SubtopicPerformance
```typescript
interface SubtopicPerformance {
  subtopic_id: string;                 // Subtopic UUID
  subtopic_name: string;               // Display name
  topic_id: string;                    // Parent topic UUID
  topic_name: string;                  // Parent topic name
  total_questions: number;             // Questions in this subtopic
  correct_answers: number;             // Correct answers
  incorrect_answers: number;           // Incorrect answers
  percentage: number;                  // Performance percentage (0-100)
}
```

#### QuestionResult
```typescript
interface QuestionResult {
  question_id: string;                 // Question UUID
  question_number: number;             // Question order in test (1-based)
  topic_id: string;                    // Topic UUID
  topic_name: string;                  // Topic display name
  subtopic_id?: string;                // Subtopic UUID (optional)
  subtopic_name?: string;              // Subtopic display name (optional)
  difficulty: "easy" | "medium" | "hard"; // Question difficulty level
  
  // Question Content
  question_text: string;               // The question text
  question_type: "multiple_choice" | "true_false"; // Question format
  
  // Answer Options
  options: AnswerOption[];             // Array of answer choices
  
  // User Response
  user_answer_id?: string;             // User's selected answer UUID (null if unanswered)
  correct_answer_id: string;           // Correct answer UUID
  is_correct: boolean;                 // Whether user answered correctly
  
  // Time Tracking
  time_spent_seconds: number;          // Time user spent on this question
  
  // Explanation
  explanation?: string;                // Explanation of correct answer (optional)
  reference?: string;                  // Reference material (optional)
  
  // Bookmarking
  is_bookmarked: boolean;              // Whether user bookmarked this question
  
  // Performance Context
  global_correct_rate?: number;        // Percentage of users who got this correct (0-100)
}
```

#### AnswerOption
```typescript
interface AnswerOption {
  id: string;                          // Answer option UUID
  text: string;                        // Answer text
  is_correct: boolean;                 // Whether this is the correct answer
  order: number;                       // Display order (1-based)
}
```

#### DifficultyStats
```typescript
interface DifficultyStats {
  total_questions: number;             // Questions at this difficulty
  correct_answers: number;             // Correct answers
  incorrect_answers: number;           // Incorrect answers
  percentage: number;                  // Performance percentage (0-100)
  average_time_seconds: number;        // Average time per question
}
```

#### Achievement
```typescript
interface Achievement {
  id: string;                          // Achievement UUID
  name: string;                        // Display name (e.g., "Perfect Score")
  description: string;                 // Description of achievement
  icon: string;                        // Icon identifier or URL
  rarity: "common" | "rare" | "epic" | "legendary"; // Achievement rarity
  earned_at: string;                   // ISO 8601 timestamp when earned
  points: number;                      // Points awarded for this achievement
}
```

#### Badge
```typescript
interface Badge {
  id: string;                          // Badge UUID
  name: string;                        // Display name
  description: string;                 // Badge description
  icon: string;                        // Icon identifier or URL
  level: number;                       // Badge level (1-5)
  earned_at: string;                   // ISO 8601 timestamp when earned
}
```

#### Recommendation
```typescript
interface Recommendation {
  type: "study" | "practice" | "review" | "group"; // Recommendation category
  priority: "high" | "medium" | "low"; // Importance level
  title: string;                       // Recommendation title
  description: string;                 // Detailed description
  action_url?: string;                 // Optional link to take action (e.g., "/practice?topic=123")
  icon?: string;                       // Optional icon identifier
}
```

## Example Response

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "test_type": "practice",
  "title": "NPPE Practice Test - Advanced Level",
  "status": "completed",
  
  "score": 92,
  "total_questions": 50,
  "correct_answers": 46,
  "incorrect_answers": 3,
  "unanswered": 1,
  
  "started_at": "2025-10-13T14:00:00Z",
  "completed_at": "2025-10-13T15:25:00Z",
  "time_spent_seconds": 5100,
  "average_time_per_question": 102,
  
  "passed": true,
  "passing_score": 70,
  
  "topic_breakdown": [
    {
      "topic_id": "topic-1",
      "topic_name": "Structural Engineering",
      "total_questions": 10,
      "correct_answers": 9,
      "incorrect_answers": 1,
      "percentage": 90,
      "average_time_seconds": 95
    },
    {
      "topic_id": "topic-2",
      "topic_name": "Geotechnical Engineering",
      "total_questions": 10,
      "correct_answers": 10,
      "incorrect_answers": 0,
      "percentage": 100,
      "average_time_seconds": 88
    },
    {
      "topic_id": "topic-3",
      "topic_name": "Environmental Engineering",
      "total_questions": 10,
      "correct_answers": 9,
      "incorrect_answers": 1,
      "percentage": 90,
      "average_time_seconds": 110
    },
    {
      "topic_id": "topic-4",
      "topic_name": "Transportation Engineering",
      "total_questions": 10,
      "correct_answers": 8,
      "incorrect_answers": 1,
      "percentage": 80,
      "average_time_seconds": 125
    },
    {
      "topic_id": "topic-5",
      "topic_name": "Water Resources",
      "total_questions": 10,
      "correct_answers": 10,
      "incorrect_answers": 0,
      "percentage": 100,
      "average_time_seconds": 92
    }
  ],
  
  "question_results": [
    {
      "question_id": "q-001",
      "question_number": 1,
      "topic_id": "topic-1",
      "topic_name": "Structural Engineering",
      "subtopic_id": "subtopic-101",
      "subtopic_name": "Beam Design",
      "difficulty": "medium",
      "question_text": "What is the maximum bending moment for a simply supported beam...",
      "question_type": "multiple_choice",
      "options": [
        {
          "id": "opt-1",
          "text": "wL²/8",
          "is_correct": true,
          "order": 1
        },
        {
          "id": "opt-2",
          "text": "wL²/12",
          "is_correct": false,
          "order": 2
        },
        {
          "id": "opt-3",
          "text": "wL²/6",
          "is_correct": false,
          "order": 3
        },
        {
          "id": "opt-4",
          "text": "wL²/4",
          "is_correct": false,
          "order": 4
        }
      ],
      "user_answer_id": "opt-1",
      "correct_answer_id": "opt-1",
      "is_correct": true,
      "time_spent_seconds": 95,
      "explanation": "For a uniformly loaded simply supported beam, the maximum bending moment occurs at the center and is calculated as wL²/8.",
      "reference": "Design of Steel Structures, Chapter 5",
      "is_bookmarked": false,
      "global_correct_rate": 78.5
    }
  ],
  
  "difficulty_breakdown": {
    "easy": {
      "total_questions": 15,
      "correct_answers": 15,
      "incorrect_answers": 0,
      "percentage": 100,
      "average_time_seconds": 65
    },
    "medium": {
      "total_questions": 25,
      "correct_answers": 23,
      "incorrect_answers": 2,
      "percentage": 92,
      "average_time_seconds": 105
    },
    "hard": {
      "total_questions": 10,
      "correct_answers": 8,
      "incorrect_answers": 1,
      "percentage": 80,
      "average_time_seconds": 155
    }
  },
  
  "achievements_unlocked": [
    {
      "id": "ach-001",
      "name": "Excellence Award",
      "description": "Scored 90% or higher on a practice test",
      "icon": "trophy",
      "rarity": "rare",
      "earned_at": "2025-10-13T15:25:00Z",
      "points": 100
    },
    {
      "id": "ach-002",
      "name": "Speed Master",
      "description": "Completed test under 90 minutes",
      "icon": "speed",
      "rarity": "common",
      "earned_at": "2025-10-13T15:25:00Z",
      "points": 50
    },
    {
      "id": "ach-003",
      "name": "Perfect Score - Geotechnical",
      "description": "Answered all geotechnical questions correctly",
      "icon": "star",
      "rarity": "epic",
      "earned_at": "2025-10-13T15:25:00Z",
      "points": 150
    }
  ],
  
  "badges_earned": [
    {
      "id": "badge-001",
      "name": "Consistent Learner",
      "description": "Maintained 80%+ score across 5 tests",
      "icon": "badge-star",
      "level": 3,
      "earned_at": "2025-10-13T15:25:00Z"
    }
  ],
  
  "weak_areas": [
    "Transportation Engineering - Traffic Flow Analysis",
    "Structural Engineering - Column Design"
  ],
  
  "study_recommendations": [
    {
      "type": "review",
      "priority": "high",
      "title": "Review Transportation Engineering concepts",
      "description": "Focus on traffic flow analysis and highway design principles",
      "action_url": "/practice?topic=transportation",
      "icon": "book-open"
    },
    {
      "type": "practice",
      "priority": "medium",
      "title": "Practice more column design problems",
      "description": "Strengthen your understanding of steel and concrete column design",
      "action_url": "/practice?subtopic=column-design",
      "icon": "edit"
    },
    {
      "type": "study",
      "priority": "medium",
      "title": "Take the full-length simulation exam",
      "description": "You're ready for a comprehensive assessment",
      "action_url": "/practice-test/new?type=full",
      "icon": "clipboard"
    },
    {
      "type": "group",
      "priority": "low",
      "title": "Join study group discussions",
      "description": "Connect with other learners and share insights",
      "action_url": "/study-groups",
      "icon": "users"
    }
  ],
  
  "improvement_metrics": {
    "score_change": 8,
    "previous_score": 84,
    "tests_taken": 12,
    "average_score": 86.5
  },
  
  "leaderboard_stats": {
    "rank": 23,
    "percentile": 85,
    "total_participants": 150
  }
}
```

## Field Mapping to UI Components

### Main Score Display Card
- `score` → Circular progress value and count-up number
- `correct_answers` / `total_questions` → Correct answers display
- `time_spent_seconds` → Time display (converted to hours/minutes)

### Stats Cards
- **Accuracy Card**: `(correct_answers / total_questions) * 100`
- **Avg Time Card**: `average_time_per_question` (converted to minutes)
- **Rank Card**: `passed` status → "Excellent" / "Very Good" / "Good" / "Fair"
- **Achievements Card**: `achievements_unlocked.length`

### Topic Performance Section
- `topic_breakdown[]` → Progress bars with:
  - `topic_name` → Label
  - `correct_answers` / `total_questions` → Fraction display
  - `percentage` → Progress bar width and color coding

### Achievements Section
- `achievements_unlocked[]` → Achievement cards with:
  - `icon` → Badge icon
  - `name` → Achievement title
  - Animated slide-in based on array index

### Next Steps Section
- `study_recommendations[]` → Recommendation cards with:
  - `icon` → Action icon
  - `title` and `description` → Card content
  - `action_url` → Navigation target

### Review Answers Button
- Links to `/test/{id}/review` using `question_results[]` data

## Notes for Backend Implementation

1. **Performance**: Calculate `topic_breakdown`, `difficulty_breakdown`, and performance metrics when test is submitted, not on every results fetch
2. **Caching**: Results should be cached as they don't change after test completion
3. **Privacy**: Ensure `leaderboard_stats` only includes anonymized rankings
4. **Optimization**: Consider pagination for `question_results` if tests can have 100+ questions
5. **Real-time**: Use WebSockets or polling for live leaderboard updates if needed
6. **Historical Data**: Store snapshots of performance for trend analysis
7. **Achievements**: Trigger achievement calculations asynchronously after test completion
8. **Security**: Verify user owns the test results before returning data
9. **Validation**: Ensure all percentages are 0-100, timestamps are valid ISO 8601
10. **Nullability**: Mark optional fields clearly, especially for features not yet implemented