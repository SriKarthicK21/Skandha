// ============================================================================
// SKANDA ENTERPRISE GRC: MAS TRM CONTINUOUS ASSURANCE OS WORKSPACE
// Path: src/components/mas/trm/MASTRMContinuousAssuranceWorkspace.tsx
//
// Phase 25: Continuous Compliance Monitoring, Control Effectiveness & Executive Assurance
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  FileCheck,
  Search,
  Filter,
  Layers,
  Sparkles,
  Award,
  Calendar,
  Lock,
  ChevronRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  Eye,
  FileText,
  Building2,
  AlertCircle,
  BarChart3,
  Check,
  Info
} from 'lucide-react';

import {
  MasTrmContinuousPosture,
  MasTrmControlAssuranceState,
  MasTrmContinuousControlAssurance,
  MasTrmClauseContinuousPosture,
  MasTrmExecutiveCommandCenter,
  MasTrmBoardAssuranceReport,
  MasTrmShowMeWhy14StageTrace,
  MasTrmShowMeWhatChangedDiff,
  AICopilotAssuranceResponse
} from '../../../types/masTrmContinuousAssuranceTypes';

import { masTrmContinuousAssuranceEngine } from '../../../../server/services/regulatory/MASTRMContinuousAssuranceEngine';

interface Props {
  tenantId?: string;
  institutionName?: string;
}

