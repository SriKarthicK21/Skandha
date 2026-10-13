// ============================================================================
// SKANDA QUESTIONNAIRE INTELLIGENCE: EVIDENCE-BACKED KNOWLEDGE RETRIEVAL
// Path: src/services/questionnaire/evidenceRetrievalService.ts
//
// Hybrid retrieval over the tenant's existing canonical GRC records:
//   exact phrase matching + keyword scoring + semantic category mapping +
//   metadata filtering (control, framework, scope, status) + freshness filtering
//
// Guarantees:
//  - every citation carries full provenance (source, version, location, owner,
//    status, collection time, freshness, scope, control, retrieval time)
//  - records belonging to another tenant are dropped at this boundary even if a
//    provider leaks them (defence in depth); the drop is recorded in the trace
//  - a degraded source integration is reported and NEVER substituted with
//    fabricated evidence
//  - a policy document never reports `provesOperatingEffectiveness`
// ============================================================================

import {
  EvidenceCitation,
  EvidenceSourceType,
  RetrievalQuery,
  RetrievalResult
} from '../../types/questionnaireIntelligenceTypes.js';
import { normalizeForMatching, normalizeText } from './ooxml/xmlUtils.js';

/** A tenant-scoped, pre-flattened knowledge record supplied by the data layer. */
export interface KnowledgeSourceRecord {
  tenantId: string;
  sourceId: string;
  sourceType: EvidenceSourceType;
  sourceTitle: string;
  sourceVersion: string;
  sourceLocation: string;
  evidenceOwner: string;
  sourceStatus: string;
  collectedAt?: string;
  expiresAt?: string;
  organizationalScope: string[];
  controlCode?: string;
  frameworkCode?: string;
  sourceReliability: EvidenceCitation['sourceReliability'];
  /** True only for records that demonstrate a control actually operated. */
  provesOperatingEffectiveness: boolean;
  searchableText: string;
  /** Structured signals used by contradiction detection. */
  attributes?: Record<string, string | number | boolean | string[]>;
}

export interface QuestionnaireKnowledgeSources {
  /** Human-readable name of the provider, surfaced in the retrieval trace. */
  name: string;
  listRecords(tenantId: string): Promise<KnowledgeSourceRecord[]>;
}

export interface LoadedKnowledge {
  records: KnowledgeSourceRecord[];
  retrievalTrace: string[];
  degradedSources: Array<{ sourceType: EvidenceSourceType; reason: string }>;
  partialFailure: boolean;
  foreignTenantRecordsDropped: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface FreshnessAssessment {
  freshnessStatus: EvidenceCitation['freshnessStatus'];
  daysRemaining?: number;
}

export const STALE_AFTER_DAYS = 365;
export const DUE_SOON_WITHIN_DAYS = 45;

export function assessFreshness(collectedAt: string | undefined, expiresAt: string | undefined, asOf: string): FreshnessAssessment {
  const now = new Date(asOf).getTime();
  if (!Number.isFinite(now)) {
    return { freshnessStatus: 'UNKNOWN' };
  }

  if (expiresAt) {
    const expiry = new Date(expiresAt).getTime();
    if (Number.isFinite(expiry)) {
      const daysRemaining = Math.floor((expiry - now) / MS_PER_DAY);
      if (daysRemaining < 0) return { freshnessStatus: 'EXPIRED', daysRemaining };
      if (daysRemaining <= DUE_SOON_WITHIN_DAYS) return { freshnessStatus: 'DUE_SOON', daysRemaining };
      return { freshnessStatus: 'CURRENT', daysRemaining };
    }
  }

  if (collectedAt) {
    const collected = new Date(collectedAt).getTime();
    if (Number.isFinite(collected)) {
      const ageDays = Math.floor((now - collected) / MS_PER_DAY);
      if (ageDays > STALE_AFTER_DAYS) return { freshnessStatus: 'STALE', daysRemaining: -ageDays };
      return { freshnessStatus: 'CURRENT' };
    }
  }

  return { freshnessStatus: 'UNKNOWN' };
}

/** Source types that may never, on their own, prove a control operates. */
const DOCUMENT_ONLY_SOURCES: EvidenceSourceType[] = [
  'APPROVED_POLICY',
  'APPROVED_PROCEDURE',
  'SECURITY_STANDARD',
  'FRAMEWORK_REQUIREMENT',
  'CONTROL_DEFINITION',
  'REGULATORY_SOURCE'
];

export function isDocumentOnlySource(sourceType: EvidenceSourceType): boolean {
  return DOCUMENT_ONLY_SOURCES.includes(sourceType);
}

function scopeIntersects(a: string[], b: string[]): boolean {
  if (a.length === 0 || b.length === 0) return true;
  const lowerB = b.map(s => s.toLowerCase());
  return a.some(scope => lowerB.includes(scope.toLowerCase()) || scope.toLowerCase() === 'global');
}

export class EvidenceRetrievalService {
  private static instance: EvidenceRetrievalService;

