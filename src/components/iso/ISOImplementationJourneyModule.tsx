import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import { IsoWorkflowStage } from '../../types';
import { StageGatesReadinessVerifier } from '../audit/StageGatesReadinessVerifier';
import { ISOVerticalJourneyTimeline } from './ISOVerticalJourneyTimeline';
import { useToast } from '../common/ToastContainer';
import { exportIsoImplementationProgressPDF } from '../../utils/isoImplementationProgressPdfExporter';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  ArrowRight,
  Shield,
  Layers,
  FileText,
  Users,
  Search,
  Check,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Filter,
  BarChart3,
  ShieldCheck,
  FileDown,
  Loader2
} from 'lucide-react';

export const ISOImplementationJourneyModule: React.FC = () => {
  const {
    currentTenant,
    workflowStages,
    nextRecommendedAction,
    advanceWorkflowStage,
    setActiveModule
  } = useGRC();

  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [selectedPhase, setSelectedPhase] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  const handleExportProgressSummary = async () => {
    try {
      setIsExporting(true);
      await exportIsoImplementationProgressPDF({
        tenantName: currentTenant?.name || 'Apex FinTech Solutions Ltd',
        stages: workflowStages,
        overallProgress: stats.overallProgress
      });
      showToast({
        title: 'Progress Summary Exported',
        message: 'Successfully generated and downloaded 20-Stage Implementation Progress Summary PDF.',
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to export implementation progress PDF:', error);
      showToast({
        title: 'Export Failed',
        message: 'Unable to generate PDF report. Please try again.',
        type: 'error'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const phases = [
    { id: 'ALL', name: 'All 24 Stages' },
    { id: 'Core20', name: '20 Implementation Stages (1-20)' },
    { id: 'Foundation', name: 'Phase 1: Foundation (1-5)' },
    { id: 'Context & Scope', name: 'Phase 2: Context & Scope (6-10)' },
    { id: 'Risk & Controls', name: 'Phase 3: Risk & Controls (11-13)' },
    { id: 'Implementation & Evidence', name: 'Phase 4: Implementation (14-17)' },
    { id: 'Assurance & Audit', name: 'Phase 5: Assurance & Audit (18-23)' },
    { id: 'Continual Improvement', name: 'Phase 6: Continual (24)' }
  ];

  const filteredStages = useMemo(() => {
    return workflowStages.filter(stage => {
      let matchesPhase = false;
      if (selectedPhase === 'ALL') {
        matchesPhase = true;
      } else if (selectedPhase === 'Core20') {
        matchesPhase = stage.stageNumber <= 20;
      } else if (selectedPhase === 'Assurance & Audit') {
        matchesPhase = stage.stageNumber >= 18 && stage.stageNumber <= 23;
      } else if (selectedPhase === 'Continual Improvement') {
        matchesPhase = stage.stageNumber >= 24;
      } else {
        matchesPhase = stage.category === selectedPhase;
      }

      const matchesSearch = !searchQuery.trim() ||
        stage.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stage.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stage.stageNumber.toString().includes(searchQuery.trim());
      return matchesPhase && matchesSearch;
    });
  }, [workflowStages, selectedPhase, searchQuery]);

  const stats = useMemo(() => {
    const completed = workflowStages.filter(s => s.status === 'COMPLETED').length;
    const inProgress = workflowStages.filter(s => s.status === 'IN_PROGRESS').length;
    const blocked = workflowStages.filter(s => s.blockers && s.blockers.length > 0 && s.status !== 'COMPLETED').length;
    const notStarted = workflowStages.filter(s => s.status === 'LOCKED' || s.status === 'AVAILABLE').length;
    const overallProgress = Math.round(
      workflowStages.reduce((acc, s) => acc + s.completionPct, 0) / (workflowStages.length || 1)
    );
    return { completed, inProgress, blocked, notStarted, overallProgress };
  }, [workflowStages]);

  const activeStageDetail = useMemo(() => {
    if (!selectedStageId) return workflowStages[0] || null;
    return workflowStages.find(s => s.id === selectedStageId) || workflowStages[0] || null;
  }, [selectedStageId, workflowStages]);

  const getStatusBadge = (status: IsoWorkflowStage['status']) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            In Progress
          </span>
        );
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Clock className="w-3.5 h-3.5" />
            Available
          </span>
        );
      case 'LOCKED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
            <Lock className="w-3.5 h-3.5" />
            Locked
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Module Title & Status Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-sky-500/10 text-sky-400 border border-sky-500/30">
                Workflow Gating Engine
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-medium">
                Standard: <strong className="text-slate-200">ISO/IEC 27001:2022 ISMS</strong>
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              24-Stage ISO 27001:2022 Implementation Roadmap
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Step-by-step state-driven compliance engine. Stages unlock strictly as upstream prerequisites are validated. Track deliverables, control ownership, auditor verification, and readiness milestones in real-time.
            </p>

            {/* Export Progress Summary Action */}
            <div className="pt-2 flex items-center gap-2">
              <button
                id="export-progress-summary-btn"
                type="button"
                onClick={handleExportProgressSummary}
                disabled={isExporting}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold shadow-md transition-all shrink-0 hover:shadow-indigo-500/20 border border-indigo-500/40"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-200" />
                    <span>Generating Progress Report...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4 text-indigo-200" />
                    <span>Export Progress Summary</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/60">
                      PDF (20 Stages)
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-950/60 border border-slate-800 p-4 rounded-xl shrink-0">
            <div className="text-center px-3">
              <div className="text-2xl font-bold text-white">{stats.overallProgress}%</div>
              <div className="text-[11px] font-medium text-slate-400">Total Progress</div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-center px-3">
              <div className="text-2xl font-bold text-emerald-400">{stats.completed}</div>
              <div className="text-[11px] font-medium text-slate-400">Completed</div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-center px-3">
              <div className="text-2xl font-bold text-sky-400">{stats.inProgress}</div>
              <div className="text-[11px] font-medium text-slate-400">Active</div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-center px-3">
              <div className="text-2xl font-bold text-rose-400">{stats.blocked}</div>
              <div className="text-[11px] font-medium text-slate-400">Blocked</div>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5 text-slate-400">
            <span>Overall ISMS Implementation Maturity</span>
            <span className="font-semibold text-slate-200">{stats.completed} of 24 Stages Certified</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Dynamic Next Action Card */}
      {nextRecommendedAction && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-850 border-l-4 border-sky-500 border-y border-r border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  Recommended Next Action • Stage {nextRecommendedAction.stageNumber}
                </span>
                <span className="text-xs text-slate-400">Owner: <strong className="text-slate-200">{nextRecommendedAction.owner}</strong></span>
              </div>
              <h3 className="text-base font-bold text-white">
                {nextRecommendedAction.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                {nextRecommendedAction.description}
              </p>
              {nextRecommendedAction.blockers.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-rose-400 font-medium pt-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Prerequisite requirement: {nextRecommendedAction.blockers.join(', ')}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveModule(nextRecommendedAction.targetModuleId)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md transition-all shrink-0 hover:shadow-sky-500/20"
            >
              <span>Execute Action</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Vertical Implementation Journey Timeline (Replacing header navigation with interactive connected path) */}
      <ISOVerticalJourneyTimeline
        stages={workflowStages}
        selectedStageId={activeStageDetail?.id || null}
        onSelectStage={(stageId) => setSelectedStageId(stageId)}
        onOpenModule={setActiveModule}
        onExportProgressSummary={handleExportProgressSummary}
        isExporting={isExporting}
      />

      {/* Main Grid: Stages Matrix + Detailed Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stages List (8 cols on large screen) */}
        <div className="lg:col-span-8 space-y-3">
          {filteredStages.map(stage => {
            const isSelected = activeStageDetail?.id === stage.id;
            return (
              <div
                key={stage.id}
                onClick={() => setSelectedStageId(stage.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-850 border-sky-500 shadow-md ring-1 ring-sky-500/20'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850/60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 shrink-0 mt-0.5">
                      {stage.stageNumber}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                          {stage.category}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs text-slate-400">
                          Owner: {stage.owner}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        {stage.name}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {stage.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {getStatusBadge(stage.status)}
                    <span className="text-[11px] font-semibold text-slate-400">
                      {stage.completionPct}%
                    </span>
                  </div>
                </div>

                {/* Mini Progress & Actions */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-4">
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        stage.status === 'COMPLETED'
                          ? 'bg-emerald-500'
                          : stage.status === 'LOCKED'
                          ? 'bg-slate-700'
                          : 'bg-sky-500'
                      }`}
                      style={{ width: `${stage.completionPct}%` }}
                    />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModule(stage.targetModuleId);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-medium text-sky-400 hover:text-sky-300 hover:underline shrink-0"
                  >
                    <span>Open Module</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Embedded Stage Gates Readiness Verifier */}
                <StageGatesReadinessVerifier
                  stageId={stage.id}
                  stageData={stage}
                  compact={true}
                  defaultExpanded={isSelected}
                  onNavigateToModule={setActiveModule}
                />
              </div>
            );
          })}

          {filteredStages.length === 0 && (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-sm">
              No workflow stages matched your search criteria.
            </div>
          )}
        </div>

        {/* Selected Stage Detail Panel (4 cols on large screen) */}
        <div className="lg:col-span-4">
          {activeStageDetail ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sticky top-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                    Stage {activeStageDetail.stageNumber} Detail
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {activeStageDetail.name}
                  </h3>
                </div>
                {getStatusBadge(activeStageDetail.status)}
              </div>

              {/* Summary Description */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase text-slate-400">Description & Objective</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeStageDetail.description}
                </p>
              </div>

              {/* Responsible Owner */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase text-slate-400">Designated Owner / Role</span>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-200 bg-slate-850 p-2.5 rounded-lg border border-slate-800">
                  <Users className="w-4 h-4 text-sky-400" />
                  <span>{activeStageDetail.owner}</span>
                </div>
              </div>

              {/* Blockers & Prerequisites */}
              {activeStageDetail.blockers.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Stage Dependency Blockers
                  </span>
                  <div className="space-y-1.5">
                    {activeStageDetail.blockers.map((b, idx) => (
                      <div key={idx} className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                        • {b}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Required Deliverables */}
              {(activeStageDetail.deliverables && activeStageDetail.deliverables.length > 0) && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase text-slate-400">Mandatory Deliverables</span>
                  <div className="space-y-1.5">
                    {activeStageDetail.deliverables.map((deliv, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-850/60 p-2 rounded border border-slate-800">
                        <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                        <span>{deliv}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ISO 27001:2022 Clauses */}
              {(activeStageDetail.isoClauses && activeStageDetail.isoClauses.length > 0) && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase text-slate-400">Mapped ISO 27001 Clauses</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeStageDetail.isoClauses.map((cl, idx) => (
                      <span key={idx} className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                        {cl}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stage Gates Readiness Verifier (Derived Progress & Gating Logic) */}
              <div className="pt-2 border-t border-slate-800">
                <StageGatesReadinessVerifier
                  stageId={activeStageDetail.id}
                  stageData={activeStageDetail}
                  compact={false}
                  onNavigateToModule={setActiveModule}
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => setActiveModule(activeStageDetail.targetModuleId)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md transition-all"
                >
                  <span>Launch Linked Module</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                {activeStageDetail.status !== 'COMPLETED' && (
                  <button
                    onClick={() => advanceWorkflowStage(activeStageDetail.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-750 text-emerald-400 text-xs font-semibold border border-slate-700 hover:border-emerald-500/30 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Stage Verified & Completed</span>
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
