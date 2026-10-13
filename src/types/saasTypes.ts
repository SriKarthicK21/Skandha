// ============================================================================
// SKANDA ENTERPRISE GRC: HIGH-END SAAS MODEL TYPES & ENTITLEMENTS
// Path: src/types/saasTypes.ts
//
// Authoritative data contracts for Enterprise Multi-Tenancy, Subscription Tiers,
// Usage Metering, SAML/SCIM Directory Sync, API Tokens, Regional Data Residency & SLAs
// ============================================================================

export type SubscriptionTier = 'STARTER' | 'GROWTH' | 'ENTERPRISE' | 'APEX_GLOBAL';

export type BillingCycle = 'MONTHLY' | 'ANNUAL' | 'MULTI_YEAR';

export type SubscriptionStatus = 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'UPGRADED' | 'EXPIRED';

export type CloudResidencyRegion =
  | 'AWS_AP_SOUTHEAST_1' // Singapore
  | 'AWS_EU_CENTRAL_1'   // Frankfurt
  | 'AWS_US_EAST_1'      // N. Virginia
  | 'GCP_ASIA_SOUTH_1'   // Mumbai
  | 'AZURE_AP_EAST_1';   // Tokyo

export interface CloudRegionInfo {
  id: CloudResidencyRegion;
  name: string;
  location: string;
  flag: string;
  provider: 'AWS' | 'GCP' | 'AZURE';
  latencyMs: number;
  dataResidencyLaw: string;
  complianceBadges: string[];
  status: 'OPERATIONAL' | 'DEGRADED';
}

export interface SaaSEntitlements {
  maxFrameworks: number; // -1 for unlimited
  maxUsers: number;
  maxAuditorSeats: number;
  storageQuotaGb: number;
  monthlyTelemetryEventsQuota: number;
  aiStudioMonthlyTokens: number;
  allowCustomFrameworks: boolean;
  allowWormCryptographicSeal: boolean;
  allowAutonomousInterviews: boolean;
  allowCrossRegulatoryHarmonizer: boolean;
  allowPostQuantumLedger: boolean;
  allowBrandGuardEASM: boolean;
  allowDedicatedVpcBringYourOwnKms: boolean;
  allowSsoSamlScim: boolean;
  allowCustomBranding: boolean;
  allowWebhookStreaming: boolean;
  supportSlaHours: number;
}

export interface SaaSUsageMeters {
  storageUsedGb: number;
  telemetryEventsThisMonth: number;
  aiTokensUsedThisMonth: number;
  activeUsersCount: number;
  activeControlsMonitored: number;
  activeAuditorSeats: number;
  apiCallsThisMonth: number;
  lastUpdated: string;
}

export interface SaaSInvoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  currency: 'USD' | 'SGD' | 'EUR' | 'GBP';
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  planName: string;
  billingPeriod: string;
  paymentMethod: string;
  pdfDownloadUrl?: string;
}

export interface SaaSSingleSignOnConfig {
  enabled: boolean;
  provider: 'OKTA' | 'AZURE_AD' | 'PING_IDENTITY' | 'GOOGLE_WORKSPACE' | 'CUSTOM_SAML';
  idpIssuerUrl: string;
  ssoLoginUrl: string;
  idpCertificateFingerprint: string;
  jitProvisioningEnabled: boolean;
  scimEnabled: boolean;
  scimEndpointUrl: string;
  scimBearerToken: string;
  enforceSsoForDomain: boolean;
  allowedDomains: string[];
}

export interface SaaSApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  maskedSecret: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
  status: 'ACTIVE' | 'REVOKED';
}

export interface SaaSWebhookEndpoint {
  id: string;
  url: string;
  eventSubscriptions: string[];
  secret: string;
  status: 'HEALTHY' | 'FAILED' | 'DISABLED';
  lastDeliveryStatus?: string;
  lastDeliveryAt?: string;
}

export interface SaaSCustomBranding {
  companyLogoUrl?: string;
  brandPrimaryColor: string;
  brandAccentColor: string;
  customDomain: string;
  customDomainStatus: 'PENDING_DNS' | 'VERIFIED' | 'SSL_ACTIVE';
  cnameTarget: string;
  reportWatermarkText?: string;
  customFaviconUrl?: string;
}

export interface SaaSSlaHealth {
  systemUptimePercentage: number;
  telemetryIngestionStatus: 'OPERATIONAL' | 'DEGRADED';
  wormLedgerStatus: 'OPERATIONAL' | 'DEGRADED';
  aiCopilotStatus: 'OPERATIONAL' | 'DEGRADED';
  databaseReplicationLagMs: number;
  activeIncidentsCount: number;
  lastMaintenanceWindow: string;
  nextScheduledMaintenance: string;
}

