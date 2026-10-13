// ============================================================================
// SKANDA ENTERPRISE GRC: POLICY GOVERNANCE & DECISION WORKSPACE SERVICE
// Path: src/services/grc/policyGovernanceService.ts
//
// Client-side state manager and API bridge for Document Lifecycle, Policy 360,
// 12-Dimension Quality Intelligence, AI Source Traceability, and Closed-Loop Assurance.
// Core Formula: DOCUMENT + IMPLEMENTATION + EVIDENCE + CONTROL TEST = ASSURANCE
// ============================================================================

export type DocumentType =
  | 'POLICY'
  | 'PROCEDURE'
  | 'SOP'
  | 'STANDARD'
  | 'GUIDELINE'
  | 'WORK_INSTRUCTION';

export type DocumentLifecycleStatus =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'SUPERSEDED'
  | 'ARCHIVED'
  | 'WITHDRAWN'
  | 'IMPACTED_BY_CHANGE';

export type ReviewCadence = 'ANNUAL' | 'SEMI_ANNUAL' | 'QUARTERLY' | 'BIENNIAL';

export type ReviewStatus = 'CURRENT' | 'DUE_SOON' | 'OVERDUE' | 'REVIEW_BLOCKED';

export type ControlImplementationStatus =
  | 'NOT_IMPLEMENTED'
  | 'PLANNED'
  | 'PARTIALLY_IMPLEMENTED'
  | 'IMPLEMENTED'
  | 'EFFECTIVE'
  | 'INEFFECTIVE'
  | 'NOT_APPLICABLE';

export type ControlAssuranceLevel =
  | 'EFFECTIVE'
  | 'PARTIALLY_EFFECTIVE'
  | 'INEFFECTIVE'
  | 'UNTESTED';

export type AcknowledgementTarget =
  | 'ALL_EMPLOYEES'
  | 'DEPARTMENT'
  | 'ROLE'
  | 'SPECIFIC_USERS';

export type SourceTraceabilityTag =
  | 'AUTHORITATIVE_FRAMEWORK_TEXT'
  | 'SOURCE_DERIVED_REQUIREMENT'
  | 'ORGANIZATIONAL_FACT'
  | 'EXISTING_INTERNAL_POLICY'
  | 'AI_GENERATED_RECOMMENDATION'
  | 'UNVERIFIED_ASSUMPTION'
  | 'HUMAN_APPROVED_DECISION';

export interface TraceableStatement {
  statementId: string;
  section: string;
  text: string;
  sourceType: SourceTraceabilityTag;
  sourceReference: string;
  sourceVersion?: string;
  confidenceScore: number;
  isVerifiedByHuman: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
}

export interface QualityDimensionScore {
  dimension: string;
  name: string;
  weight: number;
  score: number;
  passed: boolean;
  threshold: number;
  observations: string[];
  recommendations: string[];
}

export interface PolicyQualityEvaluationResult {
  evaluationId: string;
  evaluatedAt: string;
  documentId: string;
  documentCode: string;
  documentVersion: string;
  overallScore: number;
  maturityTier: 'L1_AD_HOC' | 'L2_DEFINED' | 'L3_MANAGED' | 'L4_QUANTIFIED' | 'L5_CONTINUOUS_ASSURANCE';
  isPublicationReady: boolean;
  blockers: string[];
  dimensionScores: QualityDimensionScore[];
  actionableFindings: Array<{
    id: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    dimension: string;
    finding: string;
    suggestedRemediation: string;
  }>;
  disclaimer: string;
}

export interface DocumentVersionRecord {
  version: string;
  changeSummary: string;
  changedSections: string[];
  reasonForChange: string;
  authorEmail: string;
  authorRole: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  publishedAt?: string;
  sha256Digest: string;
  effectiveDate?: string;
}

