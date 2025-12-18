import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../api';
import type { User } from '../api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Validate session with backend on mount
    const validateSession = async () => {
      try {
        // Validate session cookie with backend
        const userData = await authService.validateSession();
        setUser(userData);
      } catch (error: any) {
        // Session is invalid, expired, or user is not logged in
        // This is expected for non-authenticated users, so don't log as error
        if (error?.message?.includes('404')) {
          // Backend endpoint might not exist or auth middleware rejected request
          console.log('No active session found');
        }
        setUser(null);
        // Clear any cached user data
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, []);

  const logout = async () => {
    try {
      // Call logout service which clears cookies and redirects
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear state anyway
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    setUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};