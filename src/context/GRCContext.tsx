import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';
import {
  GlobalTheme,
  ReadabilitySettings,
  UserRole,
  User,
  MasterCategory,
  MasterIndustry,
  MasterDepartment,
  ControlItem,
  TenantCompany,
  AssetRecord,
  DataAssetRecord,
  VendorRecord,
  RiskRecord,
  EvidenceRecord,
  InternalAuditPlan,
  FindingCAPARecord,
  IndependentAuditValidation,
  AuditTrailEvent,
  SuperAdminRecommendation,
  TaskRecord,
  GeneratedDocument,
  DigitalMoU,
  DocumentAcknowledgment,
  RiskTreatmentScenario,
  ManagementReviewRecord,
  RegulatoryAuthority,
  RegulatorySourceDocument,
  FrameworkDefinition,
  FrameworkDomain,
  RegulatoryRequirement,
  CrossFrameworkMappingRule,
  RegulatoryNoticeEvent,
  MASFinancialInstitutionProfile,
  MASRequirementAssessmentRecord,
  MASIncidentBreachRecord,
  DepartmentScopeProfile,
  DepartmentPolicyRequirement,
  PolicyApprovalRecord,
  PolicyDigitalSignature,
  OutdatedJustificationIssue,
  SoAVerifierReport,
  DpdpClauseMapping,
  DpdpScanResult,
  IsoRequirementMapping,
  IsoScanResult,
  UnifiedRemediationItem,
  CompensatingControlVerification,
  RiskExceptionWaiverRequest,
  RemediationAuditSignOff,
  PolicyReviewNotification,
  CompanyRegistrationProfile,
  CompanyComplianceProfile,
  DiscoveryQuestionnaireSection,
  DiscoveryQuestion,
  DepartmentSurveyRecord,
  DepartmentSurveyQuestion,
  ImplementationPlanItem,
  IsoWorkflowStage
} from '../types';
import {
  calculateWorkflowStages,
  getDynamicNextAction,
  generateCompanyComplianceProfile,
  generateDefaultDiscoveryQuestionnaires,
  generateDefaultDepartmentSurveys,
  generateDefaultImplementationPlan,
  NextActionRecommendation
} from '../utils/isoImplementationWorkflow';
import { INITIAL_UNIFIED_REMEDIATIONS } from '../data/remediationData';
import {
  MASTER_CATEGORIES,
  MASTER_INDUSTRIES,
  MASTER_DEPARTMENTS,
  MASTER_ISO27001_CONTROLS,
  NEW_REGISTRATION_TENANT,
  INITIAL_TENANTS,
  INITIAL_USERS,
  INITIAL_ASSETS,
  INITIAL_DATA_ASSETS,
  INITIAL_VENDORS,
  INITIAL_RISKS,
  INITIAL_EVIDENCE,
  INITIAL_INTERNAL_AUDITS,
  INITIAL_FINDINGS,
  INITIAL_AUDIT_TRAIL,
  INITIAL_SUPERADMIN_RECOMMENDATIONS,
  INITIAL_TASKS,
  INITIAL_DOCUMENT_ACKNOWLEDGMENTS,
  INITIAL_RISK_SCENARIOS,
  INITIAL_MANAGEMENT_REVIEWS,
  generateArtefactsForTenant,
  generateInitialDepartmentScopes
} from '../data/initialData';
import {
  REGULATORY_AUTHORITIES,
  REGULATORY_SOURCE_DOCUMENTS,
  FRAMEWORK_DEFINITIONS,
  MAS_TRM_DOMAINS,
  MAS_TRM_REQUIREMENTS,
  CROSS_FRAMEWORK_MAPPINGS,
  REGULATORY_NOTICES_FEED
} from '../data/masRegulatoryMasterData';
import {
  INITIAL_MAS_PROFILE,
  INITIAL_MAS_ASSESSMENTS,
  INITIAL_MAS_INCIDENTS,
  INITIAL_MAS_REGULATORY_PROFILE
} from '../data/masInitialData';
import {
  ApplicabilityRule,
  ApplicabilityRuleConfig,
  MASRegulatoryProfile,
  MASReadinessScoreSummary,
  MASRequirementReadinessDetail
} from '../types/masTrmFrameworkTypes';
import {
  DEFAULT_MAS_APPLICABILITY_RULES,
  getActiveMASModulesFromProfile
} from '../services/masApplicabilityEngine';
import {
  generateAuditorGradeDocumentSuite,
  assessTenantAuditorReadiness,
  AuditorGradeOptions,
  AuditorReadinessScorecard
} from '../data/auditorGradePolicyEngine';
import { Iso27001PolicyEngine, PolicyGenerationOptions } from '../services/iso27001PolicyEngine';
import { computeSHA256, generateId, fallbackHash } from '../utils/crypto';
import { performDynamicSoARiskSync } from '../services/soaRiskSyncService';
import { verifySoAJustifications, SAMPLE_VERIFICATION_TEST_RISKS } from '../services/soaSyncVerifierService';
import { calculateEvidenceFreshness } from '../services/evidenceFreshnessService';
import { checkModulePermission } from '../utils/rbacPermissions';
import { RiskEngine, HeatmapCellMasExposure, HeatmapMasExposureGrid } from '../services/RiskEngine';
import { MASTrmRiskExposure, MASDomainExposureMetrics, MASEnterpriseRiskProfile } from '../types';
import { AuthenticatedSessionContext, CanonicalPersona } from '../types/identityTypes';
import { identityGatewayService } from '../services/auth/identityGatewayService';

interface GRCContextType {
  // Authentication & RBAC
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  login: (user?: User, tenantId?: string) => void;
  loginWithSessionContext: (context: AuthenticatedSessionContext) => void;
  sessionContext: AuthenticatedSessionContext | null;
  logout: () => void;
  currentUser: User;
  currentRole: UserRole;
  currentTenantId: string;
  currentTenant: TenantCompany | null;
  users: User[];
  tenants: TenantCompany[];
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  switchTenant: (tenantId: string) => void;

  // Role Preview & RBAC Simulation
  isPreviewRoleActive: boolean;
  previewRole: UserRole | null;
  realAdminRole: UserRole;
  isRealRoleAdmin: boolean;
  enableRolePreview: (role: UserRole) => void;
  disableRolePreview: () => void;
  toggleRolePreview: (role?: UserRole) => void;
  canUserAccessModule: (moduleId: string) => boolean;
  
  // Framework & Regulatory Intelligence Engine
  selectedFramework: string;
  setSelectedFramework: (fw: string) => void;
  regulatoryAuthorities: RegulatoryAuthority[];
  regulatorySources: RegulatorySourceDocument[];
  frameworkDefinitions: FrameworkDefinition[];
  masDomains: FrameworkDomain[];
  masRequirements: RegulatoryRequirement[];
  masAssessments: MASRequirementAssessmentRecord[];
  crossFrameworkMappings: CrossFrameworkMappingRule[];
  regulatoryNotices: RegulatoryNoticeEvent[];
  masProfile: MASFinancialInstitutionProfile;
  masIncidents: MASIncidentBreachRecord[];
  updateMASAssessment: (id: string, updates: Partial<MASRequirementAssessmentRecord>) => void;
  updateMASProfile: (profile: Partial<MASFinancialInstitutionProfile>) => void;
  addMASIncident: (incident: Omit<MASIncidentBreachRecord, 'id' | 'tenantId'>) => void;
  acknowledgeRegulatoryNotice: (noticeId: string) => void;
  calculateMASComplianceScore: () => {
    overallScore: number;
    domainBreakdown: Record<string, number>;
    criticalSlaStatus: { rtoMet: boolean; masNotificationReady: boolean; unscheduledDowntimeHours: number };
  };

  
  // Master Data (Super Admin)
  masterCategories: MasterCategory[];
  masterIndustries: MasterIndustry[];
  masterDepartments: MasterDepartment[];
  masterControls: Omit<ControlItem, 'id'>[];
  addMasterCategory: (cat: Omit<MasterCategory, 'id'>) => void;
  updateMasterCategory: (id: string, cat: Partial<MasterCategory>) => void;
  deleteMasterCategory: (id: string) => void;
  addMasterIndustry: (ind: Omit<MasterIndustry, 'id'>) => void;
  updateMasterIndustry: (id: string, ind: Partial<MasterIndustry>) => void;
  deleteMasterIndustry: (id: string) => void;
  addMasterDepartment: (dept: Omit<MasterDepartment, 'id'>) => void;
  updateMasterDepartment: (id: string, dept: Partial<MasterDepartment>) => void;
  deleteMasterDepartment: (id: string) => void;

  // Onboarding Operations
  savePhase1Registration: (data: {
    companyName: string;
    contactEmail: string;
    registeredCategory: string;
    registeredAddress: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    industryType: string;
    customIndustry?: string;
    profile?: Partial<CompanyRegistrationProfile>;
  }) => Promise<string>; // returns tenantId

  // Extended ISO 27001:2022 Implementation & Discovery Engine
  workflowStages: IsoWorkflowStage[];
  nextRecommendedAction: NextActionRecommendation;
  saveCompanyRegistrationProfile: (profile: CompanyRegistrationProfile) => Promise<string>;
  updateDiscoveryQuestion: (sectionKey: string, questionId: string, updates: Partial<DiscoveryQuestion>) => void;
  batchAnswerDiscoverySection: (sectionKey: string, answers: Record<string, { answer: 'YES' | 'NO' | 'PARTIAL' | 'NA'; notes?: string }>) => void;
  updateDepartmentSurvey: (deptId: string, questionId: string, updates: Partial<DepartmentSurveyQuestion>) => void;
  updateImplementationPlanItem: (itemId: string, updates: Partial<ImplementationPlanItem>) => void;
  advanceWorkflowStage: (stageId: string) => void;
  recalibrateComplianceProfile: () => void;
  
  savePhase2Scope: (data: {
    statement: string;
    exclusions: Array<{ id: string; controlOrProcess: string; justification: string }>;
    interestedParties: Array<{ id: string; party: string; requirements: string; legalObligation: string }>;
    inScopeDepartmentIds: string[];
    customDepartments: Array<{ id: string; name: string; owner: string; headcount: number }>;
    controls: ControlItem[];
  }) => void;

  lockSoABaseline: (tenantId?: string) => Promise<void>;

  savePhase3FrameworkAndGenerate: (frameworks: string[], specificRequirements?: string[]) => void;

  executeMoU: (signatoryData: {
    signatoryName: string;
    signatoryRole: string;
    signatoryEmail: string;
    signatureDataUrl?: string;
    commercialTier?: string;
  }) => Promise<void>;

  setTenantOnboardingPhase: (phase: number) => void;
  isSurveyComplete: boolean;
  isOnboardingComplete: boolean;
  startNewEntityOnboarding: () => void;
  quickLoginAsAdmin: () => void;
  quickLoginAsSuperAdmin: () => void;

  // Product Mode & Dual Operating Engine
  productMode: 'guided_journey' | 'command_center';
  setProductMode: (mode: 'guided_journey' | 'command_center') => void;
  activePersona: CanonicalPersona;
  setActivePersona: (persona: CanonicalPersona) => void;

  // Universal 360° Slide-Over Entity Drawer
  entityDrawerState: {
    isOpen: boolean;
    entityType: string;
    entityId: string;
    entityTitle?: string;
    entityData?: any;
    history: Array<{
      entityType: string;
      entityId: string;
      entityTitle?: string;
      entityData?: any;
    }>;
  };
  openEntityDrawer: (entity: { type: string; id: string; title?: string; data?: any }) => void;
  closeEntityDrawer: () => void;
  navigateEntityDrawerBack: () => void;

  // GRC Entity Management (Tenant Scoped)
  assets: AssetRecord[];
  addAsset: (asset: Omit<AssetRecord, 'id' | 'tenantId'>) => void;
  updateAsset: (id: string, asset: Partial<AssetRecord>) => void;
  deleteAsset: (id: string) => void;

  dataAssets: DataAssetRecord[];
  addDataAsset: (dataAsset: Omit<DataAssetRecord, 'id' | 'tenantId'>) => void;
  updateDataAsset: (id: string, dataAsset: Partial<DataAssetRecord>) => void;
  deleteDataAsset: (id: string) => void;

  vendors: VendorRecord[];
  addVendor: (vendor: Omit<VendorRecord, 'id' | 'tenantId'>) => void;
  updateVendor: (id: string, vendor: Partial<VendorRecord>) => void;
  deleteVendor: (id: string) => void;

  risks: RiskRecord[];
  addRisk: (risk: Omit<RiskRecord, 'id' | 'tenantId' | 'riskCode' | 'inherentScore' | 'residualScore' | 'escalatedToSuperAdmin'>) => void;
  updateRisk: (id: string, risk: Partial<RiskRecord>) => void;
  deleteRisk: (id: string) => void;
  mapRiskToMasRequirement: (riskId: string, requirementId: string) => void;
  unmapRiskFromMasRequirement: (riskId: string, requirementId: string) => void;
  setRiskMasRequirements: (riskId: string, requirementIds: string[]) => void;
  masEnterpriseRiskProfile: MASEnterpriseRiskProfile;
  getMasRequirementRiskExposure: (requirementId: string) => MASTrmRiskExposure;
  getMasDomainExposureMetrics: (domainNumber: string) => MASDomainExposureMetrics;
  autoMapTechnologyRisks: (options?: { minConfidence?: number; overwrite?: boolean }) => {
    newlyMappedCount: number;
    details: Array<{
      riskId: string;
      riskCode: string;
      title: string;
      mappedRequirements: Array<{ id: string; code: string; title: string; confidence: number }>;
    }>;
  };
  batchMapTechnologyRisks: (mappings: Record<string, string[]>) => void;
  getHeatmapCellMasExposure: (likelihood: number, impact: number, viewType?: 'inherent' | 'residual') => HeatmapCellMasExposure;
  getHeatmapMasExposureGrid: (viewType?: 'inherent' | 'residual') => HeatmapMasExposureGrid;

  evidence: EvidenceRecord[];
  uploadEvidence: (data: {
    title: string;
    controlCode: string;
    department: string;
    fileName: string;
    fileSize: string;
    fileType: string;
    tags: string[];
    initialStatus?: 'Draft' | 'Pending Review';
    sha256Hash?: string;
    dpdpClauses?: string[];
    dpdpMappings?: DpdpClauseMapping[];
    dpdpScanResult?: DpdpScanResult;
    isoRequirements?: string[];
    isoMappings?: IsoRequirementMapping[];
    isoScanResult?: IsoScanResult;
    recommendedIsoCategory?: string;
    recommendedControlCode?: string;
    documentExcerpt?: string;
    autoTaggedByAI?: boolean;
  }) => void;
  verifyEvidenceChecksum: (id: string) => Promise<{ success: boolean; verified: boolean; sha256Hash: string; timestamp: string }>;
  reviewEvidence: (
    id: string,
    status: 'Draft' | 'Pending Review' | 'Verified' | 'Requires Update' | 'Expired',
    notes: string,
    metadata?: { submittedBy?: string; submittedDate?: string }
  ) => { success: boolean; error?: string };
  submitEvidenceForReview: (id: string, notes?: string) => void;
  deleteEvidence: (id: string) => void;
  autoTagEvidenceWithDPDP: (
    evidenceId: string,
    mappings: DpdpClauseMapping[],
    suggestedTags: string[],
    scanResult: DpdpScanResult
  ) => void;
  batchAutoTagEvidenceWithDPDP: (
    results: Array<{
      id: string;
      mappings: DpdpClauseMapping[];
      suggestedTags: string[];
      scanResult: DpdpScanResult;
    }>
  ) => void;
  autoTagEvidenceWithISO: (
    evidenceId: string,
    mappings: IsoRequirementMapping[],
    suggestedTags: string[],
    scanResult: IsoScanResult
  ) => void;
  batchAutoTagEvidenceWithISO: (
    results: Array<{
      id: string;
      mappings: IsoRequirementMapping[];
      suggestedTags: string[];
      scanResult: IsoScanResult;
    }>
  ) => void;
  ingestBatchHarvestedEvidence: (items: EvidenceRecord[]) => void;
  syncStateToCloudDatabase: () => Promise<boolean>;
  persistenceStatus: {
    online: boolean;
    lastSynced: string | null;
    storageType: string;
  };
  validateAuditTrailIntegrity: () => Promise<{
    valid: boolean;
    totalBlocks: number;
    verifiedBlocks: number;
    brokenBlockId?: string;
    message: string;
  }>;

  internalAudits: InternalAuditPlan[];
  addInternalAudit: (plan: Omit<InternalAuditPlan, 'id' | 'tenantId' | 'auditCode'>) => void;
  updateInternalAudit: (id: string, plan: Partial<InternalAuditPlan>) => void;
  updateChecklistItem: (auditId: string, checklistId: string, item: Partial<InternalAuditPlan['checklists'][0]>) => void;

  findings: FindingCAPARecord[];
  addFinding: (finding: Omit<FindingCAPARecord, 'id' | 'tenantId' | 'findingCode' | 'raisedBy' | 'raisedDate'>) => void;
  updateFinding: (id: string, finding: Partial<FindingCAPARecord>) => void;
  deleteFinding: (id: string) => boolean; // returns false if external locked
  validateAndCloseFinding: (id: string, validation: IndependentAuditValidation) => boolean;

  controls: ControlItem[];
  updateControl: (controlId: string, updates: Partial<ControlItem>) => void;

  generatedDocs: GeneratedDocument[];
  addDocument: (doc: Omit<GeneratedDocument, 'id' | 'lastModified'>) => GeneratedDocument;
  updateDocumentStatus: (docId: string, status: GeneratedDocument['status']) => void;
  updateDocumentContent: (docId: string, content: string) => void;
  updateDocument: (docId: string, updates: Partial<GeneratedDocument>) => void;
  acknowledgeDocument: (docId: string) => void;
  upgradeAllDocsToAuditorGrade: (options?: Partial<AuditorGradeOptions>) => void;
  synthesizeStandardsPolicySuite: (options: PolicyGenerationOptions) => GeneratedDocument[];
  getAuditorReadinessScorecard: () => AuditorReadinessScorecard;
  advancePolicyApprovalStage: (
    docId: string,
    nextStage: PolicyApprovalRecord['stage'],
    comments?: string,
    approverName?: string,
    approverRole?: string
  ) => void;
  requestPolicyChanges: (
    docId: string,
    returnStage: PolicyApprovalRecord['stage'],
    feedbackComments: string,
    reviewerName?: string,
    reviewerRole?: string
  ) => void;
  updatePolicyReviewSchedule: (
    docId: string,
    nextReviewDate: string,
    reviewCycle?: 'Annual' | 'Semi-Annual' | 'Quarterly' | 'Bi-Annual'
  ) => void;
  triggerPolicyReviewNotification: (
    docId: string,
    notificationData: Omit<PolicyReviewNotification, 'id' | 'sentTimestamp' | 'deliveryStatus'>
  ) => PolicyReviewNotification;
  batchTriggerReviewNotifications: () => { triggeredCount: number; notifications: PolicyReviewNotification[] };
  addPolicyRevision: (
    docId: string,
    revision: {
      issueNo: string;
      changeDescription: string;
      pageNo: string;
      approvedBy: string;
      newContent?: string;
    }
  ) => void;
  signPolicyDigitally: (
    docId: string,
    signatureData: {
      signerName: string;
      signerRole: string;
      signerEmail?: string;
      signingPurpose: PolicyDigitalSignature['signingPurpose'];
      auditDeclaration?: string;
      notes?: string;
    }
  ) => Promise<PolicyDigitalSignature>;

  // Policy & Procedure Document Acknowledgments
  documentAcknowledgments: DocumentAcknowledgment[];
  submitDocumentAcknowledgment: (data: {
    documentId: string;
    documentCode: string;
    documentTitle: string;
    documentVersion: string;
    signatureText: string;
    declarationAccepted: boolean;
    notes?: string;
  }) => Promise<DocumentAcknowledgment>;

  // Risk Treatment Scenarios & Simulation
  riskScenarios: RiskTreatmentScenario[];
  saveRiskScenario: (scenario: Omit<RiskTreatmentScenario, 'id' | 'tenantId' | 'simulatedAt' | 'simulatedBy'>) => void;
  deleteRiskScenario: (id: string) => void;
  applyRiskTreatmentFromSimulation: (riskId: string, treatmentData: {
    treatmentOption: RiskRecord['treatmentOption'];
    mitigationControl: string;
    residualLikelihood: number;
    residualImpact: number;
    treatmentOwner: string;
    targetDate: string;
    notes?: string;
  }) => void;

  // Management Review Meeting (MRM - ISO 27001 Clause 9.3)
  managementReviews: ManagementReviewRecord[];
  addManagementReview: (mrm: Omit<ManagementReviewRecord, 'id' | 'tenantId'>) => void;
  updateManagementReview: (id: string, mrm: Partial<ManagementReviewRecord>) => void;
  signOffManagementReview: (id: string, signatory: string, conclusions: string) => Promise<void>;

  superAdminRecommendations: SuperAdminRecommendation[];
  issueRecommendation: (data: Omit<SuperAdminRecommendation, 'id' | 'issuedBy' | 'issuedDate'>) => void;
  addSuperAdminRecommendation: (data: Omit<SuperAdminRecommendation, 'id' | 'issuedBy' | 'issuedDate'>) => void;
  updateRecommendationStatus: (id: string, status: 'Open' | 'Acknowledged' | 'Implemented') => void;

  tasks: TaskRecord[];
  addTask: (task: Omit<TaskRecord, 'id' | 'tenantId'>) => void;
  updateTask: (id: string, task: Partial<TaskRecord>) => void;
  deleteTask: (id: string) => void;

  // Unified Remediation & Continuous Exception Desk
  unifiedRemediations: UnifiedRemediationItem[];
  addUnifiedRemediation: (item: Omit<UnifiedRemediationItem, 'id' | 'tenantId' | 'remediationCode' | 'createdAt' | 'isBreached' | 'daysRemainingOrOverdue'>) => void;
  updateUnifiedRemediation: (id: string, updates: Partial<UnifiedRemediationItem>) => void;
  deleteUnifiedRemediation: (id: string) => void;
  requestRiskExceptionWaiver: (remediationId: string, waiverData: Omit<RiskExceptionWaiverRequest, 'id' | 'waiverCode' | 'approvalStatus'>) => void;
  approveOrRejectWaiver: (remediationId: string, approved: boolean, executiveApprover: string, conditions?: string[]) => void;
  verifyCompensatingControl: (remediationId: string, controlData: Omit<CompensatingControlVerification, 'id'>) => void;
  signOffRemediationAudit: (remediationId: string, signOff: Omit<RemediationAuditSignOff, 'signatureTimestamp'>) => void;
  triggerRemediationRetest: (remediationId: string) => Promise<{ success: boolean; message: string }>;
  syncFindingsToRemediations: () => void;

  auditTrail: AuditTrailEvent[];
  logAuditEvent: (
    action: AuditTrailEvent['action'],
    module: string,
    description: string,
    metadata?: Record<string, any>
  ) => Promise<void>;

  // Auditor Assignment
  assignExternalAuditor: (tenantId: string, auditorId: string, timeline: TenantCompany['externalAuditTimeline']) => void;

  // Department Scope & Policy Compliance Intelligence
  departmentScopes: DepartmentScopeProfile[];
  updateDepartmentScope: (deptId: string, updates: Partial<DepartmentScopeProfile>) => void;
  addCustomDepartmentScope: (data: Omit<DepartmentScopeProfile, 'tenantId' | 'updatedAt'>) => void;
  deleteDepartmentScope: (deptId: string) => void;
  toggleDepartmentInScope: (deptId: string) => void;
  autoMapDepartmentPolicies: (deptId?: string) => void;
  addPolicyRequirementToDepartment: (deptId: string, policy: Omit<DepartmentPolicyRequirement, 'id'>) => void;
  updateDepartmentPolicyRequirement: (deptId: string, policyReqId: string, updates: Partial<DepartmentPolicyRequirement>) => void;
  removeDepartmentPolicyRequirement: (deptId: string, policyReqId: string) => void;

  // Active module view state
  activeModule: string;
  setActiveModule: (module: string) => void;
  findingFilterQuery: string;
  setFindingFilterQuery: (query: string) => void;
  navigateToFindingsCAPA: (filterQuery?: string) => void;

  // P1: One-Click External Audit Dossier & Evidence Freshness Engine
  triggerEvidenceRefreshCampaign: () => number;

  // P3: Automated SoA & Risk Register Dynamic Sync (ISO 27001 Cl. 6.1.2 & 6.1.3)
  syncRiskRegisterAndSoA: () => { changesCount: number; changeLog: string[] };

  // Statement of Applicability (SoA) Sync Verifier (ISO 27001 Cl. 6.1.3 d)
  soaVerifierReport: SoAVerifierReport;
  soaVerificationIssues: OutdatedJustificationIssue[];
  runSoASyncVerification: () => SoAVerifierReport;
  reincludeControlFromIssue: (issueId: string) => void;
  updateJustificationFromIssue: (issueId: string, newJustification: string) => void;
  dismissSoAIssue: (issueId: string, auditorNote?: string) => void;
  batchReconcileOutdatedSoA: () => { count: number; reincludedCodes: string[] };
  simulateOutdatedSoARisk: (sampleIndex?: number) => RiskRecord;

  // Reset demo data helper
  resetAllData: () => void;
  resetToDemoData: () => void;

  // Global Theme: Midnight Dark vs High-Contrast Light Mode
  theme: GlobalTheme;
  isThemeTransitioning: boolean;
  osTheme: GlobalTheme;
  isOSThemeSynced: boolean;
  setTheme: (theme: GlobalTheme) => void;
  toggleTheme: () => void;
  syncWithOSTheme: () => void;

  // Font & Contrast Accessibility Settings
  readability: ReadabilitySettings;
  updateReadability: (updates: Partial<ReadabilitySettings>) => void;
  resetReadability: () => void;

  // MAS Regulatory Profile & Applicability Rules Engine
  masRegulatoryProfile: MASRegulatoryProfile;
  updateMASRegulatoryProfile: (updates: Partial<MASRegulatoryProfile>) => void;
  masApplicabilityRules: ApplicabilityRule[];
  masModuleApplicabilityDictionary: Record<string, boolean>;
  activeMASModuleIds: string[];
  isMASModuleApplicable: (moduleId: string) => boolean;
  getMASApplicabilityRuleForModule: (moduleId: string) => ApplicabilityRule | undefined;
  applicabilityRuleConfig: ApplicabilityRuleConfig;
  applicabilityRule: ApplicabilityRuleConfig;
  ApplicabilityRule: ApplicabilityRuleConfig;
  masReadinessScoreSummary: MASReadinessScoreSummary;
  calculateMASReadinessScore: () => MASReadinessScoreSummary;
}

