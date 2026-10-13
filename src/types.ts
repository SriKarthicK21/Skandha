export type GlobalTheme = 'midnight' | 'light';

export type ContrastMode = 'enhanced' | 'high' | 'ultra';
export type FontSizeScale = 'standard' | 'comfortable' | 'large';
export type FontWeightMode = 'standard' | 'boosted';
export type FontFamilyChoice = 'josefin-sans' | 'inter' | 'plus-jakarta' | 'sora' | 'mono' | 'times-new-roman';

export interface ReadabilitySettings {
  contrastMode: ContrastMode;
  fontSize: FontSizeScale;
  fontWeight: FontWeightMode;
  fontFamily: FontFamilyChoice;
}

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'PLATFORM_AUDITOR' 
  | 'COMPANY_ADMIN' 
  | 'INTERNAL_AUDITOR' 
  | 'DEPARTMENT_CONTRIBUTOR' 
  | 'EXECUTIVE_VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string; // 'super' for Super Admin or specific tenant ID
  departmentId?: string;
  avatar?: string;
  title: string;
}

export interface MasterCategory {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface MasterIndustry {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface MasterDepartment {
  id: string;
  name: string;
  category: string;
  active: boolean;
}

export interface DepartmentPolicyRequirement {
  id: string;
  docCode: string;
  title: string;
  type: 'POLICY' | 'PROCEDURE' | 'SOP' | 'REGISTER' | 'PLAN';
  mandatory: boolean;
  isoClause: string;
  annexAControl: string;
  status: 'Compliant & Approved' | 'In Review' | 'Gap - Required' | 'Exempt';
  assignedOwner: string;
  lastAuditDate?: string;
  nextReviewDate?: string;
  version: string;
  implementationNotes?: string;
}

export interface DepartmentScopeProfile {
  id: string; // matches deptId e.g. 'dept_it' or 'cdept_123'
  tenantId: string;
  name: string;
  category: string;
  isInScope: boolean;
  leadOwner: string;
  leadEmail?: string;
  headcount: number;
  scopeBoundary: string;
  coreProcesses: string[];
  criticalAssetsAndSystems: string[];
  dataClassifications: Array<'Confidential' | 'Restricted' | 'Internal' | 'Public'>;
  workLocations: string[];
  applicableAnnexAControls: string[];
  applicableIsoClauses: string[];
  applicableFrameworks: string[];
  threatVectors: string[];
  policyRequirements: DepartmentPolicyRequirement[];
  maturityLevel: number; // 1-5 (CMMI)
  readinessScore: number; // 0-100
  auditorNotes?: string;
  updatedAt: string;
}

export interface ControlItem {
  id: string;
  controlCode: string; // e.g. "A.5.1", "A.8.1"
  title: string;
  category: string; // e.g. "Organizational", "People", "Physical", "Technological"
  framework: string; // e.g. "ISO/IEC 27001:2022"
  description: string;
  guidance: string;
  applicable: boolean;
  justification: string;
  scopeBoundaryCitation?: string; // ISO 27001:2022 Clause 4.3 Scope Boundary Citation
  riskAssessmentCitation?: string; // ISO 27001:2022 Clause 6.1.2 Risk Assessment Reference
  compensatingControlRef?: string; // ISO 27001:2022 Clause 6.1.3 Compensating Control Link
  clientComments?: string;
  maturityLevel: number; // 0-5
  remediationOwner?: string;
  targetDate?: string;
  responsibleDepartment: string;
  evidenceRequirements: string[];
  collectionFrequency: 'Monthly' | 'Quarterly' | 'Bi-Annual' | 'Annual' | 'Continuous';
  acceptanceCriteria: string;
  implementationStatus: 'Not Started' | 'In Progress' | 'Implemented' | 'Monitored' | 'Audited' | 'Partially Implemented' | 'Planned';
  implementationNotes?: string;
  remediationPriority?: 'Low' | 'Medium' | 'High' | 'Critical';
  remediationMilestones?: Array<{
    id: string;
    title: string;
    targetDate?: string;
    completed: boolean;
    owner?: string;
  }>;
  mappedRiskCodes?: string[];
  mappedPolicyIds?: string[]; // IDs or docCodes of mapped internal policies/procedures (e.g. ['POL-ISMS-01'])
  mappedEvidenceIds?: string[]; // IDs of mapped evidence files (e.g. ['evd_1'])
}

export interface GeneratedDocument {
  id: string;
  docCode: string; // e.g. "ARP_ISMS_P11", "ARP_ISMS_PR07"
  title: string;
  type: 'POLICY' | 'PROCEDURE' | 'REGISTER' | 'SCHEDULE';
  category: string;
  version: string;
  status: 'LOCKED' | 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED';
  owner: string;
  approver: string;
  effectiveDate: string;
  reviewCycle: string; // e.g. "Annual"
  content: string;
  classification?: string; // e.g. "Private (Internal)"
  standard?: string; // e.g. "ISO/IEC 27001:2022" or "ISO/IEC 27001:2022 / MAS TRM Guidelines"
  documentOwner?: string; // e.g. "Chief Information Security Officer (CISO)"
  issuedBy?: string; // e.g. "TL / Manager"
  approvedBy?: string; // e.g. "Chief Information Security Officer (CISO)"
  acknowledgementCount?: number;
  lastModified: string;
  // Multi-page PDF structured fields
  documentControlStatements?: string[];
  revisionHistory?: Array<{
    sNo: string;
    reviewDate: string;
    pageNo: string;
    issueNo: string;
    changeDescription: string;
    approvedBy: string;
  }>;
  tableOfContents?: Array<{
    title: string;
    pageNo: number;
    level?: number;
  }>;
  pages?: Array<{
    pageNumber: number;
    title?: string;
    content: string;
    sections?: Array<{
      heading?: string;
      subHeading?: string;
      body?: string;
      bullets?: string[];
      letteredItems?: string[];
      table?: {
        headers: string[];
        rows: string[][];
      };
    }>;
  }>;
  // Policy Lifecycle & Audit Signatures
  approvalStage?: 'DRAFT' | 'TECHNICAL_REVIEW' | 'LEGAL_COMPLIANCE' | 'EXECUTIVE_CISO' | 'PUBLISHED';
  approvalHistory?: PolicyApprovalRecord[];
  digitalSignatures?: PolicyDigitalSignature[];
  nextReviewDate?: string;
  reviewNotifications?: PolicyReviewNotification[];
  contentSha256?: string;

  // Enterprise Consultancy Grade Features (ISO 27001:2022 / MAS TRM / SOC 2 / GDPR)
  raciMatrix?: {
    summary?: string;
    tableHeaders: string[];
    matrix: Array<{
      role: string;
      mandate: string;
      r: boolean;
      a: boolean;
      c: boolean;
      i: boolean;
      escalationTrigger?: string;
      assignedUsers?: string[];
      department?: string;
    }>;
  };
  regulatoryCrossMapping?: Array<{
    framework: string;
    referenceClause: string;
    requirementSummary: string;
    controlHarmonization: string;
    complianceStatus: 'CONFORMING' | 'ALIGNED' | 'COVERED';
  }>;
  compensatingControls?: {
    policyCode: string;
    exceptionWorkflow: string;
    mandatoryCriteria: string[];
    approvalMatrix: Array<{
      riskLevel: string;
      approverRole: string;
      maxValidityDays: number;
      compensatingRequirement: string;
    }>;
    auditRegistryRef: string;
  };
  evidenceCollectionPoints?: Array<{
    artifactId: string;
    artifactName: string;
    evidenceModulePath: string;
    evidenceId?: string;
    collectionMethod: string;
    samplingProtocol: string;
    retentionSla: string;
    sha256Digest?: string;
  }>;
  executiveSignOff?: {
    statement: string;
    signers: Array<{
      roleTitle: string;
      name: string;
      title: string;
      organization?: string;
      date: string;
      signatureBadge: string;
      verificationHash: string;
      status: 'APPROVED' | 'RATIFIED' | 'ATTESTED';
    }>;
  };

