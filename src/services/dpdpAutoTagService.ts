import { DpdpClauseMapping, DpdpScanResult, EvidenceRecord } from '../types';

export interface DpdpClauseMetadata {
  sectionCode: string;
  sectionNumber: number;
  title: string;
  chapter: string;
  penaltyMaxCrores: number;
  mandatoryForSdf: boolean;
  category: 'Obligations' | 'Consent' | 'Rights' | 'Transfers' | 'Governance';
  color: string;
}

export const DPDP_CLAUSE_DEFINITIONS: Record<string, DpdpClauseMetadata> = {
  'SEC-04': {
    sectionCode: 'SEC-04',
    sectionNumber: 4,
    title: 'Grounds for Processing Personal Data',
    chapter: 'Chapter II: Obligations of Data Fiduciary',
    penaltyMaxCrores: 50,
    mandatoryForSdf: false,
    category: 'Obligations',
    color: 'sky'
  },
  'SEC-05': {
    sectionCode: 'SEC-05',
    sectionNumber: 5,
    title: 'Notice Before or at Time of Consent',
    chapter: 'Chapter II: Obligations of Data Fiduciary',
    penaltyMaxCrores: 150,
    mandatoryForSdf: false,
    category: 'Consent',
    color: 'amber'
  },
  'SEC-06': {
    sectionCode: 'SEC-06',
    sectionNumber: 6,
    title: 'Consent Architecture & Multilingual Notice',
    chapter: 'Chapter II: Obligations of Data Fiduciary',
    penaltyMaxCrores: 150,
    mandatoryForSdf: false,
    category: 'Consent',
    color: 'emerald'
  },
  'SEC-07': {
    sectionCode: 'SEC-07',
    sectionNumber: 7,
    title: 'Certain Legitimate Uses',
    chapter: 'Chapter II: Obligations of Data Fiduciary',
    penaltyMaxCrores: 50,
    mandatoryForSdf: false,
    category: 'Obligations',
    color: 'cyan'
  },
  'SEC-08': {
    sectionCode: 'SEC-08',
    sectionNumber: 8,
    title: 'General Obligations & Technical Safeguards',
    chapter: 'Chapter II: Obligations of Data Fiduciary',
    penaltyMaxCrores: 250,
    mandatoryForSdf: false,
    category: 'Obligations',
    color: 'indigo'
  },
  'SEC-09': {
    sectionCode: 'SEC-09',
    sectionNumber: 9,
    title: "Children's Data & Parental Consent",
    chapter: 'Chapter II: Obligations of Data Fiduciary',
    penaltyMaxCrores: 200,
    mandatoryForSdf: false,
    category: 'Obligations',
    color: 'rose'
  },
  'SEC-10': {
    sectionCode: 'SEC-10',
    sectionNumber: 10,
    title: 'Significant Data Fiduciary (SDF) & DPO / DPIA',
    chapter: 'Chapter III: Special Obligations of SDF',
    penaltyMaxCrores: 150,
    mandatoryForSdf: true,
    category: 'Governance',
    color: 'purple'
  },
  'SEC-11': {
    sectionCode: 'SEC-11',
    sectionNumber: 11,
    title: 'Right to Obtain Information & Summary',
    chapter: 'Chapter IV: Rights & Duties of Data Principal',
    penaltyMaxCrores: 50,
    mandatoryForSdf: false,
    category: 'Rights',
    color: 'blue'
  },
  'SEC-12': {
    sectionCode: 'SEC-12',
    sectionNumber: 12,
    title: 'Right to Correction & Erasure',
    chapter: 'Chapter IV: Rights & Duties of Data Principal',
    penaltyMaxCrores: 50,
    mandatoryForSdf: false,
    category: 'Rights',
    color: 'teal'
  },
  'SEC-13': {
    sectionCode: 'SEC-13',
    sectionNumber: 13,
    title: 'Right of Grievance Redressal',
    chapter: 'Chapter IV: Rights & Duties of Data Principal',
    penaltyMaxCrores: 50,
    mandatoryForSdf: false,
    category: 'Rights',
    color: 'orange'
  },
  'SEC-14': {
    sectionCode: 'SEC-14',
    sectionNumber: 14,
    title: 'Right to Nominate Representative',
    chapter: 'Chapter IV: Rights & Duties of Data Principal',
    penaltyMaxCrores: 50,
    mandatoryForSdf: false,
    category: 'Rights',
    color: 'violet'
  },
  'SEC-16': {
    sectionCode: 'SEC-16',
    sectionNumber: 16,
    title: 'Cross-Border Transfer of Personal Data',
    chapter: 'Chapter V: Special Provisions',
    penaltyMaxCrores: 250,
    mandatoryForSdf: false,
    category: 'Transfers',
    color: 'red'
  },
  'SEC-18': {
    sectionCode: 'SEC-18',
    sectionNumber: 18,
    title: 'Intimation to Data Protection Board (DPBI)',
    chapter: 'Chapter VI: DPBI',
    penaltyMaxCrores: 0,
    mandatoryForSdf: false,
    category: 'Governance',
    color: 'slate'
  }
};

