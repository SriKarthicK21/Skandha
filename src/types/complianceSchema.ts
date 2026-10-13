// ============================================================================
// SKANDA GRC — Continuous Compliance Monitoring Database Schema Extensions
// Path: src/types/complianceSchema.ts
//
// Enterprise-grade relational & document schema extensions for:
// 1. Frameworks (ISO 27001, ISO 27701, ISO 42001, SOC 2, MAS TRM, GDPR, etc.)
// 2. Requirements (Standard Clauses, Mandates, Sub-clauses, Audit Criteria)
// 3. Controls (Annex A, Common Controls Hub, Preventive/Detective/Corrective)
// 4. Evaluations (Periodic & Continuous Operating Effectiveness Telemetry)
// 5. Automated Tests (CI/CD, Cloud Infrastructure, IAM, SIEM, SAST/DAST)
// 6. Evidence (Cryptographic SHA-256 artifacts, Freshness SLAs, Decay curves)
// 7. Certification Lifecycle Tracking (3-Year post-certification audit cycles)
// 8. Compliance Drift Events (Autonomous detection, SLA breaches, CAPA sync)
// ============================================================================

import {
  ContinuousComplianceControlStatus,
  MonitoringFrequency,
  EvidenceFreshnessRating,
  AutomatedTestStatus,
  DriftSeverity,
  DriftType
} from './continuousCompliance';

// ----------------------------------------------------------------------------
// 1. FRAMEWORKS SCHEMA EXTENSION
// ----------------------------------------------------------------------------

export type FrameworkCategory =
  | 'INFORMATION_SECURITY'
  | 'PRIVACY_DATA_PROTECTION'
  | 'ARTIFICIAL_INTELLIGENCE'
  | 'BUSINESS_CONTINUITY'
  | 'FINANCIAL_REGULATORY'
  | 'CLOUD_SECURITY'
  | 'CYBERSECURITY_OPERATIONS';

export type FrameworkAuthority =
  | 'ISO_IEC'
  | 'AICPA'
  | 'MAS_SINGAPORE'
  | 'NIST'
  | 'EUROPEAN_UNION'
  | 'INDIA_MEITY'
  | 'PCI_SSC'
  | 'US_HHS';

