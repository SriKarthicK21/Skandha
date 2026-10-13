import { IsoRequirementMapping, IsoScanResult, IsoThemeCategory, EvidenceRecord } from '../types';
import { EVIDENCE_CHECKLIST_MASTER_DATA } from '../data/evidenceChecklistMasterData';

export interface IsoRequirementDefinition {
  isoCode: string; // e.g. "A.5.1", "A.8.24", "Clause 4.3"
  standard: 'ISO/IEC 27001:2022' | 'ISO/IEC 42001:2023' | 'ISO/IEC 27701:2019';
  title: string;
  themeCategory: IsoThemeCategory;
  category: 'Organizational' | 'People' | 'Physical' | 'Technological' | 'ISMS Clause';
  auditObjective: string;
  suggestedEvidenceType: string;
  testingProcedure: string;
  keywords: string[];
  checklistRefId?: string;
  departmentHint: string;
  defaultTags: string[];
}

export const ISO_REQUIREMENTS_CATALOG: Record<string, IsoRequirementDefinition> = {
  // ----------------------------------------------------
  // ISMS MANDATORY CLAUSES (4 - 10)
  // ----------------------------------------------------
  'Clause 4.3': {
    isoCode: 'Clause 4.3',
    standard: 'ISO/IEC 27001:2022',
    title: 'Determining the Scope of the ISMS',
    themeCategory: 'Management System (Clauses 4-10)',
    category: 'ISMS Clause',
    auditObjective: 'Verify that the organizational, physical, and technological boundaries of the ISMS are formally defined and documented.',
    suggestedEvidenceType: 'MANDATORY_RECORD',
    testingProcedure: 'Inspect the formal ISMS Scope Statement, system architecture topology diagrams, and verify management approvals.',
    keywords: ['scope', 'boundary', 'boundaries', 'statement of applicability', 'isms scope', 'context of organization', 'interested parties'],
    checklistRefId: 'EVD-27K-001',
    departmentHint: 'Executive Board & C-Suite Governance',
    defaultTags: ['ISO27001-Clause4.3', 'ISMS-Scope', 'Governance', 'Mandatory-Record']
  },
  'Clause 5.1': {
    isoCode: 'Clause 5.1',
    standard: 'ISO/IEC 27001:2022',
    title: 'Leadership and Commitment',
    themeCategory: 'Management System (Clauses 4-10)',
    category: 'ISMS Clause',
    auditObjective: 'Confirm top management establishes security policies, integrates ISMS into business processes, and allocates adequate resources.',
    suggestedEvidenceType: 'MEETING_MINUTES',
    testingProcedure: 'Inspect Board meeting minutes, CISO appointment letters, and budgetary allocations for information security.',
    keywords: ['leadership', 'board', 'c-suite', 'ciso', 'charter', 'commitment', 'budget', 'executive', 'resources'],
    checklistRefId: 'EVD-27K-002',
    departmentHint: 'Executive Board & C-Suite Governance',
    defaultTags: ['ISO27001-Clause5.1', 'Leadership-Commitment', 'Executive-Minutes']
  },
  'Clause 5.2': {
    isoCode: 'Clause 5.2',
    standard: 'ISO/IEC 27001:2022',
    title: 'Information Security Policy',
    themeCategory: 'Management System (Clauses 4-10)',
    category: 'ISMS Clause',
    auditObjective: 'Verify that top management has approved and published an overarching Information Security Policy communicated to all personnel.',
    suggestedEvidenceType: 'POLICY_PROCEDURE',
    testingProcedure: 'Review the master policy document, verify annual review cycle timestamps, and inspect employee acknowledgement records.',
    keywords: ['policy', 'master policy', 'security policy', 'isms policy', 'acceptable use', 'management review', 'governance'],
    checklistRefId: 'EVD-27K-003',
    departmentHint: 'Information Security & Compliance',
    defaultTags: ['ISO27001-Clause5.2', 'Master-Security-Policy', 'Board-Approved']
  },
  'Clause 6.1.2': {
    isoCode: 'Clause 6.1.2',
    standard: 'ISO/IEC 27001:2022',
    title: 'Information Security Risk Assessment Process',
    themeCategory: 'Management System (Clauses 4-10)',
    category: 'ISMS Clause',
    auditObjective: 'Ensure a formal risk assessment methodology is defined, applied consistently, identifying threats, vulnerabilities, likelihood, and impact.',
    suggestedEvidenceType: 'MANDATORY_RECORD',
    testingProcedure: 'Inspect the formal Risk Assessment Methodology Document and verify risk assessment criteria, appetite matrix, and risk scoring scales.',
    keywords: ['risk assessment', 'risk methodology', 'risk criteria', 'threat assessment', 'vulnerability scoring', 'risk register', 'likelihood', 'impact'],
    checklistRefId: 'EVD-27K-004',
    departmentHint: 'Enterprise Risk Management & GRC',
    defaultTags: ['ISO27001-Clause6.1.2', 'Risk-Assessment', 'Methodology', 'Risk-Register']
  },
  'Clause 6.1.3': {
    isoCode: 'Clause 6.1.3',
    standard: 'ISO/IEC 27001:2022',
    title: 'Information Security Risk Treatment & SoA',
    themeCategory: 'Management System (Clauses 4-10)',
    category: 'ISMS Clause',
    auditObjective: 'Verify that risks are treated through formal risk treatment plans and justified against all 93 controls in Annex A via the Statement of Applicability (SoA).',
    suggestedEvidenceType: 'MANDATORY_RECORD',
    testingProcedure: 'Review the Statement of Applicability (SoA) for complete justifications of inclusions/exclusions across all 93 controls.',
    keywords: ['soa', 'statement of applicability', 'risk treatment', 'annex a justification', 'mitigation', 'risk acceptance', 'exclusion'],
    checklistRefId: 'EVD-27K-005',
    departmentHint: 'Enterprise Risk Management & GRC',
    defaultTags: ['ISO27001-Clause6.1.3', 'Statement-of-Applicability', 'Risk-Treatment-Plan']
  },
  'Clause 7.2': {
    isoCode: 'Clause 7.2',
    standard: 'ISO/IEC 27001:2022',
    title: 'Competence and Training',
    themeCategory: 'Management System (Clauses 4-10)',
    category: 'ISMS Clause',
    auditObjective: 'Verify personnel performing security-affecting roles possess verified competence through education, training, or certification.',
    suggestedEvidenceType: 'TEST_REPORT',
    testingProcedure: 'Inspect security certifications of key staff (CISSP, CISA) and annual training completion records.',
    keywords: ['competence', 'training', 'certification', 'training records', 'skills matrix', 'qualifications', 'credentials', 'cissp'],
    checklistRefId: 'EVD-27K-006',
    departmentHint: 'People & Human Resources',
    defaultTags: ['ISO27001-Clause7.2', 'Competence-Records', 'Security-Training']
  },
  'Clause 7.5.3': {
    isoCode: 'Clause 7.5.3',
    standard: 'ISO/IEC 27001:2022',
    title: 'Control of Documented Information',
    themeCategory: 'Management System (Clauses 4-10)',
    category: 'ISMS Clause',
    auditObjective: 'Verify that policies, procedures, and evidence records have versioning, distribution control, change histories, and access protections.',
    suggestedEvidenceType: 'POLICY_PROCEDURE',
    testingProcedure: 'Check document headers, revision logs, classification stamps, retention schedules, and access control lists.',
    keywords: ['documented information', 'document control', 'versioning', 'revision log', 'record retention', 'document lifecycle'],
    checklistRefId: 'EVD-27K-007',
    departmentHint: 'Legal & Regulatory Compliance',
    defaultTags: ['ISO27001-Clause7.5.3', 'Document-Control', 'Revision-History']
  },
  'Clause 9.2': {
    isoCode: 'Clause 9.2',
    standard: 'ISO/IEC 27001:2022',
    title: 'Internal Audit Program',
    themeCategory: 'Management System (Clauses 4-10)',
    category: 'ISMS Clause',
    auditObjective: 'Ensure planned internal audits are executed at planned intervals by independent, qualified auditors covering all clauses and applicable controls.',
    suggestedEvidenceType: 'TEST_REPORT',
    testingProcedure: 'Inspect the Annual Internal Audit Charter, Audit Plan, Auditor Independence attestations, and final Internal Audit Reports.',
    keywords: ['internal audit', 'audit report', 'audit plan', 'audit charter', 'non-conformity', 'sampling', 'iso19011', 'auditor independence'],
    checklistRefId: 'EVD-27K-008',
    departmentHint: 'Internal Audit & Quality Assurance',
    defaultTags: ['ISO27001-Clause9.2', 'Internal-Audit-Report', 'Audit-Schedule']
  },
  'Clause 9.3': {
    isoCode: 'Clause 9.3',
    standard: 'ISO/IEC 27001:2022',
    title: 'Management Review',
    themeCategory: 'Management System (Clauses 4-10)',
    category: 'ISMS Clause',
    auditObjective: 'Verify that top management reviews the organization’s ISMS at planned intervals to ensure its continuing suitability, adequacy, and effectiveness.',
    suggestedEvidenceType: 'MEETING_MINUTES',
    testingProcedure: 'Inspect Management Review Meeting (MRM) agenda, presentation decks, attendee lists, and formal signed meeting minutes with action items.',
    keywords: ['management review', 'mrm', 'suitability', 'adequacy', 'effectiveness', 'executive minutes', 'annual review'],
    checklistRefId: 'EVD-27K-009',
    departmentHint: 'Executive Board & C-Suite Governance',
    defaultTags: ['ISO27001-Clause9.3', 'Management-Review-MRM', 'C-Suite-Minutes']
  },
  'Clause 10.1': {
    isoCode: 'Clause 10.1',
    standard: 'ISO/IEC 27001:2022',
    title: 'Nonconformity and Corrective Action (CAPA)',
    themeCategory: 'Management System (Clauses 4-10)',
    category: 'ISMS Clause',
    auditObjective: 'Ensure that when a nonconformity occurs, the organization reacts, takes action to control and correct it, deals with the consequences, and eliminates root causes.',
    suggestedEvidenceType: 'MANDATORY_RECORD',
    testingProcedure: 'Review the CAPA Register, root cause analysis documents (5-Whys/Ishikawa), implementation proofs, and formal effectiveness reviews.',
    keywords: ['capa', 'nonconformity', 'corrective action', 'root cause', 'finding', 'remediation', 'preventive', 'nc register'],
    checklistRefId: 'EVD-27K-010',
    departmentHint: 'Enterprise Risk Management & GRC',
    defaultTags: ['ISO27001-Clause10.1', 'CAPA-Register', 'Corrective-Action', 'Root-Cause']
  },

  // ----------------------------------------------------
  // ORGANIZATIONAL CONTROLS (A.5)
  // ----------------------------------------------------
  'A.5.1': {
    isoCode: 'A.5.1',
    standard: 'ISO/IEC 27001:2022',
    title: 'Policies for Information Security',
    themeCategory: 'Organizational Controls (A.5)',
    category: 'Organizational',
    auditObjective: 'Ensure information security policies and topic-specific policies are defined, approved by management, published, communicated, and periodically reviewed.',
    suggestedEvidenceType: 'POLICY_PROCEDURE',
    testingProcedure: 'Sample published topic-specific security policies (access control, cryptography, backup, clear desk) and inspect annual approval records.',
    keywords: ['policy', 'security policy', 'acceptable use', 'information security policy', 'standards', 'guidelines'],
    checklistRefId: 'EVD-27K-011',
    departmentHint: 'Information Security & Compliance',
    defaultTags: ['ISO27001-A.5.1', 'Security-Policies', 'Policy-Governance']
  },
  'A.5.7': {
    isoCode: 'A.5.7',
    standard: 'ISO/IEC 27001:2022',
    title: 'Threat Intelligence',
    themeCategory: 'Organizational Controls (A.5)',
    category: 'Organizational',
    auditObjective: 'Information relating to information security threats shall be collected and analyzed to produce threat intelligence.',
    suggestedEvidenceType: 'TECHNICAL_LOG_CONFIG',
    testingProcedure: 'Inspect commercial or open-source threat feed subscriptions, ISAC memberships, and automated integration into SIEM/EDR platforms.',
    keywords: ['threat intelligence', 'ioc', 'isac', 'cve feed', 'threat feed', 'mitre att&ck', 'alienvault', 'crowdstrike', 'advisory'],
    checklistRefId: 'EVD-27K-012',
    departmentHint: 'Security Operations (SOC) & Threat Intel',
    defaultTags: ['ISO27001-A.5.7', 'Threat-Intelligence', 'Cyber-Threat-Feeds']
  },
  'A.5.9': {
    isoCode: 'A.5.9',
    standard: 'ISO/IEC 27001:2022',
    title: 'Inventory of Information and Other Associated Assets',
    themeCategory: 'Organizational Controls (A.5)',
    category: 'Organizational',
    auditObjective: 'An inventory of information and other associated assets, including owners, shall be developed and maintained.',
    suggestedEvidenceType: 'MANDATORY_RECORD',
    testingProcedure: 'Inspect CMDB, cloud asset inventories (AWS/GCP/Azure asset registers), hardware tracking, and software license records.',
    keywords: ['cmdb', 'asset inventory', 'asset register', 'asset owner', 'hardware inventory', 'software inventory', 'cloud asset'],
    checklistRefId: 'EVD-27K-013',
    departmentHint: 'IT Operations & Infrastructure',
    defaultTags: ['ISO27001-A.5.9', 'Asset-Inventory', 'CMDB-Register']
  },
  'A.5.12': {
    isoCode: 'A.5.12',
    standard: 'ISO/IEC 27001:2022',
    title: 'Classification of Information',
    themeCategory: 'Organizational Controls (A.5)',
    category: 'Organizational',
    auditObjective: 'Information shall be classified in accordance with the information security needs of the organization based on confidentiality, integrity, availability, and legal requirements.',
    suggestedEvidenceType: 'POLICY_PROCEDURE',
    testingProcedure: 'Review data classification scheme (Public, Internal, Confidential, Restricted) and inspect labeling in email headers and document repositories.',
    keywords: ['data classification', 'confidential', 'restricted', 'public', 'internal', 'data labeling', 'information handling'],
    checklistRefId: 'EVD-27K-014',
    departmentHint: 'Information Security & Compliance',
    defaultTags: ['ISO27001-A.5.12', 'Data-Classification', 'Information-Handling']
  },
  'A.5.15': {
    isoCode: 'A.5.15',
    standard: 'ISO/IEC 27001:2022',
    title: 'Access Control',
    themeCategory: 'Organizational Controls (A.5)',
    category: 'Organizational',
    auditObjective: 'Rules to control physical and logical access to information and other associated assets shall be established and implemented based on business and security requirements.',
    suggestedEvidenceType: 'POLICY_PROCEDURE',
    testingProcedure: 'Inspect the formal Access Control Policy, role-based access control (RBAC) definitions, and segregation of duties matrix.',
    keywords: ['access control', 'rbac', 'access policy', 'least privilege', 'need to know', 'user rights', 'entitlement'],
    checklistRefId: 'EVD-27K-015',
    departmentHint: 'IT Operations & Infrastructure',
    defaultTags: ['ISO27001-A.5.15', 'Access-Control-Policy', 'RBAC-Rules']
  },
  'A.5.19': {
    isoCode: 'A.5.19',
    standard: 'ISO/IEC 27001:2022',
    title: 'Information Security in Supplier Relationships',
    themeCategory: 'Organizational Controls (A.5)',
    category: 'Organizational',
    auditObjective: 'Processes and procedures shall be defined and implemented to manage the information security risks associated with the use of supplier products or services.',
    suggestedEvidenceType: 'THIRD_PARTY_AUDIT',
    testingProcedure: 'Inspect Third-Party Risk Management (TPRM) policy, vendor risk assessment questionnaires (SIG/CAIQ), and risk tiering matrices.',
    keywords: ['supplier security', 'vendor risk', 'tprm', 'third party', 'vendor questionnaire', 'procurement', 'supplier assessment'],
    checklistRefId: 'EVD-27K-016',
    departmentHint: 'Procurement & Vendor Risk Management',
    defaultTags: ['ISO27001-A.5.19', 'Supplier-Security', 'Vendor-Risk-Management']
  },
  'A.5.20': {
    isoCode: 'A.5.20',
    standard: 'ISO/IEC 27001:2022',
    title: 'Addressing Information Security Within Supplier Agreements',
    themeCategory: 'Organizational Controls (A.5)',
    category: 'Organizational',
    auditObjective: 'Relevant information security requirements shall be established and agreed upon with each supplier based on the type of supplier relationship.',
    suggestedEvidenceType: 'MANDATORY_RECORD',
    testingProcedure: 'Inspect signed Master Services Agreements (MSAs), Data Processing Agreements (DPAs), and standard security schedules.',
    keywords: ['supplier agreement', 'contract', 'msa', 'dpa', 'right to audit', 'breach notification clause', 'sla'],
    checklistRefId: 'EVD-27K-017',
    departmentHint: 'Legal & Regulatory Compliance',
    defaultTags: ['ISO27001-A.5.20', 'Supplier-Agreements', 'DPA-Contracts']
  },
  'A.5.22': {
    isoCode: 'A.5.22',
    standard: 'ISO/IEC 27001:2022',
    title: 'Monitoring, Review and Change Management of Supplier Services',
    themeCategory: 'Organizational Controls (A.5)',
    category: 'Organizational',
    auditObjective: 'The organization shall regularly monitor, review, evaluate, and audit supplier service delivery and security compliance.',
    suggestedEvidenceType: 'THIRD_PARTY_AUDIT',
    testingProcedure: 'Inspect annual collection of vendor SOC 2 Type II reports, ISO 27001 certificates, bridge letters, and annual review sign-offs.',
    keywords: ['soc 2', 'soc 2 type ii', 'iso certificate', 'bridge letter', 'vendor audit', 'supplier review', 'sla monitoring'],
    checklistRefId: 'EVD-27K-018',
    departmentHint: 'Procurement & Vendor Risk Management',
    defaultTags: ['ISO27001-A.5.22', 'Vendor-SOC2-Report', 'Third-Party-Attestation']
  },
  'A.5.24': {
    isoCode: 'A.5.24',
    standard: 'ISO/IEC 27001:2022',
    title: 'Information Security Incident Management Planning and Preparation',
    themeCategory: 'Organizational Controls (A.5)',
    category: 'Organizational',
    auditObjective: 'The organization shall plan and prepare for managing information security incidents by defining, establishing, and communicating incident management processes.',
    suggestedEvidenceType: 'POLICY_PROCEDURE',
    testingProcedure: 'Inspect the Incident Response Plan (IRP), severity matrices, escalation pathways, contact rosters, and regulatory notification playbooks.',
    keywords: ['incident response', 'irp', 'incident plan', 'breach playbook', 'escalation matrix', 'csirt', 'soc playbook'],
    checklistRefId: 'EVD-27K-019',
    departmentHint: 'Security Operations (SOC) & Threat Intel',
    defaultTags: ['ISO27001-A.5.24', 'Incident-Response-Plan', 'IRP-Playbook']
  },
  'A.5.29': {
    isoCode: 'A.5.29',
    standard: 'ISO/IEC 27001:2022',
    title: 'Information Security During Disruption (BCP/DR)',
    themeCategory: 'Organizational Controls (A.5)',
    category: 'Organizational',
    auditObjective: 'The organization shall plan, implement, maintain, and test processes to sustain information security during adverse situations and disruptions.',
    suggestedEvidenceType: 'TEST_REPORT',
    testingProcedure: 'Inspect Business Continuity Plan (BCP), Disaster Recovery (DR) runbooks, Business Impact Analysis (BIA), and annual DR simulation reports.',
    keywords: ['bcp', 'disaster recovery', 'dr test', 'business continuity', 'rto', 'rpo', 'bia', 'failover', 'simulation'],
    checklistRefId: 'EVD-27K-020',
    departmentHint: 'IT Operations & Infrastructure',
    defaultTags: ['ISO27001-A.5.29', 'BCP-DR-Testing', 'Failover-Drill']
  },

  // ----------------------------------------------------
  // PEOPLE CONTROLS (A.6)
  // ----------------------------------------------------
  'A.6.1': {
    isoCode: 'A.6.1',
    standard: 'ISO/IEC 27001:2022',
    title: 'Screening',
    themeCategory: 'People Controls (A.6)',
    category: 'People',
    auditObjective: 'Background verification checks on all candidates for employment shall be carried out in accordance with relevant laws, regulations, and ethics.',
    suggestedEvidenceType: 'MANDATORY_RECORD',
    testingProcedure: 'Sample HR personnel records for pre-employment criminal history checks, education verification, and credit screenings.',
    keywords: ['screening', 'background check', 'pre-employment', 'vetting', 'criminal check', 'hr verification', 'reference check'],
    checklistRefId: 'EVD-27K-021',
    departmentHint: 'People & Human Resources',
    defaultTags: ['ISO27001-A.6.1', 'Background-Screening', 'HR-Verification']
  },
  'A.6.2': {
    isoCode: 'A.6.2',
    standard: 'ISO/IEC 27001:2022',
    title: 'Terms and Conditions of Employment',
    themeCategory: 'People Controls (A.6)',
    category: 'People',
    auditObjective: 'The contractual agreements with personnel shall state their and the organization’s responsibilities for information security.',
    suggestedEvidenceType: 'MANDATORY_RECORD',
    testingProcedure: 'Inspect employment contract templates and signed NDAs for confidentiality obligations persisting after termination.',
    keywords: ['nda', 'employment contract', 'confidentiality agreement', 'terms of employment', 'intellectual property assignment'],
    checklistRefId: 'EVD-27K-022',
    departmentHint: 'People & Human Resources',
    defaultTags: ['ISO27001-A.6.2', 'Employment-NDA', 'Confidentiality-Clause']
  },
  'A.6.3': {
    isoCode: 'A.6.3',
    standard: 'ISO/IEC 27001:2022',
    title: 'Information Security Awareness, Education and Training',
    themeCategory: 'People Controls (A.6)',
    category: 'People',
    auditObjective: 'Personnel of the organization and relevant interested parties shall receive appropriate information security awareness, education, and training.',
    suggestedEvidenceType: 'TEST_REPORT',
    testingProcedure: 'Inspect LMS training completion spreadsheets, annual mandatory course curriculums, and quarterly phishing simulation drill metrics.',
    keywords: ['security awareness', 'phishing', 'training completion', 'phishing simulation', 'lms report', 'annual training'],
    checklistRefId: 'EVD-27K-023',
    departmentHint: 'People & Human Resources',
    defaultTags: ['ISO27001-A.6.3', 'Security-Awareness', 'Phishing-Simulation', 'Training-Report']
  },
  'A.6.5': {
    isoCode: 'A.6.5',
    standard: 'ISO/IEC 27001:2022',
    title: 'Responsibilities After Termination or Change of Employment',
    themeCategory: 'People Controls (A.6)',
    category: 'People',
    auditObjective: 'Information security responsibilities and duties that remain valid after termination or change of employment shall be defined and enforced.',
    suggestedEvidenceType: 'MANDATORY_RECORD',
    testingProcedure: 'Sample employee offboarding checklists showing asset return, immediate account revocation, and exit interview security sign-offs.',
    keywords: ['offboarding', 'termination', 'exit checklist', 'account deprovisioning', 'asset return', 'revocation'],
    checklistRefId: 'EVD-27K-024',
    departmentHint: 'People & Human Resources',
    defaultTags: ['ISO27001-A.6.5', 'Employee-Offboarding', 'Access-Revocation']
  },
  'A.6.7': {
    isoCode: 'A.6.7',
    standard: 'ISO/IEC 27001:2022',
    title: 'Remote Working',
    themeCategory: 'People Controls (A.6)',
    category: 'People',
    auditObjective: 'Security measures shall be implemented when personnel are working remotely to protect information accessed, processed, or stored.',
    suggestedEvidenceType: 'POLICY_PROCEDURE',
    testingProcedure: 'Review Teleworking/Remote Work Policy, VPN configurations, zero trust network access (ZTNA) logs, and MDM compliance requirements.',
    keywords: ['remote work', 'teleworking', 'work from home', 'vpn', 'ztna', 'mdm remote', 'byod policy'],
    checklistRefId: 'EVD-27K-025',
    departmentHint: 'Information Security & Compliance',
    defaultTags: ['ISO27001-A.6.7', 'Remote-Working-Policy', 'VPN-ZTNA']
  },

  // ----------------------------------------------------
  // PHYSICAL CONTROLS (A.7)
  // ----------------------------------------------------
  'A.7.1': {
    isoCode: 'A.7.1',
    standard: 'ISO/IEC 27001:2022',
    title: 'Physical Security Perimeters',
    themeCategory: 'Physical Controls (A.7)',
    category: 'Physical',
    auditObjective: 'Security perimeters shall be defined and used to protect areas that contain information and other associated assets.',
    suggestedEvidenceType: 'TECHNICAL_LOG_CONFIG',
    testingProcedure: 'Inspect office floor access control maps, badge reader logs, server room perimeter barrier specifications, and visitor logs.',
    keywords: ['physical security', 'perimeter', 'badge access', 'keycard', 'server room', 'facility security', 'cctv'],
    checklistRefId: 'EVD-27K-026',
    departmentHint: 'Facilities & Physical Security',
    defaultTags: ['ISO27001-A.7.1', 'Physical-Perimeter', 'Access-Badges']
  },
  'A.7.7': {
    isoCode: 'A.7.7',
    standard: 'ISO/IEC 27001:2022',
    title: 'Clear Desk and Clear Screen',
    themeCategory: 'Physical Controls (A.7)',
    category: 'Physical',
    auditObjective: 'Clear desk rules for papers and removable storage media and clear screen rules for information processing facilities shall be defined and enforced.',
    suggestedEvidenceType: 'POLICY_PROCEDURE',
    testingProcedure: 'Review Clear Desk Policy, auto-lock screen saver group policy (GPO/MDM) enforcement configs (≤5 mins), and physical walkthrough audit logs.',
    keywords: ['clear desk', 'clear screen', 'screen lock', 'gpo auto-lock', 'clean desk audit', 'walkthrough report'],
    checklistRefId: 'EVD-27K-027',
    departmentHint: 'Facilities & Physical Security',
    defaultTags: ['ISO27001-A.7.7', 'Clear-Desk-Policy', 'Screen-Lock-GPO']
  },
  'A.7.14': {
    isoCode: 'A.7.14',
    standard: 'ISO/IEC 27001:2022',
    title: 'Secure Disposal or Re-use of Equipment',
    themeCategory: 'Physical Controls (A.7)',
    category: 'Physical',
    auditObjective: 'Items of equipment containing storage media shall be verified to ensure that any sensitive data and licensed software have been destroyed or overwritten securely.',
    suggestedEvidenceType: 'THIRD_PARTY_AUDIT',
    testingProcedure: 'Inspect electronic asset disposal certificates (NIST 800-88 / DoD 5220.22-M sanitization) from accredited recycling vendors.',
    keywords: ['asset disposal', 'degaussing', 'hard drive shredding', 'sanitization certificate', 'nist 800-88', 'media destruction'],
    checklistRefId: 'EVD-27K-028',
    departmentHint: 'IT Operations & Infrastructure',
    defaultTags: ['ISO27001-A.7.14', 'Media-Destruction', 'Sanitization-Certificate']
  },

  // ----------------------------------------------------
  // TECHNOLOGICAL CONTROLS (A.8)
  // ----------------------------------------------------
  'A.8.1': {
    isoCode: 'A.8.1',
    standard: 'ISO/IEC 27001:2022',
    title: 'User Endpoint Devices',
    themeCategory: 'Technological Controls (A.8)',
    category: 'Technological',
    auditObjective: 'Information stored on, processed by, or accessible via user endpoint devices shall be protected.',
    suggestedEvidenceType: 'TECHNICAL_LOG_CONFIG',
    testingProcedure: 'Inspect MDM console (Jamf/Intune) demonstrating 100% BitLocker/FileVault full-disk encryption, OS patch compliance, and remote-wipe capability.',
    keywords: ['endpoint', 'mdm', 'intune', 'jamf', 'bitlocker', 'filevault', 'disk encryption', 'remote wipe', 'edr'],
    checklistRefId: 'EVD-27K-029',
    departmentHint: 'IT Operations & Infrastructure',
    defaultTags: ['ISO27001-A.8.1', 'Endpoint-Security', 'MDM-BitLocker']
  },
  'A.8.2': {
    isoCode: 'A.8.2',
    standard: 'ISO/IEC 27001:2022',
    title: 'Privileged Access Rights',
    themeCategory: 'Technological Controls (A.8)',
    category: 'Technological',
    auditObjective: 'The allocation and use of privileged access rights shall be restricted and managed.',
    suggestedEvidenceType: 'TECHNICAL_LOG_CONFIG',
    testingProcedure: 'Review PAM (Privileged Access Management) configs, root/admin account rosters, session recordings, and just-in-time (JIT) access logs.',
    keywords: ['privileged access', 'pam', 'admin account', 'root access', 'just-in-time access', 'cyberark', 'sudo privileges'],
    checklistRefId: 'EVD-27K-030',
    departmentHint: 'IT Operations & Infrastructure',
    defaultTags: ['ISO27001-A.8.2', 'Privileged-Access', 'PAM-Controls', 'Admin-Rights']
  },
  'A.8.4': {
    isoCode: 'A.8.4',
    standard: 'ISO/IEC 27001:2022',
    title: 'Access to Source Code',
    themeCategory: 'Technological Controls (A.8)',
    category: 'Technological',
    auditObjective: 'Read and write access to source code, development tools, and software libraries shall be appropriately restricted.',
    suggestedEvidenceType: 'TECHNICAL_LOG_CONFIG',
    testingProcedure: 'Inspect GitHub/GitLab branch protection rules, mandatory 2-person code reviews, and SAML/MFA access enforcement.',
    keywords: ['source code', 'github', 'gitlab', 'branch protection', 'pull request review', 'git access', 'repository permissions'],
    checklistRefId: 'EVD-27K-031',
    departmentHint: 'Software Engineering & DevOps',
    defaultTags: ['ISO27001-A.8.4', 'Source-Code-Access', 'GitHub-Branch-Protection']
  },
  'A.8.5': {
    isoCode: 'A.8.5',
    standard: 'ISO/IEC 27001:2022',
    title: 'Secure Authentication',
    themeCategory: 'Technological Controls (A.8)',
    category: 'Technological',
    auditObjective: 'Secure authentication technologies and procedures shall be established based on information access restrictions and the topic-specific policy on access control.',
    suggestedEvidenceType: 'TECHNICAL_LOG_CONFIG',
    testingProcedure: 'Inspect Okta/Azure AD IdP conditional access policies enforcing mandatory phishing-resistant FIDO2/WebAuthn or TOTP MFA across all systems.',
    keywords: ['mfa', 'multi-factor authentication', 'sso', 'okta', 'azure ad', 'fido2', 'webauthn', 'password policy', 'authenticator'],
    checklistRefId: 'EVD-27K-032',
    departmentHint: 'IT Operations & Infrastructure',
    defaultTags: ['ISO27001-A.8.5', 'MFA-Enforcement', 'SSO-IdP-Config']
  },
  'A.8.7': {
    isoCode: 'A.8.7',
    standard: 'ISO/IEC 27001:2022',
    title: 'Protection Against Malware',
    themeCategory: 'Technological Controls (A.8)',
    category: 'Technological',
    auditObjective: 'Protection against malware shall be implemented and supported by appropriate user awareness.',
    suggestedEvidenceType: 'TECHNICAL_LOG_CONFIG',
    testingProcedure: 'Inspect CrowdStrike/Defender EDR agent deployment metrics showing active sensor coverage, real-time blocking, and automated signature updates.',
    keywords: ['malware', 'antivirus', 'edr', 'crowdstrike', 'sentinelone', 'defender', 'ransomware', 'signature update'],
    checklistRefId: 'EVD-27K-033',
    departmentHint: 'Security Operations (SOC) & Threat Intel',
    defaultTags: ['ISO27001-A.8.7', 'Malware-Protection', 'EDR-Telemetric-Logs']
  },
  'A.8.8': {
    isoCode: 'A.8.8',
    standard: 'ISO/IEC 27001:2022',
    title: 'Management of Technical Vulnerabilities',
    themeCategory: 'Technological Controls (A.8)',
    category: 'Technological',
    auditObjective: 'Information about technical vulnerabilities of information systems in use shall be obtained, the organization’s exposure evaluated, and appropriate measures taken.',
    suggestedEvidenceType: 'TEST_REPORT',
    testingProcedure: 'Inspect Tenable/Qualys vulnerability scan reports, monthly patching registers, and third-party annual penetration testing reports with remediation sign-off.',
    keywords: ['vulnerability management', 'penetration test', 'pen test', 'tenable', 'qualys', 'cve', 'patch management', 'vulnerability scan'],
    checklistRefId: 'EVD-27K-034',
    departmentHint: 'Security Operations (SOC) & Threat Intel',
    defaultTags: ['ISO27001-A.8.8', 'Vulnerability-Management', 'Pen-Test-Report']
  },
  'A.8.9': {
    isoCode: 'A.8.9',
    standard: 'ISO/IEC 27001:2022',
    title: 'Configuration Management',
    themeCategory: 'Technological Controls (A.8)',
    category: 'Technological',
    auditObjective: 'Configurations, including security configurations, of hardware, software, services, and networks shall be established, documented, implemented, monitored, and reviewed.',
    suggestedEvidenceType: 'TECHNICAL_LOG_CONFIG',
    testingProcedure: 'Inspect Terraform/Ansible Infrastructure-as-Code (IaC) repositories, CIS benchmark hardening baselines, and configuration drift detection reports.',
    keywords: ['configuration management', 'iac', 'terraform', 'ansible', 'cis benchmark', 'hardening baseline', 'golden image'],
    checklistRefId: 'EVD-27K-035',
    departmentHint: 'Software Engineering & DevOps',
    defaultTags: ['ISO27001-A.8.9', 'Configuration-Hardening', 'Terraform-IaC']
  },
  'A.8.10': {
    isoCode: 'A.8.10',
    standard: 'ISO/IEC 27001:2022',
    title: 'Information Deletion',
    themeCategory: 'Technological Controls (A.8)',
    category: 'Technological',
    auditObjective: 'Data stored in information systems, devices, or in any other storage media shall be deleted when no longer required.',
    suggestedEvidenceType: 'TECHNICAL_LOG_CONFIG',
    testingProcedure: 'Inspect automated S3 lifecycle rules, database soft/hard deletion cron jobs, and compliance with data retention schedules.',
    keywords: ['data deletion', 'information deletion', 'retention schedule', 's3 lifecycle', 'purge script', 'right to be forgotten'],
    checklistRefId: 'EVD-27K-036',
    departmentHint: 'Software Engineering & DevOps',
    defaultTags: ['ISO27001-A.8.10', 'Data-Deletion', 'Lifecycle-Retention']
  },
  'A.8.11': {
    isoCode: 'A.8.11',
    standard: 'ISO/IEC 27001:2022',
    title: 'Data Masking',
    themeCategory: 'Technological Controls (A.8)',
    category: 'Technological',
    auditObjective: 'Data masking shall be used in accordance with the organization’s topic-specific policy on access control and other relevant topic-specific policies.',
    suggestedEvidenceType: 'TECHNICAL_LOG_CONFIG',
    testingProcedure: 'Inspect database pseudonymization routines, staging database anonymization pipelines, and DLP masking rules for PII/PCI data.',
    keywords: ['data masking', 'pseudonymization', 'anonymization', 'pii masking', 'obfuscation', 'synthetic test data'],
    checklistRefId: 'EVD-27K-037',
    departmentHint: 'Software Engineering & DevOps',
    defaultTags: ['ISO27001-A.8.11', 'Data-Masking', 'PII-Obfuscation']
  },
  'A.8.12': {
    isoCode: 'A.8.12',
    standard: 'ISO/IEC 27001:2022',
    title: 'Data Leakage Prevention (DLP)',
    themeCategory: 'Technological Controls (A.8)',
    category: 'Technological',
    auditObjective: 'Data leakage prevention measures shall be applied to systems, networks, and any other devices that process, store, or transmit sensitive information.',
    suggestedEvidenceType: 'TECHNICAL_LOG_CONFIG',
    testingProcedure: 'Inspect endpoint DLP policies, email gateway egress filtering rules, and automated USB block lists.',
    keywords: ['dlp', 'data leakage prevention', 'data loss prevention', 'usb blocking', 'email filtering', 'egress monitoring'],
    checklistRefId: 'EVD-27K-038',
    departmentHint: 'Security Operations (SOC) & Threat Intel',
    defaultTags: ['ISO27001-A.8.12', 'DLP-Policies', 'Egress-Control']
  },
  'A.8.13': {
    isoCode: 'A.8.13',
    standard: 'ISO/IEC 27001:2022',
    title: 'Information Backup',
    themeCategory: 'Technological Controls (A.8)',
    category: 'Technological',
    auditObjective: 'Backup copies of information, software, and systems shall be maintained and regularly tested in accordance with the agreed topic-specific policy on backup.',
    suggestedEvidenceType: 'TEST_REPORT',
    testingProcedure: 'Inspect automated daily/weekly backup schedules, immutable cloud storage (AWS S3 Object Lock), and quarterly backup restoration test logs.',
    keywords: ['backup', 'database backup', 'immutable backup', 's3 object lock', 'restore test', 'backup test', 'rpo backup'],
    checklistRefId: 'EVD-27K-039',
    departmentHint: 'IT Operations & Infrastructure',
    defaultTags: ['ISO27001-A.8.13', 'Backup-Testing', 'Immutable-Storage']
  },
  'A.8.15': {
    isoCode: 'A.8.15',
    standard: 'ISO/IEC 27001:2022',
    title: 'Logging',
    themeCategory: 'Technological Controls (A.8)',
    category: 'Technological',
    auditObjective: 'Logs that record activities, exceptions, faults, and other relevant events shall be produced, stored, protected, and analyzed.',
    suggestedEvidenceType: 'TECHNICAL_LOG_CONFIG',
    testingProcedure: 'Inspect SIEM / CloudWatch / Datadog log ingestion pipelines, centralized retention (≥365 days), and WORM access restrictions preventing log tampering.',
    keywords: ['logging', 'audit trail', 'siem', 'cloudwatch', 'datadog', 'centralized logging', 'log retention', 'syslog'],
    checklistRefId: 'EVD-27K-040',
    departmentHint: 'Security Operations (SOC) & Threat Intel',
    defaultTags: ['ISO27001-A.8.15', 'Centralized-Logging', 'SIEM-Audit-Trail']
  },
  'A.8.16': {
    isoCode: 'A.8.16',
    standard: 'ISO/IEC 27001:2022',
    title: 'Monitoring Activities',
    themeCategory: 'Technological Controls (A.8)',
    category: 'Technological',
    auditObjective: 'Networks, systems, and applications shall be monitored for anomalous behavior and appropriate actions taken to evaluate potential information security incidents.',
    suggestedEvidenceType: 'TECHNICAL_LOG_CONFIG',
    testingProcedure: 'Inspect 24/7 SOC dashboard, automated alert correlation rules, MTTR/MTTD metrics, and behavioral anomaly detection alerts.',
    keywords: ['monitoring', 'soc alerting', 'anomaly detection', 'behavioral analytics', 'siem alert', 'mttd', 'mttr'],
    checklistRefId: 'EVD-27K-041',
    departmentHint: 'Security Operations (SOC) & Threat Intel',
    defaultTags: ['ISO27001-A.8.16', 'SOC-Monitoring', 'Anomaly-Alerts']
  },
  'A.8.20': {
    isoCode: 'A.8.20',
    standard: 'ISO/IEC 27001:2022',
    title: 'Network Security',
    themeCategory: 'Technological Controls (A.8)',
    category: 'Technological',
    auditObjective: 'Networks and network devices shall be secured, managed, and controlled to protect information in systems and applications.',
    suggestedEvidenceType: 'TECHNICAL_LOG_CONFIG',
    testingProcedure: 'Inspect VPC network architecture, firewall rule change logs, bastion host configs, and network intrusion prevention (IPS) systems.',
    keywords: ['network security', 'vpc', 'firewall', 'security groups', 'bastion', 'ips', 'ids', 'subnet isolation', 'dmz'],
    checklistRefId: 'EVD-27K-042',
    departmentHint: 'IT Operations & Infrastructure',
    defaultTags: ['ISO27001-A.8.20', 'Network-Security', 'VPC-Firewall-Rules']
  },
  'A.8.24': {
    isoCode: 'A.8.24',
    standard: 'ISO/IEC 27001:2022',
    title: 'Use of Cryptography',
    themeCategory: 'Technological Controls (A.8)',
    category: 'Technological',
    auditObjective: 'Rules for the effective use of cryptography, including cryptographic key management, shall be defined and implemented.',
    suggestedEvidenceType: 'TECHNICAL_LOG_CONFIG',
    testingProcedure: 'Inspect KMS key rotation configurations, TLS 1.3 protocol enforcement, and AES-256 encryption at rest configurations.',
    keywords: ['cryptography', 'encryption', 'tls', 'kms', 'aes-256', 'key rotation', 'hsm', 'ssl certificates'],
    checklistRefId: 'EVD-27K-043',
    departmentHint: 'Software Engineering & DevOps',
    defaultTags: ['ISO27001-A.8.24', 'Cryptography-Policy', 'KMS-Key-Rotation', 'TLS1.3-AES256']
  },
  'A.8.25': {
    isoCode: 'A.8.25',
    standard: 'ISO/IEC 27001:2022',
    title: 'Secure Development Life Cycle (SDLC)',
    themeCategory: 'Technological Controls (A.8)',
    category: 'Technological',
    auditObjective: 'Rules for the secure development of software and systems shall be established and applied.',
    suggestedEvidenceType: 'POLICY_PROCEDURE',
    testingProcedure: 'Inspect the Secure SDLC Policy, SAST/DAST automated CI/CD pipeline blocking gates, and dependency vulnerability scanning (Snyk/Dependabot).',
    keywords: ['sdlc', 'secure coding', 'sast', 'dast', 'ci/cd security', 'dependency scan', 'snyk', 'owasp top 10'],
    checklistRefId: 'EVD-27K-044',
    departmentHint: 'Software Engineering & DevOps',
    defaultTags: ['ISO27001-A.8.25', 'Secure-SDLC', 'SAST-CI/CD-Gate']
  },
  'A.8.28': {
    isoCode: 'A.8.28',
    standard: 'ISO/IEC 27001:2022',
    title: 'Secure Coding',
    themeCategory: 'Technological Controls (A.8)',
    category: 'Technological',
    auditObjective: 'Secure coding principles shall be applied to software development.',
    suggestedEvidenceType: 'TECHNICAL_LOG_CONFIG',
    testingProcedure: 'Sample pull requests verifying static code analysis clean passes, absence of hardcoded secrets (GitGuardian), and peer security reviews.',
    keywords: ['secure coding', 'gitguardian', 'secret scanning', 'owasp', 'code review', 'sanitization', 'input validation'],
    checklistRefId: 'EVD-27K-045',
    departmentHint: 'Software Engineering & DevOps',
    defaultTags: ['ISO27001-A.8.28', 'Secure-Coding-Standards', 'Secret-Scanning']
  }
};

