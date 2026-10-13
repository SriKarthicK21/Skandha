import React, { useState, useMemo } from 'react';
import { safeConfirm } from '../../utils/safeConfirm';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Filter,
  Plus,
  ArrowRight,
  ExternalLink,
  Target,
  Sparkles,
  Layers,
  Search,
  SlidersHorizontal,
  RefreshCw,
  FileCheck2,
  FileText,
  UserCheck,
  AlertCircle,
  Building2,
  CalendarCheck,
  Flag,
  ArrowUpRight,
  BarChart3,
  X,
  Edit3,
  Check
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { FrameworkDomain } from '../../types/regulatoryTypes';

export interface MASRemediationTask {
  id: string;
  domainNumber: string;
  domainName: string;
  title: string;
  description: string;
  linkedRequirementCode: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'PLANNED' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED';
  owner: string;
  department: string;
  startDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  auditPhase: 1 | 2 | 3 | 4; // 1: Gap Closure, 2: Technical Controls, 3: Mock Audit & Tabletop, 4: Board & Submission
  evidenceRequired: string;
  progressPercentage: number;
}

// Initial realistic remediation tasks mapped to MAS TRM 14 Domains
const INITIAL_MAS_REMEDIATION_TASKS: MASRemediationTask[] = [
  // 3.0 Technology Risk Governance
  {
    id: 'MAS-TSK-01',
    domainNumber: '3.0',
    domainName: 'Technology Risk Governance',
    title: 'Board Technology Risk Committee Charter & Quarterly Reporting Overhaul',
    description: 'Establish standardized Board TRC reporting pack with cyber resilience metrics, RTO/RPO dashboard, and systemic risk posture.',
    linkedRequirementCode: 'MAS-TRM-3.1',
    priority: 'HIGH',
    status: 'COMPLETED',
    owner: 'Arjun Mehta (CISO)',
    department: 'Risk & Compliance',
    startDate: '2026-01-15',
    dueDate: '2026-03-31',
    auditPhase: 1,
    evidenceRequired: 'Approved TRC Charter, Q1 Board Minutes with TRM Signoff',
    progressPercentage: 100
  },
  // 4.0 Technology Risk Management Framework
  {
    id: 'MAS-TSK-02',
    domainNumber: '4.0',
    domainName: 'Technology Risk Management Framework',
    title: 'Enterprise Technology Risk Appetite Statement Calibration',
    description: 'Define quantitative cyber loss thresholds, critical system availability risk appetite, and integrate into enterprise risk register.',
    linkedRequirementCode: 'MAS-TRM-4.1',
    priority: 'HIGH',
    status: 'COMPLETED',
    owner: 'Marcus Tan (CRO)',
    department: 'Enterprise Risk',
    startDate: '2026-02-01',
    dueDate: '2026-04-15',
    auditPhase: 1,
    evidenceRequired: 'Formal Technology Risk Appetite Statement (TRAS) approved by Board',
    progressPercentage: 100
  },
  // 5.0 IT Project Management & Acquisition
  {
    id: 'MAS-TSK-03',
    domainNumber: '5.0',
    domainName: 'IT Project Management & Acquisition',
    title: 'Security Quality Gate Integration into Software Procurement Lifecycle',
    description: 'Enforce pre-purchase architecture review, threat modeling, and third-party security assurance for software acquisitions.',
    linkedRequirementCode: 'MAS-TRM-5.1',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    owner: 'Elena Rostova (CTO)',
    department: 'IT Operations',
    startDate: '2026-03-01',
    dueDate: '2026-07-31',
    auditPhase: 2,
    evidenceRequired: 'Vendor Architecture Security Review Checklist & Jira Quality Gate Rules',
    progressPercentage: 75
  },
  // 6.0 Software Development Life Cycle (SDLC)
  {
    id: 'MAS-TSK-04',
    domainNumber: '6.0',
    domainName: 'Software Development Life Cycle (SDLC)',
    title: 'Automated DevSecOps Pipeline: SAST/DAST & SCA Blocking Gates',
    description: 'Configure automated pull request blocking for OWASP Top 10 vulnerabilities and critical supply chain open-source CVEs.',
    linkedRequirementCode: 'MAS-TRM-6.1',
    priority: 'CRITICAL',
    status: 'COMPLETED',
    owner: 'Elena Rostova (CTO)',
    department: 'Engineering',
    startDate: '2026-02-15',
    dueDate: '2026-05-15',
    auditPhase: 2,
    evidenceRequired: 'CI/CD Pipeline YAML configs and SonarQube / Snyk zero-critical-CVE reports',
    progressPercentage: 100
  },
  // 7.0 IT Service Management & Change Control
  {
    id: 'MAS-TSK-05',
    domainNumber: '7.0',
    domainName: 'IT Service Management & Change Control',
    title: 'Emergency Change Advisory Board (ECAB) Dual-Authorization Workflow',
    description: 'Implement automated break-glass approval requiring both Lead Engineer and Information Security Officer signoff for hotfixes.',
    linkedRequirementCode: 'MAS-TRM-7.1',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    owner: 'David Koh (VP Engineering)',
    department: 'IT Operations',
    startDate: '2026-04-01',
    dueDate: '2026-08-15',
    auditPhase: 2,
    evidenceRequired: 'ServiceNow/Jira Service Management ECAB Dual-Approval Audit Trails',
    progressPercentage: 80
  },
  // 8.0 Cyber Security Operations & Threat Intelligence
  {
    id: 'MAS-TSK-06',
    domainNumber: '8.0',
    domainName: 'Cyber Security Operations & Threat Intelligence',
    title: 'FS-ISAC Threat Intelligence Feeds Integration & 24/7 SOC Triage SLA',
    description: 'Operationalize real-time financial services threat intelligence feeds into SIEM/SOAR with automated alert enrichment.',
    linkedRequirementCode: 'MAS-TRM-8.1',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    owner: 'Arjun Mehta (CISO)',
    department: 'Security Operations',
    startDate: '2026-04-15',
    dueDate: '2026-08-31',
    auditPhase: 2,
    evidenceRequired: 'FS-ISAC ingestion configuration and 15-minute mean-time-to-acknowledge report',
    progressPercentage: 65
  },
  // 9.0 Data Security & Cryptography
  {
    id: 'MAS-TSK-07',
    domainNumber: '9.0',
    domainName: 'Data Security & Cryptography',
    title: 'Quantum-Resistant Cryptography Migration Plan & HSM Key Custody',
    description: 'Formulate NIST PQC roadmap per MAS Notice 655 and mandate dual-custody ceremony logs for Hardware Security Module master keys.',
    linkedRequirementCode: 'MAS-TRM-9.1',
    priority: 'CRITICAL',
    status: 'UNDER_REVIEW',
    owner: 'Dr. Sarah Lin (Lead Cryptographer)',
    department: 'Cybersecurity',
    startDate: '2026-05-01',
    dueDate: '2026-09-15',
    auditPhase: 2,
    evidenceRequired: 'Cryptographic Inventory, PQC Roadmap Document, HSM Key Custody Attestation',
    progressPercentage: 90
  },
  // 10.0 Access Control & Identity Management
  {
    id: 'MAS-TSK-08',
    domainNumber: '10.0',
    domainName: 'Access Control & Identity Management',
    title: 'FIDO2 Passwordless MFA & Privileged Access Management (PAM) Session Recording',
    description: 'Enforce hardware security key (FIDO2) authentication across all cloud consoles and 100% session recording for root/admin jumps.',
    linkedRequirementCode: 'MAS-TRM-10.1',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    owner: 'Arjun Mehta (CISO)',
    department: 'Cybersecurity',
    startDate: '2026-05-15',
    dueDate: '2026-09-30',
    auditPhase: 2,
    evidenceRequired: 'CyberArk/Teleport session replay telemetry and Okta MFA enforcement reports',
    progressPercentage: 70
  },
  // 11.0 Infrastructure, Endpoint & Network Security
  {
    id: 'MAS-TSK-09',
    domainNumber: '11.0',
    domainName: 'Infrastructure, Endpoint & Network Security',
    title: '100% EDR Fleet Coverage with Automated Isolation Guardrails',
    description: 'Verify Endpoint Detection & Response agent deployment on all virtual servers, containers, and staff laptops with tamper protection.',
    linkedRequirementCode: 'MAS-TRM-11.1',
    priority: 'HIGH',
    status: 'COMPLETED',
    owner: 'Kelvin Ng (SecOps Lead)',
    department: 'Cybersecurity',
    startDate: '2026-03-01',
    dueDate: '2026-06-30',
    auditPhase: 2,
    evidenceRequired: 'CrowdStrike / SentinelOne deployment dashboard attesting 100% asset coverage',
    progressPercentage: 100
  },
  // 12.0 Cloud & Virtualization Risk
  {
    id: 'MAS-TSK-10',
    domainNumber: '12.0',
    domainName: 'Cloud & Virtualization Risk',
    title: 'Multi-Cloud Infrastructure-as-Code (IaC) Drift Detection & Guardrails',
    description: 'Deploy automated Terraform policy-as-code guardrails (Checkov/Trivy) to prevent misconfigurations and unencrypted S3/Cloud Storage.',
    linkedRequirementCode: 'MAS-TRM-12.1',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    owner: 'Elena Rostova (CTO)',
    department: 'Cloud Infrastructure',
    startDate: '2026-05-01',
    dueDate: '2026-08-31',
    auditPhase: 2,
    evidenceRequired: 'IaC Security Baseline scanning logs and Cloud Custodian policies',
    progressPercentage: 60
  },
  // 13.0 Third-Party & Outsourcing Technology Risk
  {
    id: 'MAS-TSK-11',
    domainNumber: '13.0',
    domainName: 'Third-Party & Outsourcing Technology Risk',
    title: 'Material Outsourcing Registry & Fourth-Party Supply Chain Concentration Review',
    description: 'Update MAS Outsourcing Register with right-to-audit verification, exit strategies, and continuous supply chain vulnerability monitoring.',
    linkedRequirementCode: 'MAS-TRM-13.1',
    priority: 'CRITICAL',
    status: 'PLANNED',
    owner: 'Marcus Tan (CRO)',
    department: 'Risk & Procurement',
    startDate: '2026-06-15',
    dueDate: '2026-10-15',
    auditPhase: 3,
    evidenceRequired: 'Updated MAS Material Outsourcing Register & SOC 2 Type II reports from all vendors',
    progressPercentage: 30
  },
  // 14.0 Incident Management & Breach Notification
  {
    id: 'MAS-TSK-12',
    domainNumber: '14.0',
    domainName: 'Incident Management & Breach Notification',
    title: '1-Hour Statutory MAS Notification Drill Automation & Template Verification',
    description: 'Pre-configure automated incident escalation workflow to dispatch statutory template notifications to MAS within 60 minutes.',
    linkedRequirementCode: 'MAS-TRM-14.1',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    owner: 'Arjun Mehta (CISO)',
    department: 'Incident Response',
    startDate: '2026-06-01',
    dueDate: '2026-09-15',
    auditPhase: 3,
    evidenceRequired: 'Tabletop simulation execution log showing notification dispatch in 18 minutes',
    progressPercentage: 85
  },
  // 15.0 Business Continuity & Operational Resilience
  {
    id: 'MAS-TSK-13',
    domainNumber: '15.0',
    domainName: 'Business Continuity & Operational Resilience',
    title: 'Unannounced Core Settlement Engine Disaster Recovery Failover Drill',
    description: 'Execute live failover drill testing statutory RTO <= 4 hours and RPO <= 1 hour targets without customer transaction corruption.',
    linkedRequirementCode: 'MAS-TRM-15.1',
    priority: 'CRITICAL',
    status: 'PLANNED',
    owner: 'David Koh (VP Engineering)',
    department: 'IT Operations',
    startDate: '2026-07-01',
    dueDate: '2026-10-01',
    auditPhase: 3,
    evidenceRequired: 'DR Drill Test Report with verified RTO of 2.0h and zero data discrepancy',
    progressPercentage: 40
  },
  // 16.0 Logging, Audit Trail & Security Monitoring
  {
    id: 'MAS-TSK-14',
    domainNumber: '16.0',
    domainName: 'Logging, Audit Trail & Security Monitoring',
    title: 'Immutable WORM Log Storage & 1-Year Retention Verification',
    description: 'Enable Write-Once-Read-Many (WORM) cloud object lock on audit trails with AWS/GCP compliance mode and NTP clock sync audits.',
    linkedRequirementCode: 'MAS-TRM-16.1',
    priority: 'HIGH',
    status: 'COMPLETED',
    owner: 'Kelvin Ng (SecOps Lead)',
    department: 'Security Operations',
    startDate: '2026-03-15',
    dueDate: '2026-06-15',
    auditPhase: 2,
    evidenceRequired: 'S3 Object Lock Legal Hold Configuration & NTP Stratum-1 Sync Audit Log',
    progressPercentage: 100
  },
  // 17.0 Technology Audit, Independent Review & Assurance
  {
    id: 'MAS-TSK-15',
    domainNumber: '17.0',
    domainName: 'Technology Audit & Assurance',
    title: 'Pre-Audit Independent Red Team Adversarial Simulation (AASE/CBEST)',
    description: 'Commission CREST-certified independent penetration testing firm to conduct adversarial red teaming across critical payment APIs.',
    linkedRequirementCode: 'MAS-TRM-17.1',
    priority: 'HIGH',
    status: 'PLANNED',
    owner: 'Arjun Mehta (CISO)',
    department: 'Internal Audit',
    startDate: '2026-08-01',
    dueDate: '2026-10-31',
    auditPhase: 3,
    evidenceRequired: 'CREST Red Team Executive Summary Report and Remediation Attestation',
    progressPercentage: 15
  }
];

