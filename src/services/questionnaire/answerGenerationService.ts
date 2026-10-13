// ============================================================================
// SKANDA QUESTIONNAIRE INTELLIGENCE: ANSWER GENERATION ENGINE
// Path: src/services/questionnaire/answerGenerationService.ts
//
// Produces a proposed response for a question from authorised organizational
// knowledge ONLY.
//
// Hard rules enforced here:
//  1. Missing evidence is never converted into a Yes or a No.
//  2. A policy is never presented as proof that a control operates.
//  3. Organization-specific facts are never invented.
//  4. Confidence is an explicit heuristic ESTIMATE, never a probability, and it
//     can never override a contradicted or unsupported claim.
//  5. Untrusted questionnaire text can never change control flow.
// ============================================================================

import {
  AnswerDisposition,
  AnswerDraft,
  ClaimValidationResult,
  EvidenceCitation,
  EvidenceSufficiency,
  ExtractedQuestion,
  MissingInformationItem,
  RequirementAnalysis,
  ValidatedClaim
} from '../../types/questionnaireIntelligenceTypes.js';
import { ContradictionSignal } from './claimValidationService.js';
import { RetrievalResult } from '../../types/questionnaireIntelligenceTypes.js';
import { detectUntrustedInstructionPatterns, normalizeText } from './ooxml/xmlUtils.js';

export interface DraftGenerationInput {
  tenantId: string;
  questionnaireId: string;
  question: ExtractedQuestion;
  analysis: RequirementAnalysis;
  validation: ClaimValidationResult;
  retrieval: RetrievalResult;
  contradictions: ContradictionSignal[];
  requiredReviewerRole: string;
  organizationalScope: string[];
  asOf: string;
  /** Marks the draft blocked when a knowledge source integration failed. */
  retrievalPartialFailure: boolean;
  /** Optional approved not-applicable fact for this question's knowledge key. */
  notApplicableFact?: { sourceId: string; title: string; justification: string } | null;
}

const BINARY_RESPONSE_TYPES = ['YES_NO', 'YES_NO_PARTIAL', 'MULTIPLE_CHOICE'];

export class AnswerGenerationService {
  private static instance: AnswerGenerationService;

  public static getInstance(): AnswerGenerationService {
    if (!AnswerGenerationService.instance) {
      AnswerGenerationService.instance = new AnswerGenerationService();
    }
    return AnswerGenerationService.instance;
  }

  public generateDraft(input: DraftGenerationInput): AnswerDraft {
    const { question, analysis, validation, retrieval } = input;
    const isBinary = BINARY_RESPONSE_TYPES.includes(analysis.expectedResponseType);

    const contradictionCodes = new Set(input.contradictions.map(c => c.code));
    const recordedNotImplemented = contradictionCodes.has('CONTROL_NOT_IMPLEMENTED');

    const disposition: AnswerDisposition = this.resolveDisposition({
      validation,
      isBinary,
      recordedNotImplemented,
      notApplicable: Boolean(input.notApplicableFact)
    });

    const sufficiency = this.resolveSufficiency(disposition, validation);

    const supportingCitations = retrieval.citations.filter(c =>
      validation.claims.some(v => v.supportingCitationIds.includes(c.citationId))
    );
    const contradictionWarnings = input.contradictions.map(
      c => `[${c.code}] ${c.detail}`
    );

    const missingInformation = this.buildMissingInformation({
      validation,
      analysis,
      contradictions: input.contradictions,
      reviewerRole: input.requiredReviewerRole,
      retrievalPartialFailure: input.retrievalPartialFailure
    });

    const untrustedContentFlags = this.collectUntrustedFlags(question.originalText);

    const customerFacingResponse = this.composeResponse({
      disposition,
      question,
      analysis,
      validation,
      citations: supportingCitations,
      contradictionWarnings,
      reviewerRole: input.requiredReviewerRole,
      notApplicableJustification: input.notApplicableFact?.justification
    });

    const unsupportedAssertionsRemoved = this.collectRemovedAssertions({
      validation,
      disposition,
      citations: retrieval.citations
    });

    const internalExplanation = this.composeInternalExplanation({
      analysis,
      validation,
      citations: retrieval.citations,
      contradictions: input.contradictions,
      retrieval,
      asOf: input.asOf
    });

    const { confidenceEstimate, confidenceBasis } = this.estimateConfidence({
      validation,
      citations: retrieval.citations,
      isBinary,
      retrievalPartialFailure: input.retrievalPartialFailure
    });

    const isBlocked = ['INSUFFICIENT_EVIDENCE', 'UNKNOWN', 'REQUIRES_SPECIALIST_REVIEW'].includes(disposition);

    return {
      id: `${question.id}-DRAFT-v1`,
      tenantId: input.tenantId,
      questionnaireId: input.questionnaireId,
      questionId: question.id,
      requirementId: analysis.id,
      version: 1,
      customerFacingResponse,
      internalExplanation,
      disposition,
      sufficiency,
      citations: retrieval.citations,
      controlReferences: analysis.relevantControlCodes,
      frameworkReferences: analysis.frameworkMappings.map(m => `${m.frameworkCode} ${m.requirementCode}`),
      organizationalScope: input.organizationalScope,
      evidenceFreshnessSummary: this.summarizeFreshness(retrieval.citations),
      confidenceEstimate,
      confidenceBasis,
      missingInformation,
      contradictionWarnings,
      suggestedNextAction: this.suggestNextAction(disposition),
      requiredReviewerRole: input.requiredReviewerRole,
      status: isBlocked ? 'BLOCKED_UNSUPPORTED' : 'GENERATED',
      generatedAt: input.asOf,
      generatedBy: 'SKANDA_DRAFT_ENGINE',
      refusalReason: isBlocked
        ? 'The draft engine will not assert a security, privacy or compliance claim that the tenant evidence does not support.'
        : undefined,
      unsupportedAssertionsRemoved,
      untrustedContentFlags
    };
  }

