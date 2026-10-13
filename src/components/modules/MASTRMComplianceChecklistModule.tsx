import React, { useState, useMemo, useEffect } from 'react';
import { useGRC } from '../../context/GRCContext';
import { safeConfirm } from '../../utils/safeConfirm';
import {
  INITIAL_MAS_CHECKLIST_DOMAINS,
  MAS_2026_CHECKLIST_DOMAINS,
  STATUTORY_CHAPTER_CHECKLIST_DOMAINS,
  CHECKLIST_METHODOLOGY_GUIDE,
  MASChecklistSubTask,
  MASDomainChecklistGroup,
  ChecklistTaskStatus,
  TaskPriority
} from '../../data/masComplianceChecklistData';
import { FindingCAPARecord } from '../../types';
import {
  isStatutoryNoticeTask,
  getStatutoryNoticePillarForTask,
  isSevereStatutoryTaskViolation,
  getStatutoryTaskStats,
  STATUTORY_NOTICE_PILLARS
} from '../../services/masStatutoryNoticeService';
import {
  CheckSquare,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Plus,
  FileCheck2,
  Layers,
  ChevronDown,
  ChevronRight,
  Building2,
  ShieldAlert,
  Milestone,
  Code2,
  GitPullRequest,
  Radar,
  Lock,
  KeyRound,
  Network,
  Cloud,
  Building,
  AlertOctagon,
  ServerCrash,
  FileClock,
  Download,
  RotateCcw,
  Sparkles,
  Info,
  SlidersHorizontal,
  X,
  BookOpen,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  Target,
  Award
} from 'lucide-react';
import { PageContainer } from '../layout/PageContainer';

const STORAGE_KEY = 'mas_trm_checklist_state_2026_v2';

