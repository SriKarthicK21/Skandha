import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Users2,
  Building,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Lock,
  Plus,
  Search,
  Filter,
  Layers,
  Award,
  Video,
  ExternalLink,
  Download,
  Trash2,
  Check,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutGrid,
  Sparkles,
  RefreshCw,
  AlertCircle,
  BookOpen,
  Radio,
  Mic,
  FileDown,
  Archive,
  ArchiveRestore,
  ListFilter
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import { PageContainer } from '../layout/PageContainer';
import { MeetingInterviewSession, StakeholderRole } from '../../types/meetingScheduler';
import {
  INITIAL_MEETING_SESSIONS,
  ISO_PROJECTS_CATALOG,
  STAKEHOLDER_ROLE_LABELS,
  OBJECTIVE_DEFINITIONS,
  AVAILABLE_FRAMEWORKS
} from '../../data/meetingSchedulerData';
import { MeetingBookingForm } from './MeetingBookingForm';
import { MeetingDetailModal } from './MeetingDetailModal';
import { MeetingDossierExportModal } from './MeetingDossierExportModal';
import { FrameworkPreviewModal } from './FrameworkPreviewModal';
import { DynamicAgendaPreview } from './DynamicAgendaPreview';
import { RolePreparationSummaryModal } from './RolePreparationSummaryModal';
import { LiveMeetingTranscriptView } from './LiveMeetingTranscriptView';
import { ArchiveConfirmationModal } from './ArchiveConfirmationModal';
import { DEFAULT_TRANSCRIPT_PACKS } from '../../data/liveTranscriptData';
import { exportMeetingReportPDF } from '../../utils/meetingReportPdfExporter';
import { safeConfirm } from '../../utils/safeConfirm';

const LOCAL_STORAGE_KEY = 'skanda_iso_meeting_scheduler_sessions';

