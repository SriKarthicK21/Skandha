// Script to generate the comprehensive MAS TRM Compliance Checklist (2026 Edition Updated - Practitioner Aligned)
import fs from 'fs';
import path from 'path';

const fileContent = `// Authoritative Master Data for MAS TRM Compliance Checklist (2026 Edition Updated - Practitioner Aligned)
// Complete TRM Readiness Framework Across All 10 Key Technology Risk Domains & 93 Granular Control Items.
// Includes exact MAS TRM section citations, priority levels, and expert practitioner supervisory tips.

export type ChecklistTaskStatus = 
  | 'COMPLIANT' 
  | 'IN_PROGRESS' 
  | 'GAP_FINDING' 
  | 'NOT_STARTED' 
  | 'NOT_APPLICABLE';

export type TaskPriority = 
  | 'CRITICAL' 
  | 'REQUIRED' 
  | 'ANNUAL' 
  | 'POLICY' 
  | 'GOVERNANCE' 
  | 'DOCS' 
  | 'REVIEW' 
  | 'HIGH' 
  | 'MEDIUM';

export type VerificationMethod = 
  | 'AUTOMATED_SCAN' 
  | 'DOCUMENT_INSPECTION' 
  | 'SYSTEM_CONFIGURATION' 
  | 'AUDIT_INTERVIEW';

export interface MASChecklistSubTask {
  id: string;
  domainNumber: string;
  domainName: string;
  subSectionTitle: string;
  taskCode: string;
  title: string;
  description: string;
  actionableSteps: string[];
  regulatoryRef: string;
  mandatoryNoticeRef?: string;
  priority: TaskPriority;
  assignedRole: string;
  department: string;
  status: ChecklistTaskStatus;
  evidenceRequired: string;
  linkedISOControl?: string;
  linkedFindingId?: string;
  linkedFindingCode?: string;
  verificationMethod: VerificationMethod;
  notes?: string;
  completedAt?: string;
  completedBy?: string;
}

export interface MASDomainChecklistGroup {
  domainNumber: string;
  domainName: string;
  shortName: string;
  description: string;
  iconName: string;
  badgeColor: string;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  guidelineSectionRef: string;
  expertPractitionerTip: string;
  subTasks: MASChecklistSubTask[];
}

export const CHECKLIST_METHODOLOGY_GUIDE = {
  title: "MAS TRM Compliance Readiness: 4-Step Discipline",
  frameworkEdition: "2026 Updated Edition (Accredited Practitioner Aligned)",
  totalDomains: 10,
  totalControls: 93,
  steps: [
    {
      step: 1,
      title: "Work Domain by Domain",
      description: "Go through each of the 10 MAS TRM domains in order. Do not skip domains even if they appear partially covered; document your reasoning if any control is genuinely out of scope for your organisation."
    },
    {
      step: 2,
      title: "Tick Off Completed Controls",
      description: "Only mark an item complete when documentary evidence exists and the control is actively operating. A policy document alone is insufficient; evidence of operational implementation is mandatory."
    },
    {
      step: 3,
      title: "Flag Every Gap Immediately",
      description: "Any unticked item is a compliance gap. Add it to your remediation register immediately. Gaps discovered during an MAS supervisory review will delay your response significantly."
    },
    {
      step: 4,
      title: "Share with Your Compliance Team",
      description: "Use this document as a pre-assessment handoff tool to align your internal team and external MAS TRM consultant before formal gap analysis begins."
    }
  ],
  auditComparison: {
    gapAssessment: {
      type: "Gap Assessment",
      focus: "Point-in-time evaluation, identifies control gaps, faster turnaround (3-5 weeks)"
    },
    fullAudit: {
      type: "Full Compliance Audit",
      focus: "All 10 domains assessed, Board-level assurance report, regulatory-grade deliverable"
    }
  }
};

export const MAS_2026_CHECKLIST_DOMAINS: MASDomainChecklistGroup[] = [
  // --- DOMAIN 1: Technology Risk Governance ---
  {
    domainNumber: "1",
    domainName: "Technology Risk Governance",
    shortName: "Governance & Oversight",
    description: "Establish board-level accountability and a formal technology risk management framework.",
    guidelineSectionRef: "MAS TRM Sec. 3",
    iconName: "Building2",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    criticality: "CRITICAL",
    expertPractitionerTip: "Board oversight is the foundation MAS examines first — and the gap most institutions underestimate. MAS supervisory reviews consistently find that board-level technology risk reporting is either absent, too technical to be actionable, or produced only when an incident occurs. Regulators expect quarterly board reporting with genuine engagement — not just circulation of IT dashboards. Ensure your board risk committee has a standing technology risk agenda item, and that KRIs are expressed in business-impact terms the board can act on.",
    subTasks: [
      {
        id: "CHK-D1-01",
        domainNumber: "1",
        domainName: "Technology Risk Governance",
        subSectionTitle: "Board & Senior Management Oversight (Sec. 3.1–3.2)",
        taskCode: "D1.1",
        title: "Board Approval of TRM Framework",
        description: "Board has formally approved a technology risk management framework — covering risk appetite, governance structure, and accountability at the highest level of the organisation.",
        actionableSteps: [
          "Table comprehensive TRM Framework to Board Risk Committee.",
          "Document roles, responsibilities, and clear lines of accountability.",
          "Ensure formal Board resolution minutes and sign-off are recorded."
        ],
        regulatoryRef: "MAS TRM Sec. 3.1–3.2",
        priority: "CRITICAL",
        assignedRole: "Chief Risk Officer / Board Secretary",
        department: "Executive Board & Governance",
        status: "COMPLIANT",
        evidenceRequired: "Signed Board Minutes approving TRM Framework & Terms of Reference",
        linkedISOControl: "A.5.1 / A.5.2",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D1-02",
        domainNumber: "1",
        domainName: "Technology Risk Governance",
        subSectionTitle: "Board & Senior Management Oversight (Sec. 3.1–3.2)",
        taskCode: "D1.2",
        title: "Senior Management Committee (ITSC / TRC)",
        description: "Senior management committee (e.g. IT Steering Committee or Technology Risk Committee) established with documented terms of reference — meets at minimum quarterly with board-level reporting.",
        actionableSteps: [
          "Charter formal IT Steering / Tech Risk Committee with quorum rules.",
          "Schedule quarterly committee meetings with published agendas.",
          "Produce synthesized quarterly report to Board Risk Committee."
        ],
        regulatoryRef: "MAS TRM Sec. 3.1–3.2",
        priority: "REQUIRED",
        assignedRole: "Chief Information Officer / Head of GRC",
        department: "Executive Board & Governance",
        status: "COMPLIANT",
        evidenceRequired: "Approved Committee Terms of Reference and past 4 quarters of meeting minutes",
        linkedISOControl: "A.5.3",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D1-03",
        domainNumber: "1",
        domainName: "Technology Risk Governance",
        subSectionTitle: "Board & Senior Management Oversight (Sec. 3.1–3.2)",
        taskCode: "D1.3",
        title: "Board-Approved Technology Risk Appetite Statement (TRAS)",
        description: "Technology risk appetite statement approved by board — articulates acceptable thresholds for system availability, cyber incidents, and third-party dependencies.",
        actionableSteps: [
          "Formulate quantitative thresholds for system uptime, cyber loss tolerance, and vendor exposure.",
          "Secure formal Board sign-off on the TRAS.",
          "Review TRAS annually or following material institutional changes."
        ],
        regulatoryRef: "MAS TRM Sec. 3.1–3.2",
        priority: "REQUIRED",
        assignedRole: "Chief Risk Officer",
        department: "Enterprise Risk Management",
        status: "COMPLIANT",
        evidenceRequired: "Board-approved Technology Risk Appetite Statement with defined KRI thresholds",
        linkedISOControl: "A.5.1",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D1-04",
        domainNumber: "1",
        domainName: "Technology Risk Governance",
        subSectionTitle: "Board & Senior Management Oversight (Sec. 3.1–3.2)",
        taskCode: "D1.4",
        title: "Quarterly Technology Risk Board Reporting",
        description: "Board and senior management receive regular technology risk reports — including key risk indicators (KRIs), material incidents, audit findings, and remediation status at minimum quarterly.",
        actionableSteps: [
          "Aggregate KRIs across infrastructure, incident, vulnerability, and vendor domains.",
          "Include remediation progress on all outstanding audit findings.",
          "Present dashboard to Senior Management Committee and Board quarterly."
        ],
        regulatoryRef: "MAS TRM Sec. 3.1–3.2",
        priority: "REQUIRED",
        assignedRole: "Chief Information Security Officer",
        department: "InfoSec & Security Operations",
        status: "COMPLIANT",
        evidenceRequired: "Quarterly Board risk packs containing KRIs, incidents, and audit finding tracker",
        linkedISOControl: "A.5.4",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D1-05",
        domainNumber: "1",
        domainName: "Technology Risk Governance",
        subSectionTitle: "Board & Senior Management Oversight (Sec. 3.1–3.2)",
        taskCode: "D1.5",
        title: "Appointment of Qualified CIO / CISO with Direct Reporting Line",
        description: "A qualified Chief Information Officer (CIO) or Chief Information Security Officer (CISO) appointed — with direct reporting line to senior management or board.",
        actionableSteps: [
          "Verify organizational chart showing CISO reporting independence.",
          "Ensure direct escalation channel from CISO to CEO/Board for material risks.",
          "Verify relevant industry credentials (CISSP, CISM, CRISC)."
        ],
        regulatoryRef: "MAS TRM Sec. 3.1–3.2",
        priority: "REQUIRED",
        assignedRole: "Chief Executive Officer / Head of HR",
        department: "Executive Board & Governance",
        status: "COMPLIANT",
        evidenceRequired: "Signed appointment letter, job description, and organizational hierarchy chart",
        linkedISOControl: "A.5.2",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D1-06",
        domainNumber: "1",
        domainName: "Technology Risk Governance",
        subSectionTitle: "Technology Risk Management Framework (Sec. 3.3)",
        taskCode: "D1.6",
        title: "Documented TRM Policies and Procedures",
        description: "Technology risk management policies and procedures formally documented — covering risk identification, assessment, treatment, monitoring, and reporting across all technology domains.",
        actionableSteps: [
          "Maintain policy suite covering all 10 TRM domains.",
          "Ensure version control, document owner, and annual review cycle.",
          "Publish policies to institutional intranet accessible to all technical staff."
        ],
        regulatoryRef: "MAS TRM Sec. 3.3",
        priority: "REQUIRED",
        assignedRole: "Head of GRC",
        department: "Enterprise Risk Management",
        status: "COMPLIANT",
        evidenceRequired: "Approved TRM policy suite with document history and review sign-offs",
        linkedISOControl: "A.5.1",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D1-07",
        domainNumber: "1",
        domainName: "Technology Risk Governance",
        subSectionTitle: "Technology Risk Management Framework (Sec. 3.3)",
        taskCode: "D1.7",
        title: "Technology Risk Register Maintenance",
        description: "Technology risk register maintained — all identified technology risks logged with risk owner, inherent risk rating, control effectiveness, residual risk, and remediation timeline.",
        actionableSteps: [
          "Log all technology risks with assigned risk owners.",
          "Score inherent and residual risk using approved 5x5 risk matrix.",
          "Track CAPA milestones and escalate overdue remediation items."
        ],
        regulatoryRef: "MAS TRM Sec. 3.3",
        priority: "REQUIRED",
        assignedRole: "Technology Risk Manager",
        department: "Enterprise Risk Management",
        status: "IN_PROGRESS",
        evidenceRequired: "Active Technology Risk Register export with risk scores and remediation dates",
        linkedISOControl: "A.5.5",
        verificationMethod: "SYSTEM_CONFIGURATION"
      },
      {
        id: "CHK-D1-08",
        domainNumber: "1",
        domainName: "Technology Risk Governance",
        subSectionTitle: "Technology Risk Management Framework (Sec. 3.3)",
        taskCode: "D1.8",
        title: "Risk Assessments for Material Technology Changes",
        description: "Risk assessments conducted for all material technology changes — new systems, significant upgrades, outsourcing arrangements, and cloud migrations assessed before go-live.",
        actionableSteps: [
          "Mandate pre-implementation risk assessment before CAB approval.",
          "Evaluate security architecture, data flow, and threat models.",
          "Require formal sign-off from InfoSec before production release."
        ],
        regulatoryRef: "MAS TRM Sec. 3.3",
        priority: "REQUIRED",
        assignedRole: "IT Project Lead / InfoSec Assessor",
        department: "IT Infrastructure & Architecture",
        status: "COMPLIANT",
        evidenceRequired: "Pre-implementation technology risk assessment reports for last 3 major go-lives",
        linkedISOControl: "A.5.8",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D1-09",
        domainNumber: "1",
        domainName: "Technology Risk Governance",
        subSectionTitle: "Technology Risk Management Framework (Sec. 3.3)",
        taskCode: "D1.9",
        title: "Annual TRM Framework Review and Update",
        description: "Technology risk management framework reviewed and updated at minimum annually — or following significant technology change, material incident, or regulatory guidance update.",
        actionableSteps: [
          "Initiate annual review against latest MAS circulars and threat landscape.",
          "Document change delta and gap assessment.",
          "Re-submit updated framework for Senior Management and Board approval."
        ],
        regulatoryRef: "MAS TRM Sec. 3.3",
        priority: "ANNUAL",
        assignedRole: "Chief Risk Officer",
        department: "Enterprise Risk Management",
        status: "COMPLIANT",
        evidenceRequired: "Annual review audit trail and updated framework version approval",
        linkedISOControl: "A.5.1",
        verificationMethod: "DOCUMENT_INSPECTION"
      }
    ]
  },

  // --- DOMAIN 2: IT Infrastructure & Architecture Security ---
  {
    domainNumber: "2",
    domainName: "IT Infrastructure & Architecture Security",
    shortName: "Infrastructure & Hardening",
    description: "Implement defence-in-depth controls across all technology infrastructure components.",
    guidelineSectionRef: "MAS TRM Sec. 7",
    iconName: "Network",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    criticality: "CRITICAL",
    expertPractitionerTip: "Network segmentation failures are the most common finding in MAS TRM technical assessments. Most institutions have perimeter controls but weak internal segmentation. Attackers who breach the perimeter can move laterally to critical banking systems if internal zones are flat. Pay particular attention to: database server isolation from application tiers, separation of SWIFT or payment system environments, and segmentation of legacy systems that cannot be patched. Document your network zone rationale — MAS expects to see it.",
    subTasks: [
      {
        id: "CHK-D2-01",
        domainNumber: "2",
        domainName: "IT Infrastructure & Architecture Security",
        subSectionTitle: "Network Security Architecture (Sec. 7.1–7.2)",
        taskCode: "D2.1",
        title: "Network Segmentation & Zone Rationale",
        description: "Network segmentation implemented — production systems separated from development, test, and user workstation environments with documented rationale for each network zone.",
        actionableSteps: [
          "Isolate production databases from application tiers via internal firewalls.",
          "Segregate SWIFT/payment networks and dev/test environments.",
          "Formally document network architecture diagrams and zone justification."
        ],
        regulatoryRef: "MAS TRM Sec. 7.1–7.2",
        priority: "CRITICAL",
        assignedRole: "Head of Network Architecture",
        department: "IT Infrastructure & Architecture",
        status: "COMPLIANT",
        evidenceRequired: "Network topology diagram with documented zone classification rationale and firewall rules",
        linkedISOControl: "A.8.20 / A.8.22",
        verificationMethod: "SYSTEM_CONFIGURATION"
      },
      {
        id: "CHK-D2-02",
        domainNumber: "2",
        domainName: "IT Infrastructure & Architecture Security",
        subSectionTitle: "Network Security Architecture (Sec. 7.1–7.2)",
        taskCode: "D2.2",
        title: "Perimeter Firewalls & Annual Rulebase Recertification",
        description: "Firewalls deployed at all network perimeters — firewall ruleset reviewed and recertified at minimum annually; default-deny policy applied; unused rules removed.",
        actionableSteps: [
          "Implement strict default-deny ingress and egress filtering.",
          "Execute automated rulebase review to identify shadow/stale rules.",
          "Obtain CISO sign-off on the annual firewall recertification."
        ],
        regulatoryRef: "MAS TRM Sec. 7.1–7.2",
        priority: "REQUIRED",
        assignedRole: "Network Security Engineer",
        department: "IT Infrastructure & Architecture",
        status: "COMPLIANT",
        evidenceRequired: "Annual firewall recertification sign-off and ruleset audit report",
        linkedISOControl: "A.8.20",
        verificationMethod: "SYSTEM_CONFIGURATION"
      },
      {
        id: "CHK-D2-03",
        domainNumber: "2",
        domainName: "IT Infrastructure & Architecture Security",
        subSectionTitle: "Network Security Architecture (Sec. 7.1–7.2)",
        taskCode: "D2.3",
        title: "Intrusion Detection & Prevention System (IDS/IPS)",
        description: "Intrusion Detection / Prevention System (IDS/IPS) deployed — covering internet-facing and internal network segments; alert thresholds tuned and monitored by SOC.",
        actionableSteps: [
          "Deploy inline NIPS on core transit points and perimeter boundaries.",
          "Keep signature databases updated continuously (<= 24 hrs).",
          "Route high-severity alerts to 24/7 SOC for immediate triage."
        ],
        regulatoryRef: "MAS TRM Sec. 7.1–7.2",
        priority: "REQUIRED",
        assignedRole: "SOC Lead",
        department: "InfoSec & Security Operations",
        status: "COMPLIANT",
        evidenceRequired: "IDS/IPS sensor coverage map, signature update telemetry, and SOC alert correlation rules",
        linkedISOControl: "A.8.16",
        verificationMethod: "SYSTEM_CONFIGURATION"
      },
      {
        id: "CHK-D2-04",
        domainNumber: "2",
        domainName: "IT Infrastructure & Architecture Security",
        subSectionTitle: "Network Security Architecture (Sec. 7.1–7.2)",
        taskCode: "D2.4",
        title: "Web Application Firewall (WAF) Deployment",
        description: "Internet-facing systems protected by Web Application Firewall (WAF) — WAF rules kept current; bypass exceptions documented and approved.",
        actionableSteps: [
          "Enforce WAF in blocking mode across all public banking APIs and web applications.",
          "Apply OWASP Core Rule Set (CRS) and custom anti-DDoS rules.",
          "Require formal exception approvals for rule suppressions."
        ],
        regulatoryRef: "MAS TRM Sec. 7.1–7.2",
        priority: "REQUIRED",
        assignedRole: "Lead AppSec Engineer",
        department: "Engineering & DevOps",
        status: "COMPLIANT",
        evidenceRequired: "WAF configuration console export, active ruleset version, and bypass exception log",
        linkedISOControl: "A.8.26",
        verificationMethod: "SYSTEM_CONFIGURATION"
      },
      {
        id: "CHK-D2-05",
        domainNumber: "2",
        domainName: "IT Infrastructure & Architecture Security",
        subSectionTitle: "Network Security Architecture (Sec. 7.1–7.2)",
        taskCode: "D2.5",
        title: "Wireless Network Security & Rogue AP Detection",
        description: "Wireless network security controls implemented — corporate and guest Wi-Fi segregated; WPA3 or equivalent encryption enforced; rogue AP detection active.",
        actionableSteps: [
          "Segregate corporate wireless VLAN with 802.1X EAP-TLS certificate authentication.",
          "Isolate guest Wi-Fi with internet-only breakout and zero internal route access.",
          "Deploy Wireless Intrusion Prevention (WIPS) to detect rogue access points."
        ],
        regulatoryRef: "MAS TRM Sec. 7.1–7.2",
        priority: "REQUIRED",
        assignedRole: "Network Administrator",
        department: "IT Infrastructure & Architecture",
        status: "COMPLIANT",
        evidenceRequired: "Wireless controller configuration showing WPA3/802.1X and rogue AP scan logs",
        linkedISOControl: "A.8.20",
        verificationMethod: "SYSTEM_CONFIGURATION"
      },
      {
        id: "CHK-D2-06",
        domainNumber: "2",
        domainName: "IT Infrastructure & Architecture Security",
        subSectionTitle: "Endpoint & Server Hardening (Sec. 7.3–7.4)",
        taskCode: "D2.6",
        title: "Baseline Hardening Configurations (CIS Benchmarks)",
        description: "Security baseline configurations applied to all servers and endpoints — CIS Benchmarks or equivalent used; configuration deviations formally approved and documented.",
        actionableSteps: [
          "Standardize automated golden image templates adhering to CIS Level 2.",
          "Enforce hardening via Ansible/GPO with automated drift detection.",
          "Log all deviations in the hardening exception register with CISO sign-off."
        ],
        regulatoryRef: "MAS TRM Sec. 7.3–7.4",
        priority: "REQUIRED",
        assignedRole: "Systems Operations Lead",
        department: "IT Infrastructure & Architecture",
        status: "COMPLIANT",
        evidenceRequired: "Automated configuration compliance audit report comparing fleet against CIS benchmarks",
        linkedISOControl: "A.8.9",
        verificationMethod: "SYSTEM_CONFIGURATION"
      },
      {
        id: "CHK-D2-07",
        domainNumber: "2",
        domainName: "IT Infrastructure & Architecture Security",
        subSectionTitle: "Endpoint & Server Hardening (Sec. 7.3–7.4)",
        taskCode: "D2.7",
        title: "Endpoint Detection & Response (EDR) Fleet Deployment",
        description: "Endpoint Detection & Response (EDR) solution deployed across all endpoints — real-time monitoring active; alerts integrated into SOC workflow.",
        actionableSteps: [
          "Deploy EDR agent on 100% of workstations, servers, and virtual machines.",
          "Enable behavioral analysis, ransomware rollback, and isolation capabilities.",
          "Integrate EDR alerts directly into central SIEM/SOAR."
        ],
        regulatoryRef: "MAS TRM Sec. 7.3–7.4",
        priority: "REQUIRED",
        assignedRole: "SOC Engineer",
        department: "InfoSec & Security Operations",
        status: "COMPLIANT",
        evidenceRequired: "EDR deployment console dashboard showing >99% fleet coverage and active policy health",
        linkedISOControl: "A.8.7",
        verificationMethod: "AUTOMATED_SCAN"
      },
      {
        id: "CHK-D2-08",
        domainNumber: "2",
        domainName: "IT Infrastructure & Architecture Security",
        subSectionTitle: "Endpoint & Server Hardening (Sec. 7.3–7.4)",
        taskCode: "D2.8",
        title: "Removable Media & USB Controls Enforcement",
        description: "USB and removable media controls enforced — policy-based blocking implemented; exceptions logged and approved by security team.",
        actionableSteps: [
          "Disable USB mass storage globally via endpoint policy.",
          "Deploy device control software requiring encrypted keys for rare exemptions.",
          "Audit USB insertion logs and alert on unauthorized mass media attempts."
        ],
        regulatoryRef: "MAS TRM Sec. 7.3–7.4",
        priority: "POLICY",
        assignedRole: "Endpoint Security Admin",
        department: "IT Infrastructure & Architecture",
        status: "COMPLIANT",
        evidenceRequired: "GPO/MDM configuration showing USB blocking and signed exception register",
        linkedISOControl: "A.8.10",
        verificationMethod: "SYSTEM_CONFIGURATION"
      },
      {
        id: "CHK-D2-09",
        domainNumber: "2",
        domainName: "IT Infrastructure & Architecture Security",
        subSectionTitle: "Endpoint & Server Hardening (Sec. 7.3–7.4)",
        taskCode: "D2.9",
        title: "Hardware and Software Asset Inventory Maintenance",
        description: "Asset inventory maintained — all hardware and software assets catalogued with owner, classification, and lifecycle status; reviewed quarterly.",
        actionableSteps: [
          "Maintain live automated CMDB linked to network scanners and EDR telemetry.",
          "Record asset owner, criticality rating, and OS lifecycle status.",
          "Conduct quarterly reconciliation to detect unmanaged shadow assets."
        ],
        regulatoryRef: "MAS TRM Sec. 7.3–7.4",
        priority: "ANNUAL",
        assignedRole: "IT Asset Manager",
        department: "IT Infrastructure & Architecture",
        status: "COMPLIANT",
        evidenceRequired: "CMDB snapshot, reconciliation report, and asset classification ledger",
        linkedISOControl: "A.5.9 / A.5.10",
        verificationMethod: "DOCUMENT_INSPECTION"
      }
    ]
  },

  // --- DOMAIN 3: Cyber Threat & Vulnerability Management ---
  {
    domainNumber: "3",
    domainName: "Cyber Threat & Vulnerability Management",
    shortName: "Threats & Patching",
    description: "Identify and remediate security vulnerabilities before they can be exploited.",
    guidelineSectionRef: "MAS TRM Sec. 12",
    iconName: "ShieldAlert",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    criticality: "CRITICAL",
    expertPractitionerTip: "EOL systems are the single highest-risk finding in Singapore financial institutions — and MAS knows it. Legacy systems running end-of-life operating systems (Windows Server 2008, older Linux kernels) are consistently identified in MAS supervisory engagements. The business case for keeping them is usually operational dependency — but the residual risk must be formally accepted at board level with compensating controls documented. Do not assume MAS will accept operational necessity as justification without a formal risk acceptance and remediation roadmap.",
    subTasks: [
      {
        id: "CHK-D3-01",
        domainNumber: "3",
        domainName: "Cyber Threat & Vulnerability Management",
        subSectionTitle: "Vulnerability Scanning & Penetration Testing (Sec. 12.1)",
        taskCode: "D3.1",
        title: "Monthly Production Vulnerability Scanning",
        description: "Vulnerability scanning conducted across all production systems — internal and external scans performed at minimum monthly; scan coverage documented and verified.",
        actionableSteps: [
          "Configure authenticated vulnerability scans for all internal IP ranges monthly.",
          "Conduct external perimeter vulnerability scans monthly.",
          "Verify scan scope against the CMDB to confirm complete coverage."
        ],
        regulatoryRef: "MAS TRM Sec. 12.1",
        priority: "REQUIRED",
        assignedRole: "Vulnerability Management Specialist",
        department: "InfoSec & Security Operations",
        status: "COMPLIANT",
        evidenceRequired: "Monthly vulnerability scan reports and coverage verification logs",
        linkedISOControl: "A.8.8",
        verificationMethod: "AUTOMATED_SCAN"
      },
      {
        id: "CHK-D3-02",
        domainNumber: "3",
        domainName: "Cyber Threat & Vulnerability Management",
        subSectionTitle: "Vulnerability Scanning & Penetration Testing (Sec. 12.1)",
        taskCode: "D3.2",
        title: "Independent Penetration Testing (Annual External / Biennial Internal)",
        description: "Penetration testing conducted by independent qualified testers — internet-facing systems tested annually; internal network testing conducted at minimum every two years.",
        actionableSteps: [
          "Engage CREST-accredited independent third-party penetration testers.",
          "Test all internet-facing web apps, APIs, and network gateways annually.",
          "Conduct comprehensive internal network penetration test at least every 2 years."
        ],
        regulatoryRef: "MAS TRM Sec. 12.1",
        priority: "REQUIRED",
        assignedRole: "Lead Security Assessor",
        department: "InfoSec & Security Operations",
        status: "COMPLIANT",
        evidenceRequired: "Executive summary and technical penetration test reports from certified vendor",
        linkedISOControl: "A.8.8",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D3-03",
        domainNumber: "3",
        domainName: "Cyber Threat & Vulnerability Management",
        subSectionTitle: "Vulnerability Scanning & Penetration Testing (Sec. 12.1)",
        taskCode: "D3.3",
        title: "Strict Remediation SLAs (Critical 14d, High 30d)",
        description: "Critical and high vulnerabilities remediated within defined SLAs — critical within 14 days, high within 30 days; exceptions formally risk-accepted with compensating controls.",
        actionableSteps: [
          "Enforce strict SLA tracking in Jira/ServiceNow for all discovered CVEs.",
          "Deploy emergency mitigations or WAF virtual patching if patch unavailable.",
          "Require CRO/CISO dual sign-off for exceptions extending beyond SLA."
        ],
        regulatoryRef: "MAS TRM Sec. 12.1",
        priority: "CRITICAL",
        assignedRole: "Vulnerability Management Lead",
        department: "InfoSec & Security Operations",
        status: "COMPLIANT",
        evidenceRequired: "SLA remediation aging dashboard and signed risk acceptance forms for open exceptions",
        linkedISOControl: "A.8.8",
        verificationMethod: "SYSTEM_CONFIGURATION"
      },
      {
        id: "CHK-D3-04",
        domainNumber: "3",
        domainName: "Cyber Threat & Vulnerability Management",
        subSectionTitle: "Vulnerability Scanning & Penetration Testing (Sec. 12.1)",
        taskCode: "D3.4",
        title: "Red Team Adversarial Attack Simulation (AASE)",
        description: "Red team exercises conducted for institutions classified as systemically important — scenario-based adversarial testing of detection and response capabilities.",
        actionableSteps: [
          "Define realistic adversary threat scenarios aligned with MITRE ATT&CK.",
          "Execute red teaming without notifying blue team SOC responders.",
          "Conduct blue/purple team post-exercise debrief to tune detection rules."
        ],
        regulatoryRef: "MAS TRM Sec. 12.1",
        priority: "REQUIRED",
        assignedRole: "Head of Cyber Defense",
        department: "InfoSec & Security Operations",
        status: "COMPLIANT",
        evidenceRequired: "AASE red team exercise report and blue team detection gap remediation plan",
        linkedISOControl: "A.8.8",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D3-05",
        domainNumber: "3",
        domainName: "Cyber Threat & Vulnerability Management",
        subSectionTitle: "Vulnerability Scanning & Penetration Testing (Sec. 12.1)",
        taskCode: "D3.5",
        title: "Documented Vulnerability Management Policy & Scope",
        description: "Vulnerability management program formally documented — scope, scan cadence, SLAs, exception process, and reporting to senior management defined.",
        actionableSteps: [
          "Draft and publish Enterprise Vulnerability Management Standard.",
          "Define CVSS score mapping to institutional remediation tiers.",
          "Establish escalation procedures for unpatched critical findings."
        ],
        regulatoryRef: "MAS TRM Sec. 12.1",
        priority: "REQUIRED",
        assignedRole: "InfoSec Policy Lead",
        department: "Enterprise Risk Management",
        status: "COMPLIANT",
        evidenceRequired: "Approved Vulnerability Management Policy document",
        linkedISOControl: "A.5.1 / A.8.8",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D3-06",
        domainNumber: "3",
        domainName: "Cyber Threat & Vulnerability Management",
        subSectionTitle: "Patch Management (Sec. 12.2)",
        taskCode: "D3.6",
        title: "Documented Patch Management Operational Policy",
        description: "Patch management policy documented and operational — covering operating systems, applications, databases, network devices, and security tools across all environments.",
        actionableSteps: [
          "Cover patch lifecycle across OS, DB, networking, and third-party libs.",
          "Integrate automated patch management tooling (SCCM, Ansible, Satellite).",
          "Conduct monthly patch deployment cycles for standard updates."
        ],
        regulatoryRef: "MAS TRM Sec. 12.2",
        priority: "REQUIRED",
        assignedRole: "IT Systems Lead",
        department: "IT Infrastructure & Architecture",
        status: "COMPLIANT",
        evidenceRequired: "Approved Patch Management Standard and operational runbooks",
        linkedISOControl: "A.8.19",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D3-07",
        domainNumber: "3",
        domainName: "Cyber Threat & Vulnerability Management",
        subSectionTitle: "Patch Management (Sec. 12.2)",
        taskCode: "D3.7",
        title: "Pre-Production Patch Testing & Emergency Zero-Day Process",
        description: "Patch testing process in place — patches tested in non-production environment before production deployment; emergency patch process defined for zero-day vulnerabilities.",
        actionableSteps: [
          "Test patches in staging for minimum 48 hours for standard rollouts.",
          "Establish fast-track emergency CAB procedure for zero-day exploits (72h SLA).",
          "Ensure pre-patch system backups and rollback plans are verified."
        ],
        regulatoryRef: "MAS TRM Sec. 12.2",
        priority: "REQUIRED",
        assignedRole: "IT Change Manager",
        department: "IT Infrastructure & Architecture",
        status: "COMPLIANT",
        evidenceRequired: "CAB records showing staging test sign-off and emergency patch execution logs",
        linkedISOControl: "A.8.19 / A.8.32",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D3-08",
        domainNumber: "3",
        domainName: "Cyber Threat & Vulnerability Management",
        subSectionTitle: "Patch Management (Sec. 12.2)",
        taskCode: "D3.8",
        title: "End-of-Life (EOL) Systems Inventory & Board-Approved Dispensation",
        description: "End-of-life (EOL) systems inventory maintained — all systems running unsupported software identified; compensating controls documented and risk-accepted by senior management.",
        actionableSteps: [
          "Maintain explicit EOL register tracking unsupported OS and software.",
          "Implement compensating network isolation and enhanced monitoring.",
          "Obtain annual Board/CRO risk acceptance with committed retirement roadmaps."
        ],
        regulatoryRef: "MAS TRM Sec. 12.2",
        priority: "CRITICAL",
        assignedRole: "Enterprise Architect / CISO",
        department: "IT Infrastructure & Architecture",
        status: "IN_PROGRESS",
        evidenceRequired: "Active EOL System Inventory, signed Risk Dispensation Memorandums, and decommissioning milestones",
        linkedISOControl: "A.8.19",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D3-09",
        domainNumber: "3",
        domainName: "Cyber Threat & Vulnerability Management",
        subSectionTitle: "Patch Management (Sec. 12.2)",
        taskCode: "D3.9",
        title: "Patch Compliance Tracking & Senior Management Escalation",
        description: "Patch compliance metrics reported to management — percentage of systems patched within SLA tracked; persistent non-compliance escalated.",
        actionableSteps: [
          "Generate monthly patch compliance percentages across all asset tiers.",
          "Set target threshold (>95% compliance on production infrastructure).",
          "Escalate systems missing two consecutive patch windows to CIO/CISO."
        ],
        regulatoryRef: "MAS TRM Sec. 12.2",
        priority: "GOVERNANCE",
        assignedRole: "IT Operations Manager",
        department: "IT Infrastructure & Architecture",
        status: "COMPLIANT",
        evidenceRequired: "Monthly patch compliance reporting packs and management escalation meeting minutes",
        linkedISOControl: "A.8.19",
        verificationMethod: "DOCUMENT_INSPECTION"
      }
    ]
  },

  // --- DOMAIN 4: Identity & Access Management ---
  {
    domainNumber: "4",
    domainName: "Identity & Access Management",
    shortName: "Access Control & PAM",
    description: "Govern all user, privileged, and third-party access with least-privilege principles.",
    guidelineSectionRef: "MAS TRM Sec. 9",
    iconName: "KeyRound",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    criticality: "CRITICAL",
    expertPractitionerTip: "Privileged access abuse is the most common vector in financial institution breaches — MAS prioritises it. Most access control gaps are not in standard user provisioning — they are in privileged accounts. Service accounts with excessive permissions, administrator accounts shared between teams, and developer access to production databases are consistently found. MAS expects PAM controls to be technically enforced, not just policy-stated. Session recording, just-in-time access, and password rotation are expected for all privileged accounts in critical systems.",
    subTasks: [
      {
        id: "CHK-D4-01",
        domainNumber: "4",
        domainName: "Identity & Access Management",
        subSectionTitle: "User Access Controls (Sec. 9.1–9.2)",
        taskCode: "D4.1",
        title: "Formal Access Provisioning & Least Privilege Approval",
        description: "Access provisioning process documented — new access requests require formal approval from system owner; access aligned to job function with least-privilege principle enforced.",
        actionableSteps: [
          "Deploy role-based access control (RBAC) tied to formal job descriptions.",
          "Require digital ticket approval from designated asset owner before provisioning.",
          "Prevent self-approval and blanket administrative assignments."
        ],
        regulatoryRef: "MAS TRM Sec. 9.1–9.2",
        priority: "REQUIRED",
        assignedRole: "IAM Lead",
        department: "IT Infrastructure & Architecture",
        status: "COMPLIANT",
        evidenceRequired: "Access request approval audit trails from ticketing system and RBAC role matrix",
        linkedISOControl: "A.9.2 / A.9.4",
        verificationMethod: "SYSTEM_CONFIGURATION"
      },
      {
        id: "CHK-D4-02",
        domainNumber: "4",
        domainName: "Identity & Access Management",
        subSectionTitle: "User Access Controls (Sec. 9.1–9.2)",
        taskCode: "D4.2",
        title: "Semi-Annual Access Reviews & Dormant Account Deprovisioning",
        description: "User access reviews conducted at minimum semi-annually — all user accounts and entitlements reviewed by system owners; dormant accounts deprovisioned within 30 days.",
        actionableSteps: [
          "Trigger automated user entitlement recertification campaigns semi-annually.",
          "Require business application owners to affirmatively certify every user account.",
          "Automatically disable accounts inactive for >30 days."
        ],
        regulatoryRef: "MAS TRM Sec. 9.1–9.2",
        priority: "REQUIRED",
        assignedRole: "IAM Analyst",
        department: "InfoSec & Security Operations",
        status: "COMPLIANT",
        evidenceRequired: "Signed semi-annual access certification campaign records and dormant account deprovisioning logs",
        linkedISOControl: "A.9.2",
        verificationMethod: "AUTOMATED_SCAN"
      },
      {
        id: "CHK-D4-03",
        domainNumber: "4",
        domainName: "Identity & Access Management",
        subSectionTitle: "User Access Controls (Sec. 9.1–9.2)",
        taskCode: "D4.3",
        title: "Mandatory Multi-Factor Authentication (MFA) Enforcement",
        description: "Multi-factor authentication (MFA) enforced for all remote access, privileged accounts, and critical system access — MFA bypass exceptions documented and approved.",
        actionableSteps: [
          "Enforce hardware token / FIDO2 or approved mobile authenticator for all VPN and SSO.",
          "Mandate step-up MFA for administrative logins and database consoles.",
          "Log and audit any emergency bypass exception with explicit CISO approval."
        ],
        regulatoryRef: "MAS TRM Sec. 9.1–9.2",
        priority: "CRITICAL",
        assignedRole: "CISO / Identity Architect",
        department: "InfoSec & Security Operations",
        status: "COMPLIANT",
        evidenceRequired: "IdP configuration showing 100% MFA enforcement on external and admin connections",
        linkedISOControl: "A.9.4",
        verificationMethod: "SYSTEM_CONFIGURATION"
      },
      {
        id: "CHK-D4-04",
        domainNumber: "4",
        domainName: "Identity & Access Management",
        subSectionTitle: "User Access Controls (Sec. 9.1–9.2)",
        taskCode: "D4.4",
        title: "Employee Termination Immediate Revocation (<24 Hours)",
        description: "Termination process ensures immediate access revocation — offboarding checklist includes all system and application access; compliance verified within 24 hours of termination.",
        actionableSteps: [
          "Integrate HR system with automated IAM deprovisioning webhook upon termination.",
          "Immediately revoke Active Directory, VPN, SaaS, and physical badge access.",
          "Perform verification audit within 24 hours of departure notification."
        ],
        regulatoryRef: "MAS TRM Sec. 9.1–9.2",
        priority: "REQUIRED",
        assignedRole: "HR Operations / IAM Admin",
        department: "Executive Board & Governance",
        status: "COMPLIANT",
        evidenceRequired: "Sample of last 10 leaver tickets comparing HR effective date against account termination timestamp (<24h)",
        linkedISOControl: "A.9.2",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D4-05",
        domainNumber: "4",
        domainName: "Identity & Access Management",
        subSectionTitle: "User Access Controls (Sec. 9.1–9.2)",
        taskCode: "D4.5",
        title: "Prohibition of Shared & Generic Accounts",
        description: "Shared and generic accounts prohibited — exceptions formally documented with business justification, compensating controls, and reviewed quarterly.",
        actionableSteps: [
          "Eliminate generic 'admin', 'root', or 'operator' accounts shared across staff.",
          "Enforce named individual accounts with sudo/PAM elevation.",
          "Re-certify necessary break-glass emergency accounts quarterly with dual custody."
        ],
        regulatoryRef: "MAS TRM Sec. 9.1–9.2",
        priority: "POLICY",
        assignedRole: "Security Operations Lead",
        department: "InfoSec & Security Operations",
        status: "COMPLIANT",
        evidenceRequired: "Active Directory audit report showing zero shared active accounts and quarterly break-glass review logs",
        linkedISOControl: "A.9.2",
        verificationMethod: "SYSTEM_CONFIGURATION"
      },
      {
        id: "CHK-D4-06",
        domainNumber: "4",
        domainName: "Identity & Access Management",
        subSectionTitle: "Privileged Access Management (Sec. 9.3)",
        taskCode: "D4.6",
        title: "Privileged Accounts Classification & Named Ownership",
        description: "Privileged accounts inventoried and classified — all administrator, root, and service accounts identified; owned by named individuals with formal accountability.",
        actionableSteps: [
          "Compile comprehensive inventory of all administrative and service accounts.",
          "Assign named custodian and business owner to every service credential.",
          "Conduct quarterly reconciliation against AD and cloud IAM directories."
        ],
        regulatoryRef: "MAS TRM Sec. 9.3",
        priority: "CRITICAL",
        assignedRole: "PAM Administrator",
        department: "IT Infrastructure & Architecture",
        status: "COMPLIANT",
        evidenceRequired: "Privileged Account Inventory signed by IT Operations Lead",
        linkedISOControl: "A.9.2",
        verificationMethod: "SYSTEM_CONFIGURATION"
      },
      {
        id: "CHK-D4-07",
        domainNumber: "4",
        domainName: "Identity & Access Management",
        subSectionTitle: "Privileged Access Management (Sec. 9.3)",
        taskCode: "D4.7",
        title: "Privileged Access Management (PAM) Deployment",
        description: "Privileged Access Management (PAM) solution or equivalent controls implemented — privileged session recording, just-in-time access, and password vaulting deployed.",
        actionableSteps: [
          "Deploy enterprise PAM solution (CyberArk/BeyondTrust/HashiCorp Boundary).",
          "Implement Just-in-Time (JIT) check-out with automated credential rotation.",
          "Enforce full session video and keystroke recording on production jump hosts."
        ],
        regulatoryRef: "MAS TRM Sec. 9.3",
        priority: "REQUIRED",
        assignedRole: "PAM Lead Engineer",
        department: "IT Infrastructure & Architecture",
        status: "COMPLIANT",
        evidenceRequired: "PAM architecture design document, live vault configuration screenshot, and recorded session sample",
        linkedISOControl: "A.9.4",
        verificationMethod: "SYSTEM_CONFIGURATION"
      },
      {
        id: "CHK-D4-08",
        domainNumber: "4",
        domainName: "Identity & Access Management",
        subSectionTitle: "Privileged Access Management (Sec. 9.3)",
        taskCode: "D4.8",
        title: "Privileged Activity Logging (1 Year Online / 3 Years Archive)",
        description: "Privileged activity logging enabled — all privileged user actions logged to tamper-evident SIEM; logs retained for minimum 1 year online and 3 years in archive.",
        actionableSteps: [
          "Stream all PAM session metadata, sudo executions, and authentication events to SIEM.",
          "Enforce WORM (Write-Once-Read-Many) retention controls on log buckets.",
          "Validate log retention lifecycle policies (365 days hot, 1095 days archive)."
        ],
        regulatoryRef: "MAS TRM Sec. 9.3",
        priority: "REQUIRED",
        assignedRole: "SIEM / SOC Lead",
        department: "InfoSec & Security Operations",
        status: "COMPLIANT",
        evidenceRequired: "SIEM retention configuration, audit log export, and immutable bucket policy proofs",
        linkedISOControl: "A.12.4",
        verificationMethod: "SYSTEM_CONFIGURATION"
      },
      {
        id: "CHK-D4-09",
        domainNumber: "4",
        domainName: "Identity & Access Management",
        subSectionTitle: "Privileged Access Management (Sec. 9.3)",
        taskCode: "D4.9",
        title: "Segregation of Duties (Dev vs Prod & Payment Processing)",
        description: "Segregation of duties enforced for critical functions — development staff do not have production access; payment processing segregation verified.",
        actionableSteps: [
          "Block all software developers from production server/database write access.",
          "Require dual authorization for initiating and releasing high-value payment transactions.",
          "Conduct quarterly access audits to detect conflicting entitlement assignments."
        ],
        regulatoryRef: "MAS TRM Sec. 9.3",
        priority: "REQUIRED",
        assignedRole: "Head of IT Governance",
        department: "Executive Board & Governance",
        status: "COMPLIANT",
        evidenceRequired: "Production access roster demonstrating zero developer access and dual-control payment workflow configuration",
        linkedISOControl: "A.6.1 / A.9.4",
        verificationMethod: "DOCUMENT_INSPECTION"
      }
    ]
  },

  // --- DOMAIN 5: Software & Application Security ---
  {
    domainNumber: "5",
    domainName: "Software & Application Security",
    shortName: "DevSecOps & AppSec",
    description: "Embed security throughout the software development lifecycle and protect production applications.",
    guidelineSectionRef: "MAS TRM Sec. 10",
    iconName: "Code2",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    criticality: "CRITICAL",
    expertPractitionerTip: "API security is the fastest-growing gap in Singapore financial institutions — and the least tested. As institutions accelerate digital transformation, API sprawl creates significant unmanaged attack surface. Many institutions have hundreds of internal and external APIs with no central inventory, inconsistent authentication, and no rate limiting. MAS TRM reviews increasingly focus on API governance. Build an API inventory, enforce OAuth 2.0 or equivalent authentication, and include APIs in your annual penetration testing scope.",
    subTasks: [
      {
        id: "CHK-D5-01",
        domainNumber: "5",
        domainName: "Software & Application Security",
        subSectionTitle: "Secure Development Lifecycle - SDLC (Sec. 10.1)",
        taskCode: "D5.1",
        title: "Secure SDLC Policy & Threat Modelling Gates",
        description: "Secure SDLC policy formally documented — security requirements, threat modelling, secure coding standards, and security testing gates defined for all software development.",
        actionableSteps: [
          "Mandate threat modelling (STRIDE/PASTA) for all new application architectures.",
          "Publish OWASP Top 10 secure coding guidelines to all development squads.",
          "Define mandatory security sign-off gate before production release."
        ],
        regulatoryRef: "MAS TRM Sec. 10.1",
        priority: "REQUIRED",
        assignedRole: "AppSec Lead",
        department: "Engineering & DevOps",
        status: "COMPLIANT",
        evidenceRequired: "Approved Secure SDLC Standard and completed threat model artifacts for core banking applications",
        linkedISOControl: "A.8.25 / A.8.27",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D5-02",
        domainNumber: "5",
        domainName: "Software & Application Security",
        subSectionTitle: "Secure Development Lifecycle - SDLC (Sec. 10.1)",
        taskCode: "D5.2",
        title: "Automated SAST in CI/CD Pipeline with Release Block",
        description: "Security code review conducted for all material software releases — automated SAST tools integrated into CI/CD pipeline; critical findings block release.",
        actionableSteps: [
          "Embed static analysis (SonarQube/Checkmarx/Snyk Code) into GitLab/GitHub pipelines.",
          "Configure automated pipeline fail condition on Critical or High SAST findings.",
          "Require peer code review approval before pull requests can merge."
        ],
        regulatoryRef: "MAS TRM Sec. 10.1",
        priority: "REQUIRED",
        assignedRole: "DevOps Engineer",
        department: "Engineering & DevOps",
        status: "COMPLIANT",
        evidenceRequired: "CI/CD configuration YAML showing SAST quality gate and sample build log demonstrating block on critical flaw",
        linkedISOControl: "A.8.28",
        verificationMethod: "SYSTEM_CONFIGURATION"
      },
      {
        id: "CHK-D5-03",
        domainNumber: "5",
        domainName: "Software & Application Security",
        subSectionTitle: "Secure Development Lifecycle - SDLC (Sec. 10.1)",
        taskCode: "D5.3",
        title: "Pre-Release Dynamic Application Security Testing (DAST)",
        description: "Dynamic Application Security Testing (DAST) performed before production release — internet-facing applications tested; findings remediated before go-live.",
        actionableSteps: [
          "Execute automated DAST scans against pre-production staging environments.",
          "Perform authenticated crawls evaluating authentication, session, and injection flaws.",
          "Verify remediation and regression retest before production go-live."
        ],
        regulatoryRef: "MAS TRM Sec. 10.1",
        priority: "REQUIRED",
        assignedRole: "Application Security Tester",
        department: "Engineering & DevOps",
        status: "COMPLIANT",
        evidenceRequired: "Pre-release DAST scan reports and remediation confirmation tickets",
        linkedISOControl: "A.8.29",
        verificationMethod: "AUTOMATED_SCAN"
      },
      {
        id: "CHK-D5-04",
        domainNumber: "5",
        domainName: "Software & Application Security",
        subSectionTitle: "Secure Development Lifecycle - SDLC (Sec. 10.1)",
        taskCode: "D5.4",
        title: "Open Source Software (OSS) Risk Management & SBOM",
        description: "Open source software (OSS) risk management process in place — all OSS components inventoried via Software Bill of Materials (SBOM); known vulnerable components tracked and updated.",
        actionableSteps: [
          "Generate CycloneDX or SPDX SBOM automatically during every build.",
          "Scan all dependencies continuously using SCA tools (Snyk/Dependabot/Nexus).",
          "Establish policy blocking components with unpatched Critical CVEs or non-compliant licenses."
        ],
        regulatoryRef: "MAS TRM Sec. 10.1",
        priority: "REQUIRED",
        assignedRole: "Software Engineering Lead",
        department: "Engineering & DevOps",
        status: "COMPLIANT",
        evidenceRequired: "Sample SBOM export and active SCA dependency vulnerability dashboard",
        linkedISOControl: "A.8.30",
        verificationMethod: "AUTOMATED_SCAN"
      },
      {
        id: "CHK-D5-05",
        domainNumber: "5",
        domainName: "Software & Application Security",
        subSectionTitle: "Secure Development Lifecycle - SDLC (Sec. 10.1)",
        taskCode: "D5.5",
        title: "Strict Separation of Dev and Prod & Data Anonymisation",
        description: "Development and production environments strictly separated — production data not used in development or test environments without formal approval and anonymisation.",
        actionableSteps: [
          "Separate dev, staging, and production on independent cloud VPCs and subnets.",
          "Deploy automated data masking pipeline to sanitize all sensitive customer data before lower-environment load.",
          "Require written Data Protection Officer sign-off for any non-production data refresh."
        ],
        regulatoryRef: "MAS TRM Sec. 10.1",
        priority: "CRITICAL",
        assignedRole: "Data Protection Officer / Lead DBA",
        department: "Legal, Compliance & Data Privacy",
        status: "COMPLIANT",
        evidenceRequired: "Data masking workflow documentation and audit test verifying zero plain-text PII in staging databases",
        linkedISOControl: "A.8.31",
        verificationMethod: "SYSTEM_CONFIGURATION"
      },
      {
        id: "CHK-D5-06",
        domainNumber: "5",
        domainName: "Software & Application Security",
        subSectionTitle: "Production Application Security (Sec. 10.2)",
        taskCode: "D5.6",
        title: "API Security Controls, Inventory & Rate Limiting",
        description: "API security controls implemented — all APIs authenticated, rate-limited, and monitored; API inventory maintained; deprecated APIs decommissioned.",
        actionableSteps: [
          "Publish centralized OpenAPI/Swagger catalog of all public and internal endpoints.",
          "Enforce OAuth 2.0 with mTLS and token lifetime under 60 minutes.",
          "Apply rate limiting and anomaly detection on API gateway layer."
        ],
        regulatoryRef: "MAS TRM Sec. 10.2",
        priority: "REQUIRED",
        assignedRole: "API Gateway Architect",
        department: "Engineering & DevOps",
        status: "COMPLIANT",
        evidenceRequired: "API gateway configuration showing OAuth2/rate-limiting policies and API inventory catalog",
        linkedISOControl: "A.8.26",
        verificationMethod: "SYSTEM_CONFIGURATION"
      },
      {
        id: "CHK-D5-07",
        domainNumber: "5",
        domainName: "Software & Application Security",
        subSectionTitle: "Production Application Security (Sec. 10.2)",
        taskCode: "D5.7",
        title: "Production Change Management & Rollback Testing",
        description: "Change management process enforced for all production changes — all changes risk-assessed, tested, approved, and subject to rollback plan before deployment.",
        actionableSteps: [
          "Require CAB submission with risk impact rating for every production deploy.",
          "Mandate documented and pre-tested rollback procedure before deployment approval.",
          "Enforce automated post-deployment smoke tests and rollback triggers."
        ],
        regulatoryRef: "MAS TRM Sec. 10.2",
        priority: "REQUIRED",
        assignedRole: "Change Advisory Board Chair",
        department: "IT Infrastructure & Architecture",
        status: "COMPLIANT",
        evidenceRequired: "Approved CAB ticket samples containing rollback scripts and deployment sign-offs",
        linkedISOControl: "A.8.32",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D5-08",
        domainNumber: "5",
        domainName: "Software & Application Security",
        subSectionTitle: "Production Application Security (Sec. 10.2)",
        taskCode: "D5.8",
        title: "Annual Application Security Testing for Critical Systems",
        description: "Application security testing conducted annually on all critical applications — or following material code changes; findings tracked to closure.",
        actionableSteps: [
          "Schedule annual whitebox/greybox penetration tests for all core banking apps.",
          "Retest critical applications whenever architectural redesigns occur.",
          "Log and track all application security findings in GRC CAPA register."
        ],
        regulatoryRef: "MAS TRM Sec. 10.2",
        priority: "ANNUAL",
        assignedRole: "AppSec Assessor",
        department: "Engineering & DevOps",
        status: "COMPLIANT",
        evidenceRequired: "Annual application penetration testing reports and closure verification letters",
        linkedISOControl: "A.8.29",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D5-09",
        domainNumber: "5",
        domainName: "Software & Application Security",
        subSectionTitle: "Production Application Security (Sec. 10.2)",
        taskCode: "D5.9",
        title: "Third-Party Software Assessment & Vendor Patch SLA",
        description: "Third-party software and components assessed for security before deployment — vendor security assessments conducted; SLA for security patch provision required.",
        actionableSteps: [
          "Perform architectural security review of all commercial off-the-shelf (COTS) software.",
          "Incorporate security patch delivery SLAs (<= 14 days for Criticals) into vendor contracts.",
          "Validate source code escrow arrangements for mission-critical vendor platforms."
        ],
        regulatoryRef: "MAS TRM Sec. 10.2",
        priority: "GOVERNANCE",
        assignedRole: "IT Vendor Risk Manager",
        department: "Legal, Compliance & Data Privacy",
        status: "COMPLIANT",
        evidenceRequired: "COTS vendor security assessment checklists and executed contract exhibits containing patch SLAs",
        linkedISOControl: "A.8.30 / A.15.1",
        verificationMethod: "DOCUMENT_INSPECTION"
      }
    ]
  },

  // --- DOMAIN 6: Data Protection & Cryptography ---
  {
    domainNumber: "6",
    domainName: "Data Protection & Cryptography",
    shortName: "Data & Cryptography",
    description: "Protect sensitive financial and personal data through classification, encryption, and secure handling.",
    guidelineSectionRef: "MAS TRM Sec. 11",
    iconName: "Lock",
    badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
    criticality: "CRITICAL",
    expertPractitionerTip: "Unencrypted data in non-production environments is one of the most common MAS findings — and most preventable. Development teams frequently copy production data into test environments for debugging. Without data masking, this creates uncontrolled exposure of customer financial data. Build automated data masking into your data pipeline for any non-production data copy. Also review your backup encryption — many institutions encrypt primary storage but backup tapes or cloud snapshots remain unencrypted. MAS expects encryption at rest for ALL copies of sensitive data.",
    subTasks: [
      {
        id: "CHK-D6-01",
        domainNumber: "6",
        domainName: "Data Protection & Cryptography",
        subSectionTitle: "Data Classification & Protection (Sec. 11.1)",
        taskCode: "D6.1",
        title: "Enterprise Data Classification Policy Implementation",
        description: "Data classification policy implemented — all data assets classified by sensitivity (e.g. Confidential, Restricted, Internal, Public); classification applied at creation or ingestion.",
        actionableSteps: [
          "Publish 4-tier data classification policy across the enterprise.",
          "Deploy automated data tagging tools for files, emails, and database schemas.",
          "Audit classification compliance across unstructured and structured stores."
        ],
        regulatoryRef: "MAS TRM Sec. 11.1",
        priority: "REQUIRED",
        assignedRole: "Chief Data Officer / DPO",
        department: "Legal, Compliance & Data Privacy",
        status: "COMPLIANT",
        evidenceRequired: "Approved Data Classification Policy and data labeling configuration guidelines",
        linkedISOControl: "A.8.2",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D6-02",
        domainNumber: "6",
        domainName: "Data Protection & Cryptography",
        subSectionTitle: "Data Classification & Protection (Sec. 11.1)",
        taskCode: "D6.2",
        title: "Sensitive Data Inventory & Custodian Assignment",
        description: "Sensitive data inventory maintained — all repositories containing customer data, financial data, and regulated personal data identified with data owner assigned.",
        actionableSteps: [
          "Map all repositories holding customer banking, NRIC, cardholder, and PII data.",
          "Designate accountable data owner for each repository in the data catalog.",
          "Re-certify sensitive data inventory semi-annually."
        ],
        regulatoryRef: "MAS TRM Sec. 11.1",
        priority: "REQUIRED",
        assignedRole: "Data Governance Lead",
        department: "Legal, Compliance & Data Privacy",
        status: "COMPLIANT",
        evidenceRequired: "Enterprise Sensitive Data Inventory with assigned business data custodians",
        linkedISOControl: "A.8.1",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D6-03",
        domainNumber: "6",
        domainName: "Data Protection & Cryptography",
        subSectionTitle: "Data Classification & Protection (Sec. 11.1)",
        taskCode: "D6.3",
        title: "Data Loss Prevention (DLP) Deployment (Email, Web, Endpoint)",
        description: "Data Loss Prevention (DLP) controls deployed — monitoring and blocking of sensitive data exfiltration via email, cloud upload, and removable media.",
        actionableSteps: [
          "Configure DLP policies on mail gateways to block unencrypted customer records.",
          "Deploy cloud access security broker (CASB) to prevent unsanctioned cloud uploads.",
          "Route DLP high-confidence violation alerts to SOC for incident triage."
        ],
        regulatoryRef: "MAS TRM Sec. 11.1",
        priority: "REQUIRED",
        assignedRole: "DLP Administrator",
        department: "InfoSec & Security Operations",
        status: "COMPLIANT",
        evidenceRequired: "DLP policy rulebase configuration and monthly incident escalation logs",
        linkedISOControl: "A.8.12",
        verificationMethod: "SYSTEM_CONFIGURATION"
      },
      {
        id: "CHK-D6-04",
        domainNumber: "6",
        domainName: "Data Protection & Cryptography",
        subSectionTitle: "Data Classification & Protection (Sec. 11.1)",
        taskCode: "D6.4",
        title: "Data Masking & Anonymisation in Non-Production Environments",
        description: "Data masking / anonymisation applied in non-production environments — production customer data not accessible in development, test, or analytics environments without controls.",
        actionableSteps: [
          "Implement automated synthetic data generators or deterministic masking pipelines.",
          "Mask customer names, NRICs, account numbers, and transaction balances.",
          "Conduct unannounced automated scans of staging databases to detect unmasked PII."
        ],
        regulatoryRef: "MAS TRM Sec. 11.1",
        priority: "CRITICAL",
        assignedRole: "Lead Data Engineer",
        department: "Engineering & DevOps",
        status: "COMPLIANT",
        evidenceRequired: "Data masking ruleset configuration and non-production scan report proving zero raw customer data",
        linkedISOControl: "A.8.31",
        verificationMethod: "SYSTEM_CONFIGURATION"
      },
      {
        id: "CHK-D6-05",
        domainNumber: "6",
        domainName: "Data Protection & Cryptography",
        subSectionTitle: "Cryptographic Controls (Sec. 11.2)",
        taskCode: "D6.5",
        title: "Encryption Standards (TLS 1.2+ Transit / AES-256 Rest)",
        description: "Encryption standard policy documented — minimum TLS 1.2 for data in transit; AES-256 or equivalent for data at rest; weak algorithms (MD5, SHA-1, DES, RC4) prohibited.",
        actionableSteps: [
          "Disable TLS 1.0, 1.1, and deprecated ciphers globally.",
          "Enforce AES-256 on all SAN storage, database volumes, and cloud backups.",
          "Scan codebases to confirm prohibition of obsolete algorithms (MD5, SHA-1, DES)."
        ],
        regulatoryRef: "MAS TRM Sec. 11.2",
        priority: "REQUIRED",
        assignedRole: "Chief Security Architect",
        department: "InfoSec & Security Operations",
        status: "COMPLIANT",
        evidenceRequired: "Approved Cryptographic Standard and SSL Labs A+ / cipher audit certificates",
        linkedISOControl: "A.8.24",
        verificationMethod: "SYSTEM_CONFIGURATION"
      },
      {
        id: "CHK-D6-06",
        domainNumber: "6",
        domainName: "Data Protection & Cryptography",
        subSectionTitle: "Cryptographic Controls (Sec. 11.2)",
        taskCode: "D6.6",
        title: "Cryptographic Key Management Lifecycle Procedures",
        description: "Cryptographic key management process formally documented — key generation, distribution, storage, rotation, and destruction procedures defined and operational.",
        actionableSteps: [
          "Document split knowledge and dual control for master key generation ceremonies.",
          "Enforce automated key rotation cycles (annual for KEKs, 90 days for DEKs).",
          "Log all key access and zeroization operations in tamper-evident audit logs."
        ],
        regulatoryRef: "MAS TRM Sec. 11.2",
        priority: "REQUIRED",
        assignedRole: "Cryptographic Officer",
        department: "InfoSec & Security Operations",
        status: "COMPLIANT",
        evidenceRequired: "Key Management Standard operating procedures and signed key ceremony minutes",
        linkedISOControl: "A.8.24",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D6-07",
        domainNumber: "6",
        domainName: "Data Protection & Cryptography",
        subSectionTitle: "Cryptographic Controls (Sec. 11.2)",
        taskCode: "D6.7",
        title: "Hardware Security Modules (HSM) for High-Value Operations",
        description: "Hardware Security Modules (HSMs) used for high-value cryptographic operations — payment processing, PKI operations, and digital signing use HSM-protected keys.",
        actionableSteps: [
          "Deploy FIPS 140-2 Level 3 validated HSMs for PIN processing and root CAs.",
          "Ensure private keys never leave the secure boundary in plaintext.",
          "Verify high availability and geo-redundant HSM clustering."
        ],
        regulatoryRef: "MAS TRM Sec. 11.2",
        priority: "REQUIRED",
        assignedRole: "Lead Cryptographic Engineer",
        department: "IT Infrastructure & Architecture",
        status: "COMPLIANT",
        evidenceRequired: "HSM procurement certifications (FIPS 140-2 L3) and HSM configuration audit logs",
        linkedISOControl: "A.8.24",
        verificationMethod: "SYSTEM_CONFIGURATION"
      },
      {
        id: "CHK-D6-08",
        domainNumber: "6",
        domainName: "Data Protection & Cryptography",
        subSectionTitle: "Cryptographic Controls (Sec. 11.2)",
        taskCode: "D6.8",
        title: "Annual Cryptographic Review & Post-Quantum Roadmap",
        description: "Cryptographic standards reviewed annually — algorithm agility plan in place; quantum-resistant migration roadmap documented for long-dated sensitive data.",
        actionableSteps: [
          "Assess current cipher portfolio against latest NIST Post-Quantum standards.",
          "Identify sensitive financial records with >10-year retention requirements.",
          "Document roadmap for migrating to quantum-resistant hybrid algorithms."
        ],
        regulatoryRef: "MAS TRM Sec. 11.2",
        priority: "ANNUAL",
        assignedRole: "Chief Security Architect",
        department: "InfoSec & Security Operations",
        status: "COMPLIANT",
        evidenceRequired: "Annual cryptographic review document and Quantum-Resistant Migration Strategy paper",
        linkedISOControl: "A.8.24",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D6-09",
        domainNumber: "6",
        domainName: "Data Protection & Cryptography",
        subSectionTitle: "Cryptographic Controls (Sec. 11.2)",
        taskCode: "D6.9",
        title: "TLS/SSL Certificate Lifecycle & Expiry Monitoring",
        description: "Certificate lifecycle management operational — all TLS/SSL certificates inventoried; expiry alerts configured; wildcard certificates minimised.",
        actionableSteps: [
          "Deploy automated certificate discovery and inventory tool.",
          "Configure automated alerts at 60, 30, and 14 days before certificate expiration.",
          "Enforce approval requirement restricting wildcard certificates on critical domains."
        ],
        regulatoryRef: "MAS TRM Sec. 11.2",
        priority: "DOCS",
        assignedRole: "PKI Administrator",
        department: "IT Infrastructure & Architecture",
        status: "COMPLIANT",
        evidenceRequired: "Live certificate inventory dashboard and automated renewal alert configurations",
        linkedISOControl: "A.8.24",
        verificationMethod: "SYSTEM_CONFIGURATION"
      }
    ]
  },

  // --- DOMAIN 7: Business Continuity & Disaster Recovery ---
  {
    domainNumber: "7",
    domainName: "Business Continuity & Disaster Recovery",
    shortName: "BCP & Disaster Recovery",
    description: "Ensure critical financial systems remain available and recoverable within MAS-expected thresholds.",
    guidelineSectionRef: "MAS TRM Sec. 6",
    iconName: "RotateCcw",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    criticality: "CRITICAL",
    expertPractitionerTip: "DR tests that are never failed are DR tests that have never truly been tested. MAS expects to see genuine resilience testing outcomes — including failures, partial recoveries, and lessons learned. A DR exercise that always passes perfectly suggests it is scripted, not realistic. Build failure scenarios into your tests: corrupted backups, unavailable recovery team members, DNS failures during failover. Document what broke and what you fixed. This evidence of continuous improvement is exactly what MAS supervisors look for.",
    subTasks: [
      {
        id: "CHK-D7-01",
        domainNumber: "7",
        domainName: "Business Continuity & Disaster Recovery",
        subSectionTitle: "BCP & DR Planning (Sec. 6.1–6.2)",
        taskCode: "D7.1",
        title: "Business Impact Analysis (BIA) with MTD, RTO & RPO",
        description: "Business Impact Analysis (BIA) conducted and documented — all technology services assessed for criticality; Maximum Tolerable Downtime (MTD), RTO, and RPO defined for each.",
        actionableSteps: [
          "Conduct BIA workshops across all business lines and payment channels.",
          "Calculate financial, operational, and regulatory impact of service disruptions.",
          "Formally ratify RTO and RPO targets at Executive Committee level."
        ],
        regulatoryRef: "MAS TRM Sec. 6.1–6.2",
        priority: "REQUIRED",
        assignedRole: "Head of Business Continuity",
        department: "Enterprise Risk Management",
        status: "COMPLIANT",
        evidenceRequired: "Approved Enterprise BIA report signed by business heads and CIO",
        linkedISOControl: "A.8.14",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D7-02",
        domainNumber: "7",
        domainName: "Business Continuity & Disaster Recovery",
        subSectionTitle: "BCP & DR Planning (Sec. 6.1–6.2)",
        taskCode: "D7.2",
        title: "Documented BCP and Disaster Recovery Plan (DRP)",
        description: "Business Continuity Plan (BCP) and Disaster Recovery Plan (DRP) formally documented — both plans tested, version-controlled, and accessible to recovery teams at all times.",
        actionableSteps: [
          "Maintain detailed failover runbooks for all critical system tiers.",
          "Ensure out-of-band offline copies of DRP are available to recovery leads.",
          "Update emergency contact matrices and escalation trees quarterly."
        ],
        regulatoryRef: "MAS TRM Sec. 6.1–6.2",
        priority: "REQUIRED",
        assignedRole: "Disaster Recovery Lead",
        department: "IT Infrastructure & Architecture",
        status: "COMPLIANT",
        evidenceRequired: "Approved Disaster Recovery Plan and Business Continuity Plan manuals",
        linkedISOControl: "A.8.14",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D7-03",
        domainNumber: "7",
        domainName: "Business Continuity & Disaster Recovery",
        subSectionTitle: "BCP & DR Planning (Sec. 6.1–6.2)",
        taskCode: "D7.3",
        title: "Critical System RTO <= 4 Hours Mandate",
        description: "Recovery Time Objective (RTO) for critical systems meets MAS expectations — systems supporting payment clearing and critical financial operations have RTO of 4 hours or less.",
        actionableSteps: [
          "Engineer active-active or automated warm standby secondary sites.",
          "Eliminate manual database promotion steps that exceed the 4-hour window.",
          "Verify that full end-to-end failover completes under 4 hours."
        ],
        regulatoryRef: "MAS TRM Sec. 6.1–6.2",
        priority: "CRITICAL",
        assignedRole: "Lead Systems Architect",
        department: "IT Infrastructure & Architecture",
        status: "COMPLIANT",
        evidenceRequired: "System architecture high-availability design and logged DR test duration timings (<4h)",
        linkedISOControl: "A.8.14",
        verificationMethod: "SYSTEM_CONFIGURATION"
      },
      {
        id: "CHK-D7-04",
        domainNumber: "7",
        domainName: "Business Continuity & Disaster Recovery",
        subSectionTitle: "BCP & DR Planning (Sec. 6.1–6.2)",
        taskCode: "D7.4",
        title: "RPO Validation Through Backup Restoration Testing",
        description: "Recovery Point Objective (RPO) validated through testing — backup restoration tested to confirm data recovery within defined RPO; results documented.",
        actionableSteps: [
          "Configure automated asynchronous/synchronous storage mirroring (RPO <= 1 hr).",
          "Execute point-in-time database restoration to verify zero data loss.",
          "Record transactional delta and reconcile against source records."
        ],
        regulatoryRef: "MAS TRM Sec. 6.1–6.2",
        priority: "REQUIRED",
        assignedRole: "Principal DBA",
        department: "IT Infrastructure & Architecture",
        status: "COMPLIANT",
        evidenceRequired: "Database restoration test report comparing source and restored timestamps confirming RPO target",
        linkedISOControl: "A.8.13",
        verificationMethod: "SYSTEM_CONFIGURATION"
      },
      {
        id: "CHK-D7-05",
        domainNumber: "7",
        domainName: "Business Continuity & Disaster Recovery",
        subSectionTitle: "BCP & DR Planning (Sec. 6.1–6.2)",
        taskCode: "D7.5",
        title: "Annual BCP & DR Plan Review & Material Update",
        description: "BCP and DR plans reviewed and updated at minimum annually — or following significant technology change, material incident, or organisational restructuring.",
        actionableSteps: [
          "Schedule annual review of all recovery procedures with IT and business leads.",
          "Incorporate post-mortem findings from actual operational incidents.",
          "Obtain Senior Management Committee re-approval."
        ],
        regulatoryRef: "MAS TRM Sec. 6.1–6.2",
        priority: "ANNUAL",
        assignedRole: "BCP Manager",
        department: "Enterprise Risk Management",
        status: "COMPLIANT",
        evidenceRequired: "Annual BCP review sign-off and tracked document revision history",
        linkedISOControl: "A.8.14",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D7-06",
        domainNumber: "7",
        domainName: "Business Continuity & Disaster Recovery",
        subSectionTitle: "Testing & Resilience Validation (Sec. 6.3)",
        taskCode: "D7.6",
        title: "Annual Full Failover DR Site Exercise & Gap Remediation",
        description: "DR exercise conducted at minimum annually — full failover to DR site tested; results documented; gaps identified and tracked to closure within 60 days.",
        actionableSteps: [
          "Execute live weekend traffic cutover to secondary disaster recovery data centre.",
          "Involve business users to validate transaction processing in DR.",
          "Track all identified bottlenecks in CAPA register with 60-day closure SLA."
        ],
        regulatoryRef: "MAS TRM Sec. 6.3",
        priority: "REQUIRED",
        assignedRole: "Disaster Recovery Coordinator",
        department: "IT Infrastructure & Architecture",
        status: "COMPLIANT",
        evidenceRequired: "Full DR Exercise Report with timestamped runbook logs, user sign-offs, and corrective action list",
        linkedISOControl: "A.8.14",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D7-07",
        domainNumber: "7",
        domainName: "Business Continuity & Disaster Recovery",
        subSectionTitle: "Testing & Resilience Validation (Sec. 6.3)",
        taskCode: "D7.7",
        title: "Cyber Resilience Tabletop Testing (Ransomware & Corruption)",
        description: "Cyber resilience scenario testing conducted — tabletop exercises include ransomware, data corruption, and targeted attack scenarios affecting critical systems.",
        actionableSteps: [
          "Design extreme scenario: widespread simultaneous ransomware and backup encryption.",
          "Test crisis management team decision-making and out-of-band communication.",
          "Evaluate immutable backup vault restoration without internet access."
        ],
        regulatoryRef: "MAS TRM Sec. 6.3",
        priority: "REQUIRED",
        assignedRole: "CISO / Crisis Manager",
        department: "InfoSec & Security Operations",
        status: "COMPLIANT",
        evidenceRequired: "Ransomware simulation exercise report and crisis management team lessons learned paper",
        linkedISOControl: "A.8.14",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D7-08",
        domainNumber: "7",
        domainName: "Business Continuity & Disaster Recovery",
        subSectionTitle: "Testing & Resilience Validation (Sec. 6.3)",
        taskCode: "D7.8",
        title: "Production System Availability Tracking & Max 4h/yr Downtime",
        description: "Production system availability metrics monitored — uptime against SLA tracked; availability reports provided to senior management quarterly.",
        actionableSteps: [
          "Deploy synthetic monitoring across all core customer journeys 24/7.",
          "Track cumulative unscheduled downtime against MAS limit (<= 4 hours per year).",
          "Report availability metrics to Board Risk Committee quarterly."
        ],
        regulatoryRef: "MAS TRM Sec. 6.3",
        priority: "GOVERNANCE",
        assignedRole: "IT Service Management Lead",
        department: "IT Infrastructure & Architecture",
        status: "COMPLIANT",
        evidenceRequired: "Quarterly production uptime reports and cumulative unscheduled downtime ledger",
        linkedISOControl: "A.8.14",
        verificationMethod: "AUTOMATED_SCAN"
      },
      {
        id: "CHK-D7-09",
        domainNumber: "7",
        domainName: "Business Continuity & Disaster Recovery",
        subSectionTitle: "Testing & Resilience Validation (Sec. 6.3)",
        taskCode: "D7.9",
        title: "Quarterly Backup Integrity & Restoration Verification",
        description: "Backup integrity verified through periodic restoration tests — all critical data backups tested for restoration at minimum quarterly; results logged.",
        actionableSteps: [
          "Automate weekly test restores of database snapshots into sandbox environments.",
          "Verify checksums and database consistency checks (DBCC/fsck).",
          "Log test restoration outcomes with timestamps and operator sign-offs."
        ],
        regulatoryRef: "MAS TRM Sec. 6.3",
        priority: "REVIEW",
        assignedRole: "Backup Administrator",
        department: "IT Infrastructure & Architecture",
        status: "COMPLIANT",
        evidenceRequired: "Quarterly backup restoration logs demonstrating successful test recovery",
        linkedISOControl: "A.8.13",
        verificationMethod: "SYSTEM_CONFIGURATION"
      }
    ]
  },

  // --- DOMAIN 8: Third-Party & Cloud Risk Management ---
  {
    domainNumber: "8",
    domainName: "Third-Party & Cloud Risk Management",
    shortName: "Outsourcing & Cloud",
    description: "Manage all outsourced technology services and cloud dependencies with documented controls.",
    guidelineSectionRef: "MAS TRM Sec. 5",
    iconName: "Cloud",
    badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    criticality: "CRITICAL",
    expertPractitionerTip: "Cloud shared responsibility is the most misunderstood concept in MAS TRM cloud assessments. Institutions consistently assume cloud providers are responsible for security controls that are, in fact, the institution\'s responsibility. AWS, Azure, and GCP are responsible for security \'of\' the cloud — not security \'in\' the cloud. Misconfigured S3 buckets, overly permissive IAM roles, and unencrypted cloud storage are the institution\'s liability. Document your shared responsibility matrix for every cloud service you consume, and include it in your MAS TRM evidence package.",
    subTasks: [
      {
        id: "CHK-D8-01",
        domainNumber: "8",
        domainName: "Third-Party & Cloud Risk Management",
        subSectionTitle: "Outsourcing & Vendor Due Diligence (Sec. 5.1–5.2)",
        taskCode: "D8.1",
        title: "Third-Party Technology Vendor Inventory & Risk Tiering",
        description: "Third-party technology vendor inventory maintained — all vendors with access to systems or data identified; classified by risk tier; reviewed at minimum annually.",
        actionableSteps: [
          "Catalog all technology vendors, SaaS providers, and cloud contractors.",
          "Classify vendors into Tier 1 (Critical), Tier 2 (Material), Tier 3 (Standard).",
          "Re-certify vendor inventory annually with procurement and business owners."
        ],
        regulatoryRef: "MAS TRM Sec. 5.1–5.2",
        priority: "CRITICAL",
        assignedRole: "Vendor Risk Manager",
        department: "Legal, Compliance & Data Privacy",
        status: "COMPLIANT",
        evidenceRequired: "Complete Technology Vendor Inventory with assigned criticality ratings and data access levels",
        linkedISOControl: "A.15.1",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D8-02",
        domainNumber: "8",
        domainName: "Third-Party & Cloud Risk Management",
        subSectionTitle: "Outsourcing & Vendor Due Diligence (Sec. 5.1–5.2)",
        taskCode: "D8.2",
        title: "Pre-Engagement Vendor Security Due Diligence",
        description: "Pre-engagement due diligence conducted for all material technology vendors — security posture, financial stability, sub-contractor use, and data localisation assessed before contract execution.",
        actionableSteps: [
          "Execute comprehensive security questionnaire (SIG/CAIQ) for prospective vendors.",
          "Review SOC 2 Type II reports, ISO 27001 certifications, and financial stability.",
          "Validate fourth-party sub-contractor dependencies and data jurisdiction."
        ],
        regulatoryRef: "MAS TRM Sec. 5.1–5.2",
        priority: "REQUIRED",
        assignedRole: "Third-Party Risk Assessor",
        department: "InfoSec & Security Operations",
        status: "COMPLIANT",
        evidenceRequired: "Completed pre-contract vendor due diligence assessment packages",
        linkedISOControl: "A.15.1",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D8-03",
        domainNumber: "8",
        domainName: "Third-Party & Cloud Risk Management",
        subSectionTitle: "Outsourcing & Vendor Due Diligence (Sec. 5.1–5.2)",
        taskCode: "D8.3",
        title: "Mandatory MAS Contractual Clauses (Audit, Ownership, Exit)",
        description: "Technology outsourcing contracts include MAS-required provisions — right to audit, data ownership, security standards, notification obligations, and exit management clauses.",
        actionableSteps: [
          "Embed MAS Outsourcing Guidelines mandatory clauses in all vendor master agreements.",
          "Guarantee unhindered right of audit for the institution and MAS inspectors.",
          "Specify 24-hour incident notification obligation for any breach affecting data."
        ],
        regulatoryRef: "MAS TRM Sec. 5.1–5.2",
        priority: "REQUIRED",
        assignedRole: "Legal Counsel / Procurement Lead",
        department: "Legal, Compliance & Data Privacy",
        status: "COMPLIANT",
        evidenceRequired: "Executed contract samples containing required MAS regulatory schedule clauses",
        linkedISOControl: "A.15.1",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D8-04",
        domainNumber: "8",
        domainName: "Third-Party & Cloud Risk Management",
        subSectionTitle: "Outsourcing & Vendor Due Diligence (Sec. 5.1–5.2)",
        taskCode: "D8.4",
        title: "Vendor Concentration Risk & Single Point of Failure Analysis",
        description: "Concentration risk evaluated — single points of failure in critical vendor dependencies identified; mitigation strategies documented and approved by senior management.",
        actionableSteps: [
          "Analyze multi-system reliance on single cloud/vendor providers.",
          "Identify concentration risks and evaluate operational failover strategies.",
          "Present concentration risk matrix to Senior Management Committee annually."
        ],
        regulatoryRef: "MAS TRM Sec. 5.1–5.2",
        priority: "REQUIRED",
        assignedRole: "Enterprise Risk Manager",
        department: "Enterprise Risk Management",
        status: "COMPLIANT",
        evidenceRequired: "Vendor Concentration Risk Assessment Paper approved by Executive Risk Committee",
        linkedISOControl: "A.15.2",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D8-05",
        domainNumber: "8",
        domainName: "Third-Party & Cloud Risk Management",
        subSectionTitle: "Outsourcing & Vendor Due Diligence (Sec. 5.1–5.2)",
        taskCode: "D8.5",
        title: "Annual Re-Assessment of Critical & Material Vendors",
        description: "Annual vendor re-assessment conducted for high-risk and critical vendors — security posture reassessed; material changes to their environment assessed for impact.",
        actionableSteps: [
          "Obtain renewed SOC 2 Type II / ISO 27001 certificates from all Tier 1 vendors annually.",
          "Review vendor SLA performance and incident history.",
          "Re-rate vendor residual risk and document in enterprise risk register."
        ],
        regulatoryRef: "MAS TRM Sec. 5.1–5.2",
        priority: "ANNUAL",
        assignedRole: "Vendor Risk Manager",
        department: "Legal, Compliance & Data Privacy",
        status: "COMPLIANT",
        evidenceRequired: "Annual vendor re-assessment audit files and updated risk rating scorecard",
        linkedISOControl: "A.15.2",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D8-06",
        domainNumber: "8",
        domainName: "Third-Party & Cloud Risk Management",
        subSectionTitle: "Cloud Risk Management (Sec. 5.3)",
        taskCode: "D8.6",
        title: "Pre-Migration Cloud Adoption Risk Assessment",
        description: "Cloud adoption risk assessment completed before migration — data classification, residency requirements, shared responsibility model, and exit capability assessed.",
        actionableSteps: [
          "Execute cloud risk evaluation prior to provisioning cloud workloads.",
          "Map Singapore data residency requirements and international transfer rules.",
          "Document granular customer vs provider shared responsibility matrix."
        ],
        regulatoryRef: "MAS TRM Sec. 5.3",
        priority: "REQUIRED",
        assignedRole: "Cloud Architect",
        department: "IT Infrastructure & Architecture",
        status: "COMPLIANT",
        evidenceRequired: "Pre-migration Cloud Risk Assessment report and documented Shared Responsibility Matrix",
        linkedISOControl: "A.15.1 / A.8.1",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D8-07",
        domainNumber: "8",
        domainName: "Third-Party & Cloud Risk Management",
        subSectionTitle: "Cloud Risk Management (Sec. 5.3)",
        taskCode: "D8.7",
        title: "Continuous Cloud Security Posture Management (CSPM)",
        description: "Cloud Security Posture Management (CSPM) tool deployed — continuous monitoring of cloud configuration against security baseline; misconfigurations alerted and remediated.",
        actionableSteps: [
          "Deploy CSPM (Prisma Cloud/Wiz/AWS Security Hub) across all cloud subscriptions.",
          "Check continuously against CIS Cloud Benchmarks.",
          "Automate alerts and auto-remediation for public storage buckets and open ports."
        ],
        regulatoryRef: "MAS TRM Sec. 5.3",
        priority: "REQUIRED",
        assignedRole: "Cloud Security Engineer",
        department: "InfoSec & Security Operations",
        status: "COMPLIANT",
        evidenceRequired: "CSPM console compliance dashboard showing continuous monitoring against CIS benchmarks",
        linkedISOControl: "A.8.9",
        verificationMethod: "AUTOMATED_SCAN"
      },
      {
        id: "CHK-D8-08",
        domainNumber: "8",
        domainName: "Third-Party & Cloud Risk Management",
        subSectionTitle: "Cloud Risk Management (Sec. 5.3)",
        taskCode: "D8.8",
        title: "Regulatory Notification for Material Outsourcing Arrangements",
        description: "MAS notified of material outsourcing arrangements — notification submitted as required under MAS Guidelines on Outsourcing before go-live.",
        actionableSteps: [
          "Assess arrangement against MAS criteria for material outsourcing.",
          "Prepare formal notification letter and risk assessment dossier.",
          "Submit to MAS at least 1 month prior to contract execution or live operation."
        ],
        regulatoryRef: "MAS TRM Sec. 5.3",
        priority: "CRITICAL",
        assignedRole: "Head of Regulatory Compliance",
        department: "Legal, Compliance & Data Privacy",
        status: "COMPLIANT",
        evidenceRequired: "Copies of formal MAS notification submission and regulatory acknowledgment letters",
        linkedISOControl: "A.15.1",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D8-09",
        domainNumber: "8",
        domainName: "Third-Party & Cloud Risk Management",
        subSectionTitle: "Cloud Risk Management (Sec. 5.3)",
        taskCode: "D8.9",
        title: "Documented Cloud Exit Strategy & Data Portability Testing",
        description: "Exit strategy documented for all critical cloud services — data portability, transition plan, and run-off period defined; tested as part of DR planning.",
        actionableSteps: [
          "Formulate exit strategy for critical cloud providers to prevent vendor lock-in.",
          "Validate standard data formats (JSON/Parquet/SQL dumps) for rapid extraction.",
          "Conduct tabletop simulation of vendor sudden insolvency or termination."
        ],
        regulatoryRef: "MAS TRM Sec. 5.3",
        priority: "DOCS",
        assignedRole: "Chief Enterprise Architect",
        department: "IT Infrastructure & Architecture",
        status: "COMPLIANT",
        evidenceRequired: "Approved Cloud Exit Strategy document and data portability validation test report",
        linkedISOControl: "A.15.2",
        verificationMethod: "DOCUMENT_INSPECTION"
      }
    ]
  },

  // --- DOMAIN 9: Security Monitoring & Incident Response ---
  {
    domainNumber: "9",
    domainName: "Security Monitoring & Incident Response",
    shortName: "Monitoring & Incident Response",
    description: "Detect, respond to, and recover from cyber incidents within MAS-required timeframes.",
    guidelineSectionRef: "MAS TRM Sec. 13–14",
    iconName: "Radar",
    badgeColor: "bg-blue-600/20 text-blue-300 border-blue-600/40",
    criticality: "CRITICAL",
    expertPractitionerTip: "MAS\'s 1-hour notification requirement for critical incidents catches most institutions unprepared. MAS Notice on Cyber Incident Reporting requires notification within 1 hour for incidents affecting critical systems or customer data. Most institutions discover their escalation path has never been tested when a real incident occurs at 2am. Pre-draft your notification templates now. Identify your MAS relationship manager contact. Test your out-of-hours escalation chain in a tabletop exercise. The 1-hour clock starts when you become aware — not when your investigation is complete.",
    subTasks: [
      {
        id: "CHK-D9-01",
        domainNumber: "9",
        domainName: "Security Monitoring & Incident Response",
        subSectionTitle: "Security Monitoring & SOC Capability (Sec. 13.1)",
        taskCode: "D9.1",
        title: "Centralised SIEM Deployment & Threat Correlation",
        description: "Security Information & Event Management (SIEM) deployed — centralised log collection from all critical systems; correlation rules tuned for financial sector threat scenarios.",
        actionableSteps: [
          "Aggregate logs from firewalls, servers, databases, PAM, and cloud workloads.",
          "Tune correlation rules specifically for credential stuffing, privilege escalation, and exfiltration.",
          "Review and update detection rules quarterly against MITRE ATT&CK techniques."
        ],
        regulatoryRef: "MAS TRM Sec. 13.1",
        priority: "REQUIRED",
        assignedRole: "SIEM Architect",
        department: "InfoSec & Security Operations",
        status: "COMPLIANT",
        evidenceRequired: "SIEM data ingestion metrics, source log matrix, and active correlation rule catalog",
        linkedISOControl: "A.12.4",
        verificationMethod: "SYSTEM_CONFIGURATION"
      },
      {
        id: "CHK-D9-02",
        domainNumber: "9",
        domainName: "Security Monitoring & Incident Response",
        subSectionTitle: "Security Monitoring & SOC Capability (Sec. 13.1)",
        taskCode: "D9.2",
        title: "Operational 24x7 Security Operations Centre (SOC)",
        description: "Security Operations Centre (SOC) capability operational — 24x7 monitoring of critical systems; alert triage, investigation, and escalation procedures documented.",
        actionableSteps: [
          "Staff 24/7 internal or hybrid MSSP SOC with clear handover protocols.",
          "Enforce SLA: acknowledge High/Critical alerts in <= 15 minutes.",
          "Maintain documented SOPs for triage, containment, and management escalation."
        ],
        regulatoryRef: "MAS TRM Sec. 13.1",
        priority: "REQUIRED",
        assignedRole: "SOC Manager",
        department: "InfoSec & Security Operations",
        status: "COMPLIANT",
        evidenceRequired: "SOC operating charter, shift handover rosters, and SLA performance dashboards",
        linkedISOControl: "A.12.4",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D9-03",
        domainNumber: "9",
        domainName: "Security Monitoring & Incident Response",
        subSectionTitle: "Security Monitoring & SOC Capability (Sec. 13.1)",
        taskCode: "D9.3",
        title: "Security Log Retention Policy (1 Year Online / 3 Years Archive)",
        description: "Log retention policy enforced — security logs retained for minimum 1 year online and 3 years in archive; log integrity protected through write-once or cryptographic controls.",
        actionableSteps: [
          "Enforce tamper-resistant storage with WORM compliance.",
          "Maintain 365 days of indexed hot/warm searchable logs in SIEM.",
          "Transition older logs to cold immutable object storage for 3 years."
        ],
        regulatoryRef: "MAS TRM Sec. 13.1",
        priority: "REQUIRED",
        assignedRole: "Logging & Compliance Engineer",
        department: "InfoSec & Security Operations",
        status: "COMPLIANT",
        evidenceRequired: "Log storage configuration verifying 1-year online and 3-year archive retention policies",
        linkedISOControl: "A.12.4",
        verificationMethod: "SYSTEM_CONFIGURATION"
      },
      {
        id: "CHK-D9-04",
        domainNumber: "9",
        domainName: "Security Monitoring & Incident Response",
        subSectionTitle: "Security Monitoring & SOC Capability (Sec. 13.1)",
        taskCode: "D9.4",
        title: "Threat Intelligence Operationalisation (FS-ISAC & MAS Advisories)",
        description: "Threat intelligence program in place — MAS-issued advisories actioned; FS-ISAC and sector-specific threat intelligence consumed and operationalised.",
        actionableSteps: [
          "Subscribe to FS-ISAC feeds and MAS Cyber Advisory distribution channels.",
          "Ingest IoCs (hashes, IPs, domains) automatically into SIEM/EDR blocklists.",
          "Log action taken for every MAS-issued technical advisory."
        ],
        regulatoryRef: "MAS TRM Sec. 13.1",
        priority: "DOCS",
        assignedRole: "Threat Intelligence Analyst",
        department: "InfoSec & Security Operations",
        status: "COMPLIANT",
        evidenceRequired: "Threat intel tracking register showing MAS advisory receipt, analysis, and rule updates",
        linkedISOControl: "A.5.7",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D9-05",
        domainNumber: "9",
        domainName: "Security Monitoring & Incident Response",
        subSectionTitle: "Security Monitoring & SOC Capability (Sec. 13.1)",
        taskCode: "D9.5",
        title: "User & Entity Behaviour Analytics (UEBA) Deployment",
        description: "User and Entity Behaviour Analytics (UEBA) deployed for critical systems — anomalous access patterns and insider threat indicators monitored.",
        actionableSteps: [
          "Deploy UEBA engine baselining normal administrative and user behavior.",
          "Alert on anomalous data downloads, unusual login times, or impossible travel.",
          "Conduct monthly review of high-risk user anomaly reports with HR/InfoSec."
        ],
        regulatoryRef: "MAS TRM Sec. 13.1",
        priority: "REVIEW",
        assignedRole: "Senior Security Analyst",
        department: "InfoSec & Security Operations",
        status: "COMPLIANT",
        evidenceRequired: "UEBA baseline model dashboard and sample investigated anomaly cases",
        linkedISOControl: "A.12.4",
        verificationMethod: "SYSTEM_CONFIGURATION"
      },
      {
        id: "CHK-D9-06",
        domainNumber: "9",
        domainName: "Security Monitoring & Incident Response",
        subSectionTitle: "Incident Response & Regulatory Notification (Sec. 14)",
        taskCode: "D9.6",
        title: "Documented Cyber Incident Response Plan (CIRP)",
        description: "Cyber Incident Response Plan (CIRP) formally documented — roles, escalation paths, containment procedures, evidence preservation, and communications plan defined.",
        actionableSteps: [
          "Maintain CIRP covering preparation, identification, containment, eradication, recovery, lessons learned.",
          "Define digital forensics and forensic evidence preservation guidelines.",
          "Establish approved internal and external communication protocols."
        ],
        regulatoryRef: "MAS TRM Sec. 14",
        priority: "REQUIRED",
        assignedRole: "Incident Response Lead",
        department: "InfoSec & Security Operations",
        status: "COMPLIANT",
        evidenceRequired: "Approved Cyber Incident Response Plan document and incident severity classification matrix",
        linkedISOControl: "A.16.1",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D9-07",
        domainNumber: "9",
        domainName: "Security Monitoring & Incident Response",
        subSectionTitle: "Incident Response & Regulatory Notification (Sec. 14)",
        taskCode: "D9.7",
        title: "MAS 1-Hour Incident Notification Capability & Pre-Drafted Templates",
        description: "MAS incident notification process ready — criteria for notifiable incidents defined; notification template pre-drafted; 1-hour notification capability tested for critical incidents.",
        actionableSteps: [
          "Pre-populate MAS Incident Notification Form (Incident Report Template).",
          "Establish 24x7 escalation trigger notifying CISO within 15 minutes of critical disruption.",
          "Verify MAS relationship manager contact and secure email conduits."
        ],
        regulatoryRef: "MAS TRM Sec. 14 & MAS Notice 655",
        priority: "CRITICAL",
        assignedRole: "CISO / Head of Compliance",
        department: "InfoSec & Security Operations",
        status: "COMPLIANT",
        evidenceRequired: "Pre-drafted MAS Notice 655 incident report template and 1-hour out-of-hours call-tree drill record",
        linkedISOControl: "A.16.1",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D9-08",
        domainNumber: "9",
        domainName: "Security Monitoring & Incident Response",
        subSectionTitle: "Incident Response & Regulatory Notification (Sec. 14)",
        taskCode: "D9.8",
        title: "24x7 CIRT Roles, Responsibilities & Named Deputies",
        description: "Incident response team roles and responsibilities assigned — CIRT members identified with 24x7 contact details; deputies named for all critical roles.",
        actionableSteps: [
          "Designate Incident Commander, Technical Lead, Legal, Communications, and Forensics leads.",
          "Assign qualified deputies for every primary role to ensure continuous coverage.",
          "Re-verify out-of-hours mobile and secure messaging contacts quarterly."
        ],
        regulatoryRef: "MAS TRM Sec. 14",
        priority: "REQUIRED",
        assignedRole: "Incident Commander",
        department: "InfoSec & Security Operations",
        status: "COMPLIANT",
        evidenceRequired: "CIRT roster with primary and deputy contacts and quarterly call-tree verification log",
        linkedISOControl: "A.16.1",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D9-09",
        domainNumber: "9",
        domainName: "Security Monitoring & Incident Response",
        subSectionTitle: "Incident Response & Regulatory Notification (Sec. 14)",
        taskCode: "D9.9",
        title: "Post-Incident Review (14-Day RCA) & Control Improvements",
        description: "Post-incident review conducted for all material incidents — root cause analysis completed within 14 days; lessons learned shared with management and fed into control improvements.",
        actionableSteps: [
          "Conduct formal 5-Whys root cause analysis (RCA) for all P1/P2 incidents.",
          "Produce comprehensive Post-Incident Report within statutory 14-day MAS deadline.",
          "Track preventive corrective actions to closure in enterprise CAPA register."
        ],
        regulatoryRef: "MAS TRM Sec. 14 & MAS Notice 655",
        priority: "REVIEW",
        assignedRole: "Incident Response Lead",
        department: "InfoSec & Security Operations",
        status: "COMPLIANT",
        evidenceRequired: "Post-Incident Reports and RCA sign-offs for past year\'s material incidents",
        linkedISOControl: "A.16.1",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D9-10",
        domainNumber: "9",
        domainName: "Security Monitoring & Incident Response",
        subSectionTitle: "Incident Response & Regulatory Notification (Sec. 14)",
        taskCode: "D9.10",
        title: "Annual Cyber Incident Tabletop Exercise with Senior Management",
        description: "Tabletop exercises conducted annually — scenarios include targeted attack, ransomware, and insider threat; senior management participation documented.",
        actionableSteps: [
          "Facilitate crisis simulation with CEO, CISO, CIO, Legal, and PR leads.",
          "Simulate complex regulatory disclosure under strict 1-hour timeline pressure.",
          "Publish exercise report detailing strengths and opportunities for refinement."
        ],
        regulatoryRef: "MAS TRM Sec. 14",
        priority: "ANNUAL",
        assignedRole: "CISO / Crisis Management Lead",
        department: "Executive Board & Governance",
        status: "COMPLIANT",
        evidenceRequired: "Annual Tabletop Exercise Report with executive attendance roster and after-action items",
        linkedISOControl: "A.16.1",
        verificationMethod: "DOCUMENT_INSPECTION"
      }
    ]
  },

  // --- DOMAIN 10: Cyber Hygiene & Risk Culture ---
  {
    domainNumber: "10",
    domainName: "Cyber Hygiene & Risk Culture",
    shortName: "Hygiene & Culture",
    description: "Build and sustain a security-aware culture across the institution with MAS-expected training standards.",
    guidelineSectionRef: "MAS TRM Sec. 4 & Sec. 3–4",
    iconName: "ShieldCheck",
    badgeColor: "bg-emerald-600/20 text-emerald-300 border-emerald-600/40",
    criticality: "HIGH",
    expertPractitionerTip: "MAS TRM compliance is an ongoing operational discipline — not a one-time audit preparation exercise. Unlike ISO 27001 or SOC 2, there is no MAS TRM certificate to obtain. Compliance is demonstrated through accountable practices, documented decisions, and continuous operation of controls. MAS supervisory reviews look for genuine culture of technology risk management — not just documentation. Build quarterly compliance check-ins into your calendar, review your risk register whenever you launch a new system, and treat your CISO or external TRM advisor as a standing member of your board risk committee.",
    subTasks: [
      {
        id: "CHK-D10-01",
        domainNumber: "10",
        domainName: "Cyber Hygiene & Risk Culture",
        subSectionTitle: "Security Awareness & Training (Sec. 4.1)",
        taskCode: "D10.1",
        title: "Mandatory Staff Security Awareness Training (Annual + New Joiners)",
        description: "Security awareness training delivered to all staff — mandatory annual completion tracked; new joiners trained within first month of employment.",
        actionableSteps: [
          "Mandate security awareness completion during employee onboarding (<30 days).",
          "Require annual refresher training for 100% of staff and contractors.",
          "Automate reminders and escalate non-completions to direct supervisors."
        ],
        regulatoryRef: "MAS TRM Sec. 4.1",
        priority: "REQUIRED",
        assignedRole: "Security Awareness Lead",
        department: "Executive Board & Governance",
        status: "COMPLIANT",
        evidenceRequired: "LMS training completion records showing >98% compliance across all employees",
        linkedISOControl: "A.7.2",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D10-02",
        domainNumber: "10",
        domainName: "Cyber Hygiene & Risk Culture",
        subSectionTitle: "Security Awareness & Training (Sec. 4.1)",
        taskCode: "D10.2",
        title: "Quarterly Phishing Simulation & Remedial Training",
        description: "Phishing simulation program operational — simulations conducted at minimum quarterly; click-rate tracked; repeat clickers receive targeted remedial training.",
        actionableSteps: [
          "Execute unannounced quarterly phishing simulations across diverse templates.",
          "Track organization-wide click rates and credential-entry rates.",
          "Automatically assign targeted remedial modules to repeat clickers."
        ],
        regulatoryRef: "MAS TRM Sec. 4.1",
        priority: "REQUIRED",
        assignedRole: "Security Awareness Specialist",
        department: "InfoSec & Security Operations",
        status: "COMPLIANT",
        evidenceRequired: "Quarterly phishing simulation benchmark reports and remedial training completion logs",
        linkedISOControl: "A.7.2",
        verificationMethod: "AUTOMATED_SCAN"
      },
      {
        id: "CHK-D10-03",
        domainNumber: "10",
        domainName: "Cyber Hygiene & Risk Culture",
        subSectionTitle: "Security Awareness & Training (Sec. 4.1)",
        taskCode: "D10.3",
        title: "Role-Specific Technical Security Training",
        description: "Role-specific security training provided — developers trained in secure coding; IT staff trained in system hardening; management trained in technology risk governance.",
        actionableSteps: [
          "Deliver OWASP secure coding curriculum for all application engineers.",
          "Provide systems hardening and cloud security training to DevOps/SysAdmins.",
          "Conduct risk governance workshops for executive management."
        ],
        regulatoryRef: "MAS TRM Sec. 4.1",
        priority: "REQUIRED",
        assignedRole: "AppSec Lead / Technical Trainer",
        department: "Engineering & DevOps",
        status: "COMPLIANT",
        evidenceRequired: "Developer secure coding certification records and technical training course rosters",
        linkedISOControl: "A.7.2",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D10-04",
        domainNumber: "10",
        domainName: "Cyber Hygiene & Risk Culture",
        subSectionTitle: "Security Awareness & Training (Sec. 4.1)",
        taskCode: "D10.4",
        title: "Board-Level Cyber Literacy Program & Annual Briefings",
        description: "Board-level cyber literacy program in place — board members receive annual briefing on cyber threat landscape, MAS regulatory expectations, and institutional risk posture.",
        actionableSteps: [
          "Deliver tailored Board briefing covering financial sector cyber threat actors.",
          "Review MAS circulars, inspection focus areas, and governance responsibilities.",
          "Record Board member attendance and discussions in formal minutes."
        ],
        regulatoryRef: "MAS TRM Sec. 4.1",
        priority: "GOVERNANCE",
        assignedRole: "CISO / Corporate Secretary",
        department: "Executive Board & Governance",
        status: "COMPLIANT",
        evidenceRequired: "Board cyber briefing presentation deck and signed meeting minutes",
        linkedISOControl: "A.7.2",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D10-05",
        domainNumber: "10",
        domainName: "Cyber Hygiene & Risk Culture",
        subSectionTitle: "Security Awareness & Training (Sec. 4.1)",
        taskCode: "D10.5",
        title: "Training Completion Tracking & Escalation to Business Heads",
        description: "Security awareness training completion rates reported to management — non-completion tracked; escalated to business unit heads for resolution.",
        actionableSteps: [
          "Track completion rates by department in monthly HR/GRC dashboards.",
          "Escalate employees delinquent after 30 days to Department Heads.",
          "Consider access suspension for persistent non-completers after 60 days."
        ],
        regulatoryRef: "MAS TRM Sec. 4.1",
        priority: "ANNUAL",
        assignedRole: "Head of HR / GRC Lead",
        department: "Executive Board & Governance",
        status: "COMPLIANT",
        evidenceRequired: "Monthly training compliance escalation reports to Business Unit Heads",
        linkedISOControl: "A.7.2",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D10-06",
        domainNumber: "10",
        domainName: "Cyber Hygiene & Risk Culture",
        subSectionTitle: "Ongoing MAS TRM Compliance Programme (Sec. 3–4)",
        taskCode: "D10.6",
        title: "Formal MAS TRM Compliance Programme & Budget Allocation",
        description: "MAS TRM compliance programme formally established — ownership assigned, budget allocated, annual review cycle documented, progress reported to board.",
        actionableSteps: [
          "Establish dedicated TRM programme charter with defined executive sponsor.",
          "Allocate multi-year budget for control automation, tooling, and assessments.",
          "Report quarterly program milestones to the Board Risk Committee."
        ],
        regulatoryRef: "MAS TRM Sec. 3–4",
        priority: "GOVERNANCE",
        assignedRole: "Chief Risk Officer / Head of TRM",
        department: "Executive Board & Governance",
        status: "COMPLIANT",
        evidenceRequired: "Approved TRM Programme Charter, allocated budget ledger, and Board progress memos",
        linkedISOControl: "A.5.1",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D10-07",
        domainNumber: "10",
        domainName: "Cyber Hygiene & Risk Culture",
        subSectionTitle: "Ongoing MAS TRM Compliance Programme (Sec. 3–4)",
        taskCode: "D10.7",
        title: "Annual Review and Approval of All TRM-Related Policies",
        description: "Technology risk policies reviewed and approved annually — all TRM-related policies version-controlled; review schedule maintained; approvals documented.",
        actionableSteps: [
          "Maintain centralized policy review calendar covering all 10 TRM domains.",
          "Incorporate regulatory updates and audit feedback during revision cycles.",
          "Secure Senior Management Committee re-approval on all policies annually."
        ],
        regulatoryRef: "MAS TRM Sec. 3–4",
        priority: "ANNUAL",
        assignedRole: "GRC Policy Manager",
        department: "Enterprise Risk Management",
        status: "COMPLIANT",
        evidenceRequired: "Policy inventory register with annual review dates and committee sign-off memos",
        linkedISOControl: "A.5.1",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D10-08",
        domainNumber: "10",
        domainName: "Cyber Hygiene & Risk Culture",
        subSectionTitle: "Ongoing MAS TRM Compliance Programme (Sec. 3–4)",
        taskCode: "D10.8",
        title: "Independent Annual Internal Audit of MAS TRM Controls",
        description: "Internal audit of MAS TRM controls conducted — independent assurance of control effectiveness provided to board audit committee at minimum annually.",
        actionableSteps: [
          "Charter internal audit team or independent firm to audit TRM controls.",
          "Test operating effectiveness across infrastructure, access, and governance.",
          "Table comprehensive audit findings directly to Board Audit Committee."
        ],
        regulatoryRef: "MAS TRM Sec. 3–4",
        priority: "REQUIRED",
        assignedRole: "Head of Internal Audit",
        department: "Executive Board & Governance",
        status: "COMPLIANT",
        evidenceRequired: "Annual IT Internal Audit Report and Board Audit Committee presentation minutes",
        linkedISOControl: "A.5.3",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D10-09",
        domainNumber: "10",
        domainName: "Cyber Hygiene & Risk Culture",
        subSectionTitle: "Ongoing MAS TRM Compliance Programme (Sec. 3–4)",
        taskCode: "D10.9",
        title: "MAS Supervisory Relationship & Prompt Query Management",
        description: "MAS supervisory relationship managed — designated contact for MAS correspondence; responses to MAS queries prepared within required timescales.",
        actionableSteps: [
          "Designate Chief Compliance Officer as primary official liaison to MAS.",
          "Establish protocol to coordinate and review responses before dispatch to MAS.",
          "Maintain repository of all formal MAS correspondence and regulatory requests."
        ],
        regulatoryRef: "MAS TRM Sec. 3–4",
        priority: "REQUIRED",
        assignedRole: "Head of Regulatory Affairs",
        department: "Legal, Compliance & Data Privacy",
        status: "COMPLIANT",
        evidenceRequired: "Designated MAS liaison appointment letter and regulatory correspondence register",
        linkedISOControl: "A.5.6",
        verificationMethod: "DOCUMENT_INSPECTION"
      },
      {
        id: "CHK-D10-10",
        domainNumber: "10",
        domainName: "Cyber Hygiene & Risk Culture",
        subSectionTitle: "Ongoing MAS TRM Compliance Programme (Sec. 3–4)",
        taskCode: "D10.10",
        title: "Annual 10-Domain TRM Compliance Audit & Gap Closure Tracking",
        description: "Compliance programme audit conducted annually — internal or external MAS TRM review assessing all 10 domains; findings tracked to remediation closure.",
        actionableSteps: [
          "Conduct comprehensive end-to-end audit assessing all 93 controls across 10 domains.",
          "Formulate corrective action plans for all identified non-conformities.",
          "Track remediation progress to closure with quarterly executive reporting."
        ],
        regulatoryRef: "MAS TRM Sec. 3–4",
        priority: "GOVERNANCE",
        assignedRole: "Chief Risk Officer",
        department: "Enterprise Risk Management",
        status: "COMPLIANT",
        evidenceRequired: "Comprehensive MAS TRM 10-Domain Compliance Audit Report and CAPA tracker",
        linkedISOControl: "A.5.3",
        verificationMethod: "DOCUMENT_INSPECTION"
      }
    ]
  }
];
`;

const outputPath = path.resolve('src/data/masChecklist2026MasterData.ts');
fs.writeFileSync(outputPath, fileContent, 'utf8');
console.log('Successfully wrote masChecklist2026MasterData.ts to', outputPath);
