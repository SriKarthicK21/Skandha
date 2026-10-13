// DPDP Act 2023 Statutory Training Gap Analyzer & Global Standards Training Hub Engine
// Bridges corporate department roles with DPDPA statutory mandates (Sections 4-16, 33)
// and maps compliance remediation to actionable courses in the Global Standards Training Hub.

export interface StatutoryObligationItem {
  clause: string;
  ruleName: string;
  statutoryObligation: string;
  penaltyExposure: string;
  consequenceOfFailure: string;
}

export interface IdentifiedRoleGap {
  id: string;
  gapTitle: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'UNADDRESSED' | 'IN_PROGRESS' | 'REMEDIATED';
  currentProficiency: number; // 0 - 100
  targetProficiency: number;  // 0 - 100
}

export interface StandardsRecommendedCourse {
  id: string;
  standardId: string; // matches id in standards catalog ('iso-27001', 'gdpr', 'iso-42001', 'dora', 'compliance-general', etc.)
  standardCode: string;
  standardName: string;
  courseTitle: string;
  clauseRef: string;
  durationMinutes: number;
  level: 'Foundational' | 'Intermediate' | 'Lead Implementer';
  curriculumSummary: string;
  deliverablesCovered: string[];
  standardsTemplateMatch?: string;
  auditorDefenseFocus: string;
}

export interface RoleAssessedEmployee {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  status: 'PENDING_TRAINING' | 'ENROLLED' | 'CERTIFIED';
  score: number;
  lastAssessed: string;
  assignedCourse: string;
}

export interface RoleDiagnosticQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  statutoryBasis: string;
}

export interface DepartmentRoleGapProfile {
  id: string;
  department: string;
  departmentCategory: 'Engineering & Technology' | 'Commercial & Marketing' | 'Operations & Support' | 'Governance & Legal' | 'Human Capital' | 'Executive';
  roleTitle: string;
  headcount: number;
  riskExposureLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  statutoryClauseRefs: string[];
  dataTypesHandled: string[];
  statutoryRequirements: StatutoryObligationItem[];
  identifiedGaps: IdentifiedRoleGap[];
  recommendedStandardsModules: StandardsRecommendedCourse[];
  sampleEmployees: RoleAssessedEmployee[];
  quickDiagnosticQuestions: RoleDiagnosticQuestion[];
}

