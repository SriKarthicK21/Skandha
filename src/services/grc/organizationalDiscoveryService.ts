// ============================================================================
// SKANDA ENTERPRISE GRC: PHASE 13.1 ORGANIZATIONAL DISCOVERY FRONTEND SERVICE
// Path: src/services/grc/organizationalDiscoveryService.ts
//
// Provides client-side state management, API integration, and data binding
// for the Client Discovery Workshop, Process Blueprint Mapper & Documentation Studio.
// ============================================================================

export type InterviewPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type InterviewStatus =
  | 'NOT_STARTED'
  | 'SCHEDULED'
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'AWAITING_INPUT'
  | 'COMPLETED'
  | 'VALIDATED'
  | 'BLOCKED';

export type QuestionCategory =
  | 'PROCESS'
  | 'PEOPLE'
  | 'TECHNOLOGY'
  | 'DATA'
  | 'CONTROL'
  | 'APPROVAL'
  | 'EVIDENCE'
  | 'MONITORING'
  | 'EXCEPTION'
  | 'RISK'
  | 'THIRD_PARTY'
  | 'PRIVACY'
  | 'RETENTION'
  | 'INCIDENT'
  | 'CONTINUITY'
  | 'GOVERNANCE';

export type ControlImplementationStatus =
  | 'IMPLEMENTED'
  | 'PARTIALLY_IMPLEMENTED'
  | 'NOT_IMPLEMENTED'
  | 'NOT_APPLICABLE'
  | 'UNKNOWN';

export type SourceType =
  | 'FRAMEWORK'
  | 'INTERVIEW'
  | 'SYSTEM'
  | 'EVIDENCE'
  | 'CLIENT_CONFIGURATION'
  | 'APPROVED_PROCESS'
  | 'AI_INFERENCE';

export type ReadinessTier =
  | 'READY' // 90-100
  | 'READY_WITH_REVIEW' // 75-89
  | 'INSUFFICIENT_CONTEXT' // 50-74
  | 'INTERVIEW_REQUIRED'; // 0-49

export type DocumentType = 'POLICY' | 'PROCEDURE' | 'SOP' | 'STANDARD' | 'GUIDELINE';

export type DocumentLifecycleStatus =
  | 'AI_DRAFT'
  | 'SME_REVIEW'
  | 'PROCESS_OWNER_REVIEW'
  | 'GRC_REVIEW'
  | 'AUTHORIZED_APPROVER'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'IMPACTED_BY_CHANGE';

export interface InterviewParticipant {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  designation: string;
  attendanceStatus: 'CONFIRMED' | 'ATTENDED' | 'INVITED' | 'DECLINED';
}

export interface InterviewQuestion {
  id: string;
  category: QuestionCategory;
  text: string;
  contextHelp: string;
  required: boolean;
  mappedRequirementCodes: string[];
  mappedControlCodes: string[];
  mappedAssetTypes?: string[];
  suggestedFollowUps?: string[];
}

export interface InterviewResponse {
  responseId: string;
  questionId: string;
  responseText: string;
  answeredBy: string;
  answeredByRole: string;
  answeredAt: string;
  structuredData?: {
    extractedEntities?: string[];
    systemsMentioned?: string[];
    rolesMentioned?: string[];
    activitiesMentioned?: string[];
    evidenceReferences?: string[];
  };
  confidenceScore: number;
  status: 'DRAFT' | 'CONFIRMED' | 'CHALLENGED' | 'SUPERSEDED';
  autoSavedAt: string;
  validationStatus?: 'CONFIRMED' | 'EDITED' | 'REJECTED' | 'REQUEST_CLARIFICATION';
  validatedBy?: string;
  validatedAt?: string;
}

export interface CurrentStatePractice {
  id: string;
  tenantId: string;
  department: string;
  processId: string;
  processName: string;
  system: string;
  actor: string;
  activity: string;
  triggerCondition: string;
  frequency: string;
  escalationPath?: string;
  exceptionWorkflow?: string;
  source: SourceType;
  confidence: 'CONFIRMED' | 'UNCONFIRMED' | 'INFERRED';
  participantId?: string;
  interviewId: string;
  createdAt: string;
}

export interface ProcessStepObject {
  stepId: string;
  sequence: number;
  activity: string;
  actor: string;
  responsibleRole: string;
  accountableRole: string;
  application: string;
  inputTrigger: string;
  expectedOutput: string;
  mappedControlCode: string;
  evidenceSource: string;
  identifiedRisk: string;
  approvalRequired: boolean;
  approverRole?: string;
  exceptionPath?: string;
  source: SourceType;
  validationStatus: 'CONFIRMED' | 'PENDING' | 'DISPUTED';
}

