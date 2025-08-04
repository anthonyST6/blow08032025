import { query, transaction } from '../config/database';

export interface UseCase {
  id: string;
  verticalId: string;
  name: string;
  description: string;
  complexity: 'low' | 'medium' | 'high';
  estimatedTime: string;
  siaScores: {
    security: number;
    integrity: number;
    accuracy: number;
  };
  status: 'draft' | 'active' | 'archived';
  version: string;
  configuration?: Record<string, any>;
  metadata?: Record<string, any>;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUseCaseInput {
  verticalId: string;
  name: string;
  description: string;
  complexity: 'low' | 'medium' | 'high';
  estimatedTime: string;
  siaScores: {
    security: number;
    integrity: number;
    accuracy: number;
  };
  configuration?: Record<string, any>;
  metadata?: Record<string, any>;
  createdBy: string;
}

export interface UpdateUseCaseInput {
  name?: string;
  description?: string;
  complexity?: 'low' | 'medium' | 'high';
  estimatedTime?: string;
  siaScores?: {
    security: number;
    integrity: number;
    accuracy: number;
  };
  status?: 'draft' | 'active' | 'archived';
  version?: string;
  configuration?: Record<string, any>;
  metadata?: Record<string, any>;
  updatedBy?: string;
}

export class UseCaseModel {
  static async create(input: CreateUseCaseInput): Promise<UseCase> {
    const sql = `
      INSERT INTO use_cases (
        vertical_id, name, description, complexity, estimated_time,
        sia_scores, status, version, configuration, metadata, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'draft', '1.0.0', $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      input.verticalId,
      input.name,
      input.description,
      input.complexity,
      input.estimatedTime,
      JSON.stringify(input.siaScores),
      JSON.stringify(input.configuration || {}),
      JSON.stringify(input.metadata || {}),
      input.createdBy
    ];
    
    const [useCase] = await query<UseCase>(sql, values);
    return useCase;
  }

  static async findById(id: string): Promise<UseCase | null> {
    const sql = 'SELECT * FROM use_cases WHERE id = $1';
    const [useCase] = await query<UseCase>(sql, [id]);
    return useCase || null;
  }

  static async findByVertical(
    verticalId: string,
    filters?: {
      status?: string;
      complexity?: string;
    }
  ): Promise<UseCase[]> {
    let sql = 'SELECT * FROM use_cases WHERE vertical_id = $1';
    const values: any[] = [verticalId];
    let paramCount = 2;

    if (filters?.status) {
      sql += ` AND status = $${paramCount++}`;
      values.push(filters.status);
    }

    if (filters?.complexity) {
      sql += ` AND complexity = $${paramCount++}`;
      values.push(filters.complexity);
    }

    sql += ' ORDER BY name ASC';
    
    return query<UseCase>(sql, values);
  }

  static async findAll(
    filters?: {
      status?: string;
      complexity?: string;
      verticalId?: string;
    },
    limit = 50,
    offset = 0
  ): Promise<UseCase[]> {
    let sql = 'SELECT * FROM use_cases WHERE 1=1';
    const values: any[] = [];
    let paramCount = 1;

    if (filters?.status) {
      sql += ` AND status = $${paramCount++}`;
      values.push(filters.status);
    }

    if (filters?.complexity) {
      sql += ` AND complexity = $${paramCount++}`;
      values.push(filters.complexity);
    }

    if (filters?.verticalId) {
      sql += ` AND vertical_id = $${paramCount++}`;
      values.push(filters.verticalId);
    }

    sql += ` ORDER BY vertical_id, name ASC LIMIT $${paramCount++} OFFSET $${paramCount}`;
    values.push(limit, offset);
    
    return query<UseCase>(sql, values);
  }

  static async update(id: string, input: UpdateUseCaseInput): Promise<UseCase | null> {
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

    if (input.complexity !== undefined) {
      fields.push(`complexity = $${paramCount++}`);
      values.push(input.complexity);
    }

    if (input.estimatedTime !== undefined) {
      fields.push(`estimated_time = $${paramCount++}`);
      values.push(input.estimatedTime);
    }

    if (input.siaScores !== undefined) {
      fields.push(`sia_scores = $${paramCount++}`);
      values.push(JSON.stringify(input.siaScores));
    }

    if (input.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(input.status);
    }

    if (input.version !== undefined) {
      fields.push(`version = $${paramCount++}`);
      values.push(input.version);
    }

    if (input.configuration !== undefined) {
      fields.push(`configuration = $${paramCount++}`);
      values.push(JSON.stringify(input.configuration));
    }

    if (input.metadata !== undefined) {
      fields.push(`metadata = $${paramCount++}`);
      values.push(JSON.stringify(input.metadata));
    }

    if (input.updatedBy !== undefined) {
      fields.push(`updated_by = $${paramCount++}`);
      values.push(input.updatedBy);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const sql = `
      UPDATE use_cases 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const [useCase] = await query<UseCase>(sql, values);
    return useCase || null;
  }

