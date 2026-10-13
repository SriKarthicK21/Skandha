// Skanda BrandGuard — Certificate Transparency (CT) Log Discovery Service
// Simulates real-time ingestion from public CT log streams (Google Argon/Oak, Cloudflare Nimbus, Sectigo Mammoth)
// Detects newly issued SSL/TLS certificates containing brand tokens, homoglyphs, and phishing vectors
// hours or days before attacker infrastructure goes live.

import { BrandFinding, BrandProfile } from '../../types/brandguard';
import { BrandGuardStorageService } from './brandguardStorageService';

export interface CTLogEntry {
  id: string;
  logIndex: number;
  timestamp: string;
  logOperator: 'Google Argon 2026' | 'Cloudflare Nimbus 2026' | 'Sectigo Mammoth' | 'DigiCert Yeti' | 'Let\'s Encrypt Oak';
  issuerCA: string;
  subjectCN: string;
  subjectSANs: string[];
  serialNumber: string;
  signatureAlgorithm: 'SHA256withRSA' | 'ECDSA / SHA384' | 'Ed25519';
  validFrom: string;
  validTo: string;
  isPreCertificate: boolean;
  isSuspicious: boolean;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  threatTags: string[];
  matchedBrandKeyword: string;
  resolvedIP?: string;
  ingestedAsFindingId?: string;
}

