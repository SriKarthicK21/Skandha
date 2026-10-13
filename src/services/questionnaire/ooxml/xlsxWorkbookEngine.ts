// ============================================================================
// SKANDA QUESTIONNAIRE INTELLIGENCE: XLSX WORKBOOK ENGINE
// Path: src/services/questionnaire/ooxml/xlsxWorkbookEngine.ts
//
// Dependency-free SpreadsheetML (OOXML) reader and in-place writer built on
// `jszip`, which is already a project dependency.
//
// Round-trip guarantee: writes mutate ONLY the targeted cells inside the
// targeted worksheet part. Every other worksheet, cell, formula, style,
// merged range and workbook part is carried through untouched.
// ============================================================================

import JSZip from 'jszip';
import {
  columnIndexToLetters,
  escapeXmlText,
  parseCellRef,
  readAttribute,
  unescapeXml
} from './xmlUtils.js';

export interface XlsxCellValue {
  ref: string;
  columnIndex: number;
  rowNumber: number;
  /** Textual value as a reviewer would read it. */
  text: string;
  /** Numeric value when the cell is numeric. */
  numeric?: number;
  type: 'string' | 'number' | 'boolean' | 'formula' | 'empty' | 'error';
  formula?: string;
  isMerged: boolean;
  mergedRange?: string;
  hasStyle: boolean;
}

export interface XlsxSheet {
  name: string;
  index: number;
  partPath: string;
  dimension?: string;
  hidden: boolean;
  mergedRanges: string[];
  rows: Map<number, Map<number, XlsxCellValue>>;
  maxRow: number;
  maxColumn: number;
}

export interface XlsxWorkbook {
  sheets: XlsxSheet[];
  sheetCount: number;
  definedNames: string[];
}

export interface CellWrite {
  sheetName: string;
  cellRef: string;
  value: string;
  /** When true, the value is written as a number rather than a string. */
  numeric?: boolean;
}

export class XlsxWriteRefusedError extends Error {
  public readonly code = 'XLSX_WRITE_REFUSED';
}

// ---------------------------------------------------------------------------
// READING
// ---------------------------------------------------------------------------

function resolveZipPath(baseDir: string, target: string): string {
  if (target.startsWith('/')) return target.slice(1);
  const parts = `${baseDir}/${target}`.split('/');
  const stack: string[] = [];
  for (const part of parts) {
    if (part === '.' || part === '') continue;
    if (part === '..') stack.pop();
    else stack.push(part);
  }
  return stack.join('/');
}

function parseSharedStrings(xml: string): string[] {
  const strings: string[] = [];
  const siRe = /<si(?:\s[^>]*)?>([\s\S]*?)<\/si>|<si(?:\s[^>]*)?\/>/g;
  let match: RegExpExecArray | null;
  while ((match = siRe.exec(xml)) !== null) {
    const inner = match[1] || '';
    // A shared string may be a single <t> or a sequence of rich-text runs <r><t>.
    const tRe = /<t(?:\s[^>]*)?>([\s\S]*?)<\/t>|<t(?:\s[^>]*)?\/>/g;
    let text = '';
    let tMatch: RegExpExecArray | null;
    let any = false;
    while ((tMatch = tRe.exec(inner)) !== null) {
      any = true;
      text += unescapeXml(tMatch[1] || '');
    }
    strings.push(any ? text : unescapeXml(inner.replace(/<[^>]+>/g, '')));
  }
  return strings;
}

