
# Production Readiness Implementation Guide

## ✅ COMPLETED INFRASTRUCTURE

### 1. Core Files Created

#### Session Management
- **`front/src/app/bootstrap.ts`** - Session restore utility
- **`front/src/router/guards.tsx`** - Auth & Admin route guards
- **`front/src/router/RootRedirect.tsx`** - Already exists, canonical redirect implemented

#### Error Handling & Logging  
- **`front/src/components/toast/ToastContext.tsx`** - Toast notification system
- **`front/src/logging/clientLog.ts`** - Client-side logging utilities

#### Configuration
- **`front/.env.production`** - Production environment variables

---

## 🔧 INTEGRATION STEPS

### Step 1: Wire Route Guards

Update `front/src/router/config.tsx`:

```tsx
import { RequireAuth, RequireAdmin } from './guards';

const router = createBrowserRouter([
  { path: "/", element: <RootRedirect /> },
  
  // Public routes
  { path: "/landing", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  
  // Protected routes
  { 
    element: <RequireAuth />, 
    children: [
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/practice", element: <PracticePage /> },
      { path: "/practice-tests", element: <PracticeTestsPage /> },
      { path: "/bookmarks", element: <BookmarksPage /> },
      { path: "/topics", element: <TopicsPage /> },
      // ... all other authenticated routes
    ]
  },
  
  // Admin routes
  { 
    element: <RequireAdmin />, 
    children: [
      { path: "/admin", element: <AdminPage /> },
      { path: "/admin/subscriptions", element: <AdminSubscriptionsPage /> },
      { path: "/admin/users", element: <AdminUsersPage /> },
      { path: "/admin/questions", element: <AdminQuestionsPage /> },
    ]
  },
]);
```

### Step 2: Add Toast Provider

Update `front/src/main.tsx`:

```tsx
import { ToastProvider } from './components/toast/ToastContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  </React.StrictMode>
);
```

### Step 3: Optional - Session Restore on Boot

Update `front/src/main.tsx` to call bootstrap:

```tsx
import { restoreSession } from './app/bootstrap';

// Before rendering
restoreSession().then(({ authed, me }) => {
  if (authed && me) {
    localStorage.setItem('user', JSON.stringify(me));
  }
  
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </React.StrictMode>
  );
});
```

### Step 4: Use Toast in Components

Replace basic error handling with toast notifications:

```tsx
import { useToast } from '@/components/toast/ToastContext';

function MyComponent() {
  const toast = useToast();
  
  try {
    await someApiCall();
    toast.push('Success!', 'success');
  } catch (err) {
    toast.push(err instanceof Error ? err.message : 'An error occurred', 'error');
  }
}
```

### Step 5: Add Logging to API Client

Update `front/src/api/client.ts` response interceptor:

```tsx
import { logApiError } from '../logging/clientLog';

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const endpoint = error.config?.url || 'unknown';
    logApiError(error, endpoint);
    
    // existing error handling...
    return Promise.reject(error);
  }
);
```

---

## 📋 REMAINING TASKS

### High Priority

#### 1. Admin Subscriptions API Integration

**Backend** - Add to `back/internal/handlers/`:
```go
// subscription_handler.go
func (h *Handler) GetSubscriptions(c *gin.Context) {
    // GET /api/v1/admin/subscriptions
    // Query params: status, page, limit
}

func (h *Handler) GetSubscription(c *gin.Context) {
    // GET /api/v1/admin/subscriptions/:id
}

func (h *Handler) CancelSubscription(c *gin.Context) {
    // POST /api/v1/admin/subscriptions/:id/cancel
}
```

**Frontend** - Update `front/src/api/services/admin.service.ts`:
```tsx
async getSubscriptions(params?: { 
  status?: string; 
  page?: number; 
  limit?: number;
}) {
  const response = await apiClient.get('/admin/subscriptions', { params });
  return response.data;
}

async cancelSubscription(id: string) {
  const response = await apiClient.post(`/admin/subscriptions/${id}/cancel`);
  return response.data;
}
```

