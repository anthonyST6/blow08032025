import { Router } from 'express';
import { verifyToken, requireRole, requirePermission, UserRole } from '../middleware/auth.wrapper';
import { asyncHandler } from '../middleware/errorHandler';
import { collections } from '../config/firebase';
import { logAuditEvent } from '../utils/logger';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';

const router = Router();

// All routes require authentication
router.use(verifyToken);

// Get audit logs with filtering
router.get('/',
  requirePermission('audit.read'),
  asyncHandler(async (req, res) => {
    const {
      limit = 100,
      offset = 0,
      userId,
      action,
      resourceType,
      resourceId,
      startDate,
      endDate,
      result,
      sortBy = 'timestamp',
      sortOrder = 'desc',
    } = req.query;

    let query = collections.auditLogs
      .orderBy(sortBy as string, sortOrder as 'asc' | 'desc')
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    // Apply filters
    if (userId) {
      query = query.where('userId', '==', userId);
    }
    if (action) {
      query = query.where('action', '==', action);
    }
    if (resourceType) {
      query = query.where('resourceType', '==', resourceType);
    }
    if (resourceId) {
      query = query.where('resourceId', '==', resourceId);
    }
    if (result) {
      query = query.where('result', '==', result);
    }
    if (startDate) {
      query = query.where('timestamp', '>=', new Date(startDate as string));
    }
    if (endDate) {
      query = query.where('timestamp', '<=', new Date(endDate as string));
    }

    const snapshot = await query.get();
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get total count for pagination
    const countQuery = collections.auditLogs;
    const countSnapshot = await countQuery.count().get();
    const totalCount = countSnapshot.data().count;

    res.json({
      logs,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: totalCount,
        hasMore: parseInt(offset as string) + logs.length < totalCount,
      },
    });
  })
);

// Get audit log by ID
router.get('/:logId',
  requirePermission('audit.read'),
  asyncHandler(async (req, res) => {
    const { logId } = req.params;
    
    const doc = await collections.auditLogs.doc(logId).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Audit log not found' });
    }
    
    return res.json({
      id: doc.id,
      ...doc.data(),
    });
  })
);

// Export audit logs as CSV
router.get('/export/csv',
  requireRole([UserRole.ADMIN, UserRole.COMPLIANCE_REVIEWER]),
  asyncHandler(async (req, res) => {
    const {
      userId,
      action,
      resourceType,
      startDate,
      endDate,
      limit = 10000,
    } = req.query;

    let query = collections.auditLogs
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit as string));

    // Apply filters
    if (userId) query = query.where('userId', '==', userId);
    if (action) query = query.where('action', '==', action);
    if (resourceType) query = query.where('resourceType', '==', resourceType);
    if (startDate) query = query.where('timestamp', '>=', new Date(startDate as string));
    if (endDate) query = query.where('timestamp', '<=', new Date(endDate as string));

    const snapshot = await query.get();
    const logs = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        timestamp: data.timestamp?.toDate?.() || data.timestamp,
        userId: data.userId,
        userEmail: data.userEmail,
        action: data.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        result: data.result,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: JSON.stringify(data.metadata || {}),
      };
    });

    // Convert to CSV
    const fields = [
      'id',
      'timestamp',
      'userId',
      'userEmail',
      'action',
      'resourceType',
      'resourceId',
      'result',
      'ipAddress',
      'userAgent',
      'metadata',
    ];
    
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(logs);

    // Log the export action
    logAuditEvent({
      action: 'audit_logs_exported',
      userId: req.user!.uid,
      resourceType: 'audit_logs',
      metadata: {
        format: 'csv',
        filters: { userId, action, resourceType, startDate, endDate },
        recordCount: logs.length,
      },
      result: 'success',
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.csv"`);
    res.send(csv);
  })
);

