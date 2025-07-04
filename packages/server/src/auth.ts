// auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {Secret, SignOptions} from "jsonwebtoken";
import bcrypt from 'bcryptjs';
import { promises as fs } from 'fs';
import path from 'path';
import {
  User,
  TokenPayload,
  RefreshToken,
  AuthenticatedRequest,
  AuthMiddleware,
  RoleMiddleware
} from './auth.types';
import {Connect} from "vite";
import NextHandleFunction = Connect.NextHandleFunction;
import ms from "ms";

// Configuration constants
const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET: Secret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const ACCESS_TOKEN_EXPIRATION: string = '15m';
const REFRESH_TOKEN_EXPIRATION: string = '7d';

// File paths
const USERS_FILE: string = path.join(__dirname, 'data', 'users.json');
const REFRESH_TOKENS_FILE: string = path.join(__dirname, 'data', 'refresh-tokens.json');

// Helper functions
async function loadUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function loadRefreshTokens(): Promise<RefreshToken[]> {
  try {
    const data = await fs.readFile(REFRESH_TOKENS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveRefreshTokens(tokens: RefreshToken[]): Promise<void> {
  await fs.writeFile(REFRESH_TOKENS_FILE, JSON.stringify(tokens, null, 2));
}

function generateAccessToken(payload: TokenPayload): string {
  const options: SignOptions = { expiresIn: ACCESS_TOKEN_EXPIRATION as ms.StringValue};
  return jwt.sign(payload, JWT_SECRET, options);
}

function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRATION as ms.StringValue});
}

// Middleware
export const authenticateToken: AuthMiddleware = (req: AuthenticatedRequest, res : Response, next :NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ error: 'Invalid token' });
      return;
    }

    req.user = decoded as TokenPayload;
    next();
  });
};

export const requireRole: RoleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const hasAllowedRole = req.user.roles.some(role => allowedRoles.includes(role));
    if (!hasAllowedRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Route handlers
export const login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  const users = await loadUsers();
  const user = users.find(u => u.username === username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const tokenPayload: TokenPayload = {
    userId: user.id,
    username: user.username,
    roles: user.roles
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Save refresh token
  const refreshTokens = await loadRefreshTokens();
  refreshTokens.push({
    token: refreshToken,
    userId: user.id,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });
  await saveRefreshTokens(refreshTokens);

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      roles: user.roles
    }
  });
};

export const validateToken = (req: AuthenticatedRequest, res: Response): void => {
  res.json({ valid: true, user: req.user });
};

export const refreshToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ error: 'Refresh token is required' });
    return;
  }

  try {
    const refreshTokens = await loadRefreshTokens();
    const storedToken = refreshTokens.find(t => t.token === refreshToken);

    if (!storedToken) {
      res.status(403).json({ error: 'Invalid refresh token' });
      return;
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as TokenPayload;
    const accessToken = generateAccessToken({
      userId: decoded.userId,
      username: decoded.username,
      roles: decoded.roles
    });

    res.json({ accessToken });
  } catch (error) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    const refreshTokens = await loadRefreshTokens();
    const updatedTokens = refreshTokens.filter(t => t.token !== refreshToken);
    await saveRefreshTokens(updatedTokens);
  }

  res.json({ success: true });
};
