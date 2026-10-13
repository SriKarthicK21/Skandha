// ============================================================================
// SKANDA QUESTIONNAIRE INTELLIGENCE: BROWSER API CLIENT
// Path: src/services/questionnaire/questionnaireApiClient.ts
//
// Speaks to the JWT-protected /api/v1/questionnaires routes.
//
// The server derives tenant identity exclusively from verified token claims, so
// this client never sends a tenant id: it sends the bearer token. Because the
// repository's existing UI has no token-issuing endpoint, a DEVELOPMENT-ONLY
// session bootstrap is used; it is refused by the server when
// NODE_ENV=production, in which case the platform identity provider must supply
// the token (see the implementation report).
// ============================================================================

import {
  AnswerAssuranceDependency,
  AnswerDraft,
  Questionnaire,
  QuestionnaireAuditEvent,
  QuestionnaireExport,
  QuestionnaireGap,
  QuestionnaireObservabilityMetrics,
  AnswerStatus,
  RevalidationQueueItem,
  ReviewAction,
  SourceChangeRecord,
  TrustCenterDisclosure,
  RequirementAnalysis,
  ExtractedQuestion,
  AnswerReview,
  AnswerApproval,
  ExportPreflightResult
} from '../../types/questionnaireIntelligenceTypes';
import type { SourceChangeInput } from '../../services/questionnaire/continuousAssuranceRevalidationService';

export const QUESTIONNAIRE_API_BASE = '/api/v1/questionnaires';

export interface ApiErrorShape {
  status: number;
  code: string;
  message: string;
  preflight?: ExportPreflightResult;
  /** Present when the server returned partial results alongside a failure. */
  detail?: any;
}

export class QuestionnaireApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly preflight?: ExportPreflightResult;
  public readonly detail?: any;

  constructor(shape: ApiErrorShape) {
    super(shape.message);
    this.name = 'QuestionnaireApiError';
    this.status = shape.status;
    this.code = shape.code;
    this.preflight = shape.preflight;
    this.detail = shape.detail;
  }
}

const TOKEN_STORAGE_KEY = 'skanda.questionnaire.session';

interface CachedSession {
  token: string;
  expiresAt: number;
  tenantId: string;
  role: string;
}

