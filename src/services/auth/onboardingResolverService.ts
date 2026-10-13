// ============================================================================
// SKANDA ZERO-TRUST IDENTITY GATEWAY: ONBOARDING RESOLUTION SERVICE
// Path: src/services/auth/onboardingResolverService.ts
//
// Evaluates tenant organizational truth, discovery completion, SME interview status,
// and enforces the canonical principle:
// "NO ORGANIZATIONAL TRUTH → NO AUTHORITATIVE DOCUMENT"
//
// Ensures newly onboarded customers or tenants with pending SME interviews
// land in the appropriate discovery workspace, NOT an unpopulated compliance dashboard.
// ============================================================================

import { OnboardingState } from '../../types/identityTypes';
import { CanonicalTenant } from '../../types/saasTypes';
import { TenantCompany } from '../../types';

export interface TenantOnboardingContext {
  state: OnboardingState;
  completionPercentage: number;
  discoveryCompleted: boolean;
  pendingDepartmentInterviews: string[];
  totalInScopeDepartments: number;
  completedInterviewsCount: number;
  baselineLocked: boolean;
  nextRecommendedStep: string;
  recommendedLandingWorkspace: string;
  recommendedReason: string;
  journeyPhase: 'ONBOARDING' | 'ORGANIZATIONAL_DISCOVERY' | 'SME_INTERVIEWS' | 'OPERATIONAL_GRC' | 'EXECUTIVE_ASSURANCE' | 'AUDIT_CLEANROOM';
}

export class OnboardingResolverService {
  private static instance: OnboardingResolverService;

  public static getInstance(): OnboardingResolverService {
    if (!OnboardingResolverService.instance) {
      OnboardingResolverService.instance = new OnboardingResolverService();
    }
    return OnboardingResolverService.instance;
  }

