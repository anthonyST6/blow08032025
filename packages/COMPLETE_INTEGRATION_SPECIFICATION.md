# Complete System Integration Specification

## 1. Frontend → Backend API Integration

### Frontend Work Required:
```typescript
// 1. Create API service layer
// File: packages/frontend/src/services/api/usecase.service.ts
export class UseCaseAPIService {
  async getLeases(useCaseId: string): Promise<Lease[]> {
    const response = await fetch(`/api/usecases/${useCaseId}/leases`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    return response.json();
  }
  
  async updateLease(leaseId: string, data: Partial<Lease>): Promise<Lease> {
    const response = await fetch(`/api/leases/${leaseId}`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}

// 2. Replace mock data calls in components
// File: packages/frontend/src/components/use-case-dashboard/templates/oilfield-land-lease/OilfieldLandLeaseDashboard.tsx
// BEFORE:
const leases = mockLeaseData;

// AFTER:
const [leases, setLeases] = useState<Lease[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const loadLeases = async () => {
    try {
      setLoading(true);
      const data = await useCaseAPI.getLeases('energy-oilfield-land-lease');
      setLeases(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  loadLeases();
}, []);

// 3. Add error boundaries and loading states
// File: packages/frontend/src/components/common/ErrorBoundary.tsx
export class APIErrorBoundary extends Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} retry={this.props.retry} />;
    }
    return this.props.children;
  }
}
```

