/**
 * SKANDA Enterprise GRC - Automated Evidence Recommendation Engine
 * 
 * Analyzes requirements flagged as 'Deficient' or 'Pending Evidence' and executes
 * algorithmic matching against the central EvidenceVault repository to suggest
 * high-confidence bridging artifacts, quantify projected readiness uplift, and
 * provide prescriptive evidence collection templates.
 * 
 * Architecture: Clean Architecture / DDD Domain Service
 */

import { EvidenceRecord, FindingCAPARecord } from '../types';
import { MASRequirementAssessmentRecord } from '../types/regulatoryTypes';
import { EnrichedMASRequirement } from '../components/mas/ComplianceGapVisualization';

export type RecommendationConfidenceLevel = 'HIGH_CONFIDENCE' | 'MODERATE_CONFIDENCE' | 'SUPPLEMENTARY';

export interface EvidenceVaultMatch {
  evidence: EvidenceRecord;
  confidenceScore: number; // 0 - 100%
  confidenceLevel: RecommendationConfidenceLevel;
  matchingFactors: {
    controlCodeMatch: boolean;
    isoControlMatched?: string;
    keywordMatches: string[];
    tagMatches: string[];
    departmentAlignment: boolean;
    verificationStatusBonus: number;
  };
  gapBridgingRationale: string;
  projectedReadinessUplift: number; // Percentage point uplift (e.g. +18)
  recommendedAction: 'LINK_EXISTING_EVIDENCE' | 'REQUEST_VERIFICATION_REFRESH' | 'ALREADY_LINKED';
}

export interface PrescribedEvidenceTemplate {
  templateId: string;
  title: string;
  suggestedFileName: string;
  suggestedFileType: string;
  department: string;
  controlCode: string;
  tags: string[];
  mandatorySafeguards: string[];
  recommendedCadence: 'Continuous Telemetry' | 'Monthly' | 'Quarterly' | 'Bi-Annual' | 'Annual';
  rationale: string;
  potentialReadinessUplift: number;
}

export interface RequirementGapRecommendation {
  requirementCode: string;
  requirementTitle: string;
  domainNumber: string;
  domainName: string;
  complianceStatus: 'Deficient' | 'Pending Evidence';
  riskTier: 'HIGH_RISK' | 'MEDIUM_RISK' | 'LOW_RISK';
  readinessScore: number;
  openFindingsCount: number;
  primaryDeficiencyReason: string;
  statutoryMandateNote: string;
  matchedVaultItems: EvidenceVaultMatch[];
  topMatch?: EvidenceVaultMatch;
  prescribedTemplate: PrescribedEvidenceTemplate;
  overallGapBridgeability: 'IMMEDIATE_VAULT_WIN' | 'REFRESH_REQUIRED' | 'COLLECTION_NEEDED';
}

export interface ExecutiveGapRemediationSummary {
  totalDeficientRequirements: number;
  totalPendingEvidenceRequirements: number;
  totalBridgeableWithVault: number;
  totalNeedingCollection: number;
  projectedAverageReadinessIncrease: number;
  recommendations: RequirementGapRecommendation[];
}

