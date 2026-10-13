/**
 * SKANDA ENTERPRISE VENDOR FINDINGS & CLOSED-LOOP CAPA WORKSPACE
 * Path: src/components/tprm/VendorFindingsCapaWorkspace.tsx
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  FileCheck2,
  Clock,
  UserCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useTprmStore } from '../../stores/useTprmStore';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import { TprmFindingItem } from '../../types/tprmTypes';

export const VendorFindingsCapaWorkspace: React.FC = () => {
  const { theme } = useGRC();
  const { showToast } = useToast();
  const { vendors, actions: { closeFinding } } = useTprmStore();

  const [selectedFinding, setSelectedFinding] = useState<TprmFindingItem | null>(null);

  const isLight = theme === 'light';

  // Aggregate findings across all vendors
  const allFindings = vendors.flatMap(v => v.findings);

  const handleRetestAction = (finding: TprmFindingItem, outcome: 'PASS' | 'FAIL') => {
    const res = closeFinding(finding.vendorId, finding.id, 'Independent QSA Assessor', outcome);
    if (res.success) {
      showToast({
        title: 'Retest Passed & Finding Closed',
        message: res.message,
        type: 'success'
      });
      setSelectedFinding(null);
    } else {
      showToast({
        title: 'Closure Blocked by Retest Gate',
        message: res.message,
        type: 'error'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div
        className={`p-6 rounded-2xl border transition ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border bg-rose-500/15 text-rose-400 border-rose-500/30">
                Closed-Loop CAPA & Retesting Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Mandatory Independent Retest Before Verified Closure
              </span>
            </div>
            <h2 className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Vendor Deficiencies, CAPA Remediation & Retesting Ledger
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-0.5 leading-relaxed">
              No finding is marked resolved merely because an action is completed. Technical retesting must verify control effectiveness before closure.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Findings Ledger Table */}
      <div
        className={`p-5 rounded-2xl border space-y-4 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Active Findings & Corrective Action Plans ({allFindings.length})
            </h3>
          </div>
        </div>

        {allFindings.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-60" />
            <p>Zero active findings across all enterprise suppliers. Risk posture is optimal.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead
                className={`text-[11px] uppercase font-bold border-b ${
                  isLight ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <tr>
                  <th className="p-3">Finding Code & Title</th>
                  <th className="p-3">Vendor Entity</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Remediation Status</th>
                  <th className="p-3">Retest Requirement</th>
                  <th className="p-3">Target Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-700' : 'divide-slate-800 text-slate-300'}`}>
                {allFindings.map(f => (
                  <tr key={f.id} className="hover:bg-slate-500/5 transition">
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white">{f.title}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{f.findingCode} • {f.category}</span>
                    </td>
                    <td className="p-3 font-semibold">{f.vendorName}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                          f.severity === 'CRITICAL' || f.severity === 'HIGH'
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {f.severity}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          f.status === 'VERIFIED_CLOSED'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : f.status === 'RETEST_FAILED'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {f.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px]">
                      {f.independentRetestRequired ? (
                        <span className="text-sky-400 font-bold">Mandatory Retest</span>
                      ) : (
                        <span className="text-slate-400">Desk Review Only</span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-400">{f.targetRemediationDate}</td>
                    <td className="p-3 text-right">
                      {f.status !== 'VERIFIED_CLOSED' ? (
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleRetestAction(f, 'PASS')}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-xs cursor-pointer"
                          >
                            Pass Retest & Close
                          </button>
                          <button
                            onClick={() => handleRetestAction(f, 'FAIL')}
                            className="px-2 py-1 rounded bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-[11px] cursor-pointer"
                          >
                            Fail Retest
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-emerald-400 font-bold flex items-center justify-end space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Closed & Audited</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
