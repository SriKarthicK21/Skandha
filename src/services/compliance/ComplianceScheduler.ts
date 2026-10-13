// ============================================================================
// SKANDA GRC — Compliance Scheduler Utility
// Path: src/services/compliance/ComplianceScheduler.ts
//
// Enterprise scheduler wrapping the ContinuousComplianceEngine to automate:
// 1. Scheduled interval-based execution loops and CRON-style schedules
// 2. Continuous control status polling across active frameworks (ISO 27001, MAS TRM)
// 3. Mathematical evidence freshness decay verification & SLA tracking
// 4. Automated compliance drift detection events and alerting
// 5. Circuit-breaker resilience, overlap prevention, and execution history ledger
// ============================================================================

import {
  ContinuousComplianceEngine,
  continuousComplianceEngine,
  EvaluationSweepResult,
  ControlStatusPollingResult,
  EvidenceFreshnessVerificationReport,
  DriftDetectionResult,
  BackendJobSchedulerInterface
} from './ContinuousComplianceEngine';

import {
  ComplianceDriftEvent,
  ContinuousControlEvaluation,
  ContinuousComplianceEngineRunLog
} from '../../types/continuousCompliance';

// ----------------------------------------------------------------------------
// Types & Contracts
// ----------------------------------------------------------------------------

export type SchedulerScheduleMode = 'INTERVAL' | 'CRON';

export type SchedulerOperationalState =
  | 'STOPPED'
  | 'RUNNING'
  | 'PAUSED'
  | 'EXECUTING'
  | 'CIRCUIT_BROKEN';

export interface CronScheduleDescriptor {
  expression: string;
  description: string;
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

export interface ComplianceSchedulerConfig {
  /** Unique tenant identifier */
  tenantId: string;
  /** Operational schedule mode: INTERVAL (fixed ms) or CRON (cron expression) */
  mode: SchedulerScheduleMode;
  /** Interval in milliseconds when mode is 'INTERVAL'. Default: 30,000ms (30 seconds) */
  intervalMs: number;
  /** Standard 5-field CRON expression or human preset (e.g., '0 * * * *', '@hourly', '@daily', every 5 mins) */
  cronExpression?: string;
  /** Automatically poll control operating effectiveness. Default: true */
  autoPollControls: boolean;
  /** Verify evidence decay curves and SLA expiration. Default: true */
  verifyEvidenceFreshness: boolean;
  /** Trigger compliance drift events and notifications on decay/failure. Default: true */
  triggerDriftEvents: boolean;
  /** Number of consecutive failures before triggering circuit breaker. Default: 5 */
  maxConsecutiveErrors: number;
  /** Automatically attempt retry on transient execution errors with backoff. Default: true */
  retryOnFailure: boolean;
  /** Max retries per tick before logging error. Default: 2 */
  maxRetries: number;
  /** Prevent overlapping executions if sweep takes longer than schedule cadence. Default: true */
  preventOverlap: boolean;
  /** Max history ledger records retained in memory. Default: 100 */
  maxHistoryLedgerSize: number;
}

export interface SchedulerExecutionRecord {
  runId: string;
  tenantId: string;
  triggerSource: 'SCHEDULED_INTERVAL' | 'SCHEDULED_CRON' | 'MANUAL_ON_DEMAND' | 'RETRY_ATTEMPT';
  startTime: string;
  endTime: string;
  durationMs: number;
  status: 'SUCCESS' | 'WARNING' | 'FAILED' | 'SKIPPED';
  controlsEvaluated: number;
  effectiveControls: number;
  ineffectiveControls: number;
  evidenceChecked: number;
  freshEvidence: number;
  staleOrExpiredEvidence: number;
  newDriftsDetected: number;
  newDriftEventIds: string[];
  error?: string;
}

export interface ComplianceSchedulerStatus {
  state: SchedulerOperationalState;
  tenantId: string;
  mode: SchedulerScheduleMode;
  intervalMs: number;
  cronExpression?: string;
  cronDescription?: string;
  isExecuting: boolean;
  isCircuitBroken: boolean;
  consecutiveErrors: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  skippedExecutions: number;
  totalDriftsReported: number;
  averageDurationMs: number;
  uptimeSeconds: number;
  startedAt: string | null;
  lastExecutionTime: string | null;
  lastExecutionStatus: 'SUCCESS' | 'WARNING' | 'FAILED' | 'SKIPPED' | null;
  nextExecutionTime: string | null;
  lastError: string | null;
}

// Observer Listener Types
export type SchedulerTickListener = (tenantId: string, timestamp: string) => void;
export type SchedulerSweepSuccessListener = (result: EvaluationSweepResult, record: SchedulerExecutionRecord) => void;
export type SchedulerDriftAlertListener = (newDrifts: ComplianceDriftEvent[], record: SchedulerExecutionRecord) => void;
export type SchedulerErrorListener = (error: Error, record?: SchedulerExecutionRecord) => void;
export type SchedulerStatusChangeListener = (status: ComplianceSchedulerStatus) => void;

// ----------------------------------------------------------------------------
// Lightweight CRON Parser & Evaluator (Zero-dependency, Enterprise-safe)
// ----------------------------------------------------------------------------

export class CronExpressionHelper {
  private static readonly PRESETS: Record<string, string> = {
    '@every_30s': '*/30 * * * * *', // 30 seconds (sub-minute handled via interval)
    '@every_1m': '* * * * *',       // every minute
    '@every_5m': '*/5 * * * *',     // every 5 minutes
    '@every_15m': '*/15 * * * *',   // every 15 minutes
    '@every_30m': '*/30 * * * *',   // every 30 minutes
    '@hourly': '0 * * * *',         // top of every hour
    '@daily': '0 0 * * *',          // midnight daily
    '@midnight': '0 0 * * *',       // midnight daily
    '@weekly': '0 0 * * 0',         // Sunday midnight
    '@monthly': '0 0 1 * *'         // 1st of month midnight
  };

