import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './_apps';
import { initializeSampleData } from './utils/initData';
import { AuthService } from './services/authService';
import { AuthContext } from './types/auth';
import * as dotenv from 'dotenv';

const app = express();
const PORT = process.env.PORT || 3001;
dotenv.config();

// Authentication middleware
const createAuthContext = async (opts: { req: express.Request; res: express.Response }): Promise<AuthContext> => {
  try {
    const authHeader = opts.req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { isAuthenticated: false };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const payload = AuthService.verifyToken(token);
    const user = await AuthService.getUserById(payload.userId);

    if (!user) {
      return { isAuthenticated: false };
    }

    return {
      isAuthenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    return { isAuthenticated: false };
  }
};

// Custom request logging middleware
const requestLogger = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // Decode URL for better readability
  const decodedUrl = decodeURIComponent(req.url);
  
  // Log request details
  console.log(`\n📥 [${timestamp}] ${req.method} ${decodedUrl}`);
  console.log(`📍 From: ${req.ip} | User-Agent: ${req.get('User-Agent') || 'Unknown'}`);

  // Log headers (excluding sensitive ones)
  const headers = { ...req.headers };
  delete headers.authorization;
  delete headers.cookie;
  console.log('📋 Headers:');
  console.dir(headers, { depth: null, colors: true });

  // Log request body for non-GET requests
  if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Body:');
    console.dir(req.body, { depth: null, colors: true });
  }

  // Log query parameters (decoded)
  if (req.query && Object.keys(req.query).length > 0) {
    const decodedQuery: any = {};
    Object.keys(req.query).forEach(key => {
      const value = req.query[key];
      if (typeof value === 'string') {
        try {
          // Try to parse JSON if it looks like JSON
          if (value.startsWith('{') || value.startsWith('[')) {
            decodedQuery[key] = JSON.parse(decodeURIComponent(value));
          } else {
            decodedQuery[key] = decodeURIComponent(value);
          }
        } catch {
          decodedQuery[key] = decodeURIComponent(value);
        }
      } else if (Array.isArray(value)) {
        decodedQuery[key] = value.map(v => typeof v === 'string' ? decodeURIComponent(v) : v);
      } else {
        decodedQuery[key] = value;
      }
    });
    console.log('🔍 Query:');
    console.dir(decodedQuery, { depth: null, colors: true });
  }

  // Capture response details
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const statusEmoji = statusCode >= 200 && statusCode < 300 ? '✅' : 
                       statusCode >= 400 && statusCode < 500 ? '⚠️' : 
                       statusCode >= 500 ? '❌' : 'ℹ️';
    
    console.log(`📤 [${timestamp}] ${statusEmoji} ${req.method} ${decodedUrl} - ${statusCode} (${duration}ms)`);
    
    // Log response body for errors or if it's small
    if (statusCode >= 400 || (typeof data === 'string' && data.length < 1000)) {
      try {
        const parsed = JSON.parse(data);
        console.log('📄 Response:');
        console.dir(parsed, { depth: null, colors: true });
      } catch {
        console.log('📄 Response:');
        console.log(data);
      }
    }
    
    console.log(`⏱️  Total time: ${duration}ms\n`);
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Middleware
app.use(helmet());

// CORS configuration for development
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174', 
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
  'http://localhost:5179',
  'http://localhost:5180',
  process.env.CLIENT_URL
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // Log blocked origins for debugging
    console.log(`🚫 CORS blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Pragma'],
}));

// Use custom request logger instead of morgan
app.use(requestLogger);

// Keep morgan for additional logging if needed
app.use(morgan('combined'));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// tRPC middleware with authentication context
app.use('/trpc', createExpressMiddleware({
  router: appRouter,
  createContext: createAuthContext,
}));

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error:', err);
  console.error('📍 Request URL:', req.url);
  console.error('📍 Request Method:', req.method);
  console.error('📍 Request Headers:', req.headers);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`🔍 404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 tRPC API available at http://localhost:${PORT}/trpc`);
  console.log(`🏥 Health check at http://localhost:${PORT}/health`);
  console.log(`📊 Request logging enabled - all requests will be logged with detailed information`);
  console.log(`🌐 CORS enabled for origins:`, allowedOrigins);
  console.log(`🔧 Environment CLIENT_URL: ${process.env.CLIENT_URL || 'not set'}`);
  console.log(`🔐 Authentication enabled - JWT tokens required for protected endpoints`);
  console.log(`👤 Default admin user: admin@marchplanner.com / admin123\n`);
  console.log(`The connection URL is ${process.env.DATABASE_URL}`);
  
  // Initialize sample data
  await initializeSampleData();
}); 