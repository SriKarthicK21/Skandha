export interface FrameworkFocusArea {
  domain: string;
  description: string;
  keyControls: string[];
  whatStakeholderNeedsToKnow: string;
  typicalEvidenceToPrepare: string[];
}

export interface FrameworkScopeDetails {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  standardBody: string;
  badgeColor: string;
  accentColor: string;
  overviewSummary: string;
  primaryClausesOrDomains: string;
  interviewFocusAreas: FrameworkFocusArea[];
  targetRolesToInterview: string[];
  auditOutcomeDeliverable: string;
  stakeholderScopeFaqs: Array<{
    question: string;
    answer: string;
  }>;
}

export const FRAMEWORK_PREVIEWS_CATALOG: Record<string, FrameworkScopeDetails> = {
  'ISO/IEC 27001:2022': {
    id: 'ISO/IEC 27001:2022',
    name: 'ISO/IEC 27001:2022 Information Security Management System (ISMS)',
    shortName: 'ISO 27001:2022',
    tagline: 'Global benchmark for organizational information security risk management & 93 Annex A controls',
    standardBody: 'ISO / IEC JTC 1/SC 27 (International Organization for Standardization)',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    accentColor: 'text-sky-400',
    overviewSummary:
      'ISO/IEC 27001:2022 requires organizations to systematically evaluate information security risks taking into account threats, vulnerabilities, and impacts. The interview focuses on how your department manages data, applies day-to-day controls, and prevents security incidents.',
    primaryClausesOrDomains: 'Clauses 4–10 (ISMS Governance) & 93 Annex A Controls across Organizational, People, Physical, and Technological domains',
    interviewFocusAreas: [
      {
        domain: 'Access Control & Authentication (A.5.15, A.8.5)',
        description: 'Verification of least privilege, multi-factor authentication (MFA), role-based access, and periodic access reviews.',
        keyControls: ['A.5.15 Access Control', 'A.5.18 Access Rights', 'A.8.5 Secure Authentication'],
        whatStakeholderNeedsToKnow: 'Be prepared to explain how accounts are requested, approved, provisioned, and decommissioned when staff depart.',
        typicalEvidenceToPrepare: ['Access request tickets', 'Okta / Azure AD group membership exports', 'Quarterly access review sign-off records']
      },
      {
        domain: 'Operational Security & System Maintenance (A.8.7, A.8.8, A.8.19)',
        description: 'Review of technical vulnerability management, malware protection, patch schedules, and production environment segregation.',
        keyControls: ['A.8.7 Malware Protection', 'A.8.8 Technical Vulnerabilities', 'A.8.31 Separation of Environments'],
        whatStakeholderNeedsToKnow: 'The interviewer will verify how you stay informed of high/critical vulnerabilities and your team’s patching cadence.',
        typicalEvidenceToPrepare: ['Snyk / Dependabot / AWS Inspector vulnerability scan reports', 'Production deployment approval logs']
      },
      {
        domain: 'Data Protection, Cryptography & Backup (A.8.11, A.8.13, A.8.24)',
        description: 'Assessment of data classification, at-rest/in-transit encryption, backup frequency, and restoration testing.',
        keyControls: ['A.8.11 Data Masking', 'A.8.13 Information Backup', 'A.8.24 Cryptography'],
        whatStakeholderNeedsToKnow: 'Explain where sensitive customer/corporate data resides, how it is encrypted, and when backups were last successfully tested.',
        typicalEvidenceToPrepare: ['AWS KMS / Vault encryption settings', 'Automated snapshot schedules', 'Quarterly backup restoration drill report']
      },
      {
        domain: 'People Security & Awareness (A.6.1–A.6.5)',
        description: 'Pre-employment screening, signed acceptable use agreements, ongoing security training, and incident escalation channels.',
        keyControls: ['A.6.1 Screening', 'A.6.2 Terms of Employment', 'A.6.3 Security Awareness'],
        whatStakeholderNeedsToKnow: 'You will be asked about security onboarding, phishing simulations, and reporting procedures for suspected phishing or breaches.',
        typicalEvidenceToPrepare: ['Security awareness training completion rosters', 'Signed Acceptable Use Policy records']
      }
    ],
    targetRolesToInterview: [
      'Engineering & DevOps Leads',
      'Cloud Infrastructure Architects',
      'People Ops / HR Business Partners',
      'Legal & Corporate Risk Counsel',
      'Department Heads & Operational Managers'
    ],
    auditOutcomeDeliverable: 'Annex A Operational Working Paper & Clause 9.2 Evidence Dossier for Stage 1/2 External Audit Certification',
    stakeholderScopeFaqs: [
      {
        question: 'Is this interview a pass/fail test on me personally?',
        answer: 'No. The interview evaluates the operating effectiveness of corporate processes and technical controls, not personal performance. Any identified gaps help prioritize remediation before external certification audits.'
      },
      {
        question: 'What if our team handles a control informally without a written policy?',
        answer: 'State how you actually perform the workflow in practice. The GRC team will document your current operational practice into formal Standard Operating Procedures (SOPs).'
      },
      {
        question: 'Are my answers kept confidential?',
        answer: 'Yes. In accordance with ISO 27001 Clause 7.5 and internal NDA rules, all session notes, recordings, and working papers are strictly confidential and restricted to accredited audit purposes.'
      }
    ]
  },

  'ISO/IEC 42001:2023': {
    id: 'ISO/IEC 42001:2023',
    name: 'ISO/IEC 42001:2023 Artificial Intelligence Management System (AIMS)',
    shortName: 'ISO 42001:2023',
    tagline: 'First international standard for trustworthy, ethical, and responsible enterprise AI lifecycle governance',
    standardBody: 'ISO / IEC JTC 1/SC 42 (Artificial Intelligence Committee)',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    accentColor: 'text-purple-400',
    overviewSummary:
      'ISO/IEC 42001:2023 establishes requirements for developing, deploying, or utilizing AI systems responsibly. The interview focuses on training data lineage, algorithmic fairness, model explainability, hallucination safeguards, and human-in-the-loop oversight.',
    primaryClausesOrDomains: 'Clauses 4–10 (AIMS Governance) & 38 Annex A Controls across Data, Model Lifecycle, Impact Assessment, and Human Oversight',
    interviewFocusAreas: [
      {
        domain: 'AI System Inventory & Lifecycle Scoping (A.6.1, A.6.2)',
        description: 'Cataloging of all deployed foundation models, proprietary LLM fine-tunes, external AI APIs, and algorithmic risk classifications.',
        keyControls: ['A.6.1 AI System Inventory', 'A.6.2 AI Impact Assessment'],
        whatStakeholderNeedsToKnow: 'Be ready to explain what AI models your department uses, whether inputs touch customer data, and how high-risk use cases are vetted.',
        typicalEvidenceToPrepare: ['AI Model Card register', 'Algorithmic impact assessment reports', 'API vendor contracts (e.g. OpenAI / Anthropic / Google)']
      },
      {
        domain: 'Data Quality & Provenance for AI (A.9.1, A.9.2, A.9.3)',
        description: 'Verification of training, validation, and prompt-tuning dataset sources, licensing, bias mitigation, and synthetic data validation.',
        keyControls: ['A.9.1 Data Acquisition', 'A.9.2 Training Data Quality', 'A.9.3 Provenance & Lineage'],
        whatStakeholderNeedsToKnow: 'Explain where data fed into AI models originates, whether copyrighted or personal data is present, and how data quality is validated.',
        typicalEvidenceToPrepare: ['Data lineage flowcharts', 'Data scrubbing / sanitization scripts', 'Copyright & licensing manifests']
      },
      {
        domain: 'Human Oversight & Fallback Safeguards (A.10.3, A.10.4)',
        description: 'Human-in-the-loop (HITL) approval gates, manual override mechanisms, hallucination guardrails, and automated circuit breakers.',
        keyControls: ['A.10.3 Human Oversight', 'A.10.4 System Robustness'],
        whatStakeholderNeedsToKnow: 'The interviewer will examine whether AI recommendations can autonomously affect customers without human review.',
        typicalEvidenceToPrepare: ['Human-in-the-loop review workflow diagrams', 'Evaluation benchmark test suites (eval sets)']
      }
    ],
    targetRolesToInterview: [
      'Machine Learning Engineers & Data Scientists',
      'AI Product Managers',
      'Data Governance Leads',
      'Chief Technology Officer (CTO) & AI Ethicists'
    ],
    auditOutcomeDeliverable: 'AIMS AI Risk Register, Algorithmic Impact Assessment (AIIA), and Annex A.2–A.10 Statement of Applicability',
    stakeholderScopeFaqs: [
      {
        question: 'Does this apply if we only use 3rd-party AI APIs like ChatGPT or Claude?',
        answer: 'Yes. ISO 42001 distinguishes between AI developers and AI deployers/users. Deploying external AI requires vendor risk assessment, prompt data confidentiality controls, and output validation.'
      },
      {
        question: 'What constitutes a "High Impact" AI system under ISO 42001?',
        answer: 'AI systems influencing credit decisions, hiring, sensitive legal assessments, biometric processing, or handling regulated PII require rigorous impact assessments and documented human oversight.'
      }
    ]
  },

  'ISO/IEC 27701:2019': {
    id: 'ISO/IEC 27701:2019',
    name: 'ISO/IEC 27701:2019 Privacy Information Management System (PIMS)',
    shortName: 'ISO 27701:2019',
    tagline: 'Privacy management extension to ISO 27001 for GDPR, CCPA, and statutory PII protection',
    standardBody: 'ISO / IEC JTC 1/SC 27 (Privacy & Data Protection Sub-Committee)',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    accentColor: 'text-emerald-400',
    overviewSummary:
      'ISO/IEC 27701:2019 specifies requirements for processing Personally Identifiable Information (PII) acting as either a PII Controller or PII Processor. The interview examines data consent records, privacy notices, subject access requests (DSARs), and data minimization.',
    primaryClausesOrDomains: 'Clauses 5–8 & Annex A (PII Controllers) and Annex B (PII Processors) privacy guidance',
    interviewFocusAreas: [
      {
        domain: 'Consent, Privacy Notices & Lawful Basis (Clause 7.2 / Annex A)',
        description: 'Evaluation of how user consent is acquired, privacy notices displayed, and legal basis documented for every processing purpose.',
        keyControls: ['Clause 7.2.1 Lawful Basis', 'Clause 7.2.2 Consent Verification', 'Clause 7.2.3 Privacy Notice Delivery'],
        whatStakeholderNeedsToKnow: 'Be prepared to show where customers accept privacy terms, how opt-outs work, and how cookie banners function.',
        typicalEvidenceToPrepare: ['Live signup privacy notice screenshots', 'Consent audit database logs', 'Cookie consent banner configuration']
      },
      {
        domain: 'Data Subject Rights & DSAR Workflows (Clause 7.3)',
        description: 'Inspection of technical capability to execute right to erasure (deletion), data portability, rectification, and access requests within statutory SLAs.',
        keyControls: ['Clause 7.3.1 Subject Access', 'Clause 7.3.4 Right to Erasure', 'Clause 7.3.7 Withdrawal of Consent'],
        whatStakeholderNeedsToKnow: 'Explain the operational workflow when a customer submits a deletion request. Across which databases and backups is data wiped?',
        typicalEvidenceToPrepare: ['DSAR tracking ticket queue', 'Automated account deletion script documentation']
      },
      {
        domain: 'Data Transfer & Third-Party Processors (Clause 7.5 / Annex B)',
        description: 'Cross-border data transfers, Standard Contractual Clauses (SCCs), vendor Data Protection Agreements (DPAs), and subprocessors.',
        keyControls: ['Clause 7.5.1 International Transfers', 'Clause 7.5.2 Subprocessor Audits'],
        whatStakeholderNeedsToKnow: 'Review which 3rd-party SaaS providers or international data centers process your department’s customer personal data.',
        typicalEvidenceToPrepare: ['Signed Data Protection Agreements (DPAs)', 'Master Subprocessor list']
      }
    ],
    targetRolesToInterview: [
      'Data Protection Officer (DPO)',
      'Customer Support & Operations Leads',
      'Database Administrators',
      'Frontend / Product Engineers',
      'Legal & Compliance Officers'
    ],
    auditOutcomeDeliverable: 'PIMS Record of Processing Activities (RoPA), Privacy Impact Assessment (DPIA), and Annex A/B SoA',
    stakeholderScopeFaqs: [
      {
        question: 'Does ISO 27701 certify compliance with GDPR?',
        answer: 'ISO 27701 is recognized globally by privacy regulators as comprehensive evidence of GDPR, CCPA, and DPDP accountability and technical measures.'
      }
    ]
  },

  'MAS TRM Guidelines': {
    id: 'MAS TRM Guidelines',
    name: 'MAS Technology Risk Management (TRM) Guidelines 2024',
    shortName: 'MAS TRM 2024',
    tagline: 'Statutory regulatory cyber hygiene mandates & 1-hour incident reporting for Singapore-licensed institutions',
    standardBody: 'Monetary Authority of Singapore (MAS Notices 644, 655 & TRM Guidelines)',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    accentColor: 'text-rose-400',
    overviewSummary:
      'The MAS TRM Guidelines mandate rigorous cyber hygiene, multi-factor authentication, privileged access segregation, and immediate statutory notification (within 1 hour) for critical system outages or security breaches affecting financial services.',
    primaryClausesOrDomains: '15 TRM Domains covering Critical Systems, RTO/RPO, Cyber Hygiene (Notice 655), and Statutory Incident Notice 644',
    interviewFocusAreas: [
      {
        domain: 'Notice 655 Cyber Hygiene Binding Controls',
        description: 'Mandatory enforcement of multi-factor authentication, perimeter network firewalls, host baseline security, and access control.',
        keyControls: ['Notice 655 Mandatory MFA', 'Notice 655 Anti-Malware', 'Notice 655 Perimeter Defense'],
        whatStakeholderNeedsToKnow: 'MFA is legally non-negotiable for all administrative access. The interviewer will test zero-standing-privilege policies.',
        typicalEvidenceToPrepare: ['MFA enforcement screenshots on AWS/GCP root and admin consoles', 'Firewall rule change approval logs']
      },
      {
        domain: 'Critical System Recovery & RTO/RPO Standards (Section 5)',
        description: 'Verification that critical customer-facing systems maintain a Maximum Tolerable Downtime (MTD) of under 4 hours and unscheduled downtime under 4 hours/year.',
        keyControls: ['Section 5.1 System Availability', 'Section 5.2 Disaster Recovery RTO < 4h'],
        whatStakeholderNeedsToKnow: 'Be prepared to share the latest annual disaster recovery drill report showing verified failover times.',
        typicalEvidenceToPrepare: ['Annual DR failover drill report with timestamped logs', 'RTO/RPO architecture diagram']
      },
      {
        domain: 'Notice 644 1-Hour Incident Triage Protocol (Section 12)',
        description: 'Validation that security operations or engineering can triage a severe outage and dispatch MAS Form IT-01 within 60 minutes.',
        keyControls: ['Notice 644 1-Hour Notification', 'TRM 12.1 Incident Classification'],
        whatStakeholderNeedsToKnow: 'Explain who is empowered on-call to declare a critical incident and dispatch statutory notifications to the Monetary Authority.',
        typicalEvidenceToPrepare: ['Incident Response Runbook with MAS escalation flow', 'Form IT-01 template']
      }
    ],
    targetRolesToInterview: [
      'Site Reliability Engineers (SRE)',
      'Security Operations Center (SOC) Leads',
      'APAC Managing Directors',
      'Principal Cloud Infrastructure Engineers'
    ],
    auditOutcomeDeliverable: 'MAS TRM 15-Domain Compliance Assessment & Board Attestation Pack (Form IT-01 Certified)',
    stakeholderScopeFaqs: [
      {
        question: 'What happens if a critical system exceeds the 4-hour RTO during an actual incident?',
        answer: 'MAS requires a formal root cause analysis within 14 days and remediation commitments reviewed directly by the Board and MAS supervisory officers.'
      }
    ]
  },

  'DPDP Act 2023': {
    id: 'DPDP Act 2023',
    name: 'Digital Personal Data Protection Act 2023 (India)',
    shortName: 'DPDP Act 2023',
    tagline: 'Statutory compliance framework for Data Fiduciaries processing Indian residents’ digital personal data',
    standardBody: 'Ministry of Electronics and Information Technology (MeitY) & Data Protection Board (DPB)',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    accentColor: 'text-amber-400',
    overviewSummary:
      'The DPDP Act 2023 establishes strict accountability for Data Fiduciaries in India. The interview reviews multilingual consent notices in all 22 scheduled languages, children’s data restrictions, parental consent mechanisms, and the 6-hour CERT-In/DPB breach reporting SLA.',
    primaryClausesOrDomains: 'Sections 4–16 covering Notice, Consent, Children Data (Sec 9), Retention/Purge (Sec 8), and Breach Reporting',
    interviewFocusAreas: [
      {
        domain: 'Notice & Itemized Consent in 22 Languages (Section 5 & 6)',
        description: 'Ensuring personal data is collected with clear, plain-language notices available in English and the 22 Eighth Schedule Indian languages.',
        keyControls: ['Section 5 Notice Delivery', 'Section 6 Affirmative Consent'],
        whatStakeholderNeedsToKnow: 'Show how user consent is unbundled (no dark patterns or pre-ticked checkboxes) and recorded with immutable timestamps.',
        typicalEvidenceToPrepare: ['Multilingual consent notice wireframes', 'Consent ledger database schema']
      },
      {
        domain: 'Children’s Data & Verifiable Parental Consent (Section 9)',
        description: 'Mandatory prohibition on behavioral tracking, profiling, or targeted advertising directed at individuals under 18 years of age.',
        keyControls: ['Section 9(1) Age Verification', 'Section 9(3) No Tracking of Minors'],
        whatStakeholderNeedsToKnow: 'Explain age-gating mechanisms and how verifiable parental consent is validated prior to processing child data.',
        typicalEvidenceToPrepare: ['Age verification logic flowcharts', 'Ad targeting exclusion policy']
      },
      {
        domain: 'Mandatory Breach Notice & Data Purge Schedules (Section 8)',
        description: 'Obligation to notify the Data Protection Board and affected users of any personal data breach without delay, and purge data upon purpose completion.',
        keyControls: ['Section 8(6) Breach Notification', 'Section 8(7) Erasure upon Purpose Fulfillment'],
        whatStakeholderNeedsToKnow: 'Describe automated data retention schedules and how data is erased once the user closes their account.',
        typicalEvidenceToPrepare: ['Automated TTL / deletion cron jobs', 'Breach response runbook']
      }
    ],
    targetRolesToInterview: [
      'India Compliance Counsel & DPO',
      'Mobile App & Web Product Managers',
      'Marketing & Analytics Teams',
      'Security Incident Response Team'
    ],
    auditOutcomeDeliverable: 'DPDP Act Statutory Readiness Assessment & Section 8/9 Technical Controls Certification',
    stakeholderScopeFaqs: [
      {
        question: 'What are the penalties under DPDP Act 2023?',
        answer: 'Fines reach up to ₹250 Crore (approx. $30M USD) per incident for failures to implement reasonable security safeguards to prevent a personal data breach.'
      }
    ]
  },

  'SOC 2 Type II': {
    id: 'SOC 2 Type II',
    name: 'SOC 2 Type II (AICPA Trust Services Criteria)',
    shortName: 'SOC 2 Type II',
    tagline: 'Auditor-attested operating effectiveness across Security, Availability, and Confidentiality over a 6-12 month observation window',
    standardBody: 'American Institute of CPAs (AICPA Assurance Services Executive Committee)',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    accentColor: 'text-indigo-400',
    overviewSummary:
      'SOC 2 Type II tests whether security controls operated effectively over a minimum 6-month historical period. The interview focuses on sampling evidence (tickets, logs, approvals) across change management, background checks, and incident response.',
    primaryClausesOrDomains: 'Trust Services Criteria: Common Criteria (Security CC1–CC9), Availability (A1), and Confidentiality (C1)',
    interviewFocusAreas: [
      {
        domain: 'Change Management & CI/CD Pipeline Gates (CC8.1)',
        description: 'Auditor inspection of randomly sampled software deployments over the audit period to verify test results, approvals, and segregation of dev/prod.',
        keyControls: ['CC8.1 Change Authorization', 'CC8.2 Release Management'],
        whatStakeholderNeedsToKnow: 'The auditor will pull 25 random git commits from the last 6 months. Every single commit must have documented PR approval and passing CI tests.',
        typicalEvidenceToPrepare: ['GitHub / GitLab PR approval histories', 'CI/CD pipeline build logs']
      },
      {
        domain: 'Logical Access & Terminated Employee Deprovisioning (CC6.1, CC6.2, CC6.3)',
        description: 'Sampling HR departure dates against IT Okta/Google Workspace deprovisioning timestamps to prove access was revoked within 24 hours.',
        keyControls: ['CC6.1 IAM RBAC', 'CC6.3 Deprovisioning SLA < 24h'],
        whatStakeholderNeedsToKnow: 'Be prepared to show access revocation timestamps for employees who departed during the 6-month observation window.',
        typicalEvidenceToPrepare: ['Sample of 15 departed employee tickets showing IT deprovisioning time']
      },
      {
        domain: 'Risk Assessment & Vendor Due Diligence (CC3.1, CC9.2)',
        description: 'Annual vendor risk evaluations, SOC 2 report reviews for subservice organizations, and continuous vulnerability remediation.',
        keyControls: ['CC3.1 Risk Assessment', 'CC9.2 Vendor Management'],
        whatStakeholderNeedsToKnow: 'Explain how you assess new SaaS software tools before engineering integrates them into production.',
        typicalEvidenceToPrepare: ['Vendor security questionnaires', 'Third-party SOC 2 Type II review memos']
      }
    ],
    targetRolesToInterview: [
      'DevOps & Release Engineers',
      'IT Administration Leads',
      'Engineering Managers',
      'Procurement & HR Operations'
    ],
    auditOutcomeDeliverable: 'SOC 2 Type II Control Matrix & Auditor Population Sample Workbook',
    stakeholderScopeFaqs: [
      {
        question: 'How is SOC 2 Type II different from Type I?',
        answer: 'Type I verifies controls at a single point in time. Type II samples historical evidence across a 6 to 12 month window to prove controls operated without failure.'
      }
    ]
  },

  'NIST CSF 2.0': {
    id: 'NIST CSF 2.0',
    name: 'NIST Cybersecurity Framework 2.0',
    shortName: 'NIST CSF 2.0',
    tagline: 'Updated multi-tier enterprise cybersecurity standard covering GOVERN, Identify, Protect, Detect, Respond, and Recover',
    standardBody: 'National Institute of Standards and Technology (U.S. Department of Commerce)',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    accentColor: 'text-blue-400',
    overviewSummary:
      'NIST CSF 2.0 organizes cybersecurity into 6 core functions with an expanded emphasis on cybersecurity governance (GV). The interview establishes maturity tier scoring and assesses threat detection, continuous monitoring, and incident recovery capabilities.',
    primaryClausesOrDomains: '6 Functions: GOVERN (GV), IDENTIFY (ID), PROTECT (PR), DETECT (DE), RESPOND (RS), RECOVER (RC)',
    interviewFocusAreas: [
      {
        domain: 'GOVERN (GV) - Organizational Context & Risk Strategy',
        description: 'Evaluating leadership oversight, cybersecurity roles, enterprise risk tolerance, and supply chain cybersecurity risk management.',
        keyControls: ['GV.OC Organizational Context', 'GV.RM Risk Strategy', 'GV.SC Supply Chain'],
        whatStakeholderNeedsToKnow: 'Discuss executive reporting, risk ownership, and communication between business leaders and technical teams.',
        typicalEvidenceToPrepare: ['Cybersecurity Charter', 'Executive Risk Register']
      },
      {
        domain: 'DETECT (DE) & Continuous Monitoring (DE.CM)',
        description: 'Inspection of real-time telemetry, automated SIEM alerts, network anomaly detection, and vulnerability scanning.',
        keyControls: ['DE.CM Continuous Monitoring', 'DE.AE Anomaly & Event Detection'],
        whatStakeholderNeedsToKnow: 'Explain what monitoring tools your team watches and who gets paged when an unauthorized privilege escalation occurs.',
        typicalEvidenceToPrepare: ['SIEM / Datadog alert configuration', 'Synthetic alert drill results']
      },
      {
        domain: 'RESPOND (RS) & RECOVER (RC) Execution',
        description: 'Testing incident containment speed, evidence preservation, internal/external communications, and post-incident lessons learned.',
        keyControls: ['RS.MA Incident Management', 'RC.RP Recovery Planning'],
        whatStakeholderNeedsToKnow: 'Walk through the most recent incident or tabletop simulation exercise conducted by your department.',
        typicalEvidenceToPrepare: ['Tabletop exercise after-action report (AAR)', 'Post-mortem reports']
      }
    ],
    targetRolesToInterview: [
      'Chief Information Security Officer (CISO)',
      'Security Operations Center (SOC) Engineers',
      'Incident Response Commanders',
      'Enterprise Risk Officers'
    ],
    auditOutcomeDeliverable: 'NIST CSF 2.0 Maturity Profile (Current vs. Target Tier) & Gap Remediation Roadmap',
    stakeholderScopeFaqs: [
      {
        question: 'What are NIST CSF Implementation Tiers?',
        answer: 'Tiers 1 to 4 characterize cybersecurity risk governance from Partial/Informal (Tier 1) to Adaptive/Real-Time (Tier 4).'
      }
    ]
  },

  'ISO 22301:2019': {
    id: 'ISO 22301:2019',
    name: 'ISO 22301:2019 Business Continuity Management System (BCMS)',
    shortName: 'ISO 22301:2019',
    tagline: 'International standard for organizational resilience, Business Impact Analysis (BIA), and disaster survival',
    standardBody: 'ISO / TC 292 (Security and Resilience Technical Committee)',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    accentColor: 'text-teal-400',
    overviewSummary:
      'ISO 22301:2019 ensures the organization can maintain critical business operations during and after a severe disruptive event (ransomware, cloud outage, natural disaster). The interview quantifies recovery time objectives (RTO), maximum tolerable outages (MTO), and validates crisis communication runbooks.',
    primaryClausesOrDomains: 'Clauses 4–10 with deep focus on Clause 8.2 Business Impact Analysis (BIA) and 8.4 Business Continuity Plans (BCP)',
    interviewFocusAreas: [
      {
        domain: 'Business Impact Analysis (BIA) & MTO Quantification (Clause 8.2)',
        description: 'Determining the financial and operational impact over time if departmental operations or applications go offline.',
        keyControls: ['Clause 8.2.2 BIA', 'Clause 8.2.3 Risk Assessment for Continuity'],
        whatStakeholderNeedsToKnow: 'Be prepared to state how many hours your department can survive without primary systems before regulatory or customer penalties trigger.',
        typicalEvidenceToPrepare: ['Completed Departmental BIA worksheet', 'Customer SLA contracts']
      },
      {
        domain: 'Business Continuity & Disaster Recovery Plans (Clause 8.4)',
        description: 'Documented step-by-step procedures for failover, alternate processing sites, critical staff backups, and emergency communication channels.',
        keyControls: ['Clause 8.4.2 Response Structure', 'Clause 8.4.4 Continuity Procedures'],
        whatStakeholderNeedsToKnow: 'Explain where emergency contact trees are stored and how staff communicate if corporate Slack or Google Workspace is unavailable.',
        typicalEvidenceToPrepare: ['Off-network emergency contact call tree', 'Secondary communication channel credentials']
      },
      {
        domain: 'Testing, Exercising & Drills (Clause 8.5)',
        description: 'Validation that business continuity plans are rehearsed through desktop walkthroughs or live failovers at least annually.',
        keyControls: ['Clause 8.5 Exercise & Testing'],
        whatStakeholderNeedsToKnow: 'Provide date and results from your department’s most recent continuity exercise or tabletop simulation.',
        typicalEvidenceToPrepare: ['Annual tabletop exercise sign-off report', 'Lessons learned register']
      }
    ],
    targetRolesToInterview: [
      'Business Unit Leaders & Process Owners',
      'Disaster Recovery Coordinators',
      'Customer Support Directors',
      'Finance & Payroll Managers'
    ],
    auditOutcomeDeliverable: 'Departmental BIA Matrix, Recovery Strategy Document & BCP Exercise Log',
    stakeholderScopeFaqs: [
      {
        question: 'What is the difference between RTO and MTO?',
        answer: 'Maximum Tolerable Outage (MTO) is the absolute deadline before irreparable organizational damage occurs. Recovery Time Objective (RTO) is the target time set by your team to restore operations well before reaching the MTO.'
      }
    ]
  }
};