export const DPDP_DEPARTMENT_ROLE_GAP_PROFILES: DepartmentRoleGapProfile[] = [
  {
    id: 'role-devops-01',
    department: 'Engineering & DevOps',
    departmentCategory: 'Engineering & Technology',
    roleTitle: 'DevOps & Cloud Infrastructure Architect',
    headcount: 24,
    riskExposureLevel: 'CRITICAL',
    statutoryClauseRefs: ['Section 8(5)', 'Section 8(7)', 'Section 16'],
    dataTypesHandled: [
      'Production database backups',
      'Encrypted cloud buckets (S3 / GCS / Azure Blob)',
      'Application logs containing hashed/raw identifiers',
      'API gateway access tokens and encryption secrets'
    ],
    statutoryRequirements: [
      {
        clause: 'Section 8(5)',
        ruleName: 'Reasonable Security Safeguards',
        statutoryObligation: 'Must protect digital personal data by taking reasonable security safeguards to prevent personal data breach, including cryptographically secure backups and perimeter defense.',
        penaltyExposure: 'Up to ₹250 Crores under Section 33 Schedule',
        consequenceOfFailure: 'Catastrophic regulatory fine, suspension of data processing activities, and direct Data Protection Board of India (DPBI) investigation.'
      },
      {
        clause: 'Section 8(7)',
        ruleName: 'Mandatory Erasure Upon Consent Withdrawal / Purpose Expiry',
        statutoryObligation: 'Implement automated, verifiable database purge pipelines to cascade deletions across primary datastores, replica clusters, and cold archive storage.',
        penaltyExposure: 'Up to ₹50 Crores under Section 33 Schedule',
        consequenceOfFailure: 'Failure to purge data within prescribed timeframes triggers statutory compliance notices and principal civil grievance claims.'
      },
      {
        clause: 'Section 16',
        ruleName: 'Cross-Border Data Transfer Whitelist Compliance',
        statutoryObligation: 'Ensure database replication and cold snapshot locations strictly avoid countries or territories restricted by Central Government notification.',
        penaltyExposure: 'Up to ₹250 Crores under Section 33 Schedule',
        consequenceOfFailure: 'Immediate halt on cross-border operations and mandatory repatriation of Indian citizen personal data.'
      }
    ],
    identifiedGaps: [
      {
        id: 'gap-dev-1',
        gapTitle: 'Unsanitized Production Dumps in Staging / Dev Environments',
        description: 'Software development teams periodically replicate production data subsets into non-production sandbox instances without deterministic PII masking or tokenization.',
        severity: 'CRITICAL',
        status: 'UNADDRESSED',
        currentProficiency: 32,
        targetProficiency: 95
      },
      {
        id: 'gap-dev-2',
        gapTitle: 'Lack of Automated Downstream Retention Purge TTLs',
        description: 'PostgreSQL and MongoDB collections lack statutory TTL indexes to auto-purge user records upon consent withdrawal or account termination under Section 8(7).',
        severity: 'HIGH',
        status: 'IN_PROGRESS',
        currentProficiency: 48,
        targetProficiency: 90
      },
      {
        id: 'gap-dev-3',
        gapTitle: 'Multi-Region Cloud Failover Without Section 16 Boundary Lock',
        description: 'Cloud disaster recovery plans route read replicas to overseas regions without verified Central Government negative list screening.',
        severity: 'HIGH',
        status: 'UNADDRESSED',
        currentProficiency: 40,
        targetProficiency: 90
      }
    ],
    recommendedStandardsModules: [
      {
        id: 'adv-mod-dev-1',
        standardId: 'iso-27001',
        standardCode: 'ISO 27001:2022',
        standardName: 'Information Security Management System (ISMS)',
        courseTitle: 'Annex A.8.24 & A.8.28: Cryptography, Key Management & Secure DevOps Coding',
        clauseRef: 'Control A.8.24 (Use of Cryptography) & A.8.28 (Secure Coding)',
        durationMinutes: 45,
        level: 'Intermediate',
        curriculumSummary: 'Comprehensive engineering guidance on implementing envelope encryption (AES-GCM-256), Hardware Security Module (HSM) key rotation, and eliminating PII leakage from application crash telemetry.',
        deliverablesCovered: ['Cryptographic Policy', 'Secure Development Policy', 'Data Masking SOP'],
        standardsTemplateMatch: 'Access Control Policy & Secure Development Standard',
        auditorDefenseFocus: 'How do you prove non-production databases cannot be used to reconstruct genuine customer identity attributes?'
      },
      {
        id: 'adv-mod-dev-2',
        standardId: 'gdpr',
        standardCode: 'EU GDPR',
        standardName: 'General Data Protection Regulation',
        courseTitle: 'Article 32 & 25: Privacy by Design & Automated Erasure Architecture',
        clauseRef: 'GDPR Articles 25 (Privacy by Design) & 32 (Security of Processing)',
        durationMinutes: 40,
        level: 'Lead Implementer',
        curriculumSummary: 'Technical architectural blueprints for building distributed event-driven erasure cascades, handling foreign key constraints in microservices, and proving complete non-repudiation deletion.',
        deliverablesCovered: ['Record of Disposal Template', 'Automated Deletion Protocol'],
        standardsTemplateMatch: '72-Hour Personal Data Breach Protocol & RoPA Architecture',
        auditorDefenseFocus: 'Can you demonstrate live audit logs validating that an erasure command triggered in the frontend successfully cascaded to cloud backups?'
      }
    ],
    sampleEmployees: [
      { id: 'emp-101', name: 'Rahul Mehta', email: 'rahul.m@enterprise.io', avatarInitials: 'RM', status: 'PENDING_TRAINING', score: 38, lastAssessed: '2026-08-14', assignedCourse: 'ISO 27001: Cryptography & Key Management' },
      { id: 'emp-102', name: 'Pooja Sharma', email: 'pooja.s@enterprise.io', avatarInitials: 'PS', status: 'ENROLLED', score: 64, lastAssessed: '2026-08-28', assignedCourse: 'GDPR Article 32 & 25: Privacy by Design' },
      { id: 'emp-103', name: 'Vikram Joshi', email: 'vikram.j@enterprise.io', avatarInitials: 'VJ', status: 'CERTIFIED', score: 92, lastAssessed: '2026-09-01', assignedCourse: 'ISO 27001: Secure DevOps Coding' }
    ],
    quickDiagnosticQuestions: [
      {
        id: 1,
        question: 'Under DPDP Act Section 8(5), what constitutes a mandatory technical safeguard for production customer databases?',
        options: [
          'Storing raw plaintext if the server is located inside India',
          'Industry-standard encryption at rest and in transit with separated cryptographic key management',
          'Only locking root SSH access with a shared password',
          'Signing an internal NDA without deploying technical controls'
        ],
        correctIndex: 1,
        explanation: 'Section 8(5) mandates reasonable security safeguards. For database infrastructure, this strictly requires encryption at rest/transit and isolated key rotation.',
        statutoryBasis: 'DPDPA Section 8(5) & DPDP Rules Chapter III'
      },
      {
        id: 2,
        question: 'When an Indian Data Principal revokes consent, how must cloud backup snapshots be treated under Section 8(7)?',
        options: [
          'They can be retained indefinitely as long as developers do not touch them',
          'They must be securely overwritten or queued for deterministic shredding upon standard backup rotation cycle',
          'No action is ever required for cloud infrastructure',
          'Only the frontend UI needs to display account deleted'
        ],
        correctIndex: 1,
        explanation: 'Section 8(7) requires erasing digital personal data unless statutory retention laws apply. Snapshots must expire and be purged through deterministic lifecycle policies.',
        statutoryBasis: 'DPDPA Section 8(7)'
      }
    ]
  },
  {
    id: 'role-marketing-02',
    department: 'Marketing & Growth',
    departmentCategory: 'Commercial & Marketing',
    roleTitle: 'Performance Marketing & Growth Lead',
    headcount: 18,
    riskExposureLevel: 'CRITICAL',
    statutoryClauseRefs: ['Section 5', 'Section 6', 'Section 9(2)', 'Section 9(3)'],
    dataTypesHandled: [
      'Customer lead generation forms and email lists',
      'Web cookies, tracking pixels, and mobile ad identifiers (IDFA/GAID)',
      'Behavioral lookalike audiences and CRM customer segments',
      'Event tracking payloads and funnel conversion telemetry'
    ],
    statutoryRequirements: [
      {
        clause: 'Section 9(2) & 9(3)',
        ruleName: 'Absolute Prohibition on Child Tracking & Behavioral Profiling',
        statutoryObligation: 'Strictly prohibited from undertaking tracking, behavioral monitoring, or targeted advertising directed at any individual under the age of 18 years.',
        penaltyExposure: 'Up to ₹200 Crores under Section 33 Schedule',
        consequenceOfFailure: 'Immediate enforcement action by the Data Protection Board of India (DPBI) and irreparable public brand damage.'
      },
      {
        clause: 'Section 5 & 6',
        ruleName: 'Prior Itemized Multilingual Notice & Valid Unbundled Consent',
        statutoryObligation: 'Must provide clear itemized notice specifying personal data categories collected and purposes. Pre-ticked boxes, bundled terms, and dark patterns are strictly invalid.',
        penaltyExposure: 'Up to ₹50 Crores under Section 33 Schedule',
        consequenceOfFailure: 'All collected lead lists and marketing databases rendered legally unusable under statutory doctrine of tainted consent.'
      },
      {
        clause: 'Section 6(4)',
        ruleName: 'Frictionless Consent Withdrawal Parity',
        statutoryObligation: 'Withdrawing marketing consent must be as effortless as giving it. Unsubscribe links must take immediate effect across all marketing automation tools.',
        penaltyExposure: 'Up to ₹50 Crores under Section 33 Schedule',
        consequenceOfFailure: 'Data Principal complaints to Grievance Officer and DPBI penalty proceedings.'
      }
    ],
    identifiedGaps: [
      {
        id: 'gap-mkt-1',
        gapTitle: 'Deployment of Third-Party Tracking Pixels Without Prior Opt-In',
        description: 'Marketing website fires Meta Pixel, Google Analytics, and LinkedIn Insight tags prior to user clicking explicit affirmative consent on the cookie banner.',
        severity: 'CRITICAL',
        status: 'UNADDRESSED',
        currentProficiency: 25,
        targetProficiency: 95
      },
      {
        id: 'gap-mkt-2',
        gapTitle: 'Absence of Age-Gating in Ad-Tech Retargeting Segments',
        description: 'Custom audiences uploaded to ad networks do not suppress users under 18 years, risking direct violation of Section 9(2) child behavioral targeting restrictions.',
        severity: 'CRITICAL',
        status: 'UNADDRESSED',
        currentProficiency: 20,
        targetProficiency: 100
      },
      {
        id: 'gap-mkt-3',
        gapTitle: 'Pre-Checked "Receive Offers" Opt-In Boxes on Lead Magnets',
        description: 'E-book and webinar registration forms use pre-ticked opt-in checkboxes, directly violating DPDP Section 6 unbundled consent mandates.',
        severity: 'HIGH',
        status: 'IN_PROGRESS',
        currentProficiency: 45,
        targetProficiency: 95
      }
    ],
    recommendedStandardsModules: [
      {
        id: 'adv-mod-mkt-1',
        standardId: 'gdpr',
        standardCode: 'EU GDPR',
        standardName: 'General Data Protection Regulation',
        courseTitle: 'Article 6 & 7: Consent Architecture, Dark Pattern Elimination & Opt-In Frameworks',
        clauseRef: 'GDPR Articles 6 (Lawfulness), 7 (Consent) & ePrivacy Directive',
        durationMinutes: 35,
        level: 'Intermediate',
        curriculumSummary: 'Elimination of deceptive design patterns, architecting zero-latency affirmative consent switches, and managing Consent Management Platform (CMP) telemetry.',
        deliverablesCovered: ['Consent Collection Procedure', 'Cookie & Tracking Pixel Policy'],
        standardsTemplateMatch: 'Privacy Notice (Customer & Employee) & Consent Records Register',
        auditorDefenseFocus: 'Show evidence that your marketing pixels remain blocked until affirmative affirmative consent is recorded.'
      },
      {
        id: 'adv-mod-mkt-2',
        standardId: 'iso-27701',
        standardCode: 'ISO 27701:2019',
        standardName: 'Privacy Information Management System (PIMS)',
        courseTitle: 'Clause 7.2.5 & 7.2.8: Notice Itemization & Frictionless Consent Revocation',
        clauseRef: 'PIMS Clauses 7.2.5 (Consent) and 7.2.8 (Obligations to Data Principals)',
        durationMinutes: 40,
        level: 'Intermediate',
        curriculumSummary: 'Techniques for real-time synchronization between email marketing tools (HubSpot, Klaviyo, Braze) and the central fiduciary consent ledger.',
        deliverablesCovered: ['Direct Marketing Opt-Out SOP', 'Lead Management Privacy Checklist'],
        standardsTemplateMatch: 'Record of Processing Activities (RoPA) - Marketing Operations',
        auditorDefenseFocus: 'How do you guarantee that a user who unsubscribes from email is also pruned from CRM custom audiences?'
      }
    ],
    sampleEmployees: [
      { id: 'emp-201', name: 'Tanvi Sen', email: 'tanvi.s@enterprise.io', avatarInitials: 'TS', status: 'PENDING_TRAINING', score: 28, lastAssessed: '2026-08-11', assignedCourse: 'GDPR Consent Architecture & Dark Pattern Elimination' },
      { id: 'emp-202', name: 'Arjun Nambiar', email: 'arjun.n@enterprise.io', avatarInitials: 'AN', status: 'PENDING_TRAINING', score: 35, lastAssessed: '2026-08-19', assignedCourse: 'Section 9 Child Behavioral Tracking Restrictions' },
      { id: 'emp-203', name: 'Sneha Roy', email: 'sneha.r@enterprise.io', avatarInitials: 'SR', status: 'ENROLLED', score: 62, lastAssessed: '2026-08-30', assignedCourse: 'ISO 27701: Consent Synchronization' }
    ],
    quickDiagnosticQuestions: [
      {
        id: 1,
        question: 'Under DPDPA Section 9(2), can your growth team run retargeting ads to a 16-year-old user based on their browsing behavior?',
        options: [
          'Yes, if the marketing budget is approved by the CMO',
          'Yes, if the product is educational or career-related',
          'No, Section 9(2) imposes an absolute prohibition on tracking or targeted advertising directed at children',
          'Yes, provided a disclaimer is written in small print at the bottom of the ad'
        ],
        correctIndex: 2,
        explanation: 'Section 9(2) and 9(3) strictly forbid behavioral monitoring, tracking, or targeted advertising directed at any individual under 18 years of age.',
        statutoryBasis: 'DPDPA Section 9(2) & 9(3)'
      },
      {
        id: 2,
        question: 'Is a pre-checked box on a signup form considered valid consent under Section 6 of DPDPA?',
        options: [
          'Yes, as long as the user did not uncheck it',
          'No, consent must be free, specific, informed, unconditional, and given through clear affirmative action',
          'Yes, for free trials and introductory webinars',
          'Yes, if the privacy policy is accessible in English'
        ],
        correctIndex: 1,
        explanation: 'Section 6 requires unambiguous affirmative action. Silence, pre-ticked boxes, or inactivity can never constitute valid statutory consent.',
        statutoryBasis: 'DPDPA Section 6(1)'
      }
    ]
  },
  {
    id: 'role-hr-03',
    department: 'Human Resources & People Ops',
    departmentCategory: 'Human Capital',
    roleTitle: 'Talent Acquisition & HR Operations Specialist',
    headcount: 14,
    riskExposureLevel: 'HIGH',
    statutoryClauseRefs: ['Section 7(i)', 'Section 8(5)', 'Section 8(7)'],
    dataTypesHandled: [
      'Candidate resumes, portfolio links, and reference interview notes',
      'Employee Aadhaar cards, PAN details, and bank account numbers',
      'Medical insurance records, disability declarations, and emergency contacts',
      'Biometric fingerprint/facial recognition attendance logs'
    ],
    statutoryRequirements: [
      {
        clause: 'Section 7(i)',
        ruleName: 'Legitimate Uses for Employment Purposes',
        statutoryObligation: 'Processing employee personal data without separate consent is permitted ONLY for employment purposes or safeguarding employer corporate assets. Cannot be leveraged for non-employment purposes.',
        penaltyExposure: 'Up to ₹50 Crores under Section 33 Schedule',
        consequenceOfFailure: 'Illegal processing liabilities and formal labor grievance disputes.'
      },
      {
        clause: 'Section 8(7)',
        ruleName: 'Retention & Disposal of Candidate Data',
        statutoryObligation: 'Resumes of unselected applicants must be disposed of after the hiring cycle concludes unless explicit affirmative consent is obtained to retain them for future talent pools.',
        penaltyExposure: 'Up to ₹50 Crores under Section 33 Schedule',
        consequenceOfFailure: 'Regulatory audit findings regarding unauthorized candidate data stockpiling.'
      },
      {
        clause: 'Section 8(5)',
        ruleName: 'Reasonable Safeguards for Government Identifiers & Biometrics',
        statutoryObligation: 'Enforce access controls and masking for Aadhaar and biometric attendance data to prevent identity theft and unauthorized internal leakage.',
        penaltyExposure: 'Up to ₹250 Crores under Section 33 Schedule',
        consequenceOfFailure: 'Dual regulatory exposure under DPDP Act 2023 and the Aadhaar Act 2016.'
      }
    ],
    identifiedGaps: [
      {
        id: 'gap-hr-1',
        gapTitle: 'Perpetual Storage of Rejected Applicant CVs Without Consent',
        description: 'Recruitment portal retains 15,000+ unselected candidate resumes from previous 4 years with no statutory retention schedule or talent pool opt-in.',
        severity: 'HIGH',
        status: 'UNADDRESSED',
        currentProficiency: 30,
        targetProficiency: 90
      },
      {
        id: 'gap-hr-2',
        gapTitle: 'Unmasked Aadhaar Numbers Stored in Shared HR Folders',
        description: 'Scanned onboarding identity proofs containing full 12-digit Aadhaar numbers sit in unrestricted Google Drive folders without 8-digit masking.',
        severity: 'CRITICAL',
        status: 'IN_PROGRESS',
        currentProficiency: 42,
        targetProficiency: 95
      },
      {
        id: 'gap-hr-3',
        gapTitle: 'Lack of Clear Employee Privacy Notice on Onboarding',
        description: 'New hires sign generic appointment letters without an itemized employee privacy notice explaining what personal data is processed under Section 7(i).',
        severity: 'MEDIUM',
        status: 'UNADDRESSED',
        currentProficiency: 50,
        targetProficiency: 85
      }
    ],
    recommendedStandardsModules: [
      {
        id: 'adv-mod-hr-1',
        standardId: 'gdpr',
        standardCode: 'EU GDPR',
        standardName: 'General Data Protection Regulation',
        courseTitle: 'Article 88: Workplace Privacy, Employee Data Governance & Candidate Onboarding',
        clauseRef: 'GDPR Article 88 (Processing in the Context of Employment)',
        durationMinutes: 30,
        level: 'Foundational',
        curriculumSummary: 'Clear boundaries between legitimate employer management and unlawful surveillance, implementing compliant candidate retention schedules, and masking statutory IDs.',
        deliverablesCovered: ['Employee Privacy Policy', 'Candidate Retention & Disposal SOP'],
        standardsTemplateMatch: 'Privacy Notice (Customer & Employee) & Information Classification SOP',
        auditorDefenseFocus: 'Demonstrate the exact policy and automated workflow used to purge unselected candidate resumes.'
      },
      {
        id: 'adv-mod-hr-2',
        standardId: 'iso-27001',
        standardCode: 'ISO 27001:2022',
        standardName: 'Information Security Management System (ISMS)',
        courseTitle: 'Annex A.6: People Security, Background Checks & Clean Desk Protocols',
        clauseRef: 'Controls A.6.1 (Screening) to A.6.8 (Information Security Awareness)',
        durationMinutes: 35,
        level: 'Intermediate',
        curriculumSummary: 'Pre-employment screening ethics, NDAs, handling sensitive payroll data, and immediate revocation of access upon employee offboarding.',
        deliverablesCovered: ['Access De-provisioning Checklist', 'HR Security Guidelines'],
        standardsTemplateMatch: 'Human Resources Security Policy & Disciplinary Procedure',
        auditorDefenseFocus: 'How do you verify that a departing employee no longer retains access to HR cloud storage or employee databases?'
      }
    ],
    sampleEmployees: [
      { id: 'emp-301', name: 'Divya Iyer', email: 'divya.i@enterprise.io', avatarInitials: 'DI', status: 'PENDING_TRAINING', score: 36, lastAssessed: '2026-08-18', assignedCourse: 'Workplace Privacy & Candidate Retention' },
      { id: 'emp-302', name: 'Manish Verma', email: 'manish.v@enterprise.io', avatarInitials: 'MV', status: 'ENROLLED', score: 58, lastAssessed: '2026-08-25', assignedCourse: 'ISO 27001 Annex A.6: People Security' },
      { id: 'emp-303', name: 'Ananya Deshmukh', email: 'ananya.d@enterprise.io', avatarInitials: 'AD', status: 'CERTIFIED', score: 88, lastAssessed: '2026-09-02', assignedCourse: 'Employee Data Governance & ID Masking' }
    ],
    quickDiagnosticQuestions: [
      {
        id: 1,
        question: 'Under DPDP Section 7(i), can an employer sell or share employee personal data with commercial third-party marketing companies?',
        options: [
          'Yes, because the employer owns the employee data',
          'No, Section 7(i) permits processing strictly for employment purposes or corporate asset protection, not third-party commercial exploitation',
          'Yes, provided it is mentioned in an HR company circular',
          'Only if the employee has completed 1 year of tenure'
        ],
        correctIndex: 1,
        explanation: 'Section 7(i) is strictly confined to genuine employment purposes (payroll, statutory benefits, corporate security). It cannot be used for third-party commercial marketing.',
        statutoryBasis: 'DPDPA Section 7(i)'
      },
      {
        id: 2,
        question: 'What is the required handling for unselected job applicant resumes once hiring closes?',
        options: [
          'Keep them permanently in case the candidate reapplies in 10 years',
          'Erase them securely unless the candidate gave explicit consent to be kept in a talent pool',
          'Upload them to a public HR database',
          'Share them freely with vendor headhunters'
        ],
        correctIndex: 1,
        explanation: 'Under Section 8(7), once the recruitment purpose expires, candidate data must be erased unless consent was obtained for retention in a talent pool.',
        statutoryBasis: 'DPDPA Section 8(7)'
      }
    ]
  },
  {
    id: 'role-support-04',
    department: 'Customer Support & Grievance Redressal',
    departmentCategory: 'Operations & Support',
    roleTitle: 'Customer Care & Grievance Redressal Specialist',
    headcount: 32,
    riskExposureLevel: 'CRITICAL',
    statutoryClauseRefs: ['Section 11', 'Section 12', 'Section 13', 'Section 14'],
    dataTypesHandled: [
      'Customer support tickets, live chat transcripts, and recorded calls',
      'Identity verification tokens (OTP, government photo ID uploads)',
      'Customer grievance escalation logs and redressal correspondence',
      'Surrogate nomination requests and death certificates'
    ],
    statutoryRequirements: [
      {
        clause: 'Section 13',
        ruleName: 'Statutory Right of Grievance Redressal',
        statutoryObligation: 'Must maintain a readily available, frictionless Grievance Redressal mechanism and resolve complaints within the statutory time period before the principal approaches DPBI.',
        penaltyExposure: 'Up to ₹50 Crores under Section 33 Schedule',
        consequenceOfFailure: 'Escalation by Data Principal directly to the Data Protection Board of India (DPBI) triggering regulatory inquiry.'
      },
      {
        clause: 'Section 11 & 12',
        ruleName: 'Fulfillment of Access, Correction & Erasure Rights',
        statutoryObligation: 'Must fulfill Data Principal rights to access data summary, correct inaccurate records, complete missing entries, and erase data across operational systems.',
        penaltyExposure: 'Up to ₹50 Crores under Section 33 Schedule',
        consequenceOfFailure: 'Statutory non-compliance citations and adverse orders from DPBI.'
      },
      {
        clause: 'Section 14',
        ruleName: 'Right to Nominate Surrogate',
        statutoryObligation: 'Provide operational mechanism for Data Principals to designate a nominee to exercise rights in the event of their death or medical incapacity.',
        penaltyExposure: 'Up to ₹50 Crores under Section 33 Schedule',
        consequenceOfFailure: 'Failure to respect legal nominee representation during bereavement claims.'
      }
    ],
    identifiedGaps: [
      {
        id: 'gap-cs-1',
        gapTitle: 'Failure to Triage DPDP Statutory Grievances vs Routine Support',
        description: 'Support agents treat formal Section 13 privacy grievance tickets as ordinary complaints, letting statutory SLA windows lapse with no escalation to the DPO.',
        severity: 'CRITICAL',
        status: 'UNADDRESSED',
        currentProficiency: 35,
        targetProficiency: 95
      },
      {
        id: 'gap-cs-2',
        gapTitle: 'Inadequate Identity Verification Prior to Data Disclosure',
        description: 'Agents occasionally email customer transaction histories upon receiving an unverified email request, creating severe risk of unauthorized disclosure.',
        severity: 'CRITICAL',
        status: 'IN_PROGRESS',
        currentProficiency: 45,
        targetProficiency: 95
      },
      {
        id: 'gap-cs-3',
        gapTitle: 'No Workflow for Section 14 Surrogate Nomination Requests',
        description: 'Customer service desk lacks standard operating procedures to verify legal heirship documents or registered surrogate nominations.',
        severity: 'MEDIUM',
        status: 'UNADDRESSED',
        currentProficiency: 20,
        targetProficiency: 85
      }
    ],
    recommendedStandardsModules: [
      {
        id: 'adv-mod-cs-1',
        standardId: 'gdpr',
        standardCode: 'EU GDPR',
        standardName: 'General Data Protection Regulation',
        courseTitle: 'Articles 12-22: Data Subject Rights Intake, Authentication & Fulfillment SLAs',
        clauseRef: 'GDPR Articles 12 (Transparency) & 15-20 (Access, Rectification, Erasure)',
        durationMinutes: 45,
        level: 'Intermediate',
        curriculumSummary: 'Operational SOPs for intake, identity proofing without over-collecting data, compiling data summaries, and responding within legal timelines.',
        deliverablesCovered: ['DSAR Fulfillment Procedure', 'Customer Verification Checklist'],
        standardsTemplateMatch: 'Data Subject Access Request (DSAR) Procedure & Register',
        auditorDefenseFocus: 'How do support agents authenticate that the person requesting data erasure is genuinely the Data Principal?'
      },
      {
        id: 'adv-mod-cs-2',
        standardId: 'iso-20000-1',
        standardCode: 'ISO 20000-1:2018',
        standardName: 'IT Service Management System (ITSM)',
        courseTitle: 'Clause 8.5: Incident, Request & Grievance SLA Management',
        clauseRef: 'ITSM Clause 8.5.2 (Incident and Service Request Management)',
        durationMinutes: 30,
        level: 'Foundational',
        curriculumSummary: 'Setting up automated ticket routing, SLA countdown triggers, executive escalation thresholds, and audit trails for regulatory compliance.',
        deliverablesCovered: ['Incident Management SOP', 'Service Desk Escalation Matrix'],
        standardsTemplateMatch: 'Consolidated Management Review & Service Desk Register',
        auditorDefenseFocus: 'Show your ticketing dashboard where privacy grievances are segregated from bug reports.'
      }
    ],
    sampleEmployees: [
      { id: 'emp-401', name: 'Farhan Akhtar', email: 'farhan.a@enterprise.io', avatarInitials: 'FA', status: 'PENDING_TRAINING', score: 32, lastAssessed: '2026-08-16', assignedCourse: 'DSAR Authentication & Statutory Grievance Handling' },
      { id: 'emp-402', name: 'Geeta Menon', email: 'geeta.m@enterprise.io', avatarInitials: 'GM', status: 'ENROLLED', score: 60, lastAssessed: '2026-08-27', assignedCourse: 'ISO 20000-1 Grievance SLA Management' },
      { id: 'emp-403', name: 'Rohan Bose', email: 'rohan.b@enterprise.io', avatarInitials: 'RB', status: 'CERTIFIED', score: 90, lastAssessed: '2026-09-03', assignedCourse: 'Customer Rights Fulfillment & Identity Proofing' }
    ],
    quickDiagnosticQuestions: [
      {
        id: 1,
        question: 'When a customer submits a formal complaint requesting erasure of their personal data, what must the support agent verify first?',
        options: [
          'Whether the customer is a paid subscriber or free user',
          'The identity of the Data Principal to ensure personal data is not inadvertently exposed or erased by an impostor',
          'Ask them why they are leaving and offer a discount',
          'Immediately forward the raw email to the CEO'
        ],
        correctIndex: 1,
        explanation: 'Before acting on any access or erasure request, the Fiduciary must verify the identity of the Data Principal to prevent fraudulent disclosures or malicious erasures.',
        statutoryBasis: 'DPDPA Section 11 & 12'
      },
      {
        id: 2,
        question: 'What is the consequence if an organization fails to maintain a functioning Grievance Redressal mechanism under Section 13?',
        options: [
          'No consequence as long as the service continues',
          'Data Principals can directly approach the Data Protection Board of India, exposing the firm to up to ₹50 Crore penalties',
          'The customer ticket is automatically marked resolved',
          'The customer loses all rights under the Act'
        ],
        correctIndex: 1,
        explanation: 'Under Section 13, failure to provide grievance redressal allows the Data Principal to escalate to the DPBI, and incurs penalties under Section 33.',
        statutoryBasis: 'DPDPA Section 13 & 33'
      }
    ]
  },
  {
    id: 'role-legal-05',
    department: 'Legal, Compliance & DPO Office',
    departmentCategory: 'Governance & Legal',
    roleTitle: 'Data Protection Officer (DPO) & Compliance Counsel',
    headcount: 6,
    riskExposureLevel: 'CRITICAL',
    statutoryClauseRefs: ['Section 8(1)', 'Section 8(6)', 'Section 10', 'Section 33'],
    dataTypesHandled: [
      'Data Processing Agreements (DPAs) with third-party vendors',
      'Regulatory breach notification dossiers (Form DPBI-BN-1)',
      'Data Protection Impact Assessments (DPIAs) and independent audit reports',
      'Board of Directors risk reports and statutory compliance filings'
    ],
    statutoryRequirements: [
      {
        clause: 'Section 8(6)',
        ruleName: 'Mandatory Personal Data Breach Notification',
        statutoryObligation: 'In the event of a personal data breach, the Data Fiduciary must give the Board and each affected Data Principal intimation of such breach within prescribed timeline (6 hours).',
        penaltyExposure: 'Up to ₹200 Crores under Section 33 Schedule',
        consequenceOfFailure: 'Immediate severe regulatory penalty for concealment or delayed breach notification.'
      },
      {
        clause: 'Section 8(1)',
        ruleName: 'Contractual Data Processor Governance',
        statutoryObligation: 'A Data Fiduciary may engage a Data Processor only under a valid, binding contract that stipulates technical safeguards and cascading audit duties.',
        penaltyExposure: 'Up to ₹50 Crores under Section 33 Schedule',
        consequenceOfFailure: 'Unlawful processing liability and loss of defensibility during vendor-caused breaches.'
      },
      {
        clause: 'Section 10',
        ruleName: 'Significant Data Fiduciary (SDF) Governance',
        statutoryObligation: 'Appoint an Indian-resident DPO reporting directly to the Board, engage an independent Data Auditor, and conduct periodic DPIAs and audits.',
        penaltyExposure: 'Up to ₹150 Crores under Section 33 Schedule',
        consequenceOfFailure: 'Statutory governance penalties and mandatory operational restrictions by the DPBI.'
      }
    ],
    identifiedGaps: [
      {
        id: 'gap-leg-1',
        gapTitle: 'No Rehearsed 6-Hour DPBI Incident Notification Playbook',
        description: 'Legal and technical teams lack an actionable 6-hour response protocol to compile affected principal counts, root cause telemetry, and DPBI Form BN-1 submissions.',
        severity: 'CRITICAL',
        status: 'UNADDRESSED',
        currentProficiency: 40,
        targetProficiency: 100
      },
      {
        id: 'gap-leg-2',
        gapTitle: 'Outdated Vendor Contracts Missing DPDP Section 8(1) Clauses',
        description: 'Over 65 existing vendor MSAs lack explicit DPDP 2023 clauses, 2-hour vendor breach escalation SLAs, and mandatory downstream erasure cascade covenants.',
        severity: 'HIGH',
        status: 'IN_PROGRESS',
        currentProficiency: 55,
        targetProficiency: 95
      },
      {
        id: 'gap-leg-3',
        gapTitle: 'Absence of Standardized DPIA Scoring for High-Risk AI Algorithms',
        description: 'New automated underwriting and customer scoring AI models deployed without documented DPIA evaluating risks to data principal rights under Section 10(2).',
        severity: 'HIGH',
        status: 'UNADDRESSED',
        currentProficiency: 30,
        targetProficiency: 90
      }
    ],
    recommendedStandardsModules: [
      {
        id: 'adv-mod-leg-1',
        standardId: 'gdpr',
        standardCode: 'EU GDPR',
        standardName: 'General Data Protection Regulation',
        courseTitle: 'Articles 33 & 35: Rapid Breach Notification & DPIA Execution Framework',
        clauseRef: 'GDPR Articles 33 (Breach Notification) & 35 (Data Protection Impact Assessment)',
        durationMinutes: 50,
        level: 'Lead Implementer',
        curriculumSummary: 'Comprehensive methodology for severity scoring, forensic triage under time constraints, drafting regulatory submissions, and conducting risk assessments.',
        deliverablesCovered: ['Data Breach Notification Dossier', 'DPIA Template & Methodology'],
        standardsTemplateMatch: '72-Hour Personal Data Breach Protocol & DPIA Reports',
        auditorDefenseFocus: 'Walk through your evidence dossier for notifying regulatory authorities and data subjects in under 6 hours.'
      },
      {
        id: 'adv-mod-leg-2',
        standardId: 'iso-27701',
        standardCode: 'ISO 27701:2019',
        standardName: 'Privacy Information Management System (PIMS)',
        courseTitle: 'Lead Implementer: Fiduciary Governance, Vendor DPAs & Independent Audit Defense',
        clauseRef: 'ISO 27701 Clauses 5, 6, 7 & Annex A/B Controller/Processor Controls',
        durationMinutes: 60,
        level: 'Lead Implementer',
        curriculumSummary: 'Building an audit-proof PIMS, drafting enforceable processor DPAs with audit covenants, and leading internal compliance defense during regulatory scrutiny.',
        deliverablesCovered: ['Data Processing Agreement Standard Clauses', 'Internal Audit Charter'],
        standardsTemplateMatch: 'Comprehensive Diagnostic Gap Assessment Matrix & Kickoff Charter',
        auditorDefenseFocus: 'Provide proof that your external vendors have contractually committed to notifying you of breaches within 2 hours.'
      }
    ],
    sampleEmployees: [
      { id: 'emp-501', name: 'Meera Chawla', email: 'meera.c@enterprise.io', avatarInitials: 'MC', status: 'ENROLLED', score: 72, lastAssessed: '2026-08-29', assignedCourse: 'Rapid Breach Notification & DPIA Execution' },
      { id: 'emp-502', name: 'Siddharth Rao', email: 'siddharth.r@enterprise.io', avatarInitials: 'SR', status: 'PENDING_TRAINING', score: 48, lastAssessed: '2026-08-14', assignedCourse: 'ISO 27701 Lead Implementer & Vendor DPAs' },
      { id: 'emp-503', name: 'Elena Rostova', email: 'elena.r@enterprise.io', avatarInitials: 'ER', status: 'CERTIFIED', score: 96, lastAssessed: '2026-09-04', assignedCourse: 'Lead Implementer Privacy Governance' }
    ],
    quickDiagnosticQuestions: [
      {
        id: 1,
        question: 'Under DPDP Act Section 8(6), who must be notified in the event of a personal data breach?',
        options: [
          'Only the internal Board of Directors',
          'Both the Data Protection Board of India (DPBI) AND each affected Data Principal in such form and manner as prescribed',
          'Only the cyber insurance underwriter',
          'No notification is needed if the breach was accidental'
        ],
        correctIndex: 1,
        explanation: 'Section 8(6) unequivocally requires notifying both the DPBI and every affected Data Principal.',
        statutoryBasis: 'DPDPA Section 8(6)'
      },
      {
        id: 2,
        question: 'What is the maximum penalty prescribed under the Section 33 Schedule for failing to notify a personal data breach under Section 8(6)?',
        options: [
          '₹10,000',
          '₹50 Crores',
          'Up to ₹200 Crores',
          'Up to ₹250 Crores'
        ],
        correctIndex: 2,
        explanation: 'Under the Section 33 Schedule, failure to notify a personal data breach under Section 8(6) carries a statutory penalty of up to ₹200 Crores.',
        statutoryBasis: 'DPDPA Section 33 Schedule (Item 2)'
      }
    ]
  },
  {
    id: 'role-product-06',
    department: 'Product Management & UX',
    departmentCategory: 'Engineering & Technology',
    roleTitle: 'Principal Product Manager & UX Lead',
    headcount: 12,
    riskExposureLevel: 'HIGH',
    statutoryClauseRefs: ['Section 5(1)', 'Section 5(3)', 'Section 6(1)', 'Section 9(1)'],
    dataTypesHandled: [
      'User onboarding flows, permission modal dialogs, and feature toggles',
      'Multilingual privacy notices across English and 22 Indian languages',
      'Age-gating prompts, birth date declarations, and DigiLocker/Aadhaar VPC tokens',
      'In-app consent dashboard, consent revocation toggles, and grievance buttons'
    ],
    statutoryRequirements: [
      {
        clause: 'Section 5(3)',
        ruleName: '22-Language Multilingual Accessibility',
        statutoryObligation: 'Data Principal must be given the option to access the notice and consent request in English or any of the 22 languages specified in the Eighth Schedule to the Constitution of India.',
        penaltyExposure: 'Up to ₹50 Crores under Section 33 Schedule',
        consequenceOfFailure: 'Invalidation of consent across vernacular user bases.'
      },
      {
        clause: 'Section 9(1)',
        ruleName: 'Verifiable Parental Consent (VPC) for Minors',
        statutoryObligation: 'Before processing any personal data of a child (<18 years), the Data Fiduciary must obtain verifiable consent of the parent or lawful guardian.',
        penaltyExposure: 'Up to ₹200 Crores under Section 33 Schedule',
        consequenceOfFailure: 'Regulatory bans on minor onboarding and severe statutory financial penalties.'
      },
      {
        clause: 'Section 6(1)',
        ruleName: 'Unbundled, Unconditional Consent',
        statutoryObligation: 'Services cannot be conditioned on agreeing to non-essential personal data processing. Opt-ins for analytics or third-party sharing must be distinctly separate from core functionality.',
        penaltyExposure: 'Up to ₹50 Crores under Section 33 Schedule',
        consequenceOfFailure: 'Consent deemed null and void under statutory doctrine of unbundled consent.'
      }
    ],
    identifiedGaps: [
      {
        id: 'gap-prod-1',
        gapTitle: 'Single-Language English Notice on Mobile Apps',
        description: 'Android and iOS mobile apps only display terms and notices in English, lacking the statutory switcher for the 22 Eighth Schedule Indian languages under Section 5(3).',
        severity: 'HIGH',
        status: 'UNADDRESSED',
        currentProficiency: 28,
        targetProficiency: 90
      },
      {
        id: 'gap-prod-2',
        gapTitle: 'Bundled Core Feature Opt-In with Marketing Tracking',
        description: 'Account creation flow requires users to accept marketing notifications and analytics tracking as a mandatory condition for finishing registration.',
        severity: 'CRITICAL',
        status: 'IN_PROGRESS',
        currentProficiency: 45,
        targetProficiency: 95
      },
      {
        id: 'gap-prod-3',
        gapTitle: 'Simple Self-Declaration for Age Without Verifiable Parental Consent',
        description: 'Products popular with teenagers use a passive "Are you 18?" checkbox without verifiable guardian verification (e.g. DigiLocker, Aadhaar OTP, or Virtual ID).',
        severity: 'CRITICAL',
        status: 'UNADDRESSED',
        currentProficiency: 22,
        targetProficiency: 95
      }
    ],
    recommendedStandardsModules: [
      {
        id: 'adv-mod-prod-1',
        standardId: 'gdpr',
        standardCode: 'EU GDPR',
        standardName: 'General Data Protection Regulation',
        courseTitle: 'Article 25: Data Protection by Design & Default for Mobile & Web Applications',
        clauseRef: 'GDPR Article 25 (Data Protection by Design and by Default)',
        durationMinutes: 40,
        level: 'Intermediate',
        curriculumSummary: 'Designing transparent UX, unbundled consent toggles, building language switchers, and integrating non-intrusive age verification gates.',
        deliverablesCovered: ['Privacy UX Guidelines', 'Consent Flow Design Specs'],
        standardsTemplateMatch: 'Privacy Notice (Customer & Employee) & Consent Manager Integration SOP',
        auditorDefenseFocus: 'How do you demonstrate that a user can use the core product without consenting to optional marketing cookies?'
      },
      {
        id: 'adv-mod-prod-2',
        standardId: 'iso-9001',
        standardCode: 'ISO 9001:2015',
        standardName: 'Quality Management Systems (QMS)',
        courseTitle: 'Clause 8.2 & 8.3: Requirements for Products and Services & Design Control',
        clauseRef: 'QMS Clauses 8.2 (Requirements for Products) & 8.3 (Design and Development)',
        durationMinutes: 35,
        level: 'Foundational',
        curriculumSummary: 'Integrating statutory regulatory gates into the product development lifecycle (PDLC) so no feature launches without privacy signoff.',
        deliverablesCovered: ['Product Gate Review Checklist', 'Design Validation Dossier'],
        standardsTemplateMatch: 'Enterprise Risk & Opportunity Assessment Methodology',
        auditorDefenseFocus: 'Show your product sign-off checklist that verifies consent notices are reviewed by legal before deployment.'
      }
    ],
    sampleEmployees: [
      { id: 'emp-601', name: 'Kavita Patel', email: 'kavita.p@enterprise.io', avatarInitials: 'KP', status: 'PENDING_TRAINING', score: 30, lastAssessed: '2026-08-15', assignedCourse: 'Data Protection by Design & UX Compliance' },
      { id: 'emp-602', name: 'Naveen Reddy', email: 'naveen.r@enterprise.io', avatarInitials: 'NR', status: 'ENROLLED', score: 55, lastAssessed: '2026-08-26', assignedCourse: 'ISO 9001: Product Regulatory Gate Controls' }
    ],
    quickDiagnosticQuestions: [
      {
        id: 1,
        question: 'Under DPDPA Section 5(3), what language options must be offered to a Data Principal when presenting a notice?',
        options: [
          'English and Hindi only',
          'English or any of the 22 languages specified in the Eighth Schedule to the Constitution of India',
          'Any single language chosen by the engineering team',
          'Only the language spoken by the server administrator'
        ],
        correctIndex: 1,
        explanation: 'Section 5(3) specifies that notice and consent requests must be accessible in English or any of the 22 Eighth Schedule Indian languages.',
        statutoryBasis: 'DPDPA Section 5(3)'
      }
    ]
  },
  {
    id: 'role-procure-07',
    department: 'Procurement & Vendor Risk Management',
    departmentCategory: 'Operations & Support',
    roleTitle: 'Vendor Management & Procurement Lead',
    headcount: 8,
    riskExposureLevel: 'HIGH',
    statutoryClauseRefs: ['Section 8(1)', 'Section 8(2)', 'Section 16'],
    dataTypesHandled: [
      'Master Services Agreements (MSAs) and vendor scope statements',
      'Third-party SaaS software subscriptions (CRM, billing, analytics, HR tools)',
      'Sub-contractor security questionnaires and SOC 2 / ISO 27001 audit certificates',
      'Cloud hosting regional deployment schedules and cross-border vendor disclosures'
    ],
    statutoryRequirements: [
      {
        clause: 'Section 8(1) & 8(2)',
        ruleName: 'Data Processor Accountability & Cascading Liability',
        statutoryObligation: 'A Data Fiduciary is strictly responsible for compliance by any Data Processor engaged by it. Processors can only be engaged under a valid contract.',
        penaltyExposure: 'Up to ₹250 Crores under Section 33 Schedule',
        consequenceOfFailure: 'The Fiduciary is held strictly liable by DPBI for any security breach or unlawful processing committed by its vendors.'
      },
      {
        clause: 'Section 16',
        ruleName: 'Vendor Cross-Border Transfer Compliance',
        statutoryObligation: 'Ensure foreign vendor cloud infrastructure does not route digital personal data into prohibited jurisdictions.',
        penaltyExposure: 'Up to ₹250 Crores under Section 33 Schedule',
        consequenceOfFailure: 'Direct regulatory order to terminate vendor contract and repatriate data.'
      }
    ],
    identifiedGaps: [
      {
        id: 'gap-proc-1',
        gapTitle: 'Shadow IT SaaS Purchases Without Security & DPA Sign-Off',
        description: 'Business units purchase cloud subscriptions via corporate credit cards without entering into statutory DPDP Data Processing Agreements.',
        severity: 'HIGH',
        status: 'UNADDRESSED',
        currentProficiency: 38,
        targetProficiency: 90
      },
      {
        id: 'gap-proc-2',
        gapTitle: 'Lack of Cascading 2-Hour Breach Escalation in Vendor MSAs',
        description: 'Vendor contracts allow vendors 7 to 14 business days to notify of breaches, making it impossible for the fiduciary to meet the statutory 6-hour DPBI reporting window.',
        severity: 'CRITICAL',
        status: 'IN_PROGRESS',
        currentProficiency: 42,
        targetProficiency: 95
      }
    ],
    recommendedStandardsModules: [
      {
        id: 'adv-mod-proc-1',
        standardId: 'iso-27001',
        standardCode: 'ISO 27001:2022',
        standardName: 'Information Security Management System (ISMS)',
        courseTitle: 'Annex A.5.19 to A.5.23: Supplier Relationships & Supply Chain Security',
        clauseRef: 'ISMS Controls A.5.19 (Supplier Security), A.5.20 (Supplier Agreements), A.5.21 (ICT Supply Chain)',
        durationMinutes: 40,
        level: 'Intermediate',
        curriculumSummary: 'Comprehensive vendor tiering, third-party security questionnaires, mandatory breach reporting SLAs in vendor contracts, and right-to-audit clauses.',
        deliverablesCovered: ['Supplier Security Policy', 'Vendor Risk Assessment Matrix'],
        standardsTemplateMatch: 'Third-Party Security Policy & DPA Standard Terms',
        auditorDefenseFocus: 'Show an auditor a signed vendor agreement and point out the clause binding them to rapid breach notification.'
      },
      {
        id: 'adv-mod-proc-2',
        standardId: 'dora',
        standardCode: 'DORA',
        standardName: 'Digital Operational Resilience Act',
        courseTitle: 'Articles 28-31: ICT Third-Party Risk Management & Exit Strategies',
        clauseRef: 'DORA Chapter V (Managing ICT Third-Party Risk)',
        durationMinutes: 45,
        level: 'Lead Implementer',
        curriculumSummary: 'Contractual risk concentration analysis, multi-vendor redundancy, and establishing tested cloud exit strategies to prevent vendor lock-in.',
        deliverablesCovered: ['ICT Third-Party Exit Strategy Runbook', 'Vendor Audit Dossier'],
        standardsTemplateMatch: 'ICT Third-Party Exit Strategy & Transition Runbook',
        auditorDefenseFocus: 'How do you verify whether a critical cloud supplier has ever tested their DR failover?'
      }
    ],
    sampleEmployees: [
      { id: 'emp-701', name: 'Sanjay Dutt', email: 'sanjay.d@enterprise.io', avatarInitials: 'SD', status: 'PENDING_TRAINING', score: 40, lastAssessed: '2026-08-17', assignedCourse: 'Supplier Relationships & Supply Chain Security' },
      { id: 'emp-702', name: 'Leela Roy', email: 'leela.r@enterprise.io', avatarInitials: 'LR', status: 'ENROLLED', score: 65, lastAssessed: '2026-08-28', assignedCourse: 'DORA Third-Party Risk & Vendor Exit Strategies' }
    ],
    quickDiagnosticQuestions: [
      {
        id: 1,
        question: 'If a cloud SaaS vendor hired by your company suffers a data breach compromising Indian customer data, who does the DPBI hold liable?',
        options: [
          'Only the vendor, because the vendor was technically hosting the servers',
          'Your organization as the Data Fiduciary under Section 8(2), because the Fiduciary remains responsible for all processing by its processors',
          'Neither party, if the cloud was encrypted',
          'The individual software engineer who selected the SaaS tool'
        ],
        correctIndex: 1,
        explanation: 'Section 8(2) establishes cascading fiduciary responsibility: the Data Fiduciary is fully answerable to DPBI for the actions and breaches of its Data Processors.',
        statutoryBasis: 'DPDPA Section 8(2)'
      }
    ]
  },
  {
    id: 'role-exec-08',
    department: 'Executive Leadership & Board',
    departmentCategory: 'Executive',
    roleTitle: 'Chief Executive Officer (CEO), CTO & Board Members',
    headcount: 7,
    riskExposureLevel: 'CRITICAL',
    statutoryClauseRefs: ['Section 10(2)', 'Section 8(5)', 'Section 33'],
    dataTypesHandled: [
      'Executive governance packets and board minutes',
      'Enterprise risk register and DPBI compliance attestations',
      'Cyber risk insurance policies and statutory penalty exposure calculations',
      'M&A due diligence records and cross-border corporate restructuring plans'
    ],
    statutoryRequirements: [
      {
        clause: 'Section 10(2)',
        ruleName: 'Board Direct Accountability for DPO & Governance',
        statutoryObligation: 'In Significant Data Fiduciaries, the Data Protection Officer must report directly to the Board of Directors or governing body of the entity.',
        penaltyExposure: 'Up to ₹150 Crores under Section 33 Schedule',
        consequenceOfFailure: 'Corporate governance sanctions, director liability, and mandatory restructuring orders by DPBI.'
      },
      {
        clause: 'Section 33',
        ruleName: 'Financial & Reputational Liability Governance',
        statutoryObligation: 'Board must oversee allocation of adequate budgetary resources to enforce reasonable security safeguards, independent data audits, and DPIAs.',
        penaltyExposure: 'Up to ₹250 Crores per breach incident',
        consequenceOfFailure: 'Severe enterprise financial loss, share price devaluation, and loss of institutional trust.'
      }
    ],
    identifiedGaps: [
      {
        id: 'gap-exec-1',
        gapTitle: 'Lack of Quarterly Board Privacy & DPBI Risk Review Agenda',
        description: 'Board meetings review financial, growth, and general cyber metrics but lack a dedicated standing agenda for DPDP compliance posture, DPO reports, and open statutory gaps.',
        severity: 'HIGH',
        status: 'UNADDRESSED',
        currentProficiency: 50,
        targetProficiency: 95
      },
      {
        id: 'gap-exec-2',
        gapTitle: 'Under-resourcing of Independent Periodic Data Audits',
        description: 'Budget has not been formally allocated for mandatory independent third-party data audits required under Section 10(2)(b) for Significant Data Fiduciaries.',
        severity: 'CRITICAL',
        status: 'IN_PROGRESS',
        currentProficiency: 45,
        targetProficiency: 95
      }
    ],
    recommendedStandardsModules: [
      {
        id: 'adv-mod-exec-1',
        standardId: 'compliance-general',
        standardCode: 'IMS / ISO Governance',
        standardName: 'Integrated Management System & Executive Governance',
        courseTitle: 'Clause 9.3: Executive Board Management Review & Enterprise Risk Oversight',
        clauseRef: 'ISO Clause 9.3 (Management Review) & Clause 5 (Leadership)',
        durationMinutes: 30,
        level: 'Lead Implementer',
        curriculumSummary: 'How executive leadership structures quarterly privacy governance agendas, evaluates risk appetite, and signs off on statutory compliance attestations.',
        deliverablesCovered: ['Consolidated Management Review Minutes', 'Enterprise Risk Assessment Methodology'],
        standardsTemplateMatch: 'Consolidated Management Review Minutes & Enterprise CAPA Register',
        auditorDefenseFocus: 'Show documented evidence that top management reviewed data protection metrics within the past 12 months.'
      },
      {
        id: 'adv-mod-exec-2',
        standardId: 'for-consultants',
        standardCode: 'Audit Defense',
        standardName: 'Lead Auditor Pre-Flight Readiness & Mock Defense',
        courseTitle: 'Executive Pre-Flight Readiness & Regulatory Cross-Examination Defense',
        clauseRef: 'Executive Auditee Coaching & Board Defense',
        durationMinutes: 35,
        level: 'Lead Implementer',
        curriculumSummary: 'Preparing C-suite executives and board directors for inquiries from regulatory boards and external lead auditors with confidence and zero shelfware.',
        deliverablesCovered: ['Lead Auditor Pre-Flight Readiness Checklist', 'Executive Mock Interview Playbook'],
        standardsTemplateMatch: 'Auditee Coaching Flashcards & Mock Cross-Examination Dossier',
        auditorDefenseFocus: 'Can the CEO / Board Chair articulate the organization’s top 3 data protection risk exposures under DPDPA?'
      }
    ],
    sampleEmployees: [
      { id: 'emp-801', name: 'Vikramaditya Singhania', email: 'singhania@enterprise.io', avatarInitials: 'VS', status: 'PENDING_TRAINING', score: 48, lastAssessed: '2026-08-10', assignedCourse: 'Executive Board Management Review & Enterprise Risk' },
      { id: 'emp-802', name: 'Ritu Kapoor', email: 'ritu.k@enterprise.io', avatarInitials: 'RK', status: 'ENROLLED', score: 68, lastAssessed: '2026-08-24', assignedCourse: 'Executive Pre-Flight Readiness & DPBI Defense' }
    ],
    quickDiagnosticQuestions: [
      {
        id: 1,
        question: 'Under DPDP Act Section 10(2)(a), to whom must the Data Protection Officer of a Significant Data Fiduciary report?',
        options: [
          'To the Junior Sales Manager',
          'Directly to the Board of Directors or governing body of the Significant Data Fiduciary',
          'Exclusively to the IT helpdesk',
          'To the external advertising agency'
        ],
        correctIndex: 1,
        explanation: 'Section 10(2)(a) explicitly mandates that the DPO shall represent the Significant Data Fiduciary and be based in India, reporting directly to the Board of Directors.',
        statutoryBasis: 'DPDPA Section 10(2)(a)'
      }
    ]
  }
];

