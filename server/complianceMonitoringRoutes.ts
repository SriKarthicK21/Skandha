// ============================================================================
// SKANDA GRC — Continuous Compliance Monitoring API Endpoints
// Path: server/complianceMonitoringRoutes.ts
//
// REST Endpoints:
// 1. POST /api/v1/compliance/monitoring/poll
//    (and GET /api/v1/compliance/monitoring/poll)
//    -> Triggers an immediate evaluation of control effectiveness,
//       verifies evidence freshness decay against SLAs, and executes
//       continuous drift detection sweeps.
//
// 2. GET /api/v1/compliance/monitoring/drift
//    -> Retrieves detected compliance drift events with filtering by status,
//       severity, drift type, control code, search query, and pagination.
//
// 3. POST /api/v1/compliance/monitoring/drift
//    -> Manually records or flags a detected compliance drift event.
//
// 4. POST /api/v1/compliance/monitoring/drift/:driftId/remediate
//    -> Progresses or resolves a drift incident with signoff notes.
// ============================================================================

import { Router, Request, Response } from 'express';
import {
  db,
  persistDb,
  ensureTenantSeeded,
  calculateSummary
} from './continuousComplianceDb';
import { continuousComplianceEngine } from './services/ContinuousComplianceEngine';
import {
  ContinuousControlEvaluation,
  ComplianceDriftEvent,
  DriftSeverity,
  DriftType,
  ContinuousComplianceControlStatus
} from '../src/types/continuousCompliance';

const router = Router();

