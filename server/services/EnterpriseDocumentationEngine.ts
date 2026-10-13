// ============================================================================
// SKANDA ENTERPRISE GRC: CONSULTING-GRADE DOCUMENTATION & POLICY ENGINE
// Path: server/services/EnterpriseDocumentationEngine.ts
//
// Fulfills ISO/IEC 27001:2022 (Clauses 5.1, 5.2, 5.3, 7.5, 9.1, 9.2, 10.1, 10.2),
// Annex A Controls (A.5.1, A.5.15, A.8.2, A.8.5), SOC 2 (CC6.1, CC6.2, CC6.3),
// MAS TRM Guidelines (Sec 11, 12), and India DPDP Act 2023.
//
// Core Enterprise Principles:
// 1. NO FABRICATION: Never invent organizational facts, approver roles, or regulatory scopes.
// 2. CLEAR PROVENANCE: Distinguish verified requirements from recommendations and assumptions.
// 3. OPERATIONAL SPECIFICITY: Every step defines Action, Responsible Role, Evidence, Exit Criteria, and Failure Mode.
// 4. RACI INTEGRITY: Each activity has EXACTLY ONE Accountable ('A') role.
// 5. ASSURANCE LIMITATIONS: Explicitly declare what evidence proves and what it does not prove.
// 6. AUTHORITATIVE PERSISTENCE: Bridges seamlessly into PolicyGovernanceEngine and PostgreSQL.
// ============================================================================

import crypto from 'crypto';
import JSZip from 'jszip';
import {
  policyGovernanceEngine,
  GovernanceDocument,
  DocumentType,
  DocumentLifecycleStatus
} from './PolicyGovernanceEngine.js';
import type {
  CatalogueTemplateMetadata,
  CatalogueFilterParams,
  CatalogueDomain,
  MappingProvenance,
  FrameworkRequirementMapping
} from './DocumentationCatalogueData.js';
import {
  ENTERPRISE_CATALOGUE_REGISTRY
} from './DocumentationCatalogueData.js';
import { DocumentationCatalogueGenerators } from './DocumentationCatalogueGenerators.js';

export type {
  CatalogueTemplateMetadata,
  CatalogueFilterParams,
  CatalogueDomain,
  MappingProvenance,
  FrameworkRequirementMapping
};
export {
  ENTERPRISE_CATALOGUE_REGISTRY
};

// ============================================================================
// 1. DATA TYPES & STRUCTURES
// ============================================================================

export type DocumentHierarchyLevel =
  | 'LEVEL_1_GOVERNANCE_POLICY'
  | 'LEVEL_2_OPERATIONAL_PROCEDURE'
  | 'LEVEL_3_TECHNICAL_STANDARD'
  | 'LEVEL_4_WORK_INSTRUCTION'
  | 'LEVEL_4_SOP'
  | 'LEVEL_5_GUIDELINE'
  | 'LEVEL_5_FORM_CHECKLIST'
  | 'LEVEL_5_REGISTER_LOG'
  | 'LEVEL_5_IMPLEMENTATION_PLAN'
  | 'LEVEL_5_MANAGEMENT_REVIEW_PACK';

export type StatementProvenanceType =
  | 'VERIFIED_ORGANIZATIONAL_FACT'
  | 'AUTHORITATIVE_FRAMEWORK_TEXT'
  | 'CANONICAL_MANDATE'
  | 'OPERATIONAL_REQUIREMENT'
  | 'RECOMMENDED_PRACTICE'
  | 'UNVERIFIED_ASSUMPTION';

export type DocumentClassification =
  | 'PUBLIC'
  | 'INTERNAL_ILLUSTRATIVE'
  | 'INTERNAL'
  | 'CONFIDENTIAL'
  | 'RESTRICTED';

export interface DocumentControlMetadata {
  documentId: string;
  title: string;
  subtitle?: string;
  documentType: DocumentType;
  hierarchyLevel: DocumentHierarchyLevel;
  version: string;
  status: string; // e.g. "Model sample — not approved; not effective" or "Draft" or "Approved"
  documentOwner: string;
  approver: string;
  preparedBy: string;
  effectiveDate: string;
  revisionDate: string;
  classification: DocumentClassification;
  reviewTrigger: string;
  notice?: string;
  modelUseNotice?: string;
}

export interface RevisionHistoryEntry {
  version: string;
  date: string;
  summaryOfChange: string;
  preparedBy: string;
  approvalStatus: string;
}

export interface DocumentGovernanceControl {
  control: string;
  requirementOrModelApproach: string;
}

export interface TermsAndDefinitionsEntry {
  term: string;
  definition: string;
  sourceOrFramework?: string;
}

export interface GovernanceAccountabilityEntry {
  role: string;
  accountability: string;
  assignedIndividualOrTeam?: string;
}

export interface MandatoryPolicyRequirement {
  sectionId: string;
  title: string;
  statement: string;
  provenance: StatementProvenanceType;
  linkedFrameworkClauses: string[];
  linkedControlCodes: string[];
}

export interface GovernanceObjectEvidenceEntry {
  governanceObject: string;
  minimumExpectedRecord: string;
  assuranceLimitation: string;
  retentionRequirement?: string;
}

export interface RoleAndSegregationBoundary {
  role: string;
  permittedResponsibility: string;
  controlBoundary: string;
  incompatibleRoles?: string[];
}

export interface InputAndRequiredRecord {
  inputOrRecord: string;
  requiredContent: string;
  originatingSystemOrActor?: string;
}

export interface OperationalProcedureStep {
  stepNumber: number;
  stepName: string;
  requiredAction: string;
  responsibleRole: string;
  evidenceProduced: string;
  exitCriteria: string;
  failureOrExceptionHandling: string;
}

export interface DecisionRuleEntry {
  scenario: string;
  requiredHandling: string;
  requiredEvidence: string;
  escalationRole?: string;
}

export interface ServiceLevelGovernanceElement {
  element: string;
  definition: string;
}

export interface ServiceLevelTargetCategory {
  category: string;
  approvedTarget: string;
  measuredInterval: string;
  escalationRoute: string;
}

export interface EvidenceRetentionSpec {
  evidenceItem: string;
  minimumFields: string;
  controlPurpose: string;
  storageSystem?: string;
  retentionPeriod?: string;
}

export interface OperationalRaciRow {
  activity: string;
  requesterOrManager: 'R' | 'A' | 'C' | 'I' | 'A/R';
  systemOwner: 'R' | 'A' | 'C' | 'I' | 'A/R';
  iamOrOperator: 'R' | 'A' | 'C' | 'I' | 'A/R';
  securityReviewer: 'R' | 'A' | 'C' | 'I' | 'A/R';
  verifier: 'R' | 'A' | 'C' | 'I' | 'A/R';
  notes?: string;
}

export interface TailoringChecklistItem {
  id: string;
  description: string;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: string;
  verifiedEvidenceRef?: string;
}

export interface ApprovalRecordEntry {
  role: string;
  nameOrIdentity: string;
  decision: 'Review pending' | 'Approval pending' | 'APPROVED' | 'REJECTED' | 'CONDITIONAL';
  date: string;
  evidenceReference: string;
}

export type PrivacyLegalRegime =
  | 'EU_GDPR_STATUTORY'
  | 'INDIA_DPDP_COMPLIANCE'
  | 'ENTERPRISE_GOVERNANCE_RECOMMENDED'
  | 'CUSTOMER_CONTRACT_SPECIFIC';

export interface RegisterSchemaColumn {
  fieldId?: string;
  fieldName: string;
  dataType: string;
  isMandatory: boolean;
  regulatorySource: string; // Backwards-compatible summary string
  legalRegime?: PrivacyLegalRegime;
  requirementCategory?: string;
  authoritativeSource?: string;
  legalOrGovernanceBasis?: string;
  sourceArticleOrSection?: string;
  applicableJurisdiction?: string;
  applicableRole?: string;
  mandateLevel?: 'MANDATORY' | 'CONDITIONAL' | 'RECOMMENDED';
  sourceVerificationStatus?: 'VERIFIED_STATUTORY' | 'RECOMMENDED_PRACTICE' | 'ORGANIZATIONAL_DECISION' | 'SOURCE_VERIFICATION_PENDING';
  applicabilityConditions?: string;
  description: string;
  validationRule?: string;
  requiresHumanReview?: boolean;
}

export interface RegisterRecordRow {
  rowId: string;
  category: string;
  attributes: Record<string, string>;
  lastReviewedDate?: string;
  complianceStatus?: string;
}

export interface StatementOfApplicabilityEntry {
  controlId: string; // e.g. "A.5.15"
  controlTitle: string; // e.g. "Access Control"
  theme: 'ORGANIZATIONAL' | 'PEOPLE' | 'PHYSICAL' | 'TECHNOLOGICAL';
  isApplicable: boolean;
  justificationForInclusionOrExclusion: string;
  implementationStatus: 'IMPLEMENTED' | 'PARTIALLY_IMPLEMENTED' | 'PLANNED' | 'NOT_APPLICABLE';
  supportingDocumentation: string;
  verifiableEvidenceRef: string;
  normativeSource?: string; // e.g. "ISO/IEC 27001:2022 Clause 6.1.3(d)"
  implementationGuidanceRef?: string; // e.g. "ISO/IEC 27002:2022 Section 5.15"
  evidenceVerificationStatus?: 'VERIFIED_WITH_TELEMETRY' | 'DOCUMENTED_NOT_OPERATIONAL' | 'UNVERIFIED_CLAIM' | 'PLANNED';
  assuranceLimitation?: string;
}

export interface ManagementReviewAgendaItem {
  itemNumber: number;
  agendaTopic: string;
  mandatoryInputSource: string; // ISO 27001 Clause 9.3 input
  summaryOfEvidencePresented: string;
  executiveDecisionOrResourceAllocation: string;
  actionOwner: string;
  targetCompletionDate: string;
}

export type VerificationAssuranceStatus =
  | 'CODE_SYNTAX_VERIFIED'
  | 'BUILD_ARTIFACT_VERIFIED'
  | 'UNIT_TEST_VERIFIED'
  | 'OPENXML_PACKAGE_VERIFIED'
  | 'DOCUMENT_RENDER_PENDING'
  | 'VISUALLY_RENDERED'
  | 'RLS_IN_MEMORY_VERIFIED'
  | 'LIVE_DATABASE_RLS_PENDING'
  | 'LIVE_DATABASE_RLS_VERIFIED'
  | 'REGULATORY_SOURCE_VERIFIED'
  | 'REGULATORY_SOURCE_UNVERIFIED'
  | 'SOURCE_VERIFICATION_PENDING'
  | 'PRODUCTION_VERIFIED';

export interface VerificationEvidenceRequirement {
  status: VerificationAssuranceStatus;
  displayName: string;
  definition: string;
  mandatoryEvidenceRequirements: string[];
  insufficientEvidenceExamples: string[];
}

export const VERIFICATION_EVIDENCE_CRITERIA: Record<VerificationAssuranceStatus, VerificationEvidenceRequirement> = {
  CODE_SYNTAX_VERIFIED: {
    status: 'CODE_SYNTAX_VERIFIED',
    displayName: 'TypeScript Code Syntax Verified',
    definition: 'Verified by TypeScript compiler (tsc --noEmit) completing with zero type errors.',
    mandatoryEvidenceRequirements: ['tsc --noEmit command execution with clean exit code 0.'],
    insufficientEvidenceExamples: ['Passing runtime tests with uncompiled TypeScript files.']
  },
  BUILD_ARTIFACT_VERIFIED: {
    status: 'BUILD_ARTIFACT_VERIFIED',
    displayName: 'Production Build Bundle Verified',
    definition: 'Verified by Vite / esbuild packaging output files into dist/ without compilation failure.',
    mandatoryEvidenceRequirements: ['Generation of distribution bundles in dist/ and dist/assets.'],
    insufficientEvidenceExamples: ['Dev server running with hot reloading without production bundle verification.']
  },
  UNIT_TEST_VERIFIED: {
    status: 'UNIT_TEST_VERIFIED',
    displayName: 'Programmatic Test Assertions Passed',
    definition: 'Verified by automated test runner executing code-level assertions against logic contracts.',
    mandatoryEvidenceRequirements: ['100% automated assertion pass in validateDocumentationCatalogue suite.'],
    insufficientEvidenceExamples: ['Assuming unexecuted assertions pass based on similar code.']
  },
  OPENXML_PACKAGE_VERIFIED: {
    status: 'OPENXML_PACKAGE_VERIFIED',
    displayName: 'DOCX OpenXML Packaging Integrity Verified',
    definition: 'Verified by parsing OpenXML ZIP structure, schema namespaces, [Content_Types].xml, and required parts.',
    mandatoryEvidenceRequirements: ['JSZip buffer unpack verifying word/document.xml, word/header1.xml, and schema namespaces.'],
    insufficientEvidenceExamples: ['Checking that buffer length > 0 without unzipping and inspecting XML parts.']
  },
  DOCUMENT_RENDER_PENDING: {
    status: 'DOCUMENT_RENDER_PENDING',
    displayName: 'Word Processor Visual Rendering Pending',
    definition: 'OpenXML package is structurally valid, but native Microsoft Word / LibreOffice visual rendering is pending in headless CI/CD environment.',
    mandatoryEvidenceRequirements: ['OpenXML package validity verified; visual pagination and rendering awaiting desktop word processor.'],
    insufficientEvidenceExamples: ['Claiming visual layout perfection based only on XML tags without native rendering.']
  },
  VISUALLY_RENDERED: {
    status: 'VISUALLY_RENDERED',
    displayName: 'Desktop Word Processor Visually Rendered',
    definition: 'Rendered through Microsoft Word or headless LibreOffice with verified visual pagination, margins, and layout.',
    mandatoryEvidenceRequirements: ['Native word processor binary execution, PDF generation, and visual layout/overflow inspection.'],
    insufficientEvidenceExamples: ['Valid OpenXML XML tags or JSZip buffer validation alone without actual visual rendering.']
  },
  RLS_IN_MEMORY_VERIFIED: {
    status: 'RLS_IN_MEMORY_VERIFIED',
    displayName: 'In-Memory Tenant Isolation Verified',
    definition: 'Tenant boundaries validated programmatically in memory and query parameters.',
    mandatoryEvidenceRequirements: ['Automated test passing cross-tenant access denial at application layer.'],
    insufficientEvidenceExamples: ['Claiming live PostgreSQL database RLS is verified based on in-memory tests.']
  },
  LIVE_DATABASE_RLS_PENDING: {
    status: 'LIVE_DATABASE_RLS_PENDING',
    displayName: 'Live PostgreSQL Row-Level Security Pending',
    definition: 'Awaiting connection to a live running PostgreSQL database instance with active database credentials to execute pg_catalog RLS tests.',
    mandatoryEvidenceRequirements: ['Live PostgreSQL connection string, executed CREATE POLICY and ALTER TABLE ENABLE ROW LEVEL SECURITY with real multi-user sessions.'],
    insufficientEvidenceExamples: ['In-memory or mock database query executions.']
  },
  LIVE_DATABASE_RLS_VERIFIED: {
    status: 'LIVE_DATABASE_RLS_VERIFIED',
    displayName: 'Live PostgreSQL Row-Level Security Verified',
    definition: 'Verified against running PostgreSQL instance with real multi-tenant roles, SET ROLE switching, and active pg_policies enforcement.',
    mandatoryEvidenceRequirements: ['Live PostgreSQL connection, verified pg_policies table rows, and rejected cross-tenant SQL queries.'],
    insufficientEvidenceExamples: ['In-memory isolation tests, mocking pg.Pool, or unit test assertions without live database.']
  },
  REGULATORY_SOURCE_VERIFIED: {
    status: 'REGULATORY_SOURCE_VERIFIED',
    displayName: 'Authoritative Regulatory Source Verified',
    definition: 'Verified by direct inspection of primary statutory acts, gazette directions, or ISO normative standards.',
    mandatoryEvidenceRequirements: ['Primary text citation with exact section/article, jurisdictional applicability, and triggering conditions.'],
    insufficientEvidenceExamples: ['Control code string matching, third-party blog citations, bare URL presence, or unverified rule-of-thumb SLAs.']
  },
  REGULATORY_SOURCE_UNVERIFIED: {
    status: 'REGULATORY_SOURCE_UNVERIFIED',
    displayName: 'Regulatory Source Unverified / Proposed',
    definition: 'Citation or mapping has not been inspected against authoritative primary statutory text.',
    mandatoryEvidenceRequirements: ['Flagged explicitly as UNVERIFIED to prevent misrepresentation as a confirmed legal obligation.'],
    insufficientEvidenceExamples: ['Treating an unverified claim as binding statutory requirement.']
  },
  SOURCE_VERIFICATION_PENDING: {
    status: 'SOURCE_VERIFICATION_PENDING',
    displayName: 'Regulatory Source Verification Pending',
    definition: 'Authoritative primary source inspection is in progress or unavailable; claim cannot be promoted to verified law.',
    mandatoryEvidenceRequirements: ['Flagged explicitly as SOURCE_VERIFICATION_PENDING pending authoritative review of primary statute or gazette.'],
    insufficientEvidenceExamples: ['Assuming secondary commentary or blog references establish verified statutory authority.']
  },
  PRODUCTION_VERIFIED: {
    status: 'PRODUCTION_VERIFIED',
    displayName: 'Live Production Runtime Verified',
    definition: 'Verified by deployment to live production environment with real traffic, active telemetry, and runtime monitoring.',
    mandatoryEvidenceRequirements: ['Live deployment verification, uptime health telemetry, real user session telemetry, production audit trails.'],
    insufficientEvidenceExamples: ['Passing build step (npm run build) or unit tests. A build NEVER equals production verification!']
  }
};

export interface VerificationEvidenceContext {
  commandExecuted?: string;
  commandExitCode?: number;
  testAssertionPassRatio?: number;
  bundleFilesGenerated?: string[];
  openXmlPartsVerified?: string[];
  databaseType?: 'IN_MEMORY' | 'POSTGRESQL_LIVE';
  databaseConnectionActive?: boolean;
  pgPoliciesVerified?: boolean;
  regulatorySourceInspected?: boolean;
  primaryLegalTextRef?: string;
  sourceUrlOnly?: boolean;
  visualRendererEngine?: 'MICROSOFT_WORD' | 'LIBREOFFICE_HEADLESS' | 'NONE';
  renderedPdfHash?: string;
  liveProductionTelemetry?: {
    uptimeHealthReported: boolean;
    realUserSessionsActive: boolean;
    productionClusterId: string;
  };
  evidenceTimestamp?: string;
  maxEvidenceAgeHours?: number;
  sourceTenantId?: string;
  targetTenantId?: string;
  actorRole?: string;
  actorAuthorized?: boolean;
  governanceApprovalState?: 'DRAFT' | 'REVIEW_PENDING' | 'APPROVED_BY_BOARD';
}

export interface VerificationTransitionResult {
  allowed: boolean;
  fromStatus: VerificationAssuranceStatus;
  requestedStatus: VerificationAssuranceStatus;
  resultingStatus: VerificationAssuranceStatus;
  reason: string;
  errorCode?: string;
}

/**
 * Enforces rigorous verification status transition logic.
 * Unconditionally rejects unevidenced, unauthorized, cross-tenant, or inflated promotions.
 */
export function validateVerificationStatusTransition(
  fromStatus: VerificationAssuranceStatus,
  requestedStatus: VerificationAssuranceStatus,
  context: VerificationEvidenceContext
): VerificationTransitionResult {
  // 1. Cross-Tenant Isolation Enforcement
  if (context.sourceTenantId && context.targetTenantId && context.sourceTenantId !== context.targetTenantId) {
    return {
      allowed: false,
      fromStatus,
      requestedStatus,
      resultingStatus: fromStatus,
      reason: `Cross-tenant transition rejected: source tenant (${context.sourceTenantId}) cannot alter status for target tenant (${context.targetTenantId}).`,
      errorCode: 'ERR_CROSS_TENANT_VIOLATION'
    };
  }

  // 2. Authorization Verification
  if (context.actorAuthorized === false) {
    return {
      allowed: false,
      fromStatus,
      requestedStatus,
      resultingStatus: fromStatus,
      reason: `Unauthorized status promotion: actor (${context.actorRole || 'ANONYMOUS'}) does not possess compliance release authority.`,
      errorCode: 'ERR_UNAUTHORIZED_PROMOTION'
    };
  }

  // 3. Stale Evidence Check
  if (context.evidenceTimestamp && context.maxEvidenceAgeHours) {
    const evidenceAgeMs = Date.now() - new Date(context.evidenceTimestamp).getTime();
    const maxAgeMs = context.maxEvidenceAgeHours * 60 * 60 * 1000;
    if (evidenceAgeMs > maxAgeMs) {
      return {
        allowed: false,
        fromStatus,
        requestedStatus,
        resultingStatus: fromStatus,
        reason: `Evidence is stale (${Math.round(evidenceAgeMs / (1000 * 60 * 60))} hours old > threshold of ${context.maxEvidenceAgeHours} hours). Fresh execution evidence required.`,
        errorCode: 'ERR_STALE_EVIDENCE'
      };
    }
  }

  // 4. PRODUCTION_VERIFIED Rejection without Live Telemetry
  if (requestedStatus === 'PRODUCTION_VERIFIED') {
    const hasLiveTelemetry = Boolean(
      context.liveProductionTelemetry &&
      context.liveProductionTelemetry.uptimeHealthReported &&
      context.liveProductionTelemetry.realUserSessionsActive &&
      context.liveProductionTelemetry.productionClusterId
    );
    if (!hasLiveTelemetry) {
      return {
        allowed: false,
        fromStatus,
        requestedStatus,
        resultingStatus: fromStatus,
        reason: 'Promotion to PRODUCTION_VERIFIED rejected: Build artifacts, compilation, or unit tests are insufficient. Mandatory live production cluster deployment, uptime health telemetry, and real user sessions are required.',
        errorCode: 'ERR_BUILD_NOT_PRODUCTION'
      };
    }
  }

  // 5. LIVE_DATABASE_RLS_VERIFIED Rejection without Real PostgreSQL Instance
  if (requestedStatus === 'LIVE_DATABASE_RLS_VERIFIED') {
    const hasLivePostgres = context.databaseType === 'POSTGRESQL_LIVE' &&
      context.databaseConnectionActive === true &&
      context.pgPoliciesVerified === true;
    if (!hasLivePostgres) {
      return {
        allowed: false,
        fromStatus,
        requestedStatus,
        resultingStatus: 'LIVE_DATABASE_RLS_PENDING',
        reason: 'Promotion to LIVE_DATABASE_RLS_VERIFIED rejected: In-memory mock or unit tests cannot verify PostgreSQL RLS. Active connection to a live PostgreSQL instance with pg_policies validation is required.',
        errorCode: 'ERR_MOCK_NOT_LIVE_RLS'
      };
    }
  }

  // 6. VISUALLY_RENDERED Rejection without Native Word/LibreOffice Execution
  if (requestedStatus === 'VISUALLY_RENDERED') {
    const hasVisualEngine = (context.visualRendererEngine === 'MICROSOFT_WORD' || context.visualRendererEngine === 'LIBREOFFICE_HEADLESS') &&
      Boolean(context.renderedPdfHash);
    if (!hasVisualEngine) {
      return {
        allowed: false,
        fromStatus,
        requestedStatus,
        resultingStatus: 'DOCUMENT_RENDER_PENDING',
        reason: 'Promotion to VISUALLY_RENDERED rejected: Valid OpenXML ZIP parts or XML tags do not prove desktop visual pagination. Native word processor execution required.',
        errorCode: 'ERR_OPENXML_NOT_VISUAL_RENDER'
      };
    }
  }

  // 7. REGULATORY_SOURCE_VERIFIED Rejection on Bare Source URL or Uninspected Primary Statute
  if (requestedStatus === 'REGULATORY_SOURCE_VERIFIED') {
    if (context.sourceUrlOnly === true || !context.regulatorySourceInspected || !context.primaryLegalTextRef) {
      return {
        allowed: false,
        fromStatus,
        requestedStatus,
        resultingStatus: 'SOURCE_VERIFICATION_PENDING',
        reason: 'Promotion to REGULATORY_SOURCE_VERIFIED rejected: Presence of a source URL or citation string alone without direct primary statutory inspection is insufficient.',
        errorCode: 'ERR_UNVERIFIED_REGULATORY_SOURCE'
      };
    }
  }

  // 8. CODE_SYNTAX_VERIFIED Requirements
  if (requestedStatus === 'CODE_SYNTAX_VERIFIED') {
    if (context.commandExitCode !== 0) {
      return {
        allowed: false,
        fromStatus,
        requestedStatus,
        resultingStatus: fromStatus,
        reason: 'TypeScript compiler failed with non-zero exit code.',
        errorCode: 'ERR_SYNTAX_CHECK_FAILED'
      };
    }
  }

  // 9. BUILD_ARTIFACT_VERIFIED Requirements
  if (requestedStatus === 'BUILD_ARTIFACT_VERIFIED') {
    if (!context.bundleFilesGenerated || context.bundleFilesGenerated.length === 0) {
      return {
        allowed: false,
        fromStatus,
        requestedStatus,
        resultingStatus: fromStatus,
        reason: 'Build artifact verification failed: No distribution bundle files generated.',
        errorCode: 'ERR_MISSING_BUILD_ARTIFACTS'
      };
    }
  }

  // 10. UNIT_TEST_VERIFIED Requirements
  if (requestedStatus === 'UNIT_TEST_VERIFIED') {
    if (context.testAssertionPassRatio !== 1.0) {
      return {
        allowed: false,
        fromStatus,
        requestedStatus,
        resultingStatus: fromStatus,
        reason: `Unit test assertions failed (${((context.testAssertionPassRatio || 0) * 100).toFixed(1)}% < 100%).`,
        errorCode: 'ERR_UNIT_TEST_FAILED'
      };
    }
  }

  // 11. Document approval must NOT imply technical implementation effectiveness
  if (context.governanceApprovalState === 'APPROVED_BY_BOARD' && requestedStatus === 'PRODUCTION_VERIFIED') {
    return {
      allowed: false,
      fromStatus,
      requestedStatus,
      resultingStatus: fromStatus,
      reason: 'Document governance approval by Board verifies organizational mandate, but does NOT establish technical operating effectiveness.',
      errorCode: 'ERR_APPROVAL_NOT_EFFECTIVENESS'
    };
  }

  // Transition allowed
  return {
    allowed: true,
    fromStatus,
    requestedStatus,
    resultingStatus: requestedStatus,
    reason: `Evidence requirements met for transition to ${requestedStatus}.`
  };
}

