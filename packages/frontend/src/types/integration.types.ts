// Integration Log Types
export interface IntegrationLogEntry {
  id: string;
  timestamp: string;
  source: string;
  destination: string;
  status: 'success' | 'failure' | 'pending';
  messageType: string;
  messageSize: number;
  processingTime: number;
  errorMessage?: string;
  payload: any;
  metadata: {
    correlationId: string;
    userId?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

export interface IntegrationLogFilters {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  status: string;
  source: string;
  destination: string;
  messageType: string;
  searchQuery: string;
}

export interface IntegrationLogStats {
  totalMessages: number;
  successCount: number;
  failureCount: number;
  pendingCount: number;
  averageProcessingTime: number;
  totalDataTransferred: number;
}

// Audit Console Types
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  result: 'success' | 'failure';
  ipAddress: string;
  userAgent: string;
  duration: number;
  errorDetails?: string;
  changes?: {
    before: any;
    after: any;
  };
  metadata: {
    sessionId: string;
    requestId: string;
    apiVersion: string;
  };
}

export interface AuditLogFilters {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  userId: string;
  action: string;
  resource: string;
  result: string;
  searchQuery: string;
}

export interface AuditLogStats {
  totalActions: number;
  successCount: number;
  failureCount: number;
  uniqueUsers: number;
  averageDuration: number;
  topActions: Array<{
    action: string;
    count: number;
  }>;
}

// Pagination
export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// API Response Types
export interface IntegrationLogResponse {
  data: IntegrationLogEntry[];
  pagination: PaginationInfo;
  stats: IntegrationLogStats;
}

export interface AuditLogResponse {
  data: AuditLogEntry[];
  pagination: PaginationInfo;
  stats: AuditLogStats;
}