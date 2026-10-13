/**
 * SKANDA ENTERPRISE RISK INTELLIGENCE & CONTINUOUS RISK ASSURANCE OS
 * Authoritative Master Enterprise Risk Data, Business Services & Scenarios
 * Grounded in ISO 31000:2018, ISO/IEC 27005:2022, NIST SP 800-30 & MAS TRM Guidelines
 */

import {
  EnterpriseRiskRecord,
  RiskAppetiteThreshold,
  RiskAssessmentSnapshot,
  RiskMethodologyDefinition
} from '../types/enterpriseRiskTypes';

export interface BusinessServiceEntity {
  id: string;
  serviceCode: string;
  name: string;
  description: string;
  criticality: 'TIER_1_MISSION_CRITICAL' | 'TIER_2_BUSINESS_CRITICAL' | 'TIER_3_OPERATIONAL' | 'TIER_4_SUPPORT';
  businessOwner: string;
  technicalOwner: string;
  rtoMinutes: number;
  rpoMinutes: number;
  dependentAssetIds: string[];
  dependentSupplierIds: string[];
}

export interface ThreatScenarioEntity {
  id: string;
  threatCode: string;
  title: string;
  threatActor: 'NATION_STATE' | 'CYBERCRIMINAL_SYNDICATE' | 'INSIDER_THREAT' | 'SUPPLY_CHAIN_ACTOR' | 'SYSTEMIC_FAILURE';
  attackVector: string;
  typicalTargetAssets: string[];
  associatedMitigatingControls: string[];
}

// ============================================================================
// 1. BUSINESS SERVICES CATALOG
// ============================================================================

export const MASTER_BUSINESS_SERVICES: BusinessServiceEntity[] = [
  {
    id: 'srv-payment-gateway',
    serviceCode: 'SVC-PAY-01',
    name: 'Real-Time Payment & Settlement Engine',
    description: 'Mission-critical transaction processing API handling cardholder data and instantaneous interbank transfers.',
    criticality: 'TIER_1_MISSION_CRITICAL',
    businessOwner: 'Vikram Mehta (Head of Payments)',
    technicalOwner: 'Alex Rivera (VP Platform Engineering)',
    rtoMinutes: 15,
    rpoMinutes: 0,
    dependentAssetIds: ['ast-aws-prod-eks', 'ast-rds-aurora-prod', 'ast-kms-primary'],
    dependentSupplierIds: ['sup-aws-sg', 'sup-stripe-sg']
  },
  {
    id: 'srv-core-banking',
    serviceCode: 'SVC-CORE-02',
    name: 'Core Ledger & Account Management API',
    description: 'Primary customer ledger and account management system operating under MAS regulatory supervision.',
    criticality: 'TIER_1_MISSION_CRITICAL',
    businessOwner: 'Sarah Chen (Chief Technology Officer)',
    technicalOwner: 'Marcus Brody (Principal Architect)',
    rtoMinutes: 30,
    rpoMinutes: 5,
    dependentAssetIds: ['ast-rds-aurora-prod', 'ast-redis-cache-prod'],
    dependentSupplierIds: ['sup-aws-sg']
  },
  {
    id: 'srv-identity-federation',
    serviceCode: 'SVC-IAM-03',
    name: 'Enterprise SSO & IAM Zero Trust Gateway',
    description: 'Centralized identity provider for all workforce access, customer authentication, and privileged zero-trust tunnels.',
    criticality: 'TIER_1_MISSION_CRITICAL',
    businessOwner: 'David Lim (Head of Information Security)',
    technicalOwner: 'Elena Rostova (Lead IAM Engineer)',
    rtoMinutes: 15,
    rpoMinutes: 0,
    dependentAssetIds: ['ast-okta-tenant', 'ast-teleport-cluster'],
    dependentSupplierIds: ['sup-okta-sg']
  },
  {
    id: 'srv-customer-portal',
    serviceCode: 'SVC-WEB-04',
    name: 'Customer Digital Banking & Wealth Portal',
    description: 'Web and mobile customer-facing portal handling user authentication, balances, and self-service onboarding.',
    criticality: 'TIER_2_BUSINESS_CRITICAL',
    businessOwner: 'Priya Sharma (Head of Digital Experience)',
    technicalOwner: 'Kenji Sato (Staff Frontend Lead)',
    rtoMinutes: 60,
    rpoMinutes: 15,
    dependentAssetIds: ['ast-s3-frontend-cdn', 'ast-cloudfront-prod'],
    dependentSupplierIds: ['sup-aws-sg', 'sup-datadog-us']
  },
  {
    id: 'srv-ai-copilot-engine',
    serviceCode: 'SVC-AI-05',
    name: 'Enterprise GenAI Regulatory & Risk Copilot',
    description: 'Retrieval-Augmented Generation (RAG) intelligence engine running LLM inference over enterprise compliance documents.',
    criticality: 'TIER_2_BUSINESS_CRITICAL',
    businessOwner: 'Sarah Chen (Chief Technology Officer)',
    technicalOwner: 'Dr. Aris Thorne (Head of AI Governance)',
    rtoMinutes: 120,
    rpoMinutes: 60,
    dependentAssetIds: ['ast-bedrock-models', 'ast-opensearch-vector-db'],
    dependentSupplierIds: ['sup-aws-sg', 'sup-anthropic-us']
  }
];

// ============================================================================
// 2. THREAT SCENARIOS CATALOG
// ============================================================================

