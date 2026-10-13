// ============================================================================
// SKANDA ENTERPRISE GRC: HIGH-END SAAS PLATFORM SERVICE
// Path: src/services/saas/enterpriseSaaSService.ts
//
// Manages multi-tenant subscription tiers, real-time usage meters,
// enterprise SAML/SCIM directory sync, API keys, regional data residency & SLAs
// ============================================================================

import {
  SubscriptionTier,
  BillingCycle,
  SubscriptionStatus,
  CloudResidencyRegion,
  CloudRegionInfo,
  SaaSEntitlements,
  SaaSUsageMeters,
  SaaSInvoice,
  SaaSSingleSignOnConfig,
  SaaSApiKey,
  SaaSWebhookEndpoint,
  SaaSCustomBranding,
  SaaSSlaHealth,
  SaaSAddOn,
  TenantSaaSProfile
} from '../../types/saasTypes';

export const TIER_ENTITLEMENTS: Record<SubscriptionTier, SaaSEntitlements> = {
  STARTER: {
    maxFrameworks: 1,
    maxUsers: 15,
    maxAuditorSeats: 2,
    storageQuotaGb: 50,
    monthlyTelemetryEventsQuota: 100_000,
    aiStudioMonthlyTokens: 500_000,
    allowCustomFrameworks: false,
    allowWormCryptographicSeal: false,
    allowAutonomousInterviews: false,
    allowCrossRegulatoryHarmonizer: false,
    allowPostQuantumLedger: false,
    allowBrandGuardEASM: false,
    allowDedicatedVpcBringYourOwnKms: false,
    allowSsoSamlScim: false,
    allowCustomBranding: false,
    allowWebhookStreaming: false,
    supportSlaHours: 24
  },
  GROWTH: {
    maxFrameworks: 3,
    maxUsers: 50,
    maxAuditorSeats: 5,
    storageQuotaGb: 250,
    monthlyTelemetryEventsQuota: 1_000_000,
    aiStudioMonthlyTokens: 2_000_000,
    allowCustomFrameworks: false,
    allowWormCryptographicSeal: true,
    allowAutonomousInterviews: true,
    allowCrossRegulatoryHarmonizer: false,
    allowPostQuantumLedger: false,
    allowBrandGuardEASM: true,
    allowDedicatedVpcBringYourOwnKms: false,
    allowSsoSamlScim: true,
    allowCustomBranding: false,
    allowWebhookStreaming: true,
    supportSlaHours: 8
  },
  ENTERPRISE: {
    maxFrameworks: 10,
    maxUsers: 500,
    maxAuditorSeats: 20,
    storageQuotaGb: 2000,
    monthlyTelemetryEventsQuota: 10_000_000,
    aiStudioMonthlyTokens: 20_000_000,
    allowCustomFrameworks: true,
    allowWormCryptographicSeal: true,
    allowAutonomousInterviews: true,
    allowCrossRegulatoryHarmonizer: true,
    allowPostQuantumLedger: true,
    allowBrandGuardEASM: true,
    allowDedicatedVpcBringYourOwnKms: false,
    allowSsoSamlScim: true,
    allowCustomBranding: true,
    allowWebhookStreaming: true,
    supportSlaHours: 4
  },
  APEX_GLOBAL: {
    maxFrameworks: -1, // Unlimited
    maxUsers: -1,     // Unlimited
    maxAuditorSeats: -1,
    storageQuotaGb: 10_000,
    monthlyTelemetryEventsQuota: 100_000_000,
    aiStudioMonthlyTokens: 100_000_000,
    allowCustomFrameworks: true,
    allowWormCryptographicSeal: true,
    allowAutonomousInterviews: true,
    allowCrossRegulatoryHarmonizer: true,
    allowPostQuantumLedger: true,
    allowBrandGuardEASM: true,
    allowDedicatedVpcBringYourOwnKms: true,
    allowSsoSamlScim: true,
    allowCustomBranding: true,
    allowWebhookStreaming: true,
    supportSlaHours: 0.25 // 15 mins mission-critical
  }
};