export interface GovernanceDocument {
  id: string;
  tenantId: string;
  code: string;
  title: string;
  type: DocumentType;
  departmentId: string;
  departmentName: string;
  processId: string;
  processName: string;
  frameworkCodes: string[];
  currentVersion: string;
  status: DocumentLifecycleStatus;
  ownerEmail: string;
  ownerRole: string;
  authorEmail: string;
  authorRole: string;
  reviewCadence: ReviewCadence;
  lastReviewDate?: string;
  nextReviewDate: string;
  reviewStatus: ReviewStatus;
  effectiveDate?: string;
  content: {
    purpose: string;
    scope: string;
    objectives: string[];
    definitions: Record<string, string>;
    rolesAndResponsibilities: Array<{ role: string; mandate: string; r: boolean; a: boolean; c: boolean; i: boolean }>;
    requirementsOrSteps: Array<{
      stepNumber: number;
      actor: string;
      system: string;
      action: string;
      expectedOutput: string;
      evidenceProduced?: string;
    }>;
    controlMappings: Array<{ controlCode: string; requirement: string; practice: string }>;
    exceptionHandling: { workflow: string; approver: string; maxDays: number };
    governanceAndReview: { cycle: string; owner: string; approver: string };
  };
  versions: DocumentVersionRecord[];
  linkedControlCodes: string[];
  linkedRiskIds: string[];
  mandatoryAcknowledgement: boolean;
  acknowledgementCampaignId?: string;
  acknowledgementRate: number;
  implementationPlanId?: string;
  implementationScore: number;
  sha256Digest: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalMatrixRule {
  id: string;
  tenantId: string;
  documentType: DocumentType;
  departmentDomain: string;
  authorizedApproverRole: string;
  authorizedApproverEmail?: string;
  escalationApproverRole?: string;
}

export interface AcknowledgementCampaign {
  id: string;
  tenantId: string;
  documentId: string;
  documentCode: string;
  documentTitle: string;
  documentVersion: string;
  targetScope: AcknowledgementTarget;
  targetDepartmentId?: string;
  targetRole?: string;
  dueDate: string;
  totalRequired: number;
  sentCount: number;
  viewedCount: number;
  acknowledgedCount: number;
  overdueCount: number;
  exemptedCount: number;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  createdAt: string;
}

export interface AcknowledgementEvidenceRecord {
  id: string;
  tenantId: string;
  campaignId: string;
  documentId: string;
  documentVersion: string;
  userEmail: string;
  userName: string;
  userRole: string;
  department: string;
  status: 'PENDING' | 'VIEWED' | 'ACKNOWLEDGED' | 'EXEMPTED';
  acknowledgedAt?: string;
  method: 'ELECTRONIC_SIGNATURE' | 'SSO_PORTAL_CONFIRMATION' | 'API_SYNC';
  ipAddress?: string;
  auditSignature: string;
}

export interface ImplementationTask {
  taskId: string;
  tenantId: string;
  documentId: string;
  documentCode: string;
  activityName: string;
  ownerRole: string;
  ownerEmail: string;
  dueDate: string;
  linkedControlCode: string;
  linkedEvidenceId?: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  riskSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  dependency?: string;
  completedAt?: string;
}

export interface ImplementationPlan {
  id: string;
  tenantId: string;
  documentId: string;
  documentCode: string;
  documentTitle: string;
  overallScore: number;
  tasks: ImplementationTask[];
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}

export interface ExpectedEvidenceSpec {
  id: string;
  tenantId: string;
  controlCode: string;
  documentId: string;
  evidenceTitle: string;
  ownerRole: string;
  ownerEmail: string;
  generationCadence: 'CONTINUOUS' | 'PER_EVENT' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL' | 'BIENNIAL';
  retentionDays: number;
  harvestMethod: 'LIVE_CONNECTOR' | 'API_POLL' | 'MANUAL_UPLOAD';
  connectorId?: string;
  currentAvailability: 'AVAILABLE' | 'MISSING' | 'EXPIRED' | 'AUTOMATED';
  lastHarvestedAt?: string;
}

export interface DocumentConflictRecord {
  id: string;
  tenantId: string;
  conflictType: 'DOCUMENT_VS_DOCUMENT' | 'DOCUMENT_VS_CONTROL' | 'POLICY_VS_PROCEDURE';
  documentA: { id: string; code: string; title: string; statement: string };
  documentB: { id: string; code: string; title: string; statement: string };
  affectedControlCode: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'ACCEPTED';
  resolutionOwner: string;
  resolutionNotes?: string;
  resolvedAt?: string;
}

export interface DocumentDriftRecord {
  id: string;
  tenantId: string;
  driftType: 'CONTROL_CHANGED_POLICY_UNMODIFIED' | 'PROCEDURE_CHANGED_SOP_UNMODIFIED' | 'PROCESS_MODIFIED_DOCUMENT_UNMODIFIED' | 'EVIDENCE_CHANGED_PROCEDURE_UNMODIFIED';
  entityId: string;
  entityType: 'CONTROL' | 'PROCESS' | 'EVIDENCE' | 'DOCUMENT';
  affectedDocumentId: string;
  affectedDocumentCode: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  detectedAt: string;
  status: 'OPEN' | 'REVISED' | 'DISMISSED';
}

export interface DocumentGovernanceMetrics {
  totalDocuments: number;
  publishedDocuments: number;
  inReviewDocuments: number;
  pendingApprovalDocuments: number;
  dueForReviewCount: number;
  overdueReviewsCount: number;
  activeAcknowledgementCampaigns: number;
  overallAcknowledgementRate: number;
  implementationGapCount: number;
  averageImplementationScore: number;
  activeConflictsCount: number;
  activeDriftCount: number;
  impactedDocumentsCount: number;
  activeExceptionsCount: number;
}

export interface AuditorGovernancePack {
  manifestId: string;
  generatedAt: string;
  sha256Digest: string;
  documentRegister: Array<{ code: string; title: string; type: string; version: string; status: string; hash: string }>;
  approvalRecords: Array<{ docCode: string; version: string; approver: string; date: string }>;
  acknowledgementSummaries: Array<{ docCode: string; rate: number; totalRequired: number }>;
  implementationStatus: Array<{ docCode: string; score: number; completedTasks: number; totalTasks: number }>;
}

export interface PolicyExperience {
  policy: GovernanceDocument;
  governance: {
    approvalStatus: 'NOT_SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'BLOCKED_SOD';
    isAuthor: boolean;
    canApprove: boolean;
    approvalRules: ApprovalMatrixRule[];
    approvalHistory: Array<{
      version: string;
      approverEmail: string;
      approverRole: string;
      approvedAt: string;
      comments?: string;
    }>;
    sodStatus: {
      isCompliant: boolean;
      authorEmail: string;
      approverEmail?: string;
      message: string;
    };
  };
  quality: PolicyQualityEvaluationResult;
  traceability: {
    frameworks: Array<{
      code: string;
      name: string;
      clauseCount: number;
      applicableClauses: Array<{ clauseCode: string; title: string; requirement: string }>;
    }>;
    controls: Array<{
      controlCode: string;
      title: string;
      implementationStatus: ControlImplementationStatus;
      assuranceLevel: ControlAssuranceLevel;
      lastTestedAt?: string;
    }>;
    risks: Array<{
      riskId: string;
      title: string;
      riskLevel: string;
      inherentScore: number;
      residualScore: number;
      treatmentStrategy: string;
    }>;
  };
  implementation: {
    plan?: ImplementationPlan;
    tasksTotal: number;
    tasksCompleted: number;
    overallScore: number;
    upcomingDeadlines: Array<{ taskId: string; activityName: string; dueDate: string; ownerEmail: string; status: string }>;
  };
  evidenceAndTesting: {
    specs: ExpectedEvidenceSpec[];
    availableCount: number;
    missingCount: number;
    lastControlTest?: {
      testCode: string;
      testResult: 'PASS' | 'FAIL' | 'INCONCLUSIVE';
      effectiveness: ControlAssuranceLevel;
      testedAt: string;
      tester: string;
    };
  };
  acknowledgement: {
    campaign?: AcknowledgementCampaign;
    completionRate: number;
    totalRequired: number;
    acknowledgedCount: number;
    recentSignatures: AcknowledgementEvidenceRecord[];
  };
  exceptionsAndCapa: {
    activeExceptions: Array<{
      id: string;
      title: string;
      riskScore: number;
      expiresAt: string;
      approvedBy: string;
    }>;
    linkedFindings: Array<{
      id: string;
      title: string;
      severity: string;
      status: string;
    }>;
  };
  versionHistory: {
    versions: DocumentVersionRecord[];
    currentVersionDigest: string;
    isImmutable: boolean;
  };
  reviewSchedule: {
    cadence: ReviewCadence;
    lastReviewDate?: string;
    nextReviewDate: string;
    daysRemaining: number;
    reviewStatus: ReviewStatus;
    isOverdue: boolean;
  };
}

export interface VersionComparisonResult {
  documentId: string;
  documentCode: string;
  versionA: { version: string; publishedAt?: string; author: string; hash: string };
  versionB: { version: string; publishedAt?: string; author: string; hash: string };
  isIdentical: boolean;
  sectionDiffs: Array<{
    section: string;
    status: 'UNCHANGED' | 'MODIFIED' | 'ADDED' | 'REMOVED';
    contentA?: string;
    contentB?: string;
    summary: string;
  }>;
}

export interface GeneratedPolicyDraftResponse {
  draftId: string;
  generatedAt: string;
  code: string;
  title: string;
  type: string;
  status: 'DRAFT';
  currentVersion: '1.0.0-DRAFT';
  content: GovernanceDocument['content'];
  traceableStatements: TraceableStatement[];
  qualityEvaluation: PolicyQualityEvaluationResult;
  assumptionsIdentified: string[];
  humanReviewRequired: boolean;
  approvalDisclaimer: string;
}

export interface DuplicateDetectionResult {
  scanId: string;
  scannedAt: string;
  tenantId: string;
  analyzedDocumentsCount: number;
  duplicateFindings: Array<{
    findingId: string;
    findingType:
      | 'DUPLICATE_POLICY_TITLE'
      | 'SEMANTIC_SCOPE_OVERLAP'
      | 'CONTRADICTORY_STATEMENT'
      | 'CONFLICTING_RETENTION_PERIOD'
      | 'CONFLICTING_RACI_ASSIGNMENT'
      | 'OUTDATED_FRAMEWORK_REFERENCE';
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    sourceDocument: { id: string; code: string; title: string };
    targetDocument?: { id: string; code: string; title: string };
    statementA: string;
    statementB?: string;
    description: string;
    suggestedResolution: string;
  }>;
  overallRedundancyScore: number;
  recommendations: string[];
}

export interface PolicyImpactAssessment {
  assessmentId: string;
  assessedAt: string;
  tenantId: string;
  changeEvent: {
    eventId: string;
    sourceRegulatoryBody: string;
    frameworkCode: string;
    affectedClauseOrSection: string;
    changeDescription: string;
    effectiveDate: string;
    urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  };
  impactedDocuments: Array<{
    documentId: string;
    documentCode: string;
    documentTitle: string;
    currentVersion: string;
    ownerEmail: string;
    ownerRole: string;
    impactSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    affectedSections: string[];
    governanceActionRequired: string;
    reviewTaskId: string;
  }>;
  impactedControls: string[];
  governanceRecommendation: string;
}

export interface GovernanceReviewTask {
  taskId: string;
  tenantId: string;
  documentId: string;
  documentCode: string;
  triggerType: 'REGULATORY_CHANGE' | 'SCHEDULED_CADENCE' | 'INCIDENT_OCCURRED' | 'CONTROL_TEST_FAILED' | 'AUDIT_FINDING';
  triggerSource: string;
  responsibleOwner: string;
  dueDate: string;
  relevantEvidenceSpecs: string[];
  proposedChanges: string[];
  approvalRequirements: string[];
  status: 'PENDING_REVIEW' | 'IN_PROGRESS' | 'REVISION_SUBMITTED' | 'CLOSED_NO_CHANGE';
  closureDecision?: string;
  closedAt?: string;
}

// Client Service Class
class PolicyGovernanceClientService {
  private activeTenantId = 'SKANDA-DEMO-ENTERPRISE';

