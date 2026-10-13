// ============================================================================
// SKANDA ENTERPRISE GRC: ISO 27001 CONTROL DRILL-DOWN DETAIL VIEW
// File: src/components/compliance/ISO27001ControlDrillDownDetailView.tsx
//
// Enterprise drill-down component pulling specific ISO 27001 control data from
// the PostgreSQL database, displaying an authoritative breakdown of
// 'Verified', 'Remediating', and 'Failed' status counts across framework,
// theme/domain, and specific control verification criteria.
// ============================================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Database,
  RefreshCw,
  Copy,
  Check,
  Search,
  ChevronDown,
  Layers,
  FileCheck,
  GitFork,
  ExternalLink,
  Code2,
  Calendar,
  Lock,
  Building,
  Activity,
  Sliders,
  Sparkles,
  X,
  FileText,
  AlertOctagon,
  TrendingUp,
  BarChart2,
  ListFilter,
  CheckSquare
} from 'lucide-react';
import { ISO27001_2022_93_MASTER } from '../../data/iso27001_2022_masterControls';
import {
  Iso27001BreakdownService,
  SpecificControlDetailResponse,
  VerificationChecklistItem
} from '../../services/iso27001BreakdownService';

export interface ISO27001ControlDrillDownDetailViewProps {
  initialControlCode?: string;
  tenantId?: string;
  theme?: 'dark' | 'light' | 'midnight' | string;
  onNavigateToLineage?: (controlCode: string) => void;
  onNavigateToModule?: (moduleId: string) => void;
  onClose?: () => void;
  onControlStatusChanged?: (controlCode: string, newStatus: 'Verified' | 'Remediating' | 'Failed') => void;
  standalone?: boolean;
}

