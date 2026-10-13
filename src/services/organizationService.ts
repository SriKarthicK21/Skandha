/**
 * SKANDA Enterprise Organization Service
 * 
 * Provides unified, dynamic organization state management, tenant resolution,
 * brand profiling, and regulatory entity metadata without hardcoded demo fixtures.
 */

import { TenantCompany } from '../types';

export interface OrganizationRecord {
  id: string;
  tenantId: string;
  legalName: string;
  displayName: string;
  country: string;
  industry: string;
  contactEmail?: string;
  selectedFrameworks?: string[];
  scopeStatement?: string;
  onboardingPhase?: number;
  readinessScore?: number;
  soaBaselineLocked?: boolean;
  isDemo?: boolean;
  createdAt?: string;
}

export interface DynamicBrandProfile {
  organizationName: string;
  brandNames: string[];
  officialDomains: string[];
  knownAliases: string[];
  primaryColor?: string;
}

class OrganizationService {
  private cachedOrgs: OrganizationRecord[] = [];
  private activeOrgId: string | null = null;

  /**
   * Resolves the display name of the current organization dynamically.
   * If tenant is provided, uses its name. If not provided or empty, returns dynamic fallback without demo names.
   */
  public getOrganizationName(tenant?: Partial<TenantCompany> | null, defaultFallback: string = 'Organization'): string {
    if (tenant?.name && tenant.name.trim().length > 0) {
      return tenant.name.trim();
    }
    const cached = this.getActiveOrganization();
    if (cached?.displayName) return cached.displayName;
    if (cached?.legalName) return cached.legalName;
    return defaultFallback;
  }

  /**
   * Returns a dynamic full legal name for formal audit reports, SoA, or regulatory filings.
   */
  public getLegalName(tenant?: Partial<TenantCompany> | null, defaultFallback: string = 'Enterprise Legal Entity'): string {
    if (tenant?.name && tenant.name.trim().length > 0) {
      return tenant.name.trim();
    }
    const cached = this.getActiveOrganization();
    if (cached?.legalName) return cached.legalName;
    return defaultFallback;
  }

  /**
   * Generates a dynamic brand profile derived from the active organization
   * for BrandGuard, Logo Detection, and Threat Intelligence pipelines.
   */
  public getBrandProfile(orgName?: string): DynamicBrandProfile {
    const name = (orgName || this.getOrganizationName(null, 'SKANDA Enterprise')).trim();
    const cleanSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const shortName = name.replace(/( Global| Operations| Solutions| Systems| Technologies| Ltd| Inc| Pte Ltd| Corp| LLC)/gi, '').trim() || name;

    return {
      organizationName: name,
      brandNames: [name, shortName, `${shortName} Security`, `${shortName} Cloud`],
      officialDomains: [`${cleanSlug}.com`, `${cleanSlug}.io`, `${cleanSlug}.security`],
      knownAliases: [`${name} Corp`, `${name} Systems`, `${name} Global`],
      primaryColor: '#4F46E5'
    };
  }

  /**
   * Checks if the organization has an active baseline initialized.
   */
  public isBaselineInitialized(tenant?: Partial<TenantCompany> | null): boolean {
    if (!tenant) return false;
    return Boolean(tenant.soaBaselineLocked && tenant.controls && tenant.controls.length > 0);
  }

  /**
   * Fetches all registered enterprise organizations from the backend API.
   */
  public async fetchOrganizations(): Promise<OrganizationRecord[]> {
    try {
      const res = await fetch('/api/v1/organizations');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (data && Array.isArray(data.organizations)) {
        this.cachedOrgs = data.organizations;
        return data.organizations;
      }
      return [];
    } catch (err) {
      console.warn('OrganizationService: Failed to fetch organizations from API, returning local cache:', err);
      return this.cachedOrgs;
    }
  }

  /**
   * Fetches a single organization record by ID.
   */
  public async fetchOrganizationById(id: string): Promise<OrganizationRecord | null> {
    try {
      const res = await fetch(`/api/v1/organizations/${encodeURIComponent(id)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.organization || null;
    } catch {
      return null;
    }
  }

  /**
   * Sets the active organization ID in memory.
   */
  public setActiveOrganizationId(orgId: string): void {
    this.activeOrgId = orgId;
  }

  /**
   * Gets the active organization from cache.
   */
  public getActiveOrganization(): OrganizationRecord | null {
    if (!this.activeOrgId) return this.cachedOrgs[0] || null;
    return this.cachedOrgs.find(o => o.id === this.activeOrgId || o.tenantId === this.activeOrgId) || this.cachedOrgs[0] || null;
  }

  /**
   * Clears in-memory and cached states to allow pristine dynamic loading.
   */
  public clearState(): void {
    this.cachedOrgs = [];
    this.activeOrgId = null;
  }
}

export const organizationService = new OrganizationService();
