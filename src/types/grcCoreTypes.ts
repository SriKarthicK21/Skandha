/**
 * SKANDA ENTERPRISE GRC OPERATING SYSTEM
 * Unified Core Domain Model Type Definitions
 * 
 * Interconnected Graph Entities:
 * Tenant -> Organization -> Domain -> BusinessUnit -> Process -> Asset -> Data -> Vendor
 * Framework -> Section -> Requirement -> SubRequirement -> ReferenceControl
 * UnifiedControl (Independent of frameworks, mapped to many)
 * Assessment (Generic lifecycle)
 * Risk (Inherent, Residual, 3x3/4x4/5x5 matrix, Treatments: Mitigate/Accept/Transfer/Avoid)
 * SmartEvidence (SHA-256 hash, reusability across controls/frameworks)
 * Finding & CAPA (Root cause analysis, remediation, closure verification)
 * Audit (Internal, External, Certification, MAS TRM, 2-pane Auditor workspace)
 * Policy & Exception (Lifecycle, acknowledgement, approvals)
 * Privacy (ROPA, PII, DPIA, DPDP, ISO 27701)
 * BIA (Criticality, RTO, RPO, dependency graph)
 * Vulnerability (CVE, CVSS, scanner ingest, CAPA link)
 * NextBestAction (Autonomous priority engine)
 */

// ============================================================================
// 1. ORGANIZATIONAL HIERARCHY & ENTITY SCOPE
// ============================================================================

export interface Tenant {
  id: string;
  name: string;
  code: string;
  domain: string;
  tier: 'ENTERPRISE' | 'GROWTH' | 'SOVEREIGN_CLOUD';
  createdAt: string;
  updatedAt: string;
  activeStatus: 'ACTIVE' | 'SUSPENDED' | 'PROVISIONING';
}

export interface GrcOrganization {
  id: string;
  tenantId: string;
  name: string;
  legalEntityName: string;
  registrationNumber: string;
  jurisdiction: string;
  headquarters: string;
  industry: string;
  cisoName: string;
  dpoName?: string;
  croName?: string;
  domains: GrcDomain[];
  createdAt: string;
}

export interface GrcDomain {
  id: string;
  tenantId: string;
  orgId: string;
  name: string;
  code: string; // e.g. "SG-FINTECH", "EU-PAYMENTS", "US-CLOUD"
  region: string;
  businessUnits: BusinessUnit[];
}

