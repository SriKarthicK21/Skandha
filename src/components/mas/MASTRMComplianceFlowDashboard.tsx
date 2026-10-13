import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Building2,
  Server,
  Layers,
  FileText,
  Flame,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  Plus,
  Play,
  Calendar,
  AlertOctagon,
  Lock,
  Key,
  Network,
  Target,
  Globe,
  FileCheck,
  FolderCheck,
  Code2,
  SlidersHorizontal,
  Truck,
  Database,
  Radar,
  Sparkles,
  Download,
  Filter,
  CheckSquare,
  Users2,
  Award
} from 'lucide-react';
import {
  MAS_TRM_17_MODULES,
  INITIAL_MAS_CRITICAL_SYSTEMS,
  INITIAL_MAS_TECH_RISKS,
  CROSS_FRAMEWORK_REUSE_STATS
} from '../../data/masTrmModulesData';
import { MAS_TRM_REQUIREMENTS } from '../../data/masRegulatoryMasterData';
import { MASModuleDetailWorkspace } from './MASModuleDetailWorkspace';
import { MASTRMImplementationJourney } from './MASTRMImplementationJourney';
import { MASRegulatoryDiscoveryWizard } from './MASRegulatoryDiscoveryWizard';
import { ComplianceGapVisualization } from './ComplianceGapVisualization';
import { AuditReportSummary } from './AuditReportSummary';
import { CompanyRegistrationModal } from './CompanyRegistrationModal';
import { DynamicTRMSurveyModal } from './DynamicTRMSurveyModal';
import { MASOngoingMonitoringWorkspace } from './MASOngoingMonitoringWorkspace';
import { MASContinuousGRCWorkspace } from './MASContinuousGRCWorkspace';
import { MASSupervisoryDossierModule } from './MASSupervisoryDossierModule';
import { MASStatisticalAuditSamplingEngine } from './MASStatisticalAuditSamplingEngine';
import { MASBoardRiskCommitteeDeck } from './MASBoardRiskCommitteeDeck';
import { useGRC } from '../../context/GRCContext';
import { PageContainer } from '../layout/PageContainer';

