// ============================================================================
// SKANDA ENTERPRISE GRC: CORE COMPLIANCE AUTOMATION OPERATING SYSTEM CONTRACTS
// Path: src/types/coreComplianceAutomationTypes.ts
//
// Enterprise Compliance Automation & Continuous Assurance Operating System
// Enforces:
//  - Canonical 14-Stage Governance Chain:
//    CUSTOMER -> PROGRAM -> FRAMEWORK -> REQUIREMENT -> APPLICABILITY -> CONTROL ->
//    OBJECTIVE -> ASSET/PROCESS -> OWNER -> INTEGRATION -> TELEMETRY -> AUTOMATED CHECK ->
//    EVIDENCE -> CONTROL TEST -> RESULT -> FINDING -> REMEDIATION -> CAPA -> RETEST ->
//    ASSURANCE -> AUDIT -> BOARD REPORTING
//  - Multi-Framework Cross-Walk ("1 Evidence Artifact -> 4 Framework Requirements")
//  - Extensible Integration SDK for 30+ Enterprise Connectors (IaaS, SaaS, IdP, SecOps, DevOps, ITSM)
//  - Automated Evidence Freshness & Cryptographic WORM Lineage
//  - Real-Time Continuous Control Monitoring & Automated Testing Engine
//  - Dynamic Blast Radius, Task SLA Escalation, and Audit Readiness Packaging
//  - 7-Layer Grounded AI Taxonomy & Anti-Hallucination Constraints
//  - Multi-Tenant RLS & Zero Cross-Tenant Leakage
// ============================================================================

import { StandardFrameworkCode } from './grcCoreTypes';

// ============================================================================
// 1. COMPLIANCE PROGRAM & SCOPING
// ============================================================================

export type ComplianceProgramStatus =
  | 'ACTIVE'
  | 'IN_SETUP'
  | 'AUDIT_IN_PROGRESS'
  | 'REMEDIATION_PHASE'
  | 'MAINTENANCE'
  | 'ARCHIVED';

export type CompliancePostureGrade =
  | 'STRONG'
  | 'MANAGED'
  | 'PARTIALLY_MANAGED'
  | 'AT_RISK'
  | 'INSUFFICIENT_ASSURANCE'
  | 'NO_ASSURANCE';

export type ComplianceMaturityTier =
  | 'LEVEL_1_MANUAL'
  | 'LEVEL_2_DIGITIZED'
  | 'LEVEL_3_AUTOMATED'
  | 'LEVEL_4_CONTINUOUSLY_MONITORED'
  | 'LEVEL_5_CONTINUOUSLY_ASSURED';

export interface ComplianceProgramScope {
  businessUnits: string[];
  inScopeAssetIds: string[];
  targetCloudAccounts: string[];
  applicableJurisdictions: string[];
  includedEnvironments: ('PRODUCTION' | 'STAGING' | 'CORPORATE_IT' | 'DISASTER_RECOVERY')[];
  excludedScopesWithRationale?: Array<{ scopeItem: string; rationale: string; approvedBy: string; approvedAt: string }>;
}

export interface ComplianceProgramMetrics {
  totalRequirementsCount: number;
  applicableControlsCount: number;
  implementedControlsCount: number;
  automatedControlsCount: number;
  manualControlsCount: number;
  effectiveControlsCount: number;
  failedControlsCount: number;
  untestedControlsCount: number;
  evidenceItemsCount: number;
  automatedEvidencePercent: number;
  freshEvidencePercent: number;
  staleEvidencePercent: number;
  openFindingsCount: number;
  criticalFindingsCount: number;
  overdueTasksCount: number;
  activeExceptionsCount: number;
  auditReadinessScore: number; // 0 to 100
  controlAssuranceCoveragePercent: number; // 0 to 100
  postureGrade: CompliancePostureGrade;
  maturityTier: ComplianceMaturityTier;
}

