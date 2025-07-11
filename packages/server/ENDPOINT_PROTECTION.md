# Endpoint Protection Strategy

This document outlines the authentication and authorization requirements for all API endpoints in the March Planner system.

## Protection Levels

- **PUBLIC**: No authentication required
- **PROTECTED**: Authentication required (any authenticated user)
- **ORGANIZER+**: Authentication + Organizer or Admin role required
- **ADMIN**: Authentication + Admin role only

## Endpoint Protection Summary

### Public Endpoints (No Authentication Required)

These endpoints provide public information about the march that anyone can access:

#### March Router
- `march.getById` - Get march details (route information is public)
- `march.list` - List all marches (route information is public)

#### MarchDays Router  
- `marchDays.getById` - Get march day details (days are public)
- `marchDays.list` - List march days for a march (days are public)

#### Organizations Router
- `organizations.getById` - Get organization details (partner organizations are public)
- `organizations.list` - List organizations (partner organizations are public)

### Protected Endpoints (Authentication Required)

These endpoints require authentication but are available to all authenticated users:

#### Auth Router
- `auth.me` - Get current user profile
- `auth.updateProfile` - Update own profile
- `auth.changePassword` - Change own password

#### Marchers Router (All endpoints protected - personal data is private)
- `marchers.getById` - Get marcher details
- `marchers.list` - List marchers
- `marchers.create` - Create new marcher (organizer+)
- `marchers.update` - Update marcher (organizer+)
- `marchers.delete` - Delete marcher (admin only)

#### Assignments Router (All endpoints protected - reveals personal info)
- `assignments.marcherDay` - Get marcher-day assignments
- `assignments.createMarcherDay` - Create marcher-day assignment (organizer+)
- `assignments.deleteMarcherDay` - Delete marcher-day assignment (admin only)
- `assignments.organizationDay` - Get organization-day assignments
- `assignments.createOrganizationDay` - Create organization-day assignment (organizer+)
- `assignments.deleteOrganizationDay` - Delete organization-day assignment (admin only)

#### Vehicles Router (All endpoints protected - operational info)
- `vehicles.getById` - Get vehicle details
- `vehicles.list` - List vehicles
- `vehicles.create` - Create new vehicle (organizer+)
- `vehicles.update` - Update vehicle (organizer+)
- `vehicles.delete` - Delete vehicle (admin only)

#### Schedules Router (All endpoints protected - operational info)
- `schedules.vehicleDay` - Get vehicle-day schedules
- `schedules.createVehicleDay` - Create vehicle-day schedule (organizer+)
- `schedules.updateVehicleDay` - Update vehicle-day schedule (organizer+)
- `schedules.deleteVehicleDay` - Delete vehicle-day schedule (admin only)

### Organizer+ Endpoints (Organizer or Admin Role Required)

These endpoints require organizer or admin privileges:

#### March Router
- `march.create` - Create new march
- `march.update` - Update march

#### MarchDays Router
- `marchDays.create` - Create new march day
- `marchDays.update` - Update march day

#### Organizations Router
- `organizations.create` - Create new organization
- `organizations.update` - Update organization

#### Marchers Router
- `marchers.create` - Create new marcher
- `marchers.update` - Update marcher

#### Assignments Router
- `assignments.createMarcherDay` - Create marcher-day assignment
- `assignments.createOrganizationDay` - Create organization-day assignment

#### Vehicles Router
- `vehicles.create` - Create new vehicle
- `vehicles.update` - Update vehicle

#### Schedules Router
- `schedules.createVehicleDay` - Create vehicle-day schedule
- `schedules.updateVehicleDay` - Update vehicle-day schedule

### Admin-Only Endpoints (Admin Role Required)

These endpoints require admin privileges:

#### Auth Router
- `auth.listUsers` - List all users
- `auth.getUserById` - Get user by ID
- `auth.updateUser` - Update any user
- `auth.deleteUser` - Delete user

#### March Router
- `march.delete` - Delete march

#### MarchDays Router
- `marchDays.delete` - Delete march day

#### Organizations Router
- `organizations.delete` - Delete organization

#### Marchers Router
- `marchers.delete` - Delete marcher

#### Assignments Router
- `assignments.deleteMarcherDay` - Delete marcher-day assignment
- `assignments.deleteOrganizationDay` - Delete organization-day assignment

#### Vehicles Router
- `vehicles.delete` - Delete vehicle

#### Schedules Router
- `schedules.deleteVehicleDay` - Delete vehicle-day schedule

## Data Privacy Considerations

### Public Data (No Authentication Required)
- **March Information**: Title, description, dates, mission statement, call to action, itinerary
- **Route Information**: Start/end points, waypoints, coordinates, estimated times
- **March Days**: Date, route details, meal locations/times, special events, daily organizer contact
- **Partner Organizations**: Name, description, website, contact information, logo

### Private Data (Authentication Required)
- **Marcher Information**: Name, email, phone, emergency contact, dietary restrictions, notes, medic/peacekeeper status
- **Assignments**: Who is assigned to which days, roles, notes
- **Vehicles**: Driver information, license plates, capacity, operational notes
- **Schedules**: Detailed vehicle schedules, routes, purposes, driver assignments

## Future Considerations

### Summary APIs (To Be Added)
For public overview pages, we may need to add separate APIs that provide:
- Total marcher counts per day (without personal details)
- Overall march statistics
- Public summaries of assignments and schedules

### Data Redaction
Consider implementing data redaction for sensitive fields in public endpoints:
- Remove personal contact information from public day details
- Redact internal notes and operational details
- Filter out sensitive assignment information

## Role Hierarchy

1. **VIEWER** (Level 1) - Can view protected data
2. **VOLUNTEER** (Level 2) - Can view and manage basic data
3. **ORGANIZER** (Level 3) - Can view, create, and update data
4. **ADMIN** (Level 4) - Full access including user management and deletions

## Testing the Protection

Use the test script to verify protection levels:

```bash
cd packages/server
node test-auth.js
```

This will test:
- Public endpoint access without authentication
- Protected endpoint access with authentication
- Role-based access control
- Admin functionality

## Client Integration

When integrating with the client:

1. **Public endpoints**: Can be called without authentication
2. **Protected endpoints**: Require JWT token in Authorization header
3. **Role-based endpoints**: Check user role before making requests
4. **Error handling**: Handle 401 (Unauthorized) and 403 (Forbidden) responses appropriately 