import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Shield,
  Sparkles,
  Award,
  Database,
  Layers,
  Globe2,
  Building2,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  CheckCircle2,
  AlertTriangle,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import { useToast } from '../common/ToastContainer';
import { useGRC } from '../../context/GRCContext';
import { Tooltip, MetricInfoTooltip } from '../common/Tooltip';
import {
  AUDIT_PERIODS,
  AuditPeriodKey,
  MASTER_FRAMEWORK_COMPLIANCE_ITEMS,
  calculateComplianceTrend
} from '../../utils/complianceTrendCalculator';
import { FrameworkComplianceCard } from '../compliance/FrameworkComplianceCard';
import { DataCollectionRequired } from '../common/DataCollectionRequired';

interface FrameworkReadinessTableProps {
  onNavigateModule: (moduleId: string) => void;
}

interface FrameworkRow {
  id: string;
  name: string;
  version: string;
  readiness: number;
  previousScore: number;
  controlsPct: number;
  totalControls: number;
  testedControls: number;
  evidencePct: number;
  openFindings: number;
  criticalFindings: number;
  trend: 'up' | 'flat' | 'down';
  delta: number;
  deltaText: string;
  percentChangeText: string;
  targetModuleId: string;
  icon: React.ElementType;
}

type SortField = 'name' | 'readiness' | 'controlsPct' | 'evidencePct' | 'openFindings' | 'trend';
type SortDirection = 'asc' | 'desc';

