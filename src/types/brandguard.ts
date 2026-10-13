// Skanda BrandGuard — Digital Brand Protection & Surface Web Monitoring Types
// Enterprise-grade multi-tenant domain models for Brand Protection, Executive Monitoring,
// Visual Logo Misuse Detection, Domain Squatting, and Abuse Mitigation.

export type BrandFindingType =
  | 'BRAND_NAME_MISUSE'
  | 'LOGO_MISUSE'
  | 'DOMAIN_IMPERSONATION'
  | 'TYPOSQUATTING'
  | 'HOMOGLYPH_DOMAIN'
  | 'WEBSITE_IMPERSONATION'
  | 'PHISHING_BRAND_IMPERSONATION'
  | 'EXECUTIVE_IMPERSONATION'
  | 'FAKE_RECRUITMENT'
  | 'FAKE_INVESTMENT'
  | 'FAKE_SUPPORT'
  | 'FAKE_PARTNERSHIP'
  | 'COUNTERFEIT_INDICATOR'
  | 'UNAUTHORIZED_PRODUCT_USAGE'
  | 'UNAUTHORIZED_IMAGE_USAGE'
  | 'SUSPICIOUS_BRAND_REFERENCE';

export type BrandFindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export type BrandFindingStatus =
  | 'NEW'
  | 'UNDER_INVESTIGATION'
  | 'CONFIRMED_ABUSE'
  | 'FALSE_POSITIVE'
  | 'LEGITIMATE_USE'
  | 'SUPPRESSED'
  | 'IGNORED'
  | 'MITIGATION_IN_PROGRESS'
  | 'RESOLVED_TAKEDOWN';

export interface IgnoredDomainRecord {
  domain: string;
  findingId?: string;
  reason: string;
  ignoredAt: string;
  ignoredBy: string;
  tenantId: string;
}

export type CommercialTier = 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';

export interface BrandProfile {
  id: string;
  tenantId: string;
  organizationName: string;
  legalEntityName: string;
  shortName: string;
  abbreviations: string[];
  formerNames: string[];
  brandNames: string[];
  productNames: string[];
  serviceNames: string[];
  trademarks: Array<{
    name: string;
    registrationNumber: string;
    jurisdiction: string;
    classCodes: string[];
  }>;
  slogans: string[];
  knownAliases: string[];
  commonMisspellings: string[];
  regionalSpellings: string[];
  transliterationVariants: string[];
  homoglyphVariants: string[];
  officialDomains: string[];
  primaryDomain?: string;
  officialSubdomains: string[];
  officialWebsites: string[];
  officialEmailDomains: string[];
  officialSocialProfiles: Array<{
    platform: 'LinkedIn' | 'Twitter' | 'GitHub' | 'YouTube' | 'Facebook' | 'Instagram' | 'Other';
    handle: string;
    url: string;
    verified: boolean;
  }>;
  officialAppIdentifiers: string[];
  officialSupportDomains: string[];
  updatedAt: string;
}

export interface BrandAsset {
  id: string;
  tenantId: string;
  name: string;
  assetType: 'PRIMARY_LOGO' | 'SECONDARY_LOGO' | 'MONOCHROME_LOGO' | 'PRODUCT_LOGO' | 'APP_ICON' | 'FAVICON' | 'BRAND_SYMBOL' | 'CAMPAIGN_GRAPHIC' | 'CORPORATE_IMAGE';
  imageUrl: string;
  fileFormat: string;
  dimensions: { width: number; height: number };
  aspectRatio: number;
  perceptualHash: string; // dHash or pHash hexadecimal string
  colorHistogram: string[]; // dominant hex colors
  embeddingVectorPreview?: number[]; // simulated or 64-dim float vector
  isPrimary: boolean;
  registeredAt: string;
}

export interface ExecutiveProfile {
  id: string;
  tenantId: string;
  fullName: string;
  nameVariants: string[];
  initials: string;
  professionalTitle: string; // CEO, CTO, Founder, CISO, etc.
  department: string;
  associatedOrganization: string;
  publicProfileUrl: string;
  approvedPhotoUrl: string;
  publicBiographyExcerpt: string;
  officialEmail: string;
  officialSocialHandles: {
    linkedIn?: string;
    twitter?: string;
  };
  monitoredKeywords: string[]; // e.g. ["investment", "crypto", "recruitment", "founder"]
  isActive: boolean;
  addedAt: string;
}

