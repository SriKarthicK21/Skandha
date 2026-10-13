// MAS Technology Risk Management (TRM) Framework Types & Data Models
// Authoritative Grounding: Monetary Authority of Singapore (MAS) TRM Guidelines (January 2021 Edition)
// Multi-Framework Architecture for Skanda Enterprise GRC

export type MASTechnologyRiskCategory =
  | 'Cyber'
  | 'Availability'
  | 'Resilience'
  | 'Infrastructure'
  | 'Application'
  | 'Cloud'
  | 'Data'
  | 'Third-Party'
  | 'Outsourcing'
  | 'Access'
  | 'Change'
  | 'SDLC'
  | 'Operational'
  | 'Tech Project Risk';

export type MASApplicabilityStatus =
  | 'Applicable'
  | 'Potentially Applicable'
  | 'Not Applicable';

export type MASModuleKey =
  | 'gov_oversight'
  | 'tech_risk_mgmt'
  | 'asset_mgmt'
  | 'third_party_risk'
  | 'project_mgmt'
  | 'app_security'
  | 'itsm'
  | 'it_resilience'
  | 'access_control'
  | 'cryptography'
  | 'data_infra_security'
  | 'cyber_ops'
  | 'cyber_assessment'
  | 'online_fin_services'
  | 'it_audit'
  | 'remediation_capa'
  | 'continuous_monitoring';

export interface MASModuleMetadata {
  id: string;
  moduleKey: MASModuleKey;
  number: string; // e.g. "01", "02"
  title: string;
  shortTitle: string;
  trmSection: string; // e.g. "Section 3.0", "Section 4.0"
  description: string;
  totalRequirements: number;
  implementedCount: number;
  inProgressCount: number;
  openCount: number;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'COMPLIANT' | 'IN_PROGRESS' | 'NEEDS_ATTENTION' | 'NOT_STARTED';
  icon: string;
}

export interface MASRegulatoryProfile {
  isSingaporeEntity: boolean;
  isMasRegulated: boolean;
  entityType: string;
  institutionCategory?: string;
  licenceType: string;
  regulatedActivities: string[];
  financialServicesOffered: string[];
  applicableRegimes: string[];
  businessModel: string;
  designatedCriticalSystemsCount: number;
  criticalBusinessServices: string[];
  cloudAdoptionModel: string;
  cloudProviders: string[];
  materialOutsourcers: string[];
  onlineFinancialServicesOffered: boolean;
  customerAuthenticationMethods: string[];
  lastAuditDate?: string;
  nextAuditDate?: string;
  applicabilityStatus: 'NOT_STARTED' | 'DISCOVERY_IN_PROGRESS' | 'CONFIRMED';
  applicabilityApprovedBy?: string;
  applicabilityApprovedDate?: string;
}

export type MASModuleApplicabilityDictionary = Record<string, boolean>;

export interface ApplicabilityRule {
  id: string;
  code: string;
  name: string;
  description: string;
  category: 'MANDATORY_NOTICE' | 'CRITICAL_SYSTEMS' | 'ONLINE_SERVICES' | 'CLOUD_OUTSOURCING' | 'CYBER_HYGIENE' | 'GENERAL_TRM';
  statutoryBasis: string;
  affectedModuleIds: string[];
  moduleKeysDictionary?: Record<string, boolean>;
  evaluator: (profile: MASRegulatoryProfile) => boolean;
  rationaleIfActive: string;
  rationaleIfInactive: string;
}

export interface MASRequirementReadinessDetail {
  requirementId: string;
  requirementCode: string;
  title: string;
  domainNumber: string;
  domainName: string;
  criticalityWeight: number;
  criticalSystemsMandate: boolean;
  isMandatoryNotice: boolean;
  complianceStatus: 'COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT' | 'NOT_APPLICABLE' | 'NOT_ASSESSED';
  maturityLevel: number;
  baseReadinessScore: number;
  readinessScore: number; // 0 - 100
  riskScore: number; // 0 - 100
  riskTier: 'HIGH_RISK' | 'MEDIUM_RISK' | 'LOW_RISK';
  openFindingsCount: number;
  majorFindingsCount: number;
  minorFindingsCount: number;
  observationCount: number;
  findingsPenalty: number;
  evidenceCount: number;
  verifiedEvidenceCount: number;
  evidenceCoverageRate: number;
  evidenceGapIdentified: boolean;
  statutoryMandateType: 'NOTICE_655_CYBER_HYGIENE' | 'NOTICE_644_CRITICAL_SYSTEMS' | 'OUTSOURCING_MANDATE' | 'TRM_2021_GUIDELINES';
}

