# API Integration Guide - React Frontend ↔ Go Backend

## 📋 Overview

This guide demonstrates how to integrate the React frontend with the Go backend API.

## 🔧 Setup

### 1. Install Axios
```bash
npm install axios
```

### 2. Configure Environment
Create `front/.env`:
```env
VITE_API_BASE_URL=http://localhost:8080
```

## 🏗️ Architecture

### API Layer Structure
```
src/api/
├── client.ts              # Axios instance with interceptors
├── types.ts               # TypeScript interfaces
├── index.ts               # Central exports
└── services/
    ├── auth.service.ts    # Authentication
    ├── user.service.ts    # User management
    ├── question.service.ts # Questions
    ├── test.service.ts    # Practice tests
    ├── dashboard.service.ts # Analytics
    └── study.service.ts   # Study paths
```

## 🎯 Usage Examples

### Authentication

#### Login
```tsx
import { useAuth } from '../hooks/useAuth';

function LoginPage() {
  const { login, loading, error } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await login({
      email: 'user@example.com',
      password: 'SecurePass123!'
    });
    
    if (result) {
      // Login successful, redirect
      window.location.href = '/dashboard';
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {error && <div className="error">{error}</div>}
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

#### Register
```tsx
import { useAuth } from '../hooks/useAuth';

function RegisterPage() {
  const { register, loading, error } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await register({
      email: 'newuser@example.com',
      password: 'SecurePass123!',
      first_name: 'John',
      last_name: 'Doe',
      province: 'NL',
      exam_date: '2025-06-15'
    });
    
    if (result) {
      window.location.href = '/dashboard';
    }
  };

  return (
    <form onSubmit={handleRegister}>
      {/* Form implementation */}
    </form>
  );
}
```

### Dashboard Integration

#### Fetch Dashboard Data
```tsx
import { useDashboard } from '../hooks/useDashboard';

function Dashboard() {
  const { data, loading, error, refresh } = useDashboard();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  return (
    <div>
      <h1>Overall Progress: {data.overall_progress}%</h1>
      <p>Study Streak: {data.study_streak} days</p>
      <p>Questions Completed: {data.questions_completed}</p>
      <p>Pass Probability: {data.pass_probability}%</p>
      
      <button onClick={refresh}>Refresh Data</button>
    </div>
  );
}
```

#### Manual API Call
```tsx
import { dashboardService } from '../api';
import { useState, useEffect } from 'react';

function DashboardManual() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    dashboardService.getDashboard()
      .then(data => setDashboard(data))
      .catch(err => console.error(err));
  }, []);

  return <div>{/* Render dashboard */}</div>;
}
```

### Questions

#### Fetch Questions
```tsx
import { questionService } from '../api';
import { useState, useEffect } from 'react';
import type { Question } from '../api';

function QuestionList() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await questionService.getQuestions({
          topic_id: 'uuid-here',
          difficulty: 'medium',
          limit: 20,
          random: true
        });
        setQuestions(response.questions);
      } catch (error) {
        console.error('Failed to fetch questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  return (
    <div>
      {questions.map(q => (
        <div key={q.id}>
          <h3>{q.content}</h3>
          {q.options.map(opt => (
            <button key={opt.id}>{opt.content}</button>
          ))}
        </div>
      ))}
    </div>
  );
}
```

#### Submit Answer
```tsx
import { questionService } from '../api';

const handleSubmitAnswer = async (questionId: string, optionId: string) => {
  try {
    const result = await questionService.submitAnswer(questionId, {
      selected_option_id: optionId,
      time_spent_seconds: 45
    });

    if (result.is_correct) {
      console.log('Correct!');
    } else {
      console.log('Incorrect. Correct answer:', result.correct_option_id);
      console.log('Explanation:', result.explanation);
    }
  } catch (error) {
    console.error('Failed to submit answer:', error);
  }
};
```

### Practice Tests

#### Start Test
```tsx
import { testService } from '../api';
import { useState } from 'react';

function StartTest() {
  const [testId, setTestId] = useState<string | null>(null);

  const handleStartTest = async () => {
    try {
      const test = await testService.startTest({
        test_type: 'full_exam',
        question_count: 110,
        time_limit_minutes: 150
      });
      
      setTestId(test.test_id);
      // Navigate to test page
      window.location.href = `/practice-test/take/${test.test_id}`;
    } catch (error) {
      console.error('Failed to start test:', error);
    }
  };

  return <button onClick={handleStartTest}>Start Practice Test</button>;
}
```

#### Complete Test
```tsx
import { testService } from '../api';

const handleCompleteTest = async (testId: string) => {
  try {
    const result = await testService.completeTest(testId);
    
    console.log('Score:', result.score);
    console.log('Pass status:', result.pass_status);
    console.log('Performance by topic:', result.performance_by_topic);
    
    // Navigate to results page
    window.location.href = `/test/results/${testId}`;
  } catch (error) {
    console.error('Failed to complete test:', error);
  }
};
```

### User Profile

#### Get Profile
```tsx
import { userService } from '../api';
import { useState, useEffect } from 'react';
import type { UserProfile } from '../api';

