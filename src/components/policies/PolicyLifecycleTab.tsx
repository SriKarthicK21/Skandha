import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import { GeneratedDocument, PolicyApprovalRecord, PolicyDigitalSignature } from '../../types';
import {
  POLICY_STAGES,
  getStageProgress,
  getEffectiveStage,
  ensureDocApprovalHistory,
  ensureDocDigitalSignatures,
  getNextReviewDate
} from '../../utils/policyLifecycleUtils';
import { PolicyRevisionModal } from './PolicyRevisionModal';
import { PolicySignatureModal } from './PolicySignatureModal';
import { PolicyCertificateModal } from './PolicyCertificateModal';
import {
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  GitBranch,
  FileText,
  FileCheck,
  ChevronRight,
  ArrowRight,
  Award,
  Lock,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Printer,
  Calendar,
  UserCheck,
  Hash,
  ExternalLink,
  SlidersHorizontal,
  Layers,
  Sparkles,
  BookOpen,
  MessageSquare,
  AlertTriangle,
  FileCode,
  Check,
  X,
  History
} from 'lucide-react';
import { formatDateTime, formatDate } from '../../utils/crypto';

interface PolicyLifecycleTabProps {
  initialDocumentId?: string;
  onSelectDocument?: (doc: GeneratedDocument) => void;
}

