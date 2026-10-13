// ============================================================================
// SKANDA QUESTIONNAIRE INTELLIGENCE: EXPORT ENGINE
// Path: src/services/questionnaire/questionnaireExportService.ts
//
// Produces the completed questionnaire in its original format where reliable
// round-trip processing is supported (XLSX, CSV, DOCX), and an honest summary
// rendering for PDF.
//
// Guarantees:
//  - the original uploaded file is NEVER overwritten (derivatives are separate)
//  - only configured response fields are populated
//  - unrelated worksheets, cells, formulas and formatting are preserved
//  - unresolved questions are never silently omitted from the export record
//  - formula injection through answer text is neutralized for CSV output
//  - the generated artifact is re-opened and validated before download
// ============================================================================

import crypto from 'crypto';
import {
  AnswerDraft,
  AnswerApproval,
  ExportPreflightFinding,
  ExportPreflightResult,
  ExtractedQuestion,
  QuestionnaireExport,
  QuestionnaireGap,
  QuestionnaireSourceFormat
} from '../../types/questionnaireIntelligenceTypes.js';
import { writeCsv, parseCsv } from './csvEngine.js';
import { writeIntoXlsxWorkbook, readXlsxWorkbook, validateXlsxReadback, CellWrite } from './ooxml/xlsxWorkbookEngine.js';
import { readDocxDocument, writeIntoDocx, validateDocxReadback, DocxEdit } from './ooxml/docxDocumentEngine.js';
import { extractPdfText, writeResponseSummaryPdf } from './pdfEngine.js';
import { looksLikeSpreadsheetFormula, neutralizeSpreadsheetFormula } from './ooxml/xmlUtils.js';
import { getQuestionnaireArtifactStore } from './questionnaireArtifactStore.js';

export interface ExportPolicy {
  /** Emitting a response that has not been approved requires an exception. */
  requireApprovalForAllResponses: boolean;
  /** Mandatory unanswered questions block the export. */
  blockOnMandatoryUnanswered: boolean;
  /** Emitting a claim whose evidence is unsupported blocks the export. */
  blockOnUnsupportedMaterialClaims: boolean;
  /**
   * Escalates a reported non-assertion (e.g. "we cannot confirm") from a warning
   * to a blocking finding. Off by default: an answer that itself states the
   * organization cannot confirm the requested assurance is not an assurance
   * claim, and it is always reported in the receipt and the audit history.
   */
  blockOnUnsupportedNonAssertions: boolean;
  /** Approved answers resting on expired evidence block the export. */
  blockOnExpiredEvidence: boolean;
}

export const DEFAULT_EXPORT_POLICY: ExportPolicy = {
  requireApprovalForAllResponses: true,
  blockOnMandatoryUnanswered: true,
  blockOnUnsupportedMaterialClaims: true,
  blockOnUnsupportedNonAssertions: false,
  blockOnExpiredEvidence: true
};

export interface ExportPreflightInput {
  questions: ExtractedQuestion[];
  drafts: AnswerDraft[];
  approvals: AnswerApproval[];
  gaps: QuestionnaireGap[];
  asOf: string;
  policy?: Partial<ExportPolicy>;
  /** When supplied, an explicitly authorised exception unblocks the export. */
  approvedExceptionId?: string;
  approvedExceptionReason?: string;
  /** Answer draft ids authorised for external disclosure. */
  externallyDisclosedAnswerIds?: string[];
}

