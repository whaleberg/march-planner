import { 
  March, 
  MarchDay, 
  Marcher, 
  PartnerOrganization, 
  Vehicle,
  MarcherDayAssignment,
  OrganizationDayAssignment,
  VehicleDaySchedule,
  QueryFilters,
  PaginationParams,
  QueryResponse,
  SingleEntityResponse,
  MutationResponse
} from '@march-organizer/shared';

// In-memory storage (replace with database later)
class DataService {
  private marches: Map<string, March> = new Map();
  private marchDays: Map<string, MarchDay> = new Map();
  private marchers: Map<string, Marcher> = new Map();
  private organizations: Map<string, PartnerOrganization> = new Map();
  private vehicles: Map<string, Vehicle> = new Map();
  private marcherAssignments: Map<string, MarcherDayAssignment> = new Map();
  private organizationAssignments: Map<string, OrganizationDayAssignment> = new Map();
  private vehicleSchedules: Map<string, VehicleDaySchedule> = new Map();

  // Helper functions
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private createVersionedEntity<T extends { id: string }>(
    data: Omit<T, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>,
    userId: string = 'system'
  ): T & { version: number; createdAt: string; updatedAt: string; createdBy: string; updatedBy: string } {
    const now = new Date().toISOString();
    return {
      ...data,
      id: this.generateId(),
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
    } as T & { version: number; createdAt: string; updatedAt: string; createdBy: string; updatedBy: string };
  }

  private updateVersionedEntity<T extends { id: string; version: number; updatedAt: string; updatedBy: string }>(
    entity: T,
    updates: Partial<T>,
    userId: string = 'system'
  ): T {
    return {
      ...entity,
      ...updates,
      version: entity.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
    };
  }

  // March operations
  async createMarch(data: Omit<March, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>, userId?: string): Promise<SingleEntityResponse<March>> {
    const march = this.createVersionedEntity(data, userId);
    this.marches.set(march.id, march);
    
    return {
      data: march,
      success: true,
      message: 'March created successfully',
    };
  }

  async getMarch(id: string): Promise<SingleEntityResponse<March>> {
    const march = this.marches.get(id);
    if (!march || march.isDeleted) {
      return {
        data: null as any,
        success: false,
        message: 'March not found',
      };
    }
    
    return {
      data: march,
      success: true,
    };
  }

  async updateMarch(id: string, data: Partial<March>, userId?: string): Promise<SingleEntityResponse<March>> {
    const existing = this.marches.get(id);
    if (!existing || existing.isDeleted) {
      return {
        data: null as any,
        success: false,
        message: 'March not found',
      };
    }

    const updated = this.updateVersionedEntity(existing, data, userId);
    this.marches.set(id, updated);
    
    return {
      data: updated,
      success: true,
      message: 'March updated successfully',
    };
  }

  async deleteMarch(id: string, softDelete: boolean = true, userId?: string): Promise<MutationResponse> {
    const march = this.marches.get(id);
    if (!march) {
      return {
        success: false,
        message: 'March not found',
      };
    }

    if (softDelete) {
      const updated = this.updateVersionedEntity(march, { isDeleted: true }, userId);
      this.marches.set(id, updated);
    } else {
      this.marches.delete(id);
    }
    
    return {
      success: true,
      message: 'March deleted successfully',
    };
  }

  async listMarches(filters?: QueryFilters, pagination?: PaginationParams): Promise<QueryResponse<March>> {
    let marches = Array.from(this.marches.values())
      .filter(march => !march.isDeleted);

    // Apply filters
    if (filters?.includeDeleted === false) {
      marches = marches.filter(march => !march.isDeleted);
    }

    // Apply pagination
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedMarches = marches.slice(start, end);
    const result = {
      data: paginatedMarches,
      total: marches.length,
      page: page,
      limit: limit,
      hasMore: end < marches.length,
    };
    return result
  }

  // March Day operations
  async createMarchDay(data: Omit<MarchDay, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>, userId?: string): Promise<SingleEntityResponse<MarchDay>> {
    const day = this.createVersionedEntity(data, userId);
    this.marchDays.set(day.id, day);
    
    return {
      data: day,
      success: true,
      message: 'March day created successfully',
    };
  }

  async getMarchDay(id: string): Promise<SingleEntityResponse<MarchDay>> {
    const day = this.marchDays.get(id);
    if (!day || day.isDeleted) {
      return {
        data: null as any,
        success: false,
        message: 'March day not found',
      };
    }
    
    return {
      data: day,
      success: true,
    };
  }