  // Lead Auditor Standards (TÜV / BSI Mandatory Headers & Clause 9.1 KPIs)
  isoAuditHeader?: {
    docId: string;
    classification: 'Confidential' | 'Restricted' | 'Internal' | 'Public';
    owner: string;
    approver: string;
    effectiveDate: string;
    reviewCycle: string;
    ismsClauseMapping: string;
    annexAControls: string[];
    cryptographicSha256Seal: string;
  };
  clause91Kpis?: Array<{
    metricId: string;
    objective: string;
    targetSla: string;
    measurementCadence: 'Continuous' | 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual';
    telemetrySourceOrTool: string;
    responsibleRole: string;
  }>;

  // Formal TÜV Documentation Standard: Standard Operating Procedure (SOP) Structure
  sopStructure?: FormalTuvSopStructure;
}

/**
 * Formal TÜV Documentation Standards for Standard Operating Procedures (SOPs)
 * Conforming to ISO/IEC 27001:2022 Clause 8.1 and ISO 19011:2018 audit specifications.
 */
export interface SopProcessTrigger {
  triggerId: string;
  triggerName: string;
  category: 'AUTOMATED_ALERT' | 'SCHEDULED_CADENCE' | 'SERVICE_REQUEST' | 'CRITICAL_INCIDENT' | 'STATUTORY_NOTIFICATION' | 'ANOMALY_THRESHOLD';
  detectionSystem: string;
  initiatingRole: string;
  slaToInitiate: string; // e.g. "<= 15 Minutes"
  entryCondition: string; // precise operational or threshold criteria
  escalationIfMissed?: string;
}

export interface SopNumberedExecutionStep {
  stepNumber: string; // e.g. "1.0", "2.0", "3.0"
  phase: string; // e.g. "Intake & Triage", "Containment", "Forensic Acquisition", "Remediation", "Post-Mortem"
  stepTitle: string;
  responsibleRole: string;
  actionSummary: string;
  detailedInstructions: string[]; // concrete operational guidelines, CLI commands, console paths
  timeframeSla: string; // e.g. "<= 30 Minutes"
  toolchainOrConsole: string; // e.g. "AWS Console / CloudWatch / Okta Admin / Jira Service Management"
  inputDependencies: string[];
  dualControlGateId?: string; // cross-reference to verification gate
  failureContingency?: string;
}

export interface SopDualControlVerificationGate {
  gateId: string; // e.g. "GATE-DC-01"
  gateTitle: string;
  precedingStep: string; // e.g. "Step 2.0"
  primaryVerifierRole: string;
  secondaryVerifierRole: string;
  verificationCriteria: string[]; // objective checklist items both parties must certify
  enforcementMechanism: string; // e.g. "Hardware FIDO2 Token + Multi-Signer PagerDuty Approval Gate + Jira Ticket State Lock"
  auditEvidenceProduced: string; // e.g. "Immutable cryptographic approval log with dual timestamps and public key signatures"
  zeroBypassRule: string; // e.g. "Self-approval is strictly forbidden; exception requires CISO and General Counsel dual-override."
}

export interface SopOutputArtifact {
  artifactId: string; // e.g. "ART-INC-01"
  artifactTitle: string;
  canonicalFileNaming: string; // e.g. "${COMPANY}_INCIDENT_${YYYYMMDD}_${INCIDENT_ID}_POSTMORTEM_v${VERSION}.pdf"
  generatingStep: string; // e.g. "Step 5.0"
  custodianRole: string;
  storageTarget: string; // e.g. "AWS S3 WORM Object-Locked Compliance Bucket"
  retentionPeriodSla: string; // e.g. "7 Years (MAS Notice 655 / ISO 27001 Clause 7.5)"
  cryptographicIntegritySeal: string; // e.g. "SHA-256 Digest with WORM Version Lock"
  auditorInspectionMethod: string; // e.g. "ISO 19011:2018 §B.3 Documentary Inspection & Checksum Verification"
}

export interface FormalTuvSopStructure {
  sopCode: string;
  sopTitle: string;
  tuvAuditStandard: string; // e.g. "TÜV SÜD / ISO/IEC 27001:2022 Clause 8.1 & ISO 19011:2018"
  fourEyesPrincipleEnforced: boolean;
  processTriggers: SopProcessTrigger[];
  numberedExecutionSteps: SopNumberedExecutionStep[];
  dualControlVerificationGates: SopDualControlVerificationGate[];
  outputArtifacts: SopOutputArtifact[];
}

export interface PolicyApprovalRecord {
  id: string;
  documentId: string;
  documentCode: string;
  documentVersion: string;
  stage: 'DRAFT' | 'TECHNICAL_REVIEW' | 'LEGAL_COMPLIANCE' | 'EXECUTIVE_CISO' | 'PUBLISHED';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISED';
  approverName: string;
  approverRole: string;
  approverEmail?: string;
  assignedDate: string;
  actionDate?: string;
  comments?: string;
  digitalSignatureId?: string;
}

export interface PolicyReviewNotification {
  id: string;
  documentId: string;
  documentCode: string;
  documentTitle: string;
  triggerType: '60_DAY_ADVANCE' | '30_DAY_APPROACHING' | '14_DAY_REMINDER' | '7_DAY_URGENT' | 'OVERDUE_BREACH' | 'STAGE_ADVANCEMENT' | 'MANUAL_DISPATCH';
  recipientName: string;
  recipientRole: string;
  recipientEmail: string;
  daysRemaining: number;
  dueDate: string;
  channel: 'EMAIL' | 'IN_APP' | 'SLACK_WEBHOOK' | 'TEAMS';
  sentTimestamp: string;
  deliveryStatus: 'DELIVERED' | 'PENDING' | 'FAILED' | 'ACKNOWLEDGED';
  messageSummary: string;
  acknowledgedAt?: string;
}

export interface ReviewTriggerRule {
  id: string;
  daysThreshold: number;
  label: string;
  description: string;
  recipientRoles: string[];
  channels: Array<'EMAIL' | 'IN_APP' | 'SLACK_WEBHOOK' | 'TEAMS'>;
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
  enabled: boolean;
}

export interface ISO27001Attributes {
  controlType: Array<'Preventive' | 'Detective' | 'Corrective'>;
  informationSecurityProperties: Array<'Confidentiality' | 'Integrity' | 'Availability'>;
  cybersecurityConcepts: Array<'Identify' | 'Protect' | 'Detect' | 'Respond' | 'Recover'>;
  operationalCapabilities: string[];
  securityDomains: Array<'Governance_and_Ecosystem' | 'Protection' | 'Defense' | 'Resilience'>;
}

export interface PolicyWaiver {
  id: string;
  waiverCode: string; // e.g. "WVR-2026-001"
  documentId?: string;
  documentCode: string;
  documentTitle: string;
  policyClause: string;
  isoAnnexA: string;
  requesterName: string;
  requesterRole: string;
  department: string;
  systemOrAsset: string;
  businessJustification: string;
  riskAssessment: {
    inherentRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    likelihood: number; // 1-5
    impact: number; // 1-5
    residualRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  compensatingControls: string[];
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'EXPIRED' | 'REJECTED' | 'REVOKED';
  requestedDate: string;
  approvedDate?: string;
  approverName?: string;
  approverRole?: string;
  expirationDate: string;
  reviewCadenceDays: number;
  auditorNotes?: string;
}

export interface PolicyDriftAlert {
  id: string;
  policyCode: string;
  policyClause: string;
  annexA: string;
  resourceId: string;
  resourceType: string;
  detectedAt: string;
  driftDescription: string;
  policyRuleExpected: string;
  actualObservedState: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'AUTO_REMEDIATED' | 'WAIVER_REQUESTED' | 'DISMISSED';
  autoRemediationAvailable: boolean;
  autoRemediationAction?: string;
  remediatedAt?: string;
}

export interface CohortAttestationGroup {
  id: string;
  name: string;
  description: string;
  targetDepartments: string[];
  assignedPolicyCodes: string[];
  totalAssignedUsers: number;
  completedAttestations: number;
  pendingAttestations: number;
  lastCadenceTrigger: string;
  cadenceTriggerEvent: 'SCHEDULED_ANNUAL' | 'SUBSTANTIVE_REVISION' | 'MAJOR_INCIDENT' | 'CLOUD_MIGRATION' | 'AUDIT_PREP';
}

export interface PolicyDigitalSignature {
  id: string;
  documentId: string;
  documentCode: string;
  documentTitle: string;
  documentVersion: string;
  signerName: string;
  signerEmail: string;
  signerRole: string;
  signingPurpose: 'INITIAL_APPROVAL' | 'ANNUAL_RECERTIFICATION' | 'EMERGENCY_REVISION' | 'LEGAL_SIGN_OFF' | 'EXECUTIVE_ATTESTATION';
  timestamp: string; // ISO 8601
  ipAddress: string;
  certificateAuthority: string; // e.g. "Skanda CA HMAC-SHA256"
  verificationHash: string; // SHA-256 HMAC of doc content + metadata
  documentChecksum: string; // SHA-256 of document content
  auditDeclaration: string;
  status: 'VALID' | 'REVOKED' | 'SUPERSEDED';
  signatureNotes?: string;
}

export interface DigitalMoU {
  executed: boolean;
  signatoryName: string;
  signatoryRole: string;
  signatoryEmail: string;
  ipAddress: string;
  timestamp: string;
  documentHash: string; // SHA-256
  agreementVersion: string;
  commercialTier: string;
  auditWindowStart: string;
  auditWindowEnd: string;
  leadExternalAuditor: string;
  scopeSummary: string;
  confidentialityTermsAccepted: boolean;
  signatureDataUrl?: string;
}

export interface TenantCompany {
  id: string;
  name: string;
  contactEmail: string;
  registeredCategory: string;
  registeredAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  industryType: string;
  customIndustry?: string;
  onboardingPhase: number; // 1, 2, 3, 4, or 5 (completed)
  
