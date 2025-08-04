/**
 * Mission Control Persistence Service
 * Handles state persistence for Mission Control to maintain user selections
 * across navigation and page refreshes
 */

export interface MissionControlState {
  sessionId: string;
  selectedVertical: string | null;
  selectedUseCase: string | null;
  selectedUseCaseDetails?: any;
  uploadedData: any | null;
  executionHistory: ExecutionRecord[];
  currentStep: string | null;
  lastUpdated: string;
  expiresAt: string;
}

export interface ExecutionRecord {
  id: string;
  useCaseId: string;
  timestamp: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  results?: any;
}

export class MissionControlPersistenceService {
  private static instance: MissionControlPersistenceService;
  private readonly STORAGE_KEY = 'mission-control-state';
  private readonly SESSION_DURATION_HOURS = 24;
  private saveDebounceTimer: NodeJS.Timeout | null = null;
  private readonly DEBOUNCE_DELAY = 500; // ms

  private constructor() {
    // Initialize with cleanup of expired sessions
    this.cleanupExpiredSessions();
  }

  static getInstance(): MissionControlPersistenceService {
    if (!MissionControlPersistenceService.instance) {
      MissionControlPersistenceService.instance = new MissionControlPersistenceService();
    }
    return MissionControlPersistenceService.instance;
  }

  /**
   * Save the current Mission Control state
   * Uses debouncing to prevent excessive saves
   */
  saveState(state: Partial<MissionControlState>): void {
    // Clear existing debounce timer
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }

    // Debounce the save operation
    this.saveDebounceTimer = setTimeout(() => {
      this._performSave(state);
    }, this.DEBOUNCE_DELAY);
  }

  /**
   * Save state immediately without debouncing
   */
  saveStateImmediate(state: Partial<MissionControlState>): void {
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }
    this._performSave(state);
  }

  private _performSave(state: Partial<MissionControlState>): void {
    try {
      const currentState = this.getState() || this.createDefaultState();
      const updatedState: MissionControlState = {
        sessionId: currentState.sessionId || this.generateSessionId(),
        selectedVertical: currentState.selectedVertical,
        selectedUseCase: currentState.selectedUseCase,
        selectedUseCaseDetails: currentState.selectedUseCaseDetails,
        uploadedData: currentState.uploadedData,
        executionHistory: currentState.executionHistory,
        currentStep: currentState.currentStep,
        ...state,
        lastUpdated: new Date().toISOString(),
        expiresAt: this.calculateExpiryTime()
      };

      // Save to localStorage for persistence across sessions
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedState));
      
      // Also save to sessionStorage for tab-specific state
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedState));

      // Emit event for other components to react
      this.emitStateChangeEvent(updatedState);
    } catch (error) {
      console.error('Failed to save Mission Control state:', error);
    }
  }

  /**
   * Restore the saved state
   */
  getState(): MissionControlState | null {
    try {
      // Try localStorage first (persists across browser sessions)
      const savedState = localStorage.getItem(this.STORAGE_KEY);
      if (savedState) {
        const state = JSON.parse(savedState) as MissionControlState;
        
        // Check if state has expired
        if (this.isStateExpired(state)) {
          this.clearState();
          return null;
        }
        
        return state;
      }
      
      // Fallback to sessionStorage
      const sessionState = sessionStorage.getItem(this.STORAGE_KEY);
      if (sessionState) {
        return JSON.parse(sessionState) as MissionControlState;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to restore Mission Control state:', error);
      return null;
    }
  }

  /**
   * Clear all saved state
   */
  clearState(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      sessionStorage.removeItem(this.STORAGE_KEY);
      
      // Emit clear event
      this.emitStateClearEvent();
    } catch (error) {
      console.error('Failed to clear Mission Control state:', error);
    }
  }

  /**
   * Update specific fields in the state
   */
  updateState(updates: Partial<MissionControlState>): void {
    const currentState = this.getState() || this.createDefaultState();
    this.saveState({
      ...currentState,
      ...updates
    });
  }

  /**
   * Add an execution record to history
   */
  addExecutionRecord(record: ExecutionRecord): void {
    const currentState = this.getState() || this.createDefaultState();
    const updatedHistory = [...currentState.executionHistory, record];
    
    // Keep only last 50 executions
    if (updatedHistory.length > 50) {
      updatedHistory.shift();
    }
    
    this.updateState({
      executionHistory: updatedHistory
    });
  }

  /**
   * Get specific field from state
   */
  getField<K extends keyof MissionControlState>(field: K): MissionControlState[K] | null {
    const state = this.getState();
    return state ? state[field] : null;
  }

  /**
   * Check if a use case is currently selected
   */
  hasSelectedUseCase(): boolean {
    const state = this.getState();
    return !!(state?.selectedUseCase && state?.selectedVertical);
  }

  /**
   * Create a default state
   */
  private createDefaultState(): MissionControlState {
    return {
      sessionId: this.generateSessionId(),
      selectedVertical: null,
      selectedUseCase: null,
      uploadedData: null,
      executionHistory: [],
      currentStep: null,
      lastUpdated: new Date().toISOString(),
      expiresAt: this.calculateExpiryTime()
    };
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `mc-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate expiry time
   */
  private calculateExpiryTime(): string {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + this.SESSION_DURATION_HOURS);
    return expiryDate.toISOString();
  }

  /**
   * Check if state has expired
   */
  private isStateExpired(state: MissionControlState): boolean {
    if (!state.expiresAt) return false;
    return new Date(state.expiresAt) < new Date();
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    const state = this.getState();
    if (state && this.isStateExpired(state)) {
      this.clearState();
    }
  }

  /**
   * Emit state change event
   */
  private emitStateChangeEvent(state: MissionControlState): void {
    const event = new CustomEvent('missionControlStateChange', {
      detail: state,
      bubbles: true
    });
    window.dispatchEvent(event);
  }

  /**
   * Emit state clear event
   */
  private emitStateClearEvent(): void {
    const event = new CustomEvent('missionControlStateClear', {
      bubbles: true
    });
    window.dispatchEvent(event);
  }

  /**
   * Subscribe to state changes
   */
  onStateChange(callback: (state: MissionControlState) => void): () => void {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<MissionControlState>;
      callback(customEvent.detail);
    };
    
    window.addEventListener('missionControlStateChange', handler);
    
    // Return unsubscribe function
    return () => {
      window.removeEventListener('missionControlStateChange', handler);
    };
  }

  /**
   * Subscribe to state clear
   */
  onStateClear(callback: () => void): () => void {
    window.addEventListener('missionControlStateClear', callback);
    
    // Return unsubscribe function
    return () => {
      window.removeEventListener('missionControlStateClear', callback);
    };
  }

  /**
   * Export state as JSON
   */
  exportState(): string {
    const state = this.getState();
    return JSON.stringify(state, null, 2);
  }

  /**
   * Import state from JSON
   */
  importState(jsonString: string): boolean {
    try {
      const state = JSON.parse(jsonString) as MissionControlState;
      this.saveStateImmediate(state);
      return true;
    } catch (error) {
      console.error('Failed to import state:', error);
      return false;
    }
  }
}

// Export singleton instance
export const missionControlPersistence = MissionControlPersistenceService.getInstance();