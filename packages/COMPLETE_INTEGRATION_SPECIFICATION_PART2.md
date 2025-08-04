# Complete System Integration Specification - Part 2

## 6. Authentication → Route Protection Validation (Continued)

### Frontend Work Required:
```typescript
// Session timeout handling (continued)
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('click', resetTimer);
    
    resetTimer();
    
    return () => {
      clearTimeout(activityTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// 2. Create protected route wrapper
// File: packages/frontend/src/components/auth/ProtectedRoute.tsx
export const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermissions?: string[];
}> = ({ children, requiredRole, requiredPermissions }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { 
        state: { from: location.pathname } 
      });
    }
  }, [user, loading, navigate]);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!user) {
    return null;
  }
  
  // Check role
  if (requiredRole && user.role !== requiredRole) {
    return <AccessDenied message="You don't have the required role" />;
  }
  
  // Check permissions
  if (requiredPermissions) {
    const hasPermissions = requiredPermissions.every(
      perm => user.permissions?.includes(perm)
    );
    
    if (!hasPermissions) {
      return <AccessDenied message="You don't have the required permissions" />;
    }
  }
  
  return <>{children}</>;
};

// 3. Create auth interceptor
// File: packages/frontend/src/services/auth.interceptor.ts
export const setupAuthInterceptor = () => {
  // Request interceptor
  axios.interceptors.request.use(
    async (config) => {
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Response interceptor
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const newToken = await authService.refreshToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          // Redirect to login
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
};
```

### Backend Work Required:
```typescript
// 1. Create auth middleware
// File: packages/backend/src/middleware/auth.middleware.ts
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = await verifyToken(token);
    
    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    // Get user from database
    const user = await userService.getUser(decoded.uid);
    
    if (!user || !user.active) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// 2. Create role-based access control
// File: packages/backend/src/middleware/rbac.middleware.ts
export const authorize = (requiredPermissions: string | string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const permissions = Array.isArray(requiredPermissions) 
      ? requiredPermissions 
      : [requiredPermissions];
    
    // Get user permissions from role
    const userPermissions = await roleService.getPermissions(user.role);
    
    const hasPermissions = permissions.every(
      perm => userPermissions.includes(perm)
    );
    
    if (!hasPermissions) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permissions,
        userPermissions 
      });
    }
    
    next();
  };
};

// 3. Create token refresh endpoint
// File: packages/backend/src/routes/auth.routes.ts
router.post('/api/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  try {
    // Verify refresh token
    const decoded = await verifyRefreshToken(refreshToken);
    
    // Check if refresh token is in database and not revoked
    const storedToken = await tokenService.getRefreshToken(refreshToken);
    
    if (!storedToken || storedToken.revoked) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    // Generate new access token
    const user = await userService.getUser(decoded.uid);
    const newAccessToken = generateAccessToken(user);
    
    res.json({
      accessToken: newAccessToken,
      expiresIn: 3600 // 1 hour
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});
```

## 7. Report Generation → Backend Integration