export const PolicyLifecycleTab: React.FC<PolicyLifecycleTabProps> = ({
  initialDocumentId,
  onSelectDocument
}) => {
  const {
    currentTenant,
    generatedDocs,
    currentUser,
    currentRole,
    advancePolicyApprovalStage,
    addPolicyRevision,
    signPolicyDigitally
  } = useGRC();

  // Active documents
  const docs = useMemo(() => {
    return (currentTenant?.generatedDocs && currentTenant.generatedDocs.length > 0)
      ? currentTenant.generatedDocs
      : generatedDocs || [];
  }, [currentTenant?.generatedDocs, generatedDocs]);

  // Selected policy ID
  const [selectedDocId, setSelectedDocId] = useState<string>(() => {
    if (initialDocumentId && docs.some(d => d.id === initialDocumentId)) {
      return initialDocumentId;
    }
    return docs[0]?.id || '';
  });

  // Active sub-view
  const [subView, setSubView] = useState<'pipeline' | 'revisions' | 'signatures' | 'matrix'>('pipeline');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');

  // Modals state
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [inspectedSignature, setInspectedSignature] = useState<PolicyDigitalSignature | null>(null);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [advanceComments, setAdvanceComments] = useState('');

  // Currently focused policy
  const activeDoc = useMemo(() => {
    return docs.find(d => d.id === selectedDocId) || docs[0];
  }, [docs, selectedDocId]);

  // Effective approval stage and initialized data for active doc
  const effectiveStage = useMemo(() => {
    return activeDoc ? getEffectiveStage(activeDoc) : 'DRAFT';
  }, [activeDoc]);

  const approvalHistory = useMemo(() => {
    return activeDoc ? ensureDocApprovalHistory(activeDoc) : [];
  }, [activeDoc]);

  const digitalSignatures = useMemo(() => {
    return activeDoc ? ensureDocDigitalSignatures(activeDoc) : [];
  }, [activeDoc]);

  const reviewSchedule = useMemo(() => {
    return activeDoc ? getNextReviewDate(activeDoc) : { dateString: '2026-07-25', daysRemaining: 180, isOverdue: false };
  }, [activeDoc]);

  // Executive Metrics across the entire policy portfolio
  const metrics = useMemo(() => {
    const total = docs.length;
    let published = 0;
    let inReview = 0;
    let drafts = 0;
    let signedCount = 0;

    docs.forEach(doc => {
      const stage = getEffectiveStage(doc);
      if (stage === 'PUBLISHED') published++;
      else if (stage === 'DRAFT') drafts++;
      else inReview++;

      const sigs = ensureDocDigitalSignatures(doc);
      if (sigs.length > 0) signedCount++;
    });

    const signedPercent = total > 0 ? Math.round((signedCount / total) * 100) : 0;

    return {
      total,
      published,
      inReview,
      drafts,
      signedCount,
      signedPercent
    };
  }, [docs]);

  // Filtered documents list
  const filteredDocs = useMemo(() => {
    return docs.filter(doc => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.docCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.category && doc.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const stage = getEffectiveStage(doc);
      const matchesStage = stageFilter === 'ALL' || stage === stageFilter;

      return matchesSearch && matchesStage;
    });
  }, [docs, searchQuery, stageFilter]);

  // Next stage calculation for workflow advance
  const nextStageConfig = useMemo(() => {
    const currentIndex = POLICY_STAGES.findIndex(s => s.id === effectiveStage);
    if (currentIndex >= 0 && currentIndex < POLICY_STAGES.length - 1) {
      return POLICY_STAGES[currentIndex + 1];
    }
    return null;
  }, [effectiveStage]);

  // Handler for advancing stage
  const handleConfirmAdvanceStage = () => {
    if (!activeDoc || !nextStageConfig) return;
    advancePolicyApprovalStage(
      activeDoc.id,
      nextStageConfig.id,
      advanceComments || `Formally approved and advanced to ${nextStageConfig.label}`,
      currentUser.name,
      currentRole
    );
    setIsAdvanceModalOpen(false);
    setAdvanceComments('');
  };

  // Handler for saving revision
  const handleSaveRevision = (revision: {
    issueNo: string;
    changeDescription: string;
    pageNo: string;
    approvedBy: string;
    newContent?: string;
  }) => {
    if (!activeDoc) return;
    addPolicyRevision(activeDoc.id, revision);
  };

  // Handler for signing digitally
  const handleSignPolicy = async (data: {
    signerName: string;
    signerRole: string;
    signerEmail?: string;
    signingPurpose: PolicyDigitalSignature['signingPurpose'];
    auditDeclaration?: string;
    notes?: string;
  }) => {
    if (!activeDoc) throw new Error('No active document selected');
    return await signPolicyDigitally(activeDoc.id, data);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & KPI Metrics Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 px-2 py-0.5 rounded bg-blue-100 border border-blue-200">
                ISO/IEC 27001 Cl. 7.5.3 & Cl. 5.1
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Policy Governance, Approval Pipeline & Cryptographic Attestation
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Policy Lifecycle & Compliance Audit Ledger
            </h1>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setIsRevisionModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <GitBranch className="w-3.5 h-3.5 text-blue-600" />
              <span>New Version Revision</span>
            </button>

            <button
              onClick={() => setIsSignatureModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sign Policy Digitally</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Controlled Policies</span>
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1.5">{metrics.total}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">ISMS Corporate Scope</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Approval Pipeline</span>
              <Clock className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1.5">
              {metrics.published} <span className="text-xs font-normal text-slate-500">/ {metrics.total} Published</span>
            </div>
            <div className="text-[11px] text-indigo-600 font-medium mt-0.5">
              {metrics.inReview} in Multi-Stage Review
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Cryptographic Signatures</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1.5">
              {metrics.signedPercent}% <span className="text-xs font-normal text-slate-500">({metrics.signedCount} Policies)</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
              SHA-256 Verified Seal
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Recertification SLA</span>
              <Calendar className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1.5">
              {reviewSchedule.daysRemaining > 0 ? `${reviewSchedule.daysRemaining}d` : 'Due'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Next Review: {reviewSchedule.dateString}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Policy Focus Selector Bar & Sub-Tabs */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Policy Selector Dropdown & Search */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-xs font-bold text-slate-700 whitespace-nowrap">
              Active Policy:
            </div>
            <div className="min-w-[280px] sm:min-w-[340px]">
              <select
                value={activeDoc?.id || ''}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {docs.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    {doc.docCode} — {doc.title} (v{doc.version})
                  </option>
                ))}
              </select>
            </div>

            {activeDoc && (
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  v{activeDoc.version}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  effectiveStage === 'PUBLISHED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : effectiveStage === 'EXECUTIVE_CISO'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {POLICY_STAGES.find(s => s.id === effectiveStage)?.label || effectiveStage}
                </span>
              </div>
            )}
          </div>

          {/* Sub-view switcher buttons */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
            <button
              onClick={() => setSubView('pipeline')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                subView === 'pipeline'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Approval Workflow
            </button>
            <button
              onClick={() => setSubView('revisions')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                subView === 'revisions'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Version History ({activeDoc?.revisionHistory?.length || 1})
            </button>
            <button
              onClick={() => setSubView('signatures')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                subView === 'signatures'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Digital Signatures ({digitalSignatures.length})
            </button>
            <button
              onClick={() => setSubView('matrix')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                subView === 'matrix'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cross-Policy Matrix
            </button>
          </div>
        </div>
      </div>

      {/* 3. Sub-View: Approval Pipeline */}
      {subView === 'pipeline' && activeDoc && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {/* Active Policy Banner */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-blue-700">{activeDoc.docCode}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500">{activeDoc.category}</span>
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">{activeDoc.title}</h2>
              </div>

              {/* Advance Stage Action Button */}
              {nextStageConfig ? (
                <button
                  onClick={() => setIsAdvanceModalOpen(true)}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center space-x-2 cursor-pointer self-start sm:self-auto"
                >
                  <span>Advance to {nextStageConfig.shortLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 self-start sm:self-auto">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Fully Enacted & Published</span>
                </div>
              )}
            </div>

            {/* Visual 5-Stage Stepper */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-3">
                <span>Formal Approval Progression (ISO 27001 Cl. 7.5.2)</span>
                <span className="text-blue-600">{getStageProgress(effectiveStage)}% Completed</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {POLICY_STAGES.map((stage, idx) => {
                  const currentIdx = POLICY_STAGES.findIndex(s => s.id === effectiveStage);
                  const isCompleted = idx < currentIdx || (idx === currentIdx && effectiveStage === 'PUBLISHED');
                  const isCurrent = idx === currentIdx && effectiveStage !== 'PUBLISHED';
                  const isPending = idx > currentIdx;

                  // Find matching record in history
                  const record = approvalHistory.find(h => h.stage === stage.id);

                  return (
                    <div
                      key={stage.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isCurrent
                          ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                          : isCompleted
                          ? 'border-emerald-200 bg-emerald-50/40'
                          : 'border-slate-200 bg-slate-50/50 opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {isCompleted ? <Check className="w-3 h-3" /> : idx + 1}
                        </span>

                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          isCompleted
                            ? 'text-emerald-700'
                            : isCurrent
                            ? 'text-blue-700 animate-pulse'
                            : 'text-slate-400'
                        }`}>
                          {isCompleted ? 'Approved' : isCurrent ? 'Active Stage' : 'Pending'}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-900">{stage.label}</div>
                      <div className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-snug">
                        {stage.description}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 text-[10px] text-slate-500">
                        {record ? (
                          <div>
                            <div className="font-semibold text-slate-800 truncate">{record.approverName}</div>
                            <div className="text-slate-400">{formatDate(record.actionDate)}</div>
                          </div>
                        ) : (
                          <div>
                            <span className="text-slate-400">Assigned: </span>
                            <span className="font-medium text-slate-700">{stage.defaultRole}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chronological Approval Trail Log */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Compliance Approval Audit Trail ({approvalHistory.length} Sign-Off Records)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Immutable Four-Eyes Ledger</span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {approvalHistory.map((record) => (
                <div key={record.id} className="p-4 bg-white hover:bg-slate-50/60 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900">{record.approverName}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs font-semibold text-slate-600">{record.approverRole}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Stage: <span className="font-bold text-blue-700">{POLICY_STAGES.find(s => s.id === record.stage)?.label || record.stage}</span> • Action Date: {formatDateTime(record.actionDate)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {record.status}
                      </span>
                    </div>
                  </div>

                  {record.comments && (
                    <div className="mt-2.5 ml-11 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 italic">
                      "{record.comments}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Sub-View: Version History (ISO 27001 Cl. 7.5.3) */}
      {subView === 'revisions' && activeDoc && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                    ISO/IEC 27001 Clause 7.5.3
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">{activeDoc.docCode}</span>
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-1">
                  Document Revision History & Modification Log
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Formal change identification, revision rationale, and authorized approver sign-off.
                </p>
              </div>

              <button
                onClick={() => setIsRevisionModalOpen(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Revision Entry</span>
              </button>
            </div>

            {/* Formal Revision History Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <tr>
                      <th className="py-3 px-4 w-16">S.No</th>
                      <th className="py-3 px-4 w-28">Issue No</th>
                      <th className="py-3 px-4 w-32">Review Date</th>
                      <th className="py-3 px-4 w-28">Pages Modified</th>
                      <th className="py-3 px-4">Change Description & Rationale</th>
                      <th className="py-3 px-4 w-44">Approved By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {(activeDoc.revisionHistory && activeDoc.revisionHistory.length > 0) ? (
                      activeDoc.revisionHistory.map((rev, index) => (
                        <tr key={index} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-slate-500">{rev.sNo || String(index + 1).padStart(2, '0')}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-blue-50 text-blue-700 border border-blue-200">
                              v{rev.issueNo}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">{rev.reviewDate || '25 Jul 2025'}</td>
                          <td className="py-3.5 px-4 text-slate-700 font-medium">{rev.pageNo || 'All'}</td>
                          <td className="py-3.5 px-4 text-slate-800 leading-relaxed font-medium">
                            {rev.changeDescription}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 font-semibold">{rev.approvedBy}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-3.5 px-4 font-mono text-slate-500">01</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-blue-50 text-blue-700 border border-blue-200">
                            v{activeDoc.version || '1.0'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">25 Jul 2025</td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">All</td>
                        <td className="py-3.5 px-4 text-slate-800 leading-relaxed font-medium">
                          Initial formulation and publication aligned with ISO/IEC 27001:2022.
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-semibold">{activeDoc.approvedBy || 'CISO'}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Document Control Policy Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Document Control & Distribution Statements</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                <li>This document is the official property of {currentTenant?.name || 'the Organization'} and shall not be photocopied or reproduced without prior written CISO approval.</li>
                <li>Manual, handwritten, or untracked revisions are strictly forbidden under ISO 27001 control protocols.</li>
                <li>All amendments require formal review, cryptographic re-signing, and re-issuance through this governance portal.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 5. Sub-View: Digital Signatures Ledger */}
      {subView === 'signatures' && activeDoc && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                    Cryptographic Audit Ledger
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">{activeDoc.docCode}</span>
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-1">
                  Digital Signatures & Management Attestation
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tamper-evident cryptographic seals verifying executive leadership commitment for ISO 27001 external audits.
                </p>
              </div>

              <button
                onClick={() => setIsSignatureModalOpen(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Add Digital Signature</span>
              </button>
            </div>

            {/* Signatures Cards */}
            {digitalSignatures.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {digitalSignatures.map((sig) => (
                  <div
                    key={sig.id}
                    className="p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/20 hover:bg-emerald-50/40 transition-all space-y-3 relative group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{sig.signerName}</div>
                          <div className="text-[11px] text-slate-600 font-medium">{sig.signerRole}</div>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {sig.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="text-slate-600">
                        <span className="text-slate-400 text-[11px]">Purpose: </span>
                        <span className="font-semibold text-slate-800">{sig.signingPurpose.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Signed: {formatDateTime(sig.timestamp)} • Node: {sig.ipAddress}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-200/60">
                      <div className="text-[10px] text-slate-400 mb-1 flex items-center justify-between">
                        <span>SHA-256 HMAC Fingerprint</span>
                        <span className="font-mono text-[9px] text-emerald-700">Root-01</span>
                      </div>
                      <div
                        className="font-mono text-[10px] text-emerald-800 bg-white p-2 rounded-lg border border-emerald-200 truncate select-all"
                        title={sig.verificationHash}
                      >
                        {sig.verificationHash}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => setInspectedSignature(sig)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Inspect Auditor Certificate</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>

                      <div className="flex items-center space-x-1 text-[10px] font-bold text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Tamper-Evident</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 space-y-3">
                <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto" />
                <div className="text-xs font-bold text-slate-700">No Digital Signatures Applied Yet</div>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Execute the digital signing ceremony to cryptographically bind this policy with an immutable SHA-256 HMAC seal.
                </p>
                <button
                  onClick={() => setIsSignatureModalOpen(true)}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center space-x-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Execute Digital Signature</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Sub-View: Cross-Policy Compliance Matrix */}
      {subView === 'matrix' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Cross-Policy Governance Matrix & Audit Readiness
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete institutional register of policies, approval statuses, digital seals, and annual review cycles.
                </p>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex items-center space-x-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search policies..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44 sm:w-56"
                  />
                </div>

                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="ALL">All Stages</option>
                  <option value="DRAFT">Draft</option>
                  <option value="TECHNICAL_REVIEW">Technical Review</option>
                  <option value="LEGAL_COMPLIANCE">Legal Compliance</option>
                  <option value="EXECUTIVE_CISO">CISO Endorsement</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <tr>
                      <th className="py-3 px-4 w-28">Code</th>
                      <th className="py-3 px-4">Policy Title</th>
                      <th className="py-3 px-4 w-24">Version</th>
                      <th className="py-3 px-4 w-40">Approval Stage</th>
                      <th className="py-3 px-4 w-36">Digital Seal</th>
                      <th className="py-3 px-4 w-32">Next Review</th>
                      <th className="py-3 px-4 w-24 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredDocs.map((doc) => {
                      const stage = getEffectiveStage(doc);
                      const sigs = ensureDocDigitalSignatures(doc);
                      const nextRev = getNextReviewDate(doc);
                      const isSelected = doc.id === activeDoc?.id;

                      return (
                        <tr
                          key={doc.id}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            isSelected ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <td className="py-3 px-4 font-mono font-bold text-blue-700">{doc.docCode}</td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{doc.title}</div>
                            <div className="text-[11px] text-slate-400">{doc.category}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                              v{doc.version}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              stage === 'PUBLISHED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : stage === 'EXECUTIVE_CISO'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {POLICY_STAGES.find(s => s.id === stage)?.label || stage}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {sigs.length > 0 ? (
                              <span className="flex items-center space-x-1 text-emerald-700 font-bold text-[11px]">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{sigs.length} Sealed</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Unsigned</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-600 text-[11px]">
                            {nextRev.dateString}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedDocId(doc.id);
                                setSubView('pipeline');
                              }}
                              className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advance Stage Modal */}
      {isAdvanceModalOpen && activeDoc && nextStageConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Advance Approval Workflow</h3>
                  <div className="text-[11px] text-slate-500">{activeDoc.docCode} — {activeDoc.title}</div>
                </div>
              </div>
              <button
                onClick={() => setIsAdvanceModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1">
              <div className="text-xs font-bold text-blue-900">
                Target Stage: {nextStageConfig.label}
              </div>
              <div className="text-[11px] text-blue-800 leading-snug">
                {nextStageConfig.description}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Reviewer / Approver Endorsement Comments
              </label>
              <textarea
                rows={3}
                value={advanceComments}
                onChange={(e) => setAdvanceComments(e.target.value)}
                placeholder="Enter review notes or verification findings (e.g., Technical validation completed with no high-risk exceptions)..."
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="text-[11px] text-slate-500">
              Authorized User: <span className="font-semibold text-slate-800">{currentUser.name} ({currentRole})</span>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAdvanceModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAdvanceStage}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
              >
                Confirm & Advance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {activeDoc && (
        <PolicyRevisionModal
          document={activeDoc}
          isOpen={isRevisionModalOpen}
          onClose={() => setIsRevisionModalOpen(false)}
          onSaveRevision={handleSaveRevision}
        />
      )}

      {/* Digital Signature Modal */}
      {activeDoc && (
        <PolicySignatureModal
          document={activeDoc}
          isOpen={isSignatureModalOpen}
          onClose={() => setIsSignatureModalOpen(false)}
          onSignPolicy={handleSignPolicy}
        />
      )}

      {/* Certificate Inspector Modal */}
      {inspectedSignature && (
        <PolicyCertificateModal
          signature={inspectedSignature}
          isOpen={!!inspectedSignature}
          onClose={() => setInspectedSignature(null)}
        />
      )}
    </div>
  );
};
