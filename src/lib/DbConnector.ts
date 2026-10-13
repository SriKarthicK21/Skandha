// ============================================================================
// SKANDA ENTERPRISE GRC: POSTGRESQL POOL & DATABASE CONNECTOR
// Path: src/lib/DbConnector.ts
//
// Enterprise-grade PostgreSQL connection pooling utility with:
// 1. Strict environment variable validation and sanitization (zero secrets leaked)
// 2. Production connection pooling with pg.Pool (keep-alive, lifecycle listeners)
// 3. Resilient lazy initialization (safe against container startup crashes)
// 4. ACID Transaction management helper with automatic rollback
// 5. Telemetry & real-time pool metrics (query latency, active/idle count)
// 6. Comprehensive health-check probing for Cloud SQL / RDS / Supabase / Neon
// ============================================================================

import pg, { Pool, PoolClient, QueryResult, PoolConfig } from 'pg';

// ----------------------------------------------------------------------------
// Types & Interfaces
// ----------------------------------------------------------------------------

export interface DbConfig {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean | { rejectUnauthorized?: boolean; ca?: string };
  max?: number;
  min?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  maxLifetimeMillis?: number;
  statementTimeoutMillis?: number;
  applicationName?: string;
}

export interface SanitizedDbConfig {
  mode: 'connection_string' | 'discrete_parameters' | 'unconfigured';
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl: boolean | string;
  max: number;
  min: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  maxLifetimeMillis: number;
  statementTimeoutMillis: number;
  applicationName: string;
}

export interface DbValidationResult {
  isValid: boolean;
  isConfigured: boolean;
  mode: 'connection_string' | 'discrete_parameters' | 'unconfigured';
  errors: string[];
  warnings: string[];
  sanitizedConfig: SanitizedDbConfig;
}

export interface DbPoolMetrics {
  totalConnections: number;
  idleConnections: number;
  waitingClients: number;
  activeConnections: number;
  totalQueries: number;
  failedQueries: number;
  slowQueries: number;
  averageLatencyMs: number;
  uptimeSeconds: number;
  lastConnectedAt: string | null;
}

export interface DbHealthReport {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unconfigured';
  database: string;
  host: string;
  latencyMs: number;
  serverTime?: string;
  pgVersion?: string;
  metrics: DbPoolMetrics;
  timestamp: string;
  details?: string;
}

export interface QueryExecutionOptions {
  timeoutMs?: number;
  suppressLogging?: boolean;
}

// ----------------------------------------------------------------------------
// Custom Error Class
// ----------------------------------------------------------------------------

export class DbConfigurationError extends Error {
  public readonly errors: string[];
  public readonly warnings: string[];

  constructor(message: string, errors: string[] = [], warnings: string[] = []) {
    super(message);
    this.name = 'DbConfigurationError';
    this.errors = errors;
    this.warnings = warnings;
  }
}

// ----------------------------------------------------------------------------
// DbConnector Implementation
// ----------------------------------------------------------------------------

export class DbConnector {
  private static instance: DbConnector | null = null;

  private pool: Pool | null = null;
  private validationResult: DbValidationResult | null = null;
  private initializationPromise: Promise<Pool> | null = null;

  // Internal performance & telemetry metrics
  private totalQueriesExecuted = 0;
  private failedQueriesCount = 0;
  private slowQueriesCount = 0;
  private totalLatencyCumulativeMs = 0;
  private poolStartedAt: number | null = null;
  private lastConnectedAt: string | null = null;

  // Default production thresholds
  private readonly SLOW_QUERY_THRESHOLD_MS = 1000;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Access the singleton DbConnector instance
   */
  public static getInstance(): DbConnector {
    if (!DbConnector.instance) {
      DbConnector.instance = new DbConnector();
    }
    return DbConnector.instance;
  }

  // --------------------------------------------------------------------------
  // Environment Variable Validation & Configuration Parsing
  // --------------------------------------------------------------------------

  /**
   * Validates database environment variables with strict checks for production readiness.
   * Credentials and passwords are masked in the sanitized output.
   */
  public validateConfig(env: NodeJS.ProcessEnv = process.env): DbValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const rawConnStr = env.DATABASE_URL || env.POSTGRES_URL;
    const rawHost = env.PGHOST || env.DB_HOST;
    const rawPort = env.PGPORT || env.DB_PORT;
    const rawDatabase = env.PGDATABASE || env.DB_NAME;
    const rawUser = env.PGUSER || env.DB_USER;
    const rawPassword = env.PGPASSWORD || env.DB_PASSWORD;
    const rawSslMode = env.PGSSLMODE || env.DB_SSL || env.PGSSL;

