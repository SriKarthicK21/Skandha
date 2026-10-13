// MAS Regulatory AI Advisor RAG Knowledge Service & Retrieval Engine
// Authoritative grounding for MAS TRM Guidelines (January 2021 Edition), Notice 644 (Cyber Hygiene), Notice 655 (Incident Reporting),
// MAS Outsourcing Guidelines, and Lead Auditor Evidence Alignment.

import { DEPARTMENT_DEFINITIONS, DepartmentCode } from '../data/evidenceChecklistMasterData';
import {
  MAS_TRM_DOMAINS,
  MAS_TRM_REQUIREMENTS,
  MAS_TRM_2021_CORPUS_EXCERPTS,
  MAS_TRM_2021_EDITION_METADATA
} from '../data/masRegulatoryMasterData';
import { MASTRMCorpusExcerpt } from '../data/masTRMGuidelines2021Data';
import { RegulatoryRequirement } from '../types/regulatoryTypes';
import {
  INDUSTRY_BENCHMARK_REPORTED_ISSUES,
  SIX_GROUPED_IMPACT_AREAS,
  SUPERVISORY_CASE_STUDIES,
  COMPLIANCE_PROGRAM_STEPS,
  IndustryBenchmarkItem,
  GroupedImpactArea,
  SupervisoryCaseStudy
} from '../data/industryTechRiskMasterData';

export interface RAGEvidenceAlignmentItem {
  id: string;
  evidenceTitle: string;
  category: 'Technical Configuration' | 'Cryptographic Proof' | 'Governance & Minutes' | 'Audit & Attestation' | 'Operational Logs' | 'Policy & Standard';
  department: string;
  departmentCode: DepartmentCode;
  auditVerificationMethod: string;
  retentionAndFormat: string;
  inspectionTrapAvoidance: string;
  priority: 'MANDATORY' | 'HIGH_PRIORITY' | 'RECOMMENDED';
  sampleFileTemplate?: string;
}

export interface RAGLeadAuditorQA {
  question: string;
  interrogationContext: string;
  modelAnswer: string;
  fatalAuditTrapAnswer: string;
  demonstrationArtifact: string;
}

export interface RAGCompensatingControl {
  legacyScenario: string;
  allowableCompensatingMeasures: string[];
  mandatoryDocumentationStandard: string;
  approvalAuthorityRequired: string;
}

export interface MASRAGAdvisoryPack {
  requirementCode: string;
  requirementTitle: string;
  domainNumber: string;
  domainName: string;
  statutoryCitations: {
    trmGuidelinesRef: string;
    masNoticeRef?: string;
    circularRef?: string;
  };
  criticalSystemsMandate: boolean;
  slaRequirements?: string;
  complianceExplanation: {
    statutoryIntent: string;
    supervisoryExpectations: string[];
    nonNegotiableMandates: string[];
    penaltiesAndEnforcementRisk: string;
    inspectionFocusNotes: string;
  };
  suggestedEvidenceAlignment: RAGEvidenceAlignmentItem[];
  leadAuditorInterrogation: RAGLeadAuditorQA[];
  compensatingControlsGuidance: RAGCompensatingControl;
  retrievedSources: Array<{
    documentTitle: string;
    section: string;
    summary: string;
  }>;
  corpusExcerpt?: MASTRMCorpusExcerpt;
  editionMetadata?: typeof MAS_TRM_2021_EDITION_METADATA;
  industryRegulatoryBenchmark?: {
    benchmarkCategory: string;
    bankingFindingRate: number;
    insuranceFindingRate: number;
    isHighestDeficiencyArea?: boolean;
    isMostCommonIssueArea?: boolean;
    auditTakeaway: string;
    matchedImpactAreaName: string;
    matchedImpactAreaId: number;
    costImpact: 'LOW' | 'MEDIUM' | 'HIGH' | 'MEDIUM_HIGH';
    consultationVsGuidelinesDiff: string;
    applicableCaseStudy?: {
      title: string;
      institutionType: string;
      coreLesson: string;
    };
  };
}

