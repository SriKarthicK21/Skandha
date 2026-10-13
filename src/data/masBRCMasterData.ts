// Master Data for Board Risk Committee (BRC) Technology Risk Reporting Pack
// Compliant with MAS TRM Guidelines Section 3.1 & MAS Notice 644/655 Supervisory Standards

export interface BoardDomainScore {
  domainId: string;
  domainNumber: string;
  name: string;
  score: number; // 0 - 100
  status: 'GREEN' | 'AMBER' | 'RED';
  quarterlyChange: number; // e.g. +3.2%
  primaryDriver: string;
}

export interface CyberHygieneControlItem {
  id: string;
  name: string;
  statutoryMandate: string;
  compliancePercentage: number;
  status: 'COMPLIANT_GREEN' | 'DISPENSATION_REQUIRED_RED' | 'AT_RISK_AMBER';
  boardDispensationActive: boolean;
  dispensationDetails?: {
    approvedBy: string;
    approvalDate: string;
    expiryDate: string;
    compensatoryControl: string;
    daysRemaining: number;
  };
}

export interface CISDowntimeLedgerItem {
  systemId: string;
  name: string;
  criticality: 'CRITICAL_SYSTEM_TIER_1' | 'CRITICAL_SYSTEM_TIER_2';
  maxAllowedDowntimeMins: number; // 240 minutes under MAS Notice 644
  accumulatedOutageMins12Mo: number;
  safetyBufferRemainingMins: number;
  outagePercentageBurned: number;
  rtoTargetHours: number; // <= 4 hours
  rpoTargetHours: number; // <= 1 hour
  lastDrTestDate: string;
  lastDrTestResult: 'PASS_WITHIN_SLA' | 'DEFICIENT';
  status: 'SAFE_GREEN' | 'WARNING_AMBER' | 'BREACH_RED';
}

export interface BoardTopRiskItem {
  riskId: string;
  title: string;
  masDomain: string;
  inherentRating: 'VERY_HIGH' | 'HIGH' | 'MEDIUM';
  residualRating: 'HIGH' | 'MEDIUM' | 'LOW';
  appetiteStatus: 'WITHIN_APPETITE' | 'APPROACHING_TOLERANCE' | 'APPETITE_BREACH';
  kriMetric: string;
  kriValue: string;
  kriThreshold: string;
  actionPlanOwner: string;
  targetResolutionDate: string;
  executiveActionRequired: string;
}

export interface OverdueAuditFindingItem {
  findingId: string;
  source: 'MAS_THEMATIC_INSPECTION' | 'INTERNAL_IT_AUDIT' | 'AASE_RED_TEAM';
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  originalDueDate: string;
  daysOverdue: number;
  responsibleExecutive: string;
  delayReason: string;
  compensatingControl: string;
  boardEscalationStatus: 'ESCALATED_FOR_DISPENSATION' | 'ACTIVE_REMEDIATION';
}

export interface CloudConcentrationItem {
  vendorId: string;
  vendorName: string;
  role: string;
  cloudMateriality: 'MATERIAL_OUTSOURCING' | 'CRITICAL_FINANCIAL_UTILITY';
  concentrationSharePercent: number;
  dataSovereigntyStatus: 'COMPLIANT_SG_JURISDICTION' | 'CROSS_BORDER_ADDENDUM';
  rightToAuditStatus: 'VERIFIED_SOC2_TYPE2' | 'PENDING_ON_SITE_AUDIT';
  lastExitStrategyTestDate: string;
  primaryRisk: string;
}

export interface BRCReportingPackData {
  reportingQuarter: string;
  boardMeetingDate: string;
  boardRiskCommitteeChair: string;
  cisoSignatory: string;
  overallComplianceScore: number;
  overallTargetAppetite: number;
  domainScores: BoardDomainScore[];
  cyberHygieneControls: CyberHygieneControlItem[];
  cisDowntimeLedger: CISDowntimeLedgerItem[];
  top5Risks: BoardTopRiskItem[];
  overdueAuditFindings: OverdueAuditFindingItem[];
  cloudConcentration: CloudConcentrationItem[];
}

