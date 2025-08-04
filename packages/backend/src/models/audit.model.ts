import { query } from '../config/database';

export interface AuditLog {
  id: string;
  userId: string;
  organizationId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  error?: string;
  createdAt: Date;
}

export interface CreateAuditLogInput {
  userId: string;
  organizationId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  error?: string;
}

export class AuditModel {
  static async create(input: CreateAuditLogInput): Promise<AuditLog> {
    const sql = `
      INSERT INTO audit_logs (
        user_id, organization_id, action, resource, 
        resource_id, details, ip_address, user_agent, 
        status, error
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      input.userId,
      input.organizationId,
      input.action,
      input.resource,
      input.resourceId,
      JSON.stringify(input.details || {}),
      input.ipAddress,
      input.userAgent,
      input.status,
      input.error
    ];
    
    const [auditLog] = await query<AuditLog>(sql, values);
    return auditLog;
  }

  static async findById(id: string): Promise<AuditLog | null> {
    const sql = 'SELECT * FROM audit_logs WHERE id = $1';
    const [auditLog] = await query<AuditLog>(sql, [id]);
    return auditLog || null;
  }

  static async findByUser(
    userId: string, 
    limit = 100, 
    offset = 0
  ): Promise<AuditLog[]> {
    const sql = `
      SELECT * FROM audit_logs 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    return query<AuditLog>(sql, [userId, limit, offset]);
  }

  static async findByOrganization(
    organizationId: string,
    filters?: {
      userId?: string;
      action?: string;
      resource?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
    },
    limit = 100,
    offset = 0
  ): Promise<AuditLog[]> {
    let sql = 'SELECT * FROM audit_logs WHERE organization_id = $1';
    const values: any[] = [organizationId];
    let paramCount = 2;

    if (filters?.userId) {
      sql += ` AND user_id = $${paramCount++}`;
      values.push(filters.userId);
    }

    if (filters?.action) {
      sql += ` AND action = $${paramCount++}`;
      values.push(filters.action);
    }

    if (filters?.resource) {
      sql += ` AND resource = $${paramCount++}`;
      values.push(filters.resource);
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
    
    return query<AuditLog>(sql, values);
  }

  static async findByResource(
    resource: string,
    resourceId: string,
    limit = 50
  ): Promise<AuditLog[]> {
    const sql = `
      SELECT * FROM audit_logs 
      WHERE resource = $1 AND resource_id = $2
      ORDER BY created_at DESC
      LIMIT $3
    `;
    return query<AuditLog>(sql, [resource, resourceId, limit]);
  }

  static async getActionStats(
    organizationId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Array<{ action: string; count: number }>> {
    let sql = `
      SELECT action, COUNT(*) as count
      FROM audit_logs
      WHERE organization_id = $1
    `;
    const values: any[] = [organizationId];
    let paramCount = 2;

    if (startDate) {
      sql += ` AND created_at >= $${paramCount++}`;
      values.push(startDate);
    }

    if (endDate) {
      sql += ` AND created_at <= $${paramCount++}`;
      values.push(endDate);
    }

    sql += ' GROUP BY action ORDER BY count DESC';
    
    const results = await query<{ action: string; count: string }>(sql, values);
    return results.map(r => ({
      action: r.action,
      count: parseInt(r.count, 10)
    }));
  }

  static async getFailureRate(
    organizationId: string,
    days = 7
  ): Promise<number> {
    const sql = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'failure') as failures,
        COUNT(*) as total
      FROM audit_logs
      WHERE organization_id = $1
        AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
    `;
    
    const [result] = await query<{ failures: string; total: string }>(sql, [organizationId]);
    const failures = parseInt(result.failures, 10);
    const total = parseInt(result.total, 10);
    
    return total > 0 ? (failures / total) * 100 : 0;
  }

  static async cleanup(daysToKeep = 90): Promise<number> {
    const sql = `
      DELETE FROM audit_logs 
      WHERE created_at < CURRENT_DATE - INTERVAL '${daysToKeep} days'
    `;
    const result = await query(sql);
    return result.length;
  }
}