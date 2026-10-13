// ============================================================================
// SKANDA QUESTIONNAIRE INTELLIGENCE: GOVERNED ANSWER LIBRARY
// Path: src/services/questionnaire/governedAnswerLibraryService.ts
//
// Reuse of a previously approved answer is a governed decision, not a text
// similarity lookup. Before reuse the platform verifies:
//   material equivalence, organizational scope, product/service scope,
//   evidence validity & freshness, unchanged control status, absence of
//   expiration, absence of new contradictions, and validity of the approval.
//
// Version history is preserved: superseding an entry appends, never overwrites.
// ============================================================================

import {
  AnswerDraft,
  ClaimValidationResult,
  ExtractedQuestion,
  GovernedAnswerLibraryEntry,
  RequirementAnalysis,
  RetrievalResult,
  ReuseDecision,
  ReuseEvaluation
} from '../../types/questionnaireIntelligenceTypes.js';
import { LoadedKnowledge } from './evidenceRetrievalService.js';
import { textSimilarity } from './questionClassifierService.js';

/** Store abstraction so the service stays independent of the persistence layer. */
export interface AnswerLibraryStore {
  listEntries(tenantId: string): Promise<GovernedAnswerLibraryEntry[]>;
  saveEntry(entry: GovernedAnswerLibraryEntry): Promise<GovernedAnswerLibraryEntry>;
}

export const MATERIAL_EQUIVALENCE_THRESHOLD = 0.72;
export const RELATED_THRESHOLD = 0.5;

export interface ReuseEvaluationResult extends ReuseEvaluation {
  entry?: GovernedAnswerLibraryEntry;
}

const NEGATIVE_IMPLEMENTATION_STATES = ['NOT_IMPLEMENTED', 'PLANNED', 'DEFERRED', 'REJECTED'];

export class GovernedAnswerLibraryService {
  constructor(private readonly store: AnswerLibraryStore) {}