  /**
   * Normalizes and validates a CRON expression or preset.
   */
  public static normalize(expression: string): string {
    const trimmed = expression.trim();
    if (this.PRESETS[trimmed]) {
      return this.PRESETS[trimmed];
    }
    return trimmed;
  }

  /**
   * Parses a standard 5-part cron string: minute hour dayOfMonth month dayOfWeek
   */
  public static parse(rawExpression: string): CronScheduleDescriptor {
    const expression = this.normalize(rawExpression);
    const parts = expression.split(/\s+/);

    if (parts.length !== 5) {
      throw new Error(
        `Invalid CRON expression "${rawExpression}". Expected 5 fields: minute (0-59), hour (0-23), dayOfMonth (1-31), month (1-12), dayOfWeek (0-6).`
      );
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    const description = this.generateDescription(parts);

    return {
      expression,
      description,
      minute,
      hour,
      dayOfMonth,
      month,
      dayOfWeek
    };
  }

  /**
   * Evaluates if a given Date matches the parsed cron fields.
   */
  public static matches(parsed: CronScheduleDescriptor, date: Date): boolean {
    const m = date.getMinutes();
    const h = date.getHours();
    const dom = date.getDate();
    const mon = date.getMonth() + 1; // 1-12
    const dow = date.getDay();       // 0-6 (Sun = 0)

    return (
      this.fieldMatches(parsed.minute, m, 0, 59) &&
      this.fieldMatches(parsed.hour, h, 0, 23) &&
      this.fieldMatches(parsed.dayOfMonth, dom, 1, 31) &&
      this.fieldMatches(parsed.month, mon, 1, 12) &&
      this.fieldMatches(parsed.dayOfWeek, dow, 0, 6)
    );
  }

  /**
   * Computes the next execution Date matching the CRON expression.
   */
  public static getNextDate(parsed: CronScheduleDescriptor, fromDate: Date = new Date()): Date {
    // Clone and advance by 1 minute, zeroing seconds and ms
    const next = new Date(fromDate.getTime());
    next.setSeconds(0, 0);
    next.setMinutes(next.getMinutes() + 1);

    // Look ahead up to 366 days (527,040 minutes) to prevent infinite loops
    const maxMinutes = 527040;
    let minutesChecked = 0;

    while (minutesChecked < maxMinutes) {
      if (this.matches(parsed, next)) {
        return next;
      }
      next.setMinutes(next.getMinutes() + 1);
      minutesChecked++;
    }

    // Fallback: 1 hour from now if unresolvable
    return new Date(fromDate.getTime() + 3600000);
  }

  private static fieldMatches(pattern: string, value: number, min: number, max: number): boolean {
    if (pattern === '*') return true;

    // Step values: */5, 1-30/5
    if (pattern.includes('/')) {
      const [rangePart, stepStr] = pattern.split('/');
      const step = parseInt(stepStr, 10);
      if (isNaN(step) || step <= 0) return false;

      let start = min;
      let end = max;
      if (rangePart !== '*') {
        if (rangePart.includes('-')) {
          const [rStart, rEnd] = rangePart.split('-').map(s => parseInt(s, 10));
          start = rStart;
          end = rEnd;
        } else {
          start = parseInt(rangePart, 10);
        }
      }

      if (value < start || value > end) return false;
      return (value - start) % step === 0;
    }

    // List values: 1,2,5,10
    if (pattern.includes(',')) {
      const parts = pattern.split(',').map(s => parseInt(s.trim(), 10));
      return parts.includes(value);
    }

    // Range values: 1-5
    if (pattern.includes('-')) {
      const [start, end] = pattern.split('-').map(s => parseInt(s.trim(), 10));
      return value >= start && value <= end;
    }

    // Exact value
    const exact = parseInt(pattern, 10);
    return !isNaN(exact) && exact === value;
  }

  private static generateDescription(parts: string[]): string {
    const [min, hour, dom, mon, dow] = parts;
    if (min === '*' && hour === '*' && dom === '*' && mon === '*' && dow === '*') {
      return 'Every minute';
    }
    if (min.startsWith('*/') && hour === '*' && dom === '*' && mon === '*' && dow === '*') {
      return `Every ${min.replace('*/', '')} minutes`;
    }
    if (min === '0' && hour === '*' && dom === '*' && mon === '*' && dow === '*') {
      return 'Hourly at the start of the hour';
    }
    if (min === '0' && hour === '0' && dom === '*' && mon === '*' && dow === '*') {
      return 'Daily at midnight (00:00)';
    }
    if (min === '0' && hour === '0' && dom === '*' && mon === '*' && dow === '0') {
      return 'Weekly on Sunday at midnight (00:00)';
    }
    return `CRON (${parts.join(' ')})`;
  }
}

// ----------------------------------------------------------------------------
// ComplianceScheduler Class
// ----------------------------------------------------------------------------

export class ComplianceScheduler implements BackendJobSchedulerInterface {
  private static instance: ComplianceScheduler | null = null;

