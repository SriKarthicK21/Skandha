// SKANDA GRC — Continuous ISO Compliance Monitoring Client API Service
// Connects frontend to production REST endpoints with graceful offline/fallback capabilities.

import {
  ContinuousControlEvaluation,
  AutomatedControlTest,
  CertificationLifecycle,
  ComplianceDriftEvent,
  AuditReadinessPackage,
  ContinuousComplianceSummary,
  ContinuousComplianceControlStatus,
  ContinuousComplianceEngineStatus,
  ContinuousComplianceEngineConfig,
  ContinuousComplianceEngineRunLog,
  ComplianceFrameworkSchema,
  ComplianceRequirementSchema,
  ContinuousControlSchema,
  ContinuousEvidenceSchema
} from '../types/continuousCompliance';

const BASE_URL = '/api/compliance/continuous';

export async function fetchContinuousComplianceSummary(
  tenantId: string = 'tenant-acme'
): Promise<{ summary: ContinuousComplianceSummary; certificationLifecycle: CertificationLifecycle }> {
  try {
    const res = await fetch(`${BASE_URL}/summary?tenantId=${encodeURIComponent(tenantId)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch summary`);
    const data = await res.json();
    return {
      summary: data.summary,
      certificationLifecycle: data.certificationLifecycle
    };
  } catch (err) {
    console.error('Failed to fetch continuous compliance summary:', err);
    throw err;
  }
}

export async function fetchCertificationLifecycle(
  tenantId: string = 'tenant-acme'
): Promise<CertificationLifecycle> {
  const res = await fetch(`${BASE_URL}/certification?tenantId=${encodeURIComponent(tenantId)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch certification`);
  const data = await res.json();
  return data.certification;
}

export async function updateCertificationMilestones(
  tenantId: string,
  updates: Partial<CertificationLifecycle>
): Promise<CertificationLifecycle> {
  const res = await fetch(`${BASE_URL}/certification`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId, ...updates })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to update certification milestones`);
  const data = await res.json();
  return data.certification;
}

export async function fetchContinuousControls(
  tenantId: string = 'tenant-acme',
  filters?: {
    status?: string;
    category?: string;
    driftOnly?: boolean;
    search?: string;
  }
): Promise<ContinuousControlEvaluation[]> {
  const params = new URLSearchParams({ tenantId });
  if (filters?.status) params.append('status', filters.status);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.driftOnly) params.append('driftOnly', 'true');
  if (filters?.search) params.append('search', filters.search);

  const res = await fetch(`${BASE_URL}/controls?${params.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch continuous controls`);
  const data = await res.json();
  return data.controls;
}

export async function updateControlStatus(
  tenantId: string,
  controlCode: string,
  overallStatus: ContinuousComplianceControlStatus,
  notes?: string
): Promise<ContinuousControlEvaluation> {
  const res = await fetch(`${BASE_URL}/controls/${encodeURIComponent(controlCode)}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId, overallStatus, notes })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to update control status`);
  const data = await res.json();
  return data.control;
}

export async function fetchAutomatedTests(
  tenantId: string = 'tenant-acme'
): Promise<AutomatedControlTest[]> {
  const res = await fetch(`${BASE_URL}/automated-tests?tenantId=${encodeURIComponent(tenantId)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch automated tests`);
  const data = await res.json();
  return data.tests;
}

export async function runAutomatedTest(
  tenantId: string,
  testId: string
): Promise<{ test: AutomatedControlTest; evidenceSha256: string }> {
  const res = await fetch(`${BASE_URL}/automated-tests/${encodeURIComponent(testId)}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to execute test ${testId}`);
  return await res.json();
}

export async function runAllAutomatedTests(
  tenantId: string
): Promise<{ message: string; summary: ContinuousComplianceSummary }> {
  const res = await fetch(`${BASE_URL}/automated-tests/run-all`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to execute all automated tests`);
  return await res.json();
}

export async function fetchDriftEvents(
  tenantId: string = 'tenant-acme',
  status?: string
): Promise<ComplianceDriftEvent[]> {
  const params = new URLSearchParams({ tenantId });
  if (status) params.append('status', status);

  const res = await fetch(`${BASE_URL}/drift-events?${params.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch drift events`);
  const data = await res.json();
  return data.driftEvents;
}

export async function remediateDriftEvent(
  tenantId: string,
  driftId: string,
  action: 'RESOLVE' | 'PROGRESS',
  resolutionNotes: string
): Promise<ComplianceDriftEvent> {
  const res = await fetch(`${BASE_URL}/drift-events/${encodeURIComponent(driftId)}/remediate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId, action, resolutionNotes })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to remediate drift event`);
  const data = await res.json();
  return data.driftEvent;
}

