import { query } from '../config/database';

export interface UseCaseTemplate {
  id: string;
  useCaseId: string;
  name: string;
  description?: string;
  configuration: Record<string, any>;
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUseCaseTemplateInput {
  useCaseId: string;
  name: string;
  description?: string;
  configuration: Record<string, any>;
  isDefault?: boolean;
  createdBy: string;
}

export interface UpdateUseCaseTemplateInput {
  name?: string;
  description?: string;
  configuration?: Record<string, any>;
  isDefault?: boolean;
}

export class UseCaseTemplateModel {
  static async create(input: CreateUseCaseTemplateInput): Promise<UseCaseTemplate> {
    // If setting as default, unset other defaults for this use case
    if (input.isDefault) {
      await query(
        'UPDATE use_case_templates SET is_default = false WHERE use_case_id = $1',
        [input.useCaseId]
      );
    }

    const sql = `
      INSERT INTO use_case_templates (
        use_case_id, name, description, configuration, is_default, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      input.useCaseId,
      input.name,
      input.description || null,
      JSON.stringify(input.configuration),
      input.isDefault || false,
      input.createdBy
    ];
    
    const [template] = await query<UseCaseTemplate>(sql, values);
    return template;
  }

  static async findById(id: string): Promise<UseCaseTemplate | null> {
    const sql = 'SELECT * FROM use_case_templates WHERE id = $1';
    const [template] = await query<UseCaseTemplate>(sql, [id]);
    return template || null;
  }

  static async findByUseCase(useCaseId: string): Promise<UseCaseTemplate[]> {
    const sql = `
      SELECT * FROM use_case_templates 
      WHERE use_case_id = $1 
      ORDER BY is_default DESC, name ASC
    `;
    return query<UseCaseTemplate>(sql, [useCaseId]);
  }

  static async findDefault(useCaseId: string): Promise<UseCaseTemplate | null> {
    const sql = `
      SELECT * FROM use_case_templates 
      WHERE use_case_id = $1 AND is_default = true
      LIMIT 1
    `;
    const [template] = await query<UseCaseTemplate>(sql, [useCaseId]);
    return template || null;
  }

  static async update(id: string, input: UpdateUseCaseTemplateInput): Promise<UseCaseTemplate | null> {
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

    if (input.configuration !== undefined) {
      fields.push(`configuration = $${paramCount++}`);
      values.push(JSON.stringify(input.configuration));
    }

    if (input.isDefault !== undefined) {
      fields.push(`is_default = $${paramCount++}`);
      values.push(input.isDefault);
      
      // If setting as default, we need to unset other defaults
      if (input.isDefault) {
        const template = await this.findById(id);
        if (template) {
          await query(
            'UPDATE use_case_templates SET is_default = false WHERE use_case_id = $1 AND id != $2',
            [template.useCaseId, id]
          );
        }
      }
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const sql = `
      UPDATE use_case_templates 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const [template] = await query<UseCaseTemplate>(sql, values);
    return template || null;
  }

  static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM use_case_templates WHERE id = $1';
    const result = await query(sql, [id]);
    return result.length > 0;
  }

  static async setDefault(id: string): Promise<boolean> {
    // Get the template to find its use case
    const template = await this.findById(id);
    if (!template) return false;

    // Unset all defaults for this use case
    await query(
      'UPDATE use_case_templates SET is_default = false WHERE use_case_id = $1',
      [template.useCaseId]
    );

    // Set this template as default
    const sql = `
      UPDATE use_case_templates 
      SET is_default = true, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
    `;
    const result = await query(sql, [id]);
    return result.length > 0;
  }

  static async clone(id: string, newName: string, createdBy: string): Promise<UseCaseTemplate | null> {
    const original = await this.findById(id);
    if (!original) return null;

    const sql = `
      INSERT INTO use_case_templates (
        use_case_id, name, description, configuration, is_default, created_by
      )
      SELECT 
        use_case_id, 
        $1, 
        description, 
        configuration, 
        false, 
        $2
      FROM use_case_templates
      WHERE id = $3
      RETURNING *
    `;
    
    const [template] = await query<UseCaseTemplate>(sql, [newName, createdBy, id]);
    return template;
  }

  static async getStats(useCaseId?: string): Promise<{
    total: number;
    byUseCase?: Record<string, number>;
  }> {
    if (useCaseId) {
      const sql = 'SELECT COUNT(*) as count FROM use_case_templates WHERE use_case_id = $1';
      const [result] = await query<{ count: string }>(sql, [useCaseId]);
      return {
        total: parseInt(result.count, 10)
      };
    }

    // Get overall stats
    const totalSql = 'SELECT COUNT(*) as count FROM use_case_templates';
    const [totalResult] = await query<{ count: string }>(totalSql);
    
    // Get stats by use case
    const byUseCaseSql = `
      SELECT use_case_id, COUNT(*) as count
      FROM use_case_templates
      GROUP BY use_case_id
    `;
    
    const byUseCaseResults = await query<{ use_case_id: string; count: string }>(byUseCaseSql);
    const byUseCase: Record<string, number> = {};
    
    byUseCaseResults.forEach(result => {
      byUseCase[result.use_case_id] = parseInt(result.count, 10);
    });
    
    return {
      total: parseInt(totalResult.count, 10),
      byUseCase
    };
  }
}