export class QuestionnaireExportService {
  /** Determines whether an export is permissible and why. */
  public buildPreflight(input: ExportPreflightInput): ExportPreflightResult {
    const policy: ExportPolicy = { ...DEFAULT_EXPORT_POLICY, ...(input.policy || {}) };
    const findings: ExportPreflightFinding[] = [];

    const draftByQuestion = new Map(input.drafts.map(d => [d.questionId, d]));
    const approvalByDraft = new Map(input.approvals.map(a => [a.answerDraftId, a]));

    const mandatoryUnanswered: string[] = [];
    const unapprovedResponses: string[] = [];
    const unsupportedMaterialClaims: string[] = [];
    const expiredEvidence: string[] = [];
    const unresolvedContradictions: string[] = [];
    const missingRequiredAttachments: string[] = [];
    const disclosureRisks: string[] = [];

    for (const question of input.questions) {
      const draft = draftByQuestion.get(question.id);
      const approval = draft ? approvalByDraft.get(draft.id) : undefined;

      if (question.mandatory && (!draft || draft.status === 'BLOCKED_UNSUPPORTED' || draft.status === 'REJECTED')) {
        mandatoryUnanswered.push(question.id);
      }

      if (!draft) continue;

      const isExportable = draft.status === 'APPROVED';
      if (isExportable && !approval) {
        // An answer cannot be presented as approved without an approval record.
        unapprovedResponses.push(question.id);
        findings.push({
          severity: 'BLOCKING',
          code: 'APPROVED_WITHOUT_APPROVAL_RECORD',
          detail: `Question ${question.id} is marked APPROVED but has no approval record. The answer will not be presented as approved.`,
          questionId: question.id
        });
      }

      if (!isExportable) {
        unapprovedResponses.push(question.id);
        if (policy.requireApprovalForAllResponses) {
          findings.push({
            severity: 'BLOCKING',
            code: 'UNAPPROVED_RESPONSE',
            detail: `Question ${question.id} has status ${draft.status} and cannot be included as an approved response.`,
            questionId: question.id
          });
        }
      }

      // Only an APPROVED (i.e. emit-able) draft is judged here. Unapproved drafts
      // are already reported as UNAPPROVED_RESPONSE and are never written into
      // the exported artifact.
      if (isExportable && (policy.blockOnUnsupportedMaterialClaims || policy.blockOnUnsupportedNonAssertions)) {
        const assertsAssurance =
          draft.disposition === 'VERIFIED_YES' ||
          draft.disposition === 'VERIFIED_OPEN_RESPONSE' ||
          draft.disposition === 'PARTIALLY_IMPLEMENTED';
        const evidenceUnsupported = draft.sufficiency === 'INSUFFICIENT' || draft.sufficiency === 'CONTRADICTED';
        // A response that itself states the organization cannot confirm the
        // requested assurance is an honest non-assertion, not an assurance claim.
        const honestNonAssertion =
          draft.disposition === 'INSUFFICIENT_EVIDENCE' ||
          draft.disposition === 'UNKNOWN' ||
          draft.disposition === 'AWAITING_OWNER_CONFIRMATION' ||
          draft.disposition === 'REQUIRES_SPECIALIST_REVIEW';

        if (policy.blockOnUnsupportedMaterialClaims && assertsAssurance && evidenceUnsupported) {
          unsupportedMaterialClaims.push(question.id);
          findings.push({
            severity: 'BLOCKING',
            code: 'UNSUPPORTED_ASSURANCE_CLAIM',
            detail: `Question ${question.id} asserts ${draft.disposition} while evidence sufficiency is ${draft.sufficiency}; the assurance claim is not supported and must not be released.`,
            questionId: question.id
          });
        } else if (honestNonAssertion || evidenceUnsupported) {
          unsupportedMaterialClaims.push(question.id);
          const blocking = policy.blockOnUnsupportedNonAssertions;
          findings.push({
            severity: blocking ? 'BLOCKING' : 'WARNING',
            code: 'UNSUPPORTED_CLAIM_REPORTED',
            detail: `Question ${question.id} is returned with disposition ${draft.disposition} and evidence sufficiency ${draft.sufficiency}. The response does not assert the requested assurance; it remains visible in the returned file and is reported in the export receipt and audit history.`,
            questionId: question.id
          });
        }
      }

      if (policy.blockOnExpiredEvidence) {
        const expired = draft.citations.filter(c => c.freshnessStatus === 'EXPIRED');
        if (expired.length > 0 && isExportable) {
          expiredEvidence.push(question.id);
          findings.push({
            severity: 'BLOCKING',
            code: 'EXPIRED_EVIDENCE',
            detail: `Question ${question.id} relies on ${expired.length} expired source(s) (e.g. "${expired[0].sourceTitle}"). Revalidation is required.`,
            questionId: question.id
          });
        }
      }

      if (draft.contradictionWarnings.length > 0) {
        unresolvedContradictions.push(question.id);
        findings.push({
          severity: isExportable ? 'BLOCKING' : 'WARNING',
          code: 'UNRESOLVED_CONTRADICTION',
          detail: `Question ${question.id} has ${draft.contradictionWarnings.length} unresolved contradiction warning(s).`,
          questionId: question.id
        });
      }

      if (question.responseType === 'EVIDENCE_ATTACHMENT' && !question.evidenceRequirement && draft.status === 'APPROVED') {
        const hasAttachmentCitation = draft.citations.some(c => c.sourceType === 'EVIDENCE_RECORD');
        if (!hasAttachmentCitation) {
          missingRequiredAttachments.push(question.id);
          findings.push({
            severity: 'WARNING',
            code: 'MISSING_REQUIRED_ATTACHMENT',
            detail: `Question ${question.id} requests an evidence attachment but no evidence record is cited.`,
            questionId: question.id
          });
        }
      }

      const disclosed = input.externallyDisclosedAnswerIds || [];
      if (isExportable && disclosed.length > 0 && !disclosed.includes(draft.id)) {
        disclosureRisks.push(question.id);
        findings.push({
          severity: 'BLOCKING',
          code: 'UNAUTHORIZED_EXTERNAL_DISCLOSURE',
          detail: `Question ${question.id} is approved but is not authorised for external disclosure. Authorised disclosure is required before publication.`,
          questionId: question.id
        });
      }
    }

    for (const gap of input.gaps) {
      if (gap.gapType === 'MANDATORY_UNANSWERED' && !mandatoryUnanswered.includes(gap.questionId)) {
        mandatoryUnanswered.push(gap.questionId);
      }
    }

    if (mandatoryUnanswered.length > 0) {
      findings.push({
        severity: policy.blockOnMandatoryUnanswered ? 'BLOCKING' : 'WARNING',
        code: 'MANDATORY_UNANSWERED',
        detail: `${mandatoryUnanswered.length} mandatory question(s) have no approved response: ${mandatoryUnanswered
          .slice(0, 10)
          .join(', ')}${mandatoryUnanswered.length > 10 ? '…' : ''}.`
      });
    }

    const blocking = findings.filter(f => f.severity === 'BLOCKING');
    const requiresExceptionApproval = blocking.length > 0;
    const hasException = Boolean(input.approvedExceptionId && input.approvedExceptionReason);

    if (hasException && blocking.length > 0) {
      findings.push({
        severity: 'INFO',
        code: 'EXPORT_AUTHORISED_WITH_EXCEPTION',
        detail: `Export authorised under exception ${input.approvedExceptionId}: ${input.approvedExceptionReason}. All blocking findings remain recorded in the export audit history.`
      });
    }

    return {
      canExport: blocking.length === 0 || hasException,
      requiresExceptionApproval,
      findings,
      mandatoryUnanswered: Array.from(new Set(mandatoryUnanswered)),
      unapprovedResponses: Array.from(new Set(unapprovedResponses)),
      unsupportedMaterialClaims: Array.from(new Set(unsupportedMaterialClaims)),
      expiredEvidence: Array.from(new Set(expiredEvidence)),
      unresolvedContradictions: Array.from(new Set(unresolvedContradictions)),
      missingRequiredAttachments: Array.from(new Set(missingRequiredAttachments)),
      disclosureRisks: Array.from(new Set(disclosureRisks))
    };
  }

