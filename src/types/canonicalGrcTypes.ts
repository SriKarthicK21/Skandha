/**
 * SKANDA CANONICAL GRC DOMAIN MODEL
 * Path: src/types/canonicalGrcTypes.ts
 * 
 * Enterprise Canonical Architecture:
 * 1. Enterprise Hierarchy: Tenant -> Organization -> Business Unit -> Process
 * 2. Compliance Programs: ComplianceProgram -> Frameworks -> Requirements -> Controls
 * 3. Control Decoupling: Global ControlDefinition ≠ Tenant ControlImplementation
 * 4. Control Testing Domain: ControlTest (Pass/Partial/Fail/Not Tested) -> ControlEffectiveness
 * 5. Evidence Traceability Chain: Evidence -> EvidenceAssertion -> ControlTest -> Control -> Requirement -> Framework -> Program
 * 6. Universal Workflow Engine: WorkflowInstance, WorkflowTask, Steps, SLAs, Approvals
 * 7. Exception Management: GrcException (Draft -> Submitted -> Approved -> Expired -> Closed)
 * 8. Personal Operational Hub: MyWorkQueue
 * 9. Domain Event System: DomainEvent
 */

import { StandardFrameworkCode } from './grcCoreTypes';

// ============================================================================
// 1. COMPLIANCE PROGRAM (First-Class Canonical Entity)
// ============================================================================

export type ComplianceProgramType =
  | 'INFORMATION_SECURITY'
  | 'PRIVACY_DATA_PROTECTION'
  | 'AI_GOVERNANCE'
  | 'TECHNOLOGY_RISK_FINTECH'
  | 'BUSINESS_RESILIENCE'
  | 'ENTERPRISE_INTEGRATED';

export interface ComplianceProgram {
  id: string;
  tenantId: string;
  code: string; // e.g. "PROG-SEC-01", "PROG-PRV-01"
  name: string; // e.g. "Enterprise Information Security Program"
  type: ComplianceProgramType;
  description: string;
  executiveSponsor: string; // e.g. "Chief Information Security Officer"
  programLead: string; // e.g. "Head of GRC"
  frameworkCodes: (StandardFrameworkCode | string)[]; // e.g. ["ISO_27001_2022", "SOC_2_TYPE_2", "NIST_CSF_2_0"]
  businessUnitIds: string[];
  status: 'ACTIVE' | 'DRAFT' | 'UNDER_REVIEW' | 'ARCHIVED';
  targetCertificationDate?: string;
  nextAuditDate?: string;
  
  // Computed Program Posture (Data Lineage)
  metrics: {
    totalRequirements: number;
    implementedControlsCount: number;
    testedControlsCount: number;
    effectiveControlsCount: number;
    deficientControlsCount: number;
    evidenceCoveragePercent: number;
    openFindingsCount: number;
    activeExceptionsCount: number;
    overallReadinessPercent: number;
  };
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 2. CONTROL DEFINITION vs CONTROL IMPLEMENTATION DECOUPLING
// ============================================================================

/**
 * GLOBAL CANONICAL CONTROL DEFINITION
 * Independent from tenant and framework instances
 */
export interface GlobalControlDefinition {
  id: string; // e.g. "CTRL-DEF-088"
  code: string; // e.g. "CTRL-088"
  title: string; // e.g. "Privileged Access Management & Just-In-Time Escalation"
  description: string;
  category: 'ACCESS_CONTROL' | 'CRYPTOGRAPHY' | 'INFRASTRUCTURE' | 'INCIDENT_RESPONSE' | 'GOVERNANCE' | 'PRIVACY' | 'AI_SAFETY' | 'THIRD_PARTY' | 'BUSINESS_CONTINUITY';
  type: 'PREVENTIVE' | 'DETECTIVE' | 'CORRECTIVE' | 'DIRECTIVE';
  standardTestingProcedure: string;
  defaultTestingFrequency: 'CONTINUOUS' | 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';
  frameworkMappings: Array<{
    frameworkCode: string;
    requirementCode: string;
    mappingType: 'DIRECT_SATISFACTION' | 'PARTIAL_CONTRIBUTION' | 'COMPENSATING';
  }>;
}

/**
 * TENANT OPERATIONAL CONTROL IMPLEMENTATION
 * Specific to a tenant's infrastructure, owner, and operational environment
 */
export interface TenantControlImplementation {
  id: string; // e.g. "CTRL-088-ACME-PROD"
  tenantId: string;
  controlDefinitionId: string; // Reference to GlobalControlDefinition.id
  controlCode: string; // e.g. "CTRL-088"
  title: string;
  owner: string; // e.g. "Director of IAM (Sarah Chen)"
  technicalCustodian: string; // e.g. "Lead Cloud SecOps (Alex Kumar)"
  businessUnitId: string;
  scopeAssets: string[]; // Asset IDs covered
  
