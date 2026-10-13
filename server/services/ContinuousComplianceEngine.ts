// SKANDA GRC — ContinuousComplianceEngine
// Autonomous Daemon & Background Job Scheduler for Polling Control Statuses,
// Evaluating Evidence Freshness Decay, and Detecting Real-Time Compliance Drift.

import crypto from 'crypto';
import {
  db,
  persistDb,
  ensureTenantSeeded,
  calculateSummary,
  calculateLifecycleMetrics
} from '../continuousComplianceDb';
import {
  ContinuousControlEvaluation,
  AutomatedControlTest,
  ComplianceDriftEvent,
  ContinuousComplianceControlStatus,
  EvidenceFreshnessRating,
  MonitoringFrequency,
  DriftSeverity,
  DriftType,
  EngineSchedulerStatus,
  ContinuousComplianceEngineConfig,
  ContinuousComplianceEngineRunLog,
  ContinuousComplianceEngineStatus,
  ContinuousComplianceSummary
} from '../../src/types/continuousCompliance';

export class ContinuousComplianceEngine {
  private schedulerInterval: NodeJS.Timeout | null = null;
  private schedulerStatus: EngineSchedulerStatus = 'IDLE';
  private pollingIntervalMs: number = 30000; // 30 seconds default
  private config: ContinuousComplianceEngineConfig = {
    tenantId: 'tenant-acme',
    pollingIntervalMs: 30000,
    enabled: true,
    autoDriftDetectionEnabled: true,
    autoTriggerRemediationRecommendations: true,
    notifyOnCriticalDrift: true
  };
  private lastRunTimestamp: string | null = null;
  private nextRunTimestamp: string | null = null;
  private totalRunsCount: number = 0;
  private runLogs: ContinuousComplianceEngineRunLog[] = [];
  private isPolling: boolean = false;
  private maxLogsRetention: number = 50;

  constructor() {
    // Default constructor
  }

  /**
   * Bootstraps the engine and starts the background job scheduler
   */
  public initialize(autoStart: boolean = true, tenantId: string = 'tenant-acme'): void {
    this.config.tenantId = tenantId;
    ensureTenantSeeded(tenantId);
    console.log(`[ContinuousComplianceEngine] Initialized for tenant: ${tenantId}`);

    if (autoStart && this.config.enabled) {
      this.startScheduler(this.pollingIntervalMs, tenantId);
    }
  }

  /**
   * Starts or resumes the background job scheduler
   */
  public startScheduler(intervalMs?: number, tenantId?: string): void {
    if (intervalMs && intervalMs >= 5000) {
      this.pollingIntervalMs = intervalMs;
      this.config.pollingIntervalMs = intervalMs;
    }
    if (tenantId) {
      this.config.tenantId = tenantId;
    }

    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }

    this.schedulerStatus = 'RUNNING';
    this.config.enabled = true;
    this.updateNextRunTimestamp();

    console.log(
      `[ContinuousComplianceEngine] Background Job Scheduler started. Polling every ${this.pollingIntervalMs / 1000}s. Next run: ${this.nextRunTimestamp}`
    );

    // Schedule periodic sweeps
    this.schedulerInterval = setInterval(() => {
      this.executeScheduledSweep(this.config.tenantId);
    }, this.pollingIntervalMs);

