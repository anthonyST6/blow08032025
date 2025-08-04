import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';

export const initializeFirebase = (): void => {
  try {
    // Initialize Firebase Admin SDK
    if (!admin.apps.length) {
      // In development mode, we'll use a minimal configuration
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Running in development mode - Firebase features may be limited');
        
        // Initialize with just project ID for development
        admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || 'seraphim-vanguard-dev',
        });
        
        // Log emulator usage if configured
        if (process.env.FIRESTORE_EMULATOR_HOST) {
          logger.info(`Using Firestore emulator at ${process.env.FIRESTORE_EMULATOR_HOST}`);
        }
        if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
          logger.info(`Using Auth emulator at ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);
        }
      } else {
        // Production mode - use full credentials
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: privateKey,
            }),
            databaseURL: process.env.FIREBASE_DATABASE_URL,
          });
        } else {
          // Use default credentials in production (e.g., Google Cloud)
          admin.initializeApp();
        }
      }

      logger.info('Firebase Admin SDK initialized successfully');
      
      // Configure Firestore settings after initialization
      try {
        admin.firestore().settings({
          ignoreUndefinedProperties: true,
        });
      } catch (error) {
        logger.warn('Could not configure Firestore settings:', error);
      }
    }
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
};

// Export functions that return the services
export const auth = () => admin.auth();
export const firestore = () => admin.firestore();

// Collection references - use function to ensure firestore is initialized
export const collections = {
  get users() { return admin.firestore().collection('users'); },
  get sessions() { return admin.firestore().collection('sessions'); },
  get prompts() { return admin.firestore().collection('prompts'); },
  get llmResponses() { return admin.firestore().collection('llmResponses'); },
  get agentAnalyses() { return admin.firestore().collection('agentAnalyses'); },
  get auditLogs() { return admin.firestore().collection('auditLogs'); },
  get workflows() { return admin.firestore().collection('workflows'); },
  get llmConfigs() { return admin.firestore().collection('llmConfigs'); },
  get flags() { return admin.firestore().collection('flags'); },
  get organizations() { return admin.firestore().collection('organizations'); },
  get emailLogs() { return admin.firestore().collection('emailLogs'); },
  // V2 Collections for Oilfield Land Lease
  get leases() { return admin.firestore().collection('leases'); },
  get leaseActions() { return admin.firestore().collection('leaseActions'); },
  get certifications() { return admin.firestore().collection('certifications'); },
  get actionPackages() { return admin.firestore().collection('actionPackages'); },
  get notifications() { return admin.firestore().collection('notifications'); },
};

// Helper function to get server timestamp
export const getServerTimestamp = () => admin.firestore.FieldValue.serverTimestamp();

// Helper function to create batch operations
export const createBatch = () => admin.firestore().batch();

// Helper function for transactions
export const runTransaction = async <T>(
  updateFunction: (transaction: admin.firestore.Transaction) => Promise<T>
): Promise<T> => {
  return admin.firestore().runTransaction(updateFunction);
};