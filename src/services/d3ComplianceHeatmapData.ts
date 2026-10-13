// Skanda GRC — D3 Compliance Heatmap Data Service
// Provides adherence metrics across Business Departments and ISO 27001 Controls,
// with dedicated detection and tracking for areas requiring urgent remediation.

import { ISO27001_2022_93_MASTER, ISO27001Control2022Meta } from '../data/iso27001_2022_masterControls';
import { HEATMAP_DEPARTMENTS, HEATMAP_ISO_CLAUSES } from './complianceHeatmapService';

export type ISOThemeType =
  | 'Organizational'
  | 'People'
  | 'Physical'
  | 'Technological'
  | 'Mandatory Clause';

export type AdherenceStatus =
  | 'COMPLIANT'
  | 'IN_PROGRESS'
  | 'NON_COMPLIANT'
  | 'NOT_APPLICABLE';

export type UrgencyLevel =
  | 'CRITICAL_URGENCY'
  | 'HIGH_URGENCY'
  | 'MODERATE'
  | 'NONE';

export interface ISOControlItem {
  code: string;
  title: string;
  shortTitle: string;
  theme: ISOThemeType;
  inherentRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  isPriority: boolean;
  description: string;
  evidenceRequirements: string[];
  verificationProcedure: string;
}

export interface DepartmentNode {
  id: string;
  name: string;
  shortName: string;
  head: string;
  email: string;
  headcount: number;
  criticalSystemsCount: number;
}

export interface AdherenceHeatmapCell {
  id: string;
  departmentId: string;
  departmentName: string;
  departmentHead: string;
  controlCode: string;
  controlTitle: string;
  theme: ISOThemeType;
  adherenceScore: number; // 0 - 100%
  cmmiLevel: 1 | 2 | 3 | 4 | 5;
  status: AdherenceStatus;
  inherentRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  isUrgentRemediation: boolean;
  urgencyLevel: UrgencyLevel;
  urgentReason?: string;
  slaStatus?: 'BREACHED' | 'WARNING_48H' | 'ON_TRACK';
  overdueDays?: number;
  openFindingsCount: number;
  capaTicketId?: string;
  capaAction?: string;
  assignedLead: string;
  targetRemediationDate?: string;
  evidenceStatus: 'VERIFIED' | 'MISSING' | 'STALE';
  lastAssessedAt: string;
  auditorNotes?: string;
}

export interface HeatmapDepartmentSummary {
  department: DepartmentNode;
  averageAdherence: number;
  cmmiLevel: number;
  compliantCount: number;
  inProgressCount: number;
  nonCompliantCount: number;
  urgentRemediationCount: number;
  criticalOverdueDays: number;
}

export interface HeatmapMetricsSummary {
  totalCells: number;
  averageAdherence: number;
  averageCmmiLevel: number;
  compliantCount: number;
  inProgressCount: number;
  nonCompliantCount: number;
  urgentRemediationCount: number;
  slaBreachedCount: number;
  totalOpenFindings: number;
}

export type RiskTrendDirection = 'INCREASED' | 'DECREASED' | 'STABLE';

export interface RiskTrendData {
  direction: RiskTrendDirection;
  currentRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  previousRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  currentScore: number;
  previousScore: number;
  scoreDelta: number;
  label: string;
  badgeClass: string;
  arrowIcon: 'up' | 'down' | 'stable';
  auditCycleLabel: string;
}

/**
 * Calculates risk level trend and audit cycle progression for a control cell.
 * Evaluates whether risk level increased, decreased, or stayed stable since the prior audit cycle.
 */