// Statutory Notice references mapped to MAS TRM Guidelines (Jan 2021 Edition) Chapters & Annexes
export const MAS_STATUTORY_NOTICES_KNOWLEDGE: Record<string, {
  noticeNumber: string;
  title: string;
  mandatoryClauses: string[];
  enforcementNature: string;
  statutoryDeadline?: string;
}> = {
  '3.0': {
    noticeNumber: 'MAS TRM Guidelines Sec 3 & Corporate Governance Regulations',
    title: 'Technology Risk Governance & Executive Oversight',
    mandatoryClauses: [
      'Board and senior management maintain ultimate responsibility for establishing and reviewing the TRM framework.',
      'Appointment of competent CIO and CISO (or equivalents) with independent reporting line minimally approved by CEO.',
      'Quarterly Board Technology Risk reporting and dynamic inventory of all information assets.'
    ],
    enforcementNature: 'Enforceable under Singapore Banking Act Sec 54 & Monetary Authority of Singapore Act',
  },
  '4.0': {
    noticeNumber: 'MAS TRM Guidelines Sec 4 & Risk Appetite Framework',
    title: 'Technology Risk Management Framework (TRMF)',
    mandatoryClauses: [
      'Approved Enterprise Technology Risk Appetite Statement (TRAS) reviewed annually by Board.',
      'Formal Risk Identification, Assessment, Treatment, and Monitoring across all information assets.',
      'Documented risk acceptance workflow with explicit CRO/CISO dual authorization and 12-month expiry.'
    ],
    enforcementNature: 'Mandatory Supervisory Condition for Financial Institution Licensing',
  },
  '5.0': {
    noticeNumber: 'MAS TRM Guidelines Sec 5 & Outsourcing Guidelines',
    title: 'IT Project Management, Security-by-Design & Source Code Escrow',
    mandatoryClauses: [
      'Project Steering Committee governance for major technology implementations.',
      'Risk assessment of COTS solutions and mandatory source code escrow evaluation for critical systems.',
      'Integration of security-by-design throughout all SDLC requirements, design, and testing gates.'
    ],
    enforcementNature: 'Supervisory Standard for Systems Acquisition & Core System Resilience',
  },
  '6.0': {
    noticeNumber: 'MAS TRM Guidelines Sec 6, Annex A & Open Banking Standards',
    title: 'Software Application Development, DevSecOps & API Security',
    mandatoryClauses: [
      'Strict segregation of duties: developers must not possess write/deploy access to production environments.',
      'Automated SAST, DAST, and SCA security gating in CI/CD pipelines before production release.',
      'Secure Open API standards: short access token expiry (<= 60 mins), rate limiting, and DoS mitigation.'
    ],
    enforcementNature: 'Mandatory Supervisory Standard for all Financial Platforms & API Gateways',
  },
  '7.0': {
    noticeNumber: 'MAS Notice 655 Para 4.3 & TRM Guidelines Sec 7',
    title: 'IT Service Management, Patching & Change Control',
    mandatoryClauses: [
      'Critical security patches installed within specified timeframes (within 14 calendar days of release).',
      'Change Advisory Board (CAB) review, pre-change backups, and rollback procedures for all changes.',
      'Technology refresh plan monitoring EOS/EOL with formal management dispensation for legacy systems.'
    ],
    enforcementNature: 'Statutory Notice under Section 64 of the Banking Act (Mandatory Cyber Hygiene)',
    statutoryDeadline: 'Critical Patches within 14 Days (72 Hours for Zero-Day Exploits)'
  },
  '8.0': {
    noticeNumber: 'MAS Notice 644/655 & TRM Guidelines Sec 8',
    title: 'IT Resilience, Recoverability & Data Centre TVRA',
    mandatoryClauses: [
      'Critical systems designed for RTO <= 4 hours, RPO <= 1 hour, and cumulative unscheduled downtime <= 4 hours/year.',
      'Elimination of single points of failure (SPoF) across compute, database, and network layers.',
      'Threat and Vulnerability Risk Assessment (TVRA) for primary and DR data centres with geographic separation.'
    ],
    enforcementNature: 'Statutory Condition under MAS Notice 644/655 (Critical Systems Availability)',
    statutoryDeadline: 'RTO <= 4 Hours, RPO <= 1 Hour, Max Downtime <= 4 Hrs/Year'
  },
  '9.0': {
    noticeNumber: 'MAS Notice 655 Para 4.1-4.2 & TRM Guidelines Sec 9',
    title: 'Access Control, PAM & Multi-Factor Authentication',
    mandatoryClauses: [
      'Principles of "never alone", segregation of duties, least privilege, and mandatory MFA on administrative accounts.',
      'Direct Internet access from administrative workstations prohibited; dedicated jump hosts with PAM session recording.',
      'Quarterly access rights certification with automated deprovisioning within 24 hours of employee departure.'
    ],
    enforcementNature: 'Statutory Notice 655 - Non-compliance constitutes an offense under Banking Act Section 64B',
    statutoryDeadline: 'Immediate Account Revocation upon Separation'
  },
  '10.0': {
    noticeNumber: 'MAS TRM Guidelines Sec 10 & FIPS 140-2 Standards',
    title: 'Cryptography, Key Management & Hardware Security Modules',
    mandatoryClauses: [
      'Cryptographic algorithms and key lengths conforming to internationally recognized standards.',
      'Sensitive keys generated, stored, and processed in Hardware Security Modules (HSMs) validated to FIPS 140-2 Level 3.',
      'Dual control (split knowledge) during master key ceremonies and secure out-of-band key transmission.'
    ],
    enforcementNature: 'Mandatory Technical Security Standard for Payment & Transaction Security',
  },
  '11.0': {
    noticeNumber: 'MAS Notice 655 Para 4.4-4.6 & TRM Guidelines Sec 11',
    title: 'Data and Infrastructure Security, DLP, Zoning & EDR',
    mandatoryClauses: [
      'Data Loss Prevention (DLP) across motion, rest, use; prohibition of raw customer production data in staging.',
      'Network segmentation with DMZs, NIPS, quarterly firewall rulebase reviews, and DDoS mitigation.',
      'Written baseline hardening standards (CIS Level 2) and EDR agents deployed on 100% of corporate endpoints.'
    ],
    enforcementNature: 'Statutory Notice 655 & Singapore Personal Data Protection Act (PDPA)',
  },
  '12.0': {
    noticeNumber: 'MAS Notice 655 & TRM Guidelines Sec 12',
    title: 'Cyber Security Operations, 24/7 SOC & Incident Reporting',
    mandatoryClauses: [
      'Continuous 24/7 SOC monitoring, UEBA behavioral analytics, and integration of FS-ISAC threat intelligence.',
      'Centralized immutable log retention for minimum 1 year (90 days online) with Stratum-1/2 NTP clock sync.',
      'Mandatory incident notification to MAS within 1 hour of discovering a critical system malfunction or cyber attack.'
    ],
    enforcementNature: 'Statutory Notice 655 - Regulatory 1-Hour SLA Obligation',
    statutoryDeadline: 'Notification to MAS <= 1 Hour; Post-Incident Report <= 14 Days'
  },
  '13.0': {
    noticeNumber: 'MAS TRM Guidelines Sec 13 & AASE Framework',
    title: 'Cyber Security Assessment, VA/PT & Red Teaming (AASE)',
    mandatoryClauses: [
      'Annual independent Penetration Testing (PT) covering all external-facing IPs, web applications, and APIs.',
      'Adversarial Attack Simulation Exercise (AASE / Red Teaming) simulating real-world adversary TTPs.',
      'Vulnerability remediation tracking with High/Critical findings remediated within 30 calendar days.'
    ],
    enforcementNature: 'Mandatory Supervisory Condition for Financial Institution Risk Assurance',
    statutoryDeadline: 'Annual Penetration Testing & Bi-Annual AASE Red Teaming'
  },
  '14.0': {
    noticeNumber: 'MAS TRM Guidelines Sec 14 & Digital Banking Notices',
    title: 'Online Financial Services, Transaction Signing & Soft Token Binding',
    mandatoryClauses: [
      'MFA at login based on two or more distinct factors; end-to-end encryption of customer authentication credentials.',
      'Digital transaction signing required for high-risk operations (adding payees, large transfers, contact updates).',
      'Cryptographic device binding linking soft tokens to hardware; real-time fraud monitoring and alerting.'
    ],
    enforcementNature: 'Mandatory Regulatory Expectation for Consumer Digital Banking & Payment Services',
  },
  '15.0': {
    noticeNumber: 'MAS TRM Guidelines Sec 15 & Internal Audit Standards',
    title: 'Independent IT Audit Function',
    mandatoryClauses: [
      'Independent and objective IT audit function providing assurance to Board Audit Committee.',
      'Comprehensive audit scope covering all technology risk domains with risk-commensurate frequency (12-18 months).',
      'Auditors must possess recognized professional qualifications (CISA, CISSP) and operational independence.'
    ],
    enforcementNature: 'Statutory Governance Condition under Singapore Banking Act',
    statutoryDeadline: 'IT Audit Cadence: 12 to 18 Months'
  },
  'Annex A': {
    noticeNumber: 'MAS TRM Guidelines Annex A (AST Methodology)',
    title: 'Application Security Testing: SAST, DAST, IAST & Fuzzing',
    mandatoryClauses: [
      'Deployment of SAST to analyze source code and bytecode before builds are approved.',
      'DAST and IAST execution in pre-production staging pipelines to test live application behavior.',
      'Fuzz testing applied to critical payment message parsing, network protocol stacks, and API deserializers.'
    ],
    enforcementNature: 'Technical Supervisory Standard for Application Resilience',
  },
  'Annex B': {
    noticeNumber: 'MAS TRM Guidelines Annex B (BYOD Controls)',
    title: 'Bring Your Own Device (BYOD) Security & Mobile Management',
    mandatoryClauses: [
      'Mobile Device Management (MDM) and Mobile Application Management (MAM) enforcement on personal devices.',
      'Storage encryption, screen lock, jailbreak/root detection, and remote wipe capabilities.',
      'DLP controls blocking copying of corporate banking data to personal storage or clipboards.'
    ],
    enforcementNature: 'Supervisory Standard for Enterprise Data Leakage Prevention',
  },
  'Annex C': {
    noticeNumber: 'MAS TRM Guidelines Annex C (Mobile App Security)',
    title: 'Mobile Application Security: Anti-Hooking, Pinning & Obfuscation',
    mandatoryClauses: [
      'Prohibition of sensitive data caching in mobile local storage; secure storage in hardware Keystore/Keychain.',
      'Anti-hooking/anti-tampering runtime defense to detect Frida, Substrate, and dynamic code injection.',
      'SSL/TLS public key pinning, bytecode obfuscation (DexGuard), secure in-app keypads, and device binding.'
    ],
    enforcementNature: 'Mandatory Technical Standard for Mobile Banking Applications',
  },
  // Legacy cross-reference mappings
  '16.0': {
    noticeNumber: 'MAS TRM Guidelines Sec 12.2 & Sec 7.5.7',
    title: 'Audit Logging, Centralized Telemetry & Log Retention',
    mandatoryClauses: [
      'Centralized immutable log aggregation with minimum 1-year retention (90 days online hot storage).',
      'Stratum-1/2 NTP clock synchronization across all servers, firewalls, and active directory controllers.'
    ],
    enforcementNature: 'Statutory Audit Trail Standard',
    statutoryDeadline: '1-Year Log Retention'
  },
  '17.0': {
    noticeNumber: 'MAS TRM Guidelines Sec 13.2 & Sec 15.1',
    title: 'Independent Technology Audit & Penetration Testing',
    mandatoryClauses: [
      'Annual independent technology risk audit and annual CREST-accredited penetration testing.'
    ],
    enforcementNature: 'Mandatory Licensing Condition'
  }
};

