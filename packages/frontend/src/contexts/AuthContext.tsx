import React, { createContext, useContext, useEffect } from 'react';
import { User } from '../types';
import { auditLogger } from '../services/auditLogger.service';

// Check if we're in development mode
const isDevelopment = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV;

// Import both stores
import { useAuthStore as useAuthStoreProd } from '../stores/authStore';
import { useAuthStore as useAuthStoreDev } from '../stores/authStore.dev';

// Select the appropriate store
const useAuthStore = isDevelopment ? useAuthStoreDev : useAuthStoreProd;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authStore = useAuthStore();

  // The authStore already handles Firebase auth state changes via initializeAuth()
  // which is called when the store is created, so we just pass through the values
  
  // Update audit logger with current user
  useEffect(() => {
    if (authStore.user) {
      auditLogger.setCurrentUser({
        id: authStore.user.uid,
        name: authStore.user.displayName || authStore.user.email || 'Unknown',
        email: authStore.user.email || 'unknown@example.com',
      });
    } else {
      auditLogger.setCurrentUser(null);
    }
  }, [authStore.user]);
  
  const value: AuthContextType = {
    user: authStore.user,
    loading: authStore.loading,
    error: authStore.error,
    login: authStore.login,
    register: authStore.register,
    logout: authStore.logout,
    updateUser: authStore.updateUser,
    clearError: authStore.clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};