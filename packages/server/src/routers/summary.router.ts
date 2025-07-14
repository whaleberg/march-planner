import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { dataService } from '../services/dataService';
import {DaySummary, Marcher, SingleEntityResponse, TotalMarchersCount, VersionedEntity} from "@march-organizer/shared";

export const summaryRouter = router({
  // 1. Total marchers, medics, peacekeepers
  marchers: publicProcedure
  .input(z.object({
    marchId: z.string(),
  }))
  .query(async ({ input }) => {
    const marchersResponse = await dataService.listMarchers(input.marchId);
    const marchers = marchersResponse.data;
    const total = marchers.length;
    const medics = marchers.filter((m: any) => m.medic).length;
    const peacekeepers = marchers.filter((m: any) => m.peacekeeper).length;
    return <TotalMarchersCount>{total, medics, peacekeepers};
  }),

  // 2. Per-day stats: total, medics, peacekeepers for each day
  marchersByDay: publicProcedure
    .input(z.object({
      dayId: z.string(),
    }))
    .query(async ({ input }) => {
      const dayResponse = await dataService.getMarchDay(input.dayId);
      const assignmentsResponse = await dataService.listMarcherDayAssignments();
      const marchersResponse = await dataService.listMarchers();
      
      const day = dayResponse.data;
      const assignments = assignmentsResponse.data;
      const marchers = marchersResponse.data;
      
      // Map marcherId to marcher
      const marcherMap = new Map(marchers.map((m: Marcher) => [m.id, m]));
      
      // Group assignments by day
      const dayAssignments = assignments.filter(a => a.dayId === day.id);
      let total = 0, medics = 0, peacekeepers = 0;
      for (const a of dayAssignments) {
        const marcher = marcherMap.get(a.marcherId);
        if (marcher) {
          total++;
          if (marcher.medic) medics++;
          if (marcher.peacekeeper) peacekeepers++;
        }
      }
      const result: DaySummary = {
        dayId: day.id,
        date:  day.date,
        marchers: total,
        medics: medics,
        peacekeepers: peacekeepers 
      };
      
      return <SingleEntityResponse<DaySummary>> {
        data: result,
        success: true,
      }
    }),

  // 3. Total days count
  days: publicProcedure
    .input(z.object({
      marchId: z.string(),
    }))
    .query(async ({ input }) => {
      const daysResponse = await dataService.listMarchDays(input.marchId);
      const days = daysResponse.data;
      return { total: days.length };
    }),

  // 4. Total partners count
  partners: publicProcedure
    .input(z.object({
      marchId: z.string(),
    }))
    .query(async ({ input }) => {
      const organizationsResponse = await dataService.listOrganizations(input.marchId);
      const organizations = organizationsResponse.data;
      return { total: organizations.length };
    }),

  // 5. Total vehicles count
  vehicles: publicProcedure
    .input(z.object({
      marchId: z.string(),
    }))
    .query(async ({ input }) => {
      const vehiclesResponse = await dataService.listVehicles(input.marchId);
      const vehicles = vehiclesResponse.data;
      return { total: vehicles.length };
    })
}); 