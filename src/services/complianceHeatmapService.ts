// Skanda GRC — Compliance Heatmap Data & Calculation Service
// Provides multi-dimensional risk coverage matrix across:
// 1. Departments vs. ISO 27001:2022 Clauses (Cl. 4-10) & Annex A Themes (A.5-A.8)
// 2. Departments vs. MAS TRM Modules / Domains (DOM 3.0 to 16.0)
// 3. Departments vs. ISO 27701:2019 PIMS Extension (Cl. 5-6 & Annex A/B)
// 4. Cross-Framework Harmonization Matrix (ISO 27001 × MAS TRM)
// Includes color-coded intensity calculations (Red < 50%, Yellow 50-84%, Green >= 85%)

import { HEATMAP_PIMS_CLAUSES, HeatmapPIMSClause } from '../data/iso27701MasterData';

export type HeatmapStatus = 'COMPLIANT' | 'IN_PROGRESS' | 'NON_COMPLIANT' | 'NOT_APPLICABLE';
export type RiskSeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export { HEATMAP_PIMS_CLAUSES, type HeatmapPIMSClause };

export interface HeatmapDepartment {
  id: string;
  name: string;
  shortName: string;
  head: string;
  email: string;
  headcount: number;
  criticalSystemsCount: number;
  avatarColor: string;
}

export interface HeatmapISOClause {
  id: string;
  clauseCode: string;
  title: string;
  shortTitle: string;
  type: 'MANDATORY_CLAUSE' | 'ANNEX_A_THEME';
  totalControls: number;
  mandatory: boolean;
  standardRef: string;
  description: string;
}

export interface ISOClauseInherentRisk {
  clauseCode: string;
  title: string;
  shortTitle: string;
  inherentRiskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  inherentRiskWeight: number; // Multiplier: e.g. 0.8x to 2.0x
  exposureIndex: number; // Baseline threat exposure (0-100)
  threatCategory: string;
  auditSeverity: string;
  threatDescription: string;
}

export interface HeatmapMASModule {
  id: string;
  domainNumber: string;
  title: string;
  shortTitle: string;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  totalRequirements: number;
  statutorySla?: string;
  description: string;
}

export interface HeatmapCellControlItem {
  code: string;
  title: string;
  status: HeatmapStatus;
  mandatory: boolean;
  evidenceRef?: string;
  description?: string;
  nonComplianceReason?: string;
  remediationSlaDays?: number;
  assignedLead?: string;
}

export interface HeatmapCellTask {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  assignee: string;
  dueDate: string;
  relatedControlCode: string;
  capaRef?: string;
  daysOutstanding: number;
}

export interface HeatmapCellFinding {
  code: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  daysOpen: number;
  capaStatus: 'OPEN' | 'REMEDIATION_IN_PROGRESS' | 'UNDER_AUDIT_REVIEW';
}

export interface HeatmapCellEvidence {
  id: string;
  name: string;
  type: string;
  verifiedAt: string;
  sha256Digest: string;
}

export interface HeatmapCellData {
  id: string;
  departmentId: string;
  departmentName: string;
  dimensionType: 'ISO_27001' | 'MAS_TRM' | 'ISO_27701';
  targetCode: string;
  targetTitle: string;
  score: number; // 0 - 100 (current assessment score)
  previousScore?: number; // 0 - 100 (score at previous audit cycle)
  scoreDelta?: number; // score - previousScore
  trend?: 'UP' | 'DOWN' | 'STABLE'; // Trend status relative to previous audit
  previousAssessedAt?: string; // Date of prior assessment cycle
  historicalScores?: number[]; // Historical scores across past audit cycles for sparkline visualization
  status: HeatmapStatus;
  riskLevel: RiskSeverityLevel;
  controlsTotal: number;
  controlsImplemented: number;
  controlsInProgress: number;
  controlsNonCompliant: number;
  openFindingsCount: number;
  openRisksCount: number;
  keyControls: HeatmapCellControlItem[];
  outstandingTasks?: HeatmapCellTask[];
  topFindings: HeatmapCellFinding[];
  evidenceArtifacts: HeatmapCellEvidence[];
  controlOwner: string;
  auditorSignoff: boolean;
  lastAssessedAt: string;
  complianceNotes: string;
}

export interface CrosswalkCellData {
  id: string;
  isoClauseCode: string;
  isoClauseTitle: string;
  masDomainNumber: string;
  masDomainTitle: string;
  overlapScore: number; // 0-100 harmonized coverage
  status: HeatmapStatus;
  riskLevel: RiskSeverityLevel;
  harmonizedControlsCount: number;
  jointGapsCount: number;
  auditCoverageStatus: 'FULL_COVERAGE' | 'PARTIAL_GAP' | 'REGULATORY_BREACH_RISK';
  recommendedAction: string;
}

export interface HeatmapMatrixMetrics {
  totalNodes: number;
  compliantCount: number;
  inProgressCount: number;
  nonCompliantCount: number;
  notApplicableCount: number;
  averageScore: number;
  criticalRiskNodesCount: number;
  highRiskNodesCount: number;
  mediumRiskNodesCount: number;
  lowRiskNodesCount: number;
  totalOpenFindings: number;
}

// 7 Key Operational Departments
export const HEATMAP_DEPARTMENTS: HeatmapDepartment[] = [
  {
    id: 'dept-devops',
    name: 'Engineering & DevOps',
    shortName: 'Eng / DevOps',
    head: 'Vikram Patel',
    email: 'v.patel@apexfintech.com',
    headcount: 42,
    criticalSystemsCount: 8,
    avatarColor: 'bg-indigo-600'
  },
  {
    id: 'dept-infra',
    name: 'IT Infrastructure & Cloud Ops',
    shortName: 'IT & Cloud',
    head: 'Sarah Chen',
    email: 's.chen@apexfintech.com',
    headcount: 28,
    criticalSystemsCount: 14,
    avatarColor: 'bg-sky-600'
  },
  {
    id: 'dept-finance',
    name: 'Finance, Payments & Treasury',
    shortName: 'Finance',
    head: 'Marcus Aurelius',
    email: 'm.aurelius@apexfintech.com',
    headcount: 19,
    criticalSystemsCount: 5,
    avatarColor: 'bg-emerald-600'
  },
  {
    id: 'dept-hr',
    name: 'Human Resources & People',
    shortName: 'HR & People',
    head: 'Priya Sharma',
    email: 'p.sharma@apexfintech.com',
    headcount: 14,
    criticalSystemsCount: 2,
    avatarColor: 'bg-purple-600'
  },
  {
    id: 'dept-procurement',
    name: 'Procurement & Vendor Supply Chain',
    shortName: 'Procurement',
    head: 'David Tan',
    email: 'd.tan@apexfintech.com',
    headcount: 11,
    criticalSystemsCount: 4,
    avatarColor: 'bg-amber-600'
  },
  {
    id: 'dept-legal',
    name: 'Legal, Risk & Regulatory Compliance',
    shortName: 'Legal & Risk',
    head: 'Elena Rostova',
    email: 'e.rostova@apexfintech.com',
    headcount: 9,
    criticalSystemsCount: 3,
    avatarColor: 'bg-rose-600'
  },
  {
    id: 'dept-product',
    name: 'Product & Customer Data Analytics',
    shortName: 'Product / Data',
    head: 'Alex Mercer',
    email: 'a.mercer@apexfintech.com',
    headcount: 22,
    criticalSystemsCount: 6,
    avatarColor: 'bg-teal-600'
  }
];

// ISO 27001 Clauses (4-10) and Annex A Themes (A.5-A.8)
export const HEATMAP_ISO_CLAUSES: HeatmapISOClause[] = [
  {
    id: 'iso-cl4',
    clauseCode: 'Clause 4',
    title: 'Context of Organization & ISMS Scope',
    shortTitle: 'Cl. 4 Context',
    type: 'MANDATORY_CLAUSE',
    totalControls: 4,
    mandatory: true,
    standardRef: 'ISO 27001:2022 §4.1-4.4',
    description: 'Internal & external issues, stakeholder requirements, and defined organizational ISMS boundary.'
  },
  {
    id: 'iso-cl5',
    clauseCode: 'Clause 5',
    title: 'Leadership, Commitment & Policy',
    shortTitle: 'Cl. 5 Leadership',
    type: 'MANDATORY_CLAUSE',
    totalControls: 3,
    mandatory: true,
    standardRef: 'ISO 27001:2022 §5.1-5.3',
    description: 'Executive sponsorship, approved security policies, and defined GRC roles & responsibilities.'
  },
  {
    id: 'iso-cl6',
    clauseCode: 'Clause 6',
    title: 'Planning, Risk Assessment & Treatment',
    shortTitle: 'Cl. 6 Planning/Risk',
    type: 'MANDATORY_CLAUSE',
    totalControls: 5,
    mandatory: true,
    standardRef: 'ISO 27001:2022 §6.1-6.3',
    description: 'Dynamic risk identification, SoA justification verifier, and information security objectives.'
  },
  {
    id: 'iso-cl7',
    clauseCode: 'Clause 7',
    title: 'Support, Resources & Awareness',
    shortTitle: 'Cl. 7 Support/Aware',
    type: 'MANDATORY_CLAUSE',
    totalControls: 5,
    mandatory: true,
    standardRef: 'ISO 27001:2022 §7.1-7.5',
    description: 'Staff training, Phishing simulations, competence records, and documented information control.'
  },
  {
    id: 'iso-cl8',
    clauseCode: 'Clause 8',
    title: 'Operation & Control Execution',
    shortTitle: 'Cl. 8 Operation',
    type: 'MANDATORY_CLAUSE',
    totalControls: 4,
    mandatory: true,
    standardRef: 'ISO 27001:2022 §8.1-8.3',
    description: 'Operational risk assessment, implementation of controls, and outsourced process control.'
  },
  {
    id: 'iso-cl9',
    clauseCode: 'Clause 9',
    title: 'Performance Evaluation & Internal Audit',
    shortTitle: 'Cl. 9 Evaluation/Audit',
    type: 'MANDATORY_CLAUSE',
    totalControls: 3,
    mandatory: true,
    standardRef: 'ISO 27001:2022 §9.1-9.3',
    description: 'Continuous monitoring metrics, scheduled internal audits, and executive management reviews.'
  },
  {
    id: 'iso-cl10',
    clauseCode: 'Clause 10',
    title: 'Improvement, Nonconformity & CAPA',
    shortTitle: 'Cl. 10 CAPA',
    type: 'MANDATORY_CLAUSE',
    totalControls: 2,
    mandatory: true,
    standardRef: 'ISO 27001:2022 §10.1-10.2',
    description: 'Continual improvement loops, root cause investigation, and corrective action workflows.'
  },
  {
    id: 'iso-a5',
    clauseCode: 'Annex A.5',
    title: 'Organizational Controls (37 Controls)',
    shortTitle: 'A.5 Org Controls',
    type: 'ANNEX_A_THEME',
    totalControls: 37,
    mandatory: false,
    standardRef: 'ISO 27001:2022 Annex A.5',
    description: 'Policies, access control, asset inventory, supplier agreements, and cloud service management.'
  },
  {
    id: 'iso-a6',
    clauseCode: 'Annex A.6',
    title: 'People Controls (8 Controls)',
    shortTitle: 'A.6 People Controls',
    type: 'ANNEX_A_THEME',
    totalControls: 8,
    mandatory: false,
    standardRef: 'ISO 27001:2022 Annex A.6',
    description: 'Screening, employment terms, confidentiality agreements, and remote working guidelines.'
  },
  {
    id: 'iso-a7',
    clauseCode: 'Annex A.7',
    title: 'Physical Controls (14 Controls)',
    shortTitle: 'A.7 Physical Controls',
    type: 'ANNEX_A_THEME',
    totalControls: 14,
    mandatory: false,
    standardRef: 'ISO 27001:2022 Annex A.7',
    description: 'Physical perimeter security, secure offices, clear desk/screen, and equipment disposal.'
  },
  {
    id: 'iso-a8',
    clauseCode: 'Annex A.8',
    title: 'Technological Controls (34 Controls)',
    shortTitle: 'A.8 Tech Controls',
    type: 'ANNEX_A_THEME',
    totalControls: 34,
    mandatory: false,
    standardRef: 'ISO 27001:2022 Annex A.8',
    description: 'Endpoint security, malware defense, DLP, cryptography, network filtering, and secure coding.'
  }
];

