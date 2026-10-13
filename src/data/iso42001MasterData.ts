// Authoritative Master Data Registry for ISO/IEC 42001:2023
// Artificial Intelligence Management System (AIMS)
import { ControlItem } from '../types';
import { FrameworkDomain, RegulatoryRequirement, CrossFrameworkMappingRule } from '../types/regulatoryTypes';

export interface ISO42001ClauseItem {
  clauseNumber: string;
  title: string;
  subClauses: { code: string; title: string; requirement: string; guidance: string; auditCheck: string }[];
  complianceStatus: 'Compliant' | 'In Progress' | 'Action Required';
}

export const MASTER_ISO42001_CONTROLS: Omit<ControlItem, 'id'>[] = [
  // A.2 Policies related to AI
  {
    controlCode: 'A.2.1',
    title: 'AI Policy',
    category: 'AI Policies',
    framework: 'ISO/IEC 42001:2023',
    description: 'The organization shall define and maintain an AI policy that is appropriate to the purpose of the organization and provides a framework for setting AI objectives and aligns with its ethical principles and risk appetite.',
    guidance: 'Develop an enterprise Responsible AI Policy covering transparency, fairness, safety, accountability, human oversight, and data privacy. Ensure C-level endorsement and annual review.',
    applicable: true,
    justification: 'Mandatory foundational policy establishing organizational AI governance and ethical constraints.',
    maturityLevel: 4,
    responsibleDepartment: 'Information Security & Compliance',
    evidenceRequirements: ['Approved Responsible AI Policy v1.0', 'Executive Board / CISO Approval Minutes', 'Workforce AI Policy Acknowledgement Log'],
    collectionFrequency: 'Annual',
    acceptanceCriteria: 'Signed AI policy document by executive leadership, covering all in-scope AI and ML initiatives with >95% workforce acknowledgment.',
    implementationStatus: 'Implemented'
  },
  {
    controlCode: 'A.2.2',
    title: 'Alignment with other organizational policies',
    category: 'AI Policies',
    framework: 'ISO/IEC 42001:2023',
    description: 'The organization shall ensure that the AI policy is aligned and integrated with existing organizational policies, including information security (ISO 27001), privacy, data governance, and risk management.',
    guidance: 'Cross-reference the AI Policy with ISMS (A.5.1), Data Classification (A.5.12), and Privacy Policies to ensure consistent classification of training data and AI outputs.',
    applicable: true,
    justification: 'Prevents governance silos between AI engineering, cybersecurity, and regulatory compliance.',
    maturityLevel: 4,
    responsibleDepartment: 'Legal & Regulatory Affairs',
    evidenceRequirements: ['Policy Interoperability Matrix', 'Joint ISMS & AIMS Steering Committee Charter'],
    collectionFrequency: 'Annual',
    acceptanceCriteria: 'Formal cross-policy harmonization sign-off by CISO and Data Protection Officer.',
    implementationStatus: 'Implemented'
  },

  // A.3 Internal organization
  {
    controlCode: 'A.3.1',
    title: 'AI roles and responsibilities',
    category: 'AI Organization',
    framework: 'ISO/IEC 42001:2023',
    description: 'Roles and responsibilities for the AI management system and AI system life cycle shall be defined, documented, and allocated according to the organization needs.',
    guidance: 'Establish clear roles including AI System Owner, Lead ML Engineer, Data Steward, AI Ethics Officer, and AI Risk Assessor in job descriptions and RACI charts.',
    applicable: true,
    justification: 'Ensures operational accountability across the entire machine learning lifecycle.',
    maturityLevel: 4,
    responsibleDepartment: 'Human Resources & People Ops',
    evidenceRequirements: ['AIMS RACI Matrix', 'Job Descriptions with AI Governance Duties', 'AI Ethics Board Terms of Reference'],
    collectionFrequency: 'Annual',
    acceptanceCriteria: 'Published RACI matrix covering AI system design, training data curation, deployment approval, and model retirement.',
    implementationStatus: 'Implemented'
  },
  {
    controlCode: 'A.3.2',
    title: 'Reporting of concerns and AI safety incidents',
    category: 'AI Organization',
    framework: 'ISO/IEC 42001:2023',
    description: 'A process shall be established for internal personnel and external parties to report concerns, unintended behaviors, biases, or safety incidents related to AI systems.',
    guidance: 'Implement a dedicated AI Whistleblowing / Safety reporting channel and integrate with the corporate incident management ticketing system.',
    applicable: true,
    justification: 'Ensures prompt detection and escalation of model hallucination, bias, or safety anomalies.',
    maturityLevel: 3,
    responsibleDepartment: 'Information Security & Compliance',
    evidenceRequirements: ['AI Incident Reporting Channel SOP', 'Anonymous AI Safety Incident Portal URL', 'Quarterly AI Concern Triage Log'],
    collectionFrequency: 'Quarterly',
    acceptanceCriteria: 'Documented intake portal with 24-hour SLA for triage of High-severity AI safety incidents.',
    implementationStatus: 'Implemented'
  },

  // A.4 Resources for AI systems
  {
    controlCode: 'A.4.1',
    title: 'AI system resources & infrastructure',
    category: 'AI Resources',
    framework: 'ISO/IEC 42001:2023',
    description: 'The organization shall determine and provide the necessary computing resources, infrastructure, specialized hardware (e.g. GPUs, TPUs), and tooling for the effective operation and governance of AI systems.',
    guidance: 'Maintain inventory of GPU clusters, cloud AI services (AWS Bedrock, Azure OpenAI, GCP Vertex AI), model registries, and data pipelines with capacity monitoring.',
    applicable: true,
    justification: 'Ensures computational stability, cost predictability, and availability of AI training and inference pipelines.',
    maturityLevel: 4,
    responsibleDepartment: 'Software Engineering & DevOps',
    evidenceRequirements: ['AI Infrastructure & GPU Inventory', 'Cloud Compute Architecture Diagram', 'Compute Capacity & Auto-Scaling Benchmark'],
    collectionFrequency: 'Quarterly',
    acceptanceCriteria: '100% of production AI workloads hosted on managed infrastructure with high availability and automated failover.',
    implementationStatus: 'Implemented'
  },
  {
    controlCode: 'A.4.2',
    title: 'Competence of AI personnel',
    category: 'AI Resources',
    framework: 'ISO/IEC 42001:2023',
    description: 'The organization shall ensure that personnel involved in developing, deploying, or operating AI systems possess the necessary education, training, and technical competence.',
    guidance: 'Conduct mandatory training on Prompt Engineering safety, AI ethics, bias detection techniques (Fairlearn, SHAP), and OWASP Top 10 for LLMs.',
    applicable: true,
    justification: 'Prevents dangerous AI implementation practices arising from workforce skill deficiencies.',
    maturityLevel: 4,
    responsibleDepartment: 'Human Resources & People Ops',
    evidenceRequirements: ['AI Training Curriculum & Syllabus', 'Data Science Team Certification Records', 'Annual LLM Security & Ethics Assessment Roster'],
    collectionFrequency: 'Bi-Annual',
    acceptanceCriteria: '100% of data scientists and ML engineers completed certified AI safety and ethics training modules.',
    implementationStatus: 'Implemented'
  },

  // A.5 Assessing impacts of AI systems
  {
    controlCode: 'A.5.1',
    title: 'AI system impact assessment (AI-SIA)',
    category: 'AI Impact Assessment',
    framework: 'ISO/IEC 42001:2023',
    description: 'The organization shall establish and implement a formal process for assessing the potential impacts of AI systems on individuals, groups, society, safety, human rights, and business operations.',
    guidance: 'Execute an AI-SIA prior to developing or acquiring any AI system. Evaluate societal harm, differential bias, privacy intrusion, and safety hazards.',
    applicable: true,
    justification: 'Crucial requirement for identifying and mitigating negative ethical and human rights outcomes.',
    maturityLevel: 4,
    responsibleDepartment: 'Information Security & Compliance',
    evidenceRequirements: ['AI-SIA Standard Operating Procedure', 'Completed AI Impact Assessment Reports for In-Scope Models', 'AI Risk Matrix'],
    collectionFrequency: 'Quarterly',
    acceptanceCriteria: '100% of deployed AI models have a signed AI-SIA report approved by the AI Ethics Board prior to production rollout.',
    implementationStatus: 'Implemented'
  },
  {
    controlCode: 'A.5.2',
    title: 'Assessment of continuous and cumulative AI impacts',
    category: 'AI Impact Assessment',
    framework: 'ISO/IEC 42001:2023',
    description: 'The organization shall monitor and re-evaluate the cumulative and long-term societal and ethical impacts of AI systems throughout their operational lifecycle.',
    guidance: 'Establish periodic review triggers when models are retrained, fine-tuned, or when data distribution shifts significantly (covariate shift).',
    applicable: true,
    justification: 'Prevents insidious degradation of model fairness and unintended behavioral drift over time.',
    maturityLevel: 3,
    responsibleDepartment: 'Data Science & AI Engineering',
    evidenceRequirements: ['Model Retraining Review Records', 'Longitudinal Fairness & Demographic Parity Reports'],
    collectionFrequency: 'Quarterly',
    acceptanceCriteria: 'Automated drift detection alerts configured with scheduled quarterly impact re-evaluations.',
    implementationStatus: 'Implemented'
  },

  // A.6 AI system life cycle
  {
    controlCode: 'A.6.1',
    title: 'AI system conception and specification',
    category: 'AI Lifecycle',
    framework: 'ISO/IEC 42001:2023',
    description: 'Requirements for AI systems, including intended use, target performance metrics, operational constraints, and unacceptable use cases, shall be specified and documented.',
    guidance: 'Draft formal AI System Requirement Specifications (SRS) documenting purpose, input modalities, confidence thresholds, and boundary constraints.',
    applicable: true,
    justification: 'Prevents mission creep and undefined model application scope.',
    maturityLevel: 4,
    responsibleDepartment: 'Software Engineering & DevOps',
    evidenceRequirements: ['AI System Requirement Specification Documents', 'Model Card Baseline Specification v1.0', 'Acceptable Use Boundaries Statement'],
    collectionFrequency: 'Quarterly',
    acceptanceCriteria: 'Documented SRS with defined accuracy, precision, recall, and latency targets for each production model.',
    implementationStatus: 'Implemented'
  },
  {
    controlCode: 'A.6.2',
    title: 'AI system design and development',
    category: 'AI Lifecycle',
    framework: 'ISO/IEC 42001:2023',
    description: 'AI systems shall be designed and developed using documented methodologies, version-controlled architecture, reproducible pipelines, and robust security controls.',
    guidance: 'Enforce MLOps pipelines (MLflow, Kubeflow, Weights & Biases) with strict artifact versioning for code, model weights, and hyperparameters.',
    applicable: true,
    justification: 'Ensures reproducibility, traceability, and defensibility of model training processes.',
    maturityLevel: 4,
    responsibleDepartment: 'Data Science & AI Engineering',
    evidenceRequirements: ['MLOps Pipeline Architecture Specification', 'Git & Model Registry Commit History', 'Hyperparameter Tuning & Checkpoint Logs'],
    collectionFrequency: 'Monthly',
    acceptanceCriteria: '100% of model artifacts tracked in immutable registry with cryptographic SHA-256 weight hashes.',
    implementationStatus: 'Implemented'
  },
  {
    controlCode: 'A.6.3',
    title: 'AI system verification and validation (V&V)',
    category: 'AI Lifecycle',
    framework: 'ISO/IEC 42001:2023',
    description: 'AI systems shall undergo rigorous verification and validation testing against representative test datasets, adversarial inputs, edge cases, and red-teaming simulations.',
    guidance: 'Conduct automated test suites measuring F1-score, robustness against adversarial perturbation, red-teaming prompt injection attacks, and toxicity benchmarks.',
    applicable: true,
    justification: 'Guarantees that AI models meet safety, security, and performance criteria prior to user exposure.',
    maturityLevel: 4,
    responsibleDepartment: 'Quality Assurance & Governance',
    evidenceRequirements: ['Model Validation Test Reports', 'Adversarial Robustness & Red-Team Assessment Attestation', 'Automated QA Test Roster'],
    collectionFrequency: 'Quarterly',
    acceptanceCriteria: 'Passed red-teaming test suite with zero high-confidence jailbreak exploits and verified benchmark validation.',
    implementationStatus: 'Implemented'
  },
  {
    controlCode: 'A.6.4',
    title: 'AI system deployment and operational monitoring',
    category: 'AI Lifecycle',
    framework: 'ISO/IEC 42001:2023',
    description: 'Procedures for deploying AI systems into production and continuously monitoring inference latency, prediction accuracy, model drift, and system health shall be implemented.',
    guidance: 'Deploy model monitoring tools (Evidently AI, Prometheus/Grafana) with real-time telemetry for latency, error rates, and distribution divergence.',
    applicable: true,
    justification: 'Maintains production operational integrity and early warning against model degradation.',
    maturityLevel: 4,
    responsibleDepartment: 'Software Engineering & DevOps',
    evidenceRequirements: ['Production Model Telemetry Dashboard Export', 'Model Drift Alert Configuration Logs', 'Inference SLA Performance Reports'],
    collectionFrequency: 'Monthly',
    acceptanceCriteria: 'Real-time observability dashboard active with automated P99 latency alerts < 350ms and drift alerts configured.',
    implementationStatus: 'Implemented'
  },
  {
    controlCode: 'A.6.5',
    title: 'AI system decommissioning and retirement',
    category: 'AI Lifecycle',
    framework: 'ISO/IEC 42001:2023',
    description: 'The organization shall establish procedures for safely decommissioning AI systems, archiving model weights, sanitizing training datasets, and notifying dependent stakeholders.',
    guidance: 'Define sunset workflows including graceful fallback to rule-based systems or newer model versions, and permanent secure deletion of deprecated weights.',
    applicable: true,
    justification: 'Prevents zombie models and deprecated inference endpoints from operating unmonitored.',
    maturityLevel: 3,
    responsibleDepartment: 'Data Science & AI Engineering',
    evidenceRequirements: ['Model Decommissioning SOP', 'Retired Model Archive Log', 'Data Sanitization Certificates'],
    collectionFrequency: 'Annual',
    acceptanceCriteria: 'Documented sign-off from AI System Owner and CISO for all retired machine learning endpoints.',
    implementationStatus: 'Implemented'
  },

  // A.7 Data for AI systems
  {
    controlCode: 'A.7.1',
    title: 'AI data acquisition and provenance',
    category: 'AI Data Governance',
    framework: 'ISO/IEC 42001:2023',
    description: 'The organization shall establish processes to verify the source, legal ownership, copyright, licensing terms, and consent mechanisms for all data acquired for AI training.',
    guidance: 'Maintain a Data Lineage & Provenance Register documenting origins, scraping permits, open-source licenses, and customer consent agreements.',
    applicable: true,
    justification: 'Mitigates legal copyright infringement, unlicensed data scraping liability, and regulatory non-compliance.',
    maturityLevel: 4,
    responsibleDepartment: 'Legal & Regulatory Affairs',
    evidenceRequirements: ['Data Lineage & Provenance Register', 'Third-Party Data Licensing Agreements', 'GDPR/PDPA Consent Audit Logs'],
    collectionFrequency: 'Quarterly',
    acceptanceCriteria: '100% of training datasets have verified legal rights and documented provenance records.',
    implementationStatus: 'Implemented'
  },
  {
    controlCode: 'A.7.2',
    title: 'Data quality for AI systems',
    category: 'AI Data Governance',
    framework: 'ISO/IEC 42001:2023',
    description: 'Data used for training, fine-tuning, validation, and testing of AI systems shall meet defined quality criteria, including accuracy, completeness, timeliness, and relevance.',
    guidance: 'Execute automated data validation pipelines (Great Expectations) checking for missing values, label noise, duplicate records, and schema anomalies.',
    applicable: true,
    justification: 'High-quality training data is the prerequisite for reliable and generalizable model inferences.',
    maturityLevel: 4,
    responsibleDepartment: 'Data Science & AI Engineering',
    evidenceRequirements: ['Data Quality Pipeline Test Runs', 'Automated Great Expectations Validation Reports', 'Dataset Cleansing Audit Trail'],
    collectionFrequency: 'Monthly',
    acceptanceCriteria: 'Data quality score > 98% with zero critical schema mismatch errors in production data pipelines.',
    implementationStatus: 'Implemented'
  },
  {
    controlCode: 'A.7.3',
    title: 'Bias detection and mitigation in AI data',
    category: 'AI Data Governance',
    framework: 'ISO/IEC 42001:2023',
    description: 'The organization shall analyze training and validation data for unintended statistical biases, historical disparities, and demographic skew, applying mitigation techniques where appropriate.',
    guidance: 'Use open-source bias profiling tools (AIF360, Fairlearn) to calculate disparate impact ratios across protected attributes (gender, age, race, region).',
    applicable: true,
    justification: 'Prevents unfair discrimination, reputational damage, and violation of anti-discrimination laws.',
    maturityLevel: 4,
    responsibleDepartment: 'Information Security & Compliance',
    evidenceRequirements: ['Data Bias Assessment Reports', 'Disparate Impact Ratio Analysis Table', 'Data Re-balancing / Synthetic Augmentation Log'],
    collectionFrequency: 'Quarterly',
    acceptanceCriteria: 'Disparate Impact Ratio between 0.80 and 1.25 across all legally protected demographic classes.',
    implementationStatus: 'Implemented'
  },
  {
    controlCode: 'A.7.4',
    title: 'Data privacy and protection in AI systems',
    category: 'AI Data Governance',
    framework: 'ISO/IEC 42001:2023',
    description: 'Appropriate privacy-preserving techniques (e.g. differential privacy, pseudonymization, redaction, k-anonymity) shall be applied to prevent PII exposure in model training.',
    guidance: 'Deploy automated PII detection & masking pipelines (Microsoft Presidio) to strip email addresses, names, and credit card numbers before model ingestion.',
    applicable: true,
    justification: 'Protects personal data against model memorization and extraction attacks.',
    maturityLevel: 4,
    responsibleDepartment: 'Information Security & Compliance',
    evidenceRequirements: ['PII Scrubbing Pipeline Architecture & Logs', 'Differential Privacy Parameter Epsilon Configuration', 'Privacy Impact Assessment (DPIA)'],
    collectionFrequency: 'Monthly',
    acceptanceCriteria: 'Zero raw unmasked PII records stored in training vector stores or model fine-tuning caches.',
    implementationStatus: 'Implemented'
  },

  // A.8 Information for interested parties
  {
    controlCode: 'A.8.1',
    title: 'AI system transparency and disclosures',
    category: 'Transparency & Explainability',
    framework: 'ISO/IEC 42001:2023',
    description: 'The organization shall provide clear and accessible information to users and interested parties disclosing that they are interacting with an AI system and explaining its capabilities and limitations.',
    guidance: 'Implement UI disclaimers (e.g., "Generated by AI Assistant"), published Model Cards, and explicit terms of service acknowledging algorithmic decision assistance.',
    applicable: true,
    justification: 'Required by global AI transparency regulations (EU AI Act, FTC guidelines, PDPA Advisory).',
    maturityLevel: 4,
    responsibleDepartment: 'Product Management & UX',
    evidenceRequirements: ['User Interface AI Disclosure Screenshots', 'Published Public Model Cards', 'Consumer Terms of Service AI Addendum'],
    collectionFrequency: 'Bi-Annual',
    acceptanceCriteria: '100% of customer-facing AI features clearly labeled with explicit AI interaction indicator.',
    implementationStatus: 'Implemented'
  },
  {
    controlCode: 'A.8.2',
    title: 'AI system explainability and interpretability',
    category: 'Transparency & Explainability',
    framework: 'ISO/IEC 42001:2023',
    description: 'The organization shall provide appropriate explanations for significant AI decisions, especially those affecting legal, financial, or employment outcomes of individuals.',
    guidance: 'Incorporate explainability tools (SHAP values, LIME, attention heatmaps) allowing customer support and compliance officers to explain algorithmic credit/risk scoring.',
    applicable: true,
    justification: 'Ensures procedural fairness and fulfills the user right to an explanation under modern privacy and banking regulations.',
    maturityLevel: 3,
    responsibleDepartment: 'Data Science & AI Engineering',
    evidenceRequirements: ['Model Explainability Technical Specification', 'Sample SHAP/LIME Decision Explanations', 'Customer Algorithmic Inquiry SOP'],
    collectionFrequency: 'Quarterly',
    acceptanceCriteria: 'Capability to generate human-interpretable feature contribution reports for 100% of high-impact automated decisions.',
    implementationStatus: 'Implemented'
  },

  // A.9 Use of AI systems
  {
    controlCode: 'A.9.1',
    title: 'Responsible and intended use of AI systems',
    category: 'Responsible AI Use',
    framework: 'ISO/IEC 42001:2023',
    description: 'The organization shall establish controls and guidelines to ensure that AI systems are operated only within their designated scope of use and defined operational constraints.',
    guidance: 'Deploy guardrail systems (NeMo Guardrails, Llama Guard) to filter out of scope user prompts, illicit requests, and hazardous system instructions.',
    applicable: true,
    justification: 'Prevents unauthorized misuse of company AI infrastructure for prohibited or malicious tasks.',
    maturityLevel: 4,
    responsibleDepartment: 'Software Engineering & DevOps',
    evidenceRequirements: ['AI Guardrail Configuration Files', 'Prompt Moderation Filter Logs', 'Prohibited Use Policy Documentation'],
    collectionFrequency: 'Monthly',
    acceptanceCriteria: 'Production guardrails active with zero bypass of prohibited high-risk categories.',
    implementationStatus: 'Implemented'
  },
  {
    controlCode: 'A.9.2',
    title: 'Human oversight and Human-in-the-Loop (HITL)',
    category: 'Responsible AI Use',
    framework: 'ISO/IEC 42001:2023',
    description: 'The organization shall determine and implement appropriate levels of human oversight (Human-in-the-loop, Human-on-the-loop, Human-in-command) based on AI system risk level.',
    guidance: 'Enforce mandatory human approval for financial transactions over threshold, credit denials, or security isolation actions generated by AI models.',
    applicable: true,
    justification: 'Mitigates autonomous error propagation and prevents unchecked catastrophic model failure.',
    maturityLevel: 4,
    responsibleDepartment: 'Operations & Business Continuity',
    evidenceRequirements: ['HITL Threshold Architecture Specification', 'Human Reviewer Approval Ledger', 'Manual Override Audit Trail'],
    collectionFrequency: 'Quarterly',
    acceptanceCriteria: '100% of High-Risk / Material impact decisions require explicit authenticated human sign-off.',
    implementationStatus: 'Implemented'
  },
  {
    controlCode: 'A.9.3',
    title: 'Mitigation of automation bias',
    category: 'Responsible AI Use',
    framework: 'ISO/IEC 42001:2023',
    description: 'The organization shall train operators and human reviewers to identify and avoid automation bias (uncritically trusting AI recommendations without independent verification).',
    guidance: 'Conduct scenario-based training for operators highlighting confidence score interpretations and common AI failure modes.',
    applicable: true,
    justification: 'Ensures human reviewers remain critical evaluators rather than rubber-stampers.',
    maturityLevel: 3,
    responsibleDepartment: 'Human Resources & People Ops',
    evidenceRequirements: ['Operator Training Roster on Automation Bias', 'Human Reviewer Disagreement / Correction Rate Metrics'],
    collectionFrequency: 'Bi-Annual',
    acceptanceCriteria: 'Periodic audit of human reviewer override rates to verify active critical review.',
    implementationStatus: 'Implemented'
  },

  // A.10 Third-party and customer relationships
  {
    controlCode: 'A.10.1',
    title: 'Supplier AI models and third-party APIs',
    category: 'AI Third-Party Risk',
    framework: 'ISO/IEC 42001:2023',
    description: 'The organization shall evaluate, select, and monitor third-party AI suppliers, foundational model providers (OpenAI, Anthropic, Google), and external ML libraries.',
    guidance: 'Include AI security and data privacy addenda in vendor contracts (zero-data-retention for training, SLA guarantees, model change notices).',
    applicable: true,
    justification: 'Mitigates supply chain vulnerabilities and unauthorized leakage of proprietary data into foundational models.',
    maturityLevel: 4,
    responsibleDepartment: 'Procurement & Vendor Management',
    evidenceRequirements: ['AI Vendor Due Diligence Questionnaires', 'Cloud AI Data Processing Agreements (Zero-Data Retention)', 'Third-Party AI Risk Assessment Matrix'],
    collectionFrequency: 'Quarterly',
    acceptanceCriteria: '100% of commercial AI API vendors have signed agreements guaranteeing that customer inputs are not used for model training.',
    implementationStatus: 'Implemented'
  },
  {
    controlCode: 'A.10.2',
    title: 'Customer and interested party expectations',
    category: 'AI Third-Party Risk',
    framework: 'ISO/IEC 42001:2023',
    description: 'The organization shall understand and address customer expectations, contractual commitments, and regulatory requirements regarding AI governance.',
    guidance: 'Provide enterprise customers with AI Security Whitepapers, SOC 2 / ISO 42001 audit bridge letters, and AI-SIA summary sheets.',
    applicable: true,
    justification: 'Fosters customer trust and accelerates enterprise compliance review cycles.',
    maturityLevel: 4,
    responsibleDepartment: 'Sales & Enterprise Accounts',
    evidenceRequirements: ['Enterprise AI Trust Portal Pack', 'Standard Customer AI Security FAQs', 'Customer AI Audit Request Log'],
    collectionFrequency: 'Annual',
    acceptanceCriteria: 'Published AI Trust Center pack available for enterprise customer audit due diligence.',
    implementationStatus: 'Implemented'
  }
];