// Export audit logs as PDF
router.get('/export/pdf',
  requireRole([UserRole.ADMIN, UserRole.COMPLIANCE_REVIEWER]),
  asyncHandler(async (req, res) => {
    const {
      userId,
      action,
      resourceType,
      startDate,
      endDate,
      limit = 1000,
    } = req.query;

    let query = collections.auditLogs
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit as string));

    // Apply filters
    if (userId) query = query.where('userId', '==', userId);
    if (action) query = query.where('action', '==', action);
    if (resourceType) query = query.where('resourceType', '==', resourceType);
    if (startDate) query = query.where('timestamp', '>=', new Date(startDate as string));
    if (endDate) query = query.where('timestamp', '<=', new Date(endDate as string));

    const snapshot = await query.get();
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Create PDF
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      
      // Log the export action
      logAuditEvent({
        action: 'audit_logs_exported',
        userId: req.user!.uid,
        resourceType: 'audit_logs',
        metadata: {
          format: 'pdf',
          filters: { userId, action, resourceType, startDate, endDate },
          recordCount: logs.length,
        },
        result: 'success',
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.pdf"`);
      res.send(pdfBuffer);
    });

    // Add content to PDF
    doc.fontSize(20).text('Audit Log Report', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).text(`Generated: ${new Date().toISOString()}`);
    doc.text(`Total Records: ${logs.length}`);
    doc.moveDown();

    // Add filters info
    if (Object.keys(req.query).length > 0) {
      doc.fontSize(14).text('Applied Filters:', { underline: true });
      if (userId) doc.fontSize(10).text(`User ID: ${userId}`);
      if (action) doc.text(`Action: ${action}`);
      if (resourceType) doc.text(`Resource Type: ${resourceType}`);
      if (startDate) doc.text(`Start Date: ${startDate}`);
      if (endDate) doc.text(`End Date: ${endDate}`);
      doc.moveDown();
    }

    // Add logs
    doc.fontSize(14).text('Audit Logs:', { underline: true });
    doc.moveDown();

    logs.forEach((log: any, index: number) => {
      if (index > 0) doc.moveDown();
      
      doc.fontSize(10);
      doc.text(`ID: ${log.id}`);
      doc.text(`Timestamp: ${log.timestamp?.toDate?.() || log.timestamp}`);
      doc.text(`User: ${log.userEmail || log.userId}`);
      doc.text(`Action: ${log.action}`);
      doc.text(`Resource: ${log.resourceType}${log.resourceId ? ` (${log.resourceId})` : ''}`);
      doc.text(`Result: ${log.result}`);
      
      if (log.metadata && Object.keys(log.metadata).length > 0) {
        doc.text(`Metadata: ${JSON.stringify(log.metadata, null, 2)}`);
      }
    });

    doc.end();
  })
);

// Get audit statistics
router.get('/stats',
  requireRole([UserRole.ADMIN, UserRole.AI_RISK_OFFICER]),
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Get logs in date range
    const snapshot = await collections.auditLogs
      .where('timestamp', '>=', start)
      .where('timestamp', '<=', end)
      .get();

    // Calculate statistics
    const stats = {
      totalEvents: snapshot.size,
      eventsByAction: {} as Record<string, number>,
      eventsByResourceType: {} as Record<string, number>,
      eventsByResult: {} as Record<string, number>,
      eventsByUser: {} as Record<string, number>,
      eventsByDay: {} as Record<string, number>,
    };

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      
      // Count by action
      stats.eventsByAction[data.action] = (stats.eventsByAction[data.action] || 0) + 1;
      
      // Count by resource type
      stats.eventsByResourceType[data.resourceType] = (stats.eventsByResourceType[data.resourceType] || 0) + 1;
      
      // Count by result
      stats.eventsByResult[data.result] = (stats.eventsByResult[data.result] || 0) + 1;
      
      // Count by user
      const userKey = data.userEmail || data.userId;
      stats.eventsByUser[userKey] = (stats.eventsByUser[userKey] || 0) + 1;
      
      // Count by day
      const date = data.timestamp?.toDate?.() || new Date(data.timestamp);
      const dayKey = date.toISOString().split('T')[0];
      stats.eventsByDay[dayKey] = (stats.eventsByDay[dayKey] || 0) + 1;
    });

    res.json({
      period: { startDate: start, endDate: end },
      stats,
    });
  })
);

// Create manual audit entry (for external events)
router.post('/',
  requireRole([UserRole.ADMIN]),
  asyncHandler(async (req, res) => {
    const { action, resourceType, resourceId, metadata, result } = req.body;
    
    if (!action || !resourceType || !result) {
      return res.status(400).json({
        error: 'action, resourceType, and result are required'
      });
    }
    
    const auditEntry = {
      timestamp: new Date(),
      userId: req.user!.uid,
      userEmail: req.user!.email,
      action,
      resourceType,
      resourceId: resourceId || null,
      result,
      metadata: metadata || {},
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      manual: true,
    };
    
    const docRef = await collections.auditLogs.add(auditEntry);
    
    return res.status(201).json({
      id: docRef.id,
      ...auditEntry,
    });
  })
);

export default router;