// MAS TRM Modules / Domains (3.0 to 16.0)
export const HEATMAP_MAS_MODULES: HeatmapMASModule[] = [
  {
    id: 'mas-dom-03',
    domainNumber: 'DOM-03',
    title: 'Technology Risk Governance',
    shortTitle: '3.0 Governance',
    criticality: 'CRITICAL',
    totalRequirements: 6,
    description: 'Board and Senior Management oversight, IT Strategy Committee, and executive accountability.'
  },
  {
    id: 'mas-dom-04',
    domainNumber: 'DOM-04',
    title: 'Technology Risk Management Framework',
    shortTitle: '4.0 TRM Framework',
    criticality: 'CRITICAL',
    totalRequirements: 5,
    description: 'Enterprise TRMF, risk appetite quantification, and continuous risk assessment.'
  },
  {
    id: 'mas-dom-05',
    domainNumber: 'DOM-05',
    title: 'IT Project Management & Acquisition',
    shortTitle: '5.0 Project Mgmt',
    criticality: 'MEDIUM',
    totalRequirements: 5,
    description: 'Project governance, quality assurance, milestone gating, and vendor package validation.'
  },
  {
    id: 'mas-dom-06',
    domainNumber: 'DOM-06',
    title: 'Software Development Life Cycle (SDLC)',
    shortTitle: '6.0 Secure SDLC',
    criticality: 'CRITICAL',
    totalRequirements: 7,
    description: 'Secure coding, automated SAST/DAST pipelines, SCA dependency scans, and environment isolation.'
  },
  {
    id: 'mas-dom-07',
    domainNumber: 'DOM-07',
    title: 'Service Delivery & Capacity Management',
    shortTitle: '7.0 Service Capacity',
    criticality: 'HIGH',
    totalRequirements: 5,
    description: 'Workload forecasting, threshold alerting, stress testing, and cloud elasticity verification.'
  },
  {
    id: 'mas-dom-08',
    domainNumber: 'DOM-08',
    title: 'System Architecture & Virtualization',
    shortTitle: '8.0 Architecture',
    criticality: 'HIGH',
    totalRequirements: 6,
    description: 'Hardening benchmarks (CIS Level 2), container security, zero trust, and hypervisor isolation.'
  },
  {
    id: 'mas-dom-09',
    domainNumber: 'DOM-09',
    title: 'Network & Communication Security',
    shortTitle: '9.0 Network Sec',
    criticality: 'CRITICAL',
    totalRequirements: 7,
    description: 'DMZ architecture, micro-segmentation, next-gen firewalls, and encrypted communication.'
  },
  {
    id: 'mas-dom-10',
    domainNumber: 'DOM-10',
    title: 'Access Control & Privileged Identity (PIM)',
    shortTitle: '10.0 Access & PIM',
    criticality: 'CRITICAL',
    totalRequirements: 8,
    description: 'MFA enforcement, Just-In-Time session recording, least privilege, and quarterly entitlement reviews.'
  },
  {
    id: 'mas-dom-11',
    domainNumber: 'DOM-11',
    title: 'Data Loss Prevention & Cryptography',
    shortTitle: '11.0 DLP & Crypto',
    criticality: 'CRITICAL',
    totalRequirements: 6,
    description: 'FIPS 140-3 HSM key management, AES-256 at rest, TLS 1.3 in transit, and endpoint DLP agents.'
  },
  {
    id: 'mas-dom-12',
    domainNumber: 'DOM-12',
    title: 'Cybersecurity Operations & Threat Hunting',
    shortTitle: '12.0 Cyber Ops/SOC',
    criticality: 'CRITICAL',
    totalRequirements: 7,
    description: '24/7 SIEM correlation, threat intelligence feeds, automated containment playbooks, and EDR.'
  },
  {
    id: 'mas-dom-13',
    domainNumber: 'DOM-13',
    title: 'Security Testing, VAPT & Red Teaming',
    shortTitle: '13.0 VAPT/RedTeam',
    criticality: 'HIGH',
    totalRequirements: 5,
    description: 'Annual independent CREST-certified penetration testing and adversary simulation drills.'
  },
  {
    id: 'mas-dom-14',
    domainNumber: 'DOM-14',
    title: 'Technology Refresh & Patch Management',
    shortTitle: '14.0 Patch & Refresh',
    criticality: 'HIGH',
    totalRequirements: 6,
    description: '14-day statutory patch SLA for critical zero-days and legacy system decommissioning.'
  },
  {
    id: 'mas-dom-15',
    domainNumber: 'DOM-15',
    title: 'Incident Management & 1-Hour MAS SLA',
    shortTitle: '15.0 Incident / SLA',
    criticality: 'CRITICAL',
    totalRequirements: 6,
    statutorySla: '1-Hour Statutory Notice',
    description: '1-hour regulatory breach notification to MAS, containment procedures, and post-incident forensic reviews.'
  },
  {
    id: 'mas-dom-16',
    domainNumber: 'DOM-16',
    title: 'Business Continuity & Disaster Recovery',
    shortTitle: '16.0 BCM / DR',
    criticality: 'CRITICAL',
    totalRequirements: 6,
    statutorySla: 'RTO <= 4h, RPO <= 1h',
    description: 'Maximum 4-hour RTO, 1-hour RPO for critical systems, annual failover drills, and dual-site sync.'
  }
];

// Authoritative ISO 27001:2022 Inherent Risk Weighting Baseline
// Reflects operational exploitability, systemic blast radius, and external audit scrutiny
export const DEFAULT_ISO_INHERENT_RISKS: Record<string, ISOClauseInherentRisk> = {
  'Clause 4': {
    clauseCode: 'Clause 4',
    title: 'Context of Organization & ISMS Scope',
    shortTitle: 'Cl. 4 Context',
    inherentRiskLevel: 'LOW',
    inherentRiskWeight: 0.9,
    exposureIndex: 35,
    threatCategory: 'Scope Governance & Boundary Blindspots',
    auditSeverity: 'Low Severity — Procedural boundary definition',
    threatDescription: 'Omission of external digital assets, APIs, third-party hosting, or business units from formal ISMS certification scope.'
  },
  'Clause 5': {
    clauseCode: 'Clause 5',
    title: 'Leadership, Commitment & Policy',
    shortTitle: 'Cl. 5 Leadership',
    inherentRiskLevel: 'MEDIUM',
    inherentRiskWeight: 1.1,
    exposureIndex: 60,
    threatCategory: 'Executive Oversight & Resource Deficits',
    auditSeverity: 'Medium Severity — Management commitment & unfunded security mandate',
    threatDescription: 'Absence of C-suite sponsorship, unenforced information security policies, and unassigned GRC roles.'
  },
  'Clause 6': {
    clauseCode: 'Clause 6',
    title: 'Planning, Risk Assessment & Treatment',
    shortTitle: 'Cl. 6 Planning/Risk',
    inherentRiskLevel: 'HIGH',
    inherentRiskWeight: 1.5,
    exposureIndex: 85,
    threatCategory: 'Systemic Risk Blindspots & Treatment Failures',
    auditSeverity: 'High Severity — Flawed risk appetite matrix or unmitigated critical vulnerabilities',
    threatDescription: 'Flawed threat methodology, out-of-date Statement of Applicability (SoA), or untreated critical residual cyber exposures.'
  },
  'Clause 7': {
    clauseCode: 'Clause 7',
    title: 'Support, Resources & Awareness',
    shortTitle: 'Cl. 7 Support/Aware',
    inherentRiskLevel: 'LOW',
    inherentRiskWeight: 0.9,
    exposureIndex: 40,
    threatCategory: 'Personnel Training & Documentation Deficits',
    auditSeverity: 'Low Severity — Training record gaps and uncalibrated phishing simulations',
    threatDescription: 'Workforce security awareness gaps, unverified personnel certifications, or out-of-date document control registers.'
  },
  'Clause 8': {
    clauseCode: 'Clause 8',
    title: 'Operation & Control Execution',
    shortTitle: 'Cl. 8 Operation',
    inherentRiskLevel: 'HIGH',
    inherentRiskWeight: 1.4,
    exposureIndex: 80,
    threatCategory: 'Operational Drift & Control Bypass',
    auditSeverity: 'High Severity — Operational security breakdowns directly expose production assets',
    threatDescription: 'Failure in day-to-day security operations, emergency change management bypasses, or unmonitored supplier processes.'
  },
  'Clause 9': {
    clauseCode: 'Clause 9',
    title: 'Performance Evaluation & Internal Audit',
    shortTitle: 'Cl. 9 Evaluation/Audit',
    inherentRiskLevel: 'MEDIUM',
    inherentRiskWeight: 1.0,
    exposureIndex: 55,
    threatCategory: 'Audit Blindspots & Governance Decay',
    auditSeverity: 'Medium Severity — Delayed internal audit cycles and skipped management reviews',
    threatDescription: 'Absence of continuous monitoring telemetry, delayed internal audit schedules, or missing board review records.'
  },
  'Clause 10': {
    clauseCode: 'Clause 10',
    title: 'Improvement, Nonconformity & CAPA',
    shortTitle: 'Cl. 10 CAPA',
    inherentRiskLevel: 'MEDIUM',
    inherentRiskWeight: 1.0,
    exposureIndex: 55,
    threatCategory: 'Recurrent Incidents & Stagnant Remediation',
    auditSeverity: 'Medium Severity — Re-occurring audit non-conformities and aged CAPA tickets',
    threatDescription: 'Unresolved root causes, repeated security incident patterns, or overdue auditor non-conformity findings.'
  },
  'Annex A.5': {
    clauseCode: 'Annex A.5',
    title: 'Organizational Controls (37 Controls)',
    shortTitle: 'A.5 Org Controls',
    inherentRiskLevel: 'HIGH',
    inherentRiskWeight: 1.4,
    exposureIndex: 82,
    threatCategory: 'Identity Compromise, Supply Chain & Cloud Governance',
    auditSeverity: 'High Severity — Compromised credentials, vendor breaches, shadow cloud tenants',
    threatDescription: 'Privileged identity sprawl, unvetted SaaS and supply chain vendors, and asset classification gaps.'
  },
  'Annex A.6': {
    clauseCode: 'Annex A.6',
    title: 'People Controls (8 Controls)',
    shortTitle: 'A.6 People Controls',
    inherentRiskLevel: 'MEDIUM',
    inherentRiskWeight: 1.1,
    exposureIndex: 65,
    threatCategory: 'Insider Threat, Social Engineering & Offboarding Leaks',
    auditSeverity: 'Medium Severity — Contractor screening gaps and lingering access tokens',
    threatDescription: 'Incomplete background screening, delayed offboarding access revocation, and remote working policy violations.'
  },
  'Annex A.7': {
    clauseCode: 'Annex A.7',
    title: 'Physical Controls (14 Controls)',
    shortTitle: 'A.7 Physical Controls',
    inherentRiskLevel: 'MEDIUM',
    inherentRiskWeight: 1.0,
    exposureIndex: 50,
    threatCategory: 'Physical Intrusion, Data Center Tampering & Hardware Loss',
    auditSeverity: 'Medium Severity — Server room tailgating, unencrypted lost media, clear desk lapses',
    threatDescription: 'Unauthorized perimeter ingress, unmonitored facility visitors, or insecure physical media disposal.'
  },
  'Annex A.8': {
    clauseCode: 'Annex A.8',
    title: 'Technological Controls (34 Controls)',
    shortTitle: 'A.8 Tech Controls',
    inherentRiskLevel: 'CRITICAL',
    inherentRiskWeight: 1.8,
    exposureIndex: 96,
    threatCategory: 'Exploitation, Zero-Days, Ransomware & Exfiltration',
    auditSeverity: 'Critical Severity — Remote code execution, unencrypted databases, network compromise',
    threatDescription: 'Unpatched critical CVEs, broken encryption at rest/transit, unsegmented flat networks, missing DLP, and insecure APIs.'
  }
};

const LOCAL_STORAGE_CELLS_KEY = 'skanda_compliance_heatmap_cells_v3';
const LOCAL_STORAGE_INHERENT_RISKS_KEY = 'skanda_compliance_heatmap_inherent_risks_v1';

export class ComplianceHeatmapService {
  /**
   * Helper to derive status & risk level from score
   */
  public static deriveStatusFromScore(score: number): HeatmapStatus {
    if (score >= 85) return 'COMPLIANT';
    if (score >= 50) return 'IN_PROGRESS';
    return 'NON_COMPLIANT';
  }

