import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

const app = express();
const PORT = process.env.PORT || 3001;
const httpServer = createServer(app);

// Initialize Socket.IO for WebSocket support
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
});

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    message: 'Backend running in demo mode'
  });
});

// Basic API endpoint
app.get('/api', (_req, res) => {
  res.json({
    message: 'Seraphim Vanguard API - Demo Mode',
    endpoints: {
      health: '/health',
      api: '/api',
      usecases: '/api/usecases',
      workflows: '/api/usecase/:useCaseId/workflows',
      agents: '/api/usecase/agents/:useCaseId'
    }
  });
});

// Mock Use Cases endpoint
app.get('/api/usecases', (_req, res) => {
  const useCases = [
    {
      id: 'oilfield-land-lease',
      name: 'Oilfield Land Lease',
      description: 'Automated workflow for processing and analyzing land lease agreements, compliance checks, and renewal notifications',
      category: 'Real Estate',
      vertical: 'Energy',
      status: 'active',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-03-20'),
    },
    {
      id: 'energy-load-forecasting',
      name: 'Energy Load Forecasting',
      description: 'AI-powered workflow for predicting energy consumption patterns and optimizing grid load distribution',
      category: 'Operations',
      vertical: 'Energy',
      status: 'active',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-03-22'),
    },
    {
      id: 'insurance-claims',
      name: 'Insurance Claims Processing',
      description: 'Automated workflow for processing insurance claims with fraud detection and approval routing',
      category: 'Claims',
      vertical: 'Insurance',
      status: 'active',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-03-18'),
    },
  ];
  res.json(useCases);
});

// Get specific use case
app.get('/api/usecases/:id', (req, res) => {
  const { id } = req.params;
  
  if (id === 'oilfield-land-lease') {
    res.json({
      id: 'oilfield-land-lease',
      name: 'Oilfield Land Lease',
      description: 'Automated workflow for processing and analyzing land lease agreements, compliance checks, and renewal notifications',
      category: 'Real Estate',
      vertical: 'Energy',
      status: 'active',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-03-20'),
    });
  } else {
    res.status(404).json({ error: 'Use case not found' });
  }
});

// Get agent graph for a use case
app.get('/api/usecase/agents/:useCaseId', (req, res) => {
  const { useCaseId } = req.params;
  
  if (useCaseId === 'oilfield-land-lease') {
    res.json({
      useCaseId: 'oilfield-land-lease',
      agents: [
        {
          id: 'orchestrator',
          name: 'Oilfield Lease Orchestrator Agent',
          type: 'coordinator',
          role: 'Coordinator',
          description: 'Coordinates the entire lease analysis workflow',
          position: { x: 400, y: 50 },
          connections: ['ingest', 'risk', 'forecast', 'compliance'],
        },
        {
          id: 'ingest',
          name: 'Data Ingest Agent',
          type: 'custom',
          role: 'Data Processing',
          description: 'Ingests and validates lease data from various sources',
          position: { x: 100, y: 200 },
          connections: ['risk', 'forecast', 'compliance'],
        },
        {
          id: 'risk',
          name: 'Lease Expiration Risk Agent',
          type: 'custom',
          role: 'Risk Analysis',
          description: 'Analyzes lease expiration dates and identifies risks',
          position: { x: 250, y: 350 },
          connections: ['docgen'],
        },
        {
          id: 'forecast',
          name: 'Revenue Forecast Agent',
          type: 'custom',
          role: 'Financial Analysis',
          description: 'Forecasts revenue based on lease terms and market conditions',
          position: { x: 400, y: 350 },
          connections: ['docgen'],
        },
        {
          id: 'compliance',
          name: 'Compliance Analysis Agent',
          type: 'custom',
          role: 'Compliance',
          description: 'Checks lease agreements for regulatory compliance',
          position: { x: 550, y: 350 },
          connections: ['docgen'],
        },
        {
          id: 'docgen',
          name: 'Document Generation Agent',
          type: 'custom',
          role: 'Documentation',
          description: 'Generates compliance reports and renewal recommendations',
          position: { x: 400, y: 500 },
          connections: ['erp', 'notify'],
        },
        {
          id: 'erp',
          name: 'ERP Integration Agent',
          type: 'custom',
          role: 'Integration',
          description: 'Syncs data with external ERP systems',
          position: { x: 250, y: 650 },
          connections: [],
        },
        {
          id: 'notify',
          name: 'Notification Agent',
          type: 'custom',
          role: 'Communication',
          description: 'Sends alerts and notifications to stakeholders',
          position: { x: 550, y: 650 },
          connections: [],
        },
      ],
      connections: [
        { id: 'conn-1', from: 'orchestrator', to: 'ingest', type: 'control' },
        { id: 'conn-2', from: 'orchestrator', to: 'risk', type: 'control' },
        { id: 'conn-3', from: 'orchestrator', to: 'forecast', type: 'control' },
        { id: 'conn-4', from: 'orchestrator', to: 'compliance', type: 'control' },
        { id: 'conn-5', from: 'ingest', to: 'risk', type: 'data' },
        { id: 'conn-6', from: 'ingest', to: 'forecast', type: 'data' },
        { id: 'conn-7', from: 'ingest', to: 'compliance', type: 'data' },
        { id: 'conn-8', from: 'risk', to: 'docgen', type: 'data' },
        { id: 'conn-9', from: 'forecast', to: 'docgen', type: 'data' },
        { id: 'conn-10', from: 'compliance', to: 'docgen', type: 'data' },
        { id: 'conn-11', from: 'docgen', to: 'erp', type: 'data' },
        { id: 'conn-12', from: 'docgen', to: 'notify', type: 'data' },
      ],
      metadata: {
        lastModified: new Date(),
        modifiedBy: 'system',
        version: 1,
      },
    });
  } else {
    res.status(404).json({ error: 'Agent graph not found' });
  }
});