export interface SaaSAddOn {
  id: string;
  name: string;
  code: string;
  description: string;
  priceMonthlyUsd: number;
  category: 'SECURITY' | 'COMPLIANCE' | 'AI' | 'INFRASTRUCTURE';
  enabled: boolean;
  badge?: string;
}

export interface TenantSaaSProfile {
  tenantId: string;
  tier: SubscriptionTier;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cloudRegion: CloudResidencyRegion;
  entitlements: SaaSEntitlements;
  usageMeters: SaaSUsageMeters;
  ssoConfig: SaaSSingleSignOnConfig;
  apiKeys: SaaSApiKey[];
  webhooks: SaaSWebhookEndpoint[];
  customBranding: SaaSCustomBranding;
  invoices: SaaSInvoice[];
  addOns: SaaSAddOn[];
}

// ============================================================================
// PHASE 16: ENTERPRISE TENANT ADMINISTRATION & CUSTOMER SUCCESS TYPES
// ============================================================================

export type TenantLifecycleStatus =
  | 'PROVISIONING'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'GRACE_PERIOD'
  | 'OFFBOARDING'
  | 'ARCHIVED';

export type CustomerHealthStatus = 'HEALTHY' | 'WATCH' | 'AT_RISK' | 'CRITICAL';

export type RenewalStatus =
  | 'NOT_STARTED'
  | 'UPCOMING'
  | 'IN_REVIEW'
  | 'RENEWAL_NEGOTIATION'
  | 'RENEWED'
  | 'CHURN_RISK'
  | 'CHURNED';

export type SupportCategory =
  | 'TECHNICAL'
  | 'BILLING'
  | 'SECURITY'
  | 'IDENTITY'
  | 'INTEGRATION'
  | 'GRC'
  | 'DATA'
  | 'ACCOUNT';

export type SupportPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type SupportCaseStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_ON_CUSTOMER'
  | 'RESOLVED'
  | 'CLOSED';

export interface SupportCase {
  id: string;
  tenantId: string;
  category: SupportCategory;
  priority: SupportPriority;
  subject: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  ownerEmail: string;
  status: SupportCaseStatus;
  targetSlaHours: number;
  slaBreached: boolean;
  resolutionNotes?: string;
}

export interface TenantTeam {
  id: string;
  tenantId: string;
  name: string;
  department: string;
  leadEmail: string;
  memberEmails: string[];
  ownedProcessIds?: string[];
  ownedControlIds?: string[];
  ownedRiskIds?: string[];
  ownedDocIds?: string[];
}

export type EnterpriseRole =
  | 'CISO'
  | 'GRC_MANAGER'
  | 'AUDITOR'
  | 'CONTROL_OWNER'
  | 'RISK_OWNER'
  | 'PROCESS_OWNER'
  | 'SME'
  | 'EMPLOYEE'
  | 'TENANT_ADMIN'
  | 'SKANDA_PLATFORM_ADMIN';

export interface TenantUser {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: EnterpriseRole;
  teamIds: string[];
  status: 'ACTIVE' | 'INVITED' | 'INACTIVE' | 'DEACTIVATED';
  authMethod: 'SAML_SSO' | 'SCIM_SYNCED' | 'LOCAL_MFA';
  lastLoginAt?: string;
  createdAt: string;
}

export interface CustomerHealthBreakdown {
  platformActivityScore: number;     // 0-100
  userAdoptionScore: number;         // 0-100
  frameworkAdoptionScore: number;    // 0-100
  evidenceActivityScore: number;     // 0-100
  controlTestingScore: number;       // 0-100
  integrationHealthScore: number;    // 0-100
  usageQuotaScore: number;           // 0-100
  openCriticalIssuesCount: number;
  onboardingProgressPercentage: number;
  supportTicketsOpenCount: number;
  daysToRenewal: number;
}

