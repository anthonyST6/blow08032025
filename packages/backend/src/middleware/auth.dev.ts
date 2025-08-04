import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from './errorHandler';
import { logger } from '../utils/logger';
import { UserRole } from './auth';

// Re-export UserRole
export { UserRole };

// Development auth middleware that verifies JWT tokens
export const verifyToken = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key') as any;
    
    // Attach user info to request
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions || [],
      organizationId: decoded.organizationId,
    };

    logger.debug(`Authenticated user: ${req.user.uid}`);
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    next(new UnauthorizedError('Invalid token'));
  }
};

// Check user role middleware
export const requireRole = (roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('User not authenticated'));
      return;
    }

    if (!req.user.role || !roles.includes(req.user.role as UserRole)) {
      logger.warn(`Access denied for user ${req.user.uid}. Required roles: ${roles.join(', ')}`);
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }

    next();
  };
};

// Check specific permissions
export const requirePermission = (permission: string) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('User not authenticated'));
      return;
    }

    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      logger.warn(`Permission denied for user ${req.user.uid}. Required: ${permission}`);
      next(new ForbiddenError(`Missing required permission: ${permission}`));
      return;
    }

    next();
  };
};

// Check organization access
export const requireOrganization = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    next(new UnauthorizedError('User not authenticated'));
    return;
  }

  if (!req.user.organizationId) {
    next(new ForbiddenError('User not associated with an organization'));
    return;
  }

  next();
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key') as any;
    
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions || [],
      organizationId: decoded.organizationId,
    };

    next();
  } catch (error) {
    // Don't fail on error, just continue without user
    logger.debug('Optional auth failed, continuing without user');
    next();
  }
};

// Rate limiting by user
export const userRateLimit = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next();
      return;
    }

    const userId = req.user.uid;
    const now = Date.now();
    const userLimit = requests.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      requests.set(userId, {
        count: 1,
        resetTime: now + windowMs,
      });
      next();
      return;
    }

    if (userLimit.count >= maxRequests) {
      res.status(429).json({
        error: {
          message: 'Too many requests',
          retryAfter: Math.ceil((userLimit.resetTime - now) / 1000),
        },
      });
      return;
    }

    userLimit.count++;
    next();
  };
};