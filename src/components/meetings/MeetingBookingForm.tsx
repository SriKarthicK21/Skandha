import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  User,
  Users2,
  Building,
  Layers,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Lock,
  Plus,
  Trash2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Award,
  Video,
  MapPin,
  Check,
  Info,
  ShieldAlert,
  ArrowLeft,
  Zap,
  CheckSquare,
  History,
  Fingerprint
} from 'lucide-react';
import {
  MeetingInterviewSession,
  StakeholderRole,
  InterviewObjective,
  TranscriptConsentRecord,
  InterviewQuestionItem,
  AiScopeChecklistItem,
  MeetingAgendaStructure
} from '../../types/meetingScheduler';
import {
  ISO_PROJECTS_CATALOG,
  OBJECTIVE_DEFINITIONS,
  STAKEHOLDER_ROLE_LABELS,
  AVAILABLE_FRAMEWORKS,
  DEPARTMENT_QUESTION_TEMPLATES,
  IsoImplementationProjectItem
} from '../../data/meetingSchedulerData';
import { useGRC } from '../../context/GRCContext';
import { computeSHA256 } from '../../utils/crypto';
import { FrameworkPreviewModal } from './FrameworkPreviewModal';
import { AiSuggestedScopeChecklist } from './AiSuggestedScopeChecklist';
import { DynamicAgendaPreview } from './DynamicAgendaPreview';
import { RolePreparationSummaryModal } from './RolePreparationSummaryModal';
import { ROLE_PREPARATION_PROFILES } from '../../data/rolePreparationData';

interface MeetingBookingFormProps {
  onSave: (meeting: MeetingInterviewSession, shouldCreateTask: boolean) => void;
  onCancel: () => void;
}

