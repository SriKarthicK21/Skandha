// Extended Master Data for ISO/IEC 42001:2023 Artificial Intelligence Management System (AIMS)
// Includes complete 38 Annex A Controls (A.2 to A.10) with ISO 27001:2022 Crosswalks,
// Pre-seeded AI-SIA Impact Assessments, and Third-Party AI Supplier Due Diligence Register.

export interface ISO42001SoAControl {
  controlCode: string; // e.g. "A.2.1"
  domainCode: 'A.2' | 'A.3' | 'A.4' | 'A.5' | 'A.6' | 'A.7' | 'A.8' | 'A.9' | 'A.10';
  domainTitle: string;
  title: string;
  description: string;
  standardGuidance: string;
  applicable: boolean;
  inclusionJustification: string;
  exclusionJustification?: string;
  implementationStatus: 'Implemented' | 'In Progress' | 'Planned' | 'Audited & Verified' | 'Not Applicable';
  maturityLevel: 1 | 2 | 3 | 4 | 5;
  responsibleDepartment: string;
  iso27001Crosswalk: {
    controlCode: string; // e.g. "A.5.1"
    controlTitle: string;
    relationshipType: 'EXACT_EQUIVALENT' | 'SUPERSET' | 'SUBSET' | 'RELATED_OVERLAP';
    confidenceScore: number;
    auditGuidance: string;
  };
  euAiActCrosswalk?: string;
  masFeatCrosswalk?: string;
  evidenceRequirements: string[];
}

export interface AISIAAssessmentRecord {
  id: string;
  systemId: string;
  systemName: string;
  assessorName: string;
  assessorTitle: string;
  assessmentDate: string;
  reviewCadence: 'Quarterly' | 'Bi-Annual' | 'Annual';
  version: string;
  intendedDomain: string;
  deploymentContext: string;
  autonomyLevel: 'HUMAN_IN_THE_LOOP' | 'HUMAN_ON_THE_LOOP' | 'FULLY_AUTONOMOUS';
  targetStakeholders: string[];
  
  // Dimensions 1-5 rating
  individualRights: {
    adverseOutcomeSeverity: number; // 1-5
    discriminationBiasPotential: number; // 1-5
    privacyIntrusionLevel: number; // 1-5
    explainabilityBarrier: number; // 1-5
    notes: string;
  };
  societalImpact: {
    criticalInfrastructureReliance: number; // 1-5
    disinformationHallucinationRisk: number; // 1-5
    environmentalCarbonFootprint: number; // 1-5
    vulnerablePopulationExposure: number; // 1-5
    notes: string;
  };
  organizationalRisk: {
    regulatoryNonComplianceExposure: number; // 1-5
    intellectualPropertyInfringement: number; // 1-5
    reputationalDamagePotential: number; // 1-5
    modelDriftOperationalInstability: number; // 1-5
    notes: string;
  };

  // Mitigation controls
  appliedMitigations: string[];
  mitigationEffectiveness: number; // percentage reduction (e.g. 40%)

  // Derived scores
  inherentImpactScore: number; // 0-100
  residualImpactScore: number; // 0-100
  derivedRiskTier: 'CRITICAL_UNACCEPTABLE' | 'HIGH_RISK' | 'MEDIUM_RISK' | 'LOW_EXEMPT';
  mandatoryControls: string[];
  
  // Approval
  approvalStatus: 'APPROVED' | 'CONDITIONALLY_APPROVED' | 'UNDER_REVIEW' | 'REJECTED';
  approverComments: string;
  approvedBy?: string;
  approvalDate?: string;
  cryptographicDigest?: string;
}

export interface AISupplierCheckItem {
  id: string;
  name: string;
  description: string;
  status: 'PASS' | 'FLAGGED' | 'FAIL' | 'NOT_APPLICABLE';
  evidenceCitation: string;
  verifiedAt: string;
  notes: string;
}

export interface AISupplierDueDiligenceRecord {
  id: string;
  supplierName: string;
  serviceName: string;
  category: 'Foundation Model API' | 'Cloud AI Platform' | 'Vector DB / Embedding' | 'Open Source Model Vendor';
  modelFamiliesUsed: string[];
  businessOwner: string;
  contactEmail: string;
  contractRenewalDate: string;
  riskRating: 'APPROVED_FOR_PRODUCTION' | 'RESTRICTED_PILOT_ONLY' | 'HIGH_RISK_SUSPENDED';
  
  // Specific critical checks
  zeroDataRetention: boolean;
  trainingExemptionGuaranteed: boolean;
  outputOwnershipConfirmed: boolean;
  ipIndemnificationProvided: boolean;
  dataResidencyOption: string; // e.g. "EU Data Boundary", "Singapore Local Region"
  availabilitySla: string; // e.g. "99.95%"
  p95LatencyGuarantee: string; // e.g. "< 350ms"
  soc2Type2Verified: boolean;
  iso27001Certified: boolean;
  iso42001Compliant: boolean;
  
  checkItems: AISupplierCheckItem[];
  dpaSignedDate: string;
  dpaDocumentRef: string;
  overallScore: number; // 0-100
  lastAuditDate: string;
  nextAuditDueDate: string;
}

