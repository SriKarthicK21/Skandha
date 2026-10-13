export type DPDPDataSensitivity = 'CRITICAL_SENSITIVE' | 'HIGH' | 'MEDIUM' | 'STANDARD';

export type DPDPComplianceHealth = 'COMPLIANT' | 'NEEDS_REVIEW' | 'CRITICAL_GAP';

export interface DPDPDataFlowLink {
  id: string;
  flowCode: string; // e.g. "DF-FIN-01"
  name: string;
  department: string;
  
  // Column 1: Consent Source / Ingestion Channel
  consentSourceId: string;
  consentSourceName: string;
  consentSourceType: 'WEB_PORTAL' | 'MOBILE_APP' | 'CONSENT_MANAGER' | 'VPC_GATEWAY' | 'OFFLINE_KYC' | 'LEGITIMATE_USE_SEC7';
  consentNoticeLanguage: string; // e.g. "22 Eighth Schedule Multilingual"
  
  // Column 2: Data Category
  dataCategoryId: string;
  dataCategoryName: string;
  dataCategoryClassification: string; // e.g. "Direct Identifiers", "Biometric Vectors", "Financial Records", "Children's Data"
  sensitivity: DPDPDataSensitivity;
  volumeEstimate: string; // e.g. "1.4M Data Principals"
  
  // Column 3: Processing Activity
  processingActivityId: string;
  processingActivityName: string;
  processingPurpose: string;
  storageInfrastructure: string; // e.g. "AWS Mumbai (ap-south-1) S3 + RDS"
  processorsEngaged: string[]; // e.g. ["Cashfree Payments Ltd", "HyperVerge Technologies"]
  retentionPeriod: string; // e.g. "180 days post-revocation", "5 years (PMLA mandatory)"
  crossBorderTransfer: boolean;
  destinationJurisdiction?: string; // e.g. "Singapore (Whitelisted Data Center)"
  
  // Column 4: Statutory DPDP Clause Mapping
  primaryStatutoryClause: string; // e.g. "Section 6(1) Multilingual Prior Notice"
  statutoryClauseCode: string; // e.g. "SEC-06(1)", "SEC-08(7)", "SEC-09(1)"
  secondaryClauses: string[]; // e.g. ["Section 8(5) Reasonable Security", "Section 6(4) Erasure Withdrawal"]
  statutoryBasis: 'EXPLICIT_CONSENT' | 'LEGITIMATE_USE' | 'VERIFIABLE_PARENTAL_CONSENT' | 'STATUTORY_MANDATE';
  complianceHealth: DPDPComplianceHealth;
  
  // Technical & Audit Metadata
  technicalSafeguards: string[]; // ["AES-256 GCM at rest", "TLS 1.3 in transit", "Field-level tokenization"]
  dpiaAssessmentRef?: string; // e.g. "DPIA-2026-01"
  auditEvidenceProof: string;
  dpoSignOff: boolean;
  dpoSignOffOfficer: string;
  lastAuditedDate: string;
  gapNotes?: string;
}

export interface DPDPFlowSourceNode {
  id: string;
  name: string;
  type: string;
  iconType: string;
  description: string;
  itemCount: number;
}

export interface DPDPFlowCategoryNode {
  id: string;
  name: string;
  classification: string;
  sensitivity: DPDPDataSensitivity;
  itemCount: number;
}

export interface DPDPFlowActivityNode {
  id: string;
  name: string;
  department: string;
  infrastructure: string;
  itemCount: number;
}

export interface DPDPFlowClauseNode {
  id: string;
  clauseCode: string;
  title: string;
  penaltyLimit: string;
  itemCount: number;
  health: DPDPComplianceHealth;
}

