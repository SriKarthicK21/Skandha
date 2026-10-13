import React from 'react';
import {
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  ShieldCheck,
  TrendingDown,
  Clock,
  DollarSign,
  UserCheck,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { TreatmentVerificationRecord } from '../../types/enterpriseRiskTypes';

interface TreatmentAssuranceLedgerViewProps {
  verifications: TreatmentVerificationRecord[];
}

export const TreatmentAssuranceLedgerView: React.FC<TreatmentAssuranceLedgerViewProps> = ({ verifications }) => {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Autonomous Treatment Assurance & Retest Ledger</h2>
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-mono">
              CLOSED-LOOP VERIFICATION
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Independent retest validation for risk treatment plans and CAPAs. Prevents premature closure without verified evidence or when residual score remains outside appetite.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs flex items-center gap-2">
            <span className="text-slate-400">Total Verified Treatments:</span>
            <span className="font-mono font-bold text-white">{verifications.length}</span>
          </div>
        </div>
      </div>

      {/* VERIFICATIONS LIST */}
      <div className="space-y-4">
        {verifications.map((v) => {
          const isClosed = v.status === 'VERIFIED_AND_CLOSED';
          const isFailed = v.status === 'VERIFICATION_FAILED';
          const isOutsideAppetite = v.status === 'RETEST_PASSED_OUTSIDE_APPETITE';

          const badgeStyle = isClosed
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            : isOutsideAppetite
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            : isFailed
            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            : 'bg-blue-500/10 text-blue-400 border-blue-500/30';

          return (
            <div
              key={v.treatmentId}
              className={`bg-slate-900/70 border rounded-xl p-5 space-y-4 ${
                isClosed ? 'border-slate-800' : isOutsideAppetite ? 'border-amber-500/30 bg-amber-500/5' : 'border-rose-500/40 bg-rose-500/5'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {v.treatmentId}
                    </span>
                    <span className="font-mono text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      Linked: {v.riskId}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${badgeStyle}`}>
                      {v.status}
                    </span>
                    {v.requiresBoardWaiver && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> WAIVER REQUIRED
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">{v.verificationProcedure}</h3>
                </div>

                {/* SCORE DELTA BOX */}
                <div className="flex items-center gap-3 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50 text-center shrink-0">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Pre-Score</span>
                    <span className="text-xs font-mono font-bold text-rose-400">{v.preTreatmentResidualScore}/25</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">Post-Score</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{v.postTreatmentResidualScore}/25</span>
                  </div>
                </div>
              </div>

              {/* DETAILS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/40">
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px] mb-1">Independent Retest Criteria:</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{v.retestCriteria}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px] mb-1">Financial Loss Reduction (ALE):</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-rose-400 font-mono font-semibold">${v.preTreatmentALEUSD.toLocaleString()}</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-emerald-400 font-mono font-semibold">${v.postTreatmentALEUSD.toLocaleString()}</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded ml-1">
                      -${(v.preTreatmentALEUSD - v.postTreatmentALEUSD).toLocaleString()} USD/yr
                    </span>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Verified By: <strong className="text-slate-300">{v.verifiedBy}</strong></span>
                  {v.closureApproved && (
                    <span className="text-emerald-400 font-medium ml-2">✓ Authorised Closure Approved</span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(v.verificationDate).toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TreatmentAssuranceLedgerView;
