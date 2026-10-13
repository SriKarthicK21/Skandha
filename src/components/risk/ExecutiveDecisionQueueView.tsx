import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Clock,
  UserCheck,
  CheckCircle2,
  Building2,
  FileText,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { ExecutiveDecisionItem } from '../../types/enterpriseRiskTypes';

interface ExecutiveDecisionQueueViewProps {
  decisionItems: ExecutiveDecisionItem[];
  onSelectDecision: (item: ExecutiveDecisionItem) => void;
  onNavigateTab: (tab: string) => void;
}

export const ExecutiveDecisionQueueView: React.FC<ExecutiveDecisionQueueViewProps> = ({
  decisionItems,
  onSelectDecision,
  onNavigateTab
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  const filteredItems = decisionItems.filter(item => {
    if (filterPriority !== 'ALL' && item.priority !== filterPriority) return false;
    return true;
  });

  const criticalCount = decisionItems.filter(i => i.priority === 'CRITICAL').length;
  const highCount = decisionItems.filter(i => i.priority === 'HIGH').length;

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-bold text-white">Executive Risk Decision Queue</h2>
            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 font-mono">
              {decisionItems.length} DECISIONS PENDING
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Prioritized executive governance queue. Highlights appetite breaches, telemetry control deficiencies, stale evidence, and treatment retest failures.
          </p>
        </div>

        {/* PRIORITY FILTER CHIPS */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterPriority('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              filterPriority === 'ALL'
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            All ({decisionItems.length})
          </button>
          <button
            onClick={() => setFilterPriority('CRITICAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              filterPriority === 'CRITICAL'
                ? 'bg-rose-600 border-rose-500 text-white'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
            }`}
          >
            Critical ({criticalCount})
          </button>
          <button
            onClick={() => setFilterPriority('HIGH')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              filterPriority === 'HIGH'
                ? 'bg-amber-600 border-amber-500 text-white'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            High ({highCount})
          </button>
        </div>
      </div>

      {/* DECISION CARDS STREAM */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-8 text-center text-xs text-emerald-300 flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            <span className="font-bold text-sm">Executive Decision Queue Clear</span>
            <p className="text-slate-400 max-w-md">
              Zero pending escalation decisions. All material risks are operating within approved tolerances with verified mitigating controls.
            </p>
          </div>
        ) : (
          filteredItems.map(item => {
            const priorityBadge =
              item.priority === 'CRITICAL'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : item.priority === 'HIGH'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';

            return (
              <div
                key={item.decisionId}
                className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-xl p-5 space-y-4 transition-all"
              >
                {/* TOP HEADER */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${priorityBadge}`}>
                        {item.priority} PRIORITY
                      </span>
                      <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {item.riskCode}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">Due: {item.dueDate}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1">{item.title}</h3>
                  </div>

                  <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30 shrink-0">
                    {item.verificationStatus}
                  </span>
                </div>

                {/* 4-QUADRANT EXPLANATION GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/40 space-y-1">
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-rose-400" />
                      Why It Matters
                    </span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">{item.whyItMatters}</p>
                  </div>

                  <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/40 space-y-1">
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      What Changed
                    </span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">{item.whatChanged}</p>
                  </div>

                  <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/40 space-y-1">
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      Business Impact
                    </span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">{item.businessImpact}</p>
                  </div>

                  <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/40 space-y-1">
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Required Action & Decision
                    </span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">{item.requiredDecision}</p>
                  </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                  <div className="flex items-center gap-3">
                    <span>Accountable Executive: <strong className="text-white">{item.accountableOwner}</strong></span>
                    {item.supportingEvidence.length > 0 && (
                      <span>Evidence: <strong className="font-mono text-indigo-300">{item.supportingEvidence.join(', ')}</strong></span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigateTab('appetite')}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors"
                    >
                      Open Action Studio <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
