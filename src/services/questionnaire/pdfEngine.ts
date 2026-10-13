// ============================================================================
// SKANDA QUESTIONNAIRE INTELLIGENCE: PDF ENGINE
// Path: src/services/questionnaire/pdfEngine.ts
//
// Capability limits are explicit and honest:
//
//  EXTRACTION supports text-based PDFs whose content streams use the standard
//  PDF text operators (Tj / TJ / ' / "). Compressed (FlateDecode) streams are
//  inflated with Node's zlib. Encrypted PDFs, image-only scans (no OCR engine
//  is available in this project) and CID fonts without a usable encoding are
//  reported as UNREADABLE rather than guessed at.
//
//  GENERATION produces a valid, minimal, uncompressed PDF containing the
//  questionnaire response table. It is a summary rendering, NOT a round-trip of
//  the original requested layout — that limitation is surfaced to the user.
// ============================================================================

import zlib from 'zlib';
import { unescapeXml } from './ooxml/xmlUtils.js';

export type PdfReadStatus = 'TEXT_EXTRACTED' | 'PARTIAL' | 'UNREADABLE' | 'ENCRYPTED';

export interface PdfPageText {
  pageNumber: number;
  text: string;
  lines: string[];
}

export interface PdfExtraction {
  status: PdfReadStatus;
  pageCount: number;
  pages: PdfPageText[];
  confidence: number;
  confidenceBand: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNREADABLE';
  warnings: string[];
}

function decodePdfLiteralString(raw: string): string {
  let out = '';
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === '\\') {
      const next = raw[i + 1];
      if (next === 'n') { out += '\n'; i++; continue; }
      if (next === 'r') { out += '\r'; i++; continue; }
      if (next === 't') { out += '\t'; i++; continue; }
      if (next === 'b') { out += '\b'; i++; continue; }
      if (next === 'f') { out += '\f'; i++; continue; }
      if (next === '(' || next === ')' || next === '\\') { out += next; i++; continue; }
      if (next === '\n') { i++; continue; }
      if (/[0-7]/.test(next || '')) {
        let octal = '';
        let j = i + 1;
        while (j < raw.length && octal.length < 3 && /[0-7]/.test(raw[j])) {
          octal += raw[j];
          j++;
        }
        out += String.fromCharCode(parseInt(octal, 8));
        i = j - 1;
        continue;
      }
      out += next || '';
      i++;
      continue;
    }
    out += ch;
  }
  return out;
}

/** Extracts the visible text from one decoded PDF content stream. */
export function extractTextFromContentStream(content: string): string {
  let out = '';
  // Text-showing operators.
  const operatorRe = /\(((?:\\.|[^\\()])*)\)\s*Tj|\[((?:[^\][]|\\.)*)\]\s*TJ|\bT\*|\bTd\b|\bTD\b|\bET\b/g;
  let match: RegExpExecArray | null;
  while ((match = operatorRe.exec(content)) !== null) {
    if (match[1] !== undefined) {
      out += decodePdfLiteralString(match[1]);
    } else if (match[2] !== undefined) {
      const arrayBody = match[2];
      const itemRe = /\(((?:\\.|[^\\()])*)\)/g;
      let item: RegExpExecArray | null;
      while ((item = itemRe.exec(arrayBody)) !== null) {
        out += decodePdfLiteralString(item[1]);
      }
    } else {
      out += '\n';
    }
  }
  return out;
}

function inflateIfPossible(bytes: Buffer): string | null {
  try {
    return zlib.inflateSync(bytes).toString('latin1');
  } catch {
    try {
      return zlib.inflateRawSync(bytes).toString('latin1');
    } catch {
      try {
        return zlib.unzipSync(bytes).toString('latin1');
      } catch {
        return null;
      }
    }
  }
}

