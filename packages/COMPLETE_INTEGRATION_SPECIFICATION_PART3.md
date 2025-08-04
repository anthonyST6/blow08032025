# Complete System Integration Specification - Part 3

## 9. Mission Control → Other Dashboards Integration (Continued)

### Backend Work Required (Continued):
```typescript
      case 'energy':
        return await this.getEnergyMetrics(filters);
      case 'insurance':
        return await this.getInsuranceMetrics(filters);
      case 'compliance':
        return await this.getComplianceMetrics(filters);
      default:
        throw new Error(`Unknown dashboard: ${dashboardId}`);
    }
  }
}
```

## 10. Integration Test Suite

### Frontend Integration Tests:
```typescript
// File: packages/frontend/src/tests/integration/system.integration.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Mock server setup
const server = setupServer(
  rest.get('/api/usecases/:id/leases', (req, res, ctx) => {
    return res(ctx.json({ leases: mockLeases }));
  }),
  
  rest.post('/api/audit-trail/batch', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  }),
  
  rest.post('/api/vanguards/execute', (req, res, ctx) => {
    return res(ctx.json({ executionId: 'exec-123' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('End-to-End Integration Tests', () => {
  test('Complete use case flow', async () => {
    const user = userEvent.setup();
    
    // 1. Login
    render(<App />);
    
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Login' }));
    
    // 2. Navigate to Mission Control
    await waitFor(() => {
      expect(screen.getByText('Mission Control')).toBeInTheDocument();
    });
    
    // 3. Select use case
    await user.click(screen.getByText('Oilfield Land Lease'));
    
    // Verify persistence
    expect(localStorage.getItem('mission-control-state')).toContain('energy-oilfield-land-lease');
    
    // 4. Navigate to Use Case Dashboard
    await user.click(screen.getByText('Go to Dashboard'));
    
    await waitFor(() => {
      expect(screen.getByText('Oilfield Land Lease Dashboard')).toBeInTheDocument();
    });
    
    // 5. Verify data loads
    await waitFor(() => {
      expect(screen.getByText('Active Leases')).toBeInTheDocument();
    });
    
    // 6. Execute Vanguard action
    await user.click(screen.getByText('Run Analysis'));
    
    await waitFor(() => {
      expect(screen.getByText('Analysis Complete')).toBeInTheDocument();
    });
    
    // 7. Generate report
    await user.click(screen.getByText('Generate Report'));
    
    await waitFor(() => {
      expect(screen.getByText('Report Ready')).toBeInTheDocument();
    });
  });
  
  test('WebSocket real-time updates', async () => {
    // Mock WebSocket
    const mockWS = new MockWebSocket('ws://localhost:3001');
    global.WebSocket = jest.fn(() => mockWS);
    
    render(<UseCaseDashboard />);
    
    // Simulate real-time update
    mockWS.simulateMessage({
      event: 'lease.updated',
      data: { leaseId: 'lease-123', status: 'renewed' }
    });
    
    await waitFor(() => {
      expect(screen.getByText('Lease Updated')).toBeInTheDocument();
    });
  });
  
  test('Error handling and recovery', async () => {
    // Simulate API failure
    server.use(
      rest.get('/api/usecases/:id/leases', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );
    
    render(<UseCaseDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load data')).toBeInTheDocument();
    });
    
    // Test retry
    await userEvent.click(screen.getByText('Retry'));
    
    // Restore normal response
    server.use(
      rest.get('/api/usecases/:id/leases', (req, res, ctx) => {
        return res(ctx.json({ leases: mockLeases }));
      })
    );
    
    await waitFor(() => {
      expect(screen.getByText('Active Leases')).toBeInTheDocument();
    });
  });
});

// File: packages/frontend/src/tests/integration/persistence.test.tsx
describe('Persistence Integration', () => {
  test('State persists across page reloads', async () => {
    const { rerender } = render(<App />);
    
    // Select use case
    await userEvent.click(screen.getByText('Oilfield Land Lease'));
    
    // Unmount and remount (simulating page reload)
    rerender(<App />);
    
    // Verify selection persists
    await waitFor(() => {
      expect(screen.getByText('Selected: Oilfield Land Lease')).toBeInTheDocument();
    });
  });
  
  test('Cross-dashboard state sharing', async () => {
    render(<App />);
    
    // Set filter in Mission Control
    await userEvent.selectOptions(screen.getByLabelText('Date Range'), '30-days');
    
    // Navigate to Energy Dashboard
    await userEvent.click(screen.getByText('Energy Dashboard'));
    
    // Verify filter is applied
    await waitFor(() => {
      expect(screen.getByLabelText('Date Range')).toHaveValue('30-days');
    });
  });
});
```