### Frontend Work Required:
```typescript
// 1. Create report generation service
// File: packages/frontend/src/services/report.service.ts
export class ReportService {
  async generateReport(params: ReportParams): Promise<ReportResult> {
    const response = await fetch('/api/reports/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(params)
    });
    
    const { reportId } = await response.json();
    
    // Poll for completion
    return this.pollForReport(reportId);
  }
  
  private async pollForReport(reportId: string): Promise<ReportResult> {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes
    
    while (attempts < maxAttempts) {
      const response = await fetch(`/api/reports/${reportId}/status`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      
      const status = await response.json();
      
      if (status.state === 'completed') {
        return {
          reportId,
          downloadUrl: status.downloadUrl,
          expiresAt: status.expiresAt
        };
      } else if (status.state === 'failed') {
        throw new Error(status.error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }
    
    throw new Error('Report generation timeout');
  }
  
  async downloadReport(downloadUrl: string): Promise<void> {
    const response = await fetch(downloadUrl, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.pdf';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

// 2. Create report generation component
// File: packages/frontend/src/components/reports/ReportGenerator.tsx
export const ReportGenerator: React.FC<{ useCase: UseCase }> = ({ useCase }) => {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { logAction } = useAuditLogger();
  
  // Subscribe to progress updates
  useWebSocket(`report.progress.${useCase.id}`, (data: ProgressUpdate) => {
    setProgress(data.progress);
  });
  
  const generateReport = async (type: ReportType) => {
    setGenerating(true);
    setError(null);
    setProgress(0);
    
    try {
      await logAction({
        type: 'REPORT_GENERATION_START',
        resource: useCase.id,
        details: { reportType: type }
      });
      
      const result = await reportService.generateReport({
        useCaseId: useCase.id,
        type,
        format: 'pdf',
        includeCharts: true,
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date()
        }
      });
      
      await reportService.downloadReport(result.downloadUrl);
      
      await logAction({
        type: 'REPORT_GENERATION_SUCCESS',
        resource: useCase.id,
        details: { reportId: result.reportId }
      });
    } catch (err) {
      setError(err.message);
      
      await logAction({
        type: 'REPORT_GENERATION_FAILED',
        resource: useCase.id,
        details: { error: err.message }
      });
    } finally {
      setGenerating(false);
      setProgress(0);
    }
  };
  
  return (
    <div className="report-generator">
      <h3>Generate Reports</h3>
      
      <div className="report-types">
        <button 
          onClick={() => generateReport('executive-summary')}
          disabled={generating}
        >
          Executive Summary
        </button>
        
        <button 
          onClick={() => generateReport('detailed-analysis')}
          disabled={generating}
        >
          Detailed Analysis
        </button>
        
        <button 
          onClick={() => generateReport('compliance-report')}
          disabled={generating}
        >
          Compliance Report
        </button>
      </div>
      
      {generating && (
        <div className="progress">
          <ProgressBar value={progress} />
          <span>{progress}% Complete</span>
        </div>
      )}
      
      {error && <ErrorMessage message={error} />}
    </div>
  );
};
```

### Backend Work Required:
```typescript
// 1. Create report generation routes
// File: packages/backend/src/routes/report.routes.ts
router.post('/api/reports/generate', authenticate, async (req, res) => {
  const { useCaseId, type, format, includeCharts, dateRange } = req.body;
  
  try {
    // Create report record
    const report = await reportService.createReport({
      userId: req.user.uid,
      useCaseId,
      type,
      format,
      status: 'pending',
      requestedAt: new Date()
    });
    
    // Queue for generation
    await reportQueue.add('generate', {
      reportId: report.id,
      userId: req.user.uid,
      params: { useCaseId, type, format, includeCharts, dateRange }
    });
    
    res.json({ reportId: report.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Create report generation service
// File: packages/backend/src/services/report.service.ts
export class ReportService {
  async generateReport(reportId: string, params: ReportParams) {
    try {
      // Update status
      await this.updateReport(reportId, { 
        status: 'generating',
        startedAt: new Date() 
      });
      
      // Gather data
      const data = await this.gatherReportData(params);
      
      // Generate report based on type
      let reportBuffer: Buffer;
      switch (params.format) {
        case 'pdf':
          reportBuffer = await this.generatePDF(params.type, data);
          break;
        case 'excel':
          reportBuffer = await this.generateExcel(params.type, data);
          break;
        case 'csv':
          reportBuffer = await this.generateCSV(params.type, data);
          break;
      }
      
      // Upload to storage
      const fileName = `report-${reportId}.${params.format}`;
      const filePath = `reports/${params.userId}/${fileName}`;
      const downloadUrl = await storageService.uploadFile(filePath, reportBuffer);
      
      // Update report record
      await this.updateReport(reportId, {
        status: 'completed',
        completedAt: new Date(),
        downloadUrl,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        fileSize: reportBuffer.length
      });
      
      // Send completion notification
      wsServer.emitToUser(params.userId, `report.completed.${reportId}`, {
        reportId,
        downloadUrl
      });
    } catch (error) {
      await this.updateReport(reportId, {
        status: 'failed',
        error: error.message,
        failedAt: new Date()
      });
      
      throw error;
    }
  }
  
  private async generatePDF(type: string, data: any): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    
    doc.on('data', chunk => chunks.push(chunk));
    
    // Add content based on report type
    switch (type) {
      case 'executive-summary':
        this.addExecutiveSummary(doc, data);
        break;
      case 'detailed-analysis':
        this.addDetailedAnalysis(doc, data);
        break;
      case 'compliance-report':
        this.addComplianceReport(doc, data);
        break;
    }
    
    doc.end();
    
    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
  
  private addExecutiveSummary(doc: PDFDocument, data: any) {
    doc.fontSize(20).text('Executive Summary', { align: 'center' });
    doc.moveDown();
    
    // Key metrics
    doc.fontSize(14).text('Key Metrics');
    doc.fontSize(12);
    doc.text(`Total Leases: ${data.metrics.totalLeases}`);
    doc.text(`Active Leases: ${data.metrics.activeLeases}`);
    doc.text(`Revenue: $${data.metrics.totalRevenue.toLocaleString()}`);
    
    // Charts
    if (data.charts) {
      doc.addPage();
      doc.image(data.charts.revenueChart, { width: 500 });
    }
  }
}

// 3. Create report queue processor
// File: packages/backend/src/queues/report.queue.ts
export const reportQueue = new Bull('report-generation', {
  redis: redisConfig
});

reportQueue.process('generate', async (job) => {
  const { reportId, userId, params } = job.data;
  
  // Update progress
  job.progress(10);
  
  await reportService.generateReport(reportId, { ...params, userId });
  
  job.progress(100);
});

// Track progress
reportQueue.on('progress', (job, progress) => {
  wsServer.emitToUser(job.data.userId, `report.progress.${job.data.params.useCaseId}`, {
    reportId: job.data.reportId,
    progress
  });
});
```