    // Pooling environment variables
    const rawMax = env.PG_MAX_POOL_SIZE || env.DB_POOL_MAX;
    const rawMin = env.PG_MIN_POOL_SIZE || env.DB_POOL_MIN;
    const rawIdleTimeout = env.PG_IDLE_TIMEOUT_MS || env.DB_POOL_IDLE_TIMEOUT_MS;
    const rawConnTimeout = env.PG_CONNECTION_TIMEOUT_MS || env.DB_POOL_CONNECTION_TIMEOUT_MS;
    const rawMaxLifetime = env.PG_MAX_LIFETIME_MS || env.DB_POOL_MAX_LIFETIME_MS;
    const rawStatementTimeout = env.PG_STATEMENT_TIMEOUT_MS || env.DB_STATEMENT_TIMEOUT_MS;

    const isProduction = env.NODE_ENV === 'production';

    // Parse numeric pooling configs with resilient defaults
    const maxPoolSize = rawMax ? parseInt(rawMax, 10) : 20;
    const minPoolSize = rawMin ? parseInt(rawMin, 10) : 2;
    const idleTimeoutMillis = rawIdleTimeout ? parseInt(rawIdleTimeout, 10) : 30000;
    const connectionTimeoutMillis = rawConnTimeout ? parseInt(rawConnTimeout, 10) : 10000;
    const maxLifetimeMillis = rawMaxLifetime ? parseInt(rawMaxLifetime, 10) : 1800000; // 30 minutes
    const statementTimeoutMillis = rawStatementTimeout ? parseInt(rawStatementTimeout, 10) : 30000; // 30 seconds

    // Validate pool configuration numbers
    if (isNaN(maxPoolSize) || maxPoolSize < 1) {
      errors.push('PG_MAX_POOL_SIZE must be a positive integer (minimum 1)');
    } else if (maxPoolSize > 100) {
      warnings.push(`PG_MAX_POOL_SIZE is configured high (${maxPoolSize}). Ensure PostgreSQL max_connections can accommodate this.`);
    }

    if (isNaN(minPoolSize) || minPoolSize < 0) {
      errors.push('PG_MIN_POOL_SIZE must be a non-negative integer (minimum 0)');
    } else if (minPoolSize > maxPoolSize) {
      errors.push(`PG_MIN_POOL_SIZE (${minPoolSize}) cannot be greater than PG_MAX_POOL_SIZE (${maxPoolSize})`);
    }

    if (isNaN(idleTimeoutMillis) || idleTimeoutMillis < 1000) {
      errors.push('PG_IDLE_TIMEOUT_MS must be at least 1000ms');
    }

    if (isNaN(connectionTimeoutMillis) || connectionTimeoutMillis < 500) {
      errors.push('PG_CONNECTION_TIMEOUT_MS must be at least 500ms');
    }

    // Determine configuration mode
    let mode: 'connection_string' | 'discrete_parameters' | 'unconfigured' = 'unconfigured';
    let sanitizedConnStr: string | undefined = undefined;

    if (rawConnStr && rawConnStr.trim() !== '') {
      mode = 'connection_string';

      try {
        const parsed = new URL(rawConnStr);
        if (parsed.protocol !== 'postgres:' && parsed.protocol !== 'postgresql:') {
          errors.push(`Invalid DATABASE_URL protocol: "${parsed.protocol}". Expected "postgresql:" or "postgres:"`);
        }
        if (!parsed.hostname) {
          errors.push('DATABASE_URL is missing hostname');
        }
        if (!parsed.pathname || parsed.pathname === '/') {
          warnings.push('DATABASE_URL does not explicitly specify a database name path');
        }

        // Create sanitized connection string with masked password
        if (parsed.password) {
          parsed.password = '******';
        }
        sanitizedConnStr = parsed.toString();
      } catch (err) {
        errors.push(`DATABASE_URL is not a valid URI format: ${(err as Error).message}`);
      }
    } else if (rawHost && rawHost.trim() !== '') {
      mode = 'discrete_parameters';

      // Validate discrete port
      if (rawPort) {
        const portNum = parseInt(rawPort, 10);
        if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
          errors.push(`Invalid database port: "${rawPort}". Port must be an integer between 1 and 65535.`);
        }
      }

      if (!rawDatabase || rawDatabase.trim() === '') {
        errors.push('PGDATABASE (or DB_NAME) is required when using discrete parameters');
      }

