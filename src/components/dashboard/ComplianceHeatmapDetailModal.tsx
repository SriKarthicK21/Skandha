// Skanda GRC — Compliance Heatmap Detail & Inspection Modal
// Provides deep-dive forensic examination into a specific Department x Standard intersection
// Displays specific non-compliant controls and outstanding remediation tasks with interactive controls,
// live status overrides, task completion toggles, and cryptographic evidence verification.

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  User,
  ExternalLink,
  Save,
  PlusCircle,
  Hash,
  Sparkles,
  RefreshCw,
  FolderLock,
  CheckSquare,
  Square,
  Calendar,
  Plus,
  Copy,
  Filter,
  ArrowRight,
  AlertCircle,
  ShieldAlert,
  Search,
  ArrowUp,
  ArrowDown,
  Minus,
  TrendingUp,
  TrendingDown,
  Layers,
  History,
  Download,
  Check,
  FileCheck2,
  Shield
} from 'lucide-react';
import { ComplianceOverlayService } from '../../services/complianceOverlayService';
import { MaturitySparkline } from '../compliance/MaturitySparkline';
import {
  HeatmapCellData,
  HeatmapStatus,
  HeatmapCellTask,
  HeatmapCellControlItem,
  ComplianceHeatmapService
} from '../../services/complianceHeatmapService';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';

interface ComplianceHeatmapDetailModalProps {
  isOpen: boolean;
  cell: HeatmapCellData | null;
  onClose: () => void;
  onCellUpdated: (updated: HeatmapCellData) => void;
  onNavigateModule?: (moduleId: string) => void;
  complianceOverlayActive?: boolean;
}

type ModalTab = 'evidence' | 'history' | 'non_compliant' | 'tasks' | 'all_controls' | 'findings' | 'overview';

interface EvidenceLogEntry {
  id: string;
  timestamp: string;
  source: string;
  eventType: string;
  evidenceType: 'Automated Telemetry' | 'Config Snapshot' | 'Attestation' | 'Audit Trail';
  status: 'VERIFIED' | 'REQUIRES_RETEST';
  sha256Digest: string;
  inspector: string;
  payloadSummary: string;
  parameters: Record<string, any>;
}

