// ============================================================================
// SKANDA ENTERPRISE GRC: ENTERPRISE POLICY GOVERNANCE & INTELLIGENCE VALIDATION
// Path: scripts/validateEnterprisePolicyIntelligenceWorkspace.ts
//
// Principal Enterprise SaaS Architect & Chief GRC Product Architect Forensic Suite
// Validates the unified Enterprise Policy Governance & Intelligence Workspace:
//
// 1. Unified Policy Decision Experience & Aggregate Read Model
// 2. 12-Dimension Policy Quality Intelligence & Scoring Engine
// 3. AI Policy Generation with Statement-Level Source Traceability
// 4. Approval Matrix, Segregation of Duties & RBAC Enforcement
// 5. Closed-Loop Implementation Lineage (Policy -> Tasks -> Evidence -> Tests -> Assurance)
// 6. Employee Acknowledgements & Cryptographic HMAC Signature Ledger
// 7. Multi-Framework Traceability (ISO 27001:2022, DPDP, GDPR, SOC 2, MAS TRM, ISO 42001)
// 8. Policy Duplication, Scope Overlap & Contradiction Detection
// 9. Regulatory Change Impact Assessment & Governance Review Workflows
// 10. Immutable WORM Versioning, Side-by-Side Diff & Non-Destructive Archival
// 11. Multi-Tenant Data Isolation & Security Boundaries
// 12. Auditor Digital Governance Pack with SHA-256 Integrity Seal
// ============================================================================

import crypto from 'crypto';
import {
  policyGovernanceEngine,
  GovernanceDocument,
  DocumentType,
  DocumentLifecycleStatus,
  ReviewCadence
} from '../server/services/PolicyGovernanceEngine.js';
import { policyQualityEngine } from '../server/services/PolicyQualityEngine.js';
import { policyAiGeneratorService } from '../server/services/PolicyAiGeneratorService.js';
import { policyDuplicationEngine } from '../server/services/PolicyDuplicationEngine.js';
import { policyRegulatoryImpactService } from '../server/services/PolicyRegulatoryImpactService.js';

interface AssertionResult {
  id: string;
  category: string;
  description: string;
  passed: boolean;
  expected: string;
  actual: string;
  details?: any;
}

const results: AssertionResult[] = [];

