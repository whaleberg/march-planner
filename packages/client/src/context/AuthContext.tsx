import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials } from '../types';
import authService, { AuthResponse } from '../services/authService';
import { useLogin, useVerifyToken } from '../hooks/useAuth';

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

  // tRPC hooks
  const loginMutation = useLogin();
  const verifyTokenQuery = useVerifyToken();

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        // Check if user is already authenticated
        if (authService.isAuthenticated()) {
          const token = authService.getAuthToken();
          if (token) {
            // Use tRPC to validate token
            const result = await verifyTokenQuery.mutateAsync({ token });
            if (result.valid && result.user) {
              // Map server user to client user format
              const user: User = {
                id: result.user.id,
                username: result.user.email,
                email: result.user.email,
                role: mapServerRoleToClientRole(result.user.role),
                name: `${result.user.firstName} ${result.user.lastName}`
              };
              setUser(user);
            } else {
              // Token is invalid, clear auth state
              authService.logout();
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [verifyTokenQuery]);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginMutation.mutateAsync({
        email: credentials.username,
        password: credentials.password
      });
      
      if (result.user && result.token) {
        // Map server user to client user format
        const user: User = {
          id: result.user.id,
          username: result.user.email,
          email: result.user.email,
          role: mapServerRoleToClientRole(result.user.role),
          name: `${result.user.firstName} ${result.user.lastName}`
        };

        // Save to auth service for localStorage management
        authService.setCurrentUser(user, result.token);
        setUser(user);
        setError(null);
        
        return { success: true, user, token: result.token };
      } else {
        setError('Login failed');
        return { success: false, error: 'Login failed' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Map server role to client role
  const mapServerRoleToClientRole = (serverRole: string): 'admin' | 'editor' | 'viewer' => {
    switch (serverRole) {
      case 'admin':
        return 'admin';
      case 'organizer':
        return 'editor';
      case 'volunteer':
        return 'editor';
      case 'viewer':
        return 'viewer';
      default:
        return 'viewer';
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