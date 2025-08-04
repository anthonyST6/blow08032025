import { format } from 'date-fns';
import type { 
  IntegrationLogEntry, 
  IntegrationLogFilters, 
  IntegrationLogResponse,
  IntegrationLogStats 
} from '../types/integration.types';

class MockIntegrationLogService {
  private logs: IntegrationLogEntry[] = [];

  constructor() {
    this.generateMockData();
  }

  private generateMockData() {
    const sources = ['API Gateway', 'Webhook Service', 'Message Queue', 'File Transfer', 'Database Sync'];
    const destinations = ['CRM System', 'Analytics Platform', 'Data Warehouse', 'Email Service', 'Payment Gateway'];
    const messageTypes = ['REST API', 'GraphQL', 'WebSocket', 'SOAP', 'File Upload', 'Batch Process'];
    const statuses: Array<'success' | 'failure' | 'pending'> = ['success', 'failure', 'pending'];

    // Generate 500 mock logs
    for (let i = 0; i < 500; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days

      this.logs.push({
        id: `INT-${String(i + 1).padStart(6, '0')}`,
        timestamp: timestamp.toISOString(),
        source: sources[Math.floor(Math.random() * sources.length)],
        destination: destinations[Math.floor(Math.random() * destinations.length)],
        status,
        messageType: messageTypes[Math.floor(Math.random() * messageTypes.length)],
        messageSize: Math.floor(Math.random() * 1024 * 1024), // Up to 1MB
        processingTime: Math.floor(Math.random() * 5000), // Up to 5 seconds
        errorMessage: status === 'failure' ? this.generateErrorMessage() : undefined,
        payload: this.generatePayload(i),
        metadata: {
          correlationId: `CORR-${Math.random().toString(36).substr(2, 9)}`,
          userId: Math.random() > 0.5 ? `USER-${Math.floor(Math.random() * 1000)}` : undefined,
          sessionId: `SESS-${Math.random().toString(36).substr(2, 9)}`,
          ipAddress: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
    }

    // Sort by timestamp descending
    this.logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private generateErrorMessage(): string {
    const errors = [
      'Connection timeout',
      'Invalid authentication credentials',
      'Rate limit exceeded',
      'Invalid request format',
      'Service unavailable',
      'Database connection failed',
      'Validation error: Missing required fields',
      'Permission denied',
      'Resource not found',
      'Internal server error',
    ];
    return errors[Math.floor(Math.random() * errors.length)];
  }

  private generatePayload(index: number): any {
    const payloadTypes = [
      {
        type: 'user_registration',
        data: {
          userId: `USER-${index}`,
          email: `user${index}@example.com`,
          firstName: 'John',
          lastName: 'Doe',
          registeredAt: new Date().toISOString(),
        },
      },
      {
        type: 'order_placed',
        data: {
          orderId: `ORD-${index}`,
          customerId: `CUST-${Math.floor(Math.random() * 1000)}`,
          items: [
            { productId: 'PROD-001', quantity: 2, price: 29.99 },
            { productId: 'PROD-002', quantity: 1, price: 49.99 },
          ],
          total: 109.97,
          currency: 'USD',
        },
      },
      {
        type: 'data_sync',
        data: {
          syncId: `SYNC-${index}`,
          tableName: 'customers',
          recordsProcessed: Math.floor(Math.random() * 10000),
          recordsUpdated: Math.floor(Math.random() * 1000),
          recordsFailed: Math.floor(Math.random() * 100),
        },
      },
      {
        type: 'notification_sent',
        data: {
          notificationId: `NOTIF-${index}`,
          recipient: `user${Math.floor(Math.random() * 1000)}@example.com`,
          subject: 'Important Update',
          channel: 'email',
          status: 'delivered',
        },
      },
    ];

    return payloadTypes[Math.floor(Math.random() * payloadTypes.length)];
  }

  getAllLogs(): IntegrationLogEntry[] {
    return this.logs;
  }

  async getIntegrationLogs(params: {
    page: number;
    pageSize: number;
    filters: IntegrationLogFilters;
  }): Promise<IntegrationLogResponse> {
    const { page, pageSize, filters } = params;

    // Apply filters
    let filteredLogs = [...this.logs];

    if (filters.status !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.status === filters.status);
    }

    if (filters.source !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.source === filters.source);
    }

    if (filters.destination !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.destination === filters.destination);
    }

    if (filters.messageType !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.messageType === filters.messageType);
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredLogs = filteredLogs.filter(log =>
        log.id.toLowerCase().includes(query) ||
        log.source.toLowerCase().includes(query) ||
        log.destination.toLowerCase().includes(query) ||
        log.messageType.toLowerCase().includes(query) ||
        log.metadata.correlationId.toLowerCase().includes(query)
      );
    }

    if (filters.dateRange.start) {
      filteredLogs = filteredLogs.filter(log =>
        new Date(log.timestamp) >= filters.dateRange.start!
      );
    }

    if (filters.dateRange.end) {
      filteredLogs = filteredLogs.filter(log =>
        new Date(log.timestamp) <= filters.dateRange.end!
      );
    }

    // Calculate stats
    const stats: IntegrationLogStats = {
      totalMessages: filteredLogs.length,
      successCount: filteredLogs.filter(log => log.status === 'success').length,
      failureCount: filteredLogs.filter(log => log.status === 'failure').length,
      pendingCount: filteredLogs.filter(log => log.status === 'pending').length,
      averageProcessingTime: filteredLogs.reduce((sum, log) => sum + log.processingTime, 0) / filteredLogs.length || 0,
      totalDataTransferred: filteredLogs.reduce((sum, log) => sum + log.messageSize, 0),
    };

    // Paginate
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    return {
      data: paginatedLogs,
      pagination: {
        currentPage: page,
        pageSize,
        totalItems: filteredLogs.length,
        totalPages: Math.ceil(filteredLogs.length / pageSize),
      },
      stats,
    };
  }

  exportToCSV(logs: IntegrationLogEntry[]): string {
    const headers = [
      'ID',
      'Timestamp',
      'Status',
      'Source',
      'Destination',
      'Message Type',
      'Size (bytes)',
      'Processing Time (ms)',
      'Error Message',
      'Correlation ID',
    ];

    const rows = logs.map(log => [
      log.id,
      format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      log.status,
      log.source,
      log.destination,
      log.messageType,
      log.messageSize.toString(),
      log.processingTime.toString(),
      log.errorMessage || '',
      log.metadata.correlationId,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csvContent;
  }
}

export const mockIntegrationLogService = new MockIntegrationLogService();