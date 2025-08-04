import { promises as fs } from 'fs';
import * as path from 'path';
import { pool, query } from '../config/database';
import { logger } from '../utils/logger';

interface Migration {
  id: number;
  filename: string;
  applied_at: Date;
}

class MigrationRunner {
  private migrationsPath: string;

  constructor() {
    this.migrationsPath = path.join(__dirname);
  }

  async initialize(): Promise<void> {
    // Create migrations table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await query(createTableQuery);
    logger.info('Migrations table initialized');
  }

  async getAppliedMigrations(): Promise<Set<string>> {
    const result = await query<Migration>('SELECT filename FROM migrations ORDER BY id');
    return new Set(result.map(m => m.filename));
  }

  async getMigrationFiles(): Promise<string[]> {
    const files = await fs.readdir(this.migrationsPath);
    return files
      .filter((f: string) => f.endsWith('.sql'))
      .sort(); // Ensure migrations run in order
  }

  async runMigration(filename: string): Promise<void> {
    const filepath = path.join(this.migrationsPath, filename);
    const sql = await fs.readFile(filepath, 'utf-8');

    try {
      // Run migration in a transaction
      await pool.query('BEGIN');
      
      // Execute the migration SQL
      await pool.query(sql);
      
      // Record the migration
      await pool.query(
        'INSERT INTO migrations (filename) VALUES ($1)',
        [filename]
      );
      
      await pool.query('COMMIT');
      logger.info(`Migration applied: ${filename}`);
    } catch (error) {
      await pool.query('ROLLBACK');
      logger.error(`Migration failed: ${filename}`, error);
      throw error;
    }
  }

  async run(): Promise<void> {
    try {
      await this.initialize();
      
      const appliedMigrations = await this.getAppliedMigrations();
      const migrationFiles = await this.getMigrationFiles();
      
      const pendingMigrations = migrationFiles.filter(
        f => !appliedMigrations.has(f)
      );

      if (pendingMigrations.length === 0) {
        logger.info('No pending migrations');
        return;
      }

      logger.info(`Found ${pendingMigrations.length} pending migrations`);

      for (const migration of pendingMigrations) {
        await this.runMigration(migration);
      }

      logger.info('All migrations completed successfully');
    } catch (error) {
      logger.error('Migration runner failed', error);
      throw error;
    }
  }

  async rollback(steps = 1): Promise<void> {
    try {
      const appliedMigrations = await query<Migration>(
        'SELECT * FROM migrations ORDER BY id DESC LIMIT $1',
        [steps]
      );

      if (appliedMigrations.length === 0) {
        logger.info('No migrations to rollback');
        return;
      }

      logger.warn(`Rolling back ${appliedMigrations.length} migrations`);
      
      // Note: This is a simplified rollback that just removes the migration record
      // In a real system, you'd want to have down migrations
      for (const migration of appliedMigrations) {
        await query('DELETE FROM migrations WHERE id = $1', [migration.id]);
        logger.info(`Rolled back: ${migration.filename}`);
      }
    } catch (error) {
      logger.error('Rollback failed', error);
      throw error;
    }
  }

  async status(): Promise<void> {
    try {
      await this.initialize();
      
      const appliedMigrations = await this.getAppliedMigrations();
      const migrationFiles = await this.getMigrationFiles();
      
      logger.info('Migration Status:');
      logger.info(`Total migrations: ${migrationFiles.length}`);
      logger.info(`Applied migrations: ${appliedMigrations.size}`);
      
      const pendingMigrations = migrationFiles.filter(
        f => !appliedMigrations.has(f)
      );
      
      if (pendingMigrations.length > 0) {
        logger.info(`Pending migrations: ${pendingMigrations.length}`);
        pendingMigrations.forEach(m => logger.info(`  - ${m}`));
      } else {
        logger.info('All migrations are up to date');
      }
    } catch (error) {
      logger.error('Failed to get migration status', error);
      throw error;
    }
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const runner = new MigrationRunner();

  (async () => {
    try {
      switch (command) {
        case 'up':
        case 'migrate':
          await runner.run();
          break;
        
        case 'down':
        case 'rollback':
          const steps = parseInt(process.argv[3]) || 1;
          await runner.rollback(steps);
          break;
        
        case 'status':
          await runner.status();
          break;
        
        default:
          console.log('Usage: npm run migrate [up|down|status] [steps]');
          console.log('Commands:');
          console.log('  up/migrate - Run all pending migrations');
          console.log('  down/rollback [steps] - Rollback migrations (default: 1)');
          console.log('  status - Show migration status');
          process.exit(1);
      }
      
      process.exit(0);
    } catch (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    } finally {
      await pool.end();
    }
  })();
}

export default MigrationRunner;