function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    userService.getProfile()
      .then(data => setProfile(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>{profile?.first_name} {profile?.last_name}</h1>
      <p>Email: {profile?.email}</p>
      <p>Province: {profile?.province}</p>
    </div>
  );
}
```

#### Update Profile
```tsx
import { userService } from '../api';

const handleUpdateProfile = async () => {
  try {
    await userService.updateProfile({
      first_name: 'Jane',
      exam_date: '2025-07-01'
    });
    alert('Profile updated!');
  } catch (error) {
    console.error('Update failed:', error);
  }
};
```

### Study Path

#### Get Study Path
```tsx
import { studyService } from '../api';
import { useState, useEffect } from 'react';
import type { StudyPath } from '../api';

function StudyPathPage() {
  const [studyPath, setStudyPath] = useState<StudyPath | null>(null);

  useEffect(() => {
    studyService.getStudyPath()
      .then(data => setStudyPath(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>Week {studyPath?.current_week}</h1>
      <p>Progress: {studyPath?.progress_percentage}%</p>
      
      {studyPath?.modules.map(module => (
        <div key={module.id}>
          <h3>{module.title}</h3>
          <p>Status: {module.status}</p>
          <p>Progress: {module.progress}%</p>
        </div>
      ))}
    </div>
  );
}
```

## 🔐 Authentication Flow

### Token Management

The API client automatically handles:
1. **Adding tokens to requests** - Authorization header added automatically
2. **Token refresh** - Automatic refresh on 401 errors
3. **Logout on failure** - Redirects to login if refresh fails

### Protected Routes

```tsx
import { useAuthContext } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <>{children}</>;
}
```

### Using AuthContext

Wrap your app with AuthProvider:

```tsx
// App.tsx
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
```

Then use in components:

```tsx
import { useAuthContext } from '../contexts/AuthContext';

function Header() {
  const { user, logout, isAuthenticated } = useAuthContext();

  return (
    <header>
      {isAuthenticated ? (
        <>
          <span>Welcome, {user?.first_name}!</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <a href="/login">Login</a>
      )}
    </header>
  );
}
```

## 🎨 Real-World Integration Example

### Complete Dashboard Component

```tsx
import { useDashboard } from '../hooks/useDashboard';
import { useAuthContext } from '../contexts/AuthContext';
import CircularProgress from '../components/base/CircularProgress';
import Card from '../components/base/Card';

export default function Dashboard() {
  const { user } = useAuthContext();
  const { data, loading, error } = useDashboard();

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  return (
    <div className="dashboard">
      <h1>Welcome back, {user?.first_name}! 👋</h1>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CircularProgress value={data.overall_progress} />
          <h3>Overall Progress</h3>
        </Card>
        
        <Card>
          <h2>{data.study_streak} Days</h2>
          <p>Study Streak</p>
          <small>Longest: {data.longest_streak} days</small>
        </Card>
        
        <Card>
          <h2>{data.questions_completed}/500</h2>
          <p>Questions Done</p>
        </Card>
        
        <Card>
          <h2>{data.pass_probability}%</h2>
          <p>Pass Ready</p>
        </Card>
      </div>

      {/* Topic Performance */}
      <Card>
        <h2>Performance by Topic</h2>
        {data.topic_mastery.map(topic => (
          <div key={topic.id}>
            <span>{topic.topic?.name}</span>
            <progress value={topic.mastery_percentage} max={100} />
            <span>{topic.mastery_percentage}%</span>
          </div>
        ))}
      </Card>

      {/* Weak Topics */}
      <Card>
        <h2>Weakness Spotlight</h2>
        {data.weak_topics.map(topic => (
          <div key={topic.name}>
            <h3>{topic.name}</h3>
            <p>Score: {topic.score}%</p>
          </div>
        ))}
      </Card>

      {/* Recent Activity */}
      <Card>
        <h2>Recent Activity</h2>
        {data.recent_activity.map((activity, idx) => (
          <div key={idx}>
            <p>{activity.description}</p>
            <small>{new Date(activity.timestamp).toLocaleString()}</small>
          </div>
        ))}
      </Card>
    </div>
  );
}
```

## 🔄 Error Handling

### Using Try-Catch
```tsx
import { questionService, handleApiError } from '../api';

async function fetchQuestions() {
  try {
    const response = await questionService.getQuestions();
    console.log(response.questions);
  } catch (error) {
    const errorMessage = handleApiError(error);
    alert(errorMessage);
  }
}
```

### With State Management
```tsx
const [error, setError] = useState<string | null>(null);

const fetchData = async () => {
  setError(null);
  try {
    const data = await questionService.getQuestions();
    // Handle data
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
  }
};
```

## 🚀 Advanced Patterns

### Custom Hook for Questions
```tsx
import { useState, useEffect } from 'react';
import { questionService } from '../api';
import type { Question, GetQuestionsParams } from '../api';

export const useQuestions = (params?: GetQuestionsParams) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await questionService.getQuestions(params);
      setQuestions(response.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return { questions, loading, error, refresh: fetchQuestions };
};
```

### Usage
```tsx
function QuestionBank() {
  const { questions, loading, refresh } = useQuestions({
    difficulty: 'medium',
    limit: 20,
    random: true
  });

  return (
    <div>
      {questions.map(q => <QuestionCard key={q.id} question={q} />)}
      <button onClick={refresh}>Load More</button>
    </div>
  );
}
```

## 🎮 Practice Test Flow

### Complete Test Flow
```tsx
import { useState } from 'react';
import { testService } from '../api';
import type { Question } from '../api';

function PracticeTest() {
  const [testId, setTestId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Start test
  const startTest = async () => {
    const test = await testService.startTest({
      test_type: 'full_exam',
      question_count: 110,
      time_limit_minutes: 150
    });
    
    setTestId(test.test_id);
    setQuestions(test.questions);
  };

  // Submit answer
  const submitAnswer = async (optionId: string) => {
    if (!testId) return;
    
    await testService.submitTestAnswer(
      testId,
      currentIndex + 1,
      {
        selected_option_id: optionId,
        time_spent_seconds: 60
      }
    );
    
    setCurrentIndex(prev => prev + 1);
  };

  // Complete test
  const completeTest = async () => {
    if (!testId) return;
    
    const result = await testService.completeTest(testId);
    console.log('Test completed! Score:', result.score);
    // Navigate to results
  };

  return (
    <div>
      {!testId ? (
        <button onClick={startTest}>Start Test</button>
      ) : (
        <>
          <h2>Question {currentIndex + 1} of {questions.length}</h2>
          <div>{questions[currentIndex]?.content}</div>
          {questions[currentIndex]?.options.map(opt => (
            <button key={opt.id} onClick={() => submitAnswer(opt.id)}>
              {opt.content}
            </button>
          ))}
          {currentIndex === questions.length - 1 && (
            <button onClick={completeTest}>Complete Test</button>
          )}
        </>
      )}
    </div>
  );
}
```

## 📊 API Services Reference

### Auth Service
```tsx
import { authService } from '../api';

// Login
await authService.login({ email, password });

// Register
await authService.register({ email, password, first_name, last_name, province });

// Logout
authService.logout();

// Forgot password
await authService.forgotPassword({ email });

// Reset password
await authService.resetPassword({ token, password });

// Check authentication
const isAuth = authService.isAuthenticated();
const user = authService.getCurrentUser();
```

### User Service
```tsx
import { userService } from '../api';

// Get profile
const profile = await userService.getProfile();

// Update profile
await userService.updateProfile({ first_name: 'Jane' });

// Upload avatar
await userService.uploadAvatar(file);

// Get bookmarks
const bookmarks = await userService.getBookmarks();

// Manage subscription
await userService.createSubscription({ plan: 'monthly', payment_method_id: 'pm_xxx' });
await userService.cancelSubscription();
```

### Question Service
```tsx
import { questionService } from '../api';

// Get questions
const { questions, pagination } = await questionService.getQuestions({
  topic_id: 'uuid',
  difficulty: 'medium',
  page: 1,
  limit: 20
});

// Get topics
const topics = await questionService.getTopics();

// Bookmark question
await questionService.bookmarkQuestion(questionId);
```

### Dashboard Service
```tsx
import { dashboardService } from '../api';

// Get dashboard
const dashboard = await dashboardService.getDashboard();

// Get analytics
const analytics = await dashboardService.getAnalytics('30d');

// Get weaknesses
const weaknesses = await dashboardService.getWeaknesses();
```

## 🛡️ Type Safety

All API calls are fully typed with TypeScript:

```tsx
import type { 
  Question, 
  DashboardData, 
  PracticeTest,
  AuthResponse 
} from '../api';

// TypeScript will enforce types
const questions: Question[] = await questionService.getQuestions();
const dashboard: DashboardData = await dashboardService.getDashboard();
```

## 🔄 Auto Token Refresh

The API client automatically handles token refresh:

1. User makes authenticated request
2. If token expired (401), client automatically:
   - Calls `/auth/refresh` with refresh token
   - Updates stored tokens
   - Retries original request
3. If refresh fails, redirects to login

No manual token management needed!

## 📝 Best Practices

1. **Use custom hooks** for repeated patterns (useAuth, useDashboard)
2. **Handle errors gracefully** with try-catch and user feedback
3. **Show loading states** while fetching data
4. **Use TypeScript types** for type safety
5. **Implement optimistic updates** where appropriate
6. **Cache data** when possible to reduce API calls
7. **Use AbortController** for cancelable requests

## 🎯 Quick Reference

| Service | Purpose | Key Methods |
|---------|---------|-------------|
| authService | Authentication | login, register, logout, forgotPassword |
| userService | User management | getProfile, updateProfile, uploadAvatar |
| questionService | Questions | getQuestions, submitAnswer, bookmarkQuestion |
| testService | Practice tests | startTest, submitTestAnswer, completeTest |
| dashboardService | Analytics | getDashboard, getAnalytics, getWeaknesses |
| studyService | Study paths | getStudyPath, updateModuleProgress |

---

**Ready to integrate!** All services are imported from `../api` and ready to use in your components.