### Backend Integration Tests:
```typescript
// File: packages/backend/src/tests/integration/api.integration.test.ts
import request from 'supertest';
import { app } from '../../app';
import { db } from '../../config/firebase';
import { generateTestToken } from '../utils/auth';

describe('API Integration Tests', () => {
  let authToken: string;
  
  beforeAll(async () => {
    authToken = await generateTestToken({ uid: 'test-user', role: 'admin' });
  });
  
  describe('Use Case API', () => {
    test('GET /api/usecases/:id/leases returns lease data', async () => {
      const response = await request(app)
        .get('/api/usecases/energy-oilfield-land-lease/leases')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('leases');
      expect(Array.isArray(response.body.leases)).toBe(true);
    });
    
    test('PATCH /api/leases/:id updates lease', async () => {
      const leaseId = 'test-lease-123';
      const updates = { status: 'renewed' };
      
      const response = await request(app)
        .patch(`/api/leases/${leaseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);
      
      expect(response.body.status).toBe('renewed');
    });
  });
  
  describe('Audit Trail API', () => {
    test('POST /api/audit-trail/batch saves audit logs', async () => {
      const entries = [
        {
          id: 'audit-1',
          timestamp: new Date().toISOString(),
          action: 'LEASE_VIEWED',
          resource: 'lease-123'
        }
      ];
      
      const response = await request(app)
        .post('/api/audit-trail/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ entries })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
    });
  });
  
  describe('WebSocket Integration', () => {
    test('WebSocket authentication', (done) => {
      const io = require('socket.io-client');
      const socket = io('http://localhost:3001', {
        query: { token: authToken }
      });
      
      socket.on('connect', () => {
        expect(socket.connected).toBe(true);
        socket.disconnect();
        done();
      });
      
      socket.on('connect_error', (error) => {
        done(error);
      });
    });
    
    test('WebSocket event subscription', (done) => {
      const io = require('socket.io-client');
      const socket = io('http://localhost:3001', {
        query: { token: authToken }
      });
      
      socket.on('connect', () => {
        socket.emit('subscribe', { event: 'lease.updated' });
        
        socket.on('lease.updated', (data) => {
          expect(data).toHaveProperty('leaseId');
          socket.disconnect();
          done();
        });
        
        // Trigger event from server
        setTimeout(() => {
          wsServer.emitToEvent('lease.updated', {
            leaseId: 'test-123',
            updates: { status: 'renewed' }
          });
        }, 100);
      });
    });
  });
  
  describe('Vanguard Agent Integration', () => {
    test('Execute agent and poll for results', async () => {
      // Start execution
      const execResponse = await request(app)
        .post('/api/vanguards/execute')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          agentId: 'renewal-analysis',
          parameters: { leaseId: 'lease-123' }
        })
        .expect(200);
      
      const { executionId } = execResponse.body;
      
      // Poll for results
      let attempts = 0;
      let result;
      
      while (attempts < 10) {
        const statusResponse = await request(app)
          .get(`/api/vanguards/status/${executionId}`)
          .set('Authorization', `Bearer ${authToken}`);
        
        if (statusResponse.body.state === 'completed') {
          result = statusResponse.body.result;
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('recommendations');
    });
  });
});

