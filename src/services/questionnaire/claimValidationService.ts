// ============================================================================
// SKANDA QUESTIONNAIRE INTELLIGENCE: CLAIM VALIDATION
// Path: src/services/questionnaire/claimValidationService.ts
//
// Breaks material statements into individual verifiable claims and classifies
// each against the retrieved evidence using quality, scope, freshness and
// reliability signals.
//
// Enforced invariants:
//  - a numerical confidence score can never override a contradicted or
//    unsupported claim (see `hasCriticalUnsupportedClaim`)
//  - a policy document alone yields SUPPORTED_BY_POLICY_ONLY, never "verified"
//  - expired evidence yields EXPIRED_OR_STALE and triggers revalidation
// ============================================================================

import {
  AnswerableClaim,
  ClaimSupportState,
  ClaimValidationResult,
  EvidenceCitation,
  ValidatedClaim
} from '../../types/questionnaireIntelligenceTypes.js';
import {
  KnowledgeSourceRecord,
  LoadedKnowledge,
  assessFreshness,
  isDocumentOnlySource
} from './evidenceRetrievalService.js';
import { normalizeForMatching } from './ooxml/xmlUtils.js';

export interface ContradictionSignal {
  code: string;
  detail: string;
  controlCode?: string;
  sourceIds: string[];
  /** Categories of claim this signal contradicts. */
  appliesTo: 'IMPLEMENTATION' | 'EFFECTIVENESS' | 'CERTIFICATION' | 'PRACTICE';
}

const STATE_SEVERITY: Record<ClaimSupportState, number> = {
  SUPPORTED_BY_CURRENT_EVIDENCE: 0,
  SUPPORTED_BY_APPROVED_FACT: 1,
  SUPPORTED_BY_POLICY_ONLY: 3,
  PARTIALLY_SUPPORTED: 4,
  AWAITING_HUMAN_VERIFICATION: 5,
  OUTSIDE_AVAILABLE_SCOPE: 6,
  EXPIRED_OR_STALE: 7,
  UNSUPPORTED: 8,
  CONTRADICTED_BY_EVIDENCE: 9
};

function worstOf(states: ClaimSupportState[]): ClaimSupportState {
  if (states.length === 0) return 'UNSUPPORTED';
  return states.reduce((worst, current) =>
    STATE_SEVERITY[current] > STATE_SEVERITY[worst] ? current : worst
  );
}

const NEGATIVE_IMPLEMENTATION_STATES = ['NOT_IMPLEMENTED', 'PLANNED', 'DEFERRED', 'REJECTED'];
const PARTIAL_IMPLEMENTATION_STATES = ['PARTIALLY_IMPLEMENTED', 'PARTIAL', 'IN_PROGRESS'];

export class ClaimValidationService {
  private static instance: ClaimValidationService;

  public static getInstance(): ClaimValidationService {
    if (!ClaimValidationService.instance) {
      ClaimValidationService.instance = new ClaimValidationService();
    }
    return ClaimValidationService.instance;
  }