export const MASTER_THREAT_SCENARIOS: ThreatScenarioEntity[] = [
  {
    id: 'THR-RANSOMWARE',
    threatCode: 'THREAT-01',
    title: 'Multi-Stage Ransomware & Infrastructure Extortion',
    threatActor: 'CYBERCRIMINAL_SYNDICATE',
    attackVector: 'Phishing email $\\rightarrow$ Endpoint compromise $\\rightarrow$ Lateral movement $\\rightarrow$ S3 snapshot encryption $\\rightarrow$ Double extortion.',
    typicalTargetAssets: ['ast-aws-prod-eks', 'ast-rds-aurora-prod', 'ast-s3-frontend-cdn'],
    associatedMitigatingControls: ['SKD-CTRL-BCP-01', 'SKD-CTRL-BCP-02', 'SKD-CTRL-LOG-01', 'SKD-CTRL-IAM-01']
  },
  {
    id: 'THR-CRED-STUFFING',
    threatCode: 'THREAT-02',
    title: 'Distributed Credential Stuffing & Account Takeover (ATO)',
    threatActor: 'CYBERCRIMINAL_SYNDICATE',
    attackVector: 'Botnet replay of leaked credentials against public authentication endpoints without adaptive MFA.',
    typicalTargetAssets: ['ast-okta-tenant', 'ast-cloudfront-prod'],
    associatedMitigatingControls: ['SKD-CTRL-IAM-01', 'SKD-CTRL-LOG-01', 'SKD-CTRL-NET-01']
  },
  {
    id: 'THR-SUPPLY-CHAIN',
    threatCode: 'THREAT-03',
    title: 'Upstream Dependency Compromise & Malicious Open-Source Package',
    threatActor: 'NATION_STATE',
    attackVector: 'Compromised npm/PyPI package containing covert payload executed inside CI/CD deployment runner.',
    typicalTargetAssets: ['ast-aws-prod-eks', 'ast-github-org'],
    associatedMitigatingControls: ['SKD-CTRL-VULN-01', 'SKD-CTRL-DEV-01', 'SKD-CTRL-TPRM-01']
  },
  {
    id: 'THR-PROMPT-INJECTION',
    threatCode: 'THREAT-04',
    title: 'Indirect Prompt Injection & Systemic LLM Data Exfiltration',
    threatActor: 'INSIDER_THREAT',
    attackVector: 'Malicious input embedded in ingested documents causing LLM to bypass system guardrails and reveal confidential PII.',
    typicalTargetAssets: ['ast-bedrock-models', 'ast-opensearch-vector-db'],
    associatedMitigatingControls: ['SKD-CTRL-AI-01', 'SKD-CTRL-AI-02', 'SKD-CTRL-DLP-01']
  },
  {
    id: 'THR-INSIDER-EXFIL',
    threatCode: 'THREAT-05',
    title: 'Privileged Insider Direct Database Exfiltration',
    threatActor: 'INSIDER_THREAT',
    attackVector: 'Disgruntled database administrator dumping production PII/ePHI without audit log detection.',
    typicalTargetAssets: ['ast-rds-aurora-prod', 'ast-teleport-cluster'],
    associatedMitigatingControls: ['SKD-CTRL-IAM-02', 'SKD-CTRL-LOG-01', 'SKD-CTRL-DLP-01']
  }
];

// ============================================================================
// PHASE 34: AUTHORITATIVE RISK METHODOLOGY REGISTRY
// ============================================================================

