import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { authValidationService } from '../services/auth-validation.service';
import { logger } from '../utils/logger';

const router = Router();

// Get authentication report (admin only)
router.get('/report',
  authMiddleware,
  requireRole(['admin']),
  asyncHandler(async (req: Request, res: Response) => {
    const app = req.app;
    
    // Analyze routes
    authValidationService.analyzeRoutes(app);
    
    // Generate report
    const report = authValidationService.generateAuthReport();
    const validation = authValidationService.validateAuthConfiguration();
    
    res.json({
      success: true,
      report,
      validation,
      timestamp: new Date()
    });
  })
);

// Get unprotected routes (admin only)
router.get('/unprotected-routes',
  authMiddleware,
  requireRole(['admin']),
  asyncHandler(async (req: Request, res: Response) => {
    const app = req.app;
    
    // Analyze routes
    authValidationService.analyzeRoutes(app);
    
    // Get unprotected routes
    const unprotectedRoutes = authValidationService.getUnprotectedRoutes();
    
    res.json({
      success: true,
      routes: unprotectedRoutes,
      total: unprotectedRoutes.length
    });
  })
);

// Test authentication on specific routes (admin only)
router.post('/test-routes',
  authMiddleware,
  requireRole(['admin']),
  asyncHandler(async (req: Request, res: Response) => {
    const { routes, validToken } = req.body;
    
    if (!routes || !Array.isArray(routes)) {
      return res.status(400).json({
        success: false,
        error: 'Routes array is required'
      });
    }
    
    const baseUrl = `${req.protocol}://${req.get('host')}/api`;
    
    try {
      const results = await authValidationService.testRouteAuthentication(
        baseUrl,
        routes,
        validToken
      );
      
      res.json({
        success: true,
        results,
        summary: {
          total: results.length,
          properlyProtected: results.filter(r => 
            r.withoutToken.status === 401 && 
            r.withInvalidToken.status === 401 &&
            (!r.withValidToken || r.withValidToken.success)
          ).length,
          issues: results.filter(r => 
            r.withoutToken.success || 
            r.withInvalidToken.success
          ).length
        }
      });
    } catch (error: any) {
      logger.error('Route testing failed:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Route testing failed'
      });
    }
  })
);

// Validate current user's authentication
router.get('/validate',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    
    res.json({
      success: true,
      authenticated: true,
      user: {
        uid: user.uid,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      },
      timestamp: new Date()
    });
  })
);

// Check if a specific permission is granted
router.post('/check-permission',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { permission } = req.body;
    const user = (req as any).user;
    
    if (!permission) {
      return res.status(400).json({
        success: false,
        error: 'Permission is required'
      });
    }
    
    const hasPermission = user.permissions?.includes(permission) || 
                         user.permissions?.includes('*') ||
                         (user.role === 'admin');
    
    res.json({
      success: true,
      permission,
      granted: hasPermission,
      user: {
        role: user.role,
        permissions: user.permissions
      }
    });
  })
);

// Check if a specific role is granted
router.post('/check-role',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { roles } = req.body;
    const user = (req as any).user;
    
    if (!roles || !Array.isArray(roles)) {
      return res.status(400).json({
        success: false,
        error: 'Roles array is required'
      });
    }
    
    const hasRole = roles.includes(user.role);
    
    res.json({
      success: true,
      requiredRoles: roles,
      userRole: user.role,
      granted: hasRole
    });
  })
);

// Get authentication configuration
router.get('/config',
  authMiddleware,
  requireRole(['admin']),
  asyncHandler(async (req: Request, res: Response) => {
    res.json({
      success: true,
      config: {
        authProvider: process.env.AUTH_PROVIDER || 'firebase',
        sessionTimeout: process.env.SESSION_TIMEOUT || '24h',
        tokenExpiry: process.env.TOKEN_EXPIRY || '1h',
        refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '30d',
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true
        },
        roles: ['admin', 'risk_officer', 'compliance_reviewer', 'user'],
        permissions: [
          'read',
          'write',
          'delete',
          'admin.users',
          'admin.config',
          'vanguard.execute',
          'reports.generate',
          'audit.view'
        ]
      }
    });
  })
);

export default router;