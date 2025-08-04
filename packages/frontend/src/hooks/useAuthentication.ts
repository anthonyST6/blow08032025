import React, { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { api } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { UserRole } from '../types';

interface AuthValidation {
  authenticated: boolean;
  user: {
    uid: string;
    email: string;
    role: string;
    permissions: string[];
  };
  timestamp: Date;
}

interface PermissionCheck {
  permission: string;
  granted: boolean;
}

interface RoleCheck {
  requiredRoles: string[];
  userRole: string;
  granted: boolean;
}

export const useAuthentication = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, initialized, logout } = useAuthStore();
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState<Date | null>(null);

  // Validate authentication status with backend
  const validateAuthentication = useCallback(async (): Promise<AuthValidation | null> => {
    if (!user) return null;

    setIsValidating(true);
    try {
      const response = await api.get('/auth-validation/validate');
      const validation = response.data;
      setLastValidation(new Date(validation.timestamp));
      return validation;
    } catch (error: any) {
      console.error('Authentication validation failed:', error);
      
      // If validation fails with 401, user is not authenticated
      if (error.response?.status === 401) {
        await logout();
        navigate('/login', { state: { from: location } });
      }
      
      return null;
    } finally {
      setIsValidating(false);
    }
  }, [user, logout, navigate, location]);

  // Check if user has specific permission
  const checkPermission = useCallback(async (permission: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await api.post('/auth-validation/check-permission', { permission });
      return response.data.granted;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }, [user]);

  // Check if user has specific role
  const checkRole = useCallback(async (roles: string[]): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await api.post('/auth-validation/check-role', { roles });
      return response.data.granted;
    } catch (error) {
      console.error('Role check failed:', error);
      return false;
    }
  }, [user]);

  // Check if user has any of the specified permissions
  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    if (!user) return false;
    
    // For now, admin has all permissions
    if (user.role === UserRole.ADMIN) return true;
    
    // In a real implementation, check user.permissions
    return false;
  }, [user]);

  // Check if user has all of the specified permissions
  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    if (!user) return false;
    
    // For now, admin has all permissions
    if (user.role === UserRole.ADMIN) return true;
    
    // In a real implementation, check user.permissions
    return false;
  }, [user]);

  // Check if user has specific role locally
  const hasRole = useCallback((role: UserRole): boolean => {
    return user?.role === role;
  }, [user]);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roles: UserRole[]): boolean => {
    return roles.includes(user?.role as UserRole);
  }, [user]);

  // Navigate to appropriate dashboard based on role
  const navigateToDashboard = useCallback(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const roleRoutes: Record<UserRole, string> = {
      [UserRole.ADMIN]: '/admin',
      [UserRole.AI_RISK_OFFICER]: '/risk-officer',
      [UserRole.COMPLIANCE_REVIEWER]: '/compliance',
      [UserRole.USER]: '/dashboard',
    };

    const route = roleRoutes[user.role as UserRole] || '/dashboard';
    navigate(route);
  }, [user, navigate]);

  // Require authentication - redirect if not authenticated
  const requireAuth = useCallback((redirectTo: string = '/login') => {
    if (!loading && initialized && !user) {
      navigate(redirectTo, { state: { from: location } });
      return false;
    }
    return true;
  }, [user, loading, initialized, navigate, location]);

  // Require specific role - redirect if not authorized
  const requireRole = useCallback((
    requiredRoles: UserRole[], 
    redirectTo?: string
  ): boolean => {
    if (!requireAuth()) return false;

    if (user && !requiredRoles.includes(user.role as UserRole)) {
      toast.error('You do not have permission to access this page');
      navigate(redirectTo || '/dashboard');
      return false;
    }

    return true;
  }, [user, requireAuth, navigate]);

  // Require specific permission - redirect if not authorized
  const requirePermission = useCallback(async (
    permission: string,
    redirectTo?: string
  ): Promise<boolean> => {
    if (!requireAuth()) return false;

    const hasPermission = await checkPermission(permission);
    if (!hasPermission) {
      toast.error('You do not have the required permission');
      navigate(redirectTo || '/dashboard');
      return false;
    }

    return true;
  }, [requireAuth, checkPermission, navigate]);

  // Periodically validate authentication (every 5 minutes)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      validateAuthentication();
    }, 5 * 60 * 1000); // 5 minutes

    // Initial validation
    validateAuthentication();

    return () => clearInterval(interval);
  }, [user, validateAuthentication]);

  // Get authentication status
  const getAuthStatus = useCallback(() => {
    if (!initialized) return 'initializing';
    if (loading) return 'loading';
    if (isValidating) return 'validating';
    if (user) return 'authenticated';
    return 'unauthenticated';
  }, [initialized, loading, isValidating, user]);

  // Get role display name
  const getRoleDisplayName = useCallback((role?: string): string => {
    const roleNames: Record<string, string> = {
      admin: 'Administrator',
      risk_officer: 'AI Risk Officer',
      compliance_reviewer: 'Compliance Reviewer',
      user: 'User'
    };
    
    return roleNames[role || user?.role || ''] || 'Unknown';
  }, [user]);

  return {
    // State
    user,
    loading,
    initialized,
    isValidating,
    lastValidation,
    isAuthenticated: !!user,
    authStatus: getAuthStatus(),
    
    // Methods
    validateAuthentication,
    checkPermission,
    checkRole,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    navigateToDashboard,
    requireAuth,
    requireRole,
    requirePermission,
    getRoleDisplayName,
    
    // Auth store methods
    logout
  };
};

// HOC for protecting components
export const withAuthentication = <P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requiredRoles?: UserRole[];
    requiredPermissions?: string[];
    requireAll?: boolean; // For permissions
    redirectTo?: string;
  }
) => {
  return (props: P) => {
    const auth = useAuthentication();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
      if (!auth.initialized || auth.loading) return;

      // Check authentication
      if (!auth.user) {
        navigate(options?.redirectTo || '/login', { state: { from: location } });
        return;
      }

      // Check roles
      if (options?.requiredRoles && !auth.hasAnyRole(options.requiredRoles)) {
        toast.error('You do not have permission to access this page');
        navigate(options?.redirectTo || '/dashboard');
        return;
      }

      // Check permissions
      if (options?.requiredPermissions) {
        const hasPermissions = options.requireAll
          ? auth.hasAllPermissions(options.requiredPermissions)
          : auth.hasAnyPermission(options.requiredPermissions);
        
        if (!hasPermissions) {
          toast.error('You do not have the required permissions');
          navigate(options?.redirectTo || '/dashboard');
          return;
        }
      }
    }, [auth, navigate, location, options]);

    if (!auth.initialized || auth.loading) {
      return React.createElement('div', null, 'Loading...');
    }

    if (!auth.user) {
      return null;
    }

    return React.createElement(Component, props);
  };
};