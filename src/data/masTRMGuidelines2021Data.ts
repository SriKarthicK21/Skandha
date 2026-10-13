// Authoritative Grounding Dataset: MAS Technology Risk Management Guidelines (January 2021 Edition)
// Monetary Authority of Singapore - Official 57-Page Supervisory Standards & Guidance
// Ingested for RAG Intelligence, Statutory Crosswalks, and Audit-Grade Inspection Defense.

import { FrameworkDomain, RegulatoryRequirement } from '../types/regulatoryTypes';

export interface MASTRMCorpusExcerpt {
  sectionNumber: string;
  chapterTitle: string;
  verbatimExcerpt: string;
  footnotes: string[];
  supervisoryIntent: string;
  leadAuditorChecks: string[];
  pageNumber: number;
}

export const MAS_TRM_2021_EDITION_METADATA = {
  title: 'MAS Technology Risk Management Guidelines (January 2021 Edition)',
  publishedDate: 'January 2021',
  supervisoryAuthority: 'Monetary Authority of Singapore (MAS)',
  pageCount: 57,
  totalChapters: 15,
  totalAnnexes: 3,
  scope: 'All Financial Institutions licensed under the Banking Act, Payment Services Act, MAS Act, and SFA',
  principles: [
    'Establish Sound and Robust Technology Risk Governance and Oversight',
    'Maintain Cyber Resilience and Defense-in-Depth',
    'Embed Security-by-Design in System Acquisition, SDLC, and Operations',
    'Enforce Continuous Monitoring, Adversarial Attack Simulation (AASE), and Prompt Remediation'
  ]
};