  private resolveDisposition(params: {
    validation: ClaimValidationResult;
    isBinary: boolean;
    recordedNotImplemented: boolean;
    notApplicable: boolean;
  }): AnswerDisposition {
    const { validation, isBinary } = params;

    if (params.notApplicable) return 'NOT_APPLICABLE_WITH_JUSTIFICATION';

    if (validation.hasContradiction) {
      // Only a recorded, current canonical "not implemented" fact may produce a
      // verified No. Anything else is routed to a specialist rather than guessed.
      return isBinary && params.recordedNotImplemented ? 'VERIFIED_NO' : 'REQUIRES_SPECIALIST_REVIEW';
    }

    switch (validation.worstState) {
      case 'SUPPORTED_BY_CURRENT_EVIDENCE':
      case 'SUPPORTED_BY_APPROVED_FACT':
        return isBinary ? 'VERIFIED_YES' : 'VERIFIED_OPEN_RESPONSE';
      case 'AWAITING_HUMAN_VERIFICATION':
        return 'AWAITING_OWNER_CONFIRMATION';
      case 'EXPIRED_OR_STALE':
        return 'AWAITING_OWNER_CONFIRMATION';
      case 'OUTSIDE_AVAILABLE_SCOPE':
        return 'UNKNOWN';
      case 'SUPPORTED_BY_POLICY_ONLY':
        return 'INSUFFICIENT_EVIDENCE';
      case 'PARTIALLY_SUPPORTED':
        return 'PARTIALLY_IMPLEMENTED';
      case 'UNSUPPORTED':
      default:
        return 'INSUFFICIENT_EVIDENCE';
    }
  }

  private resolveSufficiency(
    disposition: AnswerDisposition,
    validation: ClaimValidationResult
  ): EvidenceSufficiency {
    if (disposition === 'NOT_APPLICABLE_WITH_JUSTIFICATION') return 'NOT_APPLICABLE';
    if (validation.hasContradiction) return 'CONTRADICTED';
    if (['VERIFIED_YES', 'VERIFIED_NO', 'VERIFIED_OPEN_RESPONSE'].includes(disposition)) return 'SUFFICIENT';
    if (disposition === 'PARTIALLY_IMPLEMENTED') return 'PARTIAL';
    return 'INSUFFICIENT';
  }

