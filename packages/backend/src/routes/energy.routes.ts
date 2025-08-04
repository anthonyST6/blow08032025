import { Router, Request, Response, NextFunction } from 'express';
import { verifyToken, requireRole, UserRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';
import { landLeaseService } from '../domains/energy/landLease.service';
import { LeaseStatus } from '../domains/energy/types';
import { logger } from '../utils/logger';

const router = Router();

// Validation schemas
const createLeaseSchema = Joi.object({
  lessor: Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid('individual', 'corporation', 'trust', 'estate').required(),
    contactInfo: Joi.object({
      address: Joi.object({
        street1: Joi.string().required(),
        street2: Joi.string().optional(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        zipCode: Joi.string().required(),
        country: Joi.string().required()
      }).required(),
      phone: Joi.string().required(),
      email: Joi.string().email().required(),
      preferredContact: Joi.string().valid('email', 'phone', 'mail').required()
    }).required(),
    ownership: Joi.object({
      percentage: Joi.number().min(0).max(100).required(),
      type: Joi.string().valid('fee_simple', 'life_estate', 'remainder', 'joint_tenancy').required()
    }).required()
  }).required(),
  lessee: Joi.object({
    companyName: Joi.string().required(),
    operatorNumber: Joi.string().optional(),
    contactInfo: Joi.object().required()
  }).required(),
  property: Joi.object({
    legalDescription: Joi.string().required(),
    county: Joi.string().required(),
    state: Joi.string().required(),
    acres: Joi.number().positive().required(),
    mineralRights: Joi.object({
      type: Joi.string().valid('full', 'partial', 'surface_only').required(),
      percentage: Joi.number().min(0).max(100).optional()
    }).required()
  }).required(),
  terms: Joi.object({
    effectiveDate: Joi.date().required(),
    primaryTerm: Joi.object({
      years: Joi.number().positive().required()
    }).required(),
    bonus: Joi.object({
      amount: Joi.number().positive().required(),
      perAcre: Joi.boolean().required()
    }).required(),
    rentals: Joi.object({
      annualAmount: Joi.number().positive().required(),
      perAcre: Joi.boolean().required(),
      dueDate: Joi.string().pattern(/^\d{2}-\d{2}$/).required(),
      gracePeriodDays: Joi.number().min(0).required()
    }).required()
  }).required(),
  royalties: Joi.object({
    percentage: Joi.number().min(0).max(100).required(),
    minimumRoyalty: Joi.number().optional(),
    deductions: Joi.array().items(Joi.object({
      type: Joi.string().valid('transportation', 'processing', 'marketing', 'taxes').required(),
      percentage: Joi.number().optional(),
      fixedAmount: Joi.number().optional(),
      description: Joi.string().required()
    })).required(),
    paymentFrequency: Joi.string().valid('monthly', 'quarterly', 'annually').required(),
    auditable: Joi.boolean().required()
  }).required()
});

const updateLeaseSchema = Joi.object({
  status: Joi.string().valid(...Object.values(LeaseStatus)).optional(),
  terms: Joi.object().optional(),
  royalties: Joi.object().optional()
});

const processPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  paymentDate: Joi.date().optional(),
  period: Joi.string().optional()
});

const addDocumentSchema = Joi.object({
  type: Joi.string().required(),
  title: Joi.string().required(),
  fileUrl: Joi.string().uri().required(),
  uploadedBy: Joi.string().required(),
  metadata: Joi.object().optional()
});

// Routes

// Create a new land lease
router.post('/leases', 
  verifyToken,
  requireRole([UserRole.ADMIN, UserRole.AI_RISK_OFFICER]),
  validateRequest(createLeaseSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lease = await landLeaseService.createLease(req.body);
      res.status(201).json({
        success: true,
        data: lease
      });
    } catch (error) {
      logger.error('Error creating lease', error);
      next(error);
    }
  }
);

// Get all leases with optional filtering
router.get('/leases',
  verifyToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = {
        status: req.query.status as LeaseStatus,
        lesseeId: req.query.lesseeId as string,
        lessorId: req.query.lessorId as string,
        expiringWithinDays: req.query.expiringWithinDays ? parseInt(req.query.expiringWithinDays as string) : undefined
      };

      const leases = await landLeaseService.getLeases(filters);
      res.json({
        success: true,
        data: leases,
        count: leases.length
      });
    } catch (error) {
      logger.error('Error fetching leases', error);
      next(error);
    }
  }
);