### Backend Work Required:
```typescript
// 1. Create use case routes
// File: packages/backend/src/routes/usecase.routes.ts
router.get('/api/usecases/:useCaseId/leases', authenticate, async (req, res) => {
  const { useCaseId } = req.params;
  const leases = await leaseService.getLeasesByUseCase(useCaseId);
  res.json(leases);
});

router.patch('/api/leases/:leaseId', authenticate, authorize('lease:update'), async (req, res) => {
  const { leaseId } = req.params;
  const updates = req.body;
  const lease = await leaseService.updateLease(leaseId, updates);
  res.json(lease);
});

// 2. Create service layer
// File: packages/backend/src/services/lease.service.ts
export class LeaseService {
  async getLeasesByUseCase(useCaseId: string): Promise<Lease[]> {
    return await db.collection('leases')
      .where('useCaseId', '==', useCaseId)
      .where('status', '==', 'active')
      .get();
  }
  
  async updateLease(leaseId: string, updates: Partial<Lease>): Promise<Lease> {
    await db.collection('leases').doc(leaseId).update({
      ...updates,
      updatedAt: new Date()
    });
    return await this.getLease(leaseId);
  }
}

// 3. Add middleware
// File: packages/backend/src/middleware/cors.middleware.ts
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 2. Audit Logger → Backend Integration

### Frontend Work Required:
```typescript
// 1. Enhance audit logger hook
// File: packages/frontend/src/hooks/useAuditLogger.ts
export const useAuditLogger = () => {
  const { user } = useAuth();
  const auditQueue = useRef<AuditEntry[]>([]);
  const flushTimer = useRef<NodeJS.Timeout>();
  
  const logAction = async (action: AuditAction) => {
    const entry: AuditEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      userId: user?.uid,
      userEmail: user?.email,
      action: action.type,
      resource: action.resource,
      details: action.details,
      metadata: {
        userAgent: navigator.userAgent,
        sessionId: getSessionId(),
        ...action.metadata
      }
    };
    
    // Add to queue
    auditQueue.current.push(entry);
    
    // Batch send after 1 second or 10 entries
    if (auditQueue.current.length >= 10) {
      await flushAuditQueue();
    } else {
      clearTimeout(flushTimer.current);
      flushTimer.current = setTimeout(flushAuditQueue, 1000);
    }
  };
  
  const flushAuditQueue = async () => {
    if (auditQueue.current.length === 0) return;
    
    const entries = [...auditQueue.current];
    auditQueue.current = [];
    
    try {
      await fetch('/api/audit-trail/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ entries })
      });
    } catch (error) {
      // Store failed entries in localStorage for retry
      const failed = JSON.parse(localStorage.getItem('failedAuditLogs') || '[]');
      localStorage.setItem('failedAuditLogs', JSON.stringify([...failed, ...entries]));
    }
  };
  
  // Retry failed logs on mount
  useEffect(() => {
    const retryFailedLogs = async () => {
      const failed = JSON.parse(localStorage.getItem('failedAuditLogs') || '[]');
      if (failed.length > 0) {
        try {
          await fetch('/api/audit-trail/batch', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ entries: failed })
          });
          localStorage.removeItem('failedAuditLogs');
        } catch (error) {
          console.error('Failed to retry audit logs:', error);
        }
      }
    };
    retryFailedLogs();
  }, []);
  
  return { logAction };
};
```

### Backend Work Required:
```typescript
// 1. Create audit trail routes
// File: packages/backend/src/routes/audit.routes.ts
router.post('/api/audit-trail/batch', authenticate, async (req, res) => {
  const { entries } = req.body;
  
  try {
    const batch = db.batch();
    
    entries.forEach(entry => {
      const docRef = db.collection('auditTrail').doc(entry.id);
      batch.set(docRef, {
        ...entry,
        serverTimestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    await batch.commit();
    
    // Send to analytics
    await analyticsService.trackAuditEvents(entries);
    
    res.json({ success: true, count: entries.length });
  } catch (error) {
    logger.error('Audit trail batch insert failed:', error);
    res.status(500).json({ error: 'Failed to save audit logs' });
  }
});

// 2. Create audit service
// File: packages/backend/src/services/audit.service.ts
export class AuditService {
  async queryAuditLogs(filters: AuditFilters): Promise<AuditEntry[]> {
    let query = db.collection('auditTrail');
    
    if (filters.userId) {
      query = query.where('userId', '==', filters.userId);
    }
    if (filters.action) {
      query = query.where('action', '==', filters.action);
    }
    if (filters.startDate) {
      query = query.where('timestamp', '>=', filters.startDate);
    }
    if (filters.endDate) {
      query = query.where('timestamp', '<=', filters.endDate);
    }
    
    const snapshot = await query.orderBy('timestamp', 'desc').limit(1000).get();
    return snapshot.docs.map(doc => doc.data() as AuditEntry);
  }
  
  async generateAuditReport(filters: AuditFilters): Promise<Buffer> {
    const logs = await this.queryAuditLogs(filters);
    // Generate PDF or CSV report
    return reportGenerator.createAuditReport(logs);
  }
}
```

## 3. WebSocket → Real-time Updates Integration

### Frontend Work Required:
```typescript
// 1. Create WebSocket service
// File: packages/frontend/src/services/websocket.service.ts
export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageQueue: any[] = [];
  private subscribers = new Map<string, Set<Function>>();
  
  connect(token: string) {
    const wsUrl = `${process.env.REACT_APP_WS_URL}?token=${token}`;
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.flushMessageQueue();
    };
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.scheduleReconnect();
    };
  }
  
  subscribe(event: string, callback: Function) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    this.subscribers.get(event)!.add(callback);
    
    // Send subscription message
    this.send({
      type: 'subscribe',
      event
    });
    
    return () => {
      this.subscribers.get(event)?.delete(callback);
      if (this.subscribers.get(event)?.size === 0) {
        this.send({
          type: 'unsubscribe',
          event
        });
      }
    };
  }
  
  private handleMessage(message: any) {
    const { event, data } = message;
    this.subscribers.get(event)?.forEach(callback => callback(data));
  }
  
  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    
    this.reconnectTimer = setTimeout(() => {
      console.log('Attempting to reconnect...');
      this.connect(getAuthToken());
      this.reconnectTimer = null;
    }, 5000);
  }
}

// 2. Create WebSocket hook
// File: packages/frontend/src/hooks/useWebSocket.ts
export const useWebSocket = (event: string, handler: Function) => {
  const wsService = useContext(WebSocketContext);
  
  useEffect(() => {
    if (!wsService) return;
    
    const unsubscribe = wsService.subscribe(event, handler);
    return unsubscribe;
  }, [event, handler, wsService]);
};

