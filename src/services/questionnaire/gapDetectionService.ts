// ============================================================================
// SKANDA QUESTIONNAIRE INTELLIGENCE: GAP DETECTION & REMEDIATION LINKAGE
// Path: src/services/questionnaire/gapDetectionService.ts
//
// Keeps five distinct concepts separate, as required:
//   1. questionnaire answer gap
//   2. missing evidence
//   3. confirmed control deficiency
//   4. verified control test failure
//   5. remediation action
//
// A missing questionnaire response NEVER automatically creates a confirmed
// control failure. Remediation records are only proposed from verified signals
// (a recorded control-not-implemented state or a failed control test) and only
// when remediation creation is explicitly authorised by the caller.
// ============================================================================

import crypto from 'crypto';
import {
  AnswerDraft,
  ExtractedQuestion,
  GapClassification,
  GapType,
  QuestionnaireGap,
  RequirementAnalysis
} from '../../types/questionnaireIntelligenceTypes.js';
import { ContradictionSignal } from './claimValidationService.js';

export interface GapDetectionInput {
  tenantId: string;
  questionnaireId: string;
  question: ExtractedQuestion;
  analysis: RequirementAnalysis | null;
  draft: AnswerDraft | null;
  contradictions: ContradictionSignal[];
  /** Explicit caller authorisation to create remediation records. */
  allowRemediationCreation: boolean;
  asOf: string;
  /** Existing canonical records this gap should link to (never duplicated). */
  links?: {
    controlCode?: string;
    riskId?: string;
    findingId?: string;
    capaId?: string;
  };
}

const GAP_SEVERITY: Record<GapType, QuestionnaireGap['severity']> = {
  CONTRADICTORY_RECORDS: 'HIGH',
  FAILED_CONTROL_TEST: 'CRITICAL',
  CONTROL_NOT_IMPLEMENTED: 'HIGH',
  CONTROL_PARTIALLY_IMPLEMENTED: 'MEDIUM',
  EXPIRED_EVIDENCE: 'HIGH',
  MISSING_EVIDENCE: 'HIGH',
  MISSING_ORGANIZATIONAL_FACT: 'MEDIUM',
  UNAPPROVED_POLICY: 'MEDIUM',
  UNAVAILABLE_INTEGRATION: 'HIGH',
  CUSTOMER_SPECIFIC_CONFIRMATION_REQUIRED: 'MEDIUM',
  SPECIALIST_INTERPRETATION_REQUIRED: 'MEDIUM',
  MANDATORY_UNANSWERED: 'CRITICAL'
};

function stableGapId(questionId: string, gapType: GapType, detail: string): string {
  const digest = crypto.createHash('sha256').update(`${questionId}::${gapType}::${detail}`).digest('hex').slice(0, 12);
  return `GAP-${questionId}-${gapType.slice(0, 18)}-${digest}`;
}

export class GapDetectionService {
  private static instance: GapDetectionService;

  public static getInstance(): GapDetectionService {
    if (!GapDetectionService.instance) {
      GapDetectionService.instance = new GapDetectionService();
    }
    return GapDetectionService.instance;
  }