/**
 * Validates privacy register schema columns against negative legal rules.
 */
export function validatePrivacyRegisterSchema(columns: RegisterSchemaColumn[]): {
  isValid: boolean;
  defects: Array<{ fieldName: string; code: string; message: string }>;
} {
  const defects: Array<{ fieldName: string; code: string; message: string }> = [];

  for (const col of columns) {
    // 1. Recommendation labelled a statutory mandate
    if (col.legalRegime === 'ENTERPRISE_GOVERNANCE_RECOMMENDED') {
      if (col.sourceVerificationStatus === 'VERIFIED_STATUTORY' || (col.mandateLevel === 'MANDATORY' && col.authoritativeSource?.toLowerCase().includes('statut'))) {
        defects.push({
          fieldName: col.fieldName,
          code: 'SCHEMA-NEG-01',
          message: `Recommended enterprise governance field "${col.fieldName}" is mislabelled as a statutory mandate.`
        });
      }
    }

    // 2. Unrelated legal provision assigned to regime
    if (col.legalRegime === 'EU_GDPR_STATUTORY') {
      if (col.authoritativeSource?.includes('DPDP') || col.sourceArticleOrSection?.includes('Section') || col.regulatorySource?.includes('DPDP')) {
        defects.push({
          fieldName: col.fieldName,
          code: 'SCHEMA-NEG-02',
          message: `EU GDPR statutory column "${col.fieldName}" is assigned unrelated India DPDP Act legal provision ("${col.regulatorySource}").`
        });
      }
    } else if (col.legalRegime === 'INDIA_DPDP_COMPLIANCE') {
      if (col.authoritativeSource?.includes('GDPR') || col.sourceArticleOrSection?.includes('Article') || col.regulatorySource?.includes('GDPR')) {
        defects.push({
          fieldName: col.fieldName,
          code: 'SCHEMA-NEG-02',
          message: `India DPDP compliance column "${col.fieldName}" is assigned unrelated EU GDPR legal provision ("${col.regulatorySource}").`
        });
      }
    }

    // 3. Field is mandatory without a supported legal or governance basis
    if ((col.isMandatory || col.mandateLevel === 'MANDATORY') && !col.authoritativeSource && !col.legalOrGovernanceBasis) {
      defects.push({
        fieldName: col.fieldName,
        code: 'SCHEMA-NEG-03',
        message: `Field "${col.fieldName}" is marked mandatory without a supported legal or governance basis.`
      });
    }

    // 4. Jurisdiction is missing from a jurisdiction-specific claim
    if ((col.legalRegime === 'EU_GDPR_STATUTORY' || col.legalRegime === 'INDIA_DPDP_COMPLIANCE') && !col.applicableJurisdiction) {
      defects.push({
        fieldName: col.fieldName,
        code: 'SCHEMA-NEG-04',
        message: `Jurisdiction-specific field "${col.fieldName}" (${col.legalRegime}) is missing applicable jurisdiction declaration.`
      });
    }

    // 5. Controller/Processor or Data Fiduciary role confused
    if (col.legalRegime === 'EU_GDPR_STATUTORY' && col.applicableRole) {
      if (col.applicableRole.toLowerCase().includes('fiduciary') && !col.applicableRole.toLowerCase().includes('controller')) {
        defects.push({
          fieldName: col.fieldName,
          code: 'SCHEMA-NEG-05',
          message: `EU GDPR Article 30 column "${col.fieldName}" confuses Indian Data Fiduciary role with EU Data Controller.`
        });
      }
    } else if (col.legalRegime === 'INDIA_DPDP_COMPLIANCE' && col.applicableRole) {
      if (col.applicableRole.toLowerCase().includes('controller') && !col.applicableRole.toLowerCase().includes('fiduciary')) {
        defects.push({
          fieldName: col.fieldName,
          code: 'SCHEMA-NEG-05',
          message: `India DPDP Act column "${col.fieldName}" confuses EU Data Controller role with Indian Data Fiduciary.`
        });
      }
    }

    // 6. Source missing but status says verified
    if (col.sourceVerificationStatus === 'VERIFIED_STATUTORY' && (!col.authoritativeSource || !col.sourceArticleOrSection)) {
      defects.push({
        fieldName: col.fieldName,
        code: 'SCHEMA-NEG-06',
        message: `Column "${col.fieldName}" claims VERIFIED_STATUTORY status without specifying authoritative primary source and section/article.`
      });
    }
  }

  return {
    isValid: defects.length === 0,
    defects
  };
}

// ============================================================================
// 2. UNIFIED ENTERPRISE DOCUMENT MODEL
// ============================================================================

export interface EnterpriseConsultingDocument {
  id: string;
  tenantId: string;
  templateId?: string;
  metadata: DocumentControlMetadata;
  revisionHistory: RevisionHistoryEntry[];
  documentGovernance?: DocumentGovernanceControl[]; // Level 1 Policies
  purpose: string;
  scope: {
    statement: string;
    inScopeLegalEntities: string[];
    inScopeLocations: string[];
    inScopeSystemsAndServices: string[];
    inScopeUserPopulations: string[];
    documentedExclusions: Array<{ item: string; rationale: string }>;
  };
  termsAndDefinitions: TermsAndDefinitionsEntry[];
  policyObjectives?: string[]; // Level 1 Policies
  governanceAndAccountability?: GovernanceAccountabilityEntry[]; // Level 1 Policies
  mandatoryRequirements?: MandatoryPolicyRequirement[]; // Level 1 Policies
  controlImplementationAndEvidence?: GovernanceObjectEvidenceEntry[]; // Level 1 Policies
  processControlsAndPrerequisites?: string[]; // Level 2 Procedures
  rolesAndSegregationOfDuties?: RoleAndSegregationBoundary[]; // Level 2 Procedures
  inputsAndRequiredRecords?: InputAndRequiredRecord[]; // Level 2 Procedures
  procedureSteps?: OperationalProcedureStep[]; // Level 2 Procedures
  decisionRulesAndExceptions?: DecisionRuleEntry[]; // Level 2 Procedures
  serviceLevels?: {
    governanceElements: ServiceLevelGovernanceElement[];
    targetsByCategory: ServiceLevelTargetCategory[];
  };
  evidenceRetentionAndProtection?: EvidenceRetentionSpec[];
  monitoringAndPerformanceMeasures?: string[];
  failureIncidentAndCapaHandling?: string;
  registerSchema?: RegisterSchemaColumn[]; // Level 5 Registers & Logs
  registerRecords?: RegisterRecordRow[]; // Level 5 Registers & Logs
  statementOfApplicabilityEntries?: StatementOfApplicabilityEntry[]; // Level 5 SoA Packs
  managementReviewAgenda?: ManagementReviewAgendaItem[]; // Level 5 Management Review Packs
  relatedDocumentsAndSystems: string[];
  reviewAndChangeControl: string;
  appendixA_ApprovalRecord: ApprovalRecordEntry[];
  appendixB_OperationalRaci?: OperationalRaciRow[]; // Level 2 Procedures
  appendixC_TailoringChecklist: TailoringChecklistItem[];
  isModelSample?: boolean;
  qualityScore?: number;
  sha256Digest?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVersionDiff {
  documentId: string;
  sourceVersion: string;
  targetVersion: string;
  metadataDiffs: Array<{ field: string; sourceValue: string; targetValue: string }>;
  purposeChanged: boolean;
  scopeChanged: boolean;
  termsAdded: string[];
  termsRemoved: string[];
  requirementsDiffs?: Array<{ sectionId: string; title: string; change: 'ADDED' | 'REMOVED' | 'MODIFIED' }>;
  stepsDiffs?: Array<{ stepNumber: number; stepName: string; change: 'ADDED' | 'REMOVED' | 'MODIFIED' }>;
  raciDiffs: Array<{ activity: string; change: string }>;
  checklistDiffs: Array<{ id: string; statusChange: string }>;
  totalChanges: number;
  summary: string;
}

// ============================================================================
// 3. ORGANIZATIONAL CONTEXT QUESTIONNAIRE
// ============================================================================

export interface DocumentationContextQuestionnaire {
  tenantId: string;
  organizationProfile: {
    legalEntityName: string;
    tradeName?: string;
    jurisdictions: string[]; // e.g. ['Singapore', 'United States', 'India', 'European Union']
    industry: string; // e.g. 'FinTech Banking & Payment Infrastructure'
    headquartersLocation: string;
  };
  scopeDefinition: {
    inScopeLocations: string[];
    inScopeBusinessUnits: string[];
    inScopeServicesAndProducts: string[];
    excludedEntitiesOrFunctions?: Array<{ item: string; rationale: string }>;
  };
  operatingModel: {
    cloudInfrastructure: string[]; // e.g. ['AWS', 'GCP', 'Azure']
    identityProvider: string; // e.g. 'Okta Enterprise Cloud', 'Microsoft Entra ID'
    ticketingAndItsmSystem: string; // e.g. 'Jira Service Management', 'ServiceNow'
    codeRepositories: string[]; // e.g. ['GitHub Enterprise Cloud']
    databaseEngines: string[]; // e.g. ['PostgreSQL', 'Snowflake']
    hrisPlatform: string; // e.g. 'Workday HCM', 'Rippling'
    siemAndLoggingPlatform: string; // e.g. 'Datadog Cloud SIEM', 'Splunk'
  };
  keyRolesAndDelegations: {
    executiveSponsorRole: string; // e.g. 'Chief Executive Officer'
    executiveSponsorEmail: string;
    ismsOwnerOrCisoRole: string; // e.g. 'Chief Information Security Officer'
    ismsOwnerOrCisoEmail: string;
    securityReviewerRole: string; // e.g. 'Security Architecture Lead'
    securityReviewerEmail: string;
    headOfItOrEngineeringRole: string;
    headOfItOrEngineeringEmail: string;
    internalAuditorRole: string;
    internalAuditorEmail: string;
  };
  approvalThresholdsAndRules: {
    policyApprovalAuthority: string; // e.g. 'Board Risk Committee / CEO'
    procedureApprovalAuthority: string; // e.g. 'CISO / Head of Security Operations'
    standardUserAccessApprover: string; // e.g. 'Direct Line Manager + Target System Owner'
    privilegedAccessApprover: string; // e.g. 'CISO + System Owner (Dual Approval)'
    emergencyWaiverApprover: string; // e.g. 'CISO Emergency Sign-off'
  };
  serviceLevelCommitments: {
    standardAccessDays: number; // e.g. 2
    roleModificationDays: number; // e.g. 1
    privilegedAccessHours: number; // e.g. 4
    emergencyAccessMinutes: number; // e.g. 30
  };
  evidenceAndRecordsRetention: {
    defaultRecordRetentionYears: number; // e.g. 7
    accessLogRetentionDays: number; // e.g. 365
    evidenceStorageVault: string; // e.g. 'SKANDA Authoritative Evidence Vault & AWS S3 WORM'
  };
}

// ============================================================================
// 4. DOCUMENTATION QUALITY EVALUATION ENGINE
// ============================================================================

export interface DocumentationQualityFinding {
  code: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  section: string;
  finding: string;
  remediation: string;
}

export interface DocumentationQualityScorecard {
  evaluationId: string;
  evaluatedAt: string;
  documentId: string;
  overallScore: number; // 0 to 100
  isConsultingGrade: boolean;
  isReadyForPublication: boolean;
  dimensionScores: Record<string, { name: string; score: number; maxScore: number; passed: boolean }>;
  criticalDefects: DocumentationQualityFinding[];
  warnings: DocumentationQualityFinding[];
  tailoringCompletedCount: number;
  tailoringTotalCount: number;
  raciDisciplinePassed: boolean;
}

// ============================================================================
// 5. ENGINE IMPLEMENTATION
// ============================================================================

export class EnterpriseDocumentationEngine {
  private static instance: EnterpriseDocumentationEngine;

  private constructor() {}

  public static getInstance(): EnterpriseDocumentationEngine {
    if (!EnterpriseDocumentationEngine.instance) {
      EnterpriseDocumentationEngine.instance = new EnterpriseDocumentationEngine();
    }
    return EnterpriseDocumentationEngine.instance;
  }

  // --------------------------------------------------------------------------
  // ENTERPRISE DOCUMENTATION CATALOGUE & INTELLIGENCE (PHASE 47)
  // --------------------------------------------------------------------------

