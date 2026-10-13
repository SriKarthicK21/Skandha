import { fallbackHash } from '../utils/crypto';

// ==========================================
// SECTION 9: VERIFIABLE PARENTAL CONSENT (VPC) & CHILD DATA
// ==========================================
export interface DPDPChildConsentRecord {
  id: string;
  childPrincipalId: string; // e.g. "DP-CHD-4019"
  childName: string;
  childAge: number; // strictly under 18
  dateOfBirth: string;
  guardianName: string;
  guardianRelationship: 'Father' | 'Mother' | 'Legal Guardian appointed by Court';
  guardianEmail: string;
  guardianPhone: string;
  guardianKycMethod: 'DigiLocker Tokenized KYC' | 'Aadhaar OTP (UIDAI Virtual ID)' | 'Passport / Govt ID Upload' | 'Net Banking 1-Rupee Penny Drop';
  guardianKycStatus: 'VERIFIED' | 'PENDING_VERIFICATION' | 'REJECTED';
  guardianKycRef: string; // e.g. "DL-KYC-992144"
  verificationDate: string;
  purpose: string;
  schoolOrOrgAffiliation?: string;
  status: 'ACTIVE_AUTHORIZED' | 'REVOKED_BY_GUARDIAN' | 'EXPIRED' | 'FLAGGED_AGE_OUT';
  
  // Section 9 Prohibitions Compliance Flags
  behavioralTrackingDisabled: boolean; // Mandate under Sec 9(2)
  targetedAdvertisingBlocked: boolean; // Mandate under Sec 9(2)
  detrimentalProcessingShieldActive: boolean; // Mandate under Sec 9(1)
  telemetryPurged: boolean;
  notes?: string;
}

// ==========================================
// SECTION 8(7) & 12(3): AUTOMATED ERASURE & DOWNSTREAM CASCADE
// ==========================================
export interface DPDPErasureCascadeRecord {
  id: string;
  erasureCode: string; // e.g. "ERS-2026-081"
  dataPrincipalId: string;
  principalName: string;
  principalEmail: string;
  triggerType: 'CONSENT_WITHDRAWAL' | 'PURPOSE_ACCOMPLISHED' | 'PRINCIPAL_RIGHT_REQUEST' | 'STATUTORY_EXPIRY';
  requestDate: string;
  completedDate?: string;
  status: 'PENDING_EVALUATION' | 'LEGAL_HOLD_APPLIED' | 'CASCADE_DISPATCHED' | 'FULLY_ERASED_CERTIFIED';
  
  // Statutory Retention vs Legal Hold Evaluation (Section 8(7)(b))
  legalHoldAssessment: {
    hasLegalHold: boolean;
    applicableLaw?: 'Income Tax Act 1961 (Sec 44AA - 7 Yrs)' | 'Prevention of Money Laundering Act 2002 (Sec 12 - 5 Yrs)' | 'RBI Master Direction - KYC (5 Yrs)' | 'Companies Act 2013 (Sec 128 - 8 Yrs)' | 'Pending Judicial Proceeding';
    holdJustification?: string;
    holdExpiryDate?: string;
    dpoApprovalOfficer?: string;
  };

  // Downstream Processors Notification Cascade
  affectedProcessors: {
    processorName: string;
    serviceType: string;
    dispatchStatus: 'NOT_SENT' | 'QUEUED' | 'CONFIRMED_DELETED' | 'FAILED_RETRYING';
    acknowledgedAt?: string;
    processorAckToken?: string;
  }[];

  // Cryptographic Deletion Certificate
  deletionCertificate?: {
    certificateId: string; // e.g. "DPBI-DEL-CERT-2026-904"
    sha256ProofHash: string;
    recordsPurgedCount: number;
    witnessedByDpo: string;
    certifiedAt: string;
  };
}

// ==========================================
// SECTION 8(1) & 8(2): DATA PROCESSOR DPA & DUE DILIGENCE
// ==========================================
export interface DPDPDataProcessorRecord {
  id: string;
  processorCode: string; // e.g. "PRC-AWS-01"
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  registeredJurisdiction: string;
  serviceCategory: 'Cloud Hosting & Storage' | 'Payment Gateway' | 'Analytics & Observability' | 'CRM & Customer Support' | 'HRMS & Payroll' | 'Identity Verification';
  dpaStatus: 'EXECUTED_ACTIVE' | 'UNDER_RENEGOTIATION' | 'EXPIRED' | 'MISSING_CONTRACT';
  dpaSignedDate: string;
  dpaValidUntil: string;
  dpaDocumentRef: string;
  
