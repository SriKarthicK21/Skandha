// ============================================================================
// SKANDA QUESTIONNAIRE INTELLIGENCE: DOCX DOCUMENT ENGINE
// Path: src/services/questionnaire/ooxml/docxDocumentEngine.ts
//
// Dependency-free WordprocessingML reader + targeted in-place writer using the
// project's existing `jszip` dependency.
//
// Reads body order (paragraphs and tables interleaved) and preserves heading
// structure. Writes replace text inside a single identified paragraph or table
// cell, leaving all other document content, styles and relationships intact.
// ============================================================================

import JSZip from 'jszip';
import { escapeXmlText, readAttribute, unescapeXml } from './xmlUtils.js';

export interface DocxParagraph {
  index: number;
  style?: string;
  text: string;
  isHeading: boolean;
  headingLevel?: number;
  isListItem: boolean;
}

export interface DocxTableCell {
  text: string;
  paragraphCount: number;
}

export interface DocxTable {
  index: number;
  rows: DocxTableCell[][];
}

export type DocxBlock =
  | { kind: 'paragraph'; paragraphIndex: number; off: number; len: number }
  | { kind: 'table'; tableIndex: number; off: number; len: number };

export interface DocxDocument {
  paragraphs: DocxParagraph[];
  tables: DocxTable[];
  bodyOrder: DocxBlock[];
}

function paragraphText(paragraphXml: string): string {
  const tRe = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:t(?:\s[^>]*)?\/>/g;
  let text = '';
  let match: RegExpExecArray | null;
  let sawTab = false;
  while ((match = tRe.exec(paragraphXml)) !== null) {
    text += unescapeXml(match[1] || '');
  }
  if (/<w:tab(?:\s[^>]*)?\/>/.test(paragraphXml)) sawTab = true;
  if (/<w:br(?:\s[^>]*)?\/>/.test(paragraphXml)) text += '\n';
  if (sawTab && !text) return '';
  return text;
}

/** Finds the top-level `<w:p>` / `<w:tbl>` blocks of a body fragment. */
function scanBlocks(bodyXml: string): Array<{ kind: 'p' | 'tbl'; start: number; end: number; xml: string }> {
  const blocks: Array<{ kind: 'p' | 'tbl'; start: number; end: number; xml: string }> = [];
  const re = /<w:(p|tbl)(?:\s[^>]*)?(?:\/>|>)/g;
  let match: RegExpExecArray | null;

  while ((match = re.exec(bodyXml)) !== null) {
    const kind = match[1] as 'p' | 'tbl';
    const tagEnd = match.index + match[0].length;
    const selfClosing = match[0].endsWith('/>');
    if (selfClosing) {
      blocks.push({ kind, start: match.index, end: tagEnd, xml: match[0] });
      continue;
    }
    // Walk forward counting nested same-name tags of the same kind.
    let depth = 1;
    let cursor = tagEnd;
    const openRe = new RegExp(`<w:${kind}(?:\\s[^>]*)?(/>|>)`, 'g');
    const closeRe = new RegExp(`</w:${kind}>`, 'g');
    openRe.lastIndex = cursor;
    closeRe.lastIndex = cursor;
    let nextOpen = openRe.exec(bodyXml);
    let nextClose = closeRe.exec(bodyXml);
    while (nextClose) {
      // Ignore open tags at or before this close tag unless they are nested.
      while (nextOpen && nextOpen.index < nextClose.index) {
        if (!nextOpen[1] || nextOpen[1] !== '/>') depth++;
        nextOpen = openRe.exec(bodyXml);
      }
      depth--;
      if (depth === 0) break;
      nextClose = closeRe.exec(bodyXml);
    }
    if (!nextClose) break;
    cursor = nextClose.index + nextClose[0].length;
    blocks.push({ kind, start: match.index, end: cursor, xml: bodyXml.slice(match.index, cursor) });
    re.lastIndex = cursor;
  }

  return blocks;
}

