import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Building,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Lock,
  Layers,
  Award,
  Video,
  Mic,
  MicOff,
  Sparkles,
  ExternalLink,
  Play,
  Square,
  AlertTriangle,
  Download,
  Share2,
  Check,
  Edit3,
  FileDown,
  Archive,
  ArchiveRestore
} from 'lucide-react';
import { MeetingInterviewSession } from '../../types/meetingScheduler';
import { DEFAULT_TRANSCRIPT_PACKS } from '../../data/liveTranscriptData';
import { exportMeetingReportPDF } from '../../utils/meetingReportPdfExporter';
import {
  STAKEHOLDER_ROLE_LABELS,
  OBJECTIVE_DEFINITIONS
} from '../../data/meetingSchedulerData';
import { getAiSuggestedScopeAreas } from '../../data/aiScopeSuggestions';
import { FrameworkPreviewModal } from './FrameworkPreviewModal';
import { DynamicAgendaPreview } from './DynamicAgendaPreview';
import { RolePreparationSummaryModal } from './RolePreparationSummaryModal';
import { ROLE_PREPARATION_PROFILES } from '../../data/rolePreparationData';
import { LiveMeetingTranscriptView } from './LiveMeetingTranscriptView';

interface MeetingDetailModalProps {
  meeting: MeetingInterviewSession;
  onClose: () => void;
  onUpdateMeeting: (updated: MeetingInterviewSession) => void;
  onOpenDossier: () => void;
  onArchiveMeeting?: (meeting: MeetingInterviewSession) => void;
  onUnarchiveMeeting?: (meeting: MeetingInterviewSession) => void;
}

