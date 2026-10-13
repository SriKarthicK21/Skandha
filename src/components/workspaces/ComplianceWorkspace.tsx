import React, { useState, useEffect } from 'react';
import { useGRC } from '../../context/GRCContext';
import { WorkspaceLayout, WorkspaceTab, WorkspaceStat } from './WorkspaceLayout';
import {
  ShieldCheck,
  Layers,
  SlidersHorizontal,
  ArrowRightLeft,
  Bell,
  Sparkles,
  Milestone,
  CheckSquare,
  FileCheck2,
  AlertOctagon,
  Brain,
  Lock,
  Scale,
  Grid,
  Filter,
  RotateCcw,
  Building,
  ShieldAlert,
  Zap,
  Network
} from 'lucide-react';

import { CoreComplianceAutomationWorkspace } from '../compliance/CoreComplianceAutomationWorkspace';
import { IntegrationFabricMarketplaceWorkspace } from '../compliance/IntegrationFabricMarketplaceWorkspace';

// Compliance Heatmap Visualization
import { ComplianceHeatmap } from '../compliance/ComplianceHeatmap';
import { D3ComplianceHeatmap } from '../compliance/D3ComplianceHeatmap';
import { HEATMAP_DEPARTMENTS } from '../../services/complianceHeatmapService';

// Frameworks & Generic
import { FrameworkFactoryWorkspace } from '../framework-factory/FrameworkFactoryWorkspace';
import { FrameworksModule, GapAssessmentModule } from '../modules/SupportingModules';
import { CrossFrameworkCrosswalkModule } from '../modules/CrossFrameworkCrosswalkModule';
import { CrossRegulatoryHarmonizationEngine } from '../mas/realtime/CrossRegulatoryHarmonizationEngine';
import { RegulatoryChangeSourceRegistryModule } from '../modules/RegulatoryChangeSourceRegistryModule';
import { ComplianceGapVisualization } from '../mas/ComplianceGapVisualization';

// ISO 27001
import { ISO27001DashboardModule } from '../modules/ISO27001DashboardModule';
import { ISO27001WorkbenchModule } from '../modules/ISO27001WorkbenchModule';
import { ISO27001ClausesModule } from '../modules/ISO27001ClausesModule';
import { StatementOfApplicabilityModule } from '../modules/StatementOfApplicabilityModule';
import { ISOImplementationJourneyModule } from '../iso/ISOImplementationJourneyModule';
import { DiscoveryQuestionnaireModule } from '../iso/DiscoveryQuestionnaireModule';
import { DepartmentSurveysModule } from '../iso/DepartmentSurveysModule';
import { CompanyComplianceProfileView } from '../iso/CompanyComplianceProfileView';
import { ImplementationPlanModule } from '../iso/ImplementationPlanModule';
import { ISOMASImprovementHubModule } from '../compliance/ISOMASImprovementHubModule';

// MAS TRM
import { MASTRMComplianceFlowDashboard } from '../mas/MASTRMComplianceFlowDashboard';
import { MASTRMImplementationJourney } from '../mas/MASTRMImplementationJourney';
import { MASRegulatoryDiscoveryWizard } from '../mas/MASRegulatoryDiscoveryWizard';
import { MASTRMOverviewModule } from '../modules/MASTRMOverviewModule';
import { MASApplicabilitySurveyModule } from '../modules/MASApplicabilitySurveyModule';
import { MASTRMAssessmentWorkbenchModule } from '../modules/MASTRMAssessmentWorkbenchModule';
import { MASTRMComplianceChecklistModule } from '../modules/MASTRMComplianceChecklistModule';
import { MASLiveRegulatoryIntelligenceWorkspace } from '../mas/regulatory/MASLiveRegulatoryIntelligenceWorkspace';
import { MASNotice644IncidentSimulator } from '../mas/MASNotice644IncidentSimulator';
import { MASNotice655CyberHygieneDashboard } from '../mas/MASNotice655CyberHygieneDashboard';
import { MASCriticalSystemsRegister } from '../mas/MASCriticalSystemsRegister';
import { MASIncidentNotificationModule } from '../modules/MASIncidentNotificationModule';
import { MASComplianceWorkflowModule } from '../mas/workflow/MASComplianceWorkflowModule';
import { FEATGenAIRiskSentinel } from '../mas/realtime/FEATGenAIRiskSentinel';
import { PQCCryptoMigrationLedger } from '../mas/realtime/PQCCryptoMigrationLedger';

