// ============================================================================
// SKANDA QUESTIONNAIRE INTELLIGENCE: ANALYSIS PIPELINE
// Path: src/services/questionnaire/questionnaireIntelligencePipeline.ts
//
// Orchestrates, per question:
//   classification -> evidence retrieval -> claim validation -> draft generation
//   -> gap detection
//
// Reliability properties:
//  - bounded concurrency (no unbounded fan-out on 1,000-question questionnaires)
//  - per-question error isolation: one malformed question cannot corrupt the run
//  - deterministic evaluation clock (`asOf`) so results are reproducible
//  - failures are REPORTED, never silently converted into an answer
// ============================================================================

import {
  AnswerDraft,
  ExtractedQuestion,
  QuestionnaireGap,
  RequirementAnalysis,
  RetrievalQuery
} from '../../types/questionnaireIntelligenceTypes.js';
import { answerGenerationService } from './answerGenerationService.js';
import { claimValidationService, ContradictionSignal } from './claimValidationService.js';
import { LoadedKnowledge, evidenceRetrievalService } from './evidenceRetrievalService.js';
import { gapDetectionService } from './gapDetectionService.js';
import { questionClassifierService } from './questionClassifierService.js';
import { GovernedAnswerLibraryService } from './governedAnswerLibraryService.js';

export interface QuestionProcessingOutcome {
  questionId: string;
  analysis?: RequirementAnalysis;
  draft?: AnswerDraft;
  gaps: QuestionnaireGap[];
  contradictions: ContradictionSignal[];
  retrievedCount: number;
  error?: string;
  /** Set when an approved library answer was reused instead of generated. */
  reusedLibraryEntryId?: string;
  reuseDecision?: string;
}

export interface PipelineOptions {
  tenantId: string;
  questionnaireId: string;
  organizationalScope: string[];
  asOf: string;
  knowledge: LoadedKnowledge;
  questions: ExtractedQuestion[];
  concurrency?: number;
  allowRemediationCreation?: boolean;
  /** Tenant policy: promote a validly reused library answer without re-approval. */
  allowReuseWithoutReApproval?: boolean;
  libraryService?: GovernedAnswerLibraryService;
  /** Injectable clock/hook so long runs can be cancelled safely. */
  shouldCancel?: () => boolean;
  onProgress?: (processed: number, total: number, failed: number) => void;
}

export interface PipelineResult {
  outcomes: QuestionProcessingOutcome[];
  processed: number;
  failed: number;
  cancelled: boolean;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const workers: Promise<void>[] = [];
  const effectiveLimit = Math.max(1, Math.min(limit, items.length));

  for (let w = 0; w < effectiveLimit; w++) {
    workers.push(
      (async () => {
        while (true) {
          const index = cursor++;
          if (index >= items.length) return;
          results[index] = await worker(items[index], index);
        }
      })()
    );
  }
  await Promise.all(workers);
  return results;
}

export class QuestionnaireIntelligencePipeline {
  /**
   * Processes a batch of questions. Never throws for a single bad question:
   * the failure is captured in that question's outcome.
   */
  public async process(options: PipelineOptions): Promise<PipelineResult> {
    const concurrency = options.concurrency ?? 8;
    const outcomes: QuestionProcessingOutcome[] = [];
    let processed = 0;
    let failed = 0;
    let cancelled = false;

    const results = await mapWithConcurrency(options.questions, concurrency, async question => {
      if (options.shouldCancel && options.shouldCancel()) {
        cancelled = true;
        return {
          questionId: question.id,
          gaps: [],
          contradictions: [],
          retrievedCount: 0,
          error: 'Cancelled before processing.'
        } as QuestionProcessingOutcome;
      }

      try {
        const outcome = await this.processOne({ ...options, question });
        processed++;
        if (outcome.error) failed++;
        options.onProgress?.(processed, options.questions.length, failed);
        return outcome;
      } catch (err: any) {
        failed++;
        processed++;
        options.onProgress?.(processed, options.questions.length, failed);
        // Error isolation: the failure is reported, and NO answer is produced.
        return {
          questionId: question.id,
          gaps: [],
          contradictions: [],
          retrievedCount: 0,
          error: `Processing failed: ${err && err.message ? err.message : 'unknown error'}`
        } as QuestionProcessingOutcome;
      }
    });

    outcomes.push(...results);
    return { outcomes, processed, failed, cancelled };
  }

