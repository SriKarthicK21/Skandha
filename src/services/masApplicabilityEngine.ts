// MAS TRM Requirement Applicability Engine
// Authoritative Evaluation against Monetary Authority of Singapore (MAS) Regulations:
// MAS TRM Guidelines 2021, Notice 644 (Critical System Outages), Notice 655 (Cyber Hygiene), PSN05 (Payment Services)

import { MASRegulatoryProfile, MASApplicabilityEvaluation, ApplicabilityRule, MASModuleApplicabilityDictionary } from '../types/masTrmFrameworkTypes';

export interface ApplicabilitySummary {
  totalEvaluated: number;
  applicableCount: number;
  potentiallyApplicableCount: number;
  notApplicableCount: number;
  mandatoryNoticesTriggered: string[];
  evaluations: MASApplicabilityEvaluation[];
}

export const DEFAULT_MAS_APPLICABILITY_RULES: ApplicabilityRule[] = [
  {
    id: 'rule_notice_644',
    code: 'MAS-AR-01',
    name: 'Notice 644 / Notice 127 Critical System Incident Dispatch & Resilience (MTD ≤ 4h)',
    description: 'Mandatory statutory notification within 1 hour of discovery and maximum allowable unplanned downtime of ≤ 4 hours within any 12-month period for designated Critical Information Systems (CIS).',
    category: 'MANDATORY_NOTICE',
    statutoryBasis: 'MAS Notice 644 / Notice 127 / PSN05',
    affectedModuleIds: ['mas_notice644_simulator', 'mas_critical_systems', 'mas_incident_notification'],
    moduleKeysDictionary: {
      mas_notice644_simulator: true,
      mas_critical_systems: true,
      mas_incident_notification: true
    },
    evaluator: (p: MASRegulatoryProfile) => p.isMasRegulated && (p.designatedCriticalSystemsCount || 0) > 0,
    rationaleIfActive: 'Institution operates designated Critical Information Systems subject to statutory 1-hour Form IT-01 reporting and strict RTO ≤ 4h limits.',
    rationaleIfInactive: 'No designated Critical Information Systems identified in regulatory scoping; statutory 1-hour outage dispatch requirement waived.'
  },
  {
    id: 'rule_notice_655',
    code: 'MAS-AR-02',
    name: 'Notice 655 Legally Enforceable Cyber Hygiene Mandates',
    description: 'Legally binding baseline cyber security practices: administrative account restriction, zero-trust MFA on privileged and remote access, network perimeter segmentation, malware defense, and prompt security patching.',
    category: 'CYBER_HYGIENE',
    statutoryBasis: 'MAS Notice 655 (Banking Act / MAS Act)',
    affectedModuleIds: ['mas_notice655_hygiene'],
    moduleKeysDictionary: {
      mas_notice655_hygiene: true
    },
    evaluator: (p: MASRegulatoryProfile) => p.isSingaporeEntity && p.isMasRegulated,
    rationaleIfActive: 'Legally binding on all licensed financial entities operating in Singapore under Section 655.',
    rationaleIfInactive: 'Entity is not regulated by the Monetary Authority of Singapore under the Banking Act / MAS Act.'
  },
  {
    id: 'rule_online_financial_services',
    code: 'MAS-AR-03',
    name: 'TRM Section 14.0 Online Financial Services & Transaction Authentication',
    description: 'Security controls for customer-facing digital channels, web application defense, API gateway protection, dynamic transaction signing, and mutual TLS tokenization.',
    category: 'ONLINE_SERVICES',
    statutoryBasis: 'MAS TRM Guidelines Section 14.0',
    affectedModuleIds: ['online_fin_services', 'online_banking_security'],
    moduleKeysDictionary: {
      online_fin_services: true,
      online_banking_security: true
    },
    evaluator: (p: MASRegulatoryProfile) => Boolean(p.onlineFinancialServicesOffered),
    rationaleIfActive: 'Institution provides customer-facing online banking, mobile payment, or transactional web portals.',
    rationaleIfInactive: 'No retail or wholesale online transactional services provided directly to customers.'
  },
  {
    id: 'rule_cloud_outsourcing',
    code: 'MAS-AR-04',
    name: 'TRM Section 5.0 & Outsourcing Guidelines Cloud Risk Architecture',
    description: 'Governance and continuous monitoring over cloud service providers (CSPs), third-party SaaS vendors, multi-tenant container isolation, data residency, and exit strategies.',
    category: 'CLOUD_OUTSOURCING',
    statutoryBasis: 'MAS TRM Section 5.0 & MAS Outsourcing Guidelines 2024',
    affectedModuleIds: ['third_party_risk', 'cloud_outsourcing'],
    moduleKeysDictionary: {
      third_party_risk: true,
      cloud_outsourcing: true
    },
    evaluator: (p: MASRegulatoryProfile) => p.cloudAdoptionModel !== 'On-Premises Only' || (p.materialOutsourcers?.length || 0) > 0,
    rationaleIfActive: 'Institution utilizes commercial cloud infrastructure (AWS/GCP/Azure) or material third-party IT service providers.',
    rationaleIfInactive: 'Entity operates exclusively in self-hosted on-premises data centers with no material external IT vendors.'
  },
  {
    id: 'rule_core_trm_governance',
    code: 'MAS-AR-05',
    name: 'Core Technology Risk Management Guidelines (Chapters 3.0 – 16.0)',
    description: 'Foundation TRM governance: Board oversight, IT asset inventory, vulnerability management, threat intelligence, and annual independent IT audit.',
    category: 'GENERAL_TRM',
    statutoryBasis: 'MAS TRM Guidelines 2021 (All Chapters)',
    affectedModuleIds: [
      'mas_compliance_flow',
      'mas_trm_journey',
      'mas_discovery_scoping',
      'mas_dashboard',
      'mas_checklist',
      'mas_overview',
      'mas_applicability',
      'mas_assessment_workbench',
      'mas_policy_generator',
      'cross_framework_crosswalk',
      'regulatory_sources',
      'mas_reporting',
      'iso_mas_improvements'
    ],
    moduleKeysDictionary: {
      mas_compliance_flow: true,
      mas_trm_journey: true,
      mas_discovery_scoping: true,
      mas_dashboard: true,
      mas_checklist: true,
      mas_overview: true,
      mas_applicability: true,
      mas_assessment_workbench: true,
      mas_policy_generator: true,
      cross_framework_crosswalk: true,
      regulatory_sources: true,
      mas_reporting: true,
      iso_mas_improvements: true
    },
    evaluator: (p: MASRegulatoryProfile) => p.isMasRegulated,
    rationaleIfActive: 'Institution is licensed or supervised by MAS, requiring full TRM governance and continuous telemetry.',
    rationaleIfInactive: 'Organization operates outside MAS regulatory purview.'
  }
];

