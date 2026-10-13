import React from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  Compass,
  FileSearch,
  Wrench,
  FileCheck2,
  ShieldCheck,
  Award,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

interface ComplianceJourneyVisualProps {
  currentStage?: number; // 1 to 6
  onSelectStage?: (stageNumber: number) => void;
  className?: string;
}

export const ComplianceJourneyVisual: React.FC<ComplianceJourneyVisualProps> = ({
  currentStage = 4,
  onSelectStage,
  className = ''
}) => {
  const { theme, currentTenant, setActiveModule } = useGRC();
  const isLight = theme === 'light';

  // 6 canonical stages of continuous compliance
  const stages = [
    {
      num: 1,
      id: 'discover',
      title: 'Discover',
      subtitle: 'Scope & Entity Context',
      icon: Compass,
      mod: 'org_scope',
      completed: currentStage > 1,
      current: currentStage === 1
    },
    {
      num: 2,
      id: 'assess',
      title: 'Assess',
      subtitle: 'Gap & Risk Analysis',
      icon: FileSearch,
      mod: 'gap_assessment',
      completed: currentStage > 2,
      current: currentStage === 2
    },
    {
      num: 3,
      id: 'implement',
      title: 'Implement',
      subtitle: 'Policies & Controls',
      icon: Wrench,
      mod: 'policies',
      completed: currentStage > 3,
      current: currentStage === 3
    },
    {
      num: 4,
      id: 'evidence',
      title: 'Evidence',
      subtitle: 'Ingestion & Linking',
      icon: FileCheck2,
      mod: 'evidence_centre',
      completed: currentStage > 4,
      current: currentStage === 4
    },
    {
      num: 5,
      id: 'validate',
      title: 'Validate',
      subtitle: 'Internal Audit & Testing',
      icon: ShieldCheck,
      mod: 'internal_audit',
      completed: currentStage > 5,
      current: currentStage === 5
    },
    {
      num: 6,
      id: 'audit_ready',
      title: 'Audit Ready',
      subtitle: 'Stage 1/2 Clean Room',
      icon: Award,
      mod: 'auditor_portal',
      completed: currentStage > 6,
      current: currentStage === 6
    }
  ];

  return (
    <div
      className={`w-full rounded-2xl border p-4 sm:p-5 transition-all select-none ${
        isLight
          ? 'bg-white border-slate-200 shadow-2xs'
          : 'bg-slate-900/90 border-slate-800 shadow-xs'
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Continuous Compliance Journey</span>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
              Stage {currentStage} of 6
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Unified lifecycle from regulatory discovery to external certification readiness
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveModule('guided_journey')}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1 cursor-pointer"
        >
          <span>Full Journey View</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Visual Timeline Stepper */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = stage.completed;
          const isCurr = stage.current;

          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => {
                if (onSelectStage) {
                  onSelectStage(stage.num);
                } else {
                  setActiveModule(stage.mod as any);
                }
              }}
              className={`relative flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer group ${
                isCurr
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                  : isDone
                  ? isLight
                    ? 'bg-emerald-50/40 border-emerald-200 hover:bg-emerald-50/70'
                    : 'bg-emerald-950/20 border-emerald-900/50 hover:bg-emerald-950/40'
                  : isLight
                  ? 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/60'
                  : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80'
              }`}
            >
              {/* Top Row: Icon + Step number / Done badge */}
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                    isCurr
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : isDone
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : isLight
                      ? 'bg-slate-200 text-slate-600 border-slate-300'
                      : 'bg-slate-700 text-slate-300 border-slate-600'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>

                <span className={`text-[10px] font-mono font-bold ${
                  isCurr ? 'text-blue-600 dark:text-blue-400' : isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                }`}>
                  0{stage.num}
                </span>
              </div>

              {/* Title & Subtitle */}
              <span className={`text-xs font-bold tracking-tight truncate ${
                isCurr ? 'text-blue-900 dark:text-blue-200' : isLight ? 'text-slate-900' : 'text-slate-100'
              }`}>
                {stage.title}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {stage.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ComplianceJourneyVisual;
