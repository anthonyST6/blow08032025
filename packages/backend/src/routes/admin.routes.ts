import { Router } from 'express';
import { verifyToken, requireRole, UserRole } from '../middleware/auth.wrapper';
import { asyncHandler } from '../middleware/errorHandler';
import { auth, collections, firestore, getServerTimestamp } from '../config/firebase';
import { logAuditEvent } from '../utils/logger';

const router = Router();

// All routes require admin authentication
router.use(verifyToken);
router.use(requireRole([UserRole.ADMIN]));

// Get all users with pagination and filtering
router.get('/users',
  asyncHandler(async (req, res) => {
    const { 
      limit = 50, 
      offset = 0,
      role,
      organizationId,
      searchTerm,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    let query = collections.users
      .orderBy(sortBy as string, sortOrder as 'asc' | 'desc')
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    // Apply filters
    if (role) {
      query = query.where('role', '==', role);
    }
    if (organizationId) {
      query = query.where('organizationId', '==', organizationId);
    }

    const snapshot = await query.get();
    let users = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Apply search filter (client-side for now)
    if (searchTerm) {
      const search = (searchTerm as string).toLowerCase();
      users = users.filter((user: any) =>
        user.email?.toLowerCase().includes(search) ||
        user.displayName?.toLowerCase().includes(search) ||
        user.id.toLowerCase().includes(search)
      );
    }

    // Get total count
    const totalSnapshot = await collections.users.count().get();
    const totalCount = totalSnapshot.data().count;

    return res.json({
      users,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: totalCount,
        hasMore: parseInt(offset as string) + users.length < totalCount,
      },
    });
  })
);

// Get user by ID
router.get('/users/:userId',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    // Get user from Firestore
    const userDoc = await collections.users.doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user from Firebase Auth
    let authUser;
    try {
      authUser = await auth().getUser(userId);
    } catch (error) {
      // User might not exist in Auth
    }
    
    return res.json({
      id: userDoc.id,
      ...userDoc.data(),
      authData: authUser ? {
        email: authUser.email,
        emailVerified: authUser.emailVerified,
        disabled: authUser.disabled,
        metadata: authUser.metadata,
        customClaims: authUser.customClaims,
      } : null,
    });
  })
);

// Update user role and permissions
router.put('/users/:userId/role',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { role, permissions } = req.body;
    
    if (!role || !Object.values(UserRole).includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    // Update custom claims in Firebase Auth
    await auth().setCustomUserClaims(userId, {
      role,
      permissions: permissions || [],
    });
    
    // Update user document in Firestore
    await collections.users.doc(userId).update({
      role,
      permissions: permissions || [],
      updatedAt: getServerTimestamp(),
      updatedBy: req.user!.uid,
    });
    
    logAuditEvent({
      action: 'user_role_updated',
      userId: req.user!.uid,
      resourceType: 'user',
      resourceId: userId,
      metadata: { role, permissions },
      result: 'success',
    });
    
    return res.json({
      message: 'User role updated successfully',
      role,
      permissions,
    });
  })
);

// Enable/disable user
router.patch('/users/:userId/status',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { disabled } = req.body;
    
    if (typeof disabled !== 'boolean') {
      return res.status(400).json({ error: 'disabled must be a boolean' });
    }
    
    // Update in Firebase Auth
    await auth().updateUser(userId, { disabled });
    
    // Update in Firestore
    await collections.users.doc(userId).update({
      disabled,
      updatedAt: getServerTimestamp(),
      updatedBy: req.user!.uid,
    });
    
    logAuditEvent({
      action: disabled ? 'user_disabled' : 'user_enabled',
      userId: req.user!.uid,
      resourceType: 'user',
      resourceId: userId,
      result: 'success',
    });
    
    return res.json({
      message: `User ${disabled ? 'disabled' : 'enabled'} successfully`,
      disabled,
    });
  })
);

// Delete user
router.delete('/users/:userId',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    // Prevent self-deletion
    if (userId === req.user!.uid) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    // Delete from Firebase Auth
    await auth().deleteUser(userId);
    
    // Delete from Firestore
    await collections.users.doc(userId).delete();
    
    logAuditEvent({
      action: 'user_deleted',
      userId: req.user!.uid,
      resourceType: 'user',
      resourceId: userId,
      result: 'success',
    });
    
    return res.json({ message: 'User deleted successfully' });
  })
);

// Get system statistics
router.get('/stats',
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();
    
    // Get user stats
    const usersSnapshot = await collections.users.count().get();
    const usersByRole: Record<string, number> = {};
    
    const userRoleSnapshot = await collections.users.get();
    userRoleSnapshot.docs.forEach((doc: any) => {
      const role = doc.data().role || 'user';
      usersByRole[role] = (usersByRole[role] || 0) + 1;
    });
    
    // Get prompt stats
    const promptsSnapshot = await collections.prompts
      .where('timestamp', '>=', start)
      .where('timestamp', '<=', end)
      .count()
      .get();
    
    // Get LLM response stats
    const llmResponsesSnapshot = await collections.llmResponses
      .where('timestamp', '>=', start)
      .where('timestamp', '<=', end)
      .count()
      .get();
    
    // Get agent analysis stats
    const agentAnalysesSnapshot = await collections.agentAnalyses
      .where('timestamp', '>=', start)
      .where('timestamp', '<=', end)
      .count()
      .get();
    
    // Get workflow stats
    const workflowsSnapshot = await collections.workflows.count().get();
    const activeWorkflowsSnapshot = await collections.workflows
      .where('status', '==', 'active')
      .count()
      .get();
    
    // Get audit log stats
    const auditLogsSnapshot = await collections.auditLogs
      .where('timestamp', '>=', start)
      .where('timestamp', '<=', end)
      .count()
      .get();
    
    return res.json({
      period: { startDate: start, endDate: end },
      users: {
        total: usersSnapshot.data().count,
        byRole: usersByRole,
      },
      activity: {
        prompts: promptsSnapshot.data().count,
        llmResponses: llmResponsesSnapshot.data().count,
        agentAnalyses: agentAnalysesSnapshot.data().count,
        auditLogs: auditLogsSnapshot.data().count,
      },
      workflows: {
        total: workflowsSnapshot.data().count,
        active: activeWorkflowsSnapshot.data().count,
      },
    });
  })
);