function parseWorksheet(
  name: string,
  index: number,
  partPath: string,
  xml: string,
  sharedStrings: string[],
  hidden: boolean
): XlsxSheet {
  const mergedRanges: string[] = [];
  const mergeBlock = /<mergeCells[\s\S]*?<\/mergeCells>/.exec(xml);
  if (mergeBlock) {
    const mr = /<mergeCell\s[^>]*ref="([^"]+)"[^>]*\/?>/g;
    let m: RegExpExecArray | null;
    while ((m = mr.exec(mergeBlock[0])) !== null) mergedRanges.push(m[1]);
  }

  const mergedLookup = new Map<string, string>();
  for (const range of mergedRanges) {
    const [startRef, endRef] = range.split(':');
    const start = parseCellRef(startRef);
    const end = parseCellRef(endRef || startRef);
    if (!start || !end) continue;
    for (let r = start.rowNumber; r <= end.rowNumber; r++) {
      for (let c = start.columnIndex; c <= end.columnIndex; c++) {
        mergedLookup.set(`${c}:${r}`, range);
      }
    }
  }

  const dimensionMatch = /<dimension\s[^>]*ref="([^"]+)"/.exec(xml);
  const rows = new Map<number, Map<number, XlsxCellValue>>();

  const rowRe = /<row(\s[^>]*)?(\/>|>([\s\S]*?)<\/row>)/g;
  let rowMatch: RegExpExecArray | null;
  let maxRow = 0;
  let maxColumn = 0;

  while ((rowMatch = rowRe.exec(xml)) !== null) {
    const rowAttrs = rowMatch[1] || '';
    const declaredRow = readAttribute(`<row${rowAttrs}>`, 'r');
    const rowNumber = declaredRow ? parseInt(declaredRow, 10) : maxRow + 1;
    const rowBody = rowMatch[3] || '';
    if (!rowBody) continue;

    const cellRe = /<c(\s[^>]*)?(\/>|>([\s\S]*?)<\/c>)/g;
    let cellMatch: RegExpExecArray | null;
    let lastColumn = -1;

    while ((cellMatch = cellRe.exec(rowBody)) !== null) {
      const cellAttrs = cellMatch[1] || '';
      const tag = `<c${cellAttrs}>`;
      const body = cellMatch[3] || '';
      const ref = readAttribute(tag, 'r');
      const parsed = ref ? parseCellRef(ref) : null;
      const columnIndex = parsed ? parsed.columnIndex : lastColumn + 1;
      lastColumn = columnIndex;
      const cellRef = parsed ? parsed.ref : `${columnIndexToLetters(columnIndex)}${rowNumber}`;
      const type = readAttribute(tag, 't') || 'n';
      const hasStyle = readAttribute(tag, 's') !== undefined;

      const formulaMatch = /<f(?:\s[^>]*)?>([\s\S]*?)<\/f>/.exec(body);
      const valueMatch = /<v(?:\s[^>]*)?>([\s\S]*?)<\/v>/.exec(body);
      const inlineMatch = /<is(?:\s[^>]*)?>([\s\S]*?)<\/is>|<is(?:\s[^>]*)?\/>/.exec(body);

      let text = '';
      let numeric: number | undefined;
      let valueType: XlsxCellValue['type'] = 'empty';

      if (type === 's') {
        const idx = valueMatch ? parseInt(unescapeXml(valueMatch[1]), 10) : NaN;
        text = Number.isFinite(idx) ? sharedStrings[idx] ?? '' : '';
        valueType = 'string';
      } else if (type === 'inlineStr') {
        const inner = inlineMatch ? inlineMatch[1] || '' : '';
        text = unescapeXml(inner.replace(/<[^>]+>/g, ''));
        valueType = 'string';
      } else if (type === 'str') {
        text = valueMatch ? unescapeXml(valueMatch[1]) : '';
        valueType = 'string';
      } else if (type === 'b') {
        const raw = valueMatch ? unescapeXml(valueMatch[1]) : '';
        text = raw === '1' ? 'TRUE' : 'FALSE';
        valueType = 'boolean';
      } else if (type === 'e') {
        text = valueMatch ? unescapeXml(valueMatch[1]) : '';
        valueType = 'error';
      } else if (valueMatch) {
        const raw = unescapeXml(valueMatch[1]);
        const num = Number(raw);
        text = raw;
        if (Number.isFinite(num)) numeric = num;
        valueType = 'number';
        // A numeric cell with a cached string payload (common for dates/text).
        if (!Number.isFinite(num) && raw) valueType = 'string';
      }

      if (formulaMatch) {
        valueType = 'formula';
      }
      if (valueType === 'empty' && !text && !formulaMatch) {
        // keep empty
      }

      const mergeKey = `${columnIndex}:${rowNumber}`;
      const mergedRange = mergedLookup.get(mergeKey);

      if (!rows.has(rowNumber)) rows.set(rowNumber, new Map());
      rows.get(rowNumber)!.set(columnIndex, {
        ref: cellRef,
        columnIndex,
        rowNumber,
        text,
        numeric,
        type: valueType,
        formula: formulaMatch ? formulaMatch[1] : undefined,
        isMerged: Boolean(mergedRange),
        mergedRange,
        hasStyle
      });

      maxColumn = Math.max(maxColumn, columnIndex);
      maxRow = Math.max(maxRow, rowNumber);
    }

    maxRow = Math.max(maxRow, rowNumber);
  }

  return {
    name,
    index,
    partPath,
    dimension: dimensionMatch ? dimensionMatch[1] : undefined,
    hidden,
    mergedRanges,
    rows,
    maxRow,
    maxColumn
  };
}

