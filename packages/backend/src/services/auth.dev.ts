import jwt from 'jsonwebtoken';

// Define UserRole enum for development
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

// Mock user database for development
const mockUsers = new Map([
  ['admin@seraphim.ai', {
    uid: 'dev-admin-001',
    email: 'admin@seraphim.ai',
    displayName: 'Admin User',
    role: UserRole.ADMIN,
    password: 'admin123', // Plain text for development only
    createdAt: new Date(),
    lastLogin: new Date(),
  }],
  ['user@seraphim.ai', {
    uid: 'dev-user-001',
    email: 'user@seraphim.ai',
    displayName: 'Test User',
    role: UserRole.USER,
    password: 'admin123', // Plain text for development only
    createdAt: new Date(),
    lastLogin: new Date(),
  }],
]);

export class DevAuthService {
  private jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'dev-secret-key';
  }

  async verifyIdToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      const user = mockUsers.get(decoded.email);
      if (!user) {
        throw new Error('User not found');
      }
      return {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async createUser(email: string, password: string, displayName: string): Promise<any> {
    if (mockUsers.has(email)) {
      throw new Error('User already exists');
    }

    const uid = `dev-user-${Date.now()}`;
    const newUser = {
      uid,
      email,
      displayName,
      role: UserRole.USER,
      password, // Store plain text for development only
      createdAt: new Date(),
      lastLogin: new Date(),
    };

    mockUsers.set(email, newUser);
    return { uid, email, displayName };
  }

  async signIn(email: string, password: string): Promise<{ token: string; user: any }> {
    const user = mockUsers.get(email);
    if (!user) {
      throw new Error('User not found');
    }

    // Simple password comparison for development
    if (password !== user.password) {
      throw new Error('Invalid password');
    }

    const token = jwt.sign(
      {
        uid: user.uid,
        email: user.email,
        role: user.role,
      },
      this.jwtSecret,
      { expiresIn: '24h' }
    );

    user.lastLogin = new Date();

    return {
      token,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    };
  }

  async getUser(uid: string): Promise<any> {
    for (const [_, user] of mockUsers) {
      if (user.uid === uid) {
        return {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        };
      }
    }
    throw new Error('User not found');
  }

  async updateUser(uid: string, updates: any): Promise<any> {
    for (const [email, user] of mockUsers) {
      if (user.uid === uid) {
        const updatedUser = { ...user, ...updates };
        mockUsers.set(email, updatedUser);
        return {
          uid: updatedUser.uid,
          email: updatedUser.email,
          displayName: updatedUser.displayName,
          role: updatedUser.role,
        };
      }
    }
    throw new Error('User not found');
  }

  async deleteUser(uid: string): Promise<void> {
    for (const [email, user] of mockUsers) {
      if (user.uid === uid) {
        mockUsers.delete(email);
        return;
      }
    }
    throw new Error('User not found');
  }

  async listUsers(): Promise<any[]> {
    return Array.from(mockUsers.values()).map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    }));
  }
}

// Export singleton instance
export const devAuthService = new DevAuthService();