export type DiscoveryProviderType =
  | 'SEARCH_ENGINE'
  | 'WEB_CRAWLER'
  | 'IMAGE_SEARCH'
  | 'DNS_RDAP'
  | 'CERT_TRANSPARENCY'
  | 'THREAT_INTEL'
  | 'DOMAIN_INTEL';

export interface ISurfaceDiscoveryProviderConfig {
  id: string;
  providerType: DiscoveryProviderType;
  name: string;
  isEnabled: boolean;
  rateLimitPerMinute: number;
  timeoutMs: number;
  maxRetries: number;
  monthlyQuota: number;
  currentUsageThisMonth: number;
  healthStatus: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';
  lastHealthCheck: string;
  costPerQueryUSD: number;
  requiresApiKey: boolean;
  isSandboxed: boolean;
}

export interface MonitoringProfile {
  id: string;
  tenantId: string;
  name: string;
  isActive: boolean;
  frequency: 'HOURLY' | 'DAILY' | 'WEEKLY';
  scanScope: {
    includeExactBrand: boolean;
    includeExecutiveNames: boolean;
    includeTyposquatting: boolean;
    includeHomoglyphs: boolean;
    includeFraudKeywords: boolean;
    includeRecruitmentKeywords: boolean;
    includeSupportKeywords: boolean;
    includeLoginPortals: boolean;
    includeImageSearch: boolean;
  };
  customSearchQueries: string[];
  whitelistedDomains: string[];
  whitelistedIPs: string[];
  lastRunTimestamp?: string;
  nextScheduledRun?: string;
  totalFindingsGenerated: number;
}

export interface WebPageAnalysisResult {
  url: string;
  domain: string;
  pageTitle: string;
  metaDescription: string;
  visibleTextExcerpt: string;
  ocrExtractedText: string;
  ocrConfidence: number; // 0-100
  screenshotUrl: string;
  faviconHash?: string;
  detectedForms: {
    hasLoginForm: boolean;
    hasPaymentForm: boolean;
    hasPasswordInput: boolean;
    formActionUrl?: string;
    isCredentialHarvesterSuspect: boolean;
  };
  detectedContactInfo: {
    emails: string[];
    phoneNumbers: string[];
    telegramLinks: string[];
    whatsappLinks: string[];
  };
  detectedTechnologies: string[];
  httpMetadata: {
    statusCode: number;
    redirectChain: string[];
    serverHeader?: string;
    contentLength: number;
  };
  sandboxSecurityFlags: {
    ssrfBlocked: boolean;
    privateIpBlocked: boolean;
    dnsRebindingProtected: boolean;
    isolatedExecutionClean: boolean;
  };
}

export interface DomainIntelligenceRecord {
  domain: string;
  firstSeenDate: string;
  registrationDate: string;
  registrar: string;
  rdapWhoisServer?: string;
  nameservers: string[];
  resolvedIPs: string[];
  asn: string;
  asnOrg: string;
  hostingProvider: string;
  countryCode: string;
  tlsCertificate?: {
    issuer: string;
    validFrom: string;
    validTo: string;
    isSelfSigned: boolean;
    sans: string[];
  };
  emailSecurity: {
    hasMx: boolean;
    hasSpf: boolean;
    hasDmarc: boolean;
    mxDetails?: MxRecordDetail[];
    spfDetail?: SpfRecordDetail;
    dmarcDetail?: DmarcRecordDetail;
    spoofabilityAnalysis?: EmailSpoofabilityAnalysis;
  };
  domainSquattingTechnique?: 'TYPOSQUATTING' | 'COMBOSQUATTING' | 'HOMOGLYPH' | 'TLD_VARIATION' | 'SUBDOMAIN_ABUSE';
}

export interface MxRecordDetail {
  priority: number;
  host: string;
  ip?: string;
  banner?: string;
  canDispatchMail: boolean;
  status: 'ACTIVE_RESOLVING' | 'SUSPICIOUS_RELAY' | 'UNRESOLVED';
}

export interface SpfRecordDetail {
  raw: string;
  mechanism: string; // e.g. "~all", "+all", "?all", "-all"
  allowsSpoofing: boolean;
  isNeutralOrSoftFail: boolean;
  explanation: string;
}

export interface DmarcRecordDetail {
  raw: string;
  policy: 'none' | 'quarantine' | 'reject' | 'missing';
  percentage: number;
  rua?: string;
  isSpoofable: boolean;
  explanation: string;
}