    // Also run an initial baseline pass
    setImmediate(() => {
      this.executeScheduledSweep(this.config.tenantId);
    });
  }

  /**
   * Pauses the background job scheduler
   */
  public pauseScheduler(): void {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
    this.schedulerStatus = 'PAUSED';
    this.config.enabled = false;
    this.nextRunTimestamp = null;
    console.log('[ContinuousComplianceEngine] Background Job Scheduler paused.');
  }

  /**
   * Triggers an immediate manual sweep on demand
   */
  public async pollNow(tenantId?: string): Promise<ContinuousComplianceEngineRunLog> {
    const targetTenant = tenantId || this.config.tenantId;
    return await this.executeSweep(targetTenant, 'MANUAL_ON_DEMAND');
  }

  /**
   * Returns complete telemetry and runtime status of the engine and scheduler
   */
  public getStatus(tenantId?: string): ContinuousComplianceEngineStatus {
    const targetTenant = tenantId || this.config.tenantId;
    ensureTenantSeeded(targetTenant);

    const evals = db.evaluations[targetTenant] || [];
    const drifts = db.driftEvents[targetTenant] || [];
    const activeDrifts = drifts.filter(d => d.status !== 'RESOLVED');

    return {
      schedulerStatus: this.schedulerStatus,
      pollingIntervalMs: this.pollingIntervalMs,
      autoDriftDetectionEnabled: this.config.autoDriftDetectionEnabled,
      lastRunTimestamp: this.lastRunTimestamp,
      nextRunTimestamp: this.schedulerStatus === 'RUNNING' ? this.nextRunTimestamp : null,
      totalRunsCount: this.totalRunsCount,
      activeDriftsCount: activeDrifts.length,
      controlsMonitoredCount: evals.length,
      evidenceMonitoredCount: evals.reduce((sum, e) => sum + (e.evidenceIds?.length || 0), 0),
      lastRunLog: this.runLogs.length > 0 ? this.runLogs[0] : null,
      recentLogs: this.runLogs.slice(0, 15)
    };
  }

  /**
   * Updates configuration settings
   */
  public updateConfig(newConfig: Partial<ContinuousComplianceEngineConfig>): ContinuousComplianceEngineConfig {
    this.config = { ...this.config, ...newConfig };

    if (newConfig.pollingIntervalMs && newConfig.pollingIntervalMs !== this.pollingIntervalMs) {
      this.pollingIntervalMs = newConfig.pollingIntervalMs;
      if (this.schedulerStatus === 'RUNNING') {
        this.startScheduler(this.pollingIntervalMs, this.config.tenantId);
      }
    }

    if (newConfig.enabled === false && this.schedulerStatus === 'RUNNING') {
      this.pauseScheduler();
    } else if (newConfig.enabled === true && this.schedulerStatus !== 'RUNNING') {
      this.startScheduler(this.pollingIntervalMs, this.config.tenantId);
    }

    return this.config;
  }

  /**
   * Retrieves log history
   */
  public getLogs(): ContinuousComplianceEngineRunLog[] {
    return this.runLogs;
  }

  public getEvaluationsForTenant(tenantId: string): ContinuousControlEvaluation[] {
    ensureTenantSeeded(tenantId);
    return db.evaluations[tenantId] || [];
  }

  public getDriftEventsForTenant(tenantId: string): ComplianceDriftEvent[] {
    ensureTenantSeeded(tenantId);
    return db.driftEvents[tenantId] || [];
  }

  public getSummaryForTenant(tenantId: string): ContinuousComplianceSummary {
    ensureTenantSeeded(tenantId);
    return calculateSummary(tenantId);
  }

  private updateNextRunTimestamp(): void {
    const nextDate = new Date(Date.now() + this.pollingIntervalMs);
    this.nextRunTimestamp = nextDate.toISOString();
  }

  public async executeScheduledSweep(tenantId: string): Promise<void> {
    if (this.isPolling) {
      console.warn('[ContinuousComplianceEngine] Sweep already in progress, skipping tick.');
      return;
    }
    await this.executeSweep(tenantId, 'SCHEDULED_JOB');
    this.updateNextRunTimestamp();
  }

  /**
   * Core Engine Method:
   * 1. Polls Control Statuses against Automated Tests, Telemetry, and Exceptions
   * 2. Evaluates Evidence Freshness Decay against Statutory Frequencies
   * 3. Detects Compliance Drift & Generates SLA-bound Incident Records
   */
  private async executeSweep(tenantId: string, triggerSource: string): Promise<ContinuousComplianceEngineRunLog> {
    this.isPolling = true;
    const startTime = Date.now();
    const runId = `sweep-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    ensureTenantSeeded(tenantId);

    const evals: ContinuousControlEvaluation[] = db.evaluations[tenantId] || [];
    const tests: AutomatedControlTest[] = db.automatedTests[tenantId] || [];
    const drifts: ComplianceDriftEvent[] = db.driftEvents[tenantId] || [];
    const cert = db.certifications[tenantId];

    let freshCount = 0;
    let agingCount = 0;
    let staleCount = 0;
    let expiredCount = 0;
    let missingCount = 0;
    const newDriftEvents: string[] = [];

    // Map tests by ID and by controlCode for fast lookup
    const testMap = new Map<string, AutomatedControlTest>();
    const testsByControl = new Map<string, AutomatedControlTest[]>();
    tests.forEach(t => {
      testMap.set(t.id, t);
      const list = testsByControl.get(t.controlCode) || [];
      list.push(t);
      testsByControl.set(t.controlCode, list);
    });

    // ------------------------------------------------------------------------
    // Step 1: Poll Control Statuses & Link with Automated Test Telemetry
    // ------------------------------------------------------------------------
    for (const ctrl of evals) {
      if (ctrl.applicabilityStatus !== 'Applicable') continue;

      ctrl.lastEvaluated = now.toISOString();

      // Check linked automated tests
      const linkedTests = testsByControl.get(ctrl.controlCode) || [];
      const hasFailedTest = linkedTests.some(t => t.status === 'FAIL' || t.status === 'ERROR');
      const hasWarningTest = linkedTests.some(t => t.status === 'WARNING');

      // Check active exception expiration
      if (ctrl.hasActiveException && ctrl.exceptionExpiryDate) {
        if (new Date(ctrl.exceptionExpiryDate) < now) {
          ctrl.hasActiveException = false;
          ctrl.overallStatus = 'Remediation Required';
          ctrl.driftDetected = true;
          ctrl.driftReason = `Exception granted on ${ctrl.controlCode} expired on ${ctrl.exceptionExpiryDate}. Full control enforcement now mandatory.`;
        }
      }

      // Check overdue CAPA
      const hasOverdueCapa = ctrl.mappedCapaIds?.includes('CAPA-2024-03'); // Known overdue CAPA
      if (hasOverdueCapa) {
        ctrl.overallStatus = 'Nonconforming';
        ctrl.operatingEffectivenessStatus = 'Ineffective';
        ctrl.driftDetected = true;
        ctrl.driftReason = `Linked corrective action CAPA-2024-03 is overdue for verification sign-off.`;
      }

      // If automated test failed, mark ineffective
      if (hasFailedTest) {
        const failedTest = linkedTests.find(t => t.status === 'FAIL' || t.status === 'ERROR');
        ctrl.overallStatus = 'Ineffective';
        ctrl.operatingEffectivenessStatus = 'Ineffective';
        ctrl.driftDetected = true;
        ctrl.driftReason = `Automated telemetry test "${failedTest?.testName}" failed threshold: ${failedTest?.threshold}. Metric: ${failedTest?.metricValue}`;
      } else if (hasWarningTest && ctrl.overallStatus === 'Effective') {
        ctrl.overallStatus = 'Remediation Required';
        ctrl.driftDetected = true;
        ctrl.driftReason = `Automated telemetry test in WARNING status. Operational buffer eroded.`;
      }

      // ----------------------------------------------------------------------
      // Step 2: Poll Evidence Freshness Decay against Statutory Frequencies
      // ----------------------------------------------------------------------
      const freshness = this.calculateEvidenceFreshness(
        ctrl.lastEvidenceDate,
        ctrl.monitoringFrequency,
        now
      );
      ctrl.evidenceFreshnessStatus = freshness;

      switch (freshness) {
        case 'Fresh':
          freshCount++;
          break;
        case 'Aging':
          agingCount++;
          break;
        case 'Stale':
          staleCount++;
          break;
        case 'Expired':
          expiredCount++;
          if (ctrl.overallStatus === 'Effective') {
            ctrl.overallStatus = 'Evidence Expired';
            ctrl.driftDetected = true;
            ctrl.driftReason = `Audit artifact expired beyond statutory review window for ${ctrl.monitoringFrequency} frequency.`;
          }
          break;
        case 'Missing':
          missingCount++;
          if (ctrl.overallStatus === 'Effective') {
            ctrl.overallStatus = 'Evidence Missing';
            ctrl.driftDetected = true;
            ctrl.driftReason = `No validated operational audit evidence attached for ${ctrl.controlCode}.`;
          }
          break;
      }
    }

    // ------------------------------------------------------------------------
    // Step 3: Detect Compliance Drift & Generate Incident Records
    // ------------------------------------------------------------------------
    if (this.config.autoDriftDetectionEnabled) {
      // 3A. Evidence Decay Drift Detection
      for (const ctrl of evals) {
        if (ctrl.evidenceFreshnessStatus === 'Expired' || ctrl.evidenceFreshnessStatus === 'Missing') {
          const existingOpenDrift = drifts.find(
            d => d.controlCode === ctrl.controlCode &&
                 (d.driftType === 'EVIDENCE_DECAY' || d.driftType === 'POLICY_EXPIRED') &&
                 d.status !== 'RESOLVED'
          );

          if (!existingOpenDrift) {
            const isCoreTechnological = ctrl.category === 'Technological' || ctrl.controlCode.startsWith('Cl.9');
            const severity: DriftSeverity = isCoreTechnological ? 'HIGH' : 'MEDIUM';
            const driftId = `DRIFT-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

            const newDrift: ComplianceDriftEvent = {
              id: driftId,
              tenantId,
              controlCode: ctrl.controlCode,
              controlTitle: `${ctrl.title} (${ctrl.evidenceFreshnessStatus === 'Expired' ? 'Evidence Expired' : 'Evidence Missing'})`,
              severity,
              driftType: 'EVIDENCE_DECAY',
              detectedAt: now.toISOString(),
              rootCause: `Continuous compliance engine detected evidence freshness decay (${ctrl.evidenceFreshnessStatus}) for ${ctrl.controlCode}. Last recorded artifact: ${ctrl.lastEvidenceDate || 'Never'}.`,
              recommendedAction: `Upload refreshed operational telemetry or sign-off audit artifact for ${ctrl.controlCode} to restore surveillance readiness.`,
              assignedOwner: ctrl.controlOwner,
              dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              affectedRiskIds: ctrl.mappedRiskIds || ['risk-01'],
              status: 'OPEN'
            };

            drifts.unshift(newDrift);
            newDriftEvents.push(driftId);

            // Record in audit trail
            this.recordAuditTrail(
              tenantId,
              'DRIFT_DETECTED_EVIDENCE_DECAY',
              `Evidence decay drift ${driftId} generated for ${ctrl.controlCode}: ${ctrl.title}`
            );
          }
        }
      }

      // 3B. Automated Test Failure Drift Detection
      for (const test of tests) {
        if (test.status === 'FAIL' || test.status === 'ERROR') {
          const existingTestDrift = drifts.find(
            d => d.controlCode === test.controlCode &&
                 d.driftType === 'AUTOMATED_TEST_FAILURE' &&
                 d.status !== 'RESOLVED'
          );

          if (!existingTestDrift) {
            const driftId = `DRIFT-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
            const newDrift: ComplianceDriftEvent = {
              id: driftId,
              tenantId,
              controlCode: test.controlCode,
              controlTitle: `${test.testName} (Automated Test Failure)`,
              severity: 'HIGH',
              driftType: 'AUTOMATED_TEST_FAILURE',
              detectedAt: now.toISOString(),
              rootCause: `Automated test "${test.testName}" failed. Metric: ${test.metricValue}. Breach: ${test.failureReason || 'Operational threshold violation'}.`,
              recommendedAction: `Investigate telemetry source (${test.sourceSystem}), rectify operational root cause, and re-execute automated suite.`,
              assignedOwner: test.testOwner,
              dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              affectedRiskIds: ['risk-02', 'risk-04'],
              status: 'OPEN'
            };

            drifts.unshift(newDrift);
            newDriftEvents.push(driftId);

            this.recordAuditTrail(
              tenantId,
              'DRIFT_DETECTED_TEST_FAILURE',
              `Automated test failure drift ${driftId} generated for ${test.controlCode}: ${test.testName}`
            );
          }
        }
      }

      // 3C. Statutory ISO 27001 Cadence Drift (Clause 9.2 Internal Audit & Clause 9.3 Management Review)
      if (cert) {
        const metrics = calculateLifecycleMetrics({
          expiryDate: cert.expiryDate,
          surveillanceYear1Date: cert.surveillanceYear1Date,
          surveillanceYear2Date: cert.surveillanceYear2Date,
          recertificationDate: cert.recertificationDate,
          lastInternalAuditDate: cert.lastInternalAuditDate,
          lastManagementReviewDate: cert.lastManagementReviewDate
        });
        cert.calculatedMetrics = metrics;

        if (metrics.internalAuditOverdue) {
          const existingAuditDrift = drifts.find(
            d => d.controlCode === 'Cl.9.2' && d.status !== 'RESOLVED'
          );
          if (!existingAuditDrift) {
            const driftId = `DRIFT-${now.getFullYear()}-AUD92`;
            drifts.unshift({
              id: driftId,
              tenantId,
              controlCode: 'Cl.9.2',
              controlTitle: 'Clause 9.2 Statutory Annual Internal Audit Overdue',
              severity: 'CRITICAL',
              driftType: 'SCOPE_DRIFT',
              detectedAt: now.toISOString(),
              rootCause: `Days since last internal audit (${metrics.daysSinceInternalAudit}d) exceeds statutory ISO 27001 annual limit (365d).`,
              recommendedAction: 'Convene immediate emergency internal audit cycle and produce signed audit report.',
              assignedOwner: 'Lead Internal Auditor',
              dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              affectedRiskIds: ['risk-01'],
              status: 'OPEN'
            });
            newDriftEvents.push(driftId);
          }
        }

        if (metrics.managementReviewOverdue) {
          const existingMgmtDrift = drifts.find(
            d => d.controlCode === 'Cl.9.3' && d.status !== 'RESOLVED'
          );
          if (!existingMgmtDrift) {
            const driftId = `DRIFT-${now.getFullYear()}-REV93`;
            drifts.unshift({
              id: driftId,
              tenantId,
              controlCode: 'Cl.9.3',
              controlTitle: 'Clause 9.3 Top Management Review Overdue',
              severity: 'HIGH',
              driftType: 'SCOPE_DRIFT',
              detectedAt: now.toISOString(),
              rootCause: `Days since last Management Review (${metrics.daysSinceManagementReview}d) exceeds 365-day statutory threshold.`,
              recommendedAction: 'Schedule Executive ISMS Management Review with CEO & CISO to sign off ISMS performance.',
              assignedOwner: 'CISO / Head of Governance',
              dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              affectedRiskIds: ['risk-01'],
              status: 'OPEN'
            });
            newDriftEvents.push(driftId);
          }
        }
      }
    }

    // Persist all state updates to data store
    persistDb();

    const durationMs = Date.now() - startTime;
    this.lastRunTimestamp = now.toISOString();
    this.totalRunsCount++;

    const runLog: ContinuousComplianceEngineRunLog = {
      runId,
      timestamp: this.lastRunTimestamp,
      durationMs,
      status: newDriftEvents.length > 0 ? 'WARNING' : 'SUCCESS',
      controlsEvaluated: evals.length,
      evidenceFreshnessChecked: evals.length,
      freshCount,
      agingCount,
      staleCount,
      expiredCount,
      missingCount,
      driftsDetected: newDriftEvents.length,
      newDriftEvents,
      automatedTestsChecked: tests.length,
      details: `Sweep completed via ${triggerSource} in ${durationMs}ms. ${evals.length} controls evaluated, ${freshCount} fresh, ${expiredCount} expired, ${newDriftEvents.length} new drifts detected.`
    };

    this.runLogs.unshift(runLog);
    if (this.runLogs.length > this.maxLogsRetention) {
      this.runLogs.pop();
    }

    this.isPolling = false;
    return runLog;
  }

  /**
   * Evaluates evidence freshness decay against standard ISO 27001 audit cadences
   */
  private calculateEvidenceFreshness(
    lastEvidenceDate: string | null,
    frequency: MonitoringFrequency,
    now: Date
  ): EvidenceFreshnessRating {
    if (!lastEvidenceDate) {
      return 'Missing';
    }

    const evidenceTime = new Date(lastEvidenceDate).getTime();
    if (isNaN(evidenceTime)) {
      return 'Missing';
    }

    const elapsedDays = Math.max(0, Math.floor((now.getTime() - evidenceTime) / (1000 * 60 * 60 * 24)));

    // Statutory Freshness Matrix
    switch (frequency) {
      case 'Continuous':
        if (elapsedDays <= 2) return 'Fresh';
        if (elapsedDays <= 5) return 'Aging';
        if (elapsedDays <= 10) return 'Stale';
        return 'Expired';

      case 'Daily':
        if (elapsedDays <= 2) return 'Fresh';
        if (elapsedDays <= 4) return 'Aging';
        if (elapsedDays <= 7) return 'Stale';
        return 'Expired';

      case 'Weekly':
        if (elapsedDays <= 10) return 'Fresh';
        if (elapsedDays <= 18) return 'Aging';
        if (elapsedDays <= 30) return 'Stale';
        return 'Expired';

      case 'Monthly':
        if (elapsedDays <= 35) return 'Fresh';
        if (elapsedDays <= 50) return 'Aging';
        if (elapsedDays <= 75) return 'Stale';
        return 'Expired';

      case 'Quarterly':
        if (elapsedDays <= 100) return 'Fresh';
        if (elapsedDays <= 130) return 'Aging';
        if (elapsedDays <= 180) return 'Stale';
        return 'Expired';

      case 'Bi-Annual':
        if (elapsedDays <= 200) return 'Fresh';
        if (elapsedDays <= 240) return 'Aging';
        if (elapsedDays <= 300) return 'Stale';
        return 'Expired';

      case 'Annual':
        if (elapsedDays <= 380) return 'Fresh';
        if (elapsedDays <= 420) return 'Aging';
        if (elapsedDays <= 500) return 'Stale';
        return 'Expired';

      case 'Event-Driven':
      default:
        if (elapsedDays <= 90) return 'Fresh';
        if (elapsedDays <= 180) return 'Aging';
        if (elapsedDays <= 365) return 'Stale';
        return 'Expired';
    }
  }

  private recordAuditTrail(tenantId: string, action: string, details: string): void {
    if (!db.auditTrail[tenantId]) {
      db.auditTrail[tenantId] = [];
    }

    const entry = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      action,
      actor: 'ContinuousComplianceEngine Daemon',
      details,
      sha256: crypto.createHash('sha256').update(`${action}:${details}:${Date.now()}`).digest('hex')
    };

    db.auditTrail[tenantId].unshift(entry);
    if (db.auditTrail[tenantId].length > 100) {
      db.auditTrail[tenantId].pop();
    }
  }
}

// Export singleton instance
export const continuousComplianceEngine = new ContinuousComplianceEngine();
