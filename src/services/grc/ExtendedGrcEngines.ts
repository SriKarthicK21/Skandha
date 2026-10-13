import {
  GrcVendor,
  PrivacyProcessingActivity,
  BiaRecord,
  GrcPolicy,
  GrcException,
  GrcVulnerability
} from '../../types/grcCoreTypes';

/**
 * SKANDA Extended GRC Engines
 * TPRM, Privacy (DPDP / ISO 27701), BIA, Policy & Exception Governance, Vulnerability Center
 */
export class ExtendedGrcEngines {
  // 1. TPRM
  private static vendors: GrcVendor[] = [
    {
      id: 'ven-aws',
      tenantId: 'tenant_skanda',
      code: 'VND-001',
      name: 'Amazon Web Services (AWS)',
      tier: 'TIER_1_STRATEGIC_CRITICAL',
      serviceProvided: 'Public Cloud Hosting, KMS, RDS Databases, Serverless Compute',
      dataAccessLevel: 'SYSTEM_ADMIN_ACCESS',
      securityRating: 98,
      soc2ReportAvailable: true,
      iso27001Certified: true,
      lastAssessmentDate: '2026-08-15',
      nextAssessmentDue: '2027-08-15',
      primaryContact: { name: 'AWS Enterprise Support', email: 'support@aws.amazon.com' },
      contractStatus: 'ACTIVE',
      riskScore: 2.1,
      openFindingsCount: 0,
      relatedControlIds: ['CTRL-CLD-01', 'CTRL-CRY-01']
    },
    {
      id: 'ven-okta',
      tenantId: 'tenant_skanda',
      code: 'VND-002',
      name: 'Okta Identity Cloud',
      tier: 'TIER_1_STRATEGIC_CRITICAL',
      serviceProvided: 'Enterprise Single Sign-On (SSO), Adaptive MFA, Workforce Identity Directory',
      dataAccessLevel: 'FULL_CUSTOMER_PII',
      securityRating: 95,
      soc2ReportAvailable: true,
      iso27001Certified: true,
      lastAssessmentDate: '2026-07-10',
      nextAssessmentDue: '2027-07-10',
      primaryContact: { name: 'Okta Security Team', email: 'security@okta.com' },
      contractStatus: 'ACTIVE',
      riskScore: 3.4,
      openFindingsCount: 0,
      relatedControlIds: ['CTRL-IAM-01', 'CTRL-IAM-02']
    },
    {
      id: 'ven-stripe',
      tenantId: 'tenant_skanda',
      code: 'VND-003',
      name: 'Stripe Payments Singapore Pte Ltd',
      tier: 'TIER_1_STRATEGIC_CRITICAL',
      serviceProvided: 'Global Payment Gateway, Cardholder Tokenization, Merchant Settlement',
      dataAccessLevel: 'METADATA_ONLY',
      securityRating: 99,
      soc2ReportAvailable: true,
      iso27001Certified: true,
      lastAssessmentDate: '2026-06-01',
      nextAssessmentDue: '2027-06-01',
      primaryContact: { name: 'Stripe Compliance Ops', email: 'compliance@stripe.com' },
      contractStatus: 'ACTIVE',
      riskScore: 1.8,
      openFindingsCount: 0,
      relatedControlIds: ['CTRL-CRY-01', 'CTRL-TPRM-01']
    }
  ];

  // 2. Privacy Processing Activities (ROPA)
  private static privacyActivities: PrivacyProcessingActivity[] = [
    {
      id: 'act-onboarding',
      tenantId: 'tenant_skanda',
      code: 'ROPA-001',
      name: 'Customer Digital Onboarding & KYC Identity Verification',
      purposeOfProcessing: 'Verify customer identity, perform AML/CFT checks in compliance with MAS and DPDP statutory mandates.',
      legalBasis: 'LEGAL_OBLIGATION',
      dataSubjectTypes: ['CUSTOMERS'],
      piiCategories: ['Government ID (Aadhaar / NRIC)', 'Passport Scan', 'Facial Biometrics', 'Email', 'Phone Number'],
      retentionPeriod: '5 Years post account closure (Statutory AML retention)',
      storageSystems: ['Encrypted S3 Bucket (ap-southeast-1)', 'PostgreSQL RDS Vault'],
      dataProcessors: ['ven-aws', 'ven-stripe'],
      crossBorderTransfers: false,
      dpiaRequired: true,
      dpiaStatus: 'APPROVED_LOW_RISK',
      linkedControlIds: ['CTRL-CRY-01', 'CTRL-DLP-01', 'CTRL-PRV-01']
    },
    {
      id: 'act-analytics',
      tenantId: 'tenant_skanda',
      code: 'ROPA-002',
      name: 'User Experience & Behavioral Analytics Telemetry',
      purposeOfProcessing: 'Product feature optimization and error telemetry.',
      legalBasis: 'CONSENT',
      dataSubjectTypes: ['CUSTOMERS', 'EMPLOYEES'],
      piiCategories: ['IP Address (Anonymized)', 'Device User Agent', 'Session Duration'],
      retentionPeriod: '90 Days',
      storageSystems: ['Aggregated ClickHouse Cluster'],
      dataProcessors: ['ven-aws'],
      crossBorderTransfers: true,
      dpiaRequired: false,
      dpiaStatus: 'NOT_REQUIRED',
      linkedControlIds: ['CTRL-PRV-02', 'CTRL-DLP-01']
    }
  ];