export interface ProcessBlueprint {
  processId: string;
  processName: string;
  department: string;
  purpose: string;
  triggerEvent: string;
  inputs: string[];
  outputs: string[];
  steps: ProcessStepObject[];
  actors: string[];
  raci: Array<{ role: string; r: boolean; a: boolean; c: boolean; i: boolean }>;
  applications: string[];
  assets: string[];
  dataElements: string[];
  vendors: string[];
  controls: string[];
  risks: string[];
  evidenceSources: string[];
  approvals: string[];
  exceptions: string[];
  dependencies: string[];
  kpis: string[];
  frequency: string;
  sla: string;
  escalationPath: string;
  businessImpact: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  validationStatus: 'VALIDATED' | 'BLUEPRINT_INCOMPLETE';
  validationBlockers: string[];
}

export interface ControlPractice {
  id: string;
  tenantId: string;
  controlCode: string;
  controlTitle: string;
  processId: string;
  implementationStatus: ControlImplementationStatus;
  isDocumented: boolean;
  isConsistentlyFollowed: boolean;
  ownerRole: string;
  ownerName: string;
  frequency: string;
  supportingSystems: string[];
  evidenceArtifacts: string[];
  exceptionCount: number;
  humanValidated: boolean;
  validatedBy?: string;
  validatedAt?: string;
}

export interface EvidenceSource {
  id: string;
  tenantId: string;
  evidenceName: string;
  processId: string;
  controlCode: string;
  systemSource: string;
  storageLocation: string;
  ownerRole: string;
  generationFrequency: string;
  retentionPeriodDays: number;
  automatedHarvestCapability: 'LIVE_CONNECTOR' | 'API_POLL' | 'MANUAL_UPLOAD';
  connectorId?: string;
  verificationStatus: 'AVAILABLE' | 'MISSING' | 'EXPIRED' | 'NOT_CONFIGURED' | 'AUTOMATED' | 'VERIFIED';
}

export interface DocumentationReadiness {
  id: string;
  tenantId: string;
  processId: string;
  docType: DocumentType;
  readinessScore: number;
  status: ReadinessTier;
  scoreBreakdown: {
    departmentIdentified: boolean;
    processIdentified: boolean;
    ownerIdentified: boolean;
    smeInterviewed: boolean;
    currentPracticeCaptured: boolean;
    rolesIdentified: boolean;
    systemsIdentified: boolean;
    dataIdentified: boolean;
    controlsIdentified: boolean;
    evidenceIdentified: boolean;
    exceptionsIdentified: boolean;
    approvalsIdentified: boolean;
  };
  blockers: string[];
  recommendations: string[];
  evaluatedAt: string;
}

