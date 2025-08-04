import axios from 'axios';

// Mock authentication service that works with or without backend
interface MockUser {
  uid: string;
  email: string;
  displayName: string;
  role: string;
}

interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    user: MockUser;
  };
  error?: string;
}

// Simple JWT token generator for development
function generateMockJWT(user: MockUser): string {
  // Create a mock JWT token structure
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    uid: user.uid,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    iat: Math.floor(Date.now() / 1000)
  }));
  const signature = btoa('mock-signature');
  
  return `${header}.${payload}.${signature}`;
}

// Mock users database
const mockUsers = new Map([
  ['admin@seraphim.ai', {
    uid: 'dev-admin-001',
    email: 'admin@seraphim.ai',
    displayName: 'Admin User',
    role: 'admin',
    password: 'admin123',
  }],
  ['user@seraphim.ai', {
    uid: 'dev-user-001',
    email: 'user@seraphim.ai',
    displayName: 'Test User',
    role: 'user',
    password: 'user123',
  }],
]);

class MockAuthService {
  private currentUser: MockUser | null = null;
  private token: string | null = null;
  private apiUrl: string;
  private useBackend: boolean = true; // Enable backend usage when available

  constructor() {
    // Use the same API URL as the main API service
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    
    // Check for stored auth data - use 'dev-auth' to match authStore.dev.ts
    const storedAuth = localStorage.getItem('dev-auth');
    if (storedAuth) {
      const { token, user } = JSON.parse(storedAuth);
      this.token = token;
      this.currentUser = user;
    }
  }

  async signIn(email: string, password: string): Promise<MockUser> {
    // First, try to use the backend if available
    if (this.useBackend) {
      try {
        const response = await axios.post<AuthResponse>(`${this.apiUrl}/auth/dev-login`, {
          email,
          password,
        }, { timeout: 3000 }); // 3 second timeout

        if (response.data.success && response.data.data) {
          const { token, user } = response.data.data;
          this.token = token;
          this.currentUser = user;
          
          // Store auth data
          localStorage.setItem('dev-auth', JSON.stringify({ 
            token: this.token, 
            user: this.currentUser 
          }));
          
          return this.currentUser;
        }
      } catch (error) {
        console.warn('Backend not available, falling back to mock auth');
      }
    }
    
    // Fallback to local mock authentication
    const user = mockUsers.get(email);
    if (!user) {
      throw new Error('User not found');
    }

    if (password !== user.password) {
      throw new Error('Invalid password');
    }

    // Create mock user object
    this.currentUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    };
    
    // Generate a proper mock JWT token
    this.token = generateMockJWT(this.currentUser);

    // Store auth data in localStorage - use 'dev-auth' to match authStore.dev.ts
    localStorage.setItem('dev-auth', JSON.stringify({ 
      token: this.token, 
      user: this.currentUser 
    }));

    return this.currentUser;
  }

  async signUp(email: string, password: string, displayName: string): Promise<MockUser> {
    // First, try to use the backend if available
    if (this.useBackend) {
      try {
        const response = await axios.post<AuthResponse>(`${this.apiUrl}/auth/dev-register`, {
          email,
          password,
          displayName,
        }, { timeout: 3000 });

        if (response.data.success && response.data.data) {
          const { token, user } = response.data.data;
          this.token = token;
          this.currentUser = user;
          
          // Store auth data
          localStorage.setItem('dev-auth', JSON.stringify({ 
            token: this.token, 
            user: this.currentUser 
          }));
          
          return this.currentUser;
        }
      } catch (error) {
        console.warn('Backend not available, falling back to mock auth');
      }
    }
    
    // Fallback to local mock registration
    if (mockUsers.has(email)) {
      throw new Error('User already exists');
    }

    const newUser = {
      uid: `dev-user-${Date.now()}`,
      email,
      displayName,
      role: 'user',
      password,
    };

    mockUsers.set(email, newUser);

    this.currentUser = {
      uid: newUser.uid,
      email: newUser.email,
      displayName: newUser.displayName,
      role: newUser.role,
    };
    
    // Generate a proper mock JWT token
    this.token = generateMockJWT(this.currentUser);

    // Store auth data in localStorage - use 'dev-auth' to match authStore.dev.ts
    localStorage.setItem('dev-auth', JSON.stringify({ 
      token: this.token, 
      user: this.currentUser 
    }));

    return this.currentUser;
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    this.token = null;
    localStorage.removeItem('dev-auth');
  }

  getCurrentUser(): MockUser | null {
    return this.currentUser;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.currentUser;
  }

  onAuthStateChanged(callback: (user: any) => void): () => void {
    // Call immediately with current state
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {};
  }
}

// Export singleton instance
export const mockAuth = new MockAuthService();

// Mock Firebase auth object for compatibility
export const auth = {
  currentUser: {
    getIdToken: async () => mockAuth.getToken(),
    uid: mockAuth.getCurrentUser()?.uid,
    email: mockAuth.getCurrentUser()?.email,
    displayName: mockAuth.getCurrentUser()?.displayName,
  },
  signInWithEmailAndPassword: async (email: string, password: string) => {
    const user = await mockAuth.signIn(email, password);
    return { user };
  },
  createUserWithEmailAndPassword: async (email: string, password: string) => {
    const user = await mockAuth.signUp(email, password, email.split('@')[0]);
    return { user };
  },
  signOut: () => mockAuth.signOut(),
  onAuthStateChanged: (callback: (user: any) => void) => mockAuth.onAuthStateChanged(callback),
};