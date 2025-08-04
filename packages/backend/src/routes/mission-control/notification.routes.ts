import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { notificationService } from '../../services/notification.service';

const router = Router();

// Send notification
router.post('/send', asyncHandler(async (req: Request, res: Response) => {
  const { templateId, recipients, variables, channels, priority, subject, body } = req.body;

  if (templateId) {
    // Send templated notification
    if (!recipients || !Array.isArray(recipients)) {
      return res.status(400).json({ error: 'Recipients array is required' });
    }

    const notification = await notificationService.sendTemplatedNotification(
      templateId,
      recipients,
      variables || {},
      req.body.metadata
    );

    res.json(notification);
  } else {
    // Send direct notification
    if (!recipients || !channels || !subject || !body) {
      return res.status(400).json({ 
        error: 'Recipients, channels, subject, and body are required for direct notifications' 
      });
    }

    const notification = await notificationService.sendDirectNotification({
      recipients,
      channels,
      priority: priority || 'medium',
      subject,
      body,
      data: req.body.data,
      metadata: req.body.metadata,
    });

    res.json(notification);
  }
}));

// Get notification templates
router.get('/templates', asyncHandler(async (req: Request, res: Response) => {
  // const { category, priority } = req.query;

  // Mock templates response
  const templates = {
    data: [
      {
        id: 'critical-issue',
        name: 'Critical Issue Detected',
        description: 'Sent when a critical certification issue is detected',
        channels: ['email', 'teams', 'slack', 'sms'],
        subject: 'CRITICAL: {{issueTitle}}',
        bodyTemplate: 'A critical issue has been detected:\n\n{{issueDescription}}',
        variables: ['issueTitle', 'issueDescription', 'resourceId', 'detectedBy'],
        priority: 'critical',
        category: 'alert',
      },
      {
        id: 'approval-required',
        name: 'Approval Required',
        description: 'Sent when an action requires approval',
        channels: ['email', 'teams', 'slack'],
        subject: 'Approval Required: {{actionTitle}}',
        bodyTemplate: 'Your approval is required for: {{actionDescription}}',
        variables: ['actionTitle', 'actionDescription', 'requestedBy', 'riskLevel'],
        priority: 'high',
        category: 'approval',
      },
      {
        id: 'lease-expiration',
        name: 'Lease Expiration Warning',
        description: 'Sent when a lease is approaching expiration',
        channels: ['email', 'teams'],
        subject: 'Lease Expiration: {{leaseName}}',
        bodyTemplate: 'Lease {{leaseName}} expires in {{daysUntilExpiration}} days',
        variables: ['leaseName', 'leaseId', 'daysUntilExpiration', 'expirationDate'],
        priority: 'high',
        category: 'action_required',
      },
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 3,
    }
  };

  res.json(templates);
}));

// Create notification template
router.post('/templates', asyncHandler(async (req: Request, res: Response) => {
  const templateData = req.body;

  if (!templateData.name || !templateData.channels || !templateData.bodyTemplate) {
    return res.status(400).json({ 
      error: 'Name, channels, and body template are required' 
    });
  }

  const template = await notificationService.createTemplate(templateData);
  res.status(201).json(template);
}));

// Get notification history
router.get('/history', asyncHandler(async (req: Request, res: Response) => {
  const { 
    status, 
    channel, 
    priority,
    startDate,
    endDate,
    page = '1',
    limit = '20'
  } = req.query;

  // Mock notification history
  const notifications = {
    data: [
      {
        id: '1',
        templateId: 'critical-issue',
        recipients: [
          { email: 'admin@company.com' },
          { teamsUserId: 'user123' },
        ],
        channels: ['email', 'teams'],
        priority: 'critical',
        subject: 'CRITICAL: Security Breach Detected',
        body: 'A critical security issue has been detected in Lease XYZ',
        status: 'sent',
        deliveryStatus: [
          { channel: 'email', status: 'sent', sentAt: new Date() },
          { channel: 'teams', status: 'sent', sentAt: new Date() },
        ],
        createdAt: new Date(),
        sentAt: new Date(),
      },
      {
        id: '2',
        templateId: 'approval-required',
        recipients: [{ email: 'manager@company.com' }],
        channels: ['email'],
        priority: 'high',
        subject: 'Approval Required: Auto-fix for Data Integrity Issue',
        body: 'Your approval is required for an auto-fix action',
        status: 'sent',
        deliveryStatus: [
          { channel: 'email', status: 'sent', sentAt: new Date() },
        ],
        createdAt: new Date(Date.now() - 3600000),
        sentAt: new Date(Date.now() - 3600000),
      },
    ],
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total: 2,
    }
  };

  res.json(notifications);
}));