export const MAS_TRM_DOMAINS_2021: FrameworkDomain[] = [
  {
    id: 'MAS-DOM-03',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    domainNumber: '3.0',
    name: 'Technology Risk Governance and Oversight',
    shortName: 'Governance & Oversight',
    description: 'Role of Board of Directors and Senior Management, CIO and CISO appointments, policies/standards/procedures, management of information assets, third-party services, competency, background checks, and security awareness.',
    objectivesSummary: 'Ensure executive accountability, independent CISO reporting, comprehensive asset inventories, and pervasive technology risk culture.',
    totalRequirements: 6,
    weightPercentage: 9,
    criticality: 'CRITICAL'
  },
  {
    id: 'MAS-DOM-04',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    domainNumber: '4.0',
    name: 'Technology Risk Management Framework',
    shortName: 'Risk Framework & Appetite',
    description: 'Enterprise Technology Risk Management Framework (TRMF), risk appetite & tolerance statement, continuous risk identification, assessment, treatment, and monitoring.',
    objectivesSummary: 'Formulate quantifiable technology risk tolerance, maintain dynamic risk registers, and monitor key risk indicators (KRIs).',
    totalRequirements: 5,
    weightPercentage: 7,
    criticality: 'CRITICAL'
  },
  {
    id: 'MAS-DOM-05',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    domainNumber: '5.0',
    name: 'IT Project Management and Security-by-Design',
    shortName: 'Project Mgmt & Security-by-Design',
    description: 'Project management framework, Steering Committee governance, system acquisition due diligence, source code escrow, COTS risk assessments, SDLC security-by-design, testing, and QA.',
    objectivesSummary: 'Embed security in requirements, architecture reviews, and gated testing prior to software deployment.',
    totalRequirements: 8,
    weightPercentage: 6,
    criticality: 'HIGH'
  },
  {
    id: 'MAS-DOM-06',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    domainNumber: '6.0',
    name: 'Software Application Development and Management',
    shortName: 'Secure Development & APIs',
    description: 'Secure coding standards, developer training, AST (SAST/DAST/IAST), Agile security, DevSecOps pipeline controls & segregation of duties, API security & token expiry, and End User Computing (Shadow IT).',
    objectivesSummary: 'Eliminate code flaws in financial applications, govern third-party API connectivity, and contain shadow IT.',
    totalRequirements: 5,
    weightPercentage: 8,
    criticality: 'CRITICAL'
  },
  {
    id: 'MAS-DOM-07',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    domainNumber: '7.0',
    name: 'IT Service Management',
    shortName: 'IT Service Management',
    description: 'ITSM framework, configuration management, technology refresh & End-of-Support (EOS) dispensation, patch management, change management (CAB & rollback), software release segregation of duties, incident & problem management.',
    objectivesSummary: 'Maintain reliable IT operations, timely patching, strict segregation between code commit and release, and crisis communications.',
    totalRequirements: 8,
    weightPercentage: 7,
    criticality: 'HIGH'
  },
  {
    id: 'MAS-DOM-08',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    domainNumber: '8.0',
    name: 'IT Resilience',
    shortName: 'IT Resilience & RTO/RPO',
    description: 'System availability, elimination of single points of failure (SPoF), system recoverability (RTO <= 4h, RPO <= 1h), disaster recovery plan testing, offline/offsite backup lifecycle, and Data Centre Resilience (TVRA, dual power/cooling).',
    objectivesSummary: 'Guarantee operational continuity of critical services with verified recovery metrics and resilient data center physical infrastructure.',
    totalRequirements: 5,
    weightPercentage: 10,
    criticality: 'CRITICAL'
  },
  {
    id: 'MAS-DOM-09',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    domainNumber: '9.0',
    name: 'Access Control',
    shortName: 'Access Control & PAM',
    description: 'User access management (principles of "never alone", segregation of duties, least privilege, password standards, MFA, periodic reviews), Privileged Access Management (PAM session logging), and remote access security.',
    objectivesSummary: 'Strictly control administrative access, enforce MFA on privileged accounts, and eliminate standing root privileges.',
    totalRequirements: 3,
    weightPercentage: 9,
    criticality: 'CRITICAL'
  },
  {
    id: 'MAS-DOM-10',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    domainNumber: '10.0',
    name: 'Cryptography',
    shortName: 'Cryptography & HSM',
    description: 'Cryptographic algorithm and protocol vetting, key length standards, Hardware Security Modules (HSMs), key lifecycle management (generation, distribution, out-of-band, diversification, revocation, destruction).',
    objectivesSummary: 'Safeguard cryptographic material using international standards and tamper-resistant hardware modules.',
    totalRequirements: 2,
    weightPercentage: 7,
    criticality: 'CRITICAL'
  },
  {
    id: 'MAS-DOM-11',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    domainNumber: '11.0',
    name: 'Data and Infrastructure Security',
    shortName: 'Data & Infrastructure Security',
    description: 'Data security across motion, rest, use (DLP, masking in non-prod), network security (segmentation, NIPS, web isolation, DoS mitigation), system security (baseline hardening, EDR, application whitelisting), virtualisation security, and IoT security.',
    objectivesSummary: 'Implement multi-layered defense-in-depth across networks, hypervisors, endpoints, and IoT devices.',
    totalRequirements: 5,
    weightPercentage: 8,
    criticality: 'HIGH'
  },
  {
    id: 'MAS-DOM-12',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    domainNumber: '12.0',
    name: 'Cyber Security Operations',
    shortName: 'Cyber Defense & 24/7 SOC',
    description: 'Cyber threat intelligence and FS-ISAC sharing, 24/7 Security Operations Centre (SOC) monitoring, UEBA and machine learning anomaly detection, centralized log preservation, and cyber incident response planning (CIRP).',
    objectivesSummary: 'Proactively detect and neutralize cyber threats in real-time through continuous SOC telemetry and threat sharing.',
    totalRequirements: 3,
    weightPercentage: 8,
    criticality: 'CRITICAL'
  },
  {
    id: 'MAS-DOM-13',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    domainNumber: '13.0',
    name: 'Cyber Security Assessment',
    shortName: 'Vulnerability & Red Teaming',
    description: 'Vulnerability assessment (VA), annual penetration testing (PT) on production, cyber tabletop exercises, Adversarial Attack Simulation Exercises (AASE / Red Teaming), intelligence-based scenario design, and remediation SLAs.',
    objectivesSummary: 'Validate cyber defense posture through independent technical penetration tests and simulated adversary attacks.',
    totalRequirements: 6,
    weightPercentage: 8,
    criticality: 'CRITICAL'
  },
  {
    id: 'MAS-DOM-14',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    domainNumber: '14.0',
    name: 'Online Financial Services',
    shortName: 'Online Financial Services & MFA',
    description: 'Security of online financial services (MITMA, DNS hijacking, DDoS, anti-phishing, jailbreak blocking), customer authentication and transaction signing (digital signatures for high-risk transfers, short OTP, biometric FAR/FRR, soft token device binding), fraud monitoring, and customer education.',
    objectivesSummary: 'Protect online and mobile banking users from credential theft, session hijacking, and fraudulent payments.',
    totalRequirements: 4,
    weightPercentage: 9,
    criticality: 'CRITICAL'
  },
  {
    id: 'MAS-DOM-15',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    domainNumber: '15.0',
    name: 'IT Audit',
    shortName: 'Independent IT Audit',
    description: 'Independent and objective IT audit function, comprehensive audit coverage, risk-commensurate audit frequency, and qualified IT auditors.',
    objectivesSummary: 'Provide executive leadership and the Board with independent assurance on the effectiveness of technology controls.',
    totalRequirements: 1,
    weightPercentage: 4,
    criticality: 'HIGH'
  },
  {
    id: 'MAS-DOM-ANNEX-A',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    domainNumber: 'Annex A',
    name: 'Application Security Testing (AST)',
    shortName: 'Annex A: AST Standards',
    description: 'Static Application Security Testing (SAST), Dynamic Application Security Testing (DAST), Interactive Application Security Testing (IAST), and Fuzz Testing methodology across development pipelines.',
    objectivesSummary: 'Systematically discover software vulnerabilities in source code, bytecode, binaries, and runtime interfaces.',
    totalRequirements: 2,
    weightPercentage: 3,
    criticality: 'MEDIUM'
  },
  {
    id: 'MAS-DOM-ANNEX-B',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    domainNumber: 'Annex B',
    name: 'Bring Your Own Device (BYOD) Security',
    shortName: 'Annex B: BYOD Controls',
    description: 'Mobile Device Management (MDM), Mobile Application Management (MAM), device encryption, remote wipe, root/jailbreak detection, and virtual desktop infrastructure (VDI) isolation.',
    objectivesSummary: 'Prevent enterprise data leakage when employees access financial systems from personal devices.',
    totalRequirements: 1,
    weightPercentage: 2,
    criticality: 'MEDIUM'
  },
  {
    id: 'MAS-DOM-ANNEX-C',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    domainNumber: 'Annex C',
    name: 'Mobile Application Security',
    shortName: 'Annex C: Mobile App Security',
    description: 'Elimination of sensitive data caching, cryptographic key protection, anti-hooking & anti-tampering runtime protection, application integrity checksums & code obfuscation, SSL/TLS public key pinning, secure in-app keypads, and device binding.',
    objectivesSummary: 'Harden mobile banking apps against reverse engineering, memory hooking, man-in-the-middle attacks, and keyloggers.',
    totalRequirements: 1,
    weightPercentage: 4,
    criticality: 'CRITICAL'
  },
  // Compatibility aliases for previous prototype references
  {
    id: 'MAS-DOM-16',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    domainNumber: '16.0',
    name: 'Logging, Audit Trail & Security Monitoring',
    shortName: 'Centralized Logging',
    description: 'Centralized immutable logging, minimum 1-year log retention, clock synchronization via secure NTP, and SIEM alerting (Ref: Section 12.2 & 7.5.7).',
    objectivesSummary: 'Maintain tamper-evident audit trails for forensic investigations and regulatory inspection.',
    totalRequirements: 1,
    weightPercentage: 2,
    criticality: 'HIGH'
  },
  {
    id: 'MAS-DOM-17',
    frameworkId: 'FW-MAS-TRM',
    frameworkCode: 'MAS TRM 2021',
    domainNumber: '17.0',
    name: 'Technology Audit, Independent Review & Assurance',
    shortName: 'Audit & Pen Testing',
    description: 'Annual independent Technology Risk audit and external VA/PT (Ref: Section 13.2 & 15.1).',
    objectivesSummary: 'Validate security controls through objective third-party assessments.',
    totalRequirements: 1,
    weightPercentage: 2,
    criticality: 'HIGH'
  }
];