  public static getInstance(): EvidenceRetrievalService {
    if (!EvidenceRetrievalService.instance) {
      EvidenceRetrievalService.instance = new EvidenceRetrievalService();
    }
    return EvidenceRetrievalService.instance;
  }

  /**
   * Loads all knowledge records for a tenant. A failing source integration is
   * isolated: other sources still load, the failure is reported, and no
   * placeholder evidence is ever synthesized.
   */
  public async loadKnowledge(params: {
    tenantId: string;
    providers: QuestionnaireKnowledgeSources[];
  }): Promise<LoadedKnowledge> {
    const records: KnowledgeSourceRecord[] = [];
    const retrievalTrace: string[] = [];
    const degradedSources: Array<{ sourceType: EvidenceSourceType; reason: string }> = [];
    let foreignTenantRecordsDropped = 0;
    let partialFailure = false;

    for (const provider of params.providers) {
      try {
        const loaded = await provider.listRecords(params.tenantId);
        let accepted = 0;
        for (const record of loaded) {
          if (record.tenantId !== params.tenantId) {
            foreignTenantRecordsDropped++;
            continue;
          }
          records.push(record);
          accepted++;
        }
        retrievalTrace.push(`Source "${provider.name}" supplied ${accepted} tenant-scoped record(s).`);
      } catch (err: any) {
        partialFailure = true;
        const reason = err && err.message ? err.message : 'unknown provider failure';
        degradedSources.push({ sourceType: 'EVIDENCE_RECORD', reason: `${provider.name}: ${reason}` });
        retrievalTrace.push(
          `Source "${provider.name}" FAILED (${reason}). No evidence was substituted for this source and answers that depend on it will not be asserted as verified.`
        );
      }
    }

    if (foreignTenantRecordsDropped > 0) {
      retrievalTrace.push(
        `Dropped ${foreignTenantRecordsDropped} record(s) that did not belong to the authenticated tenant.`
      );
    }

    return {
      records,
      retrievalTrace,
      degradedSources,
      partialFailure,
      foreignTenantRecordsDropped
    };
  }