// File: packages/backend/src/tests/integration/workflow.integration.test.ts
describe('Complete Workflow Integration', () => {
  test('End-to-end lease renewal workflow', async () => {
    const userId = 'test-user';
    const leaseId = 'test-lease-456';
    
    // 1. Create lease
    const lease = await leaseService.createLease({
      id: leaseId,
      leaseNumber: 'TEST-2024-001',
      status: 'active',
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    
    // 2. Execute Vanguard analysis
    const execution = await vanguardService.executeAgent(
      'exec-test-1',
      'renewal-analysis',
      { leaseId }
    );
    
    expect(execution.result.recommendation).toBe('renew');
    
    // 3. Generate report
    const report = await reportService.generateReport('report-test-1', {
      userId,
      useCaseId: 'energy-oilfield-land-lease',
      type: 'renewal-recommendation',
      format: 'pdf'
    });
    
    expect(report.downloadUrl).toBeDefined();
    
    // 4. Update lease status
    const updatedLease = await leaseService.updateLease(leaseId, {
      status: 'renewal-pending'
    });
    
    // 5. Verify audit trail
    const auditLogs = await auditService.queryAuditLogs({
      resource: leaseId,
      startDate: new Date(Date.now() - 60000)
    });
    
    expect(auditLogs.length).toBeGreaterThan(0);
    expect(auditLogs.some(log => log.action === 'LEASE_UPDATED')).toBe(true);
  });
});
```

## 11. Performance and Load Testing

### Frontend Performance Tests:
```typescript
// File: packages/frontend/src/tests/performance/dashboard.perf.test.ts
import { measurePerformance } from '../utils/performance';

describe('Dashboard Performance Tests', () => {
  test('Initial load performance', async () => {
    const metrics = await measurePerformance(async () => {
      render(<UseCaseDashboard />);
      await waitFor(() => screen.getByText('Active Leases'));
    });
    
    expect(metrics.duration).toBeLessThan(3000); // 3 seconds
    expect(metrics.memoryUsed).toBeLessThan(50 * 1024 * 1024); // 50MB
  });
  
  test('Large dataset rendering', async () => {
    // Mock 1000 leases
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      id: `lease-${i}`,
      leaseNumber: `TEST-${i}`,
      status: 'active'
    }));
    
    server.use(
      rest.get('/api/usecases/:id/leases', (req, res, ctx) => {
        return res(ctx.json({ leases: largeDataset }));
      })
    );
    
    const metrics = await measurePerformance(async () => {
      render(<LeaseTable />);
      await waitFor(() => screen.getByText('TEST-999'));
    });
    
    expect(metrics.duration).toBeLessThan(5000); // 5 seconds
    expect(metrics.fps).toBeGreaterThan(30); // 30 FPS minimum
  });
});
```

### Backend Load Tests:
```typescript
// File: packages/backend/src/tests/load/api.load.test.ts
import autocannon from 'autocannon';

describe('API Load Tests', () => {
  test('Lease API handles 100 concurrent requests', async () => {
    const result = await autocannon({
      url: 'http://localhost:3000/api/usecases/energy-oilfield-land-lease/leases',
      connections: 100,
      duration: 30,
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });
    
    expect(result.errors).toBe(0);
    expect(result.timeouts).toBe(0);
    expect(result.requests.average).toBeGreaterThan(100); // 100 req/sec
    expect(result.latency.p99).toBeLessThan(1000); // 99th percentile < 1s
  });
  
  test('WebSocket handles 500 concurrent connections', async () => {
    const connections = [];
    
    for (let i = 0; i < 500; i++) {
      const socket = io('http://localhost:3001', {
        query: { token: testToken }
      });
      connections.push(socket);
    }
    
    // Wait for all connections
    await Promise.all(
      connections.map(socket => 
        new Promise(resolve => socket.on('connect', resolve))
      )
    );
    
    // Send messages
    const startTime = Date.now();
    connections.forEach(socket => {
      socket.emit('subscribe', { event: 'test' });
    });
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000); // All subscriptions within 5s
    
    // Cleanup
    connections.forEach(socket => socket.disconnect());
  });
});
```

## 12. Monitoring and Observability

### Frontend Monitoring:
```typescript
// File: packages/frontend/src/services/monitoring.service.ts
export class MonitoringService {
  private metrics: any[] = [];
  
