import { api } from './api';

export interface VanguardAction {
  id: string;
  agent: string;
  systemTargeted: string;
  actionType: 'Read' | 'Write' | 'Update' | 'Escalate' | 'Recommend' | 'Reject' | 'Approve';
  recordAffected: string;
  fieldUpdated?: string;
  oldValue?: any;
  newValue?: any;
  payloadSummary: any;
  responseConfirmation: string;
  timestamp: string;
  status: 'success' | 'partial' | 'failed';
  payloadHash?: string;
}

export interface ActionReceipt {
  action: VanguardAction;
  receiptId: string;
  generatedAt: string;
  pdfPath?: string;
  jsonPath?: string;
}

export interface DailyLedger {
  date: string;
  totalActions: number;
  ledgerData: any[];
  excelPath?: string;
  downloadUrl?: string;
}

export interface ProofOfActionsSummary {
  totalActions: number;
  actionsByAgent: Record<string, number>;
  actionsBySystem: Record<string, number>;
  actionsByType: Record<string, number>;
  successRate: number;
  recentActions: VanguardAction[];
}

class VanguardActionsService {
  private baseUrl = '/vanguard-actions';

  async getAllActions(useCase?: string): Promise<VanguardAction[]> {
    try {
      const params = useCase ? { useCase } : {};
      console.log('Requesting vanguard actions with params:', params);
      const response = await api.get(`${this.baseUrl}/actions`, { params });
      console.log('Vanguard actions response:', response.data);
      return response.data.actions || [];
    } catch (error) {
      console.error('Failed to fetch all actions:', error);
      throw error;
    }
  }

  async getRecentActions(limit: number = 10): Promise<VanguardAction[]> {
    try {
      const response = await api.get(`${this.baseUrl}/actions/recent`, {
        params: { limit }
      });
      return response.data.actions;
    } catch (error) {
      console.error('Failed to fetch recent actions:', error);
      throw error;
    }
  }

  async getActionsByAgent(agentName: string): Promise<VanguardAction[]> {
    try {
      const response = await api.get(`${this.baseUrl}/actions/by-agent/${encodeURIComponent(agentName)}`);
      return response.data.actions;
    } catch (error) {
      console.error(`Failed to fetch actions for agent ${agentName}:`, error);
      throw error;
    }
  }

  async getActionsBySystem(systemName: string): Promise<VanguardAction[]> {
    try {
      const response = await api.get(`${this.baseUrl}/actions/by-system/${encodeURIComponent(systemName)}`);
      return response.data.actions;
    } catch (error) {
      console.error(`Failed to fetch actions for system ${systemName}:`, error);
      throw error;
    }
  }

  async logAction(action: Omit<VanguardAction, 'id' | 'timestamp'>): Promise<VanguardAction> {
    try {
      const response = await api.post(`${this.baseUrl}/actions/log`, action);
      return response.data.action;
    } catch (error) {
      console.error('Failed to log action:', error);
      throw error;
    }
  }

  async generateActionReceipt(actionId: string): Promise<ActionReceipt> {
    try {
      const response = await api.post(`${this.baseUrl}/actions/${actionId}/receipt`);
      return response.data.receipt;
    } catch (error) {
      console.error(`Failed to generate receipt for action ${actionId}:`, error);
      throw error;
    }
  }

  async generateDailyLedger(date?: Date): Promise<DailyLedger> {
    try {
      const response = await api.post(`${this.baseUrl}/ledger/daily`, {
        date: date?.toISOString()
      });
      return response.data.ledger;
    } catch (error) {
      console.error('Failed to generate daily ledger:', error);
      throw error;
    }
  }

  async getProofOfActionsSummary(): Promise<ProofOfActionsSummary> {
    try {
      const response = await api.get(`${this.baseUrl}/summary`);
      return response.data.summary;
    } catch (error) {
      console.error('Failed to fetch proof of actions summary:', error);
      throw error;
    }
  }

  async downloadReceipt(actionId: string, format: 'json' | 'pdf' = 'pdf'): Promise<void> {
    try {
      const receipt = await this.generateActionReceipt(actionId);
      
      // For now, we'll just log the receipt
      // In a real implementation, this would trigger a download
      console.log('Receipt generated:', receipt);
      
      // Create a download link
      const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `action-receipt-${actionId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download receipt:', error);
      throw error;
    }
  }

  async downloadDailyLedger(date?: Date): Promise<void> {
    try {
      const ledger = await this.generateDailyLedger(date);
      
      if (ledger.downloadUrl) {
        // In a real implementation, this would download from the URL
        window.open(ledger.downloadUrl, '_blank');
      } else {
        // Fallback: create a JSON download
        const blob = new Blob([JSON.stringify(ledger, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `daily-ledger-${ledger.date}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download daily ledger:', error);
      throw error;
    }
  }
}

export const vanguardActionsService = new VanguardActionsService();