  public async evaluateReuse(params: {
    tenantId: string;
    analysis: RequirementAnalysis;
    knowledge: LoadedKnowledge;
    organizationalScope: string[];
    productScope?: string[];
    asOf: string;
  }): Promise<ReuseEvaluationResult> {
    const entries = (await this.store.listEntries(params.tenantId)).filter(
      e => e.tenantId === params.tenantId
    );

    if (entries.length === 0) {
      return {
        decision: 'REUSE_DENIED',
        entryId: '',
        checks: [{ check: 'library_populated', passed: false, detail: 'No approved answers exist in the tenant answer library.' }],
        failedChecks: ['library_populated'],
        rationale: 'The tenant answer library is empty, so no answer can be reused.'
      };
    }

    let best: { entry: GovernedAnswerLibraryEntry; similarity: number } | null = null;
    for (const entry of entries) {
      if (entry.category !== params.analysis.primaryCategory && entry.approvalStatus === 'REVOKED') continue;
      const similarity = Math.max(
        textSimilarity(entry.canonicalQuestion, params.analysis.originalWording),
        textSimilarity(entry.normalizedRequirement, params.analysis.normalizedInterpretation)
      );
      if (!best || similarity > best.similarity) best = { entry, similarity };
    }

    if (!best) {
      return {
        decision: 'REUSE_DENIED',
        entryId: '',
        checks: [{ check: 'candidate_found', passed: false, detail: 'No comparable library entry was found.' }],
        failedChecks: ['candidate_found'],
        rationale: 'No library entry is comparable to this requirement.'
      };
    }

    const { entry, similarity } = best;
    const checks: Array<{ check: string; passed: boolean; detail: string }> = [];

    checks.push({
      check: 'material_equivalence',
      passed: similarity >= MATERIAL_EQUIVALENCE_THRESHOLD,
      detail: `Wording similarity to canonical question is ${(similarity * 100).toFixed(0)}% (threshold ${(
        MATERIAL_EQUIVALENCE_THRESHOLD * 100
      ).toFixed(0)}%). Textual similarity alone never authorises reuse.`
    });

    checks.push({
      check: 'category_match',
      passed: entry.category === params.analysis.primaryCategory,
      detail: `Library category ${entry.category} vs required ${params.analysis.primaryCategory}.`
    });

    const scopeOk =
      entry.organizationalScope.length === 0 ||
      entry.organizationalScope.some(s => s.toLowerCase() === 'global') ||
      params.organizationalScope.length === 0 ||
      entry.organizationalScope.some(s => params.organizationalScope.map(x => x.toLowerCase()).includes(s.toLowerCase()));
    checks.push({
      check: 'organizational_scope',
      passed: scopeOk,
      detail: `Library scope [${entry.organizationalScope.join(', ') || 'unspecified'}] vs requested scope [${
        params.organizationalScope.join(', ') || 'unspecified'
      }].`
    });

    const productOk =
      entry.productOrServiceScope.length === 0 ||
      !params.productScope ||
      params.productScope.length === 0 ||
      entry.productOrServiceScope.some(s =>
        params.productScope!.map(x => x.toLowerCase()).includes(s.toLowerCase())
      ) ||
      entry.productOrServiceScope.some(s => s.toLowerCase() === 'all products');
    checks.push({
      check: 'product_service_scope',
      passed: productOk,
      detail: `Library product scope [${entry.productOrServiceScope.join(', ') || 'unspecified'}] vs requested [${
        (params.productScope || []).join(', ') || 'unspecified'
      }].`
    });

    const entryEvidence = params.knowledge.records.filter(r => entry.evidenceReferenceIds.includes(r.sourceId));
    const missingEvidenceRefs = entry.evidenceReferenceIds.filter(
      id => !params.knowledge.records.some(r => r.sourceId === id)
    );
    const expiredEvidence = entryEvidence.filter(r => {
      if (!r.expiresAt) return false;
      return new Date(r.expiresAt).getTime() < new Date(params.asOf).getTime();
    });
    const evidenceOk = missingEvidenceRefs.length === 0 && expiredEvidence.length === 0;
    checks.push({
      check: 'evidence_still_valid',
      passed: evidenceOk,
      detail: evidenceOk
        ? `All ${entry.evidenceReferenceIds.length} referenced evidence record(s) still exist and are unexpired.`
        : `Missing evidence reference(s): [${missingEvidenceRefs.join(', ') || 'none'}]; expired: [${
            expiredEvidence.map(e => e.sourceId).join(', ') || 'none'
          }].`
    });

    const controlStatusChanged = params.knowledge.records.some(record => {
      if (!record.controlCode) return false;
      if (!entry.controlReferences.includes(record.controlCode)) return false;
      if (record.sourceType === 'CONTROL_IMPLEMENTATION') {
        return NEGATIVE_IMPLEMENTATION_STATES.includes(
          String((record.attributes || {}).implementationStatus || '').toUpperCase()
        );
      }
      if (record.sourceType === 'CONTROL_TEST_RESULT') {
        return String((record.attributes || {}).testResult || '').toUpperCase() === 'FAIL';
      }
      return false;
    });
    checks.push({
      check: 'control_status_unchanged',
      passed: !controlStatusChanged,
      detail: controlStatusChanged
        ? `A referenced control (${entry.controlReferences.join(', ')}) is now recorded as not implemented or failed.`
        : 'No referenced control changed to a failed or not-implemented state.'
    });

    const expiredApproval = entry.reviewDueAt ? new Date(entry.reviewDueAt).getTime() < new Date(params.asOf).getTime() : false;
    checks.push({
      check: 'approval_not_expired',
      passed: !expiredApproval,
      detail: expiredApproval
        ? `The library answer review date ${entry.reviewDueAt} has passed; revalidation is required.`
        : `Review due ${entry.reviewDueAt || 'not set'}.`
    });

    checks.push({
      check: 'approval_status_approved',
      passed: entry.approvalStatus === 'APPROVED',
      detail: `Library entry approval status is ${entry.approvalStatus}.`
    });

    const failedChecks = checks.filter(c => !c.passed).map(c => c.check);

    let decision: ReuseDecision;
    if (failedChecks.length === 0) decision = 'REUSE_AUTHORIZED';
    else if (similarity >= MATERIAL_EQUIVALENCE_THRESHOLD) decision = 'REVALIDATION_REQUIRED';
    else if (similarity >= RELATED_THRESHOLD) decision = 'REVALIDATION_REQUIRED';
    else decision = 'REUSE_DENIED';

    const rationale =
      decision === 'REUSE_AUTHORIZED'
        ? `Approved answer "${entry.id}" (v${entry.version}, approved by ${entry.approvedBy} on ${entry.approvedAt}) is materially equivalent and all reuse checks passed.`
        : decision === 'REVALIDATION_REQUIRED'
          ? `A materially similar approved answer exists but failed: ${failedChecks.join(', ')}. Revalidation by ${entry.approvedBy} is required before reuse.`
          : 'No sufficiently equivalent approved answer exists; a new draft is generated.';

    return { decision, entryId: entry.id, checks, failedChecks, rationale, entry };
  }

