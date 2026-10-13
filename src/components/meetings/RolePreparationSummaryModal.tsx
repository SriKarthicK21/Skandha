import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  CheckSquare,
  AlertTriangle,
  HelpCircle,
  Clock,
  ShieldCheck,
  Download,
  Copy,
  Check,
  X,
  Layers,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Info,
  Send,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import { StakeholderRole } from '../../types/meetingScheduler';
import { STAKEHOLDER_ROLE_LABELS } from '../../data/meetingSchedulerData';
import {
  ROLE_PREPARATION_PROFILES,
  RolePreparationProfile,
  DocumentationItem
} from '../../data/rolePreparationData';
import { RequestEvidenceDialog } from './RequestEvidenceDialog';
import { useToast } from '../common/ToastContainer';

interface RolePreparationSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRole: StakeholderRole;
  onSelectRole?: (role: StakeholderRole) => void;
  stakeholderName?: string;
  departmentName?: string;
}

interface EvidenceRequestRecord {
  requestedAt: string;
  referenceCode: string;
  dueDate: string;
  assignedTo: string;
  department: string;
  slaHours: number;
  status: 'PENDING_UPLOAD' | 'VERIFIED';
  notes?: string;
}

export const RolePreparationSummaryModal: React.FC<RolePreparationSummaryModalProps> = ({
  isOpen,
  onClose,
  selectedRole,
  onSelectRole,
  stakeholderName,
  departmentName
}) => {
  const { showToast } = useToast();
  const [activeRole, setActiveRole] = useState<StakeholderRole>(selectedRole);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Evidence request dialog & state
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState<boolean>(false);
  const [requestTargetDocIds, setRequestTargetDocIds] = useState<string[]>([]);

  // Persistent record of dispatched evidence requests
  const [evidenceRequests, setEvidenceRequests] = useState<Record<string, EvidenceRequestRecord>>(() => {
    try {
      const saved = localStorage.getItem('skanda_role_evidence_requests');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Keep active role in sync if selectedRole prop changes
  useEffect(() => {
    setActiveRole(selectedRole);
  }, [selectedRole]);

  const profile: RolePreparationProfile = useMemo(() => {
    return (
      ROLE_PREPARATION_PROFILES[activeRole] ||
      ROLE_PREPARATION_PROFILES.DEPARTMENT_HEAD
    );
  }, [activeRole]);

  // Unrequested missing mandatory documents identified by Skanda
  const unrequestedMissingDocs = useMemo(() => {
    return profile.requiredDocumentation.filter(doc => {
      const req = evidenceRequests[doc.id];
      if (req?.status === 'VERIFIED' || req?.status === 'PENDING_UPLOAD') {
        return false;
      }
      return doc.defaultMissingInSkanda === true;
    });
  }, [profile, evidenceRequests]);

  // Requested documents currently awaiting upload for this profile
  const pendingUploadDocs = useMemo(() => {
    return profile.requiredDocumentation.filter(doc => {
      const req = evidenceRequests[doc.id];
      return req?.status === 'PENDING_UPLOAD';
    });
  }, [profile, evidenceRequests]);

  // Verified documents for this profile
  const verifiedDocs = useMemo(() => {
    return profile.requiredDocumentation.filter(doc => {
      const req = evidenceRequests[doc.id];
      if (req?.status === 'VERIFIED') return true;
      return doc.defaultMissingInSkanda !== true && !req;
    });
  }, [profile, evidenceRequests]);

  const handleRoleChange = (role: StakeholderRole) => {
    setActiveRole(role);
    if (onSelectRole) {
      onSelectRole(role);
    }
  };

  const toggleChecklist = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    profile.requiredDocumentation.forEach(doc => set.add(doc.category));
    return ['ALL', ...Array.from(set)];
  }, [profile]);

  const filteredDocs = useMemo(() => {
    if (selectedCategory === 'ALL') return profile.requiredDocumentation;
    return profile.requiredDocumentation.filter(doc => doc.category === selectedCategory);
  }, [profile, selectedCategory]);

  const checklistProgress = useMemo(() => {
    const total = profile.preInterviewChecklist.length;
    if (total === 0) return 100;
    const completed = profile.preInterviewChecklist.filter(item => checkedItems[item.id]).length;
    return Math.round((completed / total) * 100);
  }, [profile, checkedItems]);

  const handleOpenRequestDialog = (docIds?: string[]) => {
    if (docIds && docIds.length > 0) {
      setRequestTargetDocIds(docIds);
    } else {
      // Default to unrequested missing items for this profile
      const missing = unrequestedMissingDocs.map(d => d.id);
      setRequestTargetDocIds(missing.length > 0 ? missing : profile.requiredDocumentation.map(d => d.id));
    }
    setIsRequestDialogOpen(true);
  };

  const handleRequestDispatched = (
    requestedDocIds: string[],
    details: {
      assignedTo: string;
      department: string;
      dueDate: string;
      slaHours: number;
      referenceCode: string;
      notes: string;
    }
  ) => {
    setEvidenceRequests(prev => {
      const updated = { ...prev };
      const now = new Date().toISOString();
      requestedDocIds.forEach(id => {
        updated[id] = {
          requestedAt: now,
          referenceCode: details.referenceCode,
          dueDate: details.dueDate,
          assignedTo: details.assignedTo,
          department: details.department,
          slaHours: details.slaHours,
          status: 'PENDING_UPLOAD',
          notes: details.notes
        };
      });
      try {
        localStorage.setItem('skanda_role_evidence_requests', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleMarkAsVerified = (docId: string) => {
    setEvidenceRequests(prev => {
      const updated = { ...prev };
      if (updated[docId]) {
        updated[docId] = {
          ...updated[docId],
          status: 'VERIFIED'
        };
      } else {
        updated[docId] = {
          requestedAt: new Date().toISOString(),
          referenceCode: `VERIFIED-${Math.floor(1000 + Math.random() * 9000)}`,
          dueDate: new Date().toISOString().split('T')[0],
          assignedTo: stakeholderName || profile.title,
          department: departmentName || 'Enterprise Scope',
          slaHours: 0,
          status: 'VERIFIED'
        };
      }
      try {
        localStorage.setItem('skanda_role_evidence_requests', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    showToast({
      type: 'success',
      title: 'Artifact Marked as Verified',
      message: 'Evidence status updated to Verified in repository.'
    });
  };

  const handleCopyChecklist = () => {
    const content = `
========================================================================
ISO AUDIT PREPARATION DOSSIER: ${profile.title.toUpperCase()}
========================================================================
Audited Stakeholder Role : ${profile.title}
Department Scope         : ${departmentName || 'Enterprise Scope'}
Assigned Stakeholder     : ${stakeholderName || 'Designated Custodian'}
Recommended Prep Time    : ${profile.recommendedPreparationTimeHours} Hours
Audited Standards        : ${profile.isoClausesCovered.join(', ')}

------------------------------------------------------------------------
EXECUTIVE OVERVIEW & INTERROGATION FOCUS
------------------------------------------------------------------------
${profile.executiveSummary}

Key Auditor Questions to Expect:
${profile.auditorInterrogationFocus.map((q, i) => `  ${i + 1}. ${q}`).join('\n')}

Common Audit Non-Conformities to Avoid:
${profile.commonNonConformities.map((nc, i) => `  ${i + 1}. [!] ${nc}`).join('\n')}

------------------------------------------------------------------------
MANDATORY DOCUMENTATION & EVIDENCE ARTIFACTS
------------------------------------------------------------------------
${profile.requiredDocumentation
  .map(
    (doc, i) => `
[${i + 1}] ${doc.name}
    Category        : ${doc.category}
    Priority        : ${doc.priority}
    File Format     : ${doc.suggestedFileFormat}
    Mandatory For   : ${doc.mandatoryFor.join(', ')}
    Status          : ${
      evidenceRequests[doc.id]?.status === 'VERIFIED'
        ? 'VERIFIED IN REPOSITORY'
        : evidenceRequests[doc.id]?.status === 'PENDING_UPLOAD'
        ? `REQUESTED (Pending Upload - Ref: ${evidenceRequests[doc.id].referenceCode})`
        : doc.defaultMissingInSkanda
        ? `MISSING MANDATORY EVIDENCE (Skanda Finding: ${doc.skandaDetectionReason})`
        : 'READY IN REPOSITORY'
    }
    Description     : ${doc.description}
`
  )
  .join('')}

------------------------------------------------------------------------
PRE-INTERVIEW COMPLIANCE CHECKLIST
------------------------------------------------------------------------
${profile.preInterviewChecklist
  .map(item => `[${checkedItems[item.id] ? 'X' : ' '}] ${item.text} (${item.clause})`)
  .join('\n')}

========================================================================
Generated by Skanda GRC Continuous Compliance Engine
========================================================================
`;

    navigator.clipboard.writeText(content);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div
      id="role-prep-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="role-prep-modal-container"
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
      >
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-700/80 flex items-center justify-center text-indigo-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white truncate">
                  Role Preparation Summary
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 font-bold">
                  ISO 19011:2018
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Role-specific audit evidence requirements, interrogation questions, and Skanda deficit telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleCopyChecklist}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold transition border border-slate-700 flex items-center space-x-1.5 cursor-pointer"
              title="Copy complete preparation dossier to clipboard"
            >
              {copiedNotification ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Copy Dossier</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ROLE SELECTION BAR */}
        <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800/80 overflow-x-auto flex items-center space-x-2 shrink-0 scrollbar-thin">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Select Role:</span>
          </span>
          {(Object.keys(ROLE_PREPARATION_PROFILES) as StakeholderRole[]).map(roleKey => {
            const roleData = ROLE_PREPARATION_PROFILES[roleKey];
            const isSelected = activeRole === roleKey;
            return (
              <button
                key={roleKey}
                onClick={() => handleRoleChange(roleKey)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                {roleData.title.split('/')[0].trim()}
              </button>
            );
          })}
        </div>

        {/* SCROLLABLE BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-200">
          {/* PROFILE SUMMARY HERO */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2.5">
                <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${profile.roleBadgeColor}`}>
                  {profile.title}
                </span>
                {departmentName && (
                  <span className="text-xs text-slate-400 flex items-center space-x-1">
                    <span>•</span>
                    <span>Scope: <strong className="text-slate-300">{departmentName}</strong></span>
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3 text-xs text-slate-400">
                <div className="flex items-center space-x-1 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Est. Prep Time: <strong className="text-amber-300">{profile.recommendedPreparationTimeHours}h</strong></span>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {profile.executiveSummary}
            </p>

            {/* Clauses Pill Row */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Primary Standard Clauses & Controls Audited:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {profile.isoClausesCovered.map((clause, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-sky-300"
                  >
                    ✓ {clause}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SKANDA ALERT BADGE & DEFICIT HIGHLIGHT (REQUIREMENT 2) */}
          {/* ========================================================================= */}
          {unrequestedMissingDocs.length > 0 ? (
            <div
              id="skanda-missing-evidence-alert-badge"
              className="relative rounded-2xl border border-rose-500/80 bg-gradient-to-br from-rose-950/80 via-slate-950 to-amber-950/40 p-4 sm:p-5 shadow-xl shadow-rose-950/40 overflow-hidden"
            >
              {/* Subtle ambient glow */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Left: Warning Icon + Headings */}
                <div className="flex items-start space-x-3.5 min-w-0">
                  <div className="relative shrink-0 mt-0.5">
                    <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-600/80 flex items-center justify-center text-rose-400 shadow-inner">
                      <AlertTriangle className="w-5 h-5 animate-pulse" />
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                    </span>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700/80 uppercase tracking-wider">
                        Skanda Compliance Scanner
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-700/80 uppercase tracking-wider">
                        {unrequestedMissingDocs.length} Mandatory Artifact{unrequestedMissingDocs.length > 1 ? 's' : ''} Missing
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      Missing Mandatory Evidence Documentation Identified by Skanda
                    </h3>

                    <p className="text-xs text-rose-200/90 leading-relaxed max-w-2xl">
                      Continuous compliance telemetry detected that{' '}
                      <strong className="text-white underline decoration-rose-500">
                        {unrequestedMissingDocs.length} mandatory evidence artifact{unrequestedMissingDocs.length > 1 ? 's' : ''}
                      </strong>{' '}
                      required for this <strong className="text-white">{profile.title}</strong> audit interview are not verified in the repository. External certification auditors under ISO 19011:2018 may raise major non-conformities if these remain unaddressed.
                    </p>
                  </div>
                </div>

                {/* Right: Immediate Action Path 'Request Evidence' */}
                <div className="shrink-0 flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-center gap-2">
                  <button
                    id="request-evidence-cta-button"
                    type="button"
                    onClick={() => handleOpenRequestDialog(unrequestedMissingDocs.map(d => d.id))}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50 hover:shadow-rose-900/60 transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>Request Evidence ({unrequestedMissingDocs.length} Required)</span>
                  </button>

                  <span className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Pre-Audit SLA: 48h turn-around</span>
                  </span>
                </div>
              </div>

              {/* Quick-Inspect Grid for the Missing Items */}
              <div className="mt-3.5 pt-3 border-t border-rose-900/60 space-y-2">
                <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider block">
                  Identified Mandatory Evidence Gaps:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {unrequestedMissingDocs.map(item => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-slate-950/80 border border-rose-900/70 flex items-start justify-between gap-2 hover:border-rose-700/80 transition"
                    >
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <span className="text-xs font-bold text-white truncate">
                            {item.name}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                            {item.mandatoryFor[0]}
                          </span>
                        </div>
                        {item.skandaDetectionReason && (
                          <p className="text-[11px] text-rose-300/85 line-clamp-2 leading-relaxed font-mono">
                            ⚠ {item.skandaDetectionReason}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenRequestDialog([item.id])}
                        className="px-2.5 py-1 rounded-lg bg-rose-600/30 hover:bg-rose-600/60 border border-rose-600/70 text-rose-200 text-[10px] font-bold shrink-0 transition flex items-center space-x-1 cursor-pointer"
                        title="Request this artifact"
                      >
                        <Send className="w-3 h-3" />
                        <span>Request</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : pendingUploadDocs.length > 0 ? (
            <div
              id="skanda-evidence-dispatched-banner"
              className="relative rounded-2xl border border-amber-500/60 bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-900 p-4 shadow-lg shadow-amber-950/20"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-600/70 flex items-center justify-center text-amber-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700 uppercase">
                        Evidence Requests Dispatched
                      </span>
                      <span className="text-xs text-slate-400">
                        {pendingUploadDocs.length} artifact{pendingUploadDocs.length > 1 ? 's' : ''} awaiting custodian upload
                      </span>
                    </div>
                    <p className="text-xs text-amber-200/90 truncate">
                      Formal collection tasks registered for <strong>{stakeholderName || profile.title}</strong>. Tracked in central GRC task worklist.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenRequestDialog(profile.requiredDocumentation.map(d => d.id))}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                  >
                    Request Additional
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              id="skanda-evidence-verified-banner"
              className="rounded-2xl border border-emerald-500/50 bg-emerald-950/20 p-3.5 flex items-center justify-between gap-3 text-emerald-300"
            >
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <strong className="text-emerald-200 block">All Mandatory Evidence Artifacts Verified</strong>
                  <span className="text-emerald-400/80">
                    All documentation required for this role is verified in the compliance repository and ready for audit.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenRequestDialog(profile.requiredDocumentation.map(d => d.id))}
                className="px-2.5 py-1 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/50 border border-emerald-700 text-emerald-200 text-[11px] font-bold transition cursor-pointer shrink-0"
              >
                Request Refresh
              </button>
            </div>
          )}

          {/* SECTION: SPECIFIC REQUIRED DOCUMENTATION */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Specific Documentation & Evidence Artifacts Required
                </h3>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition whitespace-nowrap cursor-pointer border ${
                      selectedCategory === cat
                        ? 'bg-sky-600 text-white border-sky-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {cat === 'ALL' ? 'All Documentation' : cat.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {filteredDocs.map(doc => {
                const reqRecord = evidenceRequests[doc.id];
                const isPending = reqRecord?.status === 'PENDING_UPLOAD';
                const isVerified =
                  reqRecord?.status === 'VERIFIED' || (!doc.defaultMissingInSkanda && !reqRecord);
                const isMissing =
                  doc.defaultMissingInSkanda === true &&
                  !isPending &&
                  reqRecord?.status !== 'VERIFIED';

                const priorityColor =
                  doc.priority === 'Critical / Blocker'
                    ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                    : doc.priority === 'High'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700';

                return (
                  <div
                    key={doc.id}
                    className={`p-3.5 rounded-xl border transition space-y-2 text-xs ${
                      isMissing
                        ? 'bg-rose-950/15 border-rose-800/80 hover:border-rose-700'
                        : isPending
                        ? 'bg-amber-950/15 border-amber-700/80 hover:border-amber-600'
                        : 'bg-slate-950/90 border-slate-800/90 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Status Strip */}
                    {isMissing && (
                      <div className="flex items-center justify-between bg-rose-950/60 -mx-3.5 -mt-3.5 p-2 px-3.5 rounded-t-xl border-b border-rose-800/60 mb-2">
                        <span className="text-[10px] font-bold text-rose-300 flex items-center space-x-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          <span>MISSING MANDATORY EVIDENCE (SKANDA DEFICIT)</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => handleOpenRequestDialog([doc.id])}
                          className="px-2.5 py-0.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Request Evidence</span>
                        </button>
                      </div>
                    )}

                    {isPending && reqRecord && (
                      <div className="flex items-center justify-between bg-amber-950/60 -mx-3.5 -mt-3.5 p-2 px-3.5 rounded-t-xl border-b border-amber-800/60 mb-2">
                        <span className="text-[10px] font-bold text-amber-300 flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>
                            EVIDENCE REQUESTED ({reqRecord.referenceCode} • Due: {reqRecord.dueDate})
                          </span>
                        </span>

                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleMarkAsVerified(doc.id)}
                            className="px-2 py-0.5 rounded-md bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-semibold transition cursor-pointer"
                            title="Mark this artifact as verified in the repository"
                          >
                            Mark Verified
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenRequestDialog([doc.id])}
                            className="px-2 py-0.5 rounded-md bg-amber-800 hover:bg-amber-700 text-amber-200 text-[10px] font-semibold transition cursor-pointer"
                            title="Re-send request notification"
                          >
                            Re-request
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Card Title & Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="font-bold text-white text-xs sm:text-sm">
                            {doc.name}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${priorityColor}`}>
                            {doc.priority}
                          </span>
                          {doc.isMandatory && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 uppercase">
                              Mandatory
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Category: <strong className="text-slate-300">{doc.category}</strong>
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0 text-[11px] font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-300">
                          Format: {doc.suggestedFileFormat}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {doc.description}
                    </p>

                    {/* Skanda Detection Finding Notice */}
                    {doc.skandaDetectionReason && (
                      <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-900/60 text-[11px] text-rose-200 flex items-start space-x-1.5 font-mono">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-rose-300">Skanda Telemetry:</strong> {doc.skandaDetectionReason}
                        </span>
                      </div>
                    )}

                    {/* Bottom Clause & Action Bar */}
                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between flex-wrap gap-2 text-[11px]">
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <span className="text-slate-400">Mandatory Clause / Control:</span>
                        {doc.mandatoryFor.map((m, mIdx) => (
                          <span
                            key={mIdx}
                            className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-sky-400 border border-slate-800"
                          >
                            {m}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center space-x-2">
                        {isVerified && (
                          <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Verified in Repository</span>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenRequestDialog([doc.id])}
                          className="text-[10px] font-semibold text-slate-400 hover:text-indigo-300 flex items-center space-x-1 transition cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Request Document</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION: INTERACTIVE PRE-INTERVIEW CHECKLIST */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Pre-Interview Readiness Checklist
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${checklistProgress}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {checklistProgress}% Ready
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {profile.preInterviewChecklist.map(item => {
                const isChecked = Boolean(checkedItems[item.id]);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-start space-x-3 select-none ${
                      isChecked
                        ? 'bg-emerald-950/20 border-emerald-800/60 text-slate-200'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isChecked ? (
                        <div className="w-4 h-4 rounded bg-emerald-600 flex items-center justify-center text-white">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded border border-slate-600 bg-slate-900" />
                      )}
                    </div>

                    <div className="space-y-0.5 min-w-0 flex-1">
                      <p className={`text-xs ${isChecked ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                        {item.text}
                      </p>
                      <span className="text-[10px] font-mono text-sky-400/90 block">
                        Target Control: {item.clause}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TWO COLUMN GRID: INTERROGATION FOCUS & COMMON NON-CONFORMITIES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Column 1: Interrogation Questions */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Auditor Interrogation Focus
                </h4>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {profile.auditorInterrogationFocus.map((q, qIdx) => (
                  <li key={qIdx} className="flex items-start space-x-2">
                    <span className="text-indigo-400 font-bold shrink-0 mt-0.5">•</span>
                    <span className="leading-relaxed">{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Common Non-Conformities */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Common Non-Conformities & Pitfalls
                </h4>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {profile.commonNonConformities.map((nc, ncIdx) => (
                  <li key={ncIdx} className="flex items-start space-x-2 text-amber-200/90">
                    <span className="text-rose-400 font-bold shrink-0 mt-0.5">⚠</span>
                    <span className="leading-relaxed">{nc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              All listed artifacts should be gathered at least <strong>48 hours</strong> prior to interview kickoff.
            </span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopyChecklist}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedNotification ? 'Checklist Copied!' : 'Copy Checklist'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md"
            >
              <span>Done & Continue</span>
            </button>
          </div>
        </div>

        {/* REQUEST EVIDENCE DIALOG (REQUIREMENT 2) */}
        <RequestEvidenceDialog
          isOpen={isRequestDialogOpen}
          onClose={() => setIsRequestDialogOpen(false)}
          role={activeRole}
          roleTitle={profile.title}
          stakeholderName={stakeholderName}
          departmentName={departmentName}
          evidenceItems={profile.requiredDocumentation}
          preSelectedDocIds={requestTargetDocIds}
          onRequestDispatched={handleRequestDispatched}
        />
      </div>
    </div>
  );
};
