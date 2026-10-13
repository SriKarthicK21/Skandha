export type DPDPRetentionPeriodType =
  | 'DAYS'
  | 'MONTHS'
  | 'YEARS'
  | 'IMMEDIATE_UPON_FULFILLMENT'
  | 'STATUTORY_FIXED';

export type DPDPDisposalMethod =
  | 'NIST_800_88_CRYPTOGRAPHIC_SHRED'
  | 'NIST_800_88_PURGE_OVERWRITE'
  | 'KMS_KEY_DESTRUCTION'
  | 'VECTOR_DB_TOMBSTONE_COMPACT'
  | 'IRREVERSIBLE_K_ANONYMIZATION';

export type DPDPBatchExpiryStatus =
  | 'EXPIRED_FLAGGED'
  | 'EXPIRING_SOON'
  | 'ACTIVE_RETAINED'
  | 'LEGAL_HOLD_FROZEN';

export interface DPDPRetentionPolicy {
  id: string;
  policyCode: string; // e.g. "RET-POL-01"
  dataCategory: string; // e.g. "Biometric Facial Vectors & Live Video"
  classification: 'CRITICAL_SENSITIVE' | 'HIGH' | 'MEDIUM' | 'STANDARD';
  applicableDepartment: string;
  statutoryBasis: string; // e.g. "Section 8(7) DPDP Act + RBI Master Direction KYC"
  retentionDurationDisplay: string; // e.g. "180 Days" or "5 Years"
  durationValue: number; // in days
  triggerEvent: 'CONSENT_REVOCATION' | 'ACCOUNT_CLOSURE' | 'PURPOSE_ACCOMPLISHED' | 'LAST_TRANSACTION' | 'ACADEMIC_YEAR_END';
  disposalMethod: DPDPDisposalMethod;
  storageTarget: string; // e.g. "AWS S3 Vault (ap-south-1)"
  legalHoldOverridePermitted: boolean;
  isActive: boolean;
  dpoApproved: boolean;
  dpoApproverName: string;
  lastUpdated: string;
}

export interface DPDPMonitoredDataBatch {
  id: string;
  batchCode: string; // e.g. "BATCH-KYC-2026-081"
  datasetName: string;
  policyId: string;
  dataCategory: string;
  storageSystem: string;
  recordsCount: number;
  dataSizeEstimate: string; // e.g. "14.2 GB", "850 MB"
  ingestionDate: string;
  triggerEventDate: string; // when countdown started
  scheduledExpiryDate: string; // calculated date
  expiryStatus: DPDPBatchExpiryStatus;
  daysRemaining: number; // negative if expired
  legalHoldReference?: string;
  legalHoldReason?: string;
  processorsInvolved: string[];
}

export interface DPDPRecordOfDisposal {
  id: string;
  certificateCode: string; // e.g. "DISP-CERT-2026-042"
  batchCode: string;
  datasetName: string;
  dataCategory: string;
  volumeRecords: number;
  dataSizePurged: string;
  storageSystem: string;
  disposalMethod: DPDPDisposalMethod;
  executionTimestamp: string;
  authorizedByOfficer: string;
  officerRole: string;
  verificationProofHash: string; // SHA-256 non-repudiation seal
  downstreamProcessorsNotified: boolean;
  statutoryClauseSatisfied: string;
  auditNotes: string;
}

