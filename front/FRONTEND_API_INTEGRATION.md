# Frontend-Backend API Integration - Complete Setup

## ✅ Integration Complete

### API Layer Implementation

```
front/src/api/
├── client.ts                    # Axios client with auto token refresh
├── types.ts                     # TypeScript interfaces (30+ types)
├── index.ts                     # Central export point
└── services/
    ├── auth.service.ts          # Login, register, password reset
    ├── user.service.ts          # Profile, subscriptions, notifications
    ├── question.service.ts      # Questions, topics, bookmarks
    ├── test.service.ts          # Practice tests
    ├── dashboard.service.ts     # Analytics, weaknesses
    └── study.service.ts         # Study paths, modules
```

### React Hooks & Context

```
front/src/
├── hooks/
│   ├── useAuth.ts              # Authentication hook
│   └── useDashboard.ts         # Dashboard data hook
└── contexts/
    └── AuthContext.tsx          # Global auth state
```

### Documentation

```
front/src/api/
└── API_INTEGRATION_GUIDE.md    # Complete usage examples
```

---

## 🚀 Quick Start Commands

### 1. Install Dependencies (First Time)
```powershell
cd "C:\Users\meysa\Desktop\Document\PEng\Pen-Code\NPPE Mock exam\source\front"
npm install
```

This will install:
- ✅ axios (already in package.json)
- ✅ i18next-browser-languagedetector (already in package.json)
- ✅ All other dependencies

### 2. Start Frontend
```powershell
npm run dev
```

Frontend will run at: **http://localhost:3000/**

### 3. Start Backend (Separate Terminal)
```powershell
cd "C:\Users\meysa\Desktop\Document\PEng\Pen-Code\NPPE Mock exam\source\back"
docker-compose up -d
```

Backend will run at: **http://localhost:8080/**

---

## 📦 What's Configured

### Environment Variables
- ✅ `front/.env` created with `VITE_API_BASE_URL=http://localhost:8080`
- ✅ Backend CORS configured for `http://localhost:3000`

### Package.json
- ✅ Added `axios: ^1.7.2` dependency
- ✅ i18next packages already included

### API Client Features
- ✅ Automatic JWT token attachment to requests
- ✅ Automatic token refresh on 401 errors
- ✅ Auto-redirect to login if refresh fails
- ✅ Error handling utilities
- ✅ 30-second timeout

---

## 🎯 Integration Examples

### Example 1: Login Form

```tsx
import { useAuth } from '../hooks/useAuth';

function LoginPage() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login({ email, password });
    
    if (result) {
      window.location.href = '/dashboard';
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      
      <input 
        type="password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Example 2: Dashboard with Real Data

```tsx
import { useDashboard } from '../hooks/useDashboard';
import CircularProgress from '../components/base/CircularProgress';
import Card from '../components/base/Card';

export default function Dashboard() {
  const { data, loading, error } = useDashboard();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  return (
    <div className="dashboard">
      <h1>Welcome back! 👋</h1>
      
      {/* Real statistics from backend */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CircularProgress value={data.overall_progress} />
          <h3>Overall Progress</h3>
        </Card>
        
        <Card>
          <h2>{data.study_streak} Days</h2>
          <p>Study Streak</p>
        </Card>
        
        <Card>
          <h2>{data.questions_completed}</h2>
          <p>Questions Completed</p>
        </Card>
        
        <Card>
          <h2>{data.pass_probability}%</h2>
          <p>Pass Probability</p>
        </Card>
      </div>

      {/* Topic performance */}
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
    </div>
  );
}
```

### Example 3: Question Practice

```tsx
import { questionService } from '../api';
import { useState, useEffect } from 'react';
import type { Question } from '../api';

function PracticePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    questionService.getQuestions({
      difficulty: 'medium',
      limit: 20,
      random: true
    })
    .then(response => setQuestions(response.questions))
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  }, []);

  const handleAnswerSubmit = async (optionId: string) => {
    const question = questions[currentIndex];
    
    try {
      const result = await questionService.submitAnswer(question.id, {
        selected_option_id: optionId,
        time_spent_seconds: 60
      });

      if (result.is_correct) {
        alert('Correct! ✅');
      } else {
        alert(`Incorrect. ${result.explanation}`);
      }

      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  if (loading) return <div>Loading questions...</div>;
  if (questions.length === 0) return <div>No questions available</div>;

  const currentQuestion = questions[currentIndex];

  return (
    <div>
      <h2>Question {currentIndex + 1} of {questions.length}</h2>
      <p>{currentQuestion.content}</p>
      
      {currentQuestion.options.map(option => (
        <button
          key={option.id}
          onClick={() => handleAnswerSubmit(option.id)}
        >
          {option.content}
        </button>
      ))}
    </div>
  );
}
```

---

## 🔐 Authentication Flow

### 1. User Registration
```tsx
const { register } = useAuth();

const result = await register({
  email: 'user@example.com',
  password: 'SecurePass123!',
  first_name: 'John',
  last_name: 'Doe',
  province: 'NL'
});

// Tokens automatically stored in localStorage
// User redirected to dashboard
```

### 2. User Login
```tsx
const { login } = useAuth();

const result = await login({
  email: 'user@example.com',
  password: 'SecurePass123!'
});

// JWT tokens stored
// User data cached
```

### 3. Protected API Calls
```tsx
// Token automatically added to all requests
const dashboard = await dashboardService.getDashboard();
const profile = await userService.getProfile();
```

### 4. Auto Token Refresh
```tsx
// If token expires during request:
// 1. Client catches 401 error
// 2. Automatically calls /auth/refresh
// 3. Updates tokens in localStorage
// 4. Retries original request
// 5. Returns data seamlessly

// No manual intervention needed!
```

---

## 📡 Available API Services

### AuthService
```tsx
import { authService } from '../api';

// Methods
authService.login({ email, password })
authService.register({ email, password, first_name, last_name, province })
authService.logout()
authService.forgotPassword({ email })
authService.resetPassword({ token, password })
authService.verifyEmail(token)
authService.isAuthenticated()
authService.getCurrentUser()
```

### UserService
```tsx
import { userService } from '../api';

userService.getProfile()
userService.updateProfile({ first_name, last_name })
userService.uploadAvatar(file)
userService.deleteAccount()
userService.getBookmarks()
userService.getNotifications()
userService.markNotificationRead(notificationId)
userService.createSubscription({ plan, payment_method_id })
userService.cancelSubscription()
```

### QuestionService
```tsx
import { questionService } from '../api';

questionService.getQuestions({ topic_id, difficulty, limit })
questionService.getQuestion(questionId)
questionService.submitAnswer(questionId, { selected_option_id, time_spent_seconds })
questionService.bookmarkQuestion(questionId)
questionService.removeBookmark(questionId)
questionService.getTopics()
```

### TestService
```tsx
import { testService } from '../api';

testService.startTest({ test_type, question_count, time_limit_minutes })
testService.getTest(testId)
testService.submitTestAnswer(testId, position, { selected_option_id, time_spent_seconds })
testService.completeTest(testId)
testService.reviewTest(testId)
testService.getTestHistory()
```

### DashboardService
```tsx
import { dashboardService } from '../api';

dashboardService.getDashboard()
dashboardService.getAnalytics('30d') // '7d', '30d', '90d', 'all'
dashboardService.getWeaknesses()
```

### StudyService
```tsx
import { studyService } from '../api';

studyService.getStudyPath()
studyService.updateModuleProgress(moduleId, { progress, time_spent_seconds })
studyService.completeModule(moduleId)
```

---

## 🎨 Integration with Existing Components

### Update App.tsx
```tsx
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppRoutes } from './router';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={__BASE_PATH__}>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

