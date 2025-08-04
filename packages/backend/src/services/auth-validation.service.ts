import { Router, Application } from 'express';
import { logger } from '../utils/logger';

interface RouteInfo {
  path: string;
  method: string;
  middlewares: string[];
  isProtected: boolean;
  requiredRoles?: string[];
}

class AuthValidationService {
  private routes: RouteInfo[] = [];

  /**
   * Analyze all routes in the application
   */
  analyzeRoutes(app: Application): RouteInfo[] {
    this.routes = [];
    this.extractRoutes(app._router);
    return this.routes;
  }

  /**
   * Extract routes from Express router
   */
  private extractRoutes(router: any, basePath: string = ''): void {
    if (!router || !router.stack) return;

    router.stack.forEach((layer: any) => {
      if (layer.route) {
        // This is a route
        const path = basePath + layer.route.path;
        const methods = Object.keys(layer.route.methods);
        
        methods.forEach(method => {
          const middlewares = this.extractMiddlewares(layer.route.stack);
          const isProtected = this.isRouteProtected(middlewares);
          const requiredRoles = this.extractRequiredRoles(middlewares);
          
          this.routes.push({
            path,
            method: method.toUpperCase(),
            middlewares,
            isProtected,
            requiredRoles
          });
        });
      } else if (layer.name === 'router' && layer.handle.stack) {
        // This is a sub-router
        const newBasePath = basePath + (layer.regexp.source.match(/[^\\\/\^\$]+/) || [''])[0];
        this.extractRoutes(layer.handle, newBasePath);
      }
    });
  }

  /**
   * Extract middleware names from route stack
   */
  private extractMiddlewares(stack: any[]): string[] {
    return stack
      .filter(layer => layer.name !== 'bound dispatch')
      .map(layer => layer.name || 'anonymous');
  }

  /**
   * Check if route is protected by auth middleware
   */
  private isRouteProtected(middlewares: string[]): boolean {
    return middlewares.some(m => 
      m.includes('auth') || 
      m.includes('Auth') ||
      m.includes('authenticate') ||
      m.includes('requireAuth')
    );
  }

  /**
   * Extract required roles from middlewares
   */
  private extractRequiredRoles(middlewares: string[]): string[] | undefined {
    const roleMiddleware = middlewares.find(m => 
      m.includes('role') || 
      m.includes('Role') ||
      m.includes('rbac') ||
      m.includes('authorize')
    );
    
    // In a real implementation, we'd parse the actual middleware
    // For now, return undefined
    return undefined;
  }

  /**
   * Get unprotected routes
   */
  getUnprotectedRoutes(): RouteInfo[] {
    return this.routes.filter(route => 
      !route.isProtected && 
      !this.isPublicRoute(route.path)
    );
  }

  /**
   * Check if route should be public
   */
  private isPublicRoute(path: string): boolean {
    const publicPaths = [
      '/health',
      '/api/health',
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/refresh',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
      '/docs',
      '/api-docs',
      '/swagger'
    ];
    
    return publicPaths.some(publicPath => 
      path === publicPath || 
      path.startsWith(publicPath + '/')
    );
  }