export const MASTRMComplianceFlowDashboard: React.FC = () => {
  const {
    currentTenant,
    currentTenantId,
    setActiveModule,
    findings,
    evidence,
    masAssessments,
    masReadinessScoreSummary,
    calculateMASReadinessScore,
    risks,
    masRegulatoryProfile
  } = useGRC();

  // Active top view tab
  const [viewMode, setViewMode] = useState<
    'flow_dashboard' | 'journey_roadmap' | 'discovery_wizard' | 'modules_directory' | 'module_detail' | 'gap_visualization' | 'audit_report' | 'ongoing_monitor' | 'continuous_grc' | 'supervisory_dossier' | 'statistical_sampling' | 'brc_reporting_deck'
  >('flow_dashboard');

  const [selectedModuleId, setSelectedModuleId] = useState<string>('mas-mod-01');
  const [selectedAuditReqCode, setSelectedAuditReqCode] = useState<string | undefined>(undefined);
  const [nextActionExecuted, setNextActionExecuted] = useState(false);

  // 10-Step Implementation Flow state
  const [activeStepNumber, setActiveStepNumber] = useState<number>(6);
  const [discoveryWizardInitialStep, setDiscoveryWizardInitialStep] = useState<1 | 2 | 3>(1);
  const [showCompanyRegModal, setShowCompanyRegModal] = useState<boolean>(false);
  const [showDynamicSurveyModal, setShowDynamicSurveyModal] = useState<boolean>(false);

  const modules = MAS_TRM_17_MODULES;
  const criticalSystems = INITIAL_MAS_CRITICAL_SYSTEMS;
  const techRisks = INITIAL_MAS_TECH_RISKS;

  const handleStepClick = (stepNum: number) => {
    setActiveStepNumber(stepNum);
    switch (stepNum) {
      case 1:
        setShowCompanyRegModal(true);
        break;
      case 2:
        setDiscoveryWizardInitialStep(1);
        setViewMode('discovery_wizard');
        break;
      case 3:
        setShowDynamicSurveyModal(true);
        break;
      case 4:
        setDiscoveryWizardInitialStep(2);
        setViewMode('discovery_wizard');
        break;
      case 5:
        setViewMode('journey_roadmap');
        break;
      case 6:
        setViewMode('gap_visualization');
        break;
      case 7:
        setSelectedAuditReqCode(undefined);
        setViewMode('audit_report');
        break;
      case 8:
        setSelectedAuditReqCode(undefined);
        setViewMode('audit_report');
        break;
      case 9:
        setViewMode('ongoing_monitor');
        break;
      case 10:
        setViewMode('continuous_grc');
        break;
      default:
        break;
    }
  };

  // Render module icon dynamically
  const renderModuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck className="w-4 h-4 text-rose-400" />;
      case 'Flame': return <Flame className="w-4 h-4 text-orange-400" />;
      case 'Database': return <Database className="w-4 h-4 text-indigo-400" />;
      case 'Truck': return <Truck className="w-4 h-4 text-blue-400" />;
      case 'Layers': return <Layers className="w-4 h-4 text-purple-400" />;
      case 'Code2': return <Code2 className="w-4 h-4 text-emerald-400" />;
      case 'SlidersHorizontal': return <SlidersHorizontal className="w-4 h-4 text-sky-400" />;
      case 'Server': return <Server className="w-4 h-4 text-rose-400" />;
      case 'Lock': return <Lock className="w-4 h-4 text-amber-400" />;
      case 'Key': return <Key className="w-4 h-4 text-yellow-400" />;
      case 'Network': return <Network className="w-4 h-4 text-cyan-400" />;
      case 'Activity': return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'Target': return <Target className="w-4 h-4 text-rose-400" />;
      case 'Globe': return <Globe className="w-4 h-4 text-sky-400" />;
      case 'FileCheck': return <FileCheck className="w-4 h-4 text-teal-400" />;
      case 'Radar': return <Radar className="w-4 h-4 text-pink-400" />;
      default: return <ShieldCheck className="w-4 h-4 text-rose-400" />;
    }
  };

  const handleOpenModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setViewMode('module_detail');
  };

  // Readiness scorecard summary from GRC context
  const readinessSummary = useMemo(() => {
    if (masReadinessScoreSummary && masReadinessScoreSummary.totalApplicableRequirements > 0) {
      return masReadinessScoreSummary;
    }
    return calculateMASReadinessScore?.() || {
      overallScore: 82,
      overallReadinessScore: 82,
      cyberHygieneNotice655Readiness: 88,
      criticalSystemsReadiness: 76,
      evidenceCoverageRate: 85,
      totalApplicableRequirements: 73,
      highRiskCount: 4,
      mediumRiskCount: 8,
      lowRiskCount: 61,
      totalOpenFindings: 7,
      majorNonConformitiesCount: 2,
      domainBreakdown: {},
      criticalSlaStatus: {
        rtoMet: true,
        masNotificationReady: true,
        unscheduledDowntimeHours: 0.5
      },
      details: {}
    };
  }, [masReadinessScoreSummary, calculateMASReadinessScore]);

  // High-Risk MAS TRM requirements cross-referenced with findings and technology risks
  const highRiskCrossReferencedReqs = useMemo(() => {
    const rawReqs = MAS_TRM_REQUIREMENTS || [];
    return rawReqs
      .filter(req => req.criticalSystemsMandate || req.mandatoryForFIs || req.requirementCode.startsWith('MAS-TRM-8') || req.requirementCode.startsWith('MAS-TRM-9') || req.requirementCode.startsWith('MAS-TRM-12') || req.requirementCode.startsWith('MAS-TRM-5'))
      .map(req => {
        const assess = masAssessments?.find(a => a.requirementCode === req.requirementCode);
        const reqLower = req.requirementCode.toLowerCase();
        
        // Correlated open findings
        const correlatedFindings = (findings || []).filter(f => {
          if (f.status === 'Closed Verified') return false;
          if (f.tenantId && currentTenantId && f.tenantId !== currentTenantId) return false;
          const clause = (f.clauseOrControl || '').toLowerCase();
          const title = (f.title || '').toLowerCase();
          const desc = (f.description || '').toLowerCase();
          return (
            clause.includes(reqLower) ||
            title.includes(reqLower) ||
            desc.includes(reqLower) ||
            assess?.linkedFindingIds?.includes(f.id) ||
            assess?.linkedFindingIds?.includes(f.findingCode)
          );
        });

        // Correlated technology risks
        const correlatedTechRisks = (risks || []).filter(r => {
          const mappedReqIds = r.frameworkMappings?.masTrmRequirementIds || [];
          if (mappedReqIds.includes(req.requirementCode) || mappedReqIds.includes(req.id)) return true;
          const mappedSections = r.frameworkMappings?.masTrmSections || [];
          if (req.sectionNumber && mappedSections.includes(req.sectionNumber)) return true;
          return false;
        });

        const majorCount = correlatedFindings.filter(f => f.severity === 'Major Non-Conformity').length;
        const minorCount = correlatedFindings.filter(f => f.severity === 'Minor Non-Conformity').length;

        // Baseline score
        let score = 85;
        if (assess?.complianceStatus === 'NON_COMPLIANT') score = 25;
        else if (assess?.complianceStatus === 'PARTIALLY_COMPLIANT') score = 55;
        else if (assess?.complianceStatus === 'COMPLIANT') score = 95;
        else if (req.requirementCode === 'MAS-TRM-8.1') score = 42;
        else if (req.requirementCode === 'MAS-TRM-9.2') score = 38;
        else if (req.requirementCode === 'MAS-TRM-12.2') score = 50;
        else if (req.requirementCode === 'MAS-TRM-5.3') score = 45;

        // Apply findings penalties
        score = Math.max(10, score - majorCount * 25 - minorCount * 10);

        const isHighRisk = score < 70 || majorCount > 0 || (req.criticalSystemsMandate && score < 85);

        return {
          req,
          score,
          isHighRisk,
          correlatedFindings,
          correlatedTechRisks,
          majorCount,
          minorCount
        };
      })
      .filter(item => item.isHighRisk || item.correlatedFindings.length > 0 || item.score < 70)
      .sort((a, b) => a.score - b.score);
  }, [masAssessments, findings, risks, currentTenantId]);

  return (
    <PageContainer id="mas-trm-compliance-flow-dashboard">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Navigation Mode Switcher Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-bold text-white tracking-wide uppercase">
              MAS Technology Risk Management (TRM) Hub
            </span>
            <span className="text-xs text-slate-400">| Singapore Supervisory Engine</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setViewMode('flow_dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                viewMode === 'flow_dashboard'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              Master Compliance Flow
            </button>
            <button
              onClick={() => setViewMode('journey_roadmap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                viewMode === 'journey_roadmap'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              18-Stage Roadmap
            </button>
            <button
              onClick={() => setViewMode('discovery_wizard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                viewMode === 'discovery_wizard'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              Regulatory Discovery
            </button>
            <button
              onClick={() => setViewMode('gap_visualization')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border flex items-center gap-1.5 ${
                viewMode === 'gap_visualization'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              Compliance Gap & Vault
            </button>
            <button
              onClick={() => setViewMode('audit_report')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border flex items-center gap-1.5 ${
                viewMode === 'audit_report'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-rose-400" />
              Audit Report Summary
            </button>
            <button
              onClick={() => {
                setActiveStepNumber(9);
                setViewMode('ongoing_monitor');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border flex items-center gap-1.5 ${
                viewMode === 'ongoing_monitor'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              Ongoing Telemetry
            </button>
            <button
              onClick={() => {
                setActiveStepNumber(10);
                setViewMode('continuous_grc');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border flex items-center gap-1.5 ${
                viewMode === 'continuous_grc'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              Cross-Standard Crosswalk
            </button>
            <button
              onClick={() => setViewMode('supervisory_dossier')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border flex items-center gap-1.5 ${
                viewMode === 'supervisory_dossier'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              Supervisory Dossier (Sec 15)
            </button>
            <button
              onClick={() => setViewMode('statistical_sampling')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border flex items-center gap-1.5 ${
                viewMode === 'statistical_sampling'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
              Audit 25-Sample Engine
            </button>
            <button
              onClick={() => setViewMode('brc_reporting_deck')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border flex items-center gap-1.5 ${
                viewMode === 'brc_reporting_deck'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              BRC Board Deck
            </button>
          </div>
        </div>

        {/* Master Implementation Flow (1-10) - Always Active, Fully Interactive */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
                <span className="text-rose-400">Implementation Flow (1-10)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Understand &rarr; Assess &rarr; Plan &rarr; Implement &rarr; Validate &rarr; Certify &rarr; Monitor &rarr; Improve
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Continuous Regulatory Alignment Active</span>
              </span>
            </div>
          </div>

          {/* 10 Connected Implementation Steps Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
            {[
              { num: 1, title: 'Company Reg', status: 'done', desc: 'Entity & Licence' },
              { num: 2, title: 'Regulatory Disc', status: 'done', desc: 'Statutory Scope' },
              { num: 3, title: 'Dynamic Surv...', status: 'done', desc: 'Risk Profile' },
              { num: 4, title: 'Applicability', status: 'done', desc: 'Mandate Engine' },
              { num: 5, title: 'Implement Plan', status: 'done', desc: '18-Stage Plan' },
              { num: 6, title: 'Execution & E...', status: 'active', desc: 'Evidence Vault' },
              { num: 7, title: 'Audit Assura...', status: 'pending', desc: 'NCs & CAPA' },
              { num: 8, title: 'Reg Readiness', status: 'pending', desc: 'Scorecard (82%)' },
              { num: 9, title: 'Ongoing Moni...', status: 'pending', desc: 'Notice 644 SLAs' },
              { num: 10, title: 'Continuous G...', status: 'pending', desc: 'Continual GRC' }
            ].map(step => {
              const isActive = activeStepNumber === step.num;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => handleStepClick(step.num)}
                  title={`Step ${step.num}: ${step.title} (${step.desc})`}
                  className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer hover:scale-[1.02] focus:outline-none ${
                    isActive
                      ? 'bg-rose-950/40 border-rose-500 text-rose-200 ring-2 ring-rose-500/60 shadow-lg shadow-rose-950/50 font-bold'
                      : step.status === 'done'
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300 hover:border-emerald-600'
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  <div className="text-[10px] font-bold opacity-80">{step.num}</div>
                  <div className="text-[11px] font-semibold truncate mt-0.5">{step.title}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* View Mode: Ongoing Monitoring (Step 9) */}
        {viewMode === 'ongoing_monitor' && (
          <MASOngoingMonitoringWorkspace
            onBackToDashboard={() => {
              setActiveStepNumber(6);
              setViewMode('flow_dashboard');
            }}
          />
        )}

        {/* View Mode: Continuous GRC (Step 10) */}
        {viewMode === 'continuous_grc' && (
          <MASContinuousGRCWorkspace
            onBackToDashboard={() => {
              setActiveStepNumber(6);
              setViewMode('flow_dashboard');
            }}
          />
        )}

        {/* View Mode: Section 15 Supervisory Dossier */}
        {viewMode === 'supervisory_dossier' && (
          <MASSupervisoryDossierModule />
        )}

        {/* View Mode: Section 15 Statistical Audit Sampling Engine */}
        {viewMode === 'statistical_sampling' && (
          <MASStatisticalAuditSamplingEngine />
        )}

        {/* View Mode: Section 3.1 Board Risk Committee Reporting Deck */}
        {viewMode === 'brc_reporting_deck' && (
          <MASBoardRiskCommitteeDeck />
        )}

        {/* View Mode: Audit Report Summary & High Risk Gap Analysis */}
        {viewMode === 'audit_report' && (
          <AuditReportSummary
            onBackToDashboard={() => {
              setSelectedAuditReqCode(undefined);
              setActiveStepNumber(6);
              setViewMode('flow_dashboard');
            }}
            onNavigateToModule={setActiveModule}
            initialReqCode={selectedAuditReqCode}
          />
        )}

        {/* View Mode: Gap & Evidence Vault Visualization */}
        {viewMode === 'gap_visualization' && (
          <ComplianceGapVisualization />
        )}

        {/* View Mode 1: Journey Roadmap */}
        {viewMode === 'journey_roadmap' && (
          <MASTRMImplementationJourney onSelectStage={stageNum => handleOpenModule(`mas-mod-${stageNum}`)} />
        )}

        {/* View Mode 2: Discovery Wizard */}
        {viewMode === 'discovery_wizard' && (
          <MASRegulatoryDiscoveryWizard
            initialStep={discoveryWizardInitialStep}
            onApplicabilityConfirmed={() => {
              setActiveStepNumber(5);
              setViewMode('flow_dashboard');
            }}
          />
        )}

        {/* View Mode 3: Module Deep Dive Workspace */}
        {viewMode === 'module_detail' && (
          <MASModuleDetailWorkspace
            selectedModuleId={selectedModuleId}
            onBackToDashboard={() => {
              setActiveStepNumber(6);
              setViewMode('flow_dashboard');
            }}
            onNavigateToModule={setActiveModule}
          />
        )}

        {/* View Mode 4: Primary Master Flow Dashboard (Matches the User Image) */}
        {viewMode === 'flow_dashboard' && (
          <div className="space-y-6">
            {/* Top Section: 17 MAS TRM Modules Cards Grid (as in uploaded image) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    17 MAS TRM Guidelines Modules
                  </h3>
                  <span className="text-xs text-slate-400">(January 2021 Edition Grounded)</span>
                </div>
                <span className="text-xs text-slate-400">Click any module to inspect statutory controls</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {modules.map(mod => (
                  <div
                    key={mod.id}
                    onClick={() => handleOpenModule(mod.id)}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/60 hover:bg-slate-800/60 transition-all cursor-pointer group shadow-md"
                  >
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {mod.number}
                      </span>
                      <div className="p-1 rounded-md bg-slate-800/80 group-hover:bg-rose-500/20 transition-colors">
                        {renderModuleIcon(mod.icon)}
                      </div>
                    </div>

                    <h4 className="text-xs font-semibold text-white group-hover:text-rose-300 transition-colors line-clamp-1">
                      {mod.shortTitle}
                    </h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                      {mod.trmSection}
                    </span>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px]">
                      <span className="text-slate-400">{mod.totalRequirements} Reqs</span>
                      <span
                        className={`font-semibold ${
                          mod.status === 'COMPLIANT'
                            ? 'text-emerald-400'
                            : mod.status === 'IN_PROGRESS'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {mod.status === 'COMPLIANT' ? '100%' : `${Math.round((mod.implementedCount / mod.totalRequirements) * 100)}%`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Middle Section: Company Dashboard - MAS TRM (Matching the image) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Box: 82% MAS TRM Readiness Gauge */}
              <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      MAS TRM Readiness
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      CALIBRATED
                    </span>
                  </div>

                  {/* Circular / Arc Gauge Visual */}
                  <div className="flex flex-col items-center justify-center my-4">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Background track */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#1e293b"
                          strokeWidth="10"
                        />
                        {/* Active Progress stroke */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="url(#rose-grad)"
                          strokeWidth="10"
                          strokeDasharray="251.2"
                          strokeDashoffset={251.2 * (1 - 0.82)}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="rose-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f43f5e" />
                            <stop offset="100%" stopColor="#10b981" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className="text-3xl font-extrabold text-white tracking-tight">82%</span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                          Ready for Audit
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 text-center mt-2 max-w-xs leading-relaxed">
                      Weighted score based on applicable requirements, evidence validation status,
                      control effectiveness, and critical systems resilience.
                    </p>
                  </div>
                </div>

                {/* Status Breakdown Pills */}
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-slate-800/60 p-2 rounded-lg">
                      <div className="font-bold text-emerald-400 text-sm">52</div>
                      <span className="text-[10px] text-slate-400">Implemented</span>
                    </div>
                    <div className="bg-slate-800/60 p-2 rounded-lg">
                      <div className="font-bold text-amber-400 text-sm">8</div>
                      <span className="text-[10px] text-slate-400">In Progress</span>
                    </div>
                    <div className="bg-slate-800/60 p-2 rounded-lg">
                      <div className="font-bold text-rose-400 text-sm">7</div>
                      <span className="text-[10px] text-slate-400">Open Gaps</span>
                    </div>
                    <div className="bg-slate-800/60 p-2 rounded-lg">
                      <div className="font-bold text-rose-500 text-sm">3</div>
                      <span className="text-[10px] text-slate-400">Overdue</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
                    <span>73 Applicable Req</span>
                    <span>&bull;</span>
                    <span>5 Not Applicable</span>
                    <span>&bull;</span>
                    <span>12 Evidence Pending</span>
                    <span>&bull;</span>
                    <span>4 High Risks</span>
                  </div>

                  <button
                    onClick={() => setViewMode('audit_report')}
                    className="w-full mt-2 py-2 px-3 rounded-lg text-xs font-semibold bg-rose-600/90 hover:bg-rose-600 text-white border border-rose-500/50 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Award className="w-3.5 h-3.5 text-white" />
                    Open Audit Report Summary & High Risk Gaps
                  </button>
                </div>
              </div>

              {/* Right Box: Next Action Card (Matching user screenshot) */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        NEXT ACTION CARD
                      </span>
                      <span className="text-xs text-slate-400">Cross-Framework Unified Action Engine</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      HIGH PRIORITY
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">
                    Complete Critical System Recovery Test & TVRA Report
                  </h3>
                  <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                    MAS TRM Section 8.1 & 8.2 mandate annual disaster recovery drills for all designated Critical Information
                    Systems. The annual failover test for the Core Banking Platform is due in 4 days.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/60 mb-5 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Framework</span>
                      <strong className="text-rose-300">MAS TRM & ISO 27001</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Action Owner</span>
                      <strong className="text-white">Infrastructure Manager</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Statutory Due Date</span>
                      <strong className="text-amber-400">28 Sep 2026</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Related System</span>
                      <strong className="text-white">Core Banking Platform</strong>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-rose-400" />
                      Evidence Required: <strong>Disaster Recovery Test Sign-Off Report</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModule('mas-mod-08')}
                        className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
                      >
                        View Requirement
                      </button>
                      <button
                        onClick={() => setNextActionExecuted(true)}
                        className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white shadow-lg shadow-rose-600/20 transition-all flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" />
                        {nextActionExecuted ? 'Test Executed (Drill Logged)' : 'Execute Action'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Critical Systems Overview (Matching user screenshot) */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Server className="w-4 h-4 text-rose-400" />
                        Critical Systems Overview
                      </h3>
                      <span className="text-xs text-slate-400">
                        Total Systems: <strong>8</strong> | Critical: <strong>5</strong> | RTO Overdue: <strong className="text-rose-400">2</strong> | Test Due Soon: <strong className="text-amber-400">1</strong>
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveModule('mas_critical_systems')}
                      className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      View Full Register &rarr;
                    </button>
                  </div>

                  <div className="divide-y divide-slate-800">
                    {criticalSystems.slice(0, 3).map(sys => (
                      <div key={sys.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2 h-2 rounded-full ${
                            sys.testStatus === 'Compliant'
                              ? 'bg-emerald-400'
                              : sys.testStatus === 'Due Soon'
                              ? 'bg-amber-400'
                              : 'bg-rose-500'
                          }`} />
                          <div>
                            <strong className="text-white block">{sys.systemName}</strong>
                            <span className="text-slate-400 text-[11px]">{sys.businessService}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-slate-400">
                            RTO: <strong className="text-slate-200">&le; {sys.rtoTargetHours}h</strong>
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sys.testStatus === 'Compliant'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : sys.testStatus === 'Due Soon'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {sys.testStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Audit-Ready Compliance Gap & High-Risk Requirements Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 border-b border-slate-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      <Award className="w-4 h-4" />
                    </span>
                    <h3 className="text-base font-bold text-white tracking-wide">
                      Audit-Ready Compliance Gap & High-Risk Requirements
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                      Audit Exposure
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                    Cross-references MAS TRM statutory readiness scores with open non-conformities, CAPA commitments, and technology risks to spotlight statutory vulnerabilities before formal supervisory inspection.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span><strong className="text-rose-400">{highRiskCrossReferencedReqs.length}</strong> High-Risk Reqs</span>
                    <span className="text-slate-600">&bull;</span>
                    <span><strong className="text-amber-400">{readinessSummary.majorNonConformitiesCount ?? 2}</strong> Major NCs</span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedAuditReqCode(undefined);
                      setViewMode('audit_report');
                    }}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 shadow-md shadow-rose-950/40 transition-colors"
                  >
                    <span>View Full Audit Dossier</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Grid of Top High-Risk Requirements with Open Findings */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {highRiskCrossReferencedReqs.slice(0, 4).map(item => (
                  <div
                    key={item.req.id}
                    className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 hover:border-rose-500/60 hover:bg-slate-800 transition-all flex flex-col justify-between group shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-slate-900 text-rose-400 border border-slate-700">
                          {item.req.requirementCode}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.score < 50
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {item.score}% Ready
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors line-clamp-1">
                        {item.req.title}
                      </h4>
                      <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
                        {item.req.domainName}
                      </span>

                      {/* Score Bar */}
                      <div className="w-full bg-slate-900 rounded-full h-1.5 mt-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.score >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>

                      {/* Cross-Referenced Open Findings & Tech Risks */}
                      <div className="mt-3 space-y-1.5 text-[11px]">
                        {item.correlatedFindings.length > 0 ? (
                          <div className="p-2 rounded bg-rose-950/30 border border-rose-900/40 text-rose-300">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-rose-400" />
                                {item.correlatedFindings.length} Open Finding(s)
                              </span>
                              {item.majorCount > 0 && (
                                <span className="text-[10px] font-bold text-rose-400 bg-rose-900/60 px-1.5 py-0.5 rounded">
                                  {item.majorCount} Major NC
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                              {item.correlatedFindings[0]?.title}
                            </span>
                          </div>
                        ) : (
                          <div className="p-2 rounded bg-amber-950/20 border border-amber-900/40 text-amber-300 flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="text-[10px]">Statutory requirement gap pending evidence</span>
                          </div>
                        )}

                        {item.correlatedTechRisks.length > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-orange-400 font-mono">
                            <Flame className="w-3 h-3 text-orange-400 shrink-0" />
                            <span>Risk {item.correlatedTechRisks[0].riskCode}: Residual {item.correlatedTechRisks[0].residualScore}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Drill-down action */}
                    <button
                      onClick={() => {
                        setSelectedAuditReqCode(item.req.requirementCode);
                        setViewMode('audit_report');
                      }}
                      className="mt-3 w-full py-1.5 rounded-lg text-[11px] font-semibold bg-slate-900/80 hover:bg-rose-600 hover:text-white text-slate-300 border border-slate-700/80 transition-all flex items-center justify-center gap-1"
                    >
                      <span>Inspect Audit Detail</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Row: Risk Heatmap (Technology Risk) & Top Risks */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* 5x5 Heatmap */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    Risk Heatmap (Technology Risk)
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">14 Categories</span>
                </div>

                <div className="space-y-1.5">
                  {[5, 4, 3, 2, 1].map(likelihood => (
                    <div key={likelihood} className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 w-4 font-bold">{likelihood}</span>
                      <div className="grid grid-cols-5 gap-1.5 flex-1">
                        {[1, 2, 3, 4, 5].map(impact => {
                          const score = likelihood * impact;
                          let bgClass = 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400';
                          if (score >= 15) {
                            bgClass = 'bg-rose-950/60 border-rose-700/60 text-rose-300 font-bold';
                          } else if (score >= 8) {
                            bgClass = 'bg-amber-950/50 border-amber-700/50 text-amber-300';
                          }

                          // Count risks falling in this cell
                          const count = techRisks.filter(r => r.likelihood === likelihood && r.impact === impact).length;

                          return (
                            <div
                              key={impact}
                              className={`h-9 rounded border flex items-center justify-center text-xs transition-colors ${bgClass}`}
                              title={`Likelihood ${likelihood} x Impact ${impact} = Score ${score}`}
                            >
                              {count > 0 ? (
                                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-bold">
                                  {count}
                                </span>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between text-[10px] text-slate-400 pl-6 pt-1 font-mono">
                    <span>1: Negligible</span>
                    <span>2: Minor</span>
                    <span>3: Moderate</span>
                    <span>4: Major</span>
                    <span>5: Critical</span>
                  </div>
                </div>
              </div>

              {/* Top Tech Risks Table */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Top Technology Risks
                  </h3>
                  <button
                    onClick={() => setActiveModule('risk_map')}
                    className="text-xs font-semibold text-rose-400 hover:text-rose-300"
                  >
                    Open Risk Map &rarr;
                  </button>
                </div>

                <div className="divide-y divide-slate-800">
                  {techRisks.map(rsk => (
                    <div key={rsk.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-[10px] font-bold text-rose-400">{rsk.riskCode}</span>
                          <strong className="text-white">{rsk.title}</strong>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Threat: {rsk.threatDescription}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Inherent / Residual</span>
                          <strong className="text-slate-200">
                            <span className="text-rose-400">{rsk.inherentScore}</span> &rarr;{' '}
                            <span className="text-emerald-400">{rsk.residualScore}</span>
                          </strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Banner: Unified Framework Integration (Matching user screenshot) */}
            <div className="bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl text-center space-y-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-widest">
                Implement Once. Comply Everywhere.
              </span>
              <h3 className="text-lg font-bold text-white">
                Multi-Framework Enterprise GRC Architecture
              </h3>
              <p className="text-xs text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Shared underlying model (Assets &rarr; Risks &rarr; Controls &rarr; Evidence &rarr; Findings &rarr; CAPA).
                An evidence artifact submitted for MAS TRM Section 9.2 Privileged Access immediately satisfies ISO 27001
                Annex A.8.2 and SOC 2 CC6.1.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {CROSS_FRAMEWORK_REUSE_STATS.supportedFrameworks.map(fw => (
                  <span
                    key={fw.code}
                    className="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs font-medium text-slate-300 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {fw.name} ({fw.reusePercentage}% Reused)
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1 Modal: Company Registration & Financial Institution Profiler */}
        <CompanyRegistrationModal
          isOpen={showCompanyRegModal}
          onClose={() => setShowCompanyRegModal(false)}
          onSaved={() => {
            setActiveStepNumber(1);
          }}
        />

        {/* Step 3 Modal: Dynamic Technology Risk & Architectural Profiling Survey */}
        <DynamicTRMSurveyModal
          isOpen={showDynamicSurveyModal}
          onClose={() => setShowDynamicSurveyModal(false)}
          onCompleted={() => {
            setActiveStepNumber(3);
          }}
        />
      </div>
    </PageContainer>
  );
};
