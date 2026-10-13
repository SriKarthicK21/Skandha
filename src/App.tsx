import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GRCProvider, useGRC } from './context/GRCContext';
import { isModuleAllowed } from './utils/frameworkVisibility';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { SessionSecurityManager } from './components/security/SessionSecurityManager';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastProvider } from './components/common/ToastContainer';
import { CommandPalette } from './components/navigation/CommandPalette';
import { AICopilotWidget } from './components/ai/AICopilotWidget';
import { CommandCenterDashboard } from './components/dashboard/CommandCenterDashboard';
import { GrcNavigationService, GrcNavigationOptions } from './services/grc/grcNavigationService';

// Core & Onboarding Modules
import { GuidedImplementationEngine } from './components/journey/GuidedImplementationEngine';
import { SlideOverDrawer } from './components/common/SlideOverDrawer';
import { BusinessDiscovery } from './components/modules/BusinessDiscovery';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { EnterpriseOnboardingWizard } from './components/onboarding/EnterpriseOnboardingWizard';
import { RiskMapModule } from './components/modules/RiskMapModule';
import { RiskAssessmentModule } from './components/modules/RiskAssessmentModule';
import { RiskTreatmentSimulatorModule } from './components/modules/RiskTreatmentSimulatorModule';
import { EvidenceUploadModule } from './components/modules/EvidenceUploadModule';
import { EvidenceCentreModule } from './components/modules/EvidenceCentreModule';
import { PoliciesModule } from './components/modules/PoliciesModule';
import { FindingsCAPAModule } from './components/modules/FindingsCAPAModule';
import { InternalAuditModule } from './components/modules/InternalAuditModule';
import { AuditReportingModule } from './components/modules/AuditReportingModule';
import { ExternalAuditModule } from './components/modules/ExternalAuditModule';
import { SuperAdminPortfolio } from './components/modules/SuperAdminPortfolio';
import { AuditTrailModule } from './components/modules/AuditTrailModule';
import { ReadinessCertModule } from './components/modules/ReadinessCertModule';
import { ControlLibraryModule } from './components/modules/ControlLibraryModule';
import { AssetsModule } from './components/modules/AssetsModule';
import { VendorsModule } from './components/modules/VendorsModule';
import { DataInfoModule } from './components/modules/DataInfoModule';
import { TasksModule } from './components/modules/TasksModule';
import { SettingsUsersModule } from './components/modules/SettingsUsersModule';
import { StatementOfApplicabilityModule } from './components/modules/StatementOfApplicabilityModule';
import { ManagementReviewModule } from './components/modules/ManagementReviewModule';
import { GlobalAccreditationRegistryModule } from './components/modules/GlobalAccreditationRegistryModule';
import { ReportsAnalyticsModule } from './components/modules/ReportsAnalyticsModule';
import { EvidenceChecklistModule } from './components/modules/EvidenceChecklistModule';
import { ContinuousComplianceModule } from './components/modules/ContinuousComplianceModule';

// MAS TRM Regulatory Engine Modules
import { MASTRMOverviewModule } from './components/modules/MASTRMOverviewModule';
import { MASApplicabilitySurveyModule } from './components/modules/MASApplicabilitySurveyModule';
import { MASTRMAssessmentWorkbenchModule } from './components/modules/MASTRMAssessmentWorkbenchModule';
import { CrossFrameworkCrosswalkModule } from './components/modules/CrossFrameworkCrosswalkModule';
import { RegulatoryChangeSourceRegistryModule } from './components/modules/RegulatoryChangeSourceRegistryModule';
import { MASTRMDashboardModule } from './components/modules/MASTRMDashboardModule';
import { MASTRMComplianceFlowDashboard } from './components/mas/MASTRMComplianceFlowDashboard';
import { MASTRMImplementationJourney } from './components/mas/MASTRMImplementationJourney';
import { MASRegulatoryDiscoveryWizard } from './components/mas/MASRegulatoryDiscoveryWizard';
import { MASTRMReportingModule } from './components/modules/MASTRMReportingModule';
import { MASTRMComplianceChecklistModule } from './components/modules/MASTRMComplianceChecklistModule';
import { MASAutomatedPolicyGeneratorModule } from './components/mas/MASAutomatedPolicyGeneratorModule';
import { MASComplianceWorkflowModule } from './components/mas/workflow/MASComplianceWorkflowModule';
import { MASIncidentNotificationModule } from './components/modules/MASIncidentNotificationModule';
import { MASNotice644IncidentSimulator } from './components/mas/MASNotice644IncidentSimulator';
import { MASNotice655CyberHygieneDashboard } from './components/mas/MASNotice655CyberHygieneDashboard';
import { MASCriticalSystemsRegister } from './components/mas/MASCriticalSystemsRegister';
import { MASModuleInapplicableView } from './components/mas/MASModuleInapplicableView';
import { ComplianceGapVisualization } from './components/mas/ComplianceGapVisualization';
import { MASSupervisoryDossierModule } from './components/mas/MASSupervisoryDossierModule';
import { MASStatisticalAuditSamplingEngine } from './components/mas/MASStatisticalAuditSamplingEngine';
import { MASBoardRiskCommitteeDeck } from './components/mas/MASBoardRiskCommitteeDeck';
const FEATGenAIRiskSentinel = React.lazy(() => import('./components/mas/realtime/FEATGenAIRiskSentinel').then(m => ({ default: m.FEATGenAIRiskSentinel })));
const CrossRegulatoryHarmonizationEngine = React.lazy(() => import('./components/mas/realtime/CrossRegulatoryHarmonizationEngine').then(m => ({ default: m.CrossRegulatoryHarmonizationEngine })));
const PQCCryptoMigrationLedger = React.lazy(() => import('./components/mas/realtime/PQCCryptoMigrationLedger').then(m => ({ default: m.PQCCryptoMigrationLedger })));
const CyberCrisisWarRoomEngine = React.lazy(() => import('./components/mas/realtime/CyberCrisisWarRoomEngine').then(m => ({ default: m.CyberCrisisWarRoomEngine })));
const BoardRiskAppetiteDashboard = React.lazy(() => import('./components/mas/realtime/BoardRiskAppetiteDashboard').then(m => ({ default: m.BoardRiskAppetiteDashboard })));
const Auditor3LoDPortal = React.lazy(() => import('./components/mas/realtime/Auditor3LoDPortal').then(m => ({ default: m.Auditor3LoDPortal })));

// ISO 42001:2023 AIMS Modules
import { ISO42001DashboardModule } from './components/modules/ISO42001DashboardModule';
import { ISO42001WorkbenchModule } from './components/modules/ISO42001WorkbenchModule';
import { ISO42001ScopingModule } from './components/modules/ISO42001ScopingModule';
import { ISO42001ReportingModule } from './components/modules/ISO42001ReportingModule';
import { ISO42001SoAGenerator } from './components/iso42001/ISO42001SoAGenerator';

