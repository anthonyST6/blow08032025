import { Router } from 'express';
import { auth, firestore } from '../config/firebase';
import { asyncHandler } from '../middleware/errorHandler';
import { verifyToken } from '../middleware/auth.wrapper';
import { validateRequest } from '../middleware/validation';
import { authSchemas } from '../schemas/auth.schemas';
import { logAuditEvent, logSecurityEvent } from '../utils/logger';
import { ApiError, ValidationError } from '../middleware/errorHandler';

const router = Router();

// Register new user
router.post('/register', 
  validateRequest(authSchemas.register),
  asyncHandler(async (req, res) => {
    const { email, password, displayName, role, organizationId } = req.body;

    try {
      // Create user in Firebase Auth
      const userRecord = await auth().createUser({
        email,
        password,
        displayName,
      });

      // Set custom claims
      await auth().setCustomUserClaims(userRecord.uid, {
        role: role || 'user',
        organizationId,
        permissions: getDefaultPermissions(role),
      });

      // Create user document in Firestore
      await firestore().collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        email,
        displayName,
        role: role || 'user',
        organizationId,
        permissions: getDefaultPermissions(role),
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        lastLogin: null,
      });

      // Log audit event
      logAuditEvent({
        action: 'user_registered',
        userId: userRecord.uid,
        resourceType: 'user',
        resourceId: userRecord.uid,
        metadata: { email, role },
        result: 'success',
      });

      res.status(201).json({
        message: 'User registered successfully',
        userId: userRecord.uid,
      });
    } catch (error: any) {
      logAuditEvent({
        action: 'user_registered',
        metadata: { email, error: error.message },
        result: 'failure',
        reason: error.message,
      });

      if (error.code === 'auth/email-already-exists') {
        throw new ValidationError('Email already in use');
      }
      
      throw error;
    }
  })
);

// Update user profile
router.put('/profile',
  verifyToken,
  validateRequest(authSchemas.updateProfile),
  asyncHandler(async (req, res) => {
    const { displayName, phoneNumber } = req.body;
    const userId = req.user!.uid;

    // Update Firebase Auth
    await auth().updateUser(userId, {
      displayName,
      phoneNumber,
    });

    // Update Firestore
    await firestore().collection('users').doc(userId).update({
      displayName,
      phoneNumber,
      updatedAt: new Date(),
    });

    logAuditEvent({
      action: 'profile_updated',
      userId,
      resourceType: 'user',
      resourceId: userId,
      result: 'success',
    });

    res.json({ message: 'Profile updated successfully' });
  })
);

// Change password
router.post('/change-password',
  verifyToken,
  validateRequest(authSchemas.changePassword),
  asyncHandler(async (req, res) => {
    const { newPassword } = req.body;
    const userId = req.user!.uid;

    // Note: Firebase Admin SDK doesn't support password verification
    // This would typically be done on the client side
    // Here we just update the password
    await auth().updateUser(userId, {
      password: newPassword,
    });

    logSecurityEvent({
      type: 'password_changed',
      severity: 'medium',
      userId,
      metadata: { timestamp: new Date() },
    });

    res.json({ message: 'Password changed successfully' });
  })
);

// Get current user info
router.get('/me',
  verifyToken,
  asyncHandler(async (req, res) => {
    const userId = req.user!.uid;
    
    const userDoc = await firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      throw new ApiError(404, 'User not found');
    }

    const userData = userDoc.data();
    
    res.json({
      user: {
        uid: userId,
        email: userData?.email,
        displayName: userData?.displayName,
        role: userData?.role,
        organizationId: userData?.organizationId,
        permissions: userData?.permissions,
        isActive: userData?.isActive,
        createdAt: userData?.createdAt,
      },
    });
  })
);

// Update user role (admin only)
router.put('/users/:userId/role',
  verifyToken,
  validateRequest(authSchemas.updateRole),
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;
    const adminId = req.user!.uid;

    // Check if requester is admin
    if (req.user!.role !== 'admin') {
      throw new ApiError(403, 'Only admins can update user roles');
    }

    // Update custom claims
    await auth().setCustomUserClaims(userId, {
      role,
      permissions: getDefaultPermissions(role),
    });

    // Update Firestore
    await firestore().collection('users').doc(userId).update({
      role,
      permissions: getDefaultPermissions(role),
      updatedAt: new Date(),
    });

    logAuditEvent({
      action: 'user_role_updated',
      userId: adminId,
      resourceType: 'user',
      resourceId: userId,
      metadata: { newRole: role },
      result: 'success',
    });

    res.json({ message: 'User role updated successfully' });
  })
);

// Deactivate user (admin only)
router.post('/users/:userId/deactivate',
  verifyToken,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const adminId = req.user!.uid;

    if (req.user!.role !== 'admin') {
      throw new ApiError(403, 'Only admins can deactivate users');
    }

    // Disable user in Firebase Auth
    await auth().updateUser(userId, {
      disabled: true,
    });

    // Update Firestore
    await firestore().collection('users').doc(userId).update({
      isActive: false,
      deactivatedAt: new Date(),
      deactivatedBy: adminId,
    });

    logSecurityEvent({
      type: 'user_deactivated',
      severity: 'high',
      userId: adminId,
      metadata: { targetUserId: userId },
    });

    res.json({ message: 'User deactivated successfully' });
  })
);

// Helper function to get default permissions based on role
function getDefaultPermissions(role: string): string[] {
  const permissionMap: Record<string, string[]> = {
    admin: [
      'users.read',
      'users.write',
      'users.delete',
      'llm.read',
      'llm.write',
      'llm.delete',
      'agents.read',
      'agents.write',
      'agents.configure',
      'audit.read',
      'audit.export',
      'workflows.read',
      'workflows.write',
      'workflows.delete',
      'reports.generate',
      'settings.read',
      'settings.write',
    ],
    ai_risk_officer: [
      'llm.read',
      'agents.read',
      'agents.configure',
      'audit.read',
      'workflows.read',
      'reports.generate',
      'flags.read',
      'flags.write',
    ],
    compliance_reviewer: [
      'audit.read',
      'audit.export',
      'reports.generate',
      'workflows.read',
      'flags.read',
    ],
    user: [
      'llm.read',
      'workflows.read',
      'audit.read.own',
    ],
  };

  return permissionMap[role] || permissionMap.user;
}

export default router;