  public static deriveRiskLevel(score: number, criticality?: string): RiskSeverityLevel {
    if (score < 50) {
      return criticality === 'CRITICAL' ? 'CRITICAL' : 'HIGH';
    }
    if (score < 75) {
      return criticality === 'CRITICAL' ? 'HIGH' : 'MEDIUM';
    }
    if (score < 85) {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  /**
   * Generates realistic baseline trend comparison data for a cell
   * Returns deterministic previous assessment score, delta, trend indicator, and prior audit date
   */
  public static calculateBaselineTrend(
    cellId: string,
    targetCode: string,
    deptId: string,
    currentScore: number
  ): {
    previousScore: number;
    scoreDelta: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
    previousAssessedAt: string;
    historicalScores?: number[];
  } {
    let hash = 0;
    const key = `${deptId}#${targetCode}`;
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) - hash + key.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);

    // Realistic variation pattern:
    // Some departments made significant remediation headway (+4% to +12%)
    // Some suffered control drift or newly discovered gaps (-3% to -9%)
    // Some maintained established baseline (0% / stable)
    const pattern = absHash % 10;
    let delta = 0;

    if (pattern === 0 || pattern === 2 || pattern === 5 || pattern === 7) {
      // Improved
      delta = 3 + (absHash % 9);
    } else if (pattern === 1 || pattern === 4 || pattern === 8) {
      // Regressed
      delta = -(3 + (absHash % 8));
    } else {
      // Stable
      delta = 0;
    }

    // Keep previousScore bounded within [15, 98]
    let previousScore = currentScore - delta;
    if (previousScore < 15) {
      previousScore = 15;
      delta = currentScore - previousScore;
    } else if (previousScore > 98) {
      previousScore = 98;
      delta = currentScore - previousScore;
    }

    const trend: 'UP' | 'DOWN' | 'STABLE' = delta > 0 ? 'UP' : delta < 0 ? 'DOWN' : 'STABLE';
    const previousAssessedAt = '2026-05-15'; // Prior Q2 audit cycle

    // 5-point audit history: Q3'25, Q4'25, Q1'26, Q2'26 (previousScore), Q3'26 (currentScore)
    const historicalScores: number[] = [];
    if (trend === 'UP') {
      const p1 = Math.max(15, previousScore - Math.min(16, Math.max(4, Math.round(Math.abs(delta) * 1.4))));
      const p2 = Math.max(15, Math.min(96, Math.round((p1 + previousScore) / 2) - ((absHash % 3) - 1)));
      const p3 = Math.max(15, Math.min(97, Math.round((p2 + previousScore) / 2)));
      historicalScores.push(p1, p2, p3, previousScore, currentScore);
    } else if (trend === 'DOWN') {
      const p1 = Math.min(96, previousScore + Math.min(14, Math.max(3, Math.round(Math.abs(delta) * 1.2))));
      const p2 = Math.min(96, Math.max(20, Math.round((p1 + previousScore) / 2) + ((absHash % 3) - 1)));
      const p3 = Math.min(96, Math.max(18, Math.round((p2 + previousScore) / 2)));
      historicalScores.push(p1, p2, p3, previousScore, currentScore);
    } else {
      const jitter = (absHash % 3) - 1;
      const p1 = Math.max(15, Math.min(98, currentScore - jitter));
      const p2 = Math.max(15, Math.min(98, currentScore + jitter));
      const p3 = Math.max(15, Math.min(98, currentScore - 1));
      historicalScores.push(p1, p2, p3, previousScore, currentScore);
    }

    return {
      previousScore,
      scoreDelta: delta,
      trend,
      previousAssessedAt,
      historicalScores
    };
  }