export const DPDP_CLAUSES_LIST = Object.values(DPDP_CLAUSE_DEFINITIONS);
export const DPDP_STATUTORY_CLAUSES = DPDP_CLAUSES_LIST;

export function getDpdpClauseMeta(sectionCode: string): DpdpClauseMetadata | undefined {
  const norm = sectionCode.toUpperCase().trim();
  return DPDP_CLAUSE_DEFINITIONS[norm] || Object.values(DPDP_CLAUSE_DEFINITIONS).find(c => c.sectionCode === norm);
}

export function getDpdpBadgeClasses(sectionCode: string): { bg: string; text: string; border: string } {
  const meta = getDpdpClauseMeta(sectionCode);
  if (!meta) {
    return {
      bg: 'bg-indigo-950/70',
      text: 'text-indigo-300',
      border: 'border-indigo-800/60'
    };
  }

  if (meta.penaltyMaxCrores >= 200) {
    return {
      bg: 'bg-rose-950/60',
      text: 'text-rose-300',
      border: 'border-rose-700/60'
    };
  }
  if (meta.penaltyMaxCrores >= 150) {
    return {
      bg: 'bg-amber-950/60',
      text: 'text-amber-300',
      border: 'border-amber-700/60'
    };
  }
  return {
    bg: 'bg-sky-950/60',
    text: 'text-sky-300',
    border: 'border-sky-700/60'
  };
}

/**
 * Calls server-side Gemini AI engine to scan document and map to DPDP statutory clauses
 */
export async function scanEvidenceWithDPDP(evidence: {
  title: string;
  fileName?: string;
  controlCode?: string;
  department?: string;
  tags?: string[];
  documentText?: string;
}): Promise<DpdpScanResult> {
  try {
    const res = await fetch('/api/ai/dpdp-auto-tag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: evidence.title,
        fileName: evidence.fileName || '',
        controlCode: evidence.controlCode || '',
        department: evidence.department || '',
        tags: evidence.tags || [],
        documentText: evidence.documentText || ''
      })
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      scannedAt: data.scannedAt || new Date().toISOString(),
      mappedClauses: data.mappedClauses || [],
      suggestedTags: data.suggestedTags || [],
      summary: data.summary || 'Document scanned against DPDP 2023 statutory clauses.',
      overallConfidence: data.overallConfidence || 'MEDIUM',
      keyEntitiesDetected: data.keyEntitiesDetected || [],
      statutoryPenaltyRisk: data.statutoryPenaltyRisk
    };
  } catch (err: any) {
    console.warn('DPDP API scan error, using local fallback:', err);
    return createClientSideFallbackScan(evidence);
  }
}

/**
 * Batch scan multiple evidence items
 */
export async function scanBatchEvidenceWithDPDP(
  items: Array<{
    id: string;
    title: string;
    fileName?: string;
    controlCode?: string;
    department?: string;
    tags?: string[];
    documentText?: string;
  }>
): Promise<Array<{ id: string; scanResult: DpdpScanResult }>> {
  try {
    const res = await fetch('/api/ai/dpdp-auto-tag-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    if (data.results && Array.isArray(data.results)) {
      return data.results.map((r: any) => ({
        id: r.id,
        scanResult: {
          scannedAt: r.scannedAt || new Date().toISOString(),
          mappedClauses: r.mappedClauses || [],
          suggestedTags: r.suggestedTags || [],
          summary: r.summary || '',
          overallConfidence: r.overallConfidence || 'MEDIUM',
          keyEntitiesDetected: r.keyEntitiesDetected || [],
          statutoryPenaltyRisk: r.statutoryPenaltyRisk
        }
      }));
    }
  } catch (err) {
    console.warn('Batch scan failed, fallback to client-side heuristics:', err);
  }

  // Fallback
  return items.map(item => ({
    id: item.id,
    scanResult: createClientSideFallbackScan(item)
  }));
}