export function calculateControlRiskTrend(cell: {
  id?: string;
  targetCode?: string;
  controlCode?: string;
  departmentId?: string;
  score?: number;
  adherenceScore?: number;
  riskLevel?: string;
  inherentRisk?: string;
  isUrgentRemediation?: boolean;
  previousScore?: number;
  scoreDelta?: number;
  trend?: string;
}): RiskTrendData {
  const currentScore = cell.score ?? cell.adherenceScore ?? 75;
  const inherent = (cell.riskLevel || cell.inherentRisk || 'MEDIUM') as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

  // Current operational risk level
  let currentRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  if (cell.isUrgentRemediation) {
    currentRisk = 'CRITICAL';
  } else if (cell.riskLevel && ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(cell.riskLevel)) {
    currentRisk = cell.riskLevel as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  } else if (currentScore < 50) {
    currentRisk = inherent === 'CRITICAL' ? 'CRITICAL' : 'HIGH';
  } else if (currentScore < 75) {
    currentRisk = inherent === 'CRITICAL' ? 'HIGH' : 'MEDIUM';
  } else if (currentScore < 85) {
    currentRisk = 'MEDIUM';
  } else {
    currentRisk = 'LOW';
  }

  // Determine previous score from cell or deterministic baseline
  let previousScore = cell.previousScore;
  let scoreDelta = cell.scoreDelta;

  if (previousScore === undefined) {
    const code = cell.controlCode || cell.targetCode || '';
    const deptId = cell.departmentId || '';
    const hash = ((cell.id || '') + code + deptId)
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    if (cell.isUrgentRemediation) {
      // Degraded in recent audit cycle
      previousScore = Math.min(84, currentScore + 26 + (hash % 8));
    } else if (currentScore >= 85) {
      // Improved from prior cycle
      previousScore = Math.max(56, currentScore - 12 - (hash % 10));
    } else {
      // In progress
      const variance = (hash % 15) - 7;
      previousScore = Math.max(35, Math.min(92, currentScore - variance));
    }
    scoreDelta = currentScore - previousScore;
  }

  if (scoreDelta === undefined) {
    scoreDelta = currentScore - previousScore;
  }

  // Derive previous risk level from previous score
  let previousRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  if (previousScore < 50) {
    previousRisk = inherent === 'CRITICAL' ? 'CRITICAL' : 'HIGH';
  } else if (previousScore < 75) {
    previousRisk = inherent === 'CRITICAL' ? 'HIGH' : 'MEDIUM';
  } else if (previousScore < 85) {
    previousRisk = 'MEDIUM';
  } else {
    previousRisk = 'LOW';
  }

  const riskRank = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
  const currRank = riskRank[currentRisk];
  const prevRank = riskRank[previousRisk];

  let direction: RiskTrendDirection = 'STABLE';
  if (currRank > prevRank) {
    direction = 'INCREASED';
  } else if (currRank < prevRank) {
    direction = 'DECREASED';
  } else {
    // If tiers are identical, check adherence score delta
    if (scoreDelta <= -5) {
      direction = 'INCREASED';
    } else if (scoreDelta >= 5) {
      direction = 'DECREASED';
    } else {
      direction = 'STABLE';
    }
  }

  let label = '';
  let badgeClass = '';
  let arrowIcon: 'up' | 'down' | 'stable' = 'stable';

  if (direction === 'INCREASED') {
    arrowIcon = 'up';
    label = prevRank !== currRank ? `${previousRisk} → ${currentRisk} (Risk Increased)` : `${currentRisk} (Risk Increased, ${scoreDelta}%)`;
    badgeClass = 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30';
  } else if (direction === 'DECREASED') {
    arrowIcon = 'down';
    label = prevRank !== currRank ? `${previousRisk} → ${currentRisk} (Risk Decreased)` : `${currentRisk} (Risk Decreased, +${scoreDelta}%)`;
    badgeClass = 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
  } else {
    arrowIcon = 'stable';
    label = `Stable (${currentRisk})`;
    badgeClass = 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30';
  }

  return {
    direction,
    currentRisk,
    previousRisk,
    currentScore,
    previousScore,
    scoreDelta,
    label,
    badgeClass,
    arrowIcon,
    auditCycleLabel: 'Last Audit Cycle'
  };
}

const STORAGE_KEY = 'skanda_d3_compliance_heatmap_adherence_cells';

// Standard 8 Enterprise Departments
export const D3_HEATMAP_DEPARTMENTS: DepartmentNode[] = [
  ...HEATMAP_DEPARTMENTS.map(d => ({
    id: d.id,
    name: d.name,
    shortName: d.shortName,
    head: d.head,
    email: d.email,
    headcount: d.headcount,
    criticalSystemsCount: d.criticalSystemsCount
  })),
  {
    id: 'dept-exec',
    name: 'Executive & Corporate Governance',
    shortName: 'Executive',
    head: 'Dr. Rachel Vance',
    email: 'r.vance@apexfintech.com',
    headcount: 7,
    criticalSystemsCount: 3
  }
];