  public async processOne(
    params: PipelineOptions & { question: ExtractedQuestion }
  ): Promise<QuestionProcessingOutcome> {
    const { question, knowledge } = params;

    const analysis = questionClassifierService.classify({
      tenantId: params.tenantId,
      questionnaireId: params.questionnaireId,
      question
    });

    const requiredReviewerRole = questionClassifierService.requiredReviewerRole(analysis);

    const query: RetrievalQuery = {
      tenantId: params.tenantId,
      questionId: question.id,
      normalizedRequirement: analysis.normalizedInterpretation,
      categories: [analysis.primaryCategory, ...analysis.secondaryCategories],
      controlCodes: analysis.relevantControlCodes,
      frameworkCodes: analysis.frameworkMappings.map(m => m.frameworkCode),
      requiredEvidenceKinds: analysis.requiredEvidenceKinds,
      organizationalScope: params.organizationalScope,
      asOf: params.asOf
    };

    const retrieval = evidenceRetrievalService.retrieve({ query, knowledge });

    const contradictions = claimValidationService.detectContradictions({
      knowledge,
      controlCodes: analysis.relevantControlCodes,
      citations: retrieval.citations,
      asOf: params.asOf
    });

    const validation = claimValidationService.validateClaims({
      claims: analysis.claims,
      citations: retrieval.citations,
      contradictions,
      requiredEvidenceKinds: analysis.requiredEvidenceKinds,
      queryScope: params.organizationalScope,
      asOf: params.asOf,
      relevantControlCodes: analysis.relevantControlCodes
    });

    // ---- Governed answer-library reuse ------------------------------------
    let reusedLibraryEntryId: string | undefined;
    let reuseDecision: string | undefined;
    let draft: AnswerDraft | undefined;

    if (params.libraryService) {
      const reuse = await params.libraryService.evaluateReuse({
        tenantId: params.tenantId,
        analysis,
        knowledge,
        organizationalScope: params.organizationalScope,
        asOf: params.asOf
      });
      reuseDecision = reuse.decision;
      if (reuse.decision === 'REUSE_AUTHORIZED' && reuse.entry) {
        reusedLibraryEntryId = reuse.entry.id;
        draft = params.libraryService.buildDraftFromLibraryEntry({
          entry: reuse.entry,
          question,
          analysis,
          retrieval,
          validation,
          requiredReviewerRole,
          organizationalScope: params.organizationalScope,
          asOf: params.asOf,
          allowReuseWithoutReApproval: params.allowReuseWithoutReApproval
        });
      }
    }

    if (!draft) {
      draft = answerGenerationService.generateDraft({
        tenantId: params.tenantId,
        questionnaireId: params.questionnaireId,
        question,
        analysis,
        validation,
        retrieval,
        contradictions,
        requiredReviewerRole,
        organizationalScope: params.organizationalScope,
        asOf: params.asOf,
        retrievalPartialFailure: retrieval.partialFailure
      });
      // Preserve the reuse decision trail on the generated draft.
      if (reuseDecision && reuseDecision !== 'REUSE_AUTHORIZED') {
        draft.internalExplanation += `\nAnswer-library reuse evaluation: ${reuseDecision}.`;
      }
    }

    const gaps = gapDetectionService.detectGaps({
      tenantId: params.tenantId,
      questionnaireId: params.questionnaireId,
      question,
      analysis,
      draft,
      contradictions,
      allowRemediationCreation: Boolean(params.allowRemediationCreation),
      asOf: params.asOf
    });

    return {
      questionId: question.id,
      analysis,
      draft,
      gaps,
      contradictions,
      retrievedCount: retrieval.citations.length,
      reusedLibraryEntryId,
      reuseDecision
    };
  }
}

export const questionnaireIntelligencePipeline = new QuestionnaireIntelligencePipeline();
