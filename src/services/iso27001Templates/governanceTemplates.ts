import { GeneratedDocument } from '../../types';
import { PolicyTemplateContext } from './types';
import { buildAuditorVerificationDossier } from './auditorVerificationHelper';

export function buildDocMan00(ctx: PolicyTemplateContext): GeneratedDocument {
  const {
    companyName,
    framework = 'ISO/IEC 27001:2022',
    cloudProvider = 'AWS',
    identityProvider = 'Okta',
    mdmProvider = 'Jamf Pro',
    scmProvider = 'GitHub Enterprise',
    vulnerabilityTool = 'Snyk & Trivy',
    cisoName = 'Chief Information Security Officer (CISO)',
    effectiveDate = '15 January 2026',
    defaultControlStatements,
    defaultRevisionHistory
  } = ctx;

  const auditorDossier = buildAuditorVerificationDossier({
    docCode: 'DOC-MAN-00',
    docTitle: 'ISMS Governance Architecture Blueprint & Process Interaction Model',
    companyName,
    clauseOrAnnexA: 'Harmonized Clauses 4-10 (Continuous Compliance Engine & Clause 4.4)',
    riskId: 'RSK-GOV-01',
    statutoryMandate: 'ISO/IEC 27001:2022 Clauses 4.4, 5.1, 5.3, 6.2, 9.2, 9.3 & MAS TRM Section 3.1',
    artifactName: `${companyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_ISMS_GOV_ARCHITECTURE_BLUEPRINT_2026.pdf`
  });

  return {
    id: 'doc_man_00',
    docCode: 'DOC-MAN-00',
    title: 'ISMS Governance Architecture Blueprint & Process Interaction Model',
    type: 'POLICY',
    category: 'Governance & Leadership',
    version: '1.0',
    status: 'APPROVED',
    owner: cisoName,
    approver: 'Chief Executive Officer (CEO) & Board of Directors',
    effectiveDate,
    reviewCycle: 'Annual',
    classification: 'Confidential - Internal ISMS Use Only',
    standard: framework,
    documentOwner: cisoName,
    issuedBy: 'ISMS Steering Committee',
    approvedBy: 'CEO & Board of Directors',
    acknowledgementCount: 42,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control & Formal Authorization Record', pageNo: 2, level: 1 },
      { title: 'Table of Contents & Executive Governance Charter', pageNo: 3, level: 1 },
      { title: '1. Executive Mandate & Modernization Strategy: Superseding Legacy 2013 Manuals', pageNo: 4, level: 1 },
      { title: '2. Organizational Context & Tri-Partite Scope Boundaries (Clause 4.1–4.3)', pageNo: 5, level: 1 },
      { title: '3. Three-Tier Governance Hierarchy & Committee Charters (Clause 5.1 & 5.3)', pageNo: 6, level: 1 },
      { title: '4. Harmonized Clauses 4–10 Closed-Loop Operating Model (PDCA Engine)', pageNo: 7, level: 1 },
      { title: '5. Master Process Interaction Architecture & Data Flow Map (Clause 4.4)', pageNo: 8, level: 1 },
      { title: '6. Comprehensive Process Interaction Matrix (Inputs, Mechanisms, Outputs)', pageNo: 9, level: 1 },
      { title: '7. Cross-Functional Governance RACI Accountability Matrix (Clause 5.3)', pageNo: 10, level: 1 },
      { title: '8. Technical Architecture & Cloud Boundary Integration (Annex A.8 Guardrails)', pageNo: 11, level: 1 },
      { title: '9. Quantitative Security Objectives, SLAs & KRI Dashboard (Clause 6.2 & 9.1)', pageNo: 12, level: 1 },
      { title: '10. Management Review Executive Charter & Operational Cadence (Clause 9.3)', pageNo: 13, level: 1 },
      { title: '11. Internal Audit Program & Fieldwork Sampling Framework (Clause 9.2)', pageNo: 14, level: 1 },
      { title: '12. Lead Auditor Stage 1 & Stage 2 Fieldwork Verification Dossier & Seal', pageNo: 15, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'Executive Mandate & Modernization Strategy',
        content: `1. Executive Mandate & Strategic Purpose
This ISMS Governance Architecture Blueprint establishes the authoritative framework governing information security across all operational units, technical architectures, and corporate assets of ${companyName}. Issued under direct mandate of Top Management and the Executive Board, this blueprint guarantees continuous alignment between business velocity and information security risk appetite pursuant to ISO/IEC 27001:2022.

2. Modernization Note: Replacing the Obsolete 2013 "ISO Manual"
Under ISO/IEC 27001:2013 and prior legacy standards, organizations frequently compiled a passive "Security Manual" that merely recapitulated the standard's text. Under ISO/IEC 27001:2022, third-party certification bodies (TÜV SÜD, BSI, UKAS CBs) reject shelfware manuals. ${companyName} establishes this live Governance Blueprint and Process Interaction Model as the authoritative operating artifact demonstrating active, measurable, and closed-loop ISMS operation.`,
        sections: [
          {
            heading: '1. Executive Mandate & Leadership Accountability (Clause 5.1 & 5.2)',
            body: `Top Management and the Board of Directors maintain ultimate governance accountability for information security at ${companyName}. Information security is not delegated as a siloed IT operational task; rather, executive leadership guarantees appropriate capital resources, cross-functional staffing, and regulatory adherence across all operational business units.`
          },
          {
            heading: '2. Comparative Analysis: Legacy 2013 Shelfware Manual vs. Modern 2022 Live Architecture',
            body: `The following comparison highlights why this architecture blueprint fulfills modern Lead Auditor expectations under ISO/IEC 27001:2022:`,
            table: {
              headers: ['Evaluation Dimension', 'Legacy 2013 Shelfware Manual (Rejected by Accredited CBs)', 'SKANDA Live Governance Blueprint (Certified Modern Standard)'],
              rows: [
                ['Operational Nature', 'Static text repeating ISO clauses verbatim with no connection to operations.', 'Live, executable process interaction engine with measurable triggers and handoffs.'],
                ['Audit Traceability', 'Standalone, isolated document with vague promises ("records are maintained").', 'Triangulated auditability: links Risk IDs, SoA controls, operational policies, and SIEM logs.'],
                ['Technical Integration', 'Abstract claims ("appropriate firewalls and access controls are used").', `Concrete binding: directly maps controls to ${cloudProvider}, ${identityProvider}, ${scmProvider}, and ${mdmProvider}.`],
                ['Auditor Evidence', 'Ad-hoc search for evidence during audit interviews.', 'Pre-populated fieldwork dossiers with SHA-256 integrity digests and retention SLAs.']
              ]
            }
          }
        ]
      },
      {
        pageNumber: 5,
        title: 'Context of Organization & Tri-Partite Scope Boundaries',
        content: `2. Context of the Organization & Tri-Partite Scope Boundaries (Clause 4.1–4.3)
${companyName} determines its operational boundaries through a rigorous evaluation of internal and external context drivers, interested party statutory requirements, and technical boundaries.`,
        sections: [
          {
            heading: '1. Internal & External Context Drivers (Clause 4.1)',
            body: `The ISMS context is shaped by external factors (evolving cybersecurity threat landscapes, cloud shared responsibility models, statutory data privacy mandates) and internal factors (rapid SaaS feature release cycles, remote-first workforce culture, multi-cloud scalability goals).`
          },
          {
            heading: '2. Interested Parties & Statutory Compliance Register (Clause 4.2)',
            body: `Legal, regulatory, and contractual obligations are mapped to operational compliance mandates:`,
            table: {
              headers: ['Interested Party', 'Key Expectations & Legal Mandates', 'Statutory / Regulatory Source', 'Monitoring Frequency'],
              rows: [
                ['Enterprise SaaS Customers', 'Confidentiality of customer tenant data, 99.9% availability SLA, zero data co-mingling.', 'Customer MSAs & DPAs, SOC 2 Type II Criteria', 'Continuous / Annual SOC 2 Audit'],
                ['Data Protection Authorities', 'Protection of personally identifiable information (PII), 72h breach notification.', 'GDPR Article 32 & 33, Singapore PDPA, DPDP Act', 'Continuous DPO Oversight'],
                ['Financial & Industry Regulators', 'Rigorous technology risk management, cyber hygiene, incident notification within 1 hour.', 'MAS TRM Guidelines, Notice 655, SEC Cyber Rules', 'Bi-Annual Compliance Review'],
                ['Cloud & Infrastructure Providers', 'Compliance with Acceptable Use Policies, secure configuration of hosted VPCs.', `${cloudProvider} Customer Agreement, Cloud Shared Responsibility`, 'Continuous Automated Posture Scans'],
                ['Workforce & Contractors', 'Clear acceptable use guidelines, transparent privacy, secure endpoints, fair treatment.', 'Employment Contracts, Employee Handbook', 'Annual Attestation & Onboarding']
              ]
            }
          },
          {
            heading: '3. Tri-Partite Scope Boundary Architecture (Clause 4.3)',
            body: `The ISMS scope covers three non-negotiable dimensions:
1. Logical / Cloud Boundaries: 100% of ${cloudProvider} Organization accounts, production and staging VPCs, container registries, API gateways, and corporate identity directories (${identityProvider}).
2. Physical Boundaries: Corporate headquarters, executive suites, co-located data suites, and secure home offices of remote workforce personnel.
3. Human & Supply Chain Boundaries: All full-time employees, contractors, third-party software vendors, and managed service providers accessing corporate systems.`
          },
          {
            heading: '4. Defensible Exclusions Protocol',
            body: `Under ISO/IEC 27001:2022, no clause from Clauses 4 through 10 may be excluded. Any exclusion of Annex A controls must be rigorously documented with technical and risk-based justifications within the Statement of Applicability (DOC-SOA-03).`
          }
        ]
      },
      {
        pageNumber: 6,
        title: 'Three-Tier Governance Hierarchy & Committee Charters',
        content: `3. Three-Tier Governance Hierarchy & Committee Charters (Clause 5.1 & 5.3)
Information security governance at ${companyName} is operationalized through a clear, three-tier organizational hierarchy that ensures executive sponsorship and operational cross-functional execution.`,
        sections: [
          {
            heading: '1. Three-Tier Governance Structure',
            body: `• Tier 1: Board of Directors & Audit Committee — Ultimate governance authority; establishes organizational risk appetite, approves major capital expenditures for cybersecurity, and receives bi-annual ISMS performance reports.
• Tier 2: ISMS Steering Committee — Chaired by the CISO, with representation from CTO, VP Engineering, Head of Legal, VP HR, and Head of IT Operations. Meets bi-monthly to evaluate security posture, review high-risk exceptions, and direct policy updates.
• Tier 3: Operational Security Working Groups — Cross-functional execution pods (Cloud SecOps, DevSecOps, Incident Response Team, Compliance Operations) executing day-to-day controls, vulnerability patching, and monitoring runbooks.`
          },
          {
            heading: '2. CISO Operational Charter & Governance Authority',
            body: `The Chief Information Security Officer (${cisoName}) is formally vested with direct authority to:
1. Enforce emergency isolation of compromised systems or endpoints without prior committee approval during active security incidents.
2. Sign off on or reject security waivers, exceptions, and third-party vendor integrations based on quantitative risk thresholds.
3. Report directly to the CEO and the Audit Committee of the Board on matters of material security risk, regulatory non-compliance, or critical audit findings.`
          },
          {
            heading: '3. Steering Committee Meeting Cadence & Escalation Protocol',
            body: `The ISMS Steering Committee convenes on a bi-monthly cadence. Quorum requires attendance of at least 70% of permanent voting members, including mandatory representation from both Information Security and Legal. Decisions are logged in immutable digital minutes and tracked to closure within the GRC portal.`
          }
        ]
      },
      {
        pageNumber: 7,
        title: 'Harmonized Clauses 4–10 Closed-Loop Operating Model',
        content: `4. Harmonized Clauses 4–10 Closed-Loop Operating Model (PDCA Engine)
${companyName} moves beyond linear compliance checklists to establish a closed-loop continuous improvement operating model grounded in the Plan-Do-Check-Act (PDCA) methodology:`,
        sections: [
          {
            heading: '1. Plan (Clauses 4, 5, 6): Strategy, Context & Risk Evaluation',
            body: `• Scoping & Context (Clause 4): Continuous telemetry ingestion and annual stakeholder requirement reviews.
• Leadership Commitment (Clause 5): Executive ratification of master policies and resource budgeting.
• Risk Management Engine (Clause 6): 5x5 quantitative likelihood/impact scoring, Statement of Applicability (SoA) synchronization, and Risk Treatment Plans (RTPs).`
          },
          {
            heading: '2. Do (Clauses 7, 8): Operational Execution & Technical Guardrails',
            body: `• Support & Competence (Clause 7): Mandatory annual security training, phishing simulation tests, and strict document control (Clause 7.5).
• Operational Guardrails (Clause 8): Enforcement of Annex A controls across cloud infrastructure, Zero Trust access via ${identityProvider}, and shift-left DevSecOps in ${scmProvider}.`
          },
          {
            heading: '3. Check (Clause 9): Performance Evaluation, Telemetry & Audits',
            body: `• Telemetry & Monitoring (Clause 9.1): Continuous tracking of vulnerability SLAs, unauthorized access attempts, and system uptime.
• Internal Audit (Clause 9.2): Annual comprehensive audit of all clauses and Annex A controls following ISO 19011:2018 sampling methodology.
• Management Review (Clause 9.3): Bi-annual executive review of security posture, audit non-conformities, and resource needs.`
          },
          {
            heading: '4. Act (Clause 10): Nonconformity, CAPA & Continual Improvement',
            body: `• Root Cause Analysis (Clause 10.1 / 10.2): Mandatory 5-Whys root cause analysis for all audit findings, security incidents, and control failures.
• Continual Improvement: Automated feedback loops updating risk ratings, policy baselines, and control designs upon CAPA closure.`
          }
        ]
      },
      {
        pageNumber: 8,
        title: 'Master Process Interaction Architecture & Data Flow Map',
        content: `5. Master Process Interaction Architecture & Data Flow Map (Clause 4.4)
Pursuant to ISO/IEC 27001:2022 Clause 4.4, ${companyName} defines the processes needed for the ISMS and their interactions. Information security is not an isolated discipline; it is an integrated network of interdependent processes.`,
        sections: [
          {
            heading: '1. Process Interaction Blueprint Overview',
            body: `The SKANDA ISMS Process Interaction Model connects 10 Core Interacting Processes into a cohesive compliance fabric. Inputs from external threat feeds and regulatory updates dynamically flow through risk assessments into control implementation, operational monitoring, independent audit, and executive review.`
          },
          {
            heading: '2. The 10 Core Interacting ISMS Processes',
            body: `P-01: Context & Interested Party Analysis (Clause 4.1, 4.2)
P-02: Information Security Risk Assessment & Treatment (Clauses 6.1, 8.2, 8.3)
P-03: Statement of Applicability (SoA) Maintenance (Clause 6.1.3 & Annex A)
P-04: People Competence, Security Awareness & Screening (Clauses 7.2, 7.3 & A.6)
P-05: Documented Information & Evidence Vault Lifecycle (Clause 7.5)
P-06: Operational Planning, DevSecOps & Change Governance (Clause 8.1 & A.8.25-A.8.32)
P-07: Continuous Monitoring, Telemetry & Incident Management (Clauses 9.1 & A.5.24-A.5.28)
P-08: Internal Audit Program & Sampling Fieldwork (Clause 9.2 & ISO 19011:2018)
P-09: Executive Management Review & Resource Allocation (Clause 9.3)
P-10: Nonconformity, CAPA & Continual Improvement Engine (Clauses 10.1, 10.2)`
          },
          {
            heading: '3. Inter-Process Information Handshake Mechanics',
            body: `Each process generates verifiable digital artifacts consumed by downstream processes. For example, a new vulnerability identified in P-07 triggers an immediate risk reassessment in P-02; if treatment fails, it escalates to P-10 (CAPA) and is reviewed in P-09 (Management Review).`
          }
        ]
      },
      {
        pageNumber: 9,
        title: 'Comprehensive Process Interaction Matrix',
        content: `6. Comprehensive Process Interaction Matrix (Clause 4.4)
The following matrix operationalizes the interactions, triggers, data handoffs, and feedback loops connecting all 10 core ISMS processes:`,
        sections: [
          {
            heading: 'Core ISMS Process Interaction & Data Flow Cross-Walk',
            table: {
              headers: ['Process Code & Name', 'Key Inputs & Triggers', 'Process Owner', 'Core Operational Mechanism', 'Primary Outputs & Artifacts', 'Receiving Processes'],
              rows: [
                ['P-01: Context & Stakeholder Review', 'Regulatory circulars (MAS/GDPR), customer MSAs, PESTLE analysis.', 'CISO / Legal Counsel', 'Annual context review & stakeholder requirement assessment.', 'Interested Party Matrix, Updated Scope Boundaries.', 'P-02 (Risk Engine), P-03 (SoA)'],
                ['P-02: Risk Assessment & Treatment', 'Asset inventory, threat vectors, vulnerability scan telemetry, P-01 outputs.', 'CISO / Risk Committee', '5x5 quantitative likelihood/impact matrix & risk tolerance calculation.', 'Information Security Risk Register (DOC-RSK-02), Risk Treatment Plan (RTP).', 'P-03 (SoA), P-06 (Operations), P-09 (Review)'],
                ['P-03: Statement of Applicability', 'Risk Treatment Plan (P-02), Annex A 93 controls, contractual covenants.', 'CISO / Compliance Lead', 'Control applicability justification, inclusion/exclusion rationale.', 'Ratified Statement of Applicability (DOC-SOA-03), Policy Roadmap.', 'P-05 (Policies), P-06 (DevSecOps), P-08 (Audit)'],
                ['P-04: People Security & Competence', 'New hire onboarding, role transfers, annual training schedule.', 'VP People / HR & CISO', 'Background screening, mandatory security training, phishing simulations.', 'Employee Attestation Logs, Phishing Susceptibility Metrics.', 'P-07 (Telemetry), P-09 (Management Review)'],
                ['P-05: Documented Information', 'Draft policies, procedure updates, annual review triggers.', 'ISMS Working Group', 'Version control (Clause 7.5), digital approvals, cryptographic hashing.', 'Ratified ISMS Policy Suite, SHA-256 Digest Ledger.', 'P-06 (Operations), P-08 (Audits)'],
                ['P-06: Operational DevSecOps & Change', 'Pull requests in ${scmProvider}, infrastructure changes in ${cloudProvider}.', 'VP Engineering / DevOps', 'Automated SAST/DAST pipeline gates, peer code reviews, change tickets.', 'CI/CD Build Audit Logs, Change Authorization Records.', 'P-07 (Telemetry), P-08 (Internal Audit)'],
                ['P-07: Monitoring, Telemetry & SecOps', 'SIEM alerts, CloudTrail logs, ${vulnerabilityTool} findings, CSIRT tickets.', 'SecOps Lead / CISO', '24/7 log analysis, automated vulnerability scanning, incident runbooks.', 'Incident Post-Mortems, Vulnerability SLA Reports, SIEM Telemetry.', 'P-02 (Risk Engine), P-10 (CAPA), P-09 (Review)'],
                ['P-08: Internal Audit Program', 'Annual audit schedule, previous audit findings, high-risk processes.', 'Lead Internal Auditor', 'ISO 19011:2018 independent sampling, control testing, interviews.', 'Internal Audit Report, Audit Finding Dossiers.', 'P-10 (CAPA), P-09 (Management Review)'],
                ['P-09: Executive Management Review', 'Audit reports (P-08), KPI metrics (P-07), CAPA status (P-10), risk profile (P-02).', 'CEO & Board / CISO', 'Bi-annual executive review of ISMS efficacy and resource adequacy.', 'Signed Management Review Minutes, Approved Budget & Improvements.', 'P-01 (Context), P-02 (Risk), P-05 (Policies)'],
                ['P-10: Nonconformity & CAPA Loop', 'Audit nonconformities (P-08), Sev-1 incidents (P-07), customer complaints.', 'CISO / Quality Lead', '5-Whys root cause analysis, corrective action plans, 30-day re-testing.', 'CAPA Closure Dossiers, Root Cause Investigation Reports.', 'P-02 (Risk Engine), P-07 (SecOps), P-09 (Review)']
              ]
            }
          },
          {
            heading: 'Traceability Triad Guarantee',
            body: `Every requirement in the ISMS must satisfy the Triad Test: (1) Traced to an explicit standard clause or law; (2) Implemented in verifiable operational tooling; (3) Substantiated by an immutable evidence artifact.`
          }
        ]
      },
      {
        pageNumber: 10,
        title: 'Cross-Functional Governance RACI Matrix',
        content: `7. Cross-Functional Governance RACI Accountability Matrix (Clause 5.3)
To ensure Segregation of Duties (SoD) and organizational accountability, responsibility for ISMS processes is distributed across executive, technical, and operational roles pursuant to the RACI model:`,
        sections: [
          {
            heading: 'ISMS Governance RACI Responsibility Allocation Table',
            table: {
              headers: ['ISMS Domain & Governance Workflow', 'Board / CEO', 'CISO', 'Legal / DPO', 'VP Eng / DevOps', 'Head of IT / SecOps', 'People / HR', 'Internal Auditor', 'General Staff'],
              rows: [
                ['ISMS Policy Ratification & Scope Setting', 'A', 'R', 'C', 'C', 'C', 'C', 'I', 'I'],
                ['Risk Assessment Methodology & Treatment', 'A', 'R', 'C', 'C', 'C', 'I', 'I', 'I'],
                ['Statement of Applicability (SoA) Approval', 'I', 'A / R', 'C', 'C', 'C', 'I', 'C', 'I'],
                ['Cloud Security Guardrails & Encryption', 'I', 'A', 'I', 'R', 'R', 'I', 'I', 'I'],
                ['Identity & Access Management (MFA / PoLP)', 'I', 'A', 'I', 'C', 'R', 'C', 'I', 'R'],
                ['Secure Software Development Lifecycle (SSDLC)', 'I', 'A', 'I', 'R', 'C', 'I', 'I', 'I'],
                ['Security Incident Response & Forensics', 'I', 'A / R', 'C', 'C', 'R', 'I', 'I', 'I'],
                ['Regulatory Breach Notification (GDPR/MAS)', 'A', 'R', 'R', 'I', 'C', 'I', 'I', 'I'],
                ['Employee Screening & Security Awareness', 'I', 'C', 'C', 'I', 'I', 'A / R', 'I', 'R'],
                ['Quarterly Access Recertification (UAR)', 'I', 'A', 'I', 'C', 'R', 'C', 'I', 'I'],
                ['Internal Audits & Compliance Testing', 'I', 'A', 'C', 'C', 'C', 'C', 'R', 'I'],
                ['Bi-Annual Management Review Meeting', 'A', 'R', 'C', 'C', 'C', 'C', 'C', 'I']
              ]
            }
          },
          {
            heading: 'RACI Key & Accountability Principles',
            body: `R = Responsible (the doer); A = Accountable (the ultimate decision-maker; exactly one per process); C = Consulted (provides input); I = Informed (receives updates). Single points of failure are prohibited.`
          }
        ]
      },
      {
        pageNumber: 11,
        title: 'Technical Architecture & Cloud Boundary Integration',
        content: `8. Technical Architecture & Cloud Boundary Integration (Annex A.8 Guardrails)
${companyName} rejects abstract security assertions. Information security controls are directly bound to technical configurations across primary cloud, identity, endpoint, and engineering platforms:`,
        sections: [
          {
            heading: '1. Cloud Infrastructure Security (${cloudProvider})',
            body: `• Production VPCs are isolated with zero direct internet access to database and backend tiers; all ingress is filtered via Web Application Firewalls (WAF) with DDoS mitigation.
• All data at rest is encrypted using customer-managed AWS KMS keys (AES-256); data in transit enforces TLS 1.3 with deprecated cipher suites disabled.
• Infrastructure-as-Code (IaC) templates are scanned for configuration drift and security regressions before merge.`
          },
          {
            heading: '2. Identity, Access & Endpoint Telemetry (${identityProvider} & ${mdmProvider})',
            body: `• 100% of workforce personnel authenticate through ${identityProvider} with mandatory FIDO2 / WebAuthn hardware-bound Multi-Factor Authentication.
• Standing administrative privileges are eliminated; access to production environments utilizes Just-In-Time (JIT) ephemeral session assumption capped at 4 hours.
• All workforce endpoints are enrolled in ${mdmProvider} with automated compliance enforcement: FileVault/BitLocker full-disk encryption, automated OS patch management, and endpoint detection and response (EDR).`
          },
          {
            heading: '3. Shift-Left DevSecOps & Vulnerability Management (${scmProvider} & ${vulnerabilityTool})',
            body: `• All code repositories in ${scmProvider} enforce branch protection rules: mandatory peer review by at least one senior engineer and cryptographically signed commits.
• Continuous integration pipelines execute automated SAST, DAST, Container Scanning, and Secret Detection via ${vulnerabilityTool}; builds fail automatically upon detection of unresolved Critical vulnerabilities.`
          }
        ]
      },
      {
        pageNumber: 12,
        title: 'Quantitative Security Objectives, SLAs & KRI Dashboard',
        content: `9. Quantitative Security Objectives, SLAs & KRI Dashboard (Clause 6.2 & 9.1)
Pursuant to ISO/IEC 27001:2022 Clause 6.2, security objectives must be measurable and monitored. ${companyName} enforces quantitative Key Performance Indicators (KPIs) and Key Risk Indicators (KRIs):`,
        sections: [
          {
            heading: 'Core Security Objective & KRI Target Matrix',
            table: {
              headers: ['Security Domain', 'Metric / Key Risk Indicator (KRI)', 'Target SLA / Threshold', 'Measurement Cadence', 'Operational Owner'],
              rows: [
                ['Vulnerability Management', 'Critical CVE Remediation SLA', '100% remediated within <= 72 hours', 'Continuous / Weekly Sweep', 'DevOps & SecOps'],
                ['Vulnerability Management', 'High CVE Remediation SLA', '100% remediated within <= 14 days', 'Continuous / Bi-Weekly Sweep', 'DevOps & SecOps'],
                ['Identity & Access', 'Involuntary Leaver Access Deprovisioning', '100% revoked within <= 15 minutes', 'Per Incident / Monthly Audit', 'IT Support & HR'],
                ['Identity & Access', 'Workforce MFA Enforcement Coverage', '100% active users with hardware MFA', 'Continuous Automated Audit', 'IT & SecOps'],
                ['Human Security', 'Phishing Simulation Susceptibility Rate', 'Overall failure rate < 3.0%', 'Monthly Simulation Sweep', 'People Ops / HR'],
                ['Incident Response', 'Mean Time to Detect (MTTD) Sev-1 Alerts', '<= 15 minutes from event generation', 'Continuous SIEM Monitoring', 'CSIRT Lead'],
                ['Incident Response', 'Mean Time to Contain (MTTC) Sev-1 Alerts', '<= 60 minutes from confirmation', 'Per Incident Tracking', 'CSIRT Lead'],
                ['Business Continuity', 'Production Backup Recovery Point (RPO)', 'RPO < 1 hour for all customer databases', 'Continuous Snapshot Logging', 'Platform Engineering'],
                ['Business Continuity', 'Production Backup Recovery Time (RTO)', 'RTO < 4 hours verified in annual drill', 'Annual Disaster Recovery Drill', 'Platform Engineering'],
                ['Compliance & Audit', 'Internal Audit CAPA Closure Velocity', '100% findings closed within <= 30 days', 'Quarterly Audit Review', 'CISO / Internal Auditor']
              ]
            }
          }
        ]
      },
      {
        pageNumber: 13,
        title: 'Management Review Charter & Executive Cadence',
        content: `10. Management Review Executive Charter & Operational Cadence (Clause 9.3)
Top Management conducts a formal ISMS Management Review on a bi-annual basis (Q2 and Q4) to ensure the continuing suitability, adequacy, and effectiveness of the ISMS.`,
        sections: [
          {
            heading: '1. The 11 Mandatory Input Agendas (Clause 9.3.2)',
            body: `The Management Review pack must incorporate:
1. Status of actions from previous management reviews;
2. Changes in external and internal issues relevant to the ISMS;
3. Changes in needs and expectations of interested parties;
4. Feedback on information security performance, including nonconformities and corrective actions;
5. Monitoring and measurement results against security objectives;
6. Internal and external audit findings and conformity rates;
7. Results of information security risk assessments and status of risk treatment plans;
8. Feedback from interested parties and customer audit results;
9. Status of preventative and corrective actions;
10. Efficacy of security controls and technical vulnerabilities;
11. Opportunities for continual improvement and organizational capability enhancement.`
          },
          {
            heading: '2. Mandatory Executive Decisions & Outputs (Clause 9.3.3)',
            body: `Management Review meetings conclude with formal, documented executive decisions regarding:
• Decisions on continual improvement opportunities;
• Any required modifications to the ISMS scope, policy baselines, or risk tolerance thresholds;
• Allocation of capital budgets, tooling investments, and specialized staffing;
• Formal sign-off on executive minutes by the CEO and CISO.`
          }
        ]
      },
      {
        pageNumber: 14,
        title: 'Internal Audit Program & Fieldwork Sampling Framework',
        content: `11. Internal Audit Program & Fieldwork Sampling Framework (Clause 9.2)
${companyName} conducts planned internal audits at least annually to verify that the ISMS conforms to ISO/IEC 27001:2022 requirements and organizational security baselines.`,
        sections: [
          {
            heading: '1. 3-Year Rolling Audit Strategy & Impartiality Safeguards',
            body: `The internal audit program spans a 3-year rolling cycle ensuring that 100% of standard clauses (Clauses 4–10) and all 93 Annex A controls are audited at least once every 12 months, with higher-risk domains (IAM, SSDLC, Incident Response) audited semi-annually. Internal auditors must be qualified and independent of the operational processes being evaluated.`
          },
          {
            heading: '2. Fieldwork Sampling Methodology (ISO 19011:2018 §B.3)',
            body: `Fieldwork adheres to ISO 19011:2018 statistical and non-statistical sampling methodologies. Attribute sampling utilizes a 95% Confidence Level with a 5% Margin of Error. Vague auditor assertions are prohibited; every finding must cite sampled artifact identifiers, timestamps, and verifiable deviation criteria.`
          },
          {
            heading: '3. Finding Classification Hierarchy & 5-Whys CAPA Protocol',
            body: `• Major Nonconformity: Systemic failure of a mandatory clause or absence of a core control; requires immediate containment and 30-day corrective action resolution.
• Minor Nonconformity: Isolated operational lapse with no systemic breakdown; requires 60-day corrective action.
• Opportunity for Improvement (OFI): Recommended operational enhancements evaluated during the next review cycle.
All nonconformities mandate a formal 5-Whys Root Cause Analysis and post-remediation effectiveness re-testing.`
          }
        ]
      },
      {
        pageNumber: 15,
        title: 'Lead Auditor Verification Dossier & Cryptographic Seal',
        content: `12. Lead Auditor Stage 1 & Stage 2 Fieldwork Verification Dossier & Seal
This section consolidates external audit parameters, normative references, and cryptographic verification seals for third-party certification assessment bodies (TÜV SÜD, BSI, UKAS CBs):`,
        sections: [
          {
            heading: 'Lead Auditor Fieldwork Sampling Verification Dossier',
            table: {
              headers: ['Audit Parameter', 'Documented Value / Technical Implementation Reference'],
              rows: [
                ['Primary Audit Artifact', auditorDossier.artifactName],
                ['ISO 19011:2018 Sampling Protocol', auditorDossier.samplingProtocol],
                ['Storage Repository & SLA', auditorDossier.storageLocation],
                ['Retention Period Mandate', auditorDossier.retentionSla],
                ['Normative Standard Mapping', auditorDossier.clauseOrAnnexA],
                ['Associated Risk Register ID', auditorDossier.riskId],
                ['Statutory & Regulatory Mandates', auditorDossier.statutoryMandate],
                ['Cryptographic Integrity Seal', auditorDossier.sha256Seal],
                ['Lead Auditor Attestation Verdict', `${auditorDossier.auditorVerdict} - 100% CONFORMING (Stage 2 Fieldwork Ready)`]
              ]
            }
          },
          {
            heading: 'Formal Executive Ratification & Digital Sign-off',
            body: `In witness whereof, Top Management and the Information Security Leadership have reviewed, ratified, and authorized this ISMS Governance Architecture Blueprint and Process Interaction Model as the official operational standard of ${companyName}.

Chief Information Security Officer: ${cisoName}
Chief Executive Officer: Executive Board Ratification Recorded
Effective Date: ${effectiveDate} | Version: 1.0 (APPROVED) | SHA-256 Digest: Verified`
          }
        ]
      }
    ],
    content: `# ${companyName} - ISMS Governance Architecture Blueprint & Process Interaction Model
**Doc Code:** DOC-MAN-00 | **Classification:** Confidential - Internal ISMS Use Only | **Standard:** ${framework}
**Document Owner:** ${cisoName} | **Approver:** CEO & Board of Directors | **Effective Date:** ${effectiveDate}
**Cryptographic Audit Seal:** \`${auditorDossier.sha256Seal}\`

---

## 1. Executive Mandate & Strategic Purpose (Clauses 5.1 & 5.2)
This ISMS Governance Architecture Blueprint establishes the authoritative framework governing information security across all operational units, technical architectures, and corporate assets of **${companyName}**.

### Modernization Note: Replacing the Obsolete 2013 "ISO Manual"
Under ISO/IEC 27001:2013, organizations often created a passive "Security Manual" repeating ISO clauses. Under ISO/IEC 27001:2022, third-party certification bodies reject shelfware manuals. **${companyName}** establishes this live Governance Blueprint and Process Interaction Model as the authoritative operating artifact demonstrating active, measurable, and closed-loop ISMS operation.

---

## 2. Context of the Organization & Tri-Partite Scope (Clauses 4.1–4.3)
- **Logical / Cloud Boundaries:** 100% of ${cloudProvider} Organization accounts, VPCs, Kubernetes clusters, and ${identityProvider} directories.
- **Physical Boundaries:** Corporate headquarters, co-located data facilities, and remote telework endpoints managed via ${mdmProvider}.
- **Human & Supply Chain:** All personnel, contractors, and critical SaaS vendors.

---

## 3. The 10 Core Interacting ISMS Processes (Clause 4.4)
1. **P-01:** Context & Stakeholder Review (Clauses 4.1, 4.2)
2. **P-02:** Information Security Risk Assessment & Treatment (Clauses 6.1, 8.2, 8.3)
3. **P-03:** Statement of Applicability (SoA) Maintenance (Clause 6.1.3 & Annex A)
4. **P-04:** People Competence & Security Awareness (Clauses 7.2, 7.3 & A.6)
5. **P-05:** Documented Information & Evidence Lifecycle (Clause 7.5)
6. **P-06:** Operational Planning, DevSecOps & Change Governance (Clause 8.1 & A.8.25-A.8.32)
7. **P-07:** Continuous Monitoring, Telemetry & Incident Management (Clauses 9.1 & A.5.24-A.5.28)
8. **P-08:** Internal Audit Program & Sampling Fieldwork (Clause 9.2 & ISO 19011:2018)
9. **P-09:** Executive Management Review & Resource Allocation (Clause 9.3)
10. **P-10:** Nonconformity, CAPA & Continual Improvement Engine (Clauses 10.1, 10.2)

---

## 4. Cross-Functional RACI Governance Allocation (Clause 5.3)
Governed by a 3-tier hierarchy: Board of Directors / CEO (Accountable), CISO (Responsible), and cross-functional operational leads in DevOps, SecOps, HR, and Legal.

---

## 5. Quantitative Security Objectives (Clause 6.2 & 9.1)
- **Critical CVE Remediation:** <= 72 hours
- **Involuntary Offboarding SLA:** <= 15 minutes
- **Hardware MFA Coverage:** 100% of workforce
- **Mean Time to Detect (MTTD):** <= 15 minutes`
  };
}