  private buildMissingInformation(params: {
    validation: ClaimValidationResult;
    analysis: RequirementAnalysis;
    contradictions: ContradictionSignal[];
    reviewerRole: string;
    retrievalPartialFailure: boolean;
  }): MissingInformationItem[] {
    const items: MissingInformationItem[] = [];

    for (const claim of params.validation.claims) {
      for (const missing of claim.missingEvidence) {
        items.push({
          kind: this.missingKindFor(claim, params.contradictions),
          detail: `${missing} (required for: "${claim.claimText}")`,
          requiredFromRole: params.reviewerRole
        });
      }
      if (claim.supportState === 'AWAITING_HUMAN_VERIFICATION') {
        items.push({
          kind: 'OWNER_CONFIRMATION',
          detail: `Owner confirmation required for: ${claim.claimText}`,
          requiredFromRole: params.reviewerRole
        });
      }
    }

    for (const signal of params.contradictions) {
      if (signal.code === 'UNAPPROVED_POLICY_REFERENCED') {
        items.push({
          kind: 'UNAPPROVED_POLICY',
          detail: signal.detail,
          requiredFromRole: 'COMPLIANCE_MANAGER',
          linkedControlCode: signal.controlCode
        });
      }
      if (signal.code === 'CONTROL_NOT_IMPLEMENTED' || signal.code === 'POLICY_VS_PARTIAL_IMPLEMENTATION_CONFLICT') {
        items.push({
          kind: 'SPECIALIST_INTERPRETATION',
          detail: signal.detail,
          requiredFromRole: 'CONTROL_OWNER',
          linkedControlCode: signal.controlCode
        });
      }
    }

    if (params.retrievalPartialFailure) {
      items.push({
        kind: 'MISSING_EVIDENCE',
        detail:
          'One or more knowledge source integrations failed during retrieval. Answers that depend on those sources cannot be asserted as verified.',
        requiredFromRole: 'PLATFORM_OPERATOR'
      });
    }

    if (items.length === 0 && params.analysis.clarificationNeeded) {
      items.push({
        kind: 'CUSTOMER_SPECIFIC_CONFIRMATION',
        detail:
          'The question wording is ambiguous. Confirm the intended requirement with the requester before answering.',
        requiredFromRole: 'COMPLIANCE_MANAGER'
      });
    }

    // De-duplicate identical gaps so retries and multi-claim questions do not
    // inflate the gap register.
    const seen = new Set<string>();
    return items.filter(item => {
      const key = `${item.kind}::${item.detail}::${item.requiredFromRole}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private missingKindFor(claim: ValidatedClaim, contradictions: ContradictionSignal[]): MissingInformationItem['kind'] {
    if (claim.supportState === 'EXPIRED_OR_STALE') return 'EXPIRED_EVIDENCE';
    if (claim.supportState === 'SUPPORTED_BY_POLICY_ONLY') return 'MISSING_EVIDENCE';
    if (claim.supportState === 'UNSUPPORTED') return 'MISSING_EVIDENCE';
    if (contradictions.some(c => c.appliesTo === 'CERTIFICATION')) return 'CUSTOMER_SPECIFIC_CONFIRMATION';
    return 'MISSING_EVIDENCE';
  }

  private composeResponse(params: {
    disposition: AnswerDisposition;
    question: ExtractedQuestion;
    analysis: RequirementAnalysis;
    validation: ClaimValidationResult;
    citations: EvidenceCitation[];
    contradictionWarnings: string[];
    reviewerRole: string;
    notApplicableJustification?: string;
  }): string {
    const domain = params.analysis.primaryCategory.replace(/_/g, ' ').toLowerCase();
    const approvedDoc = params.citations.find(
      c => c.sourceType === 'APPROVED_POLICY' || c.sourceType === 'APPROVED_PROCEDURE' || c.sourceType === 'SECURITY_STANDARD'
    );
    const supportedClaimText = params.validation.claims
      .filter(c => ['SUPPORTED_BY_CURRENT_EVIDENCE', 'SUPPORTED_BY_APPROVED_FACT'].includes(c.supportState))
      .map(c => c.claimText)
      .join('; ');

    switch (params.disposition) {
      case 'VERIFIED_YES':
        return this.withEvidenceFooter(
          `Yes. ${capitalize(stripTrailingPunctuation(supportedClaimText || params.analysis.underlyingRequirement))} is confirmed by current evidence held by this organization.`,
          params
        );

      case 'VERIFIED_OPEN_RESPONSE':
        return this.withEvidenceFooter(
          `${capitalize(stripTrailingPunctuation(supportedClaimText || params.analysis.underlyingRequirement))}. The following is supported by current evidence held by this organization and is provided for the stated scope.`,
          params
        );

      case 'VERIFIED_NO':
        return this.withEvidenceFooter(
          `No. The organization's own records for this scope state that the capability described in the question is not implemented. The question wording should be reviewed with the requester where a compensating control applies.`,
          params
        );

      case 'PARTIALLY_IMPLEMENTED':
        return this.withEvidenceFooter(
          `${capitalize(domain)} is partially addressed. The control is implemented for part of the in-scope environment and evidence does not yet cover the full population described in the question. This should not be read as full coverage.`,
          params
        );

      case 'NOT_APPLICABLE_WITH_JUSTIFICATION':
        return `Not applicable. ${
          params.notApplicableJustification ||
          'An approved organizational applicability determination states this requirement does not apply.'
        }`;

      case 'AWAITING_OWNER_CONFIRMATION':
        return this.withEvidenceFooter(
          `${capitalize(domain)} is addressed by the organization's documentation, but confirmation and current evidence are required from the responsible owner before any assurance statement can be made. The available records do not evidence the capability across the full scope of the question, and the supporting evidence on file has expired or must be revalidated.`,
          params
        );

      case 'UNKNOWN':
        return (
          `Unable to verify. Our records do not cover this question for the applicable organizational scope, so the organization cannot confirm or deny the statement as worded. ` +
          `The question should be clarified with the requester before a response is issued.`
        );

      case 'REQUIRES_SPECIALIST_REVIEW':
        return (
          `This response requires review by ${params.reviewerRole.replace(/_/g, ' ').toLowerCase()} before it can be issued. ` +
          `The organization's own records conflict with the statement in the question, and the platform will not present a contradicting position as a verified answer. ` +
          `Internal review rationale: ${params.contradictionWarnings[0] || 'recorded contradiction detected'}.`
        );

      case 'INSUFFICIENT_EVIDENCE':
      default: {
        const addressedBy = approvedDoc
          ? `${capitalize(domain)} is addressed by the organization's ${
              approvedDoc.sourceType === 'APPROVED_POLICY' ? 'policy' : 'documentation'
            } ("${approvedDoc.sourceTitle}")`
          : `${capitalize(domain)} is referenced in the organization's documentation`;
        return (
          `${addressedBy}, but the available evidence does not verify the requirement across the full scope described in the question. ` +
          `Confirmation and current evidence are required from the responsible owner${
            params.analysis.requiredEvidenceKinds.length > 0
              ? `; specifically: ${params.analysis.requiredEvidenceKinds.slice(0, 3).join(', ')}.`
              : '.'
          } ` +
          `No assurance statement is made until that evidence is provided and reviewed.`
        );
      }
    }
  }