export interface EmailSpoofabilityAnalysis {
  spoofabilityRating: 'CRITICAL_SPOOFABLE' | 'HIGH_EXPOSURE' | 'MODERATE' | 'RESTRICTED';
  activeMailServerConfirmed: boolean;
  mxRecords: MxRecordDetail[];
  spf: SpfRecordDetail;
  dmarc: DmarcRecordDetail;
  summaryReason: string;
  attackVectorScenarios: string[];
  recommendedAction: string;
}

export interface ExplainableRiskScore {
  totalScore: number; // 0 - 100
  severity: BrandFindingSeverity;
  scoreBreakdown: {
    logoSimilarityPoints: number;      // max 25%
    brandNameSimilarityPoints: number; // max 15%
    domainSimilarityPoints: number;    // max 15%
    executiveAssociationPoints: number;// max 10%
    websiteVisualSimilarityPoints: number; // max 10%
    phishingLoginIndicatorsPoints: number; // max 15%
    infrastructureRiskPoints: number;  // max 5%
    reputationContextPoints: number;   // max 5%
  };
  contributingFactors: Array<{
    factorName: string;
    pointsAwarded: number;
    description: string;
  }>;
}

export interface TamperEvidentBrandEvidence {
  evidenceId: string;
  sha256Hash: string;
  timestamp: string;
  discoveredUrl: string;
  domain: string;
  discoveryProvider: string;
  matchedLogoAssetId?: string;
  matchedLogoSimilarityScore?: number;
  matchedExecutiveId?: string;
  matchedExecutiveName?: string;
  htmlSnapshotLength: number;
  screenshotArtifactUrl: string;
  ocrTextExcerpt: string;
  cryptographicSignature: string;
  firstSeen: string;
  lastSeen: string;
}

export interface DecisionHistoryEntry {
  id: string;
  timestamp: string;
  action: BrandFindingStatus | 'ESCALATED' | 'INCIDENT_CREATED' | 'RISK_CREATED' | 'CAPA_CREATED' | 'TAKEDOWN_REQUESTED';
  actorName: string;
  actorRole: string;
  reason: string;
  notes?: string;
}

export interface BrandFinding {
  id: string;
  tenantId: string;
  findingCode: string; // e.g. "BF-2026-001"
  title: string;
  findingType: BrandFindingType;
  severity: BrandFindingSeverity;
  status: BrandFindingStatus;
  firstSeen: string;
  lastSeen: string;
  targetUrl: string;
  targetDomain: string;
  owner?: string;
  isIgnored?: boolean;
  ignoredReason?: string;
  ignoredAt?: string;
  ignoredBy?: string;
  
  // Correlated Signal Scores
  logoSimilarityScore: number; // 0 - 100
  brandNameSimilarityScore: number; // 0 - 100
  domainSimilarityScore: number; // 0 - 100
  websiteVisualSimilarityScore: number; // 0 - 100
  overallConfidence: number; // 0 - 100

  // Matched Entities
  matchedBrandAsset?: {
    assetId: string;
    assetName: string;
    assetType: string;
    officialLogoUrl: string;
    detectedLogoRegion?: { x: number; y: number; width: number; height: number };
    detectionMethod: 'PERCEPTUAL_VECTOR_HASH' | 'COLOR_HISTOGRAM' | 'FEATURE_CONTOUR';
  };
  matchedExecutive?: {
    executiveId: string;
    fullName: string;
    title: string;
    context: string;
    allegedQuoteOrClaim?: string;
  };

  // Domain & Web Analysis Data
  domainIntel: DomainIntelligenceRecord;
  webPageAnalysis: WebPageAnalysisResult;

  // Explainable Risk Score
  riskScore: ExplainableRiskScore;

  // Tamper-Evident Evidence
  evidence: TamperEvidentBrandEvidence;

  // GRC & Platform Cross-Linkages
  linkedIncidentId?: string;
  linkedRiskId?: string;
  linkedFindingCapaId?: string;
  linkedEvidenceRecordId?: string;

  // False Positive / Exception Management
  isWhitelisted: boolean;
  whitelistReason?: string;
  decisionHistory: DecisionHistoryEntry[];

  // Mitigation Status
  mitigation?: {
    takedownState: 'NOT_INITIATED' | 'DRAFTED' | 'DISPATCHED' | 'ACKNOWLEDGED_BY_HOST' | 'OFFLINE_VERIFIED' | 'REJECTED';
    abuseNoticeRecipient?: 'REGISTRAR' | 'HOSTING_PROVIDER' | 'CDN' | 'GOOGLE_SAFE_BROWSING' | 'LEGAL_COUNSEL';
    abuseNoticeText?: string;
    takedownInitiatedDate?: string;
    takedownResolvedDate?: string;
  };

