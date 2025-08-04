import { logger } from '../utils/logger';
import { UseCaseWorkflow } from './types/workflow.types';
import { workflowRegistry } from './workflow-registry';
import { firestore } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';

export interface WorkflowVersion {
  id: string;
  workflowId: string;
  useCaseId: string;
  version: string;
  versionNumber: number;
  changes: WorkflowChange[];
  createdAt: Date;
  createdBy?: string;
  isActive: boolean;
  rollbackFrom?: string;
  metadata: {
    changeType: 'major' | 'minor' | 'patch';
    description: string;
    breaking: boolean;
    tags: string[];
  };
}

export interface WorkflowChange {
  type: 'added' | 'modified' | 'removed';
  path: string;
  oldValue?: any;
  newValue?: any;
  description?: string;
}

export interface VersionComparisonResult {
  changes: WorkflowChange[];
  breaking: boolean;
  compatibility: 'compatible' | 'warning' | 'incompatible';
}

export class WorkflowVersioningService {
  private static instance: WorkflowVersioningService;
  private versionCache: Map<string, WorkflowVersion[]> = new Map();

  private constructor() {}

  static getInstance(): WorkflowVersioningService {
    if (!WorkflowVersioningService.instance) {
      WorkflowVersioningService.instance = new WorkflowVersioningService();
    }
    return WorkflowVersioningService.instance;
  }

  /**
   * Create a new version of a workflow
   */
  async createVersion(
    workflow: UseCaseWorkflow,
    metadata: {
      changeType: 'major' | 'minor' | 'patch';
      description: string;
      breaking?: boolean;
      tags?: string[];
    },
    createdBy?: string
  ): Promise<WorkflowVersion> {
    try {
      const currentVersion = await this.getCurrentVersion(workflow.useCaseId);
      const versionNumber = this.calculateNextVersion(
        currentVersion?.version || '0.0.0',
        metadata.changeType
      );

      // Compare with current version to detect changes
      const changes = currentVersion
        ? this.detectChanges(currentVersion.workflow, workflow)
        : [];

      const newVersion: WorkflowVersion = {
        id: uuidv4(),
        workflowId: workflow.id,
        useCaseId: workflow.useCaseId,
        version: versionNumber,
        versionNumber: this.parseVersionNumber(versionNumber),
        changes,
        createdAt: new Date(),
        createdBy,
        isActive: true,
        metadata: {
          ...metadata,
          breaking: metadata.breaking || false,
          tags: metadata.tags || []
        }
      };

      // Deactivate previous version
      if (currentVersion && currentVersion.versionId) {
        await this.deactivateVersion(currentVersion.versionId);
      }

      // Save new version
      await this.saveVersion(newVersion, workflow);

      // Update workflow version
      workflow.version = versionNumber;
      workflowRegistry.registerWorkflow(workflow);

      logger.info(`Created new version ${versionNumber} for workflow ${workflow.useCaseId}`);
      return newVersion;
    } catch (error) {
      logger.error('Failed to create workflow version', { error, workflowId: workflow.id });
      throw error;
    }
  }

  /**
   * Get current active version of a workflow
   */
  async getCurrentVersion(useCaseId: string): Promise<{ version: string; workflow: UseCaseWorkflow; versionId: string } | null> {
    try {
      const db = firestore();
      const versionsRef = db.collection('workflow-versions')
        .where('useCaseId', '==', useCaseId)
        .where('isActive', '==', true)
        .orderBy('versionNumber', 'desc')
        .limit(1);

      const snapshot = await versionsRef.get();
      if (snapshot.empty) {
        return null;
      }

      const versionDoc = snapshot.docs[0];
      const versionData = versionDoc.data() as WorkflowVersion;
      
      // Get the workflow data
      const workflowDoc = await db.collection('workflow-versions')
        .doc(versionDoc.id)
        .collection('workflow')
        .doc('data')
        .get();

      if (!workflowDoc.exists) {
        return null;
      }

      return {
        version: versionData.version,
        workflow: workflowDoc.data() as UseCaseWorkflow,
        versionId: versionDoc.id
      };
    } catch (error) {
      logger.error('Failed to get current version', { error, useCaseId });
      return null;
    }
  }

  /**
   * Get version history for a workflow
   */
  async getVersionHistory(useCaseId: string): Promise<WorkflowVersion[]> {
    try {
      const cached = this.versionCache.get(useCaseId);
      if (cached) {
        return cached;
      }

      const db = firestore();
      const versionsRef = db.collection('workflow-versions')
        .where('useCaseId', '==', useCaseId)
        .orderBy('versionNumber', 'desc');

      const snapshot = await versionsRef.get();
      const versions: WorkflowVersion[] = [];

      snapshot.forEach((doc: any) => {
        versions.push({ id: doc.id, ...doc.data() } as WorkflowVersion);
      });

      this.versionCache.set(useCaseId, versions);
      return versions;
    } catch (error) {
      logger.error('Failed to get version history', { error, useCaseId });
      return [];
    }
  }