  // Engine dependency
  private engine: ContinuousComplianceEngine;

  // Configuration
  private config: ComplianceSchedulerConfig = {
    tenantId: 'tenant-acme',
    mode: 'INTERVAL',
    intervalMs: 30000, // 30s default
    cronExpression: '*/5 * * * *', // 5m default for cron mode
    autoPollControls: true,
    verifyEvidenceFreshness: true,
    triggerDriftEvents: true,
    maxConsecutiveErrors: 5,
    retryOnFailure: true,
    maxRetries: 2,
    preventOverlap: true,
    maxHistoryLedgerSize: 100
  };

  // Operational State
  private operationalState: SchedulerOperationalState = 'STOPPED';
  private timerRef: any = null;
  private isExecutingSweep: boolean = false;
  private startedAtTime: number | null = null;
  private lastExecutionTimestamp: string | null = null;
  private lastExecutionStatus: 'SUCCESS' | 'WARNING' | 'FAILED' | 'SKIPPED' | null = null;
  private nextExecutionTimestamp: string | null = null;
  private consecutiveErrorCount: number = 0;
  private lastErrorMessage: string | null = null;

  // Aggregate Metrics
  private totalExecutionsCount: number = 0;
  private successfulExecutionsCount: number = 0;
  private failedExecutionsCount: number = 0;
  private skippedExecutionsCount: number = 0;
  private totalDriftsReportedCount: number = 0;
  private cumulativeDurationMs: number = 0;

  // History Ledger
  private executionHistory: SchedulerExecutionRecord[] = [];

  // Observers
  private tickListeners: Set<SchedulerTickListener> = new Set();
  private sweepSuccessListeners: Set<SchedulerSweepSuccessListener> = new Set();
  private driftAlertListeners: Set<SchedulerDriftAlertListener> = new Set();
  private errorListeners: Set<SchedulerErrorListener> = new Set();
  private statusListeners: Set<SchedulerStatusChangeListener> = new Set();

  // Registered Backend Jobs (implements BackendJobSchedulerInterface)
  private registeredBackendJobs: Map<string, { intervalMs: number; onTick: () => Promise<void>; timer: any }> = new Map();

  constructor(
    customEngine: ContinuousComplianceEngine = continuousComplianceEngine,
    initialConfig?: Partial<ComplianceSchedulerConfig>
  ) {
    this.engine = customEngine;
    if (initialConfig) {
      this.config = { ...this.config, ...initialConfig };
    }
  }

  /**
   * Singleton instance accessor
   */
  public static getInstance(engine?: ContinuousComplianceEngine): ComplianceScheduler {
    if (!ComplianceScheduler.instance) {
      ComplianceScheduler.instance = new ComplianceScheduler(engine);
    }
    return ComplianceScheduler.instance;
  }