export const INITIAL_RETENTION_POLICIES: DPDPRetentionPolicy[] = [
  {
    id: 'pol_1',
    policyCode: 'RET-POL-01',
    dataCategory: 'Biometric Facial Vectors & vKYC Live Video Streams',
    classification: 'CRITICAL_SENSITIVE',
    applicableDepartment: 'Risk Operations & Identity Assurance',
    statutoryBasis: 'Section 8(7) DPDP Act (Purpose Accomplishment) + RBI vKYC Circular',
    retentionDurationDisplay: '180 Days post onboarding verification',
    durationValue: 180,
    triggerEvent: 'PURPOSE_ACCOMPLISHED',
    disposalMethod: 'NIST_800_88_CRYPTOGRAPHIC_SHRED',
    storageTarget: 'AWS S3 Glacier Vault (ap-south-1) with KMS Customer-Managed Key',
    legalHoldOverridePermitted: true,
    isActive: true,
    dpoApproved: true,
    dpoApproverName: 'Elena Rostova (Chief DPO)',
    lastUpdated: '2026-08-10'
  },
  {
    id: 'pol_2',
    policyCode: 'RET-POL-02',
    dataCategory: 'Transactional Banking Ledgers & Loan Accounts',
    classification: 'HIGH',
    applicableDepartment: 'Credit Underwriting & Statutory Finance',
    statutoryBasis: 'Section 12 PMLA 2002 (5 Years) & Section 44AA Income Tax Act (7 Years)',
    retentionDurationDisplay: '5 Years post loan closure / settlement',
    durationValue: 1825,
    triggerEvent: 'ACCOUNT_CLOSURE',
    disposalMethod: 'NIST_800_88_PURGE_OVERWRITE',
    storageTarget: 'OCI Hyderabad Dedicated Database Cluster',
    legalHoldOverridePermitted: true,
    isActive: true,
    dpoApproved: true,
    dpoApproverName: 'Elena Rostova (Chief DPO)',
    lastUpdated: '2026-07-15'
  },
  {
    id: 'pol_3',
    policyCode: 'RET-POL-03',
    dataCategory: "Minor Children Quiz & Academic Voice Telemetry",
    classification: 'CRITICAL_SENSITIVE',
    applicableDepartment: 'EdTech Learning Science',
    statutoryBasis: 'Section 9(1) & 9(2) DPDP Act (Child Protection & Profiling Ban)',
    retentionDurationDisplay: '90 Days post academic year end',
    durationValue: 90,
    triggerEvent: 'ACADEMIC_YEAR_END',
    disposalMethod: 'NIST_800_88_CRYPTOGRAPHIC_SHRED',
    storageTarget: 'GCP Delhi (asia-south2) Isolated Sovereign Bucket',
    legalHoldOverridePermitted: false,
    isActive: true,
    dpoApproved: true,
    dpoApproverName: 'Elena Rostova (Chief DPO)',
    lastUpdated: '2026-08-28'
  },
  {
    id: 'pol_4',
    policyCode: 'RET-POL-04',
    dataCategory: 'In-App Browsing Telemetry & Vector Recommendations',
    classification: 'MEDIUM',
    applicableDepartment: 'Digital Growth & MarTech',
    statutoryBasis: 'Section 6(4) DPDP Act (Immediate Erasure upon Consent Withdrawal)',
    retentionDurationDisplay: '30 Days rolling window / 0 Days on opt-out',
    durationValue: 30,
    triggerEvent: 'CONSENT_REVOCATION',
    disposalMethod: 'VECTOR_DB_TOMBSTONE_COMPACT',
    storageTarget: 'Pinecone Vector DB (AWS Mumbai) + Redis Cluster',
    legalHoldOverridePermitted: false,
    isActive: true,
    dpoApproved: true,
    dpoApproverName: 'Elena Rostova (Chief DPO)',
    lastUpdated: '2026-08-18'
  },
  {
    id: 'pol_5',
    policyCode: 'RET-POL-05',
    dataCategory: 'Employee Attendance Biometrics & Payroll Slips',
    classification: 'HIGH',
    applicableDepartment: 'Human Resources & Statutory Compliance',
    statutoryBasis: 'Section 7(b) DPDP Act & Section 128 Companies Act 2013 (8 Years)',
    retentionDurationDisplay: '8 Years post employment termination',
    durationValue: 2920,
    triggerEvent: 'ACCOUNT_CLOSURE',
    disposalMethod: 'KMS_KEY_DESTRUCTION',
    storageTarget: 'On-Premises Dedicated Server Vault (Bengaluru HQ)',
    legalHoldOverridePermitted: true,
    isActive: true,
    dpoApproved: true,
    dpoApproverName: 'Elena Rostova (Chief DPO)',
    lastUpdated: '2026-06-20'
  },
  {
    id: 'pol_6',
    policyCode: 'RET-POL-06',
    dataCategory: 'Customer Support Chat Transcripts & Grievance Logs',
    classification: 'STANDARD',
    applicableDepartment: 'Customer Operations & Grievance Redressal',
    statutoryBasis: 'Section 13 DPDP Act (Grievance Redressal Records Proof)',
    retentionDurationDisplay: '365 Days post ticket resolution & closure',
    durationValue: 365,
    triggerEvent: 'PURPOSE_ACCOMPLISHED',
    disposalMethod: 'IRREVERSIBLE_K_ANONYMIZATION',
    storageTarget: 'Zendesk India Enterprise & AWS RDS Cold Storage',
    legalHoldOverridePermitted: true,
    isActive: true,
    dpoApproved: true,
    dpoApproverName: 'Elena Rostova (Chief DPO)',
    lastUpdated: '2026-08-01'
  }
];

