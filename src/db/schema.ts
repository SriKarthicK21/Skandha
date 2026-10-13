// ============================================================================
// SKANDA GRC — Continuous Compliance Monitoring Database Schema & ORM Definition
// Path: src/db/schema.ts
//
// Authoritative SQL & ORM Schema Specification for Continuous Compliance Monitoring.
// Compatible with PostgreSQL 14+, Cloud SQL, Supabase, Neon, AWS Aurora, and Drizzle/Prisma ORMs.
//
// Entities Defined:
// 1. compliance_frameworks      - Authoritative standards (ISO 27001, ISO 27701, SOC 2, MAS TRM)
// 2. compliance_requirements    - Clauses, mandates, audit criteria, evidence guidance, and decay SLAs
// 3. continuous_controls        - Operational controls, cross-framework mappings, ownership, SLAs
// 4. continuous_evaluations     - Telemetry snapshots, operating effectiveness, and audit trails
// 5. automated_control_tests    - CI/CD, cloud, IAM, and SIEM synthetic verification tests
// 6. continuous_evidence        - Cryptographic SHA-256 artifacts, WORM URIs, and decay curves
// 7. certification_lifecycles   - 3-Year post-certification lifecycle, surveillance audits, Cl 9.2/9.3
// 8. compliance_drift_events    - Real-time compliance drift alerts, severity, root causes, CAPA sync
// ============================================================================

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

export type RequirementType =
  | 'MANAGEMENT_SYSTEM_CLAUSE'
  | 'OPERATIONAL_CONTROL'
  | 'STATUTORY_MANDATE'
  | 'CRITERIA_TRUST_SERVICE';

export type ControlCategory = 'Organizational' | 'People' | 'Physical' | 'Technological';
export type ControlType = 'Preventive' | 'Detective' | 'Corrective';
export type SecurityProperty = 'Confidentiality' | 'Integrity' | 'Availability';
export type CybersecurityConcept = 'Identify' | 'Protect' | 'Detect' | 'Respond' | 'Recover';
export type SecurityDomain = 'Governance_and_Ecosystem' | 'Protection' | 'Defense' | 'Resilience';
export type MonitoringFrequency = 'Continuous' | 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual';
export type EvidenceFreshnessRating = 'Fresh' | 'Aging' | 'Stale' | 'Expired' | 'Missing';
export type ContinuousComplianceControlStatus = 'Effective' | 'Operating — Minor Gap' | 'Ineffective — Drift Alert' | 'Pending Verification';
export type AutomatedTestStatus = 'PASSED' | 'FAILED' | 'WARNING' | 'ERROR' | 'QUEUED';
export type DriftSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type DriftType =
  | 'EVIDENCE_EXPIRATION'
  | 'TELEMETRY_FAILURE'
  | 'TEST_ASSERTION_FAILED'
  | 'AUDIT_NONCONFORMITY'
  | 'RISK_THRESHOLD_EXCEEDED'
  | 'MANUAL_DEGRADATION';