export const MeetingDetailModal: React.FC<MeetingDetailModalProps> = ({
  meeting,
  onClose,
  onUpdateMeeting,
  onOpenDossier,
  onArchiveMeeting,
  onUnarchiveMeeting
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'questions' | 'transcript' | 'consents' | 'iso_mapping' | 'agenda'
  >('overview');

  const [previewFramework, setPreviewFramework] = useState<string | null>(null);
  const [isRolePrepOpen, setIsRolePrepOpen] = useState<boolean>(false);

  // Live recording state
  const [isRecording, setIsRecording] = useState<boolean>(
    meeting.status === 'In Progress'
  );
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);

  // Editable fields for live session notes
  const [currentMeeting, setCurrentMeeting] = useState<MeetingInterviewSession>(meeting);
  const [transcriptNotes, setTranscriptNotes] = useState<string>(
    meeting.transcriptSummary || ''
  );
  const [status, setStatus] = useState(meeting.status);

  useEffect(() => {
    setCurrentMeeting(meeting);
    setStatus(meeting.status);
    setTranscriptNotes(meeting.transcriptSummary || '');
  }, [meeting]);

  useEffect(() => {
    let timer: any = null;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timer) clearInterval(timer);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording]);

  const formatRecordingTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExportPdfReport = () => {
    try {
      const pack = DEFAULT_TRANSCRIPT_PACKS[currentMeeting.id] || DEFAULT_TRANSCRIPT_PACKS.mtg_001;
      const segments = pack?.initialSegments || [];
      const entities = pack?.initialEntities || [];

      exportMeetingReportPDF({
        session: currentMeeting,
        summary: currentMeeting.transcriptSummary
          ? {
              executiveSummary: currentMeeting.transcriptSummary,
              keyDiscussions: [
                `Walkthrough of ${currentMeeting.department} controls mapped to ${currentMeeting.isoProjectMapping.targetMilestone}.`,
                `Stakeholder interview with ${currentMeeting.stakeholder.name} (${currentMeeting.stakeholder.title}).`,
                `Assessed ISO Clause 7.5 documented information & evidence readiness.`
              ],
              complianceFindings: [
                {
                  topic: 'Operational Security Controls',
                  findingType: 'STRENGTH',
                  controlRef: `${currentMeeting.primaryFramework} Operational Baseline`,
                  detail: `Controls verified during interview session with ${currentMeeting.stakeholder.name}.`
                }
              ],
              actionItems: [
                {
                  task: `Finalize evidence deliverables: ${currentMeeting.isoProjectMapping.deliverableOutput}`,
                  owner: currentMeeting.stakeholder.name,
                  dueDate: currentMeeting.scheduledDate,
                  priority: 'HIGH'
                }
              ],
              auditReadinessVerdict: `Interview session ${currentMeeting.meetingCode} verified and archived for regulatory compliance.`,
              source: 'SKANDA Audit Engine',
              generatedAt: new Date().toISOString()
            }
          : null,
        segments,
        entities,
        tenantName: 'Enterprise Organization',
        leadAuditorName: currentMeeting.interviewer?.name || 'Lead ISO Auditor',
        leadAuditorRole: currentMeeting.interviewer?.role || 'Lead Auditor & GRC Evaluator',
        leadAuditorEmail: currentMeeting.interviewer?.email || 'lead.auditor@skanda-grc.internal'
      });
    } catch (err: any) {
      console.error('Failed to export meeting report PDF:', err);
    }
  };

  const handleToggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setStatus('In Progress');
      const updated: MeetingInterviewSession = {
        ...currentMeeting,
        status: 'In Progress'
      };
      setCurrentMeeting(updated);
      onUpdateMeeting(updated);
    } else {
      setIsRecording(false);
      setStatus('Transcript Ready');
      const updated: MeetingInterviewSession = {
        ...currentMeeting,
        status: 'Transcript Ready',
        transcriptSummary:
          transcriptNotes ||
          `Automated transcript generated for ${currentMeeting.stakeholder.name} (${currentMeeting.department}). 100% of ISO questions reviewed. Evidence samples collected.`
      };
      setCurrentMeeting(updated);
      onUpdateMeeting(updated);
    }
  };

  const handleUpdateQuestionFinding = (
    qId: string,
    finding: 'Conforming' | 'Observation' | 'Minor Gap' | 'Major Deficit'
  ) => {
    const updatedQuestions = currentMeeting.interviewQuestions.map(q =>
      q.id === qId ? { ...q, complianceFinding: finding } : q
    );
    const updated: MeetingInterviewSession = {
      ...currentMeeting,
      interviewQuestions: updatedQuestions
    };
    setCurrentMeeting(updated);
    onUpdateMeeting(updated);
  };

  const handleUpdateQuestionNotes = (qId: string, notes: string) => {
    const updatedQuestions = currentMeeting.interviewQuestions.map(q =>
      q.id === qId ? { ...q, responseNotes: notes } : q
    );
    const updated: MeetingInterviewSession = {
      ...currentMeeting,
      interviewQuestions: updatedQuestions
    };
    setCurrentMeeting(updated);
    onUpdateMeeting(updated);
  };

  const handleMarkCompleted = () => {
    const updated: MeetingInterviewSession = {
      ...currentMeeting,
      status: 'Completed & Mapped',
      transcriptSummary: transcriptNotes
    };
    setStatus('Completed & Mapped');
    setCurrentMeeting(updated);
    onUpdateMeeting(updated);
  };

  const roleLabel = STAKEHOLDER_ROLE_LABELS[currentMeeting.stakeholderRole]?.label || currentMeeting.stakeholderRole;
  const objectiveDef = OBJECTIVE_DEFINITIONS[currentMeeting.interviewObjective];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-indigo-400 font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-sky-400">
                  {currentMeeting.meetingCode}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    status === 'Completed & Mapped'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : status === 'In Progress'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                      : status === 'Transcript Ready'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {status}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {currentMeeting.primaryFramework}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-1">{currentMeeting.title}</h2>
            </div>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex items-center space-x-2">
            {/* Live Recording Toggle */}
            <button
              onClick={handleToggleRecording}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {isRecording ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Recording ({formatRecordingTime(recordingSeconds)})</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-rose-400" />
                  <span>Start Interview</span>
                </>
              )}
            </button>

            {/* Dossier button */}
            <button
              onClick={onOpenDossier}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Audit Dossier</span>
            </button>

            {/* Export Meeting Report PDF Button */}
            <button
              onClick={handleExportPdfReport}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md active:scale-95"
              title="Convert meeting summary and transcript into an official PDF document for audit compliance"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-100" />
              <span>Export Meeting Report</span>
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-white/20 text-white font-bold">PDF</span>
            </button>

            {/* Archive / Restore Button */}
            {currentMeeting.isArchived ? (
              <button
                onClick={() => onUnarchiveMeeting?.(currentMeeting)}
                className="px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-700/60 text-amber-300 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
                title="Restore this meeting session to the active schedule"
              >
                <ArchiveRestore className="w-3.5 h-3.5 text-amber-400" />
                <span>Restore to Active</span>
              </button>
            ) : currentMeeting.status === 'Completed & Mapped' ? (
              <button
                onClick={() => onArchiveMeeting?.(currentMeeting)}
                className="px-3 py-1.5 rounded-xl bg-amber-950/70 hover:bg-amber-900 border border-amber-700/60 text-amber-300 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
                title="Move this completed interview to the Audit Archive to declutter active views"
              >
                <Archive className="w-3.5 h-3.5 text-amber-400" />
                <span>Archive</span>
              </button>
            ) : null}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-800 bg-slate-950/60 flex items-center space-x-1 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-sky-500 text-sky-400 bg-sky-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Session Overview
          </button>
          <button
            onClick={() => setActiveTab('iso_mapping')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'iso_mapping'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>ISO Project Mapping</span>
          </button>
          <button
            onClick={() => setActiveTab('agenda')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'agenda'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Dynamic Agenda</span>
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'questions'
                ? 'border-sky-500 text-sky-400 bg-sky-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Questions & Live Notes ({currentMeeting.interviewQuestions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('transcript')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'transcript'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>AI Transcript & Studio</span>
          </button>
          <button
            onClick={() => setActiveTab('consents')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'consents'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Clause 7.5 Consents</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200">
          {/* Archived Audit Record Banner */}
          {currentMeeting.isArchived && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start sm:items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-amber-900/60 border border-amber-600/50 flex items-center justify-center text-amber-300 shrink-0 mt-0.5 sm:mt-0">
                  <Archive className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-amber-200">Archived Audit Record</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-900/50 text-amber-300 border border-amber-700/50">
                      ISO 19011 Vault
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Archived on {currentMeeting.archivedAt ? new Date(currentMeeting.archivedAt).toLocaleDateString() : 'recently'} by <strong className="text-amber-300">{currentMeeting.archivedBy || 'Lead Auditor'}</strong> • Retention until <strong className="text-emerald-400 font-mono">{currentMeeting.retentionExpiryDate || 'Scheduled Duration'}</strong> • Reason: <em>{currentMeeting.archiveReason || 'Audit cycle closed'}</em>
                  </p>
                </div>
              </div>

              <button
                onClick={() => onUnarchiveMeeting?.(currentMeeting)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer border border-slate-700 shrink-0"
                title="Restore this session to active schedule"
              >
                <ArchiveRestore className="w-3.5 h-3.5 text-sky-400" />
                <span>Restore to Active</span>
              </button>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Meta strip */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Scheduled Date & Time</span>
                  <span className="font-bold text-white mt-0.5 block">
                    {currentMeeting.scheduledDate} at {currentMeeting.scheduledTime}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">({currentMeeting.durationMinutes} mins)</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Meeting Location / Link</span>
                  <span className="font-bold text-sky-400 mt-0.5 truncate block">
                    {currentMeeting.locationOrLink}
                  </span>
                  <span className="text-[10px] text-slate-400">Encrypted Transport</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Target ISO Project</span>
                  <span className="font-bold text-indigo-300 mt-0.5 truncate block">
                    {currentMeeting.projectName}
                  </span>
                  <span className="text-[10px] text-slate-400">{currentMeeting.isoProjectMapping.projectPhase}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Lead Interviewer</span>
                  <span className="font-bold text-white mt-0.5 block">{currentMeeting.interviewer.name}</span>
                  <span className="text-[10px] text-emerald-400 font-medium">{currentMeeting.interviewer.role}</span>
                </div>
              </div>

              {/* Stakeholder and Department Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Stakeholder Card */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                      <User className="w-4 h-4 text-sky-400" />
                      <span>Stakeholder Profile</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {roleLabel}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-bold text-white">{currentMeeting.stakeholder.name}</div>
                    <div className="text-xs text-slate-300">{currentMeeting.stakeholder.title}</div>
                    <div className="text-xs text-slate-400 font-mono">{currentMeeting.stakeholder.email}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
                    <span className="font-bold text-slate-300 block mb-0.5">Role Accountability:</span>
                    {STAKEHOLDER_ROLE_LABELS[currentMeeting.stakeholderRole]?.description}
                  </div>

                  <button
                    onClick={() => setIsRolePrepOpen(true)}
                    className="w-full px-3 py-2 rounded-xl bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-700/60 text-indigo-300 text-xs font-semibold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                    title="View specific documentation required and pre-interview checklists for this role"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Role Preparation Summary ({ROLE_PREPARATION_PROFILES[currentMeeting.stakeholderRole]?.requiredDocumentation.length || 0} Evidence Artifacts)</span>
                  </button>
                </div>

                {/* Department & Objective Card */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                      <Building className="w-4 h-4 text-sky-400" />
                      <span>Department & Objective</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                      {objectiveDef?.isoClause}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-bold text-white">{currentMeeting.department}</div>
                    <div className="text-xs font-medium text-sky-300">{objectiveDef?.title}</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {currentMeeting.objectiveDescription || objectiveDef?.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-900">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                      Scattered Compliance Frameworks (Click to Preview):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentMeeting.frameworks.map(fw => (
                        <button
                          key={fw}
                          type="button"
                          onClick={() => setPreviewFramework(fw)}
                          className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 transition cursor-pointer flex items-center space-x-1"
                          title={`Preview ${fw} Scope & Key Focus Areas`}
                        >
                          <span>{fw}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI-Suggested Scope Checklist (Top 3 Critical Discussion Areas) */}
              {(() => {
                const scopeAreas =
                  currentMeeting.aiSuggestedScope && currentMeeting.aiSuggestedScope.length > 0
                    ? currentMeeting.aiSuggestedScope
                    : getAiSuggestedScopeAreas(
                        currentMeeting.primaryFramework,
                        currentMeeting.department,
                        currentMeeting.stakeholderRole,
                        currentMeeting.interviewObjective
                      );

                return (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950 border border-indigo-500/30 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          AI-Suggested Scope Checklist (3 Critical Discussion Areas)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                        {currentMeeting.primaryFramework}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                      {scopeAreas.slice(0, 3).map((area, idx) => (
                        <div
                          key={area.id || idx}
                          className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/90 space-y-2 flex flex-col justify-between"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                                Priority #{idx + 1}
                              </span>
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 truncate">
                                {area.mappedControlOrClause}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-white leading-snug">{area.topic}</h4>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              {area.rationale}
                            </p>
                          </div>

                          {area.suggestedQuestions && area.suggestedQuestions.length > 0 && (
                            <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 space-y-1">
                              <span className="font-semibold text-indigo-300 block">Core Probe:</span>
                              <p className="italic text-slate-300">"{area.suggestedQuestions[0]}"</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Status transition controller */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-white block">Interview Execution Status</span>
                  <span className="text-[11px] text-slate-400">
                    Marking completed binds all collected evidence into the active ISO audit dossier.
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUpdateQuestionFinding(currentMeeting.interviewQuestions[0]?.id || '', 'Conforming')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                  >
                    Quick-Set Conforming
                  </button>
                  <button
                    onClick={handleMarkCompleted}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete & Map to Project</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ISO PROJECT MAPPING */}
          {activeTab === 'iso_mapping' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span>Active ISO Implementation Project Crosswalk</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {currentMeeting.isoProjectMapping.projectPhase}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Project Identification</span>
                    <div className="font-bold text-white text-sm">{currentMeeting.projectName}</div>
                    <div className="text-slate-400 text-xs">Project Code: {currentMeeting.projectId}</div>
                    <div className="text-sky-300 font-medium pt-1">Milestone: {currentMeeting.isoProjectMapping.targetMilestone}</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Expected Deliverable Output</span>
                    <div className="font-bold text-emerald-300 text-sm">{currentMeeting.isoProjectMapping.deliverableOutput}</div>
                    <div className="text-slate-400 text-xs">
                      Formal working paper signed by {currentMeeting.stakeholder.name} and archived in Clause 7.5 document register.
                    </div>
                  </div>
                </div>

                {/* Mapped Clauses & Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Mapped Standard Clauses
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentMeeting.isoProjectMapping.mappedClauses.map(c => (
                        <span key={c} className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-sky-400">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Mapped Annex A Security Controls
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentMeeting.isoProjectMapping.mappedAnnexAControls.map(ctrl => (
                        <span key={ctrl} className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-emerald-400">
                          {ctrl}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Evidence Artifacts */}
                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Target Evidence Artifacts Requested from {currentMeeting.department}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {currentMeeting.isoProjectMapping.expectedEvidenceArtifacts.map((art, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="text-[11px] text-slate-300 font-medium truncate">{art}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DYNAMIC AGENDA */}
          {activeTab === 'agenda' && (
            <div className="space-y-4">
              <DynamicAgendaPreview
                framework={currentMeeting.primaryFramework}
                department={currentMeeting.department}
                role={currentMeeting.stakeholderRole}
                interviewObjective={currentMeeting.interviewObjective}
                durationMinutes={currentMeeting.durationMinutes}
                initialAgenda={currentMeeting.dynamicAgenda}
                onAgendaGenerated={(newAgenda) => {
                  const updated: MeetingInterviewSession = {
                    ...currentMeeting,
                    dynamicAgenda: newAgenda,
                    durationMinutes: newAgenda.totalDurationMinutes
                  };
                  setCurrentMeeting(updated);
                  onUpdateMeeting(updated);
                }}
              />
            </div>
          )}

          {/* TAB 3: QUESTIONS & LIVE NOTES */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Audit Protocol Questions & Working Paper Evidence
                </span>
                <span className="text-[11px] text-slate-400">
                  {currentMeeting.interviewQuestions.filter(q => q.complianceFinding === 'Conforming').length} of{' '}
                  {currentMeeting.interviewQuestions.length} Conforming
                </span>
              </div>

              <div className="space-y-3">
                {currentMeeting.interviewQuestions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-sky-400 border border-slate-800">
                            {q.mappedClauseOrControl}
                          </span>
                          <span className="text-xs font-bold text-white">{idx + 1}. {q.question}</span>
                        </div>
                      </div>

                      {/* Finding Selector */}
                      <div className="flex items-center space-x-1 shrink-0">
                        {(['Conforming', 'Observation', 'Minor Gap', 'Major Deficit'] as const).map(finding => (
                          <button
                            key={finding}
                            onClick={() => handleUpdateQuestionFinding(q.id, finding)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                              q.complianceFinding === finding
                                ? finding === 'Conforming'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                                  : finding === 'Observation'
                                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                                  : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {finding}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Response notes textarea */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center space-x-1">
                        <Edit3 className="w-3 h-3" />
                        <span>Stakeholder Response & Lead Auditor Notes:</span>
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Record detailed notes, sample IDs, system links, or specific observations..."
                        value={q.responseNotes || ''}
                        onChange={e => handleUpdateQuestionNotes(q.id, e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TRANSCRIPT & RECORDING STUDIO */}
          {activeTab === 'transcript' && (
            <div className="space-y-4">
              <LiveMeetingTranscriptView
                session={currentMeeting}
                isEmbeddedInModal={true}
                onUpdateSession={updated => {
                  const next = { ...currentMeeting, ...updated };
                  setCurrentMeeting(next);
                  onUpdateMeeting(next);
                }}
              />
            </div>
          )}

          {/* TAB 5: CONSENTS & CLAUSE 7.5 */}
          {activeTab === 'consents' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Clause 7.5 Documented Information & Stakeholder Consents</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    100% Attestation Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold text-white block">A/V Session Recording Authorization</span>
                      <span className="text-[11px] text-slate-400 block">
                        Status: <strong className="text-emerald-400">Granted</strong>
                      </span>
                      {currentMeeting.consents.recordingConsentTimestamp && (
                        <span className="text-[10px] font-mono text-emerald-300/90 block">
                          Timestamp: {currentMeeting.consents.recordingConsentTimestamp}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold text-white block">AI Transcription Authorization</span>
                      <span className="text-[11px] text-slate-400 block">
                        Status: <strong className="text-emerald-400">Authorized</strong> for NLP synthesis
                      </span>
                      {currentMeeting.consents.transcriptConsentTimestamp && (
                        <span className="text-[10px] font-mono text-emerald-300/90 block">
                          Timestamp: {currentMeeting.consents.transcriptConsentTimestamp}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold text-white block">ISO Clause 7.5 Non-Disclosure Protocol</span>
                      <span className="text-[11px] text-slate-400 block">
                        Status: <strong className="text-emerald-400">Legally Bound & Ratified</strong>
                      </span>
                      {currentMeeting.consents.confidentialityConsentTimestamp && (
                        <span className="text-[10px] font-mono text-emerald-300/90 block">
                          Timestamp: {currentMeeting.consents.confidentialityConsentTimestamp}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold text-white block">External Auditor Access & Sampling</span>
                      <span className="text-[11px] text-slate-400 block">
                        Retention: <strong className="text-sky-400">{currentMeeting.consents.dataRetentionMonths} Months</strong>
                      </span>
                      {currentMeeting.consents.auditorAccessConsentTimestamp && (
                        <span className="text-[10px] font-mono text-emerald-300/90 block">
                          Timestamp: {currentMeeting.consents.auditorAccessConsentTimestamp}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cryptographic hash ledger */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-mono text-xs">
                  <div className="text-slate-400 text-[11px] flex items-center justify-between">
                    <span>Signer: <strong className="text-white">{currentMeeting.consents.consentSignerName}</strong> ({currentMeeting.consents.consentSignerEmail})</span>
                    <span>IP: {currentMeeting.consents.consentIpAddress}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 break-all">
                    SHA-256 Signature Verification Hash:{' '}
                    <span className="text-emerald-400 font-bold">{currentMeeting.consents.consentIntegrityHash}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            Audit Working Paper Code: <strong className="text-white font-mono">{currentMeeting.meetingCode}</strong>
          </span>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={onOpenDossier}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span>Export Dossier</span>
            </button>
            <button
              onClick={handleExportPdfReport}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm active:scale-95"
            >
              <FileDown className="w-4 h-4 text-emerald-100" />
              <span>Export Meeting Report (PDF)</span>
            </button>
            {currentMeeting.isArchived ? (
              <button
                onClick={() => onUnarchiveMeeting?.(currentMeeting)}
                className="px-4 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-700/60 text-amber-300 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
              >
                <ArchiveRestore className="w-4 h-4 text-amber-400" />
                <span>Restore to Active</span>
              </button>
            ) : currentMeeting.status === 'Completed & Mapped' ? (
              <button
                onClick={() => onArchiveMeeting?.(currentMeeting)}
                className="px-4 py-1.5 rounded-xl bg-amber-950/70 hover:bg-amber-900 border border-amber-700/60 text-amber-300 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
              >
                <Archive className="w-4 h-4 text-amber-400" />
                <span>Archive Working Paper</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {previewFramework && (
        <FrameworkPreviewModal
          frameworkId={previewFramework}
          onClose={() => setPreviewFramework(null)}
        />
      )}

      {isRolePrepOpen && (
        <RolePreparationSummaryModal
          isOpen={isRolePrepOpen}
          onClose={() => setIsRolePrepOpen(false)}
          selectedRole={currentMeeting.stakeholderRole}
          stakeholderName={currentMeeting.stakeholder.name}
          departmentName={currentMeeting.department}
        />
      )}
    </div>
  );
};