  /**
   * Rollback to a previous version
   */
  async rollbackToVersion(
    useCaseId: string,
    targetVersion: string,
    reason: string,
    performedBy?: string
  ): Promise<UseCaseWorkflow> {
    try {
      // Get target version
      const versions = await this.getVersionHistory(useCaseId);
      const targetVersionData = versions.find(v => v.version === targetVersion);

      if (!targetVersionData) {
        throw new Error(`Version ${targetVersion} not found for workflow ${useCaseId}`);
      }

      // Get workflow data for target version
      const db = firestore();
      const workflowDoc = await db.collection('workflow-versions')
        .doc(targetVersionData.id)
        .collection('workflow')
        .doc('data')
        .get();

      if (!workflowDoc.exists) {
        throw new Error(`Workflow data not found for version ${targetVersion}`);
      }

      const workflow = workflowDoc.data() as UseCaseWorkflow;

      // Create rollback version
      const rollbackVersion = await this.createVersion(
        workflow,
        {
          changeType: 'patch',
          description: `Rollback to version ${targetVersion}: ${reason}`,
          breaking: false,
          tags: ['rollback']
        },
        performedBy
      );

      // Mark as rollback
      await firestore().collection('workflow-versions')
        .doc(rollbackVersion.id)
        .update({
          rollbackFrom: targetVersionData.id
        });

      logger.info(`Rolled back workflow ${useCaseId} to version ${targetVersion}`);
      return workflow;
    } catch (error) {
      logger.error('Failed to rollback workflow', { error, useCaseId, targetVersion });
      throw error;
    }
  }

  /**
   * Compare two versions
   */
  async compareVersions(
    useCaseId: string,
    version1: string,
    version2: string
  ): Promise<VersionComparisonResult> {
    try {
      const versions = await this.getVersionHistory(useCaseId);
      const v1Data = versions.find(v => v.version === version1);
      const v2Data = versions.find(v => v.version === version2);

      if (!v1Data || !v2Data) {
        throw new Error('One or both versions not found');
      }

      // Get workflow data for both versions
      const [workflow1, workflow2] = await Promise.all([
        this.getWorkflowData(v1Data.id),
        this.getWorkflowData(v2Data.id)
      ]);

      const changes = this.detectChanges(workflow1, workflow2);
      const breaking = this.isBreakingChange(changes);

      return {
        changes,
        breaking,
        compatibility: breaking ? 'incompatible' : 
          changes.some(c => c.type === 'modified') ? 'warning' : 'compatible'
      };
    } catch (error) {
      logger.error('Failed to compare versions', { error, useCaseId, version1, version2 });
      throw error;
    }
  }

  /**
   * Detect changes between two workflow versions
   */
  private detectChanges(
    oldWorkflow: UseCaseWorkflow,
    newWorkflow: UseCaseWorkflow
  ): WorkflowChange[] {
    const changes: WorkflowChange[] = [];

    // Check basic properties
    if (oldWorkflow.name !== newWorkflow.name) {
      changes.push({
        type: 'modified',
        path: 'name',
        oldValue: oldWorkflow.name,
        newValue: newWorkflow.name
      });
    }

    if (oldWorkflow.description !== newWorkflow.description) {
      changes.push({
        type: 'modified',
        path: 'description',
        oldValue: oldWorkflow.description,
        newValue: newWorkflow.description
      });
    }

    // Check steps
    const oldStepIds = new Set(oldWorkflow.steps.map(s => s.id));
    const newStepIds = new Set(newWorkflow.steps.map(s => s.id));

    // Added steps
    newWorkflow.steps.forEach(step => {
      if (!oldStepIds.has(step.id)) {
        changes.push({
          type: 'added',
          path: `steps.${step.id}`,
          newValue: step,
          description: `Added step: ${step.name}`
        });
      }
    });

    // Removed steps
    oldWorkflow.steps.forEach(step => {
      if (!newStepIds.has(step.id)) {
        changes.push({
          type: 'removed',
          path: `steps.${step.id}`,
          oldValue: step,
          description: `Removed step: ${step.name}`
        });
      }
    });

    // Modified steps
    oldWorkflow.steps.forEach(oldStep => {
      const newStep = newWorkflow.steps.find(s => s.id === oldStep.id);
      if (newStep) {
        const stepChanges = this.detectStepChanges(oldStep, newStep);
        changes.push(...stepChanges);
      }
    });

    // Check triggers
    const triggerChanges = this.detectTriggerChanges(
      oldWorkflow.triggers,
      newWorkflow.triggers
    );
    changes.push(...triggerChanges);

    // Check metadata
    const metadataChanges = this.detectMetadataChanges(
      oldWorkflow.metadata,
      newWorkflow.metadata
    );
    changes.push(...metadataChanges);

    return changes;
  }

