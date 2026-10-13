// Skanda Enterprise — BrandGuard Logo Monitoring REST API Controller
// Enterprise routes for Brand Assets, Versioning, Multi-Stage Detection,
// Explainable Scoring, Status Lifecycle Transitions, Evidence, and Takedowns.

import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const router = Router();
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'logo_monitoring_db.json');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  try {
    fs.mkdirSync(DB_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}

// In-Memory & File-backed Database Store
interface LogoDbSchema {
  brandAssets: Record<string, any[]>;
  logoMatches: Record<string, any[]>;
  monitoringJobs: Record<string, any[]>;
  investigationCases: Record<string, any[]>;
  takedownRequests: Record<string, any[]>;
}

let db: LogoDbSchema = {
  brandAssets: {},
  logoMatches: {},
  monitoringJobs: {},
  investigationCases: {},
  takedownRequests: {}
};

// Load database from disk if available
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    db = JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to parse logo monitoring DB, initializing default store.');
  }
}

function persistDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write logo monitoring database to disk:', err);
  }
}

// Dynamic tenant brand resolver
function getTenantBrandDetails(tenantId: string) {
  let brandName = 'Enterprise Protected Entity';
  let cleanSlug = 'enterprise';
  try {
    const apiDbFile = path.join(process.cwd(), 'data', 'continuous_compliance_db.json');
    if (fs.existsSync(apiDbFile)) {
      const apiData = JSON.parse(fs.readFileSync(apiDbFile, 'utf-8'));
      const foundOrg = (apiData.state?.organizations || []).find((o: any) => o.tenantId === tenantId || o.id === tenantId);
      if (foundOrg?.displayName) {
        brandName = foundOrg.displayName;
        cleanSlug = brandName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'enterprise';
      }
    }
  } catch (e) {
    // fallback
  }
  return {
    brandName,
    cleanSlug,
    officialDomain: `${cleanSlug}.com`,
    legalEntity: `${brandName} Global Pte. Ltd.`
  };
}

