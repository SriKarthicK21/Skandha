import React from 'react';
import { useGRC } from '../../context/GRCContext';
import { PageContainer } from '../layout/PageContainer';
import { DataCollectionRequired } from '../common/DataCollectionRequired';
import {
  ShieldCheck,
  Building2,
  FileSignature,
  Layers,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  Lock,
  Unlock,
  Users2,
  Server,
  ClipboardList
} from 'lucide-react';

export const BusinessDiscovery: React.FC = () => {
  const {
    currentTenant,
    currentRole,
    evidence,
    risks,
    findings,
    superAdminRecommendations,
    setActiveModule
  } = useGRC();

  const tenantEvidence = evidence.filter(e => e.tenantId === currentTenant?.id);
  const tenantRisks = risks.filter(r => r.tenantId === currentTenant?.id);
  const tenantFindings = findings.filter(f => f.tenantId === currentTenant?.id);
  const tenantRecs = superAdminRecommendations.filter(r => r.tenantId === currentTenant?.id);

  const highRisks = tenantRisks.filter(r => r.residualScore >= 12);
  const verifiedEvidence = tenantEvidence.filter(e => e.status === 'Verified');
  const evidenceComplianceRate = tenantEvidence.length > 0
    ? Math.round((verifiedEvidence.length / tenantEvidence.length) * 100)
    : 0;

  const openFindings = tenantFindings.filter(f => f.status !== 'Closed Verified');
  const applicableControls = (currentTenant?.controls || []).filter(c => c.applicable);

  return (
    <PageContainer id="business-discovery-module">
      {/* Top Welcome / Tenant Status Hero */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Governance & ISMS Scope Baseline
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              TENANT: {currentTenant?.id.toUpperCase()}
            </span>
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">
            {currentTenant ? currentTenant.name : 'Welcome to GRC Portal'}
          </h1>

          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {currentTenant?.businessScope.statement ||
              'Configure your organizational scope, lock Statement of Applicability, and track ongoing compliance against ISO standards.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
            <span className="flex items-center space-x-1.5 text-slate-200 font-medium">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>{currentTenant?.industryType}</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1.5 text-slate-200 font-medium">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>{currentTenant?.selectedFrameworks.join(', ') || 'ISO/IEC 27001:2022'}</span>
            </span>
          </div>
        </div>

        {/* Readiness Score Card */}
        <div className="flex flex-col items-center justify-center p-5 bg-slate-950/80 border border-slate-800 rounded-2xl min-w-[200px] shrink-0 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Audit Readiness Score
          </div>
          {!currentTenant || currentTenant.isDemo || !currentTenant.readinessScore || currentTenant.readinessScore === 0 ? (
            <div className="py-2">
              <DataCollectionRequired
                variant="badge"
                title="Data collection required"
                description="Real telemetry and evidence needed"
              />
            </div>
          ) : (
            <>
              <div className="text-3xl font-black text-emerald-400 leading-none">
                {currentTenant.readinessScore}%
              </div>
              <div className="w-full bg-slate-800 h-2 mt-3 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${currentTenant.readinessScore}%` }}
                />
              </div>
            </>
          )}
          <button
            onClick={() => setActiveModule('readiness_cert')}
            className="mt-3 text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center space-x-1 transition"
          >
            <span>View Full Breakdown</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Onboarding Phase Notification Banner if not yet completed */}
      {currentTenant && currentTenant.onboardingPhase < 5 && (
        <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-200">
                Onboarding In Progress — Phase {currentTenant.onboardingPhase} of 4 Pending
              </h4>
              <p className="text-[11px] text-amber-300/80 mt-0.5">
                {currentTenant.onboardingPhase === 1 && 'Complete legal registration and registered office address.'}
                {currentTenant.onboardingPhase === 2 && 'Define business boundaries and lock the Statement of Applicability (SoA) baseline.'}
                {currentTenant.onboardingPhase === 3 && 'Synthesize full ISO document suite and framework controls.'}
                {currentTenant.onboardingPhase === 4 && 'Execute digital Memorandum of Understanding (MoU) to release generated policies.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModule('onboarding_survey')}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 shadow-sm transition"
          >
            <span>Resume Onboarding Survey</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SoA Controls */}
        <div
          onClick={() => setActiveModule('control_library')}
          className="bg-slate-900 p-5 border border-slate-800 rounded-2xl hover:border-blue-500/50 transition cursor-pointer group"
        >
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Applicable Controls</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-white leading-none">{applicableControls.length}</span>
            <span className="text-[11px] text-slate-400 font-medium">/ {currentTenant?.controls.length || 0}</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 mt-3 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full"
              style={{ width: `${Math.round((applicableControls.length / (currentTenant?.controls.length || 1)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Evidence items */}
        <div
          onClick={() => setActiveModule('evidence_centre')}
          className="bg-slate-900 p-5 border border-slate-800 rounded-2xl hover:border-emerald-500/50 transition cursor-pointer group"
        >
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Evidence Verified</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-white leading-none">{evidenceComplianceRate}%</span>
            <span className="text-[11px] text-emerald-400 font-bold">{verifiedEvidence.length}/{tenantEvidence.length} items</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 mt-3 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${evidenceComplianceRate}%` }} />
          </div>
        </div>

        {/* High Residual Risks */}
        <div
          onClick={() => setActiveModule('risk_assessment')}
          className="bg-slate-900 p-5 border border-slate-800 rounded-2xl hover:border-rose-500/50 transition cursor-pointer group"
        >
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Critical / High Risks</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-white leading-none">{highRisks.length}</span>
            <span className="text-[11px] text-slate-400 font-medium">/ {tenantRisks.length} in register</span>
          </div>
          <div className="flex gap-1.5 mt-3">
            <div className={`h-1.5 flex-1 rounded-full ${highRisks.length > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
            <div className={`h-1.5 flex-1 rounded-full ${highRisks.length > 2 ? 'bg-rose-500' : 'bg-slate-800'}`}></div>
            <div className={`h-1.5 flex-1 rounded-full ${highRisks.length > 5 ? 'bg-rose-500' : 'bg-slate-800'}`}></div>
            <div className="h-1.5 flex-1 bg-slate-800 rounded-full"></div>
          </div>
        </div>

        {/* Open Audit Findings */}
        <div
          onClick={() => setActiveModule('findings_capa')}
          className="bg-slate-900 p-5 border border-slate-800 rounded-2xl hover:border-amber-500/50 transition cursor-pointer group"
        >
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Open Findings (CAPA)</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-white leading-none">{openFindings.length}</span>
            <span className="text-[11px] text-amber-400 font-bold">Action Required</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${openFindings.length > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(100, openFindings.length * 25)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Split: Super Admin Recommendations & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Super Admin Recommendations Feed (Left 2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Auditor & Advisory Directives
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono">
              {tenantRecs.length} Directives
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Expert guidance issued from our lead audit practice to optimize your control posture and address non-conformities prior to certification audit.
          </p>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {tenantRecs.map(rec => (
              <div
                key={rec.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">{rec.title}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        rec.priority === 'High'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : rec.priority === 'Medium'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      }`}
                    >
                      {rec.priority}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Category: {rec.category}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{rec.description}</p>

                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
                  <span>Advised by <strong className="text-slate-200">{rec.issuedBy}</strong></span>
                  <span className="text-sky-400 font-mono font-bold">Status: {rec.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Launch & Scope Overview (Right Col) */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 pb-3 border-b border-slate-800">
              Quick Action Shortcuts
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => setActiveModule('evidence_upload')}
                className="w-full text-left p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-blue-500/40 transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-sky-400">Upload Department Evidence</div>
                  <div className="text-[10px] text-slate-400">Fulfill scheduled audit evidence requirements</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400" />
              </button>

              <button
                onClick={() => setActiveModule('risk_map')}
                className="w-full text-left p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-blue-500/40 transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-sky-400">Open 5x5 Risk Heat Map</div>
                  <div className="text-[10px] text-slate-400">Inspect inherent vs. residual risk distribution</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400" />
              </button>

              <button
                onClick={() => setActiveModule('policies')}
                className="w-full text-left p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-blue-500/40 transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-sky-400">Policies & Procedures</div>
                  <div className="text-[10px] text-slate-400">Review generated ISO documentation suite</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400" />
              </button>

              <button
                onClick={() => setActiveModule('audit_trail')}
                className="w-full text-left p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-blue-500/40 transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-sky-400">Cryptographic Audit Ledger</div>
                  <div className="text-[10px] text-slate-400">Inspect SHA-256 state transition hashes</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400" />
              </button>
            </div>
          </div>

          {/* MoU Status Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Digital MoU Agreement</span>
              {currentTenant?.mou.executed ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase">
                  Executed
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase">
                  Pending
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              {currentTenant?.mou.executed
                ? `Signed by ${currentTenant.mou.signatoryName} (${currentTenant.mou.signatoryRole}). All policies and audit schedules active.`
                : 'Digital MoU must be executed in Phase 4 to release official policies and activate external audit inspection window.'}
            </p>

            <button
              onClick={() => setActiveModule('onboarding_survey')}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 text-center transition"
            >
              {currentTenant?.mou.executed ? 'View Executed Agreement' : 'Execute MoU Now'}
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
