export type SupportedFrameworkKey =
  | 'ISO_27001'
  | 'ISO_42001'
  | 'MAS_TRM'
  | 'DPDP'
  | 'BRANDGUARD'
  | 'SOC_2'
  | 'ISO_22301';

export interface GranularRequirement {
  id: string;
  frameworkKey: SupportedFrameworkKey;
  code: string;
  title: string;
  description: string;
  associatedModuleIds: string[];
}

export interface FrameworkRequirementSpec {
  key: SupportedFrameworkKey;
  code: string;
  shortTitle: string;
  name: string;
  badge: string;
  badgeColor: string;
  description: string;
  iconName: string;
  whatIsActuallyRequired: string[];
  granularRequirements: GranularRequirement[];
  unlockedModules: Array<{ id: string; label: string }>;
  isPrimary?: boolean;
}

export const GRANULAR_REQUIREMENTS: GranularRequirement[] = [
  // --- ISO 27001 Granular Requirements ---
  {
    id: 'req_iso27001_clauses',
    frameworkKey: 'ISO_27001',
    code: 'Clauses 4–10',
    title: 'ISMS Governance Clauses 4–10 (Context, Leadership, Planning, Operations, Audit, CAPA)',
    description: 'Mandatory organizational governance clauses and interested parties obligations.',
    associatedModuleIds: ['iso27001_clauses', 'stakeholder_obligations']
  },
  {
    id: 'req_iso27001_controls',
    frameworkKey: 'ISO_27001',
    code: '93 Annex A Controls',
    title: '93 Annex A Security Controls & Statement of Applicability (SoA) Hub',
    description: 'Annex A controls workbench across Organizational, People, Physical, and Technological themes.',
    associatedModuleIds: ['iso27001_workbench', 'statement_of_applicability']
  },
  {
    id: 'req_iso27001_monitoring',
    frameworkKey: 'ISO_27001',
    code: 'Continuous Monitoring',
    title: 'Continuous Post-Cert ISO Monitoring & ISMS Command Center',
    description: 'Automated continuous control evaluation and real-time compliance telemetry.',
    associatedModuleIds: ['iso27001_dashboard', 'continuous_compliance']
  },
  {
    id: 'req_iso27001_audit_readiness',
    frameworkKey: 'ISO_27001',
    code: 'Audit Gates',
    title: 'Stage 1 vs 2 External Certification Audit Readiness Gate Verifier',
    description: 'Rigorous pre-audit stage 1 and stage 2 readiness criteria and sampling verifier.',
    associatedModuleIds: ['stage_gate_verifier']
  },
  {
    id: 'req_iso27001_improvement',
    frameworkKey: 'ISO_27001',
    code: 'Improvements',
    title: 'ISO Continual Improvement & 2022 Control Transition Hub',
    description: '11 new 2022 controls transition tracker and corrective action desk.',
    associatedModuleIds: ['iso_mas_improvements']
  },

  // --- ISO 42001 Granular Requirements ---
  {
    id: 'req_iso42001_dashboard',
    frameworkKey: 'ISO_42001',
    code: 'AIMS Center',
    title: 'AIMS Command Center & AI Executive Posture',
    description: 'Artificial Intelligence Management System leadership overview and posture scoring.',
    associatedModuleIds: ['iso42001_dashboard']
  },
  {
    id: 'req_iso42001_scoping',
    frameworkKey: 'ISO_42001',
    code: 'AI Inventory',
    title: 'AI System & Foundation Model Inventory & Scope Boundaries',
    description: 'LLM catalog, training pipelines, third-party model APIs, and risk classification.',
    associatedModuleIds: ['iso42001_scoping']
  },
  {
    id: 'req_iso42001_controls',
    frameworkKey: 'ISO_42001',
    code: '38 AI Controls',
    title: '38 AI Annex A Controls Testing Workbench',
    description: 'Data quality, model drift, algorithmic transparency, and human oversight safeguards.',
    associatedModuleIds: ['iso42001_workbench']
  },
  {
    id: 'req_iso42001_soa',
    frameworkKey: 'ISO_42001',
    code: 'AIMS SoA',
    title: 'Annex A.2–A.10 Statement of Applicability Generator',
    description: 'Automated generation of ISO 42001 Statement of Applicability with justifications.',
    associatedModuleIds: ['iso42001_soa']
  },
  {
    id: 'req_iso42001_reporting',
    frameworkKey: 'ISO_42001',
    code: 'Board Pack',
    title: 'AIMS Board Attestation & Audit Dossier Pack',
    description: 'Executive AI governance reporting and third-party auditor inspection packs.',
    associatedModuleIds: ['iso42001_reporting']
  },

  // --- MAS TRM Granular Requirements ---
  {
    id: 'req_mas_incident',
    frameworkKey: 'MAS_TRM',
    code: 'Notice 644',
    title: 'Notice 644 Statutory 1-Hour Incident Dispatcher & Form IT-01',
    description: 'Regulatory incident triage and 60-minute dispatch to MAS supervisory desks.',
    associatedModuleIds: ['mas_notice644_simulator', 'mas_incident_notification']
  },
  {
    id: 'req_mas_hygiene',
    frameworkKey: 'MAS_TRM',
    code: 'Notice 655',
    title: 'Notice 655 Binding Cyber Hygiene & Perimeter Defense',
    description: 'Zero-trust hardware MFA, administrative jump-hosts, and perimeter protection.',
    associatedModuleIds: ['mas_notice655_hygiene']
  },
  {
    id: 'req_mas_resilience',
    frameworkKey: 'MAS_TRM',
    code: 'Critical Systems',
    title: 'Critical Systems Register, RTO/RPO & Disaster Recovery (MTD ≤ 4h)',
    description: 'Tier 1 financial services availability metrics and annual DR failover drills.',
    associatedModuleIds: ['mas_critical_systems', 'mas_applicability', 'mas_discovery_scoping']
  },
  {
    id: 'req_mas_assessment',
    frameworkKey: 'MAS_TRM',
    code: '14 Domains',
    title: '14 TRM Risk Domains Workbench & Compliance Checklist (86 Reqs)',
    description: 'Monetary Authority of Singapore technology risk management controls evaluation.',
    associatedModuleIds: ['mas_dashboard', 'mas_compliance_flow', 'mas_trm_journey', 'mas_assessment_workbench', 'mas_checklist', 'mas_overview']
  },
  {
    id: 'req_mas_policies_crosswalk',
    frameworkKey: 'MAS_TRM',
    code: 'Policies & Crosswalk',
    title: 'Automated MAS Policy Generator, Circulars & Multi-Standard Crosswalk',
    description: 'Statutory circular tracking, automated policies, and 82% ISO cross-mapping reuse.',
    associatedModuleIds: ['mas_policy_generator', 'cross_framework_crosswalk', 'regulatory_sources', 'mas_reporting']
  },

  // --- DPDP Act Granular Requirements ---
  {
    id: 'req_dpdp_core',
    frameworkKey: 'DPDP',
    code: '44 Clauses',
    title: 'DPDP Compliance Hub & 44 Statutory Clauses Checklist',
    description: 'Sections 4–16 statutory compliance for Indian Data Fiduciaries.',
    associatedModuleIds: ['dpdp_compliance', 'dpdp_checklist']
  },
  {
    id: 'req_dpdp_data_governance',
    frameworkKey: 'DPDP',
    code: 'RoPA & Retention',
    title: 'Data Flow Mapping (RoPA), Retention & Scheduled Purge',
    description: 'Process mapping, retention limits, and automated cryptographic erasure.',
    associatedModuleIds: ['dpdp_data_flow', 'dpdp_retention', 'dpdp_erasure']
  },
  {
    id: 'req_dpdp_consent_rights',
    frameworkKey: 'DPDP',
    code: 'Consent & Rights',
    title: 'Consent Notices (22 Languages), Grievances & Children’s VPC',
    description: 'Multilingual consent management, 30-day SLA redressal, and Section 9 verification.',
    associatedModuleIds: ['dpdp_consent_grievance', 'dpdp_children']
  },
  {
    id: 'req_dpdp_transfers_breach',
    frameworkKey: 'DPDP',
    code: 'DPIA & Breach',
    title: 'Processor DPAs, Cross-Border Transfers, DPIA & 6h Breach Playbook',
    description: 'Third-party agreements, restricted jurisdictions, and CERT-In notification.',
    associatedModuleIds: ['dpdp_processors', 'dpdp_cross_border', 'dpdp_dpia', 'dpdp_breach_playbook']
  },
  {
    id: 'req_dpdp_training_pims',
    frameworkKey: 'DPDP',
    code: 'Training & PIMS',
    title: 'dpdpa.com Academy & ISO 27701 PIMS Privacy Statement of Applicability',
    description: 'Workforce competency certifications and ISO 27701 privacy extensions.',
    associatedModuleIds: ['dpdp_training_gap', 'dpdp_academy', 'iso27701_soa']
  },

  // --- BrandGuard Granular Requirements ---
  {
    id: 'req_brandguard_easm',
    frameworkKey: 'BRANDGUARD',
    code: 'EASM Discovery',
    title: 'External Attack Surface Discovery & Rogue Subdomain Scanner',
    description: 'Exposed cloud assets, open buckets, SSL/TLS expirations, and DNS hygiene.',
    associatedModuleIds: ['brandguard', 'attack_surface']
  },
  {
    id: 'req_brandguard_threat',
    frameworkKey: 'BRANDGUARD',
    code: 'Threat Intelligence',
    title: 'Threat Intel Desk, Zero-Hour IoCs & Dark Web Credential Leaks',
    description: 'Surveillance of underground forums, breach dumps, and compromised accounts.',
    associatedModuleIds: ['threat_intel', 'dark_web']
  },
  {
    id: 'req_brandguard_enforcement',
    frameworkKey: 'BRANDGUARD',
    code: 'Brand Defense',
    title: 'Visual Logo Abuse Monitoring (Computer Vision) & 4h SLA Takedown Desk',
    description: 'Phishing domain takedowns, trademark infringement, and WIPO UDRP filings.',
    associatedModuleIds: ['logo_monitoring', 'takedowns']
  },

  // --- SOC 2 Granular Requirements ---
  {
    id: 'req_soc2_assurance',
    frameworkKey: 'SOC_2',
    code: 'Trust Criteria',
    title: 'AICPA Trust Services Criteria (CC1–CC9) Gap Assessment & Evidence Center',
    description: 'Security, Availability, Confidentiality gap assessment and auditor sampling.',
    associatedModuleIds: ['gap_assessment', 'evidence_centre']
  },

  // --- ISO 22301 Granular Requirements ---
  {
    id: 'req_iso22301_bcms',
    frameworkKey: 'ISO_22301',
    code: 'BCMS Resilience',
    title: 'Business Impact Analysis (BIA) & Resilience Assessment',
    description: 'MTPD identification, RTO/RPO targets, and annual DR simulation drills.',
    associatedModuleIds: ['risk_assessment']
  }
];

