import React from 'react';

interface CopilotMarkdownProps {
  content: string;
  onNavigateModule?: (moduleId: string) => void;
}

/**
 * CopilotMarkdown
 * Lightweight, high-fidelity GRC Markdown renderer.
 * Formats:
 * - Headings (### Title, ## Title)
 * - Markdown tables (| Col 1 | Col 2 |)
 * - Ordered & Unordered lists (- Item, 1. Item)
 * - Bold (**bold**) & Italic (*italic*)
 * - Inline Code / Control Badges (`A.5.15`, `Clause 6.1`)
 * - Blockquotes (> Quote)
 */
export const CopilotMarkdown: React.FC<CopilotMarkdownProps> = ({ content, onNavigateModule }) => {
  if (!content) return null;

  // Split content into blocks by double newlines or table boundaries
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // 1. Table Detection
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        // Parse header and rows
        const headers = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map(h => h.trim());
        
        // Skip separator row if present
        const hasSeparator = tableLines[1]?.includes('---');
        const rowStartIndex = hasSeparator ? 2 : 1;

        const rows = tableLines.slice(rowStartIndex).map(rowStr =>
          rowStr
            .split('|')
            .slice(1, -1)
            .map(c => c.trim())
        );

        elements.push(
          <div key={`table-${i}`} className="my-2.5 overflow-x-auto rounded-lg border border-slate-700/80 bg-slate-950/60">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-700/80">
                  {headers.map((h, hIdx) => (
                    <th key={hIdx} className="px-2.5 py-1.5 font-bold text-slate-300">
                      {formatInlineText(h, onNavigateModule)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-900/40">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-2.5 py-1.5 text-slate-300">
                        {formatInlineText(cell, onNavigateModule)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 2. Headings (###, ##, #)
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={`h3-${i}`} className="text-xs font-bold text-indigo-300 mt-2.5 mb-1 flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <span>{formatInlineText(line.replace(/^###\s+/, ''), onNavigateModule)}</span>
        </h4>
      );
      i++;
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={`h2-${i}`} className="text-xs font-black text-white mt-3 mb-1 border-b border-slate-800 pb-0.5">
          {formatInlineText(line.replace(/^##\s+/, ''), onNavigateModule)}
        </h3>
      );
      i++;
      continue;
    }

    // 3. Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <div key={`quote-${i}`} className="my-1.5 pl-3 border-l-2 border-indigo-400 text-[11px] italic text-indigo-200/90 bg-indigo-950/20 py-1 rounded-r">
          {formatInlineText(line.replace(/^>\s+/, ''), onNavigateModule)}
        </div>
      );
      i++;
      continue;
    }

    // 4. Bullet List (- or *)
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const bulletContent = line.trim().replace(/^[-*]\s+/, '');
      elements.push(
        <div key={`li-${i}`} className="flex items-start space-x-2 my-1 text-xs">
          <span className="text-indigo-400 font-bold shrink-0 mt-0.5 text-[10px]">◇</span>
          <span className="text-slate-200 leading-relaxed flex-1">
            {formatInlineText(bulletContent, onNavigateModule)}
          </span>
        </div>
      );
      i++;
      continue;
    }

    // 5. Numbered List (1. 2.)
    const numberedMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      const num = numberedMatch[1];
      const rest = numberedMatch[2];
      elements.push(
        <div key={`ol-${i}`} className="flex items-start space-x-2 my-1 text-xs">
          <span className="shrink-0 text-[10px] font-mono font-bold text-sky-400 bg-sky-950/80 border border-sky-800/60 rounded px-1.5 py-0.2 mt-0.5">
            {num}
          </span>
          <span className="text-slate-200 leading-relaxed flex-1">
            {formatInlineText(rest, onNavigateModule)}
          </span>
        </div>
      );
      i++;
      continue;
    }

    // 6. Regular paragraph or empty line
    if (line.trim() === '') {
      elements.push(<div key={`sp-${i}`} className="h-1.5" />);
    } else {
      elements.push(
        <p key={`p-${i}`} className="my-1 text-xs text-slate-200 leading-relaxed">
          {formatInlineText(line, onNavigateModule)}
        </p>
      );
    }

    i++;
  }

  return <div className="copilot-markdown space-y-0.5">{elements}</div>;
};

/**
 * Parses bold, italic, code pills, and GRC control identifiers into styled React nodes
 */
function formatInlineText(text: string, onNavigateModule?: (moduleId: string) => void): React.ReactNode {
  // Regex to split by bold (**text**), code (`code`), or italic (*text*)
  const tokens = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);

  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      const inner = token.slice(2, -2);
      return (
        <strong key={idx} className="font-bold text-white tracking-tight">
          {inner}
        </strong>
      );
    }

    if (token.startsWith('`') && token.endsWith('`')) {
      const code = token.slice(1, -1);
      return (
        <code
          key={idx}
          className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-indigo-950/90 text-indigo-300 border border-indigo-700/40"
        >
          {code}
        </code>
      );
    }

    if (token.startsWith('*') && token.endsWith('*')) {
      const inner = token.slice(1, -1);
      return (
        <em key={idx} className="italic text-indigo-200">
          {inner}
        </em>
      );
    }

    // Detect common GRC control references in regular text, e.g. A.5.15, A.8.8, Clause 6.1.2
    return <span key={idx}>{highlightControlRefs(token, onNavigateModule)}</span>;
  });
}

function highlightControlRefs(text: string, onNavigateModule?: (moduleId: string) => void): React.ReactNode {
  // Matches Annex A controls (e.g. A.5.15, A.8.24) or Clauses (Clause 6.1, Clause 9.2)
  const regex = /(A\.\d+\.\d+|Clause\s+\d+(\.\d+)*)/g;
  const parts = text.split(regex);

  if (parts.length === 1) return text;

  return parts.map((part, pIdx) => {
    if (!part) return null;
    if (part.match(/^A\.\d+\.\d+$/)) {
      return (
        <span
          key={pIdx}
          className="inline-flex items-center space-x-1 font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-950/80 text-sky-300 border border-indigo-800/60 cursor-pointer hover:border-sky-400 hover:text-white transition"
          title={`Click to view ISO 27001 Control ${part}`}
          onClick={() => onNavigateModule?.('requirements')}
        >
          <span>{part}</span>
        </span>
      );
    }
    if (part.startsWith('Clause ')) {
      return (
        <span
          key={pIdx}
          className="font-semibold text-indigo-300 font-mono text-[11px]"
        >
          {part}
        </span>
      );
    }
    return part;
  });
}