export const MASTER_RISK_METHODOLOGIES: RiskMethodologyDefinition[] = [
  {
    id: 'METH-5X5-STD',
    name: 'Standard Enterprise 5x5 Matrix (ISO 31000 / NIST SP 800-30)',
    version: '2026.1-Enterprise',
    matrixDimension: '5X5',
    isDefault: true,
    likelihoodDefinitions: [
      { level: 1, label: 'Rare', description: 'Highly unlikely to occur in multi-year horizon', criteria: '< 1 incident per 5 years' },
      { level: 2, label: 'Unlikely', description: 'Possible but infrequent in operational scope', criteria: '1 incident per 2-5 years' },
      { level: 3, label: 'Possible', description: 'Reasonably expected to occur within fiscal year', criteria: '1-2 incidents per year' },
      { level: 4, label: 'Likely', description: 'High probability of occurrence in regular operations', criteria: '3-10 incidents per year' },
      { level: 5, label: 'Almost Certain', description: 'Continuous exposure or imminent occurrence', criteria: '> 10 incidents per year' }
    ],
    impactDefinitions: [
      { level: 1, label: 'Insignificant', description: 'Negligible financial or operational impact', criteria: 'Local triage, zero downtime', financialThresholdUSD: 10000 },
      { level: 2, label: 'Minor', description: 'Short-term localized disruption, minimal loss', criteria: 'Downtime < 1 hour, SLA nominal', financialThresholdUSD: 50000 },
      { level: 3, label: 'Moderate', description: 'Material service degradation or regulatory reportable', criteria: 'Downtime 1-4 hours, regulatory disclosure', financialThresholdUSD: 250000 },
      { level: 4, label: 'Major', description: 'Severe operational outage or significant regulatory fine', criteria: 'Core service failure, MAS Notice 655 penalty', financialThresholdUSD: 1000000 },
      { level: 5, label: 'Catastrophic', description: 'Systemic banking outage, board-level liability, license threat', criteria: 'Payment system failure, critical data breach', financialThresholdUSD: 5000000 }
    ],
    severityBands: [
      { minScore: 1, maxScore: 4, band: 'LOW', color: '#10B981', actionSlaHours: 720, requiresBoardEscalation: false },
      { minScore: 5, maxScore: 9, band: 'MEDIUM', color: '#F59E0B', actionSlaHours: 360, requiresBoardEscalation: false },
      { minScore: 10, maxScore: 15, band: 'HIGH', color: '#F97316', actionSlaHours: 72, requiresBoardEscalation: true },
      { minScore: 16, maxScore: 25, band: 'CRITICAL', color: '#EF4444', actionSlaHours: 24, requiresBoardEscalation: true }
    ],
    inherentCalculationRule: 'LIKELIHOOD * IMPACT',
    residualCalculationRule: 'RESIDUAL_LIKELIHOOD * RESIDUAL_IMPACT',
    controlEffectivenessWeights: {
      designWeight: 1.0,
      operatingWeight: 1.0,
      freshnessWeight: 1.0
    },
    riskAppetiteInterpretation: 'Residual scores <= 9 are within tolerance; scores >= 10 require executive mitigation or formal CRO acceptance.',
    approvalAuthority: 'Chief Risk Officer / Board Risk Committee',
    effectiveDate: '2026-01-01T00:00:00Z',
    changeHistory: [
      { date: '2026-01-01', version: '2026.1-Enterprise', author: 'Enterprise GRC Lead', changes: 'Initial baseline methodology calibration' }
    ],
    validationStatus: 'PRODUCTION_VERIFIED'
  },
  {
    id: 'METH-4X4-FIN',
    name: 'Financial Regulated 4x4 Tiered Matrix (MAS TRM / Basel III)',
    version: '2026.1-Financial',
    matrixDimension: '4X4',
    isDefault: false,
    likelihoodDefinitions: [
      { level: 1, label: 'Low', description: 'Rare occurrence in supervisory scope', criteria: '< 1 per 3 years' },
      { level: 2, label: 'Medium', description: 'Occasional operational incident', criteria: 'Annual occurrence' },
      { level: 3, label: 'High', description: 'Frequent vulnerability exploitation', criteria: 'Quarterly occurrence' },
      { level: 4, label: 'Critical', description: 'Active continuous threat actor campaign', criteria: 'Monthly occurrence' }
    ],
    impactDefinitions: [
      { level: 1, label: 'Negligible', description: 'Loss < $50,000 USD, zero customer impact', criteria: 'No reporting needed', financialThresholdUSD: 50000 },
      { level: 2, label: 'Material', description: 'Loss $50,000 - $250,000 USD, minor SLA impact', criteria: 'Internal reporting', financialThresholdUSD: 250000 },
      { level: 3, label: 'Severe', description: 'Loss $250,000 - $1,000,000 USD, regulatory notification', criteria: 'MAS 1-hour notification', financialThresholdUSD: 1000000 },
      { level: 4, label: 'Extreme', description: 'Loss > $1,000,000 USD, systemic failure', criteria: 'Board & Ministerial escalation', financialThresholdUSD: 5000000 }
    ],
    severityBands: [
      { minScore: 1, maxScore: 3, band: 'LOW', color: '#10B981', actionSlaHours: 720, requiresBoardEscalation: false },
      { minScore: 4, maxScore: 7, band: 'MEDIUM', color: '#F59E0B', actionSlaHours: 168, requiresBoardEscalation: false },
      { minScore: 8, maxScore: 11, band: 'HIGH', color: '#F97316', actionSlaHours: 48, requiresBoardEscalation: true },
      { minScore: 12, maxScore: 16, band: 'CRITICAL', color: '#EF4444', actionSlaHours: 12, requiresBoardEscalation: true }
    ],
    inherentCalculationRule: 'LIKELIHOOD * IMPACT',
    residualCalculationRule: 'RESIDUAL_LIKELIHOOD * RESIDUAL_IMPACT',
    controlEffectivenessWeights: {
      designWeight: 1.0,
      operatingWeight: 1.2,
      freshnessWeight: 1.0
    },
    riskAppetiteInterpretation: 'Residual scores <= 6 are within appetite; scores >= 7 require capital reserve allocation.',
    approvalAuthority: 'Board Audit & Risk Committee',
    effectiveDate: '2026-02-01T00:00:00Z',
    changeHistory: [
      { date: '2026-02-01', version: '2026.1-Financial', author: 'Head of Regulatory Affairs', changes: 'Calibrated for MAS Notice 655 compliance' }
    ],
    validationStatus: 'PRODUCTION_VERIFIED'
  },
  {
    id: 'METH-3X3-AGILE',
    name: 'Agile Product & Sprint Risk Matrix 3x3',
    version: '2026.1-Agile',
    matrixDimension: '3X3',
    isDefault: false,
    likelihoodDefinitions: [
      { level: 1, label: 'Low', description: 'Unlikely in sprint cycle', criteria: '< 1 per release' },
      { level: 2, label: 'Medium', description: 'Possible during major release', criteria: '1 per quarter' },
      { level: 3, label: 'High', description: 'Expected in active deployment', criteria: 'Frequent in release' }
    ],
    impactDefinitions: [
      { level: 1, label: 'Low', description: 'Minor bug, non-blocking', criteria: 'No customer impact', financialThresholdUSD: 10000 },
      { level: 2, label: 'Medium', description: 'Feature degraded, workaround exists', criteria: 'Tier 2 service impacted', financialThresholdUSD: 50000 },
      { level: 3, label: 'High', description: 'Release blocker, deployment halted', criteria: 'Tier 1 service down', financialThresholdUSD: 200000 }
    ],
    severityBands: [
      { minScore: 1, maxScore: 2, band: 'LOW', color: '#10B981', actionSlaHours: 360, requiresBoardEscalation: false },
      { minScore: 3, maxScore: 5, band: 'MEDIUM', color: '#F59E0B', actionSlaHours: 72, requiresBoardEscalation: false },
      { minScore: 6, maxScore: 9, band: 'CRITICAL', color: '#EF4444', actionSlaHours: 24, requiresBoardEscalation: true }
    ],
    inherentCalculationRule: 'LIKELIHOOD * IMPACT',
    residualCalculationRule: 'RESIDUAL_LIKELIHOOD * RESIDUAL_IMPACT',
    controlEffectivenessWeights: {
      designWeight: 0.8,
      operatingWeight: 1.0,
      freshnessWeight: 1.0
    },
    riskAppetiteInterpretation: 'Scores <= 3 tolerated for development sprints; scores >= 4 require tech lead waiver.',
    approvalAuthority: 'VP Engineering',
    effectiveDate: '2026-03-01T00:00:00Z',
    changeHistory: [
      { date: '2026-03-01', version: '2026.1-Agile', author: 'DevSecOps Lead', changes: 'Sprint risk matrix integration' }
    ],
    validationStatus: 'PRODUCTION_VERIFIED'
  }
];

// ============================================================================
// 3. RISK APPETITE & TOLERANCE THRESHOLDS
// ============================================================================

export const MASTER_APPETITE_THRESHOLDS: RiskAppetiteThreshold[] = [
  {
    dimension: 'Cybersecurity & Critical Infrastructure',
    category: 'Cybersecurity',
    maxAcceptableScore: 9,
    maxFinancialLossUSD: 250000,
    maxServiceDowntimeHours: 0.5,
    escalationRole: 'CISO / CRO',
    requiresBoardApproval: true,
    appetiteStatement: 'Zero tolerance for uncontained remote code execution vulnerabilities or unencrypted production data storage.',
    toleranceScore: 12
  },
  {
    dimension: 'Privacy & Personal Data Protection',
    category: 'Privacy & Personal Data',
    maxAcceptableScore: 8,
    maxFinancialLossUSD: 500000,
    maxServiceDowntimeHours: 4,
    escalationRole: 'Data Protection Officer (DPO)',
    requiresBoardApproval: true,
    appetiteStatement: 'Strict enforcement of purpose limitation, explicit consent capture, and DPDP / GDPR rights management.',
    toleranceScore: 10
  },
  {
    dimension: 'Financial & Operational Resilience',
    category: 'Financial and Commercial',
    maxAcceptableScore: 10,
    maxFinancialLossUSD: 1000000,
    maxServiceDowntimeHours: 1.0,
    escalationRole: 'Chief Risk Officer (CRO)',
    requiresBoardApproval: true,
    appetiteStatement: 'Max single loss event <= $1,000,000 USD with core settlement recovery point objective of 0.',
    toleranceScore: 14
  },
  {
    dimension: 'Third-Party & Supply Chain',
    category: 'Third-Party & Supply Chain',
    maxAcceptableScore: 9,
    maxFinancialLossUSD: 350000,
    maxServiceDowntimeHours: 2.0,
    escalationRole: 'Vendor Risk Committee',
    requiresBoardApproval: false,
    appetiteStatement: 'All tier-1 critical vendors must provide annual SOC 2 Type II and ISO 27001 certifications.',
    toleranceScore: 12
  },
  {
    dimension: 'AI Governance & Algorithmic Trust',
    category: 'Artificial Intelligence',
    maxAcceptableScore: 8,
    maxFinancialLossUSD: 200000,
    maxServiceDowntimeHours: 8,
    escalationRole: 'AI Ethics & Governance Board',
    requiresBoardApproval: true,
    appetiteStatement: 'Mandatory human-in-the-loop review for all automated regulatory decisions and safety red-teaming.',
    toleranceScore: 10
  }
];

