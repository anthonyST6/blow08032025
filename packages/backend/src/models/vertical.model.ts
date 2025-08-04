import { query } from '../config/database';

export interface Vertical {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgGradient: string;
  features: string[];
  regulations: string[];
  aiAgents: string[];
  templates: string[];
  metrics: {
    id: string;
    name: string;
    unit: string;
    threshold: {
      warning: number;
      critical: number;
    };
    visualization: 'gauge' | 'line' | 'bar' | 'pie';
  }[];
  dashboardWidgets: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVerticalInput {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgGradient: string;
  features: string[];
  regulations: string[];
  aiAgents: string[];
  templates: string[];
  metrics: any[];
  dashboardWidgets: string[];
}

export interface UpdateVerticalInput {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  bgGradient?: string;
  features?: string[];
  regulations?: string[];
  aiAgents?: string[];
  templates?: string[];
  metrics?: any[];
  dashboardWidgets?: string[];
  isActive?: boolean;
}

export class VerticalModel {
  static async create(input: CreateVerticalInput): Promise<Vertical> {
    const sql = `
      INSERT INTO verticals (
        id, name, description, icon, color, bg_gradient,
        features, regulations, ai_agents, templates, metrics,
        dashboard_widgets, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true)
      RETURNING *
    `;
    
    const values = [
      input.id,
      input.name,
      input.description,
      input.icon,
      input.color,
      input.bgGradient,
      JSON.stringify(input.features),
      JSON.stringify(input.regulations),
      JSON.stringify(input.aiAgents),
      JSON.stringify(input.templates),
      JSON.stringify(input.metrics),
      JSON.stringify(input.dashboardWidgets)
    ];
    
    const [vertical] = await query<Vertical>(sql, values);
    return vertical;
  }

  static async findById(id: string): Promise<Vertical | null> {
    const sql = 'SELECT * FROM verticals WHERE id = $1';
    const [vertical] = await query<Vertical>(sql, [id]);
    return vertical || null;
  }

  static async findAll(includeInactive = false): Promise<Vertical[]> {
    let sql = 'SELECT * FROM verticals';
    if (!includeInactive) {
      sql += ' WHERE is_active = true';
    }
    sql += ' ORDER BY name ASC';
    
    return query<Vertical>(sql);
  }

  static async update(id: string, input: UpdateVerticalInput): Promise<Vertical | null> {
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

    if (input.icon !== undefined) {
      fields.push(`icon = $${paramCount++}`);
      values.push(input.icon);
    }

    if (input.color !== undefined) {
      fields.push(`color = $${paramCount++}`);
      values.push(input.color);
    }

    if (input.bgGradient !== undefined) {
      fields.push(`bg_gradient = $${paramCount++}`);
      values.push(input.bgGradient);
    }

    if (input.features !== undefined) {
      fields.push(`features = $${paramCount++}`);
      values.push(JSON.stringify(input.features));
    }

    if (input.regulations !== undefined) {
      fields.push(`regulations = $${paramCount++}`);
      values.push(JSON.stringify(input.regulations));
    }

    if (input.aiAgents !== undefined) {
      fields.push(`ai_agents = $${paramCount++}`);
      values.push(JSON.stringify(input.aiAgents));
    }

    if (input.templates !== undefined) {
      fields.push(`templates = $${paramCount++}`);
      values.push(JSON.stringify(input.templates));
    }

    if (input.metrics !== undefined) {
      fields.push(`metrics = $${paramCount++}`);
      values.push(JSON.stringify(input.metrics));
    }

    if (input.dashboardWidgets !== undefined) {
      fields.push(`dashboard_widgets = $${paramCount++}`);
      values.push(JSON.stringify(input.dashboardWidgets));
    }

    if (input.isActive !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(input.isActive);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const sql = `
      UPDATE verticals 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const [vertical] = await query<Vertical>(sql, values);
    return vertical || null;
  }

  static async deactivate(id: string): Promise<boolean> {
    const sql = `
      UPDATE verticals 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
    `;
    const result = await query(sql, [id]);
    return result.length > 0;
  }

  static async getUseCaseCount(verticalId: string): Promise<number> {
    const sql = `
      SELECT COUNT(*) as count 
      FROM use_cases 
      WHERE vertical_id = $1 AND status != 'archived'
    `;
    const [result] = await query<{ count: string }>(sql, [verticalId]);
    return parseInt(result.count, 10);
  }

  static async getStats(): Promise<Record<string, {
    useCaseCount: number;
    activeUseCases: number;
    executionCount: number;
  }>> {
    const sql = `
      SELECT 
        v.id as vertical_id,
        COUNT(DISTINCT uc.id) as use_case_count,
        COUNT(DISTINCT uc.id) FILTER (WHERE uc.status = 'active') as active_use_cases,
        COUNT(DISTINCT uce.id) as execution_count
      FROM verticals v
      LEFT JOIN use_cases uc ON v.id = uc.vertical_id
      LEFT JOIN use_case_executions uce ON uc.id = uce.use_case_id
      WHERE v.is_active = true
      GROUP BY v.id
    `;
    
    const results = await query<{
      vertical_id: string;
      use_case_count: string;
      active_use_cases: string;
      execution_count: string;
    }>(sql);
    
    const stats: Record<string, any> = {};
    
    results.forEach(result => {
      stats[result.vertical_id] = {
        useCaseCount: parseInt(result.use_case_count, 10),
        activeUseCases: parseInt(result.active_use_cases, 10),
        executionCount: parseInt(result.execution_count, 10)
      };
    });
    
    return stats;
  }
}