// ============================================================================
// SKANDA QUESTIONNAIRE INTELLIGENCE: TENANT KNOWLEDGE SOURCE PROVIDER
// Path: server/services/QuestionnaireKnowledgeSource.ts
//
// Flattens the tenant's existing SKANDA records into retrieval-ready
// KnowledgeSourceRecord rows. Every record is stamped with the tenant id it was
// read for, so the retrieval layer can drop anything that does not belong to the
// authenticated tenant (defence in depth beyond repository scoping).
//
// Sources reused (no duplication of canonical GRC modules):
//   - canonical control definitions / implementations / tests (ControlTestingService)
//   - canonical evidence assertions (CanonicalEvidenceService)
//   - evidence records, risks, findings (IGrcDataStore)
//   - approved policy documents + versions (PolicyRepository)
//   - governed answer library, authorized disclosures, approved org facts
//     (questionnaire repository — the platform's own governed registers)
// ============================================================================

import {
  KnowledgeSourceRecord,
  QuestionnaireKnowledgeSources
} from '../../src/services/questionnaire/evidenceRetrievalService.js';
import { controlTestingService } from '../../src/services/canonical/ControlTestingService.js';
import { canonicalEvidenceService } from '../../src/services/canonical/CanonicalEvidenceService.js';
import { getGrcDataStore } from '../repositories/GrcRepositoryFactory.js';
import { getQuestionnaireDataStore } from '../repositories/QuestionnaireRepository.js';
import { policyRepository } from '../repositories/PolicyRepository.js';