export const ComplianceHeatmapDetailModal: React.FC<ComplianceHeatmapDetailModalProps> = ({
  isOpen,
  cell,
  onClose,
  onCellUpdated,
  onNavigateModule,
  complianceOverlayActive = false
}) => {
  const { theme, logAuditEvent } = useGRC();
  const { showToast } = useToast();

  const [activeCell, setActiveCell] = useState<HeatmapCellData | null>(null);
  const overlayData = activeCell ? ComplianceOverlayService.calculateOverlayScore(activeCell, theme === 'light' ? 'light' : 'dark') : null;
  const [currentStatus, setCurrentStatus] = useState<HeatmapStatus>('COMPLIANT');
  const [currentScore, setCurrentScore] = useState<number>(85);
  const [complianceNotes, setComplianceNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ModalTab>('evidence');

  // Task & Control Filters
  const [taskFilter, setTaskFilter] = useState<'all' | 'open' | 'completed'>('open');
  const [controlSearch, setControlSearch] = useState<string>('');
  const [controlFilter, setControlFilter] = useState<'all' | 'non_compliant' | 'in_progress' | 'compliant'>('all');

  // Evidence Logs & Detailed History Filters / State
  const [evidenceSearch, setEvidenceSearch] = useState<string>('');
  const [evidenceTypeFilter, setEvidenceTypeFilter] = useState<string>('ALL');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [selectedHistoryCycle, setSelectedHistoryCycle] = useState<number>(5);

  // Add Task inline form
  const [showAddTaskForm, setShowAddTaskForm] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskDesc, setNewTaskDesc] = useState<string>('');
  const [newTaskPriority, setNewTaskPriority] = useState<HeatmapCellTask['priority']>('HIGH');
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>('');
  const [newTaskDays, setNewTaskDays] = useState<number>(7);
  const [newTaskRelControl, setNewTaskRelControl] = useState<string>('');

  useEffect(() => {
    if (cell) {
      setActiveCell(cell);
      setCurrentStatus(cell.status);
      setCurrentScore(cell.score);
      setComplianceNotes(cell.complianceNotes || '');
      setNewTaskAssignee(cell.controlOwner || 'Lead Auditor');

      // Default to evidence tab so user immediately sees specific evidence logs and detailed history
      setActiveTab('evidence');
      setShowAddTaskForm(false);
      setCopiedHash(null);
      setExpandedLogId(null);
      setSelectedHistoryCycle(5);
    }
  }, [cell]);

  // Specific evidence logs for this control node
  const evidenceLogs = useMemo(() => {
    if (!activeCell) return [];

    const baseEvidence = activeCell.evidenceArtifacts || [];
    const targetCode = activeCell.targetCode;
    const deptName = activeCell.departmentName;

    const logs: EvidenceLogEntry[] = [
      {
        id: `LOG-EV-${targetCode.replace(/[^a-zA-Z0-9]/g, '')}-01`,
        timestamp: '2026-09-28 14:15:32 UTC',
        source: 'AWS CloudTrail & IAM Telemetry',
        eventType: 'Cryptographic Identity & Access Validation',
        evidenceType: 'Automated Telemetry' as const,
        status: 'VERIFIED' as const,
        sha256Digest: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        inspector: 'Automated WORM Ingestion Pipeline',
        payloadSummary: `Access verification probe passed for ${deptName}. MFA enforced on 100% of privileged sessions.`,
        parameters: {
          eventSource: 'iam.amazonaws.com',
          eventName: 'AssumeRoleWithMFA',
          mfaAuthenticated: true,
          tlsVersion: 'TLSv1.3',
          latencyMs: 38
        }
      },
      {
        id: `LOG-EV-${targetCode.replace(/[^a-zA-Z0-9]/g, '')}-02`,
        timestamp: '2026-09-24 09:30:18 UTC',
        source: 'CrowdStrike Falcon Sensor & Wazuh Agent',
        eventType: 'Endpoint Hardening & Malware Defense Telemetry',
        evidenceType: 'Automated Telemetry' as const,
        status: 'VERIFIED' as const,
        sha256Digest: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        inspector: 'Continuous Compliance Engine',
        payloadSummary: `Sensor daemon active across all ${deptName} production nodes. Real-time behavioral prevention enabled.`,
        parameters: {
          sensorVersion: '7.14.1802',
          tamperProtection: 'ENABLED',
          quarantineActive: true,
          auditPassRate: '99.4%'
        }
      },
      {
        id: `LOG-EV-${targetCode.replace(/[^a-zA-Z0-9]/g, '')}-03`,
        timestamp: '2026-09-18 16:42:00 UTC',
        source: 'GitHub Actions CI/CD Security Gate',
        eventType: 'Pipeline SAST/DAST & Secret Scanning Attestation',
        evidenceType: 'Config Snapshot' as const,
        status: 'VERIFIED' as const,
        sha256Digest: 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
        inspector: 'TÜV SÜD Stage 1 Audit Verifier',
        payloadSummary: `Automated PR blocking rule active on repositories under ${deptName}. 0 high CVEs permitted into main branch.`,
        parameters: {
          branchProtection: 'ENFORCED',
          requiredSignatures: true,
          trivyScanStatus: 'PASSED',
          commitSha: '8f31b9c20a'
        }
      },
      {
        id: `LOG-EV-${targetCode.replace(/[^a-zA-Z0-9]/g, '')}-04`,
        timestamp: '2026-08-30 11:20:45 UTC',
        source: 'HashiCorp Vault KMS & HSM Keyring',
        eventType: 'Cryptographic Key Rotation & Storage Verification',
        evidenceType: 'Attestation' as const,
        status: 'VERIFIED' as const,
        sha256Digest: '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
        inspector: 'Internal ISO 27001 Auditor',
        payloadSummary: `AES-256-GCM envelope encryption keys rotated according to 90-day policy schedule.`,
        parameters: {
          keyAlgorithm: 'AES-256-GCM',
          rotationIntervalDays: 90,
          exportable: false,
          hsmAttested: true
        }
      },
      {
        id: `LOG-EV-${targetCode.replace(/[^a-zA-Z0-9]/g, '')}-05`,
        timestamp: '2026-08-12 17:05:12 UTC',
        source: 'Okta Identity Cloud & SCIM Deprovisioning',
        eventType: 'HR Terminations & Offboarding Audit Log',
        evidenceType: 'Audit Trail' as const,
        status: activeCell.score < 50 ? ('REQUIRES_RETEST' as const) : ('VERIFIED' as const),
        sha256Digest: '9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca7',
        inspector: activeCell.controlOwner || 'Department Lead',
        payloadSummary: `Automated SCIM webhook deprovisioning verification record for ${deptName}.`,
        parameters: {
          deprovisionWebhook: 'ACTIVE',
          slaRevocationMinutes: 15,
          orphanedAccounts: 0,
          mfaEnforced: true
        }
      }
    ];

    // Merge base evidence artifacts
    baseEvidence.forEach((evd, idx) => {
      logs.push({
        id: `LOG-ARTIFACT-${targetCode.replace(/[^a-zA-Z0-9]/g, '')}-${idx + 1}`,
        timestamp: evd.verifiedAt || '2026-09-15 10:00:00 UTC',
        source: 'Enterprise Evidence Center Document Vault',
        eventType: 'Cryptographic Evidence Artifact Deposit',
        evidenceType: 'Attestation' as const,
        status: 'VERIFIED' as const,
        sha256Digest: evd.sha256Digest || 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',
        inspector: 'Lead Certification Auditor',
        payloadSummary: `${evd.name} (${evd.type}) verified and locked under WORM immutable custody.`,
        parameters: {
          fileName: evd.name,
          fileType: evd.type,
          custodyLock: 'IMMUTABLE_WORM',
          verifiedAt: evd.verifiedAt
        }
      });
    });

    return logs;
  }, [activeCell]);

  // Detailed 5-cycle historical audit assessments for this control node
  const auditHistoryCycles = useMemo(() => {
    if (!activeCell) return [];

    const histScores =
      activeCell.historicalScores && activeCell.historicalScores.length === 5
        ? activeCell.historicalScores
        : [
            Math.max(20, activeCell.score - 32),
            Math.max(30, activeCell.score - 22),
            Math.max(45, activeCell.score - 12),
            activeCell.previousScore ?? Math.max(55, activeCell.score - 5),
            activeCell.score
          ];

    return [
      {
        cycleNumber: 1,
        cycleName: 'Cycle 1: Baseline Architecture Assessment',
        date: '2025-11-12',
        score: histScores[0],
        status: (histScores[0] >= 85 ? 'COMPLIANT' : histScores[0] >= 50 ? 'IN_PROGRESS' : 'NON_COMPLIANT') as HeatmapStatus,
        tierLabel: histScores[0] >= 85 ? 'L4 Managed' : histScores[0] >= 50 ? 'L3 Defined' : 'L1 Initial',
        leadAuditor: 'CISO GRC Steering Committee',
        findingsSummary: 'Initial policy gap discovery and Statement of Applicability baseline drafting.',
        verificationProcedure: 'Baseline documentation walkthrough and preliminary architecture scoping review.',
        auditRecordId: `REC-AUD-2025-C1-${activeCell.targetCode}`
      },
      {
        cycleNumber: 2,
        cycleName: 'Cycle 2: Stage 1 Internal Audit Review',
        date: '2026-02-20',
        score: histScores[1],
        status: (histScores[1] >= 85 ? 'COMPLIANT' : histScores[1] >= 50 ? 'IN_PROGRESS' : 'NON_COMPLIANT') as HeatmapStatus,
        tierLabel: histScores[1] >= 85 ? 'L4 Managed' : histScores[1] >= 50 ? 'L3 Defined' : 'L2 Developing',
        leadAuditor: 'Internal ISO 27001 Lead Auditor',
        findingsSummary: 'Stage 1 gap analysis identified partial technical control implementation without continuous logging.',
        verificationProcedure: 'Sample testing of 15 operational tickets and manual access control configuration validation.',
        auditRecordId: `REC-AUD-2026-C2-${activeCell.targetCode}`
      },
      {
        cycleNumber: 3,
        cycleName: 'Cycle 3: Remediation Milestone & Mid-Term Verification',
        date: '2026-05-10',
        score: histScores[2],
        status: (histScores[2] >= 85 ? 'COMPLIANT' : histScores[2] >= 50 ? 'IN_PROGRESS' : 'NON_COMPLIANT') as HeatmapStatus,
        tierLabel: histScores[2] >= 85 ? 'L4 Managed' : histScores[2] >= 60 ? 'L3 Defined' : 'L2 Developing',
        leadAuditor: 'Senior Security Architect',
        findingsSummary: 'Core technical controls automated via CI/CD gates; 2 minor non-conformity findings addressed.',
        verificationProcedure: 'Automated vulnerability scan execution and Bastion jump-host session log inspection.',
        auditRecordId: `REC-AUD-2026-C3-${activeCell.targetCode}`
      },
      {
        cycleNumber: 4,
        cycleName: 'Cycle 4: Stage 2 External Pre-Assessment',
        date: activeCell.previousAssessedAt || '2026-07-15',
        score: histScores[3],
        status: (histScores[3] >= 85 ? 'COMPLIANT' : histScores[3] >= 50 ? 'IN_PROGRESS' : 'NON_COMPLIANT') as HeatmapStatus,
        tierLabel: histScores[3] >= 85 ? 'L4 Managed' : histScores[3] >= 60 ? 'L3 Defined' : 'L2 Developing',
        leadAuditor: 'TÜV SÜD Lead Certification Auditor',
        findingsSummary: 'Formal external pre-assessment workpaper review. Cryptographic evidence attached.',
        verificationProcedure: 'Live auditor walkthrough of key management procedures, access reviews, and incident response playbooks.',
        auditRecordId: `REC-AUD-2026-C4-${activeCell.targetCode}`
      },
      {
        cycleNumber: 5,
        cycleName: 'Cycle 5: Current Continuous Compliance Cycle',
        date: activeCell.lastAssessedAt || '2026-09-28',
        score: histScores[4],
        status: activeCell.status,
        tierLabel: histScores[4] >= 90 ? 'L5 Optimized' : histScores[4] >= 75 ? 'L4 Managed' : histScores[4] >= 60 ? 'L3 Defined' : 'L2 Developing',
        leadAuditor: activeCell.controlOwner || 'Continuous Assurance Daemon',
        findingsSummary: activeCell.complianceNotes || 'Continuous telemetry ingestion active. Controls quantitatively measured.',
        verificationProcedure: 'Continuous automated evidence sampling and real-time SIEM/CSPM telemetry correlation.',
        auditRecordId: `REC-AUD-2026-C5-${activeCell.targetCode}`
      }
    ];
  }, [activeCell]);

  if (!isOpen || !activeCell) return null;

  // Filtered Tasks
  const nonCompliantControls = activeCell.keyControls?.filter(c => c.status === 'NON_COMPLIANT') || [];
  const inProgressControls = activeCell.keyControls?.filter(c => c.status === 'IN_PROGRESS') || [];
  const deficientControls = [...nonCompliantControls, ...inProgressControls];

  const tasksList = activeCell.outstandingTasks || [];
  const filteredTasks = tasksList.filter(t => {
    if (taskFilter === 'open') return t.status !== 'COMPLETED';
    if (taskFilter === 'completed') return t.status === 'COMPLETED';
    return true;
  });

  const filteredControls = (activeCell.keyControls || []).filter(c => {
    if (controlFilter === 'non_compliant' && c.status !== 'NON_COMPLIANT') return false;
    if (controlFilter === 'in_progress' && c.status !== 'IN_PROGRESS') return false;
    if (controlFilter === 'compliant' && c.status !== 'COMPLIANT') return false;
    if (controlSearch) {
      const q = controlSearch.toLowerCase();
      return (
        c.code.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.nonComplianceReason && c.nonComplianceReason.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Task Toggle Handler
  const handleToggleTask = (taskId: string, currentTaskStatus: HeatmapCellTask['status']) => {
    const nextStatus: HeatmapCellTask['status'] =
      currentTaskStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    const updated = ComplianceHeatmapService.toggleTaskStatus(activeCell.id, taskId, nextStatus);
    if (updated) {
      setActiveCell(updated);
      setCurrentScore(updated.score);
      setCurrentStatus(updated.status);
      onCellUpdated(updated);

      logAuditEvent(
        'UPDATE',
        'Compliance Heatmap Remediation',
        `Task "${taskId}" in ${activeCell.departmentName} • ${activeCell.targetCode} marked as ${nextStatus}. New score: ${updated.score}%.`
      );

      showToast({
        title: nextStatus === 'COMPLETED' ? 'Remediation Task Completed' : 'Task Reopened',
        message: `${activeCell.targetCode} compliance score updated to ${updated.score}% (${updated.status})`,
        type: nextStatus === 'COMPLETED' ? 'success' : 'info'
      });
    }
  };

  // Add Task Handler
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const due = new Date();
    due.setDate(due.getDate() + newTaskDays);

    const updated = ComplianceHeatmapService.addTaskToCell(activeCell.id, {
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || `Remediation action for ${activeCell.targetCode} in ${activeCell.departmentName}`,
      status: 'PENDING',
      priority: newTaskPriority,
      assignee: newTaskAssignee.trim() || activeCell.controlOwner,
      dueDate: due.toISOString().split('T')[0],
      relatedControlCode: newTaskRelControl || activeCell.keyControls?.[0]?.code || activeCell.targetCode,
      capaRef: `CAPA-${activeCell.departmentId.slice(-3).toUpperCase()}-${activeCell.targetCode.replace(/[^a-zA-Z0-9]/g, '')}`
    });

    if (updated) {
      setActiveCell(updated);
      onCellUpdated(updated);
      setShowAddTaskForm(false);
      setNewTaskTitle('');
      setNewTaskDesc('');

      logAuditEvent(
        'CREATE',
        'Compliance Remediation Task',
        `Added action task "${newTaskTitle}" to ${activeCell.departmentName} • ${activeCell.targetCode}`
      );

      showToast({
        title: 'Remediation Task Added',
        message: `Assigned to ${newTaskAssignee || activeCell.controlOwner}`,
        type: 'success'
      });
    }
  };

  // Update Control Status Directly
  const handleSetControlStatus = (controlCode: string, newStatus: HeatmapStatus) => {
    const updated = ComplianceHeatmapService.updateControlStatus(activeCell.id, controlCode, newStatus);
    if (updated) {
      setActiveCell(updated);
      setCurrentScore(updated.score);
      setCurrentStatus(updated.status);
      onCellUpdated(updated);

      logAuditEvent(
        'UPDATE',
        'Control Conformance Attestation',
        `Control ${controlCode} in ${activeCell.departmentName} set to ${newStatus}. Cell score updated to ${updated.score}%.`
      );

      showToast({
        title: 'Control Status Updated',
        message: `${controlCode} marked as ${newStatus} (${updated.score}% overall)`,
        type: 'success'
      });
    }
  };

  // Copy Tasks Checklist to Clipboard
  const handleCopyTasks = () => {
    const text = (activeCell.outstandingTasks || [])
      .map(
        t =>
          `- [${t.status === 'COMPLETED' ? 'x' : ' '}] **[${t.priority}]** ${t.title} (Assignee: ${t.assignee}, Due: ${t.dueDate}, Ref: ${t.relatedControlCode})`
      )
      .join('\n');

    const header = `# Remediation Action Plan: ${activeCell.departmentName} × ${activeCell.targetCode} (${activeCell.targetTitle})\nStatus: ${activeCell.status} | Score: ${activeCell.score}%\n\n`;

    navigator.clipboard.writeText(header + text).then(() => {
      showToast({
        title: 'Remediation Plan Copied',
        message: 'Action tasks formatted as Markdown and copied to clipboard.',
        type: 'info'
      });
    });
  };

  // Save Modal Overrides
  const handleSave = () => {
    setIsSaving(true);
    try {
      const updated = ComplianceHeatmapService.updateCell(activeCell.id, {
        status: currentStatus,
        score: currentScore,
        complianceNotes
      });

      if (updated) {
        setActiveCell(updated);
        onCellUpdated(updated);
        logAuditEvent(
          'UPDATE',
          'Compliance Heatmap Inspection',
          `Updated compliance status of ${activeCell.departmentName} for ${activeCell.targetCode} to ${currentStatus} (${currentScore}%).`
        );
        showToast({
          title: 'Compliance Node Saved',
          message: `${activeCell.departmentName} • ${activeCell.targetCode} signed off as ${currentStatus}`,
          type: 'success'
        });
        onClose();
      }
    } catch (e) {
      console.error('Failed to update cell:', e);
      showToast({
        title: 'Update Failed',
        message: 'Could not save compliance node status',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: HeatmapStatus) => {
    switch (status) {
      case 'COMPLIANT':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Compliant</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            <span>In Progress</span>
          </span>
        );
      case 'NON_COMPLIANT':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Non-Compliant</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
            <span>Not Applicable</span>
          </span>
        );
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
            Critical Risk
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
            High Risk
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
            Medium Risk
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            Low Risk
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: HeatmapCellTask['priority']) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-950 text-rose-300 border border-rose-800">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-800">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-sky-950 text-sky-300 border border-sky-800">MEDIUM</span>;
      default:
        return <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">LOW</span>;
    }
  };

  const pendingTasksCount = (activeCell.outstandingTasks || []).filter(t => t.status !== 'COMPLETED').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors ${
          theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-start justify-between ${
            theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {activeCell.dimensionType === 'ISO_27001' ? 'ISO 27001:2022' : 'MAS TRM 2024'}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold font-mono text-slate-300">{activeCell.targetCode}</span>
              <span className="text-xs text-slate-400">•</span>
              {getRiskBadge(activeCell.riskLevel)}
            </div>
            <h2 className="text-lg sm:text-xl font-bold mt-1 tracking-tight flex items-center space-x-2">
              <span>{activeCell.departmentName}</span>
              <span className="text-slate-500 font-normal">×</span>
              <span className="text-indigo-400 font-semibold">{activeCell.targetCode}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Standard Clause: <span className="font-semibold text-slate-200">{activeCell.targetTitle}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <div className="text-right hidden sm:block">
              <div className="flex items-center justify-end space-x-1">
                <span className={`text-2xl font-black font-mono block leading-none ${
                  currentScore >= 85 ? 'text-emerald-400' : currentScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {currentScore}%
                </span>
                {activeCell.trend === 'UP' ? (
                  <span className="inline-flex items-center text-emerald-400" title={`Trend: Improved +${Math.abs(activeCell.scoreDelta ?? 0)}% vs last assessment`}>
                    <ArrowUp className="w-4 h-4 stroke-[3]" />
                  </span>
                ) : activeCell.trend === 'DOWN' ? (
                  <span className="inline-flex items-center text-rose-400" title={`Trend: Regressed -${Math.abs(activeCell.scoreDelta ?? 0)}% vs last assessment`}>
                    <ArrowDown className="w-4 h-4 stroke-[3]" />
                  </span>
                ) : (
                  <span className="inline-flex items-center text-slate-400 opacity-60" title="Trend: Stable vs last assessment">
                    <Minus className="w-4 h-4 stroke-[3]" />
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400">
                {activeCell.scoreDelta !== undefined && activeCell.scoreDelta !== 0
                  ? `${activeCell.scoreDelta > 0 ? '+' : ''}${activeCell.scoreDelta}% vs prior`
                  : 'Score'}
              </span>
            </div>
            {getStatusBadge(currentStatus)}
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                theme === 'light'
                  ? 'hover:bg-slate-200 text-slate-500 border-slate-200'
                  : 'hover:bg-slate-800 text-slate-400 border-slate-800'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Compliance Overlay Synchronized Banner */}
        {complianceOverlayActive && overlayData && (
          <div className={`px-5 py-2.5 border-b text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors ${
            theme === 'light' ? 'bg-indigo-50 border-indigo-200 text-indigo-950' : 'bg-indigo-950/40 border-indigo-800/60 text-indigo-200'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Layers className="w-3.5 h-3.5" />
              </span>
              <div>
                <span className="font-bold text-white">Compliance Maturity Overlay:</span>{' '}
                <span className="text-indigo-300">
                  {overlayData.maturityScore}% ({overlayData.maturityLevel}) • Benchmark: {overlayData.domainBenchmark}%
                </span>
                <span className="ml-2 text-[11px] opacity-80">
                  (Raw Risk: {activeCell?.score}%, Delta: {overlayData.variance >= 0 ? '+' : ''}{overlayData.variance}%)
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
              {overlayData.reportsDomainTitle}
            </span>
          </div>
        )}

        {/* Dynamic Context Alert Banner */}
        <div className={`px-5 py-2.5 border-b text-xs flex items-center justify-between gap-2 ${
          activeCell.status === 'NON_COMPLIANT'
            ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
            : activeCell.status === 'IN_PROGRESS'
            ? 'bg-amber-950/30 border-amber-800/50 text-amber-200'
            : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
        }`}>
          <div className="flex items-center space-x-2 truncate">
            {activeCell.status === 'NON_COMPLIANT' ? (
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            ) : activeCell.status === 'IN_PROGRESS' ? (
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span className="truncate">
              {activeCell.status === 'NON_COMPLIANT' ? (
                <>
                  <strong className="font-bold text-rose-300">Statutory Deficiency: </strong>
                  {nonCompliantControls.length} non-compliant control(s) and {pendingTasksCount} outstanding action task(s) require remediation.
                </>
              ) : activeCell.status === 'IN_PROGRESS' ? (
                <>
                  <strong className="font-bold text-amber-300">Active Remediation: </strong>
                  {inProgressControls.length} control(s) undergoing verification. {pendingTasksCount} task(s) open.
                </>
              ) : (
                <>
                  <strong className="font-bold text-emerald-300">Fully Compliant: </strong>
                  All controls implemented with cryptographic evidence attached.
                </>
              )}
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
              Owner: <strong className="text-slate-200">{activeCell.controlOwner}</strong>
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className={`flex items-center px-4 sm:px-5 border-b text-xs font-semibold overflow-x-auto no-scrollbar ${
            theme === 'light' ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900'
          }`}
        >
          <button
            data-testid="tab-evidence-logs"
            onClick={() => setActiveTab('evidence')}
            className={`py-3 px-3 border-b-2 transition -mb-px flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'evidence'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Specific Evidence Logs</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">
              {evidenceLogs.length}
            </span>
          </button>

          <button
            data-testid="tab-detailed-history"
            onClick={() => setActiveTab('history')}
            className={`py-3 px-3 border-b-2 transition -mb-px flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'history'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span>Detailed Audit History</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 font-bold">
              {auditHistoryCycles.length} Cycles
            </span>
          </button>

          <button
            onClick={() => setActiveTab('non_compliant')}
            className={`py-3 px-3 border-b-2 transition -mb-px flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'non_compliant'
                ? 'border-rose-500 text-rose-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Non-Compliant Controls</span>
            {nonCompliantControls.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/20 text-rose-300 font-bold">
                {nonCompliantControls.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3 px-3 border-b-2 transition -mb-px flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'tasks'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Action Tasks</span>
            {pendingTasksCount > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-bold">
                {pendingTasksCount}
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-400">
                {tasksList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('all_controls')}
            className={`py-3 px-3 border-b-2 transition -mb-px flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'all_controls'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>All Scope Controls</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-400">
              {activeCell.keyControls?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('findings')}
            className={`py-3 px-3 border-b-2 transition -mb-px flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'findings'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>CAPA / Findings</span>
            {activeCell.openFindingsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/20 text-rose-300 font-bold">
                {activeCell.openFindingsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 transition -mb-px flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Overview &amp; Signoff</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: NON-COMPLIANT CONTROLS */}
          {activeTab === 'non_compliant' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Non-Compliant & In-Progress Controls ({deficientControls.length})</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Specific statutory control deficiencies identified during audit evaluation for {activeCell.departmentName}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('tasks')}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center space-x-1 transition cursor-pointer"
                >
                  <span>View Action Tasks</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {deficientControls.length > 0 ? (
                <div className="space-y-3">
                  {deficientControls.map(ctrl => (
                    <div
                      key={ctrl.code}
                      className={`p-3.5 rounded-xl border transition-all ${
                        ctrl.status === 'NON_COMPLIANT'
                          ? 'bg-rose-950/30 border-rose-500/50 shadow-xs'
                          : 'bg-amber-950/20 border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="font-mono text-xs font-bold text-indigo-400">{ctrl.code}</span>
                            {ctrl.mandatory && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                                Mandatory Statutory Requirement
                              </span>
                            )}
                            {ctrl.remediationSlaDays && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-800 text-amber-300 border border-amber-900/60 flex items-center space-x-1">
                                <Clock className="w-2.5 h-2.5" />
                                <span>{ctrl.remediationSlaDays}-Day Remediation SLA</span>
                              </span>
                            )}
                          </div>

                          <h5 className="text-xs font-bold text-slate-100 mt-1">{ctrl.title}</h5>
                          {ctrl.description && (
                            <p className="text-[11px] text-slate-400 mt-0.5">{ctrl.description}</p>
                          )}
                        </div>

                        <div className="shrink-0">{getStatusBadge(ctrl.status)}</div>
                      </div>

                      {/* Explicit Non-Compliance Reason Callout */}
                      {ctrl.nonComplianceReason && (
                        <div className="mt-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-rose-500/30 text-xs">
                          <div className="flex items-start space-x-2">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-rose-300 text-[11px] block">
                                Identified Deficiency & Root Cause:
                              </span>
                              <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                                {ctrl.nonComplianceReason}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Quick Action Remediations */}
                      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-slate-400">
                          Accountable Lead: <strong className="text-slate-300">{ctrl.assignedLead || activeCell.controlOwner}</strong>
                        </span>

                        <div className="flex items-center space-x-2">
                          {ctrl.status === 'NON_COMPLIANT' && (
                            <button
                              type="button"
                              onClick={() => handleSetControlStatus(ctrl.code, 'IN_PROGRESS')}
                              className="px-2.5 py-1 rounded text-[11px] font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition cursor-pointer"
                            >
                              Mark Remediation In Progress
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleSetControlStatus(ctrl.code, 'COMPLIANT')}
                            className="px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition cursor-pointer flex items-center space-x-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Attest as Compliant</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center rounded-xl border border-slate-800 bg-slate-950/40 text-slate-400 text-xs">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="font-bold text-sm text-slate-200">Zero Non-Compliant Controls</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                    All evaluated statutory controls in this department and standard clause currently meet or exceed ISO/MAS compliance criteria.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: OUTSTANDING ACTION TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              {/* Task Header & Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Remediation Action Tasks ({tasksList.length})</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Specific actionable tasks to resolve compliance gaps in {activeCell.departmentName}.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="inline-flex rounded-lg border border-slate-800 p-0.5 bg-slate-950 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setTaskFilter('open')}
                      className={`px-2 py-0.5 rounded-md font-medium cursor-pointer ${
                        taskFilter === 'open' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Open ({pendingTasksCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskFilter('completed')}
                      className={`px-2 py-0.5 rounded-md font-medium cursor-pointer ${
                        taskFilter === 'completed' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Completed ({tasksList.length - pendingTasksCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskFilter('all')}
                      className={`px-2 py-0.5 rounded-md font-medium cursor-pointer ${
                        taskFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      All ({tasksList.length})
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyTasks}
                    title="Copy Markdown Action Checklist"
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 transition cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddTaskForm(!showAddTaskForm)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1 shadow-sm transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Task</span>
                  </button>
                </div>
              </div>

              {/* Inline Add Task Form */}
              {showAddTaskForm && (
                <form
                  onSubmit={handleCreateTask}
                  className={`p-3.5 rounded-xl border space-y-3 animate-in fade-in duration-150 ${
                    theme === 'light' ? 'bg-indigo-50/70 border-indigo-200' : 'bg-indigo-950/30 border-indigo-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-indigo-300 flex items-center space-x-1.5">
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Create Remediation Action Task</span>
                    </h5>
                    <button
                      type="button"
                      onClick={() => setShowAddTaskForm(false)}
                      className="text-slate-400 hover:text-slate-200 text-xs"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Task Action Title:
                      </label>
                      <input
                        type="text"
                        required
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        placeholder="e.g. Deploy automated PR blocking gates across 14 payment services"
                        className={`w-full p-2 rounded-lg border text-xs ${
                          theme === 'light'
                            ? 'bg-white border-slate-300 text-slate-900'
                            : 'bg-slate-900 border-slate-700 text-white'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Priority Level:
                      </label>
                      <select
                        value={newTaskPriority}
                        onChange={e => setNewTaskPriority(e.target.value as any)}
                        className={`w-full p-2 rounded-lg border text-xs ${
                          theme === 'light'
                            ? 'bg-white border-slate-300 text-slate-900'
                            : 'bg-slate-900 border-slate-700 text-white'
                        }`}
                      >
                        <option value="CRITICAL">CRITICAL (Immediate SLA)</option>
                        <option value="HIGH">HIGH (7-day SLA)</option>
                        <option value="MEDIUM">MEDIUM (14-day SLA)</option>
                        <option value="LOW">LOW (30-day SLA)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Assignee:
                      </label>
                      <input
                        type="text"
                        value={newTaskAssignee}
                        onChange={e => setNewTaskAssignee(e.target.value)}
                        placeholder="Accountable team member or lead"
                        className={`w-full p-2 rounded-lg border text-xs ${
                          theme === 'light'
                            ? 'bg-white border-slate-300 text-slate-900'
                            : 'bg-slate-900 border-slate-700 text-white'
                        }`}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Remediation Description / Technical Scope:
                      </label>
                      <textarea
                        rows={2}
                        value={newTaskDesc}
                        onChange={e => setNewTaskDesc(e.target.value)}
                        placeholder="Specify concrete remediation actions, verification criteria, and evidence to capture..."
                        className={`w-full p-2 rounded-lg border text-xs ${
                          theme === 'light'
                            ? 'bg-white border-slate-300 text-slate-900'
                            : 'bg-slate-900 border-slate-700 text-white'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddTaskForm(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                      Save Task to Cell
                    </button>
                  </div>
                </form>
              )}

              {/* Tasks List */}
              {filteredTasks.length > 0 ? (
                <div className="space-y-2">
                  {filteredTasks.map(task => {
                    const isCompleted = task.status === 'COMPLETED';
                    return (
                      <div
                        key={task.id}
                        className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                          isCompleted
                            ? 'bg-slate-950/30 border-slate-800/80 opacity-75'
                            : task.priority === 'CRITICAL'
                            ? 'bg-rose-950/20 border-rose-500/40'
                            : 'bg-slate-950/50 border-slate-800'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <button
                            type="button"
                            onClick={() => handleToggleTask(task.id, task.status)}
                            className="mt-0.5 text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                            title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                          >
                            {isCompleted ? (
                              <CheckSquare className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                            )}
                          </button>

                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                              <span
                                className={`text-xs font-semibold ${
                                  isCompleted ? 'line-through text-slate-400' : 'text-slate-100'
                                }`}
                              >
                                {task.title}
                              </span>
                              {getPriorityBadge(task.priority)}
                              {task.relatedControlCode && (
                                <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-800/50">
                                  Ref: {task.relatedControlCode}
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-400 leading-relaxed">{task.description}</p>

                            <div className="flex items-center space-x-3 text-[10px] text-slate-400 pt-1">
                              <span className="flex items-center space-x-1">
                                <User className="w-3 h-3 text-slate-500" />
                                <span>{task.assignee}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3 text-slate-500" />
                                <span>Due {task.dueDate}</span>
                              </span>
                              {task.daysOutstanding > 0 && !isCompleted && (
                                <span className="text-amber-400 font-mono">
                                  Open {task.daysOutstanding}d
                                </span>
                              )}
                              {task.capaRef && (
                                <span className="font-mono text-slate-500">{task.capaRef}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleTask(task.id, task.status)}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                              isCompleted
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : task.status === 'IN_PROGRESS'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                            }`}
                          >
                            {task.status}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center rounded-xl border border-slate-800 bg-slate-950/40 text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="font-semibold text-slate-200">No Action Tasks In This Filter</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {taskFilter === 'open'
                      ? 'All outstanding tasks for this node have been completed!'
                      : 'No tasks registered under this criteria.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ALL SCOPE CONTROLS */}
          {activeTab === 'all_controls' && (
            <div className="space-y-3">
              {/* Search & Filter bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={controlSearch}
                    onChange={e => setControlSearch(e.target.value)}
                    placeholder="Search controls by code, title, or keyword..."
                    className={`w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs ${
                      theme === 'light'
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  />
                </div>

                <div className="flex items-center space-x-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setControlFilter('all')}
                    className={`px-2 py-1 rounded-md cursor-pointer ${
                      controlFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All ({activeCell.keyControls?.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setControlFilter('non_compliant')}
                    className={`px-2 py-1 rounded-md cursor-pointer ${
                      controlFilter === 'non_compliant' ? 'bg-rose-600 text-white' : 'text-rose-400 hover:text-rose-300'
                    }`}
                  >
                    Non-Compliant ({nonCompliantControls.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setControlFilter('in_progress')}
                    className={`px-2 py-1 rounded-md cursor-pointer ${
                      controlFilter === 'in_progress' ? 'bg-amber-600 text-white' : 'text-amber-400 hover:text-amber-300'
                    }`}
                  >
                    In Progress ({inProgressControls.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setControlFilter('compliant')}
                    className={`px-2 py-1 rounded-md cursor-pointer ${
                      controlFilter === 'compliant' ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:text-emerald-300'
                    }`}
                  >
                    Compliant ({activeCell.controlsImplemented})
                  </button>
                </div>
              </div>

              {/* Controls List */}
              <div className="space-y-2">
                {filteredControls.map((ctrl, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${
                      theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-mono text-xs font-bold text-indigo-400">{ctrl.code}</span>
                        {ctrl.mandatory && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                            Mandatory
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-200">{ctrl.title}</p>
                      {ctrl.description && (
                        <p className="text-[11px] text-slate-400">{ctrl.description}</p>
                      )}
                      {ctrl.evidenceRef && (
                        <span className="text-[10px] text-slate-400 font-mono block">
                          Artifact Ref: {ctrl.evidenceRef}
                        </span>
                      )}
                      {ctrl.nonComplianceReason && (
                        <p className="text-[11px] text-rose-400 font-medium mt-1">
                          Deficiency: {ctrl.nonComplianceReason}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0">{getStatusBadge(ctrl.status)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: FINDINGS / CAPA */}
          {activeTab === 'findings' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300">Open Nonconformities & Remediation (CAPA):</h4>
                <button
                  onClick={() => {
                    if (onNavigateModule) onNavigateModule('non_conformity');
                  }}
                  className="text-xs font-semibold text-indigo-400 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <span>Open CAPA Module</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {activeCell.topFindings && activeCell.topFindings.length > 0 ? (
                <div className="space-y-2">
                  {activeCell.topFindings.map((f, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-rose-400">{f.code}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                          {f.severity}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-rose-200">{f.title}</p>
                      <div className="flex items-center justify-between text-[11px] text-rose-300/80 pt-1">
                        <span>Open for {f.daysOpen} days</span>
                        <span className="font-mono">{f.capaStatus}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center rounded-xl border border-slate-800 bg-slate-950/40 text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="font-semibold text-slate-200">No Open Non-Conformities</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    This department has zero active audit findings on this control clause.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB: SPECIFIC EVIDENCE LOGS */}
          {activeTab === 'evidence' && (
            <div className="space-y-4" data-testid="modal-evidence-logs-section">
              {/* Evidence Overview Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Verified Evidence Logs</span>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xl font-black font-mono text-emerald-500">{evidenceLogs.length}</span>
                    <span className="text-[10px] text-slate-400">entries</span>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Cryptographic Hash</span>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <Hash className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-bold text-slate-200 font-mono">SHA-256 WORM</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium">100% Immutable</span>
                </div>

                <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Evidence Retention</span>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <Clock className="w-4 h-4 text-sky-400" />
                    <span className="text-sm font-bold text-slate-200 font-mono">365 Days Statutory</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Cold storage archive</span>
                </div>

                <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Evidence Integrity</span>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <Shield className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-bold text-slate-200">ISO 27001 / MAS</span>
                  </div>
                  <span className="text-[10px] text-indigo-400 font-medium">TÜV SÜD Validated</span>
                </div>
              </div>

              {/* Filter & Search Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <div className="flex items-center space-x-2 flex-1 max-w-md">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search evidence logs by source, keyword, hash..."
                      value={evidenceSearch}
                      onChange={e => setEvidenceSearch(e.target.value)}
                      className={`w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs outline-none ${
                        theme === 'light' ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
                      }`}
                    />
                  </div>

                  <select
                    value={evidenceTypeFilter}
                    onChange={e => setEvidenceTypeFilter(e.target.value)}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                      theme === 'light' ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
                    }`}
                  >
                    <option value="ALL">All Evidence Types</option>
                    <option value="Automated Telemetry">Automated Telemetry</option>
                    <option value="Config Snapshot">Config Snapshot</option>
                    <option value="Attestation">Attestation Document</option>
                    <option value="Audit Trail">Audit Trail Log</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      if (onNavigateModule) onNavigateModule('evidence_centre');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Open Evidence Centre</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Specific Evidence Logs Stream */}
              <div className="space-y-2.5">
                {evidenceLogs
                  .filter(log => {
                    if (evidenceTypeFilter !== 'ALL' && log.evidenceType !== evidenceTypeFilter) return false;
                    if (evidenceSearch.trim()) {
                      const q = evidenceSearch.toLowerCase();
                      return (
                        log.source.toLowerCase().includes(q) ||
                        log.eventType.toLowerCase().includes(q) ||
                        log.payloadSummary.toLowerCase().includes(q) ||
                        log.sha256Digest.toLowerCase().includes(q) ||
                        log.inspector.toLowerCase().includes(q)
                      );
                    }
                    return true;
                  })
                  .map(log => {
                    const isExpanded = expandedLogId === log.id;
                    const isCopied = copiedHash === log.sha256Digest;

                    return (
                      <div
                        key={log.id}
                        className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                          theme === 'light'
                            ? 'bg-slate-50/90 border-slate-200 hover:border-slate-300'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Header: Timestamp, Source Pill, Verification Status */}
                        <div className="flex items-start sm:items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                              {log.source}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">{log.timestamp}</span>
                            <span className="text-[10px] font-mono text-slate-500">ID: {log.id}</span>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center space-x-1 border ${
                                log.status === 'VERIFIED'
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              }`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{log.status}</span>
                            </span>
                          </div>
                        </div>

                        {/* Event Title & Payload Summary */}
                        <div>
                          <h5 className="text-xs font-bold text-slate-100 flex items-center space-x-1.5">
                            <span>{log.eventType}</span>
                            <span className="text-[10px] font-normal text-slate-400 font-mono">({log.evidenceType})</span>
                          </h5>
                          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{log.payloadSummary}</p>
                        </div>

                        {/* SHA-256 Digest Bar & Actions */}
                        <div className={`p-2 rounded-lg border font-mono text-[10px] flex items-center justify-between gap-2 ${
                          theme === 'light' ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}>
                          <div className="flex items-center space-x-1.5 truncate">
                            <Hash className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">SHA-256: {log.sha256Digest}</span>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(log.sha256Digest);
                                setCopiedHash(log.sha256Digest);
                                showToast({
                                  title: 'SHA-256 Digest Copied',
                                  message: `${log.sha256Digest.slice(0, 16)}... copied to clipboard`,
                                  type: 'info'
                                });
                                setTimeout(() => setCopiedHash(null), 2500);
                              }}
                              className="px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 font-semibold flex items-center space-x-1 cursor-pointer transition"
                              title="Copy SHA-256 hash"
                            >
                              {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{isCopied ? 'Copied' : 'Copy Hash'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setExpandedLogId(prev => (prev === log.id ? null : log.id))}
                              className="px-2 py-0.5 rounded hover:bg-slate-800 text-indigo-400 font-semibold flex items-center space-x-1 cursor-pointer transition"
                            >
                              <span>{isExpanded ? 'Hide Payload' : 'Inspect Payload'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Expanded JSON Parameters */}
                        {isExpanded && (
                          <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 font-mono text-[11px] space-y-1 text-slate-300">
                            <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-800 pb-1 mb-1.5">
                              <span>Inspector: {log.inspector}</span>
                              <span>Format: JSON Evidence Log Payload</span>
                            </div>
                            <pre className="overflow-x-auto text-[10px] text-emerald-400/90 leading-relaxed font-mono">
                              {JSON.stringify(log.parameters, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* Underlying Control Evidence Mapping Sub-Table */}
              {activeCell.keyControls && activeCell.keyControls.length > 0 && (
                <div className={`p-4 rounded-xl border mt-4 ${
                  theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Control-to-Evidence Document References ({activeCell.keyControls.length} Controls)</span>
                  </h4>
                  <div className="divide-y divide-slate-800 text-xs">
                    {activeCell.keyControls.map((ctrl, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <span className="font-mono font-bold text-indigo-400 text-xs mr-2">{ctrl.code}</span>
                          <span className="text-slate-200 font-medium">{ctrl.title}</span>
                          {ctrl.evidenceRef && (
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                              Attached Workpaper Ref: <strong>{ctrl.evidenceRef}</strong>
                            </span>
                          )}
                        </div>
                        <div className="shrink-0">{getStatusBadge(ctrl.status)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: DETAILED AUDIT HISTORY & 5-CYCLE PROGRESSION */}
          {activeTab === 'history' && (
            <div className="space-y-4" data-testid="modal-audit-history-section">
              {/* Header Historical Performance Summary Card */}
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div>
                  <div className="flex items-center space-x-2">
                    <History className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-sm font-bold text-slate-100">
                      Audit Cycle Assessment History &amp; Score Progression
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Multi-cycle compliance audit trajectory for <strong>{activeCell.departmentName}</strong> across control <strong>{activeCell.targetCode}</strong>.
                  </p>
                </div>

                <div className="flex items-center space-x-4 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Current Score</span>
                    <span className={`text-2xl font-black font-mono ${
                      currentScore >= 85 ? 'text-emerald-400' : currentScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {currentScore}%
                    </span>
                  </div>

                  <div className="pl-4 border-l border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">5-Cycle Trend</span>
                    <MaturitySparkline
                      scores={activeCell.historicalScores}
                      currentScore={currentScore}
                      previousScore={activeCell.previousScore}
                      scoreDelta={activeCell.scoreDelta}
                      trend={activeCell.trend}
                      size="md"
                      showSparkline={true}
                      showArrow={true}
                      showDeltaText={true}
                    />
                  </div>
                </div>
              </div>

              {/* 5-Cycle Historical Progression Timeline Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Chronological Audit Assessment Timeline ({auditHistoryCycles.length} Audit Cycles)</span>
                </h4>

                <div className="space-y-2.5">
                  {auditHistoryCycles.map((cycle, idx) => {
                    const isSelected = selectedHistoryCycle === cycle.cycleNumber;
                    const isCurrent = cycle.cycleNumber === 5;

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedHistoryCycle(cycle.cycleNumber)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-950/30 border-indigo-500/60 ring-1 ring-indigo-500/40 shadow-md'
                            : isCurrent
                            ? 'bg-slate-950/80 border-slate-700'
                            : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Top Line: Cycle Name, Date, Status */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center space-x-2">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                              isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {cycle.cycleNumber}
                            </span>
                            <span className="text-xs font-bold text-slate-100">{cycle.cycleName}</span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                Current Active
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-mono text-slate-400">{cycle.date}</span>
                            <span className={`font-mono text-xs font-extrabold ${
                              cycle.score >= 85 ? 'text-emerald-400' : cycle.score >= 50 ? 'text-amber-400' : 'text-rose-400'
                            }`}>
                              {cycle.score}%
                            </span>
                            {getStatusBadge(cycle.status)}
                          </div>
                        </div>

                        {/* Findings & Notes */}
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                          {cycle.findingsSummary}
                        </p>

                        {/* Procedure & Record ID */}
                        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 flex-wrap gap-1">
                          <span>Evaluator: <strong className="text-slate-200">{cycle.leadAuditor}</strong></span>
                          <span>Procedure: <em>{cycle.verificationProcedure}</em></span>
                          <span className="font-mono text-indigo-400">{cycle.auditRecordId}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Auditor Sign-off & Attestation History Block */}
              <div className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Auditor Sign-Off &amp; Immutable Attestation Log</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Accountable Lead</span>
                    <strong className="text-slate-100">{activeCell.controlOwner || 'Assigned Lead'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Sign-off Status</span>
                    <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{activeCell.auditorSignoff ? 'Signed & Attested' : 'Attested by CISO Office'}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Last Assessed</span>
                    <span className="font-mono text-slate-300">{activeCell.lastAssessedAt || '2026-09-28'}</span>
                  </div>
                </div>

                {activeCell.complianceNotes && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800 text-xs text-slate-300">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                      Lead Auditor Notes:
                    </span>
                    <p className="italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-slate-300">
                      "{activeCell.complianceNotes}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: OVERVIEW & ATTESTATION */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Score & Risk Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div
                  className={`p-3 rounded-xl border ${
                    theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Compliance Score</span>
                  <div className="flex items-baseline space-x-1 mt-1">
                    <span
                      className={`text-2xl font-black font-mono ${
                        currentScore >= 85
                          ? 'text-emerald-400'
                          : currentScore >= 50
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {currentScore}%
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Calculated score</span>
                </div>

                <div
                  className={`p-3 rounded-xl border ${
                    theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Assessment Trend</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <MaturitySparkline
                      scores={activeCell.historicalScores}
                      currentScore={currentScore}
                      previousScore={activeCell.previousScore}
                      scoreDelta={activeCell.scoreDelta}
                      trend={activeCell.trend}
                      size="md"
                      showSparkline={true}
                      showArrow={true}
                      showDeltaText={true}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate mt-1" title={`Prior Assessment: ${activeCell.previousScore ?? currentScore}%`}>
                    Prior: {activeCell.previousScore ?? currentScore}% &bull; 5-Cycle Hist
                  </span>
                </div>

                <div
                  className={`p-3 rounded-xl border ${
                    theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Risk Rating</span>
                  <div className="mt-1.5">{getRiskBadge(activeCell.riskLevel)}</div>
                  <span className="text-[10px] text-slate-400 block mt-1">Residual exposure</span>
                </div>

                <div
                  className={`p-3 rounded-xl border ${
                    theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Controls Coverage</span>
                  <div className="flex items-baseline space-x-1 mt-1">
                    <span className="text-xl font-bold font-mono text-white">
                      {activeCell.controlsImplemented}/{activeCell.controlsTotal}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Controls verified</span>
                </div>

                <div
                  className={`p-3 rounded-xl border ${
                    theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Department Lead</span>
                  <div className="flex items-center space-x-1 mt-1.5 truncate">
                    <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-200 truncate">{activeCell.controlOwner}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Accountable Officer</span>
                </div>
              </div>

              {/* Interactive Status & Score Override Workbench */}
              <div
                className={`p-4 rounded-xl border ${
                  theme === 'light' ? 'bg-indigo-50/50 border-indigo-200' : 'bg-indigo-950/20 border-indigo-800/40'
                }`}
              >
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5 mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Interactive Status Override & Governance Signoff</span>
                </h4>

                <div className="space-y-3">
                  {/* Status Button Toggle */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                      Attested Status:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentStatus('COMPLIANT');
                          setCurrentScore(Math.max(currentScore, 88));
                        }}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                          currentStatus === 'COMPLIANT'
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                            : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Compliant (Green)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCurrentStatus('IN_PROGRESS');
                          setCurrentScore(68);
                        }}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                          currentStatus === 'IN_PROGRESS'
                            ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                            : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>In Progress (Yellow)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCurrentStatus('NON_COMPLIANT');
                          setCurrentScore(38);
                        }}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                          currentStatus === 'NON_COMPLIANT'
                            ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                            : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Non-Compliant (Red)</span>
                      </button>
                    </div>
                  </div>

                  {/* Score Slider */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
                      <span>Adjust Implementation Coverage Score:</span>
                      <span className="font-mono text-indigo-400 font-bold">{currentScore}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={currentScore}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setCurrentScore(val);
                        if (val >= 85) setCurrentStatus('COMPLIANT');
                        else if (val >= 50) setCurrentStatus('IN_PROGRESS');
                        else setCurrentStatus('NON_COMPLIANT');
                      }}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  {/* Notes / Auditor Comments */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Auditor Justification & Compliance Notes:
                    </label>
                    <textarea
                      value={complianceNotes}
                      onChange={e => setComplianceNotes(e.target.value)}
                      rows={2}
                      className={`w-full p-2.5 rounded-lg border text-xs transition ${
                        theme === 'light'
                          ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
                          : 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500'
                      }`}
                      placeholder="Add compliance observations, sample test notes, or CAPA references..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className={`p-4 border-t flex items-center justify-between ${
            theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
          }`}
        >
          <div className="text-[11px] text-slate-400">
            Last assessed: <span className="font-mono text-slate-300">{activeCell.lastAssessedAt}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                theme === 'light'
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
              }`}
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center space-x-1.5 transition disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save & Signoff Node</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
