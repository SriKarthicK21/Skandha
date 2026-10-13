// Skanda Enterprise — Brand Logo Monitoring & Visual Impersonation Detection Models
// Fully typed domain models for Brand Asset Registry, Versioning, Visual Detection Pipeline,
// Multi-Signal Correlation, Explainable Risk Scoring, and 15-Stage Lifecycle.

export type EnterpriseLogoAssetType =
  | 'PRIMARY_LOGO'
  | 'SECONDARY_LOGO'
  | 'HORIZONTAL_LOGO'
  | 'VERTICAL_LOGO'
  | 'ICON_ONLY'
  | 'WORDMARK'
  | 'SYMBOL_MARK'
  | 'MONOCHROME_LOGO'
  | 'WHITE_LOGO'
  | 'DARK_BACKGROUND_LOGO'
  | 'LIGHT_BACKGROUND_LOGO'
  | 'PRODUCT_LOGO'
  | 'SERVICE_LOGO'
  | 'CAMPAIGN_LOGO'
  | 'APP_ICON'
  | 'FAVICON'
  | 'PARTNER_LOGO'
  | 'LEGACY_LOGO'
  | 'REGIONAL_LOGO'
  | 'PRODUCT_SPECIFIC_IDENTITY';

export type BrandAssetStatus = 'ACTIVE' | 'UNDER_REVIEW' | 'DEPRECATED' | 'ARCHIVED';

export interface BrandAssetVersionRecord {
  id: string;
  brandAssetId: string;
  tenantId: string;
  version: number;
  fileReference: string;
  fileType: string;
  fileSize: number;
  dimensions: { width: number; height: number };
  sha256: string;
  perceptualHash: string;
  embeddingReference: string;
  backgroundType: 'TRANSPARENT' | 'LIGHT' | 'DARK' | 'ANY';
  colorPalette: string[];
  ocrText: string;
  createdBy: string;
  changeReason: string;
  createdAt: string;
  auditEventId: string;
}

export interface EnterpriseBrandAsset {
  id: string;
  tenantId: string;
  brandId: string;
  name: string;
  assetType: EnterpriseLogoAssetType;
  brandName: string;
  description: string;
  currentVersion: number;
  status: BrandAssetStatus;
  isApproved: boolean;
  uploadDate: string;
  uploadedBy: string;
  fileType: string;
  fileSize: number;
  dimensions: { width: number; height: number };
  sha256: string;
  perceptualHash: string;
  embeddingReference: string;
  backgroundType: 'TRANSPARENT' | 'LIGHT' | 'DARK' | 'ANY';
  colorPalette: string[];
  ocrText: string;
  associatedDomain: string;
  associatedProducts: string[];
  associatedServices: string[];
  officialUsageLocations: string[];
  effectiveDate: string;
  expiryDate?: string;
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  versionHistory: BrandAssetVersionRecord[];
}

export type LogoMatchLifecycleStatus =
  | 'DISCOVERED'
  | 'PENDING_ANALYSIS'
  | 'ANALYZED'
  | 'POTENTIAL_MATCH'
  | 'SUSPECTED_IMPERSONATION'
  | 'CONFIRMED_UNAUTHORIZED_USE'
  | 'CONFIRMED_PHISHING'
  | 'FALSE_POSITIVE'
  | 'UNDER_INVESTIGATION'
  | 'TAKEDOWN_REQUESTED'
  | 'TAKEDOWN_IN_PROGRESS'
  | 'REMOVED'
  | 'RESOLVED'
  | 'REOPENED'
  | 'ARCHIVED';

export type LogoRiskLevel = 'INFORMATIONAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type CandidateSourceType =
  | 'PUBLIC_WEBSITE'
  | 'PHISHING_PAGE'
  | 'SOCIAL_PROFILE'
  | 'SOCIAL_POST'
  | 'ONLINE_ADVERTISEMENT'
  | 'MOBILE_APP_LISTING'
  | 'PUBLIC_DOCUMENT_PDF'
  | 'PUBLIC_SCREENSHOT'
  | 'THREAT_INTEL_FEED'
  | 'SECURITY_RESEARCHER_REPORT'
  | 'USER_SUBMITTED_EVIDENCE';

export type AiVisionProviderType =
  | 'LOCAL_CONVOLUTIONAL'
  | 'OPENCLIP_VIT_EMBEDDING'
  | 'ENTERPRISE_CLOUD_VISION'
  | 'INTERNAL_INFERENCE_SERVICE'
  | 'MOCK_TEST_PROVIDER';