// Key 24 Priority ISO 27001 Controls spanning all 4 Annex A Themes + Mandatory Clauses
export const D3_PRIORITY_ISO_CONTROLS: ISOControlItem[] = [
  // Organizational (Theme A.5)
  {
    code: 'A.5.1',
    title: 'Policies for information security',
    shortTitle: 'A.5.1 Security Policies',
    theme: 'Organizational',
    inherentRisk: 'MEDIUM',
    isPriority: true,
    description: 'Information security policy and topic-specific policies defined, approved, and communicated.',
    evidenceRequirements: ['Approved ISMS Master Policy v2.4', 'Annual Board Review Records'],
    verificationProcedure: 'Inspect management sign-off and employee LMS policy acceptance rate.'
  },
  {
    code: 'A.5.3',
    title: 'Segregation of duties',
    shortTitle: 'A.5.3 Duty Segregation',
    theme: 'Organizational',
    inherentRisk: 'HIGH',
    isPriority: true,
    description: 'Conflicting duties and conflicting areas of responsibility segregated across roles.',
    evidenceRequirements: ['CI/CD Peer Review Policy', 'Database Production Access Boundaries'],
    verificationProcedure: 'Sample recent production releases to verify developer-merge segregation.'
  },
  {
    code: 'A.5.8',
    title: 'Information security in project management',
    shortTitle: 'A.5.8 Project Security',
    theme: 'Organizational',
    inherentRisk: 'MEDIUM',
    isPriority: true,
    description: 'Information security integrated into project management and product release pipelines.',
    evidenceRequirements: ['Security Gate Signoffs in Jira', 'Threat Modeling Workpapers'],
    verificationProcedure: 'Review 5 major feature releases for documented security gates.'
  },
  {
    code: 'A.5.15',
    title: 'Access control & privilege management',
    shortTitle: 'A.5.15 Access Control',
    theme: 'Organizational',
    inherentRisk: 'CRITICAL',
    isPriority: true,
    description: 'Rules for access control to information assets and system functions established and enforced.',
    evidenceRequirements: ['Okta IAM Group Policies', 'Quarterly Privileged Access Attestation Log'],
    verificationProcedure: 'Verify IAM zero-standing-privilege enforcement and admin MFA logs.'
  },
  {
    code: 'A.5.19',
    title: 'Information security in supplier relationships',
    shortTitle: 'A.5.19 Supplier Security',
    theme: 'Organizational',
    inherentRisk: 'HIGH',
    isPriority: true,
    description: 'Processes to mitigate risks associated with suppliers access to organizational assets.',
    evidenceRequirements: ['Vendor Due Diligence Questionnaires', 'Third-Party SOC 2 Type II Binders'],
    verificationProcedure: 'Inspect supplier risk tiering matrix and verified contractual data protection clauses.'
  },
  {
    code: 'A.5.24',
    title: 'Information security incident management planning',
    shortTitle: 'A.5.24 Incident Mgmt',
    theme: 'Organizational',
    inherentRisk: 'CRITICAL',
    isPriority: true,
    description: 'Planning, preparation, detection, and reporting of information security incidents.',
    evidenceRequirements: ['Incident Response Runbooks', 'Annual Red Team War Room Drill Report'],
    verificationProcedure: 'Validate MAS Notice 644 / ISO incident escalation playbooks and SLA clocks.'
  },
  {
    code: 'A.5.37',
    title: 'Documented operating procedures',
    shortTitle: 'A.5.37 Operating SOPs',
    theme: 'Organizational',
    inherentRisk: 'LOW',
    isPriority: true,
    description: 'Operating procedures for information processing facilities documented and maintained.',
    evidenceRequirements: ['Runbooks in Confluence', 'Production Change Control SOPs'],
    verificationProcedure: 'Confirm all Tier-1 infrastructure systems have validated operating runbooks.'
  },

  // People Controls (Theme A.6)
  {
    code: 'A.6.1',
    title: 'Screening',
    shortTitle: 'A.6.1 Background Screening',
    theme: 'People',
    inherentRisk: 'MEDIUM',
    isPriority: true,
    description: 'Background verification checks on all candidates for employment conducted in accordance with regulations.',
    evidenceRequirements: ['Pre-employment Background Check Registers', 'Criminal & Credit Records'],
    verificationProcedure: 'Sample 10 recent employee hires to confirm completed screening before access grant.'
  },
  {
    code: 'A.6.3',
    title: 'Information security awareness, education and training',
    shortTitle: 'A.6.3 Security Awareness',
    theme: 'People',
    inherentRisk: 'HIGH',
    isPriority: true,
    description: 'Personnel receive appropriate security awareness education and regular updates in organizational policies.',
    evidenceRequirements: ['KnowBe4 LMS Completion Reports (>98%)', 'Monthly Phishing Simulation Metrics'],
    verificationProcedure: 'Check training completion rate and remedial workflows for repeated phishing clickers.'
  },
  {
    code: 'A.6.5',
    title: 'Responsibilities after termination or change of employment',
    shortTitle: 'A.6.5 Offboarding Revocation',
    theme: 'People',
    inherentRisk: 'HIGH',
    isPriority: true,
    description: 'Information security responsibilities that remain valid after termination enforced; access revoked promptly.',
    evidenceRequirements: ['Automated HR-to-IT Deprovisioning Webhook Logs', 'Asset Return Slips'],
    verificationProcedure: 'Sample 5 terminated employees to confirm Okta/AWS access revoked within 2 hours.'
  },
  {
    code: 'A.6.6',
    title: 'Remote working',
    shortTitle: 'A.6.6 Remote Working',
    theme: 'People',
    inherentRisk: 'HIGH',
    isPriority: true,
    description: 'Security measures applied when personnel work remotely to protect assets accessed or processed.',
    evidenceRequirements: ['Intune MDM Compliance Policy', 'CrowdStrike Falcon Sensor Coverage (>99%)'],
    verificationProcedure: 'Audit remote endpoint fleet for disk encryption, EDR presence, and VPN requirements.'
  },

  // Physical Controls (Theme A.7)
  {
    code: 'A.7.1',
    title: 'Physical security perimeters',
    shortTitle: 'A.7.1 Perimeter Security',
    theme: 'Physical',
    inherentRisk: 'MEDIUM',
    isPriority: true,
    description: 'Security perimeters defined and used to protect areas that contain information assets.',
    evidenceRequirements: ['Biometric Access Logs', 'CCTV 90-Day Retention Configuration'],
    verificationProcedure: 'Inspect server room physical access badge logs and badge reader calibrations.'
  },
  {
    code: 'A.7.4',
    title: 'Physical security monitoring',
    shortTitle: 'A.7.4 Physical Monitoring',
    theme: 'Physical',
    inherentRisk: 'MEDIUM',
    isPriority: true,
    description: 'Premises monitored for unauthorized physical access continuously.',
    evidenceRequirements: ['NOC Facility Monitor Feeds', 'Security Guard Patrol Audit Trails'],
    verificationProcedure: 'Confirm physical intrusion detection system and camera coverage at all ingress points.'
  },
  {
    code: 'A.7.10',
    title: 'Storage media',
    shortTitle: 'A.7.10 Storage Media Disposal',
    theme: 'Physical',
    inherentRisk: 'HIGH',
    isPriority: true,
    description: 'Storage media managed through their lifecycle of acquisition, use, transportation and disposal.',
    evidenceRequirements: ['NIST SP 800-88 Sanitization Certificates', 'Secure Hardware Disposal Register'],
    verificationProcedure: 'Verify certified magnetic degaussing and shredding certificates for decommissioned drives.'
  },

  // Technological Controls (Theme A.8)
  {
    code: 'A.8.1',
    title: 'User endpoint devices',
    shortTitle: 'A.8.1 Endpoint Hardening',
    theme: 'Technological',
    inherentRisk: 'HIGH',
    isPriority: true,
    description: 'Information stored on, processed by or accessible via user endpoint devices protected.',
    evidenceRequirements: ['CIS Benchmark Level 2 Endpoint Policies', 'Automated Patch Enforcement Logs'],
    verificationProcedure: 'Check BitLocker/FileVault encryption status and zero local administrator privilege policy.'
  },
  {
    code: 'A.8.7',
    title: 'Protection against malware',
    shortTitle: 'A.8.7 Anti-Malware / EDR',
    theme: 'Technological',
    inherentRisk: 'CRITICAL',
    isPriority: true,
    description: 'Protection against malware implemented and supported by appropriate user awareness.',
    evidenceRequirements: ['CrowdStrike Falcon Real-Time EDR Console', 'Malware Signature Daily Update Feed'],
    verificationProcedure: 'Inspect telemetry feed showing zero unquarantined malware incidents across servers.'
  },
  {
    code: 'A.8.8',
    title: 'Management of technical vulnerabilities',
    shortTitle: 'A.8.8 Vulnerability Mgmt',
    theme: 'Technological',
    inherentRisk: 'CRITICAL',
    isPriority: true,
    description: 'Information about technical vulnerabilities obtained in timely fashion and addressed based on exposure.',
    evidenceRequirements: ['Wiz Cloud Security Scans', 'Tenable.io Infrastructure Vulnerability Reports'],
    verificationProcedure: 'Verify SLA for Critical (14-day) and High (30-day) patch remediation adherence.'
  },
  {
    code: 'A.8.9',
    title: 'Configuration management',
    shortTitle: 'A.8.9 Config Management',
    theme: 'Technological',
    inherentRisk: 'HIGH',
    isPriority: true,
    description: 'Configurations, including security configurations, of hardware, software, services and networks established.',
    evidenceRequirements: ['Terraform IaC Drift Detection Logs', 'CIS Hardening Baseline Benchmarks'],
    verificationProcedure: 'Inspect automated configuration drift alerts in AWS Config.'
  },
  {
    code: 'A.8.12',
    title: 'Data leakage prevention (DLP)',
    shortTitle: 'A.8.12 Data Leakage DLP',
    theme: 'Technological',
    inherentRisk: 'CRITICAL',
    isPriority: true,
    description: 'Data leakage prevention measures applied to systems, networks and any other devices that process sensitive info.',
    evidenceRequirements: ['Cloudflare DLP Rule Configuration', 'Endpoint DLP File Egress Audit Logs'],
    verificationProcedure: 'Validate blocking of unencrypted customer PII / cardholder data transmission.'
  },
  {
    code: 'A.8.13',
    title: 'Information backup',
    shortTitle: 'A.8.13 Information Backup',
    theme: 'Technological',
    inherentRisk: 'HIGH',
    isPriority: true,
    description: 'Backup copies of information, software and systems maintained and regularly tested against agreed policy.',
    evidenceRequirements: ['AWS Backup Air-Gapped Vault Reports', 'Quarterly RTO/RPO Restoration Test Logs'],
    verificationProcedure: 'Verify immutable S3 Object Lock compliance retention and successful restore drill.'
  },
  {
    code: 'A.8.16',
    title: 'Monitoring activities',
    shortTitle: 'A.8.16 SIEM & Monitoring',
    theme: 'Technological',
    inherentRisk: 'HIGH',
    isPriority: true,
    description: 'Networks, systems and applications monitored for anomalous behavior and potential security events evaluated.',
    evidenceRequirements: ['Datadog Security Monitoring Alerts', 'Splunk SIEM 365-Day Log Ingestion'],
    verificationProcedure: 'Confirm automated alerts routed to 24/7 SOC for anomalous egress spikes.'
  },
  {
    code: 'A.8.20',
    title: 'Network security',
    shortTitle: 'A.8.20 Network Security',
    theme: 'Technological',
    inherentRisk: 'HIGH',
    isPriority: true,
    description: 'Networks and network devices secured, managed and controlled to protect information in systems.',
    evidenceRequirements: ['AWS VPC Microsegmentation Rules', 'Next-Gen Firewall Inspection Logs'],
    verificationProcedure: 'Verify zero public ingress on internal microservices and DMZ separation.'
  },
  {
    code: 'A.8.24',
    title: 'Use of cryptography',
    shortTitle: 'A.8.24 Cryptography & Keys',
    theme: 'Technological',
    inherentRisk: 'CRITICAL',
    isPriority: true,
    description: 'Rules for effective use of cryptography, including cryptographic key management, defined and implemented.',
    evidenceRequirements: ['AWS KMS Automated Key Rotation Config', 'TLS 1.3 Cipher Suite Enforcement'],
    verificationProcedure: 'Inspect TLS termination ciphers and verify master encryption key rotation schedules.'
  },
  {
    code: 'A.8.28',
    title: 'Secure coding',
    shortTitle: 'A.8.28 Secure Coding',
    theme: 'Technological',
    inherentRisk: 'HIGH',
    isPriority: true,
    description: 'Secure coding principles applied to software development.',
    evidenceRequirements: ['Snyk SAST/DAST CI/CD Scan Results', 'OWASP Top 10 Developer Training Records'],
    verificationProcedure: 'Confirm automated blocking of build pipelines on High/Critical SAST findings.'
  }
];