export const CLOUD_REGIONS: CloudRegionInfo[] = [
  {
    id: 'AWS_AP_SOUTHEAST_1',
    name: 'Asia Pacific (Singapore)',
    location: 'Singapore SG',
    flag: '🇸🇬',
    provider: 'AWS',
    latencyMs: 12,
    dataResidencyLaw: 'MAS TRM & Singapore PDPA Compliant',
    complianceBadges: ['MAS TRM', 'SOC 2 Type II', 'ISO 27001', 'MTCS Level 3'],
    status: 'OPERATIONAL'
  },
  {
    id: 'AWS_EU_CENTRAL_1',
    name: 'Europe (Frankfurt)',
    location: 'Frankfurt DE',
    flag: '🇩🇪',
    provider: 'AWS',
    latencyMs: 118,
    dataResidencyLaw: 'EU GDPR & BSI C5 Compliant (Strict European Sovereignty)',
    complianceBadges: ['GDPR', 'BSI C5', 'ISO 27001', 'SOC 2 Type II'],
    status: 'OPERATIONAL'
  },
  {
    id: 'AWS_US_EAST_1',
    name: 'US East (N. Virginia)',
    location: 'Virginia US',
    flag: '🇺🇸',
    provider: 'AWS',
    latencyMs: 184,
    dataResidencyLaw: 'US HIPAA, FedRAMP High & SOC 1/2/3',
    complianceBadges: ['FedRAMP', 'HIPAA', 'SOC 2 Type II', 'ISO 42001'],
    status: 'OPERATIONAL'
  },
  {
    id: 'GCP_ASIA_SOUTH_1',
    name: 'Asia South (Mumbai)',
    location: 'Mumbai IN',
    flag: '🇮🇳',
    provider: 'GCP',
    latencyMs: 46,
    dataResidencyLaw: 'India DPDP Act 2023 & RBI Local Storage Mandate',
    complianceBadges: ['DPDP Act', 'RBI Master Direction', 'ISO 27001'],
    status: 'OPERATIONAL'
  },
  {
    id: 'AZURE_AP_EAST_1',
    name: 'Asia Pacific (Tokyo)',
    location: 'Tokyo JP',
    flag: '🇯🇵',
    provider: 'AZURE',
    latencyMs: 68,
    dataResidencyLaw: 'Japan APPI & FSA Financial Cloud Guidelines',
    complianceBadges: ['Japan APPI', 'FISC', 'ISO 27001'],
    status: 'OPERATIONAL'
  }
];

export const SAAS_ADD_ONS: SaaSAddOn[] = [
  {
    id: 'addon-pqc',
    name: 'Post-Quantum Cryptography Migration Ledger',
    code: 'PQC_SENTINEL',
    description: 'Automated cryptographic inventory scan detecting RSA/ECC deprecation and tracking NIST FIPS 203/204 lattice-based algorithms.',
    priceMonthlyUsd: 1200,
    category: 'SECURITY',
    enabled: true,
    badge: 'NIST 2024'
  },
  {
    id: 'addon-mas644',
    name: 'MAS Notice 644 Cyber Crisis Simulator',
    code: 'MAS_644_SIM',
    description: 'Instant regulatory incident dispatcher with 1-hour MAS notification SLA timer, automated forensic draft, and board war room.',
    priceMonthlyUsd: 1500,
    category: 'COMPLIANCE',
    enabled: true,
    badge: 'MAS Mandate'
  },
  {
    id: 'addon-threat-intel',
    name: 'BrandGuard External Attack Surface (EASM) & Dark Web',
    code: 'EASM_DARKWEB',
    description: 'Continuous scanning for compromised corporate credentials on dark web breach forums, rogue typosquatted domains, and visual logo theft.',
    priceMonthlyUsd: 1800,
    category: 'SECURITY',
    enabled: true,
    badge: 'Continuous'
  },
  {
    id: 'addon-dedicated-worm',
    name: 'Dedicated HSM / WORM Notary Node',
    code: 'DEDICATED_WORM',
    description: 'Enterprise dedicated hardware security module (FIPS 140-3 Level 4) sealing your evidence ledgers into your own AWS KMS / CloudHSM.',
    priceMonthlyUsd: 2500,
    category: 'INFRASTRUCTURE',
    enabled: false,
    badge: 'Hardware HSM'
  }
];

class EnterpriseSaaSService {
  private activeTenantId = 'SKANDA-DEMO-ENTERPRISE';
  private tenantProfiles: Map<string, TenantSaaSProfile> = new Map();

  constructor() {
    this.initializeDefaultProfiles();
  }

  public setTenantId(tenantId: string): void {
    this.activeTenantId = tenantId;
  }

  public getTenantId(): string {
    return this.activeTenantId;
  }