  // Scope
  businessScope: {
    statement: string;
    exclusions: Array<{
      id: string;
      controlOrProcess: string;
      justification: string;
    }>;
    interestedParties: Array<{
      id: string;
      party: string;
      requirements: string;
      legalObligation: string;
    }>;
  };
  
  inScopeDepartmentIds: string[];
  customDepartments: Array<{
    id: string;
    name: string;
    owner: string;
    headcount: number;
  }>;
  departmentScopes?: DepartmentScopeProfile[];
  
  selectedFrameworks: string[]; // e.g. ["ISO/IEC 27001:2022"]
  selectedFrameworkRequirements?: string[]; // Granular requirement IDs e.g. ["req_iso27001_controls", "req_iso42001_aims_soa"]
  soaBaselineLocked: boolean;
  soaBaselineTimestamp?: string;
  soaBaselineUser?: string;
  soaBaselineHash?: string;
  
  controls: ControlItem[];
  generatedDocs: GeneratedDocument[];
  mou: DigitalMoU;
  
  // External Auditor Assignment
  assignedExternalAuditors: string[];
  externalAuditTimeline: {
    startDate: string;
    endDate: string;
    stage1Date: string;
    stage2Date: string;
    status: 'Scheduled' | 'Fieldwork' | 'Review' | 'Completed';
  };
  
  readinessScore: number; // 0 - 100
  isDemo?: boolean;
  organizationId?: string;
  createdAt: string;

