// ============================================================================
// SKANDA ENTERPRISE GRC: MAS TRM STRUCTURED CONTROL & ASSESSMENT CONTRACTS
// Path: src/types/masTrmStructuredTypes.ts
//
// Phase 24: Canonical MAS TRM 2021 Structured Control & Assessment Architecture
// Grounding: Monetary Authority of Singapore (MAS) TRM Guidelines (January 2021)
// Secondary Reference: Open Security Architecture (OSA) NIST SP 800-53 Mapping
//
// Strict Layer Separation:
//  - AUTHORITATIVE MAS REGULATORY SOURCE (Official statutory text)
//  - OPEN SECURITY ARCHITECTURE (OSA) (Structured secondary mapping)
//  - NIST SP 800-53 (Control framework reference)
//  - SKANDA INTERPRETATION (Platform analysis)
//  - SKANDA RECOMMENDED CONTROL & EVIDENCE (Implementation guidance)
// ============================================================================

import {
  BindingNature,
  FinancialInstitutionType,
  ImpactLevel,
  InstrumentType,
  RegulatoryAuthority,
  RegulatoryFamily,
  RegulatoryStatus,
  SourceClassification,
  VerificationStatus
} from './masRegulatoryIntelligenceTypes';

// ----------------------------------------------------------------------------
// 1. SOURCE PROVENANCE & CLASSIFICATION TAXONOMY
// ----------------------------------------------------------------------------

export type MasTrmSourceBoundary =
  | 'AUTHORITATIVE_REGULATORY_SOURCE' // Official MAS publications (Direct statutory source)
  | 'STRUCTURED_MAPPING_REFERENCE'    // Open Security Architecture (OSA)
  | 'CONTROL_FRAMEWORK_REFERENCE'     // NIST SP 800-53 Rev 5 / ISO 27001:2022
  | 'SKANDA_INTERPRETATION'           // Expert analysis & analytical interpretation
  | 'SKANDA_RECOMMENDED_CONTROL'      // Skanda implementation recommendation
  | 'SKANDA_RECOMMENDED_EVIDENCE';    // Suggested verification artifacts

export type MappingConfidenceLevel =
  | 'EXACT'       // 1:1 direct semantic satisfaction
  | 'STRONG'      // Substantial coverage with minor nuance
  | 'PARTIAL'     // Covers a specific sub-clause or principle
  | 'CONCEPTUAL'  // Broad thematic alignment
  | 'NOT_MAPPED'; // No corresponding mapping identified

export type MappingSourceType =
  | 'OPEN_SECURITY_ARCHITECTURE'
  | 'SKANDA_CANONICAL_ENGINE'
  | 'NIST_CROSSWALK'
  | 'EXPERT_AUDITOR_VERIFIED';

export type MasTrmTestingMethod =
  | 'INTERVIEW'
  | 'INSPECTION'
  | 'OBSERVATION'
  | 'REPERFORMANCE'
  | 'SAMPLING'
  | 'AUTOMATED_TEST';

export type MasTrmControlLifecycleStatus =
  | 'NOT_STARTED'
  | 'PLANNED'
  | 'IMPLEMENTING'
  | 'IMPLEMENTED'
  | 'OPERATING'
  | 'EFFECTIVE'
  | 'INEFFECTIVE'
  | 'NOT_APPLICABLE';

export type MasTrmMaturityLevel =
  | 'LEVEL_1_INITIAL'     // Ad-hoc, undocumented
  | 'LEVEL_2_DEVELOPING'  // Repeatable but informal
  | 'LEVEL_3_DEFINED'     // Documented standard procedures
  | 'LEVEL_4_MANAGED'     // Measured and controlled with KPIs
  | 'LEVEL_5_OPTIMIZED';  // Continuous telemetry & automated assurance

export type MasTrmRiskCategory =
  | 'TECHNOLOGY_RISK'
  | 'CYBER_RISK'
  | 'AVAILABILITY_RISK'
  | 'CONFIDENTIALITY_RISK'
  | 'INTEGRITY_RISK'
  | 'ACCESS_RISK'
  | 'THIRD_PARTY_RISK'
  | 'OPERATIONAL_RESILIENCE_RISK'
  | 'DATA_SECURITY_RISK'
  | 'SOFTWARE_DEVELOPMENT_RISK'
  | 'CLOUD_RISK'
  | 'INCIDENT_RISK';

// ----------------------------------------------------------------------------
// 2. DOMAIN MODEL: CLAUSE -> REQUIREMENT -> OBJECTIVE -> CONTROL
// ----------------------------------------------------------------------------

