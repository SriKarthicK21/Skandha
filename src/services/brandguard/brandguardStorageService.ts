// Skanda BrandGuard — Multi-Tenant Storage & Repository Service
// Persistent local storage manager with complete tenant isolation, enterprise seed profiles,
// decision audit logging, and false-positive exceptions.

import {
  BrandAsset,
  BrandFinding,
  BrandFindingStatus,
  BrandGuardDashboardMetrics,
  BrandProfile,
  CommercialTier,
  ExecutiveProfile,
  MonitoringProfile,
  IgnoredDomainRecord
} from '../../types/brandguard';
import { organizationService } from '../organizationService';
import { safeStorage } from '../../utils/safeStorage';
import { brandGuardNotificationService } from './brandguardNotificationService';

const STORAGE_PREFIX = 'skanda_brandguard_v1';

export class BrandGuardStorageService {
  /**
   * Retrieves or initializes the organization Brand Profile for a tenant
   */
  public static getBrandProfile(tenantId: string = 'default_tenant'): BrandProfile {
    const key = `${STORAGE_PREFIX}_${tenantId}_profile`;
    const saved = safeStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall back to seed
      }
    }

    const orgName = organizationService.getOrganizationName(null, 'Enterprise Protected Entity');
    const cleanSlug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'enterprise';
    const shortName = orgName.replace(/( Global| Operations| Solutions| Systems| Technologies| Ltd| Inc| Pte Ltd| Corp| LLC)/gi, '').trim() || orgName;

    const defaultProfile: BrandProfile = {
      id: `bp_${tenantId}`,
      tenantId,
      organizationName: orgName,
      legalEntityName: `${orgName} Global Pte. Ltd.`,
      shortName,
      abbreviations: [shortName.substring(0, 4).toUpperCase(), 'SKANDA'],
      formerNames: [],
      brandNames: [orgName, shortName, `${shortName} Security`, `${shortName} Cloud`],
      productNames: ['Skanda GRC Platform', `${shortName} Gateway`, `${shortName} Cloud`],
      serviceNames: ['Institutional Custody', 'Algorithmic Execution', 'Automated Compliance Telemetry'],
      trademarks: [
        {
          name: orgName.toUpperCase(),
          registrationNumber: 'TM-US-92841029',
          jurisdiction: 'United States Patent and Trademark Office (USPTO)',
          classCodes: ['Class 9 (Software)', 'Class 36 (Financial Services)']
        },
        {
          name: 'SKANDA GRC',
          registrationNumber: 'TM-SG-20240981A',
          jurisdiction: 'Intellectual Property Office of Singapore (IPOS)',
          classCodes: ['Class 42 (Cloud Security & Audit)']
        }
      ],
      slogans: ['Pioneering Resilient Financial Intelligence', 'Zero-Trust Governance at Cloud Scale'],
      knownAliases: [`${orgName} Corp`, `${orgName} Systems`, `${orgName} Global`],
      commonMisspellings: [`${shortName}x`, `${shortName}-corp`],
      regionalSpellings: [`${orgName} Technologies`],
      transliterationVariants: [],
      homoglyphVariants: [`${cleanSlug}.com`, `а${cleanSlug}.com`],
      officialDomains: [`${cleanSlug}.com`, 'skandagrc.com', `${cleanSlug}.io`],
      officialSubdomains: [`app.${cleanSlug}.com`, `portal.${cleanSlug}.com`, `api.${cleanSlug}.com`, `trust.${cleanSlug}.com`],
      officialWebsites: [`https://www.${cleanSlug}.com`, `https://trust.${cleanSlug}.com`],
      officialEmailDomains: [`${cleanSlug}.com`, `trust.${cleanSlug}.com`],
      officialSocialProfiles: [
        { platform: 'LinkedIn', handle: cleanSlug, url: `https://linkedin.com/company/${cleanSlug}`, verified: true },
        { platform: 'Twitter', handle: `@${shortName}_HQ`, url: `https://twitter.com/${shortName}_HQ`, verified: true },
        { platform: 'GitHub', handle: `${cleanSlug}-sec`, url: `https://github.com/${cleanSlug}-sec`, verified: true }
      ],
      officialAppIdentifiers: [`com.${cleanSlug}.mobile`, `com.${cleanSlug}.authenticator`],
      officialSupportDomains: [`support.${cleanSlug}.com`, `helpdesk.${cleanSlug}.com`],
      updatedAt: new Date().toISOString()
    };

    safeStorage.setItem(key, JSON.stringify(defaultProfile));
    return defaultProfile;
  }

  public static saveBrandProfile(profile: BrandProfile): void {
    const key = `${STORAGE_PREFIX}_${profile.tenantId}_profile`;
    safeStorage.setItem(key, JSON.stringify(profile));
  }

  /**
   * Brand Assets (Logos, Icons, Visual Fingerprints)
   */
  public static getBrandAssets(tenantId: string = 'default_tenant'): BrandAsset[] {
    const key = `${STORAGE_PREFIX}_${tenantId}_assets`;
    const saved = safeStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall back
      }
    }

    const orgName = organizationService.getOrganizationName(null, 'Enterprise Protected Entity');
    const cleanSlug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'enterprise';

    const defaultAssets: BrandAsset[] = [
      {
        id: 'asset_logo_primary',
        tenantId,
        name: `${orgName} Primary Gradient Shield & Wordmark`,
        assetType: 'PRIMARY_LOGO',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60',
        fileFormat: 'SVG / Vector Vectorized',
        dimensions: { width: 512, height: 160 },
        aspectRatio: 3.2,
        perceptualHash: 'e78193f4b82c10aa',
        colorHistogram: ['#4F46E5', '#6366F1', '#0F172A', '#F8FAFC'],
        isPrimary: true,
        registeredAt: new Date(Date.now() - 60 * 86400000).toISOString()
      },
      {
        id: 'asset_logo_mono',
        tenantId,
        name: `${orgName} Monochrome Dark Symbol`,
        assetType: 'MONOCHROME_LOGO',
        imageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=300&auto=format&fit=crop&q=60',
        fileFormat: 'PNG 32-bit Transparent',
        dimensions: { width: 256, height: 256 },
        aspectRatio: 1.0,
        perceptualHash: 'c42177a83d91b01e',
        colorHistogram: ['#0F172A', '#FFFFFF'],
        isPrimary: false,
        registeredAt: new Date(Date.now() - 45 * 86400000).toISOString()
      },
      {
        id: 'asset_favicon_brand',
        tenantId,
        name: `${orgName} Cryptographic Hexagon Favicon`,
        assetType: 'FAVICON',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&auto=format&fit=crop&q=60',
        fileFormat: 'ICO / 48x48',
        dimensions: { width: 48, height: 48 },
        aspectRatio: 1.0,
        perceptualHash: '8a91c47fe12b4d99',
        colorHistogram: ['#4F46E5', '#38BDF8'],
        isPrimary: false,
        registeredAt: new Date(Date.now() - 30 * 86400000).toISOString()
      }
    ];

    safeStorage.setItem(key, JSON.stringify(defaultAssets));
    return defaultAssets;
  }

  public static saveBrandAssets(tenantId: string, assets: BrandAsset[]): void {
    const key = `${STORAGE_PREFIX}_${tenantId}_assets`;
    safeStorage.setItem(key, JSON.stringify(assets));
  }

  /**
   * Executive / Key Person Registry
   */
  public static getExecutiveProfiles(tenantId: string = 'default_tenant'): ExecutiveProfile[] {
    const key = `${STORAGE_PREFIX}_${tenantId}_executives`;
    const saved = safeStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall back
      }
    }

    const orgName = organizationService.getOrganizationName(null, 'Enterprise Protected Entity');
    const cleanSlug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'enterprise';

    const defaultExecutives: ExecutiveProfile[] = [
      {
        id: 'exec_001',
        tenantId,
        fullName: 'Karthik Jagannathan',
        nameVariants: ['Karthik J.', 'K. Jagannathan', 'Karthikeyan J.'],
        initials: 'KJ',
        professionalTitle: 'Chief Executive Officer & Founder',
        department: 'Executive Leadership',
        associatedOrganization: orgName,
        publicProfileUrl: 'https://linkedin.com/in/karthik-jagannathan-fintech',
        approvedPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        publicBiographyExcerpt: `Founder and CEO of ${orgName}. Keynote speaker on Zero-Trust Continuous Compliance and Institutional Financial Architecture.`,
        officialEmail: `karthik@${cleanSlug}.com`,
        officialSocialHandles: {
          linkedIn: 'karthik-jagannathan-fintech',
          twitter: '@KarthikJ_Exec'
        },
        monitoredKeywords: ['investment', 'crypto', 'telegram', 'partnership', 'founder', 'fundraising', 'airdrop'],
        isActive: true,
        addedAt: new Date(Date.now() - 90 * 86400000).toISOString()
      },
      {
        id: 'exec_002',
        tenantId,
        fullName: 'Priya Sharma',
        nameVariants: ['P. Sharma', 'Priya S.'],
        initials: 'PS',
        professionalTitle: 'Chief Information Security Officer (CISO)',
        department: 'Information Security & Compliance',
        associatedOrganization: orgName,
        publicProfileUrl: 'https://linkedin.com/in/priya-sharma-ciso',
        approvedPhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
        publicBiographyExcerpt: 'CISO leading enterprise ISO 27001, SOC 2 Type II, and DORA resilience frameworks for tier-1 institutional trading desks.',
        officialEmail: `ciso@${cleanSlug}.com`,
        officialSocialHandles: {
          linkedIn: 'priya-sharma-ciso'
        },
        monitoredKeywords: ['security', 'audit', 'compliance', 'interview', 'recruitment', 'vendor'],
        isActive: true,
        addedAt: new Date(Date.now() - 75 * 86400000).toISOString()
      },
      {
        id: 'exec_003',
        tenantId,
        fullName: 'Marcus Vance',
        nameVariants: ['M. Vance', 'Marcus V.'],
        initials: 'MV',
        professionalTitle: 'Chief Technology Officer (CTO)',
        department: 'Engineering & Cloud Infrastructure',
        associatedOrganization: orgName,
        publicProfileUrl: 'https://linkedin.com/in/marcus-vance-tech',
        approvedPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        publicBiographyExcerpt: 'CTO overseeing ultra-low latency distributed matching engines, HSM security, and real-time telemetry pipelines.',
        officialEmail: `cto@${cleanSlug}.com`,
        officialSocialHandles: {
          linkedIn: 'marcus-vance-tech'
        },
        monitoredKeywords: ['hiring', 'interview', 'contract', 'api', 'repo', 'blockchain'],
        isActive: true,
        addedAt: new Date(Date.now() - 60 * 86400000).toISOString()
      }
    ];

    safeStorage.setItem(key, JSON.stringify(defaultExecutives));
    return defaultExecutives;
  }

  public static saveExecutiveProfiles(tenantId: string, executives: ExecutiveProfile[]): void {
    const key = `${STORAGE_PREFIX}_${tenantId}_executives`;
    safeStorage.setItem(key, JSON.stringify(executives));
  }

  /**
   * Monitoring Profiles
   */
  public static getMonitoringProfiles(tenantId: string = 'default_tenant'): MonitoringProfile[] {
    const key = `${STORAGE_PREFIX}_${tenantId}_monitoring_profiles`;
    const saved = safeStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall back
      }
    }

    const orgName = organizationService.getOrganizationName(null, 'Enterprise Protected Entity');
    const cleanSlug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'enterprise';

    const defaultProfiles: MonitoringProfile[] = [
      {
        id: 'mon_prof_global_default',
        tenantId,
        name: 'Continuous Global Surface Web & Executive Brand Sentry',
        isActive: true,
        frequency: 'HOURLY',
        scanScope: {
          includeExactBrand: true,
          includeExecutiveNames: true,
          includeTyposquatting: true,
          includeHomoglyphs: true,
          includeFraudKeywords: true,
          includeRecruitmentKeywords: true,
          includeSupportKeywords: true,
          includeLoginPortals: true,
          includeImageSearch: true
        },
        customSearchQueries: [
          `"${orgName}" login`,
          `"${orgName}" investment returns`,
          '"Karthik Jagannathan" crypto',
          `"${cleanSlug}" careers telegram`
        ],
        whitelistedDomains: [`${cleanSlug}.com`, 'skandagrc.com', `partner-${cleanSlug}.com`],
        whitelistedIPs: ['198.51.100.22'],
        lastRunTimestamp: new Date(Date.now() - 42 * 60000).toISOString(),
        nextScheduledRun: new Date(Date.now() + 18 * 60000).toISOString(),
        totalFindingsGenerated: 14
      }
    ];

    safeStorage.setItem(key, JSON.stringify(defaultProfiles));
    return defaultProfiles;
  }

  /**
   * Brand Findings Repository
   */
  public static getFindings(tenantId: string = 'default_tenant'): BrandFinding[] {
    const key = `${STORAGE_PREFIX}_${tenantId}_findings`;
    const saved = safeStorage.getItem(key);
    const ignored = this.getIgnoredDomains(tenantId);
    const ignoredMap = new Map(ignored.map(i => [i.domain.toLowerCase(), i]));

    const applyIgnoredOverrides = (list: BrandFinding[]): BrandFinding[] => {
      if (ignoredMap.size === 0) return list;
      return list.map(f => {
        const dom = f.targetDomain ? f.targetDomain.toLowerCase() : '';
        if (dom && ignoredMap.has(dom)) {
          const rec = ignoredMap.get(dom)!;
          return {
            ...f,
            isIgnored: true,
            status: 'FALSE_POSITIVE' as BrandFindingStatus,
            ignoredReason: f.ignoredReason || rec.reason,
            ignoredAt: f.ignoredAt || rec.ignoredAt,
            ignoredBy: f.ignoredBy || rec.ignoredBy
          };
        }
        return f;
      });
    };

    if (saved) {
      try {
        const parsed: BrandFinding[] = JSON.parse(saved);
        return applyIgnoredOverrides(parsed);
      } catch {
        // Fall back
      }
    }

    const orgName = organizationService.getOrganizationName(null, 'Enterprise Protected Entity');
    const cleanSlug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'enterprise';

    const defaultFindings: BrandFinding[] = [
      {
        id: 'bf_2026_001',
        tenantId,
        findingCode: 'BF-2026-001',
        title: `Phishing Credential Harvester Active on sso-${cleanSlug}-verify.com`,
        findingType: 'PHISHING_BRAND_IMPERSONATION',
        severity: 'CRITICAL',
        status: 'NEW',
        firstSeen: new Date(Date.now() - 3 * 3600000).toISOString(),
        lastSeen: new Date(Date.now() - 25 * 60000).toISOString(),
        targetUrl: `https://sso-${cleanSlug}-verify.com/oauth2/authorize`,
        targetDomain: `sso-${cleanSlug}-verify.com`,
        owner: 'Priya Sharma (CISO)',
        logoSimilarityScore: 96,
        brandNameSimilarityScore: 100,
        domainSimilarityScore: 92,
        websiteVisualSimilarityScore: 88,
        overallConfidence: 96,
        matchedBrandAsset: {
          assetId: 'asset_logo_primary',
          assetName: `${orgName} Primary Gradient Shield & Wordmark`,
          assetType: 'PRIMARY_LOGO',
          officialLogoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60',
          detectedLogoRegion: { x: 30, y: 15, width: 220, height: 60 },
          detectionMethod: 'PERCEPTUAL_VECTOR_HASH'
        },
        matchedExecutive: {
          executiveId: 'exec_001',
          fullName: 'Karthik Jagannathan',
          title: 'CEO & Founder',
          context: 'Phishing login page displays alleged welcome signature from CEO Karthik Jagannathan to deceive corporate employees.'
        },
        domainIntel: {
          domain: `sso-${cleanSlug}-verify.com`,
          firstSeenDate: new Date(Date.now() - 4 * 86400000).toISOString(),
          registrationDate: new Date(Date.now() - 5 * 86400000).toISOString(),
          registrar: 'NameCheap Inc.',
          rdapWhoisServer: `https://rdap.namecheap.com/v1/domain/sso-${cleanSlug}-verify.com`,
          nameservers: ['dns1.offshore-bulletproof.is', 'dns2.offshore-bulletproof.is'],
          resolvedIPs: ['194.26.29.114'],
          asn: 'AS59711',
          asnOrg: 'Hostkey B.V.',
          hostingProvider: 'Hostkey Offshore Infrastructure',
          countryCode: 'NL',
          tlsCertificate: {
            issuer: 'Let\'s Encrypt Authority X3',
            validFrom: new Date(Date.now() - 4 * 86400000).toISOString(),
            validTo: new Date(Date.now() + 86 * 86400000).toISOString(),
            isSelfSigned: false,
            sans: [`sso-${cleanSlug}-verify.com`, `www.sso-${cleanSlug}-verify.com`]
          },
          emailSecurity: { hasMx: true, hasSpf: false, hasDmarc: false },
          domainSquattingTechnique: 'COMBOSQUATTING'
        },
        webPageAnalysis: {
          url: `https://sso-${cleanSlug}-verify.com/oauth2/authorize`,
          domain: `sso-${cleanSlug}-verify.com`,
          pageTitle: `${orgName} | Corporate SSO Authentication Portal`,
          metaDescription: 'Sign in to access institutional trading platforms and internal compliance records.',
          visibleTextExcerpt: `Enter your corporate ${orgName} email address, Active Directory password, and 6-digit TOTP code to confirm session validity.`,
          ocrExtractedText: `${orgName} Corporate Access Portal. Authorized Personnel Only. Security Notice 2026.`,
          ocrConfidence: 96,
          screenshotUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
          detectedForms: {
            hasLoginForm: true,
            hasPaymentForm: false,
            hasPasswordInput: true,
            formActionUrl: `https://sso-${cleanSlug}-verify.com/api/v1/harvest`,
            isCredentialHarvesterSuspect: true
          },
          detectedContactInfo: {
            emails: [`support@sso-${cleanSlug}-verify.com`],
            phoneNumbers: ['+1-800-555-0199'],
            telegramLinks: [],
            whatsappLinks: []
          },
          detectedTechnologies: ['NGINX', 'TailwindCSS Clone', 'PHP 8.2', 'Let\'s Encrypt'],
          httpMetadata: {
            statusCode: 200,
            redirectChain: [],
            serverHeader: 'nginx/1.24.0',
            contentLength: 6840
          },
          sandboxSecurityFlags: {
            ssrfBlocked: false,
            privateIpBlocked: false,
            dnsRebindingProtected: true,
            isolatedExecutionClean: true
          }
        },
        riskScore: {
          totalScore: 94,
          severity: 'CRITICAL',
          scoreBreakdown: {
            logoSimilarityPoints: 24,
            brandNameSimilarityPoints: 15,
            domainSimilarityPoints: 14,
            executiveAssociationPoints: 10,
            websiteVisualSimilarityPoints: 9,
            phishingLoginIndicatorsPoints: 15,
            infrastructureRiskPoints: 4,
            reputationContextPoints: 3
          },
          contributingFactors: [
            { factorName: 'Logo Similarity', pointsAwarded: 24, description: '96% vector embedding match to official primary logo.' },
            { factorName: 'Brand Name Similarity', pointsAwarded: 15, description: 'Exact brand name replication in HTML title and headers.' },
            { factorName: 'Domain Combosquatting', pointsAwarded: 14, description: `Combines brand "${cleanSlug}" with sensitive prefix "sso-".` },
            { factorName: 'Executive Mention', pointsAwarded: 10, description: 'Forged welcome message from CEO Karthik Jagannathan.' },
            { factorName: 'Phishing Credential Form', pointsAwarded: 15, description: 'Interactive password + TOTP harvest form targeting employees.' },
            { factorName: 'Recent Infrastructure', pointsAwarded: 4, description: 'Registered 5 days ago via offshore anonymous proxy.' },
            { factorName: 'Website Visual Cloning', pointsAwarded: 9, description: 'Replicates CSS styles and dark mode aesthetics of Skanda GRC.' }
          ]
        },
        evidence: {
          evidenceId: 'EVD-BG-940182',
          sha256Hash: '4a9b91e5d71c1b3f9408e019b8830182c61099182377a0bc5e8391037281f9a2',
          timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
          discoveredUrl: `https://sso-${cleanSlug}-verify.com/oauth2/authorize`,
          domain: `sso-${cleanSlug}-verify.com`,
          discoveryProvider: 'Surface Web Search Engine + CT Monitor',
          matchedLogoAssetId: 'asset_logo_primary',
          matchedLogoSimilarityScore: 96,
          matchedExecutiveId: 'exec_001',
          matchedExecutiveName: 'Karthik Jagannathan',
          htmlSnapshotLength: 6840,
          screenshotArtifactUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
          ocrTextExcerpt: `${orgName} Corporate Access Portal. Enter corporate email and MFA code.`,
          cryptographicSignature: 'SKANDA-ED25519-SIG:4a9b91e5d71c1b3f9408e019b8830182',
          firstSeen: new Date(Date.now() - 3 * 3600000).toISOString(),
          lastSeen: new Date(Date.now() - 25 * 60000).toISOString()
        },
        isWhitelisted: false,
        decisionHistory: [
          {
            id: 'dh_001',
            timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
            action: 'NEW',
            actorName: 'BrandGuard Correlation Engine',
            actorRole: 'Automated Discovery Agent',
            reason: 'Correlated 96% logo match, SSO login form, and domain combosquatting into a single Critical incident candidate.'
          }
        ]
      },
      {
        id: 'bf_2026_002',
        tenantId,
        findingCode: 'BF-2026-002',
        title: `High-Yield Fraudulent Investment Scheme Impersonating Brand on ${cleanSlug}-investments.xyz`,
        findingType: 'FAKE_INVESTMENT',
        severity: 'HIGH',
        status: 'UNDER_INVESTIGATION',
        firstSeen: new Date(Date.now() - 14 * 3600000).toISOString(),
        lastSeen: new Date(Date.now() - 2 * 3600000).toISOString(),
        targetUrl: `https://${cleanSlug}-investments.xyz/vip-login`,
        targetDomain: `${cleanSlug}-investments.xyz`,
        owner: 'Compliance Legal Officer',
        logoSimilarityScore: 84,
        brandNameSimilarityScore: 95,
        domainSimilarityScore: 88,
        websiteVisualSimilarityScore: 76,
        overallConfidence: 91,
        matchedBrandAsset: {
          assetId: 'asset_logo_primary',
          assetName: `${orgName} Primary Gradient Shield & Wordmark`,
          assetType: 'PRIMARY_LOGO',
          officialLogoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60',
          detectionMethod: 'COLOR_HISTOGRAM'
        },
        matchedExecutive: {
          executiveId: 'exec_001',
          fullName: 'Karthik Jagannathan',
          title: 'CEO & Founder',
          context: 'Fabricated endorsement claiming CEO Karthik J. guarantees 28% APY arbitrage yields for USDT crypto deposits.'
        },
        domainIntel: {
          domain: `${cleanSlug}-investments.xyz`,
          firstSeenDate: new Date(Date.now() - 12 * 86400000).toISOString(),
          registrationDate: new Date(Date.now() - 14 * 86400000).toISOString(),
          registrar: 'Porkbun LLC',
          nameservers: ['ns1.cloudflare.com', 'ns2.cloudflare.com'],
          resolvedIPs: ['104.21.72.18'],
          asn: 'AS13335',
          asnOrg: 'Cloudflare, Inc.',
          hostingProvider: 'Cloudflare Edge CDN',
          countryCode: 'US',
          emailSecurity: { hasMx: false, hasSpf: false, hasDmarc: false },
          domainSquattingTechnique: 'COMBOSQUATTING'
        },
        webPageAnalysis: {
          url: `https://${cleanSlug}-investments.xyz/vip-login`,
          domain: `${cleanSlug}-investments.xyz`,
          pageTitle: `${orgName} High-Yield Institutional Wealth Program`,
          metaDescription: `Deposit USDT and Bitcoin to earn automated daily yields managed by ${orgName} algorithms.`,
          visibleTextExcerpt: `Guaranteed 28% APY monthly return backed by ${orgName} reserve capital. Register today with referral code APEX-VIP.`,
          ocrExtractedText: `${orgName} Institutional Wealth Management. 100% Guaranteed Payouts.`,
          ocrConfidence: 92,
          screenshotUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=80',
          detectedForms: {
            hasLoginForm: true,
            hasPaymentForm: true,
            hasPasswordInput: true,
            isCredentialHarvesterSuspect: false
          },
          detectedContactInfo: {
            emails: [`vip-desk@${cleanSlug}-investments.xyz`],
            phoneNumbers: [],
            telegramLinks: [`https://t.me/${cleanSlug}_Arbitrage_VIP`],
            whatsappLinks: []
          },
          detectedTechnologies: ['React', 'Web3.js', 'Ethers.js', 'Cloudflare'],
          httpMetadata: {
            statusCode: 200,
            redirectChain: [],
            contentLength: 8420
          },
          sandboxSecurityFlags: {
            ssrfBlocked: false,
            privateIpBlocked: false,
            dnsRebindingProtected: true,
            isolatedExecutionClean: true
          }
        },
        riskScore: {
          totalScore: 78,
          severity: 'HIGH',
          scoreBreakdown: {
            logoSimilarityPoints: 21,
            brandNameSimilarityPoints: 14,
            domainSimilarityPoints: 13,
            executiveAssociationPoints: 10,
            websiteVisualSimilarityPoints: 8,
            phishingLoginIndicatorsPoints: 5,
            infrastructureRiskPoints: 4,
            reputationContextPoints: 3
          },
          contributingFactors: [
            { factorName: 'Logo Misuse', pointsAwarded: 21, description: 'Re-colored official brand logo in high-yield promo banner.' },
            { factorName: 'Executive Identity Misuse', pointsAwarded: 10, description: 'Fabricated endorsement statement attributed to CEO.' },
            { factorName: 'Fraud Investment Terminology', pointsAwarded: 14, description: 'High-risk terms ("Guaranteed APY", "USDT Deposit").' },
            { factorName: 'Domain Combosquatting', pointsAwarded: 13, description: `Uses .xyz cheap TLD with brand name and "investments".` }
          ]
        },
        evidence: {
          evidenceId: 'EVD-BG-781920',
          sha256Hash: '91f8271bb40283718274a9192038171629471928371920384719283748291029',
          timestamp: new Date(Date.now() - 14 * 3600000).toISOString(),
          discoveredUrl: `https://${cleanSlug}-investments.xyz/vip-login`,
          domain: `${cleanSlug}-investments.xyz`,
          discoveryProvider: 'Surface Web Search Engine',
          matchedLogoAssetId: 'asset_logo_primary',
          matchedLogoSimilarityScore: 84,
          matchedExecutiveId: 'exec_001',
          matchedExecutiveName: 'Karthik Jagannathan',
          htmlSnapshotLength: 8420,
          screenshotArtifactUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=80',
          ocrTextExcerpt: `${orgName} Institutional Wealth Management. 100% Guaranteed Payouts.`,
          cryptographicSignature: 'SKANDA-ED25519-SIG:91f8271bb40283718274a91920381716',
          firstSeen: new Date(Date.now() - 14 * 3600000).toISOString(),
          lastSeen: new Date(Date.now() - 2 * 3600000).toISOString()
        },
        isWhitelisted: false,
        decisionHistory: [
          {
            id: 'dh_002',
            timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
            action: 'UNDER_INVESTIGATION',
            actorName: 'Marcus Vance (CTO)',
            actorRole: 'Security Reviewer',
            reason: 'Flagged for forensic evidence preservation and hosting takedown dispatch.'
          }
        ]
      },
      {
        id: 'bf_2026_003',
        tenantId,
        findingCode: 'BF-2026-003',
        title: `Advance-Fee Fake Employment & Recruitment Portal on careers-${cleanSlug}-recruitment.online`,
        findingType: 'FAKE_RECRUITMENT',
        severity: 'HIGH',
        status: 'NEW',
        firstSeen: new Date(Date.now() - 26 * 3600000).toISOString(),
        lastSeen: new Date(Date.now() - 4 * 3600000).toISOString(),
        targetUrl: `https://careers-${cleanSlug}-recruitment.online/apply`,
        targetDomain: `careers-${cleanSlug}-recruitment.online`,
        logoSimilarityScore: 78,
        brandNameSimilarityScore: 92,
        domainSimilarityScore: 84,
        websiteVisualSimilarityScore: 68,
        overallConfidence: 86,
        domainIntel: {
          domain: `careers-${cleanSlug}-recruitment.online`,
          firstSeenDate: new Date(Date.now() - 20 * 86400000).toISOString(),
          registrationDate: new Date(Date.now() - 22 * 86400000).toISOString(),
          registrar: 'Tucows Domains Inc.',
          nameservers: ['ns1.tld-parking.com'],
          resolvedIPs: ['185.199.108.153'],
          asn: 'AS54113',
          asnOrg: 'Fastly Hosted',
          hostingProvider: 'Fastly CDN',
          countryCode: 'US',
          emailSecurity: { hasMx: true, hasSpf: false, hasDmarc: false },
          domainSquattingTechnique: 'COMBOSQUATTING'
        },
        webPageAnalysis: {
          url: `https://careers-${cleanSlug}-recruitment.online/apply`,
          domain: `careers-${cleanSlug}-recruitment.online`,
          pageTitle: `${orgName} Global Careers — Remote Risk Analyst & Compliance Associate`,
          metaDescription: 'Immediate remote vacancies. Submit your CV and pay application assessment deposit.',
          visibleTextExcerpt: `${orgName} is hiring 45 remote auditors. Mandatory training materials fee of $150 required prior to Zoom interview.`,
          ocrExtractedText: `${orgName} Careers 2026. Global Talent Acquisition Desk.`,
          ocrConfidence: 89,
          screenshotUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop&q=80',
          detectedForms: {
            hasLoginForm: false,
            hasPaymentForm: true,
            hasPasswordInput: false,
            isCredentialHarvesterSuspect: false
          },
          detectedContactInfo: {
            emails: [`recruitment@careers-${cleanSlug}-recruitment.online`],
            phoneNumbers: ['+44 20 7946 0912'],
            telegramLinks: [`https://t.me/${cleanSlug}Careers_GlobalRecruiter`],
            whatsappLinks: []
          },
          detectedTechnologies: ['WordPress', 'WooCommerce Form', 'Elementor'],
          httpMetadata: {
            statusCode: 200,
            redirectChain: [],
            contentLength: 5120
          },
          sandboxSecurityFlags: {
            ssrfBlocked: false,
            privateIpBlocked: false,
            dnsRebindingProtected: true,
            isolatedExecutionClean: true
          }
        },
        riskScore: {
          totalScore: 72,
          severity: 'HIGH',
          scoreBreakdown: {
            logoSimilarityPoints: 19,
            brandNameSimilarityPoints: 14,
            domainSimilarityPoints: 13,
            executiveAssociationPoints: 0,
            websiteVisualSimilarityPoints: 7,
            phishingLoginIndicatorsPoints: 8,
            infrastructureRiskPoints: 6,
            reputationContextPoints: 5
          },
          contributingFactors: [
            { factorName: 'Advance Fee Recruitment Fraud', pointsAwarded: 14, description: 'Requests monetary fee ($150) for job applicant screening.' },
            { factorName: 'Brand & Logo Misuse', pointsAwarded: 19, description: 'Reuses official logo and corporate registration numbers.' },
            { factorName: 'Suspicious Communication Channels', pointsAwarded: 8, description: 'Directs applicants to unauthorized Telegram recruiters.' }
          ]
        },
        evidence: {
          evidenceId: 'EVD-BG-721094',
          sha256Hash: '52a819b028471928374819203847192837461928374619283746192837461928',
          timestamp: new Date(Date.now() - 26 * 3600000).toISOString(),
          discoveredUrl: `https://careers-${cleanSlug}-recruitment.online/apply`,
          domain: `careers-${cleanSlug}-recruitment.online`,
          discoveryProvider: 'Surface Web Search Engine',
          matchedLogoSimilarityScore: 78,
          htmlSnapshotLength: 5120,
          screenshotArtifactUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop&q=80',
          ocrTextExcerpt: `${orgName} Careers 2026. Submit CV and pay screening fee.`,
          cryptographicSignature: 'SKANDA-ED25519-SIG:52a819b0284719283748192038471928',
          firstSeen: new Date(Date.now() - 26 * 3600000).toISOString(),
          lastSeen: new Date(Date.now() - 4 * 3600000).toISOString()
        },
        isWhitelisted: false,
        decisionHistory: [
          {
            id: 'dh_003',
            timestamp: new Date(Date.now() - 26 * 3600000).toISOString(),
            action: 'NEW',
            actorName: 'BrandGuard Correlation Engine',
            actorRole: 'Automated Discovery Agent',
            reason: 'Detected fake recruitment advance fee scam targeting job seekers.'
          }
        ]
      },
      {
        id: 'bf_2026_004',
        tenantId,
        findingCode: 'BF-2026-004',
        title: `Squatted Impersonation Domain Infrastructure Detected on ${cleanSlug}.top`,
        findingType: 'TYPOSQUATTING',
        severity: 'MEDIUM',
        status: 'CONFIRMED_ABUSE',
        firstSeen: new Date(Date.now() - 72 * 3600000).toISOString(),
        lastSeen: new Date(Date.now() - 12 * 3600000).toISOString(),
        targetUrl: `http://${cleanSlug}.top`,
        targetDomain: `${cleanSlug}.top`,
        owner: 'Priya Sharma (CISO)',
        logoSimilarityScore: 40,
        brandNameSimilarityScore: 100,
        domainSimilarityScore: 94,
        websiteVisualSimilarityScore: 30,
        overallConfidence: 82,
        domainIntel: {
          domain: `${cleanSlug}.top`,
          firstSeenDate: new Date(Date.now() - 60 * 86400000).toISOString(),
          registrationDate: new Date(Date.now() - 62 * 86400000).toISOString(),
          registrar: 'Alibaba Cloud Computing (Beijing) Co., Ltd.',
          nameservers: ['dns1.topdns.cn', 'dns2.topdns.cn'],
          resolvedIPs: ['47.88.29.102'],
          asn: 'AS45102',
          asnOrg: 'Alibaba US LLC',
          hostingProvider: 'Alibaba Cloud',
          countryCode: 'CN',
          emailSecurity: { hasMx: true, hasSpf: false, hasDmarc: false },
          domainSquattingTechnique: 'TLD_VARIATION'
        },
        webPageAnalysis: {
          url: `http://${cleanSlug}.top`,
          domain: `${cleanSlug}.top`,
          pageTitle: `Domain ${cleanSlug}.top is for sale or parking`,
          metaDescription: 'Inquire about purchasing this premium brand domain.',
          visibleTextExcerpt: `This domain name ${cleanSlug}.top is available for acquisition. Contact broker for institutional offer.`,
          ocrExtractedText: `${cleanSlug}.top For Sale. Contact broker.`,
          ocrConfidence: 95,
          screenshotUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
          detectedForms: {
            hasLoginForm: false,
            hasPaymentForm: false,
            hasPasswordInput: false,
            isCredentialHarvesterSuspect: false
          },
          detectedContactInfo: {
            emails: [`inquiry@${cleanSlug}.top`],
            phoneNumbers: [],
            telegramLinks: [],
            whatsappLinks: []
          },
          detectedTechnologies: ['Parking Script v2'],
          httpMetadata: {
            statusCode: 200,
            redirectChain: [],
            contentLength: 2840
          },
          sandboxSecurityFlags: {
            ssrfBlocked: false,
            privateIpBlocked: false,
            dnsRebindingProtected: true,
            isolatedExecutionClean: true
          }
        },
        riskScore: {
          totalScore: 54,
          severity: 'MEDIUM',
          scoreBreakdown: {
            logoSimilarityPoints: 10,
            brandNameSimilarityPoints: 15,
            domainSimilarityPoints: 14,
            executiveAssociationPoints: 0,
            websiteVisualSimilarityPoints: 3,
            phishingLoginIndicatorsPoints: 0,
            infrastructureRiskPoints: 6,
            reputationContextPoints: 6
          },
          contributingFactors: [
            { factorName: 'TLD Variation Squatting', pointsAwarded: 14, description: 'Identical brand string registered under .top TLD.' },
            { factorName: 'Active MX Mail Record', pointsAwarded: 15, description: 'Domain has MX record configured capable of sending spoofed emails.' }
          ]
        },
        evidence: {
          evidenceId: 'EVD-BG-541890',
          sha256Hash: '61a9182749102938471920384719203847192837461928374619283746192837',
          timestamp: new Date(Date.now() - 72 * 3600000).toISOString(),
          discoveredUrl: `http://${cleanSlug}.top`,
          domain: `${cleanSlug}.top`,
          discoveryProvider: 'DNS & RDAP Domain Intelligence Adapter',
          matchedLogoSimilarityScore: 40,
          htmlSnapshotLength: 2840,
          screenshotArtifactUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
          ocrTextExcerpt: `${cleanSlug}.top For Sale.`,
          cryptographicSignature: 'SKANDA-ED25519-SIG:61a91827491029384719203847192038',
          firstSeen: new Date(Date.now() - 72 * 3600000).toISOString(),
          lastSeen: new Date(Date.now() - 12 * 3600000).toISOString()
        },
        isWhitelisted: false,
        decisionHistory: [
          {
            id: 'dh_004',
            timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
            action: 'CONFIRMED_ABUSE',
            actorName: 'Priya Sharma (CISO)',
            actorRole: 'CISO / Threat Lead',
            reason: 'Domain squatted with active MX servers. Potential future BEC or phishing infrastructure.'
          }
        ],
        mitigation: {
          takedownState: 'DRAFTED',
          abuseNoticeRecipient: 'REGISTRAR',
          takedownInitiatedDate: new Date(Date.now() - 24 * 3600000).toISOString()
        }
      },
      {
        id: 'bf_2026_005',
        tenantId,
        findingCode: 'BF-2026-005',
        title: `Partner Blog Article Referencing Official Brand API on partner-${cleanSlug}.com`,
        findingType: 'SUSPICIOUS_BRAND_REFERENCE',
        severity: 'LOW',
        status: 'LEGITIMATE_USE',
        firstSeen: new Date(Date.now() - 96 * 3600000).toISOString(),
        lastSeen: new Date(Date.now() - 10 * 3600000).toISOString(),
        targetUrl: `https://partner-${cleanSlug}.com/integration-case-study`,
        targetDomain: `partner-${cleanSlug}.com`,
        owner: 'Marketing & Partnerships',
        logoSimilarityScore: 82,
        brandNameSimilarityScore: 88,
        domainSimilarityScore: 74,
        websiteVisualSimilarityScore: 42,
        overallConfidence: 78,
        matchedBrandAsset: {
          assetId: 'asset_logo_primary',
          assetName: `${orgName} Primary Gradient Shield & Wordmark`,
          assetType: 'PRIMARY_LOGO',
          officialLogoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60',
          detectionMethod: 'PERCEPTUAL_VECTOR_HASH'
        },
        domainIntel: {
          domain: `partner-${cleanSlug}.com`,
          firstSeenDate: new Date(Date.now() - 365 * 86400000).toISOString(),
          registrationDate: new Date(Date.now() - 400 * 86400000).toISOString(),
          registrar: 'GoDaddy.com, LLC',
          nameservers: ['ns01.domaincontrol.com'],
          resolvedIPs: ['198.51.100.22'],
          asn: 'AS15169',
          asnOrg: 'Google Cloud Platform',
          hostingProvider: 'Google Cloud',
          countryCode: 'US',
          emailSecurity: { hasMx: true, hasSpf: true, hasDmarc: true },
          domainSquattingTechnique: undefined
        },
        webPageAnalysis: {
          url: `https://partner-${cleanSlug}.com/integration-case-study`,
          domain: `partner-${cleanSlug}.com`,
          pageTitle: `${orgName} & FinAlliance Partner Integration Case Study`,
          metaDescription: `How FinAlliance leveraged ${orgName} compliant REST APIs for automated trade settlement.`,
          visibleTextExcerpt: `FinAlliance is an authorized ecosystem integration partner of ${orgName} since 2024.`,
          ocrExtractedText: `Authorized Partner Badge. ${orgName} Certified Integration.`,
          ocrConfidence: 94,
          screenshotUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
          detectedForms: {
            hasLoginForm: false,
            hasPaymentForm: false,
            hasPasswordInput: false,
            isCredentialHarvesterSuspect: false
          },
          detectedContactInfo: {
            emails: [`press@partner-${cleanSlug}.com`],
            phoneNumbers: [],
            telegramLinks: [],
            whatsappLinks: []
          },
          detectedTechnologies: ['Next.js', 'Vercel', 'TailwindCSS'],
          httpMetadata: {
            statusCode: 200,
            redirectChain: [],
            contentLength: 12400
          },
          sandboxSecurityFlags: {
            ssrfBlocked: false,
            privateIpBlocked: false,
            dnsRebindingProtected: true,
            isolatedExecutionClean: true
          }
        },
        riskScore: {
          totalScore: 28,
          severity: 'LOW',
          scoreBreakdown: {
            logoSimilarityPoints: 20,
            brandNameSimilarityPoints: 13,
            domainSimilarityPoints: 11,
            executiveAssociationPoints: 0,
            websiteVisualSimilarityPoints: 4,
            phishingLoginIndicatorsPoints: 0,
            infrastructureRiskPoints: 2,
            reputationContextPoints: 2
          },
          contributingFactors: [
            { factorName: 'Authorized Partner Reference', pointsAwarded: 10, description: 'Verified reseller and API technology integration partner.' }
          ]
        },
        evidence: {
          evidenceId: 'EVD-BG-281093',
          sha256Hash: '71a9182749102938471920384719203847192837461928374619283746192837',
          timestamp: new Date(Date.now() - 96 * 3600000).toISOString(),
          discoveredUrl: `https://partner-${cleanSlug}.com/integration-case-study`,
          domain: `partner-${cleanSlug}.com`,
          discoveryProvider: 'Surface Web Search Engine',
          matchedLogoSimilarityScore: 82,
          htmlSnapshotLength: 12400,
          screenshotArtifactUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
          ocrTextExcerpt: `Authorized Partner Badge. ${orgName} Certified Integration.`,
          cryptographicSignature: 'SKANDA-ED25519-SIG:71a91827491029384719203847192038',
          firstSeen: new Date(Date.now() - 96 * 3600000).toISOString(),
          lastSeen: new Date(Date.now() - 10 * 3600000).toISOString()
        },
        isWhitelisted: true,
        whitelistReason: 'Verified commercial technology partner authorized to display brand partnership badge.',
        decisionHistory: [
          {
            id: 'dh_005',
            timestamp: new Date(Date.now() - 72 * 3600000).toISOString(),
            action: 'LEGITIMATE_USE',
            actorName: 'Priya Sharma (CISO)',
            actorRole: 'CISO / Brand Admin',
            reason: 'Verified partner relationship under Master Services Agreement MSA-2024-88. Whitelisted domain.'
          }
        ]
      }
    ];

    safeStorage.setItem(key, JSON.stringify(defaultFindings));
    return defaultFindings;
  }

  public static clearState(tenantId: string = 'default_tenant'): void {
    safeStorage.removeItem(`${STORAGE_PREFIX}_${tenantId}_profile`);
    safeStorage.removeItem(`${STORAGE_PREFIX}_${tenantId}_assets`);
    safeStorage.removeItem(`${STORAGE_PREFIX}_${tenantId}_executives`);
    safeStorage.removeItem(`${STORAGE_PREFIX}_${tenantId}_monitoring_profiles`);
    safeStorage.removeItem(`${STORAGE_PREFIX}_${tenantId}_findings`);
  }

  public static saveFindings(tenantId: string, findings: BrandFinding[]): void {
    const key = `${STORAGE_PREFIX}_${tenantId}_findings`;
    safeStorage.setItem(key, JSON.stringify(findings));
  }

  public static updateFindingStatus(
    tenantId: string,
    findingId: string,
    newStatus: BrandFindingStatus,
    actorName: string,
    actorRole: string,
    reason: string
  ): BrandFinding | null {
    const findings = this.getFindings(tenantId);
    const index = findings.findIndex(f => f.id === findingId);
    if (index === -1) return null;

    const finding = findings[index];
    finding.status = newStatus;
    if (newStatus === 'LEGITIMATE_USE' || newStatus === 'FALSE_POSITIVE') {
      finding.isWhitelisted = true;
      finding.whitelistReason = reason;
    }
    if (newStatus === 'RESOLVED_TAKEDOWN' && finding.mitigation) {
      finding.mitigation.takedownState = 'OFFLINE_VERIFIED';
      finding.mitigation.takedownResolvedDate = new Date().toISOString();
    }

    finding.decisionHistory.unshift({
      id: `dh_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: newStatus,
      actorName,
      actorRole,
      reason
    });

    findings[index] = finding;
    this.saveFindings(tenantId, findings);
    return finding;
  }

  public static addFinding(tenantId: string, finding: BrandFinding): void {
    const findings = this.getFindings(tenantId);
    findings.unshift(finding);
    this.saveFindings(tenantId, findings);

    // Automated Notification via brandGuardNotificationService
    try {
      brandGuardNotificationService.notifyFinding(finding);
    } catch {
      // Non-blocking
    }
  }

  /**
   * Persisted Ignored Impersonation Domains Registry (False-Positive Preferences)
   */
  public static getIgnoredDomains(tenantId: string = 'default_tenant'): IgnoredDomainRecord[] {
    const key = `${STORAGE_PREFIX}_${tenantId}_ignored_domains`;
    const saved = safeStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall back
      }
    }
    return [];
  }

  public static saveIgnoredDomains(tenantId: string, records: IgnoredDomainRecord[]): void {
    const key = `${STORAGE_PREFIX}_${tenantId}_ignored_domains`;
    safeStorage.setItem(key, JSON.stringify(records));
  }

  public static isDomainIgnored(tenantId: string, domain: string): boolean {
    if (!domain) return false;
    const clean = domain.trim().toLowerCase();
    const list = this.getIgnoredDomains(tenantId);
    return list.some(r => r.domain.toLowerCase() === clean);
  }

  /**
   * Ignores a detected impersonation domain, marking findings as false positives
   * and saving the domain preference in the persistent storage.
   */
  public static ignoreDomain(
    tenantId: string = 'default_tenant',
    domain: string,
    reason: string = 'Marked as false positive / benign impersonation domain',
    actorName: string = 'Analyst User',
    actorRole: string = 'Security Analyst',
    findingId?: string
  ): { updatedFindings: BrandFinding[]; record: IgnoredDomainRecord } {
    const cleanDomain = domain.trim().toLowerCase();
    const existingRecords = this.getIgnoredDomains(tenantId);

    const record: IgnoredDomainRecord = {
      domain: cleanDomain,
      findingId,
      reason,
      ignoredAt: new Date().toISOString(),
      ignoredBy: `${actorName} (${actorRole})`,
      tenantId
    };

    const updatedRecords = existingRecords.filter(r => r.domain.toLowerCase() !== cleanDomain);
    updatedRecords.unshift(record);
    this.saveIgnoredDomains(tenantId, updatedRecords);

    // Update findings matching this domain or findingId
    const findings = this.getFindings(tenantId);
    let modified = false;

    const updatedFindings = findings.map(f => {
      const match = (findingId && f.id === findingId) || f.targetDomain.toLowerCase() === cleanDomain;
      if (match) {
        modified = true;
        const updated: BrandFinding = {
          ...f,
          status: 'FALSE_POSITIVE',
          isIgnored: true,
          ignoredReason: reason,
          ignoredAt: record.ignoredAt,
          ignoredBy: record.ignoredBy,
          decisionHistory: [
            {
              id: `dh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              timestamp: new Date().toISOString(),
              action: 'FALSE_POSITIVE',
              actorName,
              actorRole,
              reason: `Domain Ignored (False Positive): ${reason}`
            },
            ...f.decisionHistory
          ]
        };
        return updated;
      }
      return f;
    });

    if (modified) {
      this.saveFindings(tenantId, updatedFindings);
    }

    return { updatedFindings, record };
  }

  /**
   * Restores an ignored domain back to active investigation
   */
  public static unignoreDomain(
    tenantId: string = 'default_tenant',
    domain: string,
    actorName: string = 'Analyst User',
    actorRole: string = 'Security Analyst'
  ): BrandFinding[] {
    const cleanDomain = domain.trim().toLowerCase();
    const existingRecords = this.getIgnoredDomains(tenantId);
    const updatedRecords = existingRecords.filter(r => r.domain.toLowerCase() !== cleanDomain);
    this.saveIgnoredDomains(tenantId, updatedRecords);

    // Restore findings matching this domain
    const findings = this.getFindings(tenantId);
    const updatedFindings = findings.map(f => {
      if (f.targetDomain.toLowerCase() === cleanDomain) {
        return {
          ...f,
          status: 'NEW' as BrandFindingStatus,
          isIgnored: false,
          ignoredReason: undefined,
          ignoredAt: undefined,
          ignoredBy: undefined,
          decisionHistory: [
            {
              id: `dh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              timestamp: new Date().toISOString(),
              action: 'UNDER_INVESTIGATION' as const,
              actorName,
              actorRole,
              reason: 'Domain un-ignored and restored to active threat queue.'
            },
            ...f.decisionHistory
          ]
        };
      }
      return f;
    });

    this.saveFindings(tenantId, updatedFindings);
    return updatedFindings;
  }

  /**
   * Calculates high-level BrandGuard metrics for the Executive Dashboard
   */
  public static getDashboardMetrics(tenantId: string = 'default_tenant'): BrandGuardDashboardMetrics {
    const findings = this.getFindings(tenantId);

    const critical = findings.filter(f => f.severity === 'CRITICAL' && f.status !== 'LEGITIMATE_USE' && f.status !== 'FALSE_POSITIVE' && f.status !== 'IGNORED' && !f.isIgnored);
    const high = findings.filter(f => f.severity === 'HIGH' && f.status !== 'LEGITIMATE_USE' && f.status !== 'FALSE_POSITIVE' && f.status !== 'IGNORED' && !f.isIgnored);
    const medium = findings.filter(f => f.severity === 'MEDIUM' && f.status !== 'LEGITIMATE_USE' && f.status !== 'FALSE_POSITIVE' && f.status !== 'IGNORED' && !f.isIgnored);
    const low = findings.filter(f => f.severity === 'LOW' && f.status !== 'LEGITIMATE_USE' && f.status !== 'FALSE_POSITIVE' && f.status !== 'IGNORED' && !f.isIgnored);
    const resolved = findings.filter(f => f.status === 'RESOLVED_TAKEDOWN');
    const falsePositives = findings.filter(f => f.status === 'FALSE_POSITIVE' || f.status === 'IGNORED' || f.isIgnored);

    const logoMisuse = findings.filter(f => f.findingType === 'LOGO_MISUSE' || f.logoSimilarityScore >= 75);
    const fakeDomains = findings.filter(f => f.findingType === 'TYPOSQUATTING' || f.findingType === 'HOMOGLYPH_DOMAIN' || f.findingType === 'DOMAIN_IMPERSONATION');
    const execImpersonation = findings.filter(f => f.findingType === 'EXECUTIVE_IMPERSONATION' || !!f.matchedExecutive);
    const phishing = findings.filter(f => f.findingType === 'PHISHING_BRAND_IMPERSONATION');

    // Brand Exposure Score Calculation (0-100)
    // Critical finding weight: 25, High: 15, Medium: 8
    const rawExposure = (critical.length * 28) + (high.length * 16) + (medium.length * 8);
    const brandExposureScore = Math.min(98, Math.max(12, rawExposure));

    const falsePositiveRate = findings.length > 0
      ? Math.round((falsePositives.length / findings.length) * 100)
      : 0;

    return {
      brandExposureScore,
      criticalFindingsCount: critical.length,
      highRiskFindingsCount: high.length,
      mediumRiskFindingsCount: medium.length,
      lowRiskFindingsCount: low.length,
      totalActiveFindings: critical.length + high.length + medium.length + low.length,
      resolvedTakedownsCount: resolved.length,
      logoMisuseCount: logoMisuse.length,
      fakeDomainsCount: fakeDomains.length,
      executiveImpersonationCount: execImpersonation.length,
      phishingSitesCount: phishing.length,
      falsePositiveRatePercent: falsePositiveRate,
      totalDiscoveredUrlsThisMonth: 1845,
      quotaUsedPercent: 36,
      commercialTier: 'ENTERPRISE'
    };
  }

  public static getCommercialTier(tenantId: string = 'default_tenant'): CommercialTier {
    return 'ENTERPRISE';
  }
}