export interface CustomerHealthScore {
  overallScore: number; // 0-100
  status: CustomerHealthStatus;
  breakdown: CustomerHealthBreakdown;
  reasons: string[]; // Explainable factors: e.g. "Low telemetry volume in last 14d"
  // Internal-only fields: strictly hidden from Customer Tenant views
  internalSuccessNotes?: string;
  expansionOpportunities?: string[];
  churnRiskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface RenewalRecord {
  contractStartDate: string;
  contractEndDate: string;
  renewalDate: string;
  tier: SubscriptionTier;
  annualRecurringRevenueUsd: number;
  currentUsageStorageGb: number;
  currentUsageTelemetryMonthly: number;
  healthStatus: CustomerHealthStatus;
  openCriticalIssuesCount: number;
  expansionPotentialUsd: number;
  status: RenewalStatus;
  assignedCustomerSuccessManager: string;
}

export interface TenantProvisioningDraft {
  tenantId: string;
  currentStep: number; // 1 to 12
  completedSteps: number[];
  organization: {
    name: string;
    orgId: string;
    legalName: string;
    industry: string;
    country: string;
    timezone: string;
    locale: string;
  };
  cloudRegion: CloudResidencyRegion;
  dataResidency: {
    primaryRegion: CloudResidencyRegion;
    backupRegion: CloudResidencyRegion;
    legalJurisdiction: string;
    enforceLocalWormOnly: boolean;
  };
  subscription: {
    tier: SubscriptionTier;
    billingCycle: BillingCycle;
  };
  tenantAdmin: {
    email: string;
    name: string;
    title: string;
  };
  identity: {
    ssoEnabled: boolean;
    idpType?: 'OKTA' | 'AZURE_AD' | 'PING_IDENTITY' | 'GOOGLE_WORKSPACE' | 'CUSTOM_SAML';
    scimEnabled: boolean;
  };
  frameworkCodes: string[];
  branding: {
    brandPrimaryColor: string;
    customDomain?: string;
  };
  integrations: {
    enabledConnectors: string[];
  };
  validationState: {
    isValid: boolean;
    blockers: string[];
  };
  updatedAt: string;
}

export interface CustomerExitCertificate {
  certificateId: string;
  tenantId: string;
  legalName: string;
  exportDate: string;
  dataScope: string[];
  retentionPolicySummary: string;
  archiveStatus: 'ARCHIVED_IMMUTABLE' | 'PURGED_SANITIZED';
  approverEmail: string;
  sha256MasterHash: string;
}

export type QuotaPolicyAction = 'BLOCK' | 'THROTTLE' | 'OVERAGE' | 'REQUEST_UPGRADE';

export interface IntegrationHealthRecord {
  connectorId: string;
  name: string;
  category: 'CLOUD' | 'IDP' | 'ITSM' | 'SIEM' | 'EDR' | 'SCANNER';
  status: 'HEALTHY' | 'DEGRADED' | 'FAILED' | 'NOT_CONFIGURED' | 'EXPIRED';
  lastSyncAt?: string;
  lastSyncEventsCount?: number;
  errorDetails?: string;
}

export interface CanonicalTenant {
  tenantId: string;
  organizationId: string;
  legalName: string;
  displayName: string;
  industry: string;
  country: string;
  region: CloudResidencyRegion;
  dataResidencyJurisdiction: string;
  timezone: string;
  locale: string;
  status: TenantLifecycleStatus;
  tier: SubscriptionTier;
  billingCycle: BillingCycle;
  tenantAdminEmail: string;
  createdAt: string;
  activatedAt?: string;
  lastActivityAt: string;
  healthStatus: CustomerHealthStatus;
  healthScore: CustomerHealthScore;
  enabledFrameworkCodes: string[];
  activeComplianceProgramIds: string[];
  teams: TenantTeam[];
  users: TenantUser[];
  saasProfile: TenantSaaSProfile;
  supportCases: SupportCase[];
  renewal: RenewalRecord;
  integrationHealth: IntegrationHealthRecord[];
  offboardingRecord?: {
    offboardingId: string;
    status: 'REQUESTED' | 'IN_PROGRESS' | 'DATA_EXPORTED' | 'SERVICES_DISABLED' | 'ARCHIVED';
    requestedAt: string;
    completedAt?: string;
    certificate?: CustomerExitCertificate;
  };
}

// ============================================================================
// PHASE 17: CUSTOMER LIFECYCLE, CONTRACTS, BILLING & PLATFORM GOVERNANCE
// ============================================================================

export type CustomerLifecycleState =
  | 'PROSPECT'
  | 'QUALIFIED'
  | 'CONTRACT_PENDING'
  | 'CONTRACTED'
  | 'PROVISIONING'
  | 'ACTIVE'
  | 'ADOPTION'
  | 'VALUE_REALIZED'
  | 'RENEWAL_DUE'
  | 'RENEWED'
  | 'UPGRADE_PENDING'
  | 'DOWNGRADE_PENDING'
  | 'EXPANSION'
  | 'AT_RISK'
  | 'GRACE_PERIOD'
  | 'SUSPENDED'
  | 'OFFBOARDING'
  | 'ARCHIVED';

export type ContractStatus =
  | 'DRAFT'
  | 'NEGOTIATION'
  | 'PENDING_SIGNATURE'
  | 'ACTIVE'
  | 'EXPIRING'
  | 'RENEWED'
  | 'TERMINATED'
  | 'EXPIRED';

export interface EnterpriseContract {
  id: string;
  tenantId: string;
  contractNumber: string;
  status: ContractStatus;
  startDate: string;
  endDate: string;
  renewalDate: string;
  autoRenewal: boolean;
  noticePeriodDays: number;
  committedArrUsd: number;
  tier: SubscriptionTier;
  contractedFrameworksCount: number;
  contractedUsersCount: number;
  contractedStorageGb: number;
  contractedEventsMonthly: number;
  contractedAiTokensMonthly: number;
  contractedAddOnCodes: string[];
  dataResidencyCommitment: CloudResidencyRegion;
  slaHoursCommitment: number;
  serviceCreditsEarnedUsd: number;
  dpaExecuted: boolean;
  securityCommitmentsSummary: string;
  createdAt: string;
  updatedAt: string;
}

export type CanonicalInvoiceStatus =
  | 'DRAFT'
  | 'FINALIZED'
  | 'ISSUED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'OVERDUE'
  | 'GRACE_PERIOD'
  | 'SUSPENSION_REVIEW'
  | 'SUSPENDED';

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPriceUsd: number;
  amountUsd: number;
  category: 'BASE_SUBSCRIPTION' | 'ADDON' | 'STORAGE_OVERAGE' | 'TELEMETRY_OVERAGE' | 'AI_OVERAGE' | 'SERVICE_CREDIT';
}