export interface DiscoveryConflict {
  id: string;
  tenantId: string;
  title: string;
  affectedProcessId: string;
  affectedControlCode: string;
  claimA: { source: SourceType; claim: string; timestamp: string; actor?: string };
  claimB: { source: SourceType; claim: string; timestamp: string; actor?: string };
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'ACCEPTED' | 'REJECTED';
  riskImpact: string;
  owner: string;
  resolution?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ProcessGapItem {
  id: string;
  category:
    | 'PROCESS_GAP'
    | 'CONTROL_GAP'
    | 'DOCUMENTATION_GAP'
    | 'EVIDENCE_GAP'
    | 'OWNERSHIP_GAP'
    | 'TECHNOLOGY_GAP'
    | 'TRAINING_GAP'
    | 'MONITORING_GAP'
    | 'RISK_GAP';
  department: string;
  processId: string;
  requirement: string;
  controlCode: string;
  evidenceRef?: string;
  riskSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  owner: string;
  description: string;
  recommendedRemediation: string;
}

export interface SectionProvenance {
  sectionKey: string;
  title: string;
  sourceType: SourceType;
  sourceReferences: Array<{
    type: 'INTERVIEW' | 'CONTROL' | 'EVIDENCE' | 'SYSTEM' | 'FRAMEWORK' | 'PROCESS';
    id: string;
    description: string;
    sha256?: string;
  }>;
  aiGenerated: boolean;
  humanConfirmed: boolean;
  confidenceScore: number;
}

export interface AuthoritativeDocument {
  id: string;
  tenantId: string;
  docType: DocumentType;
  title: string;
  code: string;
  version: string;
  processId: string;
  department: string;
  lifecycleStatus: DocumentLifecycleStatus;
  readinessScore: number;
  generatedAt: string;
  generatedBy: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  publishedAt?: string;
  rejectionReason?: string;
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
  provenance: SectionProvenance[];
  sha256Digest: string;
  impactedByChange: boolean;
}

export interface DocumentImpactReport {
  impactReportId: string;
  timestamp: string;
  triggerEvent: string;
  changedEntityId: string;
  affectedProcessId: string;
  impactedDocuments: Array<{
    documentId: string;
    docType: DocumentType;
    title: string;
    impactReason: string;
    suggestedAction: 'REVISE_SOP' | 'UPDATE_POLICY_ROLES' | 'RE_TEST_CONTROL' | 'CONDUCT_DELTA_INTERVIEW';
    confidence: number;
  }>;
}

export interface DiscoveryDepartmentWorkplanItem {
  departmentId: string;
  departmentName: string;
  ownerRole: string;
  ownerName: string;
  priority: InterviewPriority;
  status: InterviewStatus;
  processesCount: number;
  processes: Array<{ id: string; name: string; priority: InterviewPriority; readiness: number }>;
  smes: Array<{ name: string; role: string; email: string }>;
  processCoveragePercentage: number;
  controlCoveragePercentage: number;
  evidenceCoveragePercentage: number;
  documentationReadinessScore: number;
  criticalGapsCount: number;
  nextBestAction: string;
  applicableFrameworks: string[];
  controlsInScope: string[];
}

// ----------------------------------------------------------------------------
// Client-Side Deterministic Baseline & Mock Data for Acme Demo Scenario
// ----------------------------------------------------------------------------
export const DEFAULT_DEPARTMENTS: DiscoveryDepartmentWorkplanItem[] = [
  {
    departmentId: 'DEP-HR-01',
    departmentName: 'Human Resources',
    ownerRole: 'HR Operations Head',
    ownerName: 'Rachel Green',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    processesCount: 3,
    processes: [
      { id: 'PROC-HR-001', name: 'Employee Onboarding & Access Provisioning', priority: 'HIGH', readiness: 95 },
      { id: 'PROC-HR-002', name: 'Joiner-Mover-Leaver (JML) Deprovisioning', priority: 'HIGH', readiness: 80 },
      { id: 'PROC-HR-003', name: 'Background Verification & KYC Screening', priority: 'MEDIUM', readiness: 70 }
    ],
    smes: [
      { name: 'Rachel Green', role: 'HR Operations Manager', email: 'rachel.green@acmefintech.io' },
      { name: 'Monica Geller', role: 'People & Culture Lead', email: 'monica.geller@acmefintech.io' }
    ],
    processCoveragePercentage: 100,
    controlCoveragePercentage: 92,
    evidenceCoveragePercentage: 88,
    documentationReadinessScore: 92,
    criticalGapsCount: 0,
    nextBestAction: 'Review and approve HR-001 Onboarding Policy & SOP',
    applicableFrameworks: ['ISO 27001:2022', 'ISO 27701:2019', 'SOC 2 Type II', 'DPDP Act 2023'],
    controlsInScope: ['A.5.15', 'A.5.18', 'A.5.34', 'A.6.1', 'A.6.2']
  },
  {
    departmentId: 'DEP-IT-01',
    departmentName: 'Information Technology & Cloud SecOps',
    ownerRole: 'Head of Infrastructure',
    ownerName: 'David Miller',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    processesCount: 5,
    processes: [
      { id: 'PROC-IT-001', name: 'Privileged IAM & Cloud Credential Rotation', priority: 'CRITICAL', readiness: 65 },
      { id: 'PROC-IT-002', name: 'SaaS Identity Lifecycle & Entra ID Sync', priority: 'HIGH', readiness: 75 },
      { id: 'PROC-IT-003', name: 'Endpoint Management & MDM BitLocker', priority: 'HIGH', readiness: 85 }
    ],
    smes: [
      { name: 'David Miller', role: 'IAM & Cloud Security Lead', email: 'david.miller@acmefintech.io' },
      { name: 'Chandler Bing', role: 'DevSecOps Engineer', email: 'chandler.bing@acmefintech.io' }
    ],
    processCoveragePercentage: 80,
    controlCoveragePercentage: 75,
    evidenceCoveragePercentage: 70,
    documentationReadinessScore: 72,
    criticalGapsCount: 1,
    nextBestAction: 'Complete Interview on AWS IAM Root Key Rotation',
    applicableFrameworks: ['ISO 27001:2022', 'SOC 2 Type II', 'MAS TRM 2021'],
    controlsInScope: ['A.5.15', 'A.8.1', 'A.8.2', 'A.8.5', 'A.8.7']
  },
  {
    departmentId: 'DEP-SEC-01',
    departmentName: 'Information Security & GRC',
    ownerRole: 'CISO',
    ownerName: 'Marcus Vance',
    priority: 'CRITICAL',
    status: 'VALIDATED',
    processesCount: 4,
    processes: [
      { id: 'PROC-SEC-001', name: 'Continuous Vulnerability & Patch Management', priority: 'CRITICAL', readiness: 95 },
      { id: 'PROC-SEC-002', name: 'Security Incident Triage & Forensic Response', priority: 'CRITICAL', readiness: 90 }
    ],
    smes: [
      { name: 'Marcus Vance', role: 'Chief Information Security Officer', email: 'marcus.vance@acmefintech.io' }
    ],
    processCoveragePercentage: 100,
    controlCoveragePercentage: 100,
    evidenceCoveragePercentage: 95,
    documentationReadinessScore: 94,
    criticalGapsCount: 0,
    nextBestAction: 'Approve published ISMS Risk Assessment Standard',
    applicableFrameworks: ['ISO 27001:2022', 'ISO 42001:2023', 'MAS TRM 2021'],
    controlsInScope: ['A.5.1', 'A.5.2', 'A.5.24', 'A.8.8']
  },
  {
    departmentId: 'DEP-ENG-01',
    departmentName: 'Engineering & Product DevOps',
    ownerRole: 'VP of Engineering',
    ownerName: 'Sarah Connor',
    priority: 'HIGH',
    status: 'PLANNED',
    processesCount: 4,
    processes: [
      { id: 'PROC-ENG-001', name: 'Secure SDLC & Peer Code Review Gate', priority: 'HIGH', readiness: 55 },
      { id: 'PROC-ENG-002', name: 'CI/CD Pipeline SAST/DAST & Secrets Scan', priority: 'HIGH', readiness: 60 }
    ],
    smes: [
      { name: 'Sarah Connor', role: 'VP of Engineering', email: 'sarah.connor@acmefintech.io' }
    ],
    processCoveragePercentage: 60,
    controlCoveragePercentage: 50,
    evidenceCoveragePercentage: 45,
    documentationReadinessScore: 52,
    criticalGapsCount: 1,
    nextBestAction: 'Schedule SME Discovery on CI/CD Secret Scanning',
    applicableFrameworks: ['ISO 27001:2022', 'SOC 2 Type II'],
    controlsInScope: ['A.8.25', 'A.8.28', 'A.8.31', 'A.8.32']
  },
  {
    departmentId: 'DEP-FIN-01',
    departmentName: 'Finance & Accounts',
    ownerRole: 'Finance Controller',
    ownerName: 'Phoebe Buffay',
    priority: 'MEDIUM',
    status: 'NOT_STARTED',
    processesCount: 2,
    processes: [
      { id: 'PROC-FIN-001', name: 'Vendor Invoice & Dual Authorization Wire', priority: 'MEDIUM', readiness: 40 }
    ],
    smes: [
      { name: 'Phoebe Buffay', role: 'Finance Controller', email: 'phoebe.buffay@acmefintech.io' }
    ],
    processCoveragePercentage: 30,
    controlCoveragePercentage: 30,
    evidenceCoveragePercentage: 20,
    documentationReadinessScore: 35,
    criticalGapsCount: 0,
    nextBestAction: 'Plan initial scoping interview with Finance Controller',
    applicableFrameworks: ['ISO 27001:2022', 'SOC 2 Type II'],
    controlsInScope: ['A.5.15', 'A.8.2']
  },
  {
    departmentId: 'DEP-LEG-01',
    departmentName: 'Legal & Privacy Compliance',
    ownerRole: 'General Counsel & DPO',
    ownerName: 'Harvey Specter',
    priority: 'MEDIUM',
    status: 'NOT_STARTED',
    processesCount: 2,
    processes: [
      { id: 'PROC-LEG-001', name: 'Customer Privacy Notice & DPDP Consent', priority: 'HIGH', readiness: 45 }
    ],
    smes: [
      { name: 'Harvey Specter', role: 'General Counsel & DPO', email: 'harvey.specter@acmefintech.io' }
    ],
    processCoveragePercentage: 40,
    controlCoveragePercentage: 35,
    evidenceCoveragePercentage: 30,
    documentationReadinessScore: 40,
    criticalGapsCount: 0,
    nextBestAction: 'Review DPDP Data Principal Consent Artifacts',
    applicableFrameworks: ['ISO 27701:2019', 'DPDP Act 2023'],
    controlsInScope: ['A.5.31', 'A.5.32', 'A.5.34']
  }
];

export const ACME_ONBOARDING_BLUEPRINT: ProcessBlueprint = {
  processId: 'PROC-HR-001',
  processName: 'Employee Onboarding & Access Provisioning',
  department: 'Human Resources',
  purpose: 'Standardizes end-to-end employee onboarding, background screening verification, identity provisioning in Entra ID, role-based access assignment via ServiceNow, and mandatory MFA enforcement.',
  triggerEvent: 'Signed employment contract uploaded to Keka HRMS',
  inputs: ['Signed Offer Letter', 'Government Identity KYC', 'Job Description & Role Requisition'],
  outputs: ['Active Entra ID Profile', 'Role-Based Entitlements', 'Provisioning Audit Log', 'Asset Assignment Record'],
  steps: [
    {
      stepId: 'STEP-001',
      sequence: 1,
      activity: 'HR creates employee master profile in Keka upon signed contract execution',
      actor: 'HR Operations Lead',
      responsibleRole: 'HR Operations Lead',
      accountableRole: 'HR Head',
      application: 'Keka HRMS',
      inputTrigger: 'Signed employment contract',
      expectedOutput: 'Deterministic Employee ID and record created',
      mappedControlCode: 'A.5.18',
      evidenceSource: 'Keka Employee Master Log',
      identifiedRisk: 'Data entry error in personal email or designation',
      approvalRequired: true,
      approverRole: 'Hiring Manager',
      source: 'INTERVIEW',
      validationStatus: 'CONFIRMED'
    },
    {
      stepId: 'STEP-002',
      sequence: 2,
      activity: 'Hiring Manager reviews and approves requested application access profile',
      actor: 'Hiring Manager',
      responsibleRole: 'Hiring Manager',
      accountableRole: 'Department Head',
      application: 'ServiceNow ITSM',
      inputTrigger: 'Keka automated webhook',
      expectedOutput: 'Approved access entitlement matrix',
      mappedControlCode: 'A.5.15',
      evidenceSource: 'ServiceNow RITM Approval Ticket',
      identifiedRisk: 'Excessive permissions requested beyond least privilege',
      approvalRequired: true,
      approverRole: 'Hiring Manager',
      source: 'INTERVIEW',
      validationStatus: 'CONFIRMED'
    },
    {
      stepId: 'STEP-003',
      sequence: 3,
      activity: 'ServiceNow webhook triggers IAM access provisioning request',
      actor: 'ServiceNow Integration Engine',
      responsibleRole: 'IT Service Desk Lead',
      accountableRole: 'IT Head',
      application: 'ServiceNow ITSM',
      inputTrigger: 'Manager Approval in ServiceNow',
      expectedOutput: 'Automated provisioning payload dispatched to Entra ID',
      mappedControlCode: 'A.5.15',
      evidenceSource: 'ServiceNow Webhook Log',
      identifiedRisk: 'API token expiration or webhook failure',
      approvalRequired: false,
      source: 'SYSTEM',
      validationStatus: 'CONFIRMED'
    },
    {
      stepId: 'STEP-004',
      sequence: 4,
      activity: 'Create Microsoft Entra ID user account with MFA conditional access policy enforced',
      actor: 'IAM Lead',
      responsibleRole: 'IAM Lead',
      accountableRole: 'Head of Infrastructure',
      application: 'Microsoft Entra ID',
      inputTrigger: 'Automated provisioning payload',
      expectedOutput: 'User account created with forced MFA registration on first logon',
      mappedControlCode: 'A.5.15',
      evidenceSource: 'Entra ID Audit & Conditional Access Log',
      identifiedRisk: 'Account created without MFA policy attachment',
      approvalRequired: false,
      source: 'INTERVIEW',
      validationStatus: 'CONFIRMED'
    },
    {
      stepId: 'STEP-005',
      sequence: 5,
      activity: 'Enforce MFA setup via Microsoft Authenticator prior to granting desktop session',
      actor: 'New Hire / Microsoft Entra ID',
      responsibleRole: 'New Hire',
      accountableRole: 'IAM Lead',
      application: 'Microsoft Entra ID',
      inputTrigger: 'Initial logon attempt',
      expectedOutput: 'MFA verified and registered in tenant directory',
      mappedControlCode: 'A.5.15',
      evidenceSource: 'Azure AD Sign-In Telemetry Log',
      identifiedRisk: 'SMS OTP downgrade instead of Authenticator App',
      approvalRequired: false,
      source: 'EVIDENCE',
      validationStatus: 'CONFIRMED'
    },
    {
      stepId: 'STEP-006',
      sequence: 6,
      activity: 'Verify complete onboarding evidence package and archive immutable records',
      actor: 'GRC Lead',
      responsibleRole: 'GRC Lead',
      accountableRole: 'CISO',
      application: 'SKANDA Continuous Compliance Engine',
      inputTrigger: 'MFA registration completion',
      expectedOutput: 'Closed-loop compliance ledger entry linked to ISO 27001 A.5.15',
      mappedControlCode: 'A.5.15',
      evidenceSource: 'SKANDA WORM Evidence Ledger',
      identifiedRisk: 'Unrecorded manual access grants',
      approvalRequired: true,
      approverRole: 'CISO',
      source: 'APPROVED_PROCESS',
      validationStatus: 'CONFIRMED'
    }
  ],
  actors: ['HR Operations Lead', 'Hiring Manager', 'IT Service Desk Lead', 'IAM Lead', 'New Hire', 'GRC Lead', 'CISO'],
  raci: [
    { role: 'HR Operations Lead', r: true, a: true, c: true, i: false },
    { role: 'Hiring Manager', r: true, a: true, c: false, i: false },
    { role: 'IAM Lead', r: true, a: false, c: false, i: true },
    { role: 'CISO', r: false, a: true, c: true, i: true }
  ],
  applications: ['Keka HRMS', 'ServiceNow ITSM', 'Microsoft Entra ID', 'Atlassian Jira'],
  assets: ['Enterprise Active Directory', 'Workstation Laptops', 'Okta SSO Tenant'],
  dataElements: ['Full Name', 'Government ID / SSN', 'Corporate Email', 'Bank Details', 'MFA Secret Key'],
  vendors: ['Microsoft Cloud', 'ServiceNow Inc.', 'Keka HR Technologies'],
  controls: ['A.5.15', 'A.5.18', 'A.5.34', 'A.8.2'],
  risks: ['RSK-IAM-001 (Unauthorized Privilege Escalation)', 'RSK-PRIV-002 (PII Exposure during Onboarding)'],
  evidenceSources: ['EVIDSRC-SN-01 (ServiceNow RITM Ticket)', 'EVIDSRC-ENTRA-02 (Entra ID User MFA Log)'],
  approvals: ['Hiring Manager Role Approval', 'CISO Special Privilege Exception'],
  exceptions: ['Emergency Contractor 72-Hour Temp Access with CISO Sign-off'],
  dependencies: ['Keka HRMS Live API', 'Microsoft Entra Graph Sync', 'ServiceNow Webhook Connector'],
  kpis: ['Average Onboarding Duration < 24 Hours', 'MFA Enforcement Rate = 100%', 'Zero Orphaned Accounts'],
  frequency: 'PER_EVENT',
  sla: '24 Hours from Offer Acceptance',
  escalationPath: 'Escalate to CISO if privileged access requested without VP sign-off',
  businessImpact: 'CRITICAL',
  validationStatus: 'VALIDATED',
  validationBlockers: []
};

export const DEFAULT_GAPS: ProcessGapItem[] = [
  {
    id: 'GAP-IAM-001',
    category: 'EVIDENCE_GAP',
    department: 'Information Technology & Cloud SecOps',
    processId: 'PROC-IT-001',
    requirement: 'ISO 27001:2022 A.8.5',
    controlCode: 'A.8.5',
    evidenceRef: 'AWS IAM Root Rotation Key Logs',
    riskSeverity: 'CRITICAL',
    owner: 'IAM Lead',
    description: 'Quarterly root API key rotation is practiced manually, but automated proof log connector is unconfigured.',
    recommendedRemediation: 'Connect AWS CloudTrail Live Sensor to continuously harvest key rotation events.'
  },
  {
    id: 'GAP-ENG-002',
    category: 'PROCESS_GAP',
    department: 'Engineering & Product DevOps',
    processId: 'PROC-ENG-001',
    requirement: 'ISO 27001:2022 A.8.28',
    controlCode: 'A.8.28',
    riskSeverity: 'HIGH',
    owner: 'VP of Engineering',
    description: 'Peer code review gate is enforced in GitHub PRs, but emergency hotfix bypass procedure lacks formal sign-off step.',
    recommendedRemediation: 'Update SDLC SOP to mandate post-incident retrospective approval for emergency commits within 48 hours.'
  },
  {
    id: 'GAP-HR-003',
    category: 'DOCUMENTATION_GAP',
    department: 'Human Resources',
    processId: 'PROC-HR-002',
    requirement: 'ISO 27001:2022 A.5.18',
    controlCode: 'A.5.18',
    riskSeverity: 'MEDIUM',
    owner: 'HR Operations Head',
    description: 'Deprovisioning checklist is executed in Keka, but standalone Joiner-Mover-Leaver Standard Operating Procedure (SOP) is not yet published.',
    recommendedRemediation: 'Generate and publish SKD-SOP-HR-002 from validated process blueprint in Documentation Studio.'
  }
];

// ============================================================================
// CLIENT DISCOVERY WORKSHOP API CLIENT
// ============================================================================

class OrganizationalDiscoveryClient {
  public getDepartments(tenantId: string = 'SKANDA-DEMO-ENTERPRISE'): DiscoveryDepartmentWorkplanItem[] {
    return DEFAULT_DEPARTMENTS;
  }

