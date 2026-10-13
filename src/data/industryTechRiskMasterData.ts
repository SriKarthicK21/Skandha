// Industry Technology Risk Management Master Regulatory & Supervisory Intelligence
// Grounded in Financial Industry Technology Risk Management Supervisory Reports & Precedents
// Integrating Global Regulatory Standards, MAS TRM Notice & Guidelines, 
// 6 Grouped Impact Areas, Banking vs Insurance Benchmarking, 4-Step Compliance Program & Case Studies.

export interface IndustryBenchmarkItem {
  domain: string;
  bankingPercentage: number;
  insurancePercentage: number;
  isHighestIssueArea?: boolean;
  isMostPopularIssueArea?: boolean;
  description: string;
  auditTakeaway: string;
}

export interface GroupedImpactArea {
  id: number;
  name: string;
  badge: string;
  consultationPaperBaseline: string;
  trmGuidelinesRequirement: string;
  businessImpactSummary: string;
  keyRequirements: string[];
  keyQuestionsToConsider: string[];
  costImpact: 'LOW' | 'MEDIUM' | 'HIGH' | 'MEDIUM_HIGH';
  systemsImpact: boolean;
  processImpact: boolean;
  frameworkImpact: boolean;
}

export interface ComplianceProgramStep {
  stepNumber: number;
  name: string;
  phaseLabel: string;
  activities: string[];
  deliverables: string[];
  executiveFocus: string;
}

export interface SupervisoryCaseStudy {
  id: string;
  title: string;
  institutionType: 'Onshore Commercial Bank' | 'Offshore Global Bank';
  inspectionContext: string;
  identifiedIssues: string[];
  supervisoryRemediationActions: string[];
  businessAndRegulatoryImpact: string[];
  keyLessonsLearned: string[];
}

export interface StatutoryFIDefinition {
  code: string;
  category: string;
  enablingAct: string;
  scopeNotes: string;
}

// 1. Definition of Financial Institutions under Section 27A(6) of MAS Act (Cap. 186)
export const STATUTORY_FI_DEFINITIONS: StatutoryFIDefinition[] = [
  {
    code: 'BANK',
    category: 'Banks',
    enablingAct: 'Banking Act (Cap. 19)',
    scopeNotes: 'All licensed commercial banks, merchant banks, and wholesale banking institutions operating in Singapore.'
  },
  {
    code: 'FINANCE_CO',
    category: 'Finance Companies',
    enablingAct: 'Finance Companies Act (Cap. 108)',
    scopeNotes: 'All licensed finance companies providing credit facilities and deposit taking.'
  },
  {
    code: 'REMITTANCE_MCRB',
    category: 'Money-Changers & Remittance',
    enablingAct: 'Money-changing and Remittance Businesses Act (Cap. 187) / Payment Services Act (PSA)',
    scopeNotes: 'Money-changing licensees, cross-border remittance providers, and major payment institutions.'
  },
  {
    code: 'INSURER',
    category: 'Direct Insurers & Reinsurers',
    enablingAct: 'Insurance Act (Cap. 142)',
    scopeNotes: 'Life and general direct insurers, reinsurers, and insurance intermediaries registered under MAS.'
  },
  {
    code: 'FIN_ADVISER',
    category: 'Licensed Financial Advisers',
    enablingAct: 'Financial Advisers Act (Cap. 110)',
    scopeNotes: 'Firms licensed to provide advice on investment products, collective investment schemes, and life policies.'
  },
  {
    code: 'CMS_EXCHANGE',
    category: 'Capital Markets & Exchanges',
    enablingAct: 'Securities and Futures Act (Cap. 289)',
    scopeNotes: 'Approved exchanges, recognised market operators, designated clearing houses, and Capital Markets Services (CMS) license holders.'
  },
  {
    code: 'TRUSTEE_CIS',
    category: 'Collective Investment Scheme Trustees',
    enablingAct: 'Securities and Futures Act (Cap. 289) Sec 286',
    scopeNotes: 'Approved trustees acting for collective investment schemes and authorized unit trusts.'
  },
  {
    code: 'BUSINESS_TRUST',
    category: 'Trustee-Managers of Business Trusts',
    enablingAct: 'Business Trusts Act (Cap. 31A)',
    scopeNotes: 'Registered trustee-managers managing registered business trust operations and assets.'
  },
  {
    code: 'TRUST_CO',
    category: 'Licensed Trust Companies',
    enablingAct: 'Trust Companies Act (Cap. 336)',
    scopeNotes: 'Licensed trust corporations providing trustee services, custodial administration, and trust management.'
  },
  {
    code: 'PAYMENT_SVF',
    category: 'Stored Value & Payment Operators',
    enablingAct: 'Payment Systems (Oversight) Act (Cap. 222A) / Payment Services Act 2019',
    scopeNotes: 'Designated payment systems, stored value facility holders, digital payment token services, and merchant acquirers.'
  }
];