  // Implementation Lifecycle
  implementationStatus: 'IMPLEMENTED' | 'PARTIALLY_IMPLEMENTED' | 'PLANNED' | 'NOT_APPLICABLE';
  implementationDetails: string;
  operatingEnvironment: 'PRODUCTION' | 'CORPORATE' | 'CLOUD_INGRESS' | 'GLOBAL';
  
  // Operating Effectiveness (derived from Control Tests)
  effectivenessRating: 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'DEFICIENT' | 'NOT_TESTED';
  testingFrequency: 'CONTINUOUS' | 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';
  lastTestedAt?: string;
  nextTestDueDate: string;
  
  // Connected GRC Entities
  activeExceptionId?: string;
  linkedEvidenceIds: string[];
  linkedRiskIds: string[];
  linkedPolicyIds: string[];
  linkedFindingIds: string[];
  updatedAt: string;
}

// ============================================================================
// 3. CONTROL TESTING AS A FIRST-CLASS DOMAIN
// ============================================================================

export type ControlTestResult = 'PASS' | 'PARTIAL' | 'FAIL' | 'NOT_TESTED';
export type ControlEffectivenessStatus = 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'DEFICIENT' | 'NOT_TESTED';

export interface ControlTest {
  id: string; // e.g. "TEST-2026-Q3-088"
  tenantId: string;
  controlImplementationId: string;
  controlCode: string;
  testTitle: string;
  testObjective: string;
  testProcedure: string;
  testType: 'AUTOMATED_TELEMETRY' | 'MANUAL_INSPECTION' | 'HYBRID_SAMPLE' | 'THIRD_PARTY_PENTEST';
  tester: string; // e.g. "Internal Audit / SecOps"
  testerRole: 'FIRST_LINE_OPS' | 'SECOND_LINE_RISK' | 'THIRD_LINE_INTERNAL_AUDIT' | 'EXTERNAL_AUDITOR';
  
  // Sampling Methodology (ISO 19011 Compliant)
  populationSize: number;
  sampleSize: number;
  samplingMethod: 'RANDOM' | 'STRATIFIED' | 'JUDGMENTAL' | '100_PERCENT_TELEMETRY';
  testingPeriod: { startDate: string; endDate: string };
  
  // Execution & Results
  testResult: ControlTestResult;
  effectiveness: ControlEffectivenessStatus;
  deficienciesIdentified: string[];
  exceptionsNotedCount: number;
  compensatingControlsEvaluated?: string;
  
  // Supporting Evidence Assertions
  evidenceIds: string[];
  findingsGeneratedIds: string[];
  
  // Approvals & Sign-off
  performedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  status: 'SCHEDULED' | 'FIELDWORK_IN_PROGRESS' | 'UNDER_REVIEW' | 'SIGNED_OFF';
}

// ============================================================================
// 4. EVIDENCE TRACEABILITY CHAIN & EVIDENCE ASSERTION
// ============================================================================

export interface EvidenceAssertion {
  id: string;
  tenantId: string;
  evidenceId: string; // Reference to SmartEvidenceItem.id
  evidenceCode: string; // e.g. "EV-2026-001"
  controlImplementationId: string;
  controlCode: string;
  controlTestId?: string;
  requirementCode: string; // e.g. "A.5.15"
  frameworkCode: string; // e.g. "ISO_27001_2022"
  complianceProgramId: string; // e.g. "PROG-SEC-01"
  assertionStatement: string; // e.g. "Proves 100% MFA WebAuthn enforcement across all AWS admin roles for Q3 testing period."
  assertionStatus: 'VERIFIED_VALID' | 'PENDING_AUDITOR_SAMPLE' | 'EXPIRED' | 'REJECTED';
  assertedBy: string;
  assertedAt: string;
}

// ============================================================================
// 5. UNIVERSAL WORKFLOW ENGINE
// ============================================================================

export type WorkflowEntityType = 
  | 'RISK_TREATMENT' 
  | 'CAPA_REMEDIATION' 
  | 'EVIDENCE_VERIFICATION' 
  | 'POLICY_APPROVAL' 
  | 'SOA_SIGN_OFF' 
  | 'EXCEPTION_APPROVAL' 
  | 'CONTROL_TEST_SIGN_OFF' 
  | 'AUDIT_FINDING_CLOSURE'
  | 'VENDOR_ASSESSMENT';

export type WorkflowState = 'DRAFT' | 'ASSIGNED' | 'IN_PROGRESS' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'ESCALATED' | 'CLOSED';

export interface WorkflowTask {
  id: string; // e.g. "WF-TSK-401"
  tenantId: string;
  entityType: WorkflowEntityType;
  entityId: string;
  entityCode: string;
  title: string;
  description: string;
  assignee: string;
  assigneeRole: string;
  approver?: string;
  reviewer?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  state: WorkflowState;
  dueDate: string;
  slaHoursRemaining: number;
  isEscalated: boolean;
  
