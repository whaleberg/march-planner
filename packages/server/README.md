# March Planner Server

A modern tRPC server implementation for the March Planner application with versioned data and separate relationship objects.

## Features

- **tRPC API**: Type-safe API with end-to-end TypeScript support
- **Versioned Data**: Every entity change creates a new version with audit trail
- **Separate Relationships**: Many-to-many relationships as separate objects
- **In-Memory Storage**: Fast development with in-memory data (easily replaceable with database)
- **Sample Data**: Automatic initialization of sample data for testing

## Architecture

### Data Structure

The server implements a versioned data architecture with the following entities:

- **March**: Main march information (title, description, dates, etc.)
- **MarchDay**: Individual days of the march with routes and schedules
- **Marcher**: People participating in the march
- **PartnerOrganization**: Organizations supporting the march
- **Vehicle**: Support vehicles for the march

### Relationship Objects

Instead of embedding relationships in entities, the server uses separate relationship objects:

- **MarcherDayAssignment**: Links marchers to specific days
- **OrganizationDayAssignment**: Links organizations to specific days
- **VehicleDaySchedule**: Links vehicles to specific days with schedules

### Versioning

Every entity includes versioning information:
- `version`: Incremental version number
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp
- `createdBy`: User who created the entity
- `updatedBy`: User who last updated the entity
- `isDeleted`: Soft delete flag

## API Endpoints

### March Routes
- `march.getById` - Get march by ID
- `march.create` - Create new march
- `march.update` - Update march
- `march.delete` - Delete march (soft delete by default)

### March Days Routes
- `marchDays.getById` - Get march day by ID
- `marchDays.list` - List march days with pagination and filters
- `marchDays.create` - Create new march day
- `marchDays.update` - Update march day
- `marchDays.delete` - Delete march day

### Marchers Routes
- `marchers.getById` - Get marcher by ID
- `marchers.list` - List marchers with pagination and filters
- `marchers.create` - Create new marcher
- `marchers.update` - Update marcher
- `marchers.delete` - Delete marcher

### Organizations Routes
- `organizations.getById` - Get organization by ID
- `organizations.list` - List organizations with pagination and filters
- `organizations.create` - Create new organization
- `organizations.update` - Update organization
- `organizations.delete` - Delete organization

### Vehicles Routes
- `vehicles.getById` - Get vehicle by ID
- `vehicles.list` - List vehicles with pagination and filters
- `vehicles.create` - Create new vehicle
- `vehicles.update` - Update vehicle
- `vehicles.delete` - Delete vehicle

### Assignments Routes
- `assignments.marcherDay` - List marcher-day assignments
- `assignments.createMarcherDay` - Create marcher-day assignment
- `assignments.deleteMarcherDay` - Delete marcher-day assignment
- `assignments.organizationDay` - List organization-day assignments
- `assignments.createOrganizationDay` - Create organization-day assignment
- `assignments.deleteOrganizationDay` - Delete organization-day assignment

### Schedules Routes
- `schedules.vehicleDay` - List vehicle-day schedules
- `schedules.createVehicleDay` - Create vehicle-day schedule
- `schedules.updateVehicleDay` - Update vehicle-day schedule
- `schedules.deleteVehicleDay` - Delete vehicle-day schedule

## Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start development server
npm run dev

# Start production server
npm start
```

## Environment Variables

- `PORT`: Server port (default: 3001)
- `CLIENT_URL`: Client URL for CORS (default: http://localhost:5173)

## Development

### Project Structure

```
src/
├── routers/           # tRPC routers
│   ├── march.router.ts
│   ├── marchDays.router.ts
│   ├── marchers.router.ts
│   ├── organizations.router.ts
│   ├── vehicles.router.ts
│   ├── assignments.router.ts
│   └── schedules.router.ts
├── services/          # Business logic
│   └── dataService.ts
├── types/             # Type definitions
│   └── versioned.ts
├── utils/             # Utilities
│   └── initData.ts
├── _apps.ts           # Main router
├── server.ts          # Express server
├── trpc.ts            # tRPC configuration
└── index.ts           # Type exports
```

### Adding New Routes

1. Create a new router file in `src/routers/`
2. Define the router with tRPC procedures
3. Add the router to the main app router in `src/_apps.ts`
4. Update the client types if needed

### Data Validation

All input data is validated using Zod schemas defined in `src/types/versioned.ts`. The schemas ensure:

- Required fields are present
- Email addresses are valid
- URLs are properly formatted
- Enums have valid values
- Numbers are within acceptable ranges

### Error Handling

The server includes comprehensive error handling:

- Input validation errors
- Not found errors
- Internal server errors
- Proper HTTP status codes

## Testing

The server automatically initializes sample data on startup, including:

- 1 sample march
- 3 sample marchers
- 2 sample organizations
- 2 sample vehicles
- 2 sample march days
- Complete relationship assignments

You can test the API using the tRPC client or by making HTTP requests to the endpoints.

## Production Considerations

For production deployment, consider:

1. **Database**: Replace in-memory storage with a proper database (PostgreSQL, MongoDB, etc.)
2. **Authentication**: Add user authentication and authorization
3. **Rate Limiting**: Implement rate limiting for API endpoints
4. **Logging**: Add structured logging
5. **Monitoring**: Add health checks and monitoring
6. **Caching**: Implement caching for frequently accessed data
7. **Backup**: Set up data backup and recovery procedures

## Migration from Monolithic API

This server represents a migration from the previous monolithic API to individual data streams. The benefits include:

- **Better Performance**: Individual queries with intelligent caching
- **Type Safety**: End-to-end TypeScript support
- **Scalability**: Each entity can be optimized independently
- **Flexibility**: Relationships can be managed separately
- **Versioning**: Full audit trail and version history

## License

MIT 