// Get user notification preferences
router.get('/preferences', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id || 'current-user';
  
  const preferences = await notificationService.getUserPreferences(userId);
  
  if (!preferences) {
    // Return default preferences
    res.json({
      userId,
      channels: {
        email: {
          enabled: true,
          address: (req as any).user?.email || 'user@company.com',
          categories: ['all'],
        },
        teams: {
          enabled: true,
          userId: 'teams-user-id',
          categories: ['critical', 'high'],
        },
        slack: {
          enabled: false,
          userId: '',
          categories: [],
        },
        sms: {
          enabled: true,
          phoneNumber: '+1234567890',
          categories: ['critical'],
          criticalOnly: true,
        },
        inApp: {
          enabled: true,
          categories: ['all'],
        },
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
        timezone: 'America/Chicago',
      },
      escalation: {
        enabled: true,
        timeout: 30, // minutes
        escalateTo: ['manager@company.com'],
      },
    });
  } else {
    res.json(preferences);
  }
}));

// Update user notification preferences
router.put('/preferences', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id || 'current-user';
  const preferences = req.body;

  await notificationService.updateUserPreferences(userId, preferences);
  
  res.json({ 
    success: true, 
    message: 'Notification preferences updated successfully' 
  });
}));

// Test notification
router.post('/test', asyncHandler(async (req: Request, res: Response) => {
  const { channel, recipient } = req.body;

  if (!channel || !recipient) {
    return res.status(400).json({ 
      error: 'Channel and recipient are required' 
    });
  }

  // Send test notification
  const notification = await notificationService.sendDirectNotification({
    recipients: [recipient],
    channels: [channel],
    priority: 'low',
    subject: 'Test Notification',
    body: `This is a test notification sent via ${channel} channel.`,
    metadata: {
    },
  });

  res.json({
    success: true,
    notificationId: notification.id,
    message: `Test notification sent via ${channel}`,
  });
}));

// Get notification statistics
router.get('/statistics', asyncHandler(async (req: Request, res: Response) => {
  const { period = '7d' } = req.query;

  // Mock statistics
  const statistics = {
    period,
    summary: {
      totalSent: 1250,
      successRate: 0.98,
      failureRate: 0.02,
      averageDeliveryTime: 2.5, // seconds
    },
    byChannel: {
      email: {
        sent: 650,
        delivered: 640,
        failed: 10,
        averageDeliveryTime: 1.2,
      },
      teams: {
        sent: 350,
        delivered: 345,
        failed: 5,
        averageDeliveryTime: 2.8,
      },
      slack: {
        sent: 150,
        delivered: 148,
        failed: 2,
        averageDeliveryTime: 3.1,
      },
      sms: {
        sent: 100,
        delivered: 98,
        failed: 2,
        averageDeliveryTime: 4.5,
      },
    },
    byPriority: {
      critical: { sent: 125, deliveryRate: 0.99 },
      high: { sent: 350, deliveryRate: 0.98 },
      medium: { sent: 550, deliveryRate: 0.97 },
      low: { sent: 225, deliveryRate: 0.96 },
    },
    trends: {
      daily: [
        { date: new Date(Date.now() - 86400000), sent: 178, delivered: 175 },
        { date: new Date(), sent: 165, delivered: 162 },
      ],
    },
  };

  res.json(statistics);
}));

// Create default notification templates
router.post('/templates/defaults', asyncHandler(async (req: Request, res: Response) => {
  await notificationService.createDefaultTemplates();
  
  res.json({ 
    success: true, 
    message: 'Default notification templates created successfully' 
  });
}));

export const notificationRoutes = router;