  // ==========================================================================
  // Lifecycle Control: Start, Stop, Pause, Resume
  // ==========================================================================

  /**
   * Starts the automated compliance scheduler loop.
   */
  public start(options?: Partial<ComplianceSchedulerConfig>): ComplianceSchedulerStatus {
    if (options) {
      this.configure(options);
    }

    if (this.operationalState === 'RUNNING') {
      console.log(`[ComplianceScheduler] Already running for tenant: ${this.config.tenantId}`);
      return this.getStatus();
    }

    this.operationalState = 'RUNNING';
    this.startedAtTime = Date.now();
    this.consecutiveErrorCount = 0;
    this.lastErrorMessage = null;

    console.log(
      `[ComplianceScheduler] Started in ${this.config.mode} mode for tenant: ${this.config.tenantId} ` +
      `(${this.config.mode === 'INTERVAL' ? `${this.config.intervalMs}ms` : this.config.cronExpression})`
    );

    this.scheduleNextTick();
    this.emitStatusChange();
    return this.getStatus();
  }

  /**
   * Stops the automated compliance scheduler loop and clears any active timers.
   */
  public stop(): ComplianceSchedulerStatus {
    this.clearTimer();
    this.operationalState = 'STOPPED';
    this.nextExecutionTimestamp = null;

    console.log(`[ComplianceScheduler] Stopped for tenant: ${this.config.tenantId}`);
    this.emitStatusChange();
    return this.getStatus();
  }

  /**
   * Pauses the automated execution loop without clearing run statistics or history.
   */
  public pause(): ComplianceSchedulerStatus {
    if (this.operationalState !== 'RUNNING') {
      return this.getStatus();
    }

    this.clearTimer();
    this.operationalState = 'PAUSED';
    this.nextExecutionTimestamp = null;

    console.log(`[ComplianceScheduler] Paused for tenant: ${this.config.tenantId}`);
    this.emitStatusChange();
    return this.getStatus();
  }

  /**
   * Resumes execution after pause or after a manual reset from circuit-broken state.
   */
  public resume(): ComplianceSchedulerStatus {
    if (this.operationalState !== 'PAUSED' && this.operationalState !== 'CIRCUIT_BROKEN') {
      return this.getStatus();
    }

    this.operationalState = 'RUNNING';
    this.consecutiveErrorCount = 0;
    this.lastErrorMessage = null;

    console.log(`[ComplianceScheduler] Resumed for tenant: ${this.config.tenantId}`);
    this.scheduleNextTick();
    this.emitStatusChange();
    return this.getStatus();
  }

  /**
   * Updates configuration properties.
   */
  public configure(newConfig: Partial<ComplianceSchedulerConfig>): ComplianceSchedulerStatus {
    const wasRunning = this.operationalState === 'RUNNING';
    this.config = { ...this.config, ...newConfig };

    // If timing or mode changed while running, reschedule immediately
    if (wasRunning) {
      this.clearTimer();
      this.scheduleNextTick();
    }

    this.emitStatusChange();
    return this.getStatus();
  }

  /**
   * Dynamically updates schedule cadence. Accepts either a numeric interval in ms
   * or a CRON expression string.
   */
  public updateSchedule(schedule: number | string): ComplianceSchedulerStatus {
    if (typeof schedule === 'number') {
      if (schedule < 5000) {
        throw new Error('Minimum scheduling interval is 5000ms (5 seconds) to prevent DDoS or thrashing.');
      }
      return this.configure({
        mode: 'INTERVAL',
        intervalMs: schedule
      });
    } else if (typeof schedule === 'string') {
      // Validate cron expression
      CronExpressionHelper.parse(schedule);
      return this.configure({
        mode: 'CRON',
        cronExpression: schedule
      });
    } else {
      throw new Error('Invalid schedule argument. Provide milliseconds (number) or CRON expression (string).');
    }
  }

  // ==========================================================================
  // Execution Triggers: Immediate On-Demand, Targeted Polling & Decay Checks
  // ==========================================================================

  /**
   * Triggers an immediate full continuous compliance evaluation sweep
   * without interrupting scheduled cadence.
   */
  public async triggerImmediateSweep(
    source: 'MANUAL_ON_DEMAND' | 'SCHEDULED_INTERVAL' | 'SCHEDULED_CRON' | 'RETRY_ATTEMPT' = 'MANUAL_ON_DEMAND'
  ): Promise<SchedulerExecutionRecord> {
    return await this.executeSweep(source);
  }

