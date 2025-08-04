import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User, UserRole, AuthState } from '../types';
import { mockAuth } from '../services/auth.mock';

interface AuthStore extends AuthState {
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        loading: false,
        initialized: false,
        error: null,

        // Initialize auth listener
        initializeAuth: () => {
          // Check for stored auth data
          const storedAuth = localStorage.getItem('dev-auth');
          if (storedAuth) {
            try {
              const { user } = JSON.parse(storedAuth);
              const mappedUser: User = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                role: user.role as UserRole,
                createdAt: new Date(),
                lastLogin: new Date(),
                isActive: true,
              };
              set({ user: mappedUser, loading: false, initialized: true, error: null });
            } catch (error) {
              console.error('Error loading stored auth:', error);
              set({ user: null, loading: false, initialized: true, error: null });
            }
          } else {
            set({ user: null, loading: false, initialized: true, error: null });
          }
        },

        // Login action
        login: async (email: string, password: string) => {
          set({ loading: true, error: null });
          
          try {
            const devUser = await mockAuth.signIn(email, password);
            const user: User = {
              uid: devUser.uid,
              email: devUser.email,
              displayName: devUser.displayName,
              role: devUser.role as UserRole,
              createdAt: new Date(),
              lastLogin: new Date(),
              isActive: true,
            };
            set({ user, loading: false, error: null });
          } catch (error: any) {
            const errorMessage = error.message || 'Failed to login';
            set({ error: errorMessage, loading: false });
            throw new Error(errorMessage);
          }
        },

        // Register action
        register: async (email: string, password: string, displayName?: string) => {
          set({ loading: true, error: null });
          
          try {
            const devUser = await mockAuth.signUp(email, password, displayName || email.split('@')[0]);
            const user: User = {
              uid: devUser.uid,
              email: devUser.email,
              displayName: devUser.displayName,
              role: devUser.role as UserRole,
              createdAt: new Date(),
              lastLogin: new Date(),
              isActive: true,
            };
            set({ user, loading: false, error: null });
          } catch (error: any) {
            const errorMessage = error.message || 'Failed to register';
            set({ error: errorMessage, loading: false });
            throw new Error(errorMessage);
          }
        },

        // Logout action
        logout: async () => {
          set({ loading: true, error: null });
          
          try {
            await mockAuth.signOut();
            set({ user: null, loading: false, error: null });
          } catch (error: any) {
            const errorMessage = 'Failed to sign out';
            set({ error: errorMessage, loading: false });
            throw new Error(errorMessage);
          }
        },

        // Update user action
        updateUser: async (updates: Partial<User>) => {
          const { user } = get();
          if (!user) {
            throw new Error('No user logged in');
          }

          set({ loading: true, error: null });
          
          try {
            // In dev mode, just update local state
            const updatedUser = { ...user, ...updates };
            set({ user: updatedUser, loading: false, error: null });
            
            // Update localStorage
            const storedAuth = localStorage.getItem('dev-auth');
            if (storedAuth) {
              const authData = JSON.parse(storedAuth);
              authData.user = {
                uid: updatedUser.uid,
                email: updatedUser.email,
                displayName: updatedUser.displayName,
                role: updatedUser.role,
              };
              localStorage.setItem('dev-auth', JSON.stringify(authData));
            }
          } catch (error: any) {
            const errorMessage = 'Failed to update user profile';
            set({ error: errorMessage, loading: false });
            throw new Error(errorMessage);
          }
        },

        // Clear error
        clearError: () => set({ error: null }),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ 
          // Only persist non-sensitive data
          user: state.user ? {
            uid: state.user.uid,
            email: state.user.email,
            displayName: state.user.displayName,
            role: state.user.role,
          } : null,
        }),
      }
    )
  )
);

// Initialize auth listener when the store is created
if (typeof window !== 'undefined') {
  useAuthStore.getState().initializeAuth();
}