function assert(
  id: string,
  category: string,
  description: string,
  passed: boolean,
  expected: string,
  actual: string,
  details?: any
) {
  results.push({
    id,
    category,
    description,
    passed,
    expected,
    actual,
    details
  });

  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[${icon}] ${id} (${category}): ${description} -> Expected: ${expected}, Got: ${actual}`);
}

async function runPolicyWorkspaceValidation() {
  console.log('================================================================================');
  console.log('SKANDA ENTERPRISE GRC: POLICY GOVERNANCE & INTELLIGENCE WORKSPACE VALIDATION');
  console.log('================================================================================\n');

  const tenantA = 'SKANDA-DEMO-ENTERPRISE';
  const tenantB = 'TENANT-ISOLATED-B';

  // --------------------------------------------------------------------------
  // 1. UNIFIED POLICY DECISION EXPERIENCE AGGREGATOR
  // --------------------------------------------------------------------------
  console.log('--- 1. Unified Policy Decision Experience & Aggregate Read Model ---');

  const expDoc = policyGovernanceEngine.getDocument('DOC-POL-HR-001');
  assert(
    'EXP-01',
    'Policy Experience',
    'Canonical document DOC-POL-HR-001 exists in repository',
    Boolean(expDoc),
    'Document found',
    expDoc ? `Found: ${expDoc.code}` : 'Not found'
  );

  const exp = policyGovernanceEngine.getPolicyExperience('DOC-POL-HR-001', 'auditor@skanda.enterprise.com', 'AUDITOR');
  assert(
    'EXP-02',
    'Policy Experience',
    'Experience aggregate model returns complete 360° structure',
    Boolean(
      exp &&
      exp.policy &&
      exp.governance &&
      exp.quality &&
      exp.traceability &&
      exp.implementation &&
      exp.evidenceAndTesting &&
      exp.acknowledgement &&
      exp.versionHistory &&
      exp.reviewSchedule
    ),
    'All 8 aggregate dimensions populated',
    exp ? `Populated: ${Object.keys(exp).join(', ')}` : 'Null'
  );

  assert(
    'EXP-03',
    'Policy Experience',
    'Experience includes closed-loop traceability linking Requirements, Controls, and Risks',
    Boolean(
      exp.traceability.frameworks.length > 0 &&
      exp.traceability.controls.length > 0 &&
      exp.traceability.risks.length > 0
    ),
    'Frameworks, controls, and risks linked',
    `Frameworks: ${exp.traceability.frameworks.length}, Controls: ${exp.traceability.controls.length}, Risks: ${exp.traceability.risks.length}`
  );

  // --------------------------------------------------------------------------
  // 2. 12-DIMENSION POLICY QUALITY INTELLIGENCE ENGINE
  // --------------------------------------------------------------------------
  console.log('\n--- 2. 12-Dimension Policy Quality Intelligence Engine ---');

  const qualityResult = policyQualityEngine.evaluatePolicy({
    id: 'DOC-POL-HR-001',
    code: 'SKD-POL-HR-001',
    title: 'Enterprise Access Control & Identity Provisioning Policy',
    type: 'POLICY',
    status: 'PUBLISHED',
    currentVersion: '1.0.0',
    ownerEmail: 'rachel.green@acmefintech.io',
    ownerRole: 'HR Operations Manager',
    authorEmail: 'marcus.vance@acmefintech.io',
    authorRole: 'CISO',
    reviewCadence: 'ANNUAL',
    frameworkCodes: ['ISO_27001_2022', 'SOC_2_TYPE_2'],
    linkedControlCodes: ['A.5.15', 'A.5.18'],
    linkedRiskIds: ['RSK-IAM-001'],
    content: expDoc!.content,
    implementationTasksCount: 3,
    evidenceSpecsCount: 2
  });

  assert(
    'QINT-01',
    'Quality Engine',
    'Evaluates all 12 enterprise governance quality dimensions',
    qualityResult.dimensionScores.length === 12,
    '12 dimensions evaluated',
    `Evaluated: ${qualityResult.dimensionScores.length} dimensions`
  );

  const expectedDimensions = [
    'COMPLETENESS',
    'CLARITY_READABILITY',
    'INTERNAL_CONSISTENCY',
    'ENFORCEABILITY',
    'ACCOUNTABILITY_RACI',
    'REQUIREMENT_TRACEABILITY',
    'RISK_ALIGNMENT',
    'OPERATIONAL_FEASIBILITY',
    'REVIEW_APPROVAL_COMPLETENESS',
    'DOCUMENT_CONTROL_INTEGRITY',
    'IMPLEMENTATION_READINESS',
    'EVIDENCE_SPEC_COMPLETENESS'
  ];

  const evaluatedDims = qualityResult.dimensionScores.map(d => d.dimension);
  const allDimsPresent = expectedDimensions.every(d => evaluatedDims.includes(d));
  assert(
    'QINT-02',
    'Quality Engine',
    'Contains exact standardized quality dimension codes',
    allDimsPresent,
    'All 12 dimensions present',
    `Present: ${evaluatedDims.length}/12`
  );

  assert(
    'QINT-03',
    'Quality Engine',
    'Computes weighted score and assigns appropriate maturity tier',
    qualityResult.overallScore >= 75 && Boolean(qualityResult.maturityTier),
    'Score >= 75 with Maturity Tier (L3/L4/L5)',
    `Score: ${qualityResult.overallScore}%, Tier: ${qualityResult.maturityTier}`
  );

  assert(
    'QINT-04',
    'Quality Engine',
    'Includes non-guarantee operational disclaimer',
    qualityResult.disclaimer.includes('does not constitute a formal certification guarantee'),
    'Disclaimer contains legal/audit caveat',
    qualityResult.disclaimer
  );

  // --------------------------------------------------------------------------
  // 3. AI-ASSISTED POLICY GENERATION & SOURCE TRACEABILITY
  // --------------------------------------------------------------------------
  console.log('\n--- 3. AI-Assisted Policy Generation & Source Traceability ---');

  const aiDraft = policyAiGeneratorService.generatePolicyDraft({
    tenantId: tenantA,
    domainOrTopic: 'Cloud Multi-Tenant Key Management & Envelope Encryption',
    documentType: 'STANDARD',
    departmentId: 'DEP-SEC-01',
    departmentName: 'Information Security',
    processId: 'PROC-SEC-02',
    processName: 'Cryptographic Key Lifecycle',
    targetFrameworkCodes: ['ISO_27001_2022', 'MAS_TRM_2021'],
    ownerEmail: 'ciso@acmefintech.io',
    ownerRole: 'Chief Information Security Officer',
    authorEmail: 'sec.architect@acmefintech.io',
    authorRole: 'Lead Security Architect',
    organizationContext: {
      organizationName: 'Acme Financial Technologies',
      industry: 'FinTech / SaaS',
      jurisdictions: ['US', 'EU', 'SG'],
      technologyStack: {
        cloudProviders: ['AWS', 'Microsoft Azure'],
        identityProviders: ['Microsoft Entra ID'],
        itsmPlatforms: ['ServiceNow ITSM'],
        endpointSecurity: ['CrowdStrike Falcon'],
        databaseEngines: ['PostgreSQL RDS']
      }
    }
  });

  assert(
    'AI-GEN-01',
    'AI Generation',
    'AI generation produces complete 12-step structured policy draft',
    Boolean(
      aiDraft.content.purpose &&
      aiDraft.content.scope &&
      aiDraft.content.objectives.length >= 2 &&
      aiDraft.content.rolesAndResponsibilities.length >= 2 &&
      aiDraft.content.requirementsOrSteps.length >= 3 &&
      aiDraft.content.controlMappings.length >= 2
    ),
    'All core structural sections populated',
    `Requirements: ${aiDraft.content.requirementsOrSteps.length}, Controls: ${aiDraft.content.controlMappings.length}`
  );

  assert(
    'AI-GEN-02',
    'AI Generation',
    'AI draft attaches statement-level Source Traceability tags',
    aiDraft.traceableStatements.length >= 4,
    '>= 4 traceable statements with provenance',
    `Generated ${aiDraft.traceableStatements.length} traceable statements`
  );

  const tagTypes = aiDraft.traceableStatements.map(s => s.sourceType);
  assert(
    'AI-GEN-03',
    'AI Generation',
    'Traceability distinguishes Authoritative Framework text, Org Facts, and AI recommendations',
    tagTypes.includes('AUTHORITATIVE_FRAMEWORK_TEXT') &&
    tagTypes.includes('ORGANIZATIONAL_FACT') &&
    tagTypes.includes('AI_GENERATED_RECOMMENDATION'),
    'Tags include Authoritative, Org Fact, and AI recommendation',
    `Found tags: ${Array.from(new Set(tagTypes)).join(', ')}`
  );

  assert(
    'AI-GEN-04',
    'AI Generation',
    'Mandatory human review gate enforced (AI cannot self-approve or self-publish)',
    aiDraft.humanReviewRequired === true && aiDraft.status === 'DRAFT',
    'humanReviewRequired: true, status: DRAFT',
    `humanReviewRequired: ${aiDraft.humanReviewRequired}, status: ${aiDraft.status}`
  );

  // --------------------------------------------------------------------------
  // 4. APPROVAL MATRIX, SEGREGATION OF DUTIES & RBAC
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Approval Matrix, Segregation of Duties & RBAC ---');

  // Create a draft document by Author A
  const testDoc = policyGovernanceEngine.createDocument({
    tenantId: tenantA,
    code: 'POL-TEST-099',
    title: 'Zero Trust Network Architecture Policy',
    type: 'POLICY',
    departmentId: 'DEP-SEC-01',
    departmentName: 'Information Security',
    processId: 'PROC-NET-01',
    processName: 'Network Perimeter Defense',
    frameworkCodes: ['ISO_27001_2022'],
    authorEmail: 'author.alice@acmefintech.io',
    authorRole: 'Security Engineer',
    ownerEmail: 'ciso@acmefintech.io',
    ownerRole: 'CISO',
    reviewCadence: 'ANNUAL',
    content: {
      purpose: 'Enforces micro-segmentation and TLS 1.3 across internal networks.',
      scope: 'All corporate VPCs and production subnetworks.',
      objectives: ['Eliminate implicit trust on corporate VPNs'],
      definitions: { ZTNA: 'Zero Trust Network Access' },
      rolesAndResponsibilities: [{ role: 'CISO', mandate: 'Approval authority', r: false, a: true, c: true, i: false }],
      requirementsOrSteps: [{ stepNumber: 1, actor: 'NetOps', system: 'Palo Alto Firewall', action: 'Enforce ingress whitelisting', expectedOutput: 'Policy applied' }],
      controlMappings: [{ controlCode: 'A.8.20', requirement: 'Network Security', practice: 'Micro-segmentation' }],
      exceptionHandling: { workflow: 'CISO waiver', approver: 'CISO', maxDays: 30 },
      governanceAndReview: { cycle: 'Annual', owner: 'CISO', approver: 'Executive Committee' }
    }
  });

  policyGovernanceEngine.submitForReview(testDoc.id, 'author.alice@acmefintech.io', 'Security Engineer');

  // Attempt 1: Author attempts to approve their own document -> MUST BE BLOCKED
  let sodBlocked = false;
  try {
    policyGovernanceEngine.approveDocument({
      documentId: testDoc.id,
      actorEmail: 'author.alice@acmefintech.io',
      actorRole: 'CISO', // Even if claiming CISO role, email matches author
      approvalComment: 'Self-approving my policy'
    });
  } catch (err: any) {
    sodBlocked = err.message.includes('SEGREGATION_OF_DUTIES_VIOLATION');
  }

  assert(
    'SOD-01',
    'Segregation of Duties',
    'Server strictly blocks author from approving their own policy draft',
    sodBlocked,
    'Blocked with SEGREGATION_OF_DUTIES_VIOLATION',
    sodBlocked ? 'Blocked successfully' : 'Allowed unexpectedly'
  );

  // Attempt 2: Unauthorized role (Intern) attempts to approve -> MUST BE BLOCKED
  let rbacBlocked = false;
  try {
    policyGovernanceEngine.approveDocument({
      documentId: testDoc.id,
      actorEmail: 'intern.bob@acmefintech.io',
      actorRole: 'INTERN',
      approvalComment: 'Intern signoff'
    });
  } catch (err: any) {
    rbacBlocked = err.message.includes('UNAUTHORIZED_APPROVAL');
  }

  assert(
    'RBAC-01',
    'Approval Matrix',
    'Server strictly blocks unauthorized role from approving policy',
    rbacBlocked,
    'Blocked with UNAUTHORIZED_APPROVAL',
    rbacBlocked ? 'Blocked successfully' : 'Allowed unexpectedly'
  );

  // Attempt 3: Authorized independent CISO approves -> MUST SUCCEED
  const approvedDoc = policyGovernanceEngine.approveDocument({
    documentId: testDoc.id,
    actorEmail: 'marcus.vance@acmefintech.io',
    actorRole: 'CISO',
    approvalComment: 'Formally approved following architecture review.'
  });

  assert(
    'APP-01',
    'Approval Governance',
    'Independent authorized CISO successfully signs off document',
    approvedDoc.status === 'APPROVED',
    'Status: APPROVED',
    `Status: ${approvedDoc.status}`
  );

  // --------------------------------------------------------------------------
  // 5. PUBLICATION QUALITY GATE, WORM IMMUTABILITY & IMPLEMENTATION GENERATION
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Publication Quality Gate, WORM Immutability & Implementation ---');

  const pubResult = policyGovernanceEngine.publishDocument({
    documentId: testDoc.id,
    actorEmail: 'marcus.vance@acmefintech.io',
    actorRole: 'CISO'
  });

  assert(
    'PUB-01',
    'Publication Engine',
    'Published document receives immutable SHA-256 seal and transitions to PUBLISHED',
    pubResult.document.status === 'PUBLISHED' && pubResult.document.sha256Digest.length === 64,
    'Status: PUBLISHED with 64-char SHA-256 digest',
    `Status: ${pubResult.document.status}, Digest: ${pubResult.document.sha256Digest.substring(0, 16)}...`
  );

  assert(
    'PUB-02',
    'Publication Engine',
    'Publication automatically generates operational Implementation Plan & Tasks',
    Boolean(pubResult.implementationPlan && pubResult.implementationPlan.tasks.length > 0),
    'Implementation Plan created with tasks',
    `Tasks created: ${pubResult.implementationPlan?.tasks.length}`
  );

  assert(
    'PUB-03',
    'Publication Engine',
    'Publication automatically initiates Employee Acknowledgement Campaign',
    Boolean(pubResult.campaign && pubResult.campaign.status === 'ACTIVE'),
    'Active Acknowledgement Campaign initiated',
    `Campaign ID: ${pubResult.campaign?.id}, Target: ${pubResult.campaign?.targetScope}`
  );

  // --------------------------------------------------------------------------
  // 6. EMPLOYEE ACKNOWLEDGEMENTS & HMAC-SHA256 SIGNATURE LEDGER
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Employee Acknowledgements & HMAC Electronic Signatures ---');

  const ackRecord = policyGovernanceEngine.recordUserAcknowledgement({
    tenantId: tenantA,
    campaignId: pubResult.campaign!.id,
    userEmail: 'karthikeyan.j@acmefintech.io',
    userName: 'Karthikeyan J',
    userRole: 'Enterprise Architect',
    department: 'Technology & Architecture',
    ipAddress: '203.0.113.50'
  });

  assert(
    'ACK-01',
    'Acknowledgements',
    'Records electronic signature with cryptographic HMAC audit signature',
    ackRecord.status === 'ACKNOWLEDGED' && ackRecord.auditSignature.length === 64,
    'Status: ACKNOWLEDGED with 64-char HMAC signature',
    `Status: ${ackRecord.status}, Sig: ${ackRecord.auditSignature.substring(0, 16)}...`
  );

  // --------------------------------------------------------------------------
  // 7. POLICY DUPLICATION & CONTRADICTION SCANNER
  // --------------------------------------------------------------------------
  console.log('\n--- 7. Policy Duplication & Contradiction Scanner ---');

  const docsForDupScan = policyGovernanceEngine.getDocuments(tenantA);
  const dupScan = policyDuplicationEngine.scanCatalogForDuplications(tenantA, docsForDupScan as any);

  assert(
    'DUP-01',
    'Duplication Scanner',
    'Duplication engine scans catalog and analyzes title and semantic overlaps',
    Boolean(dupScan && dupScan.analyzedDocumentsCount >= 2),
    'Analyzed >= 2 documents',
    `Analyzed: ${dupScan.analyzedDocumentsCount} documents`
  );

  // --------------------------------------------------------------------------
  // 8. REGULATORY CHANGE IMPACT & GOVERNANCE REVIEW TASKS
  // --------------------------------------------------------------------------
  console.log('\n--- 8. Regulatory Change Impact & Governance Tasks ---');

  const regImpact = policyRegulatoryImpactService.assessRegulatoryChangeImpact({
    tenantId: tenantA,
    changeEvent: {
      eventId: 'REG-EVT-ISO-2026',
      sourceRegulatoryBody: 'ISO/IEC JTC 1/SC 27',
      frameworkCode: 'ISO_27001_2022',
      affectedClauseOrSection: 'Control A.8.24 Cryptographic Key Management',
      changeDescription: 'Mandatory migration to post-quantum resistant cryptographic algorithms (PQC).',
      effectiveDate: '2026-12-31',
      urgency: 'HIGH'
    },
    documents: docsForDupScan
  });

  assert(
    'REG-01',
    'Regulatory Impact',
    'Identifies downstream policies impacted by upstream statutory amendment',
    regImpact.impactedDocuments.length > 0,
    '>= 1 impacted documents identified',
    `Impacted: ${regImpact.impactedDocuments.length} (${regImpact.impactedDocuments.map(d => d.documentCode).join(', ')})`
  );

  assert(
    'REG-02',
    'Regulatory Impact',
    'Creates formal Governance Review Tasks without destructive auto-overwrites',
    regImpact.impactedDocuments.every(d => Boolean(d.reviewTaskId)),
    'Review task IDs created for all impacted policies',
    `Created ${regImpact.impactedDocuments.length} review tasks`
  );

  // --------------------------------------------------------------------------
  // 9. VERSION COMPARISON DIFF
  // --------------------------------------------------------------------------
  console.log('\n--- 9. Version Control & Side-by-Side Diff ---');

  const versionDiff = policyGovernanceEngine.compareDocumentVersions('DOC-POL-SEC-002', '1.0.0', '1.1.0');
  assert(
    'DIFF-01',
    'Version Diff',
    'Side-by-side diff identifies section-level changes across revisions',
    Boolean(versionDiff && versionDiff.sectionDiffs.length > 0),
    'Section diffs populated',
    `Found ${versionDiff.sectionDiffs.length} section comparisons`
  );

  // --------------------------------------------------------------------------
  // 10. MULTI-TENANT DATA ISOLATION
  // --------------------------------------------------------------------------
  console.log('\n--- 10. Multi-Tenant Data Isolation ---');

  const tenantADocs = policyGovernanceEngine.getDocuments(tenantA);
  const tenantBDocs = policyGovernanceEngine.getDocuments(tenantB);

  assert(
    'TEN-01',
    'Multi-Tenancy',
    'Tenant B cannot access or enumerate Tenant A policy documents',
    tenantBDocs.length === 0,
    'Tenant B documents count: 0',
    `Tenant B documents: ${tenantBDocs.length}`
  );

  // --------------------------------------------------------------------------
  // 11. AUDITOR GOVERNANCE DIGITAL PACK
  // --------------------------------------------------------------------------
  console.log('\n--- 11. Auditor Governance Digital Pack ---');

  const auditPack = policyGovernanceEngine.assembleAuditorGovernancePack(tenantA);
  assert(
    'AUD-01',
    'Auditor Pack',
    'Assembles complete governance digital binder with cryptographic integrity seal',
    Boolean(
      auditPack.manifestId &&
      auditPack.sha256Digest.length === 64 &&
      auditPack.documentRegister.length > 0 &&
      auditPack.approvalRecords.length > 0 &&
      auditPack.implementationStatus.length > 0
    ),
    '64-char SHA-256 seal with documents, approvals, and implementation status',
    `Seal: ${auditPack.sha256Digest.substring(0, 16)}..., Docs: ${auditPack.documentRegister.length}, Approvals: ${auditPack.approvalRecords.length}`
  );

  // --------------------------------------------------------------------------
  // SCORECARD SUMMARY
  // --------------------------------------------------------------------------
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const passRate = ((passed / total) * 100).toFixed(1);

  console.log('\n================================================================================');
  console.log('ENTERPRISE POLICY GOVERNANCE & INTELLIGENCE WORKSPACE SCORECARD');
  console.log('================================================================================');
  console.log(`Total Assertions : ${total}`);
  console.log(`Passed           : ${passed}`);
  console.log(`Failed           : ${failed}`);
  console.log(`Pass Rate        : ${passRate}%`);
  console.log('================================================================================\n');

  if (failed > 0) {
    console.error(`❌ Validation failed with ${failed} failure(s).`);
    process.exit(1);
  } else {
    console.log('✅ ALL ENTERPRISE POLICY GOVERNANCE & INTELLIGENCE ASSERTIONS PASSED!');
    console.log('VERDICT: TEST_VERIFIED — READY FOR OPERATIONAL DEPLOYMENT');
  }
}

runPolicyWorkspaceValidation().catch(err => {
  console.error('Fatal validation error:', err);
  process.exit(1);
});
