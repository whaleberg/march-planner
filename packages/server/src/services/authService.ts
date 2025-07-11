import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { UserRole, JWTPayload, LoginCredentials, RegisterData, User } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// In-memory user storage (replace with database in production)
const users: Map<string, User & { passwordHash: string }> = new Map();

// Initialize with a default admin user
const initializeDefaultAdmin = () => {
  const adminId = uuidv4();
  const adminUser: User & { passwordHash: string } = {
    id: adminId,
    email: 'admin@marchplanner.com',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
    passwordHash: bcrypt.hashSync('admin123', 10), // Change this password in production
  };
  users.set(adminId, adminUser);
  users.set(adminUser.email, adminUser); // Also index by email for quick lookup
  console.log('🔐 Default admin user created:', adminUser.email);
};

// Initialize default admin on service load
initializeDefaultAdmin();

export class AuthService {
  static async register(data: RegisterData): Promise<Omit<User, 'passwordHash'>> {
    // Check if user already exists
    if (users.has(data.email)) {
      throw new Error('User with this email already exists');
    }

    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(data.password, 10);
    
    const user: User & { passwordHash: string } = {
      id: userId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || UserRole.VOLUNTEER,
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordHash,
    };

    users.set(userId, user);
    users.set(data.email, user);

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async login(credentials: LoginCredentials): Promise<{ user: Omit<User, 'passwordHash'>; token: string }> {
    const user = users.get(credentials.email);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);
    
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    user.lastLoginAt = new Date();
    user.updatedAt = new Date();

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  static verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static async getUserById(userId: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = users.get(userId);
    if (!user) return null;
    
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async getUserByEmail(email: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = users.get(email);
    if (!user) return null;
    
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async updateUser(userId: string, updates: Partial<Omit<User, 'id' | 'passwordHash'>>): Promise<Omit<User, 'passwordHash'> | null> {
    const user = users.get(userId);
    if (!user) return null;

    Object.assign(user, { ...updates, updatedAt: new Date() });
    
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = users.get(userId);
    if (!user) return false;

    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.updatedAt = new Date();
    return true;
  }

  static async listUsers(): Promise<Omit<User, 'passwordHash'>[]> {
    const userList: Omit<User, 'passwordHash'>[] = [];
    
    // Only return users indexed by ID (avoid duplicates from email index)
    for (const [key, user] of users.entries()) {
      if (key === user.id) { // Only process ID-indexed entries
        const { passwordHash: _, ...userWithoutPassword } = user;
        userList.push(userWithoutPassword);
      }
    }
    
    return userList;
  }

  static async deleteUser(userId: string): Promise<boolean> {
    const user = users.get(userId);
    if (!user) return false;

    users.delete(userId);
    users.delete(user.email);
    return true;
  }

  static hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
    const roleHierarchy = {
      [UserRole.ADMIN]: 4,
      [UserRole.ORGANIZER]: 3,
      [UserRole.VOLUNTEER]: 2,
      [UserRole.VIEWER]: 1,
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }
} 