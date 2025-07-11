// Migration utilities temporarily disabled due to type compatibility issues
// Will be re-enabled once the main build is working

/*
import { MarchData, MarchDay, Marcher, PartnerOrganization, Vehicle } from '../types';
import { 
  March as VersionedMarch, 
  MarchDay as VersionedMarchDay, 
  Marcher as VersionedMarcher, 
  PartnerOrganization as VersionedPartnerOrganization, 
  Vehicle as VersionedVehicle,
  MarcherDayAssignment,
  OrganizationDayAssignment,
  VehicleDaySchedule
} from '../types/versioned';

// Generate a unique ID
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Convert legacy data to new versioned format
export function migrateToVersioned(oldData: MarchData): {
  march: VersionedMarch;
  days: VersionedMarchDay[];
  marchers: VersionedMarcher[];
  organizations: VersionedPartnerOrganization[];
  vehicles: VersionedVehicle[];
  marcherAssignments: MarcherDayAssignment[];
  organizationAssignments: OrganizationDayAssignment[];
  vehicleSchedules: VehicleDaySchedule[];
} {
  // Implementation temporarily disabled
  throw new Error('Migration utility temporarily disabled');
}

// Convert versioned data back to legacy format (for backward compatibility)
export function migrateToLegacy(data: {
  march: VersionedMarch;
  days: VersionedMarchDay[];
  marchers: VersionedMarcher[];
  organizations: VersionedPartnerOrganization[];
  vehicles: VersionedVehicle[];
  marcherAssignments: MarcherDayAssignment[];
  organizationAssignments: OrganizationDayAssignment[];
  vehicleSchedules: VehicleDaySchedule[];
}): MarchData {
  // Implementation temporarily disabled
  throw new Error('Migration utility temporarily disabled');
}
*/

// Placeholder exports
export function migrateToVersioned() {
  throw new Error('Migration utility temporarily disabled');
}

export function migrateToLegacy() {
  throw new Error('Migration utility temporarily disabled');
} 