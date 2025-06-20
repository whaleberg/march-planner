# March Organizer - Deployment Guide

This guide explains how to deploy your March Organizer app from a local development environment to a hosted solution.

## Overview

The app has been designed to work with both local storage (for development) and remote APIs (for production). The `apiService` automatically switches between modes based on environment variables.

## Deployment Options

### Option 1: Simple File-Based Backend (Recommended for small projects)

**Best for:** Small organizations, single-user scenarios, simple deployments

**What you get:**
- Express.js server with file-based storage
- No database setup required
- Easy to deploy on any hosting platform
- Data stored as JSON files

**Steps:**
1. Use the provided `server/` directory
2. Deploy to platforms like Heroku, Railway, or DigitalOcean
3. Set environment variables in your frontend

### Option 2: Database Backend (Recommended for production)

**Best for:** Multiple users, production applications, data integrity requirements

**What you need:**
- Backend server (Node.js/Express, Python/Django, etc.)
- Database (PostgreSQL, MongoDB, etc.)
- Authentication system (optional)

### Option 3: Serverless Solutions

**Firebase/Supabase:** Real-time database with built-in auth
**Vercel/Netlify:** Static hosting with serverless functions
**AWS/GCP:** Full cloud infrastructure

## Quick Start: File-Based Backend

### 1. Set up the Backend Server

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start the server
npm start
```

The server will run on `http://localhost:3001`

### 2. Configure the Frontend

Create a `.env` file in your project root:

```env
# For development (local storage)
VITE_USE_LOCAL_STORAGE=true

# For production (API backend)
VITE_API_BASE_URL=http://localhost:3001
VITE_USE_LOCAL_STORAGE=false
```

### 3. Build and Deploy

```bash
# Build the frontend
npm run build

# Deploy the built files to your hosting platform
# Deploy the server to your backend hosting platform
```

## Deployment Platforms

### Frontend Hosting

**Vercel (Recommended):**
```bash
npm install -g vercel
vercel
```

**Netlify:**
- Drag and drop your `dist/` folder
- Or connect your GitHub repository

**GitHub Pages:**
- Push to GitHub
- Enable GitHub Pages in repository settings

### Backend Hosting

**Railway (Recommended):**
- Connect your GitHub repository
- Railway will auto-detect and deploy your Node.js app

**Heroku:**
```bash
heroku create your-app-name
git push heroku main
```

**DigitalOcean App Platform:**
- Connect your repository
- Select Node.js as the environment

## Environment Variables

### Frontend (.env)
```env
# API Configuration
VITE_API_BASE_URL=https://your-backend-url.com
VITE_USE_LOCAL_STORAGE=false

# Google Maps (if using)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Backend (.env)
```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Optional: Database URL (if using database)
DATABASE_URL=your_database_url
```

## Database Options (Advanced)

### PostgreSQL with Prisma

1. Install Prisma:
```bash
npm install prisma @prisma/client
npx prisma init
```

2. Define your schema in `prisma/schema.prisma`:
```prisma
model MarchData {
  id        String   @id @default(cuid())
  data      Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

3. Update the server to use Prisma instead of file storage.

### MongoDB with Mongoose

1. Install dependencies:
```bash
npm install mongoose
```

2. Create models and update server endpoints.

## Security Considerations

### For Production

1. **HTTPS:** Always use HTTPS in production
2. **CORS:** Configure CORS properly for your domain
3. **Rate Limiting:** Add rate limiting to prevent abuse
4. **Input Validation:** Validate all API inputs
5. **Authentication:** Consider adding user authentication

### Example Security Middleware

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## Monitoring and Logging

### Basic Logging
The server includes Morgan for HTTP logging. For production, consider:

- **Winston** for structured logging
- **Sentry** for error tracking
- **New Relic** for performance monitoring

### Health Checks
The server includes a health check endpoint at `/health` for monitoring.

## Backup Strategy

### File-Based Storage
- Regular backups of the `data/` directory
- Version control for data files
- Automated backup scripts

### Database Storage
- Database backup schedules
- Point-in-time recovery
- Cross-region replication

## Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Ensure your backend CORS configuration includes your frontend domain
   - Check that `VITE_API_BASE_URL` is correct

2. **Data Not Saving:**
   - Check server logs for errors
   - Verify file permissions on the server
   - Ensure the data directory exists

3. **Build Errors:**
   - Check that all environment variables are set
   - Verify TypeScript compilation

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=true
NODE_ENV=development
```

## Next Steps

1. **Authentication:** Add user login/signup
2. **Multi-tenancy:** Support multiple organizations
3. **Real-time updates:** WebSocket integration
4. **Mobile app:** React Native version
5. **Advanced features:** Route optimization, weather integration

## Support

For deployment issues:
1. Check the server logs
2. Verify environment variables
3. Test API endpoints with tools like Postman
4. Check hosting platform documentation 