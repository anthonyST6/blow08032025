import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { logger } from '../utils/logger';

export const authorize = (requiredPermissions: string | string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }
      
      const permissions = Array.isArray(requiredPermissions) 
        ? requiredPermissions 
        : [requiredPermissions];
      
      // In development, allow all permissions for admin role
      if (process.env.NODE_ENV === 'development' && user.role === 'admin') {
        return next();
      }
      
      // Check if user has required permissions
      const userPermissions = user.permissions || [];
      const hasPermissions = permissions.every(perm => {
        // Check exact permission or wildcard
        return userPermissions.includes(perm) || 
               userPermissions.includes(perm.split(':')[0] + ':*') ||
               userPermissions.includes('*');
      });
      
      if (!hasPermissions) {
        logger.warn(`User ${user.uid} lacks permissions: ${permissions.join(', ')}`);
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          required: permissions,
          userPermissions,
        });
      }
      
      next();
    } catch (error) {
      logger.error('RBAC middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Authorization error',
      });
    }
  };
};

// Role-based middleware
export const requireRole = (requiredRoles: string | string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }
      
      const roles = Array.isArray(requiredRoles)
        ? requiredRoles
        : [requiredRoles];
      
      if (!roles.includes(user.role || 'user')) {
        logger.warn(`User ${user.uid} lacks required role: ${roles.join(', ')}`);
        return res.status(403).json({
          success: false,
          error: 'Insufficient role',
          required: roles,
          userRole: user.role,
        });
      }
      
      return next();
    } catch (error) {
      logger.error('Role middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Authorization error',
      });
    }
  };
};