// Get workflows for a use case
app.get('/api/usecase/:useCaseId/workflows', (req, res) => {
  const { useCaseId } = req.params;
  
  if (useCaseId === 'oilfield-land-lease') {
    res.json([{
      id: 'workflow-oilfield-1',
      useCaseId: 'oilfield-land-lease',
      name: 'Oilfield Land Lease Management Workflow',
      description: 'End-to-end workflow for managing oilfield land leases',
      steps: [
        {
          id: 'step-1',
          name: 'Ingest Lease Data',
          agentId: 'ingest',
          order: 1,
          config: {
            sources: ['csv', 'api', 'manual'],
            validation: true,
          },
        },
        {
          id: 'step-2',
          name: 'Analyze Expirations',
          agentId: 'risk',
          order: 2,
          config: {
            thresholdDays: 90,
            riskLevels: ['high', 'medium', 'low'],
          },
        },
        {
          id: 'step-3',
          name: 'Forecast Revenue',
          agentId: 'forecast',
          order: 3,
          config: {
            forecastPeriod: '12_months',
            includeMarketData: true,
          },
        },
        {
          id: 'step-4',
          name: 'Generate Compliance Docs',
          agentId: 'docgen',
          order: 4,
          config: {
            templates: ['compliance_report', 'renewal_recommendation'],
            format: 'pdf',
          },
        },
        {
          id: 'step-5',
          name: 'Push to ERP',
          agentId: 'erp',
          order: 5,
          config: {
            system: 'SAP',
            syncMode: 'incremental',
          },
        },
      ],
      status: 'active',
      schedule: {
        type: 'scheduled',
        config: {
          cron: '0 0 * * *', // Daily at midnight
        },
      },
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-03-20'),
      lastRunAt: new Date('2024-03-25'),
      runCount: 156,
    }]);
  } else {
    res.json([]);
  }
});

// Create workflow
app.post('/api/usecase/:useCaseId/workflows', (req, res) => {
  const { useCaseId } = req.params;
  const workflow = req.body;
  
  res.status(201).json({
    ...workflow,
    id: `workflow-${Date.now()}`,
    useCaseId,
    createdAt: new Date(),
    updatedAt: new Date(),
    runCount: 0,
  });
});

// Run workflow
app.post('/api/workflows/:workflowId/run', (req, res) => {
  const { workflowId } = req.params;
  
  res.json({
    success: true,
    runId: `run-${Date.now()}`,
    workflowId,
    status: 'started',
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('[DEMO MODE] WebSocket client connected:', socket.id);
  
  // Send initial connection success
  socket.emit('connection_established', {
    message: 'Connected to Seraphim Vanguard WebSocket Server',
    timestamp: new Date().toISOString(),
  });
  
  // Handle workflow execution simulation
  socket.on('start_workflow', (data) => {
    console.log('[DEMO MODE] Starting workflow simulation:', data);
    
    // Simulate workflow progress
    const agents = ['ingest', 'risk', 'forecast', 'compliance', 'docgen', 'erp', 'notify'];
    let currentAgent = 0;
    
    const interval = setInterval(() => {
      if (currentAgent < agents.length) {
        socket.emit('agent_activity', {
          workflowId: data.workflowId,
          agentId: agents[currentAgent],
          status: 'processing',
          message: `Processing with ${agents[currentAgent]} agent`,
          timestamp: new Date().toISOString(),
        });
        
        setTimeout(() => {
          socket.emit('agent_activity', {
            workflowId: data.workflowId,
            agentId: agents[currentAgent],
            status: 'completed',
            message: `${agents[currentAgent]} agent completed successfully`,
            timestamp: new Date().toISOString(),
          });
          currentAgent++;
        }, 1500);
      } else {
        clearInterval(interval);
        socket.emit('workflow_completed', {
          workflowId: data.workflowId,
          status: 'success',
          message: 'Workflow completed successfully',
          timestamp: new Date().toISOString(),
        });
      }
    }, 3000);
  });
  
  socket.on('disconnect', () => {
    console.log('[DEMO MODE] WebSocket client disconnected:', socket.id);
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`[DEMO MODE] Seraphim Vanguard Backend running on port ${PORT}`);
  console.log(`[DEMO MODE] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[DEMO MODE] Health check: http://localhost:${PORT}/health`);
  console.log(`[DEMO MODE] WebSocket server ready for connections`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;