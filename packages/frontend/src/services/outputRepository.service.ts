import { OutputArtifact } from './workflowEvents.service';

interface StoredOutput extends OutputArtifact {
  storedAt: Date;
  workflowId?: string;
  tags?: string[];
}

class OutputRepositoryService {
  private readonly STORAGE_KEY = 'seraphim_output_repository';
  private outputs: Map<string, StoredOutput> = new Map();

  constructor() {
    this.loadFromLocalStorage();
  }

  /**
   * Store an output artifact in the repository
   */
  storeOutput(artifact: OutputArtifact, workflowId?: string): void {
    const storedOutput: StoredOutput = {
      ...artifact,
      storedAt: new Date(),
      workflowId,
      tags: this.generateTags(artifact),
    };

    this.outputs.set(artifact.id, storedOutput);
    this.saveToLocalStorage();
    
    // Emit event for UI updates
    window.dispatchEvent(new CustomEvent('output-stored', { 
      detail: { output: storedOutput } 
    }));
  }

  /**
   * Store multiple outputs at once
   */
  storeMultipleOutputs(artifacts: OutputArtifact[], workflowId?: string): void {
    artifacts.forEach(artifact => this.storeOutput(artifact, workflowId));
  }

  /**
   * Get all stored outputs
   */
  getAllOutputs(): StoredOutput[] {
    return Array.from(this.outputs.values())
      .sort((a, b) => b.storedAt.getTime() - a.storedAt.getTime());
  }

  /**
   * Get outputs by use case
   */
  getOutputsByUseCase(useCaseId: string): StoredOutput[] {
    return this.getAllOutputs().filter(output => output.useCaseId === useCaseId);
  }

  /**
   * Get outputs by workflow
   */
  getOutputsByWorkflow(workflowId: string): StoredOutput[] {
    return this.getAllOutputs().filter(output => output.workflowId === workflowId);
  }

  /**
   * Get outputs by type
   */
  getOutputsByType(type: string): StoredOutput[] {
    return this.getAllOutputs().filter(output => output.type === type);
  }

  /**
   * Get outputs by agent
   */
  getOutputsByAgent(agent: string): StoredOutput[] {
    return this.getAllOutputs().filter(output => output.agent === agent);
  }

  /**
   * Search outputs
   */
  searchOutputs(query: string): StoredOutput[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllOutputs().filter(output => 
      output.name.toLowerCase().includes(lowerQuery) ||
      output.description.toLowerCase().includes(lowerQuery) ||
      output.agent.toLowerCase().includes(lowerQuery) ||
      output.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get output by ID
   */
  getOutput(id: string): StoredOutput | undefined {
    return this.outputs.get(id);
  }

  /**
   * Delete an output
   */
  deleteOutput(id: string): boolean {
    const deleted = this.outputs.delete(id);
    if (deleted) {
      this.saveToLocalStorage();
      window.dispatchEvent(new CustomEvent('output-deleted', { detail: { id } }));
    }
    return deleted;
  }

  /**
   * Clear all outputs
   */
  clearAll(): void {
    this.outputs.clear();
    this.saveToLocalStorage();
    window.dispatchEvent(new CustomEvent('outputs-cleared'));
  }

  /**
   * Clear outputs by use case
   */
  clearByUseCase(useCaseId: string): void {
    const toDelete = this.getOutputsByUseCase(useCaseId);
    toDelete.forEach(output => this.outputs.delete(output.id));
    this.saveToLocalStorage();
  }

  /**
   * Get repository statistics
   */
  getStats() {
    const outputs = this.getAllOutputs();
    const totalSize = outputs.reduce((sum, output) => sum + output.size, 0);
    const byType = outputs.reduce((acc, output) => {
      acc[output.type] = (acc[output.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byUseCase = outputs.reduce((acc, output) => {
      acc[output.useCaseId] = (acc[output.useCaseId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalOutputs: outputs.length,
      totalSize,
      byType,
      byUseCase,
      oldestOutput: outputs[outputs.length - 1]?.storedAt,
      newestOutput: outputs[0]?.storedAt,
    };
  }

  /**
   * Generate tags for an output
   */
  private generateTags(artifact: OutputArtifact): string[] {
    const tags: string[] = [];
    
    // Add type tag
    tags.push(artifact.type);
    
    // Add file extension if present
    const extension = artifact.name.split('.').pop();
    if (extension && extension !== artifact.name) {
      tags.push(extension.toLowerCase());
    }
    
    // Add size category
    if (artifact.size < 1024 * 100) tags.push('small');
    else if (artifact.size < 1024 * 1024) tags.push('medium');
    else tags.push('large');
    
    // Add agent type
    if (artifact.agent.toLowerCase().includes('risk')) tags.push('risk-analysis');
    if (artifact.agent.toLowerCase().includes('compliance')) tags.push('compliance');
    if (artifact.agent.toLowerCase().includes('revenue')) tags.push('financial');
    if (artifact.agent.toLowerCase().includes('document')) tags.push('documentation');
    
    return tags;
  }

  /**
   * Save to localStorage
   */
  private saveToLocalStorage(): void {
    try {
      const data = Array.from(this.outputs.entries()).map(([id, output]) => ({
        id,
        output: {
          ...output,
          timestamp: output.timestamp.toISOString(),
          storedAt: output.storedAt.toISOString(),
        }
      }));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save outputs to localStorage:', error);
    }
  }

  /**
   * Load from localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        data.forEach(({ id, output }: any) => {
          this.outputs.set(id, {
            ...output,
            timestamp: new Date(output.timestamp),
            storedAt: new Date(output.storedAt),
          });
        });
      }
    } catch (error) {
      console.error('Failed to load outputs from localStorage:', error);
    }
  }

  /**
   * Export outputs as JSON
   */
  exportAsJSON(): string {
    const outputs = this.getAllOutputs();
    return JSON.stringify(outputs, null, 2);
  }

  /**
   * Import outputs from JSON
   */
  importFromJSON(json: string): void {
    try {
      const outputs = JSON.parse(json);
      outputs.forEach((output: any) => {
        this.outputs.set(output.id, {
          ...output,
          timestamp: new Date(output.timestamp),
          storedAt: new Date(output.storedAt),
        });
      });
      this.saveToLocalStorage();
      window.dispatchEvent(new CustomEvent('outputs-imported', { 
        detail: { count: outputs.length } 
      }));
    } catch (error) {
      console.error('Failed to import outputs:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const outputRepository = new OutputRepositoryService();