  public detectGaps(input: GapDetectionInput): QuestionnaireGap[] {
    const gaps: QuestionnaireGap[] = [];
    const seen = new Set<string>();

    const push = (
      gapType: GapType,
      classification: GapClassification,
      detail: string,
      requiredFromRole: string,
      extra?: Partial<QuestionnaireGap>
    ) => {
      const id = stableGapId(input.question.id, gapType, detail);
      // Idempotency: a retried job must not create a duplicate gap.
      if (seen.has(id)) return;
      seen.add(id);
      gaps.push({
        id,
        tenantId: input.tenantId,
        questionnaireId: input.questionnaireId,
        questionId: input.question.id,
        answerDraftId: input.draft?.id,
        gapType,
        classification,
        severity: GAP_SEVERITY[gapType],
        title: gapType.replace(/_/g, ' '),
        detail,
        requiredFromRole,
        remediationCreated: false,
        detectedAt: input.asOf,
        status: 'OPEN',
        ...extra
      });
    };

    const linkedControlCode = input.links?.controlCode || input.analysis?.relevantControlCodes[0];

    // ---- 1. Answer gaps and evidence signals from the draft engine ----------
    if (input.draft) {
      for (const item of input.draft.missingInformation) {
        switch (item.kind) {
          case 'MISSING_EVIDENCE':
            push('MISSING_EVIDENCE', 'MISSING_EVIDENCE_SIGNAL', item.detail, item.requiredFromRole, {
              linkedControlCode: item.linkedControlCode || linkedControlCode
            });
            break;
          case 'EXPIRED_EVIDENCE':
            push('EXPIRED_EVIDENCE', 'MISSING_EVIDENCE_SIGNAL', item.detail, item.requiredFromRole, {
              linkedControlCode: item.linkedControlCode || linkedControlCode
            });
            break;
          case 'MISSING_ORGANIZATIONAL_FACT':
          case 'OWNER_CONFIRMATION':
            push('MISSING_ORGANIZATIONAL_FACT', 'QUESTIONNAIRE_ANSWER_GAP', item.detail, item.requiredFromRole);
            break;
          case 'UNAPPROVED_POLICY':
            push('UNAPPROVED_POLICY', 'QUESTIONNAIRE_ANSWER_GAP', item.detail, item.requiredFromRole, {
              linkedControlCode: item.linkedControlCode || linkedControlCode
            });
            break;
          case 'SPECIALIST_INTERPRETATION':
            push('SPECIALIST_INTERPRETATION_REQUIRED', 'QUESTIONNAIRE_ANSWER_GAP', item.detail, item.requiredFromRole, {
              linkedControlCode: item.linkedControlCode || linkedControlCode
            });
            break;
          case 'CUSTOMER_SPECIFIC_CONFIRMATION':
          default:
            push('CUSTOMER_SPECIFIC_CONFIRMATION_REQUIRED', 'QUESTIONNAIRE_ANSWER_GAP', item.detail, item.requiredFromRole);
            break;
        }
      }

      if (input.draft.disposition === 'INSUFFICIENT_EVIDENCE' || input.draft.disposition === 'UNKNOWN') {
        push(
          'MISSING_EVIDENCE',
          'QUESTIONNAIRE_ANSWER_GAP',
          `No evidence-backed answer could be produced for question "${input.question.originalText.slice(0, 120)}". ` +
            'The question remains unanswered pending evidence or an approved organizational fact.',
          input.draft.requiredReviewerRole,
          { linkedControlCode }
        );
      }
    } else {
      push(
        'MISSING_EVIDENCE',
        'QUESTIONNAIRE_ANSWER_GAP',
        `Question "${input.question.originalText.slice(0, 120)}" has not been processed; no draft exists.`,
        input.analysis?.specialistRole || 'CONTROL_OWNER'
      );
    }

    // ---- 2. Contradiction-derived gaps -------------------------------------
    for (const signal of input.contradictions) {
      const detail = `[${signal.code}] ${signal.detail}`;
      switch (signal.code) {
        case 'CONTROL_TEST_FAILED':
          push('FAILED_CONTROL_TEST', 'VERIFIED_CONTROL_TEST_FAILURE', detail, 'CONTROL_OWNER', {
            linkedControlCode: signal.controlCode || linkedControlCode,
            remediationCreated: false,
            remediationSuppressedReason: input.allowRemediationCreation
              ? 'Verified control test failure — remediation record is created.'
              : 'Remediation creation was not authorised for this run; the signal is recorded for the remediation workflow.'
          });
          break;
        case 'CONTROL_NOT_IMPLEMENTED':
        case 'CONTROL_RATED_DEFICIENT':
          push('CONTROL_NOT_IMPLEMENTED', 'CONFIRMED_CONTROL_DEFICIENCY', detail, 'CONTROL_OWNER', {
            linkedControlCode: signal.controlCode || linkedControlCode,
            remediationSuppressedReason: input.allowRemediationCreation
              ? 'Canonical control register records this control as not implemented — remediation record is created.'
              : 'Remediation creation was not authorised for this run.'
          });
          break;
        case 'POLICY_VS_PARTIAL_IMPLEMENTATION_CONFLICT':
          push('CONTROL_PARTIALLY_IMPLEMENTED', 'QUESTIONNAIRE_ANSWER_GAP', detail, 'CONTROL_OWNER', {
            linkedControlCode: signal.controlCode || linkedControlCode
          });
          break;
        case 'OPEN_HIGH_SEVERITY_FINDING':
          push('CONTRADICTORY_RECORDS', 'QUESTIONNAIRE_ANSWER_GAP', detail, 'COMPLIANCE_MANAGER', {
            linkedControlCode: signal.controlCode || linkedControlCode,
            linkedFindingId: input.links?.findingId || signal.sourceIds[0]
          });
          break;
        case 'EVIDENCE_ASSERTION_REFUTED':
        case 'APPROVED_FACT_NEGATES_CLAIM':
        default:
          push('CONTRADICTORY_RECORDS', 'QUESTIONNAIRE_ANSWER_GAP', detail, 'COMPLIANCE_MANAGER', {
            linkedControlCode: signal.controlCode || linkedControlCode
          });
          break;
      }
    }

    // ---- 3. Authorised remediation creation --------------------------------
    if (input.allowRemediationCreation) {
      for (const gap of gaps) {
        if (
          (gap.classification === 'CONFIRMED_CONTROL_DEFICIENCY' ||
            gap.classification === 'VERIFIED_CONTROL_TEST_FAILURE') &&
          gap.linkedControlCode
        ) {
          gap.remediationCreated = true;
          gap.classification = 'REMEDIATION_ACTION';
          gap.remediationSuppressedReason = undefined;
          gap.linkedCapaId = gap.linkedCapaId || `CAPA-${gap.id}`;
        }
      }
    }

    return gaps;
  }

  /**
   * Questionnaire-level gap for a mandatory question with no approved response.
   * This is an ANSWER gap only — never a control failure.
   */
  public detectMandatoryUnanswered(params: {
    tenantId: string;
    questionnaireId: string;
    question: ExtractedQuestion;
    hasApprovedAnswer: boolean;
    asOf: string;
    requiredFromRole: string;
  }): QuestionnaireGap | null {
    if (!params.question.mandatory || params.hasApprovedAnswer) return null;
    const detail = `Mandatory question "${params.question.originalText.slice(0, 120)}" has no approved response at export time.`;
    return {
      id: stableGapId(params.question.id, 'MANDATORY_UNANSWERED', detail),
      tenantId: params.tenantId,
      questionnaireId: params.questionnaireId,
      questionId: params.question.id,
      gapType: 'MANDATORY_UNANSWERED',
      classification: 'QUESTIONNAIRE_ANSWER_GAP',
      severity: 'CRITICAL',
      title: 'Mandatory question unanswered',
      detail,
      requiredFromRole: params.requiredFromRole,
      remediationCreated: false,
      detectedAt: params.asOf,
      status: 'OPEN'
    };
  }
}

export const gapDetectionService = GapDetectionService.getInstance();
