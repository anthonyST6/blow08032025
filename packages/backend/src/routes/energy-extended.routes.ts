import { Router } from 'express';
import { verifyToken, requireRole, UserRole } from '../middleware/auth';
import { validateRequest, validateQuery } from '../middleware/validation';
import { multiPartyAgreementService } from '../domains/energy/multiPartyAgreement.service';
import { complianceService } from '../domains/energy/compliance.service';
import { expirationMonitoringService } from '../domains/energy/expirationMonitoring.service';
import { analyticsService } from '../domains/energy/analytics.service';
import Joi from 'joi';

const router = Router();

// Multi-Party Agreement Routes
router.post(
  '/agreements',
  verifyToken,
  requireRole([UserRole.ADMIN, UserRole.AI_RISK_OFFICER]),
  validateRequest(
    Joi.object({
      type: Joi.string().valid('joint_operating', 'unitization', 'pooling', 'farmout').required(),
      name: Joi.string().required(),
      parties: Joi.array().items(Joi.object({
        partyId: Joi.string().required(),
        name: Joi.string().required(),
        role: Joi.string().valid('operator', 'non_operator', 'working_interest_owner').required(),
        contactInfo: Joi.object().required(),
        votingRights: Joi.boolean(),
        initialContribution: Joi.number()
      })).min(2).required(),
      terms: Joi.object({
        effectiveDate: Joi.date().required(),
        expirationDate: Joi.date(),
        areaOfMutualInterest: Joi.object({
          description: Joi.string().required(),
          acres: Joi.number().required(),
          duration: Joi.number().required()
        }),
        operatingProvisions: Joi.array().items(Joi.string()),
        accountingProcedure: Joi.string().valid('COPAS', 'custom').required()
      }).required()
    })
  ),
  async (req, res, next) => {
    try {
      const agreement = await multiPartyAgreementService.createAgreement(req.body);
      res.status(201).json(agreement);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/agreements/:id',
  verifyToken,
  requireRole([UserRole.ADMIN, UserRole.AI_RISK_OFFICER, UserRole.COMPLIANCE_REVIEWER]),
  async (req, res, next) => {
    try {
      const agreement = await multiPartyAgreementService.getAgreement(req.params.id);
      if (!agreement) {
        return res.status(404).json({ error: 'Agreement not found' });
      }
      return res.json(agreement);
    } catch (error) {
      return next(error);
    }
  }
);

router.put(
  '/agreements/:id/working-interests',
  verifyToken,
  requireRole([UserRole.ADMIN, UserRole.AI_RISK_OFFICER]),
  validateRequest(
    Joi.object({
      interests: Joi.array().items(Joi.object({
        partyId: Joi.string().required(),
        percentage: Joi.number().min(0).max(1).required(),
        nri: Joi.number().min(0).max(1).required(),
        effectiveDate: Joi.date().required()
      })).required()
    })
  ),
  async (req, res, next) => {
    try {
      await multiPartyAgreementService.updateWorkingInterests(
        req.params.id,
        req.body.interests
      );
      res.json({ message: 'Working interests updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/agreements/:id/amendments',
  verifyToken,
  requireRole([UserRole.ADMIN, UserRole.AI_RISK_OFFICER]),
  validateRequest(
    Joi.object({
      proposedBy: Joi.string().required(),
      description: Joi.string().required(),
      changes: Joi.object().required()
    })
  ),
  async (req, res, next) => {
    try {
      const amendment = await multiPartyAgreementService.addAmendment(
        req.params.id,
        req.body
      );
      res.status(201).json(amendment);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/agreements/:id/disputes',
  verifyToken,
  requireRole([UserRole.ADMIN, UserRole.AI_RISK_OFFICER]),
  validateRequest(
    Joi.object({
      raisedBy: Joi.string().required(),
      subject: Joi.string().required(),
      description: Joi.string().required()
    })
  ),
  async (req, res, next) => {
    try {
      const dispute = await multiPartyAgreementService.recordDispute(
        req.params.id,
        req.body
      );
      res.status(201).json(dispute);
    } catch (error) {
      next(error);
    }
  }
);

// Compliance Routes
router.post(
  '/compliance/requirements',
  verifyToken,
  requireRole([UserRole.ADMIN, UserRole.COMPLIANCE_REVIEWER]),
  validateRequest(
    Joi.object({
      category: Joi.string().valid(
        'regulatory', 'contractual', 'environmental',
        'financial', 'operational', 'reporting'
      ).required(),
      description: Joi.string().required(),
      frequency: Joi.string().valid(
        'one_time', 'monthly', 'quarterly', 'annually'
      ).required(),
      applicableTo: Joi.array().items(Joi.string()).required(),
      automationRules: Joi.array().items(Joi.object({
        trigger: Joi.string().valid(
          'date_based', 'event_based', 'threshold_based', 'manual'
        ).required(),
        conditions: Joi.array().items(Joi.object({
          field: Joi.string().required(),
          operator: Joi.string().valid(
            'equals', 'not_equals', 'greater_than', 'less_than', 'contains'
          ).required(),
          value: Joi.any().required()
        })).required(),
        actions: Joi.array().items(Joi.object({
          type: Joi.string().valid(
            'notify', 'create_task', 'update_status', 'generate_report'
          ).required(),
          parameters: Joi.object().required()
        })).required(),
        enabled: Joi.boolean().default(true)
      }))
    })
  ),
  async (req, res, next) => {
    try {
      const requirement = await complianceService.createRequirement(req.body);
      res.status(201).json(requirement);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/compliance/requirements/:id/check',
  verifyToken,
  requireRole([UserRole.ADMIN, UserRole.COMPLIANCE_REVIEWER]),
  async (req, res, next) => {
    try {
      const status = await complianceService.checkCompliance(req.params.id);
      res.json({ status });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/compliance/requirements',
  verifyToken,
  requireRole([UserRole.ADMIN, UserRole.COMPLIANCE_REVIEWER, UserRole.AI_RISK_OFFICER]),
  async (req, res, next) => {
    try {
      const { category, days } = req.query;
      
      let requirements;
      if (category) {
        requirements = await complianceService.getRequirementsByCategory(
          category as any
        );
      } else if (days) {
        requirements = await complianceService.getUpcomingRequirements(
          parseInt(days as string)
        );
      } else {
        requirements = await complianceService.getUpcomingRequirements();
      }
      
      res.json(requirements);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/compliance/violations',
  verifyToken,
  requireRole([UserRole.ADMIN, UserRole.COMPLIANCE_REVIEWER, UserRole.AI_RISK_OFFICER]),
  async (req, res, next) => {
    try {
      const { status } = req.query;
      const violations = await complianceService.getViolations(status as any);
      res.json(violations);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/compliance/violations/:id/resolve',
  verifyToken,
  requireRole([UserRole.ADMIN, UserRole.COMPLIANCE_REVIEWER]),
  validateRequest(
    Joi.object({
      resolution: Joi.string().required(),
      resolvedBy: Joi.string().required()
    })
  ),
  async (req, res, next) => {
    try {
      await complianceService.resolveViolation(
        req.params.id,
        req.body.resolution,
        req.body.resolvedBy
      );
      res.json({ message: 'Violation resolved successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// Expiration Monitoring Routes
router.post(
  '/expiration-alerts/scan',
  verifyToken,
  requireRole([UserRole.ADMIN, UserRole.AI_RISK_OFFICER]),
  async (_req, res, next) => {
    try {
      const alerts = await expirationMonitoringService.scanForExpirations();
      res.json({
        message: 'Expiration scan completed',
        alertsCreated: alerts.length,
        alerts
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/expiration-alerts',
  verifyToken,
  requireRole([UserRole.ADMIN, UserRole.AI_RISK_OFFICER, UserRole.COMPLIANCE_REVIEWER]),
  async (req, res, next) => {
    try {
      const { status, days, leaseId } = req.query;
      
      let alerts;
      if (status === 'active') {
        alerts = await expirationMonitoringService.getActiveAlerts();
      } else if (days) {
        alerts = await expirationMonitoringService.getUpcomingAlerts(
          parseInt(days as string)
        );
      } else if (leaseId) {
        alerts = await expirationMonitoringService.getAlertsByLease(
          leaseId as string
        );
      } else {
        alerts = await expirationMonitoringService.getActiveAlerts();
      }
      
      res.json(alerts);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/expiration-alerts/:id/acknowledge',
  verifyToken,
  requireRole([UserRole.ADMIN, UserRole.AI_RISK_OFFICER]),
  validateRequest(
    Joi.object({
      acknowledgedBy: Joi.string().required()
    })
  ),
  async (req, res, next) => {
    try {
      await expirationMonitoringService.acknowledgeAlert(
        req.params.id,
        req.body.acknowledgedBy
      );
      res.json({ message: 'Alert acknowledged successfully' });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/expiration-alerts/:id/resolve',
  verifyToken,
  requireRole([UserRole.ADMIN, UserRole.AI_RISK_OFFICER]),
  validateRequest(
    Joi.object({
      resolvedBy: Joi.string().required(),
      resolution: Joi.string().required()
    })
  ),
  async (req, res, next) => {
    try {
      await expirationMonitoringService.resolveAlert(
        req.params.id,
        req.body.resolvedBy,
        req.body.resolution
      );
      res.json({ message: 'Alert resolved successfully' });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/expiration-alerts/:id/notify',
  verifyToken,
  requireRole([UserRole.ADMIN, UserRole.AI_RISK_OFFICER]),
  async (req, res, next) => {
    try {
      await expirationMonitoringService.sendNotifications(req.params.id);
      res.json({ message: 'Notifications sent successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// Analytics Routes
router.get(
  '/analytics',
  verifyToken,
  requireRole([UserRole.ADMIN, UserRole.AI_RISK_OFFICER, UserRole.COMPLIANCE_REVIEWER]),
  async (_req, res, next) => {
    try {
      const analytics = await analyticsService.generateAnalytics();
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/analytics/historical',
  verifyToken,
  requireRole([UserRole.ADMIN, UserRole.AI_RISK_OFFICER]),
  validateQuery(
    Joi.object({
      startDate: Joi.date().required(),
      endDate: Joi.date().required()
    })
  ),
  async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      const analytics = await analyticsService.getHistoricalAnalytics(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/analytics/reports',
  verifyToken,
  requireRole([UserRole.ADMIN, UserRole.AI_RISK_OFFICER]),
  validateRequest(
    Joi.object({
      type: Joi.string().valid('monthly', 'quarterly', 'annual').required(),
      startDate: Joi.date().required(),
      endDate: Joi.date().required()
    })
  ),
  async (req, res, next) => {
    try {
      const { type, startDate, endDate } = req.body;
      const report = await analyticsService.generateReport(
        type,
        new Date(startDate),
        new Date(endDate)
      );
      res.status(201).json(report);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/analytics/reports',
  verifyToken,
  requireRole([UserRole.ADMIN, UserRole.AI_RISK_OFFICER, UserRole.COMPLIANCE_REVIEWER]),
  async (req, res, next) => {
    try {
      const { type } = req.query;
      const reports = await analyticsService.getReports(type as any);
      res.json(reports);
    } catch (error) {
      next(error);
    }
  }
);

export default router;