export function extractPdfText(buffer: Buffer | Uint8Array): PdfExtraction {
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  const warnings: string[] = [];

  const head = buf.subarray(0, 8).toString('latin1');
  if (!head.startsWith('%PDF-')) {
    return {
      status: 'UNREADABLE',
      pageCount: 0,
      pages: [],
      confidence: 0,
      confidenceBand: 'UNREADABLE',
      warnings: ['File does not begin with the %PDF- header; it is not a PDF document.']
    };
  }

  const raw = buf.toString('latin1');

  if (/\/Encrypt\b/.test(raw)) {
    return {
      status: 'ENCRYPTED',
      pageCount: 0,
      pages: [],
      confidence: 0,
      confidenceBand: 'UNREADABLE',
      warnings: [
        'PDF is encrypted (/Encrypt present). No decryption key is available; text extraction is not attempted.'
      ]
    };
  }

  const pageCountMatches = raw.match(/\/Type\s*\/Page[^s]/g);
  const pageCount = pageCountMatches ? pageCountMatches.length : 0;

  // Split raw content into streams and decode those that look like text streams.
  const streams = splitStreams(buf);
  const pageTexts: string[] = [];
  let undecodedStreams = 0;

  for (const stream of streams) {
    let content: string | null = null;
    if (stream.declaresFlate) {
      content = inflateIfPossible(stream.bytes);
      if (content === null) undecodedStreams++;
    } else {
      content = stream.bytes.toString('latin1');
    }
    if (!content) continue;
    if (!/\b(Tj|TJ)\b/.test(content)) continue;
    const text = extractTextFromContentStream(content);
    if (text.trim().length > 0) pageTexts.push(text);
  }

  if (undecodedStreams > 0) {
    warnings.push(
      `${undecodedStreams} compressed stream(s) could not be inflated and were skipped.`
    );
  }

  const pages: PdfPageText[] = pageTexts.map((text, index) => ({
    pageNumber: index + 1,
    text,
    lines: text
      .split(/\n/)
      .map(l => l.replace(/\s+/g, ' ').trim())
      .filter(l => l.length > 0)
  }));

  if (pages.length === 0) {
    warnings.push(
      'No text objects were found. The document is likely a scanned image requiring OCR, which is not available in this environment.'
    );
    return {
      status: 'UNREADABLE',
      pageCount,
      pages: [],
      confidence: 0,
      confidenceBand: 'UNREADABLE',
      warnings
    };
  }

  if (pageCount > 0 && pages.length < pageCount) {
    warnings.push(
      `Only ${pages.length} of ${pageCount} declared page object(s) yielded text; extraction is partial.`
    );
  }

  // Heuristic confidence: presence of text on every declared page is a good sign;
  // gibberish (mostly non-printable / very low letter ratio) lowers confidence.
  const joined = pages.map(p => p.text).join('');
  const printable = joined.replace(/[^\x20-\x7E\u00A0-\u024F]/g, '').length;
  const ratio = joined.length > 0 ? printable / joined.length : 0;
  const coverage = pageCount > 0 ? pages.length / pageCount : 0.5;
  const confidence = Math.round(Math.max(0, Math.min(100, ratio * 70 + coverage * 30)));

  let band: PdfExtraction['confidenceBand'] = 'LOW';
  if (confidence >= 75) band = 'HIGH';
  else if (confidence >= 45) band = 'MEDIUM';

  if (ratio < 0.75) {
    warnings.push(
      'A significant portion of extracted characters were not printable; encoding/CID mapping may be missing so text may be garbled. Reviewer correction is required.'
    );
  }

  return {
    status: pageCount > 0 && pages.length < pageCount ? 'PARTIAL' : 'TEXT_EXTRACTED',
    pageCount,
    pages,
    confidence,
    confidenceBand: band,
    warnings
  };
}

interface RawStream {
  bytes: Buffer;
  declaresFlate: boolean;
}

function splitStreams(buf: Buffer): RawStream[] {
  const streams: RawStream[] = [];
  const marker = Buffer.from('stream');
  const endMarker = Buffer.from('endstream');
  let searchFrom = 0;

  while (searchFrom < buf.length) {
    const startIdx = buf.indexOf(marker, searchFrom);
    if (startIdx === -1) break;

    // The `stream` keyword must be followed by CRLF or LF.
    let dataStart = startIdx + marker.length;
    if (buf[dataStart] === 0x0d && buf[dataStart + 1] === 0x0a) dataStart += 2;
    else if (buf[dataStart] === 0x0a) dataStart += 1;
    else {
      searchFrom = startIdx + marker.length;
      continue;
    }

    const endIdx = buf.indexOf(endMarker, dataStart);
    if (endIdx === -1) break;

    let dataEnd = endIdx;
    if (buf[dataEnd - 1] === 0x0a) dataEnd -= 1;
    if (buf[dataEnd - 1] === 0x0d) dataEnd -= 1;

    // Look backwards for the dictionary of this object to detect /Filter.
    const dictWindow = buf.subarray(Math.max(0, startIdx - 800), startIdx).toString('latin1');
    const declaresFlate = /\/FlateDecode\b/.test(dictWindow) || /\/Fl\b/.test(dictWindow);

    streams.push({ bytes: buf.subarray(dataStart, dataEnd), declaresFlate });
    searchFrom = endIdx + endMarker.length;
  }

  return streams;
}

