import { query, transaction } from '../config/database';

export interface Report {
  id: string;
  analysisId: string;
  userId: string;
  organizationId: string;
  title: string;
  type: 'analysis' | 'compliance' | 'risk' | 'executive' | 'technical';
  format: 'pdf' | 'excel' | 'json' | 'html';
  content: {
    sections: Array<{
      title: string;
      content: string | Record<string, any>;
      charts?: Array<{
        type: 'bar' | 'line' | 'pie' | 'radar';
        data: any;
        options?: any;
      }>;
    }>;
    metadata: {
      generatedBy: string;
      version: string;
      confidentialityLevel: 'public' | 'internal' | 'confidential' | 'restricted';
    };
  };
  fileUrl?: string;
  fileSizeBytes?: number;
  status: 'generating' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReportInput {
  analysisId: string;
  userId: string;
  organizationId: string;
  title: string;
  type: 'analysis' | 'compliance' | 'risk' | 'executive' | 'technical';
  format: 'pdf' | 'excel' | 'json' | 'html';
  content?: Report['content'];
}

export interface UpdateReportInput {
  title?: string;
  content?: Report['content'];
  fileUrl?: string;
  fileSizeBytes?: number;
  status?: 'generating' | 'completed' | 'failed';
  error?: string;
}

export class ReportModel {
  static async create(input: CreateReportInput): Promise<Report> {
    const defaultContent = {
      sections: [],
      metadata: {
        generatedBy: 'Seraphim Vanguards',
        version: '1.0.0',
        confidentialityLevel: 'internal' as const
      }
    };

    const sql = `
      INSERT INTO reports (
        analysis_id, user_id, organization_id, title, 
        type, format, content, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'generating')
      RETURNING *
    `;
    
    const values = [
      input.analysisId,
      input.userId,
      input.organizationId,
      input.title,
      input.type,
      input.format,
      JSON.stringify(input.content || defaultContent)
    ];
    
    const [report] = await query<Report>(sql, values);
    return report;
  }

  static async findById(id: string): Promise<Report | null> {
    const sql = 'SELECT * FROM reports WHERE id = $1';
    const [report] = await query<Report>(sql, [id]);
    return report || null;
  }

  static async findByAnalysisId(analysisId: string): Promise<Report[]> {
    const sql = 'SELECT * FROM reports WHERE analysis_id = $1 ORDER BY created_at DESC';
    return query<Report>(sql, [analysisId]);
  }

  static async findByUser(userId: string, limit = 50, offset = 0): Promise<Report[]> {
    const sql = `
      SELECT * FROM reports 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    return query<Report>(sql, [userId, limit, offset]);
  }

  static async findByOrganization(
    organizationId: string,
    filters?: {
      type?: string;
      format?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
    },
    limit = 50,
    offset = 0
  ): Promise<Report[]> {
    let sql = 'SELECT * FROM reports WHERE organization_id = $1';
    const values: any[] = [organizationId];
    let paramCount = 2;

    if (filters?.type) {
      sql += ` AND type = $${paramCount++}`;
      values.push(filters.type);
    }

    if (filters?.format) {
      sql += ` AND format = $${paramCount++}`;
      values.push(filters.format);
    }

    if (filters?.status) {
      sql += ` AND status = $${paramCount++}`;
      values.push(filters.status);
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
    
    return query<Report>(sql, values);
  }

  static async update(id: string, input: UpdateReportInput): Promise<Report | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(input.title);
    }

    if (input.content !== undefined) {
      fields.push(`content = $${paramCount++}`);
      values.push(JSON.stringify(input.content));
    }

    if (input.fileUrl !== undefined) {
      fields.push(`file_url = $${paramCount++}`);
      values.push(input.fileUrl);
    }

    if (input.fileSizeBytes !== undefined) {
      fields.push(`file_size_bytes = $${paramCount++}`);
      values.push(input.fileSizeBytes);
    }

    if (input.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(input.status);
    }

    if (input.error !== undefined) {
      fields.push(`error = $${paramCount++}`);
      values.push(input.error);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const sql = `
      UPDATE reports 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const [report] = await query<Report>(sql, values);
    return report || null;
  }

  static async updateStatus(id: string, status: Report['status'], error?: string): Promise<boolean> {
    const sql = error
      ? `UPDATE reports SET status = $1, error = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`
      : `UPDATE reports SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`;
    
    const values = error ? [status, error, id] : [status, id];
    const result = await query(sql, values);
    return result.length > 0;
  }

  static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM reports WHERE id = $1';
    const result = await query(sql, [id]);
    return result.length > 0;
  }

  static async getStats(organizationId: string): Promise<{
    total: number;
    byType: Record<string, number>;
    byFormat: Record<string, number>;
    byStatus: Record<string, number>;
    totalSizeMB: number;
  }> {
    const sql = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE type = 'analysis') as analysis,
        COUNT(*) FILTER (WHERE type = 'compliance') as compliance,
        COUNT(*) FILTER (WHERE type = 'risk') as risk,
        COUNT(*) FILTER (WHERE type = 'executive') as executive,
        COUNT(*) FILTER (WHERE type = 'technical') as technical,
        COUNT(*) FILTER (WHERE format = 'pdf') as pdf,
        COUNT(*) FILTER (WHERE format = 'excel') as excel,
        COUNT(*) FILTER (WHERE format = 'json') as json,
        COUNT(*) FILTER (WHERE format = 'html') as html,
        COUNT(*) FILTER (WHERE status = 'generating') as generating,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COALESCE(SUM(file_size_bytes) / 1048576, 0) as total_size_mb
      FROM reports
      WHERE organization_id = $1
    `;
    
    const [stats] = await query<any>(sql, [organizationId]);
    
    return {
      total: parseInt(stats.total, 10),
      byType: {
        analysis: parseInt(stats.analysis, 10),
        compliance: parseInt(stats.compliance, 10),
        risk: parseInt(stats.risk, 10),
        executive: parseInt(stats.executive, 10),
        technical: parseInt(stats.technical, 10)
      },
      byFormat: {
        pdf: parseInt(stats.pdf, 10),
        excel: parseInt(stats.excel, 10),
        json: parseInt(stats.json, 10),
        html: parseInt(stats.html, 10)
      },
      byStatus: {
        generating: parseInt(stats.generating, 10),
        completed: parseInt(stats.completed, 10),
        failed: parseInt(stats.failed, 10)
      },
      totalSizeMB: parseFloat(stats.total_size_mb)
    };
  }

  static async searchByTitle(
    organizationId: string, 
    searchTerm: string, 
    limit = 50
  ): Promise<Report[]> {
    const sql = `
      SELECT * FROM reports 
      WHERE organization_id = $1 
        AND title ILIKE $2
      ORDER BY created_at DESC
      LIMIT $3
    `;
    return query<Report>(sql, [organizationId, `%${searchTerm}%`, limit]);
  }
}