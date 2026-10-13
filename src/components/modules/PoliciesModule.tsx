import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import { GeneratedDocument, DocumentAcknowledgment, DepartmentScopeProfile } from '../../types';
import { PageContainer } from '../layout/PageContainer';
import {
  FileText,
  Plus,
  Lock,
  Unlock,
  CheckCircle2,
  Download,
  Printer,
  Search,
  Filter,
  Eye,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  Shield,
  FileCheck,
  UserCheck,
  History,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Users,
  LayoutTemplate,
  FileCode2,
  Edit3,
  Building2,
  ShieldCheck,
  GitBranch,
  Bell
} from 'lucide-react';
import { formatDateTime } from '../../utils/crypto';
import { DocumentAcknowledgmentModal } from './DocumentAcknowledgmentModal';
import { StandardPdfDocumentView } from '../documents/StandardPdfDocumentView';
import { DepartmentPolicyAnalyzer } from '../departments/DepartmentPolicyAnalyzer';
import { DepartmentScopeModal } from '../departments/DepartmentScopeModal';
import { CreateDepartmentScopeModal } from '../departments/CreateDepartmentScopeModal';
import { DepartmentScopeDossierModal } from '../departments/DepartmentScopeDossierModal';
import { PolicyImplementationRemediationHub } from '../policies/PolicyImplementationRemediationHub';
import { AuditorReadinessModal } from '../policies/AuditorReadinessModal';
import { AuditorDefenseCard } from '../policies/AuditorDefenseCard';
import { StandardsPolicySynthesisWorkbench } from '../policies/StandardsPolicySynthesisWorkbench';
import { PolicyLifecycleTab } from '../policies/PolicyLifecycleTab';
import { PolicyGenerator } from '../policies/PolicyGenerator';
import { DocumentReviewWorkflowHub } from '../policies/DocumentReviewWorkflowHub';
import { evaluatePolicyReviewHealth } from '../../utils/policyLifecycleUtils';
import { useToast } from '../common/ToastContainer';