// Full 38 Annex A Controls for ISO/IEC 42001:2023
export const FULL_ISO42001_SOA_CONTROLS: ISO42001SoAControl[] = [
  // A.2 Policies related to AI (2 controls)
  {
    controlCode: 'A.2.1',
    domainCode: 'A.2',
    domainTitle: 'AI Policies',
    title: 'AI Policy',
    description: 'The organization shall define and maintain an AI policy that is appropriate to the purpose of the organization and provides a framework for setting AI objectives.',
    standardGuidance: 'Establish an enterprise Responsible AI Policy covering transparency, fairness, safety, accountability, and human oversight with executive sign-off.',
    applicable: true,
    inclusionJustification: 'Mandatory foundational policy establishing organizational AI governance, ethical boundaries, and risk appetite.',
    implementationStatus: 'Implemented',
    maturityLevel: 4,
    responsibleDepartment: 'Information Security & Compliance',
    iso27001Crosswalk: {
      controlCode: 'A.5.1',
      controlTitle: 'Policies for information security',
      relationshipType: 'SUPERSET',
      confidenceScore: 95,
      auditGuidance: 'ISO 42001 AI policy supplements ISO 27001 A.5.1 with specific ethical constraints, algorithmic fairness principles, and model lifecycle oversight.'
    },
    euAiActCrosswalk: 'Art. 9 (Risk management system) & Art. 14 (Human oversight)',
    masFeatCrosswalk: 'Principle 3: Accountability & Governance',
    evidenceRequirements: ['Approved Responsible AI Policy v1.0', 'C-Level Steering Committee Minutes', 'Workforce AI Policy Acknowledgement Log']
  },
  {
    controlCode: 'A.2.2',
    domainCode: 'A.2',
    domainTitle: 'AI Policies',
    title: 'Alignment with other organizational policies',
    description: 'The organization shall ensure that the AI policy is aligned and integrated with existing organizational policies, including information security, privacy, and risk management.',
    standardGuidance: 'Harmonize AI policy clauses with ISMS (ISO 27001), Data Protection (GDPR/PDPA), and Enterprise Risk Management frameworks.',
    applicable: true,
    inclusionJustification: 'Prevents governance silos between machine learning engineering, IT cybersecurity, and legal compliance.',
    implementationStatus: 'Implemented',
    maturityLevel: 4,
    responsibleDepartment: 'Legal & Regulatory Affairs',
    iso27001Crosswalk: {
      controlCode: 'A.5.36',
      controlTitle: 'Compliance with policies and standards for information security',
      relationshipType: 'EXACT_EQUIVALENT',
      confidenceScore: 92,
      auditGuidance: 'Auditors verify that AI policies are referenced inside the overarching ISMS policy architecture without contradictory mandates.'
    },
    euAiActCrosswalk: 'Art. 9.1 (Integration into general risk management)',
    masFeatCrosswalk: 'Principle 3: Comprehensive Policy Integration',
    evidenceRequirements: ['Policy Interoperability Matrix', 'Joint ISMS/AIMS Charter', 'Annual Policy Harmonization Review']
  },

  // A.3 Internal organization (2 controls)
  {
    controlCode: 'A.3.1',
    domainCode: 'A.3',
    domainTitle: 'Internal Organization',
    title: 'AI roles and responsibilities',
    description: 'Roles and responsibilities for the AI management system and AI system life cycle shall be defined, documented, and allocated according to the organization needs.',
    standardGuidance: 'Establish dedicated roles including AI System Owner, Lead ML Engineer, Data Steward, AI Ethics Officer, and AI Risk Assessor.',
    applicable: true,
    inclusionJustification: 'Ensures clear accountability and segregation of duties across AI conception, training, deployment, and monitoring.',
    implementationStatus: 'Implemented',
    maturityLevel: 4,
    responsibleDepartment: 'Human Resources & People Ops',
    iso27001Crosswalk: {
      controlCode: 'A.5.2',
      controlTitle: 'Information security roles and responsibilities',
      relationshipType: 'RELATED_OVERLAP',
      confidenceScore: 94,
      auditGuidance: 'Extends ISO 27001 security roles to include specialized AI engineering, algorithmic bias review, and model oversight duties.'
    },
    euAiActCrosswalk: 'Art. 14.4 (Designated human overseers competence)',
    masFeatCrosswalk: 'Principle 3.1: Designated AI Accountability Owners',
    evidenceRequirements: ['AIMS RACI Matrix', 'Job Descriptions with AI Governance Duties', 'AI Ethics Board Terms of Reference']
  },
  {
    controlCode: 'A.3.2',
    domainCode: 'A.3',
    domainTitle: 'Internal Organization',
    title: 'Reporting of concerns and AI safety incidents',
    description: 'A process shall be established for internal personnel and external parties to report concerns, unintended behaviors, biases, or safety incidents related to AI systems.',
    standardGuidance: 'Deploy a dedicated AI Whistleblower portal and integrate incident classification into the existing security operations ticketing queue.',
    applicable: true,
    inclusionJustification: 'Enables rapid identification and containment of hallucination, data leakage, demographic bias, or prompt injection exploits.',
    implementationStatus: 'Implemented',
    maturityLevel: 3,
    responsibleDepartment: 'Information Security & Compliance',
    iso27001Crosswalk: {
      controlCode: 'A.6.8',
      controlTitle: 'Information security event reporting',
      relationshipType: 'SUPERSET',
      confidenceScore: 90,
      auditGuidance: 'Expands security event reporting queues to capture AI-specific incidents (hallucination spikes, model drift, disparate impact complaints).'
    },
    euAiActCrosswalk: 'Art. 73 (Reporting of serious incidents and malfunctioning)',
    masFeatCrosswalk: 'Principle 4: Transparency & Recourse Channels',
    evidenceRequirements: ['AI Incident Reporting Channel SOP', 'Anonymous AI Safety Portal URL', 'Quarterly AI Concern Triage Log']
  },

  // A.4 Resources for AI systems (4 controls)
  {
    controlCode: 'A.4.1',
    domainCode: 'A.4',
    domainTitle: 'AI Resources',
    title: 'AI system computing resources & infrastructure',
    description: 'The organization shall determine and provide the necessary computing resources, infrastructure, specialized hardware (GPUs/TPUs), and tooling for the operation of AI systems.',
    standardGuidance: 'Maintain inventory of GPU clusters, cloud AI services (AWS Bedrock, Azure OpenAI, GCP Vertex AI), and data pipeline compute capacity.',
    applicable: true,
    inclusionJustification: 'Ensures computational stability, cost predictability, and uptime availability of machine learning training and inference pipelines.',
    implementationStatus: 'Implemented',
    maturityLevel: 4,
    responsibleDepartment: 'Software Engineering & DevOps',
    iso27001Crosswalk: {
      controlCode: 'A.8.6',
      controlTitle: 'Capacity management',
      relationshipType: 'EXACT_EQUIVALENT',
      confidenceScore: 89,
      auditGuidance: 'Directly aligns with ISO 27001 capacity planning; measures GPU compute thresholds, token rate limits, and API throughput.'
    },
    euAiActCrosswalk: 'Art. 15 (Accuracy, robustness and cybersecurity)',
    masFeatCrosswalk: 'Operational Resiliency Guidance',
    evidenceRequirements: ['AI Compute & Cloud GPU Inventory', 'Compute Capacity & Auto-Scaling Benchmark', 'Cloud Cost & Resource Allocation Ledger']
  },
  {
    controlCode: 'A.4.2',
    domainCode: 'A.4',
    domainTitle: 'AI Resources',
    title: 'Competence of AI personnel',
    description: 'The organization shall ensure that personnel involved in developing, deploying, or operating AI systems possess necessary education, training, and technical competence.',
    standardGuidance: 'Conduct mandatory training on Prompt Engineering safety, ethical AI, bias evaluation tools (Fairlearn, SHAP), and OWASP Top 10 for LLMs.',
    applicable: true,
    inclusionJustification: 'Prevents dangerous or flawed AI implementations caused by skill deficiencies in data science or engineering staff.',
    implementationStatus: 'Implemented',
    maturityLevel: 4,
    responsibleDepartment: 'Human Resources & People Ops',
    iso27001Crosswalk: {
      controlCode: 'A.6.3',
      controlTitle: 'Information security awareness, education and training',
      relationshipType: 'SUPERSET',
      confidenceScore: 93,
      auditGuidance: 'Supplement generic security awareness with mandatory technical modules on AI prompt security, adversarial evasion, and training data privacy.'
    },
    euAiActCrosswalk: 'Art. 4 (AI literacy requirement for deployers)',
    masFeatCrosswalk: 'Principle 3.3: Staff Training and Competence',
    evidenceRequirements: ['AI Safety Curriculum Syllabus', 'Data Science Team Certification Records', 'Annual LLM Security Assessment Roster']
  },
  {
    controlCode: 'A.4.3',
    domainCode: 'A.4',
    domainTitle: 'AI Resources',
    title: 'Data resources management',
    description: 'The organization shall identify, allocate, and govern the specialized data repositories, vector stores, and feature stores required for AI development.',
    standardGuidance: 'Catalog all feature stores (Feast, Hopsworks) and vector databases (Pinecone, pgvector) with access control and encryption.',
    applicable: true,
    inclusionJustification: 'Guarantees integrity, segregation, and reliable access to high-dimensional embeddings and feature sets.',
    implementationStatus: 'Implemented',
    maturityLevel: 3,
    responsibleDepartment: 'Data Science & AI Engineering',
    iso27001Crosswalk: {
      controlCode: 'A.5.12',
      controlTitle: 'Classification of information',
      relationshipType: 'RELATED_OVERLAP',
      confidenceScore: 91,
      auditGuidance: 'Apply ISO 27001 data classification schemas directly to vector embeddings and feature tables.'
    },
    euAiActCrosswalk: 'Art. 10.2 (Data governance practices)',
    masFeatCrosswalk: 'Data Governance Guidelines',
    evidenceRequirements: ['Vector Database Topology Map', 'Feature Store Access Control List', 'Data Encryption at Rest Proof']
  },
  {
    controlCode: 'A.4.4',
    domainCode: 'A.4',
    domainTitle: 'AI Resources',
    title: 'Tooling and environments for AI development',
    description: 'Development environments, MLOps platforms, notebook servers, and CI/CD pipelines shall be hardened and isolated from production data.',
    standardGuidance: 'Enforce containerized JupyterLab environments, secret scanning, and automated dependency vulnerability checks in MLOps code.',
    applicable: true,
    inclusionJustification: 'Prevents development notebook compromise, poisoned open-source model weights, and credential theft.',
    implementationStatus: 'Implemented',
    maturityLevel: 4,
    responsibleDepartment: 'Software Engineering & DevOps',
    iso27001Crosswalk: {
      controlCode: 'A.8.31',
      controlTitle: 'Separation of development, test and production environments',
      relationshipType: 'EXACT_EQUIVALENT',
      confidenceScore: 96,
      auditGuidance: 'Enforce strict network isolation between experimental Jupyter notebooks and live customer-facing inference clusters.'
    },
    euAiActCrosswalk: 'Art. 15.1 (Cybersecurity of AI environments)',
    masFeatCrosswalk: 'Systems Reliability Standards',
    evidenceRequirements: ['MLOps Pipeline Security Config', 'Dependency Vulnerability Scan Report', 'Jupyter Environment Hardening Baseline']
  },

  // A.5 Assessing impacts of AI systems (3 controls)
  {
    controlCode: 'A.5.1',
    domainCode: 'A.5',
    domainTitle: 'AI Impact Assessment',
    title: 'AI system impact assessment (AI-SIA)',
    description: 'The organization shall establish and implement a formal process for assessing potential impacts of AI systems on individuals, groups, society, safety, and business operations.',
    standardGuidance: 'Execute an AI-SIA prior to developing or procuring any AI system. Evaluate fundamental rights, bias, privacy intrusion, and safety hazards.',
    applicable: true,
    inclusionJustification: 'Critical requirement for identifying and mitigating negative ethical, legal, and human rights consequences of automated decisions.',
    implementationStatus: 'Implemented',
    maturityLevel: 4,
    responsibleDepartment: 'Information Security & Compliance',
    iso27001Crosswalk: {
      controlCode: 'A.5.8',
      controlTitle: 'Information security in project management',
      relationshipType: 'SUPERSET',
      confidenceScore: 94,
      auditGuidance: 'Integrate the AI-SIA gate into corporate SDLC and project management gates before any model progresses to staging.'
    },
    euAiActCrosswalk: 'Art. 9 (Risk management system) & Art. 27 (Fundamental rights impact assessment)',
    masFeatCrosswalk: 'Principle 1 & 2: Fairness & Ethics Impact Evaluation',
    evidenceRequirements: ['AI-SIA Standard Operating Procedure', 'Signed AI-SIA Reports for In-Scope Models', 'AI Risk Classification Matrix']
  },
  {
    controlCode: 'A.5.2',
    domainCode: 'A.5',
    domainTitle: 'AI Impact Assessment',
    title: 'Assessment of continuous and cumulative AI impacts',
    description: 'The organization shall monitor and re-evaluate cumulative and long-term societal and ethical impacts throughout the operational lifecycle.',
    standardGuidance: 'Establish periodic review triggers when models are retrained, fine-tuned, or when customer demographics shift significantly.',
    applicable: true,
    inclusionJustification: 'Prevents insidious degradation of model fairness, feedback loop bias, and unintended behavioral drift over time.',
    implementationStatus: 'Implemented',
    maturityLevel: 3,
    responsibleDepartment: 'Data Science & AI Engineering',
    iso27001Crosswalk: {
      controlCode: 'A.8.16',
      controlTitle: 'Monitoring activities',
      relationshipType: 'RELATED_OVERLAP',
      confidenceScore: 88,
      auditGuidance: 'Correlate operational infrastructure logs with model prediction drift and adverse outcome complaint velocity.'
    },
    euAiActCrosswalk: 'Art. 72 (Post-market monitoring plan)',
    masFeatCrosswalk: 'Principle 1.3: Ongoing Fairness Monitoring',
    evidenceRequirements: ['Model Retraining Review Records', 'Quarterly Demographic Parity Drift Reports', 'Longitudinal Feedback Loop Audits']
  },
  {
    controlCode: 'A.5.3',
    domainCode: 'A.5',
    domainTitle: 'AI Impact Assessment',
    title: 'Interested party consultation and feedback',
    description: 'The organization shall establish mechanisms to consult relevant internal and external interested parties when assessing potential AI impacts.',
    standardGuidance: 'Engage external ethics advisors, consumer advocate feedback groups, and affected employee representatives during AI-SIA scoping.',
    applicable: true,
    inclusionJustification: 'Broadens risk discovery beyond internal engineering assumptions and enhances external stakeholder legitimacy.',
    implementationStatus: 'In Progress',
    maturityLevel: 3,
    responsibleDepartment: 'Legal & Regulatory Affairs',
    iso27001Crosswalk: {
      controlCode: 'A.5.5',
      controlTitle: 'Contact with authorities',
      relationshipType: 'RELATED_OVERLAP',
      confidenceScore: 82,
      auditGuidance: 'Extends regulatory liaison channels to include AI ethics advisory bodies and consumer protection forums.'
    },
    euAiActCrosswalk: 'Art. 27.3 (Consultation of workers representatives)',
    masFeatCrosswalk: 'Principle 4: Stakeholder Engagement',
    evidenceRequirements: ['Stakeholder Consultation Notes', 'External Ethics Review Minutes', 'Public Feedback Channel Intake Log']
  },

  // A.6 AI system life cycle (7 controls)
  {
    controlCode: 'A.6.1',
    domainCode: 'A.6',
    domainTitle: 'AI Lifecycle',
    title: 'AI system conception and specification',
    description: 'Requirements for AI systems, including intended use, target performance metrics, operational constraints, and unacceptable use cases, shall be documented.',
    standardGuidance: 'Draft formal System Requirement Specifications (SRS) documenting purpose, input modalities, confidence thresholds, and boundary constraints.',
    applicable: true,
    inclusionJustification: 'Prevents scope creep, unauthorized reuse, and deployment of models without clear acceptance boundaries.',
    implementationStatus: 'Implemented',
    maturityLevel: 4,
    responsibleDepartment: 'Software Engineering & DevOps',
    iso27001Crosswalk: {
      controlCode: 'A.8.26',
      controlTitle: 'Application security requirements',
      relationshipType: 'EXACT_EQUIVALENT',
      confidenceScore: 94,
      auditGuidance: 'AI SRS forms part of ISO 27001 application security requirements specification prior to software development.'
    },
    euAiActCrosswalk: 'Art. 11 (Technical documentation) & Annex IV',
    masFeatCrosswalk: 'Principle 2: Clear Operational Boundaries',
    evidenceRequirements: ['AI System Requirement Specification Documents', 'Model Card Baseline v1.0', 'Acceptable Use Boundaries Statement']
  },
  {
    controlCode: 'A.6.2',
    domainCode: 'A.6',
    domainTitle: 'AI Lifecycle',
    title: 'AI system design and development',
    description: 'AI systems shall be designed and developed using documented methodologies, version-controlled architecture, reproducible pipelines, and robust security controls.',
    standardGuidance: 'Enforce MLOps pipelines (MLflow, Kubeflow) with strict artifact versioning for code, model weights, and hyperparameters.',
    applicable: true,
    inclusionJustification: 'Ensures reproducibility, traceability, and auditability of model training runs and checkpoint artifacts.',
    implementationStatus: 'Implemented',
    maturityLevel: 4,
    responsibleDepartment: 'Data Science & AI Engineering',
    iso27001Crosswalk: {
      controlCode: 'A.8.25',
      controlTitle: 'Secure development life cycle',
      relationshipType: 'EXACT_EQUIVALENT',
      confidenceScore: 95,
      auditGuidance: 'MLOps pipelines must adhere to ISO 27001 secure software development lifecycle standards, including signed commits and code peer reviews.'
    },
    euAiActCrosswalk: 'Art. 15 (Robustness & cybersecurity by design)',
    masFeatCrosswalk: 'System Development Life Cycle Standards',
    evidenceRequirements: ['MLOps Pipeline Architecture Specification', 'Git & Model Registry Commit History', 'Hyperparameter Tuning & Checkpoint Logs']
  },
  {
    controlCode: 'A.6.3',
    domainCode: 'A.6',
    domainTitle: 'AI Lifecycle',
    title: 'AI system verification and validation (V&V)',
    description: 'AI systems shall undergo rigorous verification and validation testing against representative test datasets, adversarial inputs, edge cases, and red-teaming simulations.',
    standardGuidance: 'Conduct automated test suites measuring F1-score, robustness against adversarial perturbation, red-teaming prompt injection attacks, and toxicity benchmarks.',
    applicable: true,
    inclusionJustification: 'Guarantees that AI models meet safety, security, and performance criteria prior to live user exposure.',
    implementationStatus: 'Implemented',
    maturityLevel: 4,
    responsibleDepartment: 'Quality Assurance & Governance',
    iso27001Crosswalk: {
      controlCode: 'A.8.29',
      controlTitle: 'Security testing in development and acceptance',
      relationshipType: 'SUPERSET',
      confidenceScore: 93,
      auditGuidance: 'Verification extends beyond functional testing to include adversarial red-teaming and prompt injection vulnerability penetration testing.'
    },
    euAiActCrosswalk: 'Art. 15 (Testing and validation of high-risk AI)',
    masFeatCrosswalk: 'Principle 1.2: Rigorous Model Validation',
    evidenceRequirements: ['Model Validation Test Reports', 'Adversarial Robustness & Red-Team Attestation', 'Automated QA Benchmark Roster']
  },
  {
    controlCode: 'A.6.4',
    domainCode: 'A.6',
    domainTitle: 'AI Lifecycle',
    title: 'AI system deployment and operational monitoring',
    description: 'Procedures for deploying AI systems into production and continuously monitoring inference latency, prediction accuracy, model drift, and system health shall be implemented.',
    standardGuidance: 'Deploy model monitoring tools (Evidently AI, Prometheus/Grafana) with real-time telemetry for latency, error rates, and distribution divergence.',
    applicable: true,
    inclusionJustification: 'Maintains operational integrity and provides early warning against production model degradation or silent failures.',
    implementationStatus: 'Implemented',
    maturityLevel: 4,
    responsibleDepartment: 'Software Engineering & DevOps',
    iso27001Crosswalk: {
      controlCode: 'A.8.15',
      controlTitle: 'Logging',
      relationshipType: 'RELATED_OVERLAP',
      confidenceScore: 90,
      auditGuidance: 'Inference request/response payloads, latency metrics, and anomaly scores must be captured in immutable centralized logging systems.'
    },
    euAiActCrosswalk: 'Art. 12 (Record-keeping & logging)',
    masFeatCrosswalk: 'Operational Telemetry Guidance',
    evidenceRequirements: ['Production Model Telemetry Dashboard Export', 'Model Drift Alert Configuration Logs', 'Inference SLA Performance Reports']
  },
  {
    controlCode: 'A.6.5',
    domainCode: 'A.6',
    domainTitle: 'AI Lifecycle',
    title: 'AI system decommissioning and retirement',
    description: 'The organization shall establish procedures for safely decommissioning AI systems, archiving model weights, sanitizing training datasets, and notifying dependent stakeholders.',
    standardGuidance: 'Define sunset workflows including graceful fallback to rule-based systems or newer model versions, and permanent secure deletion of deprecated weights.',
    applicable: true,
    inclusionJustification: 'Prevents zombie models and deprecated inference endpoints from remaining online without governance or security patching.',
    implementationStatus: 'Implemented',
    maturityLevel: 3,
    responsibleDepartment: 'Data Science & AI Engineering',
    iso27001Crosswalk: {
      controlCode: 'A.8.10',
      controlTitle: 'Information deletion',
      relationshipType: 'EXACT_EQUIVALENT',
      confidenceScore: 92,
      auditGuidance: 'Decommissioning must verify complete sanitization of model caches, feature vectors, and access API keys in compliance with ISO 27001 A.8.10.'
    },
    euAiActCrosswalk: 'Art. 72.3 (Post-market end-of-life procedures)',
    masFeatCrosswalk: 'Lifecycle Management Standards',
    evidenceRequirements: ['Model Decommissioning SOP', 'Retired Model Archive Log', 'Data Sanitization Certificates']
  },
  {
    controlCode: 'A.6.6',
    domainCode: 'A.6',
    domainTitle: 'AI Lifecycle',
    title: 'Management of continuous learning AI systems',
    description: 'For AI systems that adapt or update parameters continuously in production, strict controls over data contamination, feedback loops, and automated guardrails shall be enforced.',
    standardGuidance: 'Deploy automated canary validation pipelines to verify that automated weights updates do not introduce catastrophic forgetting or malicious drift.',
    applicable: true,
    inclusionJustification: 'Guarantees that adaptive online learning algorithms do not degrade into unsafe or biased behaviors upon real-time feedback ingestion.',
    implementationStatus: 'In Progress',
    maturityLevel: 3,
    responsibleDepartment: 'Data Science & AI Engineering',
    iso27001Crosswalk: {
      controlCode: 'A.8.32',
      controlTitle: 'Change management',
      relationshipType: 'SUPERSET',
      confidenceScore: 89,
      auditGuidance: 'Continuous online learning updates must be governed by automated change validation gates to prevent unauthorized autonomous drift.'
    },
    euAiActCrosswalk: 'Art. 15.3 (Mitigation of feedback loops & data poisoning)',
    masFeatCrosswalk: 'Principle 1.4: Real-time Learning Controls',
    evidenceRequirements: ['Online Learning Canary Test Specifications', 'Feedback Loop Contamination Mitigation Protocol', 'Automated Parameter Rollback Proof']
  },
  {
    controlCode: 'A.6.7',
    domainCode: 'A.6',
    domainTitle: 'AI Lifecycle',
    title: 'Model health and operational telemetry',
    description: 'System health metrics including inference throughput, memory exhaustion, hallucination tripwire alerts, and hardware error rates shall be monitored continuously.',
    standardGuidance: 'Integrate APM tools (Datadog, Grafana) with automated circuit breakers to isolate failing inference microservices.',
    applicable: true,
    inclusionJustification: 'Guarantees high system availability, predictable latency, and immediate notification of infrastructure faults.',
    implementationStatus: 'Implemented',
    maturityLevel: 4,
    responsibleDepartment: 'Software Engineering & DevOps',
    iso27001Crosswalk: {
      controlCode: 'A.8.16',
      controlTitle: 'Monitoring activities',
      relationshipType: 'EXACT_EQUIVALENT',
      confidenceScore: 94,
      auditGuidance: 'Directly mirrors ISO 27001 operational monitoring; checks infrastructure threshold alarms and inference response degradation.'
    },
    euAiActCrosswalk: 'Art. 15.1 (System resilience and robustness)',
    masFeatCrosswalk: 'Resilience Telemetry Requirements',
    evidenceRequirements: ['APM Alert Threshold Configuration', 'System Outage Post-Mortem Templates', '24/7 SRE PagerDuty Rotation Schedule']
  },

  // A.7 Data for AI systems (6 controls)
  {
    controlCode: 'A.7.1',
    domainCode: 'A.7',
    domainTitle: 'AI Data Governance',
    title: 'AI data acquisition and provenance',
    description: 'The organization shall establish processes to verify the source, legal ownership, copyright, licensing terms, and consent mechanisms for all data acquired for AI training.',
    standardGuidance: 'Maintain a Data Lineage & Provenance Register documenting origins, scraping permits, open-source licenses, and customer consent agreements.',
    applicable: true,
    inclusionJustification: 'Mitigates legal copyright infringement, unlicensed data scraping liability, and regulatory non-compliance.',
    implementationStatus: 'Implemented',
    maturityLevel: 4,
    responsibleDepartment: 'Legal & Regulatory Affairs',
    iso27001Crosswalk: {
      controlCode: 'A.5.32',
      controlTitle: 'Intellectual property rights',
      relationshipType: 'EXACT_EQUIVALENT',
      confidenceScore: 95,
      auditGuidance: 'Auditors inspect commercial licensing contracts, creative commons terms, and web scraping agreements for all training datasets.'
    },
    euAiActCrosswalk: 'Art. 53 (Copyright compliance for general-purpose AI)',
    masFeatCrosswalk: 'Principle 3: Legal & Lawful Data Sourcing',
    evidenceRequirements: ['Data Lineage & Provenance Register', 'Third-Party Data Licensing Agreements', 'GDPR/PDPA Consent Audit Logs']
  },
  {
    controlCode: 'A.7.2',
    domainCode: 'A.7',
    domainTitle: 'AI Data Governance',
    title: 'Data quality for AI systems',
    description: 'Data used for training, fine-tuning, validation, and testing shall meet defined quality criteria, including accuracy, completeness, timeliness, and relevance.',
    standardGuidance: 'Execute automated data validation pipelines (Great Expectations) checking for missing values, label noise, duplicate records, and schema anomalies.',
    applicable: true,
    inclusionJustification: 'High-quality training data is the fundamental prerequisite for reliable, generalizable model inferences.',
    implementationStatus: 'Implemented',
    maturityLevel: 4,
    responsibleDepartment: 'Data Science & AI Engineering',
    iso27001Crosswalk: {
      controlCode: 'A.8.9',
      controlTitle: 'Configuration management',
      relationshipType: 'RELATED_OVERLAP',
      confidenceScore: 87,
      auditGuidance: 'Data schemas, cleaning scripts, and feature definitions must be version-controlled and verified prior to pipeline execution.'
    },
    euAiActCrosswalk: 'Art. 10.2 (Data quality and statistical properties)',
    masFeatCrosswalk: 'Data Quality & Accuracy Standards',
    evidenceRequirements: ['Data Quality Pipeline Test Runs', 'Automated Great Expectations Validation Reports', 'Dataset Cleansing Audit Trail']
  },
  {
    controlCode: 'A.7.3',
    domainCode: 'A.7',
    domainTitle: 'AI Data Governance',
    title: 'Bias detection and mitigation in AI data',
    description: 'The organization shall analyze training and validation data for unintended statistical biases, historical disparities, and demographic skew, applying mitigation techniques.',
    standardGuidance: 'Use open-source bias profiling tools (AIF360, Fairlearn) to calculate disparate impact ratios across protected attributes (gender, age, race, region).',
    applicable: true,
    inclusionJustification: 'Prevents unfair discrimination, reputational damage, and violation of anti-discrimination laws.',
    implementationStatus: 'Implemented',
    maturityLevel: 4,
    responsibleDepartment: 'Information Security & Compliance',
    iso27001Crosswalk: {
      controlCode: 'A.5.33',
      controlTitle: 'Protection of records',
      relationshipType: 'RELATED_OVERLAP',
      confidenceScore: 85,
      auditGuidance: 'Retain immutable statistical bias verification records and disparate impact testing logs for regulatory inspection.'
    },
    euAiActCrosswalk: 'Art. 10.2.f (Mitigation of possible biases)',
    masFeatCrosswalk: 'Principle 1: Fairness (Disparate Impact < 0.80 Prohibited)',
    evidenceRequirements: ['Data Bias Assessment Reports', 'Disparate Impact Ratio Analysis Table', 'Data Re-balancing / Synthetic Augmentation Log']
  },
  {
    controlCode: 'A.7.4',
    domainCode: 'A.7',
    domainTitle: 'AI Data Governance',
    title: 'Data privacy and protection in AI systems',
    description: 'Appropriate privacy-preserving techniques (differential privacy, pseudonymization, redaction, k-anonymity) shall be applied to prevent PII exposure in model training.',
    standardGuidance: 'Deploy automated PII detection & masking pipelines (Microsoft Presidio) to strip email addresses, names, and credit card numbers before model ingestion.',
    applicable: true,
    inclusionJustification: 'Protects personal data against model memorization and extraction attacks.',
    implementationStatus: 'Implemented',
    maturityLevel: 4,
    responsibleDepartment: 'Information Security & Compliance',
    iso27001Crosswalk: {
      controlCode: 'A.8.11',
      controlTitle: 'Data masking',
      relationshipType: 'EXACT_EQUIVALENT',
      confidenceScore: 97,
      auditGuidance: 'Directly fulfills ISO 27001 data masking controls; ensures PII redaction and differential privacy injection during training dataset preparation.'
    },
    euAiActCrosswalk: 'Art. 10.5 (Processing of special categories of personal data)',
    masFeatCrosswalk: 'Principle 2: Privacy & Consumer Data Protection',
    evidenceRequirements: ['PII Scrubbing Pipeline Architecture & Logs', 'Differential Privacy Parameter Epsilon Configuration', 'Privacy Impact Assessment (DPIA)']
  },
  {
    controlCode: 'A.7.5',
    domainCode: 'A.7',
    domainTitle: 'AI Data Governance',
    title: 'Data preparation and labeling governance',
    description: 'Processes for data cleaning, transformation, and human labeling shall be documented, monitored for inter-annotator agreement, and protected from poisoning.',
    standardGuidance: 'Audit external data labeling vendors, compute Cohen Kappa scores for labeler consensus, and maintain audit trails of dataset curation.',
    applicable: true,
    inclusionJustification: 'Prevents corrupted, malicious, or highly subjective human labels from poisoning supervised training datasets.',
    implementationStatus: 'Implemented',
    maturityLevel: 3,
    responsibleDepartment: 'Data Science & AI Engineering',
    iso27001Crosswalk: {
      controlCode: 'A.8.30',
      controlTitle: 'Outsourced development',
      relationshipType: 'RELATED_OVERLAP',
      confidenceScore: 90,
      auditGuidance: 'Third-party human labeling vendor agreements must enforce strict confidentiality, data sanitization, and quality validation.'
    },
    euAiActCrosswalk: 'Art. 10.2 (Data preparation operations)',
    masFeatCrosswalk: 'Data Integrity Standards',
    evidenceRequirements: ['Labeling Vendor Master Services Agreement', 'Inter-Annotator Agreement Kappa Benchmark', 'Data Cleansing Transformation Scripts']
  },
  {
    controlCode: 'A.7.6',
    domainCode: 'A.7',
    domainTitle: 'AI Data Governance',
    title: 'Synthetic data governance and validation',
    description: 'When synthetic data is generated or used to augment AI training, its fidelity, statistical distribution, and privacy leakage guarantees shall be validated.',
    standardGuidance: 'Conduct empirical distance tests (Wasserstein distance) and membership inference attack evaluations on generated synthetic tables.',
    applicable: true,
    inclusionJustification: 'Ensures synthetic data accurately reflects real-world dynamics without inadvertently leaking source training identities.',
    implementationStatus: 'In Progress',
    maturityLevel: 3,
    responsibleDepartment: 'Data Science & AI Engineering',
    iso27001Crosswalk: {
      controlCode: 'A.8.33',
      controlTitle: 'Test information',
      relationshipType: 'SUPERSET',
      confidenceScore: 91,
      auditGuidance: 'Synthetic test data must be generated using privacy-preserving techniques to prevent exposure of sensitive production records.'
    },
    euAiActCrosswalk: 'Art. 10.5 (Synthetic data for bias detection)',
    masFeatCrosswalk: 'Synthetic Data Validation Guidelines',
    evidenceRequirements: ['Synthetic Data Generation Methodology Paper', 'Wasserstein Distance Statistical Verification', 'Membership Inference Privacy Stress Test']
  },

  // A.8 Information for interested parties (4 controls)
  {
    controlCode: 'A.8.1',
    domainCode: 'A.8',
    domainTitle: 'Transparency & Explainability',
    title: 'AI system transparency and disclosures',
    description: 'The organization shall provide clear and accessible information to users disclosing that they are interacting with an AI system and explaining its capabilities and limitations.',
    standardGuidance: 'Implement UI disclaimers (e.g., "Generated by AI Assistant"), published Model Cards, and explicit terms of service acknowledging algorithmic decision assistance.',
    applicable: true,
    inclusionJustification: 'Required by global AI transparency regulations (EU AI Act, FTC guidelines, PDPA Advisory).',
    implementationStatus: 'Implemented',
    maturityLevel: 4,
    responsibleDepartment: 'Product Management & UX',
    iso27001Crosswalk: {
      controlCode: 'A.5.37',
      controlTitle: 'Documented operating procedures',
      relationshipType: 'RELATED_OVERLAP',
      confidenceScore: 88,
      auditGuidance: 'Customer-facing documentation must clearly describe operational constraints and manual fallback mechanisms.'
    },
    euAiActCrosswalk: 'Art. 50 (Transparency obligations for certain AI systems)',
    masFeatCrosswalk: 'Principle 4: Transparency & Communication',
    evidenceRequirements: ['User Interface AI Disclosure Screenshots', 'Published Public Model Cards', 'Consumer Terms of Service AI Addendum']
  },
  {
    controlCode: 'A.8.2',
    domainCode: 'A.8',
    domainTitle: 'Transparency & Explainability',
    title: 'AI system explainability and interpretability',
    description: 'The organization shall provide appropriate explanations for significant AI decisions, especially those affecting legal, financial, or employment outcomes of individuals.',
    standardGuidance: 'Incorporate explainability tools (SHAP values, LIME, attention heatmaps) allowing customer support and compliance officers to explain algorithmic credit/risk scoring.',
    applicable: true,
    inclusionJustification: 'Ensures procedural fairness and fulfills the user right to an explanation under modern privacy and banking regulations.',
    implementationStatus: 'Implemented',
    maturityLevel: 3,
    responsibleDepartment: 'Data Science & AI Engineering',
    iso27001Crosswalk: {
      controlCode: 'A.8.15',
      controlTitle: 'Logging',
      relationshipType: 'RELATED_OVERLAP',
      confidenceScore: 86,
      auditGuidance: 'Explainability feature contributions must be recorded in log repositories alongside decision outcomes for audit trail verification.'
    },
    euAiActCrosswalk: 'Art. 13 (Transparency and provision of information to deployers)',
    masFeatCrosswalk: 'Principle 4.1: Algorithmic Explainability & Recourse',
    evidenceRequirements: ['Model Explainability Technical Specification', 'Sample SHAP/LIME Decision Explanations', 'Customer Algorithmic Inquiry SOP']
  },
  {
    controlCode: 'A.8.3',
    domainCode: 'A.8',
    domainTitle: 'Transparency & Explainability',
    title: 'External reporting of serious AI incidents',
    description: 'Procedures shall be established for reporting significant AI safety failures, critical biases, or severe data breaches to regulatory bodies and affected subjects.',
    standardGuidance: 'Establish legal notification templates with defined 72-hour SLAs for notifying the designated supervisory authority under applicable AI acts.',
    applicable: true,
    inclusionJustification: 'Ensures compliance with mandatory statutory disclosure obligations and prevents concealment of critical public risks.',
    implementationStatus: 'Implemented',
    maturityLevel: 4,
    responsibleDepartment: 'Legal & Regulatory Affairs',
    iso27001Crosswalk: {
      controlCode: 'A.5.5',
      controlTitle: 'Contact with authorities',
      relationshipType: 'EXACT_EQUIVALENT',
      confidenceScore: 95,
      auditGuidance: 'Directly mirrors ISO 27001 regulatory notification workflows; establishes clear liaison channels with national AI supervisory bodies.'
    },
    euAiActCrosswalk: 'Art. 73 (Reporting of serious incidents to market surveillance)',
    masFeatCrosswalk: 'Regulatory Notification Standards',
    evidenceRequirements: ['Regulatory AI Incident Notification SOP', 'Authority Contact Registry', 'Post-Incident Disclosure Template']
  },
  {
    controlCode: 'A.8.4',
    domainCode: 'A.8',
    domainTitle: 'Transparency & Explainability',
    title: 'Standardized model documentation and Model Cards',
    description: 'Each production model shall have an up-to-date, comprehensive Model Card detailing architecture, training provenance, intended domains, limitations, and evaluation metrics.',
    standardGuidance: 'Publish Model Cards following the Google/HuggingFace specification for all models deployed into production.',
    applicable: true,
    inclusionJustification: 'Guarantees that downstream developers and auditors understand model limitations, avoiding misapplication or inappropriate deployment.',
    implementationStatus: 'Implemented',
    maturityLevel: 4,
    responsibleDepartment: 'Data Science & AI Engineering',
    iso27001Crosswalk: {
      controlCode: 'A.5.37',
      controlTitle: 'Documented operating procedures',
      relationshipType: 'SUPERSET',
      confidenceScore: 92,
      auditGuidance: 'Model Cards serve as the definitive technical and operating documentation for algorithmic assets.'
    },
    euAiActCrosswalk: 'Art. 11 & Annex IV (Technical documentation requirements)',
    masFeatCrosswalk: 'Principle 4.2: Clear System Documentation',
    evidenceRequirements: ['Published Model Cards in Enterprise Wiki', 'Model Card Automation Pipeline Script', 'Annual Model Card Recertification Log']
  },

  // A.9 Use of AI systems (5 controls)
  {
    controlCode: 'A.9.1',
    domainCode: 'A.9',
    domainTitle: 'Responsible AI Use',
    title: 'Responsible and intended use of AI systems',
    description: 'The organization shall establish controls and guidelines to ensure that AI systems are operated only within their designated scope of use and defined operational constraints.',
    standardGuidance: 'Deploy guardrail systems (NeMo Guardrails, Llama Guard) to filter out of scope user prompts, illicit requests, and hazardous system instructions.',
    applicable: true,
    inclusionJustification: 'Prevents unauthorized misuse of company AI infrastructure for prohibited, hazardous, or malicious tasks.',
    implementationStatus: 'Implemented',
    maturityLevel: 4,
    responsibleDepartment: 'Software Engineering & DevOps',
    iso27001Crosswalk: {
      controlCode: 'A.5.10',
      controlTitle: 'Acceptable use of information and other associated assets',
      relationshipType: 'EXACT_EQUIVALENT',
      confidenceScore: 95,
      auditGuidance: 'Extends ISO 27001 acceptable use policies to explicitly define prohibited prompt injection, data scraping, and high-risk AI interactions.'
    },
    euAiActCrosswalk: 'Art. 26 (Obligations of deployers of high-risk AI)',
    masFeatCrosswalk: 'Principle 2: Ethical Use Boundaries',
    evidenceRequirements: ['AI Guardrail Configuration Files', 'Prompt Moderation Filter Logs', 'Prohibited Use Policy Documentation']
  },
  {
    controlCode: 'A.9.2',
    domainCode: 'A.9',
    domainTitle: 'Responsible AI Use',
    title: 'Human oversight and Human-in-the-Loop (HITL)',
    description: 'The organization shall determine and implement appropriate levels of human oversight (Human-in-the-loop, Human-on-the-loop, Human-in-command) based on AI system risk level.',
    standardGuidance: 'Enforce mandatory human approval for financial transactions over threshold, credit denials, or security isolation actions generated by AI models.',
    applicable: true,
    inclusionJustification: 'Mitigates autonomous error propagation and prevents unchecked catastrophic model failure.',
    implementationStatus: 'Implemented',
    maturityLevel: 4,
    responsibleDepartment: 'Operations & Business Continuity',
    iso27001Crosswalk: {
      controlCode: 'A.5.3',
      controlTitle: 'Segregation of duties',
      relationshipType: 'RELATED_OVERLAP',
      confidenceScore: 91,
      auditGuidance: 'Prevents single-point automated execution of high-risk operations by enforcing dual human-machine checks.'
    },
    euAiActCrosswalk: 'Art. 14 (Human oversight measures)',
    masFeatCrosswalk: 'Principle 3: Human Oversight & Intervention',
    evidenceRequirements: ['HITL Threshold Architecture Specification', 'Human Reviewer Approval Ledger', 'Manual Override Audit Trail']
  },
  {
    controlCode: 'A.9.3',
    domainCode: 'A.9',
    domainTitle: 'Responsible AI Use',
    title: 'Mitigation of automation bias',
    description: 'The organization shall train operators and human reviewers to identify and avoid automation bias (uncritically trusting AI recommendations without independent verification).',
    standardGuidance: 'Conduct scenario-based training for operators highlighting confidence score interpretations and common AI failure modes.',
    applicable: true,
    inclusionJustification: 'Ensures human reviewers remain critical evaluators rather than rubber-stampers.',
    implementationStatus: 'Implemented',
    maturityLevel: 3,
    responsibleDepartment: 'Human Resources & People Ops',
    iso27001Crosswalk: {
      controlCode: 'A.6.3',
      controlTitle: 'Information security awareness, education and training',
      relationshipType: 'SUPERSET',
      confidenceScore: 89,
      auditGuidance: 'Specialized training for analysts on algorithmic blind spots, confidence misinterpretation, and complacency risks.'
    },
    euAiActCrosswalk: 'Art. 14.4.b (Awareness of automation bias risk)',
    masFeatCrosswalk: 'Operator Competency Guidelines',
    evidenceRequirements: ['Operator Training Roster on Automation Bias', 'Human Reviewer Disagreement / Correction Rate Metrics', 'Periodic Reviewer Blind Testing Logs']
  },
  {
    controlCode: 'A.9.4',
    domainCode: 'A.9',
    domainTitle: 'Responsible AI Use',
    title: 'Operational rollback and emergency AI kill-switch',
    description: 'The organization shall implement automated circuit breakers and documented procedures to immediately suspend or roll back AI models in case of severe anomalies.',
    standardGuidance: 'Deploy automated feature flags allowing instant traffic rerouting to a deterministic fallback or prior stable model checkpoint within < 5 minutes.',
    applicable: true,
    inclusionJustification: 'Prevents widespread customer harm or systemic financial loss during unexpected model malfunction or jailbreak campaigns.',
    implementationStatus: 'Implemented',
    maturityLevel: 4,
    responsibleDepartment: 'Software Engineering & DevOps',
    iso27001Crosswalk: {
      controlCode: 'A.8.14',
      controlTitle: 'Redundancy of information processing facilities',
      relationshipType: 'RELATED_OVERLAP',
      confidenceScore: 92,
      auditGuidance: 'Emergency kill-switches and deterministic failover engines fulfill ISO 27001 operational resilience and redundancy mandates.'
    },
    euAiActCrosswalk: 'Art. 14.4.e (Ability to interrupt the system via a stop button)',
    masFeatCrosswalk: 'Emergency Fallback SOP Guidance',
    evidenceRequirements: ['AI Emergency Kill-Switch Standard Operating Procedure', 'Quarterly Kill-Switch Drill Execution Logs', 'Deterministic Fallback Engine Architecture']
  },
  {
    controlCode: 'A.9.5',
    domainCode: 'A.9',
    domainTitle: 'Responsible AI Use',
    title: 'Post-deployment performance monitoring',
    description: 'The organization shall continuously monitor deployed AI systems for accuracy degradation, adversarial tampering, data distribution shifts, and customer sentiment.',
    standardGuidance: 'Implement real-time dashboards tracking PSI (Population Stability Index), KS statistics, and customer dispute resolution metrics.',
    applicable: true,
    inclusionJustification: 'Ensures sustained alignment with intended objectives and alerts teams to subtle performance degradation.',
    implementationStatus: 'Implemented',
    maturityLevel: 4,
    responsibleDepartment: 'Software Engineering & DevOps',
    iso27001Crosswalk: {
      controlCode: 'A.8.16',
      controlTitle: 'Monitoring activities',
      relationshipType: 'EXACT_EQUIVALENT',
      confidenceScore: 94,
      auditGuidance: 'Aligns with ISO 27001 continuous monitoring; measures statistical shift and security anomaly indicators.'
    },
    euAiActCrosswalk: 'Art. 72 (Post-market monitoring system)',
    masFeatCrosswalk: 'Principle 1.3: Post-Deployment Quality Assurance',
    evidenceRequirements: ['Post-Deployment Monitoring Telemetry Dashboard', 'Weekly Drift Review Meeting Minutes', 'Customer Complaint Resolution Metrics']
  },

  // A.10 Third-party and customer relationships (5 controls)
  {
    controlCode: 'A.10.1',
    domainCode: 'A.10',
    domainTitle: 'AI Third-Party Risk',
    title: 'Supplier AI models and third-party APIs',
    description: 'The organization shall evaluate, select, and monitor third-party AI suppliers, foundational model providers (OpenAI, Anthropic, Google), and external ML libraries.',
    standardGuidance: 'Include AI security and data privacy addenda in vendor contracts (zero-data-retention for training, SLA guarantees, model change notices).',
    applicable: true,
    inclusionJustification: 'Mitigates supply chain vulnerabilities and unauthorized leakage of proprietary data into foundational models.',
    implementationStatus: 'Implemented',
    maturityLevel: 4,
    responsibleDepartment: 'Procurement & Vendor Management',
    iso27001Crosswalk: {
      controlCode: 'A.5.19',
      controlTitle: 'Information security in supplier relationships',
      relationshipType: 'SUPERSET',
      confidenceScore: 96,
      auditGuidance: 'Extends ISO 27001 supplier due diligence to scrutinize AI-specific risks: prompt retention, training data exclusion, and weights security.'
    },
    euAiActCrosswalk: 'Art. 25 (Responsibilities along the AI value chain)',
    masFeatCrosswalk: 'Third-Party Risk Management Standards',
    evidenceRequirements: ['AI Vendor Due Diligence Questionnaires', 'Cloud AI Data Processing Agreements (Zero-Data Retention)', 'Third-Party AI Risk Assessment Matrix']
  },
  {
    controlCode: 'A.10.2',
    domainCode: 'A.10',
    domainTitle: 'AI Third-Party Risk',
    title: 'Customer and interested party expectations',
    description: 'The organization shall understand and address customer expectations, contractual commitments, and regulatory requirements regarding AI governance.',
    standardGuidance: 'Provide enterprise customers with AI Security Whitepapers, SOC 2 / ISO 42001 audit bridge letters, and AI-SIA summary sheets.',
    applicable: true,
    inclusionJustification: 'Fosters customer trust and accelerates enterprise compliance review cycles.',
    implementationStatus: 'Implemented',
    maturityLevel: 4,
    responsibleDepartment: 'Sales & Enterprise Accounts',
    iso27001Crosswalk: {
      controlCode: 'A.5.31',
      controlTitle: 'Legal, statutory, regulatory and contractual requirements',
      relationshipType: 'EXACT_EQUIVALENT',
      confidenceScore: 93,
      auditGuidance: 'Verifies that customer contractual commitments regarding data isolation and non-use in public models are honored.'
    },
    euAiActCrosswalk: 'Art. 13 (Information provision to downstream users)',
    masFeatCrosswalk: 'Customer Transparency Standards',
    evidenceRequirements: ['Enterprise AI Trust Portal Pack', 'Standard Customer AI Security FAQs', 'Customer AI Audit Request Log']
  },
  {
    controlCode: 'A.10.3',
    domainCode: 'A.10',
    domainTitle: 'AI Third-Party Risk',
    title: 'Third-party foundation model risk management',
    description: 'Risks stemming from opacity, hallucinations, deprecation schedules, and intellectual property claims of closed-source foundation models shall be managed.',
    standardGuidance: 'Maintain model fallback redundancy across at least two independent foundation model vendors (e.g. OpenAI and Anthropic) to mitigate single-provider outages.',
    applicable: true,
    inclusionJustification: 'Protects the business from vendor lock-in, unannounced model snapshot deprecation, and service interruptions.',
    implementationStatus: 'Implemented',
    maturityLevel: 3,
    responsibleDepartment: 'Software Engineering & DevOps',
    iso27001Crosswalk: {
      controlCode: 'A.5.21',
      controlTitle: 'Managing information security in the ICT supply chain',
      relationshipType: 'SUPERSET',
      confidenceScore: 92,
      auditGuidance: 'Assess upstream model providers for concentration risk, proprietary lock-in, and catastrophic service disruption.'
    },
    euAiActCrosswalk: 'Art. 28 (Obligations of distributors & importers)',
    masFeatCrosswalk: 'Concentration Risk & Resilience Mandate',
    evidenceRequirements: ['Multi-Model Failover Architecture Document', 'Vendor Model Deprecation Policy Review', 'Model Benchmark Drift Comparison Tests']
  },
  {
    controlCode: 'A.10.4',
    domainCode: 'A.10',
    domainTitle: 'AI Third-Party Risk',
    title: 'AI supply chain vulnerability disclosure and tracking',
    description: 'Vulnerabilities in third-party machine learning libraries (PyTorch, TensorFlow, HuggingFace Transformers) and external datasets shall be tracked and remediated.',
    standardGuidance: 'Enforce Software Bill of Materials (SBOM) generation including model weights digests and automated CVE vulnerability scanning in CI/CD.',
    applicable: true,
    inclusionJustification: 'Prevents supply chain code execution attacks via poisoned pickle files or vulnerable ML runtime binaries.',
    implementationStatus: 'Implemented',
    maturityLevel: 4,
    responsibleDepartment: 'Software Engineering & DevOps',
    iso27001Crosswalk: {
      controlCode: 'A.8.8',
      controlTitle: 'Management of technical vulnerabilities',
      relationshipType: 'EXACT_EQUIVALENT',
      confidenceScore: 96,
      auditGuidance: 'Expands standard vulnerability management to include Python ML packages, serialized weight tensors, and open-source model repositories.'
    },
    euAiActCrosswalk: 'Art. 15.1 (Cybersecurity vulnerabilities across AI supply chain)',
    masFeatCrosswalk: 'Vulnerability Management Standards',
    evidenceRequirements: ['AI-SBOM Software Bill of Materials', 'Automated Snyk / Dependabot Scan Reports', 'Model Weights Deserialization Safety Policy']
  },
  {
    controlCode: 'A.10.5',
    domainCode: 'A.10',
    domainTitle: 'AI Third-Party Risk',
    title: 'Contractual terms for AI data retention and privacy',
    description: 'All contracts with cloud AI providers shall explicitly prohibit retention of prompts and inputs beyond immediate inference processing (Zero Data Retention - ZDR).',
    standardGuidance: 'Execute signed Data Processing Addenda (DPA) featuring strict Zero Data Retention clauses and enterprise non-disclosure terms.',
    applicable: true,
    inclusionJustification: 'Prevents customer and proprietary corporate secrets from being stored or inspected on vendor infrastructure.',
    implementationStatus: 'Implemented',
    maturityLevel: 4,
    responsibleDepartment: 'Legal & Regulatory Affairs',
    iso27001Crosswalk: {
      controlCode: 'A.5.20',
      controlTitle: 'Addressing information security within supplier agreements',
      relationshipType: 'EXACT_EQUIVALENT',
      confidenceScore: 98,
      auditGuidance: 'Supplier contracts must explicitly contain ZDR terms, prompt encryption in transit, and verification of non-use in training pipelines.'
    },
    euAiActCrosswalk: 'Art. 10.5 (Confidentiality and non-disclosure along AI chain)',
    masFeatCrosswalk: 'Data Privacy in Vendor Relationships',
    evidenceRequirements: ['Executed Cloud AI Zero-Data Retention Addenda', 'Vendor Data Processing Agreements (DPA)', 'Annual Legal Review of AI Vendor EULAs']
  }
];

