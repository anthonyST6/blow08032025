import { jest, afterEach } from '@jest/globals';

// Extend global type definitions
declare global {
  var createMockRequest: (options?: any) => any;
  var createMockResponse: () => any;
}

// Mock Firebase Admin before any imports
const mockFirebaseAdmin = {
  apps: [],
  initializeApp: jest.fn(),
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn(() => Promise.resolve({ uid: 'test-uid' })),
    createUser: jest.fn(() => Promise.resolve({ uid: 'new-user-id' })),
    getUser: jest.fn(() => Promise.resolve({ uid: 'test-uid', email: 'test@example.com' })),
    setCustomUserClaims: jest.fn(() => Promise.resolve()),
  })),
  firestore: jest.fn(() => ({
    collection: jest.fn((_name: string) => ({
      doc: jest.fn((_id?: string) => ({
        get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({}) })),
        set: jest.fn(() => Promise.resolve()),
        update: jest.fn(() => Promise.resolve()),
        delete: jest.fn(() => Promise.resolve()),
      })),
      where: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ docs: [] })),
      })),
      add: jest.fn(() => Promise.resolve({ id: 'new-doc-id' })),
    })),
    settings: jest.fn(),
    batch: jest.fn(() => ({
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      commit: jest.fn(() => Promise.resolve()),
    })),
    runTransaction: jest.fn((fn: any) => fn({
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
    FieldValue: {
      serverTimestamp: jest.fn(() => new Date()),
    },
  })),
  credential: {
    cert: jest.fn(),
  },
};

jest.mock('firebase-admin', () => mockFirebaseAdmin);

