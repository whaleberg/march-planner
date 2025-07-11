import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { AuthContext } from './types/auth';
import { AuthService } from './services/authService';

// You can use any variable name you like.
// We use t to keep things simple.
const t = initTRPC.context<AuthContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware to check if user is authenticated
const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.isAuthenticated || !ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Middleware to check if user has required role
const hasRole = (requiredRole: string) => 
  t.middleware(({ ctx, next }) => {
    if (!ctx.isAuthenticated || !ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to access this resource',
      });
    }

    if (!AuthService.hasPermission(ctx.user.role, requiredRole as any)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `You need ${requiredRole} role to access this resource`,
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  });

// Create protected procedures
export const protectedProcedure = t.procedure.use(isAuthenticated);
export const adminProcedure = t.procedure.use(hasRole('admin'));
export const organizerProcedure = t.procedure.use(hasRole('organizer'));
export const volunteerProcedure = t.procedure.use(hasRole('volunteer'));
export const viewerProcedure = t.procedure.use(hasRole('viewer'));