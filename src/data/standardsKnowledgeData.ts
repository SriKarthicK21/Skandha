// Standards and Training Standards & Frameworks Comprehensive Knowledge Base
// Encodes deep implementation methodology, mandatory documentation checklists,
// lead auditor expectations, and 10-step roadmaps for all 17 Standards and Training domains.

export interface MandatoryDocumentItem {
  id: string;
  title: string;
  clauseRef: string;
  isMandatory: boolean; // true = strictly required by standard, false = commonly used/recommended by standard
  purpose: string;
  auditorCheck: string;
}

export interface AuditorInterviewItem {
  question: string;
  auditorIntent: string;
  recommendedAnswer: string;
  evidenceToProduce: string;
}

export interface ImplementationStep {
  stepNumber: number;
  title: string;
  phase: 'Planning' | 'Implementation' | 'Operation' | 'Evaluation & Certification';
  description: string;
  deliverables: string[];
}

export interface StandardKnowledge {
  id: string;
  code: string;
  name: string;
  edition: string;
  category: 'Information Security & IT' | 'Quality & Engineering' | 'Health & Medical' | 'Environmental & Safety' | 'European Regulations' | 'Consulting & Governance';
  badge: string;
  summary: string;
  targetIndustries: string[];
  keyBenefits: string[];
  annexSlCompatible: boolean;
  mandatoryDocumentsCount: number;
  totalControlsOrClauses: string;
  coreClauses: {
    clause: string;
    title: string;
    description: string;
    keyRequirement: string;
  }[];
  mandatoryDocuments: MandatoryDocumentItem[];
  auditorExpectations: string[];
  commonNonConformities: string[];
  interviewPrep: AuditorInterviewItem[];
  implementationRoadmap: ImplementationStep[];
  synergiesWithOtherStandards: string[];
}

