import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import { FindingCAPARecord, UserRole, IndependentAuditValidation } from '../../types';
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Mail,
  Send,
  Plus,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Building,
  User,
  Calendar,
  FileCheck2,
  HelpCircle,
  ExternalLink,
  RefreshCw,
  Eye,
  Trash2,
  Lock,
  Download,
  Check,
  ChevronRight,
  X,
  FileText,
  BadgeAlert,
  BarChart3,
  Sparkles,
  Award
} from 'lucide-react';
import { NCTrendAnalyticsChart } from './NCTrendAnalyticsChart';
import { CapaWorkflowModal } from '../capa/CapaWorkflowModal';
import { CapaAuditCertificateModal } from '../capa/CapaAuditCertificateModal';

interface NonConformityLogTrackerProps {
  onNavigateToFieldwork?: () => void;
}

// Department directory with automated email bindings
const DEPARTMENT_OWNERS: Record<string, { owner: string; email: string }> = {
  'Software Engineering & DevOps': { owner: 'Priya Sharma (DevOps Lead)', email: 'priya.sharma@apex-fintech.internal' },
  'IT & Infrastructure': { owner: 'Arun Krishnan (Principal Cloud Architect)', email: 'arun.krishnan@apex-fintech.internal' },
  'Information Security & Compliance': { owner: 'Elena Rostova (CISO)', email: 'elena.rostova@apex-fintech.internal' },
  'Human Resources & People Ops': { owner: 'Sarah Jenkins (VP People)', email: 'sarah.jenkins@apex-fintech.internal' },
  'Procurement & Vendor Management': { owner: 'James Sterling (Head of Procurement)', email: 'james.sterling@apex-fintech.internal' },
  'Legal & Data Governance': { owner: 'Rachel Zane (General Counsel)', email: 'rachel.zane@apex-fintech.internal' },
  'Physical Facilities & Security': { owner: 'David Kowalski (Facilities Director)', email: 'david.kowalski@apex-fintech.internal' }
};

