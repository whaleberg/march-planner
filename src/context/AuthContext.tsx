import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials } from '../types';
import authService, { AuthResponse } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  isEditor: () => boolean;
  canEdit: () => boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      // Check if user is already authenticated
      if (authService.isAuthenticated()) {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);
      
      if (response.success && response.user) {
        setUser(response.user);
        setError(null);
      } else {
        setError(response.error || 'Login failed');
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      await authService.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Even if logout fails, clear local state
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = (): boolean => {
    return authService.isAdmin();
  };

  const isEditor = (): boolean => {
    return authService.isEditor();
  };

  const canEdit = (): boolean => {
    return authService.canEdit();
  };

  const clearError = (): void => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    isAdmin,
    isEditor,
    canEdit,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 