  public getCommandCentreMetrics(tenantId: string = 'SKANDA-DEMO-ENTERPRISE') {
    const deps = DEFAULT_DEPARTMENTS;
    const totalProcesses = deps.reduce((sum, d) => sum + d.processesCount, 0);
    const completedInterviews = deps.filter(d => d.status === 'VALIDATED' || d.status === 'COMPLETED').length;
    const avgReadiness = Math.round(deps.reduce((sum, d) => sum + d.documentationReadinessScore, 0) / deps.length);

    return {
      totalDepartmentsInScope: deps.length,
      totalProcessesDiscovered: totalProcesses,
      totalInterviewPlans: 12,
      completedInterviewsCount: completedInterviews + 4,
      interviewCompletionPercentage: 75,
      smeCoveragePercentage: 92,
      processCoveragePercentage: 88,
      controlCoveragePercentage: 86,
      evidenceCoveragePercentage: 84,
      overallDocumentationReadinessScore: avgReadiness,
      criticalGapsCount: 2,
      openDiscoveryConflictsCount: 1,
      authoritativeDocumentsCount: 8,
      policiesPendingReview: 2,
      approvedDocumentsCount: 6
    };
  }

  public getProcessBlueprint(processId: string): ProcessBlueprint {
    if (processId === 'PROC-HR-001') {
      return ACME_ONBOARDING_BLUEPRINT;
    }
    // Generic fallback blueprint
    return {
      processId,
      processName: 'Standard Operational Workflow',
      department: 'Corporate',
      purpose: 'Operational process discovered during SME workshop.',
      triggerEvent: 'Business request received',
      inputs: ['User Request'],
      outputs: ['Completed Action'],
      steps: [
        {
          stepId: 'STEP-001',
          sequence: 1,
          activity: 'Execute baseline operational control step',
          actor: 'Process Owner',
          responsibleRole: 'Process Owner',
          accountableRole: 'Department Head',
          application: 'Corporate System',
          inputTrigger: 'Initiation Ticket',
          expectedOutput: 'Verified Action',
          mappedControlCode: 'A.5.1',
          evidenceSource: 'Audit Log',
          identifiedRisk: 'Incomplete execution',
          approvalRequired: true,
          source: 'INTERVIEW',
          validationStatus: 'CONFIRMED'
        }
      ],
      actors: ['Process Owner', 'Department Head'],
      raci: [{ role: 'Process Owner', r: true, a: true, c: false, i: false }],
      applications: ['Corporate Portal'],
      assets: ['Primary Database'],
      dataElements: ['Operational Records'],
      vendors: ['Cloud Provider'],
      controls: ['A.5.1'],
      risks: ['RSK-OP-001'],
      evidenceSources: ['EVID-001'],
      approvals: ['Manager Approval'],
      exceptions: ['None'],
      dependencies: ['Core Network'],
      kpis: ['SLA Compliance > 99%'],
      frequency: 'CONTINUOUS',
      sla: '24 Hours',
      escalationPath: 'Escalate to GRC Manager',
      businessImpact: 'MEDIUM',
      validationStatus: 'VALIDATED',
      validationBlockers: []
    };
  }

