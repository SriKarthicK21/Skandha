// ============================================================================
// SKANDA ENTERPRISE GRC: DPDP PRIVACY COMMAND CENTER
// Path: src/components/dpdp/DPDPPrivacyCommandCenter.tsx
//
// Real-time Privacy Operations and Continuous Assurance Cockpit:
// - Live Posture Score deriving from empirical controls & evidence
// - 12 Canonical Privacy KPI Tiles with click-to-source drill-down
// - Real-time Privacy Monitoring Signals stream
// - Master DPDP Act 2023 & Rules 2025 Statutory Requirement Assurance Grid
// - "Show Me Why" Deep-Audit Traceability Integration
// - Regulatory Change Intelligence Feed
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  Shield,
  ShieldCheck,
  Database,
  FileCheck2,
  Users,
  Lock,
  AlertTriangle,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
  Clock,
  Building,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Scale,
  Download,
  Filter,
  Eye,
  Bell,
  RefreshCw,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { dpdpPrivacyEngineService } from '../../services/canonical/DpdpPrivacyEngineService';
import { DpdpRequirement } from '../../types/dpdpPlatformTypes';
import { DPDPPrivacyCopilotDrawer } from './DPDPPrivacyCopilotDrawer';

interface DPDPPrivacyCommandCenterProps {
  tenantId: string;
  onNavigateTab?: (tabId: string) => void;
  onNavigate?: (tabId: string) => void;
  onOpenShowMeWhy?: (requirementId: string) => void;
}

