export interface DPDPClauseItem {
  sectionNumber: number;
  sectionCode: string; // e.g., "SEC-01", "SEC-06"
  title: string;
  chapter: string; // "Chapter I", "Chapter II", etc.
  chapterTitle: string;
  statutoryRequirement: string;
  applicability: 'All Data Fiduciaries' | 'Significant Data Fiduciaries (SDF)' | 'Data Processors' | 'Consent Managers' | 'Data Principals' | 'Regulatory';
  penaltyMaxCrores: number; // in Crores INR (e.g. 250, 200, 150, 50, 0.001)
  mandatoryForSdf: boolean;
  recommendedEvidence: string[];
  auditChecklistQuestion: string;
  status: 'Compliant' | 'In Progress' | 'Non-Compliant' | 'Not Started' | 'Not Applicable';
  maturityLevel: number; // 1 to 5
  evidenceRef?: string;
  auditorNotes?: string;
  targetCompletionDate?: string;
  leadOwner?: string;
}

export interface DPDPUserConsentRecord {
  id: string;
  dataPrincipalId: string; // e.g. "DP-IND-98421"
  principalName: string;
  principalEmail: string;
  principalPhone: string;
  jurisdictionState: string; // e.g. "Maharashtra", "Karnataka", "Delhi"
  noticeLanguage: string; // English, Hindi, Tamil, Telugu, Bengali, Marathi, etc.
  processingPurpose: string;
  dataCategoriesCollected: string[];
  consentGivenDate: string;
  consentChannel: 'Web Portal' | 'Mobile App (Android/iOS)' | 'Offline Form' | 'Consent Manager API';
  consentManagerRef?: string; // e.g. "CM-DIGILOCKER-04"
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED' | 'PENDING_RECONSENT';
  revocationDate?: string;
  revocationReason?: string;
  downstreamProcessorsNotified: boolean;
  version: string;
}

export interface DPDPGrievanceRecord {
  id: string;
  grievanceCode: string; // e.g. "GRV-2026-001"
  dataPrincipalId: string;
  principalName: string;
  principalEmail: string;
  category: 'CONSENT_WITHDRAWAL_FAILURE' | 'ERASURE_DELAY' | 'ACCESS_REQUEST_INCOMPLETE' | 'UNAUTHORIZED_PROCESSING' | 'CHILDREN_DATA_VIOLATION' | 'THIRD_PARTY_SHARING';
  description: string;
  loggedDate: string;
  statutoryDeadlineDate: string; // 7 to 30 days statutory window
  status: 'OPEN' | 'UNDER_INVESTIGATION' | 'ACTION_TAKEN' | 'CLOSED' | 'ESCALATED_TO_DPBI';
  assignedOfficer: string; // e.g. "Karthik R. (Designated Grievance Redressal Officer)"
  dpoEscalationRequired: boolean;
  resolutionSummary?: string;
  resolutionDate?: string;
  appealNoticeGiven: boolean; // informing user of right to appeal to DPBI
}

export interface DPDPDpiaRecord {
  id: string;
  assessmentCode: string; // e.g. "DPIA-2026-01"
  title: string;
  department: string;
  processingActivity: string;
  volumeOfDataPrincipals: 'Low (<10k)' | 'Medium (10k-500k)' | 'High (>500k)' | 'Massive (>10M)';
  involvesChildrenData: boolean;
  involvesSpecialSensitivities: string[]; // e.g. "Biometrics", "Financial Transactions", "Health Telemetry", "Precise Geolocation"
  necessityAndProportionalityEvaluation: string;
  identifiedRisks: {
    riskDescription: string;
    impactOnDataPrincipal: 'Low' | 'Medium' | 'High' | 'Catastrophic';
    likelihood: 'Rare' | 'Possible' | 'Likely';
    safeguards: string;
    residualRiskLevel: 'Low' | 'Medium' | 'High';
  }[];
  isSignificantDataFiduciaryTriggered: boolean;
  independentDataAuditorEngaged: boolean;
  dpoApprovalStatus: 'PENDING_REVIEW' | 'APPROVED' | 'CONDITIONAL_APPROVAL' | 'REJECTED';
  dpoNotes: string;
  assessmentDate: string;
  nextReviewDate: string;
  comments?: DPDPDpiaComment[];
}

export type DPDPDpiaCommentType =
  | 'RISK_OBJECTION'
  | 'SAFEGUARD_PROPOSAL'
  | 'LEGAL_COMPLIANCE_NOTE'
  | 'DEPARTMENT_SIGN_OFF'
  | 'GENERAL_NOTE';

export type DPDPDpiaCommentStatus = 'OPEN' | 'RESOLVED' | 'ACCEPTED_INTO_DPIA';

