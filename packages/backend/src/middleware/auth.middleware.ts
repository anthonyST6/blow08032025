import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Mock verifyIdToken for development since firebase-admin has issues
const verifyIdToken = async (_token: string) => {
  // In development, return mock user
  if (process.env.NODE_ENV === 'development') {
    logger.warn('Using mock token verification for development');
    return {
      uid: 'dev-user-123',
      email: 'dev@example.com',
      role: 'admin',
      permissions: ['read', 'write', 'delete'],
    };
  }
  
  // In production, this would use firebase-admin
  throw new Error('Firebase Admin not configured');
};

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role?: string;
    permissions?: string[];
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // In development mode, allow requests without authentication
    if (process.env.NODE_ENV === 'development') {
      const authHeader = req.headers.authorization;
      
      // If no auth header in dev mode, use default dev user
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.user = {
          uid: 'dev-user-123',
          email: 'dev@example.com',
          role: 'admin',
          permissions: ['read', 'write', 'delete'],
        };
        next();
        return;
      }
    }
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No authorization token provided',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decodedToken = await verifyIdToken(token);
      
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role || 'user',
        permissions: decodedToken.permissions || [],
      };
      
      next();
    } catch (error) {
      logger.error('Invalid token', error);
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
      return;
    }
  } catch (error) {
    logger.error('Auth middleware error', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error',
    });
    return;
  }
};

// Optional auth middleware - doesn't require auth but adds user if token is present
export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        const decodedToken = await verifyIdToken(token);
        
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          role: decodedToken.role || 'user',
          permissions: decodedToken.permissions || [],
        };
      } catch (error) {
        // Token is invalid but we don't block the request
        logger.debug('Invalid token in optional auth', error);
      }
    }
    
    next();
  } catch (error) {
    logger.error('Optional auth middleware error', error);
    next();
  }
};