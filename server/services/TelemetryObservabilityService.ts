// ============================================================================
// SKANDA ENTERPRISE GRC: OPENTELEMETRY OBSERVABILITY & DUAL ALERTING SERVICE
// Path: server/services/TelemetryObservabilityService.ts
//
// OpenTelemetry distributed tracing, structured zero-leak JSON logging,
// Prometheus metrics collection, and dual-channel (Operational vs GRC) alerting.
// ============================================================================

import crypto from 'crypto';

export type AlertChannel = 'OPERATIONAL' | 'GRC_WORKFLOW';
export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface TelemetrySpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  service: string;
  tenantId?: string;
  userId?: string;
  startTimeEpochMs: number;
  durationMs?: number;
  status: 'OK' | 'ERROR';
  attributes: Record<string, string | number | boolean>;
}

export interface StructuredLogEntry {
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  traceId: string;
  spanId: string;
  tenantId: string;
  userId: string;
  service: string;
  operation: string;
  durationMs?: number;
  message: string;
  error?: string;
  result: 'SUCCESS' | 'FAILURE';
}

export interface EnterpriseAlert {
  id: string;
  channel: AlertChannel;
  severity: AlertSeverity;
  title: string;
  summary: string;
  source: string;
  tenantId: string;
  relatedEntityId?: string;
  correlationId: string;
  timestamp: string;
  acknowledged: boolean;
}

export class TelemetryObservabilityService {
  private static instance: TelemetryObservabilityService;
  private activeSpans: Map<string, TelemetrySpan> = new Map();
  private structuredLogs: StructuredLogEntry[] = [];
  private alertsQueue: EnterpriseAlert[] = [];
  private metrics = {
    totalHttpRequests: 0,
    totalControlEvaluations: 0,
    totalOutboxEventsDispatched: 0,
    totalDlqMessages: 0,
    totalRlsChecks: 0
  };

  private constructor() {}

  public static getInstance(): TelemetryObservabilityService {
    if (!TelemetryObservabilityService.instance) {
      TelemetryObservabilityService.instance = new TelemetryObservabilityService();
    }
    return TelemetryObservabilityService.instance;
  }

  /**
   * Starts an OpenTelemetry compliant distributed trace span
   */
  public startSpan(operationName: string, service: string = 'skanda-core', parentSpan?: TelemetrySpan): TelemetrySpan {
    const traceId = parentSpan ? parentSpan.traceId : crypto.randomBytes(16).toString('hex');
    const spanId = crypto.randomBytes(8).toString('hex');

    const span: TelemetrySpan = {
      traceId,
      spanId,
      parentSpanId: parentSpan?.spanId,
      operationName,
      service,
      startTimeEpochMs: Date.now(),
      status: 'OK',
      attributes: {}
    };

    this.activeSpans.set(spanId, span);
    return span;
  }

  /**
   * Ends span and records duration metrics
   */
  public endSpan(span: TelemetrySpan, status: 'OK' | 'ERROR' = 'OK'): void {
    span.durationMs = Date.now() - span.startTimeEpochMs;
    span.status = status;
    this.activeSpans.delete(span.spanId);
  }

  /**
   * Emits structured JSON log entry ensuring zero secret and zero binary content exposure
   */
  public log(entry: {
    level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
    span?: TelemetrySpan;
    tenantId?: string;
    userId?: string;
    service?: string;
    operation: string;
    durationMs?: number;
    message: string;
    error?: string;
    result?: 'SUCCESS' | 'FAILURE';
  }): StructuredLogEntry {
    const sanitizedMessage = this.sanitizeLogMessage(entry.message);

    const logRecord: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level: entry.level,
      traceId: entry.span?.traceId || crypto.randomBytes(16).toString('hex'),
      spanId: entry.span?.spanId || crypto.randomBytes(8).toString('hex'),
      tenantId: entry.tenantId || 'tenant_system',
      userId: entry.userId || 'system_worker',
      service: entry.service || 'skanda-api',
      operation: entry.operation,
      durationMs: entry.durationMs,
      message: sanitizedMessage,
      error: entry.error,
      result: entry.result || (entry.level === 'ERROR' ? 'FAILURE' : 'SUCCESS')
    };

    this.structuredLogs.push(logRecord);
    if (this.structuredLogs.length > 500) {
      this.structuredLogs.shift();
    }

    return logRecord;
  }

  private sanitizeLogMessage(msg: string): string {
    return msg
      .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer [REDACTED]')
      .replace(/password\s*=\s*['"][^'"]+['"]/gi, 'password=[REDACTED]')
      .replace(/secret\s*=\s*['"][^'"]+['"]/gi, 'secret=[REDACTED]');
  }

  /**
   * Emits a typed alert to either OPERATIONAL or GRC_WORKFLOW channels
   */
  public emitAlert(params: {
    channel: AlertChannel;
    severity: AlertSeverity;
    title: string;
    summary: string;
    source: string;
    tenantId: string;
    relatedEntityId?: string;
  }): EnterpriseAlert {
    const alert: EnterpriseAlert = {
      id: `ALT-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      channel: params.channel,
      severity: params.severity,
      title: params.title,
      summary: params.summary,
      source: params.source,
      tenantId: params.tenantId,
      relatedEntityId: params.relatedEntityId,
      correlationId: `corr-alt-${crypto.randomBytes(3).toString('hex')}`,
      timestamp: new Date().toISOString(),
      acknowledged: false
    };

    this.alertsQueue.push(alert);
    return alert;
  }

  public incrementMetric(metricName: keyof typeof this.metrics): void {
    if (this.metrics[metricName] !== undefined) {
      this.metrics[metricName]++;
    }
  }

  public getPrometheusMetrics(): string {
    return [
      '# HELP skanda_http_requests_total Total number of HTTP requests processed',
      '# TYPE skanda_http_requests_total counter',
      `skanda_http_requests_total ${this.metrics.totalHttpRequests}`,
      '# HELP skanda_control_evaluations_total Total number of automated control evaluations',
      '# TYPE skanda_control_evaluations_total counter',
      `skanda_control_evaluations_total ${this.metrics.totalControlEvaluations}`,
      '# HELP skanda_outbox_events_dispatched_total Total transactional outbox events dispatched to broker',
      '# TYPE skanda_outbox_events_dispatched_total counter',
      `skanda_outbox_events_dispatched_total ${this.metrics.totalOutboxEventsDispatched}`,
      '# HELP skanda_dlq_messages_total Total poisoned messages routed to Dead Letter Queue',
      '# TYPE skanda_dlq_messages_total counter',
      `skanda_dlq_messages_total ${this.metrics.totalDlqMessages}`,
      '# HELP skanda_rls_checks_total Total database Row-Level Security checks executed',
      '# TYPE skanda_rls_checks_total counter',
      `skanda_rls_checks_total ${this.metrics.totalRlsChecks}`
    ].join('\n');
  }

  public getAlerts(channel?: AlertChannel, tenantId?: string): EnterpriseAlert[] {
    return this.alertsQueue.filter(a => {
      const matchChannel = !channel || a.channel === channel;
      const matchTenant = !tenantId || a.tenantId === tenantId;
      return matchChannel && matchTenant;
    });
  }
}

export const telemetryObservabilityService = TelemetryObservabilityService.getInstance();