export async function readXlsxWorkbook(buffer: Buffer | Uint8Array): Promise<XlsxWorkbook> {
  const zip = await JSZip.loadAsync(buffer);

  const workbookEntry = zip.file('xl/workbook.xml');
  if (!workbookEntry) {
    throw new Error('Not a valid XLSX workbook: missing xl/workbook.xml');
  }
  const workbookXml = await workbookEntry.async('string');

  const relsEntry = zip.file('xl/_rels/workbook.xml.rels');
  const relsXml = relsEntry ? await relsEntry.async('string') : '';
  const relTargets = new Map<string, string>();
  const relRe = /<Relationship\s[^>]*\/?>/g;
  let relMatch: RegExpExecArray | null;
  while ((relMatch = relRe.exec(relsXml)) !== null) {
    const id = readAttribute(relMatch[0], 'Id');
    const target = readAttribute(relMatch[0], 'Target');
    if (id && target) relTargets.set(id, target);
  }

  const sheetRefs: Array<{ name: string; rId?: string; state: string }> = [];
  const sheetRe = /<sheet\s[^>]*\/?>/g;
  let sheetMatch: RegExpExecArray | null;
  while ((sheetMatch = sheetRe.exec(workbookXml)) !== null) {
    sheetRefs.push({
      name: readAttribute(sheetMatch[0], 'name') || `Sheet${sheetRefs.length + 1}`,
      rId: readAttribute(sheetMatch[0], 'r:id') || readAttribute(sheetMatch[0], 'id'),
      state: readAttribute(sheetMatch[0], 'state') || 'visible'
    });
  }

  const definedNames: string[] = [];
  const dnRe = /<definedName\s[^>]*>([\s\S]*?)<\/definedName>/g;
  let dnMatch: RegExpExecArray | null;
  while ((dnMatch = dnRe.exec(workbookXml)) !== null) {
    definedNames.push(unescapeXml(dnMatch[1]));
  }

  const sharedStringsEntry = zip.file('xl/sharedStrings.xml');
  const sharedStrings = sharedStringsEntry
    ? parseSharedStrings(await sharedStringsEntry.async('string'))
    : [];

  const sheets: XlsxSheet[] = [];
  for (let i = 0; i < sheetRefs.length; i++) {
    const ref = sheetRefs[i];
    let partPath = ref.rId ? relTargets.get(ref.rId) : undefined;
    if (partPath) {
      partPath = resolveZipPath('xl', partPath);
    } else {
      partPath = `xl/worksheets/sheet${i + 1}.xml`;
    }
    const entry = zip.file(partPath) || zip.file(`xl/worksheets/sheet${i + 1}.xml`);
    if (!entry) continue;
    const xml = await entry.async('string');
    sheets.push(
      parseWorksheet(ref.name, i, entry.name, xml, sharedStrings, ref.state !== 'visible')
    );
  }

  return { sheets, sheetCount: sheets.length, definedNames };
}

// ---------------------------------------------------------------------------
// HELPERS FOR CONSUMERS
// ---------------------------------------------------------------------------

/** Reads a cell by A1 reference from a sheet. Returns null when absent. */
export function getCell(sheet: XlsxSheet, cellRef: string): XlsxCellValue | null {
  const parsed = parseCellRef(cellRef);
  if (!parsed) return null;
  const row = sheet.rows.get(parsed.rowNumber);
  if (!row) return null;
  return row.get(parsed.columnIndex) || null;
}

/** Reads a cell value by 0-based row/column indices. */
export function getCellByIndex(sheet: XlsxSheet, rowIndex: number, columnIndex: number): XlsxCellValue | null {
  const row = sheet.rows.get(rowIndex + 1);
  if (!row) return null;
  return row.get(columnIndex) || null;
}

export function sheetAsGrid(sheet: XlsxSheet, maxRows?: number, maxCols?: number): string[][] {
  const rowLimit = Math.min(maxRows ?? sheet.maxRow, sheet.maxRow);
  const colLimit = Math.min(maxCols ?? sheet.maxColumn, sheet.maxColumn);
  const grid: string[][] = [];
  for (let r = 1; r <= rowLimit; r++) {
    const line: string[] = [];
    for (let c = 0; c <= colLimit; c++) {
      const cell = sheet.rows.get(r)?.get(c);
      line.push(cell ? cell.text : '');
    }
    grid.push(line);
  }
  return grid;
}

// ---------------------------------------------------------------------------
// WRITING (IN-PLACE, NON-DESTRUCTIVE)
// ---------------------------------------------------------------------------

