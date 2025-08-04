import { query } from '../config/database';

export interface Metric {
  id: string;
  organizationId: string;
  name: string;
  value: number;
  unit?: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  tags: Record<string, string>;
  metadata?: Record<string, any>;
  timestamp: Date;
  createdAt: Date;
}

export interface CreateMetricInput {
  organizationId: string;
  name: string;
  value: number;
  unit?: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  tags?: Record<string, string>;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

export interface MetricAggregation {
  name: string;
  period: string;
  min: number;
  max: number;
  avg: number;
  sum: number;
  count: number;
  p50: number;
  p95: number;
  p99: number;
}

export class MetricModel {
  static async create(input: CreateMetricInput): Promise<Metric> {
    const sql = `
      INSERT INTO metrics (
        organization_id, name, value, unit,
        type, tags, metadata, timestamp
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      input.organizationId,
      input.name,
      input.value,
      input.unit,
      input.type,
      JSON.stringify(input.tags || {}),
      JSON.stringify(input.metadata || {}),
      input.timestamp || new Date()
    ];
    
    const [metric] = await query<Metric>(sql, values);
    return metric;
  }

  static async createBatch(metrics: CreateMetricInput[]): Promise<number> {
    if (metrics.length === 0) return 0;

    const values: any[] = [];
    const placeholders: string[] = [];
    let paramCount = 1;

    metrics.forEach((metric) => {
      const placeholder = `($${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++})`;
      placeholders.push(placeholder);
      
      values.push(
        metric.organizationId,
        metric.name,
        metric.value,
        metric.unit,
        metric.type,
        JSON.stringify(metric.tags || {}),
        JSON.stringify(metric.metadata || {}),
        metric.timestamp || new Date()
      );
    });

    const sql = `
      INSERT INTO metrics (
        organization_id, name, value, unit,
        type, tags, metadata, timestamp
      )
      VALUES ${placeholders.join(', ')}
    `;
    
    const result = await query(sql, values);
    return result.length;
  }

  static async findByName(
    organizationId: string,
    name: string,
    startTime?: Date,
    endTime?: Date,
    limit = 1000
  ): Promise<Metric[]> {
    let sql = 'SELECT * FROM metrics WHERE organization_id = $1 AND name = $2';
    const values: any[] = [organizationId, name];
    let paramCount = 3;

    if (startTime) {
      sql += ` AND timestamp >= $${paramCount++}`;
      values.push(startTime);
    }

    if (endTime) {
      sql += ` AND timestamp <= $${paramCount++}`;
      values.push(endTime);
    }

    sql += ` ORDER BY timestamp DESC LIMIT $${paramCount}`;
    values.push(limit);
    
    return query<Metric>(sql, values);
  }

  static async findByTags(
    organizationId: string,
    tags: Record<string, string>,
    startTime?: Date,
    endTime?: Date,
    limit = 1000
  ): Promise<Metric[]> {
    let sql = 'SELECT * FROM metrics WHERE organization_id = $1';
    const values: any[] = [organizationId];
    let paramCount = 2;

    // Add tag filters
    Object.entries(tags).forEach(([key, value]) => {
      sql += ` AND tags->>'${key}' = $${paramCount++}`;
      values.push(value);
    });

    if (startTime) {
      sql += ` AND timestamp >= $${paramCount++}`;
      values.push(startTime);
    }

    if (endTime) {
      sql += ` AND timestamp <= $${paramCount++}`;
      values.push(endTime);
    }

    sql += ` ORDER BY timestamp DESC LIMIT $${paramCount}`;
    values.push(limit);
    
    return query<Metric>(sql, values);
  }

  static async aggregate(
    organizationId: string,
    name: string,
    interval: '1m' | '5m' | '15m' | '1h' | '1d',
    startTime: Date,
    endTime: Date
  ): Promise<MetricAggregation[]> {
    const sql = `
      SELECT 
        name,
        date_trunc('${interval}', timestamp) as period,
        MIN(value) as min,
        MAX(value) as max,
        AVG(value) as avg,
        SUM(value) as sum,
        COUNT(*) as count,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY value) as p50,
        percentile_cont(0.95) WITHIN GROUP (ORDER BY value) as p95,
        percentile_cont(0.99) WITHIN GROUP (ORDER BY value) as p99
      FROM metrics
      WHERE organization_id = $1 
        AND name = $2
        AND timestamp >= $3
        AND timestamp <= $4
      GROUP BY name, period
      ORDER BY period DESC
    `;
    
    const results = await query<any>(sql, [organizationId, name, startTime, endTime]);
    
    return results.map(r => ({
      name: r.name,
      period: r.period,
      min: parseFloat(r.min),
      max: parseFloat(r.max),
      avg: parseFloat(r.avg),
      sum: parseFloat(r.sum),
      count: parseInt(r.count, 10),
      p50: parseFloat(r.p50),
      p95: parseFloat(r.p95),
      p99: parseFloat(r.p99)
    }));
  }

  static async getLatestValues(
    organizationId: string,
    names: string[]
  ): Promise<Record<string, number>> {
    const placeholders = names.map((_, i) => `$${i + 2}`).join(', ');
    
    const sql = `
      SELECT DISTINCT ON (name) 
        name, value
      FROM metrics
      WHERE organization_id = $1 
        AND name IN (${placeholders})
      ORDER BY name, timestamp DESC
    `;
    
    const values = [organizationId, ...names];
    const results = await query<{ name: string; value: number }>(sql, values);
    
    const latestValues: Record<string, number> = {};
    results.forEach(r => {
      latestValues[r.name] = r.value;
    });
    
    return latestValues;
  }

  static async getMetricNames(organizationId: string): Promise<string[]> {
    const sql = `
      SELECT DISTINCT name 
      FROM metrics 
      WHERE organization_id = $1
      ORDER BY name
    `;
    
    const results = await query<{ name: string }>(sql, [organizationId]);
    return results.map(r => r.name);
  }

  static async getStats(
    organizationId: string,
    days = 7
  ): Promise<{
    totalMetrics: number;
    uniqueNames: number;
    byType: Record<string, number>;
    topMetrics: Array<{ name: string; count: number }>;
  }> {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_metrics,
        COUNT(DISTINCT name) as unique_names,
        COUNT(*) FILTER (WHERE type = 'counter') as counter,
        COUNT(*) FILTER (WHERE type = 'gauge') as gauge,
        COUNT(*) FILTER (WHERE type = 'histogram') as histogram,
        COUNT(*) FILTER (WHERE type = 'summary') as summary
      FROM metrics
      WHERE organization_id = $1
        AND timestamp >= CURRENT_DATE - INTERVAL '${days} days'
    `;
    
