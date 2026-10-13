/**
 * SKANDA ENTERPRISE ONBOARDING & BUSINESS DISCOVERY DOMAIN MODEL
 * File: src/types/onboardingTypes.ts
 * 
 * Implements "CREATE ONCE -> UNDERSTAND ONCE -> REUSE EVERYWHERE"
 * Canonical types for enterprise onboarding, dynamic discovery,
 * configuration-driven questionnaire engine, role delegation, and workspace activation.
 */

import { StandardFrameworkCode } from './grcCoreTypes';

// ============================================================================
// 1. ONBOARDING SESSION & PROGRESS LIFECYCLE (DETERMINISTIC STATE MACHINE)
// ============================================================================

export type OnboardingSessionStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'PENDING_COLLABORATION'
  | 'PENDING_REVIEW'
  | 'PENDING_SCOPE_APPROVAL'
  | 'READY_FOR_ACTIVATION'
  | 'ACTIVATING'
  | 'ACTIVE'
  | 'ABANDONED'
  // Backward-compatibility aliases:
  | 'NOT_STARTED'
  | 'REVIEW'
  | 'READY_TO_ACTIVATE';

export type OnboardingStatus = OnboardingSessionStatus;

export type OnboardingRole =
  | 'CISO'
  | 'GRC_MANAGER'
  | 'IT_OWNER'
  | 'PRIVACY_OFFICER'
  | 'HR_LEAD'
  | 'BUSINESS_OWNER'
  | 'AUDITOR'
  | 'ADMIN';

export interface SectionPriorityItem {
  stepNumber: number;
  stepKey: string;
  stepTitle: string;
  priority: 'REQUIRED' | 'RECOMMENDED' | 'OPTIONAL' | 'NOT_APPLICABLE';
  relevanceRationale: string;
}