// ============================================================================
// 1. Trigger Immediate Evaluation Sweep (Control Effectiveness + Evidence Freshness)
//    Endpoint: /api/v1/compliance/monitoring/poll
//    Supported: POST & GET
// ============================================================================
async function handlePollSweep(req: Request, res: Response) {
  const tenantId = (req.body?.tenantId as string) || (req.query?.tenantId as string) || 'tenant-acme';
  const triggerSource = (req.body?.triggerSource as string) || (req.query?.triggerSource as string) || 'API_V1_POLL_TRIGGER';

  try {
    ensureTenantSeeded(tenantId);

    // Execute immediate continuous evaluation sweep via engine
    const runLog = await continuousComplianceEngine.pollNow(tenantId);
    const engineStatus = continuousComplianceEngine.getStatus(tenantId);

    // Gather post-sweep state
    const evals: ContinuousControlEvaluation[] = db.evaluations[tenantId] || [];
    const evidenceList = db.evidence[tenantId] || [];
    const allDrifts: ComplianceDriftEvent[] = db.driftEvents[tenantId] || [];

    // Calculate Control Effectiveness breakdown
    const applicableControls = evals.filter(e => e.applicabilityStatus === 'Applicable');
    const effectiveControls = applicableControls.filter(e => e.overallStatus === 'Effective');
    const ineffectiveControls = applicableControls.filter(
      e => e.overallStatus === 'Ineffective' || e.overallStatus === 'Remediation Required' || e.overallStatus === 'Nonconforming'
    );
    const expiredEvidenceControls = applicableControls.filter(
      e => e.overallStatus === 'Evidence Expired' || e.overallStatus === 'Evidence Missing'
    );
    const exceptionControls = applicableControls.filter(e => e.overallStatus === 'Exception Approved');

    const effectivePercentage = applicableControls.length > 0
      ? Number(((effectiveControls.length / applicableControls.length) * 100).toFixed(1))
      : 100;

    // Calculate Evidence Freshness breakdown
    let freshCount = 0;
    let agingCount = 0;
    let staleCount = 0;
    let expiredCount = 0;
    let missingCount = 0;
    let totalFreshnessScore = 0;

    evidenceList.forEach(ev => {
      totalFreshnessScore += ev.freshnessScore || 0;
      switch (ev.freshnessStatus) {
        case 'Fresh': freshCount++; break;
        case 'Aging': agingCount++; break;
        case 'Stale': staleCount++; break;
        case 'Expired': expiredCount++; break;
        case 'Missing': missingCount++; break;
        default: freshCount++; break;
      }
    });

    const averageFreshnessScore = evidenceList.length > 0
      ? Number((totalFreshnessScore / evidenceList.length).toFixed(1))
      : 100;

    const compliantEvidenceCount = freshCount + agingCount;
    const slaCompliancePercentage = evidenceList.length > 0
      ? Number(((compliantEvidenceCount / evidenceList.length) * 100).toFixed(1))
      : 100;

    // Active Drift Events
    const activeDrifts = allDrifts.filter(d => d.status !== 'RESOLVED');
    const criticalActiveDrifts = activeDrifts.filter(d => d.severity === 'CRITICAL');
    const highActiveDrifts = activeDrifts.filter(d => d.severity === 'HIGH');

    // Summary calculation
    const summary = calculateSummary(tenantId);

    // Distribution record
    const statusDistribution: Record<string, number> = {};
    evals.forEach(e => {
      statusDistribution[e.overallStatus] = (statusDistribution[e.overallStatus] || 0) + 1;
    });

    return res.status(200).json({
      success: true,
      tenantId,
      timestamp: new Date().toISOString(),
      message: `Completed continuous compliance monitoring sweep across ${applicableControls.length} controls in ${runLog.durationMs}ms.`,
      execution: {
        runId: runLog.runId,
        durationMs: runLog.durationMs,
        status: runLog.status,
        triggerSource,
        timestamp: runLog.timestamp
      },
      controlEffectiveness: {
        totalEvaluated: applicableControls.length,
        effective: effectiveControls.length,
        ineffective: ineffectiveControls.length,
        evidenceExpired: expiredEvidenceControls.length,
        exceptionApproved: exceptionControls.length,
        effectivePercentage,
        statusDistribution
      },
      evidenceFreshness: {
        totalChecked: evidenceList.length,
        fresh: freshCount,
        aging: agingCount,
        stale: staleCount,
        expired: expiredCount,
        missing: missingCount,
        averageFreshnessScore,
        slaCompliancePercentage,
        tamperEvidentVerifiedCount: evidenceList.filter(e => e.tamperEvidentVerified).length
      },
      driftDetection: {
        driftsDetectedDuringSweep: runLog.driftsDetected,
        newDriftEventIds: runLog.newDriftEvents,
        totalActiveDrifts: activeDrifts.length,
        criticalActiveDrifts: criticalActiveDrifts.length,
        highActiveDrifts: highActiveDrifts.length,
        unresolvedDriftSummary: activeDrifts.map(d => ({
          id: d.id,
          controlCode: d.controlCode,
          severity: d.severity,
          driftType: d.driftType,
          status: d.status,
          dueDate: d.dueDate
        }))
      },
      summary,
      engineStatus
    });
  } catch (err: any) {
    console.error('[API /compliance/monitoring/poll] Evaluation sweep failure:', err);
    return res.status(500).json({
      success: false,
      tenantId,
      error: err.message || 'Failed to trigger compliance evaluation sweep.',
      timestamp: new Date().toISOString()
    });
  }
}

router.post('/poll', handlePollSweep);
router.get('/poll', handlePollSweep);