// Pre-seeded AI-SIA Assessment Records
export const INITIAL_AISIA_ASSESSMENTS: AISIAAssessmentRecord[] = [
  {
    id: 'AISIA-2026-001',
    systemId: 'AI-SYS-001',
    systemName: 'Underwriting Credit Risk Scorer v3.2',
    assessorName: 'Marcus Vance, PhD',
    assessorTitle: 'Lead AI Risk & Algorithmic Ethics Assessor',
    assessmentDate: '2026-08-14',
    reviewCadence: 'Quarterly',
    version: '2.1',
    intendedDomain: 'Commercial and Retail Credit Limit Underwriting',
    deploymentContext: 'Integrated into core banking origination API; processes loan applications < $250k.',
    autonomyLevel: 'HUMAN_IN_THE_LOOP',
    targetStakeholders: ['Small Business Borrowers', 'Credit Underwriters', 'Banking Regulators'],
    individualRights: {
      adverseOutcomeSeverity: 4, // High impact on access to capital
      discriminationBiasPotential: 3, // Potential demographic or regional bias
      privacyIntrusionLevel: 2, // Uses standard credit bureau & banking history
      explainabilityBarrier: 3, // Gradient boosted trees require SHAP explainers
      notes: 'Potential adverse action notices required by Fair Credit Reporting Act.'
    },
    societalImpact: {
      criticalInfrastructureReliance: 3,
      disinformationHallucinationRisk: 1, // Deterministic numerical model, not LLM
      environmentalCarbonFootprint: 1, // Low compute footprint
      vulnerablePopulationExposure: 4, // Directly impacts underbanked applicants
      notes: 'Monitored under EEOC 4/5ths rule and MAS FEAT fairness principles.'
    },
    organizationalRisk: {
      regulatoryNonComplianceExposure: 4, // Strict banking regulations
      intellectualPropertyInfringement: 1, // Proprietary internal weights
      reputationalDamagePotential: 4, // Severe brand harm if discriminatory outcomes occur
      modelDriftOperationalInstability: 3, // Macroeconomic inflation drift
      notes: 'Quarterly Population Stability Index (PSI) monitoring enforced.'
    },
    appliedMitigations: [
      'Disparate impact analysis with re-weighing algorithm (Fairlearn)',
      'Mandatory Human-in-the-loop review for credit denials and borderline scores (0.45 - 0.65)',
      'SHAP value feature contribution generation for adverse action letters',
      'Real-time Population Stability Index (PSI) drift monitoring with 0.10 threshold'
    ],
    mitigationEffectiveness: 42, // 42% risk reduction
    inherentImpactScore: 78,
    residualImpactScore: 45,
    derivedRiskTier: 'HIGH_RISK',
    mandatoryControls: ['A.5.1', 'A.6.3', 'A.7.3', 'A.8.2', 'A.9.2'],
    approvalStatus: 'APPROVED',
    approverComments: 'Approved conditionally with requirement for monthly bias audits and mandatory human sign-off on credit denials.',
    approvedBy: 'Elena Rostova, Lead AI Ethics Officer & CISO',
    approvalDate: '2026-08-18',
    cryptographicDigest: 'sha256-8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b'
  },
  {
    id: 'AISIA-2026-002',
    systemId: 'AI-SYS-002',
    systemName: 'Omnichannel Customer Support Copilot',
    assessorName: 'Elena Rostova',
    assessorTitle: 'Chief AI Ethics & Governance Architect',
    assessmentDate: '2026-08-22',
    reviewCadence: 'Bi-Annual',
    version: '1.4',
    intendedDomain: 'Customer Service Knowledge Retrieval & Ticket Resolution',
    deploymentContext: 'Public-facing chat widget and internal support agent recommendation copilot.',
    autonomyLevel: 'HUMAN_ON_THE_LOOP',
    targetStakeholders: ['Bank Customers', 'Support Agents', 'IT Helpdesk'],
    individualRights: {
      adverseOutcomeSeverity: 2,
      discriminationBiasPotential: 2,
      privacyIntrusionLevel: 3, // Handles customer chat text that may contain PII
      explainabilityBarrier: 3, // Large Language Model RAG pipeline
      notes: 'Requires robust PII stripping before vector storage.'
    },
    societalImpact: {
      criticalInfrastructureReliance: 2,
      disinformationHallucinationRisk: 4, // LLM hallucination risk
      environmentalCarbonFootprint: 2, // Hosted API inference
      vulnerablePopulationExposure: 2,
      notes: 'NeMo Guardrails deployed to intercept financial advice requests.'
    },
    organizationalRisk: {
      regulatoryNonComplianceExposure: 3,
      intellectualPropertyInfringement: 2,
      reputationalDamagePotential: 4, // Hallucinated promises or offensive responses
      modelDriftOperationalInstability: 2,
      notes: 'Customer chat disclaimers explicitly label AI interaction.'
    },
    appliedMitigations: [
      'Microsoft Presidio PII anonymizer stripping card numbers and SSNs',
      'NeMo Guardrails active for prompt injection and topic boundaries',
      'Context grounding verification (RAG-triad evaluation) with 0.85 minimum threshold',
      'Mandatory disclaimer indicating AI generation with one-click human escalation'
    ],
    mitigationEffectiveness: 48,
    inherentImpactScore: 66,
    residualImpactScore: 34,
    derivedRiskTier: 'MEDIUM_RISK',
    mandatoryControls: ['A.7.4', 'A.8.1', 'A.9.1', 'A.10.1', 'A.10.5'],
    approvalStatus: 'APPROVED',
    approverComments: 'Verified zero-data-retention agreement with cloud provider and verified prompt sanitization filters.',
    approvedBy: 'David Vance, Head of GRC & Security',
    approvalDate: '2026-08-25',
    cryptographicDigest: 'sha256-1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c'
  },
  {
    id: 'AISIA-2026-003',
    systemId: 'AI-SYS-003',
    systemName: 'Anti-Money Laundering (AML) Anomaly Detector',
    assessorName: 'Dr. Aris Thorne',
    assessorTitle: 'Financial Crime & Graph Analytics Specialist',
    assessmentDate: '2026-09-01',
    reviewCadence: 'Quarterly',
    version: '3.0',
    intendedDomain: 'Sanctions Evasion & Graph-based Fraud Detection',
    deploymentContext: 'Batch and near-real-time streaming transaction analysis across SWIFT and FAST networks.',
    autonomyLevel: 'HUMAN_IN_THE_LOOP',
    targetStakeholders: ['Financial Crime Compliance Investigators', 'Correspondent Banks', 'Financial Intelligence Unit'],
    individualRights: {
      adverseOutcomeSeverity: 5, // Bank account freeze, SAR filing, criminal inquiry
      discriminationBiasPotential: 3, // Regional / geographic high-risk correlation
      privacyIntrusionLevel: 4, // Comprehensive transaction history and counterparty analysis
      explainabilityBarrier: 4, // Graph Convolutional Network subgraphs
      notes: 'Requires sub-graph visual evidence packages for compliance officers.'
    },
    societalImpact: {
      criticalInfrastructureReliance: 4, // Prevents terrorist financing and illicit flows
      disinformationHallucinationRisk: 1,
      environmentalCarbonFootprint: 2,
      vulnerablePopulationExposure: 3,
      notes: 'Ensures innocent individuals are not erroneously unbanked.'
    },
    organizationalRisk: {
      regulatoryNonComplianceExposure: 5, // Catastrophic regulatory fines if sanctions missed
      intellectualPropertyInfringement: 1,
      reputationalDamagePotential: 5,
      modelDriftOperationalInstability: 4, // Rapid evolution of laundering typologies
      notes: 'Zero automated account closures permitted without human officer sign-off.'
    },
    appliedMitigations: [
      'Strict Human-in-the-Loop: Anomaly scores trigger investigator triage; no automated account freezes',
      'Visual GNN Subgraph explainer showing specific transactional loops',
      'Regular typologies retuning against updated FATF & MAS advisories',
      'Independent red-teaming evasion testing by tier-1 external audit firm'
    ],
    mitigationEffectiveness: 38,
    inherentImpactScore: 89,
    residualImpactScore: 55,
    derivedRiskTier: 'HIGH_RISK',
    mandatoryControls: ['A.5.1', 'A.6.3', 'A.7.2', 'A.8.2', 'A.9.2', 'A.9.4'],
    approvalStatus: 'CONDITIONALLY_APPROVED',
    approverComments: 'Conditionally approved pending final validation of the new smurfing detection graph weights by October 1.',
    approvedBy: 'Elena Rostova, Chief AI Ethics Architect',
    approvalDate: '2026-09-04',
    cryptographicDigest: 'sha256-4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d'
  }
];

