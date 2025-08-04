// Use mock authentication for development when backend is not available
import { mockAuth } from './auth.mock';

interface DevUser {
  uid: string;
  email: string;
  displayName: string;
  role: string;
}

class DevAuthService {
  private currentUser: DevUser | null = null;
  private token: string | null = null;

  constructor() {
    // Check for stored auth data
    const storedAuth = localStorage.getItem('mock-auth');
    if (storedAuth) {
      const { token, user } = JSON.parse(storedAuth);
      this.token = token;
      this.currentUser = user;
    }
  }

  async signIn(email: string, password: string): Promise<DevUser> {
    const user = await mockAuth.signIn(email, password);
    this.currentUser = user;
    this.token = mockAuth.getToken();
    return user;
  }

  async signUp(email: string, password: string, displayName: string): Promise<DevUser> {
    const user = await mockAuth.signUp(email, password, displayName);
    this.currentUser = user;
    this.token = mockAuth.getToken();
    return user;
  }

  async signOut(): Promise<void> {
    await mockAuth.signOut();
    this.currentUser = null;
    this.token = null;
  }

  getCurrentUser(): DevUser | null {
    return this.currentUser;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.currentUser;
  }

  // Mock Firebase auth methods for compatibility
  onAuthStateChanged(callback: (user: any) => void): () => void {
    // Call immediately with current state
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {};
  }
}

// Export singleton instance
export const devAuth = new DevAuthService();

// Mock Firebase auth object for compatibility
export const auth = {
  currentUser: {
    getIdToken: async () => devAuth.getToken(),
    uid: devAuth.getCurrentUser()?.uid,
    email: devAuth.getCurrentUser()?.email,
    displayName: devAuth.getCurrentUser()?.displayName,
  },
  signInWithEmailAndPassword: async (email: string, password: string) => {
    const user = await devAuth.signIn(email, password);
    return { user };
  },
  createUserWithEmailAndPassword: async (email: string, password: string) => {
    // For dev mode, we'll use a default display name
    const user = await devAuth.signUp(email, password, email.split('@')[0]);
    return { user };
  },
  signOut: () => devAuth.signOut(),
  onAuthStateChanged: (callback: (user: any) => void) => devAuth.onAuthStateChanged(callback),
};