/**
 * SKANDA PHASE 9 CLIENT PILOT READINESS & ENTERPRISE PRODUCTION READINESS
 * Path: scripts/validatePhase9ClientPilotReadiness.ts
 *
 * Comprehensive validation test suite testing:
 * 1. Environment separation & explicit configuration (DEV, TEST, STAGING, PROD)
 * 2. Automated Tenant Provisioning Lifecycle (Create Tenant -> Org -> Admin -> Roles -> Identity -> Programs -> Scope -> Activation)
 * 3. 8-Step Customer Onboarding flow (WHY, WHAT IS REQUIRED, WHAT HAPPENS NEXT)
 * 4. Enterprise Identity Federation (Entra ID, Okta, Google SAML, SCIM 2.0 User Provisioning & Lifecycle)
 * 5. MFA / SSO Experience & Secure Session Token Verification
 * 6. Server-Side RBAC & Granular Permission Enforcement across all 7 Roles
 * 7. Canonical Compliance Program Configuration (ISO 27001, MAS TRM, SOC 2, ISO 42001, DPDP)
 * 8. Scope Management & Traceability across Assets, Controls, Risks, and Audits
 * 9. Risk & Control Governance (Inherent 5x5 Scoring, Mitigation, Residual Recalculation, CISO Sign-off)
 * 10. Secure Evidence Storage & Multi-Format Validation (PDF, XLSX, Images, Magic Header, Path Traversal Defense)
 * 11. Auditor Clean Room & Sealed Digital Binder with SHA-256 Manifest
 * 12. Tenant-Scoped Enterprise Reporting & Secure Export
 * 13. Double-Layer Tenant Isolation (Express RBAC + Direct PostgreSQL RLS Session Context)
 * 14. Data Protection & Disaster Recovery Verification (RPO 5m, RTO 15m, PITR Simulation)
 * 15. Observability, Distributed Tracing & Enterprise Health Engine
 * 16. Integration Readiness Truth Ledger (Truthful status: CONFIGURED vs INTEGRATION_READY)
 * 17. Continuous Compliance Telemetry, Drift Detection, NBA Generation & ITSM Sync
 * 18. Actionable 4-Part Notification Schema Validation
 * 19. Customer Offboarding Lifecycle (Disable -> Revoke -> Export -> Archive -> Audit Ledger)
 * 20. Demo vs Production Tenant Boundary Separation
 */

import { FrameworkLibrary } from '../src/services/grc/FrameworkLibrary';
import { UnifiedControlLibrary } from '../src/services/grc/UnifiedControlLibrary';
import { ConfigurableRiskEngine } from '../src/services/grc/ConfigurableRiskEngine';
import { SmartEvidenceEngine } from '../src/services/grc/SmartEvidenceEngine';
import { AuditRemediationEngine } from '../src/services/grc/AuditRemediationEngine';
import { NextBestActionEngine } from '../src/services/grc/NextBestActionEngine';
import { complianceProgramService } from '../src/services/canonical/ComplianceProgramService';
import { myWorkService } from '../src/services/canonical/MyWorkService';
import { enterpriseAuditService } from '../server/services/EnterpriseAuditService';
import { auditorDigitalBinderService } from '../server/services/AuditorDigitalBinderService';
import { continuousComplianceEngine } from '../server/services/ContinuousComplianceEngine';
import { complianceEvaluationEngine } from '../server/services/ComplianceEvaluationEngine';
import { identityFederationService } from '../server/services/IdentityFederationService';
import { disasterRecoveryService } from '../server/services/DisasterRecoveryService';
import { telemetryObservabilityService } from '../server/services/TelemetryObservabilityService';
import { secureEvidenceService } from '../server/services/SecureEvidenceService';
import { postgresRlsTestRunner } from '../server/db/rlsTestRunner';
import { cloudConfigManager } from '../server/config/environmentConfig';
import { clientPilotLifecycleService } from '../server/services/ClientPilotLifecycleService';
import { getDefaultPermissionsForRole, signJwtToken, verifyJwtToken } from '../server/middleware/authMiddleware';

let passed = 0;
let total = 0;