  private withEvidenceFooter(base: string, params: {
    citations: EvidenceCitation[];
    analysis: RequirementAnalysis;
    disposition: AnswerDisposition;
  }): string {
    const strongest = params.citations[0];
    if (!strongest) return base;
    const scope = strongest.organizationalScope.length > 0 ? strongest.organizationalScope.join(', ') : 'organization-wide';
    const controlText =
      params.analysis.relevantControlCodes.length > 0
        ? ` Control reference: ${params.analysis.relevantControlCodes.slice(0, 3).join(', ')}.`
        : '';
    return `${base}${controlText} Supporting evidence on file: ${strongest.sourceTitle} (${strongest.sourceLocation}), scope ${scope}, evidence status ${strongest.sourceStatus}, freshness ${strongest.freshnessStatus}.`;
  }

  private composeInternalExplanation(params: {
    analysis: RequirementAnalysis;
    validation: ClaimValidationResult;
    citations: EvidenceCitation[];
    contradictions: ContradictionSignal[];
    retrieval: RetrievalResult;
    asOf: string;
  }): string {
    const lines: string[] = [];
    lines.push(`Interpreted requirement: ${params.analysis.normalizedInterpretation}`);
    lines.push(
      `Classification: ${params.analysis.primaryCategory}${
        params.analysis.secondaryCategories.length > 0 ? ` (secondary: ${params.analysis.secondaryCategories.join(', ')})` : ''
      } — heuristic confidence ${params.analysis.classificationConfidence}/100.`
    );
    lines.push(`Multi-part question: ${params.analysis.isMultiPart ? 'yes' : 'no'}; ${params.validation.claims.length} answerable claim(s).`);

    for (const claim of params.validation.claims) {
      lines.push(` • Claim "${claim.claimText}" → ${claim.supportState}. ${claim.explanation}`);
    }

    if (params.contradictions.length > 0) {
      lines.push('Contradictions detected in tenant records:');
      for (const c of params.contradictions) {
        lines.push(`   - [${c.code}] ${c.detail}`);
      }
    }

    lines.push(
      `Sources retrieved: ${params.citations.length}. Freshness: ${this.summarizeFreshness(params.citations)}.`
    );
    if (params.retrieval.partialFailure) {
      lines.push(
        `Retrieval was PARTIAL: ${params.retrieval.degradedSources
          .map(d => `${d.sourceType} (${d.reason})`)
          .join('; ')}. No evidence was substituted for the failed source.`
      );
    }
    if (params.retrieval.appliedFilters.length > 0) {
      lines.push(`Filters applied: ${params.retrieval.appliedFilters.join('; ')}.`);
    }
    lines.push(`Evaluated as of ${params.asOf}.`);
    return lines.join('\n');
  }

