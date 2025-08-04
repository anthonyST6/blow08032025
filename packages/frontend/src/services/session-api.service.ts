import { MissionControlState, ExecutionRecord } from './mission-control-persistence.service';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface SessionApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class SessionApiService {
  private static instance: SessionApiService;

  private constructor() {}

  static getInstance(): SessionApiService {
    if (!SessionApiService.instance) {
      SessionApiService.instance = new SessionApiService();
    }
    return SessionApiService.instance;
  }

  /**
   * Get auth token for API requests
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      // Try to get token from localStorage or sessionStorage
      // In a real app, this would use Firebase auth
      const token = localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
      return token;
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  /**
   * Make authenticated API request
   */
  private async makeRequest<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<SessionApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Request failed' };
      }

      return { success: true, data };
    } catch (error) {
      console.error('API request failed:', error);
      return { success: false, error: 'Network error' };
    }
  }

  /**
   * Save session to backend
   */
  async saveSession(state: Partial<MissionControlState>): Promise<SessionApiResponse> {
    return this.makeRequest('/sessions', {
      method: 'POST',
      body: JSON.stringify(state)
    });
  }

  /**
   * Get session from backend
   */
  async getSession(sessionId: string): Promise<SessionApiResponse<MissionControlState>> {
    return this.makeRequest(`/sessions/${sessionId}`);
  }

  /**
   * Get all user sessions
   */
  async getUserSessions(options?: {
    includeExpired?: boolean;
    limit?: number;
  }): Promise<SessionApiResponse<MissionControlState[]>> {
    const params = new URLSearchParams();
    if (options?.includeExpired) params.append('includeExpired', 'true');
    if (options?.limit) params.append('limit', options.limit.toString());

    return this.makeRequest(`/sessions?${params.toString()}`);
  }

  /**
   * Clear a specific session
   */
  async clearSession(sessionId: string): Promise<SessionApiResponse> {
    return this.makeRequest(`/sessions/${sessionId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Clear all user sessions
   */
  async clearAllSessions(): Promise<SessionApiResponse> {
    return this.makeRequest('/sessions', {
      method: 'DELETE'
    });
  }

  /**
   * Extend session expiration
   */
  async extendSession(sessionId: string, hours?: number): Promise<SessionApiResponse> {
    return this.makeRequest(`/sessions/${sessionId}/extend`, {
      method: 'PUT',
      body: JSON.stringify({ hours })
    });
  }

  /**
   * Add execution record
   */
  async addExecutionRecord(
    sessionId: string,
    execution: ExecutionRecord
  ): Promise<SessionApiResponse> {
    return this.makeRequest(`/sessions/${sessionId}/executions`, {
      method: 'POST',
      body: JSON.stringify(execution)
    });
  }

  /**
   * Get session statistics
   */
  async getSessionStats(): Promise<SessionApiResponse<{
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
    averageSessionDuration: number;
    mostUsedVertical: string | null;
    mostUsedUseCase: string | null;
  }>> {
    return this.makeRequest('/sessions/stats/overview');
  }

  /**
   * Check service health
   */
  async checkHealth(): Promise<SessionApiResponse<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: any;
  }>> {
    return this.makeRequest('/sessions/health/check');
  }
}

// Export singleton instance
export const sessionApiService = SessionApiService.getInstance();

// Enhanced persistence service that syncs with backend
export class EnhancedMissionControlPersistence {
  private syncInterval: number | null = null;
  private readonly SYNC_INTERVAL_MS = 30000; // 30 seconds

  constructor(
    private localService: any,
    private apiService: SessionApiService
  ) {
    this.startAutoSync();
  }

  /**
   * Save state locally and sync to backend
   */
  async saveState(state: Partial<MissionControlState>): Promise<void> {
    // Save locally first
    this.localService.saveState(state);

    // Sync to backend asynchronously
    this.syncToBackend(state).catch(error => {
      console.error('Failed to sync to backend:', error);
    });
  }

  /**
   * Get state with backend fallback
   */
  async getState(): Promise<MissionControlState | null> {
    // Try local first
    const localState = this.localService.getState();
    if (localState) return localState;

    // Try to restore from backend
    const sessionId = localStorage.getItem('last-session-id');
    if (sessionId) {
      const response = await this.apiService.getSession(sessionId);
      if (response.success && response.data) {
        this.localService.saveStateImmediate(response.data);
        return response.data;
      }
    }

    return null;
  }

  /**
   * Sync local state to backend
   */
  private async syncToBackend(state: Partial<MissionControlState>): Promise<void> {
    const response = await this.apiService.saveSession(state);
    if (response.success && response.data?.session?.sessionId) {
      localStorage.setItem('last-session-id', response.data.session.sessionId);
    }
  }

  /**
   * Start auto-sync to backend
   */
  private startAutoSync(): void {
    this.syncInterval = window.setInterval(async () => {
      const state = this.localService.getState();
      if (state) {
        await this.syncToBackend(state);
      }
    }, this.SYNC_INTERVAL_MS);
  }

  /**
   * Stop auto-sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      window.clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Clear state locally and on backend
   */
  async clearState(): Promise<void> {
    const sessionId = localStorage.getItem('last-session-id');
    
    // Clear locally
    this.localService.clearState();
    
    // Clear on backend
    if (sessionId) {
      await this.apiService.clearSession(sessionId);
      localStorage.removeItem('last-session-id');
    }
  }
}