export interface BusinessUnit {
  id: string;
  domainId: string;
  name: string;
  head: string;
  processesCount: number;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface BusinessProcess {
  id: string;
  tenantId: string;
  businessUnitId: string;
  code: string;
  name: string;
  description: string;
  owner: string;
  criticality: 'TIER_1_MISSION_CRITICAL' | 'TIER_2_BUSINESS_CRITICAL' | 'TIER_3_OPERATIONAL' | 'TIER_4_SUPPORT';
  rtoMinutes: number; // Recovery Time Objective
  rpoMinutes: number; // Recovery Point Objective
  dependentAssetIds: string[];
  dependentVendorIds: string[];
  controlsAppliedIds: string[];
  biaAssessmentId?: string;
}

export interface GrcAsset {
  id: string;
  tenantId: string;
  assetTag: string;
  name: string;
  type: 'SERVER' | 'DATABASE' | 'CLOUD_SERVICE' | 'APPLICATION' | 'ENDPOINT' | 'NETWORK_DEVICE' | 'PHYSICAL_FACILITY';
  environment: 'PRODUCTION' | 'STAGING' | 'DEVELOPMENT' | 'DISASTER_RECOVERY';
  owner: string;
  classification: 'CONFIDENTIAL' | 'RESTRICTED' | 'INTERNAL' | 'PUBLIC';
  location: string;
  ipAddresses?: string[];
  cloudProvider?: 'AWS' | 'AZURE' | 'GCP' | 'ON_PREMISE' | 'HYBRID';
  appliedControlIds: string[];
  associatedRiskIds: string[];
  vulnerabilityCount?: { critical: number; high: number; medium: number; low: number };
}

export interface DataAsset {
  id: string;
  tenantId: string;
  name: string;
  category: 'PII' | 'FINANCIAL' | 'INTELLECTUAL_PROPERTY' | 'HEALTH_PHI' | 'AUTHENTICATION_SECRETS' | 'CUSTOMER_CONTENT';
  classification: 'RESTRICTED' | 'CONFIDENTIAL' | 'INTERNAL' | 'PUBLIC';
  dataSubjects: ('CUSTOMERS' | 'EMPLOYEES' | 'PARTNERS' | 'VENDORS' | 'PATIENTS')[];
  storageLocations: string[];
  retentionDays: number;
  legalBasis: 'CONSENT' | 'LEGITIMATE_USE' | 'CONTRACTUAL_NECESSITY' | 'LEGAL_OBLIGATION';
  dpdpRelevant: boolean;
  gdprRelevant: boolean;
  crossBorderTransfer: boolean;
  encryptionAtRest: boolean;
  encryptionInTransit: boolean;
}

// ============================================================================
// 2. THIRD-PARTY RISK MANAGEMENT (TPRM)
// ============================================================================

export interface GrcVendor {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  tier: 'TIER_1_STRATEGIC_CRITICAL' | 'TIER_2_MAJOR_OPERATIONAL' | 'TIER_3_TACTICAL' | 'TIER_4_COMMODITY';
  serviceProvided: string;
  dataAccessLevel: 'FULL_CUSTOMER_PII' | 'METADATA_ONLY' | 'NO_DATA_ACCESS' | 'SYSTEM_ADMIN_ACCESS';
  securityRating: number; // 0 - 100
  soc2ReportAvailable: boolean;
  iso27001Certified: boolean;
  lastAssessmentDate: string;
  nextAssessmentDue: string;
  primaryContact: { name: string; email: string };
  contractStatus: 'ACTIVE' | 'UNDER_RENEWAL' | 'TERMINATING' | 'ONBOARDING';
  riskScore: number;
  openFindingsCount: number;
  relatedControlIds: string[];
}

// ============================================================================
// 3. FRAMEWORK & REQUIREMENT HIERARCHY
// ============================================================================

export type StandardFrameworkCode =
  | 'ISO_27001_2022'
  | 'ISO_27701_2019'
  | 'ISO_42001_2023'
  | 'MAS_TRM_2021'
  | 'DPDP_ACT_2023'
  | 'SOC_2_TYPE_2'
  | 'NIST_CSF_2_0'
  | 'PCI_DSS_V4_0'
  | 'CIS_CONTROLS_V8'
  | 'COBIT_2019'
  | 'ISO_22301_2019'
  | 'ISO_31000_2018';

export interface GrcFramework {
  id: string;
  code: StandardFrameworkCode | string;
  name: string;
  version: string;
  authority: string;
  category: 'CYBERSECURITY' | 'PRIVACY' | 'AI_GOVERNANCE' | 'REGULATORY_FINTECH' | 'RESILIENCE' | 'RISK_MGMT';
  description: string;
  totalRequirementsCount: number;
  sections: FrameworkSection[];
  activeVersion: boolean;
  metadata?: Record<string, any>;
}

export interface FrameworkSection {
  id: string;
  code: string; // e.g. "Clause 5", "A.8", "Sec 8.0"
  title: string;
  description?: string;
  requirements: FrameworkRequirement[];
}

export interface FrameworkRequirement {
  id: string;
  frameworkId: string;
  frameworkCode: string;
  code: string; // e.g. "A.8.12", "MAS-TRM-8.1", "DPDP-SEC-8"
  title: string;
  statement: string;
  auditGuidance: string;
  evidenceRequirements: string[];
  mandatory: boolean;
  mappedControlIds: string[]; // Many-to-many to UnifiedControl.id
}

// ============================================================================
// 4. SKANDA UNIFIED CONTROL LIBRARY
// ============================================================================

export interface UnifiedControl {
  id: string;
  code: string; // e.g. "CTRL-001", "CTRL-088"
  title: string;
  description: string;
  category: 'ACCESS_CONTROL' | 'CRYPTOGRAPHY' | 'INFRASTRUCTURE' | 'INCIDENT_RESPONSE' | 'GOVERNANCE' | 'PRIVACY' | 'AI_SAFETY' | 'THIRD_PARTY' | 'BUSINESS_CONTINUITY';
  type: 'PREVENTIVE' | 'DETECTIVE' | 'CORRECTIVE' | 'DIRECTIVE';
  nature: 'AUTOMATED' | 'MANUAL' | 'HYBRID';
  implementationStatus: 'IMPLEMENTED' | 'IN_PROGRESS' | 'PARTIALLY_IMPLEMENTED' | 'PLANNED' | 'NOT_APPLICABLE';
  operatingEffectiveness: 'EFFECTIVE' | 'DEFICIENT' | 'NOT_TESTED' | 'EXEMPTED';
  owner: string;
  frequency: 'CONTINUOUS' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  
  // Framework Mappings (One Control -> Many Framework Requirements)
  frameworkMappings: Array<{
    frameworkCode: StandardFrameworkCode | string;
    requirementCode: string;
    relationshipType: 'DIRECT_SATISFACTION' | 'PARTIAL_CONTRIBUTION' | 'COMPENSATING';
  }>;