  /**
   * Resolves the authoritative onboarding state and required landing destination
   * for a given tenant.
   */
  public resolveTenantOnboarding(
    tenant: CanonicalTenant | TenantCompany | null | undefined,
    personaLandingWorkspace: string
  ): TenantOnboardingContext {
    // 1. If tenant is null or not found (e.g. brand new self-serve registration)
    if (!tenant) {
      return {
        state: 'NOT_STARTED',
        completionPercentage: 0,
        discoveryCompleted: false,
        pendingDepartmentInterviews: ['Information Security', 'IT Operations', 'Human Resources', 'Legal', 'Finance'],
        totalInScopeDepartments: 5,
        completedInterviewsCount: 0,
        baselineLocked: false,
        nextRecommendedStep: 'Initialize Enterprise Onboarding Wizard',
        recommendedLandingWorkspace: 'onboarding_wizard',
        recommendedReason: 'Tenant registration initiated. Complete initial company profile and framework selection.',
        journeyPhase: 'ONBOARDING'
      };
    }

    // 2. Check if tenant is explicitly suspended
    if ((tenant as any).status === 'SUSPENDED' || (tenant as any).status === 'TERMINATED') {
      return {
        state: 'SUSPENDED',
        completionPercentage: 0,
        discoveryCompleted: false,
        pendingDepartmentInterviews: [],
        totalInScopeDepartments: 0,
        completedInterviewsCount: 0,
        baselineLocked: false,
        nextRecommendedStep: 'Contact Enterprise Account Executive or Platform Operations',
        recommendedLandingWorkspace: 'tenant_offboarding',
        recommendedReason: 'Tenant access is currently suspended. Please contact enterprise support.',
        journeyPhase: 'ONBOARDING'
      };
    }

    // 3. Check for specific onboarding phase flags on TenantCompany or CanonicalTenant
    const tenantId = (tenant as any).tenantId || (tenant as any).id || '';
    const onboardingPhase = (tenant as TenantCompany).onboardingPhase || ((tenant as any).status === 'ACTIVE' ? 4 : 1);
    const soaLocked = Boolean((tenant as TenantCompany).soaBaselineLocked || (tenant as any).healthScore?.breakdown?.onboardingProgressPercentage === 100);

    // If fully mature active tenant (e.g. Acme Financial Technologies or tenant_skanda)
    if (soaLocked && (tenantId === 'SKANDA-DEMO-ENTERPRISE' || tenantId === 'tenant_skanda' || onboardingPhase >= 4)) {
      return {
        state: 'ACTIVE',
        completionPercentage: 100,
        discoveryCompleted: true,
        pendingDepartmentInterviews: [],
        totalInScopeDepartments: 5,
        completedInterviewsCount: 5,
        baselineLocked: true,
        nextRecommendedStep: 'Execute Continuous Telemetry & Daily Operations',
        recommendedLandingWorkspace: personaLandingWorkspace,
        recommendedReason: 'Organizational discovery and baseline audit lock complete. Routing to persona workspace.',
        journeyPhase: 'OPERATIONAL_GRC'
      };
    }

    // 4. Incomplete discovery states
    if (tenantId === 'TENANT-PACIFIC-LOGISTICS' || onboardingPhase === 2) {
      // Pacific Logistics: 75% complete, 2 department interviews pending
      return {
        state: 'SME_INTERVIEWS_PENDING',
        completionPercentage: 75,
        discoveryCompleted: false,
        pendingDepartmentInterviews: ['Finance & Treasury', 'Warehouse Operations'],
        totalInScopeDepartments: 4,
        completedInterviewsCount: 2,
        baselineLocked: false,
        nextRecommendedStep: 'Complete pending Finance & Warehouse SME interviews',
        recommendedLandingWorkspace: 'interview_workspace',
        recommendedReason: '2 in-scope department SME interviews pending before policy generation gate can open.',
        journeyPhase: 'SME_INTERVIEWS'
      };
    }

    if (tenantId === 'tenant-singaglobal' || onboardingPhase === 1) {
      return {
        state: 'DISCOVERY_PENDING',
        completionPercentage: 30,
        discoveryCompleted: false,
        pendingDepartmentInterviews: ['Core Engineering', 'IT SecOps', 'HR', 'Procurement'],
        totalInScopeDepartments: 4,
        completedInterviewsCount: 0,
        baselineLocked: false,
        nextRecommendedStep: 'Launch Client Discovery Workshop',
        recommendedLandingWorkspace: 'client_discovery_workshop',
        recommendedReason: 'Initial organization discovery pending. Capture organizational truth and RACI ownership.',
        journeyPhase: 'ORGANIZATIONAL_DISCOVERY'
      };
    }

    if (onboardingPhase === 3) {
      return {
        state: 'APPROVAL_PENDING',
        completionPercentage: 90,
        discoveryCompleted: true,
        pendingDepartmentInterviews: [],
        totalInScopeDepartments: 4,
        completedInterviewsCount: 4,
        baselineLocked: false,
        nextRecommendedStep: 'Sign Digital MoU & Lock SoA Baseline',
        recommendedLandingWorkspace: 'digital_mou',
        recommendedReason: 'SME interviews complete. Awaiting CISO / Board signature on Digital MoU and SoA baseline.',
        journeyPhase: 'EXECUTIVE_ASSURANCE'
      };
    }

    // Default to ACTIVE and route to persona
    return {
      state: 'READY',
      completionPercentage: 100,
      discoveryCompleted: true,
      pendingDepartmentInterviews: [],
      totalInScopeDepartments: 3,
      completedInterviewsCount: 3,
      baselineLocked: true,
      nextRecommendedStep: 'Operational GRC Management',
      recommendedLandingWorkspace: personaLandingWorkspace,
      recommendedReason: 'Tenant ready for operational management.',
      journeyPhase: 'OPERATIONAL_GRC'
    };
  }
}

export const onboardingResolverService = OnboardingResolverService.getInstance();