export interface MasTrmClause {
  clauseNumber: number; // 3 to 16
  clauseCode: string;   // e.g. "CLAUSE_03", "CLAUSE_09"
  title: string;        // e.g. "Access Control", "Board and Senior Management Oversight"
  shortTitle: string;
  description: string;
  trmSection: string;   // e.g. "Section 9.0"
  statutoryAct: string; // "Banking Act (Cap. 19) / FSM Act 2022"
  officialSourceUrl: string;
  officialPageReferences: string[];
  totalRequirementsCount: number;
  totalControlsCount: number;
  riskCategories: MasTrmRiskCategory[];
  osaMappingCoverageRatio?: number; // Estimated reference coverage ratio from OSA
}

export interface MasTrmRequirement {
  requirementId: string; // e.g. "MAS-TRM-REQ-09.01", "MAS-TRM-REQ-03.01"
  clauseNumber: number;
  sectionCode: string;   // e.g. "Section 9.1", "Clause 3.1.1"
  title: string;
  requirementText: string;
  mandatory: boolean;
  bindingNature: BindingNature; // e.g. "SUPERVISORY_EXPECTATION" / "BINDING"
  sourceClassification: SourceClassification; // Must be "DIRECT_SOURCE"
  officialSourceUrl: string;
  officialDocument: string;
  officialPageNumber: string;
  officialSection: string;
  publicationDate: string;
  effectiveDate: string;
  verificationStatus: VerificationStatus;
  sourceHash: string; // SHA-256 of MAS TRM 2021 document
  applicableEntityTypes: FinancialInstitutionType[];
  controlObjectiveIds: string[];
}

export interface MasTrmControlObjective {
  objectiveId: string; // e.g. "OBJ-TRM-09.01"
  clauseNumber: number;
  requirementId: string;
  objectiveCode: string;
  title: string;
  objectiveStatement: string;
  primaryRiskCategory: MasTrmRiskCategory;
  associatedControlsCount: number;
}

export interface MasTrmImplementationGuidance {
  guidanceId: string;
  controlId: string;
  guidanceType: 'OFFICIAL_MAS_GUIDANCE' | 'SKANDA_IMPLEMENTATION_GUIDANCE';
  guidanceText: string;
  recommendedArchitecturePatterns: string[];
  commonPitfalls: string[];
  authoritativeCitation?: string;
  sourceClassification: SourceClassification;
}

export interface MasTrmEvidenceRequirement {
  evidenceId: string;
  controlId: string;
  evidenceCode: string;
  name: string;
  description: string;
  evidenceCategory: 'POLICY' | 'PROCEDURE' | 'ARCHITECTURE_DIAGRAM' | 'ACCESS_LOG' | 'VULNERABILITY_REPORT' | 'PENTEST_REPORT' | 'DR_EVIDENCE' | 'INCIDENT_RECORD' | 'VENDOR_ASSESSMENT' | 'TRAINING_LOG' | 'CHANGE_RECORD';
  requiredArtifacts: string[];
  isMandatory: boolean;
  sourceClassification: 'DIRECT_SOURCE' | 'SKANDA_RECOMMENDED_EVIDENCE';
  recommendedRetentionDays: number;
}

export interface MasTrmTestProcedure {
  procedureId: string;
  controlId: string;
  procedureCode: string;
  title: string;
  testType: 'DESIGN_EFFECTIVENESS' | 'OPERATING_EFFECTIVENESS';
  testMethod: MasTrmTestingMethod;
  testingFrequency: 'CONTINUOUS' | 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';
  stepDescriptions: string[];
  samplingGuideline: string;
  expectedOutcome: string;
  evaluationCriteria: string;
}

export interface MasTrmCrossFrameworkMapping {
  mappingId: string;
  sourceFramework: 'MAS_TRM_2021';
  sourceControlCode: string; // e.g. "MAS-TRM-09-AC-01"
  sourceClauseNumber: number;
  targetFramework: 'NIST_SP_800_53_R5' | 'ISO_27001_2022' | 'SOC_2_TYPE_2' | 'PCI_DSS_V4' | 'CIS_CONTROLS_V8' | 'DPDP_2023';
  targetControlCode: string;  // e.g. "AC-2", "A.5.15", "CC6.1"
  targetControlTitle: string;
  mappingType: 'DIRECT_SATISFACTION' | 'PARTIAL_CONTRIBUTION' | 'COMPENSATING' | 'RELATED';
  mappingConfidence: MappingConfidenceLevel;
  mappingSource: MappingSourceType;
  mappingSourceUrl: string;
  mappingVersion: string;
  mappingRationale: string;
  verifiedBy: string;
  verifiedAt: string;
}

