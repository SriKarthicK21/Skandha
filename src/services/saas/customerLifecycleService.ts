// ============================================================================
// SKANDA ENTERPRISE GRC: CUSTOMER LIFECYCLE & BILLING OPERATIONS SERVICE
// Path: src/services/saas/customerLifecycleService.ts
//
// Authoritative Service governing Customer Lifecycle State Transitions, Contract
// Management, Usage-to-Billing Pipelines, Invoices, Renewal Radar & Platform Ops
// ============================================================================

import {
  CanonicalTenant,
  CustomerLifecycleState,
  EnterpriseContract,
  ContractStatus,
  CanonicalInvoice,
  CanonicalInvoiceStatus,
  InvoiceLineItem,
  UsageSnapshot,
  BillingEvent,
  CustomerSuccessPlan,
  RenewalOpportunity,
  PlatformOperationsOverview,
  EnterpriseRole,
  SubscriptionTier,
  BillingCycle,
  CloudResidencyRegion
} from '../../types/saasTypes';
import {
  tenantAdministrationService
} from './tenantAdministrationService';
import {
  TIER_ENTITLEMENTS,
  enterpriseSaaSService
} from './enterpriseSaaSService';

class CustomerLifecycleService {
  private lifecycleStates: Map<string, CustomerLifecycleState> = new Map();
  private contracts: Map<string, EnterpriseContract> = new Map();
  private invoices: Map<string, CanonicalInvoice[]> = new Map();
  private usageSnapshots: Map<string, UsageSnapshot[]> = new Map();
  private successPlans: Map<string, CustomerSuccessPlan> = new Map();
  private billingEvents: Map<string, BillingEvent[]> = new Map();

