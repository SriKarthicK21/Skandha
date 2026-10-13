// ============================================================================
// SKANDA QUESTIONNAIRE INTELLIGENCE: CSV ENGINE
// Path: src/services/questionnaire/csvEngine.ts
//
// RFC 4180 compliant CSV parsing and writing with delimiter sniffing.
// Export path neutralizes spreadsheet formula injection.
// ============================================================================

import { normalizeText } from './ooxml/xmlUtils.js';

export interface CsvParseOptions {
  delimiter?: string;
  hasHeader?: boolean;
}

export interface CsvTable {
  delimiter: string;
  rows: string[][];
  headerRow: string[] | null;
  raggedRowCount: number;
  encodingWarnings: string[];
}

const CANDIDATE_DELIMITERS = [',', ';', '\t', '|'];

export function sniffDelimiter(content: string): string {
  const sample = content.split(/\r?\n/).slice(0, 25).join('\n');
  let best = ',';
  let bestScore = -1;
  for (const delimiter of CANDIDATE_DELIMITERS) {
    // Count the field separators outside of quoted regions roughly.
    const occurrences = sample.split(delimiter).length - 1;
    if (occurrences > bestScore) {
      bestScore = occurrences;
      best = delimiter;
    }
  }
  return best;
}

export function stripBom(content: string): string {
  return content.charCodeAt(0) === 0xfeff ? content.slice(1) : content;
}

export function parseCsv(content: string, options: CsvParseOptions = {}): CsvTable {
  const warnings: string[] = [];
  const cleaned = stripBom(content).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const delimiter = options.delimiter || sniffDelimiter(cleaned);

  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;
  let i = 0;

  const pushField = () => {
    row.push(field);
    field = '';
  };
  const pushRow = () => {
    pushField();
    rows.push(row);
    row = [];
  };

  while (i < cleaned.length) {
    const char = cleaned[i];

    if (inQuotes) {
      if (char === '"') {
        if (cleaned[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += char;
      i++;
      continue;
    }

    if (char === '"') {
      if (field.length === 0) {
        inQuotes = true;
        i++;
        continue;
      }
      // Malformed quote in the middle of an unquoted field — keep literal.
      field += char;
      i++;
      continue;
    }

    if (char === delimiter) {
      pushField();
      i++;
      continue;
    }

    if (char === '\n') {
      pushRow();
      i++;
      continue;
    }

    field += char;
    i++;
  }

  if (inQuotes) {
    warnings.push('Unterminated quoted field detected; content after the opening quote was captured literally.');
  }
  if (field.length > 0 || row.length > 0) {
    pushRow();
  }

  // Drop trailing fully-empty rows produced by a final newline.
  while (rows.length > 0 && rows[rows.length - 1].every(cell => normalizeText(cell) === '')) {
    rows.pop();
  }

  const columnCounts = rows.map(r => r.length);
  const modalCount = columnCounts.length > 0 ? columnCounts[0] : 0;
  const raggedRowCount = columnCounts.filter(c => c !== modalCount).length;
  if (raggedRowCount > 0) {
    warnings.push(
      `${raggedRowCount} row(s) have a different column count than the first row; malformed rows are retained and flagged.`
    );
  }

  const hasHeader = options.hasHeader !== false;
  return {
    delimiter,
    rows,
    headerRow: hasHeader && rows.length > 0 ? rows[0] : null,
    raggedRowCount,
    encodingWarnings: warnings
  };
}

export function csvEscape(value: string, delimiter: string): string {
  const needsQuoting =
    value.includes(delimiter) || value.includes('"') || value.includes('\n') || value.includes('\r');
  if (!needsQuoting) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

export interface CsvWriteRow {
  cells: string[];
  /** When true, cells are written verbatim (used for header rows). */
  raw?: boolean;
}

export function writeCsv(rows: CsvWriteRow[], delimiter = ','): string {
  const lines = rows.map(r =>
    r.cells.map(cell => csvEscape(cell ?? '', delimiter)).join(delimiter)
  );
  return `${lines.join('\n')}\n`;
}
