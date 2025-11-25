import apiClient, { handleApiError } from '../client';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  User,
} from '../types';

class AuthService {
  /**
   * Register a new user
   * Cookies are set automatically by the backend
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      
      // Store JWT tokens for header-based auth
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
      }
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }
      
      // Cache user data locally for quick access
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Login user
   * Cookies are set automatically by the backend
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', data);
      
      // Store JWT tokens for header-based auth
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
      }
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }
      
      // Cache user data locally for quick access
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Logout user - clears session cookie on backend
   */
  async logout(): Promise<void> {
    try {
      // Call backend to clear session cookie
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Clear all cached data including tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      window.location.href = '/login';
    }
  }

  /**
   * Validate current session with backend
   * Returns current user if session is valid
   */
  async validateSession(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/auth/me');
      
      // Update cached user data
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      // Clear cached data on validation failure
      localStorage.removeItem('user');
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Refresh session (if backend supports it)
   * For cookie-based auth, this might not be needed as cookies auto-refresh
   */
  async refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/refresh', data);
      
      // Update tokens
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
      }
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }
      
      // Update cached user data if provided
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/forgot-password', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/reset-password', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.get<{ message: string }>(`/auth/verify/${token}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get cached user from localStorage
   * Note: This may be stale; use validateSession() for fresh data
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Check if user appears to be authenticated (based on cached data)
   * Note: This doesn't validate the session; use validateSession() for that
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('user');
  }
}

export default new AuthService();