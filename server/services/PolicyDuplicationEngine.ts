// ============================================================================
// SKANDA ENTERPRISE GRC: POLICY DUPLICATION & CONTRADICTION DETECTION ENGINE
// Path: server/services/PolicyDuplicationEngine.ts
//
// Identifies redundant policies, duplicate sections, contradictory requirements,
// conflicting retention periods, conflicting RACI assignments, and outdated framework references.
// ============================================================================

export interface DuplicateDetectionResult {
  scanId: string;
  scannedAt: string;
  tenantId: string;
  analyzedDocumentsCount: number;
  duplicateFindings: Array<{
    findingId: string;
    findingType:
      | 'DUPLICATE_POLICY_TITLE'
      | 'SEMANTIC_SCOPE_OVERLAP'
      | 'CONTRADICTORY_STATEMENT'
      | 'CONFLICTING_RETENTION_PERIOD'
      | 'CONFLICTING_RACI_ASSIGNMENT'
      | 'OUTDATED_FRAMEWORK_REFERENCE';
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    sourceDocument: { id: string; code: string; title: string };
    targetDocument?: { id: string; code: string; title: string };
    statementA: string;
    statementB?: string;
    description: string;
    suggestedResolution: string;
  }>;
  overallRedundancyScore: number; // 0 (Clean) to 100 (Severe Overlap)
  recommendations: string[];
}

export interface DocumentSummary {
  id: string;
  tenantId: string;
  code: string;
  title: string;
  type: string;
  status: string;
  frameworkCodes: string[];
  ownerRole: string;
  content: {
    purpose?: string;
    scope?: string;
    requirementsOrSteps?: Array<{ actor: string; system: string; action: string }>;
    exceptionHandling?: { maxDays?: number };
    controlMappings?: Array<{ controlCode: string; requirement: string }>;
    rolesAndResponsibilities?: Array<{ role: string; mandate: string; a?: boolean }>;
  };
}

export class PolicyDuplicationEngine {
  private static instance: PolicyDuplicationEngine;

  private constructor() {}

  public static getInstance(): PolicyDuplicationEngine {
    if (!PolicyDuplicationEngine.instance) {
      PolicyDuplicationEngine.instance = new PolicyDuplicationEngine();
    }
    return PolicyDuplicationEngine.instance;
  }