// Helper calculations and utilities
export interface OverallGapMetrics {
  totalDepartments: number;
  totalRolesAssessed: number;
  totalHeadcount: number;
  overallReadinessScore: number;
  criticalGapsCount: number;
  highGapsCount: number;
  mediumGapsCount: number;
  remediatedGapsCount: number;
  recommendedStandardsCoursesCount: number;
  totalStatutoryExposureAmount: string;
}

export const getOverallGapMetrics = (profiles: DepartmentRoleGapProfile[] = DPDP_DEPARTMENT_ROLE_GAP_PROFILES): OverallGapMetrics => {
  const departments = new Set(profiles.map(p => p.department));
  const totalRolesAssessed = profiles.length;
  const totalHeadcount = profiles.reduce((acc, p) => acc + p.headcount, 0);

  let totalProficiency = 0;
  let totalGaps = 0;
  let criticalGaps = 0;
  let highGaps = 0;
  let mediumGaps = 0;
  let remediatedGaps = 0;
  let recommendedCourses = 0;

  profiles.forEach(p => {
    p.identifiedGaps.forEach(g => {
      totalGaps++;
      totalProficiency += g.currentProficiency;
      if (g.status === 'REMEDIATED') remediatedGaps++;
      if (g.severity === 'CRITICAL') criticalGaps++;
      if (g.severity === 'HIGH') highGaps++;
      if (g.severity === 'MEDIUM') mediumGaps++;
    });
    recommendedCourses += p.recommendedStandardsModules.length;
  });

  const overallReadinessScore = totalGaps > 0 ? Math.round(totalProficiency / totalGaps) : 0;

  return {
    totalDepartments: departments.size,
    totalRolesAssessed,
    totalHeadcount,
    overallReadinessScore,
    criticalGapsCount: criticalGaps,
    highGapsCount: highGaps,
    mediumGapsCount: mediumGaps,
    remediatedGapsCount: remediatedGaps,
    recommendedStandardsCoursesCount: recommendedCourses,
    totalStatutoryExposureAmount: '₹250 Crores Max Statutory Exposure'
  };
};

