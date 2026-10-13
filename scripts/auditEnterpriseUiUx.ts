/**
 * SKANDA Enterprise UI/UX Audit
 * ---------------------------------------------------------------------------
 * A re-runnable, deterministic audit of the frontend design system. It reports
 * measured facts (counts and ratios), not opinions:
 *
 *  1. Dead color utilities   — literal color/utility classes used in source that
 *                              Tailwind never emitted into the built stylesheet.
 *                              These are silent no-ops: the element renders with
 *                              whatever it inherits.
 *  2. Arbitrary hex colors   — colour literals written as `bg-[#0F172A]` instead of
 *                              a semantic token, with a per-file ranking.
 *  3. Unthemed literals      — color utilities in a class string that has no
 *                              `dark:` counterpart, so the element depends on the
 *                              global !important "healer" layer rather than a token.
 *  4. Contrast               — WCAG 2.2 contrast ratios for the semantic token
 *                              pairs in both themes, read out of src/index.css.
 *  5. Theme infrastructure   — FOUC guard, persistence, OS-change listener,
 *                              accessible switcher semantics.
 *
 * Run:  npx tsx scripts/auditEnterpriseUiUx.ts
 *       npx tsx scripts/auditEnterpriseUiUx.ts --json reports/uiux_audit.json
 *       npx tsx scripts/auditEnterpriseUiUx.ts --md docs/skanda_enterprise_uiux_audit.md
 *
 * The dead-utility check compares source against the newest built stylesheet, so
 * run `npm run build` first. If no built CSS is found the check reports
 * SKIPPED rather than passing.
 */
import fs from 'fs';
import path from 'path';

// Repository root. `tsx` loads this file as an ES module, so __dirname is not
// defined; the audit is always run from the project root.
const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');

const COLOR_FAMILIES = [
  'slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow',
  'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet',
  'purple', 'fuchsia', 'pink', 'rose'
];
const COLOR_UTILITY_PREFIXES = [
  'bg', 'text', 'border', 'ring', 'from', 'via', 'to', 'divide', 'outline', 'shadow',
  'fill', 'stroke', 'decoration', 'accent', 'caret', 'placeholder'
];
const SEMANTIC_UTILITIES = [
  // existing token classes
  'skanda-primary', 'skanda-secondary', 'skanda-card', 'skanda-elevated', 'skanda-border',
  'skanda-text-primary', 'skanda-text-secondary', 'skanda-text-muted', 'skanda-text-disabled',
  // semantic layer added by this initiative
  'app', 'surface', 'surface-2', 'elevated', 'ink', 'ink-2', 'ink-3', 'ink-disabled',
  'stroke', 'stroke-subtle', 'stroke-strong', 'accent-wash'
];

const PALETTE_SHADES = new Set([
  '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'
]);

/**
 * A token is only treated as a class name when it cannot have leaked out of JSX
 * markup. Apostrophes in visible text (`Don't`, `user's`) make a naive literal
 * scanner swallow the surrounding markup, which produced tokens like
 * `text-slate-400">`. Those are rejected here instead of being reported as
 * missing stylesheet classes.
 */
function isValidClassToken(token: string): boolean {
  if (!token || token.length > 120) return false;
  if (/["'<>=&\\]/.test(token)) return false;
  if (!/^[A-Za-z0-9[\]#%./:_-]+(?:\[[^\]]*\])?[A-Za-z0-9\]#%./:_-]*$/.test(token)) return false;
  if (!/^[A-Za-z]/.test(token) && !/^-\./.test(token) && !/^!/.test(token)) return false;
  return true;
}

function isColourClassToken(token: string): boolean {
  return new RegExp(`^(?:${COLOR_UTILITY_PREFIXES.join('|')})-`).test(baseUtility(token));
}

/** Strips leading Tailwind variants so `hover:bg-slate-750` is inspected as `bg-slate-750`. */
function baseUtility(token: string): string {
  const match = token.match(/^((?:[a-z0-9-]+|\[[^\]]*\]):)+(.+)$/);
  return match ? match[2] : token;
}

const args = process.argv.slice(2);
function argValue(flag: string): string | undefined {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
}

// ---------------------------------------------------------------------------
// Source inventory
// ---------------------------------------------------------------------------
function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(tsx|ts)$/.test(entry.name)) out.push(full);
  }
  return out;
}