export const MeetingSchedulerModule: React.FC = () => {
  const { currentTenant, currentUser, addTask } = useGRC();
  const { showToast } = useToast();

  // Load meetings from localStorage or fallback to initial sessions
  const [meetings, setMeetings] = useState<MeetingInterviewSession[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_MEETING_SESSIONS;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(meetings));
    } catch {
      // ignore
    }
  }, [meetings]);

  // View mode
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'matrix' | 'agenda' | 'live'>('grid');
  const [selectedMeetingForLive, setSelectedMeetingForLive] = useState<MeetingInterviewSession | null>(null);

  // Active session for live view
  const activeLiveSession = useMemo(() => {
    if (selectedMeetingForLive) {
      const found = meetings.find(m => m.id === selectedMeetingForLive.id);
      if (found) return found;
    }
    return meetings[0] || null;
  }, [selectedMeetingForLive, meetings]);

  // Agenda Workbench Interactive State
  const [workbenchFramework, setWorkbenchFramework] = useState<string>('ISO/IEC 27001:2022');
  const [workbenchDepartment, setWorkbenchDepartment] = useState<string>('Software Engineering & DevOps');
  const [workbenchDuration, setWorkbenchDuration] = useState<number>(60);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  // Archive tab filter: 'ACTIVE' (default, declutters active dashboard), 'ARCHIVED' (vault), or 'ALL'
  const [archiveTab, setArchiveTab] = useState<'ACTIVE' | 'ARCHIVED' | 'ALL'>('ACTIVE');

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [selectedMeetingForDetail, setSelectedMeetingForDetail] = useState<MeetingInterviewSession | null>(null);
  const [selectedMeetingForDossier, setSelectedMeetingForDossier] = useState<MeetingInterviewSession | null>(null);
  const [selectedFrameworkForPreview, setSelectedFrameworkForPreview] = useState<string | null>(null);
  const [selectedRoleForPrep, setSelectedRoleForPrep] = useState<StakeholderRole | null>(null);
  const [prepContextStakeholder, setPrepContextStakeholder] = useState<{ name?: string; dept?: string }>({});

  // Archive modal state
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState<boolean>(false);
  const [meetingsToArchive, setMeetingsToArchive] = useState<MeetingInterviewSession[]>([]);

  // Counts for pipeline vs archive
  const activeSessionsCount = useMemo(() => meetings.filter(m => !m.isArchived).length, [meetings]);
  const archivedSessionsCount = useMemo(() => meetings.filter(m => m.isArchived).length, [meetings]);
  const completedUnarchivedCount = useMemo(
    () => meetings.filter(m => !m.isArchived && m.status === 'Completed & Mapped').length,
    [meetings]
  );

  // Available departments from current meetings
  const allDepartments = useMemo(() => {
    const set = new Set<string>();
    meetings.forEach(m => set.add(m.department));
    return Array.from(set);
  }, [meetings]);

  // Filtered meetings
  const filteredMeetings = useMemo(() => {
    return meetings.filter(m => {
      // Archive Tab Filter (Default: ACTIVE hides archived records to declutter)
      if (archiveTab === 'ACTIVE' && m.isArchived) {
        return false;
      }
      if (archiveTab === 'ARCHIVED' && !m.isArchived) {
        return false;
      }

      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          m.title.toLowerCase().includes(query) ||
          m.stakeholder.name.toLowerCase().includes(query) ||
          m.stakeholder.email.toLowerCase().includes(query) ||
          m.department.toLowerCase().includes(query) ||
          m.meetingCode.toLowerCase().includes(query) ||
          m.projectName.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // Project filter
      if (projectFilter !== 'ALL' && m.projectId !== projectFilter) {
        return false;
      }

      // Department filter
      if (departmentFilter !== 'ALL' && m.department !== departmentFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'ARCHIVED_ONLY') {
          if (!m.isArchived) return false;
        } else if (m.status !== statusFilter) {
          return false;
        }
      }

      // Stakeholder Role filter
      if (roleFilter !== 'ALL' && m.stakeholderRole !== roleFilter) {
        return false;
      }

      return true;
    });
  }, [meetings, searchQuery, projectFilter, departmentFilter, statusFilter, roleFilter, archiveTab]);

  // Metrics
  const metrics = useMemo(() => {
    const total = meetings.length;
    const activeTotal = meetings.filter(m => !m.isArchived).length;
    const archivedTotal = meetings.filter(m => m.isArchived).length;
    const completed = meetings.filter(m => m.status === 'Completed & Mapped').length;
    const scheduled = meetings.filter(m => m.status === 'Scheduled').length;
    const inProgress = meetings.filter(m => m.status === 'In Progress' || m.status === 'Transcript Ready').length;

    // Distinct clauses covered
    const clauseSet = new Set<string>();
    meetings.forEach(m => {
      m.isoProjectMapping.mappedClauses.forEach(c => clauseSet.add(c));
    });

    // Consents rate
    const consentsSigned = meetings.filter(
      m => m.consents.confidentialityAgreementConsent && m.consents.audioVideoRecordingConsent
    ).length;
    const consentRate = total > 0 ? Math.round((consentsSigned / total) * 100) : 100;

    return {
      total,
      activeTotal,
      archivedTotal,
      completed,
      scheduled,
      inProgress,
      distinctClausesCount: clauseSet.size,
      consentRate
    };
  }, [meetings]);

  // Archive Handlers
  const handleOpenArchiveModal = (session: MeetingInterviewSession) => {
    setMeetingsToArchive([session]);
    setIsArchiveModalOpen(true);
  };

  const handleArchiveAllCompleted = () => {
    const completed = meetings.filter(m => !m.isArchived && m.status === 'Completed & Mapped');
    if (completed.length === 0) {
      showToast({
        type: 'info',
        title: 'No Completed Sessions',
        message: 'There are no active completed sessions to archive at this time.'
      });
      return;
    }
    setMeetingsToArchive(completed);
    setIsArchiveModalOpen(true);
  };

  const handleConfirmArchive = (
    sessionIds: string[],
    archiveMetadata: {
      archiveReason: string;
      retentionMonths: number;
      retentionExpiryDate: string;
      archivedBy: string;
    }
  ) => {
    const now = new Date().toISOString();
    setMeetings(prev =>
      prev.map(m => {
        if (sessionIds.includes(m.id)) {
          return {
            ...m,
            isArchived: true,
            archivedAt: now,
            archivedBy: archiveMetadata.archivedBy,
            archiveReason: archiveMetadata.archiveReason,
            retentionExpiryDate: archiveMetadata.retentionExpiryDate,
            archiveIntegrityHash:
              m.consents?.consentIntegrityHash ||
              'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
          };
        }
        return m;
      })
    );

    if (selectedMeetingForDetail && sessionIds.includes(selectedMeetingForDetail.id)) {
      setSelectedMeetingForDetail(prev =>
        prev
          ? {
              ...prev,
              isArchived: true,
              archivedAt: now,
              archivedBy: archiveMetadata.archivedBy,
              archiveReason: archiveMetadata.archiveReason,
              retentionExpiryDate: archiveMetadata.retentionExpiryDate
            }
          : null
      );
    }

    setIsArchiveModalOpen(false);
    setMeetingsToArchive([]);

    showToast({
      type: 'success',
      title: 'Sessions Moved to Audit Archive',
      message: `${sessionIds.length} completed ${
        sessionIds.length === 1 ? 'session' : 'sessions'
      } sealed & archived. Dashboard successfully decluttered.`
    });
  };

  const handleRestoreSession = (sessionId: string, meetingCode: string) => {
    setMeetings(prev =>
      prev.map(m => {
        if (m.id === sessionId) {
          return {
            ...m,
            isArchived: false
          };
        }
        return m;
      })
    );

    if (selectedMeetingForDetail?.id === sessionId) {
      setSelectedMeetingForDetail(prev => (prev ? { ...prev, isArchived: false } : null));
    }

    showToast({
      type: 'info',
      title: 'Session Restored',
      message: `Meeting ${meetingCode} restored to active operational schedule.`
    });
  };

  // Add new meeting
  const handleSaveMeeting = (newMeeting: MeetingInterviewSession, shouldCreateTask: boolean) => {
    setMeetings(prev => [newMeeting, ...prev]);
    setIsBookingModalOpen(false);

    // If requested, create a linked task in GRCContext
    if (shouldCreateTask) {
      addTask({
        title: `[ISO Interview Action] ${newMeeting.title}`,
        description: `Follow-up evidence collection and control implementation following ISO discovery interview with ${newMeeting.stakeholder.name} (${newMeeting.stakeholder.title}). Deliverable: ${newMeeting.isoProjectMapping.deliverableOutput}. Expected Artifacts: ${newMeeting.isoProjectMapping.expectedEvidenceArtifacts.join(', ')}`,
        category: 'Audit Prep',
        priority: 'High',
        status: 'To Do',
        assignedTo: newMeeting.stakeholder.name,
        department: newMeeting.department,
        dueDate: newMeeting.scheduledDate,
        linkedControl: newMeeting.isoProjectMapping.mappedAnnexAControls[0] || 'Annex A'
      });
    }

    showToast({
      type: 'success',
      title: 'Interview Scheduled',
      message: `Interview "${newMeeting.meetingCode}" scheduled & mapped to ${newMeeting.projectName}${shouldCreateTask ? ' (Task created)' : ''}.`
    });
  };

  // Update existing meeting
  const handleUpdateMeeting = (updated: MeetingInterviewSession) => {
    setMeetings(prev => prev.map(m => (m.id === updated.id ? updated : m)));
    if (selectedMeetingForDetail?.id === updated.id) {
      setSelectedMeetingForDetail(updated);
    }
  };

  // Delete meeting
  const handleDeleteMeeting = (id: string, meetingCode: string) => {
    if (safeConfirm(`Are you sure you want to cancel and remove interview session ${meetingCode}?`)) {
      setMeetings(prev => prev.filter(m => m.id !== id));
      showToast({
        type: 'info',
        title: 'Interview Cancelled',
        message: `Interview session ${meetingCode} cancelled.`
      });
    }
  };

  // Grouped by project for the Project Mapping Matrix view
  const projectMatrixGroups = useMemo(() => {
    const groups: Record<string, { project: typeof ISO_PROJECTS_CATALOG[0]; sessions: MeetingInterviewSession[] }> = {};

    ISO_PROJECTS_CATALOG.forEach(proj => {
      groups[proj.id] = {
        project: proj,
        sessions: meetings.filter(m => m.projectId === proj.id)
      };
    });

    return Object.values(groups);
  }, [meetings]);

  // Export Meeting Report to PDF for audit compliance
  const handleExportMeetingReport = (meetingToExport?: MeetingInterviewSession) => {
    const targetMeeting = meetingToExport || activeLiveSession || meetings[0];
    if (!targetMeeting) {
      showToast({
        type: 'warning',
        title: 'No Meeting Selected',
        message: 'Please select a meeting session to export.'
      });
      return;
    }

    try {
      const pack = DEFAULT_TRANSCRIPT_PACKS[targetMeeting.id] || DEFAULT_TRANSCRIPT_PACKS.mtg_001;
      const segments = pack?.initialSegments || [];
      const entities = pack?.initialEntities || [];

      exportMeetingReportPDF({
        session: targetMeeting,
        summary: targetMeeting.transcriptSummary
          ? {
              executiveSummary: targetMeeting.transcriptSummary,
              keyDiscussions: [
                `Walkthrough of ${targetMeeting.department} operational controls mapped to ${targetMeeting.isoProjectMapping.targetMilestone}.`,
                `Reviewed compliance posture and access controls with stakeholder ${targetMeeting.stakeholder.name} (${targetMeeting.stakeholder.title}).`,
                `Evaluated documented information and consents per ISO 27001 Clause 7.5.`,
                `Verified technical systems and evidence deliverables: ${targetMeeting.isoProjectMapping.deliverableOutput}.`
              ],
              complianceFindings: [
                {
                  topic: 'Operational Control Implementation',
                  findingType: 'STRENGTH',
                  controlRef: `${targetMeeting.primaryFramework} Core Controls`,
                  detail: `Operational baseline and security protocols confirmed during audit interview with ${targetMeeting.stakeholder.name}.`
                },
                {
                  topic: 'Evidence Readiness & Action Tracking',
                  findingType: 'OBSERVATION',
                  controlRef: `${targetMeeting.primaryFramework} Cl. 7.5`,
                  detail: `Ensure evidence artifacts (${targetMeeting.isoProjectMapping.expectedEvidenceArtifacts.join(', ')}) are formally archived.`
                }
              ],
              actionItems: [
                {
                  task: `Collect and submit artifacts for ${targetMeeting.isoProjectMapping.deliverableOutput}`,
                  owner: targetMeeting.stakeholder.name,
                  dueDate: targetMeeting.scheduledDate,
                  priority: 'HIGH'
                }
              ],
              auditReadinessVerdict: `Audit interview for ${targetMeeting.meetingCode} completed. Working papers and evidence artifacts documented for compliance assurance.`,
              source: 'SKANDA Audit Engine',
              generatedAt: new Date().toISOString()
            }
          : null,
        segments,
        entities,
        tenantName: currentTenant?.name || 'Enterprise Organization',
        leadAuditorName: targetMeeting.interviewer?.name || currentUser?.name || 'Lead ISO Auditor',
        leadAuditorRole: targetMeeting.interviewer?.role || 'Lead Auditor & GRC Evaluator',
        leadAuditorEmail: targetMeeting.interviewer?.email || currentUser?.email || 'lead.auditor@skanda-grc.internal'
      });

      showToast({
        type: 'success',
        title: 'Meeting Report Exported',
        message: `Official PDF Audit Report generated and downloaded for ${targetMeeting.meetingCode}.`
      });
    } catch (err: any) {
      console.error('Failed to export meeting report PDF:', err);
      showToast({
        type: 'error',
        title: 'Export Failed',
        message: 'Could not generate meeting report PDF. Please try again.'
      });
    }
  };

  return (
    <PageContainer id="meeting-scheduler-module">
      {/* Header section with breadcrumb & actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium mb-1">
            <span>Governance & Management</span>
            <span>/</span>
            <span>ISO Implementation</span>
            <span>/</span>
            <span className="text-sky-400">Meeting Scheduler</span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>ISO Meeting Scheduler</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
              Clause 4.2 & 7.5
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Stakeholder Discovery, Departmental Scoping & Audit Working Papers Mapped to ISO Implementation
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <button
            onClick={() => {
              setSelectedRoleForPrep('DEPARTMENT_HEAD');
              setPrepContextStakeholder({});
            }}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
            title="View Role Preparation Summary, documentation required & checklists for any stakeholder role"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Role Preparation Summary</span>
          </button>
          <button
            onClick={() => setViewMode('agenda')}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs cursor-pointer ${
              viewMode === 'agenda'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
            }`}
            title="Open Interactive Dynamic ISO Audit Agenda Workbench"
          >
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Dynamic Agenda Preview</span>
          </button>
          <button
            onClick={() => setSelectedFrameworkForPreview('ISO/IEC 27001:2022')}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
            title="Preview ISO & Compliance Framework Interview Scopes"
          >
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span>Framework Scope Previews</span>
          </button>
          <button
            onClick={() => {
              if (!selectedMeetingForLive && meetings.length > 0) {
                setSelectedMeetingForLive(meetings[0]);
              }
              setViewMode('live');
            }}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer ${
              viewMode === 'live'
                ? 'bg-rose-950 text-rose-300 border-rose-600 shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-rose-300'
            }`}
            title="Open Real-Time Live Transcript & Identified Entities View"
          >
            <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
            <span>Live AI Studio</span>
          </button>
          <button
            onClick={() => handleExportMeetingReport()}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer active:scale-95"
            title="Export Meeting Report with AI summary, findings, and verbatim transcript to PDF for audit compliance"
          >
            <FileDown className="w-4 h-4 text-emerald-100" />
            <span>Export Meeting Report</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/20 text-white font-bold">PDF</span>
          </button>
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Interview</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* KPI Dashboard Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Planned Sessions */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scheduled Sessions</span>
              <div className="w-8 h-8 rounded-xl bg-sky-950/80 border border-sky-800/60 flex items-center justify-center text-sky-400">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-black text-white">{metrics.total}</span>
              <span className="text-xs text-sky-400 font-semibold">{metrics.scheduled} Upcoming</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
              <span>Conducted / Completed:</span>
              <span className="font-bold text-emerald-400">{metrics.completed} Verified</span>
            </div>
          </div>

          {/* Card 2: ISO Clauses Covered */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ISO Clauses Covered</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-black text-white">{metrics.distinctClausesCount}</span>
              <span className="text-xs text-indigo-400 font-semibold">Standard Clauses</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
              <span>Annex A Controls Tested:</span>
              <span className="font-bold text-indigo-300">14 Security Domains</span>
            </div>
          </div>

          {/* Card 3: Stakeholder Consents Attested */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clause 7.5 Consents</span>
              <div className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400">
                <Lock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-black text-emerald-400">{metrics.consentRate}%</span>
              <span className="text-xs text-emerald-400 font-semibold">Attestation Rate</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
              <span>Cryptographic Signatures:</span>
              <span className="font-mono text-white text-[10px]">SHA-256 Verified</span>
            </div>
          </div>

          {/* Card 4: Active Implementation Project */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Project Phase</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-sm font-black text-white truncate block">
                Phase 5 Fieldwork
              </span>
              <span className="text-xs text-slate-400">BSI Stage 1 Readiness</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
              <span>Audit Target:</span>
              <span className="font-bold text-sky-400 font-mono">Nov 2026</span>
            </div>
          </div>
        </div>

        {/* Pipeline & Archive Mode Segmented Controller */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setArchiveTab('ACTIVE')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                archiveTab === 'ACTIVE'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Active Pipeline</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  archiveTab === 'ACTIVE'
                    ? 'bg-sky-700 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {activeSessionsCount}
              </span>
            </button>

            <button
              onClick={() => setArchiveTab('ARCHIVED')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                archiveTab === 'ARCHIVED'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Archive className="w-3.5 h-3.5 text-amber-200" />
              <span>Audit Archive Vault</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  archiveTab === 'ARCHIVED'
                    ? 'bg-amber-700 text-white'
                    : 'bg-slate-800 text-amber-400/90'
                }`}
              >
                {archivedSessionsCount}
              </span>
            </button>

            <button
              onClick={() => setArchiveTab('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                archiveTab === 'ALL'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>All Sessions</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  archiveTab === 'ALL'
                    ? 'bg-slate-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {metrics.total}
              </span>
            </button>
          </div>

          {/* Quick Declutter or Audit Guarantee Tag */}
          <div className="flex items-center space-x-2">
            {completedUnarchivedCount > 0 && archiveTab === 'ACTIVE' && (
              <button
                onClick={handleArchiveAllCompleted}
                className="px-3.5 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-700/60 text-amber-300 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-95"
                title="Move completed & mapped sessions to the ISO 19011 Audit Archive Vault to declutter the dashboard"
              >
                <Archive className="w-3.5 h-3.5 text-amber-400" />
                <span>Declutter Active View ({completedUnarchivedCount} Completed)</span>
              </button>
            )}

            {archiveTab === 'ARCHIVED' && (
              <div className="flex items-center space-x-1.5 text-xs text-amber-300/90 font-medium px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-800/40">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Tamper-evident audit vault with retention policy enforcement</span>
              </div>
            )}
          </div>
        </div>

        {/* Toolbar: Search, Filters, View Modes */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
          {/* Left: Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search stakeholder, department, code, objective..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none placeholder:text-slate-500"
            />
          </div>

          {/* Right: Select filters & View Mode Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Project filter */}
            <select
              value={projectFilter}
              onChange={e => setProjectFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">All ISO Projects</option>
              {ISO_PROJECTS_CATALOG.map(p => (
                <option key={p.id} value={p.id}>
                  {p.standard} ({p.code})
                </option>
              ))}
            </select>

            {/* Department filter */}
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">All Departments</option>
              {allDepartments.map(dept => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Transcript Ready">Transcript Ready</option>
              <option value="Completed & Mapped">Completed & Mapped</option>
              <option value="ARCHIVED_ONLY">Archived Working Papers Only</option>
            </select>

            {/* Stakeholder Role filter */}
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">All Stakeholder Roles</option>
              {Object.entries(STAKEHOLDER_ROLE_LABELS).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label}
                </option>
              ))}
            </select>

            {roleFilter !== 'ALL' && (
              <button
                onClick={() => {
                  setSelectedRoleForPrep(roleFilter as StakeholderRole);
                  setPrepContextStakeholder({});
                }}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-950 text-indigo-300 border border-indigo-700/60 text-xs font-bold hover:bg-indigo-900 transition flex items-center space-x-1 cursor-pointer"
                title="Open Role Preparation Summary for selected role"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Prep Guide</span>
              </button>
            )}

            {/* View Mode Buttons */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-slate-800 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Cards Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-slate-800 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Tabular Schedule View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                  viewMode === 'matrix'
                    ? 'bg-slate-800 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="ISO Project Mapping Matrix"
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                  viewMode === 'agenda'
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Dynamic Agenda Preview & Workbench"
              >
                <Clock className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('live')}
                className={`px-2 py-1 rounded-lg text-xs transition cursor-pointer flex items-center space-x-1 ${
                  viewMode === 'live'
                    ? 'bg-rose-950 text-rose-300 border border-rose-600/50 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-rose-300'
                }`}
                title="Live Real-Time AI Transcript & Identified Entities View"
              >
                <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <span className="text-[11px] font-bold">Live</span>
              </button>
            </div>
          </div>
        </div>

        {/* VIEW 1: CARDS GRID VIEW */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMeetings.length === 0 ? (
              <div className="col-span-full p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                {archiveTab === 'ARCHIVED' ? (
                  <>
                    <Archive className="w-10 h-10 text-amber-500/60 mx-auto" />
                    <h3 className="text-sm font-bold text-white">Audit Archive Vault is Clean</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      There are currently no archived interview working papers matching your filters. Completed & mapped sessions can be archived at any time to keep your operational pipeline decluttered while retaining strict ISO 19011 evidence compliance.
                    </p>
                    {completedUnarchivedCount > 0 && (
                      <button
                        onClick={handleArchiveAllCompleted}
                        className="mt-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-sm inline-flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Archive className="w-4 h-4" />
                        <span>Archive {completedUnarchivedCount} Completed Sessions</span>
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
                    <h3 className="text-sm font-bold text-white">No interview sessions found</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      No scheduled discovery interviews match your active filter criteria. Try adjusting your search or schedule a new interview session.
                    </p>
                    <button
                      onClick={() => setIsBookingModalOpen(true)}
                      className="mt-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-sm inline-flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Schedule Interview</span>
                    </button>
                  </>
                )}
              </div>
            ) : (
              filteredMeetings.map(m => {
                const roleDef = STAKEHOLDER_ROLE_LABELS[m.stakeholderRole];
                const objDef = OBJECTIVE_DEFINITIONS[m.interviewObjective];

                return (
                  <div
                    key={m.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4 shadow-sm group"
                  >
                    {/* Header line: code, status, date */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-sky-400 border border-slate-800">
                            {m.meetingCode}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              m.status === 'Completed & Mapped'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : m.status === 'In Progress'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                                : m.status === 'Transcript Ready'
                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {m.status}
                          </span>
                          {m.isArchived && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1">
                              <Archive className="w-2.5 h-2.5" />
                              <span>ARCHIVED</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-1 text-xs text-slate-400 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{m.scheduledDate}</span>
                          <span className="text-slate-600">|</span>
                          <span>{m.scheduledTime}</span>
                        </div>
                      </div>

                      {/* Title & Objective */}
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition">
                          {m.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {objDef?.title || m.interviewObjective}
                        </p>
                      </div>
                    </div>

                    {/* Department & Stakeholder Block */}
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center space-x-1.5 font-medium">
                          <Building className="w-3.5 h-3.5 text-sky-400" />
                          <span>{m.department}</span>
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRoleForPrep(m.stakeholderRole);
                            setPrepContextStakeholder({ name: m.stakeholder.name, dept: m.department });
                          }}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border transition hover:brightness-125 cursor-pointer flex items-center space-x-1 ${roleDef?.badge || 'bg-slate-800 text-slate-300'}`}
                          title="Click to view Role Preparation Summary and required documentation for this role"
                        >
                          <span>{roleDef?.label || m.stakeholderRole}</span>
                          <FileText className="w-2.5 h-2.5 opacity-70" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                        <span className="font-bold text-white">{m.stakeholder.name}</span>
                        <span className="text-slate-400 font-mono text-[11px]">{m.stakeholder.email}</span>
                      </div>
                    </div>

                    {/* ISO Project & Clauses Mapping */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Mapped Project:</span>
                        <span className="text-indigo-300 font-bold truncate max-w-[220px]">{m.projectName}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Frameworks:</span>
                        <div className="flex flex-wrap gap-1 items-center">
                          {m.frameworks.map(fw => (
                            <button
                              key={fw}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFrameworkForPreview(fw);
                              }}
                              className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 transition cursor-pointer flex items-center space-x-1"
                              title={`Preview ${fw} Interview Scope & Focus Areas`}
                            >
                              <span>{fw.split(' ')[0]}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">ISO Standard Clauses:</span>
                        <div className="flex flex-wrap gap-1">
                          {m.isoProjectMapping.mappedClauses.map(c => (
                            <span key={c} className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-950 text-sky-300 border border-slate-800">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Annex A Controls:</span>
                        <div className="flex flex-wrap gap-1">
                          {m.isoProjectMapping.mappedAnnexAControls.slice(0, 3).map(c => (
                            <span key={c} className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-950 text-emerald-300 border border-slate-800">
                              {c}
                            </span>
                          ))}
                          {m.isoProjectMapping.mappedAnnexAControls.length > 3 && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              +{m.isoProjectMapping.mappedAnnexAControls.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Consents & Deliverable strip */}
                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800">
                      <span className="text-emerald-400 font-medium flex items-center space-x-1">
                        <Lock className="w-3 h-3 text-emerald-400" />
                        <span>Clause 7.5 Consents Attested</span>
                      </span>

                      <span className="text-slate-400 truncate max-w-[180px]" title={m.isoProjectMapping.deliverableOutput}>
                        {m.isoProjectMapping.deliverableOutput}
                      </span>
                    </div>

                    {/* Archived Session Audit Strip */}
                    {m.isArchived && (
                      <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-700/50 text-[11px] text-amber-200/90 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold flex items-center gap-1 text-amber-300">
                            <Archive className="w-3 h-3" />
                            <span>ISO 19011 Archived Working Paper</span>
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">By {m.archivedBy || 'Auditor'}</span>
                        </div>
                        <div className="text-[10px] text-slate-300">
                          Retention until <strong className="text-emerald-400 font-mono">{m.retentionExpiryDate || 'Default Policy'}</strong> • <em>{m.archiveReason || 'Audit cycle closed'}</em>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="pt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <button
                          onClick={() => {
                            setSelectedMeetingForLive(m);
                            setViewMode('live');
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-700/60 text-rose-300 text-xs font-bold transition flex items-center space-x-1 cursor-pointer shadow-xs"
                          title="Open Real-Time Live Transcript & Identified Entities View"
                        >
                          <Radio className="w-3.5 h-3.5 animate-pulse text-rose-400" />
                          <span>Live View</span>
                        </button>

                        <button
                          onClick={() => setSelectedMeetingForDetail(m)}
                          className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center space-x-1 cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Conduct / Notes</span>
                        </button>

                        <button
                          onClick={() => setSelectedMeetingForDossier(m)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center space-x-1 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Dossier</span>
                        </button>

                        <button
                          onClick={() => handleExportMeetingReport(m)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-semibold transition flex items-center space-x-1 cursor-pointer"
                          title="Export Meeting Report (PDF) with summary and transcript"
                        >
                          <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Report (PDF)</span>
                        </button>

                        {/* Archive / Restore Button */}
                        {m.isArchived ? (
                          <button
                            onClick={() => handleRestoreSession(m.id, m.meetingCode)}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-700/60 text-amber-300 text-xs font-bold transition flex items-center space-x-1 cursor-pointer shadow-xs"
                            title="Restore this session to active schedule"
                          >
                            <ArchiveRestore className="w-3.5 h-3.5 text-amber-400" />
                            <span>Restore</span>
                          </button>
                        ) : m.status === 'Completed & Mapped' ? (
                          <button
                            onClick={() => handleOpenArchiveModal(m)}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-950/70 hover:bg-amber-900 border border-amber-700/60 text-amber-300 text-xs font-bold transition flex items-center space-x-1 cursor-pointer shadow-xs"
                            title="Move completed session to Audit Archive to declutter dashboard"
                          >
                            <Archive className="w-3.5 h-3.5 text-amber-400" />
                            <span>Archive</span>
                          </button>
                        ) : null}
                      </div>

                      <button
                        onClick={() => handleDeleteMeeting(m.id, m.meetingCode)}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                        title="Cancel / Delete Meeting"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* VIEW 2: DENSE TABULAR SCHEDULE VIEW */}
        {viewMode === 'table' && (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800 tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Code & Status</th>
                    <th className="px-4 py-3">Date & Time</th>
                    <th className="px-4 py-3">Stakeholder & Role</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">ISO Project & Phase</th>
                    <th className="px-4 py-3">Mapped Controls</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredMeetings.map(m => {
                    const roleDef = STAKEHOLDER_ROLE_LABELS[m.stakeholderRole];
                    return (
                      <tr key={m.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono font-bold text-sky-400 text-xs">{m.meetingCode}</span>
                            {m.isArchived && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center gap-0.5">
                                <Archive className="w-2.5 h-2.5" />
                                <span>ARCHIVED</span>
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase mt-0.5 inline-block ${
                              m.status === 'Completed & Mapped'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : m.status === 'In Progress'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-slate-300">
                          <div className="font-bold text-white">{m.scheduledDate}</div>
                          <div className="text-slate-400 text-[11px] font-mono">{m.scheduledTime} ({m.durationMinutes}m)</div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-bold text-white">{m.stakeholder.name}</div>
                          <button
                            onClick={() => {
                              setSelectedRoleForPrep(m.stakeholderRole);
                              setPrepContextStakeholder({ name: m.stakeholder.name, dept: m.department });
                            }}
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline flex items-center space-x-1 cursor-pointer transition text-left"
                            title="Click to view Role Preparation Summary and required documentation"
                          >
                            <span>{roleDef?.label || m.stakeholderRole}</span>
                            <FileText className="w-3 h-3 text-indigo-400 opacity-80 shrink-0" />
                          </button>
                        </td>

                        <td className="px-4 py-3 text-slate-300 font-medium">
                          {m.department}
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-bold text-white truncate max-w-[200px]">{m.projectName}</div>
                          <div className="flex items-center space-x-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400">{m.isoProjectMapping.projectPhase}</span>
                            <div className="flex flex-wrap gap-1">
                              {m.frameworks.map(fw => (
                                <button
                                  key={fw}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedFrameworkForPreview(fw);
                                  }}
                                  className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 hover:bg-indigo-900 cursor-pointer"
                                  title={`Preview ${fw}`}
                                >
                                  {fw.split(' ')[0]}
                                </button>
                              ))}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {m.isoProjectMapping.mappedAnnexAControls.slice(0, 2).map(c => (
                              <span key={c} className="font-mono text-[9px] font-bold px-1 py-0.5 rounded bg-slate-950 text-emerald-300 border border-slate-800">
                                {c}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedMeetingForLive(m);
                              setViewMode('live');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-700/60 text-rose-300 font-bold text-xs transition cursor-pointer inline-flex items-center space-x-1"
                            title="Open Real-Time Live Transcript & Identified Entities View"
                          >
                            <Radio className="w-3 h-3 text-rose-400 animate-pulse" />
                            <span>Live</span>
                          </button>
                          <button
                            onClick={() => setSelectedMeetingForDetail(m)}
                            className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            onClick={() => setSelectedMeetingForDossier(m)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition cursor-pointer"
                          >
                            Dossier
                          </button>
                          <button
                            onClick={() => handleExportMeetingReport(m)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 font-bold text-xs transition cursor-pointer inline-flex items-center space-x-1"
                            title="Export Meeting Report to PDF"
                          >
                            <FileDown className="w-3 h-3 text-emerald-400" />
                            <span>PDF</span>
                          </button>
                          {m.isArchived ? (
                            <button
                              onClick={() => handleRestoreSession(m.id, m.meetingCode)}
                              className="px-2.5 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-700/60 text-amber-300 font-bold text-xs transition cursor-pointer inline-flex items-center space-x-1"
                              title="Restore to active schedule"
                            >
                              <ArchiveRestore className="w-3 h-3 text-amber-400" />
                              <span>Restore</span>
                            </button>
                          ) : m.status === 'Completed & Mapped' ? (
                            <button
                              onClick={() => handleOpenArchiveModal(m)}
                              className="px-2.5 py-1 rounded-lg bg-amber-950/70 hover:bg-amber-900 border border-amber-700/60 text-amber-300 font-bold text-xs transition cursor-pointer inline-flex items-center space-x-1"
                              title="Archive completed interview to declutter dashboard"
                            >
                              <Archive className="w-3 h-3 text-amber-400" />
                              <span>Archive</span>
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 3: ISO PROJECT MAPPING MATRIX */}
        {viewMode === 'matrix' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">ISO Implementation Project Phase Crosswalk</span>
                <p className="mt-0.5 text-slate-300 leading-relaxed">
                  This matrix visualizes how scheduled stakeholder interviews align across the 6 formal ISO implementation phases. Every interview session yields certified working paper evidence, mapped Annex A controls, and verifiable Clause 7.5 confidentiality records.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {projectMatrixGroups.map(({ project, sessions }) => (
                <div key={project.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                          {project.code}
                        </span>
                        <span className="text-xs font-bold text-sky-400">{project.standard}</span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1">{project.name}</h3>
                      <p className="text-xs text-slate-400">{project.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-bold text-indigo-300">{project.currentPhase}</div>
                      <div className="text-[10px] text-slate-400">Target Audit: {project.targetAuditDate}</div>
                      <div className="text-[10px] text-emerald-400">{sessions.length} Interviews Linked</div>
                    </div>
                  </div>

                  {/* Sessions grid in this project */}
                  {sessions.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No interviews currently linked to this implementation project.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sessions.map(s => (
                        <div
                          key={s.id}
                          className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs hover:border-slate-700 transition cursor-pointer"
                          onClick={() => setSelectedMeetingForDetail(s)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-sky-400 text-[11px]">{s.meetingCode}</span>
                            <span className="text-[10px] text-slate-400">{s.scheduledDate}</span>
                          </div>

                          <div className="font-bold text-white text-xs truncate">{s.title}</div>
                          <div className="text-slate-400 text-[11px]">
                            {s.stakeholder.name} ({s.department})
                          </div>

                          <div className="pt-1.5 border-t border-slate-900 flex items-center justify-between text-[10px]">
                            <span className="font-mono text-emerald-400 font-semibold">
                              {s.isoProjectMapping.mappedClauses[0]}
                            </span>
                            <span className="text-slate-500 font-medium truncate max-w-[120px]">
                              {s.isoProjectMapping.deliverableOutput}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: DYNAMIC AGENDA PREVIEW & WORKBENCH */}
        {viewMode === 'agenda' && (
          <div className="space-y-6">
            {/* Workbench Control Panel */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-indigo-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">Dynamic ISO Audit Agenda Workbench</h2>
                      <p className="text-xs text-slate-400">
                        Synthesize, inspect, and scale structured meeting agendas aligned with ISO 19011:2018 Clause 6.4
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Schedule Interview with this Agenda</span>
                </button>
              </div>

              {/* Selector Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Framework Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                    <span>Regulatory / ISO Framework</span>
                  </label>
                  <select
                    value={workbenchFramework}
                    onChange={e => setWorkbenchFramework(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {AVAILABLE_FRAMEWORKS.map(fw => (
                      <option key={fw.id} value={fw.id}>
                        {fw.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center space-x-1.5">
                    <Building className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Audited Department / Scope</span>
                  </label>
                  <select
                    value={workbenchDepartment}
                    onChange={e => setWorkbenchDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {[
                      'Software Engineering & DevOps',
                      'Cloud Infrastructure & IT Ops',
                      'Human Resources & People Ops',
                      'Legal, Risk & Compliance',
                      'Product & AI Engineering',
                      'Operations & Business Continuity',
                      'Procurement & Vendor Management',
                      'Executive Leadership & Governance'
                    ].map(dept => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Session Duration Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Session Duration</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[30, 45, 60, 90].map(dur => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setWorkbenchDuration(dur)}
                        className={`py-2 rounded-xl font-bold text-xs transition cursor-pointer border ${
                          workbenchDuration === dur
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                            : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {dur}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Agenda Preview Panel */}
            <DynamicAgendaPreview
              framework={workbenchFramework}
              department={workbenchDepartment}
              durationMinutes={workbenchDuration}
              onDurationChange={setWorkbenchDuration}
            />
          </div>
        )}

        {/* VIEW 5: LIVE AI SESSION & REAL-TIME TRANSCRIPT WITH IDENTIFIED ENTITIES */}
        {viewMode === 'live' && (
          <div className="space-y-4">
            {/* Session Switcher Strip */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-600/40 text-rose-400 shrink-0">
                  <Radio className="w-5 h-5 animate-pulse text-rose-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                    <span>Live AI Interview & Transcription Studio</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800/60 font-bold">
                      REAL-TIME NER ACTIVE
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Continuous speech transcription with automated Entity Discovery (Applications, Assets, Risks, Controls) and interactive segment quick-jumping.
                  </p>
                </div>
              </div>

              {/* Meeting Selector Dropdown & Exit Button */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Session:</span>
                <select
                  value={activeLiveSession?.id || ''}
                  onChange={e => {
                    const found = meetings.find(m => m.id === e.target.value);
                    if (found) setSelectedMeetingForLive(found);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 max-w-xs truncate cursor-pointer"
                >
                  {meetings.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.meetingCode} - {m.stakeholder.name} ({m.department})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleExportMeetingReport(activeLiveSession || undefined)}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
                  title="Export Current Live Session Summary & Transcript to PDF"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Export Report (PDF)</span>
                </button>

                <button
                  onClick={() => setViewMode('grid')}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                >
                  Exit Live View
                </button>
              </div>
            </div>

            {activeLiveSession ? (
              <LiveMeetingTranscriptView
                session={activeLiveSession}
                onUpdateSession={updated => {
                  const next = { ...activeLiveSession, ...updated };
                  handleUpdateMeeting(next);
                }}
                onCloseLiveView={() => setViewMode('grid')}
              />
            ) : (
              <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
                No active interview session selected.
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: Meeting Booking Form */}
      {isBookingModalOpen && (
        <MeetingBookingForm
          onSave={handleSaveMeeting}
          onCancel={() => setIsBookingModalOpen(false)}
        />
      )}

      {/* MODAL 2: Meeting Detail & Live Runner */}
      {selectedMeetingForDetail && (
        <MeetingDetailModal
          meeting={selectedMeetingForDetail}
          onClose={() => setSelectedMeetingForDetail(null)}
          onUpdateMeeting={handleUpdateMeeting}
          onOpenDossier={() => {
            setSelectedMeetingForDossier(selectedMeetingForDetail);
            setSelectedMeetingForDetail(null);
          }}
          onArchiveMeeting={handleOpenArchiveModal}
          onUnarchiveMeeting={(m) => handleRestoreSession(m.id, m.meetingCode)}
        />
      )}

      {/* MODAL 3: Formal Audit Dossier Export */}
      {selectedMeetingForDossier && (
        <MeetingDossierExportModal
          meeting={selectedMeetingForDossier}
          onClose={() => setSelectedMeetingForDossier(null)}
        />
      )}

      {/* MODAL 4: Framework Scope & Focus Areas Preview */}
      {selectedFrameworkForPreview && (
        <FrameworkPreviewModal
          frameworkId={selectedFrameworkForPreview}
          onClose={() => setSelectedFrameworkForPreview(null)}
        />
      )}

      {/* MODAL 5: Role Preparation Summary Modal */}
      {selectedRoleForPrep && (
        <RolePreparationSummaryModal
          isOpen={selectedRoleForPrep !== null}
          onClose={() => {
            setSelectedRoleForPrep(null);
            setPrepContextStakeholder({});
          }}
          selectedRole={selectedRoleForPrep}
          onSelectRole={(role) => setSelectedRoleForPrep(role)}
          stakeholderName={prepContextStakeholder.name}
          departmentName={prepContextStakeholder.dept}
        />
      )}

      {/* MODAL 6: Archive Confirmation Modal for Audit Compliance & Dashboard Decluttering */}
      <ArchiveConfirmationModal
        isOpen={isArchiveModalOpen}
        onClose={() => {
          setIsArchiveModalOpen(false);
          setMeetingsToArchive([]);
        }}
        meetingsToArchive={meetingsToArchive}
        onConfirmArchive={handleConfirmArchive}
        currentUser={currentUser}
      />
    </PageContainer>
  );
};
