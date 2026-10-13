// ============================================================================
// SKANDA ENTERPRISE GRC: PHASE 46 REAL POSTGRESQL STAGING VALIDATION,
// AUTHORITATIVE PERSISTENCE, TENANT ISOLATION & ASSURANCE SUITE
// Path: scripts/validatePhase46StagingAssurance.ts
// ============================================================================

import pg from 'pg';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {
  PostgresPolicyRepository,
  DurableJsonPolicyRepository,
  policyRepository
} from '../server/repositories/PolicyRepository.js';
import {
  policyGovernanceEngine,
  GovernanceDocument,
  DocumentVersionRecord
} from '../server/services/PolicyGovernanceEngine.js';
import { policyVersionIntegrityService, PublishedVersionImmutableError } from '../server/services/PolicyVersionIntegrityService.js';
import { policyAcknowledgementSecurityService } from '../server/services/PolicyAcknowledgementSecurityService.js';
import { policyQualityEngine } from '../server/services/PolicyQualityEngine.js';
import { policyAiGeneratorService } from '../server/services/PolicyAiGeneratorService.js';
import { STAGING_DB_CONFIG, createDisposableStagingDatabase, applyCanonicalMigrations, seedStagingTenantsAndRoles } from './setupStagingDb.js';

interface TestAssertion {
  id: string;
  category: string;
  description: string;
  expected: string;
  actual: string;
  passed: boolean;
}

const assertions: TestAssertion[] = [];