// Domain-Specific Prescribed Evidence Templates
const DOMAIN_EVIDENCE_TEMPLATES: Record<string, PrescribedEvidenceTemplate> = {
  'MAS-TRM-3.1': {
    templateId: 'tmpl-gov-board-minutes',
    title: 'Board IT Risk Oversight Committee Minutes & TRM Strategy Sign-off',
    suggestedFileName: 'Board_IT_Risk_Oversight_Minutes_Q2_2026.pdf',
    suggestedFileType: 'application/pdf',
    department: 'Board Secretariat & Risk Governance',
    controlCode: 'A.5.1',
    tags: ['Board Oversight', 'Mandatory Governance', 'TRM-Section-3', 'Annual Approval'],
    mandatorySafeguards: [
      'Board-approved Technology Risk Management framework',
      'Documented risk appetite statement for cyber and technology operations',
      'Quarterly review of cyber threat posture by Senior Management'
    ],
    recommendedCadence: 'Quarterly',
    rationale: 'Satisfies MAS TRM Section 3.1 & ISO 27001 Clause 5.1 governance oversight mandates with board-level accountability.',
    potentialReadinessUplift: 20
  },
  'MAS-TRM-5.1': {
    templateId: 'tmpl-outsourcing-due-diligence',
    title: 'Annual Critical Service Provider SOC 2 Type II & Security Due Diligence Dossier',
    suggestedFileName: 'Cloud_Vendor_SOC2_Type2_Due_Diligence_2026.pdf',
    suggestedFileType: 'application/pdf',
    department: 'Vendor Risk & Procurement',
    controlCode: 'A.5.19',
    tags: ['Third-Party Due Diligence', 'Cloud Outsourcing', 'SOC2-Type-II', 'Annex A.5.19'],
    mandatorySafeguards: [
      'Independent SOC 2 Type II / ISO 27001 certification validation',
      'Contractual right-to-audit and data sovereignty clauses',
      'Formal vendor contingency and exit strategy documentation'
    ],
    recommendedCadence: 'Annual',
    rationale: 'Fulfills MAS TRM Section 5 & MAS Outsourcing Guidelines for continuous third-party risk surveillance.',
    potentialReadinessUplift: 22
  },
  'MAS-TRM-6.1': {
    templateId: 'tmpl-devsecops-sast-scan',
    title: 'Automated CI/CD SAST/DAST Pipeline Security Scan & Production Deployment Attestation',
    suggestedFileName: 'GitLab_CI_SAST_DAST_Compliance_Gate_Signoff.json',
    suggestedFileType: 'application/json',
    department: 'Software Engineering & DevOps',
    controlCode: 'A.8.25',
    tags: ['DevSecOps', 'CI/CD Gate', 'SAST-DAST', 'OWASP-Top-10', 'Annex A.8.28'],
    mandatorySafeguards: [
      'Mandatory blocking gate on Critical and High severity SAST/DAST findings',
      'Peer review and cryptographic commit signing for all production merges',
      'Dependency vulnerability scanning with software bill of materials (SBOM)'
    ],
    recommendedCadence: 'Continuous Telemetry',
    rationale: 'Fulfills MAS TRM Section 6.1 DevSecOps standards and ISO A.8.25 secure development lifecycle controls.',
    potentialReadinessUplift: 18
  },
  'MAS-TRM-7.1': {
    templateId: 'tmpl-perimeter-firewall-audit',
    title: 'Perimeter Next-Gen Firewall & Microsegmentation Zero Trust Configuration Audit',
    suggestedFileName: 'PaloAlto_Perimeter_Zero_Trust_Rule_Audit.pdf',
    suggestedFileType: 'application/pdf',
    department: 'Network & Cloud Infrastructure',
    controlCode: 'A.8.20',
    tags: ['Perimeter Security', 'Zero Trust', 'Microsegmentation', 'Firewall Rules', 'Annex A.8.20'],
    mandatorySafeguards: [
      'Semi-annual rulebase hygiene review and removal of stale any-any rules',
      'Default-deny posture across internal VLANs and DMZ boundaries',
      'Encrypted transit inspection and IPS active blocking verification'
    ],
    recommendedCadence: 'Bi-Annual',
    rationale: 'Demonstrates robust boundary protection mandated by MAS Notice 655 Cyber Hygiene & ISO A.8.20.',
    potentialReadinessUplift: 19
  },
  'MAS-TRM-8.1': {
    templateId: 'tmpl-pam-mfa-recertification',
    title: 'Okta/Azure AD Privileged Access Management (PAM) & MFA Enforcement Recertification Log',
    suggestedFileName: 'Okta_PAM_MFA_Recertification_Audit_Pack.pdf',
    suggestedFileType: 'application/pdf',
    department: 'Information Security & Compliance',
    controlCode: 'A.5.15',
    tags: ['Access Review', 'Okta', 'PAM', 'MFA-Enforcement', 'Notice 655 Para 4.1', 'Annex A.5.15'],
    mandatorySafeguards: [
      '100% MFA enforcement on all administrative access to critical systems',
      'Zero standing administrative privileges with just-in-time session elevation',
      'Quarterly re-certification of administrative accounts signed by asset owners'
    ],
    recommendedCadence: 'Monthly',
    rationale: 'Directly addresses statutory non-compliance under MAS Notice 655 Para 4.1 (Mandatory MFA & PAM controls).',
    potentialReadinessUplift: 25
  },
  'MAS-TRM-8.2': {
    templateId: 'tmpl-four-eyes-dual-control',
    title: 'Production Database & Critical Infrastructure Dual-Control Change Ledger',
    suggestedFileName: 'Dual_Control_Four_Eyes_Audit_Ledger.json',
    suggestedFileType: 'application/json',
    department: 'Software Engineering & DevOps',
    controlCode: 'A.5.16',
    tags: ['Dual-Control', 'Four-Eyes', 'Separation of Duties', 'Notice 655 Para 4.2'],
    mandatorySafeguards: [
      'Four-eyes approval enforced on all critical schema or configuration changes',
      'Independent change validator distinct from developer or requester',
      'Cryptographically sealed audit trail of dual approvals'
    ],
    recommendedCadence: 'Continuous Telemetry',
    rationale: 'Proves strict enforcement of separation of duties under MAS TRM Section 8.2 and ISO A.5.16.',
    potentialReadinessUplift: 18
  },
  'MAS-TRM-8.3': {
    templateId: 'tmpl-vuln-patch-management',
    title: 'Monthly Infrastructure Vulnerability Scan Report & High-Severity Patch SLA Ledger',
    suggestedFileName: 'Tenable_Monthly_Vulnerability_Patch_Attestation.pdf',
    suggestedFileType: 'application/pdf',
    department: 'Information Security & Compliance',
    controlCode: 'A.8.8',
    tags: ['Vulnerability Scan', 'Patch Management', 'CREST', 'Notice 655 Para 4.3', 'Annex A.8.8'],
    mandatorySafeguards: [
      'Monthly vulnerability scanning of all Internet-facing and critical assets',
      'Remediation of Critical/High CVEs within mandatory statutory SLA windows',
      'Annual independent CREST-certified penetration testing'
    ],
    recommendedCadence: 'Monthly',
    rationale: 'Fulfills MAS Notice 655 Para 4.3 requirements for timely vulnerability mitigation.',
    potentialReadinessUplift: 24
  },
  'MAS-TRM-9.1': {
    templateId: 'tmpl-kms-key-custody',
    title: 'HSM Cryptographic Key Custody & Database Envelope Encryption Rotation Report',
    suggestedFileName: 'KMS_Cryptographic_Key_Auto_Rotation_Audit.json',
    suggestedFileType: 'application/json',
    department: 'Software Engineering & DevOps',
    controlCode: 'A.8.24',
    tags: ['Encryption', 'AWS KMS', 'HSM', 'Key Custody', 'Annex A.8.24'],
    mandatorySafeguards: [
      'AES-256 envelope encryption for data at rest across all transactional databases',
      'Automated key rotation cadence <= 365 days managed in FIPS 140-2 Level 3 HSM',
      'Strict separation of duties between key custodians and database administrators'
    ],
    recommendedCadence: 'Annual',
    rationale: 'Demonstrates cryptographic protection and key governance under MAS TRM Section 9 and ISO A.8.24.',
    potentialReadinessUplift: 17
  },
  'MAS-TRM-10.1': {
    templateId: 'tmpl-incident-response-sla',
    title: 'Cyber Incident Response Playbook Simulation & MAS 1-Hour Notification SLA Sign-off',
    suggestedFileName: 'Cyber_Incident_Tabletop_Drill_MAS_1Hr_SLA.pdf',
    suggestedFileType: 'application/pdf',
    department: 'SecOps & Incident Response',
    controlCode: 'A.5.24',
    tags: ['Incident Response', 'MAS-1Hr-SLA', 'Tabletop Drill', 'Annex A.5.24'],
    mandatorySafeguards: [
      'Tested procedure for MAS notification within 1 hour of incident confirmation',
      'Annual simulated tabletop cyber attack involving executive leadership',
      'Automated evidence preservation and forensic containment runbooks'
    ],
    recommendedCadence: 'Bi-Annual',
    rationale: 'Validates operational readiness to meet the strict 1-hour regulatory incident notification SLA.',
    potentialReadinessUplift: 21
  },
  'MAS-TRM-11.1': {
    templateId: 'tmpl-siem-soc-telemetry',
    title: '24x7 Security Operations Center (SOC) Alert Telemetry & SIEM Uptime Log',
    suggestedFileName: 'Splunk_24x7_SOC_Telemetry_Uptime_Report.pdf',
    suggestedFileType: 'application/pdf',
    department: 'SecOps & Incident Response',
    controlCode: 'A.8.16',
    tags: ['SIEM', '24x7 SOC', 'Telemetry', 'Continuous Monitoring', 'Annex A.8.16'],
    mandatorySafeguards: [
      'Continuous log ingestion from all perimeter and core banking workloads',
      'Real-time automated alerting for credential stuffing and privilege escalation',
      '90-day hot log retention with WORM cryptographic immutability'
    ],
    recommendedCadence: 'Continuous Telemetry',
    rationale: 'Fulfills MAS TRM Section 11 surveillance standards and ISO A.8.16 security logging.',
    potentialReadinessUplift: 19
  },
  'MAS-TRM-12.1': {
    templateId: 'tmpl-dr-rto-failover',
    title: 'Annual Critical Business Service RTO (<= 4 hrs) Disaster Recovery Failover Attestation',
    suggestedFileName: 'Disaster_Recovery_Failover_Test_RTO_Signoff_2026.pdf',
    suggestedFileType: 'application/pdf',
    department: 'Infrastructure & BCP',
    controlCode: 'A.5.23',
    tags: ['Disaster Recovery', 'RTO <= 4 hrs', 'Notice 644 Para 4.1', 'Failover Test', 'Annex A.5.23'],
    mandatorySafeguards: [
      'End-to-end unannounced failover test to secondary data center / availability zone',
      'Demonstrated RTO <= 4 hours and RPO <= 2 hours for all designated critical systems',
      'Formal sign-off by Chief Technology Officer and Head of Business Continuity'
    ],
    recommendedCadence: 'Annual',
    rationale: 'Directly proves compliance with statutory requirement MAS Notice 644 Para 4.1 (Critical Systems RTO).',
    potentialReadinessUplift: 25
  },
  'MAS-TRM-13.1': {
    templateId: 'tmpl-online-banking-waf',
    title: 'Web Application Firewall (WAF) & Client Anti-Tamper Protection Attestation',
    suggestedFileName: 'Cloudflare_WAF_Bot_Defense_Certification.pdf',
    suggestedFileType: 'application/pdf',
    department: 'Network & Cloud Infrastructure',
    controlCode: 'A.8.26',
    tags: ['WAF', 'Client Defense', 'Anti-Tamper', 'Online Services', 'Annex A.8.26'],
    mandatorySafeguards: [
      'Active layer 7 WAF inspection blocking OWASP Top 10 web injection vectors',
      'Client-side anti-tampering and runtime application self-protection (RASP)',
      'TLS 1.3 enforcement with forward secrecy on all customer-facing endpoints'
    ],
    recommendedCadence: 'Monthly',
    rationale: 'Fulfills MAS TRM Section 13 requirements for public-facing financial digital delivery channels.',
    potentialReadinessUplift: 18
  }
};