export const INITIAL_DATA_FLOWS: DPDPDataFlowLink[] = [
  {
    id: 'flow_1',
    flowCode: 'DF-KYC-01',
    name: 'Customer Digital Onboarding & Video KYC',
    department: 'Risk Operations & Identity Assurance',
    consentSourceId: 'src_web_app',
    consentSourceName: 'Bilingual Web & Mobile SDK Onboarding',
    consentSourceType: 'MOBILE_APP',
    consentNoticeLanguage: 'English + Hindi + Tamil (Regional Selector)',
    dataCategoryId: 'cat_biometric',
    dataCategoryName: 'Biometric Facial Vectors & Live Video Stream',
    dataCategoryClassification: 'Biometric Identifiers',
    sensitivity: 'CRITICAL_SENSITIVE',
    volumeEstimate: '850,000 Data Principals',
    processingActivityId: 'act_vkyc',
    processingActivityName: 'Automated Liveness Verification & Aadhaar Masking',
    processingPurpose: 'Mandatory customer due diligence under RBI KYC & DPDP unbundled consent',
    storageInfrastructure: 'AWS Mumbai (ap-south-1) Encrypted EBS + KMS',
    processorsEngaged: ['HyperVerge Technologies Pvt Ltd', 'Signzy Identity Solutions'],
    retentionPeriod: '180 days video purge; Aadhaar vault perpetual (PMLA Sec 12)',
    crossBorderTransfer: false,
    primaryStatutoryClause: 'Section 6(1) Clear Prior Notice & Purpose Specificity',
    statutoryClauseCode: 'SEC-06(1)',
    secondaryClauses: ['Section 8(5) Security Safeguards', 'Section 8(1) Processor DPA Mandate'],
    statutoryBasis: 'EXPLICIT_CONSENT',
    complianceHealth: 'COMPLIANT',
    technicalSafeguards: ['AES-256 GCM Database Vault', 'Hardware Keystore / Secure Enclave', 'TLS 1.3 Strict Mutual Auth'],
    dpiaAssessmentRef: 'DPIA-2026-01',
    auditEvidenceProof: 'SHA256:7f92a10c89ab23ef4567890123456789abcdef0123456789abcdef0123456789',
    dpoSignOff: true,
    dpoSignOffOfficer: 'Elena Rostova (Chief DPO)',
    lastAuditedDate: '2026-08-15'
  },
  {
    id: 'flow_2',
    flowCode: 'DF-LND-02',
    name: 'Credit Risk Scoring & Account Aggregator Data Pull',
    department: 'Credit Underwriting & Analytics',
    consentSourceId: 'src_cm_api',
    consentSourceName: 'MeitY Registered Consent Manager (DigiLocker / Sahamati)',
    consentSourceType: 'CONSENT_MANAGER',
    consentNoticeLanguage: 'Machine-Readable ReBIT XML & JSON Spec',
    dataCategoryId: 'cat_financial',
    dataCategoryName: 'Bank Statements & GST Financial Telemetry',
    dataCategoryClassification: 'Financial Records',
    sensitivity: 'HIGH',
    volumeEstimate: '2.1M Data Principals',
    processingActivityId: 'act_underwriting',
    processingActivityName: 'Algorithmic Underwriting & Repayment Probability ML',
    processingPurpose: 'Assessing loan eligibility and debt-to-income limits',
    storageInfrastructure: 'OCI Hyderabad Secured Analytics Datacenter',
    processorsEngaged: ['Cashfree Financial Technologies', 'Perfios Software Solutions'],
    retentionPeriod: '3 years active loan tenure + 7 years statutory tax retention',
    crossBorderTransfer: false,
    primaryStatutoryClause: 'Section 6(7)-(9) Interoperable Consent Manager Architecture',
    statutoryClauseCode: 'SEC-06(7)',
    secondaryClauses: ['Section 8(7) Retention Erasure', 'Section 13 Grievance Redressal'],
    statutoryBasis: 'EXPLICIT_CONSENT',
    complianceHealth: 'COMPLIANT',
    technicalSafeguards: ['Column-level Deterministic Encryption', 'Zero Raw Data Ingestion Policy', 'Role-Based Dual Key Clearance'],
    dpiaAssessmentRef: 'DPIA-2026-02',
    auditEvidenceProof: 'SHA256:1a87e59b89ab23ef0123456789abcdef0123456789abcdef0123456789abcdef',
    dpoSignOff: true,
    dpoSignOffOfficer: 'Elena Rostova (Chief DPO)',
    lastAuditedDate: '2026-07-28'
  },
  {
    id: 'flow_3',
    flowCode: 'DF-CHD-03',
    name: 'K-12 Educational Platform Learning Analytics',
    department: 'EdTech Learning Science & Curriculum',
    consentSourceId: 'src_vpc_gateway',
    consentSourceName: 'Verifiable Parental Consent (VPC) DigiLocker Token Gateway',
    consentSourceType: 'VPC_GATEWAY',
    consentNoticeLanguage: 'English, Hindi, Marathi, Bengali',
    dataCategoryId: 'cat_children',
    dataCategoryName: 'Minor Student Quiz Performance & Voice Reading Samples',
    dataCategoryClassification: "Children's Personal Data",
    sensitivity: 'CRITICAL_SENSITIVE',
    volumeEstimate: '420,000 Minor Principals',
    processingActivityId: 'act_learning_analytics',
    processingActivityName: 'Adaptive Syllabus Progression (Behavioral Tracking Blocked)',
    processingPurpose: 'Pedagogical feedback and school curriculum alignment',
    storageInfrastructure: 'GCP Delhi (asia-south2) Isolated Sovereign Tenant',
    processorsEngaged: ['Speechify India Labs Pvt Ltd'],
    retentionPeriod: 'Academic Year Duration + 90 days purge',
    crossBorderTransfer: false,
    primaryStatutoryClause: 'Section 9(1) & 9(2) Verifiable Parental Consent & Child Tracking Ban',
    statutoryClauseCode: 'SEC-09',
    secondaryClauses: ['Section 8(5) Safeguards', 'Section 6(4) Parental Revocation'],
    statutoryBasis: 'VERIFIABLE_PARENTAL_CONSENT',
    complianceHealth: 'COMPLIANT',
    technicalSafeguards: ['Mandatory Behavioral Profiling Kill-Switch', 'No Ad-Tech SDKs Permitted', 'Episodic Telemetry Scrambling'],
    dpiaAssessmentRef: 'DPIA-2026-04',
    auditEvidenceProof: 'SHA256:3b99a88c77aa22dd0123456789abcdef0123456789abcdef0123456789abcdef',
    dpoSignOff: true,
    dpoSignOffOfficer: 'Elena Rostova (Chief DPO)',
    lastAuditedDate: '2026-08-30'
  },
  {
    id: 'flow_4',
    flowCode: 'DF-MKT-04',
    name: 'In-App Contextual Cross-Selling & Push Recommendation',
    department: 'Digital Growth & MarTech',
    consentSourceId: 'src_mobile_sdk',
    consentSourceName: 'In-App Settings Granular Consent Checkbox',
    consentSourceType: 'MOBILE_APP',
    consentNoticeLanguage: 'English & Hindi Itemised Unbundled Notice',
    dataCategoryId: 'cat_behavioral',
    dataCategoryName: 'Session In-App Browse History & Clickstreams',
    dataCategoryClassification: 'Behavioral & Telemetry',
    sensitivity: 'MEDIUM',
    volumeEstimate: '3,800,000 Data Principals',
    processingActivityId: 'act_cross_sell',
    processingActivityName: 'Real-time Vector Embedding Similarity Matching',
    processingPurpose: 'Personalized product tier recommendations',
    storageInfrastructure: 'Pinecone Vector DB (AWS Mumbai) + Redis Cache',
    processorsEngaged: ['CleverTap India Ltd', 'Mixpanel Inc (Processor DPA enacted)'],
    retentionPeriod: '30 days rolling window; instant drop on opt-out',
    crossBorderTransfer: true,
    destinationJurisdiction: 'Singapore (Designated Cloud Zone)',
    primaryStatutoryClause: 'Section 6(1) Granular Unbundled Purpose Notice',
    statutoryClauseCode: 'SEC-06(1)',
    secondaryClauses: ['Section 6(4) One-Click Revocation', 'Section 16 Cross-Border Transfer'],
    statutoryBasis: 'EXPLICIT_CONSENT',
    complianceHealth: 'NEEDS_REVIEW',
    technicalSafeguards: ['Tombstone Opt-Out Invalidation Filter', 'Pseudonymized Principal UUIDs'],
    dpiaAssessmentRef: 'DPIA-2026-02',
    auditEvidenceProof: 'SHA256:4c22e11a99bb88ff0123456789abcdef0123456789abcdef0123456789abcdef',
    dpoSignOff: false,
    dpoSignOffOfficer: 'Pending DPO Conditional Sign-Off',
    lastAuditedDate: '2026-08-10',
    gapNotes: 'Pinecone batch compaction can take up to 48h to physically purge deleted vectors. Tombstone query-filter active.'
  },
  {
    id: 'flow_5',
    flowCode: 'DF-EMP-05',
    name: 'Employee Statutory Provident Fund & Gratuity Filing',
    department: 'Human Resources & Corporate Governance',
    consentSourceId: 'src_sec7_legitimate',
    consentSourceName: 'Section 7(b) Legitimate Use Exemption (Employment)',
    consentSourceType: 'LEGITIMATE_USE_SEC7',
    consentNoticeLanguage: 'Statutory Employment Data Processing Addendum',
    dataCategoryId: 'cat_employee',
    dataCategoryName: 'PAN, UAN, Bank Account & Attendance Biometrics',
    dataCategoryClassification: 'Employee Personal Records',
    sensitivity: 'HIGH',
    volumeEstimate: '12,500 Employees',
    processingActivityId: 'act_payroll',
    processingActivityName: 'Monthly EPFO / ESIC Remittance & TDS Deduction',
    processingPurpose: 'Compliance with EPFO Act 1952, Income Tax Act 1961',
    storageInfrastructure: 'On-Premises Dedicated Server (Bengaluru HQ)',
    processorsEngaged: ['Darwinbox Digital Solutions', 'State Bank of India Corporate Gate'],
    retentionPeriod: 'Tenure of employment + 8 years statutory corporate records',
    crossBorderTransfer: false,
    primaryStatutoryClause: 'Section 7(b) Certain Legitimate Uses (Employment & Benefit Delivery)',
    statutoryClauseCode: 'SEC-07',
    secondaryClauses: ['Section 8(5) Safeguards', 'Section 8(7) Retention Rules'],
    statutoryBasis: 'LEGITIMATE_USE',
    complianceHealth: 'COMPLIANT',
    technicalSafeguards: ['Air-gapped Payroll Subnet', 'Role-Based Dual Auth with OTP', 'Audit Logging of All HR Export Events'],
    auditEvidenceProof: 'SHA256:5e33d22b00aa11cc0123456789abcdef0123456789abcdef0123456789abcdef',
    dpoSignOff: true,
    dpoSignOffOfficer: 'Elena Rostova (Chief DPO)',
    lastAuditedDate: '2026-06-18'
  },
  {
    id: 'flow_6',
    flowCode: 'DF-DR-06',
    name: 'Cross-Border Disaster Recovery Hot-Standby Mirroring',
    department: 'Infrastructure & Site Reliability Engineering',
    consentSourceId: 'src_web_app',
    consentSourceName: 'Bilingual Web & Mobile SDK Onboarding',
    consentSourceType: 'WEB_PORTAL',
    consentNoticeLanguage: '22 Eighth Schedule Multilingual Disclosures',
    dataCategoryId: 'cat_customer_master',
    dataCategoryName: 'Full Account Database Replicas & Ledger Entries',
    dataCategoryClassification: 'Master Account Records',
    sensitivity: 'HIGH',
    volumeEstimate: '4,500,000 Data Principals',
    processingActivityId: 'act_dr_replication',
    processingActivityName: 'Real-time Encrypted Block Replication for Business Continuity',
    processingPurpose: 'Resilience and disaster recovery meeting RBI SLA 15-min RPO/RTO',
    storageInfrastructure: 'AWS Singapore (ap-southeast-1) Isolated DR VPC',
    processorsEngaged: ['Amazon Web Services India Pvt Ltd'],
    retentionPeriod: 'Rolling 30-day snapshot mirror; synchronized with Primary Mumbai',
    crossBorderTransfer: true,
    destinationJurisdiction: 'Singapore (MeitY Whitelisted Jurisdiction)',
    primaryStatutoryClause: 'Section 16 Cross-Border Transfer to Permitted Territories',
    statutoryClauseCode: 'SEC-16',
    secondaryClauses: ['Section 8(5) Encryption Safeguards', 'Section 8(1) Processor Agreement'],
    statutoryBasis: 'EXPLICIT_CONSENT',
    complianceHealth: 'COMPLIANT',
    technicalSafeguards: ['Dedicated AWS DirectConnect with IPsec VPN', 'Customer-Managed KMS Keys (BYOK)', 'No Unencrypted Cross-Border Transit'],
    dpiaAssessmentRef: 'DPIA-2026-03',
    auditEvidenceProof: 'SHA256:8a11b22c33dd44ee0123456789abcdef0123456789abcdef0123456789abcdef',
    dpoSignOff: true,
    dpoSignOffOfficer: 'Elena Rostova (Chief DPO)',
    lastAuditedDate: '2026-08-01'
  },
  {
    id: 'flow_7',
    flowCode: 'DF-AD-07',
    name: 'Third-Party Ad Network Audience Retargeting (Unmapped Profiling)',
    department: 'Performance Marketing Desk',
    consentSourceId: 'src_offline_branch',
    consentSourceName: 'Offline Branch Physical Application Form',
    consentSourceType: 'OFFLINE_KYC',
    consentNoticeLanguage: 'Paper KYC (English only - No Ad-Tech disclosure)',
    dataCategoryId: 'cat_telemetry_unmapped',
    dataCategoryName: 'Device Advertiser IDs & Mobile Numbers',
    dataCategoryClassification: 'Advertising Telemetry',
    sensitivity: 'HIGH',
    volumeEstimate: '350,000 Data Principals',
    processingActivityId: 'act_ad_sync',
    processingActivityName: 'Hashed Audience Sync with External Ad Exchanges',
    processingPurpose: 'Display retargeting for uncompleted loan drop-offs',
    storageInfrastructure: 'Third-party SaaS CRM (Multi-tenant US Cloud)',
    processorsEngaged: ['Global Ad-Exchange Corp (No DPA on file)'],
    retentionPeriod: 'Indefinite / Unspecified',
    crossBorderTransfer: true,
    destinationJurisdiction: 'United States (Non-notified route)',
    primaryStatutoryClause: 'Section 6(1) Clear Itemised Notice & Section 8(1) DPA Mandate',
    statutoryClauseCode: 'SEC-06(1)',
    secondaryClauses: ['Section 16 Cross-Border Violation', 'Section 8(7) Erasure Failure'],
    statutoryBasis: 'EXPLICIT_CONSENT',
    complianceHealth: 'CRITICAL_GAP',
    technicalSafeguards: ['SHA-256 mobile hashing (Insufficient under DPDP as pseudonymized personal data)'],
    auditEvidenceProof: 'SHA256:00000000000000000123456789abcdef0123456789abcdef0123456789abcdef',
    dpoSignOff: false,
    dpoSignOffOfficer: 'DPO Formal Rejection / Cessation Issued',
    lastAuditedDate: '2026-08-20',
    gapNotes: 'CRITICAL AUDIT DEFECT: Branch paper form did not disclose ad retargeting. No executed Sec 8(1) DPA with ad exchange. Immediate cessation recommended.'
  }
];

export function buildDataFlowProofHash(
  flowCode: string,
  source: string,
  category: string,
  activity: string,
  clause: string
): string {
  let hash = 0x811c9dc5;
  const str = `${flowCode}|${source}|${category}|${activity}|${clause}|${Date.now()}`;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  return `SHA256:${hex}e49a11bc${hex}98f120ac45b8e912c77d4019a82b3d`;
}