  /**
   * Generates realistic, clause-specific and department-specific controls and outstanding tasks
   */
  public static generateControlsAndTasksForCell(
    deptId: string,
    deptName: string,
    dimensionType: 'ISO_27001' | 'MAS_TRM' | 'ISO_27701',
    targetCode: string,
    targetTitle: string,
    score: number,
    status: HeatmapStatus,
    owner: string
  ): {
    keyControls: HeatmapCellControlItem[];
    outstandingTasks: HeatmapCellTask[];
    topFindings: HeatmapCellFinding[];
  } {
    let controlSpecs: Array<{ code: string; title: string; desc: string; ncReason: string; mandatory: boolean }> = [];
    let taskSpecs: Array<{ title: string; desc: string; priority: HeatmapCellTask['priority']; daysDue: number; relCode: string }> = [];

    // Detailed templates for ISO Clauses & Annexes
    if (targetCode.includes('4') || targetCode === 'Clause 4') {
      controlSpecs = [
        { code: '4.1', title: 'Understanding Organization & Context', desc: 'Continuous identification of internal and external cybersecurity, technical, and regulatory factors.', ncReason: 'Missing formal context review incorporating recent cross-border data protection changes and AI model hosting risks.', mandatory: true },
        { code: '4.2', title: 'Needs & Expectations of Interested Parties', desc: 'Systematic alignment with MAS, audit committees, and enterprise client security covenants.', ncReason: 'Customer SLA audit covenants not mapped into internal control testing schedules.', mandatory: true },
        { code: '4.3', title: 'Scope of the ISMS', desc: 'Boundaries and applicability of the ISMS across all multi-cloud VPCs and third-party SaaS services.', ncReason: 'ISMS scope boundaries omit recent AWS GovCloud and staging Kubernetes namespaces.', mandatory: true },
        { code: '4.4', title: 'ISMS Governance Process Architecture', desc: 'Integration of ISMS controls into day-to-day agile workflows and release engineering.', ncReason: 'Process architecture lacks documented handoffs between SecOps and product development.', mandatory: false }
      ];
      taskSpecs = [
        { title: `Calibrate ${deptName} Context & Threat Register`, desc: 'Update external regulatory dependencies matrix including MAS Notice 655 and PDPA cross-border mandates.', priority: 'HIGH', daysDue: 7, relCode: '4.1' },
        { title: 'Formalize Annual ISMS Scope Attestation', desc: 'Conduct boundary review to confirm all active microservice clusters and repositories are encompassed in the ISMS scope document.', priority: 'MEDIUM', daysDue: 14, relCode: '4.3' }
      ];
    } else if (targetCode.includes('5') || targetCode === 'Clause 5') {
      controlSpecs = [
        { code: '5.1', title: 'Leadership & Executive Commitment', desc: 'Senior leadership active accountability, resource provisioning, and ISMS steering review.', ncReason: 'Executive steering committee did not conduct mandated quarterly cybersecurity review meeting.', mandatory: true },
        { code: '5.2', title: 'Information Security Policy', desc: 'Approved, published, and communicated enterprise information security charter.', ncReason: 'Department-level policy addendums for AI ethics and remote working overdue for re-attestation.', mandatory: true },
        { code: '5.3', title: 'Roles, Responsibilities & Authorities', desc: 'Clear security assignment across line management, incident response, and audit coordination.', ncReason: 'Secondary incident commander and deputy DPO roles unassigned following team reorganization.', mandatory: true }
      ];
      taskSpecs = [
        { title: 'Secure Executive Signoff on Policy Revisions', desc: 'Obtain formal sign-off from Executive Committee for amended Information Security Policy v3.2.', priority: 'HIGH', daysDue: 5, relCode: '5.2' },
        { title: 'Update Incident Response RACI Matrix', desc: 'Publish updated role assignments and escalations for 24/7 incident response commanders.', priority: 'MEDIUM', daysDue: 10, relCode: '5.3' }
      ];
    } else if (targetCode.includes('6') || targetCode === 'Clause 6') {
      controlSpecs = [
        { code: '6.1.1', title: 'General Risk Management Planning', desc: 'Risk criteria, likelihood-impact scoring matrices, and risk appetite calibration.', ncReason: 'Risk evaluation matrix not calibrated against updated MAS financial loss tolerance thresholds.', mandatory: true },
        { code: '6.1.2', title: 'Information Security Risk Assessment Process', desc: 'Repeatable identification, threat modeling, and residual risk calculation.', ncReason: 'Annual threat risk assessment (TRA) overdue by 45 days for tier-1 customer payment workflows.', mandatory: true },
        { code: '6.1.3', title: 'Information Security Risk Treatment & SoA', desc: 'Statement of Applicability (SoA) justification for Annex A controls and treatment plans.', ncReason: 'Statement of Applicability v2.4 lacks formal justification for excluded technological controls.', mandatory: true },
        { code: '6.2', title: 'Information Security Objectives & KPIs', desc: 'Measurable, time-bound departmental security performance metrics.', ncReason: 'Department security OKRs not established for current fiscal quarter.', mandatory: false }
      ];
      taskSpecs = [
        { title: 'Recalibrate Department Risk Register', desc: 'Execute comprehensive threat modeling sweep for critical assets and compute residual risk scores.', priority: 'CRITICAL', daysDue: 4, relCode: '6.1.2' },
        { title: 'Publish Statement of Applicability (SoA) v3.0', desc: 'Document Annex A.2-A.10 crosswalk citations and justify non-applicable controls for audit sign-off.', priority: 'HIGH', daysDue: 8, relCode: '6.1.3' },
        { title: 'Define Department Security Target KPIs', desc: 'Establish quarterly zero-defect metrics for vulnerability remediation and patch cycle SLAs.', priority: 'MEDIUM', daysDue: 12, relCode: '6.2' }
      ];
    } else if (targetCode.includes('7') || targetCode === 'Clause 7') {
      controlSpecs = [
        { code: '7.2', title: 'Competence & Specialized Certification', desc: 'Verification that personnel performing security-sensitive roles possess verified competence.', ncReason: 'Cloud infrastructure engineers lack verified certifications for zero-trust and IAM architecture.', mandatory: true },
        { code: '7.3', title: 'Security Awareness & Phishing Simulations', desc: 'Mandatory annual training, threat awareness, and targeted phishing simulations.', ncReason: 'Department achieved only 68% completion rate on mandatory anti-phishing simulation refresher.', mandatory: true },
        { code: '7.5.1', title: 'Control of Documented Information', desc: 'Document lifecycle, cryptographic watermarking, and access-controlled distribution.', ncReason: 'Security operational runbooks stored in unversioned Confluence wiki without access restrictions.', mandatory: false }
      ];
      taskSpecs = [
        { title: 'Remediate Failed Phishing Simulation Participants', desc: 'Deploy automated 15-minute micro-training to 24 employees who clicked simulated credential harvest links.', priority: 'HIGH', daysDue: 6, relCode: '7.3' },
        { title: 'Audit ISMS Documentation Access Permissions', desc: 'Migrate operational runbooks to version-controlled Git repository with cryptographic access logs.', priority: 'MEDIUM', daysDue: 14, relCode: '7.5.1' }
      ];
    } else if (targetCode.includes('8') && !targetCode.includes('A.8') && !targetCode.includes('DOM-08')) {
      controlSpecs = [
        { code: '8.1', title: 'Operational Planning & Security Gates', desc: 'Security criteria integrated into production release engineering and change management.', ncReason: 'Emergency change requests bypass standard peer review and security vulnerability scan gating.', mandatory: true },
        { code: '8.2', title: 'Execution of Risk Assessments', desc: 'Continuous threat scans performed across production workloads and cloud environments.', ncReason: 'Bi-weekly automated vulnerability sweeps failed to scan new container cluster worker pools.', mandatory: true },
        { code: '8.3', title: 'Execution of Risk Treatment Controls', desc: 'Timely technical implementation of approved remediation controls.', ncReason: 'Two High-severity risk treatment actions past their 30-day target completion deadline.', mandatory: true }
      ];
      taskSpecs = [
        { title: 'Enforce Automated Pre-Deployment Scan Gates', desc: 'Configure CI/CD gate blocking deployments when high-severity container CVEs are detected.', priority: 'CRITICAL', daysDue: 3, relCode: '8.1' },
        { title: 'Close Overdue Risk Treatment Remediation Tickets', desc: 'Complete remaining firewall rule consolidation tasks and obtain CISO verification.', priority: 'HIGH', daysDue: 7, relCode: '8.3' }
      ];
    } else if (targetCode.includes('9') && !targetCode.includes('DOM-09')) {
      controlSpecs = [
        { code: '9.1', title: 'Monitoring, Measurement & Log Evaluation', desc: 'Continuous log aggregation, SIEM correlation, and tamper-evident audit trails.', ncReason: 'SIEM log ingestion pipeline dropped 14 hours of audit events during database maintenance.', mandatory: true },
        { code: '9.2', title: 'Internal Audit Program Execution', desc: 'Independent annual assessment of ISMS conformance and effectiveness.', ncReason: 'Stage 1 internal audit finding closures pending formal re-testing evidence.', mandatory: true },
        { code: '9.3', title: 'Management Review Attestation', desc: 'Comprehensive executive review of security performance, audit findings, and resource needs.', ncReason: 'Executive management review pack incomplete; awaiting KPI performance metrics.', mandatory: false }
      ];
      taskSpecs = [
        { title: 'Audit SIEM Log Pipeline Integrity', desc: 'Implement automated watchdog alerts for log shipper disconnects and verify 365-day cold storage.', priority: 'HIGH', daysDue: 5, relCode: '9.1' },
        { title: 'Compile Executive Management Review Dossier', desc: 'Consolidate department audit findings, incident trends, and resource requisitions for Board review.', priority: 'MEDIUM', daysDue: 12, relCode: '9.3' }
      ];
    } else if (targetCode.includes('10') && !targetCode.includes('DOM-10')) {
      controlSpecs = [
        { code: '10.1', title: 'Continual ISMS Improvement', desc: 'Systematic optimization of security posture based on post-incident analyses and audit lessons.', ncReason: 'Lessons learned from Q2 network outage not incorporated into automated playbooks.', mandatory: false },
        { code: '10.2', title: 'Nonconformity & Corrective Action (CAPA)', desc: 'Rigorous root-cause analysis, corrective action dispatch, and effectiveness verification.', ncReason: 'Three open audit non-conformities remain without documented root-cause analysis.', mandatory: true }
      ];
      taskSpecs = [
        { title: 'Complete Root-Cause Analysis for Open CAPAs', desc: 'Facilitate 5-Whys post-mortem for Stage 1 audit findings and publish remediation roadmaps.', priority: 'CRITICAL', daysDue: 4, relCode: '10.2' },
        { title: 'Verify CAPA Remediation Effectiveness', desc: 'Perform re-testing on remediated access control tickets and obtain auditor sign-off.', priority: 'HIGH', daysDue: 9, relCode: '10.2' }
      ];
    } else if (targetCode.includes('A.5') || targetCode.includes('Annex A.5')) {
      controlSpecs = [
        { code: 'A.5.1', title: 'Policies for Information Security', desc: 'Organizational policies and specific topic standards review.', ncReason: 'Third-party vendor data handling policy not updated with 2026 data privacy requirements.', mandatory: true },
        { code: 'A.5.15', title: 'Access Control Policy & Least Privilege', desc: 'Enforcement of granular role-based access control and segregation of duties.', ncReason: 'Four developers retain unmonitored direct production write access to core database tables.', mandatory: true },
        { code: 'A.5.19', title: 'Information Security in Supplier Relationships', desc: 'Vendor risk assessment, right-to-audit clauses, and continuous SOC 2 review.', ncReason: 'Missing SOC 2 Type II attestation reports for three critical SaaS data analytics vendors.', mandatory: true },
        { code: 'A.5.23', title: 'Information Security for Cloud Services', desc: 'Cloud baseline hardening, encryption, and automated CSPM posture drift detection.', ncReason: 'AWS production VPC security groups permit unrestricted egress across non-standard ports.', mandatory: true },
        { code: 'A.5.31', title: 'Legal, Statutory & Contractual Compliance', desc: 'Continuous compliance mapping against MAS Notice 655, PDPA, and ISO standards.', ncReason: 'Data retention schedules not aligned with cross-border statutory requirements.', mandatory: true }
      ];
      taskSpecs = [
        { title: 'Revoke Unrestricted Developer Database Access', desc: 'Migrate direct database access to ephemeral Bastion proxy with mandatory justification and session recording.', priority: 'CRITICAL', daysDue: 2, relCode: 'A.5.15' },
        { title: 'Collect SOC 2 Reports for Critical SaaS Suppliers', desc: 'Issue formal audit demand letters to vendor procurement contacts and review third-party audit opinions.', priority: 'HIGH', daysDue: 6, relCode: 'A.5.19' },
        { title: 'Remediate CSPM AWS Security Group Drift', desc: 'Deploy automated Terraform guardrail restricting egress to verified HTTPS endpoints only.', priority: 'HIGH', daysDue: 8, relCode: 'A.5.23' }
      ];
    } else if (targetCode.includes('A.6') || targetCode.includes('Annex A.6')) {
      controlSpecs = [
        { code: 'A.6.1', title: 'Screening & Background Checks', desc: 'Background verification checks for all candidates in proportion to business requirements.', ncReason: 'Offshore contractor background checks lack independent verification of criminal and credit histories.', mandatory: true },
        { code: 'A.6.2', title: 'Terms & Conditions of Employment', desc: 'Contractual employee responsibilities for security, confidentiality, and data protection.', ncReason: 'Contractor agreements lack specific intellectual property non-disclosure addendums.', mandatory: true },
        { code: 'A.6.5', title: 'Responsibilities After Termination', desc: 'Immediate revocation of credentials and return of corporate assets upon departure.', ncReason: 'Audit identified two former employees whose AWS IAM API keys remained active 5 days post-exit.', mandatory: true },
        { code: 'A.6.7', title: 'Remote Working Security', desc: 'Security controls for teleworking, secure tunnels, and endpoint encryption.', ncReason: '12 remote developer laptops lack forced full-disk encryption and screen lock enforcement.', mandatory: true }
      ];
      taskSpecs = [
        { title: 'Automate IAM Deprovisioning on HR Exit Events', desc: 'Connect Workday webhook to Okta IAM to trigger instantaneous credential revocation upon termination.', priority: 'CRITICAL', daysDue: 3, relCode: 'A.6.5' },
        { title: 'Enforce MDM BitLocker/FileVault Full-Disk Encryption', desc: 'Push mandatory MDM profile to non-compliant remote laptops and restrict network access until compliant.', priority: 'HIGH', daysDue: 5, relCode: 'A.6.7' }
      ];
    } else if (targetCode.includes('A.7') || targetCode.includes('Annex A.7')) {
      controlSpecs = [
        { code: 'A.7.1', title: 'Physical Security Perimeters', desc: 'Security barriers, badge-controlled access, and intrusion detection for facilities.', ncReason: 'Server room secondary emergency exit door sensor not integrated into 24/7 building alarm.', mandatory: true },
        { code: 'A.7.4', title: 'Physical Security Monitoring', desc: 'CCTV video surveillance and physical access logging with 90-day retention.', ncReason: 'Co-location data center CCTV cameras dropped retention to 45 days due to storage limits.', mandatory: true },
        { code: 'A.7.10', title: 'Storage Media Disposal & Sanitization', desc: 'Cryptographic wiping and physical degaussing/shredding of retired storage media.', ncReason: 'Decommissioned SSD disposal lacks cryptographic sanitization certificates from e-waste vendor.', mandatory: true },
        { code: 'A.7.14', title: 'Clear Desk & Clear Screen', desc: 'Protection of unattended papers and locking of endpoint workstations.', ncReason: 'Unattended trading floor terminals observed unlocked during audit walkthrough.', mandatory: false }
      ];
      taskSpecs = [
        { title: 'Certify SSD Cryptographic Sanitization Records', desc: 'Obtain certified serial-number level destruction certificates from certified disposal contractor.', priority: 'HIGH', daysDue: 6, relCode: 'A.7.10' },
        { title: 'Upgrade Co-Location CCTV Storage Capacity', desc: 'Install secondary NAS expansion to guarantee 90-day retention for server room security cameras.', priority: 'MEDIUM', daysDue: 14, relCode: 'A.7.4' }
      ];
    } else if (targetCode.includes('A.8') || targetCode.includes('Annex A.8')) {
      controlSpecs = [
        { code: 'A.8.1', title: 'User Endpoint Devices', desc: 'Endpoint management, anti-malware, firewall, and patch compliance.', ncReason: 'Unmanaged development laptops connect to internal staging APIs without certificate authentication.', mandatory: true },
        { code: 'A.8.7', title: 'Protection Against Malware', desc: 'EDR agent deployment, real-time behavioral analysis, and automated quarantine.', ncReason: '18 Kubernetes worker nodes and CI runner pods lack CrowdStrike/Wazuh EDR agent daemons.', mandatory: true },
        { code: 'A.8.8', title: 'Management of Technical Vulnerabilities', desc: 'Continuous vulnerability scanning and SLA-bound remediation for critical CVEs.', ncReason: 'Four Critical CVEs (CVSS > 9.0) in core API gateway container base images unpatched after 28 days.', mandatory: true },
        { code: 'A.8.12', title: 'Data Leakage Prevention (DLP)', desc: 'Inspection of network egress, email, and cloud storage to block unauthorized PII export.', ncReason: 'Staging development databases contain unmasked production customer PII without synthetic tokenization.', mandatory: true },
        { code: 'A.8.20', title: 'Network Security & Micro-Segmentation', desc: 'Perimeter firewalls, zero-trust network access, and micro-segmentation.', ncReason: 'Lateral network traffic permitted between payment processing VPC and analytics cluster.', mandatory: true },
        { code: 'A.8.24', title: 'Use of Cryptography & Key Management', desc: 'Encryption at rest, TLS 1.3 in transit, and HSM-backed key rotation.', ncReason: 'Legacy internal microservices communicate over plain HTTP without mutual TLS (mTLS).', mandatory: true },
        { code: 'A.8.28', title: 'Secure Coding & CI/CD Security Gates', desc: 'Automated SAST/DAST PR blocking gates and secret scanning in repositories.', ncReason: 'Automated PR security scanning gate missing across 14 microservice repos; 7 hardcoded secrets detected in Helm charts.', mandatory: true }
      ];
      taskSpecs = [
        { title: 'Purge Hardcoded Secrets & Rotate Credentials', desc: 'Purge exposed tokens from Git history using BFG Repo-Cleaner and rotate HashiCorp Vault access keys.', priority: 'CRITICAL', daysDue: 2, relCode: 'A.8.28' },
        { title: 'Deploy CrowdStrike EDR to Kubernetes Worker Nodes', desc: 'Roll out EDR DaemonSet to all production and staging Kubernetes nodes and verify telemetry ingestion.', priority: 'CRITICAL', daysDue: 3, relCode: 'A.8.7' },
        { title: 'Patch Critical Container Base Image CVEs', desc: 'Update Alpine/Debian base images across core API gateway microservices and re-run Trivy scans.', priority: 'HIGH', daysDue: 5, relCode: 'A.8.8' },
        { title: 'Enforce Staging Database PII Anonymization', desc: 'Deploy automated synthetic masking pipeline to purge real customer records from staging environments.', priority: 'HIGH', daysDue: 7, relCode: 'A.8.12' },
        { title: 'Implement Istio mTLS Across Internal Microservices', desc: 'Mandate strict mutual TLS encryption for all pod-to-pod communication in the payment namespace.', priority: 'HIGH', daysDue: 10, relCode: 'A.8.24' }
      ];
    } else if (dimensionType === 'ISO_27701' || targetCode.includes('PIMS')) {
      // ISO/IEC 27701:2019 PIMS Controls & Obligations
      if (targetCode.includes('7.2')) {
        controlSpecs = [
          { code: 'PIMS.7.2.1', title: 'Identify & Document Lawful Basis', desc: 'Determine and document lawful basis for PII processing prior to collection.', ncReason: 'Legal department lacks documented lawful basis register for secondary algorithmic training data.', mandatory: true },
          { code: 'PIMS.7.2.2', title: 'Obtain & Record Granular Consent', desc: 'Mechanism for freely given, specific, and informed consent with audit logging.', ncReason: 'Consumer consent records lack granular opt-in timestamps for marketing telematics.', mandatory: true },
          { code: 'PIMS.7.2.5', title: 'Privacy Impact Assessment (DPIA)', desc: 'Pre-deployment DPIA for high-risk PII processing or automated profiling.', ncReason: 'AI fraud scoring model deployed into production without formal DPIA review signoff.', mandatory: true }
        ];
        taskSpecs = [
          { title: 'Publish Granular Consent Architecture', desc: 'Implement cookie and API consent manager logging user acceptance into immutable audit store.', priority: 'HIGH', daysDue: 5, relCode: 'PIMS.7.2.2' },
          { title: 'Complete DPIA for AI Underwriting Engine', desc: 'Conduct Section 10 DPIA assessing algorithmic bias, re-identification risks, and mitigations.', priority: 'CRITICAL', daysDue: 3, relCode: 'PIMS.7.2.5' }
        ];
      } else if (targetCode.includes('7.3')) {
        controlSpecs = [
          { code: 'PIMS.7.3.1', title: 'Provide Privacy Notices & Policies', desc: 'Clear, transparent privacy notices at or before collection.', ncReason: 'Mobile app privacy policy last updated 14 months ago; omits cross-border transfer disclosures.', mandatory: true },
          { code: 'PIMS.7.3.2', title: 'Data Subject Rights (DSAR) Mechanism', desc: 'Workflows to fulfill access, rectification, erasure, and portability within 30 days.', ncReason: 'DSAR erasure workflow requires manual database scripting; SLA exceeded on 3 recent tickets.', mandatory: true },
          { code: 'PIMS.7.3.8', title: 'Automated Decision-Making Controls', desc: 'Safeguards for automated profiling, including human review appeal paths.', ncReason: 'Credit rejection notices lack explicit explanation of automated scoring logic or appeal rights.', mandatory: true }
        ];
        taskSpecs = [
          { title: 'Automate DSAR Right-to-be-Forgotten Deletion Pipeline', desc: 'Deploy automated cryptographic shredding microservice to wipe user records from PostgreSQL and cold archives.', priority: 'HIGH', daysDue: 7, relCode: 'PIMS.7.3.2' },
          { title: 'Update Enterprise Privacy Notices for 2026', desc: 'Refresh privacy statements to list all third-party subprocessor categories and DPO contact details.', priority: 'MEDIUM', daysDue: 10, relCode: 'PIMS.7.3.1' }
        ];
      } else if (targetCode.includes('7.4')) {
        controlSpecs = [
          { code: 'PIMS.7.4.1', title: 'Privacy by Design & Default (PbD)', desc: 'Architectural privacy controls embedded into agile SDLC and system design.', ncReason: 'Staging CI/CD environments pull unmasked production user PII without tokenization.', mandatory: true },
          { code: 'PIMS.7.4.2', title: 'PII Minimization & De-identification', desc: 'Collect only necessary PII attributes; pseudonymize data at ingress.', ncReason: 'Telemetry logging pipelines ingest full IP addresses and device MAC IDs without hashing.', mandatory: true },
          { code: 'PIMS.7.4.5', title: 'PII Retention Schedules & Disposal', desc: 'Automated pruning and cryptographic wiping of expired personal data.', ncReason: 'Closed customer transaction records retained beyond statutory limitation.', mandatory: true }
        ];
        taskSpecs = [
          { title: 'Deploy Synthetic Masking in Development Databases', desc: 'Replace real production PII in staging clusters with synthetic tokens.', priority: 'CRITICAL', daysDue: 4, relCode: 'PIMS.7.4.1' },
          { title: 'Implement Automated Retention Purge Cron', desc: 'Configure scheduled partition drops for user activity logs older than 90 days.', priority: 'HIGH', daysDue: 6, relCode: 'PIMS.7.4.5' }
        ];
      } else if (targetCode.includes('8.5')) {
        controlSpecs = [
          { code: 'PIMS.8.5.1', title: 'Third-Party PII Transfers & Country Bounds', desc: 'Transfer impact assessments and standard contractual clauses for cross-border flows.', ncReason: 'Cloud analytics vendor transfers EU citizen PII to US cloud region without executed SCCs.', mandatory: true },
          { code: 'PIMS.8.5.4', title: 'Subprocessor Engagement Due Diligence', desc: 'Prior written customer authorization and security vetting of third-party vendors.', ncReason: 'Two new AI SaaS microservices integrated into production without 30-day prior customer notification.', mandatory: true },
          { code: 'PIMS.8.5.7', title: 'Subprocessor Security Audit & Verification', desc: 'Annual SOC 2 Type II or ISO 27701 certification verification of downstream vendors.', ncReason: 'Expired SOC 2 report on file for core identity verification vendor; audit past due.', mandatory: true }
        ];
        taskSpecs = [
          { title: 'Execute Flow-Down DPAs for Subprocessors', desc: 'Mandate binding ISO 27701 privacy obligations across all cloud infrastructure vendors.', priority: 'HIGH', daysDue: 5, relCode: 'PIMS.8.5.4' },
          { title: 'Enforce EU/UK Standard Contractual Clauses (SCCs)', desc: 'Execute updated SCCs with US cloud monitoring vendor to legitimize cross-border telemetry.', priority: 'HIGH', daysDue: 7, relCode: 'PIMS.8.5.1' }
        ];
      } else {
        // Governance & Operations
        controlSpecs = [
          { code: `${targetCode}.01`, title: `${targetTitle} - PIMS Governance & Policy`, desc: `Documented procedures and executive mandate under ISO 27701 for ${targetTitle}.`, ncReason: `PIMS operational procedure for ${targetTitle} lacks formal executive sign-off in ${deptName}.`, mandatory: true },
          { code: `${targetCode}.02`, title: `${targetTitle} - Privacy Safeguards & Technical Testing`, desc: `Cryptographic protection, access isolation, and audit trail verification for ${targetTitle}.`, ncReason: `Continuous automated testing baseline incomplete for ${targetTitle} in ${deptName}.`, mandatory: true },
          { code: `${targetCode}.03`, title: `${targetTitle} - External Auditor Verification`, desc: `Stage 1/Stage 2 certifier evidence collection and verification.`, ncReason: `Evidence binder missing quarterly review attestation logs.`, mandatory: true }
        ];
        taskSpecs = [
          { title: `Audit ISO 27701 Conformity for ${targetCode}`, desc: `Validate technical implementation and collect lead auditor evidence workpapers for ${deptName}.`, priority: score < 50 ? 'CRITICAL' : 'HIGH', daysDue: 4, relCode: `${targetCode}.01` },
          { title: `Sign Off PIMS Verification Workpaper`, desc: `Obtain DPO and Department Head attestation on privacy effectiveness.`, priority: 'HIGH', daysDue: 8, relCode: `${targetCode}.02` }
        ];
      }
    } else {
      // MAS TRM Domains (DOM-03 to DOM-16)
      const domainNum = targetCode;
      controlSpecs = [
        { code: `${domainNum}.REQ-01`, title: `${targetTitle} - Statutory Baseline Governance`, desc: `Mandated MAS TRM regulatory requirement for ${targetTitle}.`, ncReason: `Statutory baseline testing identified documentation and control gaps under MAS Notice 644 in ${deptName}.`, mandatory: true },
        { code: `${domainNum}.REQ-02`, title: `${targetTitle} - Continuous Technical Enforcement`, desc: `Operational safeguards, automated monitoring, and technical controls.`, ncReason: `Technical control enforcement lacking automated telemetry verification in ${deptName}.`, mandatory: true },
        { code: `${domainNum}.REQ-03`, title: `${targetTitle} - Independent Audit Attestation`, desc: `Periodic internal and third-party audit verification and evidence signoff.`, ncReason: `Quarterly audit attestation overdue; pending supervisory review and signoff.`, mandatory: true }
      ];
      taskSpecs = [
        { title: `Execute MAS TRM ${domainNum} Control Gap Remediation`, desc: `Address outstanding statutory requirements for ${targetTitle} and assemble compliance binder for ${deptName}.`, priority: score < 50 ? 'CRITICAL' : 'HIGH', daysDue: 4, relCode: `${domainNum}.REQ-01` },
        { title: `Upload Cryptographic Evidence for ${domainNum}`, desc: `Collect and hash configuration audit logs, penetration testing reports, and executive approvals.`, priority: 'HIGH', daysDue: 8, relCode: `${domainNum}.REQ-02` }
      ];
    }

    // Populate keyControls based on cell score
    const keyControls: HeatmapCellControlItem[] = controlSpecs.map((spec, idx) => {
      let ctrlStatus: HeatmapStatus = 'COMPLIANT';
      let ncReason: string | undefined = undefined;

      if (status === 'NON_COMPLIANT') {
        if (idx < 2) {
          ctrlStatus = 'NON_COMPLIANT';
          ncReason = spec.ncReason;
        } else if (idx === 2) {
          ctrlStatus = 'IN_PROGRESS';
          ncReason = 'Remediation plan submitted; awaiting technical deployment and verification.';
        } else {
          ctrlStatus = 'COMPLIANT';
        }
      } else if (status === 'IN_PROGRESS') {
        if (idx < 2) {
          ctrlStatus = 'IN_PROGRESS';
          ncReason = 'Control active in staging; continuous telemetry baseline collection in progress.';
        } else {
          ctrlStatus = 'COMPLIANT';
        }
      } else {
        ctrlStatus = 'COMPLIANT';
      }

      return {
        code: spec.code,
        title: spec.title,
        description: spec.desc,
        status: ctrlStatus,
        mandatory: spec.mandatory,
        evidenceRef: ctrlStatus === 'COMPLIANT' ? `EVD-${spec.code}-${deptId.slice(-3).toUpperCase()}` : undefined,
        nonComplianceReason: ncReason,
        remediationSlaDays: ctrlStatus === 'NON_COMPLIANT' ? 7 : ctrlStatus === 'IN_PROGRESS' ? 14 : undefined,
        assignedLead: owner
      };
    });

    // Populate tasks
    const outstandingTasks: HeatmapCellTask[] = taskSpecs.map((spec, idx) => {
      let taskStatus: HeatmapCellTask['status'] = 'PENDING';
      if (status === 'COMPLIANT') {
        taskStatus = 'COMPLETED';
      } else if (status === 'IN_PROGRESS') {
        taskStatus = idx === 0 ? 'IN_PROGRESS' : 'PENDING';
      } else {
        taskStatus = idx === 0 ? 'IN_PROGRESS' : 'PENDING';
      }

      const due = new Date();
      due.setDate(due.getDate() + spec.daysDue);

      return {
        id: `task-${deptId}-${targetCode.replace(/[^a-zA-Z0-9]/g, '')}-${idx + 1}`,
        title: spec.title,
        description: spec.desc,
        status: taskStatus,
        priority: spec.priority,
        assignee: owner,
        dueDate: due.toISOString().split('T')[0],
        relatedControlCode: spec.relCode,
        capaRef: status === 'NON_COMPLIANT' ? `CAPA-${deptId.slice(-3).toUpperCase()}-${targetCode.replace(/[^a-zA-Z0-9]/g, '')}` : undefined,
        daysOutstanding: Math.floor(Math.random() * 8) + 3
      };
    });

    // Populate findings
    const topFindings: HeatmapCellFinding[] = status === 'NON_COMPLIANT' ? [
      {
        code: `NC-${dimensionType === 'ISO_27001' ? 'ISO' : 'MAS'}-${deptId.slice(-3).toUpperCase()}-${targetCode.replace(/[^a-zA-Z0-9]/g, '')}`,
        title: `Material deficiency in ${targetTitle} controls for ${deptName}`,
        severity: score < 50 ? 'CRITICAL' : 'HIGH',
        daysOpen: 14,
        capaStatus: 'REMEDIATION_IN_PROGRESS'
      }
    ] : status === 'IN_PROGRESS' ? [
      {
        code: `OBS-${deptId.slice(-3).toUpperCase()}-${targetCode.replace(/[^a-zA-Z0-9]/g, '')}`,
        title: `Observation on continuous testing frequency for ${targetTitle}`,
        severity: 'MEDIUM',
        daysOpen: 21,
        capaStatus: 'OPEN'
      }
    ] : [];

    return { keyControls, outstandingTasks, topFindings };
  }

