import {
  LiveTranscriptSegment,
  SegmentSentimentAnalysis,
  SegmentSentimentPosture,
  TranscriptEntity
} from '../types/meetingScheduler';

/**
 * Enterprise Audit & Compliance Sentiment Lexicon
 */
const POSITIVE_COMPLIANCE_PATTERNS: Array<{ pattern: RegExp; weight: number; label: string }> = [
  { pattern: /\b(zero static|no static credentials)\b/i, weight: 0.95, label: 'Zero static credentials policy' },
  { pattern: /\b(dynamically issued|short-lived sts|ephemeral token)\b/i, weight: 0.92, label: 'Dynamic credential rotation' },
  { pattern: /\b(kms envelope encryption|encrypted with kms|aes-256|cmk)\b/i, weight: 0.90, label: 'KMS envelope encryption' },
  { pattern: /\b(immutable states?|immutable image|immutable)\b/i, weight: 0.88, label: 'Immutable infrastructure' },
  { pattern: /\b(branch (protection )?rules|mandatory (peer )?reviews?)\b/i, weight: 0.86, label: 'Branch protection & code review' },
  { pattern: /\b(automated sast|automated scan|blocking pr merges|cvss score)\b/i, weight: 0.92, label: 'Automated SAST gating' },
  { pattern: /\b(hashicorp vault|secrets manager|cyberark)\b/i, weight: 0.82, label: 'Centralized secrets governance' },
  { pattern: /\b(multi-factor|mfa|hardware token|fido2)\b/i, weight: 0.90, label: 'MFA enforcement' },
  { pattern: /\b(formally recorded|timestamped|clause 7\.5|nda)\b/i, weight: 0.80, label: 'Documented consent & NDA' },
  { pattern: /\b(separation of (dev|development)|isolated vpc|network segregation)\b/i, weight: 0.85, label: 'Environment separation' },
  { pattern: /\b(daily snapshots?|replicated|multi-az|automated backup)\b/i, weight: 0.84, label: 'Resilience & automated backup' },
  { pattern: /\b(least privilege|rbac|role-based access)\b/i, weight: 0.88, label: 'Least privilege access control' }
];

const IDENTIFIED_RISK_PATTERNS: Array<{ pattern: RegExp; weight: number; label: string }> = [
  { pattern: /\b(unencrypted|without encryption|plain text|clear text)\b/i, weight: -0.95, label: 'Unencrypted data storage' },
  { pattern: /\b(lacked default|missing policy|no encryption policy)\b/i, weight: -0.92, label: 'Missing baseline policy' },
  { pattern: /\b(cve-\d{4}-\d+|buffer overflow|vulnerability|rce|sqli)\b/i, weight: -0.94, label: 'Known technical vulnerability' },
  { pattern: /\b(48-hour expiration instead of|exceeded sla|sla breach)\b/i, weight: -0.90, label: 'Credential SLA duration violation' },
  { pattern: /\b(bastion ssh keys maintained|hardcoded|embedded key)\b/i, weight: -0.88, label: 'Static key exposure risk' },
  { pattern: /\b(manual bypass|bypassed|bypassing controls?)\b/i, weight: -0.92, label: 'Control bypass' },
  { pattern: /\b(unpatched|outdated version|end-of-life|unsupported)\b/i, weight: -0.85, label: 'Unpatched software component' },
  { pattern: /\b(drift detected|access drift|unauthorized drift)\b/i, weight: -0.82, label: 'Configuration access drift' },
  { pattern: /\b(failed audit|non-compliance|major finding|deficiency)\b/i, weight: -0.90, label: 'Non-compliance finding' }
];

const CAUTION_UNCERTAINTY_PATTERNS: Array<{ pattern: RegExp; weight: number; label: string }> = [
  { pattern: /\b(sometimes|occasionally|manual process|ad-hoc)\b/i, weight: -0.35, label: 'Ad-hoc manual process' },
  { pattern: /\b(in progress|currently implementing|not yet fully|underway)\b/i, weight: -0.25, label: 'Work in progress / partial implementation' },
  { pattern: /\b(investigating|we need to check|unsure|to be confirmed)\b/i, weight: -0.40, label: 'Uncertainty / verification required' },
  { pattern: /\b(temporary exception|waiver granted|grace period)\b/i, weight: -0.45, label: 'Temporary policy waiver' },
  { pattern: /\b(delay|backlog|pending review|delayed)\b/i, weight: -0.30, label: 'Process delay or backlog' }
];

