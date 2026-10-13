// ============================================================================
// SKANDA SECURITY QUESTIONNAIRE INTELLIGENCE: REVIEW WORKSPACE
// Path: src/components/questionnaire/SecurityQuestionnaireWorkspace.tsx
//
// Three-panel reviewer workspace built on the existing SKANDA design system
// (PageHeader, Card, Badge, Button, Modal, EnterpriseInput).
//
//    LEFT   : questionnaire sections, completion progress, review queue filters
//    CENTER : original question, proposed/editable response, reviewer comments
//    RIGHT  : evidence citations, controls, freshness, confidence, gaps, history
//
// The workspace never fabricates data: when the authenticated session cannot be
// established it renders an explicit authentication state instead of mock
// content, and every approval/export action is executed by the server which
// re-checks permissions independently of this UI.
// ============================================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Gauge,
  History,
  Layers,
  Link2,
  ListChecks,
  Loader2,
  Lock,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Upload,
  UserCog,
  XCircle
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { PageHeader } from '../common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Modal } from '../common/Modal';
import { Badge, StatusBadgeType } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { UserRole } from '../../types';
import {
  AnswerDraft,
  AnswerDisposition,
  AnswerExplanation,
  AnswerReview,
  AnswerStatus,
  EvidenceSufficiency,
  ExtractedQuestion,
  Questionnaire,
  QuestionnaireAuditEvent,
  QuestionnaireExport,
  QuestionnaireGap,
  RequirementAnalysis,
  ReviewAction,
  ExportPreflightResult,
  TrustCenterDisclosure,
  AnswerAssuranceDependency,
  QuestionnaireObservabilityMetrics,
  RevalidationQueueItem,
  SourceChangeRecord
} from '../../types/questionnaireIntelligenceTypes';
import {
  questionnaireApi,
  QuestionnaireApiError,
  QuestionnaireWorkspace,
  SessionBootstrap,
  clearQuestionnaireSession
} from '../../services/questionnaire/questionnaireApiClient';

// ---------------------------------------------------------------------------
// Presentation helpers (no business logic — classification lives on the server)
// ---------------------------------------------------------------------------

const CATEGORY_LABEL: Record<string, string> = {
  INFORMATION_SECURITY: 'Information Security',
  IDENTITY_AND_ACCESS_MANAGEMENT: 'Identity & Access Management',
  PRIVILEGED_ACCESS: 'Privileged Access',
  NETWORK_SECURITY: 'Network Security',
  CLOUD_SECURITY: 'Cloud Security',
  VULNERABILITY_MANAGEMENT: 'Vulnerability Management',
  INCIDENT_RESPONSE: 'Incident Response',
  BUSINESS_CONTINUITY: 'Business Continuity',
  DISASTER_RECOVERY: 'Disaster Recovery',
  ENCRYPTION: 'Encryption',
  KEY_MANAGEMENT: 'Key Management',
  DATA_PROTECTION: 'Data Protection',
  PRIVACY: 'Privacy',
  DATA_RETENTION: 'Data Retention',
  DATA_DELETION: 'Data Deletion',
  SECURE_DEVELOPMENT: 'Secure Development',
  LOGGING_AND_MONITORING: 'Logging & Monitoring',
  ASSET_MANAGEMENT: 'Asset Management',
  THIRD_PARTY_RISK: 'Third-Party Risk',
  PHYSICAL_SECURITY: 'Physical Security',
  HUMAN_RESOURCES_SECURITY: 'Human Resources Security',
  AI_GOVERNANCE: 'AI Governance',
  REGULATORY_COMPLIANCE: 'Regulatory Compliance',
  CERTIFICATIONS: 'Certifications',
  ORGANIZATIONAL_INFORMATION: 'Organizational Information'
};

const DISPOSITION_BADGE: Record<AnswerDisposition, StatusBadgeType> = {
  VERIFIED_YES: 'compliant',
  VERIFIED_NO: 'non-compliant',
  VERIFIED_OPEN_RESPONSE: 'compliant',
  PARTIALLY_IMPLEMENTED: 'medium',
  NOT_APPLICABLE_WITH_JUSTIFICATION: 'info',
  UNKNOWN: 'pending',
  INSUFFICIENT_EVIDENCE: 'high',
  AWAITING_OWNER_CONFIRMATION: 'medium',
  REQUIRES_SPECIALIST_REVIEW: 'medium'
};

const STATUS_BADGE: Record<AnswerStatus, StatusBadgeType> = {
  DRAFT: 'draft',
  GENERATED: 'info',
  IN_REVIEW: 'in-progress',
  CHANGES_REQUESTED: 'medium',
  APPROVED: 'compliant',
  REJECTED: 'non-compliant',
  SUPERSEDED: 'draft',
  BLOCKED_UNSUPPORTED: 'high',
  // An answer that must be re-verified is neither compliant nor a plain draft:
  // the underlying source changed, so it is flagged for urgent review.
  REVALIDATION_REQUIRED: 'high'
};

const SUFFICIENCY_BADGE: Record<EvidenceSufficiency, StatusBadgeType> = {
  SUFFICIENT: 'compliant',
  PARTIAL: 'medium',
  INSUFFICIENT: 'high',
  CONTRADICTED: 'critical',
  NOT_APPLICABLE: 'info'
};

const FRESHNESS_BADGE: Record<string, StatusBadgeType> = {
  CURRENT: 'compliant',
  DUE_SOON: 'medium',
  STALE: 'high',
  EXPIRED: 'non-compliant',
  UNKNOWN: 'pending'
};

const GAP_SEVERITY_BADGE: Record<QuestionnaireGap['severity'], StatusBadgeType> = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

type QueueFilter =
  | 'ALL'
  | 'NEEDS_REVIEW'
  | 'UNSUPPORTED'
  | 'CONTRADICTED'
  | 'MISSING_EVIDENCE'
  | 'UNAPPROVED'
  | 'MANDATORY_UNANSWERED'
  | 'SPECIALIST';

const FILTER_LABEL: Record<QueueFilter, string> = {
  ALL: 'All questions',
  NEEDS_REVIEW: 'Needs review',
  UNSUPPORTED: 'Unsupported / blocked',
  CONTRADICTED: 'Contradicted',
  MISSING_EVIDENCE: 'Missing evidence',
  UNAPPROVED: 'Not approved',
  MANDATORY_UNANSWERED: 'Mandatory unanswered',
  SPECIALIST: 'Specialist required'
};

type WorkspaceTab = 'WORKSPACE' | 'GAPS' | 'AUDIT' | 'EXPORT' | 'LIBRARY' | 'DISCLOSURES' | 'ASSURANCE';

const TABS: Array<{ id: WorkspaceTab; label: string }> = [
  { id: 'WORKSPACE', label: 'Review workspace' },
  { id: 'GAPS', label: 'Gaps & remediation' },
  { id: 'AUDIT', label: 'Audit history' },
  { id: 'EXPORT', label: 'Export & preflight' },
  { id: 'LIBRARY', label: 'Governed answer library' },
  { id: 'DISCLOSURES', label: 'Trust Center disclosures' },
  { id: 'ASSURANCE', label: 'Continuous assurance' }
];

/** Screen options offered when reporting or reconciling an upstream source. */
const ASSURANCE_SOURCE_KINDS = [
  'CONTROL',
  'CONTROL_TEST',
  'EVIDENCE',
  'POLICY',
  'FRAMEWORK_REQUIREMENT',
  'INTEGRATION',
  'RISK_OR_EXCEPTION',
  'APPROVAL',
  'SCOPE'
] as const;

const ASSURANCE_CHANGE_KINDS = [
  'CONTROL_STATE_CHANGED',
  'CONTROL_TEST_FAILED',
  'EVIDENCE_EXPIRED',
  'EVIDENCE_SUPERSEDED',
  'POLICY_SUPERSEDED',
  'EXCEPTION_RAISED',
  'CONNECTOR_UNHEALTHY',
  'INTEGRATION_DISCONNECTED',
  'APPROVAL_EXPIRED',
  'SCOPE_CHANGED',
  'FRAMEWORK_REQUIREMENT_CHANGED'
] as const;

interface QuestionItem {
  question: ExtractedQuestion;
  requirement: RequirementAnalysis | null;
  answer: AnswerDraft | null;
  gaps: QuestionnaireGap[];
  reviews: AnswerReview[];
  approval: QuestionnaireWorkspace['questions'][number]['approval'];
}

/** The server builds the four explanation sections; the draft id is the request key, not part of the response. */
type DraftExplanation = Omit<AnswerExplanation, 'answerDraftId'>;

/**
 * The questionnaire API authorizes against enterprise GRC role names. This maps
 * the portal's session role onto that vocabulary; the mapping is descriptive
 * only — the server derives permissions from the verified token claim and never
 * trusts a client-supplied role for an authorization decision.
 */
function questionnaireRoleForPortalRole(role: UserRole): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'PLATFORM_ADMIN';
    case 'COMPANY_ADMIN':
      return 'CISO';
    case 'INTERNAL_AUDITOR':
    case 'PLATFORM_AUDITOR':
      return 'AUDITOR';
    case 'DEPARTMENT_CONTRIBUTOR':
      return 'CONTROL_OWNER';
    case 'EXECUTIVE_VIEWER':
      return 'EXECUTIVE';
    default:
      return 'AUDITOR';
  }
}

function isNeedsReview(item: QuestionItem): boolean {
  if (!item.answer) return true;
  return (
    item.answer.status === 'GENERATED' ||
    item.answer.status === 'IN_REVIEW' ||
    item.answer.status === 'CHANGES_REQUESTED' ||
    item.answer.status === 'DRAFT'
  );
}

function matchesFilter(item: QuestionItem, filter: QueueFilter): boolean {
  const answer = item.answer;
  switch (filter) {
    case 'ALL':
      return true;
    case 'NEEDS_REVIEW':
      return isNeedsReview(item);
    case 'UNSUPPORTED':
      return Boolean(answer) && (answer!.status === 'BLOCKED_UNSUPPORTED' || answer!.sufficiency === 'INSUFFICIENT');
    case 'CONTRADICTED':
      return Boolean(answer) && (answer!.sufficiency === 'CONTRADICTED' || answer!.contradictionWarnings.length > 0);
    case 'MISSING_EVIDENCE':
      return Boolean(answer) && answer!.missingInformation.length > 0;
    case 'UNAPPROVED':
      return !item.approval;
    case 'MANDATORY_UNANSWERED':
      return item.question.mandatory && (!answer || (!answer.customerFacingResponse && answer.status !== 'APPROVED'));
    case 'SPECIALIST':
      return Boolean(item.requirement?.specialistApprovalRequired);
    default:
      return true;
  }
}

function formatDateTime(value?: string): string {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

// ---------------------------------------------------------------------------
// Small presentational blocks
// ---------------------------------------------------------------------------

const MetaLine: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-start justify-between gap-3 py-1.5 text-xs">
    <span className="text-[#64748B] dark:text-[#94A3B8] shrink-0">{label}</span>
    <span className="text-right text-[#0F172A] dark:text-[#E2E8F0] font-medium break-words">{children}</span>
  </div>
);

const EmptyState: React.FC<{ icon: React.ComponentType<{ className?: string }>; title: string; detail: string }> = ({
  icon: Icon,
  title,
  detail
}) => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#E2E8F0] dark:border-[#273449] px-6 py-10 text-center">
    <Icon className="w-6 h-6 text-[#94A3B8] dark:text-[#64748B]" />
    <p className="text-sm font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{title}</p>
    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-md">{detail}</p>
  </div>
);