export const ISO_REQUIREMENTS_LIST = Object.values(ISO_REQUIREMENTS_CATALOG);

export const ISO_THEME_CATEGORIES: IsoThemeCategory[] = [
  'Organizational Controls (A.5)',
  'People Controls (A.6)',
  'Physical Controls (A.7)',
  'Technological Controls (A.8)',
  'Management System (Clauses 4-10)'
];

export function getIsoRequirementMeta(isoCode: string): IsoRequirementDefinition | undefined {
  if (!isoCode) return undefined;
  const clean = isoCode.trim();
  // Exact match
  if (ISO_REQUIREMENTS_CATALOG[clean]) return ISO_REQUIREMENTS_CATALOG[clean];
  
  // Try case insensitive or loose matching (e.g. "a.8.24" -> "A.8.24", "Clause 4.3" -> "Clause 4.3")
  const upper = clean.toUpperCase();
  const found = Object.values(ISO_REQUIREMENTS_CATALOG).find(
    r => r.isoCode.toUpperCase() === upper || r.isoCode.toUpperCase().replace(/\s+/g, '') === upper.replace(/\s+/g, '')
  );
  return found;
}

export function getIsoThemeBadgeClasses(themeCategory: string | undefined): { bg: string; text: string; border: string; accent: string } {
  if (!themeCategory) {
    return {
      bg: 'bg-slate-800/80',
      text: 'text-slate-300',
      border: 'border-slate-700',
      accent: 'text-sky-400'
    };
  }

  if (themeCategory.includes('Technological') || themeCategory.includes('A.8')) {
    return {
      bg: 'bg-cyan-950/70',
      text: 'text-cyan-300',
      border: 'border-cyan-700/60',
      accent: 'text-cyan-400'
    };
  }
  if (themeCategory.includes('Organizational') || themeCategory.includes('A.5')) {
    return {
      bg: 'bg-indigo-950/70',
      text: 'text-indigo-300',
      border: 'border-indigo-700/60',
      accent: 'text-indigo-400'
    };
  }
  if (themeCategory.includes('People') || themeCategory.includes('A.6')) {
    return {
      bg: 'bg-emerald-950/70',
      text: 'text-emerald-300',
      border: 'border-emerald-700/60',
      accent: 'text-emerald-400'
    };
  }
  if (themeCategory.includes('Physical') || themeCategory.includes('A.7')) {
    return {
      bg: 'bg-amber-950/70',
      text: 'text-amber-300',
      border: 'border-amber-700/60',
      accent: 'text-amber-400'
    };
  }
  // Clauses 4-10 Management System
  return {
    bg: 'bg-purple-950/70',
    text: 'text-purple-300',
    border: 'border-purple-700/60',
    accent: 'text-purple-400'
  };
}