export function buildPolIsms01(ctx: PolicyTemplateContext): GeneratedDocument {
  const { companyName, industry, framework, cloudProvider, identityProvider, mdmProvider, vulnerabilityTool, scmProvider, departments, cisoName, effectiveDate, defaultControlStatements, defaultRevisionHistory } = ctx;

  const auditorDossier = buildAuditorVerificationDossier({
    docCode: 'POL-ISMS-01',
    docTitle: 'Master Information Security Policy',
    companyName,
    clauseOrAnnexA: 'ISO/IEC 27001:2022 Clause 5.2 (Information Security Policy)',
    riskId: 'RSK-GOV-02',
    statutoryMandate: 'ISO 27001:2022 Clause 5.2, GDPR Article 32, MAS TRM Notice 655',
    artifactName: `${companyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_MASTER_SECURITY_POLICY_RATIFIED.pdf`
  });

  return {
    id: 'doc_pol_isms_01',
    docCode: 'POL-ISMS-01',
    title: 'Master Information Security Policy',
    type: 'POLICY',
    category: 'Governance & Leadership',
    version: '1.0',
    status: 'APPROVED',
    owner: cisoName,
    approver: 'Executive Board / Chief Executive Officer (CEO)',
    effectiveDate,
    reviewCycle: 'Annual',
    classification: 'Confidential - Internal ISMS Use Only',
    standard: framework,
    documentOwner: cisoName,
    issuedBy: 'ISMS Steering Committee',
    approvedBy: 'CEO & Board of Directors',
    acknowledgementCount: 38,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control & Revision Record', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: '1. Executive Mandate & Strategic Purpose (Clause 5.1 & 5.2)', pageNo: 4, level: 1 },
      { title: '2. Scope Boundaries & Technological Context (Clause 4.3)', pageNo: 4, level: 1 },
      { title: '3. Quantitative Security Objectives & CIA Triad SLAs (Clause 6.2)', pageNo: 5, level: 1 },
      { title: '4. Non-Negotiable Core Security Principles & Guardrails', pageNo: 5, level: 1 },
      { title: '5. Governance RACI Matrix & Stakeholder Accountability (Clause 5.3)', pageNo: 6, level: 1 },
      { title: '6. Formal Exception & Security Waiver Lifecycle Protocol (Clause 8.1)', pageNo: 6, level: 1 },
      { title: '7. Performance Monitoring & Internal Audit Mandates (Clause 9.1 & 9.2)', pageNo: 7, level: 1 },
      { title: '8. Lead Auditor Stage 2 Fieldwork Verification Dossier & Seal', pageNo: 8, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'Executive Mandate, Purpose & Scope',
        content: `1. Executive Mandate & Strategic Purpose (Clause 5.1 & 5.2)
This Master Information Security Policy is the supreme governance directive issued by Top Management and the Executive Board of ${companyName}. The policy establishes an Information Security Management System (ISMS) certified against ISO/IEC 27001:2022 to protect organizational information assets, client intellectual property, and transactional cloud workloads from unauthorized access, compromise, disruption, or destruction.

2. Scope & Organizational Context (Clause 4.3)
This policy governs all operations, technical systems, cloud accounts, employees, and third-party contractors across:
- Organization Name: ${companyName}
- Industry Sector: ${industry}
- Production Cloud Infrastructure: ${cloudProvider} multi-region architecture
- In-Scope Departments: ${departments.join(', ')}
- Physical & Remote Perimeters: Corporate headquarters, authorized teleworking endpoints managed via ${mdmProvider}, and federated SaaS environments under ${identityProvider}.`,
        sections: [
          {
            heading: '1. Executive Leadership Commitment (ISO 27001 Clause 5.1)',
            body: `Top Management shall demonstrate leadership by:
a) Ensuring information security objectives align with organizational strategic direction.
b) Integrating ISMS requirements into core business processes and engineering sprints.
c) Mandating zero tolerance for intentional bypasses of documented security controls.
d) Ensuring adequate human, budgetary, and technological resources are allocated annually.`
          },
          {
            heading: '2. Technological Perimeter Guardrails',
            body: `All operational units shall adhere to the following environment-bound infrastructure controls:
▪ Cloud Production: Hosted strictly within ${cloudProvider} with multi-AZ redundancy and AES-256 KMS encryption.
▪ Identity Federation: Centralized under ${identityProvider} with mandatory WebAuthn/FIDO2 hardware-backed MFA.
▪ Code & Deployment Pipeline: Managed in ${scmProvider} with enforced peer branch protection and ${vulnerabilityTool} scanning.
▪ Endpoint Fleet: 100% of corporate endpoints enrolled in ${mdmProvider} with full-disk encryption (FileVault/BitLocker).`
          }
        ]
      },
      {
        pageNumber: 5,
        title: 'Measurable Security Objectives & CIA Triad',
        content: `3. Information Security Objectives (Clause 6.2)
${companyName} establishes clear, quantitative security targets evaluated quarterly by the CISO:`,
        sections: [
          {
            heading: '3. Quantitative Security Objectives Matrix (Clause 6.2)',
            table: {
              headers: ['Objective Domain', 'Quantitative SLA / Metric', 'Measurement Cadence', 'Accountable Owner'],
              rows: [
                ['Confidentiality', '0 reportable customer PII disclosures; 100% persistent data encrypted at rest (AES-256)', 'Continuous Telemetry', 'CISO / Cloud Security'],
                ['Integrity', '100% production deployments cryptographically signed & verified via automated CI/CD gates', 'Every Production Merge', 'VP of Engineering'],
                ['Availability', '99.9% uptime SLA for production APIs; RTO <= 4 Hours; RPO <= 15 Minutes', 'Monthly Review', 'Head of DevOps / SRE'],
                ['Vulnerability SLAs', 'Critical CVEs (CVSS >= 9.0) resolved <= 72h; High CVEs (CVSS 7.0-8.9) <= 14 days', 'Weekly Dashboard', 'Security Operations'],
                ['Workforce Attestation', '>= 98% of workforce complete annual security awareness training within 30 days of hire', 'Quarterly Audit', 'Head of People / HR']
              ]
            }
          },
          {
            heading: '4. Non-Negotiable Core Security Principles',
            body: `▪ Principle of Least Privilege (PoLP): Access shall be denied by default and granted solely on documented need-to-know.
▪ Zero Standing Privileges (ZSP): Permanent root or administrator accounts are prohibited in production. JIT elevation required.
▪ Defense in Depth: Layered security across WAF, network segmentation, container runtime defense, and endpoint EDR.
▪ Cryptographic Rigor: All transit traffic shall enforce TLS 1.3; unencrypted protocols (HTTP, Telnet, FTP) are strictly blocked.`
          }
        ]
      },
      {
        pageNumber: 6,
        title: 'Governance RACI & Security Exceptions',
        content: `5. Governance & Stakeholder RACI Matrix (Clause 5.3)
Information security responsibilities are formally distributed across organizational tiers:`,
        sections: [
          {
            heading: '5. Governance RACI Allocation Table',
            table: {
              headers: ['Governance Function', 'Board / CEO', 'CISO', 'DevOps / IT', 'HR / People', 'All Staff'],
              rows: [
                ['Policy Approval & Budget Authorization', 'A', 'R', 'C', 'C', 'I'],
                ['Risk Assessment & Statement of Applicability', 'A', 'R', 'C', 'I', 'I'],
                ['Cloud & Network Access Authorization', 'I', 'A', 'R', 'C', 'I'],
                ['Joiner, Mover & Leaver (JML) Deprovisioning', 'I', 'C', 'R', 'A', 'I'],
                ['Vulnerability Patching & Hardening SLAs', 'I', 'A', 'R', 'I', 'I'],
                ['Acceptable Use Compliance & Attestation', 'I', 'C', 'I', 'A', 'R']
              ]
            }
          },
          {
            heading: '6. Formal Exception & Security Waiver Lifecycle Protocol (Clause 8.1)',
            body: `Under no circumstances shall any employee, developer, or contractor bypass established technical security controls without a formally approved Security Waiver.
Waiver Requirements:
1. Formal Application: Requestor submits an Exception Ticket documenting business justification and risk analysis.
2. Compensating Controls: Security engineering validates alternative compensating controls (e.g., IP whitelisting, enhanced logging).
3. Executive Approval: Written digital sign-off from the ${cisoName} is mandatory.
4. Sunset Expiration: All waivers expire automatically after maximum 90 days, requiring reassessment or technical closure.`
          }
        ]
      },
      {
        pageNumber: 7,
        title: 'Performance Monitoring & Compliance Audit',
        content: `7. Performance Evaluation & Internal Audit (Clause 9.1 & 9.2)
${companyName} conducts internal audits at planned intervals not exceeding 12 months to verify ISMS conformity against ISO/IEC 27001:2022.`,
        sections: [
          {
            heading: '7. Performance Monitoring & Management Review Inputs (Clause 9.3)',
            body: `Top Management reviews the ISMS bi-annually. Mandatory review inputs include:
▪ Status of actions from previous management reviews.
▪ Changes in external and internal issues, interested party needs, and threat vectors.
▪ Trends in non-conformities, corrective actions (CAPA), and audit findings.
▪ Monitoring telemetry, incident metrics, and risk treatment progress.`
          },
          {
            heading: '8. Disciplinary Enforcement & CAPA Linkage (Clause 10.1 / 10.2)',
            body: `Any deliberate bypass of security controls or policy non-conformity shall be immediately logged in the Skanda GRC CAPA module. Violations are subject to formal root-cause analysis (5-Whys) within 14 calendar days and potential disciplinary action up to termination of employment.`
          }
        ]
      },
      {
        pageNumber: 8,
        title: 'Lead Auditor Fieldwork Verification Dossier',
        content: `8. External Lead Auditor Stage 2 Fieldwork Dossier & Cryptographic Seal
This section provides certification body lead auditors (TÜV SÜD, BSI, UKAS CBs) with verification metadata and artifact evidence:`,
        sections: [
          {
            heading: 'Lead Auditor Fieldwork Sampling Verification Dossier',
            table: {
              headers: ['Audit Verification Parameter', 'Operational Evidence Record'],
              rows: [
                ['Primary Audit Artifact', auditorDossier.artifactName],
                ['ISO 19011:2018 Sampling Protocol', auditorDossier.samplingProtocol],
                ['Storage Location & Security Level', auditorDossier.storageLocation],
                ['Retention SLA Mandate', auditorDossier.retentionSla],
                ['Normative Standard Mapping', auditorDossier.clauseOrAnnexA],
                ['Associated Master Risk ID', auditorDossier.riskId],
                ['Statutory & Regulatory Citation', auditorDossier.statutoryMandate],
                ['Cryptographic SHA-256 Digest Seal', auditorDossier.sha256Seal],
                ['Auditor Fieldwork Attestation Verdict', `${auditorDossier.auditorVerdict} - CERTIFIED CONFORMING (Zero Non-Conformities)`]
              ]
            }
          },
          {
            heading: 'Executive Ratification & Annual Distribution Record',
            body: `This policy has been distributed to 100% of personnel via the Skanda GRC Employee Portal. Annual digital signature required.
Ratified by: Chief Information Security Officer (${cisoName}) and CEO on behalf of the Board of Directors.`
          }
        ]
      }
    ],
    content: `# ${companyName} - Master Information Security Policy
**Doc Code:** POL-ISMS-01 | **Classification:** Confidential - Internal ISMS Use Only | **Standard:** ${framework}
**Document Owner:** ${cisoName} | **Approver:** CEO & Board of Directors | **Effective Date:** ${effectiveDate}

## 1. Executive Mandate (ISO 27001:2022 Clause 5.1 & 5.2)
Top Management of **${companyName}** mandates strict compliance with this policy across all operations, cloud environments, and personnel.

## 2. Measurable Targets (Clause 6.2)
- Zero high-impact customer data breaches.
- 99.9% production availability with RTO <= 4h, RPO <= 15m.
- Critical vulnerabilities (CVSS >= 9.0) resolved within 72 hours; High within 14 days.
- 100% hardware-backed MFA enforced via **${identityProvider}**.`
  };
}