  // Enterprise Threat Intelligence & Automation Extensions
  weaponization?: WeaponizationLifecycleRecord;
  dnsThreatIntel?: EnrichedDnsThreatIntel;
  evidenceBundle?: CryptographicEvidenceBundle;
}

export interface BrandGuardDashboardMetrics {
  brandExposureScore: number; // 0-100 gauge (higher = more exposed)
  criticalFindingsCount: number;
  highRiskFindingsCount: number;
  mediumRiskFindingsCount: number;
  lowRiskFindingsCount: number;
  totalActiveFindings: number;
  resolvedTakedownsCount: number;
  logoMisuseCount: number;
  fakeDomainsCount: number;
  executiveImpersonationCount: number;
  phishingSitesCount: number;
  falsePositiveRatePercent: number;
  totalDiscoveredUrlsThisMonth: number;
  quotaUsedPercent: number;
  commercialTier: CommercialTier;
}

export interface ThreatActorCluster {
  id: string;
  clusterName: string;
  threatActorLabel: string;
  commonAsn: string;
  commonAsnOrg: string;
  commonSubnet: string;
  commonNameServers: string[];
  commonSslFingerprint: string;
  commonRegistrar: string;
  domainCount: number;
  domains: string[];
  findingCodes: string[];
  campaignConfidence: number; // 0-100%
  attackVector: string;
  firstDetected: string;
  lastActive: string;
  clusterStatus: 'ACTIVE_CAMPAIGN' | 'BATCH_DISPATCHED' | 'BLOCKED_NETWORK' | 'DISMANTLED';
  dispatchedAbuseReference?: string;
  dispatchedTimestamp?: string;
}

export interface LeakedCredentialAlert {
  id: string;
  email: string;
  domain: string;
  leakSource: string;
  exposureDate: string;
  ingestedDate: string;
  breachSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  exposedDataTypes: string[];
  cleartextPasswordMasked?: string;
  passwordHashType?: string;
  compromisedEmployee?: {
    name: string;
    department: string;
    role: string;
  };
  remediationStatus: 'OPEN' | 'PASSWORD_RESET_ENFORCED' | 'SESSION_REVOKED' | 'RESOLVED_FALSE_POSITIVE';
  remediationActionTaken?: string;
  resolvedAt?: string;
  stealerMalwareFamily?: string;
}

export interface CodeRepoLeakAlert {
  id: string;
  repoPlatform: 'GitHub' | 'GitLab' | 'Bitbucket' | 'Public Gist';
  repoUrl: string;
  authorHandle: string;
  repoName: string;
  matchedSecretType: 'API_KEY' | 'AWS_SECRET' | 'STRIPE_SECRET' | 'OAUTH_CLIENT_SECRET' | 'INTERNAL_DATABASE_URL' | 'PRIVATE_KEY';
  secretMasked: string;
  commitHash: string;
  filePath: string;
  exposureDate: string;
  severity: 'CRITICAL' | 'HIGH';
  status: 'ACTIVE_EXPOSED' | 'SECRET_REVOKED' | 'REPO_TAKEDOWN_REQUESTED' | 'MITIGATED';
  riskScore: number;
  takedownNoticeDispatched?: boolean;
}

export interface RegistrarAbuseDeliveryReceipt {
  receiptId: string;
  takedownId: string;
  findingCode: string;
  targetDomain: string;
  registrarName: string;
  abuseEmail: string;
  dispatchedAt: string;
  deliveryStatus: 'DISPATCHED_PENDING_ACK' | 'DELIVERED_250_OK' | 'TICKET_ACKNOWLEDGED' | 'SLA_BREACHED' | 'DOMAIN_SUSPENDED';
  cryptographicProofHash: string;
  rawSmtpProof: string;
  iso27001ControlRef: string; // e.g. "ISO 27001 A.5.20 / SOC 2 CC7.4"
  slaDeadline: string;
  evidenceSha256Digest: string;
  domain?: string;
  registrarAbuseEmail?: string;
  smtpMessageId?: string;
  rfcNoticeHashSha256?: string;
  upstreamCarrierResponse?: string;
  signedBy?: string;
}