  /**
   * Targeted action: Polls and returns only the operational control statuses.
   */
  public async pollControlsOnly(tenantId: string = this.config.tenantId): Promise<ControlStatusPollingResult> {
    return await this.engine.pollControlStatuses(tenantId);
  }

  /**
   * Targeted action: Verifies and returns only the evidence freshness decay report.
   */
  public async verifyFreshnessOnly(
    tenantId: string = this.config.tenantId,
    controls?: ContinuousControlEvaluation[]
  ): Promise<EvidenceFreshnessVerificationReport> {
    return await this.engine.verifyEvidenceFreshness(tenantId, controls);
  }

  /**
   * Targeted action: Evaluates active compliance drift events.
   */
  public async detectDriftEventsOnly(
    tenantId: string = this.config.tenantId
  ): Promise<DriftDetectionResult> {
    return await this.engine.triggerDriftDetectionEvents(tenantId);
  }

  // ==========================================================================
  // Core Execution Loop & Circuit Breaker Logic
  // ==========================================================================

  /**
   * Schedules the next timer execution based on configured mode (INTERVAL vs CRON).
   */
  private scheduleNextTick(): void {
    if (this.operationalState !== 'RUNNING') {
      return;
    }

    this.clearTimer();

    let delayMs = 30000;
    const now = new Date();

    if (this.config.mode === 'INTERVAL') {
      delayMs = Math.max(5000, this.config.intervalMs);
      const nextDate = new Date(now.getTime() + delayMs);
      this.nextExecutionTimestamp = nextDate.toISOString();
    } else {
      try {
        const cronStr = this.config.cronExpression || '*/5 * * * *';
        const parsed = CronExpressionHelper.parse(cronStr);
        const nextDate = CronExpressionHelper.getNextDate(parsed, now);
        delayMs = Math.max(1000, nextDate.getTime() - now.getTime());
        this.nextExecutionTimestamp = nextDate.toISOString();
      } catch (err) {
        console.error(`[ComplianceScheduler] Failed to parse CRON expression "${this.config.cronExpression}". Falling back to 60s:`, err);
        delayMs = 60000;
        this.nextExecutionTimestamp = new Date(now.getTime() + delayMs).toISOString();
      }
    }

    this.timerRef = setTimeout(async () => {
      await this.onScheduledTick();
    }, delayMs);
  }

  /**
   * Fired when the scheduled timer trips.
   */
  private async onScheduledTick(): Promise<void> {
    if (this.operationalState !== 'RUNNING') {
      return;
    }

    // Overlap prevention
    if (this.config.preventOverlap && this.isExecutingSweep) {
      console.warn(`[ComplianceScheduler] Previous sweep still running for tenant ${this.config.tenantId}. Skipping scheduled tick.`);
      this.skippedExecutionsCount++;
      this.recordSkippedExecution();
      this.scheduleNextTick();
      return;
    }

    const triggerSource = this.config.mode === 'CRON' ? 'SCHEDULED_CRON' : 'SCHEDULED_INTERVAL';

    try {
      await this.executeSweep(triggerSource);
    } catch (err) {
      console.error(`[ComplianceScheduler] Scheduled tick execution failed:`, err);
    } finally {
      // Re-arm next schedule if still running
      if (this.operationalState === 'RUNNING') {
        this.scheduleNextTick();
      }
    }
  }