  private initializeDefaultProfiles() {
    const demoProfile: TenantSaaSProfile = {
      tenantId: 'SKANDA-DEMO-ENTERPRISE',
      tier: 'APEX_GLOBAL',
      billingCycle: 'ANNUAL',
      status: 'ACTIVE',
      currentPeriodStart: '2026-01-01T00:00:00Z',
      currentPeriodEnd: '2026-12-31T23:59:59Z',
      cloudRegion: 'AWS_AP_SOUTHEAST_1',
      entitlements: TIER_ENTITLEMENTS.APEX_GLOBAL,
      usageMeters: {
        storageUsedGb: 1420,
        telemetryEventsThisMonth: 4_280_000,
        aiTokensUsedThisMonth: 18_450_000,
        activeUsersCount: 184,
        activeControlsMonitored: 114,
        activeAuditorSeats: 12,
        apiCallsThisMonth: 842_190,
        lastUpdated: new Date().toISOString()
      },
      ssoConfig: {
        enabled: true,
        provider: 'OKTA',
        idpIssuerUrl: 'https://acmefintech.okta.com/app/exk84920/sso/saml',
        ssoLoginUrl: 'https://acmefintech.okta.com/app/exk84920/sso/saml/login',
        idpCertificateFingerprint: 'SHA256: 8F:92:4B:1A:99:3C:77:E1:02:49:55:1A:BC:33:44:91',
        jitProvisioningEnabled: true,
        scimEnabled: true,
        scimEndpointUrl: 'https://api.skanda.enterprise.com/scim/v2/SKANDA-DEMO-ENTERPRISE',
        scimBearerToken: 'sk_scim_live_8918239048123984710928374',
        enforceSsoForDomain: true,
        allowedDomains: ['acmefintech.io', 'skanda.enterprise.com']
      },
      apiKeys: [
        {
          id: 'key-live-01',
          name: 'Production Cloud Telemetry Ingestion (AWS EventBridge)',
          keyPrefix: 'sk_live_aws_',
          maskedSecret: 'sk_live_aws_********************9481',
          scopes: ['telemetry:ingest', 'controls:evaluate'],
          createdAt: '2026-01-15T10:00:00Z',
          lastUsedAt: '2026-10-06T08:45:00Z',
          status: 'ACTIVE'
        },
        {
          id: 'key-live-02',
          name: 'CI/CD Pipeline Security Gate (GitHub Actions)',
          keyPrefix: 'sk_live_gh_',
          maskedSecret: 'sk_live_gh_********************3312',
          scopes: ['evidence:upload', 'findings:query'],
          createdAt: '2026-02-01T12:00:00Z',
          lastUsedAt: '2026-10-06T07:20:00Z',
          status: 'ACTIVE'
        }
      ],
      webhooks: [
        {
          id: 'wh-01',
          url: 'https://secops.acmefintech.io/webhooks/skanda-compliance-events',
          eventSubscriptions: ['control.drift', 'evidence.gap', 'audit.non_conformity'],
          secret: 'whsec_981249871239847120938471209384',
          status: 'HEALTHY',
          lastDeliveryStatus: '200 OK',
          lastDeliveryAt: '2026-10-06T08:30:00Z'
        }
      ],
      customBranding: {
        companyLogoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
        brandPrimaryColor: '#0ea5e9',
        brandAccentColor: '#6366f1',
        customDomain: 'grc.acmefintech.io',
        customDomainStatus: 'SSL_ACTIVE',
        cnameTarget: 'custom-ingress.skanda.cloud',
        reportWatermarkText: 'ACME FINANCIAL TECHNOLOGIES - STRICTLY CONFIDENTIAL'
      },
      invoices: [
        {
          id: 'inv-2026-001',
          invoiceNumber: 'INV-SKD-2026-0901',
          issueDate: '2026-09-01',
          dueDate: '2026-09-30',
          amount: 48000,
          currency: 'USD',
          status: 'PAID',
          planName: 'APEX Global Enterprise (Annual)',
          billingPeriod: '2026-09-01 - 2027-08-31',
          paymentMethod: 'Corporate Wire (JPMorgan Chase ****4190)'
        },
        {
          id: 'inv-2025-001',
          invoiceNumber: 'INV-SKD-2025-0901',
          issueDate: '2025-09-01',
          dueDate: '2025-09-30',
          amount: 42000,
          currency: 'USD',
          status: 'PAID',
          planName: 'Enterprise Compliance Tier (Annual)',
          billingPeriod: '2025-09-01 - 2026-08-31',
          paymentMethod: 'Corporate Wire (JPMorgan Chase ****4190)'
        }
      ],
      addOns: SAAS_ADD_ONS
    };

    this.tenantProfiles.set('SKANDA-DEMO-ENTERPRISE', demoProfile);
  }