// Default template generator for requirements without a custom hardcoded template
function generateDefaultTemplate(req: EnrichedMASRequirement): PrescribedEvidenceTemplate {
  const isoCode = req.crossFrameworkMappings?.iso27001?.[0] || 'A.5.1';
  return {
    templateId: `tmpl-default-${req.requirementCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    title: `${req.title} — Operational Audit Verification Pack`,
    suggestedFileName: `${req.requirementCode.replace(/-/g, '_')}_Audit_Evidence_Pack_2026.pdf`,
    suggestedFileType: 'application/pdf',
    department: req.responsibleRoles?.[0] || 'Information Security & Compliance',
    controlCode: isoCode,
    tags: [req.requirementCode, `Annex ${isoCode}`, 'Compliance Verification', req.domainName],
    mandatorySafeguards: [
      'Formal documented operating procedure and policy standard',
      'Quarterly operational execution evidence and audit logs',
      'Independent control owner validation sign-off'
    ],
    recommendedCadence: 'Quarterly',
    rationale: `Fulfills MAS TRM ${req.requirementCode} and aligned ISO 27001 ${isoCode} supervisory mandates.`,
    potentialReadinessUplift: 16
  };
}

/**
 * Calculates a match score (0 - 100) between an EvidenceRecord and a target requirement
 */
export function evaluateEvidenceMatch(
  evidence: EvidenceRecord,
  requirement: EnrichedMASRequirement,
  linkedEvidenceIds: string[] = []
): EvidenceVaultMatch | null {
  const reqIsoCodes = (requirement.crossFrameworkMappings?.iso27001 || []).map((c) => c.toLowerCase());
  const evControl = (evidence.controlCode || '').toLowerCase();
  const evIsoReqs = (evidence.isoRequirements || []).map((c) => c.toLowerCase());

  let score = 0;
  const keywordMatches: string[] = [];
  const tagMatches: string[] = [];
  let controlCodeMatch = false;
  let matchedIso: string | undefined;

  // 1. Control Code & Framework Crosswalk Matching (+35 pts)
  for (const iso of reqIsoCodes) {
    if (evControl.includes(iso) || evIsoReqs.some((ir) => ir.includes(iso))) {
      controlCodeMatch = true;
      matchedIso = iso.toUpperCase();
      score += 35;
      break;
    }
  }

  // Also check if control code starts with same annex family (e.g. A.5, A.8) (+15 pts fallback)
  if (!controlCodeMatch && reqIsoCodes.length > 0) {
    const reqFamily = reqIsoCodes[0].split('.')[0] + '.' + reqIsoCodes[0].split('.')[1];
    if (evControl.startsWith(reqFamily.toLowerCase())) {
      score += 15;
      matchedIso = `${reqFamily.toUpperCase()} Family`;
    }
  }

  // 2. High-Value Cyber Security Keyword Intersection (+25 pts)
  const corpus = `${evidence.title} ${evidence.fileName} ${evidence.documentExcerpt || ''} ${(evidence.tags || []).join(' ')}`.toLowerCase();
  const reqText = `${requirement.title} ${requirement.statement} ${requirement.intentAndGuidance}`.toLowerCase();

  const domainKeywords: Record<string, string[]> = {
    '8.1': ['mfa', 'multi-factor', 'privileged', 'pam', 'okta', 'azure ad', 'recertification', 'access review', 'rbac'],
    '8.2': ['dual-control', 'four-eyes', 'separation of duties', 'approval ledger', 'sign-off'],
    '8.3': ['vulnerability', 'patch', 'cve', 'crest', 'pentest', 'penetration test', 'tenable', 'qualys'],
    '12.1': ['disaster recovery', 'failover', 'rto', 'bcp', 'business continuity', 'critical system'],
    '5.1': ['vendor', 'supplier', 'third-party', 'soc 2', 'outsourcing', 'due diligence'],
    '7.1': ['firewall', 'zero trust', 'microsegmentation', 'dmz', 'perimeter', 'network'],
    '9.1': ['kms', 'encryption', 'hsm', 'aes-256', 'key rotation', 'envelope encryption'],
    '10.1': ['incident response', 'tabletop', 'drill', 'breach', '1-hour', 'playbook'],
    '11.1': ['siem', 'soc', 'monitoring', 'telemetry', 'splunk', 'datadog', 'alert'],
    '6.1': ['devsecops', 'sast', 'dast', 'ci/cd', 'code review', 'pipeline'],
    '3.1': ['board', 'committee', 'governance', 'policy', 'oversight', 'minutes']
  };

  const domainSuffix = requirement.requirementCode.replace('MAS-TRM-', '');
  const targetKeywords = domainKeywords[domainSuffix] || [];

  targetKeywords.forEach((kw) => {
    if (corpus.includes(kw)) {
      keywordMatches.push(kw);
      score += 6;
    }
  });

  // Generic keyword intersection with requirement title
  const titleTokens = requirement.title.toLowerCase().split(/\s+/).filter((t) => t.length > 4);
  titleTokens.forEach((token) => {
    if (corpus.includes(token) && !keywordMatches.includes(token)) {
      keywordMatches.push(token);
      score += 4;
    }
  });

  // 3. Tag Alignment (+20 pts)
  const evTags = (evidence.tags || []).map((t) => t.toLowerCase());
  if (evTags.some((t) => t.includes(requirement.requirementCode.toLowerCase()))) {
    tagMatches.push(requirement.requirementCode);
    score += 20;
  }
  if (evTags.some((t) => t.includes('notice 655') && requirement.requirementCode.startsWith('MAS-TRM-8'))) {
    tagMatches.push('Notice 655');
    score += 15;
  }
  if (evTags.some((t) => t.includes('notice 644') && requirement.requirementCode.startsWith('MAS-TRM-12'))) {
    tagMatches.push('Notice 644');
    score += 15;
  }
  if (evTags.some((t) => t.includes('access review') && requirement.requirementCode.startsWith('MAS-TRM-8.1'))) {
    tagMatches.push('Access Review');
    score += 10;
  }
  if (evTags.some((t) => t.includes('bcp') && requirement.requirementCode.startsWith('MAS-TRM-12'))) {
    tagMatches.push('BCP');
    score += 10;
  }

  // 4. Department / Role Synergy (+10 pts)
  let departmentAlignment = false;
  const evDept = (evidence.department || '').toLowerCase();
  if (requirement.responsibleRoles.some((role) => evDept.includes(role.toLowerCase()) || role.toLowerCase().includes(evDept))) {
    departmentAlignment = true;
    score += 10;
  }

  // 5. Verification Status Weighting (+10 pts)
  let verificationBonus = 0;
  if (evidence.verificationState === 'Verified' || evidence.status === 'Verified') {
    verificationBonus = 10;
    score += 10;
  } else if (evidence.verificationState === 'Pending Review' || evidence.status === 'Pending Review') {
    verificationBonus = 5;
    score += 5;
  }

  // Cap score at 98% (reserving 100% for human validation)
  const confidenceScore = Math.min(98, Math.max(0, Math.round(score)));

  // Minimum threshold: only return matches with at least 35% confidence
  if (confidenceScore < 35) {
    return null;
  }

  let confidenceLevel: RecommendationConfidenceLevel = 'SUPPLEMENTARY';
  if (confidenceScore >= 75) confidenceLevel = 'HIGH_CONFIDENCE';
  else if (confidenceScore >= 55) confidenceLevel = 'MODERATE_CONFIDENCE';

  // Determine Action
  const isAlreadyLinked = linkedEvidenceIds.includes(evidence.id) ||
    (requirement.associatedEvidence || []).some((e) => e.id === evidence.id);

  let recommendedAction: EvidenceVaultMatch['recommendedAction'] = 'LINK_EXISTING_EVIDENCE';
  if (isAlreadyLinked) {
    recommendedAction = 'ALREADY_LINKED';
  } else if (evidence.status === 'Draft' || evidence.status === 'Requires Update') {
    recommendedAction = 'REQUEST_VERIFICATION_REFRESH';
  }

  // Generate Gap Bridging Rationale
  let gapBridgingRationale = '';
  if (matchedIso && controlCodeMatch) {
    gapBridgingRationale = `Direct control match for ISO ${matchedIso}. Bridges the supervisory gap by satisfying supervisory mandates under ${requirement.requirementCode}.`;
  } else if (keywordMatches.length > 0) {
    gapBridgingRationale = `Strong semantic alignment covering ${keywordMatches.slice(0, 3).join(', ')}. Provides primary audit proof to satisfy ${requirement.title}.`;
  } else {
    gapBridgingRationale = `Supporting operational artifact providing corroborating assurance for ${requirement.domainName}.`;
  }

  // Calculate projected readiness uplift
  let projectedReadinessUplift = 12;
  if (confidenceScore >= 80) projectedReadinessUplift = 22;
  else if (confidenceScore >= 60) projectedReadinessUplift = 16;
  if (evidence.verificationState !== 'Verified') {
    projectedReadinessUplift = Math.round(projectedReadinessUplift * 0.7);
  }

  return {
    evidence,
    confidenceScore,
    confidenceLevel,
    matchingFactors: {
      controlCodeMatch,
      isoControlMatched: matchedIso,
      keywordMatches,
      tagMatches,
      departmentAlignment,
      verificationStatusBonus: verificationBonus
    },
    gapBridgingRationale,
    projectedReadinessUplift,
    recommendedAction
  };
}

/**
 * Main Engine: Evaluates a single requirement and derives gap recommendations
 */
export function generateRequirementGapRecommendation(
  req: EnrichedMASRequirement,
  allVaultEvidence: EvidenceRecord[],
  linkedEvidenceIds: string[] = []
): RequirementGapRecommendation | null {
  // Only process requirements flagged as Deficient or Pending Evidence
  if (req.complianceStatusBadge !== 'Deficient' && req.complianceStatusBadge !== 'Pending Evidence') {
    return null;
  }

  // 1. Identify primary deficiency reason
  let primaryDeficiencyReason = '';
  if (req.complianceStatusBadge === 'Deficient') {
    if (req.openFindings.some((f) => f.severity === 'Major Non-Conformity')) {
      const major = req.openFindings.find((f) => f.severity === 'Major Non-Conformity')!;
      primaryDeficiencyReason = `Active Major Non-Conformity: ${major.title}`;
    } else if (req.readinessScore < 50) {
      primaryDeficiencyReason = `Low control effectiveness maturity (${req.readinessScore}% readiness) with unresolved deficiency findings.`;
    } else {
      primaryDeficiencyReason = 'Identified control gap under supervisory regulatory assessment.';
    }
  } else {
    primaryDeficiencyReason = 'Zero verified auditor-grade artifacts currently mapped in the central EvidenceVault.';
  }

  // 2. Identify statutory mandate note
  let statutoryMandateNote = 'MAS TRM 2021 Guidelines Baseline Requirement';
  if (req.statutoryMandateType === 'NOTICE_655_CYBER_HYGIENE') {
    statutoryMandateNote = 'MAS Notice 655 Statutory Cyber Hygiene (Strict Statutory Penalty)';
  } else if (req.statutoryMandateType === 'NOTICE_644_CRITICAL_SYSTEMS') {
    statutoryMandateNote = 'MAS Notice 644 Critical Systems Resilience Mandate (RTO <= 4 hrs)';
  } else if (req.statutoryMandateType === 'OUTSOURCING_MANDATE') {
    statutoryMandateNote = 'MAS Guidelines on Outsourcing (Mandatory Annual Audit Validation)';
  }

  // 3. Scan all vault evidence items
  const matches: EvidenceVaultMatch[] = [];
  allVaultEvidence.forEach((ev) => {
    const match = evaluateEvidenceMatch(ev, req, linkedEvidenceIds);
    if (match) {
      matches.push(match);
    }
  });

  // Sort matches by confidence score descending, unlinked first
  matches.sort((a, b) => {
    if (a.recommendedAction === 'LINK_EXISTING_EVIDENCE' && b.recommendedAction === 'ALREADY_LINKED') return -1;
    if (b.recommendedAction === 'LINK_EXISTING_EVIDENCE' && a.recommendedAction === 'ALREADY_LINKED') return 1;
    return b.confidenceScore - a.confidenceScore;
  });

  const topMatch = matches.length > 0 ? matches[0] : undefined;

  // 4. Prescribed catalog template
  const prescribedTemplate = DOMAIN_EVIDENCE_TEMPLATES[req.requirementCode] || generateDefaultTemplate(req);

  // 5. Overall Gap Bridgeability
  let overallGapBridgeability: RequirementGapRecommendation['overallGapBridgeability'] = 'COLLECTION_NEEDED';
  if (topMatch && topMatch.recommendedAction === 'LINK_EXISTING_EVIDENCE' && topMatch.confidenceScore >= 65) {
    overallGapBridgeability = 'IMMEDIATE_VAULT_WIN';
  } else if (topMatch && topMatch.recommendedAction === 'REQUEST_VERIFICATION_REFRESH') {
    overallGapBridgeability = 'REFRESH_REQUIRED';
  }

  return {
    requirementCode: req.requirementCode,
    requirementTitle: req.title,
    domainNumber: req.domainNumber,
    domainName: req.domainName,
    complianceStatus: req.complianceStatusBadge,
    riskTier: req.riskTier,
    readinessScore: req.readinessScore,
    openFindingsCount: req.openFindings.length,
    primaryDeficiencyReason,
    statutoryMandateNote,
    matchedVaultItems: matches,
    topMatch,
    prescribedTemplate,
    overallGapBridgeability
  };
}

/**
 * Executive Aggregator: Generates complete gap remediation portfolio across all requirements
 */
export function generateExecutiveGapRemediationSummary(
  enrichedRequirements: EnrichedMASRequirement[],
  allVaultEvidence: EvidenceRecord[],
  masAssessments: MASRequirementAssessmentRecord[]
): ExecutiveGapRemediationSummary {
  const recommendations: RequirementGapRecommendation[] = [];

  enrichedRequirements.forEach((req) => {
    const assess = masAssessments.find(
      (a) => a.requirementCode === req.requirementCode || a.id.includes(req.requirementCode)
    );
    const linkedEvidenceIds = assess?.linkedEvidenceIds || [];

    const rec = generateRequirementGapRecommendation(req, allVaultEvidence, linkedEvidenceIds);
    if (rec) {
      recommendations.push(rec);
    }
  });

  // Sort recommendations: High risk first, then by lowest readiness score
  recommendations.sort((a, b) => {
    if (a.riskTier === 'HIGH_RISK' && b.riskTier !== 'HIGH_RISK') return -1;
    if (b.riskTier === 'HIGH_RISK' && a.riskTier !== 'HIGH_RISK') return 1;
    return a.readinessScore - b.readinessScore;
  });

  const totalDeficient = recommendations.filter((r) => r.complianceStatus === 'Deficient').length;
  const totalPending = recommendations.filter((r) => r.complianceStatus === 'Pending Evidence').length;
  const totalBridgeable = recommendations.filter((r) => r.overallGapBridgeability === 'IMMEDIATE_VAULT_WIN').length;
  const totalNeedingCollection = recommendations.filter((r) => r.overallGapBridgeability === 'COLLECTION_NEEDED').length;

  // Projected average readiness increase across deficient/pending requirements if recommendations applied
  const totalProjectedUplift = recommendations.reduce((acc, r) => {
    const uplift = r.topMatch ? r.topMatch.projectedReadinessUplift : r.prescribedTemplate.potentialReadinessUplift;
    return acc + uplift;
  }, 0);

  const projectedAverageReadinessIncrease =
    recommendations.length > 0 ? Math.round(totalProjectedUplift / recommendations.length) : 0;

  return {
    totalDeficientRequirements: totalDeficient,
    totalPendingEvidenceRequirements: totalPending,
    totalBridgeableWithVault: totalBridgeable,
    totalNeedingCollection: totalNeedingCollection,
    projectedAverageReadinessIncrease,
    recommendations
  };
}