const INITIAL_CT_LOGS: CTLogEntry[] = [
  {
    id: 'ct-log-904128',
    logIndex: 904128104,
    timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
    logOperator: 'Google Argon 2026',
    issuerCA: 'Let\'s Encrypt Authority E1',
    subjectCN: 'login.apexfintech-verify.com',
    subjectSANs: ['login.apexfintech-verify.com', 'auth.apexfintech-verify.com', 'apexfintech-verify.com'],
    serialNumber: '03:ea:48:91:72:bb:49:10:9c',
    signatureAlgorithm: 'ECDSA / SHA384',
    validFrom: new Date(Date.now() - 10 * 60000).toISOString(),
    validTo: new Date(Date.now() + 90 * 86400000).toISOString(),
    isPreCertificate: true,
    isSuspicious: true,
    riskLevel: 'CRITICAL',
    threatTags: ['Pre-Certificate', 'Credential Harvester Keyword', 'Free Let\'s Encrypt CA', 'Offshore IP ASN'],
    matchedBrandKeyword: 'apexfintech',
    resolvedIP: '185.220.101.45',
    ingestedAsFindingId: 'BF-2026-001'
  },
  {
    id: 'ct-log-904129',
    logIndex: 904129481,
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
    logOperator: 'Cloudflare Nimbus 2026',
    issuerCA: 'ZeroSSL RSA Domain Secure Site CA',
    subjectCN: 'apex-capitalinvest.vip',
    subjectSANs: ['apex-capitalinvest.vip', 'www.apex-capitalinvest.vip', 'members.apex-capitalinvest.vip'],
    serialNumber: '7a:12:4c:89:33:ef:01:99:ab',
    signatureAlgorithm: 'SHA256withRSA',
    validFrom: new Date(Date.now() - 25 * 60000).toISOString(),
    validTo: new Date(Date.now() + 90 * 86400000).toISOString(),
    isPreCertificate: false,
    isSuspicious: true,
    riskLevel: 'CRITICAL',
    threatTags: ['High-Yield Investment Keyword', 'Suspicious TLD (.vip)', 'Fast-Flux DNS detected'],
    matchedBrandKeyword: 'apex',
    resolvedIP: '194.26.29.112'
  },
  {
    id: 'ct-log-904130',
    logIndex: 904130552,
    timestamp: new Date(Date.now() - 28 * 60000).toISOString(),
    logOperator: 'Sectigo Mammoth',
    issuerCA: 'Cloudflare Inc ECC CA-3',
    subjectCN: 'xn--apexfntech-x8a.com',
    subjectSANs: ['xn--apexfntech-x8a.com', 'www.xn--apexfntech-x8a.com'],
    serialNumber: '11:8b:2d:4e:90:ac:fe:22:30',
    signatureAlgorithm: 'ECDSA / SHA384',
    validFrom: new Date(Date.now() - 45 * 60000).toISOString(),
    validTo: new Date(Date.now() + 365 * 86400000).toISOString(),
    isPreCertificate: true,
    isSuspicious: true,
    riskLevel: 'HIGH',
    threatTags: ['Punycode IDN', 'Cyrillic Homoglyph (і)', 'Cloudflare Proxy Masking'],
    matchedBrandKeyword: 'apexfintech',
    resolvedIP: '104.21.48.91'
  },
  {
    id: 'ct-log-904131',
    logIndex: 904131804,
    timestamp: new Date(Date.now() - 55 * 60000).toISOString(),
    logOperator: 'Google Argon 2026',
    issuerCA: 'Google Trust Services GTS CA 1C3',
    subjectCN: 'careers-apexfintech.com',
    subjectSANs: ['careers-apexfintech.com', 'apply.careers-apexfintech.com'],
    serialNumber: '29:43:08:ff:11:ea:05:78:12',
    signatureAlgorithm: 'ECDSA / SHA384',
    validFrom: new Date(Date.now() - 80 * 60000).toISOString(),
    validTo: new Date(Date.now() + 90 * 86400000).toISOString(),
    isPreCertificate: false,
    isSuspicious: true,
    riskLevel: 'HIGH',
    threatTags: ['Fake Recruitment Vector', 'Combosquatting (careers-)', 'Recent Registrar Creation'],
    matchedBrandKeyword: 'apexfintech',
    resolvedIP: '45.142.214.9'
  },
  {
    id: 'ct-log-904132',
    logIndex: 904132119,
    timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
    logOperator: 'DigiCert Yeti',
    issuerCA: 'DigiCert Global Root G2',
    subjectCN: 'api.apexfintech-partner-gateway.net',
    subjectSANs: ['api.apexfintech-partner-gateway.net', 'portal.apexfintech-partner-gateway.net'],
    serialNumber: '08:92:ef:31:bb:cd:44:81:aa',
    signatureAlgorithm: 'SHA256withRSA',
    validFrom: new Date(Date.now() - 120 * 60000).toISOString(),
    validTo: new Date(Date.now() + 365 * 86400000).toISOString(),
    isPreCertificate: true,
    isSuspicious: true,
    riskLevel: 'MEDIUM',
    threatTags: ['B2B Partner Impersonation', 'Subdomain Clustering'],
    matchedBrandKeyword: 'apexfintech',
    resolvedIP: '198.51.100.42'
  },
  {
    id: 'ct-log-904133',
    logIndex: 904133490,
    timestamp: new Date(Date.now() - 140 * 60000).toISOString(),
    logOperator: 'Let\'s Encrypt Oak',
    issuerCA: 'Let\'s Encrypt Authority R3',
    subjectCN: 'support-apexfintech-desk.online',
    subjectSANs: ['support-apexfintech-desk.online', 'help.support-apexfintech-desk.online'],
    serialNumber: '44:91:0a:77:bc:30:19:fe:dc',
    signatureAlgorithm: 'SHA256withRSA',
    validFrom: new Date(Date.now() - 180 * 60000).toISOString(),
    validTo: new Date(Date.now() + 90 * 86400000).toISOString(),
    isPreCertificate: false,
    isSuspicious: true,
    riskLevel: 'HIGH',
    threatTags: ['Tech Support Scam Vector', 'Combosquatting', 'Free SSL CA'],
    matchedBrandKeyword: 'apexfintech',
    resolvedIP: '103.208.220.14'
  }
];

export class BrandGuardCTService {
  private static storageKey = 'skanda_brandguard_ct_logs';

  public static getCTLogs(): CTLogEntry[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    this.saveCTLogs(INITIAL_CT_LOGS);
    return INITIAL_CT_LOGS;
  }

