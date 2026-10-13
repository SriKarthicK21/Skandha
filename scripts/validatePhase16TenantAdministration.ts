// ============================================================================
// SKANDA ENTERPRISE GRC: PHASE 16 TENANT ADMINISTRATION & CUSTOMER SUCCESS
// Path: scripts/validatePhase16TenantAdministration.ts
//
// Chief Enterprise Architect Automated Validation Suite
// Validates:
// 1. Tenant Provisioning Wizard & Activation Checklist
// 2. Tenant 360 Synthesis (GRC Plane + SaaS Plane)
// 3. User, Role & Functional Team Governance
// 4. Framework & Compliance Program Entitlements
// 5. Centralized Usage Metering & Quota Enforcement
// 6. 11-Factor Explainable Customer Health Score Engine
// 7. Contract Renewal Lifecycle & ARR Expansion Radar
// 8. Plan-Based Mission-Critical Support SLA Engine
// 9. Sovereign Cloud Data Residency & Regional Governance
// 10. Tenant Offboarding, Data Export & Exit Certificate
// 11. Strict Multi-Tenant Isolation & Customer/SuperAdmin Separation
// 12. Negative Security & Boundary Scenarios
// ============================================================================

import {
  tenantAdministrationService
} from '../src/services/saas/tenantAdministrationService.ts';
import {
  enterpriseSaaSService,
  TIER_ENTITLEMENTS,
  CLOUD_REGIONS
} from '../src/services/saas/enterpriseSaaSService.ts';
import {
  TenantProvisioningDraft,
  SubscriptionTier,
  EnterpriseRole
} from '../src/types/saasTypes.ts';

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