  // 3. Business Impact Analysis (BIA)
  private static biaRecords: BiaRecord[] = [
    {
      id: 'bia-core-banking',
      tenantId: 'tenant_skanda',
      processId: 'proc-fin-001',
      processName: 'Real-Time Payment Processing & Merchant Settlement Engine',
      criticalityTier: 'TIER_1_CRITICAL',
      maxTolerableDowntimeHours: 2,
      rtoHours: 1,
      rpoHours: 0.25, // 15 mins
      financialImpactPerHour: 450000,
      regulatoryImpact: 'HIGH',
      reputationalImpact: 'HIGH',
      dependentAssets: ['ast-prod-rds-cluster', 'ast-eks-cluster-prod'],
      dependentVendors: ['ven-aws', 'ven-stripe'],
      workaroundProcedures: 'Automated asynchronous payment message queueing with failover to standby warm secondary region.',
      lastAssessedAt: '2026-09-10'
    }
  ];

  // 4. Governance Policies & Exceptions
  private static policies: GrcPolicy[] = [
    {
      id: 'pol-isms-master',
      tenantId: 'tenant_skanda',
      policyCode: 'POL-SEC-001',
      title: 'Enterprise Information Security Management Policy (ISMS Master)',
      version: '3.2 (2026)',
      category: 'INFORMATION_SECURITY',
      state: 'PUBLISHED',
      owner: 'Chief Information Security Officer (CISO)',
      approver: 'Board Risk & Audit Committee',
      effectiveDate: '2026-01-01',
      nextReviewDate: '2027-01-01',
      acknowledgementRequired: true,
      acknowledgementRatePercent: 98.6,
      linkedControlIds: ['CTRL-POL-01', 'CTRL-GOV-01'],
      linkedFrameworkCodes: ['ISO_27001_2022', 'SOC_2_TYPE_2', 'MAS_TRM_2021']
    },
    {
      id: 'pol-access-control',
      tenantId: 'tenant_skanda',
      policyCode: 'POL-SEC-002',
      title: 'Workforce Logical Access & Privilege Management Policy',
      version: '2.4 (2026)',
      category: 'ACCESS_CONTROL',
      state: 'PUBLISHED',
      owner: 'Head of Identity & Access Management',
      approver: 'CISO',
      effectiveDate: '2026-02-15',
      nextReviewDate: '2027-02-15',
      acknowledgementRequired: true,
      acknowledgementRatePercent: 96.2,
      linkedControlIds: ['CTRL-IAM-01', 'CTRL-IAM-02'],
      linkedFrameworkCodes: ['ISO_27001_2022', 'NIST_CSF_2_0', 'SOC_2_TYPE_2']
    }
  ];

  private static exceptions: GrcException[] = [
    {
      id: 'exc-legacy-db-tls',
      tenantId: 'tenant_skanda',
      exceptionCode: 'EXC-2026-01',
      title: 'Temporary TLS 1.2 Grace Period for Legacy Merchant Settlement Proxy',
      reason: 'Legacy core banking partner upgrading host certificates by Q4 2026.',
      requestedBy: 'Senior Payments Integration Engineer',
      approvedBy: 'CISO / Head of Cyber Risk',
      relatedControlId: 'CTRL-CRY-01',
      compensatingControls: 'Dedicated private IPsec VPN tunnel with strict IP whitelisting and packet inspection.',
      riskAcceptedScore: 4.2,
      approvedDate: '2026-07-01',
      expiryDate: '2026-12-31',
      status: 'APPROVED_ACTIVE'
    }
  ];

  // 5. Vulnerability Center
  private static vulnerabilities: GrcVulnerability[] = [
    {
      id: 'vuln-cve-2026-1044',
      tenantId: 'tenant_skanda',
      cveId: 'CVE-2026-1044',
      title: 'Container Base Image OpenSSL Memory Leakage in Staging Ingress',
      cvssScore: 7.4,
      severity: 'HIGH',
      affectedAssetId: 'ast-eks-cluster-prod',
      scannerSource: 'TRIVY',
      status: 'REMEDIATING',
      firstDiscoveredAt: '2026-09-30T04:12:00.000Z',
      slaDueDate: '2026-10-07T04:12:00.000Z',
      linkedRiskId: 'RSK-001',
      linkedCapaId: 'CAPA-001'
    }
  ];

  public static getVendors(): GrcVendor[] { return this.vendors; }
  public static getPrivacyActivities(): PrivacyProcessingActivity[] { return this.privacyActivities; }
  public static getBiaRecords(): BiaRecord[] { return this.biaRecords; }
  public static getPolicies(): GrcPolicy[] { return this.policies; }
  public static getExceptions(): GrcException[] { return this.exceptions; }
  public static getVulnerabilities(): GrcVulnerability[] { return this.vulnerabilities; }
}