  trackApiCall(endpoint: string, duration: number, status: number) {
    this.metrics.push({
      type: 'api_call',
      endpoint,
      duration,
      status,
      timestamp: Date.now()
    });
    
    // Send to backend every 30 seconds
    this.flushMetrics();
  }
  
  trackError(error: Error, context: any) {
    this.metrics.push({
      type: 'error',
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now()
    });
    
    // Send immediately for errors
    this.flushMetrics(true);
  }
  
  trackUserAction(action: string, metadata: any) {
    this.metrics.push({
      type: 'user_action',
      action,
      metadata,
      timestamp: Date.now()
    });
  }
  
  private async flushMetrics(immediate = false) {
    if (!immediate && this.metrics.length < 10) {
      return;
    }
    
    const metricsToSend = [...this.metrics];
    this.metrics = [];
    
    try {
      await fetch('/api/monitoring/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ metrics: metricsToSend })
      });
    } catch (error) {
      // Store failed metrics for retry
      this.metrics.unshift(...metricsToSend);
    }
  }
}
```

### Backend Monitoring:
```typescript
// File: packages/backend/src/middleware/monitoring.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Counter, Histogram, register } from 'prom-client';

// Prometheus metrics
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const wsConnectionsGauge = new Gauge({
  name: 'websocket_connections',
  help: 'Number of active WebSocket connections'
});

export const monitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const labels = {
      method: req.method,
      route: req.route?.path || 'unknown',
      status: res.statusCode.toString()
    };
    
    httpRequestDuration.observe(labels, duration);
    httpRequestTotal.inc(labels);
    
    // Log slow requests
    if (duration > 1) {
      logger.warn('Slow request detected', {
        ...labels,
        duration,
        url: req.url,
        userId: req.user?.uid
      });
    }
  });
  
  next();
};

// Metrics endpoint
router.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});
```

## Summary of All Integration Work

### Frontend Integration Tasks:
1. **API Service Layer** - Replace all mock data with real API calls
2. **Error Boundaries** - Add comprehensive error handling
3. **Loading States** - Implement skeleton screens and spinners
4. **WebSocket Client** - Real-time update subscriptions
5. **Audit Logger Enhancement** - Batch processing and offline queue
6. **File Upload UI** - Progress tracking and error handling
7. **Auth Interceptors** - Token refresh and session management
8. **Report Generation UI** - Progress tracking and download handling
9. **Template Registry** - Dynamic loading and fallbacks
10. **Cross-Dashboard State** - Shared state management
11. **Performance Monitoring** - Track metrics and errors
12. **Integration Tests** - Comprehensive test coverage

### Backend Integration Tasks:
1. **API Routes** - All CRUD operations for use cases
2. **WebSocket Server** - Real-time event broadcasting
3. **Audit Service** - Batch processing and querying
4. **Vanguard Queue** - Agent execution pipeline
5. **File Processing** - Upload and data extraction
6. **Auth Middleware** - Token validation and RBAC
7. **Report Generation** - PDF/Excel creation
8. **Template Service** - Dynamic configuration
9. **Dashboard State API** - Cross-dashboard persistence
10. **Monitoring** - Prometheus metrics and logging
11. **Load Balancing** - Handle concurrent requests
12. **Integration Tests** - API and workflow testing

### Infrastructure Requirements:
1. **Redis** - For queues and caching
2. **PostgreSQL/Firestore** - For data persistence
3. **S3/Cloud Storage** - For file uploads and reports
4. **WebSocket Server** - For real-time updates
5. **Queue Workers** - For background processing
6. **Monitoring Stack** - Prometheus + Grafana
7. **Load Balancer** - For scaling
8. **CI/CD Pipeline** - For automated testing

This completes the comprehensive integration specification for the Seraphim Vanguards platform.