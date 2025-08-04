export interface VanguardAction {
  id: string;
  vanguardAgent: string;
  type: 'read' | 'write' | 'update' | 'escalate' | 'recommend' | 'reject' | 'approve';
  description: string;
  targetSystem: string;
  targetResource: string;
  initiatedBy: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  metadata?: Record<string, any>;
  result?: any;
  errorMessage?: string;
}

export interface VanguardActionReceipt {
  actionId: string;
  receiptId: string;
  timestamp: Date;
  action: VanguardAction;
  proofOfExecution: {
    hash: string;
    signature: string;
    blockNumber?: number;
  };
  auditTrail: {
    preState: any;
    postState: any;
    changes: any[];
  };
}

export interface DailyLedger {
  date: Date;
  totalActions: number;
  actionsByType: Record<string, number>;
  actionsByAgent: Record<string, number>;
  actionsByStatus: Record<string, number>;
  actions: VanguardAction[];
  summary: {
    successRate: number;
    averageExecutionTime: number;
    topAgents: Array<{ agent: string; count: number }>;
    criticalActions: VanguardAction[];
  };
}

export interface VanguardActionsFilter {
  vanguardAgent?: string;
  type?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  targetSystem?: string;
  useCase?: string;
}

export interface VanguardActionsResponse {
  data: VanguardAction[];
  total: number;
  page: number;
  pageSize: number;
}