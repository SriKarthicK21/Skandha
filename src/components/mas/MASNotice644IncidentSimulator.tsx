import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertOctagon,
  Clock,
  Send,
  Download,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Building2,
  ShieldAlert,
  Flame,
  UserCheck,
  RefreshCw,
  Copy,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Printer,
  X,
  Calendar,
  Layers,
  CheckSquare,
  Milestone,
  Flag,
  FileCheck2,
  Activity,
  ArrowRight,
  Sliders,
  ShieldCheck,
  Zap,
  Info,
  Check,
  Search,
  Crosshair,
  FileSpreadsheet,
  Lock,
  Database
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import { MASNotice644IncidentDraft } from '../../types';
import { RegulatoryMilestoneTracker } from './RegulatoryMilestoneTracker';
import { ProactiveMilestoneAlertBanner, MilestoneAlert } from './ProactiveMilestoneAlertBanner';
import { MASIncidentAuditTrailPanel } from './MASIncidentAuditTrailPanel';
import { MASIncidentAuditService } from '../../services/masIncidentAuditService';
import { MASAuditFieldDiff } from '../../types/masAuditTrail';

interface MASNotice644SimulatorProps {
  onNavigateToCISDowntime?: () => void;
}

export interface RegulatoryMilestone {
  id: string;
  stageName: string;
  statutoryReference: string;
  targetOffsetHours: number; // e.g. 0, 1, 4, 24, 72, 336 (14 days)
  deadlineTimestamp: string;
  label: string;
  description: string;
  deliverableType: 'Template IT-01 (1h Notification)' | 'Interim Update' | 'Forensic Root Cause Analysis (14d Report)' | 'Board & TRMC Briefing Pack' | 'Remediation Closure Verification';
  mandatoryArtifacts: string[];
  status: 'COMPLETED' | 'IN_PROGRESS' | 'OVERDUE' | 'UPCOMING';
  actionOwner: string;
  escalationRole: string;
  completedAt?: string;
  notes?: string;
}

const INITIAL_644_INCIDENTS: MASNotice644IncidentDraft[] = [
  {
    id: 'INC-2026-001',
    incidentRef: 'MAS/NOTIF/2026/09/014',
    systemAffected: 'Fast & Secure Transfers (FAST) Core Settlement Gateway',
    isCriticalSystem: true,
    discoveryTimestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    outageStartTimestamp: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
    durationMinutes: 38,
    incidentCategory: 'System Malfunction',
    severityLevel: 'SEV-1 (Critical Business Disruption)',
    estimatedCustomersImpacted: 14200,
    financialImpactSGD: 480000,
    rootCausePreliminary: 'Memory leak in Kafka ingress consumer queue after container scaling event, triggering cascading deadlocks in settlement API.',
    containmentActions: 'Traffic routed to secondary hot standby in AWS ap-southeast-1b. Service instances recycled and queue backpressure reconfigured.',
    notificationStatus: '1h Notification Dispatched',
    containmentStatus: 'Failover Complete',
    forensicStatus: 'Memory Dump Analyzed',
    oneHourDeadline: new Date(Date.now() + 28 * 60 * 1000).toISOString(),
    fourteenDayDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    masOfficerAssigned: 'Grace Lee (MAS Technology Risk Department - Cyber Surveillance)',
    cisoApproval: true
  },
  {
    id: 'INC-2026-002',
    incidentRef: 'MAS/NOTIF/2026/08/009',
    systemAffected: 'Treasury Foreign Exchange (FX) Pricing Feeder',
    isCriticalSystem: true,
    discoveryTimestamp: '2026-08-19T04:12:00Z',
    outageStartTimestamp: '2026-08-19T04:05:00Z',
    outageEndTimestamp: '2026-08-19T05:25:00Z',
    durationMinutes: 80,
    incidentCategory: 'Third-Party / Cloud Failure',
    severityLevel: 'SEV-2 (Severe Partial Degradation)',
    estimatedCustomersImpacted: 850,
    financialImpactSGD: 125000,
    rootCausePreliminary: 'Upstream market data provider TLS certificate expiry during off-peak trade execution.',
    containmentActions: 'Switched to secondary Bloomberg B-PIPE backup gateway and refreshed upstream trust store.',
    notificationStatus: '14d RCA Submitted',
    containmentStatus: 'Contained',
    forensicStatus: 'Root Cause Confirmed',
    oneHourDeadline: '2026-08-19T05:12:00Z',
    fourteenDayDeadline: '2026-09-02T05:12:00Z',
    masOfficerAssigned: 'Marcus Teo (MAS Payment Systems Oversight Department)',
    cisoApproval: true
  }
];

