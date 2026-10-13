import React, { useMemo, useRef } from 'react';
import { IsoWorkflowStage } from '../../types';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Layers,
  Milestone,
  ArrowRight,
  Check,
  AlertOctagon,
  Eye,
  FileDown,
  Loader2
} from 'lucide-react';

interface ISOTimelineProgressTrackerProps {
  stages: IsoWorkflowStage[];
  selectedStageId: string | null;
  onSelectStage: (stageId: string) => void;
  onOpenModule?: (moduleId: string) => void;
  onExportProgressSummary?: () => void;
  isExporting?: boolean;
}

export const ISOTimelineProgressTracker: React.FC<ISOTimelineProgressTrackerProps> = ({
  stages,
  selectedStageId,
  onSelectStage,
  onOpenModule,
  onExportProgressSummary,
  isExporting = false
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Focus strictly on the 20 implementation stages
  const core20Stages = useMemo(() => {
    return stages
      .filter(s => s.stageNumber <= 20)
      .sort((a, b) => a.stageNumber - b.stageNumber);
  }, [stages]);

  // Compute overall timeline metrics
  const metrics = useMemo(() => {
    const total = 20;
    const completed = core20Stages.filter(s => s.status === 'COMPLETED').length;
    const inProgress = core20Stages.filter(s => s.status === 'IN_PROGRESS').length;
    const blocked = core20Stages.filter(
      s => s.blockers && s.blockers.length > 0 && s.status !== 'COMPLETED'
    ).length;
    const pending = total - completed - inProgress;
    const percentComplete = Math.round((completed / total) * 100);

    const activeStage = core20Stages.find(s => s.status === 'IN_PROGRESS') ||
      core20Stages.find(s => s.status === 'AVAILABLE') ||
      core20Stages[completed < 20 ? completed : 19];

    return {
      total,
      completed,
      inProgress,
      blocked,
      pending,
      percentComplete,
      activeStage
    };
  }, [core20Stages]);

  // Phase metadata for the 20 implementation stages
  const phaseMilestones = useMemo(() => [
    {
      id: 'phase-1',
      title: 'Phase 1: Foundation',
      range: 'Stages 1–5',
      stages: core20Stages.filter(s => s.stageNumber >= 1 && s.stageNumber <= 5)
    },
    {
      id: 'phase-2',
      title: 'Phase 2: Context & Scope',
      range: 'Stages 6–10',
      stages: core20Stages.filter(s => s.stageNumber >= 6 && s.stageNumber <= 10)
    },
    {
      id: 'phase-3',
      title: 'Phase 3: Risk & Controls',
      range: 'Stages 11–13',
      stages: core20Stages.filter(s => s.stageNumber >= 11 && s.stageNumber <= 13)
    },
    {
      id: 'phase-4',
      title: 'Phase 4: Implementation',
      range: 'Stages 14–17',
      stages: core20Stages.filter(s => s.stageNumber >= 14 && s.stageNumber <= 17)
    },
    {
      id: 'phase-5',
      title: 'Phase 5: Assurance & Review',
      range: 'Stages 18–20',
      stages: core20Stages.filter(s => s.stageNumber >= 18 && s.stageNumber <= 20)
    }
  ], [core20Stages]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const focusActiveStage = () => {
    if (metrics.activeStage) {
      onSelectStage(metrics.activeStage.id);
      const activeElement = document.getElementById(`timeline-stage-${metrics.activeStage.stageNumber}`);
      if (activeElement && scrollContainerRef.current) {
        activeElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Timeline Header & Metrics Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <Milestone className="w-3.5 h-3.5 text-indigo-400" />
              20-Stage Implementation Roadmap
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">
              {metrics.completed} of {metrics.total} Stages Certified ({metrics.percentComplete}%)
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>ISO 27001 Implementation Progress Timeline</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Sequential progression across all 20 foundational, scoping, risk treatment, control deployment, and management assurance stages.
          </p>
        </div>

        {/* Legend & Navigation Actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px]">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
              <span>Completed ({metrics.completed})</span>
            </div>
            <div className="flex items-center gap-1.5 text-sky-400 font-medium">
              <div className="w-2.5 h-2.5 rounded-full bg-sky-500 ring-2 ring-sky-500/30 animate-pulse" />
              <span>In Progress ({metrics.inProgress})</span>
            </div>
            {metrics.blocked > 0 && (
              <div className="flex items-center gap-1.5 text-rose-400 font-medium">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/30" />
                <span>Blocked ({metrics.blocked})</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              <span>Pending ({metrics.pending})</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onExportProgressSummary && (
              <button
                type="button"
                onClick={onExportProgressSummary}
                disabled={isExporting}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 disabled:bg-slate-800 disabled:text-slate-500 text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                title="Generate and download 20-stage PDF progress report"
              >
                {isExporting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-300" />
                ) : (
                  <FileDown className="w-3.5 h-3.5 text-indigo-400" />
                )}
                <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
              </button>
            )}

            {metrics.activeStage && (
              <button
                type="button"
                onClick={focusActiveStage}
                className="px-2.5 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center gap-1 transition shadow-sm"
                title={`Jump to active Stage ${metrics.activeStage.stageNumber}: ${metrics.activeStage.name}`}
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Focus Active (Stage {metrics.activeStage.stageNumber})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => scroll('left')}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Global Visual Progress Bar with Stage Milestones */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-300">20-Stage Roadmap Completion</span>
          <span className="font-mono text-emerald-400 font-bold">{metrics.percentComplete}% Completed</span>
        </div>
        <div className="relative w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 transition-all duration-700 ease-out shadow-sm"
            style={{ width: `${metrics.percentComplete}%` }}
          />
        </div>
      </div>

      {/* Interactive Horizontal Timeline Track (All 20 Stages) */}
      <div className="relative">
        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto pb-4 pt-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900 flex gap-0 min-w-full"
        >
          <div className="flex items-stretch min-w-max px-2 py-1">
            {core20Stages.map((stage, idx) => {
              const isSelected = selectedStageId === stage.id;
              const isCompleted = stage.status === 'COMPLETED';
              const isInProgress = stage.status === 'IN_PROGRESS';
              const isLocked = stage.status === 'LOCKED';
              const hasBlockers = stage.blockers && stage.blockers.length > 0 && !isCompleted;
              const isFirst = idx === 0;
              const isLast = idx === core20Stages.length - 1;

              // Determine marker visual theme
              let markerBorder = 'border-slate-700 bg-slate-800 text-slate-400';
              let markerBg = 'bg-slate-800';
              let statusText = 'Pending';
              let statusColor = 'text-slate-400';

              if (isCompleted) {
                markerBorder = 'border-emerald-500 bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30';
                markerBg = 'bg-emerald-500';
                statusText = 'Completed';
                statusColor = 'text-emerald-400';
              } else if (hasBlockers) {
                markerBorder = 'border-rose-500 bg-rose-950/80 text-rose-300 shadow-md shadow-rose-500/20';
                markerBg = 'bg-rose-600';
                statusText = 'Blocked';
                statusColor = 'text-rose-400';
              } else if (isInProgress) {
                markerBorder = 'border-sky-400 bg-sky-500 text-slate-950 ring-4 ring-sky-500/30 shadow-md shadow-sky-500/40 animate-pulse';
                markerBg = 'bg-sky-500';
                statusText = 'In Progress';
                statusColor = 'text-sky-400';
              }

              return (
                <div
                  key={stage.id}
                  id={`timeline-stage-${stage.stageNumber}`}
                  onClick={() => onSelectStage(stage.id)}
                  className={`group relative flex flex-col items-center w-36 px-2 text-center cursor-pointer transition-all ${
                    isSelected ? 'scale-105 z-10' : 'hover:scale-[1.02]'
                  }`}
                >
                  {/* Connecting Track Line behind markers */}
                  <div className="absolute top-5 left-0 right-0 flex items-center -z-0">
                    <div
                      className={`h-1 w-1/2 ${
                        isFirst
                          ? 'opacity-0'
                          : isCompleted || (idx > 0 && core20Stages[idx - 1].status === 'COMPLETED')
                          ? 'bg-emerald-500'
                          : 'bg-slate-800'
                      }`}
                    />
                    <div
                      className={`h-1 w-1/2 ${
                        isLast
                          ? 'opacity-0'
                          : isCompleted
                          ? 'bg-emerald-500'
                          : isInProgress
                          ? 'bg-gradient-to-r from-sky-500 to-slate-800'
                          : 'bg-slate-800'
                      }`}
                    />
                  </div>

                  {/* Circular Node Marker */}
                  <div className="relative z-10 mb-2.5">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300 ${markerBorder} ${
                        isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950' : ''
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 stroke-[2.5]" />
                      ) : hasBlockers ? (
                        <AlertTriangle className="w-4 h-4 text-rose-300" />
                      ) : isLocked ? (
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <span>{stage.stageNumber}</span>
                      )}
                    </div>

                    {/* Completion mini pill */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full border shadow-sm ${
                        isCompleted
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                          : isInProgress
                          ? 'bg-sky-950 text-sky-300 border-sky-700'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}>
                        {stage.completionPct}%
                      </span>
                    </div>
                  </div>

                  {/* Stage Card Details */}
                  <div className={`w-full mt-3 p-2.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-slate-850 border-sky-500 shadow-md ring-1 ring-sky-500/30'
                      : 'bg-slate-950/70 border-slate-800 group-hover:border-slate-700 group-hover:bg-slate-900/90'
                  }`}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                      Stage {stage.stageNumber}
                    </div>
                    <div className="text-xs font-semibold text-white leading-tight line-clamp-2 mt-0.5 h-7 flex items-center justify-center">
                      {stage.name}
                    </div>

                    {/* Status Badge */}
                    <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-center gap-1">
                      <span className={`text-[10px] font-medium ${statusColor}`}>
                        {statusText}
                      </span>
                    </div>

                    {/* Quick Owner */}
                    <div className="text-[9px] text-slate-400 truncate mt-1" title={stage.owner}>
                      {stage.owner.split('/')[0].trim()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Phase Milestone Breakdown (5 Grouped Strategic Lanes) */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            Strategic Phase Breakdown (20 Implementation Stages)
          </span>
          <span className="text-[11px] text-slate-400">Click any stage node to inspect readiness & blockers</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {phaseMilestones.map((phase) => {
            const completedCount = phase.stages.filter(s => s.status === 'COMPLETED').length;
            const totalCount = phase.stages.length;
            const isPhaseDone = completedCount === totalCount && totalCount > 0;
            const phasePct = Math.round((completedCount / (totalCount || 1)) * 100);

            return (
              <div
                key={phase.id}
                className={`p-3 rounded-xl border text-xs transition space-y-2 ${
                  isPhaseDone
                    ? 'bg-emerald-950/20 border-emerald-800/40'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-[11px]">{phase.title}</span>
                  <span className={`text-[10px] font-mono font-semibold ${isPhaseDone ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {completedCount}/{totalCount} Done
                  </span>
                </div>

                {/* Mini phase bar */}
                <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isPhaseDone ? 'bg-emerald-500' : 'bg-sky-500'
                    }`}
                    style={{ width: `${phasePct}%` }}
                  />
                </div>

                {/* Stage markers list */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {phase.stages.map(st => {
                    const isPassed = st.status === 'COMPLETED';
                    const isActive = st.status === 'IN_PROGRESS';
                    const isStSelected = selectedStageId === st.id;

                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStage(st.id);
                        }}
                        className={`w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center transition border ${
                          isStSelected
                            ? 'ring-2 ring-sky-400 bg-sky-600 text-white border-sky-400'
                            : isPassed
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                            : isActive
                            ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 animate-pulse hover:bg-sky-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                        title={`Stage ${st.stageNumber}: ${st.name} (${st.status})`}
                      >
                        {isPassed ? '✓' : st.stageNumber}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
