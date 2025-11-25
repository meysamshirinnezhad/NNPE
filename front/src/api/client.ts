import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// API Base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Create axios instance with cookie-based authentication
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
  withCredentials: true, // Enable sending/receiving cookies with requests
});

// Request interceptor - Add JWT token to Authorization header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add JWT token from localStorage if available
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Cookies are also sent with withCredentials: true
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 errors by redirecting to login
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Handle 401/404 Unauthorized - Session expired or invalid
    if (error.response?.status === 401 || error.response?.status === 404) {
      // Don't redirect if this is the session validation endpoint
      // A 401/404 on /auth/me just means "not logged in" which is normal
      const isSessionValidation = originalRequest?.url?.includes('/auth/me');
      
      if (!isSessionValidation) {
        // Clear all cached data including tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // Redirect to login page if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Helper function to handle API errors
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string; message?: string }>;
    return axiosError.response?.data?.error || 
           axiosError.response?.data?.message || 
           axiosError.message || 
           'An unexpected error occurred';
  }
  return 'An unexpected error occurred';
};

// Export API base URL for direct use if needed
export { API_BASE_URL };