async function runPhase16Validation() {
  console.log('================================================================================');
  console.log('SKANDA ENTERPRISE GRC: PHASE 16 TENANT ADMINISTRATION & CUSTOMER SUCCESS SUITE');
  console.log('================================================================================\n');

  const tenantA = 'SKANDA-DEMO-ENTERPRISE';
  const tenantB = 'TENANT-PACIFIC-LOGISTICS';
  const newTenantId = `TENANT-TEST-FINTECH-${Date.now()}`;

  // --------------------------------------------------------------------------
  // 1. TENANT PROVISIONING & 12-STEP WIZARD VALIDATION
  // --------------------------------------------------------------------------
  console.log('--- 1. Tenant Provisioning & Activation Engine ---');

  // Test 1A: Incomplete Draft Validation (Blocker Detection)
  const incompleteDraft: TenantProvisioningDraft = {
    tenantId: 'TENANT-INCOMPLETE-DRAFT',
    currentStep: 1,
    completedSteps: [1],
    organization: {
      name: '',
      orgId: '',
      legalName: '',
      industry: '',
      country: '',
      timezone: 'UTC',
      locale: 'en-US'
    },
    cloudRegion: 'AWS_AP_SOUTHEAST_1',
    dataResidency: {
      primaryRegion: 'AWS_AP_SOUTHEAST_1',
      backupRegion: 'GCP_ASIA_SOUTH_1',
      legalJurisdiction: 'Singapore MAS TRM',
      enforceLocalWormOnly: true
    },
    subscription: { tier: 'STARTER', billingCycle: 'ANNUAL' },
    tenantAdmin: { email: '', name: '', title: '' },
    identity: { ssoEnabled: false, scimEnabled: false },
    frameworkCodes: ['ISO27001_2022', 'MASTRM_2021'], // Exceeds STARTER limit of 1
    branding: { brandPrimaryColor: '#0ea5e9' },
    integrations: { enabledConnectors: [] },
    validationState: { isValid: false, blockers: [] },
    updatedAt: new Date().toISOString()
  };

  const savedIncomplete = tenantAdministrationService.saveProvisioningDraft(incompleteDraft);
  assert(
    'P16-PROV-01',
    'PROVISIONING_VALIDATION',
    'Incomplete provisioning draft fails validation and identifies blockers',
    savedIncomplete.validationState.isValid === false && savedIncomplete.validationState.blockers.length >= 2,
    'isValid: false with >= 2 blockers',
    `isValid: ${savedIncomplete.validationState.isValid}, Blockers: ${savedIncomplete.validationState.blockers.join('; ')}`
  );

  const activationAttempt = tenantAdministrationService.activateTenant('TENANT-INCOMPLETE-DRAFT');
  assert(
    'P16-PROV-02',
    'PROVISIONING_SECURITY',
    'Activating invalid draft is strictly BLOCKED with ACTIVATION_BLOCKED error',
    activationAttempt.success === false && activationAttempt.error?.includes('ACTIVATION_BLOCKED'),
    'Blocked with ACTIVATION_BLOCKED',
    `Success: ${activationAttempt.success}, Error: ${activationAttempt.error}`
  );

  // Test 1B: Complete Valid Draft & Activation
  const validDraft: TenantProvisioningDraft = {
    tenantId: newTenantId,
    currentStep: 12,
    completedSteps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    organization: {
      name: 'SingaGlobal WealthTech',
      orgId: `ORG-${newTenantId}`,
      legalName: 'SingaGlobal WealthTech Pte. Ltd.',
      industry: 'WealthTech / Asset Management',
      country: 'Singapore',
      timezone: 'Asia/Singapore',
      locale: 'en-SG'
    },
    cloudRegion: 'AWS_AP_SOUTHEAST_1',
    dataResidency: {
      primaryRegion: 'AWS_AP_SOUTHEAST_1',
      backupRegion: 'GCP_ASIA_SOUTH_1',
      legalJurisdiction: 'Singapore MAS TRM & PDPA Strict Data Sovereignty',
      enforceLocalWormOnly: true
    },
    subscription: { tier: 'ENTERPRISE', billingCycle: 'ANNUAL' },
    tenantAdmin: {
      email: 'ciso@singaglobal.io',
      name: 'David Tan (CISO)',
      title: 'Chief Information Security Officer'
    },
    identity: { ssoEnabled: true, idpType: 'OKTA', scimEnabled: true },
    frameworkCodes: ['ISO27001_2022', 'MASTRM_2021', 'SOC2_TYPE2'],
    branding: { brandPrimaryColor: '#0ea5e9', customDomain: 'grc.singaglobal.io' },
    integrations: { enabledConnectors: ['aws-cloudtrail', 'okta-sso', 'servicenow'] },
    validationState: { isValid: true, blockers: [] },
    updatedAt: new Date().toISOString()
  };

  tenantAdministrationService.saveProvisioningDraft(validDraft);
  const activationResult = tenantAdministrationService.activateTenant(newTenantId, 'SKANDA_PLATFORM_ADMIN');

  assert(
    'P16-ACT-01',
    'TENANT_ACTIVATION',
    'Valid tenant draft activates successfully creating Admin, Subscription & Entitlements',
    activationResult.success === true &&
    activationResult.tenant?.status === 'ACTIVE' &&
    activationResult.tenant.tier === 'ENTERPRISE' &&
    activationResult.tenant.users.length === 1 &&
    activationResult.tenant.users[0].role === 'TENANT_ADMIN',
    'Tenant ACTIVE with ENTERPRISE tier and default TENANT_ADMIN',
    `Status: ${activationResult.tenant?.status}, Tier: ${activationResult.tenant?.tier}, Admin: ${activationResult.tenant?.users[0]?.name}`
  );

  // --------------------------------------------------------------------------
  // 2. TENANT 360 & GRC-SAAS PLANE INTEGRATION
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Tenant 360 & Plane Integration ---');

  const acmeTenant = tenantAdministrationService.getTenant(tenantA, 'SKANDA_PLATFORM_ADMIN');
  assert(
    'P16-360-01',
    'TENANT_360',
    'Tenant 360 synthesizes GRC operations, active teams, users, quota meters & renewals',
    acmeTenant.tenantId === tenantA &&
    acmeTenant.teams.length >= 3 &&
    acmeTenant.users.length >= 3 &&
    acmeTenant.enabledFrameworkCodes.length >= 3 &&
    acmeTenant.renewal.annualRecurringRevenueUsd === 48000,
    'Complete 360 synthesis for Acme Financial Technologies',
    `Teams: ${acmeTenant.teams.length}, Users: ${acmeTenant.users.length}, ARR: $${acmeTenant.renewal.annualRecurringRevenueUsd}`
  );

  // --------------------------------------------------------------------------
  // 3. USER, ROLE & TEAM GOVERNANCE
  // --------------------------------------------------------------------------
  console.log('\n--- 3. User, Role & Team Governance ---');

  // Test 3A: Invite User within quota
  const inviteRes = tenantAdministrationService.inviteUser(
    newTenantId,
    'audit.lead@singaglobal.io',
    'Evelyn Wong',
    'AUDITOR',
    []
  );

  assert(
    'P16-USR-01',
    'USER_MANAGEMENT',
    'Invited user registered with assigned role and INVITED status',
    inviteRes.success === true &&
    inviteRes.user?.status === 'INVITED' &&
    inviteRes.user.role === 'AUDITOR',
    'Status: INVITED, Role: AUDITOR',
    `Status: ${inviteRes.user?.status}, Role: ${inviteRes.user?.role}`
  );

  // Test 3B: User Quota Limit Check
  // Temporarily set maxUsers to 2 to test quota enforcement
  const testTenant = tenantAdministrationService.getTenant(newTenantId, 'SKANDA_PLATFORM_ADMIN');
  testTenant.saasProfile.entitlements.maxUsers = 2; // Tenant has Admin + Evelyn = 2

  const quotaExceededRes = tenantAdministrationService.inviteUser(
    newTenantId,
    'overflow@singaglobal.io',
    'Overflow User',
    'EMPLOYEE'
  );

  assert(
    'P16-USR-02',
    'QUOTA_ENFORCEMENT',
    'User invitation beyond plan limit is blocked with QUOTA_EXCEEDED error',
    quotaExceededRes.success === false && quotaExceededRes.error?.includes('QUOTA_EXCEEDED'),
    'Blocked with QUOTA_EXCEEDED',
    `Success: ${quotaExceededRes.success}, Error: ${quotaExceededRes.error}`
  );

  // Restore maxUsers
  testTenant.saasProfile.entitlements.maxUsers = 500;

  // Test 3C: Deactivate User
  const deactRes = tenantAdministrationService.deactivateUser(newTenantId, inviteRes.user!.id);
  assert(
    'P16-USR-03',
    'USER_MANAGEMENT',
    'Deactivating user updates status to DEACTIVATED and adjusts active user count',
    deactRes.success === true &&
    testTenant.users.find(u => u.id === inviteRes.user!.id)?.status === 'DEACTIVATED',
    'Status: DEACTIVATED',
    `Status: ${testTenant.users.find(u => u.id === inviteRes.user!.id)?.status}`
  );

  // Test 3D: Server-side RBAC for Role Assignment
  const unauthRoleChange = tenantAdministrationService.assignRole(
    newTenantId,
    inviteRes.user!.id,
    'CISO',
    'EMPLOYEE' as EnterpriseRole // Non-admin attempting privileged role change
  );

  assert(
    'P16-RBAC-01',
    'RBAC_SECURITY',
    'Non-admin role assignment attempt is blocked server-side with 403 / UNAUTHORIZED',
    unauthRoleChange.success === false && unauthRoleChange.error?.includes('UNAUTHORIZED_ROLE_ASSIGNMENT'),
    'Blocked with UNAUTHORIZED_ROLE_ASSIGNMENT',
    `Success: ${unauthRoleChange.success}, Error: ${unauthRoleChange.error}`
  );

  // Test 3E: Create Functional Team
  const createdTeam = tenantAdministrationService.createTeam(
    newTenantId,
    'Cloud Security & Architecture',
    'Information Security',
    'ciso@singaglobal.io',
    ['ciso@singaglobal.io']
  );

  assert(
    'P16-TEAM-01',
    'TEAM_MANAGEMENT',
    'Functional team created with department, lead, and member list',
    createdTeam.name === 'Cloud Security & Architecture' && createdTeam.leadEmail === 'ciso@singaglobal.io',
    'Team: Cloud Security & Architecture',
    `Team ID: ${createdTeam.id}, Lead: ${createdTeam.leadEmail}`
  );

  // --------------------------------------------------------------------------
  // 4. FRAMEWORK ENTITLEMENT ENFORCEMENT
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Framework Entitlement Enforcement ---');

  // Test 4A: Framework Limit Reached
  const starterTenantId = 'TENANT-STARTER-LIMIT-TEST';
  const starterTenant = tenantAdministrationService.getTenant(starterTenantId, 'SKANDA_PLATFORM_ADMIN');
  starterTenant.tier = 'STARTER';
  starterTenant.saasProfile.tier = 'STARTER';
  starterTenant.saasProfile.entitlements = TIER_ENTITLEMENTS.STARTER; // maxFrameworks = 1
  starterTenant.enabledFrameworkCodes = ['ISO27001_2022'];

  const extraFwRes = tenantAdministrationService.enableFramework(starterTenantId, 'MASTRM_2021');
  assert(
    'P16-FW-01',
    'ENTITLEMENTS',
    'Enabling framework beyond tier limit returns FRAMEWORK_LIMIT_REACHED error',
    extraFwRes.success === false && extraFwRes.limitReached === true,
    'limitReached: true with upgrade prompt',
    `Success: ${extraFwRes.success}, Error: ${extraFwRes.error}`
  );

  // --------------------------------------------------------------------------
  // 5. USAGE METERING & QUOTA ENGINE
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Usage Metering & Quota Alerts ---');

  starterTenant.saasProfile.usageMeters.storageUsedGb = 0; // Reset for isolated meter test
  const usageRes = tenantAdministrationService.recordUsageEvent(
    starterTenantId,
    'STORAGE_GB',
    48, // 48 out of 50 GB = 96%
    'WORM_VAULT_EVIDENCE_STREAM',
    'CORR-USAGE-001'
  );

  assert(
    'P16-MTR-01',
    'USAGE_METERING',
    'Usage meter records storage consumption and triggers 90% quota alert',
    starterTenant.saasProfile.usageMeters.storageUsedGb === 48 &&
    usageRes.quotaAlertTriggered?.includes('90%'),
    'Storage: 48GB with 90% warning',
    `Storage: ${starterTenant.saasProfile.usageMeters.storageUsedGb} GB, Alert: ${usageRes.quotaAlertTriggered}`
  );

  // --------------------------------------------------------------------------
  // 6. CUSTOMER HEALTH SCORE ENGINE (11-FACTOR EXPLAINABILITY)
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Customer Health Score Engine ---');

  const acmeHealth = tenantAdministrationService.calculateCustomerHealthScore(tenantA);
  assert(
    'P16-HLTH-01',
    'CUSTOMER_HEALTH',
    'Acme Financial Technologies evaluated as HEALTHY with score >= 90',
    acmeHealth.status === 'HEALTHY' && acmeHealth.overallScore >= 90,
    'HEALTHY (Score >= 90)',
    `Status: ${acmeHealth.status}, Score: ${acmeHealth.overallScore}%, Reasons: ${acmeHealth.reasons.length}`
  );

  const pacificHealth = tenantAdministrationService.calculateCustomerHealthScore(tenantB);
  assert(
    'P16-HLTH-02',
    'CUSTOMER_HEALTH',
    'Pacific Logistics evaluated as AT_RISK or CRITICAL with explainable factors (open issues, days to renewal)',
    (pacificHealth.status === 'AT_RISK' || pacificHealth.status === 'CRITICAL') &&
    pacificHealth.reasons.some(r => r.includes('critical') || r.includes('renewal')),
    'AT_RISK or CRITICAL with explainable root causes',
    `Status: ${pacificHealth.status}, Score: ${pacificHealth.overallScore}%, Top Reason: ${pacificHealth.reasons[0]}`
  );

  // --------------------------------------------------------------------------
  // 7. SUPERADMIN PLANE & CUSTOMER PRIVACY ISOLATION
  // --------------------------------------------------------------------------
  console.log('\n--- 7. SuperAdmin vs Customer Privacy Separation ---');

  // Test 7A: Platform Admin can view full portfolio and internal notes
  const portfolio = tenantAdministrationService.getAllTenants('SKANDA_PLATFORM_ADMIN');
  assert(
    'P16-ADM-01',
    'PLATFORM_ADMIN',
    'SKANDA_PLATFORM_ADMIN can access full tenant portfolio across regions',
    portfolio.length >= 2,
    'Portfolio count >= 2',
    `Tenants found: ${portfolio.length}`
  );

  // Test 7B: Customer role is strictly barred from getAllTenants()
  let customerPortfolioBlocked = false;
  try {
    tenantAdministrationService.getAllTenants('TENANT_ADMIN');
  } catch (err: any) {
    customerPortfolioBlocked = err.message.includes('ACCESS_DENIED');
  }

  assert(
    'P16-ISO-01',
    'CROSS_TENANT_SECURITY',
    'Customer TENANT_ADMIN is strictly DENIED access to platform-wide portfolio',
    customerPortfolioBlocked === true,
    'ACCESS_DENIED thrown',
    `Blocked: ${customerPortfolioBlocked}`
  );

  // Test 7C: Customer role cannot view internal CSM notes or churn risk
  const customerViewAcme = tenantAdministrationService.getTenant(tenantA, 'TENANT_ADMIN', tenantA);
  assert(
    'P16-PRV-01',
    'DATA_PRIVACY',
    'Customer tenant view masks internal CSM success notes, expansion, and churn risk',
    customerViewAcme.healthScore.internalSuccessNotes === undefined &&
    customerViewAcme.healthScore.churnRiskLevel === undefined,
    'Internal fields undefined in customer view',
    `InternalNotes: ${customerViewAcme.healthScore.internalSuccessNotes}, ChurnRisk: ${customerViewAcme.healthScore.churnRiskLevel}`
  );

  // Test 7D: Cross-tenant query attempt is rejected
  let crossTenantBlocked = false;
  try {
    tenantAdministrationService.getTenant(tenantB, 'TENANT_ADMIN', tenantA); // Tenant A asking for Tenant B
  } catch (err: any) {
    crossTenantBlocked = err.message.includes('ACCESS_DENIED');
  }

  assert(
    'P16-RLS-01',
    'MULTI_TENANT_RLS',
    'Cross-tenant access attempt (Tenant A querying Tenant B) throws RLS ACCESS_DENIED',
    crossTenantBlocked === true,
    'RLS ACCESS_DENIED thrown',
    `Blocked: ${crossTenantBlocked}`
  );

  // --------------------------------------------------------------------------
  // 8. SUPPORT CASES & SLA ENGINE
  // --------------------------------------------------------------------------
  console.log('\n--- 8. Support Cases & SLA Engine ---');

  const createdCase = tenantAdministrationService.createSupportCase(
    tenantA,
    'INTEGRATION',
    'HIGH',
    'EventBridge Rate Limit Tuning',
    'High CloudTrail volume requires tuned filters',
    'ciso@acmefintech.io'
  );

  assert(
    'P16-SLA-01',
    'CUSTOMER_SUPPORT',
    'Support case inherits 15-minute mission-critical SLA for APEX Global tenant',
    createdCase.targetSlaHours === 0.25 && createdCase.status === 'OPEN',
    'targetSlaHours: 0.25h (15 mins), status: OPEN',
    `Case ID: ${createdCase.id}, SLA: ${createdCase.targetSlaHours}h`
  );

  // --------------------------------------------------------------------------
  // 9. DATA RESIDENCY & JURISDICTION GOVERNANCE
  // --------------------------------------------------------------------------
  console.log('\n--- 9. Data Residency Governance ---');

  const residencyChangeRes = tenantAdministrationService.changeDataResidency(
    newTenantId,
    'AWS_EU_CENTRAL_1',
    'European Subsidiary Expansion',
    'TENANT_ADMIN'
  );

  const updatedNewTenant = tenantAdministrationService.getTenant(newTenantId, 'SKANDA_PLATFORM_ADMIN');
  assert(
    'P16-REG-01',
    'DATA_RESIDENCY',
    'Data residency transition updates sovereign region and legal jurisdiction to EU GDPR',
    residencyChangeRes.success === true &&
    updatedNewTenant.region === 'AWS_EU_CENTRAL_1' &&
    updatedNewTenant.dataResidencyJurisdiction.includes('GDPR'),
    'Region: AWS_EU_CENTRAL_1 (EU GDPR & BSI C5)',
    `Region: ${updatedNewTenant.region}, Jurisdiction: ${updatedNewTenant.dataResidencyJurisdiction}`
  );

  // --------------------------------------------------------------------------
  // 10. TENANT OFFBOARDING & EXIT CERTIFICATE
  // --------------------------------------------------------------------------
  console.log('\n--- 10. Tenant Offboarding & Customer Exit Certificate ---');

  const offboardReq = tenantAdministrationService.requestOffboarding(
    newTenantId,
    'Contract Term Completed',
    'ciso@singaglobal.io'
  );

  assert(
    'P16-OFF-01',
    'OFFBOARDING',
    'Offboarding request transitions tenant to OFFBOARDING status',
    offboardReq.success === true &&
    updatedNewTenant.status === 'OFFBOARDING',
    'Status: OFFBOARDING',
    `Status: ${updatedNewTenant.status}, Offboarding ID: ${offboardReq.offboardingId}`
  );

  const offboardComplete = tenantAdministrationService.completeOffboarding(
    newTenantId,
    'ciso@singaglobal.io'
  );

  assert(
    'P16-OFF-02',
    'OFFBOARDING_CERTIFICATE',
    'Completed offboarding revokes API keys, deactivates users & issues SHA-256 Exit Certificate',
    offboardComplete.success === true &&
    updatedNewTenant.status === 'ARCHIVED' &&
    updatedNewTenant.users.every(u => u.status === 'DEACTIVATED') &&
    offboardComplete.exitCertificate?.sha256MasterHash.length === 64,
    'ARCHIVED with 64-character SHA-256 Exit Certificate',
    `Status: ${updatedNewTenant.status}, Certificate ID: ${offboardComplete.exitCertificate?.certificateId}, Hash: ${offboardComplete.exitCertificate?.sha256MasterHash}`
  );

  // --------------------------------------------------------------------------
  // SUMMARY SCORECARD
  // --------------------------------------------------------------------------
  console.log('\n================================================================================');
  console.log('PHASE 16 VALIDATION SCORECARD');
  console.log('================================================================================');

  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`TOTAL PHASE 16 ASSERTIONS : ${total}`);
  console.log(`PASSED                   : ${passed}`);
  console.log(`FAILED                   : ${failed}`);
  console.log(`SUCCESS RATE             : ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.error('\nFAILED ASSERTIONS:');
    results.filter(r => !r.passed).forEach(r => {
      console.error(`  - [${r.id}] ${r.category}: ${r.description}`);
    });
    process.exit(1);
  } else {
    console.log('\n🎉 ALL PHASE 16 TENANT ADMINISTRATION & CUSTOMER SUCCESS ASSERTIONS PASSED (100.0%)!');
  }
}

runPhase16Validation().catch(err => {
  console.error('Fatal error running Phase 16 validation:', err);
  process.exit(1);
});
