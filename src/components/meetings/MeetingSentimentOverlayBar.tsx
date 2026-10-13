import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Info,
  Sparkles,
  Filter,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Eye,
  Sliders,
  X
} from 'lucide-react';
import {
  MeetingSentimentMetrics
} from '../../utils/meetingSentimentAnalyzer';
import { SegmentSentimentPosture } from '../../types/meetingScheduler';

export interface MeetingSentimentOverlayBarProps {
  metrics: MeetingSentimentMetrics;
  selectedPostureFilter: SegmentSentimentPosture | 'ALL';
  onSelectPostureFilter: (posture: SegmentSentimentPosture | 'ALL') => void;
  isOverlayActive: boolean;
  onToggleOverlay: () => void;
  onRunAiSentimentScan: () => void;
  isScanningAi: boolean;
  aiSource?: string;
  totalSegmentsCount: number;
}

export const MeetingSentimentOverlayBar: React.FC<MeetingSentimentOverlayBarProps> = ({
  metrics,
  selectedPostureFilter,
  onSelectPostureFilter,
  isOverlayActive,
  onToggleOverlay,
  onRunAiSentimentScan,
  isScanningAi,
  aiSource,
  totalSegmentsCount
}) => {
  if (!isOverlayActive) return null;

  return (
    <div className="bg-slate-900/95 border-b border-slate-800/90 px-4 sm:px-5 py-3 text-slate-200 transition-all duration-300 shadow-md">
      {/* Top row: Status, Verdict & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-center text-indigo-400 shrink-0 shadow-sm">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wide uppercase text-slate-200">
                Auditor Sentiment & Tone Overlay
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                  metrics.overallPosture === 'STRONG_COMPLIANCE'
                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700/70'
                    : metrics.overallPosture === 'ELEVATED_RISK'
                    ? 'bg-rose-950/90 text-rose-300 border-rose-700/70'
                    : metrics.overallPosture === 'CAUTIOUS_PROGRESS'
                    ? 'bg-amber-950/90 text-amber-300 border-amber-700/70'
                    : 'bg-sky-950/90 text-sky-300 border-sky-700/70'
                }`}
              >
                {metrics.postureBadgeText}
              </span>
              {aiSource && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-950/80 text-violet-300 border border-violet-800/60 hidden sm:inline">
                  {aiSource}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
              {metrics.postureDescription}
            </p>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onRunAiSentimentScan}
            disabled={isScanningAi || totalSegmentsCount === 0}
            className="text-[11px] px-2.5 py-1 rounded bg-violet-950/80 hover:bg-violet-900 text-violet-300 border border-violet-700/60 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            title="Perform deep Gemini AI sentiment classification across all utterances"
          >
            <Sparkles className={`w-3 h-3 text-violet-400 ${isScanningAi ? 'animate-spin' : ''}`} />
            <span>{isScanningAi ? 'Scanning AI...' : 'Deep AI Scan'}</span>
          </button>

          <button
            onClick={onToggleOverlay}
            className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
            title="Hide Sentiment Analysis Overlay"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>
      </div>

      {/* Proportional Tone Distribution Bar */}
      <div className="w-full h-2 rounded-full bg-slate-800 flex overflow-hidden mb-3 border border-slate-700/60">
        {metrics.positivePercent > 0 && (
          <div
            style={{ width: `${metrics.positivePercent}%` }}
            className="bg-emerald-500 hover:bg-emerald-400 transition-all duration-300"
            title={`Positive Compliance: ${metrics.positivePercent}% (${metrics.positiveCount} segments)`}
          />
        )}
        {metrics.cautionPercent > 0 && (
          <div
            style={{ width: `${metrics.cautionPercent}%` }}
            className="bg-amber-400 hover:bg-amber-300 transition-all duration-300"
            title={`Caution / Gap: ${metrics.cautionPercent}% (${metrics.cautionCount} segments)`}
          />
        )}
        {metrics.riskPercent > 0 && (
          <div
            style={{ width: `${metrics.riskPercent}%` }}
            className="bg-rose-500 hover:bg-rose-400 transition-all duration-300"
            title={`Identified Risks: ${metrics.riskPercent}% (${metrics.riskCount} segments)`}
          />
        )}
        {metrics.neutralPercent > 0 && (
          <div
            style={{ width: `${metrics.neutralPercent}%` }}
            className="bg-slate-600 hover:bg-slate-500 transition-all duration-300"
            title={`Procedural Neutral: ${metrics.neutralPercent}% (${metrics.neutralCount} segments)`}
          />
        )}
      </div>

      {/* Interactive Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3 text-slate-500" />
          Filter:
        </span>

        {/* All Filter */}
        <button
          onClick={() => onSelectPostureFilter('ALL')}
          className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border transition-all cursor-pointer ${
            selectedPostureFilter === 'ALL'
              ? 'bg-sky-600 text-white border-sky-400 shadow-sm'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border-slate-700'
          }`}
        >
          All ({metrics.totalSegments})
        </button>

        {/* Green: Positive Compliance Filter */}
        <button
          onClick={() =>
            onSelectPostureFilter(
              selectedPostureFilter === 'POSITIVE_COMPLIANCE' ? 'ALL' : 'POSITIVE_COMPLIANCE'
            )
          }
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
            selectedPostureFilter === 'POSITIVE_COMPLIANCE'
              ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-400/40 shadow-sm'
              : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60 border-emerald-800/60'
          }`}
          title="Click to show only utterances with positive compliance posture"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Positive Compliance</span>
          <span className="font-mono text-[10px] opacity-90">({metrics.positiveCount})</span>
        </button>

        {/* Red: Identified Risk Filter */}
        <button
          onClick={() =>
            onSelectPostureFilter(
              selectedPostureFilter === 'IDENTIFIED_RISK' ? 'ALL' : 'IDENTIFIED_RISK'
            )
          }
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
            selectedPostureFilter === 'IDENTIFIED_RISK'
              ? 'bg-rose-600 text-white border-rose-400 ring-2 ring-rose-400/40 shadow-sm'
              : 'bg-rose-950/60 text-rose-300 hover:bg-rose-900/60 border-rose-800/60'
          }`}
          title="Click to show only utterances with identified risks or vulnerabilities"
        >
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
          <span>Identified Risks</span>
          <span className="font-mono text-[10px] opacity-90">({metrics.riskCount})</span>
        </button>

        {/* Amber: Caution / Gap Filter */}
        <button
          onClick={() =>
            onSelectPostureFilter(
              selectedPostureFilter === 'CAUTION_UNCERTAINTY' ? 'ALL' : 'CAUTION_UNCERTAINTY'
            )
          }
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
            selectedPostureFilter === 'CAUTION_UNCERTAINTY'
              ? 'bg-amber-600 text-white border-amber-400 ring-2 ring-amber-400/40 shadow-sm'
              : 'bg-amber-950/60 text-amber-300 hover:bg-amber-900/60 border-amber-800/60'
          }`}
          title="Click to show only utterances with cautions or partial implementations"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Caution / Gaps</span>
          <span className="font-mono text-[10px] opacity-90">({metrics.cautionCount})</span>
        </button>

        {/* Slate: Procedural Neutral Filter */}
        <button
          onClick={() =>
            onSelectPostureFilter(
              selectedPostureFilter === 'NEUTRAL_PROCEDURAL' ? 'ALL' : 'NEUTRAL_PROCEDURAL'
            )
          }
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
            selectedPostureFilter === 'NEUTRAL_PROCEDURAL'
              ? 'bg-slate-600 text-white border-slate-400 shadow-sm'
              : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 border-slate-700'
          }`}
          title="Click to show only neutral procedural remarks and audit questions"
        >
          <span className="w-2 h-2 rounded-full bg-slate-500" />
          <span>Procedural</span>
          <span className="font-mono text-[10px] opacity-90">({metrics.neutralCount})</span>
        </button>

        {selectedPostureFilter !== 'ALL' && (
          <button
            onClick={() => onSelectPostureFilter('ALL')}
            className="text-[11px] text-sky-400 hover:underline ml-1 cursor-pointer"
          >
            Clear Filter
          </button>
        )}
      </div>
    </div>
  );
};