  /**
   * Generates initial baseline cells for Department x ISO Clauses
   */
  private static generateDefaultISOCells(): HeatmapCellData[] {
    const cells: HeatmapCellData[] = [];

    HEATMAP_DEPARTMENTS.forEach(dept => {
      HEATMAP_ISO_CLAUSES.forEach(clause => {
        let baseScore = 80;
        let findingsCount = 0;
        let risksCount = 1;

        // Realistic Department-specific weighting and variation
        if (dept.id === 'dept-devops') {
          if (clause.clauseCode === 'Annex A.8') {
            baseScore = 48; // Non-compliant in SAST/DAST automation
            findingsCount = 2;
            risksCount = 3;
          } else if (clause.clauseCode === 'Clause 8') {
            baseScore = 72; // In progress
            findingsCount = 1;
          } else {
            baseScore = 92;
          }
        } else if (dept.id === 'dept-infra') {
          if (clause.clauseCode === 'Annex A.7') {
            baseScore = 95; // Data center physical security is high
          } else if (clause.clauseCode === 'Annex A.8') {
            baseScore = 65; // In progress in patch management
            findingsCount = 1;
            risksCount = 2;
          } else if (clause.clauseCode === 'Clause 9') {
            baseScore = 88;
          } else {
            baseScore = 82;
          }
        } else if (dept.id === 'dept-procurement') {
          if (clause.clauseCode === 'Annex A.5') {
            baseScore = 44; // Supplier agreements & third-party audit gaps
            findingsCount = 3;
            risksCount = 2;
          } else if (clause.clauseCode === 'Clause 6') {
            baseScore = 62;
            findingsCount = 1;
          } else {
            baseScore = 68;
          }
        } else if (dept.id === 'dept-hr') {
          if (clause.clauseCode === 'Annex A.6') {
            baseScore = 88;
          } else if (clause.clauseCode === 'Clause 7') {
            baseScore = 62; // Phishing simulation completion lag
            findingsCount = 1;
          } else if (clause.clauseCode === 'Annex A.8') {
            baseScore = 90;
          } else {
            baseScore = 76;
          }
        } else if (dept.id === 'dept-finance') {
          if (clause.clauseCode === 'Annex A.5') {
            baseScore = 85;
          } else if (clause.clauseCode === 'Clause 8') {
            baseScore = 74;
          } else {
            baseScore = 86;
          }
        } else if (dept.id === 'dept-legal') {
          if (clause.clauseCode === 'Clause 4' || clause.clauseCode === 'Clause 5') {
            baseScore = 96; // Fully compliant in policies and context
          } else if (clause.clauseCode === 'Clause 10') {
            baseScore = 91;
          } else {
            baseScore = 89;
          }
        } else {
          // Product / Data
          if (clause.clauseCode === 'Annex A.8') {
            baseScore = 45; // Data loss prevention gaps in analytics pipelines
            findingsCount = 2;
            risksCount = 2;
          } else {
            baseScore = 78;
          }
        }

        const status = this.deriveStatusFromScore(baseScore);
        const riskLevel = this.deriveRiskLevel(baseScore);

        const details = this.generateControlsAndTasksForCell(
          dept.id,
          dept.name,
          'ISO_27001',
          clause.clauseCode,
          clause.title,
          baseScore,
          status,
          dept.head
        );

        const trendData = this.calculateBaselineTrend(
          `cell-iso-${dept.id}-${clause.id}`,
          clause.clauseCode,
          dept.id,
          baseScore
        );

        cells.push({
          id: `cell-iso-${dept.id}-${clause.id}`,
          departmentId: dept.id,
          departmentName: dept.name,
          dimensionType: 'ISO_27001',
          targetCode: clause.clauseCode,
          targetTitle: clause.title,
          score: baseScore,
          previousScore: trendData.previousScore,
          scoreDelta: trendData.scoreDelta,
          trend: trendData.trend,
          previousAssessedAt: trendData.previousAssessedAt,
          historicalScores: trendData.historicalScores,
          status,
          riskLevel,
          controlsTotal: clause.totalControls,
          controlsImplemented: Math.round((baseScore / 100) * clause.totalControls),
          controlsInProgress: status === 'IN_PROGRESS' ? 2 : status === 'NON_COMPLIANT' ? 1 : 0,
          controlsNonCompliant: status === 'NON_COMPLIANT' ? 2 : 0,
          openFindingsCount: findingsCount || details.topFindings.length,
          openRisksCount: risksCount,
          keyControls: details.keyControls,
          outstandingTasks: details.outstandingTasks,
          topFindings: details.topFindings,
          evidenceArtifacts: [
            {
              id: `evd-${dept.id}-${clause.id}-1`,
              name: `${dept.shortName}_${clause.clauseCode.replace(/\s+/g, '_')}_AuditLog.pdf`,
              type: 'Application / Audit Telemetry',
              verifiedAt: '2026-08-25',
              sha256Digest: 'a8f34bc9081e28df902187349abc901234ef01827490128374829103948abc12'
            }
          ],
          controlOwner: dept.head,
          auditorSignoff: baseScore >= 85,
          lastAssessedAt: '2026-08-28',
          complianceNotes: status === 'NON_COMPLIANT'
            ? 'Critical gap identified during Stage 1 readiness sweep. Corrective Action Plan (CAPA) ticket dispatched.'
            : status === 'IN_PROGRESS'
            ? 'Controls actively being verified. Policy sign-off complete; continuous telemetry awaiting 30-day baseline.'
            : 'All controls verified with cryptographic evidence attached. Conforms to ISO 27001 standard.'
        });
      });
    });

    return cells;
  }