export const STANDARDS_CATALOG: StandardKnowledge[] = [
  {
    id: 'iso-27001',
    code: 'ISO 27001',
    name: 'Information Security Management System (ISMS)',
    edition: 'ISO/IEC 27001:2022',
    category: 'Information Security & IT',
    badge: 'Flagship ISMS',
    summary: 'The worldwide benchmark for establishing, implementing, maintaining, and continually improving an Information Security Management System.',
    targetIndustries: ['SaaS & Cloud Providers', 'FinTech & Banking', 'Healthcare IT', 'Defense & GovTech', 'E-commerce'],
    keyBenefits: [
      'Protects confidential customer records and proprietary IP',
      'Satisfies enterprise vendor procurement security requirements',
      'Reduces cyber insurance premiums and breach liabilities',
      'Provides systematic risk treatment aligned with ISO 27005'
    ],
    annexSlCompatible: true,
    mandatoryDocumentsCount: 11,
    totalControlsOrClauses: 'Clauses 4-10 + 93 Annex A Controls',
    coreClauses: [
      { clause: 'Clause 4.3', title: 'Scope of the ISMS', description: 'Defines boundaries and applicability of information security.', keyRequirement: 'Must consider internal/external issues, interested parties, and interfaces/dependencies.' },
      { clause: 'Clause 5.2', title: 'Information Security Policy', description: 'Executive commitment and direction for security.', keyRequirement: 'Approved by top management, communicated to all workers, and reviewed annually.' },
      { clause: 'Clause 6.1.2/6.1.3', title: 'Information Security Risk Assessment & Treatment', description: 'Methodology to identify, analyze, evaluate, and treat risks.', keyRequirement: 'Must establish risk criteria, identify asset/threat/vulnerability, and produce Statement of Applicability (SoA).' },
      { clause: 'Clause 7.5', title: 'Documented Information', description: 'Control of documents and operational records.', keyRequirement: 'Formal approval, distribution, revision control, retention, and disposition.' },
      { clause: 'Clause 9.2', title: 'Internal Audit', description: 'Independent review of operational conformity.', keyRequirement: 'Planned audit programs, objective auditors, formal audit reports, and CAPA logs.' },
      { clause: 'Clause 9.3', title: 'Management Review', description: 'Top management evaluation of ISMS continuing suitability.', keyRequirement: 'Documented review minutes evaluating audit results, risk status, incident metrics, and resource needs.' }
    ],
    mandatoryDocuments: [
      { id: 'doc-27k-1', title: 'Scope of the ISMS', clauseRef: 'Clause 4.3', isMandatory: true, purpose: 'Documents physical, logical, and organizational boundaries.', auditorCheck: 'Auditor checks that exclusions do not omit core production services.' },
      { id: 'doc-27k-2', title: 'Information Security Policy & Objectives', clauseRef: 'Clauses 5.2 & 6.2', isMandatory: true, purpose: 'Executive security mandate and measurable annual objectives.', auditorCheck: 'Verify CISO/Board signature and quantifiable metrics.' },
      { id: 'doc-27k-3', title: 'Risk Assessment & Treatment Methodology', clauseRef: 'Clause 6.1.2', isMandatory: true, purpose: 'Defines likelihood/impact scoring and risk appetite.', auditorCheck: 'Auditor checks that risk criteria are repeatable and objective.' },
      { id: 'doc-27k-4', title: 'Statement of Applicability (SoA)', clauseRef: 'Clause 6.1.3 d)', isMandatory: true, purpose: 'Status and justification for all 93 Annex A controls.', auditorCheck: 'Auditor examines justifications for any excluded controls.' },
      { id: 'doc-27k-5', title: 'Risk Treatment Plan (RTP)', clauseRef: 'Clause 6.1.3 e)', isMandatory: true, purpose: 'Designated owners, target completion dates, and budget for risk treatments.', auditorCheck: 'Auditor verifies progress against target completion dates.' },
      { id: 'doc-27k-6', title: 'Internal Audit Program & Audit Results', clauseRef: 'Clause 9.2', isMandatory: true, purpose: 'Annual audit schedule and executed audit reports.', auditorCheck: 'Auditor confirms internal auditor independence.' },
      { id: 'doc-27k-7', title: 'Management Review Minutes', clauseRef: 'Clause 9.3', isMandatory: true, purpose: 'Formal records of executive ISMS governance sessions.', auditorCheck: 'Auditor checks all 6 mandatory inputs from Clause 9.3.2 are discussed.' },
      { id: 'doc-27k-8', title: 'Nonconformity and Corrective Action Records', clauseRef: 'Clause 10.2', isMandatory: true, purpose: 'Root cause analysis and preventive action tracking.', auditorCheck: 'Auditor samples closed CAPA tickets for verified effectiveness.' }
    ],
    auditorExpectations: [
      'Auditors expect living evidence, not static documents created 2 weeks before the audit',
      'The Statement of Applicability must explicitly reference ISO/IEC 27001:2022 4 themes (Organizational, People, Physical, Technological)',
      'Access revocation must have verifiable timestamps matching HR termination logs',
      'Incident management procedures must demonstrate actual drill or incident post-mortems'
    ],
    commonNonConformities: [
      'Missing or unapproved Statement of Applicability (Clause 6.1.3)',
      'No evidence of internal audit covering all clauses and applicable Annex A controls prior to Stage 2',
      'Failure to execute annual Management Review with top management before certification audit',
      'Generic policies lacking technical configurations, specific tool names, or measurable SLAs'
    ],
    interviewPrep: [
      {
        question: 'How do you determine which Annex A controls are applicable to your organization?',
        auditorIntent: 'Testing understanding of the risk treatment process and Statement of Applicability.',
        recommendedAnswer: 'Control selection is driven by our formal Risk Assessment under Clause 6.1.2 and legal/contractual requirements. We record each decision with justifications in our Statement of Applicability (SoA v3.2), which is formally approved by the CISO and CEO.',
        evidenceToProduce: 'Statement of Applicability and Risk Treatment Plan.'
      },
      {
        question: 'How do you ensure terminated employees lose access to sensitive systems immediately?',
        auditorIntent: 'Evaluating Annex A.5.18 and A.5.15 access revocation controls.',
        recommendedAnswer: 'HR triggers an automated offboarding ticket upon separation. IT suspends Okta SSO credentials and initiates MDM remote device wipe within 24 hours (immediate for involuntary exits). We maintain timestamped deprovisioning logs for verification.',
        evidenceToProduce: 'Offboarding tickets compared against IdP deactivation logs for sampled leavers.'
      }
    ],
    implementationRoadmap: [
      { stepNumber: 1, title: 'Management Commitment & Project Charter', phase: 'Planning', description: 'Obtain top management approval, designate CISO/ISMS Lead, and define project budget.', deliverables: ['Project Charter', 'Resource Allocation'] },
      { stepNumber: 2, title: 'Scope Definition & Context Analysis', phase: 'Planning', description: 'Determine organizational and physical boundaries, interested party expectations, and legal requirements.', deliverables: ['ISMS Scope Document', 'Interested Parties Register'] },
      { stepNumber: 3, title: 'Security Policies Formulation', phase: 'Implementation', description: 'Draft the Master Information Security Policy and domain-specific topic policies.', deliverables: ['InfoSec Policy', 'Access Control Policy', 'Acceptable Use Policy'] },
      { stepNumber: 4, title: 'Risk Assessment & Treatment', phase: 'Implementation', description: 'Inventory assets, identify threats/vulnerabilities, evaluate risks, and compile Statement of Applicability.', deliverables: ['Risk Register', 'SoA', 'Risk Treatment Plan'] },
      { stepNumber: 5, title: 'Annex A Technical Controls Deployment', phase: 'Implementation', description: 'Implement technical, organizational, physical, and personnel controls across infrastructure.', deliverables: ['MFA Deployment', 'Backup Logs', 'Incident Runbooks'] },
      { stepNumber: 6, title: 'Training & Awareness Campaign', phase: 'Operation', description: 'Train all staff on security responsibilities, phishing awareness, and reporting procedures.', deliverables: ['Training Records', 'Signed Policy Acknowledgments'] },
      { stepNumber: 7, title: 'Internal Audit (Clause 9.2)', phase: 'Evaluation & Certification', description: 'Conduct a comprehensive internal audit across all clauses and applicable Annex A controls.', deliverables: ['Internal Audit Plan', 'Internal Audit Report', 'Findings Register'] },
      { stepNumber: 8, title: 'Management Review (Clause 9.3)', phase: 'Evaluation & Certification', description: 'Top management convenes to evaluate ISMS performance, audit findings, and allocate resources.', deliverables: ['Management Review Minutes', 'Executive Decisions'] },
      { stepNumber: 9, title: 'Corrective Action (CAPA)', phase: 'Evaluation & Certification', description: 'Address all non-conformities identified during internal audit and management review.', deliverables: ['CAPA Closure Sheets', 'Evidence of Remediation'] },
      { stepNumber: 10, title: 'Stage 1 & Stage 2 Certification Audit', phase: 'Evaluation & Certification', description: 'External accredited registrar audits documentation (Stage 1) and operational effectiveness (Stage 2).', deliverables: ['Stage 1 Report', 'Stage 2 Certification Recommendation'] }
    ],
    synergiesWithOtherStandards: ['ISO 9001 (Shared Annex SL Clauses 4-10)', 'ISO 42001 (AIMS builds on ISMS foundation)', 'NIS2 (satisfies 85% of cybersecurity baseline)', 'DORA (covers ICT risk management requirements)']
  },
  {
    id: 'iso-42001',
    code: 'ISO 42001',
    name: 'Artificial Intelligence Management System (AIMS)',
    edition: 'ISO/IEC 42001:2023',
    category: 'Information Security & IT',
    badge: 'AI Governance',
    summary: 'The first global standard specifying requirements for establishing, implementing, maintaining, and continually improving an Artificial Intelligence Management System (AIMS).',
    targetIndustries: ['AI Model Developers', 'Enterprise SaaS with LLM features', 'Healthcare AI Diagnostics', 'Autonomous Vehicle Systems', 'Algorithmic Trading'],
    keyBenefits: [
      'Proves ethical, transparent, and explainable AI operations to regulators',
      'Satisfies EU AI Act conformity assessment mandates',
      'Prevents hallucination risks, model poisoning, and algorithmic bias',
      'Controls training data provenance, consent, and copyright licensing'
    ],
    annexSlCompatible: true,
    mandatoryDocumentsCount: 9,
    totalControlsOrClauses: 'Clauses 4-10 + 38 Annex A AI Controls',
    coreClauses: [
      { clause: 'Clause 5.2', title: 'AI Policy', description: 'Formal statement of principles on responsible AI, fairness, and safety.', keyRequirement: 'Approved by executive leadership, addressing algorithmic ethics and human oversight.' },
      { clause: 'Clause 6.1.2/6.1.4', title: 'AI Risk & Impact Assessment (AI-RA/AI-IA)', description: 'Assessing risks to individuals, society, and organizations.', keyRequirement: 'Quantifies societal harm, bias, fairness, transparency, and model drift.' },
      { clause: 'Clause 8.2', title: 'AI System Lifecycle Management', description: 'Governing AI from data acquisition and training to deployment and decommissioning.', keyRequirement: 'Version control of datasets, hyperparameters, and human-in-the-loop gates.' }
    ],
    mandatoryDocuments: [
      { id: 'doc-42k-1', title: 'AIMS Scope & AI System Inventory', clauseRef: 'Clause 4.3 & Annex A.2', isMandatory: true, purpose: 'Complete catalog of all AI models, ML pipelines, and LLM integrations.', auditorCheck: 'Auditor checks for shadow AI and unapproved third-party API use.' },
      { id: 'doc-42k-2', title: 'Responsible AI Policy', clauseRef: 'Clause 5.2', isMandatory: true, purpose: 'Ethical principles governing fairness, privacy, safety, and explainability.', auditorCheck: 'Auditor checks alignment with OECD AI Principles and EU AI Act.' },
      { id: 'doc-42k-3', title: 'AI Risk & Impact Assessment (AI-RA)', clauseRef: 'Clause 6.1.2/6.1.4', isMandatory: true, purpose: 'Impact assessment on user rights, safety, bias, and discrimination.', auditorCheck: 'Auditor checks that impact on affected individuals is formally modeled.' },
      { id: 'doc-42k-4', title: 'AI Statement of Applicability (AI-SoA)', clauseRef: 'Clause 6.1.3', isMandatory: true, purpose: 'Justifications for all 38 Annex A AI controls.', auditorCheck: 'Verify control justifications across data, models, and third-party AI.' },
      { id: 'doc-42k-5', title: 'Data Quality & Provenance Governance Runbook', clauseRef: 'Annex A.6', isMandatory: true, purpose: 'Proves training datasets have legitimate legal basis, consent, and bias screening.', auditorCheck: 'Auditor checks data validation logs and synthetic data pipelines.' }
    ],
    auditorExpectations: [
      'Auditors look for automated telemetry tracking model drift and inference latency',
      'Explainability logs must demonstrate how high-stakes AI outputs are justified to end users',
      'Human-in-the-loop (HITL) kill switches must be documented and tested for high-risk models'
    ],
    commonNonConformities: [
      'Lack of documentation on third-party foundational models (e.g. OpenAI/Anthropic/Gemini APIs)',
      'No continuous monitoring for model drift or prompt injection attacks in production',
      'Failure to perform AI Impact Assessment on vulnerable user populations'
    ],
    interviewPrep: [
      {
        question: 'How do you detect and remediate model drift and hallucinations in production?',
        auditorIntent: 'Evaluating Annex A.8 Continuous Monitoring and Validation controls.',
        recommendedAnswer: 'We monitor production embeddings and confidence scores using automated drift detection. If confidence dips below 85% or toxicity markers trigger, the system fails over to deterministic rules and flags the session for human review.',
        evidenceToProduce: 'Telemetry dashboard screenshots and alert configuration runbooks.'
      }
    ],
    implementationRoadmap: [
      { stepNumber: 1, title: 'AI Asset & Model Inventory', phase: 'Planning', description: 'Identify all internal models, fine-tuned weights, and external AI vendor APIs.', deliverables: ['AI Model Registry'] },
      { stepNumber: 2, title: 'Responsible AI Governance Policy', phase: 'Planning', description: 'Establish ethics board and write Responsible AI mandate.', deliverables: ['AI Governance Policy'] },
      { stepNumber: 3, title: 'AI Risk & Impact Assessment', phase: 'Implementation', description: 'Perform algorithmic impact assessments and quantify bias/safety risks.', deliverables: ['AI Risk Assessment', 'AI-SoA'] },
      { stepNumber: 4, title: 'Data Provenance & MLOps Controls', phase: 'Implementation', description: 'Implement dataset lineage tracking, model cards, and CI/CD testing gates.', deliverables: ['Model Cards', 'Dataset Lineage Logs'] },
      { stepNumber: 5, title: 'AI Certification Audit', phase: 'Evaluation & Certification', description: 'Undergo Stage 1 & 2 audit for ISO/IEC 42001 certification.', deliverables: ['Accredited ISO 42001 Certificate'] }
    ],
    synergiesWithOtherStandards: ['ISO 27001 (Shares Clauses 4-10)', 'EU AI Act (ISO 42001 serves as primary harmonized standard)', 'ISO 27701 (Privacy for training data)']
  },
  {
    id: 'iso-9001',
    code: 'ISO 9001',
    name: 'Quality Management System (QMS)',
    edition: 'ISO 9001:2015',
    category: 'Quality & Engineering',
    badge: 'Foundation QMS',
    summary: 'The world’s most recognized standard for quality management systems, ensuring customer satisfaction and continuous process improvement.',
    targetIndustries: ['Manufacturing & Assembly', 'Consulting & Professional Services', 'Engineering & Construction', 'Software Development', 'Logistics'],
    keyBenefits: [
      'Drives customer retention through consistent product/service delivery',
      'Required for public sector tenders and Fortune 500 supplier qualification',
      'Systematizes operational processes, reducing rework and warranty claims',
      'Establishes Plan-Do-Check-Act (PDCA) culture across entire workforce'
    ],
    annexSlCompatible: true,
    mandatoryDocumentsCount: 8,
    totalControlsOrClauses: 'Clauses 4-10 (Plan-Do-Check-Act)',
    coreClauses: [
      { clause: 'Clause 5.2', title: 'Quality Policy', description: 'Commitment to satisfying requirements and continual improvement.', keyRequirement: 'Available to interested parties, aligned with strategic context, and understood internally.' },
      { clause: 'Clause 6.2', title: 'Quality Objectives', description: 'Measurable targets at relevant functions and levels.', keyRequirement: 'Must be monitored, communicated, and updated in accordance with the Quality Policy.' },
      { clause: 'Clause 8.2', title: 'Requirements for Products and Services', description: 'Customer communication and contract review.', keyRequirement: 'Ensuring organization has the ability to meet customer requirements before accepting orders.' },
      { clause: 'Clause 8.4', title: 'Control of Externally Provided Processes & Products', description: 'Vendor and supplier management.', keyRequirement: 'Criteria for evaluation, selection, performance monitoring, and re-evaluation of external providers.' },
      { clause: 'Clause 8.5', title: 'Production and Service Provision', description: 'Controlled operational conditions.', keyRequirement: 'Documented work instructions, suitable monitoring equipment, and traceability mechanisms.' }
    ],
    mandatoryDocuments: [
      { id: 'doc-9k-1', title: 'Scope of the QMS', clauseRef: 'Clause 4.3', isMandatory: true, purpose: 'Boundaries of products, services, and locations covered by QMS.', auditorCheck: 'Verify that any non-applicable requirements (e.g. Design 8.3) are justified.' },
      { id: 'doc-9k-2', title: 'Quality Policy & Quality Objectives', clauseRef: 'Clauses 5.2 & 6.2', isMandatory: true, purpose: 'Commitment to customer satisfaction and measurable KPIs.', auditorCheck: 'Auditor checks how objectives are measured at departmental levels.' },
      { id: 'doc-9k-3', title: 'Calibration & Measurement Records', clauseRef: 'Clause 7.1.5', isMandatory: true, purpose: 'Evidence of fitness for purpose for monitoring/measurement resources.', auditorCheck: 'Traceability to international/national measurement standards.' },
      { id: 'doc-9k-4', title: 'Competence Records', clauseRef: 'Clause 7.2', isMandatory: true, purpose: 'Proof of education, training, and experience of personnel.', auditorCheck: 'Sample employee training files against role requirements.' },
      { id: 'doc-9k-5', title: 'Nonconforming Outputs Control Record', clauseRef: 'Clause 8.7', isMandatory: true, purpose: 'Identification and segregation of defective deliverables.', auditorCheck: 'Auditor verifies that defective products cannot be shipped inadvertently.' }
    ],
    auditorExpectations: [
      'Auditors test the "Golden Thread": Strategy -> Quality Policy -> Objectives -> Processes -> Customer Feedback',
      'Vendor evaluation cannot just be an initial approval; annual re-evaluation records are scrutinized',
      'Root cause analysis on customer complaints must show true corrective action, not just "retrained employee"'
    ],
    commonNonConformities: [
      'Quality objectives that are not measurable (e.g. "provide great service" instead of "maintain 98.5% on-time delivery")',
      'Supplier re-evaluation not performed according to the frequency specified in procedure',
      'No documented procedure or records for controlling changes to production/service processes'
    ],
    interviewPrep: [
      {
        question: 'What do you do when a product or service does not meet customer specifications?',
        auditorIntent: 'Evaluating Clause 8.7 Control of Nonconforming Outputs.',
        recommendedAnswer: 'The output is quarantined immediately to prevent unintended delivery. An internal Non-Conformance Report (NCR) is raised, root cause is investigated via 5-Whys, and customer is notified if delivery dates or SLA will be impacted.',
        evidenceToProduce: 'NCR register and closed customer concession records.'
      }
    ],
    implementationRoadmap: [
      { stepNumber: 1, title: 'Process Identification & Mapping', phase: 'Planning', description: 'Identify core business, supporting, and management processes.', deliverables: ['Process Interaction Map'] },
      { stepNumber: 2, title: 'Quality Policy & Objectives Definition', phase: 'Planning', description: 'Establish executive quality policy and departmental KPIs.', deliverables: ['Quality Policy', 'KPI Dashboard'] },
      { stepNumber: 3, title: 'SOPs & Work Instructions Documentation', phase: 'Implementation', description: 'Draft standard operating procedures for key operations.', deliverables: ['Operational SOPs', 'Inspection Criteria'] },
      { stepNumber: 4, title: 'Supplier & Vendor Control Setup', phase: 'Implementation', description: 'Establish vendor evaluation criteria and approved vendor list.', deliverables: ['Vendor Matrix', 'Evaluation Checklists'] },
      { stepNumber: 5, title: 'Internal Audit & Management Review', phase: 'Evaluation & Certification', description: 'Execute full system internal audit and executive review.', deliverables: ['Internal Audit Report', 'QMS Review Minutes'] }
    ],
    synergiesWithOtherStandards: ['ISO 27001 (Clauses 4-10 overlap completely)', 'ISO 14001 (Integrates seamlessly into IMS)', 'IATF 16949 & AS9100 (Direct superset extensions of ISO 9001)']
  },
  {
    id: 'iso-13485',
    code: 'ISO 13485',
    name: 'Medical Devices Quality Management System',
    edition: 'ISO 13485:2016',
    category: 'Health & Medical',
    badge: 'MedTech QMS',
    summary: 'The gold standard for medical device manufacturers, ensuring regulatory compliance, patient safety, and rigorous design control across the product lifecycle.',
    targetIndustries: ['Medical Device Manufacturers', 'Software as a Medical Device (SaMD)', 'In Vitro Diagnostics (IVD)', 'Contract Sterilizers & Packagers'],
    keyBenefits: [
      'Prerequisite for CE marking under EU MDR and FDA 21 CFR Part 820 clearance',
      'Enforces rigorous risk management integrated with ISO 14971',
      'Provides bulletproof device traceability and post-market clinical follow-up',
      'Guarantees sterile barrier integrity and cleanroom environmental control'
    ],
    annexSlCompatible: false, // Standard maintains unique 2003-style structure for FDA harmonization
    mandatoryDocumentsCount: 22,
    totalControlsOrClauses: 'Clauses 4-8 with strict regulatory documentation mandates',
    coreClauses: [
      { clause: 'Clause 4.2.3', title: 'Medical Device File (MDF)', description: 'Comprehensive technical file for each device family.', keyRequirement: 'Must contain specifications, intended use, manufacturing procedures, and servicing requirements.' },
      { clause: 'Clause 7.1', title: 'Planning of Product Realization & ISO 14971 Risk Management', description: 'Managing risk throughout the entire lifecycle.', keyRequirement: 'Risk management file must be maintained for each medical device model.' },
      { clause: 'Clause 7.3', title: 'Design and Development Controls', description: 'Design inputs, outputs, verification, validation, and design transfer.', keyRequirement: 'Design History File (DHF) documenting clinical evaluation and usability engineering.' },
      { clause: 'Clause 7.5.3', title: 'Installation and Servicing', description: 'Controlled installation and maintenance activities.', keyRequirement: 'Documented service reports verifying device remains within safety parameters.' },
      { clause: 'Clause 8.2.2', title: 'Complaint Handling & Vigilance Reporting', description: 'Processing customer complaints and adverse incidents.', keyRequirement: 'Mandatory timelines for reporting serious adverse events to competent health authorities.' }
    ],
    mandatoryDocuments: [
      { id: 'doc-13k-1', title: 'Quality Manual & Medical Device File (MDF)', clauseRef: 'Clauses 4.2.2 & 4.2.3', isMandatory: true, purpose: 'Primary QMS governance manual and technical files for each device.', auditorCheck: 'Auditor audits MDF against regulatory submissions.' },
      { id: 'doc-13k-2', title: 'Design History File (DHF) & Verification/Validation Protocols', clauseRef: 'Clause 7.3', isMandatory: true, purpose: 'Evidence of clinical evaluation, electrical safety, biocompatibility, and software V&V.', auditorCheck: 'Traceability matrix between design inputs and test reports.' },
      { id: 'doc-13k-3', title: 'Risk Management File (ISO 14971)', clauseRef: 'Clause 7.1', isMandatory: true, purpose: 'Hazard analysis, FMEA, risk reduction, and overall residual risk benefit-risk ratio.', auditorCheck: 'Auditor checks that risk controls were implemented in design.' },
      { id: 'doc-13k-4', title: 'Device Master Record (DMR) & Device History Record (DHR)', clauseRef: 'Clause 4.2 & 7.5.1', isMandatory: true, purpose: 'Manufacturing recipes and batch manufacturing lot release records.', auditorCheck: 'Complete lot traceability from raw materials to final release.' },
      { id: 'doc-13k-5', title: 'Vigilance & Regulatory Adverse Event Reporting Procedure', clauseRef: 'Clause 8.2.3', isMandatory: true, purpose: 'Protocol for reporting incidents to FDA (eMDR) and EU Competent Authorities (EUDAMED).', auditorCheck: 'Verification of statutory reporting windows (e.g. 2, 10, 30 days).' }
    ],
    auditorExpectations: [
      'Auditors demand exact trace between Design Inputs -> Design Outputs -> Verification -> Validation',
      'Software as a Medical Device (SaMD) must conform to IEC 62304 lifecycle documentation',
      'Cleanroom environmental monitoring data (particulate counts, bioburden) is sampled in depth'
    ],
    commonNonConformities: [
      'Inadequate risk management file (failure to update ISO 14971 risk analysis after customer complaints)',
      'Lack of software validation for computerized systems used in production or QMS (e.g. Jira/ERP)',
      'No formal process for reporting advisory notices and recalls to regulatory bodies'
    ],
    interviewPrep: [
      {
        question: 'What is your process when a complaint alleging device failure or patient injury is received?',
        auditorIntent: 'Evaluating Clause 8.2.2 Complaint Handling and Vigilance.',
        recommendedAnswer: 'The complaint is immediately logged in our Vigilance Registry and evaluated by Quality Assurance within 24 hours. If reportable under EU MDR Article 87 or FDA Part 803, we file an initial report with the Competent Authority. A CAPA is opened to determine root cause and evaluate field safety corrective actions (FSCA).',
        evidenceToProduce: 'Complaint log and latest vigilance submission.'
      }
    ],
    implementationRoadmap: [
      { stepNumber: 1, title: 'Regulatory Strategy & Classification', phase: 'Planning', description: 'Classify device (Class I, IIa, IIb, III) and identify applicable standards.', deliverables: ['Regulatory Pathway Dossier'] },
      { stepNumber: 2, title: 'ISO 14971 Risk Management Setup', phase: 'Planning', description: 'Establish risk acceptability matrix and product safety risk plan.', deliverables: ['Risk Management Plan'] },
      { stepNumber: 3, title: 'Design Controls & DHF Implementation', phase: 'Implementation', description: 'Document design inputs, outputs, V&V testing, and human factors usability (IEC 62366).', deliverables: ['Design History File'] },
      { stepNumber: 4, title: 'Production Controls & Traceability', phase: 'Implementation', description: 'Establish Device Master Record, lot serialization, and sterile barrier controls.', deliverables: ['DMR', 'Batch Release SOP'] },
      { stepNumber: 5, title: 'Notified Body ISO 13485 Audit', phase: 'Evaluation & Certification', description: 'Undergo audit by accredited Notified Body (e.g. BSI, TÜV SÜD, DNV).', deliverables: ['ISO 13485 Certificate'] }
    ],
    synergiesWithOtherStandards: ['EU MDR 2017/745 (ISO 13485 is the core QMS foundation)', 'ISO 9001 (QMS principles)', 'ISO 27001 (For connected medical devices and IoMT cybersecurity)']
  },
  {
    id: 'iso-14001',
    code: 'ISO 14001',
    name: 'Environmental Management System (EMS)',
    edition: 'ISO 14001:2015',
    category: 'Environmental & Safety',
    badge: 'Green EMS',
    summary: 'The international standard setting requirements for an environmental management system to enhance environmental performance, fulfill compliance obligations, and achieve environmental objectives.',
    targetIndustries: ['Chemical & Pharmaceutical', 'Manufacturing & Heavy Industry', 'Energy & Utilities', 'Data Centers & Tech Facilities', 'Construction & Real Estate'],
    keyBenefits: [
      'Reduces carbon footprint, energy consumption, and raw material waste',
      'Demonstrates ESG leadership to investors and institutional stakeholders',
      'Ensures compliance with hazardous substance and effluent discharge regulations',
      'Protects against corporate environmental fines and remediation liabilities'
    ],
    annexSlCompatible: true,
    mandatoryDocumentsCount: 7,
    totalControlsOrClauses: 'Clauses 4-10 (Annex SL Structure)',
    coreClauses: [
      { clause: 'Clause 6.1.2', title: 'Environmental Aspects', description: 'Determining aspects of activities that have or can have a significant impact on environment.', keyRequirement: 'Must consider lifecycle perspective, abnormal conditions, and emergency situations.' },
      { clause: 'Clause 6.1.3', title: 'Compliance Obligations', description: 'Identifying and having access to legal environmental requirements.', keyRequirement: 'Must maintain a documented legal register and determine how obligations apply.' },
      { clause: 'Clause 8.2', title: 'Emergency Preparedness and Response', description: 'Processes to prepare for and respond to potential environmental accidents/spills.', keyRequirement: 'Periodic testing of emergency response procedures and spill containment drills.' }
    ],
    mandatoryDocuments: [
      { id: 'doc-14k-1', title: 'Scope of the EMS & Environmental Policy', clauseRef: 'Clauses 4.3 & 5.2', isMandatory: true, purpose: 'Executive commitment to environmental protection and pollution prevention.', auditorCheck: 'Auditor checks that policy commitments are reflected in operational targets.' },
      { id: 'doc-14k-2', title: 'Register of Environmental Aspects & Impacts', clauseRef: 'Clause 6.1.2', isMandatory: true, purpose: 'Evaluation of carbon, water, waste, and chemical emissions from a lifecycle perspective.', auditorCheck: 'Auditor examines criteria used to determine "significant" aspects.' },
      { id: 'doc-14k-3', title: 'Compliance Obligations & Legal Register', clauseRef: 'Clause 6.1.3', isMandatory: true, purpose: 'Registry of environmental permits, emission limits, and local hazardous waste laws.', auditorCheck: 'Proof of periodic evaluation of compliance (Clause 9.1.2).' },
      { id: 'doc-14k-4', title: 'Emergency Preparedness & Spill Response Runbook', clauseRef: 'Clause 8.2', isMandatory: true, purpose: 'Procedures for chemical spills, toxic gas release, or fire runoff containment.', auditorCheck: 'Records of conducted emergency drills and lessons learned.' }
    ],
    auditorExpectations: [
      'Auditors inspect physical facilities (chemical storage, bunding, waste disposal areas)',
      'The "lifecycle perspective" must cover upstream suppliers and downstream disposal',
      'Environmental objectives must have baseline figures and clear reduction timelines'
    ],
    commonNonConformities: [
      'Failure to maintain an up-to-date legal register of applicable environmental laws',
      'Emergency response drills not conducted according to the planned schedule',
      'No evidence of evaluating compliance with environmental permits and discharge consent limits'
    ],
    interviewPrep: [
      {
        question: 'How do you determine which environmental aspects of your operations are significant?',
        auditorIntent: 'Evaluating Clause 6.1.2 Environmental Aspects evaluation criteria.',
        recommendedAnswer: 'We use a risk-based matrix evaluating severity of environmental impact, probability of occurrence, regulatory sensitivity, and stakeholder concern across normal, abnormal, and emergency conditions. Any aspect scoring above 15 is deemed significant and assigned operational controls and objectives.',
        evidenceToProduce: 'Aspects & Impacts Register with scoring methodology.'
      }
    ],
    implementationRoadmap: [
      { stepNumber: 1, title: 'Environmental Review & Aspect Identification', phase: 'Planning', description: 'Audit emissions, waste streams, energy usage, and chemical inventory.', deliverables: ['Aspects & Impacts Register'] },
      { stepNumber: 2, title: 'Legal & Compliance Obligations Review', phase: 'Planning', description: 'Catalog all national and municipal environmental permits and statutes.', deliverables: ['Environmental Legal Register'] },
      { stepNumber: 3, title: 'Operational Controls & Emergency Drills', phase: 'Implementation', description: 'Install containment bunds, waste segregation, and conduct spill drills.', deliverables: ['Spill Kits Log', 'Emergency Drill Report'] },
      { stepNumber: 4, title: 'Evaluation of Compliance & EMS Audit', phase: 'Evaluation & Certification', description: 'Formally assess compliance against all legal obligations and audit EMS.', deliverables: ['Compliance Evaluation Record', 'Internal Audit Dossier'] },
      { stepNumber: 5, title: 'ISO 14001 Certification Audit', phase: 'Evaluation & Certification', description: 'Undergo Stage 1 and Stage 2 certification audit.', deliverables: ['ISO 14001 Certificate'] }
    ],
    synergiesWithOtherStandards: ['ISO 45001 (EHS Integrated Management System)', 'ISO 9001 (Annex SL unified governance)', 'ISO 50001 (Energy Management System)']
  },
  {
    id: 'iso-45001',
    code: 'ISO 45001',
    name: 'Occupational Health and Safety Management System (OH&S)',
    edition: 'ISO 45001:2018',
    category: 'Environmental & Safety',
    badge: 'Worker Safety',
    summary: 'The global standard for occupational health and safety, providing a framework to improve employee safety, reduce workplace risks, and create better, safer working conditions.',
    targetIndustries: ['Construction & Civil Engineering', 'Mining & Oil/Gas', 'Logistics & Warehousing', 'Heavy Manufacturing', 'Facility Management'],
    keyBenefits: [
      'Dramatically reduces workplace accidents, injuries, and fatalities',
      'Mitigates workers’ compensation claims and OSHA/HSE regulatory fines',
      'Fosters worker participation and hazard reporting without fear of reprisal',
      'Protects brand reputation and satisfies client pre-qualification requirements'
    ],
    annexSlCompatible: true,
    mandatoryDocumentsCount: 8,
    totalControlsOrClauses: 'Clauses 4-10 (Annex SL Structure)',
    coreClauses: [
      { clause: 'Clause 5.4', title: 'Consultation and Participation of Workers', description: 'Engaging non-managerial workers in safety decisions.', keyRequirement: 'Must provide time, training, and mechanisms for workers to participate in hazard identification.' },
      { clause: 'Clause 6.1.2', title: 'Hazard Identification and Assessment of Risks', description: 'Ongoing and proactive hazard identification.', keyRequirement: 'Must consider human factors, routine/non-routine activities, and infrastructure.' },
      { clause: 'Clause 8.1.2', title: 'Eliminating Hazards and Reducing OH&S Risks', description: 'Hierarchy of controls implementation.', keyRequirement: 'Must prioritize Elimination -> Substitution -> Engineering -> Administrative -> PPE.' }
    ],
    mandatoryDocuments: [
      { id: 'doc-45k-1', title: 'OH&S Policy & Consultation Charter', clauseRef: 'Clauses 5.2 & 5.4', isMandatory: true, purpose: 'Commitment to safe conditions and worker consultation mechanisms.', auditorCheck: 'Auditor interviews shop-floor workers to verify genuine consultation.' },
      { id: 'doc-45k-2', title: 'Hazard Identification & Risk Assessment (HIRA) Register', clauseRef: 'Clause 6.1.2', isMandatory: true, purpose: 'Inventory of physical, chemical, biological, ergonomic, and psychosocial hazards.', auditorCheck: 'Verification that hierarchy of controls was applied.' },
      { id: 'doc-45k-3', title: 'Incident & Near-Miss Investigation Register', clauseRef: 'Clause 10.2', isMandatory: true, purpose: 'Root cause analysis of accidents, injuries, and near-misses.', auditorCheck: 'Auditor checks that near-misses are actively reported without blame.' }
    ],
    auditorExpectations: [
      'Auditors walk the floor and interview non-managerial staff about how they report hazards',
      'The "Hierarchy of Controls" must be visibly applied—PPE cannot be the first line of defense',
      'Statutory compliance registers must include mandatory equipment inspections (e.g. lifting gear, pressure vessels)'
    ],
    commonNonConformities: [
      'Workers not consulted in the development of risk assessments or accident investigations',
      'No formal mechanism allowing workers to remove themselves from imminent danger (Clause 5.4)',
      'Failure to monitor contractor safety compliance on work sites'
    ],
    interviewPrep: [
      {
        question: 'How do workers participate in identifying hazards and improving safety procedures?',
        auditorIntent: 'Evaluating Clause 5.4 Consultation and Participation.',
        recommendedAnswer: 'We operate a joint Safety Committee with 50% non-managerial elected worker representatives. Workers use our mobile reporting app to log near-misses anonymously, and weekly toolbox talks review proposed changes before implementation.',
        evidenceToProduce: 'Safety Committee minutes and sample near-miss reports with worker suggestions.'
      }
    ],
    implementationRoadmap: [
      { stepNumber: 1, title: 'Worker Safety Committee Formation', phase: 'Planning', description: 'Elect worker safety representatives and draft OH&S policy.', deliverables: ['Safety Committee Charter', 'OH&S Policy'] },
      { stepNumber: 2, title: 'Comprehensive Workplace HIRA', phase: 'Planning', description: 'Conduct Hazard Identification and Risk Assessments across all operations.', deliverables: ['HIRA Master Register'] },
      { stepNumber: 3, title: 'Hierarchy of Controls Execution', phase: 'Implementation', description: 'Install physical guards, ventilation, SOPs, and provide certified PPE.', deliverables: ['Machine Guarding Certs', 'PPE Register'] },
      { stepNumber: 4, title: 'Safety Training & Emergency Drills', phase: 'Operation', description: 'Train staff on first aid, fire evacuation, and safe lifting.', deliverables: ['Training Attendance Records'] },
      { stepNumber: 5, title: 'ISO 45001 Certification Audit', phase: 'Evaluation & Certification', description: 'Stage 1 documentation and Stage 2 on-site safety audit.', deliverables: ['ISO 45001 Certificate'] }
    ],
    synergiesWithOtherStandards: ['ISO 14001 (Shared EHS department workflows)', 'ISO 9001 (Integrated operational processes)']
  },
  {
    id: 'iso-20000',
    code: 'ISO 20000',
    name: 'IT Service Management System (ITSM)',
    edition: 'ISO/IEC 20000-1:2018',
    category: 'Information Security & IT',
    badge: 'ITIL & ITSM',
    summary: 'The international standard for IT service management systems, ensuring organizations deliver high-quality, customer-focused, and financially viable IT services.',
    targetIndustries: ['Managed Service Providers (MSPs)', 'Internal Enterprise IT Departments', 'Cloud Infrastructure Providers', 'IT Outsourcing Vendors'],
    keyBenefits: [
      'Aligns IT services directly with business strategy and customer outcomes',
      'Enforces formal Service Level Agreements (SLAs) with measurable MTTR/MTBF',
      'Standardizes Change, Incident, Problem, and Release management workflows',
      'Eliminates recurring IT outages through rigorous Problem Management root cause investigations'
    ],
    annexSlCompatible: true,
    mandatoryDocumentsCount: 14,
    totalControlsOrClauses: 'Clauses 4-10 + Clause 8 Service Operations',
    coreClauses: [
      { clause: 'Clause 8.2', title: 'Service Portfolio & Catalogue Management', description: 'Managing lifecycle of all IT services.', keyRequirement: 'Documented Service Catalogue detailing service descriptions, SLAs, and target customers.' },
      { clause: 'Clause 8.3', title: 'Relationship and Agreement Management', description: 'Business relationship management and Service Level Agreements (SLAs).', keyRequirement: 'Formal SLAs agreed with customers and Operating Level Agreements (OLAs) with internal teams.' },
      { clause: 'Clause 8.5', title: 'Service Delivery & Operations (Incident, Change, Problem)', description: 'Core operational ITSM processes.', keyRequirement: 'Documented procedures for Incident Management, Problem Management, Change Governance, and Release Management.' }
    ],
    mandatoryDocuments: [
      { id: 'doc-20k-1', title: 'Service Management Plan (SMP) & Service Catalogue', clauseRef: 'Clause 8.1 & 8.2', isMandatory: true, purpose: 'Blueprint for IT service delivery and published catalog of available services.', auditorCheck: 'Auditor verifies that all published services have active owner and SLA.' },
      { id: 'doc-20k-2', title: 'Service Level Agreement (SLA) & SLA Performance Reports', clauseRef: 'Clause 8.3.3', isMandatory: true, purpose: 'Agreed availability, response times, and resolution targets with customers.', auditorCheck: 'Auditor inspects monthly SLA reports and breach penalty calculations.' },
      { id: 'doc-20k-3', title: 'Change Management & Emergency Change Procedure', clauseRef: 'Clause 8.5.1', isMandatory: true, purpose: 'CAB approvals, risk scoring, rollback plans, and emergency change protocols.', auditorCheck: 'Audit trail of unauthorized or failed production changes.' },
      { id: 'doc-20k-4', title: 'Problem Management & Known Error Database (KEDB)', clauseRef: 'Clause 8.5.9', isMandatory: true, purpose: 'Investigating underlying root causes of recurring incidents.', auditorCheck: 'Verification of workarounds documented in KEDB.' }
    ],
    auditorExpectations: [
      'Auditors trace an incident from initial alert to ticket closure and problem record creation',
      'Emergency changes (ECAB) must have retroactive documentation and post-implementation reviews',
      'Capacity management reports must predict upcoming infrastructure thresholds before outages occur'
    ],
    commonNonConformities: [
      'Incidents closed without customer confirmation or root cause classification',
      'Changes deployed to production without required testing evidence or formal approval',
      'No formal Problem Management process (treating every recurrence as a fresh incident)'
    ],
    interviewPrep: [
      {
        question: 'How do you differentiate between an Incident and a Problem in your IT service operations?',
        auditorIntent: 'Testing understanding of Clause 8.5.9 Incident vs Problem Management.',
        recommendedAnswer: 'An Incident is an unplanned interruption or reduction in service quality, focused on restoring service as fast as possible. A Problem is the underlying root cause of one or more incidents, focused on permanent resolution and recording known workarounds in the KEDB.',
        evidenceToProduce: 'Incident tickets linked to Problem investigations in Jira/ServiceNow.'
      }
    ],
    implementationRoadmap: [
      { stepNumber: 1, title: 'Service Catalogue & Customer SLA Baseline', phase: 'Planning', description: 'Define in-scope IT services and publish formal SLA metrics.', deliverables: ['Service Catalogue', 'SLA Master Contract'] },
      { stepNumber: 2, title: 'Incident & Service Request Workflow', phase: 'Implementation', description: 'Configure ticketing tiers, escalation matrices, and resolution runbooks.', deliverables: ['ITSM Service Desk Runbook'] },
      { stepNumber: 3, title: 'Change & Release Governance Setup', phase: 'Implementation', description: 'Establish CAB board, change approval thresholds, and release packaging standards.', deliverables: ['Change Management Policy'] },
      { stepNumber: 4, title: 'Problem Management & KEDB Deployment', phase: 'Operation', description: 'Track recurring incidents and build searchable Known Error Database.', deliverables: ['KEDB Repository'] },
      { stepNumber: 5, title: 'ISO 20000-1 Certification Audit', phase: 'Evaluation & Certification', description: 'Undergo external Stage 1 & 2 audit for IT service management.', deliverables: ['ISO 20000-1 Certificate'] }
    ],
    synergiesWithOtherStandards: ['ISO 27001 (Shared Change and Incident management workflows)', 'ISO 22301 (IT Service Continuity aligns with Disaster Recovery)']
  },
  {
    id: 'iso-22301',
    code: 'ISO 22301',
    name: 'Business Continuity Management System (BCMS)',
    edition: 'ISO 22301:2019',
    category: 'Information Security & IT',
    badge: 'Resilience & BCP',
    summary: 'The premier international standard for Business Continuity Management Systems, enabling organizations to withstand, respond to, and recover from disruptive incidents.',
    targetIndustries: ['Banking & Financial Infrastructure', 'Telecommunications & Utilities', 'Data Centers & Cloud Hosting', 'Critical National Infrastructure', 'Healthcare Systems'],
    keyBenefits: [
      'Guarantees operational survival during ransomware, natural disasters, or grid outages',
      'Quantifies Maximum Tolerable Period of Disruption (MTPD) for all core business activities',
      'Satisfies financial regulator resilience rules (e.g. DORA, MAS TRM, Fed BCP handbook)',
      'Provides rehearsed incident command structures for crisis communication'
    ],
    annexSlCompatible: true,
    mandatoryDocumentsCount: 9,
    totalControlsOrClauses: 'Clauses 4-10 + Clause 8 Operational Continuity',
    coreClauses: [
      { clause: 'Clause 8.2.2', title: 'Business Impact Analysis (BIA)', description: 'Assessing the impacts of disruption over time.', keyRequirement: 'Must identify prioritized activities, dependencies, resources, and determine RTO and RPO.' },
      { clause: 'Clause 8.2.3', title: 'Risk Assessment', description: 'Systematically assessing risk of operational disruptions.', keyRequirement: 'Must evaluate threats from power, supply chain, cyberattack, flood, and pandemic.' },
      { clause: 'Clause 8.4', title: 'Business Continuity Plans & Procedures', description: 'Actionable response and recovery documentation.', keyRequirement: 'Documented invocation criteria, incident command team roles, and step-by-step recovery SOPs.' },
      { clause: 'Clause 8.5', title: 'Exercise Programme', description: 'Testing continuity capabilities against realistic scenarios.', keyRequirement: 'Periodic tabletop, simulation, and live failover tests with post-exercise evaluations.' }
    ],
    mandatoryDocuments: [
      { id: 'doc-22k-1', title: 'BCMS Policy & Objectives', clauseRef: 'Clauses 5.2 & 6.2', isMandatory: true, purpose: 'Executive commitment to resilience and quantified recovery targets.', auditorCheck: 'Auditor checks that recovery time objectives align with customer commitments.' },
      { id: 'doc-22k-2', title: 'Business Impact Analysis (BIA) Reports', clauseRef: 'Clause 8.2.2', isMandatory: true, purpose: 'Documented MTPD, RTO, and RPO for all business activities and supporting IT systems.', auditorCheck: 'Auditor samples departmental BIAs and checks justification for RTO/RPO numbers.' },
      { id: 'doc-22k-3', title: 'Disaster Recovery (DR) & Business Continuity Plans (BCP)', clauseRef: 'Clause 8.4', isMandatory: true, purpose: 'Step-by-step procedures to recover systems, relocate personnel, and restore operations.', auditorCheck: 'Auditor verifies plans do not rely on single points of failure.' },
      { id: 'doc-22k-4', title: 'BCMS Exercise & Simulation Reports', clauseRef: 'Clause 8.5', isMandatory: true, purpose: 'Documented test results from annual tabletop drills and live secondary site failovers.', auditorCheck: 'Auditor examines action items generated from test failures.' }
    ],
    auditorExpectations: [
      'Auditors expect realistic recovery exercise evidence with signed participation logs and timed metrics',
      'The BIA cannot be high-level guesswork; it must quantify financial and reputational losses over 4h, 24h, 48h, 7d',
      'Crisis communication plans must include designated spokespersons and tested notification cascades'
    ],
    commonNonConformities: [
      'BCP plans never tested or tested only via theoretical walkthrough without live simulation',
      'BIA out of date (new applications or operational facilities not factored into recovery tiers)',
      'Backup restoration tests never conducted to prove data integrity from snapshot vaults'
    ],
    interviewPrep: [
      {
        question: 'What is the difference between RTO and RPO, and how did you establish them in your organization?',
        auditorIntent: 'Testing core knowledge of Clause 8.2.2 Business Impact Analysis.',
        recommendedAnswer: 'Recovery Time Objective (RTO) is the maximum acceptable duration to restore an activity after disruption (e.g. 4 hours for transactional APIs). Recovery Point Objective (RPO) is the maximum acceptable data loss measured in time (e.g. 15 minutes of database transactions). We establish these through departmental BIA interviews evaluating financial loss and legal penalties over time.',
        evidenceToProduce: 'Approved Business Impact Analysis report and Executive Sign-off.'
      }
    ],
    implementationRoadmap: [
      { stepNumber: 1, title: 'Context & BCMS Policy Formulation', phase: 'Planning', description: 'Establish business continuity steering committee and policy.', deliverables: ['BCMS Policy', 'Governance Charter'] },
      { stepNumber: 2, title: 'Enterprise Business Impact Analysis (BIA)', phase: 'Planning', description: 'Survey all business units, identify critical activities, and set RTO/RPO.', deliverables: ['Master BIA Report'] },
      { stepNumber: 3, title: 'Continuity Strategy & Resource Allocation', phase: 'Implementation', description: 'Procure secondary cloud regions, redundant power, and alternate work sites.', deliverables: ['Continuity Strategy Dossier'] },
      { stepNumber: 4, title: 'BCP & DR Plan Development', phase: 'Implementation', description: 'Draft actionable incident response runbooks and call trees.', deliverables: ['Disaster Recovery Runbooks'] },
      { stepNumber: 5, title: 'Simulation Drill & Certification Audit', phase: 'Evaluation & Certification', description: 'Execute comprehensive disaster recovery drill, remediate gaps, and achieve certification.', deliverables: ['Drill Report', 'ISO 22301 Certificate'] }
    ],
    synergiesWithOtherStandards: ['ISO 27001 (Annex A.8.14 Redundancy & A.8.13 Backup)', 'DORA (EU Financial operational resilience aligns 100% with ISO 22301)', 'MAS TRM (Critical systems business continuity requirements)']
  },
  {
    id: 'iso-17025',
    code: 'ISO 17025',
    name: 'Testing and Calibration Laboratories Competence',
    edition: 'ISO/IEC 17025:2017',
    category: 'Quality & Engineering',
    badge: 'Lab Accreditation',
    summary: 'The international reference standard for testing and calibration laboratories, ensuring technical competence, impartiality, and consistent valid results.',
    targetIndustries: ['Analytical & Chemical Testing Labs', 'Metrology & Calibration Facilities', 'Forensic Laboratories', 'Environmental Sampling Labs', 'Biotechnology R&D'],
    keyBenefits: [
      'International recognition of test reports and calibration certificates via ILAC MRA',
      'Guarantees measurement traceability to the International System of Units (SI)',
      'Mandatory for regulatory testing compliance (food, pharma, automotive emissions)',
      'Eliminates need for client re-testing across global import/export markets'
    ],
    annexSlCompatible: false, // Standard uses structural requirements tailored for laboratory workflows
    mandatoryDocumentsCount: 16,
    totalControlsOrClauses: 'Clauses 4-8 (General, Structural, Resource, Process, Management)',
    coreClauses: [
      { clause: 'Clause 4.1', title: 'Impartiality', description: 'Safeguarding laboratory objectivity.', keyRequirement: 'Ongoing risk assessment to identify and eliminate pressures that compromise impartiality.' },
      { clause: 'Clause 6.5', title: 'Metrological Traceability', description: 'Establishing unbroken chain of calibrations to SI units.', keyRequirement: 'Calibration certificates must state measurement uncertainty and trace to NMI or accredited lab.' },
      { clause: 'Clause 7.2', title: 'Selection, Verification and Validation of Methods', description: 'Scientific validity of testing methods.', keyRequirement: 'Documented method validation reports establishing accuracy, precision, and detection limits.' },
      { clause: 'Clause 7.7', title: 'Ensuring the Validity of Results', description: 'Quality control procedures.', keyRequirement: 'Participation in Proficiency Testing (PT) programs and use of reference materials.' }
    ],
    mandatoryDocuments: [
      { id: 'doc-17k-1', title: 'Laboratory Quality Manual & Impartiality Policy', clauseRef: 'Clause 4.1 & 8.2', isMandatory: true, purpose: 'Commitment to technical excellence and freedom from commercial pressures.', auditorCheck: 'Auditor checks commercial incentives for lab technicians.' },
      { id: 'doc-17k-2', title: 'Method Validation Dossiers & Uncertainty Budgets', clauseRef: 'Clause 7.2 & 7.6', isMandatory: true, purpose: 'Calculated measurement uncertainty budgets for every accredited test parameter.', auditorCheck: 'Auditor verifies statistical formulas used in uncertainty calculations.' },
      { id: 'doc-17k-3', title: 'Metrological Traceability & Equipment Calibration Certificates', clauseRef: 'Clause 6.5', isMandatory: true, purpose: 'Proof of unbroken calibration chain to national metrology institutes (e.g. NIST, NPL).', auditorCheck: 'Auditor verifies calibration expiry dates on active lab instruments.' },
      { id: 'doc-17k-4', title: 'Proficiency Testing (PT) & Inter-Laboratory Comparison Reports', clauseRef: 'Clause 7.7.2', isMandatory: true, purpose: 'Independent blind sample testing results comparing lab accuracy to peers.', auditorCheck: 'Auditor inspects any z-scores > 2.0 and required root cause CAPAs.' }
    ],
    auditorExpectations: [
      'Technical assessors conduct live witness testing of accredited methods in the laboratory',
      'Technician training files must include blinded round-robin competency evaluations',
      'Sample storage temperature logs must show uninterrupted calibration tracking'
    ],
    commonNonConformities: [
      'Measurement uncertainty not calculated or omitting key environmental variables',
      'Failure to participate in required proficiency testing schemes for accredited scopes',
      'Test reports issued without required accreditation symbols or containing unauthorized disclaimer statements'
    ],
    interviewPrep: [
      {
        question: 'How do you calculate and report measurement uncertainty for your test results?',
        auditorIntent: 'Evaluating Clause 7.6 Evaluation of Measurement Uncertainty.',
        recommendedAnswer: 'We construct a GUM-compliant uncertainty budget identifying Type A (statistical repeatability) and Type B (equipment resolution, calibration certs, temperature drift) components. We combine these using root-sum-square and apply a coverage factor of k=2 for a 95% confidence level.',
        evidenceToProduce: 'Uncertainty budget spreadsheet and sample test certificate.'
      }
    ],
    implementationRoadmap: [
      { stepNumber: 1, title: 'Scope Selection & Method Standard Selection', phase: 'Planning', description: 'Define specific test parameters (e.g. ASTM, ISO test methods) for accreditation.', deliverables: ['Accreditation Scope Schedule'] },
      { stepNumber: 2, title: 'Equipment Calibration & Traceability Verification', phase: 'Planning', description: 'Calibrate all measuring instruments with ISO 17025 accredited calibration labs.', deliverables: ['Master Calibration Log'] },
      { stepNumber: 3, title: 'Method Validation & Uncertainty Evaluation', phase: 'Implementation', description: 'Validate methods and compile measurement uncertainty budgets.', deliverables: ['Validation Reports', 'Uncertainty Budgets'] },
      { stepNumber: 4, title: 'Proficiency Testing & Quality Control Implementation', phase: 'Operation', description: 'Enroll in external PT programs and run control charts.', deliverables: ['PT Result Certificates', 'Shewhart Control Charts'] },
      { stepNumber: 5, title: 'Accreditation Body Assessment', phase: 'Evaluation & Certification', description: 'Undergo on-site witness assessment by accreditation body (e.g. UKAS, A2LA, PJLA).', deliverables: ['ISO/IEC 17025 Certificate of Accreditation'] }
    ],
    synergiesWithOtherStandards: ['ISO 9001 (Management system clauses conform)', 'ISO 13485 & IATF 16949 (Testing laboratory qualification)']
  },
  {
    id: 'nis2',
    code: 'NIS2',
    name: 'EU Network & Information Systems Directive 2',
    edition: 'Directive (EU) 2022/2555',
    category: 'European Regulations',
    badge: 'EU Cyber Mandate',
    summary: 'The comprehensive European cybersecurity law mandating strict baseline security, executive liability, and rapid incident reporting for essential and important entities across the EU.',
    targetIndustries: ['Energy & Water Utilities', 'Banking & Financial Market Infra', 'Healthcare Providers', 'Digital Infrastructure (DNS, Cloud, IXP)', 'Public Administration', 'Managed Security Providers'],
    keyBenefits: [
      'Shields organizations from fines up to €10M or 2% of global annual turnover',
      'Protects C-suite executives from personal administrative suspensions and disqualifications',
      'Establishes defensible supply chain cybersecurity risk management',
      'Enforces rapid 24-hour early warning incident notification to national CSIRTs'
    ],
    annexSlCompatible: false, // EU Statutory Directive (maps directly to ISO 27001 controls)
    mandatoryDocumentsCount: 10,
    totalControlsOrClauses: 'Article 21 (10 Mandatory Cybersecurity Measures)',
    coreClauses: [
      { clause: 'Article 20', title: 'Governance & Management Body Responsibility', description: 'Personal executive liability for cybersecurity.', keyRequirement: 'Management bodies must approve risk measures, undergo cybersecurity training, and oversee implementation.' },
      { clause: 'Article 21', title: 'Cybersecurity Risk-Management Measures', description: '10 mandatory technical and organizational safeguards.', keyRequirement: 'Must implement MFA, cryptography, supply chain security, vulnerability handling, and business continuity.' },
      { clause: 'Article 23', title: 'Reporting Obligations (24h Early Warning & 72h Notification)', description: 'Staged reporting of significant incidents.', keyRequirement: '24-hour early warning to CSIRT, 72-hour incident notification, and 1-month final report.' }
    ],
    mandatoryDocuments: [
      { id: 'doc-nis2-1', title: 'NIS2 Entity Classification & Scope Assessment', clauseRef: 'Articles 2 & 3', isMandatory: true, purpose: 'Determination whether organization is an Essential or Important entity under annexes I & II.', auditorCheck: 'Auditor checks employee count and turnover thresholds.' },
      { id: 'doc-nis2-2', title: 'Management Body Cybersecurity Oversight Charter', clauseRef: 'Article 20', isMandatory: true, purpose: 'Documented evidence of board training and formal sign-off on risk budgets.', auditorCheck: 'Records of C-suite cybersecurity training attendance.' },
      { id: 'doc-nis2-3', title: 'Article 21 10-Point Technical Compliance Dossier', clauseRef: 'Article 21', isMandatory: true, purpose: 'Technical evidence covering risk analysis, incident handling, BCM, supply chain, cryptography, and MFA.', auditorCheck: 'Auditor checks supply chain contractual clauses with suppliers.' },
      { id: 'doc-nis2-4', title: '24-Hour CSIRT Rapid Notification Runbook', clauseRef: 'Article 23', isMandatory: true, purpose: 'Actionable protocol to notify national CSIRT within 24 hours of detecting significant incident.', auditorCheck: 'Simulation drill proving notification payload can be compiled in < 24h.' }
    ],
    auditorExpectations: [
      'National regulators and external auditors evaluate Board of Directors training logs',
      'Supply chain vendor assessments must include direct security assessments of critical software suppliers',
      'MFA must be enforced ubiquitously across all administrative and user interfaces'
    ],
    commonNonConformities: [
      'No documented process for meeting the 24-hour CSIRT incident notification window',
      'Board of directors has not received formal cybersecurity training mandated by Article 20',
      'Supply chain security omitted (only auditing internal systems without vetting sub-processors)'
    ],
    interviewPrep: [
      {
        question: 'What constitutes a "significant incident" under NIS2, and what are your notification deadlines?',
        auditorIntent: 'Evaluating Article 23 Reporting Obligations readiness.',
        recommendedAnswer: 'An incident is significant if it causes severe operational disruption or financial loss, or impacts natural/legal persons by causing material or non-material damage. We must file an Early Warning to our national CSIRT within 24 hours, followed by an Incident Notification within 72 hours, and a Final Root Cause Report within 1 month.',
        evidenceToProduce: 'Incident reporting SOP and CSIRT notification template.'
      }
    ],
    implementationRoadmap: [
      { stepNumber: 1, title: 'NIS2 Applicability & Entity Classification', phase: 'Planning', description: 'Confirm whether company qualifies as Essential or Important Entity.', deliverables: ['NIS2 Scoping Dossier'] },
      { stepNumber: 2, title: 'Board Governance & Training Setup', phase: 'Planning', description: 'Deliver mandatory cybersecurity training to Executive Board.', deliverables: ['Board Training Certificates'] },
      { stepNumber: 3, title: 'Article 21 Technical Controls Gap Closure', phase: 'Implementation', description: 'Deploy zero-trust MFA, automated vulnerability scanning, and encryption.', deliverables: ['Technical Verification Report'] },
      { stepNumber: 4, title: 'Supply Chain Vendor Risk Screening', phase: 'Implementation', description: 'Audit tier-1 IT suppliers and insert mandatory cybersecurity contractual clauses.', deliverables: ['Supplier Audit Records'] },
      { stepNumber: 5, title: 'CSIRT 24-Hour Notification Drill & Regulatory Filing', phase: 'Operation', description: 'Conduct mock incident drill testing 24-hour alert generation.', deliverables: ['Drill Report', 'National Competent Authority Dossier'] }
    ],
    synergiesWithOtherStandards: ['ISO 27001 (ISO 27001 satisfies 85% of NIS2 Article 21 requirements)', 'DORA (Exempts entities regulated by DORA as lex specialis)', 'EU GDPR (Shared personal data breach reporting workflows)']
  },
  {
    id: 'gdpr',
    code: 'EU GDPR',
    name: 'General Data Protection Regulation',
    edition: 'Regulation (EU) 2016/679',
    category: 'European Regulations',
    badge: 'Privacy Law',
    summary: 'The benchmark European privacy regulation governing the processing of personal data, granting enforceable rights to data subjects and imposing severe fines for non-compliance.',
    targetIndustries: ['All Organizations Processing EU Citizen Data', 'E-commerce & AdTech', 'SaaS Providers', 'Healthcare & Clinical Trials', 'Human Resources & Recruitment'],
    keyBenefits: [
      'Protects against fines up to €20M or 4% of total worldwide annual turnover',
      'Builds deep consumer trust through privacy by design and transparent processing',
      'Prevents regulatory enforcement bans on international cross-border data transfers',
      'Provides systematic handling of Data Subject Access Requests (DSARs)'
    ],
    annexSlCompatible: false, // Statutory Regulation
    mandatoryDocumentsCount: 12,
    totalControlsOrClauses: 'Articles 1-99 (Core focus on Articles 5, 6, 12-22, 28, 30, 32, 33, 35)',
    coreClauses: [
      { clause: 'Article 5', title: 'Principles relating to Processing of Personal Data', description: 'Fundamental data processing tenets.', keyRequirement: 'Lawfulness, fairness, transparency, purpose limitation, data minimization, accuracy, storage limitation, integrity, and accountability.' },
      { clause: 'Article 30', title: 'Records of Processing Activities (ROPA)', description: 'Catalog of personal data processing operations.', keyRequirement: 'Detailed register documenting processing purposes, data categories, recipient categories, retention periods, and security measures.' },
      { clause: 'Article 32', title: 'Security of Processing', description: 'Technical and organizational measures.', keyRequirement: 'Pseudonymization, encryption, ongoing confidentiality, integrity, availability, and regular testing of security.' },
      { clause: 'Article 33/34', title: 'Personal Data Breach Notification (72h Deadline)', description: 'Notification of supervisory authority and data subjects.', keyRequirement: 'Must report personal data breach to Data Protection Authority (DPA) within 72 hours of becoming aware.' },
      { clause: 'Article 35', title: 'Data Protection Impact Assessment (DPIA)', description: 'Mandatory risk assessment for high-risk processing.', keyRequirement: 'Must assess necessity, proportionality, and risks to rights and freedoms for novel technologies or automated profiling.' }
    ],
    mandatoryDocuments: [
      { id: 'doc-gdp-1', title: 'Privacy Notice (Customer & Employee)', clauseRef: 'Articles 13 & 14', isMandatory: true, purpose: 'Transparent communication of data collection, legal bases, retention, and rights.', auditorCheck: 'Auditor checks that privacy policy is written in clear, plain language.' },
      { id: 'doc-gdp-2', title: 'Record of Processing Activities (ROPA)', clauseRef: 'Article 30', isMandatory: true, purpose: 'Master registry of all personal data workflows across departments.', auditorCheck: 'Verification that legal basis is documented for every single processing activity.' },
      { id: 'doc-gdp-3', title: 'Data Protection Impact Assessment (DPIA) Reports', clauseRef: 'Article 35', isMandatory: true, purpose: 'Risk assessments for AI profiling, biometric processing, or large-scale health data.', auditorCheck: 'Auditor examines how identified privacy risks were mitigated.' },
      { id: 'doc-gdp-4', title: 'Data Processing Agreements (DPAs) & SCCs', clauseRef: 'Article 28 & Chapter V', isMandatory: true, purpose: 'Binding contracts with vendor sub-processors and Standard Contractual Clauses for transfers.', auditorCheck: 'Proof that all sub-processors have signed GDPR Article 28 terms.' },
      { id: 'doc-gdp-5', title: '72-Hour Personal Data Breach Protocol', clauseRef: 'Articles 33 & 34', isMandatory: true, purpose: 'Actionable procedures to detect, investigate, and notify DPA within 72 hours.', auditorCheck: 'Auditor verifies incident triage log contains personal data breach scoring.' }
    ],
    auditorExpectations: [
      'Auditors sample Data Subject Access Requests (DSARs) to verify responses within 30 days',
      'The ROPA cannot be empty boilerplate; it must list specific third-party tools (AWS, HubSpot, Stripe)',
      'Cookie consent banners must demonstrate valid affirmative opt-in with zero pre-ticked boxes'
    ],
    commonNonConformities: [
      'Failing to maintain an up-to-date Article 30 ROPA register',
      'No Data Processing Agreement (DPA) signed with cloud vendors handling personal data',
      'No evidence of technical pseudonymization or encryption at rest for PII databases'
    ],
    interviewPrep: [
      {
        question: 'What do you do if a customer exercises their Right to Erasure ("Right to be Forgotten")?',
        auditorIntent: 'Evaluating Article 17 Right to Erasure procedures.',
        recommendedAnswer: 'The request is logged and verified for identity within 48 hours. We check whether statutory retention obligations apply (e.g. tax records). If no legal exception exists, we delete or anonymize personal data across primary databases and sub-processors within 30 days, issuing a formal confirmation letter to the data subject.',
        evidenceToProduce: 'DSAR ticket history and data deletion verification log.'
      }
    ],
    implementationRoadmap: [
      { stepNumber: 1, title: 'Personal Data Mapping & ROPA Creation', phase: 'Planning', description: 'Discover where PII resides across email, CRM, HR, and cloud databases.', deliverables: ['Article 30 ROPA'] },
      { stepNumber: 2, title: 'Privacy Notices & Consent Mechanisms', phase: 'Planning', description: 'Update website privacy notice, cookie banners, and employee privacy disclosures.', deliverables: ['Privacy Notices', 'Consent Management Platform'] },
      { stepNumber: 3, title: 'Vendor DPAs & Cross-Border Transfer Mechanisms', phase: 'Implementation', description: 'Execute DPAs with all suppliers and attach Standard Contractual Clauses (SCCs).', deliverables: ['Signed DPAs Repository'] },
      { stepNumber: 4, title: 'Technical Security & DPIA Governance', phase: 'Implementation', description: 'Implement AES-256 encryption, access controls, and DPIA review workflows.', deliverables: ['DPIA Dossiers', 'Encryption Proof'] },
      { stepNumber: 5, title: 'Breach Response & DSAR Operations', phase: 'Operation', description: 'Conduct mock 72-hour breach drill and establish 30-day DSAR turnaround.', deliverables: ['Breach Runbook', 'DSAR Fulfillment Log'] }
    ],
    synergiesWithOtherStandards: ['ISO 27701 (Privacy Information Management extension to ISO 27001)', 'ISO 27001 (Article 32 Security of processing maps to ISO 27001 Annex A)']
  },
  {
    id: 'dora',
    code: 'DORA',
    name: 'Digital Operational Resilience Act',
    edition: 'Regulation (EU) 2022/2554',
    category: 'European Regulations',
    badge: 'EU FinTech Mandate',
    summary: 'The EU landmark regulation consolidating digital resilience rules across the European financial sector, mandating strict ICT risk governance, threat intelligence sharing, and third-party oversight.',
    targetIndustries: ['Banks & Credit Institutions', 'Investment Firms & Crypto Asset Service Providers (CASPs)', 'Insurance Undertakings', 'Payment Institutions', 'Critical ICT Third-Party Providers (Cloud, Core Banking)'],
    keyBenefits: [
      'Protects against financial regulatory sanctions and operational shutdowns across the EU',
      'Harmonizes ICT risk management across banking, insurance, and investment sectors',
      'Mandates rigorous Advanced Threat-Led Penetration Testing (TLPT) like TIBER-EU',
      'Requires full transparency and exit strategies for critical cloud and SaaS providers'
    ],
    annexSlCompatible: false, // EU Financial Regulation
    mandatoryDocumentsCount: 11,
    totalControlsOrClauses: '5 Core Pillars: ICT Risk, Incident Reporting, Resilience Testing, Third-Party Risk, Info Sharing',
    coreClauses: [
      { clause: 'Chapter II (Arts 5-16)', title: 'ICT Risk Management Framework', description: 'Comprehensive governance of digital infrastructure.', keyRequirement: 'Board-approved ICT strategy, business impact analysis, multi-vendor redundancy, and continuous monitoring.' },
      { clause: 'Chapter III (Arts 17-23)', title: 'Management, Classification & Reporting of Major ICT Incidents', description: 'Strict incident escalation thresholds.', keyRequirement: 'Initial notification within 4 hours, intermediate report within 72 hours, and final report within 1 month.' },
      { clause: 'Chapter IV (Arts 24-27)', title: 'Digital Operational Resilience Testing & TLPT', description: 'Regular testing including threat-led penetration testing.', keyRequirement: 'Annual vulnerability scans, periodic scenario testing, and advanced TLPT at least once every 3 years.' },
      { clause: 'Chapter V (Arts 28-44)', title: 'Managing ICT Third-Party Risk & Register of Information', description: 'Strict governance of critical ICT suppliers.', keyRequirement: 'Mandatory Register of Information on all ICT contracts, contractual exit strategies, and concentration risk audits.' }
    ],
    mandatoryDocuments: [
      { id: 'doc-dora-1', title: 'ICT Risk Management Framework & Digital Resilience Strategy', clauseRef: 'Articles 5 & 6', isMandatory: true, purpose: 'Board-approved governance policy detailing digital architecture, RTO/RPO targets, and risk tolerance.', auditorCheck: 'Auditor checks that Management Body explicitly approves the ICT budget and strategy.' },
      { id: 'doc-dora-2', title: 'Register of Information on ICT Third-Party Contracts', clauseRef: 'Article 28(3)', isMandatory: true, purpose: 'Standardized regulatory register documenting every ICT contract, critical functions, and provider locations.', auditorCheck: 'Auditor verifies ESA standard template compliance.' },
      { id: 'doc-dora-3', title: 'Major ICT Incident Classification & 4-Hour Escalation Runbook', clauseRef: 'Articles 18 & 19', isMandatory: true, purpose: 'Protocol to classify major ICT disruptions and submit mandatory reports to national authorities.', auditorCheck: 'Verification of 4-hour initial notification drill results.' },
      { id: 'doc-dora-4', title: 'Threat-Led Penetration Testing (TLPT) Program & TIBER-EU Dossier', clauseRef: 'Article 26', isMandatory: true, purpose: 'Scope and certified tester reports for live adversarial simulations on live production environments.', auditorCheck: 'Proof that external ethical hackers were certified (e.g. CREST).' },
      { id: 'doc-dora-5', title: 'ICT Third-Party Exit Strategy & Transition Runbook', clauseRef: 'Article 28(8)', isMandatory: true, purpose: 'Feasibility plans and testing of moving critical workloads away from cloud providers without disruption.', auditorCheck: 'Auditor checks whether exit plans have actually been tested.' }
    ],
    auditorExpectations: [
      'Financial regulators (EBA, EIOPA, ESMA) directly inspect the Register of Information on ICT contracts',
      'The Board of Directors must demonstrate active oversight—passive IT delegation is rejected',
      'Exit strategies must prove zero lock-in for critical functions supporting customer deposits/payments'
    ],
    commonNonConformities: [
      'Incomplete Register of Information (missing sub-contractor chain for cloud SaaS solutions)',
      'No formal Threat-Led Penetration Testing (TLPT) program for entities deemed significant',
      'Lack of testing evidence for ICT business continuity and disaster recovery plans'
    ],
    interviewPrep: [
      {
        question: 'How do you monitor and manage concentration risk among your critical cloud and ICT providers?',
        auditorIntent: 'Evaluating Chapter V Article 29 Third-Party Concentration Risk governance.',
        recommendedAnswer: 'We document all ICT contracts in our DORA Register of Information, mapping dependencies and critical service tiers. We assess whether alternative vendors exist in the EU market, mandate multi-region failover, and maintain a tested Exit Strategy to prevent single-vendor paralysis.',
        evidenceToProduce: 'DORA Register of Information and Cloud Exit Strategy testing report.'
      }
    ],
    implementationRoadmap: [
      { stepNumber: 1, title: 'DORA Gap Assessment & Entity Scoping', phase: 'Planning', description: 'Determine financial entity status and benchmark against the 5 DORA pillars.', deliverables: ['DORA Readiness Assessment'] },
      { stepNumber: 2, title: 'Register of Information Compilation', phase: 'Planning', description: 'Inventory all ICT service agreements, cloud providers, and sub-contractors.', deliverables: ['DORA Register of Information (ESA format)'] },
      { stepNumber: 3, title: 'ICT Contract Remediation & Exit Strategies', phase: 'Implementation', description: 'Renegotiate contracts to insert Article 30 mandatory terms and draft exit runbooks.', deliverables: ['Remediated Vendor Contracts', 'Exit Plans'] },
      { stepNumber: 4, title: 'Resilience Testing & Threat-Led Pentesting', phase: 'Operation', description: 'Execute comprehensive vulnerability assessments and TIBER-EU penetration test.', deliverables: ['TLPT Attestation Dossier'] },
      { stepNumber: 5, title: 'Regulatory Reporting Validation', phase: 'Evaluation & Certification', description: 'Validate 4h/72h incident reporting mechanisms with national financial supervisory authority.', deliverables: ['Incident Reporting Playbook'] }
    ],
    synergiesWithOtherStandards: ['ISO 27001 (ICT Risk controls map directly to ISO 27001 Annex A)', 'ISO 22301 (BCMS requirements align with DORA ICT business continuity)', 'MAS TRM (Singapore equivalent for financial technology risk)']
  },
  {
    id: 'iatf-16949',
    code: 'IATF 16949',
    name: 'Automotive Quality Management System',
    edition: 'IATF 16949:2016',
    category: 'Quality & Engineering',
    badge: 'Automotive QMS',
    summary: 'The mandatory international quality standard for automotive supply chain suppliers, focusing on defect prevention, reduction of variation, and waste in the supply chain.',
    targetIndustries: ['Tier 1 & Tier 2 Automotive Suppliers', 'Automotive Electronics & Sensors', 'Precision Stamping & Machining', 'Electric Vehicle Battery Assembly'],
    keyBenefits: [
      'Mandatory prerequisite to supply components to OEM automakers (BMW, Toyota, VW, Ford, Tesla)',
      'Incorporates Core Automotive Tools: APQP, FMEA, PPAP, MSA, and SPC',
      'Drastically reduces warranty claim costs, recalls, and PPM (parts per million) defect rates',
      'Provides total product and process traceability down to individual raw material heat lots'
    ],
    annexSlCompatible: true, // Extensions built directly on top of ISO 9001:2015
    mandatoryDocumentsCount: 24,
    totalControlsOrClauses: 'ISO 9001:2015 + Automotive Specific Clauses 4-10',
    coreClauses: [
      { clause: 'Clause 4.4.1.2', title: 'Product Safety', description: 'Rigorous management of safety-related products and processes.', keyRequirement: 'Must designate Product Safety Representative (PSCR), track statutory safety items, and maintain special control plans.' },
      { clause: 'Clause 8.3.2.1', title: 'Design and Development Planning (APQP)', description: 'Advanced Product Quality Planning.', keyRequirement: 'Structured product development gateways from concept through PPAP sign-off.' },
      { clause: 'Clause 8.5.1.1', title: 'Control Plan', description: 'Detailed manufacturing process controls.', keyRequirement: 'Control plans for prototype, pre-launch, and production stages linked directly to PFMEA.' },
      { clause: 'Clause 8.5.6.1.1', title: 'Temporary Change of Process Controls', description: 'Managing backup or bypass methods.', keyRequirement: 'Documented list of backup tools, risk analysis, and daily quality verification during temporary operation.' }
    ],
    mandatoryDocuments: [
      { id: 'doc-iatf-1', title: 'Automotive Quality Manual & Customer Specific Requirements (CSR) Matrix', clauseRef: 'Clause 7.5.1.1', isMandatory: true, purpose: 'QMS manual mapping OEM Customer Specific Requirements (e.g. Ford CSRs, VW Formel Q).', auditorCheck: 'Auditor checks that CSRs are cascaded to manufacturing work instructions.' },
      { id: 'doc-iatf-2', title: 'Failure Mode and Effects Analysis (DFMEA & PFMEA)', clauseRef: 'Clause 8.3.5 & 8.5.1', isMandatory: true, purpose: 'AIAG-VDA harmonized risk analysis calculating Action Priority (AP) for failure modes.', auditorCheck: 'Auditor examines Severity 9 and 10 failure modes and special characteristic controls.' },
      { id: 'doc-iatf-3', title: 'Production Part Approval Process (PPAP) Package', clauseRef: 'Clause 8.3.4.4', isMandatory: true, purpose: '18 PPAP elements including PSW, dimensional results, and material test reports.', auditorCheck: 'Signed Part Submission Warrant (PSW) before any production shipment.' },
      { id: 'doc-iatf-4', title: 'Measurement Systems Analysis (MSA) & Gage R&R Studies', clauseRef: 'Clause 7.1.5.1.1', isMandatory: true, purpose: 'Statistical proof that gages have acceptable repeatability and reproducibility (%GRR < 10%).', auditorCheck: 'Auditor inspects %GRR calculations on critical feature gages.' },
      { id: 'doc-iatf-5', title: 'Statistical Process Control (SPC) Capability Studies', clauseRef: 'Clause 9.1.1.1', isMandatory: true, purpose: 'Cpk and Ppk index calculations proving manufacturing capability (Cpk >= 1.67 for critical).', auditorCheck: 'Auditor audits out-of-control reaction plans on shop floor SPC charts.' }
    ],
    auditorExpectations: [
      'Auditors trace the complete chain: Customer Drawing -> DFMEA -> PFMEA -> Control Plan -> Work Instructions -> Inspection Sheet',
      'Any customer complaint (0km or warranty) must have a formal 8D problem-solving report with verified permanent corrective action',
      'Auditors strictly verify third-party calibration lab accreditations (must be ISO 17025 accredited)'
    ],
    commonNonConformities: [
      'Discrepancies between PFMEA and Control Plan (characteristics listed in PFMEA missing from Control Plan)',
      'Internal auditors lack required IATF 16949 internal auditor qualification credentials',
      'No evidence of daily verification of error-proofing (Poka-Yoke) sensors'
    ],
    interviewPrep: [
      {
        question: 'How do you ensure Customer Specific Requirements (CSRs) are addressed in your manufacturing processes?',
        auditorIntent: 'Evaluating Clause 7.5.1.1 and Clause 4.3.2 Customer Specific Requirements.',
        recommendedAnswer: 'We maintain a Customer Specific Requirements Matrix mapping each OEM customer (e.g. Ford, GM, VW) to our internal processes. When changes occur, the cross-functional team updates the relevant APQP gate, PFMEA, and Control Plan, verifying operator training before production sign-off.',
        evidenceToProduce: 'CSR Cross-Reference Matrix and sample Customer Audit Scorecard.'
      }
    ],
    implementationRoadmap: [
      { stepNumber: 1, title: 'ISO 9001 Foundation & CSR Integration', phase: 'Planning', description: 'Ensure ISO 9001 baseline is established and map OEM Customer Specific Requirements.', deliverables: ['CSR Matrix'] },
      { stepNumber: 2, title: 'Automotive Core Tools Deployment', phase: 'Planning', description: 'Train engineering team on APQP, AIAG-VDA FMEA, MSA, SPC, and PPAP.', deliverables: ['Core Tools Certifications'] },
      { stepNumber: 3, title: 'PFMEA & Control Plan Standardization', phase: 'Implementation', description: 'Draft comprehensive process flow diagrams, PFMEAs, and dynamic Control Plans.', deliverables: ['PFMEA Dossiers', 'Control Plans'] },
      { stepNumber: 4, title: 'Internal Automotive Quality Audit & 8D Discipline', phase: 'Operation', description: 'Conduct manufacturing process audits (CQI) and layered process audits (LPA).', deliverables: ['LPA Audit Logs', '8D Closure Reports'] },
      { stepNumber: 5, title: 'IATF 16949 Certification Audit', phase: 'Evaluation & Certification', description: 'Stage 1 readiness review and Stage 2 on-site audit by IATF-recognized certification body.', deliverables: ['IATF 16949 Certificate'] }
    ],
    synergiesWithOtherStandards: ['ISO 9001 (Direct parent standard)', 'ISO 14001 (Environmental sustainability in automotive plants)', 'ISO 45001 (Workplace safety on manufacturing lines)']
  },
  {
    id: 'as9100',
    code: 'AS9100',
    name: 'Aerospace & Defense Quality Management System',
    edition: 'AS9100D / EN 9100:2018',
    category: 'Quality & Engineering',
    badge: 'Aero & Defense',
    summary: 'The standardized quality management system for the aviation, space, and defense industries, enforcing rigorous flight safety, counterfeit parts prevention, and configuration management.',
    targetIndustries: ['Commercial Aviation Suppliers', 'Space Systems & Satellite Manufacturers', 'Defense Contractors & Munitions', 'Aerospace Avionics & CNC Machining', 'Maintenance, Repair & Overhaul (MRO)'],
    keyBenefits: [
      'Required for listing on OASIS (Online Aerospace Supplier Information System)',
      'Mandatory prerequisite for contracts with Boeing, Airbus, Lockheed Martin, Northrop Grumman, and NASA',
      'Guarantees foreign object debris (FOD) elimination and counterfeit electronic part avoidance',
      'Provides lifetime traceability and strict engineering configuration change control'
    ],
    annexSlCompatible: true, // Based directly on ISO 9001:2015 with aerospace extensions
    mandatoryDocumentsCount: 20,
    totalControlsOrClauses: 'ISO 9001:2015 + Aerospace Specific Clauses 4-10',
    coreClauses: [
      { clause: 'Clause 8.1.1', title: 'Operational Risk Management', description: 'Mitigating operational risks that impact flight safety.', keyRequirement: 'Must identify, assess, and treat risks in operational processes (e.g. tooling wear, supplier capability).' },
      { clause: 'Clause 8.1.2', title: 'Configuration Management', description: 'Controlling product baselines from design to obsolescence.', keyRequirement: 'Must maintain configuration identification, change control, and configuration status accounting.' },
      { clause: 'Clause 8.1.3', title: 'Product Safety', description: 'Managing aspects critical to safety throughout lifecycle.', keyRequirement: 'Hazard analysis, safety critical items tracking, and safety reporting without fear of retribution.' },
      { clause: 'Clause 8.1.4', title: 'Prevention of Counterfeit Parts', description: 'Mitigating risks of counterfeit materials.', keyRequirement: 'Procurement only from authorized sources, component testing, quarantine, and reporting suspected counterfeits.' },
      { clause: 'Clause 8.5.1.1', title: 'First Article Inspection (AS9102)', description: 'Verification of initial production run.', keyRequirement: 'Form 1, Form 2, and Form 3 documentation verifying 100% of engineering drawing dimensions.' }
    ],
    mandatoryDocuments: [
      { id: 'doc-as-1', title: 'Aerospace Quality Manual & OASIS Registration Dossier', clauseRef: 'Clause 7.5.1.1', isMandatory: true, purpose: 'Comprehensive AS9100D governance manual detailing aerospace process interactions.', auditorCheck: 'Auditor checks that exclusions do not compromise flight safety.' },
      { id: 'doc-as-2', title: 'Counterfeit Parts Prevention Program (AS5553 / AS6174)', clauseRef: 'Clause 8.1.4', isMandatory: true, purpose: 'Protocols for sourcing electronic and mechanical components from franchised distributors.', auditorCheck: 'Auditor inspects Certificates of Conformance (CoC) and distributor authorizations.' },
      { id: 'doc-as-3', title: 'Foreign Object Debris (FOD) Prevention Runbook (NAS 412)', clauseRef: 'Clause 8.5.4', isMandatory: true, purpose: 'Clean manufacturing protocols, tool shadowing, and cleanroom FOD inspection logs.', auditorCheck: 'Auditor checks tool control and shop floor FOD barriers.' },
      { id: 'doc-as-4', title: 'First Article Inspection Report (FAIR - AS9102 Forms 1, 2, 3)', clauseRef: 'Clause 8.5.1.1', isMandatory: true, purpose: 'Complete dimensional inspection verification of the first production part manufactured.', auditorCheck: 'Verification of balloon drawing matching all 100% CMM inspection points.' }
    ],
    auditorExpectations: [
      'Aerospace auditors examine the OASIS database history and previous audit findings directly',
      'First Article Inspection Reports (AS9102 FAIR) are audited with zero tolerance for missing balloon dimensions',
      'Traceability records (material certifications, heat lot, non-destructive testing reports) must be retained for 10-30 years'
    ],
    commonNonConformities: [
      'Incomplete AS9102 FAIR (missing raw material chemical/physical test certificates or special process approvals)',
      'Inadequate counterfeit parts procedure (purchasing brokers without customer approval)',
      'Configuration management failures (manufacturing using drawing rev B when customer released rev C)'
    ],
    interviewPrep: [
      {
        question: 'What happens when an operator finds a Foreign Object Debris (FOD) incident or a non-conforming part during assembly?',
        auditorIntent: 'Evaluating Clause 8.1.3 Product Safety and Clause 8.5.4 FOD Prevention.',
        recommendedAnswer: 'The assembly is halted immediately and the area is quarantined. The FOD incident is logged in our Product Safety Registry, and Quality Engineering performs a sweep of all adjacent workstations. The non-conforming part is segregated in a locked MRB crib with red tagging until formal Material Review Board disposition.',
        evidenceToProduce: 'FOD log and locked MRB cage quarantine procedures.'
      }
    ],
    implementationRoadmap: [
      { stepNumber: 1, title: 'Aerospace Scope & Configuration Baseline', phase: 'Planning', description: 'Define in-scope defense/aerospace products and establish configuration baseline.', deliverables: ['AS9100 Quality Manual'] },
      { stepNumber: 2, title: 'FOD & Counterfeit Parts Prevention Implementation', phase: 'Planning', description: 'Deploy tool shadowing, cleanroom controls, and franchised distributor verification.', deliverables: ['FOD Procedure', 'Counterfeit Parts Plan'] },
      { stepNumber: 3, title: 'AS9102 First Article Inspection (FAIR) Setup', phase: 'Implementation', description: 'Train inspectors on AS9102 Forms 1-3 and integrate CMM inspection reports.', deliverables: ['AS9102 FAIR Package'] },
      { stepNumber: 4, title: 'Supplier Control & Key Characteristic Monitoring', phase: 'Operation', description: 'Qualify aerospace suppliers and establish key characteristic statistical capability.', deliverables: ['Approved Supplier List', 'Key Characteristics Reports'] },
      { stepNumber: 5, title: 'AS9100D Certification Audit & OASIS Upload', phase: 'Evaluation & Certification', description: 'Undergo Stage 1 and Stage 2 aerospace audit by accredited registrar with OASIS listing.', deliverables: ['AS9100D Certificate', 'OASIS Listing'] }
    ],
    synergiesWithOtherStandards: ['ISO 9001 (Direct foundational standard)', 'ISO 27001 (Defense cybersecurity CMMC & ITAR compliance)']
  },
  {
    id: 'eu-mdr',
    code: 'EU MDR',
    name: 'European Medical Device Regulation',
    edition: 'Regulation (EU) 2017/745',
    category: 'European Regulations',
    badge: 'EU MedTech Law',
    summary: 'The stringent European regulation governing medical devices placed on the EU market, mandating rigorous clinical evaluation, EUDAMED registration, and lifetime post-market surveillance.',
    targetIndustries: ['All Medical Device Manufacturers Selling in EU', 'SaMD & Digital Health App Developers', 'Orthopedic & Cardiovascular Implant Makers', 'Surgical Tool & Diagnostic Equipment Vendors'],
    keyBenefits: [
      'Required for CE marking and legal commercial distribution across all 27 EU member states',
      'Enforces rigorous Post-Market Clinical Follow-up (PMCF) and Periodic Safety Update Reports (PSUR)',
      'Standardizes Unique Device Identification (UDI) for total patient traceability',
      'Protects patients from unproven medical claims through clinical evidence mandates'
    ],
    annexSlCompatible: false, // European Statutory Regulation
    mandatoryDocumentsCount: 18,
    totalControlsOrClauses: '123 Articles + 17 Annexes (Annex I General Safety and Performance Requirements - GSPR)',
    coreClauses: [
      { clause: 'Article 10', title: 'General Obligations of Manufacturers', description: 'Full responsibility for device safety and regulatory compliance.', keyRequirement: 'Must establish QMS (ISO 13485), maintain technical documentation, and designate a PRRC.' },
      { clause: 'Article 15', title: 'Person Responsible for Regulatory Compliance (PRRC)', description: 'Designated qualified individual within organization.', keyRequirement: 'Must possess requisite expertise in medical devices and oversee conformity of release.' },
      { clause: 'Annex I', title: 'General Safety and Performance Requirements (GSPR)', description: 'Replaces Essential Requirements with 23 strict safety principles.', keyRequirement: 'GSPR checklist proving conformity with harmonized standards for electrical safety, usability, and sterility.' },
      { clause: 'Article 61 & Annex XIV', title: 'Clinical Evaluation & PMCF', description: 'Continuous clinical evaluation of device safety.', keyRequirement: 'Clinical Evaluation Report (CER) based on valid clinical data, not mere equivalence claims.' },
      { clause: 'Article 86', title: 'Periodic Safety Update Report (PSUR)', description: 'Regular safety updates for Class IIa, IIb, and III devices.', keyRequirement: 'Annual or biennial summary of benefit-risk conclusion, sales volume, and complaint frequency.' }
    ],
    mandatoryDocuments: [
      { id: 'doc-mdr-1', title: 'EU MDR Technical Documentation (Annexes II & III)', clauseRef: 'Annexes II & III', isMandatory: true, purpose: 'Comprehensive technical dossier submitted to Notified Body for CE marking.', auditorCheck: 'Auditor audits every section against Annex II checklist.' },
      { id: 'doc-mdr-2', title: 'GSPR Conformity Checklist', clauseRef: 'Annex I', isMandatory: true, purpose: 'Detailed evidence and test reports proving compliance with all 23 General Safety Requirements.', auditorCheck: 'Verification of testing standard versions applied.' },
      { id: 'doc-mdr-3', title: 'Clinical Evaluation Plan (CEP) & Clinical Evaluation Report (CER)', clauseRef: 'Article 61', isMandatory: true, purpose: 'State of the art literature review, clinical trial data, and benefit-risk determination.', auditorCheck: 'Auditor verifies independence and credentials of clinical evaluator.' },
      { id: 'doc-mdr-4', title: 'Post-Market Surveillance Plan & Report (PMS / PSUR)', clauseRef: 'Articles 84 & 86', isMandatory: true, purpose: 'Active collection of real-world user feedback, incident trends, and literature updates.', auditorCheck: 'Timely upload of PSURs to EUDAMED database.' },
      { id: 'doc-mdr-5', title: 'UDI & Labeling Technical Package', clauseRef: 'Article 27', isMandatory: true, purpose: 'Basic UDI-DI assignment, 2D DataMatrix barcode generation, and IFU translation.', auditorCheck: 'Verification of UDI carrier legibility and EUDAMED record synchronization.' }
    ],
    auditorExpectations: [
      'Notified Body technical assessors rigorously scrutinize the Clinical Evaluation Report (CER)',
      'Equivalence claims to competitor devices are heavily restricted—real clinical data is expected',
      'The Person Responsible for Regulatory Compliance (PRRC) must be interviewed directly'
    ],
    commonNonConformities: [
      'Clinical data insufficient to justify the clinical claims made in product marketing',
      'GSPR checklist referencing obsolete standard editions or missing harmonized test reports',
      'No formal Post-Market Clinical Follow-up (PMCF) plan or ongoing study for high-risk devices'
    ],
    interviewPrep: [
      {
        question: 'Who is your designated Person Responsible for Regulatory Compliance (PRRC), and what are their statutory duties under Article 15?',
        auditorIntent: 'Evaluating Article 15 PRRC compliance.',
        recommendedAnswer: 'Our PRRC is our Head of Regulatory Affairs, holding an engineering degree and 12 years of MedTech experience. Under Article 15, they are legally responsible for verifying device conformity prior to batch release, maintaining technical documentation, ensuring post-market surveillance obligations, and managing vigilance reporting.',
        evidenceToProduce: 'PRRC designation contract, CV, and diploma.'
      }
    ],
    implementationRoadmap: [
      { stepNumber: 1, title: 'Device Classification & GSPR Gap Analysis', phase: 'Planning', description: 'Confirm device classification (Rule 1-22) and audit GSPR checklist.', deliverables: ['MDR Classification Dossier', 'GSPR Gap Matrix'] },
      { stepNumber: 2, title: 'Clinical Evaluation Plan & Literature Review', phase: 'Planning', description: 'Draft CEP and conduct systematic literature review establishing state-of-the-art.', deliverables: ['Clinical Evaluation Plan'] },
      { stepNumber: 3, title: 'Technical Documentation & Risk File Harmonization', phase: 'Implementation', description: 'Compile Annex II/III technical dossier and harmonize ISO 14971 risk file.', deliverables: ['MDR Technical Documentation Dossier'] },
      { stepNumber: 4, title: 'UDI Assignment & EUDAMED Readiness', phase: 'Operation', description: 'Assign Basic UDI-DI, design UDI labels, and configure EUDAMED upload pipelines.', deliverables: ['UDI Master Catalog'] },
      { stepNumber: 5, title: 'Notified Body Technical Dossier Review & CE Certificate', phase: 'Evaluation & Certification', description: 'Submit technical dossier to Notified Body (e.g. TÜV Rheinland, BSI) for MDR CE certification.', deliverables: ['MDR CE Certificate'] }
    ],
    synergiesWithOtherStandards: ['ISO 13485 (QMS backbone required by MDR Article 10)', 'ISO 14971 (Risk management benchmark for medical devices)', 'IEC 62304 (Software lifecycle for SaMD)']
  },
  {
    id: 'for-consultants',
    code: 'For Consultants',
    name: 'Standards and Training Consulting Methodology & Toolkit',
    edition: 'Standards & Training Lead Auditor & Consultant Standard',
    category: 'Consulting & Governance',
    badge: 'Expert Toolkit',
    summary: 'The industry-standard consulting toolkit and systematic methodology developed for Standards and Training to enable GRC consultants to lead multi-client implementations efficiently and guarantee first-time certification success.',
    targetIndustries: ['GRC Consulting Practices', 'Independent Lead Auditors & Advisors', 'In-House Compliance Directors', 'Virtual CISO (vCISO) Agencies'],
    keyBenefits: [
      'Accelerates client implementation timelines by 60% using proven Standards and Training roadmaps',
      'Prevents client audit rejections using verified auditor acceptance checklists',
      'Automates multi-client scoping, gap analysis, and mandatory documentation tracking',
      'Provides customizable client presentation slide decks and executive briefing memos'
    ],
    annexSlCompatible: true,
    mandatoryDocumentsCount: 5,
    totalControlsOrClauses: '4 Engagement Phases: Scoping, Documentation, Internal Audit, Stage 2 Defense',
    coreClauses: [
      { clause: 'Phase 1', title: 'Diagnostic Scoping & Gap Analysis', description: 'Evaluating client readiness.', keyRequirement: 'Initial gap scoring against standard clauses, estimating project hours and identifying critical non-conformity risks.' },
      { clause: 'Phase 2', title: 'Lean Documentation Drafting', description: 'Creating client-specific documentation without shelfware bloat.', keyRequirement: 'Drafting policies bound to client technology stack, establishing RACI, and defining quantitative SLAs.' },
      { clause: 'Phase 3', title: 'Pre-Audit Verification & Mock Interviews', description: 'Preparing client teams for external lead auditor scrutiny.', keyRequirement: 'Executing independent internal audit, holding executive management review, and coaching auditees.' },
      { clause: 'Phase 4', title: 'Certification Body Selection & Audit Defense', phaseName: 'Closing', keyRequirement: 'Selecting accredited certification bodies (UKAS, ANAB, DAkkS) and supporting Stage 1 & Stage 2 audit defense.' } as any
    ],
    mandatoryDocuments: [
      { id: 'doc-con-1', title: 'Standards & Training Client Project Charter & Kickoff Matrix', clauseRef: 'Project Governance', isMandatory: true, purpose: 'Client engagement agreement defining milestones, responsibilities, and target certification date.', auditorCheck: 'Consultant uses this to maintain project velocity.' },
      { id: 'doc-con-2', title: 'Comprehensive Diagnostic Gap Assessment Matrix', clauseRef: 'Clause by Clause', isMandatory: true, purpose: 'Automated assessment sheet evaluating compliance percentage across all requirements.', auditorCheck: 'Provides clear red/yellow/green baseline for client executive board.' },
      { id: 'doc-con-3', title: 'Lead Auditor Pre-Flight Readiness Checklist', clauseRef: 'Stage 1/2 Readiness', isMandatory: true, purpose: '7-point auditor acceptance checklist verifying zero shelfware prior to external audit.', auditorCheck: 'Used to greenlight client engagement with certification body.' },
      { id: 'doc-con-4', title: 'Auditee Coaching Flashcards & Mock Cross-Examination Dossier', clauseRef: 'Interview Defense', isMandatory: true, purpose: 'Playbook of 50+ difficult questions lead auditors ask departmental personnel.', auditorCheck: 'Ensures staff answer with confidence and provide exact evidence.' }
    ],
    auditorExpectations: [
      'External auditors appreciate well-organized documentation packages with clear cross-reference indexes',
      'Consultants must not answer for the auditee during external interviews; auditees must own the procedures',
      'Management reviews must demonstrate genuine executive engagement, not consultant monologues'
    ],
    commonNonConformities: [
      'Consultant copying and pasting boilerplate templates with wrong client company names in headers',
      'Client staff unable to explain procedures when questioned because consultant authored them in isolation',
      'Internal audit conducted by the same consultant who drafted the documentation (violates independence)'
    ],
    interviewPrep: [
      {
        question: 'How do you structure an ISO implementation for a fast-growing tech client to prevent "shelfware"?',
        auditorIntent: 'Consultant methodology evaluation.',
        recommendedAnswer: 'We adopt a lean, process-integrated approach: embed security rules directly into existing tools (Jira, GitHub, Slack) rather than creating standalone bureaucratic forms. Policies define high-level mandates, while automated scripts collect the actual compliance telemetry required for audit sampling.',
        evidenceToProduce: 'Standards and Training Implementation Roadmap and Tool Integration Crosswalk.'
      }
    ],
    implementationRoadmap: [
      { stepNumber: 1, title: 'Diagnostic Gap Assessment & Executive Kickoff', phase: 'Planning', description: 'Run initial readiness audit and present business case to Board of Directors.', deliverables: ['Gap Assessment Report', 'Project Plan'] },
      { stepNumber: 2, title: 'Context, Scope & Policy Architecture', phase: 'Planning', description: 'Define boundaries and draft core policies tailored to client infrastructure.', deliverables: ['ISMS/QMS Scope', 'Master Policy Pack'] },
      { stepNumber: 3, title: 'Operational Process Binding & Training', phase: 'Implementation', description: 'Train client champions and embed procedures into operational tools.', deliverables: ['Staff Training Logs', 'Operational Runbooks'] },
      { stepNumber: 4, title: 'Independent Internal Audit & Mock Drill', phase: 'Evaluation & Certification', description: 'Conduct thorough internal audit, log CAPAs, and run mock auditor interviews.', deliverables: ['Internal Audit Report', 'CAPA Log'] },
      { stepNumber: 5, title: 'Certification Body Defense & Certificate Attainment', phase: 'Evaluation & Certification', description: 'Support client through Stage 1 documentation review and Stage 2 on-site audit.', deliverables: ['Accredited ISO Certificate'] }
    ],
    synergiesWithOtherStandards: ['Universal applicability across all ISO standards and regulatory frameworks']
  },
  {
    id: 'compliance-general',
    code: 'Compliance in general',
    name: 'Integrated Management Systems & Annex SL Governance',
    edition: 'ISO Annex SL (High-Level Structure) & Harmonized Methodology',
    category: 'Consulting & Governance',
    badge: 'Annex SL / IMS',
    summary: 'The universal governance methodology utilizing ISO’s Annex SL Common High-Level Structure (HLS) to integrate multiple management systems (ISO 27001, 9001, 14001, 45001, 22301) into a single unified audit and operational framework.',
    targetIndustries: ['Multi-Standard Organizations', 'Enterprise Conglomerates', 'Global Corporate Governance Teams', 'Certified Organizations Expanding into New Standards'],
    keyBenefits: [
      'Eliminates 70% of duplicated compliance effort by sharing Clauses 4-10 governance',
      'Enables single integrated internal audit and combined management review sessions',
      'Harmonizes risk assessment methodology across quality, security, and environmental domains',
      'Substantially reduces external certification body audit fees via combined audits'
    ],
    annexSlCompatible: true,
    mandatoryDocumentsCount: 6,
    totalControlsOrClauses: 'Harmonized Clauses 4-10 (Context, Leadership, Planning, Support, Operation, Evaluation, Improvement)',
    coreClauses: [
      { clause: 'Clause 4', title: 'Context of the Organization', description: 'Unified external and internal context.', keyRequirement: 'Combined analysis of interested parties (customers, regulators, workers, shareholders).' },
      { clause: 'Clause 5', title: 'Leadership and Commitment', description: 'Integrated executive leadership.', keyRequirement: 'Integrated Management Policy and harmonized organizational roles, responsibilities, and authorities.' },
      { clause: 'Clause 6', title: 'Planning (Integrated Risk & Opportunity)', description: 'Harmonized risk management.', keyRequirement: 'Unified risk assessment matrix evaluating business, cyber, environmental, and safety risks.' },
      { clause: 'Clause 7', title: 'Support (Resources, Competence, Documented Info)', description: 'Shared operational foundation.', keyRequirement: 'Single document control system and unified staff competency training records.' },
      { clause: 'Clause 9', title: 'Performance Evaluation (Internal Audit & Management Review)', description: 'Combined audit and governance oversight.', keyRequirement: 'Single integrated internal audit program and consolidated executive management review.' },
      { clause: 'Clause 10', title: 'Improvement (CAPA)', description: 'Centralized non-conformity engine.', keyRequirement: 'Single enterprise corrective action register with unified root cause analysis (5-Whys / Ishikawa).' }
    ],
    mandatoryDocuments: [
      { id: 'doc-gen-1', title: 'Integrated Management System (IMS) Manual & Policy', clauseRef: 'Clauses 4.3 & 5.2', isMandatory: true, purpose: 'Single unified manual combining ISO 27001, 9001, 14001, and 45001 policies.', auditorCheck: 'Auditor checks that commitments across all covered standards are clearly stated.' },
      { id: 'doc-gen-2', title: 'Enterprise Risk & Opportunity Assessment Methodology', clauseRef: 'Clause 6.1', isMandatory: true, purpose: 'Single scoring methodology assessing financial, cyber, environmental, and physical safety risks.', auditorCheck: 'Auditor verifies that risk appetite scales are harmonized.' },
      { id: 'doc-gen-3', title: 'Integrated Internal Audit Program & Working Papers', clauseRef: 'Clause 9.2', isMandatory: true, purpose: 'Annual audit schedule covering multiple standards in unified departmental audits.', auditorCheck: 'Auditor verifies cross-standard qualifications of internal auditors.' },
      { id: 'doc-gen-4', title: 'Consolidated Management Review Minutes', clauseRef: 'Clause 9.3', isMandatory: true, purpose: 'Executive board minutes addressing all Annex SL mandatory inputs in one session.', auditorCheck: 'Proof that top management reviewed security, quality, and environmental metrics together.' },
      { id: 'doc-gen-5', title: 'Enterprise Nonconformity & CAPA Master Register', clauseRef: 'Clause 10.2', isMandatory: true, purpose: 'Central database tracking all customer complaints, security incidents, and audit findings.', auditorCheck: 'Auditor verifies timely closure and effectiveness review across all domains.' }
    ],
    auditorExpectations: [
      'Lead auditors from registrars look for real integration, not 4 separate binders glued together',
      'Internal audits must assess process interactions (e.g. how a change affects both quality and security)',
      'Management reviews must evaluate resource allocation across all integrated disciplines'
    ],
    commonNonConformities: [
      'Duplicated procedures contradicting each other (e.g. Quality Document Control SOP vs Security Document Control SOP)',
      'Internal audit program omitting clauses of one standard while auditing another',
      'Management review failing to cover specific statutory inputs required by individual standards'
    ],
    interviewPrep: [
      {
        question: 'How do you manage document control and corrective actions across multiple ISO standards simultaneously?',
        auditorIntent: 'Evaluating Integrated Management System maturity and efficiency.',
        recommendedAnswer: 'We leverage the common Annex SL High-Level Structure. We maintain a single Documented Information SOP (Clause 7.5) and a unified CAPA register (Clause 10.2) in Skanda GRC. Every document and corrective action is tagged with its applicable standards, preventing duplication while maintaining total auditability.',
        evidenceToProduce: 'Document Control SOP and Central CAPA Register in Skanda GRC.'
      }
    ],
    implementationRoadmap: [
      { stepNumber: 1, title: 'Annex SL High-Level Structure Crosswalk', phase: 'Planning', description: 'Map existing processes across ISO 27001, 9001, 14001, and 45001.', deliverables: ['Annex SL Crosswalk Matrix'] },
      { stepNumber: 2, title: 'Integrated Policy & Governance Formulation', phase: 'Planning', description: 'Draft unified Integrated Management Policy and RACI matrix.', deliverables: ['Integrated Management Policy'] },
      { stepNumber: 3, title: 'Harmonized Risk & Operational Procedures', phase: 'Implementation', description: 'Unify document control, change governance, and vendor management.', deliverables: ['Harmonized SOP Pack'] },
      { stepNumber: 4, title: 'Combined Internal Audit & Management Review', phase: 'Operation', description: 'Conduct integrated internal audit and single consolidated board review.', deliverables: ['Combined Audit Report', 'IMS Review Minutes'] },
      { stepNumber: 5, title: 'Integrated Certification Audit', phase: 'Evaluation & Certification', description: 'Undergo combined multi-standard audit by single accredited registrar.', deliverables: ['Integrated ISO Certificates'] }
    ],
    synergiesWithOtherStandards: ['Universal foundation uniting all Annex SL ISO management system standards']
  }
];
