// ============================================================================
// SKANDA ENTERPRISE GRC: REPOSITORY PATTERN INTERFACES
// File: server/repositories/types.ts
//
// Domain-driven abstraction layer separating business services from persistence
// Enables zero-downtime transition between local JSON and PostgreSQL / Cloud SQL
// ============================================================================

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

export interface ITenantRepository {
  getTenants(includeDemo?: boolean): Promise<TenantEntity[]>;
  getTenantById(id: string): Promise<TenantEntity | null>;
  createTenant(tenant: Partial<TenantEntity>): Promise<TenantEntity>;
  updateTenant(id: string, updates: Partial<TenantEntity>): Promise<TenantEntity>;
}

export interface IOrganizationRepository {
  getOrganizations(tenantId?: string, includeDemo?: boolean): Promise<OrganizationEntity[]>;
  getOrganizationById(id: string): Promise<OrganizationEntity | null>;
  createOrganization(org: Partial<OrganizationEntity>): Promise<OrganizationEntity>;
  updateOrganization(id: string, updates: Partial<OrganizationEntity>): Promise<OrganizationEntity>;
}

export interface IAssetRepository {
  getAssets(tenantId: string): Promise<AssetEntity[]>;
  getAssetById(tenantId: string, id: string): Promise<AssetEntity | null>;
  createAsset(asset: Partial<AssetEntity>): Promise<AssetEntity>;
  updateAsset(tenantId: string, id: string, updates: Partial<AssetEntity>): Promise<AssetEntity>;
}

export interface IRiskRepository {
  getRisks(tenantId: string): Promise<RiskEntity[]>;
  getRiskById(tenantId: string, id: string): Promise<RiskEntity | null>;
  createRisk(risk: Partial<RiskEntity>): Promise<RiskEntity>;
  updateRisk(tenantId: string, id: string, updates: Partial<RiskEntity>): Promise<RiskEntity>;
  deleteRisk(tenantId: string, id: string): Promise<boolean>;
}

export interface ISO27001ControlItemDetail extends ControlEntity {
  breakdownStatus: 'Verified' | 'Remediating' | 'Failed';
  breakdownReason: string;
  evidenceCount: number;
  verifiedEvidenceCount: number;
  evidenceItems: Array<{
    id: string;
    title: string;
    fileName: string;
    status: string;
    sha256Hash: string;
    uploadedDate: string;
  }>;
  openFindingCount: number;
  findingItems: Array<{
    id: string;
    findingCode: string;
    title: string;
    severity: string;
    status: string;
    targetRemediationDate: string;
    rootCause?: string;
    remediationPlan?: string;
  }>;
  hasActiveCapa: boolean;
  latestAuditNote?: string;
  isNewIn2022?: boolean;
  iso2013Mapping?: string;
  guidance?: string;
  auditorVerificationProcedure?: string;
  acceptanceCriteria?: string;
}

export interface ISO27001ControlsBreakdown {
  frameworkCode: string;
  frameworkName: string;
  totalControls: number;
  healthScore: number;
  status: string;
  storageEngine: 'POSTGRESQL_RELATIONAL' | 'POSTGRESQL_POOL' | 'JSON_PERSISTENT';
  tableName: string;
  queryLatencyMs: number;
  databaseHost: string;
  databaseSchema: string;
  executedSqlQuery: string;
  counts: {
    verified: number;
    remediating: number;
    failed: number;
    verifiedPercentage: number;
    remediatingPercentage: number;
    failedPercentage: number;
  };
  themeBreakdown: Record<'Organizational' | 'People' | 'Physical' | 'Technological', {
    total: number;
    verified: number;
    remediating: number;
    failed: number;
    complianceScore: number;
  }>;
  controls: ISO27001ControlItemDetail[];
}

export interface ControlLineageResponse {
  control: {
    code: string;
    title: string;
    category: string;
    controlType: string;
    implementationStatus: string;
    effectiveness: string;
    maturityLevel: number;
    breakdownStatus: 'Verified' | 'Remediating' | 'Failed';
    responsibleDepartment: string;
    evidenceCollectionSlaDays: number;
    iso2013Mapping?: string;
    isNewIn2022: boolean;
    description: string;
  };
  evidence: Array<{
    id: string;
    title: string;
    fileName: string;
    status: 'Verified' | 'Pending Review' | 'Rejected' | 'Expired';
    sha256Hash: string;
    collectionType: 'Automated' | 'Manual Upload' | 'API Webhook';
    collectedAt: string;
    validUntil: string;
    sourceSystem: string;
    fileSizeKb: number;
    auditStatus: string;
  }>;
  riskScore: {
    riskId: string;
    riskTitle: string;
    inherentScore: number;
    inherentLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    residualScore: number;
    residualLevel: 'Low' | 'Medium' | 'High';
    likelihood: number;
    impact: number;
    riskAppetiteThreshold: number;
    withinAppetite: boolean;
    mitigationEffectivenessPct: number;
    riskTreatment: 'Mitigate' | 'Accept' | 'Transfer' | 'Avoid';
    threatCategory: string;
    financialExposure: string;
  };
  sourceIntegration: {
    id: string;
    name: string;
    type: string;
    status: 'Connected' | 'Degraded' | 'Syncing' | 'Disconnected';
    lastSyncTimestamp: string;
    syncCadence: string;
    recordsIngested24h: number;
    telemetryEndpoint: string;
    healthScorePct: number;
    authMethod: string;
  };
  lineageGraph: {
    nodes: Array<{
      id: string;
      type: 'source' | 'control' | 'evidence' | 'risk';
      label: string;
      sublabel: string;
      status: string;
      statusColor: string;
      metadata: Record<string, any>;
    }>;
    edges: Array<{
      id: string;
      from: string;
      to: string;
      relation: string;
      status: 'active' | 'warning' | 'critical';
    }>;
  };
  auditTrail: Array<{
    timestamp: string;
    actor: string;
    action: string;
    details: string;
  }>;
  telemetry: {
    latencyMs: number;
    dataSource: string;
    fetchedAt: string;
    tenantId: string;
  };
}

