// Skanda BrandGuard — Defensive Domain Recommendation & Homoglyph Matrix Generator
// Generates permutations across Cyrillic/Greek homoglyphs, Punycode IDNs, QWERTY typos,
// combosquatting phishing vectors, and TLD expansions with defensive procurement scoring.

import { safeStorage } from '../../utils/safeStorage';

export interface HomoglyphSubstitution {
  original: string;
  substituted: string;
  unicodeHex?: string;
  originalChar?: string;
  replacementChar?: string;
  script?: string;
  unicodeCodepoint?: string;
}

export interface DefensiveDomainVariant {
  id: string;
  domain: string;
  punycode: string;
  technique: 'HOMOGLYPH' | 'TYPOSQUATTING' | 'COMBOSQUATTING' | 'TLD_VARIATION';
  deceptionScore: number; // 0 - 100
  similarityScore?: number; // 0 - 100
  homoglyphSubstitutions?: HomoglyphSubstitution[];
  defensivePriorityScore: number; // 0 - 100
  priorityTier: 'CRITICAL_DEFENSE' | 'RECOMMENDED' | 'LOW_RISK';
  registrationStatus: 'AVAILABLE_FOR_PURCHASE' | 'SQUATTED_ACTIVE' | 'SQUATTED_ACTIVE_THREAT' | 'SQUATTED_PARKED' | 'OWNED_BY_US' | 'OWNED_DEFENSIVE';
  estimatedAnnualFeeUSD: number;
  threatRationale: string;
  inProcurementCart: boolean;
  isMonitoredInCT: boolean;
}

// Cyrillic homoglyph mappings (visually indistinguishable in address bars)
const CYRILLIC_HOMOGLYPHS: Record<string, string> = {
  a: 'а', // U+0430
  c: 'с', // U+0441
  e: 'е', // U+0435
  i: 'і', // U+0456
  j: 'ј', // U+0458
  o: 'о', // U+043E
  p: 'р', // U+0440
  s: 'ѕ', // U+0455
  x: 'х', // U+0445
  y: 'у'  // U+0443
};

// Keyboard proximity typo table (QWERTY layout)
const KEYBOARD_NEIGHBORS: Record<string, string[]> = {
  a: ['q', 'w', 's', 'z'],
  b: ['v', 'g', 'h', 'n'],
  c: ['x', 'd', 'f', 'v'],
  d: ['s', 'e', 'r', 'f', 'c', 'x'],
  e: ['w', 's', 'd', 'r'],
  f: ['d', 'r', 't', 'g', 'v', 'c'],
  g: ['f', 't', 'y', 'h', 'b', 'v'],
  h: ['g', 'y', 'u', 'j', 'n', 'b'],
  i: ['u', 'j', 'k', 'o'],
  j: ['h', 'u', 'i', 'k', 'm', 'n'],
  k: ['j', 'i', 'o', 'l', 'm'],
  l: ['k', 'o', 'p'],
  m: ['n', 'j', 'k'],
  n: ['b', 'h', 'j', 'm'],
  o: ['i', 'k', 'l', 'p'],
  p: ['o', 'l'],
  q: ['w', 'a'],
  r: ['e', 'd', 'f', 't'],
  s: ['a', 'w', 'e', 'd', 'x', 'z'],
  t: ['r', 'f', 'g', 'y'],
  u: ['y', 'h', 'j', 'i'],
  v: ['c', 'f', 'g', 'b'],
  w: ['q', 'a', 's', 'e'],
  x: ['z', 's', 'd', 'c'],
  y: ['t', 'g', 'h', 'u'],
  z: ['a', 's', 'x']
};

const COMBOSQUAT_KEYWORDS = [
  'login',
  'verify',
  'portal',
  'security',
  'support',
  'auth',
  'invest',
  'account',
  'help',
  'app',
  'gateway'
];

const SECONDARY_TLDS = [
  { tld: '.co', fee: 24.99 },
  { tld: '.net', fee: 14.99 },
  { tld: '.org', fee: 13.99 },
  { tld: '.xyz', fee: 11.99 },
  { tld: '.io', fee: 39.99 },
  { tld: '.app', fee: 16.99 },
  { tld: '.security', fee: 19.99 },
  { tld: '.online', fee: 9.99 },
  { tld: '.top', fee: 7.99 },
  { tld: '.vip', fee: 18.99 }
];