  public getGaps(): ProcessGapItem[] {
    return DEFAULT_GAPS;
  }

  public getDocumentationReadiness(processId: string, docType: DocumentType = 'POLICY'): DocumentationReadiness {
    const isValidated = processId === 'PROC-HR-001' || processId === 'PROC-IT-001';
    const score = isValidated ? 95 : 35;
    const status: ReadinessTier = isValidated ? 'READY' : 'INSUFFICIENT_CONTEXT';
    const blockers = isValidated ? [] : ['SME Interview not completed', 'Process RACI not signed off', 'Evidence sources not validated'];

    return {
      id: `READINESS-${processId}-${docType}`,
      tenantId: 'SKANDA-DEMO-ENTERPRISE',
      processId,
      docType,
      readinessScore: score,
      status,
      scoreBreakdown: {
        departmentIdentified: true,
        processIdentified: true,
        ownerIdentified: isValidated,
        smeInterviewed: isValidated,
        currentPracticeCaptured: isValidated,
        rolesIdentified: isValidated,
        systemsIdentified: isValidated,
        dataIdentified: isValidated,
        controlsIdentified: isValidated,
        evidenceIdentified: isValidated,
        exceptionsIdentified: isValidated,
        approvalsIdentified: isValidated
      },
      blockers,
      recommendations: isValidated ? ['Ready for authoritative document publishing'] : ['Conduct SME interview with process owner'],
      evaluatedAt: new Date().toISOString()
    };
  }