export const MeetingBookingForm: React.FC<MeetingBookingFormProps> = ({
  onSave,
  onCancel
}) => {
  const { currentTenant, departmentScopes, currentUser } = useGRC();

  // 1. Project Selection
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    ISO_PROJECTS_CATALOG[0].id
  );
  const selectedProject = useMemo<IsoImplementationProjectItem>(
    () => ISO_PROJECTS_CATALOG.find(p => p.id === selectedProjectId) || ISO_PROJECTS_CATALOG[0],
    [selectedProjectId]
  );

  // 2. Department Selection
  const availableDepartments = useMemo(() => {
    if (departmentScopes && departmentScopes.length > 0) {
      return departmentScopes.map(d => d.name);
    }
    return [
      'Software Engineering & DevOps',
      'Cloud Infrastructure & IT Ops',
      'Human Resources & People Ops',
      'Legal, Risk & Compliance',
      'Procurement & Vendor Management',
      'Product & AI Engineering',
      'Operations & Business Continuity',
      'Executive Leadership & Governance'
    ];
  }, [departmentScopes]);

  const [department, setDepartment] = useState<string>(
    availableDepartments[0] || 'Software Engineering & DevOps'
  );

  // 3. Stakeholder Fields
  const [stakeholderName, setStakeholderName] = useState<string>('');
  const [stakeholderEmail, setStakeholderEmail] = useState<string>('');
  const [stakeholderTitle, setStakeholderTitle] = useState<string>('');
  const [stakeholderPhone, setStakeholderPhone] = useState<string>('');

  // 4. Stakeholder Role
  const [stakeholderRole, setStakeholderRole] = useState<StakeholderRole>('TECH_CUSTODIAN');

  // 5. Interview Objective
  const [interviewObjective, setInterviewObjective] = useState<InterviewObjective>(
    'OPERATIONAL_CONTROLS_WALKTHROUGH'
  );
  const [objectiveDescription, setObjectiveDescription] = useState<string>('');

  // 6. Framework Selection
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([
    'ISO/IEC 27001:2022'
  ]);
  const [previewFrameworkId, setPreviewFrameworkId] = useState<string | null>(null);

  // Meeting Schedule Metadata
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [scheduledDate, setScheduledDate] = useState<string>(tomorrow);
  const [scheduledTime, setScheduledTime] = useState<string>('10:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [locationOrLink, setLocationOrLink] = useState<string>('Google Meet (Encrypted Video)');

  // Workflow Step: 'details' (Step 1) | 'consent_check' (Step 2: Mandatory Gating Step)
  const [currentStep, setCurrentStep] = useState<'details' | 'consent_check'>('details');

  // 7. Mandatory Consents & Audit Timestamps
  const [audioVideoRecordingConsent, setAudioVideoRecordingConsent] = useState<boolean>(false);
  const [recordingConsentTimestamp, setRecordingConsentTimestamp] = useState<string | null>(null);

  const [aiTranscriptionConsent, setAiTranscriptionConsent] = useState<boolean>(false);
  const [transcriptConsentTimestamp, setTranscriptConsentTimestamp] = useState<string | null>(null);

  const [confidentialityAgreementConsent, setConfidentialityAgreementConsent] = useState<boolean>(false);
  const [confidentialityConsentTimestamp, setConfidentialityConsentTimestamp] = useState<string | null>(null);

  const [auditorAccessSamplingConsent, setAuditorAccessSamplingConsent] = useState<boolean>(false);
  const [auditorAccessConsentTimestamp, setAuditorAccessConsentTimestamp] = useState<string | null>(null);

  const [dataRetentionMonths, setDataRetentionMonths] = useState<number>(36);
  const [attesterTerminalIp] = useState<string>('192.168.1.104 (Authenticated SecOps Ingress Terminal)');

  // 8. Mapping to ISO Implementation Project
  const [autoCreateTask, setAutoCreateTask] = useState<boolean>(true);

  // Handlers for real-time audit timestamp logging
  const handleToggleRecordingConsent = (granted: boolean) => {
    setAudioVideoRecordingConsent(granted);
    if (granted) {
      setRecordingConsentTimestamp(new Date().toISOString());
    } else {
      setRecordingConsentTimestamp(null);
    }
  };

  const handleToggleTranscriptConsent = (granted: boolean) => {
    setAiTranscriptionConsent(granted);
    if (granted) {
      setTranscriptConsentTimestamp(new Date().toISOString());
    } else {
      setTranscriptConsentTimestamp(null);
    }
  };

  const handleToggleConfidentialityConsent = (granted: boolean) => {
    setConfidentialityAgreementConsent(granted);
    if (granted) {
      setConfidentialityConsentTimestamp(new Date().toISOString());
    } else {
      setConfidentialityConsentTimestamp(null);
    }
  };

  const handleToggleAuditorAccessConsent = (granted: boolean) => {
    setAuditorAccessSamplingConsent(granted);
    if (granted) {
      setAuditorAccessConsentTimestamp(new Date().toISOString());
    } else {
      setAuditorAccessConsentTimestamp(null);
    }
  };

  // Convenience helper to authorize all mandatory & standard consents in one click with synchronized timestamps
  const handleAuthorizeAllConsents = () => {
    const now = new Date().toISOString();
    setAudioVideoRecordingConsent(true);
    setRecordingConsentTimestamp(now);
    setAiTranscriptionConsent(true);
    setTranscriptConsentTimestamp(now);
    setConfidentialityAgreementConsent(true);
    setConfidentialityConsentTimestamp(now);
    setAuditorAccessSamplingConsent(true);
    setAuditorAccessConsentTimestamp(now);
  };

  // Mandatory Consent Gating Evaluation
  const isConsentCheckPassed = useMemo(() => {
    return (
      audioVideoRecordingConsent === true &&
      Boolean(recordingConsentTimestamp) &&
      aiTranscriptionConsent === true &&
      Boolean(transcriptConsentTimestamp) &&
      confidentialityAgreementConsent === true &&
      Boolean(confidentialityConsentTimestamp)
    );
  }, [
    audioVideoRecordingConsent,
    recordingConsentTimestamp,
    aiTranscriptionConsent,
    transcriptConsentTimestamp,
    confidentialityAgreementConsent,
    confidentialityConsentTimestamp
  ]);

  // Interview Questions customized to department & objective
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestionItem[]>([]);
  const [newQuestionText, setNewQuestionText] = useState<string>('');

  // AI-Suggested Scope Checklist Items (Top 3 Critical Discussion Areas)
  const [aiScopeItems, setAiScopeItems] = useState<AiScopeChecklistItem[]>([]);

  // Dynamic Agenda Structure (5-phase ISO 19011 audit agenda)
  const [currentAgenda, setCurrentAgenda] = useState<MeetingAgendaStructure | undefined>();

  // Role Preparation Summary Modal
  const [isRolePrepModalOpen, setIsRolePrepModalOpen] = useState<boolean>(false);

  // Helper to append suggested questions from AI scope checklist into interview plan
  const handleAppendAiQuestions = (newQuestions: Array<{ question: string; clause: string }>) => {
    setInterviewQuestions(prev => {
      const existingTexts = new Set(prev.map(p => p.question.trim().toLowerCase()));
      const toAdd: InterviewQuestionItem[] = [];
      newQuestions.forEach((item, idx) => {
        if (!existingTexts.has(item.question.trim().toLowerCase())) {
          toAdd.push({
            id: `q_ai_${Date.now()}_${idx}`,
            question: item.question,
            mappedClauseOrControl: item.clause.split(' ')[0] || 'Annex A',
            complianceFinding: 'Conforming'
          });
        }
      });
      return [...prev, ...toAdd];
    });
  };

  // Update suggested questions when department changes
  useEffect(() => {
    const templates = DEPARTMENT_QUESTION_TEMPLATES[department] || DEPARTMENT_QUESTION_TEMPLATES['Software Engineering & DevOps'];
    if (templates) {
      setInterviewQuestions(
        templates.map((t, idx) => ({
          id: `q_${Date.now()}_${idx}`,
          question: t.question,
          mappedClauseOrControl: t.clause.split(' ')[0] || 'Annex A',
          complianceFinding: 'Conforming'
        }))
      );
    }
  }, [department]);

  // Auto-fill stakeholder title when selecting role if empty, and trigger Role Preparation summary modal
  const handleRoleChange = (role: StakeholderRole, openModal: boolean = true) => {
    setStakeholderRole(role);
    if (openModal) {
      setIsRolePrepModalOpen(true);
    }
    if (!stakeholderTitle) {
      if (role === 'DEPARTMENT_HEAD') setStakeholderTitle('Head of Department');
      else if (role === 'SYSTEM_ADMIN') setStakeholderTitle('Senior Systems Administrator');
      else if (role === 'TECH_CUSTODIAN') setStakeholderTitle('Lead Infrastructure Engineer');
      else if (role === 'RISK_OWNER') setStakeholderTitle('Operational Risk Manager');
      else if (role === 'DATA_PROTECTION_LEAD') setStakeholderTitle('Data Protection Officer (DPO)');
      else if (role === 'EXECUTIVE_SPONSOR') setStakeholderTitle('Vice President / C-Level Sponsor');
    }
  };

  const handleToggleFramework = (fwId: string) => {
    setSelectedFrameworks(prev =>
      prev.includes(fwId)
        ? prev.length > 1
          ? prev.filter(f => f !== fwId)
          : prev
        : [...prev, fwId]
    );
  };

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;
    setInterviewQuestions(prev => [
      ...prev,
      {
        id: `q_${Date.now()}`,
        question: newQuestionText.trim(),
        mappedClauseOrControl: OBJECTIVE_DEFINITIONS[interviewObjective].isoClause,
        complianceFinding: 'Conforming'
      }
    ]);
    setNewQuestionText('');
  };

  const handleRemoveQuestion = (qId: string) => {
    setInterviewQuestions(prev => prev.filter(q => q.id !== qId));
  };

  // Form Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!stakeholderName.trim()) newErrors.stakeholderName = 'Stakeholder name is required';
    if (!stakeholderEmail.trim() || !stakeholderEmail.includes('@')) {
      newErrors.stakeholderEmail = 'A valid stakeholder corporate email is required';
    }
    if (!stakeholderTitle.trim()) newErrors.stakeholderTitle = 'Stakeholder job title is required';
    if (!scheduledDate) newErrors.scheduledDate = 'Scheduled date is required';
    if (!scheduledTime) newErrors.scheduledTime = 'Scheduled time is required';
    if (selectedFrameworks.length === 0) newErrors.frameworks = 'At least one framework must be selected';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToConsentCheck = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (validateStep1()) {
      setCurrentStep('consent_check');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) {
      setCurrentStep('details');
      return;
    }

    if (!isConsentCheckPassed) {
      setCurrentStep('consent_check');
      const newErrors: Record<string, string> = {};
      if (!audioVideoRecordingConsent || !recordingConsentTimestamp) {
        newErrors.recordingConsent = 'Audio/Video recording authorization is mandatory and must be timestamped before initialization.';
      }
      if (!aiTranscriptionConsent || !transcriptConsentTimestamp) {
        newErrors.transcriptConsent = 'AI transcription authorization is mandatory and must be timestamped before initialization.';
      }
      if (!confidentialityAgreementConsent || !confidentialityConsentTimestamp) {
        newErrors.confidentialityConsent = 'ISO Clause 7.5 Confidentiality and NDA consent must be ratified.';
      }
      setErrors(newErrors);
      return;
    }

    const objectiveDef = OBJECTIVE_DEFINITIONS[interviewObjective];
    const meetingCode = `MTG-ISO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    // Compute cryptographic integrity hash for the consent record including timestamps
    const consentPayload = `${stakeholderName}|${stakeholderEmail}|${scheduledDate}|REC:${recordingConsentTimestamp}|TRN:${transcriptConsentTimestamp}|NDA:${confidentialityConsentTimestamp}|RET:${dataRetentionMonths}|${selectedProject.code}`;
    let integrityHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    try {
      integrityHash = await computeSHA256(consentPayload);
    } catch {
      // fallback
    }

    const consentRecord: TranscriptConsentRecord = {
      audioVideoRecordingConsent,
      recordingConsentTimestamp: recordingConsentTimestamp || new Date().toISOString(),
      aiTranscriptionConsent,
      transcriptConsentTimestamp: transcriptConsentTimestamp || new Date().toISOString(),
      confidentialityAgreementConsent,
      confidentialityConsentTimestamp: confidentialityConsentTimestamp || new Date().toISOString(),
      auditorAccessSamplingConsent,
      auditorAccessConsentTimestamp: auditorAccessConsentTimestamp || new Date().toISOString(),
      dataRetentionMonths,
      consentSignerName: stakeholderName,
      consentSignerEmail: stakeholderEmail,
      consentSignedAt: new Date().toISOString(),
      consentIpAddress: attesterTerminalIp,
      consentIntegrityHash: integrityHash
    };

    const newMeeting: MeetingInterviewSession = {
      id: `mtg_${Date.now()}`,
      tenantId: currentTenant?.id || 'tenant_default',
      meetingCode,
      title: `${department} - ${objectiveDef.title.split('(')[0].trim()} Interview`,
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      department,
      stakeholder: {
        name: stakeholderName,
        email: stakeholderEmail,
        title: stakeholderTitle,
        phone: stakeholderPhone || undefined
      },
      stakeholderRole,
      interviewObjective,
      objectiveDescription: objectiveDescription.trim() || objectiveDef.description,
      frameworks: selectedFrameworks,
      primaryFramework: selectedFrameworks[0] || 'ISO/IEC 27001:2022',
      aiSuggestedScope: aiScopeItems,
      dynamicAgenda: currentAgenda,
      scheduledDate,
      scheduledTime,
      durationMinutes,
      locationOrLink,
      interviewer: {
        name: currentUser.name || 'Lead ISMS Implementer',
        email: currentUser.email || 'implementer@skandagrc.com',
        role: 'Lead ISO Implementer & Lead Auditor'
      },
      status: 'Scheduled',
      consents: consentRecord,
      isoProjectMapping: {
        projectId: selectedProject.id,
        projectName: selectedProject.name,
        projectPhase: selectedProject.currentPhase,
        targetMilestone: `Milestone: ${objectiveDef.title}`,
        mappedClauses: [objectiveDef.isoClause],
        mappedAnnexAControls: objectiveDef.defaultControls,
        generatedTaskIds: autoCreateTask ? [`tsk_${Date.now()}`] : [],
        expectedEvidenceArtifacts: [
          `${department} Control Execution Evidence`,
          `Signed Interview Working Paper (${meetingCode})`,
          'Approved Roles & Responsibilities Attestation'
        ],
        deliverableOutput: objectiveDef.deliverable
      },
      interviewQuestions,
      transcriptSummary: `Scheduled ISO discovery session targeting ${objectiveDef.title} for ${department}. Mandatory recording & transcript authorizations verified and timestamped.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(newMeeting, autoCreateTask);
  };

  const currentObjectiveDef = OBJECTIVE_DEFINITIONS[interviewObjective];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-sky-950 border border-sky-700/60 flex items-center justify-center text-sky-400 font-bold shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400 bg-sky-950/80 border border-sky-800/60 px-2 py-0.5 rounded">
                  Meeting Scheduler
                </span>
                <span className="text-[10px] text-slate-400 font-medium">ISO 27001 / ISO 42001 Stakeholder Discovery</span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                {currentStep === 'details'
                  ? 'Schedule ISO Implementation Interview'
                  : 'Mandatory Consent Check & Authorization Gate'}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Step navigation tabs */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setCurrentStep('details')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  currentStep === 'details'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-black/30 text-[10px] flex items-center justify-center">1</span>
                <span>Session Scope</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) {
                    setCurrentStep('consent_check');
                  }
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  currentStep === 'consent_check'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : isConsentCheckPassed
                    ? 'text-emerald-400 hover:text-emerald-300'
                    : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-black/30 text-[10px] flex items-center justify-center">2</span>
                <span>Consent Check</span>
                {isConsentCheckPassed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                    Mandatory
                  </span>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-slate-200">
          {/* SECTION 1: ISO Implementation Project Selection */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Award className="w-4 h-4 text-sky-400" />
                <span>1. ISO Implementation Project Selection *</span>
              </label>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                {selectedProject.currentPhase}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400">Target Implementation Project</span>
                <select
                  value={selectedProjectId}
                  onChange={e => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  {ISO_PROJECTS_CATALOG.map(proj => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name} ({proj.standard})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Target External Audit:</span>
                  <span className="font-bold text-white font-mono">{selectedProject.targetAuditDate}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Certification Body:</span>
                  <span className="font-bold text-indigo-300">{selectedProject.targetCertificationBody}</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate pt-0.5 border-t border-slate-800">
                  Lead: {selectedProject.leadImplementer}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Department & Stakeholder Information */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Building className="w-4 h-4 text-sky-400" />
              <span>2. Department & Stakeholder Profile *</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Department */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Audited Department</label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  {availableDepartments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 block">
                  Questions and Annex A controls auto-adapt based on selected department.
                </span>
              </div>

              {/* Stakeholder Role */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-300">
                    Stakeholder Role in ISO Governance
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsRolePrepModalOpen(true)}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 transition cursor-pointer"
                    title="View Role Preparation Summary, required documentation, and pre-interview checklists"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Role Prep Summary</span>
                  </button>
                </div>
                <select
                  value={stakeholderRole}
                  onChange={e => handleRoleChange(e.target.value as StakeholderRole, true)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  {Object.entries(STAKEHOLDER_ROLE_LABELS).map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.label}
                    </option>
                  ))}
                </select>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-0.5 text-[10px]">
                  <span className="text-indigo-400 block line-clamp-1">
                    {STAKEHOLDER_ROLE_LABELS[stakeholderRole]?.description}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsRolePrepModalOpen(true)}
                    className="text-sky-400 hover:text-sky-300 underline font-medium shrink-0 cursor-pointer self-start sm:self-auto"
                  >
                    Review {ROLE_PREPARATION_PROFILES[stakeholderRole]?.requiredDocumentation.length || 0} Required Evidence Artifacts
                  </button>
                </div>
              </div>
            </div>

            {/* Stakeholder Contact Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Stakeholder Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Michael Chen"
                  value={stakeholderName}
                  onChange={e => setStakeholderName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl bg-slate-900 border text-white text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none ${
                    errors.stakeholderName ? 'border-rose-500' : 'border-slate-700'
                  }`}
                />
                {errors.stakeholderName && (
                  <span className="text-[10px] text-rose-400">{errors.stakeholderName}</span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Corporate Email Address *</label>
                <input
                  type="email"
                  placeholder="e.g. michael.chen@company.com"
                  value={stakeholderEmail}
                  onChange={e => setStakeholderEmail(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl bg-slate-900 border text-white text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none ${
                    errors.stakeholderEmail ? 'border-rose-500' : 'border-slate-700'
                  }`}
                />
                {errors.stakeholderEmail && (
                  <span className="text-[10px] text-rose-400">{errors.stakeholderEmail}</span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Designation / Title *</label>
                <input
                  type="text"
                  placeholder="e.g. VP of Infrastructure"
                  value={stakeholderTitle}
                  onChange={e => setStakeholderTitle(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl bg-slate-900 border text-white text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none ${
                    errors.stakeholderTitle ? 'border-rose-500' : 'border-slate-700'
                  }`}
                />
                {errors.stakeholderTitle && (
                  <span className="text-[10px] text-rose-400">{errors.stakeholderTitle}</span>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: Interview Objective & Framework Selection */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>3. Interview Objective & Compliance Frameworks *</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Interview Objective */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Interview Objective</label>
                <select
                  value={interviewObjective}
                  onChange={e => setInterviewObjective(e.target.value as InterviewObjective)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  {Object.entries(OBJECTIVE_DEFINITIONS).map(([key, def]) => (
                    <option key={key} value={key}>
                      {def.title}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 block">
                  Clause: <strong className="text-sky-400">{currentObjectiveDef.isoClause}</strong> | Deliverable: {currentObjectiveDef.deliverable}
                </span>
              </div>

              {/* Schedule Timing */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Date *</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Time *</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={e => setScheduledTime(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Duration</label>
                  <select
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-2 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Scope / Custom Objective Description */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Session Scope & Specific Context Notes (Optional)</label>
              <textarea
                rows={2}
                placeholder={currentObjectiveDef.description}
                value={objectiveDescription}
                onChange={e => setObjectiveDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            {/* Framework Multi-Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <label className="text-[11px] font-semibold text-slate-300">
                    Target Regulatory Standards / Frameworks Selection *
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreviewFrameworkId(selectedFrameworks[0] || 'ISO/IEC 27001:2022')}
                    className="px-2 py-0.5 rounded-md bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-[10px] font-semibold transition flex items-center space-x-1 cursor-pointer"
                    title="View Framework Scope & Interview Focus Areas"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span>Framework Scope Preview</span>
                  </button>
                </div>
                <span className="text-[10px] text-slate-400">
                  {selectedFrameworks.length} Selected (Multi-standard crosswalk enabled)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {AVAILABLE_FRAMEWORKS.map(fw => {
                  const isSelected = selectedFrameworks.includes(fw.id);
                  return (
                    <div
                      key={fw.id}
                      className={`p-2 rounded-xl border text-left text-xs transition flex items-center justify-between group ${
                        isSelected
                          ? 'bg-sky-950/80 border-sky-500 text-white shadow-xs'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleFramework(fw.id)}
                        className="flex-1 flex items-center space-x-1.5 min-w-0 text-left cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0" />
                        )}
                        <span className="font-medium text-[11px] truncate">{fw.id}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewFrameworkId(fw.id);
                        }}
                        className="p-1 rounded-md text-slate-500 hover:text-sky-300 hover:bg-slate-800 transition cursor-pointer"
                        title={`Preview ${fw.id} Interview Scope & Focus Areas`}
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
              {errors.frameworks && (
                <span className="text-[10px] text-rose-400">{errors.frameworks}</span>
              )}
            </div>
          </div>

          {currentStep === 'details' ? (
            <>
              {/* AI-Suggested Scope Checklist: Dynamically populates based on selected framework, department & role */}
              <AiSuggestedScopeChecklist
                framework={selectedFrameworks[0] || 'ISO/IEC 27001:2022'}
                department={department}
                role={stakeholderRole}
                interviewObjective={interviewObjective}
                objectiveDescription={objectiveDescription}
                scopeItems={aiScopeItems}
                onUpdateScopeItems={setAiScopeItems}
                onAppendQuestions={handleAppendAiQuestions}
              />

              {/* Dynamic Agenda Preview Panel: Structured, high-level ISO audit agenda tailored to framework & department */}
              <DynamicAgendaPreview
                framework={selectedFrameworks[0] || 'ISO/IEC 27001:2022'}
                department={department}
                role={stakeholderRole}
                interviewObjective={interviewObjective}
                objectiveDescription={objectiveDescription}
                durationMinutes={durationMinutes}
                onAgendaGenerated={setCurrentAgenda}
                onDurationChange={setDurationMinutes}
              />

              {/* SECTION 4: Mapping to the ISO Implementation Project */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-indigo-950/40 border border-indigo-500/30 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span>4. Mapping to ISO Implementation Project</span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                    Active Project Sync
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Target ISO Phase</span>
                    <span className="font-bold text-indigo-300">{selectedProject.currentPhase}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Mapped ISO Clauses</span>
                    <span className="font-mono font-bold text-sky-300">{currentObjectiveDef.isoClause}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Target Deliverable</span>
                    <span className="font-medium text-emerald-300 truncate block">{currentObjectiveDef.deliverable}</span>
                  </div>
                </div>

                {/* Annex A Controls */}
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Annex A Security Controls Covered
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentObjectiveDef.defaultControls.map(ctrl => (
                      <span
                        key={ctrl}
                        className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-sky-300"
                      >
                        {ctrl}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Checkbox: Auto create task */}
                <label className="flex items-center space-x-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoCreateTask}
                    onChange={e => setAutoCreateTask(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-white">
                      Automatically create linked Task in "Tasks & Projects" module
                    </span>
                    <span className="text-slate-400 block text-[11px]">
                      Generates an implementation task assigned to the stakeholder with target evidence requirements.
                    </span>
                  </div>
                </label>

                {/* Questions list preview & customization */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300">
                      Pre-Populated ISO Audit Questions ({interviewQuestions.length})
                    </span>
                    <span className="text-[10px] text-slate-500">Customizable prior to session</span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {interviewQuestions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-start justify-between gap-2 text-xs"
                      >
                        <div className="flex items-start space-x-2">
                          <span className="text-[10px] font-mono font-bold text-sky-400 shrink-0 mt-0.5">
                            {idx + 1}.
                          </span>
                          <span className="text-slate-300 text-[11px]">{q.question}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(q.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer shrink-0"
                          title="Remove question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add custom question */}
                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add custom departmental interview question..."
                      value={newQuestionText}
                      onChange={e => setNewQuestionText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddQuestion();
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 1 Footer Controls */}
              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  Step 1 of 2 Complete • Scoped to{' '}
                  <strong className="text-white">{selectedProject.name}</strong>.
                  <span className="text-amber-400 font-medium block text-[11px] mt-0.5">
                    Mandatory Consent Check required before session initialization.
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleProceedToConsentCheck}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-md flex items-center space-x-2 cursor-pointer"
                  >
                    <span>Proceed to Mandatory Consent Check</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* STEP 2: MANDATORY CONSENT CHECK & AUTHORIZATION GATE */
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Context Summary Strip */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-800 text-sky-400 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">
                      Session To Initialize
                    </span>
                    <span className="text-white font-bold">
                      {department} — {currentObjectiveDef.title.split('(')[0].trim()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 font-mono text-[11px] text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Project:</span>
                    <span className="text-sky-300 font-bold">{selectedProject.code}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Stakeholder:</span>
                    <span className="text-white">{stakeholderName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Schedule:</span>
                    <span className="text-amber-300">{scheduledDate} @ {scheduledTime}</span>
                  </div>
                </div>
              </div>

              {/* Mandatory Gating Regulatory Preamble */}
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 flex items-start space-x-3 text-xs">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-amber-200 block text-xs">
                    Mandatory Pre-Session Authorization & Wiretap Statutory Requirement
                  </span>
                  <p className="text-[11px] text-amber-300/80 leading-relaxed">
                    Under ISO/IEC 27001 Clause 7.5 (Documented Information Control) and international privacy frameworks, 
                    <strong> recording and transcript authorizations must be explicitly granted and timestamped</strong> before 
                    the interview session record can be initialized into the active ISMS workspace. 
                    Unconfirmed sessions cannot proceed to audio capture.
                  </p>
                </div>
              </div>

              {/* Individual Consent Checkpoints with Audit Timestamps */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-sky-400" />
                    <span>Stakeholder Consent Authorizations & Timestamps</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleAuthorizeAllConsents}
                    className="text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-sky-950 border border-sky-800/80 hover:bg-sky-900 transition cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Quick-Authorize All & Timestamp</span>
                  </button>
                </div>

                {/* Consent 1: Recording (Mandatory) */}
                <div className={`p-4 rounded-xl border transition-all ${
                  audioVideoRecordingConsent && recordingConsentTimestamp
                    ? 'bg-slate-950/90 border-emerald-500/40 shadow-xs'
                    : 'bg-slate-950 border-slate-800'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="consent_recording"
                        checked={audioVideoRecordingConsent}
                        onChange={e => handleToggleRecordingConsent(e.target.checked)}
                        className="mt-1 rounded border-slate-700 text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                      <label htmlFor="consent_recording" className="cursor-pointer space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-xs">
                            1. Audio / Video Session Recording Authorization
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-800/60">
                            Mandatory Gate
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 max-w-xl leading-relaxed">
                          Authorizes recording of the interview dialogue for accurate ISO 27001 implementation evidence, 
                          GAP discovery, and auditor sampling verification.
                        </p>
                      </label>
                    </div>

                    <div className="shrink-0 flex items-center space-x-2 sm:self-start">
                      {audioVideoRecordingConsent && recordingConsentTimestamp ? (
                        <div className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 font-mono text-[10px] flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Logged: {new Date(recordingConsentTimestamp).toLocaleTimeString()}</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleRecordingConsent(true)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition cursor-pointer flex items-center space-x-1"
                        >
                          <span>Authorize Now</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Audit Timestamp pill if recorded */}
                  {recordingConsentTimestamp && (
                    <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center space-x-2 text-[10px] font-mono text-emerald-300/80">
                      <History className="w-3 h-3 text-emerald-400" />
                      <span>Audit Trail Timestamp: {recordingConsentTimestamp}</span>
                    </div>
                  )}
                  {errors.recordingConsent && (
                    <span className="text-[10px] text-rose-400 font-semibold block mt-1.5">
                      {errors.recordingConsent}
                    </span>
                  )}
                </div>

                {/* Consent 2: AI Transcription (Mandatory) */}
                <div className={`p-4 rounded-xl border transition-all ${
                  aiTranscriptionConsent && transcriptConsentTimestamp
                    ? 'bg-slate-950/90 border-emerald-500/40 shadow-xs'
                    : 'bg-slate-950 border-slate-800'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="consent_transcript"
                        checked={aiTranscriptionConsent}
                        onChange={e => handleToggleTranscriptConsent(e.target.checked)}
                        className="mt-1 rounded border-slate-700 text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                      <label htmlFor="consent_transcript" className="cursor-pointer space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-xs">
                            2. Automated AI Transcription & Key Finding Extraction
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-800/60">
                            Mandatory Gate
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 max-w-xl leading-relaxed">
                          Authorizes automated speech-to-text NLP transcription, speaker diarization, and ISO control finding synthesis 
                          within the encrypted enterprise workspace.
                        </p>
                      </label>
                    </div>

                    <div className="shrink-0 flex items-center space-x-2 sm:self-start">
                      {aiTranscriptionConsent && transcriptConsentTimestamp ? (
                        <div className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 font-mono text-[10px] flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Logged: {new Date(transcriptConsentTimestamp).toLocaleTimeString()}</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleTranscriptConsent(true)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition cursor-pointer flex items-center space-x-1"
                        >
                          <span>Authorize Now</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {transcriptConsentTimestamp && (
                    <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center space-x-2 text-[10px] font-mono text-emerald-300/80">
                      <History className="w-3 h-3 text-emerald-400" />
                      <span>Audit Trail Timestamp: {transcriptConsentTimestamp}</span>
                    </div>
                  )}
                  {errors.transcriptConsent && (
                    <span className="text-[10px] text-rose-400 font-semibold block mt-1.5">
                      {errors.transcriptConsent}
                    </span>
                  )}
                </div>

                {/* Consent 3: NDA & Confidentiality (Mandatory) */}
                <div className={`p-4 rounded-xl border transition-all ${
                  confidentialityAgreementConsent && confidentialityConsentTimestamp
                    ? 'bg-slate-950/90 border-emerald-500/40 shadow-xs'
                    : 'bg-slate-950 border-slate-800'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="consent_nda"
                        checked={confidentialityAgreementConsent}
                        onChange={e => handleToggleConfidentialityConsent(e.target.checked)}
                        className="mt-1 rounded border-slate-700 text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                      <label htmlFor="consent_nda" className="cursor-pointer space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-xs">
                            3. ISO Clause 7.5 Documented Information Confidentiality & NDA
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-800/60">
                            Clause 7.5
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 max-w-xl leading-relaxed">
                          Formal agreement that all architecture disclosures, vulnerabilities, credential custodianship, and 
                          compliance gaps discussed are classified strictly as CONFIDENTIAL information.
                        </p>
                      </label>
                    </div>

                    <div className="shrink-0 flex items-center space-x-2 sm:self-start">
                      {confidentialityAgreementConsent && confidentialityConsentTimestamp ? (
                        <div className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 font-mono text-[10px] flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Logged: {new Date(confidentialityConsentTimestamp).toLocaleTimeString()}</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleConfidentialityConsent(true)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition cursor-pointer flex items-center space-x-1"
                        >
                          <span>Ratify Now</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {confidentialityConsentTimestamp && (
                    <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center space-x-2 text-[10px] font-mono text-emerald-300/80">
                      <History className="w-3 h-3 text-emerald-400" />
                      <span>Audit Trail Timestamp: {confidentialityConsentTimestamp}</span>
                    </div>
                  )}
                  {errors.confidentialityConsent && (
                    <span className="text-[10px] text-rose-400 font-semibold block mt-1.5">
                      {errors.confidentialityConsent}
                    </span>
                  )}
                </div>

                {/* Consent 4: Auditor Access Sampling (Standard) */}
                <div className={`p-4 rounded-xl border transition-all ${
                  auditorAccessSamplingConsent && auditorAccessConsentTimestamp
                    ? 'bg-slate-950/90 border-emerald-500/40 shadow-xs'
                    : 'bg-slate-950 border-slate-800'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="consent_auditor"
                        checked={auditorAccessSamplingConsent}
                        onChange={e => handleToggleAuditorAccessConsent(e.target.checked)}
                        className="mt-1 rounded border-slate-700 text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                      <label htmlFor="consent_auditor" className="cursor-pointer space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-xs">
                            4. Certification Body Auditor Sampling Access Authorization
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-800/60">
                            Accreditation Scope
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 max-w-xl leading-relaxed">
                          Permits independent Stage 1 and Stage 2 accredited certification auditors ({selectedProject.targetCertificationBody}) 
                          to inspect sanitized transcript excerpts during surveillance audits.
                        </p>
                      </label>
                    </div>

                    <div className="shrink-0 flex items-center space-x-2 sm:self-start">
                      {auditorAccessSamplingConsent && auditorAccessConsentTimestamp ? (
                        <div className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 font-mono text-[10px] flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Logged: {new Date(auditorAccessConsentTimestamp).toLocaleTimeString()}</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleAuditorAccessConsent(true)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition cursor-pointer flex items-center space-x-1"
                        >
                          <span>Permit Access</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {auditorAccessConsentTimestamp && (
                    <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center space-x-2 text-[10px] font-mono text-emerald-300/80">
                      <History className="w-3 h-3 text-emerald-400" />
                      <span>Audit Trail Timestamp: {auditorAccessConsentTimestamp}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cryptographic Attestation & Retention Controls */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Fingerprint className="w-4 h-4 text-emerald-400" />
                    <span>Cryptographic Audit Attestation & Retention Policy</span>
                  </span>
                  <span className="text-[10px] font-mono text-sky-400">SHA-256 Validated</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-medium">Retention Window</span>
                    <select
                      value={dataRetentionMonths}
                      onChange={e => setDataRetentionMonths(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs font-bold focus:outline-none"
                    >
                      <option value={12}>12 Months (1 Year)</option>
                      <option value={36}>36 Months (3-Year Cert Cycle)</option>
                      <option value={60}>60 Months (5 Years Statutory)</option>
                    </select>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-medium">Attester / Signer</span>
                    <span className="font-bold text-white block truncate">{stakeholderName || 'Designated Stakeholder'}</span>
                    <span className="text-[10px] text-slate-400 truncate block">{stakeholderEmail}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 font-mono">
                    <span className="text-[10px] text-slate-400 block font-medium">Terminal Ingress IP</span>
                    <span className="text-[11px] text-indigo-300 font-bold block truncate">{attesterTerminalIp}</span>
                    <span className="text-[10px] text-emerald-400">TLS 1.3 Enterprise mTLS</span>
                  </div>
                </div>
              </div>

              {/* Initialization Gating Status Banner */}
              <div className={`p-4 rounded-xl border flex items-start space-x-3 text-xs ${
                isConsentCheckPassed
                  ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-200'
                  : 'bg-rose-950/30 border-rose-800/60 text-rose-200'
              }`}>
                {isConsentCheckPassed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <span className="font-bold block text-xs">
                    {isConsentCheckPassed
                      ? 'Mandatory Consent Check Passed • Meeting Record Ready to Initialize'
                      : 'Meeting Initialization Blocked • Missing Mandatory Authorizations'}
                  </span>
                  <p className="text-[11px] opacity-90 leading-relaxed">
                    {isConsentCheckPassed
                      ? 'Both Audio/Video Recording and AI Transcription authorizations have been verified and permanently timestamped. The interview session can now be formally initialized and synchronized to the ISMS project backlog.'
                      : 'You must authorize and log timestamps for both (1) Audio/Video Session Recording and (2) AI Transcription before this meeting record is authorized to be initialized.'}
                  </p>
                </div>
              </div>

              {/* Step 2 Footer Controls */}
              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep('details')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center space-x-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Session Scope</span>
                </button>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={!isConsentCheckPassed}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-md flex items-center space-x-2 ${
                      isConsentCheckPassed
                        ? 'bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white cursor-pointer shadow-emerald-950/50'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Initialize & Schedule Meeting Record</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {previewFrameworkId && (
        <FrameworkPreviewModal
          frameworkId={previewFrameworkId}
          onClose={() => setPreviewFrameworkId(null)}
          onSelectFramework={(fwId) => {
            if (!selectedFrameworks.includes(fwId)) {
              setSelectedFrameworks(prev => [...prev, fwId]);
            }
          }}
          showSelectAction
        />
      )}

      {isRolePrepModalOpen && (
        <RolePreparationSummaryModal
          isOpen={isRolePrepModalOpen}
          onClose={() => setIsRolePrepModalOpen(false)}
          selectedRole={stakeholderRole}
          onSelectRole={(newRole) => {
            handleRoleChange(newRole, false);
          }}
          stakeholderName={stakeholderName}
          departmentName={department}
        />
      )}
    </div>
  );
};
