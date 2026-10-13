import React, { useState, useEffect, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import { PageContainer } from '../layout/PageContainer';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  BarChart3,
  Target,
  TrendingUp,
  FolderKanban,
  Sparkles,
  ExternalLink,
  X
} from 'lucide-react';

export interface ComplianceProjectPlan {
  id: string;
  name: string;
  type: 'Audit Remediation Plan' | 'Compliance Project';
  framework: string;
  leadOwner: string;
  targetDate: string;
  description: string;
  status: 'In Progress' | 'Under Review' | 'Completed' | 'Planning';
}

export interface TaskItem {
  id: string;
  title: string;
  projectId: string;
  category: 'Policy Review' | 'Technical Remediation' | 'Evidence Collection' | 'Audit Preparation' | 'CAPA Action';
  assignee: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Completed';
  notes?: string;
}

const DEFAULT_PROJECT_PLANS: ComplianceProjectPlan[] = [
  {
    id: 'plan_iso27001',
    name: 'ISO 27001:2022 Stage 2 Audit Remediation Plan',
    type: 'Audit Remediation Plan',
    framework: 'ISO/IEC 27001:2022',
    leadOwner: 'CISO / Lead Auditor',
    targetDate: '2026-10-15',
    description: 'Remediate minor non-conformities across Annex A controls prior to Stage 2 external certification audit.',
    status: 'In Progress'
  },
  {
    id: 'plan_mas_trm',
    name: 'MAS TRM 2024 Regulatory Gap Closure Plan',
    type: 'Compliance Project',
    framework: 'MAS TRM Guidelines',
    leadOwner: 'DevOps & Cloud Lead',
    targetDate: '2026-11-30',
    description: 'Implement MFA enforcement, telemetry for privileged access, and penetration testing remediation.',
    status: 'In Progress'
  },
  {
    id: 'plan_soc2',
    name: 'SOC 2 Type II Annual Remediation Plan',
    type: 'Audit Remediation Plan',
    framework: 'SOC 2 Trust Criteria',
    leadOwner: 'Security Compliance Manager',
    targetDate: '2026-09-30',
    description: 'Address auditor sample exceptions, vendor risk reviews, and quarterly access attestation reviews.',
    status: 'In Progress'
  },
  {
    id: 'plan_bcp',
    name: 'Disaster Recovery & BCP Verification Plan',
    type: 'Compliance Project',
    framework: 'ISO 22301 / Clause 8.2',
    leadOwner: 'Infrastructure Lead',
    targetDate: '2026-11-15',
    description: 'Execute annual multi-region failover drill, crisis communication dry-run, and backup restoration verification.',
    status: 'In Progress'
  }
];

