import { z } from 'zod';
import { router, publicProcedure, organizerProcedure, adminProcedure } from '../trpc';
import { dataService } from '../services/dataService';
import { MarchSchema } from '@march-organizer/shared';

export const marchRouter = router({
  // Get march by ID (PUBLIC - route information is public)
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await dataService.getMarch(input.id);
    }),

  // List all marches (PUBLIC - route information is public)
  list: publicProcedure
    .input(z.object({
      filters: z.object({
        includeDeleted: z.boolean().optional(),
      }).optional(),
      pagination: z.object({
        page: z.number().min(1).optional().default(1),
        limit: z.number().min(1).max(100).optional().default(50),
        sortBy: z.string().optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
      }).optional(),
    }))
    .query(async ({ input }) => {
      return await dataService.listMarches(input.filters, input.pagination);
    }),

  // Create new march (organizer+ access)
  create: organizerProcedure
    .input(MarchSchema)
    .mutation(async ({ input }) => {
      return await dataService.createMarch(input);
    }),

  // Update march (organizer+ access)
  update: organizerProcedure
    .input(z.object({
      id: z.string(),
      data: MarchSchema.partial(),
    }))
    .mutation(async ({ input }) => {
      return await dataService.updateMarch(input.id, input.data);
    }),

  // Delete march (admin only)
  delete: adminProcedure
    .input(z.object({
      id: z.string(),
      softDelete: z.boolean().optional().default(true),
    }))
    .mutation(async ({ input }) => {
      return await dataService.deleteMarch(input.id, input.softDelete);
    }),
}); 