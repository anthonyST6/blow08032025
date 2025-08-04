import { auth, firestore } from '../config/firebase';
import { logger } from '../utils/logger';
import { UserRole } from '../types';

export interface CreateUserData {
  email: string;
  password: string;
  displayName?: string;
  role?: UserRole;
}

export interface UpdateUserData {
  displayName?: string;
  role?: UserRole;
  permissions?: string[];
}

export class AuthService {
  async createUser(userData: CreateUserData) {
    try {
      // Create user in Firebase Auth
      const userRecord = await auth().createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
      });

      // Set custom claims
      const role = userData.role || UserRole.USER;
      await auth().setCustomUserClaims(userRecord.uid, {
        role,
        permissions: this.getDefaultPermissions(role),
      });

      // Create user document in Firestore
      await firestore().collection('users').doc(userRecord.uid).set({
        email: userData.email,
        displayName: userData.displayName || '',
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      logger.info('User created successfully', { uid: userRecord.uid, email: userData.email });
      return userRecord;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async verifyToken(idToken: string) {
    try {
      const decodedToken = await auth().verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      logger.error('Error verifying token:', error);
      throw error;
    }
  }

  async updateUserRole(uid: string, role: UserRole) {
    try {
      // Update custom claims
      await auth().setCustomUserClaims(uid, {
        role,
        permissions: this.getDefaultPermissions(role),
      });

      // Update user document
      await firestore().collection('users').doc(uid).update({
        role,
        updatedAt: new Date(),
      });

      logger.info('User role updated', { uid, role });
    } catch (error) {
      logger.error('Error updating user role:', error);
      throw error;
    }
  }

  async getUser(uid: string) {
    try {
      const doc = await firestore().collection('users').doc(uid).get();
      if (!doc.exists) {
        throw new Error('User not found');
      }
      return { uid, ...doc.data() };
    } catch (error) {
      logger.error('Error getting user:', error);
      throw error;
    }
  }

  private getDefaultPermissions(role: UserRole): string[] {
    switch (role) {
      case UserRole.ADMIN:
        return ['read:all', 'write:all', 'delete:all', 'manage:users'];
      case UserRole.AI_RISK_OFFICER:
        return ['read:analyses', 'write:analyses', 'read:reports', 'write:reports'];
      case UserRole.COMPLIANCE_REVIEWER:
        return ['read:analyses', 'read:reports', 'write:reviews'];
      case UserRole.USER:
      default:
        return ['read:own', 'write:own'];
    }
  }
}

export const authService = new AuthService();