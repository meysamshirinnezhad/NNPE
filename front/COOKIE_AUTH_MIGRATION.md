# Cookie-Based Authentication Migration

## Overview
This document describes the migration from token-based authentication (JWT in localStorage) to cookie-based authentication for the NPPE Mock Exam frontend application.

## Changes Made

### 1. API Client (`front/src/api/client.ts`)

#### Before
- Stored JWT tokens in localStorage (`access_token`, `refresh_token`)
- Added `Authorization: Bearer <token>` header to every request
- Implemented complex token refresh logic in response interceptor
- Manually handled 401 errors with token refresh attempts

#### After
- Removed all localStorage token management
- Relies on HTTP-only cookies set by the backend
- Simplified to use `withCredentials: true` for automatic cookie handling
- Clean 401 error handling that redirects to login
- No manual token refresh logic needed (backend handles this)

**Key Changes:**
```typescript
// Removed token storage and Authorization header logic
// Now cookies are automatically handled by the browser
withCredentials: true, // Enables cookie-based auth
```

### 2. Auth Service (`front/src/api/services/auth.service.ts`)

#### Before
- Stored tokens and user data in localStorage on login/register
- Required manual token management
- `isAuthenticated()` checked for access_token in localStorage
- `getAccessToken()` method to retrieve stored token

#### After
- Only caches user data in localStorage for quick access (optional)
- Session validation handled by cookie on backend
- `validateSession()` method fetches fresh user data from backend
- Removed `getAccessToken()` - not needed with cookies
- `isAuthenticated()` checks for cached user (soft check)
- `logout()` calls backend endpoint to clear session cookie

**Key Changes:**
```typescript
// Login/Register - no token storage
if (response.data.user) {
  localStorage.setItem('user', JSON.stringify(response.data.user));
}

// Logout - clears server-side session
await apiClient.post('/auth/logout');
localStorage.removeItem('user');
window.location.href = '/login';

// Session validation
async validateSession(): Promise<User> {
  const response = await apiClient.get<User>('/auth/me');
  localStorage.setItem('user', JSON.stringify(response.data));
  return response.data;
}
```

### 3. Auth Context (`front/src/contexts/AuthContext.tsx`)

#### Before
- Validated session with fallback to localStorage tokens
- Complex logic checking both backend and local storage
- Manually cleared multiple localStorage items

#### After
- Simple session validation using backend `/auth/me` endpoint
- No fallback to localStorage tokens
- Trusts backend cookie validation
- Cleaner error handling
- Only caches user data for performance

**Key Changes:**
```typescript
useEffect(() => {
  const validateSession = async () => {
    try {
      const userData = await authService.validateSession();
      setUser(userData);
    } catch (error) {
      setUser(null);
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };
  validateSession();
}, []);
```

### 4. useAuth Hook (`front/src/hooks/useAuth.ts`)

#### Before
- Exposed `isAuthenticated` and `currentUser` from localStorage
- Manual redirect to login after logout

#### After
- Removed `isAuthenticated` and `currentUser` exports (use AuthContext instead)
- Logout now handled entirely by auth service (including redirect)
- Simpler, cleaner API

**Key Changes:**
```typescript
const logout = async () => {
  // authService.logout() handles redirect to login page
  await authService.logout();
};
```

### 5. Login Page (`front/src/pages/login/page.tsx`)

#### Before
- Only called login from useAuth hook
- Did not update AuthContext state

#### After
- Imports and uses AuthContext
- Updates AuthContext with user data after successful login
- Ensures user state is synchronized

**Key Changes:**
```typescript
import { useAuthContext } from '../../contexts/AuthContext';

const { setUser } = useAuthContext();

const result = await login({ email, password });
if (result) {
  setUser(result.user); // Update context
  window.location.href = '/dashboard';
}
```

### 6. Signup Page (`front/src/pages/signup/page.tsx`)

#### Before
- Only called register from useAuth hook
- Did not update AuthContext state

#### After
- Imports and uses AuthContext
- Updates AuthContext with user data after successful registration
- Ensures user state is synchronized

**Key Changes:**
```typescript
import { useAuthContext } from '../../contexts/AuthContext';

const { setUser } = useAuthContext();

const result = await register(registerData);
if (result) {
  setUser(result.user); // Update context
  window.location.href = '/onboarding';
}
```