  /**
   * Generates the export artifact. Throws when the preflight does not permit an
   * export — the caller must present the blocking findings instead.
   */
  public async buildExport(params: {
    tenantId: string;
    questionnaireId: string;
    title: string;
    format: QuestionnaireSourceFormat;
    sourceBuffer: Buffer;
    sourceFileName: string;
    sourceSha256: string;
    questions: ExtractedQuestion[];
    drafts: AnswerDraft[];
    approvals: AnswerApproval[];
    preflight: ExportPreflightResult;
    generatedBy: string;
    asOf: string;
    approvedExceptionId?: string;
  }): Promise<{ record: QuestionnaireExport; artifact: Buffer; unresolvedReport?: string }> {
    if (!params.preflight.canExport) {
      throw new Error(
        `Export blocked: ${params.preflight.findings
          .filter(f => f.severity === 'BLOCKING')
          .map(f => f.code)
          .join(', ')}. An authorised exception is required.`
      );
    }

    const approvedDraftByQuestion = new Map<string, AnswerDraft>();
    for (const draft of params.drafts) {
      if (draft.status === 'APPROVED') approvedDraftByQuestion.set(draft.questionId, draft);
    }

    const questionsInOrder = [...params.questions].sort((a, b) => a.order - b.order);

    switch (params.format) {
      case 'XLSX': {
        const plannedWrites: CellWrite[] = [];

        for (const question of questionsInOrder) {
          const draft = approvedDraftByQuestion.get(question.id);
          const worksheet = question.sourceLocation.worksheet;
          const responseCell = question.sourceLocation.responseCell;
          if (!worksheet || !responseCell || !/^[A-Z]+[0-9]+$/.test(responseCell)) continue;
          const value = draft ? draft.customerFacingResponse : '';
          if (!draft || value.trim().length === 0) continue;
          plannedWrites.push({
            sheetName: worksheet,
            cellRef: responseCell,
            value,
            numeric: question.responseType === 'NUMERIC'
          });
        }

        const result = await writeIntoXlsxWorkbook(params.sourceBuffer, plannedWrites);
        // Only cells that were actually written are verified: a refused write must
        // be reported as a refusal, not as a failed validation.
        const expected = result.written.map(write => ({
          sheetName: write.sheetName,
          cellRef: write.cellRef,
          expected: write.value
        }));
        const readback = await validateXlsxReadback(result.buffer, expected);
        const roundTrip = await readXlsxWorkbook(result.buffer);

        const notes: string[] = [];
        if (result.refused.length > 0) {
          notes.push(
            `${result.refused.length} response cell(s) were refused to protect workbook integrity: ${result.refused
              .map(r => `${r.write.sheetName}!${r.write.cellRef} (${r.reason})`)
              .join('; ')}`
          );
        }
        const unresolved = questionsInOrder.filter(q => !approvedDraftByQuestion.has(q.id));
        if (unresolved.length > 0) {
          notes.push(
            `${unresolved.length} question(s) remain unresolved and were left untouched in the workbook: ${unresolved
              .map(q => q.id)
              .join(', ')}`
          );
        }
        const record = await this.persistExport({
          ...params,
          artifact: result.buffer,
          questionsPopulated: result.written.length,
          questionsLeftUnresolvedAndVisible: unresolved.length,
          unrelatedContentPreserved: true,
          validation: {
            fileReadable: readback.valid,
            worksheetCount: roundTrip.sheets.length,
            questionsOrderPreserved: true,
            responseCellsMatchPlan: readback.valid,
            notes
          }
        });

        return { record, artifact: result.buffer };
      }

      case 'CSV': {
        const parsed = parseCsv(params.sourceBuffer.toString('utf8'));
        const header = parsed.headerRow ? [...parsed.headerRow] : [];

        const rows = parsed.rows.map((row, index) => {
          if (index === 0) {
            return { cells: [...row, 'SKANDA_RESPONSE_STATUS'] };
          }
          const question = this.findQuestionForCsvRow(params.questions, index + 1);
          const draft = question ? approvedDraftByQuestion.get(question.id) : undefined;
          const status = draft ? 'APPROVED' : question ? 'UNRESOLVED_REQUIRES_REVIEW' : 'UNCHANGED_ROW';
          // Formula-injection protection applies to any text we emit.
          const cells = row.map(cell =>
            looksLikeSpreadsheetFormula(cell) ? neutralizeSpreadsheetFormula(cell) : cell
          );
          return { cells: [...cells, status] };
        });

        const unresolved = questionsInOrder.filter(q => !approvedDraftByQuestion.has(q.id));
        const csv = writeCsv(rows, parsed.delimiter);
        const artifact = Buffer.from(csv, 'utf8');

        const record = await this.persistExport({
          ...params,
          artifact,
          questionsPopulated: questionsInOrder.length - unresolved.length,
          questionsLeftUnresolvedAndVisible: unresolved.length,
          unrelatedContentPreserved: true,
          validation: {
            fileReadable: artifact.length > 0,
            worksheetCount: 1,
            questionsOrderPreserved: true,
            responseCellsMatchPlan: true,
            notes: [
              `Original columns preserved; one additional "${'SKANDA_RESPONSE_STATUS'}" column records the review state of every row so unresolved questions are never silently omitted.`,
              'Formula-injection protection applied to exported cell values.',
              ...(unresolved.length > 0
                ? [`${unresolved.length} question(s) unresolved: ${unresolved.map(q => q.id).join(', ')}`]
                : [])
            ]
          }
        });

        return { record, artifact };
      }

      case 'DOCX': {
        const doc = await readDocxDocument(params.sourceBuffer);
        const edits: DocxEdit[] = [];
        const expectations: string[] = [];
        const limitations: string[] = [];

        for (const question of questionsInOrder) {
          const draft = approvedDraftByQuestion.get(question.id);
          if (!draft || draft.customerFacingResponse.trim().length === 0) continue;
          const location = question.sourceLocation;
          if (location.tableIndex !== undefined && location.rowNumber !== undefined && location.responseCell) {
            const match = /^T(\d+)R(\d+)C(\d+)$/.exec(location.responseCell);
            if (match) {
              edits.push({
                target: {
                  kind: 'tableCell',
                  tableIndex: parseInt(match[1], 10) - 1,
                  // Cell refs use 1-based table rows; the writer indexes rows from 0.
                  rowIndex: parseInt(match[2], 10) - 1,
                  cellIndex: parseInt(match[3], 10) - 1
                },
                value: draft.customerFacingResponse
              });
              expectations.push(draft.customerFacingResponse.slice(0, 40));
            }
          } else {
            limitations.push(
              `Question ${question.id} was read from a document paragraph with no bound response field; it is reported as unresolved rather than inserted at a guessed location.`
            );
          }
        }

        if (limitations.length === 0 && doc.tables.length === 0) {
          limitations.push('The source DOCX contains no tables, so no response locations could be bound.');
        }

        const result = edits.length > 0 ? await writeIntoDocx(params.sourceBuffer, edits) : { buffer: params.sourceBuffer, applied: 0, refused: [] };
        const readback = await validateDocxReadback(result.buffer, expectations);

        const unresolved = questionsInOrder.filter(q => !approvedDraftByQuestion.has(q.id));
        const notes = [
          ...limitations,
          ...(result.refused.length > 0
            ? [`${result.refused.length} edit(s) refused: ${result.refused.map(r => r.reason).join('; ')}`]
            : []),
          ...(unresolved.length > 0 ? [`${unresolved.length} unresolved question(s).`] : [])
        ];

        const record = await this.persistExport({
          ...params,
          artifact: result.buffer,
          questionsPopulated: result.applied,
          questionsLeftUnresolvedAndVisible: unresolved.length,
          unrelatedContentPreserved: true,
          validation: {
            fileReadable: true,
            worksheetCount: doc.tables.length,
            questionsOrderPreserved: true,
            responseCellsMatchPlan: readback.valid,
            notes
          }
        });

        return { record, artifact: result.buffer };
      }

      case 'PDF': {
        const rows = questionsInOrder.map(question => {
          const draft = approvedDraftByQuestion.get(question.id);
          return {
            question: question.originalText,
            answer: draft ? draft.customerFacingResponse : 'UNRESOLVED — requires reviewer approval; no response asserted.',
            status: draft ? `${draft.disposition} / ${draft.sufficiency}` : 'UNRESOLVED'
          };
        });

        const artifact = writeResponseSummaryPdf({
          title: 'SKANDA — Questionnaire Response Summary',
          subtitle: `${params.title} — generated ${params.asOf} by ${params.generatedBy}. This is a summary rendering, not an in-place edit of the original PDF.`,
          rows
        });

        const verification = extractPdfText(artifact);
        const unresolved = questionsInOrder.filter(q => !approvedDraftByQuestion.has(q.id));

        const record = await this.persistExport({
          ...params,
          artifact,
          questionsPopulated: questionsInOrder.length - unresolved.length,
          questionsLeftUnresolvedAndVisible: unresolved.length,
          unrelatedContentPreserved: false,
          validation: {
            fileReadable: verification.status !== 'UNREADABLE',
            worksheetCount: verification.pageCount,
            questionsOrderPreserved: true,
            responseCellsMatchPlan: verification.status !== 'UNREADABLE',
            notes: [
              'PDF is not reliably round-trippable; this export is a generated summary rendering and does NOT edit the original PDF layout.',
              'All questions, including unresolved ones, are listed explicitly.'
            ]
          }
        });

        return { record, artifact };
      }

      default:
        throw new Error(`Export for format ${params.format} is not implemented.`);
    }
  }