export const ISO27001ControlDrillDownDetailView: React.FC<ISO27001ControlDrillDownDetailViewProps> = ({
  initialControlCode = 'A.8.10',
  tenantId = 'tenant_skanda',
  theme = 'dark',
  onNavigateToLineage,
  onNavigateToModule,
  onClose,
  onControlStatusChanged,
  standalone = false
}) => {
  const isLight = theme === 'light';

  // Active control state
  const [selectedControlCode, setSelectedControlCode] = useState<string>(initialControlCode);
  const [controlData, setControlData] = useState<SpecificControlDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter state for verification checklist
  const [checklistFilter, setChecklistFilter] = useState<'ALL' | 'Verified' | 'Remediating' | 'Failed'>('ALL');

  // Sub-tabs within detail view
  const [activeTab, setActiveTab] = useState<'checklist' | 'evidence' | 'sql' | 'auditor'>('checklist');

  // Control search dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Copy feedbacks
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // Auditor update form state
  const [auditorStatusOverride, setAuditorStatusOverride] = useState<'Verified' | 'Remediating' | 'Failed'>('Verified');
  const [auditorEffectiveness, setAuditorEffectiveness] = useState<'Effective' | 'Operating — Minor Gap' | 'Ineffective' | 'Not Tested'>('Effective');
  const [auditorNoteText, setAuditorNoteText] = useState<string>('');
  const [isSubmittingOverride, setIsSubmittingOverride] = useState<boolean>(false);
  const [overrideSuccessMsg, setOverrideSuccessMsg] = useState<string | null>(null);

  // Fetch specific control detail from PostgreSQL
  const loadControlDetail = useCallback(async (code: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await Iso27001BreakdownService.fetchControlDetail(code, tenantId);
      setControlData(data);
      setAuditorStatusOverride(data.control.breakdownStatus);
      setAuditorEffectiveness(data.control.effectiveness);
      setAuditorNoteText(data.control.latestAuditNote || '');
    } catch (err: any) {
      console.error('[ISO27001ControlDrillDown] Error loading control:', err);
      setErrorMessage(err?.message || 'Failed to retrieve control from PostgreSQL relational engine');
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadControlDetail(selectedControlCode);
  }, [selectedControlCode, loadControlDetail]);

  // Sync with initialControlCode prop if changed externally
  useEffect(() => {
    if (initialControlCode && initialControlCode !== selectedControlCode) {
      setSelectedControlCode(initialControlCode);
    }
  }, [initialControlCode]);

  // Handle control switch from dropdown or related list
  const handleSelectControl = (code: string) => {
    setSelectedControlCode(code);
    setIsDropdownOpen(false);
    setSearchQuery('');
    setOverrideSuccessMsg(null);
  };

  // Copy helper
  const handleCopy = (text: string, type: 'hash' | 'sql', hashId?: string) => {
    navigator.clipboard.writeText(text);
    if (type === 'hash' && hashId) {
      setCopiedHash(hashId);
      setTimeout(() => setCopiedHash(null), 2500);
    } else if (type === 'sql') {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    }
  };

  // Submit Auditor Status Override to PostgreSQL
  const handleSubmitAuditorUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!controlData) return;

    setIsSubmittingOverride(true);
    setOverrideSuccessMsg(null);
    try {
      const res = await Iso27001BreakdownService.updateControlStatus(
        controlData.control.controlCode,
        {
          breakdownStatus: auditorStatusOverride,
          effectiveness: auditorEffectiveness,
          auditorNote: auditorNoteText,
          implementationStatus: auditorStatusOverride === 'Verified' ? 'Implemented' : 'In Progress'
        },
        tenantId
      );

      if (res && res.success !== false) {
        setOverrideSuccessMsg(`Control ${controlData.control.controlCode} successfully updated in PostgreSQL database.`);
        if (onControlStatusChanged) {
          onControlStatusChanged(controlData.control.controlCode, auditorStatusOverride);
        }
        // Refresh detail view
        await loadControlDetail(controlData.control.controlCode);
      } else {
        setErrorMessage('Failed to persist status override to PostgreSQL.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error executing database update statement.');
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  // Filter master controls list for search dropdown
  const filteredMasterControls = useMemo(() => {
    if (!searchQuery.trim()) return ISO27001_2022_93_MASTER;
    const q = searchQuery.toLowerCase();
    return ISO27001_2022_93_MASTER.filter(
      c => c.controlCode.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.theme.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filtered verification checklist items
  const filteredChecklist = useMemo(() => {
    if (!controlData) return [];
    if (checklistFilter === 'ALL') return controlData.breakdownCounts.verificationChecklist;
    return controlData.breakdownCounts.verificationChecklist.filter(c => c.status === checklistFilter);
  }, [controlData, checklistFilter]);

  return (
    <div
      id="iso27001-control-drilldown-view"
      className={`w-full flex flex-col rounded-xl overflow-hidden border transition-colors ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
          : 'bg-[#0B1320] border-[#1E293B] text-slate-100 shadow-2xl'
      } ${standalone ? 'min-h-[700px] p-6' : 'h-full p-4'}`}
    >
      {/* 1. Header Toolbar & Control Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-[#1E293B]">
        {/* Control Selector Combobox */}
        <div className="relative flex-1 min-w-[280px] max-w-xl">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Target ISO/IEC 27001:2022 Control (PostgreSQL Master Catalog)
          </label>
          <div className="relative">
            <button
              type="button"
              id="control-drilldown-selector-btn"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full px-3.5 py-2 rounded-lg border text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                isLight
                  ? 'bg-slate-50 border-slate-300 hover:border-indigo-500 text-slate-900'
                  : 'bg-[#131F33] border-[#22334F] hover:border-indigo-500 text-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  {controlData ? controlData.control.controlCode : selectedControlCode}
                </span>
                <span className="truncate">
                  {controlData ? controlData.control.title : 'Loading control...'}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform text-slate-400 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                id="control-search-dropdown-menu"
                className={`absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border shadow-2xl max-h-80 flex flex-col overflow-hidden ${
                  isLight ? 'bg-white border-slate-300' : 'bg-[#101A2C] border-[#243654]'
                }`}
              >
                <div className="p-2 border-b border-slate-200 dark:border-[#1E293B]">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      id="control-search-input"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search by code (e.g. A.8.10) or title..."
                      className={`w-full pl-8 pr-3 py-1.5 rounded-md text-xs border outline-none ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                          : 'bg-[#0B1320] border-[#22334F] text-slate-100 focus:border-indigo-500'
                      }`}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="overflow-y-auto flex-1 p-1 space-y-0.5 text-xs">
                  {filteredMasterControls.map(c => {
                    const isSelected = c.controlCode === selectedControlCode;
                    return (
                      <button
                        key={c.controlCode}
                        type="button"
                        onClick={() => handleSelectControl(c.controlCode)}
                        className={`w-full px-3 py-2 rounded-lg text-left flex items-center justify-between transition cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : isLight
                            ? 'hover:bg-slate-100 text-slate-800'
                            : 'hover:bg-[#1A263D] text-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[11px] ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-indigo-500/15 text-indigo-400'
                          }`}>
                            {c.controlCode}
                          </span>
                          <span className="truncate">{c.title}</span>
                        </div>
                        <span className={`text-[10px] ml-2 shrink-0 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {c.theme}
                        </span>
                      </button>
                    );
                  })}
                  {filteredMasterControls.length === 0 && (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      No controls found matching &quot;{searchQuery}&quot;
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Database Engine Status & Action Controls */}
        <div className="flex items-center space-x-2 self-end">
          {/* Database Telemetry Badge */}
          <div className={`px-3 py-1.5 rounded-lg border flex items-center space-x-2 text-[11px] font-mono ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-[#121E33] border-[#1E2E4A] text-slate-300'
          }`}>
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>PostgreSQL Relational</span>
            {controlData && (
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">
                {controlData.databaseTelemetry.queryLatencyMs}ms
              </span>
            )}
          </div>

          {/* Quick Lineage Explorer Link */}
          {onNavigateToLineage && (
            <button
              type="button"
              id="view-control-lineage-btn"
              onClick={() => onNavigateToLineage(selectedControlCode)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
              title="Inspect 4-hop lineage graph for this control"
            >
              <GitFork className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lineage Graph</span>
            </button>
          )}

          {/* Refresh from PostgreSQL */}
          <button
            type="button"
            id="refresh-control-detail-btn"
            onClick={() => loadControlDetail(selectedControlCode)}
            disabled={isLoading}
            className={`p-2 rounded-lg border transition cursor-pointer ${
              isLight
                ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
                : 'bg-[#121E33] border-[#1E2E4A] hover:bg-[#1A2B47] text-slate-300'
            }`}
            title="Refresh from PostgreSQL Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          {/* Close Modal / Drawer */}
          {onClose && (
            <button
              type="button"
              id="close-control-drilldown-btn"
              onClick={onClose}
              className={`p-2 rounded-lg transition cursor-pointer ${
                isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-[#1A263D] text-slate-400 hover:text-white'
              }`}
              title="Close drill-down view"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="my-3 p-3 rounded-lg border border-rose-500/40 bg-rose-950/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-slate-400 hover:text-white cursor-pointer ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && !controlData && (
        <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
          <div className="text-center">
            <p className="text-sm font-semibold">Executing PostgreSQL Relational Query...</p>
            <p className="text-xs text-slate-400 font-mono mt-1">
              SELECT FROM controls c LEFT JOIN evidence e LEFT JOIN findings f WHERE c.control_code = &apos;{selectedControlCode}&apos;
            </p>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      {controlData && (
        <div className="flex-1 overflow-y-auto mt-4 space-y-5 pr-1 text-xs">
          {/* 2. THE STATUS BREAKDOWN COUNTERS (Verified / Remediating / Failed) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  Authoritative ISO 27001 Status Breakdown (PostgreSQL Engine)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Framework Total: {controlData.breakdownCounts.framework.total} Controls (100%)
              </span>
            </div>

            {/* 3 Metric Cards: Verified vs Remediating vs Failed */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Verified Card */}
              <div className={`p-3.5 rounded-xl border transition ${
                isLight ? 'bg-emerald-50/70 border-emerald-200' : 'bg-emerald-950/20 border-emerald-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs text-emerald-400">Verified</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                    {controlData.breakdownCounts.framework.verifiedPercentage}%
                  </span>
                </div>
                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    {controlData.breakdownCounts.framework.verified}
                  </span>
                  <span className="text-[11px] text-slate-400">controls verified</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-snug">
                  Operational tests pass with validated SHA-256 evidence; zero open non-conformities.
                </p>
              </div>

              {/* Remediating Card */}
              <div className={`p-3.5 rounded-xl border transition ${
                isLight ? 'bg-amber-50/70 border-amber-200' : 'bg-amber-950/20 border-amber-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-xs text-amber-400">Remediating</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300">
                    {controlData.breakdownCounts.framework.remediatingPercentage}%
                  </span>
                </div>
                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="text-2xl font-bold font-mono text-amber-400">
                    {controlData.breakdownCounts.framework.remediating}
                  </span>
                  <span className="text-[11px] text-slate-400">controls in progress</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-snug">
                  Active CAPA ticket, draft telemetry or minor operating gap under remedial schedule.
                </p>
              </div>

              {/* Failed Card */}
              <div className={`p-3.5 rounded-xl border transition ${
                isLight ? 'bg-rose-50/70 border-rose-200' : 'bg-rose-950/20 border-rose-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span className="font-bold text-xs text-rose-400">Failed</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300">
                    {controlData.breakdownCounts.framework.failedPercentage}%
                  </span>
                </div>
                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="text-2xl font-bold font-mono text-rose-400">
                    {controlData.breakdownCounts.framework.failed}
                  </span>
                  <span className="text-[11px] text-slate-400">controls deficient</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-snug">
                  Audit non-conformity logged, missing mandatory evidence, or SLA expired.
                </p>
              </div>
            </div>

            {/* Proportional Segmented Progress Bar */}
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${controlData.breakdownCounts.framework.verifiedPercentage}%` }}
                className="bg-emerald-500 h-full transition-all duration-500"
                title={`Verified: ${controlData.breakdownCounts.framework.verified} (${controlData.breakdownCounts.framework.verifiedPercentage}%)`}
              />
              <div
                style={{ width: `${controlData.breakdownCounts.framework.remediatingPercentage}%` }}
                className="bg-amber-500 h-full transition-all duration-500"
                title={`Remediating: ${controlData.breakdownCounts.framework.remediating} (${controlData.breakdownCounts.framework.remediatingPercentage}%)`}
              />
              <div
                style={{ width: `${controlData.breakdownCounts.framework.failedPercentage}%` }}
                className="bg-rose-500 h-full transition-all duration-500"
                title={`Failed: ${controlData.breakdownCounts.framework.failed} (${controlData.breakdownCounts.framework.failedPercentage}%)`}
              />
            </div>

            {/* Category / Domain Context Strip */}
            <div className={`p-3 rounded-lg border flex flex-wrap items-center justify-between gap-2 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#101A2C] border-[#1C2C46]'
            }`}>
              <div className="flex items-center space-x-2">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-semibold text-slate-300">
                  Domain Context: <span className="text-white font-bold">{controlData.breakdownCounts.category.categoryName} Theme</span>
                </span>
                <span className="text-slate-400 text-[11px]">
                  ({controlData.breakdownCounts.category.total} Controls)
                </span>
              </div>

              <div className="flex items-center space-x-3 text-[11px] font-mono">
                <span className="text-emerald-400">
                  ● Verified: {controlData.breakdownCounts.category.verified}
                </span>
                <span className="text-amber-400">
                  ▲ Remediating: {controlData.breakdownCounts.category.remediating}
                </span>
                <span className="text-rose-400">
                  ■ Failed: {controlData.breakdownCounts.category.failed}
                </span>
                <span className="px-2 py-0.5 rounded font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {controlData.breakdownCounts.category.complianceScore}% Score
                </span>
              </div>
            </div>
          </div>

          {/* 3. ACTIVE SPECIFIC CONTROL HERO CARD */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            controlData.control.breakdownStatus === 'Verified'
              ? isLight ? 'bg-emerald-50/50 border-emerald-300' : 'bg-emerald-950/20 border-emerald-500/40'
              : controlData.control.breakdownStatus === 'Remediating'
              ? isLight ? 'bg-amber-50/50 border-amber-300' : 'bg-amber-950/20 border-amber-500/40'
              : isLight ? 'bg-rose-50/50 border-rose-300' : 'bg-rose-950/20 border-rose-500/40'
          }`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-md font-mono text-sm font-bold bg-black/40 border border-white/10 text-white">
                    {controlData.control.controlCode}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {controlData.control.category}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                    {controlData.control.controlType}
                  </span>
                  {controlData.control.isNewIn2022 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      New in 2022
                    </span>
                  )}
                  {controlData.control.iso2013Mapping && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      (2013: {controlData.control.iso2013Mapping})
                    </span>
                  )}
                </div>

                <h2 className="text-base font-bold text-white pt-1">
                  {controlData.control.title}
                </h2>
              </div>

              {/* Status Badge */}
              <div className={`px-3 py-1.5 rounded-lg border flex items-center space-x-2 font-bold ${
                controlData.control.breakdownStatus === 'Verified'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : controlData.control.breakdownStatus === 'Remediating'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}>
                {controlData.control.breakdownStatus === 'Verified' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {controlData.control.breakdownStatus === 'Remediating' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                {controlData.control.breakdownStatus === 'Failed' && <XCircle className="w-4 h-4 text-rose-400" />}
                <span className="text-xs uppercase tracking-wide">
                  {controlData.control.breakdownStatus}
                </span>
                <span className="text-[10px] font-mono opacity-80 pl-1 border-l border-current">
                  L{controlData.control.maturityLevel} Maturity
                </span>
              </div>
            </div>

            {/* Breakdown Reason */}
            <div className={`p-2.5 rounded-lg text-xs border ${
              isLight ? 'bg-white/80 border-slate-200 text-slate-700' : 'bg-black/30 border-white/5 text-slate-300'
            }`}>
              <span className="font-semibold text-white">Breakdown Rationale: </span>
              {controlData.control.breakdownReason}
            </div>

            {/* Control Requirement Description */}
            <div className={`p-3 rounded-lg border text-xs leading-relaxed ${
              isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-[#0E1726] border-[#1E2E48] text-slate-300'
            }`}>
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                ISO/IEC 27001:2022 Annex A Specification
              </span>
              {controlData.control.description}
            </div>

            {/* Operational Attributes Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className={`p-2 rounded-lg border ${
                isLight ? 'bg-slate-100/60 border-slate-200' : 'bg-[#121E33] border-[#1C2C46]'
              }`}>
                <span className="text-[10px] text-slate-400 block font-medium">Implementation Status</span>
                <span className="font-semibold text-white">{controlData.control.implementationStatus}</span>
              </div>
              <div className={`p-2 rounded-lg border ${
                isLight ? 'bg-slate-100/60 border-slate-200' : 'bg-[#121E33] border-[#1C2C46]'
              }`}>
                <span className="text-[10px] text-slate-400 block font-medium">Operating Effectiveness</span>
                <span className={`font-semibold ${
                  controlData.control.effectiveness === 'Effective'
                    ? 'text-emerald-400'
                    : controlData.control.effectiveness === 'Ineffective'
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }`}>
                  {controlData.control.effectiveness}
                </span>
              </div>
              <div className={`p-2 rounded-lg border ${
                isLight ? 'bg-slate-100/60 border-slate-200' : 'bg-[#121E33] border-[#1C2C46]'
              }`}>
                <span className="text-[10px] text-slate-400 block font-medium">Responsible Unit</span>
                <span className="font-semibold text-white truncate block">{controlData.control.responsibleDepartment}</span>
              </div>
              <div className={`p-2 rounded-lg border ${
                isLight ? 'bg-slate-100/60 border-slate-200' : 'bg-[#121E33] border-[#1C2C46]'
              }`}>
                <span className="text-[10px] text-slate-400 block font-medium">Collection SLA / Cadence</span>
                <span className="font-semibold text-white">
                  {controlData.control.evidenceCollectionSlaDays}d / {controlData.control.monitoringFrequency}
                </span>
              </div>
            </div>
          </div>

          {/* 4. TABS: Verification Criteria Checklist | Evidence & Findings | PostgreSQL Query Telemetry | Auditor Action */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-[#1E293B] pb-2">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  id="tab-verification-checklist-btn"
                  onClick={() => setActiveTab('checklist')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                    activeTab === 'checklist'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-[#152033] text-slate-400 hover:text-white'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Verification Criteria Breakdown</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-black/30">
                    {controlData.breakdownCounts.checklistCounts.total}
                  </span>
                </button>

                <button
                  type="button"
                  id="tab-evidence-findings-btn"
                  onClick={() => setActiveTab('evidence')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                    activeTab === 'evidence'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-[#152033] text-slate-400 hover:text-white'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Evidence &amp; Findings</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-black/30">
                    {controlData.control.evidenceCount} Evd / {controlData.control.openFindingCount} NC
                  </span>
                </button>

                <button
                  type="button"
                  id="tab-sql-telemetry-btn"
                  onClick={() => setActiveTab('sql')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                    activeTab === 'sql'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-[#152033] text-slate-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>PostgreSQL SQL Query</span>
                </button>

                <button
                  type="button"
                  id="tab-auditor-action-btn"
                  onClick={() => setActiveTab('auditor')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                    activeTab === 'auditor'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-[#152033] text-slate-400 hover:text-white'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Auditor Status Sign-Off</span>
                </button>
              </div>

              {/* Checklist Filter Controls (Only visible on checklist tab) */}
              {activeTab === 'checklist' && (
                <div className="flex items-center space-x-1 text-[11px]">
                  <span className="text-slate-400 mr-1 flex items-center">
                    <ListFilter className="w-3 h-3 mr-1" /> Filter:
                  </span>
                  {(['ALL', 'Verified', 'Remediating', 'Failed'] as const).map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setChecklistFilter(f)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                        checklistFilter === f
                          ? f === 'Verified' ? 'bg-emerald-600 text-white' :
                            f === 'Remediating' ? 'bg-amber-600 text-white' :
                            f === 'Failed' ? 'bg-rose-600 text-white' :
                            'bg-indigo-600 text-white'
                          : isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-[#131F33] text-slate-400 hover:text-white'
                      }`}
                    >
                      {f}
                      {f === 'ALL' && ` (${controlData.breakdownCounts.checklistCounts.total})`}
                      {f === 'Verified' && ` (${controlData.breakdownCounts.checklistCounts.verified})`}
                      {f === 'Remediating' && ` (${controlData.breakdownCounts.checklistCounts.remediating})`}
                      {f === 'Failed' && ` (${controlData.breakdownCounts.checklistCounts.failed})`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* TAB CONTENT 1: Specific Control Verification Checklist */}
            {activeTab === 'checklist' && (
              <div className="space-y-2.5">
                {filteredChecklist.map((item: VerificationChecklistItem) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                      item.status === 'Verified'
                        ? isLight ? 'bg-emerald-50/40 border-emerald-200' : 'bg-emerald-950/15 border-emerald-500/20'
                        : item.status === 'Remediating'
                        ? isLight ? 'bg-amber-50/40 border-amber-200' : 'bg-amber-950/15 border-amber-500/20'
                        : isLight ? 'bg-rose-50/40 border-rose-200' : 'bg-rose-950/15 border-rose-500/20'
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        {item.status === 'Verified' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                        {item.status === 'Remediating' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
                        {item.status === 'Failed' && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                        <h4 className="font-bold text-xs text-white">
                          {item.criterion}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed pl-6">
                        {item.details}
                      </p>
                      <div className="text-[11px] text-slate-400 pl-6 pt-1 flex items-center space-x-2 font-mono">
                        <span>Method: {item.auditorMethod}</span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-1 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'Verified'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : item.status === 'Remediating'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Audited: {item.lastChecked}
                      </span>
                    </div>
                  </div>
                ))}

                {filteredChecklist.length === 0 && (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No criteria items found with status &quot;{checklistFilter}&quot;.
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 2: Evidence & Findings */}
            {activeTab === 'evidence' && (
              <div className="space-y-4">
                {/* Evidence Section */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    <span>Cryptographic Evidence Artifacts ({controlData.control.evidenceItems.length})</span>
                  </h4>

                  <div className="space-y-2">
                    {controlData.control.evidenceItems.map(ev => (
                      <div
                        key={ev.id}
                        className={`p-3 rounded-lg border space-y-2 ${
                          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#101A2C] border-[#1C2C46]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-indigo-400" />
                            <span className="font-semibold text-white">{ev.title}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ev.status === 'Verified'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {ev.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                          <span>File: {ev.fileName}</span>
                          <span>Uploaded: {ev.uploadedDate}</span>
                        </div>

                        {/* SHA-256 Hash */}
                        <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-white/5 text-[11px] font-mono">
                          <div className="flex items-center space-x-2 truncate">
                            <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="text-slate-400">SHA-256:</span>
                            <span className="text-emerald-400 truncate">{ev.sha256Hash}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(ev.sha256Hash, 'hash', ev.id)}
                            className="ml-2 text-slate-400 hover:text-white transition cursor-pointer flex items-center space-x-1 shrink-0"
                            title="Copy SHA-256 Hash"
                          >
                            {copiedHash === ev.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span className="text-[10px]">{copiedHash === ev.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                    {controlData.control.evidenceItems.length === 0 && (
                      <div className="p-4 text-center rounded-lg border border-dashed border-slate-700 text-slate-400">
                        No evidence artifacts currently attached to this control.
                      </div>
                    )}
                  </div>
                </div>

                {/* Findings Section */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#1E293B]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                    <AlertOctagon className="w-4 h-4 text-rose-400" />
                    <span>Audit Non-Conformities &amp; CAPA Items ({controlData.control.findingItems.length})</span>
                  </h4>

                  <div className="space-y-2">
                    {controlData.control.findingItems.map(f => (
                      <div
                        key={f.id}
                        className="p-3 rounded-lg border border-rose-500/30 bg-rose-950/20 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-rose-500/20 text-rose-300">
                              {f.findingCode}
                            </span>
                            <span className="font-semibold text-white">{f.title}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
                            {f.severity} Severity
                          </span>
                        </div>

                        {f.rootCause && (
                          <div className="text-xs text-slate-300">
                            <span className="font-semibold text-slate-400">Root Cause: </span>
                            {f.rootCause}
                          </div>
                        )}

                        {f.remediationPlan && (
                          <div className="text-xs text-slate-300">
                            <span className="font-semibold text-slate-400">Remediation Plan: </span>
                            {f.remediationPlan}
                          </div>
                        )}

                        <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                          <span>Status: {f.status}</span>
                          <span>Target Resolution: {f.targetRemediationDate}</span>
                        </div>
                      </div>
                    ))}
                    {controlData.control.findingItems.length === 0 && (
                      <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-950/15 text-emerald-300 flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Zero open non-conformities; control satisfies ISO/IEC 27001 audit criteria.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: PostgreSQL SQL Query Telemetry */}
            {activeTab === 'sql' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs text-white">PostgreSQL Execution Plan</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(controlData.databaseTelemetry.executedSqlQuery, 'sql')}
                    className="px-2.5 py-1 rounded-md text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'SQL Copied' : 'Copy SQL'}</span>
                  </button>
                </div>

                <div className={`p-3 rounded-lg border font-mono text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-2 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#101A2C] border-[#1C2C46]'
                }`}>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Storage Engine</span>
                    <span className="text-emerald-400 font-bold">{controlData.databaseTelemetry.storageEngine}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Database Host</span>
                    <span className="text-white truncate block">{controlData.databaseTelemetry.databaseHost.replace(/^.*@/, '')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Active Schema</span>
                    <span className="text-white font-bold">{controlData.databaseTelemetry.databaseSchema}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Query Latency</span>
                    <span className="text-indigo-400 font-bold">{controlData.databaseTelemetry.queryLatencyMs} ms</span>
                  </div>
                </div>

                <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black/80 p-3 font-mono text-[11px] text-indigo-300">
                  <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {controlData.databaseTelemetry.executedSqlQuery}
                  </pre>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: Auditor Status Sign-Off */}
            {activeTab === 'auditor' && (
              <form onSubmit={handleSubmitAuditorUpdate} className="space-y-4">
                <div className={`p-3 rounded-lg border text-xs leading-snug ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#101A2C] border-[#1C2C46] text-slate-300'
                }`}>
                  <p className="font-semibold text-white mb-1">Auditor Status Sign-Off &amp; Database Re-aggregation</p>
                  Updating the breakdown status updates the authoritative record in the PostgreSQL database and immediately recomputes the Verified, Remediating, and Failed status counters.
                </div>

                {overrideSuccessMsg && (
                  <div className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{overrideSuccessMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Assigned Breakdown Status
                    </label>
                    <select
                      value={auditorStatusOverride}
                      onChange={e => setAuditorStatusOverride(e.target.value as any)}
                      className={`w-full p-2 rounded-lg text-xs border outline-none font-semibold ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900'
                          : 'bg-[#131F33] border-[#22334F] text-slate-100'
                      }`}
                    >
                      <option value="Verified">Verified (Pass operational audit)</option>
                      <option value="Remediating">Remediating (In progress / CAPA)</option>
                      <option value="Failed">Failed (Audit non-conformity)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Operational Effectiveness
                    </label>
                    <select
                      value={auditorEffectiveness}
                      onChange={e => setAuditorEffectiveness(e.target.value as any)}
                      className={`w-full p-2 rounded-lg text-xs border outline-none font-semibold ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900'
                          : 'bg-[#131F33] border-[#22334F] text-slate-100'
                      }`}
                    >
                      <option value="Effective">Effective</option>
                      <option value="Operating — Minor Gap">Operating — Minor Gap</option>
                      <option value="Ineffective">Ineffective</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Auditor Review Assessment &amp; Rationale Note
                  </label>
                  <textarea
                    rows={3}
                    value={auditorNoteText}
                    onChange={e => setAuditorNoteText(e.target.value)}
                    placeholder="Enter auditor findings, evidence citations, and rationale..."
                    className={`w-full p-2.5 rounded-lg text-xs border outline-none leading-relaxed ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-[#131F33] border-[#22334F] text-slate-100'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmittingOverride}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center space-x-2 transition cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {isSubmittingOverride ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Save &amp; Update PostgreSQL Engine</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* 5. PEER CONTROLS IN THE SAME DOMAIN */}
          <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-[#1E293B]">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Peer Controls in {controlData.control.category} Domain ({controlData.relatedControls.length})
              </h4>
              <span className="text-[11px] text-slate-400">
                Click any peer control to drill down
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {controlData.relatedControls.map(rel => (
                <button
                  key={rel.controlCode}
                  type="button"
                  onClick={() => handleSelectControl(rel.controlCode)}
                  className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition cursor-pointer ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 hover:border-indigo-400 hover:bg-slate-100'
                      : 'bg-[#101A2C] border-[#1E2B42] hover:border-indigo-500 hover:bg-[#152136]'
                  }`}
                >
                  <div className="truncate mr-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono font-bold text-[11px] text-indigo-400">
                        {rel.controlCode}
                      </span>
                    </div>
                    <span className="text-xs text-white truncate block font-medium">
                      {rel.title}
                    </span>
                  </div>

                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    rel.breakdownStatus === 'Verified'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : rel.breakdownStatus === 'Remediating'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {rel.breakdownStatus}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
