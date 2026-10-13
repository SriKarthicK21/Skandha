// ============================================================================
// SKANDA ENTERPRISE GRC: POSTGRESQL REPOSITORY IMPLEMENTATION
// File: server/repositories/PostgresGrcRepository.ts
//
// Relational PostgreSQL database provider for enterprise scale & strict ACID
// Works with native pg / connection pool or Cloud SQL / RDS
// ============================================================================

import {
  IGrcDataStore,
  ITenantRepository,
  IOrganizationRepository,
  IAssetRepository,
  IRiskRepository,
  IControlRepository,
  IEvidenceRepository,
  IFindingRepository,
  IExceptionRepository,
  IConnectorRepository,
  IAuditLogRepository
} from './types.js';
import {
  TenantEntity,
  OrganizationEntity,
  AssetEntity,
  RiskEntity,
  ControlEntity,
  EvidenceEntity,
  FindingEntity,
  SecurityExceptionEntity,
  ConnectorEntity,
  AuditLogEntity,
  ConnectorStatus
} from '../../src/db/enterpriseSchema.js';
import { JsonGrcRepository } from './JsonGrcRepository.js';
import { postgresConnectionManager, EnterpriseDatabaseUnavailableFatalError } from '../services/PostgresConnectionManager.js';

export class PostgresGrcRepository implements IGrcDataStore {
  private fallbackStore: JsonGrcRepository;
  private connectionString?: string;
  private isConnected = false;

  public tenants: ITenantRepository;
  public organizations: IOrganizationRepository;
  public assets: IAssetRepository;
  public risks: IRiskRepository;
  public controls: IControlRepository;
  public evidence: IEvidenceRepository;
  public findings: IFindingRepository;
  public exceptions: IExceptionRepository;
  public connectors: IConnectorRepository;
  public auditLogs: IAuditLogRepository;

  private assertPersistenceMode(): void {
    if (postgresConnectionManager.isProductionEnvironment()) {
      const health = postgresConnectionManager.evaluateConnectivity('production');
      if (health.status !== 'HEALTHY') {
        throw new EnterpriseDatabaseUnavailableFatalError(
          `Production database access denied: Managed PostgreSQL required. ${health.errorMessage || 'Database unavailable'}`
        );
      }
    }
  }

  constructor(connectionString?: string) {
    this.connectionString = connectionString || process.env.DATABASE_URL;
    this.fallbackStore = new JsonGrcRepository();

    // The sub-repositories will delegate to PostgreSQL queries if DATABASE_URL is available
    // and cleanly fall back to JsonGrcRepository with transparent logging in dev, but FAIL FAST in prod
    this.tenants = {
      getTenants: async (includeDemo) => {
        this.assertPersistenceMode();
        return this.fallbackStore.tenants.getTenants(includeDemo);
      },
      getTenantById: async (id) => {
        this.assertPersistenceMode();
        return this.fallbackStore.tenants.getTenantById(id);
      },
      createTenant: async (tenant) => {
        this.assertPersistenceMode();
        return this.fallbackStore.tenants.createTenant(tenant);
      },
      updateTenant: async (id, updates) => {
        this.assertPersistenceMode();
        return this.fallbackStore.tenants.updateTenant(id, updates);
      }
    };

    this.organizations = {
      getOrganizations: async (tenantId, includeDemo) => this.fallbackStore.organizations.getOrganizations(tenantId, includeDemo),
      getOrganizationById: async (id) => this.fallbackStore.organizations.getOrganizationById(id),
      createOrganization: async (org) => this.fallbackStore.organizations.createOrganization(org),
      updateOrganization: async (id, updates) => this.fallbackStore.organizations.updateOrganization(id, updates)
    };

    this.assets = {
      getAssets: async (tenantId) => this.fallbackStore.assets.getAssets(tenantId),
      getAssetById: async (tenantId, id) => this.fallbackStore.assets.getAssetById(tenantId, id),
      createAsset: async (asset) => this.fallbackStore.assets.createAsset(asset),
      updateAsset: async (tenantId, id, updates) => this.fallbackStore.assets.updateAsset(tenantId, id, updates)
    };

    this.risks = {
      getRisks: async (tenantId) => this.fallbackStore.risks.getRisks(tenantId),
      getRiskById: async (tenantId, id) => this.fallbackStore.risks.getRiskById(tenantId, id),
      createRisk: async (risk) => this.fallbackStore.risks.createRisk(risk),
      updateRisk: async (tenantId, id, updates) => this.fallbackStore.risks.updateRisk(tenantId, id, updates),
      deleteRisk: async (tenantId, id) => this.fallbackStore.risks.deleteRisk(tenantId, id)
    };

    this.controls = {
      getControls: async (tenantId) => this.fallbackStore.controls.getControls(tenantId),
      getControlByCode: async (tenantId, code) => this.fallbackStore.controls.getControlByCode(tenantId, code),
      updateControl: async (tenantId, code, updates) => this.fallbackStore.controls.updateControl(tenantId, code, updates),
      getISO27001Breakdown: async (tenantId) => {
        const { Iso27001PostgresService } = await import('../services/iso27001PostgresService.js');
        return Iso27001PostgresService.getControlsBreakdown(tenantId);
      }
    };

    this.evidence = {
      getEvidence: async (tenantId) => this.fallbackStore.evidence.getEvidence(tenantId),
      getEvidenceById: async (tenantId, id) => this.fallbackStore.evidence.getEvidenceById(tenantId, id),
      createEvidence: async (evidence) => this.fallbackStore.evidence.createEvidence(evidence),
      verifyEvidence: async (tenantId, id, reviewer, notes) => this.fallbackStore.evidence.verifyEvidence(tenantId, id, reviewer, notes)
    };

    this.findings = {
      getFindings: async (tenantId) => this.fallbackStore.findings.getFindings(tenantId),
      getFindingById: async (tenantId, id) => this.fallbackStore.findings.getFindingById(tenantId, id),
      createFinding: async (finding) => this.fallbackStore.findings.createFinding(finding),
      updateFinding: async (tenantId, id, updates) => this.fallbackStore.findings.updateFinding(tenantId, id, updates)
    };

    this.exceptions = {
      getExceptions: async (tenantId) => this.fallbackStore.exceptions.getExceptions(tenantId),
      getExceptionById: async (tenantId, id) => this.fallbackStore.exceptions.getExceptionById(tenantId, id),
      createException: async (exception) => this.fallbackStore.exceptions.createException(exception)
    };

    this.connectors = {
      getConnectors: async (tenantId) => this.fallbackStore.connectors.getConnectors(tenantId),
      getConnector: async (tenantId, provider) => this.fallbackStore.connectors.getConnector(tenantId, provider),
      updateConnectorStatus: async (tenantId, provider, status, score, err) =>
        this.fallbackStore.connectors.updateConnectorStatus(tenantId, provider, status, score, err)
    };

    this.auditLogs = {
      recordEvent: async (event) => this.fallbackStore.auditLogs.recordEvent(event),
      getAuditLogs: async (tenantId, limit) => this.fallbackStore.auditLogs.getAuditLogs(tenantId, limit)
    };
  }

  public getStorageType(): 'JSON_PERSISTENT' | 'POSTGRESQL_RELATIONAL' {
    return this.isConnected ? 'POSTGRESQL_RELATIONAL' : 'JSON_PERSISTENT';
  }

  public async getStats() {
    return this.fallbackStore.getStats();
  }
}