export const PoliciesModule: React.FC = () => {
  const { showToast } = useToast();
  const {
    currentTenant,
    updateDocument,
    setActiveModule,
    documentAcknowledgments,
    currentUser,
    currentRole,
    departmentScopes,
    updateDepartmentScope,
    addCustomDepartmentScope,
    updateDepartmentPolicyRequirement,
    autoMapDepartmentPolicies,
    getAuditorReadinessScorecard,
    addFinding,
    theme
  } = useGRC();

  const docs = currentTenant?.generatedDocs || [];
  const isMouExecuted = currentTenant?.mou.executed;

  // Active view tab: 'operationalize' | 'library' | 'generator' | 'departments' | 'acknowledgments' | 'lifecycle' | 'review_workflow'
  const [activeTab, setActiveTab] = useState<'operationalize' | 'library' | 'generator' | 'departments' | 'acknowledgments' | 'lifecycle' | 'review_workflow'>('operationalize');

  // Modal states for Department Scope
  const [selectedDeptForEdit, setSelectedDeptForEdit] = useState<DepartmentScopeProfile | null>(null);
  const [showCreateScopeModal, setShowCreateScopeModal] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);

  // Document presentation mode: 'pdf_format' (official sample PDF match), 'markdown', 'editor'
  const [docViewMode, setDocViewMode] = useState<'pdf_format' | 'markdown' | 'editor'>('pdf_format');

  // Selected document & search state
  const [selectedDocId, setSelectedDocId] = useState<string | null>(docs[0]?.id || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Policy' | 'Procedure' | 'Register' | 'Schedule'>('All');
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editContentText, setEditContentText] = useState('');

  // Acknowledgment modal state
  const [showAckModal, setShowAckModal] = useState(false);
  const [ackDocTarget, setAckDocTarget] = useState<GeneratedDocument | null>(null);

  // External Auditor Modal state
  const [showAuditorModal, setShowAuditorModal] = useState(false);
  const [showStandardsWorkbenchModal, setShowStandardsWorkbenchModal] = useState(false);
  const scorecard = getAuditorReadinessScorecard ? getAuditorReadinessScorecard() : {
    overallReadinessScore: 92,
    passedChecks: 7,
    totalChecks: 7,
    verdict: 'AUDIT_READY' as const,
    criteria: []
  };

  const handleLogCAPA = (findingTitle: string, clause: string, description: string) => {
    addFinding({
      source: 'INTERNAL_AUDIT',
      severity: 'Minor Non-Conformity',
      title: findingTitle,
      clauseOrControl: clause,
      department: 'Information Security',
      description,
      rootCauseAnalysis: {
        methodology: '5_WHYS',
        whys: [
          'Policy requirement was defined but operational automated evidence collection was not active.',
          'Responsibility was assigned in RACI but lack of tooling integration allowed drift.',
          'Quarterly management review had not yet audited this specific control attribute.'
        ],
        rootCauseStatement: `Operational verification telemetry was not formally linked to policy assertion in ${clause}.`
      },
      capaPlan: {
        correctiveAction: `Deploy automated evidence collection script and update SOP runbook for ${clause}.`,
        preventiveAction: `Configure CI/CD gate and periodic compliance monitor to prevent regression.`,
        owner: 'Chief Information Security Officer (CISO)',
        targetDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        evidenceRequired: `Exported JSON telemetry log and signed sign-off from Lead Internal Auditor.`
      },
      status: 'Open'
    });
    showToast({
      type: 'success',
      title: 'CAPA Record Created',
      message: `Clause 10.1 Non-Conformity & CAPA record created in Skanda GRC for ${clause}!`
    });
  };

  // Filter for acknowledgments audit table
  const [ackSearch, setAckSearch] = useState('');
  const [ackDocFilter, setAckDocFilter] = useState('All');

  const activeDoc = docs.find(d => d.id === selectedDocId) || docs[0];

  // Tenant acknowledgments
  const tenantAcks = documentAcknowledgments.filter(a => a.tenantId === currentTenant?.id);

  // Check if current user has acknowledged the active document's current version
  const currentUserActiveDocAck = tenantAcks.find(
    a => a.documentId === activeDoc?.id &&
         a.userId === currentUser.id &&
         a.documentVersion === activeDoc?.version
  );

  const handleStartEdit = () => {
    if (!activeDoc) return;
    setEditContentText(activeDoc.content);
    setIsEditingContent(true);
    setDocViewMode('editor');
  };

  const handleSaveEdit = () => {
    if (!activeDoc) return;
    const newVersion = (parseFloat(activeDoc.version) + 0.1).toFixed(1);
    updateDocument(activeDoc.id, {
      content: editContentText,
      version: newVersion,
      acknowledgementCount: 0 // Reset acknowledgment requirement for new version
    });
    setIsEditingContent(false);
    setDocViewMode('pdf_format');
  };

  const handleOpenAckModal = (doc: GeneratedDocument) => {
    setAckDocTarget(doc);
    setShowAckModal(true);
  };

  const filteredDocs = docs.filter(d => {
    const matchesType = typeFilter === 'All' || d.type.toUpperCase() === typeFilter.toUpperCase();
    const matchesSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.docCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const filteredAcks = tenantAcks.filter(a => {
    const matchesDoc = ackDocFilter === 'All' || a.documentId === ackDocFilter || a.documentCode === ackDocFilter;
    const matchesSearch =
      a.documentTitle.toLowerCase().includes(ackSearch.toLowerCase()) ||
      a.documentCode.toLowerCase().includes(ackSearch.toLowerCase()) ||
      a.userName.toLowerCase().includes(ackSearch.toLowerCase()) ||
      a.userEmail.toLowerCase().includes(ackSearch.toLowerCase()) ||
      a.department.toLowerCase().includes(ackSearch.toLowerCase()) ||
      a.verificationHash.toLowerCase().includes(ackSearch.toLowerCase());
    return matchesDoc && matchesSearch;
  });

  // Calculate compliance statistics
  const totalDocs = docs.length;
  const acknowledgedDocsCount = docs.filter(d => {
    return tenantAcks.some(a => a.documentId === d.id);
  }).length;
  const compliancePercentage = totalDocs > 0 ? Math.round((acknowledgedDocsCount / totalDocs) * 100) : 0;

  // Policies with approaching review deadlines (<= 30 days) or overdue
  const approachingReviewsCount = docs.filter(d => {
    const health = evaluatePolicyReviewHealth(d);
    return health.status !== 'HEALTHY' && health.daysRemaining <= 30;
  }).length;

  return (
    <PageContainer id="policies-module" className="font-sans">
      {/* Header Banner - Enterprise Corporate Architecture */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-colors flex flex-col xl:flex-row xl:items-center justify-between gap-4 ${
        theme === 'light'
          ? 'bg-white border-slate-200 shadow-xs'
          : 'bg-[#0D1527] border-[#1E293B] shadow-sm'
      }`}>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center space-x-1.5 ${
              theme === 'light'
                ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                : 'text-indigo-300 bg-indigo-950/70 border-indigo-700/50'
            }`}>
              <ShieldCheck className="w-3 h-3 text-indigo-400" />
              <span>ISO/IEC 27001:2022 ISMS Governance</span>
            </span>
            <span className={`text-xs font-mono font-medium ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              Tenant: {currentTenant?.name}
            </span>
          </div>
          <h1 className={`text-xl font-bold tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            Policies, Procedures & Document Acknowledgment
          </h1>
          <p className={`text-xs max-w-3xl leading-relaxed ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            Centralized policy governance portal with version control, cryptographic digital acknowledgment workflows, and immutable audit logs.
          </p>
        </div>

        {/* Action Controls & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className={`flex items-center p-1 rounded-xl border max-w-full overflow-x-auto scrollbar-none ${
            theme === 'light'
              ? 'bg-slate-100 border-slate-200'
              : 'bg-[#080D1A] border-[#1E293B]'
          }`}>
            <button
              onClick={() => setActiveTab('operationalize')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'operationalize'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
              <span>Operationalization & Audit Fix</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'operationalize' ? 'bg-indigo-700 text-indigo-100' : 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'}`}>
                Fix
              </span>
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'library'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Document Library ({docs.length})</span>
            </button>
            <button
              id="tab-policy-generator-btn"
              onClick={() => setActiveTab('generator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'generator'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Policy Generator</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'generator' ? 'bg-indigo-700 text-indigo-100' : 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'}`}>
                12-Step ISO
              </span>
            </button>
            <button
              onClick={() => setActiveTab('departments')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'departments'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Department Scope & ISO</span>
            </button>
            <button
              onClick={() => setActiveTab('acknowledgments')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'acknowledgments'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audit & Acknowledgment Log ({tenantAcks.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('lifecycle')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'lifecycle'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-purple-400" />
              <span>Policy Lifecycle</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'lifecycle' ? 'bg-indigo-700 text-indigo-100' : 'bg-purple-950 text-purple-300 border border-purple-800/60'}`}>
                Audits
              </span>
            </button>
            <button
              onClick={() => setActiveTab('review_workflow')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'review_workflow'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Review Workflow & Notifications</span>
              {approachingReviewsCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'review_workflow'
                    ? 'bg-indigo-700 text-indigo-100'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                }`}>
                  {approachingReviewsCount}
                </span>
              )}
            </button>
          </div>

          {/* Locked / Unlocked Pill */}
          {isMouExecuted ? (
            <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border shrink-0 ${
              theme === 'light'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60'
            }`}>
              <Unlock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Active Suite</span>
            </div>
          ) : (
            <button
              onClick={() => setActiveModule('onboarding_survey')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer shrink-0 ${
                theme === 'light'
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  : 'bg-amber-950/50 text-amber-300 border-amber-800/60 hover:bg-amber-950/80'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Locked (Sign MoU in Phase 4)</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: DOCUMENT LIBRARY & VIEWER */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          {/* Auditor Pre-Flight Health Bar */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-100">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-100">External Auditor Pre-Flight Readiness</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    {scorecard.overallReadinessScore}% Benchmark Score
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium hidden md:inline">
                    • {scorecard.passedChecks}/{scorecard.totalChecks} Criteria Passed
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Auditor rigor guarantee: Verified against international Standards & Training benchmarks & ISO/IEC 27001:2022 Stage 1 & 2 sampling expectations.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('generator')}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                <span>12-Step Policy Generator</span>
              </button>
              <button
                onClick={() => setShowStandardsWorkbenchModal(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center space-x-1.5 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
                <span>Standards Policy Engine</span>
              </button>
              <button
                onClick={() => setShowAuditorModal(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auditor Assessment & Synthesis</span>
              </button>
            </div>
          </div>

          {/* Approaching Review Dates Alert Banner */}
          {approachingReviewsCount > 0 && (
            <div className="p-3.5 rounded-xl border bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-amber-900 dark:text-amber-200">
                    ISO 27001 Recertification SLA Alert:
                  </span>{' '}
                  <span className="text-amber-800 dark:text-amber-300">
                    {approachingReviewsCount} {approachingReviewsCount === 1 ? 'policy has an upcoming review date' : 'policies have review dates approaching within 30 days or overdue'}.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('review_workflow')}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
              >
                <span>Launch Review Workflow</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Side: Document Library List (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2.5">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search policies & procedures..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-1">
                {(['All', 'Policy', 'Procedure', 'Register', 'Schedule'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      typeFilter === t
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Items List */}
            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {filteredDocs.map(doc => {
                const isSelected = activeDoc?.id === doc.id;
                const docAcks = tenantAcks.filter(a => a.documentId === doc.id);
                const userHasAcknowledged = docAcks.some(
                  a => a.userId === currentUser.id && a.documentVersion === doc.version
                );

                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setSelectedDocId(doc.id);
                      setIsEditingContent(false);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-blue-700 border border-slate-200">
                        {doc.docCode}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold uppercase">
                        {doc.type}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 mt-1.5 line-clamp-1">{doc.title}</h3>

                    <div className="text-[10px] text-slate-500 flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
                      <span>Owner: {doc.owner}</span>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-semibold text-slate-700">v{doc.version}</span>
                        {userHasAcknowledged ? (
                          <span className="inline-flex items-center text-emerald-600 font-bold" title="You acknowledged this version">
                            <CheckCircle className="w-3 h-3 ml-0.5" />
                          </span>
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Pending your acknowledgment" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side: Active Document Viewer / Editor (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col min-h-[700px]">
            {activeDoc ? (
              <div className="flex flex-col h-full space-y-3">
                {/* View Mode Switcher Header */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">Format & View:</span>
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                      <button
                        onClick={() => {
                          setDocViewMode('pdf_format');
                          setIsEditingContent(false);
                        }}
                        className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                          docViewMode === 'pdf_format'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <LayoutTemplate className="w-3.5 h-3.5" />
                        <span>Official PDF Format View</span>
                      </button>
                      <button
                        onClick={() => {
                          setDocViewMode('markdown');
                          setIsEditingContent(false);
                        }}
                        className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                          docViewMode === 'markdown'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <FileCode2 className="w-3.5 h-3.5" />
                        <span>Markdown / Text</span>
                      </button>
                      {isMouExecuted && (
                        <button
                          onClick={() => {
                            setDocViewMode('editor');
                            handleStartEdit();
                          }}
                          className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                            docViewMode === 'editor'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editor</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedDocId(activeDoc.id);
                        setActiveTab('lifecycle');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 flex items-center space-x-1.5 transition-colors cursor-pointer"
                      title="Track policy version history, approval stages & digital signatures"
                    >
                      <GitBranch className="w-3.5 h-3.5 text-blue-600" />
                      <span>Policy Lifecycle</span>
                    </button>

                    {/* Acknowledgment status pill */}
                    {currentUserActiveDocAck ? (
                      <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Acknowledged</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenAckModal(activeDoc)}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Sign & Acknowledge</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Primary Content Area */}
                {docViewMode === 'pdf_format' ? (
                  <div className="flex-1 min-h-[640px]">
                    <StandardPdfDocumentView
                      document={activeDoc}
                      companyName={currentTenant?.name || 'ACME Global Enterprise'}
                      onAcknowledge={() => handleOpenAckModal(activeDoc)}
                      userHasAcknowledged={!!currentUserActiveDocAck}
                      isLocked={!isMouExecuted}
                    />
                  </div>
                ) : docViewMode === 'editor' ? (
                  <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col flex-1 min-h-[640px]">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Document Markdown Editor</h3>
                        <p className="text-[11px] text-slate-500">Edit raw markdown content and publish a new version revision.</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setDocViewMode('pdf_format')}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                        >
                          Save & Bump Version
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={24}
                      value={editContentText}
                      onChange={e => setEditContentText(e.target.value)}
                      className="w-full flex-1 bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs text-slate-900 leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                    />
                  </div>
                ) : (
                  /* Standard Markdown View */
                  <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col flex-1 min-h-[640px]">
                    {/* Document Header Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                            {activeDoc.docCode}
                          </span>
                          <span className="text-sm font-bold text-slate-900">{activeDoc.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          <span>Category: <strong className="text-slate-700">{activeDoc.category}</strong></span>
                          <span>•</span>
                          <span>Version: <strong className="text-blue-600 font-mono">v{activeDoc.version}</strong></span>
                          <span>•</span>
                          <span>Effective: <strong className="text-slate-700">{activeDoc.effectiveDate}</strong></span>
                          <span>•</span>
                          <span>Classification: <strong className="text-slate-700">{activeDoc.classification}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => window.print()}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                          title="Print Document"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Document Text Body */}
                    <div className="flex-1 overflow-y-auto py-3 my-3 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-200">
                      {activeDoc.content}
                    </div>

                    {/* Document Metadata Footer */}
                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-2">
                      <span>
                        Mandatory ISO 27001 ISMS Compliance Artefact • {currentTenant?.name}
                      </span>
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-slate-400">Classification: {activeDoc.classification}</span>
                        <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Approved for ISMS Implementation</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Auditor Defense Card */}
                {activeDoc && (
                  <div className="mt-4">
                    <AuditorDefenseCard
                      document={activeDoc}
                      onLogCAPA={handleLogCAPA}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No document selected.
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENT SCOPE & ISO IMPLEMENTATION COMPLIANCE */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          {/* Quick Action Banner */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 px-2 py-0.5 rounded bg-sky-950 border border-sky-800">
                  ISO 27001 Clause 4.3 & 5.3 Scope
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {departmentScopes.filter(d => d.isInScope).length} In-Scope Departments
                </span>
              </div>
              <h2 className="text-sm font-bold text-white">Department Scope Data & ISO Policy Enforcement</h2>
              <p className="text-xs text-slate-400">
                Enter and manage department operational scopes, assets, and processes to analyze required policies and procedures for external certification.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setShowCreateScopeModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-sky-600/20 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Enter Department Scope</span>
              </button>

              <button
                onClick={() => autoMapDepartmentPolicies()}
                className="px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                title="Automatically match baseline ISO 27001 policies to all departments"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Map All</span>
              </button>

              <button
                onClick={() => setShowDossierModal(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                <span>Scope Dossier</span>
              </button>
            </div>
          </div>

          {/* Policy Analyzer */}
          <DepartmentPolicyAnalyzer
            departmentScopes={departmentScopes}
            onOpenDepartmentScope={(dept) => setSelectedDeptForEdit(dept)}
            onUpdatePolicyStatus={(deptId, reqId, status) =>
              updateDepartmentPolicyRequirement(deptId, reqId, { status })
            }
            onAutoMapAll={() => autoMapDepartmentPolicies()}
            generatedDocs={docs}
          />
        </div>
      )}

      {/* TAB 3: DIGITAL ACKNOWLEDGMENT & AUDIT LEDGER */}
      {activeTab === 'acknowledgments' && (
        <div className="space-y-4">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Published Governance Documents</span>
              <div className="text-xl font-bold text-slate-900 mt-1">{totalDocs} Documents</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Policies, Procedures & Registers</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Total Acknowledgments Logged</span>
              <div className="text-xl font-bold text-blue-600 mt-1">{tenantAcks.length} Signatures</div>
              <p className="text-[11px] text-slate-400 mt-0.5">With SHA-256 cryptographic verification</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Policy Coverage Rate</span>
              <div className="text-xl font-bold text-emerald-600 mt-1">{compliancePercentage}%</div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full"
                  style={{ width: `${compliancePercentage}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Auditor Verification Status</span>
              <div className="text-xs font-bold text-slate-900 mt-1.5 flex items-center space-x-1.5">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>ISO 27001 Clause 5.1 Compliant</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Audit trail tamper-proof</p>
            </div>
          </div>

          {/* Audit Table Card */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Document Acknowledgment Audit Ledger</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Immutable record of staff policy sign-offs for external certification audits and internal compliance reviews.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={ackSearch}
                    onChange={e => setAckSearch(e.target.value)}
                    placeholder="Search by user, document or hash..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
                  />
                </div>

                <select
                  value={ackDocFilter}
                  onChange={e => setAckDocFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none"
                >
                  <option value="All">All Documents ({docs.length})</option>
                  {docs.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.docCode} - {d.title.substring(0, 30)}...
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Export Audit PDF</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-600 uppercase">
                    <th className="py-2.5 px-3">Document</th>
                    <th className="py-2.5 px-3">Version</th>
                    <th className="py-2.5 px-3">Signatory</th>
                    <th className="py-2.5 px-3">Role & Dept</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Verification Hash (SHA-256)</th>
                    <th className="py-2.5 px-3">Signature</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAcks.length > 0 ? (
                    filteredAcks.map(ack => (
                      <tr key={ack.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-blue-700">{ack.documentCode}</div>
                          <div className="text-slate-700 font-medium line-clamp-1">{ack.documentTitle}</div>
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-900">
                          v{ack.documentVersion}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{ack.userName}</div>
                          <div className="text-[11px] text-slate-500">{ack.userEmail}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-slate-900 font-medium">{ack.userRole}</div>
                          <div className="text-[11px] text-slate-500">{ack.department}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                          {formatDateTime(ack.timestamp)}
                        </td>
                        <td className="py-3 px-3">
                          <div
                            className="font-mono text-[10px] text-slate-600 max-w-xs truncate bg-slate-100 px-2 py-0.5 rounded border border-slate-200 select-all cursor-pointer"
                            title={ack.verificationHash}
                          >
                            {ack.verificationHash}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{ack.signatureText}</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No policy acknowledgments matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: OPERATIONALIZATION & AUDIT REMEDIATION HUB */}
      {activeTab === 'operationalize' && (
        <PolicyImplementationRemediationHub />
      )}

      {/* TAB 5: POLICY LIFECYCLE, VERSION HISTORY, WORKFLOWS & DIGITAL SIGNATURES */}
      {activeTab === 'lifecycle' && (
        <PolicyLifecycleTab
          initialDocumentId={selectedDocId || undefined}
          onSelectDocument={(doc) => setSelectedDocId(doc.id)}
        />
      )}

      {/* TAB 6: POLICY GENERATOR (ISO 27001:2022 12-STEP ARCHITECTURAL STANDARD) */}
      {activeTab === 'generator' && (
        <PolicyGenerator isEmbedded={true} />
      )}

      {/* TAB 7: FORMAL DOCUMENT REVIEW WORKFLOW, MULTI-STAGE APPROVAL & CADENCE NOTIFICATIONS */}
      {activeTab === 'review_workflow' && (
        <DocumentReviewWorkflowHub
          initialDocId={selectedDocId || undefined}
          onNavigateToDoc={(docId) => {
            setSelectedDocId(docId);
            setActiveTab('library');
          }}
        />
      )}

      {/* Digital Acknowledgment Modal */}
      {showAckModal && ackDocTarget && (
        <DocumentAcknowledgmentModal
          document={ackDocTarget}
          onClose={() => {
            setShowAckModal(false);
            setAckDocTarget(null);
          }}
          onSuccess={() => {
            setShowAckModal(false);
            setAckDocTarget(null);
          }}
        />
      )}

      {/* Department Scope Edit Modal */}
      {selectedDeptForEdit && (
        <DepartmentScopeModal
          department={selectedDeptForEdit}
          isOpen={true}
          onClose={() => setSelectedDeptForEdit(null)}
          onSave={(deptId, updates) => {
            updateDepartmentScope(deptId, updates);
            setSelectedDeptForEdit(null);
          }}
        />
      )}

      {/* Enter New Department Scope Modal */}
      <CreateDepartmentScopeModal
        isOpen={showCreateScopeModal}
        onClose={() => setShowCreateScopeModal(false)}
        onSave={(data) => {
          addCustomDepartmentScope(data);
          setShowCreateScopeModal(false);
        }}
      />

      {/* Formal Scope Dossier Modal */}
      <DepartmentScopeDossierModal
        tenant={currentTenant}
        departmentScopes={departmentScopes}
        isOpen={showDossierModal}
        onClose={() => setShowDossierModal(false)}
      />

      {/* External Auditor Pre-Flight Readiness Modal */}
      <AuditorReadinessModal
        isOpen={showAuditorModal}
        onClose={() => setShowAuditorModal(false)}
      />

      {/* Standards ISO 27001 Policy Engine Modal */}
      {showStandardsWorkbenchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Standards and Training Engine
                </span>
                <span className="text-xs text-slate-300">ISO/IEC 27001:2022 Stage 1 & Stage 2 Audit Preparation</span>
              </div>
              <button
                onClick={() => setShowStandardsWorkbenchModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900">
              <StandardsPolicySynthesisWorkbench
                onClose={() => setShowStandardsWorkbenchModal(false)}
                isEmbedded={false}
              />
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