export interface OnboardingComment {
  id: string;
  tenantId: string;
  stepNumber: number;
  stepKey: string;
  fieldId?: string;
  authorEmail?: string;
  authorName: string;
  authorRole: OnboardingRole | string;
  content: string;
  mentions?: string[];
  createdAt: string;
  resolved: boolean;
  isResolved?: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface SectionAssignment {
  stepNumber: number;
  stepKey: string;
  stepTitle: string;
  assignedRole: OnboardingRole;
  assignedUserEmail: string;
  assignedUserName: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED';
  assignedAt: string;
  completedAt?: string;
  notes?: string;
  dueDate?: string;
}

export interface OnboardingSession {
  id: string;
  tenantId: string;
  organizationId: string;
  status: OnboardingSessionStatus;
  currentStep: number; // 1 to 19
  completionPercentage: number;
  completenessScore: number;
  stageProgress: Record<string, number> | StageProgressItem[];
  startedAt: string;
  lastSavedAt: string;
  completedAt?: string;
  activatedAt?: string;
  activatedBy?: string;
  assignments: SectionAssignment[];
  discoveryData: EnterpriseDiscoveryData;
  questionnaireResponses: Record<string, QuestionResponse>;
  draftScope?: GeneratedScopeStatement;
  discoveredDocuments: DiscoveredDocument[];
  auditTrail: OnboardingAuditLog[];
  comments?: OnboardingComment[];
  sectionPriorities?: SectionPriorityItem[];
  primaryActivities?: string[];
  questionnaireVersion: string;
  version: number;
}

export interface OnboardingAuditLog {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: OnboardingRole | string;
  action: string;
  stepNumber: number;
  details: Record<string, any>;
}

// ============================================================================
// 2. ENTERPRISE BUSINESS DISCOVERY DATA GRAPH
// ============================================================================

export interface OrgProfileData {
  legalName: string;
  tradingName?: string;
  registrationNumber: string;
  taxId?: string;
  industry: string;
  subIndustry?: string;
  website: string;
  country: string;
  state: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode: string;
  headquarters: string;
  operatingModel: 'ON_SITE' | 'HYBRID' | 'FULLY_REMOTE';
  organizationSize: '1-50' | '51-200' | '201-1000' | '1001-5000' | '5000+';
  totalEmployeeCount: number;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  cisoName: string;
  cisoEmail: string;
  dpoName?: string;
  dpoEmail?: string;
}

export interface SelectedProgramData {
  frameworkCode: StandardFrameworkCode | string;
  programCode: string; // e.g. "PROG-SEC-01"
  name: string;
  type: 'INFORMATION_SECURITY' | 'PRIVACY_DATA_PROTECTION' | 'AI_GOVERNANCE' | 'TECHNOLOGY_RISK_FINTECH' | 'BUSINESS_RESILIENCE' | 'ENTERPRISE_INTEGRATED';
  targetCertificationDate?: string;
  executiveSponsor: string;
  programLead: string;
  isPrimary: boolean;
}

export interface BusinessActivityItem {
  id: string;
  code: string; // e.g. "ACT-001"
  name: string; // e.g. "Cloud-native SaaS Payments Processing"
  category: 'REVENUE_GENERATING' | 'CORE_CAPABILITY' | 'SUPPORTING' | 'RESEARCH_DEV';
  description: string;
  productsAndServices: string[];
  customerTypes: ('B2B_ENTERPRISE' | 'B2C_CONSUMER' | 'GOVERNMENT' | 'FINANCIAL_INSTITUTIONS')[];
  deliveryChannels: ('WEB_SAAS' | 'MOBILE_APP' | 'API_SDK' | 'ON_PREM_DEPLOYMENT')[];
}

export interface DiscoveryProcessItem {
  id: string;
  code: string; // e.g. "PROC-001"
  name: string;
  description: string;
  businessUnit: string;
  department: string;
  processOwner: string;
  siteId: string;
  criticality: 'TIER_1_MISSION_CRITICAL' | 'TIER_2_BUSINESS_CRITICAL' | 'TIER_3_OPERATIONAL' | 'TIER_4_SUPPORT';
  frequency: 'CONTINUOUS_REALTIME' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ON_DEMAND';
  isCustomerFacing: boolean;
  processesPii: boolean;
  processesSensitiveInfo: boolean;
  isCriticalBusinessService: boolean;
  hasExternalDependencies: boolean;
  applicationsUsed: string[]; // Application IDs or names
  vendorsUsed: string[]; // Vendor IDs or names
  rtoMinutes?: number;
  rpoMinutes?: number;
}

export interface DiscoveryDepartmentItem {
  id: string;
  code: string; // e.g. "DEPT-001"
  name: string;
  headName: string;
  headEmail: string;
  location: string;
  siteId: string;
  functions: string[];
  processesOwnedIds: string[];
  processesSupportedIds: string[];
  employeeCount: number;
}

export interface DiscoverySiteItem {
  id: string;
  code: string; // e.g. "SITE-001"
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  siteType: 'HEADQUARTERS' | 'REGIONAL_OFFICE' | 'DATA_CENTER' | 'CO_LOCATION' | 'CLOUD_VPC_REGION' | 'REMOTE_HUB';
  departments: string[];
  activities: string[];
  onSiteEmployees: number;
  remoteEmployees: number;
  shiftModel: 'SINGLE_SHIFT_DAY' | 'TWO_SHIFTS' | 'THREE_SHIFTS_24_7' | 'FLEXIBLE';
  isPrimaryDc: boolean;
}

export interface DiscoveryWorkforceData {
  fullTimeEmployees: number;
  partTimeEmployees: number;
  contractors: number;
  remoteWorkforceCount: number;
  onSiteWorkforceCount: number;
  shifts: Array<{
    name: string;
    description: string;
    headcount: number;
    locations: string[];
  }>;
  departmentAllocations: Array<{
    departmentName: string;
    headcount: number;
  }>;
  securityBackgroundChecksRequired: boolean;
  securityTrainingFrequency: 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';
}

export interface DiscoveryApplicationItem {
  id: string;
  code: string; // e.g. "APP-001"
  name: string;
  purpose: string;
  businessProcess: string;
  owner: string;
  department: string;
  hostingModel: 'SAAS' | 'CLOUD_AWS' | 'CLOUD_AZURE' | 'CLOUD_GCP' | 'ON_PREMISE' | 'HYBRID';
  cloudProvider?: string;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  authenticationMethod: 'SSO_SAML_OIDC' | 'PASSWORD_MFA' | 'API_KEYS' | 'LOCAL_CREDENTIALS';
  mfaEnforced: boolean;
  processesPii: boolean;
  processesSensitiveData: boolean;
  vendorName?: string;
  environment: 'PRODUCTION' | 'STAGING' | 'DEVELOPMENT';
}

export interface DiscoveryAssetItem {
  id: string;
  code: string; // e.g. "AST-001"
  name: string;
  category: 'SERVER' | 'DATABASE' | 'ENDPOINT' | 'NETWORK_DEVICE' | 'CLOUD_RESOURCE' | 'APPLICATION' | 'API' | 'STORAGE' | 'IOT' | 'OT_ICS' | 'OTHER';
  owner: string;
  processId?: string;
  applicationId?: string;
  siteId: string;
  department: string;
  classification: 'RESTRICTED' | 'CONFIDENTIAL' | 'INTERNAL' | 'PUBLIC';
  cloudProvider?: string;
  ipOrHostname?: string;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface DiscoveryDataAssetItem {
  id: string;
  code: string; // e.g. "DAT-001"
  name: string;
  dataCategory: 'CUSTOMER_PII' | 'FINANCIAL_PAYMENT' | 'EMPLOYEE_HR' | 'INTELLECTUAL_PROPERTY' | 'HEALTH_PHI' | 'AUTH_CREDENTIALS' | 'BUSINESS_CONFIDENTIAL';
  dataOwner: string;
  processId: string;
  applicationId: string;
  storageSystems: string[];
  geographicLocations: string[];
  classification: 'RESTRICTED' | 'CONFIDENTIAL' | 'INTERNAL' | 'PUBLIC';
  isPii: boolean;
  isSensitivePersonalData: boolean;
  retentionPeriodMonths: number;
  encryptionAtRest: boolean;
  encryptionInTransit: boolean;
  sharedWithThirdParties: boolean;
  crossBorderTransfer: boolean;
  crossBorderDestinations?: string[];
  dpdpRelevant: boolean;
  gdprRelevant: boolean;
}

export interface DiscoveryVendorItem {
  id: string;
  code: string; // e.g. "VND-001"
  name: string;
  serviceCategory: string; // e.g. "Cloud Hosting", "KYC Verification", "Payroll"
  supportedProcessIds: string[];
  criticality: 'TIER_1_CRITICAL' | 'TIER_2_MAJOR' | 'TIER_3_TACTICAL' | 'TIER_4_COMMODITY';
  hasDataAccess: boolean;
  hasPiiAccess: boolean;
  hostingLocation: string;
  country: string;
  contractStatus: 'ACTIVE' | 'PENDING' | 'RENEWAL';
  dpaSigned: boolean;
  securityCertifications: string[]; // e.g. ["ISO 27001", "SOC 2 Type II", "PCI DSS"]
  assessedRiskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  primaryContactEmail: string;
}

export interface DiscoveryTechEnvironmentData {
  cloudProviders: ('AWS' | 'AZURE' | 'GCP' | 'ON_PREMISE' | 'HYBRID_COLOCATION' | 'ORACLE_CLOUD')[];
  awsDetails?: {
    regions: string[];
    coreServices: string[]; // e.g. ["EKS", "RDS Aurora", "S3", "KMS", "GuardDuty"]
    accountCount: number;
  };
  azureDetails?: {
    tenants: number;
    services: string[];
  };
  gcpDetails?: {
    projects: number;
    services: string[];
  };
  containerization: ('KUBERNETES' | 'DOCKER_ECS' | 'SERVERLESS_LAMBDA' | 'VM_BASED')[];
  databases: string[]; // e.g. ["PostgreSQL", "DynamoDB", "Redis", "Snowflake"]
  securityStack: {
    siemSolution?: string; // e.g. "Splunk / Datadog / AWS CloudWatch"
    edrSolution?: string;  // e.g. "CrowdStrike Falcon / SentinelOne"
    dlpSolution?: string;
    wafSolution?: string;  // e.g. "AWS WAF / Cloudflare Enterprise"
    iamProvider?: string;  // e.g. "Okta / Microsoft Entra ID / AWS IAM Identity Center"
    vulnerabilityManagement?: string; // e.g. "Qualys / Snyk / Trivy / AWS Inspector"
    backupFrequency: 'CONTINUOUS_REPLICATION' | 'HOURLY' | 'DAILY' | 'WEEKLY';
    drTestingFrequency: 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';
  };
  hasOtIcsSystems: boolean;
  otIcsDetails?: string;
  remoteAccessSecurity: ('MFA_VPN' | 'ZTNA_ZERO_TRUST' | 'DEVICE_CERTIFICATES' | 'MDM_ENFORCED')[];
}

export interface DiscoveryCriticalBusinessService {
  id: string;
  code: string; // e.g. "CBS-001"
  serviceName: string;
  serviceOwner: string;
  description: string;
  criticality: 'TIER_1_MISSION_CRITICAL' | 'TIER_2_BUSINESS_CRITICAL' | 'TIER_3_OPERATIONAL';
  maxTolerableDowntimeHours: number;
  targetRtoHours: number;
  targetRpoHours: number;
  dependentProcessIds: string[];
  dependentApplicationIds: string[];
  dependentDataAssetIds: string[];
  dependentSiteIds: string[];
  dependentVendorIds: string[];
  financialImpactPerHour: number;
  regulatoryImpact: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface GeneratedScopeStatement {
  id: string;
  version: number;
  title: string;
  draftText: string;
  inclusions: string[];
  exclusions: Array<{ clause: string; justification: string }>;
  boundaries: {
    physicalLocations: string[];
    cloudEnvironments: string[];
    businessUnits: string[];
    criticalServices: string[];
  };
  status: 'DRAFT_AI_GENERATED' | 'UNDER_INTERNAL_REVIEW' | 'CLIENT_APPROVED' | 'LOCKED_FOR_AUDIT';
  approvedBy?: string;
  approvedAt?: string;
  reviewNotes?: string;
}

export interface EnterpriseDiscoveryData {
  orgProfile: OrgProfileData;
  selectedPrograms: SelectedProgramData[];
  businessActivities: BusinessActivityItem[];
  businessProcesses: DiscoveryProcessItem[];
  departments: DiscoveryDepartmentItem[];
  sites: DiscoverySiteItem[];
  workforce: DiscoveryWorkforceData;
  applications: DiscoveryApplicationItem[];
  assets: DiscoveryAssetItem[];
  dataAssets: DiscoveryDataAssetItem[];
  vendors: DiscoveryVendorItem[];
  technology: DiscoveryTechEnvironmentData;
  criticalServices: DiscoveryCriticalBusinessService[];
}

// ============================================================================
// 3. CONFIGURATION-DRIVEN QUESTIONNAIRE ENGINE
// ============================================================================

export type QuestionType =
  | 'TEXT'
  | 'TEXTAREA'
  | 'NUMBER'
  | 'SELECT'
  | 'MULTI_SELECT'
  | 'RADIO'
  | 'BOOLEAN'
  | 'DATE'
  | 'TAGS'
  | 'REPEATABLE_GROUP';

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
}

export interface QuestionVisibilityRule {
  dependsOnQuestionId: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'GREATER_THAN' | 'IN_LIST' | 'PROGRAM_SELECTED';
  expectedValue: any;
}

export interface QuestionValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  customErrorMessage?: string;
}

export interface QuestionDefinition {
  id: string; // Internal ID or Field ID e.g. "1.01", "2.01", "4A", "5.1", "PIMS-01"
  fieldId?: string; // Standard questionnaire Field ID e.g. "1.01", "4A", "6.01_PII"
  section: string; // e.g. "Company & Contact Details", "IT Factors", "ISMS", "PIMS"
  subSection?: string;
  question: string;
  description?: string;
  whyWeAsk?: string;
  examples?: string[];
  helpText?: string;
  type: QuestionType;
  options?: QuestionOption[];
  required: boolean;
  order: number;
  placeholder?: string;
  visibilityRule?: QuestionVisibilityRule;
  validationRule?: QuestionValidationRule;
  dependsOn?: string[]; // IDs of questions this question depends on
  framework?: string;
  program?: string;
  industry?: string[];
  role?: OnboardingRole[];
  version?: string;
  standardFrameworkMapping?: StandardFrameworkCode[];
  canonicalTargetField?: string; // Maps directly to canonical GRC entity field
}

export interface QuestionResponse {
  id: string;
  tenantId: string;
  onboardingSessionId: string;
  questionId: string;
  value: any;
  answeredBy: string;
  answeredAt: string;
  questionnaireVersion?: string;
  version: number;
}

// ============================================================================
// 4. PROCESS TEMPLATES & INDUSTRY ACCELERATORS
// ============================================================================

export interface ProcessTemplateItem {
  id: string;
  name: string;
  category: 'ENGINEERING' | 'OPERATIONS' | 'HR' | 'FINANCE' | 'SECURITY' | 'GOVERNANCE' | 'CUSTOMER_SERVICE';
  industryRelevance: string[];
  frameworkRelevance: string[];
  defaultOwner: string;
  defaultDepartment: string;
  criticality: 'TIER_1_MISSION_CRITICAL' | 'TIER_2_BUSINESS_CRITICAL' | 'TIER_3_OPERATIONAL' | 'TIER_4_SUPPORT';
  isCustomerFacing: boolean;
  processesPii: boolean;
  processesSensitiveInfo: boolean;
  suggestedApplications: string[];
  suggestedVendors: string[];
  suggestedDataAssets: string[];
  description: string;
}

// ============================================================================
// 5. DISCOVERY COMPLETENESS & QUALITY GAPS
// ============================================================================

export interface StageProgressItem {
  stageKey: string;
  title: string;
  percentage: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  itemsCount: number;
  requiredCount: number;
  details?: string;
}

export interface DiscoveryQualityGap {
  id: string;
  entityType: 'PROCESS' | 'APPLICATION' | 'ASSET' | 'DATA_ASSET' | 'VENDOR' | 'CRITICAL_SERVICE' | 'ORG_PROFILE';
  entityId: string;
  entityCode: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  issue: string;
  recommendation: string;
}

export interface DiscoveryCompletenessReport {
  overallScore: number; // e.g. 78%
  stages: StageProgressItem[];
  stageProgress?: StageProgressItem[];
  qualityGaps: DiscoveryQualityGap[];
  missingInformationCount: number;
  nextBestActions: Array<{
    id: string;
    title: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    category: string;
    actionUrl: string;
    suggestedFix: string;
  }>;
}

// ============================================================================
// 6. CLIENT DATA IMPORT PIPELINE (CSV / EXCEL)
// ============================================================================

export interface ImportPreviewResult<T = any> {
  entityType: 'SITE' | 'APPLICATION' | 'ASSET' | 'VENDOR' | 'PROCESS';
  totalRows: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  validRecords: T[];
  invalidRows: Array<{ rowNumber: number; data: any; errors: string[] }>;
  duplicateRows: Array<{ rowNumber: number; data: any; existingCodeOrName: string }>;
}

// ============================================================================
// 7. DOCUMENT DISCOVERY & AUTOMATED REPOSITORY
// ============================================================================

export interface DiscoveredDocument {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  sha256Hash: string;
  hash?: string;
  uploadedAt: string;
  uploadedBy: string;
  documentType: 'POLICY' | 'SOA' | 'RISK_REGISTER' | 'ASSET_INVENTORY' | 'VENDOR_LIST' | 'ORG_CHART' | 'AUDIT_REPORT' | 'CERTIFICATE' | 'OTHER';
  classification?: string;
  confidenceScore: number;
  suggestedMappings?: string[];
  extractedEntities: {
    suggestedProcesses?: string[];
    suggestedApplications?: string[];
    suggestedVendors?: string[];
    suggestedControls?: string[];
    suggestedPolicies?: string[];
  };
  status: 'PENDING_EXTRACTION' | 'EXTRACTED' | 'VERIFIED' | 'REJECTED';
  verifiedBy?: string;
  notes?: string;
}

// ============================================================================
// 8. WORKSPACE ACTIVATION RESULT MODEL
// ============================================================================

export interface WorkspaceActivationSummary {
  tenantId: string;
  activatedAt: string;
  activatedBy: string;
  organizationId: string;
  counts: {
    programsActivated: number;
    businessProcessesCreated: number;
    departmentsCreated: number;
    sitesCreated: number;
    applicationsCreated: number;
    assetsCreated: number;
    dataAssetsCreated: number;
    vendorsCreated: number;
    criticalServicesCreated: number;
    initialRisksGenerated: number;
    controlsMapped: number;
    evidenceRequirementsQueued: number;
  };
  generatedEntities: {
    programCodes: string[];
    scopeStatement: string;
    initialAssessmentPlanId: string;
    nextBestActions: Array<{
      id: string;
      title: string;
      priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
      category: string;
      actionUrl: string;
      suggestedFix?: string;
    }>;
  };
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
}
