// ============================================================================
// SKANDA ENTERPRISE GRC: ORM & DOMAIN TYPES SPECIFICATION
// File: src/db/enterpriseSchema.ts
//
// Matches src/db/enterprise_schema.sql for PostgreSQL 14+ / Cloud SQL / RDS
// ============================================================================

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type ControlImplementationStatus = 'Not Started' | 'In Progress' | 'Implemented' | 'Monitored' | 'Audited';
export type ControlEffectiveness = 'Effective' | 'Operating — Minor Gap' | 'Ineffective' | 'Not Tested';
export type EvidenceStatus = 'Requested' | 'Collected' | 'Processing' | 'Pending Review' | 'Verified' | 'Rejected' | 'Expired' | 'Archived';
export type FindingSeverity = 'Major NC' | 'Minor NC' | 'OFI' | 'Observation';
export type FindingStatus = 'Open' | 'In Remediation' | 'Verification Pending' | 'Closed Verified';
export type RiskTreatment = 'Mitigate' | 'Accept' | 'Transfer' | 'Avoid';
export type RiskStatus = 'Identified' | 'Assessing' | 'Mitigating' | 'Accepted' | 'Closed';
export type ConnectorStatus = 'CONNECTED' | 'DEGRADED' | 'DISCONNECTED' | 'AWAITING_CONFIG';

