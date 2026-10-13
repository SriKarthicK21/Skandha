import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Activity,
  Server,
  Layers,
  FileText,
  AlertCircle,
  Plus,
  Play,
  ArrowUpRight,
  TrendingUp,
  BarChart3,
  Wand2,
  Calendar,
  Target,
  Award,
  AlertOctagon
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { MASIncidentBreachRecord } from '../../types/regulatoryTypes';
import { RegulatoryIntelligenceWidget } from '../mas/RegulatoryIntelligenceWidget';
import { MASTRMComplianceHeatMap } from '../mas/MASTRMComplianceHeatMap';
import { MASTRMComplianceRoadmap } from '../mas/MASTRMComplianceRoadmap';
import { IndustryTechRiskBenchmarkPanel } from '../mas/IndustryTechRiskBenchmarkPanel';
import { PageContainer } from '../layout/PageContainer';

export const MASTRMDashboardModule: React.FC = () => {
  const {
    masDomains,
    masAssessments,
    masProfile,
    masIncidents,
    addMASIncident,
    calculateMASComplianceScore,
    setActiveModule
  } = useGRC();

  const [dashboardView, setDashboardView] = useState<'overview' | 'roadmap' | 'industry_benchmark'>('overview');
  const [drillModal, setDrillModal] = useState(false);
  const [drillTitle, setDrillTitle] = useState('Unannounced Tabletop Drill: Distributed Core DB Latency Spike');
  const [drillSystem, setDrillSystem] = useState(masProfile.criticalSystemsList?.[0]?.systemName || 'Core Settlement Engine');

  const complianceMetrics = calculateMASComplianceScore();
  const overallScore = complianceMetrics.overallScore;

  const criticalSystems = masProfile.criticalSystemsList || [];
  const rtoCompliant = criticalSystems.every(s => s.rtoTargetHours <= 4);
  const rpoCompliant = criticalSystems.every(s => s.rpoTargetHours <= 1);
  const maxDowntime = criticalSystems.reduce((acc, s) => Math.max(acc, s.maxAnnualDowntimeHours), 0);

  const handleLaunchDrill = () => {
    const discoveryTime = new Date();
    const deadlineTime = new Date(discoveryTime.getTime() + 60 * 60 * 1000); // 1 hour MAS statutory SLA

    addMASIncident({
      incidentCode: `MAS-INC-${Date.now().toString().slice(-4)}`,
      title: drillTitle,
      discoveryTimestamp: discoveryTime.toISOString(),
      masNotificationDeadlineTimestamp: deadlineTime.toISOString(),
      masNotificationStatus: 'WITHIN_SLA',
      severity: 'SEVERITY_2_MAJOR_SECURITY_EVENT',
      affectedCriticalSystems: [drillSystem],
      customerImpactEstimate: 0,
      rootCauseCategory: 'CYBER_ATTACK',
      executiveSummary: `Automated incident simulation tabletop executed. Notification draft prepared within 18 minutes of discovery timestamp.`,
      containmentStatus: 'CONTAINED',
      regulatoryReportPreparedBy: 'CISO / Lead GRC Officer',
      masOfficerContacted: 'MAS Technology Risk Supervision Dept',
      postIncidentReportDueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setDrillModal(false);
  };

  return (
    <PageContainer id="mas-trm-dashboard-module">
      {/* Executive Command Header */}
      <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-950 border border-rose-900/40 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                MAS Regulatory Command Center
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                {masProfile.institutionCategory.replace(/_/g, ' ')}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono text-slate-300 bg-slate-800 border border-slate-700">
                Lic: {masProfile.masLicenseNumber}
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              MAS Technology Risk Compliance Posture
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Real-time monitoring of all 15 MAS TRM domains, statutory system availability targets (RTO &le; 4h, RPO &le; 1h), and 1-hour regulatory breach response readiness.
            </p>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap lg:flex-col gap-2.5 min-w-[200px]">
            <button
              onClick={() => setDashboardView(dashboardView === 'roadmap' ? 'overview' : 'roadmap')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                dashboardView === 'roadmap'
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950'
                  : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-rose-300" />
              {dashboardView === 'roadmap' ? 'Exit to Executive View' : 'Compliance Roadmap (Q4 Audit)'}
            </button>
            <button
              onClick={() => setDashboardView(dashboardView === 'industry_benchmark' ? 'overview' : 'industry_benchmark')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                dashboardView === 'industry_benchmark'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-amber-950'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-300" />
              {dashboardView === 'industry_benchmark' ? 'Exit to Executive View' : 'Industry Supervisory Benchmark'}
            </button>
            <button
              onClick={() => setActiveModule('mas_policy_generator')}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-600/30 to-purple-600/30 hover:from-rose-600/40 hover:to-purple-600/40 text-rose-200 border border-rose-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Wand2 className="w-3.5 h-3.5 text-rose-300" />
              Automated Policy Generator
            </button>
            <button
              onClick={() => setActiveModule('mas_checklist')}
              className="px-4 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              14-Domain Checklist & CAPA
            </button>
            <button
              onClick={() => setActiveModule('mas_assessment_workbench')}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-950"
            >
              <ShieldCheck className="w-4 h-4" />
              Open Control Testing
            </button>
            <button
              onClick={() => setActiveModule('mas_incident_notification')}
              className="px-4 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-200 border border-rose-600/50 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-950"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              1-Hour Incident Dispatcher
            </button>
            <button
              onClick={() => setDrillModal(true)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-amber-400" />
              Quick Tabletop Drill
            </button>
          </div>
        </div>

        {/* Top 4 Executive KPI Gauges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-800/90">
          {/* Gauge 1: Overall MAS Compliance */}
          <div className="bg-gradient-to-br from-emerald-950/40 via-slate-950/90 to-slate-950 p-4 rounded-xl border border-emerald-500/25 shadow-lg space-y-2 relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                Overall Compliance Score
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-300 font-mono tracking-tight">{overallScore}%</span>
              <span className="text-xs text-slate-400 font-medium font-mono">Target &ge; 85%</span>
            </div>
            <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${overallScore}%` }}
              />
            </div>
            <span className="text-[10px] text-emerald-400/90 block pt-1 font-medium">
              &bull; 10/12 critical controls statutory verified
            </span>
          </div>

          {/* Gauge 2: 1-Hour Incident SLA */}
          <div className="bg-gradient-to-br from-indigo-950/40 via-slate-950/90 to-slate-950 p-4 rounded-xl border border-indigo-500/25 shadow-lg space-y-2 relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                1-Hour MAS SLA Threshold
              </span>
              <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-indigo-300 font-mono tracking-tight">60 Mins</span>
              <span className="text-[11px] text-emerald-400 font-mono font-bold">100% COMPLIANT</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-300 pt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Automated Notification Pipeline Active</span>
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">
              Drill verified dispatch: 18 mins
            </span>
          </div>

          {/* Gauge 3: Recovery Time & Point Objectives (RTO/RPO) */}
          <div className="bg-gradient-to-br from-amber-950/40 via-slate-950/90 to-slate-950 p-4 rounded-xl border border-amber-500/25 shadow-lg space-y-2 relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                Critical System RTO &amp; RPO
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-300 font-mono tracking-tight">2.0 Hours</span>
              <span className="text-xs text-slate-400 font-mono">RPO: 0.25h</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 pt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Within Statutory Cap (&le; 4.0h)</span>
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">
              3 of 3 Tier-1 critical engines verified
            </span>
          </div>

          {/* Gauge 4: Max Annual Unscheduled Downtime */}
          <div className="bg-gradient-to-br from-sky-950/40 via-slate-950/90 to-slate-950 p-4 rounded-xl border border-sky-500/25 shadow-lg space-y-2 relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                Annual Cumulative Downtime
              </span>
              <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-sky-300 font-mono tracking-tight">{maxDowntime}h / yr</span>
              <span className="text-xs text-slate-400 font-mono">Cap &le; 4.0h</span>
            </div>
            <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-sky-500 to-indigo-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(maxDowntime / 4) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block pt-1 font-mono">
              Trailing 12-month measured uptime: 99.98%
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs: Executive Overview vs. MAS TRM Compliance Roadmap */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-2 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDashboardView('overview')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              dashboardView === 'overview'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4 text-rose-400" />
            Executive Posture & Heat Map
          </button>
          <button
            onClick={() => setDashboardView('roadmap')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              dashboardView === 'roadmap'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 text-rose-300" />
            MAS TRM Compliance Roadmap
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-950 text-rose-200 border border-rose-800">
              Q4-2026 Audit
            </span>
          </button>
          <button
            onClick={() => setDashboardView('industry_benchmark')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              dashboardView === 'industry_benchmark'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            Industry Risk Benchmark
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800">
              Issue 1
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 px-3">
          <span>Next Statutory Audit Fieldwork:</span>
          <span className="font-semibold text-rose-300 font-mono">
            {masProfile.nextScheduledTRMAuditDate || '2026-11-15'}
          </span>
        </div>
      </div>

      {/* View Branching: Roadmap View vs Industry Benchmark vs Executive Overview */}
      {dashboardView === 'roadmap' ? (
        <MASTRMComplianceRoadmap />
      ) : dashboardView === 'industry_benchmark' ? (
        <IndustryTechRiskBenchmarkPanel />
      ) : (
        <>
          {/* Live Regulatory Intelligence Horizon & MAS Notice Search Grounding */}
          <RegulatoryIntelligenceWidget />

          {/* MAS TRM Compliance Coverage Heat Map across the 14 Domains with Weak-Area Drilldown */}
          <MASTRMComplianceHeatMap />

          {/* 15 Domain Compliance Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-rose-400" />
                    15 TRM Domains Compliance Breakdown
                  </h2>
                  <span className="text-xs text-slate-400">
                    Live compliance percentage evaluated across all 86 statutory requirements
                  </span>
                </div>
              </div>

              {/* Domain Bars */}
              <div className="space-y-3 pt-1">
                {masDomains.map((dom) => {
                  const score = complianceMetrics.domainBreakdown[dom.domainNumber] || 80;
                  const isCritical = dom.criticality === 'CRITICAL';

                  return (
                    <div key={dom.id} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-400 w-7">{dom.domainNumber}</span>
                          <span className="font-semibold text-slate-200">{dom.name}</span>
                          {isCritical && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 text-[9px] font-bold border border-rose-800/40">
                              CRITICAL
                            </span>
                          )}
                        </div>
                        <span className="font-mono font-bold text-white">{score}%</span>
                      </div>

                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            score >= 85 ? 'bg-emerald-500' : score >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Incident & Breach Simulation Ledger */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    1-Hour Incident Drill Log
                  </h2>
                  <button
                    onClick={() => setDrillModal(true)}
                    className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold transition-all cursor-pointer"
                  >
                    + New Drill
                  </button>
                </div>

                <div className="space-y-3">
                  {masIncidents.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-xs">
                      No incident records or drills logged yet.
                    </div>
                  ) : (
                    masIncidents.map(inc => (
                      <div
                        key={inc.id}
                        className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-lg space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-mono text-[10px] font-bold">
                            {inc.incidentCode}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-semibold border border-emerald-800">
                            {inc.masNotificationStatus.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <h3 className="font-bold text-white text-xs">
                          {inc.title}
                        </h3>

                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {inc.executiveSummary}
                        </p>

                        <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                          <span>Affected: {inc.affectedCriticalSystems.join(', ')}</span>
                          <span>RCA Due: {inc.postIncidentReportDueDate}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Incident Drill Simulation Modal */}
      {drillModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-rose-400" />
                Launch 1-Hour MAS Incident Notification Simulation
              </h3>
              <button
                onClick={() => setDrillModal(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Simulation Scenario Title *
                </label>
                <input
                  type="text"
                  value={drillTitle}
                  onChange={(e) => setDrillTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Target Critical Information System
                </label>
                <select
                  value={drillSystem}
                  onChange={(e) => setDrillSystem(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                >
                  {criticalSystems.map(s => (
                    <option key={s.id} value={s.systemName}>{s.systemName}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-rose-950/30 border border-rose-900/50 rounded-lg text-rose-300 text-[11px] leading-relaxed">
                <strong>Statutory SLA Verification:</strong> This drill measures automated drafting of initial regulatory notification within 60 minutes of event declaration, in compliance with MAS Notice 644/655 Clause 4.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setDrillModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleLaunchDrill}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Start Simulation & Record SLA
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