/**
 * Client-Side Semantic Heuristic Engine (Fallback when backend AI API is unreachable or offline)
 */
export function createClientSideIsoFallbackScan(evidence: {
  title: string;
  fileName?: string;
  controlCode?: string;
  department?: string;
  tags?: string[];
  documentText?: string;
}): IsoScanResult {
  const combinedText = `${evidence.title} ${evidence.fileName || ''} ${evidence.controlCode || ''} ${evidence.department || ''} ${(evidence.tags || []).join(' ')} ${evidence.documentText || ''}`.toLowerCase();

  const scored: Array<{ def: IsoRequirementDefinition; score: number; matchedKeywords: string[] }> = [];

  for (const def of ISO_REQUIREMENTS_LIST) {
    let score = 0;
    const matchedKeywords: string[] = [];

    // Exact control code match has highest priority
    if (evidence.controlCode && (
      evidence.controlCode.toLowerCase() === def.isoCode.toLowerCase() ||
      evidence.controlCode.toLowerCase().replace(/[^a-z0-9]/g, '') === def.isoCode.toLowerCase().replace(/[^a-z0-9]/g, '')
    )) {
      score += 65;
      matchedKeywords.push(`Target Control Match (${def.isoCode})`);
    }

    // Title / File / Keyword match
    for (const kw of def.keywords) {
      if (combinedText.includes(kw.toLowerCase())) {
        score += 15;
        matchedKeywords.push(kw);
      }
    }

    // Department match boost
    if (evidence.department && def.departmentHint.toLowerCase().includes(evidence.department.toLowerCase())) {
      score += 12;
    }

    // Standard title token match
    const titleTokens = def.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    for (const tok of titleTokens) {
      if (combinedText.includes(tok)) {
        score += 8;
      }
    }

    if (score > 10) {
      scored.push({ def, score, matchedKeywords });
    }
  }

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Take top 1 to 3 matches
  const topMatches = scored.slice(0, 3);

  // Fallback to controlCode or A.5.15 if no matches found
  if (topMatches.length === 0) {
    const fallbackDef = getIsoRequirementMeta(evidence.controlCode || 'A.5.15') || ISO_REQUIREMENTS_CATALOG['A.5.15'];
    topMatches.push({
      def: fallbackDef,
      score: 55,
      matchedKeywords: ['Baseline Information Security Requirement']
    });
  }

  const primaryMatch = topMatches[0].def;

  const mappedRequirements: IsoRequirementMapping[] = topMatches.map(({ def, score, matchedKeywords }) => {
    const confidence: 'HIGH' | 'MEDIUM' | 'LOW' = score >= 50 ? 'HIGH' : score >= 25 ? 'MEDIUM' : 'LOW';
    return {
      isoCode: def.isoCode,
      isoStandard: def.standard,
      category: def.category,
      themeCategory: def.themeCategory,
      requirementTitle: def.title,
      confidence,
      relevanceScore: Math.min(score, 98),
      auditObjective: def.auditObjective,
      suggestedEvidenceType: def.suggestedEvidenceType,
      testingProcedure: def.testingProcedure,
      rationale: `Substantiates ${def.isoCode} (${def.title}) based on identified evidence artifacts: ${matchedKeywords.slice(0, 3).join(', ')}.`,
      checklistRefId: def.checklistRefId,
      departmentHint: def.departmentHint
    };
  });

  const suggestedTags = Array.from(new Set([
    ...primaryMatch.defaultTags,
    `ISO27001-${primaryMatch.isoCode}`,
    primaryMatch.category,
    primaryMatch.suggestedEvidenceType
  ]));

  return {
    scannedAt: new Date().toISOString(),
    mappedRequirements,
    primaryCategory: primaryMatch.themeCategory,
    recommendedControlCode: primaryMatch.isoCode,
    suggestedTags,
    summary: `Artifact categorized under ${primaryMatch.themeCategory} supporting ${primaryMatch.isoCode}: ${primaryMatch.title}. Meets auditor expectations for ${primaryMatch.suggestedEvidenceType}.`,
    overallConfidence: mappedRequirements[0]?.confidence || 'MEDIUM',
    keyEvidenceArtifactsIdentified: primaryMatch.keywords.slice(0, 4),
    auditInspectionChecklist: [
      `Inspect artifact integrity and validity dates for ${primaryMatch.isoCode}`,
      `Verify formal departmental ownership under ${primaryMatch.departmentHint}`,
      `Validate alignment against ISO/IEC 27001:2022 ${primaryMatch.isoCode} testing procedure`
    ],
    leadAuditorTestRecommendation: primaryMatch.testingProcedure
  };
}

