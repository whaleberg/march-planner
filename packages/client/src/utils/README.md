# Entity Mapping Utilities

This directory contains generic utility functions for handling relationships between entities in the March Planner application.

## Overview

Since we pulled the relationships between entities into their own structures, we now have multiple places where we need to take two sets of entities and create a mapping between them based on a list of relationships. These utilities provide generic functions to handle this pattern and reduce code duplication.

## Key Functions

### Core Mapping Functions

- `mapEntitiesByRelationships<TEntity, TRelationship>()` - Generic function to map entities based on relationships
- `mapMarchersByAssignments()` - Specialized function for mapping marchers to day assignments
- `mapOrganizationsByAssignments()` - Specialized function for mapping organizations to day assignments
- `mapVehiclesBySchedules()` - Specialized function for mapping vehicles to day schedules

### Helper Functions

- `getUniqueEntities()` - Remove duplicate entities from mapping results
- `getEntitiesForDay()` - Get all entities for a specific day
- `getRelationshipsForDay()` - Get all relationships for a specific day
- `getEntityById()` - Find an entity by ID with fallback
- `createEntityMap()` - Create a lookup map for efficient entity access

## Usage Examples

### Before (Manual Filtering)
```typescript
// Get marchers for a specific day
const dayMarchers = marcherAssignments?.data || [];
const marchers = marchersData?.data || [];

// Manual deduplication
const uniqueDayMarchers = dayMarchers.filter((assignment, index, self) => 
  index === self.findIndex(a => a.marcherId === assignment.marcherId)
);

// Manual entity lookup
const getMarcherById = (marcherId: string) => {
  return marchers.find(m => m.id === marcherId);
};
```

### After (Using Generic Utilities)
```typescript
// Get marchers for a specific day using generic functions
const dayMarchers = marcherAssignments?.data || [];
const marchers = marchersData?.data || [];

// Use generic mapping functions
const marcherMappings = mapMarchersByAssignments(marchers, dayMarchers, { dayId });
const uniqueDayMarchers = marcherMappings.filter((mapping, index, self) => 
  index === self.findIndex(m => m.relationship.marcherId === mapping.relationship.marcherId)
).map(mapping => mapping.relationship);

// Use generic entity lookup
const getMarcherById = (marcherId: string) => {
  return getEntityById(marchers, marcherId);
};
```

## Benefits

1. **Reduced Code Duplication** - Common patterns are now centralized in reusable functions
2. **Type Safety** - Generic functions provide better TypeScript support
3. **Consistency** - All entity mapping follows the same pattern across the application
4. **Maintainability** - Changes to mapping logic only need to be made in one place
5. **Performance** - Efficient entity lookup using Map data structures

## Future Improvements

- Move these utilities to the shared package once export issues are resolved
- Add more specialized mapping functions for other entity types
- Add caching mechanisms for frequently accessed mappings
- Add validation and error handling for edge cases 