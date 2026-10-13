// ============================================================================
// SKANDA QUESTIONNAIRE INTELLIGENCE: IMPORT / EXTRACTION SERVICE
// Path: src/services/questionnaire/questionnaireImportService.ts
//
// Converts an uploaded XLSX / CSV / DOCX / PDF questionnaire into a normalized
// question list plus a reviewable column-mapping proposal.
//
// Guarantees:
//  - unsupported or unreadable content is reported, never silently dropped
//  - question order, identifiers, worksheet names and section structure retained
//  - ambiguous response fields are flagged for human confirmation
//  - extraction confidence is an explicit heuristic ESTIMATE, never claimed 100%
// ============================================================================

import {
  ColumnMapping,
  ExtractionConfidenceBand,
  ExtractedQuestion,
  QuestionResponseType,
  QuestionnaireSourceFormat,
  RawIngestedQuestion,
  RawIngestionResult
} from '../../types/questionnaireIntelligenceTypes.js';
import { parseCsv } from './csvEngine.js';
import { readDocxDocument } from './ooxml/docxDocumentEngine.js';
import { extractPdfText } from './pdfEngine.js';
import {
  XlsxSheet,
  XlsxCellValue,
  getCellByIndex,
  readXlsxWorkbook,
  sheetAsGrid
} from './ooxml/xlsxWorkbookEngine.js';
import { detectUntrustedInstructionPatterns, normalizeText } from './ooxml/xmlUtils.js';

export const SUPPORTED_FORMATS: QuestionnaireSourceFormat[] = ['XLSX', 'CSV', 'DOCX', 'PDF'];

const QUESTION_WORD_PATTERN =
  /\b(do you|does your|does the|did you|have you|has your|can you|will you|are you|is your|are there|is there|how do|how does|how are|how is|how often|how many|what is|what are|what controls|when was|when did|where is|which of|who is|describe|explain|list|provide|state whether|outline|summari[sz]e|confirm whether|indicate whether)\b/i;

const SECTION_HEADER_PATTERN = /^(section|domain|category|area|chapter|control\s*group|control\s*area|topic|theme|standard|part)\b/i;
const INSTRUCTION_PATTERN = /\b(instruction|guidance|note|hint|please\s+provide)\b/i;
const RESPONSE_HEADER_PATTERN =
  /(response|answer|reply|comment|compliance|status|yes\s*[\/|&]\s*no|how\s+do\s+you|your\s+response|vendor\s+response|company\s+response)/i;
