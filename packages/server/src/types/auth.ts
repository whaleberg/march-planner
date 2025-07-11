export enum UserRole {
  ADMIN = 'admin',
  ORGANIZER = 'organizer',
  VOLUNTEER = 'volunteer',
  VIEWER = 'viewer'
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthContext {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
} 