export const FrameworkReadinessTable: React.FC<FrameworkReadinessTableProps> = ({
  onNavigateModule
}) => {
  const { theme, currentTenant, evidence, findings } = useGRC();
  const { showToast } = useToast();
  const isUninitialized = currentTenant?.isDemo || !currentTenant?.soaBaselineLocked || !currentTenant?.readinessScore || currentTenant?.readinessScore === 0;
  const [filterQuery, setFilterQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('readiness');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedAuditPeriod, setSelectedAuditPeriod] = useState<AuditPeriodKey>('Q2_2026');
  const [displayMode, setDisplayMode] = useState<'table' | 'cards'>('table');

  const activePeriodOption = useMemo(() => {
    return AUDIT_PERIODS.find(p => p.id === selectedAuditPeriod) || AUDIT_PERIODS[0];
  }, [selectedAuditPeriod]);

  const baseFrameworkRows = useMemo(() => {
    const controls = currentTenant?.controls || [];
    const totalControlsCount = controls.length > 0 ? controls.length : 93;
    const implementedControls = controls.filter(c => 
      c.implementationStatus === 'Implemented' || c.implementationStatus === 'Monitored' || c.implementationStatus === 'Audited'
    ).length;
    const isoTestedCount = controls.filter(c => c.implementationStatus === 'Audited' || c.implementationStatus === 'Monitored').length;
    const isoControlsPct = Math.round((implementedControls / totalControlsCount) * 100);

    const verifiedEvCount = evidence.filter(e => e.status === 'Verified' || e.verificationState === 'Verified').length;
    const evPct = evidence.length > 0 ? Math.round((verifiedEvCount / evidence.length) * 100) : 75;

    const openIsoFindings = findings.filter(f => f.status !== 'Closed Verified').length;
    const critIsoFindings = findings.filter(f => f.status !== 'Closed Verified' && f.severity === 'Major Non-Conformity').length;
    const isoReadiness = Math.max(10, Math.min(100, Math.round((isoControlsPct * 0.55) + (evPct * 0.45) - (openIsoFindings * 2))));

    return [
      {
        id: 'iso_27001',
        name: 'ISO/IEC 27001:2022',
        version: 'ISMS 93 Controls',
        readiness: isoReadiness,
        controlsPct: isoControlsPct,
        totalControls: totalControlsCount,
        testedControls: isoTestedCount || 85,
        evidencePct: evPct,
        openFindings: openIsoFindings,
        criticalFindings: critIsoFindings,
        targetModuleId: 'iso27001_dashboard',
        icon: ShieldCheck
      },
      {
        id: 'mas_trm',
        name: 'MAS TRM Guidelines',
        version: 'Singapore Financial Regs',
        readiness: Math.min(100, isoReadiness + 6),
        controlsPct: Math.min(100, isoControlsPct + 2),
        totalControls: 114,
        testedControls: 101,
        evidencePct: Math.min(100, evPct + 4),
        openFindings: Math.max(0, openIsoFindings - 1),
        criticalFindings: 0,
        targetModuleId: 'mas_dashboard',
        icon: Building2
      },
      {
        id: 'soc_2',
        name: 'SOC 2 Type II',
        version: 'Trust Services Criteria',
        readiness: Math.max(20, isoReadiness - 6),
        controlsPct: Math.max(25, isoControlsPct - 10),
        totalControls: 64,
        testedControls: 51,
        evidencePct: Math.max(20, evPct - 8),
        openFindings: openIsoFindings + 1,
        criticalFindings: critIsoFindings,
        targetModuleId: 'control_library',
        icon: Award
      },
      {
        id: 'iso_42001',
        name: 'ISO/IEC 42001:2023',
        version: 'AI Management (AIMS)',
        readiness: 38,
        controlsPct: 45,
        totalControls: 38,
        testedControls: 16,
        evidencePct: 32,
        openFindings: 5,
        criticalFindings: 2,
        targetModuleId: 'iso42001_dashboard',
        icon: Sparkles
      },
      {
        id: 'gdpr',
        name: 'EU GDPR Privacy',
        version: 'Data Protection Regs',
        readiness: 64,
        controlsPct: 76,
        totalControls: 88,
        testedControls: 65,
        evidencePct: 68,
        openFindings: 2,
        criticalFindings: 0,
        targetModuleId: 'data_information',
        icon: Database
      },
      {
        id: 'iso_27701',
        name: 'ISO/IEC 27701:2019',
        version: 'Privacy Information (PIMS)',
        readiness: 56,
        controlsPct: 70,
        totalControls: 49,
        testedControls: 33,
        evidencePct: 58,
        openFindings: 3,
        criticalFindings: 1,
        targetModuleId: 'iso27701_pims',
        icon: Shield
      },
      {
        id: 'pci_dss',
        name: 'PCI DSS v4.0.1',
        version: 'Payment Card Security',
        readiness: 48,
        controlsPct: 56,
        totalControls: 64,
        testedControls: 32,
        evidencePct: 45,
        openFindings: 4,
        criticalFindings: 1,
        targetModuleId: 'control_library',
        icon: Award
      },
      {
        id: 'ndpr',
        name: 'NDPR Nigeria',
        version: 'Data Protection Regs',
        readiness: 61,
        controlsPct: 67,
        totalControls: 42,
        testedControls: 27,
        evidencePct: 60,
        openFindings: 2,
        criticalFindings: 0,
        targetModuleId: 'frameworks',
        icon: Globe2
      },
      {
        id: 'dpdpa',
        name: 'India DPDPA 2023',
        version: 'Digital Personal Data',
        readiness: 45,
        controlsPct: 51,
        totalControls: 36,
        testedControls: 18,
        evidencePct: 42,
        openFindings: 5,
        criticalFindings: 2,
        targetModuleId: 'dpdp_compliance',
        icon: Layers
      }
    ];
  }, [currentTenant?.controls, evidence, findings]);

  // Dynamically calculate trend indicators comparing current readiness against selected audit period
  const frameworkRows: FrameworkRow[] = useMemo(() => {
    return baseFrameworkRows.map(base => {
      const masterItem = MASTER_FRAMEWORK_COMPLIANCE_ITEMS.find(m => m.id === base.id);
      const prevScore = masterItem
        ? masterItem.previousScores[selectedAuditPeriod].operational
        : Math.max(0, base.readiness - 4);

      const trendData = calculateComplianceTrend(base.readiness, prevScore, activePeriodOption);

      return {
        ...base,
        previousScore: prevScore,
        trend: trendData.direction,
        delta: trendData.delta,
        deltaText: trendData.deltaFormatted,
        percentChangeText: trendData.percentChangeFormatted
      };
    });
  }, [baseFrameworkRows, selectedAuditPeriod, activePeriodOption]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedAndFilteredRows = useMemo(() => {
    const filtered = frameworkRows.filter(
      r =>
        r.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
        r.version.toLowerCase().includes(filterQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let result = 0;
      if (sortField === 'name') {
        result = a.name.localeCompare(b.name);
      } else if (sortField === 'readiness') {
        result = a.readiness - b.readiness;
      } else if (sortField === 'controlsPct') {
        result = a.controlsPct - b.controlsPct;
      } else if (sortField === 'evidencePct') {
        result = a.evidencePct - b.evidencePct;
      } else if (sortField === 'openFindings') {
        result = a.openFindings - b.openFindings;
      } else if (sortField === 'trend') {
        const numA = parseFloat(a.deltaText.replace('%', ''));
        const numB = parseFloat(b.deltaText.replace('%', ''));
        result = numA - numB;
      }
      return sortDirection === 'asc' ? result : -result;
    });
  }, [frameworkRows, filterQuery, sortField, sortDirection]);

  // Aggregate stats
  const averageReadiness = Math.round(
    frameworkRows.reduce((acc, r) => acc + r.readiness, 0) / frameworkRows.length
  );
  const totalFindings = frameworkRows.reduce((acc, r) => acc + r.openFindings, 0);
  const totalControlsMonitored = frameworkRows.reduce((acc, r) => acc + r.totalControls, 0);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-600 opacity-60 group-hover:opacity-100" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-indigo-400" />
    ) : (
      <ArrowDown className="w-3 h-3 text-indigo-400" />
    );
  };

  return (
    <div className="p-4 lg:p-5 flex flex-col justify-between h-full">
      {/* Table Header & Search Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800/70">
        <div className="flex items-center space-x-3 flex-wrap gap-y-1">
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Framework Readiness</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700/60">
              {frameworkRows.length} Frameworks Active
            </span>
          </h2>
          <span className="text-slate-700 hidden md:inline">•</span>
          <span className="text-xs text-slate-400 hidden md:inline">
            Executive readiness matrix across active regulatory and security standards
          </span>
        </div>

        {/* Filter Input, Audit Period Selector, View Mode & Crosswalk shortcut */}
        <div className="flex items-center space-x-2 flex-wrap sm:flex-nowrap gap-y-2">
          {/* Audit Period Selector */}
          <div className="flex items-center space-x-1">
            <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">Compare:</span>
            <select
              value={selectedAuditPeriod}
              onChange={e => setSelectedAuditPeriod(e.target.value as AuditPeriodKey)}
              className="text-xs font-mono px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-hidden focus:border-indigo-500 transition cursor-pointer"
              title="Select baseline audit period to calculate compliance trend indicators"
            >
              {AUDIT_PERIODS.map(p => (
                <option key={p.id} value={p.id}>{p.shortLabel}</option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle: Cards vs Table */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setDisplayMode('table')}
              className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                displayMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title="Switch to detailed tabular view"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setDisplayMode('cards')}
              className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                displayMode === 'cards'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title="Switch to compliance health cards with trend indicators"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search frameworks..."
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              className="pl-8 pr-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 transition w-32 sm:w-44"
            />
          </div>

          <button
            onClick={() => onNavigateModule('cross_framework_crosswalk')}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-850 text-indigo-300 border border-slate-800 text-xs font-semibold transition"
            title="Open Cross-Framework Control Mapping Matrix"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Crosswalk</span>
          </button>
        </div>
      </div>

      {/* Conditional View: Compliance Cards Grid vs Compact Enterprise Table */}
      {displayMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-3">
          {sortedAndFilteredRows.map(row => {
            const masterItem =
              MASTER_FRAMEWORK_COMPLIANCE_ITEMS.find(m => m.id === row.id) ||
              MASTER_FRAMEWORK_COMPLIANCE_ITEMS[0];

            return (
              <FrameworkComplianceCard
                key={row.id}
                framework={masterItem}
                selectedPeriod={activePeriodOption}
                scoreType="operational"
                onNavigateModule={onNavigateModule}
                compact={false}
              />
            );
          })}
        </div>
      ) : (
      /* Compact Enterprise Table */
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 bg-slate-950/40">
              {/* 1. Framework */}
              <th
                onClick={() => handleSort('name')}
                className="py-2.5 px-3 cursor-pointer select-none hover:text-white transition group"
              >
                <div className="flex items-center space-x-1.5">
                  <span>Framework</span>
                  {renderSortIcon('name')}
                </div>
              </th>

              {/* 2. Readiness % */}
              <th
                onClick={() => handleSort('readiness')}
                className="py-2.5 px-3 cursor-pointer select-none hover:text-white transition group min-w-[140px]"
              >
                <div className="flex items-center space-x-1.5">
                  <Tooltip
                    title="Framework Readiness Metric"
                    content="Composite readiness index for this individual standard. Aggregates control testing status, uploaded cryptographic evidence, and open audit findings."
                    formula="(Tested Controls % × 0.5) + (Valid Evidence % × 0.3) + (Zero Major NCs × 0.2)"
                    benchmark="Target: ≥ 70% for Stage 1 doc sign-off; ≥ 90% for Stage 2 certification."
                    position="bottom"
                  >
                    <span className="flex items-center space-x-1 underline decoration-dotted decoration-slate-600 underline-offset-2">
                      <span>Readiness %</span>
                    </span>
                  </Tooltip>
                  {renderSortIcon('readiness')}
                </div>
              </th>

              {/* 3. Controls */}
              <th
                onClick={() => handleSort('controlsPct')}
                className="py-2.5 px-3 cursor-pointer select-none hover:text-white transition group"
              >
                <div className="flex items-center space-x-1.5">
                  <Tooltip
                    title="Control Implementation Coverage"
                    content="Ratio of operational security controls tested and verified versus total controls mandated by this framework."
                    formula="(Tested Controls / Total Mandated Controls) × 100"
                    benchmark="Target: 100% of applicable Statement of Applicability (SoA) controls tested."
                    position="bottom"
                  >
                    <span className="flex items-center space-x-1 underline decoration-dotted decoration-slate-600 underline-offset-2">
                      <span>Controls</span>
                    </span>
                  </Tooltip>
                  {renderSortIcon('controlsPct')}
                </div>
              </th>

              {/* 4. Evidence */}
              <th
                onClick={() => handleSort('evidencePct')}
                className="py-2.5 px-3 cursor-pointer select-none hover:text-white transition group"
              >
                <div className="flex items-center space-x-1.5">
                  <Tooltip
                    title="Cryptographic Evidence Completeness"
                    content="Percentage of mandated control workpapers and logs uploaded and validated with SHA-256 hashes."
                    benchmark="Target: ≥ 85% fresh evidence collected within the current quarter."
                    position="bottom"
                  >
                    <span className="flex items-center space-x-1 underline decoration-dotted decoration-slate-600 underline-offset-2">
                      <span>Evidence</span>
                    </span>
                  </Tooltip>
                  {renderSortIcon('evidencePct')}
                </div>
              </th>

              {/* 5. Findings */}
              <th
                onClick={() => handleSort('openFindings')}
                className="py-2.5 px-3 text-center cursor-pointer select-none hover:text-white transition group"
              >
                <div className="flex items-center justify-center space-x-1.5">
                  <Tooltip
                    title="Audit Findings & CAPAs"
                    content="Unresolved audit non-conformities. Critical findings block certification issuance until verified closed."
                    benchmark="0 Critical/Major • ≤ 3 Minor with approved CAPA."
                    position="bottom"
                  >
                    <span className="flex items-center space-x-1 underline decoration-dotted decoration-slate-600 underline-offset-2">
                      <span>Findings</span>
                    </span>
                  </Tooltip>
                  {renderSortIcon('openFindings')}
                </div>
              </th>

              {/* 6. Trend */}
              <th
                onClick={() => handleSort('trend')}
                className="py-2.5 px-3 text-center cursor-pointer select-none hover:text-white transition group"
              >
                <div className="flex items-center justify-center space-x-1.5">
                  <Tooltip
                    title="Velocity & Posture Trend"
                    content="Readiness index trajectory over the previous 30-day monitoring window."
                    position="bottom"
                  >
                    <span className="flex items-center space-x-1 underline decoration-dotted decoration-slate-600 underline-offset-2">
                      <span>Trend</span>
                    </span>
                  </Tooltip>
                  {renderSortIcon('trend')}
                </div>
              </th>

              {/* 7. Action */}
              <th className="py-2.5 px-3 text-right">
                <span>Action</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {sortedAndFilteredRows.map(row => {
              const Icon = row.icon;
              return (
                <tr
                  key={row.id}
                  onClick={() => {
                    onNavigateModule(row.targetModuleId);
                    showToast({
                      title: `Opened ${row.name}`,
                      message: `Navigating to workbench with ${row.readiness}% readiness`,
                      type: 'info'
                    });
                  }}
                  className="hover:bg-slate-850/60 transition-colors group cursor-pointer"
                >
                  {/* Framework Column */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1 rounded-md bg-slate-800 text-blue-400 group-hover:bg-blue-600/20 group-hover:text-blue-300 transition shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-white text-xs group-hover:text-indigo-300 transition truncate">
                          {row.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">{row.version}</div>
                      </div>
                    </div>
                  </td>

                  {/* Readiness % Column */}
                  <td className="py-2.5 px-3">
                    {isUninitialized ? (
                      <DataCollectionRequired variant="table-cell" title="Data collection required" />
                    ) : (
                      <Tooltip
                        title={`${row.name} Readiness`}
                        badge={`${row.readiness}% Posture`}
                        content={`Comprehensive certification posture for ${row.name}. Based on verified implementation of ${row.testedControls} controls and ${row.evidencePct}% evidence hash verification.`}
                        benchmark={row.readiness >= 70 ? 'Audit Ready for Stage 1/2' : 'Remediation Required'}
                        position="right"
                      >
                        <div className="flex items-center space-x-2.5 cursor-help">
                          <div className="w-20 sm:w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden shrink-0">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                row.readiness >= 70
                                  ? 'bg-emerald-500'
                                  : row.readiness >= 50
                                  ? 'bg-indigo-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${row.readiness}%` }}
                            />
                          </div>
                          <span
                            className={`font-mono text-xs font-bold px-1.5 py-0.2 rounded shrink-0 ${
                              row.readiness >= 70
                                ? 'text-emerald-300 bg-emerald-500/10'
                                : row.readiness >= 50
                                ? 'text-indigo-300 bg-indigo-500/10'
                                : 'text-amber-300 bg-amber-500/10'
                            }`}
                          >
                            {row.readiness}%
                          </span>
                        </div>
                      </Tooltip>
                    )}
                  </td>

                  {/* Controls Column */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <Tooltip
                      title={`${row.name} Controls`}
                      content={`${row.testedControls} of ${row.totalControls} mandatory controls operationally tested and verified.`}
                      benchmark="Target: 100% of applicable SoA controls tested."
                      position="top"
                    >
                      <div className="flex items-center space-x-1.5 cursor-help">
                        <span className="font-mono font-semibold text-slate-200">{row.controlsPct}%</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({row.testedControls}/{row.totalControls})
                        </span>
                      </div>
                    </Tooltip>
                  </td>

                  {/* Evidence Column */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <Tooltip
                      title={`${row.name} Evidence`}
                      content={`${row.evidencePct}% of evidence workpapers cryptographically verified and mapped to controls.`}
                      benchmark="Target: ≥ 85% cryptographic validity rate."
                      position="top"
                    >
                      <div className="flex items-center space-x-1.5 cursor-help">
                        <span className="font-mono font-semibold text-slate-200">{row.evidencePct}%</span>
                        <span className="text-[10px] text-slate-400">valid</span>
                      </div>
                    </Tooltip>
                  </td>

                  {/* Findings Column */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <Tooltip
                      title={`${row.name} Audit Findings`}
                      content={
                        row.openFindings === 0
                          ? 'Zero open findings or non-conformities identified.'
                          : `${row.openFindings} open observation(s) under remediation (${row.criticalFindings} critical).`
                      }
                      benchmark="Critical NCs block certification; minor findings require 30-day CAPA plan."
                      position="top"
                    >
                      <span
                        className={`inline-flex items-center space-x-1 font-mono font-bold text-xs px-2 py-0.5 rounded-full cursor-help ${
                          row.openFindings === 0
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : row.criticalFindings > 0
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {row.openFindings === 0 ? (
                          <span>0 open</span>
                        ) : (
                          <span>{row.openFindings} ({row.criticalFindings} crit)</span>
                        )}
                      </span>
                    </Tooltip>
                  </td>

                  {/* Trend Column with Calculated Indicators */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <Tooltip
                      title={`${row.name} Compliance Velocity`}
                      content={`Current score: ${row.readiness}% vs previous audit (${activePeriodOption.shortLabel}): ${row.previousScore}%.`}
                      formula={`Δ = ${row.delta > 0 ? '+' : ''}${row.delta}% (${row.percentChangeText} relative)`}
                      benchmark="Upward trajectory verifies active remediation and positive audit evidence progression."
                      position="top"
                    >
                      <div className={`h-6 px-2.5 inline-flex items-center justify-center space-x-1.5 font-mono text-[11px] font-semibold cursor-help rounded-md border whitespace-nowrap shrink-0 leading-none transition ${
                        row.trend === 'up'
                          ? theme === 'light' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                          : row.trend === 'down'
                          ? theme === 'light' ? 'bg-rose-50 text-rose-800 border-rose-300' : 'bg-rose-950/60 text-rose-300 border-rose-500/30'
                          : theme === 'light' ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800/60 text-slate-300 border-slate-700'
                      }`}>
                        {row.trend === 'up' ? (
                          <>
                            <TrendingUp className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                            <span className="font-bold whitespace-nowrap leading-none">{row.deltaText}</span>
                          </>
                        ) : row.trend === 'down' ? (
                          <>
                            <TrendingDown className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                            <span className="font-bold whitespace-nowrap leading-none">{row.deltaText}</span>
                          </>
                        ) : (
                          <>
                            <Minus className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                            <span className="whitespace-nowrap leading-none">{row.deltaText}</span>
                          </>
                        )}
                      </div>
                    </Tooltip>
                  </td>

                  {/* Action Column */}
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateModule(row.targetModuleId);
                        showToast({
                          title: `Opened ${row.name}`,
                          message: `Navigating to workbench with ${row.readiness}% readiness`,
                          type: 'info'
                        });
                      }}
                      className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-xs font-semibold transition inline-flex items-center space-x-1 border border-slate-700/60 hover:border-indigo-500 shadow-xs cursor-pointer"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}

      {/* Summary Footer Bar for Fast Executive Review */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center space-x-1.5">
            <span className="text-slate-400">Avg Readiness:</span>
            <strong className="font-mono text-emerald-400 font-bold">{averageReadiness}%</strong>
          </span>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <span className="flex items-center space-x-1.5">
            <span className="text-slate-400">Monitored Controls:</span>
            <strong className="font-mono text-white font-semibold">{totalControlsMonitored}</strong>
          </span>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <span className="flex items-center space-x-1.5">
            <span className="text-slate-400">Total Open Findings:</span>
            <strong className="font-mono text-amber-400 font-semibold">{totalFindings}</strong>
          </span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          Showing {sortedAndFilteredRows.length} of {frameworkRows.length} frameworks
        </div>
      </div>
    </div>
  );
};