// ISO 27001 Mandatory Clauses (4 - 10)
export const D3_MANDATORY_CLAUSES: ISOControlItem[] = [
  {
    code: 'Clause 4',
    title: 'Context of the organization & ISMS scope',
    shortTitle: 'Clause 4 Context',
    theme: 'Mandatory Clause',
    inherentRisk: 'LOW',
    isPriority: false,
    description: 'Internal and external issues, interested party needs, and formal boundaries of the ISMS defined.',
    evidenceRequirements: ['Scope Statement v3.0', 'Interested Parties Obligations Register'],
    verificationProcedure: 'Review organizational boundaries and exclusions.'
  },
  {
    code: 'Clause 5',
    title: 'Leadership and commitment',
    shortTitle: 'Clause 5 Leadership',
    theme: 'Mandatory Clause',
    inherentRisk: 'MEDIUM',
    isPriority: false,
    description: 'Management commitment demonstrated, security policy approved, and roles assigned.',
    evidenceRequirements: ['Executive Board Security Charter', 'CISO Resource Allocation Approval'],
    verificationProcedure: 'Verify leadership meeting minutes and security budget signoffs.'
  },
  {
    code: 'Clause 6',
    title: 'Planning & risk assessment',
    shortTitle: 'Clause 6 Risk Planning',
    theme: 'Mandatory Clause',
    inherentRisk: 'HIGH',
    isPriority: false,
    description: 'Actions to address risks and opportunities, risk treatment methodology, and objectives established.',
    evidenceRequirements: ['Enterprise Risk Assessment Report', 'Statement of Applicability (SoA) v4.1'],
    verificationProcedure: 'Inspect risk scoring criteria and treatment plan milestones.'
  },
  {
    code: 'Clause 7',
    title: 'Support and resources',
    shortTitle: 'Clause 7 Support',
    theme: 'Mandatory Clause',
    inherentRisk: 'LOW',
    isPriority: false,
    description: 'Resources, competence, awareness, communication, and documented information managed.',
    evidenceRequirements: ['Competence Training Matrix', 'Document Control Lifecycle Register'],
    verificationProcedure: 'Check evidence of version control and annual document re-certification.'
  },
  {
    code: 'Clause 8',
    title: 'Operation and control execution',
    shortTitle: 'Clause 8 Operation',
    theme: 'Mandatory Clause',
    inherentRisk: 'HIGH',
    isPriority: false,
    description: 'Operational planning and control executed, risk treatments implemented effectively.',
    evidenceRequirements: ['Operational Security Workpapers', 'Change Management Approval Audit Trails'],
    verificationProcedure: 'Sample live changes to ensure risk assessments precede implementation.'
  },
  {
    code: 'Clause 9',
    title: 'Performance evaluation & internal audit',
    shortTitle: 'Clause 9 Evaluation',
    theme: 'Mandatory Clause',
    inherentRisk: 'MEDIUM',
    isPriority: false,
    description: 'Monitoring, measurement, analysis, internal audit program, and management reviews conducted.',
    evidenceRequirements: ['Annual Internal Audit Plan & Report', 'Quarterly C-Suite Management Review Binder'],
    verificationProcedure: 'Inspect internal audit non-conformity tracking and auditor independence.'
  },
  {
    code: 'Clause 10',
    title: 'Improvement, nonconformity and CAPA',
    shortTitle: 'Clause 10 CAPA',
    theme: 'Mandatory Clause',
    inherentRisk: 'MEDIUM',
    isPriority: false,
    description: 'Continual improvement evaluated; corrective actions taken on audit nonconformities promptly.',
    evidenceRequirements: ['CAPA Remediation Register', 'Root Cause Analysis Reports'],
    verificationProcedure: 'Sample 5 resolved findings to verify effectiveness check after 90 days.'
  }
];