// ---------------------------------------------------------------------------
// MINIMAL PDF WRITER (summary rendering for export)
// ---------------------------------------------------------------------------

function pdfEscapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, '?');
}

function wrapText(value: string, maxChars: number): string[] {
  const words = unescapeXml(value).split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (current.length === 0) current = word;
    else if (`${current} ${word}`.length <= maxChars) current = `${current} ${word}`;
    else {
      lines.push(current);
      current = word;
    }
  }
  if (current.length > 0) lines.push(current);
  return lines.length > 0 ? lines : [''];
}

export interface PdfWriteRow {
  question: string;
  answer: string;
  status: string;
}

/**
 * Builds a valid, uncompressed PDF containing the response table.
 * Deterministic byte output for identical input (no timestamps inside).
 */
export function writeResponseSummaryPdf(params: {
  title: string;
  subtitle: string;
  rows: PdfWriteRow[];
}): Buffer {
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 48;
  const lineHeight = 13;
  const maxChars = 92;
  const usableHeight = pageHeight - margin * 2 - 60;
  const linesPerPage = Math.floor(usableHeight / lineHeight);

  interface Line { text: string; font: 'F1' | 'F2'; }
  const allLines: Line[] = [];
  allLines.push({ text: params.title, font: 'F2' });
  allLines.push({ text: params.subtitle, font: 'F1' });
  allLines.push({ text: '', font: 'F1' });

  for (const row of params.rows) {
    for (const l of wrapText(`Q: ${row.question}`, maxChars)) allLines.push({ text: l, font: 'F1' });
    for (const l of wrapText(`A: ${row.answer}`, maxChars)) allLines.push({ text: l, font: 'F1' });
    for (const l of wrapText(`Status: ${row.status}`, maxChars)) allLines.push({ text: l, font: 'F1' });
    allLines.push({ text: '', font: 'F1' });
  }

  const pages: Line[][] = [];
  for (let i = 0; i < allLines.length; i += linesPerPage) {
    pages.push(allLines.slice(i, i + linesPerPage));
  }
  if (pages.length === 0) pages.push([{ text: 'No content', font: 'F1' }]);

  const objects: string[] = [];
  const contentObjectNumbers: number[] = [];
  const pageObjectNumbers: number[] = [];

  // Object numbering plan:
  // 1 = Catalog, 2 = Pages, 3 = Font Helvetica, 4 = Font Helvetica-Bold,
  // then for each page: content stream + page object.
  let nextObject = 5;
  for (let i = 0; i < pages.length; i++) {
    contentObjectNumbers.push(nextObject++);
    pageObjectNumbers.push(nextObject++);
  }

  const pageRefs = pageObjectNumbers.map(n => `${n} 0 R`).join(' ');

  objects[1] = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  objects[2] = `2 0 obj\n<< /Type /Pages /Kids [${pageRefs}] /Count ${pages.length} >>\nendobj\n`;
  objects[3] = `3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n`;
  objects[4] = `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n`;

  for (let p = 0; p < pages.length; p++) {
    const contentNumber = contentObjectNumbers[p];
    const pageNumber = pageObjectNumbers[p];
    let y = pageHeight - margin;
    let ops = '';
    for (const line of pages[p]) {
      if (line.text.trim().length > 0) {
        ops += `BT /${line.font} 11 Tf ${margin} ${y} Td (${pdfEscapeText(line.text)}) Tj ET\n`;
      }
      y -= lineHeight;
    }
    ops += `BT /F1 9 Tf ${margin} 30 Td (Page ${p + 1} of ${pages.length} - SKANDA summary rendering) Tj ET\n`;

    const streamBuffer = Buffer.from(ops, 'latin1');
    objects[contentNumber] =
      `${contentNumber} 0 obj\n<< /Length ${streamBuffer.length} >>\nstream\n${ops}endstream\nendobj\n`;
    objects[pageNumber] =
      `${pageNumber} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] ` +
      `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentNumber} 0 R >>\nendobj\n`;
  }

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  const maxObject = nextObject - 1;
  for (let i = 1; i <= maxObject; i++) {
    offsets[i] = Buffer.byteLength(pdf, 'latin1');
    pdf += objects[i];
  }

  const xrefOffset = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${maxObject + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= maxObject; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${maxObject + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, 'latin1');
}
