// Skanda Enterprise — Logo Monitoring Repository & Multi-Tenant Storage Service
// Manages local and remote caching for Brand Assets, Logo Matches, Monitoring Jobs,
// Investigation Cases, and Takedowns with enterprise seeds for configured organizations.

import {
  EnterpriseBrandAsset,
  BrandAssetVersionRecord,
  LogoMatch,
  MonitoringSource,
  MonitoringJob,
  LogoInvestigationCase,
  LogoTakedownRequest,
  LogoMonitoringOverviewMetrics
} from '../../types/logoMonitoring';
import { LogoAssetService } from './logoAssetService';
import { LogoDetectionPipeline } from './logoDetectionPipeline';
import { LogoCorrelationEngine } from './logoCorrelationEngine';
import { organizationService } from '../organizationService';
import { safeStorage } from '../../utils/safeStorage';

const STORAGE_KEY_PREFIX = 'skanda_logo_monitoring_v1';

export class LogoMonitoringStorageService {
  /**
   * Brand Asset Registry Retrieval
   */
  public static getBrandAssets(tenantId: string = 'default_tenant'): EnterpriseBrandAsset[] {
    const key = `${STORAGE_KEY_PREFIX}_${tenantId}_assets`;
    const cached = safeStorage.getItem(key);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Fall back to seeds
      }
    }

    const seeds = this.getSeedBrandAssets(tenantId);
    safeStorage.setItem(key, JSON.stringify(seeds));
    return seeds;
  }

  public static saveBrandAssets(tenantId: string, assets: EnterpriseBrandAsset[]): void {
    const key = `${STORAGE_KEY_PREFIX}_${tenantId}_assets`;
    safeStorage.setItem(key, JSON.stringify(assets));
  }

  public static addBrandAsset(tenantId: string, asset: EnterpriseBrandAsset): void {
    const assets = this.getBrandAssets(tenantId);
    const updated = [asset, ...assets];
    this.saveBrandAssets(tenantId, updated);
  }

  public static updateBrandAsset(tenantId: string, asset: EnterpriseBrandAsset): void {
    const assets = this.getBrandAssets(tenantId);
    const updated = assets.map(a => (a.id === asset.id ? asset : a));
    this.saveBrandAssets(tenantId, updated);
  }

  public static deleteBrandAsset(tenantId: string, assetId: string): void {
    const assets = this.getBrandAssets(tenantId);
    const updated = assets.filter(a => a.id !== assetId);
    this.saveBrandAssets(tenantId, updated);
  }

  /**
   * Logo Matches Retrieval & Mutation
   */
  public static getLogoMatches(tenantId: string = 'default_tenant'): LogoMatch[] {
    const key = `${STORAGE_KEY_PREFIX}_${tenantId}_matches`;
    const cached = safeStorage.getItem(key);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Fall back
      }
    }

    const seeds = this.getSeedLogoMatches(tenantId);
    safeStorage.setItem(key, JSON.stringify(seeds));
    return seeds;
  }

  public static saveLogoMatches(tenantId: string, matches: LogoMatch[]): void {
    const key = `${STORAGE_KEY_PREFIX}_${tenantId}_matches`;
    safeStorage.setItem(key, JSON.stringify(matches));
  }

  public static updateLogoMatch(tenantId: string, match: LogoMatch): void {
    const matches = this.getLogoMatches(tenantId);
    const updated = matches.map(m => (m.id === match.id ? match : m));
    this.saveLogoMatches(tenantId, updated);
  }

  public static getLogoMatchById(tenantId: string, id: string): LogoMatch | undefined {
    return this.getLogoMatches(tenantId).find(m => m.id === id);
  }

  /**
   * Monitoring Sources
   */
  public static getMonitoringSources(tenantId: string = 'default_tenant'): MonitoringSource[] {
    const key = `${STORAGE_KEY_PREFIX}_${tenantId}_sources`;
    const cached = safeStorage.getItem(key);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }

    const seeds: MonitoringSource[] = [
      {
        id: 'src_ct_stream',
        tenantId,
        sourceType: 'PHISHING_PAGE',
        name: 'Real-Time Certificate Transparency & Live Webhook Feed',
        provider: 'Google Argon & Cloudflare Nimbus Logs',
        configuration: { crawlDepth: 1, maxConcurrentRequests: 50, respectRobotsTxt: true, userSubmittedAllowed: false },
        status: 'ACTIVE',
        legalBasis: 'Open-access RFC 6962 public cryptographic CT log stream for proactive defensive monitoring.',
        rateLimitPerMinute: 600,
        currentRequestsThisHour: 184,
        lastRunAt: new Date(Date.now() - 600000).toISOString()
      },
      {
        id: 'src_social_scanner',
        tenantId,
        sourceType: 'SOCIAL_PROFILE',
        name: 'Public Social Media Impersonation Watch',
        provider: 'Telegram, X/Twitter & LinkedIn Public APIs',
        configuration: { crawlDepth: 1, maxConcurrentRequests: 10, respectRobotsTxt: true, userSubmittedAllowed: true },
        status: 'ACTIVE',
        legalBasis: 'Public profile verification and trademark protection under platform developer agreements.',
        rateLimitPerMinute: 120,
        currentRequestsThisHour: 45,
        lastRunAt: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: 'src_ad_network_crawler',
        tenantId,
        sourceType: 'ONLINE_ADVERTISEMENT',
        name: 'Digital Ad Exchange Creative Scanner',
        provider: 'Public RTB Ad Registry & Creative Harvester',
        configuration: { crawlDepth: 2, maxConcurrentRequests: 20, respectRobotsTxt: true, userSubmittedAllowed: false },
        status: 'ACTIVE',
        legalBasis: 'Ad creative intellectual property infringement detection and brand security auditing.',
        rateLimitPerMinute: 240,
        currentRequestsThisHour: 92,
        lastRunAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'src_app_store_monitor',
        tenantId,
        sourceType: 'MOBILE_APP_LISTING',
        name: 'Alternative Android & APK Mirrors Watch',
        provider: 'APKPure, APKMirror & Public App Indexers',
        configuration: { crawlDepth: 1, maxConcurrentRequests: 15, respectRobotsTxt: true, userSubmittedAllowed: true },
        status: 'ACTIVE',
        legalBasis: 'Malicious mobile APK package signature mismatch and consumer protection.',
        rateLimitPerMinute: 100,
        currentRequestsThisHour: 28,
        lastRunAt: new Date(Date.now() - 7200000).toISOString()
      }
    ];

    safeStorage.setItem(key, JSON.stringify(seeds));
    return seeds;
  }

  /**
   * Monitoring Jobs
   */
  public static getMonitoringJobs(tenantId: string = 'default_tenant'): MonitoringJob[] {
    const key = `${STORAGE_KEY_PREFIX}_${tenantId}_jobs`;
    const cached = safeStorage.getItem(key);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }

    const seeds: MonitoringJob[] = [
      {
        id: 'job_lgo_001',
        tenantId,
        sourceId: 'src_ct_stream',
        sourceName: 'Real-Time Certificate Transparency & Live Webhook Feed',
        status: 'COMPLETED',
        startedAt: new Date(Date.now() - 1800000).toISOString(),
        completedAt: new Date(Date.now() - 1740000).toISOString(),
        candidatesDiscovered: 42,
        logosAnalyzed: 18,
        matchesIdentified: 3,
        processingDurationMs: 60000
      },
      {
        id: 'job_lgo_002',
        tenantId,
        sourceId: 'src_social_scanner',
        sourceName: 'Public Social Media Impersonation Watch',
        status: 'COMPLETED',
        startedAt: new Date(Date.now() - 3600000).toISOString(),
        completedAt: new Date(Date.now() - 3550000).toISOString(),
        candidatesDiscovered: 28,
        logosAnalyzed: 9,
        matchesIdentified: 2,
        processingDurationMs: 50000
      },
      {
        id: 'job_lgo_003',
        tenantId,
        sourceId: 'src_ad_network_crawler',
        sourceName: 'Digital Ad Exchange Creative Scanner',
        status: 'RUNNING',
        startedAt: new Date(Date.now() - 300000).toISOString(),
        candidatesDiscovered: 15,
        logosAnalyzed: 6,
        matchesIdentified: 1
      }
    ];

    safeStorage.setItem(key, JSON.stringify(seeds));
    return seeds;
  }

  public static addMonitoringJob(tenantId: string, job: MonitoringJob): void {
    const jobs = this.getMonitoringJobs(tenantId);
    const updated = [job, ...jobs];
    safeStorage.setItem(`${STORAGE_KEY_PREFIX}_${tenantId}_jobs`, JSON.stringify(updated));
  }

  /**
   * Investigation Cases
   */
  public static getInvestigationCases(tenantId: string = 'default_tenant'): LogoInvestigationCase[] {
    const key = `${STORAGE_KEY_PREFIX}_${tenantId}_cases`;
    const cached = safeStorage.getItem(key);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }

    const seeds: LogoInvestigationCase[] = [
      {
        id: 'case_lgo_01',
        tenantId,
        caseNumber: 'CASE-LGO-9812',
        logoMatchId: 'match_lgo_01',
        title: 'Institutional Phishing Clone with Primary Shield Logo on .xyz Domain',
        priority: 'CRITICAL',
        status: 'UNDER_REVIEW',
        assignedTo: 'Marcus Vance (Incident Lead)',
        summary: 'Target domain apexfintech-custody-login.xyz uses an exact visual clone of our primary gradient logo with an active 2FA credential harvesting form.',
        associatedDomain: 'apexfintech-custody-login.xyz',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'case_lgo_02',
        tenantId,
        caseNumber: 'CASE-LGO-9814',
        logoMatchId: 'match_lgo_02',
        title: 'Telegram High-Yield Investment Scam Channel Impersonating Brand Logo',
        priority: 'HIGH',
        status: 'EVIDENCE_COLLECTED',
        assignedTo: 'Priya Sharma (CISO)',
        summary: 'Telegram channel @ApexFintech_VIP_Fund using our monochrome logo with fraudulent 18% monthly yield promises.',
        associatedDomain: 't.me/ApexFintech_VIP_Fund',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 14400000).toISOString()
      }
    ];

    safeStorage.setItem(key, JSON.stringify(seeds));
    return seeds;
  }

  public static addInvestigationCase(tenantId: string, item: LogoInvestigationCase): void {
    const cases = this.getInvestigationCases(tenantId);
    const updated = [item, ...cases];
    safeStorage.setItem(`${STORAGE_KEY_PREFIX}_${tenantId}_cases`, JSON.stringify(updated));
  }

  /**
   * Takedown Requests
   */
  public static getTakedownRequests(tenantId: string = 'default_tenant'): LogoTakedownRequest[] {
    const key = `${STORAGE_KEY_PREFIX}_${tenantId}_takedowns`;
    const cached = safeStorage.getItem(key);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }

    const seeds: LogoTakedownRequest[] = [
      {
        id: 'tkd_lgo_01',
        tenantId,
        takedownNumber: 'TKD-2026-031',
        logoMatchId: 'match_lgo_01',
        targetDomain: 'apexfintech-custody-login.xyz',
        providerType: 'REGISTRAR',
        providerName: 'Namecheap Legal & Abuse Desk',
        status: 'SUBMITTED',
        externalTicketId: 'NC-ABUSE-99412',
        submittedAt: new Date(Date.now() - 28800000).toISOString(),
        evidencePackageSha256: 'e89f72c3b841a0e194827dbe1029c782193bca84019231f8204918e91823abce',
        notes: 'Dispatched automated cryptographic DMCA / Trademark Impersonation evidence package with HAR and TLS cert chain.',
        createdAt: new Date(Date.now() - 28800000).toISOString(),
        updatedAt: new Date(Date.now() - 28800000).toISOString()
      },
      {
        id: 'tkd_lgo_02',
        tenantId,
        takedownNumber: 'TKD-2026-028',
        logoMatchId: 'match_lgo_04',
        targetDomain: 'network-ad-exchange.bid',
        providerType: 'CDN',
        providerName: 'Cloudflare Trust & Safety',
        status: 'COMPLIANCE_ENFORCED',
        externalTicketId: 'CF-T&S-78210',
        submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        responseReceivedAt: new Date(Date.now() - 86400000).toISOString(),
        resolutionTimeHours: 18.5,
        evidencePackageSha256: '921bc482a019e98421bdae021948bc7219802e847192bc72019481ae982310ab',
        notes: 'Rogue advertisement landing page blocked across Cloudflare edge worldwide.',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    safeStorage.setItem(key, JSON.stringify(seeds));
    return seeds;
  }

  public static addTakedownRequest(tenantId: string, item: LogoTakedownRequest): void {
    const takedowns = this.getTakedownRequests(tenantId);
    const updated = [item, ...takedowns];
    safeStorage.setItem(`${STORAGE_KEY_PREFIX}_${tenantId}_takedowns`, JSON.stringify(updated));
  }

  // Convenience Aliases for UI Components
  public static getMatches(tenantId: string = 'default_tenant'): LogoMatch[] {
    return this.getLogoMatches(tenantId);
  }

  public static saveMatch(match: LogoMatch, tenantId: string = 'default_tenant'): void {
    this.updateLogoMatch(tenantId, match);
  }

  public static getCases(tenantId: string = 'default_tenant'): LogoInvestigationCase[] {
    return this.getInvestigationCases(tenantId);
  }

  public static saveCase(c: LogoInvestigationCase, tenantId: string = 'default_tenant'): void {
    this.addInvestigationCase(tenantId, c);
  }

  public static getTakedowns(tenantId: string = 'default_tenant'): LogoTakedownRequest[] {
    return this.getTakedownRequests(tenantId);
  }

  public static saveTakedown(t: LogoTakedownRequest, tenantId: string = 'default_tenant'): void {
    this.addTakedownRequest(tenantId, t);
  }

  public static getJobs(tenantId: string = 'default_tenant'): MonitoringJob[] {
    return this.getMonitoringJobs(tenantId);
  }

  public static saveBrandAsset(asset: EnterpriseBrandAsset, tenantId: string = 'default_tenant'): void {
    this.addBrandAsset(tenantId, asset);
  }

  /**
   * Aggregates Dashboard Overview Metrics dynamically from active records
   */
  public static getOverviewMetrics(tenantId: string = 'default_tenant'): LogoMonitoringOverviewMetrics {
    const assets = this.getBrandAssets(tenantId);
    const matches = this.getLogoMatches(tenantId);
    const cases = this.getInvestigationCases(tenantId);
    const takedowns = this.getTakedownRequests(tenantId);

    const activeAssets = assets.filter(a => a.status === 'ACTIVE').length;
    const newMatches = matches.filter(m => m.status === 'DISCOVERED' || m.status === 'POTENTIAL_MATCH').length;
    const highRiskMatches = matches.filter(m => m.riskAssessment.riskLevel === 'HIGH' || m.riskAssessment.riskLevel === 'CRITICAL').length;
    const confirmedImpersonations = matches.filter(m => m.status === 'CONFIRMED_UNAUTHORIZED_USE' || m.status === 'CONFIRMED_PHISHING').length;
    const openCases = cases.filter(c => c.status !== 'CLOSED_RESOLVED').length;
    const pendingTakedowns = takedowns.filter(t => t.status === 'DRAFT' || t.status === 'SUBMITTED' || t.status === 'IN_REVIEW_BY_PROVIDER').length;

    // Distributions
    let b90 = 0, b75 = 0, b50 = 0, bLow = 0;
    let crit = 0, high = 0, med = 0, low = 0, info = 0;

    matches.forEach(m => {
      if (m.similarityScore >= 90) b90++;
      else if (m.similarityScore >= 75) b75++;
      else if (m.similarityScore >= 50) b50++;
      else bLow++;

      switch (m.riskAssessment.riskLevel) {
        case 'CRITICAL': crit++; break;
        case 'HIGH': high++; break;
        case 'MEDIUM': med++; break;
        case 'LOW': low++; break;
        default: info++; break;
      }
    });

    // Source Distribution
    const sourceCountMap: Record<string, number> = {};
    matches.forEach(m => {
      sourceCountMap[m.sourceType] = (sourceCountMap[m.sourceType] || 0) + 1;
    });
    const sourceDistribution = Object.entries(sourceCountMap).map(([k, v]) => ({
      sourceType: k as any,
      label: k.replace(/_/g, ' '),
      count: v
    }));

    // Top Impersonating Domains
    const domainMap: Record<string, { count: number; highestRisk: any; status: any }> = {};
    matches.forEach(m => {
      if (!domainMap[m.targetDomain]) {
        domainMap[m.targetDomain] = { count: 0, highestRisk: m.riskAssessment.riskLevel, status: m.status };
      }
      domainMap[m.targetDomain].count++;
    });
    const topImpersonatingDomains = Object.entries(domainMap).map(([domain, data]) => ({
      domain,
      matchCount: data.count,
      highestRisk: data.highestRisk,
      status: data.status
    }));

    return {
      registeredBrandAssetsCount: assets.length,
      activeLogoAssetsCount: activeAssets,
      totalLogoMatchesCount: matches.length,
      newMatchesCount: newMatches,
      highRiskMatchesCount: highRiskMatches,
      confirmedImpersonationsCount: confirmedImpersonations,
      openInvestigationsCount: openCases,
      pendingTakedownsCount: pendingTakedowns,
      similarityDistribution: {
        bracket_90_100: b90,
        bracket_75_89: b75,
        bracket_50_74: b50,
        bracket_below_50: bLow
      },
      riskDistribution: {
        critical: crit,
        high: high,
        medium: med,
        low: low,
        informational: info
      },
      sourceDistribution,
      detectionTrendDaily: [
        { date: '2026-09-08', candidatesScanned: 110, potentialMatches: 6, highRiskImpersonations: 2 },
        { date: '2026-09-09', candidatesScanned: 135, potentialMatches: 8, highRiskImpersonations: 3 },
        { date: '2026-09-10', candidatesScanned: 160, potentialMatches: 11, highRiskImpersonations: 4 },
        { date: '2026-09-11', candidatesScanned: 140, potentialMatches: 9, highRiskImpersonations: 3 },
        { date: '2026-09-12', candidatesScanned: 175, potentialMatches: 14, highRiskImpersonations: 5 },
        { date: '2026-09-13', candidatesScanned: 190, potentialMatches: 12, highRiskImpersonations: 4 },
        { date: '2026-09-14', candidatesScanned: 145, potentialMatches: 10, highRiskImpersonations: 3 }
      ],
      topImpersonatingDomains
    };
  }

  /**
   * High-fidelity enterprise seed brand assets for configured organization
   */
  private static getSeedBrandAssets(tenantId: string): EnterpriseBrandAsset[] {
    const v1_primary: BrandAssetVersionRecord = {
      id: 'ver_apex_logo_01_v1',
      brandAssetId: 'asset_apex_logo_01',
      tenantId,
      version: 1,
      fileReference: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60',
      fileType: 'image/svg+xml',
      fileSize: 48120,
      dimensions: { width: 512, height: 160 },
      sha256: '7fa3e91b8a02c892b1a9384bc192083419203841923841029384019238410293',
      perceptualHash: 'e78193f4b82c10aa',
      embeddingReference: 'vec_emb_apex_shield_v1',
      backgroundType: 'TRANSPARENT',
      colorPalette: ['#4F46E5', '#6366F1', '#0F172A', '#F8FAFC'],
      ocrText: 'APEX FINTECH SOLUTIONS GLOBAL PTE LTD',
      createdBy: 'Karthik Jagannathan (CEO)',
      changeReason: 'Initial registration of enterprise primary corporate mark and typography.',
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
      auditEventId: 'audit_init_asset_01'
    };

    const v1_mono: BrandAssetVersionRecord = {
      id: 'ver_apex_logo_02_v1',
      brandAssetId: 'asset_apex_logo_02',
      tenantId,
      version: 1,
      fileReference: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=300&auto=format&fit=crop&q=60',
      fileType: 'image/png',
      fileSize: 34190,
      dimensions: { width: 256, height: 256 },
      sha256: 'c42177a83d91b01e827102938471920384192038419238410293840192384102',
      perceptualHash: 'c42177a83d91b01e',
      embeddingReference: 'vec_emb_apex_mono_v1',
      backgroundType: 'DARK',
      colorPalette: ['#0F172A', '#FFFFFF'],
      ocrText: 'APEX MONOCHROME EMBLEM',
      createdBy: 'Priya Sharma (CISO)',
      changeReason: 'Registration of high-contrast monochrome emblem for hardware security keys.',
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      auditEventId: 'audit_init_asset_02'
    };

    const v1_favicon: BrandAssetVersionRecord = {
      id: 'ver_apex_logo_03_v1',
      brandAssetId: 'asset_apex_logo_03',
      tenantId,
      version: 1,
      fileReference: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&auto=format&fit=crop&q=60',
      fileType: 'image/png',
      fileSize: 4210,
      dimensions: { width: 64, height: 64 },
      sha256: '8a91c47fe12b4d99827102938471920384192038419238410293840192384102',
      perceptualHash: '8a91c47fe12b4d99',
      embeddingReference: 'vec_emb_apex_fav_v1',
      backgroundType: 'TRANSPARENT',
      colorPalette: ['#4F46E5', '#38BDF8'],
      ocrText: 'AFS',
      createdBy: 'Marcus Vance (CTO)',
      changeReason: 'Standard browser 64px hex favicon.',
      createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
      auditEventId: 'audit_init_asset_03'
    };

    const brandName = organizationService.getOrganizationName(null, 'Enterprise Protected Entity');
    const cleanSlug = brandName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'enterprise';
    const domain = `${cleanSlug}.com`;

    return [
      {
        id: 'asset_apex_logo_01',
        tenantId,
        brandId: `brand_${tenantId}`,
        name: `${brandName} Primary Shield & Corporate Wordmark`,
        assetType: 'PRIMARY_LOGO',
        brandName,
        description: 'Primary visual corporate identity mark with electric indigo gradient shield and bold typographic wordmark.',
        currentVersion: 1,
        status: 'ACTIVE',
        isApproved: true,
        uploadDate: new Date(Date.now() - 90 * 86400000).toISOString(),
        uploadedBy: 'Karthik Jagannathan (CEO)',
        fileType: 'image/svg+xml',
        fileSize: 48120,
        dimensions: { width: 512, height: 160 },
        sha256: v1_primary.sha256,
        perceptualHash: v1_primary.perceptualHash,
        embeddingReference: v1_primary.embeddingReference,
        backgroundType: 'TRANSPARENT',
        colorPalette: ['#4F46E5', '#6366F1', '#0F172A', '#F8FAFC'],
        ocrText: `${brandName.toUpperCase()} GLOBAL ENTITY`,
        associatedDomain: domain,
        associatedProducts: ['Skanda GRC Platform', 'Enterprise Gateway', 'Cloud Infrastructure'],
        associatedServices: ['Institutional Custody', 'Algorithmic Execution', 'Automated Compliance Telemetry'],
        officialUsageLocations: ['Corporate Website Header', 'Official Pitch Decks', 'Verified Financial Disclosures'],
        effectiveDate: '2024-01-01T00:00:00Z',
        notes: 'Master trademark registered with USPTO and IPOS.',
        tags: ['primary', 'corporate', 'wordmark', 'gradient', 'shield'],
        createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 90 * 86400000).toISOString(),
        versionHistory: [v1_primary]
      },
      {
        id: 'asset_apex_logo_02',
        tenantId,
        brandId: `brand_${tenantId}`,
        name: `${brandName} Monochrome Dark Symbol & Hardware Token Icon`,
        assetType: 'MONOCHROME_LOGO',
        brandName,
        description: 'High-contrast monochrome icon mark for physical 2FA hardware tokens and dark mode UI widgets.',
        currentVersion: 1,
        status: 'ACTIVE',
        isApproved: true,
        uploadDate: new Date(Date.now() - 60 * 86400000).toISOString(),
        uploadedBy: 'Priya Sharma (CISO)',
        fileType: 'image/png',
        fileSize: 34190,
        dimensions: { width: 256, height: 256 },
        sha256: v1_mono.sha256,
        perceptualHash: v1_mono.perceptualHash,
        embeddingReference: v1_mono.embeddingReference,
        backgroundType: 'DARK',
        colorPalette: ['#0F172A', '#FFFFFF'],
        ocrText: `${brandName.toUpperCase()} MONOCHROME EMBLEM`,
        associatedDomain: domain,
        associatedProducts: ['Hardware Security Modules', 'Cold Custody Signers'],
        associatedServices: ['Cryptographic Multi-Sig Verification'],
        officialUsageLocations: ['Hardware Signer Displays', 'Command Line Utilities'],
        effectiveDate: '2024-03-01T00:00:00Z',
        notes: 'Monochrome vector format with zero gradient.',
        tags: ['monochrome', 'hardware', 'dark-mode', 'symbol'],
        createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
        versionHistory: [v1_mono]
      },
      {
        id: 'asset_apex_logo_03',
        tenantId,
        brandId: `brand_${tenantId}`,
        name: `${brandName} Cryptographic Hexagon Favicon & Browser Tab Icon`,
        assetType: 'FAVICON',
        brandName,
        description: 'Official 64x64 browser favicon rendered across verified web portals.',
        currentVersion: 1,
        status: 'ACTIVE',
        isApproved: true,
        uploadDate: new Date(Date.now() - 45 * 86400000).toISOString(),
        uploadedBy: 'Marcus Vance (CTO)',
        fileType: 'image/png',
        fileSize: 4210,
        dimensions: { width: 64, height: 64 },
        sha256: v1_favicon.sha256,
        perceptualHash: v1_favicon.perceptualHash,
        embeddingReference: v1_favicon.embeddingReference,
        backgroundType: 'TRANSPARENT',
        colorPalette: ['#4F46E5', '#38BDF8'],
        ocrText: brandName.substring(0, 3).toUpperCase(),
        associatedDomain: domain,
        associatedProducts: ['Web Portal', 'Developer API Docs'],
        associatedServices: ['Browser Security'],
        officialUsageLocations: ['Browser Tab Favicon'],
        effectiveDate: '2024-04-01T00:00:00Z',
        notes: 'Strictly monitored for rogue favicon typosquatting.',
        tags: ['favicon', 'tab-icon', 'hex'],
        createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 45 * 86400000).toISOString(),
        versionHistory: [v1_favicon]
      }
    ];
  }

  /**
   * High-fidelity enterprise seed logo matches correlated with threat feeds
   */
  private static getSeedLogoMatches(tenantId: string): LogoMatch[] {
    const assets = this.getSeedBrandAssets(tenantId);
    const primaryAsset = assets[0];
    const monoAsset = assets[1];
    const favAsset = assets[2];

    const candidates = LogoDetectionPipeline.discoverPermittedCandidates(primaryAsset.brandName);

    // Build Match 1: Critical Phishing Login Page
    const cand1 = candidates[0];
    const pipe1 = LogoDetectionPipeline.analyzeCandidateLogo(cand1, primaryAsset, 'OPENCLIP_VIT_EMBEDDING');
    const corr1 = LogoCorrelationEngine.correlateSignals(
      pipe1,
      primaryAsset,
      cand1.sourceUrl,
      cand1.targetDomain,
      cand1.pageHasLoginForm,
      cand1.scrapedOcrText
    );

    const match1: LogoMatch = {
      id: 'match_lgo_01',
      tenantId,
      matchCode: 'LGO-2026-0041',
      brandAssetId: primaryAsset.id,
      brandAssetVersionId: primaryAsset.versionHistory[0].id,
      brandAssetName: primaryAsset.name,
      officialLogoUrl: primaryAsset.versionHistory[0].fileReference,
      sourceId: cand1.sourceId,
      sourceType: cand1.sourceType,
      sourceUrl: cand1.sourceUrl,
      targetDomain: cand1.targetDomain,
      detectedImageUrl: cand1.discoveredImageUrl,
      detectedImageDimensions: cand1.imageDimensions,
      detectedRegionCoordinates: pipe1.detectedRegionCoordinates,
      similarityScore: 98,
      aiConfidence: 99,
      aiVisionProvider: 'OPENCLIP_VIT_EMBEDDING',
      aiAnalysisState: 'COMPLETED',
      transformations: pipe1.transformations,
      status: 'SUSPECTED_IMPERSONATION',
      riskAssessment: corr1.riskAssessment,
      correlations: corr1.correlations,
      evidenceList: [
        {
          id: 'evi_01_shot',
          logoMatchId: 'match_lgo_01',
          evidenceType: 'SCREENSHOT',
          evidenceValue: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          confidence: 99,
          source: 'Headless Chromium Isolated Sandbox',
          collectedAt: new Date(Date.now() - 3600000).toISOString(),
          sha256Hash: 'a8b7c6d5e4f3a2b10987654321fedcba0987654321fedcba0987654321fedcba',
          immutableReference: 's3://skanda-evidence-vault/tenant-apex/LGO-2026-0041/shot.png'
        }
      ],
      history: [
        {
          id: 'hist_01_init',
          fromStatus: 'DISCOVERED',
          toStatus: 'ANALYZED',
          actor: 'System AI Detection Pipeline',
          actorRole: 'Automated Ingestion Worker',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          reason: 'Automated OpenCLIP ViT logo embedding and OCR feature contour analysis completed.'
        },
        {
          id: 'hist_01_escalate',
          fromStatus: 'ANALYZED',
          toStatus: 'SUSPECTED_IMPERSONATION',
          actor: 'Correlation Engine Rule #402',
          actorRole: 'Autonomous Correlation Engine',
          timestamp: new Date(Date.now() - 5400000).toISOString(),
          reason: 'High logo similarity (98%) corroborated by login form, credential harvesting tokens, and bulletproof hosting ASN.'
        }
      ],
      assignedAnalyst: 'Marcus Vance (Incident Lead)',
      linkedInvestigationCaseId: 'CASE-LGO-9812',
      linkedTakedownRequestId: 'TKD-2026-031',
      isSuppressed: false,
      firstSeenAt: new Date(Date.now() - 86400000).toISOString(),
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Build Match 2: Telegram Investment Scam
    const cand2 = candidates[1];
    const pipe2 = LogoDetectionPipeline.analyzeCandidateLogo(cand2, monoAsset, 'OPENCLIP_VIT_EMBEDDING');
    const corr2 = LogoCorrelationEngine.correlateSignals(
      pipe2,
      monoAsset,
      cand2.sourceUrl,
      cand2.targetDomain,
      cand2.pageHasLoginForm,
      cand2.scrapedOcrText
    );

    const match2: LogoMatch = {
      id: 'match_lgo_02',
      tenantId,
      matchCode: 'LGO-2026-0042',
      brandAssetId: monoAsset.id,
      brandAssetVersionId: monoAsset.versionHistory[0].id,
      brandAssetName: monoAsset.name,
      officialLogoUrl: monoAsset.versionHistory[0].fileReference,
      sourceId: cand2.sourceId,
      sourceType: cand2.sourceType,
      sourceUrl: cand2.sourceUrl,
      targetDomain: cand2.targetDomain,
      detectedImageUrl: cand2.discoveredImageUrl,
      detectedImageDimensions: cand2.imageDimensions,
      detectedRegionCoordinates: pipe2.detectedRegionCoordinates,
      similarityScore: 92,
      aiConfidence: 94,
      aiVisionProvider: 'OPENCLIP_VIT_EMBEDDING',
      aiAnalysisState: 'COMPLETED',
      transformations: pipe2.transformations,
      status: 'UNDER_INVESTIGATION',
      riskAssessment: corr2.riskAssessment,
      correlations: corr2.correlations,
      evidenceList: [],
      history: [
        {
          id: 'hist_02_init',
          fromStatus: 'DISCOVERED',
          toStatus: 'POTENTIAL_MATCH',
          actor: 'System Ingestion Worker',
          actorRole: 'Autonomous Engine',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          reason: 'Monochrome emblem match identified on social media avatar.'
        },
        {
          id: 'hist_02_investigate',
          fromStatus: 'POTENTIAL_MATCH',
          toStatus: 'UNDER_INVESTIGATION',
          actor: 'Priya Sharma (CISO)',
          actorRole: 'Security Reviewer',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          reason: 'Escalated to investigation due to high-yield cryptocurrency scheme claims targeting retail clients.'
        }
      ],
      assignedAnalyst: 'Priya Sharma (CISO)',
      linkedInvestigationCaseId: 'CASE-LGO-9814',
      isSuppressed: false,
      firstSeenAt: new Date(Date.now() - 172800000).toISOString(),
      lastSeenAt: new Date(Date.now() - 3600000).toISOString(),
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString()
    };

    // Build Match 3: Typosquatting Careers / Recruitment Clone
    const cand3 = candidates[2];
    const pipe3 = LogoDetectionPipeline.analyzeCandidateLogo(cand3, primaryAsset, 'OPENCLIP_VIT_EMBEDDING');
    const corr3 = LogoCorrelationEngine.correlateSignals(
      pipe3,
      primaryAsset,
      cand3.sourceUrl,
      cand3.targetDomain,
      cand3.pageHasLoginForm,
      cand3.scrapedOcrText
    );

    const match3: LogoMatch = {
      id: 'match_lgo_03',
      tenantId,
      matchCode: 'LGO-2026-0043',
      brandAssetId: primaryAsset.id,
      brandAssetVersionId: primaryAsset.versionHistory[0].id,
      brandAssetName: primaryAsset.name,
      officialLogoUrl: primaryAsset.versionHistory[0].fileReference,
      sourceId: cand3.sourceId,
      sourceType: cand3.sourceType,
      sourceUrl: cand3.sourceUrl,
      targetDomain: cand3.targetDomain,
      detectedImageUrl: cand3.discoveredImageUrl,
      detectedImageDimensions: cand3.imageDimensions,
      detectedRegionCoordinates: pipe3.detectedRegionCoordinates,
      similarityScore: 89,
      aiConfidence: 91,
      aiVisionProvider: 'OPENCLIP_VIT_EMBEDDING',
      aiAnalysisState: 'COMPLETED',
      transformations: pipe3.transformations,
      status: 'CONFIRMED_UNAUTHORIZED_USE',
      riskAssessment: corr3.riskAssessment,
      correlations: corr3.correlations,
      evidenceList: [],
      history: [
        {
          id: 'hist_03_init',
          fromStatus: 'DISCOVERED',
          toStatus: 'CONFIRMED_UNAUTHORIZED_USE',
          actor: 'Security Operations Center',
          actorRole: 'Analyst',
          timestamp: new Date(Date.now() - 259200000).toISOString(),
          reason: 'Unauthorized recruitment portal collecting applicant PII and bank details confirmed by HR.'
        }
      ],
      assignedAnalyst: 'Alex Morgan (SOC Analyst)',
      isSuppressed: false,
      firstSeenAt: new Date(Date.now() - 259200000).toISOString(),
      lastSeenAt: new Date(Date.now() - 7200000).toISOString(),
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date(Date.now() - 7200000).toISOString()
    };

    // Build Match 4: Rogue Online Advertisement Creative
    const cand4 = candidates[3];
    const pipe4 = LogoDetectionPipeline.analyzeCandidateLogo(cand4, primaryAsset, 'OPENCLIP_VIT_EMBEDDING');
    const corr4 = LogoCorrelationEngine.correlateSignals(
      pipe4,
      primaryAsset,
      cand4.sourceUrl,
      cand4.targetDomain,
      cand4.pageHasLoginForm,
      cand4.scrapedOcrText
    );

    const match4: LogoMatch = {
      id: 'match_lgo_04',
      tenantId,
      matchCode: 'LGO-2026-0044',
      brandAssetId: primaryAsset.id,
      brandAssetVersionId: primaryAsset.versionHistory[0].id,
      brandAssetName: primaryAsset.name,
      officialLogoUrl: primaryAsset.versionHistory[0].fileReference,
      sourceId: cand4.sourceId,
      sourceType: cand4.sourceType,
      sourceUrl: cand4.sourceUrl,
      targetDomain: cand4.targetDomain,
      detectedImageUrl: cand4.discoveredImageUrl,
      detectedImageDimensions: cand4.imageDimensions,
      detectedRegionCoordinates: pipe4.detectedRegionCoordinates,
      similarityScore: 84,
      aiConfidence: 88,
      aiVisionProvider: 'OPENCLIP_VIT_EMBEDDING',
      aiAnalysisState: 'COMPLETED',
      transformations: pipe4.transformations,
      status: 'RESOLVED',
      riskAssessment: corr4.riskAssessment,
      correlations: corr4.correlations,
      evidenceList: [],
      history: [
        {
          id: 'hist_04_init',
          fromStatus: 'CONFIRMED_UNAUTHORIZED_USE',
          toStatus: 'RESOLVED',
          actor: 'Ad Exchange Trust & Safety',
          actorRole: 'External Provider',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          reason: 'Ad campaign paused and advertiser account permanently terminated by ad exchange.'
        }
      ],
      linkedTakedownRequestId: 'TKD-2026-028',
      isSuppressed: false,
      firstSeenAt: new Date(Date.now() - 345600000).toISOString(),
      lastSeenAt: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 345600000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString()
    };

    // Build Match 5: Rogue Mobile App Icon on Mirror
    const cand5 = candidates[4];
    const pipe5 = LogoDetectionPipeline.analyzeCandidateLogo(cand5, favAsset, 'OPENCLIP_VIT_EMBEDDING');
    const corr5 = LogoCorrelationEngine.correlateSignals(
      pipe5,
      favAsset,
      cand5.sourceUrl,
      cand5.targetDomain,
      cand5.pageHasLoginForm,
      cand5.scrapedOcrText
    );

    const match5: LogoMatch = {
      id: 'match_lgo_05',
      tenantId,
      matchCode: 'LGO-2026-0045',
      brandAssetId: favAsset.id,
      brandAssetVersionId: favAsset.versionHistory[0].id,
      brandAssetName: favAsset.name,
      officialLogoUrl: favAsset.versionHistory[0].fileReference,
      sourceId: cand5.sourceId,
      sourceType: cand5.sourceType,
      sourceUrl: cand5.sourceUrl,
      targetDomain: cand5.targetDomain,
      detectedImageUrl: cand5.discoveredImageUrl,
      detectedImageDimensions: cand5.imageDimensions,
      detectedRegionCoordinates: pipe5.detectedRegionCoordinates,
      similarityScore: 94,
      aiConfidence: 96,
      aiVisionProvider: 'OPENCLIP_VIT_EMBEDDING',
      aiAnalysisState: 'COMPLETED',
      transformations: pipe5.transformations,
      status: 'POTENTIAL_MATCH',
      riskAssessment: corr5.riskAssessment,
      correlations: corr5.correlations,
      evidenceList: [],
      history: [
        {
          id: 'hist_05_init',
          fromStatus: 'DISCOVERED',
          toStatus: 'POTENTIAL_MATCH',
          actor: 'Mobile Store Monitor',
          actorRole: 'Autonomous Ingestion Worker',
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          reason: 'Favicon hexagon mark detected as APK application launcher icon.'
        }
      ],
      isSuppressed: false,
      firstSeenAt: new Date(Date.now() - 14400000).toISOString(),
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 14400000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    return [match1, match2, match3, match4, match5];
  }

  /**
   * Clears all local state for logo monitoring to allow clean reload
   */
  public static clearState(tenantId?: string): void {
    if (tenantId) {
      safeStorage.removeItem(`${STORAGE_KEY_PREFIX}_${tenantId}_assets`);
      safeStorage.removeItem(`${STORAGE_KEY_PREFIX}_${tenantId}_matches`);
      safeStorage.removeItem(`${STORAGE_KEY_PREFIX}_${tenantId}_jobs`);
      safeStorage.removeItem(`${STORAGE_KEY_PREFIX}_${tenantId}_cases`);
      safeStorage.removeItem(`${STORAGE_KEY_PREFIX}_${tenantId}_takedowns`);
    } else {
      const keysToRemove: string[] = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => safeStorage.removeItem(k));
      } catch {
        // Ignore
      }
    }
  }
}