/**
 * Scan evidence with server-side AI (Gemini) with seamless client-side heuristic fallback
 */
export async function scanEvidenceWithISO(evidence: {
  title: string;
  fileName?: string;
  controlCode?: string;
  department?: string;
  tags?: string[];
  documentText?: string;
}): Promise<IsoScanResult> {
  try {
    const res = await fetch('/api/ai/iso-auto-tag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: evidence.title,
        fileName: evidence.fileName || '',
        controlCode: evidence.controlCode || '',
        department: evidence.department || '',
        tags: evidence.tags || [],
        documentText: evidence.documentText || ''
      })
    });

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    if (data && data.mappedRequirements && data.mappedRequirements.length > 0) {
      return {
        scannedAt: data.scannedAt || new Date().toISOString(),
        mappedRequirements: data.mappedRequirements,
        primaryCategory: data.primaryCategory || data.mappedRequirements[0].themeCategory,
        recommendedControlCode: data.recommendedControlCode || data.mappedRequirements[0].isoCode,
        suggestedTags: data.suggestedTags || [],
        summary: data.summary || 'Evidence scanned and categorized against ISO/IEC 27001:2022 requirements.',
        overallConfidence: data.overallConfidence || 'HIGH',
        keyEvidenceArtifactsIdentified: data.keyEvidenceArtifactsIdentified || [],
        auditInspectionChecklist: data.auditInspectionChecklist || [],
        leadAuditorTestRecommendation: data.leadAuditorTestRecommendation || data.mappedRequirements[0].testingProcedure
      };
    }
    return createClientSideIsoFallbackScan(evidence);
  } catch (err) {
    console.warn('ISO AI endpoint error, executing robust local heuristic scan:', err);
    return createClientSideIsoFallbackScan(evidence);
  }
}

