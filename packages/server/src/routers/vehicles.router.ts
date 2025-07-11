import { z } from 'zod';
import { router, protectedProcedure, organizerProcedure, adminProcedure } from '../trpc';
import { dataService } from '../services/dataService';
import { VehicleSchema } from '@march-organizer/shared';

export const vehiclesRouter = router({
  // Get vehicle by ID (PROTECTED - operational info)
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await dataService.getVehicle(input.id);
    }),

  // List vehicles (PROTECTED - operational info)
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
      return await dataService.listVehicles(input.marchId, input.filters, input.pagination);
    }),

  // Create new vehicle (organizer+ access)
  create: organizerProcedure
    .input(VehicleSchema)
    .mutation(async ({ input }) => {
      return await dataService.createVehicle(input);
    }),

  // Update vehicle (organizer+ access)
  update: organizerProcedure
    .input(z.object({
      id: z.string(),
      data: VehicleSchema.partial(),
    }))
    .mutation(async ({ input }) => {
      return await dataService.updateVehicle(input.id, input.data);
    }),

  // Delete vehicle (admin only)
  delete: adminProcedure
    .input(z.object({
      id: z.string(),
      softDelete: z.boolean().optional().default(true),
    }))
    .mutation(async ({ input }) => {
      return await dataService.deleteVehicle(input.id, input.softDelete);
    }),
}); 