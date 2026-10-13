import React, { useState } from 'react';
import { 
  Zap, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowUpRight,
  Filter,
  Layers,
  ChevronRight
} from 'lucide-react';
import { NextBestActionEngine } from '../../services/grc/NextBestActionEngine';
import { NextBestActionItem } from '../../types/grcCoreTypes';
import { PremiumCard } from '../ui/premium/PremiumCard';
import { PremiumBadge } from '../ui/premium/PremiumBadge';
import { PremiumButton } from '../ui/premium/PremiumButton';
import { useGRC } from '../../context/GRCContext';

interface NextBestActionCockpitProps {
  onActionTrigger?: (action: NextBestActionItem) => void;
  onOpen360Drawer?: (entityId: string, entityType: string) => void;
}

export const NextBestActionCockpit: React.FC<NextBestActionCockpitProps> = ({ 
  onActionTrigger,
  onOpen360Drawer 
}) => {
  const { theme } = useGRC();
  const [actions, setActions] = useState<NextBestActionItem[]>(NextBestActionEngine.computeNextBestActions());
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const handleExecuteAction = (item: NextBestActionItem) => {
    if (onActionTrigger) {
      onActionTrigger(item);
    } else if (onOpen360Drawer) {
      onOpen360Drawer(item.sourceEntity.id, item.sourceEntity.type);
    }
  };

  const filteredActions = filterSeverity === 'ALL' 
    ? actions 
    : actions.filter(a => a.severity === filterSeverity);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-amber-500/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                <Zap className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">CISO Next Best Action Priority Engine</h2>
              <PremiumBadge variant="warning" pulse>Autonomous Queue Active</PremiumBadge>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl font-normal">
              Real-time algorithmic prioritization of critical risk exposures, missing evidence artifacts, overdue CAPA remediation SLAs, and audit blockers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(sev => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterSeverity === sev
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards Queue */}
      <div className="space-y-4">
        {filteredActions.map((action) => {
          const isCritical = action.severity === 'CRITICAL';
          return (
            <div
              key={action.id}
              className={`p-5 rounded-2xl border transition-all ${
                isCritical
                  ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-600/40 hover:border-rose-400 dark:hover:border-rose-500/60 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                      Priority {action.priorityScore}/100
                    </span>
                    <PremiumBadge variant={action.severity === 'CRITICAL' ? 'critical' : action.severity === 'HIGH' ? 'warning' : 'info'}>
                      {action.category.replace(/_/g, ' ')}
                    </PremiumBadge>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Target: <strong className="text-blue-600 dark:text-cyan-400 font-mono">{action.sourceEntity.code}</strong>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{action.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{action.reason}</p>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <div className="text-slate-800 dark:text-slate-200">
                      <strong className="text-amber-700 dark:text-amber-400 font-semibold">Recommended Action:</strong> {action.recommendedAction}
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      <strong className="text-rose-700 dark:text-rose-400 font-semibold">Impact If Ignored:</strong> {action.impactIfIgnored}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span>Owner: <strong className="text-slate-800 dark:text-slate-200">{action.owner}</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" /> Due: <strong className="text-slate-800 dark:text-slate-200">{action.dueDate}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-end gap-2 shrink-0">
                  <PremiumButton
                    size="sm"
                    variant={action.actionType === 'REMEDIATE' ? 'danger' : action.actionType === 'APPROVE' ? 'success' : 'primary'}
                    onClick={() => handleExecuteAction(action)}
                    iconRight={ArrowUpRight}
                  >
                    {action.actionType === 'REMEDIATE' ? 'Remediate Now' : action.actionType === 'APPROVE' ? 'Approve Closure' : action.actionType === 'REVIEW' ? 'Review & Map' : 'Launch Audit Test'}
                  </PremiumButton>

                  {onOpen360Drawer && (
                    <button
                      type="button"
                      onClick={() => onOpen360Drawer(action.sourceEntity.id, action.sourceEntity.type)}
                      className="text-xs text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors flex items-center gap-1 font-medium cursor-pointer"
                    >
                      360° Inspection <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredActions.length === 0 && (
          <div className="p-12 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
            No priority actions match the selected filter criteria. All GRC posture items are within SLA.
          </div>
        )}
      </div>
    </div>
  );
};

export default NextBestActionCockpit;