  // Statutory Clauses in DPA
  hasSubprocessorClause: boolean; // Section 8(1) requires prior approval
  subprocessorsCount: number;
  breachEscalationSlaHours: number; // Contractual SLA (e.g. 2 hours internal to Fiduciary)
  securityCertifications: ('ISO 27001:2022' | 'SOC 2 Type II' | 'ISO 27701' | 'PCI-DSS v4.0')[];
  lastAuditDate: string;
  nextAuditDueDate: string;
  dueDiligenceScore: number; // 0 to 100%
  overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

// ==========================================
// SECTION 16: CROSS-BORDER DATA FLOWS & RESIDENCY
// ==========================================
export interface DPDPCrossBorderFlowRecord {
  id: string;
  flowCode: string; // e.g. "XFER-EU-01"
  transferName: string;
  sourceRegion: string; // e.g. "India (AWS ap-south-1 Mumbai)"
  destinationCountry: string; // e.g. "Germany", "United States", "Singapore", "Ireland"
  destinationCloudRegion: string; // e.g. "eu-central-1 Frankfurt"
  recipientEntity: string;
  dataCategoriesTransferred: string[];
  purposeOfTransfer: string;
  statutoryTransferMechanism: 'Standard Contractual Clauses (SCC) with Technical Safeguards' | 'Central Government Whitelisted Territory' | 'Intra-Group Binding Corporate Rules' | 'Explicit Statutory Consent Derogation';
  centralGovNotificationStatus: 'PERMITTED_NO_RESTRICTION' | 'SUBJECT_TO_LOCALIZATION' | 'PROHIBITED_RESTRICTED_LIST';
  encryptionInTransitAndRest: boolean;
  volumeCategory: 'High (>500k/mo)' | 'Medium (10k-500k/mo)' | 'Low (<10k/mo)';
  lastAssessedDate: string;
  dpoClearanceStatus: 'CLEARED' | 'CONDITIONAL_REVIEW' | 'BLOCKED';
}

// ==========================================
// SECTION 6(7)-(9): CONSENT MANAGER INTEROPERABILITY ARTIFACT
// ==========================================
export interface DPDPStandardConsentArtifact {
  '@context': string;
  artifactVersion: string;
  consentId: string;
  consentManagerId: string;
  consentManagerName: string;
  consentTimestamp: string;
  expiryTimestamp: string;
  dataPrincipal: {
    pseudonymizedToken: string;
    identityAssuranceLevel: string;
  };
  dataFiduciary: {
    fiduciaryRegistrationNo: string;
    fiduciaryName: string;
    dpoContact: string;
  };
  purposes: {
    code: string;
    title: string;
    dataCategories: string[];
    retentionPeriodMonths: number;
  }[];
  revocationEndpoint: string;
  digitalSignature: {
    algorithm: string;
    sha256Digest: string;
    signedBy: string;
  };
}

// ==========================================
// INITIAL MOCK MASTER DATA
// ==========================================

export const INITIAL_CHILD_CONSENTS: DPDPChildConsentRecord[] = [
  {
    id: 'chd_1',
    childPrincipalId: 'DP-CHD-4019',
    childName: 'Aarav Sharma',
    childAge: 14,
    dateOfBirth: '2012-04-18',
    guardianName: 'Dr. Rajesh Sharma',
    guardianRelationship: 'Father',
    guardianEmail: 'dr.rajesh.sharma@example.com',
    guardianPhone: '+91 98231 44552',
    guardianKycMethod: 'DigiLocker Tokenized KYC',
    guardianKycStatus: 'VERIFIED',
    guardianKycRef: 'DL-KYC-992144',
    verificationDate: '2026-03-12',
    purpose: 'Academic STEM Learning Portal & Student Progress Telemetry',
    schoolOrOrgAffiliation: 'Delhi Public School, R.K. Puram',
    status: 'ACTIVE_AUTHORIZED',
    behavioralTrackingDisabled: true,
    targetedAdvertisingBlocked: true,
    detrimentalProcessingShieldActive: true,
    telemetryPurged: true,
    notes: 'Verified via DigiLocker Aadhaar e-Sign API. Zero third-party behavioral analytics trackers activated.'
  },
  {
    id: 'chd_2',
    childPrincipalId: 'DP-CHD-7731',
    childName: 'Ananya Iyer',
    childAge: 16,
    dateOfBirth: '2010-08-25',
    guardianName: 'Meenakshi Iyer',
    guardianRelationship: 'Mother',
    guardianEmail: 'meenakshi.iyer@example.com',
    guardianPhone: '+91 94441 22889',
    guardianKycMethod: 'Aadhaar OTP (UIDAI Virtual ID)',
    guardianKycStatus: 'VERIFIED',
    guardianKycRef: 'UIDAI-VPC-88319',
    verificationDate: '2026-06-04',
    purpose: 'Coding Bootcamp & Sandbox Computing Environment Access',
    status: 'ACTIVE_AUTHORIZED',
    behavioralTrackingDisabled: true,
    targetedAdvertisingBlocked: true,
    detrimentalProcessingShieldActive: true,
    telemetryPurged: true,
    notes: 'Strict parental consent granted for coding execution logs only. Ad networks completely blocked.'
  },
  {
    id: 'chd_3',
    childPrincipalId: 'DP-CHD-9022',
    childName: 'Kabir Verma',
    childAge: 11,
    dateOfBirth: '2015-01-10',
    guardianName: 'Sanjay Verma',
    guardianRelationship: 'Father',
    guardianEmail: 'sanjay.verma@example.com',
    guardianPhone: '+91 99881 77211',
    guardianKycMethod: 'Passport / Govt ID Upload',
    guardianKycStatus: 'PENDING_VERIFICATION',
    guardianKycRef: 'GOVT-ID-77210',
    verificationDate: '2026-09-02',
    purpose: 'Youth Chess Tournament Profile & ELO Rating',
    status: 'ACTIVE_AUTHORIZED',
    behavioralTrackingDisabled: true,
    targetedAdvertisingBlocked: true,
    detrimentalProcessingShieldActive: true,
    telemetryPurged: false,
    notes: 'Manual verification in progress by Compliance Ops. Restricted read-only profile.'
  }
];

export const INITIAL_ERASURE_REQUESTS: DPDPErasureCascadeRecord[] = [
  {
    id: 'ers_1',
    erasureCode: 'ERS-2026-081',
    dataPrincipalId: 'DP-IND-88412',
    principalName: 'Pooja Deshmukh',
    principalEmail: 'pooja.deshmukh@example.com',
    triggerType: 'CONSENT_WITHDRAWAL',
    requestDate: '2026-09-01T11:20:00Z',
    completedDate: '2026-09-01T14:40:00Z',
    status: 'FULLY_ERASED_CERTIFIED',
    legalHoldAssessment: {
      hasLegalHold: false,
      holdJustification: 'No active regulatory preservation requirement. Account had zero financial liabilities or open claims.',
      dpoApprovalOfficer: 'Elena Rostova (Lead DPO)'
    },
    affectedProcessors: [
      {
        processorName: 'Amazon Web Services (AWS)',
        serviceType: 'Primary PII PostgreSQL DB (ap-south-1)',
        dispatchStatus: 'CONFIRMED_DELETED',
        acknowledgedAt: '2026-09-01T11:35:00Z',
        processorAckToken: 'AWS-DEL-ACK-881249'
      },
      {
        processorName: 'Snowflake Data Cloud',
        serviceType: 'Marketing & Behavioral Analytics Lakehouse',
        dispatchStatus: 'CONFIRMED_DELETED',
        acknowledgedAt: '2026-09-01T12:10:00Z',
        processorAckToken: 'SNOW-TOMBSTONE-00128'
      },
      {
        processorName: 'Salesforce CRM',
        serviceType: 'Customer Success & Lead Records',
        dispatchStatus: 'CONFIRMED_DELETED',
        acknowledgedAt: '2026-09-01T14:30:00Z',
        processorAckToken: 'SF-PURGE-90812'
      }
    ],
    deletionCertificate: {
      certificateId: 'DPBI-DEL-CERT-2026-904',
      sha256ProofHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      recordsPurgedCount: 14,
      witnessedByDpo: 'Elena Rostova (Lead DPO)',
      certifiedAt: '2026-09-01T14:40:00Z'
    }
  },
  {
    id: 'ers_2',
    erasureCode: 'ERS-2026-082',
    dataPrincipalId: 'DP-IND-55913',
    principalName: 'Vikramaditya Sengupta',
    principalEmail: 'vikram.sengupta@example.com',
    triggerType: 'PRINCIPAL_RIGHT_REQUEST',
    requestDate: '2026-09-04T09:15:00Z',
    status: 'LEGAL_HOLD_APPLIED',
    legalHoldAssessment: {
      hasLegalHold: true,
      applicableLaw: 'Prevention of Money Laundering Act 2002 (Sec 12 - 5 Yrs)',
      holdJustification: 'Section 8(7)(b) Statutory Exemption: Principal executed regulated INR transactions exceeding threshold in FY2025-26. PMLA Section 12 mandates preservation for 5 years.',
      holdExpiryDate: '2031-03-31',
      dpoApprovalOfficer: 'Elena Rostova (Lead DPO)'
    },
    affectedProcessors: [
      {
        processorName: 'Razorpay Payment Solutions',
        serviceType: 'Regulated Payment & Settlement Gateway',
        dispatchStatus: 'NOT_SENT',
        processorAckToken: 'LEGAL-HOLD-PRESERVED'
      }
    ]
  },
  {
    id: 'ers_3',
    erasureCode: 'ERS-2026-083',
    dataPrincipalId: 'DP-IND-11094',
    principalName: 'Sunita Mehra',
    principalEmail: 'sunita.mehra@example.com',
    triggerType: 'PURPOSE_ACCOMPLISHED',
    requestDate: '2026-09-06T16:00:00Z',
    status: 'CASCADE_DISPATCHED',
    legalHoldAssessment: {
      hasLegalHold: false,
      holdJustification: 'Web consultation session completed and concluded. 30-day post-consultation retention expired.',
      dpoApprovalOfficer: 'Elena Rostova (Lead DPO)'
    },
    affectedProcessors: [
      {
        processorName: 'Amazon Web Services (AWS)',
        serviceType: 'Customer Consultation Audio/Video Storage',
        dispatchStatus: 'CONFIRMED_DELETED',
        acknowledgedAt: '2026-09-06T16:15:00Z',
        processorAckToken: 'AWS-S3-PURGE-4412'
      },
      {
        processorName: 'Freshdesk Customer Support',
        serviceType: 'Ticket Records & Resolution Transcripts',
        dispatchStatus: 'QUEUED'
      }
    ]
  }
];

export const INITIAL_DATA_PROCESSORS: DPDPDataProcessorRecord[] = [
  {
    id: 'prc_1',
    processorCode: 'PRC-AWS-01',
    companyName: 'Amazon Web Services India Pvt Ltd',
    contactPerson: 'Enterprise Legal & Compliance Desk',
    contactEmail: 'aws-india-dpdp-compliance@amazon.com',
    registeredJurisdiction: 'Mumbai, Maharashtra, India',
    serviceCategory: 'Cloud Hosting & Storage',
    dpaStatus: 'EXECUTED_ACTIVE',
    dpaSignedDate: '2025-11-14',
    dpaValidUntil: '2027-11-14',
    dpaDocumentRef: 'DPA-AWS-IND-2025-v3',
    hasSubprocessorClause: true,
    subprocessorsCount: 8,
    breachEscalationSlaHours: 2,
    securityCertifications: ['ISO 27001:2022', 'SOC 2 Type II', 'ISO 27701'],
    lastAuditDate: '2026-04-10',
    nextAuditDueDate: '2027-04-10',
    dueDiligenceScore: 98,
    overallRiskLevel: 'LOW'
  },
  {
    id: 'prc_2',
    processorCode: 'PRC-RZP-02',
    companyName: 'Razorpay Software Private Limited',
    contactPerson: 'Data Protection Office (India)',
    contactEmail: 'dpo@razorpay.com',
    registeredJurisdiction: 'Bengaluru, Karnataka, India',
    serviceCategory: 'Payment Gateway',
    dpaStatus: 'EXECUTED_ACTIVE',
    dpaSignedDate: '2026-01-20',
    dpaValidUntil: '2028-01-20',
    dpaDocumentRef: 'DPA-RZP-2026-DPDP-EX',
    hasSubprocessorClause: true,
    subprocessorsCount: 4,
    breachEscalationSlaHours: 2,
    securityCertifications: ['ISO 27001:2022', 'SOC 2 Type II', 'PCI-DSS v4.0'],
    lastAuditDate: '2026-05-18',
    nextAuditDueDate: '2027-05-18',
    dueDiligenceScore: 95,
    overallRiskLevel: 'LOW'
  },
  {
    id: 'prc_3',
    processorCode: 'PRC-SFDC-03',
    companyName: 'Salesforce India Technology Centre',
    contactPerson: 'Privacy & Commercial Counsel',
    contactEmail: 'india-privacy@salesforce.com',
    registeredJurisdiction: 'Hyderabad, Telangana, India',
    serviceCategory: 'CRM & Customer Support',
    dpaStatus: 'EXECUTED_ACTIVE',
    dpaSignedDate: '2025-08-30',
    dpaValidUntil: '2026-12-31',
    dpaDocumentRef: 'DPA-SFDC-HYD-2025-v2',
    hasSubprocessorClause: true,
    subprocessorsCount: 14,
    breachEscalationSlaHours: 4,
    securityCertifications: ['ISO 27001:2022', 'SOC 2 Type II'],
    lastAuditDate: '2026-02-12',
    nextAuditDueDate: '2027-02-12',
    dueDiligenceScore: 88,
    overallRiskLevel: 'MEDIUM'
  },
  {
    id: 'prc_4',
    processorCode: 'PRC-SNOW-04',
    companyName: 'Snowflake Computing India Pvt Ltd',
    contactPerson: 'Security & Cloud Governance',
    contactEmail: 'compliance@snowflake.com',
    registeredJurisdiction: 'Pune, Maharashtra, India',
    serviceCategory: 'Analytics & Observability',
    dpaStatus: 'EXECUTED_ACTIVE',
    dpaSignedDate: '2026-03-01',
    dpaValidUntil: '2028-03-01',
    dpaDocumentRef: 'DPA-SNOW-IND-01',
    hasSubprocessorClause: true,
    subprocessorsCount: 6,
    breachEscalationSlaHours: 2,
    securityCertifications: ['ISO 27001:2022', 'SOC 2 Type II', 'ISO 27701'],
    lastAuditDate: '2026-06-20',
    nextAuditDueDate: '2027-06-20',
    dueDiligenceScore: 92,
    overallRiskLevel: 'LOW'
  }
];

export const INITIAL_CROSS_BORDER_FLOWS: DPDPCrossBorderFlowRecord[] = [
  {
    id: 'xfer_1',
    flowCode: 'XFER-EU-01',
    transferName: 'Global Cloud Disaster Recovery & Encrypted Object Backup',
    sourceRegion: 'India (AWS ap-south-1 Mumbai)',
    destinationCountry: 'Germany',
    destinationCloudRegion: 'AWS eu-central-1 Frankfurt',
    recipientEntity: 'Global Enterprise Backup Services GmbH',
    dataCategoriesTransferred: ['Encrypted Master Database Snapshots (AES-256-GCM)', 'Pseudonymized User Identifiers'],
    purposeOfTransfer: 'High-availability geographic redundancy and geo-dispersed disaster recovery replication.',
    statutoryTransferMechanism: 'Standard Contractual Clauses (SCC) with Technical Safeguards',
    centralGovNotificationStatus: 'PERMITTED_NO_RESTRICTION',
    encryptionInTransitAndRest: true,
    volumeCategory: 'High (>500k/mo)',
    lastAssessedDate: '2026-07-15',
    dpoClearanceStatus: 'CLEARED'
  },
  {
    id: 'xfer_2',
    flowCode: 'XFER-USA-02',
    transferName: 'Customer Support Escalation & Telephony Dispatch',
    sourceRegion: 'India (AWS ap-south-1 Mumbai)',
    destinationCountry: 'United States',
    destinationCloudRegion: 'US East (N. Virginia)',
    recipientEntity: 'Zendesk Inc. Tier-3 Global Support',
    dataCategoriesTransferred: ['Support Ticket Narratives', 'Business Email Address', 'Technical Diagnostic Logs'],
    purposeOfTransfer: '24/7 round-the-clock enterprise support escalation for critical Sev-1 platform defects.',
    statutoryTransferMechanism: 'Standard Contractual Clauses (SCC) with Technical Safeguards',
    centralGovNotificationStatus: 'PERMITTED_NO_RESTRICTION',
    encryptionInTransitAndRest: true,
    volumeCategory: 'Medium (10k-500k/mo)',
    lastAssessedDate: '2026-08-10',
    dpoClearanceStatus: 'CLEARED'
  },
  {
    id: 'xfer_3',
    flowCode: 'XFER-SGP-03',
    transferName: 'Regional APAC Anti-Fraud Risk Scoring Model Sync',
    sourceRegion: 'India (AWS ap-south-1 Mumbai)',
    destinationCountry: 'Singapore',
    destinationCloudRegion: 'AWS ap-southeast-1 Singapore',
    recipientEntity: 'FinTech Intelligence Labs Pte Ltd',
    dataCategoriesTransferred: ['Hashed IP Subnets', 'Device Browser Fingerprints', 'Behavioral Anomaly Scores'],
    purposeOfTransfer: 'Cross-border syndicate fraud detection and botnet attack mitigation.',
    statutoryTransferMechanism: 'Central Government Whitelisted Territory',
    centralGovNotificationStatus: 'PERMITTED_NO_RESTRICTION',
    encryptionInTransitAndRest: true,
    volumeCategory: 'High (>500k/mo)',
    lastAssessedDate: '2026-05-22',
    dpoClearanceStatus: 'CLEARED'
  }
];

// Helper to generate MeitY / Sahamati-compatible Consent Manager artifact
export function generateStandardConsentArtifact(
  dataPrincipalId: string,
  principalName: string,
  purpose: string,
  categories: string[]
): DPDPStandardConsentArtifact {
  const artifactId = `CM-ART-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const timestamp = new Date().toISOString();
  const expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  const token = `SHA256:${fallbackHash(dataPrincipalId + timestamp).substring(0, 32)}`;

  return {
    '@context': 'https://schema.meity.gov.in/dpdp/consent-v1.jsonld',
    artifactVersion: '1.0.0',
    consentId: artifactId,
    consentManagerId: 'CM-DIGILOCKER-01-REG',
    consentManagerName: 'National DigiLocker Consent Gateway (MeitY Registered)',
    consentTimestamp: timestamp,
    expiryTimestamp: expiry,
    dataPrincipal: {
      pseudonymizedToken: token,
      identityAssuranceLevel: 'IAL-2 (Verified Mobile / OTP)'
    },
    dataFiduciary: {
      fiduciaryRegistrationNo: 'SDF-DPDP-IND-2026-0044',
      fiduciaryName: 'Enterprise GRC & Cloud Systems India Ltd',
      dpoContact: 'dpo@enterprise-grc.co.in'
    },
    purposes: [
      {
        code: 'PURP-SRV-CORE-01',
        title: purpose,
        dataCategories: categories,
        retentionPeriodMonths: 24
      }
    ],
    revocationEndpoint: 'https://api.enterprise-grc.co.in/v1/dpdp/consent/revoke',
    digitalSignature: {
      algorithm: 'RSA-SHA256-PKCS#1v15',
      sha256Digest: fallbackHash(artifactId + token + timestamp),
      signedBy: 'CN=National Consent Manager Signer CA, O=MeitY, C=IN'
    }
  };
}

// ==========================================
// IMMUTABLE CONSENT HISTORY LOG (SECTION 6 & SECTION 6(10))
// ==========================================

export type DPDPActionType =
  | 'CONSENT_GRANTED'
  | 'CONSENT_REVOKED'
  | 'CONSENT_RENEWED'
  | 'PURPOSE_MODIFIED'
  | 'DOWNSTREAM_NOTIFIED'
  | 'NOTICE_RE_SERVED';

export interface DPDPConsentHistoryEvent {
  id: string;
  eventId: string; // e.g. "EVT-CSN-2026-0091"
  timestamp: string;
  dataPrincipalId: string;
  principalName: string;
  principalEmail: string;
  actionType: DPDPActionType;
  consentVersion: string;
  noticeLanguage: string;
  processingPurpose: string;
  dataCategories: string[];
  channel: 'Web Portal' | 'Mobile App (Android/iOS)' | 'Consent Manager API' | 'Offline Form';
  actor: {
    type: 'DATA_PRINCIPAL' | 'CONSENT_MANAGER_API' | 'DPO_OVERRIDE' | 'SYSTEM_AUTOMATION';
    name: string;
    identifier: string; // IP, API key, or Officer ID
  };
  downstreamProcessorsNotified: string[];
  cryptographicProofHash: string; // SHA-256 hash digest
  previousBlockHash: string; // SHA-256 chain link
  statutoryClause: string; // e.g. "Section 6(1)", "Section 6(4)", "Section 6(10)"
  auditVerificationStatus: 'VERIFIED_VALID' | 'PENDING_ATTESTATION' | 'SEALED';
  notes: string;
}

export function buildConsentHistoryProofHash(
  dataPrincipalId: string,
  actionType: string,
  timestamp: string,
  previousHash: string
): string {
  return `SHA256:${fallbackHash(`${dataPrincipalId}::${actionType}::${timestamp}::${previousHash}`)}`;
}

export const INITIAL_CONSENT_HISTORY_EVENTS: DPDPConsentHistoryEvent[] = [
  {
    id: 'evt_11',
    eventId: 'EVT-CSN-2026-0091',
    timestamp: '2026-08-25T10:00:03Z',
    dataPrincipalId: 'DP-IND-54188',
    principalName: 'Vikramaditya Patel',
    principalEmail: 'vikram.patel@example.in',
    actionType: 'DOWNSTREAM_NOTIFIED',
    consentVersion: 'v1.9',
    noticeLanguage: 'Gujarati (ગુજરાતી)',
    processingPurpose: 'Behavioral Ad Targeting & Analytics',
    dataCategories: ['App Session Duration', 'Browsing Telemetry', 'Referral URL'],
    channel: 'Web Portal',
    actor: {
      type: 'SYSTEM_AUTOMATION',
      name: 'Downstream Dispatcher Daemon',
      identifier: 'DAEMON-SRV-ASIA-01'
    },
    downstreamProcessorsNotified: ['Snowflake Data Warehouse (India)', 'Google Analytics Enterprise', 'Mixpanel India'],
    cryptographicProofHash: 'SHA256:d8a5418e9f284b7a6c903e1254bf71a932087e594d216a7c3b4e198f26749102',
    previousBlockHash: 'SHA256:b1498ec5102f987d654109e20a3591461973bca512f458e0a4f529813b190f71',
    statutoryClause: 'Section 6(6) & Section 8(7)',
    auditVerificationStatus: 'VERIFIED_VALID',
    notes: 'Automated webhook delivered to 3 downstream processors with instructions to cease processing behavioral telemetry.'
  },
  {
    id: 'evt_10',
    eventId: 'EVT-CSN-2026-0090',
    timestamp: '2026-08-25T10:00:00Z',
    dataPrincipalId: 'DP-IND-54188',
    principalName: 'Vikramaditya Patel',
    principalEmail: 'vikram.patel@example.in',
    actionType: 'CONSENT_REVOKED',
    consentVersion: 'v1.9',
    noticeLanguage: 'Gujarati (ગુજરાતી)',
    processingPurpose: 'Behavioral Ad Targeting & Analytics',
    dataCategories: ['App Session Duration', 'Browsing Telemetry', 'Referral URL'],
    channel: 'Web Portal',
    actor: {
      type: 'DATA_PRINCIPAL',
      name: 'Vikramaditya Patel',
      identifier: '115.240.18.91 (IPv4 / Ahmedabad)'
    },
    downstreamProcessorsNotified: ['Snowflake Data Warehouse (India)', 'Google Analytics Enterprise'],
    cryptographicProofHash: 'SHA256:b1498ec5102f987d654109e20a3591461973bca512f458e0a4f529813b190f71',
    previousBlockHash: 'SHA256:f4728d109e5a31b402167d4f398019bcae7218903e45d120a4b791482937e012',
    statutoryClause: 'Section 6(4)',
    auditVerificationStatus: 'VERIFIED_VALID',
    notes: 'Data Principal invoked statutory withdrawal for non-essential analytics tracking via Privacy Dashboard.'
  },
  {
    id: 'evt_9',
    eventId: 'EVT-CSN-2026-0089',
    timestamp: '2026-08-14T16:20:02Z',
    dataPrincipalId: 'DP-IND-71204',
    principalName: 'Rohit Mukherjee',
    principalEmail: 'rohit.mukherjee@example.in',
    actionType: 'DOWNSTREAM_NOTIFIED',
    consentVersion: 'v2.0',
    noticeLanguage: 'Bengali (বাংলা)',
    processingPurpose: 'Third-Party Promotional Offers & Credit Card Marketing',
    dataCategories: ['Contact Phone', 'Email', 'Credit Score Bracket'],
    channel: 'Web Portal',
    actor: {
      type: 'SYSTEM_AUTOMATION',
      name: 'Downstream Dispatcher Daemon',
      identifier: 'DAEMON-SRV-ASIA-01'
    },
    downstreamProcessorsNotified: ['AWS ap-south-1 Mumbai', 'Salesforce Marketing Cloud India'],
    cryptographicProofHash: 'SHA256:f4728d109e5a31b402167d4f398019bcae7218903e45d120a4b791482937e012',
    previousBlockHash: 'SHA256:a928410e3b7c8192048572109e34a01984210e98213bfa491028741092837190',
    statutoryClause: 'Section 6(6) & Section 8(1)',
    auditVerificationStatus: 'VERIFIED_VALID',
    notes: 'Downstream revocation notification ACK confirmed in 200ms by Salesforce and AWS.'
  },
  {
    id: 'evt_8',
    eventId: 'EVT-CSN-2026-0088',
    timestamp: '2026-08-14T16:20:00Z',
    dataPrincipalId: 'DP-IND-71204',
    principalName: 'Rohit Mukherjee',
    principalEmail: 'rohit.mukherjee@example.in',
    actionType: 'CONSENT_REVOKED',
    consentVersion: 'v2.0',
    noticeLanguage: 'Bengali (বাংলা)',
    processingPurpose: 'Third-Party Promotional Offers & Credit Card Marketing',
    dataCategories: ['Contact Phone', 'Email', 'Credit Score Bracket'],
    channel: 'Web Portal',
    actor: {
      type: 'DATA_PRINCIPAL',
      name: 'Rohit Mukherjee',
      identifier: '103.220.76.14 (IPv4 / Kolkata)'
    },
    downstreamProcessorsNotified: ['AWS ap-south-1 Mumbai', 'Salesforce Marketing Cloud India'],
    cryptographicProofHash: 'SHA256:a928410e3b7c8192048572109e34a01984210e98213bfa491028741092837190',
    previousBlockHash: 'SHA256:c284910e59a10293847561029384756102938475610293847561029384756102',
    statutoryClause: 'Section 6(4)',
    auditVerificationStatus: 'VERIFIED_VALID',
    notes: 'Data Principal revoked marketing consent citing SMS message frequency. One-click revocation executed.'
  },
  {
    id: 'evt_7',
    eventId: 'EVT-CSN-2026-0087',
    timestamp: '2026-07-09T09:45:00Z',
    dataPrincipalId: 'DP-IND-90114',
    principalName: 'Ananya Deshmukh',
    principalEmail: 'ananya.deshmukh@example.in',
    actionType: 'CONSENT_GRANTED',
    consentVersion: 'v2.1',
    noticeLanguage: 'Marathi (मराठी)',
    processingPurpose: 'Automated Loan Underwriting & Bureau Pull',
    dataCategories: ['KYC Documents', 'Employment Verification', 'Bank Statement Aggregation'],
    channel: 'Mobile App (Android/iOS)',
    actor: {
      type: 'CONSENT_MANAGER_API',
      name: 'DigiLocker Consent Gateway',
      identifier: 'API-TOKEN-DIGILOCKER-04'
    },
    downstreamProcessorsNotified: ['CIBIL / Experian Bureau API', 'AWS ap-south-1 Mumbai'],
    cryptographicProofHash: 'SHA256:c284910e59a10293847561029384756102938475610293847561029384756102',
    previousBlockHash: 'SHA256:8839201948572019384756102938475610293847561029384756102938475610',
    statutoryClause: 'Section 6(1) & Section 6(7)',
    auditVerificationStatus: 'VERIFIED_VALID',
    notes: 'Consent granted via Registered Consent Manager (DigiLocker) with tokenized OTP authentication.'
  },
  {
    id: 'evt_6',
    eventId: 'EVT-CSN-2026-0086',
    timestamp: '2026-06-16T14:05:00Z',
    dataPrincipalId: 'DP-IND-98421',
    principalName: 'Aarav Sharma',
    principalEmail: 'aarav.sharma@example.in',
    actionType: 'CONSENT_RENEWED',
    consentVersion: 'v2.1',
    noticeLanguage: 'Hindi (हिन्दी)',
    processingPurpose: 'Core Banking, UPI Payments & Account Management',
    dataCategories: ['Full Name', 'PAN / Aadhaar Token', 'Bank Account Details', 'Transaction History', 'IP & Device Telemetry'],
    channel: 'Mobile App (Android/iOS)',
    actor: {
      type: 'DATA_PRINCIPAL',
      name: 'Aarav Sharma',
      identifier: '49.36.112.5 (IPv4 / New Delhi)'
    },
    downstreamProcessorsNotified: ['AWS ap-south-1 Mumbai', 'Snowflake Data Warehouse (India)'],
    cryptographicProofHash: 'SHA256:8839201948572019384756102938475610293847561029384756102938475610',
    previousBlockHash: 'SHA256:7729102938475610293847561029384756102938475610293847561029384756',
    statutoryClause: 'Section 6(2) & Section 6(10)',
    auditVerificationStatus: 'VERIFIED_VALID',
    notes: 'Re-affirmation of affirmative consent following scheduled annual notice re-certification.'
  },
  {
    id: 'evt_5',
    eventId: 'EVT-CSN-2026-0085',
    timestamp: '2026-06-15T09:10:00Z',
    dataPrincipalId: 'DP-IND-98421',
    principalName: 'Aarav Sharma',
    principalEmail: 'aarav.sharma@example.in',
    actionType: 'NOTICE_RE_SERVED',
    consentVersion: 'v2.1',
    noticeLanguage: 'Hindi (हिन्दी)',
    processingPurpose: 'Core Banking, UPI Payments & Account Management',
    dataCategories: ['Full Name', 'PAN / Aadhaar Token', 'Bank Account Details'],
    channel: 'Mobile App (Android/iOS)',
    actor: {
      type: 'SYSTEM_AUTOMATION',
      name: 'Statutory Notice Engine',
      identifier: 'SYS-NOTICE-DISPATCH-V2'
    },
    downstreamProcessorsNotified: ['AWS ap-south-1 Mumbai'],
    cryptographicProofHash: 'SHA256:7729102938475610293847561029384756102938475610293847561029384756',
    previousBlockHash: 'SHA256:6618293049586710293847561029384756102938475610293847561029384756',
    statutoryClause: 'Section 5(1) & Section 5(3)',
    auditVerificationStatus: 'VERIFIED_VALID',
    notes: 'Statutory Section 5 notice re-served in Eighth Schedule language (Hindi) accompanied by DPO contact details.'
  },
  {
    id: 'evt_4',
    eventId: 'EVT-CSN-2026-0084',
    timestamp: '2026-06-02T11:00:00Z',
    dataPrincipalId: 'DP-IND-71204',
    principalName: 'Rohit Mukherjee',
    principalEmail: 'rohit.mukherjee@example.in',
    actionType: 'CONSENT_GRANTED',
    consentVersion: 'v2.0',
    noticeLanguage: 'Bengali (বাংলা)',
    processingPurpose: 'Third-Party Promotional Offers & Credit Card Marketing',
    dataCategories: ['Contact Phone', 'Email', 'Credit Score Bracket'],
    channel: 'Web Portal',
    actor: {
      type: 'DATA_PRINCIPAL',
      name: 'Rohit Mukherjee',
      identifier: '103.220.76.14 (IPv4 / Kolkata)'
    },
    downstreamProcessorsNotified: ['AWS ap-south-1 Mumbai', 'Salesforce Marketing Cloud India'],
    cryptographicProofHash: 'SHA256:6618293049586710293847561029384756102938475610293847561029384756',
    previousBlockHash: 'SHA256:5507182930495867102938475610293847561029384756102938475610293847',
    statutoryClause: 'Section 6(1)',
    auditVerificationStatus: 'VERIFIED_VALID',
    notes: 'Initial explicit opt-in granted via Bengali language web portal interface with granular unbundled checkboxes.'
  },
  {
    id: 'evt_3',
    eventId: 'EVT-CSN-2026-0083',
    timestamp: '2026-05-18T14:15:00Z',
    dataPrincipalId: 'DP-IND-65129',
    principalName: 'Priya Sundaram',
    principalEmail: 'priya.sundaram@example.in',
    actionType: 'CONSENT_GRANTED',
    consentVersion: 'v2.1',
    noticeLanguage: 'Tamil (தமிழ்)',
    processingPurpose: 'Personalized Financial Advisory & Mutual Fund Analytics',
    dataCategories: ['Income Range', 'Investment Preferences', 'Risk Appetite', 'Device Geolocation'],
    channel: 'Web Portal',
    actor: {
      type: 'CONSENT_MANAGER_API',
      name: 'Account Aggregator Gateway',
      identifier: 'API-TOKEN-AA-01'
    },
    downstreamProcessorsNotified: ['AWS ap-south-1 Mumbai', 'Snowflake Data Warehouse (India)'],
    cryptographicProofHash: 'SHA256:5507182930495867102938475610293847561029384756102938475610293847',
    previousBlockHash: 'SHA256:4496071829304958671029384756102938475610293847561029384756102938',
    statutoryClause: 'Section 6(1) & Section 6(7)',
    auditVerificationStatus: 'VERIFIED_VALID',
    notes: 'Granular consent captured via Sahamati Account Aggregator interoperability protocol.'
  },
  {
    id: 'evt_2',
    eventId: 'EVT-CSN-2026-0082',
    timestamp: '2026-04-12T10:30:00Z',
    dataPrincipalId: 'DP-IND-98421',
    principalName: 'Aarav Sharma',
    principalEmail: 'aarav.sharma@example.in',
    actionType: 'CONSENT_GRANTED',
    consentVersion: 'v2.0',
    noticeLanguage: 'Hindi (हिन्दी)',
    processingPurpose: 'Core Banking, UPI Payments & Account Management',
    dataCategories: ['Full Name', 'PAN / Aadhaar Token', 'Bank Account Details', 'Transaction History', 'IP & Device Telemetry'],
    channel: 'Mobile App (Android/iOS)',
    actor: {
      type: 'DATA_PRINCIPAL',
      name: 'Aarav Sharma',
      identifier: '49.36.112.5 (IPv4 / New Delhi)'
    },
    downstreamProcessorsNotified: ['AWS ap-south-1 Mumbai', 'Snowflake Data Warehouse (India)'],
    cryptographicProofHash: 'SHA256:4496071829304958671029384756102938475610293847561029384756102938',
    previousBlockHash: 'SHA256:3385960718293049586710293847561029384756102938475610293847561029',
    statutoryClause: 'Section 6(1)',
    auditVerificationStatus: 'VERIFIED_VALID',
    notes: 'Affirmative opt-in with biometric device attestation on Android 14 client.'
  },
  {
    id: 'evt_1',
    eventId: 'EVT-CSN-2026-0081',
    timestamp: '2026-03-20T15:30:00Z',
    dataPrincipalId: 'DP-IND-54188',
    principalName: 'Vikramaditya Patel',
    principalEmail: 'vikram.patel@example.in',
    actionType: 'CONSENT_GRANTED',
    consentVersion: 'v1.9',
    noticeLanguage: 'Gujarati (ગુજરાતી)',
    processingPurpose: 'Behavioral Ad Targeting & Analytics',
    dataCategories: ['App Session Duration', 'Browsing Telemetry', 'Referral URL'],
    channel: 'Web Portal',
    actor: {
      type: 'DATA_PRINCIPAL',
      name: 'Vikramaditya Patel',
      identifier: '115.240.18.91 (IPv4 / Ahmedabad)'
    },
    downstreamProcessorsNotified: ['Snowflake Data Warehouse (India)', 'Google Analytics Enterprise'],
    cryptographicProofHash: 'SHA256:3385960718293049586710293847561029384756102938475610293847561029',
    previousBlockHash: 'SHA256:GENESIS_BLOCK_0000000000000000000000000000000000000000000000000000',
    statutoryClause: 'Section 6(1)',
    auditVerificationStatus: 'SEALED',
    notes: 'Genesis block record for Q1-2026 user registration cohort under bilingual Gujarati/English notice.'
  }
];

// ==========================================
// GRIEVANCE & CONSENT SLA AGGREGATED QUEUE
// (Sections 6(4), 6(6), 9, and 13 DPDP Act 2023)
// ==========================================

export type DPDPSLARequestType =
  | 'CONSENT_WITHDRAWAL'      // Section 6(4) / 6(6) One-Click statutory consent withdrawal & processor stop
  | 'GRIEVANCE_COMPLAINT'     // Section 13 General Data Principal grievance
  | 'CHILDREN_VPC_DISPUTE'    // Section 9 Minor consent objection or unverified parental proxy (Expedited 7-day SLA)
  | 'ERASURE_MANDATE'         // Section 8(7) Erasure following consent revocation
  | 'PURPOSE_UNBUNDLING';     // Section 6(1) Purpose restriction / unbundling demand

export type DPDPSLAPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type DPDPSLAWorkflowStatus =
  | 'PENDING_TRIAGE'
  | 'UNDER_INVESTIGATION'
  | 'ACTION_TAKEN'
  | 'PROCESSOR_DISPATCH_PENDING'
  | 'RESOLVED';

export interface DPDPSLAQueueItem {
  id: string;
  ticketId: string;
  sourceType: DPDPSLARequestType;
  title: string;
  description: string;
  dataPrincipalId: string;
  principalName: string;
  principalEmail: string;
  principalPhone?: string;
  jurisdictionState: string;
  submissionDate: string;        // ISO 8601
  deadlineDate: string;          // ISO 8601
  totalSlaHours: number;         // e.g. 24, 48, 168 (7 days), 720 (30 days)
  priority: DPDPSLAPriority;
  status: DPDPSLAWorkflowStatus;
  assignedOfficer: string;
  statutoryClause: string;       // e.g. 'Section 6(4) & 6(6)', 'Section 13(2)', 'Section 9'
  dpbiEscalationRisk: boolean;   // Citizen eligible to report to DPBI if deadline expires
  downstreamProcessorsAffected?: string[];
  noticeLanguage?: string;
  resolutionSummary?: string;
  resolutionDate?: string;
  tags?: string[];
  notes?: string;
}

export function calculateSlaMetrics(submissionDate: string, deadlineDate: string, nowTimeMs: number) {
  const start = new Date(submissionDate).getTime();
  const end = new Date(deadlineDate).getTime();
  const totalDuration = Math.max(1, end - start);
  const elapsed = Math.max(0, nowTimeMs - start);
  const remaining = end - nowTimeMs;

  const isBreached = remaining <= 0;
  const elapsedPercent = isBreached
    ? 100
    : Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

  // Determine urgency band
  let urgencyBand: 'BREACHED' | 'CRITICAL_24H' | 'URGENT_72H' | 'HEALTHY' = 'HEALTHY';
  if (isBreached) {
    urgencyBand = 'BREACHED';
  } else if (remaining < 24 * 3600 * 1000) {
    urgencyBand = 'CRITICAL_24H';
  } else if (remaining < 72 * 3600 * 1000) {
    urgencyBand = 'URGENT_72H';
  }

  // Format countdown string
  const absRemaining = Math.abs(remaining);
  const days = Math.floor(absRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((absRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((absRemaining % (1000 * 60)) / 1000);

  let formattedCountdown = '';
  if (isBreached) {
    formattedCountdown = `OVERDUE by ${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s`;
  } else if (days > 0) {
    formattedCountdown = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  } else {
    formattedCountdown = `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  }

  return {
    isBreached,
    elapsedPercent,
    remainingMs: remaining,
    formattedCountdown,
    urgencyBand,
    daysRemaining: days,
    hoursRemaining: hours
  };
}

export const INITIAL_DPDP_SLA_QUEUE: DPDPSLAQueueItem[] = [
  {
    id: 'sla_item_1',
    ticketId: 'SLA-WTH-2026-081',
    sourceType: 'CONSENT_WITHDRAWAL',
    title: 'Statutory 1-Click Marketing Telemetry & Ad Profiling Withdrawal',
    description: 'Data Principal invoked Section 6(4) withdrawal via Android app. Downstream webhook dispatch required to stop third-party ad profiling within 24h statutory window.',
    dataPrincipalId: 'DP-IND-84210',
    principalName: 'Kavita Chawla',
    principalEmail: 'kavita.chawla@example.in',
    principalPhone: '+91 98201 44512',
    jurisdictionState: 'Maharashtra (Mumbai)',
    submissionDate: new Date(Date.now() - 21 * 3600 * 1000 - 45 * 60 * 1000).toISOString(), // 21h 45m ago
    deadlineDate: new Date(Date.now() + 2 * 3600 * 1000 + 15 * 60 * 1000).toISOString(),   // ~2h 15m remaining!
    totalSlaHours: 24,
    priority: 'CRITICAL',
    status: 'PROCESSOR_DISPATCH_PENDING',
    assignedOfficer: 'Karthik Raman (Designated Grievance Officer)',
    statutoryClause: 'Section 6(4) & Section 6(6)',
    dpbiEscalationRisk: true,
    downstreamProcessorsAffected: ['AWS ap-south-1 Mumbai', 'CleverTap APAC', 'Snowflake DW'],
    noticeLanguage: 'English',
    tags: ['Consent Withdrawal', 'Processor Cessation', 'Imminent Expiry']
  },
  {
    id: 'sla_item_2',
    ticketId: 'SLA-GRV-2026-003',
    sourceType: 'CHILDREN_VPC_DISPUTE',
    title: 'Minor (Age 15) Unverified Youth Account Consent Revocation',
    description: 'Parent discovered minor daughter registered for youth savings product without mandatory parental Aadhaar OTP verification. Demands immediate cessation and telemetry wipe.',
    dataPrincipalId: 'DP-IND-11820',
    principalName: 'Meenakshi Iyer (Parent of Ananya)',
    principalEmail: 'meenakshi.iyer@example.in',
    principalPhone: '+91 94441 22889',
    jurisdictionState: 'Tamil Nadu (Chennai)',
    submissionDate: new Date(Date.now() - 5 * 24 * 3600 * 1000 - 8 * 3600 * 1000).toISOString(), // ~5.3 days ago
    deadlineDate: new Date(Date.now() + 1 * 24 * 3600 * 1000 + 16 * 3600 * 1000).toISOString(),  // ~40 hours remaining!
    totalSlaHours: 168, // 7 days expedited children SLA
    priority: 'CRITICAL',
    status: 'UNDER_INVESTIGATION',
    assignedOfficer: 'Elena Rostova (Lead DPO)',
    statutoryClause: 'Section 9 & Section 13(2) (Expedited 7-Day SLA)',
    dpbiEscalationRisk: true,
    downstreamProcessorsAffected: ['Primary RDS (Postgres)', 'Segment Telemetry'],
    noticeLanguage: 'Tamil (தமிழ்)',
    tags: ['Children VPC', 'Expedited SLA', 'High Penalty Risk']
  },
  {
    id: 'sla_item_3',
    ticketId: 'SLA-WTH-2026-079',
    sourceType: 'CONSENT_WITHDRAWAL',
    title: 'Partner Telephony Broker Consent Withdrawal - Processor Stop Lapsed',
    description: 'Data Principal revoked marketing consent on Web portal, but telephony broker partner continued automated outbound SMS campaign. SLA window has expired.',
    dataPrincipalId: 'DP-IND-71204',
    principalName: 'Rohit Mukherjee',
    principalEmail: 'rohit.mukherjee@example.in',
    principalPhone: '+91 98300 23115',
    jurisdictionState: 'West Bengal (Kolkata)',
    submissionDate: new Date(Date.now() - 31 * 24 * 3600 * 1000).toISOString(), // 31 days ago
    deadlineDate: new Date(Date.now() - 1 * 24 * 3600 * 1000 - 6 * 3600 * 1000).toISOString(), // 30h overdue!
    totalSlaHours: 720, // 30-day statutory cap
    priority: 'CRITICAL',
    status: 'UNDER_INVESTIGATION',
    assignedOfficer: 'Karthik Raman (Designated Grievance Officer)',
    statutoryClause: 'Section 6(4) & Section 13(3) Breach',
    dpbiEscalationRisk: true,
    downstreamProcessorsAffected: ['Karix Telephony API', 'Twilio Messaging India'],
    noticeLanguage: 'Bengali (বাংলা)',
    tags: ['Overdue SLA', 'Breached', 'DPBI Escalation Active']
  },
  {
    id: 'sla_item_4',
    ticketId: 'SLA-GRV-2026-004',
    sourceType: 'GRIEVANCE_COMPLAINT',
    title: 'Demand for Machine-Readable Consent Receipt & Purpose Audit',
    description: 'Citizen requests formal MeitY-compliant JSON-LD signed consent receipt and disclosure of all external algorithmic scoring systems processing their credit profile.',
    dataPrincipalId: 'DP-IND-90114',
    principalName: 'Ananya Deshmukh',
    principalEmail: 'ananya.deshmukh@example.in',
    principalPhone: '+91 97654 32109',
    jurisdictionState: 'Maharashtra (Pune)',
    submissionDate: new Date(Date.now() - 2 * 24 * 3600 * 1000 - 4 * 3600 * 1000).toISOString(),
    deadlineDate: new Date(Date.now() + 27 * 24 * 3600 * 1000 + 20 * 3600 * 1000).toISOString(), // ~28 days remaining
    totalSlaHours: 720,
    priority: 'MEDIUM',
    status: 'PENDING_TRIAGE',
    assignedOfficer: 'Karthik Raman (Designated Grievance Officer)',
    statutoryClause: 'Section 6(7) & Section 11',
    dpbiEscalationRisk: false,
    downstreamProcessorsAffected: ['Account Aggregator Gateway'],
    noticeLanguage: 'Marathi (मराठी)',
    tags: ['Consent Receipt', 'Transparency', 'Machine-Readable']
  },
  {
    id: 'sla_item_5',
    ticketId: 'SLA-MOD-2026-014',
    sourceType: 'PURPOSE_UNBUNDLING',
    title: 'Purpose Unbundling Objection: Decouple Core KYC from Behavioral Analytics',
    description: 'Data Principal objects to forced bundling of core banking onboarding with non-essential marketing analytics. Demands unbundled affirmative consent controls under Section 6(1).',
    dataPrincipalId: 'DP-IND-54188',
    principalName: 'Vikramaditya Patel',
    principalEmail: 'vikram.patel@example.in',
    principalPhone: '+91 98250 11928',
    jurisdictionState: 'Gujarat (Ahmedabad)',
    submissionDate: new Date(Date.now() - 4 * 24 * 3600 * 1000 - 2 * 3600 * 1000).toISOString(),
    deadlineDate: new Date(Date.now() + 2 * 24 * 3600 * 1000 + 22 * 3600 * 1000).toISOString(), // ~3 days remaining
    totalSlaHours: 168, // 7 days expedited
    priority: 'HIGH',
    status: 'UNDER_INVESTIGATION',
    assignedOfficer: 'Elena Rostova (Lead DPO)',
    statutoryClause: 'Section 6(1) Specificity & Unbundled Consent',
    dpbiEscalationRisk: true,
    downstreamProcessorsAffected: ['Google Analytics 4', 'Mixpanel APAC'],
    noticeLanguage: 'Gujarati (ગુજરાતી)',
    tags: ['Purpose Unbundling', 'Section 6(1)', 'Conditional Processing']
  },
  {
    id: 'sla_item_6',
    ticketId: 'SLA-ERS-2026-088',
    sourceType: 'ERASURE_MANDATE',
    title: 'Post-Revocation Erasure Cascade & Backup Snapshot Deletion',
    description: 'Complete data erasure demanded following account closure and consent withdrawal. Legal hold evaluation cleared; awaiting certificate of destruction from cold storage vault.',
    dataPrincipalId: 'DP-IND-33918',
    principalName: 'Deepak Verma',
    principalEmail: 'deepak.verma@example.in',
    principalPhone: '+91 98110 55432',
    jurisdictionState: 'Delhi NCR',
    submissionDate: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    deadlineDate: new Date(Date.now() + 20 * 24 * 3600 * 1000).toISOString(),
    totalSlaHours: 720,
    priority: 'MEDIUM',
    status: 'ACTION_TAKEN',
    assignedOfficer: 'Karthik Raman (Designated Grievance Officer)',
    statutoryClause: 'Section 8(7) Erasure Cascade',
    dpbiEscalationRisk: false,
    downstreamProcessorsAffected: ['AWS S3 Glacier', 'Elasticsearch Cluster'],
    noticeLanguage: 'Hindi (हिन्दी)',
    tags: ['Erasure', 'Section 8(7)', 'Legal Hold Cleared']
  },
  {
    id: 'sla_item_7',
    ticketId: 'SLA-WTH-2026-092',
    sourceType: 'CONSENT_WITHDRAWAL',
    title: 'Revocation of Cross-Border Data Transfer to Singapore Processing Sub-entity',
    description: 'Data Principal exercises right under Section 16 & Section 6(4) to halt international replication of financial telemetry to AWS ap-southeast-1. Immediate local residency lock demanded.',
    dataPrincipalId: 'DP-IND-65129',
    principalName: 'Priya Sundaram',
    principalEmail: 'priya.sundaram@example.in',
    principalPhone: '+91 94440 88219',
    jurisdictionState: 'Tamil Nadu (Chennai)',
    submissionDate: new Date(Date.now() - 16 * 3600 * 1000).toISOString(), // 16h ago
    deadlineDate: new Date(Date.now() + 32 * 3600 * 1000).toISOString(),  // 32h remaining
    totalSlaHours: 48,
    priority: 'HIGH',
    status: 'PENDING_TRIAGE',
    assignedOfficer: 'Karthik Raman (Designated Grievance Officer)',
    statutoryClause: 'Section 6(4) & Section 16 Cross-Border',
    dpbiEscalationRisk: true,
    downstreamProcessorsAffected: ['AWS Singapore (ap-southeast-1)', 'Cross-Border Kafka Bus'],
    noticeLanguage: 'Tamil (தமிழ்)',
    tags: ['Cross-Border', 'Data Localization', 'Urgent 48H']
  }
];

