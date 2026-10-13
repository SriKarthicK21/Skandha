import {
  MASFinancialInstitutionProfile,
  MASRequirementAssessmentRecord,
  MASIncidentBreachRecord
} from '../types/regulatoryTypes';
import { MASRegulatoryProfile } from '../types/masTrmFrameworkTypes';
import { MAS_TRM_REQUIREMENTS } from './masRegulatoryMasterData';

export const INITIAL_MAS_REGULATORY_PROFILE: MASRegulatoryProfile = {
  isSingaporeEntity: true,
  isMasRegulated: true,
  entityType: 'BANK_FULL_OR_QUALIFYING',
  licenceType: 'Full Banking Licence (Banking Act Cap. 19)',
  regulatedActivities: ['Banking Business', 'Payment Services', 'Custody Services'],
  financialServicesOffered: ['Retail & Commercial Deposits', 'Internet Banking', 'FAST Interbank Transfers', 'Card Issuance'],
  applicableRegimes: ['Banking Act', 'MAS Notice 644', 'MAS Notice 655', 'MAS Notice PSN05', 'MAS TRM Guidelines 2021'],
  businessModel: 'Banking',
  designatedCriticalSystemsCount: 3,
  criticalBusinessServices: ['Deposit & Lending Operations', 'Real-time Interbank Payments', 'Card Processing', 'Treasury & Liquidity'],
  cloudAdoptionModel: 'Commercial Cloud SG',
  cloudProviders: ['AWS Singapore (ap-southeast-1)', 'Google Cloud Singapore'],
  materialOutsourcers: ['Equinix Singapore DC', 'Wolters Kluwer OneSumX', 'Salesforce CRM SG', 'CyberArk Cloud PAM'],
  onlineFinancialServicesOffered: true,
  customerAuthenticationMethods: ['Hardware/Software Token MFA', 'FIDO2 Biometric Authentication', 'Transaction Signing for High-Risk Transfers'],
  applicabilityStatus: 'CONFIRMED',
  applicabilityApprovedBy: 'Arjun Mehta (CISO)',
  applicabilityApprovedDate: '2026-01-15'
};

export const INITIAL_MAS_PROFILE: MASFinancialInstitutionProfile = {
  institutionCategory: 'MAJOR_PAYMENT_INSTITUTION',
  masLicenseNumber: 'MAS-MPI-2024-SG-0089',
  operatingInSingapore: true,
  designatedCriticalSystemsCount: 3,
  criticalSystemsList: [
    {
      id: 'CS-01',
      systemName: 'Apex Pay Real-Time Settlement Engine',
      purpose: 'Core transactional routing, real-time clearing, and fund settlement under FAST/PayNow network.',
      hostingModel: 'COMMERCIAL_CLOUD_SG',
      rtoTargetHours: 2, // Within MAS 4h limit
      rpoTargetHours: 0.25, // 15 mins, within MAS 1h limit
      maxAnnualDowntimeHours: 2.5, // Within MAS 4h/year limit
      incidentNotificationSlaMinutes: 60 // 1 hour MAS Notice SLA
    },
    {
      id: 'CS-02',
      systemName: 'Apex Core Ledger & Multi-Currency Treasury Database',
      purpose: 'Immutable transactional ledger holding customer balances and custody records.',
      hostingModel: 'COMMERCIAL_CLOUD_SG',
      rtoTargetHours: 3,
      rpoTargetHours: 0.5,
      maxAnnualDowntimeHours: 1.8,
      incidentNotificationSlaMinutes: 60
    },
    {
      id: 'CS-03',
      systemName: 'Apex Open Banking API Gateway & OAuth2 IAM Vault',
      purpose: 'Customer identity verification, API authentication, and payment tokenization.',
      hostingModel: 'HYBRID',
      rtoTargetHours: 1.5,
      rpoTargetHours: 0.1,
      maxAnnualDowntimeHours: 1.2,
      incidentNotificationSlaMinutes: 60
    }
  ],
  cloudAdoptionModel: 'HYBRID_MULTI_CLOUD',
  materialOutsourcingArrangementsCount: 4,
  executiveSponsors: {
    chiefInformationSecurityOfficer: 'Arjun Mehta (CISSP, CISM)',
    chiefTechnologyOfficer: 'Elena Rostova',
    chiefRiskOfficer: 'Marcus Tan',
    boardTechnologyCommitteeChair: 'Dr. Raymond Lim'
  },
  lastIndependentTRMAuditDate: '2025-11-10',
  nextScheduledTRMAuditDate: '2026-11-15'
};