// 2. Supervisory Benchmark: Banking vs. Insurance Reported Deficiencies by Domain
export const INDUSTRY_BENCHMARK_REPORTED_ISSUES: IndustryBenchmarkItem[] = [
  {
    domain: 'Operational Infrastructure Security Management',
    bankingPercentage: 27,
    insurancePercentage: 31,
    isHighestIssueArea: true,
    description: 'Hardware/software asset inventory, End-of-Support/End-of-Life (EOS/EOL) components, baseline security configurations, patch management, and real-time security event monitoring.',
    auditTakeaway: 'The single highest volume of audit findings across both industries (27% in Banking, 31% in Insurance). Regulators heavily scrutinise unsupported legacy platforms and unpatched vulnerabilities.'
  },
  {
    domain: 'Access Control & Identity Management',
    bankingPercentage: 14,
    insurancePercentage: 9,
    description: 'Strong authentication (MFA/2FA) for privileged users, password complexity, role-based access, and timely user de-provisioning.',
    auditTakeaway: 'Banks face significantly higher access control scrutiny (14% vs 9%) due to high transactional velocity and privileged database access.'
  },
  {
    domain: 'Acquisition & Development of Information Systems',
    bankingPercentage: 7,
    insurancePercentage: 13,
    description: 'Secure SDLC, project management frameworks, business cases for IT changes, and governance over End-User Computing (EUC - spreadsheets/macros).',
    auditTakeaway: 'Insurance exhibits nearly double the deficiency rate (13% vs 7%) due to heavy reliance on unmanaged spreadsheet pricing models and legacy actuarial tools.'
  },
  {
    domain: 'Online Financial Services & Mobile Security',
    bankingPercentage: 10,
    insurancePercentage: 11,
    description: 'Transaction-signing for high-risk transfers, mobile app security strategies, sensitive cardholder data encryption, and fraud counter-measures.',
    auditTakeaway: 'Critical domain for consumer-facing portals; requires robust transaction signing and customer security education.'
  },
  {
    domain: 'IT Service Management (ITSM)',
    bankingPercentage: 9,
    insurancePercentage: 10,
    description: 'Problem management trend analysis, incident classification, ITIL process adherence, and post-implementation project reviews.',
    auditTakeaway: 'Consistent deficiency area (~10%) where incident handling is performed ad-hoc without structured root-cause trend analysis.'
  },
  {
    domain: 'Oversight by Board and Senior Management',
    bankingPercentage: 8,
    insurancePercentage: 10,
    description: 'Senior management involvement in IT decisions, board-approved Technology Risk Management Framework, and enterprise risk registers.',
    auditTakeaway: 'Supervisory inspections frequently find that technology risks are not elevated to the Board Risk Committee in quantifiable business terms.'
  },
  {
    domain: 'Data Centres Protection and Controls',
    bankingPercentage: 8,
    insurancePercentage: 4,
    description: 'Physical perimeter security (guards, card access, mantraps, bollards) and formal Threat and Vulnerability Risk Assessment (TVRA).',
    auditTakeaway: 'Physical data center controls and TVRA compliance are strictly audited for Tier 3/4 hosting facilities.'
  },
  {
    domain: 'Systems Reliability, Availability & Recoverability',
    bankingPercentage: 7,
    insurancePercentage: 4,
    description: 'High availability (<= 4 hrs unscheduled downtime), RTO <= 4 hours, annual DR testing, and immediate failover notification to MAS.',
    auditTakeaway: 'Critical regulatory tripwire: failure to prove RTO <= 4h or failure to notify MAS of failovers triggers supervisory sanction.'
  },
  {
    domain: 'Management of IT Outsourcing Risks',
    bankingPercentage: 7,
    insurancePercentage: 6,
    isMostPopularIssueArea: true,
    description: 'Vendor due diligence, contractual right-to-audit clauses for MAS and internal auditors, and disaster recovery alignment of third-party service providers.',
    auditTakeaway: 'The single most widely recurring regulatory finding across FIs. Most institutions fail to secure unrestricted audit rights or review vendor SOC 2 reports.'
  },
  {
    domain: 'Technology Risk Management Framework',
    bankingPercentage: 3,
    insurancePercentage: 1,
    description: 'Formalized enterprise technology risk taxonomy, risk assessment methodologies, and employee background screening.',
    auditTakeaway: 'Baseline foundation; low direct finding percentage because deficiencies manifest down-stream in operational security and access control.'
  },
  {
    domain: 'IT Internal Audit',
    bankingPercentage: 3,
    insurancePercentage: 1,
    description: 'Independent validation of technology controls, review of prior MAS inspection findings, and risk universe coverage.',
    auditTakeaway: 'Auditors must demonstrate independent validation of regulatory remediation rather than relying solely on management assertions.'
  }
];