function parseTable(tableXml: string): DocxTable {
  const rows: DocxTableCell[][] = [];
  const trRe = /<w:tr(?:\s[^>]*)?(?:\/>|>)/g;
  let trMatch: RegExpExecArray | null;
  while ((trMatch = trRe.exec(tableXml)) !== null) {
    const start = trMatch.index + trMatch[0].length;
    const endIdx = locateClose(tableXml, 'tr', start);
    if (endIdx === -1) continue;
    const rowXml = tableXml.slice(trMatch.index, endIdx);
    const cells: DocxTableCell[] = [];
    const tcRe = /<w:tc(?:\s[^>]*)?(?:\/>|>)/g;
    let tcMatch: RegExpExecArray | null;
    while ((tcMatch = tcRe.exec(rowXml)) !== null) {
      const cStart = tcMatch.index + tcMatch[0].length;
      const cEnd = locateClose(rowXml, 'tc', cStart);
      if (cEnd === -1) continue;
      const cellXml = rowXml.slice(tcMatch.index, cEnd);
      const paragraphs = cellXml.match(/<w:p(?:\s[^>]*)?(?:\/>|>)/g);
      const text = paragraphs
        ? paragraphs
            .map(() => '')
            .join('')
        : '';
      const cellParagraphTexts: string[] = [];
      const pRe = /<w:p(?:\s[^>]*)?>([\s\S]*?)<\/w:p>|<w:p(?:\s[^>]*)?\/>/g;
      let pMatch: RegExpExecArray | null;
      while ((pMatch = pRe.exec(cellXml)) !== null) {
        cellParagraphTexts.push(paragraphText(pMatch[0]));
      }
      cells.push({
        text: cellParagraphTexts.filter(t => t.length > 0).join(' ') || cellParagraphTexts.join('') || text,
        paragraphCount: cellParagraphTexts.length
      });
    }
    if (cells.length > 0) rows.push(cells);
    trRe.lastIndex = endIdx;
  }
  return { index: 0, rows };
}

function locateClose(xml: string, tag: string, from: number): number {
  const openRe = new RegExp(`<w:${tag}(?:\\s[^>]*)?(/>|>)`, 'g');
  const closeRe = new RegExp(`</w:${tag}>`, 'g');
  openRe.lastIndex = from;
  closeRe.lastIndex = from;
  let depth = 1;
  let nextOpen = openRe.exec(xml);
  let nextClose = closeRe.exec(xml);
  while (nextClose) {
    while (nextOpen && nextOpen.index < nextClose.index) {
      if (!nextOpen[1] || nextOpen[1] !== '/>') depth++;
      nextOpen = openRe.exec(xml);
    }
    depth--;
    if (depth === 0) return nextClose.index + nextClose[0].length;
    nextClose = closeRe.exec(xml);
  }
  return -1;
}

function extractBodyXml(documentXml: string): { body: string; prefix: string; suffix: string } {
  const openMatch = /<w:body(?:\s[^>]*)?>/.exec(documentXml);
  if (!openMatch) {
    throw new Error('Not a valid DOCX document: missing <w:body>');
  }
  const bodyStart = openMatch.index + openMatch[0].length;
  const closeIdx = documentXml.lastIndexOf('</w:body>');
  if (closeIdx === -1) {
    throw new Error('Not a valid DOCX document: missing </w:body>');
  }
  return {
    prefix: documentXml.slice(0, bodyStart),
    body: documentXml.slice(bodyStart, closeIdx),
    suffix: documentXml.slice(closeIdx)
  };
}

