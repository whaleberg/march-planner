export interface Marcher {
  id: string;
  name: string;
  email: string;
  phone?: string;
  emergencyContact?: string;
  dietaryRestrictions?: string;
  notes?: string;
  marchingDays?: string[]; // Array of day IDs when this marcher is participating
  medic?: boolean; // Indicates if marcher has medic training
  peacekeeper?: boolean; // Indicates if marcher has peacekeeper training
}

export interface PartnerOrganization {
  id: string;
  name: string;
  description: string;
  website?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  partnerDays?: string[]; // Array of day IDs when this organization is partnering
}

export interface Vehicle {
  id: string;
  name: string;
  description: string;
  licensePlate: string;
  responsiblePerson: string;
  vehicleDays?: string[]; // Array of day IDs when this vehicle is active
}

export interface VehicleDaySchedule {
  vehicleId: string;
  driver: string; // ID of the marcher who is driving
  driverContact: string;
  notes: string;
}

export interface Meal {
  time: string;
  location: string;
  description: string;
  providedBy?: string;
  notes?: string;
}

export interface SpecialEvent {
  id: string;
  title: string;
  time: string;
  location: string;
  description: string;
  organizer?: string;
}

export interface MapCoordinates {
  lat: number;
  lng: number;
}

export interface RoutePoint {
  id: string;
  name: string;
  coordinates: MapCoordinates;
  address?: string;
  type: 'start' | 'end' | 'waypoint' | 'stop';
  description?: string;
  estimatedTime?: string; // Time to reach this point
  notes?: string;
}

export interface DayRoute {
  startPoint: string;
  endPoint: string;
  terrain?: string;
  notes?: string;
  routePoints: RoutePoint[]; // Detailed route points including stops
  polylinePath?: string; // Google Maps encoded polyline for the route
}

export interface MarchDay {
  id: string;
  date: string;
  route: DayRoute;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  specialEvents: SpecialEvent[];
  marchers: string[]; // Array of marcher IDs
  partnerOrganizations: string[]; // Array of partner organization IDs
  dailyOrganizer?: {
    name: string;
    email: string;
    phone: string;
  };
  marchLeaderId?: string; // ID of the marcher who is the march leader for this day
}

export interface MarchData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  // Editable flavor text fields
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
  days: MarchDay[];
  marchers: Marcher[];
  partnerOrganizations: PartnerOrganization[];
  mapSettings?: {
    googleMapsApiKey?: string;
    defaultZoom?: number;
    mapCenter?: MapCoordinates;
  };
}

// Authentication types
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt?: string;
  lastLogin?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
} 