export const MASTRMContinuousAssuranceWorkspace: React.FC<Props> = ({
  tenantId = 'tenant-sg-bank-01',
  institutionName = 'SingaBank International Ltd'
}) => {
  const [activeTab, setActiveTab] = useState<
    'command_center' | 'clause_matrix' | 'control_assurances' | 'automated_tests' | 'auditor_workbench' | 'copilot'
  >('command_center');

  const [commandCenter, setCommandCenter] = useState<MasTrmExecutiveCommandCenter | null>(null);
  const [controlAssurances, setControlAssurances] = useState<MasTrmContinuousControlAssurance[]>([]);
  const [selectedControl, setSelectedControl] = useState<MasTrmContinuousControlAssurance | null>(null);
  const [showMeWhyTrace, setShowMeWhyTrace] = useState<MasTrmShowMeWhy14StageTrace | null>(null);
  const [showWhatChangedDiffs, setShowWhatChangedDiffs] = useState<MasTrmShowMeWhatChangedDiff[]>([]);
  const [selectedDiffControl, setSelectedDiffControl] = useState<string | null>(null);
  const [boardReport, setBoardReport] = useState<MasTrmBoardAssuranceReport | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [assuranceFilter, setAssuranceFilter] = useState<string>('ALL');
  const [clauseFilter, setClauseFilter] = useState<number | 'ALL'>('ALL');
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotResponse, setCopilotResponse] = useState<AICopilotAssuranceResponse | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const refreshData = () => {
    const cmd = masTrmContinuousAssuranceEngine.getExecutiveCommandCenter(tenantId);
    const assurances = masTrmContinuousAssuranceEngine.getTenantContinuousControlAssurances(tenantId);
    const diffs = masTrmContinuousAssuranceEngine.getShowMeWhatChangedDiffs(tenantId);
    setCommandCenter(cmd);
    setControlAssurances(assurances);
    setShowWhatChangedDiffs(diffs);
  };

  useEffect(() => {
    refreshData();
  }, [tenantId]);

  const handleShowMeWhy = (controlCode: string) => {
    const trace = masTrmContinuousAssuranceEngine.getShowMeWhy14StageTrace(tenantId, controlCode);
    setShowMeWhyTrace(trace);
  };

  const handleShowWhatChanged = (controlCode: string) => {
    setSelectedDiffControl(controlCode);
  };

  const handleTriggerAutomatedTest = (controlCode: string) => {
    setIsSimulating(true);
    setTimeout(() => {
      masTrmContinuousAssuranceEngine.runAutomatedControlTest(tenantId, {
        controlCode,
        testName: `Automated Continuous Telemetry Verification (${controlCode})`,
        dataSource: 'Live CloudEndure / Wiz / Okta API Stream',
        frequency: 'CONTINUOUS',
        nextRunAt: new Date(Date.now() + 3600000).toISOString(),
        result: 'PASS',
        executionLatencyMs: 14.2
      });
      refreshData();
      setIsSimulating(false);
    }, 400);
  };

  const handleSimulateDrift = (controlCode: string) => {
    setIsSimulating(true);
    setTimeout(() => {
      masTrmContinuousAssuranceEngine.ingestContinuousAssuranceSignal(tenantId, {
        tenantId,
        connectorType: 'CONFIG_DRIFT',
        connectorName: 'AWS Config / Terraform Sentinel Drift Detector',
        status: 'CONNECTED',
        targetControlCode: controlCode,
        signalPayload: { unauthorizedChangeDetected: true, driftSeverity: 'CRITICAL' },
        signalSeverity: 'CRITICAL',
        anomalyDetected: true,
        driftDetails: 'Security group opened port 22 to 0.0.0.0/0 on production cluster'
      });
      refreshData();
      setIsSimulating(false);
    }, 400);
  };

  const handleGenerateBoardReport = () => {
    const report = masTrmContinuousAssuranceEngine.generateBoardAssuranceReport(tenantId, institutionName, 'BANK');
    setBoardReport(report);
  };

  const handleAskCopilot = () => {
    if (!copilotQuery.trim()) return;
    const res = masTrmContinuousAssuranceEngine.queryAIAssuranceCopilot({
      tenantId,
      query: copilotQuery
    });
    setCopilotResponse(res);
  };

  const filteredAssurances = controlAssurances.filter(a => {
    const matchesSearch =
      a.controlCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.controlTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.clauseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAssurance = assuranceFilter === 'ALL' || a.assuranceState === assuranceFilter;
    const matchesClause = clauseFilter === 'ALL' || a.clauseNumber === clauseFilter;
    return matchesSearch && matchesAssurance && matchesClause;
  });

  const getAssuranceBadge = (state: MasTrmControlAssuranceState) => {
    switch (state) {
      case 'FULL_ASSURANCE':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Full Assurance</span>;
      case 'LIMITED_ASSURANCE':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Limited Assurance</span>;
      case 'CONDITIONAL_ASSURANCE':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Conditional (Exception)</span>;
      case 'AT_RISK':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> At Risk</span>;
      case 'NO_ASSURANCE':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/30 flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> No Assurance</span>;
      case 'ASSURANCE_REVIEW_REQUIRED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Review Required</span>;
      default:
        return null;
    }
  };

  const getPostureBadge = (posture: MasTrmContinuousPosture) => {
    switch (posture) {
      case 'STRONG':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">STRONG POSTURE</span>;
      case 'MANAGED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">MANAGED POSTURE</span>;
      case 'PARTIALLY_MANAGED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">PARTIALLY MANAGED</span>;
      case 'AT_RISK':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">AT RISK</span>;
      case 'INSUFFICIENT_ASSURANCE':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-500/20 text-slate-300 border border-slate-500/40">INSUFFICIENT ASSURANCE</span>;
    }
  };

  if (!commandCenter) {
    return <div className="p-8 text-slate-400">Loading MAS TRM Continuous Assurance OS...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* HEADER */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-600/20 border border-indigo-500/40 text-indigo-400 shadow-lg shadow-indigo-950/40">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">MAS TRM Continuous Assurance OS</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  PHASE 25
                </span>
                {getPostureBadge(commandCenter.overallPosture)}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Continuous Compliance Monitoring, Control Effectiveness & Executive Assurance • <span className="text-slate-300 font-medium">{institutionName}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={refreshData}
            className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 flex items-center gap-2 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Recalculate Posture
          </button>
          <button
            onClick={handleGenerateBoardReport}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-950/50 flex items-center gap-2 transition"
          >
            <Award className="w-3.5 h-3.5" />
            Board Assurance Report
          </button>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Posture Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1.5">{commandCenter.overallPostureScore}%</div>
          <div className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3" /> Continuous Assurance
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Full Assurance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1.5">{commandCenter.fullAssuranceControlsCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Controls fully verified</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Controls At Risk</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 mt-1.5">{commandCenter.atRiskControlsCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Deficiencies detected</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Evidence Freshness</span>
            <FileCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400 mt-1.5">{Math.round(commandCenter.evidenceFreshnessRate * 100)}%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">SHA-256 Validated</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Testing Current</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400 mt-1.5">{Math.round(commandCenter.testingCurrentRate * 100)}%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">ISO 19011 Fieldwork</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Resilience 4h RTO</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1.5">PASS</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Core Banking & FAST</div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-1 border-b border-slate-800 mb-6 overflow-x-auto">
        {[
          { id: 'command_center', label: 'Executive Command Center', icon: BarChart3 },
          { id: 'clause_matrix', label: '14 Clauses Posture Matrix', icon: Layers },
          { id: 'control_assurances', label: 'Continuous Control Assurances', icon: Shield },
          { id: 'automated_tests', label: 'Live Automated Tests', icon: Activity },
          { id: 'auditor_workbench', label: 'Auditor Traceability Room', icon: Award },
          { id: 'copilot', label: 'AI Assurance Copilot', icon: Sparkles }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXECUTIVE COMMAND CENTER */}
      {activeTab === 'command_center' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Posture Trend */}
            <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  Continuous Compliance Posture Trend (30 Days)
                </h3>
                <span className="text-xs text-slate-400">Deterministic Score History</span>
              </div>
              <div className="h-40 flex items-end gap-6 px-4 pt-4 border-b border-slate-800">
                {commandCenter.trends30Days.map((t, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div className="text-[11px] font-bold text-slate-300">{t.postureScore}%</div>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-blue-500 transition-all duration-500"
                      style={{ height: `${t.postureScore}%` }}
                    />
                    <div className="text-[10px] text-slate-500">{t.date.slice(5)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Regulatory Milestones */}
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-amber-400" />
                Regulatory Calendar & Horizon
              </h3>
              <div className="space-y-3">
                {commandCenter.upcomingRegulatoryMilestones.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400">{m.noticeNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {m.daysRemaining} days remaining
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium mt-1">{m.title}</p>
                    <div className="text-[10px] text-slate-500 mt-1">Effective Date: {m.effectiveDate}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Board Actions */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-emerald-400" />
              Priority Board & Senior Management Action Queue
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {commandCenter.topBoardActions.map((a, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-slate-500">{a.id} • Clause {a.relatedClause}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        a.priority === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {a.priority}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white">{a.title}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Owner: {a.owner}</span>
                    <span>Deadline: {a.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 14 CLAUSES POSTURE MATRIX */}
      {activeTab === 'clause_matrix' && (
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                MAS TRM 14-Clause Continuous Compliance Matrix (Clauses 3 to 16)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time aggregated posture, operating effectiveness, and deficiency counts across all 14 statutory clauses.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Clause</th>
                  <th className="p-3">Title</th>
                  <th className="p-3 text-center">Requirements</th>
                  <th className="p-3 text-center">Controls</th>
                  <th className="p-3 text-center">Effective</th>
                  <th className="p-3 text-center">At Risk</th>
                  <th className="p-3 text-center">Findings</th>
                  <th className="p-3 text-center">Assurance</th>
                  <th className="p-3 text-right">Readiness</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {commandCenter.clausePostures.map(c => (
                  <tr key={c.clauseNumber} className="hover:bg-slate-800/30 transition">
                    <td className="p-3 font-mono font-bold text-indigo-400">Clause {c.clauseNumber}</td>
                    <td className="p-3 font-medium text-white">{c.clauseTitle}</td>
                    <td className="p-3 text-center text-slate-400">{c.applicableRequirementsCount}</td>
                    <td className="p-3 text-center text-slate-300 font-semibold">{c.totalControlsCount}</td>
                    <td className="p-3 text-center text-emerald-400 font-bold">{c.effectiveControlsCount}</td>
                    <td className="p-3 text-center text-rose-400 font-bold">{c.atRiskControlsCount}</td>
                    <td className="p-3 text-center text-amber-400">{c.openFindingsCount}</td>
                    <td className="p-3 text-center">{getAssuranceBadge(c.clauseAssuranceState)}</td>
                    <td className="p-3 text-right font-bold text-slate-200">{c.readinessRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CONTINUOUS CONTROL ASSURANCES */}
      {activeTab === 'control_assurances' && (
        <div className="space-y-4">
          {/* Controls Filter Bar */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search control code, title, clause..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={assuranceFilter}
                onChange={e => setAssuranceFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Assurance States</option>
                <option value="FULL_ASSURANCE">Full Assurance</option>
                <option value="LIMITED_ASSURANCE">Limited Assurance</option>
                <option value="CONDITIONAL_ASSURANCE">Conditional (Exception)</option>
                <option value="AT_RISK">At Risk</option>
                <option value="NO_ASSURANCE">No Assurance</option>
                <option value="ASSURANCE_REVIEW_REQUIRED">Review Required</option>
              </select>

              <select
                value={clauseFilter}
                onChange={e => setClauseFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Clauses (3-16)</option>
                {commandCenter.clausePostures.map(c => (
                  <option key={c.clauseNumber} value={c.clauseNumber}>Clause {c.clauseNumber}: {c.clauseTitle}</option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-400">
              Showing <span className="text-white font-bold">{filteredAssurances.length}</span> controls
            </div>
          </div>

          {/* Controls List */}
          <div className="space-y-3">
            {filteredAssurances.map(ctrl => (
              <div
                key={ctrl.controlCode}
                className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-400">{ctrl.controlCode}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-xs font-semibold text-slate-300">Clause {ctrl.clauseNumber}: {ctrl.clauseTitle}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-xs text-slate-400">{ctrl.requirementSection}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1">{ctrl.controlTitle}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {getAssuranceBadge(ctrl.assuranceState)}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs mb-3">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Design Effectiveness</span>
                    <span className="font-semibold text-emerald-400">{ctrl.designEffectiveness}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Operating Effectiveness</span>
                    <span className={`font-semibold ${ctrl.operatingEffectiveness === 'EFFECTIVE' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {ctrl.operatingEffectiveness}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Evidence Freshness</span>
                    <span className="font-semibold text-blue-400">{ctrl.evidenceFreshness} ({ctrl.evidenceCount} artifacts)</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Last Fieldwork Test</span>
                    <span className="font-semibold text-slate-200">{ctrl.lastTestedAt.slice(0, 10)} ({ctrl.lastTestResult})</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Open Findings / CAPA</span>
                    <span className={`font-semibold ${ctrl.openFindingsCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                      {ctrl.openFindingsCount} Findings / {ctrl.overdueCapasCount} Overdue
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Signal Connector</span>
                    <span className="font-semibold text-indigo-400 flex items-center gap-1">
                      <Cpu className="w-3 h-3" /> {ctrl.signalConnectorStatus}
                    </span>
                  </div>
                </div>

                {ctrl.negativeConditions.length > 0 && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs mb-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Negative Assurance Conditions:</span> {ctrl.negativeConditions.map(c => c.description).join('; ')}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <div className="text-[11px] text-slate-400 italic">
                    {ctrl.confidenceRationale}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleShowMeWhy(ctrl.controlCode)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      Show Me Why
                    </button>
                    <button
                      onClick={() => handleShowWhatChanged(ctrl.controlCode)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                      What Changed
                    </button>
                    <button
                      onClick={() => handleTriggerAutomatedTest(ctrl.controlCode)}
                      disabled={isSimulating}
                      className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      Run Test
                    </button>
                    <button
                      onClick={() => handleSimulateDrift(ctrl.controlCode)}
                      disabled={isSimulating}
                      className="px-2.5 py-1 rounded bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition border border-rose-800"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      Simulate Drift
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LIVE AUTOMATED CONTROL TESTING */}
      {activeTab === 'automated_tests' && (
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Live Automated Control Testing Studio & Continuous Signal Ingestion
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated test routines executed via connected Cloud CSPM, IAM, DR, and Vulnerability telemetry pipelines.
              </p>
            </div>
            <button
              onClick={() => handleTriggerAutomatedTest('MAS-TRM-09-AC-01')}
              disabled={isSimulating}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              Run Full Automated Suite
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { code: 'MAS-TRM-09-AC-01', name: 'Privileged Accounts Without MFA Detector', source: 'Okta / Azure AD API', freq: 'CONTINUOUS', status: 'PASS', latency: '12.4ms' },
              { code: 'MAS-TRM-09-AC-01', name: 'Dormant Administrative Account Sweeper (>90d)', source: 'CyberArk PAM Vault', freq: 'HOURLY', status: 'PASS', latency: '18.1ms' },
              { code: 'MAS-TRM-08-RES-01', name: '4-Hour RTO Disaster Recovery Heartbeat', source: 'CloudEndure DR Switch', freq: 'HOURLY', status: 'PASS', latency: '42.0ms' },
              { code: 'MAS-TRM-08-RES-01', name: 'Immutable WORM S3 Backup Lock Integrity', source: 'AWS S3 Object Lock Vault', freq: 'DAILY', status: 'PASS', latency: '9.8ms' },
              { code: 'MAS-TRM-16-TPRM-01', name: 'Third-Party Vendor SLA & Audit Right Attestation', source: 'SecurityScorecard API', freq: 'DAILY', status: 'PASS', latency: '33.2ms' },
              { code: 'MAS-TRM-03-GOV-01', name: 'Technology Risk Committee Charter Signoff Review', source: 'Skanda Policy Registry', freq: 'WEEKLY', status: 'PASS', latency: '5.1ms' }
            ].map((t, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-400">{t.code}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">{t.freq}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1">{t.name}</h4>
                  <div className="text-[10px] text-slate-500 mt-1">Source: {t.source} • Latency: {t.latency}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AUDITOR TRACEABILITY WORKBENCH */}
      {activeTab === 'auditor_workbench' && (
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                Auditor Assurance Clean Room & Cryptographic Lineage
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every assurance conclusion is forensically traceable back to official MAS publications and verified fieldwork tests.
              </p>
            </div>
            <button
              onClick={handleGenerateBoardReport}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-2 transition"
            >
              <FileText className="w-3.5 h-3.5" />
              Generate Sealed Management Assurance
            </button>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 mb-6">
            <div className="text-xs font-bold text-indigo-400 mb-2">Canonical 14-Stage Governance Chain:</div>
            <div className="flex items-center gap-2 overflow-x-auto py-2 text-[11px] text-slate-300 font-mono">
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">MAS Source</span>
              <span>→</span>
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">Version</span>
              <span>→</span>
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">Clause</span>
              <span>→</span>
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">Requirement</span>
              <span>→</span>
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">Objective</span>
              <span>→</span>
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800 text-indigo-400">Control 360</span>
              <span>→</span>
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">Risk</span>
              <span>→</span>
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">Policy</span>
              <span>→</span>
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">Evidence</span>
              <span>→</span>
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">Test</span>
              <span>→</span>
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">Result</span>
              <span>→</span>
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">Finding</span>
              <span>→</span>
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">CAPA</span>
              <span>→</span>
              <span className="px-2 py-1 bg-emerald-950 text-emerald-300 rounded border border-emerald-800">Assurance</span>
            </div>
          </div>

          {boardReport && (
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div>
                  <span className="text-[10px] font-mono text-slate-500">Report ID: {boardReport.reportId}</span>
                  <h4 className="text-base font-black text-white mt-0.5">MAS TRM Board Assurance Report</h4>
                  <p className="text-xs text-slate-400">Reporting Period: {boardReport.reportingPeriod}</p>
                </div>
                <div className="text-right">
                  {getPostureBadge(boardReport.overallPosture)}
                  <div className="text-[10px] font-mono text-slate-500 mt-1">SHA-256: {boardReport.cryptographicSignature.slice(0, 16)}...</div>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <h5 className="font-bold text-slate-200 mb-1">Executive Summary:</h5>
                  <p className="text-slate-400 leading-relaxed">{boardReport.executiveSummary}</p>
                </div>

                <div>
                  <h5 className="font-bold text-slate-200 mb-1">Material Technology Risks & Critical Resilience:</h5>
                  <p className="text-slate-400 leading-relaxed">{boardReport.resilience4HourRtoPosture} {boardReport.materialTechRisksSummary}</p>
                </div>

                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px]">
                  <span className="font-bold">Assurance Limitation Notice:</span> {boardReport.assuranceLimitationNotice}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: AI CONTINUOUS ASSURANCE COPILOT */}
      {activeTab === 'copilot' && (
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">MAS TRM Continuous Assurance AI Copilot</h3>
              <p className="text-xs text-slate-400">Grounded regulatory reasoning with 7-layer taxonomy & anti-hallucination guardrails.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <input
              type="text"
              placeholder="Ask e.g. Why is this control at risk? What does Clause 9 mandate? What are the 4-hour RTO requirements?"
              value={copilotQuery}
              onChange={e => setCopilotQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAskCopilot()}
              className="flex-1 px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleAskCopilot}
              className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-2 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ask Copilot
            </button>
          </div>

          {copilotResponse && (
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                    Classification: {copilotResponse.sourceClassification}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Confidence: {copilotResponse.confidenceLevel} ({Math.round(copilotResponse.confidenceScore * 100)}%)
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-500">Hash: {copilotResponse.documentHash.slice(0, 16)}...</div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 mb-1">Authoritative Answer:</h4>
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-850">
                  {copilotResponse.answer}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-500 block font-semibold">Official Citation</span>
                  <span className="text-slate-300">{copilotResponse.officialCitation}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-500 block font-semibold">Section Reference</span>
                  <span className="text-slate-300">{copilotResponse.sectionReference}</span>
                </div>
              </div>

              {copilotResponse.identifiedEvidenceGaps && copilotResponse.identifiedEvidenceGaps.length > 0 && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  <span className="font-bold">Identified Gaps:</span> {copilotResponse.identifiedEvidenceGaps.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL DRAWER: SHOW ME WHY (14-STAGE TRACE) */}
      {showMeWhyTrace && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-indigo-400 font-bold">14-STAGE CANONICAL ASSURANCE PROVENANCE</span>
                <h3 className="text-base font-bold text-white">{showMeWhyTrace.controlCode} — {showMeWhyTrace.controlTitle}</h3>
              </div>
              <button
                onClick={() => setShowMeWhyTrace(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-indigo-400 font-bold block mb-1">STAGE 1 & 2: REGULATORY SOURCE & STATUTORY VERSION</span>
                <p className="text-slate-200 font-medium">{showMeWhyTrace.stage1_regulatorySource.authority} — {showMeWhyTrace.stage1_regulatorySource.documentTitle}</p>
                <div className="text-[10px] text-slate-500 mt-1">Act: {showMeWhyTrace.stage2_regulatoryVersion.statutoryAct} • SHA-256: {showMeWhyTrace.stage1_regulatorySource.sha256Digest.slice(0, 16)}...</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-indigo-400 font-bold block mb-1">STAGE 3 & 4: CLAUSE & MANDATORY REQUIREMENT</span>
                <p className="text-slate-200 font-medium">Clause {showMeWhyTrace.stage3_clause.clauseNumber}: {showMeWhyTrace.stage3_clause.clauseTitle} ({showMeWhyTrace.stage3_clause.officialPageRange})</p>
                <p className="text-slate-400 mt-1 italic">"{showMeWhyTrace.stage4_requirement.statutoryText}"</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-indigo-400 font-bold block mb-1">STAGE 5 & 6: OBJECTIVE & CANONICAL CONTROL 360</span>
                <p className="text-slate-200 font-medium">{showMeWhyTrace.stage6_canonicalControl.canonicalCode} — {showMeWhyTrace.stage6_canonicalControl.title}</p>
                <p className="text-slate-400 mt-1">{showMeWhyTrace.stage5_controlObjective.statement}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-indigo-400 font-bold block mb-1">STAGE 10: EVIDENCE VALIDATION & CRYPTOGRAPHIC INTEGRITY</span>
                <p className="text-slate-200 font-medium">{showMeWhyTrace.stage10_evidence.title} ({showMeWhyTrace.stage10_evidence.evidenceId})</p>
                <div className="text-[10px] text-slate-500 mt-1">Freshness: {showMeWhyTrace.stage10_evidence.freshnessStatus} • SHA-256: {showMeWhyTrace.stage10_evidence.sha256Digest.slice(0, 16)}...</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-indigo-400 font-bold block mb-1">STAGE 11 & 12: EMPIRICAL TEST FIELDWORK & EFFECTIVENESS</span>
                <p className="text-slate-200 font-medium">Method: {showMeWhyTrace.stage11_controlTest.testMethod} • Sample: {showMeWhyTrace.stage11_controlTest.sampleSize}</p>
                <div className="text-emerald-400 font-bold mt-1">Design: {showMeWhyTrace.stage12_testResult.designEffectiveness} | Operating: {showMeWhyTrace.stage12_testResult.operatingEffectiveness}</div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800">
                <span className="text-[10px] font-mono text-emerald-400 font-bold block mb-1">STAGE 14: DETERMINISTIC CONTINUOUS ASSURANCE CONCLUSION</span>
                <div className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  {showMeWhyTrace.stage14_finalAssurance.assuranceState} (Confidence: {showMeWhyTrace.stage14_finalAssurance.confidenceLevel})
                </div>
                <p className="text-xs text-emerald-200 mt-1">{showMeWhyTrace.stage14_finalAssurance.rationale}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DRAWER: SHOW ME WHAT CHANGED (DIFFS) */}
      {selectedDiffControl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-blue-400 font-bold">SHOW ME WHAT CHANGED — ASSURANCE TRANSITION TIMELINE</span>
                <h3 className="text-base font-bold text-white">Assurance Delta History: {selectedDiffControl}</h3>
              </div>
              <button
                onClick={() => setSelectedDiffControl(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {showWhatChangedDiffs.filter(d => d.controlCode === selectedDiffControl).length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No assurance state transitions recorded. Control is operating in steady-state continuous assurance.
                </div>
              ) : (
                showWhatChangedDiffs.filter(d => d.controlCode === selectedDiffControl).map((d, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-500">{d.timestamp} • {d.triggerCategory}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">{d.previousAssurance}</span>
                        <span>→</span>
                        <span className="text-[10px] font-bold text-white">{d.currentAssurance}</span>
                      </div>
                    </div>
                    <p className="text-slate-200 font-medium">{d.transitionReason}</p>
                    <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded border border-slate-850">
                      {d.deltaDetails}
                    </div>
                    <div className="text-[11px] text-indigo-400 font-semibold">
                      Required Action: {d.actionRequired}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