export interface BrandExposureRadarMetrics {
  domainMimicryRisk: number; // 0-100
  emailSpoofingExposure: number; // 0-100
  visualCloneProximity: number; // 0-100
  takedownVelocityMTTR: number; // 0-100
  brandDefenseCoverage: number; // 0-100
  compositeExposureIndex: number; // 0-100
  executiveNarrative: string;
}

// -------------------------------------------------------------
// CHIEF CYBER SECURITY ARCHITECT: EASM & SUBDOMAIN TAKEOVER
// -------------------------------------------------------------
export type CloudProviderService = 
  | 'AWS_S3'
  | 'AZURE_APP_SERVICE'
  | 'AZURE_TRAFFIC_MANAGER'
  | 'GITHUB_PAGES'
  | 'CLOUDFRONT'
  | 'ZENDESK'
  | 'HEROKU'
  | 'FASTLY'
  | 'README_IO'
  | 'SHOPIFY';

export interface EasmSubdomainRecord {
  id: string;
  subdomain: string; // e.g. "auth.apexfintech.com"
  apexDomain: string; // "apexfintech.com"
  recordType: 'CNAME' | 'A' | 'AAAA';
  cnameTarget: string; // e.g. "apex-auth.s3-website-us-east-1.amazonaws.com"
  cloudService: CloudProviderService;
  status: 'VULNERABLE_DANGLING' | 'SECURE_ACTIVE' | 'RESOLVING_NXDOMAIN' | 'REMEDIATION_PENDING';
  vulnerabilityReason?: string;
  httpFingerprintSignature?: string; // e.g. "NoSuchBucket"
  ipAddresses: string[];
  firstDiscovered: string;
  lastVerified: string;
  takeoverImpact: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  exploitSimulationProof?: string;
  suggestedDnsFix: string;
  remediatedAt?: string;
}

// -------------------------------------------------------------
// CHIEF CYBER SECURITY ARCHITECT: EXECUTIVE DEEPFAKE DEFENSE
// -------------------------------------------------------------
export interface ExecutiveDeepfakeAlert {
  id: string;
  executiveId: string;
  executiveName: string;
  executiveTitle: string;
  mediaType: 'SYNTHETIC_AUDIO_VOICE_CLONE' | 'VIDEO_DEEPFAKE' | 'SOCIAL_VIP_IMPERSONATION' | 'PHONE_LEAK_SMISHING';
  sourcePlatform: 'TELEGRAM' | 'WHATSAPP' | 'YOUTUBE' | 'X_TWITTER' | 'DARKWEB_BREACH_MARKET';
  mediaUrl: string;
  detectionConfidence: number; // 0-100%
  spectralArtifactScore: number; // 0-100
  audioMfccDeviationScore?: number;
  syntheticIndicators: string[];
  associatedPhoneExposure?: string;
  status: 'ACTIVE_CAMPAIGN' | 'TAKEDOWN_ISSUED' | 'FALSE_POSITIVE' | 'CONTAINED';
  recordedAt: string;
  actionRequired: string;
}

// -------------------------------------------------------------
// CHIEF CYBER SECURITY ARCHITECT: WIPO UDRP / URS LEGAL DOSSIER
// -------------------------------------------------------------
export interface WipoUdrpDossier {
  dossierId: string;
  findingId: string;
  targetDomain: string;
  disputedRegistrant: string;
  registrar: string;
  complainantName: string;
  complainantTrademark: string;
  trademarkRegistrationNo: string;
  trademarkJurisdiction: string;
  prong1_ConfusingSimilarity: {
    status: 'ESTABLISHED';
    phoneticEquivalenceScore: number;
    visualCloningEvidenceSummary: string;
    homoglyphSubstitutions: string[];
  };
  prong2_LackOfLegitimateRights: {
    status: 'ESTABLISHED';
    findingEvidence: string;
    priorBusinessRelationship: boolean;
  };
  prong3_BadFaithRegistrationAndUse: {
    status: 'ESTABLISHED';
    activeMxThreat: boolean;
    deceptiveCredentialHarvesting: boolean;
    monetizedParkedTraffic: boolean;
    evidenceNotes: string;
  };
  iso27037ChainOfCustody: {
    evidenceSha256Digest: string;
    rfc3161TimestampToken: string;
    captureAgentIp: string;
    tlsCipherSuite: string;
  };
  generatedAt: string;
  filingStatus: 'DRAFT_READY' | 'LEGAL_REVIEW' | 'FILED_WITH_WIPO' | 'DOMAIN_TRANSFERRED';
}