// ISO 42001
import { ISO42001DashboardModule } from '../modules/ISO42001DashboardModule';
import { ISO42001WorkbenchModule } from '../modules/ISO42001WorkbenchModule';
import { ISO42001ScopingModule } from '../modules/ISO42001ScopingModule';
import { ISO42001SoAGenerator } from '../iso42001/ISO42001SoAGenerator';

// DPDP & ISO 27701
import { DPDPActComplianceModule } from '../dpdp/DPDPActComplianceModule';
import { ISO27701SoAWorkbench } from '../iso27701/ISO27701SoAWorkbench';

interface ComplianceWorkspaceProps {
  initialTab?: string;
  initialFramework?: string;
  initialDepartment?: string;
}

export const ComplianceWorkspace: React.FC<ComplianceWorkspaceProps> = ({
  initialTab,
  initialFramework,
  initialDepartment
}) => {
  const { currentTenant, setActiveModule } = useGRC();
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (initialTab && ['heatmap', 'compliance_heatmap', 'compliance'].includes(initialTab)) {
      return 'heatmap';
    }
    return initialTab || 'heatmap';
  });
  const [activeFramework, setActiveFramework] = useState<string>(initialFramework || 'iso27001');
  const [selectedFramework, setSelectedFramework] = useState<string>(initialFramework || 'all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>(initialDepartment || 'ALL');

  // Sub-tabs for ISO 27001
  const [isoSubView, setIsoSubView] = useState<string>('workbench');
  // Sub-tabs for MAS TRM
  const [masSubView, setMasSubView] = useState<string>('flow');
  // Heatmap Engine Mode (D3 Interactive Matrix vs Multi-Framework Tri-Matrix)
  const [heatmapEngineMode, setHeatmapEngineMode] = useState<'d3' | 'multi_framework'>('d3');
  // Controls Filter Mode (All Controls vs High Risk vs Requires Urgent Remediation)
  const [controlFilterMode, setControlFilterMode] = useState<'ALL' | 'HIGH_RISK' | 'URGENT_REMEDIATION'>('ALL');

  useEffect(() => {
    if (initialTab) {
      if (['heatmap', 'compliance_heatmap', 'compliance'].includes(initialTab)) {
        setActiveTab('heatmap');
      } else if (['frameworks', 'iso27001', 'mas_trm', 'iso42001', 'dpdp', 'gap_assessment', 'crosswalk', 'regulatory_news'].includes(initialTab)) {
        setActiveTab(initialTab);
      } else if (initialTab.startsWith('iso27001_') || ['statement_of_applicability', 'implementation_journey', 'discovery_questionnaire'].includes(initialTab)) {
        setActiveTab('iso27001');
        setIsoSubView(initialTab);
      } else if (initialTab.startsWith('mas_') || ['feat_genai_sentinel', 'pqc_crypto_migration', 'compliance_gap_visualization'].includes(initialTab)) {
        setActiveTab('mas_trm');
        setMasSubView(initialTab);
      } else if (initialTab.startsWith('iso42001_')) {
        setActiveTab('iso42001');
      } else if (initialTab.startsWith('dpdp_') || initialTab === 'iso27701_soa') {
        setActiveTab('dpdp');
      } else {
        setActiveTab(initialTab);
      }
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialFramework) {
      setSelectedFramework(initialFramework);
      setActiveFramework(initialFramework);
    }
  }, [initialFramework]);

  useEffect(() => {
    if (initialDepartment) {
      setSelectedDepartment(initialDepartment);
    }
  }, [initialDepartment]);

  const tabs: WorkspaceTab[] = [
    { id: 'automation', label: 'Compliance Automation OS', icon: Zap, badge: 'Continuous' },
    { id: 'integration_fabric', label: 'Integration Fabric & Marketplace', icon: Network, badge: '55+ Connectors' },
    { id: 'heatmap', label: 'Compliance Heatmap', icon: Grid, badge: 'Primary View' },
    { id: 'frameworks', label: 'Frameworks Portfolio', icon: Layers },
    { id: 'iso27001', label: 'ISO 27001 ISMS', icon: ShieldCheck, badge: '93 Controls' },
    { id: 'mas_trm', label: 'MAS TRM 2021', icon: AlertOctagon, badge: '86 Reqs' },
    { id: 'iso42001', label: 'ISO 42001 AI', icon: Sparkles, badge: '38 Controls' },
    { id: 'dpdp', label: 'DPDP & ISO 27701', icon: Scale, badge: 'India / PIMS' },
    { id: 'gap_assessment', label: 'Gap Assessment', icon: SlidersHorizontal },
    { id: 'crosswalk', label: 'Harmonization & Crosswalk', icon: ArrowRightLeft, badge: '82% Reuse' },
    { id: 'regulatory_news', label: 'Regulatory Sources', icon: Bell }
  ];

  const stats: WorkspaceStat[] = [
    { label: 'Active Frameworks', value: currentTenant?.selectedFrameworks?.length || 4 },
    { label: 'Total Controls', value: 264 },
    { label: 'Average Maturity', value: '3.6 / 5.0' },
    { label: 'Cross-Standard Reuse', value: '82%' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'automation':
        return <CoreComplianceAutomationWorkspace tenantId={currentTenant?.id} />;

      case 'integration_fabric':
        return <IntegrationFabricMarketplaceWorkspace />;

      case 'heatmap':
      case 'compliance_heatmap':
        return (
          <div className="space-y-5">
            {/* Heatmap Engine Segmented Mode Switcher Ribbon */}
            <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 sm:p-5 shadow-2xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Header & Context */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Grid className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        Regulatory Compliance Maturity Heatmap
                      </h2>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60">
                        {heatmapEngineMode === 'd3' ? 'D3 Visualization Engine' : 'Tri-Matrix Grid'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
                      Visualize adherence across enterprise departments and ISO controls using D3, with automated detection and highlighting of areas requiring urgent remediation.
                    </p>
                  </div>
                </div>

                {/* Header Controls: Filter Dropdown & Engine Mode Toggle */}
                <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                  {/* Control Filter Dropdown (All Controls vs High Risk vs Requires Urgent Remediation) */}
                  <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 pl-1.5 pr-0.5 uppercase tracking-wider flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                      <span>Controls:</span>
                    </span>
                    <select
                      id="compliance-workspace-control-risk-filter"
                      value={controlFilterMode}
                      onChange={(e) => setControlFilterMode(e.target.value as 'ALL' | 'HIGH_RISK' | 'URGENT_REMEDIATION')}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-2xs"
                      title="Filter controls by risk posture and remediation urgency"
                    >
                      <option value="ALL">All Controls</option>
                      <option value="HIGH_RISK">High Risk</option>
                      <option value="URGENT_REMEDIATION">Requires Urgent Remediation</option>
                    </select>
                  </div>

                  {/* Engine Mode Toggle (Anti-slop clean segmented button controls) */}
                  <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
                    <button
                      onClick={() => setHeatmapEngineMode('d3')}
                      className={`px-3 py-1.5 font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                        heatmapEngineMode === 'd3'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>D3 Heatmap Engine</span>
                    </button>
                    <button
                      onClick={() => setHeatmapEngineMode('multi_framework')}
                      className={`px-3 py-1.5 font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                        heatmapEngineMode === 'multi_framework'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      <span>Multi-Framework</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* D3 Compliance Heatmap Engine */}
            {heatmapEngineMode === 'd3' ? (
              <D3ComplianceHeatmap
                initialDepartment={selectedDepartment !== 'ALL' ? selectedDepartment : undefined}
                initialControlFilter={controlFilterMode}
                onControlFilterChange={setControlFilterMode}
                hideHeaderCard={true}
              />
            ) : (
              <div className="space-y-4">
                {/* Secondary Filters for Multi-Framework Matrix */}
                <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 pl-1.5 pr-0.5 uppercase tracking-wider">
                        Framework:
                      </span>
                      <select
                        id="compliance-workspace-framework-filter"
                        value={selectedFramework}
                        onChange={(e) => setSelectedFramework(e.target.value)}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-2xs"
                        title="Filter Heatmap by Regulatory Compliance Standard"
                      >
                        <option value="all">All Frameworks (Unified Tri-Matrix)</option>
                        <option value="iso27001">ISO/IEC 27001:2022 ISMS (93 Controls)</option>
                        <option value="mas_trm">MAS TRM 2021 Singapore (86 Reqs)</option>
                        <option value="iso27701">ISO/IEC 27701:2019 Privacy (49 Controls)</option>
                        <option value="composite">Department Composite Scorecard</option>
                        <option value="grid_tiles">Interactive Grid Matrix</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 pl-1.5 pr-0.5 uppercase tracking-wider">
                        Department:
                      </span>
                      <select
                        id="compliance-workspace-department-filter"
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-2xs"
                        title="Filter Heatmap by Business Department"
                      >
                        <option value="ALL">All Departments (Enterprise-wide)</option>
                        {HEATMAP_DEPARTMENTS.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name} ({dept.head})
                          </option>
                        ))}
                      </select>
                    </div>

                    {(selectedFramework !== 'all' || selectedDepartment !== 'ALL') && (
                      <button
                        onClick={() => {
                          setSelectedFramework('all');
                          setSelectedDepartment('ALL');
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200/80 dark:border-indigo-800/80 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Filters</span>
                      </button>
                    )}
                  </div>

                  <span className="text-xs text-slate-400">
                    CMMI Benchmark: <strong className="text-emerald-600 dark:text-emerald-400">Level 4 Managed</strong>
                  </span>
                </div>

                <ComplianceHeatmap
                  filterFramework={selectedFramework}
                  filterDepartment={selectedDepartment}
                  onFrameworkChange={setSelectedFramework}
                  onDepartmentChange={setSelectedDepartment}
                  hideBreadcrumb={true}
                />
              </div>
            )}
          </div>
        );

      case 'frameworks':
      case 'framework_factory':
      case 'framework_marketplace':
        return <FrameworkFactoryWorkspace />;

      case 'iso27001':
        return (
          <div className="space-y-4">
            {/* Sub-navigation bar for ISO 27001 */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
              <span className="px-2.5 py-1 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">ISO 27001:</span>
              {[
                { id: 'dashboard', label: 'ISMS Center' },
                { id: 'heatmap', label: 'Maturity Heatmap' },
                { id: 'workbench', label: '93 Annex A Controls' },
                { id: 'clauses', label: 'Clauses 4–10' },
                { id: 'soa', label: 'Statement of Applicability' },
                { id: 'journey', label: '24-Stage Roadmap' },
                { id: 'survey', label: '14-Domain Survey' },
                { id: 'dept_surveys', label: 'Dept Surveys' },
                { id: 'profile', label: 'Risk Profile' },
                { id: 'project_plan', label: 'Project Plan' },
                { id: 'improvements', label: '2022 Improvements' }
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setIsoSubView(sub.id)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                    isoSubView === sub.id
                      ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-semibold border border-primary-200/50 dark:border-primary-800/50'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {isoSubView === 'dashboard' && <ISO27001DashboardModule />}
            {isoSubView === 'heatmap' && (
              <D3ComplianceHeatmap
                initialDepartment={selectedDepartment !== 'ALL' ? selectedDepartment : undefined}
                initialControlFilter={controlFilterMode}
                onControlFilterChange={setControlFilterMode}
              />
            )}
            {isoSubView === 'workbench' && <ISO27001WorkbenchModule />}
            {isoSubView === 'clauses' && <ISO27001ClausesModule />}
            {isoSubView === 'soa' && <StatementOfApplicabilityModule />}
            {isoSubView === 'journey' && <ISOImplementationJourneyModule />}
            {isoSubView === 'survey' && <DiscoveryQuestionnaireModule />}
            {isoSubView === 'dept_surveys' && <DepartmentSurveysModule />}
            {isoSubView === 'profile' && <CompanyComplianceProfileView />}
            {isoSubView === 'project_plan' && <ImplementationPlanModule />}
            {isoSubView === 'improvements' && <ISOMASImprovementHubModule />}
          </div>
        );

      case 'mas_trm':
        return (
          <div className="space-y-4">
            {/* Sub-navigation bar for MAS TRM */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
              <span className="px-2.5 py-1 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">MAS TRM:</span>
              {[
                { id: 'flow', label: 'Compliance Flow' },
                { id: 'heatmap', label: 'TRM Heatmap Matrix' },
                { id: 'journey', label: '18-Stage Roadmap' },
                { id: 'workbench', label: 'Testing Workbench' },
                { id: 'checklist', label: '14 Domains Checklist' },
                { id: 'regulatory_intelligence', label: 'MAS Live Regulatory Intelligence' },
                { id: 'notice644', label: 'Notice 644 Historical' },
                { id: 'notice655', label: 'Notice 655 Historical' },
                { id: 'critical_systems', label: 'Critical Systems Register' },
                { id: 'incident', label: 'Incident Form IT-01' },
                { id: 'workflow', label: 'Workflow Engine' },
                { id: 'feat', label: 'FEAT GenAI Sentinel' },
                { id: 'pqc', label: 'PQC Migration' },
                { id: 'gap_vault', label: 'Gap & Evidence Vault' }
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setMasSubView(sub.id)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                    masSubView === sub.id
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold border border-rose-200/50 dark:border-rose-800/50'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {masSubView === 'flow' && <MASTRMComplianceFlowDashboard />}
            {masSubView === 'heatmap' && (
              <ComplianceHeatmap
                filterFramework="mas_trm"
                filterDepartment={selectedDepartment}
                onDepartmentChange={setSelectedDepartment}
                hideBreadcrumb={true}
              />
            )}
            {masSubView === 'journey' && <MASTRMImplementationJourney onSelectStage={() => setMasSubView('flow')} />}
            {masSubView === 'workbench' && <MASTRMAssessmentWorkbenchModule />}
            {masSubView === 'checklist' && <MASTRMComplianceChecklistModule />}
            {masSubView === 'regulatory_intelligence' && (
              <MASLiveRegulatoryIntelligenceWorkspace
                onNavigateToWorkflow={() => setMasSubView('workflow')}
                onNavigateToNotice644={() => setMasSubView('notice644')}
                onNavigateToNotice655={() => setMasSubView('notice655')}
              />
            )}
            {masSubView === 'notice644' && <MASNotice644IncidentSimulator onNavigateToCISDowntime={() => setMasSubView('critical_systems')} />}
            {masSubView === 'notice655' && <MASNotice655CyberHygieneDashboard />}
            {masSubView === 'critical_systems' && <MASCriticalSystemsRegister />}
            {masSubView === 'incident' && <MASIncidentNotificationModule />}
            {masSubView === 'workflow' && <MASComplianceWorkflowModule />}
            {masSubView === 'feat' && <FEATGenAIRiskSentinel />}
            {masSubView === 'pqc' && <PQCCryptoMigrationLedger />}
            {masSubView === 'gap_vault' && <ComplianceGapVisualization />}
          </div>
        );

      case 'iso42001':
        return (
          <div className="space-y-4">
            <ISO42001DashboardModule />
          </div>
        );

      case 'dpdp':
        return (
          <div className="space-y-4">
            <DPDPActComplianceModule />
          </div>
        );

      case 'gap_assessment':
        return <GapAssessmentModule />;

      case 'crosswalk':
        return (
          <div className="space-y-6">
            <CrossRegulatoryHarmonizationEngine />
            <CrossFrameworkCrosswalkModule />
          </div>
        );

      case 'regulatory_news':
        return <RegulatoryChangeSourceRegistryModule />;

      default:
        return <FrameworksModule />;
    }
  };

  return (
    <WorkspaceLayout
      title="Compliance & Frameworks"
      subtitle="Central multi-standard compliance engine. Manage frameworks, testing workbenches, Statements of Applicability, and statutory obligations."
      icon={ShieldCheck}
      iconColor="text-emerald-600 dark:text-emerald-400"
      stats={stats}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </WorkspaceLayout>
  );
};