      if (!rawUser || rawUser.trim() === '') {
        warnings.push('PGUSER is not set; PostgreSQL client will default to current OS process user');
      }

      if (!rawPassword && isProduction) {
        warnings.push('PGPASSWORD is not set in production environment');
      }
    } else {
      mode = 'unconfigured';
      // If neither is set, this is an unconfigured state (e.g. running in offline/transient mode)
      warnings.push('No PostgreSQL database credentials found in environment (neither DATABASE_URL nor PGHOST are set).');
    }

    // SSL Mode Validation
    let sslEnabled: boolean | string = false;
    if (rawSslMode) {
      const modeStr = String(rawSslMode).toLowerCase();
      if (modeStr === 'require' || modeStr === 'verify-ca' || modeStr === 'verify-full' || modeStr === 'true') {
        sslEnabled = true;
      } else if (modeStr === 'prefer') {
        sslEnabled = isProduction;
      } else if (modeStr === 'disable' || modeStr === 'false') {
        sslEnabled = false;
        if (isProduction) {
          warnings.push('SSL mode is explicitly disabled in a production environment. This is not recommended for compliance.');
        }
      }
    } else if (isProduction && mode !== 'unconfigured') {
      // In production, default to requiring SSL unless disabled
      sslEnabled = true;
      warnings.push('PGSSLMODE not explicitly configured in production; defaulting to SSL enabled with rejectUnauthorized=false for Cloud SQL / RDS.');
    }

    const portNumber = rawPort ? parseInt(rawPort, 10) : 5432;

    const sanitizedConfig: SanitizedDbConfig = {
      mode,
      connectionString: sanitizedConnStr,
      host: rawHost || (mode === 'connection_string' ? 'derived_from_url' : undefined),
      port: !isNaN(portNumber) ? portNumber : 5432,
      database: rawDatabase || (mode === 'connection_string' ? 'derived_from_url' : undefined),
      user: rawUser || (mode === 'connection_string' ? 'derived_from_url' : undefined),
      password: rawPassword ? '******' : undefined,
      ssl: sslEnabled,
      max: maxPoolSize,
      min: minPoolSize,
      idleTimeoutMillis,
      connectionTimeoutMillis,
      maxLifetimeMillis,
      statementTimeoutMillis,
      applicationName: 'SKANDA_ENTERPRISE_GRC'
    };

    const isConfigured = mode !== 'unconfigured';
    const isValid = errors.length === 0;

    const result: DbValidationResult = {
      isValid,
      isConfigured,
      mode,
      errors,
      warnings,
      sanitizedConfig
    };

    this.validationResult = result;
    return result;
  }

  // --------------------------------------------------------------------------
  // Pool Lifecycle & Connection Management
  // --------------------------------------------------------------------------

  /**
   * Lazily initializes and returns the PostgreSQL Pool.
   * Throws DbConfigurationError if configuration is invalid or unconfigured.
   */
  public async getPool(): Promise<Pool> {
    if (this.pool) {
      return this.pool;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.initPoolInternal();
    try {
      this.pool = await this.initializationPromise;
      return this.pool;
    } finally {
      this.initializationPromise = null;
    }
  }

  /**
   * Synchronously returns the pool instance if already initialized, or null.
   */
  public getPoolSync(): Pool | null {
    return this.pool;
  }

  /**
   * Internal pool initialization with event binding and keep-alive
   */
  private async initPoolInternal(): Promise<Pool> {
    const validation = this.validateConfig();

    if (!validation.isValid) {
      throw new DbConfigurationError(
        `PostgreSQL configuration validation failed: ${validation.errors.join('; ')}`,
        validation.errors,
        validation.warnings
      );
    }

    if (!validation.isConfigured) {
      throw new DbConfigurationError(
        'PostgreSQL database is unconfigured. Set DATABASE_URL or PGHOST/PGDATABASE in environment.',
        ['Unconfigured PostgreSQL environment variables'],
        validation.warnings
      );
    }

    const { sanitizedConfig } = validation;
    const poolConfig: PoolConfig = {
      max: sanitizedConfig.max,
      min: sanitizedConfig.min,
      idleTimeoutMillis: sanitizedConfig.idleTimeoutMillis,
      connectionTimeoutMillis: sanitizedConfig.connectionTimeoutMillis,
      maxLifetimeSeconds: Math.floor(sanitizedConfig.maxLifetimeMillis / 1000),
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
      application_name: sanitizedConfig.applicationName
    };

    // Configure credentials
    if (validation.mode === 'connection_string') {
      poolConfig.connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    } else {
      poolConfig.host = process.env.PGHOST || process.env.DB_HOST;
      poolConfig.port = sanitizedConfig.port;
      poolConfig.database = process.env.PGDATABASE || process.env.DB_NAME;
      poolConfig.user = process.env.PGUSER || process.env.DB_USER;
      poolConfig.password = process.env.PGPASSWORD || process.env.DB_PASSWORD;
    }

    // Configure SSL
    if (sanitizedConfig.ssl) {
      poolConfig.ssl = {
        rejectUnauthorized: false // Supports Cloud SQL / Supabase / Neon self-signed certificates
      };
    }

    const newPool = new Pool(poolConfig);

    // Bind event listeners for connection monitoring and resilience
    newPool.on('connect', (client: PoolClient) => {
      this.lastConnectedAt = new Date().toISOString();
      if (!this.poolStartedAt) {
        this.poolStartedAt = Date.now();
      }

      // Configure connection session defaults (statement timeout & UTC timezone)
      const stmtTimeout = sanitizedConfig.statementTimeoutMillis;
      client.query(`SET statement_timeout = ${stmtTimeout}; SET timezone = 'UTC';`).catch((err) => {
        console.warn('[DbConnector] Warning setting session defaults on new connection:', err?.message);
      });
    });

    newPool.on('error', (err: Error, _client: PoolClient) => {
      // Background idle client error — does NOT terminate node process
      this.failedQueriesCount++;
      console.error('[DbConnector] Unexpected background error on idle PostgreSQL client:', err?.message);
    });

    newPool.on('remove', () => {
      // Normal connection recycling according to maxLifetime or idleTimeout
    });

    // Test a client acquire to fail fast if connection cannot be established
    let client: PoolClient | null = null;
    try {
      client = await newPool.connect();
    } catch (connectErr: any) {
      // Clean up pool instance if initial connection fails
      await newPool.end().catch(() => {});
      throw new Error(`Failed to establish initial connection to PostgreSQL pool: ${connectErr?.message || connectErr}`);
    } finally {
      if (client) {
        client.release();
      }
    }

    return newPool;
  }

  // --------------------------------------------------------------------------
  // Query & Transaction Helpers
  // --------------------------------------------------------------------------

  /**
   * Executes a parameterized query using a pooled client.
   * Tracks telemetry, execution latency, and slow query warnings.
   */
  public async query<T = any>(
    text: string,
    params?: any[],
    options?: QueryExecutionOptions
  ): Promise<QueryResult<T>> {
    const pool = await this.getPool();
    const startTime = Date.now();

    try {
      this.totalQueriesExecuted++;
      const result = await pool.query<T>(text, params);
      const latencyMs = Date.now() - startTime;
      this.totalLatencyCumulativeMs += latencyMs;

      if (latencyMs > this.SLOW_QUERY_THRESHOLD_MS && !options?.suppressLogging) {
        this.slowQueriesCount++;
        console.warn(
          `[DbConnector] Slow query detected (${latencyMs}ms): "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`
        );
      }

      return result;
    } catch (err: any) {
      this.failedQueriesCount++;
      const latencyMs = Date.now() - startTime;
      console.error(`[DbConnector] Query failed after ${latencyMs}ms:`, {
        query: text.substring(0, 120),
        error: err?.message
      });
      throw err;
    }
  }

  /**
   * Acquires a client from the pool for manual multi-step operations.
   * MUST be released with client.release() when finished.
   */
  public async getClient(): Promise<PoolClient> {
    const pool = await this.getPool();
    return await pool.connect();
  }

  /**
   * Executes a callback within a managed ACID transaction.
   * Automatically executes BEGIN, COMMIT, and ROLLBACK upon error, ensuring client release.
   */
  public async withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    const startTime = Date.now();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error: any) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackErr: any) {
        console.error('[DbConnector] Transaction ROLLBACK failed:', rollbackErr?.message);
      }
      console.error(`[DbConnector] Transaction failed and rolled back after ${Date.now() - startTime}ms:`, error?.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // --------------------------------------------------------------------------
  // Telemetry & Health Checks
  // --------------------------------------------------------------------------

  /**
   * Returns current pool connection metrics
   */
  public getPoolMetrics(): DbPoolMetrics {
    const totalConns = this.pool?.totalCount || 0;
    const idleConns = this.pool?.idleCount || 0;
    const waitingClients = this.pool?.waitingCount || 0;
    const activeConns = Math.max(0, totalConns - idleConns);

    const uptimeSeconds = this.poolStartedAt ? Math.floor((Date.now() - this.poolStartedAt) / 1000) : 0;
    const avgLatencyMs =
      this.totalQueriesExecuted > 0
        ? Number((this.totalLatencyCumulativeMs / this.totalQueriesExecuted).toFixed(2))
        : 0;

    return {
      totalConnections: totalConns,
      idleConnections: idleConns,
      waitingClients,
      activeConnections: activeConns,
      totalQueries: this.totalQueriesExecuted,
      failedQueries: this.failedQueriesCount,
      slowQueries: this.slowQueriesCount,
      averageLatencyMs: avgLatencyMs,
      uptimeSeconds,
      lastConnectedAt: this.lastConnectedAt
    };
  }

  /**
   * Performs an end-to-end database health check probing ping, version, and latency
   */
  public async healthCheck(): Promise<DbHealthReport> {
    const validation = this.validateConfig();
    const metrics = this.getPoolMetrics();

    if (!validation.isConfigured) {
      return {
        status: 'unconfigured',
        database: 'none',
        host: 'unconfigured',
        latencyMs: 0,
        metrics,
        timestamp: new Date().toISOString(),
        details: 'PostgreSQL database is unconfigured. Set DATABASE_URL or PGHOST to enable relational persistence.'
      };
    }

    if (!validation.isValid) {
      return {
        status: 'unhealthy',
        database: validation.sanitizedConfig.database || 'unknown',
        host: validation.sanitizedConfig.host || 'unknown',
        latencyMs: 0,
        metrics,
        timestamp: new Date().toISOString(),
        details: `Configuration error: ${validation.errors.join('; ')}`
      };
    }

    const startTime = Date.now();
    try {
      const res = await this.query<{
        alive: number;
        server_time: string;
        db_name: string;
        pg_version: string;
      }>('SELECT 1 AS alive, NOW() AS server_time, current_database() AS db_name, version() AS pg_version;', [], {
        suppressLogging: true
      });

      const latencyMs = Date.now() - startTime;
      const row = res.rows[0];

      return {
        status: latencyMs > 500 ? 'degraded' : 'healthy',
        database: row?.db_name || validation.sanitizedConfig.database || 'unknown',
        host: validation.sanitizedConfig.host || 'connected_via_url',
        latencyMs,
        serverTime: row?.server_time,
        pgVersion: row?.pg_version ? row.pg_version.split(' ')[0] + ' ' + row.pg_version.split(' ')[1] : undefined,
        metrics: this.getPoolMetrics(),
        timestamp: new Date().toISOString()
      };
    } catch (err: any) {
      return {
        status: 'unhealthy',
        database: validation.sanitizedConfig.database || 'unknown',
        host: validation.sanitizedConfig.host || 'unknown',
        latencyMs: Date.now() - startTime,
        metrics: this.getPoolMetrics(),
        timestamp: new Date().toISOString(),
        details: err?.message || 'Database ping query failed'
      };
    }
  }

  // --------------------------------------------------------------------------
  // Graceful Shutdown & Reset
  // --------------------------------------------------------------------------

  /**
   * Gracefully drains the connection pool and shuts down all active clients
   */
  public async close(): Promise<void> {
    if (this.pool) {
      try {
        await this.pool.end();
        console.log('[DbConnector] PostgreSQL connection pool drained and terminated cleanly.');
      } catch (err: any) {
        console.error('[DbConnector] Error closing PostgreSQL connection pool:', err?.message);
      } finally {
        this.pool = null;
        this.poolStartedAt = null;
      }
    }
  }

  /**
   * Resets pool and forces re-validation on next query (useful during tests or credential rotation)
   */
  public async reset(): Promise<void> {
    await this.close();
    this.validationResult = null;
  }
}

// ----------------------------------------------------------------------------
// Export Singleton & Functional Convenience Helpers
// ----------------------------------------------------------------------------

export const dbConnector = DbConnector.getInstance();

export const getDbPool = (): Promise<Pool> => dbConnector.getPool();

export const query = <T = any>(
  text: string,
  params?: any[],
  options?: QueryExecutionOptions
): Promise<QueryResult<T>> => dbConnector.query<T>(text, params, options);

export const withTransaction = <T>(callback: (client: PoolClient) => Promise<T>): Promise<T> =>
  dbConnector.withTransaction<T>(callback);

export const checkDbHealth = (): Promise<DbHealthReport> => dbConnector.healthCheck();

export const validateDbConfig = (env?: NodeJS.ProcessEnv): DbValidationResult =>
  dbConnector.validateConfig(env);

export default dbConnector;