## 8. Use Case Templates → Dynamic Loading

### Frontend Work Required:
```typescript
// 1. Create template registry
// File: packages/frontend/src/services/templateRegistry.ts
export class TemplateRegistry {
  private templates = new Map<string, () => Promise<any>>();
  
  register(useCaseId: string, loader: () => Promise<any>) {
    this.templates.set(useCaseId, loader);
  }
  
  async loadTemplate(useCaseId: string): Promise<React.ComponentType<any>> {
    const loader = this.templates.get(useCaseId);
    
    if (!loader) {
      // Try dynamic import
      try {
        const module = await import(
          `../components/use-case-dashboard/templates/${useCaseId}/index.tsx`
        );
        return module.default;
      } catch (error) {
        console.error(`Template not found for ${useCaseId}`, error);
        return null;
      }
    }
    
    const module = await loader();
    return module.default;
  }
  
  getAvailableTemplates(): string[] {
    return Array.from(this.templates.keys());
  }
}

// 2. Register templates
// File: packages/frontend/src/templates/index.ts
import { templateRegistry } from '../services/templateRegistry';

// Register known templates
templateRegistry.register(
  'energy-oilfield-land-lease',
  () => import('./oilfield-land-lease/OilfieldLandLeaseDashboard')
);

templateRegistry.register(
  'energy-methane-detection',
  () => import('./methane-detection/MethaneDetectionDashboard')
);

templateRegistry.register(
  'insurance-risk-assessment',
  () => import('./insurance-risk/InsuranceRiskDashboard')
);

// 3. Create template loader component
// File: packages/frontend/src/components/use-case-dashboard/TemplateLoader.tsx
export const TemplateLoader: React.FC<{ useCaseId: string }> = ({ useCaseId }) => {
  const [Template, setTemplate] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setLoading(true);
        const template = await templateRegistry.loadTemplate(useCaseId);
        
        if (!template) {
          setError('Template not found');
          return;
        }
        
        setTemplate(() => template);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadTemplate();
  }, [useCaseId]);
  
  if (loading) {
    return <TemplateLoadingState />;
  }
  
  if (error) {
    return <TemplateFallback error={error} useCaseId={useCaseId} />;
  }
  
  if (!Template) {
    return <GenericUseCaseTemplate useCaseId={useCaseId} />;
  }
  
  return <Template />;
};

// 4. Create fallback template
// File: packages/frontend/src/components/use-case-dashboard/templates/GenericTemplate.tsx
export const GenericUseCaseTemplate: React.FC<{ useCaseId: string }> = ({ useCaseId }) => {
  const [config, setConfig] = useState<TemplateConfig | null>(null);
  
  useEffect(() => {
    // Load template configuration from backend
    const loadConfig = async () => {
      try {
        const response = await fetch(`/api/templates/${useCaseId}/config`, {
          headers: { 'Authorization': `Bearer ${getAuthToken()}` }
        });
        const config = await response.json();
        setConfig(config);
      } catch (error) {
        console.error('Failed to load template config:', error);
      }
    };
    
    loadConfig();
  }, [useCaseId]);
  
  if (!config) {
    return <div>Loading template configuration...</div>;
  }
  
  return (
    <div className="generic-template">
      <h2>{config.title}</h2>
      
      {/* Render sections based on config */}
      {config.sections.map(section => (
        <DynamicSection key={section.id} section={section} />
      ))}
    </div>
  );
};
```