  /**
   * Generates initial baseline cells for Department x MAS TRM Modules
   */
  private static generateDefaultMASCells(): HeatmapCellData[] {
    const cells: HeatmapCellData[] = [];

    HEATMAP_DEPARTMENTS.forEach(dept => {
      HEATMAP_MAS_MODULES.forEach(mod => {
        let baseScore = 82;
        let findingsCount = 0;
        let risksCount = 1;

        if (dept.id === 'dept-devops') {
          if (mod.domainNumber === 'DOM-06') {
            baseScore = 42; // Critical Non-compliant: SDLC SAST/DAST automated gate
            findingsCount = 3;
            risksCount = 3;
          } else if (mod.domainNumber === 'DOM-14') {
            baseScore = 58; // Patch management 14-day SLA
            findingsCount = 1;
            risksCount = 2;
          } else if (mod.domainNumber === 'DOM-08') {
            baseScore = 88;
          } else {
            baseScore = 84;
          }
        } else if (dept.id === 'dept-infra') {
          if (mod.domainNumber === 'DOM-15') {
            baseScore = 92; // 1-Hour MAS SLA drill completed
          } else if (mod.domainNumber === 'DOM-16') {
            baseScore = 95; // RTO <= 4h & RPO <= 1h certified
          } else if (mod.domainNumber === 'DOM-10') {
            baseScore = 64; // Privileged access reviews in progress
            findingsCount = 1;
          } else if (mod.domainNumber === 'DOM-14') {
            baseScore = 48; // Critical: Patch SLA latency on hypervisors
            findingsCount = 2;
            risksCount = 2;
          } else {
            baseScore = 86;
          }
        } else if (dept.id === 'dept-procurement') {
          if (mod.domainNumber === 'DOM-03' || mod.domainNumber === 'DOM-05') {
            baseScore = 70;
          } else if (mod.domainNumber === 'DOM-11') {
            baseScore = 45; // Vendor data processing and encryption audit gap
            findingsCount = 2;
            risksCount = 2;
          } else {
            baseScore = 60;
          }
        } else if (dept.id === 'dept-hr') {
          if (mod.domainNumber === 'DOM-10') {
            baseScore = 88; // Offboarding credential revocation
          } else if (mod.domainNumber === 'DOM-03') {
            baseScore = 85;
          } else {
            baseScore = 78;
          }
        } else if (dept.id === 'dept-finance') {
          if (mod.domainNumber === 'DOM-11') {
            baseScore = 92; // Payment card & financial payload cryptography
          } else if (mod.domainNumber === 'DOM-16') {
            baseScore = 86;
          } else {
            baseScore = 80;
          }
        } else if (dept.id === 'dept-legal') {
          if (mod.domainNumber === 'DOM-03' || mod.domainNumber === 'DOM-04') {
            baseScore = 96; // Governance and risk framework
          } else if (mod.domainNumber === 'DOM-15') {
            baseScore = 94; // Legal coordination for 1-hour regulatory filing
          } else {
            baseScore = 88;
          }
        } else {
          // Product / Data
          if (mod.domainNumber === 'DOM-11') {
            baseScore = 46; // Data protection at rest in data lake
            findingsCount = 2;
            risksCount = 3;
          } else {
            baseScore = 75;
          }
        }

        const status = this.deriveStatusFromScore(baseScore);
        const riskLevel = this.deriveRiskLevel(baseScore, mod.criticality);

        const details = this.generateControlsAndTasksForCell(
          dept.id,
          dept.name,
          'MAS_TRM',
          mod.domainNumber,
          mod.title,
          baseScore,
          status,
          dept.head
        );

        const trendData = this.calculateBaselineTrend(
          `cell-mas-${dept.id}-${mod.id}`,
          mod.domainNumber,
          dept.id,
          baseScore
        );

        cells.push({
          id: `cell-mas-${dept.id}-${mod.id}`,
          departmentId: dept.id,
          departmentName: dept.name,
          dimensionType: 'MAS_TRM',
          targetCode: mod.domainNumber,
          targetTitle: mod.title,
          score: baseScore,
          previousScore: trendData.previousScore,
          scoreDelta: trendData.scoreDelta,
          trend: trendData.trend,
          previousAssessedAt: trendData.previousAssessedAt,
          historicalScores: trendData.historicalScores,
          status,
          riskLevel,
          controlsTotal: mod.totalRequirements,
          controlsImplemented: Math.round((baseScore / 100) * mod.totalRequirements),
          controlsInProgress: status === 'IN_PROGRESS' ? 2 : status === 'NON_COMPLIANT' ? 1 : 0,
          controlsNonCompliant: status === 'NON_COMPLIANT' ? 2 : 0,
          openFindingsCount: findingsCount || details.topFindings.length,
          openRisksCount: risksCount,
          keyControls: details.keyControls,
          outstandingTasks: details.outstandingTasks,
          topFindings: details.topFindings,
          evidenceArtifacts: [
            {
              id: `evd-mas-${dept.id}-${mod.id}-1`,
              name: `MAS_TRM_${mod.domainNumber}_${dept.shortName.replace(/[^a-zA-Z]/g, '')}_Assessment.pdf`,
              type: 'Statutory Assessment Record',
              verifiedAt: '2026-08-20',
              sha256Digest: '7b89f02c11002233445566778899aabbccddeeff00112233445566778899aabb'
            }
          ],
          controlOwner: dept.head,
          auditorSignoff: baseScore >= 85,
          lastAssessedAt: '2026-08-26',
          complianceNotes: status === 'NON_COMPLIANT'
            ? 'Deficiency under MAS TRM statutory inspection guidelines. Requires corrective action prior to external examination.'
            : status === 'IN_PROGRESS'
            ? 'Operating controls active. Periodic review and drill evidence in queue.'
            : 'Fully aligned with MAS Technology Risk Management Guidelines.'
        });
      });
    });

    return cells;
  }

  /**
   * Generates initial baseline cells for Department x ISO 27701 PIMS Clauses
   */
  public static generateDefaultPIMSCells(): HeatmapCellData[] {
    const cells: HeatmapCellData[] = [];

    HEATMAP_DEPARTMENTS.forEach(dept => {
      HEATMAP_PIMS_CLAUSES.forEach(clause => {
        let baseScore = 82;
        let findingsCount = 0;
        let risksCount = 1;

        if (dept.id === 'dept-devops') {
          if (clause.clauseCode === 'PIMS 7.4') {
            baseScore = 48; // Data minimization in CI/CD pipelines
            findingsCount = 2;
            risksCount = 2;
          } else if (clause.clauseCode === 'PIMS 8.4') {
            baseScore = 85;
          } else {
            baseScore = 74;
          }
        } else if (dept.id === 'dept-infra') {
          if (clause.clauseCode === 'PIMS Cl. 6') {
            baseScore = 90; // Encryption & TLS 1.3
          } else if (clause.clauseCode === 'PIMS 7.5') {
            baseScore = 88; // Cloud VPC geofencing
          } else {
            baseScore = 82;
          }
        } else if (dept.id === 'dept-legal') {
          if (clause.clauseCode === 'PIMS Cl. 5' || clause.clauseCode === 'PIMS 7.2') {
            baseScore = 96; // Lawful basis & PIMS policies
          } else if (clause.clauseCode === 'PIMS 8.2') {
            baseScore = 94; // Customer instructions & DPAs
          } else {
            baseScore = 90;
          }
        } else if (dept.id === 'dept-procurement') {
          if (clause.clauseCode === 'PIMS 8.5') {
            baseScore = 52; // Subprocessor due diligence & flow-down DPAs
            findingsCount = 2;
            risksCount = 2;
          } else {
            baseScore = 70;
          }
        } else if (dept.id === 'dept-product') {
          if (clause.clauseCode === 'PIMS 7.3') {
            baseScore = 58; // DSAR self-service portal in development
            findingsCount = 1;
            risksCount = 2;
          } else if (clause.clauseCode === 'PIMS 7.2') {
            baseScore = 65;
          } else {
            baseScore = 72;
          }
        } else if (dept.id === 'dept-hr') {
          if (clause.clauseCode === 'PIMS Cl. 5') {
            baseScore = 86; // Privacy awareness training
          } else {
            baseScore = 80;
          }
        } else {
          // Finance
          baseScore = 84;
        }

        const status = this.deriveStatusFromScore(baseScore);
        const riskLevel = this.deriveRiskLevel(baseScore);

        const details = this.generateControlsAndTasksForCell(
          dept.id,
          dept.name,
          'ISO_27701',
          clause.clauseCode,
          clause.title,
          baseScore,
          status,
          dept.head
        );

        const trendData = this.calculateBaselineTrend(
          `cell-pims-${dept.id}-${clause.id}`,
          clause.clauseCode,
          dept.id,
          baseScore
        );

        cells.push({
          id: `cell-pims-${dept.id}-${clause.id}`,
          departmentId: dept.id,
          departmentName: dept.name,
          dimensionType: 'ISO_27701',
          targetCode: clause.clauseCode,
          targetTitle: clause.title,
          score: baseScore,
          previousScore: trendData.previousScore,
          scoreDelta: trendData.scoreDelta,
          trend: trendData.trend,
          previousAssessedAt: trendData.previousAssessedAt,
          historicalScores: trendData.historicalScores,
          status,
          riskLevel,
          controlsTotal: clause.totalControls,
          controlsImplemented: Math.round((baseScore / 100) * clause.totalControls),
          controlsInProgress: status === 'IN_PROGRESS' ? 2 : status === 'NON_COMPLIANT' ? 1 : 0,
          controlsNonCompliant: status === 'NON_COMPLIANT' ? 2 : 0,
          openFindingsCount: findingsCount || details.topFindings.length,
          openRisksCount: risksCount,
          keyControls: details.keyControls,
          outstandingTasks: details.outstandingTasks,
          topFindings: details.topFindings,
          evidenceArtifacts: [
            {
              id: `evd-pims-${dept.id}-${clause.id}-1`,
              name: `PIMS_${clause.clauseCode.replace(/[^a-zA-Z0-9]/g, '_')}_${dept.shortName.replace(/[^a-zA-Z]/g, '')}_Verification.pdf`,
              type: 'PIMS Compliance Workpaper',
              verifiedAt: '2026-08-25',
              sha256Digest: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
            }
          ],
          controlOwner: dept.head,
          auditorSignoff: baseScore >= 85,
          lastAssessedAt: '2026-08-28',
          complianceNotes: status === 'NON_COMPLIANT'
            ? 'PIMS control deficiency under ISO/IEC 27701:2019. Corrective action plan mandatory for Stage 1/2 certifier review.'
            : status === 'IN_PROGRESS'
            ? 'Privacy operational procedures active; awaiting periodic testing evidence.'
            : 'Conformant with ISO/IEC 27701:2019 PIMS requirements.'
        });
      });
    });

    return cells;
  }

  /**
   * Returns all stored cells from localStorage or generates default
   */
  public static getAllCells(): HeatmapCellData[] {
    let cells: HeatmapCellData[] = [];
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_CELLS_KEY);
      if (stored) {
        cells = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse heatmap cells from storage:', e);
    }

    if (cells.length === 0) {
      cells = [...this.generateDefaultISOCells(), ...this.generateDefaultMASCells(), ...this.generateDefaultPIMSCells()];
      this.saveCells(cells);
    } else {
      // Auto-migrate older cells lacking rich tasks, control details, or trend indicators
      let needsSave = false;
      const hasPIMSCells = cells.some(c => c.dimensionType === 'ISO_27701');
      if (!hasPIMSCells) {
        cells = [...cells, ...this.generateDefaultPIMSCells()];
        needsSave = true;
      }
      cells = cells.map(cell => {
        let updatedCell = { ...cell };

        // Ensure trend and previousScore are initialized
        if (updatedCell.previousScore === undefined || !updatedCell.trend || !updatedCell.historicalScores || updatedCell.historicalScores.length === 0) {
          const trendData = this.calculateBaselineTrend(
            updatedCell.id,
            updatedCell.targetCode,
            updatedCell.departmentId,
            updatedCell.score
          );
          updatedCell.previousScore = trendData.previousScore;
          updatedCell.scoreDelta = trendData.scoreDelta;
          updatedCell.trend = trendData.trend;
          updatedCell.previousAssessedAt = trendData.previousAssessedAt;
          updatedCell.historicalScores = trendData.historicalScores;
          needsSave = true;
        }

        if (!updatedCell.outstandingTasks || updatedCell.outstandingTasks.length === 0 || !updatedCell.keyControls?.[0]?.description) {
          const generated = this.generateControlsAndTasksForCell(
            updatedCell.departmentId,
            updatedCell.departmentName,
            updatedCell.dimensionType,
            updatedCell.targetCode,
            updatedCell.targetTitle,
            updatedCell.score,
            updatedCell.status,
            updatedCell.controlOwner
          );
          needsSave = true;
          updatedCell = {
            ...updatedCell,
            keyControls: generated.keyControls,
            outstandingTasks: generated.outstandingTasks,
            topFindings: updatedCell.topFindings?.length ? updatedCell.topFindings : generated.topFindings
          };
        }
        return updatedCell;
      });
      if (needsSave) {
        this.saveCells(cells);
      }
    }