export const DPDPPrivacyCommandCenter: React.FC<DPDPPrivacyCommandCenterProps> = ({
  tenantId,
  onNavigateTab,
  onNavigate,
  onOpenShowMeWhy
}) => {
  const handleNav = onNavigateTab || onNavigate || (() => {});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_FORCE' | 'COMING_INTO_FORCE'>('ALL');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [selectedReqForModal, setSelectedReqForModal] = useState<DpdpRequirement | null>(null);

  const posture = useMemo(() => dpdpPrivacyEngineService.getTenantPostureSummary(tenantId), [tenantId]);
  const postureBreakdown = useMemo(() => dpdpPrivacyEngineService.getPrivacyPostureBreakdown(tenantId), [tenantId]);
  const requirements = useMemo(() => dpdpPrivacyEngineService.getRegulatoryRequirements(), []);
  const signals = useMemo(() => dpdpPrivacyEngineService.getPrivacySignals(tenantId), [tenantId]);
  const regChanges = useMemo(() => dpdpPrivacyEngineService.getRegulatoryChanges(), []);
  const anomalies = useMemo(() => dpdpPrivacyEngineService.detectPurposeAnomalies(tenantId), [tenantId]);
  const incidentClocks = useMemo(() => dpdpPrivacyEngineService.getIncidentClocks(tenantId), [tenantId]);
  const crossBorderEvals = useMemo(() => dpdpPrivacyEngineService.getCrossBorderEvaluations(tenantId), [tenantId]);

  const filteredRequirements = useMemo(() => {
    return requirements.filter(req => {
      const matchesSearch =
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.sectionOrRuleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || req.commencementStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requirements, searchTerm, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Top Banner: Real-Time Assurance Cockpit */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/60 shadow-lg text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-radial from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1" />
                DPDP Rules 2025 (Notified 13-Nov-2025)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Sovereign Tenant: {tenantId}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
                {postureBreakdown.evaluationMethodology}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center space-x-2">
              <span>DPDP PRIVACY OPERATIONS & ASSURANCE COMMAND CENTER</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Continuous privacy assurance connecting personal data inventory, RoPA, notice studio, consent lifecycle, DSR blast radius, retention locks, multi-clock incidents, and empirical audit justification.
            </p>
          </div>

          {/* Quick Actions & Copilot Launcher */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsCopilotOpen(true)}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-md hover:shadow-indigo-500/20 flex items-center space-x-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ask Privacy Copilot</span>
            </button>
            <button
              onClick={() => onNavigateTab('dpdp_inventory')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 shadow-xs transition-colors flex items-center space-x-1"
            >
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span>Data Inventory</span>
            </button>
            <button
              onClick={() => onNavigateTab('dpdp_dsr')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 shadow-xs transition-colors flex items-center space-x-1"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>DSR Center ({posture.openDsrRequestsCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8-Pillar Posture Scorecard Ribbon */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>SKANDA Privacy Assurance Posture (8 Canonical Pillars)</span>
            </span>
            <p className="text-[11px] text-slate-500">Continuous empirical assessment derived from canonical graph entities and cryptographic evidence proofs.</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Overall Posture: {postureBreakdown.overallPostureScore}/100
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40">
            <div className="text-[10px] font-semibold text-slate-500">1. Regulatory</div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{postureBreakdown.pillars.regulatoryReadiness.score}%</div>
            <div className="text-[10px] text-emerald-600 font-medium">{postureBreakdown.pillars.regulatoryReadiness.effectiveCount}/{postureBreakdown.pillars.regulatoryReadiness.totalInForce} In Force</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40">
            <div className="text-[10px] font-semibold text-slate-500">2. Operations</div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{postureBreakdown.pillars.operationalReadiness.score}%</div>
            <div className="text-[10px] text-indigo-600 font-medium">{postureBreakdown.pillars.operationalReadiness.ropasApprovedCount} RoPAs Approved</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40">
            <div className="text-[10px] font-semibold text-slate-500">3. Data Gov</div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{postureBreakdown.pillars.dataGovernance.score}%</div>
            <div className="text-[10px] text-sky-600 font-medium">{postureBreakdown.pillars.dataGovernance.inventoryElementsCount} Elements</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40">
            <div className="text-[10px] font-semibold text-slate-500">4. Rights (DSR)</div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{postureBreakdown.pillars.rightsOperations.score}%</div>
            <div className="text-[10px] text-emerald-600 font-medium">{postureBreakdown.pillars.rightsOperations.dsrSlaAdherencePct}% SLA Adherent</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40">
            <div className="text-[10px] font-semibold text-slate-500">5. Processors</div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{postureBreakdown.pillars.processorGovernance.score}%</div>
            <div className="text-[10px] text-amber-600 font-medium">{postureBreakdown.pillars.processorGovernance.dpaCoveragePct}% DPA Active</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40">
            <div className="text-[10px] font-semibold text-slate-500">6. Security</div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{postureBreakdown.pillars.securitySafeguards.score}%</div>
            <div className="text-[10px] text-purple-600 font-medium">{postureBreakdown.pillars.securitySafeguards.encryptionPct}% AES-256</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40">
            <div className="text-[10px] font-semibold text-slate-500">7. Evidence</div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{postureBreakdown.pillars.evidenceAssurance.score}%</div>
            <div className="text-[10px] text-emerald-600 font-medium">{postureBreakdown.pillars.evidenceAssurance.hashVerifiedEvidenceCount} Artifacts</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40">
            <div className="text-[10px] font-semibold text-slate-500">8. Incidents</div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{postureBreakdown.pillars.incidentReadiness.score}%</div>
            <div className="text-[10px] text-indigo-600 font-medium">Multi-Clock Active</div>
          </div>
        </div>
      </div>

      {/* Multi-Clock Incident Overview Card */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Independent Regulatory Obligation Clocks</span>
          </span>
          <span className="text-[11px] text-slate-500">Statutory 6h CERT-In, Phased DPDP Rule 7 & Sector Clocks</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">CERT-In Cyber Reporting</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">IN FORCE</span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">Section 70B(6) IT Act 2000 / CERT-In Directions 2022 Para 6(ii)</div>
            <div className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 mt-2">6-Hour Statutory Window</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">DPDP Personal Data Breach</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">PHASED RUNWAY</span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">DPDP Rules 2025, Rule 7 (DPBI & Data Principal Intimation)</div>
            <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-2">72-Hour Form-A Intimation</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Cross-Border Transfers (§16)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">NEGATIVE-LIST</span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">Non-blanket localization with RBI Payment Overlay enforcement</div>
            <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-2">{crossBorderEvals.length} Monitored Flows</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Real-Time Signals & Statutory Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: DPDP Statutory Requirements & Assurance Matrix */}
        <div className="lg:col-span-2 space-y-3">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>DPDP Act 2023 & Rules 2025 Statutory Requirement Assurance</span>
                </h3>
                <p className="text-[11px] text-slate-500">Versioned statutory controls with empirical test procedures and &quot;Show Me Why&quot; proof.</p>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search Section, Rule, Control..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 w-48"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="ALL">All Phased Status</option>
                  <option value="IN_FORCE">In Force</option>
                  <option value="COMING_INTO_FORCE">Coming Into Force (SDF)</option>
                </select>
              </div>
            </div>

            {/* Requirements Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-2">Section / Rule</th>
                    <th className="pb-2">Requirement & Scope</th>
                    <th className="pb-2">Commencement</th>
                    <th className="pb-2">Assurance Status</th>
                    <th className="pb-2 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredRequirements.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors h-[38px]">
                      <td className="font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                        {req.sectionOrRuleNumber}
                      </td>
                      <td className="max-w-xs">
                        <div className="font-medium text-slate-900 dark:text-white truncate">{req.title}</div>
                        <div className="text-[10px] text-slate-400 truncate">{req.implementationObjective}</div>
                      </td>
                      <td>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                            req.commencementStatus === 'IN_FORCE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                              : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                          }`}
                        >
                          {req.commencementStatus}
                        </span>
                      </td>
                      <td>
                        <span className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{req.assuranceStatus}</span>
                        </span>
                      </td>
                      <td className="text-right whitespace-nowrap">
                        <button
                          onClick={() => onOpenShowMeWhy(req.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded border border-indigo-200 dark:border-indigo-800 transition-colors inline-flex items-center space-x-1"
                        >
                          <HelpCircle className="w-3 h-3" />
                          <span>Show Me Why</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Privacy Monitoring Signals & Regulatory Intelligence */}
        <div className="space-y-4">
          {/* Real-time Signals */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                <span>Real-Time Privacy Signals ({signals.length})</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-600 font-semibold">Active Telemetry</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {signals.map(sig => (
                <div
                  key={sig.id}
                  className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                    sig.severity === 'WARNING'
                      ? 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
                      : 'bg-sky-50/70 border-sky-200 dark:bg-sky-950/30 dark:border-sky-900/60 text-sky-900 dark:text-sky-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{sig.title}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(sig.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">{sig.description}</p>
                  <div className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                    Action: {sig.recommendedAction}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regulatory Change Monitor */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Scale className="w-3.5 h-3.5 text-indigo-500" />
                <span>MeitY Gazette Change Intelligence</span>
              </h3>
              <span className="text-[10px] font-mono text-indigo-600 font-bold">Gazette Monitor</span>
            </div>

            {regChanges.map(chg => (
              <div key={chg.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-900 dark:text-white">{chg.gazetteReference}</span>
                  <span className="text-[10px] font-mono text-slate-400">{chg.notifiedDate}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">{chg.changeSummary}</p>
                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="font-semibold text-emerald-600">Status: {chg.status}</span>
                  <span className="text-slate-400">Impacted: {chg.impactedRequirementIds.length} Reqs</span>
                </div>
              </div>
            ))}
          </div>

          {/* Purpose Anomalies & Health Card */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Purpose & Notice Health Gating
            </h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-600 dark:text-slate-400">Orphaned Personal Data Elements:</span>
                <span className="font-bold text-emerald-600">{anomalies.orphanedDataElements.length} (Clean)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-600 dark:text-slate-400">Unnotified Processing Activities:</span>
                <span className="font-bold text-emerald-600">{anomalies.unnotifiedActivities.length} (Clean)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Copilot Drawer Component */}
      <DPDPPrivacyCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        tenantId={tenantId}
      />
    </div>
  );
};