// Get lease by ID
router.get('/leases/:leaseId',
  verifyToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lease = await landLeaseService.getLeaseById(req.params.leaseId);
      if (!lease) {
        return res.status(404).json({
          success: false,
          error: 'Lease not found'
        });
      }

      return res.json({
        success: true,
        data: lease
      });
    } catch (error) {
      logger.error('Error fetching lease', error);
      return next(error);
    }
  }
);

// Update lease
router.patch('/leases/:leaseId',
  verifyToken,
  requireRole([UserRole.ADMIN, UserRole.AI_RISK_OFFICER]),
  validateRequest(updateLeaseSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lease = await landLeaseService.updateLease(req.params.leaseId, req.body);
      res.json({
        success: true,
        data: lease
      });
    } catch (error) {
      logger.error('Error updating lease', error);
      next(error);
    }
  }
);

// Add document to lease
router.post('/leases/:leaseId/documents',
  verifyToken,
  requireRole([UserRole.ADMIN, UserRole.AI_RISK_OFFICER]),
  validateRequest(addDocumentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const document = await landLeaseService.addDocument(req.params.leaseId, req.body);
      res.status(201).json({
        success: true,
        data: document
      });
    } catch (error) {
      logger.error('Error adding document', error);
      next(error);
    }
  }
);

// Process rental payment
router.post('/leases/:leaseId/payments/rental',
  verifyToken,
  requireRole([UserRole.ADMIN, UserRole.AI_RISK_OFFICER]),
  validateRequest(processPaymentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await landLeaseService.processRentalPayment(
        req.params.leaseId,
        req.body.amount,
        req.body.paymentDate || new Date()
      );
      
      res.json({
        success: true,
        message: 'Rental payment processed successfully'
      });
    } catch (error) {
      logger.error('Error processing rental payment', error);
      next(error);
    }
  }
);

// Process royalty payment
router.post('/leases/:leaseId/payments/royalty',
  verifyToken,
  requireRole([UserRole.ADMIN, UserRole.AI_RISK_OFFICER]),
  validateRequest(processPaymentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await landLeaseService.processRoyaltyPayment(
        req.params.leaseId,
        req.body.amount,
        req.body.period || new Date().toISOString().slice(0, 7) // Default to current month
      );
      
      res.json({
        success: true,
        message: 'Royalty payment processed successfully'
      });
    } catch (error) {
      logger.error('Error processing royalty payment', error);
      next(error);
    }
  }
);

// Get upcoming expirations
router.get('/expirations',
  verifyToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const daysAhead = req.query.daysAhead ? parseInt(req.query.daysAhead as string) : 90;
      const expirations = await landLeaseService.getUpcomingExpirations(daysAhead);
      
      res.json({
        success: true,
        data: expirations,
        count: expirations.length
      });
    } catch (error) {
      logger.error('Error fetching expirations', error);
      next(error);
    }
  }
);

// Get compliance status for a lease
router.get('/leases/:leaseId/compliance',
  verifyToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const compliance = await landLeaseService.getLeaseComplianceStatus(req.params.leaseId);
      
      res.json({
        success: true,
        data: compliance,
        summary: {
          total: compliance.length,
          compliant: compliance.filter(c => c.status === 'compliant').length,
          nonCompliant: compliance.filter(c => c.status === 'non_compliant').length,
          pendingReview: compliance.filter(c => c.status === 'pending_review').length
        }
      });
    } catch (error) {
      logger.error('Error fetching compliance status', error);
      next(error);
    }
  }
);

// Add lease event
router.post('/leases/:leaseId/events',
  verifyToken,
  requireRole([UserRole.ADMIN, UserRole.AI_RISK_OFFICER]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const event = await landLeaseService.addLeaseEvent(req.params.leaseId, req.body);
      res.status(201).json({
        success: true,
        data: event
      });
    } catch (error) {
      logger.error('Error adding lease event', error);
      next(error);
    }
  }
);

export default router;