function buildCellXml(existingTag: string, value: string, numeric: boolean): string {
  // Preserve the original style index ("s") so formatting survives.
  const styleAttr = readAttribute(existingTag, 's');
  const stylePart = styleAttr !== undefined ? ` s="${styleAttr}"` : '';

  if (numeric && value !== '' && Number.isFinite(Number(value))) {
    return `<c r="${readAttribute(existingTag, 'r')}"${stylePart}><v>${Number(value)}</v></c>`;
  }

  // Inline string keeps us out of sharedStrings.xml entirely, which avoids
  // mutating a part that other sheets depend on.
  return `<c r="${readAttribute(existingTag, 'r')}"${stylePart} t="inlineStr"><is><t xml:space="preserve">${escapeXmlText(
    value
  )}</t></is></c>`;
}

function buildNewCellXml(cellRef: string, value: string, numeric: boolean): string {
  const parsed = parseCellRef(cellRef);
  const ref = parsed ? parsed.ref : cellRef;
  if (numeric && value !== '' && Number.isFinite(Number(value))) {
    return `<c r="${ref}"><v>${Number(value)}</v></c>`;
  }
  return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${escapeXmlText(value)}</t></is></c>`;
}

interface SheetWritePlan {
  writes: CellWrite[];
}

/**
 * Applies cell writes to the workbook.
 *
 * Refusals (thrown as XlsxWriteRefusedError) protect workbook integrity:
 *  - never write to a cell that currently holds a formula;
 *  - never write outside the worksheet that was mapped.
 * All other content is preserved byte-for-byte in content terms.
 */
export async function writeIntoXlsxWorkbook(
  buffer: Buffer | Uint8Array,
  writes: CellWrite[]
): Promise<{ buffer: Buffer; written: CellWrite[]; refused: Array<{ write: CellWrite; reason: string }> }> {
  const zip = await JSZip.loadAsync(buffer);
  const workbook = await readXlsxWorkbook(buffer);

  const bySheet = new Map<string, SheetWritePlan>();
  for (const write of writes) {
    if (!bySheet.has(write.sheetName)) bySheet.set(write.sheetName, { writes: [] });
    bySheet.get(write.sheetName)!.writes.push(write);
  }

  const written: CellWrite[] = [];
  const refused: Array<{ write: CellWrite; reason: string }> = [];

  for (const [sheetName, plan] of bySheet.entries()) {
    const sheet = workbook.sheets.find(s => s.name === sheetName);
    if (!sheet) {
      for (const w of plan.writes) {
        refused.push({ write: w, reason: `Worksheet "${sheetName}" not found in workbook.` });
      }
      continue;
    }

    const entry = zip.file(sheet.partPath);
    if (!entry) {
      for (const w of plan.writes) {
        refused.push({ write: w, reason: `Worksheet part "${sheet.partPath}" missing.` });
      }
      continue;
    }

    let xml = await entry.async('string');
    const applicable: CellWrite[] = [];

    for (const write of plan.writes) {
      const parsed = parseCellRef(write.cellRef);
      if (!parsed) {
        refused.push({ write, reason: `Invalid cell reference "${write.cellRef}".` });
        continue;
      }
      const existingRow = sheet.rows.get(parsed.rowNumber);
      const existingCell = existingRow ? existingRow.get(parsed.columnIndex) : undefined;

      // A pre-existing formula must never be silently destroyed.
      if (existingCell && (existingCell.formula !== undefined || existingCell.type === 'formula')) {
        refused.push({
          write,
          reason: `Cell ${parsed.ref} contains a formula; refusing to overwrite computed content.`
        });
        continue;
      }
      applicable.push({ ...write, cellRef: parsed.ref });
    }

    if (applicable.length === 0) continue;

    xml = applyWritesToSheetXml(xml, applicable);
    zip.file(sheet.partPath, xml);
    written.push(...applicable);
  }

  const out = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  return { buffer: out, written, refused };
}

function applyWritesToSheetXml(xml: string, writes: CellWrite[]): string {
  let result = xml;

  for (const write of writes) {
    const parsed = parseCellRef(write.cellRef)!;
    const rowNumber = parsed.rowNumber;
    const rowRe = new RegExp(`(<row(?:\\s[^>]*)?\\br="${rowNumber}"(?:\\s[^>]*)?)(\\/>|>([\\s\\S]*?)<\\/row>)`);
    const rowMatch = rowRe.exec(result);

    if (!rowMatch) {
      // Row does not exist: create it in ascending order, keeping the sheet valid.
      const newCell = buildNewCellXml(parsed.ref, write.value, Boolean(write.numeric));
      const newRow = `<row r="${rowNumber}">${newCell}</row>`;
      result = insertRowInOrder(result, rowNumber, newRow);
      continue;
    }

    const rowAttrsEnd = rowMatch[1];
    const selfClosing = rowMatch[2].startsWith('/>');
    let rowBody = rowMatch[3] || '';

    if (selfClosing) {
      // Empty row element: give it a body.
      const newCell = buildNewCellXml(parsed.ref, write.value, Boolean(write.numeric));
      const replacement = `${rowAttrsEnd}>${newCell}</row>`;
      result = result.slice(0, rowMatch.index) + replacement + result.slice(rowMatch.index + rowMatch[0].length);
      continue;
    }

    const cellRe = new RegExp(`<c(\\s[^>]*)?(\\/>|>([\\s\\S]*?)<\\/c>)`, 'g');
    let cellMatch: RegExpExecArray | null;
    let replaced = false;
    let insertOffset = -1;

    while ((cellMatch = cellRe.exec(rowBody)) !== null) {
      const tag = `<c${cellMatch[1] || ''}>`;
      const ref = readAttribute(tag, 'r');
      const cellParsed = ref ? parseCellRef(ref) : null;
      if (!cellParsed) continue;
      if (cellParsed.columnIndex === parsed.columnIndex) {
        const newCell = buildCellXml(tag, write.value, Boolean(write.numeric));
        rowBody =
          rowBody.slice(0, cellMatch.index) + newCell + rowBody.slice(cellMatch.index + cellMatch[0].length);
        replaced = true;
        break;
      }
      if (cellParsed.columnIndex < parsed.columnIndex) {
        insertOffset = cellMatch.index + cellMatch[0].length;
      }
    }

    if (!replaced) {
      const newCell = buildNewCellXml(parsed.ref, write.value, Boolean(write.numeric));
      if (insertOffset >= 0) {
        rowBody = rowBody.slice(0, insertOffset) + newCell + rowBody.slice(insertOffset);
      } else {
        rowBody = newCell + rowBody;
      }
    }

    const replacement = `${rowAttrsEnd}>${rowBody}</row>`;
    result = result.slice(0, rowMatch.index) + replacement + result.slice(rowMatch.index + rowMatch[0].length);
  }

  return result;
}

function insertRowInOrder(sheetXml: string, rowNumber: number, newRowXml: string): string {
  const rowRe = /<row(\s[^>]*)?(\/>|>[\s\S]*?<\/row>)/g;
  let match: RegExpExecArray | null;
  let insertAt = -1;
  let sheetDataClose = -1;

  while ((match = rowRe.exec(sheetXml)) !== null) {
    const declared = readAttribute(`<row${match[1] || ''}>`, 'r');
    const num = declared ? parseInt(declared, 10) : NaN;
    if (Number.isFinite(num) && num > rowNumber && insertAt === -1) {
      insertAt = match.index;
      break;
    }
  }

  if (insertAt === -1) {
    sheetDataClose = sheetXml.indexOf('</sheetData>');
    if (sheetDataClose === -1) {
      throw new XlsxWriteRefusedError('Worksheet has no </sheetData>; refusing to modify.');
    }
    return sheetXml.slice(0, sheetDataClose) + newRowXml + sheetXml.slice(sheetDataClose);
  }

  return sheetXml.slice(0, insertAt) + newRowXml + sheetXml.slice(insertAt);
}

/**
 * Structural validation of a generated workbook: re-opens it and confirms the
 * expected cell values are readable. Used before offering a download.
 */
export async function validateXlsxReadback(
  buffer: Buffer,
  expectations: Array<{ sheetName: string; cellRef: string; expected: string }>
): Promise<{ valid: boolean; mismatches: Array<{ sheetName: string; cellRef: string; expected: string; actual: string }> }> {
  const workbook = await readXlsxWorkbook(buffer);
  const mismatches: Array<{ sheetName: string; cellRef: string; expected: string; actual: string }> = [];
  for (const exp of expectations) {
    const sheet = workbook.sheets.find(s => s.name === exp.sheetName);
    if (!sheet) {
      mismatches.push({ ...exp, actual: '<worksheet missing>' });
      continue;
    }
    const cell = getCell(sheet, exp.cellRef);
    const actual = cell ? cell.text : '';
    if (actual !== exp.expected) {
      mismatches.push({ ...exp, actual });
    }
  }
  return { valid: mismatches.length === 0, mismatches };
}
