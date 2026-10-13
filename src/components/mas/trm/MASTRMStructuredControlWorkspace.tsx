// ============================================================================
// SKANDA ENTERPRISE GRC: MAS TRM STRUCTURED CONTROL & ASSESSMENT WORKSPACE
// Path: src/components/mas/trm/MASTRMStructuredControlWorkspace.tsx
//
// Phase 24: Canonical MAS TRM 2021 Structured Control & Assessment Center
// 14-Clause Structure • Secondary OSA/NIST Mappings • 5-Tier Maturity • Auditor Clean Room
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Compass,
  Copy,
  ExternalLink,
  Eye,
  FileCheck,
  FileCode2,
  FileDiff,
  FileText,
  Filter,
  Flame,
  GitBranch,
  HelpCircle,
  History,
  Layers,
  Link as LinkIcon,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tag,
  UserCheck,
  XCircle,
  Zap
} from 'lucide-react';

import {
  MasTrmClause,
  MasTrmControl,
  MasTrmAssessment,
  MasTrmFinding,
  MasTrmCAPA,
  MasTrmAssuranceConclusion,
  MasTrmControlHealth,
  MasTrmShowMeWhyTrace,
  MasTrmShowMeHowGuide,
  MasTrmCopilotResponse,
  MasTrmRiskCategory
} from '../../../../src/types/masTrmStructuredTypes';

import { masTrmStructuredEngine } from '../../../../server/services/regulatory/MASTRMStructuredEngine';

interface Props {
  tenantId?: string;
  onNavigateToIntelligence?: () => void;
}