### Protected Route Component
```tsx
import { useAuthContext } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

### Update Router Config
```tsx
import { ProtectedRoute } from '../components/ProtectedRoute';
import Dashboard from '../pages/dashboard/page';
import Login from '../pages/login/page';

const routes: RouteObject[] = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
];
```

---

## 🧪 Testing the Integration

### 1. Start Backend
```powershell
cd back
docker-compose up -d
```

### 2. Test Backend Health
```powershell
curl http://localhost:8080/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "NPPE API"
}
```

### 3. Start Frontend
```powershell
cd front
npm install  # First time only
npm run dev
```

### 4. Test Registration
Open browser console on http://localhost:3000 and run:

```javascript
// Import the service
import { authService } from './api';

// Register
const result = await authService.register({
  email: 'test@example.com',
  password: 'SecurePass123!',
  first_name: 'John',
  last_name: 'Doe',
  province: 'NL'
});

console.log(result);
```

### 5. Test Dashboard
Navigate to `/dashboard` and the page should:
- Fetch data from backend API
- Display real statistics
- Show loading state
- Handle errors gracefully

---

## 🔧 Troubleshooting

### CORS Issues
If you see CORS errors, verify:
1. Backend `.env` has: `ALLOWED_ORIGINS=http://localhost:3000`
2. Backend is running
3. Frontend is accessing correct URL

### Token Issues
If authentication fails:
1. Check tokens in localStorage: `localStorage.getItem('access_token')`
2. Verify JWT secret matches in backend `.env`
3. Clear tokens: `localStorage.clear()`

### Network Errors
If API calls fail:
1. Verify backend is running: `curl http://localhost:8080/health`
2. Check frontend `.env`: `VITE_API_BASE_URL=http://localhost:8080`
3. Verify no firewall blocking ports 8080 or 3000

---

## 📊 Integration Status

### ✅ Completed
- Axios client with interceptors
- All API services (6 services)
- TypeScript types (30+ interfaces)
- React hooks (useAuth, useDashboard)
- Auth context provider
- Environment configuration
- Comprehensive documentation
- Error handling
- Auto token refresh
- Request/response typing

### 🎯 Ready to Use
- Login/Register flows
- Dashboard data fetching
- Question practice
- Practice tests
- User profile management
- Subscription handling
- Analytics viewing

---

## 🎓 Key Features

1. **Automatic Token Management**
   - Tokens stored in localStorage
   - Auto-attached to requests
   - Auto-refresh on expiration

2. **Type Safety**
   - Full TypeScript support
   - Type-safe API calls
   - Intellisense in IDE

3. **Error Handling**
   - Centralized error handling
   - User-friendly messages
   - Automatic retry logic

4. **State Management**
   - AuthContext for global auth state
   - Custom hooks for data fetching
   - Loading and error states

5. **Developer Experience**
   - Simple import: `import { authService } from '../api'`
   - Clean async/await syntax
   - Comprehensive examples in guide

---

## 📝 Next Steps

To fully connect the frontend:

1. **Update existing pages** to use API services instead of mock data
2. **Add ProtectedRoute** wrapper to authenticated pages
3. **Implement AuthContext** in App.tsx
4. **Create login/register pages** using useAuth hook
5. **Update dashboard** to use useDashboard hook
6. **Add error boundaries** for better error handling

---

## 🔗 Resources

- API Integration Guide: `front/src/api/API_INTEGRATION_GUIDE.md`
- Backend API Docs: `back/README.md`
- Backend Spec: `project-docs/NPPE_GO_BACKEND_SPECIFICATION.md`

---

**Status**: Frontend-Backend Integration Layer Complete ✅
**Ready for**: Component integration and feature development
**Next**: Replace mock data in components with real API calls