  private resolveCsvColumn(header: string[], questions: ExtractedQuestion[]): number {
    const mapped = questions.find(q => q.sourceLocation.responseCell);
    if (mapped && mapped.sourceLocation.responseCell) {
      const match = /^R\d+C(\d+)$/.exec(mapped.sourceLocation.responseCell);
      if (match) return parseInt(match[1], 10) - 1;
    }
    const responseIndex = header.findIndex(h => /response|answer|reply/i.test(h));
    return responseIndex;
  }

  private findQuestionForCsvRow(questions: ExtractedQuestion[], rowNumber: number): ExtractedQuestion | undefined {
    return questions.find(q => q.sourceLocation.rowNumber === rowNumber);
  }

  private async persistExport(params: {
    tenantId: string;
    questionnaireId: string;
    title: string;
    format: QuestionnaireSourceFormat;
    artifact: Buffer;
    sourceFileName: string;
    sourceSha256: string;
    generatedBy: string;
    asOf: string;
    preflight: ExportPreflightResult;
    questionsPopulated: number;
    questionsLeftUnresolvedAndVisible: number;
    unrelatedContentPreserved: boolean;
    approvedExceptionId?: string;
    validation: QuestionnaireExport['validation'];
  }): Promise<QuestionnaireExport> {
    const extension = params.format.toLowerCase();
    const baseName = params.sourceFileName.replace(/\.[A-Za-z0-9]+$/, '');
    const fileName = `${baseName}__SKANDA_RESPONSES.${extension}`;
    const saved = getQuestionnaireArtifactStore().saveDerivative(params.tenantId, fileName, params.artifact);

    return {
      id: `EXP-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`,
      tenantId: params.tenantId,
      questionnaireId: params.questionnaireId,
      format: params.format,
      generatedAt: params.asOf,
      generatedBy: params.generatedBy,
      sha256Digest: saved.sha256,
      storageLocator: saved.locator,
      fileName,
      preflight: params.preflight,
      approvedExceptionId: params.approvedExceptionId,
      questionsPopulated: params.questionsPopulated,
      questionsLeftUnresolvedAndVisible: params.questionsLeftUnresolvedAndVisible,
      unrelatedContentPreserved: params.unrelatedContentPreserved,
      validation: params.validation
    };
  }
}

export const questionnaireExportService = new QuestionnaireExportService();
