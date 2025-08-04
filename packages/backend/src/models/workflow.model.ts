import { query, transaction } from '../config/database';

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'prompt' | 'analysis' | 'review' | 'approval' | 'report';
  config: Record<string, any>;
  dependencies: string[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  result?: any;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface Workflow {
  id: string;
  organizationId: string;
  createdBy: string;
  name: string;
  description?: string;
  type: 'sequential' | 'parallel' | 'conditional';
  steps: WorkflowStep[];
  variables: Record<string, any>;
  triggers: {
    type: 'manual' | 'scheduled' | 'event';
    config: Record<string, any>;
  }[];
  status: 'draft' | 'active' | 'paused' | 'completed' | 'failed';
  currentStep?: string;
  executionCount: number;
  lastExecutedAt?: Date;
  isTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorkflowInput {
  organizationId: string;
  createdBy: string;
  name: string;
  description?: string;
  type: 'sequential' | 'parallel' | 'conditional';
  steps: Omit<WorkflowStep, 'status'>[];
  variables?: Record<string, any>;
  triggers?: Workflow['triggers'];
  isTemplate?: boolean;
}

export interface UpdateWorkflowInput {
  name?: string;
  description?: string;
  steps?: WorkflowStep[];
  variables?: Record<string, any>;
  triggers?: Workflow['triggers'];
  status?: 'draft' | 'active' | 'paused' | 'completed' | 'failed';
  currentStep?: string;
}

export class WorkflowModel {
  static async create(input: CreateWorkflowInput): Promise<Workflow> {
    const steps = input.steps.map(step => ({
      ...step,
      status: 'pending' as const
    }));

    const sql = `
      INSERT INTO workflows (
        organization_id, created_by, name, description,
        type, steps, variables, triggers, status,
        execution_count, is_template
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'draft', 0, $9)
      RETURNING *
    `;
    
    const values = [
      input.organizationId,
      input.createdBy,
      input.name,
      input.description,
      input.type,
      JSON.stringify(steps),
      JSON.stringify(input.variables || {}),
      JSON.stringify(input.triggers || []),
      input.isTemplate || false
    ];
    
    const [workflow] = await query<Workflow>(sql, values);
    return workflow;
  }

  static async findById(id: string): Promise<Workflow | null> {
    const sql = 'SELECT * FROM workflows WHERE id = $1';
    const [workflow] = await query<Workflow>(sql, [id]);
    return workflow || null;
  }

  static async findByOrganization(
    organizationId: string,
    filters?: {
      type?: string;
      status?: string;
      isTemplate?: boolean;
      createdBy?: string;
    },
    limit = 50,
    offset = 0
  ): Promise<Workflow[]> {
    let sql = 'SELECT * FROM workflows WHERE organization_id = $1';
    const values: any[] = [organizationId];
    let paramCount = 2;

    if (filters?.type) {
      sql += ` AND type = $${paramCount++}`;
      values.push(filters.type);
    }

    if (filters?.status) {
      sql += ` AND status = $${paramCount++}`;
      values.push(filters.status);
    }

    if (filters?.isTemplate !== undefined) {
      sql += ` AND is_template = $${paramCount++}`;
      values.push(filters.isTemplate);
    }

    if (filters?.createdBy) {
      sql += ` AND created_by = $${paramCount++}`;
      values.push(filters.createdBy);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
    values.push(limit, offset);
    
    return query<Workflow>(sql, values);
  }

  static async findTemplates(organizationId: string): Promise<Workflow[]> {
    const sql = `
      SELECT * FROM workflows 
      WHERE organization_id = $1 AND is_template = true
      ORDER BY name ASC
    `;
    return query<Workflow>(sql, [organizationId]);
  }

  static async findActive(organizationId: string): Promise<Workflow[]> {
    const sql = `
      SELECT * FROM workflows 
      WHERE organization_id = $1 
        AND status IN ('active', 'paused')
        AND is_template = false
      ORDER BY last_executed_at DESC NULLS LAST
    `;
    return query<Workflow>(sql, [organizationId]);
  }

  static async update(id: string, input: UpdateWorkflowInput): Promise<Workflow | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(input.name);
    }

    if (input.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(input.description);
    }

    if (input.steps !== undefined) {
      fields.push(`steps = $${paramCount++}`);
      values.push(JSON.stringify(input.steps));
    }

    if (input.variables !== undefined) {
      fields.push(`variables = $${paramCount++}`);
      values.push(JSON.stringify(input.variables));
    }

    if (input.triggers !== undefined) {
      fields.push(`triggers = $${paramCount++}`);
      values.push(JSON.stringify(input.triggers));
    }

    if (input.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(input.status);
    }

    if (input.currentStep !== undefined) {
      fields.push(`current_step = $${paramCount++}`);
      values.push(input.currentStep);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const sql = `
      UPDATE workflows 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const [workflow] = await query<Workflow>(sql, values);
    return workflow || null;
  }

  static async updateStepStatus(
    workflowId: string,
    stepId: string,
    status: WorkflowStep['status'],
    result?: any,
    error?: string
  ): Promise<boolean> {
    const workflow = await this.findById(workflowId);
    if (!workflow) return false;

    const steps = workflow.steps.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          status,
          result,
          error,
          startedAt: status === 'running' ? new Date() : step.startedAt,
          completedAt: ['completed', 'failed', 'skipped'].includes(status) ? new Date() : undefined
        };
      }
      return step;
    });

    const sql = `
      UPDATE workflows 
      SET steps = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    
    const result2 = await query(sql, [JSON.stringify(steps), workflowId]);
    return result2.length > 0;
  }

  static async incrementExecutionCount(id: string): Promise<boolean> {
    const sql = `
      UPDATE workflows 
      SET execution_count = execution_count + 1,
          last_executed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    const result = await query(sql, [id]);
    return result.length > 0;
  }

  static async clone(id: string, newName: string): Promise<Workflow | null> {
    const original = await this.findById(id);
    if (!original) return null;

    return this.create({
      organizationId: original.organizationId,
      createdBy: original.createdBy,
      name: newName,
      description: original.description,
      type: original.type,
      steps: original.steps.map(step => ({
        ...step,
        status: 'pending' as const
      })),
      variables: original.variables,
      triggers: original.triggers,
      isTemplate: original.isTemplate
    });
  }

  static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM workflows WHERE id = $1';
    const result = await query(sql, [id]);
    return result.length > 0;
  }

  static async getStats(organizationId: string): Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    templates: number;
    averageExecutions: number;
  }> {
    const sql = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE type = 'sequential') as sequential,
        COUNT(*) FILTER (WHERE type = 'parallel') as parallel,
        COUNT(*) FILTER (WHERE type = 'conditional') as conditional,
        COUNT(*) FILTER (WHERE status = 'draft') as draft,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'paused') as paused,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COUNT(*) FILTER (WHERE is_template = true) as templates,
        AVG(execution_count) as avg_executions
      FROM workflows
      WHERE organization_id = $1
    `;
    
    const [stats] = await query<any>(sql, [organizationId]);
    
    return {
      total: parseInt(stats.total, 10),
      byType: {
        sequential: parseInt(stats.sequential, 10),
        parallel: parseInt(stats.parallel, 10),
        conditional: parseInt(stats.conditional, 10)
      },
      byStatus: {
        draft: parseInt(stats.draft, 10),
        active: parseInt(stats.active, 10),
        paused: parseInt(stats.paused, 10),
        completed: parseInt(stats.completed, 10),
        failed: parseInt(stats.failed, 10)
      },
      templates: parseInt(stats.templates, 10),
      averageExecutions: parseFloat(stats.avg_executions) || 0
    };
  }
}