### Backend Work Required:
```typescript
// 1. Create template configuration service
// File: packages/backend/src/services/template.service.ts
export class TemplateService {
  async getTemplateConfig(useCaseId: string): Promise<TemplateConfig> {
    // Check if custom config exists
    const customConfig = await db.collection('templateConfigs')
      .doc(useCaseId)
      .get();
    
    if (customConfig.exists) {
      return customConfig.data() as TemplateConfig;
    }
    
    // Return default config based on use case type
    return this.generateDefaultConfig(useCaseId);
  }
  
  private generateDefaultConfig(useCaseId: string): TemplateConfig {
    const [vertical, ...rest] = useCaseId.split('-');
    
    const baseConfig: TemplateConfig = {
      id: useCaseId,
      title: rest.join(' ').replace(/\b\w/g, l => l.toUpperCase()),
      sections: []
    };
    
    // Add sections based on vertical
    switch (vertical) {
      case 'energy':
        baseConfig.sections = [
          {
            id: 'overview',
            type: 'metrics',
            title: 'Overview',
            components: ['MetricsGrid', 'TrendChart']
          },
          {
            id: 'data',
            type: 'table',
            title: 'Data Management',
            components: ['DataTable', 'FilterPanel']
          },
          {
            id: 'analytics',
            type: 'charts',
            title: 'Analytics',
            components: ['AnalyticsCharts', 'Insights']
          }
        ];
        break;
        
      case 'insurance':
        baseConfig.sections = [
          {
            id: 'risk',
            type: 'assessment',
            title: 'Risk Assessment',
            components: ['RiskMatrix', 'RiskFactors']
          },
          {
            id: 'policies',
            type: 'table',
            title: 'Policies',
            components: ['PolicyTable', 'PolicyFilters']
          }
        ];
        break;
    }
    
    return baseConfig;
  }
  
  async saveTemplateConfig(useCaseId: string, config: TemplateConfig) {
    await db.collection('templateConfigs').doc(useCaseId).set({
      ...config,
      updatedAt: new Date()
    });
  }
}

// 2. Create template routes
// File: packages/backend/src/routes/template.routes.ts
router.get('/api/templates/:useCaseId/config', authenticate, async (req, res) => {
  const { useCaseId } = req.params;
  
  try {
    const config = await templateService.getTemplateConfig(useCaseId);
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/api/templates/:useCaseId/config', 
  authenticate, 
  authorize('template:update'), 
  async (req, res) => {
    const { useCaseId } = req.params;
    const config = req.body;
    
    try {
      await templateService.saveTemplateConfig(useCaseId, config);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
```

## 9. Mission Control → Other Dashboards Integration