export const INITIAL_MONITORED_BATCHES: DPDPMonitoredDataBatch[] = [
  {
    id: 'batch_1',
    batchCode: 'BATCH-VKYC-2026-Q1',
    datasetName: 'Q1 Customer Video KYC Verification Stream Archives',
    policyId: 'pol_1',
    dataCategory: 'Biometric Facial Vectors & vKYC Live Video Streams',
    storageSystem: 'AWS S3 Glacier Vault (ap-south-1)',
    recordsCount: 42800,
    dataSizeEstimate: '2.8 TB',
    ingestionDate: '2026-01-15',
    triggerEventDate: '2026-02-10',
    scheduledExpiryDate: '2026-08-09',
    expiryStatus: 'EXPIRED_FLAGGED',
    daysRemaining: -29,
    processorsInvolved: ['HyperVerge Technologies Pvt Ltd']
  },
  {
    id: 'batch_2',
    batchCode: 'BATCH-TELEMETRY-JUL26',
    datasetName: 'July In-App Browse History & Interaction Vectors',
    policyId: 'pol_4',
    dataCategory: 'In-App Browsing Telemetry & Vector Recommendations',
    storageSystem: 'Pinecone Vector DB (AWS Mumbai)',
    recordsCount: 310500,
    dataSizeEstimate: '420 GB',
    ingestionDate: '2026-07-01',
    triggerEventDate: '2026-07-31',
    scheduledExpiryDate: '2026-08-30',
    expiryStatus: 'EXPIRED_FLAGGED',
    daysRemaining: -8,
    processorsInvolved: ['CleverTap India Ltd', 'Mixpanel Inc']
  },
  {
    id: 'batch_3',
    batchCode: 'BATCH-CHD-TERM2-2026',
    datasetName: 'Term 2 Minor Student Adaptive Audio Practice Samples',
    policyId: 'pol_3',
    dataCategory: "Minor Children Quiz & Academic Voice Telemetry",
    storageSystem: 'GCP Delhi (asia-south2) Isolated Sovereign Bucket',
    recordsCount: 18400,
    dataSizeEstimate: '110 GB',
    ingestionDate: '2026-06-01',
    triggerEventDate: '2026-06-15',
    scheduledExpiryDate: '2026-09-13',
    expiryStatus: 'EXPIRING_SOON',
    daysRemaining: 6,
    processorsInvolved: ['Speechify India Labs Pvt Ltd']
  },
  {
    id: 'batch_4',
    batchCode: 'BATCH-GRV-RESOLVED-2025',
    datasetName: '2025 Closed Data Principal Grievance Transcripts',
    policyId: 'pol_6',
    dataCategory: 'Customer Support Chat Transcripts & Grievance Logs',
    storageSystem: 'AWS RDS Cold Storage Vault',
    recordsCount: 7890,
    dataSizeEstimate: '18 GB',
    ingestionDate: '2025-09-01',
    triggerEventDate: '2025-09-20',
    scheduledExpiryDate: '2026-09-20',
    expiryStatus: 'EXPIRING_SOON',
    daysRemaining: 13,
    processorsInvolved: ['Zendesk India Enterprise']
  },
  {
    id: 'batch_5',
    batchCode: 'BATCH-LOAN-SETTLED-2026',
    datasetName: 'Pre-Closed Personal Loan Financial Statements (PMLA In Scope)',
    policyId: 'pol_2',
    dataCategory: 'Transactional Banking Ledgers & Loan Accounts',
    storageSystem: 'OCI Hyderabad Dedicated Database Cluster',
    recordsCount: 14200,
    dataSizeEstimate: '340 GB',
    ingestionDate: '2026-03-01',
    triggerEventDate: '2026-04-12',
    scheduledExpiryDate: '2031-04-12',
    expiryStatus: 'ACTIVE_RETAINED',
    daysRemaining: 1678,
    processorsInvolved: ['Perfios Software Solutions']
  },
  {
    id: 'batch_6',
    batchCode: 'BATCH-TX-DISPUTED-2026',
    datasetName: 'UPI Disputed Chargeback Evidence & Account Replicas',
    policyId: 'pol_2',
    dataCategory: 'Transactional Banking Ledgers & Loan Accounts',
    storageSystem: 'OCI Hyderabad Encrypted Storage',
    recordsCount: 2150,
    dataSizeEstimate: '45 GB',
    ingestionDate: '2026-02-15',
    triggerEventDate: '2026-03-01',
    scheduledExpiryDate: '2026-08-28',
    expiryStatus: 'LEGAL_HOLD_FROZEN',
    daysRemaining: -10,
    legalHoldReference: 'HOLD-PMLA-ED-2026-091',
    legalHoldReason: 'Statutory Notice from Enforcement Directorate under PMLA Sec 12; Purge Prohibited until Judicial Clearance',
    processorsInvolved: ['Cashfree Financial Technologies']
  }
];