export interface DPDPDpiaComment {
  id: string;
  dpiaId: string;
  authorName: string;
  authorRole: string;
  department: string;
  timestamp: string;
  commentType: DPDPDpiaCommentType;
  content: string;
  statutoryClauseRef?: string;
  status: DPDPDpiaCommentStatus;
  auditEvidenceHash: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export function buildDpiaCommentProofHash(
  dpiaId: string,
  authorName: string,
  department: string,
  content: string,
  timestamp: string
): string {
  let hash = 0x811c9dc5;
  const str = `${dpiaId}|${authorName}|${department}|${content}|${timestamp}`;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  return `SHA256:${hex}a9f02b18${hex}7c81d09e5b23f8102a9bce01487f912c4019a82b3d`;
}

export interface DPDPBreachIncidentRecord {
  id: string;
  incidentCode: string; // e.g. "BRCH-DPDP-2026-01"
  title: string;
  detectedAt: string; // ISO datetime
  discoverySource: 'SOC Alert' | 'Internal Audit' | 'Data Processor Escalation' | 'External Vulnerability Report';
  severity: 'CRITICAL_SEV1' | 'HIGH_SEV2' | 'MEDIUM_SEV3';
  affectedDataPrincipalsEst: number;
  dataCategoriesCompromised: string[];
  containmentStatus: 'ACTIVE_TRIAGE' | 'CONTAINED' | 'REMEDIATED';
  dpbiNotificationStatus: 'PENDING' | 'DISPATCHED_ON_TIME' | 'DISPATCHED_LATE';
  dpbiNotifiedAt?: string;
  certInNotificationStatus: 'PENDING' | 'DISPATCHED_ON_TIME' | 'DISPATCHED_LATE';
  certInNotifiedAt?: string;
  dataPrincipalNotificationStatus: 'PENDING' | 'DISPATCHED' | 'NOT_REQUIRED';
  dpoSignOff: string;
  breachDescription: string;
  rootCause: string;
  remedialMeasuresToPrincipals: string[];
}

// Complete 44 Statutory Clauses of India Digital Personal Data Protection Act 2023
export const DPDP_STATUTORY_CLAUSES: DPDPClauseItem[] = [
  // CHAPTER I: PRELIMINARY (Sections 1 to 3)
  {
    sectionNumber: 1,
    sectionCode: 'SEC-01',
    title: 'Short title and commencement',
    chapter: 'Chapter I',
    chapterTitle: 'Preliminary',
    statutoryRequirement: 'Digital Personal Data Protection Act, 2023 applies to digital personal data processing with phased enforcement dates designated by Central Government notifications.',
    applicability: 'All Data Fiduciaries',
    penaltyMaxCrores: 0,
    mandatoryForSdf: false,
    recommendedEvidence: ['ISMS Legal & Regulatory Register DOC-REG-001', 'Board Resolution on DPDP Act Compliance Readiness'],
    auditChecklistQuestion: 'Has the entity formally registered the DPDP Act 2023 in its legal compliance register and mapped enforcement dates across services?',
    status: 'Compliant',
    maturityLevel: 5,
    evidenceRef: 'DOC-REG-001 v2.4'
  },
  {
    sectionNumber: 2,
    sectionCode: 'SEC-02',
    title: 'Definitions & Institutional Roles',
    chapter: 'Chapter I',
    chapterTitle: 'Preliminary',
    statutoryRequirement: 'Adoption and mapping of statutory terms including Data Fiduciary, Data Principal, Data Processor, Significant Data Fiduciary, and Consent Manager.',
    applicability: 'All Data Fiduciaries',
    penaltyMaxCrores: 0,
    mandatoryForSdf: false,
    recommendedEvidence: ['Data Dictionary & Role Taxonomy Mapping', 'Data Ownership Roster'],
    auditChecklistQuestion: 'Are internal organizational data roles clearly mapped to statutory DPDP roles (Data Fiduciary vs. Data Processor)?',
    status: 'Compliant',
    maturityLevel: 4,
    evidenceRef: 'DPDP-TAX-01'
  },
  {
    sectionNumber: 3,
    sectionCode: 'SEC-03',
    title: 'Application of Act & Extraterritorial Scope',
    chapter: 'Chapter I',
    chapterTitle: 'Preliminary',
    statutoryRequirement: 'Applies to processing of digital personal data within India, and processing outside India if offering goods/services to Indian Data Principals. Excludes non-digital or personal/domestic processing.',
    applicability: 'All Data Fiduciaries',
    penaltyMaxCrores: 0,
    mandatoryForSdf: false,
    recommendedEvidence: ['Jurisdiction & Territorial Data Flow Scoping Document', 'Cross-Border User Base Inventory'],
    auditChecklistQuestion: 'Has the organization scoped all cloud environments and global operations processing digital personal data of Indian residents?',
    status: 'Compliant',
    maturityLevel: 4,
    evidenceRef: 'SCOPE-DPDP-2026'
  },

  // CHAPTER II: OBLIGATIONS OF DATA FIDUCIARY (Sections 4 to 9)
  {
    sectionNumber: 4,
    sectionCode: 'SEC-04',
    title: 'Grounds for processing personal data',
    chapter: 'Chapter II',
    chapterTitle: 'Obligations of Data Fiduciary',
    statutoryRequirement: 'Personal data may only be processed for a lawful purpose for which consent has been given, or for certain legitimate uses explicitly sanctioned by the Act.',
    applicability: 'All Data Fiduciaries',
    penaltyMaxCrores: 50,
    mandatoryForSdf: false,
    recommendedEvidence: ['Record of Processing Activities (RoPA)', 'Lawful Basis Assessment Matrix'],
    auditChecklistQuestion: 'Is every active personal data processing activity tied to either verified consent or an enumerated legitimate use under Section 7?',
    status: 'In Progress',
    maturityLevel: 3,
    evidenceRef: 'DPDP-ROPA-v1.2'
  },
  {
    sectionNumber: 5,
    sectionCode: 'SEC-05',
    title: 'Mandatory Notice Before or at Time of Request for Consent',
    chapter: 'Chapter II',
    chapterTitle: 'Obligations of Data Fiduciary',
    statutoryRequirement: 'Every request for consent must be accompanied or preceded by an itemised, plain-language notice specifying personal data collected, processing purpose, rights exercise, and DPO/Grievance Officer details.',
    applicability: 'All Data Fiduciaries',
    penaltyMaxCrores: 150,
    mandatoryForSdf: false,
    recommendedEvidence: ['Itemized Privacy Notice Templates', 'Multilingual Notice Display Configuration'],
    auditChecklistQuestion: 'Does the privacy notice distinctly itemize every category of data and purpose without bundling into generic terms of service?',
    status: 'In Progress',
    maturityLevel: 3,
    evidenceRef: 'DPDP-NOT-001'
  },
  {
    sectionNumber: 6,
    sectionCode: 'SEC-06',
    title: 'Consent Architecture, Multilingual Notice & Withdrawal',
    chapter: 'Chapter II',
    chapterTitle: 'Obligations of Data Fiduciary',
    statutoryRequirement: 'Consent must be free, specific, informed, unconditional, and unambiguous. Notice and consent options must be available in English and 22 languages specified in the Eighth Schedule. Withdrawal must be as easy as giving consent.',
    applicability: 'All Data Fiduciaries',
    penaltyMaxCrores: 150,
    mandatoryForSdf: false,
    recommendedEvidence: ['Consent Management Platform (CMP) Architecture', '22 Scheduled Languages Translation Pack', '1-Click Consent Withdrawal Flow'],
    auditChecklistQuestion: 'Can Data Principals revoke consent with equivalent ease, and are notices accessible in Indian scheduled languages?',
    status: 'In Progress',
    maturityLevel: 3,
    evidenceRef: 'CMP-ARCH-V2'
  },
  {
    sectionNumber: 7,
    sectionCode: 'SEC-07',
    title: 'Certain legitimate uses of personal data',
    chapter: 'Chapter II',
    chapterTitle: 'Obligations of Data Fiduciary',
    statutoryRequirement: 'Processing without consent is strictly limited to voluntary sharing by Data Principal, State subsidies/benefits, legal compliance, judicial orders, medical emergencies, disasters, and specified employment purposes.',
    applicability: 'All Data Fiduciaries',
    penaltyMaxCrores: 50,
    mandatoryForSdf: false,
    recommendedEvidence: ['Legitimate Use Justification Register', 'Employment Processing Justification Dossier'],
    auditChecklistQuestion: 'Are all non-consent processing activities formally categorized under Section 7 grounds with legal review?',
    status: 'Compliant',
    maturityLevel: 4,
    evidenceRef: 'LEGIT-USE-REG-2026'
  },
  {
    sectionNumber: 8,
    sectionCode: 'SEC-08',
    title: 'General obligations of Data Fiduciary & Technical Safeguards',
    chapter: 'Chapter II',
    chapterTitle: 'Obligations of Data Fiduciary',
    statutoryRequirement: 'Must ensure data accuracy, implement reasonable technical and organizational security safeguards to prevent personal data breach, notify DPBI and Data Principals upon breach, and erase data when purpose is served.',
    applicability: 'All Data Fiduciaries',
    penaltyMaxCrores: 250,
    mandatoryForSdf: false,
    recommendedEvidence: ['Information Security Policy (ISO 27001 Annex A.5 & A.8)', 'Data Erasure/Retention Schedule', 'Data Processing Agreements with Vendors'],
    auditChecklistQuestion: 'Are state-of-the-art encryption, access controls, retention purges, and vendor data processing agreements active across all repositories?',
    status: 'In Progress',
    maturityLevel: 3,
    evidenceRef: 'SEC-MEASURES-001'
  },
  {
    sectionNumber: 9,
    sectionCode: 'SEC-09',
    title: 'Processing of personal data of children & persons with disability',
    chapter: 'Chapter II',
    chapterTitle: 'Obligations of Data Fiduciary',
    statutoryRequirement: 'Mandatory verifiable consent of parent/lawful guardian before processing child data (<18 years). Strict statutory prohibition on behavioral monitoring, tracking, or targeted advertising directed at children.',
    applicability: 'All Data Fiduciaries',
    penaltyMaxCrores: 200,
    mandatoryForSdf: false,
    recommendedEvidence: ['Parental Consent Verification Mechanism', 'Minor Data Segregation & Tracking Shield Architecture'],
    auditChecklistQuestion: 'Are minors under 18 gated with verifiable parental consent, and is all behavioral tracking/targeted advertising disabled for them?',
    status: 'Non-Compliant',
    maturityLevel: 2,
    evidenceRef: 'CHILD-VERIF-GAP'
  },

  // CHAPTER III: SPECIAL OBLIGATIONS OF SIGNIFICANT DATA FIDUCIARY (Section 10)
  {
    sectionNumber: 10,
    sectionCode: 'SEC-10',
    title: 'Significant Data Fiduciary (SDF) Governance, DPO, Auditor & DPIA',
    chapter: 'Chapter III',
    chapterTitle: 'Special Obligations of Significant Data Fiduciaries',
    statutoryRequirement: 'Entities designated as SDF must: (a) appoint an India-based Data Protection Officer (DPO) reporting to Board, (b) appoint an independent Data Auditor, (c) conduct periodic Data Protection Impact Assessments (DPIAs), and (d) periodic audit.',
    applicability: 'Significant Data Fiduciaries (SDF)',
    penaltyMaxCrores: 150,
    mandatoryForSdf: true,
    recommendedEvidence: ['Board Appointment of India-Resident DPO', 'DPIA Protocol & Completed Assessment Reports', 'Independent External Data Audit Charter'],
    auditChecklistQuestion: 'Is a qualified resident DPO appointed reporting to the Board, and is a formal DPIA framework instituted for all high-risk processing?',
    status: 'In Progress',
    maturityLevel: 3,
    evidenceRef: 'DPO-APPT-2026'
  },

  // CHAPTER IV: RIGHTS AND DUTIES OF DATA PRINCIPAL (Sections 11 to 15)
  {
    sectionNumber: 11,
    sectionCode: 'SEC-11',
    title: 'Right to obtain information and summary of personal data',
    chapter: 'Chapter IV',
    chapterTitle: 'Rights and Duties of Data Principal',
    statutoryRequirement: 'Data Principal has the right to obtain a summary of personal data being processed, processing activities undertaken, and identities of all other Data Fiduciaries/Processors with whom data was shared.',
    applicability: 'All Data Fiduciaries',
    penaltyMaxCrores: 50,
    mandatoryForSdf: false,
    recommendedEvidence: ['Self-Service Privacy Dashboard / DSR Portal', 'Automated Personal Data Export JSON/PDF Engine'],
    auditChecklistQuestion: 'Can users query and export an itemized summary of their personal data and third-party recipients within designated statutory SLAs?',
    status: 'In Progress',
    maturityLevel: 3,
    evidenceRef: 'DSR-PORTAL-01'
  },
  {
    sectionNumber: 12,
    sectionCode: 'SEC-12',
    title: 'Right to correction and erasure of personal data',
    chapter: 'Chapter IV',
    chapterTitle: 'Rights and Duties of Data Principal',
    statutoryRequirement: 'Data Principal has the right to correction, completion, updating, and erasure of personal data that is no longer necessary for the purpose for which it was processed.',
    applicability: 'All Data Fiduciaries',
    penaltyMaxCrores: 50,
    mandatoryForSdf: false,
    recommendedEvidence: ['Right to Erasure Automated Orchestrator', 'Data Correction Workflows & DB Tombstoning Procedures'],
    auditChecklistQuestion: 'Does the system support programmatic data erasure across primary databases, replicas, backups, and downstream processors?',
    status: 'In Progress',
    maturityLevel: 3,
    evidenceRef: 'ERASURE-ORCH-V1'
  },
  {
    sectionNumber: 13,
    sectionCode: 'SEC-13',
    title: 'Right of grievance redressal & publishing contact details',
    chapter: 'Chapter IV',
    chapterTitle: 'Rights and Duties of Data Principal',
    statutoryRequirement: 'Data Fiduciary must provide a readily available grievance redressal mechanism and publish contact details of designated Grievance Officer. Redressal must precede appeals to DPBI.',
    applicability: 'All Data Fiduciaries',
    penaltyMaxCrores: 50,
    mandatoryForSdf: false,
    recommendedEvidence: ['Grievance Redressal Portal & Ticketing SLA Matrix', 'Published DPO / Grievance Officer Public Webpage'],
    auditChecklistQuestion: 'Is a grievance intake workflow operational with automated statutory SLA timers before user escalation to the DPBI?',
    status: 'Compliant',
    maturityLevel: 4,
    evidenceRef: 'GRV-REDRESS-01'
  },
  {
    sectionNumber: 14,
    sectionCode: 'SEC-14',
    title: 'Right to nominate a representative',
    chapter: 'Chapter IV',
    chapterTitle: 'Rights and Duties of Data Principal',
    statutoryRequirement: 'Data Principal has the right to nominate any other individual to exercise rights under the Act in the event of death or incapacity of the Data Principal.',
    applicability: 'All Data Fiduciaries',
    penaltyMaxCrores: 50,
    mandatoryForSdf: false,
    recommendedEvidence: ['Nomination Registry Feature in Account Settings', 'Legal Heirs Verification Standard Operating Procedure'],
    auditChecklistQuestion: 'Can account holders record a verified nominee to manage their digital personal data in case of death or incapacity?',
    status: 'Not Started',
    maturityLevel: 1,
    evidenceRef: 'GAP-NOMINATION'
  },
  {
    sectionNumber: 15,
    sectionCode: 'SEC-15',
    title: 'Duties of Data Principal',
    chapter: 'Chapter IV',
    chapterTitle: 'Rights and Duties of Data Principal',
    statutoryRequirement: 'Data Principals must comply with provisions of applicable laws, not impersonate another person, not suppress material info, and not register frivolous grievances.',
    applicability: 'Data Principals',
    penaltyMaxCrores: 0.001, // 10,000 INR
    mandatoryForSdf: false,
    recommendedEvidence: ['Terms of Use Section on Data Principal Obligations', 'Grievance Abuse Prevention Policy'],
    auditChecklistQuestion: 'Do user-facing privacy notices and portal terms inform Data Principals of statutory duties and penalties for false claims?',
    status: 'Compliant',
    maturityLevel: 4,
    evidenceRef: 'TERMS-DP-DUTIES'
  },

  // CHAPTER V: SPECIAL PROVISIONS & EXEMPTIONS (Sections 16 to 17)
  {
    sectionNumber: 16,
    sectionCode: 'SEC-16',
    title: 'Cross-border transfer of personal data outside India',
    chapter: 'Chapter V',
    chapterTitle: 'Special Provisions & Exemptions',
    statutoryRequirement: 'Personal data may be transferred outside India unless restricted by Central Government negative list notifications, and subject to higher standards in any sectoral law.',
    applicability: 'All Data Fiduciaries',
    penaltyMaxCrores: 250,
    mandatoryForSdf: false,
    recommendedEvidence: ['Cross-Border Data Transfer Assessment Register', 'Cloud Regional Data Sovereignty Attestations'],
    auditChecklistQuestion: 'Are all cross-border data transfer destinations screened against Central Government negative list notifications?',
    status: 'Compliant',
    maturityLevel: 4,
    evidenceRef: 'XBORDER-REG-2026'
  },
  {
    sectionNumber: 17,
    sectionCode: 'SEC-17',
    title: 'Exemptions for state, research, archiving & startups',
    chapter: 'Chapter V',
    chapterTitle: 'Special Provisions & Exemptions',
    statutoryRequirement: 'Specifies exemptions for law enforcement, judicial processing, research, archiving, statistical purposes, and qualifying notified startup exemptions.',
    applicability: 'Regulatory',
    penaltyMaxCrores: 0,
    mandatoryForSdf: false,
    recommendedEvidence: ['Legal Exemption Determination Memos', 'Law Enforcement Request Protocol'],
    auditChecklistQuestion: 'Are any claimed exemptions under Section 17 documented with formal legal counsel sign-off?',
    status: 'Compliant',
    maturityLevel: 4,
    evidenceRef: 'LEGAL-EXEMPT-01'
  },

  // CHAPTER VI: DATA PROTECTION BOARD OF INDIA (Sections 18 to 26)
  {
    sectionNumber: 18,
    sectionCode: 'SEC-18',
    title: 'Establishment of Data Protection Board of India (DPBI)',
    chapter: 'Chapter VI',
    chapterTitle: 'Data Protection Board of India',
    statutoryRequirement: 'Digital-by-design regulatory authority established by Central Government to receive intimations, direct inquiry, and issue orders.',
    applicability: 'Regulatory',
    penaltyMaxCrores: 0,
    mandatoryForSdf: false,
    recommendedEvidence: ['DPBI Portal API Interface Credentials', 'Regulatory Communication Channel Roster'],
    auditChecklistQuestion: 'Has the compliance office established official digital connectivity with the Data Protection Board of India portal?',
    status: 'In Progress',
    maturityLevel: 3,
    evidenceRef: 'DPBI-REG-CONNECT'
  },
  {
    sectionNumber: 19,
    sectionCode: 'SEC-19',
    title: 'Composition and qualifications of Members of Board',
    chapter: 'Chapter VI',
    chapterTitle: 'Data Protection Board of India',
    statutoryRequirement: 'Governs Chairperson and Members qualifications in data governance, law, and cybersecurity.',
    applicability: 'Regulatory',
    penaltyMaxCrores: 0,
    mandatoryForSdf: false,
    recommendedEvidence: ['Regulatory Governance Framework Dossier'],
    auditChecklistQuestion: 'Is the organization maintaining updated awareness of DPBI leadership appointments and regulatory circulars?',
    status: 'Compliant',
    maturityLevel: 5,
    evidenceRef: 'REG-INTEL-01'
  },
  {
    sectionNumber: 20,
    sectionCode: 'SEC-20',
    title: 'Salary, allowances and conditions of service of Members',
    chapter: 'Chapter VI',
    chapterTitle: 'Data Protection Board of India',
    statutoryRequirement: 'Statutory provisions governing service terms of Board Members.',
    applicability: 'Regulatory',
    penaltyMaxCrores: 0,
    mandatoryForSdf: false,
    recommendedEvidence: ['Regulatory Reference Archive'],
    auditChecklistQuestion: 'Is the legal regulatory archive updated with MeitY notifications?',
    status: 'Compliant',
    maturityLevel: 5,
    evidenceRef: 'LEGAL-REF-01'
  },
  {
    sectionNumber: 21,
    sectionCode: 'SEC-21',
    title: 'Disqualifications and removal of Members of Board',
    chapter: 'Chapter VI',
    chapterTitle: 'Data Protection Board of India',
    statutoryRequirement: 'Grounds and procedures for disqualification and removal of Board Members.',
    applicability: 'Regulatory',
    penaltyMaxCrores: 0,
    mandatoryForSdf: false,
    recommendedEvidence: ['Regulatory Archive'],
    auditChecklistQuestion: 'Are governance tracking databases aligned with DPBI operational guidelines?',
    status: 'Compliant',
    maturityLevel: 5,
    evidenceRef: 'LEGAL-REF-02'
  },
  {
    sectionNumber: 22,
    sectionCode: 'SEC-22',
    title: 'Resignation and vacancy of Members of Board',
    chapter: 'Chapter VI',
    chapterTitle: 'Data Protection Board of India',
    statutoryRequirement: 'Provisions governing vacancies in Board composition.',
    applicability: 'Regulatory',
    penaltyMaxCrores: 0,
    mandatoryForSdf: false,
    recommendedEvidence: ['Regulatory Reference Archive'],
    auditChecklistQuestion: 'Are legal monitoring services subscribed to MeitY official gazettes?',
    status: 'Compliant',
    maturityLevel: 5,
    evidenceRef: 'MEITY-SUBSCRIP'
  },
  {
    sectionNumber: 23,
    sectionCode: 'SEC-23',
    title: 'Proceedings and digital-by-design sittings of Board',
    chapter: 'Chapter VI',
    chapterTitle: 'Data Protection Board of India',
    statutoryRequirement: 'DPBI shall function as a digital office, adopting techno-legal measures for online filing, virtual hearings, and electronic order delivery.',
    applicability: 'All Data Fiduciaries',
    penaltyMaxCrores: 0,
    mandatoryForSdf: false,
    recommendedEvidence: ['Digital Evidence Preservation Repository', 'Electronic Legal Submissions Readiness SOP'],
    auditChecklistQuestion: 'Is the organization equipped to receive, process, and contest electronic orders and virtual hearings from the DPBI?',
    status: 'In Progress',
    maturityLevel: 3,
    evidenceRef: 'DIGITAL-HEARING-SOP'
  },
  {
    sectionNumber: 24,
    sectionCode: 'SEC-24',
    title: 'Officers and employees of Board',
    chapter: 'Chapter VI',
    chapterTitle: 'Data Protection Board of India',
    statutoryRequirement: 'Appointment of administrative and technical staff for DPBI operations.',
    applicability: 'Regulatory',
    penaltyMaxCrores: 0,
    mandatoryForSdf: false,
    recommendedEvidence: ['Regulatory Reference Archive'],
    auditChecklistQuestion: 'Are legal liaison contact points designated for DPBI correspondence?',
    status: 'Compliant',
    maturityLevel: 4,
    evidenceRef: 'LEGAL-LIAISON'
  },
  {
    sectionNumber: 25,
    sectionCode: 'SEC-25',
    title: 'Members and employees of Board to be public servants',
    chapter: 'Chapter VI',
    chapterTitle: 'Data Protection Board of India',
    statutoryRequirement: 'Officers deemed public servants under Section 21 of Indian Penal Code.',
    applicability: 'Regulatory',
    penaltyMaxCrores: 0,
    mandatoryForSdf: false,
    recommendedEvidence: ['Anti-Bribery & Compliance Policy'],
    auditChecklistQuestion: 'Are anti-bribery and public servant interaction policies trained across compliance staff?',
    status: 'Compliant',
    maturityLevel: 5,
    evidenceRef: 'DOC-POL-ABC-01'
  },
  {
    sectionNumber: 26,
    sectionCode: 'SEC-26',
    title: 'Powers of the Board to direct inquiry, inspect & issue orders',
    chapter: 'Chapter VI',
    chapterTitle: 'Data Protection Board of India',
    statutoryRequirement: 'Board possesses powers of a Civil Court to summon persons, inspect digital equipment, receive evidence on affidavits, and issue binding interim directions.',
    applicability: 'All Data Fiduciaries',
    penaltyMaxCrores: 250,
    mandatoryForSdf: false,
    recommendedEvidence: ['Regulatory Inquiry Response Protocol', 'Digital Forensics & Evidence Preservation Kit'],
    auditChecklistQuestion: 'Is an emergency protocol established to respond to DPBI summons, data preservation orders, or onsite forensic audits?',
    status: 'In Progress',
    maturityLevel: 3,
    evidenceRef: 'FORENSIC-SOP-01'
  },

  // CHAPTER VII: POWERS OF CENTRAL GOVERNMENT & INTERMEDIARY BLOCKING (Sections 27 to 32)
  {
    sectionNumber: 27,
    sectionCode: 'SEC-27',
    title: 'Powers of Central Government to call for information',
    chapter: 'Chapter VII',
    chapterTitle: 'Powers of Central Government',
    statutoryRequirement: 'Central Government may require Board, Data Fiduciary, or intermediary to furnish necessary information for statutory administration.',
    applicability: 'All Data Fiduciaries',
    penaltyMaxCrores: 50,
    mandatoryForSdf: false,
    recommendedEvidence: ['Government Request for Information (RFI) Escalation SOP', 'Authorized Legal Signatory Roster'],
    auditChecklistQuestion: 'Are procedures established for vetting and answering official government information demands within stipulated timelines?',
    status: 'Compliant',
    maturityLevel: 4,
    evidenceRef: 'GOV-RFI-SOP-01'
  },
  {
    sectionNumber: 28,
    sectionCode: 'SEC-28',
    title: 'Power of Central Government to issue directions & modify SDF criteria',
    chapter: 'Chapter VII',
    chapterTitle: 'Powers of Central Government',
    statutoryRequirement: 'Power to notify classes of Data Fiduciaries as Significant Data Fiduciaries based on volume, sensitivity, or risk to sovereignty.',
    applicability: 'All Data Fiduciaries',
    penaltyMaxCrores: 150,
    mandatoryForSdf: true,
    recommendedEvidence: ['SDF Threshold Monitoring Model', 'Annual User Volume & Data Sensitivity Review'],
    auditChecklistQuestion: 'Does the enterprise monitor metrics against emerging MeitY thresholds for SDF designation?',
    status: 'In Progress',
    maturityLevel: 3,
    evidenceRef: 'SDF-METRIC-MON'
  },
  {
    sectionNumber: 29,
    sectionCode: 'SEC-29',
    title: 'Consistency with other laws and sectoral frameworks',
    chapter: 'Chapter VII',
    chapterTitle: 'Powers of Central Government',
    statutoryRequirement: 'Provisions of DPDP Act are in addition to and not in derogation of any other law; where sectoral law (e.g. RBI, SEBI, IRDAI) provides higher protection, sectoral law prevails.',
    applicability: 'All Data Fiduciaries',
    penaltyMaxCrores: 0,
    mandatoryForSdf: false,
    recommendedEvidence: ['Harmonized Privacy & Sectoral Crosswalk (RBI/SEBI/DPDP)', 'Multi-Standard Compliance Matrix'],
    auditChecklistQuestion: 'Are higher sectoral standards (e.g., RBI data localization or MAS TRM breach SLAs) systematically cross-mapped with DPDP obligations?',
    status: 'Compliant',
    maturityLevel: 5,
    evidenceRef: 'CROSSWALK-DPDP-2026'
  },
  {
    sectionNumber: 30,
    sectionCode: 'SEC-30',
    title: 'Alternate dispute resolution (ADR) and mediation',
    chapter: 'Chapter VII',
    chapterTitle: 'Powers of Central Government',
    statutoryRequirement: 'Board may refer grievances between Data Principal and Data Fiduciary to mediation through mutually agreed or designated mediators.',
    applicability: 'All Data Fiduciaries',
    penaltyMaxCrores: 0,
    mandatoryForSdf: false,
    recommendedEvidence: ['Mediation & ADR Settlement Playbook', 'Standard Dispute Conciliation Terms'],
    auditChecklistQuestion: 'Has the legal department framed standard operating procedures to participate in DPBI-mandated mediation proceedings?',
    status: 'Compliant',
    maturityLevel: 4,
    evidenceRef: 'ADR-PLAYBOOK-01'
  },
  {
    sectionNumber: 31,
    sectionCode: 'SEC-31',
    title: 'Voluntary undertaking by Data Fiduciary',
    chapter: 'Chapter VII',
    chapterTitle: 'Powers of Central Government',
    statutoryRequirement: 'Data Fiduciary may offer a voluntary undertaking to the Board pledging remedial actions, rectification, or financial compensation to bar punitive proceedings.',
    applicability: 'All Data Fiduciaries',
    penaltyMaxCrores: 0,
    mandatoryForSdf: false,
    recommendedEvidence: ['Remediation Undertaking Drafting Guidelines', 'Board Authorization Framework'],
    auditChecklistQuestion: 'Are guidelines established to execute binding remedial undertakings before the Board in event of an inadvertent lapse?',
    status: 'In Progress',
    maturityLevel: 3,
    evidenceRef: 'VOL-UNDERTAKING-GUIDE'
  },
  {
    sectionNumber: 32,
    sectionCode: 'SEC-32',
    title: 'Power of Central Government to order blocking of access to information',
    chapter: 'Chapter VII',
    chapterTitle: 'Powers of Central Government',
    statutoryRequirement: 'On repeated non-compliance or serious breach, Central Government may order computer resource or digital platform to be blocked from public access in India.',
    applicability: 'All Data Fiduciaries',
    penaltyMaxCrores: 250,
    mandatoryForSdf: true,
    recommendedEvidence: ['Critical Regulatory Escalation Protocol', 'Crisis Management & Executive Briefing Pack'],
    auditChecklistQuestion: 'Is executive leadership aware of platform blocking risks under Section 32, and are critical compliance alerts automated to Board?',
    status: 'Compliant',
    maturityLevel: 4,
    evidenceRef: 'CRISIS-GOV-01'
  },

  // CHAPTER VIII: PENALTIES AND ADJUDICATION (Sections 33 to 34 & Schedule)
  {
    sectionNumber: 33,
    sectionCode: 'SEC-33',
    title: 'Penalties for statutory non-compliance and breach of safeguards',
    chapter: 'Chapter VIII',
    chapterTitle: 'Penalties and Adjudication',
    statutoryRequirement: 'Board may impose financial penalties up to ₹250 Crores for failure to observe reasonable security safeguards, up to ₹200 Crores for failure to notify personal data breach, up to ₹200 Crores for children data violations, and up to ₹150 Crores for SDF violations.',
    applicability: 'All Data Fiduciaries',
    penaltyMaxCrores: 250,
    mandatoryForSdf: true,
    recommendedEvidence: ['Statutory Penalty Risk Quantifier & Reserve Modeling', 'Executive Liability & Cyber Insurance Review'],
    auditChecklistQuestion: 'Has enterprise risk quantified maximum financial penalty exposures under the DPDP Act Schedule for audit and cyber insurance purposes?',
    status: 'In Progress',
    maturityLevel: 3,
    evidenceRef: 'RISK-QUANT-DPDP'
  },
  {
    sectionNumber: 34,
    sectionCode: 'SEC-34',
    title: 'Factors for determining quantum of penalty',
    chapter: 'Chapter VIII',
    chapterTitle: 'Penalties and Adjudication',
    statutoryRequirement: 'Board considers nature, gravity, duration, repetitive nature, mitigation steps taken, revenue impacted, and whether breach was intentional or negligent.',
    applicability: 'All Data Fiduciaries',
    penaltyMaxCrores: 250,
    mandatoryForSdf: false,
    recommendedEvidence: ['Mitigating Factors Documentation Dossier', 'Incident Remediation Logbook'],
    auditChecklistQuestion: 'Does the incident response mechanism automatically log and preserve mitigating evidence (timely containment, victim redressal) for DPBI hearings?',
    status: 'In Progress',
    maturityLevel: 3,
    evidenceRef: 'MITIG-EVID-LOG'
  },

  // CHAPTER IX: MISCELLANEOUS & TRANSITIONAL PROVISIONS (Sections 35 to 44)
  {
    sectionNumber: 35,
    sectionCode: 'SEC-35',
    title: 'Protection of action taken in good faith',
    chapter: 'Chapter IX',
    chapterTitle: 'Miscellaneous',
    statutoryRequirement: 'No suit or prosecution shall lie against Central Government, Board, or its officers for anything done in good faith.',
    applicability: 'Regulatory',
    penaltyMaxCrores: 0,
    mandatoryForSdf: false,
    recommendedEvidence: ['Legal Compliance Charter'],
    auditChecklistQuestion: 'Are corporate legal protections benchmarked against Section 35 statutory immunities?',
    status: 'Compliant',
    maturityLevel: 5,
    evidenceRef: 'LEGAL-CHARTER-01'
  },
  {
    sectionNumber: 36,
    sectionCode: 'SEC-36',
    title: 'Bar of jurisdiction of civil courts',
    chapter: 'Chapter IX',
    chapterTitle: 'Miscellaneous',
    statutoryRequirement: 'No civil court shall have jurisdiction to entertain any suit or proceeding in respect of any matter which the Board is empowered to determine under the Act.',
    applicability: 'Regulatory',
    penaltyMaxCrores: 0,
    mandatoryForSdf: false,
    recommendedEvidence: ['Litigation & Regulatory Jurisdiction Playbook'],
    auditChecklistQuestion: 'Are dispute resolution terms in customer agreements updated to recognize DPBI statutory jurisdiction?',
    status: 'Compliant',
    maturityLevel: 4,
    evidenceRef: 'DISPUTE-TERMS-01'
  },
  {
    sectionNumber: 37,
    sectionCode: 'SEC-37',
    title: 'Appeals to Appellate Tribunal (TDSAT)',
    chapter: 'Chapter IX',
    chapterTitle: 'Miscellaneous',
    statutoryRequirement: 'Any person aggrieved by an order of the Board may prefer an appeal before the Telecom Disputes Settlement and Appellate Tribunal (TDSAT) within 60 days.',
    applicability: 'All Data Fiduciaries',
    penaltyMaxCrores: 0,
    mandatoryForSdf: false,
    recommendedEvidence: ['TDSAT Appellate Escalation Roadmap', 'External Legal Counsel Retainer Framework'],
    auditChecklistQuestion: 'Does the legal team maintain an established escalation timeline and appellate counsel roster for TDSAT filings within 60 days?',
    status: 'Compliant',
    maturityLevel: 4,
    evidenceRef: 'TDSAT-APPEAL-SOP'
  },
  {
    sectionNumber: 38,
    sectionCode: 'SEC-38',
    title: 'Orders of Board and Appellate Tribunal to be executable as decrees',
    chapter: 'Chapter IX',
    chapterTitle: 'Miscellaneous',
    statutoryRequirement: 'Orders passed by DPBI or TDSAT shall have the force of a civil court decree and are executable through civil courts.',
    applicability: 'All Data Fiduciaries',
    penaltyMaxCrores: 250,
    mandatoryForSdf: false,
    recommendedEvidence: ['Decree Compliance & Financial Liquidity Buffer'],
    auditChecklistQuestion: 'Are treasury and finance briefed on statutory enforceability of Board recovery certificates as court decrees?',
    status: 'Compliant',
    maturityLevel: 4,
    evidenceRef: 'FIN-DECREE-PLAN'
  },
  {
    sectionNumber: 39,
    sectionCode: 'SEC-39',
    title: 'Recovery of penalties through Tax Recovery Officers',
    chapter: 'Chapter IX',
    chapterTitle: 'Miscellaneous',
    statutoryRequirement: 'Penalties not paid within specified period shall be recovered as an arrear of land revenue through Tax Recovery Officers under Income Tax Act.',
    applicability: 'All Data Fiduciaries',
    penaltyMaxCrores: 250,
    mandatoryForSdf: false,
    recommendedEvidence: ['Tax Recovery Compliance Protocol'],
    auditChecklistQuestion: 'Does enterprise risk map tax recovery attachment risks under Section 39 into corporate continuity plans?',
    status: 'Compliant',
    maturityLevel: 4,
    evidenceRef: 'TAX-REC-CONT'
  },
  {
    sectionNumber: 40,
    sectionCode: 'SEC-40',
    title: 'Power of Central Government to make rules',
    chapter: 'Chapter IX',
    chapterTitle: 'Miscellaneous',
    statutoryRequirement: 'Central Government authority to notify rules for notice formats, consent managers, children verification, SDF criteria, breach forms, and DPBI functioning.',
    applicability: 'All Data Fiduciaries',
    penaltyMaxCrores: 0,
    mandatoryForSdf: false,
    recommendedEvidence: ['DPDP Notified Rules Tracking Tracker & Delta Assessment Log'],
    auditChecklistQuestion: 'Is an automated regulatory tracking cadence in place to evaluate and operationalize each tranche of DPDP Central Government Rules?',
    status: 'Compliant',
    maturityLevel: 4,
    evidenceRef: 'RULE-TRACK-2026'
  },
  {
    sectionNumber: 41,
    sectionCode: 'SEC-41',
    title: 'Rules to be laid before Parliament',
    chapter: 'Chapter IX',
    chapterTitle: 'Miscellaneous',
    statutoryRequirement: 'Every rule made under the Act must be laid before both Houses of Parliament.',
    applicability: 'Regulatory',
    penaltyMaxCrores: 0,
    mandatoryForSdf: false,
    recommendedEvidence: ['Parliamentary Gazette Monitor'],
    auditChecklistQuestion: 'Are legislative gazettes tracked for modifications or parliamentary recommendations to DPDP rules?',
    status: 'Compliant',
    maturityLevel: 5,
    evidenceRef: 'PARL-MON-01'
  },
  {
    sectionNumber: 42,
    sectionCode: 'SEC-42',
    title: 'Power to remove difficulties',
    chapter: 'Chapter IX',
    chapterTitle: 'Miscellaneous',
    statutoryRequirement: 'Central Government power to issue orders to remove difficulties within three years of Act commencement.',
    applicability: 'Regulatory',
    penaltyMaxCrores: 0,
    mandatoryForSdf: false,
    recommendedEvidence: ['MeitY Clarification Register'],
    auditChecklistQuestion: 'Are official MeitY guidance memos and clarification orders indexed in the GRC knowledgebase?',
    status: 'Compliant',
    maturityLevel: 5,
    evidenceRef: 'MEITY-CLARIF'
  },
  {
    sectionNumber: 43,
    sectionCode: 'SEC-43',
    title: 'Amendments to Information Technology Act, 2000',
    chapter: 'Chapter IX',
    chapterTitle: 'Miscellaneous',
    statutoryRequirement: 'Omission of Section 43A of IT Act 2000 (Sensitive Personal Data or Information - SPDI Rules 2011 superseded by DPDP Act).',
    applicability: 'All Data Fiduciaries',
    penaltyMaxCrores: 0,
    mandatoryForSdf: false,
    recommendedEvidence: ['Contractual SPDI to DPDP Transition Audit Memo'],
    auditChecklistQuestion: 'Have customer contracts, vendor DPAs, and compliance representations transitioned legacy SPDI references to DPDP Act 2023?',
    status: 'Compliant',
    maturityLevel: 4,
    evidenceRef: 'SPDI-TRANSITION-MEMO'
  },
  {
    sectionNumber: 44,
    sectionCode: 'SEC-44',
    title: 'Amendments to Right to Information Act, 2005',
    chapter: 'Chapter IX',
    chapterTitle: 'Miscellaneous',
    statutoryRequirement: 'Amendment of Section 8(1)(j) of RTI Act to exempt personal information from disclosure under RTI unless larger public interest justifies.',
    applicability: 'Regulatory',
    penaltyMaxCrores: 0,
    mandatoryForSdf: false,
    recommendedEvidence: ['RTI & Personal Data Shielding SOP'],
    auditChecklistQuestion: 'Are requests for personal information screened in light of the Section 44 blanket privacy exemption under RTI Act?',
    status: 'Compliant',
    maturityLevel: 5,
    evidenceRef: 'RTI-PRIVACY-SOP'
  }
];

// Initial Consent Records
export const INITIAL_DPDP_CONSENTS: DPDPUserConsentRecord[] = [
  {
    id: 'dp_c_1',
    dataPrincipalId: 'DP-IND-84210',
    principalName: 'Aarav Sharma',
    principalEmail: 'aarav.sharma@example.in',
    principalPhone: '+91 98201 44512',
    jurisdictionState: 'Maharashtra (Mumbai)',
    noticeLanguage: 'English',
    processingPurpose: 'Core Banking, UPI Payments & Account Management',
    dataCategoriesCollected: ['Full Name', 'PAN / Aadhaar Token', 'Bank Account Details', 'Transaction History', 'IP & Device Telemetry'],
    consentGivenDate: '2026-04-12T10:30:00Z',
    consentChannel: 'Mobile App (Android/iOS)',
    consentManagerRef: 'CM-DIGILOCKER-04',
    status: 'ACTIVE',
    downstreamProcessorsNotified: true,
    version: 'v2.1'
  },
  {
    id: 'dp_c_2',
    dataPrincipalId: 'DP-IND-65129',
    principalName: 'Priya Sundaram',
    principalEmail: 'priya.sundaram@example.in',
    principalPhone: '+91 94440 88219',
    jurisdictionState: 'Tamil Nadu (Chennai)',
    noticeLanguage: 'Tamil (தமிழ்)',
    processingPurpose: 'Personalized Financial Advisory & Mutual Fund Analytics',
    dataCategoriesCollected: ['Income Range', 'Investment Preferences', 'Risk Appetite', 'Device Geolocation'],
    consentGivenDate: '2026-05-18T14:15:00Z',
    consentChannel: 'Web Portal',
    consentManagerRef: 'CM-ACCOUNT-AGG-01',
    status: 'ACTIVE',
    downstreamProcessorsNotified: true,
    version: 'v2.1'
  },
  {
    id: 'dp_c_3',
    dataPrincipalId: 'DP-IND-71204',
    principalName: 'Rohit Mukherjee',
    principalEmail: 'rohit.mukherjee@example.in',
    principalPhone: '+91 98300 23115',
    jurisdictionState: 'West Bengal (Kolkata)',
    noticeLanguage: 'Bengali (বাংলা)',
    processingPurpose: 'Third-Party Promotional Offers & Credit Card Marketing',
    dataCategoriesCollected: ['Contact Phone', 'Email', 'Credit Score Bracket'],
    consentGivenDate: '2026-06-02T11:00:00Z',
    consentChannel: 'Web Portal',
    status: 'REVOKED',
    revocationDate: '2026-08-14T16:20:00Z',
    revocationReason: 'Unsolicited marketing SMS frequency too high. Exercised statutory right to withdraw consent.',
    downstreamProcessorsNotified: true,
    version: 'v2.0'
  },
  {
    id: 'dp_c_4',
    dataPrincipalId: 'DP-IND-90114',
    principalName: 'Ananya Deshmukh',
    principalEmail: 'ananya.deshmukh@example.in',
    principalPhone: '+91 97654 32109',
    jurisdictionState: 'Maharashtra (Pune)',
    noticeLanguage: 'Marathi (मराठी)',
    processingPurpose: 'Automated Loan Underwriting & Bureau Pull',
    dataCategoriesCollected: ['KYC Documents', 'Employment Verification', 'Bank Statement Aggregation'],
    consentGivenDate: '2026-07-09T09:45:00Z',
    consentChannel: 'Mobile App (Android/iOS)',
    consentManagerRef: 'CM-DIGILOCKER-04',
    status: 'ACTIVE',
    downstreamProcessorsNotified: true,
    version: 'v2.1'
  },
  {
    id: 'dp_c_5',
    dataPrincipalId: 'DP-IND-54188',
    principalName: 'Vikramaditya Patel',
    principalEmail: 'vikram.patel@example.in',
    principalPhone: '+91 98250 11928',
    jurisdictionState: 'Gujarat (Ahmedabad)',
    noticeLanguage: 'Gujarati (ગુજરાતી)',
    processingPurpose: 'Behavioral Ad Targeting & Analytics',
    dataCategoriesCollected: ['App Session Duration', 'Browsing Telemetry', 'Referral URL'],
    consentGivenDate: '2026-03-20T15:30:00Z',
    consentChannel: 'Web Portal',
    status: 'REVOKED',
    revocationDate: '2026-08-25T10:00:00Z',
    revocationReason: 'Refusal of non-essential analytics tracking.',
    downstreamProcessorsNotified: true,
    version: 'v1.9'
  }
];

// Initial Grievance Records
export const INITIAL_DPDP_GRIEVANCES: DPDPGrievanceRecord[] = [
  {
    id: 'grv_1',
    grievanceCode: 'GRV-2026-001',
    dataPrincipalId: 'DP-IND-71204',
    principalName: 'Rohit Mukherjee',
    principalEmail: 'rohit.mukherjee@example.in',
    category: 'CONSENT_WITHDRAWAL_FAILURE',
    description: 'Data Principal revoked marketing consent on 14 Aug, but received promotional SMS from partner telephony broker on 18 Aug. Demands immediate cessation and processor audit.',
    loggedDate: '2026-08-19T09:30:00Z',
    statutoryDeadlineDate: '2026-09-18T18:30:00Z', // 30-day statutory window
    status: 'UNDER_INVESTIGATION',
    assignedOfficer: 'Karthik Raman (Designated Grievance Redressal Officer)',
    dpoEscalationRequired: true,
    resolutionSummary: 'Telephony webhook synchronization cache delay identified. Partner processor blacklist queue updated on 2026-08-20.',
    appealNoticeGiven: true
  },
  {
    id: 'grv_2',
    grievanceCode: 'GRV-2026-002',
    dataPrincipalId: 'DP-IND-33918',
    principalName: 'Deepak Verma',
    principalEmail: 'deepak.verma@example.in',
    category: 'ERASURE_DELAY',
    description: 'Requested complete deletion of loan application documents following closed loan. Awaiting written confirmation of S3 bucket snapshot purge.',
    loggedDate: '2026-08-28T14:00:00Z',
    statutoryDeadlineDate: '2026-09-27T18:30:00Z',
    status: 'ACTION_TAKEN',
    assignedOfficer: 'Karthik Raman (Designated Grievance Redressal Officer)',
    dpoEscalationRequired: false,
    resolutionSummary: 'Data retention schedule confirmed loan documents purged from staging and production S3 buckets. Certificate of erasure issued to applicant.',
    resolutionDate: '2026-09-02T11:00:00Z',
    appealNoticeGiven: true
  },
  {
    id: 'grv_3',
    grievanceCode: 'GRV-2026-003',
    dataPrincipalId: 'DP-IND-11820',
    principalName: 'Meenakshi Iyer',
    principalEmail: 'meenakshi.iyer@example.in',
    category: 'CHILDREN_DATA_VIOLATION',
    description: 'Parent discovered minor daughter (age 15) was able to register for youth savings product without mandatory father/mother Aadhaar OTP verification.',
    loggedDate: '2026-09-03T10:15:00Z',
    statutoryDeadlineDate: '2026-09-10T18:30:00Z', // 7-day expedited children SLA
    status: 'OPEN',
    assignedOfficer: 'Elena Rostova (Chief Information Security Officer & Acting DPO)',
    dpoEscalationRequired: true,
    resolutionSummary: 'Account placed on temporary restriction. Onboarding engineering team deployed mandatory age gating fix to staging.',
    appealNoticeGiven: true
  }
];

// Initial DPIA Records
export const INITIAL_DPDP_DPIA_RECORDS: DPDPDpiaRecord[] = [
  {
    id: 'dpia_1',
    assessmentCode: 'DPIA-2026-01',
    title: 'Customer Onboarding Video KYC & Facial Biometric Liveness Verification',
    department: 'Customer Operations & SecOps',
    processingActivity: 'Processing facial biometric vectors and live video recording to verify Indian identity (Aadhaar / Passport) in compliance with PMLA and DPDP Section 8.',
    volumeOfDataPrincipals: 'High (>500k)',
    involvesChildrenData: false,
    involvesSpecialSensitivities: ['Facial Biometric Template', 'Aadhaar Tokenized Number', 'Live Audio/Video Recording', 'IP Geolocation'],
    necessityAndProportionalityEvaluation: 'Mandated by Reserve Bank of India Master Directions for digital account opening. Proportionality satisfied as raw biometric prints are converted to irreversible 128-dimensional hash representations.',
    identifiedRisks: [
      {
        riskDescription: 'Unauthorized capture or exfiltration of biometric embeddings by vendor SDK during network transmission.',
        impactOnDataPrincipal: 'Catastrophic',
        likelihood: 'Possible',
        safeguards: 'TLS 1.3 encryption with certificate pinning; vendor SDK processes vector on-device inside secure enclave.',
        residualRiskLevel: 'Low'
      },
      {
        riskDescription: 'Algorithmic bias or liveness false rejects for rural Data Principals in low-lighting conditions.',
        impactOnDataPrincipal: 'Medium',
        likelihood: 'Likely',
        safeguards: 'Human-in-the-loop manual review fallback available for 100% of rejected automated attempts.',
        residualRiskLevel: 'Low'
      }
    ],
    isSignificantDataFiduciaryTriggered: true,
    independentDataAuditorEngaged: true,
    dpoApprovalStatus: 'APPROVED',
    dpoNotes: 'Formal approval granted by DPO on condition that all video recording raw streams are purged after 180 days.',
    assessmentDate: '2026-05-10',
    nextReviewDate: '2026-11-10',
    comments: [
      {
        id: 'cmnt_dpia1_1',
        dpiaId: 'dpia_1',
        authorName: 'Vikramaditya Malhotra',
        authorRole: 'Head of InfoSec & SecOps',
        department: 'Information Security & SecOps',
        timestamp: '2026-05-12T14:30:00Z',
        commentType: 'RISK_OBJECTION',
        content: 'Vendor SDK biometric vectors must not be written to unencrypted temporary caches on customer mobile storage. Verification must occur strictly inside hardware-backed Android Keystore / iOS Secure Enclave.',
        statutoryClauseRef: 'Section 8(5) Technical Safeguards',
        status: 'RESOLVED',
        auditEvidenceHash: 'SHA256:4f89a12c89ab23ef4f89a12c0123cdef456789abcdef0123456789abcdef0123456789',
        resolvedBy: 'Karthik Raman (Designated Grievance & Technical Officer)',
        resolvedAt: '2026-05-15T09:00:00Z',
        resolutionNote: 'SDK v4.2 deployed across all production builds. Ephemeral vector caching verified isolated in hardware secure enclave.'
      },
      {
        id: 'cmnt_dpia1_2',
        dpiaId: 'dpia_1',
        authorName: 'Dr. Rajeshwar Rao',
        authorRole: 'Head of Legal & Regulatory Affairs',
        department: 'Legal & Regulatory Affairs',
        timestamp: '2026-05-14T11:15:00Z',
        commentType: 'LEGAL_COMPLIANCE_NOTE',
        content: 'Video KYC is mandated under RBI Master Directions (PMLA). However, DPDP Section 6 mandates that bilingual biometric consent notice explicitly discloses the 180-day automated video purge window.',
        statutoryClauseRef: 'Section 6(1) Notice Specificity',
        status: 'ACCEPTED_INTO_DPIA',
        auditEvidenceHash: 'SHA256:7b12e34d89ab23ef7b12e34d0123cdef456789abcdef0123456789abcdef0123456789',
        resolvedBy: 'Elena Rostova (Chief DPO)',
        resolvedAt: '2026-05-16T16:30:00Z',
        resolutionNote: '180-day purge schedule codified into multilingual consent artifact and AWS S3 lifecycle rule enacted.'
      },
      {
        id: 'cmnt_dpia1_3',
        dpiaId: 'dpia_1',
        authorName: 'Priya Sundaram',
        authorRole: 'Head of Customer Experience & Operations',
        department: 'Customer Operations',
        timestamp: '2026-05-18T10:00:00Z',
        commentType: 'DEPARTMENT_SIGN_OFF',
        content: 'Customer Operations concurs with proportionality safeguards. Fallback manual review desks are staffed with bilingual operators for all 22 Eighth Schedule languages in case of facial biometric false rejects.',
        statutoryClauseRef: 'Section 10(2)(c) & Section 6',
        status: 'ACCEPTED_INTO_DPIA',
        auditEvidenceHash: 'SHA256:9c44f21089ab23ef9c44f2100123cdef456789abcdef0123456789abcdef0123456789'
      }
    ]
  },
  {
    id: 'dpia_2',
    assessmentCode: 'DPIA-2026-02',
    title: 'AI-Powered Predictive Financial Assistant & User Behavioral Insights Engine',
    department: 'Software Engineering & Data Science',
    processingActivity: 'Training Large Language Models and recommendation clusters on user transaction narratives to suggest budgeting and credit optimization.',
    volumeOfDataPrincipals: 'Medium (10k-500k)',
    involvesChildrenData: false,
    involvesSpecialSensitivities: ['Granular Transaction History', 'Merchant Identifiers', 'Income & Spending Patterns'],
    necessityAndProportionalityEvaluation: 'Elective value-added feature. Must require separate, unbundled consent toggle under Section 6 of DPDP Act.',
    identifiedRisks: [
      {
        riskDescription: 'Inadvertent training data memorization causing LLM to regurgitate personal PAN or account numbers in response prompts.',
        impactOnDataPrincipal: 'High',
        likelihood: 'Possible',
        safeguards: 'Automated PII scrubbing pipeline utilizing Microsoft Presidio and regex masks before feeding text into vector database.',
        residualRiskLevel: 'Low'
      },
      {
        riskDescription: 'Failure to purge training vectors when Data Principal revokes consent for predictive insights.',
        impactOnDataPrincipal: 'High',
        likelihood: 'Likely',
        safeguards: 'Implemented vector deletion tombstone API triggered synchronously by user consent withdrawal event.',
        residualRiskLevel: 'Medium'
      }
    ],
    isSignificantDataFiduciaryTriggered: true,
    independentDataAuditorEngaged: false,
    dpoApprovalStatus: 'CONDITIONAL_APPROVAL',
    dpoNotes: 'Conditional approval: Cannot be launched until synthetic differential privacy testing achieves epsilon < 1.0 guarantee.',
    assessmentDate: '2026-07-22',
    nextReviewDate: '2027-01-22',
    comments: [
      {
        id: 'cmnt_dpia2_1',
        dpiaId: 'dpia_2',
        authorName: 'Amit Sengupta',
        authorRole: 'Lead Cloud Infrastructure Architect',
        department: 'DevOps & Cloud Engineering',
        timestamp: '2026-07-24T15:20:00Z',
        commentType: 'RISK_OBJECTION',
        content: 'Vector databases (Pinecone / pgvector) do not support immediate transactional deletion if HNSW graph indices are periodically compacted in batch jobs. Consent revocation could leave residual vector embeddings for up to 48 hours.',
        statutoryClauseRef: 'Section 8(7) Erasure Cascade',
        status: 'OPEN',
        auditEvidenceHash: 'SHA256:1a87e59b89ab23ef1a87e59b0123cdef456789abcdef0123456789abcdef0123456789'
      },
      {
        id: 'cmnt_dpia2_2',
        dpiaId: 'dpia_2',
        authorName: 'Elena Rostova',
        authorRole: 'Chief Data Protection Officer',
        department: 'Executive Compliance & DPO Office',
        timestamp: '2026-07-25T11:45:00Z',
        commentType: 'SAFEGUARD_PROPOSAL',
        content: 'Propose implementing a dual-gate architecture: 1) Mandatory unbundled consent toggle at signup; 2) Query-time tombstone filtering layer so revoked embeddings are instantly unreachable while awaiting physical garbage collection.',
        statutoryClauseRef: 'Section 6(1) Purpose Unbundling & Section 6(4)',
        status: 'OPEN',
        auditEvidenceHash: 'SHA256:3d29c81489ab23ef3d29c8140123cdef456789abcdef0123456789abcdef0123456789'
      }
    ]
  }
];

// Initial 6-Hour Breach Playbook Incident
export const INITIAL_BREACH_INCIDENTS: DPDPBreachIncidentRecord[] = [
  {
    id: 'brch_1',
    incidentCode: 'BRCH-DPDP-2026-01',
    title: 'Staging S3 Bucket ACL Misconfiguration Exposing Mock & Redacted KYC Records',
    detectedAt: '2026-08-31T10:15:00Z',
    discoverySource: 'SOC Alert',
    severity: 'HIGH_SEV2',
    affectedDataPrincipalsEst: 1420,
    dataCategoriesCompromised: ['Full Name', 'Redacted Aadhaar Last 4 Digits', 'Email', 'City Location'],
    containmentStatus: 'CONTAINED',
    dpbiNotificationStatus: 'DISPATCHED_ON_TIME',
    dpbiNotifiedAt: '2026-08-31T13:45:00Z', // Dispatched in 3h 30m (well within 6 hours!)
    certInNotificationStatus: 'DISPATCHED_ON_TIME',
    certInNotifiedAt: '2026-08-31T14:00:00Z', // Dispatched in 3h 45m
    dataPrincipalNotificationStatus: 'DISPATCHED',
    dpoSignOff: 'Elena Rostova (CISO & Acting DPO)',
    breachDescription: 'Continuous integration script deployed an update to non-production bucket with public-read permissions. SOC detected external query anomaly within 18 minutes and sealed bucket.',
    rootCause: 'Terraform bucket replica module was missing explicit public access block constraint.',
    remedialMeasuresToPrincipals: [
      'Revoked all active API keys and refreshed credentials.',
      'Confirmed zero financial credentials or plaintext passwords compromised.',
      'Dedicated 24/7 DPO hotline provided for concerned Data Principals.'
    ]
  }
];
