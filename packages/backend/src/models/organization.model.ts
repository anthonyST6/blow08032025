import { query, transaction } from '../config/database';

export interface Organization {
  id: string;
  name: string;
  domain: string;
  industry: 'energy' | 'government' | 'insurance' | 'other';
  size: 'small' | 'medium' | 'large' | 'enterprise';
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  settings: {
    enabledFeatures: string[];
    apiQuota: number;
    dataRetentionDays: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganizationInput {
  name: string;
  domain: string;
  industry: 'energy' | 'government' | 'insurance' | 'other';
  size: 'small' | 'medium' | 'large' | 'enterprise';
  contactEmail: string;
  contactPhone?: string;
  address?: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  domain?: string;
  industry?: 'energy' | 'government' | 'insurance' | 'other';
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  settings?: {
    enabledFeatures?: string[];
    apiQuota?: number;
    dataRetentionDays?: number;
  };
  isActive?: boolean;
}

export class OrganizationModel {
  static async create(input: CreateOrganizationInput): Promise<Organization> {
    const defaultSettings = {
      enabledFeatures: ['basic_analysis', 'reports'],
      apiQuota: 1000,
      dataRetentionDays: 90
    };

    const sql = `
      INSERT INTO organizations (
        name, domain, industry, size, contact_email, 
        contact_phone, address, settings, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
      RETURNING *
    `;
    
    const values = [
      input.name,
      input.domain,
      input.industry,
      input.size,
      input.contactEmail,
      input.contactPhone,
      input.address,
      JSON.stringify(defaultSettings)
    ];
    
    const [organization] = await query<Organization>(sql, values);
    return organization;
  }

  static async findById(id: string): Promise<Organization | null> {
    const sql = 'SELECT * FROM organizations WHERE id = $1';
    const [organization] = await query<Organization>(sql, [id]);
    return organization || null;
  }

  static async findByDomain(domain: string): Promise<Organization | null> {
    const sql = 'SELECT * FROM organizations WHERE domain = $1';
    const [organization] = await query<Organization>(sql, [domain]);
    return organization || null;
  }

  static async findAll(filters?: {
    industry?: string;
    size?: string;
    isActive?: boolean;
  }): Promise<Organization[]> {
    let sql = 'SELECT * FROM organizations WHERE 1=1';
    const values: any[] = [];
    let paramCount = 1;

    if (filters?.industry) {
      sql += ` AND industry = $${paramCount++}`;
      values.push(filters.industry);
    }

    if (filters?.size) {
      sql += ` AND size = $${paramCount++}`;
      values.push(filters.size);
    }

    if (filters?.isActive !== undefined) {
      sql += ` AND is_active = $${paramCount++}`;
      values.push(filters.isActive);
    }

    sql += ' ORDER BY created_at DESC';
    
    return query<Organization>(sql, values);
  }

  static async update(id: string, input: UpdateOrganizationInput): Promise<Organization | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(input.name);
    }

    if (input.domain !== undefined) {
      fields.push(`domain = $${paramCount++}`);
      values.push(input.domain);
    }

    if (input.industry !== undefined) {
      fields.push(`industry = $${paramCount++}`);
      values.push(input.industry);
    }

    if (input.size !== undefined) {
      fields.push(`size = $${paramCount++}`);
      values.push(input.size);
    }

    if (input.contactEmail !== undefined) {
      fields.push(`contact_email = $${paramCount++}`);
      values.push(input.contactEmail);
    }

    if (input.contactPhone !== undefined) {
      fields.push(`contact_phone = $${paramCount++}`);
      values.push(input.contactPhone);
    }

    if (input.address !== undefined) {
      fields.push(`address = $${paramCount++}`);
      values.push(input.address);
    }

    if (input.settings !== undefined) {
      // Merge with existing settings
      const existing = await this.findById(id);
      if (existing) {
        const mergedSettings = {
          ...existing.settings,
          ...input.settings
        };
        fields.push(`settings = $${paramCount++}`);
        values.push(JSON.stringify(mergedSettings));
      }
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
      UPDATE organizations 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const [organization] = await query<Organization>(sql, values);
    return organization || null;
  }

  static async delete(id: string): Promise<boolean> {
    const sql = 'UPDATE organizations SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1';
    const result = await query(sql, [id]);
    return result.length > 0;
  }

  static async getUsageStats(id: string): Promise<{
    totalUsers: number;
    totalPrompts: number;
    totalAnalyses: number;
    storageUsedMB: number;
  }> {
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE organization_id = $1 AND is_active = true) as total_users,
        (SELECT COUNT(*) FROM prompts WHERE organization_id = $1) as total_prompts,
        (SELECT COUNT(*) FROM analyses WHERE organization_id = $1) as total_analyses,
        (SELECT COALESCE(SUM(file_size_bytes) / 1048576, 0) FROM attachments WHERE organization_id = $1) as storage_used_mb
    `;
    
    const [stats] = await query<any>(sql, [id]);
    return {
      totalUsers: parseInt(stats.total_users, 10),
      totalPrompts: parseInt(stats.total_prompts, 10),
      totalAnalyses: parseInt(stats.total_analyses, 10),
      storageUsedMB: parseFloat(stats.storage_used_mb)
    };
  }

  static async count(): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM organizations WHERE is_active = true';
    const [result] = await query<{ count: string }>(sql);
    return parseInt(result.count, 10);
  }
}