// 3. Use in components
// File: packages/frontend/src/components/use-case-dashboard/RealTimeUpdates.tsx
const RealTimeUpdates = () => {
  const [updates, setUpdates] = useState<Update[]>([]);
  
  useWebSocket('lease.updated', (data: LeaseUpdate) => {
    setUpdates(prev => [data, ...prev].slice(0, 10));
  });
  
  useWebSocket('vanguard.status', (data: VanguardStatus) => {
    // Update vanguard status in UI
  });
  
  return (
    <div className="real-time-updates">
      {updates.map(update => (
        <UpdateNotification key={update.id} update={update} />
      ))}
    </div>
  );
};
```

### Backend Work Required:
```typescript
// 1. Create WebSocket server
// File: packages/backend/src/websocket/server.ts
import { Server } from 'socket.io';
import { verifyToken } from '../auth/jwt';

export class WebSocketServer {
  private io: Server;
  private userSockets = new Map<string, Set<string>>();
  
  initialize(httpServer: any) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true
      }
    });
    
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.query.token as string;
        const user = await verifyToken(token);
        socket.data.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
    
    this.io.on('connection', (socket) => {
      const userId = socket.data.user.uid;
      
      // Track user sockets
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(socket.id);
      
      // Handle subscriptions
      socket.on('subscribe', (data) => {
        socket.join(data.event);
      });
      
      socket.on('unsubscribe', (data) => {
        socket.leave(data.event);
      });
      
      socket.on('disconnect', () => {
        this.userSockets.get(userId)?.delete(socket.id);
      });
    });
  }
  
  // Emit to specific users
  emitToUser(userId: string, event: string, data: any) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.forEach(socketId => {
        this.io.to(socketId).emit(event, data);
      });
    }
  }
  
  // Emit to event subscribers
  emitToEvent(event: string, data: any) {
    this.io.to(event).emit(event, data);
  }
  
  // Broadcast to all
  broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }
}

// 2. Integrate with services
// File: packages/backend/src/services/lease.service.ts
export class LeaseService {
  constructor(private wsServer: WebSocketServer) {}
  
