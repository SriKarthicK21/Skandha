import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import { RiskRecord } from '../../types';
import { D3RiskHeatmapChart } from '../risk/D3RiskHeatmapChart';
import { RiskCategoryDrilldown } from '../risk/RiskCategoryDrilldown';
import { RiskVectorShiftChart } from '../risk/RiskVectorShiftChart';
import { RiskMetricsHeader } from '../risk/RiskMetricsHeader';
import { RiskDetailModal } from '../risk/RiskDetailModal';
import { NewRiskModal } from '../risk/NewRiskModal';
import { RiskExportModal } from '../risk/RiskExportModal';
import { MultiFrameworkHarmonizer } from '../risk/MultiFrameworkHarmonizer';
import { LiveTelemetryFeed } from '../risk/LiveTelemetryFeed';
import { PageContainer } from '../layout/PageContainer';
import {
  Flame,
  Shield,
  Layers,
  ArrowRight,
  Filter,
  Info,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Plus,
  Download,
  Search,
  Grid3X3,
  GitCommit,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  TrendingDown,
  ArrowUpRight,
  Radio,
  Award,
  FileCheck2,
  Cpu,
  Building2
} from 'lucide-react';

export const RiskMapModule: React.FC = () => {
  const {
    risks,
    currentTenant,
    setActiveModule,
    masEnterpriseRiskProfile,
    autoMapTechnologyRisks,
    mapRiskToMasRequirement
  } = useGRC();
  const tenantRisks = risks.filter(r => r.tenantId === currentTenant?.id);

  // State Management
  const [viewType, setViewType] = useState<'residual' | 'inherent' | 'comparison'>('residual');
  const [dashboardTab, setDashboardTab] = useState<'heatmap' | 'vectors' | 'harmonizer' | 'telemetry' | 'register'>('heatmap');
  const [showMasOverlay, setShowMasOverlay] = useState<boolean>(true);
  const [mappingToast, setMappingToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const handleAutoMapTechRisks = () => {
    const result = autoMapTechnologyRisks({ minConfidence: 40 });
    if (result.newlyMappedCount > 0) {
      setMappingToast({
        message: `Successfully mapped ${result.newlyMappedCount} Technology Risk(s) to MAS TRM requirement IDs! Heatmap exposure metrics updated.`,
        type: 'success'
      });
    } else {
      setMappingToast({
        message: `All ${masEnterpriseRiskProfile.mappedToMasCount} Technology Risks are already mapped to MAS TRM requirements.`,
        type: 'info'
      });
    }
    setTimeout(() => setMappingToast(null), 5000);
  };
  
  // Drilldown & Filter States
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ likelihood: number; impact: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [treatmentFilter, setTreatmentFilter] = useState<string>('all');
  const [acceptanceFilter, setAcceptanceFilter] = useState<string>('all');
  const [masFilter, setMasFilter] = useState<'all' | 'mas_only' | string>('all');

  // Modal States
  const [selectedRiskForModal, setSelectedRiskForModal] = useState<RiskRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isNewRiskModalOpen, setIsNewRiskModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Filtered Risks Computation
  const filteredRisks = useMemo(() => {
    return tenantRisks.filter(r => {
      // Category filter
      if (selectedCategory && r.category !== selectedCategory) return false;
      // Department filter
      if (selectedDepartment && r.department !== selectedDepartment) return false;
      // Treatment filter
      if (treatmentFilter !== 'all' && r.treatmentOption !== treatmentFilter) return false;
      // Acceptance filter
      if (acceptanceFilter === 'Accepted' && r.executiveAcceptance?.status !== 'Accepted') return false;
      if (acceptanceFilter === 'Pending' && r.executiveAcceptance?.status !== 'Pending Review') return false;
      // MAS TRM Filter
      if (masFilter === 'mas_only') {
        const hasReqs = (r.frameworkMappings?.masTrmRequirementIds?.length || 0) > 0;
        const hasSecs = (r.frameworkMappings?.masTrmSections?.length || 0) > 0;
        if (!hasReqs && !hasSecs) return false;
      } else if (masFilter !== 'all') {
        const matchReq = r.frameworkMappings?.masTrmRequirementIds?.some(id => id.toLowerCase().includes(masFilter.toLowerCase()));
        const matchSec = r.frameworkMappings?.masTrmSections?.some(sec => sec.toLowerCase().includes(masFilter.toLowerCase()));
        if (!matchReq && !matchSec) return false;
      }
      // Cell filter (Likelihood x Impact)
      if (selectedCell) {
        const l = viewType === 'inherent' ? r.likelihood : r.residualLikelihood;
        const i = viewType === 'inherent' ? r.impact : r.residualImpact;
        if (l !== selectedCell.likelihood || i !== selectedCell.impact) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = r.title.toLowerCase().includes(q);
        const matchCode = r.riskCode.toLowerCase().includes(q);
        const matchThreat = r.threatDescription.toLowerCase().includes(q);
        const matchOwner = r.treatmentOwner.toLowerCase().includes(q);
        const matchControls = r.frameworkMappings?.iso27001Controls?.some(c => c.toLowerCase().includes(q));
        const matchMasReqs = r.frameworkMappings?.masTrmRequirementIds?.some(id => id.toLowerCase().includes(q));
        if (!matchTitle && !matchCode && !matchThreat && !matchOwner && !matchControls && !matchMasReqs) return false;
      }
      return true;
    });
  }, [tenantRisks, selectedCategory, selectedDepartment, treatmentFilter, acceptanceFilter, masFilter, selectedCell, searchQuery, viewType]);

  const handleOpenRiskDetail = (risk: RiskRecord) => {
    setSelectedRiskForModal(risk);
    setIsDetailModalOpen(true);
  };

  return (
    <PageContainer id="risk-map-module">
      {/* 1. Header Banner with View Controls */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/40 border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 px-2.5 py-0.5 rounded-lg bg-rose-950 border border-rose-800 flex items-center space-x-1">
                <Flame className="w-3.5 h-3.5" />
                <span>Dynamic D3 Risk Matrix</span>
              </span>
              <span className="text-xs text-slate-400">
                {tenantRisks.length} Total Enterprise Risks
              </span>
              {currentTenant && (
                <span className="text-xs text-sky-400 font-medium">
                  • {currentTenant.name}
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-white mt-1">
              Risk Heatmap & ISO 27005 / MAS TRM Threat Distribution
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Interactive D3.js visualization plotting risks across Probability (Likelihood 1-5) and Severity (Impact 1-5).
              Harmonize controls across <strong className="text-sky-300">ISO 27001:2022</strong>, <strong className="text-purple-300">ISO 42001:2023</strong>, and <strong className="text-emerald-300">MAS TRM 2021</strong> with real-time CCM telemetry and formal Clause 6.1.3 Executive Acceptance.
            </p>
          </div>

          {/* Action Buttons: Add Risk & Export */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Export Report</span>
            </button>
            <button
              onClick={() => setIsNewRiskModalOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-950 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Risk Record</span>
            </button>
          </div>
        </div>

        {/* View Switchers & Controls Sub-bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* Main Visualizer Tabs */}
          <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800 flex-wrap gap-y-1">
            <button
              onClick={() => setDashboardTab('heatmap')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dashboardTab === 'heatmap'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>5x5 Heatmap Matrix</span>
            </button>
            <button
              onClick={() => setDashboardTab('vectors')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dashboardTab === 'vectors'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Mitigation Vectors</span>
            </button>
            <button
              onClick={() => setDashboardTab('harmonizer')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dashboardTab === 'harmonizer'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Tri-Framework Harmonizer</span>
            </button>
            <button
              onClick={() => setDashboardTab('telemetry')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dashboardTab === 'telemetry'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-rose-300" />
              <span>Live Telemetry (CCM)</span>
            </button>
            <button
              onClick={() => setDashboardTab('register')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dashboardTab === 'register'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Risk Register ({filteredRisks.length})</span>
            </button>
          </div>

          {/* Inherent vs Residual vs Comparison Toggle */}
          {dashboardTab === 'heatmap' && (
            <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
              <button
                onClick={() => {
                  setViewType('residual');
                  setSelectedCell(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  viewType === 'residual'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Residual Risk (Controlled)
              </button>
              <button
                onClick={() => {
                  setViewType('inherent');
                  setSelectedCell(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  viewType === 'inherent'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Inherent Risk (Raw Threat)
              </button>
              <button
                onClick={() => {
                  setViewType('comparison');
                  setSelectedCell(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  viewType === 'comparison'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Vector Paths
              </button>
              <div className="h-4 w-px bg-slate-800 mx-1" />
              <button
                onClick={() => setShowMasOverlay(!showMasOverlay)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  showMasOverlay
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Toggle MAS TRM Exposure Metrics overlay badges on heatmap matrix"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>MAS Overlay: {showMasOverlay ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Key Risk Indicators & Summary Metrics */}
      <RiskMetricsHeader
        risks={tenantRisks}
        onFilterCritical={() => {
          setSelectedCell(null);
          setSelectedCategory(null);
          setTreatmentFilter('all');
        }}
        onFilterAppetite={() => {
          setViewType('residual');
        }}
        onFilterEscalated={() => {
          setSearchQuery('Super Admin');
        }}
        onNavigateTab={(tab) => setDashboardTab(tab as any)}
      />

      {/* 3. Search & Quick Filters Bar (Only shown on heatmap, vectors, and register) */}
      {(dashboardTab === 'heatmap' || dashboardTab === 'vectors' || dashboardTab === 'register') && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 w-full md:w-auto flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search risk by title, RSK code, threat, owner, or control (e.g. A.5.15)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-white underline shrink-0"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto justify-end flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 font-semibold">Treatment Strategy:</span>
              <select
                value={treatmentFilter}
                onChange={(e) => setTreatmentFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="all">All Strategies</option>
                <option value="Mitigate">Mitigate</option>
                <option value="Transfer">Transfer</option>
                <option value="Avoid">Avoid</option>
                <option value="Accept">Accept</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400 font-semibold">Clause 6.1.3:</span>
              <select
                value={acceptanceFilter}
                onChange={(e) => setAcceptanceFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="all">All Acceptance States</option>
                <option value="Accepted">Executive Accepted</option>
                <option value="Pending">Pending Review</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400 font-semibold">MAS TRM Mappings:</span>
              <select
                value={masFilter}
                onChange={(e) => setMasFilter(e.target.value)}
                className="bg-slate-950 border border-indigo-700/60 rounded-xl px-2.5 py-1.5 text-xs text-indigo-200 focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="all">All Risk Frameworks</option>
                <option value="mas_only">MAS TRM Mapped Only ({masEnterpriseRiskProfile.mappedToMasCount})</option>
                <option value="REQ-MAS-8">Domain 8.0: Access Control (Notice 655)</option>
                <option value="REQ-MAS-9">Domain 9.0: Cryptography & Keys</option>
                <option value="REQ-MAS-10">Domain 10.0: Network & Perimeter</option>
                <option value="REQ-MAS-12">Domain 12.0: Cyber Ops (Notice 644)</option>
                <option value="REQ-MAS-13">Domain 13.0: Framework & Governance</option>
                <option value="REQ-MAS-14">Domain 14.0: Third-Party & Cloud</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* MAS TRM Risk Exposure & Supervisory Metrics Ribbon */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950/30 to-slate-950 border border-indigo-900/40 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-300">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                MAS TRM Technology Risk Exposure Engine
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                masEnterpriseRiskProfile.exposureTier === 'CRITICAL_EXPOSURE' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                masEnterpriseRiskProfile.exposureTier === 'HIGH_EXPOSURE' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {masEnterpriseRiskProfile.exposureTier.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mt-0.5">
              {masEnterpriseRiskProfile.mappedToMasCount} of {tenantRisks.length} enterprise technology risks mapped to statutory requirement IDs.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 flex-wrap gap-2">
          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 block">Enterprise Exposure</span>
            <span className="text-sm font-bold text-orange-400">{masEnterpriseRiskProfile.overallExposureScore} / 100</span>
          </div>
          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 block">Top Exposed Domain</span>
            <span className="text-sm font-bold text-rose-400">Domain {masEnterpriseRiskProfile.topExposedDomain || '8.0'}</span>
          </div>
          <button
            onClick={handleAutoMapTechRisks}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Auto-map technology risks to MAS TRM requirement IDs using intelligent heuristics"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Auto-Map Tech Risks</span>
          </button>
          <button
            onClick={() => setActiveModule('mas_checklist')}
            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-indigo-950 transition-colors cursor-pointer"
          >
            <span>Launch MAS TRM Heatmap</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Auto-Mapping Notification Banner */}
      {mappingToast && (
        <div className={`p-3 rounded-xl border flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-2 duration-200 ${
          mappingToast.type === 'success'
            ? 'bg-emerald-950/90 border-emerald-700 text-emerald-200'
            : 'bg-indigo-950/90 border-indigo-700 text-indigo-200'
        }`}>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{mappingToast.message}</span>
          </div>
          <button
            onClick={() => setMappingToast(null)}
            className="text-slate-400 hover:text-white text-xs ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* 4. Primary Visualization & Drilldown Grid */}
      {dashboardTab === 'heatmap' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Interactive D3 5x5 Heatmap Matrix (7 Cols) */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  {viewType === 'residual'
                    ? 'Residual Risk Heatmap (Post-Control)'
                    : viewType === 'inherent'
                    ? 'Inherent Raw Risk Heatmap'
                    : 'Inherent → Residual Vector Transition Heatmap'}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                {showMasOverlay && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                    MAS Exposure Active
                  </span>
                )}
                <span className="text-[11px] text-slate-400">
                  {filteredRisks.length} risks displayed
                </span>
              </div>
            </div>

            {/* D3 Heatmap Component */}
            <D3RiskHeatmapChart
              risks={tenantRisks}
              viewType={viewType}
              selectedCategory={selectedCategory}
              selectedDepartment={selectedDepartment}
              selectedCell={selectedCell}
              onSelectCell={setSelectedCell}
              onSelectRisk={handleOpenRiskDetail}
              selectedMasRequirement={masFilter !== 'all' && masFilter !== 'mas_only' ? masFilter : null}
              highlightMasMapped={masFilter === 'mas_only'}
              showMasExposureOverlay={showMasOverlay}
            />

            {/* Active Cell / Drilldown Filter Notice */}
            {selectedCell && (
              <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-sky-400" />
                  <span className="text-slate-300">
                    Filtered by Likelihood: <strong className="text-white">{selectedCell.likelihood}</strong>, Impact: <strong className="text-white">{selectedCell.impact}</strong>
                  </span>
                </div>
                <button
                  onClick={() => setSelectedCell(null)}
                  className="text-sky-400 hover:text-white font-semibold underline"
                >
                  Clear Cell Filter
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Category & Department Drilldown (5 Cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Category & Department Drilldown
                </h3>
              </div>
              {(selectedCategory || selectedDepartment) && (
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedDepartment(null);
                  }}
                  className="text-xs text-sky-400 hover:underline font-semibold"
                >
                  Reset Filters
                </button>
              )}
            </div>

            <RiskCategoryDrilldown
              risks={filteredRisks}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedDepartment={selectedDepartment}
              onSelectDepartment={setSelectedDepartment}
              onSelectRisk={handleOpenRiskDetail}
            />
          </div>
        </div>
      )}

      {/* 5. Mitigation Vectors Tab */}
      {dashboardTab === 'vectors' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GitCommit className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Residual Risk Mitigation Velocity Vectors
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Inherent (Red) → Residual (Green) Displacement
              </span>
            </div>

            <RiskVectorShiftChart
              risks={filteredRisks}
              onSelectRisk={handleOpenRiskDetail}
            />
          </div>

          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Category Distribution
                </h3>
              </div>
            </div>

            <RiskCategoryDrilldown
              risks={filteredRisks}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedDepartment={selectedDepartment}
              onSelectDepartment={setSelectedDepartment}
              onSelectRisk={handleOpenRiskDetail}
            />
          </div>
        </div>
      )}

      {/* 6. Tri-Framework Crosswalk Harmonizer Tab */}
      {dashboardTab === 'harmonizer' && (
        <MultiFrameworkHarmonizer
          risks={tenantRisks}
          onSelectRisk={handleOpenRiskDetail}
        />
      )}

      {/* 7. Live Continuous Control Telemetry Tab */}
      {dashboardTab === 'telemetry' && (
        <LiveTelemetryFeed
          risks={tenantRisks}
          onSelectRisk={handleOpenRiskDetail}
        />
      )}

      {/* 8. Filtered Risks Table / Register View */}
      {dashboardTab === 'register' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Enterprise Risk Register & Clause 6.1.3 Ledger</h3>
              <p className="text-xs text-slate-400">
                {filteredRisks.length} risks matching active criteria
              </p>
            </div>
            {(selectedCategory || selectedDepartment || selectedCell || acceptanceFilter !== 'all') && (
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedDepartment(null);
                  setSelectedCell(null);
                  setAcceptanceFilter('all');
                }}
                className="text-xs font-semibold text-sky-400 hover:underline"
              >
                Reset All Drilldowns
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Code</th>
                  <th className="py-3 px-3">Risk Title & Threat Scenario</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Inherent (L×I)</th>
                  <th className="py-3 px-3">Residual (L×I)</th>
                  <th className="py-3 px-3">Clause 6.1.3</th>
                  <th className="py-3 px-3">Frameworks & CCM</th>
                  <th className="py-3 px-3">Owner</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredRisks.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-500">
                      No risks found matching current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRisks.map(r => {
                    const isAccepted = r.executiveAcceptance?.status === 'Accepted';
                    const hasActiveTelemetry = (r.telemetrySignals || []).some(s => s.active);
                    const isoControls = r.frameworkMappings?.iso27001Controls || [];

                    return (
                      <tr key={r.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-sky-400 whitespace-nowrap">
                          {r.riskCode}
                        </td>
                        <td className="py-3 px-3 max-w-xs">
                          <div className="font-semibold text-white">{r.title}</div>
                          <div className="text-[11px] text-slate-400 truncate">{r.threatDescription}</div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300 border border-slate-700">
                            {r.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-mono font-bold text-rose-400">
                            {r.inherentScore} (L{r.likelihood}×I{r.impact})
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-mono font-bold text-emerald-400">
                            {r.residualScore} (L{r.residualLikelihood}×I{r.residualImpact})
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {isAccepted ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1 w-fit">
                              <Award className="w-3 h-3" />
                              <span>Accepted</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500">
                              {r.treatmentOption}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                            {isoControls.length > 0 && (
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800" title="ISO 27001 Control">
                                {isoControls[0]}
                              </span>
                            )}
                            {(r.frameworkMappings?.masTrmRequirementIds || []).slice(0, 2).map(reqId => (
                              <span key={reqId} className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800" title={`Mapped MAS TRM Requirement: ${reqId}`}>
                                {reqId}
                              </span>
                            ))}
                            {hasActiveTelemetry && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">
                                Live Alert
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-[11px] text-slate-400">
                          {r.treatmentOwner}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleOpenRiskDetail(r)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 font-semibold text-xs border border-slate-700 transition-colors"
                          >
                            View / Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. Modals */}
      <RiskDetailModal
        risk={selectedRiskForModal}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedRiskForModal(null);
        }}
      />

      <NewRiskModal
        isOpen={isNewRiskModalOpen}
        onClose={() => setIsNewRiskModalOpen(false)}
        defaultLikelihood={selectedCell?.likelihood || 3}
        defaultImpact={selectedCell?.impact || 3}
      />

      <RiskExportModal
        risks={tenantRisks}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        selectedCategory={selectedCategory}
      />
    </PageContainer>
  );
};