interface FileFacts {
  rel: string;
  hexUtilities: number;
  arbitraryHexTokens: string[];
  themeConditionals: number;
  classStrings: string[];
  totalColorUtilities: number;
}

const HEX_UTILITY_RE = new RegExp(
  `\\b(?:${COLOR_UTILITY_PREFIXES.join('|')})-\\[#([0-9A-Fa-f]{3,8})\\](?:\\/\\d{1,3})?`,
  'g'
);
const LITERAL_PALETTE_RE = new RegExp(
  `\\b(?:${COLOR_UTILITY_PREFIXES.join('|')})-(?:${COLOR_FAMILIES.join('|')})-(\\d{2,3})\\b`,
  'g'
);

/**
 * Extracts JS/TS string literals in a single linear pass. A regex with a lazy
 * quantifier was measurably O(n^2) on the largest components (it never finished
 * on this repository), so the scanner walks characters and skips comments,
 * escape sequences and `${...}` interpolation bodies instead.
 */
function extractStringLiterals(text: string): string[] {
  const out: string[] = [];
  const n = text.length;
  let i = 0;
  while (i < n) {
    const c = text[i];
    if (c === '"' || c === "'" || c === '`') {
      const quote = c;
      let j = i + 1;
      let buf = '';
      while (j < n) {
        const ch = text[j];
        if (ch === '\\') {
          buf += text[j + 1] ?? '';
          j += 2;
          continue;
        }
        if (ch === quote) break;
        if (quote === '`' && ch === '$' && text[j + 1] === '{') {
          buf += ' ';
          j += 2;
          let depth = 1;
          while (j < n && depth > 0) {
            const inner = text[j];
            if (inner === '{') depth += 1;
            else if (inner === '}') depth -= 1;
            else if (inner === '`' || inner === '"' || inner === "'") {
              const innerQuote = inner;
              j += 1;
              while (j < n) {
                if (text[j] === '\\') { j += 2; continue; }
                if (text[j] === innerQuote) break;
                j += 1;
              }
            }
            j += 1;
          }
          continue;
        }
        buf += ch;
        j += 1;
      }
      out.push(buf);
      i = j + 1;
      continue;
    }
    if (c === '/' && text[i + 1] === '/') {
      while (i < n && text[i] !== '\n') i += 1;
      continue;
    }
    if (c === '/' && text[i + 1] === '*') {
      i += 2;
      while (i < n && !(text[i] === '*' && text[i + 1] === '/')) i += 1;
      i += 2;
      continue;
    }
    i += 1;
  }
  return out;
}

function collect(files: string[]): { facts: FileFacts[]; allClasses: Set<string> } {
  const facts: FileFacts[] = [];
  const allClasses = new Set<string>();

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');

    // Class-string heuristic: any literal that looks like a class list.
    const classStrings: string[] = [];
    for (const body of extractStringLiterals(text)) {
      if (!body || body.length < 2) continue;
      if (!/(^|[\s:])(bg|text|border|ring|flex|grid|px|py|gap|rounded|shadow|w-|h-|font)-/.test(body)) continue;
      const tokens = body.split(/\s+/).map(t => t.trim()).filter(Boolean);
      const valid = tokens.filter(isValidClassToken);
      // A string literal only counts as a class string when most of its tokens are
      // real class names; otherwise it is prose or markup that merely contains one.
      if (valid.length === 0 || valid.length / tokens.length < 0.6) continue;
      classStrings.push(valid.join(' '));
      for (const t of valid) {
        if (isColourClassToken(t)) allClasses.add(t);
      }
    }

    const hexMatches = text.match(new RegExp(HEX_UTILITY_RE.source, 'g')) || [];
    const arbitraryHexTokens = Array.from(
      new Set(hexMatches.map(h => h.replace(/^[a-z]+-/, '#')))
    ).sort();

    facts.push({
      rel,
      hexUtilities: hexMatches.length,
      arbitraryHexTokens,
      themeConditionals: (text.match(/dark:/g) || []).length,
      classStrings,
      totalColorUtilities: hexMatches.length + (text.match(new RegExp(LITERAL_PALETTE_RE.source, 'g')) || []).length
    });
  }

  return { facts, allClasses };
}