// ============================================================================
// 2. Retrieve Compliance Drift Events
//    Endpoint: /api/v1/compliance/monitoring/drift
//    Supported: GET
// ============================================================================
router.get('/drift', (req: Request, res: Response) => {
  const tenantId = (req.query.tenantId as string) || 'tenant-acme';
  ensureTenantSeeded(tenantId);

  const statusFilter = req.query.status as string;
  const severityFilter = req.query.severity as string;
  const driftTypeFilter = req.query.driftType as string;
  const controlCodeFilter = req.query.controlCode as string;
  const searchQuery = (req.query.search as string || req.query.q as string || '').toLowerCase().trim();

  const limit = Math.min(Math.max(parseInt(req.query.limit as string || '50', 10), 1), 200);
  const offset = Math.max(parseInt(req.query.offset as string || '0', 10), 0);

  const allDrifts: ComplianceDriftEvent[] = db.driftEvents[tenantId] || [];

  // Metrics computation across entire tenant dataset
  const metrics = {
    total: allDrifts.length,
    active: allDrifts.filter(d => d.status !== 'RESOLVED').length,
    open: allDrifts.filter(d => d.status === 'OPEN').length,
    inRemediation: allDrifts.filter(d => d.status === 'IN_REMEDIATION').length,
    verificationPending: allDrifts.filter(d => d.status === 'VERIFICATION_PENDING').length,
    resolved: allDrifts.filter(d => d.status === 'RESOLVED').length,
    bySeverity: {
      CRITICAL: allDrifts.filter(d => d.severity === 'CRITICAL').length,
      HIGH: allDrifts.filter(d => d.severity === 'HIGH').length,
      MEDIUM: allDrifts.filter(d => d.severity === 'MEDIUM').length,
      LOW: allDrifts.filter(d => d.severity === 'LOW').length
    },
    byType: {
      EVIDENCE_DECAY: allDrifts.filter(d => d.driftType === 'EVIDENCE_DECAY').length,
      AUTOMATED_TEST_FAILURE: allDrifts.filter(d => d.driftType === 'AUTOMATED_TEST_FAILURE').length,
      CAPA_SLA_BREACH: allDrifts.filter(d => d.driftType === 'CAPA_SLA_BREACH').length,
      POLICY_EXPIRED: allDrifts.filter(d => d.driftType === 'POLICY_EXPIRED').length,
      UNMAPPED_ASSET: allDrifts.filter(d => d.driftType === 'UNMAPPED_ASSET').length,
      ACCESS_REVIEW_MISSED: allDrifts.filter(d => d.driftType === 'ACCESS_REVIEW_MISSED').length,
      BACKUP_RESTORE_FAILED: allDrifts.filter(d => d.driftType === 'BACKUP_RESTORE_FAILED').length,
      VULNERABILITY_SLA_BREACH: allDrifts.filter(d => d.driftType === 'VULNERABILITY_SLA_BREACH').length,
      SCOPE_DRIFT: allDrifts.filter(d => d.driftType === 'SCOPE_DRIFT').length
    }
  };

  // Filter application
  let filtered = [...allDrifts];

  if (statusFilter) {
    if (statusFilter.toUpperCase() === 'ACTIVE' || statusFilter.toUpperCase() === 'UNRESOLVED') {
      filtered = filtered.filter(d => d.status !== 'RESOLVED');
    } else if (statusFilter.toUpperCase() !== 'ALL') {
      filtered = filtered.filter(d => d.status.toUpperCase() === statusFilter.toUpperCase());
    }
  }

  if (severityFilter && severityFilter.toUpperCase() !== 'ALL') {
    filtered = filtered.filter(d => d.severity.toUpperCase() === severityFilter.toUpperCase());
  }

  if (driftTypeFilter && driftTypeFilter.toUpperCase() !== 'ALL') {
    filtered = filtered.filter(d => d.driftType.toUpperCase() === driftTypeFilter.toUpperCase());
  }

  if (controlCodeFilter) {
    filtered = filtered.filter(d => d.controlCode.toLowerCase() === controlCodeFilter.toLowerCase());
  }

  if (searchQuery) {
    filtered = filtered.filter(d =>
      d.controlCode.toLowerCase().includes(searchQuery) ||
      d.controlTitle.toLowerCase().includes(searchQuery) ||
      d.rootCause.toLowerCase().includes(searchQuery) ||
      d.recommendedAction.toLowerCase().includes(searchQuery) ||
      d.assignedOwner.toLowerCase().includes(searchQuery) ||
      (d.capaId && d.capaId.toLowerCase().includes(searchQuery))
    );
  }

  // Sort by detectedAt desc (newest first)
  filtered.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());

  // Pagination slice
  const paginated = filtered.slice(offset, offset + limit);

  return res.status(200).json({
    success: true,
    tenantId,
    timestamp: new Date().toISOString(),
    total: allDrifts.length,
    filteredCount: filtered.length,
    activeCount: metrics.active,
    metrics,
    driftEvents: paginated,
    pagination: {
      limit,
      offset,
      hasMore: offset + limit < filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
      currentPage: Math.floor(offset / limit) + 1
    }
  });
});