  // Interconnected Entity References
  linkedEvidenceIds: string[];
  linkedRiskIds: string[];
  linkedAssetIds: string[];
  linkedPolicyIds: string[];
  lastTestedAt?: string;
  nextTestDueDate?: string;
  telemetrySource?: string;
}

// ============================================================================
// 5. GENERIC COMPLIANCE ASSESSMENT ENGINE
// ============================================================================

export type AssessmentLifecycleState = 'DRAFT' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';

export interface GrcAssessment {
  id: string;
  tenantId: string;
  frameworkCode: string;
  frameworkName: string;
  name: string;
  scopePerimeter: string; // e.g. "Singapore Cloud FinTech Workloads"
  leadAssessor: string;
  state: AssessmentLifecycleState;
  overallScore: number; // 0 - 100%
  completedRequirementsCount: number;
  totalRequirementsCount: number;
  requirementsEvaluated: Array<{
    requirementCode: string;
    status: 'COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT' | 'NOT_APPLICABLE';
    complianceScore: number;
    assessorNotes: string;
    evaluatedControlIds: string[];
    supportingEvidenceIds: string[];
    findingIds: string[];
  }>;
  statementOfApplicabilityPublished: boolean;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 6. CONFIGURABLE RISK MANAGEMENT ENGINE & MATRICES
// ============================================================================

export type RiskTreatmentStrategy = 'MITIGATION' | 'ACCEPTANCE' | 'TRANSFER' | 'AVOIDANCE';
export type RiskMatrixDimension = '3x3' | '4x4' | '5x5';

export interface RiskMatrixConfig {
  id: string;
  dimension: RiskMatrixDimension;
  version: string;
  likelihoodLevels: Array<{ value: number; label: string; description: string }>;
  impactLevels: Array<{ value: number; label: string; description: string }>;
  riskScoreThresholds: {
    critical: { min: number; max: number; label: 'CRITICAL'; color: string };
    high: { min: number; max: number; label: 'HIGH'; color: string };
    medium: { min: number; max: number; label: 'MEDIUM'; color: string };
    low: { min: number; max: number; label: 'LOW'; color: string };
  };
}

export interface GrcRisk {
  id: string;
  tenantId: string;
  riskCode: string; // e.g. "RSK-014"
  title: string;
  description: string;
  category: 'CYBERSECURITY' | 'COMPLIANCE' | 'OPERATIONAL' | 'THIRD_PARTY' | 'PRIVACY' | 'AI_ETHICS' | 'RESILIENCE';
  affectedAssetIds: string[];
  threatVector: string;
  vulnerabilityDescription: string;
  
