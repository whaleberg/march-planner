import { router, publicProcedure, protectedProcedure } from './trpc';
import { marchRouter } from './routers/march.router';
import { marchDaysRouter } from './routers/marchDays.router';
import { marchersRouter } from './routers/marchers.router';
import { organizationsRouter } from './routers/organizations.router';
import { vehiclesRouter } from './routers/vehicles.router';
import { assignmentsRouter } from './routers/assignments.router';
import { schedulesRouter } from './routers/schedules.router';
import { authRouter } from './routers/auth.router';
import { summaryRouter } from './routers/summary.router';

export const appRouter = router({
  // Legacy routes for backward compatibility
  greeting: protectedProcedure.query(() => 'hello tRPC v10! You are authenticated!'),
  
  // Authentication routes
  auth: authRouter,

  // Summary/statistics routes
  summary: summaryRouter,
  
  // New versioned data routes
  march: marchRouter,
  marchDays: marchDaysRouter,
  marchers: marchersRouter,
  organizations: organizationsRouter,
  vehicles: vehiclesRouter,
  assignments: assignmentsRouter,
  schedules: schedulesRouter,
});

// Export only the type of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter;