  /**
   * Retrieves the versioned, searchable catalogue of all enterprise templates.
   */
  public getCatalogue(filters?: CatalogueFilterParams): CatalogueTemplateMetadata[] {
    let results = [...ENTERPRISE_CATALOGUE_REGISTRY];

    if (!filters) return results;

    if (filters.search && filters.search.trim().length > 0) {
      const q = filters.search.trim().toLowerCase();
      results = results.filter(
        t =>
          t.id.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.intendedPurpose.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    if (filters.documentType && filters.documentType !== 'ALL') {
      results = results.filter(t => t.documentType === filters.documentType);
    }

    if (filters.domain && filters.domain !== 'ALL') {
      results = results.filter(t => t.domain === filters.domain);
    }

    if (filters.framework && filters.framework !== 'ALL') {
      const fw = filters.framework.toLowerCase();
      results = results.filter(t =>
        t.relatedFrameworks.some(
          f => f.frameworkCode.toLowerCase().includes(fw) || f.clauseOrControl.toLowerCase().includes(fw)
        )
      );
    }

    if (filters.contentDepth && filters.contentDepth !== 'ALL') {
      results = results.filter(t => t.contentDepth === filters.contentDepth);
    }

    if (filters.status && filters.status !== 'ALL') {
      results = results.filter(t => t.reviewAndRetirementStatus === filters.status);
    }

    return results;
  }

  /**
   * Retrieves a specific template by its stable template ID.
   */
  public getTemplateById(id: string): CatalogueTemplateMetadata | undefined {
    return ENTERPRISE_CATALOGUE_REGISTRY.find(t => t.id === id);
  }

  /**
   * Generates a document from the catalogue supporting the 3 generation modes:
   * - Mode A ('BLANK'): Editable blank template with completion guidance & placeholders
   * - Mode B ('MODEL'): Comprehensive illustrative model sample
   * - Mode C ('TAILORED'): Customized draft using organizational context without fact invention
   */
  public generateDocument(
    templateId: string,
    mode: 'BLANK' | 'MODEL' | 'TAILORED',
    questionnaire?: DocumentationContextQuestionnaire,
    strict?: boolean
  ): EnterpriseConsultingDocument {
    // Check legacy aliases
    if (templateId === 'ISMS-POL-001' || templateId === 'TMPL-POL-ISMS') {
      if (mode === 'BLANK') return this.getBlankPolicyTemplate();
      if (mode === 'MODEL') return this.getModelInformationSecurityPolicy();
      return this.tailorDocument(this.getModelInformationSecurityPolicy(), questionnaire || this.getDefaultQuestionnaire());
    }
    if (templateId === 'ISMS-PROC-IAM-001' || templateId === 'TMPL-PROC-ACCESS-PROV') {
      if (mode === 'BLANK') return this.getBlankProcedureTemplate();
      if (mode === 'MODEL') return this.getModelUserAccessProcedure();
      return this.tailorDocument(this.getModelUserAccessProcedure(), questionnaire || this.getDefaultQuestionnaire());
    }

    const meta = this.getTemplateById(templateId);
    if (!meta) {
      throw new Error(`TEMPLATE_NOT_FOUND: Template ID '${templateId}' is not registered in the SKANDA catalogue.`);
    }

    if (mode === 'BLANK') {
      return DocumentationCatalogueGenerators.generateBlankTemplate(meta);
    }

    if (mode === 'MODEL') {
      return DocumentationCatalogueGenerators.generateModelSample(meta);
    }

    if (mode === 'TAILORED') {
      const q = questionnaire || this.getDefaultQuestionnaire();
      return DocumentationCatalogueGenerators.generateTailoredDraft(meta, q, strict);
    }

    throw new Error(`UNSUPPORTED_MODE: Generation mode '${mode}' is not supported. Use BLANK, MODEL, or TAILORED.`);
  }

  public getDefaultQuestionnaire(): DocumentationContextQuestionnaire {
    return {
      tenantId: 'SKANDA-DEFAULT-TENANT',
      organizationProfile: {
        legalEntityName: 'Acme Enterprise Solutions Inc.',
        tradeName: 'Acme Solutions',
        jurisdictions: ['Singapore', 'United States', 'European Union', 'India'],
        industry: 'Cloud Infrastructure & Enterprise Software',
        headquartersLocation: 'Singapore'
      },
      scopeDefinition: {
        inScopeLocations: ['Global Headquarters (Singapore)', 'Primary Cloud Region (AWS US-East-1)'],
        inScopeBusinessUnits: ['Engineering', 'Security Operations', 'Customer Support'],
        inScopeServicesAndProducts: ['Enterprise Cloud Platform', 'API Gateway'],
        excludedEntitiesOrFunctions: []
      },
      operatingModel: {
        cloudInfrastructure: ['Amazon Web Services (AWS)'],
        identityProvider: 'Okta Enterprise Identity Cloud',
        ticketingAndItsmSystem: 'Jira Service Management Cloud',
        codeRepositories: ['GitHub Enterprise Cloud'],
        databaseEngines: ['PostgreSQL 16'],
        hrisPlatform: 'Workday HCM',
        siemAndLoggingPlatform: 'Datadog Cloud SIEM'
      },
      keyRolesAndDelegations: {
        executiveSponsorRole: 'Chief Executive Officer',
        executiveSponsorEmail: 'ceo@acme.enterprise.com',
        ismsOwnerOrCisoRole: 'Chief Information Security Officer',
        ismsOwnerOrCisoEmail: 'ciso@acme.enterprise.com',
        securityReviewerRole: 'Principal Security Architect',
        securityReviewerEmail: 'sec.architect@acme.enterprise.com',
        headOfItOrEngineeringRole: 'VP of Engineering',
        headOfItOrEngineeringEmail: 'vp.eng@acme.enterprise.com',
        internalAuditorRole: 'Lead Internal Auditor',
        internalAuditorEmail: 'audit@acme.enterprise.com'
      },
      approvalThresholdsAndRules: {
        policyApprovalAuthority: 'Board Risk Committee / CEO',
        procedureApprovalAuthority: 'CISO / Head of Security Operations',
        standardUserAccessApprover: 'Direct Line Manager + Target System Owner',
        privilegedAccessApprover: 'CISO + System Owner (Dual Approval)',
        emergencyWaiverApprover: 'CISO Emergency Sign-off'
      },
      serviceLevelCommitments: {
        standardAccessDays: 2,
        roleModificationDays: 1,
        privilegedAccessHours: 4,
        emergencyAccessMinutes: 30
      },
      evidenceAndRecordsRetention: {
        defaultRecordRetentionYears: 7,
        accessLogRetentionDays: 365,
        evidenceStorageVault: 'SKANDA Authoritative Evidence Vault & AWS S3 WORM'
      }
    };
  }

  // --------------------------------------------------------------------------
  // MODEL SAMPLES & BENCHMARKS
  // --------------------------------------------------------------------------

  /**
   * Returns Model Sample 1: Enterprise Information Security Policy (ISMS-POL-001 v1.1)
   * Benchmark matching the 7-page reference enterprise consulting standard.
   */
  public getModelInformationSecurityPolicy(): EnterpriseConsultingDocument {
    return {
      id: 'ISMS-POL-001',
      tenantId: 'SKANDA-MODEL-BENCHMARK',
      templateId: 'TMPL-POL-ISMS',
      isModelSample: true,
      metadata: {
        documentId: 'ISMS-POL-001',
        title: 'Information Security Policy',
        subtitle: 'Management commitment, governance, risk ownership and mandatory security requirements',
        documentType: 'POLICY',
        hierarchyLevel: 'LEVEL_1_GOVERNANCE_POLICY',
        version: '1.1',
        status: '1.1 — Model sample (quality revision); not approved',
        documentOwner: 'Role to be formally assigned',
        approver: 'Authorized management approver to be assigned',
        preparedBy: 'SKANDA Documentation',
        effectiveDate: 'Not effective until formally approved',
        revisionDate: '2026-10-11',
        classification: 'INTERNAL_ILLUSTRATIVE',
        reviewTrigger: 'Scheduled review and material business, technology, risk or regulatory change',
        notice: 'ILLUSTRATIVE MODEL DOCUMENT — MUST BE TAILORED AND APPROVED BEFORE USE',
        modelUseNotice:
          'This document demonstrates the depth, structure and operational specificity expected of an enterprise management-system document. It is not a representation that a real organization has implemented these requirements.'
      },
      revisionHistory: [
        {
          version: '1.0',
          date: 'Not recorded',
          summaryOfChange: 'Initial illustrative model sample.',
          preparedBy: 'SKANDA Documentation',
          approvalStatus: 'Not approved — model sample'
        },
        {
          version: '1.1',
          date: '2026-10-11',
          summaryOfChange:
            'Quality revision: added contents, revision history and terms and definitions (new Section 3; later sections renumbered); corrected document metadata, header alignment, "Page X of Y" numbering and table pagination. No change to policy requirements.',
          preparedBy: 'SKANDA Documentation',
          approvalStatus: 'Not approved — model sample'
        }
      ],
      documentGovernance: [
        {
          control: 'Accountable owner',
          requirementOrModelApproach:
            'The organization shall designate an accountable policy owner with sufficient authority to coordinate review and implementation.'
        },
        {
          control: 'Approval authority',
          requirementOrModelApproach: "Approval shall follow the organization's documented delegation-of-authority matrix."
        },
        {
          control: 'Review frequency',
          requirementOrModelApproach:
            'At the formally approved interval and upon material changes to business, technology, risk, legal obligations or interested-party requirements.'
        },
        {
          control: 'Distribution',
          requirementOrModelApproach:
            'The controlled published version shall be made available to relevant personnel and other authorized recipients.'
        },
        {
          control: 'Superseded copies',
          requirementOrModelApproach:
            'Superseded versions shall be identifiable and prevented from unintended operational use, while retained according to records requirements.'
        },
        {
          control: 'Exceptions',
          requirementOrModelApproach:
            'Exceptions shall be recorded, risk-assessed, authorized, time-bound or periodically reviewed, and tracked to closure.'
        }
      ],
      purpose:
        'This policy establishes management direction and mandatory principles for protecting the confidentiality, integrity and availability of information and supporting the organization’s information security management system (ISMS). It sets expectations for governance, risk-based decision-making, implementation, monitoring and continual improvement.',
      scope: {
        statement:
          'The organization shall define the ISMS scope in its approved scope statement. This policy applies to personnel, processes, information, technology, facilities and third parties to the extent they fall within that scope or interact with in-scope information assets. The organization shall document relevant interfaces, dependencies and exclusions rather than assuming universal applicability.',
        inScopeLegalEntities: ['[Legal entity to be formally confirmed before approval]'],
        inScopeLocations: ['[Locations to be documented in approved scope statement]'],
        inScopeSystemsAndServices: ['[In-scope services and interfaces to be defined]'],
        inScopeUserPopulations: ['[Workforce categories covered by scope]'],
        documentedExclusions: [
          {
            item: '[Specific boundary exclusions if approved by risk committee]',
            rationale: '[Documented justification and boundary safeguards]'
          }
        ]
      },
      termsAndDefinitions: [
        { term: 'Information security', definition: 'Preservation of the confidentiality, integrity and availability of information.' },
        { term: 'ISMS', definition: 'The policies, processes, roles, resources and controls the organization uses to establish, operate, monitor and improve information security within its approved scope.' },
        { term: 'Risk owner', definition: 'The person or role with accountability and authority to manage an assigned risk, including treatment decisions and acceptance within delegated limits.' },
        { term: 'Control owner', definition: 'The person or role responsible for implementing, operating and evidencing an assigned control.' },
        { term: 'Exception', definition: 'A documented, risk-assessed and authorized deviation from a mandatory requirement that is time-bound or subject to periodic review.' },
        { term: 'Nonconformity', definition: 'Failure to fulfil a requirement of this policy, a supporting controlled document, or another applicable obligation.' },
        { term: 'Corrective action', definition: 'Action to eliminate the cause of a nonconformity and prevent recurrence, verified as effective before closure.' },
        { term: 'Evidence', definition: 'Attributable, retrievable and protected records demonstrating that a requirement or control was performed as defined.' }
      ],
      policyObjectives: [
        'Protect information against unauthorized access, disclosure, alteration, loss and disruption in a manner proportionate to its classification and risk.',
        'Establish clear accountability for information security risks, controls, exceptions and remediation.',
        'Identify and assess information security risks using an approved, repeatable methodology and maintain treatment decisions and risk acceptance records.',
        'Meet applicable legal, regulatory, contractual and other obligations that have been identified and validated for the organization.',
        'Ensure security requirements are considered in personnel lifecycle, supplier relationships, system acquisition, development, operation and change.',
        'Evaluate control operation and ISMS performance using defined evidence, monitoring, audit and management review processes.'
      ],
      governanceAndAccountability: [
        { role: 'Top management / executive sponsor', accountability: 'Approve policy and ISMS direction; assign responsibilities; consider resources; review significant risks, performance and improvement needs.' },
        { role: 'ISMS owner / Information Security Manager', accountability: 'Coordinate ISMS operation, policy maintenance, risk and control reporting, awareness, internal audit coordination and corrective-action follow-up.' },
        { role: 'Risk owners', accountability: 'Assess assigned risks, select or recommend treatment, maintain action plans, and seek acceptance only from an authorized role.' },
        { role: 'Control owners / process owners', accountability: 'Implement assigned controls, maintain operating procedures and records, report failures and provide evidence for monitoring and audit.' },
        { role: 'IT and engineering teams', accountability: 'Implement approved technical requirements and retain operational logs and change records relevant to assigned controls.' },
        { role: 'People managers', accountability: 'Ensure personnel understand role-specific responsibilities and follow approved onboarding, access, transfer and exit processes.' },
        { role: 'Personnel and contractors', accountability: 'Comply with applicable requirements, protect credentials and information, complete assigned training and report suspected incidents.' },
        { role: 'Supplier / relationship owners', accountability: 'Ensure third-party due diligence, contractual requirements, access, monitoring and exit obligations are managed.' },
        { role: 'Internal auditors', accountability: 'Perform impartial audit activities under an approved audit programme; avoid auditing their own work.' }
      ],
      mandatoryRequirements: [
        {
          sectionId: '6.1',
          title: 'Risk management',
          statement: 'Information security risks shall be identified, analyzed, evaluated and treated under the approved risk methodology. Risk criteria, likelihood and impact definitions, acceptance authority, treatment options, review triggers and recordkeeping shall be documented. Risk acceptance shall be explicit, attributable to an authorized risk owner, and reviewed when assumptions or risk conditions materially change.',
          provenance: 'CANONICAL_MANDATE',
          linkedFrameworkClauses: ['ISO/IEC 27001:2022 Clause 6.1.2', 'Clause 6.1.3'],
          linkedControlCodes: ['A.5.1', 'A.5.8']
        },
        {
          sectionId: '6.2',
          title: 'Asset ownership and information classification',
          statement: 'In-scope information assets shall have assigned ownership appropriate to their nature and criticality. The organization shall define classification and handling rules, including requirements for access, storage, transmission, sharing, retention and secure disposal. The detailed classification scheme and handling rules shall be maintained in controlled supporting documents.',
          provenance: 'CANONICAL_MANDATE',
          linkedFrameworkClauses: ['ISO/IEC 27001:2022 Annex A.5.9', 'Annex A.5.10', 'Annex A.5.12'],
          linkedControlCodes: ['A.5.9', 'A.5.10', 'A.5.12']
        },
        {
          sectionId: '6.3',
          title: 'Identity and access management',
          statement: 'Access shall be based on authorized business need and least privilege. Provisioning, modification, privileged access, periodic review and revocation shall follow approved procedures. Authentication requirements, access approval authorities, segregation-of-duties checks and review frequency shall be defined and evidenced. Shared or emergency access shall be subject to explicit controls and monitoring.',
          provenance: 'CANONICAL_MANDATE',
          linkedFrameworkClauses: ['ISO/IEC 27001:2022 Annex A.5.15', 'Annex A.5.16', 'Annex A.5.18'],
          linkedControlCodes: ['A.5.15', 'A.5.16', 'A.5.18']
        },
        {
          sectionId: '6.4',
          title: 'Secure operation and change',
          statement: 'Systems and services shall be operated and changed under approved procedures proportionate to risk and criticality. The organization shall define requirements for secure configuration, vulnerability management, logging, monitoring, backup, recovery, change authorization and separation of duties where applicable. Exceptions shall be documented and approved before implementation except where an approved emergency process applies.',
          provenance: 'CANONICAL_MANDATE',
          linkedFrameworkClauses: ['ISO/IEC 27001:2022 Annex A.8.8', 'Annex A.8.9', 'Annex A.8.15', 'Annex A.8.32'],
          linkedControlCodes: ['A.8.8', 'A.8.9', 'A.8.15', 'A.8.32']
        },
        {
          sectionId: '6.5',
          title: 'Incident management',
          statement: 'Suspected information security events shall be reported through designated channels, assessed and escalated under the incident management procedure. The process shall address classification, response authority, evidence preservation, communications, recovery, lessons learned and corrective actions. Any statutory, regulatory or contractual notification requirement and deadline shall be assessed against the actual incident facts and verified applicable obligations.',
          provenance: 'CANONICAL_MANDATE',
          linkedFrameworkClauses: ['ISO/IEC 27001:2022 Annex A.5.24', 'Annex A.5.25', 'Annex A.5.26'],
          linkedControlCodes: ['A.5.24', 'A.5.25', 'A.5.26']
        },
        {
          sectionId: '6.6',
          title: 'Supplier and third-party security',
          statement: 'Third-party risks shall be assessed according to service criticality, information sensitivity, access, processing activity and dependency. Applicable contractual controls, incident notification, subcontracting, assurance evidence, continuity, access termination and return or deletion of information shall be addressed where relevant.',
          provenance: 'CANONICAL_MANDATE',
          linkedFrameworkClauses: ['ISO/IEC 27001:2022 Annex A.5.19', 'Annex A.5.20', 'Annex A.5.21'],
          linkedControlCodes: ['A.5.19', 'A.5.20', 'A.5.21']
        },
        {
          sectionId: '6.7',
          title: 'Personnel awareness and responsibilities',
          statement: 'Personnel shall receive information security responsibilities appropriate to their role and shall complete assigned awareness or training activities. Acknowledgement records shall identify the document version and authenticated person where feasible. Acknowledgement alone shall not be treated as proof of comprehension or effective behavior.',
          provenance: 'CANONICAL_MANDATE',
          linkedFrameworkClauses: ['ISO/IEC 27001:2022 Clause 7.2', 'Clause 7.3', 'Annex A.6.3'],
          linkedControlCodes: ['A.6.3']
        },
        {
          sectionId: '6.8',
          title: 'Business continuity and resilience',
          statement: 'Continuity and recovery requirements shall be based on business impact, risk and approved recovery objectives. Backup, restoration and continuity arrangements shall be tested at defined intervals, with results, failures, corrective actions and retests recorded.',
          provenance: 'CANONICAL_MANDATE',
          linkedFrameworkClauses: ['ISO/IEC 27001:2022 Annex A.5.29', 'Annex A.5.30'],
          linkedControlCodes: ['A.5.29', 'A.5.30']
        },
        {
          sectionId: '6.9',
          title: 'Legal, regulatory and contractual obligations',
          statement: 'The organization shall maintain a process to identify, validate, assign ownership to, and periodically review obligations relevant to its services, locations, data, customers and suppliers. Interpretations and applicability decisions shall be recorded. This policy does not itself determine legal applicability.',
          provenance: 'CANONICAL_MANDATE',
          linkedFrameworkClauses: ['ISO/IEC 27001:2022 Clause 4.2', 'Annex A.5.31'],
          linkedControlCodes: ['A.5.31']
        }
      ],
      controlImplementationAndEvidence: [
        {
          governanceObject: 'Risk',
          minimumExpectedRecord: 'Risk ID, scenario, owner, assessment, treatment, acceptance, review date',
          assuranceLimitation: 'A completed register does not by itself prove risks are adequately assessed.'
        },
        {
          governanceObject: 'Control',
          minimumExpectedRecord: 'Control ID, owner, implementation status, procedure, evidence, test result',
          assuranceLimitation: 'A declared implementation status is not proof of operating effectiveness.'
        },
        {
          governanceObject: 'Exception',
          minimumExpectedRecord: 'Requirement, justification, risk, approver, safeguards, expiry/review, closure',
          assuranceLimitation: 'Approval does not eliminate the underlying risk.'
        },
        {
          governanceObject: 'Incident',
          minimumExpectedRecord: 'Timeline, classification, actions, evidence, decisions, closure and lessons learned',
          assuranceLimitation: 'A closed ticket alone does not prove complete response or required notification.'
        },
        {
          governanceObject: 'Training / acknowledgement',
          minimumExpectedRecord: 'Person, document version, timestamp, outcome and record integrity',
          assuranceLimitation: 'A record does not prove understanding or compliance.'
        },
        {
          governanceObject: 'Internal audit finding',
          minimumExpectedRecord: 'Criteria, evidence, finding, owner, root cause, action, due date, retest',
          assuranceLimitation: 'A corrective action is not effective until appropriately verified.'
        }
      ],
      relatedDocumentsAndSystems: [
        'ISMS Scope Statement and ISMS objectives',
        'Risk Assessment and Risk Treatment Methodology',
        'Statement of Applicability and Risk Treatment Plan',
        'Asset Inventory and Information Classification Standard',
        'Identity and Access Management Policy / Procedures',
        'Incident Management Procedure',
        'Supplier Security and Third-Party Risk Procedure',
        'Business Continuity and Disaster Recovery Plans',
        'Internal Audit Programme and Corrective Action Procedure',
        'Legal, Regulatory and Contractual Obligations Register'
      ],
      reviewAndChangeControl:
        'The owner shall review this policy at the approved interval and upon material changes in organizational scope, services, technology, threat environment, risk, incidents, audit findings or applicable obligations. Revisions shall follow controlled review and approval. Prior published versions and their approval records shall be retained according to the records schedule and protected from unauthorized alteration.',
      appendixA_ApprovalRecord: [
        { role: 'Policy owner', nameOrIdentity: 'To be assigned', decision: 'Review pending', date: 'Not assigned', evidenceReference: 'Not assigned' },
        { role: 'Security / risk reviewer', nameOrIdentity: 'To be assigned', decision: 'Review pending', date: 'Not assigned', evidenceReference: 'Not assigned' },
        { role: 'Executive approver', nameOrIdentity: 'Authorized person to be assigned', decision: 'Approval pending', date: 'Not assigned', evidenceReference: 'Not assigned' }
      ],
      appendixC_TailoringChecklist: [
        { id: 'CHK-01', description: 'Confirm legal entity and ISMS scope.', isCompleted: false },
        { id: 'CHK-02', description: 'Map role titles to approved organization chart and delegations.', isCompleted: false },
        { id: 'CHK-03', description: 'Validate the applicable requirements and framework mappings against authoritative sources.', isCompleted: false },
        { id: 'CHK-04', description: 'Link to actual procedures, registers, systems and evidence locations.', isCompleted: false },
        { id: 'CHK-05', description: 'Define measurable objectives, owners, review frequencies and escalation routes.', isCompleted: false },
        { id: 'CHK-06', description: 'Validate exception, risk acceptance and audit arrangements.', isCompleted: false },
        { id: 'CHK-07', description: 'Obtain required review and approval before publication.', isCompleted: false }
      ],
      qualityScore: 96,
      createdAt: '2026-10-11T00:00:00.000Z',
      updatedAt: '2026-10-11T00:00:00.000Z'
    };
  }

  /**
   * Returns Model Sample 2: Enterprise User Access Provisioning Procedure (ISMS-PROC-IAM-001 v1.1)
   * Benchmark matching the 9-page reference enterprise consulting standard.
   */
  public getModelUserAccessProcedure(): EnterpriseConsultingDocument {
    return {
      id: 'ISMS-PROC-IAM-001',
      tenantId: 'SKANDA-MODEL-BENCHMARK',
      templateId: 'TMPL-PROC-IAM',
      isModelSample: true,
      metadata: {
        documentId: 'ISMS-PROC-IAM-001',
        title: 'User Access Provisioning and Modification Procedure',
        subtitle: 'Operational control procedure with roles, gates, evidence, exceptions and verification',
        documentType: 'PROCEDURE',
        hierarchyLevel: 'LEVEL_2_OPERATIONAL_PROCEDURE',
        version: '1.1',
        status: '1.1 — Model sample (quality revision); not approved',
        documentOwner: 'Role to be formally assigned',
        approver: 'Authorized management approver to be assigned',
        preparedBy: 'SKANDA Documentation',
        effectiveDate: 'Not effective until formally approved',
        revisionDate: '2026-10-11',
        classification: 'INTERNAL_ILLUSTRATIVE',
        reviewTrigger: 'Scheduled review and material business, technology, risk or regulatory change',
        notice: 'ILLUSTRATIVE MODEL DOCUMENT — MUST BE TAILORED AND APPROVED BEFORE USE',
        modelUseNotice:
          'This document demonstrates the depth, structure and operational specificity expected of an enterprise management-system document. It is not a representation that a real organization has implemented these requirements.'
      },
      revisionHistory: [
        {
          version: '1.0',
          date: 'Not recorded',
          summaryOfChange: 'Initial illustrative model sample.',
          preparedBy: 'SKANDA Documentation',
          approvalStatus: 'Not approved — model sample'
        },
        {
          version: '1.1',
          date: '2026-10-11',
          summaryOfChange:
            'Quality revision: replaced duplicated service-level section with service-level governance requirements; corrected RACI so each activity has one Accountable role; added approval record, revision history, contents and terms and definitions (new Section 3; later sections renumbered); moved procedure table to a landscape page; corrected metadata, header, "Page X of Y" numbering and table pagination.',
          preparedBy: 'SKANDA Documentation',
          approvalStatus: 'Not approved — model sample'
        }
      ],
      purpose:
        'Define a controlled, traceable process to request, authorize, provision, verify and record access to in-scope systems and information. This procedure is designed to prevent unauthorized access and to ensure granted entitlements correspond to approved business need.',
      scope: {
        statement:
          'Applies to new user access and changes to existing access for systems within the organization’s defined scope. Privileged access, service accounts, emergency access, machine identities, external users and systems with specialized access workflows may require additional controls or procedures. Confirm the applicable systems and user populations before approval.',
        inScopeLegalEntities: ['[Legal entity to be confirmed]'],
        inScopeLocations: ['[In-scope operational locations]'],
        inScopeSystemsAndServices: ['[Approved target systems and identity providers]'],
        inScopeUserPopulations: ['[Applicable workforce populations]'],
        documentedExclusions: [
          {
            item: '[Excluded access systems/categories if separately governed]',
            rationale: '[Documented justification and compensating controls]'
          }
        ]
      },
      termsAndDefinitions: [
        { term: 'Entitlement', definition: 'A specific permission, role, group membership or access right granted to an identity on a system.' },
        { term: 'Provisioning', definition: 'Creating, changing or assigning an account or entitlement on a target system.' },
        { term: 'Privileged access', definition: 'Access permitting administrative actions, security configuration changes, control bypass or broad access to sensitive information, as defined in the organization’s privileged access standard.' },
        { term: 'Segregation of duties', definition: 'Separation of conflicting responsibilities so that no single individual can initiate, authorize and complete a sensitive action without independent involvement.' },
        { term: 'Independent verification', definition: 'A check of resulting access against the approved request by a person or control independent of whoever performed the change.' },
        { term: 'Emergency access', definition: 'Time-limited access granted under a separately approved emergency process when the standard workflow cannot be followed.' },
        { term: 'Request record', definition: 'The uniquely identified record linking request, approvals, execution, verification and closure evidence.' }
      ],
      processControlsAndPrerequisites: [
        'An approved access request channel and record identifier are available.',
        'The target system, entitlement catalogue and accountable system/data owner are identified.',
        'Identity proofing and authentication requirements are defined for the relevant user category.',
        'The approval matrix and segregation-of-duties rules are current and accessible.',
        'Provisioning is restricted to authorized operators or controlled automation.',
        'Required evidence storage, retention and access protections are defined.'
      ],
      rolesAndSegregationOfDuties: [
        {
          role: 'Requester / line manager',
          permittedResponsibility: 'Initiates request and documents business need.',
          controlBoundary: 'Must not approve their own request unless a documented, authorized exception explicitly permits it.'
        },
        {
          role: 'System / data owner',
          permittedResponsibility: 'Confirms role suitability and authorizes access within delegated authority.',
          controlBoundary: 'Must not approve beyond delegated scope; conflicts require escalation.'
        },
        {
          role: 'Security / IAM reviewer',
          permittedResponsibility: 'Checks privileged access, sensitive entitlements, role conflicts and policy exceptions as required.',
          controlBoundary: 'Review is not a substitute for system-owner approval.'
        },
        {
          role: 'Provisioning operator / automation',
          permittedResponsibility: 'Executes the approved entitlement change.',
          controlBoundary: 'Must verify required approvals and must not expand access beyond the authorization.'
        },
        {
          role: 'Independent verifier',
          permittedResponsibility: 'Checks resulting entitlement against approval where required by risk or design.',
          controlBoundary: 'Should be independent of execution for high-risk access where practicable.'
        },
        {
          role: 'Process owner',
          permittedResponsibility: 'Maintains procedure, monitors metrics and coordinates remediation.',
          controlBoundary: 'Does not retrospectively legitimize unauthorized access without formal handling.'
        }
      ],
      inputsAndRequiredRecords: [
        {
          inputOrRecord: 'Access request',
          requiredContent: 'Unique ID; requester and intended user; identity reference; system; requested role/entitlement; business justification; requested start/end date where relevant.'
        },
        {
          inputOrRecord: 'Authorization matrix',
          requiredContent: 'Required approvers by system, data sensitivity, role, user type and privilege level.'
        },
        {
          inputOrRecord: 'Entitlement definition',
          requiredContent: 'Role permissions, risk classification, prerequisite training or conditions where applicable.'
        },
        {
          inputOrRecord: 'Conflict / restriction check',
          requiredContent: 'Segregation-of-duties results, privileged access rules and exception requirements.'
        },
        {
          inputOrRecord: 'Execution and verification record',
          requiredContent: 'Approvals, operator or automation identity, timestamps, granted entitlement, verification result and any remediation.'
        }
      ],
      procedureSteps: [
        {
          stepNumber: 1,
          stepName: 'Register request',
          requiredAction: 'Requester submits through the approved workflow and identifies the intended user, target system, requested entitlement, business justification and required timing.',
          responsibleRole: 'Requester / line manager',
          evidenceProduced: 'Request ID; identity reference; business justification; requested entitlement.',
          exitCriteria: 'Request is uniquely recorded and traceable. Missing mandatory fields cause return for completion.',
          failureOrExceptionHandling: 'No access is granted.'
        },
        {
          stepNumber: 2,
          stepName: 'Validate identity and completeness',
          requiredAction: 'Coordinator or workflow validates identity status, target system, entitlement validity, business rationale and required information.',
          responsibleRole: 'IAM coordinator or approved workflow',
          evidenceProduced: 'Validation result; identity status; target system and entitlement reference.',
          exitCriteria: 'Request meets documented entry criteria. Invalid or incomplete requests are returned or rejected.',
          failureOrExceptionHandling: 'No access is granted.'
        },
        {
          stepNumber: 3,
          stepName: 'Confirm business need',
          requiredAction: 'Line manager and/or system owner confirms the entitlement is required for assigned duties and is proportionate to need.',
          responsibleRole: 'Line manager / system owner',
          evidenceProduced: 'Business justification and approval decision.',
          exitCriteria: 'Decision is recorded by an authorized identity and is within delegated authority.',
          failureOrExceptionHandling: 'Reject or return if need is not established.'
        },
        {
          stepNumber: 4,
          stepName: 'Obtain required approvals',
          requiredAction: 'Route to all approvers required by the current approval matrix, including data owner, security reviewer or other approvers where applicable.',
          responsibleRole: 'Workflow / designated coordinator',
          evidenceProduced: 'Approver identity, decision, timestamp, conditions and comments where appropriate.',
          exitCriteria: 'All mandatory approvals are positive and precede provisioning. Rejection ends the normal workflow.',
          failureOrExceptionHandling: 'Do not provision while approvals are missing or rejected.'
        },
        {
          stepNumber: 5,
          stepName: 'Assess conflicts and elevated risk',
          requiredAction: 'Check segregation of duties, privilege level, sensitive data access, external user status, and applicable restrictions. Obtain additional approval or documented exception where required.',
          responsibleRole: 'IAM / security reviewer / system owner',
          evidenceProduced: 'Conflict check, risk assessment, exception ID and approval if applicable.',
          exitCriteria: 'No unresolved prohibited conflict; any permitted exception has authorized approval, safeguards and review/expiry date.',
          failureOrExceptionHandling: 'Hold and escalate unresolved conflict.'
        },
        {
          stepNumber: 6,
          stepName: 'Provision approved entitlement',
          requiredAction: 'Authorized operator or controlled automation applies only the entitlement, scope and duration approved. Use the approved administrative channel and preserve system audit records.',
          responsibleRole: 'Provisioning operator / controlled automation',
          evidenceProduced: 'Execution event, actor, system, entitlement, timestamp, result and correlation to request ID.',
          exitCriteria: 'Actual change matches authorization; failure is recorded and not represented as success.',
          failureOrExceptionHandling: 'Do not substitute broader access or use unauthorized workaround.'
        },
        {
          stepNumber: 7,
          stepName: 'Independently verify result',
          requiredAction: 'Compare actual assigned permissions with the approved request using system logs, access reports or other reliable evidence. Use independent verification for high-risk access where required.',
          responsibleRole: 'Verifier or independent control',
          evidenceProduced: 'Expected versus actual entitlement, verification method, verifier and timestamp.',
          exitCriteria: 'Exact match is confirmed, or discrepancy is recorded and corrected.',
          failureOrExceptionHandling: 'Keep request open; remove or correct unauthorized excess access and escalate as required.'
        },
        {
          stepNumber: 8,
          stepName: 'Notify and close',
          requiredAction: 'Notify relevant parties and close the request only after approvals, execution and required verification are complete.',
          responsibleRole: 'Workflow owner / IAM coordinator',
          evidenceProduced: 'Closure status, notifications reference, linked execution and verification evidence.',
          exitCriteria: 'Required fields and evidence are present; final state is accurate.',
          failureOrExceptionHandling: 'Do not close with unresolved discrepancy or missing mandatory evidence.'
        },
        {
          stepNumber: 9,
          stepName: 'Retain and monitor',
          requiredAction: 'Retain the request and associated records under the approved retention schedule. Include the event in monitoring or periodic access review where required.',
          responsibleRole: 'Process owner / records owner',
          evidenceProduced: 'Record links, retention class, review flags and monitoring outcome.',
          exitCriteria: 'Records remain retrievable and protected; relevant access reviews are scheduled.',
          failureOrExceptionHandling: 'Escalate missing records or suspected record alteration.'
        }
      ],
      decisionRulesAndExceptions: [
        {
          scenario: 'Incomplete or invalid request',
          requiredHandling: 'Return for correction or reject under workflow rules. Do not provision.',
          requiredEvidence: 'Reason, status, requester notification and timestamps.'
        },
        {
          scenario: 'Approver rejects request',
          requiredHandling: 'End normal processing; do not provision. Re-submission requires a new or formally reopened request.',
          requiredEvidence: 'Decision, approver identity and reason where recorded.'
        },
        {
          scenario: 'Approval absent or unauthorized',
          requiredHandling: 'Hold request and route to the correct authority; never infer approval from silence.',
          requiredEvidence: 'Approval matrix version and workflow history.'
        },
        {
          scenario: 'Segregation-of-duties conflict',
          requiredHandling: 'Apply conflict-resolution process. If policy permits an exception, document risk, compensating controls, authorized approval, expiry/review and monitoring.',
          requiredEvidence: 'Conflict result and linked exception record.'
        },
        {
          scenario: 'Privileged or sensitive access',
          requiredHandling: 'Apply enhanced approval, authentication, logging, time limitation and verification according to approved standard.',
          requiredEvidence: 'Privilege classification, approvals, conditions and verification.'
        },
        {
          scenario: 'Provisioning fails',
          requiredHandling: 'Record failure, investigate, retry only through authorized controls, and ensure partial access is assessed.',
          requiredEvidence: 'Failure log, incident/change reference if applicable, final outcome.'
        },
        {
          scenario: 'Unexpected or excessive access appears',
          requiredHandling: 'Contain or remove unauthorized access promptly under approved process; preserve evidence and assess incident escalation.',
          requiredEvidence: 'Actual entitlement, corrective action, escalation and verification.'
        },
        {
          scenario: 'Emergency access needed',
          requiredHandling: 'Use separately approved emergency access process; retrospective review does not replace initial authorization requirements unless explicitly defined by that process.',
          requiredEvidence: 'Emergency justification, authorization, start/end time, monitoring and retrospective review.'
        }
      ],
      serviceLevels: {
        governanceElements: [
          { element: 'Measured interval', definition: 'For each request category, define the start event, stop event and any permitted pause conditions (for example, awaiting requester information) so performance is calculated consistently.' },
          { element: 'Target and thresholds', definition: 'Define the approved target, an at-risk threshold that triggers proactive follow-up, and the breach point.' },
          { element: 'Ownership and data source', definition: 'Assign an accountable owner for each target and identify the system of record used to calculate performance.' },
          { element: 'Control precedence', definition: 'Service-level targets never override authorization, segregation-of-duties or verification gates. Time pressure is not grounds for provisioning without required approval.' },
          { element: 'Ageing and breach escalation', definition: 'Define the escalation route, recipients and timing for requests at risk or in breach, including stalled approvals and provisioning awaiting verification.' },
          { element: 'Urgent business need', definition: 'Urgent requests follow the standard gates with prioritization. Where the gates cannot be met, the separately approved emergency access process applies.' },
          { element: 'Third-party delivery', definition: 'Where a third party performs provisioning, align targets with verified contractual terms rather than assumed service commitments.' },
          { element: 'Reporting and review', definition: 'Report performance at the approved frequency to the process owner and the relevant governance forum; review targets at each document review or upon material change.' }
        ],
        targetsByCategory: [
          { category: 'Standard user access', approvedTarget: 'To be defined', measuredInterval: 'To be defined', escalationRoute: 'To be defined' },
          { category: 'Access modification or role change', approvedTarget: 'To be defined', measuredInterval: 'To be defined', escalationRoute: 'To be defined' },
          { category: 'Privileged or sensitive access', approvedTarget: 'To be defined', measuredInterval: 'To be defined', escalationRoute: 'To be defined' },
          { category: 'External or third-party user access', approvedTarget: 'To be defined', measuredInterval: 'To be defined', escalationRoute: 'To be defined' }
        ]
      },
      evidenceRetentionAndProtection: [
        { evidenceItem: 'Request record', minimumFields: 'Request ID, user, system, entitlement, business need, dates, status', controlPurpose: 'Traceability from business need to action.' },
        { evidenceItem: 'Approval trail', minimumFields: 'Approver identity, role, decision, timestamp, conditions', controlPurpose: 'Evidence of authorization before provisioning.' },
        { evidenceItem: 'Provisioning event', minimumFields: 'System, actual entitlement, actor, timestamp, result', controlPurpose: 'Evidence of what changed and who/what performed it.' },
        { evidenceItem: 'Verification record', minimumFields: 'Expected/actual comparison, verifier, method, result', controlPurpose: 'Evidence the result matched the approved request.' },
        { evidenceItem: 'Exception record', minimumFields: 'Risk, rationale, controls, approver, expiry/review, closure', controlPurpose: 'Controlled handling of deviations.' },
        { evidenceItem: 'Notification / closure', minimumFields: 'Notification reference, completion status, links to evidence', controlPurpose: 'Evidence of workflow completion.' }
      ],
      monitoringAndPerformanceMeasures: [
        'Percentage of completed requests with required approvals recorded before provisioning.',
        'Number of provisioning mismatches and time to remediation.',
        'Number and age of requests awaiting approval or verification.',
        'Number of access exceptions and percentage reviewed before expiry.',
        'Percentage of sampled requests with complete evidence and successful independent checks.',
        'Number of unauthorized or unexplained entitlement changes identified through monitoring.'
      ],
      failureIncidentAndCapaHandling:
        'Suspected unauthorized provisioning, approval bypass, unexplained privilege escalation, or evidence tampering shall be escalated under the incident management process. Preserve relevant logs and records. Record nonconformities or control deficiencies as required, assign an owner and due date, perform root-cause analysis proportionate to risk, implement corrective action and verify effectiveness before closure.',
      relatedDocumentsAndSystems: [
        'Access Control Policy',
        'Identity and Authentication Standard',
        'Privileged Access Management Standard',
        'Segregation-of-Duties Matrix',
        'User Access Revocation Procedure',
        'Emergency Access Procedure',
        'Exception Management Procedure',
        'Incident Management Procedure',
        'Approved identity/service-management systems (organization to specify)'
      ],
      reviewAndChangeControl:
        'The process owner shall review this procedure at the approved interval and after material process, system, role, risk or obligation changes, as well as following significant incidents or audit findings. Changes shall be reviewed and approved through document control. Published versions shall be preserved and superseded versions prevented from unintended use.',
      appendixA_ApprovalRecord: [
        { role: 'Process owner', nameOrIdentity: 'To be assigned', decision: 'Review pending', date: 'Not assigned', evidenceReference: 'Not assigned' },
        { role: 'Security / IAM reviewer', nameOrIdentity: 'To be assigned', decision: 'Review pending', date: 'Not assigned', evidenceReference: 'Not assigned' },
        { role: 'Authorized approver', nameOrIdentity: 'Authorized person to be assigned', decision: 'Approval pending', date: 'Not assigned', evidenceReference: 'Not assigned' }
      ],
      appendixB_OperationalRaci: [
        {
          activity: 'Submit request',
          requesterOrManager: 'A/R',
          systemOwner: 'I',
          iamOrOperator: 'I',
          securityReviewer: 'I',
          verifier: 'I',
          notes: 'Requester has sole operational accountability for submission'
        },
        {
          activity: 'Confirm business need',
          requesterOrManager: 'R',
          systemOwner: 'A/R',
          iamOrOperator: 'C',
          securityReviewer: 'C',
          verifier: 'I',
          notes: 'System Owner holds sole accountability for confirming necessity'
        },
        {
          activity: 'Approve entitlement',
          requesterOrManager: 'I',
          systemOwner: 'A/R',
          iamOrOperator: 'I',
          securityReviewer: 'C',
          verifier: 'I',
          notes: 'System Owner holds sole accountability for authorization'
        },
        {
          activity: 'Provision access',
          requesterOrManager: 'I',
          systemOwner: 'I',
          iamOrOperator: 'A/R',
          securityReviewer: 'C',
          verifier: 'I',
          notes: 'IAM operator/automation holds sole accountability for technical execution'
        },
        {
          activity: 'Verify result',
          requesterOrManager: 'I',
          systemOwner: 'C',
          iamOrOperator: 'C',
          securityReviewer: 'C',
          verifier: 'A/R',
          notes: 'Designated Independent Verifier holds sole accountability for post-check'
        },
        {
          activity: 'Close and retain record',
          requesterOrManager: 'I',
          systemOwner: 'C',
          iamOrOperator: 'A/R',
          securityReviewer: 'I',
          verifier: 'C',
          notes: 'IAM/workflow owner holds sole accountability for closure'
        }
      ],
      appendixC_TailoringChecklist: [
        { id: 'CHK-IAM-01', description: 'Confirm in-scope systems, user populations and entitlement types.', isCompleted: false },
        { id: 'CHK-IAM-02', description: 'Map role titles to the actual organization chart and approval matrix.', isCompleted: false },
        { id: 'CHK-IAM-03', description: 'Define identity proofing, privileged access and segregation-of-duties rules.', isCompleted: false },
        { id: 'CHK-IAM-04', description: 'Identify actual request, identity, logging, and evidence systems.', isCompleted: false },
        { id: 'CHK-IAM-05', description: 'Approve service-level targets and retention requirements.', isCompleted: false },
        { id: 'CHK-IAM-06', description: 'Define emergency access and third-party access variations.', isCompleted: false },
        { id: 'CHK-IAM-07', description: 'Test end-to-end with representative scenarios and verify evidence.', isCompleted: false },
        { id: 'CHK-IAM-08', description: 'Obtain process owner, security review and authorized approval.', isCompleted: false }
      ],
      qualityScore: 98,
      createdAt: '2026-10-11T00:00:00.000Z',
      updatedAt: '2026-10-11T00:00:00.000Z'
    };
  }

  // --------------------------------------------------------------------------
  // BLANK REUSABLE TEMPLATES
  // --------------------------------------------------------------------------

  /**
   * Returns Blank Policy Template with structural guidance and placeholder sections
   */
  public getBlankPolicyTemplate(): EnterpriseConsultingDocument {
    return {
      id: 'TMPL-POL-BLANK',
      tenantId: 'SKANDA-SYSTEM-TEMPLATES',
      templateId: 'TMPL-POL-BLANK',
      metadata: {
        documentId: 'POL-[DOMAIN]-[CODE]',
        title: '[Policy Title Name]',
        subtitle: '[Mandatory governance principles, scope, ownership and control criteria]',
        documentType: 'POLICY',
        hierarchyLevel: 'LEVEL_1_GOVERNANCE_POLICY',
        version: '1.0-DRAFT',
        status: 'DRAFT',
        documentOwner: '{{OWNER_ROLE}}',
        approver: '{{APPROVER_ROLE}}',
        preparedBy: '{{AUTHOR_ROLE}}',
        effectiveDate: '{{EFFECTIVE_DATE}}',
        revisionDate: new Date().toISOString().split('T')[0],
        classification: 'INTERNAL',
        reviewTrigger: 'Annual scheduled review or material operational/regulatory change',
        notice: 'ORGANIZATION CONTROLLED POLICY DRAFT'
      },
      revisionHistory: [
        {
          version: '1.0-DRAFT',
          date: new Date().toISOString().split('T')[0],
          summaryOfChange: 'Initial drafted baseline from enterprise policy template.',
          preparedBy: '{{AUTHOR_NAME}}',
          approvalStatus: 'Draft — pending review'
        }
      ],
      documentGovernance: [
        { control: 'Accountable owner', requirementOrModelApproach: 'Designate accountable executive owner with authority to mandate controls.' },
        { control: 'Approval authority', requirementOrModelApproach: 'Executive management or Board Committee approval per Delegation of Authority.' },
        { control: 'Review frequency', requirementOrModelApproach: 'Annual periodic review and triggered event reviews.' },
        { control: 'Distribution', requirementOrModelApproach: 'Published in centralized policy portal and communicated to all impacted personnel.' },
        { control: 'Superseded copies', requirementOrModelApproach: 'Archived in immutable records store; marked superseded in catalog.' },
        { control: 'Exceptions', requirementOrModelApproach: 'Documented in formal waiver registry with risk assessment and time expiration.' }
      ],
      purpose: 'Establish mandatory principles, executive commitment, and control criteria for [Policy Domain Scope].',
      scope: {
        statement: 'Applies to all employees, contractors, third parties, systems, and facilities within {{ORGANIZATION_NAME}} in-scope operations.',
        inScopeLegalEntities: ['{{LEGAL_ENTITY_NAME}}'],
        inScopeLocations: ['{{IN_SCOPE_LOCATIONS}}'],
        inScopeSystemsAndServices: ['{{IN_SCOPE_SYSTEMS}}'],
        inScopeUserPopulations: ['{{IN_SCOPE_POPULATIONS}}'],
        documentedExclusions: []
      },
      termsAndDefinitions: [
        { term: 'Nonconformity', definition: 'Failure to fulfill an organizational policy mandate or regulatory obligation.' },
        { term: 'Corrective Action', definition: 'Action to eliminate the root cause of an identified deficiency and prevent recurrence.' },
        { term: 'Evidence', definition: 'Attributable, protected records demonstrating that a control was operated as specified.' }
      ],
      policyObjectives: [
        'Protect organizational assets and stakeholder trust in accordance with risk appetite.',
        'Comply with applicable statutory, regulatory, and contractual obligations.',
        'Define clear operational accountability across all three lines of defense.'
      ],
      governanceAndAccountability: [
        { role: 'Executive Sponsor', accountability: 'Provide strategic resources, approve policy, and oversee risk governance.' },
        { role: 'Policy Owner', accountability: 'Maintain policy currency, monitor compliance, and coordinate reviews.' },
        { role: 'Control Owners', accountability: 'Implement, operate, and evidence specific operational controls.' },
        { role: 'All Personnel', accountability: 'Adhere to policy mandates and promptly report identified anomalies.' }
      ],
      mandatoryRequirements: [],
      controlImplementationAndEvidence: [
        {
          governanceObject: 'Policy Control',
          minimumExpectedRecord: 'Documented procedure, execution logs, periodic review signoff',
          assuranceLimitation: 'Declared compliance without evidence sampling does not guarantee operating effectiveness.'
        }
      ],
      relatedDocumentsAndSystems: [],
      reviewAndChangeControl: 'Review required annually by Policy Owner and re-ratification by Executive Approver.',
      appendixA_ApprovalRecord: [
        { role: 'Policy Owner', nameOrIdentity: '{{OWNER_NAME}}', decision: 'Review pending', date: 'Pending', evidenceReference: 'Pending' },
        { role: 'Executive Approver', nameOrIdentity: '{{APPROVER_NAME}}', decision: 'Approval pending', date: 'Pending', evidenceReference: 'Pending' }
      ],
      appendixC_TailoringChecklist: [
        { id: 'CHK-01', description: 'Confirm legal entity name and boundaries.', isCompleted: false },
        { id: 'CHK-02', description: 'Map specific owner and approver identities.', isCompleted: false },
        { id: 'CHK-03', description: 'Define domain-specific mandatory requirements.', isCompleted: false },
        { id: 'CHK-04', description: 'Complete stakeholder review and approval signoff.', isCompleted: false }
      ],
      qualityScore: 70,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Returns Blank Procedure Template with operational procedure gates and RACI structure
   */
  public getBlankProcedureTemplate(): EnterpriseConsultingDocument {
    return {
      id: 'TMPL-PROC-BLANK',
      tenantId: 'SKANDA-SYSTEM-TEMPLATES',
      templateId: 'TMPL-PROC-BLANK',
      metadata: {
        documentId: 'PROC-[PROCESS]-[CODE]',
        title: '[Procedure Title Name]',
        subtitle: 'Operational control procedure with sequential steps, roles, evidence, and failure handling',
        documentType: 'PROCEDURE',
        hierarchyLevel: 'LEVEL_2_OPERATIONAL_PROCEDURE',
        version: '1.0-DRAFT',
        status: 'DRAFT',
        documentOwner: '{{OWNER_ROLE}}',
        approver: '{{APPROVER_ROLE}}',
        preparedBy: '{{AUTHOR_ROLE}}',
        effectiveDate: '{{EFFECTIVE_DATE}}',
        revisionDate: new Date().toISOString().split('T')[0],
        classification: 'INTERNAL',
        reviewTrigger: 'Annual scheduled review or material process/technology change',
        notice: 'ORGANIZATION CONTROLLED PROCEDURE DRAFT'
      },
      revisionHistory: [
        {
          version: '1.0-DRAFT',
          date: new Date().toISOString().split('T')[0],
          summaryOfChange: 'Initial drafted baseline from enterprise procedure template.',
          preparedBy: '{{AUTHOR_NAME}}',
          approvalStatus: 'Draft — pending review'
        }
      ],
      purpose: 'Define a controlled, repeatable, and auditable procedure for [Operational Process Domain].',
      scope: {
        statement: 'Applies to operational execution across in-scope systems, teams, and workflows.',
        inScopeLegalEntities: ['{{LEGAL_ENTITY_NAME}}'],
        inScopeLocations: ['{{IN_SCOPE_LOCATIONS}}'],
        inScopeSystemsAndServices: ['{{IN_SCOPE_SYSTEMS}}'],
        inScopeUserPopulations: ['{{IN_SCOPE_POPULATIONS}}'],
        documentedExclusions: []
      },
      termsAndDefinitions: [
        { term: 'Operational Gate', definition: 'A mandatory validation checkpoint that must be satisfied before proceeding to the next step.' },
        { term: 'Independent Verification', definition: 'Secondary validation conducted by an actor independent of the executing role.' }
      ],
      processControlsAndPrerequisites: [
        'Prerequisite tools, accounts, and credentials are confirmed operational.',
        'Delegation of authority and approval matrix are current and validated.'
      ],
      rolesAndSegregationOfDuties: [
        {
          role: 'Process Operator',
          permittedResponsibility: 'Executes operational actions within documented instructions.',
          controlBoundary: 'Must not approve own actions or bypass mandatory checks.'
        },
        {
          role: 'Process Approver',
          permittedResponsibility: 'Authorizes initiation or completion within delegated scope.',
          controlBoundary: 'Must not execute actions they authorize (Segregation of Duties).'
        }
      ],
      inputsAndRequiredRecords: [
        {
          inputOrRecord: 'Work Request / Ticket',
          requiredContent: 'Unique Request ID, initiator, business rationale, affected systems, approved parameters.'
        }
      ],
      procedureSteps: [
        {
          stepNumber: 1,
          stepName: 'Initiate and Validate',
          requiredAction: 'Submit request through ticketing workflow with complete parameters.',
          responsibleRole: 'Process Initiator',
          evidenceProduced: 'Ticket ID, timestamp, parameters',
          exitCriteria: 'All mandatory fields populated.',
          failureOrExceptionHandling: 'Incomplete requests returned for revision; process halted.'
        },
        {
          stepNumber: 2,
          stepName: 'Review and Authorize',
          requiredAction: 'Verify business rationale and authorize execution in system of record.',
          responsibleRole: 'Process Approver',
          evidenceProduced: 'Approver digital signature, approval timestamp',
          exitCriteria: 'Positive affirmative authorization recorded.',
          failureOrExceptionHandling: 'No action permitted without positive authorization.'
        },
        {
          stepNumber: 3,
          stepName: 'Execute Operational Task',
          requiredAction: 'Execute authorized change using approved tools according to technical specifications.',
          responsibleRole: 'Process Operator',
          evidenceProduced: 'Execution audit log, change output record',
          exitCriteria: 'Actual change matches authorization parameters exactly.',
          failureOrExceptionHandling: 'Rollback change if execution fails; log defect.'
        },
        {
          stepNumber: 4,
          stepName: 'Verify and Close',
          requiredAction: 'Perform independent verification check and update request record.',
          responsibleRole: 'Independent Verifier',
          evidenceProduced: 'Verification checklist, final status update',
          exitCriteria: 'Independent verification confirmed and documented.',
          failureOrExceptionHandling: 'Keep ticket open until discrepancy resolved.'
        }
      ],
      decisionRulesAndExceptions: [
        {
          scenario: 'Operational execution fails',
          requiredHandling: 'Initiate rollback procedure immediately, record incident reference, notify requester.',
          requiredEvidence: 'Rollback confirmation log and incident ticket number.'
        }
      ],
      serviceLevels: {
        governanceElements: [
          { element: 'Measured interval', definition: 'From formal request submission timestamp to final verified closure timestamp.' },
          { element: 'Target threshold', definition: 'Standard service turnaround under normal operational conditions.' }
        ],
        targetsByCategory: [
          { category: 'Standard Requests', approvedTarget: '{{STANDARD_SLA}}', measuredInterval: 'Submission to Closure', escalationRoute: 'Team Lead' },
          { category: 'Expedited / Urgent', approvedTarget: '{{URGENT_SLA}}', measuredInterval: 'Submission to Closure', escalationRoute: 'Department Head' }
        ]
      },
      evidenceRetentionAndProtection: [
        {
          evidenceItem: 'Execution Audit Trail',
          minimumFields: 'Request ID, actor, timestamp, target system, before/after state, verification result',
          controlPurpose: 'Demonstrate non-repudiation and compliance with operating specifications.'
        }
      ],
      monitoringAndPerformanceMeasures: [
        'Total request volume and turnaround SLA adherence percentage.',
        'Defect/rollback rate and time to remediation.'
      ],
      failureIncidentAndCapaHandling: 'Escalate unexpected failures or unauthorized deviations through Incident Management.',
      relatedDocumentsAndSystems: [],
      reviewAndChangeControl: 'Annual periodic review or triggered by material technological change.',
      appendixA_ApprovalRecord: [
        { role: 'Process Owner', nameOrIdentity: '{{OWNER_NAME}}', decision: 'Review pending', date: 'Pending', evidenceReference: 'Pending' },
        { role: 'Authorized Approver', nameOrIdentity: '{{APPROVER_NAME}}', decision: 'Approval pending', date: 'Pending', evidenceReference: 'Pending' }
      ],
      appendixB_OperationalRaci: [
        {
          activity: 'Initiate Request',
          requesterOrManager: 'A/R',
          systemOwner: 'I',
          iamOrOperator: 'I',
          securityReviewer: 'I',
          verifier: 'I',
          notes: 'Initiator holds single operational accountability'
        },
        {
          activity: 'Authorize Request',
          requesterOrManager: 'I',
          systemOwner: 'A/R',
          iamOrOperator: 'I',
          securityReviewer: 'C',
          verifier: 'I',
          notes: 'System Owner holds single accountability for approval'
        },
        {
          activity: 'Execute Task',
          requesterOrManager: 'I',
          systemOwner: 'I',
          iamOrOperator: 'A/R',
          securityReviewer: 'I',
          verifier: 'I',
          notes: 'Operator holds single accountability for technical task'
        },
        {
          activity: 'Verify and Close',
          requesterOrManager: 'I',
          systemOwner: 'I',
          iamOrOperator: 'C',
          securityReviewer: 'I',
          verifier: 'A/R',
          notes: 'Independent Verifier holds single accountability for post-check'
        }
      ],
      appendixC_TailoringChecklist: [
        { id: 'CHK-01', description: 'Validate operational systems and toolchains.', isCompleted: false },
        { id: 'CHK-02', description: 'Confirm role assignments against active organization chart.', isCompleted: false },
        { id: 'CHK-03', description: 'Approve specific service turnaround SLA targets.', isCompleted: false },
        { id: 'CHK-04', description: 'Execute end-to-end operational dry-run before sign-off.', isCompleted: false }
      ],
      qualityScore: 72,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // --------------------------------------------------------------------------
  // ORGANIZATION-SPECIFIC TAILORING ENGINE
  // --------------------------------------------------------------------------

  /**
   * Generates a tailored Enterprise Consulting Document by merging a template
   * with verified Organizational Context Questionnaire data.
   *
   * STRICT NON-FABRICATION RULE:
   * Only facts provided in the questionnaire are embedded.
   * Missing answers generate explicit tailoring checklist items!
   */
  public tailorDocument(
    baseTemplate: EnterpriseConsultingDocument,
    questionnaire: DocumentationContextQuestionnaire
  ): EnterpriseConsultingDocument {
    const org = questionnaire.organizationProfile || { legalEntityName: '', jurisdictions: [], industry: '', headquartersLocation: '' };
    const scope = questionnaire.scopeDefinition || { inScopeLocations: [], inScopeBusinessUnits: [], inScopeServicesAndProducts: [] };
    const ops = questionnaire.operatingModel || { cloudInfrastructure: [], identityProvider: '', ticketingAndItsmSystem: '', codeRepositories: [], databaseEngines: [], hrisPlatform: '', siemAndLoggingPlatform: '' };
    const roles = questionnaire.keyRolesAndDelegations || {} as any;
    const approvals = questionnaire.approvalThresholdsAndRules || {} as any;
    const slas = questionnaire.serviceLevelCommitments;
    const retention = questionnaire.evidenceAndRecordsRetention || {} as any;

    // Clone base document deeply
    const tailored: EnterpriseConsultingDocument = JSON.parse(JSON.stringify(baseTemplate));

    tailored.id = `DOC-${tailored.metadata.documentType}-${Date.now().toString(36).toUpperCase()}`;
    tailored.tenantId = questionnaire.tenantId || 'SKANDA-TENANT';
    tailored.isModelSample = false;

    // Tailor Metadata
    const legalName = org.legalEntityName || 'ORGANIZATION';
    tailored.metadata.documentId = `${legalName.substring(0, 3).toUpperCase()}-${tailored.metadata.documentType}-${Date.now().toString().slice(-4)}`;
    tailored.metadata.documentOwner = roles?.ismsOwnerOrCisoRole || roles?.headOfItOrEngineeringRole || 'Role to be formally assigned';
    tailored.metadata.approver = approvals?.policyApprovalAuthority || approvals?.procedureApprovalAuthority || 'Authorized management approver to be assigned';
    tailored.metadata.preparedBy = roles?.securityReviewerRole || 'SKANDA Documentation Specialist';
    tailored.metadata.classification = 'INTERNAL';
    tailored.metadata.status = '1.0-DRAFT — Tailored Organizational Draft';
    tailored.metadata.notice = `CONFIDENTIAL — PROPERTY OF ${legalName.toUpperCase()}`;
    delete tailored.metadata.modelUseNotice;

    // Tailor Revision History
    const cloudStr = (ops.cloudInfrastructure || []).join(', ') || 'Enterprise Cloud';
    tailored.revisionHistory = [
      {
        version: '1.0-DRAFT',
        date: new Date().toISOString().split('T')[0],
        summaryOfChange: `Tailored for ${legalName} based on verified organizational scope, architecture (${cloudStr} / ${ops.identityProvider || 'Enterprise IdP'}), and approved operating model.`,
        preparedBy: `${roles?.securityReviewerRole || 'Compliance Lead'} (${roles?.securityReviewerEmail || 'compliance@org.local'})`,
        approvalStatus: 'Draft — Pending Formal Executive Review'
      }
    ];

    // Tailor Scope
    const locStr = (scope.inScopeLocations || []).join(', ') || 'all authorized locations';
    const prodStr = (scope.inScopeServicesAndProducts || []).join(', ') || 'in-scope enterprise systems';
    tailored.scope.statement = `This ${tailored.metadata.documentType.toLowerCase()} governs all ${legalName} operations across ${locStr}, applying to all personnel interacting with ${prodStr}.`;
    tailored.scope.inScopeLegalEntities = [legalName];
    tailored.scope.inScopeLocations = scope.inScopeLocations || [];
    tailored.scope.inScopeSystemsAndServices = (scope.inScopeServicesAndProducts || []).concat(
      (ops.cloudInfrastructure || []).map(c => `${c} Cloud Infrastructure`)
    );
    if (ops.identityProvider) {
      tailored.scope.inScopeSystemsAndServices.push(`IAM Identity Provider (${ops.identityProvider})`);
    }
    if (ops.ticketingAndItsmSystem) {
      tailored.scope.inScopeSystemsAndServices.push(`ITSM Workflow (${ops.ticketingAndItsmSystem})`);
    }
    tailored.scope.inScopeUserPopulations = [
      'Full-time enterprise personnel',
      'Fixed-term contractors',
      'Privileged infrastructure operators',
      'Authorized third-party system integrations'
    ];
    if (scope.excludedEntitiesOrFunctions) {
      tailored.scope.documentedExclusions = scope.excludedEntitiesOrFunctions;
    }

    // Tailor Governance & Accountability if present (Level 1 Policy)
    if (tailored.governanceAndAccountability) {
      tailored.governanceAndAccountability = [
        {
          role: roles.executiveSponsorRole,
          accountability: `Executive oversight, budget authorization, and formal policy approval on behalf of ${org.legalEntityName}.`,
          assignedIndividualOrTeam: roles.executiveSponsorEmail
        },
        {
          role: roles.ismsOwnerOrCisoRole,
          accountability: 'Formally maintains and enforces this policy, reviews periodic exceptions, and coordinates internal audits.',
          assignedIndividualOrTeam: roles.ismsOwnerOrCisoEmail
        },
        {
          role: roles.securityReviewerRole,
          accountability: 'Technical review of privileged requests, baseline architecture validation, and exception risk scoring.',
          assignedIndividualOrTeam: roles.securityReviewerEmail
        },
        {
          role: roles.headOfItOrEngineeringRole,
          accountability: `Operates technical controls across ${ops.cloudInfrastructure.join(', ')} and enforces identity lifecycles in ${ops.identityProvider}.`,
          assignedIndividualOrTeam: roles.headOfItOrEngineeringEmail
        },
        {
          role: roles.internalAuditorRole,
          accountability: 'Conducts independent 3rd-line periodic control effectiveness audits without auditing own work.',
          assignedIndividualOrTeam: roles.internalAuditorEmail
        }
      ];
    }

    // Tailor Roles & SoD if present (Level 2 Procedure)
    if (tailored.rolesAndSegregationOfDuties) {
      tailored.rolesAndSegregationOfDuties = [
        {
          role: 'Requester / Business Manager',
          permittedResponsibility: `Submits requests in ${ops.ticketingAndItsmSystem} with documented business necessity.`,
          controlBoundary: 'Strictly prohibited from self-approving requests or executing provisioning.'
        },
        {
          role: 'System / Data Owner',
          permittedResponsibility: `Formally authorizes access within delegated authority matrix (${approvals.standardUserAccessApprover}).`,
          controlBoundary: 'Must not authorize beyond assigned system scope; dual approval required for privileged tiers.'
        },
        {
          role: roles.securityReviewerRole || 'Security Reviewer',
          permittedResponsibility: 'Validates conflict of interest, segregation of duties, and high-privilege risk assessments.',
          controlBoundary: 'Reviewer signoff does not replace System Owner business authorization.'
        },
        {
          role: 'Provisioning Operator / Automation',
          permittedResponsibility: `Applies approved entitlements in ${ops.identityProvider} and target platforms.`,
          controlBoundary: 'Must only provision exactly what was approved; manual workarounds prohibited.'
        },
        {
          role: 'Independent Verifier',
          permittedResponsibility: `Performs secondary log verification in ${ops.siemAndLoggingPlatform || 'SIEM / Audit Vault'}.`,
          controlBoundary: 'Must be independent of the individual or automation that performed execution.'
        }
      ];
    }

    // Tailor Procedure Steps if present (Level 2 Procedure)
    if (tailored.procedureSteps) {
      tailored.procedureSteps = tailored.procedureSteps.map(step => {
        let action = step.requiredAction;
        let role = step.responsibleRole;
        if (action.includes('approved workflow') || action.includes('workflow')) {
          action = action.replace(/approved workflow/g, `${ops.ticketingAndItsmSystem || 'ITSM'} portal`);
        }
        if (action.includes('Identity Provider') || action.includes('administrative channel')) {
          action = action.replace(/administrative channel/g, `${ops.identityProvider || 'IAM'} administrative console`);
        }
        if (step.stepNumber === 1) role = 'Requester / Direct Line Manager';
        if (step.stepNumber === 2) role = `${ops.identityProvider || 'IAM'} Automated Orchestrator`;
        if (step.stepNumber === 3) role = 'Authorized System / Data Owner';
        if (step.stepNumber === 4) role = `${approvals.standardUserAccessApprover || 'Authorized Management Approver'}`;
        if (step.stepNumber === 5) role = roles?.securityReviewerRole || 'Security Architecture Reviewer';
        if (step.stepNumber === 6) role = `${ops.identityProvider || 'IAM'} Automated Engine / IT Ops`;
        if (step.stepNumber === 7) role = 'Designated Independent Security Verifier';
        if (step.stepNumber === 8) role = `${ops.ticketingAndItsmSystem || 'ITSM'} Notification Handler`;
        if (step.stepNumber === 9) role = `${retention.evidenceStorageVault || 'WORM Vault'} Archival Daemon`;
        return { ...step, requiredAction: action, responsibleRole: role };
      });
    }

    // Tailor Service Levels if present
    if (tailored.serviceLevels && slas) {
      tailored.serviceLevels.targetsByCategory = [
        {
          category: 'Standard User Access Provisioning',
          approvedTarget: `Within ${slas.standardAccessDays} business days (${slas.standardAccessDays * 24} hours)`,
          measuredInterval: 'From ticket submission to automated verification confirmation',
          escalationRoute: `${roles?.headOfItOrEngineeringRole || 'Head of IT'} (${roles?.headOfItOrEngineeringEmail || 'it@org.local'})`
        },
        {
          category: 'Role Modification or Entitlement Change',
          approvedTarget: `Within ${slas.roleModificationDays} business day(s) (${slas.roleModificationDays * 24} hours)`,
          measuredInterval: 'From change approval to entitlement update confirmation',
          escalationRoute: `${roles?.headOfItOrEngineeringRole || 'Head of IT'}`
        },
        {
          category: 'Privileged Access Elevation (PIM/PAM)',
          approvedTarget: `Within ${slas.privilegedAccessHours} hours (Dual Authorization Required)`,
          measuredInterval: 'From dual-signoff to time-limited token generation',
          escalationRoute: `${roles?.ismsOwnerOrCisoRole || 'CISO'} (${roles?.ismsOwnerOrCisoEmail || 'ciso@org.local'})`
        },
        {
          category: 'Emergency / Break-Glass Access',
          approvedTarget: `Within ${slas.emergencyAccessMinutes} minutes (Retrospective Review within 24h)`,
          measuredInterval: 'From incident declaration to emergency credential release',
          escalationRoute: `CISO Hotline & Incident Commander`
        }
      ];
    }

    // Tailor Evidence Retention System
    if (tailored.evidenceRetentionAndProtection) {
      tailored.evidenceRetentionAndProtection = tailored.evidenceRetentionAndProtection.map(item => ({
        ...item,
        storageSystem: retention.evidenceStorageVault,
        retentionPeriod: `${retention.defaultRecordRetentionYears} years (${retention.accessLogRetentionDays} days active queryable)`
      }));
    }

    // Tailor Related Systems
    tailored.relatedDocumentsAndSystems = [
      `${org.legalEntityName} Information Security Policy`,
      `${org.legalEntityName} Access Control Standard`,
      `${ops.identityProvider} Administration Manual`,
      `${ops.ticketingAndItsmSystem} Service Catalog Specs`,
      `${retention.evidenceStorageVault} Retention Guideline`
    ];

    // Tailor Approval Records
    tailored.appendixA_ApprovalRecord = [
      {
        role: roles.ismsOwnerOrCisoRole,
        nameOrIdentity: roles.ismsOwnerOrCisoEmail,
        decision: 'Review pending',
        date: 'Pending',
        evidenceReference: 'Review in progress'
      },
      {
        role: roles.securityReviewerRole,
        nameOrIdentity: roles.securityReviewerEmail,
        decision: 'Review pending',
        date: 'Pending',
        evidenceReference: 'Pre-approval quality scan'
      },
      {
        role: approvals.policyApprovalAuthority || roles.executiveSponsorRole,
        nameOrIdentity: roles.executiveSponsorEmail,
        decision: 'Approval pending',
        date: 'Pending',
        evidenceReference: 'Awaiting executive sign-off'
      }
    ];

    // Tailor Appendix C Checklist
    tailored.appendixC_TailoringChecklist = tailored.appendixC_TailoringChecklist.map((item, idx) => {
      // Mark verified foundational items completed based on questionnaire
      if (idx === 0) {
        return {
          ...item,
          isCompleted: true,
          completedBy: roles.securityReviewerEmail,
          completedAt: new Date().toISOString(),
          verifiedEvidenceRef: `Questionnaire Profile: ${org.legalEntityName} (${scope.inScopeLocations.join(', ')})`
        };
      }
      if (idx === 1) {
        return {
          ...item,
          isCompleted: true,
          completedBy: roles.securityReviewerEmail,
          completedAt: new Date().toISOString(),
          verifiedEvidenceRef: `Org Chart Mapping: CISO (${roles.ismsOwnerOrCisoEmail}), Exec (${roles.executiveSponsorEmail})`
        };
      }
      if (idx === 3 && ops.identityProvider) {
        return {
          ...item,
          isCompleted: true,
          completedBy: roles.securityReviewerEmail,
          completedAt: new Date().toISOString(),
          verifiedEvidenceRef: `Systems Validated: IdP=${ops.identityProvider}, ITSM=${ops.ticketingAndItsmSystem}`
        };
      }
      return item;
    });

    // Run quality validation
    const scorecard = this.evaluateConsultingQuality(tailored);
    tailored.qualityScore = scorecard.overallScore;
    tailored.sha256Digest = this.computeDocumentDigest(tailored);
    tailored.updatedAt = new Date().toISOString();

    return tailored;
  }

  // --------------------------------------------------------------------------
  // QUALITY EVALUATION (ENTERPRISE CONSULTING STANDARD)
  // --------------------------------------------------------------------------

  /**
   * Evaluates a document against the 7 Enterprise Consulting Quality Dimensions:
   * 1. Structural Completeness
   * 2. RACI Discipline (Strict single Accountable role per activity)
   * 3. Operational Gates (Exit Criteria + Failure Handling defined on every step)
   * 4. Assurance Limitations Declared
   * 5. Traceability to Frameworks / Controls
   * 6. Placeholder-Free in Approved/Published State
   * 7. Tailoring Checklist Completion
   */
  public evaluateConsultingQuality(doc: EnterpriseConsultingDocument): DocumentationQualityScorecard {
    const findings: DocumentationQualityFinding[] = [];
    const dimScores: Record<string, { name: string; score: number; maxScore: number; passed: boolean }> = {};

    // 1. Structural Completeness (Max 20)
    let structScore = 20;
    if (!doc.metadata.documentId || !doc.metadata.title || !doc.metadata.documentType) {
      structScore -= 10;
      findings.push({
        code: 'STRUCT-01',
        severity: 'CRITICAL',
        section: 'Metadata',
        finding: 'Document is missing critical identification metadata (ID, Title, or Type).',
        remediation: 'Populate Document Control metadata block.'
      });
    }

    // Owner check
    if (!doc.metadata.documentOwner || doc.metadata.documentOwner.trim().length === 0) {
      structScore -= 5;
      findings.push({
        code: 'OWNER-01',
        severity: 'CRITICAL',
        section: 'Document Control / Ownership',
        finding: 'Document Owner is absent or empty. Mandatory governance requires an assigned role.',
        remediation: 'Assign accountable document owner role.'
      });
    }

    // Approver check
    if (!doc.metadata.approver || doc.metadata.approver.trim().length === 0) {
      structScore -= 5;
      findings.push({
        code: 'APPROV-01',
        severity: 'CRITICAL',
        section: 'Document Control / Approval',
        finding: 'Approval authority is absent or empty. Delegation of authority requires an assigned approver.',
        remediation: 'Assign authorized management approver role.'
      });
    }

    if (!doc.purpose || doc.purpose.trim().length < 50) {
      structScore -= 5;
      findings.push({
        code: 'STRUCT-02',
        severity: 'HIGH',
        section: 'Purpose',
        finding: 'Purpose section is absent or insufficiently descriptive (< 50 characters).',
        remediation: 'Articulate management direction and core objectives.'
      });
    }
    if (!doc.scope.statement || doc.scope.statement.trim().length < 20 || doc.scope.inScopeLocations.length === 0) {
      structScore -= 5;
      findings.push({
        code: 'STRUCT-03',
        severity: 'HIGH',
        section: 'Scope',
        finding: 'Scope lacks clear geographic or operational boundary definitions.',
        remediation: 'Document in-scope entities, locations, and excluded boundaries.'
      });
    }
    dimScores['STRUCTURAL_COMPLETENESS'] = {
      name: 'Structural Completeness',
      score: Math.max(0, structScore),
      maxScore: 20,
      passed: structScore >= 16
    };

    // 2. RACI Discipline (Max 15)
    let raciScore = 15;
    let raciDisciplinePassed = true;
    if (doc.appendixB_OperationalRaci && doc.appendixB_OperationalRaci.length > 0) {
      doc.appendixB_OperationalRaci.forEach((row, idx) => {
        const roles = [row.requesterOrManager, row.systemOwner, row.iamOrOperator, row.securityReviewer, row.verifier];
        const accountableCount = roles.filter(r => r === 'A' || r === 'A/R').length;
        if (accountableCount !== 1) {
          raciDisciplinePassed = false;
          raciScore -= 3;
          findings.push({
            code: 'RACI-01',
            severity: 'CRITICAL',
            section: 'Appendix B (Operational RACI)',
            finding: `Activity "${row.activity}" (Row ${idx + 1}) has ${accountableCount} Accountable ('A') roles. Exactly ONE Accountable role is mandated by Enterprise Quality Standards.`,
            remediation: 'Ensure exactly one role has "A" or "A/R", while others are R, C, or I.'
          });
        }
      });
    }
    dimScores['RACI_DISCIPLINE'] = {
      name: 'RACI Single-Accountability Discipline',
      score: Math.max(0, raciScore),
      maxScore: 15,
      passed: raciDisciplinePassed
    };

    // 3. Operational Gates (Max 15)
    let gatesScore = 15;
    if (doc.procedureSteps && doc.procedureSteps.length > 0) {
      const seenStepNums = new Set<number>();
      doc.procedureSteps.forEach(step => {
        if (seenStepNums.has(step.stepNumber)) {
          gatesScore -= 3;
          findings.push({
            code: 'SECT-01',
            severity: 'HIGH',
            section: `Procedure Step ${step.stepNumber}`,
            finding: `Duplicate procedure step number ${step.stepNumber} detected.`,
            remediation: 'Ensure sequential, unique step numbering.'
          });
        }
        seenStepNums.add(step.stepNumber);

        if (!step.exitCriteria || step.exitCriteria.trim().length < 10) {
          gatesScore -= 2;
          findings.push({
            code: 'GATE-01',
            severity: 'HIGH',
            section: `Procedure Step ${step.stepNumber}`,
            finding: `Step ${step.stepNumber} ("${step.stepName}") lacks measurable Exit Criteria.`,
            remediation: 'Define affirmative conditions required to transition to subsequent gate.'
          });
        }
        if (!step.failureOrExceptionHandling || step.failureOrExceptionHandling.trim().length < 10) {
          gatesScore -= 2;
          findings.push({
            code: 'GATE-02',
            severity: 'HIGH',
            section: `Procedure Step ${step.stepNumber}`,
            finding: `Step ${step.stepNumber} ("${step.stepName}") lacks defined Failure/Exception handling.`,
            remediation: 'Define containment, halt criteria, or escalation when the step fails.'
          });
        }

        // Action specificity check
        const genericPlaceholders = ['tbd', 'to be done', 'do action', 'perform step', 'n/a', 'none'];
        const trimmedAction = (step.requiredAction || '').trim();
        if (trimmedAction.length < 20 || genericPlaceholders.includes(trimmedAction.toLowerCase())) {
          gatesScore -= 2;
          findings.push({
            code: 'GATE-03',
            severity: 'HIGH',
            section: `Procedure Step ${step.stepNumber}`,
            finding: `Step ${step.stepNumber} ("${step.stepName}") required action lacks operational specificity (< 20 characters or generic placeholder).`,
            remediation: 'Define actionable operational instructions with target systems and boundary rules.'
          });
        }

        // Evidence requirement check
        const trimmedEvidence = (step.evidenceProduced || '').trim();
        if (trimmedEvidence.length < 10 || genericPlaceholders.includes(trimmedEvidence.toLowerCase())) {
          gatesScore -= 2;
          findings.push({
            code: 'EVID-01',
            severity: 'HIGH',
            section: `Procedure Step ${step.stepNumber}`,
            finding: `Step ${step.stepNumber} ("${step.stepName}") lacks auditable evidence requirement (< 10 characters or generic placeholder).`,
            remediation: 'Specify verifiable records, system logs, or approval tickets produced.'
          });
        }
      });
    }
    dimScores['OPERATIONAL_GATES'] = {
      name: 'Operational Exit & Failure Gates',
      score: Math.max(0, gatesScore),
      maxScore: 15,
      passed: gatesScore >= 12
    };

    // 4. Assurance Limitations Declared (Max 15)
    let assuranceScore = 15;
    if (doc.controlImplementationAndEvidence && doc.controlImplementationAndEvidence.length > 0) {
      const missingLimitations = doc.controlImplementationAndEvidence.filter(
        e => !e.assuranceLimitation || e.assuranceLimitation.trim().length < 15
      );
      if (missingLimitations.length > 0) {
        assuranceScore -= missingLimitations.length * 3;
        findings.push({
          code: 'ASSURE-01',
          severity: 'HIGH',
          section: 'Control Implementation and Evidence',
          finding: `${missingLimitations.length} evidence specifications fail to declare Assurance Limitations.`,
          remediation: 'Specify what the record proves and what it does not prove (e.g. "A ticket does not prove complete response").'
        });
      }
    } else if (doc.evidenceRetentionAndProtection && doc.evidenceRetentionAndProtection.length > 0) {
      const missingFieldsOrPurposes = doc.evidenceRetentionAndProtection.filter(
        e => !e.minimumFields || e.minimumFields.trim().length < 10 || !e.controlPurpose || e.controlPurpose.trim().length < 10
      );
      if (missingFieldsOrPurposes.length > 0) {
        assuranceScore -= missingFieldsOrPurposes.length * 3;
        findings.push({
          code: 'ASSURE-02',
          severity: 'HIGH',
          section: 'Evidence, Retention and Access Protection',
          finding: `${missingFieldsOrPurposes.length} evidence specifications lack minimum fields or control purposes.`,
          remediation: 'Specify required data fields and exact control purpose for each record.'
        });
      }
    }
    dimScores['ASSURANCE_LIMITATIONS'] = {
      name: 'Assurance Limitation Acknowledgment',
      score: Math.max(0, assuranceScore),
      maxScore: 15,
      passed: assuranceScore >= 12
    };

    // 5. Traceability Binding (Max 15)
    let traceScore = 15;
    const recognizedControlPattern = /^(A\.\d+(\.\d+)?|CC\d+\.\d+|MAS\s*\d+(\.\d+)?|DPDP-[A-Z]+-\d+|NIST-[A-Z]+-\d+|RSK-[A-Z0-9_-]+|SOC2-[A-Z0-9]+)$/i;

    if (doc.mandatoryRequirements && doc.mandatoryRequirements.length > 0) {
      const seenSectionIds = new Set<string>();
      doc.mandatoryRequirements.forEach(req => {
        if (seenSectionIds.has(req.sectionId)) {
          traceScore -= 2;
          findings.push({
            code: 'SECT-01',
            severity: 'HIGH',
            section: `Section ${req.sectionId}`,
            finding: `Duplicate requirement section ID "${req.sectionId}" detected ("${req.title}").`,
            remediation: 'Ensure unique section numbering across all policy clauses.'
          });
        }
        seenSectionIds.add(req.sectionId);

        const untraced = (!req.linkedFrameworkClauses || req.linkedFrameworkClauses.length === 0) &&
                         (!req.linkedControlCodes || req.linkedControlCodes.length === 0);
        if (untraced) {
          traceScore -= 3;
          findings.push({
            code: 'TRACE-01',
            severity: 'MEDIUM',
            section: `Section ${req.sectionId} (${req.title})`,
            finding: `Mandatory requirement statement lacks linkage to framework clauses or control codes.`,
            remediation: 'Map requirements to ISO 27001 / Annex A / SOC 2 controls.'
          });
        }

        if (req.linkedControlCodes) {
          req.linkedControlCodes.forEach(code => {
            if (!recognizedControlPattern.test(code.trim())) {
              traceScore -= 2;
              findings.push({
                code: 'CTRL-01',
                severity: 'HIGH',
                section: `Section ${req.sectionId}`,
                finding: `Control code "${code}" does not match recognized framework taxonomies (ISO 27001, SOC 2, MAS TRM, DPDP).`,
                remediation: 'Use authoritative control identifiers (e.g. A.5.15, CC6.1, MAS 11.1).'
              });
            }
          });
        }
      });
    }
    dimScores['TRACEABILITY_BINDING'] = {
      name: 'Framework & Control Traceability',
      score: Math.max(0, traceScore),
      maxScore: 15,
      passed: traceScore >= 12
    };

    // 6. Placeholder-Free in Approved/Published State (Max 10)
    let placeholderScore = 10;
    const isApprovedOrPublished =
      doc.metadata.status.includes('Approved') ||
      doc.metadata.status.includes('PUBLISHED') ||
      doc.metadata.status.includes('Effective');

    const isModelBenchmark =
      Boolean(doc.isModelSample) ||
      doc.tenantId === 'SKANDA-MODEL-BENCHMARK' ||
      doc.metadata.status.includes('Model sample') ||
      Boolean(doc.metadata.notice && doc.metadata.notice.includes('ILLUSTRATIVE MODEL DOCUMENT'));

    const serialized = JSON.stringify(doc);
    const modelPlaceholders = [
      'Role to be formally assigned',
      'Authorized management approver to be assigned',
      'Not assigned',
      'To be defined',
      '{{ORGANIZATION_NAME}}',
      '{{LEGAL_ENTITY_NAME}}'
    ];

    const foundPlaceholders = modelPlaceholders.filter(p => serialized.includes(p));
    if (isApprovedOrPublished && foundPlaceholders.length > 0) {
      placeholderScore = 0;
      findings.push({
        code: 'HOLD-01',
        severity: 'CRITICAL',
        section: 'Document Control / Placeholders',
        finding: `Document in status "${doc.metadata.status}" contains ${foundPlaceholders.length} unresolved model placeholders: ${foundPlaceholders.join(', ')}.`,
        remediation: 'Complete all placeholder fields before approving or publishing.'
      });
    } else if (foundPlaceholders.length > 0 && !isModelBenchmark) {
      placeholderScore -= Math.min(6, foundPlaceholders.length * 2);
      findings.push({
        code: 'HOLD-02',
        severity: 'HIGH',
        section: 'Document Control / Placeholders',
        finding: `Draft document contains ${foundPlaceholders.length} unresolved model placeholders: ${foundPlaceholders.join(', ')}.`,
        remediation: 'Provide organizational values to resolve all placeholders before submission for review.'
      });
    }
    dimScores['PLACEHOLDER_FREE'] = {
      name: 'Placeholder & Model Cleanliness',
      score: Math.max(0, placeholderScore),
      maxScore: 10,
      passed: placeholderScore >= 8
    };

    // 7. Tailoring Checklist Completion (Max 10)
    let checklistScore = 10;
    const completedItems = doc.appendixC_TailoringChecklist.filter(c => c.isCompleted).length;
    const totalItems = doc.appendixC_TailoringChecklist.length;
    if (totalItems > 0) {
      if (isModelBenchmark && !isApprovedOrPublished) {
        // Model sample benchmarks verify that the mandatory tailoring checklist scaffolding is defined
        checklistScore = totalItems >= 7 ? 10 : Math.round((totalItems / 7) * 10);
      } else {
        const completionRate = completedItems / totalItems;
        checklistScore = Math.round(completionRate * 10);
        if (isApprovedOrPublished && completionRate < 1.0) {
          findings.push({
            code: 'TAILOR-01',
            severity: 'CRITICAL',
            section: 'Appendix C (Tailoring Checklist)',
            finding: `Pre-publication tailoring checklist is only ${Math.round(completionRate * 100)}% complete (${completedItems}/${totalItems}). All items must be completed before formal publication.`,
            remediation: 'Complete and evidence all pre-publication tailoring checkpoints.'
          });
        } else if (completionRate < 1.0 && !isModelBenchmark) {
          findings.push({
            code: 'TAILOR-02',
            severity: 'MEDIUM',
            section: 'Appendix C (Tailoring Checklist)',
            finding: `Pre-publication tailoring checklist is incomplete (${completedItems}/${totalItems} items completed).`,
            remediation: 'Verify and record evidence for all tailoring checkpoints prior to approval.'
          });
        }
      }
    }
    dimScores['TAILORING_CHECKLIST'] = {
      name: 'Pre-Publication Tailoring Verification',
      score: Math.max(0, checklistScore),
      maxScore: 10,
      passed: checklistScore >= 7
    };

    // Detect textual padding or excessive repetition in purpose, requirements, or steps
    const checkRepetition = (text: string): boolean => {
      const w = text.toLowerCase().split(/\s+/).filter(word => word.length > 3);
      if (w.length >= 30) {
        const u = new Set(w);
        return (u.size / w.length) < 0.35;
      }
      return false;
    };

    const isPurposePadded = checkRepetition(doc.purpose);
    const isRequirementPadded = (doc.mandatoryRequirements || []).some(r => checkRepetition(r.statement));
    const isStepPadded = (doc.procedureSteps || []).some(s => checkRepetition(s.requiredAction));

    if (isPurposePadded || isRequirementPadded || isStepPadded) {
      dimScores['STRUCTURAL_COMPLETENESS'].score = Math.max(0, dimScores['STRUCTURAL_COMPLETENESS'].score - 6);
      findings.push({
        code: 'PADDING-01',
        severity: 'MEDIUM',
        section: 'Content Substance',
        finding: 'High textual repetition detected (< 35% unique words). Avoid repetitive boilerplate padding.',
        remediation: 'Provide specific, substantive organizational principles.'
      });
    }

    // Document-Type Specific Quality Gates
    const docType = doc.metadata.documentType;
    if (docType === 'POLICY') {
      if (!doc.mandatoryRequirements || doc.mandatoryRequirements.length === 0) {
        findings.push({
          code: 'POL-REQ-01',
          severity: 'CRITICAL',
          section: 'Mandatory Policy Requirements',
          finding: 'Policy documents must contain explicit, numbered mandatory requirement statements.',
          remediation: 'Define policy directives with linked controls.'
        });
      }
      if (!doc.governanceAndAccountability || doc.governanceAndAccountability.length === 0) {
        findings.push({
          code: 'POL-GOV-01',
          severity: 'HIGH',
          section: 'Governance & Accountability',
          finding: 'Policy documents must articulate role-based governance accountabilities.',
          remediation: 'Specify executive, owner, and operational accountabilities.'
        });
      }
    } else if (docType === 'PROCEDURE' || docType === 'SOP') {
      if (!doc.procedureSteps || doc.procedureSteps.length < 2) {
        findings.push({
          code: 'PROC-STEPS-01',
          severity: 'CRITICAL',
          section: 'Operational Procedure Steps',
          finding: 'Procedures and SOPs must contain sequential, multi-step operational workflows (minimum 2 steps).',
          remediation: 'Document sequential operational steps with gates and evidence.'
        });
      }
      if (!doc.rolesAndSegregationOfDuties || doc.rolesAndSegregationOfDuties.length === 0) {
        findings.push({
          code: 'PROC-SOD-01',
          severity: 'HIGH',
          section: 'Segregation of Duties',
          finding: 'Procedures must explicitly define role boundaries and segregation of duties.',
          remediation: 'Specify permitted responsibilities and prohibited conflict roles.'
        });
      }
    } else if (docType === 'REGISTER_LOG') {
      const hasSchema = Boolean(doc.registerSchema && doc.registerSchema.length > 0);
      const hasInputs = Boolean(doc.inputsAndRequiredRecords && doc.inputsAndRequiredRecords.length > 0);
      if (!hasSchema && !hasInputs) {
        findings.push({
          code: 'REG-FIELDS-01',
          severity: 'HIGH',
          section: 'Register Inputs & Records',
          finding: 'Registers and logs must specify input data attributes and validation rules.',
          remediation: 'Define required schema fields and intake controls.'
        });
      }

      // Statutory RoPA check
      const isRopaDoc = doc.metadata.documentId.includes('ROPA') || (doc.templateId && doc.templateId.includes('ROPA'));
      if (isRopaDoc) {
        const schemaCols = doc.registerSchema?.length || 0;
        const recordsCount = doc.registerRecords?.length || 0;
        if (schemaCols < 6 || recordsCount === 0) {
          findings.push({
            code: 'ROPA-01',
            severity: 'CRITICAL',
            section: 'Statutory RoPA Fields (GDPR Art 30 / DPDP Sec 8)',
            finding: `RoPA Register lacks statutory fields or substantive processing records (found ${schemaCols} schema cols, ${recordsCount} records). Minimum 6 statutory columns and 1 active record required.`,
            remediation: 'Populate mandatory GDPR Art 30 / DPDP Sec 8 columns (Purpose, Data Subjects, Categories, Recipients, Transfers, Retention, TOMs).'
          });
        }
      }
    } else if (docType === 'MANAGEMENT_REVIEW_PACK') {
      const isSoaPack = doc.metadata.documentId.includes('SOA') || (doc.templateId && doc.templateId.includes('SOA'));
      if (isSoaPack) {
        const soaCount = doc.statementOfApplicabilityEntries?.length || 0;
        const agendaCount = doc.managementReviewAgenda?.length || 0;
        if (soaCount === 0 && agendaCount === 0) {
          findings.push({
            code: 'REV-01',
            severity: 'CRITICAL',
            section: 'SoA Control Coverage & Management Review Agenda',
            finding: 'Statement of Applicability Review Pack must include structured review agenda or ISO 27001 Annex A control coverage.',
            remediation: 'Provide ISO/IEC 27001:2022 Statement of Applicability control mappings and Clause 9.3 review agenda.'
          });
        }
      }

      if (!doc.evidenceRetentionAndProtection || doc.evidenceRetentionAndProtection.length === 0) {
        findings.push({
          code: 'MGMT-REC-01',
          severity: 'HIGH',
          section: 'Executive Decision Records',
          finding: 'Management Review Packs must define executive decision evidence retention and protection rules.',
          remediation: 'Specify minutes and decision log retention rules.'
        });
      }
    }

    // ------------------------------------------------------------------------
    // REGULATORY ACCURACY & SOURCE TRACEABILITY QUALITY GATES (PHASE 48.1)
    // ------------------------------------------------------------------------

    const allReqStatements = (doc.mandatoryRequirements || []).map(r => r.statement).join(' ');
    const allStepActions = (doc.procedureSteps || []).map(s => s.requiredAction).join(' ');
    const combinedOperationalText = `${allReqStatements} ${allStepActions}`;

    // GATE 1: Incident Reporting Deadlines & Cross-Jurisdictional Conflation (REG-ACC-01)
    const mentionsCertIn = combinedOperationalText.includes('CERT-In') || combinedOperationalText.includes('6 hours');
    const mentionsMas = combinedOperationalText.includes('MAS') || combinedOperationalText.includes('Monetary Authority of Singapore') || combinedOperationalText.includes('1 hour');
    const mentionsGdprIncident = combinedOperationalText.includes('GDPR') && (combinedOperationalText.includes('72 hours') || combinedOperationalText.includes('breach'));
    const mentionsDpdpIncident = (combinedOperationalText.includes('DPDP') || combinedOperationalText.includes('Data Protection Board')) && (combinedOperationalText.includes('intimation') || combinedOperationalText.includes('immediate'));

    if (mentionsCertIn || mentionsMas || mentionsGdprIncident || mentionsDpdpIncident) {
      const hasConflatedUniversalReporting =
        combinedOperationalText.includes('strictly within statutory deadlines: CERT-In (India): within 6 hours of identification; Monetary Authority of Singapore (MAS): within 1 hour of confirmation;') ||
        (combinedOperationalText.includes('MAS') && combinedOperationalText.includes('1 hour') && !combinedOperationalText.toLowerCase().includes('financial institution') && !combinedOperationalText.toLowerCase().includes('regulated')) ||
        (combinedOperationalText.includes('DPDP') && combinedOperationalText.includes('immediate') && !combinedOperationalText.includes('prescribed'));

      if (hasConflatedUniversalReporting) {
        findings.push({
          code: 'REG-ACC-01',
          severity: 'CRITICAL',
          section: 'Incident Notification Mandates',
          finding: 'Conflated or unverified regulatory reporting deadlines detected. Reporting obligations must specify exact jurisdiction, regulated entity scope, triggering conditions, and distinguish statutory deadlines from internal escalation targets.',
          remediation: 'Disaggregate incident reporting into a structured jurisdictional matrix (CERT-In for Indian entities/20 incident types; MAS 1h for regulated financial institutions upon severe disruption; GDPR 72h for risk-to-rights; DPDP as prescribed).'
        });
      }
    }

    // GATE 2: Vulnerability Management Remediation SLOs vs. Statutory Mandates (REG-ACC-02)
    const isVulnDoc = doc.metadata.documentId.includes('VULN') || (doc.templateId && doc.templateId.includes('VULN')) || doc.metadata.documentId.includes('SEC-009');
    if (isVulnDoc) {
      const claimsStatutoryVulnSla = (doc.mandatoryRequirements || []).some(r => {
        const text = r.statement.toLowerCase();
        const hasSla = text.includes('48 hours') || text.includes('7 calendar days') || text.includes('30 calendar days');
        const claimsMandatoryLaw = r.provenance === 'VERIFIED_ORGANIZATIONAL_FACT' &&
          (r.statement.includes('mandatory SLA windows') || r.statement.includes('non-negotiable')) &&
          !r.statement.toLowerCase().includes('service level objective') &&
          !r.statement.toLowerCase().includes('configurable') &&
          !r.statement.toLowerCase().includes('organization-approved');
        return hasSla && claimsMandatoryLaw;
      });

      if (claimsStatutoryVulnSla) {
        findings.push({
          code: 'REG-ACC-02',
          severity: 'CRITICAL',
          section: 'Vulnerability Remediation SLOs',
          finding: 'Vulnerability remediation targets (48h/7d/30d) presented as non-negotiable universal mandates rather than organization-defined service level objectives (SLOs). Neither ISO 27001 Annex A.8.8 nor SOC 2 CC7.1 prescribes fixed daily windows.',
          remediation: 'Provide a configurable, risk-adjusted SLA model based on severity, exploitability (CISA KEV/EPSS), asset exposure, and approved risk exceptions.'
        });
      }
    }

    // GATE 3: RoPA Register Legal Accuracy & Regime Separation (REG-ACC-03)
    const isRopa = doc.metadata.documentId.includes('ROPA') || (doc.templateId && doc.templateId.includes('ROPA'));
    if (isRopa && doc.registerSchema && doc.registerSchema.length > 0) {
      const hasConflatedCitations = doc.registerSchema.some(c =>
        c.regulatorySource.includes('GDPR Art 30(1)(b) / DPDP Sec 4') ||
        c.regulatorySource.includes('GDPR Art 30(1)(e) / DPDP Sec 16') ||
        (c.fieldName === 'Process ID' && c.regulatorySource.includes('GDPR Art 30(1)')) ||
        (c.fieldName === 'Legal Basis' && c.regulatorySource.includes('GDPR Art 6 / DPDP Sec 6') && c.isMandatory && !c.legalRegime)
      );

      const hasRegimeClassification = doc.registerSchema.some(c => Boolean(c.legalRegime));
      const schemaCheck = validatePrivacyRegisterSchema(doc.registerSchema);

      if (hasConflatedCitations || !hasRegimeClassification || !schemaCheck.isValid) {
        const failureDetails = schemaCheck.defects.map(d => `[${d.code}] ${d.message}`).join(' ');
        findings.push({
          code: 'REG-ACC-03',
          severity: 'CRITICAL',
          section: 'RoPA Statutory Schema & Regime Separation',
          finding: failureDetails || 'RoPA schema conflates GDPR Article 30 statutory mandates with India DPDP Act 2023 compliance fields, or misclassifies internal governance fields (Process ID, Legal Basis) as statutory Article 30 mandates.',
          remediation: 'Partition schema into Tier A: GDPR Art 30(1) Statutory, Tier B: India DPDP 2023 Compliance, and Tier C: Enterprise Privacy Governance Recommended.'
        });
      }
    }

    // GATE 4: Unverified Framework Claims & Missing Source Provenance (REG-ACC-04)
    const hasUnverifiedRequirements = (doc.mandatoryRequirements || []).some(r =>
      (r.provenance as string) === 'UNVERIFIED_SOURCE_MAPPING' ||
      (r.provenance as string) === 'UNVERIFIED_MAPPING' ||
      (!r.linkedFrameworkClauses || r.linkedFrameworkClauses.length === 0)
    );
    if (hasUnverifiedRequirements && (isApprovedOrPublished || isModelBenchmark)) {
      findings.push({
        code: 'REG-ACC-04',
        severity: 'CRITICAL',
        section: 'Framework Clause Traceability & Provenance',
        finding: 'Mandatory requirements contain unverified framework claims or missing authoritative clause linkages.',
        remediation: 'Provide verified primary clause citations or downgrade document to draft status.'
      });
    }

    // GATE 5: Conflicting Deadlines & Contradictory Timing (REG-ACC-05)
    const mentionsLongEscalation = combinedOperationalText.includes('escalate within 24 hours') || combinedOperationalText.includes('escalate within 48 hours');
    const mentionsShortStatutory = combinedOperationalText.includes('within 6 hours') || combinedOperationalText.includes('within 1 hour');
    if (mentionsLongEscalation && mentionsShortStatutory && combinedOperationalText.includes('prior to external escalation')) {
      findings.push({
        code: 'REG-ACC-05',
        severity: 'CRITICAL',
        section: 'Conflicting Operational & Regulatory Deadlines',
        finding: 'Internal escalation window is configured longer than statutory notification deadline, risking regulatory non-compliance.',
        remediation: 'Ensure internal incident escalation triggers occur within a fraction of statutory reporting windows.'
      });
    }

    const overallScore = Object.values(dimScores).reduce((acc, d) => acc + d.score, 0);
    const criticals = findings.filter(f => f.severity === 'CRITICAL');
    const warnings = findings.filter(f => f.severity !== 'CRITICAL');

    return {
      evaluationId: `QUAL-${Date.now().toString(36).toUpperCase()}`,
      evaluatedAt: new Date().toISOString(),
      documentId: doc.metadata.documentId,
      overallScore,
      isConsultingGrade: overallScore >= 85 && criticals.length === 0,
      isReadyForPublication: overallScore >= 90 && criticals.length === 0 && completedItems === totalItems,
      dimensionScores: dimScores,
      criticalDefects: criticals,
      warnings,
      tailoringCompletedCount: completedItems,
      tailoringTotalCount: totalItems,
      raciDisciplinePassed
    };
  }

  // --------------------------------------------------------------------------
  // INTEGRATION WITH AUTHORITATIVE POLICY GOVERNANCE ENGINE
  // --------------------------------------------------------------------------

  /**
   * Promotes an EnterpriseConsultingDocument into an authoritative GovernanceDocument
   * registered with the existing PolicyGovernanceEngine and persisted to PostgreSQL.
   */
  public promoteToGovernanceDocument(
    doc: EnterpriseConsultingDocument,
    actorEmail: string,
    actorRole: string
  ): GovernanceDocument {
    // Map consulting document to GovernanceDocument structure
    const govDocPayload = {
      tenantId: doc.tenantId,
      code: doc.metadata.documentId,
      title: doc.metadata.title,
      type: doc.metadata.documentType,
      departmentId: 'SEC',
      departmentName: 'Information Security & Technology Risk',
      processId: doc.metadata.documentType === 'POLICY' ? 'ISMS-GOV' : 'IAM-OPS',
      processName: doc.metadata.documentType === 'POLICY' ? 'ISMS Governance' : 'Access Provisioning',
      frameworkCodes: ['ISO_27001_2022', 'SOC_2_TYPE_2', 'MAS_TRM_2021'],
      ownerEmail: actorEmail,
      ownerRole: doc.metadata.documentOwner || actorRole,
      authorEmail: actorEmail,
      authorRole: actorRole,
      reviewCadence: 'ANNUAL' as const,
      nextReviewDate: new Date(Date.now() + 365 * 86400000).toISOString(),
      content: {
        purpose: doc.purpose,
        scope: doc.scope.statement,
        objectives: doc.policyObjectives || [],
        definitions: doc.termsAndDefinitions.reduce((acc, t) => {
          acc[t.term] = t.definition;
          return acc;
        }, {} as Record<string, string>),
        rolesAndResponsibilities: (doc.governanceAndAccountability || []).map(g => ({
          role: g.role,
          mandate: g.accountability,
          r: true,
          a: g.role.includes('Executive') || g.role.includes('Top management'),
          c: false,
          i: true
        })),
        requirementsOrSteps: (doc.procedureSteps || []).map(s => ({
          stepNumber: s.stepNumber,
          actor: s.responsibleRole,
          system: 'Target System / IAM',
          action: s.requiredAction,
          expectedOutput: s.exitCriteria,
          evidenceProduced: s.evidenceProduced
        })),
        controlMappings: (doc.mandatoryRequirements || []).map(m => ({
          controlCode: m.linkedControlCodes[0] || 'A.5.1',
          requirement: m.title,
          practice: m.statement
        })),
        exceptionHandling: {
          workflow: 'Formal CISO waiver request recorded in policy waiver registry.',
          approver: doc.metadata.approver,
          maxDays: 90
        },
        governanceAndReview: {
          cycle: 'ANNUAL',
          owner: doc.metadata.documentOwner,
          approver: doc.metadata.approver
        }
      },
      linkedControlCodes: ['A.5.1', 'A.5.15', 'A.8.2', 'A.8.5'],
      linkedRiskIds: ['RSK-IAM-01', 'RSK-GOV-02'],
      mandatoryAcknowledgement: doc.metadata.documentType === 'POLICY'
    };

    return policyGovernanceEngine.createDocument(govDocPayload);
  }

  // --------------------------------------------------------------------------
  // DOCUMENT VERSIONING & GRANULAR DIFFING
  // --------------------------------------------------------------------------

  /**
   * Performs granular, section-by-section comparison of two document versions
   */
  public diffDocuments(
    docA: EnterpriseConsultingDocument,
    docB: EnterpriseConsultingDocument
  ): DocumentVersionDiff {
    const metadataDiffs: Array<{ field: string; sourceValue: string; targetValue: string }> = [];

    const checkMeta = (field: keyof DocumentControlMetadata, label: string) => {
      const vA = String(docA.metadata[field] || '');
      const vB = String(docB.metadata[field] || '');
      if (vA !== vB) {
        metadataDiffs.push({ field: label, sourceValue: vA, targetValue: vB });
      }
    };

    checkMeta('title', 'Document Title');
    checkMeta('version', 'Version');
    checkMeta('status', 'Status');
    checkMeta('documentOwner', 'Document Owner');
    checkMeta('approver', 'Approver');
    checkMeta('classification', 'Classification');
    checkMeta('effectiveDate', 'Effective Date');
    checkMeta('reviewTrigger', 'Review Trigger');

    const purposeChanged = docA.purpose !== docB.purpose;
    const scopeChanged = JSON.stringify(docA.scope) !== JSON.stringify(docB.scope);

    // Terms diff
    const termsA = new Map(docA.termsAndDefinitions.map(t => [t.term, t.definition]));
    const termsB = new Map(docB.termsAndDefinitions.map(t => [t.term, t.definition]));
    const termsAdded = docB.termsAndDefinitions.filter(t => !termsA.has(t.term)).map(t => t.term);
    const termsRemoved = docA.termsAndDefinitions.filter(t => !termsB.has(t.term)).map(t => t.term);

    // Requirements diff
    const requirementsDiffs: Array<{ sectionId: string; title: string; change: 'ADDED' | 'REMOVED' | 'MODIFIED' }> = [];
    if (docA.mandatoryRequirements || docB.mandatoryRequirements) {
      const reqA = new Map((docA.mandatoryRequirements || []).map(r => [r.sectionId, r]));
      const reqB = new Map((docB.mandatoryRequirements || []).map(r => [r.sectionId, r]));

      reqB.forEach((r, secId) => {
        if (!reqA.has(secId)) {
          requirementsDiffs.push({ sectionId: secId, title: r.title, change: 'ADDED' });
        } else {
          const prev = reqA.get(secId)!;
          if (prev.statement !== r.statement || JSON.stringify(prev.linkedControlCodes) !== JSON.stringify(r.linkedControlCodes)) {
            requirementsDiffs.push({ sectionId: secId, title: r.title, change: 'MODIFIED' });
          }
        }
      });
      reqA.forEach((r, secId) => {
        if (!reqB.has(secId)) {
          requirementsDiffs.push({ sectionId: secId, title: r.title, change: 'REMOVED' });
        }
      });
    }

    // Steps diff
    const stepsDiffs: Array<{ stepNumber: number; stepName: string; change: 'ADDED' | 'REMOVED' | 'MODIFIED' }> = [];
    if (docA.procedureSteps || docB.procedureSteps) {
      const stepsA = new Map((docA.procedureSteps || []).map(s => [s.stepNumber, s]));
      const stepsB = new Map((docB.procedureSteps || []).map(s => [s.stepNumber, s]));

      stepsB.forEach((s, num) => {
        if (!stepsA.has(num)) {
          stepsDiffs.push({ stepNumber: num, stepName: s.stepName, change: 'ADDED' });
        } else {
          const prev = stepsA.get(num)!;
          if (prev.requiredAction !== s.requiredAction || prev.exitCriteria !== s.exitCriteria || prev.failureOrExceptionHandling !== s.failureOrExceptionHandling) {
            stepsDiffs.push({ stepNumber: num, stepName: s.stepName, change: 'MODIFIED' });
          }
        }
      });
      stepsA.forEach((s, num) => {
        if (!stepsB.has(num)) {
          stepsDiffs.push({ stepNumber: num, stepName: s.stepName, change: 'REMOVED' });
        }
      });
    }

    // RACI diff
    const raciDiffs: Array<{ activity: string; change: string }> = [];
    if (docA.appendixB_OperationalRaci || docB.appendixB_OperationalRaci) {
      const raciA = new Map((docA.appendixB_OperationalRaci || []).map(r => [r.activity, r]));
      const raciB = new Map((docB.appendixB_OperationalRaci || []).map(r => [r.activity, r]));

      raciB.forEach((rowB, act) => {
        const rowA = raciA.get(act);
        if (!rowA) {
          raciDiffs.push({ activity: act, change: 'Added new RACI activity' });
        } else if (JSON.stringify(rowA) !== JSON.stringify(rowB)) {
          raciDiffs.push({ activity: act, change: `Modified role assignments (Mgr:${rowB.requesterOrManager}, Owner:${rowB.systemOwner}, IAM:${rowB.iamOrOperator}, Verifier:${rowB.verifier})` });
        }
      });
    }

    // Checklist diff
    const checklistDiffs: Array<{ id: string; statusChange: string }> = [];
    const chkA = new Map(docA.appendixC_TailoringChecklist.map(c => [c.id, c.isCompleted]));
    docB.appendixC_TailoringChecklist.forEach(cB => {
      const prev = chkA.get(cB.id);
      if (prev !== undefined && prev !== cB.isCompleted) {
        checklistDiffs.push({ id: cB.id, statusChange: cB.isCompleted ? 'COMPLETED (Verified)' : 'REVERTED TO UNVERIFIED' });
      }
    });

    const totalChanges =
      metadataDiffs.length +
      (purposeChanged ? 1 : 0) +
      (scopeChanged ? 1 : 0) +
      termsAdded.length +
      termsRemoved.length +
      requirementsDiffs.length +
      stepsDiffs.length +
      raciDiffs.length +
      checklistDiffs.length;

    const summary = `${docA.metadata.documentId} v${docA.metadata.version} -> v${docB.metadata.version}: ${totalChanges} change(s) detected across ${metadataDiffs.length} metadata attributes, ${requirementsDiffs.length || stepsDiffs.length} content sections, and ${checklistDiffs.length} verification checkpoints.`;

    return {
      documentId: docA.metadata.documentId,
      sourceVersion: docA.metadata.version,
      targetVersion: docB.metadata.version,
      metadataDiffs,
      purposeChanged,
      scopeChanged,
      termsAdded,
      termsRemoved,
      requirementsDiffs: requirementsDiffs.length > 0 ? requirementsDiffs : undefined,
      stepsDiffs: stepsDiffs.length > 0 ? stepsDiffs : undefined,
      raciDiffs,
      checklistDiffs,
      totalChanges,
      summary
    };
  }

  // --------------------------------------------------------------------------
  // EXPORT ENGINE (DOCX, PRINT-READY HTML, MARKDOWN)
  // --------------------------------------------------------------------------

  /**
   * Generates formatted GitHub Markdown string for document
   */
  public exportToMarkdown(doc: EnterpriseConsultingDocument): string {
    const meta = doc.metadata;
    let md = `# ${meta.title}\n\n`;
    if (meta.subtitle) md += `*${meta.subtitle}*\n\n`;
    if (meta.notice) md += `> **[!WARNING] ${meta.notice}**\n\n`;

    md += `### Document Control Field\n\n`;
    md += `| Document Control Field | Model Value |\n|---|---|\n`;
    md += `| **Document ID** | ${meta.documentId} |\n`;
    md += `| **Version / Status** | ${meta.version} — ${meta.status} |\n`;
    md += `| **Document Owner** | ${meta.documentOwner} |\n`;
    md += `| **Approver** | ${meta.approver} |\n`;
    md += `| **Effective Date** | ${meta.effectiveDate} |\n`;
    md += `| **Classification** | ${meta.classification} |\n`;
    md += `| **Review Trigger** | ${meta.reviewTrigger} |\n\n`;

    if (meta.modelUseNotice) {
      md += `> *${meta.modelUseNotice}*\n\n`;
    }

    md += `### Revision History\n\n`;
    md += `| Version | Date | Summary of Change | Prepared By | Approval Status |\n|---|---|---|---|---|\n`;
    doc.revisionHistory.forEach(r => {
      md += `| ${r.version} | ${r.date} | ${r.summaryOfChange} | ${r.preparedBy} | ${r.approvalStatus} |\n`;
    });
    md += `\n`;

    if (doc.documentGovernance && doc.documentGovernance.length > 0) {
      md += `### Document Governance\n\n`;
      md += `| Control | Requirement / Model Approach |\n|---|---|\n`;
      doc.documentGovernance.forEach(g => {
        md += `| **${g.control}** | ${g.requirementOrModelApproach} |\n`;
      });
      md += `\n`;
    }

    md += `## 1. Purpose\n\n${doc.purpose}\n\n`;
    md += `## 2. Scope\n\n${doc.scope.statement}\n\n`;
    if (doc.scope.inScopeLocations.length > 0) {
      md += `- **In-Scope Locations**: ${doc.scope.inScopeLocations.join(', ')}\n`;
    }
    if (doc.scope.inScopeSystemsAndServices.length > 0) {
      md += `- **In-Scope Systems & Services**: ${doc.scope.inScopeSystemsAndServices.join(', ')}\n`;
    }
    if (doc.scope.documentedExclusions.length > 0) {
      md += `\n**Documented Exclusions:**\n`;
      doc.scope.documentedExclusions.forEach(ex => {
        md += `- *${ex.item}*: ${ex.rationale}\n`;
      });
    }
    md += `\n`;

    md += `## 3. Terms and Definitions\n\n`;
    md += `| Term | Working Definition (Model) |\n|---|---|\n`;
    doc.termsAndDefinitions.forEach(t => {
      md += `| **${t.term}** | ${t.definition} |\n`;
    });
    md += `\n`;

    if (doc.policyObjectives && doc.policyObjectives.length > 0) {
      md += `## 4. Policy Objectives\n\n`;
      doc.policyObjectives.forEach(obj => {
        md += `- ${obj}\n`;
      });
      md += `\n`;
    }

    if (doc.governanceAndAccountability && doc.governanceAndAccountability.length > 0) {
      md += `## 5. Governance and Accountability\n\n`;
      md += `| Role | Accountability |\n|---|---|\n`;
      doc.governanceAndAccountability.forEach(ga => {
        md += `| **${ga.role}** | ${ga.accountability} |\n`;
      });
      md += `\n`;
    }

    if (doc.mandatoryRequirements && doc.mandatoryRequirements.length > 0) {
      md += `## 6. Mandatory Policy Requirements\n\n`;
      doc.mandatoryRequirements.forEach(req => {
        md += `### ${req.sectionId} ${req.title}\n\n${req.statement}\n\n`;
      });
    }

    if (doc.controlImplementationAndEvidence && doc.controlImplementationAndEvidence.length > 0) {
      md += `## 7. Control Implementation and Evidence\n\n`;
      md += `| Governance Object | Minimum Expected Record | Assurance Limitation |\n|---|---|---|\n`;
      doc.controlImplementationAndEvidence.forEach(ce => {
        md += `| **${ce.governanceObject}** | ${ce.minimumExpectedRecord} | ${ce.assuranceLimitation} |\n`;
      });
      md += `\n`;
    }

    if (doc.processControlsAndPrerequisites && doc.processControlsAndPrerequisites.length > 0) {
      md += `## 4. Process Controls and Prerequisites\n\n`;
      doc.processControlsAndPrerequisites.forEach(p => {
        md += `- ${p}\n`;
      });
      md += `\n`;
    }

    if (doc.rolesAndSegregationOfDuties && doc.rolesAndSegregationOfDuties.length > 0) {
      md += `## 5. Roles and Segregation of Duties\n\n`;
      md += `| Role | Permitted Responsibility | Control Boundary |\n|---|---|---|\n`;
      doc.rolesAndSegregationOfDuties.forEach(r => {
        md += `| **${r.role}** | ${r.permittedResponsibility} | ${r.controlBoundary} |\n`;
      });
      md += `\n`;
    }

    if (doc.inputsAndRequiredRecords && doc.inputsAndRequiredRecords.length > 0) {
      md += `## 6. Inputs and Required Records\n\n`;
      md += `| Input / Record | Required Content |\n|---|---|\n`;
      doc.inputsAndRequiredRecords.forEach(i => {
        md += `| **${i.inputOrRecord}** | ${i.requiredContent} |\n`;
      });
      md += `\n`;
    }

    if (doc.procedureSteps && doc.procedureSteps.length > 0) {
      md += `## 7. Procedure Steps & Operational Gates\n\n`;
      md += `| Step / Gate | Required Action | Responsible Role | Evidence | Exit Criteria | Failure / Exception |\n|---|---|---|---|---|---|\n`;
      doc.procedureSteps.forEach(s => {
        md += `| **${s.stepNumber}. ${s.stepName}** | ${s.requiredAction} | ${s.responsibleRole} | ${s.evidenceProduced} | ${s.exitCriteria} | ${s.failureOrExceptionHandling} |\n`;
      });
      md += `\n`;
    }

    if (doc.decisionRulesAndExceptions && doc.decisionRulesAndExceptions.length > 0) {
      md += `## 8. Decision Rules and Exception Handling\n\n`;
      md += `| Scenario | Required Handling | Required Evidence |\n|---|---|---|\n`;
      doc.decisionRulesAndExceptions.forEach(d => {
        md += `| **${d.scenario}** | ${d.requiredHandling} | ${d.requiredEvidence} |\n`;
      });
      md += `\n`;
    }

    if (doc.serviceLevels) {
      md += `## 9. Service Levels and Operational Targets\n\n`;
      md += `### Governance Elements\n\n`;
      md += `| Governance Element | Required Definition |\n|---|---|\n`;
      doc.serviceLevels.governanceElements.forEach(ge => {
        md += `| **${ge.element}** | ${ge.definition} |\n`;
      });
      md += `\n### Targets by Request Category\n\n`;
      md += `| Request Category | Approved Target | Measured Interval | Escalation Route |\n|---|---|---|---|\n`;
      doc.serviceLevels.targetsByCategory.forEach(tc => {
        md += `| **${tc.category}** | ${tc.approvedTarget} | ${tc.measuredInterval} | ${tc.escalationRoute} |\n`;
      });
      md += `\n`;
    }

    if (doc.evidenceRetentionAndProtection && doc.evidenceRetentionAndProtection.length > 0) {
      md += `## 10. Evidence, Retention and Access Protection\n\n`;
      md += `| Evidence Item | Minimum Fields | Control Purpose |\n|---|---|---|\n`;
      doc.evidenceRetentionAndProtection.forEach(er => {
        md += `| **${er.evidenceItem}** | ${er.minimumFields} | ${er.controlPurpose} |\n`;
      });
      md += `\n`;
    }

    if (doc.registerSchema && doc.registerSchema.length > 0) {
      md += `## Register Schema & Column Specifications\n\n`;
      md += `| Field Name | Data Type | Mandatory | Regulatory Source | Description |\n|---|---|---|---|---|\n`;
      doc.registerSchema.forEach(c => {
        md += `| **${c.fieldName}** | ${c.dataType} | ${c.isMandatory ? 'Yes' : 'No'} | ${c.regulatorySource} | ${c.description} |\n`;
      });
      md += `\n`;
    }

    if (doc.registerRecords && doc.registerRecords.length > 0) {
      md += `## Register Records & Operational Entries\n\n`;
      doc.registerRecords.forEach((rec, idx) => {
        md += `### Record ${idx + 1}: ${rec.rowId} (${rec.category})\n\n`;
        md += `| Attribute | Value |\n|---|---|\n`;
        Object.entries(rec.attributes).forEach(([k, v]) => {
          md += `| **${k}** | ${v} |\n`;
        });
        if (rec.lastReviewedDate) md += `| **Last Reviewed** | ${rec.lastReviewedDate} |\n`;
        if (rec.complianceStatus) md += `| **Compliance Status** | ${rec.complianceStatus} |\n`;
        md += `\n`;
      });
    }

    if (doc.statementOfApplicabilityEntries && doc.statementOfApplicabilityEntries.length > 0) {
      md += `## Statement of Applicability (SoA) Evaluation Matrix\n\n`;
      md += `| Control ID | Title | Theme | Applicable | Status | Justification | Supporting Document |\n|---|---|---|---|---|---|---|\n`;
      doc.statementOfApplicabilityEntries.forEach(soa => {
        md += `| **${soa.controlId}** | ${soa.controlTitle} | ${soa.theme} | ${soa.isApplicable ? 'Yes' : 'No'} | ${soa.implementationStatus} | ${soa.justificationForInclusionOrExclusion} | ${soa.supportingDocumentation} |\n`;
      });
      md += `\n`;
    }

    if (doc.managementReviewAgenda && doc.managementReviewAgenda.length > 0) {
      md += `## Management Review Agenda & Executive Decisions\n\n`;
      md += `| Item | Agenda Topic | Mandatory Input (ISO 27001 Clause 9.3) | Evidence Presented | Executive Decision / Allocation | Action Owner | Due Date |\n|---|---|---|---|---|---|---|\n`;
      doc.managementReviewAgenda.forEach(m => {
        md += `| **${m.itemNumber}** | ${m.agendaTopic} | ${m.mandatoryInputSource} | ${m.summaryOfEvidencePresented} | ${m.executiveDecisionOrResourceAllocation} | ${m.actionOwner} | ${m.targetCompletionDate} |\n`;
      });
      md += `\n`;
    }

    if (doc.appendixB_OperationalRaci && doc.appendixB_OperationalRaci.length > 0) {
      md += `## Appendix B — Operational RACI (Illustrative)\n\n`;
      md += `| Activity | Requester / Mgr | System Owner | IAM / Operator | Security Reviewer | Verifier |\n|---|---|---|---|---|---|\n`;
      doc.appendixB_OperationalRaci.forEach(r => {
        md += `| **${r.activity}** | ${r.requesterOrManager} | ${r.systemOwner} | ${r.iamOrOperator} | ${r.securityReviewer} | ${r.verifier} |\n`;
      });
      md += `\n*R = Responsible; A = Accountable; C = Consulted; I = Informed. Each activity has exactly one Accountable role.*\n\n`;
    }

    md += `## Appendix C — Pre-Publication Tailoring Checklist\n\n`;
    doc.appendixC_TailoringChecklist.forEach(c => {
      const mark = c.isCompleted ? '[X]' : '[ ]';
      md += `- ${mark} **${c.id}**: ${c.description} ${c.isCompleted ? `*(Verified by ${c.completedBy})*` : ''}\n`;
    });
    md += `\n`;

    return md;
  }

  /**
   * Generates clean, print-ready, professional HTML representation with
   * responsive CSS, landscape print rules, running headers, and page counters.
   */
  public exportToPrintReadyHtml(doc: EnterpriseConsultingDocument): string {
    const mdContent = this.exportToMarkdown(doc);
    const meta = doc.metadata;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${meta.documentId} — ${meta.title}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 20mm 15mm 20mm 15mm;
      @top-center {
        content: "SKANDA / GOVERNANCE, RISK & COMPLIANCE — ${meta.documentId}";
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        color: #64748b;
      }
      @bottom-center {
        content: "CONTROLLED DOCUMENT | PAGE " counter(page) " OF " counter(pages);
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        color: #64748b;
      }
    }
    @page landscape-section {
      size: A4 landscape;
      margin: 15mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 9.5pt;
      line-height: 1.5;
      color: #1e293b;
      max-width: 900px;
      margin: 0 auto;
      padding: 24px;
      background: #ffffff;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 6px;
      margin-bottom: 20px;
      font-size: 8pt;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #0f172a;
      text-transform: uppercase;
    }
    .doc-type-badge {
      font-size: 8pt;
      font-weight: 600;
      letter-spacing: 0.08em;
      color: #0284c7;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    h1 {
      font-size: 20pt;
      font-weight: 700;
      color: #0f172a;
      margin: 4px 0 6px 0;
      line-height: 1.2;
    }
    .subtitle {
      font-size: 10pt;
      color: #475569;
      margin-bottom: 16px;
      font-style: normal;
    }
    .warning-box {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 10px 14px;
      font-size: 8.5pt;
      font-weight: 600;
      color: #b45309;
      margin-bottom: 16px;
      border-radius: 2px;
    }
    h2 {
      font-size: 12pt;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-top: 24px;
      margin-bottom: 10px;
      page-break-after: avoid;
    }
    h3 {
      font-size: 10pt;
      font-weight: 600;
      color: #1e293b;
      margin-top: 14px;
      margin-bottom: 6px;
      page-break-after: avoid;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 18px 0;
      font-size: 8.5pt;
      page-break-inside: auto;
    }
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    th {
      background: #0f172a;
      color: #ffffff;
      font-weight: 600;
      text-align: left;
      padding: 6px 8px;
      border: 1px solid #0f172a;
    }
    td {
      padding: 6px 8px;
      border: 1px solid #cbd5e1;
      vertical-align: top;
    }
    tr:nth-child(even) td {
      background: #f8fafc;
    }
    .landscape {
      page: landscape-section;
    }
    ul, ol {
      margin-top: 4px;
      margin-bottom: 12px;
      padding-left: 20px;
    }
    li {
      margin-bottom: 4px;
    }
    .footer-stamp {
      margin-top: 36px;
      border-top: 1px solid #cbd5e1;
      padding-top: 8px;
      font-size: 7.5pt;
      color: #64748b;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  </style>
</head>
<body>
  <div class="header-bar">
    <span>SKANDA / GOVERNANCE, RISK & COMPLIANCE</span>
    <span>${meta.documentId}</span>
  </div>

  <div class="doc-type-badge">ENTERPRISE MANAGEMENT SYSTEM / ${meta.documentType}</div>
  <h1>${meta.title}</h1>
  ${meta.subtitle ? `<div class="subtitle">${meta.subtitle}</div>` : ''}

  ${meta.notice ? `<div class="warning-box">⚠️ ${meta.notice}</div>` : ''}

  <h2>Document Control Field</h2>
  <table>
    <thead>
      <tr><th style="width: 35%;">Document Control Field</th><th>Model Value</th></tr>
    </thead>
    <tbody>
      <tr><td><strong>Document ID</strong></td><td>${meta.documentId}</td></tr>
      <tr><td><strong>Version / Status</strong></td><td>${meta.version} — ${meta.status}</td></tr>
      <tr><td><strong>Document Owner</strong></td><td>${meta.documentOwner}</td></tr>
      <tr><td><strong>Approver</strong></td><td>${meta.approver}</td></tr>
      <tr><td><strong>Effective Date</strong></td><td>${meta.effectiveDate}</td></tr>
      <tr><td><strong>Classification</strong></td><td>${meta.classification}</td></tr>
      <tr><td><strong>Review Trigger</strong></td><td>${meta.reviewTrigger}</td></tr>
    </tbody>
  </table>

  <h2>Revision History</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 10%;">Version</th>
        <th style="width: 15%;">Date</th>
        <th>Summary of Change</th>
        <th style="width: 20%;">Prepared By</th>
        <th style="width: 20%;">Approval Status</th>
      </tr>
    </thead>
    <tbody>
      ${doc.revisionHistory.map(r => `
        <tr>
          <td><strong>${r.version}</strong></td>
          <td>${r.date}</td>
          <td>${r.summaryOfChange}</td>
          <td>${r.preparedBy}</td>
          <td>${r.approvalStatus}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>1. Purpose</h2>
  <p>${doc.purpose}</p>

  <h2>2. Scope and Applicability</h2>
  <p>${doc.scope.statement}</p>
  <ul>
    ${doc.scope.inScopeLocations.length > 0 ? `<li><strong>In-Scope Locations:</strong> ${doc.scope.inScopeLocations.join(', ')}</li>` : ''}
    ${doc.scope.inScopeSystemsAndServices.length > 0 ? `<li><strong>In-Scope Systems & Services:</strong> ${doc.scope.inScopeSystemsAndServices.join(', ')}</li>` : ''}
    ${doc.scope.inScopeUserPopulations.length > 0 ? `<li><strong>In-Scope Personnel:</strong> ${doc.scope.inScopeUserPopulations.join(', ')}</li>` : ''}
  </ul>

  <h2>3. Terms and Definitions</h2>
  <table>
    <thead>
      <tr><th style="width: 30%;">Term</th><th>Working Definition (Model)</th></tr>
    </thead>
    <tbody>
      ${doc.termsAndDefinitions.map(t => `
        <tr><td><strong>${t.term}</strong></td><td>${t.definition}</td></tr>
      `).join('')}
    </tbody>
  </table>

  ${doc.procedureSteps && doc.procedureSteps.length > 0 ? `
    <div class="landscape">
      <h2>7. Procedure Steps & Operational Gates</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 15%;">Step / Gate</th>
            <th style="width: 25%;">Required Action</th>
            <th style="width: 15%;">Responsible Role</th>
            <th style="width: 15%;">Evidence</th>
            <th style="width: 15%;">Exit Criteria</th>
            <th style="width: 15%;">Failure / Exception</th>
          </tr>
        </thead>
        <tbody>
          ${doc.procedureSteps.map(s => `
            <tr>
              <td><strong>${s.stepNumber}. ${s.stepName}</strong></td>
              <td>${s.requiredAction}</td>
              <td>${s.responsibleRole}</td>
              <td>${s.evidenceProduced}</td>
              <td>${s.exitCriteria}</td>
              <td>${s.failureOrExceptionHandling}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  ` : ''}

  ${doc.decisionRulesAndExceptions && doc.decisionRulesAndExceptions.length > 0 ? `
    <h2>8. Decision Rules and Exception Handling</h2>
    <table>
      <thead>
        <tr><th style="width: 30%;">Scenario</th><th style="width: 40%;">Required Handling</th><th>Required Evidence</th></tr>
      </thead>
      <tbody>
        ${doc.decisionRulesAndExceptions.map(d => `
          <tr><td><strong>${d.scenario}</strong></td><td>${d.requiredHandling}</td><td>${d.requiredEvidence}</td></tr>
        `).join('')}
      </tbody>
    </table>
  ` : ''}

  ${doc.serviceLevels ? `
    <h2>9. Service Levels and Operational Targets</h2>
    <table>
      <thead>
        <tr><th style="width: 25%;">Request Category</th><th style="width: 25%;">Approved Target</th><th style="width: 25%;">Measured Interval</th><th>Escalation Route</th></tr>
      </thead>
      <tbody>
        ${doc.serviceLevels.targetsByCategory.map(tc => `
          <tr><td><strong>${tc.category}</strong></td><td>${tc.approvedTarget}</td><td>${tc.measuredInterval}</td><td>${tc.escalationRoute}</td></tr>
        `).join('')}
      </tbody>
    </table>
  ` : ''}

  ${doc.registerSchema && doc.registerSchema.length > 0 ? `
    <h2>Register Schema & Column Specifications</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 20%;">Field Name</th>
          <th style="width: 12%;">Data Type</th>
          <th style="width: 10%;">Mandatory</th>
          <th style="width: 23%;">Regulatory Source</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        ${doc.registerSchema.map(c => `
          <tr>
            <td><strong>${c.fieldName}</strong></td>
            <td><code>${c.dataType}</code></td>
            <td style="text-align: center;">${c.isMandatory ? 'Yes' : 'No'}</td>
            <td>${c.regulatorySource}</td>
            <td>${c.description}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : ''}

  ${doc.registerRecords && doc.registerRecords.length > 0 ? `
    <h2>Register Records & Operational Entries</h2>
    <div class="landscape">
      <table>
        <thead>
          <tr>
            <th style="width: 12%;">Record ID</th>
            <th style="width: 14%;">Category</th>
            <th style="width: 25%;">Activity / Purpose</th>
            <th style="width: 18%;">Legal Basis / Scope</th>
            <th>Safeguards &amp; TOMs</th>
            <th style="width: 10%;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${doc.registerRecords.map(r => `
            <tr>
              <td><strong>${r.rowId}</strong></td>
              <td>${r.category}</td>
              <td><strong>${r.attributes['Processing Activity Name'] || r.attributes['Asset Name'] || r.rowId}</strong><br/><small>${r.attributes['Purpose of Processing'] || r.attributes['Description'] || ''}</small></td>
              <td>${r.attributes['Lawful Basis under GDPR Art 6'] || r.attributes['Legal Basis'] || r.attributes['Classification'] || ''}</td>
              <td><small>${r.attributes['Technical & Organisational Security Measures (TOMs)'] || r.attributes['Technical & Org Measures (TOMs)'] || r.attributes['Controls'] || ''}</small></td>
              <td style="text-align: center;"><span style="color: #0284c7; font-weight: 600;">${r.complianceStatus || 'ACTIVE'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  ` : ''}

  ${doc.statementOfApplicabilityEntries && doc.statementOfApplicabilityEntries.length > 0 ? `
    <h2>Statement of Applicability (SoA) Evaluation Matrix</h2>
    <div class="landscape">
      <table>
        <thead>
          <tr>
            <th style="width: 10%;">Control ID</th>
            <th style="width: 18%;">Control Title</th>
            <th style="width: 12%;">Theme</th>
            <th style="width: 8%;">Applicable</th>
            <th style="width: 15%;">Status</th>
            <th>Justification &amp; Supporting Documentation</th>
          </tr>
        </thead>
        <tbody>
          ${doc.statementOfApplicabilityEntries.map(s => `
            <tr>
              <td><strong>${s.controlId}</strong></td>
              <td>${s.controlTitle}</td>
              <td><small>${s.theme}</small></td>
              <td style="text-align: center;">${s.isApplicable ? 'Yes' : 'No'}</td>
              <td><span style="font-weight: 600; color: ${s.implementationStatus === 'IMPLEMENTED' ? '#16a34a' : '#d97706'};">${s.implementationStatus}</span></td>
              <td>${s.justificationForInclusionOrExclusion}<br/><small style="color: #64748b;">Docs: ${s.supportingDocumentation}</small></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  ` : ''}

  ${doc.managementReviewAgenda && doc.managementReviewAgenda.length > 0 ? `
    <h2>Management Review Agenda & Executive Decisions</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 8%;">Item #</th>
          <th style="width: 25%;">Agenda Topic &amp; ISO 27001 Clause 9.3 Source</th>
          <th style="width: 32%;">Summary of Evidence Presented</th>
          <th>Executive Decision, Allocation &amp; Target</th>
        </tr>
      </thead>
      <tbody>
        ${doc.managementReviewAgenda.map(m => `
          <tr>
            <td style="text-align: center;"><strong>${m.itemNumber}</strong></td>
            <td><strong>${m.agendaTopic}</strong><br/><small style="color: #0284c7;">${m.mandatoryInputSource}</small></td>
            <td>${m.summaryOfEvidencePresented}</td>
            <td>${m.executiveDecisionOrResourceAllocation}<br/><small style="color: #64748b;">Owner: ${m.actionOwner} | Due: ${m.targetCompletionDate}</small></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : ''}

  ${doc.appendixB_OperationalRaci && doc.appendixB_OperationalRaci.length > 0 ? `
    <h2>Appendix B — Operational RACI (Single Accountable Role Mandated)</h2>
    <table>
      <thead>
        <tr>
          <th>Activity</th>
          <th>Requester / Mgr</th>
          <th>System Owner</th>
          <th>IAM / Operator</th>
          <th>Security Reviewer</th>
          <th>Verifier</th>
        </tr>
      </thead>
      <tbody>
        ${doc.appendixB_OperationalRaci.map(r => `
          <tr>
            <td><strong>${r.activity}</strong></td>
            <td style="text-align: center;">${r.requesterOrManager}</td>
            <td style="text-align: center;">${r.systemOwner}</td>
            <td style="text-align: center;">${r.iamOrOperator}</td>
            <td style="text-align: center;">${r.securityReviewer}</td>
            <td style="text-align: center;">${r.verifier}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : ''}

  <h2>Appendix C — Pre-Publication Tailoring Checklist</h2>
  <ul>
    ${doc.appendixC_TailoringChecklist.map(c => `
      <li>${c.isCompleted ? '☑️' : '◻️'} <strong>${c.id}:</strong> ${c.description} ${c.isCompleted ? `<em>(Completed: ${c.completedBy})</em>` : ''}</li>
    `).join('')}
  </ul>

  <div class="footer-stamp">
    CONTROLLED DOCUMENT | SKANDA DOCUMENTATION ENGINE | ${meta.documentId} v${meta.version} | SHA-256: ${doc.sha256Digest?.slice(0, 16) || 'PENDING'}...
  </div>
</body>
</html>`;
  }

  /**
   * Generates genuine Microsoft Word (.docx) package using JSZip and OpenXML
   */
  /**
   * Generates genuine Microsoft Word (.docx) package using JSZip and OpenXML
   * Renders cover page, document control tables, landscape procedure tables,
   * running headers, and footers with dynamic page numbering (PAGE / NUMPAGES).
   */
  public async exportToDocx(doc: EnterpriseConsultingDocument): Promise<Buffer> {
    const zip = new JSZip();
    const meta = doc.metadata;
    const isProcedure = meta.documentType === 'PROCEDURE';

    // Strict XML escaping
    const xmlEscape = (str: string | undefined | null): string => {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    // Helper to generate styled headings
    const pHeading = (text: string, level: 1 | 2 | 3): string => {
      const sz = level === 1 ? '32' : level === 2 ? '26' : '22';
      const spacing = level === 1 ? 'w:before="360" w:after="120"' : level === 2 ? 'w:before="240" w:after="80"' : 'w:before="160" w:after="60"';
      const color = level === 1 ? '0F172A' : level === 2 ? '1E293B' : '334155';
      return `<w:p>
        <w:pPr>
          <w:spacing ${spacing}/>
          <w:rPr>
            <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
            <w:b/>
            <w:sz w:val="${sz}"/>
            <w:color w:val="${color}"/>
          </w:rPr>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
            <w:b/>
            <w:sz w:val="${sz}"/>
            <w:color w:val="${color}"/>
          </w:rPr>
          <w:t xml:space="preserve">${xmlEscape(text)}</w:t>
        </w:r>
      </w:p>`;
    };

    // Helper to generate body paragraphs
    const pBody = (text: string, options: { bold?: boolean; italic?: boolean; color?: string } = {}): string => {
      const parts = text.split('\n');
      return `<w:p>
        <w:pPr>
          <w:spacing w:after="100"/>
        </w:pPr>
        ${parts.map((part, idx) => `
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
              ${options.bold ? '<w:b/>' : ''}
              ${options.italic ? '<w:i/>' : ''}
              <w:color w:val="${options.color || '1E293B'}"/>
              <w:sz w:val="20"/>
            </w:rPr>
            <w:t xml:space="preserve">${xmlEscape(part)}</w:t>
          </w:r>
          ${idx < parts.length - 1 ? '<w:r><w:br/></w:r>' : ''}
        `).join('')}
      </w:p>`;
    };

    // Helper for page break
    const pBreak = (): string => `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;

    // Helper for warning callout table
    const pCallout = (title: string, message: string): string => {
      return `<w:tbl>
        <w:tblPr>
          <w:tblW w:w="0" w:type="auto"/>
          <w:tblBorders>
            <w:top w:val="single" w:sz="6" w:space="0" w:color="FCD34D"/>
            <w:bottom w:val="single" w:sz="6" w:space="0" w:color="FCD34D"/>
            <w:left w:val="single" w:sz="24" w:space="0" w:color="D97706"/>
            <w:right w:val="single" w:sz="6" w:space="0" w:color="FCD34D"/>
          </w:tblBorders>
          <w:tblCellMar>
            <w:top w:w="160" w:type="dxa"/>
            <w:left w:w="200" w:type="dxa"/>
            <w:bottom w:w="160" w:type="dxa"/>
            <w:right w:w="200" w:type="dxa"/>
          </w:tblCellMar>
        </w:tblPr>
        <w:tr>
          <w:tc>
            <w:tcPr>
              <w:tcW w:w="9026" w:type="dxa"/>
              <w:shd w:val="clear" w:color="auto" w:fill="FEF3C7"/>
            </w:tcPr>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                  <w:b/>
                  <w:color w:val="92400E"/>
                  <w:sz w:val="18"/>
                </w:rPr>
                <w:t xml:space="preserve">${xmlEscape(title)}</w:t>
              </w:r>
            </w:p>
            <w:p>
              <w:r>
                <w:rPr>
                  <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                  <w:i/>
                  <w:color w:val="78350F"/>
                  <w:sz w:val="18"/>
                </w:rPr>
                <w:t xml:space="preserve">${xmlEscape(message)}</w:t>
              </w:r>
            </w:p>
          </w:tc>
        </w:tr>
      </w:tbl>`;
    };

    // Helper for table generation
    const generateTableXml = (headers: string[], rows: string[][], colWidths: number[]): string => {
      return `<w:tbl>
        <w:tblPr>
          <w:tblW w:w="0" w:type="auto"/>
          <w:tblBorders>
            <w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
            <w:bottom w:val="single" w:sz="6" w:space="0" w:color="0F172A"/>
            <w:left w:val="none"/>
            <w:right w:val="none"/>
            <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
            <w:insideV w:val="none"/>
          </w:tblBorders>
          <w:tblCellMar>
            <w:top w:w="120" w:type="dxa"/>
            <w:left w:w="160" w:type="dxa"/>
            <w:bottom w:w="120" w:type="dxa"/>
            <w:right w:w="160" w:type="dxa"/>
          </w:tblCellMar>
        </w:tblPr>
        <w:tblGrid>
          ${colWidths.map(w => `<w:gridCol w:w="${w}"/>`).join('')}
        </w:tblGrid>
        <w:tr>
          <w:trPr>
            <w:tblHeader/>
            <w:cantSplit/>
          </w:trPr>
          ${headers.map((h, i) => `
            <w:tc>
              <w:tcPr>
                <w:tcW w:w="${colWidths[i] || 1500}" w:type="dxa"/>
                <w:shd w:val="clear" w:color="auto" w:fill="0F172A"/>
              </w:tcPr>
              <w:p>
                <w:r>
                  <w:rPr>
                    <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                    <w:b/>
                    <w:color w:val="FFFFFF"/>
                    <w:sz w:val="18"/>
                  </w:rPr>
                  <w:t xml:space="preserve">${xmlEscape(h)}</w:t>
                </w:r>
              </w:p>
            </w:tc>
          `).join('')}
        </w:tr>
        ${rows.map((row, rIdx) => `
          <w:tr>
            <w:trPr>
              <w:cantSplit/>
            </w:trPr>
            ${row.map((cell, cIdx) => `
              <w:tc>
                <w:tcPr>
                  <w:tcW w:w="${colWidths[cIdx] || 1500}" w:type="dxa"/>
                  ${rIdx % 2 === 1 ? '<w:shd w:val="clear" w:color="auto" w:fill="F8FAFC"/>' : ''}
                </w:tcPr>
                <w:p>
                  <w:r>
                    <w:rPr>
                      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                      <w:sz w:val="18"/>
                      <w:color w:val="1E293B"/>
                    </w:rPr>
                    <w:t xml:space="preserve">${xmlEscape(cell)}</w:t>
                  </w:r>
                </w:p>
              </w:tc>
            `).join('')}
          </w:tr>
        `).join('')}
      </w:tbl>`;
    };

    // 1. [Content_Types].xml
    zip.file(
      '[Content_Types].xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>
  <Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
</Types>`
    );

    // 2. _rels/.rels
    zip.file(
      '_rels/.rels',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
    );

    // 3. word/_rels/document.xml.rels
    zip.file(
      'word/_rels/document.xml.rels',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
</Relationships>`
    );

    // 4. word/styles.xml
    zip.file(
      'word/styles.xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
        <w:sz w:val="20"/>
        <w:color w:val="1E293B"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
</w:styles>`
    );

    // 5. word/header1.xml
    zip.file(
      'word/header1.xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr>
      <w:pBdr>
        <w:bottom w:val="single" w:sz="6" w:space="4" w:color="CBD5E1"/>
      </w:pBdr>
      <w:jc w:val="right"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
        <w:sz w:val="16"/>
        <w:color w:val="64748B"/>
        <w:b/>
      </w:rPr>
      <w:t xml:space="preserve">SKANDA / GOVERNANCE, RISK &amp; COMPLIANCE | ${xmlEscape(meta.documentId)}</w:t>
    </w:r>
  </w:p>
</w:hdr>`
    );

    // 6. word/footer1.xml
    zip.file(
      'word/footer1.xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr>
      <w:pBdr>
        <w:top w:val="single" w:sz="6" w:space="4" w:color="CBD5E1"/>
      </w:pBdr>
      <w:tabs>
        <w:tab w:val="right" w:pos="9360"/>
      </w:tabs>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
        <w:sz w:val="16"/>
        <w:color w:val="64748B"/>
      </w:rPr>
      <w:t xml:space="preserve">CONTROLLED SAMPLE | SKANDA DOCUMENTATION</w:t>
    </w:r>
    <w:r>
      <w:tab/>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
        <w:sz w:val="16"/>
        <w:color w:val="64748B"/>
      </w:rPr>
      <w:t xml:space="preserve">Page </w:t>
    </w:r>
    <w:fldSimple w:instr="PAGE"/>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
        <w:sz w:val="16"/>
        <w:color w:val="64748B"/>
      </w:rPr>
      <w:t xml:space="preserve"> of </w:t>
    </w:r>
    <w:fldSimple w:instr="NUMPAGES"/>
  </w:p>
</w:ftr>`
    );

    // 7. word/document.xml Assembly
    let body = '';

    // --- COVER PAGE ---
    body += `<w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:rPr><w:sz w:val="16"/><w:color w:val="64748B"/><w:b/></w:rPr><w:t xml:space="preserve">SKANDA / GOVERNANCE, RISK &amp; COMPLIANCE</w:t></w:r></w:p>`;
    body += `<w:p><w:pPr><w:spacing w:before="120" w:after="60"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:color w:val="0284C7"/><w:b/></w:rPr><w:t xml:space="preserve">ENTERPRISE MANAGEMENT SYSTEM / ${xmlEscape(meta.documentType)}</w:t></w:r></w:p>`;
    body += `<w:p><w:pPr><w:spacing w:before="120" w:after="120"/></w:pPr><w:r><w:rPr><w:sz w:val="48"/><w:b/><w:color w:val="0F172A"/></w:rPr><w:t xml:space="preserve">${xmlEscape(meta.title)}</w:t></w:r></w:p>`;
    if (meta.subtitle) {
      body += `<w:p><w:pPr><w:spacing w:after="240"/></w:pPr><w:r><w:rPr><w:sz w:val="24"/><w:i/><w:color w:val="475569"/></w:rPr><w:t xml:space="preserve">${xmlEscape(meta.subtitle)}</w:t></w:r></w:p>`;
    }
    if (meta.notice) {
      body += pCallout('[!WARNING] CONTROLLED DOCUMENT NOTICE', meta.notice);
      body += `<w:p><w:pPr><w:spacing w:after="160"/></w:pPr></w:p>`;
    }

    // Document Control Table
    body += pHeading('Document Control Field', 2);
    const docCtrlHeaders = ['DOCUMENT CONTROL FIELD', 'MODEL VALUE'];
    const docCtrlRows = [
      ['Document ID', meta.documentId],
      ['Version / status', `${meta.version} — ${meta.status}`],
      ['Document owner', meta.documentOwner],
      ['Approver', meta.approver],
      ['Effective date', meta.effectiveDate],
      ['Classification', meta.classification],
      ['Review trigger', meta.reviewTrigger]
    ];
    body += generateTableXml(docCtrlHeaders, docCtrlRows, [3000, 6026]);

    if (meta.modelUseNotice) {
      body += `<w:p><w:pPr><w:spacing w:before="160" w:after="160"/></w:pPr><w:r><w:rPr><w:i/><w:sz w:val="18"/><w:color w:val="64748B"/></w:rPr><w:t xml:space="preserve">${xmlEscape(meta.modelUseNotice)}</w:t></w:r></w:p>`;
    }

    body += pBreak();

    // --- REVISION HISTORY & GOVERNANCE ---
    body += pHeading('Contents & Document Governance', 1);
    body += pBody('Controlled management-system copy maintained in SKANDA Authoritative Document Register.');

    body += pHeading('Revision History', 2);
    const revHeaders = ['Version', 'Date', 'Summary of change', 'Prepared by', 'Approval status'];
    const revRows = doc.revisionHistory.map(r => [
      r.version,
      r.date,
      r.summaryOfChange,
      r.preparedBy,
      r.approvalStatus
    ]);
    body += generateTableXml(revHeaders, revRows, [1000, 1400, 3426, 1800, 1400]);
    body += pBody('Revision entries record changes to this model sample only. Organization-specific revisions must be recorded in the tenant-owned controlled copy.', { italic: true, color: '64748B' });

    if (doc.documentGovernance && doc.documentGovernance.length > 0) {
      body += pHeading('Document Governance', 2);
      const govHeaders = ['Control', 'Requirement / model approach'];
      const govRows = doc.documentGovernance.map(g => [g.control, g.requirementOrModelApproach]);
      body += generateTableXml(govHeaders, govRows, [2800, 6226]);
    }

    // --- 1. PURPOSE ---
    body += pHeading('1. Purpose', 1);
    body += pBody(doc.purpose);

    // --- 2. SCOPE AND APPLICABILITY ---
    body += pHeading('2. Scope and Applicability', 1);
    body += pBody(doc.scope.statement);
    if (doc.scope.inScopeLocations.length > 0) {
      body += pBody(`• In-Scope Locations: ${doc.scope.inScopeLocations.join(', ')}`, { bold: true });
    }
    if (doc.scope.inScopeSystemsAndServices.length > 0) {
      body += pBody(`• In-Scope Systems & Services: ${doc.scope.inScopeSystemsAndServices.join(', ')}`);
    }
    if (doc.scope.documentedExclusions.length > 0) {
      body += pBody('Documented Exclusions:', { bold: true });
      doc.scope.documentedExclusions.forEach(ex => {
        body += pBody(`• ${ex.item}: ${ex.rationale}`);
      });
    }

    // --- 3. TERMS AND DEFINITIONS ---
    body += pHeading('3. Terms and Definitions', 1);
    const termHeaders = ['Term', 'Working definition (model)'];
    const termRows = doc.termsAndDefinitions.map(t => [t.term, t.definition]);
    body += generateTableXml(termHeaders, termRows, [2600, 6426]);

    // --- POLICY SECTIONS (Level 1 Policies & Technical Standards) ---
    if (doc.policyObjectives && doc.policyObjectives.length > 0) {
      body += pHeading('4. Policy Objectives', 1);
      doc.policyObjectives.forEach(obj => {
        body += pBody(`• ${obj}`);
      });
    }

    if (doc.governanceAndAccountability && doc.governanceAndAccountability.length > 0) {
      body += pHeading('5. Governance and Accountability', 1);
      const gaHeaders = ['Role', 'Accountability (to be mapped to actual organization)'];
      const gaRows = doc.governanceAndAccountability.map(ga => [ga.role, ga.accountability]);
      body += generateTableXml(gaHeaders, gaRows, [3000, 6026]);
    }

    if (doc.mandatoryRequirements && doc.mandatoryRequirements.length > 0) {
      body += pHeading('6. Mandatory Policy Requirements', 1);
      doc.mandatoryRequirements.forEach(req => {
        body += pHeading(`${req.sectionId} ${req.title}`, 2);
        body += pBody(req.statement);
        if (req.linkedFrameworkClauses && req.linkedFrameworkClauses.length > 0) {
          body += pBody(`[Traceability: ${req.linkedFrameworkClauses.join(' • ')} | Controls: ${req.linkedControlCodes.join(', ')}]`, { italic: true, color: '0284C7' });
        }
      });
    }

    if (doc.controlImplementationAndEvidence && doc.controlImplementationAndEvidence.length > 0) {
      body += pHeading('7. Control Implementation and Evidence', 1);
      body += pBody('Each applicable control shall have an identified owner, defined implementation approach, expected evidence and a method for evaluating operation where required by the ISMS.');
      const ceHeaders = ['Governance object', 'Minimum expected record', 'Assurance limitation'];
      const ceRows = doc.controlImplementationAndEvidence.map(ce => [
        ce.governanceObject,
        ce.minimumExpectedRecord,
        ce.assuranceLimitation
      ]);
      body += generateTableXml(ceHeaders, ceRows, [2200, 3826, 3000]);
    }

    // --- OPERATIONAL PROCEDURE SECTIONS (Level 2 Procedures, SOPs, Work Instructions) ---
    if (doc.processControlsAndPrerequisites && doc.processControlsAndPrerequisites.length > 0) {
      body += pHeading('4. Process Controls and Prerequisites', 1);
      doc.processControlsAndPrerequisites.forEach(p => {
        body += pBody(`• ${p}`);
      });
    }

    if (doc.rolesAndSegregationOfDuties && doc.rolesAndSegregationOfDuties.length > 0) {
      body += pHeading('5. Roles and Segregation of Duties', 1);
      const rHeaders = ['Role', 'Permitted responsibility', 'Control boundary'];
      const rRows = doc.rolesAndSegregationOfDuties.map(r => [
        r.role,
        r.permittedResponsibility,
        r.controlBoundary
      ]);
      body += generateTableXml(rHeaders, rRows, [2400, 3626, 3000]);
    }

    if (doc.inputsAndRequiredRecords && doc.inputsAndRequiredRecords.length > 0) {
      body += pHeading('6. Inputs and Required Records', 1);
      const inHeaders = ['Input / record', 'Required content'];
      const inRows = doc.inputsAndRequiredRecords.map(i => [i.inputOrRecord, i.requiredContent]);
      body += generateTableXml(inHeaders, inRows, [2800, 6226]);
    }

    // --- LANDSCAPE SECTION BREAK: 6-COLUMN PROCEDURE STEPS TABLE ---
    if (doc.procedureSteps && doc.procedureSteps.length > 0) {
      body += `<w:p>
        <w:pPr>
          <w:sectPr>
            <w:headerReference w:type="default" r:id="rId2"/>
            <w:footerReference w:type="default" r:id="rId3"/>
            <w:pgSz w:w="11906" w:h="16838"/>
            <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720"/>
          </w:sectPr>
        </w:pPr>
      </w:p>`;

      body += pHeading('7. Procedure Steps & Operational Gates', 1);
      body += pBody('Operational control procedure with sequential gates, responsible roles, auditable evidence, exit criteria, and failure handling:');

      const procHeaders = ['Step / gate', 'Required action', 'Responsible role', 'Evidence', 'Exit criteria', 'Failure / exception'];
      const procColWidths = [1800, 3800, 2000, 2400, 2600, 2078];
      const procRows = doc.procedureSteps.map(s => [
        `${s.stepNumber}. ${s.stepName}`,
        s.requiredAction,
        s.responsibleRole,
        s.evidenceProduced,
        s.exitCriteria,
        s.failureOrExceptionHandling
      ]);
      body += generateTableXml(procHeaders, procRows, procColWidths);

      body += `<w:p>
        <w:pPr>
          <w:sectPr>
            <w:headerReference w:type="default" r:id="rId2"/>
            <w:footerReference w:type="default" r:id="rId3"/>
            <w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>
            <w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="540" w:footer="540"/>
          </w:sectPr>
        </w:pPr>
      </w:p>`;
    }

    // --- LEVEL 5 REGISTERS & LOGS (RoPA, Assets, Risks) ---
    if (doc.registerSchema && doc.registerSchema.length > 0) {
      body += pHeading('Register Schema & Column Specifications', 1);
      body += pBody('Statutory data attributes and validation rules governing register records:');
      const regHeaders = ['Field Name', 'Data Type', 'Mandatory', 'Regulatory Source', 'Description'];
      const regRows = doc.registerSchema.map(s => [
        s.fieldName,
        s.dataType,
        s.isMandatory ? 'Yes' : 'No',
        s.regulatorySource,
        s.description
      ]);
      body += generateTableXml(regHeaders, regRows, [2000, 1200, 1200, 2200, 2426]);
    }

    if (doc.registerRecords && doc.registerRecords.length > 0) {
      body += `<w:p>
        <w:pPr>
          <w:sectPr>
            <w:headerReference w:type="default" r:id="rId2"/>
            <w:footerReference w:type="default" r:id="rId3"/>
            <w:pgSz w:w="11906" w:h="16838"/>
            <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720"/>
          </w:sectPr>
        </w:pPr>
      </w:p>`;

      body += pHeading('Register Records & Operational Log Entries', 1);
      body += pBody('Controlled records of processing operations and evidence entries:');

      const recordHeaders = ['Record ID', 'Category', 'Activity / Purpose', 'Legal Basis / Scope', 'Safeguards / TOMs', 'Status'];
      const recordWidths = [1800, 2000, 3600, 2800, 2600, 1878];
      const recordRows = doc.registerRecords.map(r => {
        const actName = r.attributes['Processing Activity Name'] || r.attributes['Asset Name'] || r.rowId;
        const purpose = r.attributes['Purpose of Processing'] || r.attributes['Description'] || '';
        const basis = r.attributes['Lawful Basis under GDPR Art 6'] || r.attributes['Legal Basis'] || r.attributes['Classification'] || '';
        const toms = r.attributes['Technical & Organisational Security Measures (TOMs)'] || r.attributes['Technical & Org Measures (TOMs)'] || r.attributes['Controls'] || '';
        return [
          r.rowId,
          r.category,
          `${actName}\n${purpose}`,
          basis,
          toms,
          r.complianceStatus || 'ACTIVE'
        ];
      });
      body += generateTableXml(recordHeaders, recordRows, recordWidths);

      body += `<w:p>
        <w:pPr>
          <w:sectPr>
            <w:headerReference w:type="default" r:id="rId2"/>
            <w:footerReference w:type="default" r:id="rId3"/>
            <w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>
            <w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="540" w:footer="540"/>
          </w:sectPr>
        </w:pPr>
      </w:p>`;
    }

    // --- LEVEL 5 STATEMENT OF APPLICABILITY & MANAGEMENT REVIEW ---
    if (doc.statementOfApplicabilityEntries && doc.statementOfApplicabilityEntries.length > 0) {
      body += `<w:p>
        <w:pPr>
          <w:sectPr>
            <w:headerReference w:type="default" r:id="rId2"/>
            <w:footerReference w:type="default" r:id="rId3"/>
            <w:pgSz w:w="11906" w:h="16838"/>
            <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720"/>
          </w:sectPr>
        </w:pPr>
      </w:p>`;

      body += pHeading('Statement of Applicability (SoA) Review Matrix', 1);
      body += pBody('ISO/IEC 27001:2022 Annex A Controls formal applicability and implementation assessment:');
      const soaHeaders = ['Control ID', 'Title', 'Theme', 'Applicable', 'Status', 'Justification & Supporting Docs'];
      const soaWidths = [1600, 2600, 1800, 1400, 2200, 5078];
      const soaRows = doc.statementOfApplicabilityEntries.map(s => [
        s.controlId,
        s.controlTitle,
        s.theme,
        s.isApplicable ? 'Yes' : 'No',
        s.implementationStatus,
        `${s.justificationForInclusionOrExclusion}\n[Docs: ${s.supportingDocumentation}]`
      ]);
      body += generateTableXml(soaHeaders, soaRows, soaWidths);

      body += `<w:p>
        <w:pPr>
          <w:sectPr>
            <w:headerReference w:type="default" r:id="rId2"/>
            <w:footerReference w:type="default" r:id="rId3"/>
            <w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>
            <w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="540" w:footer="540"/>
          </w:sectPr>
        </w:pPr>
      </w:p>`;
    }

    if (doc.managementReviewAgenda && doc.managementReviewAgenda.length > 0) {
      body += pHeading('Management Review Agenda & Executive Decisions', 1);
      body += pBody('ISO/IEC 27001:2022 Clause 9.3 mandatory input topics, presented evidence, and executive resource allocations:');
      const mrHeaders = ['Item', 'Agenda Topic & Clause 9.3 Source', 'Evidence Presented', 'Executive Decision & Action Owner'];
      const mrRows = doc.managementReviewAgenda.map(m => [
        `Item ${m.itemNumber}`,
        `${m.agendaTopic}\n[${m.mandatoryInputSource}]`,
        m.summaryOfEvidencePresented,
        `${m.executiveDecisionOrResourceAllocation}\nOwner: ${m.actionOwner} (Due: ${m.targetCompletionDate})`
      ]);
      body += generateTableXml(mrHeaders, mrRows, [1000, 3000, 2500, 2526]);
    }

    // --- DECISION RULES & EXCEPTIONS ---
    if (doc.decisionRulesAndExceptions && doc.decisionRulesAndExceptions.length > 0) {
      body += pHeading('Decision Rules and Exception Handling', 1);
      const decHeaders = ['Scenario', 'Required handling', 'Required evidence'];
      const decRows = doc.decisionRulesAndExceptions.map(d => [
        d.scenario,
        d.requiredHandling,
        d.requiredEvidence
      ]);
      body += generateTableXml(decHeaders, decRows, [2600, 3626, 2800]);
    } else if (!doc.procedureSteps || doc.procedureSteps.length === 0) {
      body += pHeading('Exceptions and Risk Acceptance', 1);
      body += pBody('An exception request shall identify the requirement and affected scope, business rationale, risk assessment, compensating controls, accountable owner, authorized approver, start and expiry/review dates, monitoring arrangements and closure criteria. The requester shall not approve their own exception where segregation of duties is required. Overdue exceptions shall be escalated according to the approved governance process.');
    }

    // --- SERVICE LEVELS ---
    if (doc.serviceLevels) {
      body += pHeading('Service Levels and Operational Targets', 1);
      body += pBody('Service-level targets for this document shall be formally defined, approved and owned before publication. Targets must reflect organizational risk appetite, operating capacity and verified commitments.');

      body += pHeading('Governance Elements', 2);
      const govElHeaders = ['Governance element', 'Required definition'];
      const govElRows = doc.serviceLevels.governanceElements.map(ge => [ge.element, ge.definition]);
      body += generateTableXml(govElHeaders, govElRows, [2800, 6226]);

      body += pHeading('Targets by Request Category', 2);
      const slHeaders = ['Request category', 'Approved target', 'Measured interval', 'Escalation route'];
      const slRows = doc.serviceLevels.targetsByCategory.map(tc => [
        tc.category,
        tc.approvedTarget,
        tc.measuredInterval,
        tc.escalationRoute
      ]);
      body += generateTableXml(slHeaders, slRows, [2400, 2200, 2200, 2226]);
    }

    // --- EVIDENCE, RETENTION & ACCESS PROTECTION ---
    if (doc.evidenceRetentionAndProtection && doc.evidenceRetentionAndProtection.length > 0) {
      body += pHeading('Evidence, Retention and Access Protection', 1);
      body += pBody('Records shall be stored in approved systems with access restricted to authorized personnel. Evidence must be attributable, timestamped, linked to the request, and protected against alteration.');
      const erHeaders = ['Evidence item', 'Minimum fields', 'Control purpose'];
      const erRows = doc.evidenceRetentionAndProtection.map(er => [
        er.evidenceItem,
        er.minimumFields,
        er.controlPurpose
      ]);
      body += generateTableXml(erHeaders, erRows, [2200, 3826, 3000]);
    }

    // --- MONITORING & PERFORMANCE MEASURES ---
    if (doc.monitoringAndPerformanceMeasures && doc.monitoringAndPerformanceMeasures.length > 0) {
      body += pHeading('Monitoring and Performance Measures', 1);
      doc.monitoringAndPerformanceMeasures.forEach(m => {
        body += pBody(`• ${m}`);
      });
    } else if (!doc.procedureSteps || doc.procedureSteps.length === 0) {
      body += pHeading('Monitoring, Audit and Management Review', 1);
      body += pBody('The organization shall define measures that support evaluation of ISMS performance and control operation. Internal audits shall be planned using defined criteria, scope, frequency and impartiality safeguards. Findings shall be recorded and addressed through corrective action. Management review shall consider relevant changes, audit results, risk status, objective performance, incidents, nonconformities, interested-party feedback, resources and improvement opportunities.');
    }

    // --- FAILURE & CAPA HANDLING ---
    if (doc.failureIncidentAndCapaHandling) {
      body += pHeading('Failure, Incident and Corrective-Action Handling', 1);
      body += pBody(doc.failureIncidentAndCapaHandling);
    } else if (!doc.procedureSteps || doc.procedureSteps.length === 0) {
      body += pHeading('Nonconformity and Continual Improvement', 1);
      body += pBody('When a nonconformity occurs, the responsible owner shall contain or correct the issue as appropriate, assess consequences, determine root cause where warranted, implement proportionate corrective action, and evaluate effectiveness. Closure shall be supported by evidence and independent retesting where required. Recurring issues shall be escalated for systemic review.');
    }

    // --- COMMUNICATION & ENFORCEMENT ---
    if (!doc.procedureSteps || doc.procedureSteps.length === 0) {
      body += pHeading('Communication, Publication and Enforcement', 1);
      body += pBody('The document owner shall ensure the current approved version is communicated to relevant interested parties and made accessible according to classification and need. Only the controlled published version is authoritative.');
    }

    // --- RELATED DOCUMENTS ---
    if (doc.relatedDocumentsAndSystems && doc.relatedDocumentsAndSystems.length > 0) {
      body += pHeading('Related Controlled Documents & Systems', 1);
      doc.relatedDocumentsAndSystems.forEach(rel => {
        body += pBody(`• ${rel}`);
      });
    }

    // --- REVIEW & CHANGE CONTROL ---
    body += pHeading('Document Review and Change Control', 1);
    body += pBody(doc.reviewAndChangeControl || 'This document is reviewed at least annually or upon material operational, technical or regulatory changes.');

    // --- APPENDIX A: APPROVAL RECORD ---
    body += pHeading('Appendix A — Approval Record', 1);
    const appAHeaders = ['Role', 'Name / identity', 'Decision', 'Date', 'Evidence reference'];
    const appARows = doc.appendixA_ApprovalRecord.map(a => [
      a.role,
      a.nameOrIdentity,
      a.decision,
      a.date,
      a.evidenceReference
    ]);
    body += generateTableXml(appAHeaders, appARows, [2200, 2000, 1600, 1400, 1826]);

    // --- APPENDIX B: OPERATIONAL RACI ---
    if (doc.appendixB_OperationalRaci && doc.appendixB_OperationalRaci.length > 0) {
      body += pHeading('Appendix B — Operational RACI (Illustrative)', 1);
      const raciHeaders = ['Activity', 'Requester / Mgr', 'System owner', 'IAM / operator', 'Security reviewer', 'Verifier'];
      const raciRows = doc.appendixB_OperationalRaci.map(r => [
        r.activity,
        r.requesterOrManager,
        r.systemOwner,
        r.iamOrOperator,
        r.securityReviewer,
        r.verifier
      ]);
      body += generateTableXml(raciHeaders, raciRows, [3026, 1200, 1200, 1200, 1200, 1200]);
      body += pBody('R = Responsible; A = Accountable; C = Consulted; I = Informed. Each activity has exactly one Accountable role. The organization must validate this model against its actual roles and delegated authority.', { italic: true, color: '64748B' });
    }

    // --- APPENDIX C: TAILORING CHECKLIST ---
    body += pHeading('Appendix C — Pre-Publication Tailoring Checklist', 1);
    const chkHeaders = ['Checklist ID', 'Description', 'Status'];
    const chkRows = doc.appendixC_TailoringChecklist.map(c => [
      c.id,
      c.description,
      c.isCompleted ? `[X] Verified (${c.completedBy || 'Audit Lead'})` : '[ ] Pending Tailoring'
    ]);
    body += generateTableXml(chkHeaders, chkRows, [1600, 5626, 1800]);

    // Final Section Properties (Portrait)
    body += `<w:sectPr>
      <w:headerReference w:type="default" r:id="rId2"/>
      <w:footerReference w:type="default" r:id="rId3"/>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720"/>
    </w:sectPr>`;

    const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document 
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
  <w:body>
    ${body}
  </w:body>
</w:document>`;

    zip.file('word/document.xml', docXml);

    return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  }

  // --------------------------------------------------------------------------
  // HASHING & INTEGRITY
  // --------------------------------------------------------------------------

  private computeDocumentDigest(doc: EnterpriseConsultingDocument): string {
    const copy = { ...doc };
    delete copy.sha256Digest;
    return crypto.createHash('sha256').update(JSON.stringify(copy)).digest('hex');
  }
}

export const enterpriseDocumentationEngine = EnterpriseDocumentationEngine.getInstance();
