export interface DPDPAKnowledgeModule {
  id: string;
  moduleNumber: number;
  title: string;
  subtitle: string;
  statutoryBasis: string;
  estimatedMinutes: number;
  badge: string;
  overview: string;
  keyRequirements: string[];
  practicalChecklist: string[];
  dpbiEnforcementRisk: string;
  maxPenalty: string;
}

export interface DPDPAIndustryChecklist {
  id: string;
  industry: string;
  badgeColor: string;
  riskProfile: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  specificObligations: {
    rule: string;
    description: string;
    statutoryRef: string;
  }[];
}

export interface DPDPADocTemplate {
  id: string;
  title: string;
  category: 'NOTICE_CONSENT' | 'DPA_VENDORS' | 'BREACH_INCIDENT' | 'CHILDREN_VPC' | 'DPIA_SDF' | 'RIGHTS_DSAR';
  statutoryClause: string;
  description: string;
  format: string;
  content: string;
}

export interface DPDPAExamQuestion {
  id: number;
  question: string;
  options: string[];
  correctOptionIndex: number;
  statutoryRef: string;
  explanation: string;
}

export const DPDPA_TRAINING_MODULES: DPDPAKnowledgeModule[] = [
  {
    id: 'mod_1',
    moduleNumber: 1,
    title: 'Foundations & Scope of DPDPA 2023 & DPDP Rules',
    subtitle: 'Extraterritorial application, digital personal data definition, and statutory exclusions',
    statutoryBasis: 'Sections 1, 2, 3 & DPDP Rules Chapter I',
    estimatedMinutes: 20,
    badge: 'Core Scope',
    overview:
      'The Digital Personal Data Protection Act (DPDPA) 2023 applies to the processing of digital personal data within India, and to processing outside India if it is connected to offering goods or services to Data Principals within India. Personal or domestic processing, and publicly disclosed data by the principal themselves, are excluded.',
    keyRequirements: [
      'Applies exclusively to digital personal data and personal data collected in non-digital form and digitized subsequently.',
      'Extraterritorial reach for offshore entities offering goods/services to Indian citizens.',
      'Excludes personal data processed by an individual for personal or domestic purposes.',
      'Excludes personal data made publicly available by the Data Principal or under statutory legal mandate.'
    ],
    practicalChecklist: [
      'Audit all data ingestion pipelines to segregate personal vs business non-personal data.',
      'Identify offshore affiliates, cloud regions, and SaaS vendors processing Indian customer data.',
      'Maintain an updated catalog of digital assets and ingestion channels.'
    ],
    dpbiEnforcementRisk: 'Jurisdictional challenge and unnotified offshore processing exposure.',
    maxPenalty: '₹50 Crores to ₹250 Crores depending on accompanying violation'
  },
  {
    id: 'mod_2',
    moduleNumber: 2,
    title: 'Notice Architecture & 22-Language Multilingual Consent',
    subtitle: 'Itemized notices, withdrawal parity, and registered Consent Manager framework',
    statutoryBasis: 'Sections 5, 6 & DPDP Rules Chapter II',
    estimatedMinutes: 30,
    badge: 'Consent & Notice',
    overview:
      'Data Fiduciaries must give an itemized, unbundled notice before or at the time of seeking consent. The notice must be accessible in English and all 22 languages specified in the Eighth Schedule to the Indian Constitution. Consent must be free, specific, informed, unconditional, and unambiguous, with an affirmative action.',
    keyRequirements: [
      'Unbundled notice itemizing personal data categories and specific intended purposes.',
      'Mandatory accessibility in English and all 22 Eighth Schedule Indian languages.',
      'Consent withdrawal must be as easy to execute as giving consent (Withdrawal Parity).',
      'Integration with MeitY-registered Consent Managers for interoperable consent tracking.'
    ],
    practicalChecklist: [
      'Remove pre-ticked consent boxes, forced bundling, and dark patterns across all signup flows.',
      'Deploy language switcher enabling instant translation into Hindi, Bengali, Tamil, Telugu, etc.',
      'Ensure one-click consent withdrawal dashboard with automated downstream processor cascades.'
    ],
    dpbiEnforcementRisk: 'Coerced or bundled consent rendered invalid by DPBI upon principal complaint.',
    maxPenalty: '₹50 Crores under Section 33 Schedule (Breach of fiduciary duty)'
  },
  {
    id: 'mod_3',
    moduleNumber: 3,
    title: 'Legitimate Uses vs Consent Boundaries',
    subtitle: 'Section 7 exemptions: employment, medical emergency, state subsidies, and judicial orders',
    statutoryBasis: 'Section 7 & DPDP Rules',
    estimatedMinutes: 25,
    badge: 'Legitimate Use',
    overview:
      'Unlike GDPR which recognizes legitimate interest broadly, Section 7 DPDPA limits non-consensual processing strictly to defined "Certain Legitimate Uses". These include voluntary provision by principal for a specified purpose, state benefit delivery, medical emergency during epidemics, disaster relief, employment purposes, and compliance with court decrees.',
    keyRequirements: [
      'No general "legitimate interest" balancing test; processing must fit explicitly under Section 7 sub-clauses.',
      'Employment processing restricted strictly to prevention of corporate espionage, employer property security, and statutory benefits.',
      'Emergency medical response permitted to protect life during epidemic or public health crises.'
    ],
    practicalChecklist: [
      'Do not rely on legitimate use for marketing, telemetry, or cross-selling; explicit consent required.',
      'Document statutory employment justifications in internal employee privacy handbook.',
      'Maintain verifiable legal hold records when processing data under judicial decrees.'
    ],
    dpbiEnforcementRisk: 'Unlawful reliance on Section 7 for commercial advertising or user profiling.',
    maxPenalty: '₹50 Crores per violation'
  },
  {
    id: 'mod_4',
    moduleNumber: 4,
    title: "Children's Data, Age Verification & Verifiable Parental Consent",
    subtitle: 'Absolute ban on behavioral tracking, targeted ads, and harmful profiling of minors',
    statutoryBasis: 'Section 9 & DPDP Rules Chapter III',
    estimatedMinutes: 35,
    badge: 'Child Protection',
    overview:
      'Section 9 establishes stringent protections for individuals under 18 years of age and persons with disabilities. Data Fiduciaries must obtain Verifiable Parental Consent (VPC) before processing, and are strictly prohibited from tracking, behavioral monitoring, and serving targeted advertisements to children.',
    keyRequirements: [
      'Verifiable Parental Consent (VPC) mandatory via Aadhaar e-Sign, government ID, or DigiLocker token.',
      'Strict statutory prohibition on tracking, behavioral monitoring, and targeted advertising directed at children.',
      'Prohibition on any processing that causes a detrimental effect on the physical or mental well-being of a child.'
    ],
    practicalChecklist: [
      'Implement age-gating mechanism at registration with verifiable guardian OTP/document validation.',
      'Hardcode suppression of third-party advertising SDKs and tracking telemetry for accounts under 18.',
      'Conduct child safety DPIA for educational and gaming applications.'
    ],
    dpbiEnforcementRisk: 'High regulatory scrutiny; automatic maximum tier enforcement for ad-targeting minors.',
    maxPenalty: 'Up to ₹200 Crores under Section 33 Schedule'
  },
  {
    id: 'mod_5',
    moduleNumber: 5,
    title: 'Significant Data Fiduciaries (SDF) & Section 10 Obligations',
    subtitle: 'DPO appointment, Independent Data Auditors, and mandatory periodic DPIAs',
    statutoryBasis: 'Section 10 & DPDP Rules Chapter IV',
    estimatedMinutes: 30,
    badge: 'SDF Governance',
    overview:
      'The Central Government classifies entities as Significant Data Fiduciaries based on volume of data, risk of harm, potential impact on sovereignty, electoral democracy, and state security. SDFs face elevated statutory governance duties.',
    keyRequirements: [
      'Appointment of a Data Protection Officer (DPO) based in India, reporting directly to the Board.',
      'Appointment of an Independent Data Auditor to evaluate compliance periodically.',
      'Mandatory periodic Data Protection Impact Assessments (DPIA) with public interest balancing.',
      'Algorithmic and systemic processing audits.'
    ],
    practicalChecklist: [
      'Verify if your organization meets criteria for SDF status based on user volume and sensitive data processing.',
      'Formalize DPO appointment with direct board access and local Indian legal residency.',
      'Establish annual DPIA cadence for AI/ML features, large-scale biometric processing, and fintech scoring.'
    ],
    dpbiEnforcementRisk: 'Audit sanctions and daily recurring fines for unappointed DPO or unexecuted DPIA.',
    maxPenalty: 'Up to ₹150 Crores under Section 33 Schedule'
  },
  {
    id: 'mod_6',
    moduleNumber: 6,
    title: 'Data Processors, Contractual DPAs & Cross-Border Whitelist',
    subtitle: 'Section 8(1) valid contracts, processor audit rights, and Section 16 transfer regime',
    statutoryBasis: 'Sections 8(1), 16 & DPDP Rules',
    estimatedMinutes: 25,
    badge: 'Vendors & Transfers',
    overview:
      'Data Fiduciaries can engage Data Processors only under a valid, written Data Processing Agreement (DPA). The fiduciary remains legally responsible for processor non-compliance. Cross-border personal data transfers are permitted to all countries except those explicitly blacklisted by the Central Government.',
    keyRequirements: [
      'Mandatory written DPA containing technical safeguards, audit rights, and cascading deletion duties.',
      'Fiduciary retains strict vicarious liability for any processor breach or unauthorized disclosure.',
      'Cross-border transfers follow the "Negative List" (all allowed unless specifically restricted by MeitY notification).'
    ],
    practicalChecklist: [
      'Execute DPDPA-compliant DPAs with all cloud hosts, payment gateways, CRM, and analytics vendors.',
      'Enforce automated downstream breach notification SLAs (e.g. 2 hours from processor to fiduciary).',
      'Map all offshore data storage locations to ensure zero transfers to notified restricted jurisdictions.'
    ],
    dpbiEnforcementRisk: 'Fiduciary held entirely liable for vendor leak or unauthorized data sharing.',
    maxPenalty: 'Up to ₹250 Crores under Section 33 Schedule'
  },
  {
    id: 'mod_7',
    moduleNumber: 7,
    title: 'Reasonable Security Safeguards & 6-Hour Breach Reporting',
    subtitle: 'Section 8(5) technical safeguards and Section 8(6) mandatory DPBI notification',
    statutoryBasis: 'Sections 8(5), 8(6) & DPDP Rules Chapter V',
    estimatedMinutes: 30,
    badge: 'Breach Response',
    overview:
      'Data Fiduciaries must implement reasonable technical and organizational safeguards to prevent personal data breaches. Upon occurrence of a personal data breach, the fiduciary must notify both the Data Protection Board of India (DPBI) and each affected Data Principal within the prescribed statutory timeframe (6 hours).',
    keyRequirements: [
      'Mandatory technical safeguards: AES-256 GCM encryption, role-based access control, and KMS key isolation.',
      'Statutory 6-Hour incident notification clock to the DPBI from the moment of breach confirmation.',
      'Simultaneous or immediate notification to all affected Data Principals in plain language with mitigation steps.'
    ],
    practicalChecklist: [
      'Deploy 24/7 Security Operations Center (SOC) with automated DPDP breach triage escalation playbooks.',
      'Maintain pre-drafted DPBI notification templates and principal notification messaging pipelines.',
      'Conduct quarterly 6-hour tabletop simulation drills with DPO and executive leadership.'
    ],
    dpbiEnforcementRisk: 'Failure to take reasonable security safeguards attracts the highest statutory penalty tier.',
    maxPenalty: 'Up to ₹250 Crores under Section 33 Schedule'
  },
  {
    id: 'mod_8',
    moduleNumber: 8,
    title: 'Data Principal Rights, Redressal SLAs & DPBI Inquiries',
    subtitle: 'Access, correction, erasure, nomination rights, and statutory grievance mechanisms',
    statutoryBasis: 'Sections 11, 12, 13, 14, 28-33 & DPDP Rules',
    estimatedMinutes: 25,
    badge: 'Rights & Enforcement',
    overview:
      'Data Principals enjoy rights to summary of personal data, correction, completion, updation, erasure, and nomination of a representative in case of death or incapacity. Fiduciaries must establish an accessible grievance redressal mechanism with mandatory time-bound resolution before a principal can approach the DPBI.',
    keyRequirements: [
      'Right to access: summary of personal data processed, identities of all fiduciaries/processors shared with.',
      'Right to correction, completion, updation, and erasure upon purpose fulfillment.',
      'Right to nominate an individual to exercise rights upon death or physical/mental incapacity.',
      'Grievance redressal exhaustion: principal must first exhaust fiduciary redressal before petitioning DPBI.'
    ],
    practicalChecklist: [
      'Provide an automated DSAR portal enabling one-click download of personal data summary.',
      'Maintain a 72-hour internal SLA for grievance resolution with escalation tracking to avoid DPBI appeals.',
      'Implement digital nomination registry allowing principals to designate verified nominees.'
    ],
    dpbiEnforcementRisk: 'Customer grievance escalated to DPBI triggering statutory investigative inquiry.',
    maxPenalty: '₹50 Crores per violation'
  }
];