  static async updateStatus(id: string, status: UseCase['status'], updatedBy: string): Promise<boolean> {
    const sql = `
      UPDATE use_cases 
      SET status = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $3
    `;
    const result = await query(sql, [status, updatedBy, id]);
    return result.length > 0;
  }

  static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM use_cases WHERE id = $1';
    const result = await query(sql, [id]);
    return result.length > 0;
  }

  static async archive(id: string, updatedBy: string): Promise<boolean> {
    return this.updateStatus(id, 'archived', updatedBy);
  }

  static async getStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byComplexity: Record<string, number>;
    byVertical: Record<string, number>;
  }> {
    const sql = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'draft') as draft,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'archived') as archived,
        COUNT(*) FILTER (WHERE complexity = 'low') as low,
        COUNT(*) FILTER (WHERE complexity = 'medium') as medium,
        COUNT(*) FILTER (WHERE complexity = 'high') as high
      FROM use_cases
    `;
    
    const [stats] = await query<any>(sql);
    
    // Get stats by vertical
    const verticalSql = `
      SELECT vertical_id, COUNT(*) as count
      FROM use_cases
      GROUP BY vertical_id
    `;
    
    const verticalStats = await query<{ vertical_id: string; count: string }>(verticalSql);
    const byVertical: Record<string, number> = {};
    
    verticalStats.forEach(stat => {
      byVertical[stat.vertical_id] = parseInt(stat.count, 10);
    });
    
    return {
      total: parseInt(stats.total, 10),
      byStatus: {
        draft: parseInt(stats.draft, 10),
        active: parseInt(stats.active, 10),
        archived: parseInt(stats.archived, 10)
      },
      byComplexity: {
        low: parseInt(stats.low, 10),
        medium: parseInt(stats.medium, 10),
        high: parseInt(stats.high, 10)
      },
      byVertical
    };
  }

  static async searchByName(searchTerm: string, limit = 50): Promise<UseCase[]> {
    const sql = `
      SELECT * FROM use_cases 
      WHERE name ILIKE $1 OR description ILIKE $1
      ORDER BY name ASC
      LIMIT $2
    `;
    return query<UseCase>(sql, [`%${searchTerm}%`, limit]);
  }

  static async clone(id: string, createdBy: string): Promise<UseCase | null> {
    const original = await this.findById(id);
    if (!original) return null;

    const sql = `
      INSERT INTO use_cases (
        vertical_id, name, description, complexity, estimated_time,
        sia_scores, status, version, configuration, metadata, created_by
      )
      SELECT 
        vertical_id, 
        name || ' (Copy)', 
        description, 
        complexity, 
        estimated_time,
        sia_scores, 
        'draft', 
        '1.0.0', 
        configuration, 
        metadata, 
        $1
      FROM use_cases
      WHERE id = $2
      RETURNING *
    `;
    
    const [useCase] = await query<UseCase>(sql, [createdBy, id]);
    return useCase;
  }
}