export const exportGapAnalysisDossierMarkdown = (profiles: DepartmentRoleGapProfile[] = DPDP_DEPARTMENT_ROLE_GAP_PROFILES): string => {
  const metrics = getOverallGapMetrics(profiles);
  const now = new Date().toISOString().split('T')[0];

  let md = `# Republic of India • DPDP Act 2023 Statutory Training Gap Analysis & Standards Remediation Plan\n\n`;
  md += `**Generated Date**: ${now} | **Governing Statute**: Digital Personal Data Protection Act 2023 (Act No. 22 of 2023)\n`;
  md += `**Supervisory Body**: Data Protection Board of India (DPBI) & Ministry of Electronics and Information Technology (MeitY)\n`;
  md += `**Standard Grounding**: Accredited ISO 27001, EU GDPR, ISO 27701 & DORA Frameworks\n\n`;
  md += `---\n\n`;

  md += `## 1. Executive Summary & Compliance Posture\n\n`;
  md += `- **Assessed Departments**: ${metrics.totalDepartments}\n`;
  md += `- **Covered Role Profiles**: ${metrics.totalRolesAssessed} across ${metrics.totalHeadcount} operational employees\n`;
  md += `- **Current Statutory Awareness Index**: **${metrics.overallReadinessScore}%** (Target: ≥90%)\n`;
  md += `- **Identified Statutory Risk Gaps**: **${metrics.criticalGapsCount} Critical**, **${metrics.highGapsCount} High**, **${metrics.mediumGapsCount} Medium**\n`;
  md += `- **Remediated Gaps to Date**: ${metrics.remediatedGapsCount}\n`;
  md += `- **Potential Financial Exposure Under Section 33**: Up to ₹250 Crores per major security/breach failure\n\n`;

  md += `## 2. Departmental Role Cross-Reference & Statutory Obligations\n\n`;

  profiles.forEach(p => {
    md += `### ${p.department} — ${p.roleTitle}\n`;
    md += `- **Headcount**: ${p.headcount} personnel | **Risk Profile**: **${p.riskExposureLevel}**\n`;
    md += `- **Statutory Clauses**: ${p.statutoryClauseRefs.join(', ')}\n`;
    md += `- **Handled Data Footprint**: ${p.dataTypesHandled.join('; ')}\n\n`;

    md += `#### Statutory Requirements:\n`;
    p.statutoryRequirements.forEach(req => {
      md += `  - **${req.clause} (${req.ruleName})**: ${req.statutoryObligation}\n`;
      md += `    *Penalty Exposure*: ${req.penaltyExposure}\n`;
    });
    md += `\n`;

    md += `#### Identified Awareness / Operational Gaps:\n`;
    p.identifiedGaps.forEach(gap => {
      md += `  - [${gap.severity}] **${gap.gapTitle}** (Current: ${gap.currentProficiency}% | Target: ${gap.targetProficiency}% | Status: ${gap.status})\n`;
      md += `    ${gap.description}\n`;
    });
    md += `\n`;

    md += `#### Recommended Standards Training Hub Modules:\n`;
    p.recommendedStandardsModules.forEach(adv => {
      md += `  - **${adv.courseTitle}** [${adv.standardCode}]\n`;
      md += `    *Standard*: ${adv.standardName} (${adv.clauseRef}) | *Duration*: ${adv.durationMinutes} mins | *Level*: ${adv.level}\n`;
      md += `    *Curriculum*: ${adv.curriculumSummary}\n`;
      md += `    *Matched Policy Template*: ${adv.standardsTemplateMatch || adv.standardsTemplateMatch}\n`;
      md += `    *Auditor Defense Question*: "${adv.auditorDefenseFocus}"\n`;
    });
    md += `\n---\n\n`;
  });

  md += `## 3. Recommended Implementation Roadmap & Next Steps\n\n`;
  md += `1. **Immediate Action (Within 7 Days)**: Enroll all Engineering & DevOps personnel into ISO 27001 Cryptography & Secure Coding modules to mitigate ₹250 Cr Section 8(5) exposure.\n`;
  md += `2. **Marketing & Growth Remediation (Within 14 Days)**: Complete GDPR Article 6 & 7 Consent Architecture course to eliminate dark patterns and deploy Section 9 age-gating suppression filters.\n`;
  md += `3. **Legal & DPO SLA Drill (Within 21 Days)**: Execute 6-hour mock breach notification exercise using the Form DPBI-BN-1 template dossier.\n`;
  md += `4. **Periodic Re-Audit**: Re-evaluate departmental proficiency scores every 90 days to maintain statutory readiness.\n\n`;
  md += `*Report authenticated by Chief DPO & DPDP Compliance Directorate.*\n`;

  return md;
};
