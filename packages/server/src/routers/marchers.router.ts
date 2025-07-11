import { z } from 'zod';
import { router, protectedProcedure, organizerProcedure, adminProcedure } from '../trpc';
import { dataService } from '../services/dataService';
import { MarcherSchema } from '@march-organizer/shared';

export const marchersRouter = router({
  // Get marcher by ID (PROTECTED - personal data is private)
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await dataService.getMarcher(input.id);
    }),

  // List marchers (PROTECTED - personal data is private)
  list: protectedProcedure
    .input(z.object({
      marchId: z.string().optional(),
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
      return await dataService.listMarchers(input.marchId, input.filters, input.pagination);
    }),

  // Create new marcher (organizer+ access)
  create: organizerProcedure
    .input(MarcherSchema)
    .mutation(async ({ input }) => {
      return await dataService.createMarcher(input);
    }),

  // Update marcher (organizer+ access)
  update: organizerProcedure
    .input(z.object({
      id: z.string(),
      data: MarcherSchema.partial(),
    }))
    .mutation(async ({ input }) => {
      return await dataService.updateMarcher(input.id, input.data);
    }),

  // Delete marcher (admin only)
  delete: adminProcedure
    .input(z.object({
      id: z.string(),
      softDelete: z.boolean().optional().default(true),
    }))
    .mutation(async ({ input }) => {
      return await dataService.deleteMarcher(input.id, input.softDelete);
    }),
}); 