// -------------------------------------------------------------
// CHIEF ANTIVIRUS ARCHITECT: ZERO-HOUR IOC & EDR FEEDS
// -------------------------------------------------------------
export interface ZeroHourIocFeedBundle {
  generatedAt: string;
  totalActiveIocs: number;
  criticalMaliciousDomains: string[];
  rogueFaviconMurmurHashes: number[]; // mmh3
  sha256PayloadHashes: string[];
  sha256DomHashes: string[];
  snortSuricataRules: string;
  dnsRpzZoneFile: string;
  paloAltoEdlFeed: string;
  sentinelKqlQuery: string;
  crowdstrikeFalconQuery: string;
  stix21BundleJson: string;
}

// -------------------------------------------------------------
// CHIEF ANTIVIRUS ARCHITECT: PHISHING KIT FORENSICS & YARA
// -------------------------------------------------------------
export interface PhishingKitForensics {
  id: string;
  findingId: string;
  domain: string;
  kitFamily?: string; // e.g. "16Shop v3.2", "BulletProofLink Clone", "Unknown Kit"
  faviconMurmurHash3: number; // e.g. -127839123
  faviconShodanQuery: string; // http.favicon.hash:-127839123
  exfiltrationChannels: {
    telegramBotTokens: string[];
    telegramChatIds: string[];
    discordWebhooks: string[];
    phpCredentialGates: string[];
    smtpMailDropboxes: string[];
  };
  compiledYaraRule: string;
  antiCloakingTelemetry: {
    cloakingDetected: boolean;
    bypassedDatacenterFilter: boolean;
    cdpStealthInjected: boolean;
    residentialProxyCountry: string;
    browserFingerprintSimulated: string;
  };
  binaryDetonation?: {
    hasTrojanInstaller: boolean;
    fileName?: string;
    fileHashSha256?: string;
    peCompileTimestamp?: string;
    authenticodeStatus?: 'INVALID_SELFSIGNED' | 'REVOKED' | 'UNSIGNED';
    androidApkDangerousPermissions?: string[];
  };
}

// -------------------------------------------------------------
// CHIEF CTO: MULTI-TIER FUNNEL & VIT VECTOR SEARCH
// -------------------------------------------------------------
export interface MultiTierFunnelMetrics {
  totalScannedDaily: number;
  tier0_WireSpeedDnsFiltered: number; // ~85% filtered at zero cost
  tier1_HttpHeadFastFiltered: number; // ~10% filtered in <50ms
  tier2_HeadlessRenderExecuted: number; // ~4% rendered in sandbox
  tier3_VitGpuVisionExecuted: number; // ~1% escalated to GPU vision
  monthlyComputeSavingsPercent: number; // ~92% cost savings
  averageLatencyMs: number;
}

export interface VitVisionComparison {
  brandAssetId: string;
  rogueDomain: string;
  attackVariant: 'ROTATED_LOGO_3DEG' | 'DARK_MODE_INVERTED' | 'BACKGROUND_NOISE_INJECTED' | 'CROP_CORNER_OFFSET' | 'EXACT_CLONE';
  legacyPhashHammingDistance: number;
  legacyPhashMatchResult: 'MISSED_EVASION' | 'MATCHED';
  vitEmbeddingCosineSimilarity: number; // 0.0 - 1.0 (e.g. 0.94)
  vitMatchResult: 'DETECTED_CONFIDENT' | 'MISSED';
  inferenceLatencyMs: number;
}

export interface DirectAbuseApiDispatch {
  id: string;
  targetDomain: string;
  provider: 'CLOUDFLARE_ABUSE_API' | 'AWS_TRUST_SAFETY' | 'GOOGLE_WEB_RISK_V4' | 'NAMECHEAP_API' | 'GODADDY_API';
  endpoint: string;
  requestPayloadSummary: string;
  status: 'SUBMITTED_SUCCESS' | 'DISPATCHED_QUEUED' | 'RATE_LIMITED' | 'REJECTED';
  ticketReferenceId: string;
  dispatchedAt: string;
  mttrHoursAchieved: number;
}

// -------------------------------------------------------------
// 1. WEAPONIZATION STATE MACHINE & LIFECYCLE SCORING
// -------------------------------------------------------------
export type WeaponizationStage =
  | 'REGISTERED_PARKED'              // Stage 1: Dormant threat / Parking page / NXDOMAIN
  | 'MX_SPF_CONFIGURED'              // Stage 2: Active email spoof / BEC hazard
  | 'LIVE_HTTP_HTTPS'                // Stage 3: Active web host / TLS configured
  | 'WEAPONIZED_CREDENTIAL_HARVEST'; // Stage 4: Form fields + Brand visuals / Phishing