export function getActiveMASModulesFromProfile(
  profile: MASRegulatoryProfile,
  rules: ApplicabilityRule[] = DEFAULT_MAS_APPLICABILITY_RULES
): {
  activeModuleIds: string[];
  moduleKeysDictionary: Record<string, boolean>;
  ruleResults: Record<string, { active: boolean; rule: ApplicabilityRule; reason: string }>;
} {
  const activeModuleIds = new Set<string>();
  const moduleKeysDictionary: Record<string, boolean> = {};
  const ruleResults: Record<string, { active: boolean; rule: ApplicabilityRule; reason: string }> = {};

  // First register all toggle-able module keys across all rules as inactive (false)
  for (const rule of rules) {
    for (const modId of rule.affectedModuleIds) {
      moduleKeysDictionary[modId] = false;
    }
    if (rule.moduleKeysDictionary) {
      for (const modKey of Object.keys(rule.moduleKeysDictionary)) {
        moduleKeysDictionary[modKey] = false;
      }
    }
  }

  // Evaluate each rule against the discovered regulatory profile
  for (const rule of rules) {
    const isActive = rule.evaluator(profile);
    ruleResults[rule.id] = {
      active: isActive,
      rule,
      reason: isActive ? rule.rationaleIfActive : rule.rationaleIfInactive
    };

    if (isActive) {
      for (const modId of rule.affectedModuleIds) {
        activeModuleIds.add(modId);
        moduleKeysDictionary[modId] = true;
      }
      if (rule.moduleKeysDictionary) {
        for (const modKey of Object.keys(rule.moduleKeysDictionary)) {
          activeModuleIds.add(modKey);
          moduleKeysDictionary[modKey] = true;
        }
      }
    }
  }

  // The Discovery and Scoping Wizard is always accessible to allow regulatory profile calibration
  activeModuleIds.add('mas_discovery_scoping');
  moduleKeysDictionary['mas_discovery_scoping'] = true;

  // Propagate to route aliases
  const aliasPairs: Array<[string, string]> = [
    ['cis_downtime_ledger', 'mas_critical_systems'],
    ['notice644_incident', 'mas_incident_notification'],
    ['mas_flow_dashboard', 'mas_compliance_flow'],
    ['mas_implementation_journey', 'mas_trm_journey'],
    ['mas_classic_dashboard', 'mas_dashboard'],
    ['mas_compliance_checklist', 'mas_checklist']
  ];

  for (const [alias, target] of aliasPairs) {
    const isTargetActive = Boolean(moduleKeysDictionary[target]);
    moduleKeysDictionary[alias] = isTargetActive;
    if (isTargetActive) {
      activeModuleIds.add(alias);
    }
  }

  return {
    activeModuleIds: Array.from(activeModuleIds),
    moduleKeysDictionary,
    ruleResults
  };
}