  public getProfile(tenantId?: string): TenantSaaSProfile {
    const id = tenantId || this.activeTenantId;
    let profile = this.tenantProfiles.get(id);
    if (!profile) {
      profile = {
        tenantId: id,
        tier: 'ENTERPRISE',
        billingCycle: 'ANNUAL',
        status: 'ACTIVE',
        currentPeriodStart: '2026-01-01T00:00:00Z',
        currentPeriodEnd: '2026-12-31T23:59:59Z',
        cloudRegion: 'AWS_AP_SOUTHEAST_1',
        entitlements: TIER_ENTITLEMENTS.ENTERPRISE,
        usageMeters: {
          storageUsedGb: 450,
          telemetryEventsThisMonth: 1_200_000,
          aiTokensUsedThisMonth: 4_500_000,
          activeUsersCount: 42,
          activeControlsMonitored: 86,
          activeAuditorSeats: 4,
          apiCallsThisMonth: 190_000,
          lastUpdated: new Date().toISOString()
        },
        ssoConfig: {
          enabled: false,
          provider: 'AZURE_AD',
          idpIssuerUrl: '',
          ssoLoginUrl: '',
          idpCertificateFingerprint: '',
          jitProvisioningEnabled: false,
          scimEnabled: false,
          scimEndpointUrl: '',
          scimBearerToken: '',
          enforceSsoForDomain: false,
          allowedDomains: []
        },
        apiKeys: [],
        webhooks: [],
        customBranding: {
          brandPrimaryColor: '#0ea5e9',
          brandAccentColor: '#6366f1',
          customDomain: '',
          customDomainStatus: 'PENDING_DNS',
          cnameTarget: 'custom-ingress.skanda.cloud'
        },
        invoices: [],
        addOns: SAAS_ADD_ONS
      };
      this.tenantProfiles.set(id, profile);
    }
    return profile;
  }

  public upgradeTier(newTier: SubscriptionTier, billingCycle: BillingCycle = 'ANNUAL'): TenantSaaSProfile {
    const profile = this.getProfile();
    profile.tier = newTier;
    profile.billingCycle = billingCycle;
    profile.entitlements = TIER_ENTITLEMENTS[newTier];
    profile.status = 'UPGRADED';

    // Generate immediate invoice record
    const amountMap: Record<SubscriptionTier, number> = {
      STARTER: billingCycle === 'ANNUAL' ? 12000 : 1200,
      GROWTH: billingCycle === 'ANNUAL' ? 24000 : 2400,
      ENTERPRISE: billingCycle === 'ANNUAL' ? 36000 : 3600,
      APEX_GLOBAL: billingCycle === 'ANNUAL' ? 48000 : 4800
    };

    const newInvoice: SaaSInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-SKD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      amount: amountMap[newTier],
      currency: 'USD',
      status: 'PAID',
      planName: `${newTier} Tier (${billingCycle})`,
      billingPeriod: `${new Date().toISOString().split('T')[0]} - Renewal`,
      paymentMethod: 'Corporate Wire / Amex Enterprise'
    };

    profile.invoices.unshift(newInvoice);
    return profile;
  }

  public switchCloudRegion(region: CloudResidencyRegion): TenantSaaSProfile {
    const profile = this.getProfile();
    profile.cloudRegion = region;
    return profile;
  }

  public toggleAddOn(addOnId: string): TenantSaaSProfile {
    const profile = this.getProfile();
    const addon = profile.addOns.find(a => a.id === addOnId);
    if (addon) {
      addon.enabled = !addon.enabled;
    }
    return profile;
  }

  public createApiKey(name: string, scopes: string[]): SaaSApiKey {
    const profile = this.getProfile();
    const randomHex = Math.random().toString(16).substring(2, 10);
    const newKey: SaaSApiKey = {
      id: `key-${Date.now()}`,
      name,
      keyPrefix: 'sk_live_',
      maskedSecret: `sk_live_${randomHex}********************${Math.floor(1000 + Math.random() * 9000)}`,
      scopes,
      createdAt: new Date().toISOString(),
      status: 'ACTIVE'
    };
    profile.apiKeys.unshift(newKey);
    return newKey;
  }

  public revokeApiKey(keyId: string): void {
    const profile = this.getProfile();
    const key = profile.apiKeys.find(k => k.id === keyId);
    if (key) {
      key.status = 'REVOKED';
    }
  }

  public saveSsoConfig(config: Partial<SaaSSingleSignOnConfig>): SaaSSingleSignOnConfig {
    const profile = this.getProfile();
    profile.ssoConfig = { ...profile.ssoConfig, ...config };
    return profile.ssoConfig;
  }

  public saveCustomBranding(branding: Partial<SaaSCustomBranding>): SaaSCustomBranding {
    const profile = this.getProfile();
    profile.customBranding = { ...profile.customBranding, ...branding };
    return profile.customBranding;
  }

  public getSlaHealth(): SaaSSlaHealth {
    return {
      systemUptimePercentage: 99.994,
      telemetryIngestionStatus: 'OPERATIONAL',
      wormLedgerStatus: 'OPERATIONAL',
      aiCopilotStatus: 'OPERATIONAL',
      databaseReplicationLagMs: 8,
      activeIncidentsCount: 0,
      lastMaintenanceWindow: '2026-09-20T02:00:00Z (Zero Downtime Patch)',
      nextScheduledMaintenance: '2026-11-15T02:00:00Z'
    };
  }
}

export const enterpriseSaaSService = new EnterpriseSaaSService();
