// Generic entity mapping utilities for handling relationships between entities

// Base interface for relationship objects
export interface RelationshipEntity {
  id: string;
  marchId: string;
  dayId: string;
  isDeleted?: boolean;
}

// Specific relationship types
export interface MarcherDayAssignment extends RelationshipEntity {
  marcherId: string;
  role?: 'participant' | 'organizer' | 'support';
  notes?: string;
}

export interface OrganizationDayAssignment extends RelationshipEntity {
  organizationId: string;
  role?: 'host' | 'supporter' | 'sponsor';
  contribution?: string;
  notes?: string;
}

export interface VehicleDaySchedule extends RelationshipEntity {
  vehicleId: string;
  startTime: string;
  endTime: string;
  route: string;
  purpose: string;
  driver: string;
  notes?: string;
}

// Generic mapping result interface
export interface EntityMappingResult<TEntity, TRelationship> {
  entity: TEntity;
  relationship: TRelationship;
}

// Generic function to map entities based on relationships
export function mapEntitiesByRelationships<
  TEntity extends { id: string },
  TRelationship extends RelationshipEntity
>(
  entities: TEntity[],
  relationships: TRelationship[],
  entityIdKey: keyof TRelationship & string,
  filterOptions?: {
    dayId?: string;
    marchId?: string;
    includeDeleted?: boolean;
  }
): EntityMappingResult<TEntity, TRelationship>[] {
  // Filter relationships based on options
  let filteredRelationships = relationships;
  
  if (filterOptions?.includeDeleted === false) {
    filteredRelationships = filteredRelationships.filter(rel => !rel.isDeleted);
  }
  
  if (filterOptions?.dayId) {
    filteredRelationships = filteredRelationships.filter(rel => rel.dayId === filterOptions.dayId);
  }
  
  if (filterOptions?.marchId) {
    filteredRelationships = filteredRelationships.filter(rel => rel.marchId === filterOptions.marchId);
  }

  // Create a map of entities by ID for efficient lookup
  const entityMap = new Map<string, TEntity>();
  entities.forEach(entity => entityMap.set(entity.id, entity));

  // Map relationships to entities
  const results: EntityMappingResult<TEntity, TRelationship>[] = [];
  
  filteredRelationships.forEach(relationship => {
    const entityId = relationship[entityIdKey] as string;
    const entity = entityMap.get(entityId);
    
    if (entity) {
      results.push({ entity, relationship });
    }
  });

  return results;
}

// Specialized functions for each relationship type
export function mapMarchersByAssignments(
  marchers: Array<{ id: string; [key: string]: any }>,
  assignments: MarcherDayAssignment[],
  filterOptions?: {
    dayId?: string;
    marchId?: string;
    includeDeleted?: boolean;
  }
): EntityMappingResult<typeof marchers[0], MarcherDayAssignment>[] {
  return mapEntitiesByRelationships(marchers, assignments, 'marcherId', filterOptions);
}

export function mapOrganizationsByAssignments(
  organizations: Array<{ id: string; [key: string]: any }>,
  assignments: OrganizationDayAssignment[],
  filterOptions?: {
    dayId?: string;
    marchId?: string;
    includeDeleted?: boolean;
  }
): EntityMappingResult<typeof organizations[0], OrganizationDayAssignment>[] {
  return mapEntitiesByRelationships(organizations, assignments, 'organizationId', filterOptions);
}

export function mapVehiclesBySchedules(
  vehicles: Array<{ id: string; [key: string]: any }>,
  schedules: VehicleDaySchedule[],
  filterOptions?: {
    dayId?: string;
    marchId?: string;
    includeDeleted?: boolean;
  }
): EntityMappingResult<typeof vehicles[0], VehicleDaySchedule>[] {
  return mapEntitiesByRelationships(vehicles, schedules, 'vehicleId', filterOptions);
}

// Helper function to get unique entities (removing duplicates)
export function getUniqueEntities<
  TEntity extends { id: string },
  TRelationship extends RelationshipEntity
>(
  mappings: EntityMappingResult<TEntity, TRelationship>[],
  entityIdKey: keyof TRelationship & string
): TEntity[] {
  const seenIds = new Set<string>();
  const uniqueEntities: TEntity[] = [];
  
  mappings.forEach(mapping => {
    const entityId = mapping.relationship[entityIdKey] as string;
    if (!seenIds.has(entityId)) {
      seenIds.add(entityId);
      uniqueEntities.push(mapping.entity);
    }
  });
  
  return uniqueEntities;
}

// Helper function to get entities for a specific day
export function getEntitiesForDay<
  TEntity extends { id: string },
  TRelationship extends RelationshipEntity
>(
  entities: TEntity[],
  relationships: TRelationship[],
  dayId: string,
  entityIdKey: keyof TRelationship & string,
  includeDeleted = false
): TEntity[] {
  const mappings = mapEntitiesByRelationships(entities, relationships, entityIdKey, {
    dayId,
    includeDeleted
  });
  
  return getUniqueEntities(mappings, entityIdKey);
}

// Helper function to get relationships for a specific day
export function getRelationshipsForDay<TRelationship extends RelationshipEntity>(
  relationships: TRelationship[],
  dayId: string,
  includeDeleted = false
): TRelationship[] {
  let filtered = relationships.filter(rel => rel.dayId === dayId);
  
  if (!includeDeleted) {
    filtered = filtered.filter(rel => !rel.isDeleted);
  }
  
  return filtered;
}

// Helper function to get entity by ID with fallback
export function getEntityById<TEntity extends { id: string }>(
  entities: TEntity[],
  id: string
): TEntity | undefined {
  return entities.find(entity => entity.id === id);
}

// Helper function to create a lookup map for entities
export function createEntityMap<TEntity extends { id: string }>(
  entities: TEntity[]
): Map<string, TEntity> {
  return new Map(entities.map(entity => [entity.id, entity]));
} 