// ============================================================================
// SKANDA ENTERPRISE GRC: CLOUD DEPLOYMENT & ENVIRONMENT CONFIGURATION
// Path: server/config/environmentConfig.ts
//
// Multi-cloud deployment configuration abstraction (AWS & Azure).
// Strict environment tier isolation (Development, Testing, Staging, Production).
// Enforces zero secrets in source code and validated environment schemas.
// ============================================================================

export type EnvironmentTier = 'DEVELOPMENT' | 'TESTING' | 'STAGING' | 'PRODUCTION';
export type CloudProvider = 'AWS' | 'AZURE' | 'HYBRID_MULTI_CLOUD';

export interface DatabasePoolConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  sslMode: 'require' | 'verify-full' | 'disable';
  maxConnections: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  enableReadReplicas: boolean;
  readReplicaHost?: string;
}

export interface StorageConfig {
  provider: 'AWS_S3' | 'AZURE_BLOB' | 'LOCAL_VAULT';
  bucketName: string;
  region: string;
  kmsKeyId?: string;
  enableWormImmutability: boolean;
  signedUrlExpirySeconds: number;
}

export interface BrokerConfig {
  type: 'RABBITMQ' | 'KAFKA' | 'AWS_EVENTBRIDGE_SQS' | 'AZURE_SERVICE_BUS';
  endpoint: string;
  deadLetterQueueName: string;
  maxRetryAttempts: number;
  visibilityTimeoutSeconds: number;
}

export interface ObservabilityConfig {
  serviceName: string;
  environment: EnvironmentTier;
  otelCollectorEndpoint: string;
  metricsPort: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableDetailedTracing: boolean;
}

export interface EnterpriseDeploymentConfig {
  tier: EnvironmentTier;
  cloudProvider: CloudProvider;
  database: DatabasePoolConfig;
  storage: StorageConfig;
  broker: BrokerConfig;
  observability: ObservabilityConfig;
  secretsProvider: 'AWS_SECRETS_MANAGER' | 'AZURE_KEY_VAULT' | 'HASHICORP_VAULT' | 'ENV_FALLBACK';
  security: {
    jwtIssuer: string;
    jwtAudience: string;
    jwtExpirySeconds: number;
    mfaRequiredForAdmin: boolean;
    sessionTimeoutSeconds: number;
    corsAllowedOrigins: string[];
    rateLimitPerMinute: number;
  };
}

export class CloudConfigurationManager {
  private static instance: CloudConfigurationManager;
  private currentConfig: EnterpriseDeploymentConfig;

  private constructor() {
    this.currentConfig = this.loadConfiguration();
  }

  public static getInstance(): CloudConfigurationManager {
    if (!CloudConfigurationManager.instance) {
      CloudConfigurationManager.instance = new CloudConfigurationManager();
    }
    return CloudConfigurationManager.instance;
  }

  private loadConfiguration(): EnterpriseDeploymentConfig {
    const rawTier = (process.env.SKANDA_ENV || process.env.NODE_ENV || 'DEVELOPMENT').toUpperCase();
    const tier: EnvironmentTier = (
      ['DEVELOPMENT', 'TESTING', 'STAGING', 'PRODUCTION'].includes(rawTier)
        ? rawTier
        : 'DEVELOPMENT'
    ) as EnvironmentTier;

    const rawCloud = (process.env.CLOUD_PROVIDER || 'AWS').toUpperCase();
    const cloudProvider: CloudProvider = (
      ['AWS', 'AZURE', 'HYBRID_MULTI_CLOUD'].includes(rawCloud) ? rawCloud : 'AWS'
    ) as CloudProvider;

    const isProd = tier === 'PRODUCTION';

    return {
      tier,
      cloudProvider,
      database: {
        host: process.env.DB_HOST || (isProd ? 'skanda-rds-postgres.internal.vpc' : 'localhost'),
        port: parseInt(process.env.DB_PORT || '5432', 10),
        database: process.env.DB_NAME || (isProd ? 'skanda_grc_prod' : 'skanda_grc_dev'),
        user: process.env.DB_USER || 'skanda_app_user',
        sslMode: isProd ? 'verify-full' : 'require',
        maxConnections: isProd ? 100 : 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        enableReadReplicas: isProd,
        readReplicaHost: process.env.DB_REPLICA_HOST || (isProd ? 'skanda-rds-ro.internal.vpc' : undefined)
      },
      storage: {
        provider: cloudProvider === 'AZURE' ? 'AZURE_BLOB' : 'AWS_S3',
        bucketName: process.env.EVIDENCE_BUCKET_NAME || `skanda-evidence-vault-${tier.toLowerCase()}`,
        region: process.env.CLOUD_REGION || (cloudProvider === 'AZURE' ? 'southeastasia' : 'ap-southeast-1'),
        kmsKeyId: process.env.KMS_KEY_ID || (isProd ? 'arn:aws:kms:ap-southeast-1:566728183327:key/skanda-evidence-cmk' : undefined),
        enableWormImmutability: isProd,
        signedUrlExpirySeconds: 1800 // 30 minutes
      },
      broker: {
        type: cloudProvider === 'AZURE' ? 'AZURE_SERVICE_BUS' : 'AWS_EVENTBRIDGE_SQS',
        endpoint: process.env.MESSAGE_BROKER_ENDPOINT || (isProd ? 'https://sqs.ap-southeast-1.amazonaws.com/566728183327/skanda-outbox-events' : 'amqp://localhost:5672'),
        deadLetterQueueName: `skanda-outbox-dlq-${tier.toLowerCase()}`,
        maxRetryAttempts: 5,
        visibilityTimeoutSeconds: 60
      },
      observability: {
        serviceName: 'skanda-enterprise-grc-core',
        environment: tier,
        otelCollectorEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318',
        metricsPort: 9090,
        logLevel: isProd ? 'info' : 'debug',
        enableDetailedTracing: true
      },
      secretsProvider: isProd ? (cloudProvider === 'AZURE' ? 'AZURE_KEY_VAULT' : 'AWS_SECRETS_MANAGER') : 'ENV_FALLBACK',
      security: {
        jwtIssuer: process.env.JWT_ISSUER || 'skanda-grc-auth',
        jwtAudience: process.env.JWT_AUDIENCE || 'skanda-grc-api',
        jwtExpirySeconds: 3600,
        mfaRequiredForAdmin: true,
        sessionTimeoutSeconds: 7200,
        corsAllowedOrigins: isProd
          ? ['https://grc.skanda.cloud', 'https://app.skanda.io']
          : ['http://localhost:3000', 'http://localhost:5173'],
        rateLimitPerMinute: isProd ? 1200 : 5000
      }
    };
  }

  public getConfig(): EnterpriseDeploymentConfig {
    return this.currentConfig;
  }

  public isProduction(): boolean {
    return this.currentConfig.tier === 'PRODUCTION';
  }
}

export const cloudConfigManager = CloudConfigurationManager.getInstance();