export const INITIAL_MAS_ASSESSMENTS: MASRequirementAssessmentRecord[] = MAS_TRM_REQUIREMENTS.map((req, idx) => {
  // Pre-populate with realistic enterprise compliance state (78% compliant)
  const isHighCompliant = [0, 1, 3, 5, 8, 9].includes(idx);
  const isPartial = [2, 4, 7].includes(idx);
  
  return {
    id: `MAS-ASSESS-${req.requirementCode}`,
    tenantId: 'tenant_apex',
    frameworkCode: req.frameworkCode,
    frameworkVersion: req.frameworkVersion,
    requirementCode: req.requirementCode,
    requirementTitle: req.title,
    domainNumber: req.domainNumber,
    domainName: req.domainName,
    applicabilityStatus: 'APPLICABLE',
    complianceStatus: isHighCompliant ? 'COMPLIANT' : isPartial ? 'PARTIALLY_COMPLIANT' : 'COMPLIANT',
    maturityLevel: isHighCompliant ? 4 : isPartial ? 3 : 4,
    designEffectiveness: isHighCompliant ? 'EFFECTIVE' : 'LARGELY_EFFECTIVE',
    operatingEffectiveness: isHighCompliant ? 'EFFECTIVE' : isPartial ? 'PARTIALLY_EFFECTIVE' : 'EFFECTIVE',
    currentStateSummary: isHighCompliant 
      ? `Full compliance established with formal policy, operational controls, and automated SIEM telemetry verified during internal review.`
      : `Core procedural controls in place; automated continuous evidence collection currently expanding across hybrid cloud clusters.`,
    targetStateSummary: `Targeting CMMI Level 5 Optimized maturity with continuous real-time compliance telemetry.`,
    identifiedGaps: isPartial 
      ? `Periodic review cycle completed for core systems, but 2 sub-contractor third-party attestations require updated annual renewal.`
      : `Zero significant non-conformities identified.`,
    sampleTestResults: `Sample testing of 25 transactions and operational logs validated zero critical exceptions.`,
    testedSamplesCount: 25,
    testedSamplesFailedCount: isPartial ? 1 : 0,
    controlOwner: req.responsibleRoles[0] || 'CISO',
    assessedBy: 'Arjun Mehta (Lead GRC Assessor)',
    assessedDate: '2026-08-10',
    reviewDate: '2026-11-10',
    linkedEvidenceIds: ['ev_001', 'ev_002', 'ev_005'],
    linkedRiskIds: ['rsk_001', 'rsk_003'],
    linkedFindingIds: isPartial ? ['fnd_002'] : [],
    linkedCommonControlCodes: req.crossFrameworkMappings.iso27001 || ['A.5.1']
  };
});

export const INITIAL_MAS_INCIDENTS: MASIncidentBreachRecord[] = [
  {
    id: 'INC-2026-001',
    tenantId: 'tenant_apex',
    incidentCode: 'MAS-INC-2026-001',
    title: 'Simulated Failover & Tabletop Drill: Distributed Edge Latency Spike',
    discoveryTimestamp: '2026-07-14T09:15:00Z',
    masNotificationDeadlineTimestamp: '2026-07-14T10:15:00Z', // 1-hour SLA
    masNotificationStatus: 'WITHIN_SLA',
    severity: 'SEVERITY_2_MAJOR_SECURITY_EVENT',
    affectedCriticalSystems: ['Apex Pay Real-Time Settlement Engine'],
    customerImpactEstimate: 0,
    rootCauseCategory: 'CYBER_ATTACK',
    executiveSummary: 'Annual unannounced tabletop drill simulating volumetric DDoS and BGP route hijacking. Notification draft generated within 28 minutes of incident declaration.',
    containmentStatus: 'RECOVERED_OPERATIONAL',
    regulatoryReportPreparedBy: 'Arjun Mehta (CISO)',
    masOfficerContacted: 'MAS Technology Risk Supervision Dept (FinTech Division)',
    postIncidentReportDueDate: '2026-07-28'
  }
];
