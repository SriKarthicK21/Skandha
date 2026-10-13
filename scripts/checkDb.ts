import pg from 'pg';

async function main() {
  const client = new pg.Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'root',
    database: 'skanda_staging'
  });

  try {
    await client.connect();
    const cols = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE column_name = 'tenant_id'
      LIMIT 20;
    `);
    console.log('SAMPLE_TENANT_ID_COLUMNS:', cols.rows);

    // Also check existing RLS policies in the database
    const rlsPolicies = await client.query(`
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
      FROM pg_policies
      LIMIT 10;
    `);
    console.log('SAMPLE_PG_POLICIES:', rlsPolicies.rows);
  } catch (err: any) {
    console.error('Error querying columns/policies:', err.message);
  } finally {
    await client.end();
  }
}

main();