export interface WeaponizationTransitionEvent {
  id: string;
  timestamp: string;
  fromStage: WeaponizationStage;
  toStage: WeaponizationStage;
  triggerDescription: string;
  alertEscalated: boolean;
  technicalDeltas: {
    dnsChange?: string;
    mxDiscovered?: string[];
    httpStatus?: number;
    visualSimilarityJump?: number;
  };
}

export interface WeaponizationLifecycleRecord {
  currentStage: WeaponizationStage;
  weaponizationScore: number; // 0 - 100
  lastTransitionAt: string;
  escalationPriority: 'P1_CRITICAL_IMMOBILIZE' | 'P2_ELEVATED_WATCH' | 'P3_DORMANT_SURVEILLANCE';
  stateMachineHistory: WeaponizationTransitionEvent[];
  activeThreatIndicators: {
    isParkedAdFarm: boolean;
    hasActiveMailExchange: boolean;
    isResolvingHttp: boolean;
    hasInteractiveForms: boolean;
    brandMarkDetected: boolean;
  };
}

// -------------------------------------------------------------
// 2. ACTIVE DNS & THREAT INTELLIGENCE CROSS-CORRELATION
// -------------------------------------------------------------
export interface PassiveDnsEntry {
  timestamp: string;
  recordType: 'A' | 'AAAA' | 'MX' | 'NS' | 'TXT' | 'CNAME';
  value: string;
  ttl: number;
  firstSeen: string;
  lastSeen: string;
}

export interface AsnReputationScorecard {
  asn: string;
  asnOrg: string;
  asnCountry: string;
  reputationCategory: 'TIER1_HYPERSCALER' | 'STANDARD_HOST' | 'BULLETPROOF_OFFSHORE' | 'KNOWN_MALICIOUS_BULLETPROOF';
  threatIndex: number; // 0 - 100 (high = dangerous bulletproof host)
  hostingAbuseResponsivenessScore: number; // 0 - 100 (e.g. AWS=95, Cloudflare=90, Hostkey=18, OffshoreBulletproof=5)
  averageTakedownTurnaroundHours: number;
  abuseContactEmail: string;
  isBulletproofSuspect: boolean;
  networkPrefix: string;
}