export function evaluateMASApplicability(profile: MASRegulatoryProfile): ApplicabilitySummary {
  const evaluations: MASApplicabilityEvaluation[] = [];
  const mandatoryNoticesTriggered: string[] = [];

  const isBank = profile.entityType?.includes('BANK') || profile.businessModel === 'Banking';
  const isPaymentService = profile.entityType?.includes('PAYMENT') || profile.regulatedActivities?.includes('Payment Services');
  const hasCriticalSystems = (profile.designatedCriticalSystemsCount || 0) > 0;
  const hasCloud = profile.cloudAdoptionModel && profile.cloudAdoptionModel !== 'ON_PREMISE_ONLY';
  const hasOnlineServices = Boolean(profile.onlineFinancialServicesOffered);
  const hasThirdParty = (profile.materialOutsourcers?.length || 0) > 0;

  // Track statutory notices triggered
  if (hasCriticalSystems) {
    mandatoryNoticesTriggered.push('MAS Notice 644 (Technology Risk Management - Critical System Incident Reporting)');
  }
  if (profile.isSingaporeEntity && profile.isMasRegulated) {
    mandatoryNoticesTriggered.push('MAS Notice 655 (Cyber Hygiene - Legally Enforceable Binding Controls)');
  }
  if (isPaymentService) {
    mandatoryNoticesTriggered.push('MAS Notice PSN05 (Notice on Cyber Hygiene for Payment Service Providers)');
  }

  // --- Domain 3.0: Governance & Oversight ---
  evaluations.push({
    requirementId: 'REQ-MAS-3.1',
    requirementCode: 'TRM-3.1',
    title: 'Board of Directors & Senior Management Oversight of Technology Risk',
    domainNumber: '3.0',
    domainName: 'Governance & Oversight',
    statutoryBasis: 'MAS TRM Guidelines Section 3.1 & Notice 655',
    applicability: 'Applicable',
    rationale: 'Mandatory for all MAS-regulated financial institutions. Board must approve TRM strategy and risk appetite.',
    requiredEvidenceTypes: ['Board Minutes approving TRM Strategy', 'Terms of Reference for Board Risk Committee'],
    crossFrameworkIsoControl: 'Clause 5.1 Leadership and commitment'
  });

  evaluations.push({
    requirementId: 'REQ-MAS-3.2',
    requirementCode: 'TRM-3.2',
    title: 'Appointment of Chief Information Security Officer (CISO)',
    domainNumber: '3.0',
    domainName: 'Governance & Oversight',
    statutoryBasis: 'MAS TRM Guidelines Section 3.2',
    applicability: 'Applicable',
    rationale: 'Required independent executive reporting line for cybersecurity and technology risk.',
    requiredEvidenceTypes: ['CISO Job Description & Mandate', 'Executive Organization Chart'],
    crossFrameworkIsoControl: 'Clause 5.3 Organizational roles, responsibilities and authorities'
  });

  evaluations.push({
    requirementId: 'REQ-MAS-3.4',
    requirementCode: 'TRM-3.4',
    title: 'Comprehensive Information Asset Inventory & Ownership',
    domainNumber: '3.0',
    domainName: 'Information Asset Management',
    statutoryBasis: 'MAS TRM Guidelines Section 3.4',
    applicability: 'Applicable',
    rationale: 'All institutions must maintain complete asset registers with assigned business and tech owners.',
    requiredEvidenceTypes: ['Asset Inventory Spreadsheet/DB Export', 'Data Classification Matrix'],
    crossFrameworkIsoControl: 'A.5.9 Inventory of information and other associated assets'
  });

  evaluations.push({
    requirementId: 'REQ-MAS-3.5',
    requirementCode: 'TRM-3.5',
    title: 'Technology Third-Party & Cloud Outsourcing Risk Assessment',
    domainNumber: '3.0',
    domainName: 'Third-Party Risk',
    statutoryBasis: 'MAS TRM Guidelines Section 3.5 & MAS Guidelines on Outsourcing',
    applicability: hasThirdParty || hasCloud ? 'Applicable' : 'Potentially Applicable',
    rationale: hasThirdParty || hasCloud
      ? `Active third parties (${profile.materialOutsourcers?.length || 0}) or cloud adoption detected. Full vendor due diligence required.`
      : 'Review required to verify if non-material cloud SaaS or sub-contractors exist.',
    requiredEvidenceTypes: ['Vendor SOC 2 Type II Reports', 'Cloud Penetration Test Confirmations', 'Exit Strategy Document'],
    crossFrameworkIsoControl: 'A.5.19 Information security in supplier relationships'
  });

  // --- Domain 4.0: Technology Risk Management Framework ---
  evaluations.push({
    requirementId: 'REQ-MAS-4.1',
    requirementCode: 'TRM-4.1',
    title: 'Technology Risk Management Framework (TRMF) & Risk Appetite Statement',
    domainNumber: '4.0',
    domainName: 'Technology Risk Management',
    statutoryBasis: 'MAS TRM Guidelines Section 4.1',
    applicability: 'Applicable',
    rationale: 'Enterprise risk framework establishing qualitative and quantitative tolerance thresholds for cyber & operational risk.',
    requiredEvidenceTypes: ['Approved TRMF Policy', 'Risk Appetite and Tolerance Statement'],
    crossFrameworkIsoControl: 'Clause 6.1 Actions to address risks and opportunities'
  });

  evaluations.push({
    requirementId: 'REQ-MAS-4.2',
    requirementCode: 'TRM-4.2',
    title: 'Continuous Identification & Assessment across 14 Tech Risk Categories',
    domainNumber: '4.0',
    domainName: 'Technology Risk Management',
    statutoryBasis: 'MAS TRM Guidelines Section 4.2',
    applicability: 'Applicable',
    rationale: 'Continuous technology risk register capturing asset, threat, vulnerability, inherent risk, treatment, and residual risk.',
    requiredEvidenceTypes: ['Technology Risk Register', 'Risk Treatment Action Plan'],
    crossFrameworkIsoControl: 'A.8.8 Management of technical vulnerabilities'
  });

  // --- Domain 5.0 & 6.0: SDLC & Software Security ---
  evaluations.push({
    requirementId: 'REQ-MAS-5.1',
    requirementCode: 'TRM-5.1',
    title: 'IT Project Management & Security-by-Design Governance',
    domainNumber: '5.0',
    domainName: 'IT Project Management',
    statutoryBasis: 'MAS TRM Guidelines Section 5.1',
    applicability: 'Applicable',
    rationale: 'Embedding threat modeling, security requirements, and QA gate signs before deploying systems.',
    requiredEvidenceTypes: ['Project Steering Committee Charter', 'Architecture Threat Models'],
    crossFrameworkIsoControl: 'A.8.25 Secure development life cycle'
  });

  evaluations.push({
    requirementId: 'REQ-MAS-6.1',
    requirementCode: 'TRM-6.1',
    title: 'Automated Application Security Testing (SAST / DAST / SCA) & Secure Coding',
    domainNumber: '6.0',
    domainName: 'Software Development & Application Security',
    statutoryBasis: 'MAS TRM Guidelines Section 6.1 & Annex A',
    applicability: 'Applicable',
    rationale: 'Mandatory AST across source code, binaries, third-party libraries, and APIs.',
    requiredEvidenceTypes: ['DevSecOps CI/CD Pipeline Scan Logs', 'Secure Coding Standard'],
    crossFrameworkIsoControl: 'A.8.28 Secure coding'
  });

  // --- Domain 7.0: IT Service Management ---
  evaluations.push({
    requirementId: 'REQ-MAS-7.2',
    requirementCode: 'TRM-7.2',
    title: 'Patch Management Timelines & Vulnerability Remediation SLAs',
    domainNumber: '7.0',
    domainName: 'IT Service Management',
    statutoryBasis: 'MAS TRM Guidelines Section 7.2 & Notice 655 Pillar 3',
    applicability: 'Applicable',
    rationale: 'Notice 655 mandates security patches for critical vulnerabilities within specific statutory windows.',
    requiredEvidenceTypes: ['Monthly Patch Compliance Reports', 'Vulnerability Remediation SOP'],
    crossFrameworkIsoControl: 'A.8.19 Installation of software on operational systems'
  });

  evaluations.push({
    requirementId: 'REQ-MAS-7.3',
    requirementCode: 'TRM-7.3',
    title: 'Change Management & Segregation of Duties for Production Deployments',
    domainNumber: '7.0',
    domainName: 'IT Service Management',
    statutoryBasis: 'MAS TRM Guidelines Section 7.3',
    applicability: 'Applicable',
    rationale: 'Developers must not have access to push directly to production without independent CAB approval.',
    requiredEvidenceTypes: ['CAB Approval Records', 'Git Production Branch Protection Settings'],
    crossFrameworkIsoControl: 'A.8.32 Change management'
  });

  // --- Domain 8.0: IT Resilience & Critical Systems ---
  evaluations.push({
    requirementId: 'REQ-MAS-8.1',
    requirementCode: 'TRM-8.1',
    title: 'Recovery Time Objective (RTO <= 4 Hours) for Critical Systems',
    domainNumber: '8.0',
    domainName: 'IT Resilience',
    statutoryBasis: 'MAS TRM Guidelines Section 8.1 & Notice 644',
    applicability: hasCriticalSystems ? 'Applicable' : 'Potentially Applicable',
    rationale: hasCriticalSystems
      ? `Critical systems registered (${profile.designatedCriticalSystemsCount}). RTO <= 4 hours and max annual unplanned downtime <= 4 hours are statutory mandates.`
      : 'Review required: Determine if any operational system qualifies as a designated Critical Information System (CIS).',
    mandatoryRuleTriggered: hasCriticalSystems ? 'MAS Notice 644 Statutory Obligation' : undefined,
    requiredEvidenceTypes: ['Annual Disaster Recovery Drill Report', 'System Architecture Topology Showing Redundancy'],
    crossFrameworkIsoControl: 'A.8.14 Redundancy of information processing facilities'
  });

  evaluations.push({
    requirementId: 'REQ-MAS-8.2',
    requirementCode: 'TRM-8.2',
    title: 'Recovery Point Objective (RPO <= 1 Hour) & Immutable Backup Testing',
    domainNumber: '8.0',
    domainName: 'IT Resilience',
    statutoryBasis: 'MAS TRM Guidelines Section 8.2',
    applicability: 'Applicable',
    rationale: 'Critical data must be backed up frequently and tested regularly with verified restoration.',
    requiredEvidenceTypes: ['Backup Restoration Test Logs', 'Cloud Object Lock / WORM Retention Proof'],
    crossFrameworkIsoControl: 'A.8.13 Information backup'
  });

  // --- Domain 9.0: Access Control & PAM ---
  evaluations.push({
    requirementId: 'REQ-MAS-9.1',
    requirementCode: 'TRM-9.1',
    title: 'Multi-Factor Authentication (MFA) on Administrative & Remote Access',
    domainNumber: '9.0',
    domainName: 'Access Control',
    statutoryBasis: 'MAS TRM Guidelines Section 9.1 & Notice 655 Pillar 5',
    applicability: 'Applicable',
    rationale: 'Notice 655 legally mandates MFA for all administrator logins and remote network access.',
    mandatoryRuleTriggered: 'MAS Notice 655 Legally Binding Directive',
    requiredEvidenceTypes: ['IAM MFA Enforcement Configuration', 'VPN / ZTNA Authentication Audit Logs'],
    crossFrameworkIsoControl: 'A.8.5 Secure authentication'
  });

  evaluations.push({
    requirementId: 'REQ-MAS-9.2',
    requirementCode: 'TRM-9.2',
    title: 'Privileged Access Management (PAM) with Audit Session Logging',
    domainNumber: '9.0',
    domainName: 'Access Control',
    statutoryBasis: 'MAS TRM Guidelines Section 9.2 & Notice 655 Pillar 4',
    applicability: 'Applicable',
    rationale: 'Mandatory restriction of privileged accounts, elimination of shared admin IDs, and dual-custody access.',
    mandatoryRuleTriggered: 'MAS Notice 655 Legally Binding Directive',
    requiredEvidenceTypes: ['PAM Vault Session Records', 'Quarterly Privileged Access Recertification'],
    crossFrameworkIsoControl: 'A.8.2 Privileged access rights'
  });

  // --- Domain 10.0: Cryptography ---
  evaluations.push({
    requirementId: 'REQ-MAS-10.1',
    requirementCode: 'TRM-10.1',
    title: 'Strong Cryptography, HSM Key Storage & Algorithm Lifecycle',
    domainNumber: '10.0',
    domainName: 'Cryptography',
    statutoryBasis: 'MAS TRM Guidelines Section 10.0',
    applicability: 'Applicable',
    rationale: 'Protection of sensitive financial and customer data in transit and at rest using internationally vetted algorithms.',
    requiredEvidenceTypes: ['HSM Cryptographic Key Custody Log', 'TLS 1.3 Baseline Configuration Audit'],
    crossFrameworkIsoControl: 'A.8.24 Use of cryptography'
  });

  // --- Domain 11.0: Data & Infrastructure Security ---
  evaluations.push({
    requirementId: 'REQ-MAS-11.1',
    requirementCode: 'TRM-11.1',
    title: 'Network Segmentation, Firewalls & Micro-Segmentation',
    domainNumber: '11.0',
    domainName: 'Data & Infrastructure Security',
    statutoryBasis: 'MAS TRM Guidelines Section 11.1 & Notice 655 Pillar 1',
    applicability: 'Applicable',
    rationale: 'Notice 655 mandates isolation between internet-facing systems, internal networks, and critical backend systems.',
    mandatoryRuleTriggered: 'MAS Notice 655 Legally Binding Directive',
    requiredEvidenceTypes: ['Network Segmentation Architecture Diagram', 'Firewall Rule Base Review Record'],
    crossFrameworkIsoControl: 'A.8.20 Network security'
  });

  evaluations.push({
    requirementId: 'REQ-MAS-11.2',
    requirementCode: 'TRM-11.2',
    title: 'Server Hardening Baselines & Endpoint Detection (EDR)',
    domainNumber: '11.0',
    domainName: 'Data & Infrastructure Security',
    statutoryBasis: 'MAS TRM Guidelines Section 11.2 & Notice 655 Pillar 2',
    applicability: 'Applicable',
    rationale: 'Disabling unused services, hardening operating systems according to CIS Benchmarks, and deploying anti-malware.',
    mandatoryRuleTriggered: 'MAS Notice 655 Legally Binding Directive',
    requiredEvidenceTypes: ['CIS Benchmark Automated Scan Results', 'EDR Agent Fleet Status Report'],
    crossFrameworkIsoControl: 'A.8.7 Protection against malware'
  });

  // --- Domain 12.0: Cyber Security Operations ---
  evaluations.push({
    requirementId: 'REQ-MAS-12.1',
    requirementCode: 'TRM-12.1',
    title: '24/7 Security Operations Centre (SOC) & FS-ISAC Threat Intelligence',
    domainNumber: '12.0',
    domainName: 'Cyber Security Operations',
    statutoryBasis: 'MAS TRM Guidelines Section 12.1',
    applicability: 'Applicable',
    rationale: 'Proactive detection of malicious indicators and prompt response to emerging threats.',
    requiredEvidenceTypes: ['SOC Service Level Agreement / Roster', 'Threat Intelligence Feed Ingestion Proof'],
    crossFrameworkIsoControl: 'A.8.16 Monitoring activities'
  });

  evaluations.push({
    requirementId: 'REQ-MAS-12.2',
    requirementCode: 'TRM-12.2',
    title: 'Statutory 1-Hour Incident Notification to MAS (Notice 644 / PSN05)',
    domainNumber: '12.0',
    domainName: 'Cyber Security Operations',
    statutoryBasis: 'MAS Notice 644 & Notice PSN05',
    applicability: hasCriticalSystems || isPaymentService ? 'Applicable' : 'Potentially Applicable',
    rationale: 'Legally required to notify MAS within 1 hour of discovering a critical system disruption or severe security event.',
    mandatoryRuleTriggered: 'MAS Notice 644 Statutory SLA',
    requiredEvidenceTypes: ['Incident Response Plan with 1h MAS Escalation SLA', 'Form IT-01 Notification Template'],
    crossFrameworkIsoControl: 'A.5.24 Information security incident management planning and preparation'
  });

  // --- Domain 13.0: Cyber Security Assessment ---
  evaluations.push({
    requirementId: 'REQ-MAS-13.1',
    requirementCode: 'TRM-13.1',
    title: 'Annual Independent Penetration Testing on Production Systems',
    domainNumber: '13.0',
    domainName: 'Cyber Security Assessment',
    statutoryBasis: 'MAS TRM Guidelines Section 13.1',
    applicability: 'Applicable',
    rationale: 'Independent external security assessors must test production systems, network perimeter, and APIs annually.',
    requiredEvidenceTypes: ['Third-Party Penetration Test Final Report', 'Executive Summary of Remediated Findings'],
    crossFrameworkIsoControl: 'A.8.8 Management of technical vulnerabilities'
  });

  evaluations.push({
    requirementId: 'REQ-MAS-13.2',
    requirementCode: 'TRM-13.2',
    title: 'Adversarial Attack Simulation Exercises (AASE / Red Teaming)',
    domainNumber: '13.0',
    domainName: 'Cyber Security Assessment',
    statutoryBasis: 'MAS TRM Guidelines Section 13.2',
    applicability: isBank || hasCriticalSystems ? 'Applicable' : 'Not Applicable',
    rationale: isBank || hasCriticalSystems
      ? 'Mandatory for banks and institutions operating critical payment and trading systems.'
      : 'Not Applicable for non-bank, non-critical low-impact entities unless explicitly mandated by supervisory letter.',
    requiredEvidenceTypes: ['AASE Red Team Attack Scenario Dossier', 'Blue Team Defense Evaluation Report'],
    crossFrameworkIsoControl: 'A.8.8 Management of technical vulnerabilities'
  });

  // --- Domain 14.0: Online Financial Services ---
  evaluations.push({
    requirementId: 'REQ-MAS-14.1',
    requirementCode: 'TRM-14.1',
    title: 'Online Financial Services Security & Customer Authentication',
    domainNumber: '14.0',
    domainName: 'Online Financial Services',
    statutoryBasis: 'MAS TRM Guidelines Section 14.1',
    applicability: hasOnlineServices ? 'Applicable' : 'Not Applicable',
    rationale: hasOnlineServices
      ? 'Customer-facing portals or mobile banking services offered. Transaction signing and soft token binding required.'
      : 'Entity does not offer direct consumer-facing online banking or payment web/mobile applications.',
    requiredEvidenceTypes: ['Transaction Signing Implementation Proof', 'Mobile App Anti-Tamper & Jailbreak Detection Logs'],
    crossFrameworkIsoControl: 'A.8.5 Secure authentication'
  });

  evaluations.push({
    requirementId: 'REQ-MAS-14.2',
    requirementCode: 'TRM-14.2',
    title: 'Real-Time Fraud Monitoring & Unusual Transaction Detection',
    domainNumber: '14.0',
    domainName: 'Online Financial Services',
    statutoryBasis: 'MAS TRM Guidelines Section 14.2',
    applicability: hasOnlineServices ? 'Applicable' : 'Not Applicable',
    rationale: hasOnlineServices
      ? 'Requires real-time behavioral heuristics and anomaly rules to intercept unauthorized customer payments.'
      : 'Not applicable: No direct customer funds debiting or online transactional channel operates.',
    requiredEvidenceTypes: ['Fraud Detection Engine Rule Configuration', 'Customer Security Notification SMS/Push System Proof'],
    crossFrameworkIsoControl: 'A.8.16 Monitoring activities'
  });

  // --- Domain 15.0: IT Audit ---
  evaluations.push({
    requirementId: 'REQ-MAS-15.1',
    requirementCode: 'TRM-15.1',
    title: 'Independent and Objective IT Audit Coverage',
    domainNumber: '15.0',
    domainName: 'IT Audit',
    statutoryBasis: 'MAS TRM Guidelines Section 15.0',
    applicability: 'Applicable',
    rationale: 'Mandatory independent IT audit covering technology risk governance, operations, resilience, and cyber defense.',
    requiredEvidenceTypes: ['Independent IT Audit Report', 'Audit Committee Meeting Minutes & Findings Sign-Off'],
    crossFrameworkIsoControl: 'Clause 9.2 Internal audit'
  });

  const applicableCount = evaluations.filter(e => e.applicability === 'Applicable').length;
  const potentiallyApplicableCount = evaluations.filter(e => e.applicability === 'Potentially Applicable').length;
  const notApplicableCount = evaluations.filter(e => e.applicability === 'Not Applicable').length;

  return {
    totalEvaluated: evaluations.length,
    applicableCount,
    potentiallyApplicableCount,
    notApplicableCount,
    mandatoryNoticesTriggered,
    evaluations
  };
}