  private collectRemovedAssertions(params: {
    validation: ClaimValidationResult;
    disposition: AnswerDisposition;
    citations: EvidenceCitation[];
  }): string[] {
    const removed: string[] = [];
    if (params.disposition === 'INSUFFICIENT_EVIDENCE') {
      for (const claim of params.validation.claims) {
        if (claim.supportState === 'SUPPORTED_BY_POLICY_ONLY') {
          removed.push(
            `Removed assertion of operating effectiveness for "${claim.claimText}" — only an approved document supports it, which does not demonstrate the control operated.`
          );
        } else if (claim.supportState === 'UNSUPPORTED') {
          removed.push(`Removed unsupported assertion "${claim.claimText}" — no authorised evidence was found.`);
        }
      }
    }
    if (params.disposition === 'AWAITING_OWNER_CONFIRMATION') {
      for (const claim of params.validation.claims) {
        if (claim.supportState === 'EXPIRED_OR_STALE') {
          removed.push(
            `Removed assertion based on expired evidence for "${claim.claimText}" — revalidation is required.`
          );
        }
      }
    }
    if (params.disposition === 'REQUIRES_SPECIALIST_REVIEW') {
      removed.push('Removed contested statement — tenant records contradict the claim and require specialist adjudication.');
    }
    return removed;
  }

  private estimateConfidence(params: {
    validation: ClaimValidationResult;
    citations: EvidenceCitation[];
    isBinary: boolean;
    retrievalPartialFailure: boolean;
  }): { confidenceEstimate: number; confidenceBasis: string } {
    const basis: string[] = [];
    let score = 25;
    basis.push('base 25');

    const currentPrimary = params.citations.filter(
      c => c.provesOperatingEffectiveness && c.sourceReliability === 'PRIMARY_VERIFIED' && c.freshnessStatus === 'CURRENT'
    ).length;
    if (currentPrimary > 0) {
      score += Math.min(30, 15 + currentPrimary * 5);
      basis.push(`+${Math.min(30, 15 + currentPrimary * 5)} for ${currentPrimary} current primary source(s)`);
    }
    const approvedFacts = params.citations.filter(
      c => c.sourceType === 'APPROVED_ORGANIZATIONAL_FACT' && /^(APPROVED|VERIFIED)$/i.test(c.sourceStatus)
    ).length;
    if (approvedFacts > 0) {
      score += 15;
      basis.push('+15 for approved organizational fact');
    }
    const approvedDocs = params.citations.filter(
      c => (c.sourceType === 'APPROVED_POLICY' || c.sourceType === 'APPROVED_PROCEDURE' || c.sourceType === 'SECURITY_STANDARD') &&
        /^(APPROVED|PUBLISHED|EFFECTIVE)$/i.test(c.sourceStatus)
    ).length;
    if (approvedDocs > 0) {
      score += 8;
      basis.push('+8 for approved documentation (documentation alone never proves operation)');
    }
    const expired = params.citations.filter(c => c.freshnessStatus === 'EXPIRED' || c.freshnessStatus === 'STALE').length;
    if (expired > 0) {
      score -= Math.min(25, expired * 8);
      basis.push(`-${Math.min(25, expired * 8)} for ${expired} expired/stale source(s)`);
    }
    if (params.validation.hasContradiction) {
      score -= 35;
      basis.push('-35 for a detected contradiction');
    }
    if (params.validation.worstState === 'UNSUPPORTED') {
      score -= 20;
      basis.push('-20 because the requirement is unsupported');
    }
    if (params.retrievalPartialFailure) {
      score -= 15;
      basis.push('-15 because a knowledge source integration failed');
    }
    if (!params.isBinary) {
      score -= 5;
      basis.push('-5 because the question is open-ended and cannot be reduced to a binary claim');
    }

    score = Math.max(0, Math.min(95, score));

    // A score must never override a critical unsupported or contradicted claim.
    if (params.validation.hasCriticalUnsupportedClaim || params.validation.hasContradiction) {
      if (score > 40) {
        basis.push('capped at 40 because an unsupported or contradicted claim is present');
        score = 40;
      }
    }

    return {
      confidenceEstimate: score,
      confidenceBasis: `Heuristic estimate (not a probability). Components: ${basis.join('; ')}.`
    };
  }

