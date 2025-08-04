import { query, transaction } from '../config/database';

export interface UseCaseExecution {
  id: string;
  useCaseId: string;
  promptId: string;
  userId: string;
  organizationId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // in milliseconds
  configuration: Record<string, any>;
  results?: {
    siaScores?: {
      security: number;
      integrity: number;
      accuracy: number;
    };
    agentResults?: Record<string, any>;
    metrics?: Record<string, any>;
    recommendations?: string[];
    flags?: Array<{
      severity: 'low' | 'medium' | 'high' | 'critical';
      type: string;
      message: string;
      details?: Record<string, any>;
    }>;
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUseCaseExecutionInput {
  useCaseId: string;
  promptId: string;
  userId: string;
  organizationId: string;
  configuration: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UpdateUseCaseExecutionInput {
  status?: UseCaseExecution['status'];
  completedAt?: Date;
  duration?: number;
  results?: UseCaseExecution['results'];
  error?: UseCaseExecution['error'];
  metadata?: Record<string, any>;
}

export class UseCaseExecutionModel {
  static async create(input: CreateUseCaseExecutionInput): Promise<UseCaseExecution> {
    const sql = `
      INSERT INTO use_case_executions (
        use_case_id, prompt_id, user_id, organization_id,
        status, started_at, configuration, metadata
      )
      VALUES ($1, $2, $3, $4, 'pending', CURRENT_TIMESTAMP, $5, $6)
      RETURNING *
    `;
    
    const values = [
      input.useCaseId,
      input.promptId,
      input.userId,
      input.organizationId,
      JSON.stringify(input.configuration),
      JSON.stringify(input.metadata || {})
    ];
    
    const [execution] = await query<UseCaseExecution>(sql, values);
    return execution;
  }

  static async findById(id: string): Promise<UseCaseExecution | null> {
    const sql = 'SELECT * FROM use_case_executions WHERE id = $1';
    const [execution] = await query<UseCaseExecution>(sql, [id]);
    return execution || null;
  }

  static async findByUseCase(
    useCaseId: string,
    limit = 50,
    offset = 0
  ): Promise<UseCaseExecution[]> {
    const sql = `
      SELECT * FROM use_case_executions 
      WHERE use_case_id = $1 
      ORDER BY started_at DESC 
      LIMIT $2 OFFSET $3
    `;
    return query<UseCaseExecution>(sql, [useCaseId, limit, offset]);
  }

  static async findByUser(
    userId: string,
    filters?: {
      status?: string;
      useCaseId?: string;
      startDate?: Date;
      endDate?: Date;
    },
    limit = 50,
    offset = 0
  ): Promise<UseCaseExecution[]> {
    let sql = 'SELECT * FROM use_case_executions WHERE user_id = $1';
    const values: any[] = [userId];
    let paramCount = 2;

    if (filters?.status) {
      sql += ` AND status = $${paramCount++}`;
      values.push(filters.status);
    }

    if (filters?.useCaseId) {
      sql += ` AND use_case_id = $${paramCount++}`;
      values.push(filters.useCaseId);
    }

    if (filters?.startDate) {
      sql += ` AND started_at >= $${paramCount++}`;
      values.push(filters.startDate);
    }

    if (filters?.endDate) {
      sql += ` AND started_at <= $${paramCount++}`;
      values.push(filters.endDate);
    }

    sql += ` ORDER BY started_at DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
    values.push(limit, offset);
    
    return query<UseCaseExecution>(sql, values);
  }

  static async findByOrganization(
    organizationId: string,
    filters?: {
      status?: string;
      useCaseId?: string;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
    },
    limit = 50,
    offset = 0
  ): Promise<UseCaseExecution[]> {
    let sql = 'SELECT * FROM use_case_executions WHERE organization_id = $1';
    const values: any[] = [organizationId];
    let paramCount = 2;

    if (filters?.status) {
      sql += ` AND status = $${paramCount++}`;
      values.push(filters.status);
    }

    if (filters?.useCaseId) {
      sql += ` AND use_case_id = $${paramCount++}`;
      values.push(filters.useCaseId);
    }

    if (filters?.userId) {
      sql += ` AND user_id = $${paramCount++}`;
      values.push(filters.userId);
    }

    if (filters?.startDate) {
      sql += ` AND started_at >= $${paramCount++}`;
      values.push(filters.startDate);
    }

    if (filters?.endDate) {
      sql += ` AND started_at <= $${paramCount++}`;
      values.push(filters.endDate);
    }

    sql += ` ORDER BY started_at DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
    values.push(limit, offset);
    
    return query<UseCaseExecution>(sql, values);
  }

  static async update(id: string, input: UpdateUseCaseExecutionInput): Promise<UseCaseExecution | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(input.status);
    }

    if (input.completedAt !== undefined) {
      fields.push(`completed_at = $${paramCount++}`);
      values.push(input.completedAt);
    }

    if (input.duration !== undefined) {
      fields.push(`duration = $${paramCount++}`);
      values.push(input.duration);
    }

    if (input.results !== undefined) {
      fields.push(`results = $${paramCount++}`);
      values.push(JSON.stringify(input.results));
    }

    if (input.error !== undefined) {
      fields.push(`error = $${paramCount++}`);
      values.push(JSON.stringify(input.error));
    }

    if (input.metadata !== undefined) {
      fields.push(`metadata = $${paramCount++}`);
      values.push(JSON.stringify(input.metadata));
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const sql = `
      UPDATE use_case_executions 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const [execution] = await query<UseCaseExecution>(sql, values);
    return execution || null;
  }

  static async updateStatus(
    id: string, 
    status: UseCaseExecution['status'],
    error?: UseCaseExecution['error']
  ): Promise<boolean> {
    let sql = `
      UPDATE use_case_executions 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
    `;
    const values: any[] = [status];
    let paramCount = 2;

    if (status === 'completed' || status === 'failed' || status === 'cancelled') {
      sql = sql.replace(
        'updated_at = CURRENT_TIMESTAMP',
        `completed_at = CURRENT_TIMESTAMP, duration = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at)) * 1000, updated_at = CURRENT_TIMESTAMP`
      );
    }

    if (error) {
      sql = sql.replace(
        'updated_at = CURRENT_TIMESTAMP',
        `error = $${paramCount++}, updated_at = CURRENT_TIMESTAMP`
      );
      values.push(JSON.stringify(error));
    }

    sql += ` WHERE id = $${paramCount}`;
    values.push(id);

    const result = await query(sql, values);
    return result.length > 0;
  }

  static async getStats(
    organizationId?: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byUseCase: Array<{ useCaseId: string; count: number; avgDuration: number }>;
    avgDuration: number;
    successRate: number;
  }> {
    let sql = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'running') as running,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        AVG(duration) FILTER (WHERE status = 'completed') as avg_duration,
        COUNT(*) FILTER (WHERE status = 'completed') * 100.0 / 
          NULLIF(COUNT(*) FILTER (WHERE status IN ('completed', 'failed')), 0) as success_rate
      FROM use_case_executions
      WHERE 1=1
    `;
    
    const values: any[] = [];
    let paramCount = 1;

    if (organizationId) {
      sql += ` AND organization_id = $${paramCount++}`;
      values.push(organizationId);
    }

    if (dateRange) {
      sql += ` AND started_at >= $${paramCount++} AND started_at <= $${paramCount++}`;
      values.push(dateRange.start, dateRange.end);
    }
    
    const [stats] = await query<any>(sql, values);
    
    // Get stats by use case
    let useCaseSql = `
      SELECT 
        use_case_id,
        COUNT(*) as count,
        AVG(duration) FILTER (WHERE status = 'completed') as avg_duration
      FROM use_case_executions
      WHERE 1=1
    `;
    
    const useCaseValues: any[] = [];
    paramCount = 1;

    if (organizationId) {
      useCaseSql += ` AND organization_id = $${paramCount++}`;
      useCaseValues.push(organizationId);
    }

    if (dateRange) {
      useCaseSql += ` AND started_at >= $${paramCount++} AND started_at <= $${paramCount++}`;
      useCaseValues.push(dateRange.start, dateRange.end);
    }

    useCaseSql += ' GROUP BY use_case_id ORDER BY count DESC';
    
    const useCaseStats = await query<{
      use_case_id: string;
      count: string;
      avg_duration: string;
    }>(useCaseSql, useCaseValues);
    
    return {
      total: parseInt(stats.total, 10),
      byStatus: {
        pending: parseInt(stats.pending, 10),
        running: parseInt(stats.running, 10),
        completed: parseInt(stats.completed, 10),
        failed: parseInt(stats.failed, 10),
        cancelled: parseInt(stats.cancelled, 10)
      },
      byUseCase: useCaseStats.map(stat => ({
        useCaseId: stat.use_case_id,
        count: parseInt(stat.count, 10),
        avgDuration: parseFloat(stat.avg_duration) || 0
      })),
      avgDuration: parseFloat(stats.avg_duration) || 0,
      successRate: parseFloat(stats.success_rate) || 0
    };
  }

  static async getActiveExecutions(): Promise<UseCaseExecution[]> {
    const sql = `
      SELECT * FROM use_case_executions 
      WHERE status IN ('pending', 'running')
      ORDER BY started_at ASC
    `;
    return query<UseCaseExecution>(sql);
  }

  static async cancel(id: string): Promise<boolean> {
    return this.updateStatus(id, 'cancelled');
  }
}