export type AiAnalysisState =
  | 'PENDING_ANALYSIS'
  | 'COMPLETED'
  | 'PROVIDER_UNAVAILABLE'
  | 'ANALYSIS_FAILED'
  | 'AWAITING_RETRY';

export interface VisualTransformationIndicators {
  isExactHashMatch: boolean;
  isPerceptualHashMatch: boolean;
  isCropped: boolean;
  isResized: boolean;
  isRotated: boolean;
  rotationDegrees?: number;
  isMirrored: boolean;
  isColorModified: boolean;
  isLowResolution: boolean;
  isPartialLogo: boolean;
  embeddedInScreenshot: boolean;
  embeddedInAdvertisement: boolean;
  embeddedInWebpage: boolean;
  embeddedInMobileIcon: boolean;
  combinedWithFakeText: boolean;
  combinedWithMaliciousUrl: boolean;
  combinedWithFakeLoginForm: boolean;
}

export interface ExplainableRiskFactor {
  factorKey: string;
  name: string;
  category: 'BRAND' | 'DOMAIN' | 'WEBSITE' | 'THREAT_INTEL';
  pointsAwarded: number;
  maxPoints: number;
  isTriggered: boolean;
  description: string;
  rawEvidence: string;
}

export interface ExplainableLogoRiskAssessment {
  riskScore: number; // 0 - 100
  riskLevel: LogoRiskLevel;
  calculatedAt: string;
  modelVersion: string;
  factors: ExplainableRiskFactor[];
  topDrivers: string[];
  analystOverride?: {
    overriddenBy: string;
    previousLevel: LogoRiskLevel;
    newLevel: LogoRiskLevel;
    overrideReason: string;
    overriddenAt: string;
  };
}

export interface ContextualCorrelations {
  // Brand Signals
  brandSignals: {
    brandNameSimilarity: number; // 0 - 100
    productNameSimilarity: number;
    trademarkTextMatched: boolean;
    brandColorCosineSimilarity: number;
    typographySimilarity: number;
    sloganSimilarity: number;
    isOfficialAssetMatch: boolean;
  };

  // Domain Signals
  domainSignals: {
    targetDomain: string;
    isTyposquatting: boolean;
    isHomoglyph: boolean;
    isPunycode: boolean;
    isNewlyRegisteredDomain: boolean; // < 30 days
    domainAgeDays: number;
    suspiciousTld: boolean;
    nameserverAnomalies: boolean;
    tlsCertificateAnomalies: boolean;
    hasMxRecord: boolean;
    resolvedIps: string[];
    asn: string;
    asnOrg: string;
    hostingProvider: string;
    redirectChain: string[];
    isUrlShortener: boolean;
    isOfficialDomainMismatch: boolean;
  };

  // Website Signals
  websiteSignals: {
    hasLoginForm: boolean;
    hasCredentialHarvesting: boolean;
    hasPaymentForm: boolean;
    hasOtpCollection: boolean;
    hasPersonalInfoCollection: boolean;
    hasFakeSupportForm: boolean;
    hasMaliciousDownload: boolean;
    suspiciousJavaScriptCount: number;
    brandImpersonationLanguage: string[];
    hasFakeOffers: boolean;
    hasFakeRecruitment: boolean;
    hasFakeInvestment: boolean;
    missingLegalDisclaimers: boolean;
    layoutCloneSimilarity: number;
  };

  // Threat Intel Signals
  threatIntelSignals: {
    isKnownMaliciousIp: boolean;
    isKnownMaliciousDomain: boolean;
    threatFeedMatches: string[];
    securityVendorReputation: 'CLEAN' | 'SUSPICIOUS' | 'MALICIOUS';
    abuseReportsCount: number;
    historicalDetectionsCount: number;
    hasPreviousTakedowns: boolean;
  };
}

export interface LogoMatchEvidenceRecord {
  id: string;
  logoMatchId: string;
  evidenceType: 'SCREENSHOT' | 'DOM_HTML' | 'HAR_ARCHIVE' | 'IMAGE_CROPPED_REGION' | 'TLS_CERT' | 'DNS_ZONE';
  evidenceValue: string;
  confidence: number;
  source: string;
  collectedAt: string;
  sha256Hash: string;
  immutableReference: string;
}

export interface LogoMatchLifecycleEvent {
  id: string;
  fromStatus: LogoMatchLifecycleStatus;
  toStatus: LogoMatchLifecycleStatus;
  actor: string;
  actorRole: string;
  timestamp: string;
  reason: string;
  comments?: string;
}