export const FRAMEWORK_REQUIREMENTS_SPECS: FrameworkRequirementSpec[] = [
  {
    key: 'ISO_27001',
    code: 'ISO/IEC 27001:2022',
    shortTitle: 'ISO 27001:2022',
    name: 'Information Security Management System (ISMS)',
    badge: 'Primary ISMS',
    badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    description: 'The international standard for establishing, implementing, maintaining, and continually improving an Information Security Management System.',
    iconName: 'ShieldCheck',
    isPrimary: true,
    whatIsActuallyRequired: [
      'Clauses 4–10 ISMS governance alignment (Scope, Leadership, Planning, Support, Operation, Evaluation, Improvement)',
      'Mandatory Clause 4.2 Interested Parties & Statutory Obligations Matrix',
      '93 Annex A Information Security Controls (A.5 Organizational, A.6 People, A.7 Physical, A.8 Technological)',
      'Statement of Applicability (SoA) with inclusion/exclusion justifications & baseline cryptographic hash',
      'Stage 1 & Stage 2 external certification audit readiness & continuous post-certification monitoring'
    ],
    granularRequirements: GRANULAR_REQUIREMENTS.filter(r => r.frameworkKey === 'ISO_27001'),
    unlockedModules: [
      { id: 'iso27001_dashboard', label: 'ISMS Command Center' },
      { id: 'continuous_compliance', label: 'Continuous ISO Monitoring' },
      { id: 'stakeholder_obligations', label: 'Clause 4.2 Obligations Matrix' },
      { id: 'stage_gate_verifier', label: 'Stage 1 vs 2 Gate Verifier' },
      { id: 'iso_mas_improvements', label: 'ISO & MAS Improvement Hub' },
      { id: 'iso27001_workbench', label: '93 Annex A Workbench' },
      { id: 'iso27001_clauses', label: 'Clauses 4-10 Checklist' },
      { id: 'statement_of_applicability', label: 'Statement of Applicability (SoA) Hub' }
    ]
  },
  {
    key: 'ISO_42001',
    code: 'ISO/IEC 42001:2023',
    shortTitle: 'ISO 42001:2023',
    name: 'Artificial Intelligence Management System (AIMS)',
    badge: 'AI Governance',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    description: 'The pioneering international standard for responsible, ethical, transparent, and trustworthy artificial intelligence lifecycle management.',
    iconName: 'Sparkles',
    isPrimary: false,
    whatIsActuallyRequired: [
      'AI System & Foundation Model Inventory (LLMs, internal APIs, fine-tunes, prompt engineering)',
      'Algorithmic Impact Assessment (AIIA) and AI risk classification (fairness, bias, hallucination, explainability)',
      '38 AI Annex A Controls across Data Quality, Model Lifecycle, Human Oversight, and System Robustness',
      'Human-in-the-loop (HITL) fallback safeguards, override procedures, and automated circuit breakers',
      'AIMS Annex A.2–A.10 Statement of Applicability & Executive Board Attestation Pack'
    ],
    granularRequirements: GRANULAR_REQUIREMENTS.filter(r => r.frameworkKey === 'ISO_42001'),
    unlockedModules: [
      { id: 'iso42001_dashboard', label: 'AIMS Command Center' },
      { id: 'iso42001_soa', label: 'Annex A.2–A.10 SoA Generator' },
      { id: 'iso42001_workbench', label: '38 AI Controls Workbench' },
      { id: 'iso42001_scoping', label: 'AI Inventory & Scope' },
      { id: 'iso42001_reporting', label: 'AIMS Board Pack & SoA' }
    ]
  },
  {
    key: 'MAS_TRM',
    code: 'MAS TRM 2021',
    shortTitle: 'MAS TRM',
    name: 'Monetary Authority of Singapore (MAS) TRM Guidelines & Notices',
    badge: 'Singapore Financial Mandate',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    description: 'Legally binding regulatory guidelines and notices issued by MAS for financial institutions, payment providers, and fintechs.',
    iconName: 'Building2',
    isPrimary: false,
    whatIsActuallyRequired: [
      'Notice 644 statutory 1-hour incident notification protocol (dispatching Form IT-01 to MAS supervisors within 60 minutes)',
      'Critical System Maximum Tolerable Downtime (MTD) under 4 hours, and unscheduled downtime under 4 hours/year',
      'Notice 655 binding Cyber Hygiene mandates (MFA on all administrative consoles, perimeter defense, malware protection)',
      '14/15 TRM Risk Domains assessment workbench covering 86 specific regulatory requirements',
      'Annual board attestation pack, disaster recovery failover drill reports, and MAS circular tracking'
    ],
    granularRequirements: GRANULAR_REQUIREMENTS.filter(r => r.frameworkKey === 'MAS_TRM'),
    unlockedModules: [
      { id: 'mas_dashboard', label: 'MAS Command Center' },
      { id: 'mas_regulatory_intelligence', label: 'MAS Live Regulatory Intelligence' },
      { id: 'mas_notice644_simulator', label: 'Notice 644 Historical' },
      { id: 'mas_notice655_hygiene', label: 'Notice 655 Historical' },
      { id: 'mas_critical_systems', label: 'Critical Systems & RTO/RPO' },
      { id: 'mas_incident_notification', label: 'Incident Triage & Form IT-01' },
      { id: 'mas_checklist', label: 'Compliance Checklist' },
      { id: 'mas_overview', label: '15 TRM Domains & Source' },
      { id: 'mas_applicability', label: 'Scoping & Critical Systems' },
      { id: 'mas_assessment_workbench', label: 'Control Testing Workbench' },
      { id: 'mas_policy_generator', label: 'Automated Policy Generator' },
      { id: 'cross_framework_crosswalk', label: 'Multi-Standard Crosswalk' },
      { id: 'regulatory_sources', label: 'MAS Circulars & Sources' },
      { id: 'mas_reporting', label: 'MAS Gap & Board Pack' }
    ]
  },
  {
    key: 'DPDP',
    code: 'DPDP Act 2023',
    shortTitle: 'DPDP Act & ISO 27701',
    name: 'Digital Personal Data Protection Act (India) & ISO 27701 PIMS',
    badge: 'Data Privacy',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    description: 'Statutory compliance for Data Fiduciaries processing Indian residents’ digital personal data, combined with ISO 27701 PIMS.',
    iconName: 'Scale',
    isPrimary: false,
    whatIsActuallyRequired: [
      '44 DPDP Clauses Audit Checklist covering Sections 4 to 16 of the DPDP Act 2023',
      'Itemized plain-language consent notices with translation in English and 22 Indian scheduled languages',
      'Data Flow Mapping and Record of Processing Activities (RoPA) across business processes & systems',
      'Section 9 Children’s Data protection and verifiable parental consent (VPC) mechanisms',
      '6-hour statutory CERT-In / DPB data breach notification protocol and Grievance Redressal SLA',
      'ISO 27701 Privacy Information Management System (PIMS) Annex A/B Statement of Applicability'
    ],
    granularRequirements: GRANULAR_REQUIREMENTS.filter(r => r.frameworkKey === 'DPDP'),
    unlockedModules: [
      { id: 'dpdp_compliance', label: 'DPDP Compliance Hub' },
      { id: 'dpdp_training_gap', label: 'Training Gap Analyzer' },
      { id: 'dpdp_academy', label: 'dpdpa.com Training & Cert' },
      { id: 'dpdp_data_flow', label: 'Data Flow Mapping & RoPA' },
      { id: 'dpdp_retention', label: 'Retention & Purge Manager' },
      { id: 'dpdp_checklist', label: '44 Clauses Checklist' },
      { id: 'dpdp_consent_grievance', label: 'Consent & Grievance SLA' },
      { id: 'dpdp_children', label: 'Children Data & VPC' },
      { id: 'dpdp_erasure', label: 'Erasure & Legal Hold' },
      { id: 'dpdp_processors', label: 'Processor DPAs & Vendors' },
      { id: 'dpdp_cross_border', label: 'Cross-Border Transfers' },
      { id: 'dpdp_dpia', label: 'DPDP DPIA Template' },
      { id: 'dpdp_breach_playbook', label: '6-Hour Breach Playbook' },
      { id: 'iso27701_soa', label: 'ISO 27701 PIMS SoA & Dossier' }
    ]
  },
  {
    key: 'BRANDGUARD',
    code: 'BrandGuard EASM & Threat Intel',
    shortTitle: 'EASM & Threat Intel',
    name: 'External Attack Surface Management & Threat Intelligence',
    badge: 'Cyber Threat Intel',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    description: 'Continuous monitoring of external attack surfaces, rogue subdomains, leaked dark web credentials, brand abuse, and threat indicators.',
    iconName: 'Globe2',
    isPrimary: false,
    whatIsActuallyRequired: [
      'Automated external attack surface discovery (unmonitored subdomains, open cloud buckets, TLS expiry)',
      'Dark web monitoring & credential leak detection matching corporate domains',
      'Visual logo & trademark brand abuse scanning via Computer Vision AI',
      '4-Hour SLA for phishing domain and trademark takedown desk (WIPO UDRP)'
    ],
    granularRequirements: GRANULAR_REQUIREMENTS.filter(r => r.frameworkKey === 'BRANDGUARD'),
    unlockedModules: [
      { id: 'brandguard', label: 'BrandGuard Command Center' },
      { id: 'attack_surface', label: 'Attack Surface (EASM)' },
      { id: 'threat_intel', label: 'Threat Intel & IoC Desk' },
      { id: 'dark_web', label: 'Dark Web & Credential Leaks' },
      { id: 'logo_monitoring', label: 'Visual Logo & Brand Abuse' },
      { id: 'takedowns', label: 'Takedowns & WIPO Desk' }
    ]
  },
  {
    key: 'SOC_2',
    code: 'SOC 2 Type II',
    shortTitle: 'SOC 2 Type II',
    name: 'AICPA Trust Services Criteria (Security, Availability, Confidentiality)',
    badge: 'Cloud Assurance',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    description: 'Independent audit framework assessing cloud controls across Security, Availability, Processing Integrity, Confidentiality, and Privacy.',
    iconName: 'Layers',
    isPrimary: false,
    whatIsActuallyRequired: [
      'Trust Services Criteria baseline mapping across Common Criteria (CC1 to CC9)',
      'Continuous control evidence collection and automated audit sample exports',
      'Auditor-ready working paper dossier for 6 to 12 month observation period'
    ],
    granularRequirements: GRANULAR_REQUIREMENTS.filter(r => r.frameworkKey === 'SOC_2'),
    unlockedModules: [
      { id: 'gap_assessment', label: 'SOC 2 Gap Assessment' },
      { id: 'evidence_centre', label: 'Trust Criteria Evidence Center' }
    ]
  },
  {
    key: 'ISO_22301',
    code: 'ISO 22301:2019',
    shortTitle: 'ISO 22301 (BCMS)',
    name: 'Business Continuity Management System (BCMS)',
    badge: 'Resilience',
    badgeColor: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    description: 'Requirements for planning, establishing, implementing, operating, monitoring, reviewing, maintaining, and continually improving a documented management system to protect against disruptive incidents.',
    iconName: 'Milestone',
    isPrimary: false,
    whatIsActuallyRequired: [
      'Business Impact Analysis (BIA) identifying Maximum Tolerable Period of Disruption (MTPD)',
      'Disaster Recovery (DR) plans and Recovery Time Objectives (RTO) / Recovery Point Objectives (RPO)',
      'Annual disaster recovery simulation drill execution logs'
    ],
    granularRequirements: GRANULAR_REQUIREMENTS.filter(r => r.frameworkKey === 'ISO_22301'),
    unlockedModules: [
      { id: 'risk_assessment', label: 'BIA & Resilience Assessment' }
    ]
  }
];