## Migration Benefits

### Security Improvements
1. **HTTP-only cookies** - Cannot be accessed by JavaScript, preventing XSS attacks
2. **No token exposure** - Tokens not stored in localStorage where they're vulnerable
3. **Automatic CSRF protection** - When combined with SameSite cookie attributes
4. **Backend-controlled sessions** - Server has full control over session lifecycle

### Code Simplification
1. **Removed ~30 lines** of token management code
2. **Eliminated complex refresh logic** - Backend handles this transparently
3. **Cleaner error handling** - Single 401 handler redirects to login
4. **Less client-side state** - Only cache user data, not tokens

### User Experience
1. **Seamless authentication** - Browser handles cookies automatically
2. **Better security** - Users protected from common web vulnerabilities
3. **Consistent sessions** - Same session across tabs

## Backend Changes Required

### Updated Auth Middleware (`back/pkg/middleware/auth.go`)

The backend auth middleware has been updated to support cookie-based authentication:

**Before:**
- Only checked Authorization header for JWT tokens
- Didn't read cookies at all

**After:**
- **First checks for `access_token` cookie** (preferred for web clients)
- Falls back to Authorization header if no cookie found (for API clients)
- Supports both authentication methods

**Key Changes:**
```go
// First, try to get token from cookie (preferred for web clients)
token, err := c.Cookie("access_token")
if err != nil || token == "" {
  // If no cookie, try Authorization header (for API clients)
  authHeader := c.GetHeader("Authorization")
  // ... extract token from header
}

// Validate token (works for both methods)
claims, err := jwtService.ValidateToken(token)
```

### Backend Requirements Checklist

For this migration to work properly, ensure the backend:

1. ✅ **Sets HTTP-only cookies** on login/register (already implemented in auth_handler.go)
2. ✅ **Reads cookies for authentication** (now implemented in auth middleware)
3. ✅ **Clears cookies** on logout endpoint (already implemented)
4. ✅ **Supports CORS** with credentials (already configured)
5. ✅ **Implements `/auth/me`** endpoint (already implemented as GetCurrentUser)

## Expected Behavior

### On Initial Page Load (No Active Session)
- The app attempts to validate the session via `/auth/me`
- If no valid cookie exists, the request fails (401 or 404)
- This is **expected behavior** and not an error
- The user remains on the current page (no redirect for initial check)
- `isAuthenticated` will be `false` and `user` will be `null`

### On Protected Routes (No Active Session)
- When trying to access protected routes without authentication
- The 401 error from the API triggers a redirect to `/login`
- This happens in the axios interceptor

### After Successful Login
- Backend sets HTTP-only cookies automatically
- User data is cached in localStorage for quick access
- `isAuthenticated` becomes `true` and `user` is populated
- Session is validated on every page refresh

## Testing Checklist

- [ ] Login successfully sets cookie and redirects
- [ ] Protected routes accessible after login
- [ ] Session persists across page refreshes
- [ ] 401 errors on protected routes redirect to login page
- [ ] Initial page load without session doesn't cause redirect
- [ ] Logout clears session and redirects
- [ ] Multiple tabs share same session
- [ ] Session expires appropriately
- [ ] CORS works with credentials

## Environment Variables

Ensure your `.env` file has the correct API URL:
```
VITE_API_BASE_URL=http://localhost:8080
```

For production, use HTTPS:
```
VITE_API_BASE_URL=https://api.yourapp.com
```

## Rollback Plan

If issues arise, the previous token-based implementation can be restored by:
1. Reverting changes to `client.ts`, `auth.service.ts`, `AuthContext.tsx`, and `useAuth.ts`
2. Backend must support token-based auth again
3. Re-enable token storage in localStorage

## Notes

- User data is still cached in localStorage for performance (optional)
- This cache is cleared on logout or session validation failure
- The cache does NOT represent authentication state - only the backend cookie does
- Always use `validateSession()` for authoritative auth state

## Next Steps

1. Test all authentication flows thoroughly
2. Update any components using old `isAuthenticated` from useAuth hook
3. Verify CORS configuration on backend
4. Test in production environment
5. Monitor for any authentication issues