/**
 * Analyzes a single transcript segment for audit compliance sentiment and risk posture.
 */
export function analyzeSegmentSentiment(
  segment: LiveTranscriptSegment,
  entities: TranscriptEntity[] = []
): SegmentSentimentAnalysis {
  // If explicitly pre-assigned, return it
  if (segment.sentiment) {
    return segment.sentiment;
  }

  const text = segment.text;
  const isAuditor = segment.speakerRole.includes('Auditor');
  const triggers: string[] = [];

  let positiveScore = 0;
  let riskScore = 0;
  let cautionScore = 0;

  // Check positive compliance patterns
  for (const { pattern, weight, label } of POSITIVE_COMPLIANCE_PATTERNS) {
    if (pattern.test(text)) {
      positiveScore += weight;
      triggers.push(label);
    }
  }

  // Check identified risk patterns
  for (const { pattern, weight, label } of IDENTIFIED_RISK_PATTERNS) {
    if (pattern.test(text)) {
      riskScore += Math.abs(weight);
      triggers.push(label);
    }
  }

  // Check caution / uncertainty patterns
  for (const { pattern, weight, label } of CAUTION_UNCERTAINTY_PATTERNS) {
    if (pattern.test(text)) {
      cautionScore += Math.abs(weight);
      triggers.push(label);
    }
  }

  // Correlate with associated entities
  const segmentEntities = entities.filter(
    e => segment.entityIds.includes(e.id) || e.segmentId === segment.id
  );

  for (const ent of segmentEntities) {
    if (ent.type === 'Risk') {
      const riskWeight = ent.riskSeverity === 'CRITICAL' ? 1.0 : ent.riskSeverity === 'HIGH' ? 0.85 : 0.6;
      riskScore += riskWeight;
      triggers.push(`Associated Risk Entity: ${ent.name} [${ent.riskSeverity || 'HIGH'}]`);
    } else if (ent.type === 'Control' && ent.status === 'Verified') {
      positiveScore += 0.5;
      triggers.push(`Verified Control: ${ent.name}`);
    }
  }

  // Determine posture classification
  let posture: SegmentSentimentPosture = 'NEUTRAL_PROCEDURAL';
  let score = 0;
  let confidence = 0.85;
  let toneLabel: SegmentSentimentAnalysis['toneLabel'] = 'Procedural Neutral';
  let reasoning = 'Standard procedural discourse or audit inquiry.';

  if (riskScore > 0 && riskScore >= positiveScore) {
    posture = 'IDENTIFIED_RISK';
    score = -Math.min(1.0, 0.4 + riskScore * 0.4);
    confidence = Math.min(0.98, 0.8 + riskScore * 0.1);
    toneLabel = 'Identified Risk';
    reasoning = `Discloses technical vulnerability, SLA breach, or non-compliant configuration (${triggers.slice(0, 2).join(', ')}).`;
  } else if (cautionScore > 0 && cautionScore >= positiveScore && cautionScore > riskScore) {
    posture = 'CAUTION_UNCERTAINTY';
    score = -Math.min(0.5, 0.15 + cautionScore * 0.2);
    confidence = 0.82;
    toneLabel = 'Caution / Gap';
    reasoning = `Indicates partial rollout, manual reliance, or pending remediation verification (${triggers.slice(0, 2).join(', ')}).`;
  } else if (positiveScore > 0.4) {
    posture = 'POSITIVE_COMPLIANCE';
    score = Math.min(1.0, 0.35 + positiveScore * 0.4);
    confidence = Math.min(0.98, 0.82 + positiveScore * 0.08);
    toneLabel = 'Positive Compliance';
    reasoning = `Demonstrates verifiable control implementation, cryptographic security, or automated enforcement (${triggers.slice(0, 2).join(', ')}).`;
  } else if (isAuditor) {
    posture = 'NEUTRAL_PROCEDURAL';
    score = 0.05;
    confidence = 0.90;
    toneLabel = 'Procedural Neutral';
    reasoning = 'Lead auditor formal verification question and framework control boundary inquiry.';
  } else {
    posture = 'NEUTRAL_PROCEDURAL';
    score = 0.0;
    confidence = 0.80;
    toneLabel = 'Procedural Neutral';
    reasoning = 'General operational context without explicit control strength or risk breach.';
  }

  return {
    posture,
    score: parseFloat(score.toFixed(2)),
    confidence: parseFloat(confidence.toFixed(2)),
    toneLabel,
    reasoning,
    triggerKeywords: triggers.slice(0, 4)
  };
}