export interface FrameworkFilterOptions {
  selectedFrameworks?: string[];
  selectedRequirements?: string[];
  selectedFrameworkRequirements?: string[];
  customIncludedModules?: string[];
  customExcludedModules?: string[];
}

export type FrameworkInput =
  | string[]
  | FrameworkFilterOptions
  | {
      selectedFrameworks?: string[];
      selectedFrameworkRequirements?: string[];
      [key: string]: any;
    }
  | null
  | undefined;

/**
 * Checks if a framework key is selected within the tenant's selectedFrameworks array.
 */
export function isFrameworkSelected(
  key: SupportedFrameworkKey,
  selectedFrameworks?: string[]
): boolean {
  if (!selectedFrameworks || selectedFrameworks.length === 0) {
    // Default fallback: if no framework specified at all, enable ISO 27001 by default
    return key === 'ISO_27001';
  }

  const normalized = selectedFrameworks.map(f => f.toLowerCase().trim());

  switch (key) {
    case 'ISO_27001':
      return normalized.some(
        f =>
          f.includes('27001') ||
          f.includes('isms') ||
          f === 'iso_27001'
      );

    case 'ISO_42001':
      return normalized.some(
        f =>
          f.includes('42001') ||
          f.includes('aims') ||
          f.includes('artificial') ||
          f === 'iso_42001'
      );

    case 'MAS_TRM':
      return normalized.some(
        f =>
          f.includes('mas') ||
          f.includes('trm') ||
          f.includes('singapore') ||
          f === 'mas_trm'
      );

    case 'DPDP':
      return normalized.some(
        f =>
          f.includes('dpdp') ||
          f.includes('27701') ||
          f.includes('privacy') ||
          f.includes('pims') ||
          f === 'dpdp'
      );

    case 'BRANDGUARD':
      return normalized.some(
        f =>
          f.includes('brandguard') ||
          f.includes('attack') ||
          f.includes('threat') ||
          f.includes('dark web') ||
          f.includes('easm') ||
          f === 'brandguard'
      );

    case 'SOC_2':
      return normalized.some(
        f =>
          f.includes('soc 2') ||
          f.includes('soc2') ||
          f.includes('trust services') ||
          f === 'soc_2'
      );

    case 'ISO_22301':
      return normalized.some(
        f =>
          f.includes('22301') ||
          f.includes('bcms') ||
          f.includes('continuity') ||
          f === 'iso_22301'
      );

    default:
      return false;
  }
}

