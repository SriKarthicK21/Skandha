import React from 'react';
import {
  Users,
  UserCheck,
  Shield,
  Sparkles,
  Filter,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers
} from 'lucide-react';
import { MeetingSpeakerSummary, getSpeakerColorTheme } from '../../utils/meetingSpeakerDetector';

interface MeetingSpeakerDiarizationBarProps {
  detectedSpeakers: MeetingSpeakerSummary[];
  totalTurns: number;
  speakerSwitchCount: number;
  diarizationCoveragePercent: number;
  selectedSpeakerFilter: string; // 'ALL' or speakerId
  onSelectSpeakerFilter: (speakerId: string) => void;
  onRunAiDiarization: () => void;
  isDiarizing: boolean;
  diarizationSource: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const MeetingSpeakerDiarizationBar: React.FC<MeetingSpeakerDiarizationBarProps> = ({
  detectedSpeakers,
  totalTurns,
  speakerSwitchCount,
  diarizationCoveragePercent,
  selectedSpeakerFilter,
  onSelectSpeakerFilter,
  onRunAiDiarization,
  isDiarizing,
  diarizationSource,
  isExpanded,
  onToggleExpand
}) => {
  return (
    <div className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-5 py-2.5 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Summary and Status */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-indigo-400">
            <Users className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Speaker Diarization
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/50 flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                {diarizationCoveragePercent}% Diarized
              </span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                ({diarizationSource === 'gemini-ai' ? 'Gemini AI Diarized' : 'Autonomous Engine'})
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
              <span>{detectedSpeakers.length} participants identified</span>
              <span>•</span>
              <span>{totalTurns} dialogue turns</span>
              <span>•</span>
              <span>{speakerSwitchCount} speaker transitions</span>
            </p>
          </div>
        </div>

        {/* Right: Actions and Expand Toggle */}
        <div className="flex items-center gap-2">
          {/* Re-run AI Diarization Button */}
          <button
            onClick={onRunAiDiarization}
            disabled={isDiarizing}
            className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Re-run automated AI speaker diarization across transcript segments"
          >
            <Sparkles className={`w-3 h-3 text-indigo-400 ${isDiarizing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{isDiarizing ? 'Diarizing...' : 'Re-run Diarization'}</span>
          </button>

          {/* Quick Filter Pill for All */}
          <button
            onClick={() => onSelectSpeakerFilter('ALL')}
            className={`text-xs px-2 py-1 rounded font-medium transition-all cursor-pointer ${
              selectedSpeakerFilter === 'ALL'
                ? 'bg-sky-600 text-white font-bold shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
            }`}
          >
            All Speakers
          </button>

          {/* Expand / Collapse Details Toggle */}
          <button
            onClick={onToggleExpand}
            className="text-xs p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
            title={isExpanded ? 'Collapse speaker cards' : 'Expand speaker cards'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Participant Roster & Speaking Share Bar */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-3">
          {/* Continuous Speaking Share Bar */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-500" />
                Dialogue Share by Word Count:
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                Click any participant below to isolate their statements
              </span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
              {detectedSpeakers.map(spk => {
                const theme = getSpeakerColorTheme(spk.affiliation);
                const bgColors: Record<string, string> = {
                  indigo: 'bg-indigo-500',
                  emerald: 'bg-emerald-500',
                  sky: 'bg-sky-500',
                  purple: 'bg-purple-500',
                  amber: 'bg-amber-500'
                };
                return (
                  <div
                    key={spk.speakerId}
                    style={{ width: `${Math.max(spk.percentageShare, 5)}%` }}
                    className={`${bgColors[theme.colorKey] || 'bg-slate-500'} h-full transition-all duration-300 relative group cursor-pointer`}
                    onClick={() => onSelectSpeakerFilter(spk.speakerId)}
                    title={`${spk.speakerName} (${spk.role}): ${spk.percentageShare}% of words (${spk.utteranceCount} utterances)`}
                  />
                );
              })}
            </div>
          </div>

          {/* Participant Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {detectedSpeakers.map(speaker => {
              const isSelected = selectedSpeakerFilter === speaker.speakerId;
              const isAuditor = speaker.affiliation === 'AUDIT_TEAM';
              const theme = getSpeakerColorTheme(speaker.affiliation);

              return (
                <div
                  key={speaker.speakerId}
                  onClick={() => onSelectSpeakerFilter(isSelected ? 'ALL' : speaker.speakerId)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-slate-800/90 border-sky-400 ring-2 ring-sky-400/40 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Avatar with role icon */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border relative ${theme.avatarClass}`}
                    >
                      {speaker.speakerName.charAt(0)}
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                        {isAuditor ? (
                          <Shield className="w-2 h-2 text-indigo-400" />
                        ) : (
                          <UserCheck className="w-2 h-2 text-emerald-400" />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          {speaker.speakerName}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] px-1 rounded bg-sky-500 text-white font-bold shrink-0">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        {speaker.role}
                      </p>
                      <span
                        className={`text-[9px] inline-block mt-0.5 px-1.5 py-0.2 rounded font-mono border ${theme.tagClass}`}
                      >
                        {speaker.affiliation === 'AUDIT_TEAM'
                          ? 'Audit Team'
                          : speaker.affiliation === 'AUDITEE_STAKEHOLDER'
                          ? 'Auditee / Org'
                          : 'Specialist'}
                      </span>
                    </div>
                  </div>

                  {/* Utterance Stats */}
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-200">
                      {speaker.utteranceCount}{' '}
                      <span className="text-[10px] font-normal text-slate-400">turns</span>
                    </span>
                    <p className="text-[10px] font-mono text-slate-400">
                      {speaker.percentageShare}% share
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