export interface MasTrmControl {
  controlId: string;         // e.g. "MAS-TRM-09-AC-01"
  frameworkId: 'MAS_TRM_2021';
  clauseNumber: number;
  clauseTitle: string;
  requirementId: string;
  controlCode: string;       // e.g. "MAS-TRM-09-AC-01"
  controlTitle: string;
  controlObjective: string;
  description: string;
  implementationGuidance: MasTrmImplementationGuidance[];
  applicabilityCriteria: {
    entityTypes: FinancialInstitutionType[];
    requiresCriticalSystems: boolean;
    requiresCloudUsage: boolean;
    requiresOnlineServices: boolean;
    requiresOutsourcing: boolean;
  };
  ownerRole: string; // e.g. "Chief Information Security Officer (CISO)", "Head of IAM"
  evidenceRequirements: MasTrmEvidenceRequirement[];
  testProcedures: MasTrmTestProcedure[];
  testingFrequency: 'CONTINUOUS' | 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';
  riskMappings: MasTrmRiskCategory[];
  policyMappings: string[];   // e.g. ['POL-SEC-01', 'POL-IAM-02']
  processMappings: string[];  // e.g. ['PRC-ACCESS-PROVISIONING', 'PRC-QUARTERLY-IAM-REVIEW']
  canonicalControlCode: string; // e.g. 'CTRL-IAM-01'
  crossFrameworkMappings: MasTrmCrossFrameworkMapping[];
  status: MasTrmControlLifecycleStatus;
  sourceProvenance: {
    regulator: RegulatoryAuthority;
    jurisdiction: string;
    instrumentNumber: string;
    sourceDocument: string;
    sourceUrl: string;
    sourcePage: string;
    sourceSection: string;
    sourceHash: string;
    publicationDate: string;
    effectiveDate: string;
    verificationStatus: VerificationStatus;
  };
}

// ----------------------------------------------------------------------------
// 3. TENANT OPERATIONAL ASSESSMENT & AUDIT WORKBENCH
// ----------------------------------------------------------------------------

export interface MasTrmTenantControlState {
  controlCode: string;
  tenantId: string;
  implementationStatus: MasTrmControlLifecycleStatus;
  implementedAt?: string;
  assignedOwner: string;
  designEffectiveness: 'EFFECTIVE' | 'INEFFECTIVE' | 'NOT_ASSESSED';
  operatingEffectiveness: 'EFFECTIVE' | 'INEFFECTIVE' | 'NOT_ASSESSED';
  lastTestedAt?: string;
  nextTestDueDate: string;
  collectedEvidenceCount: number;
  openFindingsCount: number;
  hasActiveException: boolean;
  overallHealth: 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'INEFFECTIVE' | 'NOT_ASSESSED';
}

export interface MasTrmClauseAssessmentSummary {
  clauseNumber: number;
  clauseTitle: string;
  totalControls: number;
  implementedControls: number;
  operatingControls: number;
  effectiveControls: number;
  ineffectiveControls: number;
  openFindings: number;
  maturityLevel: MasTrmMaturityLevel;
  readinessPercentage: number;
}

export interface MasTrmAssessment {
  assessmentId: string;
  tenantId: string;
  assessmentTitle: string;
  assessedAt: string;
  assessor: string;
  assessorRole: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED' | 'ARCHIVED';
  maturityLevel: MasTrmMaturityLevel;
  maturityScore: number; // 1.0 to 5.0
  totalApplicableControls: number;
  implementedControlsCount: number;
  operatingControlsCount: number;
  effectiveControlsCount: number;
  ineffectiveControlsCount: number;
  openFindingsCount: number;
  overdueCapasCount: number;
  clauseBreakdowns: MasTrmClauseAssessmentSummary[];
  evidenceCoverageRate: number; // 0.00 to 1.00
  testingCompletionRate: number; // 0.00 to 1.00
  overallMaturityLabel: string;
}

export interface MasTrmFinding {
  findingId: string;
  tenantId: string;
  assessmentId: string;
  controlCode: string;
  clauseNumber: number;
  title: string;
  severity: ImpactLevel;
  description: string;
  evidenceGapSummary: string;
  rootCause: string;
  status: 'OPEN' | 'REMEDIATION_IN_PROGRESS' | 'RETEST_PENDING' | 'CLOSED';
  identifiedBy: string;
  identifiedAt: string;
  remediationDueDate: string;
  linkedCapaId?: string;
}

export interface MasTrmCAPA {
  capaId: string;
  tenantId: string;
  findingId: string;
  controlCode: string;
  title: string;
  remediationPlan: string;
  owner: string;
  ownerRole: string;
  assignedDate: string;
  targetDueDate: string;
  completedDate?: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'RETEST_REQUESTED' | 'COMPLETED' | 'OVERDUE';
  retestRequestedBy?: string;
  retestResult?: 'PASSED' | 'FAILED' | 'PENDING';
  retestNotes?: string;
}