export const MASTRMComplianceChecklistModule: React.FC = () => {
  const {
    findings,
    addFinding,
    navigateToFindingsCAPA,
    setActiveModule,
    currentTenant,
    currentUser
  } = useGRC();

  // Framework Mode: 2026 Practitioner Checklist (10 Domains, 93 Controls) vs Statutory Chapter Breakdown (14 Chapters)
  const [frameworkMode, setFrameworkMode] = useState<'PRACTITIONER_2026' | 'STATUTORY_CHAPTERS'>('PRACTITIONER_2026');
  const [showMethodologyModal, setShowMethodologyModal] = useState<boolean>(false);

  // Load checklist state from localStorage if available
  const [domainGroups, setDomainGroups] = useState<MASDomainChecklistGroup[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${currentTenant?.id || 'default'}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load MAS checklist state from localStorage', e);
    }
    return MAS_2026_CHECKLIST_DOMAINS;
  });

  // Save to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(
        `${STORAGE_KEY}_${currentTenant?.id || 'default'}`,
        JSON.stringify(domainGroups)
      );
    } catch (e) {
      console.warn('Failed to persist MAS checklist state', e);
    }
  }, [domainGroups, currentTenant?.id]);

  // Handle framework mode toggle
  const handleToggleFramework = (mode: 'PRACTITIONER_2026' | 'STATUTORY_CHAPTERS') => {
    setFrameworkMode(mode);
    setSelectedDomain('ALL');
    if (mode === 'PRACTITIONER_2026') {
      setDomainGroups(MAS_2026_CHECKLIST_DOMAINS);
    } else {
      setDomainGroups(STATUTORY_CHAPTER_CHECKLIST_DOMAINS);
    }
  };

  // Reset to default baseline
  const handleResetChecklist = () => {
    if (safeConfirm('Reset checklist state to default 2026 Master Data? Any local edits will be reset to baseline.')) {
      const baseline = frameworkMode === 'PRACTITIONER_2026' ? MAS_2026_CHECKLIST_DOMAINS : STATUTORY_CHAPTER_CHECKLIST_DOMAINS;
      setDomainGroups(baseline);
      localStorage.removeItem(`${STORAGE_KEY}_${currentTenant?.id || 'default'}`);
    }
  };

  // Filters
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [onlyShowWithFindings, setOnlyShowWithFindings] = useState<boolean>(false);
  const [onlyStatutoryNotices, setOnlyStatutoryNotices] = useState<boolean>(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Modal State for Raising a Finding
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [targetSubTask, setTargetSubTask] = useState<MASChecklistSubTask | null>(null);
  const [findingTitle, setFindingTitle] = useState('');
  const [findingSeverity, setFindingSeverity] = useState<FindingCAPARecord['severity']>('Major Non-Conformity');
  const [findingClause, setFindingClause] = useState('');
  const [findingDept, setFindingDept] = useState('');
  const [findingDescription, setFindingDescription] = useState('');
  const [findingRootCause, setFindingRootCause] = useState('');
  const [findingCorrective, setFindingCorrective] = useState('');
  const [findingPreventive, setFindingPreventive] = useState('');
  const [findingOwner, setFindingOwner] = useState('');
  const [findingTargetDate, setFindingTargetDate] = useState('2026-09-30');

  // Flatten all subtasks
  const allSubTasks = useMemo(() => {
    return domainGroups.flatMap(d => d.subTasks);
  }, [domainGroups]);

  // Statistics
  const stats = useMemo(() => {
    const total = allSubTasks.length;
    const compliant = allSubTasks.filter(t => t.status === 'COMPLIANT').length;
    const inProgress = allSubTasks.filter(t => t.status === 'IN_PROGRESS').length;
    const gapFinding = allSubTasks.filter(t => t.status === 'GAP_FINDING').length;
    const notStarted = allSubTasks.filter(t => t.status === 'NOT_STARTED').length;
    const score = total > 0 ? Math.round(((compliant + inProgress * 0.5) / total) * 1000) / 10 : 0;
    return { total, compliant, inProgress, gapFinding, notStarted, score };
  }, [allSubTasks]);

  // Statutory Notice Mandate Statistics (6 Non-Negotiable Pillars)
  const statutoryTaskStats = useMemo(() => {
    return getStatutoryTaskStats(allSubTasks);
  }, [allSubTasks]);

  // Lookup map for live FindingCAPARecords by findingCode
  const findingsByCodeMap = useMemo(() => {
    const map = new Map<string, FindingCAPARecord>();
    findings.forEach(f => {
      if (f.findingCode) {
        map.set(f.findingCode.toUpperCase(), f);
      }
      map.set(f.id, f);
    });
    return map;
  }, [findings]);

  // Filtered sub-tasks
  const filteredSubTasks = useMemo(() => {
    return allSubTasks.filter(task => {
      const isNoticeTask = isStatutoryNoticeTask(task);

      // Statutory Notice Mandate filter - isolates the 6 non-negotiable MAS requirements
      if ((onlyStatutoryNotices || statusFilter === 'STATUTORY_MANDATE') && !isNoticeTask) {
        return false;
      }
      // Domain filter
      if (selectedDomain !== 'ALL' && task.domainNumber !== selectedDomain) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'ALL' && statusFilter !== 'STATUTORY_MANDATE' && task.status !== statusFilter) {
        return false;
      }
      // Priority filter
      if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) {
        return false;
      }
      // Only show with findings
      if (onlyShowWithFindings && !task.linkedFindingCode && task.status !== 'GAP_FINDING') {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchText = (
          task.title +
          ' ' +
          task.taskCode +
          ' ' +
          task.regulatoryRef +
          ' ' +
          (task.linkedISOControl || '') +
          ' ' +
          (task.linkedFindingCode || '') +
          ' ' +
          task.assignedRole +
          ' ' +
          task.description
        ).toLowerCase();
        if (!matchText.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [allSubTasks, selectedDomain, statusFilter, priorityFilter, onlyShowWithFindings, onlyStatutoryNotices, searchTerm]);

  // Handle task status change
  const handleStatusChange = (taskId: string, newStatus: ChecklistTaskStatus) => {
    setDomainGroups(prev =>
      prev.map(domain => ({
        ...domain,
        subTasks: domain.subTasks.map(t => {
          if (t.id === taskId) {
            return {
              ...t,
              status: newStatus,
              completedAt: newStatus === 'COMPLIANT' ? new Date().toISOString() : t.completedAt,
              completedBy: newStatus === 'COMPLIANT' ? currentUser?.name || 'Compliance Officer' : t.completedBy
            };
          }
          return t;
        })
      }))
    );
  };

  // Open modal to raise finding
  const handleOpenRaiseModal = (task: MASChecklistSubTask) => {
    setTargetSubTask(task);
    setFindingTitle(`[MAS TRM ${task.domainNumber}] ${task.title} Control Non-Conformity`);
    setFindingSeverity(task.priority === 'CRITICAL' ? 'Major Non-Conformity' : 'Minor Non-Conformity');
    setFindingClause(`MAS TRM ${task.taskCode} / ISO ${task.linkedISOControl || 'A.5.1'}`);
    setFindingDept(task.department);
    setFindingDescription(
      `Assessment against MAS TRM Guideline (${task.regulatoryRef}) identified an operating gap in "${task.title}". Required implementation: ${task.evidenceRequired}`
    );
    setFindingRootCause(
      `5-Whys Initial Investigation: Operational oversight and absence of automated enforcement gate in ${task.department}.`
    );
    setFindingCorrective(
      `Deploy remediation procedures for ${task.title} and generate signed verification evidence.`
    );
    setFindingPreventive(
      `Embed automated policy validation gates into CI/CD and schedule quarterly compliance recertification.`
    );
    setFindingOwner(task.assignedRole);
    setFindingTargetDate('2026-09-30');
    setIsModalOpen(true);
  };

  // Save new finding and link to task
  const handleSaveFinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSubTask) return;

    // Generate finding code
    const existingCodes = findings.map(f => f.findingCode);
    let nextNum = 1;
    while (existingCodes.includes(`GAP-MAS-${String(nextNum).padStart(2, '0')}`)) {
      nextNum++;
    }
    const newFindingCode = `GAP-MAS-${String(nextNum).padStart(2, '0')}`;

    const newFinding: FindingCAPARecord = {
      id: `fnd_mas_${Date.now()}`,
      tenantId: currentTenant?.id || 'tenant_apex',
      findingCode: newFindingCode,
      source: 'INTERNAL_AUDIT',
      severity: findingSeverity,
      title: findingTitle,
      clauseOrControl: findingClause,
      department: findingDept,
      description: findingDescription,
      rootCauseAnalysis: {
        methodology: '5_WHYS',
        whys: [
          'Why did the control deficiency occur? Operating procedure was not enforced continuously.',
          'Why was it not enforced? Department lacked an automated monitoring hook.',
          'Why was the hook missing? Legacy manual checklist was relied upon during migration.',
          'Why did manual checklist fail? Staff turnover and lack of automated alerts.',
          'Root Cause: Absence of immutable automated compliance enforcement in the deployment pipeline.'
        ],
        rootCauseStatement: findingRootCause
      },
      capaPlan: {
        correctiveAction: findingCorrective,
        preventiveAction: findingPreventive,
        owner: findingOwner,
        targetDate: findingTargetDate,
        evidenceRequired: targetSubTask.evidenceRequired
      },
      status: 'Open',
      raisedBy: currentUser?.name || 'Chief Compliance Officer',
      raisedDate: new Date().toISOString().split('T')[0]
    };

    // Add to GRCContext
    addFinding(newFinding);

    // Update subtask in state with linked finding code and status GAP_FINDING
    setDomainGroups(prev =>
      prev.map(domain => ({
        ...domain,
        subTasks: domain.subTasks.map(t => {
          if (t.id === targetSubTask.id) {
            return {
              ...t,
              status: 'GAP_FINDING',
              linkedFindingId: newFinding.id,
              linkedFindingCode: newFindingCode,
              notes: `Audit finding ${newFindingCode} raised on ${newFinding.raisedDate} by ${newFinding.raisedBy}.`
            };
          }
          return t;
        })
      }))
    );

    setIsModalOpen(false);
    setTargetSubTask(null);
  };

  // Export checklist as JSON
  const handleExportChecklist = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(domainGroups, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `MAS_TRM_Compliance_Checklist_${frameworkMode}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Domain icon resolver supporting 1-10, D1-D10 and 3.0-16.0
  const getDomainIcon = (num: string) => {
    switch (num) {
      case '1':
      case 'D1':
      case '3.0': return <Building2 className="w-4 h-4" />;
      case '2':
      case 'D2':
      case '7.0':
      case '11.0': return <Network className="w-4 h-4" />;
      case '3':
      case 'D3':
      case '8.0':
      case '12.0': return <Radar className="w-4 h-4" />;
      case '4':
      case 'D4':
      case '9.0': return <Lock className="w-4 h-4" />;
      case '5':
      case 'D5':
      case '6.0':
      case '10.0': return <Code2 className="w-4 h-4" />;
      case '6':
      case 'D6': return <KeyRound className="w-4 h-4" />;
      case '7':
      case 'D7':
      case '15.0': return <ServerCrash className="w-4 h-4" />;
      case '8':
      case 'D8':
      case '5.0': return <Cloud className="w-4 h-4" />;
      case '9':
      case 'D9':
      case '14.0': return <AlertOctagon className="w-4 h-4" />;
      case '10':
      case 'D10':
      case '4.0': return <ShieldAlert className="w-4 h-4" />;
      case '13.0': return <Building className="w-4 h-4" />;
      case '16.0': return <FileClock className="w-4 h-4" />;
      default: return <ShieldCheck className="w-4 h-4" />;
    }
  };

  // Priority badge styling resolver
  const getPriorityBadgeClass = (priority: TaskPriority | string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
      case 'REQUIRED':
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
      case 'ANNUAL':
        return 'bg-purple-500/20 text-purple-300 border border-purple-500/40';
      case 'POLICY':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/40';
      case 'GOVERNANCE':
        return 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40';
      case 'DOCS':
        return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
      case 'REVIEW':
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
      case 'MEDIUM':
      default:
        return 'bg-slate-700/40 text-slate-300 border border-slate-600';
    }
  };

  const selectedDomainGroup = useMemo(() => {
    if (selectedDomain === 'ALL') return null;
    return domainGroups.find(d => d.domainNumber === selectedDomain) || null;
  }, [domainGroups, selectedDomain]);

  return (
    <PageContainer id="mas-trm-checklist-module" className="pb-24">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/40 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 relative z-10">
          <div className="space-y-3 flex-1">
            {/* Regulatory Alignment Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center space-x-1 shadow-sm">
                <Building2 className="w-3.5 h-3.5 mr-1" />
                <span>MAS TRM Guidelines 2026 Edition</span>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300 px-2.5 py-1 rounded-full bg-sky-500/20 border border-sky-500/40 shadow-sm">
                10 Practitioner Domains • 93 Controls
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 shadow-sm">
                Notice 655 & Notice 644 Aligned
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 shadow-sm">
                Independent Audit Ready
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                MAS TRM Compliance Checklist
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed mt-1.5 font-normal">
                Comprehensive practitioner implementation guide and audit readiness checklist covering governance, infrastructure, IAM, cryptography, BCP/DR, and cyber hygiene. Aligned with Singapore statutory notices and lead auditor inspection criteria.
              </p>
            </div>

            {/* Framework Switcher & Methodology Guide Trigger */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1.5">
              <div className="inline-flex rounded-xl bg-slate-950/90 p-1 border border-slate-800 shadow-inner">
                <button
                  type="button"
                  onClick={() => handleToggleFramework('PRACTITIONER_2026')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    frameworkMode === 'PRACTITIONER_2026'
                      ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md shadow-rose-950/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>2026 Practitioner Checklist (10 Domains / 93 Controls)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleFramework('STATUTORY_CHAPTERS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    frameworkMode === 'STATUTORY_CHAPTERS'
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-950/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Statutory Chapters (14 Chapters)</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowMethodologyModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all shadow-sm cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>4-Step Methodology & 10 Lead Auditor Tips</span>
              </button>
            </div>
          </div>

          {/* Action Buttons Column */}
          <div className="flex flex-wrap xl:flex-col items-stretch xl:items-end gap-2.5 shrink-0 pt-2 xl:pt-0">
            {/* Primary Action */}
            <button
              type="button"
              onClick={() => setActiveModule('findings_capa')}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold border border-rose-500/50 shadow-lg shadow-rose-950/50 transition-all cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-white" />
              <span>Open Findings & CAPA Module</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>

            {/* Secondary Actions */}
            <div className="flex items-center gap-2 w-full xl:w-auto">
              <button
                type="button"
                onClick={handleExportChecklist}
                className="flex-1 xl:flex-initial flex items-center justify-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-sm cursor-pointer"
                title="Download structured JSON checklist with verification records"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Export Audit JSON</span>
              </button>

              <button
                type="button"
                onClick={handleResetChecklist}
                className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer text-xs font-medium"
                title="Reset checklist to default 2026 baseline"
                aria-label="Reset checklist to default baseline"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Reset Baseline</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metrics & Progress Bar - 6 Harmonized Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. Compliance Score */}
        <div 
          className="col-span-2 md:col-span-1 p-4 sm:p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between"
          title="Weighted formula: (Compliant + 0.5 × In Progress) / Total Action Items × 100"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">MAS TRM Readiness</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono border border-rose-500/30">
              {domainGroups.length} Domains
            </span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{stats.score}%</span>
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Readiness</span>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 transition-all duration-500"
                style={{ width: `${stats.total > 0 ? (stats.compliant / stats.total) * 100 : 0}%` }}
                title={`Compliant: ${stats.compliant}`}
              />
              <div
                className="bg-amber-400 h-2 transition-all duration-500"
                style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }}
                title={`In Progress: ${stats.inProgress}`}
              />
              <div
                className="bg-rose-500 h-2 transition-all duration-500"
                style={{ width: `${stats.total > 0 ? (stats.gapFinding / stats.total) * 100 : 0}%` }}
                title={`Gap / CAPA Active: ${stats.gapFinding}`}
              />
            </div>
            <div className="text-[10px] text-slate-400 flex justify-between">
              <span>{stats.compliant} Done</span>
              <span>{stats.inProgress} In Prog</span>
            </div>
          </div>
        </div>

        {/* 2. Total Action Items (Reconciled with 93 Controls) */}
        <div 
          className="p-4 sm:p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm transition-all duration-150 flex flex-col justify-between"
          title="The 2026 Edition defines 93 baseline control specifications operationalized across 92 tracked sub-tasks in 10 domains."
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Action Items</span>
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 tracking-tight">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium leading-tight">
            93 Framework Controls • 92 Tracked Items
          </div>
        </div>

        {/* 3. Compliant */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm transition-all duration-150 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">Compliant</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-300 mt-2 tracking-tight">{stats.compliant}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">
            Evidence verified • 97.8%
          </div>
        </div>

        {/* 4. In Progress */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm transition-all duration-150 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400">In Progress</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-300 mt-2 tracking-tight">{stats.inProgress}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">
            Active remediation
          </div>
        </div>

        {/* 5. Linked CAPAs (Interactive Filter) */}
        <div
          role="button"
          tabIndex={0}
          aria-pressed={onlyShowWithFindings}
          onClick={() => setOnlyShowWithFindings(!onlyShowWithFindings)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setOnlyShowWithFindings(!onlyShowWithFindings);
            }
          }}
          className={`p-4 sm:p-5 rounded-xl border transition-all duration-150 cursor-pointer shadow-sm flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-rose-500/50 ${
            onlyShowWithFindings
              ? 'bg-rose-950/80 border-rose-500 ring-2 ring-rose-500/40 shadow-rose-950/50'
              : 'bg-slate-900/90 border-slate-800 hover:border-rose-700/80'
          }`}
          title="Click to toggle filtering by linked CAPAs and open findings"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-400">Linked CAPAs</span>
            <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-300 mt-2 tracking-tight">{stats.gapFinding}</div>
          <div className="text-[11px] font-semibold mt-1 flex items-center justify-between">
            <span className={onlyShowWithFindings ? 'text-rose-300' : 'text-slate-400'}>
              {onlyShowWithFindings ? 'Filter Active' : 'Click to filter'}
            </span>
          </div>
        </div>

        {/* 6. Statutory Mandate Stat Card (Interactive Filter) */}
        <div
          role="button"
          tabIndex={0}
          aria-pressed={onlyStatutoryNotices}
          onClick={() => setOnlyStatutoryNotices(!onlyStatutoryNotices)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setOnlyStatutoryNotices(!onlyStatutoryNotices);
            }
          }}
          className={`p-4 sm:p-5 rounded-xl border transition-all duration-150 cursor-pointer shadow-sm flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-rose-500/50 ${
            onlyStatutoryNotices
              ? 'bg-rose-950/80 border-rose-500 ring-2 ring-rose-500/40 shadow-rose-950/50'
              : 'bg-slate-900/90 border-slate-800 hover:border-rose-700/80'
          }`}
          title="Click to toggle isolating the 6 Statutory Notice Mandates (Notice 644/655)"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-300 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Statutory Mandate
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold border border-rose-500/30">
              6 Pillars
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 tracking-tight">
            {statutoryTaskStats.compliantCount}/{statutoryTaskStats.totalPillars}
          </div>
          <div className="text-[11px] font-semibold mt-1 flex items-center justify-between">
            <span className={statutoryTaskStats.severeViolations > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
              {statutoryTaskStats.severeViolations > 0
                ? `${statutoryTaskStats.severeViolations} Violation${statutoryTaskStats.severeViolations > 1 ? 's' : ''}`
                : 'Clean Bill'}
            </span>
            <span className="text-[10px] text-slate-400">
              {onlyStatutoryNotices ? 'Active' : 'Isolate 6'}
            </span>
          </div>
        </div>
      </div>

      {/* Domain Navigation Section - Structured Responsive Grid (No Overflow, No Clipping) */}
      <div className="space-y-3" role="region" aria-label="Domain Navigation">
        {/* Navigation Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs px-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-200 uppercase tracking-wider text-xs flex items-center space-x-2">
              <Layers className="w-4 h-4 text-rose-400" />
              <span>{frameworkMode === 'PRACTITIONER_2026' ? '10 Practitioner Domains' : '14 Statutory Chapters'} Navigation</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800/90 border border-slate-700 text-slate-300 text-[11px] font-mono">
              {selectedDomain === 'ALL'
                ? `Showing All ${domainGroups.length} Domains (${allSubTasks.length} Action Items)`
                : `Active: Domain ${selectedDomain} - ${selectedDomainGroup?.shortName || ''} (${selectedDomainGroup?.subTasks.length || 0} Controls)`}
            </span>
          </div>

          {/* All Domains Selector & Reset Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedDomain('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                selectedDomain === 'ALL'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-950/40 ring-1 ring-rose-400'
                  : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
              aria-selected={selectedDomain === 'ALL'}
              role="tab"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>View All Domains</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                selectedDomain === 'ALL' ? 'bg-black/30 text-white' : 'bg-slate-900 text-slate-400'
              }`}>
                {allSubTasks.length}
              </span>
            </button>
          </div>
        </div>

        {/* Responsive Structured Domain Cards Grid */}
        <div
          className={`grid gap-2.5 ${
            frameworkMode === 'PRACTITIONER_2026'
              ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
              : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
          }`}
          role="tablist"
          aria-label="Domain selection tabs"
        >
          {domainGroups.map(domain => {
            const isSel = selectedDomain === domain.domainNumber;
            const hasGaps = domain.subTasks.some(t => t.status === 'GAP_FINDING' || t.linkedFindingCode);
            const domainCompliantCount = domain.subTasks.filter(t => t.status === 'COMPLIANT').length;
            const domainInProgressCount = domain.subTasks.filter(t => t.status === 'IN_PROGRESS').length;
            const percent = domain.subTasks.length > 0
              ? Math.round((domainCompliantCount / domain.subTasks.length) * 100)
              : 0;

            return (
              <button
                key={domain.domainNumber}
                type="button"
                role="tab"
                aria-selected={isSel}
                tabIndex={0}
                onClick={() => setSelectedDomain(domain.domainNumber)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedDomain(domain.domainNumber);
                  }
                }}
                title={`${domain.domainNumber}. ${domain.domainName} (${domainCompliantCount}/${domain.subTasks.length} compliant) - ${domain.description}`}
                className={`p-3 rounded-xl border text-left transition-all duration-150 relative flex flex-col justify-between group cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400/50 ${
                  isSel
                    ? 'bg-gradient-to-br from-slate-900 via-sky-950/70 to-slate-900 border-sky-400 text-white shadow-lg shadow-sky-950/60 ring-1 ring-sky-400/80'
                    : 'bg-slate-900/85 hover:bg-slate-850 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                {/* Top Row: Icon + Code + Fraction Badge */}
                <div className="flex items-center justify-between gap-1.5 mb-2">
                  <div className="flex items-center space-x-1.5">
                    <div className={`p-1.5 rounded-lg ${isSel ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'}`}>
                      {getDomainIcon(domain.domainNumber)}
                    </div>
                    <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isSel ? 'bg-sky-500/30 text-sky-200 border border-sky-400/40' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {domain.domainNumber.startsWith('D') ? domain.domainNumber : `D${domain.domainNumber}`}
                    </span>
                  </div>

                  {/* Fraction Badge and Gap Alert */}
                  <div className="flex items-center space-x-1">
                    {hasGaps && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" title="Active Gap / CAPA ticket" />
                    )}
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      percent === 100
                        ? isSel ? 'bg-emerald-500/30 text-emerald-200' : 'bg-emerald-500/15 text-emerald-400'
                        : isSel ? 'bg-amber-500/30 text-amber-200' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {domainCompliantCount}/{domain.subTasks.length}
                    </span>
                  </div>
                </div>

                {/* Domain Name - Displays cleanly without clipping or ellipsis */}
                <div className="mb-2">
                  <div className={`text-xs font-bold leading-snug tracking-tight ${isSel ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                    {domain.shortName}
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {domain.domainName}
                  </div>
                </div>

                {/* Mini Completion Progress Bar */}
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden flex mt-auto">
                  <div
                    className="bg-emerald-400 h-1.5 transition-all duration-300"
                    style={{ width: `${(domainCompliantCount / domain.subTasks.length) * 100}%` }}
                  />
                  <div
                    className="bg-amber-400 h-1.5 transition-all duration-300"
                    style={{ width: `${(domainInProgressCount / domain.subTasks.length) * 100}%` }}
                  />
                  {hasGaps && (
                    <div className="bg-rose-500 h-1.5 transition-all duration-300 flex-1" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Domain Spotlight & Lead Auditor Tip Card (when domain selected) */}
      {selectedDomainGroup && (
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/30 border border-sky-900/50 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1 flex-1">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
                  Domain {selectedDomainGroup.domainNumber}
                </span>
                <h2 className="text-sm md:text-base font-bold text-white tracking-tight">
                  {selectedDomainGroup.domainName}
                </h2>
                {selectedDomainGroup.guidelineSectionRef && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    ({selectedDomainGroup.guidelineSectionRef})
                  </span>
                )}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedDomainGroup.subTasks.filter(t => t.status === 'COMPLIANT').length}/{selectedDomainGroup.subTasks.length} Controls Verified
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-4xl font-normal">
                {selectedDomainGroup.description}
              </p>
            </div>

            <div className="shrink-0 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setSelectedDomain('ALL')}
                className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              >
                Back to All Domains
              </button>
            </div>
          </div>

          {/* Expert Practitioner Guidance Tip */}
          {selectedDomainGroup.expertPractitionerTip && (
            <div className="mt-3.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200/90 leading-relaxed font-normal">
                <strong className="font-semibold text-amber-300 mr-1.5">Lead Auditor & Implementation Tip:</strong>
                {selectedDomainGroup.expertPractitionerTip}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-sm">
        {/* Search input */}
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search sub-tasks by code, title, regulatory ref, ISO control, owner..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
            aria-label="Filter by task status"
          >
            <option value="ALL">All Statuses</option>
            <option value="STATUTORY_MANDATE">Statutory Notice Mandate (6 Non-Negotiable)</option>
            <option value="COMPLIANT">Compliant / Verified</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="GAP_FINDING">Gaps / Findings Active</option>
            <option value="NOT_STARTED">Not Started</option>
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
            aria-label="Filter by priority level"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="REQUIRED">Required</option>
            <option value="ANNUAL">Annual Testing</option>
            <option value="POLICY">Policy Baseline</option>
            <option value="GOVERNANCE">Governance & Oversight</option>
            <option value="DOCS">Documentation</option>
            <option value="REVIEW">Review & Audit</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
          </select>

          {/* Quick toggle: show only linked CAPA */}
          <button
            type="button"
            aria-pressed={onlyShowWithFindings}
            onClick={() => setOnlyShowWithFindings(!onlyShowWithFindings)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center space-x-1.5 cursor-pointer ${
              onlyShowWithFindings
                ? 'bg-rose-500/25 text-rose-200 border-rose-500 ring-1 ring-rose-500/50'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Only Linked CAPAs</span>
          </button>

          {/* Quick toggle: show only statutory notice requirements */}
          <button
            type="button"
            aria-pressed={onlyStatutoryNotices}
            onClick={() => setOnlyStatutoryNotices(!onlyStatutoryNotices)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center space-x-1.5 cursor-pointer ${
              onlyStatutoryNotices
                ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950 ring-2 ring-rose-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>{onlyStatutoryNotices ? 'Statutory Notice Mandate (6 Active)' : 'Statutory Notice Mandate'}</span>
          </button>

          {/* Reset Filters button if any filter active */}
          {(searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || onlyShowWithFindings || onlyStatutoryNotices || selectedDomain !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSelectedDomain('ALL');
                setSearchTerm('');
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
                setOnlyShowWithFindings(false);
                setOnlyStatutoryNotices(false);
              }}
              className="px-2.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 flex items-center space-x-1 transition-colors cursor-pointer"
              title="Reset all active search and filter constraints"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          {/* Filter Counter Badge */}
          <span className="text-[11px] font-mono text-slate-400 px-2 py-1 bg-slate-800/80 rounded-md border border-slate-700/80 ml-auto">
            {filteredSubTasks.length} / {allSubTasks.length} items
          </span>
        </div>
      </div>

      {/* Statutory Notice Gatekeeper Banner */}
      {(onlyStatutoryNotices || statusFilter === 'STATUTORY_MANDATE') && (
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 border border-rose-600/70 shadow-lg shadow-rose-950/30 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded bg-red-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-red-950">
                  <AlertOctagon className="w-3.5 h-3.5 text-white animate-pulse" />
                  Statutory Notice Mandates
                </span>
                <span className="text-xs text-slate-300 font-semibold">
                  MAS Notice 644 / Notice 655 / PSN01 / Notice 126
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold">
                  Zero Exception Tolerance
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Isolating the <strong>6 non-negotiable statutory pillars</strong>. Non-compliance with these specific requirements constitutes a <strong>Severe Statutory Violation</strong> under the Banking Act (Section 58) and Payment Services Act (Section 85), exposing the institution to regulatory sanctions, financial penalties up to S$1,000,000, and supervisory capital add-ons.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setOnlyStatutoryNotices(false);
                  if (statusFilter === 'STATUTORY_MANDATE') setStatusFilter('ALL');
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition-colors"
              >
                Clear Statutory Filter
              </button>
            </div>
          </div>

          {/* Quick status row of all 6 pillars */}
          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {STATUTORY_NOTICE_PILLARS.map(pillar => {
              const matchedTask = allSubTasks.find(t => isStatutoryNoticeTask(t) && (
                pillar.mappedChecklistCodes.some(c => t.id.toUpperCase() === c.toUpperCase() || t.taskCode.toUpperCase() === c.toUpperCase())
              ));
              const isTaskCompliant = matchedTask?.status === 'COMPLIANT';

              return (
                <div
                  key={pillar.id}
                  onClick={() => setSearchTerm(pillar.shortCode)}
                  className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] ${
                    isTaskCompliant
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:border-emerald-700'
                      : 'bg-rose-950/50 border-rose-700 text-rose-200 shadow-sm shadow-rose-950/50 hover:border-rose-500'
                  }`}
                  title={`Click to filter by ${pillar.shortCode}`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-[11px] truncate">{pillar.shortCode}</span>
                    {isTaskCompliant ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-pulse" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-1" title={pillar.title}>
                    {pillar.title}
                  </div>
                  <div className="text-[9px] font-semibold mt-1 uppercase tracking-wider">
                    {isTaskCompliant ? (
                      <span className="text-emerald-400">Compliant</span>
                    ) : (
                      <span className="text-rose-400 font-bold">Severe Violation</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-tasks Display List */}
      <div className="space-y-4">
        {filteredSubTasks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <CheckSquare className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="text-base font-semibold text-slate-300">No sub-tasks match current filters</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try clearing search terms, selecting "All {domainGroups.length} Domains", or resetting the filter options.
            </p>
            <button
              onClick={() => {
                setSelectedDomain('ALL');
                setSearchTerm('');
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
                setOnlyShowWithFindings(false);
                setOnlyStatutoryNotices(false);
              }}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredSubTasks.map(task => {
            const isExpanded = expandedTaskId === task.id;
            const linkedFinding = task.linkedFindingCode
              ? findingsByCodeMap.get(task.linkedFindingCode.toUpperCase())
              : task.linkedFindingId
              ? findingsByCodeMap.get(task.linkedFindingId)
              : undefined;

            const isNoticeTask = isStatutoryNoticeTask(task);
            const noticePillar = isNoticeTask ? getStatutoryNoticePillarForTask(task) : null;
            const isSevereViolation = isNoticeTask && isSevereStatutoryTaskViolation(task);

            return (
              <div
                key={task.id}
                className={`rounded-xl border transition-all ${
                  isSevereViolation
                    ? 'bg-gradient-to-br from-slate-900 via-rose-950/25 to-slate-900 border-rose-600/90 hover:border-rose-500 shadow-xl shadow-rose-950/40 ring-1 ring-rose-500/30'
                    : task.status === 'GAP_FINDING' || task.linkedFindingCode
                    ? 'bg-slate-900/90 border-rose-800/60 hover:border-rose-600/80 shadow-md shadow-rose-950/20'
                    : task.status === 'COMPLIANT'
                    ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                {/* Main Card Header / Row */}
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    {/* Status Check / Icon */}
                    <div className="pt-0.5 shrink-0">
                      {task.status === 'COMPLIANT' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : task.status === 'GAP_FINDING' || task.linkedFindingCode ? (
                        <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
                      ) : task.status === 'IN_PROGRESS' ? (
                        <Clock className="w-5 h-5 text-amber-400" />
                      ) : (
                        <div className="w-5 h-5 rounded border border-slate-600" />
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                        <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {task.taskCode}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 font-semibold border border-rose-500/20">
                          Domain {task.domainNumber}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider ${getPriorityBadgeClass(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-mono">
                          {task.regulatoryRef}
                        </span>
                        {isSevereViolation && (
                          <span className="px-2.5 py-0.5 rounded bg-red-600 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-red-950/50 ring-1 ring-red-400/50 animate-pulse">
                            <AlertOctagon className="w-3 h-3 text-white" />
                            Severe Statutory Violation
                          </span>
                        )}
                        {isNoticeTask && !isSevereViolation && (
                          <span className="px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40 text-[10px] flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 text-purple-400" />
                            Statutory Mandate (Notice 644/655)
                          </span>
                        )}
                        {task.mandatoryNoticeRef && !isNoticeTask && (
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                            {task.mandatoryNoticeRef}
                          </span>
                        )}
                        {task.linkedISOControl && (
                          <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 font-mono">
                            ISO {task.linkedISOControl}
                          </span>
                        )}
                      </div>

                      {/* Sub-task Title */}
                      <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                        {task.title}
                      </h3>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>

                      {/* Severe Statutory Notice Violation Warning */}
                      {isSevereViolation && (
                        <div className="p-3 rounded-lg bg-red-950/80 border border-red-500/80 text-xs text-red-200 flex items-start gap-2.5 mt-2 shadow-md shadow-red-950/50">
                          <AlertOctagon className="w-4 h-4 text-red-400 animate-pulse shrink-0 mt-0.5" />
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-red-300 uppercase tracking-wide block text-[11px]">
                                🚨 Severe Statutory Violation ({noticePillar?.legalBasis || task.mandatoryNoticeRef || 'MAS Notice 644/655'})
                              </span>
                              <span className="text-[10px] bg-red-500/30 px-2 py-0.5 rounded font-mono text-red-200 border border-red-500/40">
                                Zero Exception Tolerance
                              </span>
                            </div>
                            <span className="text-[10px] text-red-200/90 block leading-relaxed">
                              {noticePillar?.penaltiesForBreach || 'Legally enforceable notice mandate under MAS Banking Act / Payment Services Act. Non-compliance exposes the Financial Institution to statutory directions and supervisory sanctions.'}
                            </span>
                            <div className="flex items-center justify-between pt-1 flex-wrap gap-2 text-[10px]">
                              <span className="text-red-300 font-medium">
                                <strong>Mandatory Standard:</strong> {noticePillar?.mandatoryThreshold || 'Non-negotiable requirement'}
                              </span>
                              {task.status !== 'GAP_FINDING' && !task.linkedFindingCode && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenRaiseModal(task)}
                                  className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow cursor-pointer transition-colors"
                                >
                                  <AlertOctagon className="w-3 h-3" />
                                  Raise Statutory CAPA Finding
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Roles & Verification Method */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span><strong>Owner:</strong> {task.assignedRole}</span>
                        <span>•</span>
                        <span><strong>Dept:</strong> {task.department}</span>
                        <span>•</span>
                        <span className="text-slate-500">Method: {task.verificationMethod.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Control Column */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    {/* Status Select Box */}
                    <div className="flex items-center space-x-2">
                      {isSevereViolation && (
                        <span className="px-2 py-0.5 rounded bg-red-600/90 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm shrink-0">
                          <AlertOctagon className="w-3 h-3 animate-pulse" />
                          Severe Violation
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-medium">Status:</span>
                      <select
                        value={task.status}
                        onChange={e => handleStatusChange(task.id, e.target.value as ChecklistTaskStatus)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                          task.status === 'COMPLIANT'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                            : task.status === 'GAP_FINDING'
                            ? 'bg-rose-950/80 text-rose-300 border-rose-700'
                            : task.status === 'IN_PROGRESS'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        <option value="COMPLIANT">Compliant</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="GAP_FINDING">Gap / Finding</option>
                        <option value="NOT_STARTED">Not Started</option>
                        <option value="NOT_APPLICABLE">N/A</option>
                      </select>
                    </div>

                    {/* Expand/Collapse and CAPA actions */}
                    <div className="flex items-center space-x-2">
                      {/* Raise Finding Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenRaiseModal(task)}
                        className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-semibold transition-colors cursor-pointer"
                        title="Raise internal audit finding and CAPA ticket for this sub-task"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Raise CAPA</span>
                      </button>

                      {/* Expand Details */}
                      <button
                        type="button"
                        onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                        className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition-colors cursor-pointer"
                      >
                        <span>{isExpanded ? 'Less' : 'Details'}</span>
                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Linked Findings & CAPA Highlight Strip */}
                {(task.linkedFindingCode || task.status === 'GAP_FINDING') && (
                  <div className="px-4 py-2.5 bg-rose-950/40 border-t border-rose-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="font-semibold text-rose-300 flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Linked Finding:</span>
                      </span>

                      {task.linkedFindingCode ? (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-200 font-mono font-bold border border-rose-500/40">
                          {task.linkedFindingCode}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-medium">
                          Gap Identified (Pending Finding Code)
                        </span>
                      )}

                      {linkedFinding && (
                        <>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-300 font-medium line-clamp-1">{linkedFinding.title}</span>
                          <span className={`px-1.5 py-0.2 text-[10px] rounded font-semibold ${
                            linkedFinding.status === 'Closed Verified'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : linkedFinding.status === 'CAPA Submitted'
                              ? 'bg-sky-500/20 text-sky-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {linkedFinding.status}
                          </span>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => navigateToFindingsCAPA(task.linkedFindingCode || task.taskCode)}
                      className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800/80 text-rose-200 font-semibold text-[11px] border border-rose-700/60 transition-colors shrink-0 cursor-pointer"
                    >
                      <span>View in Findings & CAPA</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/50 space-y-4 text-xs">
                    {/* Actionable Implementation Steps */}
                    <div>
                      <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-2 flex items-center space-x-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-sky-400" />
                        <span>Actionable Control Verification Steps:</span>
                      </h4>
                      <ul className="space-y-1.5 pl-2">
                        {task.actionableSteps.map((step, sIdx) => (
                          <li key={sIdx} className="flex items-start space-x-2 text-slate-300">
                            <span className="text-sky-400 font-bold">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Evidence Requirements */}
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Mandatory Audit Evidence Artifacts:
                      </span>
                      <p className="text-slate-200 mt-1 font-mono text-[11px]">
                        {task.evidenceRequired}
                      </p>
                    </div>

                    {/* Operational Notes */}
                    {task.notes && (
                      <div className="p-3 rounded-lg bg-sky-950/20 border border-sky-800/30 text-sky-200">
                        <span className="font-semibold text-[11px] block text-sky-300">Auditor / Implementer Note:</span>
                        <p className="mt-0.5 text-[11px]">{task.notes}</p>
                      </div>
                    )}

                    {/* Verification Footer */}
                    {task.completedAt && (
                      <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>
                          Verified compliant on {new Date(task.completedAt).toLocaleDateString()} by {task.completedBy || 'Lead Auditor'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Raise Audit Finding & CAPA Ticket */}
      {isModalOpen && targetSubTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">
                  Raise Finding & Corrective Action (CAPA)
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFinding} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400">Target Sub-Task:</span>
                <div className="font-semibold text-white">
                  [{targetSubTask.taskCode}] {targetSubTask.title}
                </div>
                <div className="text-slate-400 text-[11px]">
                  Regulatory Source: {targetSubTask.regulatoryRef} • ISO Control: {targetSubTask.linkedISOControl || 'A.5.1'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Finding Title</label>
                  <input
                    type="text"
                    required
                    value={findingTitle}
                    onChange={e => setFindingTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Severity Classification</label>
                  <select
                    value={findingSeverity}
                    onChange={e => setFindingSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="Major Non-Conformity">Major Non-Conformity</option>
                    <option value="Minor Non-Conformity">Minor Non-Conformity</option>
                    <option value="Observation">Observation</option>
                    <option value="Opportunity for Improvement">Opportunity for Improvement</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Clause / Control Reference</label>
                  <input
                    type="text"
                    required
                    value={findingClause}
                    onChange={e => setFindingClause(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Accountable Department</label>
                  <input
                    type="text"
                    required
                    value={findingDept}
                    onChange={e => setFindingDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Non-Conformity Description</label>
                <textarea
                  rows={2}
                  required
                  value={findingDescription}
                  onChange={e => setFindingDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Root Cause Analysis (5-Whys Statement)
                </label>
                <textarea
                  rows={2}
                  required
                  value={findingRootCause}
                  onChange={e => setFindingRootCause(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Corrective Action (Immediate)</label>
                  <input
                    type="text"
                    required
                    value={findingCorrective}
                    onChange={e => setFindingCorrective(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Preventive Action (Long-Term)</label>
                  <input
                    type="text"
                    required
                    value={findingPreventive}
                    onChange={e => setFindingPreventive(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Remediation Owner</label>
                  <input
                    type="text"
                    required
                    value={findingOwner}
                    onChange={e => setFindingOwner(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    required
                    value={findingTargetDate}
                    onChange={e => setFindingTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold shadow-lg shadow-rose-900/30"
                >
                  Dispatch Finding to CAPA Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4-Step Methodology Guide & Top 10 Lead Auditor Tips Modal */}
      {showMethodologyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-6 text-slate-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 flex items-center space-x-1">
                    <Award className="w-3 h-3 mr-1" />
                    <span>Practitioner Guide & Inspection Framework</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Accredited Audit Aligned
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {CHECKLIST_METHODOLOGY_GUIDE.frameworkTitle}
                </h2>
                <p className="text-xs text-slate-400">
                  {CHECKLIST_METHODOLOGY_GUIDE.authoritativeScope}
                </p>
              </div>

              <button
                onClick={() => setShowMethodologyModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Core Steps */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Target className="w-4 h-4" />
                <span>4-Step Compliance Methodology</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CHECKLIST_METHODOLOGY_GUIDE.coreSteps.map(step => (
                  <div key={step.stepNumber} className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80 space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-300 font-mono text-xs font-bold flex items-center justify-center border border-sky-500/30">
                        {step.stepNumber}
                      </span>
                      <h4 className="text-xs font-bold text-white">
                        {step.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {step.description}
                    </p>
                    <div className="text-[11px] text-amber-300 font-medium pt-1">
                      <span className="text-slate-400">Output: </span>{step.keyDeliverable}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Implementation & Remediation Phases */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Layers className="w-4 h-4" />
                <span>Structured Implementation Phases</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CHECKLIST_METHODOLOGY_GUIDE.implementationPhases.map((phase, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{phase.phase}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {phase.timeframe}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300">
                      <span className="text-slate-400">Focus: </span>{phase.focus}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      <span className="text-slate-500">Domains Covered: </span>{phase.domainsCovered.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lead Auditor Traps & Inspection Insights */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Top 10 Lead Auditor Inspection Traps & Guidance</span>
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                {CHECKLIST_METHODOLOGY_GUIDE.supervisoryInspectionTraps.map((trap, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/30 flex items-start space-x-2.5">
                    <span className="text-xs font-mono font-bold text-rose-400 shrink-0 mt-0.5">
                      #{idx + 1}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {trap}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowMethodologyModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                Close Practitioner Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
