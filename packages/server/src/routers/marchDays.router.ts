import { z } from 'zod';
import { router, publicProcedure, organizerProcedure, adminProcedure } from '../trpc';
import { dataService } from '../services/dataService';
import { MarchDaySchema } from '@march-organizer/shared';

export const marchDaysRouter = router({
  // Get march day by ID (PUBLIC - days are public)
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await dataService.getMarchDay(input.id);
    }),

  // List march days (PUBLIC - days are public)
  list: publicProcedure
    .input(z.object({
      marchId: z.string(),
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
      return await dataService.listMarchDays(input.marchId, input.filters, input.pagination);
    }),

  // Create new march day (organizer+ access)
  create: organizerProcedure
    .input(MarchDaySchema)
    .mutation(async ({ input }) => {
      return await dataService.createMarchDay(input);
    }),

  // Update march day (organizer+ access)
  update: organizerProcedure
    .input(z.object({
      id: z.string(),
      data: MarchDaySchema.partial(),
    }))
    .mutation(async ({ input }) => {
      return await dataService.updateMarchDay(input.id, input.data);
    }),

  // Delete march day (admin only)
  delete: adminProcedure
    .input(z.object({
      id: z.string(),
      softDelete: z.boolean().optional().default(true),
    }))
    .mutation(async ({ input }) => {
      return await dataService.deleteMarchDay(input.id, input.softDelete);
    }),
}); 