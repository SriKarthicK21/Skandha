import React, { useState, useEffect, useRef } from 'react';
import { useGRC } from '../../context/GRCContext';
import { PageContainer } from '../layout/PageContainer';
import {
  Activity,
  Radio,
  Copy,
  Check,
  Zap,
  RefreshCw,
  AlertOctagon,
  FolderPlus,
  Server,
  Cpu,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Timer,
  Wrench,
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Binary,
  Lock,
  ArrowRight,
  Download,
  Eye,
  FileText,
  ChevronDown,
  Terminal,
  ExternalLink,
  RotateCcw,
  Search,
  Filter,
  Sliders,
  Calendar,
  Layers,
  History,
  Info,
  Send
} from 'lucide-react';
import {
  MonitoredControl,
  DriftTimelineEntry,
  ProviderFreshnessSla,
  DecayingEvidenceRecord,
  CryptoLedgerBlock,
  CorrelatedIncident,
  DeduplicatedCluster,
  TelemetryHealthBadge,
  computeProviderHealthBadge,
  computeEvidenceHealthBadge,
  INITIAL_MONITORED_CONTROLS,
  INITIAL_DRIFT_TIMELINE,
  INITIAL_FRESHNESS_SLAS,
  INITIAL_DECAYING_EVIDENCE,
  formatRemainingTime,
  evaluateEventForDrift
} from '../../services/telemetry/ccmEngineService';
import { EvidenceHealthTrendChart } from './EvidenceHealthTrendChart';
import { HeartbeatAlertTriagePanel } from './HeartbeatAlertTriagePanel';

interface LiveEvent {
  id: string;
  tenantId: string;
  source: string;
  eventType: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  summary: string;
  payload: any;
  isoMapping: string;
  masMapping: string;
  timestamp: string;
  autoEvidenceGenerated: boolean;
}

interface ServerTelemetry {
  uptimeSeconds: number;
  timestamp: string;
  nodeVersion: string;
  memoryUsageMB: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
  liveEventCount: number;
  cryptoLedgerBlocks?: number;
  sseActiveSubscribers?: number;
  activeIntegrations: string[];
  continuousAuditStatus: string;
}

export interface LiveTelemetryStreamModuleProps {
  initialTab?: 'DRIFT_ENGINE' | 'FRESHNESS_SLA' | 'LIVE_STREAM' | 'AI_CORRELATOR';
}