// Mock Firebase config module
jest.mock('../config/firebase', () => ({
  auth: jest.fn(() => mockFirebaseAdmin.auth()),
  firestore: jest.fn(() => mockFirebaseAdmin.firestore()),
  collections: {
    users: {
      doc: jest.fn((_id?: string) => ({
        get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({}) })),
        set: jest.fn(() => Promise.resolve()),
        update: jest.fn(() => Promise.resolve()),
        delete: jest.fn(() => Promise.resolve()),
      })),
      add: jest.fn(() => Promise.resolve({ id: 'new-doc-id' })),
    },
    sessions: { doc: jest.fn() },
    prompts: { doc: jest.fn() },
    llmResponses: { doc: jest.fn() },
    agentAnalyses: {
      doc: jest.fn(),
      add: jest.fn(() => Promise.resolve({ id: 'new-analysis-id' })),
    },
    auditLogs: { doc: jest.fn() },
    workflows: { doc: jest.fn() },
    llmConfigs: { doc: jest.fn() },
    flags: { doc: jest.fn() },
    organizations: { doc: jest.fn() },
    leases: {
      doc: jest.fn((id?: string) => ({
        get: jest.fn(() => Promise.resolve({
          exists: true,
          id: id || 'test-lease-id',
          data: () => ({
            id: id || 'test-lease-id',
            leaseNumber: 'TEST-2025-0001',
            status: 'active',
          })
        })),
        set: jest.fn(() => Promise.resolve()),
        update: jest.fn(() => Promise.resolve()),
        delete: jest.fn(() => Promise.resolve()),
      })),
      add: jest.fn(() => Promise.resolve({ id: 'new-lease-id' })),
      orderBy: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ docs: [] })),
        where: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve({ docs: [] })),
        })),
      })),
      where: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ docs: [] })),
        orderBy: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve({ docs: [] })),
        })),
      })),
    },
    leaseActions: {
      doc: jest.fn((_id?: string) => ({
        get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({}) })),
        set: jest.fn(() => Promise.resolve()),
        update: jest.fn(() => Promise.resolve()),
        delete: jest.fn(() => Promise.resolve()),
      })),
      add: jest.fn(() => Promise.resolve({ id: 'new-action-id' })),
    },
    certifications: {
      doc: jest.fn((_id?: string) => ({
        get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({}) })),
        set: jest.fn(() => Promise.resolve()),
        update: jest.fn(() => Promise.resolve()),
        delete: jest.fn(() => Promise.resolve()),
      })),
      add: jest.fn(() => Promise.resolve({ id: 'new-cert-id' })),
    },
    certificationIssues: {
      doc: jest.fn((_id?: string) => ({
        get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({}) })),
        set: jest.fn(() => Promise.resolve()),
        update: jest.fn(() => Promise.resolve()),
        delete: jest.fn(() => Promise.resolve()),
      })),
      add: jest.fn(() => Promise.resolve({ id: 'new-issue-id' })),
      where: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ docs: [] })),
      })),
    },
    certificationAutoFixes: {
      doc: jest.fn((_id?: string) => ({
        get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({}) })),
        set: jest.fn(() => Promise.resolve()),
        update: jest.fn(() => Promise.resolve()),
        delete: jest.fn(() => Promise.resolve()),
      })),
      add: jest.fn(() => Promise.resolve({ id: 'new-autofix-id' })),
    },
    certificationReports: {
      doc: jest.fn((_id?: string) => ({
        get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({}) })),
        set: jest.fn(() => Promise.resolve()),
        update: jest.fn(() => Promise.resolve()),
        delete: jest.fn(() => Promise.resolve()),
      })),
      add: jest.fn(() => Promise.resolve({ id: 'new-report-id' })),
    },
    certificationThresholds: {
      get: jest.fn(() => Promise.resolve({ docs: [] })),
    },
    orchestrationWorkflows: {
      doc: jest.fn((id?: string) => ({
        get: jest.fn(() => Promise.resolve({
          exists: true,
          data: () => ({
            id: id || 'test-workflow-id',
            status: 'active',
            steps: [],
          })
        })),
        set: jest.fn(() => Promise.resolve()),
        update: jest.fn(() => Promise.resolve()),
        delete: jest.fn(() => Promise.resolve()),
      })),
      add: jest.fn(() => Promise.resolve({ id: 'new-workflow-id' })),
    },
    orchestrationExecutions: {
      doc: jest.fn((id?: string) => ({
        get: jest.fn(() => Promise.resolve({
          exists: true,
          data: () => ({
            id: id || 'test-execution-id',
            status: 'running',
            steps: [],
          })
        })),
        set: jest.fn(() => Promise.resolve()),
        update: jest.fn(() => Promise.resolve()),
        delete: jest.fn(() => Promise.resolve()),
      })),
      add: jest.fn(() => Promise.resolve({ id: 'new-execution-id' })),
      where: jest.fn(() => ({
        orderBy: jest.fn(() => ({
          limit: jest.fn(() => ({
            get: jest.fn(() => Promise.resolve({ docs: [] })),
          })),
        })),
      })),
    },
    humanApprovals: {
      doc: jest.fn((_id?: string) => ({
        get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({}) })),
        set: jest.fn(() => Promise.resolve()),
        update: jest.fn(() => Promise.resolve()),
        delete: jest.fn(() => Promise.resolve()),
      })),
      add: jest.fn(() => Promise.resolve({ id: 'new-approval-id' })),
    },
    notifications: {
      doc: jest.fn((_id?: string) => ({
        get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({}) })),
        set: jest.fn(() => Promise.resolve()),
        update: jest.fn(() => Promise.resolve()),
        delete: jest.fn(() => Promise.resolve()),
      })),
      add: jest.fn(() => Promise.resolve({ id: 'new-notification-id' })),
    },
    notificationTemplates: {
      doc: jest.fn((_id?: string) => ({
        get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({}) })),
        set: jest.fn(() => Promise.resolve()),
        update: jest.fn(() => Promise.resolve()),
        delete: jest.fn(() => Promise.resolve()),
      })),
      add: jest.fn(() => Promise.resolve({ id: 'new-template-id' })),
    },
    auditTrail: {
      doc: jest.fn((_id?: string) => ({
        get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({}) })),
        set: jest.fn(() => Promise.resolve()),
        update: jest.fn(() => Promise.resolve()),
        delete: jest.fn(() => Promise.resolve()),
      })),
      add: jest.fn(() => Promise.resolve({ id: 'new-audit-id' })),
      orderBy: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ docs: [] })),
        where: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve({ docs: [] })),
        })),
        limit: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve({ docs: [] })),
        })),
      })),
      where: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ docs: [] })),
        orderBy: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve({ docs: [] })),
          limit: jest.fn(() => ({
            get: jest.fn(() => Promise.resolve({ docs: [] })),
          })),
        })),
      })),
    },
  },
  getServerTimestamp: jest.fn(() => new Date()),
  createBatch: jest.fn(() => mockFirebaseAdmin.firestore().batch()),
  runTransaction: jest.fn((fn: any) => mockFirebaseAdmin.firestore().runTransaction(fn)),
  initializeFirebase: jest.fn(),
}));

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test.com';
process.env.FIREBASE_PRIVATE_KEY = 'test-key';

// Mock logger
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock LLM services
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(() => Promise.resolve({
          choices: [{ message: { content: 'Test response' } }],
          usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
        })),
      },
    },
  }));
});

jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn(() => Promise.resolve({
        content: [{ text: 'Test response' }],
        usage: { input_tokens: 15, output_tokens: 25 },
      })),
    },
  }));
});

// Global test utilities
global.createMockRequest = (options = {}) => ({
  body: {},
  query: {},
  params: {},
  headers: {},
  user: null,
  ...options,
});

global.createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  };
  return res;
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});