export interface MASReadinessScoreSummary {
  overallScore: number;
  overallReadinessScore: number;
  criticalSystemsReadiness: number;
  cyberHygieneNotice655Readiness: number;
  evidenceCoverageRate: number;
  totalApplicableRequirements: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  totalOpenFindings: number;
  majorNonConformitiesCount: number;
  domainBreakdown: Record<string, {
    domainNumber: string;
    domainName: string;
    score: number;
    openFindings: number;
    majorFindings: number;
    highRiskCount: number;
    evidenceCount: number;
  }>;
  criticalSlaStatus: {
    rtoMet: boolean;
    masNotificationReady: boolean;
    unscheduledDowntimeHours: number;
  };
  details: Record<string, MASRequirementReadinessDetail>;
}

export interface ApplicabilityRuleConfig {
  rules: ApplicabilityRule[];
  regulatoryProfile: MASRegulatoryProfile;
  profile: MASRegulatoryProfile;
  moduleKeysDictionary: Record<string, boolean>;
  moduleKeys: Record<string, boolean>;
  toggleableModuleKeys: Record<string, boolean>;
  activeModuleIds: string[];
  isFrameworkActive: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  toggleFrameworkActivation: () => void;
  isModuleApplicable: (moduleId: string) => boolean;
  isMASModuleApplicable: (moduleId: string) => boolean;
  getRuleForModule: (moduleId: string) => ApplicabilityRule | undefined;
  recalibrateProfile: (updates: Partial<MASRegulatoryProfile>) => void;
  activateFramework: () => void;
  deactivateFramework: () => void;
  readinessScore: number;
  readinessSummary: MASReadinessScoreSummary;
  calculateReadinessScore: () => MASReadinessScoreSummary;
}

export interface MASApplicabilityEvaluation {
  requirementId: string;
  requirementCode: string;
  title: string;
  domainNumber: string;
  domainName: string;
  statutoryBasis: string;
  applicability: MASApplicabilityStatus;
  rationale: string;
  mandatoryRuleTriggered?: string;
  requiredEvidenceTypes: string[];
  crossFrameworkIsoControl?: string;
  reviewer?: string;
  reviewDate?: string;
  supportingEvidenceNotes?: string;
}

export interface MASTechnologyRiskItem {
  id: string;
  riskCode: string;
  title: string;
  category: MASTechnologyRiskCategory;
  relatedAssetId?: string;
  relatedAssetName?: string;
  relatedBusinessService: string;
  threatDescription: string;
  vulnerabilityDescription: string;
  likelihood: number; // 1-5
  impact: number; // 1-5
  inherentScore: number;
  treatmentOption: 'Mitigate' | 'Transfer' | 'Avoid' | 'Accept';
  mitigationControl: string;
  residualLikelihood: number;
  residualImpact: number;
  residualScore: number;
  status: 'Identified' | 'Assessment' | 'Treatment in Progress' | 'Residual Monitored' | 'Closed';
  owner: string;
  targetDate: string;
  evidenceCount: number;
  masTrmSection: string;
  isoControlMapping?: string;
  masRequirementIds?: string[];
  masRequirementCodes?: string[];
  exposureTier?: 'CRITICAL_EXPOSURE' | 'HIGH_EXPOSURE' | 'MEDIUM_EXPOSURE' | 'LOW_EXPOSURE';
  exposureScore?: number;
}

export interface MASCriticalSystemItem {
  id: string;
  systemName: string;
  businessService: string;
  businessOwner: string;
  technologyOwner: string;
  systemClassification: 'Tier 1 Critical' | 'Tier 2 Critical' | 'Non-Critical';
  criticality: 'CRITICAL' | 'HIGH';
  availabilityTarget: string; // e.g. "99.99%"
  rtoTargetHours: number; // MAS requires <= 4h
  rpoTargetHours: number; // MAS requires <= 1h
  maxAnnualDowntimeHours: number; // MAS guideline: <= 4h unplanned
  hostingModel: 'Commercial Cloud SG' | 'Hybrid Multi-Cloud' | 'On-Premises Data Centre' | 'SaaS';
  cloudProvider?: string;
  primaryLocation: string;
  drLocation: string;
  drTestingFrequencyMonths: number;
  lastRecoveryTestDate: string;
  nextRecoveryTestDate: string;
  testStatus: 'Compliant' | 'Due Soon' | 'Overdue' | 'Failed';
  backupFrequency: string;
  backupRestorationTested: boolean;
  activeIncidentsCount: number;
  masRequirements: string[];
}

export interface MASImplementationStageDetail {
  number: string;
  title: string;
  shortTitle: string;
  phase: 'Phase 1: Foundation' | 'Phase 2: Core Engineering' | 'Phase 3: Operations & Cyber' | 'Phase 4: Assurance & Monitoring';
  description: string;
  keyDeliverables: string[];
  applicableTrmSections: string[];
  status: 'Completed' | 'In Progress' | 'Pending';
  completionPercentage: number;
  gatePassed: boolean;
  leadRole: string;
  estimatedWeeks: number;
}
