import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { User, UserRole, AuthState } from '../types';

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
          const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            set({ loading: true });
            
            if (firebaseUser) {
              try {
                // Fetch user data from Firestore
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  const user: User = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email!,
                    displayName: firebaseUser.displayName || userData.displayName,
                    role: userData.role || UserRole.USER,
                    createdAt: userData.createdAt?.toDate() || new Date(),
                    lastLogin: new Date(),
                    isActive: userData.isActive !== false,
                  };

                  // Update last login
                  await updateDoc(doc(db, 'users', firebaseUser.uid), {
                    lastLogin: new Date(),
                  });

                  set({ user, loading: false, initialized: true, error: null });
                } else {
                  // Create user document if it doesn't exist
                  const newUser: User = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email!,
                    displayName: firebaseUser.displayName || undefined,
                    role: UserRole.USER,
                    createdAt: new Date(),
                    lastLogin: new Date(),
                    isActive: true,
                  };

                  await setDoc(doc(db, 'users', firebaseUser.uid), {
                    ...newUser,
                    createdAt: new Date(),
                    lastLogin: new Date(),
                  });

                  set({ user: newUser, loading: false, initialized: true, error: null });
                }
              } catch (error) {
                console.error('Error fetching user data:', error);
                set({ 
                  user: null, 
                  loading: false, 
                  initialized: true,
                  error: 'Failed to load user data' 
                });
              }
            } else {
              set({ user: null, loading: false, initialized: true, error: null });
            }
          });

          // Return unsubscribe function for cleanup
          return unsubscribe;
        },

        // Login action
        login: async (email: string, password: string) => {
          set({ loading: true, error: null });
          
          try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // User state will be updated by the auth state listener
          } catch (error: any) {
            const errorMessage = getAuthErrorMessage(error.code);
            set({ error: errorMessage, loading: false });
            throw new Error(errorMessage);
          }
        },

        // Register action
        register: async (email: string, password: string, displayName?: string) => {
          set({ loading: true, error: null });
          
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Update display name if provided
            if (displayName && userCredential.user) {
              await updateProfile(userCredential.user, { displayName });
            }

            // Create user document in Firestore
            const newUser: User = {
              uid: userCredential.user.uid,
              email: userCredential.user.email!,
              displayName: displayName,
              role: UserRole.USER,
              createdAt: new Date(),
              lastLogin: new Date(),
              isActive: true,
            };

            await setDoc(doc(db, 'users', userCredential.user.uid), {
              ...newUser,
              createdAt: new Date(),
              lastLogin: new Date(),
            });

            // User state will be updated by the auth state listener
          } catch (error: any) {
            const errorMessage = getAuthErrorMessage(error.code);
            set({ error: errorMessage, loading: false });
            throw new Error(errorMessage);
          }
        },

        // Logout action
        logout: async () => {
          set({ loading: true, error: null });
          
          try {
            await signOut(auth);
            // User state will be updated by the auth state listener
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
            // Update Firestore document
            await updateDoc(doc(db, 'users', user.uid), updates);
            
            // Update Firebase Auth profile if display name changed
            if (updates.displayName && auth.currentUser) {
              await updateProfile(auth.currentUser, { 
                displayName: updates.displayName 
              });
            }

            // Update local state
            set({ 
              user: { ...user, ...updates }, 
              loading: false, 
              error: null 
            });
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

// Helper function to get user-friendly error messages
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/operation-not-allowed':
      return 'Operation not allowed';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    default:
      return 'An error occurred. Please try again';
  }
}

// Initialize auth listener when the store is created
if (typeof window !== 'undefined') {
  useAuthStore.getState().initializeAuth();
}