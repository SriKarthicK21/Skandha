import { ComplianceProgramDefinition } from '../types/journeyEngineTypes';

export const COMPLIANCE_PROGRAMS_MASTER: ComplianceProgramDefinition[] = [
  // 1. INFORMATION SECURITY
  {
    id: 'iso27001',
    code: 'ISO 27001',
    name: 'ISO/IEC 27001:2022',
    fullTitle: 'Information Security Management System (ISMS)',
    category: 'Information Security',
    description: 'The international benchmark specification for establishing, implementing, maintaining, and continually improving an Information Security Management System.',
    whatItMeans: 'Establishes a systematic, risk-managed approach to managing company information so that it remains secure across confidentiality, integrity, and availability.',
    regulatoryBody: 'International Organization for Standardization (ISO) / IEC',
    primaryStandard: 'ISO/IEC 27001:2022 Clauses 4-10 & 93 Annex A Controls',
    defaultControlsCount: 93,
    typicalAuditCadence: 'Annual Stage 1/2 Certification + 2 Surveillance Audits',
    applicabilityCriteria: [
      'Enterprises handling customer data',
      'SaaS & Cloud Providers',
      'Organizations requiring institutional trust & enterprise B2B sales acceleration'
    ],
    commonOverlaps: ['soc2', 'nist_csf', 'iso27701', 'mas_trm', 'cis_controls'],
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    iconName: 'ShieldCheck',
    keyBenefits: [
      'Accelerate Enterprise Sales RFP cycles',
      'Reduce cybersecurity incident surface by up to 74%',
      'Global gold standard recognized in 170+ jurisdictions'
    ],
    mandatoryArtifacts: [
      'ISMS Scope Document',
      'Information Security Policy',
      'Risk Assessment & Treatment Methodology',
      'Statement of Applicability (SoA)',
      'Internal Audit Schedule & Reports',
      'Management Review Minutes'
    ]
  },

  // 2. PRIVACY
  {
    id: 'iso27701',
    code: 'ISO 27701',
    name: 'ISO/IEC 27701:2019',
    fullTitle: 'Privacy Information Management System (PIMS)',
    category: 'Privacy',
    description: 'The privacy extension to ISO/IEC 27001 providing operational guidance on protecting Personally Identifiable Information (PII) for Data Controllers and Processors.',
    whatItMeans: 'Extends your ISMS into privacy governance, harmonizing GDPR, DPDPA, and global data privacy obligations into an auditable management framework.',
    regulatoryBody: 'ISO/IEC JTC 1/SC 27',
    primaryStandard: 'ISO/IEC 27701:2019 Annex A (Controllers) & Annex B (Processors)',
    defaultControlsCount: 49,
    typicalAuditCadence: 'Conducted concurrently with ISO 27001 certification audit',
    applicabilityCriteria: [
      'Organizations collecting, processing, or hosting personal data',
      'Global multi-jurisdictional SaaS platforms',
      'Enterprises subject to GDPR, CCPA, or DPDP Act'
    ],
    commonOverlaps: ['iso27001', 'dpdpa', 'gdpr'],
    badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    iconName: 'UserCheck',
    keyBenefits: [
      'Demonstrates GDPR Article 42 certification readiness',
      'Streamlines customer vendor privacy due diligence',
      'Reduces regulatory cross-border data transfer risks'
    ],
    mandatoryArtifacts: [
      'PIMS Scope & Privacy Policy',
      'Record of Processing Activities (RoPA)',
      'Data Privacy Impact Assessment (DPIA) Methodology',
      'Data Subject Request (DSR) Handling Procedure',
      'Data Breach Notification Standard'
    ]
  },
  {
    id: 'dpdpa',
    code: 'DPDPA 2023',
    name: 'Digital Personal Data Protection Act 2023',
    fullTitle: 'India DPDP Act 2023 Compliance Framework',
    category: 'Privacy',
    description: 'Statutory compliance requirements mandated by the Indian Parliament governing the lawful processing of digital personal data and rights of Data Principals.',
    whatItMeans: 'Establishes lawful grounds for processing personal data, itemized consent notices in 22 scheduled languages, parent consent for minors, and 6-hour breach reporting.',
    regulatoryBody: 'Data Protection Board of India (DPBI) / MeitY',
    primaryStandard: 'DPDP Act 2023 Sections 4-17 & Statutory Rules',
    defaultControlsCount: 44,
    typicalAuditCadence: 'Continuous Statutory Compliance & Periodic Data Audits',
    applicabilityCriteria: [
      'Entities offering goods or services to Data Principals in India',
      'Significant Data Fiduciaries (SDFs)',
      'Offshore platforms processing data of Indian residents'
    ],
    commonOverlaps: ['iso27701', 'gdpr', 'iso27001'],
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    iconName: 'Scale',
    keyBenefits: [
      'Mitigate statutory penalties of up to ₹250 Crores per violation',
      'Automated consent architecture & grievance resolution within SLA',
      'Seamless compliance with Section 8 data fiduciary duties'
    ],
    mandatoryArtifacts: [
      'Itemized Multilingual Consent Notices',
      'Data Principal Grievance Mechanism Register',
      'Verifiable Parental Consent (VPC) Workflow',
      'Data Processor Agreements (DPAs)',
      'Periodic Independent Data Audit Dossier'
    ]
  },
  {
    id: 'gdpr',
    code: 'EU GDPR',
    name: 'General Data Protection Regulation',
    fullTitle: 'EU Regulation 2016/679 on Data Protection & Privacy',
    category: 'Privacy',
    description: 'European Union regulation on information privacy, lawful processing, international data transfers, and automated individual decision-making.',
    whatItMeans: 'Enforces fundamental data privacy rights for EU residents, strict lawful basis justifications, DPO appointment, and rigorous processor oversight.',
    regulatoryBody: 'European Data Protection Board (EDPB) & National DPAs',
    primaryStandard: 'Regulation (EU) 2016/679 Articles 1-99',
    defaultControlsCount: 52,
    typicalAuditCadence: 'Annual Privacy Assurance & Continuous Compliance',
    applicabilityCriteria: [
      'Companies with establishment in the European Economic Area',
      'Organizations monitoring behavior or offering goods/services to EU individuals'
    ],
    commonOverlaps: ['iso27701', 'dpdpa'],
    badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    iconName: 'Globe',
    keyBenefits: [
      'Avoid administrative fines up to €20M or 4% of global turnover',
      'Lawful cross-border transfers using EU Standard Contractual Clauses (SCCs)',
      'Customer trust across 27 EU member states'
    ],
    mandatoryArtifacts: [
      'Article 30 Records of Processing Activities',
      'Data Protection Officer (DPO) Charter',
      'Standard Contractual Clauses Register',
      '72-Hour DPA Breach Notification Protocol'
    ]
  },

  // 3. AI GOVERNANCE
  {
    id: 'iso42001',
    code: 'ISO 42001',
    name: 'ISO/IEC 42001:2023',
    fullTitle: 'Artificial Intelligence Management System (AIMS)',
    category: 'AI Governance',
    description: 'The world’s first certifiable standard for responsible development, deployment, and operation of Artificial Intelligence systems.',
    whatItMeans: 'Provides governance over AI system safety, algorithmic bias, transparency, data provenance, model explainability, and societal impact.',
    regulatoryBody: 'ISO/IEC JTC 1/SC 42 (Artificial Intelligence)',
    primaryStandard: 'ISO/IEC 42001:2023 Clauses 4-10 & 38 Annex A Controls',
    defaultControlsCount: 38,
    typicalAuditCadence: 'Annual Certification & Continuous Model Risk Assessment',
    applicabilityCriteria: [
      'Organizations developing or integrating LLMs, GenAI, or Predictive AI',
      'Enterprises using AI for automated scoring, hiring, or credit decisions',
      'Vendors positioning AI solutions to enterprise procurement'
    ],
    commonOverlaps: ['iso27001', 'nist_csf', 'mas_trm'],
    badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    iconName: 'Sparkles',
    keyBenefits: [
      'First-mover advantage in responsible enterprise AI procurement',
      'Aligns directly with EU AI Act and US Executive Order on AI',
      'Prevents algorithmic hallucination and unauthorized data scraping liabilities'
    ],
    mandatoryArtifacts: [
      'AI Management System Scope & Ethical AI Policy',
      'AI System Inventory & Classification Matrix',
      'AI Risk & Impact Assessment (AIIA)',
      'Model Card & Data Provenance Records',
      'Continuous Model Bias & Drift Monitoring Logs'
    ]
  },

  // 4. TECHNOLOGY RISK
  {
    id: 'mas_trm',
    code: 'MAS TRM',
    name: 'MAS TRM Guidelines 2021',
    fullTitle: 'Monetary Authority of Singapore Technology Risk Management',
    category: 'Technology Risk',
    description: 'Mandatory technology risk management and cyber resilience standards enforced by Singapore’s central bank for all Financial Institutions.',
    whatItMeans: 'Enforces strict board oversight, multi-factor authentication, cryptographic security, 1-hour critical incident notification (Notice 644), and 4-hour RTO resilience.',
    regulatoryBody: 'Monetary Authority of Singapore (MAS)',
    primaryStandard: 'MAS Technology Risk Management Guidelines (Jan 2021), Notice 644 & Notice 655',
    defaultControlsCount: 86,
    typicalAuditCadence: 'Annual Technology Audit & Regulatory Inspection by MAS',
    applicabilityCriteria: [
      'Banks, Insurers, Capital Market Intermediaries in Singapore',
      'Payment Services Act (PSA) licensees and Digital Token Service Providers',
      'Critical Outsourced Service Providers (COSPs) to Singapore FIs'
    ],
    commonOverlaps: ['iso27001', 'soc2', 'pci_dss'],
    badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    iconName: 'Building2',
    keyBenefits: [
      'Guarantees regulatory compliance with binding MAS Notices 644 and 655',
      'Reduces critical payment system unplanned downtime (RTO ≤ 4h)',
      'Institutional readiness for MAS supervisory audits and TRM thematic inspections'
    ],
    mandatoryArtifacts: [
      'Board-Approved Technology Risk Appetite Statement (RAS)',
      'Critical Systems Inventory with RTO/RPO Metrics',
      'Incident Triage Procedure & MAS Form IT-01 Dispatcher',
      'Cyber Hygiene Notice 655 Attestation',
      'Source Code Security Review & Third-Party Penetration Test'
    ]
  },

  // 5. SERVICE ORGANIZATION CONTROLS
  {
    id: 'soc2',
    code: 'SOC 2',
    name: 'AICPA SOC 2 (Type II)',
    fullTitle: 'System and Organization Controls for Trust Services Criteria',
    category: 'Service Organization',
    description: 'Independent CPA audit standard verifying a service organization’s controls across Security, Availability, Processing Integrity, Confidentiality, and Privacy.',
    whatItMeans: 'Provides institutional B2B customers with auditor-verified assurance that their data hosted in your cloud is secure and available.',
    regulatoryBody: 'American Institute of CPAs (AICPA)',
    primaryStandard: 'AICPA Trust Services Criteria (TSC) 2017 with revised points of focus',
    defaultControlsCount: 64,
    typicalAuditCadence: 'Annual Examination (Type I baseline, Type II 6-12 month observation)',
    applicabilityCriteria: [
      'SaaS & Cloud B2B companies selling to North American enterprises',
      'Managed IT, FinTech, and Data Hosting Providers'
    ],
    commonOverlaps: ['iso27001', 'nist_csf', 'cis_controls'],
    badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    iconName: 'FileCheck2',
    keyBenefits: [
      'De-facto prerequisite for closing US Enterprise deals',
      'Eliminates repetitive 200-question vendor security spreadsheets',
      'Provides audited evidence of operating effectiveness over time'
    ],
    mandatoryArtifacts: [
      'SOC 2 System Description (Section III)',
      'Management Assertion (Section II)',
      'Control Activity Matrix with Evidence Mappings',
      'Vendor Third-Party Due Diligence Records',
      'Annual Penetration Test & Disaster Recovery Tabletop'
    ]
  },

  // 6. SECURITY & CYBER RESILIENCE
  {
    id: 'nist_csf',
    code: 'NIST CSF',
    name: 'NIST Cybersecurity Framework 2.0',
    fullTitle: 'NIST CSF 2.0: Govern, Identify, Protect, Detect, Respond, Recover',
    category: 'Security / Risk',
    description: 'Widely adopted US voluntary cybersecurity guidance organizing capabilities across 6 core functions including the new Govern function.',
    whatItMeans: 'Provides an outcome-driven language for managing and communicating cybersecurity risk from the board to technical operators.',
    regulatoryBody: 'National Institute of Standards and Technology (NIST)',
    primaryStandard: 'NIST CSF 2.0 (Feb 2024)',
    defaultControlsCount: 106,
    typicalAuditCadence: 'Continuous Maturity Assessment & Annual Board Review',
    applicabilityCriteria: [
      'Critical Infrastructure and commercial enterprises',
      'Federal contractors and defense supply chain',
      'Organizations seeking risk-based maturity benchmarking'
    ],
    commonOverlaps: ['iso27001', 'cis_controls', 'soc2'],
    badgeColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    iconName: 'Shield',
    keyBenefits: [
      'Universal alignment across executive board and technical engineering',
      'Incorporates new GOVERN (GV) function for organizational cybersecurity oversight',
      'Seamless crosswalk to ISO 27001 and CIS Controls'
    ],
    mandatoryArtifacts: [
      'Cybersecurity Risk Profile (Current vs Target Tier)',
      'Incident Response Plan & Communication Playbook',
      'Vulnerability Management Standard',
      'Continuous Asset & Supply Chain Discovery Inventory'
    ]
  },
  {
    id: 'nist_800_53',
    code: 'NIST SP 800-53',
    name: 'NIST SP 800-53 Rev 5',
    fullTitle: 'Security and Privacy Controls for Information Systems and Organizations',
    category: 'Security / Risk',
    description: 'Comprehensive catalog of security and privacy controls for federal information systems, FedRAMP authorization, and defense supply chain.',
    whatItMeans: 'The most comprehensive security control baseline in existence, encompassing 20 control families across technical and operational domains.',
    regulatoryBody: 'NIST / US Department of Commerce',
    primaryStandard: 'NIST Special Publication 800-53 Revision 5',
    defaultControlsCount: 220,
    typicalAuditCadence: 'Continuous Monitoring (FedRAMP ConMon) & Biennial ATO',
    applicabilityCriteria: [
      'FedRAMP SaaS Authorization candidates',
      'US Federal Agencies & Department of Defense contractors',
      'High-security critical infrastructure operators'
    ],
    commonOverlaps: ['nist_csf', 'iso27001', 'cis_controls'],
    badgeColor: 'bg-slate-400/15 text-slate-300 border-slate-400/30',
    iconName: 'FileText',
    keyBenefits: [
      'Meets rigorous FedRAMP Moderate and High baseline expectations',
      'Granular control parameters with continuous automated monitoring',
      'Highest institutional defensibility in government procurement'
    ],
    mandatoryArtifacts: [
      'System Security Plan (SSP)',
      'Security Assessment Report (SAR)',
      'Plan of Action and Milestones (POA&M)',
      'Continuous Monitoring Strategy (ConMon)'
    ]
  },
  {
    id: 'cis_controls',
    code: 'CIS v8',
    name: 'CIS Critical Security Controls v8',
    fullTitle: 'Center for Internet Security Critical Security Controls (IG1, IG2, IG3)',
    category: 'Security / Risk',
    description: 'Prioritized set of 18 actions designed by global practitioners to stop over 85% of real-world cyber attacks.',
    whatItMeans: 'Translates high-level compliance into actionable, technical configurations that engineers can implement immediately.',
    regulatoryBody: 'Center for Internet Security (CIS)',
    primaryStandard: 'CIS Controls Version 8 (18 Controls, 153 Safeguards)',
    defaultControlsCount: 56,
    typicalAuditCadence: 'Quarterly Technical Audit & Continuous Vulnerability Scanning',
    applicabilityCriteria: [
      'Engineering-centric technology teams',
      'Organizations wanting concrete technical hygiene before formal ISO audit',
      'Implementation Groups IG1, IG2, and IG3 baselines'
    ],
    commonOverlaps: ['iso27001', 'nist_csf', 'soc2'],
    badgeColor: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    iconName: 'Terminal',
    keyBenefits: [
      'Stops 86% of MITRE ATT&CK enterprise adversary techniques',
      'Prescriptive safeguards with ready-made scripts and benchmarks',
      'Lowers cyber insurance premiums significantly'
    ],
    mandatoryArtifacts: [
      'Enterprise Hardware & Software Asset Inventories (Control 1 & 2)',
      'Data Protection & Encryption Standard (Control 3)',
      'Secure Configuration Baselines (Control 4)',
      'Account & Access Credential Policy (Control 5 & 6)'
    ]
  },
  {
    id: 'pci_dss',
    code: 'PCI DSS v4',
    name: 'PCI DSS v4.0.1',
    fullTitle: 'Payment Card Industry Data Security Standard',
    category: 'Security / Risk',
    description: 'Mandatory technical and operational requirements established by card brands to protect cardholder account data.',
    whatItMeans: 'Protects payment card transaction environments from card skimming, database breaches, and unauthorized interception.',
    regulatoryBody: 'PCI Security Standards Council (PCI SSC)',
    primaryStandard: 'PCI DSS Version 4.0.1 (12 Principal Requirements)',
    defaultControlsCount: 78,
    typicalAuditCadence: 'Annual QSA Report on Compliance (ROC) or Self-Assessment (SAQ D)',
    applicabilityCriteria: [
      'Merchants and payment gateways processing payment cards',
      'SaaS platforms integrating payment checkout or card storage'
    ],
    commonOverlaps: ['iso27001', 'soc2', 'mas_trm'],
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    iconName: 'CreditCard',
    keyBenefits: [
      'Prevents Visa/Mastercard processing license suspension and fines',
      'Mandatory Customized Approach validation in version 4.0',
      'Ensures encrypted storage and tokenization of Primary Account Numbers (PAN)'
    ],
    mandatoryArtifacts: [
      'Cardholder Data Environment (CDE) Network Scoping Diagram',
      'Quarterly Approved Scanning Vendor (ASV) Vulnerability Scans',
      'Annual Internal & External Penetration Testing Report',
      'Cryptographic Key Management Standard'
    ]
  },

  // 7. BUSINESS CONTINUITY
  {
    id: 'iso22301',
    code: 'ISO 22301',
    name: 'ISO 22301:2019',
    fullTitle: 'Business Continuity Management System (BCMS)',
    category: 'Business Continuity',
    description: 'International standard for implementing and maintaining a documented management system to protect against and recover from disruptive incidents.',
    whatItMeans: 'Guarantees that your critical business operations and client commitments survive physical outages, ransomware attacks, and supply chain failures.',
    regulatoryBody: 'ISO Technical Committee ISO/TC 292',
    primaryStandard: 'ISO 22301:2019 Clauses 4-10',
    defaultControlsCount: 42,
    typicalAuditCadence: 'Annual BCMS Certification & Tabletop Disaster Simulations',
    applicabilityCriteria: [
      'Financial services, healthcare, and critical utility platforms',
      'Enterprise SaaS platforms guaranteeing 99.99% availability SLAs'
    ],
    commonOverlaps: ['iso27001', 'mas_trm'],
    badgeColor: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    iconName: 'RefreshCw',
    keyBenefits: [
      'Guarantees recovery within contractual RTO and RPO thresholds',
      'Minimizes financial loss during catastrophic cloud region failure',
      'Audited evidence for enterprise business continuity due diligence'
    ],
    mandatoryArtifacts: [
      'Business Impact Analysis (BIA) Register',
      'Disaster Recovery Plan (DRP) & RTO/RPO Metrics',
      'Annual DR Simulation & Failover Test Reports',
      'Crisis Management & Emergency Communication Protocol'
    ]
  },

  // 8. RISK MANAGEMENT
  {
    id: 'iso31000',
    code: 'ISO 31000',
    name: 'ISO 31000:2018',
    fullTitle: 'Enterprise Risk Management Guidelines & Principles',
    category: 'Risk Management',
    description: 'Provides principles and generic guidelines on risk management, establishing a common approach to managing any type of risk across the enterprise.',
    whatItMeans: 'Structures how leadership identifies, quantifies, tolerates, and treats risk across financial, operational, compliance, and cyber vectors.',
    regulatoryBody: 'ISO Technical Committee ISO/TC 262',
    primaryStandard: 'ISO 31000:2018 Principles, Framework & Process',
    defaultControlsCount: 28,
    typicalAuditCadence: 'Continuous Risk Governance & Quarterly Board Risk Review',
    applicabilityCriteria: [
      'Enterprises establishing formal Enterprise Risk Management (ERM)',
      'Executive leadership and Board Risk Committees'
    ],
    commonOverlaps: ['iso27001', 'cobit', 'mas_trm'],
    badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    iconName: 'Flame',
    keyBenefits: [
      'Integrates cyber risk directly into executive capital allocation decisions',
      'Standardized risk appetite scales across probability and financial loss',
      'Provides unified risk language across business units'
    ],
    mandatoryArtifacts: [
      'Enterprise Risk Management Policy & Framework',
      'Board Risk Appetite Statement (RAS)',
      'Enterprise Risk Register with Inherent & Residual Scoring',
      'Risk Treatment Action Plans & Ownership Matrix'
    ]
  },

  // 9. GOVERNANCE
  {
    id: 'cobit',
    code: 'COBIT 2019',
    name: 'COBIT 2019 Framework',
    fullTitle: 'Control Objectives for Information and Related Technologies',
    category: 'Governance',
    description: 'Comprehensive framework for the governance and management of enterprise information and technology, bridging technical and executive leadership.',
    whatItMeans: 'Aligns IT operations with business strategy, ensuring technology investments deliver value while managing risk and regulatory compliance.',
    regulatoryBody: 'ISACA',
    primaryStandard: 'COBIT 2019 Framework: Governance and Management Objectives',
    defaultControlsCount: 40,
    typicalAuditCadence: 'Annual IT Governance Review & Maturity Assessment',
    applicabilityCriteria: [
      'Large enterprises, conglomerates, and financial institutions',
      'Organizations with complex multi-cloud and hybrid IT architectures'
    ],
    commonOverlaps: ['iso27001', 'iso31000', 'nist_csf'],
    badgeColor: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    iconName: 'Layers',
    keyBenefits: [
      'Bridges the gap between business objectives and technology execution',
      'Evaluates IT process capability maturity on a 0 to 5 scale',
      'Optimizes technology procurement and governance oversight'
    ],
    mandatoryArtifacts: [
      'IT Governance Charter & Steering Committee ToR',
      'Enterprise Architecture Roadmap',
      'Information & Technology Risk Appetite',
      'Service Level Agreements (SLAs) & Performance Scorecards'
    ]
  }
];