// ----------------------------------------------------------------------------
// ORM Field & Column Metadata Descriptors
// ----------------------------------------------------------------------------
export interface ColumnDefinition {
  name: string;
  type: string;
  primaryKey?: boolean;
  nullable?: boolean;
  unique?: boolean;
  references?: { table: string; column: string; onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' };
  defaultValue?: string | number | boolean;
  description: string;
}

export interface TableDefinition {
  tableName: string;
  description: string;
  columns: Record<string, ColumnDefinition>;
  indexes: Array<{ name: string; columns: string[]; unique?: boolean }>;
}

// ----------------------------------------------------------------------------
// 1. FRAMEWORKS TABLE DEFINITION (compliance_frameworks)
// ----------------------------------------------------------------------------
export interface ComplianceFrameworkRecord {
  id: string;
  code: string;
  name: string;
  version: string;
  authority: FrameworkAuthority;
  category: FrameworkCategory;
  description: string | null;
  officialReferenceUrl: string | null;
  totalClausesCount: number;
  totalControlsCount: number;
  surveillanceCycleMonths: number;
  accreditationRequired: boolean;
  statementOfApplicabilityMandatory: boolean;
  status: 'ACTIVE' | 'DRAFT' | 'SUPERSEDED' | 'ARCHIVED';
  applicableJurisdictions: string[];
  supportedCertificationBodies: string[];
  domains: Array<{ id: string; code: string; title: string; description: string; controlCount: number }>;
  createdAt: string;
  updatedAt: string;
}

export const complianceFrameworksTable: TableDefinition = {
  tableName: 'compliance_frameworks',
  description: 'Authoritative regulatory standards, industry benchmarks, and certification frameworks.',
  columns: {
    id: { name: 'id', type: 'VARCHAR(64)', primaryKey: true, nullable: false, description: 'Unique framework identifier (e.g. fw-iso-27001-2022)' },
    code: { name: 'code', type: 'VARCHAR(64)', unique: true, nullable: false, description: 'Standard designation code (e.g. ISO/IEC 27001:2022)' },
    name: { name: 'name', type: 'VARCHAR(255)', nullable: false, description: 'Formal name of the standard or regulation' },
    version: { name: 'version', type: 'VARCHAR(32)', nullable: false, description: 'Edition or revision version (e.g. 2022)' },
    authority: { name: 'authority', type: 'VARCHAR(64)', nullable: false, description: 'Standard publishing body (e.g. ISO_IEC, AICPA, MAS_SINGAPORE)' },
    category: { name: 'category', type: 'VARCHAR(64)', nullable: false, description: 'Domain classification (e.g. INFORMATION_SECURITY, PRIVACY_DATA_PROTECTION)' },
    description: { name: 'description', type: 'TEXT', nullable: true, description: 'Executive summary and scope description' },
    official_reference_url: { name: 'official_reference_url', type: 'VARCHAR(512)', nullable: true, description: 'Official canonical documentation URL' },
    total_clauses_count: { name: 'total_clauses_count', type: 'INT', defaultValue: 0, description: 'Count of mandatory management system clauses (e.g. 7 for ISO Cl 4-10)' },
    total_controls_count: { name: 'total_controls_count', type: 'INT', defaultValue: 0, description: 'Count of operational controls (e.g. 93 for Annex A)' },
    surveillance_cycle_months: { name: 'surveillance_cycle_months', type: 'INT', defaultValue: 12, description: 'Surveillance audit frequency in months (12 months)' },
    accreditation_required: { name: 'accreditation_required', type: 'BOOLEAN', defaultValue: true, description: 'Whether formal accredited certification body audit is required' },
    statement_of_applicability_mandatory: { name: 'statement_of_applicability_mandatory', type: 'BOOLEAN', defaultValue: false, description: 'Requires signed Statement of Applicability (SoA)' },
    status: { name: 'status', type: 'VARCHAR(32)', defaultValue: "'ACTIVE'", description: 'Lifecycle state of standard' },
    applicable_jurisdictions: { name: 'applicable_jurisdictions', type: 'JSONB', defaultValue: "'[]'::jsonb", description: 'Geographical jurisdictions applicable' },
    supported_certification_bodies: { name: 'supported_certification_bodies', type: 'JSONB', defaultValue: "'[]'::jsonb", description: 'Accredited certification registrars' },
    domains: { name: 'domains', type: 'JSONB', defaultValue: "'[]'::jsonb", description: 'Domain taxonomy hierarchy (e.g. A.5, A.6, A.7, A.8)' },
    created_at: { name: 'created_at', type: 'TIMESTAMPTZ', defaultValue: 'NOW()', description: 'Record creation timestamp' },
    updated_at: { name: 'updated_at', type: 'TIMESTAMPTZ', defaultValue: 'NOW()', description: 'Record modification timestamp' }
  },
  indexes: [
    { name: 'idx_fw_code', columns: ['code'], unique: true },
    { name: 'idx_fw_authority_category', columns: ['authority', 'category'] }
  ]
};

// ----------------------------------------------------------------------------
// 2. REQUIREMENTS TABLE DEFINITION (compliance_requirements)
// ----------------------------------------------------------------------------
export interface ComplianceRequirementRecord {
  id: string;
  frameworkId: string;
  frameworkCode: string;
  requirementCode: string;
  parentRequirementId?: string | null;
  clauseNumber: string;
  title: string;
  requirementText: string;
  type: RequirementType;
  mandatory: boolean;
  auditCriteria: string[];
  evidenceGuidance: string | null;
  defaultMonitoringFrequency: MonitoringFrequency;
  freshnessSlaDays: number;
  mappedControlIds: string[];
  riskSignificance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string;
  updatedAt: string;
}

export const complianceRequirementsTable: TableDefinition = {
  tableName: 'compliance_requirements',
  description: 'Individual framework clauses, legal mandates, and audit criteria.',
  columns: {
    id: { name: 'id', type: 'VARCHAR(64)', primaryKey: true, nullable: false, description: 'Unique requirement identifier (e.g. req-iso27001-cl9-2)' },
    framework_id: {
      name: 'framework_id',
      type: 'VARCHAR(64)',
      nullable: false,
      references: { table: 'compliance_frameworks', column: 'id', onDelete: 'CASCADE' },
      description: 'Foreign key to parent framework'
    },
    framework_code: { name: 'framework_code', type: 'VARCHAR(64)', nullable: false, description: 'Denormalized standard code' },
    requirement_code: { name: 'requirement_code', type: 'VARCHAR(64)', nullable: false, description: 'Clause or mandate reference (e.g. Cl.9.2, A.5.15)' },
    parent_requirement_id: { name: 'parent_requirement_id', type: 'VARCHAR(64)', nullable: true, description: 'Hierarchical parent requirement id' },
    clause_number: { name: 'clause_number', type: 'VARCHAR(32)', nullable: false, description: 'Hierarchical clause indexing number' },
    title: { name: 'title', type: 'VARCHAR(255)', nullable: false, description: 'Descriptive title of the requirement' },
    requirement_text: { name: 'requirement_text', type: 'TEXT', nullable: false, description: 'Official verbatim requirement specification' },
    type: { name: 'type', type: 'VARCHAR(64)', nullable: false, description: 'Requirement typology' },
    mandatory: { name: 'mandatory', type: 'BOOLEAN', defaultValue: true, description: 'Whether the clause is mandatory for certification' },
    audit_criteria: { name: 'audit_criteria', type: 'JSONB', defaultValue: "'[]'::jsonb", description: 'Specific verification criteria evaluated during audit' },
    evidence_guidance: { name: 'evidence_guidance', type: 'TEXT', nullable: true, description: 'Concrete evidence artifact expectations' },
    default_monitoring_frequency: { name: 'default_monitoring_frequency', type: 'VARCHAR(32)', nullable: false, description: 'Default cadence for continuous monitoring' },
    freshness_sla_days: { name: 'freshness_sla_days', type: 'INT', defaultValue: 365, description: 'Maximum allowable age of evidence before decay alert' },
    mapped_control_ids: { name: 'mapped_control_ids', type: 'JSONB', defaultValue: "'[]'::jsonb", description: 'Referenced operational control ids' },
    risk_significance: { name: 'risk_significance', type: 'VARCHAR(32)', defaultValue: "'HIGH'", description: 'Risk severity if requirement fails' },
    created_at: { name: 'created_at', type: 'TIMESTAMPTZ', defaultValue: 'NOW()', description: 'Creation timestamp' },
    updated_at: { name: 'updated_at', type: 'TIMESTAMPTZ', defaultValue: 'NOW()', description: 'Last update timestamp' }
  },
  indexes: [
    { name: 'idx_req_framework_req_code', columns: ['framework_code', 'requirement_code'], unique: true },
    { name: 'idx_req_clause', columns: ['clause_number'] },
    { name: 'idx_req_freshness_sla', columns: ['freshness_sla_days'] }
  ]
};

// ----------------------------------------------------------------------------
// 3. CONTROLS TABLE DEFINITION (continuous_controls)
// ----------------------------------------------------------------------------
export interface ContinuousControlRecord {
  id: string;
  tenantId: string;
  controlCode: string;
  title: string;
  description: string | null;
  category: ControlCategory;
  primaryFrameworkId: string;
  clauseOrAnnex: string;
  crossFrameworkMappings: Array<{
    frameworkCode: string;
    mappedControlCode: string;
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
  requiresDocumentedProcedure: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const continuousControlsTable: TableDefinition = {
  tableName: 'continuous_controls',
  description: 'Organizational, technical, and physical controls with continuous telemetry support.',
  columns: {
    id: { name: 'id', type: 'VARCHAR(64)', primaryKey: true, nullable: false, description: 'Unique control identifier (e.g. ctrl-a-5-15)' },
    tenant_id: { name: 'tenant_id', type: 'VARCHAR(64)', nullable: false, description: 'Multi-tenant isolation identifier' },
    control_code: { name: 'control_code', type: 'VARCHAR(64)', nullable: false, description: 'Control code (e.g. A.5.15, A.8.8, Cl.9.2)' },
    title: { name: 'title', type: 'VARCHAR(255)', nullable: false, description: 'Control objective title' },
    description: { name: 'description', type: 'TEXT', nullable: true, description: 'Operational control procedure description' },
    category: { name: 'category', type: 'VARCHAR(64)', nullable: false, description: 'ISO 27001:2022 theme (Organizational, People, Physical, Technological)' },
    primary_framework_id: {
      name: 'primary_framework_id',
      type: 'VARCHAR(64)',
      nullable: false,
      references: { table: 'compliance_frameworks', column: 'id' },
      description: 'Primary baseline framework'
    },
    clause_or_annex: { name: 'clause_or_annex', type: 'VARCHAR(64)', nullable: false, description: 'Section tag (e.g. Clause 9 or Annex A.5)' },
    cross_framework_mappings: { name: 'cross_framework_mappings', type: 'JSONB', defaultValue: "'[]'::jsonb", description: 'SOC 2, MAS TRM, NIST crosswalk definitions' },
    control_type: { name: 'control_type', type: 'TEXT[]', nullable: false, description: 'Array: Preventive, Detective, Corrective' },
    security_properties: { name: 'security_properties', type: 'TEXT[]', nullable: false, description: 'Confidentiality, Integrity, Availability attributes' },
    cybersecurity_concepts: { name: 'cybersecurity_concepts', type: 'TEXT[]', nullable: false, description: 'NIST CSF concepts (Identify, Protect, Detect, Respond, Recover)' },
    security_domains: { name: 'security_domains', type: 'TEXT[]', nullable: false, description: 'ISO/IEC 27002 domain categorizations' },
    control_owner: { name: 'control_owner', type: 'VARCHAR(128)', nullable: false, description: 'Responsible role or officer title' },
    responsible_department: { name: 'responsible_department', type: 'VARCHAR(128)', nullable: false, description: 'Operational unit accountable for execution' },
    default_monitoring_frequency: { name: 'default_monitoring_frequency', type: 'VARCHAR(32)', nullable: false, description: 'Monitoring cadence' },
    evidence_collection_sla_days: { name: 'evidence_collection_sla_days', type: 'INT', defaultValue: 90, description: 'SLA freshness maximum window in days' },
    is_continuous_monitoring_enabled: { name: 'is_continuous_monitoring_enabled', type: 'BOOLEAN', defaultValue: true, description: 'Daemon polling & synthetic test flag' },
    automated_test_capable: { name: 'automated_test_capable', type: 'BOOLEAN', defaultValue: false, description: 'Supports automated API/daemon telemetry evaluation' },
    requires_documented_procedure: { name: 'requires_documented_procedure', type: 'BOOLEAN', defaultValue: true, description: 'ISO 27001 Annex A 5.37 documented operating procedure check' },
    tags: { name: 'tags', type: 'TEXT[]', defaultValue: "'{}'::text[]", description: 'Categorization tags' },
    created_at: { name: 'created_at', type: 'TIMESTAMPTZ', defaultValue: 'NOW()', description: 'Record creation timestamp' },
    updated_at: { name: 'updated_at', type: 'TIMESTAMPTZ', defaultValue: 'NOW()', description: 'Record modification timestamp' }
  },
  indexes: [
    { name: 'idx_controls_tenant_code', columns: ['tenant_id', 'control_code'], unique: true },
    { name: 'idx_controls_category', columns: ['category'] },
    { name: 'idx_controls_continuous', columns: ['tenant_id', 'is_continuous_monitoring_enabled'] }
  ]
};

// ----------------------------------------------------------------------------
// 4. EVALUATIONS TABLE DEFINITION (continuous_evaluations)
// ----------------------------------------------------------------------------
export interface ContinuousEvaluationRecord {
  id: string;
  tenantId: string;
  controlId: string;
  controlCode: string;
  frameworkCode: string;
  overallStatus: ContinuousComplianceControlStatus;
  implementationStatus: 'Not Started' | 'In Progress' | 'Implemented';
  operatingEffectivenessStatus: 'Effective' | 'Ineffective' | 'Pending Verification';
  monitoringFrequency: MonitoringFrequency;
  lastEvaluatedAt: string;
  nextEvaluationDueAt: string;
  evaluationCycleId: string;
  evaluatorId: string;
  evaluatorType: 'AUTOMATED_DAEMON' | 'INTERNAL_AUDITOR' | 'EXTERNAL_ASSESSOR' | 'DEVSECOPS_PIPELINE';
  evidenceFreshnessStatus: EvidenceFreshnessRating;
  evidenceIds: string[];
  automatedTestIds: string[];
  mappedRiskIds: string[];
  mappedCapaIds: string[];
  hasActiveException: boolean;
  exceptionDetails?: Record<string, unknown>;
  driftDetected: boolean;
  driftReason?: string | null;
  telemetryMetrics: {
    automatedTestsPassedCount: number;
    automatedTestsFailedCount: number;
    evidenceFreshnessScore: number;
    slaCompliancePercentage: number;
  };
  evaluationAuditTrail: Array<Record<string, unknown>>;
  createdAt: string;
  updatedAt: string;
}

export const continuousEvaluationsTable: TableDefinition = {
  tableName: 'continuous_evaluations',
  description: 'Point-in-time and continuous evaluation snapshots of control operating effectiveness.',
  columns: {
    id: { name: 'id', type: 'VARCHAR(64)', primaryKey: true, nullable: false, description: 'Evaluation snapshot identifier' },
    tenant_id: { name: 'tenant_id', type: 'VARCHAR(64)', nullable: false, description: 'Multi-tenant isolation id' },
    control_id: {
      name: 'control_id',
      type: 'VARCHAR(64)',
      nullable: false,
      references: { table: 'continuous_controls', column: 'id', onDelete: 'CASCADE' },
      description: 'Foreign key to control definition'
    },
    control_code: { name: 'control_code', type: 'VARCHAR(64)', nullable: false, description: 'Denormalized control code' },
    framework_code: { name: 'framework_code', type: 'VARCHAR(64)', nullable: false, description: 'Evaluated framework reference' },
    overall_status: { name: 'overall_status', type: 'VARCHAR(64)', nullable: false, description: 'Composite operational compliance status' },
    implementation_status: { name: 'implementation_status', type: 'VARCHAR(32)', nullable: false, description: 'Design implementation state' },
    operating_effectiveness_status: { name: 'operating_effectiveness_status', type: 'VARCHAR(32)', nullable: false, description: 'Audit-grade operational effectiveness' },
    monitoring_frequency: { name: 'monitoring_frequency', type: 'VARCHAR(32)', nullable: false, description: 'Evaluation sweep interval' },
    last_evaluated_at: { name: 'last_evaluated_at', type: 'TIMESTAMPTZ', nullable: false, description: 'Timestamp of last evaluation run' },
    next_evaluation_due_at: { name: 'next_evaluation_due_at', type: 'TIMESTAMPTZ', nullable: false, description: 'Deadline for next verification sweep' },
    evaluation_cycle_id: { name: 'evaluation_cycle_id', type: 'VARCHAR(64)', nullable: false, description: 'Audit or continuous run cycle batch id' },
    evaluator_id: { name: 'evaluator_id', type: 'VARCHAR(128)', nullable: false, description: 'Daemon or auditor identity' },
    evaluator_type: { name: 'evaluator_type', type: 'VARCHAR(64)', nullable: false, description: 'Automation daemon or manual auditor' },
    evidence_freshness_status: { name: 'evidence_freshness_status', type: 'VARCHAR(32)', nullable: false, description: 'Fresh, Aging, Stale, Expired, Missing' },
    evidence_ids: { name: 'evidence_ids', type: 'JSONB', defaultValue: "'[]'::jsonb", description: 'Referenced evidence primary keys' },
    automated_test_ids: { name: 'automated_test_ids', type: 'JSONB', defaultValue: "'[]'::jsonb", description: 'Referenced automated test suite runs' },
    mapped_risk_ids: { name: 'mapped_risk_ids', type: 'JSONB', defaultValue: "'[]'::jsonb", description: 'Associated enterprise risk register IDs' },
    mapped_capa_ids: { name: 'mapped_capa_ids', type: 'JSONB', defaultValue: "'[]'::jsonb", description: 'Linked corrective/preventive actions' },
    has_active_exception: { name: 'has_active_exception', type: 'BOOLEAN', defaultValue: false, description: 'Whether active risk waiver or exception exists' },
    exception_details: { name: 'exception_details', type: 'JSONB', nullable: true, description: 'Exception rationale and compensating controls' },
    drift_detected: { name: 'drift_detected', type: 'BOOLEAN', defaultValue: false, description: 'Flag indicating active compliance drift' },
    drift_reason: { name: 'drift_reason', type: 'TEXT', nullable: true, description: 'Root cause narrative for drift trigger' },
    telemetry_metrics: { name: 'telemetry_metrics', type: 'JSONB', defaultValue: "'{}'::jsonb", description: 'Numeric pass/fail metrics and SLA stats' },
    evaluation_audit_trail: { name: 'evaluation_audit_trail', type: 'JSONB', defaultValue: "'[]'::jsonb", description: 'Immutable log of evaluation transitions' },
    created_at: { name: 'created_at', type: 'TIMESTAMPTZ', defaultValue: 'NOW()', description: 'Creation timestamp' },
    updated_at: { name: 'updated_at', type: 'TIMESTAMPTZ', defaultValue: 'NOW()', description: 'Modification timestamp' }
  },
  indexes: [
    { name: 'idx_eval_tenant_status', columns: ['tenant_id', 'overall_status'] },
    { name: 'idx_eval_drift', columns: ['tenant_id', 'drift_detected'] },
    { name: 'idx_eval_control', columns: ['control_id'] }
  ]
};

// ----------------------------------------------------------------------------
// 5. AUTOMATED TESTS TABLE DEFINITION (automated_control_tests)
// ----------------------------------------------------------------------------
export interface AutomatedControlTestRecord {
  id: string;
  tenantId: string;
  controlCode: string;
  controlId?: string | null;
  testName: string;
  description: string | null;
  sourceSystem: string;
  integrationType: 'API_POLLER' | 'WEBHOOK' | 'GITHUB_ACTION' | 'SIEM_COLLECTOR' | 'AGENT_HEARTBEAT';
  executionFrequency: MonitoringFrequency;
  metricType: 'BOOLEAN_FLAG' | 'PERCENTAGE_COMPLIANCE' | 'THRESHOLD_COUNT' | 'TIME_DURATION_MS' | 'IMMUTABILITY_PROOF';
  thresholdExpression: string;
  lastExecutedAt: string;
  nextExecutionDueAt: string;
  currentStatus: AutomatedTestStatus;
  latestMetricValue: string;
  latestThreshold: string;
  latestFailureReason?: string | null;
  evidenceGeneratedId?: string | null;
  evidenceGeneratedSha256?: string | null;
  testOwner: string;
  executionHistory: Array<Record<string, unknown>>;
  createdAt: string;
  updatedAt: string;
}

export const automatedControlTestsTable: TableDefinition = {
  tableName: 'automated_control_tests',
  description: 'Synthetic tests, cloud telemetry verifiers, and IAM/SIEM check runners.',
  columns: {
    id: { name: 'id', type: 'VARCHAR(64)', primaryKey: true, nullable: false, description: 'Test specification identifier' },
    tenant_id: { name: 'tenant_id', type: 'VARCHAR(64)', nullable: false, description: 'Multi-tenant isolation id' },
    control_code: { name: 'control_code', type: 'VARCHAR(64)', nullable: false, description: 'Target control code (e.g. A.5.17, A.8.8)' },
    control_id: { name: 'control_id', type: 'VARCHAR(64)', nullable: true, description: 'Foreign key to continuous_controls' },
    test_name: { name: 'test_name', type: 'VARCHAR(255)', nullable: false, description: 'Automated test suite designation' },
    description: { name: 'description', type: 'TEXT', nullable: true, description: 'Assertion criteria and execution methodology' },
    source_system: { name: 'source_system', type: 'VARCHAR(128)', nullable: false, description: 'Upstream telemetry provider (e.g. Okta, AWS IAM, Trivy)' },
    integration_type: { name: 'integration_type', type: 'VARCHAR(64)', nullable: false, description: 'Ingress pattern (API_POLLER, WEBHOOK, GITHUB_ACTION)' },
    execution_frequency: { name: 'execution_frequency', type: 'VARCHAR(32)', nullable: false, description: 'Test cadence' },
    metric_type: { name: 'metric_type', type: 'VARCHAR(64)', nullable: false, description: 'Type of assertion measurement' },
    threshold_expression: { name: 'threshold_expression', type: 'TEXT', nullable: false, description: 'Mathematical or boolean pass/fail assertion' },
    last_executed_at: { name: 'last_executed_at', type: 'TIMESTAMPTZ', nullable: false, description: 'Last run execution timestamp' },
    next_execution_due_at: { name: 'next_execution_due_at', type: 'TIMESTAMPTZ', nullable: false, description: 'Scheduled next execution timestamp' },
    current_status: { name: 'current_status', type: 'VARCHAR(32)', nullable: false, description: 'Execution result: PASSED, FAILED, WARNING, ERROR' },
    latest_metric_value: { name: 'latest_metric_value', type: 'TEXT', nullable: false, description: 'Sampled telemetry metric output' },
    latest_threshold: { name: 'latest_threshold', type: 'TEXT', nullable: false, description: 'Target passing threshold' },
    latest_failure_reason: { name: 'latest_failure_reason', type: 'TEXT', nullable: true, description: 'Exception or failure diagnosis' },
    evidence_generated_id: { name: 'evidence_generated_id', type: 'VARCHAR(64)', nullable: true, description: 'Auto-generated evidence artifact PK' },
    evidence_generated_sha256: { name: 'evidence_generated_sha256', type: 'VARCHAR(64)', nullable: true, description: 'Cryptographic hash of test artifact' },
    test_owner: { name: 'test_owner', type: 'VARCHAR(128)', nullable: false, description: 'SecOps / Engineering owner' },
    execution_history: { name: 'execution_history', type: 'JSONB', defaultValue: "'[]'::jsonb", description: 'Execution latency, status, and assertion logs' },
    created_at: { name: 'created_at', type: 'TIMESTAMPTZ', defaultValue: 'NOW()', description: 'Creation timestamp' },
    updated_at: { name: 'updated_at', type: 'TIMESTAMPTZ', defaultValue: 'NOW()', description: 'Update timestamp' }
  },
  indexes: [
    { name: 'idx_tests_tenant_status', columns: ['tenant_id', 'current_status'] },
    { name: 'idx_tests_control_code', columns: ['control_code'] }
  ]
};

// ----------------------------------------------------------------------------
// 6. EVIDENCE TABLE DEFINITION (continuous_evidence)
// ----------------------------------------------------------------------------
export interface ContinuousEvidenceRecord {
  id: string;
  tenantId: string;
  controlCode: string;
  controlTitle: string;
  evidenceTitle: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  storageUri: string;
  department: string;
  uploadedBy: string;
  uploadedAt: string;
  expiryDate?: string | null;
  collectionFrequency: MonitoringFrequency;
  slaMaxDays: number;
  ageInDays: number;
  slaRemainingDays: number;
  freshnessStatus: EvidenceFreshnessRating;
  freshnessScore: number;
  sha256Hash: string;
  tamperEvidentVerified: boolean;
  digitalSignatureId?: string | null;
  annexA537Compliant: boolean;
  verified: boolean;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  tags: string[];
  decayAuditHistory: Array<Record<string, unknown>>;
  createdAt: string;
  updatedAt: string;
}

export const continuousEvidenceTable: TableDefinition = {
  tableName: 'continuous_evidence',
  description: 'Immutable evidence repository with SHA-256 cryptographic verification and SLA decay tracking.',
  columns: {
    id: { name: 'id', type: 'VARCHAR(64)', primaryKey: true, nullable: false, description: 'Unique evidence artifact identifier' },
    tenant_id: { name: 'tenant_id', type: 'VARCHAR(64)', nullable: false, description: 'Multi-tenant isolation id' },
    control_code: { name: 'control_code', type: 'VARCHAR(64)', nullable: false, description: 'Associated control code' },
    control_title: { name: 'control_title', type: 'VARCHAR(255)', nullable: false, description: 'Denormalized control title' },
    evidence_title: { name: 'evidence_title', type: 'VARCHAR(255)', nullable: false, description: 'Human-readable evidence name' },
    file_name: { name: 'file_name', type: 'VARCHAR(255)', nullable: false, description: 'Original uploaded or generated filename' },
    file_size_bytes: { name: 'file_size_bytes', type: 'BIGINT', defaultValue: 0, description: 'Artifact size in bytes' },
    mime_type: { name: 'mime_type', type: 'VARCHAR(128)', nullable: false, description: 'Standard MIME media type' },
    storage_uri: { name: 'storage_uri', type: 'VARCHAR(512)', nullable: false, description: 'WORM immutable vault or cloud storage URI' },
    department: { name: 'department', type: 'VARCHAR(128)', nullable: false, description: 'Originating business or engineering unit' },
    uploaded_by: { name: 'uploaded_by', type: 'VARCHAR(128)', nullable: false, description: 'Uploader identity or automated collector daemon' },
    uploaded_at: { name: 'uploaded_at', type: 'TIMESTAMPTZ', nullable: false, description: 'Timestamp evidence was archived' },
    expiry_date: { name: 'expiry_date', type: 'TIMESTAMPTZ', nullable: true, description: 'Hard expiration date' },
    collection_frequency: { name: 'collection_frequency', type: 'VARCHAR(32)', nullable: false, description: 'Frequency at which fresh evidence is required' },
    sla_max_days: { name: 'sla_max_days', type: 'INT', nullable: false, description: 'Freshness SLA threshold limit in days' },
    age_in_days: { name: 'age_in_days', type: 'INT', nullable: false, description: 'Elapsed days since archival' },
    sla_remaining_days: { name: 'sla_remaining_days', type: 'INT', nullable: false, description: 'Days remaining before SLA decay violation' },
    freshness_status: { name: 'freshness_status', type: 'VARCHAR(32)', nullable: false, description: 'Fresh, Aging, Stale, Expired, Missing' },
    freshness_score: { name: 'freshness_score', type: 'INT', nullable: false, description: '0 to 100 freshness decay mathematical score' },
    sha256_hash: { name: 'sha256_hash', type: 'CHAR(64)', nullable: false, description: 'Cryptographic SHA-256 integrity hash' },
    tamper_evident_verified: { name: 'tamper_evident_verified', type: 'BOOLEAN', defaultValue: true, description: 'WORM object lock & hash integrity verification' },
    digital_signature_id: { name: 'digital_signature_id', type: 'VARCHAR(128)', nullable: true, description: 'KMS asymmetric digital signature ID' },
    annex_a_5_37_compliant: { name: 'annex_a_5_37_compliant', type: 'BOOLEAN', defaultValue: true, description: 'ISO 27001 Annex A 5.37 documented operating procedure confirmation' },
    verified: { name: 'verified', type: 'BOOLEAN', defaultValue: false, description: 'Auditor verification status' },
    verified_by: { name: 'verified_by', type: 'VARCHAR(128)', nullable: true, description: 'Auditor or reviewer signoff' },
    verified_at: { name: 'verified_at', type: 'TIMESTAMPTZ', nullable: true, description: 'Signoff timestamp' },
    tags: { name: 'tags', type: 'TEXT[]', defaultValue: "'{}'::text[]", description: 'Search and audit binder tags' },
    decay_audit_history: { name: 'decay_audit_history', type: 'JSONB', defaultValue: "'[]'::jsonb", description: 'Periodic decay evaluation curves' },
    created_at: { name: 'created_at', type: 'TIMESTAMPTZ', defaultValue: 'NOW()', description: 'Creation timestamp' },
    updated_at: { name: 'updated_at', type: 'TIMESTAMPTZ', defaultValue: 'NOW()', description: 'Update timestamp' }
  },
  indexes: [
    { name: 'idx_evidence_tenant_freshness', columns: ['tenant_id', 'freshness_status'] },
    { name: 'idx_evidence_sha256', columns: ['sha256_hash'] },
    { name: 'idx_evidence_control', columns: ['control_code'] }
  ]
};

// ----------------------------------------------------------------------------
// 7. CERTIFICATION LIFECYCLE TABLE DEFINITION (certification_lifecycles)
// ----------------------------------------------------------------------------
export interface CertificationLifecycleRecord {
  id: string;
  tenantId: string;
  frameworkCode: string;
  standard: 'ISO/IEC 27001:2022';
  certificationStatus:
    | 'Certified — Active'
    | 'Under Surveillance'
    | 'Recertification Pending'
    | 'Pre-Certification Readiness'
    | 'Suspended';
  certificationBody: string;
  accreditationBody: string;
  certificateNumber: string;
  scopeStatement: string;
  physicalSitesIncluded: string[];
  issueDate: string;
  expiryDate: string;
  validityPeriodYears: number;
  surveillanceYear1Date: string;
  surveillanceYear1Status: 'Scheduled' | 'Fieldwork' | 'Passed' | 'Overdue' | 'Pending';
  surveillanceYear2Date: string;
  surveillanceYear2Status: 'Scheduled' | 'Fieldwork' | 'Passed' | 'Overdue' | 'Pending';
  recertificationDate: string;
  recertificationStatus: 'Planned' | 'Pending';
  lastInternalAuditDate: string;
  nextInternalAuditDate: string;
  lastManagementReviewDate: string;
  nextManagementReviewDate: string;
  leadAuditorName: string;
  cbClientManager: string;
  certificationConditions: string[];
  calculatedMetrics: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export const certificationLifecyclesTable: TableDefinition = {
  tableName: 'certification_lifecycles',
  description: 'Tracks the mandatory 3-year accredited ISO/IEC 27001 lifecycle, Surveillance Year 1 & 2, and management reviews.',
  columns: {
    id: { name: 'id', type: 'VARCHAR(64)', primaryKey: true, nullable: false, description: 'Certificate tracking identifier' },
    tenant_id: { name: 'tenant_id', type: 'VARCHAR(64)', unique: true, nullable: false, description: 'Multi-tenant isolation id' },
    framework_code: { name: 'framework_code', type: 'VARCHAR(64)', nullable: false, description: 'Framework reference (e.g. ISO/IEC 27001:2022)' },
    standard: { name: 'standard', type: 'VARCHAR(64)', nullable: false, description: 'Accredited standard designation' },
    certification_status: { name: 'certification_status', type: 'VARCHAR(64)', nullable: false, description: 'Certified — Active, Under Surveillance, etc.' },
    certification_body: { name: 'certification_body', type: 'VARCHAR(255)', nullable: false, description: 'Accredited registrar (BSI, TUV, DNV, Bureau Veritas)' },
    accreditation_body: { name: 'accreditation_body', type: 'VARCHAR(255)', nullable: false, description: 'National accreditation authority (UKAS, ANAB, DAkkS)' },
    certificate_number: { name: 'certificate_number', type: 'VARCHAR(128)', nullable: false, description: 'Formal certificate registration string' },
    scope_statement: { name: 'scope_statement', type: 'TEXT', nullable: false, description: 'Audited ISMS boundary and scope' },
    physical_sites_included: { name: 'physical_sites_included', type: 'JSONB', defaultValue: "'[]'::jsonb", description: 'Audited facility and datacenter sites' },
    issue_date: { name: 'issue_date', type: 'DATE', nullable: false, description: 'Initial or recertification grant date' },
    expiry_date: { name: 'expiry_date', type: 'DATE', nullable: false, description: '3-year expiration deadline' },
    validity_period_years: { name: 'validity_period_years', type: 'INT', defaultValue: 3, description: 'Standard 3-year ISO cycle' },
    surveillance_year1_date: { name: 'surveillance_year1_date', type: 'DATE', nullable: false, description: 'Surveillance Year 1 target audit date' },
    surveillance_year1_status: { name: 'surveillance_year1_status', type: 'VARCHAR(32)', nullable: false, description: 'Scheduled, Fieldwork, Passed, Overdue' },
    surveillance_year2_date: { name: 'surveillance_year2_date', type: 'DATE', nullable: false, description: 'Surveillance Year 2 target audit date' },
    surveillance_year2_status: { name: 'surveillance_year2_status', type: 'VARCHAR(32)', nullable: false, description: 'Scheduled, Fieldwork, Passed, Overdue' },
    recertification_date: { name: 'recertification_date', type: 'DATE', nullable: false, description: 'Triennial recertification audit deadline' },
    recertification_status: { name: 'recertification_status', type: 'VARCHAR(32)', nullable: false, description: 'Planned, Pending' },
    last_internal_audit_date: { name: 'last_internal_audit_date', type: 'DATE', nullable: false, description: 'ISO Cl. 9.2 internal audit date' },
    next_internal_audit_date: { name: 'next_internal_audit_date', type: 'DATE', nullable: false, description: 'Next internal audit mandatory deadline' },
    last_management_review_date: { name: 'last_management_review_date', type: 'DATE', nullable: false, description: 'ISO Cl. 9.3 management review date' },
    next_management_review_date: { name: 'next_management_review_date', type: 'DATE', nullable: false, description: 'Next management review mandatory deadline' },
    lead_auditor_name: { name: 'lead_auditor_name', type: 'VARCHAR(128)', nullable: false, description: 'External lead auditor from registrar' },
    cb_client_manager: { name: 'cb_client_manager', type: 'VARCHAR(128)', nullable: false, description: 'Registrar client account manager' },
    certification_conditions: { name: 'certification_conditions', type: 'JSONB', defaultValue: "'[]'::jsonb", description: 'Registrar observations and conditions' },
    calculated_metrics: { name: 'calculated_metrics', type: 'JSONB', defaultValue: "'{}'::jsonb", description: 'Continuous countdown days and risk indicators' },
    created_at: { name: 'created_at', type: 'TIMESTAMPTZ', defaultValue: 'NOW()', description: 'Creation timestamp' },
    updated_at: { name: 'updated_at', type: 'TIMESTAMPTZ', defaultValue: 'NOW()', description: 'Update timestamp' }
  },
  indexes: [
    { name: 'idx_cert_tenant', columns: ['tenant_id'], unique: true },
    { name: 'idx_cert_status', columns: ['certification_status'] }
  ]
};

// ----------------------------------------------------------------------------
// 8. DRIFT DETECTION EVENTS TABLE DEFINITION (compliance_drift_events)
// ----------------------------------------------------------------------------
export interface ComplianceDriftEventRecord {
  id: string;
  tenantId: string;
  frameworkCode: string;
  controlCode: string;
  controlTitle: string;
  severity: DriftSeverity;
  driftType: DriftType;
  triggerSource: 'DAEMON_POLL_SWEEP' | 'AUTOMATED_TEST_RUNNER' | 'EVIDENCE_DECAY_EVALUATOR' | 'SCHEDULED_JOB' | 'MANUAL_AUDIT_FINDING';
  detectedAt: string;
  rootCause: string;
  recommendedAction: string;
  assignedOwner: string;
  dueDate: string;
  affectedRiskIds: string[];
  capaId?: string | null;
  status: 'OPEN' | 'IN_REMEDIATION' | 'VERIFICATION_PENDING' | 'RESOLVED' | 'EXCEPTION_GRANTED';
  resolutionNotes?: string | null;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  auditTrail: Array<Record<string, unknown>>;
  createdAt: string;
  updatedAt: string;
}

export const complianceDriftEventsTable: TableDefinition = {
  tableName: 'compliance_drift_events',
  description: 'Real-time telemetry anomalies, SLA decay breaches, and automated test failure events.',
  columns: {
    id: { name: 'id', type: 'VARCHAR(64)', primaryKey: true, nullable: false, description: 'Unique drift incident key (e.g. DRIFT-2026-9478)' },
    tenant_id: { name: 'tenant_id', type: 'VARCHAR(64)', nullable: false, description: 'Multi-tenant isolation id' },
    framework_code: { name: 'framework_code', type: 'VARCHAR(64)', nullable: false, description: 'Impacted framework code' },
    control_code: { name: 'control_code', type: 'VARCHAR(64)', nullable: false, description: 'Impacted control code' },
    control_title: { name: 'control_title', type: 'VARCHAR(255)', nullable: false, description: 'Control title narrative' },
    severity: { name: 'severity', type: 'VARCHAR(32)', nullable: false, description: 'CRITICAL, HIGH, MEDIUM, LOW' },
    drift_type: { name: 'drift_type', type: 'VARCHAR(64)', nullable: false, description: 'Typology of drift event' },
    trigger_source: { name: 'trigger_source', type: 'VARCHAR(64)', nullable: false, description: 'Autonomous detection engine or test runner' },
    detected_at: { name: 'detected_at', type: 'TIMESTAMPTZ', nullable: false, description: 'Event timestamp' },
    root_cause: { name: 'root_cause', type: 'TEXT', nullable: false, description: 'Technical explanation of failure or decay' },
    recommended_action: { name: 'recommended_action', type: 'TEXT', nullable: false, description: 'SOP or engineering remediation recommendation' },
    assigned_owner: { name: 'assigned_owner', type: 'VARCHAR(128)', nullable: false, description: 'Individual or team responsible for fix' },
    due_date: { name: 'due_date', type: 'TIMESTAMPTZ', nullable: false, description: 'Remediation SLA deadline' },
    affected_risk_ids: { name: 'affected_risk_ids', type: 'JSONB', defaultValue: "'[]'::jsonb", description: 'Affected risk register items' },
    capa_id: { name: 'capa_id', type: 'VARCHAR(64)', nullable: true, description: 'Link to Corrective & Preventive Action register' },
    status: { name: 'status', type: 'VARCHAR(32)', defaultValue: "'OPEN'", description: 'OPEN, IN_REMEDIATION, VERIFICATION_PENDING, RESOLVED' },
    resolution_notes: { name: 'resolution_notes', type: 'TEXT', nullable: true, description: 'Signoff narrative and mitigation notes' },
    resolved_at: { name: 'resolved_at', type: 'TIMESTAMPTZ', nullable: true, description: 'Closure timestamp' },
    resolved_by: { name: 'resolved_by', type: 'VARCHAR(128)', nullable: true, description: 'Verifier or compliance officer identity' },
    audit_trail: { name: 'audit_trail', type: 'JSONB', defaultValue: "'[]'::jsonb", description: 'Status transitions and history' },
    created_at: { name: 'created_at', type: 'TIMESTAMPTZ', defaultValue: 'NOW()', description: 'Creation timestamp' },
    updated_at: { name: 'updated_at', type: 'TIMESTAMPTZ', defaultValue: 'NOW()', description: 'Update timestamp' }
  },
  indexes: [
    { name: 'idx_drift_tenant_status', columns: ['tenant_id', 'status'] },
    { name: 'idx_drift_severity', columns: ['severity'] },
    { name: 'idx_drift_control', columns: ['control_code'] }
  ]
};

// ----------------------------------------------------------------------------
// UNIFIED ORM SCHEMA REGISTRY
// ----------------------------------------------------------------------------
export const CONTINUOUS_COMPLIANCE_ORM_SCHEMA = {
  complianceFrameworks: complianceFrameworksTable,
  complianceRequirements: complianceRequirementsTable,
  continuousControls: continuousControlsTable,
  continuousEvaluations: continuousEvaluationsTable,
  automatedControlTests: automatedControlTestsTable,
  continuousEvidence: continuousEvidenceTable,
  certificationLifecycles: certificationLifecyclesTable,
  complianceDriftEvents: complianceDriftEventsTable
};