  /**
   * Detects contradictions in the tenant's own records for the controls that a
   * question is about. This is what prevents a policy from being presented as
   * proof that a control operates.
   */
  public detectContradictions(params: {
    knowledge: LoadedKnowledge;
    controlCodes: string[];
    citations: EvidenceCitation[];
    asOf: string;
  }): ContradictionSignal[] {
    const signals: ContradictionSignal[] = [];
    const seen = new Set<string>();
    const controlSet = new Set(params.controlCodes);

    const push = (signal: ContradictionSignal) => {
      const key = `${signal.code}::${signal.controlCode || 'none'}::${signal.sourceIds.join(',')}`;
      if (seen.has(key)) return;
      seen.add(key);
      signals.push(signal);
    };

    for (const record of params.knowledge.records) {
      const attrs = record.attributes || {};
      const relevant = !record.controlCode || controlSet.size === 0 || controlSet.has(record.controlCode);
      if (!relevant) continue;

      if (record.sourceType === 'CONTROL_IMPLEMENTATION') {
        const status = String(attrs.implementationStatus || '').toUpperCase();
        if (NEGATIVE_IMPLEMENTATION_STATES.includes(status)) {
          push({
            code: 'CONTROL_NOT_IMPLEMENTED',
            detail: `Canonical control ${record.controlCode || '(unmapped)'} is recorded as "${status}" for this tenant.`,
            controlCode: record.controlCode,
            sourceIds: [record.sourceId],
            appliesTo: 'IMPLEMENTATION'
          });
        }
        const effectiveness = String(attrs.effectivenessRating || '').toUpperCase();
        if (effectiveness === 'DEFICIENT') {
          push({
            code: 'CONTROL_RATED_DEFICIENT',
            detail: `Canonical control ${record.controlCode || '(unmapped)'} is rated DEFICIENT.`,
            controlCode: record.controlCode,
            sourceIds: [record.sourceId],
            appliesTo: 'EFFECTIVENESS'
          });
        }
      }

      if (record.sourceType === 'CONTROL_TEST_RESULT') {
        const result = String(attrs.testResult || '').toUpperCase();
        const effectiveness = String(attrs.effectiveness || '').toUpperCase();
        if (result === 'FAIL' || effectiveness === 'DEFICIENT' || effectiveness === 'INEFFECTIVE') {
          push({
            code: 'CONTROL_TEST_FAILED',
            detail: `Control test ${record.sourceId} for control ${
              record.controlCode || '(unmapped)'
            } recorded result ${result || effectiveness}.`,
            controlCode: record.controlCode,
            sourceIds: [record.sourceId],
            appliesTo: 'EFFECTIVENESS'
          });
        }
      }

      if (record.sourceType === 'FINDING') {
        const status = String(attrs.status || '').toUpperCase();
        const severity = String(attrs.severity || '').toUpperCase();
        if (!['CLOSED', 'VERIFIED_CLOSED', 'RESOLVED'].includes(status) && ['CRITICAL', 'HIGH'].includes(severity)) {
          push({
            code: 'OPEN_HIGH_SEVERITY_FINDING',
            detail: `Open ${severity} finding "${record.sourceTitle}" affects ${
              record.controlCode || 'the in-scope area'
            } and has not been closed.`,
            controlCode: record.controlCode,
            sourceIds: [record.sourceId],
            appliesTo: 'EFFECTIVENESS'
          });
        }
      }

      if (record.sourceType === 'APPROVED_ORGANIZATIONAL_FACT') {
        const value = attrs.value;
        const negates = value === false || value === 'false' || value === 'no' || value === 'NO';
        if (negates && attrs.affectsClaimCode) {
          push({
            code: 'APPROVED_FACT_NEGATES_CLAIM',
            detail: `Approved organizational fact "${record.sourceTitle}" states the claim is false.`,
            controlCode: record.controlCode,
            sourceIds: [record.sourceId],
            appliesTo: String(attrs.affectsClaimCode) as ContradictionSignal['appliesTo']
          });
        }
      }

      if (record.sourceType === 'CONTROL_TEST_RESULT' || record.sourceType === 'EVIDENCE_ASSERTION') {
        const assertionStatus = String(attrs.assertionStatus || '').toUpperCase();
        if (['REFUTED', 'CONTRADICTED', 'FAILED'].includes(assertionStatus)) {
          push({
            code: 'EVIDENCE_ASSERTION_REFUTED',
            detail: `Evidence assertion ${record.sourceId} is recorded as ${assertionStatus}.`,
            controlCode: record.controlCode,
            sourceIds: [record.sourceId],
            appliesTo: 'EFFECTIVENESS'
          });
        }
      }
    }

    // Conflict between records describing the same control differently.
    const byControl = new Map<string, KnowledgeSourceRecord[]>();
    for (const record of params.knowledge.records) {
      if (!record.controlCode) continue;
      if (!byControl.has(record.controlCode)) byControl.set(record.controlCode, []);
      byControl.get(record.controlCode)!.push(record);
    }
    for (const [controlCode, records] of byControl.entries()) {
      if (controlSet.size > 0 && !controlSet.has(controlCode)) continue;
      const policies = records.filter(r => r.sourceType === 'APPROVED_POLICY' || r.sourceType === 'SECURITY_STANDARD');
      const implementations = records.filter(r => r.sourceType === 'CONTROL_IMPLEMENTATION');
      const planned = implementations.filter(r =>
        PARTIAL_IMPLEMENTATION_STATES.includes(String((r.attributes || {}).implementationStatus || '').toUpperCase())
      );
      if (policies.length > 0 && planned.length > 0) {
        push({
          code: 'POLICY_VS_PARTIAL_IMPLEMENTATION_CONFLICT',
          detail: `Policies/standards describe control ${controlCode} as mandated, but the tenant implementation is recorded as ${
            (planned[0].attributes || {}).implementationStatus
          }. A policy is not proof of implementation.`,
          controlCode,
          sourceIds: [policies[0].sourceId, planned[0].sourceId],
          appliesTo: 'IMPLEMENTATION'
        });
      }
      const unapproved = policies.filter(r => !/^(APPROVED|PUBLISHED|EFFECTIVE)$/i.test(r.sourceStatus));
      if (unapproved.length > 0) {
        push({
          code: 'UNAPPROVED_POLICY_REFERENCED',
          detail: `Document "${unapproved[0].sourceTitle}" for control ${controlCode} is in status ${unapproved[0].sourceStatus} and cannot support a customer-facing claim.`,
          controlCode,
          sourceIds: [unapproved[0].sourceId],
          appliesTo: 'PRACTICE'
        });
      }
    }

    return signals;
  }