  // Execution Log
  auditTrail: Array<{
    timestamp: string;
    actor: string;
    action: string;
    comment?: string;
    previousState: WorkflowState;
    newState: WorkflowState;
  }>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 6. EXCEPTION MANAGEMENT (First-Class GRC Object)
// ============================================================================

export type ExceptionStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'CLOSED';

export interface CanonicalException {
  id: string; // e.g. "EXC-2026-088"
  tenantId: string;
  exceptionCode: string;
  title: string;
  businessJustification: string;
  relatedControlId: string; // e.g. "CTRL-088"
  relatedRequirementCode: string; // e.g. "A.5.15"
  affectedAssetIds: string[];
  
  // Risk & Compensating Controls
  inherentRiskScore: number;
  compensatingControls: string; // Description of alternative mitigating safeguards
  residualRiskScore: number;
  
  // Stakeholders & Approvals
  requestedBy: string;
  department: string;
  requestedDate: string;
  approvedBy?: string;
  approvalDate?: string;
  
  // Time-Bound Validity
  expiryDate: string;
  reviewDate: string;
  status: ExceptionStatus;
  supportingEvidenceIds: string[];
  
  // Notification & NBA Flags
  isApproachingExpiry: boolean; // True if <= 14 days to expiry
  hasExpired: boolean;
  remediationPlanUponExpiry: string;
}

// ============================================================================
// 7. PERSONAL OPERATIONAL HUB (MY WORK)
// ============================================================================

export interface MyWorkQueue {
  userId: string;
  userName: string;
  tenantId: string;
  tasks: WorkflowTask[];
  assignedControls: TenantControlImplementation[];
  scheduledControlTests: ControlTest[];
  ownedRisks: Array<{ id: string; code: string; title: string; score: number; level: string; dueDate: string }>;
  pendingEvidenceUploads: Array<{ id: string; controlCode: string; requirementTitle: string; dueDate: string }>;
  assignedCapas: Array<{ id: string; code: string; title: string; priority: string; dueDate: string; status: string }>;
  pendingApprovals: WorkflowTask[];
  activeExceptions: CanonicalException[];
  auditsInScope: Array<{ id: string; code: string; title: string; role: string; startDate: string; endDate: string }>;
}

// ============================================================================
// 8. DOMAIN EVENT MODEL (Audit Trail, NBA, Continuous Monitoring Driver)
// ============================================================================

export type DomainEventType =
  | 'RiskCreated'
  | 'RiskUpdated'
  | 'RiskTreatmentChanged'
  | 'ControlCreated'
  | 'ControlUpdated'
  | 'ControlTestCompleted'
  | 'ControlTestFailed'
  | 'ControlDeficiencyDetected'
  | 'ComplianceDriftDetected'
  | 'EvidenceUploaded'
  | 'EvidenceVerified'
  | 'EvidenceExpired'
  | 'AssessmentStarted'
  | 'AssessmentCompleted'
  | 'FindingCreated'
  | 'CAPACreated'
  | 'CAPAOverdue'
  | 'CAPAClosed'
  | 'VendorRiskChanged'
  | 'PolicySubmitted'
  | 'PolicyApproved'
  | 'ExceptionCreated'
  | 'ExceptionApproved'
  | 'ExceptionExpired'
  | 'AuditStarted'
  | 'AuditCompleted'
  | 'SoAUpdated'
  | 'SoAApproved'
  | 'ScopeApproved'
  | 'WorkspaceActivated';

export interface DomainEvent {
  id: string; // e.g. "evt_20261003_98124"
  tenantId: string;
  eventType: DomainEventType;
  entityType: string;
  entityId: string;
  entityCode: string;
  summary: string;
  payload: Record<string, any>;
  actor: string;
  actorRole: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  timestamp: string;
  integrityChecksum: string; // SHA-256 for non-repudiation
}