export interface VerificationChecklistItem {
  id: string;
  criterion: string;
  status: 'Verified' | 'Remediating' | 'Failed';
  details: string;
  auditorMethod: string;
  lastChecked: string;
}

export interface SpecificControlDetailResponse {
  control: ISO27001ControlItemDetail;
  breakdownCounts: {
    framework: {
      total: number;
      verified: number;
      remediating: number;
      failed: number;
      verifiedPercentage: number;
      remediatingPercentage: number;
      failedPercentage: number;
    };
    category: {
      categoryName: string;
      total: number;
      verified: number;
      remediating: number;
      failed: number;
      complianceScore: number;
    };
    verificationChecklist: VerificationChecklistItem[];
    checklistCounts: {
      total: number;
      verified: number;
      remediating: number;
      failed: number;
    };
  };
  relatedControls: Array<{
    controlCode: string;
    title: string;
    category: string;
    breakdownStatus: 'Verified' | 'Remediating' | 'Failed';
    effectiveness: string;
  }>;
  databaseTelemetry: {
    storageEngine: string;
    databaseHost: string;
    databaseSchema: string;
    executedSqlQuery: string;
    queryLatencyMs: number;
    rowCount: number;
    timestamp: string;
  };
}

export interface IControlRepository {
  getControls(tenantId: string): Promise<ControlEntity[]>;
  getControlByCode(tenantId: string, controlCode: string): Promise<ControlEntity | null>;
  updateControl(tenantId: string, controlCode: string, updates: Partial<ControlEntity>): Promise<ControlEntity>;
  getISO27001Breakdown(tenantId: string): Promise<ISO27001ControlsBreakdown>;
}

export interface IEvidenceRepository {
  getEvidence(tenantId: string): Promise<EvidenceEntity[]>;
  getEvidenceById(tenantId: string, id: string): Promise<EvidenceEntity | null>;
  createEvidence(evidence: Partial<EvidenceEntity>): Promise<EvidenceEntity>;
  verifyEvidence(tenantId: string, id: string, reviewedBy: string, notes?: string): Promise<EvidenceEntity>;
}

export interface IFindingRepository {
  getFindings(tenantId: string): Promise<FindingEntity[]>;
  getFindingById(tenantId: string, id: string): Promise<FindingEntity | null>;
  createFinding(finding: Partial<FindingEntity>): Promise<FindingEntity>;
  updateFinding(tenantId: string, id: string, updates: Partial<FindingEntity>): Promise<FindingEntity>;
}

export interface IExceptionRepository {
  getExceptions(tenantId: string): Promise<SecurityExceptionEntity[]>;
  getExceptionById(tenantId: string, id: string): Promise<SecurityExceptionEntity | null>;
  createException(exception: Partial<SecurityExceptionEntity>): Promise<SecurityExceptionEntity>;
}

export interface IConnectorRepository {
  getConnectors(tenantId: string): Promise<ConnectorEntity[]>;
  getConnector(tenantId: string, provider: string): Promise<ConnectorEntity | null>;
  updateConnectorStatus(
    tenantId: string,
    provider: string,
    status: ConnectorStatus,
    healthScore: number,
    errorMessage?: string
  ): Promise<ConnectorEntity>;
}

export interface IAuditLogRepository {
  recordEvent(event: Omit<AuditLogEntity, 'id' | 'timestamp' | 'integrityHash'>): Promise<AuditLogEntity>;
  getAuditLogs(tenantId: string, limit?: number): Promise<AuditLogEntity[]>;
}

export interface IGrcDataStore {
  tenants: ITenantRepository;
  organizations: IOrganizationRepository;
  assets: IAssetRepository;
  risks: IRiskRepository;
  controls: IControlRepository;
  evidence: IEvidenceRepository;
  findings: IFindingRepository;
  exceptions: IExceptionRepository;
  connectors: IConnectorRepository;
  auditLogs: IAuditLogRepository;
  
  // Health & diagnostics
  getStorageType(): 'JSON_PERSISTENT' | 'POSTGRESQL_RELATIONAL';
  getStats(): Promise<{
    tenantCount: number;
    riskCount: number;
    evidenceCount: number;
    controlCount: number;
    findingCount: number;
    auditLogCount: number;
    lastSyncedAt: string;
    checksum: string;
  }>;
}