// 3. The 6 Grouped Impact Areas Identified by Supervisory Precedents
export const SIX_GROUPED_IMPACT_AREAS: GroupedImpactArea[] = [
  {
    id: 1,
    name: 'Notice & Statutory Legal Obligations',
    badge: 'Legally Binding Notice',
    consultationPaperBaseline: 'Single Notice proposed with 30-minute incident notification and 1-month root cause submission.',
    trmGuidelinesRequirement: 'Separate Notices per FI type with identical binding legal contents. Notification within 1 hour of discovery of a relevant incident; Root Cause Analysis (RCA) within 14 days.',
    businessImpactSummary: 'Statutory compliance is legally binding under Singapore Acts. Non-compliance results in financial penalties, reputational damage, and license revocation.',
    keyRequirements: [
      'Redefinition of "Critical System", "System Malfunction", and "Relevant Incident"',
      'Mandatory incident notification to MAS no later than 1 hour upon discovery',
      'Submission of formal Root Cause Analysis (RCA) within 14 days of discovery (extensions by approval only)',
      'Applicable to all financial institutions across all IT systems including internet services'
    ],
    keyQuestionsToConsider: [
      'Have you formalized a "discovery" protocol that clearly defines when an incident triggers the 1-hour notification window?',
      'Is there an executive escalation matrix to obtain CISO/CEO approval for MAS regulatory filing within 60 minutes?',
      'Can your engineering teams produce a forensic root-cause analysis with corrective actions within 14 calendar days?'
    ],
    costImpact: 'HIGH',
    systemsImpact: true,
    processImpact: true,
    frameworkImpact: true
  },
  {
    id: 2,
    name: 'System Availability, Incident & Capacity Management',
    badge: 'RTO <= 4h & High Availability',
    consultationPaperBaseline: 'Proposed near-zero downtime; quarterly trend analysis required; no USB encryption or failover notification mandates.',
    trmGuidelinesRequirement: 'High availability for critical systems (<= 4 hours unscheduled downtime); inform MAS as soon as possible if a critical system fails over to DR; mandatory USB/media encryption; annual recovery plan evaluation; performance & capacity threshold monitoring.',
    businessImpactSummary: 'Requires architectural investment into Active:Active or robust Active:Passive (n+1) infrastructure, real-time telemetry, and formal capacity planning.',
    keyRequirements: [
      'High availability for critical systems: cumulative unscheduled downtime <= 4 hours per rolling 12 months',
      'Recovery Time Objective (RTO) of <= 4 hours for all critical banking systems',
      'Immediate notification to MAS whenever a critical system fails over to its Disaster Recovery system',
      'Mandatory encryption of USB disks and all physical media transported off-site for storage',
      'Annual testing and operational validation of recovery plans and incident response procedures',
      'Monitoring of performance, capacity, and utilization thresholds to determine resource needs proactively'
    ],
    keyQuestionsToConsider: [
      'Are critical systems architected for Active:Active or automated Active:Passive failover with verified RTO <= 4 hours?',
      'Have you automated alerts to notify the Regulatory Liaison as soon as a DR failover occurs?',
      'Are all USB drives, backup tapes, and removable media enforced with hardware or bitlocker encryption before leaving premises?'
    ],
    costImpact: 'HIGH',
    systemsImpact: true,
    processImpact: true,
    frameworkImpact: true
  },
  {
    id: 3,
    name: 'Operational Infrastructure Security & Access Management',
    badge: 'Privileged 2FA & EOL Tracking',
    consultationPaperBaseline: 'Proposed rigid quarterly vulnerability assessment and 2FA for privileged users.',
    trmGuidelinesRequirement: 'Implement strong authentication mechanisms (2FA/MFA) for privileged users; annual penetration testing required; dynamic hardware/software asset inventory with EOS/EOL tracking; security baseline configurations; real-time event monitoring.',
    businessImpactSummary: 'Accounts for 27% (Banking) and 31% (Insurance) of all regulatory deficiencies. Demands rigorous asset lifecycle management and privileged access governance.',
    keyRequirements: [
      'Inventory of software and hardware components with active End-of-Support / End-of-Life (EOS/EOL) monitoring',
      'Enforce strong authentication (2FA/MFA) for all administrative and privileged user access',
      'Standardized, hardened baseline configurations across servers, databases, and network equipment',
      'Robust patch management process with defined SLA for critical security vulnerabilities',
      'Real-time security event monitoring and detection of unauthorized changes to critical systems',
      'Annual external penetration testing and continuous vulnerability assessment'
    ],
    keyQuestionsToConsider: [
      'Do you maintain an automated CMDB tracking software/hardware versions and vendor End-of-Life dates?',
      'Is privileged database access monitored with file/database integrity monitoring (FIM/DAM)?',
      'How are security patches prioritized, tested, and deployed across critical production systems?'
    ],
    costImpact: 'HIGH',
    systemsImpact: true,
    processImpact: true,
    frameworkImpact: true
  },
  {
    id: 4,
    name: 'Development & Change Management',
    badge: 'DevSecOps & Non-Prod Internet Access',
    consultationPaperBaseline: 'Only production environments were permitted to connect to the Internet.',
    trmGuidelinesRequirement: 'Non-production environments are permitted to connect to the Internet PROVIDED a formal risk assessment has been performed and appropriate compensatory controls are in place.',
    businessImpactSummary: 'Enables modern cloud dev/test and CI/CD pipelines while requiring strict data masking and environment isolation from production.',
    keyRequirements: [
      'Documented risk assessment before allowing any non-production environment internet access',
      'Strict isolation between production and development/test environments',
      'Prohibition of live customer data in test environments without automated masking/tokenization',
      'Formal change management process with segregated roles, rollback plans, and post-implementation reviews'
    ],
    keyQuestionsToConsider: [
      'Is there a formal risk assessment on record approving non-prod internet connectivity for API testing or package downloads?',
      'Are test environments prevented from connecting directly to production databases or payment gateways?',
      'Is customer personal data (PII) masked or synthesized in development environments?'
    ],
    costImpact: 'MEDIUM',
    systemsImpact: true,
    processImpact: true,
    frameworkImpact: false
  },
  {
    id: 5,
    name: 'Mobile Online Services & Payment Security',
    badge: 'Transaction Signing & Fraud Detection',
    consultationPaperBaseline: 'Proposed token-based transaction signing for all high-value transactions; magnetic stripes strictly prohibited.',
    trmGuidelinesRequirement: 'Online systems servicing institutional investors may use alternative assessed controls; magnetic stripes allowed only for interoperability reasons with adequate compensating controls; mobile security strategy; encrypted sensitive data.',
    businessImpactSummary: 'Addresses consumer mobile banking proliferation, card payment fraud, and transaction-signing mandates.',
    keyRequirements: [
      'Comprehensive security strategy covering mobile banking applications and attack vectors',
      'Identification of fraud scenarios and implementation of mobile device counter-measures',
      'End-to-end encryption of sensitive customer data on mobile devices and during transit',
      'Transaction-signing for high-risk / high-value fund transfers and administrative changes',
      'Compensating controls for legacy magnetic stripe card transactions where EMV chip interoperability is required',
      'Customer education on mobile threats and security hygiene'
    ],
    keyQuestionsToConsider: [
      'Does your mobile application implement application shielding (anti-tampering, root/jailbreak detection, SSL pinning)?',
      'Are high-risk transactions authorized via out-of-band transaction-signing binding the recipient account and amount?',
      'Is customer authentication data encrypted on local mobile device storage using secure enclaves / keychains?'
    ],
    costImpact: 'MEDIUM_HIGH',
    systemsImpact: true,
    processImpact: true,
    frameworkImpact: true
  },
  {
    id: 6,
    name: 'Others: Key Management, TVRA, ITSM & Card Security',
    badge: 'TVRA, ITSM & EUC Controls',
    consultationPaperBaseline: 'Key single-purpose restriction; mandatory mirrored RAID; onsite visits to all datacentres.',
    trmGuidelinesRequirement: 'Key Management policy covering entire cryptographic lifecycle; TVRA on critical systems & data centres; robust ITSM/ITIL framework; project management framework; end-user computing (spreadsheets/macros) controls; payment card encryption and Fraud Detection Systems (FDS).',
    businessImpactSummary: 'Covers physical data center resiliency, cryptographic governance, service management maturity, and spreadsheet risk.',
    keyRequirements: [
      'Comprehensive Key Management policy covering key generation, distribution, storage, rotation, and revocation',
      'Threat and Vulnerability Risk Assessment (TVRA) conducted on critical systems and physical data centres',
      'IT Service Management (ITSM) framework with problem management trend analysis using ITIL principles',
      'Project management framework with formal business case and cost-benefit analysis for IT changes',
      'Inventory and methodology governing critical End-User Computing (EUC) tools, spreadsheets, and macros',
      'Payment card security: EMV secure chips, sensitive data encryption, online authorization, and FDS with behavioural scoring',
      'Customer awareness advisory to clear browser cache and prompt PIN change on suspected compromise'
    ],
    keyQuestionsToConsider: [
      'Has a formal TVRA been conducted for your primary and secondary data centers covering physical and blast risks?',
      'Do you maintain an inventory of business-critical spreadsheets and macros used in financial reporting or risk calculation?',
      'Does your card processing platform incorporate a Fraud Detection System (FDS) with real-time behavioural scoring?'
    ],
    costImpact: 'HIGH',
    systemsImpact: true,
    processImpact: true,
    frameworkImpact: true
  }
];