// Search across the trained MAS TRM 2021 Guidelines corpus
export function searchMASTRMGuidelinesCorpus(queryText: string): Array<{
  sectionNumber: string;
  chapterTitle: string;
  matchedText: string;
  relevanceScore: number;
  footnotes: string[];
  pageNumber: number;
}> {
  if (!queryText || !queryText.trim()) return [];
  const q = queryText.toLowerCase().trim();
  const results: Array<{
    sectionNumber: string;
    chapterTitle: string;
    matchedText: string;
    relevanceScore: number;
    footnotes: string[];
    pageNumber: number;
  }> = [];

  Object.entries(MAS_TRM_2021_CORPUS_EXCERPTS).forEach(([secNum, excerpt]) => {
    let score = 0;
    const inTitle = excerpt.chapterTitle.toLowerCase().includes(q);
    const inExcerpt = excerpt.verbatimExcerpt.toLowerCase().includes(q);
    const inIntent = excerpt.supervisoryIntent.toLowerCase().includes(q);
    const inFootnotes = excerpt.footnotes.some(f => f.toLowerCase().includes(q));

    if (inTitle) score += 50;
    if (inExcerpt) score += 35;
    if (inIntent) score += 20;
    if (inFootnotes) score += 25;

    // Word-level matching
    const words = q.split(/\s+/);
    words.forEach(w => {
      if (w.length > 2) {
        if (excerpt.verbatimExcerpt.toLowerCase().includes(w)) score += 10;
        if (excerpt.chapterTitle.toLowerCase().includes(w)) score += 15;
      }
    });

    if (score > 0) {
      results.push({
        sectionNumber: excerpt.sectionNumber,
        chapterTitle: excerpt.chapterTitle,
        matchedText: excerpt.verbatimExcerpt.substring(0, 260) + '...',
        relevanceScore: score,
        footnotes: excerpt.footnotes,
        pageNumber: excerpt.pageNumber
      });
    }
  });

  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// Comprehensive RAG Knowledge Base builder for any MAS Requirement
export function buildMASRAGAdvisoryPack(
  reqCode: string,
  userQuery?: string,
  currentState?: string
): MASRAGAdvisoryPack {
  // Find requirement from authoritative registry
  const req = MAS_TRM_REQUIREMENTS.find(r => r.requirementCode === reqCode) || MAS_TRM_REQUIREMENTS[0];
  const domain = MAS_TRM_DOMAINS.find(d => d.domainNumber === req.domainNumber) || MAS_TRM_DOMAINS[0];
  const noticeKnowledge = MAS_STATUTORY_NOTICES_KNOWLEDGE[req.domainNumber] || {
    noticeNumber: 'MAS TRM Guidelines (Jan 2021 Edition)',
    title: domain.name,
    mandatoryClauses: [
      'Establish robust internal controls and formal policies approved by senior management.',
      'Maintain verifiable audit trails and operational logging.',
      'Conduct regular testing and review by independent audit functions.'
    ],
    enforcementNature: 'Statutory Supervisory Expectation'
  };

  // Check for matching verbatim corpus excerpt
  const corpusExcerpt = MAS_TRM_2021_CORPUS_EXCERPTS[req.sectionNumber] ||
    MAS_TRM_2021_CORPUS_EXCERPTS[req.domainNumber] ||
    Object.values(MAS_TRM_2021_CORPUS_EXCERPTS).find(e => req.sectionNumber.startsWith(e.sectionNumber));

  // Department mapping based on 2021 chapters
  let matchedDeptCode: DepartmentCode = 'DEPT_INFOSEC_SOC';
  if (['3.0', '4.0'].includes(req.domainNumber)) matchedDeptCode = 'DEPT_EXEC_BOARD';
  else if (['5.0', '6.0', 'Annex A'].includes(req.domainNumber)) matchedDeptCode = 'DEPT_ENG_DEVOPS';
  else if (['7.0', '8.0', 'Annex B'].includes(req.domainNumber)) matchedDeptCode = 'DEPT_IT_OPS';
  else if (['9.0', '10.0', '11.0', '12.0', '13.0', '14.0', 'Annex C'].includes(req.domainNumber)) matchedDeptCode = 'DEPT_INFOSEC_SOC';
  else if (['15.0', '17.0'].includes(req.domainNumber)) matchedDeptCode = 'DEPT_LEGAL_PRIVACY';

  const matchedDept = DEPARTMENT_DEFINITIONS.find(d => d.code === matchedDeptCode) || DEPARTMENT_DEFINITIONS[0];

  // Tailored Evidence Alignment Items based on requirement specifics
  const evidenceList: RAGEvidenceAlignmentItem[] = [];

  if (req.evidenceRequirements && req.evidenceRequirements.length > 0) {
    req.evidenceRequirements.forEach((evText, idx) => {
      evidenceList.push({
        id: `EV-ALIGN-${req.requirementCode.replace(/[^a-zA-Z0-9]/g, '_')}-${idx + 1}`,
        evidenceTitle: evText,
        category: idx === 0 ? 'Policy & Standard' : idx === 1 ? 'Technical Configuration' : 'Operational Logs',
        department: matchedDept.name,
        departmentCode: matchedDept.code,
        auditVerificationMethod: req.testProcedures?.[idx] || `Examine signed copy and inspect operational samples across 3 consecutive months.`,
        retentionAndFormat: 'Immutable PDF/JSON with SHA-256 cryptographic stamp; 7-year statutory financial retention.',
        inspectionTrapAvoidance: matchedDept.topAuditTrapsToAvoid[idx % matchedDept.topAuditTrapsToAvoid.length] || 'Providing unsigned drafts or logs lacking tamper-evident timestamping.',
        priority: idx === 0 ? 'MANDATORY' : idx === 1 ? 'HIGH_PRIORITY' : 'RECOMMENDED'
      });
    });
  }

  // Add specialized high-integrity evidence item for MAS inspections
  evidenceList.push({
    id: `EV-SPEC-${req.requirementCode.replace(/[^a-zA-Z0-9]/g, '_')}-CRYPT`,
    evidenceTitle: `${req.requirementCode} Cryptographic Operating Effectiveness Log & Verification Hash`,
    category: 'Cryptographic Proof',
    department: 'InfoSec & Security Operations',
    departmentCode: 'DEPT_INFOSEC_SOC',
    auditVerificationMethod: 'Auditor executes SHA-256 hash checksum verification against immutable storage ledger (WORM-compliant) to confirm zero retrospective modification.',
    retentionAndFormat: 'Structured JSON log feed + RFC 3161 cryptographic timestamping token.',
    inspectionTrapAvoidance: 'Logging into a mutable relational database table without write-once protection where admin users can rewrite history.',
    priority: 'MANDATORY'
  });

  // Tailored Lead Auditor Q&A
  const leadAuditorQAs: RAGLeadAuditorQA[] = [
    {
      question: `How does the Financial Institution demonstrate that ${req.title} is actively operating and not merely a static policy document?`,
      interrogationContext: `MAS Supervisory inspectors routinely check whether controls are embedded in live operational workflows rather than theoretical policy files.`,
      modelAnswer: `We maintain an active operational loop governed by our CISO and Technology Risk Committee. For ${req.requirementCode}, our control is automated via CI/CD telemetry and privileged identity proxies. We verify operating effectiveness through quarterly control sample testing, with every test result archived cryptographically in our GRC portal.`,
      fatalAuditTrapAnswer: `We have the policy approved by management, and our teams are instructed to follow it. We haven't had an incident, so the control works.`,
      demonstrationArtifact: `${req.title} quarterly testing ledger showing 25 sampled records, tester signatures, and zero unresolved exceptions.`
    },
    {
      question: `If an operational exception or technical failure occurs under ${req.requirementCode}, what is the documented escalation and remediation protocol?`,
      interrogationContext: `Auditors test the resilience of exception handling: who has the authority to grant risk acceptances, and does MAS receive notification if critical thresholds are breached?`,
      modelAnswer: `Any exception under ${req.requirementCode} immediately triggers an automated CAPA ticket with a 14-day SLA. High-risk deviations require explicit written sign-off from both the Head of Technology Risk and CISO. If the deviation impacts a Critical Information System, it is reported to the Board Risk Committee and assessed against MAS Notice 655 reporting criteria within 1 hour.`,
      fatalAuditTrapAnswer: `Engineers handle workarounds informally on Slack or Jira without central risk register logging.`,
      demonstrationArtifact: `Corrective Action Plan (CAPA) workflow register with 5-Whys root cause analysis and CISO risk acceptance record.`
    }
  ];

  // Domain-specific compensating control guidance
  let legacyScenario = `Legacy systems or third-party proprietary software unable to natively implement modern automated controls for ${req.title}.`;
  let allowableCompensating: string[] = [
    'Enforce micro-segmentation in a dedicated, isolated network VLAN with ingress/egress proxy inspection.',
    'Require dual-custody approval and jump-box PAM session recording with real-time keystroke monitoring.',
    'Implement compensating host-based intrusion detection (HIDS) and daily manual log review signed off by the Security Operations Lead.',
    'Annual formal risk acceptance signed by the Chief Risk Officer with a documented decommissioning or modernization roadmap (maximum 12 months).'
  ];

  if (req.domainNumber === '9.0') {
    legacyScenario = 'Legacy terminal or batch processing systems where hardware FIDO2 or modern PAM jump-hosts cannot be embedded directly.';
    allowableCompensating = [
      'Enforce dedicated Bastion / Jump Server with mandatory hardware MFA token at the gateway layer.',
      'Dual authorization: Require a second supervisor credential approval for initiating high-risk operations.',
      'WORM-compliant session video recording of all administrative access with automated anomaly alerts.'
    ];
  } else if (req.domainNumber === '8.0' || req.domainNumber === '12.0') {
    legacyScenario = 'Multi-cloud cross-border architectures where automated 1-hour reporting or continuous replication encounters latency bottlenecks.';
    allowableCompensating = [
      'Pre-configured MAS Notice 655 incident dispatch template with automated alerting to designated CISO on-call phone within 15 minutes of threshold breach.',
      'Warm-standby pilot light environment in Singapore availability zone maintaining continuous asynchronous data mirror with RPO under 15 minutes.'
    ];
  }

  // Statutory Intent and Guidance
  const statutoryIntent = req.intentAndGuidance || 
    `MAS requires financial institutions to establish rigorous, auditable operational controls for ${req.title} to guarantee systemic financial stability, protect customer data confidentiality, and safeguard payment resilience across Singapore's financial ecosystem.`;

  const supervisoryExpectations = [
    req.statement,
    ...(req.controlObjectives || []),
    `Full alignment with ${noticeKnowledge.title} (${noticeKnowledge.noticeNumber}).`,
    `Evidence of continuous operating effectiveness backed by automated test records and documented sample sizes.`
  ];

  const nonNegotiableMandates = [
    ...noticeKnowledge.mandatoryClauses,
    req.slaRequirement ? `Statutory SLA Mandate: ${req.slaRequirement}` : 'No unapproved deviations or informal verbal approvals permitted.',
    'Cryptographic and tamper-evident preservation of all audit logs for minimum 7 years.'
  ];

  const penaltiesAndEnforcementRisk = req.mandatoryForFIs 
    ? `Under Singapore Banking Act (Cap. 19) Section 64B and MAS Notice 644/655, failure to comply with statutory directions can result in fines up to S$1,000,000 per violation, regulatory reprimands, supervisory capital add-ons, or suspension of designated payment service licenses.`
    : `Failure to satisfy MAS TRM Guidelines during statutory supervisory inspections results in formal MAS Supervisory Letters, mandatory Section 58 independent external audits at FI expense, and negative regulatory risk ratings.`;

  // Determine industry supervisory benchmark data matching this requirement
  let matchedBenchmark = INDUSTRY_BENCHMARK_REPORTED_ISSUES[0]; // default to infra
  let matchedArea = SIX_GROUPED_IMPACT_AREAS[2]; // Area 3 (Infra & Access)
  let applicableCaseStudy = SUPERVISORY_CASE_STUDIES[0];

  const dNum = req.domainNumber;
  if (['3.0', '4.0'].includes(dNum)) {
    matchedBenchmark = INDUSTRY_BENCHMARK_REPORTED_ISSUES.find(b => b.domain.includes('Board')) || INDUSTRY_BENCHMARK_REPORTED_ISSUES[5];
    matchedArea = SIX_GROUPED_IMPACT_AREAS[0]; // Notice & Framework
    applicableCaseStudy = SUPERVISORY_CASE_STUDIES[0];
  } else if (['5.0', '6.0', 'Annex A'].includes(dNum)) {
    matchedBenchmark = INDUSTRY_BENCHMARK_REPORTED_ISSUES.find(b => b.domain.includes('Acquisition')) || INDUSTRY_BENCHMARK_REPORTED_ISSUES[2];
    matchedArea = SIX_GROUPED_IMPACT_AREAS[3]; // Dev & Change
    applicableCaseStudy = SUPERVISORY_CASE_STUDIES[1];
  } else if (['8.0', '15.0'].includes(dNum)) {
    matchedBenchmark = INDUSTRY_BENCHMARK_REPORTED_ISSUES.find(b => b.domain.includes('Reliability')) || INDUSTRY_BENCHMARK_REPORTED_ISSUES[7];
    matchedArea = SIX_GROUPED_IMPACT_AREAS[1]; // System Availability & RTO <= 4h
    applicableCaseStudy = SUPERVISORY_CASE_STUDIES[0]; // Onshore Bank 4h RTO
  } else if (['9.0', '10.0'].includes(dNum)) {
    matchedBenchmark = INDUSTRY_BENCHMARK_REPORTED_ISSUES.find(b => b.domain.includes('Access Control')) || INDUSTRY_BENCHMARK_REPORTED_ISSUES[1];
    matchedArea = SIX_GROUPED_IMPACT_AREAS[2]; // Infra & Access 2FA
    applicableCaseStudy = SUPERVISORY_CASE_STUDIES[1];
  } else if (['14.0', 'Annex C'].includes(dNum)) {
    matchedBenchmark = INDUSTRY_BENCHMARK_REPORTED_ISSUES.find(b => b.domain.includes('Online Financial')) || INDUSTRY_BENCHMARK_REPORTED_ISSUES[3];
    matchedArea = SIX_GROUPED_IMPACT_AREAS[4]; // Mobile Online Services
    applicableCaseStudy = SUPERVISORY_CASE_STUDIES[1];
  } else if (['7.0', '11.0'].includes(dNum)) {
    matchedBenchmark = INDUSTRY_BENCHMARK_REPORTED_ISSUES[0]; // Operational Infrastructure Security
    matchedArea = SIX_GROUPED_IMPACT_AREAS[2];
    applicableCaseStudy = SUPERVISORY_CASE_STUDIES[0];
  } else if (['12.0'].includes(dNum)) {
    matchedBenchmark = INDUSTRY_BENCHMARK_REPORTED_ISSUES.find(b => b.domain.includes('IT Service Management')) || INDUSTRY_BENCHMARK_REPORTED_ISSUES[4];
    matchedArea = SIX_GROUPED_IMPACT_AREAS[0]; // Notice & 1-hr incident reporting
    applicableCaseStudy = SUPERVISORY_CASE_STUDIES[1];
  }

  const industryRegulatoryBenchmark = {
    benchmarkCategory: matchedBenchmark.domain,
    bankingFindingRate: matchedBenchmark.bankingPercentage,
    insuranceFindingRate: matchedBenchmark.insurancePercentage,
    isHighestDeficiencyArea: matchedBenchmark.isHighestIssueArea,
    isMostCommonIssueArea: matchedBenchmark.isMostPopularIssueArea,
    auditTakeaway: matchedBenchmark.auditTakeaway,
    matchedImpactAreaName: matchedArea.name,
    matchedImpactAreaId: matchedArea.id,
    costImpact: matchedArea.costImpact,
    consultationVsGuidelinesDiff: matchedArea.trmGuidelinesRequirement,
    applicableCaseStudy: {
      title: applicableCaseStudy.title,
      institutionType: applicableCaseStudy.institutionType,
      coreLesson: applicableCaseStudy.keyLessonsLearned[0]
    }
  };

  return {
    requirementCode: req.requirementCode,
    requirementTitle: req.title,
    domainNumber: req.domainNumber,
    domainName: req.domainName,
    statutoryCitations: {
      trmGuidelinesRef: req.regulatorySourceRef || `MAS TRM Guidelines Section ${req.sectionNumber}`,
      masNoticeRef: noticeKnowledge.noticeNumber,
      circularRef: req.criticalSystemsMandate ? 'MAS Circular on Technology Resilience & Cyber Hygiene' : undefined
    },
    criticalSystemsMandate: req.criticalSystemsMandate || false,
    slaRequirements: req.slaRequirement,
    complianceExplanation: {
      statutoryIntent,
      supervisoryExpectations,
      nonNegotiableMandates,
      penaltiesAndEnforcementRisk,
      inspectionFocusNotes: `During MAS on-site inspections, regulators will cross-reference the control owner (${req.responsibleRoles?.[0] || 'CISO'}), verify the test procedures (${req.testProcedures?.[0] || 'Sample verification'}), and inspect the evidence artifacts against live production infrastructure.`
    },
    suggestedEvidenceAlignment: evidenceList,
    leadAuditorInterrogation: leadAuditorQAs,
    compensatingControlsGuidance: {
      legacyScenario,
      allowableCompensatingMeasures: allowableCompensating,
      mandatoryDocumentationStandard: 'Formal Risk Acceptance Memorandum signed by CRO and CISO, entered into the Enterprise GRC Risk Register with an expiry not exceeding 365 calendar days.',
      approvalAuthorityRequired: 'Chief Information Security Officer & Board Risk Committee'
    },
    retrievedSources: [
      {
        documentTitle: 'MAS Technology Risk Management Guidelines (January 2021 Edition)',
        section: `Section ${req.sectionNumber}`,
        summary: req.statement
      },
      {
        documentTitle: noticeKnowledge.noticeNumber,
        section: 'Statutory Cyber Hygiene & Notice Requirements',
        summary: noticeKnowledge.mandatoryClauses[0] || 'Mandatory technical controls enforced across all licensed FIs.'
      },
      {
        documentTitle: 'ISO 27001 / NIST CSF 2.0 Multi-Standard Crosswalk',
        section: req.crossFrameworkMappings?.iso27001?.join(', ') || 'A.5.1 Governance',
        summary: `Harmonized mapping to global frameworks: ISO (${req.crossFrameworkMappings?.iso27001?.join(', ') || 'N/A'}), NIST (${req.crossFrameworkMappings?.nistCsf?.join(', ') || 'N/A'}).`
      }
    ],
    corpusExcerpt,
    editionMetadata: MAS_TRM_2021_EDITION_METADATA,
    industryRegulatoryBenchmark
  };
}

// Client API caller to backend RAG advisor endpoint
export async function queryMASRegulatoryAIAdvisor(params: {
  requirementCode: string;
  requirementTitle: string;
  domainNumber: string;
  domainName: string;
  query?: string;
  mode?: 'ALL' | 'COMPLIANCE' | 'EVIDENCE' | 'AUDIT_DEFENSE' | 'COMPENSATING';
  institutionType?: string;
  currentState?: string;
}): Promise<{
  success: boolean;
  isAI: boolean;
  model: string;
  advisory: MASRAGAdvisoryPack;
}> {
  try {
    const res = await fetch('/api/mas/rag-advisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.advisory) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend RAG Advisor endpoint unavailable, switching to deterministic offline RAG engine:', err);
  }

  // Fallback to authoritative deterministic RAG engine
  const fallbackAdvisory = buildMASRAGAdvisoryPack(
    params.requirementCode,
    params.query,
    params.currentState
  );

  return {
    success: true,
    isAI: false,
    model: 'Authoritative MAS Statutory RAG Engine (Grounding: Jan 2021 Edition)',
    advisory: fallbackAdvisory
  };
}

/**
 * Re-export Standards Knowledge helper for multi-standard RAG grounding
 */
export { StandardsKnowledgeService } from './standardsKnowledgeService';
export { STANDARDS_CATALOG } from '../data/standardsKnowledgeData';
