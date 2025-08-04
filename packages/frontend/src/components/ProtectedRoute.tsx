import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { UserRole } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireAuth = true,
}) => {
  const location = useLocation();
  const { user, loading, initialized } = useAuthStore();

  // Show loading spinner while auth state is being determined
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles && user) {
    const hasRequiredRole = allowedRoles.includes(user.role);
    
    if (!hasRequiredRole) {
      // Redirect to appropriate dashboard based on user's actual role
      const roleRedirects: Record<UserRole, string> = {
        [UserRole.ADMIN]: '/admin',
        [UserRole.AI_RISK_OFFICER]: '/risk-officer',
        [UserRole.COMPLIANCE_REVIEWER]: '/compliance',
        [UserRole.USER]: '/dashboard',
      };

      return <Navigate to={roleRedirects[user.role] || '/dashboard'} replace />;
    }
  }

  // Render children if all checks pass
  return <>{children}</>;
};

export default ProtectedRoute;