export interface EnrichedDnsThreatIntel {
  domain: string;
  passiveDnsHistory: PassiveDnsEntry[];
  asnScorecard: AsnReputationScorecard;
  threatFeedMatches: Array<{
    source: 'SPAMHAUS_DBL' | 'PHISHTANK' | 'ALIENVAULT_OTX' | 'URLHAUS' | 'VIRUSTOTAL_COMMUNITY';
    listed: boolean;
    confidence: number;
    category: string;
  }>;
  ipGeolocation: {
    country: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  nameserverReputation: {
    isKnownFastFlux: boolean;
    nameservers: string[];
    sharedMaliciousDomainsCount: number;
  };
}

// -------------------------------------------------------------
// 3. AUTOMATED EVIDENCE CHAIN-OF-CUSTODY & CRYPTOGRAPHIC BUNDLE
// -------------------------------------------------------------
export interface CustodyTransferEvent {
  id: string;
  timestampIso: string;
  action:
    | 'INITIAL_CAPTURE'
    | 'CRYPTOGRAPHIC_SEALING'
    | 'WORM_VAULT_DEPOSITED'
    | 'HASH_REVERIFIED'
    | 'LEGAL_EXPORT'
    | 'REGISTRAR_DISPATCH'
    | 'COURT_AFFIDAVIT_SIGNED';
  actor: string;
  actorRole: string;
  notes: string;
  verificationHash: string;
}

export interface MerkleTreeProof {
  rootHash: string;
  leaves: {
    name: string;
    artifactType: 'SCREENSHOT' | 'HAR_ARCHIVE' | 'TLS_CERT' | 'DNS_TREE' | 'DOM_HTML';
    hash: string;
  }[];
  algorithm: string;
  computedAt: string;
}

export interface CryptographicEvidenceBundle {
  bundleId: string;
  findingId: string;
  targetDomain: string;
  targetUrl: string;
  capturedAtIso: string;
  capturedByAgent: string;
  // Forensic components
  fullPageScreenshotBase64?: string;
  fullPageScreenshotUrl: string;
  httpHarArchiveJson: string; // HTTP Archive format with request/response headers
  tlsCertificateChain: {
    leafFingerprintSha256: string;
    issuerCommonName: string;
    subjectAlternativeNames: string[];
    validityNotBefore: string;
    validityNotAfter: string;
    rawPemChain: string;
    keyAlgorithm?: string;
    cipherSuite?: string;
    intermediateIssuer?: string;
    rootCa?: string;
  };
  dnsResolutionTree: {
    aRecords: string[];
    nsRecords: string[];
    mxRecords: string[];
    txtRecords: string[];
    authoritativeNameserver: string;
    dnssecStatus: 'SECURE' | 'INSECURE' | 'BOGUS';
    cnameRecords?: string[];
    soaRecord?: string;
    resolutionHops?: {
      level: 'ROOT' | 'TLD' | 'AUTHORITATIVE' | 'RECURSIVE';
      server: string;
      ip: string;
      latencyMs: number;
    }[];
  };
  domNormalizedSha256: string;
  // Individual Artifact Hashes
  screenshotSha256?: string;
  harArchiveSha256?: string;
  tlsCertSha256?: string;
  dnsTreeSha256?: string;
  // Merkle Tree Proof
  merkleTreeProof?: MerkleTreeProof;
  // Tamper-evident ledger integrity
  sha256BundleDigest: string;
  hmacSignature: string;
  rfc3161TimestampToken: string;
  iso27037ComplianceCertified: boolean;
  // Chain-of-Custody lifecycle ledger
  custodyLedger?: CustodyTransferEvent[];
  legalAdmissibility?: {
    iso27037Compliant: boolean;
    nistSp80086Compliant: boolean;
    wipoUdrpAdmissible: boolean;
    freRule902_14Compliant: boolean;
    jurisdictionCertification: string;
    expertWitnessDeclaration: string;
  };
  captureEnvironment?: {
    egressNodeIp: string;
    geolocation: string;
    browserUserAgent: string;
    dnsResolver: string;
    chromiumVersion: string;
  };
  threatCategory?: string;
  integrityVerified?: boolean;
  lastVerifiedAt?: string;
}

// -------------------------------------------------------------
// 4. ENTERPRISE EXECUTIVE IDENTITY VECTORS (DEEPFAKE, BREACH & COMBO)
// -------------------------------------------------------------
export interface ExecutivePersonalExposure {
  id: string;
  executiveId: string;
  executiveName: string;
  exposureType: 'DARK_WEB_COMBOLIST' | 'SIM_SWAP_SIGNAL' | 'TELEGRAM_IMPOSTOR' | 'DEEPFAKE_AUDIO_VIDEO' | 'EXECUTIVE_PHONE_LEAK';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  discoveredAt: string;
  details: {
    targetIdentifier: string; // e.g. personal email or phone masked
    sourceBreachName?: string; // e.g. "StealerLogs_RedLine_2026_Q1"
    compromisedPasswordMasked?: string;
    impostorChannelUrl?: string; // e.g. "https://t.me/karthik_apexfintech_vip"
    deepfakeModality?: 'VOICE_CLONE_AUDIO' | 'SYNTHETIC_AVATAR_VIDEO';
    syntheticConfidenceScore?: number; // 0 - 100%
    suspectedAttackVector: string; // e.g. "CEO Fraud Wire Transfer / Authorized Push Payment"
  };
  containmentStatus: 'ACTIVE_EXPOSURE' | 'SIM_LOCK_REQUESTED' | 'ACCOUNT_TAKEDOWN_DISPATCHED' | 'RESOLVED_CONTAINED';
  recommendedRemediation: string;
}

export interface ExecutiveImpostorSocialAlert {
  id: string;
  executiveId: string;
  executiveName: string;
  platform: 'X_TWITTER' | 'TELEGRAM' | 'WHATSAPP' | 'SIGNAL' | 'LINKEDIN';
  impostorHandle: string;
  impostorProfileUrl: string;
  impostorAvatarUrl: string;
  isVerifiedBadge: boolean;
  followerCount: number;
  detectedSolicitation: string; // e.g. "DM for private seed round investments"
  firstDetectedAt: string;
  takedownStatus: 'DISCOVERY_FLAGGED' | 'REPORTED_TO_TRUST_SAFETY' | 'SUSPENDED_BY_PLATFORM';
}