export class D3ComplianceHeatmapService {
  /**
   * Generates default adherence cells across departments and ISO controls,
   * with deliberate, realistic urgent remediation hot spots.
   */
  public static generateInitialCells(): AdherenceHeatmapCell[] {
    const cells: AdherenceHeatmapCell[] = [];
    const controls = [...D3_PRIORITY_ISO_CONTROLS, ...D3_MANDATORY_CLAUSES];
    const departments = D3_HEATMAP_DEPARTMENTS;

    departments.forEach(dept => {
      controls.forEach(ctrl => {
        const cellId = `cell-${dept.id}-${ctrl.code.replace(/[^a-zA-Z0-9]/g, '_')}`;

        // Baseline realistic baseline adherence
        let adherenceScore = 86;
        let isUrgent = false;
        let urgency: UrgencyLevel = 'NONE';
        let urgentReason: string | undefined = undefined;
        let slaStatus: 'BREACHED' | 'WARNING_48H' | 'ON_TRACK' = 'ON_TRACK';
        let overdueDays = 0;
        let openFindings = 0;
        let capaTicketId: string | undefined = undefined;
        let capaAction: string | undefined = undefined;
        let assignedLead = dept.head;
        let evidenceStatus: 'VERIFIED' | 'MISSING' | 'STALE' = 'VERIFIED';

        // Specific Realistic GRC Hotspots for Urgent Remediation:
        if (dept.id === 'dept-infra' && ctrl.code === 'A.8.8') {
          // IT Infrastructure x Vulnerability Management
          adherenceScore = 28;
          isUrgent = true;
          urgency = 'CRITICAL_URGENCY';
          urgentReason = 'Automated patch cycle failed on Core Kubernetes clusters. 3 Critical Zero-Day CVEs remain unpatched >30 days.';
          slaStatus = 'BREACHED';
          overdueDays = 34;
          openFindings = 4;
          capaTicketId = 'CAPA-2026-041';
          capaAction = 'Deploy emergency container base-image rebuild pipeline; schedule 48-hour maintenance downtime.';
          evidenceStatus = 'MISSING';
        } else if (dept.id === 'dept-devops' && ctrl.code === 'A.5.15') {
          // Engineering & DevOps x Access Control
          adherenceScore = 34;
          isUrgent = true;
          urgency = 'CRITICAL_URGENCY';
          urgentReason = 'Hardcoded long-lived AWS IAM secrets discovered in microservice repositories; 4 developers hold direct prod DB write permissions.';
          slaStatus = 'BREACHED';
          overdueDays = 26;
          openFindings = 3;
          capaTicketId = 'CAPA-2026-052';
          capaAction = 'Migrate credentials to HashiCorp Vault dynamic leases; enforce GitHub pre-commit secret scanning hooks.';
          evidenceStatus = 'STALE';
        } else if (dept.id === 'dept-procurement' && ctrl.code === 'A.5.19') {
          // Procurement x Supplier Relationships
          adherenceScore = 32;
          isUrgent = true;
          urgency = 'HIGH_URGENCY';
          urgentReason = '8 Tier-1 SaaS cloud vendors lack current SOC 2 Type II audit attestations; supplier risk tiering not executed for Q2/Q3.';
          slaStatus = 'BREACHED';
          overdueDays = 21;
          openFindings = 2;
          capaTicketId = 'CAPA-2026-068';
          capaAction = 'Issue contractual compliance notices to vendors; block unvetted SaaS procurement in Coupa.';
          evidenceStatus = 'MISSING';
        } else if (dept.id === 'dept-finance' && ctrl.code === 'A.8.24') {
          // Finance x Cryptography
          adherenceScore = 42;
          isUrgent = true;
          urgency = 'CRITICAL_URGENCY';
          urgentReason = 'Payment webhook egress endpoint utilizing deprecated TLS 1.2 CBC cipher suites; AWS KMS annual key rollover overdue by 6 months.';
          slaStatus = 'WARNING_48H';
          overdueDays = 14;
          openFindings = 2;
          capaTicketId = 'CAPA-2026-079';
          capaAction = 'Upgrade payment gateway load balancer to strict TLS 1.3 cipher suite and trigger KMS customer-managed key rotation.';
          evidenceStatus = 'STALE';
        } else if (dept.id === 'dept-hr' && ctrl.code === 'A.6.6') {
          // HR & People x Remote Working
          adherenceScore = 45;
          isUrgent = true;
          urgency = 'HIGH_URGENCY';
          urgentReason = '23 remote contractors accessing corporate Google Workspace without enforced Microsoft Intune MDM compliance and disk encryption.';
          slaStatus = 'WARNING_48H';
          overdueDays = 11;
          openFindings = 1;
          capaTicketId = 'CAPA-2026-094';
          capaAction = 'Enforce conditional access policy in Okta/Entra ID: zero sign-in without healthy Intune compliance posture.';
          evidenceStatus = 'MISSING';
        } else if (dept.id === 'dept-product' && ctrl.code === 'A.8.12') {
          // Product x DLP
          adherenceScore = 38;
          isUrgent = true;
          urgency = 'HIGH_URGENCY';
          urgentReason = 'Unrestricted CSV export of customer financial logs permitted in internal support tool; absence of automated DLP content inspection.';
          slaStatus = 'BREACHED';
          overdueDays = 18;
          openFindings = 2;
          capaTicketId = 'CAPA-2026-102';
          capaAction = 'Implement Cloudflare Zero Trust DLP inspection for outbound traffic; mask PII fields on support consoles.';
          evidenceStatus = 'MISSING';
        } else if (dept.id === 'dept-infra' && ctrl.code === 'A.8.13') {
          // IT Infrastructure x Information Backup
          adherenceScore = 48;
          isUrgent = true;
          urgency = 'HIGH_URGENCY';
          urgentReason = 'Quarterly air-gapped disaster recovery restoration simulation timed out; immutable backup replication verification failed.';
          slaStatus = 'ON_TRACK';
          overdueDays = 6;
          openFindings = 1;
          capaTicketId = 'CAPA-2026-114';
          capaAction = 'Re-run AWS Backup cross-region copy with S3 Object Lock compliance retention; execute automated recovery drill.';
          evidenceStatus = 'STALE';
        } else if (dept.id === 'dept-legal' && ctrl.code === 'Clause 6') {
          // Legal & Risk x Clause 6 Risk Assessment
          adherenceScore = 62;
          isUrgent = false;
          urgency = 'MODERATE';
          openFindings = 1;
          evidenceStatus = 'VERIFIED';
        } else {
          // Realistic distribution based on department domain
          if (dept.id === 'dept-devops') {
            if (ctrl.theme === 'Technological') adherenceScore = Math.floor(75 + Math.random() * 20);
            else if (ctrl.theme === 'Organizational') adherenceScore = Math.floor(70 + Math.random() * 22);
            else adherenceScore = Math.floor(65 + Math.random() * 25);
          } else if (dept.id === 'dept-infra') {
            if (ctrl.theme === 'Technological') adherenceScore = Math.floor(72 + Math.random() * 20);
            else if (ctrl.theme === 'Physical') adherenceScore = Math.floor(82 + Math.random() * 16);
            else adherenceScore = Math.floor(68 + Math.random() * 22);
          } else if (dept.id === 'dept-hr') {
            if (ctrl.theme === 'People') adherenceScore = Math.floor(84 + Math.random() * 14);
            else if (ctrl.theme === 'Technological') adherenceScore = Math.floor(58 + Math.random() * 24);
            else adherenceScore = Math.floor(74 + Math.random() * 20);
          } else if (dept.id === 'dept-legal') {
            if (ctrl.theme === 'Mandatory Clause' || ctrl.code === 'A.5.1') adherenceScore = Math.floor(88 + Math.random() * 11);
            else if (ctrl.theme === 'Organizational') adherenceScore = Math.floor(80 + Math.random() * 18);
            else adherenceScore = Math.floor(68 + Math.random() * 25);
          } else if (dept.id === 'dept-exec') {
            if (ctrl.theme === 'Mandatory Clause') adherenceScore = Math.floor(90 + Math.random() * 9);
            else adherenceScore = Math.floor(80 + Math.random() * 18);
          } else {
            adherenceScore = Math.floor(70 + Math.random() * 24);
          }
        }

        // Derive status & CMMI Level
        let status: AdherenceStatus = 'IN_PROGRESS';
        let cmmi: 1 | 2 | 3 | 4 | 5 = 3;

        if (adherenceScore >= 85) {
          status = 'COMPLIANT';
          cmmi = adherenceScore >= 95 ? 5 : 4;
        } else if (adherenceScore >= 50) {
          status = 'IN_PROGRESS';
          cmmi = adherenceScore >= 70 ? 3 : 2;
        } else {
          status = 'NON_COMPLIANT';
          cmmi = 1;
        }

        cells.push({
          id: cellId,
          departmentId: dept.id,
          departmentName: dept.name,
          departmentHead: dept.head,
          controlCode: ctrl.code,
          controlTitle: ctrl.title,
          theme: ctrl.theme,
          adherenceScore,
          cmmiLevel: cmmi,
          status,
          inherentRisk: ctrl.inherentRisk,
          isUrgentRemediation: isUrgent,
          urgencyLevel: urgency,
          urgentReason,
          slaStatus: isUrgent ? slaStatus : undefined,
          overdueDays: isUrgent ? overdueDays : 0,
          openFindingsCount: openFindings,
          capaTicketId,
          capaAction,
          assignedLead,
          targetRemediationDate: isUrgent ? '2026-10-15' : undefined,
          evidenceStatus,
          lastAssessedAt: '2026-09-24',
          auditorNotes: isUrgent
            ? `Lead Auditor Alert: Immediate corrective action mandatory prior to upcoming Stage 2 certification audit gate.`
            : `Controls tested; operational sampling matches documented evidence.`
        });
      });
    });

    return cells;
  }