// Pre-seeded Third-Party AI Supplier Due Diligence Records
export const INITIAL_AI_SUPPLIER_DILIGENCE_RECORDS: AISupplierDueDiligenceRecord[] = [
  {
    id: 'SUP-AI-001',
    supplierName: 'Microsoft Azure OpenAI Service',
    serviceName: 'Azure OpenAI Enterprise API (GPT-4o & Text-Embedding-3)',
    category: 'Foundation Model API',
    modelFamiliesUsed: ['GPT-4o', 'GPT-4o-mini', 'text-embedding-3-large'],
    businessOwner: 'Enterprise Architecture & Cloud SecOps',
    contactEmail: 'azure-security@microsoft.com',
    contractRenewalDate: '2027-03-31',
    riskRating: 'APPROVED_FOR_PRODUCTION',
    zeroDataRetention: true,
    trainingExemptionGuaranteed: true,
    outputOwnershipConfirmed: true,
    ipIndemnificationProvided: true,
    dataResidencyOption: 'Singapore Local Region (Southeast Asia)',
    availabilitySla: '99.95%',
    p95LatencyGuarantee: '< 320ms',
    soc2Type2Verified: true,
    iso27001Certified: true,
    iso42001Compliant: true,
    dpaSignedDate: '2025-11-15',
    dpaDocumentRef: 'MSFT-DPA-2025-SG-SEC-09',
    overallScore: 96,
    lastAuditDate: '2026-07-20',
    nextAuditDueDate: '2027-01-20',
    checkItems: [
      {
        id: 'CHK-01',
        name: 'Zero Data Retention (ZDR) Verification',
        description: 'Verifies that prompt and completion payloads are not cached on disk beyond immediate inference execution.',
        status: 'PASS',
        evidenceCitation: 'Azure OpenAI Customer Data Protection Addendum Section 3.2 - Customer Prompts Exemption',
        verifiedAt: '2026-07-20',
        notes: 'Signed modified SLA with Abuse Monitoring opt-out exemption approved for financial services compliance.'
      },
      {
        id: 'CHK-02',
        name: 'Training Data Exclusion Guarantee',
        description: 'Vendor contractually covenants that customer inputs are strictly never used to train public foundation models.',
        status: 'PASS',
        evidenceCitation: 'Enterprise Terms Section 4.1: "Microsoft does not use Customer Data to train, retrain, or improve foundational models."',
        verifiedAt: '2026-07-20',
        notes: 'Enforced via tenant policy at organization level.'
      },
      {
        id: 'CHK-03',
        name: 'Model Output IP & Weights Ownership',
        description: 'Customer retains full ownership of all generated completions, representations, and derived embeddings.',
        status: 'PASS',
        evidenceCitation: 'Commercial Terms Section 5.3: Ownership of Output Artifacts',
        verifiedAt: '2026-07-20',
        notes: 'Customer owns all copyright and IP rights in generated text.'
      },
      {
        id: 'CHK-04',
        name: 'Copyright & Patent Indemnification',
        description: 'Vendor provides defense and indemnification against third-party copyright claims regarding model output.',
        status: 'PASS',
        evidenceCitation: 'Microsoft Copilot Copyright Commitment Addendum (Unlimited Cap)',
        verifiedAt: '2026-07-20',
        notes: 'Requires default safety filters to be left enabled.'
      },
      {
        id: 'CHK-05',
        name: 'Data Residency & Sovereign Boundary',
        description: 'Prompt vectors and inference processing stay strictly within designated geographical boundaries.',
        status: 'PASS',
        evidenceCitation: 'Azure Singapore (Southeast Asia) Geofenced Deployment Certificate',
        verifiedAt: '2026-07-20',
        notes: 'Cross-border data transfer disabled via Azure Policy enforcement.'
      },
      {
        id: 'CHK-06',
        name: 'SLA Uptime & Latency Guarantees',
        description: 'Financial penalty credits for downtime below 99.9% and p95 latency under 500ms.',
        status: 'PASS',
        evidenceCitation: 'Azure OpenAI Enterprise Service Level Agreement v2.4',
        verifiedAt: '2026-07-20',
        notes: 'Provisioned Throughput Units (PTU) reserved for predictable latency.'
      },
      {
        id: 'CHK-07',
        name: 'Model Deprecation Notice SLA',
        description: 'Advance notice SLA before model version checkpoints are discontinued.',
        status: 'PASS',
        evidenceCitation: 'Azure AI Lifecycle Policy: Mandatory 6-month deprecation warning',
        verifiedAt: '2026-07-20',
        notes: 'Ensures sufficient lead time for regression and prompt testing.'
      }
    ]
  },
  {
    id: 'SUP-AI-002',
    supplierName: 'Amazon Web Services (AWS Bedrock)',
    serviceName: 'AWS Bedrock (Anthropic Claude 3.5 Sonnet & Titan Embeddings)',
    category: 'Foundation Model API',
    modelFamiliesUsed: ['Claude 3.5 Sonnet', 'Claude 3 Haiku', 'Amazon Titan v2'],
    businessOwner: 'Data Science & Platform Engineering',
    contactEmail: 'aws-ai-compliance@amazon.com',
    contractRenewalDate: '2026-12-15',
    riskRating: 'APPROVED_FOR_PRODUCTION',
    zeroDataRetention: true,
    trainingExemptionGuaranteed: true,
    outputOwnershipConfirmed: true,
    ipIndemnificationProvided: true,
    dataResidencyOption: 'ap-southeast-1 (Singapore)',
    availabilitySla: '99.9%',
    p95LatencyGuarantee: '< 380ms',
    soc2Type2Verified: true,
    iso27001Certified: true,
    iso42001Compliant: true,
    dpaSignedDate: '2025-10-01',
    dpaDocumentRef: 'AWS-BEDROCK-DPA-2025-081',
    overallScore: 94,
    lastAuditDate: '2026-06-18',
    nextAuditDueDate: '2026-12-18',
    checkItems: [
      {
        id: 'CHK-01',
        name: 'Zero Data Retention (ZDR) Verification',
        description: 'Bedrock does not log customer content unless CloudWatch logs are explicitly enabled in customer VPC.',
        status: 'PASS',
        evidenceCitation: 'AWS Bedrock Security Documentation & VPC PrivateLink Architecture',
        verifiedAt: '2026-06-18',
        notes: 'All model inference traffic routed through private AWS VPC endpoints.'
      },
      {
        id: 'CHK-02',
        name: 'Training Data Exclusion Guarantee',
        description: 'Third-party model providers on Bedrock (Anthropic, Cohere) cannot access prompts for training.',
        status: 'PASS',
        evidenceCitation: 'AWS Service Terms Section 50.10: Data Isolation for Foundation Models',
        verifiedAt: '2026-06-18',
        notes: 'Anthropic contractual guarantee passed through AWS Marketplace.'
      },
      {
        id: 'CHK-03',
        name: 'Model Output IP & Weights Ownership',
        description: 'Customer retains full ownership of output tokens and fine-tuned adapter weights.',
        status: 'PASS',
        evidenceCitation: 'AWS Customer Agreement Section 8.2: Intellectual Property',
        verifiedAt: '2026-06-18',
        notes: 'Adapter checkpoints stored in customer KMS-encrypted S3 bucket.'
      },
      {
        id: 'CHK-04',
        name: 'Copyright & Patent Indemnification',
        description: 'Vendor indemnification for foundation model outputs.',
        status: 'PASS',
        evidenceCitation: 'AWS Generative AI IP Indemnity Coverage Terms',
        verifiedAt: '2026-06-18',
        notes: 'Standard enterprise indemnity applies.'
      },
      {
        id: 'CHK-05',
        name: 'Data Residency & Sovereign Boundary',
        description: 'Inference executed strictly in AWS Singapore region.',
        status: 'PASS',
        evidenceCitation: 'AWS Region Specification: ap-southeast-1',
        verifiedAt: '2026-06-18',
        notes: 'Cross-region model inference disabled via IAM SCP guardrails.'
      },
      {
        id: 'CHK-06',
        name: 'SLA Uptime & Latency Guarantees',
        description: '99.9% uptime SLA across availability zones.',
        status: 'PASS',
        evidenceCitation: 'AWS Bedrock Service Level Agreement',
        verifiedAt: '2026-06-18',
        notes: 'Multi-AZ deployment active.'
      },
      {
        id: 'CHK-07',
        name: 'Model Deprecation Notice SLA',
        description: 'Legacy checkpoint deprecation notifications.',
        status: 'FLAGGED',
        evidenceCitation: 'Bedrock Model Version Notice: 90-day notification timeline',
        verifiedAt: '2026-06-18',
        notes: 'Flagged for monitoring: 90 days notice requires rapid regression suite turnaround.'
      }
    ]
  },
  {
    id: 'SUP-AI-003',
    supplierName: 'OpenAI Direct API (Tier 5)',
    serviceName: 'OpenAI Direct Enterprise API',
    category: 'Foundation Model API',
    modelFamiliesUsed: ['GPT-4-Turbo', 'o1-preview', 'Whisper-large-v3'],
    businessOwner: 'R&D Innovation Lab',
    contactEmail: 'enterprise-security@openai.com',
    contractRenewalDate: '2026-10-31',
    riskRating: 'RESTRICTED_PILOT_ONLY',
    zeroDataRetention: true,
    trainingExemptionGuaranteed: true,
    outputOwnershipConfirmed: true,
    ipIndemnificationProvided: true,
    dataResidencyOption: 'US-East Default (No SG Local Inference Option)',
    availabilitySla: '99.5%',
    p95LatencyGuarantee: '< 650ms (Variable)',
    soc2Type2Verified: true,
    iso27001Certified: true,
    iso42001Compliant: false,
    dpaSignedDate: '2025-09-12',
    dpaDocumentRef: 'OAI-ENT-DPA-2025-998',
    overallScore: 78,
    lastAuditDate: '2026-05-10',
    nextAuditDueDate: '2026-11-10',
    checkItems: [
      {
        id: 'CHK-01',
        name: 'Zero Data Retention (ZDR) Verification',
        description: 'Zero Data Retention configuration on OpenAI Enterprise endpoints.',
        status: 'PASS',
        evidenceCitation: 'OpenAI Business Terms Section 3: Zero Data Retention (ZDR) Certificate',
        verifiedAt: '2026-05-10',
        notes: 'Confirmed 0-day retention flag enabled on organization API keys.'
      },
      {
        id: 'CHK-02',
        name: 'Training Data Exclusion Guarantee',
        description: 'Customer API inputs not used for training.',
        status: 'PASS',
        evidenceCitation: 'OpenAI Enterprise Privacy Policy: "We do not train on business data."',
        verifiedAt: '2026-05-10',
        notes: 'Verified.'
      },
      {
        id: 'CHK-03',
        name: 'Model Output IP & Weights Ownership',
        description: 'Customer owns completions and outputs.',
        status: 'PASS',
        evidenceCitation: 'OpenAI Terms of Use Section 3.a',
        verifiedAt: '2026-05-10',
        notes: 'Assigned to customer.'
      },
      {
        id: 'CHK-04',
        name: 'Copyright & Patent Indemnification',
        description: 'Copyright Shield protection.',
        status: 'PASS',
        evidenceCitation: 'OpenAI Copyright Shield terms for API customers',
        verifiedAt: '2026-05-10',
        notes: 'Standard indemnification.'
      },
      {
        id: 'CHK-05',
        name: 'Data Residency & Sovereign Boundary',
        description: 'Local data residency within Singapore.',
        status: 'FAIL',
        evidenceCitation: 'Inference traffic routed through US-East and EU clusters only',
        verifiedAt: '2026-05-10',
        notes: 'FAILED: Cannot host banking customer PII. Restricted to internal developer sandbox and anonymized pilot workflows.'
      },
      {
        id: 'CHK-06',
        name: 'SLA Uptime & Latency Guarantees',
        description: 'SLA uptime guarantee.',
        status: 'FLAGGED',
        evidenceCitation: 'Direct API SLA is 99.5% with no financial credit automatic reimbursement',
        verifiedAt: '2026-05-10',
        notes: 'Variable latency during peak US hours.'
      },
      {
        id: 'CHK-07',
        name: 'ISO 42001 Certification Status',
        description: 'Vendor ISO 42001 compliance certification.',
        status: 'FLAGGED',
        evidenceCitation: 'Vendor in progress for ISO 42001; SOC 2 Type II active',
        verifiedAt: '2026-05-10',
        notes: 'Requested Stage 2 certificate upon publication.'
      }
    ]
  },
  {
    id: 'SUP-AI-004',
    supplierName: 'Google Cloud Vertex AI',
    serviceName: 'GCP Vertex AI (Gemini 1.5 Pro & Multimodal Embeddings)',
    category: 'Foundation Model API',
    modelFamiliesUsed: ['Gemini 1.5 Pro', 'Gemini 1.5 Flash', 'Gecko Embedding v004'],
    businessOwner: 'Enterprise Data Lake & Analytics Team',
    contactEmail: 'cloud-compliance@google.com',
    contractRenewalDate: '2027-06-30',
    riskRating: 'APPROVED_FOR_PRODUCTION',
    zeroDataRetention: true,
    trainingExemptionGuaranteed: true,
    outputOwnershipConfirmed: true,
    ipIndemnificationProvided: true,
    dataResidencyOption: 'asia-southeast1 (Jurong West, Singapore)',
    availabilitySla: '99.95%',
    p95LatencyGuarantee: '< 290ms',
    soc2Type2Verified: true,
    iso27001Certified: true,
    iso42001Compliant: true,
    dpaSignedDate: '2026-01-20',
    dpaDocumentRef: 'GCP-VERTEX-DPA-2026-SG-01',
    overallScore: 97,
    lastAuditDate: '2026-08-05',
    nextAuditDueDate: '2027-02-05',
    checkItems: [
      {
        id: 'CHK-01',
        name: 'Zero Data Retention (ZDR) Verification',
        description: 'Zero data logging on Vertex AI customer calls.',
        status: 'PASS',
        evidenceCitation: 'Google Cloud Data Governance & Vertex AI Security Whitepaper',
        verifiedAt: '2026-08-05',
        notes: 'Customer data is processed in ephemeral memory and discarded upon token stream completion.'
      },
      {
        id: 'CHK-02',
        name: 'Training Data Exclusion Guarantee',
        description: 'Contractual guarantee that customer prompts are not used to train Gemini models.',
        status: 'PASS',
        evidenceCitation: 'Google Cloud Terms: "Your data is not used to train Google models without permission."',
        verifiedAt: '2026-08-05',
        notes: 'Confirmed in Master Services Agreement.'
      },
      {
        id: 'CHK-03',
        name: 'Model Output IP & Weights Ownership',
        description: 'Customer owns all generated output and fine-tuned LoRA adapters.',
        status: 'PASS',
        evidenceCitation: 'Google Cloud Service Specific Terms: Generative AI Intellectual Property',
        verifiedAt: '2026-08-05',
        notes: 'Customer holds all commercial rights.'
      },
      {
        id: 'CHK-04',
        name: 'Copyright & Patent Indemnification',
        description: 'Comprehensive Generative AI Indemnification.',
        status: 'PASS',
        evidenceCitation: 'Google Cloud Generative AI Indemnification Program (Uncapped)',
        verifiedAt: '2026-08-05',
        notes: 'Covers training data and generated output claims.'
      },
      {
        id: 'CHK-05',
        name: 'Data Residency & Sovereign Boundary',
        description: 'Local processing inside Singapore Jurong West data center.',
        status: 'PASS',
        evidenceCitation: 'GCP Region: asia-southeast1 (Singapore)',
        verifiedAt: '2026-08-05',
        notes: 'All compute and storage localized.'
      },
      {
        id: 'CHK-06',
        name: 'SLA Uptime & Latency Guarantees',
        description: '99.95% availability SLA with sub-300ms p95 latency.',
        status: 'PASS',
        evidenceCitation: 'Vertex AI Service Level Agreement',
        verifiedAt: '2026-08-05',
        notes: 'Exceeds financial services requirements.'
      },
      {
        id: 'CHK-07',
        name: 'ISO 42001 Certification Status',
        description: 'ISO/IEC 42001:2023 certified infrastructure.',
        status: 'PASS',
        evidenceCitation: 'Google Cloud ISO/IEC 42001:2023 Certificate (BSI)',
        verifiedAt: '2026-08-05',
        notes: 'Audited and verified by BSI.'
      }
    ]
  }
];