### Frontend Work Required:
```typescript
// 1. Create cross-dashboard state manager
// File: packages/frontend/src/services/crossDashboardState.service.ts
export class CrossDashboardStateService {
  private state = new Map<string, any>();
  private subscribers = new Map<string, Set<Function>>();
  
  setState(key: string, value: any) {
    this.state.set(key, value);
    
    // Persist to localStorage
    localStorage.setItem(`dashboard-state-${key}`, JSON.stringify({
      value,
      timestamp: Date.now()
    }));
    
    // Notify subscribers
    this.notifySubscribers(key, value);
  }
  
  getState(key: string): any {
    // Check memory first
    if (this.state.has(key)) {
      return this.state.get(key);
    }
    
    // Check localStorage
    const stored = localStorage.getItem(`dashboard-state-${key}`);
    if (stored) {
      const { value, timestamp } = JSON.parse(stored);
      
      // Check if not expired (24 hours)
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        this.state.set(key, value);
        return value;
      }
    }
    
    return null;
  }
  
  subscribe(key: string, callback: Function): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    
    this.subscribers.get(key)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.get(key)?.delete(callback);
    };
  }
  
  private notifySubscribers(key: string, value: any) {
    this.subscribers.get(key)?.forEach(callback => callback(value));
  }
  
  // Navigation with context
  navigateToDashboard(dashboard: string, context?: any) {
    if (context) {
      this.setState('navigation-context', context);
    }
    
    window.location.href = `/dashboards/${dashboard}`;
  }
}

// 2. Create dashboard integration hook
// File: packages/frontend/src/hooks/useDashboardIntegration.ts
export const useDashboardIntegration = () => {
  const [sharedState, setSharedState] = useState<any>({});
  const stateService = useMemo(() => new CrossDashboardStateService(), []);
  
  useEffect(() => {
    // Subscribe to all dashboard state changes
    const unsubscribers: Function[] = [];
    
    const dashboardKeys = [
      'selected-use-case',
      'selected-vertical',
      'date-range',
      'filters',
      'navigation-context'
    ];
    
    dashboardKeys.forEach(key => {
      const unsubscribe = stateService.subscribe(key, (value: any) => {
        setSharedState(prev => ({ ...prev, [key]: value }));
      });
      unsubscribers.push(unsubscribe);
      
      // Load initial value
      const initialValue = stateService.getState(key);
      if (initialValue) {
        setSharedState(prev => ({ ...prev, [key]: initialValue }));
      }
    });
    
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [stateService]);
  
  const updateSharedState = useCallback((key: string, value: any) => {
    stateService.setState(key, value);
  }, [stateService]);
  
  const navigateTo = useCallback((dashboard: string, context?: any) => {
    stateService.navigateToDashboard(dashboard, context);
  }, [stateService]);
  
  return {
    sharedState,
    updateSharedState,
    navigateTo
  };
};

// 3. Integrate with dashboards
// File: packages/frontend/src/pages/EnergyDashboard.tsx
export const EnergyDashboard: React.FC = () => {
  const { sharedState, updateSharedState, navigateTo } = useDashboardIntegration();
  const { selectedUseCase, dateRange } = sharedState;
  
  // Apply shared filters
  useEffect(() => {
    if (dateRange) {
      setLocalDateRange(dateRange);
    }
  }, [dateRange]);
  
  const handleDrillDown = (data: any) => {
    // Navigate to Mission Control with context
    navigateTo('mission-control', {
      source: 'energy-dashboard',
      drillDownData: data,
      returnUrl: '/dashboards/energy'
    });
  };
  
  return (
    <div className="energy-dashboard">
      {/* Dashboard content */}
      
      <button onClick={() => handleDrillDown(selectedData)}>
        View in Mission Control
      </button>
    </div>
  );
};
```

### Backend Work Required:
```typescript
// 1. Create dashboard state API
// File: packages/backend/src/routes/dashboard.routes.ts
router.get('/api/dashboards/state', authenticate, async (req, res) => {
  const userId = req.user.uid;
  
  try {
    const state = await dashboardService.getUserDashboardState(userId);
    res.json(state);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/api/dashboards/state', authenticate, async (req, res) => {
  const userId = req.user.uid;
  const { key, value } = req.body;
  
  try {
    await dashboardService.updateUserDashboardState(userId, key, value);
    
    // Broadcast to user's other sessions
    wsServer.emitToUser(userId, 'dashboard.state.updated', { key, value });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Create dashboard service
// File: packages/backend/src/services/dashboard.service.ts
export class DashboardService {
  async getUserDashboardState(userId: string): Promise<any> {
    const doc = await db.collection('dashboardStates').doc(userId).get();
    
    if (!doc.exists) {
      return {};
    }
    
    return doc.data();
  }
  
  async updateUserDashboardState(userId: string, key: string, value: any) {
    await db.collection('dashboardStates').doc(userId).update({
      [key]: value,
      [`${key}_updated`]: new Date()
    });
  }
  
  async getDashboardMetrics(dashboardId: string, filters: any): Promise<any> {
    // Aggregate metrics based on dashboard type
    switch (dashboardId) {
      case 