  /**
   * Primary evaluation worker. Executes control evaluation, freshness verification,
   * drift detection, and records execution audit metrics.
   */
  private async executeSweep(
    triggerSource: 'SCHEDULED_INTERVAL' | 'SCHEDULED_CRON' | 'MANUAL_ON_DEMAND' | 'RETRY_ATTEMPT'
  ): Promise<SchedulerExecutionRecord> {
    const startTimeMs = Date.now();
    const startTimeStr = new Date(startTimeMs).toISOString();
    const runId = `sched-${startTimeMs}-${Math.floor(Math.random() * 1000)}`;

    this.isExecutingSweep = true;
    this.emitTick(this.config.tenantId, startTimeStr);

    let retryCount = 0;
    let sweepResult: EvaluationSweepResult | null = null;
    let lastError: Error | null = null;

    // Retry loop
    while (retryCount <= (this.config.retryOnFailure ? this.config.maxRetries : 0)) {
      try {
        const engineTriggerSource =
          triggerSource === 'MANUAL_ON_DEMAND' ? 'MANUAL_ON_DEMAND' : 'SCHEDULED_JOB';

        sweepResult = await this.engine.executeEvaluationSweep(
          this.config.tenantId,
          engineTriggerSource
        );
        break; // Success
      } catch (err: any) {
        lastError = err;
        retryCount++;
        if (retryCount <= (this.config.retryOnFailure ? this.config.maxRetries : 0)) {
          const backoffMs = Math.min(5000, 1000 * Math.pow(2, retryCount - 1));
          console.warn(
            `[ComplianceScheduler] Sweep attempt ${retryCount} failed. Retrying in ${backoffMs}ms...`,
            err?.message || err
          );
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
      }
    }

    const endTimeMs = Date.now();
    const durationMs = endTimeMs - startTimeMs;
    this.isExecutingSweep = false;

    // Handle failure
    if (!sweepResult || lastError) {
      this.consecutiveErrorCount++;
      this.failedExecutionsCount++;
      this.totalExecutionsCount++;
      this.lastExecutionTimestamp = new Date(endTimeMs).toISOString();
      this.lastExecutionStatus = 'FAILED';
      this.lastErrorMessage = lastError?.message || 'Unknown evaluation failure';

      const failedRecord: SchedulerExecutionRecord = {
        runId,
        tenantId: this.config.tenantId,
        triggerSource,
        startTime: startTimeStr,
        endTime: new Date(endTimeMs).toISOString(),
        durationMs,
        status: 'FAILED',
        controlsEvaluated: 0,
        effectiveControls: 0,
        ineffectiveControls: 0,
        evidenceChecked: 0,
        freshEvidence: 0,
        staleOrExpiredEvidence: 0,
        newDriftsDetected: 0,
        newDriftEventIds: [],
        error: this.lastErrorMessage
      };

      this.addExecutionRecord(failedRecord);
      this.emitError(lastError || new Error(this.lastErrorMessage), failedRecord);

      // Check Circuit Breaker threshold
      if (this.consecutiveErrorCount >= this.config.maxConsecutiveErrors) {
        this.tripCircuitBreaker();
      }

      this.emitStatusChange();
      return failedRecord;
    }

    // Handle Success
    this.consecutiveErrorCount = 0;
    this.lastErrorMessage = null;
    this.successfulExecutionsCount++;
    this.totalExecutionsCount++;
    this.cumulativeDurationMs += durationMs;
    this.lastExecutionTimestamp = new Date(endTimeMs).toISOString();

    const newDrifts = sweepResult.driftResult.newDriftEvents;
    const hasDrifts = newDrifts.length > 0;
    this.totalDriftsReportedCount += newDrifts.length;
    this.lastExecutionStatus = hasDrifts ? 'WARNING' : 'SUCCESS';

    const successRecord: SchedulerExecutionRecord = {
      runId,
      tenantId: this.config.tenantId,
      triggerSource,
      startTime: startTimeStr,
      endTime: new Date(endTimeMs).toISOString(),
      durationMs,
      status: hasDrifts ? 'WARNING' : 'SUCCESS',
      controlsEvaluated: sweepResult.pollingResult.totalControls,
      effectiveControls: sweepResult.pollingResult.effectiveCount,
      ineffectiveControls: sweepResult.pollingResult.ineffectiveCount,
      evidenceChecked: sweepResult.freshnessReport.totalEvidenceCount,
      freshEvidence: sweepResult.freshnessReport.freshCount,
      staleOrExpiredEvidence:
        sweepResult.freshnessReport.staleCount + sweepResult.freshnessReport.expiredCount,
      newDriftsDetected: newDrifts.length,
      newDriftEventIds: newDrifts.map(d => d.id)
    };

    this.addExecutionRecord(successRecord);

    // Notify listeners
    this.emitSweepSuccess(sweepResult, successRecord);
    if (hasDrifts && this.config.triggerDriftEvents) {
      this.emitDriftAlert(newDrifts, successRecord);
    }

    this.emitStatusChange();
    return successRecord;
  }

  /**
   * Trips the circuit breaker when error thresholds are exceeded.
   */
  private tripCircuitBreaker(): void {
    this.operationalState = 'CIRCUIT_BROKEN';
    this.clearTimer();
    this.nextExecutionTimestamp = null;
    console.error(
      `[ComplianceScheduler] CIRCUIT BREAKER TRIPPED for tenant ${this.config.tenantId} ` +
      `after ${this.consecutiveErrorCount} consecutive failures. Halting automated execution loop.`
    );
  }

  /**
   * Resets the circuit breaker and resumes normal scheduled operation.
   */
  public resetCircuitBreaker(): ComplianceSchedulerStatus {
    console.log(`[ComplianceScheduler] Circuit breaker manually reset for tenant ${this.config.tenantId}.`);
    this.consecutiveErrorCount = 0;
    this.lastErrorMessage = null;
    return this.resume();
  }

  // ==========================================================================
  // Status, History & Metrics Introspection
  // ==========================================================================

  /**
   * Returns a comprehensive snapshot of the scheduler's current state and telemetry.
   */
  public getStatus(): ComplianceSchedulerStatus {
    const avgDuration =
      this.successfulExecutionsCount > 0
        ? Math.round(this.cumulativeDurationMs / this.successfulExecutionsCount)
        : 0;

    const uptimeSeconds =
      this.startedAtTime && (this.operationalState === 'RUNNING' || this.operationalState === 'EXECUTING')
        ? Math.floor((Date.now() - this.startedAtTime) / 1000)
        : 0;

    let cronDescription: string | undefined;
    if (this.config.mode === 'CRON' && this.config.cronExpression) {
      try {
        const parsed = CronExpressionHelper.parse(this.config.cronExpression);
        cronDescription = parsed.description;
      } catch {
        cronDescription = 'Invalid CRON expression';
      }
    }

    return {
      state: this.operationalState,
      tenantId: this.config.tenantId,
      mode: this.config.mode,
      intervalMs: this.config.intervalMs,
      cronExpression: this.config.cronExpression,
      cronDescription,
      isExecuting: this.isExecutingSweep,
      isCircuitBroken: this.operationalState === 'CIRCUIT_BROKEN',
      consecutiveErrors: this.consecutiveErrorCount,
      totalExecutions: this.totalExecutionsCount,
      successfulExecutions: this.successfulExecutionsCount,
      failedExecutions: this.failedExecutionsCount,
      skippedExecutions: this.skippedExecutionsCount,
      totalDriftsReported: this.totalDriftsReportedCount,
      averageDurationMs: avgDuration,
      uptimeSeconds,
      startedAt: this.startedAtTime ? new Date(this.startedAtTime).toISOString() : null,
      lastExecutionTime: this.lastExecutionTimestamp,
      lastExecutionStatus: this.lastExecutionStatus,
      nextExecutionTime: this.nextExecutionTimestamp,
      lastError: this.lastErrorMessage
    };
  }

  /**
   * Returns the audit ledger of past execution records.
   */
  public getExecutionHistory(limit?: number): SchedulerExecutionRecord[] {
    const records = [...this.executionHistory].reverse();
    return limit ? records.slice(0, limit) : records;
  }

  /**
   * Clears the in-memory execution history ledger.
   */
  public clearExecutionHistory(): void {
    this.executionHistory = [];
  }

  /**
   * Gets current configuration.
   */
  public getConfig(): Readonly<ComplianceSchedulerConfig> {
    return { ...this.config };
  }

  // ==========================================================================
  // BackendJobSchedulerInterface Implementation (for external worker integration)
  // ==========================================================================

  public scheduleJob(jobName: string, intervalMs: number, onTick: () => Promise<void>): void {
    this.cancelJob(jobName);

    const timer = setInterval(async () => {
      try {
        await onTick();
      } catch (err) {
        console.error(`[ComplianceScheduler] Error in registered job "${jobName}":`, err);
      }
    }, Math.max(1000, intervalMs));

    this.registeredBackendJobs.set(jobName, { intervalMs, onTick, timer });
    console.log(`[ComplianceScheduler] Registered external backend job: ${jobName} (${intervalMs}ms)`);
  }

  public cancelJob(jobName: string): void {
    const existing = this.registeredBackendJobs.get(jobName);
    if (existing) {
      clearInterval(existing.timer);
      this.registeredBackendJobs.delete(jobName);
      console.log(`[ComplianceScheduler] Cancelled external backend job: ${jobName}`);
    }
  }

  public isJobScheduled(jobName: string): boolean {
    return this.registeredBackendJobs.has(jobName);
  }

  // ==========================================================================
  // Observer Subscription Methods
  // ==========================================================================

  public onTick(listener: SchedulerTickListener): () => void {
    this.tickListeners.add(listener);
    return () => this.tickListeners.delete(listener);
  }

  public onSweepSuccess(listener: SchedulerSweepSuccessListener): () => void {
    this.sweepSuccessListeners.add(listener);
    return () => this.sweepSuccessListeners.delete(listener);
  }

  public onDriftAlert(listener: SchedulerDriftAlertListener): () => void {
    this.driftAlertListeners.add(listener);
    return () => this.driftAlertListeners.delete(listener);
  }

  public onError(listener: SchedulerErrorListener): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  public onStatusChange(listener: SchedulerStatusChangeListener): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  // ==========================================================================
  // Internal Helpers
  // ==========================================================================

  private clearTimer(): void {
    if (this.timerRef) {
      clearTimeout(this.timerRef);
      this.timerRef = null;
    }
  }

  private addExecutionRecord(record: SchedulerExecutionRecord): void {
    this.executionHistory.push(record);
    if (this.executionHistory.length > this.config.maxHistoryLedgerSize) {
      this.executionHistory.shift();
    }
  }

  private recordSkippedExecution(): void {
    const record: SchedulerExecutionRecord = {
      runId: `skipped-${Date.now()}`,
      tenantId: this.config.tenantId,
      triggerSource: this.config.mode === 'CRON' ? 'SCHEDULED_CRON' : 'SCHEDULED_INTERVAL',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      durationMs: 0,
      status: 'SKIPPED',
      controlsEvaluated: 0,
      effectiveControls: 0,
      ineffectiveControls: 0,
      evidenceChecked: 0,
      freshEvidence: 0,
      staleOrExpiredEvidence: 0,
      newDriftsDetected: 0,
      newDriftEventIds: [],
      error: 'Skipped due to overlapping previous execution'
    };
    this.addExecutionRecord(record);
  }

  private emitTick(tenantId: string, timestamp: string): void {
    this.tickListeners.forEach(fn => {
      try {
        fn(tenantId, timestamp);
      } catch (e) {
        console.error('[ComplianceScheduler] Error in tick listener:', e);
      }
    });
  }

  private emitSweepSuccess(result: EvaluationSweepResult, record: SchedulerExecutionRecord): void {
    this.sweepSuccessListeners.forEach(fn => {
      try {
        fn(result, record);
      } catch (e) {
        console.error('[ComplianceScheduler] Error in sweep success listener:', e);
      }
    });
  }

  private emitDriftAlert(drifts: ComplianceDriftEvent[], record: SchedulerExecutionRecord): void {
    this.driftAlertListeners.forEach(fn => {
      try {
        fn(drifts, record);
      } catch (e) {
        console.error('[ComplianceScheduler] Error in drift alert listener:', e);
      }
    });
  }

  private emitError(error: Error, record?: SchedulerExecutionRecord): void {
    this.errorListeners.forEach(fn => {
      try {
        fn(error, record);
      } catch (e) {
        console.error('[ComplianceScheduler] Error in error listener:', e);
      }
    });
  }

  private emitStatusChange(): void {
    const status = this.getStatus();
    this.statusListeners.forEach(fn => {
      try {
        fn(status);
      } catch (e) {
        console.error('[ComplianceScheduler] Error in status change listener:', e);
      }
    });
  }
}

// ----------------------------------------------------------------------------
// Multi-Tenant Compliance Scheduler Registry
// ----------------------------------------------------------------------------

export class ComplianceSchedulerRegistry {
  private static registry: Map<string, ComplianceScheduler> = new Map();

