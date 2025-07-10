import { User, LoginCredentials } from '../types';

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

  // Login with credentials (now handled by tRPC hooks in AuthContext)
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // This method is now deprecated - use tRPC hooks in AuthContext instead
    throw new Error('Use tRPC hooks for login instead of this method');
  }



  // Logout
  async logout(): Promise<AuthResponse> {
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

  // Set current user and token (for use with tRPC hooks)
  setCurrentUser(user: User, token: string): void {
    this.currentUser = user;
    this.authToken = token;
    this.saveToStorage(user, token, 24 * 60 * 60); // 24 hours
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

  // Validate token (now handled by tRPC hooks in AuthContext)
  async validateToken(): Promise<boolean> {
    // This method is now deprecated - use tRPC hooks in AuthContext instead
    throw new Error('Use tRPC hooks for token validation instead of this method');
  }

  // Refresh token (not implemented in current server)
  async refreshToken(): Promise<boolean> {
    // For now, just validate the current token
    return this.validateToken();
  }

  // Register new user (now handled by tRPC hooks in AuthContext)
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }): Promise<AuthResponse> {
    // This method is now deprecated - use tRPC hooks in AuthContext instead
    throw new Error('Use tRPC hooks for registration instead of this method');
  }
}

const authService = new AuthService();
export default authService; 