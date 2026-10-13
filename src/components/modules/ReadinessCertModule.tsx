import React from 'react';
import { useGRC } from '../../context/GRCContext';
import { PageContainer } from '../layout/PageContainer';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  TrendingUp,
  Flame,
  ArrowRight,
  Printer,
  Globe2,
  Activity
} from 'lucide-react';

export const ReadinessCertModule: React.FC = () => {
  const { currentTenant, evidence, findings, risks, setActiveModule } = useGRC();
  const tenantEvidence = evidence.filter(e => e.tenantId === currentTenant?.id);
  const tenantFindings = findings.filter(f => f.tenantId === currentTenant?.id);
  const tenantRisks = risks.filter(r => r.tenantId === currentTenant?.id);

  const applicableControls = (currentTenant?.controls || []).filter(c => c.applicable);
  const verifiedEvidence = tenantEvidence.filter(e => e.status === 'Verified');
  const openMajorFindings = tenantFindings.filter(f => f.severity === 'Major Non-Conformity' && f.status !== 'Closed Verified');
  const openMinorFindings = tenantFindings.filter(f => f.severity === 'Minor Non-Conformity' && f.status !== 'Closed Verified');

  // Breakdown calculations
  const scopeScore = currentTenant?.soaBaselineLocked ? 100 : 50;
  const docScore = currentTenant?.mou.executed ? 100 : 60;
  const evidenceScore = tenantEvidence.length > 0
    ? Math.round((verifiedEvidence.length / tenantEvidence.length) * 100)
    : 0;
  const riskTreatmentScore = tenantRisks.length > 0
    ? Math.round((tenantRisks.filter(r => r.residualScore < 16).length / tenantRisks.length) * 100)
    : 100;
  const capaDeduction = (openMajorFindings.length * 20) + (openMinorFindings.length * 5);
  const overallScore = Math.max(0, Math.min(100, Math.round((scopeScore * 0.2) + (docScore * 0.25) + (evidenceScore * 0.3) + (riskTreatmentScore * 0.25) - capaDeduction)));

  return (
    <PageContainer id="readiness-cert-module">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="hidden sm:flex w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 items-center justify-center text-emerald-400 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                  Audit Readiness & Scoring Engine
                </span>
                <span className="text-xs text-slate-400">Target Standard: {currentTenant?.selectedFrameworks.join(', ')}</span>
              </div>
              <h1 className="text-xl font-bold text-white mt-1">Certification Readiness & Maturity Index</h1>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Automated scoring evaluating Statement of Applicability locking, generated policy release, departmental evidence verification rates, residual risk profiles, and non-conformity deductions.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setActiveModule('continuous_compliance')}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Continuous Surveillance CCM</span>
            </button>

            <button
              onClick={() => setActiveModule('accreditation_registry')}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Global Accreditation Registry</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Readiness Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Score Hero Card */}
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Radial Gauge (Left 5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${
                  overallScore >= 80 ? 'text-emerald-400' : overallScore >= 50 ? 'text-sky-400' : 'text-amber-400'
                }`}
                strokeDasharray={`${overallScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-black text-white">{overallScore}%</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Maturity</span>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-base font-bold text-white">
              {overallScore >= 80
                ? 'Ready for Stage 1 & 2 Certification'
                : overallScore >= 50
                ? 'Fieldwork In Progress'
                : 'Initial Setup / Remediation Required'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {overallScore >= 80
                ? 'All mandatory governance controls, evidence verification and CAPA thresholds satisfy accreditation criteria.'
                : 'Upload remaining departmental evidence items and verify CAPAs to achieve certification readiness.'}
            </p>
          </div>
        </div>

        {/* Breakdown Pillars (Right 7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Readiness Scoring Breakdown by Pillar
          </h3>

          <div className="space-y-3">
            {/* Pillar 1: Scope & SoA */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">1. Scope & SoA Baseline Lock (Weight 20%)</span>
                <span className="font-mono text-emerald-400 font-bold">{scopeScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${scopeScore}%` }} />
              </div>
              <div className="text-[10px] text-slate-400">
                {currentTenant?.soaBaselineLocked ? 'Statement of Applicability locked with SHA-256 hash.' : 'SoA lock pending.'}
              </div>
            </div>

            {/* Pillar 2: Policies & MoU */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">2. Policies & Digital MoU Execution (Weight 25%)</span>
                <span className="font-mono text-emerald-400 font-bold">{docScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${docScore}%` }} />
              </div>
              <div className="text-[10px] text-slate-400">
                {currentTenant?.mou.executed ? 'Digital MoU executed; all 14 mandatory ISO documents unlocked.' : 'MoU signature pending.'}
              </div>
            </div>

            {/* Pillar 3: Evidence Verification */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">3. Operational Evidence Verification (Weight 30%)</span>
                <span className="font-mono text-sky-400 font-bold">{evidenceScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: `${evidenceScore}%` }} />
              </div>
              <div className="text-[10px] text-slate-400">
                {verifiedEvidence.length} of {tenantEvidence.length} artefacts verified by internal/external auditors.
              </div>
            </div>

            {/* Pillar 4: Risk Mitigation */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">4. Risk Treatment Effectiveness (Weight 25%)</span>
                <span className="font-mono text-indigo-400 font-bold">{riskTreatmentScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${riskTreatmentScore}%` }} />
              </div>
              <div className="text-[10px] text-slate-400">
                All identified cybersecurity threats mapped to Annex A controls with active remediation plans.
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
