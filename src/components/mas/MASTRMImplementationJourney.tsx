import React, { useState } from 'react';
import {
  Milestone,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Download,
  Calendar,
  Layers,
  FileText,
  UserCheck,
  Award,
  Sparkles,
  ExternalLink,
  Flame,
  Lock,
  Server,
  Code2,
  Activity,
  CheckSquare
} from 'lucide-react';
import { MAS_IMPLEMENTATION_18_STAGES } from '../../data/masTrmModulesData';
import { MASImplementationStageDetail } from '../../types/masTrmFrameworkTypes';

interface Props {
  onSelectStage?: (stageNumber: string) => void;
}

export const MASTRMImplementationJourney: React.FC<Props> = ({ onSelectStage }) => {
  const [selectedStage, setSelectedStage] = useState<MASImplementationStageDetail>(MAS_IMPLEMENTATION_18_STAGES[0]);
  const [activePhaseFilter, setActivePhaseFilter] = useState<string>('ALL');

  const stages = MAS_IMPLEMENTATION_18_STAGES;

  const filteredStages = activePhaseFilter === 'ALL'
    ? stages
    : stages.filter(s => s.phase === activePhaseFilter);

  const completedCount = stages.filter(s => s.status === 'Completed').length;
  const inProgressCount = stages.filter(s => s.status === 'In Progress').length;
  const overallPercentage = Math.round(
    stages.reduce((acc, s) => acc + s.completionPercentage, 0) / stages.length
  );

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div id="mas-trm-implementation-journey" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                18-Stage Regulatory Implementation Journey
              </span>
              <span className="text-xs text-slate-400">MAS TRM Guidelines 2021 Edition</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              MAS Technology Risk Management Implementation Roadmap
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              A structured, gate-verified 18-stage path from regulatory scoping and governance to resilience drills,
              cyber hygiene, and continuous supervisory monitoring.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 border border-slate-700 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-rose-400" />
              Export Progress Summary
            </button>
          </div>
        </div>

        {/* Overall Progress Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div>
            <span className="text-xs text-slate-400">Overall TRM Readiness</span>
            <div className="text-2xl font-bold text-rose-400 mt-0.5">{overallPercentage}%</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-rose-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-400">Completed Stages</span>
            <div className="text-2xl font-bold text-emerald-400 mt-0.5">
              {completedCount} <span className="text-xs text-slate-400">/ 18</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">Stage gates verified</span>
          </div>

          <div>
            <span className="text-xs text-slate-400">In Progress Stages</span>
            <div className="text-2xl font-bold text-amber-400 mt-0.5">{inProgressCount}</div>
            <span className="text-[11px] text-slate-400 block mt-1">Active implementation</span>
          </div>

          <div>
            <span className="text-xs text-slate-400">Phase Gate Status</span>
            <div className="text-2xl font-bold text-white mt-0.5">Phase 2 Active</div>
            <span className="text-[11px] text-emerald-400 block mt-1">Phase 1 Foundation Cleared</span>
          </div>
        </div>
      </div>

      {/* Phase Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['ALL', 'Phase 1: Foundation', 'Phase 2: Core Engineering', 'Phase 3: Operations & Cyber', 'Phase 4: Assurance & Monitoring'].map(phase => (
          <button
            key={phase}
            onClick={() => setActivePhaseFilter(phase)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              activePhaseFilter === phase
                ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {phase === 'ALL' ? 'All 18 Stages' : phase}
          </button>
        ))}
      </div>

      {/* Main Grid: Left Stage Timeline List & Right Detail Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Vertical Timeline */}
        <div className="lg:col-span-5 space-y-3">
          {filteredStages.map(stage => {
            const isSelected = selectedStage.number === stage.number;
            const isCompleted = stage.status === 'Completed';
            const isInProgress = stage.status === 'In Progress';

            return (
              <div
                key={stage.number}
                onClick={() => {
                  setSelectedStage(stage);
                  if (onSelectStage) onSelectStage(stage.number);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-800/90 border-rose-500 shadow-md ring-1 ring-rose-500/30'
                    : 'bg-slate-900 border-slate-800 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isInProgress
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {stage.number}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-white">{stage.shortTitle}</h4>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">{stage.phase}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : isInProgress
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {stage.status}
                    </span>
                    <span className="text-[11px] font-bold text-slate-300">
                      {stage.completionPercentage}%
                    </span>
                  </div>
                </div>

                {/* Micro Progress Bar */}
                <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isCompleted ? 'bg-emerald-500' : isInProgress ? 'bg-rose-500' : 'bg-slate-700'
                    }`}
                    style={{ width: `${stage.completionPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Stage Detail & Gate Verification */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    STAGE {selectedStage.number}
                  </span>
                  <span className="text-xs text-slate-400">{selectedStage.phase}</span>
                </div>
                <h2 className="text-xl font-bold text-white">{selectedStage.title}</h2>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Stage Completion</span>
                <span className="text-2xl font-bold text-rose-400">{selectedStage.completionPercentage}%</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Stage Executive Objective
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/40 p-3.5 rounded-lg border border-slate-700/50">
                {selectedStage.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-slate-800/50 border border-slate-700/60">
                <span className="text-xs text-slate-400 block mb-1">Lead Responsible Role</span>
                <strong className="text-sm text-white flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-rose-400" />
                  {selectedStage.leadRole}
                </strong>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-800/50 border border-slate-700/60">
                <span className="text-xs text-slate-400 block mb-1">Applicable TRM Sections</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedStage.applicableTrmSections.map(sec => (
                    <span key={sec} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-700 text-slate-200">
                      {sec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Mandatory Key Deliverables */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Mandatory Stage Key Deliverables & Evidence
              </h4>
              <div className="space-y-2">
                {selectedStage.keyDeliverables.map((del, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          selectedStage.status === 'Completed' ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      />
                      <span className="text-xs font-medium text-slate-200">{del}</span>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                      Evidence Artifact
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage Readiness Gate Verification Box */}
            <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <strong className="text-sm text-white">Stage Readiness Gate Verifier</strong>
                </div>
                {selectedStage.gatePassed ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Gate 100% Cleared
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Verification In Progress
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300">
                Auditors inspect and verify all stage deliverables, control tests, and risk records before unlocking
                next-stage supervisory gates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