// Get system configuration
router.get('/config',
  asyncHandler(async (_req, res) => {
    const configDoc = await firestore().collection('systemConfig').doc('main').get();
    
    if (!configDoc.exists) {
      return res.json({
        llmProviders: ['openai', 'anthropic', 'azure'],
        maxTokensPerRequest: 4096,
        maxRequestsPerMinute: 60,
        retentionDays: 90,
        features: {
          autoAnalysis: true,
          workflowScheduling: true,
          exportEnabled: true,
        },
      });
    }
    
    return res.json(configDoc.data());
  })
);

// Update system configuration
router.put('/config',
  asyncHandler(async (req, res) => {
    const config = req.body;
    
    await firestore().collection('systemConfig').doc('main').set({
      ...config,
      updatedAt: getServerTimestamp(),
      updatedBy: req.user!.uid,
    }, { merge: true });
    
    logAuditEvent({
      action: 'system_config_updated',
      userId: req.user!.uid,
      resourceType: 'system',
      resourceId: 'config',
      metadata: { updates: Object.keys(config) },
      result: 'success',
    });
    
    return res.json({
      message: 'System configuration updated successfully',
      config,
    });
  })
);

// Get organizations
router.get('/organizations',
  asyncHandler(async (req, res) => {
    const { limit = 50, offset = 0 } = req.query;
    
    const snapshot = await collections.organizations
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string))
      .get();
    
    const organizations = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    const totalSnapshot = await collections.organizations.count().get();
    const totalCount = totalSnapshot.data().count;
    
    return res.json({
      organizations,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: totalCount,
        hasMore: parseInt(offset as string) + organizations.length < totalCount,
      },
    });
  })
);

// Create organization
router.post('/organizations',
  asyncHandler(async (req, res) => {
    const { name, description, settings } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Organization name is required' });
    }
    
    const organization = {
      name,
      description: description || '',
      settings: settings || {},
      createdAt: getServerTimestamp(),
      createdBy: req.user!.uid,
      memberCount: 0,
    };
    
    const docRef = await collections.organizations.add(organization);
    
    logAuditEvent({
      action: 'organization_created',
      userId: req.user!.uid,
      resourceType: 'organization',
      resourceId: docRef.id,
      metadata: { name },
      result: 'success',
    });
    
    return res.status(201).json({
      id: docRef.id,
      ...organization,
    });
  })
);

// Update organization
router.put('/organizations/:orgId',
  asyncHandler(async (req, res) => {
    const { orgId } = req.params;
    const updates = req.body;
    
    const doc = await collections.organizations.doc(orgId).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    await collections.organizations.doc(orgId).update({
      ...updates,
      updatedAt: getServerTimestamp(),
      updatedBy: req.user!.uid,
    });
    
    logAuditEvent({
      action: 'organization_updated',
      userId: req.user!.uid,
      resourceType: 'organization',
      resourceId: orgId,
      metadata: { updates: Object.keys(updates) },
      result: 'success',
    });
    
    return res.json({
      message: 'Organization updated successfully',
      organization: {
        id: orgId,
        ...doc.data(),
        ...updates,
      },
    });
  })
);

// Delete organization
router.delete('/organizations/:orgId',
  asyncHandler(async (req, res) => {
    const { orgId } = req.params;
    
    // Check if organization has members
    const membersSnapshot = await collections.users
      .where('organizationId', '==', orgId)
      .count()
      .get();
    
    if (membersSnapshot.data().count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete organization with active members' 
      });
    }
    
    await collections.organizations.doc(orgId).delete();
    
    logAuditEvent({
      action: 'organization_deleted',
      userId: req.user!.uid,
      resourceType: 'organization',
      resourceId: orgId,
      result: 'success',
    });
    
    return res.json({ message: 'Organization deleted successfully' });
  })
);

// Assign user to organization
router.put('/users/:userId/organization',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { organizationId } = req.body;
    
    // Verify organization exists
    if (organizationId) {
      const orgDoc = await collections.organizations.doc(organizationId).get();
      if (!orgDoc.exists) {
        return res.status(404).json({ error: 'Organization not found' });
      }
    }
    
    // Update user's organization
    await collections.users.doc(userId).update({
      organizationId: organizationId || null,
      updatedAt: getServerTimestamp(),
      updatedBy: req.user!.uid,
    });
    
    // Update custom claims
    const user = await auth().getUser(userId);
    await auth().setCustomUserClaims(userId, {
      ...user.customClaims,
      organizationId: organizationId || null,
    });
    
    logAuditEvent({
      action: 'user_organization_updated',
      userId: req.user!.uid,
      resourceType: 'user',
      resourceId: userId,
      metadata: { organizationId },
      result: 'success',
    });
    
    return res.json({
      message: 'User organization updated successfully',
      organizationId,
    });
  })
);

export default router;