  constructor() {
    this.initializeDefaultCommercialData();
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION / SEED COMMERCIAL STATE
  // --------------------------------------------------------------------------
  private initializeDefaultCommercialData() {
    const tenantA = 'SKANDA-DEMO-ENTERPRISE'; // Acme Financial Technologies
    const tenantB = 'TENANT-PACIFIC-LOGISTICS';

    this.lifecycleStates.set(tenantA, 'ACTIVE');
    this.lifecycleStates.set(tenantB, 'AT_RISK');

    // 1. Acme Financial Technologies Contract
    const acmeContract: EnterpriseContract = {
      id: 'CNT-2026-ACME-01',
      tenantId: tenantA,
      contractNumber: 'SKD-MSA-2026-0901',
      status: 'ACTIVE',
      startDate: '2026-01-01T00:00:00Z',
      endDate: '2026-12-31T23:59:59Z',
      renewalDate: '2026-12-31T23:59:59Z',
      autoRenewal: true,
      noticePeriodDays: 60,
      committedArrUsd: 48000,
      tier: 'APEX_GLOBAL',
      contractedFrameworksCount: 5,
      contractedUsersCount: 200,
      contractedStorageGb: 10000,
      contractedEventsMonthly: 100000000,
      contractedAiTokensMonthly: 100000000,
      contractedAddOnCodes: ['PQC_SENTINEL', 'MAS_644_SIM'],
      dataResidencyCommitment: 'AWS_AP_SOUTHEAST_1',
      slaHoursCommitment: 0.25, // 15 mins
      serviceCreditsEarnedUsd: 0,
      dpaExecuted: true,
      securityCommitmentsSummary: 'Dedicated VPC Bring-Your-Own-KMS with FIPS 140-3 Level 4 WORM Ledger',
      createdAt: '2025-12-15T10:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };
    this.contracts.set(tenantA, acmeContract);

    // 2. Acme Invoices
    const acmeInvoices: CanonicalInvoice[] = [
      {
        id: 'INV-SKD-2026-0901',
        tenantId: tenantA,
        invoiceNumber: 'INV-2026-0901',
        issueDate: '2026-09-01',
        dueDate: '2026-09-30',
        status: 'PAID',
        subtotalUsd: 48000,
        taxAmountUsd: 0,
        creditAppliedUsd: 0,
        totalAmountUsd: 48000,
        currency: 'USD',
        lineItems: [
          {
            id: 'li-01',
            description: 'APEX Global Enterprise Annual Subscription (2026)',
            quantity: 1,
            unitPriceUsd: 48000,
            amountUsd: 48000,
            category: 'BASE_SUBSCRIPTION'
          }
        ],
        paymentMethod: 'Corporate Wire (JPMorgan Chase ****4190)',
        paidAt: '2026-09-10T14:00:00Z',
        finalizedAt: '2026-09-01T08:00:00Z'
      }
    ];
    this.invoices.set(tenantA, acmeInvoices);

    // 3. Acme Customer Success Plan
    const acmeSuccessPlan: CustomerSuccessPlan = {
      id: 'CSP-ACME-01',
      tenantId: tenantA,
      assignedCsm: 'Elena Rostova (Principal CSM)',
      overallAdoptionTargetPercent: 95,
      currentAdoptionPercent: 92,
      milestones: [
        {
          id: 'ms-01',
          title: 'Complete MAS Notice 644 Simulator Configuration',
          targetDate: '2026-10-15',
          completedDate: '2026-10-04',
          status: 'COMPLETED',
          owner: 'ciso@acmefintech.io'
        },
        {
          id: 'ms-02',
          title: 'Continuous Telemetry Ingestion Tuning (>4M events/mo)',
          targetDate: '2026-11-01',
          status: 'IN_PROGRESS',
          owner: 'sec.lead@acmefintech.io'
        },
        {
          id: 'ms-03',
          title: 'Stage-2 External Audit Pack Finalization',
          targetDate: '2026-11-30',
          status: 'PENDING',
          owner: 'lead.auditor@external-assurance.sg'
        }
      ],
      blockers: [],
      auditReadinessTargetDate: '2026-12-01',
      updatedAt: '2026-10-06T08:00:00Z'
    };
    this.successPlans.set(tenantA, acmeSuccessPlan);

    // 4. Pacific Logistics Contract
    const pacificContract: EnterpriseContract = {
      id: 'CNT-2025-PAC-01',
      tenantId: tenantB,
      contractNumber: 'SKD-MSA-2025-1120',
      status: 'EXPIRING',
      startDate: '2025-11-20T00:00:00Z',
      endDate: '2026-11-20T23:59:59Z',
      renewalDate: '2026-11-20T23:59:59Z',
      autoRenewal: false,
      noticePeriodDays: 45,
      committedArrUsd: 24000,
      tier: 'GROWTH',
      contractedFrameworksCount: 3,
      contractedUsersCount: 50,
      contractedStorageGb: 250,
      contractedEventsMonthly: 1000000,
      contractedAiTokensMonthly: 2000000,
      contractedAddOnCodes: [],
      dataResidencyCommitment: 'AWS_EU_CENTRAL_1',
      slaHoursCommitment: 8,
      serviceCreditsEarnedUsd: 0,
      dpaExecuted: true,
      securityCommitmentsSummary: 'EU GDPR Local Storage & BSI C5 Compliance',
      createdAt: '2025-11-10T10:00:00Z',
      updatedAt: '2026-09-20T00:00:00Z'
    };
    this.contracts.set(tenantB, pacificContract);
  }

  // --------------------------------------------------------------------------
  // 1. CUSTOMER LIFECYCLE STATE MACHINE
  // --------------------------------------------------------------------------

  public getLifecycleState(tenantId: string): CustomerLifecycleState {
    return this.lifecycleStates.get(tenantId) || 'ACTIVE';
  }

  public transitionLifecycleState(
    tenantId: string,
    targetState: CustomerLifecycleState,
    actorEmail: string,
    actorRole: EnterpriseRole,
    reason: string
  ): { success: boolean; error?: string; previousState?: CustomerLifecycleState } {
    // Only TENANT_ADMIN or SKANDA_PLATFORM_ADMIN can transition state
    if (actorRole !== 'SKANDA_PLATFORM_ADMIN' && actorRole !== 'TENANT_ADMIN') {
      return {
        success: false,
        error: `UNAUTHORIZED_LIFECYCLE_TRANSITION: Role '${actorRole}' is not authorized to transition customer lifecycle state.`
      };
    }

    const previousState = this.getLifecycleState(tenantId);
    this.lifecycleStates.set(tenantId, targetState);

    // Update canonical tenant status if corresponding
    const tenant = tenantAdministrationService.getTenant(tenantId, 'SKANDA_PLATFORM_ADMIN');
    if (targetState === 'SUSPENDED') tenant.status = 'SUSPENDED';
    if (targetState === 'OFFBOARDING') tenant.status = 'OFFBOARDING';
    if (targetState === 'ARCHIVED') tenant.status = 'ARCHIVED';
    if (targetState === 'ACTIVE') tenant.status = 'ACTIVE';

    return { success: true, previousState };
  }

  // --------------------------------------------------------------------------
  // 2. CONTRACT MANAGEMENT ENGINE
  // --------------------------------------------------------------------------

  public getContract(tenantId: string, callingRole: EnterpriseRole = 'TENANT_ADMIN', callingTenantId?: string): EnterpriseContract | null {
    if (callingRole !== 'SKANDA_PLATFORM_ADMIN' && callingTenantId && callingTenantId !== tenantId) {
      throw new Error(`ACCESS_DENIED: Cross-tenant contract access violation. Tenant '${callingTenantId}' cannot view contracts for '${tenantId}'.`);
    }

    return this.contracts.get(tenantId) || null;
  }

  public createContract(contract: Omit<EnterpriseContract, 'id' | 'createdAt' | 'updatedAt'>, actorRole: EnterpriseRole): { success: boolean; contract?: EnterpriseContract; error?: string } {
    if (actorRole !== 'SKANDA_PLATFORM_ADMIN') {
      return { success: false, error: 'UNAUTHORIZED: Only SKANDA Platform Administrators can create enterprise contracts.' };
    }

    const newContract: EnterpriseContract = {
      ...contract,
      id: `CNT-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.contracts.set(contract.tenantId, newContract);
    return { success: true, contract: newContract };
  }

  // --------------------------------------------------------------------------
  // 3. USAGE-TO-BILLING PIPELINE & OVERAGE ENGINE
  // --------------------------------------------------------------------------

  public generateUsageSnapshot(tenantId: string): UsageSnapshot {
    const tenant = tenantAdministrationService.getTenant(tenantId, 'SKANDA_PLATFORM_ADMIN');
    const meters = tenant.saasProfile.usageMeters;
    const entitlements = tenant.saasProfile.entitlements;

    const storageOverage = Math.max(0, meters.storageUsedGb - entitlements.storageQuotaGb);
    const telemetryOverage = Math.max(0, meters.telemetryEventsThisMonth - entitlements.monthlyTelemetryEventsQuota);
    const aiTokensOverage = Math.max(0, meters.aiTokensUsedThisMonth - entitlements.aiStudioMonthlyTokens);
    const isOverage = storageOverage > 0 || telemetryOverage > 0 || aiTokensOverage > 0;

    const snapshot: UsageSnapshot = {
      id: `SNAP-${Date.now()}`,
      tenantId,
      snapshotTimestamp: new Date().toISOString(),
      billingPeriod: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
      activeUsers: meters.activeUsersCount,
      monitoredControls: meters.activeControlsMonitored,
      evidenceStorageGb: meters.storageUsedGb,
      wormStorageGb: meters.storageUsedGb,
      telemetryEventsCount: meters.telemetryEventsThisMonth,
      apiRequestsCount: meters.apiCallsThisMonth,
      aiTokensConsumed: meters.aiTokensUsedThisMonth,
      activeConnectorsCount: tenant.integrationHealth.length,
      isOverageDetected: isOverage,
      overageDetails: isOverage ? {
        storageGbOverage: storageOverage,
        telemetryEventsOverage: telemetryOverage,
        aiTokensOverage: aiTokensOverage
      } : undefined
    };

    const existing = this.usageSnapshots.get(tenantId) || [];
    existing.unshift(snapshot);
    this.usageSnapshots.set(tenantId, existing);

    return snapshot;
  }

  public generateInvoice(
    tenantId: string,
    billingCycle: BillingCycle = 'ANNUAL',
    actorRole: EnterpriseRole = 'SKANDA_PLATFORM_ADMIN'
  ): { success: boolean; invoice?: CanonicalInvoice; error?: string } {
    if (actorRole !== 'SKANDA_PLATFORM_ADMIN') {
      return { success: false, error: 'UNAUTHORIZED: Only SKANDA Platform Administrators can generate invoices.' };
    }

    const tenant = tenantAdministrationService.getTenant(tenantId, 'SKANDA_PLATFORM_ADMIN');
    const snapshot = this.generateUsageSnapshot(tenantId);

    const baseAmountMap: Record<SubscriptionTier, number> = {
      STARTER: billingCycle === 'ANNUAL' ? 12000 : 1200,
      GROWTH: billingCycle === 'ANNUAL' ? 24000 : 2400,
      ENTERPRISE: billingCycle === 'ANNUAL' ? 36000 : 3600,
      APEX_GLOBAL: billingCycle === 'ANNUAL' ? 48000 : 4800
    };

    const lineItems: InvoiceLineItem[] = [
      {
        id: `li-base-${Date.now()}`,
        description: `${tenant.tier} Tier (${billingCycle}) Base GRC Subscription`,
        quantity: 1,
        unitPriceUsd: baseAmountMap[tenant.tier],
        amountUsd: baseAmountMap[tenant.tier],
        category: 'BASE_SUBSCRIPTION'
      }
    ];

    // Add active add-ons
    tenant.saasProfile.addOns.filter(a => a.enabled).forEach(a => {
      const addonAmount = billingCycle === 'ANNUAL' ? a.priceMonthlyUsd * 12 : a.priceMonthlyUsd;
      lineItems.push({
        id: `li-addon-${a.id}`,
        description: `Add-on: ${a.name}`,
        quantity: 1,
        unitPriceUsd: addonAmount,
        amountUsd: addonAmount,
        category: 'ADDON'
      });
    });

    // Add overages if detected
    if (snapshot.isOverageDetected && snapshot.overageDetails) {
      if (snapshot.overageDetails.storageGbOverage > 0) {
        const storageCost = snapshot.overageDetails.storageGbOverage * 5; // $5/GB
        lineItems.push({
          id: `li-ovg-storage-${Date.now()}`,
          description: `WORM Vault Storage Overage (${snapshot.overageDetails.storageGbOverage} GB @ $5/GB)`,
          quantity: snapshot.overageDetails.storageGbOverage,
          unitPriceUsd: 5,
          amountUsd: storageCost,
          category: 'STORAGE_OVERAGE'
        });
      }
    }

    const subtotal = lineItems.reduce((acc, item) => acc + item.amountUsd, 0);

    const newInvoice: CanonicalInvoice = {
      id: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      tenantId,
      invoiceNumber: `INV-SKD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'FINALIZED',
      subtotalUsd: subtotal,
      taxAmountUsd: 0,
      creditAppliedUsd: 0,
      totalAmountUsd: subtotal,
      currency: 'USD',
      lineItems,
      paymentMethod: 'Corporate Wire / Enterprise Net-30',
      finalizedAt: new Date().toISOString()
    };

    const existingInvoices = this.invoices.get(tenantId) || [];
    existingInvoices.unshift(newInvoice);
    this.invoices.set(tenantId, existingInvoices);

    // Record Billing Event
    const billingEvent: BillingEvent = {
      id: `BEV-${Date.now()}`,
      tenantId,
      eventType: 'INVOICE_GENERATED',
      quantity: 1,
      amountUsd: subtotal,
      timestamp: new Date().toISOString(),
      correlationId: `CORR-INV-${newInvoice.id}`,
      auditProvenanceHash: `sha256_${Date.now()}_${subtotal}`
    };

    const existingEvents = this.billingEvents.get(tenantId) || [];
    existingEvents.unshift(billingEvent);
    this.billingEvents.set(tenantId, existingEvents);

    return { success: true, invoice: newInvoice };
  }

  public getInvoices(tenantId: string, callingRole: EnterpriseRole = 'TENANT_ADMIN', callingTenantId?: string): CanonicalInvoice[] {
    if (callingRole !== 'SKANDA_PLATFORM_ADMIN' && callingTenantId && callingTenantId !== tenantId) {
      throw new Error(`ACCESS_DENIED: Cross-tenant billing access violation. Tenant '${callingTenantId}' cannot view invoices for '${tenantId}'.`);
    }

    return this.invoices.get(tenantId) || [];
  }

  // --------------------------------------------------------------------------
  // 4. CUSTOMER SUCCESS 2.0 & RENEWAL RADAR
  // --------------------------------------------------------------------------

  public getCustomerSuccessPlan(tenantId: string): CustomerSuccessPlan {
    let plan = this.successPlans.get(tenantId);
    if (!plan) {
      plan = {
        id: `CSP-${tenantId}`,
        tenantId,
        assignedCsm: 'Elena Rostova (Principal CSM)',
        overallAdoptionTargetPercent: 90,
        currentAdoptionPercent: 80,
        milestones: [
          { id: 'ms-01', title: 'Complete Organizational Discovery Interview', targetDate: '2026-11-01', status: 'IN_PROGRESS', owner: 'Admin' }
        ],
        blockers: [],
        auditReadinessTargetDate: '2026-12-31',
        updatedAt: new Date().toISOString()
      };
      this.successPlans.set(tenantId, plan);
    }
    return plan;
  }

  public evaluateRenewalOpportunity(tenantId: string): RenewalOpportunity {
    const tenant = tenantAdministrationService.getTenant(tenantId, 'SKANDA_PLATFORM_ADMIN');
    const contract = this.getContract(tenantId, 'SKANDA_PLATFORM_ADMIN');
    const health = tenantAdministrationService.calculateCustomerHealthScore(tenantId);

    const daysToRenewal = health.breakdown.daysToRenewal;
    let renewalRiskScore = 0;
    const riskReasons: string[] = [];

    if (health.status === 'CRITICAL' || health.status === 'AT_RISK') {
      renewalRiskScore += 45;
      riskReasons.push(`Customer health is ${health.status} (${health.overallScore}%) with open critical issues.`);
    }

    if (daysToRenewal <= 60) {
      renewalRiskScore += 30;
      riskReasons.push(`Renewal date is within ${daysToRenewal} days.`);
    }

    if (health.breakdown.integrationHealthScore < 80) {
      renewalRiskScore += 15;
      riskReasons.push('Degraded cloud or identity connector telemetry.');
    }

    // Expansion potential calculation
    let expansionRecommendation: string | undefined;
    let expansionArrPotentialUsd = 0;

    const userCount = tenant.saasProfile.usageMeters.activeUsersCount;
    const maxUsers = tenant.saasProfile.entitlements.maxUsers;
    if (maxUsers !== -1 && userCount >= maxUsers * 0.8) {
      expansionRecommendation = `User seat utilization is at ${Math.round((userCount / maxUsers) * 100)}% (${userCount}/${maxUsers}). Recommend upgrading to next tier or purchasing 50 additional user seats.`;
      expansionArrPotentialUsd += 12000;
    }

    return {
      id: `REN-OPP-${tenantId}`,
      tenantId,
      contractEndDate: contract?.endDate || '2026-12-31',
      daysToRenewal,
      renewalRiskScore: Math.min(100, renewalRiskScore),
      riskReasons,
      expansionRecommendation,
      expansionArrPotentialUsd,
      status: renewalRiskScore >= 50 ? 'IN_REVIEW' : 'IDENTIFIED'
    };
  }

  // --------------------------------------------------------------------------
  // 5. PLATFORM OPERATIONS OVERVIEW (SUPERADMIN ONLY)
  // --------------------------------------------------------------------------

  public getPlatformOperationsOverview(callingRole: EnterpriseRole): PlatformOperationsOverview {
    if (callingRole !== 'SKANDA_PLATFORM_ADMIN') {
      throw new Error('ACCESS_DENIED: Only SKANDA_PLATFORM_ADMIN can access Platform Operations Revenue Overview.');
    }

    const allTenants = tenantAdministrationService.getAllTenants('SKANDA_PLATFORM_ADMIN');
    const totalArr = allTenants.reduce((acc, t) => acc + (t.renewal?.annualRecurringRevenueUsd || 0), 0);
    const totalExpansion = allTenants.reduce((acc, t) => acc + (t.renewal?.expansionPotentialUsd || 0), 0);
    const churnRiskCount = allTenants.filter(t => t.healthStatus === 'AT_RISK' || t.healthStatus === 'CRITICAL').length;
    const avgHealth = Math.round(
      allTenants.reduce((acc, t) => acc + t.healthScore.overallScore, 0) / (allTenants.length || 1)
    );

    return {
      totalTenantsCount: allTenants.length,
      activeTenantsCount: allTenants.filter(t => t.status === 'ACTIVE').length,
      totalArrUsd: totalArr,
      totalMrrUsd: Math.round(totalArr / 12),
      expansionPipelineUsd: totalExpansion,
      churnRiskTenantsCount: churnRiskCount,
      averagePortfolioHealthScore: avgHealth,
      upcomingRenewals90DaysCount: allTenants.filter(t => t.healthScore.breakdown.daysToRenewal <= 90).length,
      openCriticalIncidentsCount: 0,
      activeSlaBreachesCount: 0
    };
  }
}

export const customerLifecycleService = new CustomerLifecycleService();