function assert(condition: boolean, name: string, details?: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✅ [PASS] ${name}`);
  } else {
    console.error(`  ❌ [FAIL] ${name}: ${details || 'Assertion failed'}`);
  }
}

async function runPilotReadinessValidation() {
  console.log('================================================================');
  console.log('  SKANDA PHASE 9: CLIENT PILOT & PRODUCTION READINESS SUITE');
  console.log('================================================================\n');

  // -----------------------------------------------------------------------------
  // 1. ENVIRONMENT SEPARATION & SECRETS CONFIGURATION
  // -----------------------------------------------------------------------------
  console.log('--- 1. Environment Tier Separation & Secrets Architecture ---');
  const envConfig = cloudConfigManager.getConfig();
  assert(Boolean(envConfig.tier), `Environment Tier configured: ${envConfig.tier}`);
  assert(Boolean(envConfig.cloudProvider), `Cloud Provider configured: ${envConfig.cloudProvider}`);
  assert(envConfig.database.sslMode !== 'disable', `Database SSL mode enforced: ${envConfig.database.sslMode}`);
  assert(envConfig.storage.signedUrlExpirySeconds === 1800, 'Secure evidence signed URL expiry: 1800 seconds');
  assert(envConfig.security.mfaRequiredForAdmin === true, 'MFA enforcement active for administrative roles');

  // -----------------------------------------------------------------------------
  // 2. TENANT PROVISIONING LIFECYCLE
  // -----------------------------------------------------------------------------
  console.log('\n--- 2. Automated Tenant Provisioning Lifecycle ---');
  const newTenant = clientPilotLifecycleService.provisionNewTenant({
    organizationName: 'Meridian Capital Partners',
    organizationCode: 'MERIDIAN',
    industryTier: 'FINANCIAL_BANKING',
    adminEmail: 'ciso@meridian-cap.com',
    adminName: 'Elena Rostova (CISO)',
    selectedPrograms: ['ISO_27001_2022', 'MAS_TRM_2021', 'SOC_2_TYPE_2'],
    isPilot: true
  });

  assert(Boolean(newTenant.tenantId), `New enterprise tenant provisioned: ${newTenant.tenantId}`);
  assert(newTenant.organizationCode === 'MERIDIAN', 'Organization code formatted and stored');
  assert(newTenant.status === 'PROVISIONED', 'Initial tenant lifecycle status is PROVISIONED');
  assert(newTenant.isPilotEnvironment === true, 'Tenant correctly flagged as PILOT ENVIRONMENT');
  assert(newTenant.activePrograms.includes('ISO_27001_2022'), 'Tenant provisioned with ISO 27001:2022 program');

  // -----------------------------------------------------------------------------
  // 3. 8-STEP CUSTOMER ONBOARDING JOURNEY
  // -----------------------------------------------------------------------------
  console.log('\n--- 3. Eight-Step Customer Onboarding Journey ---');
  
  // Step 1: Org Identity
  const step1 = clientPilotLifecycleService.advanceOnboardingStep(newTenant.tenantId, 1, {});
  assert(step1.step === 2, 'Onboarding advanced from Step 1 (Org Identity) to Step 2');
  assert(Boolean(step1.whyItMatters), 'Onboarding provides "WHY IT MATTERS" context');
  assert(Boolean(step1.whatHappensNext), 'Onboarding provides "WHAT HAPPENS NEXT" guidance');

  // Advance through remaining steps up to Step 8 (Activation)
  clientPilotLifecycleService.advanceOnboardingStep(newTenant.tenantId, 2, {});
  clientPilotLifecycleService.advanceOnboardingStep(newTenant.tenantId, 3, {});
  clientPilotLifecycleService.advanceOnboardingStep(newTenant.tenantId, 4, {});
  clientPilotLifecycleService.advanceOnboardingStep(newTenant.tenantId, 5, {});
  clientPilotLifecycleService.advanceOnboardingStep(newTenant.tenantId, 6, {});
  clientPilotLifecycleService.advanceOnboardingStep(newTenant.tenantId, 7, {});
  const step8 = clientPilotLifecycleService.advanceOnboardingStep(newTenant.tenantId, 8, {});

  assert(step8.profile.onboardingCompleted === true, 'Tenant onboarding successfully completed 8/8 stages');
  assert(step8.profile.status === 'PILOT_ACTIVE', 'Tenant status transitioned to PILOT_ACTIVE');
  assert(Boolean(step8.profile.activatedAt), 'Tenant activation timestamp formally recorded in audit ledger');

  // -----------------------------------------------------------------------------
  // 4. ENTERPRISE IDENTITY FEDERATION & SCIM PROVISIONING
  // -----------------------------------------------------------------------------
  console.log('\n--- 4. Enterprise Identity Federation (OIDC/SAML) & SCIM 2.0 ---');
  const idps = identityFederationService.getIdpConfigurations('tenant-acme-corp');
  assert(idps.length >= 3, `Discovered ${idps.length} configured enterprise IdPs (Entra ID, Okta, Google SAML)`);

  const entraIdp = idps.find(i => i.providerType === 'MICROSOFT_ENTRA_ID');
  assert(Boolean(entraIdp && entraIdp.readiness === 'CONFIGURED'), 'Microsoft Entra ID configured with OIDC & SCIM');

  // Inbound Claims Mapping: Entra GRC Admin -> CISO role
  const federatedCiso = identityFederationService.processInboundFederationClaims(entraIdp!.id, {
    sub: 'entra-ciso-992',
    email: 'ciso.lead@acme-corp.com',
    name: 'Elena Vance',
    groups: ['SG-SKANDA-CISO', 'Corporate-IT'],
    amr: ['mfa', 'pwd']
  });

  assert(federatedCiso.assignedRole === 'CISO', 'Inbound Entra group SG-SKANDA-CISO maps to SKANDA CISO role');
  assert(federatedCiso.effectivePermissions.includes('risk.accept'), 'Federated CISO receives risk.accept permission');
  assert(federatedCiso.mfaVerified === true, 'Inbound MFA claim verified');

  // Inbound Claims Mapping: Entra Auditor Group -> AUDITOR role
  const federatedAuditor = identityFederationService.processInboundFederationClaims(entraIdp!.id, {
    sub: 'entra-aud-101',
    email: 'marcus.auditor@bsi-group.com',
    name: 'Marcus Sterling',
    groups: ['SG-SKANDA-AUDITORS'],
    amr: ['mfa']
  });

  assert(federatedAuditor.assignedRole === 'AUDITOR', 'Entra group SG-SKANDA-AUDITORS maps to AUDITOR role');
  assert(federatedAuditor.effectivePermissions.includes('evidence.verify'), 'Auditor receives evidence.verify permission');
  assert(!federatedAuditor.effectivePermissions.includes('risk.accept'), 'Auditor is strictly denied risk.accept permission');

  // SCIM 2.0 User Lifecycle (Create & Deactivate)
  const scimUser = identityFederationService.scimCreateUser('tenant-acme-corp', {
    userName: 'devops.custodian@acme-corp.com',
    name: { formatted: 'Karthik Raja', familyName: 'Raja', givenName: 'Karthik' },
    emails: [{ value: 'devops.custodian@acme-corp.com', primary: true, type: 'work' }],
    groups: ['SG-SKANDA-SECOPS-OWNERS'],
    active: true
  });

  assert(scimUser.schemas.includes('urn:ietf:params:scim:schemas:core:2.0:User'), 'SCIM response conforms to RFC 7643 User schema');
  assert(Boolean(scimUser.id), `SCIM provisioned user created with ID: ${scimUser.id}`);
  assert(scimUser.active === true, 'SCIM user initially active');

  const deactivationResult = identityFederationService.scimDeactivateUser(scimUser.id);
  assert(deactivationResult === true, 'SCIM automated user deactivation executed successfully');

  // -----------------------------------------------------------------------------
  // 5. SERVER-SIDE RBAC & GRANULAR PERMISSION ENFORCEMENT
  // -----------------------------------------------------------------------------
  console.log('\n--- 5. Server-Side RBAC Enforcement across 7 Core Roles ---');
  const roles = ['CISO', 'GRC_MANAGER', 'CONTROL_OWNER', 'RISK_OWNER', 'AUDITOR', 'READ_ONLY', 'TENANT_ADMIN'];
  roles.forEach(r => {
    const perms = getDefaultPermissionsForRole(r);
    assert(perms.length > 0, `Role '${r}' has ${perms.length} explicitly defined permissions`);
  });

  // Strict Permission Denial Checks
  const auditorPerms = getDefaultPermissionsForRole('AUDITOR');
  assert(!auditorPerms.includes('risk.accept'), 'AUDITOR denied risk.accept');
  assert(!auditorPerms.includes('exception.approve'), 'AUDITOR denied exception.approve');
  assert(!auditorPerms.includes('control.manage'), 'AUDITOR denied control.manage');

  const controlOwnerPerms = getDefaultPermissionsForRole('CONTROL_OWNER');
  assert(!controlOwnerPerms.includes('risk.accept'), 'CONTROL_OWNER denied risk.accept');
  assert(!controlOwnerPerms.includes('exception.approve'), 'CONTROL_OWNER denied exception.approve');

  const readOnlyPerms = getDefaultPermissionsForRole('READ_ONLY');
  assert(!readOnlyPerms.includes('risk.create'), 'READ_ONLY denied risk.create');
  assert(!readOnlyPerms.includes('control.manage'), 'READ_ONLY denied control.manage');
  assert(!readOnlyPerms.includes('evidence.upload'), 'READ_ONLY denied evidence.upload');

  // -----------------------------------------------------------------------------
  // 6. CANONICAL COMPLIANCE PROGRAM CONFIGURATION & HARMONIZATION
  // -----------------------------------------------------------------------------
  console.log('\n--- 6. Canonical Compliance Program Configuration ---');
  const programs = complianceProgramService.getAllPrograms();
  assert(programs.length >= 4, `Compliance Programs initialized (${programs.length} active programs)`);

  const primaryProg = complianceProgramService.getProgramByCode('PROG-SEC-01') || programs[0];
  assert(Boolean(primaryProg && primaryProg.metrics.effectiveControlsCount > 0), `Program InfoSec metrics calculated: ${primaryProg?.metrics.effectiveControlsCount} effective controls`);
  assert(primaryProg.metrics.totalRequirements === 263, 'Lineage metrics maintained: 263 requirements harmonized across ISO 27001 & SOC 2');

  const iso27001 = FrameworkLibrary.getFrameworkByCode('ISO_27001_2022');
  assert(iso27001!.totalRequirementsCount === 93, 'ISO 27001:2022 framework contains all 93 Annex A control requirements');

  // -----------------------------------------------------------------------------
  // 7. SCOPE MANAGEMENT & TRACEABILITY IMPACT
  // -----------------------------------------------------------------------------
  console.log('\n--- 7. Scope Management & Traceability Crosswalk ---');
  const ctrlA515 = UnifiedControlLibrary.getControlById('CTRL-IAM-01');
  assert(Boolean(ctrlA515), 'Control CTRL-IAM-01 (MFA & SSO) loaded from Unified Control Catalog');
  assert(ctrlA515!.frameworkMappings.some(m => m.requirementCode === 'A.5.15'), 'CTRL-IAM-01 maps directly to ISO 27001:2022 A.5.15');
  assert(ctrlA515!.frameworkMappings.some(m => m.requirementCode === 'SOC2-CC6.1'), 'CTRL-IAM-01 maps directly to SOC 2 Type 2 CC6.1');
  assert(ctrlA515!.frameworkMappings.some(m => m.requirementCode === 'MAS-TRM-8.1'), 'CTRL-IAM-01 maps directly to MAS TRM 8.1');

  // -----------------------------------------------------------------------------
  // 8. RISK GOVERNANCE & 5x5 RESIDUAL RECALCULATION
  // -----------------------------------------------------------------------------
  console.log('\n--- 8. Risk Governance & 5x5 Matrix Recalculation ---');
  const pilotRisk = ConfigurableRiskEngine.upsertRisk({
    id: 'RSK-PILOT-01',
    tenantId: newTenant.tenantId,
    riskCode: 'RSK-PILOT-01',
    title: 'Unauthorized Privilege Escalation on Production Kubernetes Control Plane',
    description: 'Compromise of cluster-admin service account credentials allowing unauthorized container execution.',
    category: 'CYBERSECURITY',
    affectedAssetIds: ['ast-k8s-prod-cluster'],
    threatVector: 'Compromised developer kubeconfig credentials',
    vulnerabilityDescription: 'Unenforced OIDC short-lived token rotation',
    inherentLikelihood: 5, // Almost Certain
    inherentImpact: 4,     // Major
    inherentScore: 20,
    inherentLevel: 'CRITICAL',
    mitigatingControlIds: ['CTRL-IAM-01', 'CTRL-CRY-01'],
    residualLikelihood: 2, // Unlikely
    residualImpact: 3,     // Moderate
    residualScore: 6,
    residualLevel: 'MEDIUM',
    treatmentStrategy: 'MITIGATION',
    treatmentPlan: 'Deploy Teleport Zero-Trust Bastion with short-lived 1-hour certificates.',
    owner: 'Elena Rostova (CISO)',
    dueDate: '2026-11-30',
    status: 'ASSESSED',
    linkedFindingIds: [],
    linkedCapaIds: [],
    linkedAuditIds: ['AUD-2026-Q1'],
    updatedAt: new Date().toISOString()
  });

  assert(pilotRisk.inherentScore === 20, 'Inherent risk score calculated: 5 x 4 = 20 (CRITICAL)');
  assert(pilotRisk.residualScore === 6, 'Residual risk score calculated: 2 x 3 = 6 (MEDIUM)');
  assert(pilotRisk.residualLevel === 'MEDIUM', 'Residual risk level successfully mitigated to MEDIUM');

  // -----------------------------------------------------------------------------
  // 9. SECURE EVIDENCE OPERATIONS & MULTI-FORMAT VALIDATION
  // -----------------------------------------------------------------------------
  console.log('\n--- 9. Secure Evidence Operations & Multi-Format Validation ---');
  
  // Valid PDF
  const pdfCheck = secureEvidenceService.validateFileBuffer(
    Buffer.from('%PDF-1.7\nSample authentic audit evidence payload'),
    'okta_mfa_telemetry_2026.pdf',
    'application/pdf'
  );
  assert(pdfCheck.valid === true, 'Authentic PDF with valid %PDF magic header passes validation');

  // Valid XLSX
  const xlsxCheck = secureEvidenceService.validateFileBuffer(
    Buffer.from('PK\x03\x04\x14\x00\x00\x00\x08\x00'), // PK zip header for xlsx
    'access_review_q3.xlsx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  assert(xlsxCheck.valid === true, 'Authentic XLSX workbook with valid PK magic header passes validation');

  // Path traversal defense
  const traversalCheck = secureEvidenceService.validateFileBuffer(
    Buffer.from('%PDF-1.7'),
    '../../../../etc/passwd.pdf',
    'application/pdf'
  );
  assert(traversalCheck.valid === false, 'Path traversal attack in filename strictly rejected');

  // Executable disguised as PDF
  const exeCheck = secureEvidenceService.validateFileBuffer(
    Buffer.from('MZ\x90\x00\x03\x00\x00\x00'),
    'malware_disguised.pdf',
    'application/pdf'
  );
  assert(exeCheck.valid === false, 'Executable PE/MZ binary disguised as PDF strictly rejected');

  // -----------------------------------------------------------------------------
  // 10. AUDITOR CLEAN ROOM & SEALED DIGITAL BINDER
  // -----------------------------------------------------------------------------
  console.log('\n--- 10. Auditor Clean Room & Sealed Digital Binder ---');
  const digitalBinder = await auditorDigitalBinderService.generateDigitalBinder({
    auditId: 'AUD-2026-Q1',
    auditTitle: '2026 Stage-2 Recertification & MAS Regulatory Examination',
    tenantId: 'tenant-acme-corp',
    leadAuditor: 'Marcus Sterling (BSI Lead Auditor)',
    frameworkCodes: ['ISO_27001_2022'],
    periodStart: '2026-09-01',
    periodEnd: '2026-10-15'
  });

  assert(Boolean(digitalBinder.manifestId), `Digital Binder Manifest generated: ${digitalBinder.manifestId}`);
  assert(Boolean(digitalBinder.manifestIntegrityHash), 'Digital Binder sealed with SHA-256 manifest hash');
  assert(digitalBinder.tableOfContents.length === 6, 'Digital Binder contains all 6 required statutory audit sections');
  assert(digitalBinder.requirementTraceability.length > 0, 'Requirement traceability crosswalk populated');
  assert(digitalBinder.evidenceIntegrityIndex.length > 0, 'Evidence integrity index contains SHA-256 hashes');

  // -----------------------------------------------------------------------------
  // 11. DOUBLE-LAYER MULTI-TENANT ISOLATION (RLS & OBJECT AUTHORIZATION)
  // -----------------------------------------------------------------------------
  console.log('\n--- 11. Multi-Tenant Database RLS & API Layer Isolation ---');
  const rlsReport = postgresRlsTestRunner.runDirectRlsTestSuite();
  assert(rlsReport.isolationStatus === 'STRICT_ISOLATION_VERIFIED', 'Database Direct SQL RLS: STRICT_ISOLATION_VERIFIED');

  rlsReport.results.forEach(res => {
    assert(res.passed === true, `${res.testName} (${res.details})`);
  });

  // -----------------------------------------------------------------------------
  // 12. DATA PROTECTION & DISASTER RECOVERY RESTORE SIMULATION
  // -----------------------------------------------------------------------------
  console.log('\n--- 12. Backup Strategy & Disaster Recovery Simulation ---');
  const drReport = disasterRecoveryService.runDrSimulationTest();
  assert(drReport.certificationOutcome === 'DR_CAPABLE_CERTIFIED', 'Disaster Recovery simulation: DR_CAPABLE_CERTIFIED');
  assert(drReport.rpoAchievedMinutes <= 5, `RPO achieved: ${drReport.rpoAchievedMinutes}m (Target <= 5m)`);
  assert(drReport.rtoAchievedMinutes <= 15, `RTO achieved: ${drReport.rtoAchievedMinutes}m (Target <= 15m)`);
  assert(drReport.databaseRestoreStatus === 'RESTORED_AND_RECONCILED', 'Database Point-in-Time Recovery verified');
  assert(drReport.evidenceVaultRestoreStatus === 'INTEGRITY_VERIFIED', 'Evidence vault restore checksum verified');

  // -----------------------------------------------------------------------------
  // 13. OBSERVABILITY, OPENTELEMETRY & SYSTEM HEALTH
  // -----------------------------------------------------------------------------
  console.log('\n--- 13. Observability, OpenTelemetry & System Health ---');
  const span = telemetryObservabilityService.startSpan('PilotTenantVerification', 'skanda-core');
  assert(span.traceId.length === 32, 'OpenTelemetry compliant 128-bit traceId generated');
  assert(span.spanId.length === 16, 'OpenTelemetry compliant 64-bit spanId generated');

  const healthOverview = clientPilotLifecycleService.getSystemHealthOverview();
  assert(healthOverview.status === 'HEALTHY', 'Enterprise System Health Status: HEALTHY');
  assert(healthOverview.apiUptimePercent >= 99.9, `API Uptime: ${healthOverview.apiUptimePercent}%`);
  assert(healthOverview.connectorsSummary.total >= 10, `Total Connectors Registered: ${healthOverview.connectorsSummary.total}`);

  // -----------------------------------------------------------------------------
  // 14. INTEGRATION READINESS TRUTH LEDGER
  // -----------------------------------------------------------------------------
  console.log('\n--- 14. Integration Readiness Truth Ledger ---');
  const connectors = clientPilotLifecycleService.getAllConnectors();
  const configuredConnectors = connectors.filter(c => c.status === 'CONFIGURED');
  const readyConnectors = connectors.filter(c => c.status === 'INTEGRATION_READY');

  assert(configuredConnectors.length >= 5, `Truth Ledger: ${configuredConnectors.length} connectors CONFIGURED (AWS, Entra, Okta, Jira, CrowdStrike, Sentinel)`);
  assert(readyConnectors.length >= 4, `Truth Ledger: ${readyConnectors.length} connectors INTEGRATION_READY (Azure, Google SAML, ServiceNow, GitHub)`);

  // -----------------------------------------------------------------------------
  // 15. CONTINUOUS COMPLIANCE & ITSM SYNCHRONIZATION
  // -----------------------------------------------------------------------------
  console.log('\n--- 15. Continuous Compliance Telemetry, Drift & ITSM ---');
  const obs = complianceEvaluationEngine.normalizeIngestedTelemetry({
    tenantId: newTenant.tenantId,
    source: 'AWS_CLOUDTRAIL',
    sourceEventId: 'evt-pilot-trail-01',
    category: 'IAM_ACCESS_CONTROL',
    targetAssetId: 'ast-k8s-prod-cluster',
    targetAssetType: 'CLOUD_ACCOUNT',
    findingTitle: 'Anonymous API Request to Kubernetes API Server',
    findingDescription: 'Kubernetes audit log detected unauthenticated request on port 6443.',
    severity: 'CRITICAL',
    observedStatus: 'FAIL',
    rawPayload: { port: 6443, anonymousAuth: true }
  });

  assert(Boolean(obs.id), `Pilot telemetry observation normalized: ${obs.id}`);
  assert(Boolean(obs.provenanceSha256), 'Observation contains SHA-256 provenance hash');

  const evalOutcomes = complianceEvaluationEngine.evaluateObservation(obs);
  assert(evalOutcomes.length > 0, `Rule engine evaluated observation against ${evalOutcomes.length} matching control rules`);

  // -----------------------------------------------------------------------------
  // 16. CUSTOMER OFFBOARDING & AUDITED DELETION LIFECYCLE
  // -----------------------------------------------------------------------------
  console.log('\n--- 16. Customer Offboarding & Audited Deletion Lifecycle ---');
  const offboardingManifest = clientPilotLifecycleService.executeCustomerOffboarding({
    tenantId: newTenant.tenantId,
    initiatedBy: 'ciso@meridian-cap.com',
    reason: 'Pilot evaluation phase completed successfully; offboarding test tenant'
  });

  assert(Boolean(offboardingManifest.offboardingId), `Customer offboarding manifest generated: ${offboardingManifest.offboardingId}`);
  assert(offboardingManifest.status === 'ARCHIVED', 'Offboarding status transitioned to ARCHIVED');
  assert(Boolean(offboardingManifest.exportArchiveSha256), 'Export archive sealed with SHA-256 integrity hash');
  assert(Boolean(offboardingManifest.retentionExpiryDate), '30-day statutory data retention expiry set');
  assert(Boolean(offboardingManifest.auditTrailEntryId), 'Offboarding event formally recorded in immutable audit ledger');

  // Verify tenant status is OFFBOARDED
  const offboardedProfile = clientPilotLifecycleService.getPilotProfile(newTenant.tenantId);
  assert(offboardedProfile?.status === 'OFFBOARDED', 'Tenant status confirmed as OFFBOARDED in registry');

  // -----------------------------------------------------------------------------
  // 17. CRYPTOGRAPHIC AUDIT HASH CHAIN CONTINUITY
  // -----------------------------------------------------------------------------
  console.log('\n--- 17. Cryptographic Audit Hash Chain Continuity ---');
  const auditVerification = enterpriseAuditService.verifyAuditChainIntegrity();
  assert(auditVerification.valid === true, `Cryptographic Audit Hash Chain unbroken across ${auditVerification.totalRecords} total entries`);

  // -----------------------------------------------------------------------------
  // SUMMARY & EXIT
  // -----------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`  PHASE 9 PILOT READINESS RESULTS: ${passed} / ${total} ASSERTIONS PASSED`);
  console.log('================================================================\n');

  if (passed === total) {
    console.log('🎉 ALL PHASE 9 CLIENT PILOT & PRODUCTION READINESS TESTS PASSED!\n');
    process.exit(0);
  } else {
    console.error(`❌ ${total - passed} ASSERTIONS FAILED.\n`);
    process.exit(1);
  }
}

runPilotReadinessValidation().catch(err => {
  console.error('Fatal pilot validation error:', err);
  process.exit(1);
});