  async listMarchDays(marchId: string, filters?: QueryFilters, pagination?: PaginationParams): Promise<QueryResponse<MarchDay>> {
    let days = Array.from(this.marchDays.values())
      .filter(day => day.marchId === marchId && !day.isDeleted);

    // Apply filters
    if (filters?.includeDeleted === false) {
      days = days.filter(day => !day.isDeleted);
    }

    // Apply pagination
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedDays = days.slice(start, end);

    return {
      data: paginatedDays,
      total: days.length,
      page,
      limit,
      hasMore: end < days.length,
    };
  }

  async updateMarchDay(id: string, data: Partial<MarchDay>, userId?: string): Promise<SingleEntityResponse<MarchDay>> {
    const existing = this.marchDays.get(id);
    if (!existing || existing.isDeleted) {
      return {
        data: null as any,
        success: false,
        message: 'March day not found',
      };
    }

    const updated = this.updateVersionedEntity(existing, data, userId);
    this.marchDays.set(id, updated);
    
    return {
      data: updated,
      success: true,
      message: 'March day updated successfully',
    };
  }

  async deleteMarchDay(id: string, softDelete: boolean = true, userId?: string): Promise<MutationResponse> {
    const day = this.marchDays.get(id);
    if (!day) {
      return {
        success: false,
        message: 'March day not found',
      };
    }

    if (softDelete) {
      const updated = this.updateVersionedEntity(day, { isDeleted: true }, userId);
      this.marchDays.set(id, updated);
    } else {
      this.marchDays.delete(id);
    }
    
    return {
      success: true,
      message: 'March day deleted successfully',
    };
  }

  // Marcher operations
  async createMarcher(data: Omit<Marcher, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>, userId?: string): Promise<SingleEntityResponse<Marcher>> {
    const marcher = this.createVersionedEntity(data, userId);
    this.marchers.set(marcher.id, marcher);
    
    return {
      data: marcher,
      success: true,
      message: 'Marcher created successfully',
    };
  }

  async getMarcher(id: string): Promise<SingleEntityResponse<Marcher>> {
    const marcher = this.marchers.get(id);
    if (!marcher || marcher.isDeleted) {
      return {
        data: null as any,
        success: false,
        message: 'Marcher not found',
      };
    }
    
    return {
      data: marcher,
      success: true,
    };
  }

  async listMarchers(marchId?: string, filters?: QueryFilters, pagination?: PaginationParams): Promise<QueryResponse<Marcher>> {
    let marchers = Array.from(this.marchers.values())
      .filter(marcher => !marcher.isDeleted);

    // Apply filters
    if (filters?.includeDeleted === false) {
      marchers = marchers.filter(marcher => !marcher.isDeleted);
    }

    // Apply pagination
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedMarchers = marchers.slice(start, end);

    return {
      data: paginatedMarchers,
      total: marchers.length,
      page,
      limit,
      hasMore: end < marchers.length,
    };
  }

  async updateMarcher(id: string, data: Partial<Marcher>, userId?: string): Promise<SingleEntityResponse<Marcher>> {
    const existing = this.marchers.get(id);
    if (!existing || existing.isDeleted) {
      return {
        data: null as any,
        success: false,
        message: 'Marcher not found',
      };
    }

    const updated = this.updateVersionedEntity(existing, data, userId);
    this.marchers.set(id, updated);
    
    return {
      data: updated,
      success: true,
      message: 'Marcher updated successfully',
    };
  }

  async deleteMarcher(id: string, softDelete: boolean = true, userId?: string): Promise<MutationResponse> {
    const marcher = this.marchers.get(id);
    if (!marcher) {
      return {
        success: false,
        message: 'Marcher not found',
      };
    }

    if (softDelete) {
      const updated = this.updateVersionedEntity(marcher, { isDeleted: true }, userId);
      this.marchers.set(id, updated);
    } else {
      this.marchers.delete(id);
    }
    
    return {
      success: true,
      message: 'Marcher deleted successfully',
    };
  }

  // Organization operations
  async createOrganization(data: Omit<PartnerOrganization, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>, userId?: string): Promise<SingleEntityResponse<PartnerOrganization>> {
    const org = this.createVersionedEntity(data, userId);
    this.organizations.set(org.id, org);
    
    return {
      data: org,
      success: true,
      message: 'Organization created successfully',
    };
  }

  async getOrganization(id: string): Promise<SingleEntityResponse<PartnerOrganization>> {
    const org = this.organizations.get(id);
    if (!org || org.isDeleted) {
      return {
        data: null as any,
        success: false,
        message: 'Organization not found',
      };
    }
    
    return {
      data: org,
      success: true,
    };
  }

