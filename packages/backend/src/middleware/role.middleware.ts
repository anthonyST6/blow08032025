import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const roleMiddleware = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // In development mode, allow all authenticated users
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Role check bypassed in development mode');
        return next();
      }

      // Check if user has one of the allowed roles
      const userRoles = user.customClaims?.roles || [];
      const hasRole = allowedRoles.some(role => userRoles.includes(role));

      if (!hasRole) {
        logger.warn(`Access denied for user ${user.uid}. Required roles: ${allowedRoles.join(', ')}`);
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'You do not have the required permissions to access this resource'
        });
      }

      next();
    } catch (error) {
      logger.error('Role middleware error', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};