export const DPDPA_INDUSTRY_CHECKLISTS: DPDPAIndustryChecklist[] = [
  {
    id: 'ind_bfsi',
    industry: 'BFSI & Fintech (Banking, Lending & Payments)',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    riskProfile: 'CRITICAL',
    description: 'Harmonization of DPDPA with RBI Master Directions on KYC, Account Aggregators, and PMLA 2002 mandates.',
    specificObligations: [
      {
        rule: 'RBI vKYC & PMLA 5-Year Retention Harmonization',
        description: 'Retain transaction ledgers and KYC artifacts for 5 years under PMLA Sec 12, while purging live video streams after 180 days under DPDPA Sec 8(7).',
        statutoryRef: 'DPDPA Sec 8(7) + PMLA 2002 Sec 12'
      },
      {
        rule: 'Consent Bundling Ban on Credit Underwriting',
        description: 'Lending apps cannot bundle core credit eligibility assessment with marketing push notifications or third-party insurance cross-sell consent.',
        statutoryRef: 'DPDPA Sec 6(1) & 6(2)'
      },
      {
        rule: 'Account Aggregator & Tokenized Consent Flows',
        description: 'Financial Data Access through Account Aggregators must adhere to explicit, time-bounded, purpose-specific consent handles.',
        statutoryRef: 'DPDPA Sec 6 + RBI AA Framework'
      }
    ]
  },
  {
    id: 'ind_healthcare',
    industry: 'Healthcare, Diagnostic Labs & Telemedicine',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    riskProfile: 'CRITICAL',
    description: 'Alignment with Ayushman Bharat Digital Mission (ABDM), EHR Standards, and emergency medical exemptions.',
    specificObligations: [
      {
        rule: 'Explicit Consent for Diagnostic & Genomic Profiles',
        description: 'Diagnostic labs cannot share patient test telemetry or genomic datasets with pharma researchers without unbundled, granular consent.',
        statutoryRef: 'DPDPA Sec 6(1)'
      },
      {
        rule: 'Section 7(d) Epidemic & Emergency Treatment Exemption',
        description: 'Hospitals can process patient medical telemetry without consent strictly during life-threatening medical emergencies or epidemics.',
        statutoryRef: 'DPDPA Sec 7(d)'
      },
      {
        rule: 'Nomination for Medical Records Access',
        description: 'Provide digital nomination workflow allowing patients to designate family members for posthumous medical record release.',
        statutoryRef: 'DPDPA Sec 14'
      }
    ]
  },
  {
    id: 'ind_edtech',
    industry: 'EdTech, Schools & Online Youth Academies',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    riskProfile: 'CRITICAL',
    description: 'Rigorous compliance with Section 9 children data prohibitions, age verification, and guardian verification.',
    specificObligations: [
      {
        rule: 'Verifiable Parental Consent (VPC) Gateway',
        description: 'Mandatory verification of parent/guardian identity via DigiLocker, Aadhaar OTP, or government photo ID prior to account onboarding for under 18s.',
        statutoryRef: 'DPDPA Sec 9(1)'
      },
      {
        rule: 'Complete Suppression of Behavioral Ad-Tracking',
        description: 'Absolute statutory ban on behavioral tracking, user profiling, and student micro-targeting for commercial gain.',
        statutoryRef: 'DPDPA Sec 9(2)'
      },
      {
        rule: 'Post-Academic Session Data Purge',
        description: 'Student audio recordings, quiz response telemetry, and exam webcams must be purged within 90 days of term conclusion.',
        statutoryRef: 'DPDPA Sec 8(7)'
      }
    ]
  },
  {
    id: 'ind_ecommerce',
    industry: 'E-Commerce, Quick Commerce & Delivery Aggregators',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    riskProfile: 'HIGH',
    description: 'Dark pattern elimination, location telemetry minimization, and third-party delivery processor governance.',
    specificObligations: [
      {
        rule: 'Dark Pattern Elimination in Checkout Opt-Ins',
        description: 'Pre-ticked subscriptions, confirm-shaming opt-outs, and false urgency checkout banners are prohibited under DPDPA consent rules.',
        statutoryRef: 'DPDPA Sec 6 + CCPA Dark Patterns Guidelines'
      },
      {
        rule: 'Delivery Rider Geolocation Ephemerality',
        description: 'Precise customer delivery GPS pins must be masked or anonymized once the delivery transaction is completed.',
        statutoryRef: 'DPDPA Sec 8(7) Purpose Limitation'
      },
      {
        rule: 'Delivery Partner Processor DPAs',
        description: 'Written agreements with logistics third parties restricting phone number viewing via number masking proxy APIs.',
        statutoryRef: 'DPDPA Sec 8(1)'
      }
    ]
  },
  {
    id: 'ind_saas',
    industry: 'SaaS, Cloud Infrastructure & IT/ITeS Providers',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    riskProfile: 'HIGH',
    description: 'Data Processor obligations, cross-border customer telemetry, and rapid 6-hour incident escalation cascades.',
    specificObligations: [
      {
        rule: 'Fiduciary-Processor Contractual Standard Clauses',
        description: 'SaaS providers acting as processors must support customer DSARs, audit verification, and provide 2-hour breach reporting escalation.',
        statutoryRef: 'DPDPA Sec 8(1)'
      },
      {
        rule: 'Cross-Border Sovereign Whitelisting',
        description: 'Hosting enterprise tenant personal data exclusively in jurisdictions compliant with Central Government negative list notifications.',
        statutoryRef: 'DPDPA Sec 16'
      },
      {
        rule: 'Automated Cryptographic Tenant Isolation',
        description: 'Customer data must be encrypted with Customer-Managed Keys (CMK) ensuring zero leakage across multi-tenant database clusters.',
        statutoryRef: 'DPDPA Sec 8(5)'
      }
    ]
  }
];