const DEFAULT_TASKS: TaskItem[] = [
  {
    id: 'tsk_001',
    projectId: 'plan_mas_trm',
    title: 'Roll out WebAuthn / FIDO2 security keys for AWS Console root/IAM accounts',
    category: 'Technical Remediation',
    assignee: 'DevOps Lead',
    dueDate: '2026-09-15',
    priority: 'High',
    status: 'Completed',
    notes: 'Enforced via IAM conditional policies; hardware keys provisioned to all sysadmins.'
  },
  {
    id: 'tsk_002',
    projectId: 'plan_iso27001',
    title: 'Update Statement of Applicability (SoA) justifications for Clause 6.1.3',
    category: 'Policy Review',
    assignee: 'Security Lead',
    dueDate: '2026-10-01',
    priority: 'High',
    status: 'In Progress',
    notes: 'Revising Annex A.8.1 and A.8.2 justifications to reflect cloud container architecture.'
  },
  {
    id: 'tsk_003',
    projectId: 'plan_iso27001',
    title: 'Collect Q3 employee security awareness training completion records',
    category: 'Evidence Collection',
    assignee: 'HR Operations',
    dueDate: '2026-09-30',
    priority: 'Medium',
    status: 'Completed',
    notes: '98.4% workforce completion verified with LMS certificates.'
  },
  {
    id: 'tsk_004',
    projectId: 'plan_bcp',
    title: 'Execute annual table-top simulation for Disaster Recovery & BCP',
    category: 'Audit Preparation',
    assignee: 'CISO / Lead Auditor',
    dueDate: '2026-11-15',
    priority: 'High',
    status: 'To Do',
    notes: 'Simulate primary AWS AP-Southeast region outage and DNS failover scenario.'
  },
  {
    id: 'tsk_005',
    projectId: 'plan_mas_trm',
    title: 'Conduct annual penetration test on public SaaS API endpoints (MAS TRM 9.3)',
    category: 'Audit Preparation',
    assignee: 'Security Lead',
    dueDate: '2026-10-10',
    priority: 'High',
    status: 'In Progress',
    notes: 'CREST-certified testing vendor engaged; statement of work signed.'
  },
  {
    id: 'tsk_006',
    projectId: 'plan_iso27001',
    title: 'Remediate Cryptographic Key Rotation finding FND-002 from internal audit',
    category: 'CAPA Action',
    assignee: 'Cloud Architect',
    dueDate: '2026-09-25',
    priority: 'High',
    status: 'Completed',
    notes: 'Configured AWS KMS automated annual key rotation on production customer DBs.'
  },
  {
    id: 'tsk_007',
    projectId: 'plan_soc2',
    title: 'Execute quarterly user access recertification for production Kubernetes clusters',
    category: 'Audit Preparation',
    assignee: 'SecOps Team',
    dueDate: '2026-09-20',
    priority: 'High',
    status: 'Completed',
    notes: 'Revoked 4 dormant contractor service accounts.'
  },
  {
    id: 'tsk_008',
    projectId: 'plan_soc2',
    title: 'Gather continuous vulnerability scan reports with zero Critical CVEs for 90 days',
    category: 'Evidence Collection',
    assignee: 'SecOps Team',
    dueDate: '2026-09-28',
    priority: 'High',
    status: 'In Progress',
    notes: 'Trivy and AWS Inspector automated artifact reports generated.'
  },
  {
    id: 'tsk_009',
    projectId: 'plan_soc2',
    title: 'Update vendor SOC 2 report evaluations and subservice organization reviews',
    category: 'Policy Review',
    assignee: 'Procurement Lead',
    dueDate: '2026-10-05',
    priority: 'Medium',
    status: 'To Do',
    notes: 'Reviewing bridge letters for cloud CDN and transactional email providers.'
  },
  {
    id: 'tsk_010',
    projectId: 'plan_mas_trm',
    title: 'Deploy real-time alerts for privileged session anomalies across bastion hosts',
    category: 'Technical Remediation',
    assignee: 'DevOps Lead',
    dueDate: '2026-10-20',
    priority: 'High',
    status: 'To Do',
    notes: 'Integrating Teleport session audits with SIEM webhook alert pipeline.'
  },
  {
    id: 'tsk_011',
    projectId: 'plan_bcp',
    title: 'Validate automated database snapshot cross-region replica restoration',
    category: 'Technical Remediation',
    assignee: 'DBA Lead',
    dueDate: '2026-10-30',
    priority: 'High',
    status: 'Completed',
    notes: 'RTO measured at 14 minutes, well within 1 hour SLA requirement.'
  }
];