export interface MasTrmAssuranceConclusion {
  assuranceId: string;
  tenantId: string;
  assessmentId: string;
  auditPeriodStart: string;
  auditPeriodEnd: string;
  leadAuditor: string;
  auditorCredentials: string; // e.g. "ISO 27001 Lead Auditor, CISA, CRISC"
  conclusion: 'SATISFACTORY' | 'SATISFACTORY_WITH_EXCEPTIONS' | 'REQUIRES_IMMEDIATE_REMEDIATION' | 'ADVERSE';
  summaryRationale: string;
  certifiedClausesCount: number;
  totalExceptionsCount: number;
  issuedAt: string;
  signatureHash: string;
}

// ----------------------------------------------------------------------------
// 4. CONTROL HEALTH EVALUATION CONTRACT
// ----------------------------------------------------------------------------

export interface MasTrmControlHealth {
  controlCode: string;
  isImplemented: boolean;
  evidenceStatus: 'CURRENT' | 'EXPIRED' | 'MISSING' | 'INSUFFICIENT';
  testStatus: 'PASSED' | 'FAILED' | 'OVERDUE' | 'NOT_TESTED';
  riskLevel: ImpactLevel;
  hasOpenFinding: boolean;
  hasActiveException: boolean;
  recencyDays: number;
  hasAssignedOwner: boolean;
  designEffectiveness: 'EFFECTIVE' | 'INEFFECTIVE' | 'NOT_ASSESSED';
  operatingEffectiveness: 'EFFECTIVE' | 'INEFFECTIVE' | 'NOT_ASSESSED';
  overallHealth: 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'INEFFECTIVE' | 'NOT_ASSESSED';
  healthScore: number; // 0 to 100
}

// ----------------------------------------------------------------------------
// 5. PROVENANCE & "SHOW ME WHY" / "SHOW ME HOW" TRACE STRUCTURES
// ----------------------------------------------------------------------------

export interface MasTrmShowMeWhyTrace {
  controlCode: string;
  officialSource: {
    regulator: RegulatoryAuthority;
    instrumentTitle: string;
    sourceDocument: string;
    sourceUrl: string;
    sha256Hash: string;
    publicationDate: string;
    effectiveDate: string;
  };
  masTrmClause: {
    clauseNumber: number;
    clauseTitle: string;
    trmSection: string;
  };
  requirement: {
    requirementId: string;
    sectionCode: string;
    requirementText: string;
    bindingNature: BindingNature;
    sourceClassification: 'DIRECT_SOURCE';
  };
  controlObjective: {
    objectiveId: string;
    statement: string;
    primaryRisk: MasTrmRiskCategory;
  };
  canonicalControl: {
    canonicalCode: string;
    title: string;
  };
  riskMapping: MasTrmRiskCategory[];
  policyMapping: string[];
  processMapping: string[];
  evidenceRequired: string[];
  testProcedures: string[];
  crossFrameworks: {
    nistSp80053: string[];
    iso27001: string[];
    soc2: string[];
    pciDss: string[];
  };
  completeLineagePath: string[];
}

export interface MasTrmShowMeHowGuide {
  controlCode: string;
  controlTitle: string;
  officialRequirementText: string;
  skandaImplementationGuidance: string[];
  recommendedArchitecturePatterns: string[];
  recommendedEvidenceArtifacts: string[];
  testingExecutionGuide: string[];
  commonAuditPitfalls: string[];
  classificationDistinction: {
    officialRequirement: 'DIRECT_SOURCE';
    implementationGuidance: 'SKANDA_INTERPRETATION';
    recommendedControls: 'SKANDA_RECOMMENDED_CONTROL';
  };
}

// ----------------------------------------------------------------------------
// 6. AI MAS TRM COPILOT QUERY & ANSWER
// ----------------------------------------------------------------------------

export interface MasTrmCopilotQuery {
  tenantId: string;
  query: string;
  clauseFocus?: number;
  controlFocus?: string;
}

export interface MasTrmCopilotResponse {
  answer: string;
  clauseNumber?: number;
  clauseTitle?: string;
  sourceNoticeNumber: string;
  sectionReference: string;
  officialSourceUrl: string;
  sourceDocumentHash: string;
  sourceClassification: SourceClassification;
  mappedNistControls: string[];
  mappedIsoControls: string[];
  skandaImplementationGuidance?: string;
  skandaRecommendedControls?: string[];
  recommendedEvidence?: string[];
  confidenceScore: number;
  isOfficialSourceGrounded: boolean;
}