  async listOrganizations(marchId?: string, filters?: QueryFilters, pagination?: PaginationParams): Promise<QueryResponse<PartnerOrganization>> {
    let orgs = Array.from(this.organizations.values())
      .filter(org => !org.isDeleted);

    // Apply filters
    if (filters?.includeDeleted === false) {
      orgs = orgs.filter(org => !org.isDeleted);
    }

    // Apply pagination
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedOrgs = orgs.slice(start, end);

    return {
      data: paginatedOrgs,
      total: orgs.length,
      page,
      limit,
      hasMore: end < orgs.length,
    };
  }

  async updateOrganization(id: string, data: Partial<PartnerOrganization>, userId?: string): Promise<SingleEntityResponse<PartnerOrganization>> {
    const existing = this.organizations.get(id);
    if (!existing || existing.isDeleted) {
      return {
        data: null as any,
        success: false,
        message: 'Organization not found',
      };
    }

    const updated = this.updateVersionedEntity(existing, data, userId);
    this.organizations.set(id, updated);
    
    return {
      data: updated,
      success: true,
      message: 'Organization updated successfully',
    };
  }

  async deleteOrganization(id: string, softDelete: boolean = true, userId?: string): Promise<MutationResponse> {
    const org = this.organizations.get(id);
    if (!org) {
      return {
        success: false,
        message: 'Organization not found',
      };
    }

    if (softDelete) {
      const updated = this.updateVersionedEntity(org, { isDeleted: true }, userId);
      this.organizations.set(id, updated);
    } else {
      this.organizations.delete(id);
    }
    
    return {
      success: true,
      message: 'Organization deleted successfully',
    };
  }

  // Vehicle operations
  async createVehicle(data: Omit<Vehicle, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>, userId?: string): Promise<SingleEntityResponse<Vehicle>> {
    const vehicle = this.createVersionedEntity(data, userId);
    this.vehicles.set(vehicle.id, vehicle);
    
    return {
      data: vehicle,
      success: true,
      message: 'Vehicle created successfully',
    };
  }

