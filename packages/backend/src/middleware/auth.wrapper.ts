// Wrapper to conditionally export dev or production auth middleware
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.FIREBASE_PROJECT_ID;

// Import both versions
import * as prodAuth from './auth';
import * as devAuth from './auth.dev';

// Export the appropriate version based on environment
export const {
  verifyToken,
  requireRole,
  requirePermission,
  requireOrganization,
  optionalAuth,
  userRateLimit,
  UserRole
} = isDevelopment ? devAuth : prodAuth;