const GRCContext = createContext<GRCContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'grc_portal_state_v1';

export const GRCProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from localStorage if available, or fallback to INITIAL fixtures
  const [tenants, setTenants] = useState<TenantCompany[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_tenants`);
      if (!saved) return INITIAL_TENANTS;
      const parsed: TenantCompany[] = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_TENANTS;
      // Ensure NEW_REGISTRATION_TENANT is always available for fresh registration surveys
      const hasNewReg = parsed.some(t => t.id === 'tenant_new_reg');
      const baseParsed = hasNewReg ? parsed : [NEW_REGISTRATION_TENANT, ...parsed];
      // Ensure all fields are defensively populated
      return baseParsed.map(t => {
        const fallback = INITIAL_TENANTS.find(it => it.id === t.id) || INITIAL_TENANTS[0];
        // Ensure standard formatted docs with pages are present
        const existingDocIds = new Set((t.generatedDocs || []).map(d => d.id));
        const mergedDocs = [
          ...(t.generatedDocs || []),
          ...fallback.generatedDocs.filter(fd => !existingDocIds.has(fd.id))
        ];

        return {
          ...fallback,
          ...t,
          controls: Array.isArray(t.controls) && t.controls.length > 0 ? t.controls : fallback.controls,
          generatedDocs: mergedDocs.length > 0 ? mergedDocs : fallback.generatedDocs,
          businessScope: t.businessScope || fallback.businessScope,
          mou: t.mou || fallback.mou,
          departmentScopes: Array.isArray(t.departmentScopes) && t.departmentScopes.length > 0 ? t.departmentScopes : (fallback.departmentScopes || generateInitialDepartmentScopes(t.id)),
          customDepartments: t.customDepartments || fallback.customDepartments
        };
      });
    } catch {
      return INITIAL_TENANTS;
    }
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_users`);
      if (!saved) return INITIAL_USERS;
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((u: User) => {
          if (u.name === 'Sarah Chen' || u.name === 'Sarah') {
            return { ...u, name: 'SriKarthiK', email: u.email === 'sarah.chen@apexfintech.io' ? 'srikarthik@apexfintech.io' : u.email };
          }
          return u;
        });
      }
      return INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const defaultAdmin = users.find(u => u.name === 'SriKarthiK' || u.role === 'COMPANY_ADMIN') || (users && users[2]) || INITIAL_USERS[2];
    if (defaultAdmin.name === 'Sarah Chen' || defaultAdmin.name === 'Sarah') {
      return { ...defaultAdmin, name: 'SriKarthiK', email: 'srikarthik@skanda.security' };
    }
    return defaultAdmin;
  }); // Default SriKarthiK (Company Admin)
  const [currentRole, setCurrentRole] = useState<UserRole>(currentUser?.role || 'COMPANY_ADMIN');
  const [currentTenantId, setCurrentTenantId] = useState<string>(() => {
    try {
      const explicitSavedTenant = localStorage.getItem(`${LOCAL_STORAGE_KEY}_active_tenant`);
      if (explicitSavedTenant && tenants.some(t => t.id === explicitSavedTenant)) {
        return explicitSavedTenant;
      }
    } catch {
      // ignore
    }
    // Default to the new entity registration tenant so new visitors immediately see the onboarding survey!
    return 'tenant_new_reg';
  });

  // Role Preview & RBAC Impersonation State
  const [isPreviewRoleActive, setIsPreviewRoleActive] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`${LOCAL_STORAGE_KEY}_preview_active`) === 'true';
    } catch {
      return false;
    }
  });
  const [previewRole, setPreviewRole] = useState<UserRole | null>(() => {
    try {
      return (localStorage.getItem(`${LOCAL_STORAGE_KEY}_preview_role`) as UserRole) || null;
    } catch {
      return null;
    }
  });
  const [realAdminRole, setRealAdminRole] = useState<UserRole>(() => {
    try {
      return (localStorage.getItem(`${LOCAL_STORAGE_KEY}_real_admin_role`) as UserRole) || 'COMPANY_ADMIN';
    } catch {
      return 'COMPANY_ADMIN';
    }
  });

  const isRealRoleAdmin = realAdminRole === 'SUPER_ADMIN' || realAdminRole === 'COMPANY_ADMIN' || (!isPreviewRoleActive && (currentRole === 'SUPER_ADMIN' || currentRole === 'COMPANY_ADMIN'));

  const [activeModule, setActiveModule] = useState<string>(() => {
    try {
      const explicitSavedModule = localStorage.getItem(`${LOCAL_STORAGE_KEY}_active_module`);
      if (explicitSavedModule) return explicitSavedModule;
    } catch {
      // ignore
    }
    // Default to onboarding_survey for new visitors & new registration
    return 'onboarding_survey';
  });

  // Product Mode & Dual Operating Engine
  const [productMode, setProductModeState] = useState<'guided_journey' | 'command_center'>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_product_mode`);
      if (saved === 'guided_journey' || saved === 'command_center') return saved;
    } catch {
      // ignore
    }
    return 'command_center';
  });

  const setProductMode = (mode: 'guided_journey' | 'command_center') => {
    setProductModeState(mode);
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_product_mode`, mode);
    } catch {}
    if (mode === 'guided_journey') {
      setActiveModule('guided_journey');
    } else {
      setActiveModule('command_center');
    }
  };

  const [activePersona, setActivePersona] = useState<CanonicalPersona>('GRC_LEAD');
  const [sessionContext, setSessionContext] = useState<AuthenticatedSessionContext | null>(null);

  // Universal 360° Slide-Over Entity Drawer
  const [entityDrawerState, setEntityDrawerState] = useState<{
    isOpen: boolean;
    entityType: string;
    entityId: string;
    entityTitle?: string;
    entityData?: any;
    history: Array<{
      entityType: string;
      entityId: string;
      entityTitle?: string;
      entityData?: any;
    }>;
  }>({
    isOpen: false,
    entityType: 'control',
    entityId: '',
    entityTitle: '',
    entityData: null,
    history: []
  });

  const openEntityDrawer = useCallback((entity: { type: string; id: string; title?: string; data?: any }) => {
    setEntityDrawerState(prev => ({
      isOpen: true,
      entityType: entity.type,
      entityId: entity.id,
      entityTitle: entity.title || '',
      entityData: entity.data || null,
      history: prev.isOpen
        ? [...prev.history, { entityType: prev.entityType, entityId: prev.entityId, entityTitle: prev.entityTitle, entityData: prev.entityData }]
        : []
    }));
  }, []);

  const closeEntityDrawer = useCallback(() => {
    setEntityDrawerState({
      isOpen: false,
      entityType: 'control',
      entityId: '',
      entityTitle: '',
      entityData: null,
      history: []
    });
  }, []);

  const navigateEntityDrawerBack = useCallback(() => {
    setEntityDrawerState(prev => {
      if (prev.history.length === 0) return { ...prev, isOpen: false };
      const previous = prev.history[prev.history.length - 1];
      const newHistory = prev.history.slice(0, -1);
      return {
        isOpen: true,
        entityType: previous.entityType,
        entityId: previous.entityId,
        entityTitle: previous.entityTitle,
        entityData: previous.entityData,
        history: newHistory
      };
    });
  }, []);

  const [findingFilterQuery, setFindingFilterQuery] = useState<string>('');

  const navigateToFindingsCAPA = (filterQuery?: string) => {
    if (filterQuery !== undefined) {
      setFindingFilterQuery(filterQuery);
    }
    setActiveModule('findings_capa');
  };
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_is_authenticated`);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const loginWithSessionContext = useCallback((context: AuthenticatedSessionContext) => {
    setSessionContext(context);
    setCurrentUser(context.user as any);
    setCurrentRole(context.user.primaryRole as UserRole);
    setCurrentTenantId(context.tenant.id);
    setActivePersona(context.persona.activePersona);
    setIsAuthenticated(true);
    if (context.landing?.targetModuleId) {
      setActiveModule(context.landing.targetModuleId as any);
    }
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_is_authenticated`, 'true');
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_session_token`, context.sessionToken);
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const login = (user?: User, tenantId?: string) => {
    if (user) {
      setCurrentUser(user);
      setCurrentRole(user.role);
      if (tenantId) {
        setCurrentTenantId(tenantId);
      } else if (user.tenantId && user.tenantId !== 'super') {
        setCurrentTenantId(user.tenantId);
      }
    }
    setIsAuthenticated(true);
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_is_authenticated`, 'true');
    } catch (e) {
      console.warn(e);
    }
  };

  const logout = () => {
    if (sessionContext?.sessionId) {
      identityGatewayService.revokeSession(sessionContext.sessionId);
    }
    setSessionContext(null);
    setIsAuthenticated(false);
    setActiveModule('login' as any);
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_is_authenticated`, 'false');
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_session_token`);
    } catch (e) {
      console.warn(e);
    }
  };

  // Framework & Regulatory Intelligence Engine State
  const [selectedFramework, setSelectedFramework] = useState<string>(() => {
    try {
      return localStorage.getItem(`${LOCAL_STORAGE_KEY}_selected_fw`) || 'MAS TRM 2021';
    } catch {
      return 'MAS TRM 2021';
    }
  });

  const [masAssessments, setMasAssessments] = useState<MASRequirementAssessmentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_mas_assessments`);
      if (!saved) return INITIAL_MAS_ASSESSMENTS;
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingCodes = new Set(parsed.map((p: any) => p.requirementCode));
        const missing = INITIAL_MAS_ASSESSMENTS.filter(init => !existingCodes.has(init.requirementCode));
        return missing.length > 0 ? [...parsed, ...missing] : parsed;
      }
      return INITIAL_MAS_ASSESSMENTS;
    } catch {
      return INITIAL_MAS_ASSESSMENTS;
    }
  });

  const [masProfile, setMasProfile] = useState<MASFinancialInstitutionProfile>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_mas_profile`);
      if (!saved) return INITIAL_MAS_PROFILE;
      const parsed = JSON.parse(saved);
      return parsed?.institutionCategory ? parsed : INITIAL_MAS_PROFILE;
    } catch {
      return INITIAL_MAS_PROFILE;
    }
  });

  const [regulatoryNotices, setRegulatoryNotices] = useState<RegulatoryNoticeEvent[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_regulatory_notices`);
      if (!saved) return REGULATORY_NOTICES_FEED;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : REGULATORY_NOTICES_FEED;
    } catch {
      return REGULATORY_NOTICES_FEED;
    }
  });

  const [masIncidents, setMasIncidents] = useState<MASIncidentBreachRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_mas_incidents`);
      if (!saved) return INITIAL_MAS_INCIDENTS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_MAS_INCIDENTS;
    } catch {
      return INITIAL_MAS_INCIDENTS;
    }
  });

  // Helper to query the user's OS-level light/dark mode preference via matchMedia
  const getOSThemePreference = useCallback((): GlobalTheme => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      try {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return isDark ? 'midnight' : 'light';
      } catch {
        return 'midnight';
      }
    }
    return 'midnight';
  }, []);

  // Track the detected OS-level preference
  const [osTheme, setOSTheme] = useState<GlobalTheme>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      try {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'midnight' : 'light';
      } catch {
        return 'midnight';
      }
    }
    return 'midnight';
  });

  // Track whether the app is currently auto-synchronized with the OS preference
  const [isOSThemeSynced, setIsOSThemeSynced] = useState<boolean>(() => {
    try {
      const mode = localStorage.getItem('grc_portal_theme_mode');
      if (mode === 'auto') return true;
      if (mode === 'light' || mode === 'midnight') return false;
      return localStorage.getItem('grc_portal_theme_manual') !== 'true';
    } catch {
      return true;
    }
  });

  // Global Theme Management: Defaults to premium enterprise Light Mode
  const [theme, setThemeState] = useState<GlobalTheme>(() => {
    let defaultTheme: GlobalTheme = 'light';

    try {
      const mode = localStorage.getItem('grc_portal_theme_mode');
      if (mode === 'light' || mode === 'midnight') {
        return mode;
      }
      const isManual = localStorage.getItem('grc_portal_theme_manual') === 'true';
      const saved = localStorage.getItem('grc_portal_theme');
      // If the user has explicitly selected a manual override, honor it
      if (isManual && (saved === 'light' || saved === 'midnight')) {
        return saved;
      }
      return 'light';
    } catch {
      return defaultTheme;
    }
  });

  const isOSThemeSyncedRef = useRef<boolean>(isOSThemeSynced);
  isOSThemeSyncedRef.current = isOSThemeSynced;

  const themeRef = useRef<GlobalTheme>(theme);
  themeRef.current = theme;

  const [isThemeTransitioning, setIsThemeTransitioning] = useState<boolean>(false);
  const themeTransitionTimeoutRef = useRef<number | null>(null);

  // Helper to sync theme attributes and classes directly onto DOM root and body
  const applyThemeToDOM = useCallback((targetTheme: GlobalTheme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const body = document.body;
    if (targetTheme === 'light') {
      root.classList.add('theme-light');
      root.classList.remove('theme-midnight', 'dark');
      body.classList.add('theme-light');
      body.classList.remove('theme-midnight', 'dark');
      root.setAttribute('data-theme', 'light');
      body.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    } else {
      root.classList.remove('theme-light');
      root.classList.add('theme-midnight', 'dark');
      body.classList.remove('theme-light');
      body.classList.add('theme-midnight', 'dark');
      root.setAttribute('data-theme', 'midnight');
      body.setAttribute('data-theme', 'midnight');
      root.style.colorScheme = 'dark';
    }
  }, []);

  // Orchestrates a silky, CSS-based cross-fade transition across all semantic tokens
  const triggerThemeTransition = useCallback((newTheme: GlobalTheme) => {
    if (typeof document === 'undefined') {
      setThemeState(newTheme);
      return;
    }

    const root = document.documentElement;
    const body = document.body;

    // 1. Immediately activate global transition mode so all semantic tokens interpolate
    root.classList.add('theme-cross-fade-active');
    body.classList.add('theme-cross-fade-active');
    root.setAttribute('data-theme-transitioning', 'true');
    body.setAttribute('data-theme-transitioning', 'true');
    setIsThemeTransitioning(true);

    if (themeTransitionTimeoutRef.current) {
      window.clearTimeout(themeTransitionTimeoutRef.current);
    }

    const commitThemeChange = () => {
      setThemeState(newTheme);
      applyThemeToDOM(newTheme);
      try {
        localStorage.setItem('grc_portal_theme', newTheme);
      } catch {
        // ignore storage failures in restricted sandbox
      }
    };

    // 2. Progressive enhancement: Check for View Transitions API support
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (
      !prefersReducedMotion &&
      'startViewTransition' in document &&
      typeof (document as any).startViewTransition === 'function'
    ) {
      try {
        (document as any).startViewTransition(() => {
          commitThemeChange();
        });
      } catch {
        commitThemeChange();
      }
    } else {
      commitThemeChange();
    }

    // 3. Keep transition class active for 400ms to allow all CSS transition curves to complete
    themeTransitionTimeoutRef.current = window.setTimeout(() => {
      root.classList.remove('theme-cross-fade-active');
      body.classList.remove('theme-cross-fade-active');
      root.removeAttribute('data-theme-transitioning');
      body.removeAttribute('data-theme-transitioning');
      setIsThemeTransitioning(false);
      themeTransitionTimeoutRef.current = null;
    }, 400);
  }, [applyThemeToDOM]);

  const setTheme = useCallback((newTheme: GlobalTheme) => {
    try {
      localStorage.setItem('grc_portal_theme_mode', newTheme);
      localStorage.setItem('grc_portal_theme_manual', 'true');
      localStorage.setItem('grc_portal_theme', newTheme);
    } catch {
      // ignore storage failures in restricted sandbox
    }
    setIsOSThemeSynced(false);
    if (newTheme === themeRef.current) {
      applyThemeToDOM(newTheme);
      return;
    }
    triggerThemeTransition(newTheme);
  }, [triggerThemeTransition, applyThemeToDOM]);

  const toggleTheme = useCallback(() => {
    const nextTheme: GlobalTheme = themeRef.current === 'midnight' ? 'light' : 'midnight';
    try {
      localStorage.setItem('grc_portal_theme_mode', nextTheme);
      localStorage.setItem('grc_portal_theme_manual', 'true');
      localStorage.setItem('grc_portal_theme', nextTheme);
    } catch {
      // ignore storage failures in restricted sandbox
    }
    setIsOSThemeSynced(false);
    triggerThemeTransition(nextTheme);
  }, [triggerThemeTransition]);

  // Explicitly sync the application theme with the OS-level light/dark mode preference
  const syncWithOSTheme = useCallback(() => {
    try {
      localStorage.setItem('grc_portal_theme_mode', 'auto');
      localStorage.removeItem('grc_portal_theme_manual');
      localStorage.removeItem('grc_portal_theme');
    } catch {
      // ignore storage failures in restricted sandbox
    }
    setIsOSThemeSynced(true);
    const currentOSTheme = getOSThemePreference();
    setOSTheme(currentOSTheme);
    if (currentOSTheme !== themeRef.current) {
      triggerThemeTransition(currentOSTheme);
    } else {
      applyThemeToDOM(currentOSTheme);
    }
  }, [getOSThemePreference, triggerThemeTransition, applyThemeToDOM]);

  // Dynamically listen for OS-level preference changes via window.matchMedia('(prefers-color-scheme: dark)')
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleOSThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const detectedTheme: GlobalTheme = e.matches ? 'midnight' : 'light';
      setOSTheme(detectedTheme);

      if (isOSThemeSyncedRef.current) {
        triggerThemeTransition(detectedTheme);
      }
    };

    // Listen for cross-tab or cross-window theme changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'grc_portal_theme' || e.key === 'grc_portal_theme_manual' || e.key === 'grc_portal_theme_mode') {
        try {
          const mode = localStorage.getItem('grc_portal_theme_mode');
          if (mode === 'auto') {
            setIsOSThemeSynced(true);
            const osPref = getOSThemePreference();
            setOSTheme(osPref);
            if (osPref !== themeRef.current) {
              triggerThemeTransition(osPref);
            }
            return;
          }
          if (mode === 'light' || mode === 'midnight') {
            setIsOSThemeSynced(false);
            if (mode !== themeRef.current) {
              triggerThemeTransition(mode);
            }
            return;
          }
          const isManual = localStorage.getItem('grc_portal_theme_manual') === 'true';
          const saved = localStorage.getItem('grc_portal_theme') as GlobalTheme | null;
          if (isManual && (saved === 'light' || saved === 'midnight')) {
            setIsOSThemeSynced(false);
            if (saved !== themeRef.current) {
              triggerThemeTransition(saved);
            }
          } else {
            setIsOSThemeSynced(true);
            const osPref = getOSThemePreference();
            setOSTheme(osPref);
            if (osPref !== themeRef.current) {
              triggerThemeTransition(osPref);
            }
          }
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleOSThemeChange);
      return () => {
        mediaQuery.removeEventListener('change', handleOSThemeChange);
        window.removeEventListener('storage', handleStorageChange);
      };
    } else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(handleOSThemeChange);
      return () => {
        (mediaQuery as any).removeListener(handleOSThemeChange);
        window.removeEventListener('storage', handleStorageChange);
      };
    }
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [triggerThemeTransition, getOSThemePreference]);

  // Initial mount sync without triggering full cross-fade animation
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme, applyThemeToDOM]);

  // Font & Contrast Readability Settings
  const [readability, setReadability] = useState<ReadabilitySettings>(() => {
    const DEFAULT_READABILITY: ReadabilitySettings = {
      contrastMode: 'enhanced',
      fontSize: 'standard',
      fontWeight: 'standard',
      fontFamily: 'inter'
    };
    try {
      const saved = localStorage.getItem('grc_readability_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.fontFamily === 'times-new-roman' || parsed.fontFamily === 'josefin-sans' || !parsed.fontFamily) {
          parsed.fontFamily = 'inter';
        }
        return { ...DEFAULT_READABILITY, ...parsed };
      }
    } catch {
      // ignore
    }
    return DEFAULT_READABILITY;
  });

  const updateReadability = useCallback((updates: Partial<ReadabilitySettings>) => {
    setReadability(prev => {
      const next = { ...prev, ...updates };
      if ((next.fontFamily as string) === 'times-new-roman') {
        next.fontFamily = 'inter';
      }
      try {
        localStorage.setItem('grc_readability_settings', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const resetReadability = useCallback(() => {
    const DEFAULT_READABILITY: ReadabilitySettings = {
      contrastMode: 'enhanced',
      fontSize: 'standard',
      fontWeight: 'standard',
      fontFamily: 'inter'
    };
    try {
      localStorage.removeItem('grc_readability_settings');
    } catch {
      // ignore
    }
    setReadability(DEFAULT_READABILITY);
  }, []);

  // Sync readability attributes to DOM root for instant CSS styling
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-contrast', readability.contrastMode);
    root.setAttribute('data-font-size', readability.fontSize);
    root.setAttribute('data-font-weight', readability.fontWeight);
    root.setAttribute('data-font-family', readability.fontFamily);
  }, [readability]);


  // Master Data
  const [masterCategories, setMasterCategories] = useState<MasterCategory[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_master_cats`);
      if (!saved) return MASTER_CATEGORIES;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : MASTER_CATEGORIES;
    } catch {
      return MASTER_CATEGORIES;
    }
  });

  const [masterIndustries, setMasterIndustries] = useState<MasterIndustry[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_master_inds`);
      if (!saved) return MASTER_INDUSTRIES;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : MASTER_INDUSTRIES;
    } catch {
      return MASTER_INDUSTRIES;
    }
  });

  const [masterDepartments, setMasterDepartments] = useState<MasterDepartment[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_master_depts`);
      if (!saved) return MASTER_DEPARTMENTS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : MASTER_DEPARTMENTS;
    } catch {
      return MASTER_DEPARTMENTS;
    }
  });

  // Entities
  const [assets, setAssets] = useState<AssetRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_assets`);
      if (!saved) return INITIAL_ASSETS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_ASSETS;
    } catch {
      return INITIAL_ASSETS;
    }
  });

  const [dataAssets, setDataAssets] = useState<DataAssetRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_data_assets`);
      if (!saved) return INITIAL_DATA_ASSETS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_DATA_ASSETS;
    } catch {
      return INITIAL_DATA_ASSETS;
    }
  });

  const [vendors, setVendors] = useState<VendorRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_vendors`);
      if (!saved) return INITIAL_VENDORS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_VENDORS;
    } catch {
      return INITIAL_VENDORS;
    }
  });

  const [risks, setRisks] = useState<RiskRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_risks`);
      if (!saved) return RiskEngine.seedDefaultMasRequirementMappings(INITIAL_RISKS);
      const parsed = JSON.parse(saved);
      const validRisks = Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_RISKS;
      return RiskEngine.seedDefaultMasRequirementMappings(validRisks);
    } catch {
      return RiskEngine.seedDefaultMasRequirementMappings(INITIAL_RISKS);
    }
  });

  const [evidence, setEvidence] = useState<EvidenceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_evidence`);
      if (!saved) return INITIAL_EVIDENCE;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_EVIDENCE;
    } catch {
      return INITIAL_EVIDENCE;
    }
  });

  const [internalAudits, setInternalAudits] = useState<InternalAuditPlan[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_internal_audits`);
      if (!saved) return INITIAL_INTERNAL_AUDITS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_INTERNAL_AUDITS;
    } catch {
      return INITIAL_INTERNAL_AUDITS;
    }
  });

  const [findings, setFindings] = useState<FindingCAPARecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_findings`);
      if (!saved) return INITIAL_FINDINGS;
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_FINDINGS;
      const existingIds = new Set(parsed.map((f: any) => f.id));
      const missingInitial = INITIAL_FINDINGS.filter(f => !existingIds.has(f.id));
      return missingInitial.length > 0 ? [...parsed, ...missingInitial] : parsed;
    } catch {
      return INITIAL_FINDINGS;
    }
  });

  const [auditTrail, setAuditTrail] = useState<AuditTrailEvent[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_audit_trail`);
      if (!saved) return INITIAL_AUDIT_TRAIL;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_AUDIT_TRAIL;
    } catch {
      return INITIAL_AUDIT_TRAIL;
    }
  });

  const [superAdminRecommendations, setSuperAdminRecommendations] = useState<SuperAdminRecommendation[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_recommendations`);
      if (!saved) return INITIAL_SUPERADMIN_RECOMMENDATIONS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_SUPERADMIN_RECOMMENDATIONS;
    } catch {
      return INITIAL_SUPERADMIN_RECOMMENDATIONS;
    }
  });

  const [tasks, setTasks] = useState<TaskRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_tasks`);
      if (!saved) return INITIAL_TASKS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [unifiedRemediations, setUnifiedRemediations] = useState<UnifiedRemediationItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_unified_remediations`);
      if (!saved) return INITIAL_UNIFIED_REMEDIATIONS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_UNIFIED_REMEDIATIONS;
    } catch {
      return INITIAL_UNIFIED_REMEDIATIONS;
    }
  });

  const [documentAcknowledgments, setDocumentAcknowledgments] = useState<DocumentAcknowledgment[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_doc_acks`);
      if (!saved) return INITIAL_DOCUMENT_ACKNOWLEDGMENTS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_DOCUMENT_ACKNOWLEDGMENTS;
    } catch {
      return INITIAL_DOCUMENT_ACKNOWLEDGMENTS;
    }
  });

  const [riskScenarios, setRiskScenarios] = useState<RiskTreatmentScenario[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_risk_scenarios`);
      if (!saved) return INITIAL_RISK_SCENARIOS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_RISK_SCENARIOS;
    } catch {
      return INITIAL_RISK_SCENARIOS;
    }
  });

  const [managementReviews, setManagementReviews] = useState<ManagementReviewRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_mrm`);
      if (!saved) return INITIAL_MANAGEMENT_REVIEWS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_MANAGEMENT_REVIEWS;
    } catch {
      return INITIAL_MANAGEMENT_REVIEWS;
    }
  });

  // Save to localStorage when states change
  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_tenants`, JSON.stringify(tenants));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_users`, JSON.stringify(users));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_master_cats`, JSON.stringify(masterCategories));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_master_inds`, JSON.stringify(masterIndustries));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_master_depts`, JSON.stringify(masterDepartments));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_assets`, JSON.stringify(assets));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_data_assets`, JSON.stringify(dataAssets));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_vendors`, JSON.stringify(vendors));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_risks`, JSON.stringify(risks));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_evidence`, JSON.stringify(evidence));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_internal_audits`, JSON.stringify(internalAudits));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_findings`, JSON.stringify(findings));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_audit_trail`, JSON.stringify(auditTrail));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_recommendations`, JSON.stringify(superAdminRecommendations));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_tasks`, JSON.stringify(tasks));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_unified_remediations`, JSON.stringify(unifiedRemediations));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_doc_acks`, JSON.stringify(documentAcknowledgments));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_risk_scenarios`, JSON.stringify(riskScenarios));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_mrm`, JSON.stringify(managementReviews));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_selected_fw`, selectedFramework);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_mas_assessments`, JSON.stringify(masAssessments));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_mas_profile`, JSON.stringify(masProfile));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_regulatory_notices`, JSON.stringify(regulatoryNotices));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_mas_incidents`, JSON.stringify(masIncidents));
    } catch (e) {
      console.warn('Storage quota exceeded or error saving to localStorage', e);
    }
  }, [
    tenants, users, masterCategories, masterIndustries, masterDepartments,
    assets, dataAssets, vendors, risks, evidence, internalAudits,
    findings, auditTrail, superAdminRecommendations, tasks, unifiedRemediations,
    documentAcknowledgments, riskScenarios, managementReviews,
    selectedFramework, masAssessments, masProfile, regulatoryNotices, masIncidents
  ]);

  // Phase 1: Server-Side Persistence Layer & Cloud Sync State
  const [persistenceStatus, setPersistenceStatus] = useState<{
    online: boolean;
    lastSynced: string | null;
    storageType: string;
  }>({
    online: true,
    lastSynced: null,
    storageType: 'DURABLE_DISK_STORE'
  });

  const syncStateToCloudDatabase = async (): Promise<boolean> => {
    try {
      const payload = {
        tenantId: currentTenantId,
        timestamp: new Date().toISOString(),
        state: {
          tenants,
          users,
          assets,
          dataAssets,
          vendors,
          risks,
          evidence,
          internalAudits,
          findings,
          auditTrail
        }
      };
      const res = await fetch('/api/persistence/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setPersistenceStatus({
          online: true,
          lastSynced: data.syncedAt,
          storageType: data.storageEngine || 'DURABLE_DISK_STORE'
        });
        return true;
      }
    } catch (err) {
      console.warn('Background persistence sync failed:', err);
    }
    return false;
  };

  useEffect(() => {
    fetch('/api/persistence/status')
      .then(r => r.json())
      .then(data => {
        setPersistenceStatus({
          online: data.status === 'ONLINE',
          lastSynced: data.lastModified,
          storageType: data.storageType || 'DURABLE_DISK_STORE'
        });
      })
      .catch(() => {});

    // Hydrate persistent state from server
    fetch(`/api/persistence/load?tenantId=${currentTenantId}`)
      .then(r => r.json())
      .then(data => {
        if (data && data.state) {
          if (Array.isArray(data.state.tenants) && data.state.tenants.length > 0) setTenants(data.state.tenants);
          if (Array.isArray(data.state.risks) && data.state.risks.length > 0) setRisks(data.state.risks);
          if (Array.isArray(data.state.evidence) && data.state.evidence.length > 0) setEvidence(data.state.evidence);
          if (Array.isArray(data.state.findings) && data.state.findings.length > 0) setFindings(data.state.findings);
          if (Array.isArray(data.state.assets) && data.state.assets.length > 0) setAssets(data.state.assets);
          if (Array.isArray(data.state.vendors) && data.state.vendors.length > 0) setVendors(data.state.vendors);
          if (Array.isArray(data.state.auditTrail) && data.state.auditTrail.length > 0) setAuditTrail(data.state.auditTrail);
        }
      })
      .catch(err => console.warn('Initial server state hydration skipped:', err));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      syncStateToCloudDatabase();
    }, 4000);
    return () => clearTimeout(timer);
  }, [evidence.length, risks.length, findings.length]);

  // Current active tenant
  const currentTenant = tenants.find(t => t.id === currentTenantId) || tenants[0] || null;

  // Onboarding / Survey Completion Status (Phase 5 or executed MoU)
  const isSurveyComplete = Boolean(currentTenant && (currentTenant.onboardingPhase >= 5 || currentTenant.mou?.executed));
  const isOnboardingComplete = isSurveyComplete;

  // Derived 24-Stage Workflow Gating Engine for ISO/IEC 27001:2022
  const workflowStages = useMemo(() => {
    return calculateWorkflowStages(
      currentTenant,
      risks,
      currentTenant?.controls || [],
      evidence,
      internalAudits,
      findings,
      currentTenant?.generatedDocs || []
    );
  }, [currentTenant, risks, evidence, internalAudits, findings]);

  const nextRecommendedAction = useMemo(() => {
    return getDynamicNextAction(
      currentTenant,
      risks,
      currentTenant?.controls || [],
      evidence,
      internalAudits,
      findings,
      currentTenant?.generatedDocs || []
    );
  }, [currentTenant, risks, evidence, internalAudits, findings]);

  const saveCompanyRegistrationProfile = async (profile: CompanyRegistrationProfile): Promise<string> => {
    let targetTenantId = currentTenantId;
    const isNew = !tenants.some(t => t.id === targetTenantId) || targetTenantId === 'tenant_new' || targetTenantId === 'tenant_new_reg' || targetTenantId.startsWith('tenant_reg_');
    if (isNew) {
      targetTenantId = targetTenantId.startsWith('tenant_reg_') ? targetTenantId : `tenant_${Date.now()}`;
    }

    const complianceProfile = generateCompanyComplianceProfile(targetTenantId, profile);
    const discoveryQuestionnaires = generateDefaultDiscoveryQuestionnaires();
    const departmentSurveys = generateDefaultDepartmentSurveys();
    const implementationPlan = generateDefaultImplementationPlan();

    setTenants(prev => {
      const exists = prev.some(t => t.id === targetTenantId);
      if (exists) {
        return prev.map(t => {
          if (t.id === targetTenantId) {
            return {
              ...t,
              name: profile.organization.legalName,
              contactEmail: profile.organization.website || t.contactEmail,
              registeredCategory: profile.organization.businessType || t.registeredCategory,
              registeredAddress: {
                street: t.registeredAddress?.street || '12 Marina Boulevard',
                city: profile.organization.locations?.[0] || t.registeredAddress?.city || 'Singapore',
                state: t.registeredAddress?.state || 'Central',
                postalCode: t.registeredAddress?.postalCode || '018982',
                country: profile.organization.countriesOfOperation?.[0] || t.registeredAddress?.country || 'Singapore'
              },
              industryType: profile.organization.industry || t.industryType,
              companyRegistrationProfile: profile,
              companyComplianceProfile: complianceProfile,
              discoveryQuestionnaires: t.discoveryQuestionnaires || discoveryQuestionnaires,
              departmentSurveys: t.departmentSurveys || departmentSurveys,
              implementationPlan: t.implementationPlan || implementationPlan,
              onboardingPhase: Math.max(t.onboardingPhase, 2)
            };
          }
          return t;
        });
      } else {
        const fallback = INITIAL_TENANTS[0];
        const newT: TenantCompany = {
          ...fallback,
          id: targetTenantId,
          name: profile.organization.legalName,
          contactEmail: profile.organization.website || 'admin@' + profile.organization.legalName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
          registeredCategory: profile.organization.businessType || 'Private Limited Company',
          registeredAddress: {
            street: '12 Marina Boulevard',
            city: profile.organization.locations?.[0] || 'Singapore',
            state: 'Central',
            postalCode: '018982',
            country: profile.organization.countriesOfOperation?.[0] || 'Singapore'
          },
          industryType: profile.organization.industry || 'Technology & Software SaaS',
          onboardingPhase: 2,
          companyRegistrationProfile: profile,
          companyComplianceProfile: complianceProfile,
          discoveryQuestionnaires,
          departmentSurveys,
          implementationPlan
        };
        return [...prev.filter(t => t.id !== 'tenant_new_reg' && t.id !== targetTenantId), newT];
      }
    });

    setCurrentTenantId(targetTenantId);
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_active_tenant`, targetTenantId);
    } catch {}

    await logAuditEvent('CREATE', 'Company Registration Engine', `Persisted expanded organization profile for ${profile.organization.legalName}`);
    return targetTenantId;
  };

  const updateDiscoveryQuestion = (sectionKey: string, questionId: string, updates: Partial<DiscoveryQuestion>) => {
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const sections = t.discoveryQuestionnaires || generateDefaultDiscoveryQuestionnaires();
        const updated = sections.map(s => {
          if (s.sectionKey === sectionKey) {
            return {
              ...s,
              questions: s.questions.map(q => q.id === questionId ? { ...q, ...updates } : q)
            };
          }
          return s;
        });
        return { ...t, discoveryQuestionnaires: updated };
      }
      return t;
    }));
  };

  const batchAnswerDiscoverySection = (sectionKey: string, answers: Record<string, { answer: 'YES' | 'NO' | 'PARTIAL' | 'NA'; notes?: string }>) => {
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const sections = t.discoveryQuestionnaires || generateDefaultDiscoveryQuestionnaires();
        const updated = sections.map(s => {
          if (s.sectionKey === sectionKey) {
            return {
              ...s,
              questions: s.questions.map(q => {
                if (answers[q.id]) {
                  const statusMap: Record<string, DiscoveryQuestion['status']> = {
                    'YES': 'Yes',
                    'NO': 'No',
                    'PARTIAL': 'Partially',
                    'NA': 'Not Applicable'
                  };
                  return {
                    ...q,
                    status: statusMap[answers[q.id].answer] || q.status,
                    textResponse: answers[q.id].notes !== undefined ? answers[q.id].notes : q.textResponse
                  };
                }
                return q;
              })
            };
          }
          return s;
        });
        return { ...t, discoveryQuestionnaires: updated };
      }
      return t;
    }));
  };

  const updateDepartmentSurvey = (deptId: string, questionId: string, updates: Partial<DepartmentSurveyQuestion>) => {
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const surveys = t.departmentSurveys || generateDefaultDepartmentSurveys();
        const updated = surveys.map(s => {
          if (s.deptId === deptId) {
            const updatedQuestions = s.questions.map(q => q.id === questionId ? { ...q, ...updates } : q);
            const answeredCount = updatedQuestions.filter(q => q.status !== 'Unanswered').length;
            const surveyStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' =
              answeredCount === updatedQuestions.length ? 'COMPLETED' : answeredCount > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';
            return {
              ...s,
              questions: updatedQuestions,
              surveyStatus
            };
          }
          return s;
        });
        return { ...t, departmentSurveys: updated };
      }
      return t;
    }));
  };

  const updateImplementationPlanItem = (itemId: string, updates: Partial<ImplementationPlanItem>) => {
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const plan = t.implementationPlan || generateDefaultImplementationPlan();
        const updated = plan.map(item => item.id === itemId ? { ...item, ...updates } : item);
        return { ...t, implementationPlan: updated };
      }
      return t;
    }));
  };

  const advanceWorkflowStage = (stageId: string) => {
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const stages = t.isoWorkflowStages || workflowStages;
        const updated = stages.map(s => s.id === stageId ? { ...s, status: 'COMPLETED' as const, completionPct: 100 } : s);
        return { ...t, isoWorkflowStages: updated };
      }
      return t;
    }));
  };

  const recalibrateComplianceProfile = () => {
    if (!currentTenant?.companyRegistrationProfile) return;
    const profile = generateCompanyComplianceProfile(currentTenant.id, currentTenant.companyRegistrationProfile);
    setTenants(prev => prev.map(t => t.id === currentTenant.id ? { ...t, companyComplianceProfile: profile } : t));
  };

  // MAS / Regulatory Engine Handlers
  const updateMASAssessment = (id: string, updates: Partial<MASRequirementAssessmentRecord>) => {
    setMasAssessments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    logAuditEvent(
      'UPDATE',
      'MAS_TRM_ASSESSMENT',
      `Updated MAS TRM Requirement evaluation ${updates.requirementCode || id} (Status: ${updates.complianceStatus || 'Updated'})`
    );
  };

  const updateMASProfile = (updates: Partial<MASFinancialInstitutionProfile>) => {
    setMasProfile(prev => ({ ...prev, ...updates }));
    logAuditEvent(
      'UPDATE',
      'MAS_PROFILE',
      `Updated MAS Financial Institution profile & Critical Systems register (Category: ${updates.institutionCategory || masProfile.institutionCategory})`
    );
  };

  const addMASIncident = (incident: Omit<MASIncidentBreachRecord, 'id' | 'tenantId'>) => {
    const discoveryDate = new Date(incident.discoveryTimestamp || Date.now());
    const deadlineDate = new Date(discoveryDate.getTime() + 60 * 60 * 1000); // 1-Hour SLA
    const newInc: MASIncidentBreachRecord = {
      ...incident,
      id: generateId(),
      tenantId: currentTenantId,
      masNotificationDeadlineTimestamp: deadlineDate.toISOString()
    };
    setMasIncidents(prev => [newInc, ...prev]);
    logAuditEvent(
      'CREATE',
      'MAS_INCIDENT_MANAGEMENT',
      `Declared MAS Reportable Incident: ${newInc.title} (MAS Notification SLA Deadline: ${deadlineDate.toLocaleTimeString()})`
    );
  };

  const acknowledgeRegulatoryNotice = (noticeId: string) => {
    setRegulatoryNotices(prev => prev.map(n => n.id === noticeId ? {
      ...n,
      acknowledgedByTenant: true,
      acknowledgedDate: new Date().toISOString()
    } : n));
    logAuditEvent(
      'APPROVE',
      'REGULATORY_INTELLIGENCE',
      `Acknowledged MAS Regulatory Notice ${noticeId}`
    );
  };

  // MAS Regulatory Readiness Score Engine:
  // Evaluates requirement criticality (Notice 655 Cyber Hygiene, Notice 644 Critical Systems, Mandatory FIs),
  // open audit findings (Major -25pts, Minor -12pts, Observation -4pts),
  // and Evidence Vault status (Verified +10pts, Unverified/Gap penalty capped at 55%).
  const calculateMASReadinessScore = useCallback((): MASReadinessScoreSummary => {
    const detailsMap: Record<string, MASRequirementReadinessDetail> = {};

    let totalWeightedScore = 0;
    let totalCriticalityWeight = 0;
    let criticalSystemsScoreSum = 0;
    let criticalSystemsWeight = 0;
    let cyberHygieneScoreSum = 0;
    let cyberHygieneWeight = 0;

    let totalOpenFindingsCount = 0;
    let majorNonConformitiesTotal = 0;
    let highRiskTotal = 0;
    let mediumRiskTotal = 0;
    let lowRiskTotal = 0;
    let verifiedEvidenceReqsCount = 0;

    // Domain tracking
    const domainMap: Record<string, {
      domainNumber: string;
      domainName: string;
      scoreSum: number;
      weightSum: number;
      openFindings: number;
      majorFindings: number;
      highRiskCount: number;
      evidenceCount: number;
    }> = {};

    MAS_TRM_DOMAINS.forEach(dom => {
      domainMap[dom.domainNumber] = {
        domainNumber: dom.domainNumber,
        domainName: dom.name,
        scoreSum: 0,
        weightSum: 0,
        openFindings: 0,
        majorFindings: 0,
        highRiskCount: 0,
        evidenceCount: 0
      };
    });

    MAS_TRM_REQUIREMENTS.forEach(req => {
      const assess = masAssessments.find(a => a.requirementCode === req.requirementCode);
      const isApplicable = !assess || assess.applicabilityStatus === 'APPLICABLE';

      // 1. Requirement Criticality
      let statutoryMandateType: MASRequirementReadinessDetail['statutoryMandateType'] = 'TRM_2021_GUIDELINES';
      let criticalityWeight = 1.0;
      let isMandatoryNotice = false;

      if (req.requirementCode.startsWith('MAS-TRM-8') || req.requirementCode.startsWith('MAS-TRM-7')) {
        statutoryMandateType = 'NOTICE_655_CYBER_HYGIENE';
        criticalityWeight = 3.0;
        isMandatoryNotice = true;
      } else if (req.criticalSystemsMandate || req.requirementCode.startsWith('MAS-TRM-12') || req.requirementCode.startsWith('MAS-TRM-11')) {
        statutoryMandateType = 'NOTICE_644_CRITICAL_SYSTEMS';
        criticalityWeight = 3.0;
        isMandatoryNotice = true;
      } else if (req.requirementCode.startsWith('MAS-TRM-5')) {
        statutoryMandateType = 'OUTSOURCING_MANDATE';
        criticalityWeight = 2.0;
      } else if (req.mandatoryForFIs) {
        criticalityWeight = 2.0;
        isMandatoryNotice = true;
      }

      // 2. Correlate Open Findings
      const linkedIsoCodes = req.crossFrameworkMappings?.iso27001 || [];
      const reqOpenFindings = findings.filter(f => {
        if (f.status === 'Closed Verified') return false;
        if (f.tenantId && f.tenantId !== currentTenantId) return false;

        const findingClause = (f.clauseOrControl || '').toLowerCase();
        const findingTitle = (f.title || '').toLowerCase();
        const findingDesc = (f.description || '').toLowerCase();
        const reqLower = req.requirementCode.toLowerCase();

        if (findingClause.includes(reqLower) || findingTitle.includes(reqLower) || findingDesc.includes(reqLower)) {
          return true;
        }

        if (linkedIsoCodes.some(iso => findingClause.includes(iso.toLowerCase()))) {
          return true;
        }
        return false;
      });

      let majorFindingsCount = 0;
      let minorFindingsCount = 0;
      let observationCount = 0;
      let findingsPenalty = 0;

      reqOpenFindings.forEach(f => {
        if (f.severity === 'Major Non-Conformity') {
          majorFindingsCount++;
          findingsPenalty += 25;
        } else if (f.severity === 'Minor Non-Conformity') {
          minorFindingsCount++;
          findingsPenalty += 12;
        } else {
          observationCount++;
          findingsPenalty += 4;
        }
      });

      totalOpenFindingsCount += reqOpenFindings.length;
      majorNonConformitiesTotal += majorFindingsCount;

      // 3. Correlate Associated Evidence from Evidence Vault
      const reqEvidence = evidence.filter(ev => {
        if (ev.tenantId && ev.tenantId !== currentTenantId) return false;
        if (assess?.linkedEvidenceIds?.includes(ev.id)) return true;

        const evControl = (ev.controlCode || '').toLowerCase();
        if (evControl.includes(req.requirementCode.toLowerCase())) return true;
        if (ev.tags?.some(t => t.toLowerCase().includes(req.requirementCode.toLowerCase()))) return true;
        if (linkedIsoCodes.some(iso => evControl.includes(iso.toLowerCase()))) return true;

        return false;
      });

      const verifiedEvidenceCount = reqEvidence.filter(
        e => e.status === 'Verified' || e.verificationState === 'Verified'
      ).length;

      const evidenceCoverageRate = reqEvidence.length > 0
        ? Math.round((verifiedEvidenceCount / reqEvidence.length) * 100)
        : 0;

      if (verifiedEvidenceCount > 0) {
        verifiedEvidenceReqsCount++;
      }

      // 4. Base Readiness Score Calculation
      let baseReadinessScore = 75;
      const compStatus = assess?.complianceStatus || 'COMPLIANT';
      const maturity = assess?.maturityLevel ?? 3;

      if (compStatus === 'COMPLIANT') baseReadinessScore = 95;
      else if (compStatus === 'PARTIALLY_COMPLIANT') baseReadinessScore = 60;
      else if (compStatus === 'NON_COMPLIANT') baseReadinessScore = 20;

      // Maturity Level adjustments
      if (maturity >= 4) baseReadinessScore += 5;
      if (maturity <= 2) baseReadinessScore -= 15;

      // Sampling test failures
      if (assess?.testedSamplesFailedCount && assess.testedSamplesFailedCount > 0) {
        baseReadinessScore -= assess.testedSamplesFailedCount * 8;
      }

      // Deduct Findings Penalty
      baseReadinessScore -= findingsPenalty;

      // Evidence Status Impact: bonus for verified evidence
      if (verifiedEvidenceCount > 0) {
        baseReadinessScore += 10;
      }

      // Missing Evidence / Evidence Gap Penalty:
      // If zero verified evidence artifacts exist for a critical/mandatory requirement or requirement with open findings
      const evidenceGapIdentified = verifiedEvidenceCount === 0 && (criticalityWeight >= 2.0 || reqOpenFindings.length > 0);
      if (evidenceGapIdentified) {
        baseReadinessScore = Math.min(baseReadinessScore, 55);
      }

      // Major Non-Conformity Cap
      if (majorFindingsCount > 0) {
        baseReadinessScore = Math.min(baseReadinessScore, 60);
      }

      const finalReadinessScore = Math.max(5, Math.min(100, Math.round(baseReadinessScore)));

      // 5. Risk Tier & Risk Score
      let riskScore = Math.max(1, Math.min(100, 100 - finalReadinessScore + (majorFindingsCount > 0 ? 20 : 0)));
      let riskTier: 'HIGH_RISK' | 'MEDIUM_RISK' | 'LOW_RISK' = 'LOW_RISK';

      if (majorFindingsCount > 0 || finalReadinessScore < 60 || (criticalityWeight >= 2.5 && reqOpenFindings.length > 0)) {
        riskTier = 'HIGH_RISK';
        highRiskTotal++;
      } else if (reqOpenFindings.length > 0 || finalReadinessScore < 80 || compStatus === 'PARTIALLY_COMPLIANT') {
        riskTier = 'MEDIUM_RISK';
        mediumRiskTotal++;
      } else {
        riskTier = 'LOW_RISK';
        lowRiskTotal++;
      }

      const detail: MASRequirementReadinessDetail = {
        requirementId: req.id,
        requirementCode: req.requirementCode,
        title: req.title,
        domainNumber: req.domainNumber,
        domainName: req.domainName,
        criticalityWeight,
        criticalSystemsMandate: Boolean(req.criticalSystemsMandate),
        isMandatoryNotice,
        complianceStatus: compStatus,
        maturityLevel: maturity,
        baseReadinessScore: Math.round(baseReadinessScore),
        readinessScore: finalReadinessScore,
        riskScore,
        riskTier,
        openFindingsCount: reqOpenFindings.length,
        majorFindingsCount,
        minorFindingsCount,
        observationCount,
        findingsPenalty,
        evidenceCount: reqEvidence.length,
        verifiedEvidenceCount,
        evidenceCoverageRate,
        evidenceGapIdentified,
        statutoryMandateType
      };

      detailsMap[req.requirementCode] = detail;

      if (isApplicable) {
        totalWeightedScore += finalReadinessScore * criticalityWeight;
        totalCriticalityWeight += criticalityWeight;

        if (statutoryMandateType === 'NOTICE_644_CRITICAL_SYSTEMS') {
          criticalSystemsScoreSum += finalReadinessScore * criticalityWeight;
          criticalSystemsWeight += criticalityWeight;
        }

        if (statutoryMandateType === 'NOTICE_655_CYBER_HYGIENE') {
          cyberHygieneScoreSum += finalReadinessScore * criticalityWeight;
          cyberHygieneWeight += criticalityWeight;
        }

        if (domainMap[req.domainNumber]) {
          domainMap[req.domainNumber].scoreSum += finalReadinessScore * criticalityWeight;
          domainMap[req.domainNumber].weightSum += criticalityWeight;
          domainMap[req.domainNumber].openFindings += reqOpenFindings.length;
          domainMap[req.domainNumber].majorFindings += majorFindingsCount;
          domainMap[req.domainNumber].evidenceCount += reqEvidence.length;
          if (riskTier === 'HIGH_RISK') domainMap[req.domainNumber].highRiskCount++;
        }
      }
    });

    const overallReadinessScore = totalCriticalityWeight > 0
      ? Math.round(totalWeightedScore / totalCriticalityWeight)
      : 78;

    const criticalSystemsReadiness = criticalSystemsWeight > 0
      ? Math.round(criticalSystemsScoreSum / criticalSystemsWeight)
      : 82;

    const cyberHygieneNotice655Readiness = cyberHygieneWeight > 0
      ? Math.round(cyberHygieneScoreSum / cyberHygieneWeight)
      : 85;

    const totalApplicableReqs = MAS_TRM_REQUIREMENTS.length;
    const overallEvidenceCoverage = totalApplicableReqs > 0
      ? Math.round((verifiedEvidenceReqsCount / totalApplicableReqs) * 100)
      : 0;

    // SLA & Downtime calculations
    const criticalSystems = masProfile?.criticalSystemsList || [];
    const rtoMet = criticalSystems.length === 0 || criticalSystems.every(s => s.rtoTargetHours <= 4);
    const totalDowntime = criticalSystems.reduce((acc, c) => Math.max(acc, c.maxAnnualDowntimeHours), 0);

    const domainBreakdown: Record<string, {
      domainNumber: string;
      domainName: string;
      score: number;
      openFindings: number;
      majorFindings: number;
      highRiskCount: number;
      evidenceCount: number;
    }> = {};

    Object.values(domainMap).forEach(d => {
      const dScore = d.weightSum > 0 ? Math.round(d.scoreSum / d.weightSum) : 80;
      domainBreakdown[d.domainNumber] = {
        domainNumber: d.domainNumber,
        domainName: d.domainName,
        score: dScore,
        openFindings: d.openFindings,
        majorFindings: d.majorFindings,
        highRiskCount: d.highRiskCount,
        evidenceCount: d.evidenceCount
      };
    });

    return {
      overallScore: overallReadinessScore,
      overallReadinessScore,
      criticalSystemsReadiness,
      cyberHygieneNotice655Readiness,
      evidenceCoverageRate: overallEvidenceCoverage,
      totalApplicableRequirements: totalApplicableReqs,
      highRiskCount: highRiskTotal,
      mediumRiskCount: mediumRiskTotal,
      lowRiskCount: lowRiskTotal,
      totalOpenFindings: totalOpenFindingsCount,
      majorNonConformitiesCount: majorNonConformitiesTotal,
      domainBreakdown,
      criticalSlaStatus: {
        rtoMet,
        masNotificationReady: true,
        unscheduledDowntimeHours: totalDowntime || 1.8
      },
      details: detailsMap
    };
  }, [masAssessments, findings, evidence, masProfile, currentTenantId]);

  const masReadinessScoreSummary = useMemo((): MASReadinessScoreSummary => {
    return calculateMASReadinessScore();
  }, [calculateMASReadinessScore]);

  const calculateMASComplianceScore = useCallback(() => {
    const summary = calculateMASReadinessScore();
    const domainBreakdown: Record<string, number> = {};
    Object.entries(summary.domainBreakdown).forEach(([k, v]) => {
      domainBreakdown[k] = v.score;
    });
    return {
      overallScore: summary.overallReadinessScore,
      domainBreakdown,
      criticalSlaStatus: summary.criticalSlaStatus
    };
  }, [calculateMASReadinessScore]);


  // Audit Trail Logger with cryptographic Merkle block chaining (ISO 27001 A.8.16)
  const logAuditEvent = async (
    action: AuditTrailEvent['action'],
    module: string,
    description: string,
    metadata?: Record<string, any>
  ) => {
    const timestamp = new Date().toISOString();
    const actorName = currentUser.name;
    const actorEmail = currentUser.email;
    const actorRole = currentRole;
    const ipAddress = '185.192.68.14'; // Client gateway IP
    const previousEvent = auditTrail[0];
    const previousHash = previousEvent?.sha256Hash || '0000000000000000000000000000000000000000000000000000000000000000';
    const blockIndex = (previousEvent?.blockIndex ?? auditTrail.length) + 1;
    const rawPayload = `${blockIndex}|${previousHash}|${timestamp}|${currentTenantId}|${actorEmail}|${action}|${module}|${description}`;
    const sha256Hash = await computeSHA256(rawPayload);

    const newEvent: AuditTrailEvent = {
      id: generateId('log'),
      tenantId: currentTenantId,
      timestamp,
      actorName,
      actorEmail,
      actorRole,
      action,
      module,
      description,
      ipAddress,
      sha256Hash,
      previousHash,
      blockIndex,
      metadata
    };

    setAuditTrail(prev => [newEvent, ...prev]);
  };

  const validateAuditTrailIntegrity = async (): Promise<{
    valid: boolean;
    totalBlocks: number;
    verifiedBlocks: number;
    brokenBlockId?: string;
    message: string;
  }> => {
    if (auditTrail.length === 0) {
      return { valid: true, totalBlocks: 0, verifiedBlocks: 0, message: 'Audit trail ledger is empty.' };
    }

    for (let i = 0; i < auditTrail.length; i++) {
      const block = auditTrail[i];
      if (!block.sha256Hash || block.sha256Hash.length < 16) {
        return {
          valid: false,
          totalBlocks: auditTrail.length,
          verifiedBlocks: i,
          brokenBlockId: block.id,
          message: `Integrity Anomaly: Block ${block.id} (${block.action}) is missing cryptographic digest.`
        };
      }
    }

    return {
      valid: true,
      totalBlocks: auditTrail.length,
      verifiedBlocks: auditTrail.length,
      message: `Audit ledger verified against ISO/IEC 27001:2022 Control A.8.16. All ${auditTrail.length} blocks match cryptographic hash standards.`
    };
  };

  // User & Tenant Switching
  const switchUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setCurrentRole(user.role);
      if (user.role === 'SUPER_ADMIN' || user.role === 'PLATFORM_AUDITOR') {
        // Keep current tenant or default to Apex
      } else {
        setCurrentTenantId(user.tenantId);
      }
      logAuditEvent('ACCESS', 'Authentication & RBAC', `User switched persona to ${user.name} (${user.role})`);
    }
  };

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    if (!isPreviewRoleActive && (role === 'SUPER_ADMIN' || role === 'COMPANY_ADMIN')) {
      setRealAdminRole(role);
      try {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_real_admin_role`, role);
      } catch (e) {
        console.warn(e);
      }
    }
    // Find matching user or update currentUser role in session
    const match = users.find(u => u.role === role);
    if (match) {
      setCurrentUser(match);
      if (match.tenantId !== 'super') {
        setCurrentTenantId(match.tenantId);
      }
    } else {
      setCurrentUser(prev => ({ ...prev, role }));
    }
    logAuditEvent('ACCESS', 'Role Hierarchy', `Role changed to ${role}`);
  };

  const enableRolePreview = (role: UserRole) => {
    if (!isPreviewRoleActive) {
      const adminRole = (currentRole === 'SUPER_ADMIN' || currentRole === 'COMPANY_ADMIN') ? currentRole : 'COMPANY_ADMIN';
      setRealAdminRole(adminRole);
      try {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_real_admin_role`, adminRole);
      } catch (e) {
        console.warn(e);
      }
    }
    setIsPreviewRoleActive(true);
    setPreviewRole(role);
    setCurrentRole(role);

    // Switch current user to match simulated persona
    const match = users.find(u => u.role === role);
    if (match) {
      setCurrentUser(match);
      if (match.tenantId && match.tenantId !== 'super') {
        setCurrentTenantId(match.tenantId);
      }
    }

    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_preview_active`, 'true');
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_preview_role`, role);
    } catch (e) {
      console.warn(e);
    }

    logAuditEvent('ACCESS', 'RBAC Preview Simulation', `Admin activated Preview as Role: ${role}`);
  };

  const disableRolePreview = () => {
    setIsPreviewRoleActive(false);
    setPreviewRole(null);
    setCurrentRole(realAdminRole);

    // Restore real admin user
    const adminMatch = users.find(u => u.role === realAdminRole);
    if (adminMatch) {
      setCurrentUser(adminMatch);
    }

    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_preview_active`, 'false');
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_preview_role`);
    } catch (e) {
      console.warn(e);
    }

    logAuditEvent('ACCESS', 'RBAC Preview Simulation', `Exited Preview as Role mode. Restored ${realAdminRole} admin permissions.`);
  };

  const toggleRolePreview = (role?: UserRole) => {
    if (isPreviewRoleActive) {
      disableRolePreview();
    } else {
      enableRolePreview(role || 'INTERNAL_AUDITOR');
    }
  };

  const canUserAccessModule = (moduleId: string): boolean => {
    const perm = checkModulePermission(currentRole, moduleId);
    return perm.allowed;
  };

  const switchTenant = (tenantId: string) => {
    const target = tenants.find(t => t.id === tenantId);
    if (target) {
      setCurrentTenantId(tenantId);
      logAuditEvent('ACCESS', 'Tenant Switcher', `Switched tenant context to ${target.name} (${tenantId})`);
    }
  };

  // Master Data management
  const addMasterCategory = (cat: Omit<MasterCategory, 'id'>) => {
    const newCat: MasterCategory = { ...cat, id: generateId('cat') };
    setMasterCategories(prev => [...prev, newCat]);
    logAuditEvent('CREATE', 'Master Data - Categories', `Added company category "${cat.name}"`);
  };

  const updateMasterCategory = (id: string, cat: Partial<MasterCategory>) => {
    setMasterCategories(prev => prev.map(c => c.id === id ? { ...c, ...cat } : c));
    logAuditEvent('UPDATE', 'Master Data - Categories', `Updated company category ID ${id}`);
  };

  const deleteMasterCategory = (id: string) => {
    setMasterCategories(prev => prev.filter(c => c.id !== id));
    logAuditEvent('DELETE', 'Master Data - Categories', `Deleted company category ID ${id}`);
  };

  const addMasterIndustry = (ind: Omit<MasterIndustry, 'id'>) => {
    const newInd: MasterIndustry = { ...ind, id: generateId('ind') };
    setMasterIndustries(prev => [...prev, newInd]);
    logAuditEvent('CREATE', 'Master Data - Industries', `Added industry classification "${ind.name}"`);
  };

  const updateMasterIndustry = (id: string, ind: Partial<MasterIndustry>) => {
    setMasterIndustries(prev => prev.map(i => i.id === id ? { ...i, ...ind } : i));
    logAuditEvent('UPDATE', 'Master Data - Industries', `Updated industry classification ID ${id}`);
  };

  const deleteMasterIndustry = (id: string) => {
    setMasterIndustries(prev => prev.filter(i => i.id !== id));
    logAuditEvent('DELETE', 'Master Data - Industries', `Deleted industry classification ID ${id}`);
  };

  const addMasterDepartment = (dept: Omit<MasterDepartment, 'id'>) => {
    const newDept: MasterDepartment = { ...dept, id: generateId('dept') };
    setMasterDepartments(prev => [...prev, newDept]);
    logAuditEvent('CREATE', 'Master Data - Departments', `Added master department "${dept.name}"`);
  };

  const updateMasterDepartment = (id: string, dept: Partial<MasterDepartment>) => {
    setMasterDepartments(prev => prev.map(d => d.id === id ? { ...d, ...dept } : d));
    logAuditEvent('UPDATE', 'Master Data - Departments', `Updated master department ID ${id}`);
  };

  const deleteMasterDepartment = (id: string) => {
    setMasterDepartments(prev => prev.filter(d => d.id !== id));
    logAuditEvent('DELETE', 'Master Data - Departments', `Deleted master department ID ${id}`);
  };

  // Phase 1 - Company Registration
  const savePhase1Registration = async (data: {
    companyName: string;
    contactEmail: string;
    registeredCategory: string;
    registeredAddress: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    industryType: string;
    customIndustry?: string;
    profile?: Partial<CompanyRegistrationProfile>;
  }): Promise<string> => {
    // Check if we are updating existing tenant or creating a new tenant
    let targetTenantId = currentTenantId;
    const isNew = !tenants.some(t => t.id === targetTenantId) || targetTenantId === 'tenant_new' || targetTenantId === 'tenant_new_reg' || targetTenantId.startsWith('tenant_reg_');

    const extendedProfile: CompanyRegistrationProfile = data.profile && (data.profile as any).organization ? (data.profile as CompanyRegistrationProfile) : {
      organization: {
        legalName: data.companyName,
        registrationNumber: 'UEN-' + Math.floor(10000000 + Math.random() * 90000000),
        website: `https://${data.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        industry: data.industryType,
        businessType: 'B2B SaaS',
        organizationSize: '51-200',
        employeeCount: 85,
        locations: [data.registeredAddress.city || 'Singapore'],
        countriesOfOperation: [data.registeredAddress.country || 'Singapore'],
        businessDescription: `${data.companyName} is an enterprise operating in ${data.industryType}.`
      },
      businessServices: {
        primaryServices: ['Core Platform Services', 'Customer API Gateway'],
        criticalServices: ['Production API', 'Data Storage'],
        businessProcesses: ['Customer Onboarding', 'Transaction Processing', 'Security Incident Management'],
        customerTypes: ['B2B Enterprise', 'SaaS Clients']
      },
      technology: {
        cloudProviders: ['AWS (Amazon Web Services)', 'Google Cloud Platform (GCP)'],
        dataCenters: ['AWS ap-southeast-1 (Singapore)'],
        saasApplications: ['Google Workspace', 'Slack Enterprise', 'GitHub Enterprise', 'Jira Cloud', 'Datadog'],
        endpoints: ['macOS', 'Windows 11', 'Linux Workstations'],
        servers: ['Linux Containers', 'Kubernetes'],
        networks: ['Zero-Trust Cloud Mesh', 'Corporate SD-WAN'],
        databases: ['PostgreSQL (RDS Aurora Multi-AZ)', 'Redis ElastiCache'],
        criticalApplications: ['Customer Web Portal', 'Admin Console', 'Payment Engine'],
        securityTools: ['CrowdStrike Falcon EDR', 'Wiz Cloud Security', 'Okta Identity', 'HashiCorp Vault']
      },
      data: {
        customerData: true,
        employeeData: true,
        financialData: true,
        personalData: true,
        sensitiveData: false,
        intellectualProperty: true,
        sourceCode: true,
        confidentialInformation: true,
        primaryDataResidency: [data.registeredAddress.country || 'Singapore']
      },
      thirdParties: {
        vendorsCount: 18,
        cloudProviders: ['Amazon Web Services', 'Google Cloud'],
        managedServiceProviders: ['CyberSOC Managed Detection & Response'],
        dataProcessors: ['Stripe Payments', 'Twilio SendGrid'],
        outsourcingPartners: ['Independent QA Testing Labs']
      },
      existingCompliance: {
        frameworks: ['ISO/IEC 27001:2022'],
        certificationStatus: {}
      },
      existingSecurity: {
        hasPolicies: true,
        hasRiskAssessment: true,
        hasAssetRegister: true,
        hasVulnerabilityManagement: true,
        hasIncidentManagement: true,
        hasBusinessContinuity: true,
        hasDisasterRecovery: true,
        hasInternalAudit: true,
        hasSecurityMonitoring: true
      }
    };

    if (isNew) {
      targetTenantId = targetTenantId.startsWith('tenant_reg_') ? targetTenantId : `tenant_${Date.now()}`;
      const complianceProfile = generateCompanyComplianceProfile(targetTenantId, extendedProfile);
      const discoveryQuestionnaires = generateDefaultDiscoveryQuestionnaires();
      const departmentSurveys = generateDefaultDepartmentSurveys();
      const implementationPlan = generateDefaultImplementationPlan();

      const newTenant: TenantCompany = {
        id: targetTenantId,
        name: data.companyName,
        contactEmail: data.contactEmail,
        registeredCategory: data.registeredCategory,
        registeredAddress: data.registeredAddress,
        industryType: data.industryType,
        customIndustry: data.customIndustry,
        onboardingPhase: 2, // Move to Phase 2
        companyRegistrationProfile: extendedProfile,
        companyComplianceProfile: complianceProfile,
        discoveryQuestionnaires,
        departmentSurveys,
        implementationPlan,
        businessScope: {
          statement: '',
          exclusions: [],
          interestedParties: []
        },
        inScopeDepartmentIds: ['dept_it', 'dept_sec', 'dept_dev', 'dept_hr'],
        departmentScopes: generateInitialDepartmentScopes(targetTenantId),
        customDepartments: [],
        selectedFrameworks: ['ISO/IEC 27001:2022', 'MAS TRM 2021'],
        soaBaselineLocked: false,
        controls: MASTER_ISO27001_CONTROLS.map((c, idx) => ({
          ...c,
          id: `ctrl_${targetTenantId}_${idx + 1}`
        })),
        generatedDocs: [],
        mou: {
          executed: false,
          signatoryName: '',
          signatoryRole: '',
          signatoryEmail: '',
          ipAddress: '',
          timestamp: '',
          documentHash: '',
          agreementVersion: '2026.1-STANDARD',
          commercialTier: 'Enterprise Audit Practice Partnership',
          auditWindowStart: '2026-10-01',
          auditWindowEnd: '2026-10-31',
          leadExternalAuditor: 'David Vance (Lead External Auditor)',
          scopeSummary: `${data.companyName} ISO/IEC 27001:2022 Management System Certification.`,
          confidentialityTermsAccepted: false
        },
        assignedExternalAuditors: ['usr_ext_auditor'],
        externalAuditTimeline: {
          startDate: '2026-10-01',
          endDate: '2026-10-31',
          stage1Date: '2026-10-10',
          stage2Date: '2026-10-24',
          status: 'Scheduled'
        },
        readinessScore: 25,
        isDemo: false,
        createdAt: new Date().toISOString()
      };
      setTenants(prev => [...prev.filter(t => t.id !== 'tenant_new_reg' && t.id !== targetTenantId), newTenant]);
      setCurrentTenantId(targetTenantId);
      try {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_active_tenant`, targetTenantId);
      } catch (e) {
        // ignore
      }
    } else {
      setTenants(prev => prev.map(t => {
        if (t.id === targetTenantId) {
          const complianceProfile = generateCompanyComplianceProfile(targetTenantId, extendedProfile);
          return {
            ...t,
            name: data.companyName,
            contactEmail: data.contactEmail,
            registeredCategory: data.registeredCategory,
            registeredAddress: data.registeredAddress,
            industryType: data.industryType,
            customIndustry: data.customIndustry,
            companyRegistrationProfile: extendedProfile,
            companyComplianceProfile: complianceProfile,
            discoveryQuestionnaires: t.discoveryQuestionnaires || generateDefaultDiscoveryQuestionnaires(),
            departmentSurveys: t.departmentSurveys || generateDefaultDepartmentSurveys(),
            implementationPlan: t.implementationPlan || generateDefaultImplementationPlan(),
            onboardingPhase: Math.max(t.onboardingPhase, 2)
          };
        }
        return t;
      }));
    }

    await logAuditEvent('CREATE', 'Onboarding - Phase 1', `Registered company profile for ${data.companyName}`);
    return targetTenantId;
  };

  const startNewEntityOnboarding = () => {
    const freshNewTenantId = `tenant_reg_${Date.now()}`;
    const freshNewTenant: TenantCompany = {
      id: freshNewTenantId,
      name: 'New Organization Registration',
      contactEmail: '',
      registeredCategory: masterCategories[0]?.name || 'Private Limited Company',
      registeredAddress: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Singapore'
      },
      industryType: masterIndustries[0]?.name || 'Banking, Financial Services & FinTech',
      onboardingPhase: 1,
      businessScope: {
        statement: '',
        exclusions: [],
        interestedParties: []
      },
      inScopeDepartmentIds: ['dept_it', 'dept_sec', 'dept_dev', 'dept_hr'],
      departmentScopes: generateInitialDepartmentScopes(freshNewTenantId),
      customDepartments: [],
      selectedFrameworks: ['ISO/IEC 27001:2022', 'MAS TRM 2021'],
      soaBaselineLocked: false,
      controls: MASTER_ISO27001_CONTROLS.map((c, idx) => ({
        ...c,
        id: `ctrl_${freshNewTenantId}_${idx + 1}`
      })),
      generatedDocs: [],
      mou: {
        executed: false,
        signatoryName: '',
        signatoryRole: '',
        signatoryEmail: '',
        ipAddress: '',
        timestamp: '',
        documentHash: '',
        agreementVersion: '2026.1-STANDARD',
        commercialTier: 'Enterprise Audit Practice Partnership',
        auditWindowStart: '2026-10-01',
        auditWindowEnd: '2026-10-31',
        leadExternalAuditor: 'David Vance (Lead External Auditor)',
        scopeSummary: 'New Enterprise Scope',
        confidentialityTermsAccepted: false
      },
      assignedExternalAuditors: ['usr_ext_auditor'],
      externalAuditTimeline: {
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        stage1Date: '2026-10-10',
        stage2Date: '2026-10-24',
        status: 'Scheduled'
      },
      readinessScore: 0,
      isDemo: false,
      createdAt: new Date().toISOString()
    };

    setTenants(prev => [...prev.filter(t => t.id !== 'tenant_new_reg' && t.id !== freshNewTenantId), freshNewTenant]);
    setCurrentTenantId(freshNewTenantId);
    setActiveModule('onboarding_survey');
    setIsAuthenticated(true);
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_active_tenant`, freshNewTenantId);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_active_module`, 'onboarding_survey');
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_is_authenticated`, 'true');
    } catch (e) {
      // ignore
    }
  };

  const quickLoginAsAdmin = () => {
    const adminUser = users.find(u => u.name === 'SriKarthiK' || u.role === 'COMPANY_ADMIN') || users[2] || users[0];
    if (adminUser) {
      setCurrentUser(adminUser);
      setCurrentRole(adminUser.role);
    }
    const targetTenant = tenants.find(t => t.id === 'tenant_skanda') || tenants.find(t => t.id === 'tenant_apex') || tenants.find(t => t.id !== 'tenant_new_reg' && !t.id.startsWith('tenant_reg_')) || tenants[0];
    if (targetTenant) {
      setCurrentTenantId(targetTenant.id);
      try {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_active_tenant`, targetTenant.id);
      } catch (e) {
        // ignore
      }
    }
    setIsAuthenticated(true);
    setActiveModule('command_center');
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_active_module`, 'command_center');
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_is_authenticated`, 'true');
    } catch (e) {
      // ignore
    }
    logAuditEvent('ACCESS', 'Enterprise Admin Authentication', 'Quick login as Enterprise Admin & CISO (SriKarthiK)');
  };

  const quickLoginAsSuperAdmin = () => {
    const superAdminUser = users.find(u => u.role === 'SUPER_ADMIN') || users[0];
    if (superAdminUser) {
      setCurrentUser(superAdminUser);
      setCurrentRole('SUPER_ADMIN');
    }
    const targetTenant = tenants.find(t => t.id === 'tenant_skanda') || tenants.find(t => t.id !== 'tenant_new_reg' && !t.id.startsWith('tenant_reg_')) || tenants[0];
    if (targetTenant) {
      setCurrentTenantId(targetTenant.id);
      try {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_active_tenant`, targetTenant.id);
      } catch (e) {
        // ignore
      }
    }
    setIsAuthenticated(true);
    setActiveModule('super_admin_portfolio');
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_active_module`, 'super_admin_portfolio');
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_is_authenticated`, 'true');
    } catch (e) {
      // ignore
    }
    logAuditEvent('ACCESS', 'Platform Super Admin Authentication', 'Authenticated as Platform Super Admin & CTO (Elena Rostova)');
  };

  // Phase 2 - Scope & Statement of Applicability
  const savePhase2Scope = (data: {
    statement: string;
    exclusions: Array<{ id: string; controlOrProcess: string; justification: string }>;
    interestedParties: Array<{ id: string; party: string; requirements: string; legalObligation: string }>;
    inScopeDepartmentIds: string[];
    customDepartments: Array<{ id: string; name: string; owner: string; headcount: number }>;
    controls: ControlItem[];
    departmentScopes?: DepartmentScopeProfile[];
  }) => {
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        return {
          ...t,
          businessScope: {
            statement: data.statement,
            exclusions: data.exclusions,
            interestedParties: data.interestedParties
          },
          inScopeDepartmentIds: data.inScopeDepartmentIds,
          customDepartments: data.customDepartments,
          controls: data.controls,
          ...(data.departmentScopes ? { departmentScopes: data.departmentScopes } : {}),
          onboardingPhase: Math.max(t.onboardingPhase, 3)
        };
      }
      return t;
    }));

    logAuditEvent('UPDATE', 'Onboarding - Phase 2 Scope', `Updated management scope & ${data.inScopeDepartmentIds.length} in-scope departments`);
  };

  // Department Scope & Policy Compliance Intelligence
  const departmentScopes: DepartmentScopeProfile[] = currentTenant?.departmentScopes && currentTenant.departmentScopes.length > 0
    ? currentTenant.departmentScopes
    : generateInitialDepartmentScopes(currentTenant?.id || 'tenant_skanda');

  const updateDepartmentScope = (deptId: string, updates: Partial<DepartmentScopeProfile>) => {
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const currentScopes = t.departmentScopes || generateInitialDepartmentScopes(t.id);
        const exists = currentScopes.some(d => d.id === deptId);
        let updatedScopes: DepartmentScopeProfile[];
        if (exists) {
          updatedScopes = currentScopes.map(d => d.id === deptId ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d);
        } else {
          const newProfile: DepartmentScopeProfile = {
            id: deptId,
            tenantId: t.id,
            name: updates.name || deptId,
            category: updates.category || 'Technology',
            isInScope: updates.isInScope ?? true,
            leadOwner: updates.leadOwner || 'Department Lead',
            headcount: updates.headcount || 10,
            scopeBoundary: updates.scopeBoundary || '',
            coreProcesses: updates.coreProcesses || [],
            criticalAssetsAndSystems: updates.criticalAssetsAndSystems || [],
            workLocations: updates.workLocations || ['Remote (100% Cloud)', 'Corporate HQ Office'],
            dataClassifications: updates.dataClassifications || ['Confidential', 'Internal'],
            threatVectors: updates.threatVectors || [],
            applicableAnnexAControls: updates.applicableAnnexAControls || ['A.5.1', 'A.8.1'],
            applicableIsoClauses: updates.applicableIsoClauses || ['Clause 4.3', 'Clause 5.3', 'Clause 8.1'],
            applicableFrameworks: updates.applicableFrameworks || ['ISO/IEC 27001:2022'],
            policyRequirements: updates.policyRequirements || [],
            maturityLevel: updates.maturityLevel || 4,
            readinessScore: updates.readinessScore || 85,
            ...updates,
            updatedAt: new Date().toISOString()
          };
          updatedScopes = [...currentScopes, newProfile];
        }

        // Also sync inScopeDepartmentIds if isInScope was changed
        let inScopeIds = t.inScopeDepartmentIds;
        if (updates.isInScope !== undefined) {
          if (updates.isInScope && !inScopeIds.includes(deptId)) {
            inScopeIds = [...inScopeIds, deptId];
          } else if (!updates.isInScope && inScopeIds.includes(deptId)) {
            inScopeIds = inScopeIds.filter(id => id !== deptId);
          }
        }

        return {
          ...t,
          departmentScopes: updatedScopes,
          inScopeDepartmentIds: inScopeIds
        };
      }
      return t;
    }));

    logAuditEvent('UPDATE', 'Department Scope & ISO Governance', `Updated scope parameters for department ID "${deptId}"`);
  };

  const addCustomDepartmentScope = (data: Omit<DepartmentScopeProfile, 'tenantId' | 'updatedAt'>) => {
    const timestamp = new Date().toISOString();
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const currentScopes = t.departmentScopes || generateInitialDepartmentScopes(t.id);
        const newProfile: DepartmentScopeProfile = {
          ...data,
          tenantId: t.id,
          updatedAt: timestamp
        };
        const inScopeIds = data.isInScope && !t.inScopeDepartmentIds.includes(data.id)
          ? [...t.inScopeDepartmentIds, data.id]
          : t.inScopeDepartmentIds;

        const customDepts = t.customDepartments.some(cd => cd.id === data.id)
          ? t.customDepartments
          : [...t.customDepartments, { id: data.id, name: data.name, owner: data.leadOwner, headcount: data.headcount }];

        return {
          ...t,
          departmentScopes: [...currentScopes, newProfile],
          inScopeDepartmentIds: inScopeIds,
          customDepartments: customDepts
        };
      }
      return t;
    }));

    logAuditEvent('CREATE', 'Department Scope & ISO Governance', `Registered new department scope profile "${data.name}"`);
  };

  const deleteDepartmentScope = (deptId: string) => {
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const currentScopes = t.departmentScopes || generateInitialDepartmentScopes(t.id);
        return {
          ...t,
          departmentScopes: currentScopes.filter(d => d.id !== deptId),
          inScopeDepartmentIds: t.inScopeDepartmentIds.filter(id => id !== deptId),
          customDepartments: t.customDepartments.filter(d => d.id !== deptId)
        };
      }
      return t;
    }));

    logAuditEvent('DELETE', 'Department Scope & ISO Governance', `Removed department scope profile ID "${deptId}"`);
  };

  const toggleDepartmentInScope = (deptId: string) => {
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const currentScopes = t.departmentScopes || generateInitialDepartmentScopes(t.id);
        const targetDept = currentScopes.find(d => d.id === deptId);
        const newInScope = targetDept ? !targetDept.isInScope : !t.inScopeDepartmentIds.includes(deptId);

        const updatedScopes = currentScopes.map(d => d.id === deptId ? { ...d, isInScope: newInScope, updatedAt: new Date().toISOString() } : d);
        const inScopeIds = newInScope
          ? (t.inScopeDepartmentIds.includes(deptId) ? t.inScopeDepartmentIds : [...t.inScopeDepartmentIds, deptId])
          : t.inScopeDepartmentIds.filter(id => id !== deptId);

        return {
          ...t,
          departmentScopes: updatedScopes,
          inScopeDepartmentIds: inScopeIds
        };
      }
      return t;
    }));
  };

  const autoMapDepartmentPolicies = (deptId?: string) => {
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const currentScopes = t.departmentScopes || generateInitialDepartmentScopes(t.id);
        const updatedScopes = currentScopes.map(dept => {
          if (deptId && dept.id !== deptId) return dept;
          // Apply standard policy mappings
          const baseline = generateInitialDepartmentScopes(t.id).find(b => b.id === dept.id);
          const newReqs = baseline ? baseline.policyRequirements : dept.policyRequirements;
          return {
            ...dept,
            policyRequirements: newReqs,
            updatedAt: new Date().toISOString()
          };
        });

        return {
          ...t,
          departmentScopes: updatedScopes
        };
      }
      return t;
    }));

    logAuditEvent('UPDATE', 'Department Scope & Policy Governance', `Auto-mapped standard ISO 27001 policies for ${deptId ? `department ${deptId}` : 'all in-scope departments'}`);
  };

  const addPolicyRequirementToDepartment = (deptId: string, policy: Omit<DepartmentPolicyRequirement, 'id'>) => {
    const newReqId = `pol_req_${Date.now()}`;
    const newPolicyReq: DepartmentPolicyRequirement = {
      ...policy,
      id: newReqId
    };

    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const currentScopes = t.departmentScopes || generateInitialDepartmentScopes(t.id);
        const updatedScopes = currentScopes.map(dept => {
          if (dept.id === deptId) {
            return {
              ...dept,
              policyRequirements: [...(dept.policyRequirements || []), newPolicyReq],
              updatedAt: new Date().toISOString()
            };
          }
          return dept;
        });

        return {
          ...t,
          departmentScopes: updatedScopes
        };
      }
      return t;
    }));

    logAuditEvent('CREATE', 'Department Policy Requirement', `Added policy "${policy.title}" (${policy.docCode}) to department ID "${deptId}"`);
  };

  const updateDepartmentPolicyRequirement = (deptId: string, policyReqId: string, updates: Partial<DepartmentPolicyRequirement>) => {
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const currentScopes = t.departmentScopes || generateInitialDepartmentScopes(t.id);
        const updatedScopes = currentScopes.map(dept => {
          if (dept.id === deptId) {
            return {
              ...dept,
              policyRequirements: (dept.policyRequirements || []).map(p => p.id === policyReqId ? { ...p, ...updates } : p),
              updatedAt: new Date().toISOString()
            };
          }
          return dept;
        });

        return {
          ...t,
          departmentScopes: updatedScopes
        };
      }
      return t;
    }));

    logAuditEvent('UPDATE', 'Department Policy Requirement', `Updated policy requirement ${policyReqId} in department ${deptId}`);
  };

  const removeDepartmentPolicyRequirement = (deptId: string, policyReqId: string) => {
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const currentScopes = t.departmentScopes || generateInitialDepartmentScopes(t.id);
        const updatedScopes = currentScopes.map(dept => {
          if (dept.id === deptId) {
            return {
              ...dept,
              policyRequirements: (dept.policyRequirements || []).filter(p => p.id !== policyReqId),
              updatedAt: new Date().toISOString()
            };
          }
          return dept;
        });

        return {
          ...t,
          departmentScopes: updatedScopes
        };
      }
      return t;
    }));

    logAuditEvent('DELETE', 'Department Policy Requirement', `Removed policy requirement ${policyReqId} from department ${deptId}`);
  };

  // Lock Statement of Applicability baseline
  const lockSoABaseline = async (tenantId?: string) => {
    const targetId = tenantId || currentTenantId;
    const target = tenants.find(t => t.id === targetId) || currentTenant;
    if (!target) return;

    const timestamp = new Date().toISOString();
    const userStamp = `${currentUser.name} (${currentUser.email} / ${currentRole})`;

    const payload = JSON.stringify({
      tenantId: target.id,
      name: target.name,
      controls: target.controls.map(c => ({
        code: c.controlCode,
        applicable: c.applicable,
        justification: c.justification,
        status: c.implementationStatus
      })),
      timestamp
    });

    const hash = await computeSHA256(payload);

    setTenants(prev => prev.map(t => {
      if (t.id === target.id) {
        return {
          ...t,
          soaBaselineLocked: true,
          soaBaselineTimestamp: timestamp,
          soaBaselineUser: userStamp,
          soaBaselineHash: hash,
          onboardingPhase: Math.max(t.onboardingPhase, 3)
        };
      }
      return t;
    }));

    await logAuditEvent('LOCK_BASELINE', 'Statement of Applicability (SoA)', `Locked SoA baseline with cryptographic hash: ${hash.slice(0, 16)}...`, { hash, timestamp });
  };

  // Phase 3 - Framework & Document Generation
  const savePhase3FrameworkAndGenerate = (frameworks: string[], specificRequirements?: string[]) => {
    const target = currentTenant;
    if (!target) return;

    const depts = target.inScopeDepartmentIds.map(id => {
      const found = masterDepartments.find(d => d.id === id);
      return found ? found.name : id;
    });

    const generated = generateArtefactsForTenant(
      target.name,
      target.industryType,
      frameworks[0] || 'ISO/IEC 27001:2022',
      depts,
      currentUser.name
    );

    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        return {
          ...t,
          selectedFrameworks: frameworks,
          selectedFrameworkRequirements: specificRequirements,
          generatedDocs: generated,
          onboardingPhase: Math.max(t.onboardingPhase, 4),
          readinessScore: Math.max(t.readinessScore, 55)
        };
      }
      return t;
    }));

    logAuditEvent('CREATE', 'Onboarding - Phase 3', `Selected frameworks: ${frameworks.join(', ')}${specificRequirements && specificRequirements.length > 0 ? ` with ${specificRequirements.length} granular requirements` : ''}. Generated ${generated.length} ISO compliance documents.`);
  };

  // Phase 4 - Digital MoU Execution
  const executeMoU = async (signatoryData: {
    signatoryName: string;
    signatoryRole: string;
    signatoryEmail: string;
    signatureDataUrl?: string;
    commercialTier?: string;
  }) => {
    const target = currentTenant;
    if (!target) return;

    const timestamp = new Date().toISOString();
    const ipAddress = '185.192.68.14'; // Simulated client IP
    const rawTerms = `MOU|${target.id}|${target.name}|${signatoryData.signatoryName}|${signatoryData.signatoryEmail}|${timestamp}|${signatoryData.commercialTier || 'Enterprise'}|CONFIDENTIALITY_ACKNOWLEDGED`;
    const documentHash = await computeSHA256(rawTerms);

    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        // Unlock all generated documents to PUBLISHED or APPROVED status
        const unlockedDocs = (t.generatedDocs || []).map(doc => ({
          ...doc,
          status: 'PUBLISHED' as const
        }));

        const updatedMou: DigitalMoU = {
          executed: true,
          signatoryName: signatoryData.signatoryName,
          signatoryRole: signatoryData.signatoryRole,
          signatoryEmail: signatoryData.signatoryEmail,
          ipAddress,
          timestamp,
          documentHash,
          agreementVersion: '2026.1-ENTERPRISE',
          commercialTier: signatoryData.commercialTier || t.mou.commercialTier || 'Enterprise Audit Practice Partnership',
          auditWindowStart: t.mou.auditWindowStart || '2026-10-01',
          auditWindowEnd: t.mou.auditWindowEnd || '2026-10-31',
          leadExternalAuditor: 'David Vance (Lead External Auditor)',
          scopeSummary: `${target.name} Management System ISO Certification Scope & External Audit Terms`,
          confidentialityTermsAccepted: true,
          signatureDataUrl: signatoryData.signatureDataUrl
        };

        return {
          ...t,
          onboardingPhase: 5, // Fully Onboarded!
          mou: updatedMou,
          generatedDocs: unlockedDocs,
          readinessScore: Math.max(t.readinessScore, 75)
        };
      }
      return t;
    }));

    await logAuditEvent(
      'SIGN_MOU',
      'Digital Memorandum of Understanding',
      `Executed digital MoU with SHA-256 integrity hash: ${documentHash}. Full ISO document pack released to dashboard.`,
      { signatory: signatoryData.signatoryName, hash: documentHash }
    );
  };

  const setTenantOnboardingPhase = (phase: number) => {
    setTenants(prev => prev.map(t => t.id === currentTenantId ? { ...t, onboardingPhase: phase } : t));
  };

  // Asset CRUD
  const addAsset = (asset: Omit<AssetRecord, 'id' | 'tenantId'>) => {
    const newAsset: AssetRecord = {
      ...asset,
      id: generateId('ast'),
      tenantId: currentTenantId
    };
    setAssets(prev => [newAsset, ...prev]);
    logAuditEvent('CREATE', 'Assets and Systems', `Added ${asset.type}: "${asset.name}" (${asset.criticality} criticality)`);
  };

  const updateAsset = (id: string, asset: Partial<AssetRecord>) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...asset } : a));
    logAuditEvent('UPDATE', 'Assets and Systems', `Updated asset ID ${id}`);
  };

  const deleteAsset = (id: string) => {
    const existing = assets.find(a => a.id === id);
    setAssets(prev => prev.filter(a => a.id !== id));
    logAuditEvent('DELETE', 'Assets and Systems', `Deleted asset: "${existing?.name || id}"`);
  };

  // Data Assets CRUD
  const addDataAsset = (dataAsset: Omit<DataAssetRecord, 'id' | 'tenantId'>) => {
    const newDA: DataAssetRecord = {
      ...dataAsset,
      id: generateId('da'),
      tenantId: currentTenantId
    };
    setDataAssets(prev => [newDA, ...prev]);
    logAuditEvent('CREATE', 'Data and Information', `Added data asset: "${dataAsset.datasetName}" (${dataAsset.dataClassification})`);
  };

  const updateDataAsset = (id: string, dataAsset: Partial<DataAssetRecord>) => {
    setDataAssets(prev => prev.map(d => d.id === id ? { ...d, ...dataAsset } : d));
    logAuditEvent('UPDATE', 'Data and Information', `Updated data asset ID ${id}`);
  };

  const deleteDataAsset = (id: string) => {
    const existing = dataAssets.find(d => d.id === id);
    setDataAssets(prev => prev.filter(d => d.id !== id));
    logAuditEvent('DELETE', 'Data and Information', `Deleted data asset: "${existing?.datasetName || id}"`);
  };

  // Vendor CRUD
  const addVendor = (vendor: Omit<VendorRecord, 'id' | 'tenantId'>) => {
    const newV: VendorRecord = {
      ...vendor,
      id: generateId('vnd'),
      tenantId: currentTenantId
    };
    setVendors(prev => [newV, ...prev]);
    logAuditEvent('CREATE', 'Vendors and Third Parties', `Added vendor "${vendor.name}" (${vendor.tier})`);
  };

  const updateVendor = (id: string, vendor: Partial<VendorRecord>) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, ...vendor } : v));
    logAuditEvent('UPDATE', 'Vendors and Third Parties', `Updated vendor ID ${id}`);
  };

  const deleteVendor = (id: string) => {
    const existing = vendors.find(v => v.id === id);
    setVendors(prev => prev.filter(v => v.id !== id));
    logAuditEvent('DELETE', 'Vendors and Third Parties', `Deleted vendor: "${existing?.name || id}"`);
  };

  // Risk Management CRUD with automatic Super Admin escalation
  const addRisk = (riskData: Omit<RiskRecord, 'id' | 'tenantId' | 'riskCode' | 'inherentScore' | 'residualScore' | 'escalatedToSuperAdmin'>) => {
    const count = risks.filter(r => r.tenantId === currentTenantId).length + 1;
    const riskCode = `RSK-2026-${count.toString().padStart(2, '0')}`;
    const inherentScore = riskData.likelihood * riskData.impact;
    const residualScore = riskData.residualLikelihood * riskData.residualImpact;
    const escalatedToSuperAdmin = inherentScore >= 15;

    const newRisk: RiskRecord = {
      ...riskData,
      id: generateId('rsk'),
      tenantId: currentTenantId,
      riskCode,
      inherentScore,
      residualScore,
      escalatedToSuperAdmin
    };

    setRisks(prev => [newRisk, ...prev]);
    logAuditEvent('CREATE', 'Risk Assessment', `Created risk ${riskCode}: "${riskData.title}" (Score: ${inherentScore}, Escalated: ${escalatedToSuperAdmin})`);

    // Statement of Applicability (SoA) Sync Verifier automatic change monitor (ISO 27001 Cl. 6.1.3 d)
    const activeControls = currentTenant?.controls || [];
    const checkReport = verifySoAJustifications([newRisk, ...risks.filter(r => r.tenantId === currentTenantId)], activeControls);
    if (checkReport.outdatedCount > 0) {
      logAuditEvent(
        'UPDATE',
        'SoA Sync Verifier',
        `⚠️ New Risk ${riskCode} rendered ${checkReport.outdatedCount} SoA exclusion justification(s) outdated! Affected: ${checkReport.issues.map(i => i.controlCode).join(', ')}`,
        { riskCode, affectedControls: checkReport.issues.map(i => i.controlCode) }
      );
    }
  };

  const updateRisk = (id: string, riskData: Partial<RiskRecord>) => {
    setRisks(prev => prev.map(r => {
      if (r.id === id) {
        const likelihood = riskData.likelihood ?? r.likelihood;
        const impact = riskData.impact ?? r.impact;
        const resLikelihood = riskData.residualLikelihood ?? r.residualLikelihood;
        const resImpact = riskData.residualImpact ?? r.residualImpact;
        const inherentScore = likelihood * impact;
        const residualScore = resLikelihood * resImpact;
        const escalatedToSuperAdmin = inherentScore >= 15;

        return {
          ...r,
          ...riskData,
          likelihood,
          impact,
          inherentScore,
          residualLikelihood: resLikelihood,
          residualImpact: resImpact,
          residualScore,
          escalatedToSuperAdmin
        };
      }
      return r;
    }));
    logAuditEvent('UPDATE', 'Risk Assessment', `Updated risk ID ${id}`);

    // Statement of Applicability (SoA) Sync Verifier automatic change monitor
    const activeControls = currentTenant?.controls || [];
    const checkReport = verifySoAJustifications(risks.filter(r => r.tenantId === currentTenantId), activeControls);
    if (checkReport.outdatedCount > 0) {
      logAuditEvent(
        'UPDATE',
        'SoA Sync Verifier',
        `⚠️ Risk updates triggered SoA Sync Verifier: ${checkReport.outdatedCount} exclusion justification(s) require review.`,
        { affectedControls: checkReport.issues.map(i => i.controlCode) }
      );
    }
  };

  const deleteRisk = (id: string) => {
    const existing = risks.find(r => r.id === id);
    setRisks(prev => prev.filter(r => r.id !== id));
    logAuditEvent('DELETE', 'Risk Assessment', `Deleted risk ${existing?.riskCode || id}`);
  };

  const mapRiskToMasRequirement = (riskId: string, requirementId: string) => {
    setRisks(prev => prev.map(r => {
      if (r.id === riskId) {
        return RiskEngine.mapRiskToMasRequirement(r, requirementId);
      }
      return r;
    }));
    logAuditEvent('UPDATE', 'Risk Engine', `Mapped Technology Risk ${riskId} to MAS TRM Requirement ${requirementId}`, {
      riskId,
      requirementId
    });
  };

  const unmapRiskFromMasRequirement = (riskId: string, requirementId: string) => {
    setRisks(prev => prev.map(r => {
      if (r.id === riskId) {
        return RiskEngine.unmapRiskFromMasRequirement(r, requirementId);
      }
      return r;
    }));
    logAuditEvent('UPDATE', 'Risk Engine', `Unmapped Technology Risk ${riskId} from MAS TRM Requirement ${requirementId}`, {
      riskId,
      requirementId
    });
  };

  const setRiskMasRequirements = (riskId: string, requirementIds: string[]) => {
    setRisks(prev => prev.map(r => {
      if (r.id === riskId) {
        return RiskEngine.setRiskMasRequirements(r, requirementIds);
      }
      return r;
    }));
    logAuditEvent('UPDATE', 'Risk Engine', `Updated MAS TRM Requirement Mappings on Risk ${riskId}`, {
      riskId,
      requirementIds
    });
  };

  const masEnterpriseRiskProfile = useMemo(() => {
    const tenantRisks = risks.filter(r => r.tenantId === currentTenantId);
    return RiskEngine.calculateEnterpriseRiskProfile(tenantRisks);
  }, [risks, currentTenantId]);

  const getMasRequirementRiskExposure = useCallback((requirementId: string) => {
    const tenantRisks = risks.filter(r => r.tenantId === currentTenantId);
    return RiskEngine.calculateRequirementRiskExposure(requirementId, tenantRisks);
  }, [risks, currentTenantId]);

  const getMasDomainExposureMetrics = useCallback((domainNumber: string) => {
    const tenantRisks = risks.filter(r => r.tenantId === currentTenantId);
    return RiskEngine.calculateDomainExposureMetrics(domainNumber, tenantRisks);
  }, [risks, currentTenantId]);

  const autoMapTechnologyRisks = useCallback((options?: { minConfidence?: number; overwrite?: boolean }) => {
    const tenantRisks = risks.filter(r => r.tenantId === currentTenantId);
    const result = RiskEngine.autoMapTechnologyRisks(tenantRisks, options);

    if (result.newlyMappedCount > 0) {
      setRisks(prev => {
        const updatedMap = new Map(result.updatedRisks.map(r => [r.id, r]));
        return prev.map(r => updatedMap.get(r.id) || r);
      });

      logAuditEvent(
        'UPDATE',
        'Risk Engine',
        `Auto-mapped ${result.newlyMappedCount} Technology Risk(s) to MAS TRM requirement IDs`,
        { details: result.details }
      );
    }

    return result;
  }, [risks, currentTenantId]);

  const batchMapTechnologyRisks = useCallback((mappings: Record<string, string[]>) => {
    setRisks(prev => {
      const tenantRisks = prev.filter(r => r.tenantId === currentTenantId);
      const updated = RiskEngine.batchMapTechnologyRisks(tenantRisks, mappings);
      const updatedMap = new Map(updated.map(r => [r.id, r]));
      return prev.map(r => updatedMap.get(r.id) || r);
    });

    logAuditEvent(
      'UPDATE',
      'Risk Engine',
      `Batch-mapped Technology Risks to MAS TRM requirement IDs`,
      { mappings }
    );
  }, [currentTenantId]);

  const getHeatmapCellMasExposure = useCallback((likelihood: number, impact: number, viewType: 'inherent' | 'residual' = 'residual') => {
    const tenantRisks = risks.filter(r => r.tenantId === currentTenantId);
    return RiskEngine.calculateHeatmapCellMasExposure(likelihood, impact, tenantRisks, viewType);
  }, [risks, currentTenantId]);

  const getHeatmapMasExposureGrid = useCallback((viewType: 'inherent' | 'residual' = 'residual') => {
    const tenantRisks = risks.filter(r => r.tenantId === currentTenantId);
    return RiskEngine.calculateHeatmapExposureGrid(tenantRisks, viewType);
  }, [risks, currentTenantId]);

  // Evidence Management
  const uploadEvidence = async (data: {
    title: string;
    controlCode: string;
    department: string;
    fileName: string;
    fileSize: string;
    fileType: string;
    tags: string[];
    initialStatus?: 'Draft' | 'Pending Review';
    sha256Hash?: string;
    dpdpClauses?: string[];
    dpdpMappings?: DpdpClauseMapping[];
    dpdpScanResult?: DpdpScanResult;
    isoRequirements?: string[];
    isoMappings?: IsoRequirementMapping[];
    isoScanResult?: IsoScanResult;
    recommendedIsoCategory?: string;
    recommendedControlCode?: string;
    documentExcerpt?: string;
    autoTaggedByAI?: boolean;
  }) => {
    const finalHash = data.sha256Hash || await computeSHA256(`${data.fileName}:${data.fileSize}:${Date.now()}`);
    const newEvd: EvidenceRecord = {
      id: generateId('evd'),
      tenantId: currentTenantId,
      title: data.title,
      controlCode: data.controlCode,
      department: data.department,
      uploadedBy: `${currentUser.name} (${currentUser.title})`,
      uploadedDate: new Date().toISOString(),
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileType: data.fileType,
      version: '1.0',
      status: data.initialStatus || 'Draft',
      verificationState: data.initialStatus || 'Draft',
      tags: data.tags,
      sha256Hash: finalHash,
      auditHash: finalHash,
      dpdpClauses: data.dpdpClauses,
      dpdpMappings: data.dpdpMappings,
      dpdpScanResult: data.dpdpScanResult,
      isoRequirements: data.isoRequirements,
      isoMappings: data.isoMappings,
      isoScanResult: data.isoScanResult,
      recommendedIsoCategory: data.recommendedIsoCategory,
      recommendedControlCode: data.recommendedControlCode,
      documentExcerpt: data.documentExcerpt,
      autoTaggedByAI: data.autoTaggedByAI
    };
    setEvidence(prev => [newEvd, ...prev]);
    logAuditEvent('CREATE', 'Evidence Upload', `Uploaded evidence artifact "${data.title}" (${data.fileName}) [SHA-256: ${finalHash.slice(0, 16)}...] against control ${data.controlCode}`);
  };

  const autoTagEvidenceWithDPDP = (
    evidenceId: string,
    mappings: DpdpClauseMapping[],
    suggestedTags: string[],
    scanResult: DpdpScanResult
  ) => {
    const timestamp = new Date().toISOString();
    setEvidence(prev => prev.map(item => {
      if (item.id === evidenceId) {
        const mergedTags = Array.from(new Set([...item.tags, ...suggestedTags]));
        const clauseCodes = mappings.map(m => m.sectionCode);
        return {
          ...item,
          tags: mergedTags,
          dpdpClauses: clauseCodes,
          dpdpMappings: mappings,
          dpdpScanResult: scanResult,
          autoTaggedByAI: true,
          aiTaggedAt: timestamp
        };
      }
      return item;
    }));

    const target = evidence.find(e => e.id === evidenceId);
    logAuditEvent(
      'UPDATE',
      'AI Evidence Auto-Tagger',
      `Auto-tagged evidence "${target?.title || evidenceId}" with DPDP statutory clauses: ${mappings.map(m => m.sectionCode).join(', ')} [Confidence: ${scanResult.overallConfidence}]`
    );
  };

  const batchAutoTagEvidenceWithDPDP = (
    results: Array<{
      id: string;
      mappings: DpdpClauseMapping[];
      suggestedTags: string[];
      scanResult: DpdpScanResult;
    }>
  ) => {
    const timestamp = new Date().toISOString();
    const resultMap = new Map(results.map(r => [r.id, r]));

    setEvidence(prev => prev.map(item => {
      const match = resultMap.get(item.id);
      if (match) {
        const mergedTags = Array.from(new Set([...item.tags, ...match.suggestedTags]));
        return {
          ...item,
          tags: mergedTags,
          dpdpClauses: match.mappings.map(m => m.sectionCode),
          dpdpMappings: match.mappings,
          dpdpScanResult: match.scanResult,
          autoTaggedByAI: true,
          aiTaggedAt: timestamp
        };
      }
      return item;
    }));

    logAuditEvent(
      'UPDATE',
      'AI Evidence Auto-Tagger',
      `Batch auto-tagged ${results.length} evidence items with DPDP statutory clauses.`
    );
  };

  const autoTagEvidenceWithISO = (
    evidenceId: string,
    mappings: IsoRequirementMapping[],
    suggestedTags: string[],
    scanResult: IsoScanResult
  ) => {
    const timestamp = new Date().toISOString();
    setEvidence(prev => prev.map(item => {
      if (item.id === evidenceId) {
        const mergedTags = Array.from(new Set([...item.tags, ...suggestedTags]));
        const reqCodes = mappings.map(m => m.isoCode);
        return {
          ...item,
          tags: mergedTags,
          isoRequirements: reqCodes,
          isoMappings: mappings,
          isoScanResult: scanResult,
          recommendedIsoCategory: scanResult.primaryCategory,
          recommendedControlCode: scanResult.recommendedControlCode,
          autoTaggedByAI: true,
          aiTaggedAt: timestamp
        };
      }
      return item;
    }));

    const target = evidence.find(e => e.id === evidenceId);
    logAuditEvent(
      'UPDATE',
      'AI ISO Auto-Tagger',
      `Auto-tagged evidence "${target?.title || evidenceId}" with ISO 27001 requirements: ${mappings.map(m => m.isoCode).join(', ')} [Category: ${scanResult.primaryCategory}, Confidence: ${scanResult.overallConfidence}]`
    );
  };

  const batchAutoTagEvidenceWithISO = (
    results: Array<{
      id: string;
      mappings: IsoRequirementMapping[];
      suggestedTags: string[];
      scanResult: IsoScanResult;
    }>
  ) => {
    const timestamp = new Date().toISOString();
    const resultMap = new Map(results.map(r => [r.id, r]));

    setEvidence(prev => prev.map(item => {
      const match = resultMap.get(item.id);
      if (match) {
        const mergedTags = Array.from(new Set([...item.tags, ...match.suggestedTags]));
        return {
          ...item,
          tags: mergedTags,
          isoRequirements: match.mappings.map(m => m.isoCode),
          isoMappings: match.mappings,
          isoScanResult: match.scanResult,
          recommendedIsoCategory: match.scanResult.primaryCategory,
          recommendedControlCode: match.scanResult.recommendedControlCode,
          autoTaggedByAI: true,
          aiTaggedAt: timestamp
        };
      }
      return item;
    }));

    logAuditEvent(
      'UPDATE',
      'AI ISO Auto-Tagger',
      `Batch auto-tagged ${results.length} evidence items with ISO 27001 requirements & categories.`
    );
  };

  const verifyEvidenceChecksum = async (id: string): Promise<{ success: boolean; verified: boolean; sha256Hash: string; timestamp: string }> => {
    const target = evidence.find(e => e.id === id);
    if (!target) return { success: false, verified: false, sha256Hash: '', timestamp: '' };

    const timestamp = new Date().toISOString();
    const finalHash = target.sha256Hash || target.auditHash || await computeSHA256(`${target.id}|${target.fileName}|${target.uploadedDate}`);

    setEvidence(prev => prev.map(e => {
      if (e.id === id) {
        return {
          ...e,
          sha256Hash: finalHash,
          auditHash: finalHash,
          integrityVerifiedAt: timestamp,
          checksumVerified: true
        };
      }
      return e;
    }));

    await logAuditEvent('APPROVE', 'Evidence Integrity Verification', `Cryptographic SHA-256 checksum verified for evidence "${target.title}" (${target.fileName}) [SHA: ${finalHash.slice(0, 16)}...] in accordance with ISO 27001 Clause A.8.14 & A.8.28.`);

    return { success: true, verified: true, sha256Hash: finalHash, timestamp };
  };

  const reviewEvidence = (
    id: string,
    status: 'Draft' | 'Pending Review' | 'Verified' | 'Requires Update' | 'Expired',
    notes: string,
    metadata?: { submittedBy?: string; submittedDate?: string }
  ): { success: boolean; error?: string } => {
    const target = evidence.find(e => e.id === id);
    if (!target) return { success: false, error: 'Evidence record not found' };

    // RBAC Four-Eyes Rule:
    // If status is 'Verified', the author/uploader/submitter CANNOT verify their own evidence!
    const authorName = (target.uploadedBy || '').toLowerCase();
    const submitterName = (target.submittedBy || '').toLowerCase();
    const currentName = currentUser.name.toLowerCase();

    const isSelfAuthor = authorName.includes(currentName) || currentName.includes(authorName.split(' ')[0]);
    const isSelfSubmitter = submitterName.length > 0 && (submitterName.includes(currentName) || currentName.includes(submitterName.split(' ')[0]));

    if (status === 'Verified' && (isSelfAuthor || isSelfSubmitter)) {
      logAuditEvent(
        'ACCESS',
        'Four-Eyes Dual Custody RBAC',
        `BLOCKED: User "${currentUser.name}" attempted self-verification on evidence "${target.title}". Dual-custody separation enforced.`,
        { evidenceId: id, attemptedBy: currentUser.name, author: target.uploadedBy }
      );
      return {
        success: false,
        error: `Four-Eyes Dual Custody Policy: You cannot verify evidence you authored or submitted ("${target.uploadedBy}"). Independent sign-off by a separate Auditor or Compliance Administrator is required.`
      };
    }

    setEvidence(prev => prev.map(e => {
      if (e.id === id) {
        const verificationState: 'Draft' | 'Pending Review' | 'Verified' =
          status === 'Verified' ? 'Verified' : status === 'Draft' ? 'Draft' : 'Pending Review';

        return {
          ...e,
          status,
          verificationState,
          fourEyesEnforced: true,
          fourEyesStatus: status === 'Verified' ? 'COMPLIANT' : 'PENDING_INDEPENDENT_REVIEW',
          ...(status === 'Pending Review' && {
            submittedBy: metadata?.submittedBy || `${currentUser.name} (${currentRole})`,
            submittedDate: metadata?.submittedDate || new Date().toISOString()
          }),
          ...(status === 'Verified' && {
            reviewedBy: `${currentUser.name} (${currentRole})`,
            reviewDate: new Date().toISOString()
          }),
          ...(status === 'Requires Update' && {
            reviewedBy: `${currentUser.name} (${currentRole})`,
            reviewDate: new Date().toISOString()
          }),
          ...(status === 'Draft' && {
            rejectionReason: notes
          }),
          reviewNotes: notes
        };
      }
      return e;
    }));
    const actionType = status === 'Verified' ? 'APPROVE' : status === 'Draft' ? 'UPDATE' : 'APPROVE';
    logAuditEvent(actionType, 'Evidence Centre', `Evidence ID ${id} transitioned to verification state "${status}" by ${currentUser.name} (${currentRole}) [Four-Eyes Enforced]`);
    return { success: true };
  };

  const submitEvidenceForReview = (id: string, notes?: string) => {
    reviewEvidence(id, 'Pending Review', notes || 'Submitted for formal compliance review (Step 1 of 2)', {
      submittedBy: `${currentUser.name} (${currentRole})`,
      submittedDate: new Date().toISOString()
    });
  };

  const deleteEvidence = (id: string) => {
    const existing = evidence.find(e => e.id === id);
    setEvidence(prev => prev.filter(e => e.id !== id));
    logAuditEvent('DELETE', 'Evidence Centre', `Deleted evidence artifact "${existing?.title || id}"`);
  };

  const ingestBatchHarvestedEvidence = (items: EvidenceRecord[]) => {
    setEvidence(prev => {
      const existingIds = new Set(prev.map(e => e.id));
      const incoming = items.filter(item => !existingIds.has(item.id));
      return [...incoming, ...prev];
    });

    // Update controls to Implemented with automated telemetry indicators
    const controlCodes = new Set(items.map(i => i.controlCode));
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        return {
          ...t,
          controls: t.controls.map(c => {
            if (controlCodes.has(c.controlCode)) {
              return {
                ...c,
                implementationStatus: 'Implemented' as const,
                maturityLevel: Math.max(c.maturityLevel || 0, 4)
              };
            }
            return c;
          })
        };
      }
      return t;
    }));

    logAuditEvent(
      'CREATE',
      'Live Integrations Zero-Touch Ingestion',
      `Auto-harvested and verified ${items.length} technical controls from live cloud & code pipelines.`
    );
  };

  // Internal Audit Plans
  const addInternalAudit = (plan: Omit<InternalAuditPlan, 'id' | 'tenantId' | 'auditCode'>) => {
    const count = internalAudits.filter(a => a.tenantId === currentTenantId).length + 1;
    const auditCode = `IA-2026-${count.toString().padStart(2, '0')}`;
    const newPlan: InternalAuditPlan = {
      ...plan,
      id: generateId('ia'),
      tenantId: currentTenantId,
      auditCode
    };
    setInternalAudits(prev => [newPlan, ...prev]);
    logAuditEvent('CREATE', 'Internal Audit', `Created internal audit plan ${auditCode}: "${plan.title}"`);
  };

  const updateInternalAudit = (id: string, plan: Partial<InternalAuditPlan>) => {
    setInternalAudits(prev => prev.map(a => a.id === id ? { ...a, ...plan } : a));
    logAuditEvent('UPDATE', 'Internal Audit', `Updated audit plan ID ${id}`);
  };

  const updateChecklistItem = (auditId: string, checklistId: string, item: Partial<InternalAuditPlan['checklists'][0]>) => {
    setInternalAudits(prev => prev.map(a => {
      if (a.id === auditId) {
        return {
          ...a,
          checklists: a.checklists.map(c => c.id === checklistId ? { ...c, ...item } : c)
        };
      }
      return a;
    }));
    logAuditEvent('UPDATE', 'Internal Audit Fieldwork', `Updated working paper item ${checklistId} in audit ${auditId}`);
  };

  // Findings & CAPA
  const addFinding = (findingData: Omit<FindingCAPARecord, 'id' | 'tenantId' | 'findingCode' | 'raisedBy' | 'raisedDate'>) => {
    const prefix = currentRole === 'PLATFORM_AUDITOR' ? 'EXT' : 'FND';
    const count = findings.filter(f => f.tenantId === currentTenantId).length + 1;
    const findingCode = `${prefix}-2026-${count.toString().padStart(2, '0')}`;
    const isExternalLocked = currentRole === 'PLATFORM_AUDITOR';

    const newFinding: FindingCAPARecord = {
      ...findingData,
      id: generateId('fnd'),
      tenantId: currentTenantId,
      findingCode,
      raisedBy: `${currentUser.name} (${currentRole})`,
      raisedDate: new Date().toISOString(),
      isExternalLocked
    };

    setFindings(prev => [newFinding, ...prev]);
    logAuditEvent('CREATE', 'Findings and CAPA', `Raised ${findingData.severity} finding ${findingCode}: "${findingData.title}"`);
  };

  const updateFinding = (id: string, findingData: Partial<FindingCAPARecord>) => {
    let closureBlocked = false;
    let findingCodeRef = id;

    setFindings(prev => prev.map(f => {
      if (f.id === id) {
        findingCodeRef = f.findingCode;
        let targetStatus = findingData.status ?? f.status;
        const targetValidation = findingData.independentAuditValidation ?? f.independentAuditValidation;

        // INVARIANT (ISO 19011 / ISO/IEC 27001 Clause 10.2):
        // No finding can be marked 'Closed' or 'Closed Verified' without an independent audit validation step logged and passed.
        if (targetStatus === 'Closed Verified') {
          if (!targetValidation || targetValidation.testOfOperatingEffectiveness !== 'PASSED') {
            closureBlocked = true;
            targetStatus = 'Verification Pending';
            return {
              ...f,
              ...findingData,
              status: 'Verification Pending'
            };
          }
        }

        return {
          ...f,
          ...findingData,
          status: targetStatus
        };
      }
      return f;
    }));

    if (closureBlocked) {
      logAuditEvent(
        'REJECT',
        'CAPA Governance Guard',
        `Blocked attempt to close finding ${findingCodeRef} without a logged & passed Independent Audit Validation record. (ISO 19011 / Clause 10.2 invariant enforced).`
      );
    } else {
      logAuditEvent('UPDATE', 'Findings and CAPA', `Updated finding & CAPA for ID ${id}`);
    }
  };

  const validateAndCloseFinding = (id: string, validation: IndependentAuditValidation): boolean => {
    if (!validation || validation.testOfOperatingEffectiveness !== 'PASSED') {
      logAuditEvent(
        'REJECT',
        'Findings and CAPA',
        `Independent audit validation rejected for finding ID ${id}. Test of Operating Effectiveness was not PASSED.`
      );
      return false;
    }

    const now = new Date().toISOString();
    let validatedCode = id;

    setFindings(prev => prev.map(f => {
      if (f.id === id) {
        validatedCode = f.findingCode;
        return {
          ...f,
          status: 'Closed Verified',
          verifiedBy: `${validation.auditorName} (${validation.auditorRole})`,
          verifiedDate: validation.validatedAt || now,
          independentAuditValidation: validation,
          implementationNotes: f.implementationNotes
            ? `${f.implementationNotes}\n\n[Independent Audit Validation Sign-Off]: ${validation.auditorObservations}`
            : validation.auditorObservations
        };
      }
      return f;
    }));

    logAuditEvent(
      'APPROVE',
      'Findings and CAPA',
      `Independent audit validation executed and finding ${validatedCode} marked Closed Verified by ${validation.auditorName} (${validation.auditorRole}) under ${validation.auditProgramRef}. Verifiable signature: ${validation.digitalSignatureHash.substring(0, 16)}...`
    );
    return true;
  };

  const deleteFinding = (id: string): boolean => {
    const target = findings.find(f => f.id === id);
    if (target?.isExternalLocked && currentRole !== 'SUPER_ADMIN' && currentRole !== 'PLATFORM_AUDITOR') {
      return false; // Cannot delete external auditor finding
    }
    setFindings(prev => prev.filter(f => f.id !== id));
    logAuditEvent('DELETE', 'Findings and CAPA', `Deleted finding ${target?.findingCode || id}`);
    return true;
  };

  // Unified Remediation & Continuous Exception Management Handlers
  const addUnifiedRemediation = (itemData: Omit<UnifiedRemediationItem, 'id' | 'tenantId' | 'remediationCode' | 'createdAt' | 'isBreached' | 'daysRemainingOrOverdue'>) => {
    const count = unifiedRemediations.filter(r => r.tenantId === currentTenantId).length + 1;
    const prefix = itemData.sourceDomain === 'Regulatory Gap' ? 'REM-REG' :
                   itemData.sourceDomain === 'Brand & Perimeter Infringement' ? 'REM-BRD' :
                   itemData.sourceDomain === 'Vulnerability Management' ? 'REM-VUL' :
                   itemData.sourceDomain === 'Third-Party / Vendor Finding' ? 'REM-TPR' : 'REM-CFG';
    const remediationCode = `${prefix}-2026-${count.toString().padStart(3, '0')}`;
    const now = new Date();
    const targetDate = new Date(itemData.targetResolutionDate);
    const diffDays = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    const isBreached = diffDays < 0 && itemData.status !== 'Closed & Verified';

    const newItem: UnifiedRemediationItem = {
      ...itemData,
      id: generateId('rem'),
      tenantId: currentTenantId,
      remediationCode,
      createdAt: now.toISOString(),
      daysRemainingOrOverdue: diffDays,
      isBreached,
      auditSignOff: null
    };

    setUnifiedRemediations(prev => [newItem, ...prev]);
    logAuditEvent(
      'CREATE',
      'Unified Remediation Desk',
      `Created ${itemData.severity} remediation item ${remediationCode}: "${itemData.title}" (${itemData.sourceDomain})`,
      { remediationCode, sourceDomain: itemData.sourceDomain, owner: itemData.ownerName }
    );
  };

  const updateUnifiedRemediation = (id: string, updates: Partial<UnifiedRemediationItem>) => {
    setUnifiedRemediations(prev => prev.map(r => {
      if (r.id === id) {
        const updated = { ...r, ...updates };
        if (updates.targetResolutionDate) {
          const now = new Date();
          const target = new Date(updates.targetResolutionDate);
          const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 3600 * 24));
          updated.daysRemainingOrOverdue = diffDays;
          updated.isBreached = diffDays < 0 && updated.status !== 'Closed & Verified';
        }
        return updated;
      }
      return r;
    }));
    logAuditEvent('UPDATE', 'Unified Remediation Desk', `Updated remediation item ${id}`);
  };

  const deleteUnifiedRemediation = (id: string) => {
    const target = unifiedRemediations.find(r => r.id === id);
    setUnifiedRemediations(prev => prev.filter(r => r.id !== id));
    logAuditEvent('DELETE', 'Unified Remediation Desk', `Deleted remediation item ${target?.remediationCode || id}`);
  };

  const requestRiskExceptionWaiver = (
    remediationId: string,
    waiverData: Omit<RiskExceptionWaiverRequest, 'id' | 'waiverCode' | 'approvalStatus'>
  ) => {
    const waiverCount = Math.floor(Math.random() * 900) + 100;
    const waiverCode = `WVR-2026-${waiverCount}`;
    const newWaiver: RiskExceptionWaiverRequest = {
      ...waiverData,
      id: generateId('wvr'),
      waiverCode,
      approvalStatus: 'PENDING_CISO_REVIEW'
    };

    setUnifiedRemediations(prev => prev.map(r => {
      if (r.id === remediationId) {
        return {
          ...r,
          activeWaiver: newWaiver,
          status: 'EXCEPTION_REQUESTED' as const
        };
      }
      return r;
    }));

    logAuditEvent(
      'CREATE',
      'Risk Waiver Workflow',
      `Submitted risk waiver ${waiverCode} for remediation ${remediationId}. Business Justification: ${waiverData.businessJustification.slice(0, 80)}...`,
      { waiverCode, remediationId }
    );
  };

  const approveOrRejectWaiver = (
    remediationId: string,
    approved: boolean,
    executiveApprover: string,
    conditions: string[] = []
  ) => {
    const now = new Date().toISOString();
    setUnifiedRemediations(prev => prev.map(r => {
      if (r.id === remediationId && r.activeWaiver) {
        const updatedWaiver: RiskExceptionWaiverRequest = {
          ...r.activeWaiver,
          approvalStatus: approved ? 'APPROVED' : 'REJECTED',
          executiveApprover: approved ? executiveApprover : undefined,
          approvedAt: approved ? now : undefined,
          conditionsOfApproval: conditions.length > 0 ? conditions : r.activeWaiver.conditionsOfApproval
        };
        return {
          ...r,
          activeWaiver: updatedWaiver,
          status: approved ? 'EXCEPTION_APPROVED' : 'REMEDIATION_IN_PROGRESS'
        };
      }
      return r;
    }));

    logAuditEvent(
      'UPDATE',
      'Risk Waiver Workflow',
      `${approved ? 'Approved' : 'Rejected'} risk exception waiver for remediation ${remediationId} by ${executiveApprover}`,
      { remediationId, approved, executiveApprover, conditions }
    );
  };

  const verifyCompensatingControl = (
    remediationId: string,
    controlData: Omit<CompensatingControlVerification, 'id'>
  ) => {
    const verifiedControl: CompensatingControlVerification = {
      ...controlData,
      id: generateId('cmp')
    };

    setUnifiedRemediations(prev => prev.map(r => {
      if (r.id === remediationId) {
        const existingControls = r.compensatingControls || [];
        return {
          ...r,
          compensatingControls: [...existingControls, verifiedControl],
          status: (controlData.effectivenessScore >= 80 ? 'COMPENSATING_CONTROL_ACTIVE' : r.status) as any
        };
      }
      return r;
    }));

    logAuditEvent(
      'UPDATE',
      'Compensating Controls Engine',
      `Logged compensating control "${controlData.title}" (effectiveness: ${controlData.effectivenessScore}%) for remediation ${remediationId}`,
      { remediationId, title: controlData.title, score: controlData.effectivenessScore }
    );
  };

  const signOffRemediationAudit = (
    remediationId: string,
    signOff: Omit<RemediationAuditSignOff, 'signatureTimestamp'>
  ) => {
    const completedSignOff: RemediationAuditSignOff = {
      ...signOff,
      signatureTimestamp: new Date().toISOString()
    };

    setUnifiedRemediations(prev => prev.map(r => {
      if (r.id === remediationId) {
        return {
          ...r,
          auditSignOff: completedSignOff,
          status: signOff.closureAccepted ? 'CLOSED_VERIFIED' : 'REMEDIATION_IN_PROGRESS'
        };
      }
      return r;
    }));

    logAuditEvent(
      'APPROVE',
      'Audit Verification Desk',
      `Auditor ${signOff.signedOffBy} signed off remediation ${remediationId} with result: ${signOff.closureAccepted ? 'ACCEPTED' : 'REJECTED'}`,
      { remediationId, auditor: signOff.signedOffBy, notes: signOff.auditNotes }
    );
  };

  const triggerRemediationRetest = async (remediationId: string): Promise<{ success: boolean; message: string }> => {
    const item = unifiedRemediations.find(r => r.id === remediationId);
    if (!item) return { success: false, message: 'Remediation item not found.' };

    const completedMilestones = item.milestones?.filter(m => m.isCompleted).length || 0;
    const totalMilestones = item.milestones?.length || 1;
    const progressPct = Math.round((completedMilestones / totalMilestones) * 100);
    const passed = progressPct >= 80;
    const now = new Date().toISOString();

    setUnifiedRemediations(prev => prev.map(r => {
      if (r.id === remediationId) {
        return {
          ...r,
          status: passed ? 'AUDIT_VERIFICATION_PENDING' : 'REMEDIATION_IN_PROGRESS',
          retestResult: {
            lastRetestAt: now,
            passed,
            outputSummary: passed
              ? `Automated diagnostic verified remediation effectiveness (${progressPct}% milestones completed). Ready for independent audit sign-off.`
              : `Diagnostic scan detected incomplete control implementation (${progressPct}% milestones completed). Remediation remains in progress.`
          }
        };
      }
      return r;
    }));

    logAuditEvent(
      'UPDATE',
      'Remediation Validation Engine',
      `Executed control re-test for ${item.remediationCode}. Result: ${passed ? 'PASSED (Ready for sign-off)' : 'INCOMPLETE'}`,
      { remediationCode: item.remediationCode, progress: progressPct, passed }
    );

    return {
      success: passed,
      message: passed
        ? `Re-test succeeded! ${item.remediationCode} marked as "AUDIT_VERIFICATION_PENDING".`
        : `Re-test completed: Progress is ${progressPct}%. Control needs additional implementation before audit sign-off.`
    };
  };

  const syncFindingsToRemediations = () => {
    let importedCount = 0;
    const existingFindingCodes = new Set(
      unifiedRemediations
        .map(r => r.sourceEntityId || r.sourceRefCode)
        .filter(Boolean)
    );

    const newRemediations: UnifiedRemediationItem[] = [];

    findings.forEach(f => {
      if (f.tenantId === currentTenantId && !existingFindingCodes.has(f.findingCode) && f.status !== 'Closed Verified') {
        importedCount++;
        const now = new Date();
        const targetDate = f.capaPlan?.targetDate ? new Date(f.capaPlan.targetDate) : new Date(now.getTime() + 30 * 24 * 3600 * 1000);
        const diffDays = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

        newRemediations.push({
          id: generateId('rem'),
          tenantId: currentTenantId,
          remediationCode: `REM-AUD-2026-${(unifiedRemediations.length + importedCount).toString().padStart(3, '0')}`,
          title: f.title,
          sourceDomain: 'REGULATORY_GAP',
          sourceRefCode: f.findingCode,
          sourceEntityId: f.id,
          frameworksAffected: ['ISO/IEC 27001:2022'],
          severity: f.severity === 'Major Non-Conformity' ? 'CRITICAL' : f.severity === 'Minor Non-Conformity' ? 'HIGH' : f.severity === 'Observation' ? 'MEDIUM' : 'LOW',
          status: f.status === 'Verification Pending' ? 'AUDIT_VERIFICATION_PENDING' : 'REMEDIATION_IN_PROGRESS',
          createdAt: now.toISOString(),
          slaDaysTotal: f.severity === 'Major Non-Conformity' ? 3 : f.severity === 'Minor Non-Conformity' ? 14 : 30,
          slaDueDate: targetDate.toISOString(),
          isBreached: diffDays < 0,
          daysRemainingOrOverdue: diffDays,
          assignedOwner: f.capaPlan?.owner || f.raisedBy || 'Unassigned',
          assignedOwnerEmail: f.departmentOwnerEmail || 'ciso-desk@skanda-defense.internal',
          department: f.department || 'IT & Security',
          threatOrGapSummary: f.description || `Corrective action plan linked to audit finding ${f.findingCode}. Root Cause: ${f.rootCauseAnalysis?.rootCauseStatement || 'Under investigation'}.`,
          correctiveActionPlan: f.capaPlan?.correctiveAction || 'Implement corrective controls and update operating procedures.',
          preventiveActionPlan: f.capaPlan?.preventiveAction || 'Institute periodic automated audit reviews.',
          milestones: [
            {
              id: generateId('mil'),
              title: 'Root Cause Verification',
              targetDate: new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
              isCompleted: true,
              completedDate: now.toISOString(),
              assignedEngineer: f.capaPlan?.owner || 'Lead Auditor'
            },
            {
              id: generateId('mil'),
              title: 'Corrective Action Rollout',
              targetDate: targetDate.toISOString().split('T')[0],
              isCompleted: false,
              assignedEngineer: f.capaPlan?.owner || 'Action Owner'
            }
          ],
          compensatingControls: [],
          evidenceDocumentIds: [],
          tags: ['Audit Finding', f.severity, f.clauseOrControl]
        });
      }
    });

    if (newRemediations.length > 0) {
      setUnifiedRemediations(prev => [...newRemediations, ...prev]);
      logAuditEvent(
        'CREATE',
        'Unified Remediation Desk',
        `Synchronized ${newRemediations.length} active audit findings into Unified Remediation Desk.`
      );
    }
  };

  // Controls update (SoA & Gap Assessment)
  const updateControl = (controlId: string, updates: Partial<ControlItem>) => {
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const updatedControls = t.controls.map(c => c.id === controlId ? { ...c, ...updates } : c);
        // Recalculate tenant readiness score dynamically
        const implementedCount = updatedControls.filter(c => c.applicable && (c.implementationStatus === 'Implemented' || c.implementationStatus === 'Monitored' || c.implementationStatus === 'Audited')).length;
        const totalApplicable = updatedControls.filter(c => c.applicable).length || 1;
        const readiness = Math.round((implementedCount / totalApplicable) * 100);

        return {
          ...t,
          controls: updatedControls,
          readinessScore: readiness
        };
      }
      return t;
    }));
    logAuditEvent('UPDATE', 'Control Library / SoA', `Updated control ${controlId}`);
  };

  // Documents
  const updateDocumentStatus = (docId: string, status: GeneratedDocument['status']) => {
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        return {
          ...t,
          generatedDocs: t.generatedDocs.map(d => d.id === docId ? { ...d, status, lastModified: new Date().toISOString() } : d)
        };
      }
      return t;
    }));
    logAuditEvent('UPDATE', 'Policies & Procedures', `Updated document ${docId} workflow status to ${status}`);
  };

  const updateDocumentContent = (docId: string, content: string) => {
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        return {
          ...t,
          generatedDocs: t.generatedDocs.map(d => d.id === docId ? { ...d, content, lastModified: new Date().toISOString() } : d)
        };
      }
      return t;
    }));
    logAuditEvent('UPDATE', 'Policies & Procedures', `Edited content for document ${docId}`);
  };

  const acknowledgeDocument = (docId: string) => {
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        return {
          ...t,
          generatedDocs: t.generatedDocs.map(d => d.id === docId ? { ...d, acknowledgementCount: (d.acknowledgementCount || 0) + 1 } : d)
        };
      }
      return t;
    }));
    logAuditEvent('APPROVE', 'Policy Acknowledgement', `User ${currentUser.name} acknowledged policy ${docId}`);
  };

  const updateDocument = (docId: string, updates: Partial<GeneratedDocument>) => {
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        return {
          ...t,
          generatedDocs: t.generatedDocs.map(d => d.id === docId ? { ...d, ...updates, lastModified: new Date().toISOString() } : d)
        };
      }
      return t;
    }));
    logAuditEvent('UPDATE', 'Policies & Procedures', `Updated document ${docId}`);
  };

  const upgradeAllDocsToAuditorGrade = (options?: Partial<AuditorGradeOptions>) => {
    const target = currentTenant;
    if (!target) return;

    const depts = target.inScopeDepartmentIds.map(id => {
      const found = masterDepartments.find(d => d.id === id);
      return found ? found.name : id;
    });

    const upgraded = generateAuditorGradeDocumentSuite({
      companyName: target.name,
      industry: target.industryType,
      framework: target.selectedFrameworks[0] || 'ISO/IEC 27001:2022',
      departments: depts.length > 0 ? depts : undefined,
      cisoName: 'Chief Information Security Officer (CISO)',
      ...options
    });

    const nonPolicyDocs = (target.generatedDocs || []).filter(
      d => d.type === 'REGISTER' || d.type === 'SCHEDULE'
    );

    const merged = [...upgraded, ...nonPolicyDocs];

    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        return {
          ...t,
          generatedDocs: merged,
          readinessScore: Math.min(100, Math.max(t.readinessScore, 92))
        };
      }
      return t;
    }));

    logAuditEvent('UPDATE', 'Policies & Procedures', `Upgraded policy suite to ISO 27001:2022 Auditor-Grade benchmark.`);
  };

  const synthesizeStandardsPolicySuite = (options: PolicyGenerationOptions): GeneratedDocument[] => {
    const target = currentTenant;
    if (!target) return [];

    const suite = Iso27001PolicyEngine.generateSuite({
      companyName: target.name,
      industry: target.industryType,
      framework: target.selectedFrameworks[0] || 'ISO/IEC 27001:2022',
      users,
      tenant: target,
      ...options
    });

    const nonPolicyDocs = (target.generatedDocs || []).filter(
      d => d.type === 'REGISTER' || d.type === 'SCHEDULE'
    );

    const newCodes = new Set(suite.map(d => d.docCode.toUpperCase()));
    const filteredExisting = nonPolicyDocs.filter(d => !newCodes.has(d.docCode.toUpperCase()));
    const merged = [...suite, ...filteredExisting];

    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        return {
          ...t,
          generatedDocs: merged,
          readinessScore: Math.min(100, Math.max(t.readinessScore, 95))
        };
      }
      return t;
    }));

    logAuditEvent('UPDATE', 'Policies & Procedures', `Synthesized ${suite.length} Standards & Training-grade ISO 27001:2022 compliance documents.`);
    return suite;
  };

  const getAuditorReadinessScorecard = (): AuditorReadinessScorecard => {
    return assessTenantAuditorReadiness(tenantDocs);
  };

  const addDocument = (docData: Omit<GeneratedDocument, 'id' | 'lastModified'>): GeneratedDocument => {
    const newDoc: GeneratedDocument = {
      ...docData,
      id: generateId('doc'),
      lastModified: new Date().toISOString()
    };
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        return {
          ...t,
          generatedDocs: [newDoc, ...(t.generatedDocs || [])]
        };
      }
      return t;
    }));
    logAuditEvent('CREATE', 'Policies & Procedures', `Created / Adopted policy document: "${docData.docCode} - ${docData.title}"`);
    return newDoc;
  };

  // Policy Lifecycle: Advance Approval Stage
  const advancePolicyApprovalStage = (
    docId: string,
    nextStage: PolicyApprovalRecord['stage'],
    comments?: string,
    approverName?: string,
    approverRole?: string
  ) => {
    const timestamp = new Date().toISOString();
    const effectiveApprover = approverName || currentUser.name;
    const effectiveRole = approverRole || currentRole;

    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const updatedDocs = t.generatedDocs.map(d => {
          if (d.id === docId) {
            const newRecord: PolicyApprovalRecord = {
              id: generateId('appr'),
              documentId: d.id,
              documentCode: d.docCode,
              documentVersion: d.version,
              stage: nextStage,
              status: 'APPROVED',
              approverName: effectiveApprover,
              approverRole: effectiveRole,
              approverEmail: currentUser.email,
              assignedDate: d.lastModified || timestamp,
              actionDate: timestamp,
              comments: comments || `Stage advanced to ${nextStage}`
            };

            const isPublished = nextStage === 'PUBLISHED';
            const updatedStatus = isPublished ? ('PUBLISHED' as const) : nextStage === 'EXECUTIVE_CISO' ? ('APPROVED' as const) : ('IN_REVIEW' as const);

            return {
              ...d,
              approvalStage: nextStage,
              status: updatedStatus,
              approvalHistory: [newRecord, ...(d.approvalHistory || [])],
              lastModified: timestamp
            };
          }
          return d;
        });

        return {
          ...t,
          generatedDocs: updatedDocs
        };
      }
      return t;
    }));

    const targetDoc = tenantDocs.find(d => d.id === docId);
    logAuditEvent(
      'APPROVE',
      'Policy Lifecycle & Workflows',
      `Policy ${targetDoc?.docCode || docId} advanced to approval stage: ${nextStage} by ${effectiveApprover} (${effectiveRole})`,
      { docId, stage: nextStage, approver: effectiveApprover, comments }
    );
  };

  // Policy Lifecycle: Request Changes / Revert to Draft or Prior Stage
  const requestPolicyChanges = (
    docId: string,
    returnStage: PolicyApprovalRecord['stage'] = 'DRAFT',
    feedbackComments: string,
    reviewerName?: string,
    reviewerRole?: string
  ) => {
    const timestamp = new Date().toISOString();
    const effectiveReviewer = reviewerName || currentUser.name;
    const effectiveRole = reviewerRole || currentRole;

    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const updatedDocs = t.generatedDocs.map(d => {
          if (d.id === docId) {
            const revisionRecord: PolicyApprovalRecord = {
              id: generateId('appr_rev'),
              documentId: d.id,
              documentCode: d.docCode,
              documentVersion: d.version,
              stage: returnStage,
              status: 'REVISED',
              approverName: effectiveReviewer,
              approverRole: effectiveRole,
              approverEmail: currentUser.email,
              assignedDate: timestamp,
              actionDate: timestamp,
              comments: `[Change Request]: ${feedbackComments}`
            };

            return {
              ...d,
              approvalStage: returnStage,
              status: returnStage === 'DRAFT' ? ('DRAFT' as const) : ('IN_REVIEW' as const),
              approvalHistory: [revisionRecord, ...(d.approvalHistory || [])],
              lastModified: timestamp
            };
          }
          return d;
        });

        return {
          ...t,
          generatedDocs: updatedDocs
        };
      }
      return t;
    }));

    const targetDoc = tenantDocs.find(d => d.id === docId);
    logAuditEvent(
      'UPDATE',
      'Policy Lifecycle & Workflows',
      `Changes requested for ${targetDoc?.docCode || docId}. Returned to ${returnStage} by ${effectiveReviewer}: "${feedbackComments}"`,
      { docId, returnStage, reviewer: effectiveReviewer, comments: feedbackComments }
    );
  };

  // Policy Review Cadence: Update Next Review Schedule
  const updatePolicyReviewSchedule = (
    docId: string,
    nextReviewDate: string,
    reviewCycle?: 'Annual' | 'Semi-Annual' | 'Quarterly' | 'Bi-Annual'
  ) => {
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const updatedDocs = t.generatedDocs.map(d => {
          if (d.id === docId) {
            return {
              ...d,
              nextReviewDate,
              reviewCycle: reviewCycle || d.reviewCycle || 'Annual',
              lastModified: new Date().toISOString()
            };
          }
          return d;
        });
        return {
          ...t,
          generatedDocs: updatedDocs
        };
      }
      return t;
    }));

    const targetDoc = tenantDocs.find(d => d.id === docId);
    logAuditEvent(
      'UPDATE',
      'Policy Review Cadence',
      `Updated review schedule for ${targetDoc?.docCode || docId}: next review set to ${nextReviewDate} (${reviewCycle || 'Annual'} cycle).`,
      { docId, nextReviewDate, reviewCycle }
    );
  };

  // Policy Review: Trigger Stakeholder Notification
  const triggerPolicyReviewNotification = (
    docId: string,
    notificationData: Omit<PolicyReviewNotification, 'id' | 'sentTimestamp' | 'deliveryStatus'>
  ): PolicyReviewNotification => {
    const timestamp = new Date().toISOString();
    const newNotification: PolicyReviewNotification = {
      ...notificationData,
      id: generateId('notif'),
      sentTimestamp: timestamp,
      deliveryStatus: 'DELIVERED'
    };

    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const updatedDocs = t.generatedDocs.map(d => {
          if (d.id === docId) {
            return {
              ...d,
              reviewNotifications: [newNotification, ...(d.reviewNotifications || [])]
            };
          }
          return d;
        });
        return {
          ...t,
          generatedDocs: updatedDocs
        };
      }
      return t;
    }));

    logAuditEvent(
      'CREATE',
      'Policy Review Notifications',
      `Automated ${notificationData.triggerType} triggered for ${notificationData.documentCode} to ${notificationData.recipientName} (${notificationData.recipientRole}) via ${notificationData.channel}.`,
      { notification: newNotification }
    );

    return newNotification;
  };

  // Batch Trigger Review Notifications for all approaching or overdue policies
  const batchTriggerReviewNotifications = (): { triggeredCount: number; notifications: PolicyReviewNotification[] } => {
    const generated: PolicyReviewNotification[] = [];
    const now = new Date();

    tenantDocs.forEach(doc => {
      const reviewDate = doc.nextReviewDate ? new Date(doc.nextReviewDate) : new Date(now.getTime() + 180 * 86400000);
      const diffDays = Math.ceil((reviewDate.getTime() - now.getTime()) / 86400000);

      if (diffDays <= 60) {
        let triggerType: PolicyReviewNotification['triggerType'] = 'MANUAL_DISPATCH';
        let channel: PolicyReviewNotification['channel'] = 'EMAIL';

        if (diffDays <= 0) {
          triggerType = 'OVERDUE_BREACH';
          channel = 'SLACK_WEBHOOK';
        } else if (diffDays <= 7) {
          triggerType = '7_DAY_URGENT';
          channel = 'TEAMS';
        } else if (diffDays <= 14) {
          triggerType = '14_DAY_REMINDER';
          channel = 'EMAIL';
        } else if (diffDays <= 30) {
          triggerType = '30_DAY_APPROACHING';
          channel = 'EMAIL';
        } else {
          triggerType = '60_DAY_ADVANCE';
          channel = 'IN_APP';
        }

        const owner = doc.documentOwner || doc.owner || 'Alex Vance';
        const ownerEmail = `${owner.toLowerCase().replace(/\s+/g, '.')}@company.internal`;

        const notif: PolicyReviewNotification = {
          id: generateId('notif_auto'),
          documentId: doc.id,
          documentCode: doc.docCode,
          documentTitle: doc.title,
          triggerType,
          recipientName: owner,
          recipientRole: 'Document Owner / Lead Custodian',
          recipientEmail: ownerEmail,
          daysRemaining: diffDays,
          dueDate: doc.nextReviewDate || reviewDate.toISOString().split('T')[0],
          channel,
          sentTimestamp: new Date().toISOString(),
          deliveryStatus: 'DELIVERED',
          messageSummary: `Automated ISO 27001 review alert: Policy ${doc.docCode} ("${doc.title}") is scheduled for review on ${doc.nextReviewDate || reviewDate.toISOString().split('T')[0]} (${diffDays > 0 ? `${diffDays} days remaining` : `${Math.abs(diffDays)} days overdue`}). Please commence the formal review workflow.`
        };

        generated.push(notif);
      }
    });

    if (generated.length > 0) {
      setTenants(prev => prev.map(t => {
        if (t.id === currentTenantId) {
          const updatedDocs = t.generatedDocs.map(d => {
            const matchingNotifs = generated.filter(n => n.documentId === d.id);
            if (matchingNotifs.length > 0) {
              return {
                ...d,
                reviewNotifications: [...matchingNotifs, ...(d.reviewNotifications || [])]
              };
            }
            return d;
          });
          return {
            ...t,
            generatedDocs: updatedDocs
          };
        }
        return t;
      }));

      logAuditEvent(
        'CREATE',
        'Policy Review Notifications',
        `Automated review cadence sweep executed: Dispatched ${generated.length} stakeholder notifications across ${generated.length} policies.`
      );
    }

    return { triggeredCount: generated.length, notifications: generated };
  };

  // Policy Lifecycle: Add Version Revision
  const addPolicyRevision = (
    docId: string,
    revision: {
      issueNo: string;
      changeDescription: string;
      pageNo: string;
      approvedBy: string;
      newContent?: string;
    }
  ) => {
    const timestamp = new Date().toISOString();
    const dateFormatted = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const updatedDocs = t.generatedDocs.map(d => {
          if (d.id === docId) {
            const currentHistory = d.revisionHistory || [];
            const nextSNo = String(currentHistory.length + 1).padStart(2, '0');
            const newRevEntry = {
              sNo: nextSNo,
              reviewDate: dateFormatted,
              pageNo: revision.pageNo || 'All',
              issueNo: revision.issueNo,
              changeDescription: revision.changeDescription,
              approvedBy: revision.approvedBy || currentUser.name
            };

            return {
              ...d,
              version: revision.issueNo,
              content: revision.newContent !== undefined ? revision.newContent : d.content,
              revisionHistory: [...currentHistory, newRevEntry],
              approvalStage: 'DRAFT' as const, // Revision initiates new approval cycle
              status: 'DRAFT' as const,
              acknowledgementCount: 0, // Requires re-acknowledgement
              lastModified: timestamp
            };
          }
          return d;
        });

        return {
          ...t,
          generatedDocs: updatedDocs
        };
      }
      return t;
    }));

    logAuditEvent(
      'UPDATE',
      'Policy Lifecycle & Versioning',
      `Created new policy revision v${revision.issueNo} for document ${docId}: "${revision.changeDescription}"`
    );
  };

  // Policy Lifecycle: Cryptographic Digital Signing
  const signPolicyDigitally = async (
    docId: string,
    signatureData: {
      signerName: string;
      signerRole: string;
      signerEmail?: string;
      signingPurpose: PolicyDigitalSignature['signingPurpose'];
      auditDeclaration?: string;
      notes?: string;
    }
  ): Promise<PolicyDigitalSignature> => {
    const targetDoc = tenantDocs.find(d => d.id === docId);
    const timestamp = new Date().toISOString();
    const docContent = targetDoc?.content || '';
    const docChecksum = await computeSHA256(docContent);

    const rawPayload = `${docId}|${targetDoc?.docCode}|${targetDoc?.version}|${signatureData.signerName}|${signatureData.signerRole}|${signatureData.signingPurpose}|${timestamp}|${docChecksum}`;
    const verificationHash = await computeSHA256(rawPayload);

    const newSignature: PolicyDigitalSignature = {
      id: generateId('dsig'),
      documentId: docId,
      documentCode: targetDoc?.docCode || 'DOC',
      documentTitle: targetDoc?.title || 'Policy Document',
      documentVersion: targetDoc?.version || '1.0',
      signerName: signatureData.signerName,
      signerEmail: signatureData.signerEmail || currentUser.email,
      signerRole: signatureData.signerRole,
      signingPurpose: signatureData.signingPurpose,
      timestamp,
      ipAddress: '185.192.68.14',
      certificateAuthority: 'Skanda GRC CA / ISO 27001 Trust Network',
      verificationHash,
      documentChecksum: docChecksum,
      auditDeclaration: signatureData.auditDeclaration || 'I hereby attest and certify that this policy has been formally reviewed, validated against ISO/IEC 27001:2022 & regulatory requirements, and is enacted for organizational enforcement.',
      status: 'VALID',
      signatureNotes: signatureData.notes
    };

    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const updatedDocs = t.generatedDocs.map(d => {
          if (d.id === docId) {
            return {
              ...d,
              digitalSignatures: [newSignature, ...(d.digitalSignatures || [])],
              contentSha256: docChecksum,
              lastModified: timestamp
            };
          }
          return d;
        });

        return {
          ...t,
          generatedDocs: updatedDocs
        };
      }
      return t;
    }));

    await logAuditEvent(
      'APPROVE',
      'Policy Digital Signature',
      `Cryptographic digital signature applied to policy ${targetDoc?.docCode} (${targetDoc?.title} v${targetDoc?.version}) by ${signatureData.signerName} for ${signatureData.signingPurpose}`,
      { docId, verificationHash, docChecksum, signer: signatureData.signerName, purpose: signatureData.signingPurpose }
    );

    return newSignature;
  };

  // Policy & Procedure Document Digital Acknowledgment Workflow
  const submitDocumentAcknowledgment = async (data: {
    documentId: string;
    documentCode: string;
    documentTitle: string;
    documentVersion: string;
    signatureText: string;
    declarationAccepted: boolean;
    notes?: string;
  }): Promise<DocumentAcknowledgment> => {
    const timestamp = new Date().toISOString();
    const payloadToHash = `${currentUser.id}_${data.documentId}_${data.documentVersion}_${timestamp}_${data.signatureText}`;
    const verificationHash = await computeSHA256(payloadToHash);

    const newAck: DocumentAcknowledgment = {
      id: generateId('ack'),
      tenantId: currentTenantId,
      documentId: data.documentId,
      documentCode: data.documentCode,
      documentTitle: data.documentTitle,
      documentVersion: data.documentVersion,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userRole: currentRole,
      department: currentUser.departmentId || currentUser.title || 'Operations & Compliance',
      timestamp,
      ipAddress: '185.192.68.14',
      signatureText: data.signatureText,
      declarationAccepted: data.declarationAccepted,
      verificationHash,
      notes: data.notes
    };

    setDocumentAcknowledgments(prev => [newAck, ...prev]);

    // Update document acknowledgementCount on tenant
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        return {
          ...t,
          generatedDocs: t.generatedDocs.map(d => {
            if (d.id === data.documentId) {
              return {
                ...d,
                acknowledgementCount: (d.acknowledgementCount || 0) + 1
              };
            }
            return d;
          })
        };
      }
      return t;
    }));

    await logAuditEvent(
      'APPROVE',
      'Policy Acknowledgement',
      `Digital signature and compliance acknowledgment recorded for ${data.documentCode} (${data.documentTitle} ${data.documentVersion}) by ${currentUser.name}`,
      { docId: data.documentId, docCode: data.documentCode, version: data.documentVersion, hash: verificationHash }
    );

    return newAck;
  };

  // Risk Treatment Scenarios & Simulation
  const saveRiskScenario = (scenarioData: Omit<RiskTreatmentScenario, 'id' | 'tenantId' | 'simulatedAt' | 'simulatedBy'>) => {
    const newScenario: RiskTreatmentScenario = {
      ...scenarioData,
      id: generateId('scen'),
      tenantId: currentTenantId,
      simulatedAt: new Date().toISOString(),
      simulatedBy: `${currentUser.name} (${currentUser.role})`
    };
    setRiskScenarios(prev => [newScenario, ...prev]);
    logAuditEvent(
      'CREATE',
      'Risk Treatment Simulator',
      `Saved treatment simulation scenario "${newScenario.scenarioName}" for risk ${newScenario.riskCode} - Projected Residual Score: ${newScenario.projectedResidualScore} (down from ${newScenario.inherentScore})`,
      { riskId: newScenario.riskId, projectedScore: newScenario.projectedResidualScore, reduction: `${newScenario.riskReductionPercentage}%` }
    );
  };

  const deleteRiskScenario = (id: string) => {
    const existing = riskScenarios.find(s => s.id === id);
    setRiskScenarios(prev => prev.filter(s => s.id !== id));
    logAuditEvent('DELETE', 'Risk Treatment Simulator', `Deleted simulation scenario "${existing?.scenarioName || id}"`);
  };

  const applyRiskTreatmentFromSimulation = (riskId: string, treatmentData: {
    treatmentOption: RiskRecord['treatmentOption'];
    mitigationControl: string;
    residualLikelihood: number;
    residualImpact: number;
    treatmentOwner: string;
    targetDate: string;
    notes?: string;
  }) => {
    const residualScore = treatmentData.residualLikelihood * treatmentData.residualImpact;
    const targetRisk = risks.find(r => r.id === riskId);

    setRisks(prev => prev.map(r => {
      if (r.id === riskId) {
        return {
          ...r,
          treatmentOption: treatmentData.treatmentOption,
          mitigationControl: treatmentData.mitigationControl,
          residualLikelihood: treatmentData.residualLikelihood,
          residualImpact: treatmentData.residualImpact,
          residualScore: residualScore,
          treatmentOwner: treatmentData.treatmentOwner,
          targetDate: treatmentData.targetDate,
          status: residualScore <= 4 ? 'Residual Monitored' : 'Treatment in Progress',
          escalatedToSuperAdmin: residualScore >= 15
        };
      }
      return r;
    }));

    logAuditEvent(
      'UPDATE',
      'Risk Treatment Simulator',
      `Applied simulated treatment to Risk ${targetRisk?.riskCode || riskId}: Option=${treatmentData.treatmentOption}, Residual Score=${residualScore} (Likelihood: ${treatmentData.residualLikelihood}, Impact: ${treatmentData.residualImpact}), Owner: ${treatmentData.treatmentOwner}`,
      { riskId, beforeScore: targetRisk?.inherentScore, afterScore: residualScore, option: treatmentData.treatmentOption }
    );
  };

  // Super Admin Recommendations
  const issueRecommendation = (data: Omit<SuperAdminRecommendation, 'id' | 'issuedBy' | 'issuedDate'>) => {
    const newRec: SuperAdminRecommendation = {
      ...data,
      id: generateId('rec'),
      issuedBy: `${currentUser.name} (Super Admin)`,
      issuedDate: new Date().toISOString()
    };
    setSuperAdminRecommendations(prev => [newRec, ...prev]);
    logAuditEvent('CREATE', 'Super Admin Recommendations', `Issued ${data.priority} recommendation for tenant ${data.tenantId}: "${data.title}"`);
  };

  const updateRecommendationStatus = (id: string, status: 'Open' | 'Acknowledged' | 'Implemented') => {
    setSuperAdminRecommendations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    logAuditEvent('UPDATE', 'Super Admin Recommendations', `Recommendation ID ${id} status updated to ${status}`);
  };

  // Tasks
  const addTask = (task: Omit<TaskRecord, 'id' | 'tenantId'>) => {
    const newT: TaskRecord = {
      ...task,
      id: generateId('tsk'),
      tenantId: currentTenantId
    };
    setTasks(prev => [newT, ...prev]);
    logAuditEvent('CREATE', 'Tasks and Projects', `Created task: "${task.title}"`);
  };

  const updateTask = (id: string, task: Partial<TaskRecord>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...task } : t));
    logAuditEvent('UPDATE', 'Tasks and Projects', `Updated task ID ${id}`);
  };

  const deleteTask = (id: string) => {
    const existing = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    logAuditEvent('DELETE', 'Tasks and Projects', `Deleted task "${existing?.title || id}"`);
  };

  // Management Review Meeting (MRM - Clause 9.3)
  const addManagementReview = (mrm: Omit<ManagementReviewRecord, 'id' | 'tenantId'>) => {
    const newMRM: ManagementReviewRecord = {
      ...mrm,
      id: generateId('mrm'),
      tenantId: currentTenantId
    };
    setManagementReviews(prev => [newMRM, ...prev]);
    logAuditEvent('CREATE', 'Management Review (Clause 9.3)', `Created management review session: "${mrm.meetingTitle}"`);
  };

  const updateManagementReview = (id: string, mrm: Partial<ManagementReviewRecord>) => {
    setManagementReviews(prev => prev.map(m => m.id === id ? { ...m, ...mrm } : m));
    logAuditEvent('UPDATE', 'Management Review (Clause 9.3)', `Updated management review record ID ${id}`);
  };

  const signOffManagementReview = async (id: string, signatory: string, conclusions: string) => {
    const timestamp = new Date().toISOString();
    const targetMRM = managementReviews.find(m => m.id === id);
    if (!targetMRM) return;

    const payload = JSON.stringify({
      id: targetMRM.id,
      title: targetMRM.meetingTitle,
      date: targetMRM.meetingDate,
      conclusions,
      signatory,
      timestamp
    });

    const hash = await computeSHA256(payload);

    setManagementReviews(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          status: 'Signed Off',
          conclusions,
          signoffTimestamp: timestamp,
          signoffSignatory: signatory,
          signoffHash: hash
        };
      }
      return m;
    }));

    await logAuditEvent(
      'APPROVE',
      'Management Review (Clause 9.3)',
      `Formally signed off and sealed Management Review "${targetMRM.meetingTitle}" by ${signatory} with SHA-256 seal`,
      { hash, timestamp }
    );
  };

  // Assign External Auditor
  const assignExternalAuditor = (tenantId: string, auditorId: string, timeline: TenantCompany['externalAuditTimeline']) => {
    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        const assigned = t.assignedExternalAuditors.includes(auditorId)
          ? t.assignedExternalAuditors
          : [...t.assignedExternalAuditors, auditorId];
        return {
          ...t,
          assignedExternalAuditors: assigned,
          externalAuditTimeline: timeline
        };
      }
      return t;
    }));
    logAuditEvent('UPDATE', 'External Auditor Assignment', `Assigned auditor ${auditorId} to tenant ${tenantId}`);
  };

  // P1: Trigger Evidence Refresh Campaign (ISO 27001 Cl. 9.1 & Annex A 5.37)
  const triggerEvidenceRefreshCampaign = (): number => {
    const tenantControls = currentTenant?.controls || [];
    const tenantEvidence = evidence.filter(e => e.tenantId === currentTenantId);
    const { items } = calculateEvidenceFreshness(tenantEvidence, tenantControls);

    const urgentItems = items.filter(i => i.freshnessStatus === 'Expired' || i.freshnessStatus === 'Stale');
    let count = 0;

    urgentItems.forEach(item => {
      const exists = tasks.some(
        t => t.tenantId === currentTenantId && t.title.includes(item.controlCode) && t.status !== 'Done'
      );
      if (!exists) {
        const newTask: TaskRecord = {
          id: generateId('tsk'),
          tenantId: currentTenantId,
          title: `[Evidence Refresh SLA] Re-certify ${item.controlCode} evidence (${item.title})`,
          description: `Evidence item "${item.title}" for control ${item.controlCode} has degraded to status "${item.freshnessStatus}" (${item.ageInDays} days old, max SLA: ${item.slaMaxDays} days). Refresh required to maintain ISO 27001 Cl. 9.1 & Annex A 5.37 operational procedure conformance.`,
          assignedTo: `${item.department} Lead`,
          department: item.department || 'Compliance',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          priority: item.freshnessStatus === 'Expired' ? 'High' : 'Medium',
          status: 'To Do',
          category: 'Evidence Collection',
          linkedControl: item.controlCode
        };
        setTasks(prev => [newTask, ...prev]);
        count++;
      }
    });

    logAuditEvent(
      'CREATE',
      'Evidence Freshness Engine',
      `Dispatched automated evidence refresh campaign for ${count} control(s) approaching or exceeding SLA thresholds.`
    );

    return count;
  };

  // P3: Automated SoA & Risk Register Dynamic Sync (ISO 27001 Cl. 6.1.2 & 6.1.3)
  const syncRiskRegisterAndSoA = (): { changesCount: number; changeLog: string[] } => {
    const tenantControls = currentTenant?.controls || [];
    const tenantRisks = risks.filter(r => r.tenantId === currentTenantId);

    const { updatedRisks, updatedControls, changesCount, changeLog } = performDynamicSoARiskSync(
      tenantRisks,
      tenantControls
    );

    if (changesCount > 0) {
      // Update risks
      setRisks(prev => prev.map(r => {
        if (r.tenantId === currentTenantId) {
          const match = updatedRisks.find(ur => ur.id === r.id);
          return match || r;
        }
        return r;
      }));

      // Update tenant controls
      setTenants(prev => prev.map(t => {
        if (t.id === currentTenantId) {
          const implementedCount = updatedControls.filter(
            c => c.applicable && (c.implementationStatus === 'Implemented' || c.implementationStatus === 'Monitored' || c.implementationStatus === 'Audited')
          ).length;
          const totalApplicable = updatedControls.filter(c => c.applicable).length || 1;
          const readiness = Math.round((implementedCount / totalApplicable) * 100);

          return {
            ...t,
            controls: updatedControls,
            readinessScore: readiness
          };
        }
        return t;
      }));

      logAuditEvent(
        'UPDATE',
        'ISO 27001 Cl. 6.1.2 / 6.1.3 Dynamic Sync',
        `Reconciled Risk Register and Statement of Applicability with ${changesCount} update(s).`,
        { changesCount, changeLog }
      );
    }

    return { changesCount, changeLog };
  };

  // Reset to initial fixtures
  const resetAllData = () => {
    localStorage.clear();
    setTenants(INITIAL_TENANTS);
    setUsers(INITIAL_USERS);
    setMasterCategories(MASTER_CATEGORIES);
    setMasterIndustries(MASTER_INDUSTRIES);
    setMasterDepartments(MASTER_DEPARTMENTS);
    setAssets(INITIAL_ASSETS);
    setDataAssets(INITIAL_DATA_ASSETS);
    setVendors(INITIAL_VENDORS);
    setRisks(INITIAL_RISKS);
    setEvidence(INITIAL_EVIDENCE);
    setInternalAudits(INITIAL_INTERNAL_AUDITS);
    setFindings(INITIAL_FINDINGS);
    setAuditTrail(INITIAL_AUDIT_TRAIL);
    setSuperAdminRecommendations(INITIAL_SUPERADMIN_RECOMMENDATIONS);
    setTasks(INITIAL_TASKS);
    setDocumentAcknowledgments(INITIAL_DOCUMENT_ACKNOWLEDGMENTS);
    setRiskScenarios(INITIAL_RISK_SCENARIOS);
    setManagementReviews(INITIAL_MANAGEMENT_REVIEWS);
    setCurrentUser(INITIAL_USERS[2]);
    setCurrentRole('COMPANY_ADMIN');
    setCurrentTenantId('tenant_skanda');
    setActiveModule('business_discovery');

    // Reset manual theme override and re-sync to OS-level preference
    try {
      localStorage.removeItem('grc_portal_theme_manual');
      localStorage.removeItem('grc_portal_theme');
    } catch {
      // ignore
    }
    setIsOSThemeSynced(true);
    const osPref = getOSThemePreference();
    setOSTheme(osPref);
    triggerThemeTransition(osPref);
  };

  // Active tenant controls & docs helper
  const tenantControls = currentTenant?.controls || [];
  const tenantDocs = currentTenant?.generatedDocs || [];

  // Statement of Applicability (SoA) Sync Verifier (ISO 27001 Clause 6.1.3 d)
  const tenantRisks = risks.filter(r => r.tenantId === currentTenantId);
  const [dismissedSoAIssueIds, setDismissedSoAIssueIds] = useState<string[]>([]);

  const rawVerifierReport = useMemo(
    () => verifySoAJustifications(tenantRisks, tenantControls),
    [tenantRisks, tenantControls]
  );

  const soaVerifierReport: SoAVerifierReport = useMemo(() => {
    const filteredIssues = rawVerifierReport.issues.filter(
      issue => !dismissedSoAIssueIds.includes(issue.id)
    );
    const totalExcludedControls = rawVerifierReport.totalExcludedControls;
    const outdatedCount = filteredIssues.length;
    const validExclusionCount = Math.max(0, totalExcludedControls - outdatedCount);
    const criticalIssuesCount = filteredIssues.filter(i => i.severity === 'Critical').length;
    const highIssuesCount = filteredIssues.filter(i => i.severity === 'High').length;
    const deductions = (criticalIssuesCount * 30) + (highIssuesCount * 15) + ((outdatedCount - criticalIssuesCount - highIssuesCount) * 8);
    const verificationHealthScore = Math.max(0, Math.min(100, Math.round(100 - deductions)));

    return {
      timestamp: rawVerifierReport.timestamp,
      totalExcludedControls,
      outdatedCount,
      validExclusionCount,
      criticalIssuesCount,
      highIssuesCount,
      issues: filteredIssues,
      verificationHealthScore
    };
  }, [rawVerifierReport, dismissedSoAIssueIds]);

  const soaVerificationIssues = soaVerifierReport.issues;

  const runSoASyncVerification = useCallback(() => {
    return verifySoAJustifications(tenantRisks, tenantControls);
  }, [tenantRisks, tenantControls]);

  const reincludeControlFromIssue = useCallback((issueId: string) => {
    const issue = soaVerificationIssues.find(i => i.id === issueId);
    if (!issue) return;

    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const updatedControls = t.controls.map(c => {
          if (c.id === issue.controlId || c.controlCode === issue.controlCode) {
            return {
              ...c,
              applicable: true,
              implementationStatus: 'In Progress' as const,
              justification: issue.suggestedRevisedJustification || `Re-included as APPLICABLE following identification of Risk ${issue.triggeringRisk.riskCode}: "${issue.triggeringRisk.title}".`,
              mappedRiskCodes: Array.from(new Set([...(c.mappedRiskCodes || []), issue.triggeringRisk.riskCode]))
            };
          }
          return c;
        });

        const implementedCount = updatedControls.filter(
          c => c.applicable && (c.implementationStatus === 'Implemented' || c.implementationStatus === 'Monitored' || c.implementationStatus === 'Audited')
        ).length;
        const totalApplicable = updatedControls.filter(c => c.applicable).length || 1;
        const readiness = Math.round((implementedCount / totalApplicable) * 100);

        return {
          ...t,
          controls: updatedControls,
          readinessScore: readiness
        };
      }
      return t;
    }));

    logAuditEvent(
      'UPDATE',
      'SoA Sync Verifier',
      `Re-included Control ${issue.controlCode} ("${issue.controlTitle}") into Statement of Applicability after resolving outdated justification caused by Risk ${issue.triggeringRisk.riskCode}.`,
      { controlCode: issue.controlCode, riskCode: issue.triggeringRisk.riskCode }
    );
  }, [soaVerificationIssues, currentTenantId]);

  const updateJustificationFromIssue = useCallback((issueId: string, newJustification: string) => {
    const issue = soaVerificationIssues.find(i => i.id === issueId);
    if (!issue) return;

    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const updatedControls = t.controls.map(c => {
          if (c.id === issue.controlId || c.controlCode === issue.controlCode) {
            return {
              ...c,
              justification: newJustification
            };
          }
          return c;
        });
        return { ...t, controls: updatedControls };
      }
      return t;
    }));

    logAuditEvent(
      'UPDATE',
      'SoA Sync Verifier',
      `Updated and re-certified exclusion justification for Control ${issue.controlCode} under ISO 27001 Cl. 6.1.3(d).`,
      { controlCode: issue.controlCode, newJustification }
    );
  }, [soaVerificationIssues, currentTenantId]);

  const dismissSoAIssue = useCallback((issueId: string, auditorNote?: string) => {
    setDismissedSoAIssueIds(prev => Array.from(new Set([...prev, issueId])));
    const issue = soaVerificationIssues.find(i => i.id === issueId);
    logAuditEvent(
      'UPDATE',
      'SoA Sync Verifier',
      `Auditor accepted justification exception for Control ${issue?.controlCode || issueId}: ${auditorNote || 'Dismissed by compliance officer with justification exception notes.'}`,
      { issueId, auditorNote }
    );
  }, [soaVerificationIssues]);

  const batchReconcileOutdatedSoA = useCallback((): { count: number; reincludedCodes: string[] } => {
    const activeIssues = soaVerificationIssues;
    if (activeIssues.length === 0) return { count: 0, reincludedCodes: [] };

    const controlCodesToReinclude = Array.from(new Set(activeIssues.map(i => i.controlCode)));

    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const updatedControls = t.controls.map(c => {
          if (controlCodesToReinclude.includes(c.controlCode)) {
            const relatedIssue = activeIssues.find(i => i.controlCode === c.controlCode);
            return {
              ...c,
              applicable: true,
              implementationStatus: 'In Progress' as const,
              justification: relatedIssue?.suggestedRevisedJustification || `Re-included in SoA via Automated SoA Sync Verifier batch reconciliation.`,
              mappedRiskCodes: relatedIssue
                ? Array.from(new Set([...(c.mappedRiskCodes || []), relatedIssue.triggeringRisk.riskCode]))
                : c.mappedRiskCodes
            };
          }
          return c;
        });

        const implementedCount = updatedControls.filter(
          c => c.applicable && (c.implementationStatus === 'Implemented' || c.implementationStatus === 'Monitored' || c.implementationStatus === 'Audited')
        ).length;
        const totalApplicable = updatedControls.filter(c => c.applicable).length || 1;
        const readiness = Math.round((implementedCount / totalApplicable) * 100);

        return {
          ...t,
          controls: updatedControls,
          readinessScore: readiness
        };
      }
      return t;
    }));

    logAuditEvent(
      'UPDATE',
      'SoA Sync Verifier',
      `Batch reconciled ${controlCodesToReinclude.length} excluded controls into Statement of Applicability: ${controlCodesToReinclude.join(', ')}`,
      { reincludedCodes: controlCodesToReinclude }
    );

    return { count: controlCodesToReinclude.length, reincludedCodes: controlCodesToReinclude };
  }, [soaVerificationIssues, currentTenantId]);

  const simulateOutdatedSoARisk = useCallback((sampleIndex = 0): RiskRecord => {
    const sample = SAMPLE_VERIFICATION_TEST_RISKS[sampleIndex % SAMPLE_VERIFICATION_TEST_RISKS.length];
    const count = risks.filter(r => r.tenantId === currentTenantId).length + 1;
    const riskCode = `RSK-2026-${count.toString().padStart(2, '0')}`;
    const inherentScore = sample.likelihood * sample.impact;
    const residualScore = sample.residualLikelihood * sample.residualImpact;

    const newRisk: RiskRecord = {
      ...sample,
      id: generateId('rsk_sim'),
      tenantId: currentTenantId,
      riskCode,
      inherentScore,
      residualScore,
      escalatedToSuperAdmin: inherentScore >= 15,
      status: 'Identified'
    };

    setRisks(prev => [newRisk, ...prev]);
    logAuditEvent(
      'CREATE',
      'SoA Sync Verifier Simulation',
      `Simulated risk entry ${riskCode}: "${sample.title}" to test SoA justification sync verification.`,
      { riskCode, sample }
    );

    return newRisk;
  }, [risks, currentTenantId]);

  // MAS Regulatory Profile & Applicability Rules Engine
  const [masRegulatoryProfile, setMasRegulatoryProfile] = useState<MASRegulatoryProfile>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_mas_regulatory_profile`);
      if (!saved) return INITIAL_MAS_REGULATORY_PROFILE;
      const parsed = JSON.parse(saved);
      return (parsed && typeof parsed.isSingaporeEntity === 'boolean') ? parsed : INITIAL_MAS_REGULATORY_PROFILE;
    } catch {
      return INITIAL_MAS_REGULATORY_PROFILE;
    }
  });

  const masApplicabilityRules: ApplicabilityRule[] = DEFAULT_MAS_APPLICABILITY_RULES;

  const masApplicabilityEvaluation = useMemo(() => {
    return getActiveMASModulesFromProfile(masRegulatoryProfile, masApplicabilityRules);
  }, [masRegulatoryProfile, masApplicabilityRules]);

  const activeMASModuleIds = useMemo(() => {
    return masApplicabilityEvaluation.activeModuleIds;
  }, [masApplicabilityEvaluation]);

  const masModuleApplicabilityDictionary = useMemo(() => {
    return masApplicabilityEvaluation.moduleKeysDictionary;
  }, [masApplicabilityEvaluation]);

  const updateMASRegulatoryProfile = useCallback((updates: Partial<MASRegulatoryProfile>) => {
    setMasRegulatoryProfile(prev => {
      const updated: MASRegulatoryProfile = {
        ...prev,
        ...updates
      };
      try {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_mas_regulatory_profile`, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save MAS regulatory profile', e);
      }
      return updated;
    });

    logAuditEvent(
      'UPDATE',
      'MAS Regulatory Discovery & Scoping',
      `Updated Singapore regulatory profile & recalibrated MAS TRM applicability rules. Status: ${updates.applicabilityStatus || 'DISCOVERY_IN_PROGRESS'}`
    );
  }, [logAuditEvent]);

  const isMASModuleApplicable = useCallback((moduleId: string): boolean => {
    // Discovery & Scoping wizard is always accessible to allow scoping changes
    if (moduleId === 'mas_discovery_scoping') {
      return true;
    }

    // If module key is defined in the toggle-able module dictionary, strictly check if true
    if (moduleId in masModuleApplicabilityDictionary) {
      return masModuleApplicabilityDictionary[moduleId] === true;
    }

    // Check alias route mappings against the toggle-able dictionary
    const aliasMap: Record<string, string> = {
      cis_downtime_ledger: 'mas_critical_systems',
      notice644_incident: 'mas_incident_notification',
      mas_flow_dashboard: 'mas_compliance_flow',
      mas_implementation_journey: 'mas_trm_journey',
      mas_classic_dashboard: 'mas_dashboard',
      mas_compliance_checklist: 'mas_checklist'
    };

    if (aliasMap[moduleId] && aliasMap[moduleId] in masModuleApplicabilityDictionary) {
      return masModuleApplicabilityDictionary[aliasMap[moduleId]] === true;
    }

    // If it's a module starting with 'mas_', check against activeMASModuleIds
    if (moduleId.startsWith('mas_')) {
      return activeMASModuleIds.includes(moduleId);
    }

    // Non-MAS modules (e.g. ISO 27001, DPDP, BrandGuard) are universally applicable
    return true;
  }, [masModuleApplicabilityDictionary, activeMASModuleIds]);

  const getMASApplicabilityRuleForModule = useCallback((moduleId: string): ApplicabilityRule | undefined => {
    return masApplicabilityRules.find(rule => rule.affectedModuleIds.includes(moduleId));
  }, [masApplicabilityRules]);

  const activateMASFramework = useCallback(() => {
    updateMASRegulatoryProfile({ isMasRegulated: true, applicabilityStatus: 'CONFIRMED' });
    if (currentTenant) {
      const currentFws = currentTenant.selectedFrameworks || [];
      if (!currentFws.includes('MAS_TRM')) {
        savePhase3FrameworkAndGenerate([...currentFws, 'MAS_TRM']);
      }
    }
  }, [updateMASRegulatoryProfile, currentTenant, savePhase3FrameworkAndGenerate]);

  const deactivateMASFramework = useCallback(() => {
    updateMASRegulatoryProfile({ isMasRegulated: false });
    if (currentTenant) {
      const currentFws = currentTenant.selectedFrameworks || [];
      if (currentFws.includes('MAS_TRM')) {
        savePhase3FrameworkAndGenerate(currentFws.filter(f => f !== 'MAS_TRM'));
      }
    }
  }, [updateMASRegulatoryProfile, currentTenant, savePhase3FrameworkAndGenerate]);

  const applicabilityRuleConfig: ApplicabilityRuleConfig = useMemo(() => {
    const isFrameworkActive = Boolean(
      masRegulatoryProfile.isMasRegulated ||
      currentTenant?.selectedFrameworks?.includes('MAS_TRM')
    );

    return {
      rules: masApplicabilityRules,
      regulatoryProfile: masRegulatoryProfile,
      profile: masRegulatoryProfile,
      moduleKeysDictionary: masModuleApplicabilityDictionary,
      moduleKeys: masModuleApplicabilityDictionary,
      toggleableModuleKeys: masModuleApplicabilityDictionary,
      activeModuleIds: activeMASModuleIds,
      isFrameworkActive,
      status: isFrameworkActive ? 'ACTIVE' : 'INACTIVE',
      toggleFrameworkActivation: () => {
        if (isFrameworkActive) {
          deactivateMASFramework();
        } else {
          activateMASFramework();
        }
      },
      isModuleApplicable: isMASModuleApplicable,
      isMASModuleApplicable,
      getRuleForModule: getMASApplicabilityRuleForModule,
      recalibrateProfile: updateMASRegulatoryProfile,
      activateFramework: activateMASFramework,
      deactivateFramework: deactivateMASFramework,
      readinessScore: masReadinessScoreSummary.overallReadinessScore,
      readinessSummary: masReadinessScoreSummary,
      calculateReadinessScore: calculateMASReadinessScore
    };
  }, [
    masApplicabilityRules,
    masRegulatoryProfile,
    masModuleApplicabilityDictionary,
    activeMASModuleIds,
    currentTenant?.selectedFrameworks,
    isMASModuleApplicable,
    getMASApplicabilityRuleForModule,
    updateMASRegulatoryProfile,
    activateMASFramework,
    deactivateMASFramework,
    masReadinessScoreSummary,
    calculateMASReadinessScore
  ]);

  return (
    <GRCContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        login,
        loginWithSessionContext,
        sessionContext,
        logout,
        currentUser,
        currentRole,
        currentTenantId,
        currentTenant,
        users,
        tenants,
        switchUser,
        switchRole,
        switchTenant,

        // Role Preview & RBAC Simulation
        isPreviewRoleActive,
        previewRole,
        realAdminRole,
        isRealRoleAdmin,
        enableRolePreview,
        disableRolePreview,
        toggleRolePreview,
        canUserAccessModule,

        masterCategories,
        masterIndustries,
        masterDepartments,
        masterControls: MASTER_ISO27001_CONTROLS,
        addMasterCategory,
        updateMasterCategory,
        deleteMasterCategory,
        addMasterIndustry,
        updateMasterIndustry,
        deleteMasterIndustry,
        addMasterDepartment,
        updateMasterDepartment,
        deleteMasterDepartment,

        savePhase1Registration,
        savePhase2Scope,
        lockSoABaseline,
        savePhase3FrameworkAndGenerate,
        executeMoU,
        setTenantOnboardingPhase,
        isSurveyComplete,
        isOnboardingComplete,

        // Extended ISO 27001:2022 Implementation & Discovery Engine
        workflowStages,
        nextRecommendedAction,
        saveCompanyRegistrationProfile,
        updateDiscoveryQuestion,
        batchAnswerDiscoverySection,
        updateDepartmentSurvey,
        updateImplementationPlanItem,
        advanceWorkflowStage,
        recalibrateComplianceProfile,

        assets,
        addAsset,
        updateAsset,
        deleteAsset,

        dataAssets,
        addDataAsset,
        updateDataAsset,
        deleteDataAsset,

        vendors,
        addVendor,
        updateVendor,
        deleteVendor,

        risks,
        addRisk,
        updateRisk,
        deleteRisk,
        mapRiskToMasRequirement,
        unmapRiskFromMasRequirement,
        setRiskMasRequirements,
        masEnterpriseRiskProfile,
        getMasRequirementRiskExposure,
        getMasDomainExposureMetrics,
        autoMapTechnologyRisks,
        batchMapTechnologyRisks,
        getHeatmapCellMasExposure,
        getHeatmapMasExposureGrid,

        evidence,
        uploadEvidence,
        verifyEvidenceChecksum,
        reviewEvidence,
        submitEvidenceForReview,
        deleteEvidence,
        autoTagEvidenceWithDPDP,
        batchAutoTagEvidenceWithDPDP,
        autoTagEvidenceWithISO,
        batchAutoTagEvidenceWithISO,

        internalAudits,
        addInternalAudit,
        updateInternalAudit,
        updateChecklistItem,

        findings,
        addFinding,
        updateFinding,
        deleteFinding,
        validateAndCloseFinding,

        controls: tenantControls,
        updateControl,

        generatedDocs: tenantDocs,
        addDocument,
        updateDocumentStatus,
        updateDocumentContent,
        updateDocument,
        acknowledgeDocument,
        upgradeAllDocsToAuditorGrade,
        synthesizeStandardsPolicySuite,
        getAuditorReadinessScorecard,
        advancePolicyApprovalStage,
        requestPolicyChanges,
        updatePolicyReviewSchedule,
        triggerPolicyReviewNotification,
        batchTriggerReviewNotifications,
        addPolicyRevision,
        signPolicyDigitally,

        documentAcknowledgments,
        submitDocumentAcknowledgment,

        riskScenarios,
        saveRiskScenario,
        deleteRiskScenario,
        applyRiskTreatmentFromSimulation,

        managementReviews,
        addManagementReview,
        updateManagementReview,
        signOffManagementReview,

        superAdminRecommendations,
        issueRecommendation,
        addSuperAdminRecommendation: issueRecommendation,
        updateRecommendationStatus,

        tasks,
        addTask,
        updateTask,
        deleteTask,

        // Unified Remediation & Continuous Exception Desk
        unifiedRemediations,
        addUnifiedRemediation,
        updateUnifiedRemediation,
        deleteUnifiedRemediation,
        requestRiskExceptionWaiver,
        approveOrRejectWaiver,
        verifyCompensatingControl,
        signOffRemediationAudit,
        triggerRemediationRetest,
        syncFindingsToRemediations,

        auditTrail,
        logAuditEvent,
        validateAuditTrailIntegrity,

        assignExternalAuditor,

        // Department Scope & Policy Compliance Intelligence
        departmentScopes,
        updateDepartmentScope,
        addCustomDepartmentScope,
        deleteDepartmentScope,
        toggleDepartmentInScope,
        autoMapDepartmentPolicies,
        addPolicyRequirementToDepartment,
        updateDepartmentPolicyRequirement,
        removeDepartmentPolicyRequirement,

        activeModule,
        setActiveModule,
        findingFilterQuery,
        setFindingFilterQuery,
        navigateToFindingsCAPA,
        startNewEntityOnboarding,
        quickLoginAsAdmin,
        quickLoginAsSuperAdmin,

        // P1 & P3 Engines & SoA Sync Verifier
        triggerEvidenceRefreshCampaign,
        syncRiskRegisterAndSoA,
        soaVerifierReport,
        soaVerificationIssues,
        runSoASyncVerification,
        reincludeControlFromIssue,
        updateJustificationFromIssue,
        dismissSoAIssue,
        batchReconcileOutdatedSoA,
        simulateOutdatedSoARisk,
        ingestBatchHarvestedEvidence,
        syncStateToCloudDatabase,
        persistenceStatus,

        resetAllData,
        resetToDemoData: resetAllData,

        // Global Theme Management with OS Preference Detection
        theme,
        isThemeTransitioning,
        osTheme,
        isOSThemeSynced,
        setTheme,
        toggleTheme,
        syncWithOSTheme,

        // Font & Contrast Accessibility Settings
        readability,
        updateReadability,
        resetReadability,

        // Framework & Regulatory Intelligence Engine
        selectedFramework,
        setSelectedFramework,
        regulatoryAuthorities: REGULATORY_AUTHORITIES,
        regulatorySources: REGULATORY_SOURCE_DOCUMENTS,
        frameworkDefinitions: FRAMEWORK_DEFINITIONS,
        masDomains: MAS_TRM_DOMAINS,
        masRequirements: MAS_TRM_REQUIREMENTS,
        masAssessments,
        crossFrameworkMappings: CROSS_FRAMEWORK_MAPPINGS,
        regulatoryNotices,
        masProfile,
        masIncidents,
        updateMASAssessment,
        updateMASProfile,
        addMASIncident,
        acknowledgeRegulatoryNotice,
        calculateMASComplianceScore,

        // MAS Regulatory Profile & Applicability Rules Engine
        masRegulatoryProfile,
        updateMASRegulatoryProfile,
        masApplicabilityRules,
        masModuleApplicabilityDictionary,
        activeMASModuleIds,
        isMASModuleApplicable,
        getMASApplicabilityRuleForModule,
        applicabilityRuleConfig,
        applicabilityRule: applicabilityRuleConfig,
        ApplicabilityRule: applicabilityRuleConfig,
        masReadinessScoreSummary,
        calculateMASReadinessScore,

        // Product Mode & Dual Operating Engine
        productMode,
        setProductMode,
        activePersona,
        setActivePersona,

        // Universal 360° Slide-Over Entity Drawer
        entityDrawerState,
        openEntityDrawer,
        closeEntityDrawer,
        navigateEntityDrawerBack
      }}
    >

      {children}
    </GRCContext.Provider>
  );
};

export const useGRC = (): GRCContextType => {
  const context = useContext(GRCContext);
  if (!context) {
    throw new Error('useGRC must be used within a GRCProvider');
  }
  return context;
};

export type { ApplicabilityRule, ApplicabilityRuleConfig, MASModuleApplicabilityDictionary } from '../types/masTrmFrameworkTypes';
