import { VersionedEntity } from "./types";

// Helper function to create a new versioned entity
export function createVersionedEntity<T extends Record<string, any>>(
  data: T,
  userId: string = 'system'
): T & VersionedEntity {
  const now = new Date().toISOString();
  return {
    ...data,
    id: generateId(),
    version: 1,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
    updatedBy: userId,
  };
}

// Helper function to update a versioned entity
export function updateVersionedEntity<T extends VersionedEntity>(
  entity: T,
  updates: Partial<Omit<T, keyof VersionedEntity>>,
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

// Helper function to soft delete a versioned entity
export function softDeleteEntity<T extends VersionedEntity>(
  entity: T,
  userId: string = 'system'
): T {
  return {
    ...entity,
    isDeleted: true,
    version: entity.version + 1,
    updatedAt: new Date().toISOString(),
    updatedBy: userId,
  };
}

// Simple ID generator (in production, use a proper UUID library)
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Helper function to check if an entity is deleted
export function isDeleted(entity: VersionedEntity): boolean {
  return entity.isDeleted === true;
}

// Helper function to filter out deleted entities
export function filterDeleted<T extends VersionedEntity>(entities: T[]): T[] {
  return entities.filter(entity => !isDeleted(entity));
}


