import { 
  AuditLogEntry, 
  AuditLogFilters, 
  AuditLogStats,
  PaginationInfo 
} from '../types/integration.types';

// Helper interface for paginated response
interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// Generate mock audit log data
const generateMockAuditLogs = (count: number): AuditLogEntry[] => {
  const actions = [
    'User Login',
    'Data Access',
    'Configuration Change',
    'API Call',
    'Report Generation',
    'Permission Update',
    'System Alert',
    'Data Export',
    'Workflow Execution',
    'Model Deployment'
  ];

  const users = [
    { id: 'user-001', name: 'John Doe' },
    { id: 'user-002', name: 'Jane Smith' },
    { id: 'user-003', name: 'Admin User' },
    { id: 'user-004', name: 'System Service' },
    { id: 'user-005', name: 'API Service' }
  ];

  const resources = [
    '/api/v1/users',
    '/api/v1/data/export',
    '/api/v1/models/deploy',
    '/api/v1/reports/generate',
    '/api/v1/config/update',
    '/dashboard/analytics',
    '/admin/settings',
    '/workflows/execute',
    '/data/sensitive',
    '/system/health'
  ];

  const results: Array<'success' | 'failure'> = ['success', 'failure'];
  
  const logs: AuditLogEntry[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Last 7 days
    const action = actions[Math.floor(Math.random() * actions.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const resource = resources[Math.floor(Math.random() * resources.length)];
    const result = results[Math.floor(Math.random() * results.length)];
    const duration = Math.floor(Math.random() * 5000) + 100;
    
    logs.push({
      id: `audit-${i + 1}`,
      timestamp: timestamp.toISOString(),
      userId: user.id,
      userName: user.name,
      action,
      resource,
      resourceId: `res-${Math.random().toString(36).substr(2, 9)}`,
      result,
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      userAgent: Math.random() > 0.5 ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      duration,
      ...(result === 'failure' && {
        errorDetails: `Error: ${['Permission denied', 'Resource not found', 'Invalid request', 'Timeout'][Math.floor(Math.random() * 4)]}`
      }),
      ...(action === 'Configuration Change' && {
        changes: {
          before: { setting: 'old-value', enabled: true },
          after: { setting: 'new-value', enabled: false }
        }
      }),
      metadata: {
        sessionId: `session-${Math.random().toString(36).substr(2, 9)}`,
        requestId: `req-${Math.random().toString(36).substr(2, 9)}`,
        apiVersion: 'v1.0'
      }
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Store mock data
let mockAuditLogs = generateMockAuditLogs(500);

// Filter audit logs based on criteria
const filterAuditLogs = (logs: AuditLogEntry[], filter: AuditLogFilters): AuditLogEntry[] => {
  return logs.filter(log => {
    // Date range filter
    if (filter.dateRange.start || filter.dateRange.end) {
      const logDate = new Date(log.timestamp);
      if (filter.dateRange.start && logDate < filter.dateRange.start) return false;
      if (filter.dateRange.end && logDate > filter.dateRange.end) return false;
    }

    // User filter
    if (filter.userId && filter.userId !== 'all' && log.userId !== filter.userId) {
      return false;
    }

    // Action filter
    if (filter.action && filter.action !== 'all' && log.action !== filter.action) {
      return false;
    }

    // Resource filter
    if (filter.resource && filter.resource !== 'all' && !log.resource.includes(filter.resource)) {
      return false;
    }

    // Result filter
    if (filter.result && filter.result !== 'all' && log.result !== filter.result) {
      return false;
    }

    // Search filter
    if (filter.searchQuery) {
      const searchLower = filter.searchQuery.toLowerCase();
      return (
        log.userName.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        log.resource.toLowerCase().includes(searchLower) ||
        log.ipAddress.includes(searchLower)
      );
    }

    return true;
  });
};

// Calculate statistics
const calculateStats = (logs: AuditLogEntry[]): AuditLogStats => {
  const totalActions = logs.length;
  const successCount = logs.filter(log => log.result === 'success').length;
  const failureCount = logs.filter(log => log.result === 'failure').length;
  const uniqueUsers = new Set(logs.map(log => log.userId)).size;
  const averageDuration = logs.reduce((sum, log) => sum + log.duration, 0) / logs.length || 0;

  // Calculate top actions
  const actionCounts = logs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topActions = Object.entries(actionCounts)
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalActions,
    successCount,
    failureCount,
    uniqueUsers,
    averageDuration,
    topActions
  };
};

// Mock API functions
export const mockAuditConsoleService = {
  // Get paginated audit logs
  getAuditLogs: async (
    page: number = 1,
    pageSize: number = 25,
    filter: AuditLogFilters
  ): Promise<PaginatedResponse<AuditLogEntry>> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const filteredLogs = filterAuditLogs(mockAuditLogs, filter);
    const totalItems = filteredLogs.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = filteredLogs.slice(startIndex, endIndex);

    return {
      items,
      totalItems,
      totalPages,
      currentPage: page,
      pageSize
    };
  },

  // Get audit statistics
  getAuditStats: async (filter: AuditLogFilters): Promise<AuditLogStats> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const filteredLogs = filterAuditLogs(mockAuditLogs, filter);
    return calculateStats(filteredLogs);
  },

  // Export audit logs to CSV
  exportAuditLogs: async (filter: AuditLogFilters): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const filteredLogs = filterAuditLogs(mockAuditLogs, filter);
    const headers = ['Timestamp', 'User', 'Action', 'Resource', 'Result', 'IP Address', 'Duration (ms)'];
    
    const rows = filteredLogs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.userName,
      log.action,
      log.resource,
      log.result,
      log.ipAddress,
      log.duration.toString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  },

  // Get unique values for filter dropdowns
  getFilterOptions: async (): Promise<{
    users: Array<{ id: string; name: string }>;
    actions: string[];
    resources: string[];
  }> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const users = Array.from(new Set(mockAuditLogs.map(log => JSON.stringify({ id: log.userId, name: log.userName }))))
      .map(str => JSON.parse(str))
      .sort((a, b) => a.name.localeCompare(b.name));
    
    const actions = Array.from(new Set(mockAuditLogs.map(log => log.action))).sort();
    const resources = Array.from(new Set(mockAuditLogs.map(log => log.resource))).sort();

    return { users, actions, resources };
  },

  // Refresh audit logs (simulate real-time updates)
  refreshAuditLogs: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Add a few new logs at the beginning
    const newLogs = generateMockAuditLogs(5);
    mockAuditLogs = [...newLogs, ...mockAuditLogs].slice(0, 500); // Keep max 500 logs
  }
};