export async function readDocxDocument(buffer: Buffer | Uint8Array): Promise<DocxDocument> {
  const zip = await JSZip.loadAsync(buffer);
  const entry = zip.file('word/document.xml');
  if (!entry) throw new Error('Not a valid DOCX document: missing word/document.xml');
  const documentXml = await entry.async('string');
  const { body } = extractBodyXml(documentXml);
  const blocks = scanBlocks(body);

  const paragraphs: DocxParagraph[] = [];
  const tables: DocxTable[] = [];
  const bodyOrder: DocxBlock[] = [];

  for (const block of blocks) {
    if (block.kind === 'p') {
      const styleMatch = /<w:pStyle\s[^>]*w:val="([^"]*)"/.exec(block.xml);
      const style = styleMatch ? styleMatch[1] : undefined;
      const headingMatch = style ? /^(?:Heading|heading)(\d)$/.exec(style) : null;
      const numbering = /<w:numPr(?:\s[^>]*)?>/.test(block.xml);
      const paragraphIndex = paragraphs.length;
      paragraphs.push({
        index: paragraphIndex,
        style,
        text: paragraphText(block.xml),
        isHeading: Boolean(headingMatch) || style === 'Title',
        headingLevel: headingMatch ? parseInt(headingMatch[1], 10) : undefined,
        isListItem: numbering
      });
      bodyOrder.push({ kind: 'paragraph', paragraphIndex, off: block.start, len: block.end - block.start });
    } else {
      const table = parseTable(block.xml);
      const tableIndex = tables.length;
      table.index = tableIndex;
      tables.push(table);
      bodyOrder.push({ kind: 'table', tableIndex, off: block.start, len: block.end - block.start });
    }
  }

  return { paragraphs, tables, bodyOrder };
}

// ---------------------------------------------------------------------------
// WRITING
// ---------------------------------------------------------------------------

export type DocxEditTarget =
  | { kind: 'paragraph'; paragraphIndex: number }
  | { kind: 'tableCell'; tableIndex: number; rowIndex: number; cellIndex: number };

export interface DocxEdit {
  target: DocxEditTarget;
  value: string;
}

export class DocxWriteRefusedError extends Error {
  public readonly code = 'DOCX_WRITE_REFUSED';
}

/**
 * Replaces the visible text of a paragraph while preserving the paragraph's
 * properties and the first run's formatting. Additional runs are emptied so
 * that no stale text survives.
 */
function replaceParagraphText(paragraphXml: string, value: string): string {
  const rPrMatch = /<w:rPr(?:\s[^>]*)?>[\s\S]*?<\/w:rPr>/.exec(paragraphXml);
  const runProps = rPrMatch ? rPrMatch[0] : '';
  const paragraphPropsMatch = /<w:pPr(?:\s[^>]*)?>[\s\S]*?<\/w:pPr>/.exec(paragraphXml);
  const paragraphProps = paragraphPropsMatch ? paragraphPropsMatch[0] : '';

  const openTag = /^<w:p(?:\s[^>]*)?>/.exec(paragraphXml);
  const open = openTag ? openTag[0] : '<w:p>';
  const textNodes = value.split('\n');
  const runs = textNodes
    .map(
      (line, i) =>
        `<w:r>${runProps}<w:t xml:space="preserve">${escapeXmlText(line)}</w:t></w:r>` +
        (i < textNodes.length - 1 ? '<w:r><w:br/></w:r>' : '')
    )
    .join('');

  return `${open}${paragraphProps}${runs}</w:p>`;
}

function replaceCellText(cellXml: string, value: string): string {
  const pRe = /<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>|<w:p(?:\s[^>]*)?\/>/g;
  let match: RegExpExecArray | null;
  let cursor = 0;
  let replaced = false;
  let out = '';

  while ((match = pRe.exec(cellXml)) !== null) {
    out += cellXml.slice(cursor, match.index);
    if (!replaced) {
      out += replaceParagraphText(match[0], value);
      replaced = true;
    } else {
      // Empty any remaining paragraphs so no stale text remains visible.
      out += replaceParagraphText(match[0], '');
    }
    cursor = match.index + match[0].length;
  }
  out += cellXml.slice(cursor);
  return out;
}