// 4. The 4-Step MAS TRM Compliance Program Lifecycle
export const COMPLIANCE_PROGRAM_STEPS: ComplianceProgramStep[] = [
  {
    stepNumber: 1,
    name: 'Assess',
    phaseLabel: 'Discovery & Gap Prioritisation',
    activities: [
      'Review existing technology risk management framework, policies, processes, and systems',
      'Perform detailed GAP analysis against MAS TRM Notices and Guidelines',
      'Conduct risk prioritisation workshops across Business, IT, Risk, and Compliance stakeholders',
      'Benchmark current operational state against MAS supervisory inspection criteria'
    ],
    deliverables: [
      'Comprehensive MAS TRM Gap Analysis Report',
      'Risk-Prioritised Deficiency Matrix',
      'Detailed Remediation Action Plan (CAPA Roadmap) with cost/resource estimates'
    ],
    executiveFocus: 'Establish clarity on regulatory non-compliance exposure and secure leadership buy-in.'
  },
  {
    stepNumber: 2,
    name: 'Define',
    phaseLabel: 'Framework, Governance & Solution Design',
    activities: [
      'Design comprehensive TRM framework, policies, operating standards, and control procedures',
      'Design governance structure (Board Risk Committee, IT Steering Committee, CISO mandate)',
      'Define technical solution specifications (Active:Active architecture, PAM, SIEM, MFA, tokenization)',
      'Establish critical systems criteria, RTO/RPO metrics, and 1-hour incident escalation protocols'
    ],
    deliverables: [
      'Enterprise TRM Framework & Policy Suite',
      'TRM Governance Charter & Escalation Matrix',
      'Technology Solution Specifications & Architectural Blueprints'
    ],
    executiveFocus: 'Ensure governance structures empower informed board decisions and engineering designs meet RTO <= 4h.'
  },
  {
    stepNumber: 3,
    name: 'Implementation & Rollout',
    phaseLabel: 'Engineering Execution & Control Validation',
    activities: [
      'Deploy and configure technology solutions (PAM, SIEM, MFA, Active:Active replication, WORM logging)',
      'Operationalize governance committees, change approval gates, and incident management teams',
      'Develop comprehensive staff training materials, standard operating procedures, and runbooks',
      'Conduct pre-implementation testing to validate control effectiveness before production launch'
    ],
    deliverables: [
      'Rolled-out Technical Solutions & Hardened Configurations',
      'Staff Training Materials & Procedure Documentation',
      'Pre-Implementation Control Effectiveness Test Results'
    ],
    executiveFocus: 'Verify operating effectiveness through empirical testing rather than paper attestations.'
  },
  {
    stepNumber: 4,
    name: 'Review & Monitor',
    phaseLabel: 'Continuous Assurance & Regulatory Reporting',
    activities: [
      'Establish continuous monitoring of technology risks, KRIs, and control operating effectiveness',
      'Execute regular post-implementation reviews and annual Disaster Recovery drills (validating RTO <= 4h)',
      'Conduct annual independent IT audits and external penetration testing',
      'Prepare regulatory compliance review reports and Board Technology Risk quarterly packs'
    ],
    deliverables: [
      'Continuous Technology Risk Reporting & KRI Dashboard',
      'Disaster Recovery Test Results (RTO/RPO Attestations)',
      'Annual Compliance Review & Board Audit Committee Dossier'
    ],
    executiveFocus: 'Maintain perpetual audit readiness and demonstrate continuous improvement to MAS inspectors.'
  }
];