  public generateAuthoritativeDocument(processId: string, docType: DocumentType, actor: string): { success: boolean; document?: AuthoritativeDocument; error?: string } {
    const readiness = this.getDocumentationReadiness(processId, docType);
    if (readiness.status === 'INSUFFICIENT_CONTEXT' || readiness.status === 'INTERVIEW_REQUIRED') {
      return {
        success: false,
        error: `READINESS_GATE_BLOCKED: Cannot generate authoritative ${docType}. Discovery state is ${readiness.status} (Score: ${readiness.readinessScore}%). Blockers: ${readiness.blockers.join(', ')}`
      };
    }

    const doc: AuthoritativeDocument = {
      id: `DOC-${docType}-${processId}-${Date.now().toString().slice(-4)}`,
      tenantId: 'SKANDA-DEMO-ENTERPRISE',
      docType,
      title: `${docType === 'SOP' ? 'Standard Operating Procedure' : 'Policy'}: ${processId}`,
      code: `SKD-${docType}-${processId.replace('PROC-', '')}`,
      version: '1.0',
      processId,
      department: 'Human Resources',
      lifecycleStatus: 'APPROVED',
      readinessScore: readiness.readinessScore,
      generatedAt: new Date().toISOString(),
      generatedBy: actor,
      content: {
        purpose: 'Authoritative operating procedure derived from validated organizational discovery blueprint.',
        scope: 'Enterprise wide operational scope',
        objectives: ['Ensure compliant execution', 'Enforce least privilege'],
        definitions: { 'MFA': 'Multi-Factor Authentication', 'KYC': 'Know Your Customer' },
        rolesAndResponsibilities: [
          { role: 'Process Owner', mandate: 'Ensure consistent execution', r: true, a: true, c: false, i: false }
        ],
        requirementsOrSteps: [
          { stepNumber: 1, actor: 'HR Ops', system: 'Keka', action: 'Create profile', expectedOutput: 'Employee ID' }
        ],
        controlMappings: [{ controlCode: 'A.5.15', requirement: 'Access Control', practice: 'MFA Enforced' }],
        exceptionHandling: { workflow: 'CISO Approval', approver: 'CISO', maxDays: 30 },
      governanceAndReview: { cycle: 'ANNUAL', owner: 'HR Head', approver: 'CISO' }
      },
      provenance: [
        {
          sectionKey: 'OVERVIEW',
          title: 'Document Overview & Procedures',
          sourceType: 'INTERVIEW',
          sourceReferences: [
            { type: 'INTERVIEW', id: 'int-01', description: 'HR Discovery Session' },
            { type: 'SYSTEM', id: 'sys-keka-01', description: 'HRMS Keka' }
          ],
          aiGenerated: false,
          humanConfirmed: true,
          confidenceScore: 95
        }
      ],
      sha256Digest: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      impactedByChange: false
    };

    return { success: true, document: doc };
  }
}

export const organizationalDiscoveryClient = new OrganizationalDiscoveryClient();
export const organizationalDiscoveryService = organizationalDiscoveryClient;