// ---------------------------------------------------------------------------
// 1. Dead utilities (source classes that the built CSS never defines)
// ---------------------------------------------------------------------------
interface DeadUtility {
  className: string;
  files: string[];
  occurrences: number;
}

function newestBuiltCss(): string | undefined {
  const dir = path.join(ROOT, 'dist', 'assets');
  if (!fs.existsSync(dir)) return undefined;
  const candidates = fs.readdirSync(dir).filter(f => f.endsWith('.css'));
  if (candidates.length === 0) return undefined;
  const withTime = candidates.map(f => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs }));
  withTime.sort((a, b) => b.t - a.t);
  return path.join(dir, withTime[0].f);
}

function findDeadUtilities(facts: FileFacts[], allClasses: Set<string>) {
  const cssPath = newestBuiltCss();
  if (!cssPath) {
    return { cssPath: undefined as string | undefined, dead: [] as DeadUtility[], checkedCount: 0, emittedClassCount: 0 };
  }
  // Tailwind escapes class selectors (`bg-\[\#0F172A\]`, `dark\:bg-white`). Build the
  // set of emitted class names once by unescaping every class selector, so the
  // per-token check is a hash lookup rather than a scan of the whole stylesheet.
  const css = fs.readFileSync(cssPath, 'utf8');
  const emittedClasses = new Set<string>();
  const selectorRe = /\.((?:\\.|[^\s{},:>+~()\[\]'"=|])+)/g;
  let selectorMatch: RegExpExecArray | null;
  while ((selectorMatch = selectorRe.exec(css)) !== null) {
    emittedClasses.add(selectorMatch[1].replace(/\\/g, ''));
  }

  const usage = new Map<string, { files: Set<string>; n: number }>();
  for (const fact of facts) {
    for (const cls of fact.classStrings) {
      for (const token of cls.split(/\s+/)) {
        if (!allClasses.has(token)) continue;
        const entry = usage.get(token) || { files: new Set<string>(), n: 0 };
        entry.files.add(fact.rel);
        entry.n += 1;
        usage.set(token, entry);
      }
    }
  }

  const dead: DeadUtility[] = [];
  for (const [token, info] of usage) {
    // Only judge tokens with a colour component: a missing layout utility is
    // frequently intentional (arbitrary-value variants, dynamic composition).
    const isColourToken =
      /-(?:\[#|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d)/.test(token) ||
      /-(?:skanda-|app$|surface|elevated|ink|stroke|accent-wash|success|warning|danger|critical|info)/.test(token);
    if (!isColourToken) continue;
    if (emittedClasses.has(token)) continue;
    dead.push({ className: token, files: Array.from(info.files).sort(), occurrences: info.n });
  }
  dead.sort((a, b) => b.occurrences - a.occurrences);

  // Sanity guard: a selector parse that failed would make the emitted set tiny and
  // every token would look dead. Report the parse size so a wrong result is visible.
  return { cssPath, dead, checkedCount: usage.size, emittedClassCount: emittedClasses.size };
}

// ---------------------------------------------------------------------------
// 2. Unthemed literals (colour class string without any dark: counterpart)
// ---------------------------------------------------------------------------
interface UnthemedFile { rel: string; strings: number; samples: string[] }

function findUnthemedLiterals(facts: FileFacts[]) {
  const byFile: UnthemedFile[] = [];
  let totalStrings = 0;

  for (const fact of facts) {
    if (fact.themeConditionals > 0 && fact.classStrings.length === 0) continue;
    let count = 0;
    const samples: string[] = [];
    for (const cls of fact.classStrings) {
      if (cls.includes('dark:')) continue;
      // A class string with no theme conditional that still paints a literal colour.
      const paintsLiteral =
        /(?:bg|text|border|ring|divide|fill|stroke|from|via|to)-(?:white|black|\[#|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d)/.test(cls);
      if (!paintsLiteral) continue;
      count += 1;
      if (samples.length < 3) samples.push(cls.trim().slice(0, 110));
    }
    if (count > 0) {
      totalStrings += count;
      byFile.push({ rel: fact.rel, strings: count, samples });
    }
  }

  byFile.sort((a, b) => b.strings - a.strings);
  return { byFile, totalStrings };
}

// ---------------------------------------------------------------------------
// 3. Contrast (WCAG 2.2 relative luminance)
// ---------------------------------------------------------------------------
interface Rgb { r: number; g: number; b: number }

function parseHex(value: string): Rgb | undefined {
  let hex = value.trim().replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  if (hex.length === 8) hex = hex.slice(0, 6);
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return undefined;
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16)
  };
}

function relativeLuminance({ r, g, b }: Rgb): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(fg: Rgb, bg: Rgb): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Extracts `--token: <hex|var()>` declarations per theme. Multiple token blocks
 * exist in index.css (a legacy block and the current one); the LAST declaration
 * on the most specific selector wins, which is what a browser would compute, so
 * later declarations are allowed to overwrite earlier ones.
 */
/**
 * Classifies a rule's selector list as a theme root, or rejects it. Surface-scoped
 * overrides (`.theme-light .dark-surface`, `:root:not(.theme-light) .text-slate-400`)
 * are deliberately rejected: they restyle one component, so folding them into the
 * theme map would report a token value that no page actually computes.
 */
function themeRootKind(selector: string): 'light' | 'dark' | undefined {
  const part = /^(:root|html|body)?(\.(dark|light|theme-light|theme-midnight))*(\[data-theme="(light|midnight|dark)"\])?$/;
  const hasRootMarker = /:root|html|body|^\.[a-z]|^\[data-theme/;
  const parts = selector.split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length === 0) return undefined;
  let kind: 'light' | 'dark' | undefined;
  for (const candidate of parts) {
    if (/\s/.test(candidate)) return undefined;
    if (!hasRootMarker.test(candidate)) return undefined;
    if (!part.test(candidate)) return undefined;
    const candidateKind: 'light' | 'dark' = /dark|midnight/.test(candidate) ? 'dark' : 'light';
    if (kind && kind !== candidateKind) return undefined;
    kind = candidateKind;
  }
  return kind;
}

function parseTokenBlocks(css: string) {
  const light = new Map<string, string>();
  const dark = new Map<string, string>();

  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const blockRe = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(stripped)) !== null) {
    // At-rules (`@import`, `@theme`, `@layer`, `@custom-variant`) have no brace of
    // their own, so the captured selector starts with them; the real selector is
    // whatever follows the last statement terminator.
    const rawSelector = m[1];
    const selector = (rawSelector.includes('@') ? rawSelector.slice(rawSelector.lastIndexOf(';') + 1) : rawSelector).trim();
    const kind = themeRootKind(selector);
    if (!kind) continue;

    const declRe = /(--[A-Za-z0-9-]+)\s*:\s*([^;]+);/g;
    let d: RegExpExecArray | null;
    while ((d = declRe.exec(m[2])) !== null) {
      const value = d[2].replace(/!important/gi, '').trim();
      (kind === 'dark' ? dark : light).set(d[1], value);
    }
  }
  return { light, dark };
}

interface ContrastFinding {
  label: string;
  fgToken: string;
  bgToken: string;
  ratio: number;
  passesAA: boolean;
  passesAALarge: boolean;
  exemption?: string;
}

function resolveToken(map: Map<string, string>, token: string, depth = 0): Rgb | undefined {
  if (depth > 6) return undefined;
  const raw = map.get(token);
  if (!raw) return undefined;
  const value = raw.trim();
  if (value.startsWith('#')) return parseHex(value);
  const varMatch = value.match(/^var\(\s*(--[A-Za-z0-9-]+)/);
  if (varMatch) return resolveToken(map, varMatch[1], depth + 1);
  return undefined;
}

const CONTRAST_PAIRS: Array<{ label: string; fg: string; bg: string; large?: boolean }> = [
  { label: 'Primary text on app canvas', fg: '--text-primary', bg: '--background' },
  { label: 'Primary text on surface', fg: '--text-primary', bg: '--surface' },
  { label: 'Primary text on card', fg: '--text-primary', bg: '--card-bg' },
  { label: 'Secondary text on surface', fg: '--text-secondary', bg: '--surface' },
  { label: 'Muted text on surface', fg: '--text-secondary', bg: '--card-bg' },
  { label: 'Tertiary text on card', fg: '--card-text-tertiary', bg: '--card-bg' },
  { label: 'Disabled text on card', fg: '--text-disabled', bg: '--card-bg' },
  { label: 'Accent on surface', fg: '--accent-primary', bg: '--surface' },
  { label: 'Accent on app canvas', fg: '--accent-primary', bg: '--background' },
  { label: 'Success on card', fg: '--success', bg: '--card-bg' },
  { label: 'Warning on card', fg: '--warning', bg: '--card-bg' },
  { label: 'Danger on card', fg: '--danger', bg: '--card-bg' },
  { label: 'Critical on card', fg: '--critical', bg: '--card-bg' },
  { label: 'Info on card', fg: '--info', bg: '--card-bg' },
  { label: 'Sidebar text on sidebar', fg: '--skanda-text-primary', bg: '--skanda-bg-sidebar' },
  { label: 'Sidebar muted on sidebar', fg: '--skanda-text-muted', bg: '--skanda-bg-sidebar' }
];

function auditContrast(css: string) {
  const { light, dark } = parseTokenBlocks(css);
  const report: { theme: string; findings: ContrastFinding[]; failures: number; largeTextOnly: number; evaluated: number }[] = [];

  for (const [theme, map] of [['light', light], ['dark', dark]] as const) {
    const findings: ContrastFinding[] = [];
    for (const pair of CONTRAST_PAIRS) {
      const fg = resolveToken(map, pair.fg);
      const bg = resolveToken(map, pair.bg);
      if (!fg || !bg) continue;
      const ratio = contrastRatio(fg, bg);
      // SC 1.4.3 exempts inactive (disabled) controls, so those pairs are reported
      // but never counted as failures.
      const exemption = pair.label.startsWith('Disabled') ? 'disabled-control' : undefined;
      findings.push({
        label: pair.label,
        fgToken: pair.fg,
        bgToken: pair.bg,
        ratio: Math.round(ratio * 100) / 100,
        passesAA: ratio >= 4.5 || Boolean(exemption),
        passesAALarge: ratio >= 3 || Boolean(exemption),
        exemption
      });
    }
    report.push({
      theme,
      findings,
      failures: findings.filter(f => !f.passesAA && !f.passesAALarge && !f.exemption).length,
      largeTextOnly: findings.filter(f => !f.passesAA && f.passesAALarge && !f.exemption).length,
      evaluated: findings.length
    });
  }
  return report;
}

// ---------------------------------------------------------------------------
// 4. Theme infrastructure
// ---------------------------------------------------------------------------
function auditThemeInfra() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const context = fs.readFileSync(path.join(SRC, 'context', 'GRCContext.tsx'), 'utf8');
  const switcherPath = path.join(SRC, 'components', 'layout', 'ThemeSwitcher.tsx');
  const switcher = fs.existsSync(switcherPath) ? fs.readFileSync(switcherPath, 'utf8') : '';
  const css = fs.readFileSync(path.join(SRC, 'index.css'), 'utf8');

  return {
    foucGuardInlineScript: /grc_portal_theme_mode/.test(html) && /documentElement/.test(html),
    persistedKey: /grc_portal_theme_mode/.test(context),
    systemModeSupported: /prefers-color-scheme/.test(context),
    osChangeListener: /matchMedia\('\(prefers-color-scheme: dark\)'\)/.test(context) && /mediaQuery\.addEventListener\('change'/.test(context),
    crossTabSync: /addEventListener\('storage'/.test(context),
    transitionSuppression: /isThemeTransitioning/.test(context) && /isThemeTransitioning/.test(switcher),
    switcherHasRadiogroup: /role="radiogroup"/.test(switcher) && /aria-checked/.test(switcher),
    switcherHasVisibleLabels: /aria-label/.test(switcher),
    prefersReducedMotion: /prefers-reduced-motion/.test(css)
  };
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
function pct(n: number, d: number): string {
  return d === 0 ? 'n/a' : `${((n / d) * 100).toFixed(2)}%`;
}

function main() {
  const t0 = Date.now();
  const lap = (label: string) => process.stderr.write(`[audit] ${label}: ${Date.now() - t0}ms\n`);
  const files = walk(SRC);
  lap(`scanned ${files.length} source files`);
  const { facts, allClasses } = collect(files);
  lap('collected class strings');
  const dead = findDeadUtilities(facts, allClasses);
  lap('checked dead utilities');
  const unthemed = findUnthemedLiterals(facts);
  lap('checked unthemed literals');
  const css = fs.readFileSync(path.join(SRC, 'index.css'), 'utf8');
  const contrast = auditContrast(css);
  const infra = auditThemeInfra();

  const hexByFile = facts
    .filter(f => f.hexUtilities > 0)
    .sort((a, b) => b.hexUtilities - a.hexUtilities);
  const totalHex = facts.reduce((sum, f) => sum + f.hexUtilities, 0);
  const filesWithHex = hexByFile.length;
  const darkConditionalFiles = facts.filter(f => f.themeConditionals > 0).length;

  const result = {
    generatedAt: new Date().toISOString(),
    sourceFiles: files.length,
    filesUsingThemeConditionals: darkConditionalFiles,
    deadUtilities: {
      builtStylesheet: dead.cssPath ? path.relative(ROOT, dead.cssPath).replace(/\\/g, '/') : null,
      status: dead.cssPath ? 'CHECKED' : 'SKIPPED_NO_BUILD',
      emittedClassCount: dead.emittedClassCount,
      distinctTokens: dead.dead.length,
      occurrences: dead.dead.reduce((s, d) => s + d.occurrences, 0),
      worst: dead.dead.slice(0, 15)
    },
    arbitraryHexColors: {
      occurrences: totalHex,
      files: filesWithHex,
      worst: hexByFile.slice(0, 15).map(f => ({ file: f.rel, occurrences: f.hexUtilities }))
    },
    unthemedLiterals: {
      occurrences: unthemed.totalStrings,
      files: unthemed.byFile.length,
      worst: unthemed.byFile.slice(0, 12)
    },
    contrast,
    themeInfrastructure: infra
  };

  const lines: string[] = [];
  lines.push('# SKANDA Enterprise UI/UX Audit (measured)');
  lines.push('');
  lines.push(`Generated: ${result.generatedAt}`);
  lines.push('');
  lines.push(`Source files scanned: **${files.length}** (${darkConditionalFiles} contain \`dark:\` conditionals).`);
  lines.push('');
  lines.push('## 1. Design-token coverage');
  lines.push('');
  lines.push(`| Metric | Value |`);
  lines.push(`| --- | --- |`);
  lines.push(`| Arbitrary hex colour utilities (\`bg-[#0F172A]\`) | **${totalHex}** in **${filesWithHex}** files |`);
  lines.push(`| Colour class strings with no \`dark:\` counterpart | **${unthemed.totalStrings}** in **${unthemed.byFile.length}** files |`);
  lines.push(`| Dead colour utilities (used in source, absent from built CSS) | **${dead.dead.length}** distinct tokens, **${dead.dead.reduce((s, d) => s + d.occurrences, 0)}** occurrences |`);
  lines.push('');
  if (dead.cssPath) {
    lines.push(`Dead-utility check compared source against \`${path.relative(ROOT, dead.cssPath).replace(/\\/g, '/')}\` (${dead.emittedClassCount} class selectors parsed).`);
  } else {
    lines.push('Dead-utility check **SKIPPED**: no built stylesheet in `dist/assets`. Run `npm run build` first.');
  }
  lines.push('');
  if (dead.dead.length > 0) {
    lines.push('### 1.1 Dead colour utilities (silent no-ops)');
    lines.push('');
    lines.push('| Utility | Occurrences | Files |');
    lines.push('| --- | --- | --- |');
    for (const d of dead.dead.slice(0, 25)) {
      lines.push(`| \`${d.className}\` | ${d.occurrences} | ${d.files.length} |`);
    }
    lines.push('');
    lines.push('### 1.2 Worst files for arbitrary hex colours');
    lines.push('');
    lines.push('| File | Occurrences |');
    lines.push('| --- | --- |');
    for (const f of hexByFile.slice(0, 20)) lines.push(`| \`${f.rel}\` | ${f.hexUtilities} |`);
    lines.push('');
    lines.push('### 1.3 Worst files for colour strings without a `dark:` counterpart');
    lines.push('');
    for (const f of unthemed.byFile.slice(0, 10)) {
      lines.push(`- \`${f.rel}\` — ${f.strings}`);
      for (const s of f.samples) lines.push(`  - \`${s}\``);
    }
    lines.push('');
  }
  lines.push('## 2. Contrast (WCAG 2.2 AA)');
  lines.push('');
  for (const theme of contrast) {
    const failures = theme.findings.filter(f => !f.passesAA && !f.passesAALarge);
    const largeOnly = theme.findings.filter(f => !f.passesAA && f.passesAALarge);
    lines.push(`### ${theme.theme === 'light' ? 'Light' : 'Dark'} mode — ${failures.length} hard failure(s), ${largeOnly.length} large-text-only pair(s), ${theme.evaluated} pairs evaluated`);
    lines.push('');
    if (theme.findings.some(f => f.exemption)) {
      lines.push('Pairs marked EXEMPT are disabled-control text, which SC 1.4.3 excludes from the contrast minimum.');
    }
    lines.push('');
    lines.push('| Pair | Ratio | AA text (4.5) | AA large / UI (3.0) |');
    lines.push('| --- | --- | --- | --- |');
    for (const f of theme.findings) {
      const mark = f.exemption ? 'EXEMPT' : f.passesAA ? 'PASS' : 'FAIL';
      const largeMark = f.exemption ? 'EXEMPT' : f.passesAALarge ? 'PASS' : 'FAIL';
      lines.push(`| ${f.label} | ${f.ratio.toFixed(2)}:1 | ${mark} | ${largeMark} |`);
    }
    lines.push('');
  }
  lines.push('## 3. Theme infrastructure');
  lines.push('');
  lines.push('| Check | Result |');
  lines.push('| --- | --- |');
  for (const [k, v] of Object.entries(infra)) {
    lines.push(`| ${k} | ${v ? 'PRESENT' : 'MISSING'} |`);
  }
  lines.push('');

  const markdown = lines.join('\n');
  console.log(markdown);

  const jsonPath = argValue('--json');
  if (jsonPath) {
    const target = path.resolve(ROOT, jsonPath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, JSON.stringify(result, null, 2));
    console.log(`\nWrote ${path.relative(ROOT, target)}`);
  }
  const mdPath = argValue('--md');
  if (mdPath) {
    const target = path.resolve(ROOT, mdPath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, markdown);
    console.log(`Wrote ${path.relative(ROOT, target)}`);
  }

  const hardContrastFailures = contrast.reduce((s, t) => s + t.failures, 0);
  console.log(
    `\nSUMMARY dead_utilities=${dead.dead.length} arbitrary_hex=${totalHex} unthemed_literals=${unthemed.totalStrings} ` +
    `contrast_hard_failures=${hardContrastFailures} coverage=${pct(filesWithHex, files.length)}_of_files_with_hex`
  );
}

main();