// 5. Authoritative Case Studies from Industry Practice
export const SUPERVISORY_CASE_STUDIES: SupervisoryCaseStudy[] = [
  {
    id: 'CASE-ONSHORE-BANK',
    title: 'Onshore Commercial Bank: MAS Critical Systems & 4-Hour RTO Remediation',
    institutionType: 'Onshore Commercial Bank',
    inspectionContext: 'MAS completed an on-site technology risk inspection and issued formal findings citing inadequate risk management around critical systems and inability to prove adherence to the statutory 4-hour RTO mandate.',
    identifiedIssues: [
      'Risk management processes around critical systems were not formalized or documented.',
      'Disaster Recovery Plan (DRP) lacked empirical evidence proving that critical core banking systems could recover within the statutory 4-hour RTO.',
      'Single points of failure identified in underlying database clusters and network backbones.',
      'No formal Business Impact Analysis (BIA) linking business lines to critical IT assets.'
    ],
    supervisoryRemediationActions: [
      'Conducted end-to-end production environment and architectural review for all critical applications and supporting business lines.',
      'Facilitated cross-functional risk assessment workshops engaging Business, IT, Tech Risk, and Operational Risk stakeholders.',
      'Identified critical information and technology assets in each application and analyzed potential regulatory and financial consequences.',
      'Reviewed design effectiveness of existing internal controls and conducted residual risk assessments.',
      'Defined budgeted spend constraints to architect cost-effective Active:Active replication for systems requiring RTO <= 4h.'
    ],
    businessAndRegulatoryImpact: [
      'Assisted all stakeholders to understand their information assets and specific technology risk exposures.',
      'Regulatory insights enabled the bank to make cost-effective architectural decisions within budgeted spend.',
      'Enabled the bank to submit a verified completion report to MAS within the stipulated supervisory deadline.',
      'Established a uniform, repeatable technology risk assessment methodology across the bank.'
    ],
    keyLessonsLearned: [
      'MAS does not accept theoretical RTO targets; empirical failover test logs are mandatory.',
      'Cross-stakeholder engagement between Business and IT is essential to avoid over-scoping or under-scoping critical systems.',
      'Cost-effective compliance is achieved by tiering systems rather than applying Active:Active indiscriminately.'
    ]
  },
  {
    id: 'CASE-OFFSHORE-BANK',
    title: 'Offshore Global Bank: 72-Issue Regional Harmonization for Singapore Operations',
    institutionType: 'Offshore Global Bank',
    inspectionContext: 'A global bank engaged external review to evaluate its global technology policies, procedures, and controls against APAC regulators, revealing over 72 compliance gaps specific to MAS Singapore requirements.',
    identifiedIssues: [
      'Over 72 specific regulatory gaps between global IT standards and MAS TRM Guidelines.',
      'Critical systems servicing Singapore customers were hosted in global offshore data centers with conflicting jurisdictional access controls.',
      'Incident escalation procedures did not support the mandatory 1-hour MAS notification SLA.',
      'Third-party cloud and outsourcing contracts lacked required MAS right-to-audit clauses.'
    ],
    supervisoryRemediationActions: [
      'Segmented issues into quick-win prescriptive changes and longer-term architectural transformations.',
      'Engaged business and technical stakeholders to develop cost-effective remediation plans for global data centers hosting Singapore critical workloads.',
      'Established Singapore-specific operational addenda to global policies to bridge regulatory gaps without disrupting global operating models.',
      'Designed automated incident alerting runbooks to meet the 60-minute MAS notification statutory requirement.'
    ],
    businessAndRegulatoryImpact: [
      'Provided a structured framework to adhere to MAS regulations while preserving global operational efficiency.',
      'Developed innovative shared solutions with internal bank staff, saving multi-million dollar relocation costs.',
      'Successfully resolved all 72 MAS regulatory gaps prior to formal supervisory audit.'
    ],
    keyLessonsLearned: [
      'Global banking templates frequently fail MAS requirements around incident reporting SLAs and audit access rights.',
      'Prescriptive quick wins build immediate credibility with supervisory inspectors while complex data center remediations are underway.',
      'Offshore hosting of critical systems requires dedicated local governance and contractual audit rights.'
    ]
  }
];