  async getVehicle(id: string): Promise<SingleEntityResponse<Vehicle>> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle || vehicle.isDeleted) {
      return {
        data: null as any,
        success: false,
        message: 'Vehicle not found',
      };
    }
    
    return {
      data: vehicle,
      success: true,
    };
  }

  async listVehicles(marchId?: string, filters?: QueryFilters, pagination?: PaginationParams): Promise<QueryResponse<Vehicle>> {
    let vehicles = Array.from(this.vehicles.values())
      .filter(vehicle => !vehicle.isDeleted);

    // Apply filters
    if (filters?.includeDeleted === false) {
      vehicles = vehicles.filter(vehicle => !vehicle.isDeleted);
    }

    // Apply pagination
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedVehicles = vehicles.slice(start, end);

    return {
      data: paginatedVehicles,
      total: vehicles.length,
      page,
      limit,
      hasMore: end < vehicles.length,
    };
  }

  async updateVehicle(id: string, data: Partial<Vehicle>, userId?: string): Promise<SingleEntityResponse<Vehicle>> {
    const existing = this.vehicles.get(id);
    if (!existing || existing.isDeleted) {
      return {
        data: null as any,
        success: false,
        message: 'Vehicle not found',
      };
    }

    const updated = this.updateVersionedEntity(existing, data, userId);
    this.vehicles.set(id, updated);
    
    return {
      data: updated,
      success: true,
      message: 'Vehicle updated successfully',
    };
  }

  async deleteVehicle(id: string, softDelete: boolean = true, userId?: string): Promise<MutationResponse> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) {
      return {
        success: false,
        message: 'Vehicle not found',
      };
    }

    if (softDelete) {
      const updated = this.updateVersionedEntity(vehicle, { isDeleted: true }, userId);
      this.vehicles.set(id, updated);
    } else {
      this.vehicles.delete(id);
    }
    
    return {
      success: true,
      message: 'Vehicle deleted successfully',
    };
  }

  // Relationship operations
  async createMarcherDayAssignment(data: Omit<MarcherDayAssignment, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>, userId?: string): Promise<SingleEntityResponse<MarcherDayAssignment>> {
    const assignment = this.createVersionedEntity(data, userId);
    this.marcherAssignments.set(assignment.id, assignment);
    
    return {
      data: assignment,
      success: true,
      message: 'Marcher day assignment created successfully',
    };
  }

  async listMarcherDayAssignments(dayId?: string, marcherId?: string): Promise<QueryResponse<MarcherDayAssignment>> {
    let assignments = Array.from(this.marcherAssignments.values())
      .filter(assignment => !assignment.isDeleted);

    if (dayId) {
      assignments = assignments.filter(assignment => assignment.dayId === dayId);
    }

    if (marcherId) {
      assignments = assignments.filter(assignment => assignment.marcherId === marcherId);
    }

    return {
      data: assignments,
      total: assignments.length,
      page: 1,
      limit: assignments.length,
      hasMore: false,
    };
  }

  async deleteMarcherDayAssignment(id: string, softDelete: boolean = true, userId?: string): Promise<MutationResponse> {
    const assignment = this.marcherAssignments.get(id);
    if (!assignment) {
      return {
        success: false,
        message: 'Marcher day assignment not found',
      };
    }

    if (softDelete) {
      const updated = this.updateVersionedEntity(assignment, { isDeleted: true }, userId);
      this.marcherAssignments.set(id, updated);
    } else {
      this.marcherAssignments.delete(id);
    }
    
    return {
      success: true,
      message: 'Marcher day assignment deleted successfully',
    };
  }

  async createOrganizationDayAssignment(data: Omit<OrganizationDayAssignment, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>, userId?: string): Promise<SingleEntityResponse<OrganizationDayAssignment>> {
    const assignment = this.createVersionedEntity(data, userId);
    this.organizationAssignments.set(assignment.id, assignment);
    
    return {
      data: assignment,
      success: true,
      message: 'Organization day assignment created successfully',
    };
  }

  async listOrganizationDayAssignments(dayId?: string, organizationId?: string): Promise<QueryResponse<OrganizationDayAssignment>> {
    let assignments = Array.from(this.organizationAssignments.values())
      .filter(assignment => !assignment.isDeleted);

    if (dayId) {
      assignments = assignments.filter(assignment => assignment.dayId === dayId);
    }

    if (organizationId) {
      assignments = assignments.filter(assignment => assignment.organizationId === organizationId);
    }

    return {
      data: assignments,
      total: assignments.length,
      page: 1,
      limit: assignments.length,
      hasMore: false,
    };
  }

  async deleteOrganizationDayAssignment(id: string, softDelete: boolean = true, userId?: string): Promise<MutationResponse> {
    const assignment = this.organizationAssignments.get(id);
    if (!assignment) {
      return {
        success: false,
        message: 'Organization day assignment not found',
      };
    }

    if (softDelete) {
      const updated = this.updateVersionedEntity(assignment, { isDeleted: true }, userId);
      this.organizationAssignments.set(id, updated);
    } else {
      this.organizationAssignments.delete(id);
    }
    
    return {
      success: true,
      message: 'Organization day assignment deleted successfully',
    };
  }

  async createVehicleDaySchedule(data: Omit<VehicleDaySchedule, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>, userId?: string): Promise<SingleEntityResponse<VehicleDaySchedule>> {
    const schedule = this.createVersionedEntity(data, userId);
    this.vehicleSchedules.set(schedule.id, schedule);
    
    return {
      data: schedule,
      success: true,
      message: 'Vehicle day schedule created successfully',
    };
  }

  async listVehicleDaySchedules(dayId?: string, vehicleId?: string): Promise<QueryResponse<VehicleDaySchedule>> {
    let schedules = Array.from(this.vehicleSchedules.values())
      .filter(schedule => !schedule.isDeleted);

    if (dayId) {
      schedules = schedules.filter(schedule => schedule.dayId === dayId);
    }

    if (vehicleId) {
      schedules = schedules.filter(schedule => schedule.vehicleId === vehicleId);
    }

    return {
      data: schedules,
      total: schedules.length,
      page: 1,
      limit: schedules.length,
      hasMore: false,
    };
  }

  async updateVehicleDaySchedule(id: string, data: Partial<VehicleDaySchedule>, userId?: string): Promise<SingleEntityResponse<VehicleDaySchedule>> {
    const existing = this.vehicleSchedules.get(id);
    if (!existing || existing.isDeleted) {
      return {
        data: null as any,
        success: false,
        message: 'Vehicle day schedule not found',
      };
    }

    const updated = this.updateVersionedEntity(existing, data, userId);
    this.vehicleSchedules.set(id, updated);
    
    return {
      data: updated,
      success: true,
      message: 'Vehicle day schedule updated successfully',
    };
  }

  async deleteVehicleDaySchedule(id: string, softDelete: boolean = true, userId?: string): Promise<MutationResponse> {
    const schedule = this.vehicleSchedules.get(id);
    if (!schedule) {
      return {
        success: false,
        message: 'Vehicle day schedule not found',
      };
    }

    if (softDelete) {
      const updated = this.updateVersionedEntity(schedule, { isDeleted: true }, userId);
      this.vehicleSchedules.set(id, updated);
    } else {
      this.vehicleSchedules.delete(id);
    }
    
    return {
      success: true,
      message: 'Vehicle day schedule deleted successfully',
    };
  }
}

export const dataService = new DataService(); 