/**
 * Category-level visibility check based on active frameworks.
 */
export function isCategoryAllowed(
  categoryId: string,
  frameworksOrConfig?: FrameworkInput,
  optionalRequirements?: string[]
): boolean {
  let selectedFrameworks: string[] | undefined;

  if (Array.isArray(frameworksOrConfig)) {
    selectedFrameworks = frameworksOrConfig;
  } else if (frameworksOrConfig && typeof frameworksOrConfig === 'object') {
    selectedFrameworks = (frameworksOrConfig as any).selectedFrameworks;
  }

  // Universal core categories always visible:
  const universalCategories = [
    'home',
    'my_work',
    'governance',
    'compliance',
    'risk',
    'controls_evidence',
    'audit',
    'assets_third_parties',
    'reports_insights',
    'skanda_intelligence',
    'settings',
    'discover',
    'assess',
    'standards_hub_group',
    'implement',
    'assure',
    'insights',
    'live_telemetry',
    'connect'
  ];

  if (universalCategories.includes(categoryId)) {
    return true;
  }

  // Framework-gated categories:
  if (categoryId === 'iso27001_isms') {
    return isFrameworkSelected('ISO_27001', selectedFrameworks);
  }

  if (categoryId === 'iso42001_aims') {
    return isFrameworkSelected('ISO_42001', selectedFrameworks);
  }

  if (categoryId === 'mas_trm') {
    return isFrameworkSelected('MAS_TRM', selectedFrameworks);
  }

  if (categoryId === 'dpdp_act') {
    return isFrameworkSelected('DPDP', selectedFrameworks);
  }

  if (categoryId === 'brandguard_group') {
    return isFrameworkSelected('BRANDGUARD', selectedFrameworks);
  }

  return true;
}