// ============================================================================
// 4. MASTER ENTERPRISE RISK RECORDS (CANONICAL CATALOG)
// ============================================================================

export const MASTER_ENTERPRISE_RISKS: EnterpriseRiskRecord[] = [
  {
    id: 'RSK-CYBER-001',
    tenantId: '11111111-1111-4111-8111-111111111111',
    riskCode: 'RSK-CYBER-001',
    title: 'Multi-Region Cloud Infrastructure Ransomware & Core Banking Outage',
    description: 'Adversary compromises cloud administrative credentials, encrypts production container volumes and object storage, causing widespread service failure.',
    category: 'Cybersecurity',
    subcategory: 'Infrastructure Resilience',
    riskScenario: 'Nation-state or cybercriminal group deploys ransomware through compromised CI/CD secrets into AWS production clusters.',
    riskStatement: 'If administrative cloud credentials are leaked, cybercriminals could encrypt production databases, leading to catastrophic banking outage and severe regulatory penalties.',
    businessContext: 'Payment and Core Banking platforms under MAS and DORA continuous operational resilience mandates.',
    riskOwner: 'David Lim (Head of Information Security)',
    riskOwnerEmail: 'david.lim@skanda-finance.com',
    accountableExecutive: 'Sarah Chen (Chief Technology Officer)',
    businessUnit: 'Cloud Platform & Engineering',
    businessServiceIds: ['srv-payment-gateway', 'srv-core-banking'],
    assetIds: ['ast-aws-prod-eks', 'ast-rds-aurora-prod', 'ast-kms-primary'],
    supplierIds: ['sup-aws-sg'],
    threatIds: ['THR-RANSOMWARE'],
    vulnerabilityIds: ['VULN-IAM-OVERPERM', 'VULN-UNENCRYPTED-SNAPSHOT'],
    requirementIds: ['REQ-ISO-A.5.15', 'REQ-MAS-655-4.1', 'REQ-DORA-ART-9', 'REQ-NIST-PR.AA-01'],
    controlIds: ['SKD-CTRL-BCP-01', 'SKD-CTRL-BCP-02', 'SKD-CTRL-LOG-01', 'SKD-CTRL-IAM-01'],
    evidenceIds: ['EV-AWS-IAM-01', 'EV-DR-TEST-01', 'EV-CLOUDTRAIL-01'],
    findingIds: ['FIND-2026-081'],
    capaIds: ['CAPA-2026-042'],
    exceptionIds: [],
    riskMethodology: 'QUALITATIVE_5X5',
    methodologyVersion: '2026.1-Enterprise',
    inherentLikelihood: 4,
    inherentImpact: 5,
    inherentRiskScore: 20,
    inherentLevel: 'CRITICAL',
    currentControlEffectivenessPercent: 78,
    controlDesignRating: 'EFFECTIVE',
    controlOperatingRating: 'OPERATING_EFFECTIVELY',
    residualLikelihood: 2,
    residualImpact: 4,
    residualRiskScore: 8,
    residualLevel: 'HIGH',
    targetRiskScore: 6,
    riskAppetiteScore: 9,
    isOutsideAppetite: false,
    riskVelocity: 'DECREASING',
    riskTrend: 'DECREASING',
    confidenceLevelPercent: 92,
    dataCompletenessPercent: 95,
    treatmentStrategy: 'MITIGATE',
    treatmentPlanDescription: 'Deploy immutable AWS S3 Object Lock for all backup snapshots, enforce hardware YubiKey MFA for AWS root/IAM admins, and run quarterly automated DR failover simulations.',
    treatmentPlanBudgetUSD: 140000,
    treatmentTargetDate: '2026-11-30',
    treatmentStatus: 'IN_PROGRESS',
    status: 'TREATMENT_IN_PROGRESS',
    assuranceStatus: 'ASSURED',
    executiveAcceptance: {
      required: false,
      status: 'NOT_REQUIRED',
      justification: 'Residual score 8 is within approved Board appetite limit of 9.',
      compensatingControls: ['Daily air-gapped backups', 'Teleport Just-In-Time access approval'],
      reviewFrequencyMonths: 6
    },
    quantitativeAnalysis: {
      isConfigured: true,
      threatEventFrequencyPerYear: 0.15,
      vulnerabilitySusceptibilityPercent: 12,
      annualLossExpectancyUSD: 450000,
      singleLossExpectancyUSD: 3000000,
      lossMagnitude: {
        currency: 'USD',
        minLossUSD: 850000,
        modeLossUSD: 2400000,
        maxLossUSD: 7500000,
        primaryLossUSD: 1200000,
        secondaryLossUSD: 1800000,
        confidenceIntervalPercent: 90
      },
      monteCarloIterations: 10000,
      estimatedReturnOnSecurityInvestmentUSD: 1850000,
      assumptions: ['Cloud provider multi-region DR remains operational', 'Ransom is strictly not paid pursuant to corporate policy'],
      dataQualityTier: 'OBSERVED_DATA'
    },
    lastAssessmentAt: '2026-10-01T08:00:00Z',
    lastAssessedBy: 'David Lim (Head of InfoSec)',
    nextReviewAt: '2027-04-01T08:00:00Z',
    createdAt: '2026-01-15T09:30:00Z',
    updatedAt: '2026-10-08T14:20:00Z',
    version: 4
  },
  {
    id: 'RSK-IAM-002',
    tenantId: '11111111-1111-4111-8111-111111111111',
    riskCode: 'RSK-IAM-002',
    title: 'Privileged Credential Stuffing & Admin Console Hijacking',
    description: 'Targeted spear-phishing or credential stuffing against enterprise identity provider administrators leading to full tenant takeover.',
    category: 'Identity & Access Management',
    subcategory: 'Authentication & Authorization',
    riskScenario: 'Adversary gains access to an enterprise administrator account lacking FIDO2 hardware token enforcement.',
    riskStatement: 'If administrator identities are compromised, attackers can bypass perimeter controls, creating severe confidentiality and regulatory breach.',
    businessContext: 'All corporate and production administrative systems.',
    riskOwner: 'Elena Rostova (Lead IAM Engineer)',
    riskOwnerEmail: 'elena.rostova@skanda-finance.com',
    accountableExecutive: 'Sarah Chen (Chief Technology Officer)',
    businessUnit: 'Enterprise Security Operations',
    businessServiceIds: ['srv-identity-federation', 'srv-core-banking'],
    assetIds: ['ast-okta-tenant', 'ast-teleport-cluster'],
    supplierIds: ['sup-okta-sg'],
    threatIds: ['THR-CRED-STUFFING'],
    vulnerabilityIds: ['VULN-WEAK-MFA-SMS'],
    requirementIds: ['REQ-ISO-A.5.15', 'REQ-ISO-A.8.5', 'REQ-MAS-655-4.1', 'REQ-PCI-REQ-8'],
    controlIds: ['SKD-CTRL-IAM-01', 'SKD-CTRL-IAM-02'],
    evidenceIds: ['EV-OKTA-FIDO2-01', 'EV-TELEPORT-AUDIT-01'],
    findingIds: [],
    capaIds: [],
    exceptionIds: [],
    riskMethodology: 'QUALITATIVE_5X5',
    methodologyVersion: '2026.1-Enterprise',
    inherentLikelihood: 4,
    inherentImpact: 4,
    inherentRiskScore: 16,
    inherentLevel: 'CRITICAL',
    currentControlEffectivenessPercent: 94,
    controlDesignRating: 'EFFECTIVE',
    controlOperatingRating: 'OPERATING_EFFECTIVELY',
    residualLikelihood: 1,
    residualImpact: 4,
    residualRiskScore: 4,
    residualLevel: 'LOW',
    targetRiskScore: 4,
    riskAppetiteScore: 8,
    isOutsideAppetite: false,
    riskVelocity: 'STABLE',
    riskTrend: 'STABLE',
    confidenceLevelPercent: 98,
    dataCompletenessPercent: 100,
    treatmentStrategy: 'MITIGATE',
    treatmentPlanDescription: 'Mandatory WebAuthn / FIDO2 Passkey hardware tokens for 100% of employees with zero SMS/voice fallback allowed.',
    treatmentPlanBudgetUSD: 45000,
    treatmentTargetDate: '2026-08-15',
    treatmentStatus: 'COMPLETED',
    status: 'RESIDUAL_MONITORED',
    assuranceStatus: 'ASSURED',
    executiveAcceptance: {
      required: false,
      status: 'NOT_REQUIRED',
      justification: 'Residual score 4 is well below appetite limit of 8.',
      compensatingControls: [],
      reviewFrequencyMonths: 12
    },
    quantitativeAnalysis: {
      isConfigured: true,
      threatEventFrequencyPerYear: 0.05,
      vulnerabilitySusceptibilityPercent: 2,
      annualLossExpectancyUSD: 35000,
      singleLossExpectancyUSD: 700000,
      lossMagnitude: {
        currency: 'USD',
        minLossUSD: 200000,
        modeLossUSD: 650000,
        maxLossUSD: 1800000,
        primaryLossUSD: 250000,
        secondaryLossUSD: 450000,
        confidenceIntervalPercent: 95
      },
      monteCarloIterations: 10000,
      estimatedReturnOnSecurityInvestmentUSD: 520000,
      assumptions: ['FIDO2 cryptographic binding is immune to reverse-proxy phishing (AitM)'],
      dataQualityTier: 'OBSERVED_DATA'
    },
    lastAssessmentAt: '2026-09-15T10:00:00Z',
    lastAssessedBy: 'David Lim (Head of InfoSec)',
    nextReviewAt: '2027-09-15T10:00:00Z',
    createdAt: '2026-01-20T11:00:00Z',
    updatedAt: '2026-09-15T10:00:00Z',
    version: 3
  },
  {
    id: 'RSK-PRIV-003',
    tenantId: '11111111-1111-4111-8111-111111111111',
    riskCode: 'RSK-PRIV-003',
    title: 'Cross-Border Personal Data Exfiltration & DPDP Act / EU GDPR Violation',
    description: 'Unauthorized transfer or storage of customer personal identifiers (PII/Digital Data) into non-whitelisted foreign jurisdiction.',
    category: 'Privacy & Personal Data',
    subcategory: 'Data Transfer & Residency',
    riskScenario: 'Third-party analytics subprocessor silently routes telemetry logs containing Indian citizen Aadhaar / phone records to US servers.',
    riskStatement: 'If analytics scripts route PII offshore without explicit consent and safeguards, SKANDA could face statutory DPDP penalties up to ₹250 Crores and GDPR Article 83 fines.',
    businessContext: 'Digital Banking and Analytics systems under India DPDP Act 2023 and EU GDPR jurisdiction.',
    riskOwner: 'Ananya Deshmukh (Data Protection Officer)',
    riskOwnerEmail: 'dpo@skanda-finance.com',
    accountableExecutive: 'Vikram Mehta (Head of Compliance & Legal)',
    businessUnit: 'Data Governance & Privacy',
    businessServiceIds: ['srv-customer-portal', 'srv-payment-gateway'],
    assetIds: ['ast-s3-frontend-cdn', 'ast-rds-aurora-prod'],
    supplierIds: ['sup-datadog-us'],
    threatIds: ['THR-INSIDER-EXFIL'],
    vulnerabilityIds: ['VULN-LOG-UNMASKED-PII'],
    requirementIds: ['REQ-DPDP-SEC8', 'REQ-DPDP-SEC9', 'REQ-GDPR-ART-44', 'REQ-ISO-27701-7.2'],
    controlIds: ['SKD-CTRL-DLP-01', 'SKD-CTRL-CRYPT-01', 'SKD-CTRL-TPRM-01'],
    evidenceIds: ['EV-DPDP-DPIA-01', 'EV-DLP-SCAN-01'],
    findingIds: ['FIND-2026-094'],
    capaIds: ['CAPA-2026-051'],
    exceptionIds: [],
    riskMethodology: 'QUALITATIVE_5X5',
    methodologyVersion: '2026.1-Enterprise',
    inherentLikelihood: 4,
    inherentImpact: 5,
    inherentRiskScore: 20,
    inherentLevel: 'CRITICAL',
    currentControlEffectivenessPercent: 62,
    controlDesignRating: 'PARTIALLY_EFFECTIVE',
    controlOperatingRating: 'SIGNIFICANT_DEFICIENCY',
    residualLikelihood: 3,
    residualImpact: 4,
    residualRiskScore: 12,
    residualLevel: 'HIGH',
    targetRiskScore: 6,
    riskAppetiteScore: 8,
    isOutsideAppetite: true, // EXCEEDS APPETITE!
    riskVelocity: 'INCREASING',
    riskTrend: 'INCREASING',
    confidenceLevelPercent: 84,
    dataCompletenessPercent: 88,
    treatmentStrategy: 'MITIGATE',
    treatmentPlanDescription: 'Implement automated client-side PII tokenization proxy in Singapore/Mumbai before log transmission and execute updated SCCs with US telemetry vendors.',
    treatmentPlanBudgetUSD: 95000,
    treatmentTargetDate: '2026-11-15',
    treatmentStatus: 'IN_PROGRESS',
    status: 'TREATMENT_IN_PROGRESS',
    assuranceStatus: 'AT_RISK',
    executiveAcceptance: {
      required: true,
      status: 'PENDING_REVIEW',
      justification: 'Temporary acceptance requested while client-side DLP masking proxy is deployed.',
      compensatingControls: ['Manual weekly audit of Datadog ingested logs', 'Data redaction filters in ingestion pipeline'],
      reviewFrequencyMonths: 1,
      expiryDate: '2026-11-30',
      isExpired: false
    },
    quantitativeAnalysis: {
      isConfigured: true,
      threatEventFrequencyPerYear: 0.3,
      vulnerabilitySusceptibilityPercent: 35,
      annualLossExpectancyUSD: 820000,
      singleLossExpectancyUSD: 2700000,
      lossMagnitude: {
        currency: 'USD',
        minLossUSD: 500000,
        modeLossUSD: 2100000,
        maxLossUSD: 8000000,
        primaryLossUSD: 400000,
        secondaryLossUSD: 1700000,
        confidenceIntervalPercent: 90
      },
      monteCarloIterations: 10000,
      estimatedReturnOnSecurityInvestmentUSD: 1600000,
      assumptions: ['DPDP Board penalty enforcement active in 2026', 'Data protection authority conducts targeted subprocessor audit'],
      dataQualityTier: 'EXPERT_ESTIMATE'
    },
    lastAssessmentAt: '2026-10-05T14:00:00Z',
    lastAssessedBy: 'Ananya Deshmukh (DPO)',
    nextReviewAt: '2026-11-05T14:00:00Z',
    createdAt: '2026-03-10T15:00:00Z',
    updatedAt: '2026-10-05T14:00:00Z',
    version: 5
  },
  {
    id: 'RSK-TPRM-004',
    tenantId: '11111111-1111-4111-8111-111111111111',
    riskCode: 'RSK-TPRM-004',
    title: 'Critical Cloud Vendor Subprocessor Outage & Concentration Risk',
    description: 'Over-reliance on single cloud hosting zone and single identity provider creating single point of failure without multi-cloud fallback.',
    category: 'Third-Party & Supply Chain',
    subcategory: 'Concentration Risk',
    riskScenario: 'Primary AWS ap-southeast-1 region suffers major power grid failure impacting both active EKS cluster and RDS master.',
    riskStatement: 'If cloud region experiences extended outage, core customer settlement services will breach RTO SLA of 15 minutes, violating MAS Notice 644 statutory requirements.',
    businessContext: 'Payment settlement infrastructure.',
    riskOwner: 'Marcus Brody (Principal Architect)',
    riskOwnerEmail: 'marcus.brody@skanda-finance.com',
    accountableExecutive: 'Sarah Chen (Chief Technology Officer)',
    businessUnit: 'Infrastructure & SRE',
    businessServiceIds: ['srv-payment-gateway', 'srv-core-banking'],
    assetIds: ['ast-aws-prod-eks', 'ast-rds-aurora-prod'],
    supplierIds: ['sup-aws-sg'],
    threatIds: ['THR-SUPPLY-CHAIN'],
    vulnerabilityIds: ['VULN-SINGLE-REGION-DR'],
    requirementIds: ['REQ-MAS-644-2.1', 'REQ-DORA-ART-11', 'REQ-ISO-22301-8.4'],
    controlIds: ['SKD-CTRL-BCP-01', 'SKD-CTRL-TPRM-01'],
    evidenceIds: ['EV-DR-TEST-01'],
    findingIds: [],
    capaIds: [],
    exceptionIds: [],
    riskMethodology: 'QUALITATIVE_5X5',
    methodologyVersion: '2026.1-Enterprise',
    inherentLikelihood: 3,
    inherentImpact: 5,
    inherentRiskScore: 15,
    inherentLevel: 'HIGH',
    currentControlEffectivenessPercent: 70,
    controlDesignRating: 'EFFECTIVE',
    controlOperatingRating: 'OPERATING_EFFECTIVELY',
    residualLikelihood: 2,
    residualImpact: 3,
    residualRiskScore: 6,
    residualLevel: 'MEDIUM',
    targetRiskScore: 4,
    riskAppetiteScore: 9,
    isOutsideAppetite: false,
    riskVelocity: 'STABLE',
    riskTrend: 'STABLE',
    confidenceLevelPercent: 88,
    dataCompletenessPercent: 90,
    treatmentStrategy: 'MITIGATE',
    treatmentPlanDescription: 'Provision warm-standby AWS ap-southeast-2 (Sydney) replica with automated Route 53 health-check DNS failover within 10 minutes.',
    treatmentPlanBudgetUSD: 110000,
    treatmentTargetDate: '2026-12-15',
    treatmentStatus: 'IN_PROGRESS',
    status: 'TREATMENT_IN_PROGRESS',
    assuranceStatus: 'ASSURED',
    executiveAcceptance: {
      required: false,
      status: 'NOT_REQUIRED',
      justification: 'Residual score 6 is within appetite limit 9.',
      compensatingControls: ['Hourly cross-region DB replication'],
      reviewFrequencyMonths: 6
    },
    quantitativeAnalysis: {
      isConfigured: true,
      threatEventFrequencyPerYear: 0.1,
      vulnerabilitySusceptibilityPercent: 20,
      annualLossExpectancyUSD: 180000,
      singleLossExpectancyUSD: 1800000,
      lossMagnitude: {
        currency: 'USD',
        minLossUSD: 400000,
        modeLossUSD: 1500000,
        maxLossUSD: 4500000,
        primaryLossUSD: 900000,
        secondaryLossUSD: 600000,
        confidenceIntervalPercent: 90
      },
      monteCarloIterations: 10000,
      estimatedReturnOnSecurityInvestmentUSD: 750000,
      assumptions: ['AWS Global backbone operational during regional disaster'],
      dataQualityTier: 'OBSERVED_DATA'
    },
    lastAssessmentAt: '2026-09-20T11:00:00Z',
    lastAssessedBy: 'Marcus Brody (Principal Architect)',
    nextReviewAt: '2027-03-20T11:00:00Z',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-09-20T11:00:00Z',
    version: 3
  },
  {
    id: 'RSK-AI-005',
    tenantId: '11111111-1111-4111-8111-111111111111',
    riskCode: 'RSK-AI-005',
    title: 'High-Risk GenAI Model Prompt Injection & PII Leakage',
    description: 'Direct or indirect prompt injection against enterprise LLM copilot resulting in systemic data exfiltration or hallucinated regulatory advice.',
    category: 'Artificial Intelligence',
    subcategory: 'Model Security & Alignment',
    riskScenario: 'Attacker injects hidden payload into customer compliance submission causing RAG engine to return internal confidential API keys.',
    riskStatement: 'If GenAI system lacks robust input sanitization and output guardrails, sensitive customer data may be leaked, triggering EU AI Act Article 50 and ISO 42001 violations.',
    businessContext: 'Enterprise Regulatory Copilot and Chatbots.',
    riskOwner: 'Dr. Aris Thorne (Head of AI Governance)',
    riskOwnerEmail: 'aris.thorne@skanda-finance.com',
    accountableExecutive: 'Sarah Chen (Chief Technology Officer)',
    businessUnit: 'Applied AI & Innovation',
    businessServiceIds: ['srv-ai-copilot-engine'],
    assetIds: ['ast-bedrock-models', 'ast-opensearch-vector-db'],
    supplierIds: ['sup-anthropic-us', 'sup-aws-sg'],
    threatIds: ['THR-PROMPT-INJECTION'],
    vulnerabilityIds: ['VULN-UNGUARDED-RAG-CONTEXT'],
    requirementIds: ['REQ-ISO-42001-A.5', 'REQ-EU-AI-ART-50', 'REQ-NIST-AI-RMF-GOV'],
    controlIds: ['SKD-CTRL-AI-01', 'SKD-CTRL-AI-02'],
    evidenceIds: ['EV-FEAT-BIAS-01', 'EV-PROMPT-TEST-01'],
    findingIds: [],
    capaIds: [],
    exceptionIds: [],
    riskMethodology: 'QUALITATIVE_5X5',
    methodologyVersion: '2026.1-Enterprise',
    inherentLikelihood: 4,
    inherentImpact: 4,
    inherentRiskScore: 16,
    inherentLevel: 'CRITICAL',
    currentControlEffectivenessPercent: 85,
    controlDesignRating: 'EFFECTIVE',
    controlOperatingRating: 'OPERATING_EFFECTIVELY',
    residualLikelihood: 2,
    residualImpact: 3,
    residualRiskScore: 6,
    residualLevel: 'MEDIUM',
    targetRiskScore: 4,
    riskAppetiteScore: 8,
    isOutsideAppetite: false,
    riskVelocity: 'STABLE',
    riskTrend: 'STABLE',
    confidenceLevelPercent: 90,
    dataCompletenessPercent: 92,
    treatmentStrategy: 'MITIGATE',
    treatmentPlanDescription: 'Deploy dual-layer input guardrails using NeMo Guardrails and real-time output PII scanning via automated DLP regex before response delivery.',
    treatmentPlanBudgetUSD: 50000,
    treatmentTargetDate: '2026-09-30',
    treatmentStatus: 'COMPLETED',
    status: 'RESIDUAL_MONITORED',
    assuranceStatus: 'ASSURED',
    executiveAcceptance: {
      required: false,
      status: 'NOT_REQUIRED',
      justification: 'Residual score 6 is within appetite limit 8.',
      compensatingControls: ['Human-in-the-loop validation for all material regulatory filings'],
      reviewFrequencyMonths: 6
    },
    quantitativeAnalysis: {
      isConfigured: true,
      threatEventFrequencyPerYear: 0.2,
      vulnerabilitySusceptibilityPercent: 10,
      annualLossExpectancyUSD: 60000,
      singleLossExpectancyUSD: 600000,
      lossMagnitude: {
        currency: 'USD',
        minLossUSD: 100000,
        modeLossUSD: 500000,
        maxLossUSD: 1500000,
        primaryLossUSD: 150000,
        secondaryLossUSD: 350000,
        confidenceIntervalPercent: 90
      },
      monteCarloIterations: 10000,
      estimatedReturnOnSecurityInvestmentUSD: 320000,
      assumptions: ['Guardrail latency under 15ms per token stream'],
      dataQualityTier: 'OBSERVED_DATA'
    },
    lastAssessmentAt: '2026-10-02T16:00:00Z',
    lastAssessedBy: 'Dr. Aris Thorne (Head of AI Governance)',
    nextReviewAt: '2027-04-02T16:00:00Z',
    createdAt: '2026-04-01T12:00:00Z',
    updatedAt: '2026-10-02T16:00:00Z',
    version: 2
  },
  {
    id: 'RSK-REG-006',
    tenantId: '11111111-1111-4111-8111-111111111111',
    riskCode: 'RSK-REG-006',
    title: 'Regulatory Non-Compliance with Mandatory MAS Notice 655 & Notice 644',
    description: 'Failure to enforce mandatory baseline cyber hygiene controls (administrative MFA, vulnerability patching SLA, network segmentation) under Singapore statutory notices.',
    category: 'Regulatory Compliance',
    subcategory: 'Financial Regulation',
    riskScenario: 'MAS regulatory inspection detects unsegmented administrative network access to payment systems or delayed critical patch deployment.',
    riskStatement: 'If statutory notices are breached, MAS may issue formal supervisory letters, impose civil monetary penalties, or restrict banking business expansion.',
    businessContext: 'All regulated financial services activities in Singapore.',
    riskOwner: 'Vikram Mehta (Head of Compliance & Legal)',
    riskOwnerEmail: 'vikram.mehta@skanda-finance.com',
    accountableExecutive: 'Sarah Chen (Chief Technology Officer)',
    businessUnit: 'Legal & Regulatory Affairs',
    businessServiceIds: ['srv-payment-gateway', 'srv-core-banking', 'srv-identity-federation'],
    assetIds: ['ast-aws-prod-eks', 'ast-rds-aurora-prod', 'ast-okta-tenant'],
    supplierIds: ['sup-aws-sg', 'sup-okta-sg'],
    threatIds: ['THR-CRED-STUFFING'],
    vulnerabilityIds: [],
    requirementIds: ['REQ-MAS-655-4.1', 'REQ-MAS-655-4.2', 'REQ-MAS-644-2.1'],
    controlIds: ['SKD-CTRL-IAM-01', 'SKD-CTRL-VULN-01', 'SKD-CTRL-NET-01'],
    evidenceIds: ['EV-MAS-SOA-01', 'EV-OKTA-FIDO2-01'],
    findingIds: [],
    capaIds: [],
    exceptionIds: [],
    riskMethodology: 'QUALITATIVE_5X5',
    methodologyVersion: '2026.1-Enterprise',
    inherentLikelihood: 3,
    inherentImpact: 5,
    inherentRiskScore: 15,
    inherentLevel: 'HIGH',
    currentControlEffectivenessPercent: 96,
    controlDesignRating: 'EFFECTIVE',
    controlOperatingRating: 'OPERATING_EFFECTIVELY',
    residualLikelihood: 1,
    residualImpact: 3,
    residualRiskScore: 3,
    residualLevel: 'LOW',
    targetRiskScore: 3,
    riskAppetiteScore: 6,
    isOutsideAppetite: false,
    riskVelocity: 'STABLE',
    riskTrend: 'STABLE',
    confidenceLevelPercent: 99,
    dataCompletenessPercent: 100,
    treatmentStrategy: 'MITIGATE',
    treatmentPlanDescription: 'Continuous telemetry stream validating 100% compliance with Notice 655 cyber hygiene requirements and daily automated evidence collection.',
    treatmentPlanBudgetUSD: 30000,
    treatmentTargetDate: '2026-07-31',
    treatmentStatus: 'COMPLETED',
    status: 'RESIDUAL_MONITORED',
    assuranceStatus: 'ASSURED',
    executiveAcceptance: {
      required: false,
      status: 'NOT_REQUIRED',
      justification: 'Residual score 3 is well within appetite threshold of 6.',
      compensatingControls: [],
      reviewFrequencyMonths: 12
    },
    quantitativeAnalysis: {
      isConfigured: true,
      threatEventFrequencyPerYear: 0.02,
      vulnerabilitySusceptibilityPercent: 1,
      annualLossExpectancyUSD: 15000,
      singleLossExpectancyUSD: 750000,
      lossMagnitude: {
        currency: 'USD',
        minLossUSD: 100000,
        modeLossUSD: 600000,
        maxLossUSD: 1500000,
        primaryLossUSD: 100000,
        secondaryLossUSD: 500000,
        confidenceIntervalPercent: 95
      },
      monteCarloIterations: 10000,
      estimatedReturnOnSecurityInvestmentUSD: 450000,
      assumptions: ['Regulator conducts annual on-site supervisory review'],
      dataQualityTier: 'OBSERVED_DATA'
    },
    lastAssessmentAt: '2026-09-01T09:00:00Z',
    lastAssessedBy: 'Vikram Mehta (Head of Compliance)',
    nextReviewAt: '2027-09-01T09:00:00Z',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-09-01T09:00:00Z',
    version: 4
  }
];