export interface LogoMatch {
  id: string;
  tenantId: string;
  matchCode: string; // e.g. "LGO-2026-0041"
  brandAssetId: string;
  brandAssetVersionId: string;
  brandAssetName: string;
  officialLogoUrl: string;

  // Source & Target
  sourceId: string;
  sourceType: CandidateSourceType;
  sourceUrl: string;
  targetDomain: string;
  detectedImageUrl: string;
  detectedImageDimensions: { width: number; height: number };
  detectedRegionCoordinates?: { x: number; y: number; width: number; height: number };

  // Analysis Metrics
  similarityScore: number; // 0 - 100
  aiConfidence: number; // 0 - 100
  aiVisionProvider: AiVisionProviderType;
  aiAnalysisState: AiAnalysisState;
  transformations: VisualTransformationIndicators;

  // Lifecycle & Risk
  status: LogoMatchLifecycleStatus;
  riskAssessment: ExplainableLogoRiskAssessment;
  correlations: ContextualCorrelations;

  // Evidence & Traceability
  evidenceList: LogoMatchEvidenceRecord[];
  history: LogoMatchLifecycleEvent[];

  // Operational
  assignedAnalyst?: string;
  linkedInvestigationCaseId?: string;
  linkedTakedownRequestId?: string;
  isSuppressed: boolean;
  suppressionReason?: string;

  firstSeenAt: string;
  lastSeenAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonitoringSource {
  id: string;
  tenantId: string;
  sourceType: CandidateSourceType;
  name: string;
  provider: string;
  configuration: {
    endpointUrl?: string;
    crawlDepth?: number;
    maxConcurrentRequests?: number;
    respectRobotsTxt: boolean;
    userSubmittedAllowed: boolean;
  };
  status: 'ACTIVE' | 'PAUSED' | 'RATE_LIMITED' | 'ERROR';
  legalBasis: string; // e.g. "Open-source intelligence & public security telemetry under Terms of Service"
  rateLimitPerMinute: number;
  currentRequestsThisHour: number;
  lastRunAt?: string;
  nextRunAt?: string;
}

export interface MonitoringJob {
  id: string;
  tenantId: string;
  sourceId: string;
  sourceName: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  startedAt: string;
  completedAt?: string;
  candidatesDiscovered: number;
  logosAnalyzed: number;
  matchesIdentified: number;
  errorMessage?: string;
  processingDurationMs?: number;
}

export interface LogoInvestigationCase {
  id: string;
  tenantId: string;
  caseNumber: string; // e.g. "CASE-LGO-9812"
  logoMatchId: string;
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'UNDER_REVIEW' | 'EVIDENCE_COLLECTED' | 'ESCALATED_LEGAL' | 'CLOSED_RESOLVED';
  assignedTo: string;
  summary: string;
  associatedDomain: string;
  createdAt: string;
  updatedAt: string;
}

export interface LogoTakedownRequest {
  id: string;
  tenantId: string;
  takedownNumber: string; // e.g. "TKD-2026-031"
  logoMatchId: string;
  targetDomain: string;
  providerType: 'REGISTRAR' | 'HOSTING_PROVIDER' | 'CDN' | 'GOOGLE_SAFE_BROWSING' | 'SOCIAL_MEDIA_ABUSE';
  providerName: string;
  status: 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW_BY_PROVIDER' | 'COMPLIANCE_ENFORCED' | 'REJECTED' | 'OFFLINE_VERIFIED';
  externalTicketId?: string;
  submittedAt?: string;
  responseReceivedAt?: string;
  resolutionTimeHours?: number;
  evidencePackageSha256: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface LogoMonitoringOverviewMetrics {
  registeredBrandAssetsCount: number;
  activeLogoAssetsCount: number;
  totalLogoMatchesCount: number;
  newMatchesCount: number;
  highRiskMatchesCount: number;
  confirmedImpersonationsCount: number;
  openInvestigationsCount: number;
  pendingTakedownsCount: number;

  similarityDistribution: {
    bracket_90_100: number;
    bracket_75_89: number;
    bracket_50_74: number;
    bracket_below_50: number;
  };

  riskDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
  };

  sourceDistribution: Array<{
    sourceType: CandidateSourceType;
    label: string;
    count: number;
  }>;

  detectionTrendDaily: Array<{
    date: string;
    candidatesScanned: number;
    potentialMatches: number;
    highRiskImpersonations: number;
  }>;

  topImpersonatingDomains: Array<{
    domain: string;
    matchCount: number;
    highestRisk: LogoRiskLevel;
    status: LogoMatchLifecycleStatus;
  }>;
}