    const topQuery = `
      SELECT name, COUNT(*) as count
      FROM metrics
      WHERE organization_id = $1
        AND timestamp >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY name
      ORDER BY count DESC
      LIMIT 10
    `;
    
    const [stats] = await query<any>(statsQuery, [organizationId]);
    const topResults = await query<{ name: string; count: string }>(topQuery, [organizationId]);
    
    return {
      totalMetrics: parseInt(stats.total_metrics, 10),
      uniqueNames: parseInt(stats.unique_names, 10),
      byType: {
        counter: parseInt(stats.counter, 10),
        gauge: parseInt(stats.gauge, 10),
        histogram: parseInt(stats.histogram, 10),
        summary: parseInt(stats.summary, 10)
      },
      topMetrics: topResults.map(r => ({
        name: r.name,
        count: parseInt(r.count, 10)
      }))
    };
  }

  static async cleanup(daysToKeep = 30): Promise<number> {
    const sql = `
      DELETE FROM metrics 
      WHERE timestamp < CURRENT_DATE - INTERVAL '${daysToKeep} days'
    `;
    const result = await query(sql);
    return result.length;
  }

  static async deleteByName(
    organizationId: string,
    name: string,
    startTime?: Date,
    endTime?: Date
  ): Promise<number> {
    let sql = 'DELETE FROM metrics WHERE organization_id = $1 AND name = $2';
    const values: any[] = [organizationId, name];
    let paramCount = 3;

    if (startTime) {
      sql += ` AND timestamp >= $${paramCount++}`;
      values.push(startTime);
    }

    if (endTime) {
      sql += ` AND timestamp <= $${paramCount++}`;
      values.push(endTime);
    }

    const result = await query(sql, values);
    return result.length;
  }
}