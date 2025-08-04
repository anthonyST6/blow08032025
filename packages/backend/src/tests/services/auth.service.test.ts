import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { AuthService } from '../../services/auth.service';
import { auth, firestore } from '../../config/firebase';
import { UserRole } from '../../types';

jest.mock('../../config/firebase');

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user with default role', async () => {
      const mockUserData = {
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
      };

      const mockUserRecord = {
        uid: 'test-uid',
        email: mockUserData.email,
        displayName: mockUserData.displayName,
      };

      const mockAuth = auth as jest.MockedFunction<typeof auth>;
      const mockFirestore = firestore as jest.MockedFunction<typeof firestore>;

      mockAuth.mockReturnValue({
        createUser: jest.fn(() => Promise.resolve(mockUserRecord)),
        setCustomUserClaims: jest.fn(() => Promise.resolve()),
        verifyIdToken: jest.fn(),
        getUser: jest.fn(),
      } as any);

      const mockDoc = {
        set: jest.fn(() => Promise.resolve()),
      };

      const mockCollection = {
        doc: jest.fn().mockReturnValue(mockDoc),
      };

      mockFirestore.mockReturnValue({
        collection: jest.fn().mockReturnValue(mockCollection),
      } as any);

      const result = await authService.createUser(mockUserData);

      expect(auth().createUser).toHaveBeenCalledWith({
        email: mockUserData.email,
        password: mockUserData.password,
        displayName: mockUserData.displayName,
      });

      expect(auth().setCustomUserClaims).toHaveBeenCalledWith('test-uid', {
        role: UserRole.USER,
        permissions: ['read:own', 'write:own'],
      });

      expect(mockDoc.set).toHaveBeenCalledWith({
        email: mockUserData.email,
        displayName: mockUserData.displayName,
        role: UserRole.USER,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      expect(result).toEqual(mockUserRecord);
    });

    it('should handle errors when creating user', async () => {
      const error = new Error('Failed to create user');
      const mockAuth = auth as jest.MockedFunction<typeof auth>;
      
      mockAuth.mockReturnValue({
        createUser: jest.fn(() => Promise.reject(error)),
      } as any);

      await expect(
        authService.createUser({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Failed to create user');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const mockDecodedToken = {
        uid: 'test-uid',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      const mockAuth = auth as jest.MockedFunction<typeof auth>;
      mockAuth.mockReturnValue({
        verifyIdToken: jest.fn(() => Promise.resolve(mockDecodedToken)),
      } as any);

      const result = await authService.verifyToken('valid-token');

      expect(auth().verifyIdToken).toHaveBeenCalledWith('valid-token');
      expect(result).toEqual(mockDecodedToken);
    });

    it('should throw error for invalid token', async () => {
      const error = new Error('Invalid token');
      const mockAuth = auth as jest.MockedFunction<typeof auth>;
      mockAuth.mockReturnValue({
        verifyIdToken: jest.fn(() => Promise.reject(error)),
      } as any);

      await expect(authService.verifyToken('invalid-token')).rejects.toThrow(
        'Invalid token'
      );
    });
  });

  describe('updateUserRole', () => {
    it('should update user role', async () => {
      const uid = 'test-uid';
      const newRole = UserRole.AI_RISK_OFFICER;

      const mockAuth = auth as jest.MockedFunction<typeof auth>;
      const mockFirestore = firestore as jest.MockedFunction<typeof firestore>;

      mockAuth.mockReturnValue({
        setCustomUserClaims: jest.fn(() => Promise.resolve()),
      } as any);

      const mockDoc = {
        update: jest.fn(() => Promise.resolve()),
      };

      const mockCollection = {
        doc: jest.fn().mockReturnValue(mockDoc),
      };

      mockFirestore.mockReturnValue({
        collection: jest.fn().mockReturnValue(mockCollection),
      } as any);

      await authService.updateUserRole(uid, newRole);

      expect(auth().setCustomUserClaims).toHaveBeenCalledWith(uid, {
        role: newRole,
        permissions: [
          'read:analyses',
          'write:analyses',
          'read:reports',
          'write:reports',
        ],
      });

      expect(mockDoc.update).toHaveBeenCalledWith({
        role: newRole,
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('getUser', () => {
    it('should get user by ID', async () => {
      const uid = 'test-uid';
      const mockUserData = {
        email: 'test@example.com',
        displayName: 'Test User',
        role: UserRole.USER,
      };

      const mockDoc = {
        exists: true,
        data: jest.fn().mockReturnValue(mockUserData),
      };

      const mockFirestore = firestore as jest.MockedFunction<typeof firestore>;
      mockFirestore.mockReturnValue({
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({
            get: jest.fn(() => Promise.resolve(mockDoc)),
          }),
        }),
      } as any);

      const result = await authService.getUser(uid);

      expect(result).toEqual({
        uid,
        ...mockUserData,
      });
    });

    it('should throw error for non-existent user', async () => {
      const uid = 'non-existent-uid';

      const mockDoc = {
        exists: false,
      };

      const mockFirestore = firestore as jest.MockedFunction<typeof firestore>;
      mockFirestore.mockReturnValue({
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({
            get: jest.fn(() => Promise.resolve(mockDoc)),
          }),
        }),
      } as any);

      await expect(authService.getUser(uid)).rejects.toThrow('User not found');
    });
  });
});