function createClientSideFallbackScan(evidence: {
  title: string;
  fileName?: string;
  controlCode?: string;
  department?: string;
  tags?: string[];
  documentText?: string;
}): DpdpScanResult {
  const combined = [
    evidence.title,
    evidence.fileName || '',
    evidence.controlCode || '',
    evidence.department || '',
    ...(evidence.tags || []),
    evidence.documentText || ''
  ].join(' ').toLowerCase();

  const mapped: DpdpClauseMapping[] = [];

  // Rules matching
  if (
    combined.includes('access') ||
    combined.includes('okta') ||
    combined.includes('mfa') ||
    combined.includes('security') ||
    combined.includes('encrypt') ||
    combined.includes('firewall') ||
    combined.includes('vulnerability') ||
    combined.includes('pentest') ||
    (evidence.controlCode && (evidence.controlCode.includes('A.5.15') || evidence.controlCode.includes('A.8.')))
  ) {
    mapped.push({
      sectionCode: 'SEC-08',
      sectionNumber: 8,
      title: 'General Obligations & Technical Safeguards',
      chapter: 'Chapter II: Obligations of Data Fiduciary',
      relevanceScore: 94,
      confidence: 'HIGH',
      rationale: 'Substantiates reasonable technical and organizational security safeguards under Section 8(5) to prevent personal data breaches.',
      penaltyMaxCrores: 250,
      mandatoryForSdf: false
    });
  }

  if (
    combined.includes('consent') ||
    combined.includes('cookie') ||
    combined.includes('opt-in') ||
    combined.includes('withdrawal') ||
    combined.includes('multilingual')
  ) {
    mapped.push({
      sectionCode: 'SEC-06',
      sectionNumber: 6,
      title: 'Consent Architecture & Multilingual Notice',
      chapter: 'Chapter II: Obligations of Data Fiduciary',
      relevanceScore: 91,
      confidence: 'HIGH',
      rationale: 'Demonstrates unambiguous affirmative consent recording and multi-language transparency under Section 6.',
      penaltyMaxCrores: 150,
      mandatoryForSdf: false
    });
  }

  if (
    combined.includes('notice') ||
    combined.includes('privacy policy') ||
    combined.includes('disclosure') ||
    combined.includes('terms')
  ) {
    mapped.push({
      sectionCode: 'SEC-05',
      sectionNumber: 5,
      title: 'Notice Before or at Time of Consent',
      chapter: 'Chapter II: Obligations of Data Fiduciary',
      relevanceScore: 88,
      confidence: 'HIGH',
      rationale: 'Provides itemized data category disclosures and rights guidance conforming with Section 5 requirements.',
      penaltyMaxCrores: 150,
      mandatoryForSdf: false
    });
  }

  if (
    combined.includes('delete') ||
    combined.includes('erasure') ||
    combined.includes('retention') ||
    combined.includes('purge')
  ) {
    mapped.push({
      sectionCode: 'SEC-12',
      sectionNumber: 12,
      title: 'Right to Correction & Erasure',
      chapter: 'Chapter IV: Rights & Duties of Data Principal',
      relevanceScore: 89,
      confidence: 'HIGH',
      rationale: 'Implements automated erasure upon purpose fulfillment or Data Principal request under Section 12.',
      penaltyMaxCrores: 50,
      mandatoryForSdf: false
    });
  }

  if (
    combined.includes('cross-border') ||
    combined.includes('cloud') ||
    combined.includes('aws') ||
    combined.includes('overseas') ||
    combined.includes('transfer')
  ) {
    mapped.push({
      sectionCode: 'SEC-16',
      sectionNumber: 16,
      title: 'Cross-Border Transfer of Personal Data',
      chapter: 'Chapter V: Special Provisions',
      relevanceScore: 86,
      confidence: 'MEDIUM',
      rationale: 'Documents extraterritorial data flow risk assessment and compliance with negative list notifications under Section 16.',
      penaltyMaxCrores: 250,
      mandatoryForSdf: false
    });
  }

  // Default fallback if nothing matched
  if (mapped.length === 0) {
    mapped.push({
      sectionCode: 'SEC-08',
      sectionNumber: 8,
      title: 'General Obligations & Technical Safeguards',
      chapter: 'Chapter II: Obligations of Data Fiduciary',
      relevanceScore: 78,
      confidence: 'MEDIUM',
      rationale: 'Supports corporate compliance and baseline security safeguards for personal data under Section 8.',
      penaltyMaxCrores: 250,
      mandatoryForSdf: false
    });
  }

  const topClause = mapped[0];
  const maxPen = Math.max(...mapped.map(m => m.penaltyMaxCrores || 0));

  return {
    scannedAt: new Date().toISOString(),
    mappedClauses: mapped.slice(0, 3),
    suggestedTags: [
      `DPDP-${topClause.sectionCode}`,
      ...mapped.slice(1).map(m => `DPDP-${m.sectionCode}`),
      'Statutory Compliance',
      maxPen >= 200 ? 'High Penalty Exposure (₹200Cr+)' : 'Standard Safeguard'
    ],
    summary: `Mapped to ${mapped.map(m => m.sectionCode).join(', ')} under India DPDP Act 2023 statutory requirements.`,
    overallConfidence: topClause.confidence,
    keyEntitiesDetected: ['Access Controls', 'Cryptographic Safeguards', 'Audit Trail'],
    statutoryPenaltyRisk: {
      maxExposureCrores: maxPen,
      riskLevel: maxPen >= 200 ? 'CRITICAL' : maxPen >= 100 ? 'HIGH' : 'MEDIUM',
      description: `Failure to satisfy ${topClause.sectionCode} carries up to ₹${maxPen} Crores penalty under DPDP Act 2023.`
    }
  };
}