export async function writeIntoDocx(
  buffer: Buffer | Uint8Array,
  edits: DocxEdit[]
): Promise<{ buffer: Buffer; applied: number; refused: Array<{ edit: DocxEdit; reason: string }> }> {
  const zip = await JSZip.loadAsync(buffer);
  const entry = zip.file('word/document.xml');
  if (!entry) throw new Error('Not a valid DOCX document: missing word/document.xml');

  const documentXml = await entry.async('string');
  const { prefix, body, suffix } = extractBodyXml(documentXml);

  const doc = await readDocxDocument(buffer);
  const refused: Array<{ edit: DocxEdit; reason: string }> = [];
  // Apply edits from the end of the body backwards so earlier offsets stay valid.
  const resolved: Array<{ off: number; len: number; transform: (xml: string) => string }> = [];

  for (const edit of edits) {
    if (edit.target.kind === 'paragraph') {
      const targetIndex = edit.target.paragraphIndex;
      const block = doc.bodyOrder.find(
        b => b.kind === 'paragraph' && b.paragraphIndex === targetIndex
      );
      if (!block) {
        refused.push({ edit, reason: `Paragraph index ${targetIndex} not found.` });
        continue;
      }
      resolved.push({
        off: block.off,
        len: block.len,
        transform: xml => replaceParagraphText(xml, edit.value)
      });
    } else {
      const targetTableIndex = edit.target.tableIndex;
      const block = doc.bodyOrder.find(
        b => b.kind === 'table' && b.tableIndex === targetTableIndex
      );
      if (!block) {
        refused.push({ edit, reason: `Table index ${edit.target.tableIndex} not found.` });
        continue;
      }
      const tableXml = body.slice(block.off, block.off + block.len);
      const rows = splitTableRows(tableXml);
      const row = rows[edit.target.rowIndex];
      if (!row) {
        refused.push({ edit, reason: `Row ${edit.target.rowIndex} not found in table ${edit.target.tableIndex}.` });
        continue;
      }
      const cells = splitRowCells(row.xml);
      const cell = cells[edit.target.cellIndex];
      if (!cell) {
        refused.push({ edit, reason: `Cell ${edit.target.cellIndex} not found in row ${edit.target.rowIndex}.` });
        continue;
      }
      const newRowXml =
        row.xml.slice(0, cell.start) + replaceCellText(cell.xml, edit.value) + row.xml.slice(cell.end);
      const newTableXml = tableXml.slice(0, row.start) + newRowXml + tableXml.slice(row.end);
      resolved.push({
        off: block.off,
        len: block.len,
        transform: () => newTableXml
      });
    }
  }

  resolved.sort((a, b) => b.off - a.off);
  let newBody = body;
  for (const item of resolved) {
    newBody = newBody.slice(0, item.off) + item.transform(newBody.slice(item.off, item.off + item.len)) + newBody.slice(item.off + item.len);
  }

  zip.file('word/document.xml', `${prefix}${newBody}${suffix}`);
  const out = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  return { buffer: out, applied: resolved.length, refused };
}

function splitTableRows(tableXml: string): Array<{ start: number; end: number; xml: string }> {
  const rows: Array<{ start: number; end: number; xml: string }> = [];
  const re = /<w:tr(?:\s[^>]*)?(?:\/>|>)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(tableXml)) !== null) {
    const start = match.index;
    const bodyStart = match.index + match[0].length;
    if (match[0].endsWith('/>')) continue;
    const close = locateClose(tableXml, 'tr', bodyStart);
    if (close === -1) break;
    rows.push({ start, end: close, xml: tableXml.slice(start, close) });
    re.lastIndex = close;
  }
  return rows;
}

function splitRowCells(rowXml: string): Array<{ start: number; end: number; xml: string }> {
  const cells: Array<{ start: number; end: number; xml: string }> = [];
  const re = /<w:tc(?:\s[^>]*)?(?:\/>|>)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(rowXml)) !== null) {
    const start = match.index;
    const bodyStart = match.index + match[0].length;
    if (match[0].endsWith('/>')) {
      cells.push({ start, end: bodyStart, xml: match[0] });
      continue;
    }
    const close = locateClose(rowXml, 'tc', bodyStart);
    if (close === -1) break;
    cells.push({ start, end: close, xml: rowXml.slice(start, close) });
    re.lastIndex = close;
  }
  return cells;
}

/** Re-reads a generated DOCX and confirms the expected text is present. */
export async function validateDocxReadback(
  buffer: Buffer,
  expectations: string[]
): Promise<{ valid: boolean; missing: string[] }> {
  const doc = await readDocxDocument(buffer);
  const haystack = [
    ...doc.paragraphs.map(p => p.text),
    ...doc.tables.flatMap(t => t.rows.flatMap(r => r.map(c => c.text)))
  ].join('\n');
  const missing = expectations.filter(e => !haystack.includes(e));
  return { valid: missing.length === 0, missing };
}

export { paragraphText };