  async updateLease(leaseId: string, updates: Partial<Lease>): Promise<Lease> {
    const lease = await db.collection('leases').doc(leaseId).update(updates);
    
    // Emit real-time update
    this.wsServer.emitToEvent('lease.updated', {
      leaseId,
      updates,
      timestamp: new Date()
    });
    
    return lease;
  }
}
```

## 4. Vanguard Agents → Backend Integration

### Frontend Work Required:
```typescript
// 1. Create Vanguard execution service
// File: packages/frontend/src/services/vanguard.service.ts
export class VanguardService {
  async executeAgent(agentId: string, params: any): Promise<ExecutionResult> {
    const response = await fetch('/api/vanguards/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        agentId,
        parameters: params
      })
    });
    
    const { executionId } = await response.json();
    return this.pollForResult(executionId);
  }
  
  private async pollForResult(executionId: string): Promise<ExecutionResult> {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const response = await fetch(`/api/vanguards/status/${executionId}`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      
      const status = await response.json();
      
      if (status.state === 'completed') {
        return status.result;
      } else if (status.state === 'failed') {
        throw new Error(status.error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }
    
    throw new Error('Execution timeout');
  }
}

// 2. Create Vanguard execution component
// File: packages/frontend/src/components/vanguards/VanguardExecutor.tsx
export const VanguardExecutor: React.FC<{ agent: VanguardAgent }> = ({ agent }) => {
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { logAction } = useAuditLogger();
  
  const executeAgent = async () => {
    setExecuting(true);
    setError(null);
    
    try {
      // Log execution start
      await logAction({
        type: 'VANGUARD_EXECUTION_START',
        resource: agent.id,
        details: { agentName: agent.name }
      });
      
      const result = await vanguardService.executeAgent(agent.id, agent.defaultParams);
      setResult(result);
      
      // Log execution success
      await logAction({
        type: 'VANGUARD_EXECUTION_SUCCESS',
        resource: agent.id,
        details: { result: result.summary }
      });
    } catch (err) {
      setError(err.message);
      
      // Log execution failure
      await logAction({
        type: 'VANGUARD_EXECUTION_FAILED',
        resource: agent.id,
        details: { error: err.message }
      });
    } finally {
      setExecuting(false);
    }
  };
  
  return (
    <div className="vanguard-executor">
      <button 
        onClick={executeAgent} 
        disabled={executing}
        className="execute-button"
      >
        {executing ? <Spinner /> : 'Execute Agent'}
      </button>
      
      {result && <VanguardResult result={result} />}
      {error && <ErrorMessage message={error} />}
    </div>
  );
};
```

### Backend Work Required:
```typescript
// 1. Create Vanguard execution routes
// File: packages/backend/src/routes/vanguard.routes.ts
router.post('/api/vanguards/execute', authenticate, async (req, res) => {
  const { agentId, parameters } = req.body;
  
  try {
    // Create execution record
    const execution = await vanguardService.createExecution({
      agentId,
      parameters,
      userId: req.user.uid,
      status: 'pending'
    });
    
    // Queue for processing
    await vanguardQueue.add('execute', {
      executionId: execution.id,
      agentId,
      parameters
    });
    
    res.json({ executionId: execution.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/api/vanguards/status/:executionId', authenticate, async (req, res) => {
  const { executionId } = req.params;
  
  const execution = await vanguardService.getExecution(executionId);
  
  if (!execution) {
    return res.status(404).json({ error: 'Execution not found' });
  }
  
  res.json({
    state: execution.status,
    progress: execution.progress,
    result: execution.result,
    error: execution.error
  });
});

// 2. Create Vanguard service
// File: packages/backend/src/services/vanguard.service.ts
export class VanguardService {
  async executeAgent(executionId: string, agentId: string, parameters: any) {
    const agent = await this.getAgent(agentId);
    
    try {
      // Update status to running
      await this.updateExecution(executionId, {
        status: 'running',
        startedAt: new Date()
      });
      
      // Execute agent logic
      const result = await agent.execute(parameters);
      
      // Update with result
      await this.updateExecution(executionId, {
        status: 'completed',
        result,
        completedAt: new Date()
      });
      
      // Emit WebSocket update
      wsServer.emitToEvent(`vanguard.${executionId}`, {
        status: 'completed',
        result
      });
    } catch (error) {
      await this.updateExecution(executionId, {
        status: 'failed',
        error: error.message,
        failedAt: new Date()
      });
      
      wsServer.emitToEvent(`vanguard.${executionId}`, {
        status: 'failed',
        error: error.message
      });
    }
  }
}

// 3. Create queue processor
// File: packages/backend/src/queues/vanguard.queue.ts
import Bull from 'bull';

export const vanguardQueue = new Bull('vanguard-execution', {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

vanguardQueue.process('execute', async (job) => {
  const { executionId, agentId, parameters } = job.data;
  
  await vanguardService.executeAgent(executionId, agentId, parameters);
});
```

## 5. File Upload → Data Processing Integration

### Frontend Work Required:
```typescript
// 1. Create file upload service
// File: packages/frontend/src/services/fileUpload.service.ts
export class FileUploadService {
  async uploadFile(file: File, metadata: any): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    
    const response = await fetch('/api/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: formData
    });
    
    return response.json();
  }
  
  async getProcessingStatus(fileId: string): Promise<ProcessingStatus> {
    const response = await fetch(`/api/files/${fileId}/status`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    
    return response.json();
  }
}

// 2. Create upload component with progress
// File: packages/frontend/src/components/FileUpload.tsx
export const FileUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  
  const handleUpload = async (file: File) => {
    setUploading(true);
    
    try {
      // Upload with progress tracking
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          setProgress((e.loaded / e.total) * 100);
        }
      });
      
      xhr.onload = async () => {
        const result = JSON.parse(xhr.responseText);
        
        // Poll for processing status
        const pollStatus = async () => {
          const status = await fileUploadService.getProcessingStatus(result.fileId);
          setProcessingStatus(status);
          
          if (status.state === 'processing') {
            setTimeout(pollStatus, 2000);
          }
        };
        
        await pollStatus();
      };
      
      xhr.open('POST', '/api/files/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${getAuthToken()}`);
      
      const formData = new FormData();
      formData.append('file', file);
      
      xhr.send(formData);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="file-upload">
      <Dropzone onDrop={handleUpload} />
      
      {uploading && (
        <ProgressBar value={progress} />
      )}
      
      {processingStatus && (
        <ProcessingStatus status={processingStatus} />
      )}
    </div>
  );
};
```

### Backend Work Required:
```typescript
// 1. Create file upload routes
// File: packages/backend/src/routes/file.routes.ts
import multer from 'multer';
import { processFileQueue } from '../queues/fileProcessing.queue';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/json', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

router.post('/api/files/upload', authenticate, upload.single('file'), async (req, res) => {
  const file = req.file;
  const metadata = JSON.parse(req.body.metadata || '{}');
  
  try {
    // Store file in cloud storage
    const fileId = generateId();
    const filePath = `uploads/${req.user.uid}/${fileId}/${file.originalname}`;
    
    await storageService.uploadFile(filePath, file.buffer);
    
    // Create file record
    const fileRecord = await fileService.createFile({
      id: fileId,
      userId: req.user.uid,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: filePath,
      metadata,
      status: 'uploaded',
      uploadedAt: new Date()
    });
    
    // Queue for processing
    await processFileQueue.add('process', {
      fileId,
      userId: req.user.uid
    });
    
    res.json({
      fileId,
      status: 'uploaded',
      message: 'File uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Create file processing service
// File: packages/backend/src/services/fileProcessing.service.ts
export class FileProcessingService {
  async processFile(fileId: string) {
    const file = await fileService.getFile(fileId);
    
    try {
      // Update status
      await fileService.updateFile(fileId, { status: 'processing' });
      
      // Download file from storage
      const buffer = await storageService.downloadFile(file.path);
      
      // Process based on type
      let result;
      switch (file.mimeType) {
        case 'text/csv':
          result = await this.processCSV(buffer);
          break;
        case 'application/json':
          result = await this.processJSON(buffer);
          break;
        case 'application/pdf':
          result = await this.processPDF(buffer);
          break;
      }
      
      // Store results
      await fileService.updateFile(fileId, {
        status: 'completed',
        processedAt: new Date(),
        result
      });
      
      // Emit completion event
      wsServer.emitToUser(file.userId, 'file.processed', {
        fileId,
        result
      });
    } catch (error) {
      await fileService.updateFile(fileId, {
        status: 'failed',
        error: error.message
      });
      
      throw error;
    }
  }
  
  private async processCSV(buffer: Buffer): Promise<any> {
    const records = await csv.parse(buffer.toString());
    
    // Validate and transform data
    const validated = records.map(record => {
      // Apply validation rules
      return validateRecord(record);
    });
    
    return {
      totalRecords: records.length,
      validRecords: validated.filter(r => r.valid).length,
      data: validated
    };
  }
}
```

## 6. Authentication → Route Protection Validation

### Frontend Work Required:
```typescript
// 1. Enhance auth context
// File: packages/frontend/src/contexts/AuthContext.tsx
export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenExpiry, setTokenExpiry] = useState<Date | null>(null);
  
  // Auto-refresh token
  useEffect(() => {
    if (!tokenExpiry) return;
    
    const timeUntilExpiry = tokenExpiry.getTime() - Date.now();
    const refreshTime = timeUntilExpiry - (5 * 60 * 1000); // 5 minutes before expiry
    
    if (refreshTime > 0) {
      const timer = setTimeout(async () => {
        try {
          const newToken = await authService.refreshToken();
          setTokenExpiry(new Date(Date.now() + newToken.expiresIn * 1000));
        } catch (error) {
          // Force re-login
          await logout();
        }
      }, refreshTime);
      
      return () => clearTimeout(timer);
    }
  }, [tokenExpiry]);
  
  // Session timeout handling
  useEffect(() => {
    let activityTimer: NodeJS.Timeout;
    
    const resetTimer = () => {
      clearTimeout(activityTimer);
      activityTimer = setTimeout(async () => {
        // Show warning
        const continueSession = await showSessionWarning();
        if (!continueSession) {
          await logout();
        }
      }, 30 * 60 * 1000); // 30 minutes
    };
    
    // Track user activity
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener