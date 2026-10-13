// ============================================================================
// SKANDA ENTERPRISE GRC: MAS REGULATORY INTELLIGENCE SERVICE FACADE
// Path: server/services/regulatory/MASRegulatoryIntelligenceService.ts
//
// Phase 23.3: Master Regulatory Intelligence Service & Provenance Trace Drawer
// Provides high-performance facade for regulatory ingestion, immutable versioning,
// tenant applicability, change detection, 9-stage blast-radius assessment, and "Show Me Why" trace.
// ============================================================================

import {
  AIRegulatoryCopilotQuery,
  AIRegulatoryCopilotResponse,
  CustomerFinancialProfile,
  RegulatoryChangeEvent,
  RegulatoryNotice360,
  RegulatorySourceMetadata,
  RegulatoryVersion,
  RegulatoryWatchSubscription,
  RequirementDiff,
  TenantImpactAssessment,
  TenantNoticeApplicability,
  ProvenanceWhyTrace,
  MonitoredSourceRegistryEntry,
  RegulatoryReviewGate,
  RegulatoryAlert,
  RegulatoryCalendarItem,
  RegulatorySourceTelemetryMetrics,
  FinancialInstitutionType,
  RegulatoryFamily,
  RegulatoryStatus,
  ControlledChangeDrillSpec,
  ControlledDrillExecutionReport,
  SourceHealthStatus
} from '../../../src/types/masRegulatoryIntelligenceTypes';
import { MASRegulatorySourceAdapter } from './MASRegulatorySourceAdapter';
import { MASRegulatoryIngestionService } from './MASRegulatoryIngestionService';
import { MASApplicabilityEngine } from './MASApplicabilityEngine';
import { RegulatoryChangeDetectionService } from './RegulatoryChangeDetectionService';
import { RegulatoryImpactAssessmentService } from './RegulatoryImpactAssessmentService';
import { AIRegulatoryCopilotService } from './AIRegulatoryCopilotService';
import { MASRegulatoryDrillHarness } from './MASRegulatoryDrillHarness';

export class MASRegulatoryIntelligenceService {
  private static instance: MASRegulatoryIntelligenceService;

  private adapter: MASRegulatorySourceAdapter;
  private ingestionService: MASRegulatoryIngestionService;
  private applicabilityEngine: MASApplicabilityEngine;
  private changeDetectionService: RegulatoryChangeDetectionService;
  private impactAssessmentService: RegulatoryImpactAssessmentService;
  private copilotService: AIRegulatoryCopilotService;
  private drillHarness: MASRegulatoryDrillHarness;

  private watchSubscriptions: Map<string, RegulatoryWatchSubscription[]> = new Map(); // tenantId -> subscriptions

  private constructor() {
    this.adapter = new MASRegulatorySourceAdapter();
    this.ingestionService = new MASRegulatoryIngestionService(this.adapter);
    this.applicabilityEngine = new MASApplicabilityEngine();
    this.changeDetectionService = new RegulatoryChangeDetectionService();
    this.impactAssessmentService = new RegulatoryImpactAssessmentService();
    this.copilotService = new AIRegulatoryCopilotService(this.ingestionService, this.applicabilityEngine);
    this.drillHarness = new MASRegulatoryDrillHarness(
      this.adapter,
      this.ingestionService,
      this.applicabilityEngine,
      this.changeDetectionService,
      this.impactAssessmentService,
      this.copilotService
    );

    // Initial sync
    this.ingestionService.syncAuthoritativeNotices();
  }

  public static getInstance(): MASRegulatoryIntelligenceService {
    if (!MASRegulatoryIntelligenceService.instance) {
      MASRegulatoryIntelligenceService.instance = new MASRegulatoryIntelligenceService();
    }
    return MASRegulatoryIntelligenceService.instance;
  }

  // --------------------------------------------------------------------------
  // LIVE SOURCE MONITORING & HEALTH STATE MACHINE
  // --------------------------------------------------------------------------

  public getMonitoredSources(): MonitoredSourceRegistryEntry[] {
    return this.adapter.getMonitoredSources();
  }

  public getMonitoredSource(sourceId: string): MonitoredSourceRegistryEntry | undefined {
    return this.adapter.getMonitoredSource(sourceId);
  }

  public getSourceHealthSummary() {
    return this.adapter.getSourceHealthSummary();
  }

  public async checkSourceHealth(
    sourceId: string,
    options?: {
      simulateFailure?: 'TIMEOUT' | 'RATE_LIMIT' | 'PARSE_ERROR' | 'NETWORK_DOWN' | 'HASH_MUTATION';
      simulatedHash?: string;
    }
  ): Promise<MonitoredSourceRegistryEntry> {
    return this.adapter.performLiveSourceCheck(sourceId, options);
  }

  public validateSourceUrl(urlStr: string) {
    return this.adapter.validateSourceUrl(urlStr);
  }

  // --------------------------------------------------------------------------
  // HUMAN REVIEW GATE FOR REGULATORY CANDIDATES
  // --------------------------------------------------------------------------

  public stageCandidateVersion(
    candidate: RegulatoryVersion,
    noticeNumber: string,
    sourceUrl: string
  ): RegulatoryReviewGate {
    return this.ingestionService.stageCandidateVersion(candidate, noticeNumber, sourceUrl);
  }

  public getPendingReviewGates(): RegulatoryReviewGate[] {
    return this.ingestionService.getPendingReviewGates();
  }

  public getReviewGate(reviewId: string): RegulatoryReviewGate | undefined {
    return this.ingestionService.getReviewGate(reviewId);
  }

  public approveReviewGate(
    reviewId: string,
    reviewer: string,
    comments: string,
    checklistOverrides?: Partial<RegulatoryReviewGate['checklist']>
  ) {
    return this.ingestionService.approveReviewGate(reviewId, reviewer, comments, checklistOverrides);
  }

  public rejectReviewGate(reviewId: string, reviewer: string, reason: string): boolean {
    return this.ingestionService.rejectReviewGate(reviewId, reviewer, reason);
  }

  // --------------------------------------------------------------------------
  // SYNCHRONIZATION & SOURCE METADATA
  // --------------------------------------------------------------------------

  public syncRegulatorySources(): { syncedNotices: number; timestamp: string } {
    return this.ingestionService.syncAuthoritativeNotices();
  }

  public getSourceMetadata(): RegulatorySourceMetadata {
    return this.ingestionService.getSourceMetadata();
  }

  public getTelemetryMetrics(): RegulatorySourceTelemetryMetrics {
    return this.ingestionService.getTelemetryMetrics();
  }

  // --------------------------------------------------------------------------
  // NOTICES & VERSIONS
  // --------------------------------------------------------------------------

  public getAllNotices(): RegulatoryNotice360[] {
    return this.ingestionService.getAllNotices360();
  }

  public getActiveNotices(): RegulatoryNotice360[] {
    return this.ingestionService.getActiveNotices();
  }

  public getHistoricalNotices(): RegulatoryNotice360[] {
    return this.ingestionService.getHistoricalNotices();
  }

  public getNoticeById(noticeId: string): RegulatoryNotice360 | undefined {
    return this.ingestionService.getNoticeById(noticeId);
  }

  public getNoticeByNumber(noticeNumber: string): RegulatoryNotice360 | undefined {
    return this.ingestionService.getNoticeByNumber(noticeNumber);
  }

  public getNoticeVersions(noticeId: string): RegulatoryVersion[] {
    return this.ingestionService.getVersionsForNotice(noticeId);
  }

  // --------------------------------------------------------------------------
  // VERSION DIFF & CHANGE DETECTION ("SHOW ME WHAT CHANGED")
  // --------------------------------------------------------------------------

  public compareVersions(oldVersionId: string, newVersionId: string): RequirementDiff[] {
    const oldVersion = this.ingestionService.getVersion(oldVersionId);
    const newVersion = this.ingestionService.getVersion(newVersionId);

    if (!oldVersion || !newVersion) {
      throw new Error(`Version comparison failed: Invalid version ID(s) [${oldVersionId}, ${newVersionId}]`);
    }

    return this.changeDetectionService.compareVersions(oldVersion, newVersion);
  }

  public getRegulatoryChangeEvents(): RegulatoryChangeEvent[] {
    const notices = this.getAllNotices();
    return this.changeDetectionService.generateChangeEvents(notices);
  }

  // --------------------------------------------------------------------------
  // APPLICABILITY EVALUATION (TENANT-SCOPED)
  // --------------------------------------------------------------------------

  public evaluateTenantApplicability(profile: CustomerFinancialProfile): TenantNoticeApplicability[] {
    const notices = this.getAllNotices();
    return this.applicabilityEngine.evaluateAllApplicableNotices(notices, profile);
  }

  public evaluateSingleNoticeApplicability(
    noticeId: string,
    profile: CustomerFinancialProfile
  ): TenantNoticeApplicability {
    const notice = this.getNoticeById(noticeId);
    if (!notice) {
      throw new Error(`Notice not found: ${noticeId}`);
    }
    return this.applicabilityEngine.evaluateNoticeApplicability(notice, profile);
  }

  // --------------------------------------------------------------------------
  // IMPACT ASSESSMENT & CUSTOMER ALERTS (TENANT-SCOPED)
  // --------------------------------------------------------------------------

  public assessTenantImpact(
    changeEvent: RegulatoryChangeEvent,
    profile: CustomerFinancialProfile
  ): TenantImpactAssessment {
    const notice = this.getNoticeById(changeEvent.noticeId);
    if (!notice) {
      throw new Error(`Notice for change event not found: ${changeEvent.noticeId}`);
    }
    const applicability = this.applicabilityEngine.evaluateNoticeApplicability(notice, profile);
    return this.impactAssessmentService.assessImpact(changeEvent, profile, applicability);
  }

  public assessAllChangesForTenant(
    profile: CustomerFinancialProfile
  ): TenantImpactAssessment[] {
    const changeEvents = this.getRegulatoryChangeEvents();
    const notices = this.getAllNotices();
    const noticeMap = new Map<string, RegulatoryNotice360>(notices.map(n => [n.noticeId, n]));
    const applicabilityMap = new Map<string, TenantNoticeApplicability>(
      this.evaluateTenantApplicability(profile).map(a => [a.noticeId, a])
    );

    return this.impactAssessmentService.assessAllChanges(
      changeEvents,
      profile,
      noticeMap,
      applicabilityMap
    );
  }

  public getTenantAlerts(tenantId: string): RegulatoryAlert[] {
    return this.impactAssessmentService.getTenantAlerts(tenantId);
  }

  public acknowledgeTenantAlert(tenantId: string, alertId: string): boolean {
    return this.impactAssessmentService.acknowledgeTenantAlert(tenantId, alertId);
  }

  // --------------------------------------------------------------------------
  // REGULATORY TIMELINE / CALENDAR
  // --------------------------------------------------------------------------

  public getRegulatoryCalendar(filters?: {
    fiType?: FinancialInstitutionType;
    family?: RegulatoryFamily;
    status?: RegulatoryStatus;
  }): RegulatoryCalendarItem[] {
    const notices = this.getAllNotices();
    const now = new Date().getTime();
    const calendarItems: RegulatoryCalendarItem[] = [];

    for (const notice of notices) {
      const ver = notice.currentVersion;
      if (filters?.fiType && !notice.applicableEntityTypes.includes('ALL_FINANCIAL_INSTITUTIONS') && !notice.applicableEntityTypes.includes(filters.fiType)) {
        continue;
      }
      if (filters?.family && notice.family !== filters.family) {
        continue;
      }
      if (filters?.status && ver.status !== filters.status) {
        continue;
      }

      const effTime = new Date(ver.effectiveDate).getTime();
      const daysUntilEffective = Math.ceil((effTime - now) / (1000 * 60 * 60 * 24));

      calendarItems.push({
        itemId: `CAL-${notice.noticeId}`,
        instrumentId: notice.noticeId,
        noticeNumber: notice.noticeNumber,
        title: notice.title,
        family: notice.family,
        fiType: ver.FIType,
        publishedDate: ver.publishedDate,
        effectiveDate: ver.effectiveDate,
        supersededDate: ver.supersededDate,
        status: ver.status,
        bindingNature: ver.bindingNature || 'BINDING',
        officialSourceUrl: notice.officialSourceUrl,
        daysUntilEffective
      });
    }

    // Sort chronologically by effectiveDate descending
    return calendarItems.sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());
  }

  // --------------------------------------------------------------------------
  // "SHOW ME WHY" PROVENANCE TRACE DRAWER
  // --------------------------------------------------------------------------
  public getProvenanceWhyTrace(
    tenantId: string,
    profile: CustomerFinancialProfile,
    instrumentNumberOrId: string,
    requirementId?: string
  ): ProvenanceWhyTrace {
    const notice = this.getNoticeByNumber(instrumentNumberOrId) || this.getNoticeById(instrumentNumberOrId);
    if (!notice) {
      throw new Error(`Regulatory Instrument not found: ${instrumentNumberOrId}`);
    }

    const version = notice.currentVersion;
    const req = requirementId
      ? version.requirements.find(r => r.requirementId === requirementId) || version.requirements[0]
      : version.requirements[0];

    const applicability = this.applicabilityEngine.evaluateNoticeApplicability(notice, profile);

    const fullLineageChain = [
      `1. Institution Profile: ${profile.institutionName} (Tenant: ${tenantId})`,
      `2. FI Classification: ${profile.institutionType} (Licence: ${profile.licenceType})`,
      `3. Regulatory Family: ${notice.family}`,
      `4. Instrument: ${notice.instrumentType || 'NOTICE'} ${notice.noticeNumber} ("${notice.title}")`,
      `5. Version: ${version.versionId} (Promulgated under ${notice.governingAct})`,
      `6. Official Source: ${notice.officialSourceUrl} (SHA-256: ${version.documentHash.substring(0, 16)}...)`,
      `7. Publication Date: ${version.publishedDate}`,
      `8. Effective Date: ${version.effectiveDate} (Status: ${version.status})`,
      `9. Binding Nature: ${version.bindingNature || 'BINDING'}`,
      `10. Requirement: ${req?.requirementId || 'N/A'} - ${req?.title || 'General'} [${req?.sourceClassification || 'DIRECT_SOURCE'}]`,
      `11. Applicability Rule: ${applicability.applicabilityRationale}`,
      `12. Affected Canonical Controls: ${req?.mappedControlCodes.join(', ') || 'N/A'}`
    ];

    return {
      tenantId,
      institutionProfile: {
        institutionName: profile.institutionName,
        institutionType: profile.institutionType,
        licenceType: profile.licenceType
      },
      fiClassification: profile.institutionType,
      regulatoryFamily: notice.family,
      instrumentId: notice.noticeId,
      instrumentNumber: notice.noticeNumber,
      instrumentTitle: notice.title,
      instrumentType: notice.instrumentType || 'NOTICE',
      versionId: version.versionId,
      officialSourceUrl: notice.officialSourceUrl,
      sourceDocumentHash: version.documentHash,
      publicationDate: version.publishedDate,
      effectiveDate: version.effectiveDate,
      bindingNature: version.bindingNature || 'BINDING',
      verificationStatus: version.verificationStatus,
      requirementId: req?.requirementId || 'N/A',
      requirementText: req?.requirementText || req?.description || '',
      sourceClassification: req?.sourceClassification || 'DIRECT_SOURCE',
      applicabilityRule: applicability.applicabilityRationale,
      affectedControls: req?.mappedControlCodes || [],
      fullLineageChain
    };
  }

  // --------------------------------------------------------------------------
  // WATCHLIST & SUBSCRIPTIONS
  // --------------------------------------------------------------------------

  public getWatchSubscriptions(tenantId: string): RegulatoryWatchSubscription[] {
    return this.watchSubscriptions.get(tenantId) || [];
  }

  public addWatchSubscription(subscription: RegulatoryWatchSubscription): void {
    const current = this.watchSubscriptions.get(subscription.tenantId) || [];
    current.push(subscription);
    this.watchSubscriptions.set(subscription.tenantId, current);
  }

  public removeWatchSubscription(tenantId: string, subscriptionId: string): void {
    const current = this.watchSubscriptions.get(tenantId) || [];
    const filtered = current.filter(s => s.subscriptionId !== subscriptionId);
    this.watchSubscriptions.set(tenantId, filtered);
  }

  // --------------------------------------------------------------------------
  // AI REGULATORY COPILOT
  // --------------------------------------------------------------------------

  public queryCopilot(
    queryPayload: AIRegulatoryCopilotQuery,
    profile?: CustomerFinancialProfile
  ): AIRegulatoryCopilotResponse {
    return this.copilotService.queryRegulatoryCorpus(queryPayload, profile);
  }

  // --------------------------------------------------------------------------
  // CONTROLLED REGULATORY DRILL & OPERATIONAL SIMULATION HARNESS
  // --------------------------------------------------------------------------

  public async executeControlledChangeDrill(
    spec: ControlledChangeDrillSpec
  ): Promise<ControlledDrillExecutionReport> {
    return this.drillHarness.executeControlledChangeDrill(spec);
  }

  public async simulateSourceFailure(
    sourceId: string,
    failureType: 'TIMEOUT' | 'RATE_LIMIT' | 'PARSE_ERROR' | 'NETWORK_DOWN'
  ) {
    return this.drillHarness.simulateSourceFailure(sourceId, failureType);
  }

  public async simulateParserFailure(sourceId: string, malformedContent: string) {
    return this.drillHarness.simulateParserFailure(sourceId, malformedContent);
  }

  public async simulateHashTampering(sourceId: string, mutatedContent: string) {
    return this.drillHarness.simulateHashTampering(sourceId, mutatedContent);
  }

  public async simulateIngestionIdempotency(noticeNumber: string, count: number = 3) {
    return this.drillHarness.simulateIngestionIdempotency(noticeNumber, count);
  }

  public simulateTenantIsolation(
    tenantA: CustomerFinancialProfile,
    tenantB: CustomerFinancialProfile,
    event: RegulatoryChangeEvent
  ) {
    return this.drillHarness.simulateTenantIsolation(tenantA, tenantB, event);
  }

  public simulateAiAntiSelfAuthorization(reviewId: string, botName?: string) {
    return this.drillHarness.simulateAiAntiSelfAuthorization(reviewId, botName);
  }

  public simulateEffectiveDateTimeline(
    publishedDate: string,
    effectiveDate: string,
    referenceDates: string[]
  ) {
    return this.drillHarness.simulateEffectiveDateTimeline(publishedDate, effectiveDate, referenceDates);
  }

  public simulateSecurityHardeningProbe(
    probeType: 'SSRF_LOCALHOST' | 'SSRF_RFC1918' | 'AWS_METADATA_169' | 'INSECURE_HTTP' | 'DISALLOWED_DOMAIN' | 'OVERSIZED_PAYLOAD' | 'PROMPT_INJECTION'
  ) {
    return this.drillHarness.simulateSecurityHardeningProbe(probeType);
  }

  public async simulateSourceOutageAndRecovery(sourceId: string) {
    return this.drillHarness.simulateSourceOutageAndRecovery(sourceId);
  }

  // --------------------------------------------------------------------------
  // AUDIT & PROVENANCE
  // --------------------------------------------------------------------------

  public getIngestionAuditLogs() {
    return this.ingestionService.getAuditLogs();
  }
}

export const masRegulatoryIntelligenceService = MASRegulatoryIntelligenceService.getInstance();