// ============================================================================
// 5. HISTORICAL RISK ASSESSMENT SNAPSHOTS
// ============================================================================

export const MASTER_RISK_SNAPSHOTS: RiskAssessmentSnapshot[] = [
  {
    id: 'SNAP-RSK-001-V1',
    riskId: 'RSK-CYBER-001',
    tenantId: '11111111-1111-4111-8111-111111111111',
    snapshotTimestamp: '2026-01-15T09:30:00Z',
    assessmentReason: 'SCHEDULED_REVIEW',
    methodologyVersion: '2026.1-Enterprise',
    inherentLikelihood: 4,
    inherentImpact: 5,
    inherentRiskScore: 20,
    controlEffectivenessPercent: 40,
    residualLikelihood: 3,
    residualImpact: 5,
    residualRiskScore: 15,
    assessedBy: 'David Lim (Head of InfoSec)',
    rationale: 'Initial assessment identified lack of immutable backup locks and single-region replication.',
    inputsHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    id: 'SNAP-RSK-001-V2',
    riskId: 'RSK-CYBER-001',
    tenantId: '11111111-1111-4111-8111-111111111111',
    snapshotTimestamp: '2026-06-01T10:00:00Z',
    assessmentReason: 'EVENT_TRIGGERED',
    methodologyVersion: '2026.1-Enterprise',
    inherentLikelihood: 4,
    inherentImpact: 5,
    inherentRiskScore: 20,
    controlEffectivenessPercent: 65,
    residualLikelihood: 2,
    residualImpact: 5,
    residualRiskScore: 10,
    assessedBy: 'David Lim (Head of InfoSec)',
    rationale: 'Completed deployment of AWS Object Lock and multi-factor authentication for backup administrators.',
    inputsHash: 'c5d2e706a14788b0b467645161c56b77c8e9b6a1843b0c51cf9b7b919d8544e3'
  },
  {
    id: 'SNAP-RSK-001-V3',
    riskId: 'RSK-CYBER-001',
    tenantId: '11111111-1111-4111-8111-111111111111',
    snapshotTimestamp: '2026-10-01T08:00:00Z',
    assessmentReason: 'SCHEDULED_REVIEW',
    methodologyVersion: '2026.1-Enterprise',
    inherentLikelihood: 4,
    inherentImpact: 5,
    inherentRiskScore: 20,
    controlEffectivenessPercent: 78,
    residualLikelihood: 2,
    residualImpact: 4,
    residualRiskScore: 8,
    assessedBy: 'David Lim (Head of InfoSec)',
    rationale: 'Quarterly DR failover passed in 12 minutes; residual risk successfully reduced into approved appetite limit of 9.',
    inputsHash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
  }
];
