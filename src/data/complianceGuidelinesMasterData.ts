// Authoritative Master Registry for Global Regulatory & ISO Compliance Guidelines
// Covers ISO 27001, ISO 42001, ISO 27701, MAS TRM (Singapore), India DPDP Act 2023, EU GDPR, and Nigeria NDPR / NDPA 2023

export interface ComplianceGuidelineFramework {
  id: string;
  code: string;
  title: string;
  authority: string;
  jurisdiction: string;
  category: 'ISO_STANDARDS' | 'FINANCIAL_CYBER' | 'PRIVACY_DATA_PROTECTION' | 'SECURITY_FRAMEWORKS';
  badgeColor: string;
  effectiveDate: string;
  scopeSummary: string;
  enforceability: 'MANDATORY_REGULATION' | 'CERTIFICATION_STANDARD' | 'REGULATORY_GUIDELINE';
  maximumPenalties: string;
  incidentNotificationWindow: {
    authorityWindow: string;
    affectedPartiesWindow: string;
    description: string;
    regulatoryBody: string;
  };
  keyGovernancePrinciples: Array<{
    title: string;
    description: string;
    practicalAction: string;
  }>;
  mandatoryPoliciesAndSops: Array<{
    code: string;
    name: string;
    type: 'POLICY' | 'SOP' | 'REGISTER' | 'PLAN';
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    description: string;
  }>;
  departmentalGuidelines: {
    engineeringDevOps: string[];
    infosecRisk: string[];
    peopleHr: string[];
    legalFinance: string[];
    executiveBoard: string[];
  };
  stepByStepImplementationChecklist: Array<{
    stepNumber: number;
    phase: string;
    task: string;
    deliverable: string;
    responsibleOwner: string;
  }>;
  commonAuditPitfalls: string[];
  auditEvidenceArtifacts: string[];
}

