import { ControlItem, GeneratedDocument, EvidenceRecord } from '../types';

/**
 * Standard baseline crosswalk between ISO/IEC 27001:2022 Annex A controls
 * and standard organizational policies, procedures, and registers.
 */
export const ISO27001_POLICY_TAXONOMY_MAP: Record<string, string[]> = {
  // A.5 Organizational Controls
  'A.5.1': ['POL-ISMS-01'],
  'A.5.2': ['POL-ISMS-01', 'REG-AST-02'],
  'A.5.3': ['POL-ISMS-01', 'POL-ACC-02'],
  'A.5.4': ['POL-ISMS-01', 'POL-ACC-02'],
  'A.5.5': ['POL-ISMS-01'],
  'A.5.6': ['POL-ISMS-01'],
  'A.5.7': ['POL-ISMS-01', 'SOP-INC-02'],
  'A.5.8': ['POL-ISMS-01'],
  'A.5.9': ['REG-AST-02', 'POL-USE-03'],
  'A.5.10': ['POL-USE-03', 'REG-AST-02'],
  'A.5.11': ['POL-USE-03', 'SOP-DAT-06'],
  'A.5.12': ['SOP-DAT-06', 'POL-ISMS-01'],
  'A.5.13': ['SOP-DAT-06', 'POL-USE-03'],
  'A.5.14': ['SOP-DAT-06', 'POL-ACC-02'],
  'A.5.15': ['POL-ACC-02'],
  'A.5.16': ['POL-ACC-02'],
  'A.5.17': ['POL-ACC-02'],
  'A.5.18': ['POL-ACC-02'],
  'A.5.19': ['POL-SUP-04'],
  'A.5.20': ['POL-SUP-04'],
  'A.5.21': ['POL-SUP-04'],
  'A.5.22': ['POL-SUP-04'],
  'A.5.23': ['POL-ISMS-01', 'POL-SUP-04'],
  'A.5.24': ['SOP-INC-02'],
  'A.5.25': ['SOP-INC-02'],
  'A.5.26': ['SOP-INC-02'],
  'A.5.27': ['SOP-INC-02'],
  'A.5.28': ['SOP-INC-02'],
  'A.5.29': ['POL-BCP-05'],
  'A.5.30': ['POL-BCP-05'],
  'A.5.31': ['POL-ISMS-01'],
  'A.5.32': ['POL-ISMS-01', 'POL-USE-03'],
  'A.5.33': ['SOP-DAT-06'],
  'A.5.34': ['SOP-DAT-06'],
  'A.5.35': ['SOP-AUD-04'],
  'A.5.36': ['SOP-AUD-04', 'POL-ISMS-01'],
  'A.5.37': ['SOP-CHG-03', 'POL-ISMS-01'],

  // A.6 People Controls
  'A.6.1': ['POL-USE-03'],
  'A.6.2': ['POL-USE-03'],
  'A.6.3': ['POL-ISMS-01', 'POL-USE-03'],
  'A.6.4': ['POL-USE-03'],
  'A.6.5': ['POL-USE-03', 'POL-ACC-02'],
  'A.6.6': ['POL-ISMS-01', 'POL-USE-03'],
  'A.6.7': ['POL-USE-03', 'POL-ACC-02'],
  'A.6.8': ['SOP-INC-02', 'POL-USE-03'],

  // A.7 Physical Controls
  'A.7.1': ['POL-ISMS-01', 'POL-ACC-02'],
  'A.7.2': ['POL-ACC-02'],
  'A.7.3': ['POL-ISMS-01'],
  'A.7.4': ['POL-ISMS-01'],
  'A.7.5': ['POL-USE-03'],
  'A.7.6': ['POL-USE-03'],
  'A.7.7': ['POL-USE-03'],
  'A.7.8': ['POL-USE-03', 'REG-AST-02'],
  'A.7.9': ['REG-AST-02', 'POL-USE-03'],
  'A.7.10': ['POL-USE-03', 'SOP-DAT-06'],
  'A.7.11': ['POL-BCP-05'],
  'A.7.12': ['POL-ISMS-01'],
  'A.7.13': ['REG-AST-02', 'POL-USE-03'],
  'A.7.14': ['REG-AST-02', 'SOP-DAT-06'],

  // A.8 Technological Controls
  'A.8.1': ['POL-USE-03', 'REG-AST-02'],
  'A.8.2': ['POL-ACC-02'],
  'A.8.3': ['POL-ACC-02'],
  'A.8.4': ['POL-ACC-02'],
  'A.8.5': ['POL-ACC-02'],
  'A.8.6': ['POL-ACC-02'],
  'A.8.7': ['POL-ISMS-01'],
  'A.8.8': ['POL-ISMS-01', 'SOP-CHG-03'],
  'A.8.9': ['POL-ISMS-01', 'SOP-CHG-03'],
  'A.8.10': ['SOP-DAT-06'],
  'A.8.11': ['SOP-DAT-06'],
  'A.8.12': ['SOP-DAT-06'],
  'A.8.13': ['POL-BCP-05', 'REG-AST-02'],
  'A.8.14': ['POL-BCP-05'],
  'A.8.15': ['SOP-INC-02', 'POL-ISMS-01'],
  'A.8.16': ['SOP-INC-02'],
  'A.8.17': ['POL-ISMS-01'],
  'A.8.18': ['POL-ACC-02'],
  'A.8.19': ['POL-ISMS-01'],
  'A.8.20': ['POL-ISMS-01', 'POL-ACC-02'],
  'A.8.21': ['POL-SUP-04', 'POL-ISMS-01'],
  'A.8.22': ['POL-ISMS-01'],
  'A.8.23': ['POL-ISMS-01'],
  'A.8.24': ['POL-ISMS-01', 'POL-ACC-02'],
  'A.8.25': ['POL-ISMS-01', 'SOP-CHG-03'],
  'A.8.26': ['POL-ISMS-01', 'SOP-CHG-03'],
  'A.8.27': ['POL-ISMS-01', 'SOP-CHG-03'],
  'A.8.28': ['POL-ISMS-01', 'SOP-CHG-03'],
  'A.8.29': ['POL-ISMS-01', 'SOP-CHG-03'],
  'A.8.30': ['POL-SUP-04', 'SOP-CHG-03'],
  'A.8.31': ['POL-ISMS-01', 'SOP-CHG-03'],
  'A.8.32': ['SOP-CHG-03'],
  'A.8.33': ['POL-ISMS-01', 'SOP-AUD-04'],
  'A.8.34': ['SOP-AUD-04']
};

