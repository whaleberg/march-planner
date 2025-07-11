import { z } from 'zod';
import { router, protectedProcedure, organizerProcedure, adminProcedure } from '../trpc';
import { dataService } from '../services/dataService';
import { VehicleDayScheduleSchema } from '@march-organizer/shared';

export const schedulesRouter = router({
  // Vehicle-Day Schedules (PROTECTED - operational info)
  vehicleDay: protectedProcedure
    .input(z.object({
      dayId: z.string().optional(),
      vehicleId: z.string().optional(),
    }))
    .query(async ({ input }) => {
      return await dataService.listVehicleDaySchedules(input.dayId, input.vehicleId);
    }),

  createVehicleDay: organizerProcedure
    .input(VehicleDayScheduleSchema)
    .mutation(async ({ input }) => {
      return await dataService.createVehicleDaySchedule(input);
    }),

  updateVehicleDay: organizerProcedure
    .input(z.object({
      id: z.string(),
      data: VehicleDayScheduleSchema.partial(),
    }))
    .mutation(async ({ input }) => {
      return await dataService.updateVehicleDaySchedule(input.id, input.data);
    }),

  deleteVehicleDay: adminProcedure
    .input(z.object({
      id: z.string(),
      softDelete: z.boolean().optional().default(true),
    }))
    .mutation(async ({ input }) => {
      return await dataService.deleteVehicleDaySchedule(input.id, input.softDelete);
    }),
}); 