export interface EnterpriseComplianceProgram {
  id: string; // e.g. "prog-iso27001-soc2-global"
  tenantId: string;
  code: string; // e.g. "PRG-SEC-2026-01"
  name: string; // e.g. "Global Information Security & Trust Assurance Program"
  description: string;
  frameworkCodes: string[]; // e.g. ["ISO_27001_2022", "SOC_2_TYPE_2", "MAS_TRM_2021", "DPDP_ACT_2023", "NIST_CSF_2_0"]
  scope: ComplianceProgramScope;
  executiveSponsor: string; // e.g. "Dr. Marcus Vance (Chief Information Security Officer)"
  programLead: string; // e.g. "Sarah Chen (Head of GRC & Security Assurance)"
  compliancePeriod: { startDate: string; endDate: string };
  auditWindow?: { startDate: string; endDate: string; targetAuditFirm?: string };
  status: ComplianceProgramStatus;
  metrics: ComplianceProgramMetrics;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 2. FRAMEWORK ACTIVATION SPECIFICATION
// ============================================================================

export interface FrameworkActivationRequest {
  frameworkCode: string; // e.g. "ISO_27001_2022", "SOC_2_TYPE_2", "MAS_TRM_2021", "DPDP_ACT_2023", "PCI_DSS_V4"
  tenantId: string;
  targetProgramId?: string;
  scope: ComplianceProgramScope;
  autoMapCommonControls: boolean;
  autoProvisionEvidenceRequests: boolean;
  autoConnectAvailableTelemetry: boolean;
  defaultControlOwner: string;
}

export interface FrameworkActivationResult {
  activationId: string;
  frameworkCode: string;
  frameworkTitle: string;
  requirementsLoaded: number;
  applicableRequirements: number;
  controlsMapped: number;
  reusedCommonControls: number;
  netNewControlsCreated: number;
  evidenceRequirementsIdentified: number;
  automatedChecksConfigured: number;
  manualTasksGenerated: number;
  initialPosture: CompliancePostureGrade;
  initialReadinessScore: number;
  auditWorkspaceId: string;
  activatedAt: string;
}

// ============================================================================
// 3. CANONICAL UNIFIED CONTROL & CROSS-FRAMEWORK HARMONIZATION
// ============================================================================

export interface CrossFrameworkRequirementMapping {
  frameworkCode: string;
  frameworkName: string;
  requirementCode: string;
  requirementTitle: string;
  sectionOrClause: string;
  mandatory: boolean;
  mappingType: 'DIRECT_SATISFACTION' | 'SUBSTANTIAL_ALIGNMENT' | 'COMPENSATING' | 'PARTIAL_CONTRIBUTION';
  mappingConfidence: 'EXACT' | 'HIGH' | 'MEDIUM';
}

export interface CanonicalUnifiedControl {
  id: string; // e.g. "CTRL-CANONICAL-IAM-01"
  controlCode: string; // e.g. "CTRL-IAM-01"
  title: string; // e.g. "Privileged Identity Governance & Multi-Factor Authentication"
  description: string;
  controlObjective: string;
  category:
    | 'ACCESS_CONTROL'
    | 'CRYPTOGRAPHY'
    | 'INFRASTRUCTURE_SECURITY'
    | 'INCIDENT_MANAGEMENT'
    | 'VULNERABILITY_MANAGEMENT'
    | 'THIRD_PARTY_RISK'
    | 'BUSINESS_RESILIENCE'
    | 'DATA_PRIVACY'
    | 'AI_SAFETY'
    | 'GOVERNANCE_RISK';
  controlType: 'PREVENTIVE' | 'DETECTIVE' | 'CORRECTIVE' | 'DIRECTIVE';
  nature: 'AUTOMATED' | 'MANUAL' | 'HYBRID';
  
  // Cross-Framework Satisfactions (Harmonization)
  mappedFrameworkRequirements: CrossFrameworkRequirementMapping[];
  
  // Operational Linkages
  mitigatedRiskCodes: string[];
  boundPolicyCodes: string[];
  standardOperatingProcedureCodes: string[];
  requiredEvidenceTypes: string[];
  supportedConnectorTypes: string[];
  