// ISO 27001:2022 ISMS Modules
import { ISO27001DashboardModule } from './components/modules/ISO27001DashboardModule';
import { ISO27001WorkbenchModule } from './components/modules/ISO27001WorkbenchModule';
import { ISO27001ClausesModule } from './components/modules/ISO27001ClausesModule';
import { ISOMASImprovementHubModule } from './components/compliance/ISOMASImprovementHubModule';
import { ISO27701SoAWorkbench } from './components/iso27701/ISO27701SoAWorkbench';

import {
  GapAssessmentModule,
  OrgScopeModule,
  DepartmentsModule,
  ProcessesModule,
  FrameworksModule,
  RequirementsModule,
  ImplementationModule
} from './components/modules/SupportingModules';

// Real-Time Live Modules
import { LiveSecurityScannerModule } from './components/modules/LiveSecurityScannerModule';
import { LiveIntegrationsHubModule } from './components/modules/LiveIntegrationsHubModule';
import { LiveTelemetryStreamModule } from './components/modules/LiveTelemetryStreamModule';
import { DepartmentAuditChecklistHub } from './components/audit/DepartmentAuditChecklistHub';
import { StandardsTrainingHubModule } from './components/modules/StandardsTrainingHubModule';
const DPDPActComplianceModule = React.lazy(() => import('./components/dpdp/DPDPActComplianceModule').then(m => ({ default: m.DPDPActComplianceModule })));
import { BrandGuardModule } from './components/brandguard/BrandGuardModule';
import { ComplianceHeatmap } from './components/compliance/ComplianceHeatmap';
import { LoginPage } from './components/auth/LoginPage';
import { RolePreviewBanner } from './components/layout/RolePreviewBanner';
import { AccessRestrictedView } from './components/common/AccessRestrictedView';
import { ExecutivePresentationModal } from './components/presentation/ExecutivePresentationModal';
import { UnifiedAuditBinderModal } from './components/compliance/UnifiedAuditBinderModal';

// Senior Lead Auditor & Chief ISO Implementer Suite
import { AuditorInspectionPortal } from './components/audit/AuditorInspectionPortal';
import { StageGatesReadinessVerifier } from './components/audit/StageGatesReadinessVerifier';
import { ISO19011SamplingCalculator } from './components/audit/ISO19011SamplingCalculator';
import { Clause42StakeholderObligations } from './components/governance/Clause42StakeholderObligations';
import { CISOExecutiveOnePager } from './components/executive/CISOExecutiveOnePager';
import { RemediationDeskModule } from './components/modules/RemediationDeskModule';
import { MeetingSchedulerModule } from './components/meetings/MeetingSchedulerModule';
import { EnterpriseRealTimeControlGraph } from './components/compliance/EnterpriseRealTimeControlGraph';
import { ComplianceMaturityScorecard } from './components/analytics/ComplianceMaturityScorecard';
import { PageContainer } from './components/layout/PageContainer';
import { ISOImplementationJourneyModule } from './components/iso/ISOImplementationJourneyModule';
import { DiscoveryQuestionnaireModule } from './components/iso/DiscoveryQuestionnaireModule';
import { DepartmentSurveysModule } from './components/iso/DepartmentSurveysModule';
import { CompanyComplianceProfileView } from './components/iso/CompanyComplianceProfileView';
import { ImplementationPlanModule } from './components/iso/ImplementationPlanModule';
import { SecurityExceptionsModule } from './components/modules/SecurityExceptionsModule';
import { WorkflowsModule } from './components/modules/WorkflowsModule';

// Skanda Consolidated Intelligent Workspaces
import { MyWorkWorkspace } from './components/workspaces/MyWorkWorkspace';
// Code-Split Enterprise Workspaces (React.lazy dynamic chunks)
const LiveMonitoringWorkspace = React.lazy(() => import('./components/live-monitoring/LiveMonitoringWorkspace').then(m => ({ default: m.LiveMonitoringWorkspace })));
const GovernanceWorkspace = React.lazy(() => import('./components/workspaces/GovernanceWorkspace').then(m => ({ default: m.GovernanceWorkspace })));
const ComplianceWorkspace = React.lazy(() => import('./components/workspaces/ComplianceWorkspace').then(m => ({ default: m.ComplianceWorkspace })));
const RiskWorkspace = React.lazy(() => import('./components/workspaces/RiskWorkspace').then(m => ({ default: m.RiskWorkspace })));
const ControlsEvidenceWorkspace = React.lazy(() => import('./components/workspaces/ControlsEvidenceWorkspace').then(m => ({ default: m.ControlsEvidenceWorkspace })));
const AuditAssuranceWorkspace = React.lazy(() => import('./components/workspaces/AuditAssuranceWorkspace').then(m => ({ default: m.AuditAssuranceWorkspace })));
const ThirdPartyAssetsWorkspace = React.lazy(() => import('./components/workspaces/ThirdPartyAssetsWorkspace').then(m => ({ default: m.ThirdPartyAssetsWorkspace })));
const SkandaIntelligenceWorkspace = React.lazy(() => import('./components/workspaces/SkandaIntelligenceWorkspace').then(m => ({ default: m.SkandaIntelligenceWorkspace })));
const ReportsIntelligenceWorkspace = React.lazy(() => import('./components/workspaces/ReportsIntelligenceWorkspace').then(m => ({ default: m.ReportsIntelligenceWorkspace })));
const PlatformSettingsWorkspace = React.lazy(() => import('./components/workspaces/PlatformSettingsWorkspace').then(m => ({ default: m.PlatformSettingsWorkspace })));

// Phase 12 Live Cloud Telemetry & Continuous Compliance Workspaces
const IntegrationsWorkspace = React.lazy(() => import('./components/integrations/IntegrationsWorkspace').then(m => ({ default: m.IntegrationsWorkspace })));
const TelemetryExplorerWorkspace = React.lazy(() => import('./components/telemetry/TelemetryExplorerWorkspace').then(m => ({ default: m.TelemetryExplorerWorkspace })));
const ControlDriftWorkspace = React.lazy(() => import('./components/telemetry/ControlDriftWorkspace').then(m => ({ default: m.ControlDriftWorkspace })));
const ContinuousEvidenceWorkspace = React.lazy(() => import('./components/telemetry/ContinuousEvidenceWorkspace').then(m => ({ default: m.ContinuousEvidenceWorkspace })));