const ProgressBar: React.FC<{ value: number; total: number; tone?: string }> = ({ value, total, tone = 'bg-[#2563EB]' }) => {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div className="h-1.5 w-full rounded-full bg-[#E2E8F0] dark:bg-[#1E293B] overflow-hidden" role="presentation">
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Workspace
// ---------------------------------------------------------------------------

export const SecurityQuestionnaireWorkspace: React.FC = () => {
  const { currentUser, currentRole, currentTenantId } = useGRC();

  const bootstrap: SessionBootstrap = useMemo(
    () => ({
      email: currentUser?.email || 'reviewer@skanda.local',
      role: questionnaireRoleForPortalRole(currentRole),
      tenantId: currentTenantId || 'tenant_default'
    }),
    [currentUser?.email, currentRole, currentTenantId]
  );

  const [sessionState, setSessionState] = useState<'PENDING' | 'READY' | 'UNAVAILABLE'>('PENDING');
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<QuestionnaireWorkspace | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [tab, setTab] = useState<WorkspaceTab>('WORKSPACE');
  const [filter, setFilter] = useState<QueueFilter>('ALL');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [editBuffer, setEditBuffer] = useState<Record<string, string>>({});
  const [reviewComment, setReviewComment] = useState('');
  const [reviewJustification, setReviewJustification] = useState('');
  const [reassignRole, setReassignRole] = useState('SECURITY');
  const [explanation, setExplanation] = useState<DraftExplanation | null>(null);
  const [selectedForBulk, setSelectedForBulk] = useState<Record<string, boolean>>({});

  // Continuous assurance state (all values come from the server).
  const [assuranceQueue, setAssuranceQueue] = useState<RevalidationQueueItem[]>([]);
  const [assuranceDeps, setAssuranceDeps] = useState<AnswerAssuranceDependency[]>([]);
  const [assuranceChangesList, setAssuranceChangesList] = useState<SourceChangeRecord[]>([]);
  const [assuranceMetricsView, setAssuranceMetricsView] = useState<QuestionnaireObservabilityMetrics | null>(null);
  const [changeKind, setChangeKind] = useState<string>('CONTROL_TEST_FAILED');
  const [changeSourceKind, setChangeSourceKind] = useState<string>('CONTROL_TEST');
  const [changeSourceId, setChangeSourceId] = useState<string>('');
  const [changeNewState, setChangeNewState] = useState<string>('FAILED');
  const [bulkRole, setBulkRole] = useState('SECURITY');
  const [bulkReport, setBulkReport] = useState<string | null>(null);

  const [gaps, setGaps] = useState<QuestionnaireGap[]>([]);
  const [auditEvents, setAuditEvents] = useState<QuestionnaireAuditEvent[]>([]);
  const [auditChain, setAuditChain] = useState<{ valid: boolean; brokenAt?: string } | null>(null);
  const [exportsList, setExportsList] = useState<QuestionnaireExport[]>([]);
  const [preflight, setPreflight] = useState<ExportPreflightResult | null>(null);
  const [libraryEntries, setLibraryEntries] = useState<any[]>([]);
  const [disclosures, setDisclosures] = useState<TrustCenterDisclosure[]>([]);
  const [disclosureDraft, setDisclosureDraft] = useState({ title: '', category: 'SECURITY_POLICY_SUMMARY', publicContent: '' });

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [mappingModalOpen, setMappingModalOpen] = useState(false);
  const [extractionModalOpen, setExtractionModalOpen] = useState(false);
  const [preflightModalOpen, setPreflightModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportException, setExportException] = useState({ exceptionId: '', reason: '' });
  const [mappingDraft, setMappingDraft] = useState({ worksheet: '', questionColumn: '', responseColumn: '', headerRow: 1, sectionColumn: '' });
  const [visibleCount, setVisibleCount] = useState(200);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------------------
  // Session bootstrap — no silent fallback to mock data
  // -------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // A single authenticated round-trip proves the platform session works
        // for this tenant before any questionnaire content is rendered.
        await questionnaireApi.health(bootstrap);
        if (cancelled) return;
        setSessionState('READY');
        setSessionError(null);
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof QuestionnaireApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Unknown error';
        setSessionState('UNAVAILABLE');
        setSessionError(message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bootstrap]);

  const refreshList = useCallback(async () => {
    const list = await questionnaireApi.list(bootstrap, { limit: 50 });
    setQuestionnaires(Array.isArray(list) ? list : []);
    return list;
  }, [bootstrap]);

  const openQuestionnaire = useCallback(
    async (questionnaireId: string) => {
      setBusy('Loading questionnaire…');
      setError(null);
      try {
        const view = await questionnaireApi.workspace(bootstrap, questionnaireId);
        setWorkspace(view);
        setActiveId(questionnaireId);
        setSelectedQuestionId(view.questions[0]?.question.id || null);
        setEditBuffer({});
        setSelectedForBulk({});
        setExplanation(null);
        setVisibleCount(200);
      } catch (err: any) {
        setError(err?.message || 'Unable to load the questionnaire workspace.');
      } finally {
        setBusy(null);
      }
    },
    [bootstrap]
  );

  useEffect(() => {
    if (sessionState !== 'READY') return;
    let cancelled = false;
    (async () => {
      setBusy('Loading questionnaires…');
      try {
        const list = await refreshList();
        if (cancelled) return;
        const first = Array.isArray(list) && list.length > 0 ? list[0] : null;
        if (first) {
          await openQuestionnaire(first.id);
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Unable to list questionnaires for this tenant.');
      } finally {
        if (!cancelled) setBusy(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionState, refreshList, openQuestionnaire]);

  const reloadWorkspace = useCallback(async () => {
    if (!activeId) return;
    const view = await questionnaireApi.workspace(bootstrap, activeId);
    setWorkspace(view);
  }, [activeId, bootstrap]);

  const selectedItem: QuestionItem | null = useMemo(() => {
    if (!workspace || !selectedQuestionId) return null;
    return (workspace.questions.find(q => q.question.id === selectedQuestionId) as QuestionItem) || null;
  }, [workspace, selectedQuestionId]);

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------

  const handleImport = async (file: File) => {
    setBusy('Uploading and extracting…');
    setError(null);
    setNotice(null);
    try {
      const idempotencyKey =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `import-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const result = await questionnaireApi.importQuestionnaire({ file, bootstrap, idempotencyKey });
      setImportModalOpen(false);
      await refreshList();
      await openQuestionnaire(result.questionnaire.id);
      setNotice(
        `Imported "${result.questionnaire.title}" · ${result.questionnaire.questionCount} questions · ${result.questionsRequiringCorrection} requiring correction` +
          (result.idempotentReplay ? ' · idempotent replay (no duplicate created)' : '')
      );
      setExtractionModalOpen(true);
    } catch (err: any) {
      setError(err?.message || 'Import failed.');
    } finally {
      setBusy(null);
    }
  };

  const handleAnalyze = async () => {
    if (!activeId) return;
    setBusy('Generating evidence-backed drafts…');
    setError(null);
    setNotice(null);
    try {
      const result = await questionnaireApi.analyze(bootstrap, activeId, {});
      await reloadWorkspace();
      const failed = result.job.progress.failed;
      setNotice(
        `Analysis ${result.job.status}: ${result.job.progress.processed}/${result.job.progress.total} questions processed` +
          (failed > 0 ? `, ${failed} failed (see per-question errors)` : '') +
          '. No answer is approved automatically.'
      );
    } catch (err: any) {
      const detail = err instanceof QuestionnaireApiError ? err.detail : null;
      const failures = detail?.job?.errors?.length ?? 0;
      setError(
        `${err?.message || 'Analysis failed.'}` +
          (failures > 0 ? ` Per-question failures: ${detail.job.errors.map((e: any) => e.item).join(', ')}.` : '')
      );
      await reloadWorkspace().catch(() => undefined);
    } finally {
      setBusy(null);
    }
  };

  const handleMappingSave = async () => {
    if (!activeId) return;
    setBusy('Correcting column mapping…');
    setError(null);
    try {
      await questionnaireApi.correctMapping(bootstrap, activeId, {
        worksheet: mappingDraft.worksheet,
        questionColumn: mappingDraft.questionColumn || undefined,
        responseColumn: mappingDraft.responseColumn === '' ? null : mappingDraft.responseColumn,
        headerRow: Number(mappingDraft.headerRow) || undefined,
        sectionColumn: mappingDraft.sectionColumn || null
      });
      await reloadWorkspace();
      await refreshList();
      setMappingModalOpen(false);
      setNotice(
        `Mapping confirmed for worksheet "${mappingDraft.worksheet}". Response cells were re-bound for the affected rows and the actor who confirmed the mapping was recorded in the audit history.`
      );
    } catch (err: any) {
      setError(err?.message || 'Mapping correction failed.');
    } finally {
      setBusy(null);
    }
  };

  const handleDraftEdit = async (draft: AnswerDraft) => {
    const text = editBuffer[draft.id];
    if (text === undefined || text === draft.customerFacingResponse) {
      setNotice('No wording change to save.');
      return;
    }
    setBusy('Saving response wording…');
    setError(null);
    try {
      await questionnaireApi.editDraft(bootstrap, draft.id, { customerFacingResponse: text });
      await reloadWorkspace();
      setNotice('Response wording saved as a new draft version (previous wording retained in version history).');
    } catch (err: any) {
      setError(err?.message || 'Unable to save the wording change.');
    } finally {
      setBusy(null);
    }
  };

  const handleReview = async (draftId: string, action: ReviewAction) => {
    setBusy(`${action.replace(/_/g, ' ').toLowerCase()}…`);
    setError(null);
    setNotice(null);
    try {
      await questionnaireApi.review(bootstrap, draftId, {
        action,
        comment: reviewComment.trim() || undefined,
        assignedToRole: action === 'REASSIGN' ? reassignRole : undefined,
        // Required by the server when a blocked (insufficient-evidence) draft is
        // approved directly, and recorded permanently in the approval record.
        selfApprovalJustification: reviewJustification.trim() || undefined
      });
      setReviewComment('');
      setReviewJustification('');
      await reloadWorkspace();
      setNotice(`${action.replace(/_/g, ' ')} recorded against the draft and written to the questionnaire audit history.`);
    } catch (err: any) {
      setError(err?.message || 'The review action was rejected.');
    } finally {
      setBusy(null);
    }
  };

  const handleExplain = async (draftId: string) => {
    setBusy('Building the explanation…');
    setError(null);
    try {
      const result = await questionnaireApi.explain(bootstrap, draftId);
      setExplanation(result.explanation);
    } catch (err: any) {
      setError(err?.message || 'Unable to build the answer explanation.');
    } finally {
      setBusy(null);
    }
  };

  const handlePreflight = async () => {
    if (!activeId) return;
    setBusy('Running export preflight…');
    setError(null);
    try {
      const result = await questionnaireApi.exportPreflight(bootstrap, activeId, {});
      setPreflight(result);
      setPreflightModalOpen(true);
    } catch (err: any) {
      setError(err?.message || 'Preflight failed.');
    } finally {
      setBusy(null);
    }
  };

  const handleExport = async () => {
    if (!activeId || !workspace) return;
    setBusy('Generating the completed questionnaire…');
    setError(null);
    try {
      const result = await questionnaireApi.downloadExport(bootstrap, activeId, {
        approvedExceptionId: exportException.exceptionId || undefined,
        approvedExceptionReason: exportException.reason || undefined
      });
      const url = URL.createObjectURL(result.blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${workspace.questionnaire.title.replace(/[^\w.-]+/g, '_')}.${workspace.questionnaire.format.toLowerCase()}`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      setExportModalOpen(false);
      setExportException({ exceptionId: '', reason: '' });
      await reloadWorkspace();
      await refreshList();
      setExportsList(await questionnaireApi.listExports(bootstrap, activeId));
      setNotice(
        `Export ${result.exportId} generated · sha256 ${result.digest.slice(0, 16)}… · ${result.unresolved} unresolved question(s) preserved in the file.`
      );
    } catch (err: any) {
      if (err instanceof QuestionnaireApiError && err.preflight) {
        setPreflight(err.preflight);
        setPreflightModalOpen(true);
      }
      setError(err?.message || 'Export was rejected.');
    } finally {
      setBusy(null);
    }
  };

  const handleBulkAssign = async () => {
    const targets = Object.keys(selectedForBulk).filter(id => selectedForBulk[id]);
    if (targets.length === 0) {
      setNotice('Select at least one question to assign.');
      return;
    }
    setBusy(`Assigning ${targets.length} question(s)…`);
    const failures: string[] = [];
    let succeeded = 0;
    for (const questionId of targets) {
      const item = workspace?.questions.find(q => q.question.id === questionId);
      const draft = item?.answer;
      if (!draft) {
        failures.push(`${questionId}: no draft exists yet (run "Generate suggestions" first)`);
        continue;
      }
      try {
        await questionnaireApi.review(bootstrap, draft.id, { action: 'REASSIGN', assignedToRole: bulkRole });
        succeeded += 1;
      } catch (err: any) {
        failures.push(`${draft.id}: ${err?.message || 'rejected'}`);
      }
    }
    setBulkReport(`Assigned ${succeeded} of ${targets.length}.${failures.length ? ` Failures: ${failures.join(' | ')}` : ''}`);
    setSelectedForBulk({});
    await reloadWorkspace().catch(() => undefined);
    setBusy(null);
  };

  /**
   * Reports an upstream change. The server decides the impact: this handler only
   * submits the observation and renders whatever the server concluded (including
   * a 422 rejection, which means nothing was revalidated).
   */
  const handleReportSourceChange = async () => {
    if (!changeSourceId.trim()) {
      setError('A source identifier is required: a change that cannot be tied to a specific source is not evaluated.');
      return;
    }
    setBusy('Submitting monitoring change…');
    try {
      const result = await questionnaireApi.ingestSourceChange(bootstrap, {
        kind: changeKind as any,
        sourceKind: changeSourceKind as any,
        sourceId: changeSourceId.trim(),
        newState: changeNewState.trim() || undefined,
        sourceObservedAt: new Date().toISOString(),
        monitoringMode: 'EVENT_DRIVEN'
      });
      setNotice(
        `Change ${result.changeId}: ${result.changeStatus}. ${result.impactedAnswers} answer(s) impacted, ${result.revalidations.length} revalidation event(s), ${result.notificationsSuppressed} repeat notification(s) suppressed.${
          result.lastError ? ` Error: ${result.lastError}` : ''
        }`
      );
      await loadTabData();
    } catch (err: any) {
      setError(
        err instanceof QuestionnaireApiError
          ? `${err.message}${err.status === 422 ? ' The change was recorded but not applied; no compliance state was changed.' : ''}`
          : err?.message || 'The monitoring change was rejected.'
      );
    } finally {
      setBusy(null);
    }
  };

  /**
   * Reconciliation: the caller states what it actually observed at the provider.
   * Sources it did not observe come back as unobserved — never as healthy.
   */
  const handleReconcile = async () => {
    if (!changeSourceId.trim()) {
      setError('Provide the source identifier that was observed at the provider.');
      return;
    }
    setBusy('Reconciling observed source state…');
    try {
      const result = await questionnaireApi.reconcileAssurance(bootstrap, {
        monitoringMode: 'MANUAL_REFRESH',
        questionnaireId: activeId || undefined,
        sourceStates: [
          {
            sourceKind: changeSourceKind,
            sourceId: changeSourceId.trim(),
            state: changeNewState.trim() || 'OK',
            observedAt: new Date().toISOString()
          }
        ]
      });
      setNotice(
        `Reconciliation (${result.monitoringMode}) compared ${result.polled} registered source(s): ${result.revalidationsRaised} revalidation event(s) raised, ${result.unobservedCount} source(s) not observed (not assumed healthy).`
      );
      await loadTabData();
    } catch (err: any) {
      setError(err?.message || 'Reconciliation failed.');
    } finally {
      setBusy(null);
    }
  };

  const loadTabData = useCallback(async () => {
    if (!activeId) return;
    try {
      if (tab === 'GAPS') {
        setGaps(await questionnaireApi.listGaps(bootstrap, activeId));
      } else if (tab === 'AUDIT') {
        setAuditEvents(await questionnaireApi.audit(bootstrap, activeId));
        setAuditChain(await questionnaireApi.verifyAudit(bootstrap, activeId));
      } else if (tab === 'EXPORT') {
        setExportsList(await questionnaireApi.listExports(bootstrap, activeId));
      } else if (tab === 'LIBRARY') {
        setLibraryEntries(await questionnaireApi.listLibrary(bootstrap));
      } else if (tab === 'DISCLOSURES') {
        setDisclosures(await questionnaireApi.listDisclosures(bootstrap));
      } else if (tab === 'ASSURANCE') {
        const [queue, deps, changes, metrics] = await Promise.all([
          questionnaireApi.revalidationQueue(bootstrap, activeId),
          questionnaireApi.assuranceDependencies(bootstrap, activeId),
          questionnaireApi.assuranceChanges(bootstrap, 25),
          questionnaireApi.assuranceMetrics(bootstrap)
        ]);
        setAssuranceQueue(queue);
        setAssuranceDeps(deps);
        setAssuranceChangesList(changes);
        setAssuranceMetricsView(metrics);
      }
    } catch (err: any) {
      setError(err?.message || `Unable to load the ${tab.toLowerCase()} data.`);
    }
  }, [activeId, bootstrap, tab]);

  useEffect(() => {
    if (sessionState === 'READY' && activeId) {
      void loadTabData();
    }
  }, [sessionState, activeId, loadTabData]);

  // -------------------------------------------------------------------------
  // Derived collection state
  // -------------------------------------------------------------------------

  const items: QuestionItem[] = (workspace?.questions as QuestionItem[]) || [];

  const filteredItems = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return items.filter(item => {
      if (!matchesFilter(item, filter)) return false;
      if (!needle) return true;
      return (
        item.question.originalText.toLowerCase().includes(needle) ||
        (item.question.questionIdentifier || '').toLowerCase().includes(needle) ||
        (item.question.sectionName || '').toLowerCase().includes(needle)
      );
    });
  }, [items, filter, search]);

  const sections = useMemo(() => {
    const byName = new Map<string, QuestionItem[]>();
    items.forEach(item => {
      const key = item.question.sectionName || 'Unsectioned';
      if (!byName.has(key)) byName.set(key, []);
      byName.get(key)!.push(item);
    });
    return Array.from(byName.entries()).map(([name, list]) => ({
      name,
      total: list.length,
      needsReview: list.filter(isNeedsReview).length,
      firstQuestionId: list[0]?.question.id || null
    }));
  }, [items]);

  const completion = workspace?.completion;
  const liveMode = sessionState === 'READY';

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  if (sessionState === 'PENDING') {
    return (
      <div className="space-y-4">
        <PageHeader
          id="security-questionnaire-workspace"
          category="Customer Assurance"
          categoryIcon={ClipboardCheck}
          title="Security Questionnaire Intelligence"
          description="Evidence-backed questionnaire responses with governed approval and audit-ready export."
        />
        <Card>
          <CardContent className="flex items-center gap-3 py-8 justify-center text-sm text-[#64748B] dark:text-[#94A3B8]">
            <Loader2 className="w-4 h-4 animate-spin" />
            Establishing the authenticated server session for this tenant…
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sessionState === 'UNAVAILABLE') {
    return (
      <div className="space-y-4">
        <PageHeader
          id="security-questionnaire-workspace"
          category="Customer Assurance"
          categoryIcon={ClipboardCheck}
          title="Security Questionnaire Intelligence"
          description="Evidence-backed questionnaire responses with governed approval and audit-ready export."
          badges={[{ label: 'SERVER SESSION REQUIRED', variant: 'rose', icon: Lock }]}
        />
        <Card>
          <CardHeader icon={Lock} title="Authenticated server session unavailable" subtitle="No questionnaire data is displayed because no tenant could be verified" />
          <CardContent className="space-y-3 text-sm text-[#334155] dark:text-[#CBD5E1]">
            <p>
              Every questionnaire route requires a cryptographically verified bearer token, and the tenant is taken from
              those verified claims. The development session bootstrap was refused, so the workspace refuses to render
              questionnaire content rather than displaying placeholder data.
            </p>
            <div className="rounded-lg border border-[#E2E8F0] dark:border-[#273449] bg-[#F8FAFC] dark:bg-[#0B1220] p-3 text-xs font-mono break-words">
              {sessionError || 'No error detail returned.'}
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              In production the platform identity provider (SSO/SCIM federation) must issue the token; the development
              bootstrap endpoint deliberately returns 404 when NODE_ENV=production.
            </p>
            <div className="flex gap-2">
              <Button
                variant="primary"
                icon={RefreshCw}
                onClick={() => {
                  clearQuestionnaireSession();
                  setSessionState('PENDING');
                  setSessionError(null);
                }}
              >
                Retry session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4" id="security-questionnaire-workspace">
      <PageHeader
        id="security-questionnaire-page-header"
        category="Customer Assurance"
        categoryIcon={ClipboardCheck}
        title="Security Questionnaire Intelligence"
        description="Upload a customer questionnaire, review extracted questions, inspect the evidence behind each answer, route approvals and export the completed file in its original format."
        badges={[
          { label: `${questionnaires.length} QUESTIONNAIRE(S)`, variant: 'indigo' },
          { label: 'EVIDENCE-BACKED ONLY', variant: 'emerald', icon: ShieldCheck },
          { label: `ROLE: ${bootstrap.role}`, variant: 'slate', icon: Lock }
        ]}
        actions={
          // Seven stage actions would otherwise consume the whole header row and
          // squeeze the title/description into a one-word-wide column, so the
          // action block is capped and wraps inside that cap instead.
          <div className="flex flex-wrap items-center gap-2 xl:max-w-3xl xl:justify-end">
            <Button variant="primary" icon={Upload} onClick={() => setImportModalOpen(true)} disabled={!liveMode}>
              Import questionnaire
            </Button>
            <Button
              variant="secondary"
              icon={ListChecks}
              onClick={() => setMappingModalOpen(true)}
              disabled={!activeId || !workspace?.questionnaire.extractionSummary}
            >
              Map fields
            </Button>
            <Button variant="secondary" icon={ClipboardCheck} onClick={() => setExtractionModalOpen(true)} disabled={!workspace}>
              Validate extraction
            </Button>
            <Button variant="secondary" icon={Sparkles} onClick={handleAnalyze} disabled={!activeId || Boolean(busy)}>
              Generate suggestions
            </Button>
            <Button
              variant="secondary"
              icon={Gauge}
              onClick={() => {
                setFilter('NEEDS_REVIEW');
                setTab('WORKSPACE');
              }}
              disabled={!workspace}
            >
              Review unresolved ({items.filter(isNeedsReview).length})
            </Button>
            <Button variant="secondary" icon={ShieldAlert} onClick={handlePreflight} disabled={!activeId || Boolean(busy)}>
              Preview export
            </Button>
            <Button variant="primary" icon={Download} onClick={() => setExportModalOpen(true)} disabled={!activeId || Boolean(busy)}>
              Export questionnaire
            </Button>
          </div>
        }
      />

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-[#FECACA] dark:border-[#991B1B] bg-[#FEF2F2] dark:bg-[#450A0A] px-4 py-3 text-xs text-[#B91C1C] dark:text-[#FCA5A5]">
          <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="font-semibold">The server refused or failed this operation</p>
            <p className="break-words">{error}</p>
          </div>
          <button className="ml-auto text-[11px] underline shrink-0" onClick={() => setError(null)}>
            dismiss
          </button>
        </div>
      )}
      {notice && (
        <div className="flex items-start gap-2 rounded-xl border border-[#A7F3D0] dark:border-[#065F46] bg-[#ECFDF5] dark:bg-[#052E2B] px-4 py-3 text-xs text-[#047857] dark:text-[#6EE7B7]">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <p className="break-words">{notice}</p>
          <button className="ml-auto text-[11px] underline shrink-0" onClick={() => setNotice(null)}>
            dismiss
          </button>
        </div>
      )}
      {busy && (
        <div className="flex items-center gap-2 rounded-xl border border-[#BFDBFE] dark:border-[#1E40AF] bg-[#EFF6FF] dark:bg-[#172554] px-4 py-2 text-xs text-[#1D4ED8] dark:text-[#BFDBFE]">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          {busy}
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex flex-wrap gap-1 rounded-xl border border-[#E2E8F0] dark:border-[#273449] bg-white dark:bg-[#111827] p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id}
            className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors ${
              tab === t.id
                ? 'bg-[#0F2747] text-white dark:bg-[#2563EB]'
                : 'text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'WORKSPACE' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* ------------------------------ LEFT ----------------------------- */}
          <div className="xl:col-span-3 space-y-4">
            <Card>
              <CardHeader
                icon={FileSpreadsheet}
                title="Questionnaires"
                subtitle={`${questionnaires.length} imported for this tenant`}
                action={
                  <Button variant="ghost" size="sm" icon={RefreshCw} onClick={() => void refreshList()} aria-label="Reload questionnaire list" />
                }
              />
              <CardContent className="space-y-1.5 max-h-72 overflow-y-auto">
                {questionnaires.length === 0 && (
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    No questionnaires imported yet. Start with “Import questionnaire”.
                  </p>
                )}
                {questionnaires.map(q => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => void openQuestionnaire(q.id)}
                    className={`w-full text-left rounded-lg border px-3 py-2 transition-colors ${
                      q.id === activeId
                        ? 'border-[#2563EB] bg-[#EFF6FF] dark:bg-[#172554]'
                        : 'border-[#E2E8F0] dark:border-[#273449] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]'
                    }`}
                  >
                    <p className="text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0] truncate">{q.title}</p>
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      {q.format} · {q.questionCount} questions · {q.status.replace(/_/g, ' ')}
                    </p>
                  </button>
                ))}
              </CardContent>
            </Card>

            {workspace && completion && (
              <Card>
                <CardHeader icon={Gauge} title="Completion & review status" subtitle={workspace.questionnaire.requestingOrganization} />
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <MetaLine label="Questions">{completion.total}</MetaLine>
                    <MetaLine label="Drafted">{completion.drafted}</MetaLine>
                    <MetaLine label="Approved">{completion.approved}</MetaLine>
                    <MetaLine label="Blocked / unsupported">{completion.blocked}</MetaLine>
                    <MetaLine label="Mandatory unanswered">{completion.mandatoryUnanswered}</MetaLine>
                    <MetaLine label="Open gaps">{completion.openGaps}</MetaLine>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mb-1">Drafted {completion.drafted}/{completion.total}</p>
                      <ProgressBar value={completion.drafted} total={completion.total} />
                    </div>
                    <div>
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mb-1">Approved {completion.approved}/{completion.total}</p>
                      <ProgressBar value={completion.approved} total={completion.total} tone="bg-[#059669]" />
                    </div>
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    Approved counts reflect server-recorded approvals only. A generated draft is never counted as approved.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader icon={Layers} title="Sections" subtitle={`${sections.length} detected section(s)`} />
              <CardContent className="space-y-1.5 max-h-56 overflow-y-auto">
                {sections.length === 0 && <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">No questions loaded.</p>}
                {sections.map(s => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => s.firstQuestionId && setSelectedQuestionId(s.firstQuestionId)}
                    className="w-full text-left rounded-lg border border-[#E2E8F0] dark:border-[#273449] px-3 py-2 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
                  >
                    <p className="text-xs font-medium text-[#0F172A] dark:text-[#E2E8F0] truncate">{s.name}</p>
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      {s.total} question(s) · {s.needsReview} awaiting review
                    </p>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader icon={Filter} title="Filters & navigation" subtitle="Evidence quality first, then throughput" />
              <CardContent className="space-y-2">
                <label className="block">
                  <span className="sr-only">Search questions</span>
                  <div className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] dark:border-[#273449] px-2 h-9">
                    <Search className="w-3.5 h-3.5 text-[#94A3B8]" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search question text or identifier"
                      className="flex-1 bg-transparent text-xs outline-none text-[#0F172A] dark:text-[#E2E8F0]"
                    />
                  </div>
                </label>
                <div className="flex flex-wrap gap-1">
                  {(Object.keys(FILTER_LABEL) as QueueFilter[]).map(key => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFilter(key)}
                      className={`h-7 px-2 rounded-full border text-[11px] font-medium ${
                        filter === key
                          ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8] dark:bg-[#172554] dark:text-[#BFDBFE]'
                          : 'border-[#E2E8F0] dark:border-[#273449] text-[#475569] dark:text-[#CBD5E1]'
                      }`}
                    >
                      {FILTER_LABEL[key]}
                    </button>
                  ))}
                </div>

                <div className="mt-2 space-y-1 max-h-72 overflow-y-auto pr-1">
                  {filteredItems.length === 0 && (
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">No question matches this filter.</p>
                  )}
                  {filteredItems.slice(0, visibleCount).map(item => {
                    const a = item.answer;
                    return (
                      <button
                        key={item.question.id}
                        type="button"
                        onClick={() => {
                          setSelectedQuestionId(item.question.id);
                          setExplanation(null);
                        }}
                        className={`w-full text-left rounded-lg border px-2.5 py-2 transition-colors ${
                          item.question.id === selectedQuestionId
                            ? 'border-[#2563EB] bg-[#EFF6FF] dark:bg-[#172554]'
                            : 'border-[#E2E8F0] dark:border-[#273449] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={Boolean(selectedForBulk[item.question.id])}
                            onClick={e => e.stopPropagation()}
                            onChange={e =>
                              setSelectedForBulk(prev => ({ ...prev, [item.question.id]: e.target.checked }))
                            }
                            aria-label={`Select ${item.question.questionIdentifier || item.question.id} for bulk assignment`}
                            className="w-3.5 h-3.5 shrink-0"
                          />
                          <span className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] truncate">
                            {item.question.questionIdentifier || `Q${item.question.order}`}
                          </span>
                          {item.question.mandatory && (
                            <span className="text-[10px] font-semibold text-[#B91C1C] dark:text-[#FCA5A5]">MANDATORY</span>
                          )}
                          <span className="ml-auto text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                            {a ? a.status.replace(/_/g, ' ') : 'NO DRAFT'}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-[#334155] dark:text-[#CBD5E1] line-clamp-2">
                          {item.question.originalText}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.requirement && <Badge size="sm" status="info">{CATEGORY_LABEL[item.requirement.primaryCategory] || item.requirement.primaryCategory}</Badge>}
                          {a && <Badge size="sm" status={DISPOSITION_BADGE[a.disposition]}>{a.disposition.replace(/_/g, ' ')}</Badge>}
                          {item.gaps.length > 0 && <Badge size="sm" status="high">{item.gaps.length} gap(s)</Badge>}
                          {item.approval && <Badge size="sm" status="compliant">APPROVED</Badge>}
                        </div>
                      </button>
                    );
                  })}
                  {filteredItems.length > visibleCount && (
                    <Button variant="outline" size="sm" fullWidth onClick={() => setVisibleCount(c => c + 200)}>
                      Load {Math.min(200, filteredItems.length - visibleCount)} more of {filteredItems.length}
                    </Button>
                  )}
                </div>

                <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#273449] space-y-2">
                  <p className="text-[11px] font-semibold text-[#0F172A] dark:text-[#E2E8F0] flex items-center gap-1">
                    <UserCog className="w-3.5 h-3.5" /> Bulk assignment
                  </p>
                  <select
                    value={bulkRole}
                    onChange={e => setBulkRole(e.target.value)}
                    aria-label="Assign selected questions to role"
                    className="w-full h-9 rounded-lg border border-[#E2E8F0] dark:border-[#273449] bg-transparent px-2 text-xs text-[#0F172A] dark:text-[#E2E8F0]"
                  >
                    {['SECURITY', 'IT', 'IAM', 'INFRASTRUCTURE', 'ENGINEERING', 'PRIVACY', 'LEGAL', 'HR', 'BUSINESS_CONTINUITY', 'VENDOR_MANAGEMENT', 'COMPLIANCE', 'EXECUTIVE'].map(r => (
                      <option key={r} value={r}>
                        {r.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    icon={UserCog}
                    disabled={Boolean(busy) || !workspace}
                    onClick={() => void handleBulkAssign()}
                  >
                    Assign {Object.values(selectedForBulk).filter(Boolean).length} selected
                  </Button>
                  <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                    Bulk approval is intentionally unavailable: each approval is recorded individually with its own approver
                    identity, content hash and material-claim class.
                  </p>
                  {bulkReport && <p className="text-[11px] text-[#334155] dark:text-[#CBD5E1] break-words">{bulkReport}</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ----------------------------- CENTER ---------------------------- */}
          <div className="xl:col-span-6 space-y-4">
            {!workspace && (
              <Card>
                <CardContent className="py-4">
                  <EmptyState
                    icon={FileSpreadsheet}
                    title="No questionnaire open"
                    detail="Import a questionnaire (XLSX, CSV, DOCX or PDF) or pick one from the list to begin an evidence-backed review."
                  />
                </CardContent>
              </Card>
            )}

            {workspace && !selectedItem && (
              <Card>
                <CardContent className="py-4">
                  <EmptyState
                    icon={Search}
                    title="No question matches the current filter"
                    detail="Clear the search box or switch the queue filter to “All questions”."
                  />
                </CardContent>
              </Card>
            )}

            {selectedItem && (
              <>
                <Card>
                  <CardHeader
                    icon={MessageSquare}
                    title={`${selectedItem.question.sectionName || 'Section'} · ${selectedItem.question.questionIdentifier || `Q${selectedItem.question.order}`}`}
                    subtitle={`Source: ${selectedItem.question.sourceLocation.worksheet}${
                      selectedItem.question.sourceLocation.rowNumber ? ` · row ${selectedItem.question.sourceLocation.rowNumber}` : ''
                    }${selectedItem.question.sourceLocation.responseCell ? ` · response cell ${selectedItem.question.sourceLocation.responseCell}` : ''}`}
                    badge={
                      <Badge
                        status={
                          selectedItem.question.confidenceBand === 'HIGH'
                            ? 'compliant'
                            : selectedItem.question.confidenceBand === 'MEDIUM'
                              ? 'medium'
                              : selectedItem.question.confidenceBand === 'LOW'
                                ? 'high'
                                : 'non-compliant'
                        }
                      >
                        EXTRACTION {selectedItem.question.confidenceBand} · {selectedItem.question.extractionConfidence}/100
                      </Badge>
                    }
                  />
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wide">
                        Original question
                      </p>
                      <p className="text-sm text-[#0F172A] dark:text-[#E2E8F0] whitespace-pre-wrap">{selectedItem.question.originalText}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                      <MetaLine label="Response type">{selectedItem.question.responseType}</MetaLine>
                      <MetaLine label="Mandatory">{selectedItem.question.mandatory ? 'Yes' : 'No'}</MetaLine>
                      <MetaLine label="Answer options">{selectedItem.question.answerOptions.length ? selectedItem.question.answerOptions.join(' / ') : '—'}</MetaLine>
                      <MetaLine label="Requested evidence">{selectedItem.question.evidenceRequirement || '—'}</MetaLine>
                      <MetaLine label="Customer instructions">{selectedItem.question.instructions || '—'}</MetaLine>
                      <MetaLine label="Existing response in source">{selectedItem.question.existingResponse || '—'}</MetaLine>
                    </div>
                    {selectedItem.question.extractionWarnings.length > 0 && (
                      <div className="rounded-lg border border-[#FDE68A] dark:border-[#92400E] bg-[#FFFBEB] dark:bg-[#422006] px-3 py-2 text-[11px] text-[#B45309] dark:text-[#FCD34D]">
                        <p className="font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Extraction warnings
                        </p>
                        <ul className="list-disc pl-4 mt-1 space-y-0.5">
                          {selectedItem.question.extractionWarnings.map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectedItem.question.requiresHumanCorrection && (
                      <div className="rounded-lg border border-[#FECACA] dark:border-[#991B1B] bg-[#FEF2F2] dark:bg-[#450A0A] px-3 py-2 text-[11px] text-[#B91C1C] dark:text-[#FCA5A5]">
                        This question was flagged as requiring human correction before its response may be exported. Correct the
                        field mapping, then re-run the analysis.
                      </div>
                    )}
                  </CardContent>
                </Card>

                {selectedItem.requirement && (
                  <Card>
                    <CardHeader
                      icon={Sparkles}
                      title="Question intelligence"
                      subtitle={`Knowledge key ${selectedItem.requirement.knowledgeKey}`}
                      badge={<Badge status="info">{Math.round(selectedItem.requirement.classificationConfidence)}/100 classification estimate</Badge>}
                    />
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wide">Normalized interpretation</p>
                        <p className="text-xs text-[#0F172A] dark:text-[#E2E8F0]">{selectedItem.requirement.normalizedInterpretation}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wide">Underlying requirement</p>
                        <p className="text-xs text-[#0F172A] dark:text-[#E2E8F0]">{selectedItem.requirement.underlyingRequirement}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <Badge size="sm" status="info">
                          {CATEGORY_LABEL[selectedItem.requirement.primaryCategory] || selectedItem.requirement.primaryCategory}
                        </Badge>
                        {selectedItem.requirement.secondaryCategories.map(c => (
                          <Badge key={c} size="sm" status="draft">
                            {CATEGORY_LABEL[c] || c}
                          </Badge>
                        ))}
                        {selectedItem.requirement.isMultiPart && <Badge size="sm" status="medium">MULTI-PART</Badge>}
                        {selectedItem.requirement.clarificationNeeded && <Badge size="sm" status="high">CLARIFICATION NEEDED</Badge>}
                        {selectedItem.requirement.specialistApprovalRequired && (
                          <Badge size="sm" status="medium">SPECIALIST: {selectedItem.requirement.specialistRole || 'REQUIRED'}</Badge>
                        )}
                      </div>
                      {selectedItem.requirement.isMultiPart && (
                        <div>
                          <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wide">
                            Independently answerable claims
                          </p>
                          <ul className="mt-1 space-y-1">
                            {selectedItem.requirement.claims.map(claim => (
                              <li key={claim.claimId} className="text-[11px] text-[#334155] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#273449] rounded-lg px-2.5 py-1.5">
                                {claim.claimText}
                                <span className="text-[#64748B] dark:text-[#94A3B8]">
                                  {' '}
                                  · {CATEGORY_LABEL[claim.category] || claim.category}
                                  {claim.requiresOwnerConfirmation ? ' · owner confirmation required' : ''}
                                  {claim.specialistRole ? ` · ${claim.specialistRole}` : ''}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                        <MetaLine label="Framework mappings">
                          {selectedItem.requirement.frameworkMappings.length
                            ? selectedItem.requirement.frameworkMappings.map(m => `${m.frameworkCode} ${m.requirementCode}`).join(', ')
                            : '—'}
                        </MetaLine>
                        <MetaLine label="Controls">{selectedItem.requirement.relevantControlCodes.join(', ') || '—'}</MetaLine>
                        <MetaLine label="Required evidence kinds">
                          {selectedItem.requirement.requiredEvidenceKinds.join(', ') || '—'}
                        </MetaLine>
                        <MetaLine label="Applicability">
                          {selectedItem.requirement.applicabilityConditions.join('; ') || '—'}
                        </MetaLine>
                      </div>
                      {selectedItem.requirement.clarificationReason && (
                        <p className="text-[11px] text-[#B45309] dark:text-[#FCD34D]">{selectedItem.requirement.clarificationReason}</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader
                    icon={ShieldCheck}
                    title="Proposed response"
                    subtitle={
                      selectedItem.answer
                        ? `Draft v${selectedItem.answer.version} · generated ${formatDateTime(selectedItem.answer.generatedAt)} by ${selectedItem.answer.generatedBy.replace(/_/g, ' ')}`
                        : 'No draft has been generated for this question yet'
                    }
                    badge={
                      selectedItem.answer ? (
                        <div className="flex flex-wrap gap-1">
                          <Badge status={STATUS_BADGE[selectedItem.answer.status]}>{selectedItem.answer.status.replace(/_/g, ' ')}</Badge>
                          <Badge status={DISPOSITION_BADGE[selectedItem.answer.disposition]}>
                            {selectedItem.answer.disposition.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      ) : undefined
                    }
                  />
                  <CardContent className="space-y-3">
                    {!selectedItem.answer && (
                      <EmptyState
                        icon={Sparkles}
                        title="No proposed answer yet"
                        detail="Run “Generate suggestions” for this questionnaire. SKANDA will only produce an answer when the retrieved evidence supports it."
                      />
                    )}

                    {selectedItem.answer && (
                      <>
                        <label className="block">
                          <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wide">
                            Customer-facing response (editable)
                          </span>
                          <textarea
                            value={editBuffer[selectedItem.answer.id] ?? selectedItem.answer.customerFacingResponse}
                            onChange={e =>
                              setEditBuffer(prev => ({ ...prev, [selectedItem.answer!.id]: e.target.value }))
                            }
                            rows={5}
                            className="mt-1 w-full rounded-lg border border-[#E2E8F0] dark:border-[#273449] bg-white dark:bg-[#0B1220] px-3 py-2 text-xs text-[#0F172A] dark:text-[#E2E8F0] outline-none focus:border-[#2563EB]"
                          />
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="secondary" size="sm" icon={CheckCircle2} onClick={() => void handleDraftEdit(selectedItem.answer!)}>
                            Save wording
                          </Button>
                          <Button variant="ghost" size="sm" icon={Sparkles} onClick={() => void handleExplain(selectedItem.answer!.id)}>
                            Why this answer?
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Layers}
                            onClick={() =>
                              void questionnaireApi
                                .promoteToLibrary(bootstrap, selectedItem.answer!.id, { reason: 'Promoted from questionnaire review workspace' })
                                .then(() => setNotice('Answer submitted to the governed answer library for approval. It is reusable only after approval.'))
                                .catch((err: any) => setError(err?.message || 'Unable to promote the answer.'))
                            }
                          >
                            Promote to library
                          </Button>
                        </div>

                        {selectedItem.answer.internalExplanation && (
                          <div>
                            <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wide">
                              Internal explanation
                            </p>
                            <p className="text-xs text-[#334155] dark:text-[#CBD5E1] whitespace-pre-wrap">
                              {selectedItem.answer.internalExplanation}
                            </p>
                          </div>
                        )}

                        {selectedItem.answer.unsupportedAssertionsRemoved.length > 0 && (
                          <div className="rounded-lg border border-[#E2E8F0] dark:border-[#273449] px-3 py-2">
                            <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wide">
                              Unsupported assertions removed by the claim validator
                            </p>
                            <ul className="mt-1 list-disc pl-4 space-y-0.5 text-[11px] text-[#334155] dark:text-[#CBD5E1]">
                              {selectedItem.answer.unsupportedAssertionsRemoved.map((a, i) => (
                                <li key={i}>{a}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {selectedItem.answer.untrustedContentFlags.length > 0 && (
                          <div className="rounded-lg border border-[#FECACA] dark:border-[#991B1B] bg-[#FEF2F2] dark:bg-[#450A0A] px-3 py-2 text-[11px] text-[#B91C1C] dark:text-[#FCA5A5]">
                            <p className="font-semibold flex items-center gap-1">
                              <ShieldAlert className="w-3.5 h-3.5" /> Untrusted content detected in the uploaded questionnaire
                            </p>
                            <p className="mt-1">
                              Instruction-like text was contained and treated as data. It was not executed and did not influence
                              approvals, permissions or evidence retrieval.
                            </p>
                            <ul className="list-disc pl-4 mt-1 space-y-0.5">
                              {selectedItem.answer.untrustedContentFlags.map((f, i) => (
                                <li key={i}>{f}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                          <MetaLine label="Evidence sufficiency">
                            <Badge size="sm" status={SUFFICIENCY_BADGE[selectedItem.answer.sufficiency]}>
                              {selectedItem.answer.sufficiency}
                            </Badge>
                          </MetaLine>
                          <MetaLine label="Confidence estimate (heuristic)">
                            {selectedItem.answer.confidenceEstimate}/100
                          </MetaLine>
                          <MetaLine label="Required reviewer role">{selectedItem.answer.requiredReviewerRole.replace(/_/g, ' ')}</MetaLine>
                          <MetaLine label="Organizational scope">
                            {selectedItem.answer.organizationalScope.join(', ') || '—'}
                          </MetaLine>
                          <MetaLine label="Control references">{selectedItem.answer.controlReferences.join(', ') || '—'}</MetaLine>
                          <MetaLine label="Framework references">{selectedItem.answer.frameworkReferences.join(', ') || '—'}</MetaLine>
                        </div>
                        <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{selectedItem.answer.confidenceBasis}</p>
                        {selectedItem.answer.refusalReason && (
                          <div className="rounded-lg border border-[#FECACA] dark:border-[#991B1B] bg-[#FEF2F2] dark:bg-[#450A0A] px-3 py-2 text-[11px] text-[#B91C1C] dark:text-[#FCA5A5]">
                            <span className="font-semibold">Draft engine refusal: </span>
                            {selectedItem.answer.refusalReason}
                          </div>
                        )}
                        <div className="rounded-lg border border-[#E2E8F0] dark:border-[#273449] px-3 py-2">
                          <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wide">
                            Suggested next action
                          </p>
                          <p className="text-xs text-[#334155] dark:text-[#CBD5E1]">{selectedItem.answer.suggestedNextAction}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {selectedItem.answer && (
                  <Card>
                    <CardHeader
                      icon={ClipboardCheck}
                      title="Review & approval"
                      subtitle="Approval authority is enforced on the server from the verified token claim"
                    />
                    <CardContent className="space-y-3">
                      <label className="block">
                        <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wide">
                          Reviewer comment
                        </span>
                        <textarea
                          value={reviewComment}
                          onChange={e => setReviewComment(e.target.value)}
                          rows={2}
                          placeholder="Evidence requested, correction requested, or justification for approval"
                          className="mt-1 w-full rounded-lg border border-[#E2E8F0] dark:border-[#273449] bg-white dark:bg-[#0B1220] px-3 py-2 text-xs text-[#0F172A] dark:text-[#E2E8F0] outline-none focus:border-[#2563EB]"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wide">
                          Justification (required to approve a blocked or self-authored draft)
                        </span>
                        <textarea
                          value={reviewJustification}
                          onChange={e => setReviewJustification(e.target.value)}
                          rows={2}
                          placeholder="Why is releasing this response defensible? Recorded permanently with the approval."
                          className="mt-1 w-full rounded-lg border border-[#E2E8F0] dark:border-[#273449] bg-white dark:bg-[#0B1220] px-3 py-2 text-xs text-[#0F172A] dark:text-[#E2E8F0] outline-none focus:border-[#2563EB]"
                        />
                      </label>
                      {selectedItem.answer.status === 'BLOCKED_UNSUPPORTED' && (
                        <div className="rounded-lg border border-[#FDE68A] dark:border-[#92400E] bg-[#FFFBEB] dark:bg-[#422006] px-3 py-2 text-[11px] text-[#B45309] dark:text-[#FCD34D]">
                          The draft engine blocked this response for insufficient evidence. The secure path is “Request
                          information” (owner confirmation) or “Submit for review”; approving it as the final answer is allowed
                          only as an honest non-assertion and requires the justification above.
                        </div>
                      )}
                      {selectedItem.answer.status === 'GENERATED' && (
                        <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          Generated drafts must be submitted for review before approval; the server enforces the state
                          transition.
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <Button variant="secondary" size="sm" onClick={() => void handleReview(selectedItem.answer!.id, 'SUBMIT_FOR_REVIEW')}>
                          Submit for review
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={CheckCircle2}
                          // Mirrors the server state machine: only IN_REVIEW (and a
                          // justified blocked draft) may be approved.
                          disabled={!['IN_REVIEW', 'BLOCKED_UNSUPPORTED'].includes(selectedItem.answer!.status)}
                          onClick={() => void handleReview(selectedItem.answer!.id, 'APPROVE')}
                        >
                          Approve
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => void handleReview(selectedItem.answer!.id, 'REQUEST_CHANGES')}>
                          Request changes
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => void handleReview(selectedItem.answer!.id, 'REQUEST_INFORMATION')}>
                          Request information
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => void handleReview(selectedItem.answer!.id, 'REJECT')}>
                          Reject
                        </Button>
                        <select
                          value={reassignRole}
                          onChange={e => setReassignRole(e.target.value)}
                          aria-label="Reassign to role"
                          className="h-8 rounded-lg border border-[#E2E8F0] dark:border-[#273449] bg-transparent px-2 text-xs text-[#0F172A] dark:text-[#E2E8F0]"
                        >
                          {['SECURITY', 'IT', 'IAM', 'INFRASTRUCTURE', 'ENGINEERING', 'PRIVACY', 'LEGAL', 'HR', 'BUSINESS_CONTINUITY', 'VENDOR_MANAGEMENT', 'COMPLIANCE', 'EXECUTIVE'].map(r => (
                            <option key={r} value={r}>
                              {r.replace(/_/g, ' ')}
                            </option>
                          ))}
                        </select>
                        <Button variant="ghost" size="sm" icon={UserCog} onClick={() => void handleReview(selectedItem.answer!.id, 'REASSIGN')}>
                          Reassign
                        </Button>
                      </div>
                      {selectedItem.answer && selectedItem.answer.generatedBy !== 'HUMAN' && (
                        <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          This draft was generated by the SKANDA draft engine. Approving it yourself is recorded as
                          self-approval of a machine-generated draft (the server marks this explicitly); material security,
                          privacy, regulatory and certification claims additionally require the configured reviewer class.
                        </p>
                      )}
                      {selectedItem.approval && (
                        <div className="rounded-lg border border-[#A7F3D0] dark:border-[#065F46] bg-[#ECFDF5] dark:bg-[#052E2B] px-3 py-2 text-[11px] text-[#047857] dark:text-[#6EE7B7] space-y-0.5">
                          <p className="font-semibold">Approved</p>
                          <p>
                            {selectedItem.approval.approvedByEmail} ({selectedItem.approval.approvedByRole}) ·{' '}
                            {formatDateTime(selectedItem.approval.approvedAt)} · class {selectedItem.approval.materialClaimClass}
                          </p>
                          <p className="font-mono break-all">content hash {selectedItem.approval.approvedContentHash.slice(0, 32)}…</p>
                          <p>Scope: {selectedItem.approval.approvalScope.join(', ') || '—'}</p>
                          {selectedItem.approval.generatorApprovedOwnDraft && (
                            <p className="font-semibold">Flagged: the approver generated this draft (self-approval).</p>
                          )}
                        </div>
                      )}
                      {selectedItem.reviews.length > 0 && (
                        <div>
                          <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wide flex items-center gap-1">
                            <History className="w-3.5 h-3.5" /> Edit & review history
                          </p>
                          <ul className="mt-1 space-y-1 max-h-40 overflow-y-auto">
                            {selectedItem.reviews.map(r => (
                              <li key={r.id} className="text-[11px] text-[#334155] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#273449] rounded-lg px-2.5 py-1.5">
                                <span className="font-semibold">{r.action.replace(/_/g, ' ')}</span> · {r.actorEmail} ({r.actorRole}) ·{' '}
                                {formatDateTime(r.at)} · {r.previousStatus} → {r.newStatus}
                                {r.comment ? <span className="block text-[#64748B] dark:text-[#94A3B8]">“{r.comment}”</span> : null}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedItem.answer.previousResponse && selectedItem.answer.previousStatus && (
                        <div className="rounded-lg border border-[#E2E8F0] dark:border-[#273449] px-3 py-2">
                          <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wide">
                            Previous answer ({selectedItem.answer.previousStatus})
                          </p>
                          <p className="text-[11px] text-[#334155] dark:text-[#CBD5E1] whitespace-pre-wrap">
                            {selectedItem.answer.previousResponse}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* ------------------------------ RIGHT ---------------------------- */}
          <div className="xl:col-span-3 space-y-4">
            {explanation && (
              <Card>
                <CardHeader icon={Sparkles} title="Answer explanation" subtitle="Generated from stored provenance, not from free-form model output" />
                <CardContent className="space-y-3">
                  {(
                    [
                      ['Why this answer?', explanation.whyThisAnswer],
                      ['What evidence is missing?', explanation.whatEvidenceIsMissing],
                      ['What changed since the previous answer?', explanation.whatChangedSincePreviousAnswer],
                      ['Limitations', explanation.limitations]
                    ] as Array<[string, string[]]>
                  ).map(([heading, lines]) => (
                    <div key={heading}>
                      <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wide">{heading}</p>
                      {lines.length === 0 ? (
                        <p className="text-[11px] text-[#94A3B8] dark:text-[#64748B]">No entries.</p>
                      ) : (
                        <ul className="mt-1 list-disc pl-4 space-y-0.5 text-[11px] text-[#334155] dark:text-[#CBD5E1]">
                          {lines.map((line, i) => (
                            <li key={i}>{line}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" onClick={() => setExplanation(null)}>
                    Close explanation
                  </Button>
                </CardContent>
              </Card>
            )}

            {selectedItem && (
              <>
                <Card>
                  <CardHeader
                    icon={Database}
                    title="Supporting evidence"
                    subtitle={`${selectedItem.answer?.citations.length ?? 0} citation(s) retained with provenance`}
                  />
                  <CardContent className="space-y-2 max-h-[26rem] overflow-y-auto">
                    {(!selectedItem.answer || selectedItem.answer.citations.length === 0) && (
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                        No evidence was retrieved for this question, so no assurance claim can be supported. This is recorded as a
                        gap rather than answered optimistically.
                      </p>
                    )}
                    {selectedItem.answer?.citations.map(c => (
                      <div key={c.citationId} className="rounded-lg border border-[#E2E8F0] dark:border-[#273449] px-3 py-2 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[11px] font-semibold text-[#0F172A] dark:text-[#E2E8F0] break-words">{c.sourceTitle}</p>
                          <Badge size="sm" status={FRESHNESS_BADGE[c.freshnessStatus] || 'pending'}>
                            {c.freshnessStatus}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                          {c.sourceType.replace(/_/g, ' ')} · v{c.sourceVersion} · {c.sourceStatus} · reliability{' '}
                          {c.sourceReliability.replace(/_/g, ' ')}
                        </p>
                        <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] break-words">
                          {c.sourceLocation} · owner {c.evidenceOwner}
                        </p>
                        <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                          Collected {formatDateTime(c.collectedAt)}
                          {c.expiresAt ? ` · expires ${formatDateTime(c.expiresAt)}` : ''}
                        </p>
                        <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                          Scope: {c.organizationalScope.join(', ') || '—'}
                          {c.applicableControlCode ? ` · control ${c.applicableControlCode}` : ''}
                          {c.applicableFrameworkCode ? ` · ${c.applicableFrameworkCode}` : ''}
                        </p>
                        {!c.provesOperatingEffectiveness && (
                          <p className="text-[10px] text-[#B45309] dark:text-[#FCD34D]">
                            Evidence of design/documentation only — it does not prove the control operated effectively.
                          </p>
                        )}
                        <p className="text-[10px] text-[#334155] dark:text-[#CBD5E1] line-clamp-3">{c.excerpt}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader icon={Gauge} title="Sufficiency, gaps & contradictions" subtitle="Evidence quality gates the answer" />
                  <CardContent className="space-y-3">
                    {selectedItem.answer && (
                      <div className="space-y-1">
                        <MetaLine label="Freshness summary">{selectedItem.answer.evidenceFreshnessSummary || '—'}</MetaLine>
                        <MetaLine label="Sufficiency">
                          <Badge size="sm" status={SUFFICIENCY_BADGE[selectedItem.answer.sufficiency]}>
                            {selectedItem.answer.sufficiency}
                          </Badge>
                        </MetaLine>
                      </div>
                    )}

                    <div>
                      <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wide">
                        What is missing
                      </p>
                      {!selectedItem.answer || selectedItem.answer.missingInformation.length === 0 ? (
                        <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">No missing information recorded.</p>
                      ) : (
                        <ul className="mt-1 space-y-1">
                          {selectedItem.answer.missingInformation.map((m, i) => (
                            <li key={i} className="text-[11px] text-[#334155] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#273449] rounded-lg px-2.5 py-1.5">
                              <span className="font-semibold">{m.kind.replace(/_/g, ' ')}</span> — {m.detail}
                              <span className="block text-[#64748B] dark:text-[#94A3B8]">Required from {m.requiredFromRole.replace(/_/g, ' ')}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wide">
                        Contradiction warnings
                      </p>
                      {!selectedItem.answer || selectedItem.answer.contradictionWarnings.length === 0 ? (
                        <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">No contradiction surfaced by the validator.</p>
                      ) : (
                        <ul className="mt-1 list-disc pl-4 space-y-0.5 text-[11px] text-[#B91C1C] dark:text-[#FCA5A5]">
                          {selectedItem.answer.contradictionWarnings.map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wide flex items-center gap-1">
                        <Link2 className="w-3.5 h-3.5" /> Linked gaps ({selectedItem.gaps.length})
                      </p>
                      {selectedItem.gaps.length === 0 ? (
                        <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">No gap linked to this question.</p>
                      ) : (
                        <ul className="mt-1 space-y-1">
                          {selectedItem.gaps.map(g => (
                            <li key={g.id} className="text-[11px] text-[#334155] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#273449] rounded-lg px-2.5 py-1.5">
                              <div className="flex items-center gap-1.5">
                                <Badge size="sm" status={GAP_SEVERITY_BADGE[g.severity]}>
                                  {g.severity}
                                </Badge>
                                <span className="font-semibold">{g.gapType.replace(/_/g, ' ')}</span>
                              </div>
                              <p className="mt-1">{g.detail}</p>
                              <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                                Classification: {g.classification.replace(/_/g, ' ')}
                                {g.linkedControlCode ? ` · control ${g.linkedControlCode}` : ''}
                                {g.linkedRiskId ? ` · risk ${g.linkedRiskId}` : ''}
                              </p>
                              {g.remediationSuppressedReason && (
                                <p className="text-[10px] text-[#B45309] dark:text-[#FCD34D]">{g.remediationSuppressedReason}</p>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------- GAPS ------------------------------ */}
      {tab === 'GAPS' && (
        <Card>
          <CardHeader
            icon={AlertTriangle}
            title="Questionnaire gaps"
            subtitle="A questionnaire answer gap is not a confirmed control deficiency; only verified linkages create remediation records"
            action={
              <Button variant="ghost" size="sm" icon={RefreshCw} onClick={() => void loadTabData()} aria-label="Reload gaps" />
            }
          />
          <CardContent className="space-y-2">
            {gaps.length === 0 && (
              <EmptyState icon={CheckCircle2} title="No gaps recorded" detail="Either the questionnaire has not been analysed yet, or no unresolved gap is open." />
            )}
            {gaps.map(g => (
              <div key={g.id} className="rounded-lg border border-[#E2E8F0] dark:border-[#273449] px-3 py-2 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge size="sm" status={GAP_SEVERITY_BADGE[g.severity]}>{g.severity}</Badge>
                  <span className="text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{g.title}</span>
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{g.gapType.replace(/_/g, ' ')}</span>
                  <span className="ml-auto text-[11px] text-[#64748B] dark:text-[#94A3B8]">{g.status.replace(/_/g, ' ')}</span>
                </div>
                <p className="text-[11px] text-[#334155] dark:text-[#CBD5E1]">{g.detail}</p>
                <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                  {g.classification.replace(/_/g, ' ')} · required from {g.requiredFromRole.replace(/_/g, ' ')} · detected{' '}
                  {formatDateTime(g.detectedAt)}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(['OWNER_NOTIFIED', 'RESOLVED', 'ACCEPTED_RISK'] as QuestionnaireGap['status'][]).map(status => (
                    <Button
                      key={status}
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        void questionnaireApi
                          .updateGap(bootstrap, g.id, status)
                          .then(() => loadTabData())
                          .catch((err: any) => setError(err?.message || 'Unable to update the gap.'))
                      }
                    >
                      Mark {status.replace(/_/g, ' ').toLowerCase()}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ------------------------------- AUDIT ----------------------------- */}
      {tab === 'AUDIT' && (
        <Card>
          <CardHeader
            icon={History}
            title="Answer, approval & export audit history"
            subtitle="Chronological record of material actions, hash-verified per questionnaire"
            badge={
              auditChain ? (
                <Badge status={auditChain.valid ? 'compliant' : 'non-compliant'}>
                  {auditChain.valid ? 'HASH CHAIN VALID' : `CHAIN BROKEN AT ${auditChain.brokenAt}`}
                </Badge>
              ) : undefined
            }
            action={<Button variant="ghost" size="sm" icon={RefreshCw} onClick={() => void loadTabData()} aria-label="Reload audit history" />}
          />
          <CardContent className="space-y-1.5 max-h-[40rem] overflow-y-auto">
            {auditEvents.length === 0 && <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">No audit event recorded yet.</p>}
            {auditEvents.map(e => (
              <div key={e.id} className="rounded-lg border border-[#E2E8F0] dark:border-[#273449] px-3 py-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{e.action.replace(/_/g, ' ')}</span>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">{e.entityType}</span>
                  <span className="ml-auto text-[10px] text-[#64748B] dark:text-[#94A3B8]">{formatDateTime(e.at)}</span>
                </div>
                <p className="text-[11px] text-[#334155] dark:text-[#CBD5E1]">{e.summary}</p>
                <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                  {e.actorEmail} ({e.actorRole}) · {e.entityId}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ------------------------------- EXPORT ---------------------------- */}
      {tab === 'EXPORT' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader icon={ShieldAlert} title="Preflight validation" subtitle="Blocking findings must be resolved or explicitly authorized" />
            <CardContent className="space-y-3">
              <Button variant="secondary" icon={Gauge} onClick={handlePreflight} disabled={!activeId || Boolean(busy)}>
                Run preflight
              </Button>
              {preflight && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge status={preflight.canExport ? 'compliant' : 'non-compliant'}>
                      {preflight.canExport ? 'CAN EXPORT' : 'BLOCKED'}
                    </Badge>
                    <Badge status={preflight.requiresExceptionApproval ? 'medium' : 'info'}>
                      {preflight.requiresExceptionApproval ? 'EXCEPTION APPROVAL REQUIRED' : 'NO EXCEPTION REQUIRED'}
                    </Badge>
                  </div>
                  {preflight.findings.length === 0 ? (
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">No finding raised.</p>
                  ) : (
                    <ul className="space-y-1 max-h-72 overflow-y-auto">
                      {preflight.findings.map((f, i) => (
                        <li key={i} className="text-[11px] border border-[#E2E8F0] dark:border-[#273449] rounded-lg px-2.5 py-1.5">
                          <Badge size="sm" status={f.severity === 'BLOCKING' ? 'non-compliant' : f.severity === 'WARNING' ? 'medium' : 'info'}>
                            {f.severity}
                          </Badge>{' '}
                          <span className="font-mono text-[10px]">{f.code}</span>
                          <p className="text-[#334155] dark:text-[#CBD5E1]">{f.detail}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader icon={Download} title="Export receipts" subtitle="Digest, unresolved count and structural validation per generated file" />
            <CardContent className="space-y-2">
              {exportsList.length === 0 && <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">No export generated yet.</p>}
              {exportsList.map(x => (
                <div key={x.id} className="rounded-lg border border-[#E2E8F0] dark:border-[#273449] px-3 py-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#64748B]" />
                    <span className="text-[11px] font-semibold text-[#0F172A] dark:text-[#E2E8F0] break-all">{x.fileName}</span>
                    <span className="ml-auto text-[10px] text-[#64748B] dark:text-[#94A3B8]">{formatDateTime(x.generatedAt)}</span>
                  </div>
                  <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                    {x.format} · {x.questionsPopulated} populated · {x.questionsLeftUnresolvedAndVisible} unresolved but preserved ·
                    unrelated content preserved: {x.unrelatedContentPreserved ? 'yes' : 'no'}
                  </p>
                  <p className="text-[10px] font-mono break-all text-[#64748B] dark:text-[#94A3B8]">sha256 {x.sha256Digest}</p>
                  <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                    Validation: readable {x.validation.fileReadable ? 'yes' : 'no'} · sheets {x.validation.worksheetCount} · order preserved{' '}
                    {x.validation.questionsOrderPreserved ? 'yes' : 'no'} · cells match plan {x.validation.responseCellsMatchPlan ? 'yes' : 'no'}
                  </p>
                  {x.validation.notes.length > 0 && (
                    <ul className="list-disc pl-4 text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                      {x.validation.notes.map((n, i) => (
                        <li key={i}>{n}</li>
                      ))}
                    </ul>
                  )}
                  {x.approvedExceptionId && (
                    <p className="text-[10px] text-[#B45309] dark:text-[#FCD34D]">Exported under approved exception {x.approvedExceptionId}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ------------------------------ LIBRARY ---------------------------- */}
      {tab === 'LIBRARY' && (
        <Card>
          <CardHeader
            icon={Layers}
            title="Governed answer library"
            subtitle="Reuse requires material equivalence, matching scope, valid evidence and an unexpired approval"
            action={<Button variant="ghost" size="sm" icon={RefreshCw} onClick={() => void loadTabData()} aria-label="Reload answer library" />}
          />
          <CardContent className="space-y-2">
            {libraryEntries.length === 0 && (
              <EmptyState
                icon={Layers}
                title="No governed answers yet"
                detail="Approve a questionnaire answer and promote it to the library to make it reusable. Reuse is never granted on textual similarity alone."
              />
            )}
            {libraryEntries.map((entry: any) => (
              <div key={entry.id} className="rounded-lg border border-[#E2E8F0] dark:border-[#273449] px-3 py-2 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{entry.canonicalQuestion}</span>
                  <Badge
                    size="sm"
                    status={
                      entry.approvalStatus === 'APPROVED'
                        ? 'compliant'
                        : entry.approvalStatus === 'PENDING_REVALIDATION'
                          ? 'medium'
                          : 'non-compliant'
                    }
                  >
                    {entry.approvalStatus}
                  </Badge>
                </div>
                <p className="text-[11px] text-[#334155] dark:text-[#CBD5E1]">{entry.approvedAnswer}</p>
                <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                  v{entry.version} · approved by {entry.approvedBy} · review due {formatDateTime(entry.reviewDueAt)} · scope{' '}
                  {entry.organizationalScope.join(', ') || '—'}
                </p>
                {entry.knownLimitations.length > 0 && (
                  <p className="text-[10px] text-[#B45309] dark:text-[#FCD34D]">Limitations: {entry.knownLimitations.join('; ')}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ---------------------------- DISCLOSURES -------------------------- */}
      {tab === 'DISCLOSURES' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader icon={ShieldCheck} title="Trust Center disclosures" subtitle="Internal evidence is never published automatically" />
            <CardContent className="space-y-2">
              {disclosures.length === 0 && <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">No disclosure proposed yet.</p>}
              {disclosures.map(d => (
                <div key={d.id} className="rounded-lg border border-[#E2E8F0] dark:border-[#273449] px-3 py-2 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{d.title}</span>
                    <Badge
                      size="sm"
                      status={
                        d.status === 'AUTHORIZED' ? 'compliant' : d.status === 'WITHDRAWN' ? 'non-compliant' : 'medium'
                      }
                    >
                      {d.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                    {d.category.replace(/_/g, ' ')} · v{d.version}
                    {d.authorizedBy ? ` · authorized by ${d.authorizedBy} (${d.authorizedByRole})` : ' · awaiting authorized disclosure approval'}
                  </p>
                  <p className="text-[11px] text-[#334155] dark:text-[#CBD5E1] line-clamp-3">{d.publicContent}</p>
                  {d.internalSourceIds.length > 0 && (
                    <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                      Derived from {d.internalSourceIds.length} internal source(s); internal records are not exposed.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={d.status === 'AUTHORIZED' || d.status === 'WITHDRAWN'}
                      onClick={() =>
                        void questionnaireApi
                          .authorizeDisclosure(bootstrap, d.id)
                          .then(() => loadTabData())
                          .catch((err: any) => setError(err?.message || 'Disclosure authorization was rejected.'))
                      }
                    >
                      Authorize disclosure
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={d.status !== 'AUTHORIZED'}
                      onClick={() => {
                        const reason = window.prompt('Withdrawal reason (recorded in the Trust Center audit history):');
                        if (!reason) return;
                        void questionnaireApi
                          .withdrawDisclosure(bootstrap, d.id, reason)
                          .then(() => loadTabData())
                          .catch((err: any) => setError(err?.message || 'Withdrawal was rejected.'));
                      }}
                    >
                      Withdraw
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader icon={ShieldAlert} title="Propose a customer-facing disclosure" subtitle="Proposals are never published until an authorized role approves them" />
            <CardContent className="space-y-2">
              <input
                value={disclosureDraft.title}
                onChange={e => setDisclosureDraft(s => ({ ...s, title: e.target.value }))}
                placeholder="Disclosure title"
                aria-label="Disclosure title"
                className="w-full h-9 rounded-lg border border-[#E2E8F0] dark:border-[#273449] bg-transparent px-3 text-xs text-[#0F172A] dark:text-[#E2E8F0]"
              />
              <select
                value={disclosureDraft.category}
                onChange={e => setDisclosureDraft(s => ({ ...s, category: e.target.value }))}
                aria-label="Disclosure category"
                className="w-full h-9 rounded-lg border border-[#E2E8F0] dark:border-[#273449] bg-transparent px-2 text-xs text-[#0F172A] dark:text-[#E2E8F0]"
              >
                {[
                  'CERTIFICATIONS',
                  'SECURITY_POLICY_SUMMARY',
                  'CONTROL_SUMMARY',
                  'PRIVACY_STATEMENT',
                  'DATA_PROCESSING',
                  'SUBPROCESSORS',
                  'BUSINESS_CONTINUITY',
                  'AUDIT_SUMMARY',
                  'AI_GOVERNANCE',
                  'APPROVED_QUESTIONNAIRE_RESPONSE'
                ].map(c => (
                  <option key={c} value={c}>
                    {c.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              <textarea
                value={disclosureDraft.publicContent}
                onChange={e => setDisclosureDraft(s => ({ ...s, publicContent: e.target.value }))}
                rows={4}
                placeholder="Customer-facing text (must be supportable by approved internal sources)"
                aria-label="Disclosure content"
                className="w-full rounded-lg border border-[#E2E8F0] dark:border-[#273449] bg-white dark:bg-[#0B1220] px-3 py-2 text-xs text-[#0F172A] dark:text-[#E2E8F0]"
              />
              <Button
                variant="secondary"
                size="sm"
                disabled={!disclosureDraft.title || !disclosureDraft.publicContent}
                onClick={() =>
                  void questionnaireApi
                    .proposeDisclosure(bootstrap, {
                      draftId: selectedItem?.answer?.id,
                      title: disclosureDraft.title,
                      category: disclosureDraft.category,
                      publicContent: disclosureDraft.publicContent
                    })
                    .then(() => {
                      setDisclosureDraft({ title: '', category: 'SECURITY_POLICY_SUMMARY', publicContent: '' });
                      setNotice('Disclosure proposed. It remains PENDING_AUTHORIZATION and is not visible to customers until authorized.');
                      return loadTabData();
                    })
                    .catch((err: any) => setError(err?.message || 'Unable to propose the disclosure.'))
                }
              >
                Propose disclosure
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* -------------------------- CONTINUOUS ASSURANCE --------------------------- */}
      {/*
        Answers are alive: this view shows which upstream sources each answer
        depends on, which answers must be re-verified, and what the pipeline has
        actually observed. Every number here comes from the server, and counters
        that cannot be derived are shown as "not measured" rather than as zero.
      */}
      {tab === 'ASSURANCE' && (
        <div className="space-y-4">
          <Card>
            <CardHeader
              icon={RefreshCw}
              title="Revalidation queue"
              subtitle="Answers whose supporting source changed and must be re-verified before they can be exported"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  icon={RefreshCw}
                  onClick={() => void loadTabData()}
                  aria-label="Reload continuous assurance data"
                />
              }
            />
            <CardContent className="space-y-2">
              {assuranceQueue.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="No answer is awaiting revalidation"
                  detail="Every registered answer still matches the sources it was approved against. A change in a control, control test, evidence artifact, policy, integration, approval or scope will appear here."
                />
              ) : (
                assuranceQueue.map(item => (
                  <div
                    key={item.revalidationEventId}
                    className="rounded-lg border border-[#E2E8F0] dark:border-[#273449] px-3 py-2 space-y-1"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0]">
                        {item.questionId}
                      </span>
                      <Badge size="sm" status="high">
                        {item.assuranceState}
                      </Badge>
                      <Badge size="sm" status="info">
                        {item.monitoringMode.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                        {item.triggerKind.replace(/_/g, ' ')} on {item.triggerSourceKind}{' '}
                        {item.triggerSourceId}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#334155] dark:text-[#CBD5E1]">{item.reason}</p>
                    <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                      What changed: {item.whatChanged.join(' · ') || '—'}
                    </p>
                    <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                      Reviewer role {item.requiredReviewerRole} · source observed {formatDateTime(item.sourceObservedAt)} · collected{' '}
                      {formatDateTime(item.collectedAt)} · evaluated {formatDateTime(item.evaluatedAt)} · last verified{' '}
                      {formatDateTime(item.lastVerifiedAt)} ·{' '}
                      {item.approvedTextPreserved
                        ? 'previous approved wording preserved for the reviewer'
                        : 'no prior approved wording'}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedQuestionId(item.questionId);
                        setTab('WORKSPACE');
                      }}
                    >
                      Open the answer to re-verify
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader
                icon={Link2}
                title="Report or reconcile an upstream change"
                subtitle="Reporting is event-driven; reconciliation compares what was actually observed with what SKANDA recorded"
              />
              <CardContent className="space-y-2">
                <select
                  value={changeKind}
                  onChange={e => setChangeKind(e.target.value)}
                  aria-label="Change kind"
                  className="w-full h-9 rounded-lg border border-[#E2E8F0] dark:border-[#273449] bg-transparent px-2 text-xs text-[#0F172A] dark:text-[#E2E8F0]"
                >
                  {ASSURANCE_CHANGE_KINDS.map(k => (
                    <option key={k} value={k}>
                      {k.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={changeSourceKind}
                    onChange={e => setChangeSourceKind(e.target.value)}
                    aria-label="Source kind"
                    className="w-full h-9 rounded-lg border border-[#E2E8F0] dark:border-[#273449] bg-transparent px-2 text-xs text-[#0F172A] dark:text-[#E2E8F0]"
                  >
                    {ASSURANCE_SOURCE_KINDS.map(k => (
                      <option key={k} value={k}>
                        {k.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                  <input
                    value={changeSourceId}
                    onChange={e => setChangeSourceId(e.target.value)}
                    placeholder="Source id (e.g. CTRL-MFA-01)"
                    aria-label="Source identifier"
                    className="w-full h-9 rounded-lg border border-[#E2E8F0] dark:border-[#273449] bg-transparent px-3 text-xs text-[#0F172A] dark:text-[#E2E8F0]"
                  />
                </div>
                <input
                  value={changeNewState}
                  onChange={e => setChangeNewState(e.target.value)}
                  placeholder="Observed state (e.g. FAILED / EXPIRED / OK)"
                  aria-label="Observed state"
                  className="w-full h-9 rounded-lg border border-[#E2E8F0] dark:border-[#273449] bg-transparent px-3 text-xs text-[#0F172A] dark:text-[#E2E8F0]"
                />
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={() => void handleReportSourceChange()}>
                    Report monitoring change
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => void handleReconcile()}>
                    Reconcile observed state
                  </Button>
                </div>
                <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                  A rejected change is recorded as REJECTED and changes nothing. Repeat signals for the same unresolved
                  condition open one revalidation and suppress the repeat notification.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                icon={Gauge}
                title="Pipeline observability"
                subtitle={
                  assuranceMetricsView
                    ? `Derived from stored records · ${assuranceMetricsView.questionnaireCoverage} questionnaire(s) covered for claim counters`
                    : 'Awaiting server metrics'
                }
              />
              <CardContent className="space-y-2">
                {!assuranceMetricsView ? (
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Metrics have not been loaded.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#334155] dark:text-[#CBD5E1]">
                    <span>Changes received: {assuranceMetricsView.sourceChanges.received}</span>
                    <span>Processed: {assuranceMetricsView.sourceChanges.processed}</span>
                    <span>No dependents: {assuranceMetricsView.sourceChanges.noDependents}</span>
                    <span>Duplicates suppressed: {assuranceMetricsView.sourceChanges.duplicatesSuppressed}</span>
                    <span>Rejected: {assuranceMetricsView.sourceChanges.rejected}</span>
                    <span>Dead letters: {assuranceMetricsView.sourceChanges.deadLettered}</span>
                    <span>
                      Avg processing latency:{' '}
                      {assuranceMetricsView.sourceChanges.avgProcessingLatencyMs === null
                        ? 'not measured'
                        : `${assuranceMetricsView.sourceChanges.avgProcessingLatencyMs} ms`}
                    </span>
                    <span>Open revalidations: {assuranceMetricsView.revalidation.openQueue}</span>
                    <span>Dependencies: {assuranceMetricsView.dependencies.total}</span>
                    <span>Awaiting revalidation: {assuranceMetricsView.dependencies.revalidationRequired}</span>
                    <span>Stale/expired citations: {assuranceMetricsView.claims.staleOrExpiredEvidenceCitations}</span>
                    <span>Unsupported answers: {assuranceMetricsView.claims.unsupported}</span>
                    <span>Open gaps: {assuranceMetricsView.pipeline.openGaps}</span>
                    <span>Export blocks: {assuranceMetricsView.pipeline.exportPreflightBlocks}</span>
                    <span>Event-driven changes: {assuranceMetricsView.monitoring.eventDrivenChanges}</span>
                    <span>Scheduled polls: {assuranceMetricsView.monitoring.scheduledPolls}</span>
                    <span>
                      Last reconciliation: {formatDateTime(assuranceMetricsView.monitoring.lastReconciliationAt || undefined)}
                    </span>
                    <span>Storage: {assuranceMetricsView.storageType}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader
              icon={Database}
              title="Assurance dependency graph"
              subtitle="answer → claim → control / test / evidence / policy / integration / approval / scope"
            />
            <CardContent className="space-y-2">
              {assuranceDeps.length === 0 ? (
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  No dependency has been registered yet for this questionnaire. Dependencies are recorded when answers are
                  drafted and when they are reviewed.
                </p>
              ) : (
                assuranceDeps.slice(0, 25).map(dep => (
                  <div
                    key={dep.id}
                    className="rounded-lg border border-[#E2E8F0] dark:border-[#273449] px-3 py-2 space-y-1"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{dep.questionId}</span>
                      <Badge
                        size="sm"
                        status={dep.status === 'CURRENT' ? 'compliant' : dep.status === 'SUPERSEDED' ? 'draft' : 'high'}
                      >
                        {dep.status.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                        answer status at link: {dep.answerStatusAtLink.replace(/_/g, ' ')} · v{dep.version}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                      controls: {dep.controlCodes.join(', ') || '—'} · tests: {dep.controlTestIds.join(', ') || '—'} · evidence:{' '}
                      {dep.evidenceReferenceIds.join(', ') || '—'} · policies: {dep.policyIds.join(', ') || '—'}
                    </p>
                    <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                      last observed source state {dep.lastKnownSourceState} · source observed{' '}
                      {formatDateTime(dep.sourceObservedAt)} · collected {formatDateTime(dep.collectedAt)} · last verified{' '}
                      {formatDateTime(dep.lastVerifiedAt)}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              icon={History}
              title="Monitoring change inbox"
              subtitle="Durable record of every reported change, including the ones that were rejected or dead-lettered"
            />
            <CardContent className="space-y-2">
              {assuranceChangesList.length === 0 ? (
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">No monitoring change has been recorded yet.</p>
              ) : (
                assuranceChangesList.slice(0, 20).map(c => (
                  <div key={c.id} className="rounded-lg border border-[#E2E8F0] dark:border-[#273449] px-3 py-2 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0]">
                        {c.kind.replace(/_/g, ' ')}
                      </span>
                      <Badge
                        size="sm"
                        status={
                          c.status === 'PROCESSED'
                            ? 'compliant'
                            : c.status === 'DUPLICATE_SUPPRESSED' || c.status === 'NO_DEPENDENTS'
                              ? 'info'
                              : c.status === 'REJECTED'
                                ? 'non-compliant'
                                : 'medium'
                        }
                      >
                        {c.status.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                        {c.monitoringMode.replace(/_/g, ' ')} · {c.sourceKind} {c.sourceId}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                      observed {formatDateTime(c.sourceObservedAt)} · received {formatDateTime(c.receivedAt)} · attempts{' '}
                      {c.attempts}/{c.maxAttempts} · duplicates {c.duplicateAttempts} · impacted answers{' '}
                      {c.impactedDependencyIds.length}
                      {c.processingLatencyMs !== undefined ? ` · latency ${c.processingLatencyMs} ms` : ''}
                    </p>
                    {c.lastError && (
                      <p className="text-[10px] text-[#B45309] dark:text-[#FCD34D]">
                        Recorded error ({c.status}): {c.lastError}
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ------------------------------ MODALS ----------------------------- */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Import a security questionnaire"
        subtitle="XLSX, CSV, DOCX or PDF · the original artifact is stored immutably and hashed"
        icon={Upload}
        size="lg"
      >
        <div className="space-y-3">
          <p className="text-xs text-[#334155] dark:text-[#CBD5E1]">
            Uploaded documents are treated as untrusted content. Instruction-like text inside a questionnaire is recorded as
            untrusted content and can never change permissions, approvals or tool behaviour.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.csv,.docx,.pdf"
            aria-label="Questionnaire file"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) void handleImport(file);
              e.target.value = '';
            }}
            className="block w-full text-xs text-[#334155] dark:text-[#CBD5E1]"
          />
          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            Large questionnaires are processed in bounded batches; the extraction summary reports ambiguous structures and
            every question flagged for human correction instead of silently dropping it.
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={extractionModalOpen}
        onClose={() => setExtractionModalOpen(false)}
        title="Extraction validation"
        subtitle={workspace ? `${workspace.questionnaire.title} · ${workspace.questionnaire.format}` : ''}
        icon={ClipboardCheck}
        size="xl"
      >
        {workspace?.questionnaire.extractionSummary ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <MetaLine label="Source artifact">{workspace.questionnaire.sourceArtifact.fileName}</MetaLine>
              <MetaLine label="Content hash">{workspace.questionnaire.sourceArtifact.sha256ContentHash.slice(0, 24)}…</MetaLine>
              <MetaLine label="Detected title">{workspace.questionnaire.extractionSummary.detectedTitle || '—'}</MetaLine>
              <MetaLine label="Requesting organization">
                {workspace.questionnaire.extractionSummary.detectedRequestingOrganization || '—'}
              </MetaLine>
              <MetaLine label="Questions extracted">{workspace.questionnaire.extractionSummary.questionsExtracted}</MetaLine>
              <MetaLine label="Requiring correction">{workspace.questionnaire.extractionSummary.questionsRequiringCorrection}</MetaLine>
              <MetaLine label="Extraction confidence">
                {workspace.questionnaire.extractionSummary.confidenceBand} ·{' '}
                {workspace.questionnaire.extractionSummary.extractionConfidence}/100
              </MetaLine>
              <MetaLine label="Unmapped response fields">{workspace.questionnaire.extractionSummary.unmappedResponseFields}</MetaLine>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wide">Column mappings</p>
              <div className="mt-1 space-y-1">
                {workspace.questionnaire.extractionSummary.columnMappings.map(m => (
                  <div key={`${m.worksheet}-${m.questionColumn}`} className="text-[11px] border border-[#E2E8F0] dark:border-[#273449] rounded-lg px-2.5 py-1.5">
                    <span className="font-semibold">{m.worksheet}</span> · question column {m.questionColumn} · response column{' '}
                    {m.responseColumn || '— (unmapped)'} · header row {m.headerRow} · confidence{' '}
                    {m.humanConfirmed ? 'human-confirmed (reviewer override)' : `${m.confidence} (heuristic 0–1)`}
                    {m.humanConfirmed ? ' · human-confirmed' : ''}
                    {m.ambiguous ? ' · AMBIGUOUS' : ''}
                    {m.ambiguousReason ? <span className="block text-[#B45309] dark:text-[#FCD34D]">{m.ambiguousReason}</span> : null}
                  </div>
                ))}
              </div>
            </div>

            {workspace.questionnaire.extractionSummary.worksheetsPreservedUnmodified.length > 0 && (
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Preserved unmodified: {workspace.questionnaire.extractionSummary.worksheetsPreservedUnmodified.join(', ')}
              </p>
            )}
            {workspace.questionnaire.extractionSummary.ambiguousStructures.length > 0 && (
              <div className="rounded-lg border border-[#FDE68A] dark:border-[#92400E] bg-[#FFFBEB] dark:bg-[#422006] px-3 py-2 text-[11px] text-[#B45309] dark:text-[#FCD34D]">
                <p className="font-semibold">Ambiguous structures</p>
                <ul className="list-disc pl-4 mt-1">
                  {workspace.questionnaire.extractionSummary.ambiguousStructures.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            )}
            {workspace.questionnaire.extractionSummary.unreadableRegions.length > 0 && (
              <div className="rounded-lg border border-[#FECACA] dark:border-[#991B1B] bg-[#FEF2F2] dark:bg-[#450A0A] px-3 py-2 text-[11px] text-[#B91C1C] dark:text-[#FCA5A5]">
                <p className="font-semibold">Unreadable regions</p>
                <ul className="list-disc pl-4 mt-1">
                  {workspace.questionnaire.extractionSummary.unreadableRegions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              {workspace.questionnaire.extractionSummary.accuracyDisclaimer}
            </p>
          </div>
        ) : (
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">No extraction summary is stored for this questionnaire.</p>
        )}
      </Modal>

      <Modal
        isOpen={mappingModalOpen}
        onClose={() => setMappingModalOpen(false)}
        title="Correct column mapping"
        subtitle="Confirm the question and response columns for a worksheet"
        icon={ListChecks}
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setMappingModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => void handleMappingSave()} disabled={!mappingDraft.worksheet || Boolean(busy)}>
              Confirm mapping
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-[#334155] dark:text-[#CBD5E1]">
            Confirming a mapping re-binds the response cells for the affected rows, marks the mapping human-confirmed and records
            the actor in the audit history. The uploaded original file is never modified.
          </p>
          <div className="space-y-2">
            <label className="block text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              Worksheet
              <select
                value={mappingDraft.worksheet}
                onChange={e => {
                  const mapping = workspace?.questionnaire.extractionSummary?.columnMappings.find(m => m.worksheet === e.target.value);
                  setMappingDraft({
                    worksheet: e.target.value,
                    questionColumn: mapping?.questionColumn || '',
                    responseColumn: mapping?.responseColumn || '',
                    headerRow: mapping?.headerRow || 1,
                    sectionColumn: (mapping as any)?.sectionColumn || ''
                  });
                }}
                className="mt-1 w-full h-9 rounded-lg border border-[#E2E8F0] dark:border-[#273449] bg-transparent px-2 text-xs text-[#0F172A] dark:text-[#E2E8F0]"
              >
                <option value="">Select a worksheet…</option>
                {(workspace?.questionnaire.extractionSummary?.columnMappings || []).map(m => (
                  <option key={m.worksheet} value={m.worksheet}>
                    {m.worksheet}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              Question column
              <input
                value={mappingDraft.questionColumn}
                onChange={e => setMappingDraft(s => ({ ...s, questionColumn: e.target.value }))}
                className="mt-1 w-full h-9 rounded-lg border border-[#E2E8F0] dark:border-[#273449] bg-transparent px-3 text-xs text-[#0F172A] dark:text-[#E2E8F0]"
              />
            </label>
            <label className="block text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              Response column (leave blank to unmap)
              <input
                value={mappingDraft.responseColumn}
                onChange={e => setMappingDraft(s => ({ ...s, responseColumn: e.target.value }))}
                className="mt-1 w-full h-9 rounded-lg border border-[#E2E8F0] dark:border-[#273449] bg-transparent px-3 text-xs text-[#0F172A] dark:text-[#E2E8F0]"
              />
            </label>
            <label className="block text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              Header row
              <input
                type="number"
                min={1}
                value={mappingDraft.headerRow}
                onChange={e => setMappingDraft(s => ({ ...s, headerRow: Number(e.target.value) || 1 }))}
                className="mt-1 w-full h-9 rounded-lg border border-[#E2E8F0] dark:border-[#273449] bg-transparent px-3 text-xs text-[#0F172A] dark:text-[#E2E8F0]"
              />
            </label>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={preflightModalOpen}
        onClose={() => setPreflightModalOpen(false)}
        title="Export preflight"
        subtitle="Unresolved questions are preserved and reported — never silently dropped"
        icon={ShieldAlert}
        size="xl"
      >
        {preflight ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge status={preflight.canExport ? 'compliant' : 'non-compliant'}>
                {preflight.canExport ? 'CAN EXPORT' : 'BLOCKED'}
              </Badge>
              <Badge status={preflight.requiresExceptionApproval ? 'medium' : 'info'}>
                {preflight.requiresExceptionApproval ? 'EXCEPTION APPROVAL REQUIRED' : 'NO EXCEPTION REQUIRED'}
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <MetaLine label="Mandatory unanswered">{preflight.mandatoryUnanswered.length}</MetaLine>
              <MetaLine label="Unapproved responses">{preflight.unapprovedResponses.length}</MetaLine>
              <MetaLine label="Unsupported material claims">{preflight.unsupportedMaterialClaims.length}</MetaLine>
              <MetaLine label="Expired evidence">{preflight.expiredEvidence.length}</MetaLine>
              <MetaLine label="Unresolved contradictions">{preflight.unresolvedContradictions.length}</MetaLine>
              <MetaLine label="Missing required attachments">{preflight.missingRequiredAttachments.length}</MetaLine>
              <MetaLine label="Disclosure risks">{preflight.disclosureRisks.length}</MetaLine>
            </div>
            <ul className="space-y-1 max-h-72 overflow-y-auto">
              {preflight.findings.map((f, i) => (
                <li key={i} className="text-[11px] border border-[#E2E8F0] dark:border-[#273449] rounded-lg px-2.5 py-1.5">
                  <Badge size="sm" status={f.severity === 'BLOCKING' ? 'non-compliant' : f.severity === 'WARNING' ? 'medium' : 'info'}>
                    {f.severity}
                  </Badge>{' '}
                  <span className="font-mono text-[10px]">{f.code}</span>
                  <p className="text-[#334155] dark:text-[#CBD5E1]">{f.detail}</p>
                </li>
              ))}
            </ul>
            <div className="flex justify-end">
              <Button variant="primary" onClick={() => { setPreflightModalOpen(false); setExportModalOpen(true); }}>
                Continue to export
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">No preflight result.</p>
        )}
      </Modal>

      <Modal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Export the completed questionnaire"
        subtitle="The uploaded original file is never overwritten"
        icon={Download}
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setExportModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Download} onClick={() => void handleExport()} disabled={Boolean(busy)}>
              Generate export
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-[#334155] dark:text-[#CBD5E1]">
            The export preserves question order, identifiers, unrelated worksheets and formulas; only the configured response
            cells are populated. Questions without an approved answer remain visible in the file and are reported in the export
            receipt.
          </p>
          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            If the preflight raises blocking findings, exporting requires an approved exception record. Enter the exception
            reference and justification — the server validates it and the exception is recorded in the audit history.
          </p>
          <label className="block text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            Approved exception reference (optional)
            <input
              value={exportException.exceptionId}
              onChange={e => setExportException(s => ({ ...s, exceptionId: e.target.value }))}
              placeholder="e.g. EXC-2026-014"
              className="mt-1 w-full h-9 rounded-lg border border-[#E2E8F0] dark:border-[#273449] bg-transparent px-3 text-xs text-[#0F172A] dark:text-[#E2E8F0]"
            />
          </label>
          <label className="block text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            Exception justification (optional)
            <textarea
              value={exportException.reason}
              onChange={e => setExportException(s => ({ ...s, reason: e.target.value }))}
              rows={2}
              className="mt-1 w-full rounded-lg border border-[#E2E8F0] dark:border-[#273449] bg-white dark:bg-[#0B1220] px-3 py-2 text-xs text-[#0F172A] dark:text-[#E2E8F0]"
            />
          </label>
        </div>
      </Modal>
    </div>
  );
};

export default SecurityQuestionnaireWorkspace;
