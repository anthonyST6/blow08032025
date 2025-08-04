import { Lease } from '@/types/lease.types';
import { getAuthToken } from '@/utils/auth';

export class UseCaseAPIService {
  private baseUrl = '/api/usecases';

  async getLeases(useCaseId: string): Promise<Lease[]> {
    const response = await fetch(`${this.baseUrl}/${useCaseId}/leases`, {
      headers: { 
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch leases: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.leases || [];
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
    
    if (!response.ok) {
      throw new Error(`Failed to update lease: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async createLease(useCaseId: string, data: Partial<Lease>): Promise<Lease> {
    const response = await fetch(`${this.baseUrl}/${useCaseId}/leases`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create lease: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async deleteLease(leaseId: string): Promise<void> {
    const response = await fetch(`/api/leases/${leaseId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete lease: ${response.statusText}`);
    }
  }
  
  async getLeaseMetrics(useCaseId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${useCaseId}/metrics`, {
      headers: { 
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch metrics: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async executeVanguardAction(useCaseId: string, actionId: string, params: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${useCaseId}/vanguard/${actionId}`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to execute vanguard action: ${response.statusText}`);
    }
    
    return response.json();
  }
}

// Export singleton instance
export const useCaseAPI = new UseCaseAPIService();