function assert(id: string, category: string, description: string, passed: boolean, expected: string, actual: string) {
  assertions.push({ id, category, description, passed, expected, actual });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[${status}] ${id} (${category}): ${description} -> Expected: ${expected}, Got: ${actual}`);
}

async function runPhase46AssuranceSuite() {
  console.log('================================================================================');
  console.log('SKANDA ENTERPRISE GRC: PHASE 46 REAL POSTGRESQL STAGING ASSURANCE VALIDATION');
  console.log('================================================================================\n');

  const tenantA = '11111111-1111-4111-8111-111111111111';
  const tenantB = '22222222-2222-4222-8222-222222222222';

  // ==========================================================================
  // SUITE 1: REAL POSTGRESQL STAGING ENVIRONMENT & CANONICAL MIGRATIONS
  // ==========================================================================
  console.log('--- SUITE 1: Real PostgreSQL Staging Environment & Canonical Migrations ---');
  
  // 1. Provision disposable staging database
  const dbCreated = await createDisposableStagingDatabase();
  assert('P46-STG-01', 'Staging Database Creation', 'Disposable database skanda_policy_staging_p46 created', dbCreated, 'true', String(dbCreated));

  // 2. Apply canonical migrations in order (001 -> 002 -> 003 -> 004 -> 005)
  const migrationRes = await applyCanonicalMigrations();
  assert(
    'P46-MIG-01',
    'Canonical Migration Sequence',
    'Migrations 001-005 applied cleanly in sequence',
    migrationRes.success && migrationRes.applied.length === 5,
    '5 migrations applied',
    `${migrationRes.applied.length} applied: ${migrationRes.applied.join(', ')}`
  );

  // 3. Test migration idempotency (re-running migrations succeeds with 0 errors)
  const idempotencyRes = await applyCanonicalMigrations();
  assert(
    'P46-MIG-02',
    'Migration Idempotency',
    'Re-applying migrations 001-005 succeeds idempotently without error',
    idempotencyRes.success && idempotencyRes.errors.length === 0,
    'true (0 errors)',
    `${idempotencyRes.success} (${idempotencyRes.errors.length} errors)`
  );

  // 4. Seed tenants and application role
  const seeded = await seedStagingTenantsAndRoles();
  assert('P46-STG-02', 'Tenant & Role Provisioning', 'Tenants A/B and skanda_app_user role provisioned', seeded, 'true', String(seeded));

  // 5. Verify skanda_app_user role is non-superuser and has NO bypassrls privilege
  const adminClient = new pg.Client({ ...STAGING_DB_CONFIG, user: 'postgres', password: 'root' });
  await adminClient.connect();
  const roleCheck = await adminClient.query(`
    SELECT rolname, rolsuper, rolbypassrls FROM pg_roles WHERE rolname = 'skanda_app_user';
  `);
  const appRole = roleCheck.rows[0];
  const isOrdinaryRole = appRole && !appRole.rolsuper && !appRole.rolbypassrls;
  assert(
    'P46-SEC-01',
    'Least Privilege Database Role',
    'Application user skanda_app_user is NOT a superuser and does NOT bypass RLS',
    isOrdinaryRole,
    'rolsuper=false, rolbypassrls=false',
    `rolsuper=${appRole?.rolsuper}, rolbypassrls=${appRole?.rolbypassrls}`
  );
  await adminClient.end();

  // ==========================================================================
  // SUITE 2: REAL AUTHORITATIVE POSTGRESQL PERSISTENCE
  // ==========================================================================
  console.log('\n--- SUITE 2: Real Authoritative PostgreSQL Persistence ---');

  const postgresRepo = new PostgresPolicyRepository({
    host: STAGING_DB_CONFIG.host,
    port: STAGING_DB_CONFIG.port,
    user: 'skanda_app_user',
    password: 'skanda_app_pass_2026',
    database: STAGING_DB_CONFIG.database
  });

  // Switch global repository to PostgreSQL
  policyRepository.setStorageProvider('POSTGRES');
  assert('P46-REP-01', 'Repository Provider Switch', 'PolicyRepository switched to POSTGRES mode', policyRepository.getStorageProvider() === 'POSTGRES', 'POSTGRES', policyRepository.getStorageProvider());

  // 1. Create and save a document in PostgreSQL
  const sampleDocA: GovernanceDocument = {
    id: 'DOC-POL-PAM-001',
    tenantId: tenantA,
    code: 'SKD-POL-PAM-001',
    title: 'Enterprise Privileged Access Management Standard',
    type: 'POLICY',
    departmentId: 'SEC',
    departmentName: 'Security Architecture',
    processId: 'IAM',
    processName: 'Identity Governance',
    frameworkCodes: ['ISO_27001_2022', 'SOC_2_TYPE_2'],
    currentVersion: '1.0.0-DRAFT',
    status: 'DRAFT',
    ownerEmail: 'ciso@acmefintech.io',
    ownerRole: 'CISO',
    authorEmail: 'author@acmefintech.io',
    authorRole: 'SECURITY_ARCHITECT',
    reviewCadence: 'ANNUAL',
    nextReviewDate: new Date(Date.now() + 365 * 86400000).toISOString(),
    reviewStatus: 'CURRENT',
    content: {
      purpose: 'Enforce multi-factor authentication and just-in-time access for privileged accounts.',
      scope: 'All cloud and on-premise infrastructure.',
      objectives: ['Enforce hardware FIDO2 MFA', 'Eliminate standing root privileges'],
      definitions: { PAM: 'Privileged Access Management', JIT: 'Just-In-Time Elevation' },
      rolesAndResponsibilities: [{ role: 'CISO', mandate: 'Approval Authority', r: false, a: true, c: true, i: true }],
      requirementsOrSteps: [{ stepNumber: 1, actor: 'IAM Engineer', system: 'CyberArk PAM', action: 'Vault root credentials', expectedOutput: 'Zero standing access', evidenceProduced: 'PAM Vault Audit Log' }],
      controlMappings: [{ controlCode: 'A.5.15', requirement: 'Access Control', practice: 'Privileged identity vaulting' }],
      exceptionHandling: { workflow: 'CISO Emergency Waiver', approver: 'CISO', maxDays: 14 },
      governanceAndReview: { cycle: 'ANNUAL', owner: 'CISO', approver: 'Board Risk Committee' }
    },
    versions: [],
    linkedControlCodes: ['A.5.15'],
    linkedRiskIds: ['RSK-IAM-01'],
    mandatoryAcknowledgement: true,
    acknowledgementRate: 0,
    implementationScore: 20,
    sha256Digest: 'dummy-digest-pre-publication',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const savedDoc = await postgresRepo.saveDocument(sampleDocA);
  assert('P46-REP-02', 'PostgreSQL Document Save', 'Document saved to real PostgreSQL table policy_documents', savedDoc.id === sampleDocA.id, sampleDocA.id, savedDoc.id);

  // 2. Query document back from PostgreSQL
  const retrievedDoc = await postgresRepo.getDocumentById(tenantA, sampleDocA.id);
  assert(
    'P46-REP-03',
    'PostgreSQL Document Retrieval',
    'Retrieved document matches stored attributes',
    Boolean(retrievedDoc && retrievedDoc.code === sampleDocA.code && retrievedDoc.status === 'DRAFT'),
    'SKD-POL-PAM-001 (DRAFT)',
    `${retrievedDoc?.code} (${retrievedDoc?.status})`
  );

  // 3. Save and retrieve version record
  const versionRecord: DocumentVersionRecord = {
    version: '1.0.0',
    changeSummary: 'Initial baseline publication',
    changedSections: ['ALL'],
    reasonForChange: 'Enterprise Security Architecture Baseline',
    authorEmail: 'author@acmefintech.io',
    authorRole: 'SECURITY_ARCHITECT',
    reviewedBy: 'reviewer@acmefintech.io',
    reviewedAt: new Date().toISOString(),
    approvedBy: 'ciso@acmefintech.io',
    approvedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    sha256Digest: '7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
    effectiveDate: new Date().toISOString()
  };

  await postgresRepo.saveVersion(tenantA, sampleDocA.id, versionRecord);
  const versions = await postgresRepo.getVersions(tenantA, sampleDocA.id);
  assert(
    'P46-REP-04',
    'PostgreSQL Version Ledger',
    'Version saved to policy_versions table and retrieved',
    versions.length >= 1 && versions[0].version === '1.0.0',
    '1.0.0',
    versions[0]?.version || 'none'
  );

  // 4. Save and retrieve campaign & acknowledgement record
  const campaign = {
    id: 'CAMP-P46-001',
    tenantId: tenantA,
    documentId: sampleDocA.id,
    documentCode: sampleDocA.code,
    documentTitle: sampleDocA.title,
    documentVersion: '1.0.0',
    targetScope: 'ALL_EMPLOYEES' as const,
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    totalRequired: 100,
    sentCount: 100,
    viewedCount: 10,
    acknowledgedCount: 1,
    overdueCount: 0,
    exemptedCount: 0,
    status: 'ACTIVE' as const,
    createdAt: new Date().toISOString()
  };
  await postgresRepo.saveCampaign(campaign);

  const ackRecord = {
    id: 'ACK-P46-001',
    tenantId: tenantA,
    campaignId: campaign.id,
    documentId: sampleDocA.id,
    documentVersion: '1.0.0',
    userEmail: 'employee@acmefintech.io',
    userName: 'John Employee',
    userRole: 'Staff Engineer',
    department: 'Engineering',
    status: 'ACKNOWLEDGED' as const,
    acknowledgedAt: new Date().toISOString(),
    method: 'ELECTRONIC_SIGNATURE' as const,
    ipAddress: '10.0.4.12',
    auditSignature: 'HMAC_SHA256_TEST_SIG_ABC'
  };
  await postgresRepo.saveAcknowledgementRecord(ackRecord);

  const acks = await postgresRepo.getAcknowledgementRecords(campaign.id);
  assert(
    'P46-REP-05',
    'PostgreSQL Acknowledgement Ledger',
    'Acknowledgement record saved and retrieved from PostgreSQL',
    acks.length === 1 && acks[0].userEmail === 'employee@acmefintech.io',
    'employee@acmefintech.io',
    acks[0]?.userEmail || 'none'
  );

  // 5. Test application restart recovery (simulate restart by creating new repo instance)
  const restartedRepo = new PostgresPolicyRepository({
    host: STAGING_DB_CONFIG.host,
    port: STAGING_DB_CONFIG.port,
    user: 'skanda_app_user',
    password: 'skanda_app_pass_2026',
    database: STAGING_DB_CONFIG.database
  });
  const recoveredDoc = await restartedRepo.getDocumentById(tenantA, sampleDocA.id);
  assert(
    'P46-RST-01',
    'Application Restart Recovery',
    'Documents, versions, and campaigns survive application restart',
    Boolean(recoveredDoc && recoveredDoc.versions.length >= 1),
    'Document with >= 1 versions recovered',
    recoveredDoc ? `Recovered: ${recoveredDoc.code} (Versions: ${recoveredDoc.versions.length})` : 'Failed to recover'
  );

  // ==========================================================================
  // SUITE 3: DATABASE-LEVEL ROW LEVEL SECURITY (RLS) ISOLATION
  // ==========================================================================
  console.log('\n--- SUITE 3: Database-Level Row-Level Security (RLS) Isolation ---');

  // Seed document in Tenant B
  const sampleDocB: GovernanceDocument = {
    id: 'DOC-POL-FIN-002',
    tenantId: tenantB,
    code: 'SKD-POL-FIN-002',
    title: 'FinTech Wire Fraud Prevention Standard',
    type: 'POLICY',
    departmentId: 'OPS',
    departmentName: 'Banking Operations',
    processId: 'WIRE',
    processName: 'Wire Transfer Processing',
    frameworkCodes: ['MAS_TRM_2021'],
    currentVersion: '1.0.0',
    status: 'PUBLISHED',
    ownerEmail: 'ciso@fintechbank.sg',
    ownerRole: 'CISO',
    authorEmail: 'risk@fintechbank.sg',
    authorRole: 'RISK_OFFICER',
    reviewCadence: 'ANNUAL',
    nextReviewDate: new Date().toISOString(),
    reviewStatus: 'CURRENT',
    content: {
      purpose: 'Enforce dual authorization for wire transfers exceeding $50,000.',
      scope: 'Global Banking Operations',
      objectives: ['Dual control', 'Call-back verification'],
      definitions: { Wire: 'Interbank electronic transfer' },
      rolesAndResponsibilities: [{ role: 'Operations', mandate: 'Execution', r: true, a: true, c: false, i: false }],
      requirementsOrSteps: [{ stepNumber: 1, actor: 'Teller', system: 'Core Banking', action: 'Initiate transfer', expectedOutput: 'Pending approval' }],
      controlMappings: [{ controlCode: 'A.8.5', requirement: 'Authentication', practice: 'Dual signoff' }],
      exceptionHandling: { workflow: 'Board waiver', approver: 'CEO', maxDays: 7 },
      governanceAndReview: { cycle: 'ANNUAL', owner: 'CISO', approver: 'Audit Committee' }
    },
    versions: [],
    linkedControlCodes: ['A.8.5'],
    linkedRiskIds: ['RSK-OPS-02'],
    mandatoryAcknowledgement: true,
    acknowledgementRate: 0,
    implementationScore: 30,
    sha256Digest: 'digest-b-wire-fraud',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await postgresRepo.saveDocument(sampleDocB);

  // 1. Cross-Tenant SELECT Isolation
  const tenantADocs = await postgresRepo.getDocuments(tenantA);
  const tenantBDocs = await postgresRepo.getDocuments(tenantB);
  const crossLeakAtoB = tenantADocs.some(d => d.tenantId === tenantB || d.id === sampleDocB.id);
  const crossLeakBtoA = tenantBDocs.some(d => d.tenantId === tenantA || d.id === sampleDocA.id);
  assert(
    'P46-RLS-01',
    'PostgreSQL RLS SELECT Isolation',
    'Tenant A sees only Tenant A rows; Tenant B sees only Tenant B rows',
    !crossLeakAtoB && !crossLeakBtoA && tenantADocs.length >= 1 && tenantBDocs.length >= 1,
    '0 rows leaked across tenant boundaries',
    `Tenant A docs: ${tenantADocs.length} (Leaked: ${crossLeakAtoB}), Tenant B docs: ${tenantBDocs.length} (Leaked: ${crossLeakBtoA})`
  );

  // 2. Cross-Tenant Direct ID Read Denial
  const tenantBReadDocA = await postgresRepo.getDocumentById(tenantB, sampleDocA.id);
  assert(
    'P46-RLS-02',
    'Cross-Tenant Read Denial',
    'Tenant B cannot read Tenant A document by ID (returns null via RLS filter)',
    tenantBReadDocA === null,
    'null',
    String(tenantBReadDocA)
  );

  // 3. Cross-Tenant Direct UPDATE Denial (affected rows = 0)
  const updateAffectedRows = await postgresRepo.withTenantClient(tenantB, async (client) => {
    const res = await client.query(
      `UPDATE policy_documents SET title = 'TAMPERED_BY_TENANT_B' WHERE id = $1;`,
      [sampleDocA.id]
    );
    return res.rowCount || 0;
  });
  assert(
    'P46-RLS-03',
    'Cross-Tenant UPDATE Denial',
    'Tenant B cannot UPDATE Tenant A document (affected rowCount = 0)',
    updateAffectedRows === 0,
    '0 rows updated',
    `${updateAffectedRows} rows updated`
  );

  // Verify Tenant A document title was NOT tampered
  const docAAfterUpdateAttempt = await postgresRepo.getDocumentById(tenantA, sampleDocA.id);
  assert(
    'P46-RLS-04',
    'Data Integrity Post-Tamper Attempt',
    'Tenant A document remains untampered in PostgreSQL',
    docAAfterUpdateAttempt?.title === sampleDocA.title,
    sampleDocA.title,
    docAAfterUpdateAttempt?.title || 'none'
  );

  // 4. Cross-Tenant Direct DELETE Denial (affected rows = 0)
  const deleteAffectedRows = await postgresRepo.withTenantClient(tenantB, async (client) => {
    const res = await client.query(
      `DELETE FROM policy_documents WHERE id = $1;`,
      [sampleDocA.id]
    );
    return res.rowCount || 0;
  });
  assert(
    'P46-RLS-05',
    'Cross-Tenant DELETE Denial',
    'Tenant B cannot DELETE Tenant A document (affected rowCount = 0)',
    deleteAffectedRows === 0,
    '0 rows deleted',
    `${deleteAffectedRows} rows deleted`
  );

  // 5. Cross-Tenant INSERT Rejection (WITH CHECK policy violation)
  let insertWithCheckViolation = false;
  try {
    await postgresRepo.withTenantClient(tenantA, async (client) => {
      // Attempt to insert record with Tenant B ID while session context is Tenant A
      await client.query(`
        INSERT INTO policy_documents (
          id, tenant_id, code, title, type, owner_email, owner_role, author_email, author_role,
          next_review_date, content, sha256_digest
        ) VALUES (
          'DOC-EXPLOIT-001', $1::uuid, 'EXPLOIT-001', 'Illegitimate Cross-Tenant Insert', 'POLICY',
          'attacker@evil.com', 'HACKER', 'attacker@evil.com', 'HACKER',
          NOW(), '{}'::jsonb, 'sha-exploit'
        );
      `, [tenantB]); // mismatched tenant ID
    });
  } catch (err: any) {
    insertWithCheckViolation = err.message.includes('new row violates row-level security policy');
  }
  assert(
    'P46-RLS-06',
    'RLS WITH CHECK Violation Rejection',
    'Inserting row with mismatched tenant_id is strictly blocked by RLS WITH CHECK policy',
    insertWithCheckViolation,
    'Violates row-level security policy',
    insertWithCheckViolation ? 'Rejected with RLS violation error' : 'Failed to reject'
  );

  // 6. Absent / Empty / Malformed Tenant Context Fail-Closed
  const pool = postgresRepo.getPool();
  const directClient = await pool.connect();
  let failClosedRows = -1;
  try {
    // Session context is NOT set or empty string
    await directClient.query("SELECT set_config('app.current_tenant_id', '', false);");
    const res = await directClient.query('SELECT * FROM policy_documents;');
    failClosedRows = res.rows.length;
  } finally {
    directClient.release();
  }
  assert(
    'P46-RLS-07',
    'Fail-Closed Unauthenticated Session',
    'Query with empty/missing tenant context returns 0 rows (fail-closed)',
    failClosedRows === 0,
    '0 rows returned',
    `${failClosedRows} rows returned`
  );

  // ==========================================================================
  // SUITE 4: STORAGE-LEVEL WORM IMMUTABILITY TRIGGER
  // ==========================================================================
  console.log('\n--- SUITE 4: Storage-Level WORM Immutability Trigger ---');

  // Attempt SQL UPDATE on policy_versions table
  let wormUpdateBlocked = false;
  try {
    await postgresRepo.withTenantClient(tenantA, async (client) => {
      await client.query(`
        UPDATE policy_versions 
        SET change_summary = 'Illegitimate historical tamper' 
        WHERE document_id = $1;
      `, [sampleDocA.id]);
    });
  } catch (err: any) {
    wormUpdateBlocked = err.message.includes('WORM Violation');
  }
  assert(
    'P46-WRM-01',
    'Storage-Level WORM UPDATE Block',
    'Direct SQL UPDATE on policy_versions is rejected by PostgreSQL trigger',
    wormUpdateBlocked,
    'WORM Violation: records are strictly append-only',
    wormUpdateBlocked ? 'Blocked by prevent_policy_version_mutation trigger' : 'Failed to block'
  );

  // Attempt SQL DELETE on policy_versions table
  let wormDeleteBlocked = false;
  try {
    await postgresRepo.withTenantClient(tenantA, async (client) => {
      await client.query(`
        DELETE FROM policy_versions 
        WHERE document_id = $1;
      `, [sampleDocA.id]);
    });
  } catch (err: any) {
    wormDeleteBlocked = err.message.includes('WORM Violation');
  }
  assert(
    'P46-WRM-02',
    'Storage-Level WORM DELETE Block',
    'Direct SQL DELETE on policy_versions is rejected by PostgreSQL trigger',
    wormDeleteBlocked,
    'WORM Violation: records are strictly append-only',
    wormDeleteBlocked ? 'Blocked by prevent_policy_version_mutation trigger' : 'Failed to block'
  );

  // Application-level Published Version Immutability Guard
  const publishedDoc = policyGovernanceEngine.getDocument('DOC-POL-HR-001', 'SKANDA-DEMO-ENTERPRISE');
  let appWormBlocked = false;
  if (publishedDoc) {
    try {
      publishedDoc.content.purpose = 'Unauthorized in-place tamper';
      policyVersionIntegrityService.assertPublishedVersionImmutable(publishedDoc);
    } catch (err: any) {
      appWormBlocked = err instanceof PublishedVersionImmutableError;
    }
  }
  assert(
    'P46-WRM-03',
    'Application-Level WORM Guard',
    'Tampering with published content throws PublishedVersionImmutableError',
    appWormBlocked,
    'PublishedVersionImmutableError',
    appWormBlocked ? 'Blocked successfully' : 'Failed to block'
  );

  // ==========================================================================
  // SUITE 5: RFC 8785 CANONICAL SERIALIZATION & DIGEST INTEGRITY
  // ==========================================================================
  console.log('\n--- SUITE 5: RFC 8785 Canonical Serialization & Digest Integrity ---');

  const testPayload1 = {
    tenantId: tenantA,
    documentId: 'DOC-CANONICAL-01',
    documentCode: 'SKD-POL-01',
    version: '1.0.0',
    type: 'POLICY',
    title: 'Access Control',
    effectiveDate: '2026-10-10T00:00:00.000Z',
    frameworkCodes: ['SOC_2', 'ISO_27001'],
    content: {
      purpose: 'Standardize access',
      scope: 'Global',
      objectives: ['MFA', 'RBAC'],
      definitions: { B: 'Beta', A: 'Alpha' },
      rolesAndResponsibilities: [{ role: 'CISO', mandate: 'Approval' }],
      requirementsOrSteps: [
        { stepNumber: 1, actor: 'Eng', system: 'Auth0', action: 'Configure MFA' },
        { stepNumber: 2, actor: 'Auditor', system: 'AWS', action: 'Inspect CloudTrail' }
      ],
      controlMappings: [{ controlCode: 'A.5.15', requirement: 'IAM', practice: 'RBAC' }],
      exceptionHandling: { workflow: 'Waiver', approver: 'CISO', maxDays: 30 },
      governanceAndReview: { cycle: 'ANNUAL', owner: 'CISO', approver: 'Board' }
    }
  };

  const testPayloadReordered = {
    content: {
      governanceAndReview: { approver: 'Board', cycle: 'ANNUAL', owner: 'CISO' },
      exceptionHandling: { maxDays: 30, approver: 'CISO', workflow: 'Waiver' },
      controlMappings: [{ requirement: 'IAM', practice: 'RBAC', controlCode: 'A.5.15' }],
      requirementsOrSteps: [
        { action: 'Configure MFA', system: 'Auth0', actor: 'Eng', stepNumber: 1 },
        { action: 'Inspect CloudTrail', system: 'AWS', actor: 'Auditor', stepNumber: 2 }
      ],
      rolesAndResponsibilities: [{ mandate: 'Approval', role: 'CISO' }],
      definitions: { A: 'Alpha', B: 'Beta' },
      objectives: ['MFA', 'RBAC'],
      scope: 'Global',
      purpose: 'Standardize access'
    },
    frameworkCodes: ['ISO_27001', 'SOC_2'],
    effectiveDate: '2026-10-10T00:00:00.000Z',
    title: 'Access Control',
    type: 'POLICY',
    version: '1.0.0',
    documentCode: 'SKD-POL-01',
    documentId: 'DOC-CANONICAL-01',
    tenantId: tenantA
  };

  const digest1 = policyVersionIntegrityService.computeVersionDigest(testPayload1 as any);
  const digestReordered = policyVersionIntegrityService.computeVersionDigest(testPayloadReordered as any);
  assert(
    'P46-JCS-01',
    'RFC 8785 Key Order Invariance',
    'Payloads with scrambled object keys produce identical canonical SHA-256 digests',
    digest1 === digestReordered,
    'digest1 === digestReordered',
    `digest1=${digest1.slice(0, 12)}..., digestReordered=${digestReordered.slice(0, 12)}...`
  );

  // Array Order Preservation (RFC 8785 section 3.2.3: Arrays MUST preserve order)
  const payloadScrambledSteps = JSON.parse(JSON.stringify(testPayload1));
  payloadScrambledSteps.content.requirementsOrSteps.reverse(); // Step 2 first, then Step 1
  const digestScrambledSteps = policyVersionIntegrityService.computeVersionDigest(payloadScrambledSteps as any);
  assert(
    'P46-JCS-02',
    'RFC 8785 Array Order Preservation',
    'Reordering array items produces a completely different digest (preserves semantic meaning)',
    digest1 !== digestScrambledSteps,
    'digest1 !== digestScrambledSteps',
    `Step 1/2 digest != Step 2/1 digest: ${digest1 !== digestScrambledSteps}`
  );

  // ==========================================================================
  // SUITE 6: ACKNOWLEDGEMENT SECURITY & KEY ROTATION
  // ==========================================================================
  console.log('\n--- SUITE 6: Acknowledgement Security & Key Rotation ---');

  // 1. Fail-closed on insecure secret in production mode
  let failClosedSecret = false;
  try {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    (policyAcknowledgementSecurityService as any).validateSecretStrength('short');
    process.env.NODE_ENV = origEnv;
  } catch (err: any) {
    failClosedSecret = err.message.includes('INSECURE_PRODUCTION_SECRET');
  }
  assert(
    'P46-ACK-01',
    'Production Secret Strength Enforcement',
    'In production mode, secrets under 32 characters throw INSECURE_PRODUCTION_SECRET',
    failClosedSecret,
    'INSECURE_PRODUCTION_SECRET error thrown',
    failClosedSecret ? 'Enforced fail-closed in production' : 'Failed to enforce'
  );

  // 2. Signature verification with active key (v1)
  const ackParams = {
    tenantId: tenantA,
    campaignId: 'CAMP-P46-001',
    documentId: 'DOC-POL-PAM-001',
    documentVersion: '1.0.0',
    documentDigest: digest1,
    userEmail: 'employee.lead@acmefintech.io',
    userRole: 'ENGINEERING_LEAD',
    timestamp: '2026-10-10T12:00:00.000Z'
  };

  const sigV1 = policyAcknowledgementSecurityService.generateAcknowledgementSignature(ackParams);
  const verifyV1 = policyAcknowledgementSecurityService.verifyAcknowledgementSignature({
    ...ackParams,
    signature: sigV1
  });
  assert('P46-ACK-02', 'HMAC Signature Verification', 'HMAC-SHA256 signature verified server-side with key v1', verifyV1.isValid, 'isValid: true', `isValid: ${verifyV1.isValid}`);

  // 3. Zero-downtime key rotation to v2
  const newSecretV2 = 'enterprise-kms-rotated-key-secret-32-chars-minimum-2026';
  policyAcknowledgementSecurityService.rotateKey(newSecretV2, 'v2');
  assert('P46-ACK-03', 'Key Rotation Active Version', 'Active key rotated to v2', policyAcknowledgementSecurityService.getCurrentKeyVersion() === 'v2', 'v2', policyAcknowledgementSecurityService.getCurrentKeyVersion());

  // 4. Verify that v1 signature remains verifiable using key ring
  const verifyV1AfterRotation = policyAcknowledgementSecurityService.verifyAcknowledgementSignature({
    ...ackParams,
    signature: sigV1,
    keyVersion: 'v1'
  });
  assert(
    'P46-ACK-04',
    'Keyring Backward Compatibility',
    'Pre-rotation v1 signature remains verifiable after v2 rotation',
    verifyV1AfterRotation.isValid,
    'isValid: true',
    `isValid: ${verifyV1AfterRotation.isValid}`
  );

  // 5. Verify v2 signature generated with new key
  const sigV2 = policyAcknowledgementSecurityService.generateAcknowledgementSignature(ackParams);
  const verifyV2 = policyAcknowledgementSecurityService.verifyAcknowledgementSignature({
    ...ackParams,
    signature: sigV2,
    keyVersion: 'v2'
  });
  assert('P46-ACK-05', 'New Key Version Verification', 'New signature generated with v2 key verifies successfully', verifyV2.isValid, 'isValid: true', `isValid: ${verifyV2.isValid}`);

  // ==========================================================================
  // SUITE 7: AI PROVENANCE & NEGATIVE COMPLIANCE TESTS
  // ==========================================================================
  console.log('\n--- SUITE 7: AI Provenance & Negative Compliance Tests ---');

  const aiDraft = policyAiGeneratorService.generatePolicyDraft({
    tenantId: tenantA,
    domainOrTopic: 'Cryptographic Key Management Standard',
    documentType: 'STANDARD',
    departmentId: 'SEC',
    departmentName: 'Security Operations',
    processId: 'CRYPTO',
    processName: 'Cryptographic Operations',
    ownerEmail: 'ciso@acmefintech.io',
    ownerRole: 'CISO',
    authorEmail: 'author@acmefintech.io',
    authorRole: 'SECURITY_ENGINEER',
    targetFrameworkCodes: ['ISO_27001_2022']
  });

  // Verify all statements have statementNature, verificationStatus, and applicabilityRationale
  const statementsClassified = aiDraft.traceableStatements.every(s =>
    Boolean(s.statementNature && s.verificationStatus && s.applicabilityRationale)
  );
  assert(
    'P46-AI-01',
    'AI Statement Provenance',
    'All AI statements tag statementNature, verificationStatus, and applicabilityRationale',
    statementsClassified,
    'All statements classified',
    statementsClassified ? `${aiDraft.traceableStatements.length} statements classified` : 'Unclassified statements found'
  );

  // Negative Test: AI Agent cannot approve policy
  const aiAuthApproval = policyGovernanceEngine.evaluateApprovalAuthorization({
    documentId: 'DOC-POL-HR-001',
    actorEmail: 'ai-governance-evaluator@skanda.internal',
    actorRole: 'AI_AGENT'
  });
  assert(
    'P46-AI-02',
    'AI Approval Exclusion Gate',
    'AI agents are strictly blocked from approving policies',
    !aiAuthApproval.isAuthorized && (aiAuthApproval.reason?.includes('AI_AGENT') ?? false),
    'isAuthorized: false, Reason contains AI_AGENT',
    `isAuthorized: ${aiAuthApproval.isAuthorized}, Reason: ${aiAuthApproval.reason}`
  );

  // Negative Test: Author cannot self-approve policy (Segregation of Duties)
  const authorAuthApproval = policyGovernanceEngine.evaluateApprovalAuthorization({
    documentId: 'DOC-POL-HR-001',
    actorEmail: 'marcus.vance@acmefintech.io', // Author of DOC-POL-HR-001
    actorRole: 'CISO'
  });
  assert(
    'P46-SOD-01',
    'Segregation of Duties Enforcement',
    'Policy author is strictly prohibited from approving own draft',
    !authorAuthApproval.isAuthorized && (authorAuthApproval.reason?.includes('SEGREGATION_OF_DUTIES_VIOLATION') ?? false),
    'isAuthorized: false, Reason contains SEGREGATION_OF_DUTIES_VIOLATION',
    `isAuthorized: ${authorAuthApproval.isAuthorized}, Reason: ${authorAuthApproval.reason}`
  );

  // ==========================================================================
  // SUITE 8: AUDITOR GOVERNANCE PACK & INDEPENDENT RECALCULATION
  // ==========================================================================
  console.log('\n--- SUITE 8: Auditor Governance Pack & Independent Recalculation ---');

  const pack = policyGovernanceEngine.assembleAuditorGovernancePack('SKANDA-DEMO-ENTERPRISE');
  assert(
    'P46-AUD-01',
    'Auditor Governance Pack Assembly',
    'Assembles complete governance pack with 64-char SHA-256 seal',
    pack.sha256Digest.length === 64 && pack.documentRegister.length >= 1,
    '64-char seal with documents',
    `Digest: ${pack.sha256Digest.slice(0, 16)}..., Docs: ${pack.documentRegister.length}`
  );

  const packValid = policyGovernanceEngine.verifyAuditorPackDigest(pack);
  assert(
    'P46-AUD-02',
    'Independent Auditor Pack Digest Verification',
    'Cryptographic SHA-256 digest of auditor pack independently verified',
    packValid,
    'isPackValid: true',
    `isPackValid: ${packValid}`
  );

  // Close repository pool cleanly
  await postgresRepo.close();

  // ==========================================================================
  // FINAL SCORECARD
  // ==========================================================================
  const total = assertions.length;
  const passed = assertions.filter(a => a.passed).length;
  const failed = total - passed;
  const rate = Math.round((passed / total) * 100);

  console.log('\n================================================================================');
  console.log('PHASE 46 STAGING ASSURANCE VALIDATION SCORECARD');
  console.log('================================================================================');
  console.log(`Total Assertions : ${total}`);
  console.log(`Passed           : ${passed}`);
  console.log(`Failed           : ${failed}`);
  console.log(`Pass Rate        : ${rate}%`);
  console.log('================================================================================\n');

  if (failed === 0) {
    console.log('✅ ALL PHASE 46 REAL POSTGRESQL STAGING & TENANT ASSURANCE ASSERTIONS PASSED!');
    console.log('VERDICT: LIVE_STAGING_VERIFIED (Real PostgreSQL 16 Staging Database Validated)');
  } else {
    console.error(`❌ ${failed} ASSERTIONS FAILED.`);
    process.exit(1);
  }
}

runPhase46AssuranceSuite().catch(err => {
  console.error('Fatal error during Phase 46 execution:', err);
  process.exit(1);
});