/**
 * Batch scan multiple evidence items
 */
export async function scanBatchEvidenceWithISO(
  items: Array<{
    id: string;
    title: string;
    fileName?: string;
    controlCode?: string;
    department?: string;
    tags?: string[];
    documentText?: string;
  }>
): Promise<Array<{ id: string; scanResult: IsoScanResult }>> {
  try {
    const res = await fetch('/api/ai/iso-auto-tag-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        return data.results.map((r: any) => ({
          id: r.id,
          scanResult: r.scanResult
        }));
      }
    }
  } catch (e) {
    console.warn('Batch ISO API error, processing in parallel locally:', e);
  }

  // Fallback to local heuristic scanning for each item
  return items.map(item => ({
    id: item.id,
    scanResult: createClientSideIsoFallbackScan(item)
  }));
}

/**
 * Returns badge styling classes for an ISO category
 */
export function getIsoCategoryBadgeClasses(category?: string): { bg: string; text: string; border: string } {
  if (!category) {
    return { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' };
  }
  if (category.includes('Organizational') || category.includes('Clause A.5')) {
    return { bg: 'bg-blue-950/80', text: 'text-blue-300', border: 'border-blue-700/60' };
  }
  if (category.includes('People') || category.includes('Clause A.6')) {
    return { bg: 'bg-amber-950/80', text: 'text-amber-300', border: 'border-amber-700/60' };
  }
  if (category.includes('Physical') || category.includes('Clause A.7')) {
    return { bg: 'bg-emerald-950/80', text: 'text-emerald-300', border: 'border-emerald-700/60' };
  }
  if (category.includes('Technological') || category.includes('Clause A.8')) {
    return { bg: 'bg-purple-950/80', text: 'text-purple-300', border: 'border-purple-700/60' };
  }
  if (category.includes('Management') || category.includes('ISMS')) {
    return { bg: 'bg-indigo-950/80', text: 'text-indigo-300', border: 'border-indigo-700/60' };
  }
  return { bg: 'bg-sky-950/80', text: 'text-sky-300', border: 'border-sky-700/60' };
}

/**
 * Returns text color class for an ISO Standard
 */
export function getIsoStandardColor(standard?: string): string {
  if (!standard) return 'text-sky-400';
  if (standard.includes('42001')) return 'text-violet-400';
  if (standard.includes('27701')) return 'text-teal-400';
  return 'text-sky-400';
}