  /**
   * Validates each answerable claim of a question against the retrieved
   * citations and detected contradictions.
   */
  public validateClaims(params: {
    claims: AnswerableClaim[];
    citations: EvidenceCitation[];
    contradictions: ContradictionSignal[];
    requiredEvidenceKinds: string[];
    queryScope: string[];
    asOf: string;
    relevantControlCodes: string[];
  }): ClaimValidationResult {
    const validated: ValidatedClaim[] = [];

    for (const claim of params.claims) {
      const controlSet = new Set(params.relevantControlCodes);
      const claimTokens = new Set(
        normalizeForMatching(claim.claimText)
          .split(' ')
          .filter(t => t.length > 3)
      );

      // Contradictions that touch this claim's control(s) or material class.
      const claimContradictions = params.contradictions.filter(signal => {
        if (signal.controlCode && controlSet.size > 0 && !controlSet.has(signal.controlCode)) {
          // Still surface certification/practice contradictions regardless of mapping.
          return signal.appliesTo === 'CERTIFICATION' || signal.appliesTo === 'PRACTICE';
        }
        return true;
      });

      // Citations relevant to this claim. When the question has a single claim,
      // all citations apply; multi-part questions are matched on evidence kind
      // and control metadata so a claim never borrows unrelated evidence.
      const relevantCitations =
        params.claims.length === 1
          ? params.citations
          : params.citations.filter(citation => {
              const hay = normalizeForMatching(
                `${citation.sourceTitle} ${citation.excerpt} ${citation.applicableControlCode || ''}`
              );
              let hits = 0;
              for (const token of claimTokens) if (hay.includes(token)) hits++;
              return hits >= 2;
            });

      const primaryVerified = relevantCitations.filter(
        c => c.provesOperatingEffectiveness && c.sourceReliability === 'PRIMARY_VERIFIED' && c.freshnessStatus !== 'EXPIRED'
      );
      const operatingEvidence = relevantCitations.filter(
        c => c.provesOperatingEffectiveness && c.freshnessStatus !== 'EXPIRED' && c.freshnessStatus !== 'STALE'
      );
      const documentOnly = relevantCitations.filter(c => isDocumentOnlySource(c.sourceType));
      const approvedDocuments = documentOnly.filter(c => /^(APPROVED|PUBLISHED|EFFECTIVE)$/i.test(c.sourceStatus));
      const approvedFacts = relevantCitations.filter(
        c => c.sourceType === 'APPROVED_ORGANIZATIONAL_FACT' && /^(APPROVED|VERIFIED)$/i.test(c.sourceStatus)
      );
      const expired = relevantCitations.filter(c => c.freshnessStatus === 'EXPIRED');
      const stale = relevantCitations.filter(c => c.freshnessStatus === 'STALE');
      const outsideScope = relevantCitations.filter(c => c.organizationalScope.length > 0 && params.queryScope.length > 0 && !this.scopeMatches(c.organizationalScope, params.queryScope));
      const inScope = relevantCitations.filter(c => !outsideScope.includes(c));

      const supporting: string[] = [];
      const contradicting: string[] = claimContradictions.map(s => s.sourceIds[0]).filter(Boolean);
      const missing: string[] = [];
      const explanationParts: string[] = [];

      let state: ClaimSupportState;

      if (claimContradictions.length > 0) {
        state = 'CONTRADICTED_BY_EVIDENCE';
        for (const signal of claimContradictions) explanationParts.push(signal.detail);
      } else if (approvedFacts.length > 0) {
        state = 'SUPPORTED_BY_APPROVED_FACT';
        supporting.push(...approvedFacts.map(c => c.citationId));
        explanationParts.push(
          `Supported by approved organizational fact "${approvedFacts[0].sourceTitle}" (owner ${approvedFacts[0].evidenceOwner}).`
        );
      } else if (primaryVerified.length > 0 || operatingEvidence.length > 0) {
        const evidence = primaryVerified.length > 0 ? primaryVerified : operatingEvidence;
        state = 'SUPPORTED_BY_CURRENT_EVIDENCE';
        supporting.push(...evidence.map(c => c.citationId));
        explanationParts.push(
          `Supported by ${evidence.length} current source(s) that demonstrate the control operated, latest: "${evidence[0].sourceTitle}" (${evidence[0].sourceLocation}, collected ${evidence[0].collectedAt || 'date not recorded'}).`
        );
      } else if (claim.requiresOwnerConfirmation && approvedFacts.length === 0 && relevantCitations.length > 0) {
        // Awaiting owner confirmation is only meaningful when SOME relevant
        // material exists. With nothing retrieved at all the claim is simply
        // unsupported, and saying otherwise would overstate our knowledge.
        state = 'AWAITING_HUMAN_VERIFICATION';
        missing.push('Owner confirmation of the organizational fact');
        explanationParts.push(
          'This claim describes an organization-specific fact; no approved organizational fact record exists, so a human owner must confirm it before use.'
        );
      } else if (expired.length > 0 && operatingEvidence.length === 0) {
        state = 'EXPIRED_OR_STALE';
        missing.push('Current (non-expired) evidence');
        explanationParts.push(
          `The only supporting source(s) are expired (e.g. "${expired[0].sourceTitle}" expired ${
            expired[0].expiresAt || 'with no recorded date'
          }). Revalidation is required before this can be asserted.`
        );
      } else if (approvedDocuments.length > 0) {
        state = 'SUPPORTED_BY_POLICY_ONLY';
        supporting.push(...approvedDocuments.map(c => c.citationId));
        missing.push('Evidence demonstrating the control operated');
        explanationParts.push(
          `Only approved documentation supports this claim ("${approvedDocuments[0].sourceTitle}"). A policy or standard describes intent; it does not demonstrate that the control operated.`
        );
      } else if (inScope.length === 0 && outsideScope.length > 0) {
        state = 'OUTSIDE_AVAILABLE_SCOPE';
        missing.push('Evidence covering the organizational scope of this question');
        explanationParts.push(
          `All ${outsideScope.length} matching source(s) cover a different organizational scope than the question.`
        );
      } else if (stale.length > 0) {
        state = 'EXPIRED_OR_STALE';
        missing.push('Refreshed evidence within the freshness window');
        explanationParts.push(
          `Matching source(s) are older than the freshness window (e.g. collected ${stale[0].collectedAt}).`
        );
      } else if (relevantCitations.length > 0) {
        state = 'PARTIALLY_SUPPORTED';
        supporting.push(...relevantCitations.map(c => c.citationId));
        missing.push('Additional evidence to cover the full requirement');
        explanationParts.push(
          'Partial information was found, but it does not cover the full requirement being asserted.'
        );
      } else {
        state = 'UNSUPPORTED';
        missing.push(...params.requiredEvidenceKinds);
        explanationParts.push(
          'No authorised source in this tenant supports this claim. The required evidence must be collected before any answer is asserted.'
        );
      }

      validated.push({
        claimId: claim.claimId,
        claimText: claim.claimText,
        supportState: state,
        supportingCitationIds: Array.from(new Set(supporting)),
        contradictingCitationIds: Array.from(new Set(contradicting)),
        missingEvidence: missing,
        explanation: explanationParts.join(' ')
      });
    }

    const states = validated.map(v => v.supportState);
    return {
      claims: validated,
      hasCriticalUnsupportedClaim: validated.some(v =>
        ['UNSUPPORTED', 'CONTRADICTED_BY_EVIDENCE', 'EXPIRED_OR_STALE', 'OUTSIDE_AVAILABLE_SCOPE'].includes(v.supportState)
      ),
      hasContradiction: validated.some(v => v.supportState === 'CONTRADICTED_BY_EVIDENCE'),
      worstState: worstOf(states)
    };
  }

  private scopeMatches(recordScope: string[], queryScope: string[]): boolean {
    const lowerQuery = queryScope.map(s => s.toLowerCase());
    return recordScope.some(s => lowerQuery.includes(s.toLowerCase()) || s.toLowerCase() === 'global');
  }

  /** Convenience: freshness snapshot for a set of citations. */
  public summarizeFreshness(citations: EvidenceCitation[]): string {
    if (citations.length === 0) return 'No sources cited.';
    const counts = new Map<string, number>();
    for (const citation of citations) {
      counts.set(citation.freshnessStatus, (counts.get(citation.freshnessStatus) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([status, count]) => `${count} ${status}`)
      .join(', ');
  }

  public freshnessOf(collectedAt: string | undefined, expiresAt: string | undefined, asOf: string) {
    return assessFreshness(collectedAt, expiresAt, asOf);
  }
}

export const claimValidationService = ClaimValidationService.getInstance();