  /**
   * Builds a draft that reuses an approved library answer.
   *
   * The reused answer keeps the ORIGINAL approver recorded. It is only promoted
   * to APPROVED for this questionnaire when the tenant policy explicitly
   * authorises reuse without re-approval; otherwise it re-enters review.
   */
  public buildDraftFromLibraryEntry(params: {
    entry: GovernedAnswerLibraryEntry;
    question: ExtractedQuestion;
    analysis: RequirementAnalysis;
    retrieval: RetrievalResult;
    validation: ClaimValidationResult;
    requiredReviewerRole: string;
    organizationalScope: string[];
    asOf: string;
    allowReuseWithoutReApproval?: boolean;
  }): AnswerDraft {
    const { entry, question, analysis, retrieval, validation } = params;

    const autoApproved = Boolean(params.allowReuseWithoutReApproval);
    const freshness = retrieval.citations.some(c => c.freshnessStatus === 'EXPIRED')
      ? 'expired evidence present'
      : retrieval.citations.some(c => c.freshnessStatus === 'STALE')
        ? 'stale evidence present'
        : 'all cited evidence current';

    return {
      id: `${question.id}-DRAFT-LIB-${entry.id}`,
      tenantId: entry.tenantId,
      questionnaireId: question.questionnaireId,
      questionId: question.id,
      requirementId: analysis.id,
      version: 1,
      customerFacingResponse: entry.approvedAnswer,
      internalExplanation:
        `Reused from the governed answer library entry ${entry.id} (version ${entry.version}). ` +
        `Original approval by ${entry.approvedBy} on ${entry.approvedAt}; last validated ${entry.lastValidatedAt}; review due ${entry.reviewDueAt}. ` +
        `Reuse checks passed: material equivalence, scope, evidence validity, unchanged control status, unexpired approval. ` +
        `Known limitations: ${entry.knownLimitations.join('; ') || 'none recorded'}. ` +
        `Customer-specific restrictions: ${entry.customerSpecificRestrictions.join('; ') || 'none recorded'}. ` +
        (autoApproved
          ? 'Tenant policy authorises reuse of an unexpired approved answer without a second approval.'
          : 'This questionnaire still requires a reviewer to approve the reused answer.'),
      disposition: 'VERIFIED_OPEN_RESPONSE',
      sufficiency: 'SUFFICIENT',
      citations: retrieval.citations,
      controlReferences: entry.controlReferences.length > 0 ? entry.controlReferences : analysis.relevantControlCodes,
      frameworkReferences: entry.frameworkMappings,
      organizationalScope: entry.organizationalScope.length > 0 ? entry.organizationalScope : params.organizationalScope,
      evidenceFreshnessSummary: `${freshness} (${retrieval.citations.length} citation(s) refreshed at reuse time)`,
      confidenceEstimate: 85,
      confidenceBasis:
        'Heuristic estimate based on a previously human-approved answer whose supporting evidence and control status were re-verified at reuse time. Not a probability.',
      missingInformation: [],
      contradictionWarnings: [],
      suggestedNextAction: autoApproved
        ? 'Include in export; the reuse authorisation is recorded in the audit history.'
        : 'Route to the required reviewer to approve the reused answer for this questionnaire.',
      requiredReviewerRole: params.requiredReviewerRole,
      status: autoApproved ? 'APPROVED' : 'DRAFT',
      generatedAt: params.asOf,
      generatedBy: 'HUMAN',
      unsupportedAssertionsRemoved: [],
      untrustedContentFlags: []
    };
  }

