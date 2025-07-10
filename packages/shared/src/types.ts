// Shared versioned data types for tRPC architecture

export interface VersionedEntity {
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isDeleted?: boolean;
}

export interface March extends VersionedEntity {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  missionStatement: {
    title: string;
    subtitle: string;
    description: string;
  };
  callToAction: {
    title: string;
    description: string;
  };
  itineraryDescription: string;
  mapSettings?: {
    googleMapsApiKey?: string;
    defaultZoom?: number;
    mapCenter?: {
      lat: number;
      lng: number;
    };
  };
}

export interface MarchDay extends VersionedEntity {
  marchId: string;
  date: string;
  route: {
    startPoint: string;
    endPoint: string;
    routePoints: Array<{
      id: string;
      name: string;
      coordinates: { lat: number; lng: number };
      type: 'start' | 'end' | 'waypoint';
      description?: string;
      estimatedTime?: string;
    }>;
  };
  breakfast: {
    location: string;
    time: string;
    description?: string;
  };
  lunch: {
    location: string;
    time: string;
    description?: string;
  };
  dinner: {
    location: string;
    time: string;
    description?: string;
  };
  specialEvents: Array<{
    id: string;
    title: string;
    description: string;
    time: string;
    location: string;
  }>;
  dailyOrganizer?: {
    name: string;
    email: string;
    phone: string;
  };
  marchLeaderId?: string;
}

export interface Marcher extends VersionedEntity {
  name: string;
  email: string;
  phone?: string;
  emergencyContact?: string;
  dietaryRestrictions?: string;
  notes?: string;
  medic: boolean;
  peacekeeper: boolean;
}

export interface PartnerOrganization extends VersionedEntity {
  name: string;
  description: string;
  website?: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  logoUrl?: string;
}

export interface Vehicle extends VersionedEntity {
  name: string;
  type: 'van' | 'truck' | 'car' | 'bus';
  capacity: number;
  driver: string;
  driverPhone: string;
  licensePlate?: string;
  notes?: string;
}

// Relationship objects to handle many-to-many relationships
export interface MarcherDayAssignment extends VersionedEntity {
  marcherId: string;
  dayId: string;
  marchId: string;
  role?: 'participant' | 'organizer' | 'support';
  notes?: string;
}

export interface OrganizationDayAssignment extends VersionedEntity {
  organizationId: string;
  dayId: string;
  marchId: string;
  role?: 'host' | 'supporter' | 'sponsor';
  contribution?: string;
  notes?: string;
}

export interface VehicleDaySchedule extends VersionedEntity {
  vehicleId: string;
  dayId: string;
  marchId: string;
  startTime: string;
  endTime: string;
  route: string;
  purpose: string;
  driver: string;
  notes?: string;
}

// Query and mutation types for tRPC
export interface QueryFilters {
  marchId?: string;
  dayId?: string;
  marcherId?: string;
  organizationId?: string;
  vehicleId?: string;
  includeDeleted?: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateEntityParams<T> {
  data: Omit<T, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>;
}

export interface UpdateEntityParams<T> {
  id: string;
  data: Partial<Omit<T, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>>;
}

export interface DeleteEntityParams {
  id: string;
  softDelete?: boolean;
}

// Response types
export interface QueryResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SingleEntityResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface MutationResponse {
  success: boolean;
  message?: string;
  id?: string;
  version?: number;
}

// Legacy types for backward compatibility
export interface LegacyMarchData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  missionStatement: {
    title: string;
    subtitle: string;
    description: string;
  };
  callToAction: {
    title: string;
    description: string;
  };
  itineraryDescription: string;
  days: Array<{
    id: string;
    date: string;
    route: {
      startPoint: string;
      endPoint: string;
      routePoints: Array<{
        id: string;
        name: string;
        coordinates: { lat: number; lng: number };
        type: 'start' | 'end' | 'waypoint' | 'stop';
        description?: string;
        estimatedTime?: string;
      }>;
    };
    breakfast: {
      time: string;
      location: string;
      description: string;
      providedBy?: string;
      notes?: string;
    };
    lunch: {
      time: string;
      location: string;
      description: string;
      providedBy?: string;
      notes?: string;
    };
    dinner: {
      time: string;
      location: string;
      description: string;
      providedBy?: string;
      notes?: string;
    };
    specialEvents: Array<{
      id: string;
      title: string;
      time: string;
      location: string;
      description: string;
      organizer?: string;
    }>;
    marchers: string[];
    partnerOrganizations: string[];
    vehicleSchedules?: Array<{
      vehicleId: string;
      driver: string;
      driverContact: string;
      notes: string;
    }>;
    dailyOrganizer?: {
      name: string;
      email: string;
      phone: string;
    };
    marchLeaderId?: string;
  }>;
  marchers: Array<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
    emergencyContact?: string;
    dietaryRestrictions?: string;
    notes?: string;
    marchingDays: string[];
    medic: boolean;
    peacekeeper?: boolean;
  }>;
  partnerOrganizations: Array<{
    id: string;
    name: string;
    description: string;
    website?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    partnerDays?: string[];
    createdAt?: string;
    updatedAt?: string;
  }>;
  vehicles: Array<{
    id: string;
    name: string;
    description: string;
    licensePlate: string;
    responsiblePerson: string;
    vehicleDays?: string[];
  }>;
  mapSettings?: {
    googleMapsApiKey?: string;
    defaultZoom?: number;
    mapCenter?: {
      lat: number;
      lng: number;
    };
  };
}

// Authentication types
export interface User extends VersionedEntity {
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  lastLogin?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// View mode types for scheduling components
export type ViewMode = 'by-day' | 'by-marcher' | 'by-organization' | 'by-vehicle';
export type MarcherViewMode = 'by-day' | 'by-marcher';
export type OrganizationViewMode = 'by-day' | 'by-organization';
export type VehicleViewMode = 'by-day' | 'by-vehicle';