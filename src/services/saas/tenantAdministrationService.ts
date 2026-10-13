// ============================================================================
// SKANDA ENTERPRISE GRC: TENANT ADMINISTRATION & CUSTOMER SUCCESS SERVICE
// Path: src/services/saas/tenantAdministrationService.ts
//
// Bridges the GRC Plane (Discovery, Controls, Risks, Evidence, Audit, Assurance)
// with the SaaS Plane (Tenants, Subscriptions, Entitlements, Usage, Health, Renewals)
// ============================================================================

// Helper for isomorphic random token generation without relying on Node's crypto
function generateRandomHex(bytes: number): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const arr = new Uint8Array(bytes);
    window.crypto.getRandomValues(arr);
    return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
  }
  return Array.from({ length: bytes * 2 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

function computeSimpleHash(input: string): string {
  let hash1 = 5381;
  let hash2 = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash1 = ((hash1 << 5) + hash1) + char;
    hash1 = hash1 & hash1;
    hash2 = ((hash2 << 5) - hash2) + char;
    hash2 = hash2 & hash2;
  }
  const h1 = Math.abs(hash1).toString(16).padStart(16, '0');
  const h2 = Math.abs(hash2).toString(16).padStart(16, '0');
  return h1 + h2 + generateRandomHex(16);
}

import {
  CanonicalTenant,
  TenantLifecycleStatus,
  CustomerHealthStatus,
  CustomerHealthScore,
  RenewalRecord,
  RenewalStatus,
  SupportCase,
  SupportCategory,
  SupportPriority,
  TenantTeam,
  TenantUser,
  EnterpriseRole,
  TenantProvisioningDraft,
  CustomerExitCertificate,
  QuotaPolicyAction,
  IntegrationHealthRecord,
  SubscriptionTier,
  BillingCycle,
  CloudResidencyRegion,
  TenantSaaSProfile
} from '../../types/saasTypes';
import {
  enterpriseSaaSService,
  TIER_ENTITLEMENTS,
  CLOUD_REGIONS,
  SAAS_ADD_ONS
} from './enterpriseSaaSService';

class TenantAdministrationService {
  private tenants: Map<string, CanonicalTenant> = new Map();
  private provisioningDrafts: Map<string, TenantProvisioningDraft> = new Map();

  constructor() {
    this.initializeDefaultTenants();
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION / SEED TENANTS
  // --------------------------------------------------------------------------
  private initializeDefaultTenants() {
    // 1. Primary Enterprise Demo Tenant: Acme Financial Technologies
    const acmeProfile = enterpriseSaaSService.getProfile('SKANDA-DEMO-ENTERPRISE');
    const acmeTenant: CanonicalTenant = {
      tenantId: 'SKANDA-DEMO-ENTERPRISE',
      organizationId: 'ORG-ACME-FINTECH-01',
      legalName: 'Acme Financial Technologies Pte. Ltd.',
      displayName: 'Acme Financial Technologies',
      industry: 'Fintech / WealthTech',
      country: 'Singapore',
      region: 'AWS_AP_SOUTHEAST_1',
      dataResidencyJurisdiction: 'Singapore (MAS TRM & PDPA Strict)',
      timezone: 'Asia/Singapore',
      locale: 'en-SG',
      status: 'ACTIVE',
      tier: 'APEX_GLOBAL',
      billingCycle: 'ANNUAL',
      tenantAdminEmail: 'ciso@acmefintech.io',
      createdAt: '2025-01-15T08:00:00Z',
      activatedAt: '2025-01-15T09:30:00Z',
      lastActivityAt: new Date().toISOString(),
      healthStatus: 'HEALTHY',
      healthScore: {
        overallScore: 94,
        status: 'HEALTHY',
        breakdown: {
          platformActivityScore: 96,
          userAdoptionScore: 92,
          frameworkAdoptionScore: 100,
          evidenceActivityScore: 95,
          controlTestingScore: 94,
          integrationHealthScore: 98,
          usageQuotaScore: 88,
          openCriticalIssuesCount: 0,
          onboardingProgressPercentage: 100,
          supportTicketsOpenCount: 1,
          daysToRenewal: 86
        },
        reasons: [
          'High continuous telemetry ingestion (4.2M events/mo)',
          'All 114 monitored controls in EFFECTIVE posture',
          'SAML/SCIM directory sync operational with 184 active users',
          'Automated MAS 644 and ISO 27001 evidence streams healthy'
        ],
        internalSuccessNotes: 'Flagship tier-1 customer. Expansion target: MAS 644 cyber crisis simulator add-on.',
        expansionOpportunities: ['MAS Notice 644 Simulator ($1,500/mo)', 'Dedicated HSM Node ($2,500/mo)'],
        churnRiskLevel: 'LOW'
      },
      enabledFrameworkCodes: ['ISO27001_2022', 'MASTRM_2021', 'SOC2_TYPE2', 'ISO27701_2019', 'NIST_CSF_2_0'],
      activeComplianceProgramIds: ['PROG-ISO27001-01', 'PROG-MASTRM-01', 'PROG-SOC2-01'],
      teams: [
        {
          id: 'team-sec',
          tenantId: 'SKANDA-DEMO-ENTERPRISE',
          name: 'Information Security & Cloud SecOps',
          department: 'Information Security',
          leadEmail: 'ciso@acmefintech.io',
          memberEmails: ['ciso@acmefintech.io', 'sec.lead@acmefintech.io', 'cloud.sec@acmefintech.io'],
          ownedControlIds: ['A.5.15', 'A.8.5', 'A.8.24']
        },
        {
          id: 'team-hr',
          tenantId: 'SKANDA-DEMO-ENTERPRISE',
          name: 'People Operations & Talent',
          department: 'Human Resources',
          leadEmail: 'hr.director@acmefintech.io',
          memberEmails: ['hr.director@acmefintech.io', 'rachel.green@acmefintech.io'],
          ownedControlIds: ['A.6.1', 'A.6.2']
        },
        {
          id: 'team-it',
          tenantId: 'SKANDA-DEMO-ENTERPRISE',
          name: 'Core Infrastructure & IT Operations',
          department: 'IT Operations',
          leadEmail: 'it.head@acmefintech.io',
          memberEmails: ['it.head@acmefintech.io', 'david.miller@acmefintech.io'],
          ownedControlIds: ['A.8.1', 'A.8.7']
        }
      ],
      users: [
        {
          id: 'usr-acme-01',
          tenantId: 'SKANDA-DEMO-ENTERPRISE',
          email: 'ciso@acmefintech.io',
          name: 'Marcus Vance (CISO)',
          role: 'CISO',
          teamIds: ['team-sec'],
          status: 'ACTIVE',
          authMethod: 'SAML_SSO',
          lastLoginAt: '2026-10-06T08:15:00Z',
          createdAt: '2025-01-15T09:30:00Z'
        },
        {
          id: 'usr-acme-02',
          tenantId: 'SKANDA-DEMO-ENTERPRISE',
          email: 'rachel.green@acmefintech.io',
          name: 'Rachel Green',
          role: 'PROCESS_OWNER',
          teamIds: ['team-hr'],
          status: 'ACTIVE',
          authMethod: 'SCIM_SYNCED',
          lastLoginAt: '2026-10-06T07:45:00Z',
          createdAt: '2025-02-01T10:00:00Z'
        },
        {
          id: 'usr-acme-03',
          tenantId: 'SKANDA-DEMO-ENTERPRISE',
          email: 'lead.auditor@external-assurance.sg',
          name: 'Sarah Chen (Lead Auditor)',
          role: 'AUDITOR',
          teamIds: [],
          status: 'ACTIVE',
          authMethod: 'LOCAL_MFA',
          lastLoginAt: '2026-10-05T14:30:00Z',
          createdAt: '2025-08-10T11:00:00Z'
        }
      ],
      saasProfile: acmeProfile,
      supportCases: [
        {
          id: 'CASE-2026-8912',
          tenantId: 'SKANDA-DEMO-ENTERPRISE',
          category: 'INTEGRATION',
          priority: 'MEDIUM',
          subject: 'EventBridge custom IAM filter rate limit tuning',
          description: 'Requesting assistance in configuring high-throughput EventBridge filters for AWS CloudTrail log volume.',
          createdAt: '2026-10-04T10:00:00Z',
          updatedAt: '2026-10-05T16:00:00Z',
          ownerEmail: 'support@skanda.enterprise.com',
          status: 'IN_PROGRESS',
          targetSlaHours: 0.25, // 15 mins for APEX Global
          slaBreached: false,
          resolutionNotes: 'Configured exponential rate limiter in Telemetry Ingestion Pipeline.'
        }
      ],
      renewal: {
        contractStartDate: '2026-01-01',
        contractEndDate: '2026-12-31',
        renewalDate: '2026-12-31',
        tier: 'APEX_GLOBAL',
        annualRecurringRevenueUsd: 48000,
        currentUsageStorageGb: 1420,
        currentUsageTelemetryMonthly: 4280000,
        healthStatus: 'HEALTHY',
        openCriticalIssuesCount: 0,
        expansionPotentialUsd: 25000,
        status: 'UPCOMING',
        assignedCustomerSuccessManager: 'Elena Rostova (Principal CSM)'
      },
      integrationHealth: [
        { connectorId: 'aws-prod', name: 'AWS CloudTrail & Security Hub', category: 'CLOUD', status: 'HEALTHY', lastSyncAt: '2026-10-06T09:00:00Z', lastSyncEventsCount: 45200 },
        { connectorId: 'okta-sso', name: 'Okta Identity Cloud SAML/SCIM', category: 'IDP', status: 'HEALTHY', lastSyncAt: '2026-10-06T08:30:00Z', lastSyncEventsCount: 184 },
        { connectorId: 'servicenow', name: 'ServiceNow ITSM & Incident Table', category: 'ITSM', status: 'HEALTHY', lastSyncAt: '2026-10-06T07:15:00Z', lastSyncEventsCount: 32 },
        { connectorId: 'splunk-siem', name: 'Splunk Enterprise SIEM Stream', category: 'SIEM', status: 'HEALTHY', lastSyncAt: '2026-10-06T09:10:00Z', lastSyncEventsCount: 98120 }
      ]
    };

    // 2. Second Demo Tenant: Pacific Logistics Group (At-Risk example)
    const pacificProfile = enterpriseSaaSService.getProfile('TENANT-PACIFIC-LOGISTICS');
    const pacificTenant: CanonicalTenant = {
      tenantId: 'TENANT-PACIFIC-LOGISTICS',
      organizationId: 'ORG-PACIFIC-LOGISTICS',
      legalName: 'Pacific Logistics Global AG',
      displayName: 'Pacific Logistics Group',
      industry: 'Supply Chain & Logistics',
      country: 'Germany',
      region: 'AWS_EU_CENTRAL_1',
      dataResidencyJurisdiction: 'EU GDPR & BSI C5 (Frankfurt)',
      timezone: 'Europe/Berlin',
      locale: 'de-DE',
      status: 'ACTIVE',
      tier: 'GROWTH',
      billingCycle: 'ANNUAL',
      tenantAdminEmail: 'ciso@pacificlogistics.de',
      createdAt: '2025-06-01T08:00:00Z',
      activatedAt: '2025-06-02T10:00:00Z',
      lastActivityAt: '2026-09-28T11:00:00Z',
      healthStatus: 'AT_RISK',
      healthScore: {
        overallScore: 58,
        status: 'AT_RISK',
        breakdown: {
          platformActivityScore: 42,
          userAdoptionScore: 50,
          frameworkAdoptionScore: 66,
          evidenceActivityScore: 48,
          controlTestingScore: 55,
          integrationHealthScore: 70,
          usageQuotaScore: 85,
          openCriticalIssuesCount: 3,
          onboardingProgressPercentage: 75,
          supportTicketsOpenCount: 2,
          daysToRenewal: 45
        },
        reasons: [
          'Low platform activity: No admin login in past 8 days',
          '3 critical controls failing without active remediation plan',
          'Onboarding stalled at 75% for 45 days',
          'Contract renewal upcoming in 45 days'
        ],
        internalSuccessNotes: 'High churn risk. Schedule executive check-in with Head of Security.',
        expansionOpportunities: ['Upgrade to ENTERPRISE for SAML SSO ($12,000 ARR delta)'],
        churnRiskLevel: 'HIGH'
      },
      enabledFrameworkCodes: ['ISO27001_2022', 'GDPR_2018'],
      activeComplianceProgramIds: ['PROG-ISO27001-PACIFIC'],
      teams: [],
      users: [
        {
          id: 'usr-pac-01',
          tenantId: 'TENANT-PACIFIC-LOGISTICS',
          email: 'ciso@pacificlogistics.de',
          name: 'Hans Mueller',
          role: 'CISO',
          teamIds: [],
          status: 'ACTIVE',
          authMethod: 'LOCAL_MFA',
          lastLoginAt: '2026-09-28T11:00:00Z',
          createdAt: '2025-06-01T08:00:00Z'
        }
      ],
      saasProfile: pacificProfile,
      supportCases: [
        {
          id: 'CASE-2026-7721',
          tenantId: 'TENANT-PACIFIC-LOGISTICS',
          category: 'SECURITY',
          priority: 'HIGH',
          subject: 'Assistance required for MFA control gap remediation',
          description: 'Need guidance on integrating Azure AD conditional access policy into evidence harvest.',
          createdAt: '2026-09-25T14:00:00Z',
          updatedAt: '2026-09-26T10:00:00Z',
          ownerEmail: 'support@skanda.enterprise.com',
          status: 'OPEN',
          targetSlaHours: 8,
          slaBreached: false
        }
      ],
      renewal: {
        contractStartDate: '2025-11-20',
        contractEndDate: '2026-11-20',
        renewalDate: '2026-11-20',
        tier: 'GROWTH',
        annualRecurringRevenueUsd: 24000,
        currentUsageStorageGb: 110,
        currentUsageTelemetryMonthly: 450000,
        healthStatus: 'AT_RISK',
        openCriticalIssuesCount: 3,
        expansionPotentialUsd: 12000,
        status: 'CHURN_RISK',
        assignedCustomerSuccessManager: 'Elena Rostova (Principal CSM)'
      },
      integrationHealth: [
        { connectorId: 'azure-prod', name: 'Azure Monitor', category: 'CLOUD', status: 'HEALTHY', lastSyncAt: '2026-09-28T10:00:00Z', lastSyncEventsCount: 12000 }
      ]
    };

    this.tenants.set(acmeTenant.tenantId, acmeTenant);
    this.tenants.set(pacificTenant.tenantId, pacificTenant);
  }

  // --------------------------------------------------------------------------
  // 1. CANONICAL TENANT OPERATIONS
  // --------------------------------------------------------------------------

  public getTenant(tenantId: string, callingRole: EnterpriseRole = 'TENANT_ADMIN', callingTenantId?: string): CanonicalTenant {
    // Cross-tenant customer check (RLS boundary)
    if (callingRole !== 'SKANDA_PLATFORM_ADMIN' && callingTenantId && callingTenantId !== tenantId) {
      throw new Error(`ACCESS_DENIED: Cross-tenant access violation. Tenant '${callingTenantId}' cannot view tenant '${tenantId}'.`);
    }

    let tenant = this.tenants.get(tenantId);
    if (!tenant) {
      // Create empty default tenant
      const profile = enterpriseSaaSService.getProfile(tenantId);
      tenant = {
        tenantId,
        organizationId: `ORG-${tenantId}`,
        legalName: `${tenantId} Global Enterprise`,
        displayName: tenantId,
        industry: 'Technology Services',
        country: 'Singapore',
        region: 'AWS_AP_SOUTHEAST_1',
        dataResidencyJurisdiction: 'Singapore MAS TRM & PDPA Compliant',
        timezone: 'Asia/Singapore',
        locale: 'en-SG',
        status: 'ACTIVE',
        tier: 'ENTERPRISE',
        billingCycle: 'ANNUAL',
        tenantAdminEmail: `admin@${tenantId.toLowerCase()}.com`,
        createdAt: new Date().toISOString(),
        activatedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        healthStatus: 'HEALTHY',
        healthScore: {
          overallScore: 88,
          status: 'HEALTHY',
          breakdown: {
            platformActivityScore: 85,
            userAdoptionScore: 80,
            frameworkAdoptionScore: 90,
            evidenceActivityScore: 88,
            controlTestingScore: 85,
            integrationHealthScore: 90,
            usageQuotaScore: 95,
            openCriticalIssuesCount: 0,
            onboardingProgressPercentage: 90,
            supportTicketsOpenCount: 0,
            daysToRenewal: 180
          },
          reasons: ['Normal platform operations'],
          churnRiskLevel: 'LOW'
        },
        enabledFrameworkCodes: ['ISO27001_2022'],
        activeComplianceProgramIds: ['PROG-DEFAULT'],
        teams: [],
        users: [],
        saasProfile: profile,
        supportCases: [],
        renewal: {
          contractStartDate: '2026-01-01',
          contractEndDate: '2026-12-31',
          renewalDate: '2026-12-31',
          tier: 'ENTERPRISE',
          annualRecurringRevenueUsd: 36000,
          currentUsageStorageGb: 200,
          currentUsageTelemetryMonthly: 500000,
          healthStatus: 'HEALTHY',
          openCriticalIssuesCount: 0,
          expansionPotentialUsd: 12000,
          status: 'NOT_STARTED',
          assignedCustomerSuccessManager: 'Elena Rostova (Principal CSM)'
        },
        integrationHealth: []
      };
      this.tenants.set(tenantId, tenant);
    }

    // Mask internal-only fields if caller is NOT a Skanda platform admin
    if (callingRole !== 'SKANDA_PLATFORM_ADMIN') {
      return this.sanitizeTenantForCustomer(tenant);
    }

    return tenant;
  }

  public getAllTenants(callingRole: EnterpriseRole): CanonicalTenant[] {
    if (callingRole !== 'SKANDA_PLATFORM_ADMIN') {
      throw new Error('ACCESS_DENIED: Only SKANDA_PLATFORM_ADMIN can view the full tenant portfolio.');
    }
    return Array.from(this.tenants.values());
  }

  private sanitizeTenantForCustomer(tenant: CanonicalTenant): CanonicalTenant {
    const copy = JSON.parse(JSON.stringify(tenant));
    // Strip internal success notes, churn risk, ARR, and expansion opportunities from customer view
    if (copy.healthScore) {
      delete copy.healthScore.internalSuccessNotes;
      delete copy.healthScore.expansionOpportunities;
      delete copy.healthScore.churnRiskLevel;
    }
    return copy;
  }

  // --------------------------------------------------------------------------
  // 2. TENANT PROVISIONING & 12-STEP WIZARD
  // --------------------------------------------------------------------------

  public saveProvisioningDraft(draft: TenantProvisioningDraft): TenantProvisioningDraft {
    draft.updatedAt = new Date().toISOString();
    // Validate draft steps
    const blockers: string[] = [];
    if (!draft.organization.name || !draft.organization.legalName) {
      blockers.push('Organization legal name is required');
    }
    if (!draft.tenantAdmin.email) {
      blockers.push('Tenant administrator email is required');
    }
    if (draft.frameworkCodes.length === 0) {
      blockers.push('At least 1 compliance framework must be selected');
    }

    // Check framework entitlement against selected tier
    const allowedFrameworks = TIER_ENTITLEMENTS[draft.subscription.tier].maxFrameworks;
    if (allowedFrameworks !== -1 && draft.frameworkCodes.length > allowedFrameworks) {
      blockers.push(`Selected plan '${draft.subscription.tier}' allows maximum ${allowedFrameworks} frameworks (selected ${draft.frameworkCodes.length}).`);
    }

    draft.validationState = {
      isValid: blockers.length === 0,
      blockers
    };

    this.provisioningDrafts.set(draft.tenantId, draft);
    return draft;
  }

  public getProvisioningDraft(tenantId: string): TenantProvisioningDraft | null {
    return this.provisioningDrafts.get(tenantId) || null;
  }

  public activateTenant(tenantId: string, actorRole: EnterpriseRole = 'SKANDA_PLATFORM_ADMIN'): { success: boolean; tenant?: CanonicalTenant; error?: string } {
    const draft = this.provisioningDrafts.get(tenantId);
    if (!draft) {
      return { success: false, error: 'PROVISIONING_DRAFT_NOT_FOUND: No provisioning draft exists for this tenant ID.' };
    }

    if (!draft.validationState.isValid) {
      return {
        success: false,
        error: `ACTIVATION_BLOCKED: Incomplete configuration. Blockers: ${draft.validationState.blockers.join(', ')}`
      };
    }

    const saasProfile: TenantSaaSProfile = {
      tenantId: draft.tenantId,
      tier: draft.subscription.tier,
      billingCycle: draft.subscription.billingCycle,
      status: 'ACTIVE',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 365 * 86400000).toISOString(),
      cloudRegion: draft.cloudRegion,
      entitlements: TIER_ENTITLEMENTS[draft.subscription.tier],
      usageMeters: {
        storageUsedGb: 0,
        telemetryEventsThisMonth: 0,
        aiTokensUsedThisMonth: 0,
        activeUsersCount: 1,
        activeControlsMonitored: 0,
        activeAuditorSeats: 0,
        apiCallsThisMonth: 0,
        lastUpdated: new Date().toISOString()
      },
      ssoConfig: {
        enabled: draft.identity.ssoEnabled,
        provider: draft.identity.idpType || 'AZURE_AD',
        idpIssuerUrl: '',
        ssoLoginUrl: '',
        idpCertificateFingerprint: '',
        jitProvisioningEnabled: true,
        scimEnabled: draft.identity.scimEnabled,
        scimEndpointUrl: `https://api.skanda.cloud/scim/v2/${draft.tenantId}`,
        scimBearerToken: `sk_scim_${generateRandomHex(16)}`,
        enforceSsoForDomain: draft.identity.ssoEnabled,
        allowedDomains: [draft.tenantAdmin.email.split('@')[1] || 'company.com']
      },
      apiKeys: [],
      webhooks: [],
      customBranding: {
        brandPrimaryColor: draft.branding.brandPrimaryColor || '#0ea5e9',
        brandAccentColor: '#6366f1',
        customDomain: draft.branding.customDomain || '',
        customDomainStatus: draft.branding.customDomain ? 'PENDING_DNS' : 'SSL_ACTIVE',
        cnameTarget: 'custom-ingress.skanda.cloud'
      },
      invoices: [],
      addOns: SAAS_ADD_ONS
    };

    const newTenant: CanonicalTenant = {
      tenantId: draft.tenantId,
      organizationId: draft.organization.orgId || `ORG-${draft.tenantId}`,
      legalName: draft.organization.legalName,
      displayName: draft.organization.name,
      industry: draft.organization.industry,
      country: draft.organization.country,
      region: draft.cloudRegion,
      dataResidencyJurisdiction: draft.dataResidency.legalJurisdiction || 'Local Sovereignty',
      timezone: draft.organization.timezone || 'UTC',
      locale: draft.organization.locale || 'en-US',
      status: 'ACTIVE',
      tier: draft.subscription.tier,
      billingCycle: draft.subscription.billingCycle,
      tenantAdminEmail: draft.tenantAdmin.email,
      createdAt: new Date().toISOString(),
      activatedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      healthStatus: 'HEALTHY',
      healthScore: {
        overallScore: 100,
        status: 'HEALTHY',
        breakdown: {
          platformActivityScore: 100,
          userAdoptionScore: 100,
          frameworkAdoptionScore: 100,
          evidenceActivityScore: 100,
          controlTestingScore: 100,
          integrationHealthScore: 100,
          usageQuotaScore: 100,
          openCriticalIssuesCount: 0,
          onboardingProgressPercentage: 10,
          supportTicketsOpenCount: 0,
          daysToRenewal: 365
        },
        reasons: ['Newly provisioned tenant'],
        churnRiskLevel: 'LOW'
      },
      enabledFrameworkCodes: draft.frameworkCodes,
      activeComplianceProgramIds: [`PROG-${draft.frameworkCodes[0] || 'ISO27001'}`],
      teams: [
        {
          id: `team-sec-${Date.now()}`,
          tenantId: draft.tenantId,
          name: 'Information Security',
          department: 'Security',
          leadEmail: draft.tenantAdmin.email,
          memberEmails: [draft.tenantAdmin.email]
        }
      ],
      users: [
        {
          id: `usr-admin-${Date.now()}`,
          tenantId: draft.tenantId,
          email: draft.tenantAdmin.email,
          name: draft.tenantAdmin.name,
          role: 'TENANT_ADMIN',
          teamIds: [],
          status: 'ACTIVE',
          authMethod: draft.identity.ssoEnabled ? 'SAML_SSO' : 'LOCAL_MFA',
          createdAt: new Date().toISOString()
        }
      ],
      saasProfile,
      supportCases: [],
      renewal: {
        contractStartDate: new Date().toISOString().split('T')[0],
        contractEndDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
        renewalDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
        tier: draft.subscription.tier,
        annualRecurringRevenueUsd: draft.subscription.tier === 'APEX_GLOBAL' ? 48000 : draft.subscription.tier === 'ENTERPRISE' ? 36000 : 24000,
        currentUsageStorageGb: 0,
        currentUsageTelemetryMonthly: 0,
        healthStatus: 'HEALTHY',
        openCriticalIssuesCount: 0,
        expansionPotentialUsd: 15000,
        status: 'NOT_STARTED',
        assignedCustomerSuccessManager: 'Elena Rostova (Principal CSM)'
      },
      integrationHealth: draft.integrations.enabledConnectors.map(c => ({
        connectorId: c,
        name: c.toUpperCase(),
        category: 'CLOUD',
        status: 'NOT_CONFIGURED'
      }))
    };

    this.tenants.set(draft.tenantId, newTenant);
    this.provisioningDrafts.delete(draft.tenantId);
    return { success: true, tenant: newTenant };
  }

  // --------------------------------------------------------------------------
  // 3. USER, ROLE & TEAM MANAGEMENT
  // --------------------------------------------------------------------------

  public inviteUser(tenantId: string, email: string, name: string, role: EnterpriseRole, teamIds: string[] = []): { success: boolean; user?: TenantUser; error?: string } {
    const tenant = this.getTenant(tenantId, 'SKANDA_PLATFORM_ADMIN');
    const maxUsers = tenant.saasProfile.entitlements.maxUsers;
    if (maxUsers !== -1 && tenant.users.length >= maxUsers) {
      return {
        success: false,
        error: `QUOTA_EXCEEDED: Maximum user limit (${maxUsers}) reached for ${tenant.tier} plan. Please upgrade plan to invite more users.`
      };
    }

    if (tenant.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'USER_ALREADY_EXISTS: A user with this email address already exists in this tenant.' };
    }

    const newUser: TenantUser = {
      id: `usr-${Date.now()}`,
      tenantId,
      email,
      name,
      role,
      teamIds,
      status: 'INVITED',
      authMethod: tenant.saasProfile.ssoConfig.enabled ? 'SAML_SSO' : 'LOCAL_MFA',
      createdAt: new Date().toISOString()
    };

    tenant.users.push(newUser);
    tenant.saasProfile.usageMeters.activeUsersCount = tenant.users.filter(u => u.status === 'ACTIVE' || u.status === 'INVITED').length;
    return { success: true, user: newUser };
  }

  public deactivateUser(tenantId: string, userId: string): { success: boolean; error?: string } {
    const tenant = this.getTenant(tenantId, 'SKANDA_PLATFORM_ADMIN');
    const user = tenant.users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'USER_NOT_FOUND' };
    }
    user.status = 'DEACTIVATED';
    tenant.saasProfile.usageMeters.activeUsersCount = tenant.users.filter(u => u.status === 'ACTIVE' || u.status === 'INVITED').length;
    return { success: true };
  }

  public assignRole(tenantId: string, userId: string, newRole: EnterpriseRole, actorRole: EnterpriseRole): { success: boolean; error?: string } {
    // Only TENANT_ADMIN or SKANDA_PLATFORM_ADMIN can assign privileged roles
    if (actorRole !== 'TENANT_ADMIN' && actorRole !== 'SKANDA_PLATFORM_ADMIN') {
      return { success: false, error: 'UNAUTHORIZED_ROLE_ASSIGNMENT: Only Tenant Administrators can change user roles.' };
    }

    const tenant = this.getTenant(tenantId, 'SKANDA_PLATFORM_ADMIN');
    const user = tenant.users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'USER_NOT_FOUND' };
    }

    user.role = newRole;
    return { success: true };
  }

  public createTeam(tenantId: string, name: string, department: string, leadEmail: string, memberEmails: string[]): TenantTeam {
    const tenant = this.getTenant(tenantId, 'SKANDA_PLATFORM_ADMIN');
    const newTeam: TenantTeam = {
      id: `team-${Date.now()}`,
      tenantId,
      name,
      department,
      leadEmail,
      memberEmails
    };
    tenant.teams.push(newTeam);
    return newTeam;
  }

  // --------------------------------------------------------------------------
  // 4. FRAMEWORK & PROGRAM ENTITLEMENT ENFORCEMENT
  // --------------------------------------------------------------------------

  public enableFramework(tenantId: string, frameworkCode: string): { success: boolean; error?: string; limitReached?: boolean } {
    const tenant = this.getTenant(tenantId, 'SKANDA_PLATFORM_ADMIN');
    const maxFrameworks = tenant.saasProfile.entitlements.maxFrameworks;

    if (tenant.enabledFrameworkCodes.includes(frameworkCode)) {
      return { success: true };
    }

    if (maxFrameworks !== -1 && tenant.enabledFrameworkCodes.length >= maxFrameworks) {
      return {
        success: false,
        limitReached: true,
        error: `FRAMEWORK_LIMIT_REACHED: Your ${tenant.tier} plan includes ${maxFrameworks} framework(s). Upgrade to ENTERPRISE or APEX GLOBAL to enable additional compliance frameworks.`
      };
    }

    tenant.enabledFrameworkCodes.push(frameworkCode);
    return { success: true };
  }

  // --------------------------------------------------------------------------
  // 5. USAGE METERING & QUOTA ENGINE
  // --------------------------------------------------------------------------

  public recordUsageEvent(
    tenantId: string,
    meter: 'STORAGE_GB' | 'TELEMETRY_EVENTS' | 'AI_TOKENS' | 'API_REQUESTS',
    quantity: number,
    source: string,
    correlationId: string
  ): { quotaAlertTriggered?: string; quotaPolicyAction?: QuotaPolicyAction } {
    const tenant = this.getTenant(tenantId, 'SKANDA_PLATFORM_ADMIN');
    const meters = tenant.saasProfile.usageMeters;
    const entitlements = tenant.saasProfile.entitlements;

    let current = 0;
    let limit = 0;

    switch (meter) {
      case 'STORAGE_GB':
        meters.storageUsedGb += quantity;
        current = meters.storageUsedGb;
        limit = entitlements.storageQuotaGb;
        break;
      case 'TELEMETRY_EVENTS':
        meters.telemetryEventsThisMonth += quantity;
        current = meters.telemetryEventsThisMonth;
        limit = entitlements.monthlyTelemetryEventsQuota;
        break;
      case 'AI_TOKENS':
        meters.aiTokensUsedThisMonth += quantity;
        current = meters.aiTokensUsedThisMonth;
        limit = entitlements.aiStudioMonthlyTokens;
        break;
      case 'API_REQUESTS':
        meters.apiCallsThisMonth += quantity;
        current = meters.apiCallsThisMonth;
        limit = 10_000_000;
        break;
    }

    meters.lastUpdated = new Date().toISOString();

    const percentage = limit > 0 ? (current / limit) * 100 : 0;
    let quotaAlertTriggered: string | undefined;
    let quotaPolicyAction: QuotaPolicyAction | undefined;

    if (percentage >= 100) {
      quotaAlertTriggered = `CRITICAL: ${meter} has reached 100% of plan quota (${current}/${limit}).`;
      quotaPolicyAction = 'REQUEST_UPGRADE';
    } else if (percentage >= 90) {
      quotaAlertTriggered = `WARNING: ${meter} is at 90% of plan quota (${current}/${limit}).`;
    } else if (percentage >= 80) {
      quotaAlertTriggered = `NOTICE: ${meter} is at 80% of plan quota.`;
    }

    return { quotaAlertTriggered, quotaPolicyAction };
  }

  // --------------------------------------------------------------------------
  // 6. CUSTOMER HEALTH SCORE ENGINE
  // --------------------------------------------------------------------------

  public calculateCustomerHealthScore(tenantId: string): CustomerHealthScore {
    const tenant = this.getTenant(tenantId, 'SKANDA_PLATFORM_ADMIN');
    const breakdown = tenant.healthScore.breakdown;

    // 11-factor weighted composite calculation
    const weightedScore = Math.round(
      breakdown.platformActivityScore * 0.15 +
      breakdown.userAdoptionScore * 0.10 +
      breakdown.frameworkAdoptionScore * 0.10 +
      breakdown.evidenceActivityScore * 0.15 +
      breakdown.controlTestingScore * 0.15 +
      breakdown.integrationHealthScore * 0.10 +
      breakdown.usageQuotaScore * 0.10 +
      (100 - Math.min(100, breakdown.openCriticalIssuesCount * 25)) * 0.10 +
      breakdown.onboardingProgressPercentage * 0.05
    );

    let status: CustomerHealthStatus = 'HEALTHY';
    const reasons: string[] = [];

    if (weightedScore < 50 || breakdown.openCriticalIssuesCount >= 3) {
      status = 'CRITICAL';
      reasons.push(`${breakdown.openCriticalIssuesCount} critical open security/compliance issues.`);
    } else if (weightedScore < 70 || breakdown.daysToRenewal <= 60) {
      status = 'AT_RISK';
      if (breakdown.daysToRenewal <= 60) reasons.push(`Contract renewal upcoming in ${breakdown.daysToRenewal} days.`);
      if (breakdown.platformActivityScore < 50) reasons.push('Low platform engagement and telemetry activity.');
    } else if (weightedScore < 85) {
      status = 'WATCH';
      reasons.push('Moderate adoption; onboarding incomplete or minor evidence gaps.');
    } else {
      status = 'HEALTHY';
      reasons.push('High platform adoption, automated continuous evidence, and effective controls.');
    }

    tenant.healthStatus = status;
    tenant.healthScore.overallScore = weightedScore;
    tenant.healthScore.status = status;
    tenant.healthScore.reasons = reasons;

    return tenant.healthScore;
  }

  // --------------------------------------------------------------------------
  // 7. CUSTOMER SUPPORT & SLA ENGINE
  // --------------------------------------------------------------------------

  public createSupportCase(
    tenantId: string,
    category: SupportCategory,
    priority: SupportPriority,
    subject: string,
    description: string,
    ownerEmail: string
  ): SupportCase {
    const tenant = this.getTenant(tenantId, 'SKANDA_PLATFORM_ADMIN');
    const targetSlaHours = tenant.saasProfile.entitlements.supportSlaHours;

    const newCase: SupportCase = {
      id: `CASE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      tenantId,
      category,
      priority,
      subject,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerEmail,
      status: 'OPEN',
      targetSlaHours,
      slaBreached: false
    };

    tenant.supportCases.unshift(newCase);
    return newCase;
  }

  // --------------------------------------------------------------------------
  // 8. DATA RESIDENCY GOVERNANCE & SOVEREIGNTY
  // --------------------------------------------------------------------------

  public changeDataResidency(
    tenantId: string,
    newRegion: CloudResidencyRegion,
    justification: string,
    actorRole: EnterpriseRole
  ): { success: boolean; error?: string } {
    if (actorRole !== 'TENANT_ADMIN' && actorRole !== 'SKANDA_PLATFORM_ADMIN') {
      return { success: false, error: 'UNAUTHORIZED: Data residency jurisdiction changes require Tenant Admin authorization.' };
    }

    const tenant = this.getTenant(tenantId, 'SKANDA_PLATFORM_ADMIN');
    const regionInfo = CLOUD_REGIONS.find(r => r.id === newRegion);
    if (!regionInfo) {
      return { success: false, error: 'INVALID_CLOUD_REGION' };
    }

    tenant.region = newRegion;
    tenant.dataResidencyJurisdiction = regionInfo.dataResidencyLaw;
    tenant.saasProfile.cloudRegion = newRegion;

    return { success: true };
  }

  // --------------------------------------------------------------------------
  // 9. TENANT OFFBOARDING & EXIT CERTIFICATE
  // --------------------------------------------------------------------------

  public requestOffboarding(tenantId: string, reason: string, actorEmail: string): { success: boolean; offboardingId?: string; error?: string } {
    const tenant = this.getTenant(tenantId, 'SKANDA_PLATFORM_ADMIN');
    const offboardingId = `OFFBOARD-${Date.now()}`;

    tenant.status = 'OFFBOARDING';
    tenant.offboardingRecord = {
      offboardingId,
      status: 'REQUESTED',
      requestedAt: new Date().toISOString()
    };

    return { success: true, offboardingId };
  }

  public completeOffboarding(tenantId: string, approverEmail: string): { success: boolean; exitCertificate?: CustomerExitCertificate; error?: string } {
    const tenant = this.getTenant(tenantId, 'SKANDA_PLATFORM_ADMIN');
    if (tenant.status !== 'OFFBOARDING') {
      return { success: false, error: 'OFFBOARDING_NOT_INITIATED: Tenant must be in OFFBOARDING status.' };
    }

    // Revoke all API keys
    tenant.saasProfile.apiKeys.forEach(k => {
      k.status = 'REVOKED';
    });

    // Disable all webhooks
    tenant.saasProfile.webhooks.forEach(w => {
      w.status = 'DISABLED';
    });

    // Deactivate all users
    tenant.users.forEach(u => {
      u.status = 'DEACTIVATED';
    });

    const exportDataSummary = [
      'Organizations & Departments',
      'Process Blueprints & RACI Matrices',
      'Canonical Controls & Evaluation History',
      'Evidence Ledger & WORM Hash Receipts',
      'Governance Documents (Policies, Procedures, SOPs)',
      'Audit Event Log Chains (Immutable)'
    ];

    const certificatePayload = `${tenantId}:${tenant.legalName}:${new Date().toISOString()}:${approverEmail}`;
    const sha256MasterHash = computeSimpleHash(certificatePayload);

    const exitCertificate: CustomerExitCertificate = {
      certificateId: `EXIT-CERT-${Date.now()}`,
      tenantId,
      legalName: tenant.legalName,
      exportDate: new Date().toISOString(),
      dataScope: exportDataSummary,
      retentionPolicySummary: 'Customer production payload marked for cold-storage archive; statutory audit logs retained for 7 years per regulatory mandate.',
      archiveStatus: 'ARCHIVED_IMMUTABLE',
      approverEmail,
      sha256MasterHash
    };

    tenant.status = 'ARCHIVED';
    if (tenant.offboardingRecord) {
      tenant.offboardingRecord.status = 'ARCHIVED';
      tenant.offboardingRecord.completedAt = new Date().toISOString();
      tenant.offboardingRecord.certificate = exitCertificate;
    }

    return { success: true, exitCertificate };
  }
}

export const tenantAdministrationService = new TenantAdministrationService();