export const NonConformityLogTracker: React.FC<NonConformityLogTrackerProps> = ({
  onNavigateToFieldwork
}) => {
  const {
    findings,
    addFinding,
    updateFinding,
    deleteFinding,
    currentTenant,
    currentUser,
    currentRole,
    logAuditEvent,
    setActiveModule,
    theme
  } = useGRC();
  const { showToast } = useToast();

  const isAuditor =
    currentRole === 'SUPER_ADMIN' ||
    currentRole === 'INTERNAL_AUDITOR' ||
    currentRole === 'PLATFORM_AUDITOR';

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');

  // Modal states
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [selectedNC, setSelectedNC] = useState<FindingCAPARecord | null>(null);
  const [emailModalNC, setEmailModalNC] = useState<FindingCAPARecord | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [workflowModalFinding, setWorkflowModalFinding] = useState<FindingCAPARecord | null>(null);
  const [certificateFinding, setCertificateFinding] = useState<FindingCAPARecord | null>(null);

  // Form states for Raising New NC
  const [newTitle, setNewTitle] = useState('');
  const [newClause, setNewClause] = useState('A.8.8 Management of technical vulnerabilities');
  const [newSeverity, setNewSeverity] = useState<FindingCAPARecord['severity']>('Minor Non-Conformity');
  const [newDepartment, setNewDepartment] = useState('Software Engineering & DevOps');
  const [newOwnerEmail, setNewOwnerEmail] = useState(DEPARTMENT_OWNERS['Software Engineering & DevOps'].email);
  const [newOwnerName, setNewOwnerName] = useState(DEPARTMENT_OWNERS['Software Engineering & DevOps'].owner);
  const [newDescription, setNewDescription] = useState('');
  const [newRootCause, setNewRootCause] = useState('');
  const [newCorrectiveAction, setNewCorrectiveAction] = useState('');
  const [newPreventiveAction, setNewPreventiveAction] = useState('');
  const [newTargetDays, setNewTargetDays] = useState<number>(14);
  const [autoSendEmail, setAutoSendEmail] = useState<boolean>(true);

  // Verification & Sign-off State in Inspection Modal
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Trend Chart Toggle
  const [showTrendChart, setShowTrendChart] = useState<boolean>(true);

  // Tenant findings
  const tenantNCs = useMemo(() => {
    return findings.filter(f => f.tenantId === currentTenant?.id);
  }, [findings, currentTenant]);

  // Filtered findings
  const filteredNCs = useMemo(() => {
    return tenantNCs.filter(nc => {
      const matchSearch =
        nc.findingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nc.clauseOrControl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nc.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (nc.capaPlan?.owner || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchSeverity = severityFilter === 'All' || nc.severity === severityFilter;
      const matchStatus = statusFilter === 'All' || nc.status === statusFilter;
      const matchDept = departmentFilter === 'All' || nc.department === departmentFilter;

      return matchSearch && matchSeverity && matchStatus && matchDept;
    });
  }, [tenantNCs, searchTerm, severityFilter, statusFilter, departmentFilter]);

  // KPI Metrics
  const metrics = useMemo(() => {
    const total = tenantNCs.length;
    const majorCount = tenantNCs.filter(n => n.severity === 'Major Non-Conformity').length;
    const minorCount = tenantNCs.filter(n => n.severity === 'Minor Non-Conformity').length;
    const observations = tenantNCs.filter(n => n.severity === 'Observation' || n.severity === 'Opportunity for Improvement').length;
    const openCount = tenantNCs.filter(n => n.status === 'Open' || n.status === 'Root Cause Defined').length;
    const submittedCount = tenantNCs.filter(n => n.status === 'CAPA Submitted' || n.status === 'Verification Pending').length;
    const closedCount = tenantNCs.filter(n => n.status === 'Closed Verified').length;
    const closureRate = total > 0 ? Math.round((closedCount / total) * 100) : 100;

    return { total, majorCount, minorCount, observations, openCount, submittedCount, closedCount, closureRate };
  }, [tenantNCs]);

  // Handle department change in form
  const handleDepartmentChange = (dept: string) => {
    setNewDepartment(dept);
    if (DEPARTMENT_OWNERS[dept]) {
      setNewOwnerEmail(DEPARTMENT_OWNERS[dept].email);
      setNewOwnerName(DEPARTMENT_OWNERS[dept].owner);
    }
  };

  // Severity change adjusts target SLA
  const handleSeverityChange = (sev: FindingCAPARecord['severity']) => {
    setNewSeverity(sev);
    if (sev === 'Major Non-Conformity') {
      setNewTargetDays(5); // Strict 5-day SLA
    } else if (sev === 'Minor Non-Conformity') {
      setNewTargetDays(14); // 14-day SLA
    } else {
      setNewTargetDays(30); // 30-day SLA for observations
    }
  };

  // Trigger automated email dispatch simulation
  const dispatchEmailNotification = async (
    nc: FindingCAPARecord,
    notificationType: 'INITIAL_NOTICE' | 'STATUS_UPDATE' | 'OVERDUE_ALERT' | 'CLOSURE_CONFIRMATION' = 'INITIAL_NOTICE'
  ) => {
    const recipient = nc.departmentOwnerEmail || DEPARTMENT_OWNERS[nc.department]?.email || 'department-owner@apex-fintech.internal';
    const sentAt = new Date().toISOString();
    const notificationId = `mail_${Date.now()}`;

    let subject = `[ACTION REQUIRED] ISO 27001 Non-Conformity: ${nc.findingCode} (${nc.severity})`;
    if (notificationType === 'STATUS_UPDATE') {
      subject = `[UPDATE] ISO 27001 CAPA Status Changed: ${nc.findingCode} -> ${nc.status}`;
    } else if (notificationType === 'CLOSURE_CONFIRMATION') {
      subject = `[RESOLVED & CLOSED] ISO 27001 Non-Conformity Verified: ${nc.findingCode}`;
    }

    const updatedLog = [
      ...(nc.notificationLog || []),
      {
        id: notificationId,
        recipient,
        subject,
        sentAt,
        type: notificationType,
        deliveryStatus: 'DELIVERED_250_OK' as const
      }
    ];

    updateFinding(nc.id, {
      departmentOwnerEmail: recipient,
      emailNotificationStatus: 'DISPATCHED',
      lastEmailDispatchedAt: sentAt,
      notificationLog: updatedLog
    });

    await logAuditEvent(
      'CREATE',
      'Non-Conformity Email Dispatcher',
      `Automatic email notification dispatched to department owner <${recipient}> for ${nc.findingCode} (${notificationType}). SMTP 250 OK.`,
      {
        ncCode: nc.findingCode,
        recipient,
        clause: nc.clauseOrControl,
        severity: nc.severity
      }
    );

    showToast({
      title: 'Email Alert Dispatched',
      message: `Automated notice delivered to ${recipient} for ${nc.findingCode}.`,
      type: 'success'
    });
  };

  // Submit new Non-Conformity
  const handleCreateNC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) {
      showToast({ title: 'Validation Error', message: 'Title and description are required.', type: 'warning' });
      return;
    }

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + newTargetDays);
    const targetDateStr = targetDate.toISOString().split('T')[0];

    const newRecordData: Omit<FindingCAPARecord, 'id' | 'tenantId' | 'findingCode' | 'raisedBy' | 'raisedDate'> = {
      source: 'INTERNAL_AUDIT',
      severity: newSeverity,
      title: newTitle,
      clauseOrControl: newClause,
      department: newDepartment,
      description: newDescription,
      departmentOwnerEmail: newOwnerEmail,
      emailNotificationStatus: autoSendEmail ? 'DISPATCHED' : 'NOT_DISPATCHED',
      lastEmailDispatchedAt: autoSendEmail ? new Date().toISOString() : undefined,
      notificationLog: autoSendEmail ? [{
        id: `mail_${Date.now()}`,
        recipient: newOwnerEmail,
        subject: `[ACTION REQUIRED] ISO 27001 Non-Conformity: ${newTitle}`,
        sentAt: new Date().toISOString(),
        type: 'INITIAL_NOTICE',
        deliveryStatus: 'DELIVERED_250_OK'
      }] : [],
      rootCauseAnalysis: {
        methodology: '5_WHYS',
        whys: newRootCause ? [newRootCause] : ['Identified during internal audit fieldwork sampling.'],
        rootCauseStatement: newRootCause || 'Under investigation by department owner.'
      },
      capaPlan: {
        correctiveAction: newCorrectiveAction || 'Immediate containment and remediation plan to be defined.',
        preventiveAction: newPreventiveAction || 'Process adjustment and control automation to prevent recurrence.',
        owner: newOwnerName,
        targetDate: targetDateStr,
        evidenceRequired: 'Operational log evidence demonstrating control adherence and zero recurrence.'
      },
      status: 'Open',
      isExternalLocked: false
    };

    addFinding(newRecordData);

    if (autoSendEmail) {
      await logAuditEvent(
        'CREATE',
        'Non-Conformity Email Dispatcher',
        `Automated notification email triggered to department owner <${newOwnerEmail}> for new finding: "${newTitle}"`,
        { recipient: newOwnerEmail, clause: newClause, severity: newSeverity }
      );
      showToast({
        title: 'Non-Conformity Logged & Notified',
        message: `Finding logged and automated email alert dispatched to ${newOwnerEmail}.`,
        type: 'success'
      });
    } else {
      showToast({
        title: 'Non-Conformity Logged',
        message: `NC successfully added to internal audit register.`,
        type: 'success'
      });
    }

    // Reset Form
    setNewTitle('');
    setNewDescription('');
    setNewRootCause('');
    setNewCorrectiveAction('');
    setNewPreventiveAction('');
    setShowRaiseModal(false);
  };

  // Status transitions
  const handleAdvanceStatus = async (nc: FindingCAPARecord, nextStatus: FindingCAPARecord['status']) => {
    // If advanced to Closed Verified, record verification and attach TOE
    if (nextStatus === 'Closed Verified') {
      const now = new Date().toISOString();
      const validationRecord: IndependentAuditValidation = nc.independentAuditValidation || {
        validationId: `VAL-${Date.now().toString(36).toUpperCase()}`,
        auditorName: currentUser.name,
        auditorEmail: currentUser.email || 'auditor@skanda.internal',
        auditorRole: currentRole,
        auditProgramRef: 'ISO 27001 ISMS Annual Audit 2026',
        validationDate: now.split('T')[0],
        testOfOperatingEffectiveness: 'PASSED' as const,
        samplingMethodology: 'ISO 19011:2018 §6.4.4 representative re-test sample',
        sampleSizeInspected: 5,
        inspectedArtifactReferences: ['CAPA-EVIDENCE-VERIFIED'],
        auditorObservations: 'Independent audit inspection verified operating effectiveness and confirmed root cause eliminated.',
        effectivenessConclusion: 'Corrective and preventive actions verified operating effectively.',
        independenceStatementConfirmed: true,
        digitalSignatureHash: `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        validatedAt: now
      };

      updateFinding(nc.id, {
        status: nextStatus,
        verifiedBy: currentUser.name,
        verifiedDate: now,
        independentAuditValidation: validationRecord
      });
      await dispatchEmailNotification(nc, 'CLOSURE_CONFIRMATION');
    } else {
      updateFinding(nc.id, {
        status: nextStatus
      });
      await dispatchEmailNotification(nc, 'STATUS_UPDATE');
    }

    showToast({
      title: 'Status Updated',
      message: `${nc.findingCode} transitioned to "${nextStatus}". Notification sent.`,
      type: 'info'
    });

    if (selectedNC?.id === nc.id) {
      setSelectedNC(prev => prev ? { ...prev, status: nextStatus } : null);
    }
  };

  // Verify and close NC with signoff
  const handleVerifyAndClose = async () => {
    if (!selectedNC) return;
    setIsVerifying(true);

    const now = new Date().toISOString();
    const validationRecord: IndependentAuditValidation = selectedNC.independentAuditValidation || {
      validationId: `VAL-${Date.now().toString(36).toUpperCase()}`,
      auditorName: currentUser.name,
      auditorEmail: currentUser.email || 'auditor@skanda.internal',
      auditorRole: currentRole,
      auditProgramRef: 'ISO 27001 ISMS Annual Audit 2026',
      validationDate: now.split('T')[0],
      testOfOperatingEffectiveness: 'PASSED' as const,
      samplingMethodology: 'ISO 19011:2018 §6.4.4 representative re-test sample',
      sampleSizeInspected: 10,
      inspectedArtifactReferences: ['CAPA-EVIDENCE-VERIFIED'],
      auditorObservations: verificationNotes || 'Sample testing conducted on production artifacts. Root cause confirmed resolved and effective.',
      effectivenessConclusion: 'Corrective and preventive actions verified operating effectively.',
      independenceStatementConfirmed: true,
      digitalSignatureHash: `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      validatedAt: now
    };

    updateFinding(selectedNC.id, {
      status: 'Closed Verified',
      verifiedBy: `${currentUser.name} (${currentRole})`,
      verifiedDate: now,
      implementationNotes: verificationNotes || selectedNC.implementationNotes || 'Verified effective by internal audit lead.',
      independentAuditValidation: validationRecord
    });

    await dispatchEmailNotification(selectedNC, 'CLOSURE_CONFIRMATION');

    await logAuditEvent(
      'APPROVE',
      'Internal Audit Non-Conformity Closure',
      `Internal auditor ${currentUser.name} verified and closed NC ${selectedNC.findingCode} (${selectedNC.title}). Clause 10.1 / 10.2 formal closure sign-off executed.`,
      {
        findingCode: selectedNC.findingCode,
        verifiedBy: currentUser.name,
        notes: verificationNotes,
        validationId: validationRecord.validationId
      }
    );

    setIsVerifying(false);
    setSelectedNC(prev => prev ? {
      ...prev,
      status: 'Closed Verified',
      verifiedBy: currentUser.name,
      verifiedDate: now,
      independentAuditValidation: validationRecord
    } : null);
    showToast({
      title: 'NC Closed & Verified',
      message: `${selectedNC.findingCode} verified and closed in audit trail with independent audit validation.`,
      type: 'success'
    });
  };

  // Export NC Log to CSV
  const exportNCToCSV = () => {
    const headers = [
      'NC Code',
      'Title',
      'Severity',
      'Standard / Clause',
      'Department',
      'Owner Email',
      'Status',
      'Target Closure Date',
      'Corrective Action',
      'Root Cause',
      'Raised By',
      'Raised Date',
      'Verified By',
      'Verified Date'
    ];

    const rows = filteredNCs.map(n => [
      `"${n.findingCode}"`,
      `"${n.title.replace(/"/g, '""')}"`,
      `"${n.severity}"`,
      `"${n.clauseOrControl}"`,
      `"${n.department}"`,
      `"${n.departmentOwnerEmail || DEPARTMENT_OWNERS[n.department]?.email || ''}"`,
      `"${n.status}"`,
      `"${n.capaPlan?.targetDate || ''}"`,
      `"${(n.capaPlan?.correctiveAction || '').replace(/"/g, '""')}"`,
      `"${(n.rootCauseAnalysis?.rootCauseStatement || '').replace(/"/g, '""')}"`,
      `"${n.raisedBy}"`,
      `"${n.raisedDate}"`,
      `"${n.verifiedBy || ''}"`,
      `"${n.verifiedDate || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ISO_27001_Internal_Audit_NC_Log_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
        theme === 'light'
          ? 'bg-white border-slate-200'
          : 'bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/40 border-slate-800'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              theme === 'light' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-950/80 text-rose-400 border border-rose-800'
            }`}>
              ISO 27001:2022 Clauses 10.1 & 10.2
            </span>
            <span className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Internal Audit Corrective Action Log</span>
          </div>
          <h2 className={`text-xl font-bold flex items-center space-x-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            <span>Non-Conformity (NC) & CAPA Register</span>
            <ShieldAlert className="w-5 h-5 text-rose-500" />
          </h2>
          <p className={`text-xs max-w-2xl ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
            Track non-conformities from initial detection, 5-Whys root cause analysis, corrective action deployment, through to formal auditor closure verification. Features automated email triggers to department owners with mandatory response SLAs.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setShowTrendChart(prev => !prev)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer border ${
              showTrendChart
                ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                : theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-sky-500" />
            <span>{showTrendChart ? 'Hide Trend Line Chart' : '6-Month Trend Chart'}</span>
          </button>

          <button
            type="button"
            onClick={exportNCToCSV}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer border ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-sky-500" />
            <span>Export NC Log CSV</span>
          </button>

          {isAuditor && (
            <button
              type="button"
              onClick={() => setShowRaiseModal(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-lg shadow-rose-950/20"
            >
              <Plus className="w-4 h-4" />
              <span>Raise Non-Conformity</span>
            </button>
          )}
        </div>
      </div>

      {/* Embedded 6-Month Recharts Trend Line Chart */}
      {showTrendChart && (
        <NCTrendAnalyticsChart
          findings={tenantNCs}
          className="border-slate-800/80"
        />
      )}

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className={`p-3.5 rounded-xl border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <div className={`text-[11px] ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Total Findings</div>
          <div className={`text-2xl font-bold font-mono mt-0.5 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{metrics.total}</div>
          <div className={`text-[10px] font-medium mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>All audit cycles</div>
        </div>

        <div className={`p-3.5 rounded-xl border ${theme === 'light' ? 'bg-rose-50 border-rose-200' : 'bg-rose-950/30 border border-rose-800/50'}`}>
          <div className={`text-[11px] flex items-center justify-between ${theme === 'light' ? 'text-rose-800' : 'text-rose-300'}`}>
            <span>Major NCs</span>
            <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5">{metrics.majorCount}</div>
          <div className={`text-[10px] font-medium mt-0.5 ${theme === 'light' ? 'text-rose-700' : 'text-rose-400/80'}`}>5-Day SLA</div>
        </div>

        <div className={`p-3.5 rounded-xl border ${theme === 'light' ? 'bg-amber-50 border-amber-200' : 'bg-amber-950/30 border border-amber-800/50'}`}>
          <div className={`text-[11px] flex items-center justify-between ${theme === 'light' ? 'text-amber-800' : 'text-amber-300'}`}>
            <span>Minor NCs</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">{metrics.minorCount}</div>
          <div className={`text-[10px] font-medium mt-0.5 ${theme === 'light' ? 'text-amber-700' : 'text-amber-400/80'}`}>14-Day SLA</div>
        </div>

        <div className={`p-3.5 rounded-xl border ${theme === 'light' ? 'bg-sky-50 border-sky-200' : 'bg-sky-950/30 border border-sky-800/50'}`}>
          <div className={`text-[11px] ${theme === 'light' ? 'text-sky-800' : 'text-sky-300'}`}>Observations</div>
          <div className="text-2xl font-bold font-mono text-sky-600 dark:text-sky-400 mt-0.5">{metrics.observations}</div>
          <div className={`text-[10px] font-medium mt-0.5 ${theme === 'light' ? 'text-sky-700' : 'text-sky-400/80'}`}>Continuous Improvement</div>
        </div>

        <div className={`p-3.5 rounded-xl border ${theme === 'light' ? 'bg-indigo-50 border-indigo-200' : 'bg-indigo-950/30 border border-indigo-800/50'}`}>
          <div className={`text-[11px] ${theme === 'light' ? 'text-indigo-800' : 'text-indigo-300'}`}>Under CAPA / Pending</div>
          <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">{metrics.submittedCount}</div>
          <div className={`text-[10px] font-medium mt-0.5 ${theme === 'light' ? 'text-indigo-700' : 'text-indigo-400/80'}`}>Awaiting verification</div>
        </div>

        <div className={`p-3.5 rounded-xl border ${theme === 'light' ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-950/30 border border-emerald-800/50'}`}>
          <div className={`text-[11px] flex items-center justify-between ${theme === 'light' ? 'text-emerald-800' : 'text-emerald-300'}`}>
            <span>Closed & Verified</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">{metrics.closedCount}</div>
          <div className={`text-[10px] font-medium mt-0.5 ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-400/80'}`}>{metrics.closureRate}% Closure Rate</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-3 ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search NC code, clause, owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs outline-none focus:ring-1 focus:ring-rose-500 ${
                theme === 'light'
                  ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white'
                  : 'bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-500'
              }`}
            />
          </div>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className={`px-3 py-1.5 rounded-lg border text-xs outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer ${
              theme === 'light'
                ? 'bg-slate-50 border-slate-300 text-slate-800'
                : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}
          >
            <option value="All">All Severities</option>
            <option value="Major Non-Conformity">Major Non-Conformity</option>
            <option value="Minor Non-Conformity">Minor Non-Conformity</option>
            <option value="Observation">Observation</option>
            <option value="Opportunity for Improvement">Opportunity for Improvement</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-3 py-1.5 rounded-lg border text-xs outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer ${
              theme === 'light'
                ? 'bg-slate-50 border-slate-300 text-slate-800'
                : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open (Awaiting CAPA)</option>
            <option value="Root Cause Defined">Root Cause Defined</option>
            <option value="CAPA Submitted">CAPA Submitted</option>
            <option value="Verification Pending">Verification Pending</option>
            <option value="Closed Verified">Closed Verified</option>
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className={`px-3 py-1.5 rounded-lg border text-xs outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer ${
              theme === 'light'
                ? 'bg-slate-50 border-slate-300 text-slate-800'
                : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}
          >
            <option value="All">All Departments</option>
            {Object.keys(DEPARTMENT_OWNERS).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
          Showing <span className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{filteredNCs.length}</span> of {tenantNCs.length} NC records
        </div>
      </div>

      {/* NC Records List */}
      <div className="space-y-3">
        {filteredNCs.length === 0 ? (
          <div className={`p-12 text-center border rounded-2xl space-y-3 ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className={`text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>No Non-Conformities Matching Filters</h3>
            <p className={`text-xs max-w-md mx-auto ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              All tested areas in this selection conform to ISO/IEC 27001 requirements. You can raise a new non-conformity if fieldwork identifies an objective deficiency.
            </p>
            {isAuditor && (
              <button
                type="button"
                onClick={() => setShowRaiseModal(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Log New Non-Conformity</span>
              </button>
            )}
          </div>
        ) : (
          filteredNCs.map(nc => {
            const isClosed = nc.status === 'Closed Verified';
            const isMajor = nc.severity === 'Major Non-Conformity';
            const ownerEmail = nc.departmentOwnerEmail || DEPARTMENT_OWNERS[nc.department]?.email || 'lead@apex-fintech.internal';

            return (
              <div
                key={nc.id}
                className={`p-5 rounded-2xl border transition-all ${
                  theme === 'light'
                    ? isClosed
                      ? 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      : isMajor
                      ? 'bg-rose-50/40 border-rose-200 hover:border-rose-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-sky-400 shadow-xs'
                    : isClosed
                    ? 'bg-slate-900 border-slate-800/80 hover:border-slate-700'
                    : isMajor
                    ? 'border-rose-900/60 bg-rose-950/10 hover:border-rose-500/50'
                    : 'bg-slate-900 border-slate-800 hover:border-sky-500/40'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Main Information */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`font-mono text-xs font-black px-2.5 py-0.5 rounded-lg border ${
                        theme === 'light' ? 'bg-slate-100 text-slate-800 border-slate-300' : 'bg-slate-950 text-white border border-slate-800'
                      }`}>
                        {nc.findingCode}
                      </span>

                      {/* Severity Pill */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 border ${
                        isMajor
                          ? theme === 'light'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-rose-950 text-rose-300 border-rose-800'
                          : nc.severity === 'Minor Non-Conformity'
                          ? theme === 'light'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-amber-950 text-amber-300 border-amber-800'
                          : theme === 'light'
                          ? 'bg-sky-50 text-sky-800 border-sky-300'
                          : 'bg-sky-950 text-sky-300 border-sky-800'
                      }`}>
                        {isMajor ? <AlertOctagon className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        <span>{nc.severity}</span>
                      </span>

                      {/* Clause Reference */}
                      <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${
                        theme === 'light' ? 'text-sky-700 bg-sky-50 border-sky-200' : 'text-sky-400 bg-sky-950/60 border-sky-800/60'
                      }`}>
                        {nc.clauseOrControl}
                      </span>

                      {/* Automated Email Status Badge */}
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center space-x-1 border ${
                        nc.emailNotificationStatus === 'DISPATCHED' || nc.lastEmailDispatchedAt
                          ? theme === 'light'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                          : theme === 'light'
                          ? 'bg-slate-100 text-slate-600 border-slate-200'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        <Mail className="w-2.5 h-2.5" />
                        <span>
                          {nc.emailNotificationStatus === 'DISPATCHED' || nc.lastEmailDispatchedAt
                            ? 'Email Alert Dispatched'
                            : 'Alert Pending'}
                        </span>
                      </span>
                    </div>

                    <h3 className={`text-sm font-bold cursor-pointer transition-colors ${
                      theme === 'light' ? 'text-slate-900 hover:text-indigo-600' : 'text-white hover:text-sky-300'
                    }`} onClick={() => setSelectedNC(nc)}>
                      {nc.title}
                    </h3>

                    <p className={`text-xs leading-relaxed line-clamp-2 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                      {nc.description}
                    </p>

                    {/* Department & Owner Details */}
                    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                      <div className="flex items-center space-x-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>Dept: <strong className={theme === 'light' ? 'text-slate-900' : 'text-slate-200'}>{nc.department}</strong></span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">Owner: <strong className={theme === 'light' ? 'text-slate-900' : 'text-slate-200'}>{nc.capaPlan?.owner}</strong></span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>Target Closure: <strong className={theme === 'light' ? 'text-sky-700' : 'text-sky-300'}>{nc.capaPlan?.targetDate || 'TBD'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions Column */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between gap-3 shrink-0">
                    {/* Status badge */}
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${
                        isClosed
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : nc.status === 'Verification Pending'
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                          : nc.status === 'CAPA Submitted'
                          ? 'bg-sky-950 text-sky-300 border border-sky-800'
                          : nc.status === 'Root Cause Defined'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {isClosed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        <span>{nc.status}</span>
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 justify-end">
                      {/* Interactive CAPA Workflow Button */}
                      <button
                        type="button"
                        onClick={() => setWorkflowModalFinding(nc)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800 text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                        title="Open Interactive 5-Whys CAPA Workflow"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>CAPA Workflow</span>
                      </button>

                      {/* Email Notification Trigger Button */}
                      <button
                        type="button"
                        onClick={() => setEmailModalNC(nc)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium flex items-center space-x-1 transition-colors cursor-pointer"
                        title="View and trigger automatic email alert to department owner"
                      >
                        <Mail className="w-3.5 h-3.5 text-amber-400" />
                        <span>Email Alert</span>
                      </button>

                      {/* Inspection / Closure Modal Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedNC(nc)}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      {/* Certificate Button if Closed */}
                      {isClosed && (
                        <button
                          type="button"
                          onClick={() => setCertificateFinding(nc)}
                          className="px-2 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                          title="View Formal Verification Certificate"
                        >
                          <Award className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Root Cause & Corrective Action Quick Summary snippet if present */}
                {nc.capaPlan?.correctiveAction && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                    <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                      <span className="text-slate-400 block font-semibold">Root Cause Statement:</span>
                      <p className="text-slate-300 line-clamp-1 mt-0.5">
                        {nc.rootCauseAnalysis?.rootCauseStatement || 'Pending investigation.'}
                      </p>
                    </div>
                    <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                      <span className="text-sky-400 block font-semibold">Corrective Action Plan:</span>
                      <p className="text-slate-300 line-clamp-1 mt-0.5">
                        {nc.capaPlan?.correctiveAction}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: RAISE NEW NON-CONFORMITY */}
      {showRaiseModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 px-2 py-0.5 rounded bg-rose-950 border border-rose-800">
                  ISO 27001 Internal Audit Finding
                </span>
                <h3 className="text-lg font-bold text-white mt-1">Raise Formal Non-Conformity (NC)</h3>
              </div>
              <button
                onClick={() => setShowRaiseModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNC} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Non-Conformity Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inadequate Multi-Factor Authentication on Production Jump Hosts"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    ISO 27001 Clause / Annex A Control <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={newClause}
                    onChange={(e) => setNewClause(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value="A.5.1 Policies for information security">A.5.1 Policies for information security</option>
                    <option value="A.5.15 Access control">A.5.15 Access control</option>
                    <option value="A.5.19 Information security in supplier relationships">A.5.19 Supplier relationships</option>
                    <option value="A.5.23 Information security for cloud services">A.5.23 Cloud services security</option>
                    <option value="A.6.3 Information security awareness, education & training">A.6.3 Security awareness & training</option>
                    <option value="A.7.2 Physical entry">A.7.2 Physical entry controls</option>
                    <option value="A.8.1 User endpoint devices">A.8.1 User endpoint devices</option>
                    <option value="A.8.2 Privileged access rights">A.8.2 Privileged access rights</option>
                    <option value="A.8.8 Management of technical vulnerabilities">A.8.8 Technical vulnerability management</option>
                    <option value="A.8.12 Data leakage prevention">A.8.12 Data leakage prevention</option>
                    <option value="A.8.24 Use of cryptography">A.8.24 Use of cryptography</option>
                    <option value="A.8.28 Secure coding">A.8.28 Secure coding</option>
                    <option value="Clause 6.1 Actions to address risks and opportunities">Clause 6.1 Risk planning</option>
                    <option value="Clause 9.2 Internal audit">Clause 9.2 Internal audit program</option>
                    <option value="Clause 10.1 Nonconformity and corrective action">Clause 10.1 Continual improvement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Severity Level <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e) => handleSeverityChange(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value="Major Non-Conformity">Major Non-Conformity (5-Day Response SLA)</option>
                    <option value="Minor Non-Conformity">Minor Non-Conformity (14-Day Response SLA)</option>
                    <option value="Observation">Observation (30-Day Response SLA)</option>
                    <option value="Opportunity for Improvement">Opportunity for Improvement</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Responsible Department <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={newDepartment}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    {Object.keys(DEPARTMENT_OWNERS).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Department Owner Email (Automated Recipient)
                  </label>
                  <input
                    type="email"
                    required
                    value={newOwnerEmail}
                    onChange={(e) => setNewOwnerEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Audit Observation & Factual Deficiency Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail the sampling evidence, sample size, affected servers/systems, and specific requirement that was not met..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Preliminary Root Cause Analysis
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Underlying breakdown in process, tooling, or human factor..."
                    value={newRootCause}
                    onChange={(e) => setNewRootCause(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Proposed Corrective Action (CAPA)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Specific remediation steps required to eliminate recurrence..."
                    value={newCorrectiveAction}
                    onChange={(e) => setNewCorrectiveAction(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Automatic Email Trigger Option */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-white font-semibold block">Automatic Email Notification</span>
                    <span className="text-[11px] text-slate-400">
                      Dispatches instant alert to <strong className="text-slate-300">{newOwnerEmail}</strong> with audit reference & SLA deadline.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoSendEmail}
                  onChange={(e) => setAutoSendEmail(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded bg-slate-900 border-slate-700 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRaiseModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-950/50 flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Log NC & Dispatch Workflow</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: INSPECTION & CORRECTIVE ACTION CLOSURE WORKFLOW */}
      {selectedNC && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-sky-400">{selectedNC.findingCode}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {selectedNC.severity}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{selectedNC.clauseOrControl}</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">{selectedNC.title}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedNC;
                    setSelectedNC(null);
                    setWorkflowModalFinding(target);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Open 5-Whys CAPA Workflow</span>
                </button>

                {selectedNC.status === 'Closed Verified' && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedNC;
                      setCertificateFinding(target);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Certificate</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedNC(null)}
                  className="text-slate-400 hover:text-white text-sm font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Lifecycle Stepper Bar */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Corrective Action Lifecycle (ISO 27001 Clause 10.1)
              </span>
              <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-semibold">
                {[
                  { step: 'Open', label: '1. Open' },
                  { step: 'Root Cause Defined', label: '2. Root Cause' },
                  { step: 'CAPA Submitted', label: '3. CAPA Plan' },
                  { step: 'Verification Pending', label: '4. Testing' },
                  { step: 'Closed Verified', label: '5. Closed & Verified' }
                ].map((st, idx) => {
                  const isCurrent = selectedNC.status === st.step;
                  const isPast =
                    (st.step === 'Open') ||
                    (st.step === 'Root Cause Defined' && selectedNC.status !== 'Open') ||
                    (st.step === 'CAPA Submitted' && (selectedNC.status === 'CAPA Submitted' || selectedNC.status === 'Verification Pending' || selectedNC.status === 'Closed Verified')) ||
                    (st.step === 'Verification Pending' && (selectedNC.status === 'Verification Pending' || selectedNC.status === 'Closed Verified')) ||
                    (st.step === 'Closed Verified' && selectedNC.status === 'Closed Verified');

                  return (
                    <div
                      key={st.step}
                      className={`p-2 rounded-lg border transition-all ${
                        isCurrent
                          ? 'bg-sky-600 text-white border-sky-500 font-bold shadow-sm'
                          : isPast
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      {st.label}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Finding Overview */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold block">Audit Finding Description:</span>
                <p className="text-slate-200 leading-relaxed">{selectedNC.description}</p>
              </div>

              {/* 5-Whys Root Cause Analysis */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold flex items-center space-x-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Root Cause Analysis (5-Whys Methodology)</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Method: {selectedNC.rootCauseAnalysis?.methodology || '5_WHYS'}</span>
                </div>

                {selectedNC.rootCauseAnalysis?.whys && selectedNC.rootCauseAnalysis.whys.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    {selectedNC.rootCauseAnalysis.whys.map((why, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-900 text-slate-300 font-mono text-[11px] border border-slate-800/80">
                        {why}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">Root cause analysis underway by department team.</p>
                )}

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-amber-300 font-semibold">Root Cause Statement: </span>
                  <span className="text-slate-200 text-xs">
                    {selectedNC.rootCauseAnalysis?.rootCauseStatement || 'Pending investigation.'}
                  </span>
                </div>
              </div>

              {/* CAPA Plan */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <span className="text-slate-300 font-bold flex items-center space-x-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Corrective & Preventive Action Plan (CAPA)</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-sky-400 font-semibold block text-[11px]">Corrective Action (Immediate):</span>
                    <p className="text-slate-200 mt-1">{selectedNC.capaPlan?.correctiveAction}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-emerald-400 font-semibold block text-[11px]">Preventive Action (Systemic):</span>
                    <p className="text-slate-200 mt-1">{selectedNC.capaPlan?.preventiveAction || 'Automation checks added to CI/CD pipeline.'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  <span>Assigned Owner: <strong className="text-white">{selectedNC.capaPlan?.owner}</strong></span>
                  <span>Target Date: <strong className="text-sky-300">{selectedNC.capaPlan?.targetDate}</strong></span>
                  <span>Required Evidence: <strong className="text-slate-300">{selectedNC.capaPlan?.evidenceRequired}</strong></span>
                </div>
              </div>

              {/* Auditor Verification & Formal Closure Sign-off Section */}
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-300 font-bold flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Auditor Independent Closure Sign-off (Clause 10.2)</span>
                  </span>
                  {selectedNC.status === 'Closed Verified' && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                      VERIFIED & CLOSED
                    </span>
                  )}
                </div>

                {selectedNC.status === 'Closed Verified' ? (
                  <div className="space-y-2 text-[11px] bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <div>
                      Verified by: <strong className="text-white">{selectedNC.verifiedBy || 'Internal Lead Auditor'}</strong>
                    </div>
                    <div>
                      Verification Timestamp: <strong className="text-emerald-400">{selectedNC.verifiedDate ? new Date(selectedNC.verifiedDate).toLocaleString() : 'Recently'}</strong>
                    </div>
                    <div>
                      Verification Working Notes: <span className="text-slate-300">{selectedNC.implementationNotes || 'Sample testing conducted on production artifacts. Finding eliminated.'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-slate-400 text-[11px]">
                      Independent auditor must review uploaded evidence artifacts to verify that corrective actions have eliminated the identified root cause prior to closing this non-conformity.
                    </p>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Auditor Closure Verification Working Notes
                      </label>
                      <textarea
                        rows={2}
                        value={verificationNotes}
                        onChange={(e) => setVerificationNotes(e.target.value)}
                        placeholder="Detail sample evidence re-tested, hash of artifact, and confirmation of root cause elimination..."
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                      {/* Step progression buttons */}
                      <div className="flex items-center space-x-2">
                        {selectedNC.status === 'Open' && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceStatus(selectedNC, 'Root Cause Defined')}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
                          >
                            Mark Root Cause Defined
                          </button>
                        )}
                        {selectedNC.status === 'Root Cause Defined' && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceStatus(selectedNC, 'CAPA Submitted')}
                            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
                          >
                            Mark CAPA Submitted
                          </button>
                        )}
                        {selectedNC.status === 'CAPA Submitted' && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceStatus(selectedNC, 'Verification Pending')}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                          >
                            Submit for Auditor Verification
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleVerifyAndClose}
                        disabled={isVerifying}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-lg shadow-emerald-950/50"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Sign-off & Formally Close NC</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setEmailModalNC(selectedNC);
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition"
              >
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Trigger Department Owner Email Alert</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedNC(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: AUTOMATIC EMAIL DISPATCHER PREVIEW & TRIGGER */}
      {emailModalNC && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Automated Department Owner Email Dispatcher</h3>
                  <p className="text-xs text-slate-400">Automatic SMTP Trigger & Audit Trail Dispatch</p>
                </div>
              </div>
              <button
                onClick={() => setEmailModalNC(null)}
                className="text-slate-400 hover:text-white text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Email Envelope Preview */}
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono">
                <div className="text-slate-400">
                  <span className="text-slate-500">From: </span>
                  <span className="text-sky-400">ISMS Internal Audit &lt;audit-system@apex-fintech.internal&gt;</span>
                </div>
                <div className="text-slate-400">
                  <span className="text-slate-500">To: </span>
                  <span className="text-white font-bold">{emailModalNC.departmentOwnerEmail || DEPARTMENT_OWNERS[emailModalNC.department]?.email || 'lead@apex-fintech.internal'}</span>
                  <span className="text-slate-500 ml-2">({emailModalNC.department})</span>
                </div>
                <div className="text-slate-400">
                  <span className="text-slate-500">CC: </span>
                  <span className="text-slate-300">ciso@apex-fintech.internal, internal-audit-lead@apex-fintech.internal</span>
                </div>
                <div className="text-slate-400 pt-1 border-t border-slate-800">
                  <span className="text-slate-500">Subject: </span>
                  <span className="text-amber-400 font-bold">
                    [ACTION REQUIRED] ISO 27001 Non-Conformity: {emailModalNC.findingCode} ({emailModalNC.severity})
                  </span>
                </div>
              </div>

              {/* Email Content Body Preview */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3 font-sans text-slate-300 leading-relaxed text-xs">
                <p>
                  Dear <strong className="text-white">{emailModalNC.capaPlan?.owner || 'Department Lead'}</strong>,
                </p>
                <p>
                  This is an automated regulatory notification from the ISMS Internal Audit System. During the current internal audit cycle, a formal Non-Conformity has been logged against your department scope under ISO/IEC 27001:2022.
                </p>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-[11px] font-mono">
                  <div><strong>Finding ID:</strong> {emailModalNC.findingCode}</div>
                  <div><strong>Standard Requirement:</strong> {emailModalNC.clauseOrControl}</div>
                  <div><strong>Severity Rating:</strong> <span className="text-rose-400 font-bold">{emailModalNC.severity}</span></div>
                  <div><strong>Mandatory Response SLA:</strong> <span className="text-amber-400 font-bold">{emailModalNC.capaPlan?.targetDate}</span></div>
                </div>
                <p className="text-[11px]">
                  <strong>Required Action:</strong> You are required to access the GRC Workbench, conduct root-cause investigation using the 5-Whys methodology, and submit corrective action evidence prior to the SLA target deadline.
                </p>
              </div>

              {/* Previous Dispatch Logs */}
              {emailModalNC.notificationLog && emailModalNC.notificationLog.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Dispatch History ({emailModalNC.notificationLog.length})
                  </span>
                  <div className="max-h-28 overflow-y-auto space-y-1">
                    {emailModalNC.notificationLog.map(log => (
                      <div key={log.id} className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-300">{log.recipient} ({log.type})</span>
                        <span className="text-emerald-400 font-bold">{log.deliveryStatus}</span>
                        <span className="text-slate-500">{new Date(log.sentAt).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEmailModalNC(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsSendingEmail(true);
                  await dispatchEmailNotification(emailModalNC, 'STATUS_UPDATE');
                  setIsSendingEmail(false);
                  setEmailModalNC(null);
                }}
                disabled={isSendingEmail}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingEmail ? 'Dispatching...' : 'Dispatch Automated Email Alert'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL 3: DEDICATED 5-STAGE CAPA WORKFLOW MODAL */}
      {workflowModalFinding && (
        <CapaWorkflowModal
          finding={workflowModalFinding}
          onClose={() => setWorkflowModalFinding(null)}
        />
      )}

      {/* MODAL 4: FORMAL VERIFICATION CERTIFICATE MODAL */}
      {certificateFinding && (
        <CapaAuditCertificateModal
          finding={certificateFinding}
          companyName={currentTenant?.name || 'Skanda Enterprise'}
          onClose={() => setCertificateFinding(null)}
        />
      )}
    </div>
  );
};