export const MASNotice644IncidentSimulator: React.FC<MASNotice644SimulatorProps> = ({ onNavigateToCISDowntime }) => {
  const { currentTenant, logAuditEvent } = useGRC();
  const { showToast } = useToast();

  const [incidents, setIncidents] = useState<MASNotice644IncidentDraft[]>(INITIAL_644_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<MASNotice644IncidentDraft>(INITIAL_644_INCIDENTS[0]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [drillRemainingSeconds, setDrillRemainingSeconds] = useState(60 * 60 - 32 * 60); // 28 minutes remaining
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'Drafting' | '1h Notification Dispatched' | '14d RCA Pending' | '14d RCA Submitted'>('ALL');
  
  // Right Column Tabs: Regulatory Milestones & Timeline vs. Immutable Audit Trail vs. Template IT-01 Dossier
  const [activeRightTab, setActiveRightTab] = useState<'tracker' | 'audit_trail' | 'template_it01'>('tracker');
  const [auditBlockCount, setAuditBlockCount] = useState<number>(() => MASIncidentAuditService.getAuditTrail().length);

  // Incident Parameter Modification Modal (updates user changes with field-level diffs in audit ledger)
  const [isEditingParams, setIsEditingParams] = useState(false);
  const [paramEditForm, setParamEditForm] = useState<Partial<MASNotice644IncidentDraft>>({});

  // Regulatory Timeline active filter: 'ALL' | 'CRITICAL' | 'PENDING'
  const [timelineFilter, setTimelineFilter] = useState<'ALL' | 'ACTION_REQUIRED' | 'COMPLETED'>('ALL');

  // Proactive Milestone Notifications State
  const [alerts, setAlerts] = useState<MilestoneAlert[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [firedAlertKeys, setFiredAlertKeys] = useState<Set<string>>(new Set());

  // Web Audio Context Synthesizer for high-priority regulatory chimes
  const playAlertChime = (type: 'warning' | 'critical') => {
    if (!audioEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type === 'critical' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(type === 'critical' ? 880 : 587.33, ctx.currentTime); // A5 or D5
      if (type === 'critical') {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
      }

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (type === 'critical' ? 0.45 : 0.3));

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + (type === 'critical' ? 0.45 : 0.3));
    } catch {
      // Audio autoplay policy catch
    }
  };

  // Form state for creating or editing an incident
  const [newIncidentForm, setNewIncidentForm] = useState<Partial<MASNotice644IncidentDraft>>({
    systemAffected: 'Wholesale Payment Clearing Switch',
    isCriticalSystem: true,
    incidentCategory: 'Cyber Attack / Ransomware',
    severityLevel: 'SEV-1 (Critical Business Disruption)',
    estimatedCustomersImpacted: 25000,
    financialImpactSGD: 750000,
    rootCausePreliminary: 'Abnormal lateral movement detected targeting transaction signing HSM clusters.',
    containmentActions: 'Isolated signing server subnets, revoked administrator sessions, activated offline backup ledger.'
  });

  // Calculate dynamic regulatory timeline milestones for the selected incident
  const milestones: RegulatoryMilestone[] = useMemo(() => {
    const discoveryTime = new Date(selectedIncident.discoveryTimestamp).getTime();
    const isDispatched = selectedIncident.notificationStatus !== 'Drafting';
    const isRcaSubmitted = selectedIncident.notificationStatus === '14d RCA Submitted';

    const now = Date.now();

    return [
      {
        id: 'M0-DISCOVERY',
        stageName: 'T0: Incident Discovery & Confirmation',
        statutoryReference: 'MAS Notice 644 Clause 4(1)',
        targetOffsetHours: 0,
        deadlineTimestamp: new Date(discoveryTime).toISOString(),
        label: 'Discovery & Severity Triaging',
        description: 'Establish operational incident team, confirm CIS system involvement, and calculate customer/financial impact.',
        deliverableType: 'Template IT-01 (1h Notification)',
        mandatoryArtifacts: ['Incident Severity Scoring Matrix', 'Telemetry Alert Timestamp Logs'],
        status: 'COMPLETED',
        actionOwner: 'SOC Incident Commander / Duty Lead',
        escalationRole: 'Chief Information Security Officer (CISO)',
        completedAt: new Date(discoveryTime + 5 * 60000).toISOString(),
        notes: 'Critical classification verified. Statutory clock started.'
      },
      {
        id: 'M1-ONE-HOUR',
        stageName: 'T+1h: Statutory Notice 644 Initial Notification',
        statutoryReference: 'MAS Notice 644 Clause 4(1) - Mandatory 1-Hour SLA',
        targetOffsetHours: 1,
        deadlineTimestamp: new Date(discoveryTime + 60 * 60 * 1000).toISOString(),
        label: '1-Hour Regulatory Notification to MAS',
        description: 'Submit electronic Template IT-01 to MAS Technology Risk Department via designated secure reporting channel.',
        deliverableType: 'Template IT-01 (1h Notification)',
        mandatoryArtifacts: ['Signed Template IT-01 Document', 'MAS Electronic Ingestion Confirmation Receipt'],
        status: isDispatched ? 'COMPLETED' : now > (discoveryTime + 60 * 60 * 1000) ? 'OVERDUE' : 'IN_PROGRESS',
        actionOwner: 'CISO / Head of Technology Risk',
        escalationRole: 'Chief Executive Officer & Board Risk Committee',
        completedAt: isDispatched ? new Date(discoveryTime + 32 * 60000).toISOString() : undefined,
        notes: isDispatched ? 'Dispatched within 32 minutes of discovery.' : 'URGENT: Form must be finalized and dispatched before 1-hour statutory deadline.'
      },
      {
        id: 'M2-FOUR-HOURS',
        stageName: 'T+4h: Critical System Recovery Cap Verification',
        statutoryReference: 'MAS TRM Guidelines 5.1 - Statutory 4-Hour RTO & Cap',
        targetOffsetHours: 4,
        deadlineTimestamp: new Date(discoveryTime + 4 * 60 * 60 * 1000).toISOString(),
        label: '4-Hour Maximum RTO & Failover Attestation',
        description: 'Ensure core transaction processing is completely restored or failed-over to disaster recovery site within statutory 4-hour envelope.',
        deliverableType: 'Interim Update',
        mandatoryArtifacts: ['Secondary Site Failover Verification Log', 'Transaction Integrity Reconciled Ledger'],
        status: selectedIncident.durationMinutes <= 240 ? 'COMPLETED' : now > (discoveryTime + 4 * 60 * 60 * 1000) ? 'OVERDUE' : 'IN_PROGRESS',
        actionOwner: 'Head of Infrastructure & Core Engineering',
        escalationRole: 'Chief Technology Officer (CTO)',
        completedAt: new Date(discoveryTime + selectedIncident.durationMinutes * 60000).toISOString(),
        notes: `System restored after ${selectedIncident.durationMinutes} minutes, safely inside the 4.0-hour statutory limit.`
      },
      {
        id: 'M3-TWENTY-FOUR-HOURS',
        stageName: 'T+24h: 24-Hour Interim Status Update to MAS',
        statutoryReference: 'MAS Supervisory Protocol for SEV-1 Outages',
        targetOffsetHours: 24,
        deadlineTimestamp: new Date(discoveryTime + 24 * 60 * 60 * 1000).toISOString(),
        label: '24-Hour Regulatory Supervisory Briefing',
        description: 'Provide MAS Technology Risk supervisory team with updated customer impact figures, transaction volume backlog, and forensic progress.',
        deliverableType: 'Interim Update',
        mandatoryArtifacts: ['Interim Forensic Briefing Paper', 'Customer Complaints & Redress Log'],
        status: isRcaSubmitted ? 'COMPLETED' : now > (discoveryTime + 24 * 60 * 60 * 1000) ? 'OVERDUE' : 'UPCOMING',
        actionOwner: 'Head of Regulatory Affairs / Compliance Lead',
        escalationRole: 'General Counsel & CISO',
        notes: 'Briefing desk scheduled with MAS cyber surveillance liaison.'
      },
      {
        id: 'M4-FOURTEEN-DAYS',
        stageName: 'T+14d: Full Root Cause Analysis (RCA) & Remediation Report',
        statutoryReference: 'MAS Notice 644 Clause 4(2) - 14-Day Mandatory Post-Mortem',
        targetOffsetHours: 336, // 14 days
        deadlineTimestamp: new Date(discoveryTime + 14 * 24 * 60 * 60 * 1000).toISOString(),
        label: '14-Day Formal Root Cause Analysis Report',
        description: 'Submit comprehensive formal investigation report to MAS detailing exact root cause, threat vector analysis, systemic gap remediation plan, and board-approved CAPA commitments.',
        deliverableType: 'Forensic Root Cause Analysis (14d Report)',
        mandatoryArtifacts: ['Independent Forensic Investigation Report', 'Board TRMC Formal Approval Extract', 'Corrective Action Plan (CAPA) with Milestones'],
        status: isRcaSubmitted ? 'COMPLETED' : now > (discoveryTime + 14 * 24 * 60 * 60 * 1000) ? 'OVERDUE' : 'IN_PROGRESS',
        actionOwner: 'Lead Incident Investigator & CISO',
        escalationRole: 'Board Technology Risk Management Committee (TRMC)',
        completedAt: isRcaSubmitted ? selectedIncident.fourteenDayDeadline : undefined,
        notes: isRcaSubmitted ? 'RCA submitted and accepted by MAS Supervisory Desk.' : 'Drafting comprehensive forensic root cause and CAPA commitments.'
      },
      {
        id: 'M5-BOARD-TRMC',
        stageName: 'T+30d: Board TRMC Governance & Post-Incident Review (PIR)',
        statutoryReference: 'MAS TRM Guidelines Section 3 - Board & Senior Management Oversight',
        targetOffsetHours: 720, // 30 days
        deadlineTimestamp: new Date(discoveryTime + 30 * 24 * 60 * 60 * 1000).toISOString(),
        label: 'Board Technology Risk Committee Presentation',
        description: 'Present root cause, risk appetite assessment, and capital expenditure allocation for preventive architectural controls.',
        deliverableType: 'Board & TRMC Briefing Pack',
        mandatoryArtifacts: ['Board TRMC Meeting Minutes', 'Budget Approval for Resilience Upgrades'],
        status: isRcaSubmitted ? 'COMPLETED' : 'UPCOMING',
        actionOwner: 'Chief Information Security Officer (CISO)',
        escalationRole: 'Board Chairman',
        notes: 'Quarterly board tech risk agenda item.'
      }
    ];
  }, [selectedIncident]);

  // Countdown timer for 1-hour regulatory clock
  useEffect(() => {
    const interval = setInterval(() => {
      setDrillRemainingSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Proactive Regulatory Milestone Surveillance Engine
  // Periodically evaluates milestones and fires browser toast alerts and persistent dashboard warnings
  useEffect(() => {
    if (selectedIncident.notificationStatus !== 'Drafting') {
      // Clear 1-hour alerts if already dispatched
      setAlerts(prev => prev.filter(a => a.milestoneId !== '1h-notification'));
      return;
    }

    const minutesRemaining = Math.ceil(drillRemainingSeconds / 60);

    // 15-Minute Milestone Threshold Check (Warning)
    if (drillRemainingSeconds <= 15 * 60 && drillRemainingSeconds > 5 * 60) {
      const key = `${selectedIncident.id}-1h-15m`;
      if (!firedAlertKeys.has(key)) {
        setFiredAlertKeys(prev => new Set(prev).add(key));
        playAlertChime('warning');

        showToast({
          title: '⚠️ Statutory Deadline Approaching: 1-Hour Notice',
          message: `MAS Notice 644 statutory window closes in ~${minutesRemaining} min for ${selectedIncident.incidentRef}. Template IT-01 must be dispatched promptly.`,
          type: 'warning',
          duration: 7000
        });

        const newAlert: MilestoneAlert = {
          id: `alert-15m-${Date.now()}`,
          incidentId: selectedIncident.id,
          incidentRef: selectedIncident.incidentRef,
          milestoneId: '1h-notification',
          milestoneTitle: '1-Hour Statutory Notification (Template IT-01)',
          statutoryClause: 'Notice 644 Clause 4(1)',
          severity: 'warning',
          minutesRemaining,
          message: `Notice 644 Clause 4(1) requires electronic notification within 60 minutes. Statutory window expires in ~${minutesRemaining} minutes.`,
          deadlineTimestamp: selectedIncident.oneHourDeadline,
          timestamp: new Date().toISOString(),
          actionRequired: 'Review draft Template IT-01 and dispatch to MAS.'
        };

        setAlerts(prev => [newAlert, ...prev.filter(a => a.milestoneId !== '1h-notification')]);
      }
    }

    // 5-Minute Milestone Threshold Check (Critical Urgent)
    if (drillRemainingSeconds <= 5 * 60 && drillRemainingSeconds > 0) {
      const key = `${selectedIncident.id}-1h-5m`;
      if (!firedAlertKeys.has(key)) {
        setFiredAlertKeys(prev => new Set(prev).add(key));
        playAlertChime('critical');

        showToast({
          title: '🚨 CRITICAL SLA BREACH RISK: 1-Hour MAS Notice',
          message: `URGENT: Only ~${minutesRemaining} minutes left before statutory non-compliance under MAS Notice 644 Paragraph 4. Immediate dispatch required!`,
          type: 'error',
          duration: 9000
        });

        const criticalAlert: MilestoneAlert = {
          id: `alert-5m-${Date.now()}`,
          incidentId: selectedIncident.id,
          incidentRef: selectedIncident.incidentRef,
          milestoneId: '1h-notification',
          milestoneTitle: '1-Hour Statutory Notification (Template IT-01)',
          statutoryClause: 'Notice 644 Clause 4(1) - IMMEDIATE ACTION',
          severity: 'critical',
          minutesRemaining,
          message: `CRITICAL STATUTORY DEADLINE: Regulatory SLA breaches in ${minutesRemaining} minutes. Executive CISO authorization and electronic dispatch to MAS must occur immediately.`,
          deadlineTimestamp: selectedIncident.oneHourDeadline,
          timestamp: new Date().toISOString(),
          actionRequired: 'Immediate dispatch of Template IT-01.'
        };

        setAlerts(prev => [criticalAlert, ...prev.filter(a => a.milestoneId !== '1h-notification')]);
      }
    }

    // 0-Minute Milestone Threshold (Breach)
    if (drillRemainingSeconds === 0) {
      const key = `${selectedIncident.id}-1h-breach`;
      if (!firedAlertKeys.has(key)) {
        setFiredAlertKeys(prev => new Set(prev).add(key));
        playAlertChime('critical');

        showToast({
          title: '⛔ REGULATORY SLA BREACHED: MAS Notice 644 Clause 4(1)',
          message: `The 1-hour statutory notification window has expired for ${selectedIncident.incidentRef}. Immediate notification and supervisory escalation required!`,
          type: 'error',
          duration: 12000
        });
      }
    }
  }, [drillRemainingSeconds, selectedIncident, firedAlertKeys]);

  // Handler to simulate nearing deadline for immediate testing/demonstration
  const handleSimulateUrgentThreshold = (targetMinutes: number) => {
    const newSeconds = targetMinutes * 60;
    setDrillRemainingSeconds(newSeconds);

    // Reset fired alerts for this incident to allow triggering toast & notification
    setFiredAlertKeys(prev => {
      const next = new Set(prev);
      next.delete(`${selectedIncident.id}-1h-15m`);
      next.delete(`${selectedIncident.id}-1h-5m`);
      next.delete(`${selectedIncident.id}-1h-breach`);
      return next;
    });

    const isUrgent = targetMinutes <= 5;
    playAlertChime(isUrgent ? 'critical' : 'warning');

    showToast({
      title: isUrgent ? '🚨 Proactive Alert: 5m to MAS Deadline' : '⚠️ Proactive Alert: 15m to MAS Deadline',
      message: `Proactive surveillance: Regulatory Milestone (1-Hour MAS Notification) for ${selectedIncident.incidentRef} is nearing its statutory deadline (~${targetMinutes}m remaining).`,
      type: isUrgent ? 'error' : 'warning',
      duration: 8000
    });

    const simulatedAlert: MilestoneAlert = {
      id: `alert-sim-${Date.now()}`,
      incidentId: selectedIncident.id,
      incidentRef: selectedIncident.incidentRef,
      milestoneId: '1h-notification',
      milestoneTitle: '1-Hour Statutory Notification (Template IT-01)',
      statutoryClause: targetMinutes <= 5 ? 'Notice 644 Cl. 4(1) - CRITICAL' : 'Notice 644 Cl. 4(1)',
      severity: isUrgent ? 'critical' : 'warning',
      minutesRemaining: targetMinutes,
      message: targetMinutes <= 5
        ? `Statutory SLA nearing breach in ${targetMinutes} minutes. Discharging MAS Notice 644 Template IT-01 required immediately.`
        : `1-Hour statutory notification window nearing deadline (~${targetMinutes} min remaining). Finalize Template IT-01 before compliance cutoff.`,
      deadlineTimestamp: new Date(Date.now() + newSeconds * 1000).toISOString(),
      timestamp: new Date().toISOString(),
      actionRequired: 'Dispatch Template IT-01 to MAS.'
    };

    setAlerts(prev => [simulatedAlert, ...prev.filter(a => a.milestoneId !== '1h-notification')]);

    // Log SLA alert to immutable audit trail
    MASIncidentAuditService.logAuditBlock({
      incidentId: selectedIncident.id,
      incidentRef: selectedIncident.incidentRef,
      actionType: 'SLA_ALERT_TRIGGERED',
      category: 'SLA_ALERT',
      title: isUrgent ? 'Critical SLA Threshold Alert: 5m to MAS Deadline' : 'SLA Threshold Warning: 15m to MAS Deadline',
      description: `Surveillance milestone trigger reached: ${targetMinutes} minutes remaining before statutory 1-hour notification deadline for ${selectedIncident.incidentRef}. Immediate notification dispatched to Incident Commander.`,
      statutoryClause: 'MAS Notice 644 Clause 4(1)',
      metadata: {
        minutesRemaining: targetMinutes,
        severity: isUrgent ? 'critical' : 'warning'
      }
    }).then(() => setAuditBlockCount(prev => prev + 1));
  };

  const handleDismissAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, dismissed: true } : a));
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleLaunchSimulation = () => {
    setDrillRemainingSeconds(3600); // 1 Hour Clock Starts
    const newDrill: MASNotice644IncidentDraft = {
      id: `INC-${Date.now().toString().slice(-4)}`,
      incidentRef: `MAS/NOTIF/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${Math.floor(100 + Math.random() * 900)}`,
      systemAffected: newIncidentForm.systemAffected || 'Customer Mobile Banking Portal',
      isCriticalSystem: newIncidentForm.isCriticalSystem ?? true,
      discoveryTimestamp: new Date().toISOString(),
      outageStartTimestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      durationMinutes: 5,
      incidentCategory: newIncidentForm.incidentCategory || 'System Malfunction',
      severityLevel: newIncidentForm.severityLevel || 'SEV-1 (Critical Business Disruption)',
      estimatedCustomersImpacted: Number(newIncidentForm.estimatedCustomersImpacted) || 12000,
      financialImpactSGD: Number(newIncidentForm.financialImpactSGD) || 350000,
      rootCausePreliminary: newIncidentForm.rootCausePreliminary || 'High latency spike on authentication gateway API.',
      containmentActions: newIncidentForm.containmentActions || 'Rate-limiting turned on, failover instances booting.',
      notificationStatus: 'Drafting',
      oneHourDeadline: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      fourteenDayDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      cisoApproval: false
    };

    setIncidents([newDrill, ...incidents]);
    setSelectedIncident(newDrill);
    setIsCreatingNew(false);

    showToast({
      title: 'MAS Notice 644 Drill Active',
      message: '1-Hour Statutory Notification Timer initiated. Automated timeline tracker engaged.',
      type: 'warning'
    });

    // Log incident drill creation in immutable ledger
    MASIncidentAuditService.logAuditBlock({
      incidentId: newDrill.id,
      incidentRef: newDrill.incidentRef,
      actionType: 'INCIDENT_SIMULATION_LAUNCHED',
      category: 'LIFECYCLE',
      title: `Notice 644 Drill Triggered: ${newDrill.systemAffected}`,
      description: `Incident simulation initiated for ${newDrill.systemAffected}. Preliminary root cause: ${newDrill.rootCausePreliminary}. 1-Hour statutory countdown started under Notice 644 Par. 4.`,
      statutoryClause: 'MAS Notice 644 Clause 4(1)',
      diffs: [
        { fieldName: 'systemAffected', fieldLabel: 'System Affected', oldValue: null, newValue: newDrill.systemAffected },
        { fieldName: 'severityLevel', fieldLabel: 'Severity Level', oldValue: null, newValue: newDrill.severityLevel },
        { fieldName: 'estimatedCustomersImpacted', fieldLabel: 'Estimated Customers', oldValue: null, newValue: newDrill.estimatedCustomersImpacted },
        { fieldName: 'financialImpactSGD', fieldLabel: 'Financial Exposure (SGD)', oldValue: null, newValue: `$${newDrill.financialImpactSGD.toLocaleString()}` }
      ],
      metadata: {
        durationMinutes: newDrill.durationMinutes,
        isCriticalSystem: newDrill.isCriticalSystem,
        containmentActions: newDrill.containmentActions
      }
    }).then(() => setAuditBlockCount(prev => prev + 1));
  };

  const handleApproveAndDispatch = (incident: MASNotice644IncidentDraft) => {
    const updated = incidents.map(i => {
      if (i.id === incident.id) {
        return {
          ...i,
          notificationStatus: '1h Notification Dispatched' as const,
          cisoApproval: true,
          masOfficerAssigned: 'Duty Technology Risk Surveillance Officer (MAS)'
        };
      }
      return i;
    });

    setIncidents(updated);
    setSelectedIncident(prev => ({
      ...prev,
      notificationStatus: '1h Notification Dispatched',
      cisoApproval: true,
      masOfficerAssigned: 'Duty Technology Risk Surveillance Officer (MAS)'
    }));

    showToast({
      title: 'Dispatched to MAS',
      message: `Formal Notice 644 Notification (${incident.incidentRef}) submitted within statutory 1-hour window. T+14d RCA milestone active.`,
      type: 'success'
    });

    // Log dispatch in immutable ledger
    MASIncidentAuditService.logAuditBlock({
      incidentId: incident.id,
      incidentRef: incident.incidentRef,
      actionType: 'ONE_HOUR_NOTICE_DISPATCHED',
      category: 'DISPATCH',
      title: `MAS Notice 644 Template IT-01 Dispatched to MAS`,
      description: `Official statutory initial incident notification electronically transmitted to MAS Technology Risk Department within statutory 1-hour window. CISO digital sign-off attested.`,
      statutoryClause: 'MAS Notice 644 Clause 4(1)',
      diffs: [
        { fieldName: 'notificationStatus', fieldLabel: 'Notification Status', oldValue: incident.notificationStatus, newValue: '1h Notification Dispatched' },
        { fieldName: 'cisoApproval', fieldLabel: 'CISO Approval Attestation', oldValue: String(incident.cisoApproval), newValue: 'true' },
        { fieldName: 'masOfficerAssigned', fieldLabel: 'Assigned MAS Officer', oldValue: incident.masOfficerAssigned || 'Unassigned', newValue: 'Duty Technology Risk Surveillance Officer (MAS)' }
      ],
      metadata: {
        remainingSecondsAtDispatch: drillRemainingSeconds,
        oneHourDeadline: incident.oneHourDeadline
      }
    }).then(() => setAuditBlockCount(prev => prev + 1));
  };

  const handleUpdateContainmentStatus = (newStatus: 'Active Isolation' | 'Contained' | 'Failover Complete') => {
    const oldStatus = selectedIncident.containmentStatus || 'Active Isolation';
    const updated = incidents.map(i => {
      if (i.id === selectedIncident.id) {
        return {
          ...i,
          containmentStatus: newStatus
        };
      }
      return i;
    });
    setIncidents(updated);
    setSelectedIncident(prev => ({ ...prev, containmentStatus: newStatus }));
    showToast({
      title: 'Containment Phase Updated',
      message: `Incident ${selectedIncident.incidentRef} containment status marked as ${newStatus}.`,
      type: 'info'
    });

    // Log containment update with field-level diff
    MASIncidentAuditService.logAuditBlock({
      incidentId: selectedIncident.id,
      incidentRef: selectedIncident.incidentRef,
      actionType: 'CONTAINMENT_ATTESTATION',
      category: 'FORENSIC',
      title: `Containment Phase Advanced: ${newStatus}`,
      description: `Containment milestone updated for ${selectedIncident.incidentRef}. Status transition: ${oldStatus} -> ${newStatus}. Executed actions: ${selectedIncident.containmentActions}`,
      statutoryClause: 'MAS TRM Guidelines Section 5.1 & Section 12.1',
      diffs: [
        { fieldName: 'containmentStatus', fieldLabel: 'Containment State', oldValue: oldStatus, newValue: newStatus }
      ]
    }).then(() => setAuditBlockCount(prev => prev + 1));
  };

  const handleUpdateForensicStatus = (newStatus: 'Evidence Preservation' | 'Memory Dump Analyzed' | 'Root Cause Confirmed') => {
    const oldStatus = selectedIncident.forensicStatus || 'Evidence Preservation';
    const updated = incidents.map(i => {
      if (i.id === selectedIncident.id) {
        return {
          ...i,
          forensicStatus: newStatus
        };
      }
      return i;
    });
    setIncidents(updated);
    setSelectedIncident(prev => ({ ...prev, forensicStatus: newStatus }));
    showToast({
      title: 'Forensic Analysis Updated',
      message: `Incident ${selectedIncident.incidentRef} forensic stage marked as ${newStatus}.`,
      type: 'info'
    });

    // Log forensic milestone in immutable ledger
    MASIncidentAuditService.logAuditBlock({
      incidentId: selectedIncident.id,
      incidentRef: selectedIncident.incidentRef,
      actionType: 'FORENSIC_STAGE_UPDATE',
      category: 'FORENSIC',
      title: `Forensic Investigation Stage: ${newStatus}`,
      description: `Digital forensics track advanced to "${newStatus}" for incident ${selectedIncident.incidentRef}. Evidence preservation protocol sealed under ISO/IEC 27037 standards.`,
      statutoryClause: 'MAS TRM Guidelines Section 12.2',
      diffs: [
        { fieldName: 'forensicStatus', fieldLabel: 'Forensic Investigation Stage', oldValue: oldStatus, newValue: newStatus }
      ]
    }).then(() => setAuditBlockCount(prev => prev + 1));
  };

  const handleSubmitFinalRCA = () => {
    const updated = incidents.map(i => {
      if (i.id === selectedIncident.id) {
        return {
          ...i,
          notificationStatus: '14d RCA Submitted' as const,
          forensicStatus: 'Root Cause Confirmed' as const
        };
      }
      return i;
    });
    setIncidents(updated);
    setSelectedIncident(prev => ({
      ...prev,
      notificationStatus: '14d RCA Submitted',
      forensicStatus: 'Root Cause Confirmed'
    }));
    showToast({
      title: 'Final RCA Report Submitted',
      message: `Board-approved 14-day Root Cause Analysis report for ${selectedIncident.incidentRef} submitted to MAS Technology Risk Department.`,
      type: 'success'
    });

    // Log 14-day RCA submission in immutable ledger
    MASIncidentAuditService.logAuditBlock({
      incidentId: selectedIncident.id,
      incidentRef: selectedIncident.incidentRef,
      actionType: 'RCA_14D_SUBMITTED',
      category: 'MILESTONE',
      title: `14-Day Formal Root Cause Analysis (RCA) Submitted to MAS`,
      description: `Board TRMC-approved comprehensive post-incident investigation report and remedial commitments submitted to MAS Technology Risk Department within statutory 14-day window.`,
      statutoryClause: 'MAS Notice 644 Clause 4(2) & MAS TRM Section 3',
      diffs: [
        { fieldName: 'notificationStatus', fieldLabel: 'Regulatory Milestone', oldValue: selectedIncident.notificationStatus, newValue: '14d RCA Submitted' },
        { fieldName: 'forensicStatus', fieldLabel: 'Forensic Confirmation', oldValue: selectedIncident.forensicStatus || 'In Progress', newValue: 'Root Cause Confirmed' }
      ]
    }).then(() => setAuditBlockCount(prev => prev + 1));
  };

  // Parameter Edit Modal Handlers (Records user edits with field-level cryptographic diffs)
  const handleOpenParamEditModal = () => {
    setParamEditForm({
      systemAffected: selectedIncident.systemAffected,
      severityLevel: selectedIncident.severityLevel,
      estimatedCustomersImpacted: selectedIncident.estimatedCustomersImpacted,
      financialImpactSGD: selectedIncident.financialImpactSGD,
      isCriticalSystem: selectedIncident.isCriticalSystem,
      incidentCategory: selectedIncident.incidentCategory,
      rootCausePreliminary: selectedIncident.rootCausePreliminary,
      containmentActions: selectedIncident.containmentActions
    });
    setIsEditingParams(true);
  };

  const handleSaveParamEdits = async () => {
    const diffs: MASAuditFieldDiff[] = [];

    if (paramEditForm.systemAffected !== undefined && paramEditForm.systemAffected !== selectedIncident.systemAffected) {
      diffs.push({ fieldName: 'systemAffected', fieldLabel: 'System Affected', oldValue: selectedIncident.systemAffected, newValue: paramEditForm.systemAffected });
    }
    if (paramEditForm.severityLevel !== undefined && paramEditForm.severityLevel !== selectedIncident.severityLevel) {
      diffs.push({ fieldName: 'severityLevel', fieldLabel: 'Severity Level', oldValue: selectedIncident.severityLevel, newValue: paramEditForm.severityLevel });
    }
    if (paramEditForm.estimatedCustomersImpacted !== undefined && Number(paramEditForm.estimatedCustomersImpacted) !== selectedIncident.estimatedCustomersImpacted) {
      diffs.push({ fieldName: 'estimatedCustomersImpacted', fieldLabel: 'Estimated Customers', oldValue: selectedIncident.estimatedCustomersImpacted, newValue: Number(paramEditForm.estimatedCustomersImpacted) });
    }
    if (paramEditForm.financialImpactSGD !== undefined && Number(paramEditForm.financialImpactSGD) !== selectedIncident.financialImpactSGD) {
      diffs.push({ fieldName: 'financialImpactSGD', fieldLabel: 'Financial Exposure (SGD)', oldValue: `$${selectedIncident.financialImpactSGD.toLocaleString()}`, newValue: `$${Number(paramEditForm.financialImpactSGD).toLocaleString()}` });
    }
    if (paramEditForm.isCriticalSystem !== undefined && paramEditForm.isCriticalSystem !== selectedIncident.isCriticalSystem) {
      diffs.push({ fieldName: 'isCriticalSystem', fieldLabel: 'Designated CIS System', oldValue: selectedIncident.isCriticalSystem ? 'YES' : 'NO', newValue: paramEditForm.isCriticalSystem ? 'YES' : 'NO' });
    }
    if (paramEditForm.incidentCategory !== undefined && paramEditForm.incidentCategory !== selectedIncident.incidentCategory) {
      diffs.push({ fieldName: 'incidentCategory', fieldLabel: 'Incident Category', oldValue: selectedIncident.incidentCategory, newValue: paramEditForm.incidentCategory });
    }
    if (paramEditForm.rootCausePreliminary !== undefined && paramEditForm.rootCausePreliminary !== selectedIncident.rootCausePreliminary) {
      diffs.push({ fieldName: 'rootCausePreliminary', fieldLabel: 'Preliminary Root Cause', oldValue: selectedIncident.rootCausePreliminary, newValue: paramEditForm.rootCausePreliminary });
    }
    if (paramEditForm.containmentActions !== undefined && paramEditForm.containmentActions !== selectedIncident.containmentActions) {
      diffs.push({ fieldName: 'containmentActions', fieldLabel: 'Containment Actions', oldValue: selectedIncident.containmentActions, newValue: paramEditForm.containmentActions });
    }

    if (diffs.length === 0) {
      setIsEditingParams(false);
      return;
    }

    const updatedIncident: MASNotice644IncidentDraft = {
      ...selectedIncident,
      systemAffected: paramEditForm.systemAffected ?? selectedIncident.systemAffected,
      severityLevel: (paramEditForm.severityLevel as any) ?? selectedIncident.severityLevel,
      estimatedCustomersImpacted: Number(paramEditForm.estimatedCustomersImpacted) || selectedIncident.estimatedCustomersImpacted,
      financialImpactSGD: Number(paramEditForm.financialImpactSGD) || selectedIncident.financialImpactSGD,
      isCriticalSystem: paramEditForm.isCriticalSystem ?? selectedIncident.isCriticalSystem,
      incidentCategory: (paramEditForm.incidentCategory as any) ?? selectedIncident.incidentCategory,
      rootCausePreliminary: paramEditForm.rootCausePreliminary ?? selectedIncident.rootCausePreliminary,
      containmentActions: paramEditForm.containmentActions ?? selectedIncident.containmentActions
    };

    setIncidents(prev => prev.map(i => i.id === updatedIncident.id ? updatedIncident : i));
    setSelectedIncident(updatedIncident);
    setIsEditingParams(false);

    const newBlock = await MASIncidentAuditService.logAuditBlock({
      incidentId: updatedIncident.id,
      incidentRef: updatedIncident.incidentRef,
      actionType: 'USER_PARAMETER_UPDATE',
      category: 'USER_CHANGE',
      title: `Incident Parameters Updated: ${diffs.map(d => d.fieldLabel).join(', ')}`,
      description: `Parameters adjusted by Incident Commander for ${updatedIncident.incidentRef}. ${diffs.length} field modifications logged with SHA-256 cryptographic chaining.`,
      statutoryClause: 'MAS TRM Guidelines Section 12.1.2 & MAS Notice 644 Cl. 4',
      diffs
    });

    setAuditBlockCount(prev => prev + 1);

    showToast({
      title: 'Incident Parameters Updated',
      message: `Modifications sealed in Immutable Audit Trail as Block #${newBlock.sequenceNumber}.`,
      type: 'success'
    });
  };

  const filteredList = useMemo(() => {
    if (filterStatus === 'ALL') return incidents;
    return incidents.filter(i => i.notificationStatus === filterStatus);
  }, [incidents, filterStatus]);

  // Export MAS Template IT-01 as Markdown/Text
  const handleExportTemplateIT01 = () => {
    const text = `
================================================================================
MONETARY AUTHORITY OF SINGAPORE (MAS)
NOTICE 644: INCIDENT NOTIFICATION FORM (TEMPLATE IT-01)
PARAGRAPH 4 STATUTORY 1-HOUR NOTIFICATION
================================================================================

1. FINANCIAL INSTITUTION DETAILS
--------------------------------------------------------------------------------
- Entity Name: ${currentTenant?.name || 'Licensed Financial Institution'}
- License Class: Major Payment Institution (MPI) / Digital Wholesale Bank
- CISO / Incident Lead: Karthi Jegan (Chief Information Security Officer)
- 24/7 Security Operations Center Contact: +65 6800 1234 / soc@apexfintech.sg

2. INCIDENT PARTICULARS
--------------------------------------------------------------------------------
- Incident Reference: ${selectedIncident.incidentRef}
- System(s) Affected: ${selectedIncident.systemAffected}
- Designated Critical Information System (CIS): ${selectedIncident.isCriticalSystem ? 'YES (Subject to 4-Hour RTO Mandate)' : 'NO'}
- Time of Discovery: ${new Date(selectedIncident.discoveryTimestamp).toLocaleString()}
- Statutory 1-Hour Notification Deadline: ${new Date(selectedIncident.oneHourDeadline).toLocaleString()}
- Severity Rating: ${selectedIncident.severityLevel}
- Classification: ${selectedIncident.incidentCategory}

3. BUSINESS & CUSTOMER IMPACT ASSESSMENT
--------------------------------------------------------------------------------
- Estimated Customers Affected: ${selectedIncident.estimatedCustomersImpacted.toLocaleString()} accounts
- Estimated Financial Exposure (SGD): $${selectedIncident.financialImpactSGD.toLocaleString()}
- Cross-Border / Regional Contagion Risk: Minimal - Isolated to Singapore Domestic Processing

4. PRELIMINARY ROOT CAUSE & CONTAINMENT ACTIONS
--------------------------------------------------------------------------------
- Root Cause: ${selectedIncident.rootCausePreliminary}
- Containment Actions Undertaken: ${selectedIncident.containmentActions}
- Current Operational State: Core services restored via secondary cluster; enhanced monitoring active.

5. REGULATORY STATUTORY TIMELINE TRACKER & MILESTONES (NOTICE 644)
--------------------------------------------------------------------------------
${milestones.map(m => `* [${m.status}] ${m.stageName}
  Deadline: ${new Date(m.deadlineTimestamp).toLocaleString()}
  Deliverable: ${m.deliverableType}
  SPOC: ${m.actionOwner}
  Mandatory Artifacts: ${m.mandatoryArtifacts.join(', ')}
`).join('\n')}

6. EXECUTIVE SIGN-OFF & CERTIFICATION
--------------------------------------------------------------------------------
- 14-Day Formal Investigation Deadline: ${new Date(selectedIncident.fourteenDayDeadline).toLocaleDateString()}
- Executive Sign-Off: Approved by CISO & Head of Technology Risk
- Confirmation: True and accurate representation submitted under MAS Notice 644 Paragraph 4.
================================================================================
Generated at: ${new Date().toISOString()} via MAS-TRM Chief Implementer Engine
`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MAS_Notice644_${selectedIncident.incidentRef.replace(/\//g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      title: 'Template IT-01 Exported',
      message: 'MAS Notice 644 Statutory Notification Dossier downloaded with Full Timeline Tracker.',
      type: 'success'
    });

    // Log regulatory export event in audit trail
    MASIncidentAuditService.logAuditBlock({
      incidentId: selectedIncident.id,
      incidentRef: selectedIncident.incidentRef,
      actionType: 'REGULATORY_EXPORT',
      category: 'COMPLIANCE_EXPORT',
      title: 'Template IT-01 Statutory Dossier Exported',
      description: `Official MAS Notice 644 Paragraph 4 Statutory Notification Dossier exported to text/markdown format by CISO for ${selectedIncident.incidentRef}.`,
      statutoryClause: 'MAS Notice 644 Clause 4(1) & Template IT-01',
      metadata: {
        exportFormat: 'TXT / Markdown Dossier',
        timestamp: new Date().toISOString()
      }
    }).then(() => setAuditBlockCount(prev => prev + 1));
  };

  // Export the Timeline as CSV
  const handleExportTimelineCSV = () => {
    const csvContent = [
      ['Milestone Stage', 'Statutory Reference', 'Deadline Timestamp', 'Status', 'Deliverable Type', 'Action Owner', 'Escalation Role', 'Mandatory Artifacts', 'Notes'].join(','),
      ...milestones.map(m => [
        `"${m.stageName}"`,
        `"${m.statutoryReference}"`,
        `"${new Date(m.deadlineTimestamp).toLocaleString()}"`,
        `"${m.status}"`,
        `"${m.deliverableType}"`,
        `"${m.actionOwner}"`,
        `"${m.escalationRole}"`,
        `"${m.mandatoryArtifacts.join('; ')}"`,
        `"${m.notes || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MAS_Notice644_Timeline_${selectedIncident.incidentRef.replace(/\//g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      title: 'Timeline CSV Exported',
      message: 'Notice 644 Statutory Milestones Timeline downloaded.',
      type: 'success'
    });

    // Log CSV export in audit trail
    MASIncidentAuditService.logAuditBlock({
      incidentId: selectedIncident.id,
      incidentRef: selectedIncident.incidentRef,
      actionType: 'REGULATORY_EXPORT',
      category: 'COMPLIANCE_EXPORT',
      title: 'Statutory Milestone Timeline CSV Exported',
      description: `Complete regulatory compliance milestone schedule exported as CSV for supervisory workpapers (${selectedIncident.incidentRef}).`,
      statutoryClause: 'MAS TRM Guidelines Section 12.1.2',
      metadata: {
        exportFormat: 'CSV Workpaper',
        milestoneCount: milestones.length
      }
    }).then(() => setAuditBlockCount(prev => prev + 1));
  };

  const filteredMilestones = milestones.filter(m => {
    if (timelineFilter === 'ACTION_REQUIRED') return m.status === 'IN_PROGRESS' || m.status === 'OVERDUE';
    if (timelineFilter === 'COMPLETED') return m.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Regulatory Context */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-800/40 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                MAS NOTICE 644 • PARAGRAPH 4
              </span>
              <span className="text-xs text-slate-400 font-mono">STATUTORY REGULATORY TIMELINE TRACKER</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <AlertOctagon className="w-6 h-6 text-rose-400" />
              <span>MAS Notice 644 Incident Triage & Automated Timeline Tracker</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Automated compliance engine tracking statutory regulatory milestones: <strong>1-Hour Initial Notification (Template IT-01)</strong>, <strong>4-Hour RTO Cap</strong>, <strong>24-Hour Supervisory Briefing</strong>, and the <strong>14-Day Board-Approved Root Cause Analysis (RCA)</strong> report.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsCreatingNew(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-rose-600/20"
            >
              <Flame className="w-4 h-4 text-white" />
              <span>Trigger Incident / Drill</span>
            </button>

            {onNavigateToCISDowntime && (
              <button
                onClick={onNavigateToCISDowntime}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
              >
                CIS 4-Hour Downtime Ledger
              </button>
            )}
          </div>
        </div>

        {/* 1-Hour Statutory Countdown & Milestone Summary Strip */}
        <div className="mt-5 pt-4 border-t border-rose-900/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/50 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-300 block">
                  1-Hour Notification Milestone
                </span>
                <div className="text-2xl font-black font-mono text-rose-400 mt-0.5">
                  {drillRemainingSeconds > 0 ? formatSeconds(drillRemainingSeconds) : 'EXPIRED / ESCALATE'}
                </div>
                <span className="text-[10px] text-slate-400">
                  {selectedIncident.notificationStatus === '1h Notification Dispatched' ? 'Statutory SLA Satisfied' : 'Time remaining to notify MAS'}
                </span>
              </div>
              <Clock className={`w-8 h-8 ${drillRemainingSeconds < 900 ? 'text-rose-500 animate-pulse' : 'text-rose-400'}`} />
            </div>

            {/* Quick Proactive Milestone Deadline Testing Pills */}
            {selectedIncident.notificationStatus === 'Drafting' && (
              <div className="mt-2.5 pt-2 border-t border-rose-900/40 flex items-center justify-between text-[10px]">
                <span className="text-[9px] text-slate-400 font-mono">Test Alerts:</span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleSimulateUrgentThreshold(15)}
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700/60 transition"
                    title="Simulate 15m remaining deadline warning"
                  >
                    15m Alert
                  </button>
                  <button
                    onClick={() => handleSimulateUrgentThreshold(5)}
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 transition"
                    title="Simulate 5m critical breach alert"
                  >
                    5m Alert
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                14-Day RCA Milestone
              </span>
              <div className="text-base font-bold text-white font-mono mt-1">
                {new Date(selectedIncident.fourteenDayDeadline).toLocaleDateString()}
              </div>
              <span className="text-[10px] text-indigo-400 mt-0.5 block">
                Board-Approved Investigation
              </span>
            </div>
            <FileText className="w-7 h-7 text-indigo-400" />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Timeline Progress
              </span>
              <div className="text-base font-bold text-emerald-400 font-mono mt-1">
                {milestones.filter(m => m.status === 'COMPLETED').length} / {milestones.length} Milestones
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Statutory Steps Tracked
              </span>
            </div>
            <Milestone className="w-7 h-7 text-emerald-400" />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Regulatory Oversight
              </span>
              <div className="text-xs font-bold text-white mt-1 line-clamp-1">
                {selectedIncident.masOfficerAssigned || 'MAS Technology Risk'}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Cyber Surveillance Lead
              </span>
            </div>
            <ShieldCheck className="w-7 h-7 text-sky-400" />
          </div>

          {/* 5th Card: Immutable Audit Ledger Link */}
          <button
            type="button"
            onClick={() => setActiveRightTab('audit_trail')}
            className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between group ${
              activeRightTab === 'audit_trail'
                ? 'bg-indigo-950/70 border-indigo-500 shadow-md shadow-indigo-950/50 ring-1 ring-indigo-500/50'
                : 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/60'
            }`}
            title="Inspect Cryptographic Incident Audit Trail (MAS TRM Section 12)"
          >
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 group-hover:text-indigo-300 block">
                Immutable Audit Trail
              </span>
              <div className="text-base font-bold text-white font-mono mt-1 flex items-center gap-1.5">
                <span>{auditBlockCount} Blocks</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <span className="text-[10px] text-emerald-400 mt-0.5 block flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3 h-3 inline" />
                <span>SHA-256 Chained</span>
              </span>
            </div>
            <Lock className={`w-7 h-7 transition ${activeRightTab === 'audit_trail' ? 'text-indigo-400' : 'text-slate-600 group-hover:text-indigo-400'}`} />
          </button>
        </div>
      </div>

      {/* Proactive Regulatory Milestone Alert Banner */}
      <ProactiveMilestoneAlertBanner
        alerts={alerts}
        incident={selectedIncident}
        audioEnabled={audioEnabled}
        onToggleAudio={() => setAudioEnabled(!audioEnabled)}
        onDismissAlert={handleDismissAlert}
        onDispatchInitialNotice={handleApproveAndDispatch}
        onSimulateUrgentThreshold={handleSimulateUrgentThreshold}
        drillRemainingSeconds={drillRemainingSeconds}
      />

      {/* Main Grid: Incident List + Interactive Triage & Dispatch Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Registered Incidents (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Notice 644 Records</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">{incidents.length} Total</span>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {(['ALL', 'Drafting', '1h Notification Dispatched', '14d RCA Pending'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterStatus(tab)}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                    filterStatus === tab
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {filteredList.map(inc => {
                const isSelected = selectedIncident.id === inc.id;
                return (
                  <div
                    key={inc.id}
                    onClick={() => {
                      setSelectedIncident(inc);
                      setIsCreatingNew(false);
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer text-left ${
                      isSelected
                        ? 'bg-rose-950/40 border-rose-500/60 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-rose-300">
                        {inc.incidentRef}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          inc.notificationStatus === '1h Notification Dispatched'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : inc.notificationStatus === '14d RCA Submitted'
                            ? 'bg-sky-950 text-sky-300 border border-sky-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                        }`}
                      >
                        {inc.notificationStatus}
                      </span>
                    </div>

                    <div className="font-bold text-xs text-white mt-1 line-clamp-1">
                      {inc.systemAffected}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                      <span>{inc.incidentCategory}</span>
                      <span className="font-mono text-rose-300">{inc.durationMinutes}m duration</span>
                    </div>

                    {/* Quick Milestone flags */}
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px] font-mono">
                      <span className={inc.notificationStatus !== 'Drafting' ? 'text-emerald-400' : 'text-amber-400'}>
                        ● 1h SLA: {inc.notificationStatus !== 'Drafting' ? 'Dispatched' : 'Pending'}
                      </span>
                      <span className="text-slate-400">
                        14d Due: {new Date(inc.fourteenDayDeadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Dispatcher Console & Automated Regulatory Timeline Tracker (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {isCreatingNew ? (
            /* New Incident Creation / Simulation Form */
            <div className="p-6 rounded-2xl bg-slate-900 border border-rose-600/40 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Flame className="w-5 h-5 text-rose-400" />
                  <h2 className="text-sm font-bold text-white">Trigger Notice 644 Outage / Cyber Simulation</h2>
                </div>
                <button
                  onClick={() => setIsCreatingNew(false)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">System Affected</label>
                  <input
                    type="text"
                    value={newIncidentForm.systemAffected}
                    onChange={e => setNewIncidentForm({ ...newIncidentForm, systemAffected: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Incident Classification</label>
                  <select
                    value={newIncidentForm.incidentCategory}
                    onChange={e => setNewIncidentForm({ ...newIncidentForm, incidentCategory: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="System Malfunction">System Malfunction</option>
                    <option value="Cyber Attack / Ransomware">Cyber Attack / Ransomware</option>
                    <option value="Third-Party / Cloud Failure">Third-Party / Cloud Failure</option>
                    <option value="Data Breach">Data Breach</option>
                    <option value="Human Error / Unauthorized Change">Human Error / Unauthorized Change</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Estimated Customers Affected</label>
                  <input
                    type="number"
                    value={newIncidentForm.estimatedCustomersImpacted}
                    onChange={e => setNewIncidentForm({ ...newIncidentForm, estimatedCustomersImpacted: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Financial Exposure (SGD)</label>
                  <input
                    type="number"
                    value={newIncidentForm.financialImpactSGD}
                    onChange={e => setNewIncidentForm({ ...newIncidentForm, financialImpactSGD: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Preliminary Root Cause Analysis</label>
                <textarea
                  rows={2}
                  value={newIncidentForm.rootCausePreliminary}
                  onChange={e => setNewIncidentForm({ ...newIncidentForm, rootCausePreliminary: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Immediate Containment & Failover Steps</label>
                <textarea
                  rows={2}
                  value={newIncidentForm.containmentActions}
                  onChange={e => setNewIncidentForm({ ...newIncidentForm, containmentActions: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLaunchSimulation}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center space-x-2"
                >
                  <Flame className="w-4 h-4" />
                  <span>Start 1-Hour Statutory Countdown</span>
                </button>
              </div>
            </div>
          ) : (
            /* Selected Incident Details & MAS Template IT-01 Inspection */
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 font-mono">
                      {selectedIncident.incidentRef}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Notice 644 Par. 4 Form</span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">
                    {selectedIncident.systemAffected}
                  </h2>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleOpenParamEditModal}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-1.5 border border-slate-700 shadow-sm"
                    title="Update incident parameters (logged to immutable audit trail with diffs)"
                  >
                    <Sliders className="w-3.5 h-3.5 text-purple-400" />
                    <span>Edit Parameters</span>
                  </button>

                  <button
                    onClick={handleExportTemplateIT01}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-1.5 border border-slate-700 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Download Template IT-01</span>
                  </button>

                  {selectedIncident.notificationStatus === 'Drafting' && (
                    <button
                      onClick={() => handleApproveAndDispatch(selectedIncident)}
                      className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-rose-600/20"
                    >
                      <Send className="w-3.5 h-3.5 text-white" />
                      <span>Dispatch to MAS</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 4 Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Incident Severity</span>
                  <div className="text-xs font-bold text-rose-400 mt-1">{selectedIncident.severityLevel}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Customers Impacted</span>
                  <div className="text-xs font-bold text-white font-mono mt-1">
                    {selectedIncident.estimatedCustomersImpacted.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Financial Exposure</span>
                  <div className="text-xs font-bold text-amber-400 font-mono mt-1">
                    SGD ${(selectedIncident.financialImpactSGD / 1000).toFixed(0)}k
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Designated CIS System</span>
                  <div className="text-xs font-bold text-emerald-400 mt-1">
                    {selectedIncident.isCriticalSystem ? 'Yes (Notice 644 Strict)' : 'No'}
                  </div>
                </div>
              </div>

              {/* Module Tab Navigation: Regulatory Milestones vs. Immutable Forensic Audit Trail vs. Template IT-01 Dossier */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setActiveRightTab('tracker')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                      activeRightTab === 'tracker'
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <Milestone className="w-4 h-4" />
                    <span>Milestone & Timeline Tracker</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveRightTab('audit_trail')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 border ${
                      activeRightTab === 'audit_trail'
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/25'
                        : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <Lock className="w-4 h-4 text-indigo-400" />
                    <span>Immutable Forensic Audit Trail</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-700">
                      {auditBlockCount} BLOCKS
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveRightTab('template_it01')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                      activeRightTab === 'template_it01'
                        ? 'bg-slate-700 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>Template IT-01 Dossier</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SHA-256 Chained (MAS TRM Sec 12)</span>
                  </span>
                </div>
              </div>

              {/* TAB 1: REGULATORY MILESTONES & TIMELINE TRACKER */}
              {activeRightTab === 'tracker' && (
                <div className="space-y-6">

              {/* REGULATORY MILESTONE TRACKER (HORIZONTAL SEQUENCE WITH STATUS BADGES) */}
              <RegulatoryMilestoneTracker
                incident={selectedIncident}
                onDispatchInitialNotice={handleApproveAndDispatch}
                onAttestContainment={handleUpdateContainmentStatus}
                onConfirmRootCause={handleUpdateForensicStatus}
                onSubmitFinalRCA={handleSubmitFinalRCA}
                drillRemainingSeconds={drillRemainingSeconds}
              />

              {/* AUTOMATED REGULATORY TIMELINE TRACKER */}
              <div className="p-5 rounded-2xl bg-slate-950/90 border border-rose-900/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Milestone className="w-4 h-4 text-rose-400" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        Automated Regulatory Timeline & Milestone Tracker (Notice 644)
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Statutory milestone engine tracking the 1-hour initial dispatch, 4-hour recovery cap, and 14-day formal root-cause analysis.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Filter Pills */}
                    <div className="flex space-x-1">
                      {(['ALL', 'ACTION_REQUIRED', 'COMPLETED'] as const).map(f => (
                        <button
                          key={f}
                          onClick={() => setTimelineFilter(f)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                            timelineFilter === f
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {f === 'ACTION_REQUIRED' ? 'Action Required' : f}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleExportTimelineCSV}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition flex items-center space-x-1 border border-slate-700"
                      title="Download Milestone Workpaper CSV"
                    >
                      <Download className="w-3 h-3 text-rose-400" />
                      <span>Timeline CSV</span>
                    </button>
                  </div>
                </div>

                {/* Timeline Items */}
                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {filteredMilestones.map((m, index) => {
                    const isOverdue = m.status === 'OVERDUE';
                    const isCompleted = m.status === 'COMPLETED';
                    const isInProgress = m.status === 'IN_PROGRESS';

                    return (
                      <div key={m.id} className="relative group">
                        {/* Node Marker */}
                        <div
                          className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center border-2 transition ${
                            isCompleted
                              ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                              : isOverdue
                              ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse'
                              : isInProgress
                              ? 'bg-amber-950 border-amber-500 text-amber-300'
                              : 'bg-slate-900 border-slate-700 text-slate-500'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : isOverdue ? (
                            <AlertTriangle className="w-3 h-3" />
                          ) : (
                            <span className="text-[9px] font-mono font-bold">{index + 1}</span>
                          )}
                        </div>

                        {/* Milestone Card */}
                        <div
                          className={`p-4 rounded-xl border transition ${
                            isCompleted
                              ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                              : isOverdue
                              ? 'bg-rose-950/30 border-rose-600/60 shadow-md'
                              : isInProgress
                              ? 'bg-amber-950/20 border-amber-500/50 shadow-sm'
                              : 'bg-slate-950/40 border-slate-900 text-slate-400'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-bold text-white">
                                  {m.stageName}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-300">
                                  {m.statutoryReference}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-300 font-semibold block mt-0.5">
                                {m.label}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  isCompleted
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                    : isOverdue
                                    ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                                    : isInProgress
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {m.status}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                            {m.description}
                          </p>

                          {/* Deliverables & Metadata Strip */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-[11px]">
                            <div>
                              <span className="text-slate-500 block text-[10px]">Statutory Deadline:</span>
                              <span className="font-mono font-bold text-white">
                                {new Date(m.deadlineTimestamp).toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[10px]">Deliverable Type:</span>
                              <span className="text-indigo-300 font-semibold">{m.deliverableType}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[10px]">Action Owner (SPOC):</span>
                              <span className="text-slate-200">{m.actionOwner}</span>
                            </div>
                          </div>

                          {/* Mandatory Artifacts */}
                          <div className="mt-2.5 flex items-center flex-wrap gap-1.5">
                            <span className="text-[10px] text-slate-500">Required Proof:</span>
                            {m.mandatoryArtifacts.map((art, aIdx) => (
                              <span
                                key={aIdx}
                                className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-900 border border-slate-800 text-slate-300"
                              >
                                {art}
                              </span>
                            ))}
                          </div>

                          {/* Completed or Notes line */}
                          {m.notes && (
                            <div className="mt-2 text-[10px] text-slate-400 italic">
                              Note: {m.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Technical Analysis Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Preliminary Root Cause</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedIncident.rootCausePreliminary}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Containment & Failover Execution</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedIncident.containmentActions}
                  </p>
                </div>
              </div>

              {/* Regulatory Officer Contact Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
                <div>
                  MAS Supervisory Lead: <strong className="text-white">{selectedIncident.masOfficerAssigned || 'Technology Risk Department (Duty Desk)'}</strong>
                </div>
                <div>
                  Regulatory Submission Format: <strong className="text-indigo-400">Template IT-01 (Electronic Secure Dispatch)</strong>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IMMUTABLE FORENSIC AUDIT TRAIL (MAS TRM SEC 12) */}
          {activeRightTab === 'audit_trail' && (
            <MASIncidentAuditTrailPanel
              incidentId={selectedIncident.id}
              incidentRef={selectedIncident.incidentRef}
              onBlockAdded={() => setAuditBlockCount(prev => prev + 1)}
            />
          )}

          {/* TAB 3: TEMPLATE IT-01 STATUTORY DOSSIER */}
          {activeRightTab === 'template_it01' && (
            <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      MAS Notice 644 Statutory Dossier (Template IT-01)
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Statutory format for Paragraph 4 Incident Notification submitted to Monetary Authority of Singapore.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const text = `MAS NOTICE 644 TEMPLATE IT-01\nIncident Ref: ${selectedIncident.incidentRef}\nSystem: ${selectedIncident.systemAffected}\nDiscovery: ${selectedIncident.discoveryTimestamp}\nSeverity: ${selectedIncident.severityLevel}\nRoot Cause: ${selectedIncident.rootCausePreliminary}\nContainment: ${selectedIncident.containmentActions}`;
                      navigator.clipboard?.writeText(text);
                      showToast({ title: 'Copied to Clipboard', message: 'Template IT-01 summary copied.', type: 'info' });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center space-x-1.5 border border-slate-700"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Summary</span>
                  </button>
                  <button
                    onClick={handleExportTemplateIT01}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Full IT-01</span>
                  </button>
                </div>
              </div>

              {/* Formatted Statutory Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                    Section 1: Financial Institution Particulars
                  </span>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div><strong className="text-slate-400">Entity Name:</strong> Apex Financial Technologies Pte. Ltd.</div>
                    <div><strong className="text-slate-400">MAS License:</strong> Major Payment Institution (MPI) #PS20240019</div>
                    <div><strong className="text-slate-400">CISO Attestation:</strong> Karthi Jegan (karthi.jegan1998@gmail.com)</div>
                    <div><strong className="text-slate-400">Supervisory Desk:</strong> MAS Technology Risk Oversight</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                    Section 2: Outage & Criticality Details
                  </span>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div><strong className="text-slate-400">Incident Reference:</strong> <span className="font-mono text-rose-300">{selectedIncident.incidentRef}</span></div>
                    <div><strong className="text-slate-400">System Affected:</strong> {selectedIncident.systemAffected}</div>
                    <div><strong className="text-slate-400">Designated CIS:</strong> {selectedIncident.isCriticalSystem ? 'YES (Notice 644 Par. 3 strict)' : 'NO'}</div>
                    <div><strong className="text-slate-400">Discovery Timestamp:</strong> {new Date(selectedIncident.discoveryTimestamp).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Section 3: Impact & Preliminary Root Cause
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300 py-1">
                  <div><strong className="text-slate-400">Severity:</strong> {selectedIncident.severityLevel}</div>
                  <div><strong className="text-slate-400">Impacted Customers:</strong> {selectedIncident.estimatedCustomersImpacted.toLocaleString()}</div>
                  <div><strong className="text-slate-400">Financial Exposure:</strong> SGD ${(selectedIncident.financialImpactSGD / 1000).toFixed(0)}k</div>
                </div>
                <p className="text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <strong className="text-slate-400">Root Cause Hypothesis:</strong> {selectedIncident.rootCausePreliminary}
                </p>
                <p className="text-xs text-slate-300">
                  <strong className="text-slate-400">Containment & Failover Execution:</strong> {selectedIncident.containmentActions}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center justify-between text-xs text-emerald-300">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Regulatory Integrity: Template IT-01 is cryptographically bound to Immutable Audit Trail Block #{auditBlockCount}.</span>
                </div>
                <button
                  onClick={() => setActiveRightTab('audit_trail')}
                  className="text-[11px] underline hover:text-emerald-200 font-bold"
                >
                  Verify Chain
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  </div>

      {/* PARAMETER MODIFICATION MODAL WITH IMMUTABLE CRYPTOGRAPHIC DIFF RECORDING */}
      {isEditingParams && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Modify Incident Parameters</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                      {selectedIncident.incidentRef}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Modifications will be cryptographically hashed and permanently recorded in the Immutable Audit Trail.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingParams(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-indigo-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-[11px]">
                  <strong className="block text-indigo-200">MAS TRM Guidelines Section 12.1.2 Accountability Mandate:</strong>
                  <span>Every modified parameter creates an immutable SHA-256 block containing exact field-level before and after state diffs, user ID, timestamp, and Merkle root link.</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Affected System Name</label>
                  <input
                    type="text"
                    value={paramEditForm.systemAffected || ''}
                    onChange={e => setParamEditForm({ ...paramEditForm, systemAffected: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Severity Level</label>
                    <select
                      value={paramEditForm.severityLevel || ''}
                      onChange={e => setParamEditForm({ ...paramEditForm, severityLevel: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="SEV-1 (Critical Business Disruption)">SEV-1 (Critical Business Disruption)</option>
                      <option value="SEV-2 (High Degradation / Fallback Active)">SEV-2 (High Degradation / Fallback Active)</option>
                      <option value="SEV-3 (Moderate Partial Impact)">SEV-3 (Moderate Partial Impact)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Incident Category</label>
                    <select
                      value={paramEditForm.incidentCategory || ''}
                      onChange={e => setParamEditForm({ ...paramEditForm, incidentCategory: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="System Malfunction">System Malfunction</option>
                      <option value="Cyber Security Incident">Cyber Security Incident</option>
                      <option value="Third-Party / Cloud Failure">Third-Party / Cloud Failure</option>
                      <option value="Infrastructure Power Outage">Infrastructure Power Outage</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Estimated Customers Impacted</label>
                    <input
                      type="number"
                      value={paramEditForm.estimatedCustomersImpacted ?? ''}
                      onChange={e => setParamEditForm({ ...paramEditForm, estimatedCustomersImpacted: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Financial Impact Exposure (SGD)</label>
                    <input
                      type="number"
                      value={paramEditForm.financialImpactSGD ?? ''}
                      onChange={e => setParamEditForm({ ...paramEditForm, financialImpactSGD: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-200 block">Designated Critical Information System (CIS)</span>
                    <span className="text-[11px] text-slate-400">Triggers mandatory 4-hour RTO and statutory Notice 644 notification obligations</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setParamEditForm({ ...paramEditForm, isCriticalSystem: !paramEditForm.isCriticalSystem })}
                    className={`w-11 h-6 rounded-full transition relative flex items-center px-1 ${
                      paramEditForm.isCriticalSystem ? 'bg-emerald-600' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        paramEditForm.isCriticalSystem ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Preliminary Root Cause Hypothesis</label>
                  <textarea
                    rows={2}
                    value={paramEditForm.rootCausePreliminary || ''}
                    onChange={e => setParamEditForm({ ...paramEditForm, rootCausePreliminary: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Containment & Failover Execution Plan</label>
                  <textarea
                    rows={2}
                    value={paramEditForm.containmentActions || ''}
                    onChange={e => setParamEditForm({ ...paramEditForm, containmentActions: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                Changes will increment audit block #{auditBlockCount + 1}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditingParams(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveParamEdits}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-purple-600/25"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Save & Seal in Audit Ledger</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