  // Inherent Risk
  inherentLikelihood: number; // 1 - 5
  inherentImpact: number;     // 1 - 5
  inherentScore: number;      // Likelihood * Impact
  inherentLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

  // Mitigating Controls
  mitigatingControlIds: string[];

  // Residual Risk
  residualLikelihood: number; // 1 - 5
  residualImpact: number;     // 1 - 5
  residualScore: number;
  residualLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

  // Treatment & Ownership
  treatmentStrategy: RiskTreatmentStrategy;
  treatmentPlan: string;
  owner: string;
  dueDate: string;
  status: 'IDENTIFIED' | 'ASSESSED' | 'TREATMENT_IN_PROGRESS' | 'TOLERATED_ACCEPTED' | 'CLOSED';
  
  // Interconnections
  linkedFindingIds: string[];
  linkedCapaIds: string[];
  linkedAuditIds: string[];
  linkedExceptionId?: string;
  riskAcceptedBy?: string;
  riskAcceptanceExpiry?: string;
  updatedAt: string;
}

// ============================================================================
// 7. SMART EVIDENCE HUB & CRYPTOGRAPHY
// ============================================================================

export interface SmartEvidenceItem {
  id: string;
  tenantId: string;
  evidenceCode: string; // e.g. "EV-2026-99"
  name: string;
  fileName: string;
  fileSizeBytes: number;
  fileType: string;
  sourceType: 'AUTOMATED_TELEMETRY' | 'MANUAL_UPLOAD' | 'API_INTEGRATION' | 'AUDIT_EXTRACT' | 'SYSTEM_SCREENSHOT';
  owner: string;
  createdAt: string;
  validUntil: string;
  isExpired: boolean;
  
  // Cryptographic Integrity
  sha256Hash: string;
  verificationStatus: 'VERIFIED' | 'PENDING_REVIEW' | 'REJECTED' | 'FLAGGED_TAMPERED';
  verifiedBy?: string;
  verifiedAt?: string;

  // AI Classification & Metadata
  aiClassification?: {
    suggestedCategory: string;
    confidenceScore: number;
    extractedMetadata: Record<string, string>;
    ocrSnippet?: string;
    confirmedByHuman: boolean;
  };

  // Reusable Multi-Mapping
  mappedControlIds: string[];
  mappedRequirementCodes: string[];
  mappedFrameworkCodes: string[];
  mappedAuditIds: string[];
  mappedCapaIds: string[];
}

// ============================================================================
// 8. AUDIT ENGINE & AUDITOR CLEAN ROOM
// ============================================================================

export type AuditType = 'INTERNAL_ISMS' | 'EXTERNAL_CERTIFICATION' | 'REGULATORY_STATUTORY' | 'SUPPLIER_AUDIT' | 'SPECIAL_INVESTIGATION';

export interface GrcAudit {
  id: string;
  tenantId: string;
  auditCode: string; // e.g. "AUD-2026-Q1"
  title: string;
  auditType: AuditType;
  frameworkCode: string;
  scopeDescription: string;
  leadAuditor: string;
  auditFirm?: string; // e.g. "BSI", "TÜV Rheinland", "KPMG", "PwC"
  independenceDeclarationSigned: boolean;
  status: 'PLANNED' | 'FIELDWORK_ACTIVE' | 'DRAFT_REPORT' | 'FINAL_SIGN_OFF' | 'CLOSED';
  startDate: string;
  endDate: string;
  
  // Fieldwork Samples & Evaluations
  totalCheckpoints: number;
  testedCheckpoints: number;
  passedCheckpoints: number;
  findingsCount: { critical: number; major: number; minor: number; observation: number };
  