export interface CanonicalInvoice {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: CanonicalInvoiceStatus;
  subtotalUsd: number;
  taxAmountUsd: number;
  creditAppliedUsd: number;
  totalAmountUsd: number;
  currency: 'USD' | 'SGD' | 'EUR' | 'GBP';
  lineItems: InvoiceLineItem[];
  paymentMethod: string;
  paidAt?: string;
  finalizedAt?: string;
  pdfDownloadUrl?: string;
}

export interface UsageSnapshot {
  id: string;
  tenantId: string;
  snapshotTimestamp: string;
  billingPeriod: string;
  activeUsers: number;
  monitoredControls: number;
  evidenceStorageGb: number;
  wormStorageGb: number;
  telemetryEventsCount: number;
  apiRequestsCount: number;
  aiTokensConsumed: number;
  activeConnectorsCount: number;
  isOverageDetected: boolean;
  overageDetails?: {
    storageGbOverage: number;
    telemetryEventsOverage: number;
    aiTokensOverage: number;
  };
}

export interface BillingEvent {
  id: string;
  tenantId: string;
  eventType:
    | 'SUBSCRIPTION_CREATED'
    | 'SUBSCRIPTION_UPGRADED'
    | 'SUBSCRIPTION_DOWNGRADED'
    | 'ADDON_ACTIVATED'
    | 'ADDON_REMOVED'
    | 'USAGE_OVERAGE'
    | 'INVOICE_GENERATED'
    | 'INVOICE_PAID'
    | 'PAYMENT_FAILED'
    | 'GRACE_PERIOD_STARTED'
    | 'SUSPENSION_TRIGGERED';
  quantity: number;
  amountUsd: number;
  timestamp: string;
  correlationId: string;
  auditProvenanceHash: string;
}

export interface CustomerSuccessPlan {
  id: string;
  tenantId: string;
  assignedCsm: string;
  overallAdoptionTargetPercent: number;
  currentAdoptionPercent: number;
  milestones: Array<{
    id: string;
    title: string;
    targetDate: string;
    completedDate?: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
    owner: string;
  }>;
  blockers: string[];
  auditReadinessTargetDate: string;
  updatedAt: string;
}

export interface RenewalOpportunity {
  id: string;
  tenantId: string;
  contractEndDate: string;
  daysToRenewal: number;
  renewalRiskScore: number; // 0-100
  riskReasons: string[];
  expansionRecommendation?: string;
  expansionArrPotentialUsd: number;
  status: 'IDENTIFIED' | 'IN_REVIEW' | 'CSM_ENGAGED' | 'PROPOSAL_SENT' | 'RENEWED' | 'CHURNED';
}

export interface PlatformOperationsOverview {
  totalTenantsCount: number;
  activeTenantsCount: number;
  totalArrUsd: number;
  totalMrrUsd: number;
  expansionPipelineUsd: number;
  churnRiskTenantsCount: number;
  averagePortfolioHealthScore: number;
  upcomingRenewals90DaysCount: number;
  openCriticalIncidentsCount: number;
  activeSlaBreachesCount: number;
}

export * from './serviceManagementTypes';