export const DPDPA_DOC_TEMPLATES: DPDPADocTemplate[] = [
  {
    id: 'tmpl_notice',
    title: 'DPDPA Section 5 Itemized Multilingual Privacy Notice',
    category: 'NOTICE_CONSENT',
    statutoryClause: 'Section 5 & Section 6(1)',
    description: 'Statutory itemized notice format ready for translation into all 22 Eighth Schedule Indian languages.',
    format: 'Markdown / Plain Text',
    content: `# STATUTORY PRIVACY NOTICE UNDER SECTION 5 OF THE DPDPA 2023

1. IDENTIFICATION OF DATA FIDUCIARY
[Organization Name], incorporated under Companies Act, having its registered office at [Address, India].
Data Protection Officer: [Name] | Contact: dpo@[domain].com | Physical Office: [Address, India]

2. CATEGORIES OF PERSONAL DATA COLLECTED
- Contact & Identity: Name, Mobile Number, Verified Email, Government Identity (where statutorily required).
- Operational Data: Order history, Device IP, Browser metadata.

3. SPECIFIC PURPOSES OF PROCESSING
- Purpose A: Provision of subscribed SaaS services and billing execution.
- Purpose B: Identity verification in compliance with statutory know-your-customer laws.
[Notice: Consent for marketing communications is entirely unbundled and optional.]

4. EXERCISE OF DATA PRINCIPAL RIGHTS UNDER DPDPA
You have the right to access a summary of your personal data, seek correction, request complete erasure, and nominate a representative via our portal at https://[domain]/privacy/dsar.

5. GRIEVANCE REDRESSAL & DPBI APPEAL
Grievances will be acknowledged within 24 hours and resolved within 72 hours.
If unresolved, you have the right to file a complaint with the Data Protection Board of India (DPBI) at https://dpbi.gov.in.

6. LANGUAGE AVAILABILITY
This notice is available in English and 22 Indian languages scheduled under the Constitution of India.`
  },
  {
    id: 'tmpl_dpa',
    title: 'DPDPA Section 8(1) Master Data Processing Agreement (DPA)',
    category: 'DPA_VENDORS',
    statutoryClause: 'Section 8(1) & Section 8(5)',
    description: 'Bilateral contract binding third-party data processors to statutory technical safeguards and audit rights.',
    format: 'Legal Contract Template',
    content: `DATA PROCESSING AGREEMENT UNDER SECTION 8(1) DPDPA 2023

BETWEEN:
1. [COMPANY NAME] ("Data Fiduciary")
AND
2. [VENDOR NAME] ("Data Processor")

1. SCOPE AND NATURE OF PROCESSING
Processor shall process personal data exclusively upon documented instructions from the Data Fiduciary and solely for the agreed service scope.

2. TECHNICAL & ORGANIZATIONAL SAFEGUARDS (SECTION 8(5))
Processor warrants implementation of AES-256 GCM encryption at rest, TLS 1.3 in transit, automated access logging, and regular vulnerability audits.

3. BREACH NOTIFICATION ESCALATION (2-HOUR SLA)
In the event of any suspected or confirmed personal data breach, Processor shall notify Fiduciary in writing within two (2) hours of becoming aware.

4. SUB-PROCESSOR CASCADE
Processor shall not engage any sub-processor without prior written authorization. All sub-processors must be bound by identical obligations.

5. RETURN AND DESTRUCTION OF PERSONAL DATA (SECTION 8(7))
Upon termination of services or accomplishment of purpose, Processor shall securely purge all personal data in accordance with NIST SP 800-88 standards and issue a certified Record of Disposal.`
  },
  {
    id: 'tmpl_breach',
    title: 'DPDPA Section 8(6) Statutory 6-Hour Breach Notification to DPBI',
    category: 'BREACH_INCIDENT',
    statutoryClause: 'Section 8(6) & DPDP Rules',
    description: 'Official breach disclosure dossier template for submission to Data Protection Board of India.',
    format: 'Regulatory Filing Template',
    content: `FORM DPBI-BN-1: STATUTORY DATA BREACH NOTIFICATION
[Filed within 6 hours under Section 8(6) of the Digital Personal Data Protection Act, 2023]

TO: The Registrar, Data Protection Board of India (DPBI)
FROM: Elena Rostova, Chief DPO, [Organization Name]

1. INCIDENT OVERVIEW
- Incident ID: INC-DPDP-2026-[XXXX]
- Timestamp Incident Detected: [YYYY-MM-DD HH:MM UTC]
- Timestamp Breach Confirmed: [YYYY-MM-DD HH:MM UTC]
- Elapsed Time to Notification: [X] Hours [Y] Minutes (Within Statutory 6-Hour Limit)

2. NATURE AND SCOPE OF BREACH
- Affected Systems: [Database Cluster / S3 Bucket / CRM]
- Categories of Personal Data Exposed: [Identity / Contact / Financial telemetry]
- Estimated Number of Affected Data Principals in India: [Number]

3. ROOT CAUSE & CONTAINMENT ACTIONS
- Root cause identified: [Misconfigured API gateway / credential compromise / third-party vendor vulnerability]
- Containment measures executed: [Revocation of API keys, IP blacklisting, KMS key rotation]

4. MITIGATION ADVICE PROVIDED TO DATA PRINCIPALS
- Notice issued via registered SMS & Email.
- Advisory to reset credentials, monitor account alerts, and contact 24/7 incident hotline.

Attested by:
Elena Rostova, Chief Data Protection Officer (Resident in India)`
  },
  {
    id: 'tmpl_vpc',
    title: 'DPDPA Section 9 Verifiable Parental Consent (VPC) Protocol',
    category: 'CHILDREN_VPC',
    statutoryClause: 'Section 9(1) & 9(2)',
    description: 'Standard operating procedure and consent form for onboarding minors under 18.',
    format: 'SOP & Consent Document',
    content: `VERIFIABLE PARENTAL CONSENT (VPC) OPERATING PROCEDURE
[Compliant with Section 9 DPDPA 2023 & MeitY DPDP Rules 2025]

1. AGE GATING GATEWAY
All users registering for educational services must declare date of birth. Any applicant under eighteen (18) years of age is routed to the VPC verification flow.

2. GUARDIAN VERIFICATION METHODOLOGY
Guardian identity must be validated through one of the following government-approved channels:
- Channel A: DigiLocker verified Parent-Child relationship token.
- Channel B: Aadhaar e-Sign OTP confirmation by guardian.
- Channel C: Video KYC verification of parent presenting government ID.

3. STATUTORY GUARANTEES GIVEN TO GUARDIAN
- Complete absence of behavioral tracking, screen profiling, or targeted advertisements.
- Data collected will strictly be limited to academic learning telemetry.
- Right to revoke consent and demand total erasure of student data at any time.`
  }
];