const QUESTION_HEADER_PATTERN =
  /^(question|questions|requirement|requirements|control|controls|item|statement|topic|sr\.?\s*no|ref|reference|question\s*id|id|#)\b/i;
const MANDATORY_PATTERN = /\b(mandatory|required|obligatory|must\s+answer)\b/i;
const EVIDENCE_HEADER_PATTERN = /\b(evidence|artifact|proof|documentation|supporting)\b/i;
const ID_HEADER_PATTERN = /^(id|question\s*id|q\s*id|ref|ref(erence)?\s*(no|#)?|sr\.?\s*no|no\.?|#|item\s*(no|#))\b/i;
const TAG_PATTERN = /\[([A-Za-z0-9_.-]{1,40})\]/;

export interface ImportValidationResult {
  valid: boolean;
  format: QuestionnaireSourceFormat | null;
  errors: string[];
  warnings: string[];
}

export interface ImportRequest {
  tenantId: string;
  fileName: string;
  mimeType?: string;
  buffer: Buffer;
}

function ascii(buffer: Buffer, start: number, length: number): string {
  return buffer.subarray(start, start + length).toString('latin1');
}

/**
 * Validates an upload before any parsing happens: size ceiling, extension,
 * declared MIME type and magic-number sniffing.
 */
export function validateUpload(params: {
  fileName: string;
  mimeType?: string;
  buffer: Buffer;
  maxBytes: number;
}): ImportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!params.buffer || params.buffer.length === 0) {
    errors.push('Uploaded file is empty.');
    return { valid: false, format: null, errors, warnings };
  }
  if (params.buffer.length > params.maxBytes) {
    errors.push(
      `File size ${params.buffer.length} bytes exceeds the ${params.maxBytes} byte ceiling; the import was rejected.`
    );
    return { valid: false, format: null, errors, warnings };
  }

  const extensionMatch = /\.([A-Za-z0-9]+)$/.exec(params.fileName || '');
  const extension = extensionMatch ? extensionMatch[1].toLowerCase() : '';

  const header4 = ascii(params.buffer, 0, 4);
  const isZip = ascii(params.buffer, 0, 2) === 'PK';
  const isPdf = ascii(params.buffer, 0, 5) === '%PDF-';

  // Legacy binary formats are rejected first so a mislabelled upload cannot slip
  // through on a content signature alone.
  if (['xls', 'doc', 'xlsb', 'ppt'].includes(extension)) {
    errors.push(
      `Legacy binary format .${extension} is not supported. Re-save the questionnaire as .xlsx, .docx, .csv or .pdf.`
    );
    return { valid: false, format: null, errors, warnings };
  }

  const OOXML_EXTENSIONS = ['xlsx', 'xlsm', 'docx'];
  const SIGNATURE_BACKED_EXTENSIONS = [...OOXML_EXTENSIONS, 'pdf'];

  let format: QuestionnaireSourceFormat | null = null;

  if (isZip) {
    // Distinguish XLSX from DOCX by inspecting the OOXML content types.
    const probe = params.buffer.subarray(0, Math.min(params.buffer.length, 4096)).toString('latin1');
    if (probe.includes('word/') || probe.includes('wordprocessingml')) format = 'DOCX';
    else if (probe.includes('xl/') || probe.includes('spreadsheetml')) format = 'XLSX';
    else {
      // A ZIP container that is not a recognised OOXML document.
      errors.push(
        'The uploaded file is a ZIP container but does not contain an OOXML workbook or document. It was rejected rather than parsed as a spreadsheet.'
      );
      return { valid: false, format: null, errors, warnings };
    }
  } else if (isPdf) {
    format = 'PDF';
  } else if (['csv', 'txt', 'tsv'].includes(extension)) {
    format = 'CSV';
  } else if (SIGNATURE_BACKED_EXTENSIONS.includes(extension)) {
    // The extension promises a signature-backed container but the bytes do not
    // match. Treat this as a malformed or disguised upload and refuse it.
    errors.push(
      `File extension ".${extension}" claims a ${extension === 'pdf' ? 'PDF' : 'OOXML'} container, but the content does not carry the expected ${
        extension === 'pdf' ? '%PDF-' : 'ZIP (PK)'
      } signature. The upload was rejected as malformed.`
    );
    return { valid: false, format: null, errors, warnings };
  }

  if (!format) {
    errors.push(
      `Unable to determine a supported file type from extension ".${extension}" or content signature ${header4.slice(0, 2)}.`
    );
    return { valid: false, format: null, errors, warnings };
  }

  if (params.mimeType) {
    const expectedMime = OOXML_EXTENSIONS.includes(extension) || format === 'XLSX' || format === 'DOCX';
    if (expectedMime && /pdf|image/.test(params.mimeType)) {
      warnings.push(
        `Declared MIME type "${params.mimeType}" disagrees with the detected ${format} signature; the content signature was trusted.`
      );
    }
  }

  return { valid: true, format, errors, warnings };
}

// ---------------------------------------------------------------------------
// TEXT HEURISTICS
// ---------------------------------------------------------------------------

function looksLikeQuestion(text: string): boolean {
  const value = normalizeText(text);
  if (value.length < 10) return false;
  const wordCount = value.split(' ').length;
  if (wordCount < 3) return false;
  if (value.endsWith('?')) return true;
  if (QUESTION_WORD_PATTERN.test(value)) return true;
  if (/\b(shall|must)\b/i.test(value) && wordCount >= 5) return true;
  return false;
}

function looksLikeResponseValue(text: string): boolean {
  const value = normalizeText(text);
  if (value.length === 0) return false;
  if (value.length > 400) return false;
  return true;
}

function parseAnswerOptionsFromInstruction(text: string): string[] {
  const options: string[] = [];
  const source = normalizeText(text);
  const yesNo = /\byes\s*[\/|&,]\s*no\b/i.test(source);
  if (yesNo) {
    options.push('Yes', 'No');
    if (/\b(n\s*\/\s*a|not\s+applicable)\b/i.test(source)) options.push('N/A');
    if (/\bpartial/i.test(source)) options.push('Partial');
  }
  const bracketList = /\(([^()]{4,120})\)/.exec(source);
  if (bracketList && /,\s*/.test(bracketList[1]) && options.length === 0) {
    const parts = bracketList[1].split(',').map(p => normalizeText(p)).filter(Boolean);
    if (parts.length >= 2 && parts.length <= 8 && parts.every(p => p.length <= 40)) {
      options.push(...parts);
    }
  }
  return options;
}

function classifyResponseType(params: {
  headerLabel: string;
  instructions: string;
  answerOptions: string[];
  existingResponses: string[];
}): QuestionResponseType {
  if (params.answerOptions.length >= 2) {
    if (params.answerOptions.includes('Yes') && params.answerOptions.includes('No')) {
      return params.answerOptions.includes('Partial') ? 'YES_NO_PARTIAL' : 'YES_NO';
    }
    return 'MULTIPLE_CHOICE';
  }
  const distinct = Array.from(new Set(params.existingResponses.map(r => normalizeText(r)).filter(Boolean)));
  if (distinct.length >= 2 && distinct.length <= 8 && distinct.every(d => d.length <= 60)) {
    return 'MULTIPLE_CHOICE';
  }
  const haystack = `${params.headerLabel} ${params.instructions}`.toLowerCase();
  if (/\b(attach|upload|evidence|artifact)\b/.test(haystack)) return 'EVIDENCE_ATTACHMENT';
  if (/\b(how many|number of|count of|percentage|%)\b/.test(haystack)) return 'NUMERIC';
  if (/\b(date|when was|effective date|expiry)\b/.test(haystack)) return 'DATE';
  if (/\b(n\s*\/\s*a|not applicable)\b/.test(haystack)) return 'NOT_APPLICABLE_WITH_JUSTIFICATION';
  return 'TEXT';
}

function confidenceBandFor(score: number): ExtractionConfidenceBand {
  if (score >= 80) return 'HIGH';
  if (score >= 55) return 'MEDIUM';
  if (score >= 30) return 'LOW';
  return 'UNREADABLE';
}

function detectMandatoryFromText(text: string, columnValue?: string): boolean {
  if (columnValue && /^(y|yes|true|1|mandatory|required)$/i.test(normalizeText(columnValue))) return true;
  const value = normalizeText(text);
  if (MANDATORY_PATTERN.test(value)) return true;
  if (/\*\s*$/.test(value) && value.length > 3) return true;
  return false;
}

function extractIdentifier(text: string): { identifier: string | null; remainder: string } {
  const value = normalizeText(text);
  const leading = /^((?:[A-Z]{1,6}[-_.]?\d{1,4}(?:\.\d{1,3})?)|(?:\d{1,4}(?:\.\d{1,3})?)|(?:Q\d{1,4})|(?:#\d{1,4}))[.):\-\s]+/.exec(value);
  if (leading) {
    return { identifier: leading[1], remainder: normalizeText(value.slice(leading[0].length)) };
  }
  const tag = TAG_PATTERN.exec(value);
  if (tag) return { identifier: tag[1], remainder: value };
  return { identifier: null, remainder: value };
}

// ---------------------------------------------------------------------------
// XLSX EXTRACTION
// ---------------------------------------------------------------------------

type HeaderRole =
  | 'QUESTION'
  | 'RESPONSE'
  | 'SECTION'
  | 'MANDATORY'
  | 'INSTRUCTION'
  | 'EVIDENCE'
  | 'ID'
  | 'IGNORE';

interface HeaderCandidate {
  rowIndex: number;
  roles: HeaderRole[];
  score: number;
}

function classifyHeaderCell(label: string): HeaderRole {
  const value = normalizeText(label);
  if (value.length === 0) return 'IGNORE';
  if (MANDATORY_PATTERN.test(value)) return 'MANDATORY';
  // Identifier columns are checked BEFORE the generic question pattern so that
  // a header such as "Question ID" is not mistaken for the question column.
  if (ID_HEADER_PATTERN.test(value)) return 'ID';
  if (RESPONSE_HEADER_PATTERN.test(value)) return 'RESPONSE';
  if (EVIDENCE_HEADER_PATTERN.test(value)) return 'EVIDENCE';
  if (INSTRUCTION_PATTERN.test(value)) return 'INSTRUCTION';
  if (QUESTION_HEADER_PATTERN.test(value)) return 'QUESTION';
  if (SECTION_HEADER_PATTERN.test(value)) return 'SECTION';
  return 'IGNORE';
}

/** Infers which columns of a sheet hold questions and responses. */
function sniffColumnMappings(sheet: XlsxSheet, header: HeaderCandidate): ColumnMapping[] {
  const sampleRows = sheetAsGrid(sheet, Math.min(sheet.maxRow, header.rowIndex + 60), sheet.maxColumn);

  const roleByColumn = new Map<number, HeaderRole>();
  for (let c = 0; c < header.roles.length; c++) {
    if (header.roles[c] !== 'IGNORE') roleByColumn.set(c, header.roles[c]);
  }

  let questionColumn = findColumnByRole(roleByColumn, 'QUESTION');
  let responseColumn = findColumnByRole(roleByColumn, 'RESPONSE');
  const sectionColumn = findColumnByRole(roleByColumn, 'SECTION');
  const mandatoryColumn = findColumnByRole(roleByColumn, 'MANDATORY');
  const instructionColumn = findColumnByRole(roleByColumn, 'INSTRUCTION');
  const evidenceColumn = findColumnByRole(roleByColumn, 'EVIDENCE');
  const questionIdColumn = findColumnByRole(roleByColumn, 'ID');

  const questionScores = new Map<number, number>();
  const responseScores = new Map<number, number>();
  for (let c = 0; c <= sheet.maxColumn; c++) {
    let qScore = 0;
    let rScore = 0;
    let populated = 0;
    for (let r = header.rowIndex + 1; r < Math.min(sampleRows.length, header.rowIndex + 61); r++) {
      const cell = getCellByIndex(sheet, r, c);
      const text = cell ? cell.text : sampleRows[r] ? sampleRows[r][c] || '' : '';
      if (!text) continue;
      populated++;
      if (looksLikeQuestion(text)) qScore++;
      if (looksLikeResponseValue(text) && normalizeText(text).length <= 120) rScore += 0.5;
    }
    if (populated > 0) {
      questionScores.set(c, (qScore / populated) * 100);
      responseScores.set(c, (rScore / populated) * 100);
    }
  }

  if (questionColumn === undefined) {
    let best = -1;
    let bestScore = 0;
    for (const [col, score] of questionScores.entries()) {
      if (score > bestScore) {
        bestScore = score;
        best = col;
      }
    }
    if (best >= 0 && bestScore >= 25) questionColumn = best;
  }

  const rationale: string[] = [];
  if (questionColumn !== undefined && roleByColumn.get(questionColumn) === 'QUESTION') {
    rationale.push('Question column identified from the header row label.');
  } else if (questionColumn !== undefined) {
    rationale.push('Question column inferred from question-like cell content (no explicit header label).');
  }

  let inferredResponseColumn = false;
  if (responseColumn === undefined && questionColumn !== undefined) {
    // Fall back to inference ONLY when the header row has no explicit response
    // column: prefer the nearest populated column to the right of the question.
    let best = -1;
    let bestScore = 0;
    for (const [col, score] of responseScores.entries()) {
      if (col === questionColumn) continue;
      const roleForColumn = roleByColumn.get(col);
      if (roleForColumn && roleForColumn !== 'RESPONSE') continue;
      const distance = col - questionColumn;
      const adjacencyBonus = distance > 0 && distance <= 2 ? 15 : distance > 0 ? 5 : 0;
      const total = score + adjacencyBonus;
      if (total > bestScore) {
        bestScore = total;
        best = col;
      }
    }
    if (best >= 0 && bestScore >= 20) {
      responseColumn = best;
      inferredResponseColumn = true;
      rationale.push('Response column inferred as the nearest populated column beside the question column.');
    }
  } else if (responseColumn !== undefined) {
    rationale.push('Response column identified from the header row label.');
  }

  const mappings: ColumnMapping[] = [];
  if (questionColumn === undefined) {
    mappings.push({
      worksheet: sheet.name,
      questionColumn: '',
      responseColumn: null,
      headerRow: header.rowIndex + 1,
      confidence: 0,
      rationale: ['No question column could be identified on this worksheet.'],
      ambiguous: true,
      ambiguousReason:
        'No column contained question-like text. Reviewer must map the question column before processing.',
      humanConfirmed: false
    });
    return mappings;
  }

  const questionLetter = columnLetter(questionColumn);
  const responseLetter = responseColumn !== undefined ? columnLetter(responseColumn) : null;

  // A question is only flagged as ambiguous when the header row itself declares
  // more than one response column, or when the response column had to be guessed.
  const declaredResponseColumns: number[] = [];
  for (const [col, role] of roleByColumn.entries()) {
    if (role === 'RESPONSE') declaredResponseColumns.push(col);
  }
  const responseCandidates =
    responseColumn !== undefined ? [responseColumn, ...declaredResponseColumns.filter(c => c !== responseColumn)] : [];
  const ambiguousResponse = inferredResponseColumn || declaredResponseColumns.length > 1;

  let confidence = 40;
  if (roleByColumn.get(questionColumn) === 'QUESTION') confidence += 25;
  if (responseColumn !== undefined && roleByColumn.get(responseColumn) === 'RESPONSE') confidence += 20;
  else if (responseColumn !== undefined) confidence += 8;
  if (sectionColumn !== undefined) confidence += 5;
  if (ambiguousResponse) confidence -= 10;
  if (sheet.mergedRanges.length > 0) confidence -= 5;
  confidence = Math.max(0, Math.min(100, confidence));

  const reasons = [...rationale];
  if (responseColumn === undefined) {
    reasons.push(
      'No response column could be identified; responses cannot be written back for this worksheet until a reviewer maps one.'
    );
  }
  if (ambiguousResponse) {
    reasons.push(
      `${responseCandidates.length} plausible response columns were detected (${responseCandidates
        .map(columnLetter)
        .join(', ')}); the closest column was chosen and must be confirmed by a reviewer.`
    );
  }

  mappings.push({
    worksheet: sheet.name,
    questionColumn: questionLetter,
    responseColumn: responseLetter,
    questionIdColumn: questionIdColumn !== undefined ? columnLetter(questionIdColumn) : null,
    sectionColumn: sectionColumn !== undefined ? columnLetter(sectionColumn) : null,
    mandatoryColumn: mandatoryColumn !== undefined ? columnLetter(mandatoryColumn) : null,
    instructionColumn: instructionColumn !== undefined ? columnLetter(instructionColumn) : null,
    evidenceColumn: evidenceColumn !== undefined ? columnLetter(evidenceColumn) : null,
    commentColumn: null,
    headerRow: header.rowIndex + 1,
    confidence,
    rationale: reasons,
    ambiguous: responseColumn === undefined || ambiguousResponse,
    ambiguousReason: ambiguousResponse
      ? 'Multiple candidate response columns detected.'
      : responseColumn === undefined
        ? 'No response column detected.'
        : undefined,
    humanConfirmed: false
  });

  return mappings;
}

function columnLetter(index: number): string {
  let n = index;
  let letters = '';
  do {
    letters = String.fromCharCode(65 + (n % 26)) + letters;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return letters;
}

function findColumnByRole(roleByColumn: Map<number, HeaderRole>, role: HeaderRole): number | undefined {
  for (const [col, r] of roleByColumn.entries()) {
    if (r === role) return col;
  }
  return undefined;
}

function findHeaderCandidate(sheet: XlsxSheet): HeaderCandidate | null {
  let best: HeaderCandidate | null = null;
  const limit = Math.min(sheet.maxRow, 12);

  for (let r = 1; r <= limit; r++) {
    const row = sheet.rows.get(r);
    if (!row) continue;
    const roles: HeaderRole[] = [];
    let populated = 0;
    for (let c = 0; c <= sheet.maxColumn; c++) {
      const cell = row.get(c);
      const label = cell ? cell.text : '';
      if (normalizeText(label).length > 0) populated++;
      roles[c] = classifyHeaderCell(label);
    }
    if (populated < 2) continue;
    const roleSet = new Set(roles.filter(r2 => r2 && r2 !== 'IGNORE'));
    let score = roleSet.size;
    if (roleSet.has('QUESTION')) score += 3;
    if (roleSet.has('RESPONSE')) score += 3;
    if (roleSet.has('SECTION')) score += 1;
    // Header labels must be short — long text indicates a data row.
    const tooLong = Array.from(row.values()).some(cell => normalizeText(cell.text).length > 90);
    if (tooLong) score -= 3;

    if (score >= 4 && (!best || score > best.score)) {
      best = { rowIndex: r - 1, roles, score };
    }
  }
  return best;
}

function cellRef(columnIndex: number, rowNumber: number): string {
  return `${columnLetter(columnIndex)}${rowNumber}`;
}

async function extractFromXlsx(params: {
  tenantId: string;
  questionnaireId: string;
  buffer: Buffer;
}): Promise<RawIngestionResult> {
  const workbook = await readXlsxWorkbook(params.buffer);
  const questions: RawIngestedQuestion[] = [];
  const columnMappings: ColumnMapping[] = [];
  const ambiguousStructures: string[] = [];
  const worksheetsProcessed: string[] = [];
  const worksheetsPreserved: string[] = [];
  const unmappedResponseFields: number[] = [];
  const warnings: string[] = [];

  let detectedTitle: string | undefined;
  let detectedRequestingOrganization: string | undefined;
  let detectedQuestionnaireIdentifier: string | undefined;

  for (const sheet of workbook.sheets) {
    const header = findHeaderCandidate(sheet);
    const mappings = sniffColumnMappings(sheet, header || { rowIndex: 0, roles: [], score: 0 });
    columnMappings.push(...mappings);
    const mapping = mappings[0];

    let sheetHasQuestions = false;
    const sheetGrid = sheetAsGrid(sheet, Math.min(sheet.maxRow, 60), sheet.maxColumn);

    // Document-level metadata sniffing on the first worksheet.
    if (!detectedTitle) {
      for (const row of sheetGrid.slice(0, 6)) {
        for (const raw of row) {
          const value = normalizeText(raw);
          if (!value) continue;
          const labelled = /^(?:questionnaire\s*(?:title)?|title|document)\s*[:\-]\s*(.+)$/i.exec(value);
          if (labelled) {
            detectedTitle = normalizeText(labelled[1]);
            continue;
          }
          if (!detectedTitle && /security questionnaire|due diligence questionnaire|vendor questionnaire/i.test(value)) {
            detectedTitle = value;
          }
          const org = /^(?:company|customer|requesting\s+(?:organization|company|party)|vendor|client)\s*(?:name)?\s*[:\-]\s*(.+)$/i.exec(value);
          if (org) detectedRequestingOrganization = normalizeText(org[1]);
          const ident = /^(?:questionnaire\s*(?:id|reference|ref|number)|reference)\s*[:\-]\s*(.+)$/i.exec(value);
          if (ident) detectedQuestionnaireIdentifier = normalizeText(ident[1]);
        }
      }
    }

    if (!mapping || !mapping.questionColumn) {
      if (sheet.maxRow > 0) {
        worksheetsPreserved.push(sheet.name);
        ambiguousStructures.push(
          `Worksheet "${sheet.name}" contained no identifiable questions and was preserved untouched.`
        );
      }
      continue;
    }

    worksheetsProcessed.push(sheet.name);

    const questionCol = columnIndexFromLetter(mapping.questionColumn);
    const responseCol = mapping.responseColumn ? columnIndexFromLetter(mapping.responseColumn) : null;
    const sectionCol = mapping.sectionColumn ? columnIndexFromLetter(mapping.sectionColumn) : null;
    const mandatoryCol = mapping.mandatoryColumn ? columnIndexFromLetter(mapping.mandatoryColumn) : null;
    const instructionCol = mapping.instructionColumn ? columnIndexFromLetter(mapping.instructionColumn) : null;
    const evidenceCol = mapping.evidenceColumn ? columnIndexFromLetter(mapping.evidenceColumn) : null;
    const idCol = mapping.questionIdColumn ? columnIndexFromLetter(mapping.questionIdColumn) : null;

    if (responseCol === null) unmappedResponseFields.push(sheet.index);

    let currentSection = sheet.name;
    let sectionIndex = 0;
    let orderInSheet = 0;
    const lastMergedQuestionRange = new Map<number, string>();
    const existingResponses: string[] = [];

    for (let r = mapping.headerRow + 1; r <= sheet.maxRow; r++) {
      const row = sheet.rows.get(r);
      if (!row) continue;

      const questionCell: XlsxCellValue | undefined = row.get(questionCol);
      const questionText = normalizeText(questionCell ? questionCell.text : '');
      const responseCell = responseCol !== null ? row.get(responseCol) : undefined;
      const responseText = normalizeText(responseCell ? responseCell.text : '');
      const sectionText = sectionCol !== null ? normalizeText(row.get(sectionCol)?.text || '') : '';
      const warningsForQuestion: string[] = [];

      if (questionText.length === 0) {
        // A section row, or a continuation row of a vertically merged question.
        if (sectionText.length > 0 && !looksLikeQuestion(sectionText) && responseText.length === 0) {
          currentSection = sectionText;
          sectionIndex++;
          orderInSheet = 0;
          continue;
        }
        if (responseText.length > 0 && responseCol !== null) {
          const prevRange = lastMergedQuestionRange.get(questionCol);
          if (prevRange) {
            ambiguousStructures.push(
              `Row ${r} on "${sheet.name}" has a response but no adjacent question text; it appears to continue merged question range ${prevRange}. It was not turned into a separate question.`
            );
          } else {
            warnings.push(
              `Row ${r} on "${sheet.name}" contains a response value with no question text; it was not imported.`
            );
          }
        }
        continue;
      }

      // A row that does not read as a question is usually noise (heading,
      // instruction, note). Silently dropping a genuine question would lose it
      // from the returned file, so a substantial row that also carries response
      // or classification evidence is retained and flagged for human review
      // instead of being discarded.
      const readsAsQuestion = looksLikeQuestion(questionText);
      if (!readsAsQuestion) {
        const populatedCells = Array.from(row.values()).filter(c => normalizeText(c.text).length > 0).length;
        const substantial = questionText.length >= 25 && questionText.split(' ').length >= 4;
        const carriesRowEvidence = populatedCells >= 3 || responseText.length > 0;
        if (!(substantial && carriesRowEvidence)) {
          warnings.push(
            `Row ${r} on "${sheet.name}" was skipped: text in the question column did not read as a question ("${questionText.slice(0, 60)}").`
          );
          continue;
        }
        warnings.push(
          `Row ${r} on "${sheet.name}" did not match the question heuristic and was retained for human review rather than dropped ("${questionText.slice(
            0,
            60
          )}").`
        );
      }

      // A vertically merged question cell must not produce a duplicate question
      // when the spreadsheet repeats the text across the merged range.
      if (questionCell?.isMerged && questionCell.mergedRange) {
        const previousRange = lastMergedQuestionRange.get(questionCol);
        if (previousRange === questionCell.mergedRange) {
          if (responseText.length > 0) {
            ambiguousStructures.push(
              `Row ${r} on "${sheet.name}" repeats a vertically merged question (range ${questionCell.mergedRange}) with its own response value; it was treated as an additional response field for the same question rather than a new question.`
            );
          }
          continue;
        }
        lastMergedQuestionRange.set(questionCol, questionCell.mergedRange);
      } else {
        lastMergedQuestionRange.delete(questionCol);
      }

      // A populated section cell on a question row scopes the question.
      if (sectionCol !== null && sectionText.length > 0 && !looksLikeQuestion(sectionText) && sectionText !== currentSection) {
        currentSection = sectionText;
        sectionIndex++;
      }

      const instructions = instructionCol !== null ? normalizeText(row.get(instructionCol)?.text || '') : '';
      const mandatoryValue = mandatoryCol !== null ? row.get(mandatoryCol)?.text : undefined;
      const existingResponse = responseText;
      if (existingResponse) existingResponses.push(existingResponse);

      const { identifier, remainder } = extractIdentifier(questionText);
      const explicitId = idCol !== null ? normalizeText(row.get(idCol)?.text || '') : '';

      const options = parseAnswerOptionsFromInstruction(`${instructions} ${questionText}`);

      if (questionCell?.isMerged) {
        warningsForQuestion.push(
          `The question text sits inside merged range ${questionCell.mergedRange}; confirm the correct response field.`
        );
      }
      if (!readsAsQuestion) {
        warningsForQuestion.push(
          'The row did not match the question heuristic; confirm that this is a genuine questionnaire question before its response is released.'
        );
      }

      const untrusted = detectUntrustedInstructionPatterns(questionText);
      if (untrusted.length > 0) {
        warningsForQuestion.push(
          `Question text matched instruction-override patterns (${untrusted.join(
            ', '
          )}); the text is treated as untrusted data and never as an instruction.`
        );
      }

      questions.push({
        sectionName: currentSection,
        sectionOrder: sectionIndex,
        questionIdentifier: explicitId || identifier,
        originalText: questionText,
        order: questions.length + 1,
        answerOptions: options,
        mandatory: detectMandatoryFromText(questionText, mandatoryValue),
        instructions: instructions || undefined,
        existingResponse: existingResponse || undefined,
        evidenceRequirement: evidenceCol !== null ? normalizeText(row.get(evidenceCol)?.text || '') || undefined : undefined,
        sourceLocation: {
          worksheet: sheet.name,
          worksheetIndex: sheet.index,
          rowNumber: r,
          sectionLabel: currentSection,
          questionCell: cellRef(questionCol, r),
          responseCell: responseCol !== null ? cellRef(responseCol, r) : undefined,
          rawFragment: remainder !== questionText ? questionText : undefined
        },
        warnings: warningsForQuestion
      });
      orderInSheet++;
    }

    // Re-derive options from actual response values where the instruction gave none.
    for (const q of questions.filter(q => q.sourceLocation.worksheet === sheet.name)) {
      if (q.answerOptions.length === 0) {
        q.answerOptions = parseAnswerOptionsFromInstruction(q.instructions || '');
      }
    }

    // A worksheet can be scanned as a questionnaire candidate without yielding a
    // single question. Reporting it as processed would hide that nothing was
    // extracted, so it is reclassified as preserved-unmodified.
    const sheetQuestionCount = questions.filter(q => q.sourceLocation.worksheet === sheet.name).length;
    if (sheetQuestionCount === 0) {
      const processedIndex = worksheetsProcessed.indexOf(sheet.name);
      if (processedIndex >= 0) worksheetsProcessed.splice(processedIndex, 1);
      if (!worksheetsPreserved.includes(sheet.name)) worksheetsPreserved.push(sheet.name);
      ambiguousStructures.push(
        `Worksheet "${sheet.name}" was scanned but contained no extractable questions; it is preserved unmodified in the returned file.`
      );
    }
  }

  const unreadable = workbook.sheets.filter(s => !worksheetsProcessed.includes(s.name) && s.maxRow > 0);

  const summary: RawIngestionResult['summary'] = {
    format: 'XLSX',
    documentsDetected: 1,
    worksheetsProcessed,
    worksheetsPreservedUnmodified: [...worksheetsPreserved, ...unreadable.map(s => s.name).filter(n => !worksheetsPreserved.includes(n))],
    ambiguousStructures,
    unmappedResponseFields: unmappedResponseFields.length,
    unreadableRegions: [],
    warnings,
    columnMappings,
    detectedTitle,
    detectedRequestingOrganization,
    detectedQuestionnaireIdentifier,
    extractionConfidence: 0,
    confidenceBand: 'UNREADABLE'
  };

  summary.extractionConfidence = computeExtractionConfidence(summary, questions.length);
  summary.confidenceBand = confidenceBandFor(summary.extractionConfidence);

  return { questions, columnMappings, summary };
}

function columnIndexFromLetter(letter: string): number {
  const match = /^([A-Za-z]+)$/.exec(letter.trim());
  if (!match) return -1;
  let index = 0;
  const upper = match[1].toUpperCase();
  for (let i = 0; i < upper.length; i++) index = index * 26 + (upper.charCodeAt(i) - 64);
  return index - 1;
}

function computeExtractionConfidence(
  summary: RawIngestionResult['summary'],
  questionCount: number
): number {
  if (questionCount === 0) return 0;
  let score = 45;
  const mapped = summary.columnMappings.filter(m => m.questionColumn && m.responseColumn);
  if (mapped.length > 0) score += 25;
  else if (summary.columnMappings.some(m => m.questionColumn)) score += 10;
  if (summary.columnMappings.every(m => !m.ambiguous)) score += 15;
  if (summary.detectedTitle) score += 5;
  if (summary.ambiguousStructures.length > 0) score -= 10;
  if (summary.unmappedResponseFields > 0) score -= 15;
  if (summary.warnings.length > 3) score -= 5;
  return Math.max(0, Math.min(100, score));
}

// ---------------------------------------------------------------------------
// CSV EXTRACTION
// ---------------------------------------------------------------------------

function extractFromCsv(params: { buffer: Buffer }): RawIngestionResult {
  const content = params.buffer.toString('utf8');
  const table = parseCsv(content);
  const rows = table.rows;
  const warnings: string[] = [...table.encodingWarnings];
  const ambiguousStructures: string[] = [];
  const questions: RawIngestedQuestion[] = [];

  if (rows.length === 0) {
    const summary: RawIngestionResult['summary'] = {
      format: 'CSV',
      documentsDetected: 1,
      worksheetsProcessed: [],
      worksheetsPreservedUnmodified: [],
      ambiguousStructures: ['CSV file contained no data rows.'],
      unmappedResponseFields: 0,
      unreadableRegions: [],
      warnings,
      columnMappings: [],
      extractionConfidence: 0,
      confidenceBand: 'UNREADABLE'
    };
    return { questions, columnMappings: [], summary };
  }

  const headerRow = rows[0];
  const roles: HeaderRole[] = headerRow.map(classifyHeaderCell);
  let questionColumn = roles.indexOf('QUESTION');
  let responseColumn = roles.indexOf('RESPONSE');
  const sectionColumn = roles.indexOf('SECTION');
  const mandatoryColumn = roles.indexOf('MANDATORY');
  const instructionColumn = roles.indexOf('INSTRUCTION');
  const idColumn = roles.indexOf('ID');

  const dataRows = rows.slice(1);
  const columnCount = Math.max(...rows.map(r => r.length));

  if (questionColumn === -1) {
    let bestCol = -1;
    let bestScore = 0;
    for (let c = 0; c < columnCount; c++) {
      const values = dataRows.map(r => normalizeText(r[c] || ''));
      const populated = values.filter(Boolean).length;
      if (populated === 0) continue;
      const score = (values.filter(v => looksLikeQuestion(v)).length / populated) * 100;
      if (score > bestScore) {
        bestScore = score;
        bestCol = c;
      }
    }
    if (bestCol >= 0 && bestScore >= 25) {
      questionColumn = bestCol;
      warnings.push(
        'No question column header was found; the question column was inferred from question-like content and requires reviewer confirmation.'
      );
    }
  }

  if (questionColumn === -1) {
    const summary: RawIngestionResult['summary'] = {
      format: 'CSV',
      documentsDetected: 1,
      worksheetsProcessed: [],
      worksheetsPreservedUnmodified: [],
      ambiguousStructures: ['No column contained question-like text.'],
      unmappedResponseFields: 0,
      unreadableRegions: [],
      warnings,
      columnMappings: [],
      extractionConfidence: 0,
      confidenceBand: 'UNREADABLE'
    };
    return { questions, columnMappings: [], summary };
  }

  if (responseColumn === -1) {
    let bestCol = -1;
    let bestScore = 0;
    for (let c = 0; c < columnCount; c++) {
      if (c === questionColumn) continue;
      const values = dataRows.map(r => normalizeText(r[c] || ''));
      const populated = values.filter(Boolean).length;
      if (populated === 0) continue;
      const distance = c - questionColumn;
      const bonus = distance > 0 && distance <= 2 ? 15 : 0;
      const score = ((populated / dataRows.length) * 100 + bonus) as number;
      if (score > bestScore) {
        bestScore = score;
        bestCol = c;
      }
    }
    if (bestCol >= 0 && bestScore >= 20) responseColumn = bestCol;
  }

  const responseCandidates = roles
    .map((role, index) => ({ role, index }))
    .filter(r => r.role === 'RESPONSE');
  const ambiguousResponse = responseCandidates.length > 1;
  if (ambiguousResponse) {
    ambiguousStructures.push(
      `Multiple response columns detected (${responseCandidates
        .map(c => headerRow[c.index])
        .join(', ')}); the first was selected and must be confirmed.`
    );
  }

  const mapping: ColumnMapping = {
    worksheet: 'CSV',
    questionColumn: columnLetter(questionColumn),
    responseColumn: responseColumn >= 0 ? columnLetter(responseColumn) : null,
    questionIdColumn: idColumn >= 0 ? columnLetter(idColumn) : null,
    sectionColumn: sectionColumn >= 0 ? columnLetter(sectionColumn) : null,
    mandatoryColumn: mandatoryColumn >= 0 ? columnLetter(mandatoryColumn) : null,
    instructionColumn: instructionColumn >= 0 ? columnLetter(instructionColumn) : null,
    evidenceColumn: null,
    commentColumn: null,
    headerRow: 1,
    confidence: responseColumn >= 0 ? 80 : 45,
    rationale: [
      responseColumn >= 0
        ? 'Question and response columns identified from the CSV header row.'
        : 'Question column identified but no response column was found.',
      `Delimiter detected as "${table.delimiter === '\t' ? 'TAB' : table.delimiter}".`
    ],
    ambiguous: responseColumn < 0 || ambiguousResponse,
    ambiguousReason: responseColumn < 0 ? 'No response column detected.' : ambiguousResponse ? 'Multiple response columns detected.' : undefined,
    humanConfirmed: false
  };

  let currentSection = 'CSV Import';
  let sectionIndex = 0;

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rowNumber = i + 2;
    const questionText = normalizeText(row[questionColumn] || '');
    const sectionText = sectionColumn >= 0 ? normalizeText(row[sectionColumn] || '') : '';

    if (questionText.length === 0) {
      if (sectionText.length > 0 && !looksLikeQuestion(sectionText)) {
        currentSection = sectionText;
        sectionIndex++;
      }
      continue;
    }
    if (!looksLikeQuestion(questionText)) {
      warnings.push(
        `CSV row ${rowNumber} was skipped: the question column did not read as a question ("${questionText.slice(0, 60)}").`
      );
      continue;
    }

    const instructions = instructionColumn >= 0 ? normalizeText(row[instructionColumn] || '') : '';
    const { identifier } = extractIdentifier(questionText);
    const warningsForQuestion: string[] = [];
    const untrusted = detectUntrustedInstructionPatterns(questionText);
    if (untrusted.length > 0) {
      warningsForQuestion.push(
        `Question text matched instruction-override patterns (${untrusted.join(', ')}); treated as untrusted data.`
      );
    }
    if (row.length !== headerRow.length) {
      warningsForQuestion.push(
        `Row ${rowNumber} has ${row.length} columns but the header has ${headerRow.length}; fields were aligned positionally.`
      );
    }

    questions.push({
      sectionName: currentSection,
      sectionOrder: sectionIndex,
      questionIdentifier: idColumn >= 0 ? normalizeText(row[idColumn] || '') || identifier : identifier,
      originalText: questionText,
      order: questions.length + 1,
      answerOptions: parseAnswerOptionsFromInstruction(`${instructions} ${questionText}`),
      mandatory: detectMandatoryFromText(questionText, mandatoryColumn >= 0 ? row[mandatoryColumn] : undefined),
      instructions: instructions || undefined,
      existingResponse: responseColumn >= 0 ? normalizeText(row[responseColumn] || '') || undefined : undefined,
      sourceLocation: {
        worksheet: 'CSV',
        rowNumber,
        sectionLabel: currentSection,
        questionCell: `R${rowNumber}C${questionColumn + 1}`,
        responseCell: responseColumn >= 0 ? `R${rowNumber}C${responseColumn + 1}` : undefined
      },
      warnings: warningsForQuestion
    });
  }

  const summary: RawIngestionResult['summary'] = {
    format: 'CSV',
    documentsDetected: 1,
    worksheetsProcessed: ['CSV'],
    worksheetsPreservedUnmodified: [],
    ambiguousStructures,
    unmappedResponseFields: responseColumn < 0 ? 1 : 0,
    unreadableRegions: [],
    warnings,
    columnMappings: [mapping],
    extractionConfidence: 0,
    confidenceBand: 'UNREADABLE'
  };
  summary.extractionConfidence = computeExtractionConfidence(summary, questions.length);
  summary.confidenceBand = confidenceBandFor(summary.extractionConfidence);

  return { questions, columnMappings: [mapping], summary };
}

// ---------------------------------------------------------------------------
// DOCX EXTRACTION
// ---------------------------------------------------------------------------

async function extractFromDocx(params: { buffer: Buffer }): Promise<RawIngestionResult> {
  const doc = await readDocxDocument(params.buffer);
  const questions: RawIngestedQuestion[] = [];
  const warnings: string[] = [];
  const ambiguousStructures: string[] = [];
  const columnMappings: ColumnMapping[] = [];

  let currentSection = 'Document';
  let sectionIndex = 0;

  // Walk the document in body order so question order matches the source.
  for (const block of doc.bodyOrder) {
    if (block.kind === 'paragraph') {
      const paragraph = doc.paragraphs[block.paragraphIndex];
      const text = normalizeText(paragraph.text);
      if (!text) continue;

      if (paragraph.isHeading || (text.length > 0 && /^[A-Z0-9 .&/()-]{4,60}$/.test(text) && !looksLikeQuestion(text))) {
        currentSection = text;
        sectionIndex++;
        continue;
      }

      if (looksLikeQuestion(text)) {
        // A free paragraph question: the response field is normally the next
        // empty paragraph, which we cannot bind reliably without a reviewer.
        const { identifier } = extractIdentifier(text);
        const warningsForQuestion = [
          'Question was read from a document paragraph rather than a table cell; the response field must be confirmed by a reviewer.'
        ];
        const untrusted = detectUntrustedInstructionPatterns(text);
        if (untrusted.length > 0) {
          warningsForQuestion.push(
            `Question text matched instruction-override patterns (${untrusted.join(', ')}); treated as untrusted data.`
          );
        }
        questions.push({
          sectionName: currentSection,
          sectionOrder: sectionIndex,
          questionIdentifier: identifier,
          originalText: text,
          order: questions.length + 1,
          answerOptions: parseAnswerOptionsFromInstruction(text),
          mandatory: detectMandatoryFromText(text),
          sourceLocation: {
            sectionLabel: currentSection,
            paragraphIndex: paragraph.index,
            rawFragment: text
          },
          warnings: warningsForQuestion
        });
      }
      continue;
    }

    const table = doc.tables[block.tableIndex];
    if (!table || table.rows.length === 0) continue;

    const headerCells = table.rows[0].map(c => normalizeText(c.text));
    const roles = headerCells.map(classifyHeaderCell);
    const headerLooksLikeHeader = roles.some(r => r === 'QUESTION') || roles.some(r => r === 'RESPONSE');

    let questionColumn = roles.indexOf('QUESTION');
    let responseColumn = roles.indexOf('RESPONSE');
    const sectionColumn = roles.indexOf('SECTION');
    const idColumn = roles.indexOf('ID');

    const firstDataRow = headerLooksLikeHeader ? 1 : 0;

    if (!headerLooksLikeHeader) {
      // Headerless table: first column with question-like content wins.
      const sampleRows = table.rows.slice(0, 25);
      const columnCount = Math.max(...table.rows.map(r => r.length));
      let bestCol = -1;
      let bestScore = 0;
      for (let c = 0; c < columnCount; c++) {
        const values = sampleRows.map(r => normalizeText((r[c] || {}).text || '')).filter(Boolean);
        if (values.length === 0) continue;
        const score = (values.filter(looksLikeQuestion).length / values.length) * 100;
        if (score > bestScore) {
          bestScore = score;
          bestCol = c;
        }
      }
      if (bestCol >= 0) questionColumn = bestCol;
      if (questionColumn >= 0) {
        responseColumn = -1;
        warnings.push(
          `Table ${block.tableIndex + 1} has no header row; the question column was inferred and the response column must be confirmed by a reviewer.`
        );
      }
    } else {
      if (questionColumn === -1) {
        // Header present but question column not labelled: infer from content.
        const sampleRows = table.rows.slice(1, 26);
        const columnCount = Math.max(...table.rows.map(r => r.length));
        let bestCol = -1;
        let bestScore = 0;
        for (let c = 0; c < columnCount; c++) {
          const values = sampleRows.map(r => normalizeText((r[c] || {}).text || '')).filter(Boolean);
          if (values.length === 0) continue;
          const score = (values.filter(looksLikeQuestion).length / values.length) * 100;
          if (score > bestScore) {
            bestScore = score;
            bestCol = c;
          }
        }
        if (bestCol >= 0 && bestScore >= 25) questionColumn = bestCol;
      }
      if (responseColumn === -1 && questionColumn >= 0) {
        for (let c = questionColumn + 1; c < headerCells.length; c++) {
          if (roles[c] === 'IGNORE') {
            responseColumn = c;
            break;
          }
        }
      }
    }

    if (questionColumn === -1) {
      ambiguousStructures.push(
        `Table ${block.tableIndex + 1} contained no identifiable question column and was left unprocessed.`
      );
      continue;
    }

    columnMappings.push({
      worksheet: `Table ${block.tableIndex + 1}`,
      questionColumn: columnLetter(questionColumn),
      responseColumn: responseColumn >= 0 ? columnLetter(responseColumn) : null,
      questionIdColumn: idColumn >= 0 ? columnLetter(idColumn) : null,
      sectionColumn: sectionColumn >= 0 ? columnLetter(sectionColumn) : null,
      mandatoryColumn: null,
      instructionColumn: null,
      evidenceColumn: null,
      commentColumn: null,
      headerRow: headerLooksLikeHeader ? 1 : 0,
      confidence: responseColumn >= 0 && headerLooksLikeHeader ? 75 : 45,
      rationale: [
        headerLooksLikeHeader
          ? 'Header row detected inside the DOCX table.'
          : 'No table header row found; columns inferred from content.'
      ],
      ambiguous: responseColumn < 0 || !headerLooksLikeHeader,
      ambiguousReason: responseColumn < 0 ? 'No response column detected in the table.' : undefined,
      humanConfirmed: false
    });

    for (let r = firstDataRow; r < table.rows.length; r++) {
      const row = table.rows[r];
      const questionText = normalizeText((row[questionColumn] || {}).text || '');
      if (!questionText) continue;

      const sectionText = sectionColumn >= 0 ? normalizeText((row[sectionColumn] || {}).text || '') : '';
      if (!looksLikeQuestion(questionText)) {
        if (sectionText && !looksLikeQuestion(sectionText)) {
          currentSection = sectionText;
          sectionIndex++;
          continue;
        }
        warnings.push(
          `DOCX table ${block.tableIndex + 1} row ${r + 1} was skipped: cell text did not read as a question ("${questionText.slice(
            0,
            60
          )}").`
        );
        continue;
      }

      const existingResponse = responseColumn >= 0 ? normalizeText((row[responseColumn] || {}).text || '') : '';
      const { identifier } = extractIdentifier(questionText);
      const warningsForQuestion: string[] = [];
      const untrusted = detectUntrustedInstructionPatterns(questionText);
      if (untrusted.length > 0) {
        warningsForQuestion.push(
          `Question text matched instruction-override patterns (${untrusted.join(', ')}); treated as untrusted data.`
        );
      }

      questions.push({
        sectionName: currentSection,
        sectionOrder: sectionIndex,
        questionIdentifier: idColumn >= 0 ? normalizeText((row[idColumn] || {}).text || '') || identifier : identifier,
        originalText: questionText,
        order: questions.length + 1,
        answerOptions: parseAnswerOptionsFromInstruction(questionText),
        mandatory: detectMandatoryFromText(questionText),
        existingResponse: existingResponse || undefined,
        sourceLocation: {
          sectionLabel: currentSection,
          tableIndex: block.tableIndex,
          // 1-based table row number, consistent with the R index in the cell reference.
          rowNumber: r + 1,
          questionCell: `T${block.tableIndex + 1}R${r + 1}C${questionColumn + 1}`,
          responseCell: responseColumn >= 0 ? `T${block.tableIndex + 1}R${r + 1}C${responseColumn + 1}` : undefined
        },
        warnings: warningsForQuestion
      });
    }
  }

  if (questions.length === 0) {
    warnings.push(
      'No questions were found in the DOCX document. Tables, headings and numbered paragraphs are supported; the document may use an unsupported layout.'
    );
  }

  const summary: RawIngestionResult['summary'] = {
    format: 'DOCX',
    documentsDetected: 1,
    worksheetsProcessed: doc.tables.map((_t, i) => `Table ${i + 1}`),
    worksheetsPreservedUnmodified: [],
    ambiguousStructures,
    unmappedResponseFields: columnMappings.filter(m => !m.responseColumn).length,
    unreadableRegions: [],
    warnings,
    columnMappings,
    extractionConfidence: 0,
    confidenceBand: 'UNREADABLE'
  };
  summary.extractionConfidence = computeExtractionConfidence(summary, questions.length);
  summary.confidenceBand = confidenceBandFor(summary.extractionConfidence);

  return { questions, columnMappings, summary };
}

// ---------------------------------------------------------------------------
// PDF EXTRACTION
// ---------------------------------------------------------------------------

function extractFromPdf(params: { buffer: Buffer }): RawIngestionResult {
  const extraction = extractPdfText(params.buffer);
  const questions: RawIngestedQuestion[] = [];
  const warnings: string[] = [...extraction.warnings];
  const ambiguousStructures: string[] = [];

  let currentSection = 'PDF Document';
  let sectionIndex = 0;

  for (const page of extraction.pages) {
    for (const line of page.lines) {
      const text = normalizeText(line);
      if (!text) continue;

      if (looksLikeQuestion(text)) {
        const { identifier } = extractIdentifier(text);
        const warningsForQuestion: string[] = [];
        if (extraction.confidenceBand === 'LOW') {
          warningsForQuestion.push(
            'PDF text extraction confidence is LOW; verify the extracted wording against the original page.'
          );
        }
        const untrusted = detectUntrustedInstructionPatterns(text);
        if (untrusted.length > 0) {
          warningsForQuestion.push(
            `Line matched instruction-override patterns (${untrusted.join(', ')}); treated as untrusted data.`
          );
        }
        questions.push({
          sectionName: currentSection,
          sectionOrder: sectionIndex,
          questionIdentifier: identifier,
          originalText: text,
          order: questions.length + 1,
          answerOptions: parseAnswerOptionsFromInstruction(text),
          mandatory: detectMandatoryFromText(text),
          sourceLocation: {
            pageNumber: page.pageNumber,
            sectionLabel: currentSection,
            rawFragment: line
          },
          warnings: warningsForQuestion
        });
        continue;
      }

      const isSection =
        (text.length <= 70 && text === text.toUpperCase() && /[A-Z]/.test(text) && !text.endsWith('?')) ||
        (/^[0-9]+(\.[0-9]+)*\s+[A-Z][A-Za-z ]{3,60}$/.test(text) && !looksLikeQuestion(text));
      if (isSection) {
        currentSection = text;
        sectionIndex++;
      }
    }
  }

  if (extraction.status === 'UNREADABLE') {
    warnings.push(
      'The PDF yielded no machine-readable text; no questions were extracted. Manual transcription or an OCR pipeline is required.'
    );
  } else if (questions.length === 0) {
    warnings.push(
      'PDF text was extracted but no lines read as questions. PDF response fields cannot be written back automatically.'
    );
  }

  ambiguousStructures.push(
    'PDF is not reliably round-trippable: response locations cannot be bound to original layout positions. Export for PDF sources produces a summary rendering, not an in-place edit of the original.'
  );

  const summary: RawIngestionResult['summary'] = {
    format: 'PDF',
    documentsDetected: 1,
    worksheetsProcessed: extraction.pages.map(p => `Page ${p.pageNumber}`),
    worksheetsPreservedUnmodified: [],
    ambiguousStructures,
    unmappedResponseFields: questions.length,
    unreadableRegions: extraction.status === 'UNREADABLE' ? ['entire document'] : [],
    warnings,
    columnMappings: [],
    extractionConfidence: 0,
    confidenceBand: 'UNREADABLE'
  };
  summary.extractionConfidence = extraction.status === 'UNREADABLE' ? 0 : Math.round(extraction.confidence * 0.9);
  summary.confidenceBand = confidenceBandFor(summary.extractionConfidence);

  return { questions, columnMappings: [], summary };
}

// ---------------------------------------------------------------------------
// PUBLIC API
// ---------------------------------------------------------------------------

export class QuestionnaireImportService {
  /**
   * Parses an uploaded questionnaire. Never throws for unreadable content:
   * unreadable content is reported in the summary instead.
   */
  public async ingest(params: ImportRequest & { questionnaireId: string }): Promise<RawIngestionResult> {
    const validation = validateUpload({
      fileName: params.fileName,
      mimeType: params.mimeType,
      buffer: params.buffer,
      maxBytes: 25 * 1024 * 1024
    });

    if (!validation.valid || !validation.format) {
      return {
        questions: [],
        columnMappings: [],
        summary: {
          format: 'CSV',
          documentsDetected: 0,
          worksheetsProcessed: [],
          worksheetsPreservedUnmodified: [],
          ambiguousStructures: [],
          unmappedResponseFields: 0,
          unreadableRegions: [],
          warnings: [...validation.warnings, ...validation.errors],
          columnMappings: [],
          extractionConfidence: 0,
          confidenceBand: 'UNREADABLE'
        }
      };
    }

    switch (validation.format) {
      case 'XLSX':
        return extractFromXlsx(params);
      case 'CSV':
        return extractFromCsv(params);
      case 'DOCX':
        return extractFromDocx(params);
      case 'PDF':
        return extractFromPdf(params);
      default:
        return {
          questions: [],
          columnMappings: [],
          summary: {
            format: validation.format,
            documentsDetected: 0,
            worksheetsProcessed: [],
            worksheetsPreservedUnmodified: [],
            ambiguousStructures: [],
            unmappedResponseFields: 0,
            unreadableRegions: [],
            warnings: [`Format ${validation.format} extraction is not implemented.`],
            columnMappings: [],
            extractionConfidence: 0,
            confidenceBand: 'UNREADABLE'
          }
        };
    }
  }

  /** Materializes extracted questions into persisted ExtractedQuestion records. */
  public materialize(params: {
    tenantId: string;
    questionnaireId: string;
    raw: RawIngestedQuestion[];
  }): ExtractedQuestion[] {
    return params.raw.map((raw, index) => {
      const confidence = this.scoreQuestionConfidence(raw);
      const band = confidenceBandFor(confidence);
      return {
        id: `${params.questionnaireId}-Q${String(index + 1).padStart(4, '0')}`,
        questionnaireId: params.questionnaireId,
        tenantId: params.tenantId,
        sectionName: raw.sectionName,
        sectionOrder: raw.sectionOrder,
        questionIdentifier: raw.questionIdentifier,
        originalText: raw.originalText,
        order: raw.order,
        responseType: classifyResponseType({
          headerLabel: raw.instructions || '',
          instructions: raw.instructions || '',
          answerOptions: raw.answerOptions,
          existingResponses: raw.existingResponse ? [raw.existingResponse] : []
        }),
        answerOptions: raw.answerOptions,
        mandatory: raw.mandatory,
        instructions: raw.instructions,
        existingResponse: raw.existingResponse,
        evidenceRequirement: raw.evidenceRequirement,
        comments: raw.comments,
        sourceLocation: raw.sourceLocation,
        extractionConfidence: confidence,
        confidenceBand: band,
        extractionWarnings: raw.warnings,
        requiresHumanCorrection: band === 'LOW' || band === 'UNREADABLE' || raw.warnings.length > 0
      };
    });
  }

  private scoreQuestionConfidence(raw: RawIngestedQuestion): number {
    let score = 70;
    const text = normalizeText(raw.originalText);
    if (text.length < 20) score -= 20;
    if (text.endsWith('?')) score += 15;
    if (raw.questionIdentifier) score += 5;
    if (raw.sourceLocation.responseCell) score += 10;
    else score -= 25;
    if (raw.sourceLocation.worksheet) score += 3;
    if (raw.warnings.length > 0) score -= raw.warnings.length * 8;
    if (raw.sourceLocation.pageNumber) score -= 10;
    return Math.max(0, Math.min(100, score));
  }
}

export const questionnaireImportService = new QuestionnaireImportService();