  public explain(draft: AnswerDraft, previousAnswerText?: string): {
    whyThisAnswer: string[];
    whatEvidenceIsMissing: string[];
    whatChangedSincePreviousAnswer: string[];
    limitations: string[];
  } {
    const why: string[] = [];
    why.push(`Disposition ${draft.disposition} with evidence sufficiency ${draft.sufficiency}.`);
    why.push(draft.internalExplanation.split('\n')[0]);
    for (const citation of draft.citations.slice(0, 5)) {
      why.push(
        `Source: ${citation.sourceTitle} v${citation.sourceVersion} at ${citation.sourceLocation} (owner ${citation.evidenceOwner}, status ${citation.sourceStatus}, freshness ${citation.freshnessStatus}).`
      );
    }
    why.push(draft.confidenceBasis);

    const missing = draft.missingInformation.map(m => `${m.kind}: ${m.detail} (owner: ${m.requiredFromRole})`);

    const changed: string[] = [];
    if (previousAnswerText === undefined) {
      changed.push('No prior approved answer exists for this question in the answer library.');
    } else if (previousAnswerText.trim() === draft.customerFacingResponse.trim()) {
      changed.push('Proposed wording matches the previous answer; evidence freshness is the only recorded change.');
    } else {
      changed.push('The previous approved answer differs from the current draft; re-approval is required before reuse.');
    }
    const stale = draft.citations.filter(c => c.freshnessStatus !== 'CURRENT');
    for (const citation of stale) {
      changed.push(`Evidence "${citation.sourceTitle}" is ${citation.freshnessStatus} and may have changed since approval.`);
    }
    for (const warning of draft.contradictionWarnings) {
      changed.push(`Contradiction: ${warning}`);
    }

    const limitations: string[] = [];
    if (draft.untrustedContentFlags.length > 0) {
      limitations.push(
        `Untrusted content flags raised from the questionnaire text: ${draft.untrustedContentFlags.join(', ')}. The text was treated as data only.`
      );
    }
    limitations.push(
      'A questionnaire response generated from this platform documents the organization\'s own assertions and evidence. It does not constitute an audit opinion and does not prove compliance.'
    );
    if (draft.disposition === 'INSUFFICIENT_EVIDENCE') {
      limitations.push('The response deliberately does not assert the requested assurance.');
    }

    return {
      whyThisAnswer: why,
      whatEvidenceIsMissing: missing,
      whatChangedSincePreviousAnswer: changed,
      limitations
    };
  }

  private summarizeFreshness(citations: EvidenceCitation[]): string {
    if (citations.length === 0) return 'no sources cited';
    const counts = new Map<string, number>();
    for (const c of citations) counts.set(c.freshnessStatus, (counts.get(c.freshnessStatus) || 0) + 1);
    return Array.from(counts.entries())
      .map(([status, count]) => `${count} ${status}`)
      .join(', ');
  }

  private suggestNextAction(disposition: AnswerDisposition): string {
    switch (disposition) {
      case 'VERIFIED_YES':
      case 'VERIFIED_NO':
      case 'VERIFIED_OPEN_RESPONSE':
        return 'Route to the required reviewer for approval, then export.';
      case 'PARTIALLY_IMPLEMENTED':
        return 'Confirm the extent of coverage with the control owner and supplement the evidence before approval.';
      case 'AWAITING_OWNER_CONFIRMATION':
        return 'Request current evidence from the responsible owner and re-run generation.';
      case 'UNKNOWN':
        return 'Clarify the requirement with the requester or record an approved applicability determination.';
      case 'REQUIRES_SPECIALIST_REVIEW':
        return 'Escalate to the specialist reviewer to adjudicate the contradiction before any response is issued.';
      case 'NOT_APPLICABLE_WITH_JUSTIFICATION':
        return 'Confirm the applicability determination remains valid for this customer and scope.';
      case 'INSUFFICIENT_EVIDENCE':
      default:
        return 'Collect the missing evidence or record an approved organizational fact; do not answer until that is done.';
    }
  }

  private collectUntrustedFlags(text: string): string[] {
    return detectUntrustedInstructionPatterns(text);
  }
}

function stripTrailingPunctuation(value: string): string {
  return normalizeText(value).replace(/[.:;\s]+$/, '');
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export const answerGenerationService = AnswerGenerationService.getInstance();