/**
 * Resolve mapped internal policies for a given control
 */
export function getMappedPoliciesForControl(
  control: ControlItem,
  allDocs: GeneratedDocument[]
): GeneratedDocument[] {
  const explicitCodesOrIds = new Set(control.mappedPolicyIds || []);

  // If explicit mappings exist, resolve them
  if (explicitCodesOrIds.size > 0) {
    return allDocs.filter(
      doc => explicitCodesOrIds.has(doc.id) || explicitCodesOrIds.has(doc.docCode)
    );
  }

  // If no explicit mapping was saved yet, check authoritative baseline taxonomy
  const baselineCodes = ISO27001_POLICY_TAXONOMY_MAP[control.controlCode] || [];
  if (baselineCodes.length > 0) {
    return allDocs.filter(doc => baselineCodes.includes(doc.docCode));
  }

  return [];
}

/**
 * Resolve mapped evidence records for a given control
 */
export function getMappedEvidenceForControl(
  control: ControlItem,
  allEvidence: EvidenceRecord[]
): EvidenceRecord[] {
  const explicitIds = new Set(control.mappedEvidenceIds || []);

  return allEvidence.filter(evd => {
    // Explicitly mapped by ID
    if (explicitIds.has(evd.id)) return true;
    // Or natively uploaded targeting this control code
    if (evd.controlCode === control.controlCode) return true;
    return false;
  });
}

export type ControlArtifactReadinessStatus =
  | 'AUDIT_READY' // Both policy and verified evidence mapped
  | 'EVIDENCE_PENDING' // Policy mapped, evidence present but pending review
  | 'POLICY_ONLY' // Policy mapped, no evidence
  | 'EVIDENCE_ONLY' // Evidence mapped, no policy
  | 'NO_ARTIFACTS'; // Missing both policy and evidence