  conclusionsSummary?: string;
  auditorOpinion?: 'UNQUALIFIED_CLEAN' | 'QUALIFIED_ISSUES' | 'ADVERSE' | 'DISCLAIMER';
  signedOffAt?: string;
}

// ============================================================================
// 9. FINDINGS & CAPA / REMEDIATION CENTER
// ============================================================================

export type FindingSeverity = 'CRITICAL' | 'MAJOR_NON_CONFORMITY' | 'MINOR_NON_CONFORMITY' | 'OBSERVATION' | 'OPPORTUNITY_FOR_IMPROVEMENT';

export interface GrcFinding {
  id: string;
  tenantId: string;
  findingCode: string; // e.g. "FND-042"
  title: string;
  description: string;
  severity: FindingSeverity;
  sourceAuditId?: string;
  sourceAssessmentId?: string;
  relatedRequirementCode: string;
  relatedControlId: string;
  identifiedBy: string;
  identifiedDate: string;
  status: 'OPEN' | 'ROOT_CAUSE_ANALYSIS' | 'CAPA_IN_PROGRESS' | 'REMEDIATION_SUBMITTED' | 'VERIFIED_CLOSED';
  capaIds: string[];
}

export interface GrcCapaAction {
  id: string;
  tenantId: string;
  capaCode: string; // e.g. "CAPA-021"
  findingId: string;
  title: string;
  rootCauseAnalysis: string; // 5-Whys or Ishikawa Fishbone
  immediateCorrection: string;
  correctiveAction: string;
  preventiveAction: string;
  owner: string;
  dueDate: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'SUBMITTED_FOR_VERIFICATION' | 'EFFECTIVE_CLOSED' | 'REJECTED_REOPEN';
  closureEvidenceIds: string[];
  verifiedBy?: string;
  verifiedAt?: string;
  effectivenessReviewDate?: string;
}

// ============================================================================
// 10. POLICY & EXCEPTION GOVERNANCE LIFECYCLE
// ============================================================================

export type PolicyLifecycleState = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'UNDER_REVISION' | 'RETIRED';

export interface GrcPolicy {
  id: string;
  tenantId: string;
  policyCode: string; // e.g. "POL-SEC-001"
  title: string;
  version: string;
  category: 'INFORMATION_SECURITY' | 'ACCEPTABLE_USE' | 'ACCESS_CONTROL' | 'DATA_PRIVACY' | 'INCIDENT_MGMT' | 'AI_ETHICS';
  state: PolicyLifecycleState;
  owner: string;
  approver: string;
  effectiveDate: string;
  nextReviewDate: string;
  acknowledgementRequired: boolean;
  acknowledgementRatePercent: number; // e.g. 96.4%
  linkedControlIds: string[];
  linkedFrameworkCodes: string[];
  documentUrl?: string;
}

export interface GrcException {
  id: string;
  tenantId: string;
  exceptionCode: string; // e.g. "EXC-2026-08"
  title: string;
  reason: string;
  requestedBy: string;
  approvedBy: string;
  relatedControlId: string;
  compensatingControls: string;
  riskAcceptedScore: number;
  approvedDate: string;
  expiryDate: string;
  status: 'PENDING_APPROVAL' | 'APPROVED_ACTIVE' | 'EXPIRED' | 'REVOKED';
}

// ============================================================================
// 11. PRIVACY MANAGEMENT (DPDP, ISO 27701, GDPR)
// ============================================================================

export interface PrivacyProcessingActivity {
  id: string;
  tenantId: string;
  code: string; // e.g. "ROPA-004"
  name: string;
  purposeOfProcessing: string;
  legalBasis: 'CONSENT' | 'LEGITIMATE_USE' | 'CONTRACT' | 'LEGAL_OBLIGATION';
  dataSubjectTypes: string[];
  piiCategories: string[];
  retentionPeriod: string;
  storageSystems: string[];
  dataProcessors: string[]; // Vendor IDs
  crossBorderTransfers: boolean;
  dpiaRequired: boolean;
  dpiaStatus?: 'NOT_REQUIRED' | 'IN_PROGRESS' | 'APPROVED_LOW_RISK' | 'HIGH_RISK_REQUIRES_AUTHORITY';
  linkedControlIds: string[];
}

// ============================================================================
// 12. BUSINESS IMPACT ANALYSIS (BIA)
// ============================================================================

export interface BiaRecord {
  id: string;
  tenantId: string;
  processId: string;
  processName: string;
  criticalityTier: 'TIER_1_CRITICAL' | 'TIER_2_ESSENTIAL' | 'TIER_3_SUPPORT';
  maxTolerableDowntimeHours: number;
  rtoHours: number;
  rpoHours: number;
  financialImpactPerHour: number;
  regulatoryImpact: 'HIGH' | 'MEDIUM' | 'LOW';
  reputationalImpact: 'HIGH' | 'MEDIUM' | 'LOW';
  dependentAssets: string[];
  dependentVendors: string[];
  workaroundProcedures: string;
  lastAssessedAt: string;
}

// ============================================================================
// 13. VULNERABILITY CENTER
// ============================================================================

export interface GrcVulnerability {
  id: string;
  tenantId: string;
  cveId?: string; // e.g. "CVE-2026-21443"
  title: string;
  cvssScore: number; // 0.0 - 10.0
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  affectedAssetId: string;
  scannerSource: 'AWS_INSPECTOR' | 'TRIVY' | 'QUALYS' | 'SNYK' | 'WIZ' | 'MANUAL_PENTEST';
  status: 'OPEN' | 'ANALYZING' | 'REMEDIATING' | 'PATCHED' | 'RISK_ACCEPTED';
  firstDiscoveredAt: string;
  slaDueDate: string;
  linkedRiskId?: string;
  linkedCapaId?: string;
}

// ============================================================================
// 14. NEXT BEST ACTION (CISO Cockpit Priority Engine)
// ============================================================================

export interface NextBestActionItem {
  id: string;
  tenantId: string;
  priorityScore: number; // 1 - 100 (Computed urgency)
  category: 'CRITICAL_RISK' | 'MISSING_EVIDENCE' | 'OVERDUE_CAPA' | 'EXPIRING_EVIDENCE' | 'AUDIT_DEADLINE' | 'CONTROL_FAILURE' | 'REGULATORY_CHANGE';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  reason: string;
  sourceEntity: {
    type: 'RISK' | 'CONTROL' | 'EVIDENCE' | 'CAPA' | 'AUDIT' | 'VENDOR' | 'ASSESSMENT' | 'POLICY';
    id: string;
    code: string;
  };
  recommendedAction: string;
  impactIfIgnored: string;
  owner: string;
  dueDate: string;
  actionType: 'REVIEW' | 'ASSIGN' | 'UPLOAD' | 'REMEDIATE' | 'APPROVE' | 'TEST';
}

// ============================================================================
// 15. 360° ENTITY RELATIONSHIP GRAPH
// ============================================================================

export type CanonicalEntityType =
  | 'ORGANIZATION'
  | 'DEPARTMENT'
  | 'PROCESS'
  | 'ACTIVITY'
  | 'FRAMEWORK'
  | 'REQUIREMENT'
  | 'CONTROL'
  | 'CONTROL_IMPL'
  | 'POLICY'
  | 'PROCEDURE'
  | 'SOP'
  | 'RISK'
  | 'EVIDENCE'
  | 'ASSERTION'
  | 'CONTROL_TEST'
  | 'FINDING'
  | 'CAPA'
  | 'RETEST'
  | 'EXCEPTION'
  | 'AUDIT'
  | 'ASSESSMENT'
  | 'ASSET'
  | 'APPLICATION'
  | 'DATA'
  | 'VENDOR'
  | 'CRITICAL_SERVICE'
  | 'TELEMETRY'
  | 'CONNECTOR'
  | 'TASK'
  | string;

export type CanonicalRelationshipType =
  | 'MAPS_TO'
  | 'PROTECTS'
  | 'EVIDENCES'
  | 'MITIGATES'
  | 'IDENTIFIES'
  | 'REMEDIATES'
  | 'DEPENDS_ON'
  | 'GOVERNS'
  | 'IMPLEMENTS'
  | 'TESTS'
  | 'EXEMPTS'
  | 'BELONGS_TO'
  | 'PERFORMS'
  | 'RETESTS'
  | 'AUDITS'
  | 'HOSTS'
  | 'OBSERVES'
  | string;

export interface EntityNode {
  id: string;
  type: CanonicalEntityType;
  code: string;
  title: string;
  status?: string;
  score?: number | string;
  owner?: string;
  department?: string;
  criticality?: string;
  details?: Record<string, any>;
}

export interface EntityEdge {
  sourceId: string;
  targetId: string;
  relationship: CanonicalRelationshipType;
  label?: string;
}

export interface Entity360Metadata {
  overview?: {
    description?: string;
    owner?: string;
    department?: string;
    criticality?: string;
    lifecycleStatus?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  context?: {
    organization?: string;
    department?: string;
    processName?: string;
    processOwner?: string;
    smes?: Array<{ name: string; role: string; email: string }>;
    applications?: string[];
    assets?: string[];
    vendors?: string[];
    raci?: Array<{ role: string; r: boolean; a: boolean; c: boolean; i: boolean }>;
  };
  risks?: Array<{
    id: string;
    code: string;
    title: string;
    inherentScore: number;
    residualScore: number;
    level: string;
    treatment: string;
    owner: string;
    hasControls: boolean;
  }>;
  controls?: Array<{
    id: string;
    code: string;
    title: string;
    category?: string;
    status: string;
    effectiveness: string;
    owner: string;
    testingFrequency?: string;
    lastTestedAt?: string;
    frameworkMappings?: string[];
  }>;
  policies?: Array<{
    id: string;
    code: string;
    title: string;
    type: string;
    status: string;
    version: string;
    owner: string;
    nextReviewDate?: string;
    acknowledgementRate?: number;
  }>;
  evidence?: Array<{
    id: string;
    code: string;
    name: string;
    status: string;
    hash: string;
    validUntil: string;
    isExpired: boolean;
    sourceType?: string;
    verifiedBy?: string;
  }>;
  testing?: Array<{
    id: string;
    title: string;
    testProcedure?: string;
    sampleSize?: number;
    result: string;
    effectiveness: string;
    tester: string;
    date: string;
    status?: string;
  }>;
  findings?: Array<{
    id: string;
    code: string;
    title: string;
    severity: string;
    status: string;
    rootCause?: string;
    owner?: string;
    identifiedBy?: string;
  }>;
  capas?: Array<{
    id: string;
    code: string;
    title: string;
    status: string;
    owner: string;
    dueDate: string;
    priority?: string;
    rootCause?: string;
    hasClosureEvidence?: boolean;
    retestStatus?: string;
  }>;
  exceptions?: Array<{
    id: string;
    code: string;
    title: string;
    status: string;
    expiryDate: string;
    isExpired: boolean;
    compensatingControls: string;
    approvedBy?: string;
  }>;
  audits?: Array<{
    id: string;
    code: string;
    title: string;
    status: string;
    leadAuditor: string;
    auditFirm?: string;
    startDate?: string;
    endDate?: string;
  }>;
  lineagePath?: string[];
}

export interface Entity360Graph {
  rootEntity: EntityNode;
  connectedNodes: EntityNode[];
  nodes?: EntityNode[];
  edges: EntityEdge[];
  metadata?: Entity360Metadata;
}

// ============================================================================
// 16. PHASE 12: CONTINUOUS TELEMETRY & CONNECTOR TYPES
// ============================================================================
export * from './telemetryTypes';
