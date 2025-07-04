// auth.types.ts
import { Request, Response, NextFunction } from 'express';

export interface User {
  id: string;
  username: string;
  password: string;
  roles: string[];
}

export interface TokenPayload {
  userId: string;
  username: string;
  roles: string[];
}

export interface RefreshToken {
  token: string;
  userId: string;
  expires: Date;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export type AuthMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

export type RoleMiddleware = (
  roles: string[]
) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
