// Regulatory Intelligence, Framework Engine & Multi-Standard Architecture Types

export type RegulatoryAuthorityJurisdiction = 
  | 'SINGAPORE'
  | 'GLOBAL_ISO'
  | 'UNITED_STATES'
  | 'EUROPEAN_UNION'
  | 'UNITED_KINGDOM'
  | 'INDIA'
  | 'NIGERIA'
  | 'AUSTRALIA'
  | 'INTERNATIONAL';

export type RegulatoryCategory = 
  | 'TECHNOLOGY_RISK'
  | 'CYBERSECURITY'
  | 'INFORMATION_SECURITY'
  | 'DATA_PRIVACY'
  | 'ARTIFICIAL_INTELLIGENCE'
  | 'PAYMENTS_SECURITY'
  | 'OUTSOURCING_RISK'
  | 'OPERATIONAL_RESILIENCE';

export interface RegulatoryAuthority {
  id: string;
  code: string; // e.g. "MAS", "ISO", "NIST", "AICPA", "PCI_SSC", "PDPC"
  name: string; // e.g. "Monetary Authority of Singapore"
  shortName: string;
  jurisdiction: RegulatoryAuthorityJurisdiction;
  country: string;
  website: string;
  description: string;
  logoUrl?: string;
  isStatutoryRegulator: boolean;
  legalEnforceability: 'MANDATORY_REGULATION' | 'REGULATORY_GUIDELINES' | 'VOLUNTARY_STANDARD' | 'INDUSTRY_MANDATE';
}

export interface RegulatorySourceDocument {
  id: string;
  authorityId: string;
  authorityCode: string;
  documentNumber: string; // e.g. "MAS TRM Guidelines 2021", "MAS Notice 644", "MAS Notice 655"
  title: string;
  version: string;
  publicationDate: string; // ISO 8601 Date
  effectiveDate: string;
  retrievedDate: string;
  status: 'ACTIVE_ENFORCED' | 'UNDER_CONSULTATION' | 'SUPERSEDED' | 'PROPOSED';
  sourceUrl: string;
  checksumSHA256: string;
  regulatoryCategory: RegulatoryCategory;
  licensingMetadata: string;
  summary: string;
  importedBy: string;
  importedAt: string;
  officialEnforcementPenalties?: string;
}

export interface FrameworkDefinition {
  id: string;
  code: string; // e.g. "MAS-TRM", "ISO-27001", "NIST-CSF-2.0", "SOC-2", "PCI-DSS-4.0"
  name: string;
  shortTitle: string;
  authorityId: string;
  authorityCode: string;
  category: RegulatoryCategory;
  jurisdiction: RegulatoryAuthorityJurisdiction;
  currentVersion: string;
  publishedVersions: string[];
  description: string;
  totalDomains: number;
  totalRequirements: number;
  totalControls: number;
  isMandatoryForLicensedFIs?: boolean;
  badgeColor: string;
  iconName: string;
  sourceDocumentId: string;
  commercialTier: 'CORE_INCLUDED' | 'ENTERPRISE_PACK' | 'PREMIUM_REGULATORY_PACK';
}

