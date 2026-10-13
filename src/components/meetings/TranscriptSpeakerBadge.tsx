import React, { useState } from 'react';
import {
  Shield,
  UserCheck,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  ArrowRightLeft,
  User,
  Cpu
} from 'lucide-react';
import {
  DetectedSpeakerLabel,
  MeetingInterviewSession
} from '../../types/meetingScheduler';
import { getSpeakerColorTheme } from '../../utils/meetingSpeakerDetector';

interface TranscriptSpeakerBadgeProps {
  speakerLabel: DetectedSpeakerLabel;
  session: MeetingInterviewSession;
  timestamp: string;
  onReassignSpeaker?: (newSpeakerName: string, newRole: string, newAffiliation: any) => void;
}

export const TranscriptSpeakerBadge: React.FC<TranscriptSpeakerBadgeProps> = ({
  speakerLabel,
  session,
  timestamp,
  onReassignSpeaker
}) => {
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const theme = getSpeakerColorTheme(speakerLabel.affiliation);
  const isAuditor = speakerLabel.affiliation === 'AUDIT_TEAM';

  const interviewerName = session.interviewer?.name || 'Alexander Ward';
  const interviewerRole = session.interviewer?.role || 'Lead ISO 27001 Auditor';
  const stakeholderName = session.stakeholder?.name || 'Michael Chen';
  const stakeholderRole = session.stakeholder?.title || 'DevSecOps Lead';

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Speaker Avatar with Initial & Role Badge */}
      <div className="relative group/avatar">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border shadow-sm ${theme.avatarClass}`}
          title={`${speakerLabel.speakerName} (${speakerLabel.role})`}
        >
          {speakerLabel.speakerName.charAt(0)}
        </div>
        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
          {isAuditor ? (
            <Shield className="w-2 h-2 text-indigo-400" />
          ) : (
            <UserCheck className="w-2 h-2 text-emerald-400" />
          )}
        </div>
      </div>

      {/* Speaker Name with interactive reassign option */}
      <div className="relative">
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            setIsReassignOpen(prev => !prev);
          }}
          className="flex items-center gap-1 text-xs font-bold text-slate-100 hover:text-sky-300 transition-colors cursor-pointer group/name"
          title="Click to reassign or verify speaker attribution"
        >
          <span>{speakerLabel.speakerName}</span>
          <ChevronDown className="w-3 h-3 text-slate-500 group-hover/name:text-sky-400 opacity-60 group-hover/name:opacity-100 transition-all" />
        </button>

        {/* Reassignment Dropdown Popover */}
        {isReassignOpen && (
          <div
            onClick={e => e.stopPropagation()}
            className="absolute left-0 top-full mt-1.5 z-40 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2.5 text-left text-xs"
          >
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
              Reassign Speaker Attribution:
            </p>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  onReassignSpeaker?.(interviewerName, interviewerRole, 'AUDIT_TEAM');
                  setIsReassignOpen(false);
                }}
                className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 flex items-center gap-2 text-slate-200 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/60 flex items-center justify-center text-[10px] font-bold">
                  {interviewerName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-xs truncate">{interviewerName}</div>
                  <div className="text-[10px] text-indigo-400">Lead ISO Auditor (Audit Team)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onReassignSpeaker?.(stakeholderName, stakeholderRole, 'AUDITEE_STAKEHOLDER');
                  setIsReassignOpen(false);
                }}
                className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 flex items-center gap-2 text-slate-200 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center justify-center text-[10px] font-bold">
                  {stakeholderName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-xs truncate">{stakeholderName}</div>
                  <div className="text-[10px] text-emerald-400">Auditee ({stakeholderRole})</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onReassignSpeaker?.('Security Specialist', 'Technical SME', 'TECHNICAL_SME');
                  setIsReassignOpen(false);
                }}
                className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 flex items-center gap-2 text-slate-200 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-sky-950 text-sky-300 border border-sky-700/60 flex items-center justify-center text-[10px] font-bold">
                  S
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-xs">Security Specialist</div>
                  <div className="text-[10px] text-sky-400">Technical SME (Engineering)</div>
                </div>
              </button>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-500">
              Changes persist across audit logs and exports.
            </div>
          </div>
        )}
      </div>

      {/* Speaker Role Badge */}
      <span
        className={`text-[10px] px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 ${theme.badgeClass}`}
      >
        <span>{speakerLabel.role}</span>
      </span>

      {/* Affiliation Pill */}
      <span
        className={`text-[9px] uppercase font-mono font-bold px-1.5 py-0.2 rounded border ${
          isAuditor
            ? 'bg-indigo-950/40 text-indigo-400 border-indigo-800/40'
            : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
        }`}
      >
        {isAuditor ? 'Audit Team' : 'Auditee Org'}
      </span>

      {/* Diarization Confidence & Attribution Mode Pill */}
      <div
        className="flex items-center gap-1 text-[9px] font-mono text-slate-400 bg-slate-950/60 px-1.5 py-0.2 rounded border border-slate-800 cursor-help"
        title={`Speaker Attribution: ${speakerLabel.detectedReason || 'Automated Diarization'} (${Math.round(
          speakerLabel.confidence * 100
        )}% confidence)`}
      >
        <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
        <span>{Math.round(speakerLabel.confidence * 100)}% Diarized</span>
      </div>

      {/* Turn Number Indicator */}
      {typeof speakerLabel.turnNumber === 'number' && (
        <span className="text-[9px] font-mono text-slate-500">
          Turn #{speakerLabel.turnNumber < 10 ? `0${speakerLabel.turnNumber}` : speakerLabel.turnNumber}
        </span>
      )}
    </div>
  );
};
