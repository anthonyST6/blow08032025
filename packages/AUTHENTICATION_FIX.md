# Authentication Fix Documentation

## Problem Summary
The API requests were failing because of a token format mismatch between the frontend and backend in development mode:
- Frontend was generating simple mock tokens like `mock-token-{timestamp}`
- Backend was expecting proper JWT tokens with specific claims

## Root Cause
The authentication failure was caused by:
1. Frontend mock auth service generating non-JWT tokens
2. Backend trying to validate these as Firebase ID tokens
3. Missing JWT structure causing "Firebase ID token has no 'kid' claim" errors

## Solution Implemented

### 1. Updated Frontend Mock Auth Service
Modified `packages/frontend/src/services/auth.mock.ts` to:
- Make actual HTTP requests to backend dev auth endpoints
- Store and use proper JWT tokens returned by the backend
- Fall back to local mock JWT generation if backend is unavailable

### 2. Created Minimal Backend Server
Created `packages/backend/src/index-minimal.ts` to bypass missing dependencies:
- Includes only essential middleware (CORS, body parsing)
- Mounts development auth routes at `/api/auth`
- Provides endpoints: `/api/auth/dev-login` and `/api/auth/dev-register`

### 3. Backend Dev Auth Service
The backend's `packages/backend/src/services/auth.dev.ts` provides:
- Mock user database with predefined users
- JWT token generation with proper structure
- Token validation for protected routes

## How to Run

### Start the Backend (Minimal Version)
```bash
cd packages/backend
set NODE_ENV=development
npx ts-node src/index-minimal.ts
```

### Start the Frontend
```bash
cd packages/frontend
npm run dev
```

### Login Credentials
- Admin: `admin@seraphim.ai` / `admin123`
- User: `user@seraphim.ai` / `user123`

## Full Backend Setup (When Dependencies are Available)

### Install Dependencies
```bash
cd packages/backend
npm install
```

### Run Full Backend
```bash
npm run dev
```

This will start the complete backend with all features including:
- Swagger documentation
- WebSocket support
- All API routes
- Scheduler service
- Email service (if configured)

## Key Files Modified

1. **packages/frontend/src/services/auth.mock.ts**
   - Added backend API integration
   - Proper JWT token handling
   - Fallback mock JWT generation

2. **packages/backend/src/index-minimal.ts** (New)
   - Minimal Express server for development
   - Only includes auth routes and basic middleware

## Environment Variables

Ensure these are set in your `.env` files:

### Backend (.env)
```
NODE_ENV=development
JWT_SECRET=dev-secret-key
PORT=3001
```

### Frontend (.env.development)
```
VITE_DEV_MODE=true
VITE_API_URL=http://localhost:3001/api
```

## Troubleshooting

### Permission Errors
If you encounter npm permission errors:
1. Close any applications that might be using the node_modules folder
2. Run command prompt as Administrator
3. Clear npm cache: `npm cache clean --force`

### Backend Not Starting
If the full backend won't start due to missing modules:
1. Use the minimal backend (`index-minimal.ts`)
2. Install missing dependencies one by one
3. Check for version conflicts in package.json

### Authentication Still Failing
1. Clear browser localStorage
2. Ensure both frontend and backend are in development mode
3. Check that JWT_SECRET is set in backend environment
4. Verify the backend is running on port 3001

## Future Improvements

1. **Unified Token Format**: Ensure consistent token handling across all environments
2. **Better Error Messages**: Provide clearer feedback when auth fails
3. **Auto-retry Logic**: Implement automatic fallback when backend is unavailable
4. **Environment Detection**: Improve automatic detection of development vs production mode