**Frontend** - Wire `front/src/pages/admin/subscriptions/page.tsx`:
```tsx
import { adminService } from '../../../api';

const [subscriptions, setSubscriptions] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const load = async () => {
    try {
      const data = await adminService.getSubscriptions({ 
        status: filterStatus, 
        page, 
        limit 
      });
      setSubscriptions(data);
    } catch (err) {
      toast.push(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };
  load();
}, [filterStatus, page, limit]);
```

#### 2. Code Splitting for Large Pages

Update `front/src/router/config.tsx`:
```tsx
import { lazy, Suspense } from 'react';
import LoadingSpinner from '../components/effects/LoadingSpinner';

const DashboardPage = lazy(() => import('../pages/dashboard/page'));
const TestReviewPage = lazy(() => import('../pages/test/review/page'));
const TestTakePage = lazy(() => import('../pages/practice-test/take/page'));
const AnalyticsPage = lazy(() => import('../pages/analytics/page'));

// Wrap in Suspense
const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<div className="flex items-center justify-center h-screen"><LoadingSpinner size="lg" /></div>}>
    <Component />
  </Suspense>
);

// In routes
{ path: "/dashboard", element: withSuspense(DashboardPage) },
{ path: "/test/:testId/review", element: withSuspense(TestReviewPage) },
```

#### 3. Question List Caching & Pagination

Create `front/src/hooks/useQuestionCache.ts`:
```tsx
import { useState, useCallback } from 'react';
import { questionService } from '../api';

const cache = new Map<string, any>();

export function useQuestionCache() {
  const [loading, setLoading] = useState(false);
  
  const fetchQuestions = useCallback(async (params: any) => {
    const key = JSON.stringify(params);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    setLoading(true);
    try {
      const data = await questionService.getQuestions(params);
      cache.set(key, data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { fetchQuestions, loading };
}
```

Update `front/src/pages/practice/page.tsx`:
```tsx
import { useSearchParams } from 'react-router-dom';
import { useQuestionCache } from '../../hooks/useQuestionCache';

const [searchParams, setSearchParams] = useSearchParams();
const page = parseInt(searchParams.get('page') || '1');
const { fetchQuestions, loading } = useQuestionCache();

useEffect(() => {
  fetchQuestions({ 
    page, 
    limit: 20, 
    topic_id: selectedTopic,
    difficulty: selectedDifficulty 
  });
}, [page, selectedTopic, selectedDifficulty]);

// Add pagination UI
<div className="flex justify-center space-x-2 mt-6">
  <Button 
    onClick={() => setSearchParams({ page: String(page - 1) })}
    disabled={page === 1}
  >
    Previous
  </Button>
  <span className="px-4 py-2">Page {page}</span>
  <Button 
    onClick={() => setSearchParams({ page: String(page + 1) })}
  >
    Next
  </Button>
</div>
```

### Medium Priority

#### 4. Hide Admin Routes from Non-Admins

Update `front/src/components/feature/Header.tsx`:
```tsx
const userStr = localStorage.getItem('user');
const user = userStr ? JSON.parse(userStr) : null;
const isAdmin = user?.is_admin;

// In navigation
{isAdmin && (
  <Link to="/admin" className="...">
    Admin
  </Link>
)}
```

#### 5. Route Change Logging

Add to router setup in `front/src/main.tsx`:
```tsx
import { logEvent } from './logging/clientLog';

router.subscribe((state) => {
  if (state.location) {
    logEvent('route_change', { 
      path: state.location.pathname,
      search: state.location.search 
    });
  }
});
```

### Low Priority

#### 6. E2E Test Scenarios (Playwright/Cypress)

Create `front/e2e/critical-flows.spec.ts`:
```typescript
test('complete practice test flow', async ({ page }) => {
  // Login
  await page.goto('/login