export const TasksModule: React.FC = () => {
  const { currentTenant } = useGRC();

  // Load plans & tasks from localStorage or defaults
  const [plans, setPlans] = useState<ComplianceProjectPlan[]>(() => {
    try {
      const saved = localStorage.getItem(`grc_task_plans_${currentTenant?.id || 'default'}`);
      return saved ? JSON.parse(saved) : DEFAULT_PROJECT_PLANS;
    } catch {
      return DEFAULT_PROJECT_PLANS;
    }
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(`grc_tasks_${currentTenant?.id || 'default'}`);
      return saved ? JSON.parse(saved) : DEFAULT_TASKS;
    } catch {
      return DEFAULT_TASKS;
    }
  });

  // Save to localStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem(`grc_task_plans_${currentTenant?.id || 'default'}`, JSON.stringify(plans));
    } catch (e) {
      console.error('Failed to save plans to localStorage', e);
    }
  }, [plans, currentTenant?.id]);

  useEffect(() => {
    try {
      localStorage.setItem(`grc_tasks_${currentTenant?.id || 'default'}`, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to localStorage', e);
    }
  }, [tasks, currentTenant?.id]);

  // Filters & State
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'All' | 'To Do' | 'In Progress' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);

  // New Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskProjectId, setTaskProjectId] = useState<string>(plans[0]?.id || 'plan_iso27001');
  const [taskCategory, setTaskCategory] = useState<TaskItem['category']>('Technical Remediation');
  const [taskAssignee, setTaskAssignee] = useState('DevOps Lead');
  const [taskDueDate, setTaskDueDate] = useState('2026-10-15');
  const [taskPriority, setTaskPriority] = useState<TaskItem['priority']>('High');
  const [taskNotes, setTaskNotes] = useState('');

  // New Plan Form State
  const [planName, setPlanName] = useState('');
  const [planType, setPlanType] = useState<ComplianceProjectPlan['type']>('Audit Remediation Plan');
  const [planFramework, setPlanFramework] = useState('ISO/IEC 27001:2022');
  const [planLeadOwner, setPlanLeadOwner] = useState('Compliance Lead');
  const [planTargetDate, setPlanTargetDate] = useState('2026-12-01');
  const [planDescription, setPlanDescription] = useState('');

  // Calculations for Overall Progress Bar
  const overallStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const toDo = tasks.filter(t => t.status === 'To Do').length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const inProgressRate = total > 0 ? Math.round((inProgress / total) * 100) : 0;
    const toDoRate = total > 0 ? Math.max(0, 100 - completionRate - inProgressRate) : 0;

    return {
      total,
      completed,
      inProgress,
      toDo,
      completionRate,
      inProgressRate,
      toDoRate
    };
  }, [tasks]);

  // Calculations per Project Plan
  const planStats = useMemo(() => {
    return plans.map(plan => {
      const planTasks = tasks.filter(t => t.projectId === plan.id);
      const total = planTasks.length;
      const completed = planTasks.filter(t => t.status === 'Completed').length;
      const inProgress = planTasks.filter(t => t.status === 'In Progress').length;
      const toDo = planTasks.filter(t => t.status === 'To Do').length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        ...plan,
        total,
        completed,
        inProgress,
        toDo,
        percentage
      };
    });
  }, [plans, tasks]);

  // Task Handlers
  const handleToggleStatus = (id: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const next: TaskItem['status'] =
            t.status === 'To Do' ? 'In Progress' : t.status === 'In Progress' ? 'Completed' : 'To Do';
          return { ...t, status: next };
        }
        return t;
      })
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask: TaskItem = {
      id: `tsk_${Date.now()}`,
      title: taskTitle.trim(),
      projectId: taskProjectId,
      category: taskCategory,
      assignee: taskAssignee.trim() || 'Unassigned',
      dueDate: taskDueDate,
      priority: taskPriority,
      status: 'To Do',
      notes: taskNotes.trim()
    };

    setTasks(prev => [newTask, ...prev]);
    setTaskTitle('');
    setTaskNotes('');
    setShowAddTaskModal(false);
  };

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) return;

    const newPlan: ComplianceProjectPlan = {
      id: `plan_${Date.now()}`,
      name: planName.trim(),
      type: planType,
      framework: planFramework.trim(),
      leadOwner: planLeadOwner.trim() || 'Compliance Officer',
      targetDate: planTargetDate,
      description: planDescription.trim() || 'Continuous compliance remediation program.',
      status: 'In Progress'
    };

    setPlans(prev => [...prev, newPlan]);
    setPlanName('');
    setPlanDescription('');
    setShowAddPlanModal(false);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesProject = selectedProjectId === 'all' || task.projectId === selectedProjectId;
      const matchesStatus = filterStatus === 'All' || task.status === filterStatus;
      const matchesSearch =
        !searchQuery.trim() ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesProject && matchesStatus && matchesSearch;
    });
  }, [tasks, selectedProjectId, filterStatus, searchQuery]);

  // Selected project details
  const currentSelectedPlan = plans.find(p => p.id === selectedProjectId);

  return (
    <PageContainer id="tasks-module">
      {/* 1. Module Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 px-2 py-0.5 rounded bg-sky-950 border border-sky-800">
                Action Items & Continuous Compliance
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentTenant ? currentTenant.name : 'All Scopes'} • {plans.length} Active Plans
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">Compliance Tasks & Audit Remediation Board</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Track operational milestones, remediation actions, control implementation tasks, and recurring compliance check-ins across active audit plans.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={() => setShowAddPlanModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 transition-all shadow-xs"
            >
              <FolderKanban className="w-3.5 h-3.5 text-sky-400" />
              <span>New Plan</span>
            </button>
            <button
              onClick={() => setShowAddTaskModal(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-900/30 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Create Action Item</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. OVERALL COMPLIANCE & AUDIT REMEDIATION PROGRESS BAR */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg relative overflow-hidden">
        {/* Background glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                Overall Compliance Projects & Audit Remediation Progress
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Aggregated completion rate across all active remediation plans, non-conformity closures, and continuous control implementations.
            </p>
          </div>

          {/* Right: Big Numeric Completion Badge */}
          <div className="flex items-center space-x-3 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 shrink-0">
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-emerald-400 leading-none block">
                {overallStats.completionRate}%
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Completed</span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-left">
              <div className="flex items-center space-x-1 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{overallStats.completed} of {overallStats.total}</span>
              </div>
              <span className="text-[10px] text-slate-400 block font-mono">
                {overallStats.inProgress} in progress • {overallStats.toDo} pending
              </span>
            </div>
          </div>
        </div>

        {/* PRIMARY VISUAL PROGRESS BAR */}
        <div className="space-y-2">
          {/* Main Visual Progress Bar Track */}
          <div
            className="w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800 flex shadow-inner relative"
            role="progressbar"
            aria-valuenow={overallStats.completionRate}
            aria-valuemin={0}
            aria-valuemax={100}
            title={`Overall Progress: ${overallStats.completionRate}% Completed (${overallStats.completed}/${overallStats.total} Tasks)`}
          >
            {/* Completed Segment (Emerald gradient with subtle sheen) */}
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 transition-all duration-500 relative"
              style={{ width: `${overallStats.completionRate}%` }}
            >
              <div className="absolute inset-0 bg-white/10 opacity-30" />
            </div>

            {/* In Progress Segment (Amber) */}
            <div
              className="h-full bg-amber-500/80 transition-all duration-500 relative"
              style={{ width: `${overallStats.inProgressRate}%` }}
            >
              <div className="absolute inset-0 bg-white/10 opacity-20" />
            </div>

            {/* To Do Segment (Slate) is remaining empty track */}
          </div>

          {/* Progress Bar Micro Indicators / Legend */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-slate-300 font-semibold">{overallStats.completed} Completed</span>
                <span className="text-slate-500 font-mono">({overallStats.completionRate}%)</span>
              </span>
              <span className="flex items-center space-x-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                <span className="text-slate-300 font-semibold">{overallStats.inProgress} In Progress</span>
                <span className="text-slate-500 font-mono">({overallStats.inProgressRate}%)</span>
              </span>
              <span className="flex items-center space-x-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700 shrink-0" />
                <span className="text-slate-300 font-semibold">{overallStats.toDo} Pending / To Do</span>
                <span className="text-slate-500 font-mono">({overallStats.toDoRate}%)</span>
              </span>
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
              <span className="inline-flex items-center space-x-1 text-sky-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Health: {overallStats.completionRate >= 70 ? 'Optimal' : overallStats.completionRate >= 40 ? 'Moderate' : 'Needs Action'}</span>
              </span>
              <span>•</span>
              <span>Target Cadence: Q3/Q4 2026</span>
            </div>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Actions</span>
            <span className="text-lg font-black font-mono text-white mt-0.5 block">{overallStats.total} Tasks</span>
            <span className="text-[10px] text-slate-500 font-mono">Across {plans.length} Audit Plans</span>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">Completed</span>
            <span className="text-lg font-black font-mono text-emerald-400 mt-0.5 block">
              {overallStats.completed} <span className="text-xs font-normal text-slate-400">({overallStats.completionRate}%)</span>
            </span>
            <span className="text-[10px] text-emerald-500/80 font-mono">Verified & Implemented</span>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
            <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">Under Remediation</span>
            <span className="text-lg font-black font-mono text-amber-400 mt-0.5 block">
              {overallStats.inProgress} <span className="text-xs font-normal text-slate-400">({overallStats.inProgressRate}%)</span>
            </span>
            <span className="text-[10px] text-amber-500/80 font-mono">In Active Execution</span>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
            <span className="text-[10px] uppercase font-bold text-sky-400 block tracking-wider">Active Plans</span>
            <span className="text-lg font-black font-mono text-sky-300 mt-0.5 block">{plans.length} Plans</span>
            <span className="text-[10px] text-slate-400 font-mono">ISO 27001, MAS, SOC 2, BCP</span>
          </div>
        </div>
      </div>

      {/* 3. AUDIT REMEDIATION PLANS & COMPLIANCE PROJECTS BREAKDOWN CARDS WITH DEDICATED PROGRESS BARS */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Compliance Projects & Remediation Plans Breakdown
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Select a plan to filter tasks or view completion status per audit framework.
          </span>
        </div>

        {/* Grid of Project Cards with Visual Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* "All Plans" card */}
          <button
            type="button"
            onClick={() => setSelectedProjectId('all')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              selectedProjectId === 'all'
                ? 'bg-slate-800/90 border-sky-500 shadow-md ring-1 ring-sky-500/30'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800/60">
                  Global Overview
                </span>
                <span className="text-xs font-mono font-bold text-slate-300">
                  {overallStats.completed}/{overallStats.total}
                </span>
              </div>
              <h3 className="text-xs font-bold text-white mb-1">All Compliance Projects</h3>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                Unified portfolio of compliance initiatives, external audit remediation, and policy reviews.
              </p>
            </div>

            {/* Visual Progress Bar for All Projects */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-slate-400">Overall Progress</span>
                <span className="font-bold text-emerald-400">{overallStats.completionRate}%</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-sky-400 transition-all duration-300"
                  style={{ width: `${overallStats.completionRate}%` }}
                />
              </div>
            </div>
          </button>

          {/* Individual Project Plan Cards */}
          {planStats.map(plan => {
            const isSelected = selectedProjectId === plan.id;
            const isDone = plan.percentage === 100;
            const isHighProgress = plan.percentage >= 70;

            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedProjectId(plan.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-sky-500 shadow-md ring-1 ring-sky-500/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        plan.type === 'Audit Remediation Plan'
                          ? 'bg-rose-950/60 text-rose-300 border-rose-800/50'
                          : 'bg-indigo-950/60 text-indigo-300 border-indigo-800/50'
                      }`}
                    >
                      {plan.type}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-300">
                      {plan.completed}/{plan.total}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white mb-1 line-clamp-1" title={plan.name}>
                    {plan.name}
                  </h3>
                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mb-1">
                    <span className="text-sky-400 font-semibold">{plan.framework}</span>
                    <span>•</span>
                    <span>Due: {plan.targetDate}</span>
                  </div>
                  <p className="text-[10.5px] text-slate-400 line-clamp-2" title={plan.description}>
                    {plan.description}
                  </p>
                </div>

                {/* DEDICATED VISUAL PROGRESS BAR FOR THIS PLAN */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] font-mono">
                    <span className="text-slate-400">Plan Progress</span>
                    <span
                      className={`font-bold ${
                        isDone
                          ? 'text-emerald-400'
                          : isHighProgress
                          ? 'text-sky-400'
                          : plan.percentage > 0
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {plan.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isDone
                          ? 'bg-emerald-400'
                          : isHighProgress
                          ? 'bg-gradient-to-r from-sky-500 to-emerald-400'
                          : plan.percentage > 0
                          ? 'bg-gradient-to-r from-amber-500 to-sky-400'
                          : 'bg-slate-700'
                      }`}
                      style={{ width: `${plan.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9.5px] text-slate-500 font-mono">
                    <span>{plan.inProgress} in progress</span>
                    <span>{plan.toDo} pending</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. TASK CONTROLS & FILTER BAR */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['All', 'To Do', 'In Progress', 'Completed'] as const).map(st => {
            const count =
              st === 'All'
                ? tasks.filter(t => selectedProjectId === 'all' || t.projectId === selectedProjectId).length
                : tasks.filter(
                    t => (selectedProjectId === 'all' || t.projectId === selectedProjectId) && t.status === st
                  ).length;

            return (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 shrink-0 ${
                  filterStatus === st
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{st}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    filterStatus === st ? 'bg-sky-700 text-white' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Project indicator badge & Search */}
        <div className="flex items-center space-x-2.5">
          {selectedProjectId !== 'all' && (
            <div className="flex items-center space-x-1 text-xs text-sky-400 bg-sky-950/80 px-2.5 py-1 rounded-lg border border-sky-800 shrink-0">
              <span className="font-semibold truncate max-w-[140px] sm:max-w-[200px]">
                {currentSelectedPlan?.name}
              </span>
              <button
                onClick={() => setSelectedProjectId('all')}
                className="hover:text-white ml-1 p-0.5"
                title="Clear project filter"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search actions, owners..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* 5. TASKS LIST */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">No tasks match your active filters</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try selecting "All Plans", clearing the search bar, or creating a new action item for this compliance program.
            </p>
            <button
              onClick={() => {
                setSelectedProjectId('all');
                setFilterStatus('All');
                setSearchQuery('');
              }}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredTasks.map(t => {
            const plan = plans.find(p => p.id === t.projectId);

            return (
              <div
                key={t.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-700 transition-all shadow-sm group"
              >
                <div className="flex items-start space-x-3">
                  {/* Status Toggle Checkbox */}
                  <button
                    onClick={() => handleToggleStatus(t.id)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
                      t.status === 'Completed'
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs'
                        : t.status === 'In Progress'
                        ? 'bg-amber-600/20 border-amber-500/60 text-amber-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                    title={`Click to advance: currently ${t.status}`}
                  >
                    {t.status === 'Completed' && <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />}
                    {t.status === 'In Progress' && <Clock className="w-4 h-4 stroke-[2.5]" />}
                  </button>

                  {/* Task Content */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h3
                        className={`text-xs font-bold ${
                          t.status === 'Completed' ? 'text-slate-400 line-through' : 'text-white'
                        }`}
                      >
                        {t.title}
                      </h3>
                      {plan && (
                        <span
                          onClick={() => setSelectedProjectId(plan.id)}
                          className="text-[9.5px] font-mono font-semibold px-2 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800/60 hover:border-sky-600 cursor-pointer transition-colors"
                          title={`Part of ${plan.name} (${plan.framework})`}
                        >
                          {plan.framework}
                        </span>
                      )}
                    </div>

                    {t.notes && (
                      <p className="text-[11px] text-slate-400 line-clamp-1 italic">{t.notes}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {t.category}
                      </span>
                      <span>•</span>
                      <span>
                        Owner: <strong className="text-slate-200">{t.assignee}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>Due: {t.dueDate}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Priority & Actions */}
                <div className="flex items-center space-x-3 shrink-0">
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                      t.priority === 'High'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : t.priority === 'Medium'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {t.priority} Priority
                  </span>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                      t.status === 'Completed'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : t.status === 'In Progress'
                        ? 'bg-amber-500/15 text-amber-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {t.status}
                  </span>

                  <button
                    onClick={() => handleDeleteTask(t.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete action item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 6. MODAL: CREATE ACTION ITEM */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Plus className="w-4 h-4 text-sky-400" />
                <h3 className="text-base font-bold text-white">Create Compliance Action Item</h3>
              </div>
              <button onClick={() => setShowAddTaskModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  placeholder="e.g. Conduct annual penetration test on public APIs"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Target Project / Remediation Plan Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Compliance Project / Remediation Plan
                </label>
                <select
                  value={taskProjectId}
                  onChange={e => setTaskProjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.framework}] {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={taskCategory}
                    onChange={e => setTaskCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Technical Remediation">Technical Remediation</option>
                    <option value="Policy Review">Policy Review</option>
                    <option value="Evidence Collection">Evidence Collection</option>
                    <option value="Audit Preparation">Audit Preparation</option>
                    <option value="CAPA Action">CAPA Action</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={e => setTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Assignee</label>
                  <input
                    type="text"
                    required
                    value={taskAssignee}
                    onChange={e => setTaskAssignee(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={taskDueDate}
                    onChange={e => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Implementation Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={taskNotes}
                  onChange={e => setTaskNotes(e.target.value)}
                  placeholder="Context, specific control requirement, or verification criteria..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: CREATE REMEDIATION PLAN / PROJECT */}
      {showAddPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FolderKanban className="w-4 h-4 text-sky-400" />
                <h3 className="text-base font-bold text-white">Create Compliance Project / Audit Remediation Plan</h3>
              </div>
              <button onClick={() => setShowAddPlanModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPlan} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Plan / Project Name</label>
                <input
                  type="text"
                  required
                  value={planName}
                  onChange={e => setPlanName(e.target.value)}
                  placeholder="e.g. ISO 27001 Surveillance Audit Remediation"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Plan Type</label>
                  <select
                    value={planType}
                    onChange={e => setPlanType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Audit Remediation Plan">Audit Remediation Plan</option>
                    <option value="Compliance Project">Compliance Project</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Framework</label>
                  <input
                    type="text"
                    required
                    value={planFramework}
                    onChange={e => setPlanFramework(e.target.value)}
                    placeholder="e.g. ISO/IEC 27001:2022"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Lead Owner</label>
                  <input
                    type="text"
                    required
                    value={planLeadOwner}
                    onChange={e => setPlanLeadOwner(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    required
                    value={planTargetDate}
                    onChange={e => setPlanTargetDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description & Scope</label>
                <textarea
                  rows={2}
                  value={planDescription}
                  onChange={e => setPlanDescription(e.target.value)}
                  placeholder="Outline the remediation scope, external auditor findings addressed, or regulatory milestones..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddPlanModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

