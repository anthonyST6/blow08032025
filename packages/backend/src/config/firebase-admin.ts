import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // In production, use service account credentials
    if (process.env.NODE_ENV === 'production' && process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
    } else {
      // In development, use default credentials or emulator
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'seraphim-vanguards-dev',
        databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://seraphim-vanguards-dev.firebaseio.com',
      });
    }
    
    logger.info('Firebase Admin SDK initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK', error);
    
    // Initialize with mock for development if Firebase fails
    if (process.env.NODE_ENV === 'development') {
      logger.warn('Using mock Firebase Admin SDK for development');
    } else {
      throw error;
    }
  }
}

export const auth = admin.auth();
export const firestore = admin.firestore();
export const storage = admin.storage();

// Helper function to verify ID tokens with fallback for development
export const verifyIdToken = async (token: string) => {
  if (process.env.NODE_ENV === 'development' && !admin.apps.length) {
    // Mock token verification for development
    logger.warn('Using mock token verification for development');
    return {
      uid: 'dev-user-123',
      email: 'dev@example.com',
      role: 'admin',
      permissions: ['read', 'write', 'delete'],
    };
  }
  
  try {
    return await auth.verifyIdToken(token);
  } catch (error) {
    logger.error('Failed to verify ID token', error);
    throw error;
  }
};

// Helper function to create custom tokens
export const createCustomToken = async (uid: string, claims?: object) => {
  if (process.env.NODE_ENV === 'development' && !admin.apps.length) {
    // Mock token creation for development
    logger.warn('Using mock token creation for development');
    return 'mock-custom-token-' + uid;
  }
  
  try {
    return await auth.createCustomToken(uid, claims);
  } catch (error) {
    logger.error('Failed to create custom token', error);
    throw error;
  }
};

// Helper function to set custom user claims
export const setCustomUserClaims = async (uid: string, claims: object) => {
  if (process.env.NODE_ENV === 'development' && !admin.apps.length) {
    // Mock claim setting for development
    logger.warn('Using mock claim setting for development');
    return;
  }
  
  try {
    await auth.setCustomUserClaims(uid, claims);
  } catch (error) {
    logger.error('Failed to set custom user claims', error);
    throw error;
  }
};

export default admin;