export interface FrameworkDomain {
  id: string;
  frameworkId: string;
  frameworkCode: string;
  domainNumber: string; // e.g. "3.0", "4.0", "5.0"
  name: string;
  shortName: string;
  description: string;
  objectivesSummary: string;
  totalRequirements: number;
  weightPercentage: number;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export type RequirementApplicabilityStatus = 
  | 'APPLICABLE'
  | 'NOT_APPLICABLE'
  | 'CONDITIONALLY_APPLICABLE'
  | 'PENDING_ASSESSMENT';

export type ImplementationMaturityLevel = 
  | 0 // Non-existent / Incomplete
  | 1 // Initial / Ad-hoc
  | 2 // Developing / Repeatable
  | 3 // Defined / Documented
  | 4 // Managed / Measured
  | 5; // Optimized / Continually Improving

export type AssessmentComplianceStatus = 
  | 'COMPLIANT'
  | 'PARTIALLY_COMPLIANT'
  | 'NON_COMPLIANT'
  | 'NOT_APPLICABLE'
  | 'NOT_ASSESSED';

export type ControlEffectivenessStatus = 
  | 'EFFECTIVE'
  | 'LARGELY_EFFECTIVE'
  | 'PARTIALLY_EFFECTIVE'
  | 'INEFFECTIVE'
  | 'NOT_TESTED';

export interface RegulatoryRequirement {
  id: string;
  frameworkId: string;
  frameworkCode: string;
  frameworkVersion: string;
  domainId: string;
  domainNumber: string;
  domainName: string;
  sectionNumber: string; // e.g. "3.1", "3.2.1", "6.1.1"
  requirementCode: string; // e.g. "MAS-TRM-3.1", "MAS-TRM-8.1.1"
  title: string;
  statement: string; // Exact regulatory requirement text / statement
  intentAndGuidance: string;
  regulatorySourceRef: string; // e.g. "MAS TRM Guidelines Section 3.1.1"
  mandatoryForFIs: boolean;
  criticalSystemsMandate: boolean; // Applicable specifically to Critical Information Infrastructure / Systems
  slaRequirement?: string; // e.g. "1-Hour Notification to MAS", "RTO <= 4 Hours", "RPO <= 1 Hour"
  controlObjectives: string[];
  testProcedures: string[];
  evidenceRequirements: string[];
  responsibleRoles: string[];
  recommendedReviewFrequency: 'Continuous' | 'Monthly' | 'Quarterly' | 'Bi-Annual' | 'Annual';
  crossFrameworkMappings: {
    iso27001?: string[]; // e.g. ["A.5.1", "A.5.2"]
    nistCsf?: string[]; // e.g. ["GV.OC-01", "PR.AC-01"]
    soc2Criteria?: string[]; // e.g. ["CC6.1", "CC6.2"]
    pciDss?: string[]; // e.g. ["Req 1.1", "Req 8.2"]
    cisControls?: string[]; // e.g. ["CIS 1.1", "CIS 5.2"]
  };
}

export interface CrossFrameworkMappingRule {
  id: string;
  sourceFramework: string;
  sourceRequirementCode: string;
  sourceRequirementTitle: string;
  targetFramework: string;
  targetControlOrClauseCode: string;
  targetTitle: string;
  mappingType: 'EXACT_EQUIVALENT' | 'SUBSET' | 'SUPERSET' | 'RELATED_OVERLAP';
  confidenceScore: number; // 0-100%
  justificationNotes: string;
  humanVerified: boolean;
  verifiedBy?: string;
  verifiedDate?: string;
  evidenceReusability: 'DIRECT_REUSE' | 'REQUIRES_ADDITIONAL_METRIC' | 'PARTIAL_SUPPORT';
}

export interface CriticalInformationSystemRecord {
  id: string;
  systemName: string;
  purpose: string;
  hostingModel: 'ON_PREMISE_SG' | 'COMMERCIAL_CLOUD_SG' | 'CROSS_BORDER_CLOUD' | 'HYBRID';
  rtoTargetHours: number; // MAS TRM Mandate: <= 4 hours
  rpoTargetHours: number; // MAS TRM Mandate: <= 1 hour
  maxAnnualDowntimeHours: number; // MAS Mandate: <= 4 hours / year
  incidentNotificationSlaMinutes: number; // MAS Notice Mandate: <= 60 minutes (1 hour)
}

export interface MASFinancialInstitutionProfile {
  institutionCategory: 
    | 'BANK_FULL_OR_QUALIFYING'
    | 'MERCHANT_BANK'
    | 'FINANCE_COMPANY'
    | 'DIRECT_INSURER_LIFE_OR_GENERAL'
    | 'CAPITAL_MARKETS_SERVICES_LICENSEE'
    | 'MAJOR_PAYMENT_INSTITUTION'
    | 'STANDARD_PAYMENT_INSTITUTION'
    | 'DIGITAL_PAYMENT_TOKEN_LICENSEE'
    | 'FINTECH_SANDBOX_PARTICIPANT'
    | 'NON_BANK_FINANCIAL_INSTITUTION';
  masLicenseNumber?: string;
  operatingInSingapore: boolean;
  designatedCriticalSystemsCount: number;
  criticalSystemsList: CriticalInformationSystemRecord[];
  cloudAdoptionModel: 'PUBLIC_CLOUD' | 'PRIVATE_CLOUD' | 'COMMUNITY_CLOUD' | 'HYBRID_MULTI_CLOUD' | 'ON_PREMISE_ONLY';
  materialOutsourcingArrangementsCount: number;
  executiveSponsors: {
    chiefInformationSecurityOfficer: string;
    chiefTechnologyOfficer: string;
    chiefRiskOfficer: string;
    boardTechnologyCommitteeChair: string;
  };
  lastIndependentTRMAuditDate?: string;
  nextScheduledTRMAuditDate?: string;
}

export interface MASRequirementAssessmentRecord {
  id: string;
  tenantId: string;
  frameworkCode: string;
  frameworkVersion: string;
  requirementCode: string;
  requirementTitle: string;
  domainNumber: string;
  domainName: string;
  
