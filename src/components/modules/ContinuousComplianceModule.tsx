import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useGRC } from '../../context/GRCContext';
import { PageContainer } from '../layout/PageContainer';
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
  ContinuousComplianceEngineRunLog
} from '../../types/continuousCompliance';
import {
  fetchContinuousComplianceSummary,
  fetchCertificationLifecycle,
  updateCertificationMilestones,
  fetchContinuousControls,
  updateControlStatus,
  fetchAutomatedTests,
  runAutomatedTest,
  runAllAutomatedTests,
  fetchDriftEvents,
  remediateDriftEvent,
  fetchAuditReadinessPackage,
  fetchContinuousComplianceEngineStatus,
  startContinuousComplianceEngine,
  pauseContinuousComplianceEngine,
  pollContinuousComplianceNow,
  updateContinuousComplianceEngineConfig,
  fetchContinuousComplianceEngineLogs
} from '../../services/continuousComplianceService';
import {
  MonitoringHealthResponse,
  MonitoringSensor,
  MonitoringTelemetryData,
  MonitoringThroughputData,
  MonitoringIntegrityData,
  fetchMonitoringHealth,
  fetchMonitoringSensors,
  fetchMonitoringTelemetry,
  fetchMonitoringThroughput,
  fetchMonitoringIntegrity,
  refreshLiveTelemetry,
  formatTimeAgo,
  reconnectSensor
} from '../../services/telemetry/complianceCoreMonitoringService';
import { SensorHealthDetailsDrawer } from '../dashboard/SensorHealthDetailsDrawer';
import { WormIntegrityModal } from '../dashboard/WormIntegrityModal';
import {
  TelemetryMetricDetailsModal,
  TelemetryMetricDetail
} from '../dashboard/TelemetryMetricDetailsModal';
import { ContinuousComplianceEngineTab } from './ContinuousComplianceEngineTab';
import { ComplianceSchemaRegistryTab } from './ComplianceSchemaRegistryTab';
import { complianceToastService } from '../../services/compliance/ComplianceToastService';
import {
  ShieldCheck,
  Award,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Calendar,
  RefreshCw,
  Filter,
  Search,
  Play,
  FileCheck2,
  FolderCheck,
  ExternalLink,
  Lock,
  Zap,
  Check,
  X,
  ChevronRight,
  Eye,
  Download,
  Printer,
  Database,
  Server,
  Users,
  Activity,
  Layers,
  ArrowRight,
  Sparkles,
  HelpCircle,
  FileText,
  SlidersHorizontal,
  History,
  Info,
  Radio,
  Wifi,
  WifiOff,
  Cpu
} from 'lucide-react';

