import { User, LoginCredentials } from '../types';

// Configuration
const AUTH_BASE_URL = (import.meta as any).env?.VITE_AUTH_API_URL || '';
const USE_LOCAL_AUTH = (import.meta as any).env?.VITE_USE_LOCAL_AUTH === 'true' || !AUTH_BASE_URL;

// Local storage keys
const AUTH_KEYS = {
  USER: 'auth_user',
  TOKEN: 'auth_token',
  EXPIRES: 'auth_expires'
};

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

class AuthService {
  private currentUser: User | null = null;
  private authToken: string | null = null;

  constructor() {
    this.loadFromStorage();
  }

  // Load user from localStorage on initialization
  private loadFromStorage(): void {
    try {
      const userStr = localStorage.getItem(AUTH_KEYS.USER);
      const token = localStorage.getItem(AUTH_KEYS.TOKEN);
      const expires = localStorage.getItem(AUTH_KEYS.EXPIRES);

      if (userStr && token && expires) {
        const user = JSON.parse(userStr);
        const expiryDate = new Date(expires);
        
        // Check if token is still valid
        if (expiryDate > new Date()) {
          this.currentUser = user;
          this.authToken = token;
        } else {
          this.clearStorage();
        }
      }
    } catch (error) {
      console.error('Failed to load auth from storage:', error);
      this.clearStorage();
    }
  }

  private clearStorage(): void {
    localStorage.removeItem(AUTH_KEYS.USER);
    localStorage.removeItem(AUTH_KEYS.TOKEN);
    localStorage.removeItem(AUTH_KEYS.EXPIRES);
    this.currentUser = null;
    this.authToken = null;
  }

  private saveToStorage(user: User, token: string, expiresIn: number): void {
    const expiryDate = new Date(Date.now() + expiresIn * 1000);
    localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(AUTH_KEYS.TOKEN, token);
    localStorage.setItem(AUTH_KEYS.EXPIRES, expiryDate.toISOString());
  }

  // Login with credentials
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (USE_LOCAL_AUTH) {
      return this.localLogin(credentials);
    }

    try {
      const response = await fetch(`${AUTH_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.user && data.token) {
        this.currentUser = data.user;
        this.authToken = data.token;
        this.saveToStorage(data.user, data.token, data.expiresIn || 3600);
        return { success: true, user: data.user, token: data.token };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  }

  // Local authentication for development
  private localLogin(credentials: LoginCredentials): AuthResponse {
    // Simple local authentication - in production, use proper backend
    const validUsers = [
      {
        id: 'admin-1',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        name: 'Administrator'
      },
      {
        id: 'editor-1',
        username: 'editor',
        email: 'editor@example.com',
        role: 'editor',
        name: 'Content Editor'
      }
    ];

    const user = validUsers.find(u => 
      u.username === credentials.username && 
      credentials.password === 'password' // Simple password for demo
    );

    if (user) {
      this.currentUser = user;
      this.authToken = 'local-token-' + Date.now();
      this.saveToStorage(user, this.authToken, 3600);
      return { success: true, user, token: this.authToken };
    }

    return { success: false, error: 'Invalid credentials' };
  }

  // Logout
  async logout(): Promise<AuthResponse> {
    if (!USE_LOCAL_AUTH && this.authToken) {
      try {
        await fetch(`${AUTH_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    this.clearStorage();
    return { success: true };
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null && this.authToken !== null;
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Get auth token
  getAuthToken(): string | null {
    return this.authToken;
  }

  // Check if user has admin role
  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  // Check if user has editor role
  isEditor(): boolean {
    return this.currentUser?.role === 'editor' || this.currentUser?.role === 'admin';
  }

  // Check if user can edit (admin or editor)
  canEdit(): boolean {
    return this.isEditor();
  }

  // Validate token with server
  async validateToken(): Promise<boolean> {
    if (USE_LOCAL_AUTH) {
      return this.isAuthenticated();
    }

    if (!this.authToken) {
      return false;
    }

    try {
      const response = await fetch(`${AUTH_BASE_URL}/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          this.currentUser = data.user;
          return true;
        }
      }

      // Token is invalid, clear storage
      this.clearStorage();
      return false;
    } catch (error) {
      console.error('Token validation error:', error);
      this.clearStorage();
      return false;
    }
  }

  // Refresh token
  async refreshToken(): Promise<boolean> {
    if (USE_LOCAL_AUTH) {
      return this.isAuthenticated();
    }

    if (!this.authToken) {
      return false;
    }

    try {
      const response = await fetch(`${AUTH_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.token) {
          this.authToken = data.token;
          this.saveToStorage(this.currentUser!, data.token, data.expiresIn || 3600);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
export default authService; 