  // Default Automation Specs
  automatedTestRoutine?: string;
  defaultEvaluationFrequency: 'CONTINUOUS' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
}

// ============================================================================
// 4. EXTENSIBLE INTEGRATION SDK & CONNECTOR ARCHITECTURE
// ============================================================================

export type IntegrationProviderId =
  // Cloud Infrastructure & IaaS
  | 'AWS'
  | 'AZURE'
  | 'GCP'
  | 'KUBERNETES'
  | 'DOCKER'
  | 'CLOUDFLARE'
  // Identity & Access Management (IdP / PAM)
  | 'MICROSOFT_ENTRA_ID'
  | 'OKTA'
  | 'GOOGLE_WORKSPACE'
  | 'CYBERARK'
  | 'ONEPASSWORD'
  // DevOps & Source Code Management
  | 'GITHUB'
  | 'GITLAB'
  | 'BITBUCKET'
  | 'TERRAFORM_CLOUD'
  // ITSM, Communication & Workflow
  | 'SERVICENOW'
  | 'JIRA'
  | 'SLACK'
  | 'MICROSOFT_TEAMS'
  // Endpoint Security & EDR
  | 'CROWDSTRIKE'
  | 'SENTINELONE'
  | 'DEFENDER_FOR_ENDPOINT'
  | 'INTUNE'
  | 'JAMF'
  // Vulnerability Management & Attack Surface
  | 'QUALYS'
  | 'TENABLE'
  | 'RAPID7'
  | 'WAZUH'
  // SIEM & Security Log Analytics
  | 'SPLUNK'
  | 'MICROSOFT_SENTINEL'
  | 'DATADOG'
  | 'AWS_CLOUDTRAIL'
  // Backup & Resilience
  | 'VEEAM'
  | 'AWS_BACKUP'
  | 'RUBRIK'
  // HRMS & People Ops
  | 'BAMBOOHR'
  | 'WORKDAY'
  | 'RIPPLING';

export type IntegrationCategory =
  | 'CLOUD_INFRASTRUCTURE'
  | 'IDENTITY_ACCESS'
  | 'SOURCE_CODE_DEVOPS'
  | 'ENDPOINT_MANAGEMENT'
  | 'VULNERABILITY_MANAGEMENT'
  | 'SECURITY_LOGS_SIEM'
  | 'ITSM_COLLABORATION'
  | 'BACKUP_RESILIENCE'
  | 'HRMS_PEOPLE_OPS';

export type IntegrationConnectionState =
  | 'CONNECTED'
  | 'DEGRADED'
  | 'AUTHENTICATION_FAILED'
  | 'RATE_LIMITED'
  | 'SOURCE_UNAVAILABLE'
  | 'PERMISSION_DENIED'
  | 'STALE'
  | 'DISCONNECTED'
  | 'NOT_CONFIGURED';

export interface IntegrationAuthCredentials {
  authType:
    | 'AWS_ASSUME_ROLE'
    | 'AZURE_SERVICE_PRINCIPAL'
    | 'GCP_SERVICE_ACCOUNT_KEY'
    | 'OAUTH2_REFRESH_TOKEN'
    | 'API_KEY'
    | 'WEBHOOK_HMAC'
    | 'MTLS_CERTIFICATE';
  roleArn?: string;
  externalId?: string;
  clientId?: string;
  tenantDirectoryId?: string;
  maskedClientSecret?: string;
  maskedApiKey?: string;
  endpointUrl?: string;
  certificateExpiry?: string;
  isReadOnly: boolean;
  scopesGranted: string[];
}

export interface IntegrationHealthMetrics {
  connectionStatus: IntegrationConnectionState;
  lastSuccessfulSyncAt: string | null;
  lastFailedSyncAt: string | null;
  lastSyncErrorMessage?: string;
  apiLatencyMs: number;
  apiSuccessRate30Days: number; // 0 to 100
  rateLimitUsagePercent: number; // 0 to 100
  dataFreshnessMinutes: number;
  assetsDiscoveredCount: number;
  usersDiscoveredCount: number;
  evidenceItemsCollectedTotal: number;
  activeDriftSignalsCount: number;
}

export interface IntegrationAdapterConfig {
  instanceId: string;
  tenantId: string;
  provider: IntegrationProviderId;
  name: string;
  category: IntegrationCategory;
  description: string;
  enabled: boolean;
  credentials: IntegrationAuthCredentials;
  syncIntervalMinutes: number;
  health: IntegrationHealthMetrics;
  capabilities: {
    supportsAssetDiscovery: boolean;
    supportsUserDirectoryDiscovery: boolean;
    supportsAutomatedEvidenceCollection: boolean;
    supportsRealTimeWebhooks: boolean;
    supportsContinuousPolicyEvaluation: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 5. AUTOMATED EVIDENCE ENGINE & WORM LEDGER
// ============================================================================

export type EvidenceFreshnessLifecycleState =
  | 'CURRENT'
  | 'STALE'
  | 'EXPIRED'
  | 'MISSING'
  | 'TAMPERED'
  | 'PENDING_REVIEW'
  | 'REJECTED';

export type EvidenceCollectionMethod =
  | 'AUTOMATED_API_PULL'
  | 'REALTIME_WEBHOOK_EVENT'
  | 'SCHEDULED_SQL_QUERY'
  | 'CI_CD_PIPELINE_GATE'
  | 'MANUAL_AUDIT_UPLOAD'
  | 'THIRD_PARTY_ATTESTATION';

export interface AutomatedEvidenceRecord {
  id: string; // e.g. "EVD-AWS-IAM-MFA-2026-Q3"
  tenantId: string;
  evidenceCode: string; // e.g. "EV-2026-104"
  title: string;
  description: string;
  sourceProvider: IntegrationProviderId | 'MANUAL_UPLOAD';
  collectionMethod: EvidenceCollectionMethod;
  sourceObjectId?: string; // e.g. "arn:aws:iam::123456789012:role/Admin"
  
  // Cryptographic & Integrity Attributes
  sha256Digest: string;
  wormBlockHeight?: number;
  wormMerkleRoot?: string;
  payloadSizeInBytes: number;
  mimeType: string;
  fileStorageUri?: string;
  rawJsonPayloadSnippet?: string;
  
  // Lifecycle & Freshness
  collectedAt: string;
  lastVerifiedAt: string;
  validUntil: string;
  freshnessState: EvidenceFreshnessLifecycleState;
  
  // Lineage Bindings (One-to-Many Cross Framework)
  targetControlCodes: string[];
  mappedRequirementCodes: string[];
  mappedFrameworkCodes: string[];
  associatedAssetIds: string[];
  
  // Reviewer & Governance
  reviewedBy?: string;
  reviewedAt?: string;
  reviewStatus: 'VERIFIED' | 'NEEDS_CLARIFICATION' | 'REJECTED' | 'AUTO_VALIDATED';
  confidenceScore: number; // 0.0 to 1.0
}

// ============================================================================
// 6. AUTOMATED CONTROL TESTING & EVALUATION ENGINE
// ============================================================================

export type ControlTestExecutionMode = 'AUTOMATED' | 'MANUAL' | 'HYBRID';

export type ControlTestVerdict =
  | 'PASS'
  | 'FAIL'
  | 'PARTIAL'
  | 'NOT_TESTED'
  | 'NOT_APPLICABLE'
  | 'ERROR'
  | 'REVIEW_REQUIRED';

export interface AutomatedTestEvaluationRule {
  ruleId: string;
  ruleTitle: string;
  description: string;
  dataSource: IntegrationProviderId | 'TELEMETRY_EVENT' | 'DATABASE_RECORD';
  targetMetricName: string;
  comparisonOperator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'IS_EMPTY' | 'CONTAINS' | 'MATCHES_REGEX';
  expectedValue: string | number | boolean;
  failureSeverityOnBreach: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  remediationSlaHours: number;
}

export interface ControlTestExecutionRecord {
  executionId: string;
  tenantId: string;
  controlCode: string;
  controlTitle: string;
  testSpecId: string;
  executionMode: ControlTestExecutionMode;
  verdict: ControlTestVerdict;
  executedAt: string;
  executionDurationMs: number;
  executedBy: string; // e.g. "SYSTEM_DAEMON" or "auditor.sarah@acme.com"
  
  // Input Data & Evaluation Logic
  evaluatedInputSummary: {
    totalEntitiesEvaluated: number;
    passingEntitiesCount: number;
    failingEntitiesCount: number;
    sampleEntities?: string[];
  };
  evaluationLogs: string[];
  failureReason?: string;
  
  // Evidence Lineage
  supportingEvidenceIds: string[];
  
  // Closed-Loop Downstream Impact
  generatedFindingId?: string;
  generatedRemediationTaskId?: string;
  escalatedRiskCode?: string;
  affectedFrameworkCodes: string[];
}

// ============================================================================
// 7. CONTINUOUS CONTROL MONITORING & DRIFT EVENT BUS
// ============================================================================

export type ComplianceDriftEventType =
  | 'CONTROL_TEST_FAILED'
  | 'EVIDENCE_EXPIRED'
  | 'EVIDENCE_TAMPERED'
  | 'INTEGRATION_DISCONNECTED'
  | 'UNAPPROVED_INFRA_CHANGE'
  | 'SECURITY_POLICY_VIOLATION'
  | 'EXCEPTION_EXPIRED'
  | 'CAPA_SLA_BREACHED'
  | 'REGULATORY_DIFF_DETECTED';

export interface ContinuousMonitoringEvent {
  eventId: string;
  tenantId: string;
  eventType: ComplianceDriftEventType;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  targetControlCode: string;
  sourceConnector?: IntegrationProviderId;
  eventTimestamp: string;
  summary: string;
  details: Record<string, any>;
  
  // Immediate Blast Radius
  affectedFrameworks: string[];
  affectedPrograms: string[];
  affectedAssets: string[];
  affectedPolicies: string[];
  
  // Automated Actions Triggered
  autoGeneratedFindingCode?: string;
  autoGeneratedTaskId?: string;
  priorAssuranceState: string;
  newAssuranceState: string;
  notifiedStakeholders: string[];
}

// ============================================================================
// 8. COMPLIANCE TASK AUTOMATION & ESCALATION SLA
// ============================================================================

export type ComplianceTaskTriggerSource =
  | 'FRAMEWORK_ACTIVATION'
  | 'CONTROL_REQUIREMENT_DEFICIENCY'
  | 'EVIDENCE_EXPIRY_WARNING'
  | 'AUTOMATED_TEST_FAILURE'
  | 'REGULATORY_CHANGE_DETECTED'
  | 'RISK_SCORE_ESCALATION'
  | 'ANNUAL_POLICY_REVIEW'
  | 'MANDATORY_TRAINING_CYCLE'
  | 'AUDIT_REQUEST_FULFILLMENT'
  | 'INTEGRATION_SYNC_FAILURE';

export type TaskEscalationTier =
  | 'TIER_1_CONTROL_OWNER'
  | 'TIER_2_DEPARTMENT_MANAGER'
  | 'TIER_3_COMPLIANCE_LEAD'
  | 'TIER_4_CISO'
  | 'TIER_5_EXECUTIVE_BOARD';

export interface ComplianceAutomationTask {
  id: string; // e.g. "TSK-COMP-2026-088"
  tenantId: string;
  taskCode: string; // e.g. "TSK-088"
  title: string;
  description: string;
  triggerSource: ComplianceTaskTriggerSource;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED_FOR_REVIEW' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
  
  // Ownership & SLA Escalation
  assignedOwner: string;
  backupOwner?: string;
  currentEscalationTier: TaskEscalationTier;
  createdAt: string;
  dueDate: string;
  slaHoursTotal: number;
  slaHoursRemaining: number;
  isOverdue: boolean;
  escalationCount: number;
  
  // Target Lineage
  targetProgramId?: string;
  targetFrameworkCode?: string;
  targetControlCode?: string;
  targetEvidenceId?: string;
  relatedFindingId?: string;
  relatedCapaId?: string;
  
  // Completion Proof
  resolutionNotes?: string;
  attachedEvidenceIds: string[];
  verifiedBy?: string;
  verifiedAt?: string;
}

// ============================================================================
// 9. REMEDIATION, 5-WHYS ROOT CAUSE & CLOSED-LOOP RETEST
// ============================================================================

export interface RemediationFiveWhysRootCause {
  why1: string; // Direct problem
  why2: string; // Why did it happen?
  why3: string; // Why was it not detected?
  why4: string; // Why did existing processes fail?
  why5: string; // Systemic organizational root cause
  rootCauseCategory: 'PROCESS_GAP' | 'TECHNICAL_DEBT' | 'TRAINING_DEFICIENCY' | 'TOOLING_MISCONFIGURATION' | 'VENDOR_FAILURE';
}

export interface AutomatedCapaRemediation {
  id: string; // e.g. "CAPA-2026-042"
  tenantId: string;
  capaCode: string;
  findingId: string;
  findingTitle: string;
  controlCode: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  
  // 5-Whys Analysis
  rootCauseAnalysis: RemediationFiveWhysRootCause;
  
  // Actions
  correctiveActionPlan: string;
  preventiveActionPlan: string;
  assignedOwner: string;
  targetCompletionDate: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'REMEDIATION_SUBMITTED' | 'RETEST_SCHEDULED' | 'RETEST_PASSED' | 'EFFECTIVE_CLOSED';
  
  // Retest Verification (Strict Closed-Loop)
  retestRequired: boolean;
  retestMethod: 'AUTOMATED_TELEMETRY' | 'INDEPENDENT_AUDITOR_INSPECTION' | 'EVIDENCE_REVERIFICATION';
  retestScheduledDate: string;
  retestResult?: 'PASS' | 'FAIL';
  retestedBy?: string;
  retestedAt?: string;
  closureEvidenceIds: string[];
  closureApprovedBy?: string;
  closureApprovedAt?: string;
}

// ============================================================================
// 10. AUDIT READINESS CENTER & AUTOMATED AUDIT REQUEST PACKAGER
// ============================================================================

export interface FrameworkAuditReadinessProfile {
  frameworkCode: string;
  frameworkName: string;
  readinessScore: number; // 0 to 100
  readinessRating: 'AUDIT_READY' | 'MINOR_GAPS' | 'SUBSTANTIAL_REMEDIATION_NEEDED' | 'NOT_READY';
  totalCheckpoints: number;
  passingCheckpoints: number;
  deficientCheckpoints: number;
  untestedCheckpoints: number;
  evidenceFreshnessScore: number;
  openCriticalFindingsCount: number;
  unresolvedExceptionsCount: number;
  estimatedAuditorTestingDays: number;
  lastReadinessAssessmentAt: string;
}

export interface AuditorEvidenceRequestPackage {
  packageId: string;
  tenantId: string;
  requestId: string;
  requestTitle: string; // e.g. "Q3 Privileged Access Review & MFA Enforcement Evidence"
  auditorQuery: string;
  requestedFramework: string;
  requestedPeriod: { startDate: string; endDate: string };
  
  // Automated Packaging Result
  mappedControls: string[];
  packagedEvidenceArtifacts: Array<{
    evidenceId: string;
    evidenceCode: string;
    title: string;
    source: string;
    sha256Digest: string;
    freshnessStatus: EvidenceFreshnessLifecycleState;
    verifiedValid: boolean;
  }>;
  missingEvidenceCount: number;
  completenessPercent: number;
  packageStatus: 'GENERATING' | 'READY_FOR_AUDITOR_REVIEW' | 'INCOMPLETE_GAPS_EXIST' | 'EXPORTED_TO_CLEAN_ROOM';
  generatedAt: string;
  digitalBinderDownloadUri?: string;
  cryptographicSealHash: string;
}

// ============================================================================
// 11. ENTERPRISE COMPLIANCE CALENDAR
// ============================================================================

export type ComplianceCalendarEventType =
  | 'EVIDENCE_RENEWAL'
  | 'CONTROL_TESTING_DUE'
  | 'ANNUAL_POLICY_REVIEW'
  | 'EMPLOYEE_SECURITY_TRAINING'
  | 'EXTERNAL_CERTIFICATION_AUDIT'
  | 'SURVEILLANCE_AUDIT'
  | 'CAPA_REMEDIATION_DEADLINE'
  | 'QUARTERLY_ACCESS_REVIEW'
  | 'ANNUAL_DISASTER_RECOVERY_TEST'
  | 'VENDOR_SECURITY_REASSESSMENT'
  | 'REGULATORY_CHANGE_EFFECTIVE_DATE'
  | 'SECURITY_EXCEPTION_EXPIRY';

export interface ComplianceCalendarItem {
  id: string;
  tenantId: string;
  title: string;
  eventType: ComplianceCalendarEventType;
  date: string;
  dueDate: string;
  recurrence: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'BI_ANNUAL' | 'ANNUAL';
  targetFrameworkCode?: string;
  targetControlCode?: string;
  ownerName: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'UPCOMING' | 'COMPLETED' | 'OVERDUE' | 'IN_PROGRESS';
  actionUri?: string;
}

// ============================================================================
// 12. AI COMPLIANCE COPILOT REASONING & PROVENANCE
// ============================================================================

export type AICopilotTaxonomyClassification =
  | 'DIRECT_SOURCE'
  | 'SOURCE_DERIVED'
  | 'OSA_MAPPING'
  | 'SKANDA_INTERPRETATION'
  | 'SKANDA_RECOMMENDED_CONTROL'
  | 'CUSTOMER_DATA'
  | 'UNKNOWN';

export interface AICopilotGroundedQuery {
  tenantId: string;
  query: string;
  contextProgramId?: string;
  contextFrameworkCode?: string;
  contextControlCode?: string;
}

export interface AICopilotGroundedResponse {
  answer: string;
  classification: AICopilotTaxonomyClassification;
  confidenceScore: number; // 0.0 to 1.0
  isAuthoritative: boolean;
  citations: Array<{
    sourceAuthority: string;
    documentTitle: string;
    sectionOrClause: string;
    verbatimSnippet?: string;
    sourceUri?: string;
    sha256Digest?: string;
  }>;
  customerDataTrace?: {
    evaluatedControlsCount: number;
    failingControls: string[];
    missingEvidenceItems: string[];
    openFindings: string[];
  };
  recommendedActions: Array<{
    actionTitle: string;
    actionType: 'TRIGGER_RETEST' | 'CONNECT_INTEGRATION' | 'ASSIGN_TASK' | 'GENERATE_EVIDENCE_REQUEST';
    targetEntityId?: string;
  }>;
  generatedAt: string;
}

// ============================================================================
// 13. ENTERPRISE COMPLIANCE COMMAND CENTER AGGREGATION
// ============================================================================

export interface EnterpriseComplianceCommandCenterSummary {
  tenantId: string;
  organizationName: string;
  activeProgramsCount: number;
  activeFrameworksCount: number;
  overallPostureGrade: CompliancePostureGrade;
  operationsMaturityTier: ComplianceMaturityTier;
  controlAssuranceCoveragePercent: number;
  totalCanonicalControls: number;
  automatedControlsCount: number;
  automatedEvidencePercent: number;
  freshEvidencePercent: number;
  failedControlsCount: number;
  criticalOpenFindingsCount: number;
  overdueTasksCount: number;
  activeConnectorsCount: number;
  unhealthyConnectorsCount: number;
  auditReadinessAveragePercent: number;
  
  // Multi-Framework Coverage Scorecards
  frameworkReadinessProfiles: FrameworkAuditReadinessProfile[];
  
  // Real-Time Actionable Priorities
  criticalActionItems: Array<{
    id: string;
    priority: 'CRITICAL' | 'HIGH';
    category: 'FAILED_CONTROL' | 'OVERDUE_CAPA' | 'EXPIRED_EVIDENCE' | 'UNHEALTHY_CONNECTOR' | 'REGULATORY_CHANGE';
    title: string;
    impactDescription: string;
    affectedFrameworks: string[];
    assignedOwner: string;
    actionType: string;
    actionPayload: Record<string, any>;
  }>;
  
  // Historical Posture Trend Curve (30d, 90d, 12m)
  postureTrendHistory: Array<{
    timestamp: string;
    assuranceCoveragePercent: number;
    auditReadinessPercent: number;
    automatedControlsPercent: number;
  }>;
}