// Big 4 Consultant Guidance & Journey Suite
import { ConsultantGuidanceBar } from './components/guidance/ConsultantGuidanceBar';
import { ConsultantJourneyNavigator } from './components/journey/ConsultantJourneyNavigator';
import { SmartEvidenceAnalyzerModal } from './components/evidence/SmartEvidenceAnalyzerModal';
import { SmartControlDetailModal } from './components/compliance/SmartControlDetailModal';
import { GlobalFooter } from './components/layout/GlobalFooter';
import { GlobalTaskActionBar } from './components/layout/GlobalTaskActionBar';
import { WelcomeGuideModal } from './components/dashboard/WelcomeGuideModal';

// SKANDA GRC Core Interconnected Capabilities Suite
import {
  MappingExplorer,
  SmartEvidenceHub,
  AuditorCleanRoom,
  ConfigurableRiskMatrix,
  NextBestActionCockpit,
  Entity360Drawer,
  GlobalCommandPalette,
  MyWorkWorkspace as CanonicalMyWorkWorkspace,
  ComplianceProgramCockpit,
  ControlTestingWorkspace,
  ExceptionManagementWorkspace,
  OrganizationalDiscoveryWorkspace,
  PolicyGovernanceWorkspace
} from './components/grc';
const EnterpriseSaaSHub = React.lazy(() => import('./components/saas/EnterpriseSaaSHub').then(m => ({ default: m.EnterpriseSaaSHub })));
const SecurityQuestionnaireWorkspace = React.lazy(() =>
  import('./components/questionnaire/SecurityQuestionnaireWorkspace').then(m => ({ default: m.SecurityQuestionnaireWorkspace }))
);
import {
  EnterpriseTenantAdminWorkspace,
  CustomerSuccessCommandCentre,
  PlatformOperationsCommandCentre,
  CustomerAccountPortal
} from './components/admin';
import { CustomerSupportWorkspace } from './components/support';
import { CustomerTrustCenterModal } from './components/trust/CustomerTrustCenterModal';