  public static saveCTLogs(logs: CTLogEntry[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(logs));
    } catch {
      // storage error
    }
  }

  /**
   * Generates a newly simulated real-time certificate issuance event
   */
  public static generateSimulatedCTEvent(brandProfile: BrandProfile): CTLogEntry {
    const brandNameClean = (brandProfile.shortName || 'apex').toLowerCase().replace(/[^a-z0-9]/g, '');
    const operators: CTLogEntry['logOperator'][] = [
      'Google Argon 2026',
      'Cloudflare Nimbus 2026',
      'Sectigo Mammoth',
      'Let\'s Encrypt Oak',
      'DigiCert Yeti'
    ];
    const issuers = [
      'Let\'s Encrypt Authority E1',
      'ZeroSSL RSA Domain Secure Site CA',
      'Cloudflare Inc ECC CA-3',
      'Google Trust Services GTS CA 1C3'
    ];
    const prefixes = ['secure-', 'auth.', 'login.', 'portal-', 'vault-', 'client-', 'verify-'];
    const suffixes = ['-portal.com', '-online.net', '-secure.vip', '-login.org', '-app.xyz'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

    const domain = `${prefix}${brandNameClean}${suffix}`;
    const logIndex = Math.floor(904130000 + Math.random() * 100000);
    const hex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    const serial = `${hex()}:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}`;

    const riskLevels: CTLogEntry['riskLevel'][] = ['CRITICAL', 'HIGH', 'MEDIUM'];
    const selectedRisk = riskLevels[Math.floor(Math.random() * riskLevels.length)];

    const newLog: CTLogEntry = {
      id: `ct-log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      logIndex,
      timestamp: new Date().toISOString(),
      logOperator: operators[Math.floor(Math.random() * operators.length)],
      issuerCA: issuers[Math.floor(Math.random() * issuers.length)],
      subjectCN: domain,
      subjectSANs: [domain, `www.${domain}`, `api.${domain}`],
      serialNumber: serial,
      signatureAlgorithm: Math.random() > 0.4 ? 'ECDSA / SHA384' : 'SHA256withRSA',
      validFrom: new Date().toISOString(),
      validTo: new Date(Date.now() + 90 * 86400000).toISOString(),
      isPreCertificate: Math.random() > 0.3,
      isSuspicious: true,
      riskLevel: selectedRisk,
      threatTags: [
        'Real-Time CT Alert',
        'Brand Keyword Detected',
        prefix.includes('login') || prefix.includes('auth') ? 'Credential Harvester Risk' : 'Impersonation Suspect',
        'Zero-Day Domain Issuance'
      ],
      matchedBrandKeyword: brandNameClean,
      resolvedIP: `185.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`
    };

    const currentLogs = this.getCTLogs();
    const updated = [newLog, ...currentLogs].slice(0, 50); // keep 50
    this.saveCTLogs(updated);
    return newLog;
  }

  /**
   * Promotes a suspicious CT Log entry directly into an active BrandFinding
   */
  public static ingestCTEntryAsFinding(ctEntry: CTLogEntry, brandProfile: BrandProfile): BrandFinding {
    const findingCode = `BF-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`;
    const shaHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newFinding: BrandFinding = {
      id: `fnd_ct_${Date.now()}`,
      tenantId: brandProfile.tenantId || 'default_tenant',
      findingCode,
      title: `Pre-Certificate Issued: Suspect Infrastructure on ${ctEntry.subjectCN}`,
      findingType: ctEntry.subjectCN.includes('login') || ctEntry.subjectCN.includes('auth')
        ? 'PHISHING_BRAND_IMPERSONATION'
        : 'DOMAIN_IMPERSONATION',
      severity: ctEntry.riskLevel,
      status: 'NEW',
      firstSeen: ctEntry.timestamp,
      lastSeen: ctEntry.timestamp,
      targetUrl: `https://${ctEntry.subjectCN}/`,
      targetDomain: ctEntry.subjectCN,
      owner: 'Automated CT Ingestion Pipeline',
      logoSimilarityScore: 82,
      brandNameSimilarityScore: 94,
      domainSimilarityScore: 88,
      websiteVisualSimilarityScore: 78,
      overallConfidence: ctEntry.riskLevel === 'CRITICAL' ? 95 : 86,
      domainIntel: {
        domain: ctEntry.subjectCN,
        firstSeenDate: ctEntry.timestamp,
        registrationDate: new Date(Date.now() - 3600000).toISOString(),
        registrar: 'NameCheap, Inc. / Withheld for Privacy',
        nameservers: ['ns1.offshoredns.pro', 'ns2.offshoredns.pro'],
        resolvedIPs: [ctEntry.resolvedIP || '185.220.101.45'],
        asn: 'AS44050 (Offshore Dedicated Host)',
        asnOrg: 'CyberBunker Hosting Ltd',
        hostingProvider: 'Offshore Bulletproof Cloud',
        countryCode: 'SC',
        tlsCertificate: {
          issuer: ctEntry.issuerCA,
          validFrom: ctEntry.validFrom,
          validTo: ctEntry.validTo,
          isSelfSigned: false,
          sans: ctEntry.subjectSANs
        },
        emailSecurity: {
          hasMx: true,
          hasSpf: false,
          hasDmarc: false
        },
        domainSquattingTechnique: 'COMBOSQUATTING'
      },
      webPageAnalysis: {
        url: `https://${ctEntry.subjectCN}/`,
        domain: ctEntry.subjectCN,
        pageTitle: `${brandProfile.organizationName} - Secure Customer Sign-in`,
        metaDescription: `Official sign-in portal for ${brandProfile.organizationName} accounts.`,
        visibleTextExcerpt: 'Enter your credentials to access your verified account dashboard.',
        ocrExtractedText: `${brandProfile.organizationName.toUpperCase()} ONLINE PORTAL - LOGIN REQUIRED`,
        ocrConfidence: 91,
        screenshotUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=60',
        faviconHash: '73928104',
        detectedForms: {
          hasLoginForm: true,
          hasPaymentForm: false,
          hasPasswordInput: true,
          isCredentialHarvesterSuspect: true
        },
        detectedContactInfo: {
          emails: [`support@${ctEntry.subjectCN}`],
          phoneNumbers: [],
          telegramLinks: ['https://t.me/apex_helpdesk_support'],
          whatsappLinks: []
        },
        detectedTechnologies: ['Nginx 1.24', 'PHP 8.2', 'Let\'s Encrypt TLS'],
        httpMetadata: {
          statusCode: 200,
          redirectChain: [],
          contentLength: 4210
        },
        sandboxSecurityFlags: {
          ssrfBlocked: true,
          privateIpBlocked: true,
          dnsRebindingProtected: true,
          isolatedExecutionClean: true
        }
      },
      riskScore: {
        totalScore: ctEntry.riskLevel === 'CRITICAL' ? 94 : 84,
        severity: ctEntry.riskLevel,
        scoreBreakdown: {
          logoSimilarityPoints: 22,
          brandNameSimilarityPoints: 15,
          domainSimilarityPoints: 14,
          executiveAssociationPoints: 5,
          websiteVisualSimilarityPoints: 9,
          phishingLoginIndicatorsPoints: 15,
          infrastructureRiskPoints: 5,
          reputationContextPoints: 4
        },
        contributingFactors: [
          {
            factorName: 'Pre-Certificate Transparency Alert',
            pointsAwarded: 25,
            description: `Identified SSL certificate issued by ${ctEntry.issuerCA} via ${ctEntry.logOperator} before public launch.`
          },
          {
            factorName: 'Brand Token Mimicry',
            pointsAwarded: 15,
            description: `Domain contains explicit protected corporate brand string "${ctEntry.matchedBrandKeyword}".`
          },
          {
            factorName: 'Credential Harvester Form Structure',
            pointsAwarded: 15,
            description: 'Contains active login form asking for user credentials on unapproved domain.'
          },
          {
            factorName: 'Bulletproof / Offshore Hosting',
            pointsAwarded: 10,
            description: 'Resolved to autonomous system with high concentration of malicious domains.'
          }
        ]
      },
      evidence: {
        evidenceId: `EVD-CT-${findingCode}`,
        sha256Hash: shaHash,
        timestamp: ctEntry.timestamp,
        discoveredUrl: `https://${ctEntry.subjectCN}/`,
        domain: ctEntry.subjectCN,
        discoveryProvider: `Certificate Transparency (${ctEntry.logOperator})`,
        htmlSnapshotLength: 14209,
        screenshotArtifactUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=60',
        ocrTextExcerpt: `${brandProfile.organizationName} Login Form`,
        cryptographicSignature: `SKANDA-SEAL-${shaHash.slice(0, 16).toUpperCase()}`,
        firstSeen: ctEntry.timestamp,
        lastSeen: ctEntry.timestamp
      },
      isWhitelisted: false,
      decisionHistory: [
        {
          id: `dec_${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'NEW',
          actorName: 'CT Stream Ingestion Worker',
          actorRole: 'Automated Threat Intelligence',
          reason: `Auto-promoted from Certificate Transparency Log ${ctEntry.logIndex} (${ctEntry.logOperator}) based on high-confidence brand impersonation.`
        }
      ]
    };

    // Store in findings repository
    BrandGuardStorageService.addFinding(brandProfile.tenantId || 'default_tenant', newFinding);

    // Mark CT entry as ingested
    const logs = this.getCTLogs();
    const updatedLogs = logs.map(l => l.id === ctEntry.id ? { ...l, ingestedAsFindingId: findingCode } : l);
    this.saveCTLogs(updatedLogs);

    return newFinding;
  }
}