  /**
   * Retrieves or instantiates a ComplianceScheduler for a given tenant.
   */
  public static forTenant(
    tenantId: string,
    initialConfig?: Partial<ComplianceSchedulerConfig>,
    engine: ContinuousComplianceEngine = continuousComplianceEngine
  ): ComplianceScheduler {
    if (!this.registry.has(tenantId)) {
      const scheduler = new ComplianceScheduler(engine, {
        tenantId,
        ...initialConfig
      });
      this.registry.set(tenantId, scheduler);
    }
    return this.registry.get(tenantId)!;
  }

  /**
   * Lists all active tenant schedulers.
   */
  public static listAll(): Map<string, ComplianceScheduler> {
    return new Map(this.registry);
  }

  /**
   * Stops and clears all active tenant schedulers.
   */
  public static stopAll(): void {
    this.registry.forEach(scheduler => {
      scheduler.stop();
    });
    this.registry.clear();
  }
}

// ----------------------------------------------------------------------------
// Export Singleton Instance & Factory Function
// ----------------------------------------------------------------------------

export const complianceScheduler = ComplianceScheduler.getInstance();

export function createComplianceScheduler(
  config?: Partial<ComplianceSchedulerConfig>,
  engine?: ContinuousComplianceEngine
): ComplianceScheduler {
  return new ComplianceScheduler(engine || continuousComplianceEngine, config);
}

export default complianceScheduler;