    return cells;
  }

  public static saveCells(cells: HeatmapCellData[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_CELLS_KEY, JSON.stringify(cells));
    } catch (e) {
      console.warn('Failed to persist heatmap cells:', e);
    }
  }

  /**
   * Toggles an outstanding task's status and automatically updates the parent cell score/status
   */
  public static toggleTaskStatus(
    cellId: string,
    taskId: string,
    newStatus: HeatmapCellTask['status']
  ): HeatmapCellData | null {
    const cells = this.getAllCells();
    const cell = cells.find(c => c.id === cellId);
    if (!cell || !cell.outstandingTasks) return null;

    const task = cell.outstandingTasks.find(t => t.id === taskId);
    if (!task) return null;

    task.status = newStatus;

    // Recalculate score based on task completions
    const totalTasks = cell.outstandingTasks.length;
    const completedTasks = cell.outstandingTasks.filter(t => t.status === 'COMPLETED').length;

    if (newStatus === 'COMPLETED' && task.relatedControlCode) {
      const ctrl = cell.keyControls.find(c => c.code === task.relatedControlCode);
      if (ctrl && ctrl.status !== 'COMPLIANT') {
        const remainingTasksForCtrl = cell.outstandingTasks.filter(
          t => t.relatedControlCode === task.relatedControlCode && t.status !== 'COMPLETED'
        );
        if (remainingTasksForCtrl.length === 0) {
          ctrl.status = 'COMPLIANT';
          ctrl.nonComplianceReason = undefined;
          ctrl.remediationSlaDays = undefined;
        }
      }
    }

    // Dynamic score progression
    if (completedTasks === totalTasks) {
      cell.score = Math.max(cell.score, 94);
      cell.status = 'COMPLIANT';
      cell.keyControls.forEach(c => {
        c.status = 'COMPLIANT';
        c.nonComplianceReason = undefined;
      });
    } else {
      const taskRatio = completedTasks / totalTasks;
      const basePoints = Math.round(taskRatio * 45);
      cell.score = Math.min(90, Math.max(cell.score, 45 + basePoints));
      cell.status = this.deriveStatusFromScore(cell.score);
    }

    cell.riskLevel = this.deriveRiskLevel(cell.score);
    if (cell.previousScore !== undefined) {
      cell.scoreDelta = cell.score - cell.previousScore;
      cell.trend = cell.scoreDelta > 0 ? 'UP' : cell.scoreDelta < 0 ? 'DOWN' : 'STABLE';
    }
    cell.controlsNonCompliant = cell.keyControls.filter(c => c.status === 'NON_COMPLIANT').length;
    cell.controlsInProgress = cell.keyControls.filter(c => c.status === 'IN_PROGRESS').length;
    cell.controlsImplemented = cell.keyControls.filter(c => c.status === 'COMPLIANT').length;
    cell.lastAssessedAt = new Date().toISOString().split('T')[0];

    this.saveCells(cells);
    return cell;
  }

  /**
   * Adds an ad-hoc action task to a specific cell
   */
  public static addTaskToCell(
    cellId: string,
    taskData: Omit<HeatmapCellTask, 'id' | 'daysOutstanding'>
  ): HeatmapCellData | null {
    const cells = this.getAllCells();
    const cell = cells.find(c => c.id === cellId);
    if (!cell) return null;

    if (!cell.outstandingTasks) cell.outstandingTasks = [];

    const newTask: HeatmapCellTask = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      daysOutstanding: 0
    };

    cell.outstandingTasks.unshift(newTask);
    this.saveCells(cells);
    return cell;
  }

  /**
   * Manually sets a control's status and recalculates cell score
   */
  public static updateControlStatus(
    cellId: string,
    controlCode: string,
    newStatus: HeatmapStatus
  ): HeatmapCellData | null {
    const cells = this.getAllCells();
    const cell = cells.find(c => c.id === cellId);
    if (!cell) return null;

    const ctrl = cell.keyControls.find(c => c.code === controlCode);
    if (!ctrl) return null;

    ctrl.status = newStatus;
    if (newStatus === 'COMPLIANT') {
      ctrl.nonComplianceReason = undefined;
      ctrl.remediationSlaDays = undefined;
    }

    cell.controlsNonCompliant = cell.keyControls.filter(c => c.status === 'NON_COMPLIANT').length;
    cell.controlsInProgress = cell.keyControls.filter(c => c.status === 'IN_PROGRESS').length;
    cell.controlsImplemented = cell.keyControls.filter(c => c.status === 'COMPLIANT').length;

    // Recalculate score from control ratio
    const total = cell.keyControls.length;
    if (total > 0) {
      const comp = cell.controlsImplemented;
      const inProg = cell.controlsInProgress;
      const calculated = Math.round(((comp * 1.0 + inProg * 0.5) / total) * 100);
      cell.score = calculated;
      cell.status = this.deriveStatusFromScore(calculated);
      cell.riskLevel = this.deriveRiskLevel(calculated);
    }

    if (cell.previousScore !== undefined) {
      cell.scoreDelta = cell.score - cell.previousScore;
      cell.trend = cell.scoreDelta > 0 ? 'UP' : cell.scoreDelta < 0 ? 'DOWN' : 'STABLE';
    }

    if (cell.historicalScores && cell.historicalScores.length > 0) {
      cell.historicalScores = [...cell.historicalScores.slice(0, -1), cell.score];
    } else {
      cell.historicalScores = [cell.previousScore ?? cell.score, cell.score];
    }

    cell.lastAssessedAt = new Date().toISOString().split('T')[0];
    this.saveCells(cells);
    return cell;
  }

  /**
   * Updates a single cell's compliance status and score
   */
  public static updateCell(cellId: string, updates: Partial<HeatmapCellData>): HeatmapCellData | null {
    const cells = this.getAllCells();
    const index = cells.findIndex(c => c.id === cellId);
    if (index === -1) return null;

    const current = cells[index];
    const updated: HeatmapCellData = {
      ...current,
      ...updates,
      lastAssessedAt: new Date().toISOString().split('T')[0]
    };

    // If score updated, update status/risk automatically unless explicitly passed
    if (updates.score !== undefined && updates.status === undefined) {
      updated.status = this.deriveStatusFromScore(updates.score);
      updated.riskLevel = this.deriveRiskLevel(updates.score);
    } else if (updates.status !== undefined && updates.score === undefined) {
      if (updates.status === 'COMPLIANT') updated.score = 92;
      else if (updates.status === 'IN_PROGRESS') updated.score = 68;
      else if (updates.status === 'NON_COMPLIANT') updated.score = 38;
      updated.riskLevel = this.deriveRiskLevel(updated.score);
    }

    if (updated.previousScore !== undefined) {
      updated.scoreDelta = updated.score - updated.previousScore;
      updated.trend = updated.scoreDelta > 0 ? 'UP' : updated.scoreDelta < 0 ? 'DOWN' : 'STABLE';
    }

    cells[index] = updated;
    this.saveCells(cells);
    return updated;
  }

  /**
   * Generates crosswalk alignment between ISO 27001 and MAS TRM
   */
  public static getCrosswalkMatrix(): CrosswalkCellData[] {
    const crosswalk: CrosswalkCellData[] = [
      {
        id: 'cw-1',
        isoClauseCode: 'Clause 5',
        isoClauseTitle: 'Leadership & Policy',
        masDomainNumber: 'DOM-03',
        masDomainTitle: 'Technology Risk Governance',
        overlapScore: 94,
        status: 'COMPLIANT',
        riskLevel: 'LOW',
        harmonizedControlsCount: 9,
        jointGapsCount: 0,
        auditCoverageStatus: 'FULL_COVERAGE',
        recommendedAction: 'Board charter covers both ISO Cl. 5 and MAS TRM 3.0 requirements.'
      },
      {
        id: 'cw-2',
        isoClauseCode: 'Clause 6',
        isoClauseTitle: 'Planning & Risk Assessment',
        masDomainNumber: 'DOM-04',
        masDomainTitle: 'Technology Risk Management Framework',
        overlapScore: 88,
        status: 'COMPLIANT',
        riskLevel: 'LOW',
        harmonizedControlsCount: 10,
        jointGapsCount: 0,
        auditCoverageStatus: 'FULL_COVERAGE',
        recommendedAction: 'Dynamic risk register satisfies both ISO Cl. 6.1 and MAS TRM 4.1.'
      },
      {
        id: 'cw-3',
        isoClauseCode: 'Annex A.8',
        isoClauseTitle: 'Technological Controls (A.8.28 Secure Coding)',
        masDomainNumber: 'DOM-06',
        masDomainTitle: 'Software Development Life Cycle (SDLC)',
        overlapScore: 44,
        status: 'NON_COMPLIANT',
        riskLevel: 'CRITICAL',
        harmonizedControlsCount: 14,
        jointGapsCount: 3,
        auditCoverageStatus: 'REGULATORY_BREACH_RISK',
        recommendedAction: 'Critical Gap: Deploy mandatory automated SAST/DAST PR blockers across all payment microservices.'
      },
      {
        id: 'cw-4',
        isoClauseCode: 'Annex A.8',
        isoClauseTitle: 'Technological Controls (A.8.24 Cryptography)',
        masDomainNumber: 'DOM-11',
        masDomainTitle: 'Data Loss Prevention & Cryptography',
        overlapScore: 78,
        status: 'IN_PROGRESS',
        riskLevel: 'MEDIUM',
        harmonizedControlsCount: 12,
        jointGapsCount: 1,
        auditCoverageStatus: 'PARTIAL_GAP',
        recommendedAction: 'FIPS 140-3 HSM key rotation verification required for data lake buckets.'
      },
      {
        id: 'cw-5',
        isoClauseCode: 'Annex A.5',
        isoClauseTitle: 'Organizational Controls (A.5.15 Access Control)',
        masDomainNumber: 'DOM-10',
        masDomainTitle: 'Access Control & Privileged Identity (PIM)',
        overlapScore: 82,
        status: 'IN_PROGRESS',
        riskLevel: 'MEDIUM',
        harmonizedControlsCount: 16,
        jointGapsCount: 1,
        auditCoverageStatus: 'PARTIAL_GAP',
        recommendedAction: 'Enforce MFA and PAM session recording for all cloud bastion hosts.'
      },
      {
        id: 'cw-6',
        isoClauseCode: 'Annex A.5',
        isoClauseTitle: 'Organizational Controls (A.5.19 Supplier Relationships)',
        masDomainNumber: 'DOM-05',
        masDomainTitle: 'IT Project Management & Acquisition',
        overlapScore: 48,
        status: 'NON_COMPLIANT',
        riskLevel: 'HIGH',
        harmonizedControlsCount: 10,
        jointGapsCount: 2,
        auditCoverageStatus: 'REGULATORY_BREACH_RISK',
        recommendedAction: 'Procurement must enforce right-to-audit clauses across SaaS vendors.'
      },
      {
        id: 'cw-7',
        isoClauseCode: 'Clause 10',
        isoClauseTitle: 'Improvement & Corrective Action',
        masDomainNumber: 'DOM-15',
        masDomainTitle: 'Incident Management & 1-Hour Notice',
        overlapScore: 92,
        status: 'COMPLIANT',
        riskLevel: 'LOW',
        harmonizedControlsCount: 8,
        jointGapsCount: 0,
        auditCoverageStatus: 'FULL_COVERAGE',
        recommendedAction: '1-Hour automated incident workflow satisfies MAS Notice 644 and ISO Cl. 10.2.'
      },
      {
        id: 'cw-8',
        isoClauseCode: 'Annex A.8',
        isoClauseTitle: 'Technological Controls (A.8.20 Network Security)',
        masDomainNumber: 'DOM-09',
        masDomainTitle: 'Network & Communication Security',
        overlapScore: 90,
        status: 'COMPLIANT',
        riskLevel: 'LOW',
        harmonizedControlsCount: 14,
        jointGapsCount: 0,
        auditCoverageStatus: 'FULL_COVERAGE',
        recommendedAction: 'Micro-segmentation and DMZ firewalls fully conform to both benchmarks.'
      }
    ];

    return crosswalk;
  }

  /**
   * Calculates summary statistics for a set of cells
   */
  public static calculateMetrics(cells: HeatmapCellData[]): HeatmapMatrixMetrics {
    const totalNodes = cells.length;
    let compliantCount = 0;
    let inProgressCount = 0;
    let nonCompliantCount = 0;
    let notApplicableCount = 0;
    let totalScore = 0;
    let criticalRiskCount = 0;
    let highRiskCount = 0;
    let mediumRiskCount = 0;
    let lowRiskCount = 0;
    let totalFindings = 0;

    cells.forEach(c => {
      totalScore += c.score;
      totalFindings += c.openFindingsCount;

      if (c.status === 'COMPLIANT') compliantCount++;
      else if (c.status === 'IN_PROGRESS') inProgressCount++;
      else if (c.status === 'NON_COMPLIANT') nonCompliantCount++;
      else notApplicableCount++;

      if (c.riskLevel === 'CRITICAL') criticalRiskCount++;
      else if (c.riskLevel === 'HIGH') highRiskCount++;
      else if (c.riskLevel === 'MEDIUM') mediumRiskCount++;
      else lowRiskCount++;
    });

    const averageScore = totalNodes > 0 ? Math.round(totalScore / totalNodes) : 0;

    return {
      totalNodes,
      compliantCount,
      inProgressCount,
      nonCompliantCount,
      notApplicableCount,
      averageScore,
      criticalRiskNodesCount: criticalRiskCount,
      highRiskNodesCount: highRiskCount,
      mediumRiskNodesCount: mediumRiskCount,
      lowRiskNodesCount: lowRiskCount,
      totalOpenFindings: totalFindings
    };
  }

  /**
   * Exports matrix as CSV format
   */
  public static exportToCSV(cells: HeatmapCellData[], dimensionTitle: string): string {
    const headers = [
      'Department',
      dimensionTitle,
      'Score (%)',
      'Compliance Status',
      'Risk Level',
      'Controls Implemented / Total',
      'Open Findings',
      'Open Risks',
      'Control Owner',
      'Auditor Signoff',
      'Last Assessed Date'
    ];

    const rows = cells.map(c => [
      `"${c.departmentName}"`,
      `"${c.targetCode}: ${c.targetTitle}"`,
      c.score,
      c.status,
      c.riskLevel,
      `"${c.controlsImplemented}/${c.controlsTotal}"`,
      c.openFindingsCount,
      c.openRisksCount,
      `"${c.controlOwner}"`,
      c.auditorSignoff ? 'YES' : 'NO',
      c.lastAssessedAt
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  /**
   * Retrieves current Inherent Risk weightings for ISO clauses
   */
  public static getISOInherentRisks(): Record<string, ISOClauseInherentRisk> {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_INHERENT_RISKS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_ISO_INHERENT_RISKS, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load inherent risks from storage:', e);
    }
    return { ...DEFAULT_ISO_INHERENT_RISKS };
  }

  /**
   * Retrieves Inherent Risk info for a specific clause code
   */
  public static getISOInherentRisk(clauseCode: string): ISOClauseInherentRisk {
    const risks = this.getISOInherentRisks();
    if (risks[clauseCode]) {
      return risks[clauseCode];
    }
    // Fallback if not found
    return {
      clauseCode,
      title: clauseCode,
      shortTitle: clauseCode,
      inherentRiskLevel: 'MEDIUM',
      inherentRiskWeight: 1.0,
      exposureIndex: 50,
      threatCategory: 'General Governance & Controls',
      auditSeverity: 'Standard ISMS baseline',
      threatDescription: 'Standard operational and procedural compliance requirement.'
    };
  }

  /**
   * Saves updated Inherent Risk weightings
   */
  public static saveISOInherentRisks(risks: Record<string, ISOClauseInherentRisk>): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_INHERENT_RISKS_KEY, JSON.stringify(risks));
    } catch (e) {
      console.warn('Failed to save inherent risks:', e);
    }
  }

  /**
   * Resets Inherent Risk weightings to authoritative ISO 27001 default baseline
   */
  public static resetISOInherentRisks(): Record<string, ISOClauseInherentRisk> {
    localStorage.removeItem(LOCAL_STORAGE_INHERENT_RISKS_KEY);
    return { ...DEFAULT_ISO_INHERENT_RISKS };
  }

  /**
   * Updates a single ISO clause's inherent risk weight
   */
  public static updateClauseInherentRiskWeight(clauseCode: string, weight: number): Record<string, ISOClauseInherentRisk> {
    const current = this.getISOInherentRisks();
    if (current[clauseCode]) {
      const updatedLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' =
        weight >= 1.6 ? 'CRITICAL' : weight >= 1.3 ? 'HIGH' : weight >= 1.0 ? 'MEDIUM' : 'LOW';
      current[clauseCode] = {
        ...current[clauseCode],
        inherentRiskWeight: Math.round(weight * 10) / 10,
        inherentRiskLevel: updatedLevel
      };
      this.saveISOInherentRisks(current);
    }
    return current;
  }

  /**
   * Calculates visual intensity styling, exposure index, and risk badges based on Inherent Risk Weighting
   */
  public static calculateInherentRiskIntensity(
    score: number,
    status: HeatmapStatus,
    targetCode: string,
    isWeighted: boolean,
    theme: 'light' | 'dark' | 'midnight' = 'dark'
  ): {
    bgClass: string;
    weight: number;
    inherentRiskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    effectiveExposure: number;
    isAmplified: boolean;
    isSubdued: boolean;
    badgeLabel: string;
    badgeColor: string;
  } {
    const riskInfo = this.getISOInherentRisk(targetCode);
    const weight = isWeighted ? riskInfo.inherentRiskWeight : 1.0;
    const effectiveExposure = Math.round(Math.min(100, (100 - score) * weight));

    if (status === 'NOT_APPLICABLE') {
      return {
        bgClass: theme === 'light'
          ? 'bg-slate-100 text-slate-400 border-slate-200'
          : 'bg-slate-900/40 text-slate-500 border-slate-800',
        weight: 1.0,
        inherentRiskLevel: riskInfo.inherentRiskLevel,
        effectiveExposure: 0,
        isAmplified: false,
        isSubdued: false,
        badgeLabel: 'N/A',
        badgeColor: 'text-slate-400'
      };
    }

    const isAmplified = isWeighted && weight >= 1.3;
    const isSubdued = isWeighted && weight <= 0.95;

    // 1. Non-Compliant (< 50%)
    if (score < 50 || status === 'NON_COMPLIANT') {
      if (isAmplified) {
        // High/Critical Inherent Risk Gap -> Amplified Crimson with pulsating alert & deep shadow
        return {
          bgClass: theme === 'light'
            ? 'bg-rose-100 text-rose-950 border-rose-500 shadow-md shadow-rose-200 ring-2 ring-rose-500/70 hover:bg-rose-200/90 font-bold'
            : 'bg-rose-950/90 text-rose-100 border-rose-500 shadow-lg shadow-rose-950/70 ring-2 ring-rose-500/80 hover:bg-rose-900 font-bold',
          weight,
          inherentRiskLevel: riskInfo.inherentRiskLevel,
          effectiveExposure,
          isAmplified: true,
          isSubdued: false,
          badgeLabel: `${weight}x CRIT`,
          badgeColor: 'text-rose-400'
        };
      } else if (isSubdued) {
        // Low Inherent Risk Gap -> Subdued visual intensity
        return {
          bgClass: theme === 'light'
            ? 'bg-rose-50/75 text-rose-800 border-rose-200/80 opacity-80 hover:opacity-100'
            : 'bg-rose-950/30 text-rose-300/80 border-rose-800/40 opacity-80 hover:opacity-100',
          weight,
          inherentRiskLevel: riskInfo.inherentRiskLevel,
          effectiveExposure,
          isAmplified: false,
          isSubdued: true,
          badgeLabel: `${weight}x LOW`,
          badgeColor: 'text-rose-300/80'
        };
      } else {
        // Standard Inherent Risk Gap
        return {
          bgClass: theme === 'light'
            ? 'bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100/90'
            : 'bg-rose-950/50 text-rose-300 border-rose-500/50 hover:bg-rose-900/70 hover:border-rose-400',
          weight,
          inherentRiskLevel: riskInfo.inherentRiskLevel,
          effectiveExposure,
          isAmplified: false,
          isSubdued: false,
          badgeLabel: isWeighted ? `${weight}x MED` : '',
          badgeColor: 'text-rose-400'
        };
      }
    }

    // 2. In Progress (50% - 84%)
    if (score < 85 || status === 'IN_PROGRESS') {
      if (isAmplified) {
        // In Progress on High/Critical Inherent Risk -> Heightened Amber Urgency
        return {
          bgClass: theme === 'light'
            ? 'bg-amber-100 text-amber-950 border-amber-500 shadow-xs ring-1 ring-amber-500/60 hover:bg-amber-200/90 font-semibold'
            : 'bg-amber-950/80 text-amber-200 border-amber-500 shadow-md shadow-amber-950/50 ring-1 ring-amber-500/80 hover:bg-amber-900/80 font-semibold',
          weight,
          inherentRiskLevel: riskInfo.inherentRiskLevel,
          effectiveExposure,
          isAmplified: true,
          isSubdued: false,
          badgeLabel: `${weight}x URG`,
          badgeColor: 'text-amber-300'
        };
      } else if (isSubdued) {
        return {
          bgClass: theme === 'light'
            ? 'bg-amber-50/75 text-amber-800 border-amber-200/80 opacity-80 hover:opacity-100'
            : 'bg-amber-950/25 text-amber-300/80 border-amber-800/30 opacity-80 hover:opacity-100',
          weight,
          inherentRiskLevel: riskInfo.inherentRiskLevel,
          effectiveExposure,
          isAmplified: false,
          isSubdued: true,
          badgeLabel: `${weight}x LOW`,
          badgeColor: 'text-amber-300/80'
        };
      } else {
        return {
          bgClass: theme === 'light'
            ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100/90'
            : 'bg-amber-950/40 text-amber-300 border-amber-500/40 hover:bg-amber-900/60 hover:border-amber-400',
          weight,
          inherentRiskLevel: riskInfo.inherentRiskLevel,
          effectiveExposure,
          isAmplified: false,
          isSubdued: false,
          badgeLabel: isWeighted ? `${weight}x MED` : '',
          badgeColor: 'text-amber-400'
        };
      }
    }

    // 3. Compliant (>= 85%)
    if (isAmplified) {
      // High Inherent Risk fully fortified
      return {
        bgClass: theme === 'light'
          ? 'bg-emerald-100 text-emerald-950 border-emerald-500 shadow-xs ring-1 ring-emerald-500/40 hover:bg-emerald-200/90 font-semibold'
          : 'bg-emerald-950/65 text-emerald-200 border-emerald-500/70 shadow-emerald-950/40 ring-1 ring-emerald-500/50 hover:bg-emerald-900/70 font-semibold',
        weight,
        inherentRiskLevel: riskInfo.inherentRiskLevel,
        effectiveExposure,
        isAmplified: true,
        isSubdued: false,
        badgeLabel: `${weight}x FORT`,
        badgeColor: 'text-emerald-300'
      };
    } else if (isSubdued) {
      return {
        bgClass: theme === 'light'
          ? 'bg-emerald-50/75 text-emerald-800 border-emerald-200/80 opacity-85 hover:opacity-100'
          : 'bg-emerald-950/25 text-emerald-300/80 border-emerald-800/30 opacity-85 hover:opacity-100',
        weight,
        inherentRiskLevel: riskInfo.inherentRiskLevel,
        effectiveExposure,
        isAmplified: false,
        isSubdued: true,
        badgeLabel: `${weight}x LOW`,
        badgeColor: 'text-emerald-300/80'
      };
    } else {
      return {
        bgClass: theme === 'light'
          ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100/90'
          : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60 hover:border-emerald-400',
        weight,
        inherentRiskLevel: riskInfo.inherentRiskLevel,
        effectiveExposure,
        isAmplified: false,
        isSubdued: false,
        badgeLabel: isWeighted ? `${weight}x MED` : '',
        badgeColor: 'text-emerald-400'
      };
    }
  }

  /**
   * Calculates department unweighted and inherent-risk weighted posture
   */
  public static calculateDepartmentWeightedScore(
    deptCells: HeatmapCellData[],
    isWeighted: boolean
  ): { rawAverage: number; weightedAverage: number; effectiveAverage: number } {
    if (deptCells.length === 0) {
      return { rawAverage: 0, weightedAverage: 0, effectiveAverage: 0 };
    }

    const rawTotal = deptCells.reduce((sum, c) => sum + c.score, 0);
    const rawAverage = Math.round(rawTotal / deptCells.length);

    if (!isWeighted) {
      return { rawAverage, weightedAverage: rawAverage, effectiveAverage: rawAverage };
    }

    const inherentRisks = this.getISOInherentRisks();
    let totalWeightedScore = 0;
    let totalWeight = 0;

    deptCells.forEach(cell => {
      // For ISO cells, use clause inherent weight; for MAS cells use domain criticality
      let w = 1.0;
      if (cell.dimensionType === 'ISO_27001' && inherentRisks[cell.targetCode]) {
        w = inherentRisks[cell.targetCode].inherentRiskWeight;
      } else if (cell.dimensionType === 'MAS_TRM') {
        const masDomain = HEATMAP_MAS_MODULES.find(m => m.domainNumber === cell.targetCode);
        if (masDomain) {
          w = masDomain.criticality === 'CRITICAL' ? 1.6 : masDomain.criticality === 'HIGH' ? 1.3 : 1.0;
        }
      }
      totalWeightedScore += cell.score * w;
      totalWeight += w;
    });

    const weightedAverage = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : rawAverage;

    return {
      rawAverage,
      weightedAverage,
      effectiveAverage: weightedAverage
    };
  }

  /**
   * Resets data back to default initial matrix
   */
  public static resetBaseline(): HeatmapCellData[] {
    localStorage.removeItem(LOCAL_STORAGE_CELLS_KEY);
    localStorage.removeItem(LOCAL_STORAGE_INHERENT_RISKS_KEY);
    return this.getAllCells();
  }
}