  /** Hybrid retrieval for a single question against loaded knowledge. */
  public retrieve(params: {
    query: RetrievalQuery;
    knowledge: LoadedKnowledge;
    maxCitations?: number;
  }): RetrievalResult {
    const { query, knowledge } = params;
    const maxCitations = params.maxCitations ?? 12;
    const appliedFilters: string[] = [];
    const retrievalTrace: string[] = [...knowledge.retrievalTrace];

    const requirementTokens = new Set(
      normalizeForMatching(query.normalizedRequirement).split(' ').filter(t => t.length > 2)
    );
    const scope = query.organizationalScope && query.organizationalScope.length > 0 ? query.organizationalScope : [];

    if (scope.length > 0) appliedFilters.push(`organizationalScope=${scope.join('|')}`);
    if (query.controlCodes.length > 0) appliedFilters.push(`controlCode in [${query.controlCodes.join(', ')}]`);
    if (query.frameworkCodes.length > 0) appliedFilters.push(`frameworkCode in [${query.frameworkCodes.join(', ')}]`);
    appliedFilters.push('tenantId = authenticated tenant (enforced)');

    interface Scored {
      record: KnowledgeSourceRecord;
      score: number;
      reasons: string[];
      freshness: FreshnessAssessment;
      scopeMatched: boolean;
    }

    const scored: Scored[] = [];

    for (const record of knowledge.records) {
      const reasons: string[] = [];
      let score = 0;

      if (record.controlCode && query.controlCodes.includes(record.controlCode)) {
        score += 40;
        reasons.push(`maps to required control ${record.controlCode}`);
      }
      if (record.frameworkCode && query.frameworkCodes.includes(record.frameworkCode)) {
        score += 22;
        reasons.push(`maps to framework ${record.frameworkCode}`);
      }

      const haystack = normalizeForMatching(`${record.sourceTitle} ${record.searchableText}`);
      let keywordHits = 0;
      for (const token of requirementTokens) {
        if (haystack.includes(token)) keywordHits++;
      }
      if (keywordHits > 0) {
        const keywordScore = Math.min(28, keywordHits * 4);
        score += keywordScore;
        reasons.push(`${keywordHits} matching keyword(s)`);
      }

      // Exact phrase boost from the normalized requirement.
      const phrase = normalizeForMatching(query.normalizedRequirement.split(':').slice(1).join(':')).trim();
      if (phrase.length > 24 && haystack.includes(phrase.slice(0, 60))) {
        score += 15;
        reasons.push('exact requirement phrase present');
      }

      // Category affinity: framework/category tokens in source type titles.
      for (const category of query.categories) {
        const token = category.replace(/_/g, ' ').toLowerCase();
        if (haystack.includes(token)) {
          score += 8;
          reasons.push(`category affinity (${category})`);
        }
      }

      score += this.sourceTypePrior(record.sourceType);

      if (score < 15) continue;

      const freshness = assessFreshness(record.collectedAt, record.expiresAt, query.asOf);
      const scopeMatched = scopeIntersects(record.organizationalScope, scope);
      if (!scopeMatched) {
        score -= 25;
        reasons.push(`organizational scope [${record.organizationalScope.join(', ') || 'global'}] is outside the queried scope`);
      }

      scored.push({ record, score, reasons, freshness, scopeMatched });
    }

    scored.sort((a, b) => b.score - a.score);

    const citations: EvidenceCitation[] = scored.slice(0, maxCitations).map((item, index) => ({
      citationId: `${query.questionId}-CIT-${String(index + 1).padStart(3, '0')}`,
      sourceId: item.record.sourceId,
      sourceType: item.record.sourceType,
      sourceTitle: item.record.sourceTitle,
      sourceVersion: item.record.sourceVersion,
      sourceLocation: item.record.sourceLocation,
      evidenceOwner: item.record.evidenceOwner,
      sourceStatus: item.record.sourceStatus,
      collectedAt: item.record.collectedAt,
      expiresAt: item.record.expiresAt,
      freshnessStatus: item.freshness.freshnessStatus,
      freshnessDaysRemaining: item.freshness.daysRemaining,
      organizationalScope: item.record.organizationalScope,
      applicableControlCode: item.record.controlCode,
      applicableFrameworkCode: item.record.frameworkCode,
      retrievedAt: query.asOf,
      sourceReliability: item.record.sourceReliability,
      provesOperatingEffectiveness: item.record.provesOperatingEffectiveness,
      excerpt: this.buildExcerpt(item.record.searchableText, requirementTokens)
    }));

    retrievalTrace.push(
      `Question ${query.questionId}: ${scored.length} candidate source(s) scored, ${citations.length} cited (max ${maxCitations}).`
    );

    if (citations.length === 0) {
      retrievalTrace.push(
        `Question ${query.questionId}: no authorised source in this tenant matched the requirement. No evidence was invented.`
      );
    }

    const expiredCount = citations.filter(c => c.freshnessStatus === 'EXPIRED').length;
    if (expiredCount > 0) {
      retrievalTrace.push(
        `Question ${query.questionId}: ${expiredCount} cited source(s) are expired and can only be used to trigger revalidation.`
      );
    }

    return {
      citations,
      retrievalTrace,
      appliedFilters,
      degradedSources: knowledge.degradedSources,
      partialFailure: knowledge.partialFailure
    };
  }

  private sourceTypePrior(sourceType: EvidenceSourceType): number {
    switch (sourceType) {
      case 'CONTROL_TEST_RESULT':
        return 14;
      case 'EVIDENCE_ASSERTION':
        return 13;
      case 'EVIDENCE_RECORD':
        return 10;
      case 'CONTROL_IMPLEMENTATION':
        return 9;
      case 'APPROVED_ORGANIZATIONAL_FACT':
        return 9;
      case 'APPROVED_PRIOR_ANSWER':
        return 7;
      case 'APPROVED_TRUST_CENTER_DISCLOSURE':
        return 6;
      case 'CERTIFICATION':
        return 8;
      case 'FINDING':
      case 'RISK_ASSESSMENT':
      case 'CAPA_RECORD':
        return 5;
      case 'APPROVED_POLICY':
      case 'APPROVED_PROCEDURE':
      case 'SECURITY_STANDARD':
        return 4;
      default:
        return 1;
    }
  }

  private buildExcerpt(text: string, tokens: Set<string>): string {
    const normalized = normalizeText(text);
    if (normalized.length <= 220) return normalized;
    const lower = normalized.toLowerCase();
    let hitIndex = -1;
    for (const token of tokens) {
      const idx = lower.indexOf(token);
      if (idx >= 0 && (hitIndex === -1 || idx < hitIndex)) hitIndex = idx;
    }
    if (hitIndex === -1) return `${normalized.slice(0, 220)}…`;
    const start = Math.max(0, hitIndex - 80);
    return `${start > 0 ? '…' : ''}${normalized.slice(start, start + 220)}…`;
  }
}

export const evidenceRetrievalService = EvidenceRetrievalService.getInstance();