  // Progressive Enterprise ISO Implementation & Discovery State
  companyRegistrationProfile?: CompanyRegistrationProfile;
  companyComplianceProfile?: CompanyComplianceProfile;
  discoveryQuestionnaires?: DiscoveryQuestionnaireSection[];
  departmentSurveys?: DepartmentSurveyRecord[];
  implementationPlan?: ImplementationPlanItem[];
  isoWorkflowStages?: IsoWorkflowStage[];
  currentWorkflowStageId?: string;
}

export type Tenant = TenantCompany;

export interface CompanyRegistrationProfile {
  organization: {
    legalName: string;
    registrationNumber: string;
    website: string;
    industry: string;
    businessType: 'B2B SaaS' | 'FinTech' | 'Healthcare' | 'Enterprise IT' | 'E-Commerce' | 'Professional Services' | 'Manufacturing' | 'Other';
    organizationSize: '1-50' | '51-200' | '201-500' | '501-1000' | '1000+';
    employeeCount: number;
    locations: string[];
    countriesOfOperation: string[];
    businessDescription: string;
  };
  businessServices: {
    primaryServices: string[];
    criticalServices: string[];
    businessProcesses: string[];
    customerTypes: string[]; // B2B, B2C, Enterprise, Government, Regulated Entities
  };
  technology: {
    cloudProviders: string[]; // AWS, Azure, GCP, DigitalOcean, Hybrid, Private DC
    dataCenters: string[];
    saasApplications: string[]; // M365, Google Workspace, Slack, Jira, Salesforce, GitHub
    endpoints: string[]; // macOS, Windows 11, Linux, iOS, Android, BYOD
    servers: string[]; // Ubuntu Linux, RHEL, Windows Server, Kubernetes, Serverless
    networks: string[]; // Corporate SD-WAN, IPSec VPN, Zero Trust / Teleport, Office WiFi
    databases: string[]; // PostgreSQL, MongoDB, MySQL, DynamoDB, Oracle, Snowflake
    criticalApplications: string[];
    securityTools: string[]; // CrowdStrike EDR, Wazuh, Cloudflare WAF, Okta SSO, HashiCorp Vault, Snyk
  };
  data: {
    customerData: boolean;
    employeeData: boolean;
    financialData: boolean;
    personalData: boolean;
    sensitiveData: boolean;
    intellectualProperty: boolean;
    sourceCode: boolean;
    confidentialInformation: boolean;
    primaryDataResidency: string[];
  };
  thirdParties: {
    vendorsCount: number;
    cloudProviders: string[];
    managedServiceProviders: string[];
    dataProcessors: string[];
    outsourcingPartners: string[];
  };
  existingCompliance: {
    frameworks: string[]; // ISO 27001, ISO 27701, SOC 2, GDPR, DPDP, PCI DSS, HIPAA, NIST CSF
    certificationStatus: Record<string, string>;
  };
  existingSecurity: {
    hasPolicies: boolean;
    hasRiskAssessment: boolean;
    hasAssetRegister: boolean;
    hasVulnerabilityManagement: boolean;
    hasIncidentManagement: boolean;
    hasBusinessContinuity: boolean;
    hasDisasterRecovery: boolean;
    hasInternalAudit: boolean;
    hasSecurityMonitoring: boolean;
  };
}

export interface ApplicableImplementationArea {
  areaId: string;
  name: string;
  rationale: string;
  mandatoryAnnexAControls: string[];
  mandatoryClauses: string[];
  triggeredBy: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface CompanyComplianceProfile {
  profileId: string;
  tenantId: string;
  generatedAt: string;
  industry: string;
  employeeCount: number;
  locationsCount: number;
  primaryCloud: string;
  handlesPersonalData: boolean;
  handlesCustomerData: boolean;
  usesThirdParties: boolean;
  existingIsoCertified: boolean;
  applicableImplementationAreas: ApplicableImplementationArea[];
  triggeredWorkbenches: string[];
  physicalSecurityRequired: boolean;
  privacyPimsRequired: boolean;
  cloudSecurityRequired: boolean;
  devSecOpsRequired: boolean;
  supplierSecurityRequired: boolean;
  enhancedHrRequired: boolean;
  summaryExecutiveNarrative: string;
}

export interface DiscoveryQuestion {
  id: string;
  sectionKey: string;
  question: string;
  guidance: string;
  isoClauseMapping: string;
  annexAControlMapping: string;
  responseType: 'choice' | 'text' | 'number' | 'multi_choice';
  status: 'Yes' | 'Partially' | 'No' | 'Not Applicable' | 'Unanswered';
  textResponse?: string;
  numericResponse?: number;
  selectedOptions?: string[];
  options?: string[];
  evidenceUploaded?: boolean;
  evidenceId?: string;
  evidenceFileName?: string;
  answeredBy?: string;
  answeredAt?: string;
}

export interface DiscoveryQuestionnaireSection {
  sectionKey: 
    | 'governance'
    | 'hr'
    | 'it'
    | 'cybersecurity'
    | 'engineering'
    | 'devops'
    | 'cloud'
    | 'finance'
    | 'legal'
    | 'procurement'
    | 'facilities'
    | 'business_continuity'
    | 'data_privacy'
    | 'vendor_management';
  title: string;
  description: string;
  iconName: string;
  questions: DiscoveryQuestion[];
}

export interface DepartmentSurveyQuestion {
  id: string;
  question: string;
  requirementCode: string;
  annexAControlRef: string;
  status: 'Yes' | 'Partially' | 'No' | 'Not Applicable' | 'Unanswered';
  response?: string; // Compatibility alias for status or custom text response
  notes?: string;
  evidenceNotes?: string; // Compatibility alias for notes
  evidenceFileName?: string;
  evidenceId?: string;
  controlMapping?: string; // Compatibility alias for annexAControlRef
  answeredBy?: string;
  answeredAt?: string;
}

export interface DepartmentSurveyRecord {
  deptId: string;
  departmentId?: string; // Compatibility alias for deptId
  deptName: string;
  departmentName?: string; // Compatibility alias for deptName
  headOfDept: string;
  headOfDepartment?: string; // Compatibility alias for headOfDept
  headcount: number;
  surveyStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'; // Compatibility alias for surveyStatus
  completionPercentage?: number; // Calculated or stored percentage of questions answered
  completedAt?: string;
  questions: DepartmentSurveyQuestion[];
}

export interface ImplementationPlanItem {
  id: string;
  phaseNumber: number;
  phaseTitle: string;
  activityTitle: string;
  taskTitle: string;
  owner: string;
  department: string;
  dueDate: string;
  dependencyTaskId?: string;
  requirementCode: string;
  isoClause: string;
  annexAControl: string;
  evidenceRequirement: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  completionNotes?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface IsoWorkflowStage {
  stageNumber: number; // 1 to 24
  id: string;
  name: string;
  category: 'Foundation' | 'Context & Scope' | 'Risk & Controls' | 'Implementation & Evidence' | 'Assurance & Audit' | 'Continual Improvement';
  status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';
  completionPct: number;
  blockers: string[];
  owner: string;
  nextRecommendedAction: string;
  targetModuleId: string;
  requiredEvidenceCount: number;
  completedEvidenceCount: number;
  prerequisiteStageIds: string[];
  description?: string;
  deliverables?: string[];
  isoClauses?: string[];
}

export interface OrganizationRecord {
  id: string;                         // Organization ID e.g. "org_skanda_ops"
  tenantId: string;                   // Tenant ID e.g. "tenant_enterprise"
  legalName: string;                  // Full registered legal entity name
  displayName: string;                // UI display name
  country: string;                    // Country / Jurisdiction e.g. "Singapore"
  industry: string;                   // Industry sector
  status: 'ACTIVE' | 'ONBOARDING' | 'INACTIVE' | 'ARCHIVED';
  createdAt: string;                  // ISO 8601 timestamp
  updatedAt: string;                  // ISO 8601 timestamp
  createdBy: string;                  // User email / ID
  owner: string;                      // Executive Owner / CISO name
  configurationStatus: 'INITIALIZED' | 'CONFIGURING' | 'READY' | 'DATA_REQUIRED';
  selectedFrameworks?: string[];
  selectedFrameworkRequirements?: string[];
  scopeStatement?: string;
  isDemo?: boolean;                   // Flag: test/demo fixture vs real production entity
}

export interface OrganizationCompliancePosture {
  orgId: string;
  tenantId: string;
  score: number | null;               // null when assessment not initialized
  status: 'EVALUATED' | 'NOT_INITIALIZED' | 'DATA_REQUIRED';
  lastEvaluatedAt: string;
  framework: string;
  scope: string;
  applicableControlCount: number;
  passingControlCount: number;
  failedControlCount: number;
  implementedControlCount: number;
  evidenceGaps: number;
  openFindings: number;
  openMajorNCs: number;
  openMinorNCs: number;
  dataFreshness: number;              // Percentage (0 - 100)
  summaryText: string;                // e.g. "91 / 93 controls evaluated"
  evaluatedAgo: string;               // e.g. "Just now", "4m ago"
  breakdown: {
    controlsScore: number;
    evidenceScore: number;
    findingsPenalty: number;
    riskFactor: number;
  };
}

export interface AssetRecord {
  id: string;
  tenantId: string;
  name: string;
  type: 'Application' | 'Infrastructure' | 'Device' | 'Facility' | 'Data Repository';
  criticality: 'Critical' | 'High' | 'Medium' | 'Low';
  owner: string;
  department: string;
  location: string;
  classification: 'Confidential' | 'Restricted' | 'Internal' | 'Public';
  description: string;
  lastReviewDate: string;
}

export interface DataAssetRecord {
  id: string;
  tenantId: string;
  datasetName: string;
  description: string;
  dataClassification: 'Confidential' | 'Restricted' | 'Internal' | 'Public';
  personalDataIncluded: boolean;
  retentionPeriod: string;
  lawfulBasis: 'Consent' | 'Contract' | 'Legal Obligation' | 'Vital Interests' | 'Public Task' | 'Legitimate Interests';
  crossBorderTransfer: boolean;
  destinationCountries?: string;
  safeguards?: string;
  owner: string;
  storageLocation: string;
}

export interface VendorRecord {
  id: string;
  tenantId: string;
  name: string;
  serviceProvided: string;
  tier: 'Tier 1 - High Risk' | 'Tier 2 - Medium Risk' | 'Tier 3 - Low Risk';
  criticality: 'Critical' | 'Major' | 'Significant' | 'Standard';
  dueDiligenceStatus: 'Completed' | 'Pending' | 'Expired' | 'Waived';
  certifications: string[]; // e.g. ["ISO 27001", "SOC 2 Type II"]
  contractClauses: string[]; // e.g. ["Security Breach Notice 24h", "Right to Audit", "DPA Attached"]
  dpaSigned: boolean;
  nextReviewDate: string;
  contactPerson: string;
  contactEmail: string;
}

export type RiskCategory = 'Asset' | 'Process' | 'Department' | 'Vendor' | 'Information Security' | 'Legal & Compliance';
export type RiskTreatmentOption = 'Mitigate' | 'Transfer' | 'Avoid' | 'Accept';

export interface RiskEvidenceLink {
  id: string;
  name: string;
  controlCode: string;
  type: string;
  sha256Hash?: string;
  uploadedDate: string;
  expiryDate?: string;
  status: 'Verified' | 'Pending Review' | 'Expired';
  verificationNotes?: string;
}

export interface RiskFrameworkMapping {
  iso27001Controls: string[]; // e.g. ["A.5.23", "A.8.7"]
  iso42001Controls: string[]; // e.g. ["A.5.1", "A.6.2", "A.9.3"]
  masTrmSections: string[];   // e.g. ["MAS Notice 644", "TRM 5.1", "TRM 11.2"]
  masTrmRequirementIds?: string[]; // e.g. ["REQ-MAS-3.1", "REQ-MAS-5.1", "REQ-MAS-8.1", "REQ-MAS-12.1"]
}

export type MASRiskExposureTier = 'CRITICAL_EXPOSURE' | 'HIGH_EXPOSURE' | 'MEDIUM_EXPOSURE' | 'LOW_EXPOSURE';

export interface MASTrmRiskExposure {
  requirementId: string;
  requirementCode: string;
  title: string;
  domainNumber: string;
  domainName: string;
  mappedRisksCount: number;
  mappedRiskCodes: string[];
  maxInherentScore: number;
  avgInherentScore: number;
  maxResidualScore: number;
  avgResidualScore: number;
  totalInherentExposure: number;
  totalResidualExposure: number;
  exposureTier: MASRiskExposureTier;
  isStatutoryMandate: boolean;
  complianceStatus?: string;
  exposureScore: number; // 0 - 100 normalized risk exposure index (higher = greater exposure)
}

export interface MASDomainExposureMetrics {
  domainNumber: string;
  domainName: string;
  totalMappedRisks: number;
  uniqueRiskCodes: string[];
  maxInherentScore: number;
  avgResidualScore: number;
  totalInherentExposure: number;
  totalResidualExposure: number;
  domainExposureIndex: number; // 0-100 composite risk exposure (higher = more risk exposure)
  exposureTier: MASRiskExposureTier;
  topExposedRequirement?: MASTrmRiskExposure;
}

export interface MASEnterpriseRiskProfile {
  totalTechnologyRisks: number;
  mappedToMasCount: number;
  unmappedRisksCount: number;
  overallExposureScore: number; // 0-100
  exposureTier: MASRiskExposureTier;
  topExposedDomain: string;
  criticalExposureRequirementsCount: number;
  highExposureRequirementsCount: number;
  domainExposures: Record<string, MASDomainExposureMetrics>;
  requirementExposures: Record<string, MASTrmRiskExposure>;
  topRiskDrivers: {
    risk: RiskRecord;
    masRequirementIds: string[];
    masRequirementCodes: string[];
    exposureContribution: number;
  }[];
}

export interface RiskExecutiveAcceptance {
  required: boolean;
  status: 'Not Required' | 'Pending Review' | 'Accepted' | 'Rejected';
  acceptedBy?: string;
  acceptedAt?: string;
  reviewFrequencyMonths?: number;
  expiryDate?: string;
  justification?: string;
  compensatingControls?: string;
  boardMeetingRef?: string;
}

export interface RiskTelemetrySignal {
  source: 'AWS Security Hub' | 'GitHub Dependabot' | 'CrowdStrike Falcon' | 'Okta Identity' | 'Teleport Zero Trust' | 'Snyk Vulnerability Scan' | 'Manual Telemetry Simulator';
  alertTitle: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  detectedAt: string;
  active: boolean;
  rawPayloadSnippet?: string;
  automatedScoreDelta?: number; // e.g. +3 Likelihood when zero-day active
}

export interface RiskRecord {
  id: string;
  tenantId: string;
  riskCode: string; // e.g. "RSK-001"
  title: string;
  category: RiskCategory;
  linkedItem: string; // e.g. "Cloud AWS Production (Asset)" or "Payroll Processing"
  department: string;
  threatDescription: string;
  vulnerabilityDescription: string;
  likelihood: number; // 1 to 5
  impact: number; // 1 to 5
  inherentScore: number; // likelihood * impact (1-25)
  treatmentOption: RiskTreatmentOption;
  mitigationControl: string;
  treatmentOwner: string;
  targetDate: string;
  residualLikelihood: number; // 1 to 5
  residualImpact: number; // 1 to 5
  residualScore: number;
  status: 'Identified' | 'Assessment' | 'Treatment in Progress' | 'Residual Monitored' | 'Closed';
  escalatedToSuperAdmin: boolean;
  // Multi-Framework Harmonizer
  frameworkMappings?: RiskFrameworkMapping;
  // Evidence Linking & Control Effectiveness (0-100%)
  evidenceLinks?: RiskEvidenceLink[];
  controlEffectiveness?: number; // 0 to 100%
  // Clause 6.1.3 Executive Risk Acceptance Workflow
  executiveAcceptance?: RiskExecutiveAcceptance;
  // Live Telemetry Stream
  telemetrySignals?: RiskTelemetrySignal[];
}

export type EvidenceVerificationState = 'Draft' | 'Pending Review' | 'Verified';

export interface DpdpClauseMapping {
  sectionCode: string; // e.g. "SEC-04", "SEC-06", "SEC-08", "SEC_8_5"
  sectionNumber?: number;
  title?: string;
  sectionTitle?: string; // alias for display
  relevanceScore: number; // 0-100
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW' | 'High' | 'Medium' | 'Low';
  rationale: string;
  penaltyMaxCrores?: number;
  mandatoryForSdf?: boolean;
  chapter?: string;
  mandatorySafeguards?: string[];
  statutoryPenaltyNote?: string;
}

export interface DpdpScanResult {
  scannedAt?: string;
  mappedClauses?: DpdpClauseMapping[];
  suggestedTags: string[];
  summary: string;
  overallConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'High' | 'Medium' | 'Low';
  keyEntitiesDetected?: string[];
  statutoryPenaltyRisk?: {
    maxExposureCrores: number;
    riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
  };
}

export type IsoThemeCategory = 
  | 'Organizational Controls (A.5)'
  | 'People Controls (A.6)'
  | 'Physical Controls (A.7)'
  | 'Technological Controls (A.8)'
  | 'Management System (Clauses 4-10)';

export interface IsoRequirementMapping {
  isoCode: string; // e.g. "A.5.15", "A.8.2", "Clause 7.5.3", "A.8.24"
  isoStandard?: 'ISO/IEC 27001:2022' | 'ISO/IEC 27701:2019' | 'ISO/IEC 42001:2023' | string;
  category?: 'Organizational' | 'People' | 'Physical' | 'Technological' | 'ISMS Clause' | string;
  themeCategory?: IsoThemeCategory | string;
  requirementTitle?: string;
  title?: string; // alias for display
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW' | 'High' | 'Medium' | 'Low';
  relevanceScore: number; // 0-100
  auditObjective?: string;
  suggestedEvidenceType?: string;
  testingProcedure?: string;
  rationale: string;
  checklistRefId?: string; // e.g. 'EVD-27K-001'
  departmentHint?: string;
}

export interface IsoScanResult {
  scannedAt: string;
  mappedRequirements: IsoRequirementMapping[];
  primaryCategory: IsoThemeCategory | string;
  recommendedControlCode: string;
  suggestedTags: string[];
  summary: string;
  overallConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'High' | 'Medium' | 'Low';
  confidenceScore?: number;
  keyEvidenceArtifactsIdentified?: string[];
  auditInspectionChecklist?: string[];
  leadAuditorTestRecommendation?: string;
}

export interface EvidenceRecord {
  id: string;
  tenantId: string;
  title: string;
  controlCode: string;
  department: string;
  uploadedBy: string;
  uploadedDate: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  version: string;
  status: 'Draft' | 'Pending Review' | 'Verified' | 'Requires Update' | 'Expired';
  verificationState?: EvidenceVerificationState;
  submittedBy?: string;
  submittedDate?: string;
  reviewedBy?: string;
  reviewDate?: string;
  reviewNotes?: string;
  expiryDate?: string;
  tags: string[];
  fourEyesEnforced?: boolean;
  fourEyesStatus?: 'COMPLIANT' | 'SELF_VERIFY_BLOCKED' | 'PENDING_INDEPENDENT_REVIEW';
  auditHash?: string;
  sha256Hash?: string;
  integrityVerifiedAt?: string;
  checksumVerified?: boolean;
  // AI-Driven DPDP Statutory Auto-Tagging
  dpdpClauses?: string[]; // e.g. ['SEC-08', 'SEC-04']
  dpdpMappings?: DpdpClauseMapping[];
  dpdpScanResult?: DpdpScanResult;
  autoTaggedByAI?: boolean;
  aiTaggedAt?: string;
  documentExcerpt?: string;
  // AI-Driven ISO Requirements Auto-Tagging & Categorization
  isoRequirements?: string[]; // e.g. ['A.5.15', 'A.8.2', 'Clause 7.5.3']
  isoMappings?: IsoRequirementMapping[];
  isoScanResult?: IsoScanResult;
  isoCategory?: IsoThemeCategory | string;
  recommendedIsoCategory?: string;
  recommendedControlCode?: string;
  isoTaggedByAI?: boolean;
  isoTaggedAt?: string;
}

export interface LiveControlHarvestItem {
  id: string;
  controlCode: string;
  controlName: string;
  category: string;
  provider: 'GitHub' | 'AWS' | 'GCP' | 'CrowdStrike' | 'Okta' | 'Terraform';
  passing: boolean;
  statusText: string;
  lastChecked: string;
  sha256: string;
  metrics: Record<string, any>;
  suggestedEvidenceTitle: string;
  department: string;
  iso27001Mapping: string;
  masTrmMapping: string;
}

export interface AISystemCard {
  id: string;
  name: string;
  purpose: string;
  riskTier: 'LOW' | 'MEDIUM' | 'HIGH' | 'PROHIBITED';
  foundationModel: string;
  parameters: string;
  trainingCutoff: string;
  dataProvenance: string;
  humanInTheLoop: boolean;
  deploymentEnvironment: string;
  lastEvaluated: string;
  promptInjectionDefense: 'ROBUST' | 'ADEQUATE' | 'NEEDS_IMPROVEMENT';
  hallucinationRate: number; // percentage e.g. 0.8%
  safetyGuardrailsActive: boolean;
}

export interface AIRedTeamAttackResult {
  id: string;
  attackType: string;
  vector: string;
  promptSample: string;
  systemResponse: string;
  status: 'BLOCKED' | 'NEUTRALIZED' | 'BYPASS_DETECTED';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
  cveOrTaxonomyRef: string;
}

export interface InternalAuditPlan {
  id: string;
  tenantId: string;
  auditCode: string; // e.g. "IA-2026-01"
  title: string;
  scope: string;
  department: string;
  leadAuditor: string;
  auditTeam: string[];
  scheduledStartDate: string;
  scheduledEndDate: string;
  status: 'Planned' | 'In Progress' | 'Fieldwork Completed' | 'Report Issued' | 'Closed';
  checklists: Array<{
    id: string;
    controlCode: string;
    requirement: string;
    sampleDescription: string;
    evidenceReviewed: string;
    complianceStatus: 'Conforming' | 'Minor Non-Conformity' | 'Major Non-Conformity' | 'Observation' | 'OFI';
    workingPaperNotes: string;
  }>;
  executiveSummary?: string;
}

export interface FiveWhysStep {
  whyNumber: number;
  question: string;
  answer: string;
  category?: 'People' | 'Process' | 'Technology' | 'Governance' | 'Environment';
}

export interface AttachedEvidenceArtifact {
  id: string;
  title: string;
  fileRef: string;
  hash?: string;
  fileSize?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface IndependentAuditValidation {
  validationId: string;
  auditProgramRef: string; // e.g. "IA-2026-Q3-RETEST" or "EXT-TUV-ST2-01"
  auditorName: string;
  auditorEmail: string;
  auditorRole: string; // e.g. "Lead Internal Auditor", "TÜV SÜD Lead Auditor", "ISO 27001 Lead Auditor"
  validationDate: string;
  testOfOperatingEffectiveness: 'PASSED' | 'FAILED' | 'CONDITIONALLY_PASSED';
  samplingMethodology: string; // e.g. "100% population inspection", "Random sample of 25 records over 90 days"
  sampleSizeInspected: number;
  inspectedArtifactReferences: string[]; // e.g. ["EV-2026-LOG-88", "POL-ACC-01-SIGNED.pdf"]
  auditorObservations: string;
  effectivenessConclusion: string;
  independenceStatementConfirmed: boolean; // Confirms auditor has no operational role or conflict of interest in the department
  digitalSignatureHash: string; // SHA-256 verifiable signature
  validatedAt: string;
}

export interface FindingCAPARecord {
  id: string;
  tenantId: string;
  findingCode: string; // e.g. "FND-001"
  source: 'INTERNAL_AUDIT' | 'EXTERNAL_AUDIT' | 'MANAGEMENT_REVIEW' | 'CONTINUOUS_MONITORING';
  severity: 'Major Non-Conformity' | 'Minor Non-Conformity' | 'Observation' | 'Opportunity for Improvement';
  title: string;
  clauseOrControl: string;
  department: string;
  description: string;
  rootCauseAnalysis: {
    methodology: '5_WHYS' | 'FISHBONE' | 'DIRECT';
    whys?: string[];
    fiveWhysChain?: FiveWhysStep[];
    rootCauseStatement: string;
    contributingFactors?: string[];
    analyzedBy?: string;
    analyzedDate?: string;
  };
  capaPlan: {
    correctiveAction: string;
    preventiveAction: string;
    owner: string;
    targetDate: string;
    evidenceRequired: string;
    implementationStatus?: 'Pending' | 'In Progress' | 'Implemented' | 'Submitted for Verification';
    implementationNotes?: string;
    completedDate?: string;
    attachedEvidenceArtifacts?: AttachedEvidenceArtifact[];
  };
  implementationNotes?: string;
  status: 'Open' | 'Root Cause Defined' | 'CAPA Submitted' | 'Verification Pending' | 'Closed Verified';
  raisedBy: string;
  raisedDate: string;
  verifiedBy?: string;
  verifiedDate?: string;
  isExternalLocked?: boolean; // Cannot be modified/deleted by client if raised by external auditor
  departmentOwnerEmail?: string;
  emailNotificationStatus?: 'NOT_DISPATCHED' | 'DISPATCHED' | 'REMINDER_SENT';
  lastEmailDispatchedAt?: string;
  notificationLog?: Array<{
    id: string;
    recipient: string;
    subject: string;
    sentAt: string;
    type: 'INITIAL_NOTICE' | 'STATUS_UPDATE' | 'OVERDUE_ALERT' | 'CLOSURE_CONFIRMATION';
    deliveryStatus: 'DELIVERED_250_OK' | 'QUEUED';
  }>;
  independentAuditValidation?: IndependentAuditValidation;
}

export interface AuditTrailEvent {
  id: string;
  tenantId: string;
  timestamp: string;
  actorName: string;
  actorEmail: string;
  actorRole: UserRole;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'SIGN_MOU' | 'LOCK_BASELINE' | 'ACCESS' | 'EXPORT';
  module: string;
  description: string;
  ipAddress: string;
  sha256Hash: string; // Cryptographic integrity hash
  previousHash?: string; // Cryptographic backward link to parent block (Merkle chain)
  blockIndex?: number;
  metadata?: Record<string, any>;
}

export interface SuperAdminRecommendation {
  id: string;
  tenantId: string;
  title: string;
  category: 'Policy' | 'Control' | 'Regulatory' | 'Risk Mitigation';
  priority: 'High' | 'Medium' | 'Low';
  description: string;
  recommendedActions: string[];
  issuedBy: string;
  issuedDate: string;
  status: 'Open' | 'Acknowledged' | 'Implemented';
}

export interface TaskRecord {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  category: 'Remediation' | 'Evidence Collection' | 'Policy Review' | 'Audit Prep' | 'CAPA';
  priority: 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Under Review' | 'Done';
  assignedTo: string;
  department: string;
  dueDate: string;
  linkedControl?: string;
}

export * from './types/remediation';

export interface DocumentAcknowledgment {
  id: string;
  tenantId: string;
  documentId: string;
  documentCode: string;
  documentTitle: string;
  documentVersion: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  department: string;
  timestamp: string; // ISO 8601
  ipAddress: string;
  signatureText: string;
  declarationAccepted: boolean;
  verificationHash: string; // SHA-256 integrity hash
  notes?: string;
}

export interface RiskTreatmentScenario {
  id: string;
  tenantId: string;
  riskId: string;
  riskCode: string;
  riskTitle: string;
  scenarioName: string;
  treatmentOption: 'Mitigate' | 'Transfer' | 'Avoid' | 'Accept';
  proposedControls: string[];
  customControlDescription: string;
  targetOwner: string;
  targetDate: string;
  inherentLikelihood: number;
  inherentImpact: number;
  inherentScore: number;
  projectedLikelihood: number;
  projectedImpact: number;
  projectedResidualScore: number;
  scoreDelta: number; // inherentScore - projectedResidualScore
  riskReductionPercentage: number; // e.g. 75%
  estimatedCostEffort: 'Low' | 'Medium' | 'High';
  justificationNotes: string;
  simulatedAt: string;
  simulatedBy: string;
}

// ISO 27001:2022 Clause 9.3 Management Review Meeting (MRM)
export interface ManagementReviewAgendaItem {
  id: string;
  clauseRef: string; // e.g., "9.3.2 a", "9.3.2 b", "9.3.2 c", "9.3.2 d", "9.3.2 e", "9.3.2 f", "9.3.2 g"
  title: string;
  description: string;
  findingsAndNotes: string;
  status: 'Reviewed' | 'Action Required' | 'Satisfactory' | 'Deferred';
}

export interface ManagementReviewActionItem {
  id: string;
  action: string;
  owner: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Completed';
}

export interface ManagementReviewRecord {
  id: string;
  tenantId: string;
  meetingTitle: string;
  meetingDate: string;
  chairPerson: string;
  status: 'Scheduled' | 'In Session' | 'Minutes Approved' | 'Signed Off';
  attendees: Array<{
    name: string;
    role: string;
    department: string;
    attended: boolean;
  }>;
  agendaItems: ManagementReviewAgendaItem[];
  decisionsAndImprovements: string;
  resourceNeedsAllocated: string;
  actionItems: ManagementReviewActionItem[];
  conclusions: string;
  signoffTimestamp?: string;
  signoffSignatory?: string;
  signoffHash?: string;
  quorumMet?: boolean;
  liveMetricsSnapshot?: {
    readinessScore: number;
    activeRisksCount: number;
    highResidualRisks: number;
    openCAPACount: number;
    evidenceFreshnessScore: number;
    soaImplementedPercentage: number;
  };
}

// ============================================================================
// P1: One-Click External Audit Dossier & Evidence Freshness Engine (Cl. 9.1 & Annex A 5.37)
// ============================================================================
export type EvidenceFreshnessStatus = 'Fresh' | 'Aging' | 'Stale' | 'Expired';

export interface EvidenceFreshnessItem {
  id: string;
  evidenceId: string;
  title: string;
  controlCode: string;
  controlTitle: string;
  department: string;
  uploadedDate: string;
  expiryDate?: string;
  collectionFrequency: 'Continuous' | 'Monthly' | 'Quarterly' | 'Bi-Annual' | 'Annual';
  ageInDays: number;
  slaMaxDays: number;
  freshnessStatus: EvidenceFreshnessStatus;
  freshnessScore: number; // 0-100%
  sha256Hash: string;
  fileName: string;
  verified: boolean;
  annexA537Compliant: boolean; // Adherence to documented operating procedures
  slaRemainingDays: number;
}

export interface EvidenceFreshnessSummary {
  overallHealthScore: number; // 0-100%
  totalCount: number;
  freshCount: number;
  agingCount: number;
  staleCount: number;
  expiredCount: number;
  decayVelocityDays: number;
  slaComplianceRate: number;
  annexA537AdherenceRate: number;
  criticalGaps: string[];
}

export interface AuditDossierSection {
  id: string;
  clauseRef: string; // e.g. "ISO 27001 Cl. 4.1 - 4.4"
  title: string;
  status: 'Complete' | 'Verified' | 'Action Required' | 'Satisfactory';
  summary: string;
  evidenceCount: number;
  keyArtefacts: Array<{
    code: string;
    title: string;
    type: string;
    status: string;
    hash?: string;
  }>;
  auditorNotes?: string;
}

export interface AuditDossierPackage {
  id: string;
  tenantId: string;
  tenantName: string;
  generatedAt: string;
  auditStage: 'Stage 1' | 'Stage 2';
  leadAuditor: string;
  readinessScore: number;
  evidenceFreshnessScore: number;
  totalControlsInScope: number;
  totalPoliciesActive: number;
  totalEvidenceArtefacts: number;
  dossierChecksum: string;
  sections: AuditDossierSection[];
  auditorVerdict?: {
    recommendation: 'Recommend for Stage 2 Certification Audit' | 'Recommend with Minor Pre-Fieldwork Actions' | 'Deferred';
    comments: string;
    signedBy: string;
    signedAt: string;
    verificationHash: string;
  };
}

// ============================================================================
// P3: Automated SoA & Risk Register Dynamic Sync (ISO 27001 Cl. 6.1.2 & 6.1.3)
// ============================================================================
export interface RiskSoASyncReport {
  syncHealthScore: number; // 0-100%
  alignmentPercentage: number; // 0-100%
  totalControlsChecked: number;
  totalRisksChecked: number;
  syncedControlsCount: number;
  mappedControlsCount: number;
  unmappedMitigateRisks: Array<{
    riskId: string;
    riskCode: string;
    title: string;
    inherentScore: number;
  }>;
  unjustifiedControls: Array<{
    controlId: string;
    controlCode: string;
    title: string;
  }>;
  conflicts: Array<{
    type: 'CONTROL_EXCLUDED_WITH_OPEN_RISK' | 'STATUS_DESYNC' | 'MISSING_MAPPING';
    description: string;
    riskCode: string;
    controlCode: string;
    severity: 'High' | 'Medium' | 'Low';
    suggestedResolution?: string;
  }>;
  lastSyncTimestamp: string;
}

// Re-export Regulatory & Framework Engine Types
export * from './types/regulatoryTypes';

// ============================================================================
// Policy Contextualizer & Infrastructure Tag Mapping Types
// ============================================================================
export interface InfrastructureTag {
  id: string;
  tag: string; // e.g. 'AWS-IAM', 'Azure-Blob-Storage'
  name: string;
  category: 'Identity & Access' | 'Storage & Databases' | 'Compute & Containers' | 'CI/CD & DevOps' | 'Cryptography & Keys' | 'Endpoint & SIEM';
  vendor: 'AWS' | 'Azure' | 'GCP' | 'Okta' | 'Multi-Cloud' | 'Custom';
  description: string;
  technicalEnforcementSnippet: string;
  color: string;
  isCustom?: boolean;
  resourceIdentifier?: string;
  driftStatus?: 'COMPLIANT' | 'DRIFT_DETECTED' | 'PROBING';
  iacProvider?: string;
  telemetryStream?: string;
  evidenceHash?: string;
}

export interface PolicyClauseItem {
  id: string;
  policyId: string;
  sectionNumber: string;
  title: string;
  requirementText: string;
  isoReference: string;
  frameworks: string[];
  enforcementObjective: string;
  defaultTags: string[];
}

export interface PolicyMetadataConfig {
  dpoName: string;
  dpoEmail: string;
  dpoPhone: string;
  dpoRegistrationId: string;
  cisoName: string;
  cisoEmail: string;
  escalationSlaSev1: string;
  escalationSlaSev2: string;
  escalationSlaSev3: string;
  escalationSlaSev4: string;
  regulatoryNotificationSla: string;
  companyName: string;
  primaryCloud: string;
  backupRpoRto: string;
}

export interface PolicyInfrastructureMapping {
  policyId: string;
  policyCode: string;
  policyTitle: string;
  tags: string[]; // e.g. ['AWS-IAM', 'Azure-Blob-Storage']
  customOverrides?: Record<string, string>;
  lastContextualizedAt?: string;
}

// Convenience Type Aliases
export type RoleType = UserRole;
export type GeneratedDoc = GeneratedDocument;
export type RiskItem = RiskRecord;
export type FindingItem = FindingCAPARecord;
export type EvidenceItem = EvidenceRecord;

// ============================================================================
// Statement of Applicability (SoA) Sync Verifier (ISO 27001 Clause 6.1.3 d)
// ============================================================================
export interface OutdatedJustificationIssue {
  id: string;
  controlId: string;
  controlCode: string; // e.g. "A.8.12"
  controlTitle: string;
  category: string;
  currentJustification: string;
  conflictType: 'DIRECT_MITIGATION_MAPPING' | 'THREAT_CONTRADICTION' | 'HIGH_SEVERITY_UNMITIGATED' | 'STALE_EXCLUSION';
  severity: 'Critical' | 'High' | 'Medium';
  triggeringRisk: {
    id: string;
    riskCode: string;
    title: string;
    inherentScore: number;
    department: string;
    threatDescription: string;
    mitigationControl?: string;
  };
  invalidationReason: string;
  suggestedAction: string;
  suggestedRevisedJustification?: string;
  detectedAt: string;
  status: 'Pending Review' | 'Re-included' | 'Justification Updated' | 'Dismissed';
}

export interface SoAVerifierReport {
  timestamp: string;
  totalExcludedControls: number;
  outdatedCount: number;
  validExclusionCount: number;
  criticalIssuesCount: number;
  highIssuesCount: number;
  issues: OutdatedJustificationIssue[];
  verificationHealthScore: number; // 0-100%
}

// ============================================================================
// Automated Audit Reporting & Stakeholder Dossier Archive
// ============================================================================
export interface ArchivedAuditReport {
  id: string;
  tenantId: string;
  reportRef: string;
  title: string;
  auditCycle: string;
  targetStakeholder: string;
  classification?: string;
  frameworks: string[];
  leadAuditor: string;
  generatedDate: string;
  sha256Seal: string;
  executiveOpinion: string;
  executiveSummaryText: string;
  stats: {
    totalFindings: number;
    majorNCs: number;
    minorNCs: number;
    observations: number;
    ofis: number;
    openCount: number;
    closedCount: number;
    overdueCount: number;
    remediationRate: number;
  };
  departmentBreakdown: Array<{
    name: string;
    total: number;
    major: number;
    minor: number;
    open: number;
  }>;
  rootCauseBreakdown?: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  findings: Array<{
    findingCode: string;
    title: string;
    severity: string;
    status: string;
    clauseOrControl: string;
    department: string;
    rootCause: string;
    correctiveAction: string;
    preventiveAction: string;
    owner: string;
    targetDate: string;
  }>;
  signatories?: Array<{
    title: string;
    name: string;
    status: string;
    date: string;
  }>;
  status: 'Published' | 'Under Review' | 'Archived' | 'Superseded';
  pinned?: boolean;
  fileSizeBytes?: number;
  notes?: string;
}

// ============================================================================
// Senior TUV, PECB, BSI Chief ISO Implementer Suite Types
// ============================================================================

export type AuditorObservationType = 
  | 'Conformity'
  | 'Minor Non-Conformity'
  | 'Major Non-Conformity'
  | 'Opportunity for Improvement';

export interface AuditorObservationRecord {
  id: string;
  tenantId: string;
  auditorName: string;
  auditorBody: 'BSI' | 'TÜV SÜD' | 'TÜV Rheinland' | 'PECB' | 'SGS' | 'DNV' | 'Internal Lead Auditor';
  clauseOrControl: string; // e.g. "Cl. 9.2 Internal Audit", "A.8.12 DLP"
  type: AuditorObservationType;
  findingTitle: string;
  requirementCitation: string;
  objectiveEvidenceExamined: string;
  auditorNotes: string;
  recommendedAction: string;
  recordedAt: string;
  status: 'Draft' | 'Official Finding' | 'Accepted by Client' | 'Remediated';
  sampleReference?: string;
}

export interface ISO19011SamplingConfig {
  id: string;
  populationType: string; // e.g. "Employee Access Reviews", "Firewall Rule Changes", "Vendor Risk Assessments"
  populationSize: number;
  confidenceLevel: 90 | 95 | 99;
  tolerableErrorRate: number; // e.g. 5%
  expectedErrorRate: number; // e.g. 1%
  samplingMethod: 'Attribute Sampling' | 'Simple Random' | 'Stratified Risk-Based';
  calculatedSampleSize: number;
  generatedDate: string;
  generatedSamples: Array<{
    sampleId: string;
    itemRef: string;
    category: string;
    riskTier: 'High' | 'Medium' | 'Low';
    status: 'Pass' | 'Fail' | 'Pending';
    notes?: string;
  }>;
}

export interface StageGateItem {
  id: string;
  clauseRef: string;
  title: string;
  stage: 'Stage 1' | 'Stage 2';
  description: string;
  isMandatoryPrerequisite: boolean;
  status: 'COMPLIANT' | 'IN_PROGRESS' | 'NON_COMPLIANT' | 'NOT_STARTED';
  evidenceRequired: string[];
  auditorVerificationCriteria: string;
  blockingReason?: string;
  spoc: string;
}

export interface SoAVersionHistoryItem {
  id: string;
  versionNumber: string; // e.g. "v1.0 Baseline", "v1.1 Surveillance", "v2.0 Approved"
  cycleName: string;
  approvedDate: string;
  approvedByCISO: string;
  approvedBySteeringCommittee: string;
  sha256Fingerprint: string;
  totalControls: number;
  includedCount: number;
  excludedCount: number;
  criticalChangesCount: number;
  changesSummary: string[];
  status: 'Active Approved' | 'Draft Under Review' | 'Archived Superseded';
}

export interface StakeholderObligationItem {
  id: string;
  stakeholder: string; // e.g. "Data Protection Authorities", "Enterprise B2B Customers", "Board of Directors"
  category: 'Statutory/Regulatory' | 'Contractual' | 'Corporate Governance' | 'Industry Benchmark';
  jurisdictionOrScope: string; // e.g. "EU / UK", "Singapore / APAC", "Global Enterprise"
  needsAndExpectations: string;
  complianceObligations: string;
  statutoryReference: string; // e.g. "GDPR Art. 32", "MAS TRM Notice 644", "EU NIS2 Directive"
  mappedControls: string[]; // e.g. ["A.5.1", "A.8.12", "A.5.23"]
  complianceOwner: string;
  evaluationInterval: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual';
  lastEvaluatedDate: string;
  nextReviewDate: string;
  complianceStatus: 'Fully Met' | 'Partially Met' | 'Action Required';
  evidenceReference: string;
}

// MAS-TRM Chief Implementer Suite Types
export interface MASNotice644IncidentDraft {
  id: string;
  incidentRef: string;
  systemAffected: string;
  isCriticalSystem: boolean;
  discoveryTimestamp: string;
  outageStartTimestamp: string;
  outageEndTimestamp?: string;
  durationMinutes: number;
  incidentCategory: 'System Malfunction' | 'Cyber Attack / Ransomware' | 'Third-Party / Cloud Failure' | 'Data Breach' | 'Human Error / Unauthorized Change';
  severityLevel: 'SEV-1 (Critical Business Disruption)' | 'SEV-2 (Severe Partial Degradation)' | 'SEV-3 (Minor Internal Impact)';
  estimatedCustomersImpacted: number;
  financialImpactSGD: number;
  rootCausePreliminary: string;
  containmentActions: string;
  notificationStatus: 'Drafting' | '1h Notification Dispatched' | '14d RCA Pending' | '14d RCA Submitted' | 'Closed by MAS';
  containmentStatus?: 'Active Isolation' | 'Contained' | 'Failover Complete';
  forensicStatus?: 'Evidence Preservation' | 'Memory Dump Analyzed' | 'Root Cause Confirmed';
  oneHourDeadline: string;
  fourteenDayDeadline: string;
  masOfficerAssigned?: string;
  cisoApproval: boolean;
}

export interface MASNotice655Mandate {
  id: string;
  paragraphRef: string;
  requirementTitle: string;
  legallyBindingClause: string;
  description: string;
  isoMapping: string[];
  status: 'COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT';
  currentTelemetryValue: string;
  statutoryThreshold: string;
  lastAuditedDate: string;
  spoc: string;
  auditEvidenceRef: string;
  penaltiesForBreach: string;
}

export interface MASCISSystemRegisterItem {
  id: string;
  systemName: string;
  tier: 'Tier 1 - Critical Financial Infrastructure' | 'Tier 2 - Important Business System' | 'Tier 3 - Standard Support';
  businessFunction: string;
  hostingModel: 'Singapore Sovereign Cloud' | 'Multi-Region AWS/GCP' | 'Hybrid On-Premise & Cloud';
  declaredRTOHours: number; // MAS statutory cap is <= 4h
  actualDrillRTOHours: number;
  declaredRPOHours: number; // MAS benchmark <= 2h
  actualDrillRPOHours: number;
  annualAllowedDowntimeHours: number; // MAS max 4.0h in rolling 12 months
  consumedDowntimeHours: number;
  lastDRDrillDate: string;
  drDrillResult: 'PASSED' | 'FAILED' | 'CONDITIONAL_PASS';
  auditorVerificationProof: string;
  owner: string;
}

export * from './types/remediation';
export * from './types/continuousCompliance';
export * from './types/masTrmFrameworkTypes';
export * from './types/tprmTypes';