export const MAS_TRM_2021_CORPUS_EXCERPTS: Record<string, MASTRMCorpusExcerpt> = {
  '3.1': {
    sectionNumber: '3.1',
    chapterTitle: 'Role of Board of Directors and Senior Management',
    verbatimExcerpt: `The Board of Directors and senior management are responsible for ensuring that the FI establishes and maintains an effective technology risk management framework... The Board and senior management should possess the requisite knowledge to understand and manage technology risks... Ensure appointment of a Chief Information Officer (CIO) or equivalent and a Chief Information Security Officer (CISO) or equivalent who have the requisite experience and expertise... (minimally approved by the CEO). Ensure key IT decisions are made in accordance with the FI's risk appetite and strategic direction. Cultivate a strong culture of technology risk awareness.`,
    footnotes: [
      'Footnote 1: CIO is responsible for IT strategy and operations; CISO is responsible for information security strategy and programme.',
      'Footnote 2: Define roles and responsibilities with a RACI matrix across all technology processes.'
    ],
    supervisoryIntent: 'The Board is ultimately accountable for technology risk. It cannot delegate accountability to IT vendors or lower management.',
    leadAuditorChecks: [
      'Verify Board Risk Committee meeting minutes showing quarterly technology risk updates.',
      'Confirm CISO has independent reporting line to CEO/CRO and does not report to CIO.',
      'Check Board approval of Technology Risk Appetite Statement within the past 12 months.'
    ],
    pageNumber: 3
  },
  '3.3': {
    sectionNumber: '3.3',
    chapterTitle: 'Management of Information Assets',
    verbatimExcerpt: `The FI should have a comprehensive and complete view of its IT operating environment... Maintain an inventory of all information assets, which should be reviewed periodically and updated as and when there are changes... Identify all information assets supporting business functions and delivery of financial services; classify assets based on security classification or criticality; assign asset ownership and define roles.`,
    footnotes: [
      'Footnote 3: Information assets include data, hardware, software, customer/third-party entrusted assets, leased assets, and vendor-delivered systems.'
    ],
    supervisoryIntent: 'You cannot protect what you do not know. A complete, up-to-date asset inventory is the bedrock of all cybersecurity controls.',
    leadAuditorChecks: [
      'Sample 30 network endpoints and verify all exist in the automated CMDB inventory.',
      'Verify asset classification policy and check that data owners have assigned classifications.'
    ],
    pageNumber: 5
  },
  '5.3': {
    sectionNumber: '5.3',
    chapterTitle: 'System Acquisition',
    verbatimExcerpt: `The FI should establish standards for vendor evaluation and selection... Assess vendor software development and QA practices; protect sensitive data that the vendor accesses; control and monitor vendor access to FI systems... For Commercial Off-The-Shelf (COTS) solutions, assess risks and implement mitigating controls prior to deployment... Assess source code escrow agreement based on software criticality, or identify alternatives if the vendor cannot provide support.`,
    footnotes: [
      'Footnote 6: Source code escrow ensures that in the event of vendor insolvency, the FI can access source code to maintain business continuity.'
    ],
    supervisoryIntent: 'Procured software introduces supply chain vulnerabilities and operational dependencies that must be contractually and technically safeguarded.',
    leadAuditorChecks: [
      'Review source code escrow agreements for critical third-party payment and core ledger software.',
      'Examine vendor security assessment questionnaires and SOC 2 Type II reports.'
    ],
    pageNumber: 10
  },
  '6.3': {
    sectionNumber: '6.3',
    chapterTitle: 'DevSecOps Management',
    verbatimExcerpt: `The FI should automate and integrate IT operations, quality assurance, and IT security in the CI/CD pipeline... Ensure that DevSecOps practices are aligned with SDLC and ITSM framework... Enforce segregation of duties between development, testing, and release functions in DevSecOps pipelines.`,
    footnotes: [
      'Footnote 8: No single developer should have the ability to commit code and independently promote it directly to production without automated and peer approval gates.'
    ],
    supervisoryIntent: 'Continuous delivery must not circumvent internal controls. Automation must embed security checks and tamper-resistant change verification.',
    leadAuditorChecks: [
      'Inspect GitHub/GitLab pipeline configuration to verify mandatory branch protection and PR reviews.',
      'Verify that developers do not have direct write access or credentials to production AWS/GCP clusters.'
    ],
    pageNumber: 13
  },
  '6.4': {
    sectionNumber: '6.4',
    chapterTitle: 'Application Programming Interface (API) Development',
    verbatimExcerpt: `Establish adequate safeguards for open APIs... Well-defined vetting process for third parties connecting via APIs... Risk assessment prior to allowing third-party connection... Enforce secure API standards: protect API keys and access tokens; enforce reasonable timeframe for access token expiry; strong encryption and key management; security testing before production; log third-party access sessions; real-time monitoring and alerting for suspicious activity; prompt token revocation on breach; adequate system capacity and DoS mitigation.`,
    footnotes: [
      'Footnote 10: Access tokens should have a short validity duration (e.g. 15-60 minutes) to minimize the replay window if intercepted.'
    ],
    supervisoryIntent: 'APIs are the primary attack surface in modern Open Banking and FinTech integrations. Strict authentication, authorization, rate limiting, and session revocation are mandatory.',
    leadAuditorChecks: [
      'Verify API gateway OAuth2 token expiry configuration (confirm <= 60 mins).',
      'Inspect API rate limiting and WAF DDoS mitigation policies for open banking endpoints.',
      'Review third-party API onboarding security review checklist.'
    ],
    pageNumber: 14
  },
  '7.3': {
    sectionNumber: '7.3',
    chapterTitle: 'Technology Refresh Management',
    verbatimExcerpt: `Avoid using outdated or unsupported hardware and software... Monitor End-of-Support (EOS) and End-of-Life (EOL) dates... Develop a technology refresh plan prior to EOS... Perform a risk assessment for assets approaching EOS... Where continued use of unsupported software is unavoidable, obtain management dispensation with a defined validity period and periodic review.`,
    footnotes: [
      'Footnote 11: Management dispensation must specify compensating controls (e.g. network isolation, virtual patching) and an explicit decommissioning target.'
    ],
    supervisoryIntent: 'Running unsupported operating systems, databases, or libraries leaves the institution vulnerable to unpatchable zero-day exploits.',
    leadAuditorChecks: [
      'Examine the Enterprise EOS/EOL tracker against current production server versions.',
      'Check whether any system past EOS has a valid, signed CRO dispensation with compensating controls.'
    ],
    pageNumber: 16
  },
  '8.2': {
    sectionNumber: '8.2',
    chapterTitle: 'System Recoverability (RTO & RPO)',
    verbatimExcerpt: `Establish Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO) aligned to business resumption priorities... The FI shall design and operate critical systems to achieve an RTO of not more than 4 hours, an RPO of not more than 1 hour, and cumulative unscheduled downtime not exceeding 4 hours in any 12-month period... Disaster recovery plan covering disaster scenarios, roles and responsibilities; annual review... Follow approved DR plan... Periodically operate from recovery, secondary, or alternate site to assure extended operational capability.`,
    footnotes: [
      'Notice 644/Notice 655 Statutory SLA: RTO <= 4 Hours, RPO <= 1 Hour, Cumulative Unscheduled Downtime <= 4 Hours/Year.'
    ],
    supervisoryIntent: 'Ensures systemic payment and financial settlement infrastructure can survive catastrophic regional or cloud datacenter failures.',
    leadAuditorChecks: [
      'Review the report from the latest annual DR switchover drill, verifying measured RTO and RPO.',
      'Inspect 12-month historical uptime logs to confirm unscheduled downtime did not exceed 4 hours.'
    ],
    pageNumber: 21
  },
  '8.5': {
    sectionNumber: '8.5',
    chapterTitle: 'Data Centre Resilience & TVRA',
    verbatimExcerpt: `Perform Threat and Vulnerability Risk Assessment (TVRA) covering physical and environmental threats (flooding, fire, natural disasters, terrorism, electricity surge, EMP) and political/economic climate; review on significant changes... Redundancy for power (UPS, diesel generators with fuel reserves), network paths, and cooling (dual chillers/CRAC) to eliminate SPoF... Environmental controls: fire detection (smoke/heat, inert gas, sprinklers)... Secondary/DR DC geographically separated from primary DC so both not impacted by single disruption... 24/7 physical security and monitoring; strict access controls on need-to-have basis, visitor escort, rack security, segregation of common areas.`,
    footnotes: [
      'Footnote 14: TVRA must evaluate hazards in the vicinity including flight paths, hazardous chemical storage, and flood plains.'
    ],
    supervisoryIntent: 'A cyber-secure application can still collapse if physical power, cooling, or building perimeter defenses fail.',
    leadAuditorChecks: [
      'Inspect the latest TVRA report (conducted by a certified physical security specialist).',
      'Verify fuel storage capacity for backup generators (minimum 48-72 hours continuous runtime).',
      'Review physical access logs and visitor badges for primary and DR data halls.'
    ],
    pageNumber: 23
  },
  '10.2': {
    sectionNumber: '10.2',
    chapterTitle: 'Cryptographic Key Management',
    verbatimExcerpt: `Establish key management policy, standards, and procedures covering generation, distribution, installation, renewal, revocation, recovery, and expiry... Sensitive keys securely generated and protected from unauthorized disclosure... Store and process sensitive keys in hardened tamper-resistant systems (Hardware Security Module - HSM)... Transmit keys securely via out-of-band channels... Key diversification: keys used for single purpose (separate encryption from signing)... Compromised keys revoked and replaced immediately along with all dependent keys... Secure key destruction ensuring keys are unrecoverable.`,
    footnotes: [
      'Footnote 19: HSMs should be validated to FIPS 140-2 Level 3 or higher or Common Criteria EAL 4+.'
    ],
    supervisoryIntent: 'If cryptographic keys are compromised or stored in plain software memory, all encryption is rendered useless.',
    leadAuditorChecks: [
      'Inspect HSM inventory and FIPS 140-2 Level 3 attestation certificates.',
      'Verify dual control (split knowledge) procedures for root key generation and key ceremonies.',
      'Confirm out-of-band procedures for key distribution.'
    ],
    pageNumber: 28
  },
  '13.4': {
    sectionNumber: '13.4',
    chapterTitle: 'Adversarial Attack Simulation Exercise (AASE / Red Teaming)',
    verbatimExcerpt: `Conduct Adversarial Attack Simulation Exercises (AASE) to test cyber defense and response against prevalent cyber threats simulating real-world adversaries... Define objectives, scope, rules of engagement; conducted in a controlled manner under close supervision to not disrupt production... Intelligence-based scenario design using threat intelligence to identify most likely threat actors and their tactics, techniques, and procedures (TTPs)... Track and remediate findings based on severity.`,
    footnotes: [
      'Footnote 32: AASE simulates sophisticated threat actors (e.g. nation-state or advanced cyber crime syndicates) to test prevention, detection, and response capabilities.',
      'Footnote 33: Financial institutions should engage independent CREST-accredited red teaming service providers.'
    ],
    supervisoryIntent: 'Static vulnerability scans cannot test human SOC response times or defense-in-depth against blended multi-stage attacks.',
    leadAuditorChecks: [
      'Review the latest Red Team report, White Team rules of engagement, and executive debrief.',
      'Verify that all High and Critical findings have an active CAPA remediation plan with designated owners.'
    ],
    pageNumber: 38
  },
  '14.2': {
    sectionNumber: '14.2',
    chapterTitle: 'Customer Authentication and Transaction Signing',
    verbatimExcerpt: `Multi-Factor Authentication (MFA) at login for online financial services based on two or more factors (knowledge, possession, inherence)... End-to-end encryption for customer passwords; verified only in hardened systems... Transaction signing (digital signatures) for high-risk activities: adding third-party payees, funds transfers above threshold, updating contact details/address, increasing transfer limits... Short validity period for time-based OTP... Biometric FAR and FRR calibrated commensurate with risk... Soft token 2FA: verify identity, block rooted/jailbroken devices, device binding during provisioning... Automatic session termination upon inactivity timeout... Maker-checker controls for corporate customers.`,
    footnotes: [
      'Footnote 21: MFA requires factors from at least two different categories: (1) something you know, (2) something you have, (3) something you are.',
      'Footnote 38/39: Calibrate False Acceptance Rate (FAR) to an acceptably low probability (e.g. < 0.001%) to prevent impostor access.',
      'Footnote 41: Device binding links the cryptographic soft token to unique hardware identifiers of the customer mobile phone.'
    ],
    supervisoryIntent: 'Prevents account takeover, SIM-swapping, and fraudulent money exfiltration through mandatory digital transaction signing and device binding.',
    leadAuditorChecks: [
      'Verify transaction signing prompt and cryptographically signed payload for adding a new payee.',
      'Check mobile app soft token provisioning flow to verify device binding and jailbreak detection.',
      'Confirm session timeout is configured to <= 15 minutes of inactivity.'
    ],
    pageNumber: 42
  },
  'Annex C': {
    sectionNumber: 'Annex C',
    chapterTitle: 'Mobile Application Security',
    verbatimExcerpt: `The FI should implement specific mobile application security measures: (a) Avoid storing or caching sensitive data in the mobile app; store in protected/trusted areas (Keychain/Keystore); (b) Protect private cryptographic keys; (c) Implement anti-hooking or anti-tampering mechanisms to prevent code injection at runtime; (d) Implement application integrity checks (checksum, signature) and code obfuscation to prevent reverse engineering; (e) Implement certificate or public key pinning against MITMA; (f) Implement secure in-app keypad to mitigate against keylogger malware; (g) Implement device binding to protect soft tokens from cloning.`,
    footnotes: [
      'Annex C.1(c): Anti-hooking detects runtime instrumentation frameworks such as Frida, Substrate, or Xposed.',
      'Annex C.1(e): Public key pinning ensures the app only connects to servers presenting authorized public keys.'
    ],
    supervisoryIntent: 'Protects mobile banking applications operating in untrusted consumer environments from being modified, monitored, or cloned by malware.',
    leadAuditorChecks: [
      'Inspect mobile app build pipeline for ProGuard/DexGuard code obfuscation.',
      'Test mobile app on rooted/jailbroken device to verify automatic termination.',
      'Verify SSL public key pinning implementation in network interceptor code.'
    ],
    pageNumber: 52
  }
};
