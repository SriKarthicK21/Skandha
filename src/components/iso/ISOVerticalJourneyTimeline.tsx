import React, { useState, useMemo, useRef } from 'react';
import { IsoWorkflowStage } from '../../types';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Search,
  Check,
  FileDown,
  Loader2,
  ChevronDown,
  ChevronUp,
  Milestone,
  Compass,
  ArrowUpRight
} from 'lucide-react';

export interface ISOVerticalJourneyTimelineProps {
  stages: IsoWorkflowStage[];
  selectedStageId: string | null;
  onSelectStage: (stageId: string) => void;
  onOpenModule?: (moduleId: string) => void;
  onExportProgressSummary?: () => void;
  isExporting?: boolean;
}

export const ISOVerticalJourneyTimeline: React.FC<ISOVerticalJourneyTimelineProps> = ({
  stages,
  selectedStageId,
  onSelectStage,
  onOpenModule,
  onExportProgressSummary,
  isExporting = false
}) => {
  const [selectedPhase, setSelectedPhase] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCompactMode, setIsCompactMode] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus strictly on the 20 implementation stages
  const core20Stages = useMemo(() => {
    return stages
      .filter(s => s.stageNumber <= 20)
      .sort((a, b) => a.stageNumber - b.stageNumber);
  }, [stages]);

  // Overall metrics calculation
  const metrics = useMemo(() => {
    const total = 20;
    const completed = core20Stages.filter(s => s.status === 'COMPLETED').length;
    const inProgress = core20Stages.filter(s => s.status === 'IN_PROGRESS').length;
    const blocked = core20Stages.filter(
      s => s.blockers && s.blockers.length > 0 && s.status !== 'COMPLETED'
    ).length;
    const upcoming = total - completed - inProgress;
    const percentComplete = Math.round((completed / total) * 100);

    // Current active stage is the first in progress stage, or first available/uncompleted stage
    const currentActiveStage =
      core20Stages.find(s => s.status === 'IN_PROGRESS') ||
      core20Stages.find(s => s.status === 'AVAILABLE') ||
      core20Stages[completed < 20 ? completed : 19];

    return {
      total,
      completed,
      inProgress,
      blocked,
      upcoming,
      percentComplete,
      currentActiveStage
    };
  }, [core20Stages]);

  // 5 Strategic Phases encompassing all 20 implementation stages
  const phases = useMemo(() => [
    {
      id: 'ALL',
      name: 'All 20 Stages',
      shortName: 'All',
      stageRange: '1–20',
      description: 'Complete end-to-end implementation journey'
    },
    {
      id: 'Foundation',
      name: 'Phase 1: Foundation',
      shortName: 'P1: Foundation',
      stageRange: '1–5',
      description: 'Corporate registration, discovery questionnaires & departmental surveys'
    },
    {
      id: 'Context & Scope',
      name: 'Phase 2: Context & Scope',
      shortName: 'P2: Scope',
      stageRange: '6–10',
      description: 'Asset discovery, legal obligations, ISMS scope boundary & implementation plan'
    },
    {
      id: 'Risk & Controls',
      name: 'Phase 3: Risk & Controls',
      shortName: 'P3: Risk & Controls',
      stageRange: '11–13',
      description: 'Threat identification, risk treatment plan & Statement of Applicability (SoA)'
    },
    {
      id: 'Implementation & Evidence',
      name: 'Phase 4: Implementation',
      shortName: 'P4: Implementation',
      stageRange: '14–17',
      description: 'Policies, Annex A controls deployment, evidence logs & workforce awareness'
    },
    {
      id: 'Assurance & Audit',
      name: 'Phase 5: Assurance & Review',
      shortName: 'P5: Assurance',
      stageRange: '18–20',
      description: 'Telemetry monitoring, lead internal audit execution & executive management review'
    }
  ], []);

  // Filter stages based on selected phase and search query
  const displayedStages = useMemo(() => {
    return core20Stages.filter(stage => {
      let matchesPhase = false;
      if (selectedPhase === 'ALL') {
        matchesPhase = true;
      } else if (selectedPhase === 'Foundation') {
        matchesPhase = stage.stageNumber >= 1 && stage.stageNumber <= 5;
      } else if (selectedPhase === 'Context & Scope') {
        matchesPhase = stage.stageNumber >= 6 && stage.stageNumber <= 10;
      } else if (selectedPhase === 'Risk & Controls') {
        matchesPhase = stage.stageNumber >= 11 && stage.stageNumber <= 13;
      } else if (selectedPhase === 'Implementation & Evidence') {
        matchesPhase = stage.stageNumber >= 14 && stage.stageNumber <= 17;
      } else if (selectedPhase === 'Assurance & Audit') {
        matchesPhase = stage.stageNumber >= 18 && stage.stageNumber <= 20;
      }

      const matchesSearch =
        !searchQuery.trim() ||
        stage.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stage.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stage.stageNumber.toString().includes(searchQuery.trim()) ||
        (stage.category && stage.category.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesPhase && matchesSearch;
    });
  }, [core20Stages, selectedPhase, searchQuery]);

  // Jump smoothly to current active stage
  const scrollToCurrentStage = () => {
    if (metrics.currentActiveStage) {
      onSelectStage(metrics.currentActiveStage.id);
      const el = document.getElementById(`vertical-stage-${metrics.currentActiveStage.stageNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-6">
      {/* Header & Implementation Path Controls */}
      <div className="space-y-4 pb-4 border-b border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                Implementation Journey Timeline
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-300 font-mono">
                {metrics.completed} of 20 Stages Completed ({metrics.percentComplete}%)
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Vertical 20-Stage Implementation Path</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Step-by-step state-driven path across all 20 ISO 27001 implementation stages. Past stages are certified, the current active stage executes real-time gating criteria, and upcoming stages unlock sequentially.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {metrics.currentActiveStage && (
              <button
                type="button"
                onClick={scrollToCurrentStage}
                className="px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                title={`Jump to active Stage ${metrics.currentActiveStage.stageNumber}: ${metrics.currentActiveStage.name}`}
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Jump to Current (Stage {metrics.currentActiveStage.stageNumber})</span>
              </button>
            )}

            {onExportProgressSummary && (
              <button
                type="button"
                onClick={onExportProgressSummary}
                disabled={isExporting}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm border border-indigo-500/30"
              >
                {isExporting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-200" />
                ) : (
                  <FileDown className="w-3.5 h-3.5 text-indigo-200" />
                )}
                <span>{isExporting ? 'Generating PDF...' : 'Export Progress Summary'}</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-700">
                  PDF
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsCompactMode(!isCompactMode)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition flex items-center gap-1"
            >
              {isCompactMode ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              <span>{isCompactMode ? 'Expand Cards' : 'Compact Cards'}</span>
            </button>
          </div>
        </div>

        {/* Global Progress Bar with Stage Counters */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">20-Stage Sequential Implementation Progress</span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-medium">✓ {metrics.completed} Certified</span>
              <span className="text-sky-400 font-medium">● {metrics.inProgress} Current</span>
              {metrics.blocked > 0 && <span className="text-rose-400 font-medium">▲ {metrics.blocked} Blocked</span>}
              <span className="text-slate-500 font-medium">○ {metrics.upcoming} Upcoming</span>
            </div>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${metrics.percentComplete}%` }}
            />
          </div>
        </div>

        {/* Interactive Phase Navigation Chips & Search Input */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
          {/* Phase Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {phases.map(phase => {
              const isPhaseActive = selectedPhase === phase.id;
              return (
                <button
                  key={phase.id}
                  type="button"
                  onClick={() => setSelectedPhase(phase.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isPhaseActive
                      ? 'bg-sky-600 text-white shadow-sm ring-1 ring-sky-400/50'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                  }`}
                  title={phase.description}
                >
                  <span>{phase.shortName}</span>
                  <span className={`text-[10px] font-mono px-1 rounded ${
                    isPhaseActive ? 'bg-sky-700 text-sky-100' : 'bg-slate-900 text-slate-400'
                  }`}>
                    {phase.stageRange}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-60 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter 20 stages or owner..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-850 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* The Vertical Connected Journey Path */}
      <div ref={containerRef} className="relative pl-4 sm:pl-8 pr-1 py-2">
        {/* Continuous Central Vertical Spine (Line) */}
        <div className="absolute left-[27px] sm:left-[43px] top-6 bottom-6 w-1 bg-slate-800 -z-0" />

        <div className="space-y-6 relative z-10">
          {displayedStages.map((stage, idx) => {
            const isSelected = selectedStageId === stage.id;
            const isPastCompleted = stage.status === 'COMPLETED';
            const isCurrentActive = stage.status === 'IN_PROGRESS';
            const isBlocked = stage.blockers && stage.blockers.length > 0 && !isPastCompleted;
            const isUpcoming = stage.status === 'LOCKED' || stage.status === 'AVAILABLE';

            // Connective Line Styling for this segment
            const lineFillClass = isPastCompleted
              ? 'bg-emerald-500'
              : isCurrentActive
              ? 'bg-gradient-to-b from-emerald-500 to-sky-500'
              : 'bg-slate-800';

            // Node Marker Visual Configuration
            let nodeIcon = <span>{stage.stageNumber}</span>;
            let nodeRingClass = 'border-slate-700 bg-slate-800 text-slate-400';
            let statusLabel = 'Upcoming';
            let statusBadgeClass = 'bg-slate-800/80 text-slate-400 border-slate-700';

            if (isPastCompleted) {
              nodeIcon = <Check className="w-5 h-5 stroke-[2.5]" />;
              nodeRingClass = 'border-emerald-400 bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30';
              statusLabel = 'Past • Completed (100%)';
              statusBadgeClass = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
            } else if (isBlocked) {
              nodeIcon = <AlertTriangle className="w-4 h-4 text-rose-300" />;
              nodeRingClass = 'border-rose-400 bg-rose-950 text-rose-300 ring-2 ring-rose-500/40 shadow-lg shadow-rose-500/20';
              statusLabel = 'Gating Blocked';
              statusBadgeClass = 'bg-rose-500/10 text-rose-300 border-rose-500/30';
            } else if (isCurrentActive) {
              nodeIcon = <Clock className="w-4 h-4 animate-spin-slow" />;
              nodeRingClass = 'border-sky-300 bg-sky-500 text-slate-950 ring-4 ring-sky-500/30 ring-offset-2 ring-offset-slate-950 animate-pulse shadow-xl shadow-sky-500/40';
              statusLabel = 'Current Active Stage';
              statusBadgeClass = 'bg-sky-500/20 text-sky-200 border-sky-400/50 font-bold';
            }

            // Milestone header for the start of each phase
            const isPhaseBoundary =
              idx === 0 ||
              (stage.stageNumber === 6 && selectedPhase === 'ALL') ||
              (stage.stageNumber === 11 && selectedPhase === 'ALL') ||
              (stage.stageNumber === 14 && selectedPhase === 'ALL') ||
              (stage.stageNumber === 18 && selectedPhase === 'ALL');

            return (
              <div key={stage.id} id={`vertical-stage-${stage.stageNumber}`} className="space-y-2">
                {/* Phase Boundary Milestone Marker (When viewing all) */}
                {isPhaseBoundary && selectedPhase === 'ALL' && (
                  <div className="flex items-center gap-3 -ml-4 sm:-ml-8 mb-4 pt-2">
                    <div className="px-3 py-1 rounded-r-full bg-indigo-950/80 border-y border-r border-indigo-700/50 text-indigo-300 text-xs font-bold flex items-center gap-2 shadow-sm">
                      <Milestone className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{stage.category} Phase</span>
                    </div>
                    <div className="h-px bg-indigo-900/40 flex-1" />
                  </div>
                )}

                {/* Stage Row with Node Marker & Connected Card */}
                <div
                  onClick={() => onSelectStage(stage.id)}
                  className={`group relative flex items-start gap-3 sm:gap-5 cursor-pointer transition-all ${
                    isSelected ? 'scale-[1.01]' : 'hover:scale-[1.005]'
                  }`}
                >
                  {/* Spine segment fill behind this stage */}
                  <div
                    className={`absolute left-[11px] sm:left-[11px] -top-6 h-6 w-1 ${lineFillClass} -z-0`}
                  />

                  {/* Circular Step Node Marker */}
                  <div className="relative z-10 shrink-0">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300 ${nodeRingClass} ${
                        isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-105' : ''
                      }`}
                    >
                      {nodeIcon}
                    </div>

                    {/* Stage number mini-badge */}
                    <div className="absolute -bottom-1 -right-1">
                      <span className="w-4 h-4 rounded-full bg-slate-950 border border-slate-700 text-[9px] font-mono text-slate-400 flex items-center justify-center">
                        {stage.stageNumber}
                      </span>
                    </div>
                  </div>

                  {/* Stage Card */}
                  <div
                    className={`flex-1 rounded-xl border p-4 transition-all shadow-md ${
                      isSelected
                        ? 'bg-slate-850 border-sky-500 ring-1 ring-sky-500/30'
                        : isCurrentActive
                        ? 'bg-gradient-to-r from-slate-900 to-slate-850 border-sky-500/60 shadow-sky-500/10'
                        : isPastCompleted
                        ? 'bg-slate-950/70 border-emerald-900/30 hover:border-emerald-700/50'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Top strip of stage card */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-mono font-bold text-slate-400">
                            STAGE {stage.stageNumber}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-xs text-slate-400 font-medium">
                            {stage.category}
                          </span>
                          {isCurrentActive && (
                            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 animate-pulse flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-sky-400" />
                              IN EXECUTION
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                          {stage.name}
                        </h3>
                      </div>

                      {/* Status badge & Percentage */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border flex items-center gap-1.5 ${statusBadgeClass}`}>
                          {isPastCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : isCurrentActive ? (
                            <Clock className="w-3.5 h-3.5 text-sky-400" />
                          ) : isBlocked ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span>{statusLabel}</span>
                        </span>

                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-white">
                            {stage.completionPct}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Track */}
                    <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isPastCompleted
                            ? 'bg-emerald-500'
                            : isCurrentActive
                            ? 'bg-sky-500'
                            : isBlocked
                            ? 'bg-rose-500'
                            : 'bg-slate-700'
                        }`}
                        style={{ width: `${stage.completionPct}%` }}
                      />
                    </div>

                    {/* Non-compact detailed information */}
                    {!isCompactMode && (
                      <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                        {/* Owner and Deliverables */}
                        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">SPOC:</span>
                            <span className="font-medium text-slate-300">{stage.owner}</span>
                          </div>

                          {stage.isoClauses && stage.isoClauses.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-500">ISO Clauses:</span>
                              <span className="text-indigo-300 font-mono text-[11px] bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/40">
                                {stage.isoClauses.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Blockers alert if any */}
                        {isBlocked && stage.blockers && (
                          <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            <div>
                              <strong className="font-semibold">Prerequisite Blockers:</strong> {stage.blockers.join('; ')}
                            </div>
                          </div>
                        )}

                        {/* Recommended action / Target link */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                          <span className="text-[11px] text-slate-400 line-clamp-1">
                            {stage.nextRecommendedAction || stage.description || 'Continuous state gating validation'}
                          </span>

                          <div className="flex items-center gap-2 shrink-0">
                            {onOpenModule && stage.status !== 'LOCKED' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenModule(stage.targetModuleId);
                                }}
                                className="px-2.5 py-1 rounded bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center gap-1 transition"
                              >
                                <span>Open Workspace</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <span className="text-xs text-sky-400 font-medium group-hover:underline flex items-center gap-0.5">
                              <span>Inspect Gates</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
