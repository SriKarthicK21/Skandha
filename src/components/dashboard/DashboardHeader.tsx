import React from 'react';
import { useGRC } from '../../context/GRCContext';
import { organizationService } from '../../services/organizationService';
import {
  Sparkles,
  Download,
  SlidersHorizontal,
  Calendar,
  ChevronDown,
  Activity,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ClipboardCheck,
  Compass,
  Eye,
  Grid,
  AlertTriangle,
  Minimize2
} from 'lucide-react';

interface DashboardHeaderProps {
  viewMode: 'executive' | 'realtime' | 'operational' | 'heatmap';
  onViewModeChange: (mode: 'executive' | 'realtime' | 'operational' | 'heatmap') => void;
  density?: 'compact' | 'expanded';
  onDensityChange?: (density: 'compact' | 'expanded') => void;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  onOpenAiCopilot: () => void;
  onExportReport: () => void;
  onCustomize: () => void;
  onOpenWelcomeGuide?: () => void;
  onOpenAlertThresholds?: () => void;
  criticalThreshold?: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  viewMode,
  onViewModeChange,
  density = 'expanded',
  onDensityChange,
  timeRange,
  onTimeRangeChange,
  onOpenAiCopilot,
  onExportReport,
  onCustomize,
  onOpenWelcomeGuide,
  onOpenAlertThresholds,
  criticalThreshold = 85
}) => {
  const { currentTenant, activeModule, setActiveModule, theme } = useGRC();
  const [timeDropdownOpen, setTimeDropdownOpen] = React.useState(false);

  const timeRanges = [
    { id: 'Q3 2026', label: 'Q3 2026 (Current Period)' },
    { id: 'This Month', label: 'This Month' },
    { id: 'Year to Date', label: 'Year to Date (2026)' },
    { id: 'Pre-Audit Window', label: 'Pre-Audit 30-Day Window' }
  ];

  return (
    <div id="dashboard-header" className={`flex flex-col xl:flex-row xl:items-center justify-between gap-3 pb-3 border-b transition-colors ${
      theme === 'light' ? 'border-slate-200' : 'border-[#1B2639]'
    }`}>
      {/* Title & Organization Context Metadata Hierarchy */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 min-w-0">
        <h1 className={`text-xl sm:text-2xl font-bold tracking-tight whitespace-nowrap ${
          theme === 'light' ? 'text-slate-900' : 'text-[#FFFFFF]'
        }`}>
          Command Center
        </h1>

        <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border shrink-0 ${
          theme === 'light'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Telemetry</span>
        </span>

        <span className={`hidden sm:inline text-xs ${theme === 'light' ? 'text-slate-300' : 'text-[#243047]'}`}>•</span>

        <span className={`text-xs font-semibold truncate ${
          theme === 'light' ? 'text-slate-700' : 'text-[#CBD5E1]'
        }`}>
          {organizationService.getOrganizationName(currentTenant)}
        </span>

        <span className={`hidden sm:inline text-xs ${theme === 'light' ? 'text-slate-300' : 'text-[#243047]'}`}>•</span>

        <span className={`text-xs flex items-center space-x-1 shrink-0 ${
          theme === 'light' ? 'text-slate-500 font-medium' : 'text-[#7F8BA3]'
        }`}>
          <RefreshCw className={`w-3 h-3 inline ${theme === 'light' ? 'text-slate-400' : 'text-[#7F8BA3]'}`} />
          <span>Updated 2m ago</span>
        </span>
      </div>

      {/* Structured Toolbar Hierarchy: View Modes, Density, Context & Actions */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {/* GROUP 1: Primary View Controls (Executive, Operational, Heatmap) */}
        <div className={`flex items-center h-9 p-0.5 rounded-lg border text-xs ${
          theme === 'light' ? 'bg-[#F1F5F9] border-[#E2E8F0]' : 'bg-[#0D1424] border-[#1B2639]'
        }`}>
          <button
            id="header-toggle-executive-view"
            type="button"
            onClick={() => onViewModeChange('executive')}
            className={`flex items-center space-x-1.5 h-full px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'executive'
                ? theme === 'light'
                  ? 'bg-white text-[#0F172A] border border-[#CBD5E1] shadow-xs font-bold'
                  : 'bg-[#1B2639] text-white shadow-xs'
                : theme === 'light'
                  ? 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-200/50'
                  : 'text-[#7F8BA3] hover:text-[#F8FAFC]'
            }`}
            title="Read-Only Executive Stakeholder View (PDF-Ready Summary)"
          >
            <Eye className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
            <span>Executive</span>
          </button>
          <button
            id="header-toggle-realtime-view"
            type="button"
            onClick={() => onViewModeChange('realtime')}
            className={`flex items-center space-x-1.5 h-full px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'realtime'
                ? theme === 'light'
                  ? 'bg-white text-[#0F172A] border border-[#CBD5E1] shadow-xs font-bold'
                  : 'bg-[#1B2639] text-white shadow-xs'
                : theme === 'light'
                  ? 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-200/50'
                  : 'text-[#7F8BA3] hover:text-[#F8FAFC]'
            }`}
            title="Real-Time Enterprise Continuous Controls Monitoring (CCM) & Live Telemetry Stream"
          >
            <Activity className="w-3.5 h-3.5 text-[#059669] shrink-0" />
            <span>Real-Time CCM</span>
          </button>
          <button
            id="header-toggle-operational-view"
            type="button"
            onClick={() => onViewModeChange('operational')}
            className={`flex items-center space-x-1.5 h-full px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'operational'
                ? theme === 'light'
                  ? 'bg-white text-[#0F172A] border border-[#CBD5E1] shadow-xs font-bold'
                  : 'bg-[#1B2639] text-white shadow-xs'
                : theme === 'light'
                  ? 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-200/50'
                  : 'text-[#7F8BA3] hover:text-[#F8FAFC]'
            }`}
            title="Operational Drag-and-Drop Task Workbench"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#475569] shrink-0" />
            <span>Operational</span>
          </button>
          <button
            id="header-toggle-heatmap-view"
            type="button"
            onClick={() => onViewModeChange('heatmap')}
            className={`flex items-center space-x-1.5 h-full px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'heatmap'
                ? theme === 'light'
                  ? 'bg-white text-[#0F172A] border border-[#CBD5E1] shadow-xs font-bold'
                  : 'bg-[#1B2639] text-white shadow-xs'
                : theme === 'light'
                  ? 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-200/50'
                  : 'text-[#7F8BA3] hover:text-[#F8FAFC]'
            }`}
            title="Interactive Compliance Heatmap: Department vs ISO vs MAS Risk Coverage"
          >
            <Grid className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
            <span>Heatmap</span>
          </button>
        </div>

        {/* GROUP 2: Display Density Controls (Expanded vs Compact) */}
        {onDensityChange && (
          <div
            id="dashboard-header-density-toggle-group"
            className={`flex items-center h-9 p-0.5 rounded-lg border transition-colors ${
              theme === 'light' ? 'bg-[#F1F5F9] border-[#E2E8F0]' : 'bg-[#0D1424] border-[#1B2639]'
            }`}
            title="Toggle View Density: Compact hides sparklines & trend indicators to maximize screen real estate, Expanded displays full telemetry"
          >
            <button
              id="header-toggle-density-expanded"
              type="button"
              onClick={() => onDensityChange('expanded')}
              className={`flex items-center space-x-1.5 h-full px-2.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                density === 'expanded'
                  ? theme === 'light'
                    ? 'bg-white text-[#0F172A] shadow-xs border border-[#CBD5E1] font-bold'
                    : 'bg-[#1B2639] text-white shadow-xs font-bold'
                  : theme === 'light'
                    ? 'text-[#475569] hover:text-[#0F172A]'
                    : 'text-[#7F8BA3] hover:text-[#F8FAFC]'
              }`}
              title="Expanded View: Display sparklines, velocity charts, and trend indicators"
            >
              <Activity className="w-3 h-3 text-[#059669] shrink-0" />
              <span className="hidden sm:inline">Expanded</span>
            </button>
            <button
              id="header-toggle-density-compact"
              type="button"
              onClick={() => onDensityChange('compact')}
              className={`flex items-center space-x-1.5 h-full px-2.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                density === 'compact'
                  ? theme === 'light'
                    ? 'bg-white text-[#0F172A] shadow-xs border border-[#CBD5E1] font-bold'
                    : 'bg-[#1B2639] text-white shadow-xs font-bold'
                  : theme === 'light'
                    ? 'text-[#475569] hover:text-[#0F172A]'
                    : 'text-[#7F8BA3] hover:text-[#F8FAFC]'
              }`}
              title="Compact View: Hide sparklines and trend indicators to conserve vertical screen space"
            >
              <Minimize2 className="w-3 h-3 text-[#2563EB] shrink-0" />
              <span className="hidden sm:inline">Compact</span>
            </button>
          </div>
        )}

        {/* GROUP 3: Context Controls & Utilities */}
        {/* Period Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setTimeDropdownOpen(!timeDropdownOpen)}
            className={`flex items-center space-x-1.5 h-9 px-3 rounded-lg border text-xs font-medium transition cursor-pointer ${
              theme === 'light'
                ? 'bg-white hover:bg-[#F8FAFC] text-[#0F172A] border-[#CBD5E1] shadow-xs'
                : 'bg-[#0D1424] hover:bg-[#111A2C] text-[#F8FAFC] border-[#1B2639]'
            }`}
          >
            <Calendar className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-[#475569]' : 'text-[#7F8BA3]'}`} />
            <span>{timeRange}</span>
            <ChevronDown className="w-3 h-3 text-[#64748B]" />
          </button>

          {timeDropdownOpen && (
            <div className={`absolute right-0 mt-1.5 w-48 rounded-xl border shadow-xl py-1 z-30 ${
              theme === 'light' ? 'bg-white border-[#E2E8F0] text-[#0F172A]' : 'bg-[#0D1424] border-[#1B2639] text-[#F8FAFC]'
            }`}>
              {timeRanges.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    onTimeRangeChange(t.id);
                    setTimeDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs transition cursor-pointer ${
                    timeRange === t.id
                      ? theme === 'light'
                        ? 'text-[#1D4ED8] font-bold bg-[#EFF6FF]'
                        : 'text-[#A78BFA] font-semibold bg-[#8B5CF6]/15'
                      : theme === 'light'
                        ? 'text-[#475569] hover:bg-[#F8FAFC]'
                        : 'text-[#A7B0C0] hover:bg-[#111A2C]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Welcome Guide Action */}
        {onOpenWelcomeGuide && (
          <button
            id="dashboard-header-welcome-guide-btn"
            type="button"
            onClick={onOpenWelcomeGuide}
            className={`flex items-center space-x-1.5 h-9 px-3 rounded-lg border text-xs font-medium transition cursor-pointer ${
              theme === 'light'
                ? 'bg-white hover:bg-[#F8FAFC] text-[#0F172A] border-[#CBD5E1] shadow-xs'
                : 'bg-[#0D1424] hover:bg-[#111A2C] text-[#A78BFA] hover:text-[#FFFFFF] border border-[#8B5CF6]/30 hover:border-[#8B5CF6]/60'
            }`}
            title="First-Time Welcome Guide & Core Modules Spotlight"
          >
            <Compass className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-[#2563EB]' : 'text-[#A78BFA]'}`} />
            <span className="hidden md:inline">Guide</span>
          </button>
        )}

        {/* Export Action */}
        <button
          id="dashboard-header-export-btn"
          type="button"
          onClick={onExportReport}
          className={`flex items-center space-x-1.5 h-9 px-3 rounded-lg border text-xs font-medium transition cursor-pointer ${
            theme === 'light'
              ? 'bg-white hover:bg-[#F8FAFC] text-[#0F172A] border-[#CBD5E1] shadow-xs'
              : 'bg-[#0D1424] hover:bg-[#111A2C] text-[#A7B0C0] hover:text-[#FFFFFF] border-[#1B2639]'
          }`}
          title="Export Board-Ready Compliance Report"
        >
          <Download className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-[#475569]' : 'text-[#7F8BA3]'}`} />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Visual Alert Thresholds Action */}
        {onOpenAlertThresholds && (
          <button
            id="dashboard-header-alert-thresholds-btn"
            type="button"
            onClick={onOpenAlertThresholds}
            className={`flex items-center space-x-1.5 h-9 px-2.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
              theme === 'light'
                ? 'bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border-[#FECACA] shadow-xs'
                : 'bg-rose-950/40 hover:bg-rose-950/80 text-rose-300 border-rose-500/40'
            }`}
            title={`Configure Executive KPI Visual Alert Thresholds (Current: < ${criticalThreshold}%)`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
            <span className="hidden lg:inline">Alerts</span>
            <span className="font-mono text-[11px] font-bold text-[#DC2626]">&lt;{criticalThreshold}%</span>
          </button>
        )}

        {/* Ask AI Consultant Quick Launch */}
        <button
          id="dashboard-header-ai-btn"
          type="button"
          onClick={onOpenAiCopilot}
          className={`flex items-center space-x-1.5 h-9 px-3 rounded-lg text-xs font-semibold shadow-xs transition border cursor-pointer ${
            theme === 'light'
              ? 'bg-[#0F2747] hover:bg-[#173A63] text-white border-[#0F2747]'
              : 'bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 text-[#A78BFA] border-[#8B5CF6]/40'
          }`}
          title="Open SKANDA AI Chief GRC Consultant"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>

        {/* Customize Layout Action */}
        <button
          id="dashboard-header-customize-btn"
          type="button"
          onClick={onCustomize}
          className={`flex items-center justify-center h-9 w-9 rounded-lg border text-xs transition cursor-pointer shrink-0 ${
            theme === 'light'
              ? 'bg-white hover:bg-[#F8FAFC] text-[#475569] hover:text-[#0F172A] border-[#CBD5E1] shadow-xs'
              : 'bg-[#0D1424] hover:bg-[#111A2C] text-[#7F8BA3] hover:text-[#F8FAFC] border-[#1B2639]'
          }`}
          title="Customize Dashboard Layout"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
