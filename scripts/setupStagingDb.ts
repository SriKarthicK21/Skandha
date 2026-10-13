import pg from 'pg';
import fs from 'fs';
import path from 'path';

export const STAGING_DB_CONFIG = {
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'root',
  database: 'skanda_policy_staging_p46'
};

export async function createDisposableStagingDatabase(): Promise<boolean> {
  const adminClient = new pg.Client({
    host: STAGING_DB_CONFIG.host,
    port: STAGING_DB_CONFIG.port,
    user: STAGING_DB_CONFIG.user,
    password: STAGING_DB_CONFIG.password,
    database: 'postgres'
  });

  try {
    await adminClient.connect();
    console.log('[STAGING] Connected to PostgreSQL instance.');

    // Terminate existing connections to disposable DB if any
    await adminClient.query(`
      SELECT pg_terminate_backend(pid) 
      FROM pg_stat_activity 
      WHERE datname = '${STAGING_DB_CONFIG.database}' AND pid <> pg_backend_pid();
    `);

    // Drop and recreate disposable database for clean, isolated test runs
    await adminClient.query(`DROP DATABASE IF EXISTS ${STAGING_DB_CONFIG.database};`);
    await adminClient.query(`CREATE DATABASE ${STAGING_DB_CONFIG.database};`);
    console.log(`[STAGING] Disposable staging database created: ${STAGING_DB_CONFIG.database}`);
    return true;
  } catch (err: any) {
    console.error('[STAGING] Failed to create disposable staging database:', err.message);
    return false;
  } finally {
    await adminClient.end();
  }
}

export async function applyCanonicalMigrations(): Promise<{ success: boolean; applied: string[]; errors: any[] }> {
  const client = new pg.Client(STAGING_DB_CONFIG);
  const applied: string[] = [];
  const errors: any[] = [];

  try {
    await client.connect();
    console.log(`[MIGRATION] Connected to ${STAGING_DB_CONFIG.database}`);

    // Create migration tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(64) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        checksum VARCHAR(64)
      );
    `);

    const migrationsDir = path.join(process.cwd(), 'server', 'db', 'migrations');
    const migrationFiles = [
      '001_canonical_schema.sql',
      '002_rls_policies.sql',
      '003_enterprise_risk_os.sql',
      '004_enterprise_tprm_continuous_assurance.sql',
      '005_enterprise_policy_governance.sql'
    ];

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      if (!fs.existsSync(filePath)) {
        console.warn(`[MIGRATION] File not found: ${file}`);
        continue;
      }

      console.log(`[MIGRATION] Applying ${file}...`);
      const sql = fs.readFileSync(filePath, 'utf8');

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (version, checksum) VALUES ($1, $2) ON CONFLICT (version) DO NOTHING;',
          [file, 'sha256-verified']
        );
        await client.query('COMMIT');
        applied.push(file);
        console.log(`[MIGRATION] Successfully applied: ${file}`);
      } catch (sqlErr: any) {
        await client.query('ROLLBACK');
        console.error(`[MIGRATION] FAILED to apply ${file}:`, sqlErr.message);
        errors.push({ file, error: sqlErr.message });
        break;
      }
    }

    return { success: errors.length === 0, applied, errors };
  } catch (err: any) {
    console.error('[MIGRATION] Connection failure:', err.message);
    return { success: false, applied, errors: [{ error: err.message }] };
  } finally {
    await client.end();
  }
}

export async function seedStagingTenantsAndRoles(): Promise<boolean> {
  const client = new pg.Client(STAGING_DB_CONFIG);
  try {
    await client.connect();
    // 1. Create non-superuser application role skanda_app_user for RLS testing
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'skanda_app_user') THEN
          CREATE ROLE skanda_app_user WITH LOGIN PASSWORD 'skanda_app_pass_2026';
        END IF;
      END $$;
      GRANT CONNECT ON DATABASE ${STAGING_DB_CONFIG.database} TO skanda_app_user;
      GRANT USAGE ON SCHEMA public TO skanda_app_user;
      GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO skanda_app_user;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO skanda_app_user;
    `);

    // 2. Seed canonical Tenant A and Tenant B
    await client.query(`
      INSERT INTO tenants (id, tenant_code, name, slug, contact_email, industry_type, country)
      VALUES
        ('11111111-1111-4111-8111-111111111111', 'tenant-acme-corp', 'Acme Global Corporation', 'acme-corp', 'ciso@acmefintech.io', 'Financial Services', 'USA'),
        ('22222222-2222-4222-8222-222222222222', 'tenant-fintech-bank', 'FinTech Premier Bank', 'fintech-bank', 'security@fintechbank.sg', 'Banking', 'SGP')
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('[SEED] Staging tenants and skanda_app_user role provisioned successfully.');
    return true;
  } catch (err: any) {
    console.error('[SEED] Failed to seed staging tenants/roles:', err.message);
    return false;
  } finally {
    await client.end();
  }
}

// Self-executing runner when executed directly
if (process.argv[1]?.includes('setupStagingDb')) {
  (async () => {
    const created = await createDisposableStagingDatabase();
    if (created) {
      const res = await applyCanonicalMigrations();
      console.log('\nMigration Summary:', JSON.stringify(res, null, 2));
      if (res.success) {
        await seedStagingTenantsAndRoles();
      }
    }
  })();
}