export const ISO42001_CLAUSES_4_10: ISO42001ClauseItem[] = [
  {
    clauseNumber: '4',
    title: 'Context of the Organization',
    complianceStatus: 'Compliant',
    subClauses: [
      {
        code: '4.1',
        title: 'Understanding the organization and its context',
        requirement: 'Determine internal and external issues relevant to AI development, deployment, and operation.',
        guidance: 'Document legal, ethical, technological, and market factors affecting AI systems.',
        auditCheck: 'Does the organization maintain an up-to-date AI context analysis document?'
      },
      {
        code: '4.2',
        title: 'Understanding needs and expectations of interested parties',
        requirement: 'Identify interested parties (end users, regulators, data subjects) and their AI governance requirements.',
        guidance: 'Maintain an AI Stakeholder Expectation Matrix including transparency, safety, and privacy.',
        auditCheck: 'Are stakeholder requirements linked to operational AI controls?'
      },
      {
        code: '4.3',
        title: 'Determining the scope of the AIMS',
        requirement: 'Establish the boundaries and applicability of the Artificial Intelligence Management System.',
        guidance: 'Explicitly specify whether the organization acts as AI Provider, AI Deployer, or AI User.',
        auditCheck: 'Is the AIMS scope statement formally approved and published?'
      },
      {
        code: '4.4',
        title: 'Artificial Intelligence Management System',
        requirement: 'Establish, implement, maintain, and continually improve the AIMS according to ISO 42001.',
        guidance: 'Integrate AIMS processes with enterprise governance and the ISMS (ISO 27001).',
        auditCheck: 'Are AIMS processes reviewed at scheduled management intervals?'
      }
    ]
  },
  {
    clauseNumber: '5',
    title: 'Leadership & AI Governance',
    complianceStatus: 'Compliant',
    subClauses: [
      {
        code: '5.1',
        title: 'Leadership and commitment',
        requirement: 'Top management shall demonstrate leadership and commitment with respect to the AIMS and ethical AI principles.',
        guidance: 'Executive leadership must allocate necessary budget, approve AI policies, and promote a culture of ethical AI.',
        auditCheck: 'Are board minutes and executive signatures present on the AI governance charter?'
      },
      {
        code: '5.2',
        title: 'AI Policy',
        requirement: 'Top management shall establish an AI policy appropriate to the organization purpose.',
        guidance: 'Policy must commit to satisfying applicable requirements and continual improvement.',
        auditCheck: 'Has the AI Policy been communicated and acknowledged by workforce personnel?'
      },
      {
        code: '5.3',
        title: 'Organizational roles, responsibilities and authorities',
        requirement: 'Assign and communicate responsibilities for AI system lifecycle, ethics, and compliance.',
        guidance: 'Appoint an AI Ethics Committee or designated AI Safety Officer with formal escalation authority.',
        auditCheck: 'Are AI roles clearly documented in job descriptions and RACI charts?'
      }
    ]
  },
  {
    clauseNumber: '6',
    title: 'Planning, AI Risk & Impact Assessment',
    complianceStatus: 'Compliant',
    subClauses: [
      {
        code: '6.1',
        title: 'Actions to address risks and opportunities',
        requirement: 'Define and apply an AI risk assessment process that identifies threats specific to machine learning and algorithmic systems.',
        guidance: 'Evaluate adversarial attacks, hallucination, data poisoning, privacy leakage, and regulatory non-compliance.',
        auditCheck: 'Is an AI risk register maintained with quantitative likelihood and impact scoring?'
      },
      {
        code: '6.1.2',
        title: 'AI System Impact Assessment (AI-SIA)',
        requirement: 'Perform formal impact assessments evaluating consequences on individuals, human rights, fairness, and society.',
        guidance: 'Conduct AI-SIA for high-impact models prior to production release, documenting mitigation measures.',
        auditCheck: 'Are signed AI-SIA documents archived for all active machine learning models?'
      },
      {
        code: '6.2',
        title: 'AI objectives and planning to achieve them',
        requirement: 'Establish measurable AI objectives at relevant functions and levels.',
        guidance: 'Set targets for model fairness (e.g. Disparate Impact > 0.85), inference latency, and data privacy compliance.',
        auditCheck: 'Are AI performance and governance objectives tracked quarterly?'
      }
    ]
  },
  {
    clauseNumber: '7',
    title: 'Support, Compute & Competence',
    complianceStatus: 'Compliant',
    subClauses: [
      {
        code: '7.1',
        title: 'Resources & Infrastructure',
        requirement: 'Provide resources for establishing, implementing, maintaining, and improving the AIMS.',
        guidance: 'Provision secure cloud GPU infrastructure, model registries, and data management tooling.',
        auditCheck: 'Is infrastructure capacity and compute cost monitored for AI workloads?'
      },
      {
        code: '7.2',
        title: 'Competence',
        requirement: 'Ensure personnel handling AI systems are competent on the basis of education, training, or experience.',
        guidance: 'Conduct specialized training in ethical AI, prompt engineering safety, and ML security.',
        auditCheck: 'Are training logs and competency evaluations archived for all data engineers and scientists?'
      },
      {
        code: '7.5',
        title: 'Documented information',
        requirement: 'Maintain documented information required by ISO 42001, including model cards and dataset metadata.',
        guidance: 'Enforce version control for policies, model architectures, and training datasets.',
        auditCheck: 'Is documentation protected from unauthorized modification and backed up?'
      }
    ]
  },
  {
    clauseNumber: '8',
    title: 'Operation & AI Lifecycle Controls',
    complianceStatus: 'Compliant',
    subClauses: [
      {
        code: '8.1',
        title: 'Operational planning and control',
        requirement: 'Plan, implement, and control the processes needed to meet AI requirements and implement Clause 6 actions.',
        guidance: 'Establish criteria for AI lifecycle stages: data acquisition, preprocessing, training, validation, and release.',
        auditCheck: 'Are release gate criteria verified before promoting models to production?'
      },
      {
        code: '8.2',
        title: 'AI risk assessment execution',
        requirement: 'Perform AI risk assessments at planned intervals or when significant system changes occur.',
        guidance: 'Re-assess risks when fine-tuning models on new datasets or deploying to new geographic markets.',
        auditCheck: 'Are change requests accompanied by updated risk evaluations?'
      },
      {
        code: '8.4',
        title: 'AI system impact assessment execution',
        requirement: 'Execute AI impact assessments continuously throughout operational deployment.',
        guidance: 'Monitor real-world feedback and user incident reports for unexpected negative impacts.',
        auditCheck: 'Are impact reviews conducted following major model retraining cycles?'
      }
    ]
  },
  {
    clauseNumber: '9',
    title: 'Performance Evaluation & Model Auditing',
    complianceStatus: 'Compliant',
    subClauses: [
      {
        code: '9.1',
        title: 'Monitoring, measurement, analysis and evaluation',
        requirement: 'Monitor and measure AI system performance, fairness metrics, drift, and control effectiveness.',
        guidance: 'Track real-time telemetry for accuracy, drift, latency, and false positive rates.',
        auditCheck: 'Are automated telemetry dashboards accessible to risk and compliance teams?'
      },
      {
        code: '9.2',
        title: 'Internal audit',
        requirement: 'Conduct internal audits at planned intervals to verify AIMS conformity with ISO 42001.',
        guidance: 'Audit data pipelines, model registries, guardrails, and third-party AI APIs.',
        auditCheck: 'Is an annual AIMS internal audit report with audit findings documented?'
      },
      {
        code: '9.3',
        title: 'Management review',
        requirement: 'Top management shall review the organization AIMS at planned intervals.',
        guidance: 'Review AI incidents, model performance, audit findings, and regulatory changes.',
        auditCheck: 'Are formal management review minutes signed by executive leadership?'
      }
    ]
  },
  {
    clauseNumber: '10',
    title: 'Improvement & AI Incident CAPA',
    complianceStatus: 'Compliant',
    subClauses: [
      {
        code: '10.1',
        title: 'Nonconformity and corrective action',
        requirement: 'React to AI nonconformities, model hallucinations, or safety failures, taking corrective action to eliminate root causes.',
        guidance: 'Execute 5-Whys root cause analysis, model retraining, or prompt guardrail patching.',
        auditCheck: 'Are AI incident CAPA records tracked through verified closure?'
      },
      {
        code: '10.2',
        title: 'Continual improvement',
        requirement: 'Continually improve the suitability, adequacy, and effectiveness of the AIMS.',
        guidance: 'Adopt emerging AI safety benchmarks, state-of-the-art red-teaming, and updated regulatory guidance.',
        auditCheck: 'Are continual improvement initiatives documented and executed annually?'
      }
    ]
  }
];