export const PROGRAM_CATEGORIES: Array<{
  category: ComplianceProgramDefinition['category'];
  title: string;
  description: string;
}> = [
  {
    category: 'Information Security',
    title: 'INFORMATION SECURITY',
    description: 'Establish foundational trust, information security controls, and international ISMS certification.'
  },
  {
    category: 'Privacy',
    title: 'PRIVACY & DATA PROTECTION',
    description: 'Comply with statutory personal data regulations, itemized consent, and global PIMS standards.'
  },
  {
    category: 'AI Governance',
    title: 'AI GOVERNANCE & RESPONSIBLE AI',
    description: 'Certify safety, model risk, data provenance, and ethical transparency in artificial intelligence.'
  },
  {
    category: 'Technology Risk',
    title: 'TECHNOLOGY RISK & REGULATORY',
    description: 'Meet statutory central bank notices, 1-hour incident SLAs, and cyber hygiene mandates.'
  },
  {
    category: 'Service Organization',
    title: 'SERVICE ORGANIZATION ASSURANCE',
    description: 'Deliver independent CPA-examined SOC 2 Type II trust services reports to enterprise buyers.'
  },
  {
    category: 'Security / Risk',
    title: 'SECURITY, HYGIENE & DEFENSE CONTROLS',
    description: 'Outcome-driven cybersecurity frameworks, CIS benchmarks, and payment card standards.'
  },
  {
    category: 'Business Continuity',
    title: 'BUSINESS RESILIENCE & CONTINUITY',
    description: 'Guarantee operational survival, disaster recovery failover, and high availability.'
  },
  {
    category: 'Risk Management',
    title: 'ENTERPRISE RISK MANAGEMENT',
    description: 'Quantify threats, establish board risk appetite, and systematize risk treatment.'
  },
  {
    category: 'Governance',
    title: 'ENTERPRISE IT GOVERNANCE',
    description: 'Align digital assets and engineering pipelines with organizational corporate governance.'
  }
];