export interface MeetingSentimentMetrics {
  totalSegments: number;
  positiveCount: number;
  riskCount: number;
  cautionCount: number;
  neutralCount: number;
  positivePercent: number;
  riskPercent: number;
  cautionPercent: number;
  neutralPercent: number;
  averageScore: number;
  overallPosture: 'STRONG_COMPLIANCE' | 'ELEVATED_RISK' | 'CAUTIOUS_PROGRESS' | 'BALANCED_AUDIT';
  postureBadgeText: string;
  postureDescription: string;
}

/**
 * Calculates aggregate sentiment breakdown across all segments of a meeting.
 */
export function calculateMeetingSentimentMetrics(
  segments: LiveTranscriptSegment[],
  entities: TranscriptEntity[] = []
): MeetingSentimentMetrics {
  const totalSegments = segments.length;
  if (totalSegments === 0) {
    return {
      totalSegments: 0,
      positiveCount: 0,
      riskCount: 0,
      cautionCount: 0,
      neutralCount: 0,
      positivePercent: 0,
      riskPercent: 0,
      cautionPercent: 0,
      neutralPercent: 0,
      averageScore: 0,
      overallPosture: 'BALANCED_AUDIT',
      postureBadgeText: 'No Data',
      postureDescription: 'No segments recorded yet.'
    };
  }

  let positiveCount = 0;
  let riskCount = 0;
  let cautionCount = 0;
  let neutralCount = 0;
  let totalScore = 0;

  for (const seg of segments) {
    const analysis = analyzeSegmentSentiment(seg, entities);
    totalScore += analysis.score;
    if (analysis.posture === 'POSITIVE_COMPLIANCE') positiveCount++;
    else if (analysis.posture === 'IDENTIFIED_RISK') riskCount++;
    else if (analysis.posture === 'CAUTION_UNCERTAINTY') cautionCount++;
    else neutralCount++;
  }

  const positivePercent = Math.round((positiveCount / totalSegments) * 100);
  const riskPercent = Math.round((riskCount / totalSegments) * 100);
  const cautionPercent = Math.round((cautionCount / totalSegments) * 100);
  const neutralPercent = Math.round((neutralCount / totalSegments) * 100);
  const averageScore = parseFloat((totalScore / totalSegments).toFixed(2));

  let overallPosture: MeetingSentimentMetrics['overallPosture'] = 'BALANCED_AUDIT';
  let postureBadgeText = 'Balanced Audit';
  let postureDescription = 'Discussions reflect standard audit discovery with balanced control checks.';

  if (riskCount >= 2 || riskPercent >= 20) {
    overallPosture = 'ELEVATED_RISK';
    postureBadgeText = 'Elevated Risk Discovery';
    postureDescription = 'Multiple security vulnerabilities, configuration gaps, or policy exceptions disclosed.';
  } else if (positivePercent >= 50) {
    overallPosture = 'STRONG_COMPLIANCE';
    postureBadgeText = 'Positive Compliance Posture';
    postureDescription = 'Auditee demonstrated proactive control implementation and automated policy enforcement.';
  } else if (cautionPercent >= 25) {
    overallPosture = 'CAUTIOUS_PROGRESS';
    postureBadgeText = 'Cautious / Remediation Track';
    postureDescription = 'Multiple controls are in progressive rollout or require secondary verification.';
  }

  return {
    totalSegments,
    positiveCount,
    riskCount,
    cautionCount,
    neutralCount,
    positivePercent,
    riskPercent,
    cautionPercent,
    neutralPercent,
    averageScore,
    overallPosture,
    postureBadgeText,
    postureDescription
  };
}