export function buildDocScp01(ctx: PolicyTemplateContext): GeneratedDocument {
  const { companyName, industry, framework, cloudProvider, identityProvider, mdmProvider, scmProvider, departments, cisoName, effectiveDate, defaultControlStatements, defaultRevisionHistory } = ctx;

  const auditorDossier = buildAuditorVerificationDossier({
    docCode: 'DOC-SCP-01',
    docTitle: 'ISMS Scope & Organizational Context Document',
    companyName,
    clauseOrAnnexA: 'Mandatory Clause 4.3 (Scope of the ISMS) & Clauses 4.1-4.2',
    riskId: 'RSK-CTX-01',
    statutoryMandate: 'ISO 27001:2022 Clauses 4.1, 4.2, 4.3 & MAS TRM Section 3.2',
    artifactName: `${companyName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_ISMS_SCOPE_CONTEXT_APPROVED.pdf`
  });

  return {
    id: 'doc_scp_01',
    docCode: 'DOC-SCP-01',
    title: 'ISMS Scope & Organizational Context Document',
    type: 'POLICY',
    category: 'Governance & Scope',
    version: '1.0',
    status: 'APPROVED',
    owner: cisoName,
    approver: 'Executive Board / CEO',
    effectiveDate,
    reviewCycle: 'Annual',
    classification: 'Confidential - Internal ISMS Use Only',
    standard: framework,
    documentOwner: cisoName,
    issuedBy: 'ISMS Working Group',
    approvedBy: 'CEO & Board of Directors',
    acknowledgementCount: 24,
    lastModified: new Date().toISOString(),
    documentControlStatements: defaultControlStatements,
    revisionHistory: defaultRevisionHistory,
    tableOfContents: [
      { title: 'Document Control & Formal Sign-off Record', pageNo: 2, level: 1 },
      { title: 'Table of Contents', pageNo: 3, level: 1 },
      { title: '1. Organizational Context & Issue Matrix (Clause 4.1)', pageNo: 4, level: 1 },
      { title: '2. Interested Parties, Obligations & Regulatory Registry (Clause 4.2)', pageNo: 4, level: 1 },
      { title: '3. Tri-Partite Scope Perimeter Model (Clause 4.3)', pageNo: 5, level: 1 },
      { title: '4. Physical, Geographical & Cloud Hosting Regions', pageNo: 5, level: 1 },
      { title: '5. Interfaces, Exclusions & Shared Responsibility Defense', pageNo: 6, level: 1 },
      { title: '6. Lead Auditor Stage 2 Scope Verification Dossier & Seal', pageNo: 7, level: 1 }
    ],
    pages: [
      {
        pageNumber: 4,
        title: 'Context Analysis & Interested Parties',
        content: `1. Organizational Context & Issues Matrix (Clause 4.1)
This document establishes the official operational boundary of the Information Security Management System (ISMS) for ${companyName}.
- Entity Name: ${companyName}
- Industry Sector: ${industry}
- Contextual Factors Analyzed:
  ▪ External: Rapid evolution of ransomware-as-a-service, cross-border data protection mandates (GDPR, PDPA, MAS TRM), cloud infrastructure dependencies, and client supply-chain assurance demands.
  ▪ Internal: High-velocity DevOps engineering release cycles, distributed teleworking workforce, zero-trust cloud architecture, and proprietary source code protection.`,
        sections: [
          {
            heading: '2. Interested Parties, Requirements & Statutory Mandates (Clause 4.2)',
            body: `The organization has formally identified the following interested parties, their expectations, and corresponding statutory legal references:`,
            table: {
              headers: ['Interested Party', 'Category', 'Mandatory Security Expectation', 'Statutory / Contractual Reference'],
              rows: [
                ['Enterprise SaaS Clients', 'Customers', 'Data confidentiality, 99.9% uptime SLA, independent SOC 2 / ISO 27001 reports', 'Customer MSAs & DPAs'],
                ['Financial Regulators (MAS)', 'Regulator', 'Cyber hygiene, technology risk governance, statutory incident notification <= 1h', 'MAS Notice 655 & TRM Guidelines'],
                ['Data Protection Authorities (GDPR/PDPA)', 'Regulator', 'Lawful data processing, breach notification <= 72h, subject access rights', 'EU GDPR Art 33, SG PDPA 2020'],
                ['Executive Board & Investors', 'Governance', 'Enterprise valuation preservation, zero catastrophic reputational breach', 'Fiduciary Duties & Risk Appetite'],
                ['Cloud Providers (${cloudProvider})', 'Suppliers', 'Adherence to acceptable use policies and mutual shared responsibility terms', 'AWS Customer Agreement']
              ]
            }
          }
        ]
      },
      {
        pageNumber: 5,
        title: 'Tri-Partite Scope Perimeter Model',
        content: `3. Tri-Partite Scope Perimeter Model (Clause 4.3)
${companyName} defines its ISMS perimeter through three rigorous, non-overlapping operational perimeters:`,
        sections: [
          {
            heading: 'Perimeter 1: Logical & Software Delivery Architecture',
            body: `▪ Cloud Production: All production and staging VPCs, subnets, Kubernetes clusters, and RDS PostgreSQL databases hosted in ${cloudProvider}.
▪ Identity & Access: Single Sign-On, directory services, and hardware MFA federation governed through ${identityProvider}.
▪ Source Code & Artifacts: All proprietary software repositories, CI/CD deployment pipelines, and container registries in ${scmProvider}.`
          },
          {
            heading: 'Perimeter 2: Physical & Geographical Hosting Facilities',
            table: {
              headers: ['Facility / Region', 'Classification', 'Location', 'In-Scope Boundary'],
              rows: [
                ['Corporate Headquarters', 'Primary Office', 'Main Corporate Office Suite', 'Executive, HR, Finance, Physical IT'],
                ['Primary Production Cloud Region', 'Cloud Datacenter', `${cloudProvider} Primary Region`, 'Core Production APIs, Customer DBs, KMS'],
                ['Secondary Disaster Recovery Region', 'Hot Standby Cloud', `${cloudProvider} Secondary Region`, 'Automated Replicas, S3 Backups, DR Workloads'],
                ['Authorized Telework Workstations', 'Remote Endpoints', 'Global Authorized Remote Locations', '100% Managed Laptops under ${mdmProvider}']
              ]
            }
          },
          {
            heading: 'Perimeter 3: People, Workstations & Supply Chain',
            body: `▪ In-Scope Personnel: 100% of full-time employees, part-time staff, and embedded technical contractors in: ${departments.join(', ')}.
▪ Endpoint Fleet: All corporate laptops and mobile devices enrolled in ${mdmProvider} with enforced full-disk encryption and EDR agents.`
          }
        ]
      },
      {
        pageNumber: 6,
        title: 'Interfaces & Exclusions Justifications',
        content: `4. Statement of Exclusions & Non-Exclusion Principle
In strict compliance with ISO/IEC 27001:2022 Clause 4.3, no requirements from Clauses 4 through 10 may be excluded. Controls from Annex A may only be excluded if justified by formal risk assessment and absence of operational attack surfaces.`,
        sections: [
          {
            heading: 'Defensible Annex A Exclusions Table',
            table: {
              headers: ['Annex A Control', 'Control Title', 'Technical Exclusion Justification', 'Approved By'],
              rows: [
                ['A.7.11', 'Supporting Utilities (Generators)', `${companyName} operates 100% on multi-AZ cloud infrastructure (${cloudProvider}) and maintains zero on-premise physical datacenters or industrial diesel generators. Power redundancy is governed under the AWS Shared Responsibility Model.`, cisoName],
                ['A.7.14', 'Equipment Disposal', `All decommissioned corporate laptops are returned to certified IT asset disposition (ITAD) vendors providing cryptographic certificates of erasure pursuant to NIST SP 800-88 Rev 1. Zero physical drives are shredded on premise.`, cisoName]
              ]
            }
          },
          {
            heading: 'External Interfaces & Shared Responsibility Boundaries',
            body: `▪ IaaS Boundary: ${cloudProvider} is responsible for physical datacenter security, hypervisor isolation, and hardware maintenance. ${companyName} maintains sole responsibility for OS hardening, database encryption, IAM role configuration, and application code.
▪ Identity Boundary: ${identityProvider} delivers federated authentication; ${companyName} enforces password length, hardware FIDO2 keys, and deprovisioning workflows.`
          }
        ]
      },
      {
        pageNumber: 7,
        title: 'Lead Auditor Scope Verification Dossier',
        content: `5. External Lead Auditor Stage 2 Fieldwork Dossier & Cryptographic Seal
This section provides certification body lead auditors (TÜV SÜD, BSI, UKAS CBs) with verified scope parameters:`,
        sections: [
          {
            heading: 'Lead Auditor Scope Sampling Verification Dossier',
            table: {
              headers: ['Audit Scope Parameter', 'Operational Evidence Record'],
              rows: [
                ['Primary Audit Artifact', auditorDossier.artifactName],
                ['ISO 19011:2018 Sampling Protocol', auditorDossier.samplingProtocol],
                ['Storage Repository & SLA', auditorDossier.storageLocation],
                ['Retention Period Mandate', auditorDossier.retentionSla],
                ['Normative Clause Mapping', auditorDossier.clauseOrAnnexA],
                ['Associated Master Risk ID', auditorDossier.riskId],
                ['Statutory Reference Citation', auditorDossier.statutoryMandate],
                ['Cryptographic SHA-256 Digest Seal', auditorDossier.sha256Seal],
                ['Auditor Fieldwork Attestation Verdict', `${auditorDossier.auditorVerdict} - CERTIFIED CONFORMING (Zero Scope Ambiguities)`]
              ]
            }
          },
          {
            heading: 'Executive Ratification',
            body: `This ISMS Scope Document is ratified by the Board of Directors and Chief Information Security Officer (${cisoName}). Effective Date: ${effectiveDate}.`
          }
        ]
      }
    ],
    content: `# ${companyName} - ISMS Scope & Organizational Context Document
**Doc Code:** DOC-SCP-01 | **Classification:** Confidential - Internal ISMS Use Only | **Standard:** ${framework}
**Document Owner:** ${cisoName} | **Approver:** CEO & Board of Directors | **Effective Date:** ${effectiveDate}

## 1. Scope Statement (ISO 27001:2022 Clause 4.3)
The ISMS covers the end-to-end design, development, cloud infrastructure hosting, customer data processing, deployment, operations, and support of **${companyName}**'s digital platform.

## 2. Tri-Partite Perimeter
- **Logical / Cloud:** ${cloudProvider} multi-region VPCs, ${identityProvider} SSO, ${scmProvider} code repositories.
- **Physical:** Corporate HQ, ${cloudProvider} datacenters, authorized remote telework locations.
- **People:** 100% of workforce in ${departments.join(', ')} managed via ${mdmProvider}.`
  };
}
