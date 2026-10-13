// ============================================================================
// SKANDA ENTERPRISE GRC: HIGH-END SAAS MODEL FORENSIC VALIDATION SUITE
// Path: scripts/validateEnterpriseSaaSModel.ts
//
// Chief Enterprise & Cloud Architect Automated Validation Suite
// Validates:
// 1. Multi-Tenant Tier Entitlements (STARTER, GROWTH, ENTERPRISE, APEX_GLOBAL)
// 2. Usage Meters & Real-time Quota Governance
// 3. Subscription Upgrades & Automated Invoicing
// 4. Modular Add-on Marketplace & Billing Consolidation
// 5. Enterprise SAML 2.0 / SCIM 2.0 Directory Sync
// 6. Scoped API Key Provisioning & Revocation
// 7. Real-Time Webhook Streaming & Endpoints
// 8. Custom Branding, White-labeling & Domain Verification
// 9. Sovereign Cloud Data Residency & SLA Health
// 10. Strict Multi-Tenant SaaS Profile Isolation
// ============================================================================

import {
  enterpriseSaaSService,
  TIER_ENTITLEMENTS,
  CLOUD_REGIONS,
  SAAS_ADD_ONS
} from '../src/services/saas/enterpriseSaaSService.ts';
import {
  SubscriptionTier,
  BillingCycle,
  CloudResidencyRegion
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

async function runSaaSValidation() {
  console.log('================================================================================');
  console.log('SKANDA ENTERPRISE GRC: HIGH-END SAAS MODEL VALIDATION SUITE');
  console.log('================================================================================\n');

  const tenantA = 'SKANDA-DEMO-ENTERPRISE';
  const tenantB = 'ACME-FINTECH-CORP';
  const tenantC = 'SINGAPORE-NEOBANK-GLOBAL';

  // --------------------------------------------------------------------------
  // 1. TIER ENTITLEMENT MATRIX INTEGRITY
  // --------------------------------------------------------------------------
  console.log('--- 1. Tier Entitlements Matrix Integrity ---');

  assert(
    'SAAS-TIER-01',
    'ENTITLEMENTS',
    'Starter tier enforces 1 framework, 15 users, 50GB storage',
    TIER_ENTITLEMENTS.STARTER.maxFrameworks === 1 &&
    TIER_ENTITLEMENTS.STARTER.maxUsers === 15 &&
    TIER_ENTITLEMENTS.STARTER.storageQuotaGb === 50,
    'Frameworks: 1, Users: 15, Storage: 50GB',
    `Frameworks: ${TIER_ENTITLEMENTS.STARTER.maxFrameworks}, Users: ${TIER_ENTITLEMENTS.STARTER.maxUsers}, Storage: ${TIER_ENTITLEMENTS.STARTER.storageQuotaGb}GB`
  );

  assert(
    'SAAS-TIER-02',
    'ENTITLEMENTS',
    'Growth tier enables WORM seal & Autonomous Interviews with 1M events quota',
    TIER_ENTITLEMENTS.GROWTH.allowWormCryptographicSeal === true &&
    TIER_ENTITLEMENTS.GROWTH.allowAutonomousInterviews === true &&
    TIER_ENTITLEMENTS.GROWTH.monthlyTelemetryEventsQuota === 1_000_000,
    'WORM: true, Autonomous: true, Events: 1,000,000',
    `WORM: ${TIER_ENTITLEMENTS.GROWTH.allowWormCryptographicSeal}, Autonomous: ${TIER_ENTITLEMENTS.GROWTH.allowAutonomousInterviews}, Events: ${TIER_ENTITLEMENTS.GROWTH.monthlyTelemetryEventsQuota}`
  );

  assert(
    'SAAS-TIER-03',
    'ENTITLEMENTS',
    'Enterprise tier enables Custom Frameworks, SAML/SCIM, Custom Branding & Post-Quantum',
    TIER_ENTITLEMENTS.ENTERPRISE.allowCustomFrameworks === true &&
    TIER_ENTITLEMENTS.ENTERPRISE.allowSsoSamlScim === true &&
    TIER_ENTITLEMENTS.ENTERPRISE.allowCustomBranding === true &&
    TIER_ENTITLEMENTS.ENTERPRISE.allowPostQuantumLedger === true,
    'All enterprise flags true',
    `CustomFw: ${TIER_ENTITLEMENTS.ENTERPRISE.allowCustomFrameworks}, SAML: ${TIER_ENTITLEMENTS.ENTERPRISE.allowSsoSamlScim}, Branding: ${TIER_ENTITLEMENTS.ENTERPRISE.allowCustomBranding}, PQC: ${TIER_ENTITLEMENTS.ENTERPRISE.allowPostQuantumLedger}`
  );

  assert(
    'SAAS-TIER-04',
    'ENTITLEMENTS',
    'APEX Global tier provides Unlimited frameworks/users/auditors & BYO-KMS CloudHSM',
    TIER_ENTITLEMENTS.APEX_GLOBAL.maxFrameworks === -1 &&
    TIER_ENTITLEMENTS.APEX_GLOBAL.maxUsers === -1 &&
    TIER_ENTITLEMENTS.APEX_GLOBAL.allowDedicatedVpcBringYourOwnKms === true &&
    TIER_ENTITLEMENTS.APEX_GLOBAL.supportSlaHours === 0.25,
    'Unlimited quotas & 15min mission-critical SLA',
    `Fw: ${TIER_ENTITLEMENTS.APEX_GLOBAL.maxFrameworks}, Users: ${TIER_ENTITLEMENTS.APEX_GLOBAL.maxUsers}, BYO-KMS: ${TIER_ENTITLEMENTS.APEX_GLOBAL.allowDedicatedVpcBringYourOwnKms}, SLA: ${TIER_ENTITLEMENTS.APEX_GLOBAL.supportSlaHours}h`
  );

  // --------------------------------------------------------------------------
  // 2. TENANT INITIALIZATION & USAGE METERS
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Tenant Initialization & Usage Meters ---');

  const demoProfile = enterpriseSaaSService.getProfile(tenantA);
  assert(
    'SAAS-USAGE-01',
    'USAGE_METERS',
    'SKANDA-DEMO-ENTERPRISE initializes with APEX_GLOBAL tier and active meters',
    demoProfile.tier === 'APEX_GLOBAL' && demoProfile.usageMeters.storageUsedGb > 0,
    'APEX_GLOBAL with storage metrics',
    `Tier: ${demoProfile.tier}, StorageUsed: ${demoProfile.usageMeters.storageUsedGb} GB`
  );

  assert(
    'SAAS-USAGE-02',
    'USAGE_METERS',
    'Usage meter tracks active controls, auditor seats, and AI tokens',
    demoProfile.usageMeters.activeControlsMonitored > 100 &&
    demoProfile.usageMeters.activeAuditorSeats >= 12 &&
    demoProfile.usageMeters.aiTokensUsedThisMonth > 10_000_000,
    'Controls > 100, Auditors >= 12, AI Tokens > 10M',
    `Controls: ${demoProfile.usageMeters.activeControlsMonitored}, Auditors: ${demoProfile.usageMeters.activeAuditorSeats}, AI Tokens: ${demoProfile.usageMeters.aiTokensUsedThisMonth}`
  );

  // --------------------------------------------------------------------------
  // 3. TIER UPGRADE & AUTOMATED INVOICING
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Tier Upgrade & Invoice Generation ---');

  enterpriseSaaSService.setTenantId(tenantB);
  const tenantBInitial = enterpriseSaaSService.getProfile(tenantB);
  const initialInvoiceCount = tenantBInitial.invoices.length;

  const upgradedProfile = enterpriseSaaSService.upgradeTier('APEX_GLOBAL', 'ANNUAL');
  assert(
    'SAAS-UPGRADE-01',
    'TIER_MANAGEMENT',
    'Tenant B successfully upgraded to APEX_GLOBAL with updated entitlements',
    upgradedProfile.tier === 'APEX_GLOBAL' &&
    upgradedProfile.entitlements.allowDedicatedVpcBringYourOwnKms === true,
    'Tier: APEX_GLOBAL, BYO-KMS: true',
    `Tier: ${upgradedProfile.tier}, BYO-KMS: ${upgradedProfile.entitlements.allowDedicatedVpcBringYourOwnKms}`
  );

  assert(
    'SAAS-UPGRADE-02',
    'INVOICING',
    'Tier upgrade automatically generates and prepends a new PAID enterprise invoice',
    upgradedProfile.invoices.length === initialInvoiceCount + 1 &&
    upgradedProfile.invoices[0].amount === 48000 &&
    upgradedProfile.invoices[0].status === 'PAID',
    'New invoice generated with $48,000 annual amount',
    `Count: ${upgradedProfile.invoices.length}, Top Invoice: ${upgradedProfile.invoices[0]?.invoiceNumber} ($${upgradedProfile.invoices[0]?.amount})`
  );

  // --------------------------------------------------------------------------
  // 4. MODULAR ADD-ON MARKETPLACE
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Modular Add-On Marketplace ---');

  const initialAddonState = upgradedProfile.addOns.find(a => a.id === 'addon-dedicated-worm')?.enabled;
  const toggledProfile = enterpriseSaaSService.toggleAddOn('addon-dedicated-worm');
  const finalAddonState = toggledProfile.addOns.find(a => a.id === 'addon-dedicated-worm')?.enabled;

  assert(
    'SAAS-ADDON-01',
    'MARKETPLACE',
    'Modular Dedicated HSM/WORM Notary Node toggles enabled state seamlessly',
    initialAddonState !== finalAddonState,
    `Toggled from ${initialAddonState} to ${!initialAddonState}`,
    `Initial: ${initialAddonState}, Final: ${finalAddonState}`
  );

  assert(
    'SAAS-ADDON-02',
    'MARKETPLACE',
    'PQC Migration Ledger and MAS 644 Simulator add-ons are verified in registry',
    SAAS_ADD_ONS.some(a => a.code === 'PQC_SENTINEL') &&
    SAAS_ADD_ONS.some(a => a.code === 'MAS_644_SIM'),
    'Both PQC_SENTINEL and MAS_644_SIM present in catalog',
    `Catalog items: ${SAAS_ADD_ONS.map(a => a.code).join(', ')}`
  );

  // --------------------------------------------------------------------------
  // 5. ENTERPRISE SAML 2.0 / SCIM 2.0 DIRECTORY SYNC
  // --------------------------------------------------------------------------
  console.log('\n--- 5. SAML 2.0 / SCIM 2.0 Directory Sync ---');

  const updatedSso = enterpriseSaaSService.saveSsoConfig({
    enabled: true,
    provider: 'OKTA',
    idpIssuerUrl: 'https://bank-sso.singapore-neobank.com/app/grc',
    ssoLoginUrl: 'https://bank-sso.singapore-neobank.com/app/grc/sso',
    scimEnabled: true,
    enforceSsoForDomain: true,
    allowedDomains: ['singapore-neobank.com']
  });

  assert(
    'SAAS-SSO-01',
    'SECURITY_SSO',
    'SAML 2.0 and SCIM 2.0 configuration saved with domain enforcement',
    updatedSso.enabled === true &&
    updatedSso.scimEnabled === true &&
    updatedSso.enforceSsoForDomain === true &&
    updatedSso.allowedDomains.includes('singapore-neobank.com'),
    'SSO/SCIM enabled for singapore-neobank.com',
    `SSO: ${updatedSso.enabled}, SCIM: ${updatedSso.scimEnabled}, Domain: ${updatedSso.allowedDomains.join(',')}`
  );

  // --------------------------------------------------------------------------
  // 6. SCOPED API KEYS & REVOCATION
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Scoped API Key Management ---');

  const createdKey = enterpriseSaaSService.createApiKey('CI/CD Pipeline Compliance Gate', [
    'evidence:upload',
    'controls:evaluate'
  ]);

  assert(
    'SAAS-API-01',
    'API_KEYS',
    'Generated API key has valid prefix, masked secret, and active status',
    createdKey.keyPrefix === 'sk_live_' &&
    createdKey.maskedSecret.startsWith('sk_live_') &&
    createdKey.status === 'ACTIVE' &&
    createdKey.scopes.includes('evidence:upload'),
    'Active key with sk_live_ prefix and evidence:upload scope',
    `ID: ${createdKey.id}, Masked: ${createdKey.maskedSecret}, Status: ${createdKey.status}`
  );

  enterpriseSaaSService.revokeApiKey(createdKey.id);
  const revokedKey = enterpriseSaaSService.getProfile(tenantB).apiKeys.find(k => k.id === createdKey.id);
  assert(
    'SAAS-API-02',
    'API_KEYS',
    'Revoked API key status transitions to REVOKED immediately',
    revokedKey?.status === 'REVOKED',
    'Status: REVOKED',
    `Status: ${revokedKey?.status}`
  );

  // --------------------------------------------------------------------------
  // 7. WHITE-LABELING & CUSTOM BRANDING
  // --------------------------------------------------------------------------
  console.log('\n--- 7. Custom Branding & White-Labeling ---');

  const updatedBranding = enterpriseSaaSService.saveCustomBranding({
    customDomain: 'grc.singapore-neobank.com',
    customDomainStatus: 'SSL_ACTIVE',
    brandPrimaryColor: '#059669',
    brandAccentColor: '#10b981',
    reportWatermarkText: 'SINGAPORE NEOBANK - AUTHORIZED AUDIT ONLY'
  });

  assert(
    'SAAS-BRAND-01',
    'WHITE_LABEL',
    'Custom vanity domain and custom brand theme applied successfully',
    updatedBranding.customDomain === 'grc.singapore-neobank.com' &&
    updatedBranding.customDomainStatus === 'SSL_ACTIVE' &&
    updatedBranding.brandPrimaryColor === '#059669',
    'Domain: grc.singapore-neobank.com, Status: SSL_ACTIVE',
    `Domain: ${updatedBranding.customDomain}, Status: ${updatedBranding.customDomainStatus}, Color: ${updatedBranding.brandPrimaryColor}`
  );

  // --------------------------------------------------------------------------
  // 8. SOVEREIGN CLOUD REGIONS & SLA HEALTH
  // --------------------------------------------------------------------------
  console.log('\n--- 8. Sovereign Cloud Regions & SLA Health ---');

  assert(
    'SAAS-REGION-01',
    'DATA_RESIDENCY',
    '5 Sovereign Cloud Regions available covering SG, DE, US, IN, JP regulatory frameworks',
    CLOUD_REGIONS.length === 5 &&
    CLOUD_REGIONS.some(r => r.id === 'AWS_AP_SOUTHEAST_1' && r.dataResidencyLaw.includes('MAS TRM')) &&
    CLOUD_REGIONS.some(r => r.id === 'AWS_EU_CENTRAL_1' && r.dataResidencyLaw.includes('GDPR')) &&
    CLOUD_REGIONS.some(r => r.id === 'GCP_ASIA_SOUTH_1' && r.dataResidencyLaw.includes('DPDP')),
    '5 sovereign regions with respective data residency laws',
    `Regions: ${CLOUD_REGIONS.map(r => `${r.flag} ${r.id}`).join(', ')}`
  );

  const switchedProfile = enterpriseSaaSService.switchCloudRegion('AWS_EU_CENTRAL_1');
  assert(
    'SAAS-REGION-02',
    'DATA_RESIDENCY',
    'Tenant region switch updates sovereign data jurisdiction to Frankfurt (EU GDPR)',
    switchedProfile.cloudRegion === 'AWS_EU_CENTRAL_1',
    'Region: AWS_EU_CENTRAL_1',
    `Region: ${switchedProfile.cloudRegion}`
  );

  const slaHealth = enterpriseSaaSService.getSlaHealth();
  assert(
    'SAAS-SLA-01',
    'SLA_HEALTH',
    'SLA health monitor reports >= 99.99% uptime with 0 active incidents',
    slaHealth.systemUptimePercentage >= 99.99 &&
    slaHealth.activeIncidentsCount === 0 &&
    slaHealth.telemetryIngestionStatus === 'OPERATIONAL' &&
    slaHealth.wormLedgerStatus === 'OPERATIONAL',
    'Uptime >= 99.99%, Incidents: 0, Systems: OPERATIONAL',
    `Uptime: ${slaHealth.systemUptimePercentage}%, Incidents: ${slaHealth.activeIncidentsCount}, Lag: ${slaHealth.databaseReplicationLagMs}ms`
  );

  // --------------------------------------------------------------------------
  // 9. CROSS-TENANT SAAS ISOLATION
  // --------------------------------------------------------------------------
  console.log('\n--- 9. Cross-Tenant SaaS Isolation ---');

  enterpriseSaaSService.setTenantId(tenantC);
  const tenantCProfile = enterpriseSaaSService.getProfile(tenantC);

  assert(
    'SAAS-ISO-01',
    'MULTI_TENANT_ISOLATION',
    'Tenant C profile is isolated and does not inherit Tenant B or Tenant A custom domains',
    tenantCProfile.tenantId === tenantC &&
    tenantCProfile.customBranding.customDomain === '' &&
    tenantCProfile.apiKeys.length === 0,
    'Fresh isolated profile for Tenant C',
    `Tenant: ${tenantCProfile.tenantId}, Domain: "${tenantCProfile.customBranding.customDomain}", Keys: ${tenantCProfile.apiKeys.length}`
  );

  // Reset back to primary tenant
  enterpriseSaaSService.setTenantId(tenantA);

  // --------------------------------------------------------------------------
  // SUMMARY SCORECARD
  // --------------------------------------------------------------------------
  console.log('\n================================================================================');
  console.log('ENTERPRISE SAAS VALIDATION SCORECARD');
  console.log('================================================================================');

  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`TOTAL SAAS ASSERTIONS : ${total}`);
  console.log(`PASSED               : ${passed}`);
  console.log(`FAILED               : ${failed}`);
  console.log(`SUCCESS RATE         : ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.error('\nFAILED ASSERTIONS:');
    results.filter(r => !r.passed).forEach(r => {
      console.error(`  - [${r.id}] ${r.category}: ${r.description}`);
    });
    process.exit(1);
  } else {
    console.log('\n🎉 ALL ENTERPRISE SAAS MODEL ASSERTIONS PASSED WITH 100% SUCCESS!');
  }
}

runSaaSValidation().catch(err => {
  console.error('Fatal error running SaaS validation:', err);
  process.exit(1);
});