export interface TenantEntity {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  industryType: string;
  country: string;
  onboardingPhase: number;
  selectedFrameworks: string[];
  subscriptionTier: string;
  isDemo: boolean;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationEntity {
  id: string;
  tenantId: string;
  legalName: string;
  displayName: string;
  registrationNumber?: string;
  country: string;
  industry: string;
  headquartersAddress: Record<string, unknown>;
  scopeStatement: string;
  ownerUserId?: string;
  status: 'ACTIVE' | 'ARCHIVED';
  configurationStatus: string;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserEntity {
  id: string;
  tenantId: string;
  email: string;
  fullName: string;
  role: string;
  department?: string;
  mfaEnabled: boolean;
  mfaMethod: string;
  status: 'ACTIVE' | 'SUSPENDED';
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentEntity {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  headUserId?: string;
  targetReadinessScore: number;
  currentReadinessScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessProcessEntity {
  id: string;
  tenantId: string;
  departmentId?: string;
  code: string;
  name: string;
  description?: string;
  ownerUserId?: string;
  criticality: 'Critical' | 'High' | 'Medium' | 'Low';
  rtoHours: number;
  rpoHours: number;
  isMasCriticalSystem: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetEntity {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  type: string;
  classification: 'Secret' | 'Confidential' | 'Internal' | 'Public';
  businessProcessId?: string;
  businessService?: string;
  ownerUserId?: string;
  custodian?: string;
  cloudProvider?: string;
  region?: string;
  criticality: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Decommissioned' | 'Maintenance';
  ipAddresses: string[];
  tags: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface DataAssetEntity {
  id: string;
  tenantId: string;
  name: string;
  dataType: string;
  classification: string;
  dataFormat: string;
  storageLocation: string;
  retentionYears: number;
  encryptionAtRest: boolean;
  encryptionInTransit: boolean;
  legalBasis: string;
  containsPii: boolean;
  containsFinancial: boolean;
  ownerUserId?: string;
  assetId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorEntity {
  id: string;
  tenantId: string;
  name: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  serviceProvided: string;
  criticality: 'Critical' | 'High' | 'Medium' | 'Low';
  riskScore: number;
  dueDiligenceStatus: 'Pending' | 'In Progress' | 'Verified' | 'Rejected';
  soc2Available: boolean;
  iso27001Certified: boolean;
  dpaSigned: boolean;
  contractEndDate?: string;
  lastAssessmentDate?: string;
  nextAssessmentDue?: string;
  contactEmail?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ControlEntity {
  id: string;
  tenantId: string;
  controlCode: string;
  title: string;
  description: string;
  category: 'Organizational' | 'People' | 'Physical' | 'Technological';
  controlType: 'Preventive' | 'Detective' | 'Corrective';
  securityProperties: string[];
  implementationStatus: ControlImplementationStatus;
  effectiveness: ControlEffectiveness;
  maturityLevel: number;
  ownerUserId?: string;
  responsibleDepartment: string;
  monitoringFrequency: string;
  evidenceCollectionSlaDays: number;
  isAutomated: boolean;
  isKeyControl: boolean;
  crossFrameworkMappings?: Array<{ frameworkCode: string; requirementCode: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface RiskEntity {
  id: string;
  tenantId: string;
  riskCode: string;
  title: string;
  category: string;
  linkedAssetId?: string;
  linkedProcessId?: string;
  department: string;
  threatDescription: string;
  vulnerabilityDescription: string;
  businessImpact?: string;
  likelihood: number;
  impact: number;
  inherentScore: number;
  mitigatingControlIds: string[];
  residualLikelihood: number;
  residualImpact: number;
  residualScore: number;
  appetiteThreshold: number;
  treatmentOption: RiskTreatment;
  treatmentOwner: string;
  targetRemediationDate: string;
  status: RiskStatus;
  reviewDate?: string;
  escalatedToSuperAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceEntity {
  id: string;
  tenantId: string;
  controlId?: string;
  controlCode: string;
  title: string;
  description?: string;
  fileName: string;
  fileSizeBytes: number;
  fileType: string;
  storageUri?: string;
  sha256Hash: string;
  classification: string;
  sourceConnector: string;
  version: string;
  status: EvidenceStatus;
  uploadedByUserId?: string;
  uploadedDate: string;
  expiryDate: string;
  retentionPeriodYears: number;
  reviewedByUserId?: string;
  reviewedAt?: string;
  verificationNotes?: string;
  isWormVerified: boolean;
  chainOfCustody: Array<{ timestamp: string; actor: string; action: string; note?: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface FindingEntity {
  id: string;
  tenantId: string;
  findingCode: string;
  title: string;
  severity: FindingSeverity;
  type: string;
  status: FindingStatus;
  assignedToUserId?: string;
  controlId?: string;
  controlCode: string;
  frameworkCode: string;
  description: string;
  rootCause?: string;
  remediationPlan?: string;
  slaDays: number;
  targetDate: string;
  closureDate?: string;
  verifiedByUserId?: string;
  evidenceIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SecurityExceptionEntity {
  id: string;
  tenantId: string;
  exceptionCode: string;
  title: string;
  controlCode: string;
  businessJustification: string;
  compensatingControls: string;
  residualRiskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  requestedByUserId?: string;
  approvedByUserId?: string;
  approvalStatus: 'Pending Approval' | 'Approved' | 'Rejected' | 'Expired' | 'Revoked';
  approvedAt?: string;
  expirationDate: string;
  reEvaluationFrequency: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectorEntity {
  id: string;
  tenantId: string;
  provider: 'AWS' | 'Azure' | 'EntraID' | 'GitHub' | 'Okta' | 'CrowdStrike' | 'Datadog' | 'Jira';
  name: string;
  category: string;
  connectionStatus: ConnectorStatus;
  authType: 'API_KEY' | 'OAUTH2' | 'IAM_ROLE' | 'WEBHOOK';
  endpointUrl?: string;
  lastSyncAt?: string;
  lastErrorMessage?: string;
  targetControls: string[];
  healthScore: number;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface TelemetryEventEntity {
  id: string;
  tenantId: string;
  connectorId?: string;
  source: string;
  eventType: string;
  severity: SeverityLevel;
  summary: string;
  payload: Record<string, unknown>;
  hmacStatus: 'VERIFIED' | 'UNSIGNED' | 'MISMATCH';
  ingestedAt: string;
  processedStatus: 'PROCESSED' | 'FAILED' | 'IGNORED';
  autoEvidenceId?: string;
  driftDetected: boolean;
}

export interface AuditLogEntity {
  id: string;
  tenantId: string;
  actor: string;
  actorUserId?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VERIFY' | 'SIGN_OFF' | 'EXPORT' | 'CONTEXT_SWITCH';
  entityType: 'TENANT' | 'CONTROL' | 'RISK' | 'EVIDENCE' | 'FINDING' | 'POLICY' | 'EXCEPTION' | 'ORGANIZATION';
  entityId?: string;
  details: string;
  ipAddress: string;
  userAgent?: string;
  prevIntegrityHash?: string;
  integrityHash: string;
  timestamp: string;
}