  /**
   * Retrieves all cells from localStorage or instantiates defaults
   */
  public static getAllCells(): AdherenceHeatmapCell[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load D3 compliance heatmap cells:', e);
    }

    const initial = this.generateInitialCells();
    this.saveCells(initial);
    return initial;
  }

  /**
   * Saves cells to localStorage
   */
  public static saveCells(cells: AdherenceHeatmapCell[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cells));
    } catch (e) {
      console.warn('Failed to persist D3 compliance heatmap cells:', e);
    }
  }

  /**
   * Updates an individual cell's score or status
   */
  public static updateCell(
    cellId: string,
    updates: Partial<AdherenceHeatmapCell>
  ): AdherenceHeatmapCell[] {
    const all = this.getAllCells();
    const index = all.findIndex(c => c.id === cellId);
    if (index !== -1) {
      const existing = all[index];
      const updatedScore = updates.adherenceScore !== undefined ? updates.adherenceScore : existing.adherenceScore;
      
      let status = existing.status;
      let cmmi = existing.cmmiLevel;
      if (updates.adherenceScore !== undefined) {
        if (updatedScore >= 85) {
          status = 'COMPLIANT';
          cmmi = updatedScore >= 95 ? 5 : 4;
        } else if (updatedScore >= 50) {
          status = 'IN_PROGRESS';
          cmmi = updatedScore >= 70 ? 3 : 2;
        } else {
          status = 'NON_COMPLIANT';
          cmmi = 1;
        }
      }

      // If marked as remediated
      let isUrgent = updates.isUrgentRemediation !== undefined ? updates.isUrgentRemediation : existing.isUrgentRemediation;
      if (updatedScore >= 80) {
        isUrgent = false;
      }

      all[index] = {
        ...existing,
        ...updates,
        adherenceScore: updatedScore,
        status: updates.status || status,
        cmmiLevel: cmmi,
        isUrgentRemediation: isUrgent,
        urgencyLevel: isUrgent ? existing.urgencyLevel : 'NONE',
        lastAssessedAt: new Date().toISOString().split('T')[0]
      };

      this.saveCells(all);
    }
    return all;
  }

  /**
   * Resets all cells back to default initial state
   */
  public static resetBaseline(): AdherenceHeatmapCell[] {
    const initial = this.generateInitialCells();
    this.saveCells(initial);
    return initial;
  }

  /**
   * Computes executive rollup metrics for the entire heatmap
   */
  public static calculateMetrics(cells: AdherenceHeatmapCell[]): HeatmapMetricsSummary {
    const total = cells.length;
    if (total === 0) {
      return {
        totalCells: 0,
        averageAdherence: 0,
        averageCmmiLevel: 0,
        compliantCount: 0,
        inProgressCount: 0,
        nonCompliantCount: 0,
        urgentRemediationCount: 0,
        slaBreachedCount: 0,
        totalOpenFindings: 0
      };
    }

    let sumAdherence = 0;
    let sumCmmi = 0;
    let compliant = 0;
    let inProgress = 0;
    let nonCompliant = 0;
    let urgent = 0;
    let slaBreached = 0;
    let findings = 0;

    cells.forEach(c => {
      sumAdherence += c.adherenceScore;
      sumCmmi += c.cmmiLevel;
      if (c.status === 'COMPLIANT') compliant++;
      else if (c.status === 'IN_PROGRESS') inProgress++;
      else if (c.status === 'NON_COMPLIANT') nonCompliant++;

      if (c.isUrgentRemediation) {
        urgent++;
        if (c.slaStatus === 'BREACHED') slaBreached++;
      }
      findings += c.openFindingsCount;
    });

    return {
      totalCells: total,
      averageAdherence: Math.round(sumAdherence / total),
      averageCmmiLevel: Number((sumCmmi / total).toFixed(1)),
      compliantCount: compliant,
      inProgressCount: inProgress,
      nonCompliantCount: nonCompliant,
      urgentRemediationCount: urgent,
      slaBreachedCount: slaBreached,
      totalOpenFindings: findings
    };
  }

  /**
   * Computes per-department summary stats
   */
  public static getDepartmentSummaries(cells: AdherenceHeatmapCell[]): HeatmapDepartmentSummary[] {
    return D3_HEATMAP_DEPARTMENTS.map(dept => {
      const deptCells = cells.filter(c => c.departmentId === dept.id);
      if (deptCells.length === 0) {
        return {
          department: dept,
          averageAdherence: 0,
          cmmiLevel: 0,
          compliantCount: 0,
          inProgressCount: 0,
          nonCompliantCount: 0,
          urgentRemediationCount: 0,
          criticalOverdueDays: 0
        };
      }

      let sumScore = 0;
      let sumCmmi = 0;
      let compliant = 0;
      let inProgress = 0;
      let nonCompliant = 0;
      let urgent = 0;
      let maxOverdue = 0;

      deptCells.forEach(c => {
        sumScore += c.adherenceScore;
        sumCmmi += c.cmmiLevel;
        if (c.status === 'COMPLIANT') compliant++;
        else if (c.status === 'IN_PROGRESS') inProgress++;
        else if (c.status === 'NON_COMPLIANT') nonCompliant++;
        if (c.isUrgentRemediation) {
          urgent++;
          if (c.overdueDays && c.overdueDays > maxOverdue) {
            maxOverdue = c.overdueDays;
          }
        }
      });

      return {
        department: dept,
        averageAdherence: Math.round(sumScore / deptCells.length),
        cmmiLevel: Number((sumCmmi / deptCells.length).toFixed(1)),
        compliantCount: compliant,
        inProgressCount: inProgress,
        nonCompliantCount: nonCompliant,
        urgentRemediationCount: urgent,
        criticalOverdueDays: maxOverdue
      };
    });
  }

  /**
   * Filters out cells for export
   */
  public static exportToCSV(cells: AdherenceHeatmapCell[]): string {
    const headers = [
      'Department',
      'Department Head',
      'ISO Control Code',
      'Control Title',
      'Theme',
      'Adherence (%)',
      'CMMI Level',
      'Status',
      'Inherent Risk',
      'Urgent Remediation Required',
      'Urgency Level',
      'SLA Status',
      'Overdue Days',
      'Open Findings',
      'CAPA Ticket',
      'CAPA Action',
      'Assigned Lead',
      'Last Assessed Date'
    ];

    const rows = cells.map(c => [
      `"${c.departmentName}"`,
      `"${c.departmentHead}"`,
      `"${c.controlCode}"`,
      `"${c.controlTitle.replace(/"/g, '""')}"`,
      `"${c.theme}"`,
      c.adherenceScore,
      c.cmmiLevel,
      c.status,
      c.inherentRisk,
      c.isUrgentRemediation ? 'YES' : 'NO',
      c.urgencyLevel,
      c.slaStatus || 'N/A',
      c.overdueDays || 0,
      c.openFindingsCount,
      `"${c.capaTicketId || 'None'}"`,
      `"${(c.capaAction || '').replace(/"/g, '""')}"`,
      `"${c.assignedLead}"`,
      c.lastAssessedAt
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}
