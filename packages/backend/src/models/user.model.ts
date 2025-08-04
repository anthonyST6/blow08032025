import { query, transaction } from '../config/database';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'analyst' | 'viewer';
  organizationId?: string;
  firebaseUid: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  displayName: string;
  role: 'admin' | 'analyst' | 'viewer';
  organizationId?: string;
  firebaseUid: string;
}

export interface UpdateUserInput {
  displayName?: string;
  role?: 'admin' | 'analyst' | 'viewer';
  organizationId?: string;
  isActive?: boolean;
}

export class UserModel {
  static async create(input: CreateUserInput): Promise<User> {
    const sql = `
      INSERT INTO users (email, display_name, role, organization_id, firebase_uid, is_active)
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING *
    `;
    
    const values = [
      input.email,
      input.displayName,
      input.role,
      input.organizationId,
      input.firebaseUid
    ];
    
    const [user] = await query<User>(sql, values);
    return user;
  }

  static async findById(id: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE id = $1';
    const [user] = await query<User>(sql, [id]);
    return user || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE email = $1';
    const [user] = await query<User>(sql, [email]);
    return user || null;
  }

  static async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE firebase_uid = $1';
    const [user] = await query<User>(sql, [firebaseUid]);
    return user || null;
  }

  static async findByOrganization(organizationId: string): Promise<User[]> {
    const sql = 'SELECT * FROM users WHERE organization_id = $1 AND is_active = true ORDER BY created_at DESC';
    return query<User>(sql, [organizationId]);
  }

  static async update(id: string, input: UpdateUserInput): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.displayName !== undefined) {
      fields.push(`display_name = $${paramCount++}`);
      values.push(input.displayName);
    }

    if (input.role !== undefined) {
      fields.push(`role = $${paramCount++}`);
      values.push(input.role);
    }

    if (input.organizationId !== undefined) {
      fields.push(`organization_id = $${paramCount++}`);
      values.push(input.organizationId);
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
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const [user] = await query<User>(sql, values);
    return user || null;
  }

  static async updateLastLogin(id: string): Promise<void> {
    const sql = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1';
    await query(sql, [id]);
  }

  static async delete(id: string): Promise<boolean> {
    const sql = 'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1';
    const result = await query(sql, [id]);
    return result.length > 0;
  }

  static async count(): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM users WHERE is_active = true';
    const [result] = await query<{ count: string }>(sql);
    return parseInt(result.count, 10);
  }

  static async countByRole(role: string): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM users WHERE role = $1 AND is_active = true';
    const [result] = await query<{ count: string }>(sql, [role]);
    return parseInt(result.count, 10);
  }
}