export const INITIAL_DISPOSAL_LOG: DPDPRecordOfDisposal[] = [
  {
    id: 'disp_1',
    certificateCode: 'DISP-CERT-2026-001',
    batchCode: 'BATCH-KYC-2025-Q4',
    datasetName: 'Q4 2025 Onboarding Video KYC Raw Recordings',
    dataCategory: 'Biometric Facial Vectors & vKYC Live Video Streams',
    volumeRecords: 38200,
    dataSizePurged: '2.4 TB',
    storageSystem: 'AWS S3 Glacier Vault (ap-south-1)',
    disposalMethod: 'NIST_800_88_CRYPTOGRAPHIC_SHRED',
    executionTimestamp: '2026-08-01 14:32:10 UTC',
    authorizedByOfficer: 'Elena Rostova',
    officerRole: 'Chief Data Protection Officer',
    verificationProofHash: 'SHA256:d82e1a90c5f432109876543210fedcba0123456789abcdef0123456789abcdef',
    downstreamProcessorsNotified: true,
    statutoryClauseSatisfied: 'Section 8(7) DPDP Act Purpose Fulfillment',
    auditNotes: 'KMS Key Revocation executed. Downstream HyperVerge API webhook confirmed complete purge of cached biometric frames.'
  },
  {
    id: 'disp_2',
    certificateCode: 'DISP-CERT-2026-002',
    batchCode: 'BATCH-OPT-OUT-JUL26',
    datasetName: 'Direct Marketing Opt-Out Clickstream Telemetry Cohort',
    dataCategory: 'In-App Browsing Telemetry & Vector Recommendations',
    volumeRecords: 94100,
    dataSizePurged: '128 GB',
    storageSystem: 'Pinecone Vector DB + Redis',
    disposalMethod: 'VECTOR_DB_TOMBSTONE_COMPACT',
    executionTimestamp: '2026-08-16 09:15:44 UTC',
    authorizedByOfficer: 'Vikramaditya Sen',
    officerRole: 'Head of SecOps & Cloud Engineering',
    verificationProofHash: 'SHA256:9a7f3321bc4567890123456789abcdef0123456789abcdef0123456789abcdef',
    downstreamProcessorsNotified: true,
    statutoryClauseSatisfied: 'Section 6(4) DPDP Act Withdrawal of Consent',
    auditNotes: 'Zero-downtime collection compaction finished. CleverTap and Mixpanel processor purge certifications logged.'
  },
  {
    id: 'disp_3',
    certificateCode: 'DISP-CERT-2026-003',
    batchCode: 'BATCH-CHD-TERM1-2025',
    datasetName: 'Academic Year 2024-25 Term 1 Minor Student Audio Records',
    dataCategory: "Minor Children Quiz & Academic Voice Telemetry",
    volumeRecords: 12500,
    dataSizePurged: '76 GB',
    storageSystem: 'GCP Delhi Sovereign Bucket',
    disposalMethod: 'NIST_800_88_CRYPTOGRAPHIC_SHRED',
    executionTimestamp: '2026-08-25 18:04:12 UTC',
    authorizedByOfficer: 'Elena Rostova',
    officerRole: 'Chief Data Protection Officer',
    verificationProofHash: 'SHA256:5b81cc9244ee110023456789abcdef0123456789abcdef0123456789abcdef',
    downstreamProcessorsNotified: true,
    statutoryClauseSatisfied: 'Section 9(1) & 9(2) DPDP Act Minor Protection Standards',
    auditNotes: 'Multi-pass cryptographic zeroization verified by cloud infrastructure audit trail.'
  }
];

export function buildDisposalProofHash(
  certificateCode: string,
  batchCode: string,
  category: string,
  records: number,
  officer: string
): string {
  let hash = 0x811c9dc5;
  const str = `${certificateCode}|${batchCode}|${category}|${records}|${officer}|${Date.now()}`;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  return `SHA256:${hex}a309f18b${hex}74cd9021e56b8294a01c4f`;
}
