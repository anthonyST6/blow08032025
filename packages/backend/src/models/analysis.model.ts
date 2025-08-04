import { query, transaction } from '../config/database';

export interface VanguardResult {
  agentName: string;
  status: 'passed' | 'warning' | 'failed';
  score: number;
  findings: string[];
  recommendations: string[];
  metadata?: Record<string, any>;
}

export interface Analysis {
  id: string;
  promptId: string;
  userId: string;
  organizationId: string;
  domain: 'energy' | 'government' | 'insurance';
  domainAgentResult: {
    status: 'success' | 'error';
    analysis: string;
    extractedData?: Record<string, any>;
    confidence: number;
  };
  vanguardResults: {
    securitySentinel: VanguardResult;
    integrityAuditor: VanguardResult;
    accuracyEngine: VanguardResult;
  };
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  processingTimeMs: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAnalysisInput {
  promptId: string;
  userId: string;
  organizationId: string;
  domain: 'energy' | 'government' | 'insurance';
}

export interface UpdateAnalysisInput {
  domainAgentResult?: Analysis['domainAgentResult'];
  vanguardResults?: Analysis['vanguardResults'];
  overallScore?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  summary?: string;
  processingTimeMs?: number;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export class AnalysisModel {
  static async create(input: CreateAnalysisInput): Promise<Analysis> {
    const sql = `
      INSERT INTO analyses (
        prompt_id, user_id, organization_id, domain, 
        status, overall_score, risk_level
      )
      VALUES ($1, $2, $3, $4, 'pending', 0, 'low')
      RETURNING *
    `;
    
    const values = [
      input.promptId,
      input.userId,
      input.organizationId,
      input.domain
    ];
    
    const [analysis] = await query<Analysis>(sql, values);
    return analysis;
  }

  static async findById(id: string): Promise<Analysis | null> {
    const sql = 'SELECT * FROM analyses WHERE id = $1';
    const [analysis] = await query<Analysis>(sql, [id]);
    return analysis || null;
  }

  static async findByPromptId(promptId: string): Promise<Analysis | null> {
    const sql = 'SELECT * FROM analyses WHERE prompt_id = $1 ORDER BY created_at DESC LIMIT 1';
    const [analysis] = await query<Analysis>(sql, [promptId]);
    return analysis || null;
  }

  static async findByUser(userId: string, limit = 50, offset = 0): Promise<Analysis[]> {
    const sql = `
      SELECT * FROM analyses 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    return query<Analysis>(sql, [userId, limit, offset]);
  }

  static async findByOrganization(
    organizationId: string,
    filters?: {
      domain?: string;
      status?: string;
      riskLevel?: string;
      startDate?: Date;
      endDate?: Date;
    },
    limit = 50,
    offset = 0
  ): Promise<Analysis[]> {
    let sql = 'SELECT * FROM analyses WHERE organization_id = $1';
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

    if (filters?.riskLevel) {
      sql += ` AND risk_level = $${paramCount++}`;
      values.push(filters.riskLevel);
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
    
    return query<Analysis>(sql, values);
  }

  static async update(id: string, input: UpdateAnalysisInput): Promise<Analysis | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.domainAgentResult !== undefined) {
      fields.push(`domain_agent_result = $${paramCount++}`);
      values.push(JSON.stringify(input.domainAgentResult));
    }

    if (input.vanguardResults !== undefined) {
      fields.push(`vanguard_results = $${paramCount++}`);
      values.push(JSON.stringify(input.vanguardResults));
    }

    if (input.overallScore !== undefined) {
      fields.push(`overall_score = $${paramCount++}`);
      values.push(input.overallScore);
    }

    if (input.riskLevel !== undefined) {
      fields.push(`risk_level = $${paramCount++}`);
      values.push(input.riskLevel);
    }

    if (input.summary !== undefined) {
      fields.push(`summary = $${paramCount++}`);
      values.push(input.summary);
    }

    if (input.processingTimeMs !== undefined) {
      fields.push(`processing_time_ms = $${paramCount++}`);
      values.push(input.processingTimeMs);
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
      UPDATE analyses 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const [analysis] = await query<Analysis>(sql, values);
    return analysis || null;
  }

  static async updateStatus(id: string, status: Analysis['status'], error?: string): Promise<boolean> {
    const sql = error
      ? `UPDATE analyses SET status = $1, error = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`
      : `UPDATE analyses SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`;
    
    const values = error ? [status, error, id] : [status, id];
    const result = await query(sql, values);
    return result.length > 0;
  }

  static async getStats(organizationId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byRiskLevel: Record<string, number>;
    byDomain: Record<string, number>;
    averageScore: number;
    averageProcessingTime: number;
  }> {
    const sql = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'processing') as processing,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COUNT(*) FILTER (WHERE risk_level = 'low') as low_risk,
        COUNT(*) FILTER (WHERE risk_level = 'medium') as medium_risk,
        COUNT(*) FILTER (WHERE risk_level = 'high') as high_risk,
        COUNT(*) FILTER (WHERE risk_level = 'critical') as critical_risk,
        COUNT(*) FILTER (WHERE domain = 'energy') as energy,
        COUNT(*) FILTER (WHERE domain = 'government') as government,
        COUNT(*) FILTER (WHERE domain = 'insurance') as insurance,
        AVG(overall_score) as avg_score,
        AVG(processing_time_ms) as avg_processing_time
      FROM analyses
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
      byRiskLevel: {
        low: parseInt(stats.low_risk, 10),
        medium: parseInt(stats.medium_risk, 10),
        high: parseInt(stats.high_risk, 10),
        critical: parseInt(stats.critical_risk, 10)
      },
      byDomain: {
        energy: parseInt(stats.energy, 10),
        government: parseInt(stats.government, 10),
        insurance: parseInt(stats.insurance, 10)
      },
      averageScore: parseFloat(stats.avg_score) || 0,
      averageProcessingTime: parseFloat(stats.avg_processing_time) || 0
    };
  }

  static async getHighRiskAnalyses(organizationId: string, limit = 10): Promise<Analysis[]> {
    const sql = `
      SELECT * FROM analyses 
      WHERE organization_id = $1 
        AND risk_level IN ('high', 'critical')
        AND status = 'completed'
      ORDER BY 
        CASE risk_level 
          WHEN 'critical' THEN 1 
          WHEN 'high' THEN 2 
        END,
        created_at DESC
      LIMIT $2
    `;
    return query<Analysis>(sql, [organizationId, limit]);
  }

  static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM analyses WHERE id = $1';
    const result = await query(sql, [id]);
    return result.length > 0;
  }
}