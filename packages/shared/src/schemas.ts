// Zod schemas for validation - shared between client and server

import { z } from 'zod';

export const MarchSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  missionStatement: z.object({
    title: z.string(),
    subtitle: z.string(),
    description: z.string(),
  }),
  callToAction: z.object({
    title: z.string(),
    description: z.string(),
  }),
  itineraryDescription: z.string(),
  mapSettings: z.object({
    googleMapsApiKey: z.string().optional(),
    defaultZoom: z.number().optional(),
    mapCenter: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
  }).optional(),
});

export const MarchDaySchema = z.object({
  marchId: z.string(),
  date: z.string(),
  route: z.object({
    startPoint: z.string(),
    endPoint: z.string(),
    routePoints: z.array(z.object({
      id: z.string(),
      name: z.string(),
      coordinates: z.object({
        lat: z.number(),
        lng: z.number(),
      }),
      type: z.enum(['start', 'end', 'waypoint']),
      description: z.string().optional(),
      estimatedTime: z.string().optional(),
    })),
  }),
  breakfast: z.object({
    location: z.string(),
    time: z.string(),
    description: z.string().optional(),
  }),
  lunch: z.object({
    location: z.string(),
    time: z.string(),
    description: z.string().optional(),
  }),
  dinner: z.object({
    location: z.string(),
    time: z.string(),
    description: z.string().optional(),
  }),
  specialEvents: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    time: z.string(),
    location: z.string(),
  })),
  dailyOrganizer: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
  }).optional(),
  marchLeaderId: z.string().optional(),
});

export const MarcherSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  emergencyContact: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  notes: z.string().optional(),
  medic: z.boolean(),
  peacekeeper: z.boolean(),
});

export const PartnerOrganizationSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  website: z.string().url().optional(),
  contactPerson: z.string(),
  contactEmail: z.string().email(),
  contactPhone: z.string(),
  logoUrl: z.string().url().optional(),
});

export const VehicleSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['van', 'truck', 'car', 'bus']),
  capacity: z.number().positive(),
  driver: z.string(),
  driverPhone: z.string(),
  licensePlate: z.string().optional(),
  notes: z.string().optional(),
});

export const MarcherDayAssignmentSchema = z.object({
  marcherId: z.string(),
  dayId: z.string(),
  marchId: z.string(),
  role: z.enum(['participant', 'organizer', 'support']).optional(),
  notes: z.string().optional(),
});

export const OrganizationDayAssignmentSchema = z.object({
  organizationId: z.string(),
  dayId: z.string(),
  marchId: z.string(),
  role: z.enum(['host', 'supporter', 'sponsor']).optional(),
  contribution: z.string().optional(),
  notes: z.string().optional(),
});

export const VehicleDayScheduleSchema = z.object({
  vehicleId: z.string(),
  dayId: z.string(),
  marchId: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  route: z.string(),
  purpose: z.string(),
  driver: z.string(),
  notes: z.string().optional(),
});

// Query parameter schemas
export const QueryFiltersSchema = z.object({
  marchId: z.string().optional(),
  dayId: z.string().optional(),
  marcherId: z.string().optional(),
  organizationId: z.string().optional(),
  vehicleId: z.string().optional(),
  includeDeleted: z.boolean().optional(),
});

export const PaginationParamsSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
}); 