// Helper to seed a tenant if not yet present
function ensureTenantSeeded(tenantId: string) {
  if (!db.brandAssets[tenantId] || db.brandAssets[tenantId].length === 0) {
    const now = new Date().toISOString();
    const { brandName, cleanSlug, officialDomain } = getTenantBrandDetails(tenantId);
    const primaryAsset = {
      id: 'asset_apex_logo_01',
      tenantId,
      brandId: `brand_${tenantId}`,
      name: `${brandName} Primary Shield & Wordmark`,
      assetType: 'PRIMARY_LOGO',
      brandName: brandName,
      description: 'Primary corporate visual identity mark featuring electric indigo gradient shield and bold wordmark.',
      currentVersion: 1,
      status: 'ACTIVE',
      isApproved: true,
      uploadDate: new Date(Date.now() - 90 * 86400000).toISOString(),
      uploadedBy: 'Executive Security Office',
      fileType: 'image/svg+xml',
      fileSize: 48120,
      dimensions: { width: 512, height: 160 },
      sha256: '7fa3e91b8a02c892b1a9384bc192083419203841923841029384019238410293',
      perceptualHash: 'e78193f4b82c10aa',
      embeddingReference: 'vec_emb_apex_shield_v1',
      backgroundType: 'TRANSPARENT',
      colorPalette: ['#4F46E5', '#6366F1', '#0F172A', '#F8FAFC'],
      ocrText: `${brandName.toUpperCase()} GLOBAL PTE LTD`,
      associatedDomain: officialDomain,
      associatedProducts: ['Skanda GRC Platform', `${brandName} Institutional Cloud`],
      associatedServices: ['Institutional Custody', 'Automated Compliance Telemetry'],
      officialUsageLocations: ['Corporate Website Header', 'Verified Financial Disclosures'],
      effectiveDate: '2024-01-01T00:00:00Z',
      notes: 'Master trademark registered with USPTO (TM-US-92841029).',
      tags: ['primary', 'corporate', 'wordmark', 'gradient'],
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 90 * 86400000).toISOString(),
      versionHistory: [
        {
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
          changeReason: 'Initial registration of enterprise primary corporate mark.',
          createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
          auditEventId: 'audit_init_asset_01'
        }
      ]
    };

    const monoAsset = {
      id: 'asset_apex_logo_02',
      tenantId,
      brandId: `brand_${tenantId}`,
      name: `${brandName} Monochrome Dark Symbol & Hardware Icon`,
      assetType: 'MONOCHROME_LOGO',
      brandName: brandName,
      description: 'High-contrast monochrome icon mark for physical 2FA hardware tokens and dark mode UI.',
      currentVersion: 1,
      status: 'ACTIVE',
      isApproved: true,
      uploadDate: new Date(Date.now() - 60 * 86400000).toISOString(),
      uploadedBy: 'Information Security Office',
      fileType: 'image/png',
      fileSize: 34190,
      dimensions: { width: 256, height: 256 },
      sha256: 'c42177a83d91b01e827102938471920384192038419238410293840192384102',
      perceptualHash: 'c42177a83d91b01e',
      embeddingReference: 'vec_emb_apex_mono_v1',
      backgroundType: 'DARK',
      colorPalette: ['#0F172A', '#FFFFFF'],
      ocrText: `${brandName.toUpperCase()} MONOCHROME EMBLEM`,
      associatedDomain: officialDomain,
      associatedProducts: ['Hardware Security Modules'],
      associatedServices: ['Cryptographic Multi-Sig Verification'],
      officialUsageLocations: ['Hardware Signer Displays'],
      effectiveDate: '2024-03-01T00:00:00Z',
      notes: 'Monochrome vector format with zero gradient.',
      tags: ['monochrome', 'hardware', 'symbol'],
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      versionHistory: [
        {
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
          ocrText: `${brandName.toUpperCase()} MONOCHROME EMBLEM`,
          createdBy: 'Information Security Office',
          changeReason: 'Registration of monochrome emblem.',
          createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
          auditEventId: 'audit_init_asset_02'
        }
      ]
    };

    const favAsset = {
      id: 'asset_apex_logo_03',
      tenantId,
      brandId: `brand_${tenantId}`,
      name: `${brandName} Cryptographic Hexagon Favicon`,
      assetType: 'FAVICON',
      brandName: brandName,
      description: 'Official 64x64 browser favicon rendered across verified web portals.',
      currentVersion: 1,
      status: 'ACTIVE',
      isApproved: true,
      uploadDate: new Date(Date.now() - 45 * 86400000).toISOString(),
      uploadedBy: 'Technical Engineering Lead',
      fileType: 'image/png',
      fileSize: 4210,
      dimensions: { width: 64, height: 64 },
      sha256: '8a91c47fe12b4d99827102938471920384192038419238410293840192384102',
      perceptualHash: '8a91c47fe12b4d99',
      embeddingReference: 'vec_emb_apex_fav_v1',
      backgroundType: 'TRANSPARENT',
      colorPalette: ['#4F46E5', '#38BDF8'],
      ocrText: 'AFS',
      associatedDomain: officialDomain,
      associatedProducts: ['Web Portal'],
      associatedServices: ['Browser Security'],
      officialUsageLocations: ['Browser Tab Favicon'],
      effectiveDate: '2024-04-01T00:00:00Z',
      notes: 'Browser favicon monitor.',
      tags: ['favicon', 'tab-icon'],
      createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 45 * 86400000).toISOString(),
      versionHistory: [
        {
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
          createdBy: 'Technical Engineering Lead',
          changeReason: 'Standard browser 64px hex favicon.',
          createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
          auditEventId: 'audit_init_asset_03'
        }
      ]
    };

    db.brandAssets[tenantId] = [primaryAsset, monoAsset, favAsset];

    // Seed Matches
    db.logoMatches[tenantId] = [
      {
        id: 'match_lgo_01',
        tenantId,
        matchCode: 'LGO-2026-0041',
        brandAssetId: 'asset_apex_logo_01',
        brandAssetVersionId: 'ver_apex_logo_01_v1',
        brandAssetName: `${brandName} Primary Shield & Wordmark`,
        officialLogoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60',
        sourceId: 'src_ct_stream',
        sourceType: 'PHISHING_PAGE',
        sourceUrl: `https://${cleanSlug}-custody-login.xyz/auth/signin`,
        targetDomain: `${cleanSlug}-custody-login.xyz`,
        detectedImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60',
        detectedImageDimensions: { width: 480, height: 140 },
        detectedRegionCoordinates: { x: 36, y: 22, width: 320, height: 110 },
        similarityScore: 98,
        aiConfidence: 99,
        aiVisionProvider: 'OPENCLIP_VIT_EMBEDDING',
        aiAnalysisState: 'COMPLETED',
        transformations: {
          isExactHashMatch: true,
          isPerceptualHashMatch: true,
          isCropped: false,
          isResized: true,
          isRotated: false,
          rotationDegrees: 0,
          isMirrored: false,
          isColorModified: false,
          isLowResolution: false,
          isPartialLogo: false,
          embeddedInScreenshot: true,
          embeddedInAdvertisement: false,
          embeddedInWebpage: true,
          embeddedInMobileIcon: false,
          combinedWithFakeText: true,
          combinedWithMaliciousUrl: true,
          combinedWithFakeLoginForm: true
        },
        status: 'SUSPECTED_IMPERSONATION',
        riskAssessment: {
          riskScore: 92,
          riskLevel: 'CRITICAL',
          calculatedAt: now,
          modelVersion: 'Skanda-LogoCorrelator-v2.6',
          factors: [
            {
              factorKey: 'LOGO_SIMILARITY',
              name: 'Visual Brand Logo Similarity',
              category: 'BRAND',
              pointsAwarded: 25,
              maxPoints: 25,
              isTriggered: true,
              description: '98% visual resemblance to registered primary mark.',
              rawEvidence: 'OpenCLIP cosine 0.982, pHash Hamming distance: 1'
            },
            {
              factorKey: 'OFFICIAL_DOMAIN_MISMATCH',
              name: 'Unapproved Host / Domain Mismatch',
              category: 'DOMAIN',
              pointsAwarded: 15,
              maxPoints: 15,
              isTriggered: true,
              description: `Domain ${cleanSlug}-custody-login.xyz does not match verified root ${officialDomain}`,
              rawEvidence: `Target: ${cleanSlug}-custody-login.xyz | Official: ${officialDomain}`
            },
            {
              factorKey: 'CREDENTIAL_HARVESTING_FORMS',
              name: 'Phishing Forms & Credential Interception',
              category: 'WEBSITE',
              pointsAwarded: 20,
              maxPoints: 20,
              isTriggered: true,
              description: 'Password input, 2FA code harvesting and master seed fields detected.',
              rawEvidence: 'HTML form actions target offshore relay'
            },
            {
              factorKey: 'THREAT_INTEL_REPUTATION',
              name: 'External Threat Feed & ASN Reputation',
              category: 'THREAT_INTEL',
              pointsAwarded: 15,
              maxPoints: 15,
              isTriggered: true,
              description: 'Host AS49505 is flagged on Spamhaus & URLhaus blacklists.',
              rawEvidence: 'Hostkey B.V. Bulletproof Hosting'
            },
            {
              factorKey: 'DOMAIN_INTELLIGENCE_ANOMALY',
              name: 'Domain Typosquatting & TLD Risk',
              category: 'DOMAIN',
              pointsAwarded: 12,
              maxPoints: 15,
              isTriggered: true,
              description: 'Suspicious .xyz TLD, domain age 14 days.',
              rawEvidence: 'Registered 14 days ago via privacy proxy'
            },
            {
              factorKey: 'LAYOUT_CLONE_TRADEMARK',
              name: 'Brand Typography & Layout Replication',
              category: 'BRAND',
              pointsAwarded: 5,
              maxPoints: 10,
              isTriggered: true,
              description: 'Layout clone similarity 91%.',
              rawEvidence: 'DOM structure matches institutional login'
            }
          ],
          topDrivers: [
            'Visual Brand Logo Similarity (+25 pts)',
            'Phishing Forms & Credential Interception (+20 pts)',
            'Unapproved Host / Domain Mismatch (+15 pts)'
          ]
        },
        correlations: {
          brandSignals: {
            brandNameSimilarity: 85,
            productNameSimilarity: 80,
            trademarkTextMatched: true,
            brandColorCosineSimilarity: 0.96,
            typographySimilarity: 88,
            sloganSimilarity: 90,
            isOfficialAssetMatch: false
          },
          domainSignals: {
            targetDomain: 'apexfintech-custody-login.xyz',
            isTyposquatting: false,
            isHomoglyph: false,
            isPunycode: false,
            isNewlyRegisteredDomain: true,
            domainAgeDays: 14,
            suspiciousTld: true,
            nameserverAnomalies: true,
            tlsCertificateAnomalies: true,
            hasMxRecord: true,
            resolvedIps: ['194.26.29.114'],
            asn: 'AS49505',
            asnOrg: 'Hostkey B.V. / Bulletproof Offshore Provider',
            hostingProvider: 'Offshore Secure Hosting',
            redirectChain: ['https://apexfintech-custody-login.xyz/auth/signin'],
            isUrlShortener: false,
            isOfficialDomainMismatch: true
          },
          websiteSignals: {
            hasLoginForm: true,
            hasCredentialHarvesting: true,
            hasPaymentForm: false,
            hasOtpCollection: true,
            hasPersonalInfoCollection: true,
            hasFakeSupportForm: false,
            hasMaliciousDownload: false,
            suspiciousJavaScriptCount: 6,
            brandImpersonationLanguage: ['Institutional Portal Login', 'Enter Master 2FA'],
            hasFakeOffers: false,
            hasFakeRecruitment: false,
            hasFakeInvestment: false,
            missingLegalDisclaimers: true,
            layoutCloneSimilarity: 91
          },
          threatIntelSignals: {
            isKnownMaliciousIp: true,
            isKnownMaliciousDomain: true,
            threatFeedMatches: ['PhishTank Active Blacklist', 'URLhaus Emerging Threat Registry'],
            securityVendorReputation: 'MALICIOUS',
            abuseReportsCount: 6,
            historicalDetectionsCount: 4,
            hasPreviousTakedowns: false
          }
        },
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
        lastSeenAt: now,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: now
      },
      {
        id: 'match_lgo_02',
        tenantId,
        matchCode: 'LGO-2026-0042',
        brandAssetId: 'asset_apex_logo_02',
        brandAssetVersionId: 'ver_apex_logo_02_v1',
        brandAssetName: `${brandName} Monochrome Dark Symbol`,
        officialLogoUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=300&auto=format&fit=crop&q=60',
        sourceId: 'src_social_scanner',
        sourceType: 'SOCIAL_PROFILE',
        sourceUrl: `https://t.me/${cleanSlug}_VIP_Fund`,
        targetDomain: 't.me',
        detectedImageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=300&auto=format&fit=crop&q=60',
        detectedImageDimensions: { width: 256, height: 256 },
        detectedRegionCoordinates: { x: 12, y: 12, width: 232, height: 232 },
        similarityScore: 92,
        aiConfidence: 94,
        aiVisionProvider: 'OPENCLIP_VIT_EMBEDDING',
        aiAnalysisState: 'COMPLETED',
        transformations: {
          isExactHashMatch: false,
          isPerceptualHashMatch: true,
          isCropped: false,
          isResized: false,
          isRotated: false,
          rotationDegrees: 0,
          isMirrored: false,
          isColorModified: false,
          isLowResolution: false,
          isPartialLogo: false,
          embeddedInScreenshot: false,
          embeddedInAdvertisement: false,
          embeddedInWebpage: false,
          embeddedInMobileIcon: false,
          combinedWithFakeText: true,
          combinedWithMaliciousUrl: false,
          combinedWithFakeLoginForm: false
        },
        status: 'UNDER_INVESTIGATION',
        riskAssessment: {
          riskScore: 78,
          riskLevel: 'HIGH',
          calculatedAt: now,
          modelVersion: 'Skanda-LogoCorrelator-v2.6',
          factors: [
            {
              factorKey: 'LOGO_SIMILARITY',
              name: 'Visual Brand Logo Similarity',
              category: 'BRAND',
              pointsAwarded: 23,
              maxPoints: 25,
              isTriggered: true,
              description: '92% visual match to monochrome token mark.',
              rawEvidence: 'Social avatar exact match'
            },
            {
              factorKey: 'CREDENTIAL_HARVESTING_FORMS',
              name: 'Phishing Forms & Credential Interception',
              category: 'WEBSITE',
              pointsAwarded: 15,
              maxPoints: 20,
              isTriggered: true,
              description: 'Fraudulent investment guarantees and VIP fund solicitations.',
              rawEvidence: `Promises 18% monthly returns under ${brandName} name`
            },
            {
              factorKey: 'OFFICIAL_DOMAIN_MISMATCH',
              name: 'Unapproved Host / Domain Mismatch',
              category: 'DOMAIN',
              pointsAwarded: 15,
              maxPoints: 15,
              isTriggered: true,
              description: 'Third party social channel not in verified directory.',
              rawEvidence: `t.me/${cleanSlug}_VIP_Fund`
            }
          ],
          topDrivers: [
            'Visual Brand Logo Similarity (+23 pts)',
            'Phishing Forms & Credential Interception (+15 pts)',
            'Unapproved Host / Domain Mismatch (+15 pts)'
          ]
        },
        correlations: {
          brandSignals: {
            brandNameSimilarity: 75,
            productNameSimilarity: 80,
            trademarkTextMatched: true,
            brandColorCosineSimilarity: 0.94,
            typographySimilarity: 85,
            sloganSimilarity: 20,
            isOfficialAssetMatch: false
          },
          domainSignals: {
            targetDomain: 't.me',
            isTyposquatting: false,
            isHomoglyph: false,
            isPunycode: false,
            isNewlyRegisteredDomain: false,
            domainAgeDays: 4000,
            suspiciousTld: false,
            nameserverAnomalies: false,
            tlsCertificateAnomalies: false,
            hasMxRecord: false,
            resolvedIps: ['149.154.167.99'],
            asn: 'AS62041',
            asnOrg: 'Telegram Messenger Inc.',
            hostingProvider: 'Telegram Datacenter',
            redirectChain: [`https://t.me/${cleanSlug}_VIP_Fund`],
            isUrlShortener: false,
            isOfficialDomainMismatch: true
          },
          websiteSignals: {
            hasLoginForm: false,
            hasCredentialHarvesting: false,
            hasPaymentForm: true,
            hasOtpCollection: false,
            hasPersonalInfoCollection: true,
            hasFakeSupportForm: false,
            hasMaliciousDownload: false,
            suspiciousJavaScriptCount: 0,
            brandImpersonationLanguage: ['Guaranteed High-Yield Returns', 'Official Trading Desk'],
            hasFakeOffers: true,
            hasFakeRecruitment: false,
            hasFakeInvestment: true,
            missingLegalDisclaimers: true,
            layoutCloneSimilarity: 30
          },
          threatIntelSignals: {
            isKnownMaliciousIp: false,
            isKnownMaliciousDomain: false,
            threatFeedMatches: [],
            securityVendorReputation: 'CLEAN',
            abuseReportsCount: 2,
            historicalDetectionsCount: 1,
            hasPreviousTakedowns: false
          }
        },
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
      },
      {
        id: 'match_lgo_03',
        tenantId,
        matchCode: 'LGO-2026-0043',
        brandAssetId: 'asset_apex_logo_01',
        brandAssetVersionId: 'ver_apex_logo_01_v1',
        brandAssetName: `${brandName} Primary Shield & Wordmark`,
        officialLogoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60',
        sourceId: 'src_web_crawl_03',
        sourceType: 'PUBLIC_WEBSITE',
        sourceUrl: `https://${cleanSlug}-partners-notice.com/careers`,
        targetDomain: `${cleanSlug}-partners-notice.com`,
        detectedImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60',
        detectedImageDimensions: { width: 512, height: 160 },
        detectedRegionCoordinates: { x: 20, y: 15, width: 480, height: 140 },
        similarityScore: 89,
        aiConfidence: 91,
        aiVisionProvider: 'OPENCLIP_VIT_EMBEDDING',
        aiAnalysisState: 'COMPLETED',
        transformations: {
          isExactHashMatch: false,
          isPerceptualHashMatch: true,
          isCropped: false,
          isResized: false,
          isRotated: false,
          rotationDegrees: 0,
          isMirrored: false,
          isColorModified: true,
          isLowResolution: false,
          isPartialLogo: false,
          embeddedInScreenshot: false,
          embeddedInAdvertisement: false,
          embeddedInWebpage: true,
          embeddedInMobileIcon: false,
          combinedWithFakeText: true,
          combinedWithMaliciousUrl: true,
          combinedWithFakeLoginForm: true
        },
        status: 'CONFIRMED_UNAUTHORIZED_USE',
        riskAssessment: {
          riskScore: 72,
          riskLevel: 'HIGH',
          calculatedAt: now,
          modelVersion: 'Skanda-LogoCorrelator-v2.6',
          factors: [
            {
              factorKey: 'LOGO_SIMILARITY',
              name: 'Visual Brand Logo Similarity',
              category: 'BRAND',
              pointsAwarded: 22,
              maxPoints: 25,
              isTriggered: true,
              description: '89% visual similarity with color-hue shift.',
              rawEvidence: 'Hue rotated 12 deg'
            },
            {
              factorKey: 'DOMAIN_INTELLIGENCE_ANOMALY',
              name: 'Domain Typosquatting & TLD Risk',
              category: 'DOMAIN',
              pointsAwarded: 15,
              maxPoints: 15,
              isTriggered: true,
              description: 'Typosquatting: "apexfintch" missing "e".',
              rawEvidence: 'Typosquat distance: 1 char'
            },
            {
              factorKey: 'OFFICIAL_DOMAIN_MISMATCH',
              name: 'Unapproved Host / Domain Mismatch',
              category: 'DOMAIN',
              pointsAwarded: 15,
              maxPoints: 15,
              isTriggered: true,
              description: 'Unauthorized recruitment portal collecting applicant PII.',
              rawEvidence: 'Applicant portal asks for bank details'
            }
          ],
          topDrivers: [
            'Visual Brand Logo Similarity (+22 pts)',
            'Domain Typosquatting & TLD Risk (+15 pts)',
            'Unapproved Host / Domain Mismatch (+15 pts)'
          ]
        },
        correlations: {
          brandSignals: {
            brandNameSimilarity: 80,
            productNameSimilarity: 30,
            trademarkTextMatched: true,
            brandColorCosineSimilarity: 0.82,
            typographySimilarity: 88,
            sloganSimilarity: 25,
            isOfficialAssetMatch: false
          },
          domainSignals: {
            targetDomain: `${cleanSlug}-partners-notice.com`,
            isTyposquatting: true,
            isHomoglyph: false,
            isPunycode: false,
            isNewlyRegisteredDomain: true,
            domainAgeDays: 24,
            suspiciousTld: false,
            nameserverAnomalies: false,
            tlsCertificateAnomalies: false,
            hasMxRecord: true,
            resolvedIps: ['104.21.55.12'],
            asn: 'AS13335',
            asnOrg: 'Cloudflare, Inc.',
            hostingProvider: 'Cloudflare Proxy',
            redirectChain: [`https://${cleanSlug}-partners-notice.com/careers`],
            isUrlShortener: false,
            isOfficialDomainMismatch: true
          },
          websiteSignals: {
            hasLoginForm: true,
            hasCredentialHarvesting: false,
            hasPaymentForm: false,
            hasOtpCollection: false,
            hasPersonalInfoCollection: true,
            hasFakeSupportForm: false,
            hasMaliciousDownload: false,
            suspiciousJavaScriptCount: 2,
            brandImpersonationLanguage: ['Remote Executive Assistant Openings'],
            hasFakeOffers: false,
            hasFakeRecruitment: true,
            hasFakeInvestment: false,
            missingLegalDisclaimers: true,
            layoutCloneSimilarity: 65
          },
          threatIntelSignals: {
            isKnownMaliciousIp: false,
            isKnownMaliciousDomain: false,
            threatFeedMatches: [],
            securityVendorReputation: 'SUSPICIOUS',
            abuseReportsCount: 3,
            historicalDetectionsCount: 1,
            hasPreviousTakedowns: true
          }
        },
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
      },
      {
        id: 'match_lgo_04',
        tenantId,
        matchCode: 'LGO-2026-0044',
        brandAssetId: 'asset_apex_logo_01',
        brandAssetVersionId: 'ver_apex_logo_01_v1',
        brandAssetName: `${brandName} Primary Shield & Wordmark`,
        officialLogoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60',
        sourceId: 'src_ad_network_04',
        sourceType: 'ONLINE_ADVERTISEMENT',
        sourceUrl: 'https://network-ad-exchange.bid/creatives/c_981294',
        targetDomain: 'network-ad-exchange.bid',
        detectedImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60',
        detectedImageDimensions: { width: 300, height: 250 },
        detectedRegionCoordinates: { x: 10, y: 10, width: 280, height: 90 },
        similarityScore: 84,
        aiConfidence: 88,
        aiVisionProvider: 'OPENCLIP_VIT_EMBEDDING',
        aiAnalysisState: 'COMPLETED',
        transformations: {
          isExactHashMatch: false,
          isPerceptualHashMatch: true,
          isCropped: true,
          isResized: true,
          isRotated: false,
          rotationDegrees: 0,
          isMirrored: false,
          isColorModified: false,
          isLowResolution: false,
          isPartialLogo: true,
          embeddedInScreenshot: false,
          embeddedInAdvertisement: true,
          embeddedInWebpage: false,
          embeddedInMobileIcon: false,
          combinedWithFakeText: true,
          combinedWithMaliciousUrl: false,
          combinedWithFakeLoginForm: false
        },
        status: 'RESOLVED',
        riskAssessment: {
          riskScore: 64,
          riskLevel: 'HIGH',
          calculatedAt: now,
          modelVersion: 'Skanda-LogoCorrelator-v2.6',
          factors: [
            {
              factorKey: 'LOGO_SIMILARITY',
              name: 'Visual Brand Logo Similarity',
              category: 'BRAND',
              pointsAwarded: 21,
              maxPoints: 25,
              isTriggered: true,
              description: '84% visual match embedded in display banner ad.',
              rawEvidence: 'Banner 300x250'
            },
            {
              factorKey: 'DOMAIN_INTELLIGENCE_ANOMALY',
              name: 'Domain Typosquatting & TLD Risk',
              category: 'DOMAIN',
              pointsAwarded: 10,
              maxPoints: 15,
              isTriggered: true,
              description: 'Host domain uses risky .bid TLD.',
              rawEvidence: '.bid top level domain'
            },
            {
              factorKey: 'OFFICIAL_DOMAIN_MISMATCH',
              name: 'Unapproved Host / Domain Mismatch',
              category: 'DOMAIN',
              pointsAwarded: 15,
              maxPoints: 15,
              isTriggered: true,
              description: 'Ad campaign not authorized by corporate marketing.',
              rawEvidence: 'Rogue advertiser account'
            }
          ],
          topDrivers: [
            'Visual Brand Logo Similarity (+21 pts)',
            'Unapproved Host / Domain Mismatch (+15 pts)',
            'Domain Typosquatting & TLD Risk (+10 pts)'
          ]
        },
        correlations: {
          brandSignals: {
            brandNameSimilarity: 70,
            productNameSimilarity: 60,
            trademarkTextMatched: true,
            brandColorCosineSimilarity: 0.90,
            typographySimilarity: 82,
            sloganSimilarity: 10,
            isOfficialAssetMatch: false
          },
          domainSignals: {
            targetDomain: 'network-ad-exchange.bid',
            isTyposquatting: false,
            isHomoglyph: false,
            isPunycode: false,
            isNewlyRegisteredDomain: false,
            domainAgeDays: 180,
            suspiciousTld: true,
            nameserverAnomalies: false,
            tlsCertificateAnomalies: false,
            hasMxRecord: false,
            resolvedIps: ['185.191.171.12'],
            asn: 'AS200000',
            asnOrg: 'AdNetwork Europe',
            hostingProvider: 'DigitalOcean',
            redirectChain: ['https://network-ad-exchange.bid/creatives/c_981294'],
            isUrlShortener: false,
            isOfficialDomainMismatch: true
          },
          websiteSignals: {
            hasLoginForm: false,
            hasCredentialHarvesting: false,
            hasPaymentForm: false,
            hasOtpCollection: false,
            hasPersonalInfoCollection: false,
            hasFakeSupportForm: false,
            hasMaliciousDownload: false,
            suspiciousJavaScriptCount: 1,
            brandImpersonationLanguage: [`${brandName} WealthCore — Institutional Accounts`],
            hasFakeOffers: true,
            hasFakeRecruitment: false,
            hasFakeInvestment: true,
            missingLegalDisclaimers: true,
            layoutCloneSimilarity: 25
          },
          threatIntelSignals: {
            isKnownMaliciousIp: false,
            isKnownMaliciousDomain: false,
            threatFeedMatches: [],
            securityVendorReputation: 'CLEAN',
            abuseReportsCount: 1,
            historicalDetectionsCount: 0,
            hasPreviousTakedowns: true
          }
        },
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
      },
      {
        id: 'match_lgo_05',
        tenantId,
        matchCode: 'LGO-2026-0045',
        brandAssetId: 'asset_apex_logo_03',
        brandAssetVersionId: 'ver_apex_logo_03_v1',
        brandAssetName: `${brandName} Cryptographic Hexagon Favicon`,
        officialLogoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&auto=format&fit=crop&q=60',
        sourceId: 'src_app_listing_05',
        sourceType: 'MOBILE_APP_LISTING',
        sourceUrl: `https://apk-pure-mirror.ru/app/com.${cleanSlug}.auth`,
        targetDomain: 'apk-pure-mirror.ru',
        detectedImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=64&auto=format&fit=crop&q=60',
        detectedImageDimensions: { width: 128, height: 128 },
        detectedRegionCoordinates: { x: 0, y: 0, width: 128, height: 128 },
        similarityScore: 94,
        aiConfidence: 96,
        aiVisionProvider: 'OPENCLIP_VIT_EMBEDDING',
        aiAnalysisState: 'COMPLETED',
        transformations: {
          isExactHashMatch: false,
          isPerceptualHashMatch: true,
          isCropped: false,
          isResized: true,
          isRotated: false,
          rotationDegrees: 0,
          isMirrored: false,
          isColorModified: false,
          isLowResolution: false,
          isPartialLogo: false,
          embeddedInScreenshot: false,
          embeddedInAdvertisement: false,
          embeddedInWebpage: false,
          embeddedInMobileIcon: true,
          combinedWithFakeText: true,
          combinedWithMaliciousUrl: true,
          combinedWithFakeLoginForm: true
        },
        status: 'POTENTIAL_MATCH',
        riskAssessment: {
          riskScore: 82,
          riskLevel: 'CRITICAL',
          calculatedAt: now,
          modelVersion: 'Skanda-LogoCorrelator-v2.6',
          factors: [
            {
              factorKey: 'LOGO_SIMILARITY',
              name: 'Visual Brand Logo Similarity',
              category: 'BRAND',
              pointsAwarded: 24,
              maxPoints: 25,
              isTriggered: true,
              description: '94% match used as APK application launcher icon.',
              rawEvidence: 'Launcher icon hash match'
            },
            {
              factorKey: 'CREDENTIAL_HARVESTING_FORMS',
              name: 'Phishing Forms & Credential Interception',
              category: 'WEBSITE',
              pointsAwarded: 20,
              maxPoints: 20,
              isTriggered: true,
              description: `Trojanized APK masquerades as ${brandName} Token Authenticator.`,
              rawEvidence: 'Malicious Android APK package'
            },
            {
              factorKey: 'DOMAIN_INTELLIGENCE_ANOMALY',
              name: 'Domain Typosquatting & TLD Risk',
              category: 'DOMAIN',
              pointsAwarded: 15,
              maxPoints: 15,
              isTriggered: true,
              description: 'Hosted on unofficial Russian APK mirror (.ru TLD).',
              rawEvidence: 'apk-pure-mirror.ru'
            }
          ],
          topDrivers: [
            'Visual Brand Logo Similarity (+24 pts)',
            'Phishing Forms & Credential Interception (+20 pts)',
            'Domain Typosquatting & TLD Risk (+15 pts)'
          ]
        },
        correlations: {
          brandSignals: {
            brandNameSimilarity: 90,
            productNameSimilarity: 85,
            trademarkTextMatched: true,
            brandColorCosineSimilarity: 0.96,
            typographySimilarity: 90,
            sloganSimilarity: 20,
            isOfficialAssetMatch: false
          },
          domainSignals: {
            targetDomain: 'apk-pure-mirror.ru',
            isTyposquatting: false,
            isHomoglyph: false,
            isPunycode: false,
            isNewlyRegisteredDomain: false,
            domainAgeDays: 320,
            suspiciousTld: true,
            nameserverAnomalies: false,
            tlsCertificateAnomalies: false,
            hasMxRecord: false,
            resolvedIps: ['95.213.255.10'],
            asn: 'AS44050',
            asnOrg: 'Petersburg Internet Network',
            hostingProvider: 'PIN Telecommunications',
            redirectChain: [`https://apk-pure-mirror.ru/app/com.${cleanSlug}.auth`],
            isUrlShortener: false,
            isOfficialDomainMismatch: true
          },
          websiteSignals: {
            hasLoginForm: true,
            hasCredentialHarvesting: true,
            hasPaymentForm: false,
            hasOtpCollection: true,
            hasPersonalInfoCollection: true,
            hasFakeSupportForm: false,
            hasMaliciousDownload: true,
            suspiciousJavaScriptCount: 4,
            brandImpersonationLanguage: [`${brandName} Token Authenticator v2.4 APK`],
            hasFakeOffers: false,
            hasFakeRecruitment: false,
            hasFakeInvestment: false,
            missingLegalDisclaimers: true,
            layoutCloneSimilarity: 78
          },
          threatIntelSignals: {
            isKnownMaliciousIp: true,
            isKnownMaliciousDomain: true,
            threatFeedMatches: ['VirusTotal Android Malware Alert'],
            securityVendorReputation: 'MALICIOUS',
            abuseReportsCount: 8,
            historicalDetectionsCount: 2,
            hasPreviousTakedowns: false
          }
        },
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
        lastSeenAt: now,
        createdAt: new Date(Date.now() - 14400000).toISOString(),
        updatedAt: now
      }
    ];

    // Seed Cases
    db.investigationCases[tenantId] = [
      {
        id: 'case_lgo_01',
        tenantId,
        caseNumber: 'CASE-LGO-9812',
        logoMatchId: 'match_lgo_01',
        title: 'Institutional Phishing Clone with Primary Shield Logo on .xyz Domain',
        priority: 'CRITICAL',
        status: 'UNDER_REVIEW',
        assignedTo: 'Marcus Vance (Incident Lead)',
        summary: `Target domain ${cleanSlug}-custody-login.xyz uses an exact visual clone of our primary gradient logo with an active 2FA credential harvesting form.`,
        associatedDomain: `${cleanSlug}-custody-login.xyz`,
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
        summary: `Telegram channel @${cleanSlug}_VIP_Fund using our monochrome logo with fraudulent 18% monthly yield promises.`,
        associatedDomain: `t.me/${cleanSlug}_VIP_Fund`,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 14400000).toISOString()
      }
    ];

    // Seed Takedowns
    db.takedownRequests[tenantId] = [
      {
        id: 'tkd_lgo_01',
        tenantId,
        takedownNumber: 'TKD-2026-031',
        logoMatchId: 'match_lgo_01',
        targetDomain: `${cleanSlug}-custody-login.xyz`,
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

    // Seed Jobs
    db.monitoringJobs[tenantId] = [
      {
        id: 'job_lgo_001',
        tenantId,
        sourceId: 'src_ct_stream',
        sourceName: 'Real-Time Certificate Transparency Feed',
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
      }
    ];

    persistDb();
  }
}