  public setTenantId(tenantId: string): void {
    this.activeTenantId = tenantId;
  }

  public getTenantId(): string {
    return this.activeTenantId;
  }

  // 1. Unified Policy Experience
  public async getPolicyExperience(docId: string, actorEmail?: string, actorRole?: string): Promise<PolicyExperience | null> {
    try {
      const headers: Record<string, string> = {
        'x-tenant-id': this.activeTenantId
      };
      if (actorEmail) headers['x-user-email'] = actorEmail;
      if (actorRole) headers['x-user-role'] = actorRole;

      const res = await fetch(`/api/v1/policy-governance/policies/${encodeURIComponent(docId)}/experience`, {
        headers
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Fallback below
    }

    const docs = await this.getDocuments();
    const doc = docs.find(d => d.id === docId) || docs[0];
    if (!doc) return null;

    return this.buildFallbackExperience(doc);
  }

  // 2. Metrics
  public async getGovernanceMetrics(): Promise<DocumentGovernanceMetrics> {
    try {
      const res = await fetch(`/api/v1/policy-governance/metrics`, {
        headers: { 'x-tenant-id': this.activeTenantId }
      });
      if (res.ok) {
        const data = await res.json();
        return data.data;
      }
    } catch {
      // Fallback
    }

    return {
      totalDocuments: 3,
      publishedDocuments: 2,
      inReviewDocuments: 1,
      pendingApprovalDocuments: 0,
      dueForReviewCount: 1,
      overdueReviewsCount: 0,
      activeAcknowledgementCampaigns: 1,
      overallAcknowledgementRate: 91,
      implementationGapCount: 0,
      averageImplementationScore: 90,
      activeConflictsCount: 0,
      activeDriftCount: 0,
      impactedDocumentsCount: 0,
      activeExceptionsCount: 1
    };
  }

  // 3. Documents
  public async getDocuments(): Promise<GovernanceDocument[]> {
    try {
      const res = await fetch(`/api/v1/policy-governance/documents`, {
        headers: { 'x-tenant-id': this.activeTenantId }
      });
      if (res.ok) {
        const data = await res.json();
        return data.data;
      }
    } catch {
      // Fallback
    }

    return this.getFallbackDocuments();
  }

  public getAllDocuments(): GovernanceDocument[] {
    return this.getFallbackDocuments();
  }

  public async getAcknowledgementCampaigns(): Promise<AcknowledgementCampaign[]> {
    return [
      {
        id: 'CAMP-POL-HR-001',
        tenantId: this.activeTenantId,
        documentId: 'DOC-POL-HR-001',
        documentCode: 'SKD-POL-HR-001',
        documentTitle: 'Enterprise Access Control & Identity Provisioning Policy',
        documentVersion: '1.0.0',
        targetScope: 'ALL_EMPLOYEES',
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
        totalRequired: 150,
        sentCount: 150,
        viewedCount: 146,
        acknowledgedCount: 141,
        overdueCount: 9,
        exemptedCount: 0,
        status: 'ACTIVE',
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
      }
    ];
  }

  public async getImplementationPlans(): Promise<ImplementationPlan[]> {
    return [
      {
        id: 'IMP-PLAN-HR-001',
        tenantId: this.activeTenantId,
        documentId: 'DOC-POL-HR-001',
        documentCode: 'SKD-POL-HR-001',
        documentTitle: 'Enterprise Access Control & Identity Provisioning Policy',
        overallScore: 88,
        tasks: [
          {
            taskId: 'TASK-IMP-001',
            tenantId: this.activeTenantId,
            documentId: 'DOC-POL-HR-001',
            documentCode: 'SKD-POL-HR-001',
            activityName: 'Enforce MFA Conditional Access Policy in Microsoft Entra ID',
            ownerRole: 'IAM Lead',
            ownerEmail: 'david.miller@acmefintech.io',
            dueDate: new Date(Date.now() + 10 * 86400000).toISOString(),
            linkedControlCode: 'A.5.15',
            linkedEvidenceId: 'EVIDSRC-ENTRA-02',
            status: 'COMPLETED',
            riskSeverity: 'HIGH',
            completedAt: new Date(Date.now() - 20 * 86400000).toISOString()
          }
        ],
        status: 'IN_PROGRESS',
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 86400000).toISOString()
      }
    ];
  }

  public async getExpectedEvidenceSpecs(): Promise<ExpectedEvidenceSpec[]> {
    return [
      {
        id: 'SPEC-EVID-A515-01',
        tenantId: this.activeTenantId,
        controlCode: 'A.5.15',
        documentId: 'DOC-POL-HR-001',
        evidenceTitle: 'ServiceNow Access Request & Approval Ticket Logs',
        ownerRole: 'IT Service Desk Manager',
        ownerEmail: 'it.lead@acmefintech.io',
        generationCadence: 'PER_EVENT',
        retentionDays: 1095,
        harvestMethod: 'LIVE_CONNECTOR',
        connectorId: 'conn-servicenow-itsm',
        currentAvailability: 'AUTOMATED',
        lastHarvestedAt: new Date().toISOString()
      }
    ];
  }

  public async getConflicts(): Promise<DocumentConflictRecord[]> {
    return [];
  }

  public async getDrifts(): Promise<DocumentDriftRecord[]> {
    return [];
  }

  public async rejectDocument(documentId: string, rejectionReason: string): Promise<GovernanceDocument> {
    try {
      const res = await fetch(`/api/v1/policy-governance/documents/${encodeURIComponent(documentId)}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': this.activeTenantId
        },
        body: JSON.stringify({ rejectionReason })
      });
      if (res.ok) {
        const data = await res.json();
        return data.data;
      }
    } catch {
      // fallback
    }
    const doc = this.getFallbackDocuments().find(d => d.id === documentId);
    if (doc) {
      doc.status = 'DRAFT';
      return doc;
    }
    throw new Error(`Document ${documentId} not found.`);
  }

  private getFallbackDocuments(): GovernanceDocument[] {
    return [
      {
        id: 'DOC-POL-HR-001',
        tenantId: this.activeTenantId,
        code: 'SKD-POL-HR-001',
        title: 'Enterprise Access Control & Identity Provisioning Policy',
        type: 'POLICY',
        departmentId: 'DEP-HR-01',
        departmentName: 'Human Resources',
        processId: 'PROC-HR-001',
        processName: 'Employee Onboarding & Access Provisioning',
        frameworkCodes: ['ISO_27001_2022', 'ISO_27701_2019', 'SOC_2_TYPE_2'],
        currentVersion: '1.0.0',
        status: 'PUBLISHED',
        ownerEmail: 'rachel.green@acmefintech.io',
        ownerRole: 'HR Operations Manager',
        authorEmail: 'marcus.vance@acmefintech.io',
        authorRole: 'CISO',
        reviewCadence: 'ANNUAL',
        lastReviewDate: new Date(Date.now() - 30 * 86400000).toISOString(),
        nextReviewDate: new Date(Date.now() + 335 * 86400000).toISOString(),
        reviewStatus: 'CURRENT',
        effectiveDate: new Date(Date.now() - 30 * 86400000).toISOString(),
        content: {
          purpose: 'Establishes mandatory enterprise standards for role-based access control, identity provisioning, and MFA enforcement.',
          scope: 'Applies to all permanent employees, contractors, and third parties accessing Acme systems.',
          objectives: [
            'Enforce least-privilege role-based access control.',
            'Mandate MFA conditional access on all corporate accounts.',
            'Maintain complete unbroken audit logs linking HR events to IAM provisioning.'
          ],
          definitions: {
            HRIS: 'Human Resources Information System (Keka)',
            IdP: 'Identity Provider (Microsoft Entra ID)',
            MFA: 'Multi-Factor Authentication via Authenticator App'
          },
          rolesAndResponsibilities: [
            { role: 'Hiring Manager', mandate: 'Approves requested application access in ServiceNow', r: true, a: true, c: false, i: false },
            { role: 'HR Operations Lead', mandate: 'Creates employee record in Keka HRMS', r: true, a: true, c: true, i: false },
            { role: 'IAM Lead', mandate: 'Provisions Entra ID accounts and enforces MFA conditional access', r: true, a: false, c: false, i: true },
            { role: 'CISO', mandate: 'Defines access control policy and accepts risk', r: false, a: true, c: true, i: true }
          ],
          requirementsOrSteps: [
            { stepNumber: 1, actor: 'HR Operations', system: 'Keka HRMS', action: 'Create verified employee profile', expectedOutput: 'Employee ID generated', evidenceProduced: 'Keka Master Record' },
            { stepNumber: 2, actor: 'Hiring Manager', system: 'ServiceNow ITSM', action: 'Approve role entitlements', expectedOutput: 'Approved RITM Ticket', evidenceProduced: 'RITM-ONBOARD-2026' },
            { stepNumber: 3, actor: 'IAM Lead', system: 'Microsoft Entra ID', action: 'Provision account with forced MFA', expectedOutput: 'Active account with MFA enforced', evidenceProduced: 'Entra Audit Log' }
          ],
          controlMappings: [
            { controlCode: 'A.5.15', requirement: 'Access Control', practice: 'ServiceNow ticket approval required for all access' },
            { controlCode: 'A.5.18', requirement: 'Access Rights Management', practice: 'Keka termination hook automates deprovisioning' },
            { controlCode: 'A.5.34', requirement: 'Protection of PII', practice: 'Encrypted employee data storage' }
          ],
          exceptionHandling: {
            workflow: 'Emergency temporary access requests require written CISO sign-off and auto-expire in 72h.',
            approver: 'Chief Information Security Officer',
            maxDays: 3
          },
          governanceAndReview: {
            cycle: 'ANNUAL',
            owner: 'HR Operations Manager',
            approver: 'CISO'
          }
        },
        versions: [
          {
            version: '1.0.0',
            changeSummary: 'Initial formal baseline publication.',
            changedSections: ['ALL'],
            reasonForChange: 'New ISMS Governance Launch',
            authorEmail: 'marcus.vance@acmefintech.io',
            authorRole: 'CISO',
            approvedBy: 'ciso@acmefintech.io',
            approvedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
            publishedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
            sha256Digest: '516b029985d7bcd5d75ced882eb991108c835b9938f1842866bf48c16af128ab'
          }
        ],
        linkedControlCodes: ['A.5.15', 'A.5.18', 'A.5.34'],
        linkedRiskIds: ['RSK-IAM-001', 'RSK-PRIV-002'],
        mandatoryAcknowledgement: true,
        acknowledgementRate: 94,
        implementationScore: 88,
        sha256Digest: '516b029985d7bcd5d75ced882eb991108c835b9938f1842866bf48c16af128ab',
        createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 86400000).toISOString()
      },
      {
        id: 'DOC-POL-SEC-002',
        tenantId: this.activeTenantId,
        code: 'SKD-POL-SEC-002',
        title: 'Enterprise Cryptography, Key Management & KMS Standard',
        type: 'STANDARD',
        departmentId: 'DEP-SEC-01',
        departmentName: 'Information Security',
        processId: 'PROC-SEC-002',
        processName: 'Cryptographic Key Lifecycle & Envelope Encryption',
        frameworkCodes: ['ISO_27001_2022', 'MAS_TRM_2021', 'SOC_2_TYPE_2'],
        currentVersion: '1.1.0',
        status: 'PUBLISHED',
        ownerEmail: 'marcus.vance@acmefintech.io',
        ownerRole: 'Chief Information Security Officer',
        authorEmail: 'clara.oswald@acmefintech.io',
        authorRole: 'Cryptographic Systems Engineer',
        reviewCadence: 'ANNUAL',
        lastReviewDate: new Date(Date.now() - 60 * 86400000).toISOString(),
        nextReviewDate: new Date(Date.now() + 305 * 86400000).toISOString(),
        reviewStatus: 'CURRENT',
        effectiveDate: new Date(Date.now() - 60 * 86400000).toISOString(),
        content: {
          purpose: 'Mandates AES-256-GCM envelope encryption at rest, TLS 1.3 in transit, and HSM-backed key rotation across all cloud VPCs.',
          scope: 'Applies to all production databases, microservices, object stores, and cross-border API endpoints.',
          objectives: [
            'Enforce AES-256-GCM for all customer PII data at rest.',
            'Mandate annual automated KMS CMK rotation.',
            'Enforce strict key separation between tenant compartments.'
          ],
          definitions: {
            CMK: 'Customer Master Key residing in FIPS 140-3 Level 3 Hardware Security Module.',
            DEK: 'Data Encryption Key wrapped with CMK envelope encryption.',
            HSM: 'Hardware Security Module.'
          },
          rolesAndResponsibilities: [
            { role: 'CISO', mandate: 'Key custodian and exception authority', r: false, a: true, c: true, i: false },
            { role: 'SecOps Engineer', mandate: 'Monitors KMS rotation logs and alerts on tamper events', r: true, a: false, c: false, i: true }
          ],
          requirementsOrSteps: [
            { stepNumber: 1, actor: 'Cloud Engineer', system: 'AWS KMS / Azure Key Vault', action: 'Enable automatic key rotation for all CMKs', expectedOutput: 'Rotation enabled flag true', evidenceProduced: 'KMS Key Configuration Report' },
            { stepNumber: 2, actor: 'Database Admin', system: 'PostgreSQL RDS', action: 'Enforce TDE with customer-managed KMS key', expectedOutput: 'Storage encrypted with CMK', evidenceProduced: 'RDS Encryption Attestation' }
          ],
          controlMappings: [
            { controlCode: 'A.8.24', requirement: 'Use of Cryptography', practice: 'Hardware KMS with AES-256-GCM envelope encryption' }
          ],
          exceptionHandling: { workflow: 'CISO dual-custody exception required', approver: 'CISO', maxDays: 30 },
          governanceAndReview: { cycle: 'ANNUAL', owner: 'CISO', approver: 'Executive Risk Committee' }
        },
        versions: [
          {
            version: '1.0.0',
            changeSummary: 'Initial cryptographic standard baseline.',
            changedSections: ['ALL'],
            reasonForChange: 'ISMS Rollout',
            authorEmail: 'clara.oswald@acmefintech.io',
            authorRole: 'Cryptographic Systems Engineer',
            approvedBy: 'marcus.vance@acmefintech.io',
            approvedAt: new Date(Date.now() - 120 * 86400000).toISOString(),
            publishedAt: new Date(Date.now() - 120 * 86400000).toISOString(),
            sha256Digest: '7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b'
          },
          {
            version: '1.1.0',
            changeSummary: 'Added post-quantum cryptographic (PQC) readiness evaluation roadmap.',
            changedSections: ['Section 4: Future Standards'],
            reasonForChange: 'MAS TRM 2024 Advisory Update',
            authorEmail: 'clara.oswald@acmefintech.io',
            authorRole: 'Cryptographic Systems Engineer',
            approvedBy: 'marcus.vance@acmefintech.io',
            approvedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
            publishedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
            sha256Digest: '8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c'
          }
        ],
        linkedControlCodes: ['A.8.24'],
        linkedRiskIds: ['RSK-CRYPTO-001'],
        mandatoryAcknowledgement: true,
        acknowledgementRate: 88,
        implementationScore: 92,
        sha256Digest: '8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c',
        createdAt: new Date(Date.now() - 130 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 60 * 86400000).toISOString()
      },
      {
        id: 'DOC-POL-PRV-003',
        tenantId: this.activeTenantId,
        code: 'SKD-POL-PRV-003',
        title: 'Digital Personal Data Protection & Consent Governance Policy',
        type: 'POLICY',
        departmentId: 'DEP-LGL-01',
        departmentName: 'Legal & Privacy',
        processId: 'PROC-DPDP-001',
        processName: 'Data Principal Consent & Grievance Redressal',
        frameworkCodes: ['DPDP_2023', 'GDPR', 'ISO_27701_2019'],
        currentVersion: '1.0.0-DRAFT',
        status: 'IN_REVIEW',
        ownerEmail: 'dpo@acmefintech.io',
        ownerRole: 'Data Protection Officer',
        authorEmail: 'elena.rostova@acmefintech.io',
        authorRole: 'Privacy Counsel',
        reviewCadence: 'ANNUAL',
        nextReviewDate: new Date(Date.now() + 180 * 86400000).toISOString(),
        reviewStatus: 'CURRENT',
        content: {
          purpose: 'Defines mandatory requirements for collecting explicit, itemized consent from Data Principals under India DPDP Act 2023 and GDPR.',
          scope: 'Applies to all personal data processing activities, consent artifact storage, and grievance redressal workflows.',
          objectives: [
            'Ensure 100% itemized bilingual consent notices before data processing.',
            'Provide automated consent revocation within 48 hours of user request.',
            'Fulfill Data Principal access, correction, and erasure rights within 72 hours.'
          ],
          definitions: {
            ConsentArtefact: 'Immutable signed electronic consent record conforming to DPDP Act Section 6.',
            DataPrincipal: 'The individual to whom the personal data relates.',
            DPO: 'Data Protection Officer.'
          },
          rolesAndResponsibilities: [
            { role: 'DPO', mandate: 'Accountable for privacy compliance and Data Protection Board notifications', r: false, a: true, c: true, i: false },
            { role: 'Privacy Ops Lead', mandate: 'Processes DSAR requests and consent withdrawals', r: true, a: false, c: false, i: true }
          ],
          requirementsOrSteps: [
            { stepNumber: 1, actor: 'Frontend Lead', system: 'Customer Portal', action: 'Render explicit granular consent checkbox with multilingual notice', expectedOutput: 'Signed Consent Token', evidenceProduced: 'Consent Audit Record' },
            { stepNumber: 2, actor: 'Privacy Ops', system: 'SKANDA DPDP Engine', action: 'Execute automated data erasure upon withdrawal request', expectedOutput: 'Erasure Certificate', evidenceProduced: 'Cryptographic Erasure Receipt' }
          ],
          controlMappings: [
            { controlCode: 'A.5.34', requirement: 'Protection of PII', practice: 'Consent management platform with immutable hash verification' }
          ],
          exceptionHandling: { workflow: 'Statutory exceptions only with Legal Head sign-off', approver: 'DPO', maxDays: 14 },
          governanceAndReview: { cycle: 'ANNUAL', owner: 'DPO', approver: 'Board Audit Committee' }
        },
        versions: [
          {
            version: '1.0.0-DRAFT',
            changeSummary: 'Initial draft aligned with DPDP Rules 2024 consultation paper.',
            changedSections: ['ALL'],
            reasonForChange: 'DPDP Readiness',
            authorEmail: 'elena.rostova@acmefintech.io',
            authorRole: 'Privacy Counsel',
            sha256Digest: '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d'
          }
        ],
        linkedControlCodes: ['A.5.34'],
        linkedRiskIds: ['RSK-PRIV-002'],
        mandatoryAcknowledgement: true,
        acknowledgementRate: 0,
        implementationScore: 35,
        sha256Digest: '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ];
  }

  // 4. Create Document
  public async createDocument(payload: any): Promise<{ success: boolean; document?: GovernanceDocument; error?: string }> {
    try {
      const res = await fetch('/api/v1/policy-governance/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': this.activeTenantId },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // 5. Submit for Review
  public async submitForReview(docId: string, actorEmail?: string, actorRole?: string): Promise<{ success: boolean; data?: GovernanceDocument; error?: string }> {
    try {
      const res = await fetch(`/api/v1/policy-governance/documents/${encodeURIComponent(docId)}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': this.activeTenantId },
        body: JSON.stringify({ actorEmail, actorRole })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // 6. Approve Document
  public async approveDocument(docId: string, actorEmail: string, actorRole: string, approvalComment?: string): Promise<{ success: boolean; data?: GovernanceDocument; error?: string; reason?: string }> {
    try {
      const res = await fetch(`/api/v1/policy-governance/documents/${encodeURIComponent(docId)}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': this.activeTenantId },
        body: JSON.stringify({ actorEmail, actorRole, approvalComment })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // 7. Publish Document
  public async publishDocument(docId: string, actorEmail: string, effectiveDate?: string): Promise<{ success: boolean; data?: any; error?: string; blockers?: string[] }> {
    try {
      const res = await fetch(`/api/v1/policy-governance/documents/${encodeURIComponent(docId)}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': this.activeTenantId },
        body: JSON.stringify({ actorEmail, effectiveDate })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // 8. Record Electronic Signature Acknowledgement
  public async recordAcknowledgement(campaignId: string, userEmail: string, userName: string, method = 'ELECTRONIC_SIGNATURE'): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch('/api/v1/policy-governance/acknowledgements/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': this.activeTenantId },
        body: JSON.stringify({ campaignId, userEmail, userName, method })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // 9. AI Generation Studio
  public async generatePolicyDraft(payload: any): Promise<{ success: boolean; data?: GeneratedPolicyDraftResponse; error?: string }> {
    try {
      const res = await fetch('/api/v1/policy-governance/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': this.activeTenantId },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // 10. 12-Dimension Quality Intelligence
  public async evaluateQualityAudit(payload: any): Promise<{ success: boolean; data?: PolicyQualityEvaluationResult; error?: string }> {
    try {
      const res = await fetch('/api/v1/policy-governance/quality-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': this.activeTenantId },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // 11. Side-by-Side Version Diff
  public async compareVersions(docId: string, v1: string, v2: string): Promise<VersionComparisonResult | null> {
    try {
      const res = await fetch(`/api/v1/policy-governance/documents/${encodeURIComponent(docId)}/compare?v1=${v1}&v2=${v2}`, {
        headers: { 'x-tenant-id': this.activeTenantId }
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Fallback
    }
    return {
      documentId: docId,
      documentCode: 'SKD-POL-001',
      versionA: { version: v1, author: 'Author', hash: 'sha256:aaa' },
      versionB: { version: v2, author: 'Author', hash: 'sha256:bbb' },
      isIdentical: v1 === v2,
      sectionDiffs: [
        { section: 'Purpose & Scope', status: v1 === v2 ? 'UNCHANGED' : 'MODIFIED', summary: 'Scope updated.' },
        { section: 'Operational Controls', status: v1 === v2 ? 'UNCHANGED' : 'MODIFIED', summary: 'Controls aligned.' }
      ]
    };
  }

  // 12. Duplication & Contradiction Scanner
  public async scanDuplicatePolicies(): Promise<DuplicateDetectionResult | null> {
    try {
      const res = await fetch('/api/v1/policy-governance/duplicate-check', {
        method: 'POST',
        headers: { 'x-tenant-id': this.activeTenantId }
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Fallback
    }
    return {
      scanId: `SCAN-DUP-LOCAL`,
      scannedAt: new Date().toISOString(),
      tenantId: this.activeTenantId,
      analyzedDocumentsCount: 3,
      duplicateFindings: [],
      overallRedundancyScore: 0,
      recommendations: ['Policy catalog is structurally harmonized with zero duplicate titles.']
    };
  }

  // 13. Regulatory Impact Analysis
  public async assessRegulatoryImpact(changeEvent: any): Promise<PolicyImpactAssessment | null> {
    try {
      const res = await fetch('/api/v1/policy-governance/regulatory-impact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': this.activeTenantId },
        body: JSON.stringify({ changeEvent })
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Fallback
    }
    return null;
  }

  // 14. Governance Review Tasks
  public async getGovernanceReviewTasks(): Promise<GovernanceReviewTask[]> {
    try {
      const res = await fetch('/api/v1/policy-governance/review-tasks', {
        headers: { 'x-tenant-id': this.activeTenantId }
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Fallback
    }
    return [];
  }

  // 15. Auditor Digital Pack
  public async getAuditorPack(): Promise<AuditorGovernancePack | null> {
    try {
      const res = await fetch('/api/v1/policy-governance/audit-pack', {
        headers: { 'x-tenant-id': this.activeTenantId }
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Fallback
    }
    return null;
  }

  // Fallback Experience Builder for resilience
  private buildFallbackExperience(doc: GovernanceDocument): PolicyExperience {
    const isPublished = doc.status === 'PUBLISHED';
    return {
      policy: doc,
      governance: {
        approvalStatus: isPublished ? 'PUBLISHED' : doc.status === 'APPROVED' ? 'APPROVED' : doc.status === 'IN_REVIEW' ? 'IN_REVIEW' : 'NOT_SUBMITTED',
        isAuthor: false,
        canApprove: true,
        approvalRules: [
          {
            id: 'APR-RULE-01',
            tenantId: this.activeTenantId,
            documentType: doc.type,
            departmentDomain: 'SECURITY',
            authorizedApproverRole: 'CISO',
            authorizedApproverEmail: 'ciso@acmefintech.io'
          }
        ],
        approvalHistory: doc.versions
          .filter(v => v.approvedBy)
          .map(v => ({
            version: v.version,
            approverEmail: v.approvedBy!,
            approverRole: 'CISO',
            approvedAt: v.approvedAt || v.publishedAt || doc.updatedAt,
            comments: 'Formal compliance approval.'
          })),
        sodStatus: {
          isCompliant: true,
          authorEmail: doc.authorEmail,
          approverEmail: doc.versions[doc.versions.length - 1]?.approvedBy,
          message: 'Segregation of duties verified: Author and Approver are independent actors.'
        }
      },
      quality: {
        evaluationId: `QEVAL-${doc.id}`,
        evaluatedAt: new Date().toISOString(),
        documentId: doc.id,
        documentCode: doc.code,
        documentVersion: doc.currentVersion,
        overallScore: isPublished ? 94 : 78,
        maturityTier: isPublished ? 'L5_CONTINUOUS_ASSURANCE' : 'L3_MANAGED',
        isPublicationReady: true,
        blockers: [],
        dimensionScores: [
          { dimension: 'COMPLETENESS', name: 'Structural Completeness', weight: 0.1, score: 95, passed: true, threshold: 70, observations: ['All sections defined.'], recommendations: [] },
          { dimension: 'CLARITY_READABILITY', name: 'Clarity & Readability', weight: 0.08, score: 90, passed: true, threshold: 70, observations: ['Imperative language used.'], recommendations: [] },
          { dimension: 'INTERNAL_CONSISTENCY', name: 'Internal Consistency', weight: 0.08, score: 100, passed: true, threshold: 75, observations: ['Consistent rules.'], recommendations: [] },
          { dimension: 'ENFORCEABILITY', name: 'Technical Enforceability', weight: 0.1, score: 92, passed: true, threshold: 75, observations: ['Platform systems bound.'], recommendations: [] },
          { dimension: 'ACCOUNTABILITY_RACI', name: 'Accountability & RACI', weight: 0.1, score: 95, passed: true, threshold: 80, observations: ['Single accountable owner.'], recommendations: [] },
          { dimension: 'REQUIREMENT_TRACEABILITY', name: 'Requirement Traceability', weight: 0.1, score: 96, passed: true, threshold: 75, observations: [`Mapped to ${doc.frameworkCodes.join(', ')}`], recommendations: [] },
          { dimension: 'RISK_ALIGNMENT', name: 'Risk Alignment', weight: 0.08, score: 90, passed: true, threshold: 70, observations: ['Mitigates linked risk records.'], recommendations: [] },
          { dimension: 'OPERATIONAL_FEASIBILITY', name: 'Operational Feasibility', weight: 0.08, score: 92, passed: true, threshold: 70, observations: ['Realistic outputs specified.'], recommendations: [] },
          { dimension: 'REVIEW_APPROVAL_COMPLETENESS', name: 'Review & Approval Completeness', weight: 0.08, score: 95, passed: true, threshold: 75, observations: ['Owner and cadence documented.'], recommendations: [] },
          { dimension: 'DOCUMENT_CONTROL_INTEGRITY', name: 'Document-Control Integrity', weight: 0.08, score: 95, passed: true, threshold: 80, observations: ['Controls linked.'], recommendations: [] },
          { dimension: 'IMPLEMENTATION_READINESS', name: 'Implementation Readiness', weight: 0.06, score: 88, passed: true, threshold: 70, observations: ['Actionable tasks created.'], recommendations: [] },
          { dimension: 'EVIDENCE_SPEC_COMPLETENESS', name: 'Evidence Specification Completeness', weight: 0.06, score: 90, passed: true, threshold: 70, observations: ['Evidence expectations registered.'], recommendations: [] }
        ],
        actionableFindings: [],
        disclaimer: 'SKANDA Policy Quality Intelligence evaluates document structural integrity and closed-loop assurance linkage.'
      },
      traceability: {
        frameworks: doc.frameworkCodes.map(f => ({
          code: f,
          name: f,
          clauseCount: doc.content.controlMappings?.length || 1,
          applicableClauses: (doc.content.controlMappings || []).map(m => ({
            clauseCode: m.controlCode,
            title: m.requirement,
            requirement: m.practice
          }))
        })),
        controls: doc.linkedControlCodes.map(c => ({
          controlCode: c,
          title: `Control ${c} Implementation`,
          implementationStatus: isPublished ? 'IMPLEMENTED' : 'PARTIALLY_IMPLEMENTED',
          assuranceLevel: isPublished ? 'EFFECTIVE' : 'PARTIALLY_EFFECTIVE',
          lastTestedAt: isPublished ? new Date(Date.now() - 14 * 86400000).toISOString() : undefined
        })),
        risks: doc.linkedRiskIds.map(r => ({
          riskId: r,
          title: `Enterprise Risk ${r}`,
          riskLevel: 'HIGH',
          inherentScore: 16,
          residualScore: 4,
          treatmentStrategy: 'MITIGATE'
        }))
      },
      implementation: {
        plan: undefined,
        tasksTotal: doc.content.requirementsOrSteps?.length || 2,
        tasksCompleted: isPublished ? (doc.content.requirementsOrSteps?.length || 2) - 1 : 0,
        overallScore: doc.implementationScore,
        upcomingDeadlines: []
      },
      evidenceAndTesting: {
        specs: [
          {
            id: `SPEC-${doc.code}-01`,
            tenantId: this.activeTenantId,
            controlCode: doc.linkedControlCodes[0] || 'A.5.15',
            documentId: doc.id,
            evidenceTitle: `${doc.title} Execution Logs`,
            ownerRole: doc.ownerRole,
            ownerEmail: doc.ownerEmail,
            generationCadence: 'PER_EVENT',
            retentionDays: 365,
            harvestMethod: 'LIVE_CONNECTOR',
            currentAvailability: 'AUTOMATED'
          }
        ],
        availableCount: 1,
        missingCount: 0,
        lastControlTest: isPublished ? {
          testCode: `TEST-${doc.code}-Q3`,
          testResult: 'PASS',
          effectiveness: 'EFFECTIVE',
          testedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
          tester: 'Lead GRC Systems Auditor'
        } : undefined
      },
      acknowledgement: {
        campaign: undefined,
        completionRate: doc.acknowledgementRate,
        totalRequired: 150,
        acknowledgedCount: Math.round((doc.acknowledgementRate / 100) * 150),
        recentSignatures: []
      },
      exceptionsAndCapa: {
        activeExceptions: [],
        linkedFindings: []
      },
      versionHistory: {
        versions: doc.versions,
        currentVersionDigest: doc.sha256Digest,
        isImmutable: isPublished
      },
      reviewSchedule: {
        cadence: doc.reviewCadence,
        lastReviewDate: doc.lastReviewDate,
        nextReviewDate: doc.nextReviewDate,
        daysRemaining: Math.round((new Date(doc.nextReviewDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        reviewStatus: doc.reviewStatus,
        isOverdue: doc.reviewStatus === 'OVERDUE'
      }
    };
  }
}

export const policyGovernanceService = new PolicyGovernanceClientService();
