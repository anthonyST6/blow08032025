import { query, transaction } from '../config/database';

export interface Prompt {
  id: string;
  userId: string;
  organizationId: string;
  content: string;
  domain: 'energy' | 'government' | 'insurance';
  metadata: {
    source?: string;
    tags?: string[];
    attachments?: string[];
    context?: Record<string, any>;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePromptInput {
  userId: string;
  organizationId: string;
  content: string;
  domain: 'energy' | 'government' | 'insurance';
  metadata?: {
    source?: string;
    tags?: string[];
    attachments?: string[];
    context?: Record<string, any>;
  };
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface UpdatePromptInput {
  content?: string;
  domain?: 'energy' | 'government' | 'insurance';
  metadata?: {
    source?: string;
    tags?: string[];
    attachments?: string[];
    context?: Record<string, any>;
  };
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export class PromptModel {
  static async create(input: CreatePromptInput): Promise<Prompt> {
    const sql = `
      INSERT INTO prompts (
        user_id, organization_id, content, domain, 
        metadata, status, priority
      )
      VALUES ($1, $2, $3, $4, $5, 'pending', $6)
      RETURNING *
    `;
    
    const values = [
      input.userId,
      input.organizationId,
      input.content,
      input.domain,
      JSON.stringify(input.metadata || {}),
      input.priority || 'medium'
    ];
    
    const [prompt] = await query<Prompt>(sql, values);
    return prompt;
  }

  static async findById(id: string): Promise<Prompt | null> {
    const sql = 'SELECT * FROM prompts WHERE id = $1';
    const [prompt] = await query<Prompt>(sql, [id]);
    return prompt || null;
  }

  static async findByUser(userId: string, limit = 50, offset = 0): Promise<Prompt[]> {
    const sql = `
      SELECT * FROM prompts 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    return query<Prompt>(sql, [userId, limit, offset]);
  }

  static async findByOrganization(
    organizationId: string, 
    filters?: {
      domain?: string;
      status?: string;
      priority?: string;
      startDate?: Date;
      endDate?: Date;
    },
    limit = 50, 
    offset = 0
  ): Promise<Prompt[]> {
    let sql = 'SELECT * FROM prompts WHERE organization_id = $1';
    const values: any[] = [organizationId];
    let paramCount = 2;

    if (filters?.domain) {
      sql += ` AND domain = $${paramCount++}`;
      values.push(filters.domain);
    }

    if (filters?.status) {
      sql += ` AND status = $${paramCount++}`;
      values.push(filters.status);
    }

    if (filters?.priority) {
      sql += ` AND priority = $${paramCount++}`;
      values.push(filters.priority);
    }

    if (filters?.startDate) {
      sql += ` AND created_at >= $${paramCount++}`;
      values.push(filters.startDate);
    }

    if (filters?.endDate) {
      sql += ` AND created_at <= $${paramCount++}`;
      values.push(filters.endDate);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
    values.push(limit, offset);
    
    return query<Prompt>(sql, values);
  }

  static async findPending(limit = 10): Promise<Prompt[]> {
    const sql = `
      SELECT * FROM prompts 
      WHERE status = 'pending' 
      ORDER BY 
        CASE priority 
          WHEN 'critical' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          WHEN 'low' THEN 4 
        END,
        created_at ASC
      LIMIT $1
    `;
    return query<Prompt>(sql, [limit]);
  }

  static async update(id: string, input: UpdatePromptInput): Promise<Prompt | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.content !== undefined) {
      fields.push(`content = $${paramCount++}`);
      values.push(input.content);
    }

    if (input.domain !== undefined) {
      fields.push(`domain = $${paramCount++}`);
      values.push(input.domain);
    }

    if (input.metadata !== undefined) {
      fields.push(`metadata = $${paramCount++}`);
      values.push(JSON.stringify(input.metadata));
    }

    if (input.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(input.status);
    }

    if (input.priority !== undefined) {
      fields.push(`priority = $${paramCount++}`);
      values.push(input.priority);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const sql = `
      UPDATE prompts 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const [prompt] = await query<Prompt>(sql, values);
    return prompt || null;
  }

  static async updateStatus(id: string, status: Prompt['status']): Promise<boolean> {
    const sql = `
      UPDATE prompts 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;
    const result = await query(sql, [status, id]);
    return result.length > 0;
  }

  static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM prompts WHERE id = $1';
    const result = await query(sql, [id]);
    return result.length > 0;
  }

  static async getStats(organizationId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byDomain: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    const sql = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'processing') as processing,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COUNT(*) FILTER (WHERE domain = 'energy') as energy,
        COUNT(*) FILTER (WHERE domain = 'government') as government,
        COUNT(*) FILTER (WHERE domain = 'insurance') as insurance,
        COUNT(*) FILTER (WHERE priority = 'low') as low,
        COUNT(*) FILTER (WHERE priority = 'medium') as medium,
        COUNT(*) FILTER (WHERE priority = 'high') as high,
        COUNT(*) FILTER (WHERE priority = 'critical') as critical
      FROM prompts
      WHERE organization_id = $1
    `;
    
    const [stats] = await query<any>(sql, [organizationId]);
    
    return {
      total: parseInt(stats.total, 10),
      byStatus: {
        pending: parseInt(stats.pending, 10),
        processing: parseInt(stats.processing, 10),
        completed: parseInt(stats.completed, 10),
        failed: parseInt(stats.failed, 10)
      },
      byDomain: {
        energy: parseInt(stats.energy, 10),
        government: parseInt(stats.government, 10),
        insurance: parseInt(stats.insurance, 10)
      },
      byPriority: {
        low: parseInt(stats.low, 10),
        medium: parseInt(stats.medium, 10),
        high: parseInt(stats.high, 10),
        critical: parseInt(stats.critical, 10)
      }
    };
  }

  static async searchByContent(
    organizationId: string, 
    searchTerm: string, 
    limit = 50
  ): Promise<Prompt[]> {
    const sql = `
      SELECT * FROM prompts 
      WHERE organization_id = $1 
        AND content ILIKE $2
      ORDER BY created_at DESC
      LIMIT $3
    `;
    return query<Prompt>(sql, [organizationId, `%${searchTerm}%`, limit]);
  }
}