// Months for the timeline horizon (2026)
const TIMELINE_MONTHS = [
  { key: '2026-01', label: 'Jan', q: 'Q1' },
  { key: '2026-02', label: 'Feb', q: 'Q1' },
  { key: '2026-03', label: 'Mar', q: 'Q1' },
  { key: '2026-04', label: 'Apr', q: 'Q2' },
  { key: '2026-05', label: 'May', q: 'Q2' },
  { key: '2026-06', label: 'Jun', q: 'Q2' },
  { key: '2026-07', label: 'Jul', q: 'Q3' },
  { key: '2026-08', label: 'Aug', q: 'Q3' },
  { key: '2026-09', label: 'Sep', q: 'Q3' },
  { key: '2026-10', label: 'Oct', q: 'Q4' },
  { key: '2026-11', label: 'Nov', q: 'Q4' },
  { key: '2026-12', label: 'Dec', q: 'Q4' }
];

export const MASTRMComplianceRoadmap: React.FC = () => {
  const {
    masDomains,
    masProfile,
    updateMASProfile,
    setActiveModule
  } = useGRC();

  // Local state for remediation tasks (persisted in localStorage)
  const [tasks, setTasks] = useState<MASRemediationTask[]>(() => {
    try {
      const saved = localStorage.getItem('mas_compliance_roadmap_tasks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_MAS_REMEDIATION_TASKS;
  });

  // Save to localStorage when tasks change
  const saveTasks = (newTasks: MASRemediationTask[]) => {
    setTasks(newTasks);
    try {
      localStorage.setItem('mas_compliance_roadmap_tasks', JSON.stringify(newTasks));
    } catch {
      // ignore
    }
  };

  // View state: 'timeline' (Gantt-style Roadmap) vs 'grid' (Domain Cards) vs 'tasks' (Prioritized Action Ledger)
  const [viewMode, setViewMode] = useState<'timeline' | 'grid' | 'tasks'>('timeline');

  // Filters
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Domain accordion expansion for timeline view
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({
    '3.0': true,
    '6.0': true,
    '8.0': true,
    '9.0': true,
    '10.0': true,
    '14.0': true,
    '15.0': true
  });

  // Modal for New Remediation Task
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskDomain, setNewTaskDomain] = useState('3.0');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('HIGH');
  const [newTaskOwner, setNewTaskOwner] = useState('Arjun Mehta (CISO)');
  const [newTaskDept, setNewTaskDept] = useState('Risk & Compliance');
  const [newTaskStart, setNewTaskStart] = useState('2026-06-01');
  const [newTaskDue, setNewTaskDue] = useState('2026-09-30');
  const [newTaskPhase, setNewTaskPhase] = useState<1 | 2 | 3 | 4>(2);
  const [newTaskControl, setNewTaskControl] = useState('MAS-TRM-3.1');
  const [newTaskEvidence, setNewTaskEvidence] = useState('');

  // Date edit modal for Audit Date
  const [showEditAuditDate, setShowEditAuditDate] = useState(false);
  const targetAuditDate = masProfile.nextScheduledTRMAuditDate || '2026-11-15';
  const [editAuditDateValue, setEditAuditDateValue] = useState(targetAuditDate);

  // Calculate days remaining to next audit
  const daysToAudit = useMemo(() => {
    const today = new Date();
    const auditDate = new Date(targetAuditDate);
    const diffTime = auditDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [targetAuditDate]);

  // Overall Roadmap Progress Metrics
  const metrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const underReview = tasks.filter(t => t.status === 'UNDER_REVIEW').length;
    const planned = tasks.filter(t => t.status === 'PLANNED').length;
    const criticalTasks = tasks.filter(t => t.priority === 'CRITICAL');
    const criticalCompleted = criticalTasks.filter(t => t.status === 'COMPLETED').length;

    const weightedProgress = Math.round(
      tasks.reduce((sum, t) => sum + t.progressPercentage, 0) / (total || 1)
    );

    return {
      total,
      completed,
      inProgress,
      underReview,
      planned,
      weightedProgress,
      criticalTotal: criticalTasks.length,
      criticalCompleted
    };
  }, [tasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (selectedDomain !== 'ALL' && task.domainNumber !== selectedDomain) return false;
      if (selectedStatus !== 'ALL' && task.status !== selectedStatus) return false;
      if (selectedPriority !== 'ALL' && task.priority !== selectedPriority) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          task.title.toLowerCase().includes(q) ||
          task.description.toLowerCase().includes(q) ||
          task.domainName.toLowerCase().includes(q) ||
          task.linkedRequirementCode.toLowerCase().includes(q) ||
          task.owner.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [tasks, selectedDomain, selectedStatus, selectedPriority, searchQuery]);

  // Group tasks by domain for Roadmap views
  const domainGroups = useMemo(() => {
    const map = new Map<string, { domain: FrameworkDomain | undefined; tasks: MASRemediationTask[] }>();
    
    // Ensure all 14-15 domains exist in order
    masDomains.forEach(dom => {
      map.set(dom.domainNumber, { domain: dom, tasks: [] });
    });

    // Populate tasks
    tasks.forEach(task => {
      const existing = map.get(task.domainNumber);
      if (existing) {
        existing.tasks.push(task);
      } else {
        map.set(task.domainNumber, {
          domain: masDomains.find(d => d.domainNumber === task.domainNumber),
          tasks: [task]
        });
      }
    });

    return Array.from(map.entries()).map(([domainNumber, data]) => ({
      domainNumber,
      domain: data.domain,
      tasks: data.tasks,
      completedCount: data.tasks.filter(t => t.status === 'COMPLETED').length,
      progress: data.tasks.length > 0
        ? Math.round(data.tasks.reduce((acc, t) => acc + t.progressPercentage, 0) / data.tasks.length)
        : 80 // baseline default if no open remediation tasks
    }));
  }, [tasks, masDomains]);

  // Toggle domain accordion in timeline view
  const toggleDomain = (domainNumber: string) => {
    setExpandedDomains(prev => ({
      ...prev,
      [domainNumber]: !prev[domainNumber]
    }));
  };

  // Expand all / Collapse all
  const handleExpandAll = (expand: boolean) => {
    const updated: Record<string, boolean> = {};
    masDomains.forEach(d => {
      updated[d.domainNumber] = expand;
    });
    setExpandedDomains(updated);
  };

  // Toggle task status quick action
  const handleUpdateTaskStatus = (taskId: string, newStatus: MASRemediationTask['status']) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          progressPercentage: newStatus === 'COMPLETED' ? 100 : newStatus === 'UNDER_REVIEW' ? 90 : newStatus === 'IN_PROGRESS' ? 60 : 20
        };
      }
      return t;
    });
    saveTasks(updated);
  };

  // Create new remediation task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const dom = masDomains.find(d => d.domainNumber === newTaskDomain);
    const domainName = dom ? dom.name : `Domain ${newTaskDomain}`;

    const newTask: MASRemediationTask = {
      id: `MAS-TSK-${Date.now().toString().slice(-4)}`,
      domainNumber: newTaskDomain,
      domainName,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || 'Remediation task to address MAS TRM statutory compliance gap.',
      linkedRequirementCode: newTaskControl || `MAS-TRM-${newTaskDomain}.1`,
      priority: newTaskPriority,
      status: 'PLANNED',
      owner: newTaskOwner,
      department: newTaskDept,
      startDate: newTaskStart,
      dueDate: newTaskDue,
      auditPhase: newTaskPhase,
      evidenceRequired: newTaskEvidence || 'Documentary evidence and technical verification logs.',
      progressPercentage: 20
    };

    saveTasks([newTask, ...tasks]);
    setShowNewTaskModal(false);

    // Reset form
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskEvidence('');
  };

  // Update target audit date
  const handleSaveAuditDate = () => {
    if (editAuditDateValue) {
      updateMASProfile({
        nextScheduledTRMAuditDate: editAuditDateValue
      });
      setShowEditAuditDate(false);
    }
  };

  // Reset to initial master roadmap
  const handleResetToDefault = () => {
    if (safeConfirm('Reset all roadmap tasks to official MAS TRM 2026 master templates?')) {
      saveTasks(INITIAL_MAS_REMEDIATION_TASKS);
    }
  };

  // Helper to calculate timeline bar horizontal position and width
  const getTimelineBarStyles = (startDate: string, dueDate: string) => {
    // Range is Jan 2026 (index 0) to Dec 2026 (index 11)
    const getMonthFrac = (dateStr: string) => {
      const parts = dateStr.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-11
      const day = parseInt(parts[2], 10) || 1;
      
      if (year < 2026) return 0;
      if (year > 2026) return 12;
      return month + (day - 1) / 30;
    };

    const startFrac = Math.max(0, Math.min(12, getMonthFrac(startDate)));
    const dueFrac = Math.max(0, Math.min(12, getMonthFrac(dueDate)));
    const duration = Math.max(0.6, dueFrac - startFrac);

    const leftPercent = (startFrac / 12) * 100;
    const widthPercent = (duration / 12) * 100;

    return {
      left: `${leftPercent}%`,
      width: `${Math.min(100 - leftPercent, widthPercent)}%`
    };
  };

  // Today marker calculation (for current date in 2026)
  const todayMarkerPercent = useMemo(() => {
    const today = new Date();
    // Default to ~July/August for demonstration or current month
    const month = today.getMonth(); // 0-11
    const day = today.getDate();
    const frac = month + day / 30;
    return Math.max(5, Math.min(95, (frac / 12) * 100));
  }, []);

  // Audit milestone marker calculation
  const auditMarkerPercent = useMemo(() => {
    const parts = targetAuditDate.split('-');
    const month = (parseInt(parts[1], 10) || 11) - 1;
    const day = parseInt(parts[2], 10) || 15;
    const frac = month + day / 30;
    return Math.max(5, Math.min(98, (frac / 12) * 100));
  }, [targetAuditDate]);

  return (
    <div className="space-y-6">
      {/* 1. Audit Cycle Countdown & Strategic Readiness Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-rose-950/40 border border-slate-800 rounded-xl p-6 relative overflow-hidden shadow-lg">
        {/* Subtle accent glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                MAS TRM Compliance Roadmap
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                <CalendarCheck className="w-3 h-3" />
                Statutory Audit Cycle: Q4-2026
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono text-slate-300 bg-slate-800 border border-slate-700">
                14 Regulated Domains
              </span>
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span>Remediation Workstream & Statutory Audit Timelines</span>
            </h1>

            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Track project milestones, remediation task schedules, and evidence readiness across all 14 MAS TRM domains to guarantee full compliance before the scheduled statutory supervisory inspection.
            </p>
          </div>

          {/* Countdown Clock Widget */}
          <div className="flex items-center gap-4 bg-slate-950/80 border border-rose-900/50 p-4 rounded-xl shrink-0 shadow-inner">
            <div className="text-center pr-3 border-r border-slate-800">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-extrabold text-rose-400 font-mono tracking-tight">
                  {daysToAudit}
                </span>
                <span className="text-xs font-semibold text-slate-400 uppercase">Days</span>
              </div>
              <span className="text-[10px] text-slate-400 block font-medium">
                To Audit Fieldwork
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400 font-medium">Target Inspection:</span>
                <button
                  onClick={() => setShowEditAuditDate(true)}
                  className="font-semibold text-rose-300 hover:text-white flex items-center gap-1 underline underline-offset-2 decoration-rose-500/50 cursor-pointer"
                  title="Click to reschedule audit date"
                >
                  <span>{targetAuditDate}</span>
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400 font-medium">Readiness Score:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {metrics.weightedProgress}%
                </span>
              </div>

              <div className="w-36 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${metrics.weightedProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4 Statutory Audit Lifecycle Milestone Gates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          {/* Phase 1 */}
          <div className="p-3.5 bg-slate-950/60 rounded-lg border border-emerald-800/40 relative">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Phase 1 &bull; Q1-Q2
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                100% DONE
              </span>
            </div>
            <h4 className="text-xs font-semibold text-white">Gap Assessment & Policy Alignment</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">
              Baseline evaluated across 86 controls. TRMF & board charters formalized.
            </p>
          </div>

          {/* Phase 2 */}
          <div className="p-3.5 bg-slate-950/60 rounded-lg border border-amber-800/40 relative">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                Phase 2 &bull; Current (Q2-Q3)
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                ACTIVE
              </span>
            </div>
            <h4 className="text-xs font-semibold text-white">Controls Engineering & Hardening</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">
              EDR 100% rollout, FIDO2 MFA, HSM custody ceremonies, and DevSecOps gates.
            </p>
          </div>

          {/* Phase 3 */}
          <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800 relative">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Phase 3 &bull; Q3-Q4
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                SCHEDULED
              </span>
            </div>
            <h4 className="text-xs font-semibold text-white">Tabletop Drills & Red Teaming</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">
              1-Hour MAS notice simulation, unannounced DR failover drill & CREST VA/PT.
            </p>
          </div>

          {/* Phase 4 */}
          <div className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800 relative">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5" />
                Phase 4 &bull; Nov 2026
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                FINAL AUDIT
              </span>
            </div>
            <h4 className="text-xs font-semibold text-white">Independent Audit & MAS Submission</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">
              External auditor fieldwork, Board Risk Committee presentation & regulatory signoff.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Controls Toolbar & Filtering */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'timeline'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Gantt Timeline Roadmap
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            14-Domain Workstreams
          </button>
          <button
            onClick={() => setViewMode('tasks')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'tasks'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            Action Ledger ({tasks.length})
          </button>
        </div>

        {/* Right: Actions & Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Domain selector */}
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-rose-500 cursor-pointer"
          >
            <option value="ALL">All 14 Domains</option>
            {masDomains.map(d => (
              <option key={d.id} value={d.domainNumber}>
                {d.domainNumber} {d.name}
              </option>
            ))}
          </select>

          {/* Status selector */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-rose-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="PLANNED">Planned</option>
          </select>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks, controls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs w-44 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Add Remediation Task Button */}
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-rose-950"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </button>
        </div>
      </div>

      {/* 3. Main View Renderings */}

      {/* VIEW A: GANTT TIMELINE ROADMAP */}
      {viewMode === 'timeline' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 overflow-hidden">
          {/* Header with expand/collapse & legend */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rose-400" />
                Project Timeline & Audit Countdown Roadmap (2026)
              </h2>
              <span className="text-xs text-slate-400">
                Visual workstream duration bars mapped across calendar months up to the November 2026 MAS TRM statutory audit.
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Completed
                </span>
                <span className="flex items-center gap-1 text-[11px] text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> In Progress
                </span>
                <span className="flex items-center gap-1 text-[11px] text-sky-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> Under Review
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" /> Planned
                </span>
              </div>

              <div className="border-l border-slate-800 pl-3 flex items-center gap-1">
                <button
                  onClick={() => handleExpandAll(true)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300"
                >
                  Expand All
                </button>
                <button
                  onClick={() => handleExpandAll(false)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300"
                >
                  Collapse All
                </button>
              </div>
            </div>
          </div>

          {/* Timeline Gantt Grid Container */}
          <div className="overflow-x-auto">
            <div className="min-w-[920px] space-y-3">
              {/* Month Columns Header */}
              <div className="grid grid-cols-12 gap-1 border-b border-slate-800 pb-2 text-[11px] font-mono text-slate-400 text-center relative pl-72">
                {TIMELINE_MONTHS.map((m, idx) => (
                  <div
                    key={m.key}
                    className={`py-1 rounded ${
                      m.key === '2026-11' ? 'bg-rose-950/40 text-rose-300 font-bold border border-rose-900/60' : 'bg-slate-950/40'
                    }`}
                  >
                    <span>{m.label}</span>
                    <span className="text-[9px] text-slate-500 block">{m.q}</span>
                  </div>
                ))}

                {/* Audit date label tag */}
                <div
                  className="absolute -top-1 font-sans text-[10px] font-bold text-rose-400 bg-rose-950 border border-rose-800 px-1.5 py-0.5 rounded shadow z-20 pointer-events-none"
                  style={{ left: `calc(18rem + ${auditMarkerPercent}%)`, transform: 'translateX(-50%)' }}
                >
                  AUDIT DATE
                </div>
              </div>

              {/* Domain Rows */}
              <div className="space-y-3 relative">
                {/* Vertical Marker Lines for "Today" and "Audit Date" */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-sky-500/50 border-r border-sky-400/80 z-10 pointer-events-none"
                  style={{ left: `calc(18rem + ${todayMarkerPercent}%)` }}
                  title="Current Day"
                />
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-rose-500/70 border-r border-rose-500 z-10 pointer-events-none"
                  style={{ left: `calc(18rem + ${auditMarkerPercent}%)` }}
                  title="Target Audit Inspection Date"
                />

                {domainGroups
                  .filter(group => selectedDomain === 'ALL' || group.domainNumber === selectedDomain)
                  .map(group => {
                    const isExpanded = !!expandedDomains[group.domainNumber];
                    const isCritical = group.domain?.criticality === 'CRITICAL';

                    return (
                      <div
                        key={group.domainNumber}
                        className="border border-slate-800/80 rounded-lg bg-slate-950/40 overflow-hidden hover:border-slate-700 transition-colors"
                      >
                        {/* Domain Summary Bar */}
                        <div
                          onClick={() => toggleDomain(group.domainNumber)}
                          className="flex items-center justify-between p-2.5 bg-slate-900/90 cursor-pointer hover:bg-slate-900 transition-all select-none"
                        >
                          <div className="flex items-center gap-2.5 w-72 shrink-0">
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span className="font-mono text-xs font-bold text-rose-400 w-8">
                              {group.domainNumber}
                            </span>
                            <span className="text-xs font-semibold text-white truncate" title={group.domain?.name}>
                              {group.domain?.name || `Domain ${group.domainNumber}`}
                            </span>
                            {isCritical && (
                              <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 text-[9px] font-bold border border-rose-900 shrink-0">
                                CRITICAL
                              </span>
                            )}
                          </div>

                          {/* Domain Progress Overview */}
                          <div className="flex-1 flex items-center justify-between pl-4 pr-2">
                            <div className="flex items-center gap-3">
                              <span className="text-[11px] text-slate-400">
                                {group.tasks.length} {group.tasks.length === 1 ? 'task' : 'tasks'}
                              </span>
                              <span className="text-[11px] text-emerald-400 font-mono">
                                {group.completedCount} done
                              </span>
                            </div>

                            <div className="flex items-center gap-2 w-44">
                              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    group.progress >= 85
                                      ? 'bg-emerald-500'
                                      : group.progress >= 60
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${group.progress}%` }}
                                />
                              </div>
                              <span className="font-mono font-bold text-xs text-slate-200 w-8 text-right">
                                {group.progress}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Task Gantt Bars */}
                        {isExpanded && (
                          <div className="p-3 bg-slate-950/70 border-t border-slate-900 space-y-2.5">
                            {group.tasks.length === 0 ? (
                              <div className="text-xs text-slate-500 pl-6 py-1 italic flex items-center justify-between">
                                <span>No active remediation gaps logged in this domain. Domain controls compliant.</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setNewTaskDomain(group.domainNumber);
                                    setShowNewTaskModal(true);
                                  }}
                                  className="text-[11px] text-rose-400 hover:text-rose-300 font-medium underline cursor-pointer"
                                >
                                  + Add task
                                </button>
                              </div>
                            ) : (
                              group.tasks.map(task => {
                                const barStyles = getTimelineBarStyles(task.startDate, task.dueDate);
                                const isDone = task.status === 'COMPLETED';

                                return (
                                  <div
                                    key={task.id}
                                    className="flex items-center relative text-xs group py-1"
                                  >
                                    {/* Task Name & Owner Column (72 width) */}
                                    <div className="w-72 shrink-0 pr-4 flex items-start gap-2">
                                      <button
                                        onClick={() =>
                                          handleUpdateTaskStatus(
                                            task.id,
                                            isDone ? 'IN_PROGRESS' : 'COMPLETED'
                                          )
                                        }
                                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                          isDone
                                            ? 'bg-emerald-600 border-emerald-500 text-white'
                                            : 'border-slate-700 hover:border-slate-500'
                                        }`}
                                        title={isDone ? 'Mark Incomplete' : 'Mark Completed'}
                                      >
                                        {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                                      </button>

                                      <div className="overflow-hidden">
                                        <div className="flex items-center gap-1.5">
                                          <span
                                            className={`font-medium truncate ${
                                              isDone ? 'line-through text-slate-500' : 'text-slate-200'
                                            }`}
                                            title={task.title}
                                          >
                                            {task.title}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                          <span className="font-mono text-rose-400">{task.linkedRequirementCode}</span>
                                          <span>&bull;</span>
                                          <span>{task.owner.split(' ')[0]}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Gantt Timeline Bar Canvas (flex-1) */}
                                    <div className="flex-1 h-8 bg-slate-900/50 rounded-md relative flex items-center overflow-hidden border border-slate-900">
                                      <div
                                        className={`absolute h-6 rounded-md px-2 flex items-center justify-between text-[10px] font-medium shadow transition-all duration-300 ${
                                          task.status === 'COMPLETED'
                                            ? 'bg-emerald-600/30 border border-emerald-500/60 text-emerald-200'
                                            : task.status === 'UNDER_REVIEW'
                                            ? 'bg-sky-600/30 border border-sky-500/60 text-sky-200'
                                            : task.status === 'IN_PROGRESS'
                                            ? 'bg-amber-600/30 border border-amber-500/60 text-amber-200'
                                            : 'bg-slate-700/40 border border-slate-600/60 text-slate-300'
                                        }`}
                                        style={barStyles}
                                      >
                                        <span className="truncate pr-1 font-semibold">{task.startDate} &rarr; {task.dueDate}</span>
                                        <span className="font-mono text-[9px] font-bold">
                                          {task.progressPercentage}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW B: 14-DOMAIN WORKSTREAM CARDS */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {domainGroups
            .filter(group => selectedDomain === 'ALL' || group.domainNumber === selectedDomain)
            .map(group => {
              const isCritical = group.domain?.criticality === 'CRITICAL';

              return (
                <div
                  key={group.domainNumber}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-mono text-xs font-bold border border-rose-900">
                          {group.domainNumber}
                        </span>
                        {isCritical && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 text-[10px] font-bold border border-rose-800/60">
                            CRITICAL
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-base font-bold text-white">
                          {group.progress}%
                        </span>
                        <span className="text-[10px] text-slate-500 block">Readiness</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {group.domain?.name || `Domain ${group.domainNumber}`}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {group.domain?.objectivesSummary || group.domain?.description}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all ${
                          group.progress >= 85
                            ? 'bg-emerald-500'
                            : group.progress >= 60
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${group.progress}%` }}
                      />
                    </div>

                    {/* Remediation Tasks for this Domain */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                        Remediation Tasks ({group.tasks.length})
                      </span>

                      {group.tasks.length === 0 ? (
                        <div className="p-3 bg-slate-950/60 rounded-lg text-center text-slate-500 text-xs">
                          No outstanding remediation tasks.
                        </div>
                      ) : (
                        group.tasks.map(task => (
                          <div
                            key={task.id}
                            className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs space-y-1.5"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-medium text-slate-200 line-clamp-1">
                                {task.title}
                              </span>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-bold font-mono ${
                                  task.status === 'COMPLETED'
                                    ? 'bg-emerald-950 text-emerald-400'
                                    : task.status === 'IN_PROGRESS'
                                    ? 'bg-amber-950 text-amber-400'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {task.status.replace(/_/g, ' ')}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span>Due: {task.dueDate}</span>
                              <span className="font-mono text-rose-400">{task.linkedRequirementCode}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        setNewTaskDomain(group.domainNumber);
                        setShowNewTaskModal(true);
                      }}
                      className="text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Task
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDomain(group.domainNumber);
                        setViewMode('tasks');
                      }}
                      className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      View Details &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* VIEW C: DETAILED ACTION LEDGER */}
      {viewMode === 'tasks' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-rose-400" />
                MAS TRM Remediation Tasks & Evidence Tracker
              </h2>
              <span className="text-xs text-slate-400">
                Showing {filteredTasks.length} of {tasks.length} total tasks across domains
              </span>
            </div>

            <button
              onClick={handleResetToDefault}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Reset tasks to initial template defaults"
            >
              <RefreshCw className="w-3 h-3 text-slate-400" />
              Reset Roadmap Defaults
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3 w-10">Done</th>
                  <th className="p-3">Domain & Control</th>
                  <th className="p-3">Remediation Task Title</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Assignee / Owner</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Audit Phase</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-slate-500">
                      No remediation tasks match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map(task => {
                    const isDone = task.status === 'COMPLETED';

                    return (
                      <tr
                        key={task.id}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          isDone ? 'bg-slate-950/30 opacity-75' : ''
                        }`}
                      >
                        <td className="p-3">
                          <button
                            onClick={() =>
                              handleUpdateTaskStatus(
                                task.id,
                                isDone ? 'IN_PROGRESS' : 'COMPLETED'
                              )
                            }
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                              isDone
                                ? 'bg-emerald-600 border-emerald-500 text-white'
                                : 'border-slate-700 hover:border-slate-500'
                            }`}
                          >
                            {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 font-mono text-[10px] font-bold">
                              {task.domainNumber}
                            </span>
                            <span className="font-mono text-slate-400 text-[11px]">
                              {task.linkedRequirementCode}
                            </span>
                          </div>
                        </td>

                        <td className="p-3 max-w-xs">
                          <div className="font-semibold text-white truncate" title={task.title}>
                            {task.title}
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {task.description}
                          </p>
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              task.priority === 'CRITICAL'
                                ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                                : task.priority === 'HIGH'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <select
                            value={task.status}
                            onChange={(e) =>
                              handleUpdateTaskStatus(
                                task.id,
                                e.target.value as MASRemediationTask['status']
                              )
                            }
                            className={`rounded px-2 py-1 text-[11px] font-semibold border cursor-pointer focus:outline-none ${
                              task.status === 'COMPLETED'
                                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                : task.status === 'UNDER_REVIEW'
                                ? 'bg-sky-950 text-sky-400 border-sky-800'
                                : task.status === 'IN_PROGRESS'
                                ? 'bg-amber-950 text-amber-400 border-amber-800'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            <option value="PLANNED">Planned</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="UNDER_REVIEW">Under Review</option>
                            <option value="COMPLETED">Completed</option>
                          </select>
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <div className="font-medium text-slate-300">{task.owner}</div>
                          <div className="text-[10px] text-slate-500">{task.department}</div>
                        </td>

                        <td className="p-3 whitespace-nowrap font-mono text-slate-300">
                          {task.dueDate}
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium">
                            Phase {task.auditPhase}
                          </span>
                        </td>

                        <td className="p-3 whitespace-nowrap text-right">
                          <button
                            onClick={() => {
                              saveTasks(tasks.filter(t => t.id !== task.id));
                            }}
                            className="text-slate-500 hover:text-rose-400 text-xs px-2 py-1 transition-colors cursor-pointer"
                            title="Delete Task"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. MODAL: Create New Remediation Task */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-400" />
                Add MAS TRM Remediation Task
              </h3>
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Target MAS TRM Domain *
                </label>
                <select
                  value={newTaskDomain}
                  onChange={(e) => {
                    setNewTaskDomain(e.target.value);
                    setNewTaskControl(`MAS-TRM-${e.target.value}.1`);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                >
                  {masDomains.map(d => (
                    <option key={d.id} value={d.domainNumber}>
                      {d.domainNumber} {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement Automated Key Rotation in Cloud KMS"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Scope & Action Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe technical actions and engineering deliverables required to resolve gap..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Audit Phase Gate
                  </label>
                  <select
                    value={newTaskPhase}
                    onChange={(e) => setNewTaskPhase(parseInt(e.target.value, 10) as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value={1}>Phase 1: Gap Closure</option>
                    <option value={2}>Phase 2: Technical Controls</option>
                    <option value={3}>Phase 3: Tabletop & Mock</option>
                    <option value={4}>Phase 4: Audit Fieldwork</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Linked Control Code
                  </label>
                  <input
                    type="text"
                    value={newTaskControl}
                    onChange={(e) => setNewTaskControl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Task Owner / Lead
                  </label>
                  <input
                    type="text"
                    value={newTaskOwner}
                    onChange={(e) => setNewTaskOwner(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Responsible Department
                  </label>
                  <input
                    type="text"
                    value={newTaskDept}
                    onChange={(e) => setNewTaskDept(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newTaskStart}
                    onChange={(e) => setNewTaskStart(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Target Due Date
                  </label>
                  <input
                    type="date"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Required Verification Evidence
                </label>
                <input
                  type="text"
                  placeholder="e.g. Terraform HCL policy, AWS CloudTrail export, or penetration test sign-off"
                  value={newTaskEvidence}
                  onChange={(e) => setNewTaskEvidence(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer shadow-md shadow-rose-950"
                >
                  Save Task to Roadmap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: Reschedule Statutory Audit Date */}
      {showEditAuditDate && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-rose-400" />
                Reschedule Next MAS TRM Audit Inspection
              </h3>
              <button
                onClick={() => setShowEditAuditDate(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Adjusting this date recalibrates the live audit countdown clock, Phase 4 milestone gate, and roadmap compliance deadlines for all 14 MAS TRM domains.
              </p>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Next Scheduled TRM Audit Fieldwork Date
                </label>
                <input
                  type="date"
                  value={editAuditDateValue}
                  onChange={(e) => setEditAuditDateValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="p-3 bg-rose-950/30 border border-rose-900/50 rounded-lg text-rose-300 text-[11px]">
                <strong>Regulatory Compliance Note:</strong> MAS TRM Guidelines recommend independent assurance audits be conducted on an annual or bi-annual basis depending on critical information infrastructure (CII) designation.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowEditAuditDate(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAuditDate}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer"
              >
                Update Audit Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