const MainAppLayout: React.FC = () => {
  const {
    activeModule,
    isAuthenticated,
    setActiveModule,
    canUserAccessModule,
    currentTenant,
    isSurveyComplete,
    currentRole,
    isMASModuleApplicable
  } = useGRC();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [aiCopilotOpen, setAiCopilotOpen] = useState(false);
  const [presentationModalOpen, setPresentationModalOpen] = useState(false);
  const [auditBinderModalOpen, setAuditBinderModalOpen] = useState(false);
  const [journeyModalOpen, setJourneyModalOpen] = useState(false);
  const [smartEvidenceModalOpen, setSmartEvidenceModalOpen] = useState(false);
  const [smartControlModalOpen, setSmartControlModalOpen] = useState(false);
  const [welcomeGuideOpen, setWelcomeGuideOpen] = useState(false);
  const [trustCenterOpen, setTrustCenterOpen] = useState(false);
  const [isInitialAuthResolving, setIsInitialAuthResolving] = useState(true);

  // SKANDA GRC Navigation & Context Preservation State
  const [navigationContext, setNavigationContext] = useState<GrcNavigationOptions | null>(() => {
    return GrcNavigationService.parseUrlNavigation();
  });

  // SKANDA 360° Relational Graph Drawer State
  const [entity360DrawerOpen, setEntity360DrawerOpen] = useState(false);
  const [entity360Id, setEntity360Id] = useState<string | null>(null);
  const [entity360Type, setEntity360Type] = useState<string | undefined>(undefined);

  const handleOpen360Drawer = (id: string, type?: string) => {
    setEntity360Id(id);
    setEntity360Type(type);
    setEntity360DrawerOpen(true);
  };

  // Allow a smooth resolution window on initial load for auth and permissions
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialAuthResolving(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Check completion state in GRCContext (Onboarding Survey completed)
  const isSurveyCompleted = Boolean(
    isSurveyComplete !== undefined
      ? isSurveyComplete
      : (currentTenant && (currentTenant.onboardingPhase >= 5 || currentTenant.mou?.executed))
  );

  // If the survey is incomplete, force navigation to the onboarding_survey module
  // Exception: Allow Super Admin to navigate to 'super_admin_portfolio' to maintain entities
  useEffect(() => {
    if (isAuthenticated && !isSurveyCompleted && activeModule !== 'onboarding_survey' && activeModule !== 'login') {
      if (currentRole === 'SUPER_ADMIN' && activeModule === 'super_admin_portfolio') {
        return;
      }
      setActiveModule('onboarding_survey');
    }
  }, [isAuthenticated, isSurveyCompleted, activeModule, setActiveModule, currentRole]);

  // Responsive sidebar width tracking (0px on mobile drawer, 72px collapsed, 280px expanded on desktop)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // The sidebar MUST be hidden while filling the onboarding survey form.
  // It only renders once the survey form is completed (MoU executed / Phase >= 5).
  // Super Admin can view it in the super admin console if needed.
  const showSidebar = (isSurveyCompleted || (currentRole === 'SUPER_ADMIN' && activeModule === 'super_admin_portfolio')) && activeModule !== 'onboarding_survey';
  const sidebarWidth = (!showSidebar || isMobile) ? '0px' : sidebarCollapsed ? '64px' : '240px';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--sidebar-width', sidebarWidth);
    }
  }, [sidebarWidth]);

  // Global Keyboard Shortcuts (Cmd+K, Ctrl+K) & Custom Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }

      // Global shortcut Alt + S to toggle sidebar collapse
      if (e.altKey && (e.key.toLowerCase() === 's' || e.code === 'KeyS')) {
        const target = e.target as HTMLElement | null;
        if (target) {
          const tagName = target.tagName;
          const isEditable = target.isContentEditable || tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
          if (isEditable) return;
        }
        e.preventDefault();
        if (showSidebar) {
          if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setMobileSidebarOpen(prev => !prev);
          } else {
            setSidebarCollapsed(prev => !prev);
          }
        }
      }
    };

    const handleOpenPresentation = () => {
      setPresentationModalOpen(true);
    };

    const handleGrcNavigation = (e: Event) => {
      const customEvt = e as CustomEvent<GrcNavigationOptions>;
      const navOpts = customEvt.detail;
      if (navOpts) {
        if (navOpts.entityId && (navOpts.open360 || !navOpts.module)) {
          handleOpen360Drawer(navOpts.entityId, navOpts.entityType);
        }
        if (navOpts.module) {
          if (!isSurveyCompleted && navOpts.module !== 'onboarding_survey' && navOpts.module !== 'login') {
            setActiveModule('onboarding_survey');
            return;
          }
          setNavigationContext(navOpts);
          setActiveModule(navOpts.module);
        }
      }
    };

    const handleOpen360Event = (e: Event) => {
      const customEvt = e as CustomEvent<{ id: string; type?: string }>;
      if (customEvt.detail?.id) {
        handleOpen360Drawer(customEvt.detail.id, customEvt.detail.type);
      }
    };

    const handlePopState = () => {
      const parsed = GrcNavigationService.parseUrlNavigation();
      if (parsed?.module) {
        setNavigationContext(parsed);
        setActiveModule(parsed.module);
      }
    };

    const handleNavigateModule = (e: Event) => {
      const customEvt = e as CustomEvent<{ moduleId?: string; tab?: string; framework?: string }>;
      if (customEvt.detail?.moduleId) {
        if (!isSurveyCompleted && customEvt.detail.moduleId !== 'onboarding_survey' && customEvt.detail.moduleId !== 'login') {
          setActiveModule('onboarding_survey');
          return;
        }
        setNavigationContext({
          module: customEvt.detail.moduleId,
          tab: customEvt.detail.tab,
          framework: customEvt.detail.framework
        });
        setActiveModule(customEvt.detail.moduleId);
      }
    };

    const handleOpenJourney = () => setJourneyModalOpen(true);
    const handleOpenEvidence = () => setSmartEvidenceModalOpen(true);
    const handleOpenControl = () => setSmartControlModalOpen(true);
    const handleOpenWelcomeGuide = () => setWelcomeGuideOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-skanda-presentation', handleOpenPresentation);
    window.addEventListener('skanda:navigate-module', handleNavigateModule);
    window.addEventListener('skanda:navigate-grc', handleGrcNavigation);
    window.addEventListener('skanda:open-360-drawer', handleOpen360Event);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('open-consultant-journey', handleOpenJourney);
    const handleOpenTrustCenter = () => setTrustCenterOpen(true);

    window.addEventListener('open-smart-evidence', handleOpenEvidence);
    window.addEventListener('open-smart-control', handleOpenControl);
    window.addEventListener('open-skanda-welcome-guide', handleOpenWelcomeGuide);
    window.addEventListener('open-skanda-trust-center', handleOpenTrustCenter);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-skanda-presentation', handleOpenPresentation);
      window.removeEventListener('skanda:navigate-module', handleNavigateModule);
      window.removeEventListener('skanda:navigate-grc', handleGrcNavigation);
      window.removeEventListener('skanda:open-360-drawer', handleOpen360Event);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('open-consultant-journey', handleOpenJourney);
      window.removeEventListener('open-smart-evidence', handleOpenEvidence);
      window.removeEventListener('open-smart-control', handleOpenControl);
      window.removeEventListener('open-skanda-welcome-guide', handleOpenWelcomeGuide);
      window.removeEventListener('open-skanda-trust-center', handleOpenTrustCenter);
    };
  }, [isSurveyCompleted, setActiveModule]);

  // If user is locked out or has requested the login screen
  if (!isAuthenticated || activeModule === 'login') {
    return (
      <LoginPage
        onLoginSuccess={() => {
          if (activeModule === 'login') {
            setActiveModule(isSurveyCompleted ? 'command_center' : 'onboarding_survey');
          }
        }}
      />
    );
  }

  const renderModule = () => {
    // If the survey is incomplete, force navigation to onboarding_survey
    // and strictly prevent the rendering of CommandCenterDashboard or any other modules
    if (!isSurveyCompleted) {
      if (currentRole === 'SUPER_ADMIN' && activeModule === 'super_admin_portfolio') {
        return <SuperAdminPortfolio />;
      }
      return <OnboardingWizard />;
    }

    // Framework module access check: If module belongs to an unselected framework, route back to command center
    const universalModules = [
      'login', 'home', 'command_center', 'dashboard', 'dashboards', 'executive_view', 'executive',
      'my_work', 'governance', 'compliance', 'risk', 'controls_evidence', 'audit', 'audit_assurance',
      'assets_third_parties', 'third_party_assets', 'reports_insights', 'reports_intelligence',
      'skanda_intelligence', 'threat_intelligence', 'settings',
      'business_discovery', 'org_scope', 'departments', 'processes', 'assets', 'data_information', 'data_info', 'vendors', 'vendor_risk',
      'evidence_upload', 'risk_map', 'frameworks', 'gap_assessment', 'risk_assessment', 'risk_register',
      'requirements', 'control_library', 'controls', 'implementation', 'meeting_scheduler', 'policies',
      'tasks', 'priority_actions', 'evidence_requirements', 'auditor_portal', 'audit_centre', 'audit_center',
      'audit_sampling_calculator', 'evidence_centre', 'internal_audit', 'external_audit', 'department_audit_checklists',
      'findings_capa', 'non_conformity', 'remediation_desk', 'remediation_capa', 'audit_reporting', 'readiness_cert', 'audit_readiness',
      'global_accreditation', 'accreditation_registry', 'soa_matrix', 'statement_of_applicability',
      'ciso_executive_summary', 'compliance_heatmap', 'compliance_maturity_scorecard',
      'reports_analytics', 'analytics', 'ai_insights', 'entity_lineage_graph', 'control_lineage_graph', 'live_scanner',
      'telemetry_stream', 'integrations', 'super_admin_portfolio', 'data_sources',
      'settings_users', 'standards_academy', 'onboarding_survey',
      'mas_supervisory_dossier', 'supervisory_dossier', 'mas_statistical_sampling', 'mas_audit_sampling',
      'mas_brc_reporting_deck', 'mas_brc_pack', 'board_risk_committee_deck',
      'feat_genai_sentinel', 'mas_feat_sentinel', 'shadow_ai_telemetry',
      'cross_regulatory_crosswalk', 'multi_framework_harmonizer', 'regulatory_harmonization', 'evidence_deduplication',
      'pqc_crypto_migration', 'post_quantum_crypto', 'quantum_readiness',
      'cyber_crisis_war_room', 'cyber_war_room', 'bcp_dr_simulator',
      'board_risk_appetite', 'risk_appetite_dashboard', 'brc_ras_dashboard',
      'auditor_3lod_portal', 'immutable_evidence_manifest', 'mas_immutable_manifest',
      'mas_trm', 'mas_trm_reporting', 'global_regulatory_news', 'regulatory_change',
      'incident_mgr', 'iso27001_controls', 'mas_gap_analysis',
      'exceptions', 'security_exceptions', 'risk_waivers', 'workflows', 'workflow_engine', 'approvals_queue',
      'policy_governance', 'document_governance', 'document_register', 'approval_queue', 'acknowledgement_hub', 'implementation_plans', 'review_calendar', 'auditor_governance_pack',
      'saas_hub', 'saas_subscription', 'subscription', 'billing', 'billing_invoices', 'sso_scim', 'api_keys', 'branding', 'data_residency',
      'security_questionnaire', 'security_questionnaires', 'questionnaire_intelligence', 'customer_assurance',
      'live_monitoring', 'monitoring_drift', 'continuous_monitoring'
    ];
    if (!universalModules.includes(activeModule) && !isModuleAllowed(activeModule, currentTenant?.selectedFrameworks, currentTenant?.selectedFrameworkRequirements)) {
      return <CommandCenterDashboard />;
    }

    // RBAC module access check: If current role (or simulated preview role) does not have access,
    // display the AccessRestrictedView (except for navigation hub modules: settings_users, command_center, dashboards, compliance_heatmap)
    const alwaysPermitted = [
      'settings_users', 'command_center', 'dashboard', 'dashboards', 'executive_view', 'executive', 'login',
      'compliance_heatmap', 'compliance_matrix', 'risk_heatmap', 'compliance_maturity_scorecard', 'maturity_scorecard',
      'home', 'my_work', 'governance', 'compliance', 'risk', 'controls_evidence', 'audit', 'audit_assurance',
      'assets_third_parties', 'third_party_assets', 'reports_insights', 'reports_intelligence',
      'skanda_intelligence', 'threat_intelligence', 'settings',
      // Questionnaire visibility is intentionally broad: read access is safe, while
      // approval, export and disclosure remain server-enforced permissions.
      'security_questionnaire', 'security_questionnaires', 'questionnaire_intelligence', 'customer_assurance',
      // Live monitoring is visible to every role for read access; ingestion,
      // retest and closure remain server-enforced permissions.
      'live_monitoring', 'monitoring_drift', 'continuous_monitoring'
    ];
    if (!alwaysPermitted.includes(activeModule) && !canUserAccessModule(activeModule)) {
      return (
        <AccessRestrictedView
          moduleId={activeModule}
          onGoBack={() => setActiveModule('command_center')}
        />
      );
    }

    // MAS Regulatory Profile & Applicability Rules Gating:
    // Only MAS-relevant components are registered in the active routing table.
    // If a module is subject to MAS applicability rules and is not applicable for this profile,
    // render the MASModuleInapplicableView.
    if (!isMASModuleApplicable(activeModule)) {
      return (
        <MASModuleInapplicableView
          moduleId={activeModule}
          onGoBack={() => setActiveModule('mas_compliance_flow')}
        />
      );
    }

    switch (activeModule) {
      case 'login':
        return <LoginPage onLoginSuccess={() => setActiveModule('command_center')} />;

      // 1. HOME / COMMAND CENTER
      case 'home':
      case 'command_center':
      case 'dashboard':
      case 'dashboards':
        return <CommandCenterDashboard />;
      case 'executive_view':
        return <CommandCenterDashboard initialViewMode="executive" />;

      // 2. MY WORK (Personal Operational Hub)
      case 'my_work':
      case 'my_tasks':
      case 'tasks':
      case 'priority_actions':
      case 'action_items':
      case 'remediation_queue':
      case 'capa_queue':
      case 'my_evidence':
      case 'evidence_due':
      case 'my_policies':
      case 'acknowledgments':
      case 'my_work_queue':
      case 'operational_queue':
        return <CanonicalMyWorkWorkspace />;

      // 3. GOVERNANCE
      case 'governance':
      case 'org_scope':
      case 'scope':
      case 'departments':
      case 'processes':
      case 'stakeholder_obligations':
      case 'clause4_2_obligations':
      case 'policies':
      case 'document_repository':
      case 'policy_generator':
      case 'mas_policy_generator':
      case 'automated_policy_generator':
      case 'management_review':
      case 'discovery':
      case 'business_discovery':
        return <GovernanceWorkspace initialTab={navigationContext?.tab || activeModule} />;

      // 4. COMPLIANCE & FRAMEWORKS
      case 'compliance':
      case 'compliance_heatmap':
      case 'compliance_matrix':
      case 'heatmap':
      case 'frameworks':
      case 'framework_factory':
      case 'framework_marketplace':
      case 'framework_command_center':
      case 'framework_registry':
      case 'framework_graph':
      case 'framework_compare':
      case 'framework_migration':
      case 'framework_ingestion':
      case 'iso27001':
      case 'iso27001_dashboard':
      case 'iso27001_workbench':
      case 'iso27001_clauses':
      case 'iso27001_controls':
      case 'statement_of_applicability':
      case 'soa':
      case 'soa_matrix':
      case 'implementation_journey':
      case 'discovery_questionnaire':
      case 'department_surveys':
      case 'compliance_profile':
      case 'implementation_plan':
      case 'iso_mas_improvements':
      case 'continuous_compliance':
      case 'mas_trm':
      case 'mas_compliance_flow':
      case 'mas_flow_dashboard':
      case 'mas_trm_journey':
      case 'mas_implementation_journey':
      case 'mas_discovery_scoping':
      case 'mas_dashboard':
      case 'mas_classic_dashboard':
      case 'mas_overview':
      case 'mas_applicability':
      case 'mas_assessment_workbench':
      case 'mas_checklist':
      case 'mas_compliance_checklist':
      case 'mas_notice644_simulator':
      case 'mas_notice655_hygiene':
      case 'mas_incident_notification':
      case 'mas_compliance_workflow':
      case 'compliance_gap_visualization':
      case 'feat_genai_sentinel':
      case 'pqc_crypto_migration':
      case 'mas_reporting':
      case 'mas_supervisory_dossier':
      case 'iso42001':
      case 'iso42001_dashboard':
      case 'iso42001_workbench':
      case 'iso42001_scoping':
      case 'iso42001_reporting':
      case 'iso42001_soa':
      case 'iso42001_soa_generator':
      case 'dpdp':
      case 'dpdp_compliance':
      case 'dpdp_act':
      case 'dpdp_checklist':
      case 'dpdp_data_flow':
      case 'dpdp_consent_grievance':
      case 'dpdp_breach_playbook':
      case 'dpdp_training_gap':
      case 'dpdp_academy':
      case 'dpdp_retention':
      case 'dpdp_children':
      case 'dpdp_erasure':
      case 'dpdp_processors':
      case 'dpdp_cross_border':
      case 'dpdp_dpia':
      case 'iso27701_soa':
      case 'iso27701_soa_workbench':
      case 'iso27701_pims':
      case 'gap_assessment':
      case 'crosswalk':
      case 'cross_framework_crosswalk':
      case 'cross_regulatory_crosswalk':
      case 'regulatory_sources':
      case 'global_regulatory_news':
        return <ComplianceWorkspace initialTab={navigationContext?.tab || activeModule} initialFramework={navigationContext?.framework} />;

      // 4.1 SKANDA CANONICAL GRC OPERATING SYSTEM SUITE
      case 'compliance_programs':
      case 'programs':
      case 'program_cockpit':
      case 'compliance_program_cockpit':
        return <ComplianceProgramCockpit />;

      case 'control_testing':
      case 'control_tests':
      case 'testing_workspace':
      case 'operating_effectiveness':
        return <ControlTestingWorkspace />;

      case 'exceptions':
      case 'security_exceptions':
      case 'exception_management':
      case 'deviations':
        return <ExceptionManagementWorkspace />;

      case 'mapping_explorer':
      case 'crosswalk_explorer':
      case 'harmonization_matrix':
        return <MappingExplorer onOpen360Drawer={handleOpen360Drawer} />;

      case 'smart_evidence':
      case 'smart_evidence_hub':
        return <SmartEvidenceHub onOpen360Drawer={handleOpen360Drawer} />;

      case 'auditor_clean_room':
        return <AuditorCleanRoom onOpen360Drawer={handleOpen360Drawer} />;

      case 'configurable_risk_matrix':
      case 'risk_matrix_5x5':
        return <ConfigurableRiskMatrix onOpen360Drawer={handleOpen360Drawer} />;

      case 'next_best_action':
      case 'ciso_next_best_action':
      case 'action_queue':
        return (
          <NextBestActionCockpit 
            onOpen360Drawer={handleOpen360Drawer}
            onActionTrigger={(act) => {
              if (act.actionType === 'REVIEW' || act.actionType === 'UPLOAD') {
                setActiveModule('smart_evidence' as any);
              } else if (act.actionType === 'TEST') {
                setActiveModule('auditor_clean_room' as any);
              } else {
                handleOpen360Drawer(act.sourceEntity.id, act.sourceEntity.type);
              }
            }}
          />
        );

      // 4.2 PHASE 13.1 ORGANIZATIONAL DISCOVERY & PROCESS BLUEPRINT STUDIO
      case 'organizational_discovery':
      case 'discovery_workshop':
      case 'process_blueprint':
      case 'documentation_studio':
      case 'interview_workspace':
      case 'discovery_workplan':
        return (
          <OrganizationalDiscoveryWorkspace
            initialTab={
              navigationContext?.tab ||
              (activeModule === 'process_blueprint'
                ? 'process_blueprint'
                : activeModule === 'documentation_studio'
                ? 'doc_studio'
                : activeModule === 'interview_workspace'
                ? 'interview_session'
                : 'overview')
            }
          />
        );

      // 4.3 PHASE 14 POLICY & DOCUMENT GOVERNANCE + CONTROL IMPLEMENTATION
      case 'policy_governance':
      case 'document_governance':
      case 'document_register':
      case 'approval_queue':
      case 'acknowledgement_hub':
      case 'implementation_plans':
      case 'review_calendar':
      case 'auditor_governance_pack':
        return (
          <PolicyGovernanceWorkspace
            initialTab={
              navigationContext?.tab ||
              (activeModule === 'document_register'
                ? 'documents'
                : activeModule === 'approval_queue'
                ? 'review_queue'
                : activeModule === 'acknowledgement_hub'
                ? 'acknowledgement'
                : activeModule === 'implementation_plans'
                ? 'implementation'
                : activeModule === 'review_calendar'
                ? 'review_calendar'
                : activeModule === 'auditor_governance_pack'
                ? 'auditor_pack'
                : 'overview')
            }
          />
        );

      // 4.4 HIGH-END SAAS SUBSCRIPTION & PLATFORM HUB
      case 'saas_hub':
      case 'saas_subscription':
      case 'subscription':
      case 'billing':
      case 'billing_invoices':
      case 'sso_scim':
      case 'api_keys':
      case 'branding':
      case 'data_residency':
        return (
          <EnterpriseSaaSHub
            initialTab={
              navigationContext?.tab ||
              (activeModule === 'billing' || activeModule === 'billing_invoices'
                ? 'billing'
                : activeModule === 'sso_scim'
                ? 'sso_scim'
                : activeModule === 'api_keys'
                ? 'api_keys'
                : activeModule === 'branding'
                ? 'branding'
                : activeModule === 'data_residency'
                ? 'data_residency'
                : activeModule === 'subscription'
                ? 'plans'
                : 'overview')
            }
          />
        );

      // 4.5 PHASE 16 ENTERPRISE TENANT ADMINISTRATION & CUSTOMER SUCCESS
      case 'tenant_admin':
      case 'tenant_administration':
      case 'customer_admin':
      case 'teams_management':
      case 'user_management':
      case 'tenant_offboarding':
        return (
          <EnterpriseTenantAdminWorkspace
            initialTab={
              navigationContext?.tab ||
              (activeModule === 'teams_management'
                ? 'teams'
                : activeModule === 'user_management'
                ? 'users'
                : activeModule === 'tenant_offboarding'
                ? 'offboarding'
                : 'overview')
            }
          />
        );

      case 'customer_success':
      case 'customer_success_command_centre':
      case 'cs_command_centre':
      case 'tenant_portfolio':
      case 'super_admin_tenants':
        return <CustomerSuccessCommandCentre />;

      // 4.6 PHASE 17 PLATFORM REVENUE OPERATIONS & CUSTOMER ACCOUNT PORTAL
      case 'platform_operations':
      case 'platform_governance':
      case 'revenue_operations':
      case 'revops':
        return <PlatformOperationsCommandCentre />;

      case 'customer_account':
      case 'account_portal':
      case 'contracts':
      case 'contract_governance':
        return (
          <CustomerAccountPortal
            initialTab={
              navigationContext?.tab ||
              (activeModule === 'contracts' || activeModule === 'contract_governance'
                ? 'contract'
                : 'overview')
            }
          />
        );

      // 4.7 PHASE 18 ENTERPRISE SERVICE MANAGEMENT & CUSTOMER SUPPORT
      case 'service_management':
      case 'support':
      case 'support_centre':
      case 'customer_support':
      case 'my_cases':
      case 'team_queue':
      case 'incidents':
      case 'incident_command':
      case 'sla_monitor':
      case 'escalations':
      case 'knowledge_base':
      case 'service_catalog':
      case 'service_health':
      case 'problem_management':
      case 'ai_support_copilot':
        return (
          <CustomerSupportWorkspace
            initialTab={
              (navigationContext?.tab as any) ||
              (activeModule === 'my_cases'
                ? 'my_cases'
                : activeModule === 'incidents' || activeModule === 'incident_command'
                ? 'incidents'
                : activeModule === 'sla_monitor'
                ? 'sla_monitor'
                : activeModule === 'knowledge_base'
                ? 'knowledge'
                : activeModule === 'service_catalog'
                ? 'catalog'
                : activeModule === 'service_health'
                ? 'health'
                : activeModule === 'problem_management'
                ? 'problems'
                : activeModule === 'ai_support_copilot'
                ? 'copilot'
                : 'queue')
            }
          />
        );

      // 5. RISK
      case 'risk':
      case 'risk_assessment':
      case 'risk_register':
      case 'risk_map':
      case 'risk_treatment':
      case 'risk_treatment_simulator':
      case 'risk_simulator':
      case 'risk_waivers':
      case 'board_risk_appetite':
      case 'risk_appetite_dashboard':
      case 'brc_ras_dashboard':
        return <RiskWorkspace initialTab={navigationContext?.tab || activeModule} />;

      // 6. CONTROLS & EVIDENCE
      case 'controls_evidence':
      case 'control_library':
      case 'controls':
      case 'evidence':
      case 'evidence_centre':
      case 'evidence_upload':
      case 'evidence_requirements':
      case 'evidence_checklist':
      case 'entity_lineage_graph':
      case 'control_lineage_graph':
      case 'control_traceability':
      case 'entity_graph':
      case 'lineage_graph':
        return <ControlsEvidenceWorkspace initialTab={navigationContext?.tab || activeModule} />;

      // 7. AUDIT & ASSURANCE
      case 'audit':
      case 'audit_assurance':
      case 'internal_audit':
      case 'external_audit':
      case 'auditor_portal':
      case 'auditor_inspection':
      case 'audit_centre':
      case 'audit_center':
      case 'findings':
      case 'findings_capa':
      case 'non_conformity':
      case 'capa':
      case 'remediation':
      case 'remediation_desk':
      case 'remediation_capa':
      case 'continuous_remediation':
      case 'stage_gates':
      case 'stage_gate_verifier':
      case 'sampling':
      case 'audit_sampling_calculator':
      case 'iso19011_sampling':
      case 'dept_checklists':
      case 'department_audit_checklists':
      case 'departmental_audit_checklists':
      case 'auditor_3lod':
      case 'auditor_3lod_portal':
      case 'immutable_evidence_manifest':
      case 'mas_immutable_manifest':
      case 'reporting':
      case 'audit_reporting':
      case 'readiness_cert':
      case 'audit_readiness':
        return <AuditAssuranceWorkspace initialTab={navigationContext?.tab || activeModule} />;

      // 8. ASSETS & THIRD PARTIES
      case 'assets_third_parties':
      case 'third_party_assets':
      case 'vendors':
      case 'vendor_risk':
      case 'assets':
      case 'mas_critical_systems':
      case 'cis_downtime_ledger':
      case 'data_information':
      case 'data_info':
      case 'data_privacy':
        return <ThirdPartyAssetsWorkspace initialTab={navigationContext?.tab || activeModule} />;

      // 9. REPORTS & INSIGHTS
      case 'reports_insights':
      case 'reports_intelligence':
      case 'ciso_summary':
      case 'ciso_executive_summary':
      case 'ciso_one_pager':
      case 'board_deck':
      case 'board_risk_committee_deck':
      case 'mas_brc_reporting_deck':
      case 'brc_deck':
      case 'risk_heatmap':
      case 'compliance_maturity_scorecard':
      case 'maturity_scorecard':
      case 'reports_analytics':
      case 'analytics':
      case 'standards_academy':
      case 'standards_training':
      case 'standards_hub':
      case 'telemetry_stream':
      case 'webhooks':
        return <ReportsIntelligenceWorkspace initialTab={navigationContext?.tab || activeModule} />;

      // 10. SKANDA INTELLIGENCE
      case 'skanda_intelligence':
      case 'threat_intelligence':
      case 'ai_advisor':
      case 'ai_copilot':
      case 'ai_insights':
      case 'brandguard':
      case 'brandguard_dashboard':
      case 'brand_protection':
      case 'attack_surface':
      case 'easm':
      case 'easm_takeover':
      case 'threat_intel':
      case 'zero_hour_ioc':
      case 'dark_web':
      case 'dark_web_monitoring':
      case 'credential_leaks':
      case 'logo_monitoring':
      case 'brand_abuse':
      case 'takedowns':
      case 'takedown_sla':
      case 'live_scanner':
      case 'security_scanner':
      case 'cyber_crisis_war_room':
      case 'cyber_war_room':
      case 'bcp_dr_simulator':
        return <SkandaIntelligenceWorkspace initialTab={navigationContext?.tab || activeModule} />;

      // PHASE 12: CONTINUOUS TELEMETRY, INTEGRATIONS & DRIFT WORKSPACES
      case 'integrations':
      case 'administration_integrations':
      case 'live_integrations':
        return <IntegrationsWorkspace />;

      case 'telemetry':
      case 'telemetry_explorer':
      case 'intelligence_telemetry':
        return <TelemetryExplorerWorkspace />;

      case 'control_drift':
      case 'drift':
      case 'controls_drift':
        return <ControlDriftWorkspace />;

      case 'continuous_evidence':
      case 'evidence_harvesting':
        return <ContinuousEvidenceWorkspace />;

      // PLATFORM SETTINGS & ENTERPRISE ADMIN
      case 'settings':
      case 'settings_users':
      case 'data_sources':
      case 'workflows':
      case 'workflow_engine':
      case 'approvals_queue':
      case 'audit_trail':
      case 'super_admin':
      case 'super_admin_portfolio':
        return <PlatformSettingsWorkspace initialTab={navigationContext?.tab || activeModule} />;

      // MODE 1: GUIDED IMPLEMENTATION JOURNEY & NEW CLIENT ONBOARDING
      case 'guided_journey':
      case 'guided_implementation':
      case 'onboarding_survey':
        return <GuidedImplementationEngine />;
      case 'onboarding_wizard':
      case 'onboarding':
      case 'enterprise_onboarding':
      case 'business_discovery_wizard':
        return <EnterpriseOnboardingWizard />;
      case 'accreditation_registry':
      case 'global_accreditation':
        return <GlobalAccreditationRegistryModule />;
      case 'meeting_scheduler':
      case 'interview_scheduler':
      case 'scheduler':
      case 'meetings':
        return <MeetingSchedulerModule />;
      case 'requirements':
        return <RequirementsModule />;
      case 'implementation':
        return <ImplementationModule />;
      case 'security_questionnaire':
      case 'security_questionnaires':
      case 'questionnaire_intelligence':
      case 'customer_assurance':
        return <SecurityQuestionnaireWorkspace />;
      case 'live_monitoring':
      case 'monitoring_drift':
      case 'continuous_monitoring':
        return <LiveMonitoringWorkspace />;

      default:
        return <CommandCenterDashboard />;
    }
  };

  return (
    <div
      id="skanda-page-wrapper"
      style={{ '--sidebar-width': sidebarWidth } as React.CSSProperties}
      className="page-wrapper flex flex-col h-screen h-[100dvh] w-full max-w-full overflow-hidden overflow-x-hidden font-sans transition-colors duration-200 bg-[var(--skanda-bg-primary)] text-[var(--skanda-text-primary)]"
    >
      {/* ISO 27001 A.8.5 Inactivity Session Security Manager */}
      <SessionSecurityManager />

      {/* Universal Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Role Preview Impersonation Sticky Banner */}
      <RolePreviewBanner />

      {/* 1. Global Multi-Tenant Header (At top of screen across full width) */}
      <Header
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onToggleSidebar={showSidebar ? () => {
          if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setMobileSidebarOpen(prev => !prev);
          } else {
            setSidebarCollapsed(prev => !prev);
          }
        } : undefined}
        onOpenAiCopilot={() => setAiCopilotOpen(true)}
        onOpenPresentation={() => setPresentationModalOpen(true)}
      />

      {/* 2. Middle Region: Sidebar + Main Content Workspace */}
      <div className="flex flex-1 min-h-0 min-w-0 w-full overflow-hidden">
        {/* Global Collapsible Sidebar Navigation - Hidden until onboarding survey is completed */}
        {showSidebar && (
          <Sidebar
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            isMobileOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
            isLoading={isInitialAuthResolving || !isAuthenticated || !currentTenant}
          />
        )}

        {/* Main Workspace Column */}
        <div
          id="main-app-content-container"
          className="flex-1 flex flex-col min-w-0 min-h-0 w-full max-w-full h-full overflow-hidden transition-all duration-300 box-border bg-transparent"
        >
          {/* Big 4 Consultant Guidance Bar (You Are Here, Completed, Next Step, Why This Matters, Output) */}
          {isAuthenticated && activeModule !== 'login' && activeModule !== 'onboarding_survey' && (
            <ConsultantGuidanceBar
              onOpenJourneyModal={() => setJourneyModalOpen(true)}
              onOpenAiCopilot={(prompt) => {
                setAiCopilotOpen(true);
              }}
            />
          )}

          {/* Dynamic Module Content Viewport */}
          <main
            id="main-module-viewport"
            className="flex-1 min-w-0 max-w-full overflow-y-auto overflow-x-hidden p-2.5 sm:p-3.5 lg:p-4 xl:p-5 scrollbar-thin transition-colors duration-200 bg-transparent scrollbar-thumb-[var(--skanda-border)]"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-full min-h-full min-w-0 overflow-x-hidden"
              >
                <React.Suspense
                  fallback={
                    <div className="flex flex-col items-center justify-center p-16 text-slate-400">
                      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
                      <span className="text-xs font-mono font-medium tracking-wide">Loading Enterprise Workspace...</span>
                    </div>
                  }
                >
                  {renderModule()}
                </React.Suspense>
              </motion.div>
            </AnimatePresence>
          </main>

          {/* 3. Global Task / Action Bar (Docked neatly above footer) */}
          {isAuthenticated && activeModule !== 'login' && activeModule !== 'onboarding_survey' && (
            <GlobalTaskActionBar
              onNavigateModule={(mod) => setActiveModule(mod as any)}
            />
          )}

          {/* 4. Global Enterprise Footer */}
          <GlobalFooter
            onOpenHelp={() => setWelcomeGuideOpen(true)}
          />
        </div>
      </div>

      {/* Floating GRC AI Copilot Widget */}
      <AICopilotWidget
        isOpenDefault={aiCopilotOpen}
      />

      {/* Universal 360° Slide-Over Entity Drawer (No Navigation Ping-Pong) */}
      <SlideOverDrawer />

      {/* Master Executive Presentation & Client Pitch Deck Modal */}
      <ExecutivePresentationModal
        isOpen={presentationModalOpen}
        onClose={() => setPresentationModalOpen(false)}
      />

      {/* One-Click Auditor Pack & Dossier Generator Modal */}
      <UnifiedAuditBinderModal
        isOpen={auditBinderModalOpen}
        onClose={() => setAuditBinderModalOpen(false)}
      />

      {/* Welcome Guide & Platform Tour Modal */}
      <WelcomeGuideModal
        isOpen={welcomeGuideOpen}
        onClose={() => setWelcomeGuideOpen(false)}
        onNavigateModule={(mod) => {
          setActiveModule(mod as any);
          setWelcomeGuideOpen(false);
        }}
      />

      {/* 11-Stage Implementation Journey Navigator Modal */}
      {journeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-6xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative my-8">
            <button
              type="button"
              onClick={() => setJourneyModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              ✕
            </button>
            <ConsultantJourneyNavigator
              onClose={() => setJourneyModalOpen(false)}
              onNavigateModule={(mod) => {
                setActiveModule(mod as any);
                setJourneyModalOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Smart Evidence Verification & OCR Analysis Modal */}
      <SmartEvidenceAnalyzerModal
        isOpen={smartEvidenceModalOpen}
        onClose={() => setSmartEvidenceModalOpen(false)}
        targetControlCode="A.5.15"
        targetControlTitle="Access Control & User Access Review"
      />

      {/* Smart Control Experience Modal */}
      <SmartControlDetailModal
        isOpen={smartControlModalOpen}
        onClose={() => setSmartControlModalOpen(false)}
        onOpenUploadEvidence={() => {
          setSmartControlModalOpen(false);
          setSmartEvidenceModalOpen(true);
        }}
        onOpenAiCopilot={(prompt) => {
          setSmartControlModalOpen(false);
          setAiCopilotOpen(true);
        }}
      />

      {/* Universal 360° Entity Relational Graph Drawer */}
      <Entity360Drawer
        isOpen={entity360DrawerOpen}
        onClose={() => setEntity360DrawerOpen(false)}
        entityId={entity360Id}
        entityType={entity360Type}
        onSelectConnectedEntity={(id, type) => {
          setEntity360Id(id);
          setEntity360Type(type);
        }}
      />

      {/* SKANDA Global Command Palette (Cmd + K) */}
      <GlobalCommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectEntity={(id, type) => {
          handleOpen360Drawer(id, type);
        }}
      />

      {/* SKANDA Customer Trust Center Modal */}
      <CustomerTrustCenterModal
        isOpen={trustCenterOpen}
        onClose={() => setTrustCenterOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <GRCProvider>
        <ToastProvider>
          <MainAppLayout />
        </ToastProvider>
      </GRCProvider>
    </ErrorBoundary>
  );
}