export interface ComplianceFrameworkSchema {
  id: string; // e.g. "fw-iso-27001-2022"
  code: string; // e.g. "ISO/IEC 27001:2022"
  name: string; // e.g. "Information Security Management Systems — Requirements"
  version: string; // e.g. "2022"
  authority: FrameworkAuthority;
  category: FrameworkCategory;
  description: string;
  officialReferenceUrl?: string;
  totalClausesCount: number;
  totalControlsCount: number;
  surveillanceCycleMonths: number; // e.g. 12 (surveillance year 1, year 2, recertification year 3)
  accreditationRequired: boolean; // e.g. UKAS, ANAB, DAKKS
  statementOfApplicabilityMandatory: boolean; // true for ISO 27001
  status: 'ACTIVE' | 'DRAFT' | 'SUPERSEDED' | 'ARCHIVED';
  applicableJurisdictions: string[]; // e.g. ["Global", "EU", "SG", "US"]
  supportedCertificationBodies: string[]; // e.g. ["BSI", "TUV Rheinland", "DNV", "Bureau Veritas", "SGS"]
  domains: Array<{
    id: string;
    code: string; // e.g. "A.5", "A.6", "A.7", "A.8"
    title: string;
    description: string;
    controlCount: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// 2. REQUIREMENTS SCHEMA EXTENSION
// ----------------------------------------------------------------------------

export type RequirementType =
  | 'MANAGEMENT_SYSTEM_CLAUSE' // e.g. ISO Cl. 4 to Cl. 10
  | 'OPERATIONAL_CONTROL'       // e.g. ISO Annex A
  | 'STATUTORY_MANDATE'         // e.g. MAS Notice 644, GDPR Art 32
  | 'CRITERIA_TRUST_SERVICE';   // e.g. SOC 2 Common Criteria CC6.1

export interface ComplianceRequirementSchema {
  id: string; // e.g. "req-iso27001-cl9-2"
  frameworkId: string; // Foreign Key -> ComplianceFrameworkSchema.id
  frameworkCode: string; // e.g. "ISO/IEC 27001:2022"
  requirementCode: string; // e.g. "Cl.9.2", "Cl.9.3", "A.5.15"
  parentRequirementId?: string; // For hierarchical requirements (e.g. Cl.9.2.1 under Cl.9.2)
  clauseNumber: string; // e.g. "9.2"
  title: string;
  requirementText: string;
  type: RequirementType;
  mandatory: boolean;
  auditCriteria: string[]; // Criteria external auditors evaluate against
  evidenceGuidance: string; // Prescribed evidentiary expectations
  defaultMonitoringFrequency: MonitoringFrequency;
  freshnessSlaDays: number; // e.g. 365 for annual clauses, 30 for operational
  mappedControlIds: string[]; // Foreign Key -> ContinuousControlSchema.id
  riskSignificance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// 3. CONTROLS SCHEMA EXTENSION
// ----------------------------------------------------------------------------

export type ControlCategory =
  | 'Organizational'
  | 'People'
  | 'Physical'
  | 'Technological';

export type ControlType = 'Preventive' | 'Detective' | 'Corrective';
export type SecurityProperty = 'Confidentiality' | 'Integrity' | 'Availability';
export type CybersecurityConcept = 'Identify' | 'Protect' | 'Detect' | 'Respond' | 'Recover';
export type SecurityDomain = 'Governance_and_Ecosystem' | 'Protection' | 'Defense' | 'Resilience';

export interface ContinuousControlSchema {
  id: string; // e.g. "ctrl-a-5-15"
  tenantId: string; // Multi-tenant isolation
  controlCode: string; // e.g. "A.5.15", "A.8.8", "Cl.9.2"
  title: string;
  description: string;
  category: ControlCategory;
  primaryFrameworkId: string; // e.g. "fw-iso-27001-2022"
  clauseOrAnnex: string;
  crossFrameworkMappings: Array<{
    frameworkCode: string; // e.g. "SOC 2 Type II", "MAS TRM", "NIST CSF v2"
    mappedControlCode: string; // e.g. "CC6.1", "Sec 4.2", "PR.AC-1"
    relationshipType: 'EXACT_EQUIVALENT' | 'SUBSET' | 'SUPERSET' | 'COMPLEMENTARY';
  }>;
  controlType: ControlType[];
  securityProperties: SecurityProperty[];
  cybersecurityConcepts: CybersecurityConcept[];
  securityDomains: SecurityDomain[];
  controlOwner: string;
  responsibleDepartment: string;
  defaultMonitoringFrequency: MonitoringFrequency;
  evidenceCollectionSlaDays: number;
  isContinuousMonitoringEnabled: boolean;
  automatedTestCapable: boolean;
  requiresDocumentedProcedure: boolean; // Annex A 5.37 requirement
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// 4. EVALUATIONS SCHEMA EXTENSION
// ----------------------------------------------------------------------------

export type EvaluatorType =
  | 'AUTOMATED_DAEMON'
  | 'INTERNAL_AUDITOR'
  | 'EXTERNAL_ASSESSOR'
  | 'DEVSECOPS_PIPELINE';

export interface ContinuousEvaluationSchema {
  id: string; // e.g. "eval-2026-tenant-acme-a515"
  tenantId: string;
  controlId: string; // Foreign Key -> ContinuousControlSchema.id
  controlCode: string;
  frameworkCode: string;
  overallStatus: ContinuousComplianceControlStatus;
  implementationStatus: 'Not Started' | 'In Progress' | 'Implemented';
  operatingEffectivenessStatus: 'Effective' | 'Ineffective' | 'Pending Verification';
  monitoringFrequency: MonitoringFrequency;
  lastEvaluatedAt: string;
  nextEvaluationDueAt: string;
  evaluationCycleId: string; // e.g. "cycle-2026-q3"
  evaluatorId: string;
  evaluatorType: EvaluatorType;
  evaluatorNotes?: string;
  evidenceFreshnessStatus: EvidenceFreshnessRating;
  evidenceIds: string[]; // Foreign Keys -> ContinuousEvidenceSchema.id
  automatedTestIds: string[]; // Foreign Keys -> AutomatedTestSchema.id
  mappedRiskIds: string[];
  mappedCapaIds: string[];
  hasActiveException: boolean;
  exceptionDetails?: {
    exceptionId: string;
    reason: string;
    approvedBy: string;
    approvedAt: string;
    expiresAt: string;
    compensatingControls: string[];
  };
  driftDetected: boolean;
  driftReason?: string;
  telemetryMetrics: {
    automatedTestsPassedCount: number;
    automatedTestsFailedCount: number;
    evidenceFreshnessScore: number; // 0 - 100
    slaCompliancePercentage: number;
  };
  evaluationAuditTrail: Array<{
    evaluatedAt: string;
    status: ContinuousComplianceControlStatus;
    evaluator: string;
    evaluatorType: EvaluatorType;
    evidenceFreshness: EvidenceFreshnessRating;
    notes: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// 5. AUTOMATED TESTS SCHEMA EXTENSION
// ----------------------------------------------------------------------------

export type TestMetricType =
  | 'BOOLEAN_FLAG'          // 1/0 e.g. MFA Enforced (Yes/No)
  | 'PERCENTAGE_COMPLIANCE' // 0-100% e.g. 98% Endpoint EDR Coverage
  | 'THRESHOLD_COUNT'       // e.g. 0 Critical CVEs > 14 days
  | 'TIME_DURATION_MS'      // e.g. RTO <= 4 hours
  | 'IMMUTABILITY_PROOF';   // e.g. S3 Object Lock WORM Hash match

export interface AutomatedTestSchema {
  id: string; // e.g. "test-iam-mfa-01"
  tenantId: string;
  controlCode: string; // Foreign Key -> ContinuousControlSchema.controlCode
  controlId?: string;
  testName: string;
  description: string;
  sourceSystem: string; // e.g. "Okta & AWS IAM", "Trivy", "AWS Backup", "Datadog"
  integrationType: 'API_POLLER' | 'WEBHOOK' | 'GITHUB_ACTION' | 'SIEM_COLLECTOR' | 'AGENT_HEARTBEAT';
  executionFrequency: MonitoringFrequency;
  metricType: TestMetricType;
  thresholdExpression: string; // e.g. "value == 100", "count <= 0", "durationMinutes <= 240"
  lastExecutedAt: string;
  nextExecutionDueAt: string;
  currentStatus: AutomatedTestStatus;
  latestMetricValue: string;
  latestThreshold: string;
  latestFailureReason?: string;
  evidenceGeneratedId?: string; // Foreign Key -> ContinuousEvidenceSchema.id
  evidenceGeneratedSha256?: string;
  testOwner: string;
  rawPayloadSnippet?: string;
  executionHistory: Array<{
    executionId: string;
    executedAt: string;
    status: AutomatedTestStatus;
    metricValue: string;
    durationMs: number;
    driftTriggered: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// 6. EVIDENCE SCHEMA EXTENSION
// ----------------------------------------------------------------------------

export interface ContinuousEvidenceSchema {
  id: string; // e.g. "evd-acme-a517-mfa-202609"
  tenantId: string;
  controlCode: string; // Foreign Key -> ContinuousControlSchema.controlCode
  controlTitle: string;
  evidenceTitle: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  storageUri: string; // e.g. "worm://skanda-evidence-vault/tenant-acme/2026/09/mfa.pdf"
  department: string;
  uploadedBy: string;
  uploadedAt: string;
  expiryDate?: string;
  collectionFrequency: MonitoringFrequency;
  slaMaxDays: number;
  ageInDays: number;
  slaRemainingDays: number;
  freshnessStatus: EvidenceFreshnessRating;
  freshnessScore: number; // 0 - 100
  sha256Hash: string; // Cryptographic integrity proof
  tamperEvidentVerified: boolean;
  digitalSignatureId?: string;
  annexA537Compliant: boolean; // ISO/IEC 27001:2022 documented operating procedure check
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  tags: string[];
  decayAuditHistory: Array<{
    evaluatedAt: string;
    freshnessStatus: EvidenceFreshnessRating;
    ageInDays: number;
    score: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// 7. CERTIFICATION LIFECYCLE TRACKING SCHEMA EXTENSION
// ----------------------------------------------------------------------------

export type SurveillanceAuditStatus = 'Scheduled' | 'Fieldwork' | 'Passed' | 'Overdue' | 'Pending';

export interface CertificationLifecycleSchema {
  id: string; // e.g. "cert-iso27001-acme"
  tenantId: string;
  frameworkCode: string; // e.g. "ISO/IEC 27001:2022"
  standard: 'ISO/IEC 27001:2022';
  certificationStatus:
    | 'Certified — Active'
    | 'Under Surveillance'
    | 'Recertification Pending'
    | 'Pre-Certification Readiness'
    | 'Suspended';
  certificationBody: string; // e.g. "BSI Assurance UK"
  accreditationBody: string; // e.g. "UKAS (Accreditation 0003)"
  certificateNumber: string; // e.g. "ISMS 749281-2024-SKD"
  scopeStatement: string;
  physicalSitesIncluded: string[];
  issueDate: string;
  expiryDate: string;
  validityPeriodYears: number; // 3 years

  // 3-Year Post-Certification Audit Milestones
  surveillanceYear1Date: string;
  surveillanceYear1Status: SurveillanceAuditStatus;
  surveillanceYear2Date: string;
  surveillanceYear2Status: SurveillanceAuditStatus;
  recertificationDate: string;
  recertificationStatus: 'Planned' | 'Pending';

  // Mandatory ISO Governance Timelines (Cl. 9.2 & Cl. 9.3)
  lastInternalAuditDate: string;
  nextInternalAuditDate: string;
  lastManagementReviewDate: string;
  nextManagementReviewDate: string;

  leadAuditorName: string;
  cbClientManager: string;
  certificationConditions: string[];

  // Continuous Risk Telemetry
  calculatedMetrics: {
    daysUntilSurveillance1: number;
    daysUntilSurveillance2: number;
    daysUntilRecertification: number;
    daysUntilCertificateExpiry: number;
    daysSinceInternalAudit: number;
    daysSinceManagementReview: number;
    internalAuditOverdue: boolean;
    managementReviewOverdue: boolean;
    surveillanceOverdue: boolean;
    certificationRiskLevel: 'LOW' | 'MODERATE' | 'ELEVATED' | 'CRITICAL';
  };
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// 8. DRIFT DETECTION EVENTS SCHEMA EXTENSION
// ----------------------------------------------------------------------------

export type DriftTriggerSource =
  | 'DAEMON_POLL_SWEEP'
  | 'AUTOMATED_TEST_RUNNER'
  | 'EVIDENCE_DECAY_EVALUATOR'
  | 'SCHEDULED_JOB'
  | 'MANUAL_AUDIT_FINDING';

export interface ComplianceDriftEventSchema {
  id: string; // e.g. "DRIFT-2026-9478"
  tenantId: string;
  frameworkCode: string;
  controlCode: string;
  controlTitle: string;
  severity: DriftSeverity; // 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  driftType: DriftType;
  triggerSource: DriftTriggerSource;
  detectedAt: string;
  rootCause: string;
  recommendedAction: string;
  assignedOwner: string;
  dueDate: string;
  affectedRiskIds: string[];
  capaId?: string; // Linkage to Corrective and Preventive Action
  status: 'OPEN' | 'IN_REMEDIATION' | 'VERIFICATION_PENDING' | 'RESOLVED' | 'EXCEPTION_GRANTED';
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  auditTrail: Array<{
    timestamp: string;
    previousStatus: string;
    newStatus: string;
    changedBy: string;
    comment: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// UNIFIED DATABASE SCHEMA ROOT
// ----------------------------------------------------------------------------

export interface ContinuousComplianceDatabaseSchema {
  frameworks: Record<string, ComplianceFrameworkSchema[]>;
  requirements: Record<string, ComplianceRequirementSchema[]>;
  controls: Record<string, ContinuousControlSchema[]>;
  evaluations: Record<string, ContinuousEvaluationSchema[]>;
  automatedTests: Record<string, AutomatedTestSchema[]>;
  evidence: Record<string, ContinuousEvidenceSchema[]>;
  certifications: Record<string, CertificationLifecycleSchema>;
  driftEvents: Record<string, ComplianceDriftEventSchema[]>;
  readinessPackages: Record<string, any[]>;
  auditTrail: Record<string, Array<{
    id: string;
    timestamp: string;
    action: string;
    actor: string;
    details: string;
    sha256: string;
  }>>;
}

// ----------------------------------------------------------------------------
// RELATIONAL (POSTGRESQL / SQL) SCHEMA DEFINITIONS
// ----------------------------------------------------------------------------

export const CONTINUOUS_COMPLIANCE_SQL_DDL = `
-- ============================================================================
-- Continuous Compliance Monitoring Relational Database DDL (PostgreSQL)
-- ============================================================================

-- 1. Frameworks Table
CREATE TABLE IF NOT EXISTS compliance_frameworks (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  version VARCHAR(32) NOT NULL,
  authority VARCHAR(64) NOT NULL,
  category VARCHAR(64) NOT NULL,
  description TEXT,
  total_clauses_count INT DEFAULT 0,
  total_controls_count INT DEFAULT 0,
  surveillance_cycle_months INT DEFAULT 12,
  accreditation_required BOOLEAN DEFAULT true,
  statement_of_applicability_mandatory BOOLEAN DEFAULT false,
  status VARCHAR(32) DEFAULT 'ACTIVE',
  domains JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Requirements Table
CREATE TABLE IF NOT EXISTS compliance_requirements (
  id VARCHAR(64) PRIMARY KEY,
  framework_id VARCHAR(64) REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
  framework_code VARCHAR(64) NOT NULL,
  requirement_code VARCHAR(64) NOT NULL,
  parent_requirement_id VARCHAR(64),
  clause_number VARCHAR(32) NOT NULL,
  title VARCHAR(255) NOT NULL,
  requirement_text TEXT NOT NULL,
  type VARCHAR(64) NOT NULL,
  mandatory BOOLEAN DEFAULT true,
  audit_criteria JSONB DEFAULT '[]'::jsonb,
  evidence_guidance TEXT,
  default_monitoring_frequency VARCHAR(32) NOT NULL,
  freshness_sla_days INT DEFAULT 365,
  mapped_control_ids JSONB DEFAULT '[]'::jsonb,
  risk_significance VARCHAR(32) DEFAULT 'HIGH',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_framework_req UNIQUE(framework_code, requirement_code)
);

-- 3. Continuous Controls Table
CREATE TABLE IF NOT EXISTS continuous_controls (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  control_code VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(64) NOT NULL,
  primary_framework_id VARCHAR(64) REFERENCES compliance_frameworks(id),
  clause_or_annex VARCHAR(64) NOT NULL,
  cross_framework_mappings JSONB DEFAULT '[]'::jsonb,
  control_type TEXT[] NOT NULL,
  security_properties TEXT[] NOT NULL,
  cybersecurity_concepts TEXT[] NOT NULL,
  security_domains TEXT[] NOT NULL,
  control_owner VARCHAR(128) NOT NULL,
  responsible_department VARCHAR(128) NOT NULL,
  default_monitoring_frequency VARCHAR(32) NOT NULL,
  evidence_collection_sla_days INT DEFAULT 90,
  is_continuous_monitoring_enabled BOOLEAN DEFAULT true,
  automated_test_capable BOOLEAN DEFAULT false,
  requires_documented_procedure BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_tenant_control UNIQUE(tenant_id, control_code)
);

-- 4. Continuous Evaluations Table
CREATE TABLE IF NOT EXISTS continuous_evaluations (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  control_id VARCHAR(64) REFERENCES continuous_controls(id) ON DELETE CASCADE,
  control_code VARCHAR(64) NOT NULL,
  framework_code VARCHAR(64) NOT NULL,
  overall_status VARCHAR(64) NOT NULL,
  implementation_status VARCHAR(32) NOT NULL,
  operating_effectiveness_status VARCHAR(32) NOT NULL,
  monitoring_frequency VARCHAR(32) NOT NULL,
  last_evaluated_at TIMESTAMPTZ NOT NULL,
  next_evaluation_due_at TIMESTAMPTZ NOT NULL,
  evaluation_cycle_id VARCHAR(64) NOT NULL,
  evaluator_id VARCHAR(128) NOT NULL,
  evaluator_type VARCHAR(64) NOT NULL,
  evidence_freshness_status VARCHAR(32) NOT NULL,
  evidence_ids JSONB DEFAULT '[]'::jsonb,
  automated_test_ids JSONB DEFAULT '[]'::jsonb,
  mapped_risk_ids JSONB DEFAULT '[]'::jsonb,
  mapped_capa_ids JSONB DEFAULT '[]'::jsonb,
  has_active_exception BOOLEAN DEFAULT false,
  exception_details JSONB,
  drift_detected BOOLEAN DEFAULT false,
  drift_reason TEXT,
  telemetry_metrics JSONB DEFAULT '{}'::jsonb,
  evaluation_audit_trail JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Automated Control Tests Table
CREATE TABLE IF NOT EXISTS automated_control_tests (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  control_code VARCHAR(64) NOT NULL,
  control_id VARCHAR(64),
  test_name VARCHAR(255) NOT NULL,
  description TEXT,
  source_system VARCHAR(128) NOT NULL,
  integration_type VARCHAR(64) NOT NULL,
  execution_frequency VARCHAR(32) NOT NULL,
  metric_type VARCHAR(64) NOT NULL,
  threshold_expression TEXT NOT NULL,
  last_executed_at TIMESTAMPTZ NOT NULL,
  next_execution_due_at TIMESTAMPTZ NOT NULL,
  current_status VARCHAR(32) NOT NULL,
  latest_metric_value TEXT NOT NULL,
  latest_threshold TEXT NOT NULL,
  latest_failure_reason TEXT,
  evidence_generated_id VARCHAR(64),
  evidence_generated_sha256 VARCHAR(64),
  test_owner VARCHAR(128) NOT NULL,
  execution_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Continuous Evidence Table
CREATE TABLE IF NOT EXISTS continuous_evidence (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  control_code VARCHAR(64) NOT NULL,
  control_title VARCHAR(255) NOT NULL,
  evidence_title VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size_bytes BIGINT DEFAULT 0,
  mime_type VARCHAR(128) NOT NULL,
  storage_uri VARCHAR(512) NOT NULL,
  department VARCHAR(128) NOT NULL,
  uploaded_by VARCHAR(128) NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL,
  expiry_date TIMESTAMPTZ,
  collection_frequency VARCHAR(32) NOT NULL,
  sla_max_days INT NOT NULL,
  age_in_days INT NOT NULL,
  sla_remaining_days INT NOT NULL,
  freshness_status VARCHAR(32) NOT NULL,
  freshness_score INT NOT NULL,
  sha256_hash CHAR(64) NOT NULL,
  tamper_evident_verified BOOLEAN DEFAULT true,
  digital_signature_id VARCHAR(128),
  annex_a_5_37_compliant BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false,
  verified_by VARCHAR(128),
  verified_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  decay_audit_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Certification Lifecycle Table
CREATE TABLE IF NOT EXISTS certification_lifecycles (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) UNIQUE NOT NULL,
  framework_code VARCHAR(64) NOT NULL,
  standard VARCHAR(64) NOT NULL,
  certification_status VARCHAR(64) NOT NULL,
  certification_body VARCHAR(255) NOT NULL,
  accreditation_body VARCHAR(255) NOT NULL,
  certificate_number VARCHAR(128) NOT NULL,
  scope_statement TEXT NOT NULL,
  physical_sites_included JSONB DEFAULT '[]'::jsonb,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  validity_period_years INT DEFAULT 3,
  surveillance_year1_date DATE NOT NULL,
  surveillance_year1_status VARCHAR(32) NOT NULL,
  surveillance_year2_date DATE NOT NULL,
  surveillance_year2_status VARCHAR(32) NOT NULL,
  recertification_date DATE NOT NULL,
  recertification_status VARCHAR(32) NOT NULL,
  last_internal_audit_date DATE NOT NULL,
  next_internal_audit_date DATE NOT NULL,
  last_management_review_date DATE NOT NULL,
  next_management_review_date DATE NOT NULL,
  lead_auditor_name VARCHAR(128) NOT NULL,
  cb_client_manager VARCHAR(128) NOT NULL,
  certification_conditions JSONB DEFAULT '[]'::jsonb,
  calculated_metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Compliance Drift Events Table
CREATE TABLE IF NOT EXISTS compliance_drift_events (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  framework_code VARCHAR(64) NOT NULL,
  control_code VARCHAR(64) NOT NULL,
  control_title VARCHAR(255) NOT NULL,
  severity VARCHAR(32) NOT NULL,
  drift_type VARCHAR(64) NOT NULL,
  trigger_source VARCHAR(64) NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL,
  root_cause TEXT NOT NULL,
  recommended_action TEXT NOT NULL,
  assigned_owner VARCHAR(128) NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  affected_risk_ids JSONB DEFAULT '[]'::jsonb,
  capa_id VARCHAR(64),
  status VARCHAR(32) DEFAULT 'OPEN',
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by VARCHAR(128),
  audit_trail JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for rapid continuous polling, SLA decay checks, and tenant isolation
CREATE INDEX IF NOT EXISTS idx_controls_tenant ON continuous_controls(tenant_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_tenant_status ON continuous_evaluations(tenant_id, overall_status);
CREATE INDEX IF NOT EXISTS idx_evaluations_drift ON continuous_evaluations(tenant_id, drift_detected);
CREATE INDEX IF NOT EXISTS idx_evidence_tenant_freshness ON continuous_evidence(tenant_id, freshness_status);
CREATE INDEX IF NOT EXISTS idx_evidence_sha256 ON continuous_evidence(sha256_hash);
CREATE INDEX IF NOT EXISTS idx_tests_tenant_status ON automated_control_tests(tenant_id, current_status);
CREATE INDEX IF NOT EXISTS idx_drift_tenant_status ON compliance_drift_events(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_drift_severity ON compliance_drift_events(severity);
`;
