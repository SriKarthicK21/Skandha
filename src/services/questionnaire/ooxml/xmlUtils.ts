// ============================================================================
// SKANDA QUESTIONNAIRE INTELLIGENCE: XML / OOXML UTILITIES
// Path: src/services/questionnaire/ooxml/xmlUtils.ts
//
// Minimal, dependency-free XML helpers used by the XLSX and DOCX engines.
// Deliberately conservative: we only ever need attribute reads and text
// extraction from well-formed OOXML produced by Excel/Word/Google Sheets.
// ============================================================================

export function escapeXmlText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function escapeXmlAttribute(value: string): string {
  return escapeXmlText(value).replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export function unescapeXml(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_m, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&amp;/g, '&');
}

/** Reads an attribute value from a raw XML start-tag string. */
export function readAttribute(tag: string, attributeName: string): string | undefined {
  const re = new RegExp(`\\s${attributeName}\\s*=\\s*"([^"]*)"`);
  const match = re.exec(tag);
  if (match) return unescapeXml(match[1]);
  const alt = new RegExp(`\\s${attributeName}\\s*=\\s*'([^']*)'`);
  const altMatch = alt.exec(tag);
  return altMatch ? unescapeXml(altMatch[1]) : undefined;
}

/** 0-based column index -> A1 column letters. 0 -> A, 26 -> AA */
export function columnIndexToLetters(index: number): string {
  let n = index;
  let letters = '';
  do {
    letters = String.fromCharCode(65 + (n % 26)) + letters;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return letters;
}

/** A1 column letters -> 0-based column index. A -> 0, AA -> 26 */
export function columnLettersToIndex(letters: string): number {
  let index = 0;
  const upper = letters.toUpperCase();
  for (let i = 0; i < upper.length; i++) {
    index = index * 26 + (upper.charCodeAt(i) - 64);
  }
  return index - 1;
}

export interface ParsedCellRef {
  columnIndex: number;
  columnLetters: string;
  rowNumber: number;
  ref: string;
}

/** Parses `A1`, `AB123`, `$A$1`. Returns null when the reference is unusable. */
export function parseCellRef(ref: string): ParsedCellRef | null {
  if (!ref) return null;
  const cleaned = ref.replace(/\$/g, '').trim();
  const match = /^([A-Za-z]{1,3})([0-9]{1,7})$/.exec(cleaned);
  if (!match) return null;
  const columnLetters = match[1].toUpperCase();
  const rowNumber = parseInt(match[2], 10);
  if (!Number.isFinite(rowNumber) || rowNumber < 1) return null;
  return {
    columnIndex: columnLettersToIndex(columnLetters),
    columnLetters,
    rowNumber,
    ref: `${columnLetters}${rowNumber}`
  };
}

/** Extracts the visible text of every `<tag>` element in a fragment. */
export function extractAllElementText(xml: string, tagName: string): string {
  const re = new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)</${tagName}>`, 'g');
  let out = '';
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml)) !== null) {
    out += unescapeXml(match[1].replace(/<[^>]+>/g, ''));
  }
  return out;
}

/** Counts occurrences of a start tag, tolerating self-closing forms. */
export function countElements(xml: string, tagName: string): number {
  const re = new RegExp(`<${tagName}(?:\\s[^>]*)?/>|<${tagName}(?:\\s[^>]*)?>`, 'g');
  const match = xml.match(re);
  return match ? match.length : 0;
}

/**
 * Normalizes a value for comparison / classification.
 * Collapses whitespace, strips zero-width characters and BOMs.
 */
export function normalizeText(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Lowercases and strips punctuation, for knowledge-key generation. */
export function normalizeForMatching(value: string): string {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Neutralizes spreadsheet formula injection (CSV/TSV injection).
 * Text beginning with = + - @ or control characters is prefixed so that
 * spreadsheet applications treat it as inert text rather than a formula.
 */
export function neutralizeSpreadsheetFormula(value: string): string {
  if (!value) return value;
  const dangerous = /^[=+\-@\t\r]/;
  if (dangerous.test(value)) {
    return `'${value}`;
  }
  return value;
}

/** True when the string looks like a formula that would execute in a spreadsheet. */
export function looksLikeSpreadsheetFormula(value: string): boolean {
  if (!value) return false;
  return /^[=+\-@]/.test(value.trimStart());
}

/**
 * Heuristic detection of prompt-injection / instruction-override content inside
 * untrusted uploaded documents. This is defence-in-depth reporting only: the
 * engine never passes document text as trusted instructions, so a match here
 * flags a draft for human attention rather than changing control flow.
 */
export function detectUntrustedInstructionPatterns(text: string): string[] {
  const patterns: Array<{ id: string; re: RegExp }> = [
    { id: 'IGNORE_INSTRUCTIONS', re: /ignore\s+(all\s+|any\s+)?(previous|prior|above)\s+instructions?/i },
    { id: 'SYSTEM_PROMPT_PROBE', re: /(reveal|show|print|repeat)\s+(your\s+)?(system\s+)?prompt/i },
    { id: 'ROLE_OVERRIDE', re: /you\s+are\s+now\s+(in\s+)?(developer|admin|unrestricted|dan)\s*mode/i },
    { id: 'TENANT_ESCAPE', re: /(access|read|query)\s+(another|other|all)\s+tenant/i },
    { id: 'APPROVAL_BYPASS', re: /(skip|bypass|auto[- ]?approve|without\s+approval)\s+(the\s+)?(approval|review)/i },
    { id: 'PUBLISH_INTERNAL', re: /(publish|expose|upload)\s+(internal|confidential|private)\s+(documents?|evidence)/i },
    { id: 'TOOL_INVOCATION', re: /(execute|run|invoke)\s+(a\s+)?(tool|function|command|shell|script)/i },
    { id: 'PERMISSION_CHANGE', re: /(grant|change|escalate)\s+(my\s+)?(permissions?|privileges?|role)/i },
    { id: 'EXFILTRATION', re: /(send|email|exfiltrate)\s+(the\s+)?(data|evidence|records?)\s+(to|at)\s+/i }
  ];
  const hits: string[] = [];
  for (const p of patterns) {
    if (p.re.test(text)) hits.push(p.id);
  }
  return hits;
}
