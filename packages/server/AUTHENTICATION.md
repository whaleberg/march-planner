# Authentication System

This document describes the authentication system implemented for the March Planner API.

## Overview

The authentication system provides:
- JWT-based authentication
- Role-based access control (RBAC)
- User management
- Protected API endpoints

## User Roles

The system supports four user roles with hierarchical permissions:

1. **VIEWER** (Level 1) - Can view data
2. **VOLUNTEER** (Level 2) - Can view and manage basic data
3. **ORGANIZER** (Level 3) - Can view, create, and update data
4. **ADMIN** (Level 4) - Full access to all features including user management

## Authentication Flow

### 1. Registration
```typescript
// Register a new user
const result = await trpc.auth.register.mutate({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
  role: 'volunteer' // Optional, defaults to 'volunteer'
});
```

### 2. Login
```typescript
// Login and get JWT token
const result = await trpc.auth.login.mutate({
  email: 'user@example.com',
  password: 'password123'
});

const { token, user } = result;
// Store token in localStorage or secure storage
```

### 3. Using Protected Endpoints
```typescript
// Include token in Authorization header
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

// Make authenticated requests
const marches = await trpc.march.list.query({}, { headers });
```

## API Endpoints

### Public Endpoints (No Authentication Required)
- `auth.register` - Register new user
- `auth.login` - Login user
- `auth.verifyToken` - Verify JWT token

### Protected Endpoints (Authentication Required)

#### Viewer+ Access (All authenticated users)
- `auth.me` - Get current user profile
- `auth.updateProfile` - Update own profile
- `auth.changePassword` - Change own password
- `march.getById` - Get march by ID
- `march.list` - List marches
- `organizations.getById` - Get organization by ID
- `organizations.list` - List organizations
- All other `getById` and `list` endpoints

#### Organizer+ Access (Organizer and Admin)
- `march.create` - Create new march
- `march.update` - Update march
- `organizations.create` - Create organization
- `organizations.update` - Update organization
- All other `create` and `update` endpoints

#### Admin Only Access
- `auth.listUsers` - List all users
- `auth.getUserById` - Get user by ID
- `auth.updateUser` - Update any user
- `auth.deleteUser` - Delete user
- `march.delete` - Delete march
- `organizations.delete` - Delete organization
- All other `delete` endpoints

## Default Admin User

A default admin user is automatically created when the server starts:

- **Email**: `admin@marchplanner.com`
- **Password**: `admin123`
- **Role**: `ADMIN`

⚠️ **Important**: Change the default admin password in production!

## Environment Variables

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3001
CLIENT_URL=http://localhost:5173
```

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt with salt rounds of 10
2. **JWT Tokens**: Secure token-based authentication with configurable expiration
3. **Role-Based Access**: Hierarchical permission system
4. **Input Validation**: All inputs are validated using Zod schemas
5. **CORS Protection**: Configured CORS with allowed origins
6. **Helmet Security**: Security headers via Helmet middleware

## Testing the Authentication System

Run the test script to verify the authentication system:

```bash
cd packages/server
node test-auth.js
```

This will test:
- Protected endpoint access without authentication
- User registration
- User login
- Protected endpoint access with authentication
- Role-based access control
- Admin functionality

## Client-Side Integration

### Setting up tRPC client with authentication

```typescript
import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';

const trpc = createTRPCReact<AppRouter>();

// Create client with authentication
const client = trpc.createClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:3001/trpc',
      headers: () => {
        const token = localStorage.getItem('authToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});
```

### Authentication Context (React)

```typescript
import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email: string, password: string) => {
    const result = await trpc.auth.login.mutate({ email, password });
    localStorage.setItem('authToken', result.token);
    setUser(result.user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Check token on app load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      trpc.auth.verifyToken.query({ token })
        .then((result) => {
          if (result.valid && result.user) {
            setUser(result.user);
            setIsAuthenticated(true);
          } else {
            logout();
          }
        })
        .catch(() => logout());
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

## Production Considerations

1. **Database**: Replace in-memory storage with a proper database (PostgreSQL, MongoDB, etc.)
2. **JWT Secret**: Use a strong, randomly generated JWT secret
3. **Password Policy**: Implement password strength requirements
4. **Rate Limiting**: Add rate limiting for login attempts
5. **Session Management**: Consider implementing refresh tokens
6. **Audit Logging**: Log authentication events for security monitoring
7. **HTTPS**: Always use HTTPS in production
8. **Token Storage**: Use secure token storage (httpOnly cookies for web apps)

## Error Handling

The authentication system provides clear error messages:

- `UNAUTHORIZED`: User is not authenticated
- `FORBIDDEN`: User lacks required permissions
- `BAD_REQUEST`: Invalid input data
- `INTERNAL_SERVER_ERROR`: Server-side errors

## Migration from Public Endpoints

To migrate existing endpoints to use authentication:

1. Replace `publicProcedure` with appropriate protected procedure:
   - `protectedProcedure` for viewer+ access
   - `organizerProcedure` for organizer+ access
   - `adminProcedure` for admin-only access

2. Update client code to include authentication headers

3. Test all endpoints with different user roles

Example migration:
```typescript
// Before
export const marchRouter = router({
  list: publicProcedure.query(async () => {
    return await dataService.listMarches();
  }),
});

// After
export const marchRouter = router({
  list: protectedProcedure.query(async () => {
    return await dataService.listMarches();
  }),
});
``` 