  /**
   * Detect changes in workflow steps
   */
  private detectStepChanges(oldStep: any, newStep: any): WorkflowChange[] {
    const changes: WorkflowChange[] = [];
    const stepPath = `steps.${oldStep.id}`;

    // Check each property
    ['name', 'type', 'agent', 'service', 'action'].forEach(prop => {
      if (oldStep[prop] !== newStep[prop]) {
        changes.push({
          type: 'modified',
          path: `${stepPath}.${prop}`,
          oldValue: oldStep[prop],
          newValue: newStep[prop]
        });
      }
    });

    // Check parameters
    if (JSON.stringify(oldStep.parameters) !== JSON.stringify(newStep.parameters)) {
      changes.push({
        type: 'modified',
        path: `${stepPath}.parameters`,
        oldValue: oldStep.parameters,
        newValue: newStep.parameters
      });
    }

    // Check conditions
    if (JSON.stringify(oldStep.conditions) !== JSON.stringify(newStep.conditions)) {
      changes.push({
        type: 'modified',
        path: `${stepPath}.conditions`,
        oldValue: oldStep.conditions,
        newValue: newStep.conditions
      });
    }

    return changes;
  }

  /**
   * Detect changes in triggers
   */
  private detectTriggerChanges(oldTriggers: any[], newTriggers: any[]): WorkflowChange[] {
    const changes: WorkflowChange[] = [];

    if (JSON.stringify(oldTriggers) !== JSON.stringify(newTriggers)) {
      changes.push({
        type: 'modified',
        path: 'triggers',
        oldValue: oldTriggers,
        newValue: newTriggers,
        description: 'Workflow triggers modified'
      });
    }

    return changes;
  }

  /**
   * Detect changes in metadata
   */
  private detectMetadataChanges(oldMetadata: any, newMetadata: any): WorkflowChange[] {
    const changes: WorkflowChange[] = [];

    ['requiredServices', 'requiredAgents', 'criticality', 'tags', 'compliance'].forEach(prop => {
      const oldVal = JSON.stringify(oldMetadata[prop]);
      const newVal = JSON.stringify(newMetadata[prop]);
      
      if (oldVal !== newVal) {
        changes.push({
          type: 'modified',
          path: `metadata.${prop}`,
          oldValue: oldMetadata[prop],
          newValue: newMetadata[prop]
        });
      }
    });

    return changes;
  }

  /**
   * Check if changes are breaking
   */
  private isBreakingChange(changes: WorkflowChange[]): boolean {
    return changes.some(change => {
      // Removing steps is breaking
      if (change.type === 'removed' && change.path.startsWith('steps.')) {
        return true;
      }

      // Changing step types is breaking
      if (change.path.endsWith('.type') && change.type === 'modified') {
        return true;
      }

      // Changing required services/agents is breaking
      if (change.path.includes('requiredServices') || change.path.includes('requiredAgents')) {
        return true;
      }

      return false;
    });
  }

  /**
   * Calculate next version number
   */
  private calculateNextVersion(
    currentVersion: string,
    changeType: 'major' | 'minor' | 'patch'
  ): string {
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    switch (changeType) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
        return `${major}.${minor}.${patch + 1}`;
    }
  }

  /**
   * Parse version string to number for sorting
   */
  private parseVersionNumber(version: string): number {
    const [major, minor, patch] = version.split('.').map(Number);
    return major * 10000 + minor * 100 + patch;
  }

  /**
   * Save version to database
   */
  private async saveVersion(version: WorkflowVersion, workflow: UseCaseWorkflow): Promise<void> {
    const db = firestore();
    const batch = db.batch();

    // Save version metadata
    const versionRef = db.collection('workflow-versions').doc(version.id);
    batch.set(versionRef, version);

    // Save workflow data
    const workflowRef = versionRef.collection('workflow').doc('data');
    batch.set(workflowRef, workflow);

    await batch.commit();
  }

  /**
   * Deactivate a version
   */
  private async deactivateVersion(versionId: string): Promise<void> {
    await firestore().collection('workflow-versions')
      .doc(versionId)
      .update({ isActive: false });
  }

  /**
   * Get workflow data for a version
   */
  private async getWorkflowData(versionId: string): Promise<UseCaseWorkflow> {
    const db = firestore();
    const doc = await db.collection('workflow-versions')
      .doc(versionId)
      .collection('workflow')
      .doc('data')
      .get();

    if (!doc.exists) {
      throw new Error(`Workflow data not found for version ${versionId}`);
    }

    return doc.data() as UseCaseWorkflow;
  }

  /**
   * Export version history
   */
  async exportVersionHistory(useCaseId: string): Promise<string> {
    const versions = await this.getVersionHistory(useCaseId);
    return JSON.stringify(versions, null, 2);
  }

  /**
   * Clear version cache
   */
  clearCache(useCaseId?: string): void {
    if (useCaseId) {
      this.versionCache.delete(useCaseId);
    } else {
      this.versionCache.clear();
    }
  }
}

// Export singleton instance
export const workflowVersioning = WorkflowVersioningService.getInstance();