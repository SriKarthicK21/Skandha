import { ControlItem, RiskItem, FindingItem } from '../types';

export type ComplianceProgramCategory =
  | 'Information Security'
  | 'Privacy'
  | 'AI Governance'
  | 'Technology Risk'
  | 'Service Organization'
  | 'Security / Risk'
  | 'Business Continuity'
  | 'Risk Management'
  | 'Governance';

export interface ComplianceProgramDefinition {
  id: string;
  code: string;
  name: string;
  fullTitle: string;
  category: ComplianceProgramCategory;
  description: string;
  whatItMeans: string;
  regulatoryBody: string;
  primaryStandard: string;
  defaultControlsCount: number;
  typicalAuditCadence: string;
  applicabilityCriteria: string[];
  commonOverlaps: string[]; // IDs of other programs it shares controls with
  badgeColor: string;
  iconName: string;
  keyBenefits: string[];
  mandatoryArtifacts: string[];
}

export type JourneyStageKey =
  | 'account_registration'
  | 'organization_registration'
  | 'program_selection'
  | 'business_discovery'
  | 'scope_definition'
  | 'smart_assessment'
  | 'program_configuration'
  | 'unified_controls'
  | 'gap_analysis'
  | 'risk_assessment'
  | 'evidence_collection'
  | 'remediation_capa'
  | 'control_testing'
  | 'audit_readiness'
  | 'continuous_compliance';

export interface JourneyStageConfig {
  key: JourneyStageKey;
  stepNumber: number;
  title: string;
  shortTitle: string;
  subtitle: string;
  description: string;
  iconName: string;
  category: 'Foundation' | 'Discovery' | 'Assessment' | 'Assurance' | 'Operation';
  estimatedMinutes: number;
  whyWeAsk: string;
  recommendedAction: string;
  requiredForPrograms?: string[];
}

export interface SmartAssessmentQuestion {
  id: string;
  sectionId: string;
  sectionTitle: string;
  question: string;
  description?: string;
  contextTooltip: string;
  type: 'boolean' | 'select' | 'multi_select' | 'text' | 'number';
  options?: Array<{ label: string; value: string; hint?: string }>;
  dependsOn?: {
    questionId: string;
    expectedValue: any;
  };
  activatesPrograms?: string[];
  activatesModules?: string[];
  evidenceRequirementTag?: string;
  suggestedRiskTag?: string;
  governanceDomain: string;
}

export interface OrganizationLocationNode {
  id: string;
  name: string;
  country: string;
  city?: string;
  isHeadquarters: boolean;
  facilityType: 'Corporate Office' | 'Data Center' | 'Branch' | 'Cloud Region' | 'Remote Hub';
  headcount: number;
  inScope: boolean;
}

export interface OrganizationRegistrationData {
  legalName: string;
  tradingName: string;
  website: string;
  country: string;
  industry: string;
  employeeCount: number;
  annualRevenueRange: string;
  locations: OrganizationLocationNode[];
  businessUnits: string[];
  contacts: {
    primaryContact: { name: string; email: string; title: string; phone?: string };
    securityContact: { name: string; email: string; title: string };
    privacyContact: { name: string; email: string; title: string };
    complianceContact: { name: string; email: string; title: string };
    aiGovernanceContact?: { name: string; email: string; title: string };
    itContact: { name: string; email: string; title: string };
  };
}

export interface ScopeDefinitionState {
  version: string;
  statement: string;
  approved: boolean;
  approvedBy?: string;
  approvalDate?: string;
  effectiveDate: string;
  locations: string[];
  departments: string[];
  businessUnits: string[];
  businessProcesses: string[];
  applications: string[];
  cloudServices: string[];
  assets: string[];
  dataCategories: string[];
  thirdParties: string[];
  exclusions: Array<{
    id: string;
    processOrSystem: string;
    justification: string;
    approvedBy: string;
  }>;
  changeHistory: Array<{
    version: string;
    date: string;
    author: string;
    summary: string;
  }>;
}

export interface UnifiedControlMappingRecord {
  controlId: string;
  code: string;
  title: string;
  description: string;
  domain: string;
  frameworkMappings: Array<{
    frameworkId: string;
    frameworkName: string;
    requirementCode: string;
    requirementTitle: string;
    testCadence: string;
    overlapScore: number;
  }>;
  evidenceRequirements: string[];
  testProcedures: string[];
  linkedRisks: string[];
  implementationStatus: 'Implemented' | 'In Progress' | 'Not Started' | 'Exception';
  effectiveness: 'Effective' | 'Partially Effective' | 'Ineffective' | 'Untested';
  owner: string;
}

export interface RecommendedNextAction {
  id: string;
  stageKey: JourneyStageKey;
  whereYouAre: string;
  whatWeFound: string;
  whatNeedsAttention: string;
  whatToDoNext: string;
  ctaText: string;
  ctaTargetModule?: string;
  ctaStageKey?: JourneyStageKey;
  priority: 'critical' | 'high' | 'medium';
  badge: string;
}

export interface ClientJourneyState {
  tenantId: string;
  activeStageKey: JourneyStageKey;
  completedStages: JourneyStageKey[];
  selectedProgramIds: string[];
  organizationProfile: OrganizationRegistrationData;
  businessActivities: string[];
  criticalProcesses: string[];
  scope: ScopeDefinitionState;
  smartAssessmentResponses: Record<string, any>;
  assessmentCompleted: boolean;
  lastUpdated: string;
}