export async function fetchAuditReadinessPackage(
  tenantId: string = 'tenant-acme',
  auditType: string = 'SURVEILLANCE_YEAR_1'
): Promise<AuditReadinessPackage> {
  const res = await fetch(`${BASE_URL}/readiness-package?tenantId=${encodeURIComponent(tenantId)}&auditType=${encodeURIComponent(auditType)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to generate audit readiness package`);
  const data = await res.json();
  return data.package;
}

// --------------------------------------------------------------------------
// ContinuousComplianceEngine & Job Scheduler Services
// --------------------------------------------------------------------------

export async function fetchContinuousComplianceEngineStatus(
  tenantId: string = 'tenant-acme'
): Promise<ContinuousComplianceEngineStatus> {
  const res = await fetch(`${BASE_URL}/engine/status?tenantId=${encodeURIComponent(tenantId)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch engine status`);
  const data = await res.json();
  return data.status;
}

export async function startContinuousComplianceEngine(
  tenantId: string = 'tenant-acme',
  intervalMs?: number
): Promise<{ message: string; status: ContinuousComplianceEngineStatus }> {
  const res = await fetch(`${BASE_URL}/engine/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId, intervalMs })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to start engine scheduler`);
  return await res.json();
}

export async function pauseContinuousComplianceEngine(
  tenantId: string = 'tenant-acme'
): Promise<{ message: string; status: ContinuousComplianceEngineStatus }> {
  const res = await fetch(`${BASE_URL}/engine/pause`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to pause engine scheduler`);
  return await res.json();
}

export async function pollContinuousComplianceNow(
  tenantId: string = 'tenant-acme'
): Promise<{ message: string; runLog: ContinuousComplianceEngineRunLog; status: ContinuousComplianceEngineStatus }> {
  const res = await fetch(`${BASE_URL}/engine/poll-now`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to trigger immediate poll sweep`);
  return await res.json();
}

export async function updateContinuousComplianceEngineConfig(
  config: Partial<ContinuousComplianceEngineConfig>
): Promise<{ config: ContinuousComplianceEngineConfig; status: ContinuousComplianceEngineStatus }> {
  const res = await fetch(`${BASE_URL}/engine/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to update engine config`);
  return await res.json();
}