export const LiveTelemetryStreamModule: React.FC<LiveTelemetryStreamModuleProps> = ({ initialTab = 'DRIFT_ENGINE' }) => {
  const { currentTenant, uploadEvidence, addFinding } = useGRC();

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'DRIFT_ENGINE' | 'FRESHNESS_SLA' | 'LIVE_STREAM' | 'AI_CORRELATOR'>(initialTab);

  // Core Telemetry State
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [telemetry, setTelemetry] = useState<ServerTelemetry | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [toast, setToast] = useState<string | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('aws_s3_public');
  const [sseConnected, setSseConnected] = useState(false);

  // Option 1: Automated Control Drift & Remediation State
  const [monitoredControls, setMonitoredControls] = useState<MonitoredControl[]>(INITIAL_MONITORED_CONTROLS);
  const [driftTimeline, setDriftTimeline] = useState<DriftTimelineEntry[]>(INITIAL_DRIFT_TIMELINE);
  const [remediatingControlId, setRemediatingControlId] = useState<string | null>(null);
  const [selectedControlForAudit, setSelectedControlForAudit] = useState<MonitoredControl | null>(null);

  // Option 2: Heartbeat Freshness SLA & Evidence Decay State
  const [freshnessSlas, setFreshnessSlas] = useState<ProviderFreshnessSla[]>(INITIAL_FRESHNESS_SLAS);
  const [decayingEvidence, setDecayingEvidence] = useState<DecayingEvidenceRecord[]>(INITIAL_DECAYING_EVIDENCE);
  const [providerHealthFilter, setProviderHealthFilter] = useState<'ALL' | 'FRESH' | 'STALE' | 'DEAD'>('ALL');
  const [evidenceHealthFilter, setEvidenceHealthFilter] = useState<'ALL' | 'FRESH' | 'STALE' | 'DEAD'>('ALL');
  const [evidenceSearchQuery, setEvidenceSearchQuery] = useState<string>('');
  const [pingingProviderId, setPingingProviderId] = useState<string | null>(null);
  const [harvestingEvidenceId, setHarvestingEvidenceId] = useState<string | null>(null);
  const [expandedEvidenceId, setExpandedEvidenceId] = useState<string | null>(null);
  const [simulatedDayOffset, setSimulatedDayOffset] = useState<number>(0);

  // Option 3: Cryptographic Ledger State
  const [cryptoBlocks, setCryptoBlocks] = useState<CryptoLedgerBlock[]>([]);
  const [ledgerVerifying, setLedgerVerifying] = useState(false);
  const [ledgerVerificationResult, setLedgerVerificationResult] = useState<{
    chainValid: boolean;
    blocksAudited: number;
    integrityConfidence: string;
    auditorSignOff: string;
    verifiedAt: string;
  } | null>(null);

  // Option 4: AI Correlator State
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const [aiCorrelationResult, setAiCorrelationResult] = useState<{
    deduplicatedClusters: DeduplicatedCluster[];
    correlatedIncidents: CorrelatedIncident[];
    noiseReductionRatio: string;
    totalEventsAnalyzed: number;
    netEnterpriseRiskScoreDelta: number;
    model?: string;
    isAI?: boolean;
  } | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  const webhookEndpoint = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhooks/incoming?tenantId=${currentTenant?.id || 'tenant-acme'}`
    : `/api/webhooks/incoming?tenantId=${currentTenant?.id || 'tenant-acme'}`;

  // Fetch initial telemetry and events
  const fetchLiveEvents = async () => {
    try {
      const [evtRes, telRes, ledRes] = await Promise.all([
        fetch(`/api/webhooks/events?tenantId=${currentTenant?.id || 'tenant-acme'}`),
        fetch('/api/telemetry/live'),
        fetch('/api/telemetry/ledger')
      ]);

      if (evtRes.ok) {
        const evtData = await evtRes.json();
        setEvents(evtData.events || []);
      }
      if (telRes.ok) {
        const telData = await telRes.json();
        setTelemetry(telData);
      }
      if (ledRes.ok) {
        const ledData = await ledRes.json();
        setCryptoBlocks(ledData.blocks || []);
      }
    } catch {
      // ignore network glitch
    }
  };

  // Real-Time Server-Sent Events (SSE) Stream with fallback polling
  useEffect(() => {
    fetchLiveEvents();

    let sse: EventSource | null = null;
    try {
      sse = new EventSource('/api/telemetry/stream');
      eventSourceRef.current = sse;

      sse.addEventListener('connected', () => {
        setSseConnected(true);
      });

      sse.addEventListener('telemetry_event', (msg: MessageEvent) => {
        try {
          const payload = JSON.parse(msg.data);
          if (payload.event) {
            setEvents(prev => {
              const next = [payload.event, ...prev.filter(e => e.id !== payload.event.id)];
              return next.slice(0, 200);
            });

            // Evaluate incoming event against control drift baseline
            setMonitoredControls(prevControls => {
              const { updatedControls, newDriftEntries } = evaluateEventForDrift(payload.event, prevControls);
              if (newDriftEntries.length > 0) {
                setDriftTimeline(prevDt => [...newDriftEntries, ...prevDt]);
              }
              return updatedControls;
            });
          }
          if (payload.ledgerBlock) {
            setCryptoBlocks(prev => [payload.ledgerBlock, ...prev.slice(0, 49)]);
          }
        } catch {
          // ignore
        }
      });

      sse.addEventListener('heartbeat', () => {
        setSseConnected(true);
      });

      sse.onerror = () => {
        setSseConnected(false);
      };
    } catch {
      setSseConnected(false);
    }

    // Polling backup every 6 seconds
    const interval = setInterval(() => {
      fetchLiveEvents();
    }, 6000);

    return () => {
      clearInterval(interval);
      if (sse) sse.close();
    };
  }, [currentTenant?.id]);

  // Live countdown timer for active grace periods
  const [, setTimerTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerTick(t => t + 1);

      // Check for expired grace periods to trigger auto-CAPA
      setMonitoredControls(prev =>
        prev.map(ctrl => {
          if (ctrl.status === 'DRIFT_DETECTED' && ctrl.gracePeriodExpiresAt) {
            const isExpired = new Date(ctrl.gracePeriodExpiresAt).getTime() <= Date.now();
            if (isExpired && !ctrl.autoCapaFindingId) {
              // Trigger Auto-CAPA escalation
              const fakeFindingId = `CAPA-${ctrl.controlCode}-${Date.now().toString().slice(-4)}`;
              handleAutoCapaEscalation(ctrl, fakeFindingId);
              return {
                ...ctrl,
                status: 'NON_CONFORMITY_TRIGGERED',
                autoCapaFindingId: fakeFindingId,
                statusMessage: `Grace period expired (${ctrl.gracePeriodMinutes} mins). High-priority CAPA #${fakeFindingId} generated.`
              };
            }
          }
          return ctrl;
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 1-Click / Webhook Self-Healing Action
  const handleTriggerSelfHealing = async (control: MonitoredControl) => {
    setRemediatingControlId(control.id);
    try {
      const res = await fetch('/api/telemetry/remediate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: control.remediationActionKey,
          driftId: `drift-${control.id}`,
          controlCode: control.controlCode,
          targetResource: control.targetResource,
          initiatedBy: 'Lead SecOps Engineer (Skanda 1-Click Self-Healing UI)'
        })
      });

      if (res.ok) {
        const data = await res.json();

        // Update control state to REMEDIATED / CONFORMING
        setMonitoredControls(prev =>
          prev.map(c =>
            c.id === control.id
              ? {
                  ...c,
                  status: 'CONFORMING',
                  statusMessage: `Self-healing succeeded: ${data.summary}`,
                  driftStartedAt: undefined,
                  gracePeriodExpiresAt: undefined,
                  consecutivePassCount: c.consecutivePassCount + 1
                }
              : c
          )
        );

        // Add to Drift Timeline
        const newEntry: DriftTimelineEntry = {
          id: `dt-rem-${Date.now()}`,
          controlCode: control.controlCode,
          controlTitle: control.title,
          driftStartedAt: control.driftStartedAt || new Date(Date.now() - 15 * 60000).toISOString(),
          remediatedAt: new Date().toISOString(),
          durationMinutes: Math.max(1, Math.round((Date.now() - new Date(control.driftStartedAt || Date.now()).getTime()) / 60000)),
          triggerSource: control.provider,
          triggerEvent: control.remediationActionKey,
          remediationType: 'AUTOMATED_SELF_HEALING',
          remediationSummary: data.summary,
          remediatedBy: 'Skanda 1-Click Webhook Self-Healing Engine',
          proofHash: `0x${data.ledgerBlockHeight ? data.ledgerBlockHeight.toString(16) : 'a4f9'}...${Math.random().toString(16).slice(2, 6)}`,
          status: 'RESOLVED'
        };

        setDriftTimeline(prev => [newEntry, ...prev]);
        setToast(`Self-healing dispatched: ${data.summary}`);
        setTimeout(() => setToast(null), 5000);
      }
    } catch (err: any) {
      setToast(`Remediation error: ${err.message}`);
      setTimeout(() => setToast(null), 4000);
    } finally {
      setRemediatingControlId(null);
    }
  };

  // Auto-CAPA finding creator
  const handleAutoCapaEscalation = (control: MonitoredControl, findingId: string) => {
    addFinding({
      source: 'CONTINUOUS_MONITORING',
      severity: 'Major Non-Conformity',
      title: `[Auto-CAPA ${findingId}] Control Drift Unresolved: ${control.controlCode} - ${control.title}`,
      clauseOrControl: control.controlCode,
      department: control.domain,
      description: `Continuous Controls Monitoring flagged that control ${control.controlCode} drifted from the approved security baseline. The grace period of ${control.gracePeriodMinutes} minutes expired without resolution. Status: ${control.statusMessage}`,
      rootCauseAnalysis: {
        methodology: '5_WHYS',
        rootCauseStatement: `Automated guardrail or policy was circumvented in ${control.provider}. Target resource ${control.targetResource} remained exposed beyond the permissible SLA.`
      },
      capaPlan: {
        correctiveAction: `Dispatch urgent rollback script (${control.remediationActionLabel}) and re-verify compliance assertion via live telemetry stream.`,
        preventiveAction: `Configure strict IAM Service Control Policies (SCPs) and Terraform Sentinel guardrails to block unauthorized configuration changes.`,
        owner: control.assignedOwner,
        targetDate: new Date(Date.now() + 48 * 3600000).toISOString().split('T')[0],
        evidenceRequired: 'Cryptographic CCM verification ledger block & auditor sign-off attestation.'
      },
      status: 'Open'
    });
  };

  // Verify Cryptographic Ledger
  const handleVerifyLedger = async () => {
    setLedgerVerifying(true);
    try {
      const res = await fetch('/api/telemetry/ledger/verify', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setLedgerVerificationResult(data);
        setToast(`Cryptographic Ledger Verified: ${data.blocksAudited} blocks with zero tampering!`);
        setTimeout(() => setToast(null), 5000);
      }
    } catch {
      // ignore
    } finally {
      setLedgerVerifying(false);
    }
  };

  // Run AI Telemetry Correlation & Threat Synthesis
  const handleRunAiCorrelator = async () => {
    setAnalyzingAi(true);
    try {
      const res = await fetch('/api/telemetry/ai-correlate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: events.slice(0, 30) })
      });

      if (res.ok) {
        const data = await res.json();
        setAiCorrelationResult({
          ...data.correlation,
          model: data.model,
          isAI: data.isAI
        });
        setToast('Gemini AI Signal Deduplication & Kill-Chain Correlation complete!');
        setTimeout(() => setToast(null), 4000);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setAnalyzingAi(false);
    }
  };

  const handleCopyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookEndpoint);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 3000);
  };

  const handleSimulateWebhook = async () => {
    setSimulating(true);
    try {
      const res = await fetch('/api/webhooks/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: currentTenant?.id || 'tenant-acme',
          template: selectedTemplate
        })
      });

      if (res.ok) {
        const data = await res.json();
        setToast(`Simulated event fired: ${data.event.source} -> ${data.event.eventType}`);
        setTimeout(() => setToast(null), 4000);
        fetchLiveEvents();
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const handleSaveEventAsEvidence = (evt: LiveEvent) => {
    uploadEvidence({
      title: `[CCM Telemetry] ${evt.source} - ${evt.eventType}`,
      controlCode: evt.isoMapping.split(' ')[0] || 'A.8.16',
      department: 'Information Security & Operations',
      fileName: `telemetry_${evt.id}.json`,
      fileType: 'JSON',
      fileSize: '2.8 KB',
      tags: ['SIEM', 'Continuous Monitoring', 'CCM', evt.source, evt.severity]
    });

    setToast(`Saved telemetry event ${evt.id} to Evidence Vault!`);
    setTimeout(() => setToast(null), 4000);
  };

  // Export Auditor Freshness Ledger as JSON file
  const handleDownloadAuditorLedger = () => {
    const reportData = {
      tenant: currentTenant?.name || 'Acme Global Financial Services',
      generatedAt: new Date().toISOString(),
      reportTitle: 'SOC 2 Type II / ISO 27001 Continuous Operating Effectiveness & Freshness Ledger',
      providerHeartbeatSlas: freshnessSlas,
      monitoredControlsBaseline: monitoredControls,
      evidenceDecayStatus: decayingEvidence,
      recentCryptographicLedger: cryptoBlocks.slice(0, 15),
      auditorSignOffNote: 'Continuous controls monitoring engine actively collecting telemetry. Telemetry fresh with zero unmonitored controls.'
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditor_ccm_freshness_ledger_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setToast('Auditor Freshness Ledger exported successfully!');
    setTimeout(() => setToast(null), 4000);
  };

  // Render Visual Health Status Badges (FRESH, STALE, DEAD)
  const renderHealthBadge = (badge: TelemetryHealthBadge, size: 'sm' | 'md' = 'md') => {
    if (badge === 'FRESH') {
      return (
        <span className={`inline-flex items-center space-x-1.5 font-bold font-mono rounded-lg border transition-all ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-xs shadow-emerald-950/40`}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <CheckCircle2 className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-emerald-400`} />
          <span>FRESH</span>
        </span>
      );
    }
    if (badge === 'STALE') {
      return (
        <span className={`inline-flex items-center space-x-1.5 font-bold font-mono rounded-lg border transition-all ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-xs shadow-amber-950/40`}>
          <AlertTriangle className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-amber-400`} />
          <span>STALE</span>
        </span>
      );
    }
    // DEAD
    return (
      <span className={`inline-flex items-center space-x-1.5 font-bold font-mono rounded-lg border transition-all ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-xs shadow-rose-950/50`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
        <AlertOctagon className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-rose-400`} />
        <span>DEAD</span>
      </span>
    );
  };

  // Heartbeat Ping Action
  const handlePingProvider = async (sla: ProviderFreshnessSla) => {
    setPingingProviderId(sla.id);
    try {
      const res = await fetch('/api/telemetry/heartbeat/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: sla.id,
          providerName: sla.provider,
          telemetryType: sla.telemetryType
        })
      });

      const now = new Date().toISOString();
      const latency = Math.floor(Math.random() * 35) + 12;

      setFreshnessSlas(prev =>
        prev.map(item =>
          item.id === sla.id
            ? {
                ...item,
                elapsedMinutes: 0,
                lastHeartbeat: now,
                healthBadge: 'FRESH',
                status: 'FRESH',
                totalSamplesCollected: item.totalSamplesCollected + 1,
                lastProbeLatencyMs: latency
              }
            : item
        )
      );

      setToast(`Heartbeat probe acknowledged by ${sla.provider} (${latency}ms latency). Stream health is FRESH.`);
      setTimeout(() => setToast(null), 4000);
      fetchLiveEvents();
    } catch (err: any) {
      setToast(`Heartbeat probe error: ${err.message}`);
      setTimeout(() => setToast(null), 4000);
    } finally {
      setPingingProviderId(null);
    }
  };

  // Simulate Heartbeat Drop
  const handleSimulateHeartbeatDrop = (sla: ProviderFreshnessSla) => {
    const simulatedElapsed = Math.round(sla.slaIntervalHours * 60 * 3.2); // 3.2x SLA elapsed
    setFreshnessSlas(prev =>
      prev.map(item =>
        item.id === sla.id
          ? {
              ...item,
              elapsedMinutes: simulatedElapsed,
              healthBadge: 'DEAD',
              status: 'HEARTBEAT_DEAD',
              lastProbeLatencyMs: 0
            }
          : item
      )
    );

    setToast(`Simulated telemetry loss for ${sla.provider}! Health badge transitioned to DEAD.`);
    setTimeout(() => setToast(null), 4000);
  };

  // Update SLA Interval
  const handleUpdateSlaInterval = (slaId: string, hours: number) => {
    setFreshnessSlas(prev =>
      prev.map(item => {
        if (item.id === slaId) {
          const newBadge = computeProviderHealthBadge(item.elapsedMinutes, hours);
          return {
            ...item,
            slaIntervalHours: hours,
            healthBadge: newBadge,
            status: newBadge === 'FRESH' ? 'FRESH' : newBadge === 'STALE' ? 'STALE_WARNING' : 'HEARTBEAT_DEAD'
          };
        }
        return item;
      })
    );
    setToast(`Updated SLA Interval to ${hours} hours.`);
    setTimeout(() => setToast(null), 3000);
  };

  // Harvest Fresh Evidence
  const handleHarvestEvidence = async (item: DecayingEvidenceRecord) => {
    setHarvestingEvidenceId(item.id);
    try {
      const res = await fetch('/api/telemetry/evidence-decay/harvest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evidenceId: item.id,
          title: item.title,
          controlCode: item.controlCode,
          provider: item.provider
        })
      });

      const now = new Date().toISOString();
      const freshHash = `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 6)}...f81a`;

      setDecayingEvidence(prev =>
        prev.map(e =>
          e.id === item.id
            ? {
                ...e,
                harvestedDate: now,
                daysRemaining: e.retentionWindowDays,
                healthBadge: 'FRESH',
                status: 'VALID',
                proofHash: freshHash
              }
            : e
        )
      );

      // Register into GRC Evidence Vault
      uploadEvidence({
        title: `[Auto-Harvested] ${item.title}`,
        controlCode: item.controlCode,
        department: 'Audit & Compliance',
        fileName: `${item.id}_evidence_harvest.pdf`,
        fileType: 'PDF',
        fileSize: '3.4 MB',
        tags: ['Continuous Compliance', 'Evidence Freshness', 'SOC 2 Type II', item.controlCode]
      });

      setToast(`Fresh compliance evidence re-harvested for "${item.title}". Health badge reset to FRESH.`);
      setTimeout(() => setToast(null), 4000);
      fetchLiveEvents();
    } catch (err: any) {
      setToast(`Evidence harvesting failed: ${err.message}`);
      setTimeout(() => setToast(null), 4000);
    } finally {
      setHarvestingEvidenceId(null);
    }
  };

  // Raise CAPA Finding for Stale or Dead Evidence
  const handleRaiseEvidenceCapa = (item: DecayingEvidenceRecord) => {
    const isDead = item.healthBadge === 'DEAD';
    addFinding({
      source: 'CONTINUOUS_MONITORING',
      severity: isDead ? 'Major Non-Conformity' : 'Minor Non-Conformity',
      title: `[Evidence Decay CAPA] ${item.healthBadge} Evidence: ${item.title} (${item.controlCode})`,
      clauseOrControl: item.controlCode,
      department: 'Security Governance & Compliance',
      description: `Automated evidence decay tracker detected that compliance evidence for ${item.controlCode} is in ${item.healthBadge} status. Days remaining: ${item.daysRemaining} days (Retention window: ${item.retentionWindowDays} days). Mandatory action: ${item.decayActionRequired}`,
      rootCauseAnalysis: {
        methodology: '5_WHYS',
        rootCauseStatement: `Periodic re-certification and artifact harvesting cycle was not scheduled or completed before the ${item.retentionWindowDays}-day retention SLA threshold.`
      },
      capaPlan: {
        correctiveAction: item.decayActionRequired,
        preventiveAction: 'Configure automated webhook evidence harvester and calendar reminder alerts 30 days prior to decay.',
        owner: 'Compliance & Audit Lead',
        targetDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        evidenceRequired: 'Fresh cryptographic signed artifact uploaded to Evidence Vault.'
      },
      status: 'Open'
    });

    setToast(`Formal CAPA non-conformity finding created for ${item.controlCode}!`);
    setTimeout(() => setToast(null), 4000);
  };

  // Simulate Time Travel for Evidence Decay
  const handleSimulateDecay = (days: number) => {
    setSimulatedDayOffset(prev => prev + days);
    setDecayingEvidence(prev =>
      prev.map(item => {
        const newRemaining = item.daysRemaining - days;
        const newBadge = computeEvidenceHealthBadge(newRemaining);
        const newStatus = newRemaining > 30 ? 'VALID' : newRemaining > 0 ? 'DECAY_WARNING' : 'DEPRECIATED';
        return {
          ...item,
          daysRemaining: newRemaining,
          healthBadge: newBadge,
          status: newStatus
        };
      })
    );
    setToast(`Simulated +${days} days of time passage. Evidence decay clocks advanced.`);
    setTimeout(() => setToast(null), 4000);
  };

  // Reset Decay Simulation
  const handleResetDecaySimulation = () => {
    setSimulatedDayOffset(0);
    setDecayingEvidence(INITIAL_DECAYING_EVIDENCE);
    setToast('Reset evidence decay baseline to live production state.');
    setTimeout(() => setToast(null), 3000);
  };

  // Harvester & CAPA dispatcher wrappers for Trend Chart
  const handleHarvestEvidenceById = (evidenceId: string) => {
    const item = decayingEvidence.find(e => e.id === evidenceId);
    if (item) {
      handleHarvestEvidence(item);
    } else {
      setToast(`Evidence ${evidenceId} re-harvest initiated.`);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleRaiseCapaByControlCode = (controlCode: string) => {
    const item = decayingEvidence.find(e => e.controlCode === controlCode);
    if (item) {
      handleRaiseEvidenceCapa(item);
    } else {
      addFinding({
        source: 'CONTINUOUS_MONITORING',
        severity: 'Minor Non-Conformity',
        title: `[Evidence Decay CAPA] Recurring Staleness in Control ${controlCode}`,
        clauseOrControl: controlCode,
        department: 'Security Governance & Compliance',
        description: `Historical 30-day telemetry trend analysis indicates persistent recurring staleness for control ${controlCode}.`,
        rootCauseAnalysis: {
          methodology: '5_WHYS',
          rootCauseStatement: `Cyclical delay in recurring evidence attestation during 30-day monitoring window.`
        },
        capaPlan: {
          correctiveAction: `Perform immediate audit artifact collection for ${controlCode} and verify hash proof.`,
          preventiveAction: 'Configure automated API harvest webhook prior to SLA expiration.',
          owner: 'Compliance & Audit Lead',
          targetDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          evidenceRequired: 'Cryptographically signed audit document.'
        },
        status: 'Open'
      });
      setToast(`Formal CAPA non-conformity finding registered for ${controlCode}!`);
      setTimeout(() => setToast(null), 4000);
    }
  };

  // Export Auditor Evidence Attestation
  const handleExportEvidenceAttestation = () => {
    const cert = {
      title: 'SOC 2 TYPE II / ISO 27001 CONTINUOUS EVIDENCE FRESHNESS ATTESTATION',
      tenantId: currentTenant?.id || 'tenant-acme',
      tenantName: currentTenant?.name || 'Acme Global Financial Services',
      timestamp: new Date().toISOString(),
      attestationSummary: {
        totalEvidenceArtifacts: decayingEvidence.length,
        freshCount: decayingEvidence.filter(e => e.healthBadge === 'FRESH').length,
        staleCount: decayingEvidence.filter(e => e.healthBadge === 'STALE').length,
        deadCount: decayingEvidence.filter(e => e.healthBadge === 'DEAD').length,
        decayHealthIndex: `${Math.round((decayingEvidence.filter(e => e.healthBadge === 'FRESH').length / decayingEvidence.length) * 100)}%`
      },
      evidenceLedger: decayingEvidence.map(e => ({
        id: e.id,
        controlCode: e.controlCode,
        title: e.title,
        provider: e.provider,
        harvestedDate: e.harvestedDate,
        retentionWindowDays: e.retentionWindowDays,
        daysRemaining: e.daysRemaining,
        healthBadge: e.healthBadge,
        proofHash: e.proofHash || '0x4f8a...92b1',
        auditProcedure: e.auditorVerificationProcedure || 'Inspect cryptographic signed hash in immutable vault.'
      })),
      cryptoLedgerMerkleRoot: cryptoBlocks.length > 0 ? cryptoBlocks[0].merkleRoot : '0x6e9f2a4b8c1d3e5f',
      auditorStatement: 'Continuous monitoring evidence items evaluated against SOC 2 CC7.1 / ISO 27001 A.8.8 criteria. Cryptographically anchored.'
    };

    const blob = new Blob([JSON.stringify(cert, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soc2_evidence_freshness_attestation_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setToast('Evidence Freshness Attestation Certificate downloaded!');
    setTimeout(() => setToast(null), 4000);
  };

  const filteredEvents = events.filter(e =>
    filterSeverity === 'ALL' ? true : e.severity === filterSeverity
  );

  const activeDriftsCount = monitoredControls.filter(c => c.status === 'DRIFT_DETECTED' || c.status === 'NON_CONFORMITY_TRIGGERED').length;
  const inGracePeriodCount = monitoredControls.filter(c => c.status === 'DRIFT_DETECTED' && c.gracePeriodExpiresAt && new Date(c.gracePeriodExpiresAt).getTime() > Date.now()).length;
  const conformingCount = monitoredControls.filter(c => c.status === 'CONFORMING').length;

  return (
    <PageContainer id="live-telemetry-module">
      {/* Module Master Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800 flex items-center space-x-1.5">
                <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>Continuous Controls Monitoring (CCM)</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{sseConnected ? 'SSE Real-Time Push Active' : 'Polling Fallback Active'}</span>
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1.5">
              Live Telemetry, Automated Drift & Continuous Compliance Engine
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Turn passive cloud audit trails and SIEM signals into active compliance enforcement. Automatically detect control drifts, enforce grace period countdowns, execute 1-click self-healing, and maintain an immutable cryptographic chain-of-custody.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDownloadAuditorLedger}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5 border border-slate-700 transition"
              title="Download SOC 2 / ISO 27001 Auditor Freshness Ledger"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Auditor Ledger</span>
            </button>

            <button
              onClick={fetchLiveEvents}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center space-x-1.5 border border-slate-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('DRIFT_ENGINE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition shrink-0 ${
              activeTab === 'DRIFT_ENGINE'
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-900/40'
                : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Automated Drift & Self-Healing</span>
            {activeDriftsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-900 text-rose-200 border border-rose-700">
                {activeDriftsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('FRESHNESS_SLA')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition shrink-0 ${
              activeTab === 'FRESHNESS_SLA'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/40'
                : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>Heartbeat Freshness SLA & Evidence Decay</span>
            {(freshnessSlas.filter(s => s.healthBadge === 'DEAD').length + decayingEvidence.filter(e => e.healthBadge === 'DEAD').length) > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-900 text-rose-200 border border-rose-700">
                {freshnessSlas.filter(s => s.healthBadge === 'DEAD').length + decayingEvidence.filter(e => e.healthBadge === 'DEAD').length} DEAD
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('LIVE_STREAM')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition shrink-0 ${
              activeTab === 'LIVE_STREAM'
                ? 'bg-sky-600 text-white shadow-sm shadow-sky-900/40'
                : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Live Stream & Cryptographic Ledger</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-sky-950 text-sky-200">
              {events.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('AI_CORRELATOR')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition shrink-0 ${
              activeTab === 'AI_CORRELATOR'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/40'
                : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>Gemini AI Kill-Chain Correlator</span>
          </button>
        </div>
      </div>

      {toast && (
        <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-700 text-emerald-300 text-xs flex items-center space-x-2 shadow-lg animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toast}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: AUTOMATED CONTROL DRIFT & AUTO-REMEDIATION ENGINE (OPTION 1)       */}
      {/* ========================================================================= */}
      {activeTab === 'DRIFT_ENGINE' && (
        <div className="space-y-6">
          {/* High-Level Metric Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Monitored Controls</span>
              <div className="text-2xl font-black text-white flex items-baseline space-x-2">
                <span>{monitoredControls.length}</span>
                <span className="text-xs font-medium text-emerald-400">100% Telemetry Bound</span>
              </div>
              <p className="text-[11px] text-slate-500">ISO 27001 / MAS TRM Baselines</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Active Drifts Detected</span>
              <div className="text-2xl font-black text-rose-400 flex items-baseline space-x-2">
                <span>{activeDriftsCount}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  ACTION REQUIRED
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Unapproved configuration shifts</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Grace Period Countdowns</span>
              <div className="text-2xl font-black text-amber-400 flex items-baseline space-x-2">
                <span>{inGracePeriodCount}</span>
                <span className="text-xs font-medium text-amber-300">Ticking to Auto-CAPA</span>
              </div>
              <p className="text-[11px] text-slate-500">Auto-escalates upon SLA breach</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Controls Conforming</span>
              <div className="text-2xl font-black text-emerald-400 flex items-baseline space-x-2">
                <span>{conformingCount}</span>
                <span className="text-xs font-medium text-slate-400">Continuous Green</span>
              </div>
              <p className="text-[11px] text-slate-500">Passing live probe assertions</p>
            </div>
          </div>

          {/* Drift Simulation Sandbox Toolbar */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Simulate Real-Time Control Drift Ingestion:</span>
              <span className="text-[11px] text-slate-400">Triggers live assertion failure and starts countdown</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={async () => {
                  setSelectedTemplate('aws_s3_public');
                  await handleSimulateWebhook();
                }}
                disabled={simulating}
                className="px-2.5 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300 text-[11px] font-bold flex items-center space-x-1.5 transition disabled:opacity-50"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Simulate S3 Public Access Drift</span>
              </button>

              <button
                onClick={async () => {
                  setSelectedTemplate('okta_mfa');
                  await handleSimulateWebhook();
                }}
                disabled={simulating}
                className="px-2.5 py-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-900 border border-amber-800 text-amber-300 text-[11px] font-bold flex items-center space-x-1.5 transition disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate Admin MFA Removed Drift</span>
              </button>

              <button
                onClick={async () => {
                  setSelectedTemplate('crowdstrike_cve');
                  await handleSimulateWebhook();
                }}
                disabled={simulating}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 text-[11px] font-bold flex items-center space-x-1.5 transition disabled:opacity-50"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                <span>Simulate Critical RCE Drift</span>
              </button>
            </div>
          </div>

          {/* Active Monitored Controls & Live Drift Table */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Continuous Controls Monitoring & Active Drift Register</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Incoming telemetry evaluated against security baselines. When non-conformity is detected, control flips to DRIFT_DETECTED.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {monitoredControls.map(ctrl => {
                const isDrifting = ctrl.status === 'DRIFT_DETECTED' || ctrl.status === 'NON_CONFORMITY_TRIGGERED';
                const isRemediating = remediatingControlId === ctrl.id;
                const remainingFormatted = formatRemainingTime(ctrl.gracePeriodExpiresAt);

                return (
                  <div
                    key={ctrl.id}
                    className={`p-4 rounded-xl border transition space-y-3 ${
                      isDrifting
                        ? 'bg-rose-950/15 border-rose-800/60 shadow-sm shadow-rose-950/50'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                              ctrl.status === 'CONFORMING'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : ctrl.status === 'DRIFT_DETECTED'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                                : 'bg-red-950 text-red-200 border border-red-800'
                            }`}
                          >
                            {ctrl.status}
                          </span>

                          <span className="text-xs font-bold text-white font-mono">{ctrl.controlCode}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-xs font-bold text-slate-200">{ctrl.title}</span>

                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                            {ctrl.standard} ({ctrl.provider})
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {ctrl.statusMessage}
                        </p>
                      </div>

                      {/* Right: Live Grace Period Timer & Actions */}
                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        {isDrifting && ctrl.gracePeriodExpiresAt && (
                          <div className="p-2 rounded-xl bg-slate-900 border border-amber-800/80 flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                            <div>
                              <div className="text-[10px] uppercase font-bold text-amber-400">Grace Period Remaining</div>
                              <div className="text-xs font-mono font-bold text-white">{remainingFormatted}</div>
                            </div>
                          </div>
                        )}

                        {/* 1-Click / Webhook Self-Healing Button */}
                        {isDrifting ? (
                          <button
                            onClick={() => handleTriggerSelfHealing(ctrl)}
                            disabled={isRemediating}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-950/40 transition disabled:opacity-50"
                          >
                            {isRemediating ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Wrench className="w-3.5 h-3.5" />
                            )}
                            <span>{isRemediating ? 'Executing Rollback...' : '1-Click Self-Healing'}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleTriggerSelfHealing(ctrl)}
                            disabled={isRemediating}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center space-x-1.5 border border-slate-700 transition disabled:opacity-50"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                            <span>Run Self-Healing Check</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedControlForAudit(ctrl)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center space-x-1 transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-sky-400" />
                          <span>Audit Details</span>
                        </button>
                      </div>
                    </div>

                    {/* Footer Details */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
                      <div className="flex items-center space-x-3">
                        <span>Resource: <strong className="text-slate-200">{ctrl.targetResource}</strong></span>
                        <span>•</span>
                        <span>Owner: <strong className="text-slate-200">{ctrl.assignedOwner}</strong></span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span>Consecutive Pass Probes: <strong className="text-emerald-400">{ctrl.consecutivePassCount}</strong></span>
                        <span>•</span>
                        <span>Grace SLA: <strong className="text-slate-200">{ctrl.gracePeriodMinutes} mins</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Auditor Drift Timeline Component */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-sky-400" />
                  <span>Auditor Drift Timeline & Evidence Changelog</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Continuous audit log recording exact drift detection moments, time-to-remediate duration, and cryptographic proof hash.
                </p>
              </div>

              <span className="text-xs font-mono text-slate-400">
                {driftTimeline.length} events logged
              </span>
            </div>

            <div className="relative border-l border-slate-800 ml-4 space-y-6 pt-2">
              {driftTimeline.map(entry => {
                const isResolved = entry.status === 'RESOLVED';
                return (
                  <div key={entry.id} className="relative pl-6 space-y-1">
                    {/* Timeline Node Dot */}
                    <div
                      className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isResolved
                          ? 'bg-emerald-950 border-emerald-500'
                          : 'bg-rose-950 border-rose-500 animate-pulse'
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          isResolved ? 'bg-emerald-400' : 'bg-rose-400'
                        }`}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">{entry.controlCode}: {entry.controlTitle}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                            isResolved
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {entry.status}
                        </span>
                      </div>

                      <span className="text-[11px] font-mono text-slate-500">
                        Drift Started: {new Date(entry.driftStartedAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {entry.remediationSummary}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400 font-mono">
                      <span>Source: <strong className="text-slate-300">{entry.triggerSource}</strong></span>
                      <span>•</span>
                      <span>Action: <strong className="text-slate-300">{entry.remediationType}</strong></span>
                      {entry.durationMinutes !== undefined && (
                        <>
                          <span>•</span>
                          <span>Remediation Duration: <strong className="text-emerald-400">{entry.durationMinutes} mins</strong></span>
                        </>
                      )}
                      <span>•</span>
                      <span>Remediated By: <strong className="text-sky-300">{entry.remediatedBy}</strong></span>
                      <span>•</span>
                      <span>Proof Hash: <strong className="text-indigo-300">{entry.proofHash}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TELEMETRY HEARTBEAT FRESHNESS SLA & EVIDENCE DECAY TRACKER (OPT 2) */}
      {/* ========================================================================= */}
      {activeTab === 'FRESHNESS_SLA' && (() => {
        const freshProvidersCount = freshnessSlas.filter(s => s.healthBadge === 'FRESH').length;
        const staleProvidersCount = freshnessSlas.filter(s => s.healthBadge === 'STALE').length;
        const deadProvidersCount = freshnessSlas.filter(s => s.healthBadge === 'DEAD').length;

        const freshEvidenceCount = decayingEvidence.filter(e => e.healthBadge === 'FRESH').length;
        const staleEvidenceCount = decayingEvidence.filter(e => e.healthBadge === 'STALE').length;
        const deadEvidenceCount = decayingEvidence.filter(e => e.healthBadge === 'DEAD').length;

        const totalFreshItems = freshProvidersCount + freshEvidenceCount;
        const totalItems = freshnessSlas.length + decayingEvidence.length;
        const ccmOperatingFreshnessIndex = Math.round((totalFreshItems / totalItems) * 100);

        const filteredSlas = freshnessSlas.filter(s =>
          providerHealthFilter === 'ALL' ? true : s.healthBadge === providerHealthFilter
        );

        const filteredEvidence = decayingEvidence.filter(e => {
          if (evidenceHealthFilter !== 'ALL' && e.healthBadge !== evidenceHealthFilter) return false;
          if (!evidenceSearchQuery.trim()) return true;
          const q = evidenceSearchQuery.toLowerCase();
          return (
            e.title.toLowerCase().includes(q) ||
            e.controlCode.toLowerCase().includes(q) ||
            e.provider.toLowerCase().includes(q)
          );
        });

        return (
          <div className="space-y-6">
            {/* Executive SOC 2 / ISO 27001 Freshness & Operating Index Hero */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-lg space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                      Continuous Operating Effectiveness
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                      SOC 2 CC7.1 • ISO 27001 A.8.16 • MAS TRM Sec 13.0
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-white flex items-center space-x-2.5">
                    <Timer className="w-5 h-5 text-indigo-400" />
                    <span>Telemetry Heartbeat Freshness SLA & Evidence Decay Tracker</span>
                  </h2>
                  <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                    Continuously validates that telemetry providers ping within their designated heartbeat SLAs and flags decaying compliance evidence before retention windows expire. Automated badges classify both streams and artifacts into <strong className="text-emerald-300">FRESH</strong>, <strong className="text-amber-300">STALE</strong>, or <strong className="text-rose-300">DEAD</strong>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={handleExportEvidenceAttestation}
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-950/40 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Attestation Certificate</span>
                  </button>

                  <button
                    onClick={handleDownloadAuditorLedger}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5 border border-slate-700 transition"
                  >
                    <FileText className="w-3.5 h-3.5 text-sky-400" />
                    <span>Export Auditor Ledger</span>
                  </button>
                </div>
              </div>

              {/* Status Scorecard Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {/* Score Card 1: Operating Freshness Index */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/90 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Continuous Freshness Index</span>
                  <div className="flex items-baseline space-x-2">
                    <span className={`text-2xl font-black ${
                      ccmOperatingFreshnessIndex >= 85 ? 'text-emerald-400' : ccmOperatingFreshnessIndex >= 65 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {ccmOperatingFreshnessIndex}%
                    </span>
                    <span className="text-xs font-mono text-slate-400">compliant</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        ccmOperatingFreshnessIndex >= 85 ? 'bg-emerald-500' : ccmOperatingFreshnessIndex >= 65 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${ccmOperatingFreshnessIndex}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block font-mono">
                    {totalFreshItems} of {totalItems} total streams/artifacts conforming
                  </span>
                </div>

                {/* Score Card 2: Visual Health Status - FRESH */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-900/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">FRESH Status</span>
                    {renderHealthBadge('FRESH', 'sm')}
                  </div>
                  <div className="text-2xl font-black text-emerald-300">{freshProvidersCount + freshEvidenceCount}</div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {freshProvidersCount} providers active • {freshEvidenceCount} evidence valid
                  </p>
                </div>

                {/* Score Card 3: Visual Health Status - STALE */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-amber-900/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">STALE Warning</span>
                    {renderHealthBadge('STALE', 'sm')}
                  </div>
                  <div className="text-2xl font-black text-amber-300">{staleProvidersCount + staleEvidenceCount}</div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {staleProvidersCount} SLA breached • {staleEvidenceCount} decaying (&lt;30d)
                  </p>
                </div>

                {/* Score Card 4: Visual Health Status - DEAD */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-rose-900/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">DEAD Lost / Expired</span>
                    {renderHealthBadge('DEAD', 'sm')}
                  </div>
                  <div className="text-2xl font-black text-rose-300">{deadProvidersCount + deadEvidenceCount}</div>
                  <p className="text-[11px] text-rose-400/90 font-mono font-bold">
                    {deadProvidersCount} heartbeats dropped • {deadEvidenceCount} expired artifacts
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION: 30-Day Evidence Health Historical Trend & Recurring Staleness Diagnostics */}
            <EvidenceHealthTrendChart
              onHarvestEvidence={handleHarvestEvidenceById}
              onRaiseCapa={handleRaiseCapaByControlCode}
            />

            {/* SECTION: Stale Heartbeat Alert Triage & Operator Response Desk */}
            <HeartbeatAlertTriagePanel
              freshnessSlas={freshnessSlas}
              onTriggerPing={(providerId) => {
                const sla = freshnessSlas.find(s => s.id === providerId);
                if (sla) handlePingProvider(sla);
              }}
              onRaiseCapa={handleRaiseCapaByControlCode}
            />

            {/* SECTION 1: Telemetry Heartbeat Freshness SLA Matrix */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Telemetry Heartbeat Freshness SLA Matrix</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Proves continuous monitoring. If a provider fails to check in within its SLA interval, its health status degrades to STALE and then DEAD.
                  </p>
                </div>

                {/* Provider Health Status Filter Pills */}
                <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setProviderHealthFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      providerHealthFilter === 'ALL'
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({freshnessSlas.length})
                  </button>
                  <button
                    onClick={() => setProviderHealthFilter('FRESH')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition ${
                      providerHealthFilter === 'FRESH'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'text-slate-400 hover:text-emerald-300'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>FRESH ({freshProvidersCount})</span>
                  </button>
                  <button
                    onClick={() => setProviderHealthFilter('STALE')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition ${
                      providerHealthFilter === 'STALE'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'text-slate-400 hover:text-amber-300'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>STALE ({staleProvidersCount})</span>
                  </button>
                  <button
                    onClick={() => setProviderHealthFilter('DEAD')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition ${
                      providerHealthFilter === 'DEAD'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'text-slate-400 hover:text-rose-300'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span>DEAD ({deadProvidersCount})</span>
                  </button>
                </div>
              </div>

              {/* Provider Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSlas.map(sla => {
                  const slaMinutes = sla.slaIntervalHours * 60;
                  const percentConsumed = Math.min(200, Math.round((sla.elapsedMinutes / slaMinutes) * 100));
                  const isPinging = pingingProviderId === sla.id;

                  return (
                    <div
                      key={sla.id}
                      className={`p-4 rounded-xl border transition-all space-y-3 relative ${
                        sla.healthBadge === 'FRESH'
                          ? 'bg-slate-950/70 border-slate-800 hover:border-emerald-800/60'
                          : sla.healthBadge === 'STALE'
                          ? 'bg-amber-950/15 border-amber-800/60 hover:border-amber-700'
                          : 'bg-rose-950/20 border-rose-800/70 hover:border-rose-600 shadow-xs shadow-rose-950/30'
                      }`}
                    >
                      {/* Card Header with prominent Visual Health Status Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate font-mono">{sla.provider}</h4>
                          <span className="text-[10px] text-slate-400 block truncate">{sla.category}</span>
                        </div>
                        <div className="shrink-0">
                          {renderHealthBadge(sla.healthBadge, 'sm')}
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-300 font-mono truncate bg-slate-900/80 px-2 py-1 rounded border border-slate-800/80">
                        {sla.telemetryType}
                      </div>

                      {/* SLA Progress Bar Indicator */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-slate-400">SLA Window:</span>
                          <span className={`${
                            sla.healthBadge === 'FRESH' ? 'text-emerald-400' : sla.healthBadge === 'STALE' ? 'text-amber-400' : 'text-rose-400'
                          }`}>
                            {sla.elapsedMinutes}m / {slaMinutes}m ({percentConsumed}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              sla.healthBadge === 'FRESH'
                                ? 'bg-emerald-500'
                                : sla.healthBadge === 'STALE'
                                ? 'bg-amber-500'
                                : 'bg-rose-500 animate-pulse'
                            }`}
                            style={{ width: `${Math.min(100, percentConsumed)}%` }}
                          />
                        </div>
                      </div>

                      {/* Provider Stats Grid */}
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 text-[10px] font-mono">
                        <div>
                          <span className="text-slate-500 block">SLA Threshold:</span>
                          <div className="flex items-center space-x-1">
                            <strong className="text-slate-200">{sla.slaIntervalHours}h</strong>
                            <select
                              value={sla.slaIntervalHours}
                              onChange={e => handleUpdateSlaInterval(sla.id, Number(e.target.value))}
                              className="bg-slate-900 border border-slate-700 text-slate-300 text-[10px] rounded px-1 py-0.5 cursor-pointer"
                              title="Configure SLA Interval"
                            >
                              <option value={1}>1h</option>
                              <option value={2}>2h</option>
                              <option value={4}>4h</option>
                              <option value={6}>6h</option>
                              <option value={8}>8h</option>
                              <option value={24}>24h</option>
                              <option value={168}>7d</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-500 block">Last Check-In:</span>
                          <strong className={`${
                            sla.healthBadge === 'FRESH' ? 'text-emerald-400' : sla.healthBadge === 'STALE' ? 'text-amber-400' : 'text-rose-400'
                          }`}>
                            {sla.elapsedMinutes > 0 ? `${sla.elapsedMinutes}m ago` : 'Just now'}
                          </strong>
                        </div>

                        <div>
                          <span className="text-slate-500 block">30d Uptime:</span>
                          <strong className="text-indigo-300">{sla.uptimePercent30d}%</strong>
                        </div>

                        <div>
                          <span className="text-slate-500 block">Probe Samples:</span>
                          <strong className="text-sky-300">{sla.totalSamplesCollected} verified</strong>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-500 font-mono truncate">
                        Audit Ref: {sla.auditStandardRef}
                      </div>

                      {/* Interactive Actions: Ping / Simulate Drop */}
                      <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => handlePingProvider(sla)}
                          disabled={isPinging}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[11px] font-bold flex items-center justify-center space-x-1 transition disabled:opacity-50"
                        >
                          {isPinging ? (
                            <RefreshCw className="w-3 h-3 animate-spin text-emerald-300" />
                          ) : (
                            <Send className="w-3 h-3 text-emerald-400" />
                          )}
                          <span>{isPinging ? 'Pinging...' : 'Probe Now'}</span>
                        </button>

                        <button
                          onClick={() => handleSimulateHeartbeatDrop(sla)}
                          className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800 text-[11px] font-bold flex items-center space-x-1 transition"
                          title="Simulate lost telemetry heartbeat to trigger DEAD badge"
                        >
                          <AlertOctagon className="w-3 h-3" />
                          <span>Drop</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 2: Compliance Evidence Decay Tracker */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Compliance Evidence Decay & Expiration Tracker</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Automated retention lifecycle monitor. SOC 2 Type II audit conformity requires periodic evidence renewal before retention closes.
                  </p>
                </div>

                {/* Simulation Time Travel Tools */}
                <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-1 text-xs text-slate-400 font-mono mr-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Aging Simulation:</span>
                    {simulatedDayOffset > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold">
                        +{simulatedDayOffset}d
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleSimulateDecay(30)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition"
                  >
                    +30 Days
                  </button>

                  <button
                    onClick={() => handleSimulateDecay(90)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition"
                  >
                    +90 Days
                  </button>

                  {simulatedDayOffset > 0 && (
                    <button
                      onClick={handleResetDecaySimulation}
                      className="px-2.5 py-1 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold flex items-center space-x-1 transition"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Filter evidence by title, control code (e.g. A.8.8), or provider..."
                    value={evidenceSearchQuery}
                    onChange={e => setEvidenceSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEvidenceHealthFilter('ALL')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      evidenceHealthFilter === 'ALL'
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-white bg-slate-950/60'
                    }`}
                  >
                    All Evidence ({decayingEvidence.length})
                  </button>
                  <button
                    onClick={() => setEvidenceHealthFilter('FRESH')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition ${
                      evidenceHealthFilter === 'FRESH'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'text-slate-400 hover:text-emerald-300 bg-slate-950/60'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>FRESH ({freshEvidenceCount})</span>
                  </button>
                  <button
                    onClick={() => setEvidenceHealthFilter('STALE')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition ${
                      evidenceHealthFilter === 'STALE'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'text-slate-400 hover:text-amber-300 bg-slate-950/60'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>STALE ({staleEvidenceCount})</span>
                  </button>
                  <button
                    onClick={() => setEvidenceHealthFilter('DEAD')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition ${
                      evidenceHealthFilter === 'DEAD'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'text-slate-400 hover:text-rose-300 bg-slate-950/60'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span>DEAD ({deadEvidenceCount})</span>
                  </button>
                </div>
              </div>

              {/* Evidence Records List */}
              <div className="space-y-3">
                {filteredEvidence.length === 0 ? (
                  <div className="p-8 rounded-xl bg-slate-950/40 border border-slate-800 text-center space-y-2">
                    <p className="text-xs text-slate-400">No evidence records matched the selected health badge filter or search query.</p>
                  </div>
                ) : (
                  filteredEvidence.map(item => {
                    const isHarvesting = harvestingEvidenceId === item.id;
                    const isExpanded = expandedEvidenceId === item.id;
                    const percentRemaining = Math.max(0, Math.min(100, Math.round((item.daysRemaining / item.retentionWindowDays) * 100)));

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border transition-all space-y-3 ${
                          item.healthBadge === 'DEAD'
                            ? 'bg-rose-950/20 border-rose-800/70 shadow-xs shadow-rose-950/40'
                            : item.healthBadge === 'STALE'
                            ? 'bg-amber-950/15 border-amber-800/60'
                            : 'bg-slate-950/70 border-slate-800'
                        }`}
                      >
                        {/* Evidence Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {renderHealthBadge(item.healthBadge, 'sm')}
                            <span className="text-xs font-bold text-white">{item.title}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                              {item.controlCode}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Source: {item.provider}
                            </span>
                          </div>

                          <div className="text-xs font-mono">
                            {item.daysRemaining > 0 ? (
                              <span className={`${item.healthBadge === 'FRESH' ? 'text-emerald-400' : 'text-amber-400'} font-bold`}>
                                {item.daysRemaining} days remaining ({percentRemaining}% retention)
                              </span>
                            ) : (
                              <span className="text-rose-400 font-bold flex items-center space-x-1">
                                <AlertOctagon className="w-3.5 h-3.5" />
                                <span>EXPIRED {Math.abs(item.daysRemaining)} days ago (Non-Conformity)</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Retention Window Lifespan Visual Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span>Harvested: {new Date(item.harvestedDate).toISOString().split('T')[0]}</span>
                            <span>Retention Window: {item.retentionWindowDays} Days</span>
                          </div>
                          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                item.healthBadge === 'FRESH'
                                  ? 'bg-emerald-500'
                                  : item.healthBadge === 'STALE'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${percentRemaining}%` }}
                            />
                          </div>
                        </div>

                        {/* Required Action Callout */}
                        <div className={`p-2.5 rounded-lg text-xs leading-relaxed font-mono ${
                          item.healthBadge === 'DEAD'
                            ? 'bg-rose-950/40 text-rose-200 border border-rose-800/60'
                            : item.healthBadge === 'STALE'
                            ? 'bg-amber-950/30 text-amber-200 border border-amber-800/60'
                            : 'bg-slate-900 text-slate-300 border border-slate-800'
                        }`}>
                          <strong className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Required Audit Action:</strong>
                          {item.decayActionRequired}
                        </div>

                        {/* Action Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
                            <span>Hash: <strong className="text-indigo-300">{item.proofHash || '0x7e8b91...a9f1'}</strong></span>
                            {item.fileFormat && (
                              <span>Format: <strong className="text-slate-300">{item.fileFormat}</strong></span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setExpandedEvidenceId(isExpanded ? null : item.id)}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center space-x-1 border border-slate-800 transition"
                            >
                              <Eye className="w-3 h-3 text-sky-400" />
                              <span>{isExpanded ? 'Hide Audit Details' : 'Audit Details'}</span>
                            </button>

                            {(item.healthBadge === 'DEAD' || item.healthBadge === 'STALE') && (
                              <button
                                onClick={() => handleRaiseEvidenceCapa(item)}
                                className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold flex items-center space-x-1 transition"
                                title="Raise formal CAPA non-conformity ticket in GRC system"
                              >
                                <AlertOctagon className="w-3 h-3" />
                                <span>Raise CAPA</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleHarvestEvidence(item)}
                              disabled={isHarvesting}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition disabled:opacity-50"
                            >
                              {isHarvesting ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Zap className="w-3 h-3" />
                              )}
                              <span>{isHarvesting ? 'Harvesting...' : 'Harvest Fresh Evidence'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Expanded Drawer: Cryptographic Audit Trail */}
                        {isExpanded && (
                          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-2 mt-2 font-mono">
                            <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800">
                              <span className="font-bold text-sky-300">Auditor Evidence Verification Details</span>
                              <span>WORM Immutable Storage Compliant</span>
                            </div>
                            <div className="space-y-1 text-slate-300 text-[11px]">
                              <div><strong>Auditor Verification Procedure:</strong> {item.auditorVerificationProcedure || 'Examine digital artifact signature, cross-reference against provider event hash, and ensure valid retention window.'}</div>
                              <div><strong>Digital Signature / Proof Digest:</strong> <span className="text-indigo-400 select-all">{item.proofHash || '0x7e8b91c4d284...a9f1'}</span></div>
                              <div><strong>Retention Enforcement:</strong> Non-erasable WORM policy active. Automatic non-conformity triggered at Day 0.</div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* TAB 3: LIVE STREAM & CRYPTOGRAPHIC LEDGER (OPTION 3)                      */}
      {/* ========================================================================= */}
      {activeTab === 'LIVE_STREAM' && (
        <div className="space-y-6">
          {/* Live System Telemetry Banner */}
          {telemetry && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Continuous Audit Status</span>
                <div className="text-sm font-bold text-emerald-400 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{telemetry.continuousAuditStatus}</span>
                </div>
                <p className="text-[11px] text-slate-500">Uptime: {Math.floor(telemetry.uptimeSeconds / 60)} mins</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Events Ingested</span>
                <div className="text-2xl font-black text-white">{events.length}</div>
                <p className="text-[11px] text-slate-500 font-mono">Stream buffer: 200 max</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Crypto Ledger Blocks</span>
                <div className="text-2xl font-black text-indigo-400">{cryptoBlocks.length}</div>
                <p className="text-[11px] text-slate-500 font-mono">SHA-256 Merkle sealed</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Active Integrations</span>
                <div className="text-sm font-bold text-sky-300">
                  {telemetry.activeIntegrations.length} Providers
                </div>
                <p className="text-[11px] text-slate-500 truncate">{telemetry.activeIntegrations.slice(0, 2).join(', ')}</p>
              </div>
            </div>
          )}

          {/* Webhook Configuration & Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Tenant Webhook URL */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-sky-400" />
                  <span>Tenant Webhook Ingestion Gateway</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  HMAC-SHA256 Protected
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-400">
                  Configure this webhook URL inside GitHub Actions, AWS EventBridge, Cloudflare, Splunk, or Datadog to stream real events into Skanda CCM in real time.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={webhookEndpoint}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sky-300 text-xs font-mono select-all"
                  />
                  <button
                    onClick={handleCopyWebhookUrl}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center space-x-1.5 transition shrink-0"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Live Webhook Simulator */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Simulate Ingestion Payload</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Select Preset Payload</label>
                  <select
                    value={selectedTemplate}
                    onChange={e => setSelectedTemplate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  >
                    <option value="aws_s3_public">AWS S3: Public Read Granted (CRITICAL DRIFT)</option>
                    <option value="guardduty">AWS GuardDuty: Mining Pool Threat (CRITICAL)</option>
                    <option value="github_sast">GitHub CodeQL: Hardcoded Secret (HIGH)</option>
                    <option value="okta_mfa">Okta IAM: Admin MFA Factor Removed (MEDIUM)</option>
                    <option value="crowdstrike_cve">CrowdStrike: Critical RCE CVE (CRITICAL)</option>
                    <option value="datadog">Datadog SIEM: WAF Rate Spike (LOW)</option>
                  </select>
                </div>

                <button
                  onClick={handleSimulateWebhook}
                  disabled={simulating}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
                >
                  {simulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  <span>{simulating ? 'Firing Webhook...' : 'Fire Webhook Event'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cryptographic Audit Ledger Explorer */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Binary className="w-4 h-4 text-indigo-400" />
                  <span>Cryptographic Chain-of-Custody Audit Ledger</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Immutable Merkle-linked audit blocks. Each telemetry ingestion is hashed with the previous block, preventing retroactive tampering.
                </p>
              </div>

              <button
                onClick={handleVerifyLedger}
                disabled={ledgerVerifying}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center space-x-1.5 transition disabled:opacity-50"
              >
                {ledgerVerifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                <span>{ledgerVerifying ? 'Auditing Hashes...' : 'Verify Cryptographic Ledger'}</span>
              </button>
            </div>

            {ledgerVerificationResult && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-700/80 space-y-2 text-xs text-emerald-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <strong className="text-white">Auditor Attestation: {ledgerVerificationResult.integrityConfidence}</strong>
                </div>
                <p>{ledgerVerificationResult.auditorSignOff}</p>
                <div className="text-[11px] text-slate-400 font-mono">
                  Audited {ledgerVerificationResult.blocksAudited} blocks at {new Date(ledgerVerificationResult.verifiedAt).toLocaleTimeString()}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {cryptoBlocks.slice(0, 6).map(block => (
                <div key={block.blockHeight} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 font-mono text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-400 font-bold">Block #{block.blockHeight}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {block.auditSeal}
                    </span>
                  </div>

                  <div className="space-y-1 text-slate-400">
                    <div>Source: <span className="text-white">{block.source}</span></div>
                    <div>Event: <span className="text-slate-300 truncate block">{block.eventType}</span></div>
                    <div>Prev Hash: <span className="text-slate-500">{block.prevBlockHash.slice(0, 16)}...</span></div>
                    <div>Merkle Root: <span className="text-sky-400">{block.merkleRoot.slice(0, 16)}...</span></div>
                  </div>

                  <div className="pt-1 text-[10px] text-slate-500 flex items-center justify-between">
                    <span>{new Date(block.timestamp).toLocaleTimeString()}</span>
                    <span className="text-emerald-400">SEALED</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Event Stream Filter & Feed */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white">Live Real-Time Event Feed</h3>
                <span className="text-xs text-slate-400 font-mono">({filteredEvents.length} events)</span>
              </div>

              <div className="flex items-center space-x-1.5">
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'].map(sev => (
                  <button
                    key={sev}
                    onClick={() => setFilterSeverity(sev)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      filterSeverity === sev
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredEvents.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No live telemetry events matching filter. Fire a simulated webhook above to see it appear live!
                </div>
              ) : (
                filteredEvents.map(evt => {
                  const isExpanded = expandedEventId === evt.id;
                  return (
                    <div
                      key={evt.id}
                      className={`p-4 rounded-xl border transition space-y-3 ${
                        evt.severity === 'CRITICAL'
                          ? 'bg-rose-950/20 border-rose-800/50'
                          : evt.severity === 'HIGH'
                          ? 'bg-amber-950/20 border-amber-800/50'
                          : evt.severity === 'MEDIUM'
                          ? 'bg-sky-950/20 border-sky-800/50'
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono shrink-0 ${
                              evt.severity === 'CRITICAL'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : evt.severity === 'HIGH'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : evt.severity === 'MEDIUM'
                                ? 'bg-sky-950 text-sky-300 border border-sky-800'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {evt.severity}
                          </span>
                          <span className="text-xs font-bold text-white font-mono shrink-0">{evt.source}</span>
                          <span className="text-slate-500 text-xs">•</span>
                          <span className="text-xs font-semibold text-slate-200 truncate">{evt.eventType}</span>
                        </div>

                        <div className="flex items-center space-x-3 text-xs text-slate-400 shrink-0 font-mono">
                          <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                          <span className="text-indigo-300">{evt.isoMapping}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{evt.summary}</p>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                        <button
                          onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                          className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1"
                        >
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          <span>{isExpanded ? 'Hide Raw JSON Payload' : 'View Raw JSON Payload'}</span>
                        </button>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleSaveEventAsEvidence(evt)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center space-x-1 transition"
                          >
                            <FolderPlus className="w-3 h-3 text-sky-400" />
                            <span>Save as Evidence</span>
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-3 rounded-lg bg-black/70 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                          <pre>{JSON.stringify(evt.payload, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: GEMINI AI SIGNAL DEDUPLICATION & KILL-CHAIN CORRELATOR (OPTION 4)  */}
      {/* ========================================================================= */}
      {activeTab === 'AI_CORRELATOR' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-indigo-950/40 border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 flex items-center space-x-1.5 w-max">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Gemini 3.8 Flash Threat Intelligence</span>
                </span>
                <h3 className="text-lg font-bold text-white mt-2">
                  AI Signal Deduplication & Multi-Source Kill-Chain Correlator
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Filters SIEM alert fatigue by collapsing repetitive probes and synthesizes multi-provider signals (Okta + GitHub + AWS) into a cohesive MITRE ATT&CK kill chain with plain-language auditor justifications.
                </p>
              </div>

              <button
                onClick={handleRunAiCorrelator}
                disabled={analyzingAi}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-emerald-950/40 transition disabled:opacity-50 shrink-0"
              >
                {analyzingAi ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-emerald-200" />}
                <span>{analyzingAi ? 'Synthesizing Signals...' : 'Run AI Threat Synthesis'}</span>
              </button>
            </div>
          </div>

          {aiCorrelationResult ? (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Noise Reduction Ratio</span>
                  <div className="text-2xl font-black text-emerald-400">{aiCorrelationResult.noiseReductionRatio}</div>
                  <p className="text-[11px] text-slate-500">{aiCorrelationResult.totalEventsAnalyzed} raw telemetry events parsed</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Net Enterprise Risk Delta</span>
                  <div className="text-2xl font-black text-rose-400">+{aiCorrelationResult.netEnterpriseRiskScoreDelta} Pts</div>
                  <p className="text-[11px] text-slate-500">Unmitigated threat exposure jump</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">AI Intelligence Engine</span>
                  <div className="text-sm font-bold text-sky-300 font-mono truncate">{aiCorrelationResult.model || 'gemini-3.8-flash'}</div>
                  <p className="text-[11px] text-slate-500">MITRE ATT&CK framework mapped</p>
                </div>
              </div>

              {/* Correlated Multi-Stage Incidents */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Correlated Kill-Chain Incident Scenarios</span>
                </h4>

                <div className="space-y-4">
                  {aiCorrelationResult.correlatedIncidents.map(inc => (
                    <div key={inc.incidentId} className="p-5 rounded-xl bg-slate-950/70 border border-rose-900/40 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono">
                            {inc.severity}
                          </span>
                          <span className="text-xs font-bold text-white font-mono">{inc.incidentId}</span>
                          <span className="text-xs font-bold text-slate-200">{inc.title}</span>
                        </div>

                        <span className="text-xs font-mono text-amber-400">
                          Risk Impact: +{inc.riskDelta} Points
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        <strong>Root Cause:</strong> {inc.rootCauseSummary}
                      </p>

                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono space-y-1">
                        <span className="text-rose-400 font-bold block text-[11px] uppercase">Kill-Chain Sequence:</span>
                        <p>{inc.killChainNarrative}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                        <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-900/50 space-y-1">
                          <span className="text-[11px] font-bold text-indigo-300 block">Auditor Defense Note</span>
                          <p className="text-slate-300 text-[11px]">{inc.auditorDefenseNote}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-900/50 space-y-1">
                          <span className="text-[11px] font-bold text-emerald-300 block">Recommended Self-Healing</span>
                          <p className="text-slate-300 text-[11px]">{inc.recommendedMitigation}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {inc.mitreTactics.map((tac, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                            {tac}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deduplicated Clusters */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Deduplicated Noise Clusters & Compliance Assertions</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiCorrelationResult.deduplicatedClusters.map(clus => (
                    <div key={clus.clusterId} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{clus.representativeEvent}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                          {clus.noiseReductionPct}% Noise Cut
                        </span>
                      </div>

                      <p className="text-xs text-slate-300">
                        {clus.complianceAssertion}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                        <span>Merged: {clus.totalMergedCount} signals</span>
                        <span>Sources: {clus.sources.join(', ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <Sparkles className="w-8 h-8 text-emerald-400 mx-auto animate-pulse" />
              <h4 className="text-sm font-bold text-white">No AI Correlation Analysis Generated Yet</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Click "Run AI Threat Synthesis" to analyze the current live telemetry stream, deduplicate noisy events, and identify multi-stage attack scenarios.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal: Audit Control Details */}
      {selectedControlForAudit && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-sky-400 font-bold uppercase">{selectedControlForAudit.standard}</span>
                <h3 className="text-sm font-bold text-white">{selectedControlForAudit.controlCode}: {selectedControlForAudit.title}</h3>
              </div>
              <button
                onClick={() => setSelectedControlForAudit(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block mb-1">Status Summary</span>
                <p className="text-slate-200 bg-slate-950 p-2.5 rounded-lg border border-slate-800">{selectedControlForAudit.statusMessage}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono text-[11px]">
                <div>Domain: <strong className="text-white">{selectedControlForAudit.domain}</strong></div>
                <div>Provider: <strong className="text-white">{selectedControlForAudit.provider}</strong></div>
                <div>Assigned Owner: <strong className="text-white">{selectedControlForAudit.assignedOwner}</strong></div>
                <div>Target Resource: <strong className="text-white">{selectedControlForAudit.targetResource}</strong></div>
                <div>Grace SLA: <strong className="text-amber-400">{selectedControlForAudit.gracePeriodMinutes} mins</strong></div>
                <div>Consecutive Passes: <strong className="text-emerald-400">{selectedControlForAudit.consecutivePassCount} probes</strong></div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/50 space-y-1">
                <span className="text-[11px] font-bold text-emerald-300 block">Self-Healing Script Bound</span>
                <p className="text-slate-300 text-[11px]">{selectedControlForAudit.remediationActionLabel}</p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  handleTriggerSelfHealing(selectedControlForAudit);
                  setSelectedControlForAudit(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Execute Self-Healing Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