  /**
   * Validate authentication configuration
   */
  validateAuthConfiguration(): {
    valid: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for unprotected routes
    const unprotectedRoutes = this.getUnprotectedRoutes();
    if (unprotectedRoutes.length > 0) {
      issues.push(`Found ${unprotectedRoutes.length} unprotected routes that may need authentication`);
      unprotectedRoutes.forEach(route => {
        issues.push(`  - ${route.method} ${route.path}`);
      });
    }

    // Check for routes without role-based access control
    const protectedRoutesWithoutRoles = this.routes.filter(route => 
      route.isProtected && !route.requiredRoles
    );
    if (protectedRoutesWithoutRoles.length > 0) {
      recommendations.push(`Consider adding role-based access control to ${protectedRoutesWithoutRoles.length} protected routes`);
    }

    // Check for sensitive endpoints
    const sensitiveEndpoints = this.routes.filter(route => 
      route.path.includes('admin') || 
      route.path.includes('config') ||
      route.path.includes('settings') ||
      route.path.includes('user') ||
      route.path.includes('audit')
    );
    
    const unprotectedSensitiveEndpoints = sensitiveEndpoints.filter(route => !route.isProtected);
    if (unprotectedSensitiveEndpoints.length > 0) {
      issues.push(`Found ${unprotectedSensitiveEndpoints.length} sensitive endpoints without authentication`);
      unprotectedSensitiveEndpoints.forEach(route => {
        issues.push(`  - ${route.method} ${route.path}`);
      });
    }

    // Check for proper middleware order
    const routesWithAuthNotFirst = this.routes.filter(route => {
      const authIndex = route.middlewares.findIndex(m => m.includes('auth'));
      const otherMiddlewareIndex = route.middlewares.findIndex((m, i) => 
        i < authIndex && !m.includes('cors') && !m.includes('helmet')
      );
      return authIndex > 0 && otherMiddlewareIndex >= 0;
    });
    
    if (routesWithAuthNotFirst.length > 0) {
      recommendations.push(`Consider placing auth middleware before other middlewares in ${routesWithAuthNotFirst.length} routes`);
    }

    return {
      valid: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * Generate authentication report
   */
  generateAuthReport(): string {
    const validation = this.validateAuthConfiguration();
    const totalRoutes = this.routes.length;
    const protectedRoutes = this.routes.filter(r => r.isProtected).length;
    const publicRoutes = this.routes.filter(r => this.isPublicRoute(r.path)).length;
    const unprotectedRoutes = totalRoutes - protectedRoutes - publicRoutes;

    let report = '=== Authentication & Route Protection Report ===\n\n';
    
    report += `Total Routes: ${totalRoutes}\n`;
    report += `Protected Routes: ${protectedRoutes} (${Math.round(protectedRoutes/totalRoutes*100)}%)\n`;
    report += `Public Routes: ${publicRoutes} (${Math.round(publicRoutes/totalRoutes*100)}%)\n`;
    report += `Unprotected Routes: ${unprotectedRoutes} (${Math.round(unprotectedRoutes/totalRoutes*100)}%)\n\n`;

    if (validation.issues.length > 0) {
      report += '⚠️  Security Issues:\n';
      validation.issues.forEach(issue => {
        report += `- ${issue}\n`;
      });
      report += '\n';
    }

    if (validation.recommendations.length > 0) {
      report += '💡 Recommendations:\n';
      validation.recommendations.forEach(rec => {
        report += `- ${rec}\n`;
      });
      report += '\n';
    }

    report += 'Route Details:\n';
    report += '─'.repeat(80) + '\n';
    
    this.routes.forEach(route => {
      const protection = route.isProtected ? '🔒' : this.isPublicRoute(route.path) ? '🌐' : '⚠️ ';
      report += `${protection} ${route.method.padEnd(7)} ${route.path}\n`;
      if (route.middlewares.length > 0) {
        report += `   Middlewares: ${route.middlewares.join(', ')}\n`;
      }
      if (route.requiredRoles) {
        report += `   Required Roles: ${route.requiredRoles.join(', ')}\n`;
      }
    });

    return report;
  }

  /**
   * Test authentication for specific routes
   */
  async testRouteAuthentication(
    baseUrl: string,
    routes: string[],
    validToken?: string,
    invalidToken: string = 'invalid-token'
  ): Promise<{
    route: string;
    withoutToken: { status: number; success: boolean };
    withInvalidToken: { status: number; success: boolean };
    withValidToken?: { status: number; success: boolean };
  }[]> {
    const results = [];

    for (const route of routes) {
      const result: any = {
        route,
        withoutToken: { status: 0, success: false },
        withInvalidToken: { status: 0, success: false }
      };

      try {
        // Test without token
        const noTokenResponse = await fetch(`${baseUrl}${route}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        result.withoutToken = {
          status: noTokenResponse.status,
          success: noTokenResponse.ok
        };

        // Test with invalid token
        const invalidTokenResponse = await fetch(`${baseUrl}${route}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${invalidToken}`
          }
        });
        result.withInvalidToken = {
          status: invalidTokenResponse.status,
          success: invalidTokenResponse.ok
        };

        // Test with valid token if provided
        if (validToken) {
          const validTokenResponse = await fetch(`${baseUrl}${route}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${validToken}`
            }
          });
          result.withValidToken = {
            status: validTokenResponse.status,
            success: validTokenResponse.ok
          };
        }
      } catch (error) {
        logger.error(`Failed to test route ${route}:`, error);
      }

      results.push(result);
    }

    return results;
  }
}

export const authValidationService = new AuthValidationService();