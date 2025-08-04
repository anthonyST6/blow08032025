import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { leaseService } from '../../services/lease.service';
import { gisService } from '../../services/gis.service';
import { financialService } from '../../services/financial.service';
import { contractService } from '../../services/contract.service';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createLeaseSchema = z.object({
  name: z.string().min(1),
  lessor: z.string().min(1),
  lessee: z.string().min(1),
  location: z.object({
    state: z.string(),
    county: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
  }),
  acreage: z.number().positive(),
  effectiveDate: z.string().datetime(),
  expirationDate: z.string().datetime(),
  royaltyRate: z.number().min(0).max(1),
  bonusPayment: z.number().min(0),
  status: z.enum(['active', 'expired', 'terminated', 'pending']).optional(),
});

const updateLeaseSchema = createLeaseSchema.partial();

const leaseActionSchema = z.object({
  type: z.enum(['renew', 'terminate', 'renegotiate', 'extend', 'audit']),
  reason: z.string().optional(),
  parameters: z.record(z.any()).optional(),
});

// Get all leases with filtering and pagination
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { 
    status, 
    expiringWithinDays, 
    page = '1', 
    limit = '20',
    sortBy = 'expirationDate',
    sortOrder = 'asc'
  } = req.query;

  const filters: any = {};
  if (status) filters.status = status;
  if (expiringWithinDays) {
    const days = parseInt(expiringWithinDays as string);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    filters.expirationDate = { $lte: futureDate };
  }

  const leases = await leaseService.getLeases({
    filters,
    page: parseInt(page as string),
    limit: parseInt(limit as string),
    sortBy: sortBy as string,
    sortOrder: sortOrder as 'asc' | 'desc',
  });

  res.json(leases);
}));

// Get lease by ID with full details
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const lease = await leaseService.getLease(req.params.id);
  
  if (!lease) {
    return res.status(404).json({ error: 'Lease not found' });
  }

  // Enrich with additional data
  const [financials, geoJson] = await Promise.all([
    financialService.analyzeLeaseFinancials(lease),
    gisService.leasesToGeoJSON([lease]),
  ]);

  res.json({
    ...lease,
    financials,
    geoJson: geoJson.features[0],
  });
}));

// Create new lease
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createLeaseSchema.parse(req.body);
  const lease = await leaseService.createLease(validatedData);
  
  res.status(201).json(lease);
}));

// Update lease
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const validatedData = updateLeaseSchema.parse(req.body);
  const lease = await leaseService.updateLease(req.params.id, validatedData);
  
  if (!lease) {
    return res.status(404).json({ error: 'Lease not found' });
  }

  res.json(lease);
}));

// Execute lease action
router.post('/:id/actions', asyncHandler(async (req: Request, res: Response) => {
  const validatedData = leaseActionSchema.parse(req.body);
  const userId = (req as any).user?.id || 'system';
  
  const result = await leaseService.executeLeaseAction(
    req.params.id,
    validatedData.type,
    userId,
    validatedData.reason,
    validatedData.parameters
  );

  res.json(result);
}));

// Get lease action history
router.get('/:id/actions', asyncHandler(async (req: Request, res: Response) => {
  const actions = await leaseService.getLeaseActions(req.params.id);
  res.json(actions);
}));

// Analyze lease contract
router.post('/:id/analyze-contract', asyncHandler(async (req: Request, res: Response) => {
  const { documentText, fileName } = req.body;
  
  if (!documentText) {
    return res.status(400).json({ error: 'Document text is required' });
  }

  const analysis = await contractService.analyzeContract(documentText, {
    fileName: fileName || 'contract.pdf',
    leaseId: req.params.id,
  });

  res.json(analysis);
}));

// Get lease financial analysis
router.get('/:id/financials', asyncHandler(async (req: Request, res: Response) => {
  const lease = await leaseService.getLease(req.params.id);
  
  if (!lease) {
    return res.status(404).json({ error: 'Lease not found' });
  }

  const analysis = await financialService.analyzeLeaseFinancials(lease);
  res.json(analysis);
}));

// Get portfolio analysis
router.post('/portfolio/analyze', asyncHandler(async (req: Request, res: Response) => {
  const { leaseIds, marketData } = req.body;
  
  if (!leaseIds || !Array.isArray(leaseIds)) {
    return res.status(400).json({ error: 'Lease IDs array is required' });
  }

  const leases = await Promise.all(
    leaseIds.map(id => leaseService.getLease(id))
  );

  const validLeases = leases.filter(lease => lease !== null);
  const analysis = await financialService.analyzePortfolio(validLeases as any, marketData);

  res.json(analysis);
}));

// Get GeoJSON for mapping
router.get('/:id/geojson', asyncHandler(async (req: Request, res: Response) => {
  const lease = await leaseService.getLease(req.params.id);
  
  if (!lease) {
    return res.status(404).json({ error: 'Lease not found' });
  }

  const geoJson = await gisService.leasesToGeoJSON([lease]);
  res.json(geoJson.features[0]);
}));

// Bulk operations
router.post('/bulk/geojson', asyncHandler(async (req: Request, res: Response) => {
  const { leaseIds } = req.body;
  
  if (!leaseIds || !Array.isArray(leaseIds)) {
    return res.status(400).json({ error: 'Lease IDs array is required' });
  }

  const leases = await Promise.all(
    leaseIds.map(id => leaseService.getLease(id))
  );

  const validLeases = leases.filter(lease => lease !== null);
  const geoJson = await gisService.leasesToGeoJSON(validLeases as any);

  res.json(geoJson);
}));

// Risk heatmap
router.post('/analysis/risk-heatmap', asyncHandler(async (req: Request, res: Response) => {
  const { bounds, riskFactors } = req.body;
  
  const heatmap = await gisService.generateRiskHeatmap(bounds, riskFactors);
  res.json(heatmap);
}));

export const leaseRoutes = router;