export const COMPLIANCE_GUIDELINES: ComplianceGuidelineFramework[] = [
  {
    id: 'fw_iso27001_2022',
    code: 'ISO/IEC 27001:2022',
    title: 'Information Security Management System (ISMS)',
    authority: 'International Organization for Standardization (ISO) / IEC',
    jurisdiction: 'Global / International',
    category: 'ISO_STANDARDS',
    badgeColor: 'sky',
    effectiveDate: 'October 2022 (Transition deadline: Oct 31, 2025)',
    scopeSummary: 'Specification for establishing, implementing, maintaining, and continually improving an Information Security Management System (Clauses 4-10 and 93 Annex A Controls).',
    enforceability: 'CERTIFICATION_STANDARD',
    maximumPenalties: 'Loss of ISO accredited certification, disqualification from enterprise RFPs/tenders, potential regulatory scrutiny.',
    incidentNotificationWindow: {
      authorityWindow: 'Immediate internal escalation; external notice as governed by applicable statutory laws (e.g., GDPR 72h, MAS 1h)',
      affectedPartiesWindow: 'Within contractual SLA agreed with enterprise customers',
      description: 'ISO 27001 Clause 10.1 & Annex A.5.24 - A.5.28 require formal incident detection, classification, root cause analysis, and corrective actions without undue delay.',
      regulatoryBody: 'Accredited Certification Body (Audits) & Relevant Statutory Regulators'
    },
    keyGovernancePrinciples: [
      {
        title: 'Clause 4.3 - Defined Operational ISMS Scope',
        description: 'The organization must formally define boundaries and applicability of the ISMS, considering internal/external issues, interested party expectations, and dependencies.',
        practicalAction: 'Document the physical, cloud, geographical, and departmental perimeter with explicit inclusion/exclusion justifications.'
      },
      {
        title: 'Clause 5.1 & 5.2 - Top Management Leadership & Policy',
        description: 'Executive leadership must demonstrate hands-on commitment, publish an approved InfoSec policy, and assign roles and authorities.',
        practicalAction: 'Hold documented Information Security Steering Committee meetings with formal board sign-off on the ISMS Policy.'
      },
      {
        title: 'Clause 6.1.2 & 6.1.3 - 5x5 Risk Assessment & SoA',
        description: 'Establish objective risk evaluation criteria, calculate likelihood vs. impact, build a Risk Treatment Plan, and produce a formal Statement of Applicability (SoA) for all 93 controls.',
        practicalAction: 'Conduct risk assessments for all departments and maintain the Statement of Applicability with documented justifications for any excluded controls.'
      },
      {
        title: 'Clause 9.2 & 9.3 - Internal Audit & Management Review',
        description: 'Conduct comprehensive internal audits at planned intervals covering all clauses and controls, followed by a formal Executive Management Review.',
        practicalAction: 'Schedule annual internal audits using qualified independent auditors and table formal minutes covering ISMS metrics, audit findings, and resource needs.'
      },
      {
        title: 'Clause 10.1 - Corrective Action & Continual Improvement',
        description: 'Systematically address non-conformities, evaluate root causes using 5-Whys or Ishikawa analysis, and verify corrective action efficacy.',
        practicalAction: 'Maintain an active Corrective and Preventive Action (CAPA) register with assigned remedial owners and target completion dates.'
      }
    ],
    mandatoryPoliciesAndSops: [
      { code: 'ISMS-POL-01', name: 'Information Security Policy', type: 'POLICY', priority: 'CRITICAL', description: 'Overarching policy approved by leadership outlining security principles.' },
      { code: 'ISMS-SOP-01', name: 'Information Security Risk Assessment & Treatment Procedure', type: 'SOP', priority: 'CRITICAL', description: 'Defines risk criteria, impact scales, risk owners, and residual risk acceptance.' },
      { code: 'ISMS-SOP-02', name: 'Access Control & Privileged Identity SOP', type: 'SOP', priority: 'CRITICAL', description: 'Enforces least privilege, MFA, role-based access, and quarterly access reviews.' },
      { code: 'ISMS-SOP-05', name: 'Incident Response & Breach Management SOP', type: 'SOP', priority: 'CRITICAL', description: 'Step-by-step triage, containment, forensic investigation, and regulatory notification workflows.' },
      { code: 'ISMS-SOP-07', name: 'Secure Software Development Lifecycle (SSDLC) SOP', type: 'SOP', priority: 'HIGH', description: 'Code reviews, SAST/DAST scanning, separation of dev/stage/prod, and CI/CD security.' },
      { code: 'ISMS-POL-06', name: 'Supplier & Vendor Third-Party Security Policy', type: 'POLICY', priority: 'HIGH', description: 'Vendor risk scoring, contractual DPA clauses, and annual supplier audits.' },
      { code: 'ISMS-PLAN-01', name: 'Business Continuity & Disaster Recovery Plan', type: 'PLAN', priority: 'HIGH', description: 'RTO, RPO, backup restoration testing, and emergency failover protocols.' },
      { code: 'ISMS-SOP-09', name: 'Internal Audit & Management Review Procedure', type: 'SOP', priority: 'HIGH', description: 'Annual audit charter, auditor impartiality rules, and executive reporting formats.' }
    ],
    departmentalGuidelines: {
      engineeringDevOps: [
        'Enforce branch protection rules and peer code reviews on all production repositories.',
        'Implement automated SAST/DAST and software composition analysis (SCA) in CI/CD pipelines.',
        'Enforce strict isolation between development, staging, and production environments.',
        'Rotate all API tokens, KMS keys, and database secrets every 90 days or via automated vault rotation.'
      ],
      infosecRisk: [
        'Maintain the Statement of Applicability (SoA) and review all 93 Annex A controls annually.',
        'Execute weekly vulnerability scanning and annual third-party network/application penetration tests.',
        'Manage centralized SIEM log collection with at least 12 months retention and tamper-evident storage.',
        'Facilitate annual internal audits and oversee corrective action implementation across business units.'
      ],
      peopleHr: [
        'Conduct mandatory background verification and criminal history checks prior to employment.',
        'Require all new hires to sign the Information Security Policy & NDA during day-1 onboarding.',
        'Deliver quarterly mandatory cybersecurity awareness training (phishing simulations, data hygiene).',
        'Execute prompt termination protocols ensuring IT access revocation within 4 hours of offboarding.'
      ],
      legalFinance: [
        'Review and embed mandatory security and confidentiality clauses into all vendor and customer MSAs.',
        'Review supplier SOC 2 and ISO 27001 certifications before authorizing procurement.',
        'Ensure cyber liability insurance policy coverage is maintained and reviewed annually.'
      ],
      executiveBoard: [
        'Formally approve and sign off the overarching Information Security Policy annually.',
        'Convene quarterly Information Security Steering Committee meetings with documented minutes.',
        'Allocate adequate budget, staffing, and tooling resources for the ISMS program.'
      ]
    },
    stepByStepImplementationChecklist: [
      { stepNumber: 1, phase: 'Discovery & Scoping', task: 'Define ISMS scope boundaries, external/internal issues (Clause 4.1, 4.3)', deliverable: 'Approved Scope Statement & Department Inventory', responsibleOwner: 'CISO / Lead Auditor' },
      { stepNumber: 2, phase: 'Governance & Policy', task: 'Draft, approve, and publish core ISMS policies and leadership charter (Clause 5)', deliverable: 'Signed ISMS Policy & Role Responsibility Matrix', responsibleOwner: 'Executive Leadership' },
      { stepNumber: 3, phase: 'Risk Management', task: 'Execute comprehensive risk assessment across all business units (Clause 6.1)', deliverable: 'Risk Register & Risk Treatment Plan (RTP)', responsibleOwner: 'InfoSec / Risk Lead' },
      { stepNumber: 4, phase: 'SoA Formulation', task: 'Evaluate all 93 Annex A controls and formulate Statement of Applicability', deliverable: 'Formally Approved Statement of Applicability (SoA)', responsibleOwner: 'ISMS Committee' },
      { stepNumber: 5, phase: 'Operational Controls', task: 'Implement Annex A technical, organizational, physical, and people controls', deliverable: 'Operational Evidence (MFA, Backups, Encryption, SDLC)', responsibleOwner: 'DevOps & IT Leads' },
      { stepNumber: 6, phase: 'Training & Awareness', task: 'Roll out mandatory awareness training and simulate phishing assessments', deliverable: 'Training Attendance Logs & Phishing Metrics', responsibleOwner: 'HR / People Ops' },
      { stepNumber: 7, phase: 'Internal Audit', task: 'Conduct formal independent Internal Audit covering Clauses 4-10 and Annex A', deliverable: 'Internal Audit Report & CAPA Register', responsibleOwner: 'Internal Auditor' },
      { stepNumber: 8, phase: 'Management Review', task: 'Host Executive Management Review meeting to evaluate ISMS performance', deliverable: 'Signed Management Review Meeting Minutes', responsibleOwner: 'CEO / Board' },
      { stepNumber: 9, phase: 'Certification Audit', task: 'Engage accredited registrar for Stage 1 (Documentation) and Stage 2 (Implementation) Audits', deliverable: 'ISO/IEC 27001:2022 Accredited Certificate', responsibleOwner: 'External Certification Body' }
    ],
    commonAuditPitfalls: [
      'Stale risk registers that have not been updated when new infrastructure or SaaS tools were adopted.',
      'Claiming control exclusions in the SoA without providing comprehensive, defensible justifications.',
      'Missing evidence of management review meetings (auditors demand signed minutes and attendance).',
      'Untracked vendor risks: using critical cloud suppliers without verifying their SOC 2 or ISO certificates.',
      'Lack of proof of employee policy acknowledgment or missing offboarding access revocation records.'
    ],
    auditEvidenceArtifacts: [
      'Signed Information Security Policy (v1.0+)',
      'Approved Statement of Applicability (SoA)',
      'Risk Assessment Methodology & Treated Risk Register',
      'Internal Audit Schedule, Audit Plan & Final Audit Report',
      'Management Review Minutes with Action Items',
      'Corrective and Preventive Action (CAPA) Log',
      'Access Review Logs & Identity Provider MFA Enforcement Proof',
      'Annual Penetration Testing Report & Remediation Evidence'
    ]
  },
  {
    id: 'fw_mas_trm_2021',
    code: 'MAS TRM Guidelines',
    title: 'Technology Risk Management Guidelines (2021 Revision + 2024 Resilience Addenda)',
    authority: 'Monetary Authority of Singapore (MAS)',
    jurisdiction: 'Singapore / Financial Institutions operating in Singapore',
    category: 'FINANCIAL_CYBER',
    badgeColor: 'rose',
    effectiveDate: 'January 2021 (Ongoing supervisory inspections)',
    scopeSummary: 'Comprehensive supervisory risk framework issued under MAS statutory authority governing IT governance, cyber resilience, cloud computing, API security, operational availability, and incident handling for financial institutions.',
    enforceability: 'REGULATORY_GUIDELINE',
    maximumPenalties: 'Regulatory directives, civil penalties, formal reprimands, suspension/revocation of CMS or Banking license, and mandatory supervisory capital surcharges.',
    incidentNotificationWindow: {
      authorityWindow: 'Within 1 HOUR of discovering a critical system outage or severe cyber incident',
      affectedPartiesWindow: 'Expeditiously as operational continuity and customer impact demands',
      description: 'MAS Notice on Technology Risk Management requires verbal/electronic notification to MAS within 1 hour of discovery, followed by a formal incident investigation report within 14 calendar days.',
      regulatoryBody: 'Monetary Authority of Singapore (Technology Risk Supervision Division)'
    },
    keyGovernancePrinciples: [
      {
        title: 'Section 3.0 - Board & Senior Management Oversight',
        description: 'The Board of Directors and Senior Management are strictly accountable for maintaining effective technology risk management and a sound cyber defense posture.',
        practicalAction: 'Appoint a dedicated Chief Information Security Officer (CISO) and establish a Technology Risk Committee reporting directly to the Board.'
      },
      {
        title: 'Section 4.0 - Technology Risk Management Framework',
        description: 'Establish clear risk appetite statements, systemic threat risk profiling, key risk indicators (KRIs), and third-party risk management procedures.',
        practicalAction: 'Quantify technology risk limits and monitor KRIs such as unscheduled system downtime, unpatched high-severity CVEs, and failed logins.'
      },
      {
        title: 'Section 5.0 - IT Service Availability & Maximum Tolerable Downtime',
        description: 'Critical systems must not have more than 4 hours of unscheduled downtime in any rolling 12-month period. Recovery Time Objective (RTO) must not exceed 4 hours.',
        practicalAction: 'Architect active-active or high-availability multi-zone cloud infrastructure with Recovery Point Objective (RPO) <= 15 minutes.'
      },
      {
        title: 'Section 7.0 - Cyber Security Operations & Red Teaming',
        description: 'Maintain 24/7 Security Operations Center (SOC) capability, ingest cyber threat intelligence (CTI), and conduct regular Adversary Attack Simulation (AAS / Red Teaming).',
        practicalAction: 'Contract an accredited CREST-certified team to perform intelligence-led red teaming against critical systems annually.'
      },
      {
        title: 'Section 9.0 - Strong Authentication & Dual Control',
        description: 'Mandatory Multi-Factor Authentication (MFA) for administrative access, remote access, and all customer financial transactions. Dual authorization for critical operations.',
        practicalAction: 'Implement FIDO2 / hardware token MFA for all privileged administrators and enforce 4-eyes approval on production deployments.'
      }
    ],
    mandatoryPoliciesAndSops: [
      { code: 'MAS-POL-01', name: 'Technology Risk Governance & Board Oversight Policy', type: 'POLICY', priority: 'CRITICAL', description: 'Sets Board responsibilities, risk appetite, and CISO mandate.' },
      { code: 'MAS-SOP-01', name: 'Critical Incident 1-Hour Notification & Escalation SOP', type: 'SOP', priority: 'CRITICAL', description: 'Step-by-step procedure to notify MAS within 60 minutes of critical system disruption.' },
      { code: 'MAS-SOP-02', name: 'Adversary Attack Simulation & Vulnerability Management SOP', type: 'SOP', priority: 'HIGH', description: 'Red teaming, penetration testing, and 14-day high-severity patch SLAs.' },
      { code: 'MAS-POL-03', name: 'Cryptographic Key Lifecycle & API Security Policy', type: 'POLICY', priority: 'CRITICAL', description: 'Hardware Security Module (HSM) controls, TLS 1.3 standards, and API authentication tokens.' },
      { code: 'MAS-SOP-04', name: 'High Availability & Disaster Recovery Testing SOP', type: 'SOP', priority: 'HIGH', description: 'Annual simulated datacenter failover testing validating RTO <= 4h and RPO <= 15m.' }
    ],
    departmentalGuidelines: {
      engineeringDevOps: [
        'Architecture must guarantee maximum unscheduled downtime under 4 hours per rolling 12 months.',
        'Implement zero-trust network segmentation between public interfaces, app tiers, and databases.',
        'Enforce automated static (SAST) and dynamic (DAST) scanning in CI/CD with blocking gates for critical bugs.',
        'Implement secure API gateways with OAuth2 / mutual TLS (mTLS) and rate-limiting against DDoS.'
      ],
      infosecRisk: [
        'Execute 24/7 SIEM monitoring with real-time alerts for privilege escalation or unauthorized egress.',
        'Ensure critical vulnerability patches are applied within 14 days (or mitigating controls deployed within 48 hours).',
        'Direct connection to financial sector Threat Intelligence feeds (FS-ISAC) for proactiveIOC ingestion.',
        'Oversee red teaming exercises and track findings to remediation within 90 days.'
      ],
      peopleHr: [
        'Perform enhanced background screening (including financial probity and credit checks) for privileged roles.',
        'Mandate specialized secure coding training for developers and cyber hygiene tests for all staff.',
        'Enforce immediate suspension of IT credentials upon notice of employee investigation or resignation.'
      ],
      legalFinance: [
        'Maintain a Master Third-Party Service Provider register classifying high-risk vs. non-critical vendors.',
        'Verify that all vendor contracts include explicit right-to-audit clauses accessible by MAS inspectors.',
        'Ensure financial reserves and cyber insurance adequately cover operational resilience requirements.'
      ],
      executiveBoard: [
        'Review and approve Technology Risk Appetite statements at least annually.',
        'Receive and scrutinize quarterly reports on cyber incidents, threat landscapes, and audit findings.',
        'Ensure technology risk personnel have adequate independence and direct escalation channels to the Board.'
      ]
    },
    stepByStepImplementationChecklist: [
      { stepNumber: 1, phase: 'Governance Setup', task: 'Form Technology Risk Committee and formally appoint CISO with Board charter', deliverable: 'Board Resolution & Risk Appetite Statement', responsibleOwner: 'Board of Directors' },
      { stepNumber: 2, phase: 'Critical Asset Mapping', task: 'Identify all critical systems and establish baseline RTO (<=4h) and RPO (<=15m)', deliverable: 'Critical Systems Inventory & Business Impact Analysis (BIA)', responsibleOwner: 'Chief Technology Officer' },
      { stepNumber: 3, phase: 'Availability Architecture', task: 'Deploy multi-availability-zone redundancy and execute simulated failover drills', deliverable: 'Annual DR Test Report & Downtime Log', responsibleOwner: 'Head of Infrastructure' },
      { stepNumber: 4, phase: 'Access & Authentication', task: 'Roll out mandatory hardware-backed MFA and PAM for all privileged server/cloud access', deliverable: 'PAM Configuration & MFA Enforcement Audit', responsibleOwner: 'IT Security Lead' },
      { stepNumber: 5, phase: 'Incident Response 1-Hour SLA', task: 'Establish and drill the 1-hour MAS incident escalation notification workflow', deliverable: 'MAS Incident Playbook & Drill Sign-off', responsibleOwner: 'Incident Commander' },
      { stepNumber: 6, phase: 'Adversary Simulation', task: 'Contract CREST-certified provider to conduct Red Teaming (AAS) against critical systems', deliverable: 'Red Team Report & Corrective Plan', responsibleOwner: 'CISO' },
      { stepNumber: 7, phase: 'Third-Party Risk Review', task: 'Audit all critical outsourced service providers and insert MAS right-to-audit clauses', deliverable: 'Vendor Risk Dossier & MSA Amendments', responsibleOwner: 'Procurement & Legal' }
    ],
    commonAuditPitfalls: [
      'Failure to report a critical incident to MAS within the strict 1-hour deadline due to internal delays.',
      'Unscheduled cumulative system downtime exceeding 4 hours over rolling 12 months without MAS notification.',
      'Missing right-to-audit clauses in cloud contracts (AWS/Azure/GCP/SaaS) allowing MAS regulator access.',
      'Failure to test disaster recovery failovers with actual workload switching (paper-only exercises).',
      'Shared or generic administrative accounts lacking individual attribution in audit trails.'
    ],
    auditEvidenceArtifacts: [
      'Technology Risk Committee Meeting Minutes',
      'System Downtime Ledger for Rolling 12 Months',
      '1-Hour Incident Notification Playbook & Drill Records',
      'CREST Red Team / AAS Report with Remediation Proof',
      'Privileged Access Management (PAM) Configuration Logs',
      'Outsourced Service Provider Risk Assessment Register'
    ]
  },
  {
    id: 'fw_dpdp_2023',
    code: 'India DPDP Act 2023',
    title: 'Digital Personal Data Protection Act 2023',
    authority: 'Data Protection Board of India (DPBI) & Ministry of Electronics and Information Technology (MeitY)',
    jurisdiction: 'Republic of India / Entities processing digital personal data of Indian Data Principals',
    category: 'PRIVACY_DATA_PROTECTION',
    badgeColor: 'amber',
    effectiveDate: 'August 2023 (Rules notified for nationwide compliance)',
    scopeSummary: 'Governs processing of digital personal data within India and processing outside India if offering goods/services to Indian Data Principals. Mandates consent managers, multilingual notices, children data restrictions, and Significant Data Fiduciary (SDF) obligations.',
    enforceability: 'MANDATORY_REGULATION',
    maximumPenalties: 'Up to ₹250 Crores (~$30M USD) for failure to observe reasonable security safeguards; up to ₹200 Crores for failure to notify personal data breach.',
    incidentNotificationWindow: {
      authorityWindow: 'Mandatory breach notification to Data Protection Board of India + CERT-In reporting within 6 HOURS',
      affectedPartiesWindow: 'Without delay to each affected Data Principal in prescribed form and manner',
      description: 'Under Section 8(6) of DPDP Act and CERT-In Cyber Security Directions, personal data breaches must be notified to the Data Protection Board of India and CERT-In within 6 hours of discovery.',
      regulatoryBody: 'Data Protection Board of India (DPBI) & CERT-In'
    },
    keyGovernancePrinciples: [
      {
        title: 'Section 6 - Itemised & Multilingual Notice',
        description: 'Notice requesting consent must be clear, transparent, itemised, and accessible in English and all 22 languages specified in the Eighth Schedule to the Constitution of India.',
        practicalAction: 'Provide consent banners with language toggles allowing Indian Data Principals to review data collection in their preferred scheduled language.'
      },
      {
        title: 'Section 6(1) - Clear & Unconditional Consent',
        description: 'Consent must be free, specific, informed, unconditional, and unambiguous with clear affirmative action. Consent cannot be bundled as a condition for service.',
        practicalAction: 'Deploy Consent Management Platform (CMP) tracking granular consents with easy one-click withdrawal mechanisms.'
      },
      {
        title: 'Section 9 - Strict Children Data Protections',
        description: 'Before processing any personal data of an individual under 18 years, verifiable consent of parent/lawful guardian is mandatory. Behavioral tracking and targeted ads are prohibited.',
        practicalAction: 'Implement age verification gates and disable all behavioral tracking cookies/analytics for identified minor accounts.'
      },
      {
        title: 'Section 10 - Significant Data Fiduciary (SDF) Mandates',
        description: 'Entities categorized as SDF must appoint an India-based Data Protection Officer (DPO), engage independent Data Auditors, and conduct periodic Data Protection Impact Assessments (DPIAs).',
        practicalAction: 'Appoint an India resident DPO who reports directly to the Board, and institute annual external privacy audits.'
      },
      {
        title: 'Section 12 & 13 - Data Principal Rights & Redressal',
        description: 'Data Principals possess rights to access, correction, completion, updating, erasure, and nomination. Grievances must be redressed within designated statutory periods.',
        practicalAction: 'Implement a self-service privacy portal enabling users to request data export, corrections, or erasure with SLA tracking.'
      }
    ],
    mandatoryPoliciesAndSops: [
      { code: 'DPDP-POL-01', name: 'Digital Personal Data Protection Policy', type: 'POLICY', priority: 'CRITICAL', description: 'Defines Data Fiduciary duties, lawful processing grounds, and user rights handling.' },
      { code: 'DPDP-SOP-01', name: 'Multilingual Notice & Consent Management SOP', type: 'SOP', priority: 'CRITICAL', description: 'Itemised notice formats, 22-language translations, and consent revocation logging.' },
      { code: 'DPDP-SOP-02', name: 'Children Data Verification & Protection SOP', type: 'SOP', priority: 'CRITICAL', description: 'Parental consent verification methods and ban on tracking/targeted ads for minors.' },
      { code: 'DPDP-SOP-03', name: 'Data Principal Rights & Grievance Redressal SOP', type: 'SOP', priority: 'HIGH', description: 'Procedures to fulfill access, correction, erasure, and nomination requests within SLA.' },
      { code: 'DPDP-SOP-04', name: 'Personal Data Breach Notification (CERT-In 6h) SOP', type: 'SOP', priority: 'CRITICAL', description: 'Escalation to DPBI and CERT-In within 6 hours of breach detection.' }
    ],
    departmentalGuidelines: {
      engineeringDevOps: [
        'Ensure personal data databases support programmatic erasure and data export in readable formats.',
        'Encrypt all personal data at rest using AES-256 and in transit using TLS 1.3.',
        'Isolate and redact minor/children data from telemetry, tracking SDKs, and analytics pipelines.',
        'Implement automated data retention purges when processing purpose is fulfilled.'
      ],
      infosecRisk: [
        'Deploy data loss prevention (DLP) and monitoring across all endpoints handling Indian citizen data.',
        'Conduct periodic Data Protection Impact Assessments (DPIA) prior to deploying new digital products.',
        'Maintain readiness to notify CERT-In within 6 hours of any cyber security or data breach incident.'
      ],
      peopleHr: [
        'Obtain explicit consent from employees for employment processing and verify consent records.',
        'Conduct mandatory training for all staff on handling Indian citizen data and avoiding unauthorized disclosure.',
        'Ensure payroll and medical benefit vendors comply with DPDP data processing agreements.'
      ],
      legalFinance: [
        'Appoint a qualified India-based Data Protection Officer (DPO) and register details with DPBI.',
        'Execute Data Processing Agreements (DPAs) with all third-party vendors and cloud providers.',
        'Review cross-border data transfer arrangements against Central Government negative-list restrictions.'
      ],
      executiveBoard: [
        'Receive quarterly briefing from the India DPO regarding privacy complaints, DPIA results, and audit findings.',
        'Allocate capital for consent management tooling and independent external privacy audits.',
        'Ensure the organization does not bundle consent with service access or coerce user agreements.'
      ]
    },
    stepByStepImplementationChecklist: [
      { stepNumber: 1, phase: 'Data Mapping', task: 'Catalog all digital personal data flows, data stores, third-party processors, and children data', deliverable: 'Personal Data Inventory & Flow Diagram', responsibleOwner: 'DPO / Privacy Lead' },
      { stepNumber: 2, phase: 'Notice & Consent', task: 'Revamp consent banners to provide clear itemised notice in English and 22 Indian scheduled languages', deliverable: 'Multilingual Consent Banner & Consent Log', responsibleOwner: 'Product / Frontend Team' },
      { stepNumber: 3, phase: 'Children Data Controls', task: 'Implement verifiable parental consent mechanisms and disable tracking for users under 18', deliverable: 'Parental Consent Workflow & Tracking Blocker', responsibleOwner: 'Engineering Lead' },
      { stepNumber: 4, phase: 'Rights & Grievance', task: 'Establish self-service Data Principal rights portal and grievance redressal officer mechanism', deliverable: 'Privacy Rights Portal & Grievance SLA Register', responsibleOwner: 'Legal / Support Ops' },
      { stepNumber: 5, phase: 'DPO & SDF Compliance', task: 'Formally appoint India-based DPO, institute DPIA methodology, and hire external data auditor', deliverable: 'DPO Appointment Letter & Initial DPIA Report', responsibleOwner: 'Executive Board' },
      { stepNumber: 6, phase: 'Breach Response 6h SLA', task: 'Implement automated incident response playbook compliant with CERT-In 6-hour reporting mandate', deliverable: 'CERT-In / DPBI Incident Notification Playbook', responsibleOwner: 'CISO / Incident Team' }
    ],
    commonAuditPitfalls: [
      'Bundling consent: forcing users to agree to marketing/data sharing as a condition of accessing basic app features.',
      'Presenting notices only in English without offering local Indian scheduled language options.',
      'Failing to verify parental consent when providing services used by or accessible to children under 18.',
      'Lack of an India-resident DPO for entities categorized as Significant Data Fiduciaries.',
      'Missing the 6-hour incident notification deadline to CERT-In during a suspected security incident.'
    ],
    auditEvidenceArtifacts: [
      'Multilingual Notice & Consent Screenshots (with 22 languages)',
      'Consent Management Platform (CMP) Granular Audit Logs',
      'India Data Protection Officer (DPO) Appointment & Contact Details',
      'Data Protection Impact Assessment (DPIA) Reports',
      'Data Principal Rights Fulfillment Register with Timestamps',
      'Third-Party Data Processor Agreements (DPAs)'
    ]
  },
  {
    id: 'fw_gdpr_2016',
    code: 'EU GDPR (2016/679)',
    title: 'General Data Protection Regulation (Regulation EU 2016/679)',
    authority: 'European Data Protection Board (EDPB) & National Data Protection Authorities (e.g., CNIL, DPC, BfDI)',
    jurisdiction: 'European Union / European Economic Area & Global organizations offering goods/services to EU residents',
    category: 'PRIVACY_DATA_PROTECTION',
    badgeColor: 'indigo',
    effectiveDate: 'May 25, 2018 (Fully enforced across EU/EEA)',
    scopeSummary: 'Benchmark global privacy framework establishing comprehensive data subject rights, legal bases for processing, mandatory Data Protection Impact Assessments (DPIAs), 72-hour breach notification, and strict international transfer requirements.',
    enforceability: 'MANDATORY_REGULATION',
    maximumPenalties: 'Up to €20,000,000 or 4% of total worldwide annual turnover of the preceding financial year, whichever is higher.',
    incidentNotificationWindow: {
      authorityWindow: 'Within 72 HOURS of becoming aware of the personal data breach to the competent Supervisory Authority',
      affectedPartiesWindow: 'Without undue delay when the breach is likely to result in a high risk to rights and freedoms of natural persons',
      description: 'Article 33 mandates detailed notification to the lead Data Protection Authority within 72 hours. Article 34 mandates notification to data subjects if risk is high.',
      regulatoryBody: 'Lead Supervisory Authority (Data Protection Authority in EU Member State)'
    },
    keyGovernancePrinciples: [
      {
        title: 'Article 5 - Core Principles of Processing',
        description: 'Processing must adhere to Lawfulness, Fairness & Transparency; Purpose Limitation; Data Minimisation; Accuracy; Storage Limitation; Integrity & Confidentiality; and Accountability.',
        practicalAction: 'Maintain a comprehensive Record of Processing Activities (ROPA under Article 30) documenting legal bases and retention schedules.'
      },
      {
        title: 'Article 6 & 9 - Lawful Bases & Special Categories',
        description: 'Every processing activity must map to one of 6 lawful bases (Consent, Contract, Legal Obligation, Vital Interests, Public Task, Legitimate Interests). Processing biometric, health, or racial data is strictly prohibited without explicit exemption.',
        practicalAction: 'Document Legitimate Interest Assessments (LIAs) and obtain explicit consent for any health, biometric, or sensitive telemetry.'
      },
      {
        title: 'Articles 15-22 - Comprehensive Data Subject Rights',
        description: 'Data subjects have enforceable rights to Access (Art 15), Rectification (Art 16), Erasure / Right to be Forgotten (Art 17), Restriction (Art 18), Portability (Art 20), and to Object (Art 21).',
        practicalAction: 'Establish automated workflows to respond to Data Subject Access Requests (DSARs) within 30 calendar days at no charge.'
      },
      {
        title: 'Article 25 - Privacy by Design & Default',
        description: 'Implement appropriate technical and organizational measures (e.g. pseudonymisation, encryption) by default to protect personal data from product design inception.',
        practicalAction: 'Embed privacy checkpoints in product roadmaps and architecture reviews prior to feature release.'
      },
      {
        title: 'Chapter V (Articles 44-49) - International Data Transfers',
        description: 'Personal data can only be transferred outside the EEA to countries with an Adequacy Decision, or via Standard Contractual Clauses (SCCs) paired with a Transfer Impact Assessment (TIA).',
        practicalAction: 'Sign modern EU Standard Contractual Clauses (SCCs 2021) and conduct documented TIAs for all US-based cloud subprocessors.'
      }
    ],
    mandatoryPoliciesAndSops: [
      { code: 'GDPR-POL-01', name: 'Global Data Protection & Privacy Policy', type: 'POLICY', priority: 'CRITICAL', description: 'Defines compliance principles, controller/processor roles, and staff duties.' },
      { code: 'GDPR-SOP-01', name: 'Record of Processing Activities (ROPA Art 30) SOP', type: 'SOP', priority: 'CRITICAL', description: 'Maintains live registry of data flows, processing purposes, and sub-processors.' },
      { code: 'GDPR-SOP-02', name: 'Data Subject Access Request (DSAR) Fulfillment SOP', type: 'SOP', priority: 'CRITICAL', description: 'End-to-end process to verify identity and fulfill access/erasure within 30 days.' },
      { code: 'GDPR-SOP-03', name: '72-Hour Personal Data Breach Notification SOP', type: 'SOP', priority: 'CRITICAL', description: 'Triage, severity assessment, and notification to lead DPA within 72 hours.' },
      { code: 'GDPR-SOP-04', name: 'Data Protection Impact Assessment (DPIA Art 35) SOP', type: 'SOP', priority: 'HIGH', description: 'Mandatory threshold assessment and risk analysis for high-risk processing.' }
    ],
    departmentalGuidelines: {
      engineeringDevOps: [
        'Implement automated pseudonymisation, hashing, and AES-256 encryption on all PII columns.',
        'Build automated programmatic pipelines to execute user account deletion (Article 17 Erasure) across primary and replica databases.',
        'Ensure opt-in cookie tracking is strictly blocked before user consents via the CMP banner.',
        'Host EU customer data in EU cloud regions (e.g., AWS eu-central-1 Frankfurt or eu-west-1 Dublin).'
      ],
      infosecRisk: [
        'Conduct regular vulnerability assessments and maintain strict access controls (zero standing access).',
        'Maintain forensic readiness to supply breach impact assessments within 48 hours of detection.',
        'Audit third-party cloud subprocessors for ISO 27701 or SOC 2 Type II compliance.'
      ],
      peopleHr: [
        'Provide transparent Employee Privacy Notices covering HR processing, monitoring, and benefit sharing.',
        'Separate employment consent from contract agreements to prevent coerced consent.',
        'Conduct annual GDPR refresher training for all employees handling customer communications.'
      ],
      legalFinance: [
        'Appoint a Data Protection Officer (DPO) under Article 37 if processing large-scale monitoring or special categories.',
        'Sign modern EU Standard Contractual Clauses (SCCs) and Data Processing Agreements (DPAs) with all vendors.',
        'Oversee cross-border Transfer Impact Assessments (TIAs) evaluating surveillance laws in destination jurisdictions.'
      ],
      executiveBoard: [
        'Ensure the DPO operates independently and reports directly to the highest level of management.',
        'Review the corporate privacy posture annually and ensure adequate insurance and liability coverage.',
        'Sanction and resource privacy-enhancing technologies (PETs) across core digital products.'
      ]
    },
    stepByStepImplementationChecklist: [
      { stepNumber: 1, phase: 'Article 30 ROPA', task: 'Map all personal data collection points and compile the Record of Processing Activities', deliverable: 'Live ROPA Document & Data Flow Map', responsibleOwner: 'DPO / Privacy Lead' },
      { stepNumber: 2, phase: 'Legal Basis Audit', task: 'Verify legal basis for every processing purpose and execute Legitimate Interest Assessments (LIAs)', deliverable: 'Documented Legal Basis Register & LIAs', responsibleOwner: 'Legal Counsel' },
      { stepNumber: 3, phase: 'Consent & Cookies', task: 'Deploy ePrivacy Directive & GDPR compliant cookie consent banner with prior-block script enforcement', deliverable: 'Compliant Cookie Consent Banner', responsibleOwner: 'Engineering / Marketing' },
      { stepNumber: 4, phase: 'DSAR Automation', task: 'Create self-service portal or email intake process to handle DSARs within the 30-day statutory timeline', deliverable: 'DSAR Ticketing Workflow & Verification SOP', responsibleOwner: 'Privacy Operations' },
      { stepNumber: 5, phase: '72-Hour Breach Readiness', task: 'Establish incident response playbook with rapid notification templates for DPAs and data subjects', deliverable: '72-Hour Breach Playbook & Tabletop Drill Report', responsibleOwner: 'CISO / DPO' },
      { stepNumber: 6, phase: 'International Transfers', task: 'Execute Standard Contractual Clauses (SCCs) and Transfer Impact Assessments for all non-EEA vendors', deliverable: 'Signed SCCs & Completed TIA Dossiers', responsibleOwner: 'Procurement & Legal' },
      { stepNumber: 7, phase: 'DPIA Institutionalization', task: 'Integrate DPIA screening into product development and AI model deployment workflows', deliverable: 'Completed DPIAs for High-Risk Projects', responsibleOwner: 'Product / Security Teams' }
    ],
    commonAuditPitfalls: [
      'Relying on "Consent" for employee data processing where employment power imbalance invalidates free consent.',
      'Dark patterns in cookie banners (e.g. making "Accept All" bright and hiding "Reject All" in a sub-menu).',
      'Failing to maintain a documented ROPA (Article 30), which is the first artifact EU regulators request.',
      'Missing the 72-hour notification deadline to the supervisory authority following a ransomware or breach incident.',
      'Transferring data to US cloud vendors without signed 2021 SCCs and documented Transfer Impact Assessments.'
    ],
    auditEvidenceArtifacts: [
      'Record of Processing Activities (ROPA Art 30)',
      'Data Protection Officer (DPO) Designation Notification',
      'Data Protection Impact Assessments (DPIAs)',
      'Legitimate Interest Assessments (LIAs)',
      'Signed Standard Contractual Clauses (SCCs) and Vendor DPAs',
      '72-Hour Breach Notification Log & Tabletop Drill Minutes'
    ]
  },
  {
    id: 'fw_ndpr_2019_2023',
    code: 'Nigeria NDPR & NDPA 2023',
    title: 'Nigeria Data Protection Regulation 2019 & Nigeria Data Protection Act 2023',
    authority: 'Nigeria Data Protection Commission (NDPC)',
    jurisdiction: 'Federal Republic of Nigeria / Entities processing personal data of Nigerian citizens/residents',
    category: 'PRIVACY_DATA_PROTECTION',
    badgeColor: 'emerald',
    effectiveDate: 'NDPR (Nov 2019) / NDPA signed into law June 2023',
    scopeSummary: 'Comprehensive national data privacy framework enacted by the Federal Republic of Nigeria. Regulates Data Controllers and Processors of Major Importance (DCMI), mandates annual audits conducted by licensed DPCOs, and enforces strong consumer rights.',
    enforceability: 'MANDATORY_REGULATION',
    maximumPenalties: 'Up to ₦10,000,000 or 2% of annual gross revenue (whichever is greater) for Data Controllers of Major Importance.',
    incidentNotificationWindow: {
      authorityWindow: 'Within 72 HOURS of becoming aware of a personal data breach to the NDPC',
      affectedPartiesWindow: 'Promptly where the breach is likely to result in high risk to rights of data subjects',
      description: 'Section 40 of NDPA 2023 mandates notification of serious data breaches to the Nigeria Data Protection Commission within 72 hours, specifying remedial actions taken.',
      regulatoryBody: 'Nigeria Data Protection Commission (NDPC)'
    },
    keyGovernancePrinciples: [
      {
        title: 'Part V (NDPA) - Mandatory Annual Audit via Licensed DPCO',
        description: 'Data Controllers processing personal data of more than 2,000 data subjects in 12 months must conduct an annual Data Protection Audit and file the report with the NDPC by March 15th each year.',
        practicalAction: 'Engage a licensed Data Protection Compliance Organization (DPCO) to perform an independent audit and file the verification report before the March 15 deadline.'
      },
      {
        title: 'Section 32 - Appointment of Data Protection Officer (DPO)',
        description: 'Data Controllers and Processors of Major Importance must designate a qualified Data Protection Officer with knowledge of Nigerian data protection laws and cybersecurity.',
        practicalAction: 'Formally appoint a DPO, register contact details with the NDPC, and empower the DPO with direct access to senior management.'
      },
      {
        title: 'Section 25 - Lawful Basis & Explicit Consent',
        description: 'Personal data must be collected for specific, legitimate purposes with unambiguous consent or other recognized lawful grounds (contract, legal duty, vital interest).',
        practicalAction: 'Ensure all consumer registration flows display explicit privacy notices and capture verifiable consent timestamps.'
      },
      {
        title: 'Section 41-43 - Cross-Border Data Transfers',
        description: 'Cross-border transfer of personal data requires an Adequacy Decision by the NDPC, or adequate safeguards such as binding agreements or explicit data subject consent.',
        practicalAction: 'Verify that destination countries meet NDPC adequacy criteria or execute standard data protection clauses with foreign cloud vendors.'
      },
      {
        title: 'Section 34-39 - Data Subject Rights Enforcement',
        description: 'Nigerian citizens have rights to access, object to direct marketing, rectify inaccurate data, request erasure, and port personal data.',
        practicalAction: 'Maintain an internal ticketing queue to resolve Nigerian citizen privacy requests within 21 working days.'
      }
    ],
    mandatoryPoliciesAndSops: [
      { code: 'NDPR-POL-01', name: 'Nigerian Data Protection & Privacy Policy', type: 'POLICY', priority: 'CRITICAL', description: 'Aligns operations with NDPR 2019 and NDPA 2023 mandates.' },
      { code: 'NDPR-SOP-01', name: 'Annual DPCO Audit Filing & Compliance SOP', type: 'SOP', priority: 'CRITICAL', description: 'Schedule, internal readiness checklist, and NDPC portal submission by March 15.' },
      { code: 'NDPR-SOP-02', name: 'Data Subject Rights & Marketing Opt-Out SOP', type: 'SOP', priority: 'HIGH', description: 'Handles access, rectification, erasure, and opt-out of SMS/email marketing.' },
      { code: 'NDPR-SOP-03', name: '72-Hour NDPC Breach Notification & Mitigation SOP', type: 'SOP', priority: 'CRITICAL', description: 'Rapid reporting to NDPC National Incident Management Unit within 72 hours.' }
    ],
    departmentalGuidelines: {
      engineeringDevOps: [
        'Implement strong data encryption (AES-256) across all customer databases and mobile endpoints.',
        'Maintain detailed audit logs of all database queries accessing Nigerian national identity numbers (NIN) or phone numbers.',
        'Configure SMS and marketing pipelines to honor immediate opt-out / unsubscribe signals.'
      ],
      infosecRisk: [
        'Conduct bi-annual vulnerability assessments and maintain endpoint detection and response (EDR).',
        'Prepare technical documentation and log retention evidence for the annual licensed DPCO audit.',
        'Ensure high-availability backup systems with tested failovers located in compliant jurisdictions.'
      ],
      peopleHr: [
        'Collect and process employee data (including BVN/NIN for payroll) strictly under contractual/statutory obligations.',
        'Train HR and customer support staff on handling Nigerian data subject inquiries without unauthorized disclosure.',
        'Enforce nondisclosure agreements for all contractors accessing customer information.'
      ],
      legalFinance: [
        'Engage an accredited DPCO in Q4 of each year to prepare the annual audit filing before March 15th.',
        'Register as a Data Controller of Major Importance (DCMI) on the NDPC official portal.',
        'Ensure all digital marketing campaigns comply with explicit consent rules and do not purchase unauthorized phone/email lists.'
      ],
      executiveBoard: [
        'Sign off on the annual NDPC audit filing and allocate budget for the licensed DPCO engagement.',
        'Ensure the DPO has sufficient autonomy and budget to train staff and oversee data handling.',
        'Review the company regulatory standing on the NDPC published National Compliance Register.'
      ]
    },
    stepByStepImplementationChecklist: [
      { stepNumber: 1, phase: 'DCMI Registration', task: 'Register as a Data Controller of Major Importance on the NDPC official portal', deliverable: 'NDPC Registration Certificate', responsibleOwner: 'Legal Counsel / DPO' },
      { stepNumber: 2, phase: 'DPO Appointment', task: 'Formally appoint and register the Data Protection Officer with the NDPC', deliverable: 'DPO Letter of Designation & NDPC Portal Filing', responsibleOwner: 'Executive Leadership' },
      { stepNumber: 3, phase: 'Policy & Consent Revamp', task: 'Publish updated privacy policy referencing NDPA 2023 and update consumer consent forms', deliverable: 'Published NDPA Privacy Policy & Consent Logs', responsibleOwner: 'Product / Legal' },
      { stepNumber: 4, phase: 'DPCO Engagement', task: 'Retain licensed Data Protection Compliance Organization (DPCO) for annual audit', deliverable: 'DPCO Engagement Contract & Audit Scope', responsibleOwner: 'Procurement / DPO' },
      { stepNumber: 5, phase: 'Annual Audit Filing', task: 'Complete comprehensive audit and file official report with NDPC before March 15 deadline', deliverable: 'Stamped NDPC Audit Acceptance & Compliance Certificate', responsibleOwner: 'Licensed DPCO & DPO' },
      { stepNumber: 6, phase: 'Breach Response 72h SLA', task: 'Establish 72-hour incident notification protocol with the NDPC Enforcement Unit', deliverable: 'NDPC Incident Playbook & Simulation Evidence', responsibleOwner: 'CISO / Incident Lead' }
    ],
    commonAuditPitfalls: [
      'Missing the mandatory March 15th statutory deadline for filing the annual audit with the NDPC.',
      'Engaging an unlicensed consultant rather than an officially accredited DPCO for the annual filing.',
      'Purchasing third-party Nigerian phone/email lists for telemarketing without verifiable opt-in consent.',
      'Storing Nigerian citizen National Identification Numbers (NIN) or BVN in unencrypted plain text databases.',
      'Failure to register with the NDPC as a Data Controller of Major Importance (DCMI).'
    ],
    auditEvidenceArtifacts: [
      'Stamped NDPC Annual Audit Filing Confirmation (pre-March 15)',
      'NDPC Data Controller of Major Importance (DCMI) Certificate',
      'Data Protection Compliance Organization (DPCO) Verification Report',
      'NDPA Compliant Privacy Policy & Consent Records',
      'Data Protection Officer (DPO) Credentials & Appointment Notice',
      'Cross-Border Data Transfer Risk Assessments'
    ]
  },
  {
    id: 'fw_iso42001_2023',
    code: 'ISO/IEC 42001:2023',
    title: 'Artificial Intelligence Management System (AIMS)',
    authority: 'International Organization for Standardization (ISO) / IEC',
    jurisdiction: 'Global / International',
    category: 'ISO_STANDARDS',
    badgeColor: 'purple',
    effectiveDate: 'December 2023',
    scopeSummary: 'The first global certifiable management system standard specifically addressing the development, deployment, and operation of Artificial Intelligence systems. Covers AI governance, bias mitigation, data provenance, transparency, and AI impact assessments.',
    enforceability: 'CERTIFICATION_STANDARD',
    maximumPenalties: 'Loss of ISO 42001 certification, exclusion from enterprise AI vendor lists, potential EU AI Act regulatory fines (up to €35M or 7% global turnover).',
    incidentNotificationWindow: {
      authorityWindow: 'Internal AI incident escalation; external notifications governed by emerging AI safety directives and contracts',
      affectedPartiesWindow: 'Prompt notification if AI system hallucination or failure causes high-impact harm',
      description: 'Clause 8.4 and Annex B require continuous AI monitoring, algorithmic risk tracking, and prompt escalation of safety/bias incidents.',
      regulatoryBody: 'Accredited Certification Bodies & Emerging National AI Safety Institutes'
    },
    keyGovernancePrinciples: [
      {
        title: 'Clause 5.2 & Annex A.2 - AI Governance & Policy',
        description: 'Establish top management oversight, ethical AI principles, and explicit boundaries for acceptable vs. prohibited AI use cases.',
        practicalAction: 'Adopt an approved AI Acceptable Use & Governance Policy prohibiting unvetted public LLM usage with proprietary data.'
      },
      {
        title: 'Clause 6.1.2 & Annex A.3 - AI Impact Assessment (AIIA)',
        description: 'Conduct formal AI Impact Assessments evaluating societal impact, fairness, transparency, safety, and potential bias for every model deployed.',
        practicalAction: 'Require completed and approved AIIAs before any machine learning or LLM model is promoted to production.'
      },
      {
        title: 'Annex A.4 - Data Provenance & Training Quality',
        description: 'Maintain strict lineage of training, fine-tuning, and validation datasets. Prevent copyrighted, toxic, or poisoned data ingress.',
        practicalAction: 'Log data sources, preprocessing steps, and bias evaluation metrics in a centralized AI Model Registry.'
      },
      {
        title: 'Annex A.6 - Human Oversight & Model Explainability',
        description: 'Ensure human-in-the-loop (HITL) safeguards for autonomous decisions that significantly affect individuals, with explainability documentation.',
        practicalAction: 'Implement dual-review approval workflows for high-stakes automated decisions and maintain prompt/response audit trails.'
      }
    ],
    mandatoryPoliciesAndSops: [
      { code: 'AIMS-POL-01', name: 'Artificial Intelligence Governance & Ethics Policy', type: 'POLICY', priority: 'CRITICAL', description: 'Sets corporate AI principles, transparency rules, and prohibited AI uses.' },
      { code: 'AIMS-SOP-01', name: 'AI System Impact Assessment (AIIA) Procedure', type: 'SOP', priority: 'CRITICAL', description: 'Pre-deployment assessment of bias, safety, privacy, and hallucination risk.' },
      { code: 'AIMS-SOP-02', name: 'AI Model Provenance, Training & Registry SOP', type: 'SOP', priority: 'HIGH', description: 'Tracks dataset origins, fine-tuning weights, evaluation benchmarks, and versioning.' },
      { code: 'AIMS-SOP-03', name: 'Human-in-the-Loop (HITL) & AI Incident Response SOP', type: 'SOP', priority: 'HIGH', description: 'Procedures to override, rollback, or kill-switch errant AI models.' }
    ],
    departmentalGuidelines: {
      engineeringDevOps: [
        'Register all deployed models, embedding APIs, and LLM endpoints in a centralized Model Registry.',
        'Sanitize all training and prompt payloads to prevent prompt injection and PII leakage.',
        'Implement automated evaluation benchmarks tracking model drift, latency, and hallucination rates.',
        'Maintain instant model rollback mechanisms and circuit breakers.'
      ],
      infosecRisk: [
        'Assess AI supply chain risks (huggingface models, open-source weights, vector database security).',
        'Incorporate AI adversarial threat modeling (model inversion, adversarial perturbations, prompt injection).',
        'Ensure vector embeddings and RAG pipelines maintain tenant-level access isolation.'
      ],
      peopleHr: [
        'Prohibit use of automated AI screening tools for recruitment unless independently audited for demographic bias.',
        'Train all staff on corporate AI acceptable use and risks of inputting confidential data into external tools.',
        'Maintain human oversight in all performance evaluation and termination decisions.'
      ],
      legalFinance: [
        'Review intellectual property rights of training datasets and commercial licenses of foundation models.',
        'Ensure customer contracts transparently disclose AI-assisted outputs and disclaim warranties.',
        'Monitor emerging global AI regulations including the EU AI Act and national AI directives.'
      ],
      executiveBoard: [
        'Charter an AI Ethics & Risk Committee with multidisciplinary oversight.',
        'Approve the organization AI Risk Tolerance and strategic AI deployment roadmap.',
        'Ensure adequate resources for model safety verification and red teaming.'
      ]
    },
    stepByStepImplementationChecklist: [
      { stepNumber: 1, phase: 'AI Inventory', task: 'Catalog all active AI/ML models, third-party generative APIs, and automated decision engines', deliverable: 'AI System Inventory & Classification Matrix', responsibleOwner: 'AI / ML Lead' },
      { stepNumber: 2, phase: 'Policy & Ethics', task: 'Draft and adopt ISO 42001 AI Policy and establish AI Governance Committee', deliverable: 'Signed AI Policy & Committee Charter', responsibleOwner: 'CISO / CTO' },
      { stepNumber: 3, phase: 'Impact Assessment', task: 'Execute AI Impact Assessments (AIIA) for all high-risk or customer-facing AI features', deliverable: 'Completed AI Impact Assessment Reports', responsibleOwner: 'AI Ethics Lead' },
      { stepNumber: 4, phase: 'Model Governance', task: 'Implement model registry with data provenance tracking, bias testing, and version control', deliverable: 'Operational Model Registry & Benchmark Logs', responsibleOwner: 'MLOps Lead' },
      { stepNumber: 5, phase: 'Human Oversight', task: 'Configure human-in-the-loop validation for critical decisions and deploy prompt safety guardrails', deliverable: 'HITL Review Logs & Guardrail Configurations', responsibleOwner: 'Product / DevOps' },
      { stepNumber: 6, phase: 'Internal Audit & Cert', task: 'Conduct internal audit against ISO 42001 Clauses 4-10 and Annex A-D before stage 1 registrar audit', deliverable: 'ISO 42001 Internal Audit Report & SoA', responsibleOwner: 'Internal Auditor' }
    ],
    commonAuditPitfalls: [
      'Using external generative AI tools (ChatGPT, Claude) without an approved AI policy or enterprise data protection agreements.',
      'Deploying automated decision systems impacting humans without documented human-in-the-loop review mechanisms.',
      'Failing to document data provenance (auditors need to know where training/fine-tuning datasets originated).',
      'Treating AI systems as black boxes without conducting pre-deployment AI Impact Assessments.',
      'Missing model monitoring: failing to track model drift or demographic bias over time in production.'
    ],
    auditEvidenceArtifacts: [
      'Approved Artificial Intelligence Policy (Clause 5.2)',
      'AI System Statement of Applicability (SoA)',
      'AI Impact Assessments (AIIA) for Deployed Models',
      'AI Model Registry and Data Provenance Documentation',
      'Bias and Fairness Benchmark Evaluation Reports',
      'Human-in-the-Loop Review Minutes and Override Logs'
    ]
  },
  {
    id: 'fw_iso27701_2019',
    code: 'ISO/IEC 27701:2019',
    title: 'Privacy Information Management System (PIMS)',
    authority: 'International Organization for Standardization (ISO) / IEC',
    jurisdiction: 'Global / International',
    category: 'ISO_STANDARDS',
    badgeColor: 'teal',
    effectiveDate: 'August 2019',
    scopeSummary: 'Certified extension to ISO/IEC 27001 and ISO/IEC 27002 for privacy management. Provides guidance for establishing, implementing, maintaining, and continually improving a Privacy Information Management System (PIMS) for both PII Controllers and PII Processors.',
    enforceability: 'CERTIFICATION_STANDARD',
    maximumPenalties: 'Loss of ISO 27701 certification; elevated exposure to regulatory privacy enforcement.',
    incidentNotificationWindow: {
      authorityWindow: 'Aligned with applicable global privacy laws (e.g., GDPR 72h, NDPR 72h, DPDP 6h)',
      affectedPartiesWindow: 'Without undue delay per customer processing agreements and statutory thresholds',
      description: 'Clause 6.13 and Annex A/B require formal PII breach identification, prompt controller/processor notification, and CAPA.',
      regulatoryBody: 'Accredited Certification Bodies & National Privacy Authorities'
    },
    keyGovernancePrinciples: [
      {
        title: 'Clause 5 - PIMS Specific Guidance to ISO 27001',
        description: 'Integrates PII protection into ISMS context, leadership, risk assessment, and operational control.',
        practicalAction: 'Include privacy risk and PII asset identification in the unified risk register.'
      },
      {
        title: 'Clause 7 (Annex A) - PII Controller Specific Controls',
        description: 'Mandates privacy notice transparency, legal basis verification, consent mechanisms, and PII Principal rights fulfillment.',
        practicalAction: 'Document justifications for all PII collection and maintain self-service privacy rights workflows.'
      },
      {
        title: 'Clause 8 (Annex B) - PII Processor Specific Controls',
        description: 'Requirements for customer contract alignment, sub-processor management, and assisting controllers with DSAR requests.',
        practicalAction: 'Maintain an accurate subprocessor register and notify customers in advance of any subprocessor modifications.'
      }
    ],
    mandatoryPoliciesAndSops: [
      { code: 'PIMS-POL-01', name: 'Privacy Information Management System (PIMS) Policy', type: 'POLICY', priority: 'CRITICAL', description: 'Sets PII protection principles and controller/processor governance.' },
      { code: 'PIMS-SOP-01', name: 'PII De-identification & Pseudonymisation Procedure', type: 'SOP', priority: 'HIGH', description: 'Technical rules for tokenizing, anonymizing, and segregating PII.' },
      { code: 'PIMS-SOP-02', name: 'PII Breach Notification & Customer SLA SOP', type: 'SOP', priority: 'CRITICAL', description: 'Controller-to-processor and processor-to-controller notification steps.' }
    ],
    departmentalGuidelines: {
      engineeringDevOps: [
        'Apply cryptographic pseudonymisation to all PII fields stored in analytical or reporting databases.',
        'Ensure staging and testing environments use synthetic or scrubbed data rather than live production PII.',
        'Implement automated deletion jobs adhering strictly to published retention periods.'
      ],
      infosecRisk: [
        'Audit all systems storing PII for encryption at rest and in transit.',
        'Maintain unified privacy risk assessments alongside information security risks.',
        'Review sub-processor SOC 2 and ISO 27701 certifications annually.'
      ],
      peopleHr: [
        'Ensure employee PII is isolated with role-based permissions restricted strictly to HR administrators.',
        'Conduct regular training on PII handling, confidentiality, and data minimization.'
      ],
      legalFinance: [
        'Execute Data Processing Addenda (DPAs) reflecting ISO 27701 processor commitments.',
        'Maintain up-to-date customer notification mechanisms for subprocessor updates.'
      ],
      executiveBoard: [
        'Ensure management review agendas explicitly address PII protection metrics and privacy audit findings.'
      ]
    },
    stepByStepImplementationChecklist: [
      { stepNumber: 1, phase: 'PIMS Scoping', task: 'Determine whether operating as PII Controller, PII Processor, or both', deliverable: 'PIMS Role Determination & Scope Document', responsibleOwner: 'DPO / CISO' },
      { stepNumber: 2, phase: 'PII Inventory', task: 'Identify all PII repositories, processing activities, and transmission channels', deliverable: 'Comprehensive PII Inventory & Data Flow Map', responsibleOwner: 'Privacy Engineer' },
      { stepNumber: 3, phase: 'Privacy Risk Assessment', task: 'Perform dedicated privacy impact and risk assessment covering PII data subjects', deliverable: 'PII Risk Register & Treatment Plan', responsibleOwner: 'Risk Manager' },
      { stepNumber: 4, phase: 'Annex A / B Controls', task: 'Implement specific Controller (Annex A) and Processor (Annex B) privacy controls', deliverable: 'PIMS Statement of Applicability', responsibleOwner: 'Engineering / Legal' },
      { stepNumber: 5, phase: 'Audit & Certification', task: 'Conduct internal audit against ISO 27701 followed by external certification audit', deliverable: 'ISO 27701 Accredited Certificate', responsibleOwner: 'Internal Auditor' }
    ],
    commonAuditPitfalls: [
      'Attempting to achieve ISO 27701 certification without already having or concurrently certifying ISO 27001.',
      'Failing to separate controller obligations from processor obligations in operational procedures.',
      'Using live customer PII in software testing and development environments without anonymization.',
      'Missing notifications to customers prior to engaging new third-party cloud subprocessors.'
    ],
    auditEvidenceArtifacts: [
      'PIMS Statement of Applicability (Controllers & Processors)',
      'PII Flow Charts & Inventory Database',
      'Subprocessor Management & Notification Register',
      'De-identification and Encryption Verification Logs',
      'PIMS Internal Audit & Management Review Minutes'
    ]
  }
];

