import React, { useState, useEffect, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import { FindingCAPARecord } from '../../types';
import { PageContainer } from '../layout/PageContainer';
import { safeConfirm } from '../../utils/safeConfirm';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  FileCheck2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Building,
  CheckSquare,
  FileText,
  Table as TableIcon,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
  UserCheck,
  Hash,
  AlertOctagon,
  ExternalLink,
  Kanban
} from 'lucide-react';
import { CapaWorkflowModal } from '../capa/CapaWorkflowModal';
import { CapaAuditCertificateModal } from '../capa/CapaAuditCertificateModal';

export const FindingsCAPAModule: React.FC = () => {
  const {
    findings,
    addFinding,
    updateFinding,
    deleteFinding,
    currentTenant,
    currentUser,
    currentRole,
    findingFilterQuery,
    setFindingFilterQuery,
    setActiveModule
  } = useGRC();

  const isAuditor =
    currentRole === 'SUPER_ADMIN' ||
    currentRole === 'PLATFORM_AUDITOR' ||
    currentRole === 'INTERNAL_AUDITOR';

  const tenantFindings = findings.filter(f => f.tenantId === currentTenant?.id);

  // View Modes: 'register' (Table/Cards) | 'pipeline' (5-stage Kanban) | 'verification_queue'
  const [activeTab, setActiveTab] = useState<'register' | 'pipeline' | 'verification_queue'>('pipeline');
  const [registerSubView, setRegisterSubView] = useState<'table' | 'cards'>('table');

  const [searchTerm, setSearchTerm] = useState(findingFilterQuery || '');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [expandedFindingIds, setExpandedFindingIds] = useState<Record<string, boolean>>({});

  // Active Modals
  const [workflowModalFinding, setWorkflowModalFinding] = useState<FindingCAPARecord | null>(null);
  const [certificateFinding, setCertificateFinding] = useState<FindingCAPARecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFinding, setEditingFinding] = useState<FindingCAPARecord | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedFindingIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    if (findingFilterQuery) {
      setSearchTerm(findingFilterQuery);
      setActiveTab('register');
    }
  }, [findingFilterQuery]);

  // Form State for Quick Raise Modal
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState<FindingCAPARecord['severity']>('Minor Non-Conformity');
  const [source, setSource] = useState<FindingCAPARecord['source']>('INTERNAL_AUDIT');
  const [clauseOrControl, setClauseOrControl] = useState('A.8.8 Management of technical vulnerabilities');
  const [department, setDepartment] = useState('Software Engineering & DevOps');
  const [description, setDescription] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [preventiveAction, setPreventiveAction] = useState('');
  const [owner, setOwner] = useState('DevOps Lead');
  const [targetDate, setTargetDate] = useState('2026-10-15');

  const openAddModal = () => {
    setEditingFinding(null);
    setTitle('');
    setSeverity('Minor Non-Conformity');
    setSource('INTERNAL_AUDIT');
    setClauseOrControl('A.8.8 Management of technical vulnerabilities');
    setDepartment('Software Engineering & DevOps');
    setDescription('');
    setRootCause('');
    setCorrectiveAction('');
    setPreventiveAction('');
    setOwner('DevOps Lead');
    setTargetDate('2026-10-15');
    setShowAddModal(true);
  };

  const openEditModal = (f: FindingCAPARecord) => {
    setEditingFinding(f);
    setTitle(f.title);
    setSeverity(f.severity);
    setSource(f.source);
    setClauseOrControl(f.clauseOrControl);
    setDepartment(f.department);
    setDescription(f.description);
    setRootCause(f.rootCauseAnalysis.rootCauseStatement);
    setCorrectiveAction(f.capaPlan.correctiveAction);
    setPreventiveAction(f.capaPlan.preventiveAction);
    setOwner(f.capaPlan.owner);
    setTargetDate(f.capaPlan.targetDate);
    setShowAddModal(true);
  };

  const handleSaveQuickForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFinding) {
      updateFinding(editingFinding.id, {
        title,
        severity,
        source,
        clauseOrControl,
        department,
        description,
        rootCauseAnalysis: {
          ...editingFinding.rootCauseAnalysis,
          methodology: '5_WHYS',
          rootCauseStatement: rootCause
        },
        capaPlan: {
          ...editingFinding.capaPlan,
          correctiveAction,
          preventiveAction,
          owner,
          targetDate,
          evidenceRequired: editingFinding.capaPlan.evidenceRequired || 'Documented verification evidence'
        }
      });
    } else {
      addFinding({
        title,
        severity,
        source,
        clauseOrControl,
        department,
        description,
        rootCauseAnalysis: {
          methodology: '5_WHYS',
          fiveWhysChain: [
            { whyNumber: 1, question: `Why did ${title.toLowerCase()} occur?`, answer: description, category: 'Process' },
            { whyNumber: 2, question: 'Why was the standard control bypassed?', answer: 'Operational workflow omission', category: 'Process' },
            { whyNumber: 3, question: 'Why did tooling or monitoring fail to alert?', answer: 'Automated notification gap', category: 'Technology' },
            { whyNumber: 4, question: 'Why was there no supervisory review?', answer: 'Lack of verified handoff protocol', category: 'Governance' },
            { whyNumber: 5, question: 'Root Cause: Systemic design gap', answer: rootCause || 'Root cause identified', category: 'Governance' }
          ],
          rootCauseStatement: rootCause || 'Root cause analysis required.'
        },
        capaPlan: {
          correctiveAction,
          preventiveAction,
          owner,
          targetDate,
          evidenceRequired: 'Remediation log and objective retest artifacts'
        },
        status: 'Open'
      });
    }
    setShowAddModal(false);
  };

  // Safe Audit Closure: Opens the dedicated CAPA workflow at Stage 5 to enforce the Independent Audit Validation record!
  const handleTriggerAuditValidation = (f: FindingCAPARecord) => {
    setWorkflowModalFinding(f);
  };

  // Filtered Findings
  const filteredFindings = useMemo(() => {
    return tenantFindings.filter(f => {
      const matchesSearch =
        f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.findingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.clauseOrControl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.capaPlan.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSev = severityFilter === 'All' || f.severity === severityFilter;
      const matchesStatus = statusFilter === 'All' || f.status === statusFilter;
      const matchesDept = departmentFilter === 'All' || f.department === departmentFilter;

      return matchesSearch && matchesSev && matchesStatus && matchesDept;
    });
  }, [tenantFindings, searchTerm, severityFilter, statusFilter, departmentFilter]);

  // Unique departments for filter
  const departments = useMemo(() => {
    const set = new Set(tenantFindings.map(f => f.department));
    return Array.from(set).filter(Boolean);
  }, [tenantFindings]);

  // Metrics
  const metrics = useMemo(() => {
    const total = tenantFindings.length;
    const major = tenantFindings.filter(f => f.severity === 'Major Non-Conformity').length;
    const minor = tenantFindings.filter(f => f.severity === 'Minor Non-Conformity').length;
    const inProgress = tenantFindings.filter(
      f => f.status === 'Open' || f.status === 'Root Cause Defined' || f.status === 'CAPA Submitted'
    ).length;
    const verificationPending = tenantFindings.filter(f => f.status === 'Verification Pending').length;
    const closed = tenantFindings.filter(f => f.status === 'Closed Verified').length;
    const closureRate = total > 0 ? Math.round((closed / total) * 100) : 100;

    return { total, major, minor, inProgress, verificationPending, closed, closureRate };
  }, [tenantFindings]);

  const getSeverityBadge = (sev: FindingCAPARecord['severity']) => {
    switch (sev) {
      case 'Major Non-Conformity':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Minor Non-Conformity':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Observation':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const getStatusBadge = (status: FindingCAPARecord['status']) => {
    switch (status) {
      case 'Closed Verified':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Open':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Verification Pending':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse';
      case 'CAPA Submitted':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Root Cause Defined':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  return (
    <PageContainer id="findings-capa-module">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/50 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/80 flex items-center space-x-1.5 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ISO/IEC 27001:2022 CLAUSE 10.2 & ISO 19011</span>
              </span>
              <span className="text-xs text-slate-400">Tenant: <strong className="text-slate-200">{currentTenant?.name}</strong></span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1 tracking-tight flex items-center space-x-2">
              <span>CAPA Workflow Engine & Independent Verification Center</span>
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Enforce end-to-end corrective action lifecycle management: link audit findings to recursive 5-Whys root cause analysis, commit dual-track preventive action plans, and track operating effectiveness.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setActiveModule('audit_reporting')}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs shadow-md transition cursor-pointer"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Audit Reporting</span>
            </button>

            <button
              onClick={openAddModal}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Raise Audit Finding</span>
            </button>
          </div>
        </div>

        {/* Regulatory Segregation of Duties Invariant Callout */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/30 flex items-start space-x-3 text-xs text-slate-300">
          <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-emerald-300">
              Regulatory Invariant Enforced: Strict Zero Self-Approval Mandate
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Pursuant to ISO 19011:2018 §4(e) & ISO 27001 Clause 10.2, auditees and department action owners are strictly prevented from self-closing findings. A finding cannot transition to <strong>Closed Verified</strong> until an independent auditor logs an objective <strong>Test of Operating Effectiveness (TOE)</strong> with sampling methodology, observations, and verifiable digital signature seal.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Metrics Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 block font-medium">Total Findings</span>
          <div className="text-xl font-bold text-white font-mono">{metrics.total}</div>
          <span className="text-[10px] text-slate-500">Across all audits</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-rose-500/20 space-y-1">
          <span className="text-[11px] text-rose-400 block font-medium">Major Non-Conformities</span>
          <div className="text-xl font-bold text-rose-300 font-mono">{metrics.major}</div>
          <span className="text-[10px] text-slate-500">High regulatory impact</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/20 space-y-1">
          <span className="text-[11px] text-amber-400 block font-medium">Minor NCs & OFIs</span>
          <div className="text-xl font-bold text-amber-300 font-mono">{metrics.minor}</div>
          <span className="text-[10px] text-slate-500">Procedural omissions</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-sky-500/20 space-y-1">
          <span className="text-[11px] text-sky-400 block font-medium">In Remediation</span>
          <div className="text-xl font-bold text-sky-300 font-mono">{metrics.inProgress}</div>
          <span className="text-[10px] text-slate-500">RCA & CAPA committed</span>
        </div>

        <button
          onClick={() => {
            setActiveTab('verification_queue');
            setStatusFilter('Verification Pending');
          }}
          className={`p-3.5 rounded-xl border text-left cursor-pointer transition space-y-1 ${
            metrics.verificationPending > 0
              ? 'bg-amber-950/20 border-amber-500/40 hover:bg-amber-950/30'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-amber-300 font-medium">Awaiting Audit Retest</span>
            {metrics.verificationPending > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono">{metrics.verificationPending}</div>
          <span className="text-[10px] text-amber-300/70 font-semibold underline">Independent sign-off queue →</span>
        </button>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-emerald-400 font-medium">Closed & Attested</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-300 font-mono">{metrics.closed}</div>
          <span className="text-[10px] text-emerald-400 font-mono">{metrics.closureRate}% closure rate</span>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setActiveTab('pipeline');
              setStatusFilter('All');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'pipeline'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>CAPA Workflow Pipeline</span>
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'register'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Findings & CAPA Register</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('verification_queue');
              setStatusFilter('Verification Pending');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'verification_queue'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-950'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Independent Audit Queue</span>
            {metrics.verificationPending > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold font-mono">
                {metrics.verificationPending}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'register' && (
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setRegisterSubView('table')}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                registerSubView === 'table' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRegisterSubView('cards')}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                registerSubView === 'cards' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by finding code, title, clause, root cause, or owner..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 text-[11px] uppercase font-bold">Severity:</span>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="All">All Severities</option>
              <option value="Major Non-Conformity">Major NC</option>
              <option value="Minor Non-Conformity">Minor NC</option>
              <option value="Observation">Observation</option>
              <option value="Opportunity for Improvement">OFI</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 text-[11px] uppercase font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Root Cause Defined">Root Cause Defined</option>
              <option value="CAPA Submitted">CAPA Submitted</option>
              <option value="Verification Pending">Verification Pending</option>
              <option value="Closed Verified">Closed Verified</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 text-[11px] uppercase font-bold">Dept:</span>
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer max-w-[160px]"
            >
              <option value="All">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: CAPA WORKFLOW PIPELINE (LIFECYCLE KANBAN) */}
      {/* ========================================================================= */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {[
            {
              id: 'lane-intake',
              title: '1. Finding Intake',
              desc: 'Triaged & Documented',
              count: tenantFindings.filter(f => f.status === 'Open').length,
              statusMatch: ['Open'],
              accent: 'border-rose-500/40 text-rose-300'
            },
            {
              id: 'lane-rca',
              title: '2. 5-Whys RCA',
              desc: 'Root Cause Identified',
              count: tenantFindings.filter(f => f.status === 'Root Cause Defined').length,
              statusMatch: ['Root Cause Defined'],
              accent: 'border-amber-500/40 text-amber-300'
            },
            {
              id: 'lane-capa',
              title: '3. CAPA Plan',
              desc: 'Actions Committed',
              count: tenantFindings.filter(f => f.status === 'CAPA Submitted').length,
              statusMatch: ['CAPA Submitted'],
              accent: 'border-blue-500/40 text-blue-300'
            },
            {
              id: 'lane-verification',
              title: '4. Audit Retest Pending',
              desc: 'Independent TOE Required',
              count: tenantFindings.filter(f => f.status === 'Verification Pending').length,
              statusMatch: ['Verification Pending'],
              accent: 'border-purple-500/40 text-purple-300'
            },
            {
              id: 'lane-closed',
              title: '5. Closed & Attested',
              desc: 'Clause 10.2 Sealed',
              count: tenantFindings.filter(f => f.status === 'Closed Verified').length,
              statusMatch: ['Closed Verified'],
              accent: 'border-emerald-500/40 text-emerald-300'
            }
          ].map(lane => {
            const laneFindings = filteredFindings.filter(f => lane.statusMatch.includes(f.status));

            return (
              <div
                key={lane.id}
                className="rounded-2xl bg-slate-900/70 border border-slate-800 p-3.5 flex flex-col min-h-[480px] space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div>
                    <h3 className={`font-bold text-xs ${lane.accent}`}>{lane.title}</h3>
                    <span className="text-[10px] text-slate-500">{lane.desc}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {laneFindings.length}
                  </span>
                </div>

                <div className="flex-1 space-y-2.5 overflow-y-auto">
                  {laneFindings.length === 0 ? (
                    <div className="text-center py-12 text-slate-600 text-[11px] italic">
                      No findings in this stage
                    </div>
                  ) : (
                    laneFindings.map(f => (
                      <div
                        key={f.id}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-2 shadow-sm group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/80">
                            {f.findingCode}
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${getSeverityBadge(f.severity)}`}>
                            {f.severity === 'Major Non-Conformity' ? 'Major NC' : f.severity === 'Minor Non-Conformity' ? 'Minor NC' : 'Observation'}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-200 line-clamp-2 leading-snug">
                          {f.title}
                        </h4>

                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          Ref: {f.clauseOrControl}
                        </div>

                        {/* 5-Whys summary if present */}
                        {f.rootCauseAnalysis.rootCauseStatement && (
                          <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 text-[10px] text-slate-300 space-y-0.5">
                            <span className="text-amber-400 font-bold block uppercase text-[9px]">Root Cause:</span>
                            <p className="line-clamp-2 italic text-slate-300 leading-tight">
                              "{f.rootCauseAnalysis.rootCauseStatement}"
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                          <span className="truncate max-w-[110px]">{f.capaPlan.owner}</span>
                          <span className="font-mono text-slate-400">{f.capaPlan.targetDate}</span>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 flex items-center justify-between gap-1.5 border-t border-slate-900">
                          <button
                            onClick={() => setWorkflowModalFinding(f)}
                            className="flex-1 py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[10px] flex items-center justify-center space-x-1 transition cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>CAPA Workflow</span>
                          </button>

                          {f.status === 'Verification Pending' && (
                            <button
                              onClick={() => handleTriggerAuditValidation(f)}
                              className="py-1 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[10px] border border-amber-500/40 flex items-center space-x-1 cursor-pointer"
                              title="Conduct Independent Audit Retest"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Verify</span>
                            </button>
                          )}

                          {f.status === 'Closed Verified' && (
                            <button
                              onClick={() => setCertificateFinding(f)}
                              className="py-1 px-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[10px] border border-emerald-500/40 cursor-pointer"
                              title="View Verification Certificate"
                            >
                              <Award className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: INDEPENDENT AUDIT VERIFICATION QUEUE */}
      {/* ========================================================================= */}
      {activeTab === 'verification_queue' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-1">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
              <UserCheck className="w-4 h-4" />
              <span>Independent Auditor Inspection & Re-Test Queue (Clause 10.2)</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              These findings have completed remediation and are awaiting an independent audit inspection. Department action owners cannot self-close these items. Click <strong>Conduct Independent Audit Retest</strong> to inspect objective evidence, run tests of operating effectiveness (TOE), and execute the formal sign-off.
            </p>
          </div>

          <div className="space-y-3">
            {tenantFindings.filter(f => f.status === 'Verification Pending').length === 0 ? (
              <div className="text-center py-12 p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">All Clear — Zero Pending Audit Re-Tests</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  There are currently no findings waiting for independent audit verification. All completed non-conformities have been formally attested.
                </p>
              </div>
            ) : (
              tenantFindings
                .filter(f => f.status === 'Verification Pending')
                .map(f => (
                  <div
                    key={f.id}
                    className="p-5 rounded-2xl bg-slate-900 border-2 border-amber-500/40 space-y-4 shadow-lg"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950 px-2.5 py-1 rounded-lg border border-sky-800">
                          {f.findingCode}
                        </span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${getSeverityBadge(f.severity)}`}>
                          {f.severity}
                        </span>
                        <span className="text-xs text-slate-400">
                          Department: <strong className="text-slate-200">{f.department}</strong>
                        </span>
                        <span className="text-xs text-slate-400">
                          Action Owner: <strong className="text-slate-200">{f.capaPlan.owner}</strong>
                        </span>
                      </div>

                      <button
                        onClick={() => handleTriggerAuditValidation(f)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center space-x-2 transition cursor-pointer shadow-lg shadow-emerald-950"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Conduct Independent Audit Retest</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white">{f.title}</h3>
                      <div className="text-xs text-sky-400 font-mono mt-0.5">
                        Requirement: {f.clauseOrControl}
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{f.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-amber-400">5-Whys Root Cause:</span>
                        <p className="text-slate-300 leading-relaxed italic">
                          "{f.rootCauseAnalysis.rootCauseStatement}"
                        </p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-emerald-400">Implemented CAPA Plan:</span>
                        <p className="text-slate-300 leading-relaxed">
                          {f.capaPlan.correctiveAction}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        <strong>Implementation Notes:</strong> {f.implementationNotes || 'Remediation completed by team lead.'}
                      </span>
                      <span>
                        <strong>Evidence Mandate:</strong> {f.capaPlan.evidenceRequired}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: FINDINGS & CAPA REGISTER (TABLE OR CARDS) */}
      {/* ========================================================================= */}
      {activeTab === 'register' && registerSubView === 'table' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 text-center font-bold w-10">#</th>
                <th className="py-3 px-4 text-left font-bold min-w-[200px]">Finding Code & Title</th>
                <th className="py-3 px-4 text-left font-bold min-w-[140px]">Standard Clause</th>
                <th className="py-3 px-4 text-center font-bold min-w-[110px]">Classification</th>
                <th className="py-3 px-4 text-left font-bold min-w-[130px]">Department</th>
                <th className="py-3 px-4 text-left font-bold min-w-[120px]">Action Owner</th>
                <th className="py-3 px-4 text-left font-bold min-w-[100px]">Due Date</th>
                <th className="py-3 px-4 text-center font-bold min-w-[130px]">Verification Status</th>
                <th className="py-3 px-4 text-center font-bold min-w-[140px]">Workflow Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredFindings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 px-4 text-center text-slate-400 text-xs">
                    No findings matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredFindings.map(finding => {
                  const isExpanded = !!expandedFindingIds[finding.id];
                  return (
                    <React.Fragment key={finding.id}>
                      <tr className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 text-center align-middle">
                          <button
                            onClick={() => toggleExpand(finding.id)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            title={isExpanded ? 'Collapse RCA & CAPA' : 'Expand RCA & CAPA'}
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-left align-middle">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800 shrink-0">
                              {finding.findingCode}
                            </span>
                            <span className="font-semibold text-white truncate max-w-[220px]" title={finding.title}>
                              {finding.title}
                            </span>
                            {finding.isExternalLocked && (
                              <span title="External Auditor Locked" className="inline-flex items-center shrink-0">
                                <Lock className="w-3 h-3 text-amber-400" />
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-left align-middle">
                          <div className="font-mono text-sky-400 text-xs truncate max-w-[180px]" title={finding.clauseOrControl}>
                            {finding.clauseOrControl}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center align-middle">
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(finding.severity)}`}>
                              {finding.severity}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-left align-middle text-slate-300 font-medium truncate max-w-[130px]">
                          {finding.department}
                        </td>

                        <td className="py-3 px-4 text-left align-middle text-slate-300 font-medium truncate max-w-[120px]">
                          {finding.capaPlan.owner}
                        </td>

                        <td className="py-3 px-4 text-left align-middle font-mono text-xs text-slate-300">
                          {finding.capaPlan.targetDate}
                        </td>

                        <td className="py-3 px-4 text-center align-middle">
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(finding.status)}`}>
                              {finding.status}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center align-middle">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => setWorkflowModalFinding(finding)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] flex items-center space-x-1 transition cursor-pointer"
                              title="Open CAPA Workflow Console"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>Workflow</span>
                            </button>

                            {finding.status === 'Closed Verified' && (
                              <button
                                onClick={() => setCertificateFinding(finding)}
                                className="p-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition cursor-pointer"
                                title="View Verification Certificate"
                              >
                                <Award className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => openEditModal(finding)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                              title="Edit Basic Finding"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                if (safeConfirm(`Delete finding ${finding.findingCode}?`)) {
                                  deleteFinding(finding.id);
                                }
                              }}
                              className="p-1 rounded bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                              title="Delete Finding"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded 5-Whys and CAPA details */}
                      {isExpanded && (
                        <tr className="bg-slate-950/70 border-b border-slate-800">
                          <td colSpan={9} className="py-3 px-4">
                            <div className="space-y-3 pl-8">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Deficiency Description:</span>
                                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{finding.description}</p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                                  <span className="font-bold text-amber-400 text-[10px] uppercase flex items-center space-x-1">
                                    <Hash className="w-3 h-3" />
                                    <span>5-Whys Root Cause Analysis</span>
                                  </span>
                                  <p className="text-slate-300 leading-relaxed">
                                    {finding.rootCauseAnalysis.rootCauseStatement || 'Root cause analysis pending.'}
                                  </p>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                                  <span className="font-bold text-emerald-400 text-[10px] uppercase flex items-center space-x-1">
                                    <FileCheck2 className="w-3 h-3" />
                                    <span>Corrective & Preventive Action (CAPA)</span>
                                  </span>
                                  <p className="text-slate-300 leading-relaxed">
                                    {finding.capaPlan.correctiveAction || 'Remediation plan in progress.'}
                                  </p>
                                </div>
                              </div>

                              {finding.independentAuditValidation && (
                                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-[11px] space-y-1">
                                  <span className="font-bold text-emerald-300 uppercase text-[10px] flex items-center space-x-1">
                                    <UserCheck className="w-3.5 h-3.5" />
                                    <span>Independent Audit Attestation Record:</span>
                                  </span>
                                  <p className="text-slate-300 italic">
                                    "{finding.independentAuditValidation.auditorObservations}"
                                  </p>
                                  <div className="font-mono text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-emerald-500/20">
                                    <span>Auditor: {finding.independentAuditValidation.auditorName} ({finding.independentAuditValidation.auditorRole})</span>
                                    <span className="text-emerald-400">TOE: {finding.independentAuditValidation.testOfOperatingEffectiveness}</span>
                                    <span>Ref: {finding.independentAuditValidation.auditProgramRef}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3B: REGISTER CARDS VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'register' && registerSubView === 'cards' && (
        <div className="space-y-4">
          {filteredFindings.map(finding => (
            <div
              key={finding.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                    {finding.findingCode}
                  </span>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${getSeverityBadge(finding.severity)}`}>
                    {finding.severity}
                  </span>
                  <span className="text-xs text-slate-400">
                    Source: <strong className="text-slate-300">{finding.source}</strong>
                  </span>
                  {finding.isExternalLocked && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800 flex items-center space-x-1">
                      <Lock className="w-3 h-3" />
                      <span>External Auditor Locked</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setWorkflowModalFinding(finding)}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Open CAPA Workflow</span>
                  </button>

                  {finding.status === 'Closed Verified' && (
                    <button
                      onClick={() => setCertificateFinding(finding)}
                      className="px-3 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 text-xs font-semibold border border-emerald-500/40 flex items-center space-x-1 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Certificate</span>
                    </button>
                  )}

                  <button
                    onClick={() => openEditModal(finding)}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (safeConfirm(`Delete finding ${finding.findingCode}?`)) {
                        deleteFinding(finding.id);
                      }
                    }}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">{finding.title}</h3>
                <div className="text-xs text-sky-400 font-mono mt-0.5">
                  Target Reference: {finding.clauseOrControl} • Department: {finding.department}
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{finding.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <span className="font-bold text-amber-400 text-[10px] uppercase">5-Whys Root Cause Analysis</span>
                  <p className="text-slate-300 leading-relaxed">
                    {finding.rootCauseAnalysis.rootCauseStatement || 'Root cause analysis pending.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <span className="font-bold text-emerald-400 text-[10px] uppercase">Corrective & Preventive Action (CAPA)</span>
                  <p className="text-slate-300 leading-relaxed">
                    {finding.capaPlan.correctiveAction || 'Remediation plan in progress.'}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
                <span>Assignee: <strong className="text-white">{finding.capaPlan.owner}</strong></span>
                <span>Target Closure Date: <strong className="text-white">{finding.capaPlan.targetDate}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: DEDICATED 5-STAGE CAPA WORKFLOW MODAL */}
      {/* ========================================================================= */}
      {workflowModalFinding && (
        <CapaWorkflowModal
          finding={workflowModalFinding}
          onClose={() => setWorkflowModalFinding(null)}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: FORMAL VERIFICATION CERTIFICATE MODAL */}
      {/* ========================================================================= */}
      {certificateFinding && (
        <CapaAuditCertificateModal
          finding={certificateFinding}
          companyName={currentTenant?.name || 'Skanda Enterprise'}
          onClose={() => setCertificateFinding(null)}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: QUICK RAISE / EDIT FINDING MODAL */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingFinding ? `Edit Finding — ${editingFinding.findingCode}` : 'Raise New Audit Finding / Non-Conformity'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuickForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Finding Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Inadequate endpoint encryption on developer staging containers"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white cursor-pointer"
                  >
                    <option value="Major Non-Conformity">Major Non-Conformity</option>
                    <option value="Minor Non-Conformity">Minor Non-Conformity</option>
                    <option value="Observation">Observation</option>
                    <option value="Opportunity for Improvement">Opportunity for Improvement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Audit Source</label>
                  <select
                    value={source}
                    onChange={e => setSource(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white cursor-pointer"
                  >
                    <option value="INTERNAL_AUDIT">Internal Audit</option>
                    <option value="EXTERNAL_AUDIT">External Audit (TÜV SÜD)</option>
                    <option value="MANAGEMENT_REVIEW">Management Review</option>
                    <option value="CONTINUOUS_MONITORING">Continuous Monitoring</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Standard Clause / Control</label>
                  <input
                    type="text"
                    required
                    value={clauseOrControl}
                    onChange={e => setClauseOrControl(e.target.value)}
                    placeholder="e.g. A.8.8 Management of technical vulnerabilities"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    placeholder="e.g. Software Engineering & DevOps"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Deficiency Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe the objective evidence observed during audit..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Root Cause Statement</label>
                <textarea
                  rows={2}
                  value={rootCause}
                  onChange={e => setRootCause(e.target.value)}
                  placeholder="Primary root cause identified (5-Whys can be refined in the workflow modal)..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Corrective Action (Immediate)</label>
                  <textarea
                    rows={2}
                    value={correctiveAction}
                    onChange={e => setCorrectiveAction(e.target.value)}
                    placeholder="Immediate containment fix..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Preventive Action (Recurrence)</label>
                  <textarea
                    rows={2}
                    value={preventiveAction}
                    onChange={e => setPreventiveAction(e.target.value)}
                    placeholder="Systemic recurrence prevention..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Action Owner</label>
                  <input
                    type="text"
                    required
                    value={owner}
                    onChange={e => setOwner(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {editingFinding ? 'Update Finding' : 'Save & Open Workflow'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