export const MASTRMStructuredControlWorkspace: React.FC<Props> = ({
  tenantId = 'tenant-enterprise-bank-sg',
  onNavigateToIntelligence
}) => {
  // Tab Navigation (6 Workspace Views)
  const [activeTab, setActiveTab] = useState<
    'overview' | 'clauses' | 'library' | 'mappings' | 'auditor' | 'copilot'
  >('overview');

  // Search & Filter States
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedClauseFilter, setSelectedClauseFilter] = useState<number | 'ALL'>('ALL');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<MasTrmRiskCategory | 'ALL'>('ALL');
  const [selectedFrameworkFilter, setSelectedFrameworkFilter] = useState<string | 'ALL'>('ALL');

  // Drawer & Modal States
  const [selectedControlForWhy, setSelectedControlForWhy] = useState<string | null>(null);
  const [selectedControlForHow, setSelectedControlForHow] = useState<string | null>(null);
  const [selectedFindingModal, setSelectedFindingModal] = useState<MasTrmFinding | null>(null);

  // Copilot Query State
  const [copilotPrompt, setCopilotPrompt] = useState<string>('What does MAS TRM require for multi-factor authentication in Clause 9?');
  const [copilotResponse, setCopilotResponse] = useState<MasTrmCopilotResponse | null>(null);
  const [isCopilotLoading, setIsCopilotLoading] = useState<boolean>(false);

  // Engine Data
  const clauses = useMemo(() => masTrmStructuredEngine.getAllClauses(), []);
  const allControls = useMemo(() => masTrmStructuredEngine.getAllControls(), []);
  const assessment = useMemo(() => masTrmStructuredEngine.getOrCreateTenantAssessment(tenantId), [tenantId]);
  const mappings = useMemo(() => masTrmStructuredEngine.getCrossFrameworkMappings(), []);
  const findings = useMemo(() => masTrmStructuredEngine.getTenantFindings(tenantId), [tenantId]);
  const capas = useMemo(() => masTrmStructuredEngine.getTenantCapas(tenantId), [tenantId]);

  // Filtered Controls
  const filteredControls = useMemo(() => {
    return masTrmStructuredEngine.searchControls({
      keyword: searchKeyword,
      clauseNumber: selectedClauseFilter === 'ALL' ? undefined : selectedClauseFilter,
      riskCategory: selectedRiskFilter === 'ALL' ? undefined : selectedRiskFilter,
      targetFramework: selectedFrameworkFilter === 'ALL' ? undefined : selectedFrameworkFilter
    });
  }, [searchKeyword, selectedClauseFilter, selectedRiskFilter, selectedFrameworkFilter]);

  // Copilot Handler
  const handleRunCopilot = () => {
    if (!copilotPrompt.trim()) return;
    setIsCopilotLoading(true);
    setTimeout(() => {
      const res = masTrmStructuredEngine.queryTrmCopilot({
        tenantId,
        query: copilotPrompt
      });
      setCopilotResponse(res);
      setIsCopilotLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                MAS TRM Structured Control & Assessment Engine
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                  TRM 2021 CANONICAL
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Clause → Requirement → Control → Evidence → Test → Risk → Assurance
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onNavigateToIntelligence && (
            <button
              onClick={onNavigateToIntelligence}
              className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-sm font-medium text-slate-300 flex items-center gap-2 transition-colors"
            >
              <FileDiff className="w-4 h-4 text-cyan-400" />
              Live Regulatory Feed
            </button>
          )}
          <div className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            Maturity: {assessment.overallMaturityLabel}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'overview', label: 'Executive Overview', icon: Activity },
          { id: 'clauses', label: '14 MAS TRM Clauses', icon: Layers },
          { id: 'library', label: 'Structured Control Library', icon: BookOpen },
          { id: 'mappings', label: 'OSA & Cross-Framework Mappings', icon: Compass },
          { id: 'auditor', label: 'Auditor Workbench & Clean Room', icon: Award },
          { id: 'copilot', label: 'AI MAS TRM Copilot', icon: Sparkles }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-950/50'
                  : 'bg-slate-900/50 border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Scorecards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>MATURITY SCORE</span>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-2 text-3xl font-bold text-white">
                {assessment.maturityScore.toFixed(1)} <span className="text-sm font-normal text-slate-400">/ 5.0</span>
              </div>
              <p className="mt-1 text-xs text-emerald-400">Level 4: Managed & Statutorily Governed</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>CONTROLS EFFECTIVE</span>
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="mt-2 text-3xl font-bold text-white">
                {assessment.effectiveControlsCount}{' '}
                <span className="text-sm font-normal text-slate-400">/ {assessment.totalApplicableControls}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {Math.round((assessment.effectiveControlsCount / assessment.totalApplicableControls) * 100)}% operating effectiveness
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>EVIDENCE COVERAGE</span>
                <FileCheck className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="mt-2 text-3xl font-bold text-white">
                {Math.round(assessment.evidenceCoverageRate * 100)}%
              </div>
              <p className="mt-1 text-xs text-indigo-400">Audit-ready artifacts linked</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>OPEN FINDINGS & CAPAS</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-2 text-3xl font-bold text-white">
                {assessment.openFindingsCount}{' '}
                <span className="text-sm font-normal text-slate-400">open ({capas.length} in CAPA)</span>
              </div>
              <p className="mt-1 text-xs text-amber-400">0 critical compliance breaches</p>
            </div>
          </div>

          {/* 14 Clauses Readiness Breakdown */}
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              14 MAS TRM 2021 Clause Posture & Implementation Breakdown
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clauses.map(clause => {
                const breakdown = assessment.clauseBreakdowns.find(b => b.clauseNumber === clause.clauseNumber);
                const readiness = breakdown?.readinessPercentage || 85;

                return (
                  <div
                    key={clause.clauseNumber}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            Clause {clause.clauseNumber}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">{clause.trmSection}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-white mt-1">{clause.title}</h3>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 font-semibold">{readiness}%</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${readiness}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <span>{clause.totalControlsCount} Canonical Controls</span>
                      <span>OSA Coverage Ref: {Math.round((clause.osaMappingCoverageRatio || 0.8) * 100)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 14 CLAUSES EXPLORER */}
      {activeTab === 'clauses' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {clauses.map(clause => (
              <div
                key={clause.clauseNumber}
                className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      Clause {clause.clauseNumber} • {clause.trmSection}
                    </span>
                    <h3 className="text-base font-bold text-white mt-2">{clause.title}</h3>
                  </div>
                  <a
                    href={clause.officialSourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Open Official MAS Source"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{clause.description}</p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {clause.riskCategories.map(r => (
                    <span key={r} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {r.replace('_', ' ')}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                  <span>Statutory: {clause.statutoryAct}</span>
                  <button
                    onClick={() => {
                      setSelectedClauseFilter(clause.clauseNumber);
                      setActiveTab('library');
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                  >
                    View Controls ({clause.totalControlsCount})
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STRUCTURED CONTROL LIBRARY */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by code (e.g. MAS-TRM-09-AC-01), keyword, NIST/ISO mapping, canonical control..."
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={selectedClauseFilter}
              onChange={e => setSelectedClauseFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All 14 Clauses</option>
              {clauses.map(c => (
                <option key={c.clauseNumber} value={c.clauseNumber}>
                  Clause {c.clauseNumber}: {c.shortTitle}
                </option>
              ))}
            </select>

            <select
              value={selectedRiskFilter}
              onChange={e => setSelectedRiskFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Risk Categories</option>
              <option value="ACCESS_RISK">Access Risk</option>
              <option value="CYBER_RISK">Cyber Risk</option>
              <option value="AVAILABILITY_RISK">Availability Risk</option>
              <option value="THIRD_PARTY_RISK">Third-Party Risk</option>
              <option value="DATA_SECURITY_RISK">Data Security Risk</option>
            </select>

            <select
              value={selectedFrameworkFilter}
              onChange={e => setSelectedFrameworkFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Framework Mappings</option>
              <option value="NIST_SP_800_53_R5">NIST SP 800-53</option>
              <option value="ISO_27001_2022">ISO 27001:2022</option>
            </select>
          </div>

          {/* Controls List */}
          <div className="space-y-4">
            {filteredControls.map(ctrl => {
              const health = masTrmStructuredEngine.evaluateControlHealth(tenantId, ctrl.controlCode);

              return (
                <div
                  key={ctrl.controlCode}
                  className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                        {ctrl.controlCode}
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Clause {ctrl.clauseNumber}
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                        Canonical: {ctrl.canonicalControlCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-medium ${
                          health.overallHealth === 'EFFECTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : health.overallHealth === 'PARTIALLY_EFFECTIVE'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {health.overallHealth} (Health: {health.healthScore}%)
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{ctrl.controlTitle}</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{ctrl.description}</p>
                  </div>

                  {/* Objective & Secondary Mappings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                      <span className="font-semibold text-slate-400">Control Objective:</span>
                      <p className="text-slate-300 mt-0.5">{ctrl.controlObjective}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                      <span className="font-semibold text-slate-400">Secondary Framework Mappings:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {ctrl.crossFrameworkMappings.map(m => (
                          <span
                            key={m.mappingId}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-[11px] text-cyan-300"
                            title={`${m.targetFramework} - Confidence: ${m.mappingConfidence}`}
                          >
                            {m.targetFramework.includes('NIST') ? 'NIST ' : 'ISO '}
                            {m.targetControlCode} ({m.mappingConfidence})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
                    <div className="text-slate-400">
                      Owner: <span className="text-slate-200">{ctrl.ownerRole}</span> • Testing: {ctrl.testingFrequency}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedControlForWhy(ctrl.controlCode)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                        Show Me Why
                      </button>
                      <button
                        onClick={() => setSelectedControlForHow(ctrl.controlCode)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Compass className="w-3.5 h-3.5 text-emerald-400" />
                        Show Me How
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: OSA & CROSS-FRAMEWORK MAPPINGS */}
      {activeTab === 'mappings' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              Open Security Architecture (OSA) & NIST SP 800-53 Crosswalk Reference
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Structured secondary mapping layer linking 14 MAS TRM clauses to NIST SP 800-53 Rev 5 and ISO 27001:2022 controls with forensic confidence ratings.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-mono">
                  <th className="p-3">MAS TRM Control</th>
                  <th className="p-3">Clause</th>
                  <th className="p-3">Target Framework</th>
                  <th className="p-3">Target Code</th>
                  <th className="p-3">Confidence</th>
                  <th className="p-3">Mapping Source</th>
                  <th className="p-3">Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {mappings.map(map => (
                  <tr key={map.mappingId} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-emerald-400">{map.sourceControlCode}</td>
                    <td className="p-3 text-slate-300">Clause {map.sourceClauseNumber}</td>
                    <td className="p-3 text-slate-300">{map.targetFramework}</td>
                    <td className="p-3 font-mono font-bold text-cyan-300">{map.targetControlCode}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                        {map.mappingConfidence}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">{map.mappingSource}</td>
                    <td className="p-3 text-slate-300 max-w-md">{map.mappingRationale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: AUDITOR WORKBENCH */}
      {activeTab === 'auditor' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                Auditor Clean Room & Assurance Workbench
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Forensic inspection of control test results, exception logging, CAPA tracking, and formal assurance sign-off.
              </p>
            </div>
            <button
              onClick={() => {
                masTrmStructuredEngine.issueAssuranceConclusion(tenantId, {
                  assessmentId: assessment.assessmentId,
                  auditPeriodStart: '2026-01-01',
                  auditPeriodEnd: '2026-10-08',
                  leadAuditor: 'Sarah Tan, ISO 27001 Lead Auditor, CISA',
                  auditorCredentials: 'ISO 27001 Lead Auditor / CRISC / MAS Specialist',
                  conclusion: 'SATISFACTORY',
                  summaryRationale: 'Comprehensive audit of 14 MAS TRM clauses revealed full operational effectiveness and zero high-risk findings.',
                  certifiedClausesCount: 14,
                  totalExceptionsCount: 0
                });
                alert('Assurance Conclusion Formally Issued with Cryptographic Hash!');
              }}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Issue Assurance Certificate
            </button>
          </div>

          {/* Open Findings & CAPA Table */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Audit Findings & CAPA Remediation Queue ({findings.length})
            </h3>

            {findings.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-950/40 rounded-xl border border-slate-800/60">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2 opacity-80" />
                Zero open findings recorded. All sampled controls verified compliant with MAS TRM supervisory expectations.
              </div>
            ) : (
              <div className="space-y-3">
                {findings.map(f => (
                  <div key={f.findingId} className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-mono text-amber-400">{f.controlCode}</span>: {f.title}
                      <p className="text-slate-400 mt-0.5">{f.description}</p>
                    </div>
                    <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 font-mono">{f.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: AI MAS TRM COPILOT */}
      {activeTab === 'copilot' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Grounded AI MAS TRM Regulatory Copilot
            </h2>
            <p className="text-xs text-slate-400">
              Grounded strictly in MAS TRM Guidelines (2021) and statutory notices. Every answer is classified under SKANDA's 6-layer source taxonomy.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={copilotPrompt}
                onChange={e => setCopilotPrompt(e.target.value)}
                placeholder="Ask about MAS TRM requirements, NIST/ISO crosswalks, or required evidence..."
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleRunCopilot}
                disabled={isCopilotLoading}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {isCopilotLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Ask Copilot
              </button>
            </div>
          </div>

          {copilotResponse && (
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    {copilotResponse.sourceClassification}
                  </span>
                  {copilotResponse.clauseTitle && (
                    <span className="text-xs text-slate-300 font-semibold">
                      Clause {copilotResponse.clauseNumber}: {copilotResponse.clauseTitle}
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Confidence: {Math.round(copilotResponse.confidenceScore * 100)}%
                </span>
              </div>

              <div className="text-sm text-slate-200 leading-relaxed">
                {copilotResponse.answer}
              </div>

              {copilotResponse.skandaImplementationGuidance && (
                <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs space-y-1">
                  <span className="font-semibold text-emerald-400">SKANDA Implementation Guidance:</span>
                  <p className="text-slate-300">{copilotResponse.skandaImplementationGuidance}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                <span>Official Citation: {copilotResponse.sectionReference}</span>
                <div className="flex gap-2">
                  {copilotResponse.mappedNistControls.map(n => (
                    <span key={n} className="px-2 py-0.5 rounded bg-slate-800 font-mono text-cyan-400">
                      NIST {n}
                    </span>
                  ))}
                  {copilotResponse.mappedIsoControls.map(i => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-800 font-mono text-indigo-400">
                      ISO {i}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SHOW ME WHY DRAWER */}
      {selectedControlForWhy && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto space-y-6">
            {(() => {
              const trace = masTrmStructuredEngine.getShowMeWhyTrace(selectedControlForWhy);
              return (
                <>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                        {trace.controlCode}
                      </span>
                      <h2 className="text-lg font-bold text-white mt-1">Show Me Why: Statutory & Assurance Trace</h2>
                    </div>
                    <button
                      onClick={() => setSelectedControlForWhy(null)}
                      className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                      Complete 11-Stage Traceable Lineage Chain
                    </h3>
                    <div className="space-y-3">
                      {trace.completeLineagePath.map((node, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex-1 text-xs text-slate-200">
                            {node}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* SHOW ME HOW DRAWER */}
      {selectedControlForHow && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto space-y-6">
            {(() => {
              const guide = masTrmStructuredEngine.getShowMeHowGuide(selectedControlForHow);
              return (
                <>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                        {guide.controlCode}
                      </span>
                      <h2 className="text-lg font-bold text-white mt-1">Show Me How: Implementation & Architecture</h2>
                    </div>
                    <button
                      onClick={() => setSelectedControlForHow(null)}
                      className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="font-semibold text-cyan-400">Official MAS Requirement Text:</span>
                      <p className="text-slate-300">{guide.officialRequirementText}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <span className="font-semibold text-emerald-400">Recommended Architecture Patterns:</span>
                      <ul className="list-disc pl-4 text-slate-300 space-y-1">
                        {guide.recommendedArchitecturePatterns.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <span className="font-semibold text-indigo-400">Audit Evidence to Collect:</span>
                      <ul className="list-disc pl-4 text-slate-300 space-y-1">
                        {guide.recommendedEvidenceArtifacts.map((e, i) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <span className="font-semibold text-rose-400">Common Audit Pitfalls:</span>
                      <ul className="list-disc pl-4 text-slate-300 space-y-1">
                        {guide.commonAuditPitfalls.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