export interface ControlArtifactReadiness {
  status: ControlArtifactReadinessStatus;
  readinessScore: number; // 0 to 100
  mappedPolicies: GeneratedDocument[];
  mappedEvidence: EvidenceRecord[];
  verifiedEvidenceCount: number;
  totalEvidenceCount: number;
  hasPublishedPolicy: boolean;
  auditorCitation: string;
}

/**
 * Calculate the audit readiness for a control based on its mapped policies and evidence
 */
export function calculateControlArtifactReadiness(
  control: ControlItem,
  allDocs: GeneratedDocument[],
  allEvidence: EvidenceRecord[]
): ControlArtifactReadiness {
  const mappedPolicies = getMappedPoliciesForControl(control, allDocs);
  const mappedEvidence = getMappedEvidenceForControl(control, allEvidence);

  const hasPublishedPolicy = mappedPolicies.some(
    p => p.status === 'PUBLISHED' || p.status === 'LOCKED' || p.status === 'APPROVED'
  );
  const totalEvidenceCount = mappedEvidence.length;
  const verifiedEvidenceCount = mappedEvidence.filter(
    e => e.status === 'Verified' || e.verificationState === 'Verified'
  ).length;

  let status: ControlArtifactReadinessStatus = 'NO_ARTIFACTS';
  let readinessScore = 0;

  if (mappedPolicies.length > 0 && verifiedEvidenceCount > 0) {
    status = 'AUDIT_READY';
    readinessScore = 100;
  } else if (mappedPolicies.length > 0 && totalEvidenceCount > 0) {
    status = 'EVIDENCE_PENDING';
    readinessScore = 75;
  } else if (mappedPolicies.length > 0 && totalEvidenceCount === 0) {
    status = 'POLICY_ONLY';
    readinessScore = 50;
  } else if (mappedPolicies.length === 0 && totalEvidenceCount > 0) {
    status = 'EVIDENCE_ONLY';
    readinessScore = 40;
  } else {
    status = 'NO_ARTIFACTS';
    readinessScore = 0;
  }

  // Generate formal ISO 19011 auditor citation string
  const policyRef = mappedPolicies.length > 0
    ? mappedPolicies.map(p => `[${p.docCode}: ${p.title} (${p.version})]`).join(', ')
    : 'No internal policy codified';

  const evidenceRef = mappedEvidence.length > 0
    ? `${mappedEvidence.length} artifact(s) (${verifiedEvidenceCount} verified)`
    : 'Zero operational evidence records attached';

  const auditorCitation = `ISO/IEC 27001:2022 Control ${control.controlCode} (${control.title}) — Governed under: ${policyRef}. Verification trail: ${evidenceRef}.`;

  return {
    status,
    readinessScore,
    mappedPolicies,
    mappedEvidence,
    verifiedEvidenceCount,
    totalEvidenceCount,
    hasPublishedPolicy,
    auditorCitation
  };
}

/**
 * Intelligent recommendation engine for matching policies to a control
 */
export function getRecommendedPoliciesForControl(
  control: ControlItem,
  allDocs: GeneratedDocument[]
): Array<{ doc: GeneratedDocument; confidence: 'HIGH' | 'MEDIUM' | 'LOW'; rationale: string }> {
  const recommendations: Array<{
    doc: GeneratedDocument;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    rationale: string;
  }> = [];

  const taxonomyCodes = ISO27001_POLICY_TAXONOMY_MAP[control.controlCode] || [];
  const ctrlWords = `${control.title} ${control.description || ''} ${control.guidance || ''}`
    .toLowerCase()
    .split(/\W+/)
    .filter(w => w.length > 3);

  allDocs.forEach(doc => {
    // Exact taxonomy crosswalk match
    if (taxonomyCodes.includes(doc.docCode)) {
      recommendations.push({
        doc,
        confidence: 'HIGH',
        rationale: `Standard ISO 27001:2022 crosswalk requirement for ${control.controlCode}.`
      });
      return;
    }

    // Keyword matching
    const docText = `${doc.title} ${doc.category} ${doc.docCode}`.toLowerCase();
    const matchCount = ctrlWords.filter(w => docText.includes(w)).length;

    if (matchCount >= 2) {
      recommendations.push({
        doc,
        confidence: 'MEDIUM',
        rationale: `High contextual relevance based on title and category keywords.`
      });
    }
  });

  return recommendations;
}
