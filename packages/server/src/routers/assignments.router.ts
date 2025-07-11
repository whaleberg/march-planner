import { z } from 'zod';
import { router, protectedProcedure, organizerProcedure, adminProcedure } from '../trpc';
import { dataService } from '../services/dataService';
import { MarcherDayAssignmentSchema, OrganizationDayAssignmentSchema } from '@march-organizer/shared';

export const assignmentsRouter = router({
  // Marcher-Day Assignments (PROTECTED - reveals personal assignment info)
  marcherDay: protectedProcedure
    .input(z.object({
      dayId: z.string().optional(),
      marcherId: z.string().optional(),
    }))
    .query(async ({ input }) => {
      return await dataService.listMarcherDayAssignments(input.dayId, input.marcherId);
    }),

  createMarcherDay: organizerProcedure
    .input(MarcherDayAssignmentSchema)
    .mutation(async ({ input }) => {
      return await dataService.createMarcherDayAssignment(input);
    }),

  deleteMarcherDay: adminProcedure
    .input(z.object({
      id: z.string(),
      softDelete: z.boolean().optional().default(true),
    }))
    .mutation(async ({ input }) => {
      return await dataService.deleteMarcherDayAssignment(input.id, input.softDelete);
    }),

  // Organization-Day Assignments (PROTECTED - operational info)
  organizationDay: protectedProcedure
    .input(z.object({
      dayId: z.string().optional(),
      organizationId: z.string().optional(),
    }))
    .query(async ({ input }) => {
      return await dataService.listOrganizationDayAssignments(input.dayId, input.organizationId);
    }),

  createOrganizationDay: organizerProcedure
    .input(OrganizationDayAssignmentSchema)
    .mutation(async ({ input }) => {
      return await dataService.createOrganizationDayAssignment(input);
    }),

  deleteOrganizationDay: adminProcedure
    .input(z.object({
      id: z.string(),
      softDelete: z.boolean().optional().default(true),
    }))
    .mutation(async ({ input }) => {
      return await dataService.deleteOrganizationDayAssignment(input.id, input.softDelete);
    }),
}); 