// --------------------------------------------------------------------------
// 1. Brand Asset Registry Endpoints
// --------------------------------------------------------------------------

// GET /api/v1/brand-assets
router.get('/brand-assets', (req: Request, res: Response) => {
  const tenantId = (req.query.tenantId as string) || 'default_tenant';
  ensureTenantSeeded(tenantId);
  const assets = db.brandAssets[tenantId] || [];
  return res.json({ success: true, count: assets.length, data: assets });
});

// POST /api/v1/brand-assets
router.post('/brand-assets', (req: Request, res: Response) => {
  const tenantId = req.body.tenantId || 'default_tenant';
  ensureTenantSeeded(tenantId);

  const {
    name,
    assetType,
    brandName,
    description,
    fileReference,
    fileType,
    fileSize,
    dimensions,
    backgroundType,
    colorPalette,
    ocrText,
    associatedDomain,
    associatedProducts,
    associatedServices,
    officialUsageLocations,
    uploadedBy,
    notes,
    tags
  } = req.body;

  if (!name || !assetType || !fileReference) {
    return res.status(400).json({ success: false, error: 'Name, assetType, and fileReference are required.' });
  }

  // Generate SHA-256 and pHash
  const sha256 = crypto.createHash('sha256').update(`${name}:${fileReference}:${Date.now()}`).digest('hex');
  const perceptualHash = crypto.createHash('md5').update(`${name}:${dimensions?.width || 256}`).digest('hex').substring(0, 16);

  const assetId = `asset_lgo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const versionId = `ver_${assetId}_v1`;
  const now = new Date().toISOString();

  const initialVersion = {
    id: versionId,
    brandAssetId: assetId,
    tenantId,
    version: 1,
    fileReference,
    fileType: fileType || 'image/png',
    fileSize: fileSize || 25000,
    dimensions: dimensions || { width: 512, height: 512 },
    sha256,
    perceptualHash,
    embeddingReference: `vec_emb_${sha256.substring(0, 12)}`,
    backgroundType: backgroundType || 'TRANSPARENT',
    colorPalette: colorPalette || ['#4F46E5', '#FFFFFF'],
    ocrText: ocrText || brandName || name,
    createdBy: uploadedBy || 'Security Admin',
    changeReason: 'Initial registration of brand asset.',
    createdAt: now,
    auditEventId: `audit_asset_${Date.now()}`
  };

  const tenantBrand = getTenantBrandDetails(tenantId);
  const newAsset = {
    id: assetId,
    tenantId,
    brandId: `brand_${tenantId}`,
    name,
    assetType,
    brandName: brandName || tenantBrand.brandName,
    description: description || '',
    currentVersion: 1,
    status: 'ACTIVE',
    isApproved: true,
    uploadDate: now,
    uploadedBy: uploadedBy || 'Security Admin',
    fileType: fileType || 'image/png',
    fileSize: fileSize || 25000,
    dimensions: dimensions || { width: 512, height: 512 },
    sha256,
    perceptualHash,
    embeddingReference: initialVersion.embeddingReference,
    backgroundType: backgroundType || 'TRANSPARENT',
    colorPalette: colorPalette || ['#4F46E5', '#FFFFFF'],
    ocrText: ocrText || brandName || name,
    associatedDomain: associatedDomain || tenantBrand.officialDomain,
    associatedProducts: associatedProducts || [],
    associatedServices: associatedServices || [],
    officialUsageLocations: officialUsageLocations || [],
    effectiveDate: now,
    notes: notes || '',
    tags: tags || ['registered'],
    createdAt: now,
    updatedAt: now,
    versionHistory: [initialVersion]
  };

  db.brandAssets[tenantId] = [newAsset, ...(db.brandAssets[tenantId] || [])];
  persistDb();

  return res.status(201).json({ success: true, data: newAsset });
});

// GET /api/v1/brand-assets/:id
router.get('/brand-assets/:id', (req: Request, res: Response) => {
  const tenantId = (req.query.tenantId as string) || 'default_tenant';
  ensureTenantSeeded(tenantId);
  const asset = (db.brandAssets[tenantId] || []).find(a => a.id === req.params.id);
  if (!asset) {
    return res.status(404).json({ success: false, error: 'Brand asset not found.' });
  }
  return res.json({ success: true, data: asset });
});

// PATCH /api/v1/brand-assets/:id
router.patch('/brand-assets/:id', (req: Request, res: Response) => {
  const tenantId = req.body.tenantId || (req.query.tenantId as string) || 'default_tenant';
  ensureTenantSeeded(tenantId);
  const assets = db.brandAssets[tenantId] || [];
  const index = assets.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Brand asset not found.' });
  }

  const existing = assets[index];
  const updated = {
    ...existing,
    ...req.body,
    id: existing.id,
    tenantId: existing.tenantId,
    updatedAt: new Date().toISOString()
  };

  assets[index] = updated;
  persistDb();
  return res.json({ success: true, data: updated });
});

// DELETE /api/v1/brand-assets/:id
router.delete('/brand-assets/:id', (req: Request, res: Response) => {
  const tenantId = (req.query.tenantId as string) || 'default_tenant';
  ensureTenantSeeded(tenantId);
  const assets = db.brandAssets[tenantId] || [];
  db.brandAssets[tenantId] = assets.filter(a => a.id !== req.params.id);
  persistDb();
  return res.json({ success: true, message: 'Brand asset removed from active registry.' });
});

// POST /api/v1/brand-assets/:id/versions
router.post('/brand-assets/:id/versions', (req: Request, res: Response) => {
  const tenantId = req.body.tenantId || (req.query.tenantId as string) || 'default_tenant';
  ensureTenantSeeded(tenantId);
  const assets = db.brandAssets[tenantId] || [];
  const asset = assets.find(a => a.id === req.params.id);
  if (!asset) {
    return res.status(404).json({ success: false, error: 'Brand asset not found.' });
  }

  const { fileReference, fileType, fileSize, dimensions, createdBy, changeReason, colorPalette, ocrText } = req.body;
  const nextVer = (asset.currentVersion || 1) + 1;
  const sha256 = crypto.createHash('sha256').update(`${asset.name}:v${nextVer}:${Date.now()}`).digest('hex');
  const perceptualHash = crypto.createHash('md5').update(`${asset.name}:v${nextVer}`).digest('hex').substring(0, 16);
  const now = new Date().toISOString();

  const newVersion = {
    id: `ver_${asset.id}_v${nextVer}_${Date.now()}`,
    brandAssetId: asset.id,
    tenantId,
    version: nextVer,
    fileReference: fileReference || asset.fileReference,
    fileType: fileType || asset.fileType,
    fileSize: fileSize || asset.fileSize,
    dimensions: dimensions || asset.dimensions,
    sha256,
    perceptualHash,
    embeddingReference: `vec_emb_${sha256.substring(0, 12)}`,
    backgroundType: asset.backgroundType,
    colorPalette: colorPalette || asset.colorPalette,
    ocrText: ocrText || asset.ocrText,
    createdBy: createdBy || 'Security Reviewer',
    changeReason: changeReason || `Updated brand asset version to v${nextVer}`,
    createdAt: now,
    auditEventId: `audit_asset_v${nextVer}_${Date.now()}`
  };

  asset.currentVersion = nextVer;
  asset.fileType = newVersion.fileType;
  asset.fileSize = newVersion.fileSize;
  asset.dimensions = newVersion.dimensions;
  asset.sha256 = sha256;
  asset.perceptualHash = perceptualHash;
  asset.updatedAt = now;
  asset.versionHistory = [newVersion, ...asset.versionHistory];

  persistDb();
  return res.status(201).json({ success: true, data: { updatedAsset: asset, newVersion } });
});

// GET /api/v1/brand-assets/:id/versions
router.get('/brand-assets/:id/versions', (req: Request, res: Response) => {
  const tenantId = (req.query.tenantId as string) || 'default_tenant';
  ensureTenantSeeded(tenantId);
  const asset = (db.brandAssets[tenantId] || []).find(a => a.id === req.params.id);
  if (!asset) {
    return res.status(404).json({ success: false, error: 'Brand asset not found.' });
  }
  return res.json({ success: true, count: asset.versionHistory.length, data: asset.versionHistory });
});

// --------------------------------------------------------------------------
// 2. Logo Monitoring & Candidate Matches Endpoints
// --------------------------------------------------------------------------

// GET /api/v1/logo-monitoring/overview
router.get('/logo-monitoring/overview', (req: Request, res: Response) => {
  const tenantId = (req.query.tenantId as string) || 'default_tenant';
  ensureTenantSeeded(tenantId);

  const assets = db.brandAssets[tenantId] || [];
  const matches = db.logoMatches[tenantId] || [];
  const cases = db.investigationCases[tenantId] || [];
  const takedowns = db.takedownRequests[tenantId] || [];

  const activeAssets = assets.filter(a => a.status === 'ACTIVE').length;
  const newMatches = matches.filter(m => m.status === 'DISCOVERED' || m.status === 'POTENTIAL_MATCH').length;
  const highRisk = matches.filter(m => m.riskAssessment?.riskLevel === 'HIGH' || m.riskAssessment?.riskLevel === 'CRITICAL').length;
  const confirmed = matches.filter(m => m.status === 'CONFIRMED_UNAUTHORIZED_USE' || m.status === 'CONFIRMED_PHISHING').length;

  // Similarity Distribution
  let b90 = 0, b75 = 0, b50 = 0, bLow = 0;
  let crit = 0, hg = 0, med = 0, lw = 0, inf = 0;

  matches.forEach(m => {
    const sim = m.similarityScore || 0;
    if (sim >= 90) b90++;
    else if (sim >= 75) b75++;
    else if (sim >= 50) b50++;
    else bLow++;

    switch (m.riskAssessment?.riskLevel) {
      case 'CRITICAL': crit++; break;
      case 'HIGH': hg++; break;
      case 'MEDIUM': med++; break;
      case 'LOW': lw++; break;
      default: inf++; break;
    }
  });

  const sourceCounts: Record<string, number> = {};
  matches.forEach(m => {
    sourceCounts[m.sourceType] = (sourceCounts[m.sourceType] || 0) + 1;
  });
  const sourceDistribution = Object.entries(sourceCounts).map(([type, count]) => ({
    sourceType: type,
    label: type.replace(/_/g, ' '),
    count
  }));

  const domainMap: Record<string, any> = {};
  matches.forEach(m => {
    if (!domainMap[m.targetDomain]) {
      domainMap[m.targetDomain] = { count: 0, highestRisk: m.riskAssessment?.riskLevel, status: m.status };
    }
    domainMap[m.targetDomain].count++;
  });

  const topImpersonatingDomains = Object.entries(domainMap).map(([dom, val]) => ({
    domain: dom,
    matchCount: val.count,
    highestRisk: val.highestRisk,
    status: val.status
  }));

  return res.json({
    success: true,
    data: {
      registeredBrandAssetsCount: assets.length,
      activeLogoAssetsCount: activeAssets,
      totalLogoMatchesCount: matches.length,
      newMatchesCount: newMatches,
      highRiskMatchesCount: highRisk,
      confirmedImpersonationsCount: confirmed,
      openInvestigationsCount: cases.filter(c => c.status !== 'CLOSED_RESOLVED').length,
      pendingTakedownsCount: takedowns.filter(t => t.status !== 'COMPLIANCE_ENFORCED').length,
      similarityDistribution: {
        bracket_90_100: b90,
        bracket_75_89: b75,
        bracket_50_74: b50,
        bracket_below_50: bLow
      },
      riskDistribution: {
        critical: crit,
        high: hg,
        medium: med,
        low: lw,
        informational: inf
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
    }
  });
});

// GET /api/v1/logo-monitoring/matches
router.get('/logo-monitoring/matches', (req: Request, res: Response) => {
  const tenantId = (req.query.tenantId as string) || 'default_tenant';
  ensureTenantSeeded(tenantId);

  let matches = [...(db.logoMatches[tenantId] || [])];

  const { status, riskLevel, sourceType, search, sort = 'createdAt', order = 'desc', page = '1', limit = '20' } = req.query;

  if (status) {
    matches = matches.filter(m => m.status === status);
  }
  if (riskLevel) {
    matches = matches.filter(m => m.riskAssessment?.riskLevel === riskLevel);
  }
  if (sourceType) {
    matches = matches.filter(m => m.sourceType === sourceType);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    matches = matches.filter(m =>
      m.targetDomain.toLowerCase().includes(q) ||
      m.brandAssetName.toLowerCase().includes(q) ||
      m.matchCode.toLowerCase().includes(q) ||
      m.sourceUrl.toLowerCase().includes(q)
    );
  }

  // Sort
  matches.sort((a, b) => {
    let valA = a[sort as string] || a.createdAt;
    let valB = b[sort as string] || b.createdAt;
    if (sort === 'riskScore') {
      valA = a.riskAssessment?.riskScore || 0;
      valB = b.riskAssessment?.riskScore || 0;
    } else if (sort === 'similarityScore') {
      valA = a.similarityScore || 0;
      valB = b.similarityScore || 0;
    }
    return order === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
  });

  const p = parseInt(page as string) || 1;
  const lim = parseInt(limit as string) || 20;
  const total = matches.length;
  const paginated = matches.slice((p - 1) * lim, p * lim);

  return res.json({
    success: true,
    total,
    page: p,
    limit: lim,
    totalPages: Math.ceil(total / lim),
    data: paginated
  });
});

// GET /api/v1/logo-monitoring/matches/:id
router.get('/logo-monitoring/matches/:id', (req: Request, res: Response) => {
  const tenantId = (req.query.tenantId as string) || 'default_tenant';
  ensureTenantSeeded(tenantId);
  const match = (db.logoMatches[tenantId] || []).find(m => m.id === req.params.id);
  if (!match) {
    return res.status(404).json({ success: false, error: 'Logo match not found.' });
  }
  return res.json({ success: true, data: match });
});

// POST /api/v1/logo-monitoring/matches/:id/analyze (Triggers re-analysis)
router.post('/logo-monitoring/matches/:id/analyze', (req: Request, res: Response) => {
  const tenantId = req.body.tenantId || (req.query.tenantId as string) || 'default_tenant';
  ensureTenantSeeded(tenantId);
  const matches = db.logoMatches[tenantId] || [];
  const match = matches.find(m => m.id === req.params.id);
  if (!match) {
    return res.status(404).json({ success: false, error: 'Logo match not found.' });
  }

  const { provider = 'OPENCLIP_VIT_EMBEDDING' } = req.body;
  const now = new Date().toISOString();

  // Re-run pipeline analysis simulation
  match.aiVisionProvider = provider;
  match.aiAnalysisState = 'COMPLETED';
  match.similarityScore = Math.min(100, Math.max(70, match.similarityScore + (Math.random() > 0.5 ? 1 : -1)));
  match.aiConfidence = 97;
  match.updatedAt = now;

  match.history = [
    {
      id: `hist_reanal_${Date.now()}`,
      fromStatus: match.status,
      toStatus: match.status,
      actor: req.body.actor || 'Security Analyst',
      actorRole: 'Security Reviewer',
      timestamp: now,
      reason: `Manual re-analysis executed using provider ${provider}. Calibrated similarity: ${match.similarityScore}%.`
    },
    ...match.history
  ];

  persistDb();
  return res.json({ success: true, data: match });
});

// POST /api/v1/logo-monitoring/matches/:id/assign
router.post('/logo-monitoring/matches/:id/assign', (req: Request, res: Response) => {
  const tenantId = req.body.tenantId || (req.query.tenantId as string) || 'default_tenant';
  ensureTenantSeeded(tenantId);
  const matches = db.logoMatches[tenantId] || [];
  const match = matches.find(m => m.id === req.params.id);
  if (!match) {
    return res.status(404).json({ success: false, error: 'Logo match not found.' });
  }

  const { analystName } = req.body;
  if (!analystName) {
    return res.status(400).json({ success: false, error: 'analystName is required.' });
  }

  match.assignedAnalyst = analystName;
  match.updatedAt = new Date().toISOString();
  persistDb();

  return res.json({ success: true, data: match });
});

// POST /api/v1/logo-monitoring/matches/:id/status (Lifecycle State Machine)
router.post('/logo-monitoring/matches/:id/status', (req: Request, res: Response) => {
  const tenantId = req.body.tenantId || (req.query.tenantId as string) || 'default_tenant';
  ensureTenantSeeded(tenantId);
  const matches = db.logoMatches[tenantId] || [];
  const match = matches.find(m => m.id === req.params.id);
  if (!match) {
    return res.status(404).json({ success: false, error: 'Logo match not found.' });
  }

  const { targetStatus, actor, actorRole, reason, comments } = req.body;
  if (!targetStatus || !reason || reason.trim().length < 5) {
    return res.status(400).json({
      success: false,
      error: 'targetStatus and a detailed operational reason (at least 5 characters) are required.'
    });
  }

  const now = new Date().toISOString();
  const event = {
    id: `evt_lgo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    fromStatus: match.status,
    toStatus: targetStatus,
    actor: actor || 'Enterprise Analyst',
    actorRole: actorRole || 'SOC Operator',
    timestamp: now,
    reason: reason.trim(),
    comments: comments?.trim()
  };

  match.status = targetStatus;
  match.updatedAt = now;
  match.history = [event, ...match.history];

  persistDb();
  return res.json({ success: true, data: match, event });
});