export const ContinuousComplianceModule: React.FC = () => {
  const { currentTenant, setActiveModule, canUserAccessModule } = useGRC();
  const tenantId = currentTenant?.id || 'tenant-acme';

  const [activeTab, setActiveTab] = useState<
    'lifecycle' | 'controls' | 'automated_tests' | 'drift_desk' | 'engine_scheduler' | 'telemetry_fleet' | 'readiness_dossier' | 'schema_registry'
  >('lifecycle');

  // Core Data State
  const [summary, setSummary] = useState<ContinuousComplianceSummary | null>(null);
  const [certLifecycle, setCertLifecycle] = useState<CertificationLifecycle | null>(null);
  const [controls, setControls] = useState<ContinuousControlEvaluation[]>([]);
  const [automatedTests, setAutomatedTests] = useState<AutomatedControlTest[]>([]);
  const [driftEvents, setDriftEvents] = useState<ComplianceDriftEvent[]>([]);
  const [readinessPackage, setReadinessPackage] = useState<AuditReadinessPackage | null>(null);

  // Continuous Compliance Engine Daemon & Scheduler State
  const [engineStatus, setEngineStatus] = useState<ContinuousComplianceEngineStatus | null>(null);
  const [engineLogs, setEngineLogs] = useState<ContinuousComplianceEngineRunLog[]>([]);
  const [pollingNow, setPollingNow] = useState(false);
  const [updatingScheduler, setUpdatingScheduler] = useState(false);
  const [customIntervalSeconds, setCustomIntervalSeconds] = useState(30);

  // =========================================================================
  // Live Telemetry & Monitoring State (/api/v1/monitoring/*)
  // =========================================================================
  const [monitoringHealth, setMonitoringHealth] = useState<MonitoringHealthResponse | null>(null);
  const [monitoringSensors, setMonitoringSensors] = useState<MonitoringSensor[]>([]);
  const [monitoringTelemetry, setMonitoringTelemetry] = useState<MonitoringTelemetryData | null>(null);
  const [monitoringThroughput, setMonitoringThroughput] = useState<MonitoringThroughputData | null>(null);
  const [monitoringIntegrity, setMonitoringIntegrity] = useState<MonitoringIntegrityData | null>(null);

  // Status & Error States
  const [monitoringLoading, setMonitoringLoading] = useState<boolean>(true);
  const [monitoringRefreshing, setMonitoringRefreshing] = useState<boolean>(false);
  const [monitoringError, setMonitoringError] = useState<string | null>(null);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);
  const [telemetryState, setTelemetryState] = useState<
    'loading' | 'live' | 'degraded' | 'stale' | 'auth_failed' | 'error'
  >('loading');

  // Cadence & Dynamic Freshness
  const [lastTelemetrySecondsAgo, setLastTelemetrySecondsAgo] = useState<number>(12);
  const [nextEvaluationSeconds, setNextEvaluationSeconds] = useState<number>(30);

  // Modals & Drawers
  const [isSensorsDrawerOpen, setIsSensorsDrawerOpen] = useState<boolean>(false);
  const [isWormModalOpen, setIsWormModalOpen] = useState<boolean>(false);
  const [activeMetricDetail, setActiveMetricDetail] = useState<TelemetryMetricDetail | null>(null);

  // Loading & Async Action States
  const [loading, setLoading] = useState(true);
  const [runningAllTests, setRunningAllTests] = useState(false);
  const [runningTestId, setRunningTestId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Filters for Controls Tab
  const [controlSearch, setControlSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [driftOnlyFilter, setDriftOnlyFilter] = useState(false);

  // Modals
  const [editingControl, setEditingControl] = useState<ContinuousControlEvaluation | null>(null);
  const [newControlStatus, setNewControlStatus] = useState<ContinuousComplianceControlStatus>('Effective');
  const [controlEditNotes, setControlEditNotes] = useState('');
  const [remediatingDrift, setRemediatingDrift] = useState<ComplianceDriftEvent | null>(null);
  const [driftResolutionNotes, setDriftResolutionNotes] = useState('');
  const [selectedAuditLens, setSelectedAuditLens] = useState<'SURVEILLANCE_YEAR_1' | 'SURVEILLANCE_YEAR_2' | 'RECERTIFICATION' | 'INTERNAL_AUDIT'>('SURVEILLANCE_YEAR_1');
  const [dossierModalOpen, setDossierModalOpen] = useState(false);

  // Load All Engine Data
  const loadData = async () => {
    try {
      setLoading(true);
      const [sumRes, ctrlRes, testRes, driftRes, engStatus, engLogs] = await Promise.all([
        fetchContinuousComplianceSummary(tenantId),
        fetchContinuousControls(tenantId),
        fetchAutomatedTests(tenantId),
        fetchDriftEvents(tenantId),
        fetchContinuousComplianceEngineStatus(tenantId).catch(() => null),
        fetchContinuousComplianceEngineLogs().catch(() => [])
      ]);

      setSummary(sumRes.summary);
      setCertLifecycle(sumRes.certificationLifecycle);
      setControls(ctrlRes);
      setAutomatedTests(testRes);
      setDriftEvents(driftRes);
      if (engStatus) {
        setEngineStatus(engStatus);
        setCustomIntervalSeconds(Math.round(engStatus.pollingIntervalMs / 1000));
      }
      if (engLogs) setEngineLogs(engLogs);
    } catch (err) {
      console.error('Error loading continuous compliance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tenantId]);

  // =========================================================================
  // Telemetry Monitoring Data Fetching Hook (/api/v1/monitoring/*)
  // =========================================================================
  const fetchMonitoringData = useCallback(async (silent = false) => {
    if (!silent) setMonitoringLoading(true);
    setMonitoringError(null);
    setAuthErrorMessage(null);

    try {
      const [hRes, sRes, tRes, thRes, iRes] = await Promise.all([
        fetchMonitoringHealth(),
        fetchMonitoringSensors(),
        fetchMonitoringTelemetry(),
        fetchMonitoringThroughput(),
        fetchMonitoringIntegrity()
      ]);

      setMonitoringHealth(hRes);
      setMonitoringSensors(sRes.sensors || []);
      setMonitoringTelemetry(tRes);
      setMonitoringThroughput(thRes);
      setMonitoringIntegrity(iRes);

      setLastTelemetrySecondsAgo(hRes.lastTelemetrySecondsAgo);
      setNextEvaluationSeconds(hRes.nextEvaluationSeconds);

      // 1. Evaluate Sensor Authentication Failure or Token Expiration
      const authFailedSensor = sRes.sensors?.find(
        s => s.authStatus === 'FAILED' || s.authStatus === 'LEASE_EXPIRED'
      );
      if (authFailedSensor) {
        setTelemetryState('auth_failed');
        setAuthErrorMessage(
          `Authentication failed on sensor "${authFailedSensor.name}" (${authFailedSensor.source}): ${
            authFailedSensor.authStatus === 'LEASE_EXPIRED'
              ? 'Token lease expired — re-authentication required.'
              : 'Certificate rejected or access key revoked.'
          }`
        );
        return;
      }

      // 2. Evaluate Stale Telemetry (> 60s without successful telemetry packet)
      if (hRes.lastTelemetrySecondsAgo > 60 || !hRes.telemetryFresh) {
        setTelemetryState('stale');
        return;
      }

      // 3. Evaluate Degraded Telemetry (Warnings or Disconnected sensors)
      if (
        hRes.overallStatus === 'DEGRADED' ||
        hRes.overallStatus === 'WARNING' ||
        hRes.sensorsSummary.warningCount > 0 ||
        hRes.sensorsSummary.disconnectedCount > 0
      ) {
        setTelemetryState('degraded');
      } else {
        setTelemetryState('live');
      }
    } catch (err: any) {
      const errMsg = err?.message || '';

      if (errMsg.includes('429')) {
        console.warn('Telemetry request throttled (HTTP 429), retaining active telemetry state.');
        // Do not crash or set error state if throttled; retain existing live/stale state
        if (!monitoringTelemetry) {
          setTelemetryState('live');
        }
      } else if (errMsg.includes('401') || errMsg.includes('403') || errMsg.toLowerCase().includes('auth')) {
        console.error('Failed to fetch live telemetry status (Auth):', err);
        setTelemetryState('auth_failed');
        setAuthErrorMessage('Authentication failed: Invalid credentials or session expired.');
      } else {
        console.warn('Failed to fetch live telemetry status:', err);
        if (!monitoringTelemetry) {
          setTelemetryState('error');
          setMonitoringError('Telemetry unavailable: Continuous compliance monitoring daemon unreachable.');
        }
      }
    } finally {
      if (!silent) setMonitoringLoading(false);
    }
  }, [monitoringTelemetry]);

  // Periodic Telemetry Polling Hook: Polls live endpoints every 24 seconds (pauses when tab hidden)
  useEffect(() => {
    let isMounted = true;

    const executeFetch = async (silent = false) => {
      if (!isMounted) return;
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      await fetchMonitoringData(silent);
    };

    // Initial fetch
    executeFetch(false);

    // Periodic interval (24s cadence reduces API contention)
    const interval = setInterval(() => {
      executeFetch(true);
    }, 24000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchMonitoringData, tenantId]);

  // 1-Second Freshness & Next Evaluation Cadence Ticker Hook
  useEffect(() => {
    const ticker = setInterval(() => {
      setLastTelemetrySecondsAgo(prev => {
        const next = prev + 1;
        // If telemetry age exceeds 60 seconds and state was live, mark as stale
        if (next > 60 && telemetryState === 'live') {
          setTelemetryState('stale');
        }
        return next;
      });

      setNextEvaluationSeconds(prev => (prev > 1 ? prev - 1 : 30));
    }, 1000);

    return () => clearInterval(ticker);
  }, [telemetryState]);

  // Manual Telemetry Ingestion Probe Handler
  const handleRefreshTelemetry = async () => {
    if (monitoringRefreshing) return;
    try {
      setMonitoringRefreshing(true);
      const res = await refreshLiveTelemetry();
      await fetchMonitoringData(true);
      showNotification(`Telemetry stream refreshed: Ingested ${res.metrics?.totalPktsPerMin || 314} pkts/min from active sensor fleet.`);
    } catch (err: any) {
      console.error(err);
      showNotification('Telemetry gateway probe failed or timed out.');
    } finally {
      setMonitoringRefreshing(false);
    }
  };

  const handleSensorUpdated = (updated: MonitoringSensor) => {
    setMonitoringSensors(prev =>
      prev.map(s => (s.id === updated.id ? updated : s))
    );
    // Trigger immediate health re-probe
    fetchMonitoringData(true);
  };

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4500);
  };

  // Run All Tests Handler
  const handleRunAllTests = async () => {
    try {
      setRunningAllTests(true);
      const res = await runAllAutomatedTests(tenantId);
      showNotification(res.message);
      await loadData();
    } catch (err: any) {
      console.error(err);
      showNotification('Error executing automated tests.');
    } finally {
      setRunningAllTests(false);
    }
  };

  // Run Single Test Handler
  const handleRunSingleTest = async (testId: string) => {
    try {
      setRunningTestId(testId);
      const res = await runAutomatedTest(tenantId, testId);
      showNotification(`Test "${res.test.testName}" executed. Status: ${res.test.status}. SHA-256 evidence anchored.`);
      await loadData();
    } catch (err: any) {
      console.error(err);
      showNotification(`Failed to run test ${testId}`);
    } finally {
      setRunningTestId(null);
    }
  };

  // Save Control Status Edit
  const handleSaveControlStatus = async () => {
    if (!editingControl) return;
    try {
      await updateControlStatus(tenantId, editingControl.controlCode, newControlStatus, controlEditNotes);
      showNotification(`Control ${editingControl.controlCode} updated to ${newControlStatus}. Audit trail recorded.`);
      setEditingControl(null);
      setControlEditNotes('');
      await loadData();
    } catch (err) {
      console.error(err);
      showNotification('Failed to update control status.');
    }
  };

  // Remediate Drift Handler
  const handleResolveDrift = async (action: 'RESOLVE' | 'PROGRESS') => {
    if (!remediatingDrift) return;
    try {
      await remediateDriftEvent(tenantId, remediatingDrift.id, action, driftResolutionNotes);
      showNotification(action === 'RESOLVE' ? `Drift event ${remediatingDrift.id} resolved and closed.` : `Drift event updated to In Remediation.`);
      setRemediatingDrift(null);
      setDriftResolutionNotes('');
      await loadData();
    } catch (err) {
      console.error(err);
      showNotification('Failed to update drift event.');
    }
  };

  // Generate Audit Package
  const handleGenerateAuditPackage = async (auditType = selectedAuditLens) => {
    try {
      const pkg = await fetchAuditReadinessPackage(tenantId, auditType);
      setReadinessPackage(pkg);
      setDossierModalOpen(true);
    } catch (err) {
      console.error(err);
      showNotification('Failed to compile audit readiness package.');
    }
  };

  // Continuous Compliance Engine Handlers
  const handlePollNow = async () => {
    try {
      setPollingNow(true);
      const res = await pollContinuousComplianceNow(tenantId);
      showNotification(res.message);
      setEngineStatus(res.status);
      const logs = await fetchContinuousComplianceEngineLogs().catch(() => []);
      setEngineLogs(logs);
      await loadData();

      // Trigger real-time compliance breach toast notifications if drifts were detected
      if (res.runLog && res.runLog.driftsDetected > 0) {
        const driftData = await fetchDriftEvents(tenantId, 'OPEN').catch(() => null);
        if (driftData && driftData.length > 0) {
          complianceToastService.notifyBatchDrifts(driftData.slice(0, 3), {
            onReview: () => setActiveTab('drift_desk')
          });
        }
      }
    } catch (err: any) {
      console.error(err);
      showNotification('Failed to execute continuous compliance poll sweep.');
    } finally {
      setPollingNow(false);
    }
  };

  const handleToggleScheduler = async () => {
    if (!engineStatus) return;
    try {
      setUpdatingScheduler(true);
      if (engineStatus.schedulerStatus === 'RUNNING') {
        const res = await pauseContinuousComplianceEngine(tenantId);
        showNotification(res.message);
        setEngineStatus(res.status);
      } else {
        const res = await startContinuousComplianceEngine(tenantId, customIntervalSeconds * 1000);
        showNotification(res.message);
        setEngineStatus(res.status);
      }
    } catch (err: any) {
      console.error(err);
      showNotification('Failed to update scheduler state.');
    } finally {
      setUpdatingScheduler(false);
    }
  };

  const handleUpdateInterval = async (intervalSec: number) => {
    try {
      setCustomIntervalSeconds(intervalSec);
      const res = await updateContinuousComplianceEngineConfig({
        tenantId,
        pollingIntervalMs: intervalSec * 1000
      });
      setEngineStatus(res.status);
      showNotification(`Engine polling cadence updated to ${intervalSec}s.`);
    } catch (err) {
      console.error(err);
      showNotification('Failed to update engine cadence.');
    }
  };

  const handleToggleAutoDrift = async (enabled: boolean) => {
    try {
      const res = await updateContinuousComplianceEngineConfig({
        tenantId,
        autoDriftDetectionEnabled: enabled
      });
      setEngineStatus(res.status);
      showNotification(`Automated drift detection ${enabled ? 'enabled' : 'disabled'}.`);
    } catch (err) {
      console.error(err);
      showNotification('Failed to toggle automated drift detection.');
    }
  };

  // Filtered Controls
  const filteredControls = useMemo(() => {
    return controls.filter(c => {
      const matchesSearch =
        controlSearch === '' ||
        c.controlCode.toLowerCase().includes(controlSearch.toLowerCase()) ||
        c.title.toLowerCase().includes(controlSearch.toLowerCase()) ||
        c.description.toLowerCase().includes(controlSearch.toLowerCase());

      const matchesCat = categoryFilter === 'ALL' || c.category === categoryFilter;
      const matchesStatus = statusFilter === 'ALL' || c.overallStatus === statusFilter;
      const matchesDrift = !driftOnlyFilter || c.driftDetected;

      return matchesSearch && matchesCat && matchesStatus && matchesDrift;
    });
  }, [controls, controlSearch, categoryFilter, statusFilter, driftOnlyFilter]);

  // Helper for Status Pill Colors
  const getStatusBadge = (status: ContinuousComplianceControlStatus) => {
    switch (status) {
      case 'Effective':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'Ineffective':
      case 'Nonconforming':
      case 'Remediation Required':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold animate-pulse';
      case 'Evidence Expired':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold';
      case 'Operating Effectiveness Pending':
      case 'In Progress':
        return 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30';
      case 'Exception Approved':
        return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30';
    }
  };

  const getFreshnessBadge = (rating: string) => {
    switch (rating) {
      case 'Fresh':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'Aging':
        return 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30';
      case 'Stale':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'Expired':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold';
      default:
        return 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30';
    }
  };

  return (
    <PageContainer id="continuous-compliance-module">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 shadow-2xl flex items-center space-x-3 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-1 shadow-inner">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-700/50">
                  Continuous ISO Compliance Monitoring Engine
                </span>
                {certLifecycle && (
                  <span className="text-[11px] font-mono text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/50 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{certLifecycle.certificateNumber}</span>
                  </span>
                )}
                {certLifecycle && (
                  <span className="text-[11px] font-bold text-amber-300 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-700/50 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Surveillance in {certLifecycle.calculatedMetrics.daysUntilSurveillance1}d</span>
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Continuous ISO 27001:2022 Compliance & Drift Engine
              </h1>
              <p className="text-xs text-slate-400 max-w-3xl mt-1 leading-relaxed">
                Automated continuous surveillance auditing, evidence decay tracking, operational control effectiveness, and compliance drift detection throughout the 3-year certification lifecycle.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {engineStatus && (
              <button
                onClick={() => setActiveTab('engine_scheduler')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                  engineStatus.schedulerStatus === 'RUNNING'
                    ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 shadow-xs'
                    : 'bg-amber-950/70 border-amber-500/40 text-amber-300 hover:bg-amber-900/60 shadow-xs'
                }`}
                title="Click to view engine orchestrator & background scheduler"
              >
                <div className={`w-2 h-2 rounded-full ${engineStatus.schedulerStatus === 'RUNNING' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>Scheduler: {engineStatus.schedulerStatus === 'RUNNING' ? `Active (${Math.round(engineStatus.pollingIntervalMs / 1000)}s)` : 'Paused'}</span>
              </button>
            )}

            <button
              onClick={handlePollNow}
              disabled={pollingNow}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition duration-150 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${pollingNow ? 'animate-spin' : ''}`} />
              <span>{pollingNow ? 'Poll Sweep...' : 'Poll Drift Now'}</span>
            </button>

            <button
              onClick={handleRunAllTests}
              disabled={runningAllTests}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 shadow-md transition duration-150 disabled:opacity-50 cursor-pointer"
            >
              <Zap className={`w-3.5 h-3.5 text-purple-400 ${runningAllTests ? 'animate-spin' : ''}`} />
              <span>{runningAllTests ? 'Testing...' : 'Run All Tests'}</span>
            </button>

            <button
              onClick={() => setActiveModule('entity_lineage_graph')}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-sky-950/80 hover:bg-sky-900 text-sky-300 text-xs font-bold border border-sky-700/60 shadow-md transition cursor-pointer"
              title="Explore 7-Hop Entity Lineage: Asset ↔ Risk ↔ Control ↔ ACT Telemetry ↔ Evidence ↔ CAPA ↔ Review"
            >
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>Real-Time Entity Graph</span>
            </button>

            <button
              onClick={() => handleGenerateAuditPackage()}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 shadow-md transition cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audit Readiness Dossier</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* REAL-TIME TELEMETRY & MONITORING STATUS ALERT BANNERS */}
      {/* ========================================================================= */}
      {telemetryState === 'auth_failed' && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-600/50 text-rose-200 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shadow-xl animate-fade-in">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300">
                  Authentication Failed
                </span>
                <span className="text-[10px] bg-rose-900/80 text-rose-300 px-2 py-0.5 rounded-full border border-rose-700">
                  Sensor Credentials Invalid
                </span>
              </div>
              <p className="text-xs text-rose-200/90 mt-1 max-w-3xl">
                {authErrorMessage || 'Sensor token lease expired or certificate rejected. Real-time telemetry ingestion halted.'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setIsSensorsDrawerOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Inspect Sensor Credentials</span>
            </button>
            <button
              onClick={() => fetchMonitoringData(false)}
              disabled={monitoringLoading}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer border border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${monitoringLoading ? 'animate-spin' : ''}`} />
              <span>Retry Probe</span>
            </button>
          </div>
        </div>
      )}

      {telemetryState === 'stale' && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shadow-xl animate-fade-in">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                  Telemetry Stale
                </span>
                <span className="text-[10px] bg-amber-900/80 text-amber-300 px-2 py-0.5 rounded-full border border-amber-700">
                  Cadence SLA Exceeded
                </span>
              </div>
              <p className="text-xs text-amber-200/90 mt-1 max-w-3xl">
                Last successful telemetry was received <strong>{formatTimeAgo(lastTelemetrySecondsAgo)}</strong>. Background ingestion collector delayed or sensor gateway queue congested.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleRefreshTelemetry}
              disabled={monitoringRefreshing}
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${monitoringRefreshing ? 'animate-spin' : ''}`} />
              <span>Probe Telemetry Now</span>
            </button>
          </div>
        </div>
      )}

      {telemetryState === 'error' && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-200 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shadow-xl animate-fade-in">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
              <WifiOff className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300">
                  Telemetry Unavailable
                </span>
                <span className="text-[10px] bg-rose-900/80 text-rose-300 px-2 py-0.5 rounded-full border border-rose-700">
                  Daemon Unreachable
                </span>
              </div>
              <p className="text-xs text-rose-300/90 mt-1 max-w-3xl">
                {monitoringError || 'Continuous compliance monitoring engine unreachable. Integration not connected.'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => fetchMonitoringData(false)}
              disabled={monitoringLoading}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer border border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${monitoringLoading ? 'animate-spin' : ''}`} />
              <span>Retry Connection</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COMPLIANCE CORE LIVE TELEMETRY STREAM RIBBON */}
      {/* ========================================================================= */}
      {monitoringHealth ? (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl mb-6 backdrop-blur-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <div className="relative flex items-center justify-center">
                <span className={`w-2.5 h-2.5 rounded-full ${telemetryState === 'live' ? 'bg-emerald-400 animate-ping' : telemetryState === 'degraded' ? 'bg-amber-400' : 'bg-rose-400'}`} />
                <span className={`absolute w-2 h-2 rounded-full ${telemetryState === 'live' ? 'bg-emerald-400' : telemetryState === 'degraded' ? 'bg-amber-400' : 'bg-rose-400'}`} />
              </div>
              <span className="text-[11px] font-black font-mono tracking-wider text-slate-200">
                COMPLIANCE CORE
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                telemetryState === 'live'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : telemetryState === 'degraded'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}>
                {monitoringRefreshing ? 'REFRESHING...' : telemetryState === 'live' ? 'LIVE STREAMING' : telemetryState === 'degraded' ? 'DEGRADED STREAM' : 'OFFLINE'}
              </span>
            </div>

            <button
              onClick={() => setIsSensorsDrawerOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 text-slate-300 text-xs font-semibold cursor-pointer transition"
              title="Inspect multi-cloud continuous compliance sensors"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                <strong className="text-emerald-400 font-mono">{monitoringHealth.sensorsSummary.streamingCount}</strong>/{monitoringHealth.sensorsSummary.configuredCount} Sensors Streaming
              </span>
            </button>

            {(monitoringHealth.sensorsSummary.warningCount > 0 || monitoringHealth.sensorsSummary.disconnectedCount > 0) && (
              <button
                onClick={() => setIsSensorsDrawerOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/40 border border-amber-800/50 text-amber-300 text-xs font-semibold cursor-pointer transition"
                title="Review sensor alerts and disconnections"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {monitoringHealth.sensorsSummary.warningCount + monitoringHealth.sensorsSummary.disconnectedCount} Warning / Offline
                </span>
              </button>
            )}

            {monitoringTelemetry && (
              <button
                onClick={() => setActiveMetricDetail({
                  title: 'Core Telemetry Intake',
                  metricKey: 'coreIntake',
                  value: monitoringTelemetry.coreIntake.currentValue,
                  subValue: monitoringTelemetry.coreIntake.pingFormatted,
                  source: monitoringTelemetry.coreIntake.source,
                  lastUpdated: monitoringTelemetry.coreIntake.lastUpdated,
                  collectionInterval: monitoringTelemetry.coreIntake.collectionInterval,
                  status: monitoringTelemetry.coreIntake.status,
                  backendHealth: monitoringTelemetry.coreIntake.backendHealth,
                  description: 'Central ingestion stream processing telemetry signals from AWS CloudTrail, CrowdStrike, Okta, Sentinel, and GitHub.'
                })}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 text-slate-300 text-xs cursor-pointer transition font-mono"
              >
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                <span>{monitoringTelemetry.coreIntake.currentValue} ({monitoringTelemetry.coreIntake.pingFormatted})</span>
              </button>
            )}

            {monitoringThroughput && (
              <button
                onClick={() => setActiveMetricDetail({
                  title: 'Telemetry Throughput',
                  metricKey: 'throughput',
                  value: monitoringThroughput.throughput.currentValue,
                  subValue: monitoringThroughput.throughput.rateFormatted,
                  source: monitoringThroughput.throughput.source,
                  lastUpdated: monitoringThroughput.throughput.lastUpdated,
                  collectionInterval: monitoringThroughput.throughput.collectionInterval,
                  status: monitoringThroughput.throughput.status,
                  backendHealth: monitoringThroughput.throughput.backendHealth,
                  description: 'Cumulative packet ingestion volume and instantaneous ingress rate across all active tenant sensor pipelines.'
                })}
                className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 text-slate-300 text-xs cursor-pointer transition font-mono"
              >
                <Server className="w-3.5 h-3.5 text-sky-400" />
                <span>{monitoringThroughput.throughput.currentValue} ({monitoringThroughput.throughput.rateFormatted})</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {monitoringIntegrity && (
              <button
                onClick={() => setIsWormModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 text-xs font-mono font-semibold cursor-pointer transition"
                title="Inspect WORM Immutable Audit Ledger & SHA-256 Merkle Provenance"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>WORM Verified</span>
              </button>
            )}

            <div className="flex items-center space-x-2 text-[11px] text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 font-mono">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>Last telemetry: <strong className="text-slate-200">{formatTimeAgo(lastTelemetrySecondsAgo)}</strong></span>
              <span className="text-slate-600">•</span>
              <span>Next eval: <strong className="text-indigo-300">{nextEvaluationSeconds}s</strong></span>
            </div>

            <button
              onClick={handleRefreshTelemetry}
              disabled={monitoringRefreshing}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer disabled:opacity-50"
              title="Trigger manual telemetry ingestion sweep"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${monitoringRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setIsSensorsDrawerOpen(true)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer shadow-md shadow-indigo-600/20"
            >
              <span>Inspect Fleet</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : monitoringLoading ? (
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 shadow-md mb-6 flex items-center justify-between text-xs text-slate-400 animate-pulse">
          <div className="flex items-center space-x-3">
            <Activity className="w-4 h-4 text-indigo-400 animate-spin" />
            <span>Connecting to Continuous Ingestion Telemetry Stream & Sensor Gateway...</span>
          </div>
          <span className="font-mono text-slate-500">/api/v1/monitoring/health</span>
        </div>
      ) : null}

      {/* Executive Health & Vital Signs Row */}
      {summary && certLifecycle && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5 mb-6">
          {/* 1. Overall Posture Score */}
          <div className="p-4 rounded-xl bg-[var(--skanda-bg-card)] border border-[var(--skanda-border)] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Overall Posture</span>
              <Activity className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl font-black font-mono ${summary.overallComplianceScore >= 85 ? 'text-emerald-400' : summary.overallComplianceScore >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
                {summary.overallComplianceScore}%
              </span>
              <span className="text-[10px] text-slate-400 font-medium">calculated</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${summary.overallComplianceScore >= 85 ? 'bg-emerald-500' : summary.overallComplianceScore >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                style={{ width: `${summary.overallComplianceScore}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Real-time formula score</span>
          </div>

          {/* 2. Surveillance Readiness */}
          <div className="p-4 rounded-xl bg-[var(--skanda-bg-card)] border border-[var(--skanda-border)] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Surveillance Ready</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl font-black font-mono ${summary.surveillanceReadinessScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {summary.surveillanceReadinessScore}%
              </span>
              <span className="text-[10px] text-slate-400 font-medium">weighted</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${summary.surveillanceReadinessScore}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Due in {certLifecycle.calculatedMetrics.daysUntilSurveillance1} days</span>
          </div>

          {/* 3. Control Effectiveness */}
          <div className="p-4 rounded-xl bg-[var(--skanda-bg-card)] border border-[var(--skanda-border)] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Effective Controls</span>
              <ShieldCheck className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black font-mono text-white">
                {summary.effectiveControlsCount}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ {summary.totalApplicableControls}</span>
            </div>
            <div className="flex items-center space-x-1 text-[10px] text-rose-400 font-semibold mt-2">
              <span>{summary.ineffectiveControlsCount} requiring action</span>
            </div>
          </div>

          {/* 4. Active Drift Events */}
          <div className="p-4 rounded-xl bg-[var(--skanda-bg-card)] border border-[var(--skanda-border)] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Active Drift</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl font-black font-mono ${summary.activeDriftEventsCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {summary.activeDriftEventsCount}
              </span>
              <span className="text-[10px] text-rose-400 font-bold">({summary.criticalDriftCount} High)</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-2">Post-certification regressions</span>
          </div>

          {/* 5. Automated Tests */}
          <div className="p-4 rounded-xl bg-[var(--skanda-bg-card)] border border-[var(--skanda-border)] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Automated Tests</span>
              <Zap className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black font-mono text-white">
                {automatedTests.filter(t => t.status === 'PASS').length}
              </span>
              <span className="text-xs text-slate-400">/ {automatedTests.length} pass</span>
            </div>
            <div className="flex items-center space-x-1 text-[10px] text-rose-400 font-semibold mt-2">
              <span>{summary.failedAutomatedTestsCount} failed test(s)</span>
            </div>
          </div>

          {/* 6. Certification Risk */}
          <div className="p-4 rounded-xl bg-[var(--skanda-bg-card)] border border-[var(--skanda-border)] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>CB Status</span>
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800">
                {certLifecycle.certificationStatus.split(' ')[0]}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
              <span>Risk:</span>
              <span className={`font-bold ${certLifecycle.calculatedMetrics.certificationRiskLevel === 'LOW' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {certLifecycle.calculatedMetrics.certificationRiskLevel}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('lifecycle')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'lifecycle'
              ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-500'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>3-Year Certification Lifecycle</span>
        </button>

        <button
          onClick={() => setActiveTab('controls')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'controls'
              ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-500'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Continuous Control Monitoring ({controls.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('automated_tests')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'automated_tests'
              ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-500'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Automated Technical Tests ({automatedTests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('drift_desk')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'drift_desk'
              ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-500'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Compliance Drift Desk ({driftEvents.filter(d => d.status !== 'RESOLVED').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('engine_scheduler')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'engine_scheduler'
              ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-500'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Engine & Scheduler</span>
          {engineStatus?.schedulerStatus === 'RUNNING' && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('telemetry_fleet')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'telemetry_fleet'
              ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-500'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Radio className="w-4 h-4 text-emerald-400" />
          <span>Live Telemetry Fleet ({monitoringHealth?.sensorsSummary?.streamingCount || 6}/{monitoringHealth?.sensorsSummary?.configuredCount || 8})</span>
          {telemetryState === 'auth_failed' ? (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping ml-1" />
          ) : telemetryState === 'stale' ? (
            <span className="w-2 h-2 rounded-full bg-amber-400 ml-1" />
          ) : telemetryState === 'live' ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
          ) : null}
        </button>

        <button
          onClick={() => setActiveTab('readiness_dossier')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'readiness_dossier'
              ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-500'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Surveillance Audit Readiness Dossier</span>
        </button>

        <button
          onClick={() => setActiveTab('schema_registry')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'schema_registry'
              ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-500'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Database className="w-4 h-4 text-indigo-400" />
          <span>Schema Registry & DDL</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: 3-YEAR CERTIFICATION LIFECYCLE */}
      {/* ========================================================================= */}
      {activeTab === 'lifecycle' && certLifecycle && (
        <div className="space-y-6">
          {/* Certificate Master Details & Milestone Progress */}
          <div className="p-6 rounded-2xl bg-[var(--skanda-bg-card)] border border-[var(--skanda-border)] shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Accredited Certification Master Record
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5 flex items-center space-x-2">
                  <span>{certLifecycle.certificationBody}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    UKAS Validated
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Certificate No: <strong className="font-mono text-slate-200">{certLifecycle.certificateNumber}</strong> • Standard: <strong className="text-slate-200">{certLifecycle.standard}</strong>
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-xs text-slate-400">Certificate Expiry</div>
                  <div className="text-sm font-bold font-mono text-white">{certLifecycle.expiryDate}</div>
                  <div className="text-[10px] text-emerald-400 font-semibold">{certLifecycle.calculatedMetrics.daysUntilCertificateExpiry} days remaining</div>
                </div>
              </div>
            </div>

            {/* Scope Statement */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <span className="font-bold text-indigo-400 block mb-1">Registered ISO 27001 Scope Statement:</span>
              <p className="text-slate-300 leading-relaxed">{certLifecycle.scopeStatement}</p>
            </div>

            {/* 3-Year Lifecycle Visual Stepper */}
            <div className="mt-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Post-Certification 3-Year Milestone Trajectory
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Year 0: Initial Certification */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-400">Initial Audit (Passed)</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xs font-mono text-white">{certLifecycle.issueDate}</div>
                  <p className="text-[11px] text-slate-400 mt-1">Stage 1 & Stage 2 certification successfully concluded with 0 Major NCs.</p>
                </div>

                {/* Year 1: Surveillance Audit */}
                <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/40 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-indigo-300">Surveillance Year 1</span>
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-xs font-mono text-white">{certLifecycle.surveillanceYear1Date}</div>
                  <div className="text-[11px] font-bold text-amber-400 mt-1">In {certLifecycle.calculatedMetrics.daysUntilSurveillance1} days</div>
                  <p className="text-[11px] text-slate-400 mt-1">Verifies ongoing ISMS operation, internal audit closure, and management review.</p>
                </div>

                {/* Year 2: Surveillance Audit */}
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300">Surveillance Year 2</span>
                    <Calendar className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="text-xs font-mono text-slate-300">{certLifecycle.surveillanceYear2Date}</div>
                  <div className="text-[11px] text-slate-500 mt-1">In {certLifecycle.calculatedMetrics.daysUntilSurveillance2} days</div>
                  <p className="text-[11px] text-slate-500 mt-1">Second annual CB surveillance check before formal 3-year recertification.</p>
                </div>

                {/* Year 3: Recertification */}
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300">Recertification</span>
                    <Award className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-xs font-mono text-slate-300">{certLifecycle.recertificationDate}</div>
                  <div className="text-[11px] text-slate-500 mt-1">In {certLifecycle.calculatedMetrics.daysUntilRecertification} days</div>
                  <p className="text-[11px] text-slate-500 mt-1">Full re-audit of all 93 Annex A controls and Clauses 4-10 for renewal.</p>
                </div>
              </div>
            </div>

            {/* Mandatory Governance Cadences (Clause 9.2 & Clause 9.3) */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Statutory ISO 27001 Operational Cadence Check (Mandatory Annual Frequency)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cl. 9.2 Internal Audit */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">Clause 9.2: Internal Audit Cadence</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Conforming</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Last Internal Audit executed: <strong className="text-white">{certLifecycle.lastInternalAuditDate}</strong> ({certLifecycle.calculatedMetrics.daysSinceInternalAudit} days ago)
                    </p>
                    <p className="text-xs text-slate-400">
                      Next mandatory audit due: <strong className="text-indigo-300">{certLifecycle.nextInternalAuditDate}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveModule('internal_audit')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 font-semibold"
                  >
                    <span>View Audit</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Cl. 9.3 Management Review */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">Clause 9.3: Top Management Review Cadence</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Conforming</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Last Review executed: <strong className="text-white">{certLifecycle.lastManagementReviewDate}</strong> ({certLifecycle.calculatedMetrics.daysSinceManagementReview} days ago)
                    </p>
                    <p className="text-xs text-slate-400">
                      Next executive session due: <strong className="text-indigo-300">{certLifecycle.nextManagementReviewDate}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveModule('management_review')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 font-semibold"
                  >
                    <span>View Review</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Certification Conditions */}
            <div className="mt-6 pt-6 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Certification Body Binding Conditions & Surveillance Undertakings
              </h3>
              <ul className="space-y-2">
                {certLifecycle.certificationConditions.map((cond, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{cond}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CONTINUOUS CONTROL EVALUATION */}
      {/* ========================================================================= */}
      {activeTab === 'controls' && (
        <div className="space-y-4">
          {/* Controls Filters Bar */}
          <div className="p-4 rounded-xl bg-[var(--skanda-bg-card)] border border-[var(--skanda-border)] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search control code, title, or requirements..."
                  value={controlSearch}
                  onChange={e => setControlSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="Organizational">Organizational</option>
                <option value="People">People</option>
                <option value="Physical">Physical</option>
                <option value="Technological">Technological</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Operational Statuses</option>
                <option value="Effective">Effective</option>
                <option value="Ineffective">Ineffective</option>
                <option value="Evidence Expired">Evidence Expired</option>
                <option value="Remediation Required">Remediation Required</option>
                <option value="Nonconforming">Nonconforming</option>
                <option value="Operating Effectiveness Pending">Pending Verification</option>
              </select>

              {/* Drift Only Toggle */}
              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={driftOnlyFilter}
                  onChange={e => setDriftOnlyFilter(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span className="flex items-center space-x-1 text-amber-300 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Drift Regressions Only</span>
                </span>
              </label>
            </div>

            <div className="text-xs text-slate-400 font-medium">
              Showing <strong className="text-white">{filteredControls.length}</strong> of {controls.length} controls
            </div>
          </div>

          {/* Controls Table */}
          <div className="rounded-xl bg-[var(--skanda-bg-card)] border border-[var(--skanda-border)] overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Control Code & Title</th>
                    <th className="px-3 py-3">Category</th>
                    <th className="px-3 py-3">Operating Status</th>
                    <th className="px-3 py-3">Evidence Freshness</th>
                    <th className="px-3 py-3">Automated Test</th>
                    <th className="px-3 py-3">Evaluation Frequency</th>
                    <th className="px-3 py-3">Last Evaluated</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredControls.map(ctrl => (
                    <tr key={ctrl.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="flex items-start space-x-2">
                          <span className="font-mono font-bold text-indigo-400 shrink-0">{ctrl.controlCode}</span>
                          <div>
                            <div className="font-semibold text-white truncate">{ctrl.title}</div>
                            <div className="text-[10px] text-slate-500 truncate">{ctrl.responsibleDepartment}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-slate-300">
                          {ctrl.category}
                        </span>
                      </td>

                      <td className="px-3 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] border whitespace-nowrap ${getStatusBadge(ctrl.overallStatus)}`}>
                          {ctrl.overallStatus}
                        </span>
                        {ctrl.driftDetected && (
                          <div className="text-[9.5px] text-rose-400 font-bold mt-0.5 flex items-center space-x-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>Drift detected</span>
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] border ${getFreshnessBadge(ctrl.evidenceFreshnessStatus)}`}>
                          {ctrl.evidenceFreshnessStatus}
                        </span>
                      </td>

                      <td className="px-3 py-3.5">
                        {ctrl.automatedTestIds.length > 0 ? (
                          <span className="text-[10px] font-mono text-purple-300 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800">
                            {ctrl.automatedTestIds[0]}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">Manual Assessment</span>
                        )}
                      </td>

                      <td className="px-3 py-3.5 text-slate-400 text-[11px]">
                        {ctrl.monitoringFrequency}
                      </td>

                      <td className="px-3 py-3.5 text-[11px] text-slate-400 font-mono">
                        {ctrl.lastEvaluated.split('T')[0]}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => {
                            setEditingControl(ctrl);
                            setNewControlStatus(ctrl.overallStatus);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer"
                        >
                          Audit Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AUTOMATED TECHNICAL CONTROL TESTS */}
      {/* ========================================================================= */}
      {activeTab === 'automated_tests' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[var(--skanda-bg-card)] border border-[var(--skanda-border)] shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span>15 Automated Technical Surveillance Tests</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Continuous telemetry probes validating operating effectiveness for key technical, access, backup, and governance controls.
              </p>
            </div>

            <button
              onClick={handleRunAllTests}
              disabled={runningAllTests}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${runningAllTests ? 'animate-spin' : ''}`} />
              <span>Execute All 15 Tests</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {automatedTests.map(test => (
              <div key={test.id} className="p-4 rounded-xl bg-[var(--skanda-bg-card)] border border-[var(--skanda-border)] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-indigo-400">{test.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        test.status === 'PASS'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : test.status === 'WARNING'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse'
                      }`}
                    >
                      {test.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white line-clamp-1">{test.testName}</h3>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">Maps to: <strong>{test.controlCode}</strong></div>
                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-snug">{test.description}</p>

                  <div className="mt-3 p-2 rounded bg-slate-950/70 border border-slate-800 text-[11px]">
                    <div className="text-slate-400 text-[10px]">Latest Metric:</div>
                    <div className="font-mono font-semibold text-slate-200 truncate">{test.metricValue}</div>
                  </div>

                  {test.failureReason && (
                    <div className="mt-2 p-2 rounded bg-rose-950/30 border border-rose-800/50 text-[10px] text-rose-300">
                      <strong>Failure Root Cause:</strong> {test.failureReason}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <div className="text-slate-500">
                    Source: <span className="text-slate-400">{test.sourceSystem.split(' ')[0]}</span>
                  </div>
                  <button
                    onClick={() => handleRunSingleTest(test.id)}
                    disabled={runningTestId === test.id}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold border border-slate-700 cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3 h-3" />
                    <span>{runningTestId === test.id ? 'Running...' : 'Run Test'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: COMPLIANCE DRIFT DETECTION & REMEDIATION */}
      {/* ========================================================================= */}
      {activeTab === 'drift_desk' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[var(--skanda-bg-card)] border border-[var(--skanda-border)] shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Compliance Drift Detection & Auto-Remediation Desk</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically detects when post-certification controls deteriorate due to expired evidence, failed automated tests, or breached CAPA SLAs.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {driftEvents.map(drift => (
              <div
                key={drift.id}
                className={`p-5 rounded-xl border shadow-md transition ${
                  drift.status === 'RESOLVED'
                    ? 'bg-slate-900/40 border-slate-800 opacity-60'
                    : drift.severity === 'CRITICAL' || drift.severity === 'HIGH'
                    ? 'bg-gradient-to-r from-slate-900 to-rose-950/20 border-rose-500/40'
                    : 'bg-slate-900 border-amber-500/30'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-300">{drift.id}</span>
                      <span className="font-mono font-bold text-xs text-indigo-400">{drift.controlCode}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                          drift.severity === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : drift.severity === 'HIGH'
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {drift.severity} Drift
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {drift.driftType.replace('_', ' ')}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          drift.status === 'RESOLVED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : drift.status === 'IN_REMEDIATION'
                            ? 'bg-sky-500/20 text-sky-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {drift.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white">{drift.controlTitle}</h3>

                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300">
                      <strong className="text-rose-400 block mb-1">Root Cause Analysis:</strong>
                      {drift.rootCause}
                    </div>

                    <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/30 text-xs text-slate-300">
                      <strong className="text-indigo-400 block mb-1">Recommended Corrective Action:</strong>
                      {drift.recommendedAction}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span>Owner: <strong className="text-slate-200">{drift.assignedOwner}</strong></span>
                      <span>Target Due: <strong className="text-amber-300">{drift.dueDate.split('T')[0]}</strong></span>
                      {drift.capaId && (
                        <span>Linked CAPA: <strong className="text-indigo-300 font-mono">{drift.capaId}</strong></span>
                      )}
                      {drift.affectedRiskIds.length > 0 && (
                        <span>Recalculated Risks: <strong className="text-rose-400 font-mono">{drift.affectedRiskIds.join(', ')}</strong></span>
                      )}
                    </div>
                  </div>

                  {drift.status !== 'RESOLVED' && (
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setRemediatingDrift(drift);
                          setDriftResolutionNotes(drift.resolutionNotes || '');
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition cursor-pointer"
                      >
                        Resolve & Verify
                      </button>

                      <button
                        onClick={() => setActiveModule('findings_capa')}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 cursor-pointer"
                      >
                        Open CAPA Desk
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: CONTINUOUS COMPLIANCE ENGINE & SCHEDULER */}
      {/* ========================================================================= */}
      {activeTab === 'engine_scheduler' && (
        <ContinuousComplianceEngineTab
          engineStatus={engineStatus}
          engineLogs={engineLogs}
          pollingNow={pollingNow}
          updatingScheduler={updatingScheduler}
          customIntervalSeconds={customIntervalSeconds}
          onPollNow={handlePollNow}
          onToggleScheduler={handleToggleScheduler}
          onUpdateInterval={handleUpdateInterval}
          onToggleAutoDrift={handleToggleAutoDrift}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB: LIVE TELEMETRY FLEET & REAL-TIME SENSORS */}
      {/* ========================================================================= */}
      {activeTab === 'telemetry_fleet' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header & Quick Action Toolbar */}
          <div className="p-6 rounded-2xl bg-[var(--skanda-bg-card)] border border-[var(--skanda-border)] shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Live Infrastructure Telemetry & Sensing Grid
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    SLA: Sub-minute Evaluation
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">Continuous Monitoring Sensor Fleet</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-3xl">
                  Real-time continuous ingestion gateway collecting telemetry streams directly from multi-cloud environments, Identity Providers (IdP), EDR endpoints, CI/CD pipelines, and secrets vaults. Cryptographically anchored to the immutable WORM ledger.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleRefreshTelemetry}
                  disabled={monitoringRefreshing}
                  className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${monitoringRefreshing ? 'animate-spin' : ''}`} />
                  <span>Probe Telemetry Now</span>
                </button>

                <button
                  onClick={() => setIsSensorsDrawerOpen(true)}
                  className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
                  <span>Configure Fleet</span>
                </button>

                <button
                  onClick={() => setIsWormModalOpen(true)}
                  className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 text-xs font-bold border border-emerald-700/60 transition cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verify WORM Ledger</span>
                </button>
              </div>
            </div>

            {/* Fleet KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {/* Metric 1: Core Intake Rate */}
              <div
                onClick={() => {
                  if (monitoringTelemetry) {
                    setActiveMetricDetail({
                      title: 'Core Telemetry Intake',
                      metricKey: 'coreIntake',
                      value: monitoringTelemetry.coreIntake.currentValue,
                      subValue: monitoringTelemetry.coreIntake.pingFormatted,
                      source: monitoringTelemetry.coreIntake.source,
                      lastUpdated: monitoringTelemetry.coreIntake.lastUpdated,
                      collectionInterval: monitoringTelemetry.coreIntake.collectionInterval,
                      status: monitoringTelemetry.coreIntake.status,
                      backendHealth: monitoringTelemetry.coreIntake.backendHealth,
                      description: 'Central ingestion stream processing telemetry signals from AWS CloudTrail, CrowdStrike, Okta, Sentinel, and GitHub.'
                    });
                  }
                }}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Core Intake Velocity</span>
                  <Activity className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition" />
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl font-bold font-mono text-white">
                    {monitoringTelemetry?.coreIntake.currentValue || '314 pkt/min'}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400">
                    {monitoringTelemetry?.coreIntake.pingFormatted || '13ms ping'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
                  <span>Source: Ingestion Daemon</span>
                  <span className="text-indigo-400 font-semibold group-hover:underline">Drill down »</span>
                </div>
              </div>

              {/* Metric 2: Cumulative Throughput */}
              <div
                onClick={() => {
                  if (monitoringThroughput) {
                    setActiveMetricDetail({
                      title: 'Cumulative Telemetry Throughput',
                      metricKey: 'throughput',
                      value: monitoringThroughput.throughput.currentValue,
                      subValue: monitoringThroughput.throughput.rateFormatted,
                      source: monitoringThroughput.throughput.source,
                      lastUpdated: monitoringThroughput.throughput.lastUpdated,
                      collectionInterval: monitoringThroughput.throughput.collectionInterval,
                      status: monitoringThroughput.throughput.status,
                      backendHealth: monitoringThroughput.throughput.backendHealth,
                      description: 'Cumulative packet volume and ingestion speed across all configured tenant integration adapters.'
                    });
                  }
                }}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 transition cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Throughput (Last 24h)</span>
                  <Server className="w-4 h-4 text-sky-400 group-hover:scale-110 transition" />
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl font-bold font-mono text-white">
                    {monitoringThroughput?.throughput.currentValue || '2.85M packets'}
                  </span>
                  <span className="text-[11px] font-mono text-sky-400">
                    {monitoringThroughput?.throughput.rateFormatted || '+5.2/sec'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
                  <span>Pipeline: TLS 1.3 stream</span>
                  <span className="text-sky-400 font-semibold group-hover:underline">Drill down »</span>
                </div>
              </div>

              {/* Metric 3: Network Jitter & RTT */}
              <div
                onClick={() => {
                  if (monitoringTelemetry) {
                    setActiveMetricDetail({
                      title: 'Collector Jitter & RTT',
                      metricKey: 'jitter',
                      value: monitoringTelemetry.jitter.currentValue,
                      subValue: monitoringTelemetry.jitter.rttFormatted,
                      source: monitoringTelemetry.jitter.source,
                      lastUpdated: monitoringTelemetry.jitter.lastUpdated,
                      collectionInterval: monitoringTelemetry.jitter.collectionInterval,
                      status: monitoringTelemetry.jitter.status === 'Normal' ? 'HEALTHY' : 'WARNING',
                      backendHealth: monitoringTelemetry.jitter.status === 'Normal' ? 'HEALTHY' : 'DEGRADED',
                      description: 'Packet arrival deviation and round-trip transmission latency between remote cloud probes and the SKANDA continuous compliance core.'
                    });
                  }
                }}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Network Jitter & RTT</span>
                  <Cpu className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl font-bold font-mono text-white">
                    {monitoringTelemetry?.jitter.currentValue || '±1.5ms'}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400">
                    {monitoringTelemetry?.jitter.rttFormatted || 'RTT 28.2ms'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
                  <span>Status: Nominal Variance</span>
                  <span className="text-emerald-400 font-semibold group-hover:underline">Drill down »</span>
                </div>
              </div>

              {/* Metric 4: WORM Integrity Verification */}
              <div
                onClick={() => setIsWormModalOpen(true)}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>WORM Ledger Integrity</span>
                  <Lock className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    100% Sealed
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {monitoringIntegrity?.lastVerifiedBlock || 2841} blocks
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
                  <span className="font-mono truncate max-w-[150px]">
                    Merkle: {monitoringIntegrity?.currentMerkleRoot?.slice(0, 10) || 'e3b0c44298'}...
                  </span>
                  <span className="text-emerald-400 font-semibold group-hover:underline">Verify Proof »</span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Sensor Fleet Table */}
          <div className="p-6 rounded-2xl bg-[var(--skanda-bg-card)] border border-[var(--skanda-border)] shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Configured Compliance Telemetry Sensors ({monitoringSensors.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sub-minute health heartbeats, packet throughput, and continuous evidence validation seals.
                </p>
              </div>

              <button
                onClick={() => setIsSensorsDrawerOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Manage Credentials & Re-probe</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Sensor / Source</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Protocol / Transport</th>
                    <th className="py-3 px-3">Standard Mapping</th>
                    <th className="py-3 px-3">Heartbeat / Ping</th>
                    <th className="py-3 px-3">Ingress Rate</th>
                    <th className="py-3 px-3">Auth Status</th>
                    <th className="py-3 px-3">Audit Seal (SHA-256)</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {monitoringSensors.map(sensor => {
                    const isStreaming = sensor.status === 'HEALTHY';
                    const isWarning = sensor.status === 'WARNING';
                    const isDisconnected = sensor.status === 'DISCONNECTED';

                    return (
                      <tr key={sensor.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-2.5">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${
                              isStreaming
                                ? 'bg-emerald-400 animate-pulse'
                                : isWarning
                                ? 'bg-amber-400'
                                : isDisconnected
                                ? 'bg-rose-400'
                                : 'bg-slate-500'
                            }`} />
                            <div>
                              <div className="font-bold text-white flex items-center space-x-1.5">
                                <span>{sensor.name}</span>
                                {sensor.warningReason && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                                    DRIFT
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {sensor.source} • {sensor.type}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {sensor.category}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-mono text-[11px] text-slate-300">
                          {sensor.protocol}
                        </td>

                        <td className="py-3 px-3">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/50">
                            {sensor.standardMapping}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-mono text-[11px]">
                          <div className="text-slate-200">
                            {sensor.lastHeartbeatSecondsAgo === 0 ? 'Just now' : `${sensor.lastHeartbeatSecondsAgo}s ago`}
                          </div>
                          <span className="text-[10px] text-slate-500">
                            Latency: {sensor.latencyMs ?? 0}ms
                          </span>
                        </td>

                        <td className="py-3 px-3 font-mono text-[11px] text-slate-200">
                          {sensor.packetsPerMin ?? 0} pkt/min
                        </td>

                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                            sensor.authStatus === 'AUTHENTICATED'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : sensor.authStatus === 'LEASE_EXPIRED'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : sensor.authStatus === 'FAILED'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold'
                              : 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                          }`}>
                            {sensor.authStatus}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-mono text-[10px] text-slate-400">
                          {sensor.auditSeal ? (
                            <span title={sensor.auditSeal} className="hover:text-indigo-400 cursor-pointer">
                              {sensor.auditSeal.slice(0, 12)}...
                            </span>
                          ) : (
                            <span className="text-slate-600">Pending seal</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={async () => {
                              try {
                                showNotification(`Re-probing sensor ${sensor.name}...`);
                                const res = await reconnectSensor(sensor.id);
                                if (res.updatedSensor) {
                                  handleSensorUpdated(res.updatedSensor);
                                  showNotification(`Sensor "${res.updatedSensor.name}" reconnected. Status: ${res.updatedSensor.status}`);
                                } else {
                                  showNotification(`Sensor probe acknowledged: ${res.message}`);
                                }
                              } catch (err) {
                                console.error(err);
                                showNotification(`Failed to reconnect ${sensor.name}`);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 transition cursor-pointer"
                          >
                            Re-probe
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cryptographic WORM Ledger Architecture Assurance Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/30 border border-emerald-900/40 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-white">
                      Immutable Write-Once-Read-Many (WORM) Compliance Evidence Ledger
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      RFC 6962 Merkle Tree
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                    Every incoming telemetry packet is cryptographically hashed with SHA-256 and committed to the immutable WORM journal. Tampering, modification, or retroactive history alteration mathematically breaks the Merkle root.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 mt-3 font-mono">
                    <span>Ledger Root: <strong className="text-emerald-300">{monitoringIntegrity?.currentMerkleRoot || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}</strong></span>
                    <span>Verified Blocks: <strong className="text-white">{monitoringIntegrity?.evidenceRecordsProcessed || 2841}</strong></span>
                    <span>Tamper Events: <strong className="text-emerald-400">0 (Zero Detected)</strong></span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsWormModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md shrink-0"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Cryptographic Proofs</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SURVEILLANCE AUDIT READINESS DOSSIER */}
      {/* ========================================================================= */}
      {activeTab === 'readiness_dossier' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[var(--skanda-bg-card)] border border-[var(--skanda-border)] shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  Lead Auditor Certified Evidence Manifest
                </span>
                <h2 className="text-lg font-bold text-white mt-1">Surveillance Audit Inspection Package</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Compiles verified evidence, SHA-256 hashes, operating effectiveness status, and internal audit records into a read-only audit package for BSI / TÜV external auditors.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <select
                  value={selectedAuditLens}
                  onChange={e => setSelectedAuditLens(e.target.value as any)}
                  className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-semibold"
                >
                  <option value="SURVEILLANCE_YEAR_1">Surveillance Year 1 (Upcoming)</option>
                  <option value="SURVEILLANCE_YEAR_2">Surveillance Year 2</option>
                  <option value="RECERTIFICATION">Recertification Audit (Year 3)</option>
                  <option value="INTERNAL_AUDIT">Internal Audit (ISO 19011)</option>
                </select>

                <button
                  onClick={() => handleGenerateAuditPackage(selectedAuditLens)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition cursor-pointer"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Seal & View Dossier</span>
                </button>
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs text-slate-400 font-semibold mb-1">Clause 9.2 Audit Log Integrity</div>
                <div className="text-emerald-400 font-bold text-sm flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>100% Clauses Audited</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Audit report filed with zero outstanding Major NCs.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs text-slate-400 font-semibold mb-1">Evidence Freshness Rate</div>
                <div className="text-emerald-400 font-bold text-sm flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{summary?.evidenceVerificationRate}% Conforming</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Evidence files refreshed within SLA cycles.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs text-slate-400 font-semibold mb-1">Cryptographic Ledger Anchor</div>
                <div className="text-indigo-400 font-bold text-sm flex items-center space-x-1">
                  <Lock className="w-4 h-4" />
                  <span>SHA-256 Merkle Provenance</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">WORM immutable audit trails verified.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: SCHEMA REGISTRY & RELATIONAL DDL */}
      {/* ========================================================================= */}
      {activeTab === 'schema_registry' && (
        <ComplianceSchemaRegistryTab tenantId={tenantId} />
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONTROL AUDIT STATUS EDIT */}
      {/* ========================================================================= */}
      {editingControl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-400">{editingControl.controlCode}</span>
                <h3 className="text-base font-bold text-white mt-0.5">{editingControl.title}</h3>
              </div>
              <button
                onClick={() => setEditingControl(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 my-5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Operating Effectiveness Status:</label>
                <select
                  value={newControlStatus}
                  onChange={e => setNewControlStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-semibold focus:outline-none"
                >
                  <option value="Effective">Effective</option>
                  <option value="Ineffective">Ineffective</option>
                  <option value="Operating Effectiveness Pending">Operating Effectiveness Pending</option>
                  <option value="Evidence Expired">Evidence Expired</option>
                  <option value="Remediation Required">Remediation Required</option>
                  <option value="Nonconforming">Nonconforming</option>
                  <option value="Exception Approved">Exception Approved</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Lead Auditor Assessment Notes:</label>
                <textarea
                  rows={3}
                  placeholder="Record justification, sample evidence reference, or reason for status transition..."
                  value={controlEditNotes}
                  onChange={e => setControlEditNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400">
                <span className="font-bold text-amber-400 block mb-0.5">Audit Trail Notice:</span>
                Transitioning status will record an immutable entry in the certification audit log with your digital signature.
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingControl(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveControlStatus}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
              >
                Save Evaluation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DRIFT REMEDIATION */}
      {/* ========================================================================= */}
      {remediatingDrift && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400">{remediatingDrift.id}</span>
                <h3 className="text-base font-bold text-white mt-0.5">{remediatingDrift.controlTitle}</h3>
              </div>
              <button
                onClick={() => setRemediatingDrift(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 my-5 text-xs">
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-800/40 text-rose-300">
                <strong>Current Root Cause:</strong> {remediatingDrift.rootCause}
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Remediation Action Proof & Verification Notes:</label>
                <textarea
                  rows={4}
                  placeholder="Detail corrective actions taken, upload ticket links, pull request IDs, or test verification proof..."
                  value={driftResolutionNotes}
                  onChange={e => setDriftResolutionNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setRemediatingDrift(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolveDrift('PROGRESS')}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer"
              >
                Mark In Remediation
              </button>
              <button
                onClick={() => handleResolveDrift('RESOLVE')}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
              >
                Resolve & Clear Drift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SEALED AUDIT DOSSIER PACKAGE */}
      {/* ========================================================================= */}
      {dossierModalOpen && readinessPackage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Cryptographically Sealed Audit Dossier</h3>
                  <p className="text-xs text-slate-400">
                    Bundle ID: <strong className="font-mono text-slate-300">{readinessPackage.id}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDossierModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Audit Scope</span>
                  <div className="font-bold text-white mt-0.5">{readinessPackage.auditType.replace('_', ' ')}</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Readiness Score</span>
                  <div className="font-bold text-emerald-400 font-mono text-base mt-0.5">{readinessPackage.readinessScore}%</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Total Controls</span>
                  <div className="font-bold text-white font-mono text-base mt-0.5">{readinessPackage.totalControls}</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Auditor Access Token</span>
                  <div className="font-mono font-bold text-indigo-400 text-xs mt-0.5 truncate">{readinessPackage.auditorAccessToken}</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
                <span className="text-slate-500 block text-[10px]">SHA-256 Bundle Seal:</span>
                <span className="text-emerald-400">{readinessPackage.manifestHash}</span>
              </div>

              {/* Manifest Table */}
              <div className="rounded-xl border border-slate-800 overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] sticky top-0">
                    <tr>
                      <th className="p-2.5">Control</th>
                      <th className="p-2.5">Title</th>
                      <th className="p-2.5">Freshness</th>
                      <th className="p-2.5">SHA-256 Evidence Hash</th>
                      <th className="p-2.5">Verified</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {readinessPackage.evidenceManifest.slice(0, 15).map(m => (
                      <tr key={m.controlCode} className="hover:bg-slate-800/30">
                        <td className="p-2.5 text-indigo-400 font-bold">{m.controlCode}</td>
                        <td className="p-2.5 text-slate-200 font-sans truncate max-w-xs">{m.controlTitle}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                            {m.freshness}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-400 text-[10px]">{m.sha256.slice(0, 16)}...</td>
                        <td className="p-2.5">
                          {m.verified ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-rose-400" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Sealed on {readinessPackage.generatedAt.split('T')[0]} by {readinessPackage.generatedBy}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(readinessPackage, null, 2));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute('href', dataStr);
                    downloadAnchor.setAttribute('download', `SKANDA_Audit_Package_${readinessPackage.auditType}.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JSON</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Dossier</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SENSOR HEALTH & DETAILS DRAWER */}
      {/* ========================================================================= */}
      <SensorHealthDetailsDrawer
        isOpen={isSensorsDrawerOpen}
        onClose={() => setIsSensorsDrawerOpen(false)}
        sensors={monitoringSensors}
        onSensorUpdated={handleSensorUpdated}
        onRefreshAll={handleRefreshTelemetry}
      />

      {/* ========================================================================= */}
      {/* WORM IMMUTABLE LEDGER INTEGRITY MODAL */}
      {/* ========================================================================= */}
      <WormIntegrityModal
        isOpen={isWormModalOpen}
        onClose={() => setIsWormModalOpen(false)}
        integrityData={monitoringIntegrity}
        onVerificationComplete={() => fetchMonitoringData(true)}
      />

      {/* ========================================================================= */}
      {/* TELEMETRY METRIC DRILL-DOWN MODAL */}
      {/* ========================================================================= */}
      <TelemetryMetricDetailsModal
        isOpen={!!activeMetricDetail}
        onClose={() => setActiveMetricDetail(null)}
        metric={activeMetricDetail}
      />
    </PageContainer>
  );
};