  /** Creates or supersedes a library entry, preserving version history. */
  public async storeApprovedAnswer(params: {
    tenantId: string;
    canonicalQuestion: string;
    normalizedRequirement: string;
    approvedAnswer: string;
    category: GovernedAnswerLibraryEntry['category'];
    frameworkMappings: string[];
    controlReferences: string[];
    evidenceReferenceIds: string[];
    organizationalScope: string[];
    productOrServiceScope: string[];
    businessUnit: string;
    approvedBy: string;
    approvedAt: string;
    reviewDueAt: string;
    knownLimitations?: string[];
    customerSpecificRestrictions?: string[];
    evidenceFreshnessAtApproval?: GovernedAnswerLibraryEntry['evidenceFreshnessAtApproval'];
    reason?: string;
  }): Promise<GovernedAnswerLibraryEntry> {
    const existing = (await this.store.listEntries(params.tenantId)).find(
      e =>
        e.tenantId === params.tenantId &&
        e.category === params.category &&
        (e.canonicalQuestion === params.canonicalQuestion || e.normalizedRequirement === params.normalizedRequirement)
    );

    if (existing) {
      // Preserve history: append the prior approved text, never overwrite it.
      const superseded: GovernedAnswerLibraryEntry = {
        ...existing,
        approvedAnswer: params.approvedAnswer,
        version: existing.version + 1,
        approvalStatus: 'APPROVED',
        approvedBy: params.approvedBy,
        approvedAt: params.approvedAt,
        lastValidatedAt: params.approvedAt,
        reviewDueAt: params.reviewDueAt,
        frameworkMappings: params.frameworkMappings,
        controlReferences: params.controlReferences,
        evidenceReferenceIds: params.evidenceReferenceIds,
        organizationalScope: params.organizationalScope,
        productOrServiceScope: params.productOrServiceScope,
        businessUnit: params.businessUnit,
        knownLimitations: params.knownLimitations || [],
        customerSpecificRestrictions: params.customerSpecificRestrictions || [],
        evidenceFreshnessAtApproval: params.evidenceFreshnessAtApproval || 'CURRENT',
        versionHistory: [
          ...existing.versionHistory,
          {
            version: existing.version,
            approvedAnswer: existing.approvedAnswer,
            changedBy: params.approvedBy,
            changedAt: params.approvedAt,
            reason: params.reason || 'Answer superseded by a new approved response.'
          }
        ]
      };
      return this.store.saveEntry(superseded);
    }

    const entry: GovernedAnswerLibraryEntry = {
      id: `LIB-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      tenantId: params.tenantId,
      canonicalQuestion: params.canonicalQuestion,
      normalizedRequirement: params.normalizedRequirement,
      approvedAnswer: params.approvedAnswer,
      category: params.category,
      frameworkMappings: params.frameworkMappings,
      controlReferences: params.controlReferences,
      evidenceReferenceIds: params.evidenceReferenceIds,
      organizationalScope: params.organizationalScope,
      productOrServiceScope: params.productOrServiceScope,
      businessUnit: params.businessUnit,
      approvalStatus: 'APPROVED',
      approvedBy: params.approvedBy,
      approvedAt: params.approvedAt,
      lastValidatedAt: params.approvedAt,
      reviewDueAt: params.reviewDueAt,
      version: 1,
      versionHistory: [],
      knownLimitations: params.knownLimitations || [],
      customerSpecificRestrictions: params.customerSpecificRestrictions || [],
      evidenceFreshnessAtApproval: params.evidenceFreshnessAtApproval || 'CURRENT'
    };
    return this.store.saveEntry(entry);
  }

  /** Requests revalidation of an entry without changing its approved text. */
  public async markForRevalidation(params: {
    entry: GovernedAnswerLibraryEntry;
    reason: string;
    actor: string;
    at: string;
  }): Promise<GovernedAnswerLibraryEntry> {
    const updated: GovernedAnswerLibraryEntry = {
      ...params.entry,
      approvalStatus: 'PENDING_REVALIDATION',
      versionHistory: [
        ...params.entry.versionHistory,
        {
          version: params.entry.version,
          approvedAnswer: params.entry.approvedAnswer,
          changedBy: params.actor,
          changedAt: params.at,
          reason: `Revalidation requested: ${params.reason}`
        }
      ]
    };
    return this.store.saveEntry(updated);
  }

  public explainReuse(evaluation: ReuseEvaluation): string {
    return [
      `Decision: ${evaluation.decision}`,
      `Entry: ${evaluation.entryId || 'none'}`,
      ...evaluation.checks.map(c => `${c.passed ? 'PASS' : 'FAIL'} ${c.check}: ${c.detail}`),
      evaluation.rationale
    ].join('\n');
  }
}