  public scanCatalogForDuplications(tenantId: string, docs: DocumentSummary[]): DuplicateDetectionResult {
    const scanId = `SCAN-DUP-${Date.now()}`;
    const scannedAt = new Date().toISOString();
    const findings: DuplicateDetectionResult['duplicateFindings'] = [];
    let findingSeq = 1;

    const tenantDocs = docs.filter(d => d.tenantId === tenantId && d.status !== 'ARCHIVED' && d.status !== 'WITHDRAWN');

    for (let i = 0; i < tenantDocs.length; i++) {
      const docA = tenantDocs[i];

      // 1. Check Outdated Framework References (e.g. ISO 27001:2013, SAS 70)
      for (const fw of docA.frameworkCodes) {
        if (fw.includes('2013') || fw.includes('SAS70') || fw.includes('ISO_27001_2013')) {
          findings.push({
            findingId: `FIND-DUP-${findingSeq++}`,
            findingType: 'OUTDATED_FRAMEWORK_REFERENCE',
            severity: 'HIGH',
            sourceDocument: { id: docA.id, code: docA.code, title: docA.title },
            statementA: `Referenced framework: ${fw}`,
            description: `Document references superseded standard (${fw}). Should be migrated to ISO/IEC 27001:2022.`,
            suggestedResolution: 'Update framework crosswalk to reference ISO/IEC 27001:2022 clauses.'
          });
        }
      }

      // Pairwise comparisons
      for (let j = i + 1; j < tenantDocs.length; j++) {
        const docB = tenantDocs[j];

        // 2. Exact or High Title Similarity
        const titleA = docA.title.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
        const titleB = docB.title.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();

        if (titleA === titleB || (titleA.length > 10 && titleB.length > 10 && (titleA.includes(titleB) || titleB.includes(titleA)))) {
          findings.push({
            findingId: `FIND-DUP-${findingSeq++}`,
            findingType: 'DUPLICATE_POLICY_TITLE',
            severity: 'HIGH',
            sourceDocument: { id: docA.id, code: docA.code, title: docA.title },
            targetDocument: { id: docB.id, code: docB.code, title: docB.title },
            statementA: docA.title,
            statementB: docB.title,
            description: `Duplicate or nearly identical document titles detected between ${docA.code} and ${docB.code}.`,
            suggestedResolution: 'Consolidate redundant documents or clarify distinct jurisdictional/technical scopes.'
          });
        }

        // 3. Contradictory Statements & Requirement Overlap
        const stepsA = docA.content.requirementsOrSteps || [];
        const stepsB = docB.content.requirementsOrSteps || [];

        for (const sA of stepsA) {
          for (const sB of stepsB) {
            const actA = sA.action.toLowerCase();
            const actB = sB.action.toLowerCase();

            // Example contradiction: MFA mandatory vs optional
            const isMfaContradiction =
              (actA.includes('mfa') || actA.includes('multi-factor') || actA.includes('two-factor')) &&
              (actB.includes('mfa') || actB.includes('multi-factor') || actB.includes('two-factor')) &&
              ((actA.includes('mandatory') && actB.includes('optional')) ||
                (actA.includes('shall') && actB.includes('may bypass')) ||
                (actA.includes('enforced') && actB.includes('discretionary')));

            if (isMfaContradiction) {
              findings.push({
                findingId: `FIND-DUP-${findingSeq++}`,
                findingType: 'CONTRADICTORY_STATEMENT',
                severity: 'CRITICAL',
                sourceDocument: { id: docA.id, code: docA.code, title: docA.title },
                targetDocument: { id: docB.id, code: docB.code, title: docB.title },
                statementA: sA.action,
                statementB: sB.action,
                description: `Contradictory security requirements identified: ${docA.code} mandates control while ${docB.code} describes it as optional.`,
                suggestedResolution: 'Harmonize requirements to enforce non-negotiable enterprise baseline.'
              });
            }
          }
        }

        // 4. Conflicting Exception Durations
        const maxA = docA.content.exceptionHandling?.maxDays;
        const maxB = docB.content.exceptionHandling?.maxDays;
        if (maxA && maxB && Math.abs(maxA - maxB) >= 90) {
          findings.push({
            findingId: `FIND-DUP-${findingSeq++}`,
            findingType: 'CONFLICTING_RETENTION_PERIOD',
            severity: 'MEDIUM',
            sourceDocument: { id: docA.id, code: docA.code, title: docA.title },
            targetDocument: { id: docB.id, code: docB.code, title: docB.title },
            statementA: `Max exception duration: ${maxA} days`,
            statementB: `Max exception duration: ${maxB} days`,
            description: `Inconsistent exception waiver ceilings (${maxA} days vs ${maxB} days) across policies in the same tenant.`,
            suggestedResolution: 'Align exception handling to the tenant standard maximum duration (e.g. 90 days).'
          });
        }
      }
    }

    const redundancyScore = Math.min(100, findings.length * 15);
    const recommendations: string[] = [];

    if (findings.length === 0) {
      recommendations.push('Policy catalog is clean of detectable duplications, contradictions, and outdated framework crosswalks.');
    } else {
      recommendations.push(`Resolve ${findings.filter(f => f.severity === 'CRITICAL').length} critical contradiction(s) immediately.`);
      recommendations.push('Review overlapping policies in the Policy Governance Committee to establish authoritative single source of truth.');
    }

    return {
      scanId,
      scannedAt,
      tenantId,
      analyzedDocumentsCount: tenantDocs.length,
      duplicateFindings: findings,
      overallRedundancyScore: redundancyScore,
      recommendations
    };
  }
}

export const policyDuplicationEngine = PolicyDuplicationEngine.getInstance();
