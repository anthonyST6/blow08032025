import { query } from '../config/database';

export interface Alert {
  id: string;
  organizationId: string;
  userId?: string;
  type: 'accuracy' | 'bias' | 'compliance' | 'security' | 'performance' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  source: string;
  sourceId?: string;
  metadata: Record<string, any>;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAlertInput {
  organizationId: string;
  userId?: string;
  type: 'accuracy' | 'bias' | 'compliance' | 'security' | 'performance' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  source: string;
  sourceId?: string;
  metadata?: Record<string, any>;
}

export interface UpdateAlertInput {
  status?: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  acknowledgedBy?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export class AlertModel {
  static async create(input: CreateAlertInput): Promise<Alert> {
    const sql = `
      INSERT INTO alerts (
        organization_id, user_id, type, severity,
        title, message, source, source_id,
        metadata, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')
      RETURNING *
    `;
    
    const values = [
      input.organizationId,
      input.userId,
      input.type,
      input.severity,
      input.title,
      input.message,
      input.source,
      input.sourceId,
      JSON.stringify(input.metadata || {})
    ];
    
    const [alert] = await query<Alert>(sql, values);
    return alert;
  }

  static async findById(id: string): Promise<Alert | null> {
    const sql = 'SELECT * FROM alerts WHERE id = $1';
    const [alert] = await query<Alert>(sql, [id]);
    return alert || null;
  }

  static async findActive(
    organizationId: string,
    filters?: {
      type?: string;
      severity?: string;
      userId?: string;
    }
  ): Promise<Alert[]> {
    let sql = `
      SELECT * FROM alerts 
      WHERE organization_id = $1 AND status = 'active'
    `;
    const values: any[] = [organizationId];
    let paramCount = 2;

    if (filters?.type) {
      sql += ` AND type = $${paramCount++}`;
      values.push(filters.type);
    }

    if (filters?.severity) {
      sql += ` AND severity = $${paramCount++}`;
      values.push(filters.severity);
    }

    if (filters?.userId) {
      sql += ` AND user_id = $${paramCount++}`;
      values.push(filters.userId);
    }

    sql += ` ORDER BY 
      CASE severity 
        WHEN 'critical' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'medium' THEN 3 
        WHEN 'low' THEN 4 
      END,
      created_at DESC`;
    
    return query<Alert>(sql, values);
  }

  static async findByOrganization(
    organizationId: string,
    filters?: {
      type?: string;
      severity?: string;
      status?: string;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
    },
    limit = 100,
    offset = 0
  ): Promise<Alert[]> {
    let sql = 'SELECT * FROM alerts WHERE organization_id = $1';
    const values: any[] = [organizationId];
    let paramCount = 2;

    if (filters?.type) {
      sql += ` AND type = $${paramCount++}`;
      values.push(filters.type);
    }

    if (filters?.severity) {
      sql += ` AND severity = $${paramCount++}`;
      values.push(filters.severity);
    }

    if (filters?.status) {
      sql += ` AND status = $${paramCount++}`;
      values.push(filters.status);
    }

    if (filters?.userId) {
      sql += ` AND user_id = $${paramCount++}`;
      values.push(filters.userId);
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
    
    return query<Alert>(sql, values);
  }

  static async acknowledge(id: string, userId: string): Promise<Alert | null> {
    const sql = `
      UPDATE alerts 
      SET status = 'acknowledged',
          acknowledged_by = $1,
          acknowledged_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND status = 'active'
      RETURNING *
    `;
    
    const [alert] = await query<Alert>(sql, [userId, id]);
    return alert || null;
  }

  static async resolve(
    id: string, 
    userId: string, 
    resolutionNotes?: string
  ): Promise<Alert | null> {
    const sql = `
      UPDATE alerts 
      SET status = 'resolved',
          resolved_by = $1,
          resolved_at = CURRENT_TIMESTAMP,
          resolution_notes = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND status IN ('active', 'acknowledged')
      RETURNING *
    `;
    
    const [alert] = await query<Alert>(sql, [userId, resolutionNotes, id]);
    return alert || null;
  }

  static async dismiss(id: string, userId: string): Promise<Alert | null> {
    const sql = `
      UPDATE alerts 
      SET status = 'dismissed',
          resolved_by = $1,
          resolved_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND status IN ('active', 'acknowledged')
      RETURNING *
    `;
    
    const [alert] = await query<Alert>(sql, [userId, id]);
    return alert || null;
  }

  static async getStats(organizationId: string): Promise<{
    total: number;
    active: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    byStatus: Record<string, number>;
    averageResolutionTime: number;
  }> {
    const sql = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE type = 'accuracy') as accuracy,
        COUNT(*) FILTER (WHERE type = 'bias') as bias,
        COUNT(*) FILTER (WHERE type = 'compliance') as compliance,
        COUNT(*) FILTER (WHERE type = 'security') as security,
        COUNT(*) FILTER (WHERE type = 'performance') as performance,
        COUNT(*) FILTER (WHERE type = 'system') as system,
        COUNT(*) FILTER (WHERE severity = 'low') as low,
        COUNT(*) FILTER (WHERE severity = 'medium') as medium,
        COUNT(*) FILTER (WHERE severity = 'high') as high,
        COUNT(*) FILTER (WHERE severity = 'critical') as critical,
        COUNT(*) FILTER (WHERE status = 'acknowledged') as acknowledged,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
        COUNT(*) FILTER (WHERE status = 'dismissed') as dismissed,
        AVG(
          CASE 
            WHEN status = 'resolved' AND resolved_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600
            ELSE NULL 
          END
        ) as avg_resolution_hours
      FROM alerts
      WHERE organization_id = $1
    `;
    
    const [stats] = await query<any>(sql, [organizationId]);
    
    return {
      total: parseInt(stats.total, 10),
      active: parseInt(stats.active, 10),
      byType: {
        accuracy: parseInt(stats.accuracy, 10),
        bias: parseInt(stats.bias, 10),
        compliance: parseInt(stats.compliance, 10),
        security: parseInt(stats.security, 10),
        performance: parseInt(stats.performance, 10),
        system: parseInt(stats.system, 10)
      },
      bySeverity: {
        low: parseInt(stats.low, 10),
        medium: parseInt(stats.medium, 10),
        high: parseInt(stats.high, 10),
        critical: parseInt(stats.critical, 10)
      },
      byStatus: {
        active: parseInt(stats.active, 10),
        acknowledged: parseInt(stats.acknowledged, 10),
        resolved: parseInt(stats.resolved, 10),
        dismissed: parseInt(stats.dismissed, 10)
      },
      averageResolutionTime: parseFloat(stats.avg_resolution_hours) || 0
    };
  }

  static async getCriticalAlerts(organizationId: string): Promise<Alert[]> {
    const sql = `
      SELECT * FROM alerts 
      WHERE organization_id = $1 
        AND severity = 'critical' 
        AND status IN ('active', 'acknowledged')
      ORDER BY created_at DESC
    `;
    return query<Alert>(sql, [organizationId]);
  }

  static async cleanup(daysToKeep = 30): Promise<number> {
    const sql = `
      DELETE FROM alerts 
      WHERE status IN ('resolved', 'dismissed')
        AND updated_at < CURRENT_DATE - INTERVAL '${daysToKeep} days'
    `;
    const result = await query(sql);
    return result.length;
  }
}