export const INITIAL_BRC_PACK_DATA: BRCReportingPackData = {
  reportingQuarter: 'Q3 2026',
  boardMeetingDate: '2026-09-28',
  boardRiskCommitteeChair: 'Tan Sri Dato Dr. Lim Boon Heng (Independent Director, BRC Chair)',
  cisoSignatory: 'Arjun Mehta (Chief Information Security Officer, CISSP, CISM)',
  overallComplianceScore: 92.4,
  overallTargetAppetite: 90.0,
  domainScores: [
    { domainId: 'MAS-DOM-03', domainNumber: '3.0', name: 'Governance & Oversight', score: 96.0, status: 'GREEN', quarterlyChange: +2.1, primaryDriver: 'Board approved updated Tech Risk Appetite Statement and BRC charter.' },
    { domainId: 'MAS-DOM-04', domainNumber: '4.0', name: 'Risk Framework & Appetite', score: 94.5, status: 'GREEN', quarterlyChange: +1.5, primaryDriver: 'Dynamic KRI dashboards linked to enterprise operational risk system.' },
    { domainId: 'MAS-DOM-05', domainNumber: '5.0', name: 'Project Mgmt & Security-by-Design', score: 91.0, status: 'GREEN', quarterlyChange: +4.0, primaryDriver: 'DevSecOps automated gates deployed for 100% of microservice repositories.' },
    { domainId: 'MAS-DOM-06', domainNumber: '6.0', name: 'Secure Development & APIs', score: 88.5, status: 'AMBER', quarterlyChange: -1.2, primaryDriver: 'API token expiry standard remediation ongoing across legacy payment gateway.' },
    { domainId: 'MAS-DOM-07', domainNumber: '7.0', name: 'IT Service Management & Patching', score: 93.0, status: 'GREEN', quarterlyChange: +3.0, primaryDriver: 'Critical OS patch cycle reduced to 11 days (MAS threshold <= 14 days).' },
    { domainId: 'MAS-DOM-08', domainNumber: '8.0', name: 'IT Resilience & RTO/RPO', score: 95.0, status: 'GREEN', quarterlyChange: +0.5, primaryDriver: 'Annual live production DR cutover successfully executed with 34-minute RTO.' },
    { domainId: 'MAS-DOM-09', domainNumber: '9.0', name: 'Access Control & PAM', score: 97.2, status: 'GREEN', quarterlyChange: +2.8, primaryDriver: 'Zero standing domain administrator privileges achieved across cloud environments.' },
    { domainId: 'MAS-DOM-10', domainNumber: '10.0', name: 'Cryptography & HSM', score: 90.0, status: 'GREEN', quarterlyChange: +1.0, primaryDriver: 'FIPS 140-2 Level 3 HSM key rotation ceremony completed on schedule.' },
    { domainId: 'MAS-DOM-11', domainNumber: '11.0', name: 'Data & Infrastructure Security', score: 91.8, status: 'GREEN', quarterlyChange: +2.2, primaryDriver: 'EDR coverage extended to 100% of virtual machines and developer laptops.' },
    { domainId: 'MAS-DOM-12', domainNumber: '12.0', name: 'Cyber Defense & 24/7 SOC', score: 94.0, status: 'GREEN', quarterlyChange: +1.8, primaryDriver: 'FS-ISAC automated ingestion rules live in SIEM.' },
    { domainId: 'MAS-DOM-13', domainNumber: '13.0', name: 'Vulnerability & Red Teaming (AASE)', score: 89.0, status: 'AMBER', quarterlyChange: +5.0, primaryDriver: 'CREST-accredited red team exercise completed; 2 high findings under remediation.' },
    { domainId: 'MAS-DOM-14', domainNumber: '14.0', name: 'Online Financial Services & MFA', score: 96.5, status: 'GREEN', quarterlyChange: +1.2, primaryDriver: 'FIDO2 biometric soft-token device binding enforced for all retail customers.' },
    { domainId: 'MAS-DOM-15', domainNumber: '15.0', name: 'Independent IT Audit', score: 95.5, status: 'GREEN', quarterlyChange: +0.0, primaryDriver: 'Annual internal IT audit completed with zero repeat critical findings.' }
  ],
  cyberHygieneControls: [
    {
      id: 'CH-01',
      name: 'Administrative Accounts Phishing-Resistant MFA',
      statutoryMandate: 'MAS Notice 655 Para 3(1)(a) - Mandatory 100% MFA for privileged accounts',
      compliancePercentage: 100,
      status: 'COMPLIANT_GREEN',
      boardDispensationActive: false
    },
    {
      id: 'CH-02',
      name: 'Perimeter Network Security Controls & Isolation',
      statutoryMandate: 'MAS Notice 655 Para 3(1)(b) - Restrict external connections & isolate critical subnets',
      compliancePercentage: 100,
      status: 'COMPLIANT_GREEN',
      boardDispensationActive: false
    },
    {
      id: 'CH-03',
      name: 'Critical Security Patch Installation within Mandated SLAs',
      statutoryMandate: 'MAS Notice 655 Para 3(1)(c) - Patch critical vulnerabilities <= 14 calendar days',
      compliancePercentage: 99.2,
      status: 'AT_RISK_AMBER',
      boardDispensationActive: true,
      dispensationDetails: {
        approvedBy: 'BRC Chair (Minute BRC-2026-08.3)',
        approvalDate: '2026-08-20',
        expiryDate: '2026-10-15',
        compensatoryControl: 'WAF virtual patching rule and host-level IDS behavioral inspection in place for legacy core gateway node.',
        daysRemaining: 21
      }
    },
    {
      id: 'CH-04',
      name: 'Enterprise Anti-Malware & Endpoint Detection (EDR)',
      statutoryMandate: 'MAS Notice 655 Para 3(1)(d) - Anti-malware signatures updated continuously',
      compliancePercentage: 100,
      status: 'COMPLIANT_GREEN',
      boardDispensationActive: false
    },
    {
      id: 'CH-05',
      name: 'Baseline System Hardening Standards Enforced',
      statutoryMandate: 'MAS Notice 655 Para 3(1)(e) - CIS Benchmark hardening on all OS and hypervisors',
      compliancePercentage: 100,
      status: 'COMPLIANT_GREEN',
      boardDispensationActive: false
    },
    {
      id: 'CH-06',
      name: 'Restriction of Unauthorized Devices (Network Access Control)',
      statutoryMandate: 'MAS Notice 655 Para 3(1)(f) - Block non-compliant laptops/devices from corporate network',
      compliancePercentage: 100,
      status: 'COMPLIANT_GREEN',
      boardDispensationActive: false
    }
  ],
  cisDowntimeLedger: [
    {
      systemId: 'CIS-01',
      name: 'Core Banking Ledger & Transaction Processing Platform',
      criticality: 'CRITICAL_SYSTEM_TIER_1',
      maxAllowedDowntimeMins: 240,
      accumulatedOutageMins12Mo: 18,
      safetyBufferRemainingMins: 222,
      outagePercentageBurned: 7.5,
      rtoTargetHours: 4.0,
      rpoTargetHours: 1.0,
      lastDrTestDate: '2026-07-22',
      lastDrTestResult: 'PASS_WITHIN_SLA',
      status: 'SAFE_GREEN'
    },
    {
      systemId: 'CIS-02',
      name: 'FAST & PayNow Real-Time Settlement Ingress Gateway',
      criticality: 'CRITICAL_SYSTEM_TIER_1',
      maxAllowedDowntimeMins: 240,
      accumulatedOutageMins12Mo: 0,
      safetyBufferRemainingMins: 240,
      outagePercentageBurned: 0.0,
      rtoTargetHours: 2.0,
      rpoTargetHours: 0.0,
      lastDrTestDate: '2026-08-14',
      lastDrTestResult: 'PASS_WITHIN_SLA',
      status: 'SAFE_GREEN'
    },
    {
      systemId: 'CIS-03',
      name: 'Retail & Institutional Web/Mobile Banking Portal',
      criticality: 'CRITICAL_SYSTEM_TIER_1',
      maxAllowedDowntimeMins: 240,
      accumulatedOutageMins12Mo: 45,
      safetyBufferRemainingMins: 195,
      outagePercentageBurned: 18.75,
      rtoTargetHours: 4.0,
      rpoTargetHours: 1.0,
      lastDrTestDate: '2026-06-18',
      lastDrTestResult: 'PASS_WITHIN_SLA',
      status: 'SAFE_GREEN'
    },
    {
      systemId: 'CIS-04',
      name: 'SWIFT Alliance Gateway & Treasury Messaging Node',
      criticality: 'CRITICAL_SYSTEM_TIER_1',
      maxAllowedDowntimeMins: 240,
      accumulatedOutageMins12Mo: 12,
      safetyBufferRemainingMins: 228,
      outagePercentageBurned: 5.0,
      rtoTargetHours: 4.0,
      rpoTargetHours: 0.5,
      lastDrTestDate: '2026-05-11',
      lastDrTestResult: 'PASS_WITHIN_SLA',
      status: 'SAFE_GREEN'
    }
  ],
  top5Risks: [
    {
      riskId: 'TR-01',
      title: 'Supply Chain & Third-Party SaaS Concentration (Hyperscaler Cloud)',
      masDomain: '3.0 / 8.0',
      inherentRating: 'VERY_HIGH',
      residualRating: 'MEDIUM',
      appetiteStatus: 'WITHIN_APPETITE',
      kriMetric: 'Multi-AZ active failover time',
      kriValue: '34 mins',
      kriThreshold: '< 120 mins',
      actionPlanOwner: 'Head of Infrastructure',
      targetResolutionDate: '2026-11-30',
      executiveActionRequired: 'Review annual multi-region DR cutover evidence and sovereign data isolation guarantees.'
    },
    {
      riskId: 'TR-02',
      title: 'AI / LLM Customer Support Agent Data Leakage & Prompt Injection',
      masDomain: '6.0 / 11.0',
      inherentRating: 'HIGH',
      residualRating: 'MEDIUM',
      appetiteStatus: 'WITHIN_APPETITE',
      kriMetric: 'PII Redaction Accuracy in Prompt Pipeline',
      kriValue: '99.98%',
      kriThreshold: '> 99.95%',
      actionPlanOwner: 'Head of AI Engineering',
      targetResolutionDate: '2026-10-31',
      executiveActionRequired: 'Continuous automated guardrail testing in accordance with MAS GenAI Advisory 2024.'
    },
    {
      riskId: 'TR-03',
      title: 'Post-Quantum Cryptography (PQC) Transition & Legacy Cipher Exposure',
      masDomain: '10.0',
      inherentRating: 'HIGH',
      residualRating: 'LOW',
      appetiteStatus: 'WITHIN_APPETITE',
      kriMetric: 'Cryptographic Bill of Materials (CBOM) Coverage',
      kriValue: '92%',
      kriThreshold: '> 90%',
      actionPlanOwner: 'Lead Cryptography Architect',
      targetResolutionDate: '2026-12-15',
      executiveActionRequired: 'Approve 3-year migration plan to NIST-approved post-quantum algorithms (ML-KEM).'
    },
    {
      riskId: 'TR-04',
      title: 'Credential Stuffing & Sophisticated Phishing Scams (SRF Framework)',
      masDomain: '14.0',
      inherentRating: 'VERY_HIGH',
      residualRating: 'MEDIUM',
      appetiteStatus: 'WITHIN_APPETITE',
      kriMetric: 'Fraudulent Payment Interception Rate',
      kriValue: '99.4%',
      kriThreshold: '> 99.0%',
      actionPlanOwner: 'Head of Financial Crime & Fraud Operations',
      targetResolutionDate: '2026-10-15',
      executiveActionRequired: 'Maintain 12-hour cooling-off period on token binding and real-time kill-switch features.'
    },
    {
      riskId: 'TR-05',
      title: 'Legacy Payment Gateway API Token Invalidation Timing',
      masDomain: '6.0',
      inherentRating: 'HIGH',
      residualRating: 'MEDIUM',
      appetiteStatus: 'APPROACHING_TOLERANCE',
      kriMetric: 'Average API Token Lifespan',
      kriValue: '4.2 hours',
      kriThreshold: '< 2.0 hours',
      actionPlanOwner: 'Lead API Architect',
      targetResolutionDate: '2026-10-15',
      executiveActionRequired: 'Accelerate OAuth 2.0 token rotation rollout under CAPA-2026-091 to eliminate tolerance breach.'
    }
  ],
  overdueAuditFindings: [
    {
      findingId: 'AUD-FIND-2026-08',
      source: 'INTERNAL_IT_AUDIT',
      title: 'Automated Log Retention WORM Mode Configuration for Staging Analytics Cluster',
      severity: 'MEDIUM',
      originalDueDate: '2026-08-30',
      daysOverdue: 25,
      responsibleExecutive: 'Head of Data Engineering',
      delayReason: 'Cloud vendor firmware update postponed AWS S3 Object Lock enablement on secondary analytics bucket.',
      compensatingControl: 'Read-only IAM bucket policy enforced with daily snapshot hash comparison against external ledger.',
      boardEscalationStatus: 'ESCALATED_FOR_DISPENSATION'
    }
  ],
  cloudConcentration: [
    {
      vendorId: 'VND-AWS',
      vendorName: 'Amazon Web Services (AWS Singapore Region)',
      role: 'Primary Cloud Infrastructure & Kubernetes Cluster Host',
      cloudMateriality: 'MATERIAL_OUTSOURCING',
      concentrationSharePercent: 68.5,
      dataSovereigntyStatus: 'COMPLIANT_SG_JURISDICTION',
      rightToAuditStatus: 'VERIFIED_SOC2_TYPE2',
      lastExitStrategyTestDate: '2026-06-12',
      primaryRisk: 'Regional availability zone disruption & hyperscaler concentration.'
    },
    {
      vendorId: 'VND-GCP',
      vendorName: 'Google Cloud Platform (GCP Singapore Region)',
      role: 'Secondary DR Warm-Standby & AI/ML Analytics Engine',
      cloudMateriality: 'MATERIAL_OUTSOURCING',
      concentrationSharePercent: 24.0,
      dataSovereigntyStatus: 'COMPLIANT_SG_JURISDICTION',
      rightToAuditStatus: 'VERIFIED_SOC2_TYPE2',
      lastExitStrategyTestDate: '2026-07-22',
      primaryRisk: 'Cross-cloud API interoperability and data egress latency.'
    },
    {
      vendorId: 'VND-SWIFT',
      vendorName: 'SWIFT SCRL (Singapore Operating Centre)',
      role: 'Financial Messaging & Cross-Border Payment Gateway',
      cloudMateriality: 'CRITICAL_FINANCIAL_UTILITY',
      concentrationSharePercent: 7.5,
      dataSovereigntyStatus: 'COMPLIANT_SG_JURISDICTION',
      rightToAuditStatus: 'VERIFIED_SOC2_TYPE2',
      lastExitStrategyTestDate: '2026-05-11',
      primaryRisk: 'Global financial messaging network outage.'
    }
  ]
};
