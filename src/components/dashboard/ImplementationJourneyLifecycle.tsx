import React, { useMemo } from 'react';
import {
  Check,
  ArrowRight,
  Clock,
  Lock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';

interface ImplementationJourneyLifecycleProps {
  onNavigateModule: (moduleId: string) => void;
}

export const ImplementationJourneyLifecycle: React.FC<ImplementationJourneyLifecycleProps> = ({
  onNavigateModule
}) => {
  const { showToast } = useToast();
  const { workflowStages, nextRecommendedAction } = useGRC();

  // Group 24 stages into the 6 executive lifecycle phases for the dashboard stepper
  const phaseSummaries = useMemo(() => {
    const phases = [
      { key: 'Foundation', name: 'Foundation', stages: [1, 2, 3, 4, 5], targetModule: 'implementation_journey' },
      { key: 'Context & Scope', name: 'Scope', stages: [6, 7, 8, 9, 10], targetModule: 'org_scope' },
      { key: 'Risk & Controls', name: 'Risk', stages: [11, 12, 13], targetModule: 'risk_assessment' },
      { key: 'Implementation & Evidence', name: 'Controls', stages: [14, 15, 16, 17], targetModule: 'evidence_centre' },
      { key: 'Assurance & Audit', name: 'Audit', stages: [18, 19, 20, 21, 22, 23], targetModule: 'internal_audit' },
      { key: 'Continual Improvement', name: 'Continual', stages: [24], targetModule: 'capa' }
    ];

    return phases.map((phase, idx) => {
      const matched = workflowStages.filter(s => phase.stages.includes(s.stageNumber));
      const completedCount = matched.filter(s => s.status === 'COMPLETED').length;
      const inProgressCount = matched.filter(s => s.status === 'IN_PROGRESS').length;
      const avgPct = matched.length > 0
        ? Math.round(matched.reduce((acc, s) => acc + s.completionPct, 0) / matched.length)
        : 0;

      let status: 'COMPLETED' | 'IN_PROGRESS' | 'BLOCKED' | 'NOT_STARTED' = 'NOT_STARTED';
      if (completedCount === matched.length && matched.length > 0) {
        status = 'COMPLETED';
      } else if (inProgressCount > 0 || completedCount > 0) {
        status = 'IN_PROGRESS';
      } else if (matched.some(s => s.blockers && s.blockers.length > 0 && s.status !== 'COMPLETED')) {
        status = 'BLOCKED';
      }

      return {
        id: phase.key,
        stepNumber: idx + 1,
        name: phase.name,
        fullName: phase.key,
        status,
        completionPct: avgPct,
        completedCount,
        totalStages: matched.length,
        targetModuleId: phase.targetModule
      };
    });
  }, [workflowStages]);

  const activePhase = useMemo(() => {
    return phaseSummaries.find(p => p.status === 'IN_PROGRESS') ||
      phaseSummaries.find(p => p.status === 'NOT_STARTED') ||
      phaseSummaries[0];
  }, [phaseSummaries]);

  const completedStagesCount = useMemo(() => {
    return workflowStages.filter(s => s.status === 'COMPLETED').length;
  }, [workflowStages]);

  const totalProgress = useMemo(() => {
    if (workflowStages.length === 0) return 0;
    return Math.round(
      workflowStages.reduce((acc, s) => acc + s.completionPct, 0) / workflowStages.length
    );
  }, [workflowStages]);

  return (
    <div className="p-5 flex flex-col justify-between h-full bg-slate-900 border border-slate-800 rounded-xl">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center space-x-2">
              <span>ISO 27001 Implementation Journey</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold">
                {completedStagesCount} of 24 Stages Complete ({totalProgress}%)
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              State-driven ISO/IEC 27001:2022 lifecycle with milestone gating
            </p>
          </div>
          <button
            onClick={() => onNavigateModule('implementation_journey')}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition flex items-center space-x-1"
          >
            <span>24-Stage Roadmap</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Dynamic Stepper Chain across 6 Phases */}
        <div className="relative mt-4 py-2">
          {/* Horizontal Track Line */}
          <div className="absolute top-1/2 left-3 right-3 h-0.5 bg-slate-800 -translate-y-3 z-0" />
          <div
            className="absolute top-1/2 left-3 h-0.5 bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 -translate-y-3 z-0 transition-all duration-700"
            style={{ width: `${Math.min(100, Math.max(8, totalProgress))}%` }}
          />

          <div className="relative z-10 grid grid-cols-6 gap-1 text-center">
            {phaseSummaries.map(phase => {
              const isCompleted = phase.status === 'COMPLETED';
              const isInProgress = phase.status === 'IN_PROGRESS';
              const isBlocked = phase.status === 'BLOCKED';

              return (
                <div
                  key={phase.id}
                  onClick={() => {
                    onNavigateModule(phase.targetModuleId);
                    showToast({
                      title: `Phase ${phase.stepNumber}: ${phase.fullName}`,
                      message: `${phase.completedCount}/${phase.totalStages} stages completed (${phase.completionPct}%)`,
                      type: 'info'
                    });
                  }}
                  className="flex flex-col items-center cursor-pointer group"
                  title={`${phase.fullName} - ${phase.status}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                        : isInProgress
                        ? 'bg-sky-600 text-white shadow-lg shadow-sky-950 ring-2 ring-sky-500/40 animate-pulse'
                        : isBlocked
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : 'bg-slate-950 text-slate-500 border border-slate-800 group-hover:border-slate-700'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3" /> : <span>{phase.stepNumber}</span>}
                  </div>

                  <span
                    className={`text-[9px] font-bold mt-1.5 truncate w-full ${
                      isInProgress
                        ? 'text-sky-300'
                        : isCompleted
                        ? 'text-slate-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {phase.name}
                  </span>

                  <span
                    className={`text-[8px] font-mono ${
                      isInProgress
                        ? 'text-sky-400 font-semibold'
                        : isCompleted
                        ? 'text-emerald-500/70'
                        : 'text-slate-600'
                    }`}
                  >
                    {isInProgress ? `${phase.completionPct}%` : isCompleted ? 'Done' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Next Recommended Action Callout */}
        {nextRecommendedAction && (
          <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-sky-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                  Stage {nextRecommendedAction.stageNumber}: {nextRecommendedAction.title}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-sky-400">
                Priority: {nextRecommendedAction.priority}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              {nextRecommendedAction.description}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
              <span>Owner: <strong className="text-slate-300">{nextRecommendedAction.owner}</strong></span>
              <button
                onClick={() => onNavigateModule(nextRecommendedAction.targetModuleId)}
                className="text-sky-400 hover:text-sky-300 font-semibold flex items-center space-x-1"
              >
                <span>Execute Step</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Summary */}
      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400 text-[11px]">
          {completedStagesCount} Completed • {workflowStages.filter(s => s.status === 'IN_PROGRESS').length} In Progress • {workflowStages.filter(s => s.blockers && s.blockers.length > 0 && s.status !== 'COMPLETED').length} Blocked
        </span>
        <button
          onClick={() => onNavigateModule('implementation_journey')}
          className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition"
        >
          View Full 24 Stages →
        </button>
      </div>
    </div>
  );
};
