import { RegulatoryRequirement } from '../types/regulatoryTypes';

export const MAS_TRM_REQUIREMENTS_2021: RegulatoryRequirement[] = [
  // --- 3.0 Technology Risk Governance and Oversight ---
  {
    id: 'REQ-MAS-3.1',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-03',
    domainNumber: '3.0',
    domainName: 'Technology Risk Governance and Oversight',
    sectionNumber: '3.1',
    requirementCode: 'MAS-TRM-3.1',
    title: 'Board of Directors and Senior Management Governance',
    statement: 'The Board of Directors and Senior Management shall establish and maintain an effective technology risk management framework, ensure key IT decisions align with risk appetite, cultivate a strong risk awareness culture, and approve formal risk tolerance statements.',
    intentAndGuidance: 'The Board must maintain adequate technology competency, review tech risk posture at least quarterly, and ensure independent risk oversight. CISO must have independent reporting to CEO or Board Risk Committee.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 3.1.1 - 3.1.8 & Footnotes 1-2',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'Quarterly Board Technology Risk Information Pack and review minutes.',
      'Clear definition of Board and executive technology management responsibilities (RACI).',
      'Board-approved Enterprise Technology Risk Appetite Statement (TRAS).'
    ],
    testProcedures: [
      'Inspect Board meeting minutes for quarterly tech risk agenda and challenge records.',
      'Verify signed charter of Board Risk Committee specifying technology risk oversight.',
      'Review annual Board technology risk training completion records.'
    ],
    evidenceRequirements: [
      'Board Risk Committee Charter & Approved TOR',
      'Quarterly Board Technology Risk Dashboard & Meeting Minutes',
      'Executive Technology Risk Appetite Statement (TRAS)'
    ],
    responsibleRoles: ['Chief Risk Officer', 'CISO', 'Board of Directors Chair'],
    recommendedReviewFrequency: 'Quarterly',
    crossFrameworkMappings: {
      iso27001: ['A.5.1', 'A.5.2', 'A.5.4'],
      nistCsf: ['GV.OC-01', 'GV.RR-01'],
      soc2Criteria: ['CC1.2', 'CC1.3']
    }
  },
  {
    id: 'REQ-MAS-3.2',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-03',
    domainNumber: '3.0',
    domainName: 'Technology Risk Governance and Oversight',
    sectionNumber: '3.2',
    requirementCode: 'MAS-TRM-3.2',
    title: 'Independent Chief Information Security Officer (CISO)',
    statement: 'The FI shall appoint a dedicated, competent CISO (or equivalent) with sufficient authority, resources, and independence from day-to-day IT operations to oversee cybersecurity and technology risk.',
    intentAndGuidance: 'The CISO must have direct reporting access to the CEO or Board Risk Committee to eliminate operational delivery conflicts of interest.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 3.1.3 & Footnote 1',
    mandatoryForFIs: true,
    criticalSystemsMandate: false,
    controlObjectives: [
      'Formal CISO appointment approved minimally by CEO.',
      'Independent reporting line to CRO, CEO, or Board Risk Committee.',
      'Adequate security budget and qualified cybersecurity personnel allocation.'
    ],
    testProcedures: [
      'Review organization chart and verify CISO does not report directly to CIO without independent escalation.',
      'Inspect CISO professional credentials (CISSP, CISM) and formal job description.'
    ],
    evidenceRequirements: [
      'CISO Formal Job Description & Delegated Authority Matrix',
      'Organizational Hierarchy Organogram signed by CEO'
    ],
    responsibleRoles: ['Chief Information Security Officer', 'Chief Human Resources Officer'],
    recommendedReviewFrequency: 'Annual',
    crossFrameworkMappings: {
      iso27001: ['A.5.2', 'A.5.3'],
      nistCsf: ['GV.RR-02', 'GV.RR-04']
    }
  },
  {
    id: 'REQ-MAS-3.3',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-03',
    domainNumber: '3.0',
    domainName: 'Technology Risk Governance and Oversight',
    sectionNumber: '3.3',
    requirementCode: 'MAS-TRM-3.3',
    title: 'Management of Information Assets & Dynamic Inventory',
    statement: 'The FI shall maintain a comprehensive and complete view of its IT operating environment, maintaining an updated inventory of all information assets supporting financial services, classified by criticality and data sensitivity.',
    intentAndGuidance: 'Assets include data, hardware, software, customer/third-party entrusted assets, and cloud resources. Inventories must be reviewed periodically and updated upon changes.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 3.3.1 - 3.3.2 & Footnote 3',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'Dynamic CMDB tracking 100% of servers, databases, containers, and network appliances.',
      'Asset classification scheme distinguishing Critical Information Systems (CIS) and confidential data.',
      'Clear asset ownership assigned for every registered information asset.'
    ],
    testProcedures: [
      'Sample 30 active IP addresses and verify corresponding entries in CMDB inventory.',
      'Inspect asset classification metadata and verify annual ownership recertification.'
    ],
    evidenceRequirements: [
      'Enterprise Information Asset Inventory & CMDB Export',
      'Information Asset Classification and Handling Standard'
    ],
    responsibleRoles: ['Head of Enterprise Architecture', 'Asset Owners', 'CISO'],
    recommendedReviewFrequency: 'Quarterly',
    crossFrameworkMappings: {
      iso27001: ['A.5.9', 'A.5.10', 'A.5.12'],
      nistCsf: ['ID.AM-01', 'ID.AM-02'],
      soc2Criteria: ['CC6.1']
    }
  },
  {
    id: 'REQ-MAS-3.4',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-03',
    domainNumber: '3.0',
    domainName: 'Technology Risk Governance and Oversight',
    sectionNumber: '3.4',
    requirementCode: 'MAS-TRM-3.4',
    title: 'Management of Third Party Services & Technology Outsourcing',
    statement: 'The FI shall assess and manage technology risks affecting confidentiality, integrity, and availability before entering third-party agreements, ensuring third parties employ high standards of care, diligence, and cyber resilience.',
    intentAndGuidance: 'Applies to both outsourcing and non-outsourcing third-party arrangements storing or processing customer info electronically. Ongoing monitoring and right-to-audit clauses are required.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 3.4.1 - 3.4.3 & MAS Outsourcing Guidelines',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'Pre-contract vendor security due diligence and threat assessment.',
      'Contractual right-to-audit and mandatory 1-hour incident notification clauses.',
      'Annual review of third-party SOC 2 Type II / ISO 27001 audit attestations.'
    ],
    testProcedures: [
      'Review vendor risk assessment records for top 5 critical technology suppliers.',
      'Verify contractual security clauses including audit rights and breach notification SLAs.'
    ],
    evidenceRequirements: [
      'Third-Party Technology Risk Assessment Register',
      'Vendor Standard Security Schedule & Right-to-Audit Clauses'
    ],
    responsibleRoles: ['Head of Procurement', 'Vendor Risk Manager', 'CISO'],
    recommendedReviewFrequency: 'Annual',
    crossFrameworkMappings: {
      iso27001: ['A.5.19', 'A.5.20', 'A.5.21', 'A.5.22'],
      nistCsf: ['GV.SC-01', 'GV.SC-04']
    }
  },
  {
    id: 'REQ-MAS-3.6',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-03',
    domainNumber: '3.0',
    domainName: 'Technology Risk Governance and Oversight',
    sectionNumber: '3.6',
    requirementCode: 'MAS-TRM-3.6',
    title: 'Security Awareness and Board Technology Risk Training',
    statement: 'The FI shall conduct a comprehensive IT security awareness training programme at least annually for all staff, contractors, and service providers, and ensure the Board of Directors undergoes specialized training on technology risks and TRM practices.',
    intentAndGuidance: 'Curriculum must cover prevailing cyber threats, employee responsibilities, and relevant regulations. Simulated phishing exercises should complement classroom training.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 3.6.1 - 3.6.4',
    mandatoryForFIs: true,
    criticalSystemsMandate: false,
    controlObjectives: [
      'Annual security awareness completion tracking > 95% across all employees.',
      'Specialized technology risk briefing delivered to Board of Directors.',
      'Periodic simulated phishing campaigns with targeted remediation for repeat clickers.'
    ],
    testProcedures: [
      'Inspect LMS employee training completion logs for the trailing 12 months.',
      'Review Board training materials and attendance sign-off sheet.'
    ],
    evidenceRequirements: [
      'Annual Security Awareness Training Completion Ledger',
      'Board of Directors Technology Risk Masterclass Deck & Minutes'
    ],
    responsibleRoles: ['Head of Information Security Awareness', 'Chief HR Officer'],
    recommendedReviewFrequency: 'Annual',
    crossFrameworkMappings: {
      iso27001: ['A.6.3'],
      nistCsf: ['PR.AT-01', 'PR.AT-02']
    }
  },

  // --- 4.0 Technology Risk Management Framework ---
  {
    id: 'REQ-MAS-4.1',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-04',
    domainNumber: '4.0',
    domainName: 'Technology Risk Management Framework',
    sectionNumber: '4.1',
    requirementCode: 'MAS-TRM-4.1',
    title: 'Enterprise Technology Risk Management Framework (TRMF)',
    statement: 'The FI shall establish a comprehensive TRMF covering Risk Identification, Risk Assessment, Risk Treatment, and Risk Monitoring/Reporting, assigning accountable risk owners and reviewing framework adequacy regularly.',
    intentAndGuidance: 'The framework must provide governance structures, well-defined reporting lines, and quantifiable metrics highlighting information assets with the highest risk exposure.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 4.1.1 - 4.1.5',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'Approved Technology Risk Management Framework (TRMF) policy document.',
      'Designated accountable risk owners for all technology assets and processes.',
      'Dynamic enterprise technology risk register maintained and updated quarterly.'
    ],
    testProcedures: [
      'Verify approved TRMF document signed by CRO and approved by Board.',
      'Inspect risk register and verify assigned risk owners for critical risks.'
    ],
    evidenceRequirements: [
      'Approved Technology Risk Management Framework Policy',
      'Enterprise Technology Risk Register with KRI Thresholds'
    ],
    responsibleRoles: ['Chief Risk Officer', 'Head of Operational Risk', 'CISO'],
    recommendedReviewFrequency: 'Annual',
    crossFrameworkMappings: {
      iso27001: ['A.5.1', 'Clause 6.1'],
      nistCsf: ['ID.RA-01', 'GV.RM-01']
    }
  },
  {
    id: 'REQ-MAS-4.4',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-04',
    domainNumber: '4.0',
    domainName: 'Technology Risk Management Framework',
    sectionNumber: '4.4',
    requirementCode: 'MAS-TRM-4.4',
    title: 'Risk Treatment, Risk Acceptance & Cyber Insurance',
    statement: 'The FI shall develop and implement risk treatment controls consistent with criticality and risk tolerance, assess residual risks with formal approving authorities for risk acceptance, and consider cyber insurance for insurable technology risks.',
    intentAndGuidance: 'No risk acceptance may be granted informally. Residual risk exceeding tolerance must escalate to executive management with explicit expiry dates.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 4.4.1 - 4.4.3',
    mandatoryForFIs: true,
    criticalSystemsMandate: false,
    controlObjectives: [
      'Formal Risk Acceptance workflow with CRO/CISO dual approval.',
      'Maximum 12-month validity period for any accepted technology risk exception.',
      'Cyber insurance policy covering incident response, forensic, and business disruption costs.'
    ],
    testProcedures: [
      'Inspect risk acceptance memos and check for expired or unauthorized risk acceptances.',
      'Review active cyber insurance policy certificate and insured limits.'
    ],
    evidenceRequirements: [
      'Risk Acceptance Procedure & Active Exemption Register',
      'Corporate Cyber Liability Insurance Policy Schedule'
    ],
    responsibleRoles: ['Chief Risk Officer', 'CISO'],
    recommendedReviewFrequency: 'Bi-Annual',
    crossFrameworkMappings: {
      iso27001: ['Clause 6.1.3', 'Clause 8.3'],
      nistCsf: ['ID.RA-06']
    }
  },

  // --- 5.0 IT Project Management and Security-by-Design ---
  {
    id: 'REQ-MAS-5.3',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-05',
    domainNumber: '5.0',
    domainName: 'IT Project Management and Security-by-Design',
    sectionNumber: '5.3',
    requirementCode: 'MAS-TRM-5.3',
    title: 'System Acquisition, COTS Solutions & Source Code Escrow',
    statement: 'The FI shall establish vendor evaluation standards, assess vendor SDLC/QA practices, assess risks of Commercial Off-The-Shelf (COTS) solutions prior to deployment, and evaluate source code escrow agreements based on software criticality.',
    intentAndGuidance: 'Source code escrow guarantees that the FI can access source code to maintain operational continuity if a critical software vendor ceases business operations.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 5.3.1 - 5.3.4 & Footnote 6',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'Formal vendor solution evaluation and security vetting standards.',
      'Risk assessment of COTS software before production deployment.',
      'Source code escrow agreements executed for critical core banking and payment solutions.'
    ],
    testProcedures: [
      'Inspect active source code escrow agreements with escrow agents (e.g. NCC Group / Iron Mountain).',
      'Review security evaluation reports for newly acquired third-party software.'
    ],
    evidenceRequirements: [
      'Tripartite Source Code Escrow Agreement & Annual Verification Attestation',
      'COTS Pre-Deployment Security Architecture Evaluation Report'
    ],
    responsibleRoles: ['Head of Procurement', 'Head of Enterprise Architecture', 'Legal Counsel'],
    recommendedReviewFrequency: 'Annual',
    crossFrameworkMappings: {
      iso27001: ['A.5.20', 'A.8.30'],
      nistCsf: ['GV.SC-05']
    }
  },
  {
    id: 'REQ-MAS-5.4',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-05',
    domainNumber: '5.0',
    domainName: 'IT Project Management and Security-by-Design',
    sectionNumber: '5.4',
    requirementCode: 'MAS-TRM-5.4',
    title: 'SDLC and Security-By-Design Principles',
    statement: 'The FI shall establish a comprehensive SDLC framework embedding security-by-design across all phases (requirements, design, testing, deployment, maintenance, disposal), with active involvement of the IT security function.',
    intentAndGuidance: 'Security requirements must minimally cover access control, authentication, authorization, data integrity, activity logging, security tracking, and exception handling.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 5.4.1 - 5.4.4',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'Documented Secure SDLC policy with mandatory security milestones.',
      'Formal threat modeling performed during architectural design phase.',
      'Sign-off from IT security function required at each project gate.'
    ],
    testProcedures: [
      'Sample 3 recent software releases and verify threat modeling artifacts.',
      'Verify IT security approval sign-off before production cutover.'
    ],
    evidenceRequirements: [
      'Secure SDLC Policy & Quality Gate Standards',
      'Application Threat Modeling Reports (STRIDE / DREAD methodology)'
    ],
    responsibleRoles: ['Head of Software Engineering', 'Security Architect', 'CTO'],
    recommendedReviewFrequency: 'Annual',
    crossFrameworkMappings: {
      iso27001: ['A.8.25', 'A.8.27', 'A.8.29'],
      nistCsf: ['PR.DS-01', 'PR.IP-01']
    }
  },

  // --- 6.0 Software Application Development and Management ---
  {
    id: 'REQ-MAS-6.1',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-06',
    domainNumber: '6.0',
    domainName: 'Software Application Development and Management',
    sectionNumber: '6.1',
    requirementCode: 'MAS-TRM-6.1',
    title: 'Secure Coding, Code Review & Application Security Testing (AST)',
    statement: 'The FI shall establish standards on secure coding (input validation, cryptography, exception handling), mandate developer training, govern open-source software, track CVEs, and employ an AST strategy encompassing SAST, DAST, and IAST.',
    intentAndGuidance: 'All code defects must be tracked in a defect management system; High and Critical issues must be remediated prior to production deployment.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 6.1.1 - 6.1.7 & Annex A',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'Automated SAST and SCA scanning in CI/CD pipeline blocking critical CVEs.',
      'Manual peer code review required on all production pull requests.',
      'Annual secure coding training for all software engineers.'
    ],
    testProcedures: [
      'Inspect CI/CD security gate configuration to verify automated PR block on High/Critical flaws.',
      'Review training completion certificates for development team on OWASP Top 10.'
    ],
    evidenceRequirements: [
      'CI/CD Pipeline Security Gate Policy & GitHub Actions Workflow',
      'SAST / SCA Scan Reports with Zero Open Critical Flaws'
    ],
    responsibleRoles: ['DevSecOps Lead', 'Lead Software Engineer', 'CISO'],
    recommendedReviewFrequency: 'Quarterly',
    crossFrameworkMappings: {
      iso27001: ['A.8.28', 'A.8.29', 'A.8.30'],
      nistCsf: ['PR.IP-02', 'DE.CM-06']
    }
  },
  {
    id: 'REQ-MAS-6.3',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-06',
    domainNumber: '6.0',
    domainName: 'Software Application Development and Management',
    sectionNumber: '6.3',
    requirementCode: 'MAS-TRM-6.3',
    title: 'DevSecOps & Segregation of Duties',
    statement: 'The FI shall automate and integrate IT operations, QA, and security within CI/CD pipelines while strictly enforcing segregation of duties between development, testing, and release functions.',
    intentAndGuidance: 'No single individual may develop code, compile bytecode/binaries, and deploy it to production without independent automated or peer controls.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 6.3.1 - 6.3.2 & Footnote 8',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'Zero developer direct write/deploy access to production cloud environments.',
      'Automated deployment service accounts with immutable audit logging.',
      'Independent approval gate for production releases.'
    ],
    testProcedures: [
      'Examine AWS/GCP IAM permissions for development group; verify absence of write permissions in production.',
      'Review release promotion history to confirm approval by independent release manager.'
    ],
    evidenceRequirements: [
      'IAM Least Privilege Permission Matrix for Dev vs Prod Environments',
      'Production Release Approvals Log in Change Management System'
    ],
    responsibleRoles: ['Head of Cloud Infrastructure', 'DevOps Lead', 'Release Manager'],
    recommendedReviewFrequency: 'Quarterly',
    crossFrameworkMappings: {
      iso27001: ['A.5.3', 'A.8.31'],
      nistCsf: ['PR.AC-04']
    }
  },
  {
    id: 'REQ-MAS-6.4',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-06',
    domainNumber: '6.0',
    domainName: 'Software Application Development and Management',
    sectionNumber: '6.4',
    requirementCode: 'MAS-TRM-6.4',
    title: 'Application Programming Interface (API) Security & Governance',
    statement: 'The FI shall establish secure API standards: third-party vetting, risk assessment, access token protection with short validity expiry, strong transmission encryption, security testing, session logging, real-time alerting, prompt revocation, and DoS attack mitigation.',
    intentAndGuidance: 'Access tokens should have a short validity duration (e.g. 15-60 minutes). Rate limiting, quota management, and WAF protection are required.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 6.4.1 - 6.4.8 & Footnote 10',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'OAuth2 token expiry configured to <= 60 minutes with cryptographic signing (JWT RS256).',
      'API gateway rate limiting and volumetric DoS shielding on all public endpoints.',
      'Comprehensive third-party API consumer security vetting and logging.'
    ],
    testProcedures: [
      'Inspect API Gateway configuration for OAuth token lifetime and rate limiting quotas.',
      'Review API access logs to confirm party identity, timestamp, and accessed resource tracking.'
    ],
    evidenceRequirements: [
      'Kong / Apigee API Gateway Security Policy & Token Expiry Configuration',
      'API Penetration Test & OWASP API Security Top 10 Report'
    ],
    responsibleRoles: ['API Product Manager', 'Cloud Architect', 'CISO'],
    recommendedReviewFrequency: 'Bi-Annual',
    crossFrameworkMappings: {
      iso27001: ['A.8.20', 'A.8.24', 'A.8.26'],
      nistCsf: ['PR.PT-04']
    }
  },
  {
    id: 'REQ-MAS-6.5',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-06',
    domainNumber: '6.0',
    domainName: 'Software Application Development and Management',
    sectionNumber: '6.5',
    requirementCode: 'MAS-TRM-6.5',
    title: 'Management of End User Computing (EUC) & Shadow IT',
    statement: 'The FI shall manage End User Computing and Shadow IT as part of information assets, establishing measures to control, monitor, and prevent unauthorized software, scripts, and data storage services.',
    intentAndGuidance: 'End-user developed applications processing customer data must undergo risk assessment, testing, and formal approval before business use.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 6.5.1 - 6.5.3',
    mandatoryForFIs: true,
    criticalSystemsMandate: false,
    controlObjectives: [
      'Cloud Access Security Broker (CASB) monitoring and blocking unauthorized SaaS.',
      'Inventory of business-critical End User Computing spreadsheets and scripts.',
      'Endpoint application whitelisting preventing unapproved executable execution.'
    ],
    testProcedures: [
      'Inspect CASB shadow IT discovery reports for the trailing quarter.',
      'Verify register of approved business-critical EUC models.'
    ],
    evidenceRequirements: [
      'CASB Shadow IT Discovery & Egress Blocking Audit Report',
      'End User Computing (EUC) Governance Policy & Register'
    ],
    responsibleRoles: ['Head of IT Support', 'Security Operations Lead'],
    recommendedReviewFrequency: 'Annual',
    crossFrameworkMappings: {
      iso27001: ['A.8.9', 'A.8.19'],
      nistCsf: ['ID.AM-05']
    }
  },

  // --- 7.0 IT Service Management ---
  {
    id: 'REQ-MAS-7.3',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-07',
    domainNumber: '7.0',
    domainName: 'IT Service Management',
    sectionNumber: '7.3',
    requirementCode: 'MAS-TRM-7.3',
    title: 'Technology Refresh & End-of-Support (EOS) Management',
    statement: 'The FI shall avoid using outdated or unsupported hardware/software, track EOS/EOL dates, develop refresh plans prior to EOS, and obtain formal management dispensation with compensating controls and validity limits where continued use is unavoidable.',
    intentAndGuidance: 'Dispensation must specify compensating measures (e.g. network micro-segmentation, virtual patching) and an explicit decommissioning target date.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 7.3.1 - 7.3.3 & Footnote 11',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'Hardware and software EOS/EOL lifecycle tracking register.',
      'Technology refresh roadmap funded and executed ahead of vendor deprecation dates.',
      'Signed CRO/CISO dispensation records for any temporary legacy exceptions.'
    ],
    testProcedures: [
      'Cross-reference production OS/database versions against official vendor EOS dates.',
      'Verify that any system past EOS has an approved, active dispensation memorandum.'
    ],
    evidenceRequirements: [
      'Enterprise Technology Obsolescence & EOS/EOL Tracking Ledger',
      'Formal Management Dispensation Memoranda with Compensating Controls'
    ],
    responsibleRoles: ['Head of Infrastructure', 'Chief Technology Officer', 'CISO'],
    recommendedReviewFrequency: 'Bi-Annual',
    crossFrameworkMappings: {
      iso27001: ['A.8.8', 'A.8.19'],
      nistCsf: ['ID.AM-04']
    }
  },
  {
    id: 'REQ-MAS-7.4',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-07',
    domainNumber: '7.0',
    domainName: 'IT Service Management',
    sectionNumber: '7.4',
    requirementCode: 'MAS-TRM-7.4',
    title: 'Patch Management & Vulnerability Remediation SLAs',
    statement: 'The FI shall establish a patch management process to apply security patches and fixes within timeframes commensurate with vulnerability criticality, thoroughly testing patches before production deployment.',
    intentAndGuidance: 'Under MAS Notice 655 Para 4.3, critical security patches must be installed within specified timeframes (typically within 14 calendar days of release, or 72 hours for active zero-days).',
    regulatorySourceRef: 'MAS TRM Guidelines Section 7.4.1 - 7.4.2 & Notice 655 Para 4.3',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    slaRequirement: 'Critical Patches <= 14 Days (or 72 Hours for Zero-Day Exploits)',
    controlObjectives: [
      'Automated vulnerability scanning identifying missing patches across all systems.',
      'Defined patching SLAs: Critical <= 14 days, High <= 30 days, Medium <= 60 days.',
      'Pre-production staging environment testing for all software and OS patches.'
    ],
    testProcedures: [
      'Sample 10 recent Critical/High CVEs and calculate elapsed time from release to production deployment.',
      'Verify patch test staging sign-off records.'
    ],
    evidenceRequirements: [
      'Patch Management Policy with Critical Vulnerability SLAs',
      'Monthly Patch Compliance Dashboard & Remediation Timestamps'
    ],
    responsibleRoles: ['Head of IT Operations', 'SecOps Lead'],
    recommendedReviewFrequency: 'Monthly',
    crossFrameworkMappings: {
      iso27001: ['A.8.8'],
      nistCsf: ['PR.IP-12'],
      pciDss: ['Req 6.3.3']
    }
  },
  {
    id: 'REQ-MAS-7.5',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-07',
    domainNumber: '7.0',
    domainName: 'IT Service Management',
    sectionNumber: '7.5',
    requirementCode: 'MAS-TRM-7.5',
    title: 'Change Management, Change Advisory Board (CAB) & Rollback Plans',
    statement: 'The FI shall establish formal change management: assess security risks, conduct testing in staging, require CAB approval, maintain pre-change backups and rollback plans, define emergency change procedures, and enable comprehensive logging.',
    intentAndGuidance: 'Emergency changes must be restricted, authorized by designated approvers, and reviewed post-implementation within 24 hours.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 7.5.1 - 7.5.7',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'Formal CAB meeting weekly to review and approve production change requests.',
      'Mandatory rollback plan and pre-change database snapshot for all changes.',
      'Emergency change approval workflow with post-implementation review within 24 hours.'
    ],
    testProcedures: [
      'Sample 25 standard production change tickets; verify CAB sign-off and rollback plans.',
      'Sample 5 emergency change tickets; verify retrospective post-implementation review.'
    ],
    evidenceRequirements: [
      'Change Advisory Board (CAB) Charter & Minutes Archive',
      'Jira Service Management Change Request Records with Rollback Proofs'
    ],
    responsibleRoles: ['Change Manager', 'Head of IT Operations', 'CTO'],
    recommendedReviewFrequency: 'Continuous',
    crossFrameworkMappings: {
      iso27001: ['A.8.32', 'A.8.33'],
      nistCsf: ['PR.IP-03']
    }
  },

  // --- 8.0 IT Resilience ---
  {
    id: 'REQ-MAS-8.1',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-08',
    domainNumber: '8.0',
    domainName: 'IT Resilience',
    sectionNumber: '8.1',
    requirementCode: 'MAS-TRM-8.1',
    title: 'System Availability & Single Point of Failure (SPoF) Elimination',
    statement: 'The FI shall design systems for high availability, deploy redundancy or fault-tolerant solutions for critical systems, conduct periodic dependency reviews to eliminate single points of failure, and continuously monitor resource thresholds.',
    intentAndGuidance: 'Critical Information Systems (CIS) must feature active-active or hot-standby redundancy across compute, database, network, and storage layers.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 8.1.1 - 8.1.4',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'Multi-AZ or multi-region high availability architecture for all Critical Information Systems.',
      'Automated failover mechanisms tested and verified without manual intervention.',
      'Resource threshold monitoring (CPU, RAM, storage, IOPS) with automated alerting.'
    ],
    testProcedures: [
      'Review architecture diagrams for Critical Systems to confirm absence of single points of failure.',
      'Inspect synthetic chaos engineering / failover test reports.'
    ],
    evidenceRequirements: [
      'Critical Systems High Availability Architecture Design Document',
      'Chaos Engineering / Automated Node Failover Test Results'
    ],
    responsibleRoles: ['Principal Cloud Architect', 'Head of Infrastructure', 'CTO'],
    recommendedReviewFrequency: 'Annual',
    crossFrameworkMappings: {
      iso27001: ['A.8.14'],
      nistCsf: ['PR.PT-05']
    }
  },
  {
    id: 'REQ-MAS-8.2',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-08',
    domainNumber: '8.0',
    domainName: 'IT Resilience',
    sectionNumber: '8.2',
    requirementCode: 'MAS-TRM-8.2',
    title: 'System Recoverability (RTO <= 4h, RPO <= 1h, Downtime <= 4h/yr)',
    statement: 'The FI shall design and operate critical systems to achieve a Recovery Time Objective (RTO) of not more than 4 hours, a Recovery Point Objective (RPO) of not more than 1 hour, and cumulative unscheduled downtime not exceeding 4 hours in any 12-month period.',
    intentAndGuidance: 'Under MAS Notice 644/Notice 655, adherence to these recovery thresholds is a legally enforceable statutory condition for critical financial services.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 8.2.1 - 8.2.4 & Notice 644 Clause 3',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    slaRequirement: 'RTO <= 4 Hours, RPO <= 1 Hour, Cumulative Unscheduled Downtime <= 4 Hours/Year',
    controlObjectives: [
      'Recovery Time Objective (RTO) for all critical systems verified <= 4 hours.',
      'Recovery Point Objective (RPO) for transactional data verified <= 1 hour (target < 15 mins).',
      'Cumulative unscheduled downtime across trailing 12 months verified <= 4 hours.'
    ],
    testProcedures: [
      'Review annual DR switchover test report; verify recorded RTO and RPO metrics.',
      'Audit 12-month historical uptime logs to verify downtime <= 4 hours.'
    ],
    evidenceRequirements: [
      'Annual Full-Scale Disaster Recovery Switchover Test Report',
      '12-Month Historical Critical System Uptime & Incident Log'
    ],
    responsibleRoles: ['Business Continuity Director', 'Head of Infrastructure', 'CTO'],
    recommendedReviewFrequency: 'Annual',
    crossFrameworkMappings: {
      iso27001: ['A.5.29', 'A.5.30', 'A.8.13', 'A.8.14'],
      nistCsf: ['RC.RP-01'],
      soc2Criteria: ['A1.1', 'A1.2']
    }
  },
  {
    id: 'REQ-MAS-8.4',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-08',
    domainNumber: '8.0',
    domainName: 'IT Resilience',
    sectionNumber: '8.4',
    requirementCode: 'MAS-TRM-8.4',
    title: 'System Backup, Immutable Storage & Restoration Drills',
    statement: 'The FI shall establish a comprehensive backup strategy, define retention lifecycles, encrypt confidential backup data, store backups offline or offsite, and periodically test data restoration.',
    intentAndGuidance: 'Backups must be protected against ransomware using write-once-read-many (WORM) immutable storage or physical air-gapping.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 8.4.1 - 8.4.4',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'Automated daily incremental and weekly full backups with encryption at rest.',
      'Immutable WORM retention or offsite air-gapped replication.',
      'Quarterly test restoration drills recovering random databases to staging.'
    ],
    testProcedures: [
      'Review quarterly backup restoration test logs and verify checksum validation.',
      'Inspect cloud backup configuration confirming AWS S3 Object Lock / GCP Bucket Lock compliance.'
    ],
    evidenceRequirements: [
      'Quarterly Backup Restoration Drill Report & Checksum Sign-Off',
      'Immutable Cloud Backup (WORM) Compliance Configuration'
    ],
    responsibleRoles: ['Database Administrator Lead', 'Head of Infrastructure'],
    recommendedReviewFrequency: 'Quarterly',
    crossFrameworkMappings: {
      iso27001: ['A.8.13'],
      nistCsf: ['PR.IP-04']
    }
  },
  {
    id: 'REQ-MAS-8.5',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-08',
    domainNumber: '8.0',
    domainName: 'IT Resilience',
    sectionNumber: '8.5',
    requirementCode: 'MAS-TRM-8.5',
    title: 'Data Centre Resilience & Threat and Vulnerability Risk Assessment (TVRA)',
    statement: 'The FI shall conduct a TVRA for data centres, enforce redundancy for power (UPS/generators), network, and cooling, provide fire detection/suppression, maintain geographic separation between primary and DR sites, and enforce 24/7 physical security.',
    intentAndGuidance: 'TVRA must evaluate physical and environmental threats (floods, power surges, hazardous surroundings). Secondary/DR DC must not share single power or telecom grid dependencies.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 8.5.1 - 8.5.6 & Footnote 14',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'Independent TVRA conducted and renewed every 3 years or upon material facility change.',
      'N+1 or 2N dual power, generator fuel supply for >= 48 hours, and dual cooling paths.',
      'Secondary DR data centre geographically separated by at least 10 km on independent utility loops.'
    ],
    testProcedures: [
      'Inspect latest independent TVRA report and review physical security recommendations.',
      'Verify diesel generator fuel replenishment contracts and annual load bank test reports.'
    ],
    evidenceRequirements: [
      'Independent Data Centre TVRA Assessment Report',
      'Data Centre Environmental, Power & Cooling Redundancy SLA Attestation'
    ],
    responsibleRoles: ['Head of Data Centre Operations', 'Facilities Security Lead', 'CISO'],
    recommendedReviewFrequency: 'Annual',
    crossFrameworkMappings: {
      iso27001: ['A.7.1', 'A.7.2', 'A.7.4', 'A.7.11'],
      nistCsf: ['PR.AC-02', 'PR.IP-05']
    }
  },

  // --- 9.0 Access Control ---
  {
    id: 'REQ-MAS-9.1',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-09',
    domainNumber: '9.0',
    domainName: 'Access Control',
    sectionNumber: '9.1',
    requirementCode: 'MAS-TRM-9.1',
    title: 'User Access Management, MFA & Periodic Access Reviews',
    statement: 'The FI shall enforce principles of "never alone" (dual authorization), segregation of duties, least privilege, password complexity, mandatory MFA for sensitive functions, unique user activity logging, and periodic access reviews.',
    intentAndGuidance: 'User access must be authorized by asset owners, with prompt revocation upon role change or termination. Dormant accounts (> 90 days) must be automatically disabled.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 9.1.1 - 9.1.8 & Notice 655 Para 4.1-4.2',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'Quarterly access certification completed and signed off by data owners.',
      'Mandatory Multi-Factor Authentication (MFA) for 100% of corporate and administrative users.',
      'Automated deprovisioning within 24 hours of employee separation.'
    ],
    testProcedures: [
      'Sample 20 terminated employees and verify accounts were disabled within 24 hours.',
      'Inspect quarterly access review sign-off sheets for production database and cloud accounts.'
    ],
    evidenceRequirements: [
      'Quarterly User Access Review Sign-Off Matrix',
      'MFA Enforcement Telemetry & Single Sign-On (SSO) Configuration'
    ],
    responsibleRoles: ['Identity & Access Management Lead', 'HR Operations', 'CISO'],
    recommendedReviewFrequency: 'Quarterly',
    crossFrameworkMappings: {
      iso27001: ['A.5.15', 'A.5.16', 'A.5.17', 'A.5.18'],
      nistCsf: ['PR.AC-01', 'PR.AC-06']
    }
  },
  {
    id: 'REQ-MAS-9.2',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-09',
    domainNumber: '9.0',
    domainName: 'Access Control',
    sectionNumber: '9.2',
    requirementCode: 'MAS-TRM-9.2',
    title: 'Privileged Access Management (PAM) & Session Recording',
    statement: 'The FI shall restrict administrative accounts on a need-to-use basis, monitor and log privileged account activities as part of ongoing monitoring, and manage system and service accounts.',
    intentAndGuidance: 'Under Notice 655 Para 4.1, direct Internet access from administrative workstations/sessions is prohibited, and dedicated jump hosts with full session recording must be deployed.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 9.2.1 - 9.2.2 & Notice 655 Para 4.1',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'Zero standing administrative privileges; Just-in-Time (JIT) access via PAM vault.',
      'Full video and keystroke session recording for all administrative logins.',
      'Dedicated jump hosts with egress internet blocking for critical server administration.'
    ],
    testProcedures: [
      'Inspect PAM vault (CyberArk / Teleport / HashiCorp Boundary) configuration.',
      'Verify privileged session audit trail logs and review sample session recordings.'
    ],
    evidenceRequirements: [
      'Privileged Access Management (PAM) Vault Configuration Policy',
      'Sample Privileged Access Session Audit Trail & Recording Ledger'
    ],
    responsibleRoles: ['PAM Administrator Lead', 'SecOps Lead', 'CISO'],
    recommendedReviewFrequency: 'Monthly',
    crossFrameworkMappings: {
      iso27001: ['A.8.2'],
      nistCsf: ['PR.AC-04']
    }
  },

  // --- 10.0 Cryptography ---
  {
    id: 'REQ-MAS-10.2',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-10',
    domainNumber: '10.0',
    domainName: 'Cryptography',
    sectionNumber: '10.2',
    requirementCode: 'MAS-TRM-10.2',
    title: 'Cryptographic Key Management & Hardware Security Modules (HSM)',
    statement: 'The FI shall establish key management standards (generation, distribution, storage, renewal, revocation, destruction), store sensitive keys in Hardware Security Modules (HSMs), transmit keys out-of-band, enforce key diversification, and ensure unrecoverable destruction upon expiry.',
    intentAndGuidance: 'HSMs must be validated to FIPS 140-2 Level 3 or higher. Key generation ceremonies must enforce dual custody and split knowledge.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 10.2.1 - 10.2.10 & Footnote 19',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'Dedicated FIPS 140-2 Level 3 Hardware Security Modules for root key generation and PIN/token signing.',
      'Dual control (split knowledge) enforcement for master key ceremonies.',
      'Automated key rotation policies with maximum 12-month cryptographic lifespan.'
    ],
    testProcedures: [
      'Inspect HSM hardware attestation certificates and firmware version audit logs.',
      'Review signed key ceremony records verifying presence of two key custodians.'
    ],
    evidenceRequirements: [
      'Cryptographic Key Management Standard Operating Procedure',
      'HSM FIPS 140-2 Level 3 Attestation Certificate & Key Ceremony Minutes'
    ],
    responsibleRoles: ['Cryptographic Security Lead', 'Principal Security Architect', 'CISO'],
    recommendedReviewFrequency: 'Annual',
    crossFrameworkMappings: {
      iso27001: ['A.8.24'],
      nistCsf: ['PR.DS-02'],
      pciDss: ['Req 3.5', 'Req 3.6']
    }
  },

  // --- 11.0 Data and Infrastructure Security ---
  {
    id: 'REQ-MAS-11.1',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-11',
    domainNumber: '11.0',
    domainName: 'Data and Infrastructure Security',
    sectionNumber: '11.1',
    requirementCode: 'MAS-TRM-11.1',
    title: 'Data Security, DLP & Sensitive Data Masking in Non-Prod',
    statement: 'The FI shall enforce DLP across data in motion, rest, and use, encrypt confidential data on endpoints and servers, block unauthorized cloud storage/file sharing, restrict production data in non-production, and sanitize media prior to disposal.',
    intentAndGuidance: 'Using unmasked real customer production data in dev/staging is strictly prohibited without senior management dispensation and irreversible pseudonymisation.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 11.1.1 - 11.1.7',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'AES-256 encryption at rest across 100% of production databases and persistent volumes.',
      'Data Loss Prevention (DLP) agents deployed across all corporate endpoints and email gateways.',
      'Automated synthetic test data generation or dynamic masking in staging environments.'
    ],
    testProcedures: [
      'Inspect staging database schema and verify absence of raw customer NRIC/passport/PAN data.',
      'Verify DLP rule configuration blocking credit card and NRIC exfiltration.'
    ],
    evidenceRequirements: [
      'Enterprise Data Protection & Cryptographic Encryption Standard',
      'DLP Gateway Rules & Synthetic Test Data Masking Verification Report'
    ],
    responsibleRoles: ['Data Governance Lead', 'Database Administrator', 'CISO'],
    recommendedReviewFrequency: 'Quarterly',
    crossFrameworkMappings: {
      iso27001: ['A.8.10', 'A.8.11', 'A.8.12'],
      nistCsf: ['PR.DS-01', 'PR.DS-05']
    }
  },
  {
    id: 'REQ-MAS-11.2',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-11',
    domainNumber: '11.0',
    domainName: 'Data and Infrastructure Security',
    sectionNumber: '11.2',
    requirementCode: 'MAS-TRM-11.2',
    title: 'Network Security, Zoning, NIPS & DDoS Defense',
    statement: 'The FI shall enforce firewalls, network segmentation to contain lateral movement, Network Intrusion Prevention Systems (NIPS), regular firewall rule reviews, web isolation, and distributed denial-of-service (DDoS) mitigation services.',
    intentAndGuidance: 'Demilitarized Zones (DMZs) must separate untrusted external traffic from application and database tiers. Obsolete and permissive "any-any" rules must be purged.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 11.2.1 - 11.2.8 & Notice 655 Para 4.5',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'Tiered network segmentation (DMZ, App Tier, DB Tier, Management Zone) with strict ingress/egress filtering.',
      'Quarterly automated firewall rule audits purging obsolete rules.',
      'Always-on volumetric DDoS mitigation and application-layer WAF.'
    ],
    testProcedures: [
      'Review firewall rulebase export to verify zero permissive any-any allow rules.',
      'Review DDoS mitigation drill report and WAF inspection telemetry.'
    ],
    evidenceRequirements: [
      'Network Segmentation Architecture Blueprint & DMZ Matrix',
      'Quarterly Firewall Rulebase Audit & Cleanup Attestation'
    ],
    responsibleRoles: ['Network Security Lead', 'Principal Cloud Architect', 'SecOps Lead'],
    recommendedReviewFrequency: 'Quarterly',
    crossFrameworkMappings: {
      iso27001: ['A.8.20', 'A.8.21', 'A.8.22'],
      nistCsf: ['PR.AC-05', 'PR.DS-07']
    }
  },
  {
    id: 'REQ-MAS-11.3',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-11',
    domainNumber: '11.0',
    domainName: 'Data and Infrastructure Security',
    sectionNumber: '11.3',
    requirementCode: 'MAS-TRM-11.3',
    title: 'System Security, Baseline Hardening & EDR',
    statement: 'The FI shall establish and verify hardware/software baseline hardening standards, deploy behavioral and signature-based Endpoint Detection and Response (EDR), update malware signatures, scan for IOCs, and implement application whitelisting.',
    intentAndGuidance: 'Under Notice 655 Para 4.4 and 4.6, written security baselines (e.g. CIS Benchmarks Level 2) and anti-malware with EDR must be maintained on all corporate systems.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 11.3.1 - 11.3.7 & Notice 655 Para 4.4, 4.6',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'Written baseline hardening configurations (CIS Benchmark Level 2) applied to 100% of servers.',
      'EDR agent (CrowdStrike / SentinelOne / Defender for Endpoint) installed on 100% of fleet with live telemetry.',
      'Daily anti-malware definition updates and continuous behavioral process monitoring.'
    ],
    testProcedures: [
      'Inspect EDR console to confirm 100% agent coverage and zero unmanaged endpoints.',
      'Review automated CIS benchmark compliance audit scan scores (target >= 95%).'
    ],
    evidenceRequirements: [
      'CIS Benchmark Hardening Standards for Linux, Windows & Containers',
      'Enterprise EDR Agent Deployment & Health Telemetry Report'
    ],
    responsibleRoles: ['SecOps Lead', 'Endpoint Systems Lead', 'CISO'],
    recommendedReviewFrequency: 'Monthly',
    crossFrameworkMappings: {
      iso27001: ['A.8.7', 'A.8.9'],
      nistCsf: ['PR.IP-01', 'DE.CM-04']
    }
  },

  // --- 12.0 Cyber Security Operations ---
  {
    id: 'REQ-MAS-12.2',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-12',
    domainNumber: '12.0',
    domainName: 'Cyber Security Operations',
    sectionNumber: '12.2',
    requirementCode: 'MAS-TRM-12.2',
    title: 'Cyber Event Monitoring, 24/7 SOC & UEBA Telemetry',
    statement: 'The FI shall establish a 24/7 SOC (or accredited MSSP), collect and retain system logs, establish routine baseline profiles, utilize User and Entity Behavioral Analytics (UEBA / Machine Learning), correlate events across multiple sources, and enforce timely escalation.',
    intentAndGuidance: 'Logs must be protected against tampering and retained for minimum statutory periods (at least 1 year, with 90 days hot online storage). NTP clock synchronization across Stratum-1/2 servers is mandatory.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 12.2.1 - 12.2.6',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'Continuous 24/7 Security Operations Centre (SOC) monitoring and correlation.',
      'Log aggregation into SIEM with immutable WORM retention for minimum 1 year.',
      'Stratum-1/2 NTP network time synchronization across all servers and firewalls.'
    ],
    testProcedures: [
      'Inspect SIEM log ingestion pipeline and verify retention policies.',
      'Verify NTP time synchronization on 10 sample production hosts (delta < 500ms).'
    ],
    evidenceRequirements: [
      '24/7 SOC Operations Charter & SIEM Correlation Ruleset',
      'NTP Stratum-1 Time Synchronization & Immutable Log Retention Audit Log'
    ],
    responsibleRoles: ['SOC Manager', 'SecOps Lead', 'CISO'],
    recommendedReviewFrequency: 'Continuous',
    crossFrameworkMappings: {
      iso27001: ['A.8.15', 'A.8.16', 'A.8.17'],
      nistCsf: ['DE.AE-01', 'DE.CM-01']
    }
  },
  {
    id: 'REQ-MAS-12.3',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-12',
    domainNumber: '12.0',
    domainName: 'Cyber Security Operations',
    sectionNumber: '12.3',
    requirementCode: 'MAS-TRM-12.3',
    title: 'Cyber Incident Response Plan (CIRP) & Mandatory 1-Hour Notification',
    statement: 'The FI shall maintain a Cyber Incident Response Plan (CIRP) to swiftly isolate threats, securely resume operations, investigate root causes, and notify MAS within 1 hour of detecting critical system malfunctions or major security breaches.',
    intentAndGuidance: 'Under MAS Notice 655, notification within 1 hour of discovery is mandatory for critical system incidents, followed by a formal 14-day root cause analysis report.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 12.3.1 - 12.3.3 & Notice 655',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    slaRequirement: '1-Hour Notification to MAS; 14-Day Post-Incident Root Cause Report',
    controlObjectives: [
      'Approved CIRP with documented escalation thresholds and 24/7 on-call incident roster.',
      'Automated 1-hour MAS Notice 655 notification dispatch workflow.',
      'Post-incident root cause analysis (RCA) filed within 14 calendar days.'
    ],
    testProcedures: [
      'Review CIRP document and verify annual executive tabletop simulation minutes.',
      'Inspect incident management workflow confirming 1-hour regulatory escalation trigger.'
    ],
    evidenceRequirements: [
      'Cyber Incident Response Plan (CIRP) v3.2 & Escalation Playbook',
      'MAS Notice 655 Incident Dispatch Template & Simulation Test Results'
    ],
    responsibleRoles: ['Incident Commander', 'CISO', 'General Counsel'],
    recommendedReviewFrequency: 'Annual',
    crossFrameworkMappings: {
      iso27001: ['A.5.24', 'A.5.25', 'A.5.26', 'A.5.28'],
      nistCsf: ['RS.RP-01', 'RS.CO-02']
    }
  },

  // --- 13.0 Cyber Security Assessment ---
  {
    id: 'REQ-MAS-13.2',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-13',
    domainNumber: '13.0',
    domainName: 'Cyber Security Assessment',
    sectionNumber: '13.2',
    requirementCode: 'MAS-TRM-13.2',
    title: 'Penetration Testing (Annual & Production Coverage)',
    statement: 'The FI shall conduct penetration testing (combination of blackbox and greybox) at least once annually for systems directly accessible from the Internet or whenever major changes occur, executed on the production environment with proper safeguards.',
    intentAndGuidance: 'Penetration testing must be performed by independent, qualified professionals (e.g. CREST-certified testers). Complementary bug bounty programs should be considered.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 13.2.1 - 13.2.4',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'Annual independent penetration testing covering 100% of external-facing IPs, web apps, and APIs.',
      'Engagement of CREST-accredited penetration testing vendors.',
      'CAPA tracking with mandatory closure of all High and Critical findings within 30 days.'
    ],
    testProcedures: [
      'Review the latest Penetration Testing Report issued by an accredited firm.',
      'Verify that all High/Critical findings from the prior report are verified closed.'
    ],
    evidenceRequirements: [
      'CREST-Accredited External Penetration Testing Final Report',
      'Penetration Testing Findings Remediation & Retest Verification Certificate'
    ],
    responsibleRoles: ['Head of Information Security', 'CISO'],
    recommendedReviewFrequency: 'Annual',
    crossFrameworkMappings: {
      iso27001: ['A.8.8'],
      nistCsf: ['ID.RA-01'],
      pciDss: ['Req 11.3', 'Req 11.4']
    }
  },
  {
    id: 'REQ-MAS-13.4',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-13',
    domainNumber: '13.0',
    domainName: 'Cyber Security Assessment',
    sectionNumber: '13.4',
    requirementCode: 'MAS-TRM-13.4',
    title: 'Adversarial Attack Simulation Exercise (AASE / Red Teaming)',
    statement: 'The FI shall conduct an Adversarial Attack Simulation Exercise (AASE) to test cyber defense and response against prevalent cyber threats simulating real-world adversaries, using intelligence-based scenario design under close supervision.',
    intentAndGuidance: 'AASE simulates sophisticated threat actors (TTPs) using intelligence to evaluate people, processes, and technical defenses without disrupting live customer transactions.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 13.4.1 - 13.4.2 & Footnotes 32-33',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'Adversarial red team simulation executed at least every 2 years by independent specialists.',
      'White Team oversight and defined rules of engagement protecting production stability.',
      'Post-exercise purple teaming debriefing session to enhance SOC detection rules.'
    ],
    testProcedures: [
      'Review the AASE Rules of Engagement and executive summary debrief report.',
      'Verify that MITRE ATT&CK detection gaps identified during the exercise were addressed in SIEM.'
    ],
    evidenceRequirements: [
      'Adversarial Attack Simulation Exercise (AASE) Executive Report',
      'AASE Remediation Roadmap & SIEM Purple Team Detection Updates'
    ],
    responsibleRoles: ['CISO', 'Red Team Exercise Director', 'Board Risk Committee'],
    recommendedReviewFrequency: 'Bi-Annual',
    crossFrameworkMappings: {
      iso27001: ['A.8.8', 'A.5.24'],
      nistCsf: ['DE.DP-05']
    }
  },

  // --- 14.0 Online Financial Services ---
  {
    id: 'REQ-MAS-14.1',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-14',
    domainNumber: '14.0',
    domainName: 'Online Financial Services',
    sectionNumber: '14.1',
    requirementCode: 'MAS-TRM-14.1',
    title: 'Security of Online Financial Services & Mobile Hardening',
    statement: 'The FI shall secure communication channels via encryption and digital signatures, mitigate common attacks (XSS, MITMA, DNS hijacking, DDoS, malware), deliver mobile apps only via official stores, actively monitor for phishing, and disallow rooted/jailbroken devices.',
    intentAndGuidance: 'Mobile applications must incorporate anti-tampering, detect jailbroken/rooted environments, and block transactional access if compromised.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 14.1.1 - 14.1.7 & Annex C',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'TLS 1.3 encryption with Perfect Forward Secrecy across 100% of customer web/API endpoints.',
      'Automated jailbreak/root detection blocking transactions in mobile applications.',
      'Continuous brand and domain monitoring for fraudulent phishing sites with takedown SLAs.'
    ],
    testProcedures: [
      'Test mobile app on rooted Android / jailbroken iOS device; verify app refuses execution.',
      'Inspect SSL Labs configuration report for A+ rating on customer portal.'
    ],
    evidenceRequirements: [
      'Mobile Application Security Hardening & Root Detection Test Report',
      'Anti-Phishing Takedown Service Contract & Monthly Incident Ledger'
    ],
    responsibleRoles: ['Mobile Engineering Lead', 'SecOps Lead', 'CISO'],
    recommendedReviewFrequency: 'Quarterly',
    crossFrameworkMappings: {
      iso27001: ['A.8.20', 'A.8.24', 'A.8.28'],
      nistCsf: ['PR.DS-02']
    }
  },
  {
    id: 'REQ-MAS-14.2',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-14',
    domainNumber: '14.0',
    domainName: 'Online Financial Services',
    sectionNumber: '14.2',
    requirementCode: 'MAS-TRM-14.2',
    title: 'Customer Authentication, Transaction Signing & Soft Token Binding',
    statement: 'The FI shall enforce Multi-Factor Authentication (MFA) at login, encrypt passwords end-to-end, require digital transaction signing for high-risk activities (payee addition, large transfers, contact updates), calibrate biometric FAR/FRR, bind soft tokens to devices, and enforce inactivity timeouts.',
    intentAndGuidance: 'Transaction signing creates an unforgeable digital signature over transaction details (amount, payee account) to defeat Man-in-the-Middle and Man-in-the-Browser attacks.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 14.2.1 - 14.2.11 & Footnotes 21, 38, 41',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'Mandatory transaction signing for high-risk activities (payee addition, limit increases, transfers > threshold).',
      'Cryptographic soft token device binding linking credentials to physical device hardware.',
      'Automated session termination after <= 15 minutes of customer inactivity.'
    ],
    testProcedures: [
      'Verify transaction signing prompt and cryptographically signed payload when initiating a high-value transfer.',
      'Test soft token extraction on cloned device; verify token fails on unregistered hardware.'
    ],
    evidenceRequirements: [
      'Customer Authentication & Transaction Signing Architecture Specification',
      'Soft Token Device Binding Cryptographic Implementation Verification'
    ],
    responsibleRoles: ['Digital Banking Lead', 'Identity & Cryptography Lead', 'CISO'],
    recommendedReviewFrequency: 'Bi-Annual',
    crossFrameworkMappings: {
      iso27001: ['A.5.17', 'A.8.5'],
      nistCsf: ['PR.AC-07']
    }
  },
  {
    id: 'REQ-MAS-14.3',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-14',
    domainNumber: '14.0',
    domainName: 'Online Financial Services',
    sectionNumber: '14.3',
    requirementCode: 'MAS-TRM-14.3',
    title: 'Real-Time Fraud Monitoring & Immediate Customer Alerts',
    statement: 'The FI shall deploy real-time fraud monitoring systems to identify and block suspicious transactions, investigate anomalies promptly, and notify customers immediately of suspicious activities or funds transfers above thresholds.',
    intentAndGuidance: 'Fraud engines must incorporate behavioral velocity rules, device telemetry, and IP reputation to halt fraudulent out-transfers in real-time.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 14.3.1 - 14.3.3',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'Real-time transaction risk scoring with automated step-up authentication or hold.',
      'Immediate push notification/SMS alerts sent for any transfer exceeding threshold.',
      '24/7 fraud operations desk investigating flagged payment anomalies.'
    ],
    testProcedures: [
      'Simulate high-velocity transfer from novel IP address; verify transaction is held for verification.',
      'Inspect customer SMS/push alert delivery latency logs (target < 30 seconds).'
    ],
    evidenceRequirements: [
      'Real-Time Fraud Monitoring Ruleset & Threshold Configuration',
      'Fraud Investigation SLA & Customer Alerting Audit Ledger'
    ],
    responsibleRoles: ['Head of Fraud Operations', 'Financial Crime Compliance Lead'],
    recommendedReviewFrequency: 'Monthly',
    crossFrameworkMappings: {
      iso27001: ['A.8.16'],
      nistCsf: ['DE.AE-02']
    }
  },

  // --- 15.0 IT Audit ---
  {
    id: 'REQ-MAS-15.1',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-15',
    domainNumber: '15.0',
    domainName: 'IT Audit',
    sectionNumber: '15.1',
    requirementCode: 'MAS-TRM-15.1',
    title: 'Independent Technology Audit Function & Comprehensive Coverage',
    statement: 'The FI shall establish an independent and objective IT audit function to provide assurance to the Board and Senior Management, covering all IT operations and processes, with audit frequency commensurate with criticality and risk.',
    intentAndGuidance: 'IT auditors must possess recognized professional qualifications (CISA, CISSP) and maintain independence from IT management and systems implementation.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 15.1.1 - 15.1.4',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'Independent technology risk audit conducted at least once every 12 to 18 months.',
      'Audit scope covering all 13 domains of the MAS TRM Guidelines.',
      'Quarterly audit issue tracking presented directly to the Board Audit Committee.'
    ],
    testProcedures: [
      'Inspect latest Independent Technology Risk Audit Report issued by certified audit firm.',
      'Verify that all audit findings have assigned owners and target completion dates.'
    ],
    evidenceRequirements: [
      'Independent External MAS TRM Audit Report & Executive Management Response',
      'Board Audit Committee Minutes on Technology Risk Tracking'
    ],
    responsibleRoles: ['Head of Internal Audit', 'Board Audit Committee Chair'],
    recommendedReviewFrequency: 'Annual',
    crossFrameworkMappings: {
      iso27001: ['Clause 9.2'],
      nistCsf: ['ID.RA-01']
    }
  },

  // --- Annex A: Application Security Testing ---
  {
    id: 'REQ-MAS-ANNEX-A.1',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-ANNEX-A',
    domainNumber: 'Annex A',
    domainName: 'Application Security Testing (AST)',
    sectionNumber: 'Annex A.1',
    requirementCode: 'MAS-TRM-ANNEX-A.1',
    title: 'Comprehensive AST: SAST, DAST, IAST & Fuzz Testing',
    statement: 'The FI shall implement application security testing across SDLC using a combination of Static (SAST), Dynamic (DAST), Interactive (IAST), and Fuzz Testing to identify and remediate exploitable flaws prior to production.',
    intentAndGuidance: 'Fuzz testing must inject random, malformed inputs into network protocols and API parameters to uncover memory corruptions and boundary condition crashes.',
    regulatorySourceRef: 'MAS TRM Guidelines Annex A (Section A.1 - A.2)',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'Continuous SAST code scanning with zero open High/Critical vulnerabilities.',
      'Automated DAST and IAST testing executed in pre-production staging pipelines.',
      'Fuzz testing applied to critical payment message parsing and API deserialization endpoints.'
    ],
    testProcedures: [
      'Review automated fuzz testing execution logs on core transaction parsing modules.',
      'Inspect SAST and DAST tool integration within build pipelines.'
    ],
    evidenceRequirements: [
      'Application Security Testing (AST) Comprehensive Strategy Document',
      'Fuzz Testing & DAST Pre-Release Scan Attestation Report'
    ],
    responsibleRoles: ['Application Security Lead', 'DevSecOps Lead'],
    recommendedReviewFrequency: 'Quarterly',
    crossFrameworkMappings: {
      iso27001: ['A.8.29'],
      nistCsf: ['PR.IP-02']
    }
  },

  // --- Annex B: BYOD Security ---
  {
    id: 'REQ-MAS-ANNEX-B.1',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-ANNEX-B',
    domainNumber: 'Annex B',
    domainName: 'Bring Your Own Device (BYOD) Security',
    sectionNumber: 'Annex B.1',
    requirementCode: 'MAS-TRM-ANNEX-B.1',
    title: 'BYOD Security Controls: MDM, MAM & Virtualisation Isolation',
    statement: 'The FI shall enforce Mobile Device Management (MDM) and Mobile Application Management (MAM) on personal devices accessing information assets: verify devices are not rooted/jailbroken, encrypt device storage, enforce lock/wipe, and restrict clipboard/peripheral data leakage.',
    intentAndGuidance: 'Virtual Desktop Infrastructure (VDI) or containerized enterprise workspaces must be used to segregate personal data from sensitive bank records.',
    regulatorySourceRef: 'MAS TRM Guidelines Annex B (Section B.1)',
    mandatoryForFIs: true,
    criticalSystemsMandate: false,
    controlObjectives: [
      'Mandatory MDM enrollment requiring PIN/biometric lock and storage encryption.',
      'Remote wipe capability for enterprise corporate data upon loss or resignation.',
      'DLP policies blocking copying of corporate data to personal clipboard or cloud storage.'
    ],
    testProcedures: [
      'Test MDM compliance policy; verify unmanaged or rooted device is blocked from accessing email.',
      'Verify remote selective wipe command execution on a test device.'
    ],
    evidenceRequirements: [
      'Enterprise BYOD Policy & MDM Security Baseline Standards',
      'MDM Fleet Compliance & Remote Wipe Capability Verification Audit'
    ],
    responsibleRoles: ['IT Support Lead', 'SecOps Lead'],
    recommendedReviewFrequency: 'Annual',
    crossFrameworkMappings: {
      iso27001: ['A.6.7', 'A.8.1'],
      nistCsf: ['PR.AC-03']
    }
  },

  // --- Annex C: Mobile Application Security ---
  {
    id: 'REQ-MAS-ANNEX-C.1',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-ANNEX-C',
    domainNumber: 'Annex C',
    domainName: 'Mobile Application Security',
    sectionNumber: 'Annex C.1',
    requirementCode: 'MAS-TRM-ANNEX-C.1',
    title: 'Mobile App Security: Anti-Hooking, Pinning, Obfuscation & Keypad',
    statement: 'The FI shall implement specific mobile security controls: avoid caching sensitive data, protect private keys in hardware Keystore/Keychain, implement anti-hooking/anti-tampering runtime defense, enforce code obfuscation and integrity checksums, implement SSL public key pinning, provide a secure in-app keypad, and enforce device binding.',
    intentAndGuidance: 'Anti-hooking prevents dynamic code injection by tools such as Frida or Substrate. Public key pinning prevents interception by rogue root certificate authorities.',
    regulatorySourceRef: 'MAS TRM Guidelines Annex C (Section C.1(a) - (g)) & Footnotes 41-42',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'Runtime Application Self-Protection (RASP) detecting and terminating on debugger/hooking tools.',
      'SSL/TLS public key pinning enforced across all mobile network calls.',
      'Bytecode obfuscation (DexGuard / ProGuard) and binary tamper detection.'
    ],
    testProcedures: [
      'Attempt to hook mobile app using Frida or Objection; verify app detects instrumentation and terminates.',
      'Verify SSL pinning blocks proxy interception in Burp Suite with custom root CA.'
    ],
    evidenceRequirements: [
      'Mobile Application Penetration Test & RASP Verification Report',
      'Mobile Security Architecture Specification (Annex C Compliance Matrix)'
    ],
    responsibleRoles: ['Mobile Security Architect', 'Lead iOS/Android Engineer', 'CISO'],
    recommendedReviewFrequency: 'Bi-Annual',
    crossFrameworkMappings: {
      iso27001: ['A.8.28', 'A.8.20'],
      nistCsf: ['PR.DS-02']
    }
  },

  // --- Compatibility Aliases for Earlier Prototype References ---
  {
    id: 'REQ-MAS-16.1',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-16',
    domainNumber: '16.0',
    domainName: 'Logging, Audit Trail & Security Monitoring',
    sectionNumber: '16.1',
    requirementCode: 'MAS-TRM-16.1',
    title: 'Centralized Immutable Audit Logging & NTP Synchronization',
    statement: 'The FI shall maintain centralized, immutable audit logging with a minimum 1-year retention period (90 days online hot storage), Stratum-1 NTP clock synchronization, and real-time SIEM alerting (Ref: Section 12.2 & Section 7.5.7).',
    intentAndGuidance: 'Audit trails must record user activities, administrative modifications, authorization failures, and system exceptions, preserved with write-once protections.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 12.2 & Section 7.5.7',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'Centralized immutable log aggregation with 1-year retention.',
      'Network Time Protocol synchronization to Stratum-1 servers.',
      'Automated SIEM alert generation for security anomalies.'
    ],
    testProcedures: [
      'Verify write-once-read-many (WORM) storage configuration on SIEM log archives.',
      'Inspect NTP synchronization across production domain controllers.'
    ],
    evidenceRequirements: [
      'Centralized Audit Logging Architecture & WORM Retention Proof',
      'NTP Stratum-1 Time Synchronization Ledger'
    ],
    responsibleRoles: ['Head of Infrastructure', 'SecOps Lead'],
    recommendedReviewFrequency: 'Annual',
    crossFrameworkMappings: {
      iso27001: ['A.8.15', 'A.8.17'],
      nistCsf: ['PR.PT-01']
    }
  },
  {
    id: 'REQ-MAS-17.1',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    frameworkVersion: 'v2021.3',
    domainId: 'MAS-DOM-17',
    domainNumber: '17.0',
    domainName: 'Technology Audit, Independent Review & Assurance',
    sectionNumber: '17.1',
    requirementCode: 'MAS-TRM-17.1',
    title: 'Annual Independent Technology Risk Audit & Penetration Testing',
    statement: 'The FI shall engage an independent, qualified external auditor to conduct an annual Technology Risk audit, and conduct annual penetration testing across internal and external critical systems (Ref: Section 13.2 & Section 15.1).',
    intentAndGuidance: 'Penetration testing must cover network infrastructure, web applications, mobile apps, and APIs. Red teaming should be conducted for complex financial institutions.',
    regulatorySourceRef: 'MAS TRM Guidelines Section 13.2 & Section 15.1',
    mandatoryForFIs: true,
    criticalSystemsMandate: true,
    controlObjectives: [
      'Annual independent technology risk audit by external qualified auditors.',
      'Annual CREST-certified penetration testing covering external and internal attack surfaces.',
      'CAPA tracking for all High and Critical penetration test findings.'
    ],
    testProcedures: [
      'Review latest Independent Technology Audit Report issued by certified auditor.',
      'Verify CREST accreditation of external penetration testing vendor.'
    ],
    evidenceRequirements: [
      'Annual Independent MAS TRM Audit Report',
      'CREST-Certified Penetration Testing & Vulnerability Assessment Report'
    ],
    responsibleRoles: ['Head of Internal Audit', 'CISO', 'Board Audit Committee'],
    recommendedReviewFrequency: 'Annual',
    crossFrameworkMappings: {
      iso27001: ['A.8.8', 'Clause 9.2'],
      nistCsf: ['ID.RA-01', 'DE.CM-08']
    }
  }
];