export class BrandGuardHomoglyphService {
  private static cartStorageKey = 'skanda_brandguard_procurement_cart';

  public static getProcurementCart(): string[] {
    try {
      const stored = safeStorage.getItem(this.cartStorageKey);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  }

  public static toggleProcurementCart(domain: string): boolean {
    const current = this.getProcurementCart();
    let updated: string[];
    let isInCart = false;
    if (current.includes(domain)) {
      updated = current.filter(d => d !== domain);
      isInCart = false;
    } else {
      updated = [...current, domain];
      isInCart = true;
    }
    safeStorage.setItem(this.cartStorageKey, JSON.stringify(updated));
    return isInCart;
  }

  /**
   * Generates a comprehensive matrix of high-risk homoglyphs, typos, combos, and TLD variants
   */
  public static generateMatrix(baseDomain: string = 'apexfintech.com'): DefensiveDomainVariant[] {
    const parts = baseDomain.toLowerCase().split('.');
    const sld = parts[0] || 'apexfintech';
    const tld = parts.slice(1).join('.') || 'com';
    const cart = this.getProcurementCart();

    const variants: DefensiveDomainVariant[] = [];

    // 1. Homoglyphs (Cyrillic substitution with Punycode simulation)
    for (let i = 0; i < sld.length; i++) {
      const char = sld[i];
      if (CYRILLIC_HOMOGLYPHS[char]) {
        const sub = CYRILLIC_HOMOGLYPHS[char];
        const homoglyphSld = sld.slice(0, i) + sub + sld.slice(i + 1);
        const fullDomain = `${homoglyphSld}.${tld}`;
        const punycodeDomain = `xn--${sld.slice(0, i)}${sld.slice(i + 1)}-${char}8a.${tld}`;

        variants.push({
          id: `hg-${i}`,
          domain: fullDomain,
          punycode: punycodeDomain,
          technique: 'HOMOGLYPH',
          deceptionScore: 98,
          defensivePriorityScore: 94,
          priorityTier: 'CRITICAL_DEFENSE',
          registrationStatus: i === 1 ? 'SQUATTED_ACTIVE' : 'AVAILABLE_FOR_PURCHASE',
          estimatedAnnualFeeUSD: 14.99,
          threatRationale: `Visually indistinguishable Cyrillic letter "${sub}" (U+0${sub.charCodeAt(0).toString(16).toUpperCase()}) replaces Latin "${char}". Zero visual difference in standard browser fonts.`,
          inProcurementCart: cart.includes(fullDomain),
          isMonitoredInCT: true
        });
      }
    }

    // 2. Typosquatting (Omission, Doubling, Adjacent QWERTY)
    // A: Omission of each letter
    for (let i = 0; i < sld.length; i++) {
      if (sld.length > 4 && i > 0 && i < sld.length - 1) {
        const typo = sld.slice(0, i) + sld.slice(i + 1);
        const fullDomain = `${typo}.${tld}`;
        variants.push({
          id: `typo-om-${i}`,
          domain: fullDomain,
          punycode: fullDomain,
          technique: 'TYPOSQUATTING',
          deceptionScore: 84,
          defensivePriorityScore: 82,
          priorityTier: 'CRITICAL_DEFENSE',
          registrationStatus: 'AVAILABLE_FOR_PURCHASE',
          estimatedAnnualFeeUSD: 11.99,
          threatRationale: `Character omission: User accidentally omits "${sld[i]}" when typing fast into the browser URL bar.`,
          inProcurementCart: cart.includes(fullDomain),
          isMonitoredInCT: false
        });
      }
    }

    // B: Adjacent Keyboard Key Typos
    for (let i = 0; i < Math.min(sld.length, 6); i++) {
      const char = sld[i];
      const neighbors = KEYBOARD_NEIGHBORS[char];
      if (neighbors && neighbors.length > 0) {
        const neighbor = neighbors[0];
        const typo = sld.slice(0, i) + neighbor + sld.slice(i + 1);
        const fullDomain = `${typo}.${tld}`;
        variants.push({
          id: `typo-adj-${i}`,
          domain: fullDomain,
          punycode: fullDomain,
          technique: 'TYPOSQUATTING',
          deceptionScore: 78,
          defensivePriorityScore: 76,
          priorityTier: 'RECOMMENDED',
          registrationStatus: 'AVAILABLE_FOR_PURCHASE',
          estimatedAnnualFeeUSD: 12.99,
          threatRationale: `QWERTY adjacency: Attacker traps user typing adjacent key "${neighbor}" instead of "${char}".`,
          inProcurementCart: cart.includes(fullDomain),
          isMonitoredInCT: false
        });
      }
    }

    // 3. Combosquatting (Prefixes & Suffixes)
    COMBOSQUAT_KEYWORDS.forEach((kw, idx) => {
      const hyphenDomain = `${sld}-${kw}.${tld}`;
      const prefixDomain = `${kw}-${sld}.${tld}`;

      variants.push({
        id: `combo-suf-${idx}`,
        domain: hyphenDomain,
        punycode: hyphenDomain,
        technique: 'COMBOSQUATTING',
        deceptionScore: 92,
        defensivePriorityScore: 89,
        priorityTier: 'CRITICAL_DEFENSE',
        registrationStatus: kw === 'verify' || kw === 'login' ? 'SQUATTED_ACTIVE' : 'AVAILABLE_FOR_PURCHASE',
        estimatedAnnualFeeUSD: 12.99,
        threatRationale: `High-conviction phishing bait combining corporate brand with high-trust operational keyword "-${kw}".`,
        inProcurementCart: cart.includes(hyphenDomain),
        isMonitoredInCT: true
      });

      if (idx < 4) {
        variants.push({
          id: `combo-pre-${idx}`,
          domain: prefixDomain,
          punycode: prefixDomain,
          technique: 'COMBOSQUATTING',
          deceptionScore: 88,
          defensivePriorityScore: 85,
          priorityTier: 'RECOMMENDED',
          registrationStatus: 'AVAILABLE_FOR_PURCHASE',
          estimatedAnnualFeeUSD: 12.99,
          threatRationale: `Prefix brand impersonation ("${kw}-..."). Frequently used for spear-phishing internal employees.`,
          inProcurementCart: cart.includes(prefixDomain),
          isMonitoredInCT: false
        });
      }
    });

    // 4. Secondary TLD Variations
    SECONDARY_TLDS.forEach((item, idx) => {
      const fullDomain = `${sld}${item.tld}`;
      const isDangerousTld = ['.xyz', '.top', '.vip', '.online'].includes(item.tld);

      variants.push({
        id: `tld-${idx}`,
        domain: fullDomain,
        punycode: fullDomain,
        technique: 'TLD_VARIATION',
        deceptionScore: isDangerousTld ? 86 : 74,
        defensivePriorityScore: isDangerousTld ? 90 : 79,
        priorityTier: isDangerousTld ? 'CRITICAL_DEFENSE' : 'RECOMMENDED',
        registrationStatus: item.tld === '.vip' || item.tld === '.online' ? 'SQUATTED_ACTIVE' : 'AVAILABLE_FOR_PURCHASE',
        estimatedAnnualFeeUSD: item.fee,
        threatRationale: `TLD squatted counterpart: Malicious actors register popular alternate TLD ${item.tld} to harvest unsuspecting traffic.`,
        inProcurementCart: cart.includes(fullDomain),
        isMonitoredInCT: isDangerousTld
      });
    });

    return variants;
  }

  /**
   * Generates a CSV export of the defensive procurement list
   */
  public static exportProcurementCSV(variants: DefensiveDomainVariant[]): void {
    const headers = ['Domain', 'Punycode', 'Technique', 'Deception Score', 'Defensive Priority', 'Priority Tier', 'Registration Status', 'Estimated Cost (USD)', 'Threat Rationale'];
    const rows = variants.map(v => [
      v.domain,
      v.punycode,
      v.technique,
      v.deceptionScore,
      v.defensivePriorityScore,
      v.priorityTier,
      v.registrationStatus,
      `$${v.estimatedAnnualFeeUSD.toFixed(2)}`,
      `"${v.threatRationale.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BrandGuard_Defensive_Domain_Matrix_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