/**
 * Module-level visibility check based on active frameworks and specific requirements.
 * Dynamically filters modules so only features matching the organization's requirements
 * (e.g. ISO 27001, ISO 42001, MAS TRM) are rendered in the sidebar navigation.
 */
export function isModuleAllowed(
  moduleId: string,
  frameworksOrConfig?: FrameworkInput,
  optionalRequirements?: string[]
): boolean {
  // Extract inputs safely
  let selectedFrameworks: string[] | undefined;
  let selectedRequirements: string[] | undefined = optionalRequirements;
  let customIncludedModules: string[] | undefined;
  let customExcludedModules: string[] | undefined;

  if (Array.isArray(frameworksOrConfig)) {
    selectedFrameworks = frameworksOrConfig;
  } else if (frameworksOrConfig && typeof frameworksOrConfig === 'object') {
    selectedFrameworks = (frameworksOrConfig as any).selectedFrameworks;
    selectedRequirements =
      optionalRequirements ||
      (frameworksOrConfig as any).selectedRequirements ||
      (frameworksOrConfig as any).selectedFrameworkRequirements;
    customIncludedModules = (frameworksOrConfig as any).customIncludedModules;
    customExcludedModules = (frameworksOrConfig as any).customExcludedModules;
  }

  // 1. Explicit Custom Overrides
  if (customIncludedModules && customIncludedModules.includes(moduleId)) {
    return true;
  }
  if (customExcludedModules && customExcludedModules.includes(moduleId)) {
    return false;
  }

  // 2. Active Framework Flags
  const isIso27001Active = isFrameworkSelected('ISO_27001', selectedFrameworks);
  const isIso42001Active = isFrameworkSelected('ISO_42001', selectedFrameworks);
  const isMasTrmActive = isFrameworkSelected('MAS_TRM', selectedFrameworks);
  const isDpdpActive = isFrameworkSelected('DPDP', selectedFrameworks);
  const isBrandguardActive = isFrameworkSelected('BRANDGUARD', selectedFrameworks);
  const isSoc2Active = isFrameworkSelected('SOC_2', selectedFrameworks);
  const isIso22301Active = isFrameworkSelected('ISO_22301', selectedFrameworks);

  // 3. Framework-Exclusive Modules
  // ISO 27001 ISMS specific modules:
  const iso27001Modules = [
    'iso27001',
    'iso27001_dashboard',
    'implementation_journey',
    'discovery_questionnaire',
    'department_surveys',
    'compliance_profile',
    'implementation_plan',
    'stakeholder_obligations',
    'iso27001_workbench',
    'iso27001_controls',
    'iso27001_clauses',
    'statement_of_applicability',
    'soa',
    'soa_matrix',
    'continuous_compliance'
  ];

  if (iso27001Modules.includes(moduleId)) {
    if (!isIso27001Active) return false;
  }

  // ISO 42001 AIMS specific modules:
  const iso42001Modules = [
    'iso42001',
    'iso42001_dashboard',
    'iso42001_soa',
    'iso42001_workbench',
    'iso42001_scoping',
    'iso42001_reporting',
    'iso42001_soa_generator'
  ];

  if (iso42001Modules.includes(moduleId)) {
    if (!isIso42001Active) return false;
  }

  // MAS TRM specific modules:
  const masTrmModules = [
    'mas_trm',
    'mas_compliance_flow',
    'mas_flow_dashboard',
    'mas_trm_journey',
    'mas_implementation_journey',
    'mas_discovery_scoping',
    'mas_dashboard',
    'mas_classic_dashboard',
    'mas_regulatory_intelligence',
    'mas_live_regulatory_intelligence',
    'mas_notice644_simulator',
    'mas_notice655_hygiene',
    'mas_critical_systems',
    'cis_downtime_ledger',
    'mas_incident_notification',
    'mas_compliance_workflow',
    'mas_workflow',
    'form_it01_dispatcher',
    'mas_sla_watchdog',
    'mas_gap_analysis',
    'compliance_gap_visualization',
    'mas_supervisory_dossier',
    'supervisory_dossier',
    'mas_checklist',
    'mas_compliance_checklist',
    'mas_overview',
    'mas_applicability',
    'mas_assessment_workbench',
    'mas_policy_generator',
    'regulatory_sources',
    'mas_reporting',
    'feat_genai_sentinel',
    'mas_feat_sentinel',
    'shadow_ai_telemetry',
    'cross_regulatory_crosswalk',
    'pqc_crypto_migration',
    'post_quantum_crypto',
    'quantum_readiness',
    'cyber_crisis_war_room',
    'board_risk_appetite',
    'auditor_3lod_portal',
    'immutable_evidence_manifest',
    'mas_immutable_manifest',
    'mas_brc_reporting_deck'
  ];

  if (masTrmModules.includes(moduleId)) {
    if (!isMasTrmActive) return false;
  }

  // DPDP specific modules:
  const dpdpModules = [
    'dpdp',
    'dpdp_act',
    'dpdp_compliance',
    'dpdp_training_gap',
    'dpdp_academy',
    'dpdp_data_flow',
    'dpdp_retention',
    'dpdp_checklist',
    'dpdp_consent_grievance',
    'dpdp_children',
    'dpdp_erasure',
    'dpdp_processors',
    'dpdp_cross_border',
    'dpdp_dpia',
    'dpdp_breach_playbook'
  ];

  if (dpdpModules.includes(moduleId)) {
    if (!isDpdpActive) return false;
  }

  // BrandGuard specific modules:
  const brandguardModules = [
    'brandguard',
    'brandguard_dashboard',
    'brand_protection',
    'attack_surface',
    'easm',
    'easm_takeover',
    'threat_intel',
    'threat_intelligence',
    'zero_hour_ioc',
    'dark_web',
    'dark_web_monitoring',
    'credential_leaks',
    'logo_monitoring',
    'brand_abuse',
    'takedowns',
    'takedown_sla'
  ];

  if (brandguardModules.includes(moduleId)) {
    if (!isBrandguardActive) return false;
  }

  // 4. Shared & Cross-Cutting Modules
  if (moduleId === 'stage_gate_verifier') {
    if (!isIso27001Active && !isIso42001Active && !isIso22301Active) return false;
  }

  if (moduleId === 'iso_mas_improvements') {
    if (!isIso27001Active && !isMasTrmActive) return false;
  }

  if (moduleId === 'iso27701_soa') {
    if (!isDpdpActive && !isIso27001Active) return false;
  }

  if (moduleId === 'cross_framework_crosswalk') {
    // Crosswalk is useful when MAS TRM is selected or at least 2 frameworks are active
    const activeFrameworksCount = [
      isIso27001Active,
      isIso42001Active,
      isMasTrmActive,
      isDpdpActive,
      isBrandguardActive,
      isSoc2Active,
      isIso22301Active
    ].filter(Boolean).length;

    if (!isMasTrmActive && activeFrameworksCount < 2) return false;
  }

  if (moduleId === 'audit_sampling_calculator') {
    if (!isIso27001Active && !isIso42001Active && !isIso22301Active) return false;
  }

  // 5. Granular Specific Requirement Check (if user specified itemized requirements)
  if (selectedRequirements && selectedRequirements.length > 0) {
    const mappedRequirements = GRANULAR_REQUIREMENTS.filter(req =>
      req.associatedModuleIds.includes(moduleId)
    );

    if (mappedRequirements.length > 0) {
      // Find requirements that belong to any currently active framework
      const activeFrameworkReqs = mappedRequirements.filter(req =>
        isFrameworkSelected(req.frameworkKey, selectedFrameworks)
      );

      if (activeFrameworkReqs.length > 0) {
        // If the module belongs to active framework requirements, check if user included at least one
        const isSelected = activeFrameworkReqs.some(req =>
          selectedRequirements!.some(
            sr =>
              sr.toLowerCase() === req.id.toLowerCase() ||
              sr.toLowerCase() === req.code.toLowerCase() ||
              sr.toLowerCase().includes(req.id.toLowerCase()) ||
              req.id.toLowerCase().includes(sr.toLowerCase())
          )
        );

        if (!isSelected) {
          return false;
        }
      }
    }
  }

  // All other foundational modules (business discovery, asset register, policies, tasks, settings, etc.) are allowed
  return true;
}