// Comparison Matrix across Regulatory Incident Deadlines, Penalties & Governance
export const REGULATORY_COMPARISON_MATRIX = [
  {
    framework: 'MAS TRM Guidelines',
    jurisdiction: 'Singapore (FIs)',
    incidentWindow: '1 HOUR',
    enforceability: 'Regulatory Directive / Mandatory for FIs',
    maxPenalty: 'License revocation, civil penalties, formal reprimands, capital surcharges',
    mandatoryRole: 'CISO / Head of Tech Risk',
    coreMandate: 'IT service availability (<=4h unscheduled downtime / rolling 12m), Red Teaming (AAS), MFA & API security',
    auditCycle: 'Annual MAS inspection / internal audit'
  },
  {
    framework: 'India DPDP Act 2023',
    jurisdiction: 'India',
    incidentWindow: '6 HOURS (CERT-In) + DPBI Notification',
    enforceability: 'Statutory Law / Strict Liability',
    maxPenalty: 'Up to ₹250 Crores (~$30M USD)',
    mandatoryRole: 'India-based Data Protection Officer (DPO)',
    coreMandate: 'Itemised notice in 22 languages, granular consent, ban on child tracking/behavioral ads, SDF obligations',
    auditCycle: 'Annual independent data audit for SDFs'
  },
  {
    framework: 'EU GDPR',
    jurisdiction: 'European Union / EEA',
    incidentWindow: '72 HOURS (DPA) / Without undue delay to subjects',
    enforceability: 'Statutory Regulation (2016/679)',
    maxPenalty: 'Up to €20M or 4% global turnover',
    mandatoryRole: 'Data Protection Officer (DPO Art 37)',
    coreMandate: '7 principles, ROPA (Art 30), DSARs in 30 days, Privacy by Design, Chapter V cross-border transfer SCCs',
    auditCycle: 'Continuous accountability / Periodic DPIA'
  },
  {
    framework: 'Nigeria NDPR & NDPA 2023',
    jurisdiction: 'Nigeria',
    incidentWindow: '72 HOURS (NDPC)',
    enforceability: 'Statutory Law / Act of National Assembly',
    maxPenalty: 'Up to ₦10,000,000 or 2% annual revenue',
    mandatoryRole: 'Data Protection Officer (DPO)',
    coreMandate: 'Mandatory annual audit filed by March 15 via licensed DPCO, DCMI registration, consumer consent',
    auditCycle: 'Annual audit filed with NDPC by March 15'
  },
  {
    framework: 'ISO/IEC 27001:2022',
    jurisdiction: 'Global / International',
    incidentWindow: 'Immediate triage & corrective actions without delay',
    enforceability: 'Voluntary Global Accredited Standard',
    maxPenalty: 'Loss of ISO certification, procurement disqualification',
    mandatoryRole: 'ISMS Management Representative / CISO',
    coreMandate: 'Clauses 4-10, 93 Annex A controls, 5x5 Risk Assessment, Statement of Applicability (SoA), Internal Audit',
    auditCycle: 'Annual Surveillance Audit / 3-Year Re-cert'
  },
  {
    framework: 'ISO/IEC 42001:2023',
    jurisdiction: 'Global / International',
    incidentWindow: 'Immediate algorithmic harm containment & escalation',
    enforceability: 'Voluntary Global AI Standard',
    maxPenalty: 'Loss of certification, EU AI Act non-compliance risk',
    mandatoryRole: 'AI Ethics & Governance Lead',
    coreMandate: 'AI system inventory, AI Impact Assessments (AIIA), data provenance, human oversight, model safety',
    auditCycle: 'Annual Surveillance Audit / 3-Year Re-cert'
  }
];