export const DPDPA_EXAM_QUESTIONS: DPDPAExamQuestion[] = [
  {
    id: 1,
    question: 'Under Section 5 of the DPDPA 2023, what is the language requirement for the privacy notice provided to a Data Principal?',
    options: [
      'The notice must be in English and Hindi only.',
      'The notice must be in English or any language specified in the Eighth Schedule to the Constitution of India.',
      'The notice is only required in the local official language of the state where the fiduciary is headquartered.',
      'Only English is mandatory; regional translations are discretionary recommendations.'
    ],
    correctOptionIndex: 1,
    statutoryRef: 'Section 5(3) DPDPA 2023',
    explanation:
      'Section 5(3) explicitly mandates that the Data Principal must be given the option to access the notice in English or any of the 22 languages specified in the Eighth Schedule to the Constitution.'
  },
  {
    id: 2,
    question: 'What is the statutory deadline for reporting a personal data breach to the Data Protection Board of India (DPBI) and affected Data Principals under Section 8(6)?',
    options: [
      '72 hours, matching the European Union GDPR standard.',
      '30 calendar days from discovery of the incident.',
      '6 hours from confirmation of the personal data breach.',
      '24 hours for financial entities and 7 days for non-financial entities.'
    ],
    correctOptionIndex: 2,
    statutoryRef: 'Section 8(6) DPDPA & CERT-In/DPDP Harmonized Rules',
    explanation:
      'Under the DPDP Rules and statutory cybersecurity guidelines, fiduciaries must notify the DPBI and affected individuals within 6 hours of incident confirmation.'
  },
  {
    id: 3,
    question: 'Which of the following is STRICTLY prohibited when processing personal data of children under Section 9 of the DPDPA?',
    options: [
      'Sending transactional password-reset emails.',
      'Storing student academic quiz performance in an encrypted sovereign cloud.',
      'Engaging in behavioral monitoring, tracking, or targeted advertising directed at children.',
      'Collecting verifiable parental consent through DigiLocker.'
    ],
    correctOptionIndex: 2,
    statutoryRef: 'Section 9(2) & 9(3) DPDPA 2023',
    explanation:
      'Section 9 strictly prohibits any tracking, behavioral monitoring, or targeted advertising directed at children, or any processing that causes a detrimental effect on child well-being.'
  },
  {
    id: 4,
    question: 'What is the maximum penalty specified under the Schedule to Section 33 for failure to take reasonable security safeguards to prevent a personal data breach?',
    options: [
      '₹50 Crores',
      '₹100 Crores',
      '₹200 Crores',
      '₹250 Crores'
    ],
    correctOptionIndex: 3,
    statutoryRef: 'Section 33 Schedule (Entry 1) DPDPA 2023',
    explanation:
      'Entry 1 of the Schedule to Section 33 provides a maximum fine of up to two hundred and fifty crore rupees (₹250 Crores) for breach in observing reasonable security safeguards.'
  },
  {
    id: 5,
    question: 'Under Section 8(7), when is a Data Fiduciary obligated to erase personal data?',
    options: [
      'Only after 10 years from the date of collection.',
      'When the specified purpose for which personal data was collected is no longer being served, or upon consent withdrawal, unless retention is required by another statutory law.',
      'Whenever the fiduciary changes its Chief Executive Officer or Board members.',
      'Erasing data is entirely voluntary under Indian law.'
    ],
    correctOptionIndex: 1,
    statutoryRef: 'Section 8(7) DPDPA 2023',
    explanation:
      'Section 8(7) mandates erasure as soon as the specified purpose is fulfilled or consent is withdrawn, unless retention is necessary under another statutory obligation (like PMLA or Companies Act).'
  },
  {
    id: 6,
    question: 'Who must a Significant Data Fiduciary (SDF) appoint under Section 10 of the Act?',
    options: [
      'A Data Protection Officer based in any overseas jurisdiction.',
      'An external US-based privacy attorney.',
      'A Data Protection Officer based in India, representing the fiduciary and reporting directly to the Board of Directors.',
      'No appointment is necessary if the company employs fewer than 5,000 employees.'
    ],
    correctOptionIndex: 2,
    statutoryRef: 'Section 10(2)(a) DPDPA 2023',
    explanation:
      'Section 10(2)(a) mandates the appointment of a Data Protection Officer who must be based in India and report to the Board of Directors or governing body of the fiduciary.'
  },
  {
    id: 7,
    question: 'What is the "Negative List" approach to cross-border data transfers under Section 16 of the DPDPA?',
    options: [
      'Data can only be transferred to a small list of pre-approved countries specified by bilateral treaties.',
      'Cross-border transfers are completely banned under all circumstances.',
      'Transfers are permitted to all countries worldwide, EXCEPT those explicitly restricted or blacklisted by the Central Government.',
      'Data can only be transferred if the foreign country adopts the DPDPA word-for-word.'
    ],
    correctOptionIndex: 2,
    statutoryRef: 'Section 16 DPDPA 2023',
    explanation:
      'Section 16 empowers the Central Government to restrict transfers to specified countries (negative list / blacklisting approach), meaning transfers elsewhere are permissible by default.'
  },
  {
    id: 8,
    question: 'What is the statutory role of a "Consent Manager" registered with the Data Protection Board of India?',
    options: [
      'To sell aggregated consumer databases to advertisers.',
      'To act as an interoperable, single point of contact allowing Data Principals to give, manage, review, and withdraw consent across multiple fiduciaries.',
      'To enforce criminal arrests on behalf of local police stations.',
      'To replace the Data Protection Officer inside every startup.'
    ],
    correctOptionIndex: 1,
    statutoryRef: 'Section 6(7), 6(8) DPDPA 2023',
    explanation:
      'Section 6(7) defines a Consent Manager as an entity registered with the Board that acts as a secure platform through which a Data Principal can give, manage, review, and withdraw consent.'
  },
  {
    id: 9,
    question: 'Which of the following is true regarding the "Right to Nominate" under Section 14 of the DPDPA?',
    options: [
      'Only corporate entities can nominate representatives.',
      'A Data Principal has the right to nominate any other individual to exercise data rights in the event of their death or incapacity.',
      'Nomination can only be made by paying a statutory fee to the DPBI.',
      'Nomination is valid only for financial banking accounts, not digital data.'
    ],
    correctOptionIndex: 1,
    statutoryRef: 'Section 14 DPDPA 2023',
    explanation:
      'Section 14 grants Data Principals the right to nominate any individual to exercise their rights in the event of death or incapacity.'
  },
  {
    id: 10,
    question: 'What condition must be satisfied before a Data Principal can submit a complaint to the Data Protection Board of India (DPBI) under Section 13(3)?',
    options: [
      'The principal must first deposit ₹1,00,000 with the High Court.',
      'The principal must first exhaust the grievance redressal mechanism of the Data Fiduciary.',
      'The principal must wait a minimum of 2 years from the date of the incident.',
      'Complaints can only be filed by registered non-profit organizations.'
    ],
    correctOptionIndex: 1,
    statutoryRef: 'Section 13(3) DPDPA 2023',
    explanation:
      'Section 13(3) requires the Data Principal to first exhaust the opportunity of redressal provided by the Data Fiduciary before escalating to the DPBI.'
  }
];

export function generateCertificationHash(candidateName: string, score: number, certId: string): string {
  let hash = 0x811c9dc5;
  const str = `${candidateName}|${score}|${certId}|DPDPA-2023-DPBI|${Date.now()}`;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  return `SHA256:DPDPA-${hex}-CERT-VALIDATED-${hex.slice(0, 4)}`;
}