export async function fetchContinuousComplianceEngineLogs(): Promise<ContinuousComplianceEngineRunLog[]> {
  const res = await fetch(`${BASE_URL}/engine/logs`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch engine execution logs`);
  const data = await res.json();
  return data.logs;
}

export async function fetchFrameworks(tenantId: string = 'tenant-acme'): Promise<ComplianceFrameworkSchema[]> {
  const res = await fetch(`${BASE_URL}/frameworks?tenantId=${encodeURIComponent(tenantId)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch compliance frameworks`);
  const data = await res.json();
  return data.frameworks || [];
}

export async function fetchRequirements(
  tenantId: string = 'tenant-acme',
  frameworkId?: string
): Promise<ComplianceRequirementSchema[]> {
  const url = frameworkId
    ? `${BASE_URL}/requirements?tenantId=${encodeURIComponent(tenantId)}&frameworkId=${encodeURIComponent(frameworkId)}`
    : `${BASE_URL}/requirements?tenantId=${encodeURIComponent(tenantId)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch compliance requirements`);
  const data = await res.json();
  return data.requirements || [];
}

export async function fetchContinuousControlsSchema(tenantId: string = 'tenant-acme'): Promise<ContinuousControlSchema[]> {
  const res = await fetch(`${BASE_URL}/control-definitions?tenantId=${encodeURIComponent(tenantId)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch control definitions`);
  const data = await res.json();
  return data.controls || [];
}

export async function fetchContinuousEvidence(
  tenantId: string = 'tenant-acme',
  controlCode?: string,
  freshness?: string
): Promise<ContinuousEvidenceSchema[]> {
  let url = `${BASE_URL}/evidence?tenantId=${encodeURIComponent(tenantId)}`;
  if (controlCode) url += `&controlCode=${encodeURIComponent(controlCode)}`;
  if (freshness) url += `&freshness=${encodeURIComponent(freshness)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch continuous evidence`);
  const data = await res.json();
  return data.evidence || [];
}

export async function fetchSchemaDdl(): Promise<{ sqlDdl: string; tables: string[]; targetEngine: string }> {
  const res = await fetch(`${BASE_URL}/schema/ddl`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch schema DDL`);
  return await res.json();
}

// --------------------------------------------------------------------------
// Continuous Compliance Monitoring API v1 Endpoints (/api/v1/compliance/monitoring/*)
// --------------------------------------------------------------------------

export interface ComplianceMonitoringPollResponse {
  success: boolean;
  tenantId: string;
  timestamp: string;
  message: string;
  execution: {
    runId: string;
    durationMs: number;
    status: 'SUCCESS' | 'WARNING' | 'ERROR';
    triggerSource: string;
    timestamp: string;
  };
  controlEffectiveness: {
    totalEvaluated: number;
    effective: number;
    operatingMinorGap: number;
    ineffectiveDriftAlert: number;
    pendingVerification: number;
    effectivePercentage: number;
    statusDistribution: Record<string, number>;
  };
  evidenceFreshness: {
    totalChecked: number;
    fresh: number;
    aging: number;
    stale: number;
    expired: number;
    missing: number;
    averageFreshnessScore: number;
    slaCompliancePercentage: number;
    tamperEvidentVerifiedCount: number;
  };
  driftDetection: {
    driftsDetectedDuringSweep: number;
    newDriftEventIds: string[];
    totalActiveDrifts: number;
    criticalActiveDrifts: number;
    highActiveDrifts: number;
    unresolvedDriftSummary: Array<{
      id: string;
      controlCode: string;
      severity: string;
      driftType: string;
      status: string;
      dueDate: string;
    }>;
  };
  summary: ContinuousComplianceSummary;
  engineStatus: ContinuousComplianceEngineStatus;
}

export interface ComplianceMonitoringDriftResponse {
  success: boolean;
  tenantId: string;
  timestamp: string;
  total: number;
  filteredCount: number;
  activeCount: number;
  metrics: {
    total: number;
    active: number;
    open: number;
    inRemediation: number;
    verificationPending: number;
    resolved: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
    byStatus?: Record<string, number>;
  };
  driftEvents: ComplianceDriftEvent[];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
    totalPages: number;
    currentPage: number;
  };
}

export async function pollComplianceMonitoring(
  tenantId: string = 'tenant-acme',
  triggerSource: string = 'CLIENT_APP_POLL'
): Promise<ComplianceMonitoringPollResponse> {
  const res = await fetch('/api/v1/compliance/monitoring/poll', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId, triggerSource })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to trigger monitoring poll`);
  return await res.json();
}

export async function fetchComplianceMonitoringDrift(
  options?: {
    tenantId?: string;
    status?: string;
    severity?: string;
    driftType?: string;
    controlCode?: string;
    frameworkCode?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }
): Promise<ComplianceMonitoringDriftResponse> {
  const params = new URLSearchParams();
  if (options?.tenantId) params.append('tenantId', options.tenantId);
  if (options?.status) params.append('status', options.status);
  if (options?.severity) params.append('severity', options.severity);
  if (options?.driftType) params.append('driftType', options.driftType);
  if (options?.controlCode) params.append('controlCode', options.controlCode);
  if (options?.frameworkCode) params.append('frameworkCode', options.frameworkCode);
  if (options?.search) params.append('search', options.search);
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.offset) params.append('offset', options.offset.toString());

  const res = await fetch(`/api/v1/compliance/monitoring/drift?${params.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch compliance drift events`);
  return await res.json();
}

export async function reportComplianceMonitoringDrift(
  drift: {
    controlCode: string;
    rootCause: string;
    tenantId?: string;
    controlTitle?: string;
    severity?: string;
    driftType?: string;
    recommendedAction?: string;
    assignedOwner?: string;
    dueDate?: string;
    capaId?: string;
  }
): Promise<{ success: boolean; driftEvent: ComplianceDriftEvent; message: string }> {
  const res = await fetch('/api/v1/compliance/monitoring/drift', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(drift)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to report compliance drift`);
  return await res.json();
}

export async function remediateComplianceMonitoringDrift(
  driftId: string,
  action: 'RESOLVE' | 'PROGRESS' | 'VERIFY',
  resolutionNotes?: string,
  tenantId: string = 'tenant-acme',
  actor: string = 'Compliance Officer'
): Promise<{ success: boolean; driftEvent: ComplianceDriftEvent; summary: ContinuousComplianceSummary }> {
  const res = await fetch(`/api/v1/compliance/monitoring/drift/${encodeURIComponent(driftId)}/remediate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId, action, resolutionNotes, actor })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to remediate drift event`);
  return await res.json();
}
