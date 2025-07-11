import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../trpc';
import { AuthService } from '../services/authService';
import { UserRole } from '../types/auth';

export const authRouter = router({
  // Register a new user (public)
  register: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      role: z.nativeEnum(UserRole).optional(),
    }))
    .mutation(async ({ input }) => {
      const user = await AuthService.register(input);
      return { user, message: 'User registered successfully' };
    }),

  // Login (public)
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ input }) => {
      const result = await AuthService.login(input);
      return {
        user: result.user,
        token: result.token,
        message: 'Login successful',
      };
    }),

  // Get current user profile (protected)
  me: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await AuthService.getUserById(ctx.user!.id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    }),

  // Update user profile (protected)
  updateProfile: protectedProcedure
    .input(z.object({
      firstName: z.string().min(1).optional(),
      lastName: z.string().min(1).optional(),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const user = await AuthService.updateUser(ctx.user!.id, input);
      if (!user) {
        throw new Error('User not found');
      }
      return { user, message: 'Profile updated successfully' };
    }),

  // Change password (protected)
  changePassword: protectedProcedure
    .input(z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(6),
    }))
    .mutation(async ({ input, ctx }) => {
      const success = await AuthService.changePassword(
        ctx.user!.id,
        input.currentPassword,
        input.newPassword
      );
      if (!success) {
        throw new Error('Failed to change password');
      }
      return { message: 'Password changed successfully' };
    }),

  // List all users (admin only)
  listUsers: adminProcedure
    .query(async () => {
      const users = await AuthService.listUsers();
      return users;
    }),

  // Get user by ID (admin only)
  getUserById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const user = await AuthService.getUserById(input.id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    }),

  // Update user (admin only)
  updateUser: adminProcedure
    .input(z.object({
      id: z.string(),
      firstName: z.string().min(1).optional(),
      lastName: z.string().min(1).optional(),
      email: z.string().email().optional(),
      role: z.nativeEnum(UserRole).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      const user = await AuthService.updateUser(id, updates);
      if (!user) {
        throw new Error('User not found');
      }
      return { user, message: 'User updated successfully' };
    }),

  // Delete user (admin only)
  deleteUser: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const success = await AuthService.deleteUser(input.id);
      if (!success) {
        throw new Error('User not found');
      }
      return { message: 'User deleted successfully' };
    }),

  // Verify token (public - for client-side token validation)
  verifyToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const payload = AuthService.verifyToken(input.token);
        const user = await AuthService.getUserById(payload.userId);
        return { valid: true, user };
      } catch (error) {
        return { valid: false, user: null };
      }
    }),
}); 