export const ISO42001_CROSS_MAPPINGS: CrossFrameworkMappingRule[] = [
  {
    id: 'MAP-AI-01',
    sourceFramework: 'ISO/IEC 42001:2023',
    sourceRequirementCode: 'A.2.1',
    sourceRequirementTitle: 'AI Policy',
    targetFramework: 'ISO/IEC 27001:2022',
    targetControlOrClauseCode: 'A.5.1',
    targetTitle: 'Policies for information security',
    mappingType: 'SUPERSET',
    confidenceScore: 94,
    justificationNotes: 'ISO 42001 AI Policy builds directly upon ISO 27001 A.5.1 information security policy governance structure.',
    humanVerified: true,
    verifiedBy: 'Elena Rostova, Lead Auditor',
    evidenceReusability: 'DIRECT_REUSE'
  },
  {
    id: 'MAP-AI-02',
    sourceFramework: 'ISO/IEC 42001:2023',
    sourceRequirementCode: 'A.7.4',
    sourceRequirementTitle: 'Data privacy and protection in AI systems',
    targetFramework: 'ISO/IEC 27001:2022',
    targetControlOrClauseCode: 'A.8.11',
    targetTitle: 'Data masking',
    mappingType: 'EXACT_EQUIVALENT',
    confidenceScore: 96,
    justificationNotes: 'PII scrubbing and data masking in AI pipelines directly fulfill ISO 27001 A.8.11 data masking controls.',
    humanVerified: true,
    verifiedBy: 'David Vance, Lead Auditor',
    evidenceReusability: 'DIRECT_REUSE'
  },
  {
    id: 'MAP-AI-03',
    sourceFramework: 'ISO/IEC 42001:2023',
    sourceRequirementCode: 'A.6.2',
    sourceRequirementTitle: 'AI system design and development',
    targetFramework: 'ISO/IEC 27001:2022',
    targetControlOrClauseCode: 'A.8.25',
    targetTitle: 'Secure development life cycle',
    mappingType: 'RELATED_OVERLAP',
    confidenceScore: 90,
    justificationNotes: 'MLOps pipelines and secure code gates align with ISO 27001 secure development lifecycle requirements.',
    humanVerified: true,
    verifiedBy: 'Elena Rostova, Lead Auditor',
    evidenceReusability: 'DIRECT_REUSE'
  },
  {
    id: 'MAP-AI-04',
    sourceFramework: 'ISO/IEC 42001:2023',
    sourceRequirementCode: 'A.10.1',
    sourceRequirementTitle: 'Supplier AI models and third-party APIs',
    targetFramework: 'ISO/IEC 27001:2022',
    targetControlOrClauseCode: 'A.5.19',
    targetTitle: 'Information security in supplier relationships',
    mappingType: 'SUPERSET',
    confidenceScore: 92,
    justificationNotes: 'AI vendor risk assessment extends standard ISO 27001 supplier security due diligence.',
    humanVerified: true,
    verifiedBy: 'David Vance, Lead Auditor',
    evidenceReusability: 'DIRECT_REUSE'
  },
  {
    id: 'MAP-AI-05',
    sourceFramework: 'ISO/IEC 42001:2023',
    sourceRequirementCode: 'A.5.1',
    sourceRequirementTitle: 'AI system impact assessment (AI-SIA)',
    targetFramework: 'MAS TRM 2021',
    targetControlOrClauseCode: 'Sec 3.0',
    targetTitle: 'IT Risk Management Framework',
    mappingType: 'RELATED_OVERLAP',
    confidenceScore: 88,
    justificationNotes: 'MAS TRM technology risk assessments map directly to AI-SIA ethical and operational impact evaluations.',
    humanVerified: true,
    verifiedBy: 'Elena Rostova, Lead Auditor',
    evidenceReusability: 'REQUIRES_ADDITIONAL_METRIC'
  }
];