  // Applicability
  applicabilityStatus: RequirementApplicabilityStatus;
  nonApplicabilityJustification?: string;
  applicabilityApprovedBy?: string;
  applicabilityApprovedDate?: string;
  
  // Assessment
  complianceStatus: AssessmentComplianceStatus;
  maturityLevel: ImplementationMaturityLevel;
  designEffectiveness: ControlEffectivenessStatus;
  operatingEffectiveness: ControlEffectivenessStatus;
  
  // Evaluation Details
  currentStateSummary: string;
  targetStateSummary: string;
  identifiedGaps: string;
  sampleTestResults: string;
  testedSamplesCount: number;
  testedSamplesFailedCount: number;
  
  // Ownership & Dates
  controlOwner: string;
  assessedBy: string;
  assessedDate: string;
  reviewDate?: string;
  
  // Linked IDs
  linkedEvidenceIds: string[];
  linkedRiskIds: string[];
  linkedFindingIds: string[];
  linkedCommonControlCodes: string[];
}

export interface RegulatoryNoticeEvent {
  id: string;
  authorityCode: string; // e.g. "MAS"
  noticeNumber: string; // e.g. "MAS Notice 655", "MAS Circular TRM-2024-02"
  title: string;
  type: 'CIRCULAR' | 'MANDATORY_NOTICE' | 'CONSULTATION_PAPER' | 'GUIDELINES_UPDATE' | 'ADVISORY';
  issuedDate: string;
  effectiveDate: string;
  summary: string;
  impactLevel: 'CRITICAL_IMMEDIATE_ACTION' | 'HIGH_PLANNED_REMEDIATION' | 'MEDIUM_POLICY_UPDATE' | 'INFORMATIONAL';
  impactedDomains: string[];
  impactedRequirementCodes: string[];
  actionRequired: string;
  officialPdfUrl: string;
  acknowledgedByTenant: boolean;
  acknowledgedDate?: string;
}

export interface MASIncidentBreachRecord {
  id: string;
  tenantId: string;
  incidentCode: string; // e.g. "MAS-INC-2026-001"
  title: string;
  discoveryTimestamp: string;
  masNotificationDeadlineTimestamp: string; // Exactly 1 hour from discovery for critical systems
  masNotificationStatus: 'WITHIN_SLA' | 'PENDING_DISPATCH' | 'SLA_BREACHED' | 'EXEMPT';
  severity: 'SEVERITY_1_CRITICAL_SERVICE_DISRUPTION' | 'SEVERITY_2_MAJOR_SECURITY_EVENT' | 'SEVERITY_3_SIGNIFICANT_DATA_EXPOSURE' | 'SEVERITY_4_MINOR';
  affectedCriticalSystems: string[];
  customerImpactEstimate: number;
  rootCauseCategory: 'CYBER_ATTACK' | 'HARDWARE_FAILURE' | 'SOFTWARE_DEFECT' | 'THIRD_PARTY_OUTAGE' | 'HUMAN_ERROR' | 'RANSOMWARE';
  executiveSummary: string;
  containmentStatus: 'ACTIVE_INVESTIGATION' | 'CONTAINED' | 'RECOVERED_OPERATIONAL' | 'POST_INCIDENT_REVIEW';
  regulatoryReportPreparedBy: string;
  masOfficerContacted?: string;
  postIncidentReportDueDate: string; // 14 days per MAS TRM Guidelines
  linkedCirculars?: Array<{
    id: string;
    referenceCode: string;
    title: string;
    relevance?: string;
    sourceUrl?: string;
  }>;
}