// ============================================================================
// 3. Create or Report a Compliance Drift Event Manually
//    Endpoint: /api/v1/compliance/monitoring/drift
//    Supported: POST
// ============================================================================
router.post('/drift', (req: Request, res: Response) => {
  const {
    tenantId = 'tenant-acme',
    controlCode,
    controlTitle,
    severity = 'HIGH',
    driftType = 'AUTOMATED_TEST_FAILURE',
    rootCause,
    recommendedAction,
    assignedOwner = 'Compliance Officer',
    dueDate,
    capaId,
    affectedRiskIds = []
  } = req.body || {};

  if (!controlCode || !rootCause) {
    return res.status(400).json({
      success: false,
      error: 'controlCode and rootCause are mandatory fields.'
    });
  }

  ensureTenantSeeded(tenantId);

  const now = new Date();
  const calculatedDueDate = dueDate || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const driftId = `DRIFT-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newDrift: ComplianceDriftEvent = {
    id: driftId,
    tenantId,
    controlCode,
    controlTitle: controlTitle || `Control ${controlCode}`,
    severity: severity as DriftSeverity,
    driftType: driftType as DriftType,
    detectedAt: now.toISOString(),
    rootCause,
    recommendedAction: recommendedAction || 'Review control operating procedure and verify implementation evidence.',
    assignedOwner,
    dueDate: calculatedDueDate,
    affectedRiskIds,
    capaId: capaId || `CAPA-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    status: 'OPEN'
  };

  if (!db.driftEvents[tenantId]) {
    db.driftEvents[tenantId] = [];
  }
  db.driftEvents[tenantId].unshift(newDrift);

  // Update linked evaluation state
  const evals = db.evaluations[tenantId] || [];
  const ctrl = evals.find(e => e.controlCode === controlCode);
  if (ctrl) {
    ctrl.overallStatus = 'Ineffective';
    ctrl.driftDetected = true;
    ctrl.driftReason = rootCause;
    ctrl.lastEvaluated = now.toISOString();
  }

  persistDb();

  return res.status(201).json({
    success: true,
    message: `Compliance drift incident ${driftId} created successfully.`,
    driftEvent: newDrift
  });
});

// ============================================================================
// 4. Progress or Remediate a Specific Drift Event
//    Endpoint: /api/v1/compliance/monitoring/drift/:driftId/remediate
//    Supported: POST & PUT
// ============================================================================
router.post('/drift/:driftId/remediate', (req: Request, res: Response) => {
  const { driftId } = req.params;
  const {
    tenantId = 'tenant-acme',
    action = 'RESOLVE', // 'RESOLVE' | 'PROGRESS' | 'VERIFY'
    resolutionNotes = '',
    actor = 'Compliance Officer'
  } = req.body || {};

  ensureTenantSeeded(tenantId);
  const drifts = db.driftEvents[tenantId] || [];
  const drift = drifts.find(d => d.id === driftId);

  if (!drift) {
    return res.status(404).json({
      success: false,
      error: `Compliance drift event ${driftId} not found.`
    });
  }

  const now = new Date().toISOString();

  if (action === 'RESOLVE') {
    drift.status = 'RESOLVED';
    drift.resolutionNotes = resolutionNotes || 'Remediation completed and verified against control baseline.';
    drift.resolvedAt = now;
    drift.resolvedBy = actor;

    // Check if other active drifts exist for this control
    const otherActive = drifts.some(d => d.controlCode === drift.controlCode && d.id !== driftId && d.status !== 'RESOLVED');
    if (!otherActive) {
      const evals = db.evaluations[tenantId] || [];
      const ctrl = evals.find(e => e.controlCode === drift.controlCode);
      if (ctrl) {
        ctrl.driftDetected = false;
        ctrl.driftReason = undefined;
        ctrl.overallStatus = 'Effective';
        ctrl.lastEvaluated = now;
      }
    }
  } else if (action === 'VERIFY') {
    drift.status = 'VERIFICATION_PENDING';
    drift.resolutionNotes = resolutionNotes || 'Remediation submitted for verification.';
  } else {
    drift.status = 'IN_REMEDIATION';
    drift.resolutionNotes = resolutionNotes || 'Remediation activities underway.';
  }

  // Recalculate summary
  const summary = calculateSummary(tenantId);
  persistDb();

  return res.status(200).json({
    success: true,
    message: `Drift incident ${driftId} updated to ${drift.status}.`,
    driftEvent: drift,
    summary
  });
});

export default router;