// 6. Statutory Cost & Impact Decision Matrix
export const INDUSTRY_COST_IMPACT_MATRIX = [
  {
    actionRequired: 'Define Critical Systems & Business Impact Analysis (BIA)',
    frameworkImpact: true,
    processImpact: true,
    systemsImpact: false,
    costLevel: 'LOW',
    costDescription: 'Primarily advisory, workshop, and documentation effort.',
    statutoryRef: 'MAS TRM Sec 3 & Notice 655'
  },
  {
    actionRequired: 'Critical Systems High Availability (<= 4h Unscheduled Downtime)',
    frameworkImpact: true,
    processImpact: true,
    systemsImpact: true,
    costLevel: 'HIGH',
    costDescription: 'Significant capital expenditure for Active:Active clustering, redundant data paths, and license replication.',
    statutoryRef: 'MAS TRM Sec 8.1 & Notice 655'
  },
  {
    actionRequired: 'Downtime & High Availability Monitoring Mechanism',
    frameworkImpact: false,
    processImpact: true,
    systemsImpact: true,
    costLevel: 'MEDIUM_TO_HIGH',
    costDescription: 'APM / SIEM synthetic transaction monitoring and SLA tracking tools.',
    statutoryRef: 'MAS TRM Sec 8.2'
  },
  {
    actionRequired: 'Recovery Plan (RTO <= 4h) with Annual Empirical Testing',
    frameworkImpact: true,
    processImpact: true,
    systemsImpact: true,
    costLevel: 'HIGH',
    costDescription: 'Dedicated DR site/cloud hosting, test rehearsals, and potential business interruption management.',
    statutoryRef: 'MAS TRM Sec 8.3 & Notice 655'
  },
  {
    actionRequired: 'Incident Handling Process to achieve 1-Hour Notification to MAS',
    frameworkImpact: true,
    processImpact: true,
    systemsImpact: true,
    costLevel: 'HIGH',
    costDescription: '24/7 SOC integration, automated paging, on-call Incident Commander roster, and regulatory filing runbooks.',
    statutoryRef: 'MAS Notice 655 Sec 3'
  },
  {
    actionRequired: 'Capacity Management & Performance Threshold Process',
    frameworkImpact: true,
    processImpact: true,
    systemsImpact: true,
    costLevel: 'MEDIUM_TO_HIGH',
    costDescription: 'Infrastructure observability tools and automated capacity forecasting models.',
    statutoryRef: 'MAS TRM Sec 7.4'
  }
];
