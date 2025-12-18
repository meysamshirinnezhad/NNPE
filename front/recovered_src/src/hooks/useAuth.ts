import { useState } from 'react';
import { authService } from '../api';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../api';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginRequest): Promise<AuthResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<AuthResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    // authService.logout() handles redirect to login page
    await authService.logout();
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await authService.forgotPassword({ email });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await authService.resetPassword({ token, password });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    loading,
    error,
  };
};