// POST /api/v1/logo-monitoring/matches/:id/evidence
router.post('/logo-monitoring/matches/:id/evidence', (req: Request, res: Response) => {
  const tenantId = req.body.tenantId || (req.query.tenantId as string) || 'default_tenant';
  ensureTenantSeeded(tenantId);
  const matches = db.logoMatches[tenantId] || [];
  const match = matches.find(m => m.id === req.params.id);
  if (!match) {
    return res.status(404).json({ success: false, error: 'Logo match not found.' });
  }

  const { evidenceType, evidenceValue, source, notes } = req.body;
  if (!evidenceType || !evidenceValue) {
    return res.status(400).json({ success: false, error: 'evidenceType and evidenceValue are required.' });
  }

  const sha256 = crypto.createHash('sha256').update(`${evidenceType}:${evidenceValue}:${Date.now()}`).digest('hex');
  const newEvidence = {
    id: `evi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    logoMatchId: match.id,
    evidenceType,
    evidenceValue,
    confidence: 99,
    source: source || 'Security Analyst Manual Upload',
    collectedAt: new Date().toISOString(),
    sha256Hash: sha256,
    immutableReference: `s3://skanda-evidence-vault/tenant-${tenantId}/${match.matchCode}/${sha256.substring(0, 8)}`
  };

  match.evidenceList = [newEvidence, ...(match.evidenceList || [])];
  match.updatedAt = new Date().toISOString();
  persistDb();

  return res.status(201).json({ success: true, data: newEvidence });
});