function safeString(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function truncate(text: string, max = 1200): string {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : `${clean.slice(0, max)}…`;
}

export interface KnowledgeSourceOptions {
  /** Include the platform's own governed registers (library/facts/disclosures). */
  includeGovernedRegisters?: boolean;
  /** Provider enable switches, so a failing integration can be isolated. */
  includeRecords?: boolean;
  includePolicies?: boolean;
  includeControls?: boolean;
}

/**
 * Builds the provider list used by the pipeline. Each provider is independent so
 * a single failing integration degrades gracefully instead of failing the run.
 */
export function buildKnowledgeSources(options: KnowledgeSourceOptions = {}): QuestionnaireKnowledgeSources[] {
  const includeGoverned = options.includeGovernedRegisters !== false;
  const providers: QuestionnaireKnowledgeSources[] = [];

  if (options.includeControls !== false) {
    providers.push({
      name: 'canonical-controls-and-testing',
      async listRecords(tenantId: string): Promise<KnowledgeSourceRecord[]> {
        const records: KnowledgeSourceRecord[] = [];

        for (const definition of controlTestingService.getAllControlDefinitions()) {
          records.push({
            tenantId,
            sourceId: `CTRLDEF-${definition.code}`,
            sourceType: 'CONTROL_DEFINITION',
            sourceTitle: `${definition.code} ${definition.title}`,
            sourceVersion: '1.0',
            sourceLocation: `Canonical control library / ${definition.category}`,
            evidenceOwner: 'GRC Platform',
            sourceStatus: 'APPROVED',
            organizationalScope: ['global'],
            controlCode: definition.code,
            frameworkCode: (definition.frameworkMappings || [])[0]?.frameworkCode,
            sourceReliability: 'APPROVED_DOCUMENT',
            provesOperatingEffectiveness: false,
            searchableText: truncate(
              `${definition.title}. ${definition.description}. Category ${definition.category}. Testing procedure: ${definition.standardTestingProcedure}`
            ),
            attributes: { category: String(definition.category), type: String(definition.type) }
          });
        }

        const implementations = controlTestingService
          .getAllImplementations()
          .filter(impl => !impl.tenantId || impl.tenantId === tenantId);
        for (const impl of implementations) {
          records.push({
            tenantId,
            sourceId: `CTRLIMPL-${impl.id}`,
            sourceType: 'CONTROL_IMPLEMENTATION',
            sourceTitle: `${impl.controlCode} implementation — ${impl.title}`,
            sourceVersion: '1.0',
            sourceLocation: `Tenant control implementation / ${impl.operatingEnvironment}`,
            evidenceOwner: impl.owner,
            sourceStatus: impl.implementationStatus,
            collectedAt: impl.updatedAt,
            organizationalScope: [impl.operatingEnvironment],
            controlCode: impl.controlCode,
            sourceReliability: 'PRIMARY_VERIFIED',
            // An implementation record demonstrates design; only a current test
            // demonstrates operating effectiveness.
            provesOperatingEffectiveness: false,
            searchableText: truncate(
              `${impl.title}. Implementation status ${impl.implementationStatus}. Effectiveness ${impl.effectivenessRating}. Owner ${impl.owner}. Custodian ${impl.technicalCustodian}. Details: ${impl.implementationDetails}`
            ),
            attributes: {
              implementationStatus: impl.implementationStatus,
              effectivenessRating: impl.effectivenessRating,
              testingFrequency: impl.testingFrequency
            }
          });
        }

        for (const test of controlTestingService.getAllTests()) {
          if (test.tenantId && test.tenantId !== tenantId) continue;
          records.push({
            tenantId,
            sourceId: `CTRLTEST-${test.id}`,
            sourceType: 'CONTROL_TEST_RESULT',
            sourceTitle: `${test.controlCode} control test — ${test.testTitle}`,
            sourceVersion: '1.0',
            sourceLocation: `Control testing / ${test.testingPeriod?.startDate || ''} to ${test.testingPeriod?.endDate || ''}`,
            evidenceOwner: test.tester,
            sourceStatus: test.effectiveness || test.testResult,
            collectedAt: test.performedAt,
            organizationalScope: ['global'],
            controlCode: test.controlCode,
            sourceReliability: 'PRIMARY_VERIFIED',
            provesOperatingEffectiveness: test.testResult === 'PASS',
            searchableText: truncate(
              `${test.testTitle}. Objective: ${test.testObjective}. Procedure: ${test.testProcedure}. Result ${test.testResult}. Effectiveness ${test.effectiveness}. Sample ${test.sampleSize}/${test.populationSize}. Deficiencies: ${(test.deficienciesIdentified || []).join('; ')}`
            ),
            attributes: {
              testResult: test.testResult,
              effectiveness: test.effectiveness,
              exceptionsNotedCount: test.exceptionsNotedCount ?? 0
            }
          });
        }

        return records;
      }
    });
  }

  if (options.includeRecords !== false) {
    providers.push({
      name: 'canonical-evidence-and-grc-records',
      async listRecords(tenantId: string): Promise<KnowledgeSourceRecord[]> {
        const records: KnowledgeSourceRecord[] = [];
        const store = getGrcDataStore();

        // Canonical evidence assertions (traceability substrate).
        for (const assertion of canonicalEvidenceService.getAllAssertions()) {
          if (assertion.tenantId && assertion.tenantId !== tenantId) continue;
          records.push({
            tenantId,
            sourceId: `EVIDASSERT-${assertion.id}`,
            sourceType: 'EVIDENCE_ASSERTION',
            sourceTitle: assertion.assertionStatement || `Evidence assertion ${assertion.id}`,
            sourceVersion: '1.0',
            sourceLocation: `Evidence assertion / control ${assertion.controlCode || 'unmapped'}`,
            evidenceOwner: assertion.assertedBy || 'Evidence owner',
            sourceStatus: assertion.assertionStatus || 'ASSERTED',
            collectedAt: assertion.assertedAt,
            organizationalScope: ['global'],
            controlCode: assertion.controlCode,
            sourceReliability: 'PRIMARY_VERIFIED',
            provesOperatingEffectiveness: /VERIFIED|SUBSTANTIATED/i.test(safeString(assertion.assertionStatus)),
            searchableText: truncate(
              `${assertion.assertionStatement || ''}. Status ${assertion.assertionStatus}. Asserted by ${assertion.assertedBy || ''}`
            ),
            attributes: {
              assertionStatus: safeString(assertion.assertionStatus),
              evidenceId: safeString(assertion.evidenceId)
            }
          });
        }

        // Evidence records held by the tenant GRC store.
        const evidence = await store.evidence.getEvidence(tenantId);
        for (const item of evidence) {
          if (item.tenantId !== tenantId) continue;
          records.push({
            tenantId,
            sourceId: `EVIDENCE-${item.id}`,
            sourceType: 'EVIDENCE_RECORD',
            sourceTitle: item.title,
            sourceVersion: item.version || '1.0',
            sourceLocation: `Evidence vault / ${item.fileName}`,
            evidenceOwner: item.uploadedByUserId || 'Evidence owner',
            sourceStatus: item.status,
            collectedAt: item.uploadedDate,
            expiresAt: item.expiryDate,
            organizationalScope: [item.classification || 'INTERNAL'],
            controlCode: item.controlCode,
            sourceReliability: /verified|approved/i.test(safeString(item.status)) ? 'PRIMARY_VERIFIED' : 'SECONDARY',
            provesOperatingEffectiveness: /verified|approved/i.test(safeString(item.status)),
            searchableText: truncate(
              `${item.title}. ${item.description || ''}. Control ${item.controlCode}. Source ${item.sourceConnector}. Classification ${item.classification}. Status ${item.status}.`
            ),
            attributes: {
              status: safeString(item.status),
              isWormVerified: Boolean(item.isWormVerified),
              sha256Hash: item.sha256Hash
            }
          });
        }

        // Risks.
        const risks = await store.risks.getRisks(tenantId);
        for (const risk of risks) {
          if (risk.tenantId !== tenantId) continue;
          records.push({
            tenantId,
            sourceId: `RISK-${risk.id}`,
            sourceType: 'RISK_ASSESSMENT',
            sourceTitle: `${risk.riskCode} ${risk.title}`,
            sourceVersion: '1.0',
            sourceLocation: `Risk register / ${risk.department}`,
            evidenceOwner: risk.department || 'Risk owner',
            sourceStatus: risk.status || 'OPEN',
            collectedAt: (risk as any).updatedAt,
            organizationalScope: [risk.department || 'global'],
            sourceReliability: 'APPROVED_DOCUMENT',
            provesOperatingEffectiveness: false,
            searchableText: truncate(
              `${risk.title}. ${risk.threatDescription} ${risk.vulnerabilityDescription || ''}. Residual score ${risk.residualScore}.`
            ),
            attributes: {
              inherentScore: risk.inherentScore,
              residualScore: risk.residualScore,
              status: safeString(risk.status)
            }
          });
        }

        // Findings.
        const findings = await store.findings.getFindings(tenantId);
        for (const finding of findings) {
          if (finding.tenantId !== tenantId) continue;
          records.push({
            tenantId,
            sourceId: `FINDING-${finding.id}`,
            sourceType: 'FINDING',
            sourceTitle: `${finding.findingCode} ${finding.title}`,
            sourceVersion: '1.0',
            sourceLocation: `Findings register / ${finding.frameworkCode || 'internal'}`,
            evidenceOwner: finding.assignedToUserId || 'Finding owner',
            sourceStatus: finding.status,
            collectedAt: (finding as any).createdAt,
            organizationalScope: ['global'],
            controlCode: finding.controlCode,
            frameworkCode: finding.frameworkCode,
            sourceReliability: 'PRIMARY_VERIFIED',
            provesOperatingEffectiveness: false,
            searchableText: truncate(`${finding.title}. ${finding.description} Root cause: ${finding.rootCause || 'not recorded'}.`),
            attributes: {
              status: safeString(finding.status),
              severity: safeString(finding.severity),
              type: safeString(finding.type)
            }
          });
        }

        return records;
      }
    });
  }

  if (options.includePolicies !== false) {
    providers.push({
      name: 'policy-governance-register',
      async listRecords(tenantId: string): Promise<KnowledgeSourceRecord[]> {
        const records: KnowledgeSourceRecord[] = [];
        const documents = await policyRepository.getDocuments(tenantId);
        for (const doc of documents) {
          if (doc.tenantId !== tenantId) continue;
          const content = doc.content || ({} as any);
          const contentText = [
            content.purpose,
            content.scope,
            (content.objectives || []).join('. '),
            (content.controlMappings || [])
              .map((m: any) => `${m.controlCode} ${m.requirement} ${m.practice}`)
              .join('. '),
            (content.requirementsOrSteps || [])
              .map((s: any) => `${s.actor} ${s.action} ${s.expectedOutput || ''}`)
              .join('. ')
          ]
            .filter(Boolean)
            .join(' ');
          const linkedControlCodes = (content.controlMappings || []).map((m: any) => m.controlCode);

          records.push({
            tenantId,
            sourceId: `POLICY-${doc.id}`,
            sourceType: doc.type === 'PROCEDURE' || doc.type === 'SOP' ? 'APPROVED_PROCEDURE' : 'APPROVED_POLICY',
            sourceTitle: `${doc.code} ${doc.title}`,
            sourceVersion: doc.currentVersion || '1.0.0',
            sourceLocation: `Policy register / ${doc.departmentName || 'organization wide'}`,
            evidenceOwner: doc.ownerEmail,
            sourceStatus: doc.status,
            collectedAt: doc.effectiveDate || doc.lastReviewDate,
            expiresAt: doc.nextReviewDate,
            organizationalScope: [doc.departmentName || 'global'],
            sourceReliability: 'APPROVED_DOCUMENT',
            // A policy describes intent; it never proves a control operated.
            provesOperatingEffectiveness: false,
            searchableText: truncate(`${doc.title}. ${contentText}`),
            attributes: {
              status: safeString(doc.status),
              type: safeString(doc.type),
              linkedControlCodes: linkedControlCodes.join(', ')
            }
          });
        }
        return records;
      }
    });
  }

  if (includeGoverned) {
    providers.push({
      name: 'governed-registers',
      async listRecords(tenantId: string): Promise<KnowledgeSourceRecord[]> {
        const store = getQuestionnaireDataStore();
        const records: KnowledgeSourceRecord[] = [];

        const [facts, libraryEntries, disclosures] = await Promise.all([
          store.listOrgFacts(tenantId),
          store.listLibraryEntries(tenantId),
          store.listDisclosures(tenantId)
        ]);

        for (const fact of facts) {
          if (fact.tenantId !== tenantId) continue;
          records.push({
            tenantId,
            sourceId: `ORGFACT-${fact.id}`,
            sourceType: 'APPROVED_ORGANIZATIONAL_FACT',
            sourceTitle: fact.title,
            sourceVersion: '1.0',
            sourceLocation: `Approved organizational fact / ${fact.category}`,
            evidenceOwner: fact.approvedBy,
            sourceStatus: 'APPROVED',
            collectedAt: fact.approvedAt,
            expiresAt: fact.expiresAt,
            organizationalScope: fact.organizationalScope.length > 0 ? fact.organizationalScope : ['global'],
            controlCode: fact.controlCode,
            sourceReliability: 'PRIMARY_VERIFIED',
            provesOperatingEffectiveness: true,
            searchableText: truncate(`${fact.title}. ${fact.statement}. Value: ${String(fact.value)}`),
            attributes: {
              value: fact.value as any,
              affectsClaimCode: fact.affectsClaimCode || '',
              category: fact.category
            }
          });
        }

        for (const entry of libraryEntries) {
          if (entry.tenantId !== tenantId) continue;
          if (entry.approvalStatus !== 'APPROVED') continue;
          records.push({
            tenantId,
            sourceId: `LIBRARY-${entry.id}`,
            sourceType: 'APPROVED_PRIOR_ANSWER',
            sourceTitle: `Approved prior answer — ${entry.category}`,
            sourceVersion: String(entry.version),
            sourceLocation: `Governed answer library / ${entry.businessUnit || 'organization'}`,
            evidenceOwner: entry.approvedBy,
            sourceStatus: 'APPROVED',
            collectedAt: entry.approvedAt,
            expiresAt: entry.reviewDueAt,
            organizationalScope: entry.organizationalScope.length > 0 ? entry.organizationalScope : ['global'],
            sourceReliability: 'PRIMARY_VERIFIED',
            provesOperatingEffectiveness: false,
            searchableText: truncate(`${entry.canonicalQuestion}. ${entry.approvedAnswer}`),
            attributes: { version: entry.version }
          });
        }

        for (const disclosure of disclosures) {
          if (disclosure.tenantId !== tenantId) continue;
          records.push({
            tenantId,
            sourceId: `DISCLOSURE-${disclosure.id}`,
            sourceType: 'APPROVED_TRUST_CENTER_DISCLOSURE',
            sourceTitle: `Trust Center disclosure — ${disclosure.title}`,
            sourceVersion: String(disclosure.version),
            sourceLocation: `Trust Center / ${disclosure.category}`,
            evidenceOwner: disclosure.authorizedBy || 'Not authorized',
            sourceStatus: disclosure.status,
            collectedAt: disclosure.authorizedAt,
            expiresAt: disclosure.expiresAt,
            organizationalScope: ['public'],
            sourceReliability: disclosure.status === 'AUTHORIZED' ? 'APPROVED_DOCUMENT' : 'LOW_CONFIDENCE',
            provesOperatingEffectiveness: false,
            searchableText: truncate(`${disclosure.title}. ${disclosure.publicContent}`),
            attributes: { status: disclosure.status, category: disclosure.category }
          });
        }

        return records;
      }
    });
  }

  return providers;
}