function readSession(): CachedSession | null {
  try {
    const raw = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedSession;
    if (!parsed.token || Date.now() > parsed.expiresAt - 30_000) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSession(session: CachedSession): void {
  try {
    window.sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* storage may be unavailable; the token lives only for this call */
  }
}

export function clearQuestionnaireSession(): void {
  try {
    window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export interface SessionBootstrap {
  email: string;
  role: string;
  tenantId: string;
}

/**
 * Obtains a short-lived bearer token. In production this must be replaced by the
 * platform identity provider's token; the development bootstrap endpoint returns
 * 404 in production.
 */
export async function ensureSession(bootstrap: SessionBootstrap): Promise<string | null> {
  const existing = readSession();
  if (existing && existing.tenantId === bootstrap.tenantId && existing.role === bootstrap.role) {
    return existing.token;
  }

  try {
    const res = await fetch(`${QUESTIONNAIRE_API_BASE}/dev/session-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bootstrap)
    });
    if (!res.ok) return null;
    const body = await res.json();
    const data = body?.data;
    if (!data?.token) return null;
    writeSession({
      token: data.token,
      expiresAt: Date.now() + (Number(data.expiresInSeconds) || 3600) * 1000,
      tenantId: String(data.tenantId),
      role: String(data.role)
    });
    return data.token;
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: any; bootstrap?: SessionBootstrap; raw?: boolean } = {}
): Promise<{ data: T; response: Response }> {
  const method = options.method || 'GET';
  const token = options.bootstrap ? await ensureSession(options.bootstrap) : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${QUESTIONNAIRE_API_BASE}${path}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });

  if (options.raw) {
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new QuestionnaireApiError({
        status: res.status,
        code: payload.code || 'HTTP_ERROR',
        message: payload.error || `Request failed with status ${res.status}`,
        preflight: payload.preflight,
        detail: payload.data
      });
    }
    return { data: undefined as unknown as T, response: res };
  }

  const payload = await res.json().catch(() => ({}));
  if (!res.ok || payload.success === false) {
    throw new QuestionnaireApiError({
      status: res.status,
      code: payload.code || 'HTTP_ERROR',
      message: payload.error || `Request failed with status ${res.status}`,
      preflight: payload.preflight,
      detail: payload.data
    });
  }
  return { data: (payload.data !== undefined ? payload.data : payload) as T, response: res };
}

// ---------------------------------------------------------------------------
// DTOs mirroring the server workspace projection
// ---------------------------------------------------------------------------

export interface WorkspaceQuestionItem {
  question: ExtractedQuestion;
  requirement: RequirementAnalysis | null;
  answer: AnswerDraft | null;
  gaps: QuestionnaireGap[];
  reviews: AnswerReview[];
  approval: AnswerApproval | null;
}

export interface QuestionnaireWorkspace {
  questionnaire: Questionnaire;
  questions: WorkspaceQuestionItem[];
  completion: {
    total: number;
    drafted: number;
    approved: number;
    blocked: number;
    mandatoryUnanswered: number;
    openGaps: number;
  };
}

export interface AnalyzeOutcomeSummary {
  questionId: string;
  error?: string;
  primaryCategory?: string;
  disposition?: string;
  sufficiency?: string;
  status?: AnswerStatus;
  confidenceEstimate?: number;
  citations?: number;
  gaps?: number;
  reusedLibraryEntryId?: string;
  reuseDecision?: string;
}

export interface AnalyzeResponse {
  job: {
    id: string;
    status: string;
    progress: { processed: number; total: number; failed: number };
    errors: Array<{ item: string; message: string }>;
  };
  outcomes: AnalyzeOutcomeSummary[];
}

function base64FromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Unable to read the selected file.'));
    reader.onload = () => {
      const result = String(reader.result || '');
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.readAsDataURL(file);
  });
}

export const questionnaireApi = {
  base64FromFile,

  importQuestionnaire: async (params: {
    file: File;
    bootstrap: SessionBootstrap;
    idempotencyKey?: string;
  }): Promise<{ questionnaire: Questionnaire; extractionSummary: any; questionsRequiringCorrection: number; idempotentReplay: boolean }> => {
    const contentBase64 = await base64FromFile(params.file);
    const { data } = await request<any>('/import', {
      method: 'POST',
      bootstrap: params.bootstrap,
      body: {
        fileName: params.file.name,
        mimeType: params.file.type || 'application/octet-stream',
        contentBase64,
        idempotencyKey: params.idempotencyKey
      }
    });
    return data;
  },

  list: async (bootstrap: SessionBootstrap, options: { limit?: number; offset?: number; search?: string } = {}) => {
    const query = new URLSearchParams();
    if (options.limit) query.set('limit', String(options.limit));
    if (options.offset) query.set('offset', String(options.offset));
    if (options.search) query.set('search', options.search);
    const { data } = await request<Questionnaire[]>(`/?${query.toString()}`, { bootstrap });
    return data;
  },

  workspace: async (bootstrap: SessionBootstrap, questionnaireId: string) => {
    const { data } = await request<QuestionnaireWorkspace>(`/${encodeURIComponent(questionnaireId)}`, { bootstrap });
    return data;
  },

  correctMapping: async (
    bootstrap: SessionBootstrap,
    questionnaireId: string,
    payload: {
      worksheet: string;
      questionColumn?: string;
      responseColumn?: string | null;
      headerRow?: number;
      sectionColumn?: string | null;
    }
  ) => {
    const { data } = await request<Questionnaire>(`/${encodeURIComponent(questionnaireId)}/mapping`, {
      method: 'POST',
      bootstrap,
      body: payload
    });
    return data;
  },

  analyze: async (
    bootstrap: SessionBootstrap,
    questionnaireId: string,
    payload: { organizationalScope?: string[]; policy?: Record<string, any>; asOf?: string } = {}
  ) => {
    const { data } = await request<AnalyzeResponse>(`/${encodeURIComponent(questionnaireId)}/analyze`, {
      method: 'POST',
      bootstrap,
      body: payload
    });
    return data;
  },

  listGaps: async (bootstrap: SessionBootstrap, questionnaireId: string) => {
    const { data } = await request<QuestionnaireGap[]>(`/${encodeURIComponent(questionnaireId)}/gaps`, { bootstrap });
    return data;
  },

  updateGap: async (bootstrap: SessionBootstrap, gapId: string, status: QuestionnaireGap['status']) => {
    const { data } = await request<QuestionnaireGap>(`/gaps/${encodeURIComponent(gapId)}`, {
      method: 'PATCH',
      bootstrap,
      body: { status }
    });
    return data;
  },

  editDraft: async (
    bootstrap: SessionBootstrap,
    draftId: string,
    patch: { customerFacingResponse?: string; internalExplanation?: string }
  ) => {
    const { data } = await request<AnswerDraft>(`/drafts/${encodeURIComponent(draftId)}`, {
      method: 'PATCH',
      bootstrap,
      body: patch
    });
    return data;
  },

  review: async (
    bootstrap: SessionBootstrap,
    draftId: string,
    payload: {
      action: ReviewAction;
      comment?: string;
      assignedToRole?: string;
      selfApprovalJustification?: string;
    }
  ) => {
    const { data } = await request<{ draft: AnswerDraft; review: AnswerReview; approval?: AnswerApproval }>(
      `/drafts/${encodeURIComponent(draftId)}/review`,
      { method: 'POST', bootstrap, body: payload }
    );
    return data;
  },

  explain: async (bootstrap: SessionBootstrap, draftId: string) => {
    const { data } = await request<{
      draft: AnswerDraft;
      explanation: {
        whyThisAnswer: string[];
        whatEvidenceIsMissing: string[];
        whatChangedSincePreviousAnswer: string[];
        limitations: string[];
      };
    }>(`/drafts/${encodeURIComponent(draftId)}/explain`, { bootstrap });
    return data;
  },

  exportPreflight: async (
    bootstrap: SessionBootstrap,
    questionnaireId: string,
    payload: { approvedExceptionId?: string; approvedExceptionReason?: string; policy?: Record<string, any> } = {}
  ) => {
    const { data } = await request<ExportPreflightResult>(`/${encodeURIComponent(questionnaireId)}/export/preflight`, {
      method: 'POST',
      bootstrap,
      body: payload
    });
    return data;
  },

  downloadExport: async (
    bootstrap: SessionBootstrap,
    questionnaireId: string,
    payload: { approvedExceptionId?: string; approvedExceptionReason?: string } = {}
  ): Promise<{ exportId: string; digest: string; unresolved: number; blob: Blob }> => {
    const { response } = await request<void>(`/${encodeURIComponent(questionnaireId)}/export`, {
      method: 'POST',
      bootstrap,
      body: payload,
      raw: true
    });
    const blob = await response.blob();
    return {
      exportId: response.headers.get('X-Skanda-Export-Id') || '',
      digest: response.headers.get('X-Skanda-Export-Sha256') || '',
      unresolved: Number(response.headers.get('X-Skanda-Questions-Unresolved') || '0'),
      blob
    };
  },

  listExports: async (bootstrap: SessionBootstrap, questionnaireId: string) => {
    const { data } = await request<QuestionnaireExport[]>(`/${encodeURIComponent(questionnaireId)}/exports`, { bootstrap });
    return data;
  },

  audit: async (bootstrap: SessionBootstrap, questionnaireId: string, limit = 200) => {
    const { data } = await request<QuestionnaireAuditEvent[]>(
      `/${encodeURIComponent(questionnaireId)}/audit?limit=${limit}`,
      { bootstrap }
    );
    return data;
  },

  verifyAudit: async (bootstrap: SessionBootstrap, questionnaireId: string) => {
    const { data } = await request<{ valid: boolean; brokenAt?: string }>(
      `/${encodeURIComponent(questionnaireId)}/audit/verify`,
      { bootstrap }
    );
    return data;
  },

  listLibrary: async (bootstrap: SessionBootstrap) => {
    const { data } = await request<any[]>('/library/entries', { bootstrap });
    return data;
  },

  promoteToLibrary: async (
    bootstrap: SessionBootstrap,
    draftId: string,
    payload: { reviewDueAt?: string; businessUnit?: string; reason?: string } = {}
  ) => {
    const { data } = await request<any>('/library/from-draft', {
      method: 'POST',
      bootstrap,
      body: { draftId, ...payload }
    });
    return data;
  },

  listDisclosures: async (bootstrap: SessionBootstrap) => {
    const { data } = await request<TrustCenterDisclosure[]>('/disclosures', { bootstrap });
    return data;
  },

  publishedDisclosures: async (bootstrap: SessionBootstrap) => {
    const { data } = await request<TrustCenterDisclosure[]>('/disclosures/published', { bootstrap });
    return data;
  },

  proposeDisclosure: async (
    bootstrap: SessionBootstrap,
    payload: { draftId?: string; title: string; category?: string; publicContent?: string; expiresAt?: string }
  ) => {
    const { data } = await request<TrustCenterDisclosure>('/disclosures', { method: 'POST', bootstrap, body: payload });
    return data;
  },

  authorizeDisclosure: async (bootstrap: SessionBootstrap, disclosureId: string, expiresAt?: string) => {
    const { data } = await request<TrustCenterDisclosure>(
      `/disclosures/${encodeURIComponent(disclosureId)}/authorize`,
      { method: 'POST', bootstrap, body: { expiresAt } }
    );
    return data;
  },

  withdrawDisclosure: async (bootstrap: SessionBootstrap, disclosureId: string, reason: string) => {
    const { data } = await request<TrustCenterDisclosure>(
      `/disclosures/${encodeURIComponent(disclosureId)}/withdraw`,
      { method: 'POST', bootstrap, body: { reason } }
    );
    return data;
  },

  // -------------------------------------------------------------------------
  // Continuous assurance & revalidation
  // -------------------------------------------------------------------------

  /** Reviewer queue of answers that must be re-verified after a source change. */
  revalidationQueue: async (bootstrap: SessionBootstrap, questionnaireId?: string) => {
    const query = questionnaireId ? `?questionnaireId=${encodeURIComponent(questionnaireId)}` : '';
    const { data } = await request<RevalidationQueueItem[]>(`/assurance/revalidation-queue${query}`, { bootstrap });
    return data;
  },

  /** The explicit dependency graph: answer -> claim -> control/test/evidence/policy/approval. */
  assuranceDependencies: async (bootstrap: SessionBootstrap, questionnaireId?: string) => {
    const query = questionnaireId ? `?questionnaireId=${encodeURIComponent(questionnaireId)}` : '';
    const { data } = await request<AnswerAssuranceDependency[]>(`/assurance/dependencies${query}`, { bootstrap });
    return data;
  },

  /** The durable monitoring change inbox (event-driven and reconciliation). */
  assuranceChanges: async (bootstrap: SessionBootstrap, limit = 50) => {
    const { data } = await request<SourceChangeRecord[]>(`/assurance/changes?limit=${limit}`, { bootstrap });
    return data;
  },

  /** Operational metrics derived from stored records on the server. */
  assuranceMetrics: async (bootstrap: SessionBootstrap) => {
    const { data } = await request<QuestionnaireObservabilityMetrics>('/assurance/metrics', { bootstrap });
    return data;
  },

  /**
   * Reports an upstream monitoring change. Rejection (422) is a real outcome:
   * the change was recorded but not applied, and nothing was revalidated.
   */
  ingestSourceChange: async (bootstrap: SessionBootstrap, payload: SourceChangeInput) => {
    const { data } = await request<{
      changeId: string;
      changeStatus: string;
      duplicateSuppressed: boolean;
      impactedAnswers: number;
      notificationsSuppressed: number;
      revalidations: any[];
      lastError?: string;
    }>('/assurance/source-change', { method: 'POST', bootstrap, body: payload });
    return data;
  },

  /**
   * Periodic reconciliation against freshly observed provider state. Sources the
   * caller could not read are returned as unobserved, not assumed healthy.
   */
  reconcileAssurance: async (
    bootstrap: SessionBootstrap,
    payload: {
      monitoringMode: 'SCHEDULED_POLLING' | 'MANUAL_REFRESH';
      questionnaireId?: string;
      sourceStates: Array<{
        sourceKind: string;
        sourceId: string;
        state: string;
        observedAt: string;
        detail?: string;
        resourceScope?: string[];
      }>;
    }
  ) => {
    const { data } = await request<{
      monitoringMode: string;
      polled: number;
      revalidationsRaised: number;
      unobservedDependencies: string[];
      unobservedCount: number;
      changes: any[];
    }>('/assurance/reconcile', { method: 'POST', bootstrap, body: payload });
    return data;
  },

  health: async (bootstrap: SessionBootstrap) => {
    const { data } = await request<any>('/health', { bootstrap });
    return data;
  }
};