// POST /api/v1/logo-monitoring/matches/:id/create-case
router.post('/logo-monitoring/matches/:id/create-case', (req: Request, res: Response) => {
  const tenantId = req.body.tenantId || (req.query.tenantId as string) || 'default_tenant';
  ensureTenantSeeded(tenantId);
  const matches = db.logoMatches[tenantId] || [];
  const match = matches.find(m => m.id === req.params.id);
  if (!match) {
    return res.status(404).json({ success: false, error: 'Logo match not found.' });
  }

  const { title, priority = 'HIGH', assignedTo, summary } = req.body;
  const caseId = `case_lgo_${Date.now()}`;
  const caseNumber = `CASE-LGO-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  const newCase = {
    id: caseId,
    tenantId,
    caseNumber,
    logoMatchId: match.id,
    title: title || `Logo Impersonation Incident on ${match.targetDomain}`,
    priority,
    status: 'UNDER_REVIEW',
    assignedTo: assignedTo || match.assignedAnalyst || 'Incident Lead',
    summary: summary || `Automated incident escalation for logo match ${match.matchCode} targeting domain ${match.targetDomain}.`,
    associatedDomain: match.targetDomain,
    createdAt: now,
    updatedAt: now
  };

  match.linkedInvestigationCaseId = caseNumber;
  match.status = 'UNDER_INVESTIGATION';
  match.updatedAt = now;

  db.investigationCases[tenantId] = [newCase, ...(db.investigationCases[tenantId] || [])];
  persistDb();

  return res.status(201).json({ success: true, data: newCase });
});

// --------------------------------------------------------------------------
// 3. Monitoring Jobs & Discovery Workers
// --------------------------------------------------------------------------

// GET /api/v1/logo-monitoring/jobs
router.get('/logo-monitoring/jobs', (req: Request, res: Response) => {
  const tenantId = (req.query.tenantId as string) || 'default_tenant';
  ensureTenantSeeded(tenantId);
  const jobs = db.monitoringJobs[tenantId] || [];
  return res.json({ success: true, count: jobs.length, data: jobs });
});

// POST /api/v1/logo-monitoring/jobs
router.post('/logo-monitoring/jobs', (req: Request, res: Response) => {
  const tenantId = req.body.tenantId || (req.query.tenantId as string) || 'default_tenant';
  ensureTenantSeeded(tenantId);

  const { sourceId, sourceName } = req.body;
  const jobId = `job_lgo_${Date.now()}`;
  const now = new Date().toISOString();

  const newJob = {
    id: jobId,
    tenantId,
    sourceId: sourceId || 'src_ct_stream',
    sourceName: sourceName || 'Ad-Hoc Candidate Ingestion Worker',
    status: 'RUNNING',
    startedAt: now,
    candidatesDiscovered: 0,
    logosAnalyzed: 0,
    matchesIdentified: 0
  };

  db.monitoringJobs[tenantId] = [newJob, ...(db.monitoringJobs[tenantId] || [])];
  persistDb();

  return res.status(201).json({ success: true, data: newJob });
});

// POST /api/v1/logo-monitoring/jobs/:id/run
router.post('/logo-monitoring/jobs/:id/run', (req: Request, res: Response) => {
  const tenantId = req.body.tenantId || (req.query.tenantId as string) || 'default_tenant';
  ensureTenantSeeded(tenantId);
  const jobs = db.monitoringJobs[tenantId] || [];
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ success: false, error: 'Job not found.' });
  }

  job.status = 'COMPLETED';
  job.completedAt = new Date().toISOString();
  job.candidatesDiscovered = Math.floor(20 + Math.random() * 40);
  job.logosAnalyzed = Math.floor(10 + Math.random() * 15);
  job.matchesIdentified = Math.floor(1 + Math.random() * 4);
  job.processingDurationMs = 45000;

  persistDb();
  return res.json({ success: true, data: job });
});

// --------------------------------------------------------------------------
// 4. Investigation Cases
// --------------------------------------------------------------------------

// GET /api/v1/investigation-cases
router.get('/investigation-cases', (req: Request, res: Response) => {
  const tenantId = (req.query.tenantId as string) || 'default_tenant';
  ensureTenantSeeded(tenantId);
  const cases = db.investigationCases[tenantId] || [];
  return res.json({ success: true, count: cases.length, data: cases });
});

// POST /api/v1/investigation-cases
router.post('/investigation-cases', (req: Request, res: Response) => {
  const tenantId = req.body.tenantId || (req.query.tenantId as string) || 'default_tenant';
  ensureTenantSeeded(tenantId);

  const { title, priority = 'HIGH', assignedTo, summary, associatedDomain, logoMatchId } = req.body;
  const now = new Date().toISOString();
  const newCase = {
    id: `case_${Date.now()}`,
    tenantId,
    caseNumber: `CASE-LGO-${Math.floor(1000 + Math.random() * 9000)}`,
    logoMatchId: logoMatchId || '',
    title: title || 'New Impersonation Investigation',
    priority,
    status: 'UNDER_REVIEW',
    assignedTo: assignedTo || 'SOC Incident Response Team',
    summary: summary || '',
    associatedDomain: associatedDomain || '',
    createdAt: now,
    updatedAt: now
  };

  db.investigationCases[tenantId] = [newCase, ...(db.investigationCases[tenantId] || [])];
  persistDb();

  return res.status(201).json({ success: true, data: newCase });
});

// PATCH /api/v1/investigation-cases/:id
router.patch('/investigation-cases/:id', (req: Request, res: Response) => {
  const tenantId = req.body.tenantId || (req.query.tenantId as string) || 'default_tenant';
  ensureTenantSeeded(tenantId);
  const cases = db.investigationCases[tenantId] || [];
  const item = cases.find(c => c.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, error: 'Case not found.' });
  }

  Object.assign(item, req.body, { id: item.id, tenantId: item.tenantId, updatedAt: new Date().toISOString() });
  persistDb();
  return res.json({ success: true, data: item });
});

// --------------------------------------------------------------------------
// 5. Takedown Requests
// --------------------------------------------------------------------------

// GET /api/v1/takedown-requests
router.get('/takedown-requests', (req: Request, res: Response) => {
  const tenantId = (req.query.tenantId as string) || 'default_tenant';
  ensureTenantSeeded(tenantId);
  const takedowns = db.takedownRequests[tenantId] || [];
  return res.json({ success: true, count: takedowns.length, data: takedowns });
});

// POST /api/v1/takedown-requests
router.post('/takedown-requests', (req: Request, res: Response) => {
  const tenantId = req.body.tenantId || (req.query.tenantId as string) || 'default_tenant';
  ensureTenantSeeded(tenantId);

  const { logoMatchId, targetDomain, providerType, providerName, notes } = req.body;
  if (!targetDomain) {
    return res.status(400).json({ success: false, error: 'targetDomain is required.' });
  }

  const now = new Date().toISOString();
  const takedownNumber = `TKD-2026-${Math.floor(100 + Math.random() * 900)}`;
  const evidencePackageSha256 = crypto.createHash('sha256').update(`${targetDomain}:${now}`).digest('hex');

  const newTakedown = {
    id: `tkd_${Date.now()}`,
    tenantId,
    takedownNumber,
    logoMatchId: logoMatchId || '',
    targetDomain,
    providerType: providerType || 'REGISTRAR',
    providerName: providerName || 'Upstream Host / Registrar Abuse Desk',
    status: 'SUBMITTED',
    externalTicketId: `ABUSE-TKT-${Math.floor(10000 + Math.random() * 90000)}`,
    submittedAt: now,
    evidencePackageSha256,
    notes: notes || 'Automated RFC 2142 Abuse Dispatch with cryptographically signed DMCA evidence.',
    createdAt: now,
    updatedAt: now
  };

  // If linked to a logo match, update its status to TAKEDOWN_REQUESTED
  if (logoMatchId) {
    const matches = db.logoMatches[tenantId] || [];
    const match = matches.find(m => m.id === logoMatchId);
    if (match) {
      match.linkedTakedownRequestId = takedownNumber;
      match.status = 'TAKEDOWN_REQUESTED';
      match.updatedAt = now;
      match.history = [
        {
          id: `hist_tkd_${Date.now()}`,
          fromStatus: 'CONFIRMED_UNAUTHORIZED_USE',
          toStatus: 'TAKEDOWN_REQUESTED',
          actor: 'Legal & Enforcement Lead',
          actorRole: 'Compliance Operator',
          timestamp: now,
          reason: `Dispatched takedown request ${takedownNumber} to ${providerName || 'Registrar'}.`
        },
        ...match.history
      ];
    }
  }

  db.takedownRequests[tenantId] = [newTakedown, ...(db.takedownRequests[tenantId] || [])];
  persistDb();

  return res.status(201).json({ success: true, data: newTakedown });
});

// PATCH /api/v1/takedown-requests/:id
router.patch('/takedown-requests/:id', (req: Request, res: Response) => {
  const tenantId = req.body.tenantId || (req.query.tenantId as string) || 'default_tenant';
  ensureTenantSeeded(tenantId);
  const takedowns = db.takedownRequests[tenantId] || [];
  const item = takedowns.find(t => t.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, error: 'Takedown request not found.' });
  }

  Object.assign(item, req.body, { id: item.id, tenantId: item.tenantId, updatedAt: new Date().toISOString() });
  persistDb();
  return res.json({ success: true, data: item });
});

// POST /api/v1/brandguard/clear-state
router.post('/brandguard/clear-state', (req: Request, res: Response) => {
  const tenantId = req.body.tenantId || (req.query.tenantId as string) || 'default_tenant';
  delete db.brandAssets[tenantId];
  delete db.logoMatches[tenantId];
  delete db.monitoringJobs[tenantId];
  delete db.investigationCases[tenantId];
  delete db.takedownRequests[tenantId];
  persistDb();
  return res.json({ success: true, message: `Brand state cleared for tenant ${tenantId}` });
});

export default router;
