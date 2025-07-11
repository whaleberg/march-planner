import { z } from 'zod';
import { router, publicProcedure, organizerProcedure, adminProcedure } from '../trpc';
import { dataService } from '../services/dataService';
import { PartnerOrganizationSchema } from '@march-organizer/shared';

export const organizationsRouter = router({
  // Get organization by ID (PUBLIC - partner organizations are public)
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await dataService.getOrganization(input.id);
    }),

  // List organizations (PUBLIC - partner organizations are public)
  list: publicProcedure
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
      return await dataService.listOrganizations(input.marchId, input.filters, input.pagination);
    }),

  // Create new organization (organizer+ access)
  create: organizerProcedure
    .input(PartnerOrganizationSchema)
    .mutation(async ({ input }) => {
      return await dataService.createOrganization(input);
    }),

  // Update organization (organizer+ access)
  update: organizerProcedure
    .input(z.object({
      id: z.string(),
      data: PartnerOrganizationSchema.partial(),
    }))
    .mutation(async ({ input }) => {
      return await dataService.updateOrganization(input.id, input.data);
    }),

  // Delete organization (admin only)
  delete: adminProcedure
    .input(z.object({
      id: z.string(),
      softDelete: z.boolean().optional().default(true),
    }))
    .mutation(async ({ input }) => {
      return await dataService.deleteOrganization(input.id, input.softDelete);
    }),
}); 