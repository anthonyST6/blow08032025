import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth } from '../services/firebase';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import toast from 'react-hot-toast';

// Mock getUserProfile function
const getUserProfile = async (uid: string) => {
  // Mock implementation - replace with actual API call
  return {
    uid,
    displayName: 'Test User',
    role: 'admin' as const,
    permissions: ['read', 'write', 'delete'],
    organizationId: 'org-123'
  };
};

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'ai_risk_officer' | 'compliance_reviewer' | 'user';
  permissions: string[];
  organizationId?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;
          
          // Get user profile with role and permissions
          const userProfile = await getUserProfile(firebaseUser.uid);
          
          const user: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: userProfile.displayName,
            role: userProfile.role,
            permissions: userProfile.permissions,
            organizationId: userProfile.organizationId,
          };
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
          
          toast.success('Successfully logged in!');
        } catch (error: any) {
          const errorMessage = error.code === 'auth/invalid-credential' 
            ? 'Invalid email or password'
            : error.message || 'Failed to login';
            
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: errorMessage 
          });
          
          toast.error(errorMessage);
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await firebaseSignOut(auth);
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null 
          });
          
          toast.success('Successfully logged out');
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
          toast.error('Failed to logout');
          throw error;
        }
      },

      checkAuth: () => {
        set({ isLoading: true });
        
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
          if (firebaseUser) {
            try {
              // Get user profile with role and permissions
              const userProfile = await getUserProfile(firebaseUser.uid);
              
              const user: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                displayName: userProfile.displayName,
                role: userProfile.role,
                permissions: userProfile.permissions,
                organizationId: userProfile.organizationId,
              };
              
              set({ 
                user, 
                isAuthenticated: true, 
                isLoading: false,
                error: null 
              });
            } catch (error) {
              console.error('Failed to get user profile:', error);
              set({ 
                user: null, 
                isAuthenticated: false, 
                isLoading: false,
                error: 'Failed to load user profile' 
              });
            }
          } else {
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false,
              error: null 
            });
          }
        });

        // Return unsubscribe function for cleanup
        return unsubscribe;
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

// Helper hooks
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);

// Permission check helper
export const useHasPermission = (permission: string) => {
  const user = useUser();
  return user?.permissions.includes(permission) || false;
};

// Role check helper
export const useHasRole = (role: string) => {
  const user = useUser();
  return user?.role === role;
};

// Multiple roles check helper
export const useHasAnyRole = (roles: string[]) => {
  const user = useUser();
  return user ? roles.includes(user.role) : false;
};